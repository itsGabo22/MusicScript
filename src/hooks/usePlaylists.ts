import { useState, useEffect, useCallback } from 'react';
import { playlistRepo } from '../infrastructure/persistence/PlaylistRepository';
import type { PlaylistRecord } from '../infrastructure/persistence/MusicDatabase';

export const usePlaylists = () => {
  const [playlists, setPlaylists] = useState<PlaylistRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshPlaylists = useCallback(async () => {
    setIsLoading(true);
    const data = await playlistRepo.getAllPlaylists();
    setPlaylists(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshPlaylists();
  }, [refreshPlaylists]);

  const createPlaylist = async (name: string) => {
    await playlistRepo.createPlaylist(name);
    await refreshPlaylists();
  };

  const addTrackToPlaylist = async (playlistId: string, trackId: string) => {
    await playlistRepo.addTrackToPlaylist(playlistId, trackId);
    await refreshPlaylists();
  };

  const removeTrackFromPlaylist = async (playlistId: string, trackId: string) => {
    await playlistRepo.removeTrackFromPlaylist(playlistId, trackId);
    await refreshPlaylists();
  };

  const deletePlaylist = async (id: string) => {
    await playlistRepo.deletePlaylist(id);
    await refreshPlaylists();
  };

  return {
    playlists,
    isLoading,
    createPlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    deletePlaylist,
    refreshPlaylists
  };
};
