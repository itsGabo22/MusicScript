import { MusicNode } from "./Node";

export class DoublyLinkedList<T extends { id: string }> {
  private head: MusicNode<T> | null = null;
  private tail: MusicNode<T> | null = null;
  private current: MusicNode<T> | null = null;
  private size: number = 0;

  constructor() {}

  // Get current node value
  public getCurrent(): T | null {
    return this.current ? this.current.value : null;
  }

  // Add to the end (Default)
  public add(value: T): void {
    const newNode = new MusicNode(value);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
      this.current = newNode;
    } else {
      if (this.tail) {
        this.tail.next = newNode;
        newNode.prev = this.tail;
        this.tail = newNode;
      }
    }
    this.size++;
  }

  // Add at the beginning
  public addAtStart(value: T): void {
    const newNode = new MusicNode(value);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
      this.current = newNode;
    } else {
      newNode.next = this.head;
      this.head.prev = newNode;
      this.head = newNode;
    }
    this.size++;
  }

  // Add at a specific position (0-indexed)
  public addAt(value: T, index: number): void {
    if (index <= 0) {
      this.addAtStart(value);
      return;
    }
    if (index >= this.size) {
      this.add(value);
      return;
    }

    const newNode = new MusicNode(value);
    let temp = this.head;
    for (let i = 0; i < index; i++) {
      temp = temp!.next;
    }

    // Insert before temp
    newNode.next = temp;
    newNode.prev = temp!.prev;
    if (temp!.prev) {
      temp!.prev.next = newNode;
    }
    temp!.prev = newNode;
    
    this.size++;
  }

  // Remove by ID
  public remove(id: string): boolean {
    if (!this.head) return false;

    let temp: MusicNode<T> | null = this.head;
    while (temp) {
      if (temp.value.id === id) {
        // If we are removing the current playing song, move current
        if (this.current === temp) {
          this.current = temp.next || temp.prev;
        }

        if (temp.prev) {
          temp.prev.next = temp.next;
        } else {
          this.head = temp.next;
        }

        if (temp.next) {
          temp.next.prev = temp.prev;
        } else {
          this.tail = temp.prev;
        }

        this.size--;
        return true;
      }
      temp = temp.next;
    }
    return false;
  }

  // UPDATE METADATA SURGICALLY
  public updateValue(id: string, newValue: Partial<T>): boolean {
    let temp = this.head;
    while (temp) {
      if (temp.value.id === id) {
        temp.value = { ...temp.value, ...newValue };
        return true;
      }
      temp = temp.next;
    }
    return false;
  }

  // Move forward
  public next(): T | null {
    if (this.current && this.current.next) {
      this.current = this.current.next;
      return this.current.value;
    }
    return null;
  }

  // Move backward
  public prev(): T | null {
    if (this.current && this.current.prev) {
      this.current = this.current.prev;
      return this.current.value;
    }
    return null;
  }

  // Set current by ID (for selecting from a list)
  public setCurrentById(id: string): T | null {
    let temp = this.head;
    while (temp) {
      if (temp.value.id === id) {
        this.current = temp;
        return temp.value;
      }
      temp = temp.next;
    }
    return null;
  }

  public toArray(): T[] {
    const result: T[] = [];
    let temp = this.head;
    while (temp) {
      result.push(temp.value);
      temp = temp.next;
    }
    return result;
  }

  public getSize(): number {
    return this.size;
  }

  public clear(): void {
    this.head = null;
    this.tail = null;
    this.current = null;
    this.size = 0;
  }
}
