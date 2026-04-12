import { useState, useEffect, useCallback } from 'react';
import type { Song } from '../core/entities/Song';
import { libraryRepo } from '../infrastructure/persistence/LibraryRepository';
import { PlaylistLoader } from '../infrastructure/loaders/PlaylistLoader';

export const useLibrary = () => {
  const [librarySongs, setLibrarySongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshLibrary = useCallback(async () => {
    setIsLoading(true);
    const songs = await libraryRepo.getAllTracks();
    setLibrarySongs(songs);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);

  const addToLibrary = async (file: File, metadata: { title: string, artist: string, coverUrl?: string | null, position: 'start' | 'end' | number }) => {
    const song = await PlaylistLoader.fromFile(file, metadata);
    // Position handling is now deep-integrated in the repo
    await libraryRepo.saveTrack(song, file, metadata.position);
    await refreshLibrary();
    return song;
  };

  const updateTrack = async (id: string, metadata: Partial<Song>, position?: 'start' | 'end' | number) => {
    await libraryRepo.updateTrackMetadata(id, metadata, position);
    await refreshLibrary();
  };

  const removeFromLibrary = async (id: string) => {
    await libraryRepo.deleteTrack(id);
    await refreshLibrary();
  };

  const toggleFavorite = async (id: string) => {
    // Optimistic update
    setLibrarySongs(prev => prev.map(s => 
      s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
    ));
    // Sync with DB
    await libraryRepo.toggleFavorite(id);
  };

  const clearLibrary = async () => {
    await libraryRepo.clearAll();
    await refreshLibrary();
  };

  return {
    librarySongs,
    isLoading,
    addToLibrary,
    updateTrack,
    removeFromLibrary,
    toggleFavorite,
    clearLibrary,
    refreshLibrary,
    getFavorites: () => librarySongs.filter(s => s.isFavorite)
  };
};
