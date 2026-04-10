import type { Song } from "../../core/entities/Song";
import { libraryRepo } from "../persistence/LibraryRepository";
// @ts-ignore - jsmediatags doesn't always have perfect types in some environments
import jsmediatags from 'jsmediatags';

export class PlaylistLoader {
  static async loadFromLibrary(): Promise<Song[]> {
    const records = await libraryRepo.getAllTracks();
    return records.map(r => ({
      ...r,
      audioUrl: URL.createObjectURL(r.audioBlob)
    }));
  }

  static async saveToLibrary(song: Song, file: File): Promise<void> {
    await libraryRepo.saveTrack(song, file);
  }

  static async fromFile(file: File, manualMetadata: { title: string, artist: string }): Promise<Song> {
    const tags = await this.extractTags(file);
    
    return {
      id: crypto.randomUUID(),
      title: manualMetadata.title || tags.title || file.name.replace(/\.[^/.]+$/, ""),
      artist: manualMetadata.artist || tags.artist || "Unknown Artist",
      duration: 0,
      audioUrl: URL.createObjectURL(file),
      source: 'local',
      coverUrl: tags.coverUrl || `https://picsum.photos/seed/${Math.random()}/400/400`
    };
  }

  private static extractTags(file: File): Promise<{ title?: string, artist?: string, coverUrl?: string }> {
    return new Promise((resolve) => {
      new jsmediatags.Reader(file).read({
        onSuccess: (tag: any) => {
          const { title, artist, picture } = tag.tags;
          let coverUrl;

          if (picture) {
            const { data, format } = picture;
            const base64String = data.map((b: number) => String.fromCharCode(b)).join("");
            coverUrl = `data:${format};base64,${window.btoa(base64String)}`;
          }

          resolve({ title, artist, coverUrl });
        },
        onError: () => resolve({})
      });
    });
  }
}
