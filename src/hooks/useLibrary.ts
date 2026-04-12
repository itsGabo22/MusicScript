import { useState, useEffect, useCallback } from 'react';
import type { Song } from '../core/entities/Song';
import { libraryRepo } from '../infrastructure/persistence/LibraryRepository';
import { PlaylistLoader } from '../infrastructure/loaders/PlaylistLoader';

export const useLibrary = () => {
  const [librarySongs, setLibrarySongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshLibrary = useCallback(async () => {
    setIsLoading(true);
    const songs = await PlaylistLoader.loadFromLibrary();
    setLibrarySongs(songs);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);

  const addToLibrary = async (file: File, metadata: { title: string, artist: string, coverUrl?: string | null }) => {
    const song = await PlaylistLoader.fromFile(file, metadata);
    await libraryRepo.saveTrack(song, file);
    await refreshLibrary();
    return song;
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
    // Note: No need to refresh entire library here as we updated it optimistically
  };

  const clearLibrary = async () => {
    await libraryRepo.clearAll();
    await refreshLibrary();
  };

  const getFavorites = () => {
    return librarySongs.filter(s => s.isFavorite);
  };

  return {
    librarySongs,
    isLoading,
    addToLibrary,
    removeFromLibrary,
    toggleFavorite,
    clearLibrary,
    refreshLibrary,
    getFavorites
  };
};
