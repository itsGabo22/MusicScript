import { db, type TrackRecord } from './MusicDatabase';
import type { Song } from '../../core/entities/Song';

export class LibraryRepository {
  async getAllTracks(): Promise<TrackRecord[]> {
    return await db.tracks.orderBy('addedAt').toArray();
  }

  async saveTrack(song: Song, blob: Blob): Promise<void> {
    const record: TrackRecord = {
      ...song,
      audioBlob: blob,
      addedAt: Date.now(),
      isFavorite: false
    };
    await db.tracks.put(record);
  }

  async deleteTrack(id: string): Promise<void> {
    await db.tracks.delete(id);
  }

  async toggleFavorite(id: string): Promise<void> {
    const track = await db.tracks.get(id);
    if (track) {
      await db.tracks.update(id, { isFavorite: !track.isFavorite });
    }
  }

  async clearAll(): Promise<void> {
    await db.tracks.clear();
  }
}

export const libraryRepo = new LibraryRepository();
