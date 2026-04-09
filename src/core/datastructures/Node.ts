export class MusicNode<T> {
  public value: T;
  public next: MusicNode<T> | null = null;
  public prev: MusicNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}
