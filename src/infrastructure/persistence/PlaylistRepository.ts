import { db, type PlaylistRecord } from './MusicDatabase';

export class PlaylistRepository {
  async getAllPlaylists(): Promise<PlaylistRecord[]> {
    return await db.playlists.orderBy('createdAt').toArray();
  }

  async createPlaylist(name: string): Promise<void> {
    const newPlaylist: PlaylistRecord = {
      id: crypto.randomUUID(),
      name,
      songIds: [],
      createdAt: Date.now()
    };
    await db.playlists.add(newPlaylist);
  }

  async addTrackToPlaylist(playlistId: string, trackId: string): Promise<void> {
    const playlist = await db.playlists.get(playlistId);
    if (playlist && !playlist.songIds.includes(trackId)) {
      playlist.songIds.push(trackId);
      await db.playlists.update(playlistId, { songIds: playlist.songIds });
    }
  }

  async removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void> {
    const playlist = await db.playlists.get(playlistId);
    if (playlist) {
      const newSongIds = playlist.songIds.filter(id => id !== trackId);
      await db.playlists.update(playlistId, { songIds: newSongIds });
    }
  }

  async deletePlaylist(id: string): Promise<void> {
    await db.playlists.delete(id);
  }
}

export const playlistRepo = new PlaylistRepository();
