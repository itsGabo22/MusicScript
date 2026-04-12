export interface IAudioEffect {
  connect(destination: AudioNode | AudioParam): void;
  getNode(): AudioNode;
}

export class BaseAudioSource implements IAudioEffect {
  constructor(private source: AudioNode) {}
  connect(destination: AudioNode | AudioParam) {
    this.source.connect(destination as any);
  }
  getNode() { return this.source; }
}

export class EqualizerDecorator implements IAudioEffect {
  private filters: BiquadFilterNode[] = [];
  
  constructor(private component: IAudioEffect, private context: AudioContext) {
    // 5-band EQ: 60Hz, 230Hz, 910Hz, 3.6KHz, 14KHz
    const frequencies = [60, 230, 910, 3600, 14000];
    this.filters = frequencies.map((freq, index) => {
      const filter = this.context.createBiquadFilter();
      if (index === 0) filter.type = 'lowshelf';
      else if (index === frequencies.length - 1) filter.type = 'highshelf';
      else filter.type = 'peaking';
      
      filter.frequency.value = freq;
      filter.gain.value = 0;
      return filter;
    });

    // Serie connection internally
    for (let i = 0; i < this.filters.length - 1; i++) {
      this.filters[i].connect(this.filters[i + 1]);
    }
  }

  connect(destination: AudioNode | AudioParam) {
    this.component.connect(this.filters[0]);
    this.filters[this.filters.length - 1].connect(destination as any);
  }

  getNode() {
    return this.filters[0];
  }

  setGains(gains: number[]) {
    gains.forEach((gain, i) => {
      if (this.filters[i]) {
        // Smooth transition
        this.filters[i].gain.setTargetAtTime(gain, this.context.currentTime, 0.1);
      }
    });
  }

  getGains(): number[] {
    return this.filters.map(f => f.gain.value);
  }
}

export class AudioAnalyzerService {
  private audioContext: AudioContext | null = null;
  private analyzer: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private equalizer: EqualizerDecorator | null = null;

  public init(audioElement: HTMLAudioElement): void {
    if (this.audioContext) return;

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyzer = this.audioContext.createAnalyser();
    this.analyzer.fftSize = 256;
    
    this.source = this.audioContext.createMediaElementSource(audioElement);
    
    // Core Decorator Pattern implementation
    const baseSource = new BaseAudioSource(this.source);
    this.equalizer = new EqualizerDecorator(baseSource, this.audioContext);

    // Audio routing: Source -> Equalizer -> Analyzer -> Destination
    this.equalizer.connect(this.analyzer);
    this.analyzer.connect(this.audioContext.destination);

    const bufferLength = this.analyzer.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyzer || !this.dataArray) return new Uint8Array(0);
    this.analyzer.getByteFrequencyData(this.dataArray as any);
    return this.dataArray;
  }

  public resume(): void {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Equalizer API
  public setEqualizerGains(gains: number[]): void {
    if (this.equalizer) {
      this.equalizer.setGains(gains);
    }
  }

  public getEqualizerGains(): number[] {
    if (this.equalizer) {
      return this.equalizer.getGains();
    }
    return [0, 0, 0, 0, 0];
  }
}

export const audioAnalyzer = new AudioAnalyzerService();
