import { db, type TrackRecord } from './MusicDatabase';
import type { Song } from '../../core/entities/Song';

export class LibraryRepository {
  async getAllTracks(): Promise<TrackRecord[]> {
    // Order by sortOrder ASC to respect manual positioning
    return await db.tracks.orderBy('sortOrder').toArray();
  }

  async saveTrack(song: Song, blob: Blob, position: 'start' | 'end' | number = 'end'): Promise<void> {
    const all = await this.getAllTracks();
    let newOrder = 0;

    if (position === 'start') {
      newOrder = all.length > 0 ? all[0].sortOrder - 1000 : 0;
    } else if (position === 'end') {
      newOrder = all.length > 0 ? all[all.length - 1].sortOrder + 1000 : 0;
    } else {
      // Insert at specific index logic
      if (all.length === 0) {
        newOrder = 0;
      } else if (position <= 0) {
        newOrder = all[0].sortOrder - 1000;
      } else if (position >= all.length) {
        newOrder = all[all.length - 1].sortOrder + 1000;
      } else {
        // Middle insertion: average of surrounding sortOrders
        newOrder = (all[position - 1].sortOrder + all[position].sortOrder) / 2;
      }
    }

    const record: TrackRecord = {
      ...song,
      audioBlob: blob,
      addedAt: Date.now(),
      isFavorite: false,
      sortOrder: newOrder
    };
    await db.tracks.put(record);
    
    // Normalize if gaps get too small (security measure)
    if (all.length > 100) await this.normalizeSortOrders();
  }

  async updateTrackMetadata(id: string, metadata: Partial<Song>, newPosition?: 'start' | 'end' | number): Promise<void> {
    const track = await db.tracks.get(id);
    if (!track) return;

    if (newPosition !== undefined) {
      // Remove temporarily to re-calculate position
      await db.tracks.delete(id);
      const blob = track.audioBlob;
      const updatedSong = { ...track, ...metadata };
      await this.saveTrack(updatedSong as Song, blob, newPosition);
    } else {
      await db.tracks.update(id, metadata);
    }
  }

  private async normalizeSortOrders(): Promise<void> {
    const all = await db.tracks.orderBy('sortOrder').toArray();
    const batch = all.map((t, i) => ({
      key: t.id,
      changes: { sortOrder: i * 1000 }
    }));
    
    for (const item of batch) {
      await db.tracks.update(item.key, item.changes);
    }
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
