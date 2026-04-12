// @ts-ignore
import lamejs from 'lamejs';

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
   * Encodes an AudioBuffer into an MP3 Blob using lamejs.
   */
  public static encodeToMp3(buffer: AudioBuffer): Blob {
    const channels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const kbps = 128;
    const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);
    const mp3Data: Int8Array[] = [];

    const left = buffer.getChannelData(0);
    const right = channels > 1 ? buffer.getChannelData(1) : left;

    const sampleBlockSize = 1152;
    
    // convert float32 to int16
    const leftInt16 = new Int16Array(left.length);
    const rightInt16 = new Int16Array(right.length);
    
    for (let i = 0; i < left.length; i++) {
        let l = Math.max(-1, Math.min(1, left[i]));
        leftInt16[i] = l < 0 ? l * 0x8000 : l * 0x7FFF;
        
        let r = Math.max(-1, Math.min(1, right[i]));
        rightInt16[i] = r < 0 ? r * 0x8000 : r * 0x7FFF;
    }

    for (let i = 0; i < leftInt16.length; i += sampleBlockSize) {
      const leftChunk = leftInt16.subarray(i, i + sampleBlockSize);
      const rightChunk = rightInt16.subarray(i, i + sampleBlockSize);
      
      const mp3buf = channels > 1 ? 
          mp3encoder.encodeBuffer(leftChunk, rightChunk) : 
          mp3encoder.encodeBuffer(leftChunk);
          
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }

    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
    
    return new Blob(mp3Data as any, { type: 'audio/mp3' });
  }
}
