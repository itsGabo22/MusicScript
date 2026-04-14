// @ts-ignore
import * as lamejs from 'lamejs';

export class AudioEditorService {
  private static audioContext: AudioContext;

  private static getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  /**
   * Decodes a Blob into an AudioBuffer.
   */
  public static async decodeAudio(blob: Blob): Promise<AudioBuffer> {
    const context = this.getContext();
    const arrayBuffer = await blob.arrayBuffer();
    return await context.decodeAudioData(arrayBuffer);
  }

  /**
   * Trims an AudioBuffer from startTime to endTime (in seconds) and returns a new AudioBuffer.
   */
  public static trimAudio(buffer: AudioBuffer, startTime: number, endTime: number): AudioBuffer {
    const context = this.getContext();
    const rate = buffer.sampleRate;
    
    // Bounds checking
    const safeStart = Math.max(0, startTime);
    const safeEnd = Math.min(buffer.duration, endTime);
    if (safeStart >= safeEnd) throw new Error("Start time must be less than end time.");
    
    const startOffset = Math.floor(rate * safeStart);
    const endOffset = Math.floor(rate * safeEnd);
    const frameCount = endOffset - startOffset;
    
    // Create new buffer
    const newBuffer = context.createBuffer(buffer.numberOfChannels, frameCount, rate);
    
    // Copy channel data
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      const newChannelData = new Float32Array(frameCount);
      
      for (let i = 0; i < frameCount; i++) {
        newChannelData[i] = channelData[startOffset + i];
      }
      newBuffer.copyToChannel(newChannelData, channel);
    }
    
    return newBuffer;
  }

  /**
   * Encodes an AudioBuffer into a WAV Blob.
   * Native JS WAV encoding (PCM 16-bit).
   */
  public static encodeToWav(buffer: AudioBuffer): Blob {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2; // 16-bit PCM = 2 bytes per sample
    const bufferArray = new ArrayBuffer(44 + length);
    const view = new DataView(bufferArray);

    let offset = 0;
    const writeString = (str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
      offset += str.length;
    };

    // --- RIFF identifier ---
    writeString('RIFF');
    view.setUint32(offset, 36 + length, true); offset += 4;
    writeString('WAVE');

    // --- Format chunk ---
    writeString('fmt ');
    view.setUint32(offset, 16, true); offset += 4; // chunk length
    view.setUint16(offset, 1, true); offset += 2; // sample format (PCM)
    view.setUint16(offset, numOfChan, true); offset += 2;
    view.setUint32(offset, buffer.sampleRate, true); offset += 4;
    view.setUint32(offset, buffer.sampleRate * 2 * numOfChan, true); offset += 4; // byte rate
    view.setUint16(offset, numOfChan * 2, true); offset += 2; // block align
    view.setUint16(offset, 16, true); offset += 2; // bits per sample

    // --- Data chunk ---
    writeString('data');
    view.setUint32(offset, length, true); offset += 4;

    // --- Interleave channels & convert to 16-bit ---
    const channels = [];
    for (let i = 0; i < numOfChan; i++) {
      channels.push(buffer.getChannelData(i));
    }

    let p = offset;
    for (let i = 0; i < buffer.length; i++) {
      for (let chan = 0; chan < numOfChan; chan++) {
        // clamp to [-1, 1]
        let sample = Math.max(-1, Math.min(1, channels[chan][i]));
        // convert to 16-bit signed integer
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(p, sample, true);
        p += 2;
      }
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  /**
   * Resamples an AudioBuffer to a target sample rate.
   */
  public static async resampleBuffer(buffer: AudioBuffer, targetRate: number): Promise<AudioBuffer> {
    if (buffer.sampleRate === targetRate) return buffer;
    
    const offlineCtx = new OfflineAudioContext(
      buffer.numberOfChannels, 
      Math.ceil(buffer.duration * targetRate), 
      targetRate
    );
    
    const source = offlineCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(offlineCtx.destination);
    source.start(0);
    
    return await offlineCtx.startRendering();
  }

  /**
   * Encodes an AudioBuffer into an MP3 Blob using lamejs.
   */
  public static async encodeToMp3(buffer: AudioBuffer): Promise<Blob> {
    // MP3 standard is 44100
    const targetBuffer = await this.resampleBuffer(buffer, 44100);
    
    const channels = targetBuffer.numberOfChannels;
    const sampleRate = targetBuffer.sampleRate;
    const kbps = 128;
    
    // lamejs fix: Exhaustive shim of internal classes needed for the encoding process
    if (typeof window !== 'undefined') {
      const g = window as any;
      const l = lamejs as any;
      
      // MPEGMode shim
      if (!g.MPEGMode) {
        g.MPEGMode = l.MPEGMode || {
          STEREO: { ordinal: 0 },
          JOINT_STEREO: { ordinal: 1 },
          DUAL_CHANNEL: { ordinal: 2 },
          MONO: { ordinal: 3 },
          NOT_SET: { ordinal: 4 }
        };
      }
      
      // Essential classes often used internally by Mp3Encoder
      g.Lame = l.Lame || g.Lame || {};
      g.Presets = l.Presets || g.Presets || {};
      g.BitStream = l.BitStream || g.BitStream || function() {};
      g.VbrMode = l.VbrMode || g.VbrMode;
      g.Quantize = l.Quantize || g.Quantize;
      g.LameEncoder = l.LameEncoder || g.LameEncoder;
      g.Arrays = l.Arrays || g.Arrays;
      g.System = l.System || g.System;
      g.Util = l.Util || g.Util;
      g.Float = l.Float || g.Float || { MAX_VALUE: 3.4028235e+38 };

      // BitStream.EQ is a critical internal comparator
      if (g.BitStream && !g.BitStream.EQ) {
        g.BitStream.EQ = (a: any, b: any) => a == b;
      }
    }

    // @ts-ignore
    const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);
    const mp3Data: any[] = []; // Changed to any[] for robustness

    const left = targetBuffer.getChannelData(0);
    const right = channels > 1 ? targetBuffer.getChannelData(1) : left;

    const sampleBlockSize = 1152;
    
    // convert float32 to int16 with better clamping
    const leftInt16 = new Int16Array(left.length);
    const rightInt16 = new Int16Array(right.length);
    
    for (let i = 0; i < left.length; i++) {
        let l = Math.max(-1, Math.min(1, left[i]));
        leftInt16[i] = l < 0 ? l * 0x8000 : l * 0x7FFF;
        
        let r = Math.max(-1, Math.min(1, right[i]));
        rightInt16[i] = r < 0 ? r * 0x8000 : r * 0x7FFF;
    }

    // CHUNKED ASYNC ENCODING: Avoid hanging the UI
    for (let i = 0; i < leftInt16.length; i += sampleBlockSize) {
      const leftChunk = leftInt16.subarray(i, i + sampleBlockSize);
      const rightChunk = rightInt16.subarray(i, i + sampleBlockSize);
      
      const mp3buf = channels > 1 ? 
          mp3encoder.encodeBuffer(leftChunk, rightChunk) : 
          mp3encoder.encodeBuffer(leftChunk);
          
      if (mp3buf && mp3buf.length > 0) {
        // Use the original Int8Array from lamejs directly for byte-integrity
        mp3Data.push(mp3buf);
      }

      // Yield every ~115,000 samples to keep UI alive
      if (i % (sampleBlockSize * 100) === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    const mp3buf = mp3encoder.flush();
    if (mp3buf && mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
    
    // Create Blob from raw chunks (Blob handles typed arrays correctly)
    return new Blob(mp3Data, { type: 'audio/mpeg' });
  }
}
