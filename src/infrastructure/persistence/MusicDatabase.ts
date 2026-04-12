import Dexie, { type Table } from 'dexie';
import type { Song } from '../../core/entities/Song';

export interface TrackRecord extends Song {
  audioBlob: Blob;
  addedAt: number;
  isFavorite: boolean;
  sortOrder: number; // NEW: Persistent manual ordering field
}

export interface PlaylistRecord {
  id: string;
  name: string;
  songIds: string[];
  createdAt: number;
}

export class MusicDatabase extends Dexie {
  tracks!: Table<TrackRecord>;
  playlists!: Table<PlaylistRecord>;

  constructor() {
    super('MusicScriptDB');
    
    // Version 3 was problematic due to interrupted sync. 
    // We bump to Version 4 to FORCE a data migration for all users.
    this.version(4).stores({
      tracks: 'id, title, artist, addedAt, isFavorite, sortOrder',
      playlists: 'id, name, createdAt'
    }).upgrade(async (trans) => {
      // MIGRATION: Ensure EVERY track has a sortOrder.
      // This is critical because orderBy('sortOrder') hides records without the key.
      return await trans.table('tracks').toCollection().modify((track: any) => {
        if (track.sortOrder === undefined || track.sortOrder === null) {
          // Use addedAt if available, otherwise fallback to current timestamp
          track.sortOrder = track.addedAt || Date.now();
        }
      });
    });
  }
}

export const db = new MusicDatabase();
