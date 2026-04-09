import { useState, useEffect, useRef, useMemo } from 'react';
import { DoublyLinkedList } from '../core/datastructures/DoublyLinkedList';
import type { Song } from '../core/entities/Song';
import { PlaylistLoader } from '../infrastructure/loaders/PlaylistLoader';

export const useMusicPlayer = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Use a ref to persist the DLL instance without causing re-renders unless we want to
  const playlist = useMemo(() => new DoublyLinkedList<Song>(), []);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize
  useEffect(() => {
    const loadData = async () => {
      const defaultSongs = await PlaylistLoader.loadDefault();
      playlist.clear(); // Important: Avoid duplicates if useEffect runs twice
      defaultSongs.forEach(song => playlist.add(song));
      syncState();
    };
    loadData();
    
    // Cleanup URL objects if needed
    return () => {
      songs.forEach(s => {
        if (s.source === 'local') URL.revokeObjectURL(s.audioUrl);
      });
    };
  }, []);

  // Sync internal DLL state with React state for UI
  const syncState = () => {
    setSongs(playlist.toArray());
    setCurrentSong(playlist.getCurrent());
  };

  const play = () => {
    audioRef.current?.play();
    setIsPlaying(true);
  };

  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) pause();
    else play();
  };

  const next = () => {
    const song = playlist.next();
    if (song) {
      setCurrentSong(song);
      if (isPlaying) setTimeout(() => play(), 0);
    }
  };

  const prev = () => {
    const song = playlist.prev();
    if (song) {
      setCurrentSong(song);
      if (isPlaying) setTimeout(() => play(), 0);
    }
  };

  const addSongs = async (files: FileList) => {
    const newSongs = await PlaylistLoader.fromFiles(files);
    newSongs.forEach(s => playlist.add(s));
    syncState();
  };

  const removeSong = (id: string) => {
    playlist.remove(id);
    syncState();
  };

  const selectSong = (id: string) => {
    const song = playlist.setCurrentById(id);
    if (song) {
      setCurrentSong(song);
      if (isPlaying) setTimeout(() => play(), 0);
    }
  };

  // Audio event handlers
  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const onEnded = () => {
    next();
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return {
    songs,
    currentSong,
    isPlaying,
    currentTime,
    duration,
    audioRef,
    togglePlay,
    next,
    prev,
    addSongs,
    removeSong,
    selectSong,
    seek,
    handlers: {
      onTimeUpdate,
      onLoadedMetadata,
      onEnded
    }
  };
};
