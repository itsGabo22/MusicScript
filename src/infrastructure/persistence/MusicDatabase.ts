import Dexie, { type Table } from 'dexie';
import type { Song } from '../../core/entities/Song';

export interface TrackRecord extends Song {
  audioBlob: Blob;
  addedAt: number;
  isFavorite: boolean;
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
    this.version(2).stores({
      tracks: 'id, title, artist, addedAt, isFavorite',
      playlists: 'id, name, createdAt'
    });
  }
}

export const db = new MusicDatabase();
