export class AudioAnalyzerService {
  private audioContext: AudioContext | null = null;
  private analyzer: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private source: MediaElementAudioSourceNode | null = null;

  public init(audioElement: HTMLAudioElement): void {
    if (this.audioContext) return; // Already initialized

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyzer = this.audioContext.createAnalyser();
    this.analyzer.fftSize = 256;
    
    this.source = this.audioContext.createMediaElementSource(audioElement);
    this.source.connect(this.analyzer);
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
}

export const audioAnalyzer = new AudioAnalyzerService();
