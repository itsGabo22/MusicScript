import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { DoublyLinkedList } from '../core/datastructures/DoublyLinkedList';
import type { Song } from '../core/entities/Song';
import { PlaylistLoader } from '../infrastructure/loaders/PlaylistLoader';

export const useMusicPlayer = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  
  const playlist = useMemo(() => new DoublyLinkedList<Song>(), []);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const syncState = useCallback(() => {
    setSongs(playlist.toArray());
    setCurrentSong(playlist.getCurrent());
  }, [playlist]);

  const setQueue = (newSongs: Song[]) => {
    playlist.clear();
    newSongs.forEach(s => playlist.add(s));
    syncState();
  };

  const updateVolume = (val: number) => {
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
  };

  // Load from Library on initialization
  useEffect(() => {
    const initialize = async () => {
      const savedSongs = await PlaylistLoader.loadFromLibrary();
      playlist.clear();
      savedSongs.forEach(s => playlist.add(s));
      syncState();
    };
    initialize();
  }, [playlist, syncState]);

  const play = () => {
    audioRef.current?.play().catch(console.error);
    setIsPlaying(true);
  };

  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const togglePlay = () => isPlaying ? pause() : play();

  const next = () => {
    const song = playlist.next();
    if (song) {
      setCurrentSong(song);
      if (isPlaying) setTimeout(() => play(), 50);
    }
  };

  const prev = () => {
    const song = playlist.prev();
    if (song) {
      setCurrentSong(song);
      if (isPlaying) setTimeout(() => play(), 50);
    }
  };

  const addTrack = async (song: Song, position: 'start' | 'end' | number = 'end') => {
    if (position === 'start') {
      playlist.addAtStart(song);
    } else if (typeof position === 'number') {
      playlist.addAt(song, position);
    } else {
      playlist.add(song);
    }
    syncState();
  };

  const removeTrack = (id: string) => {
    playlist.remove(id);
    syncState();
  };

  const selectTrack = (id: string) => {
    const song = playlist.setCurrentById(id);
    if (song) {
      setCurrentSong(song);
      if (isPlaying) setTimeout(() => play(), 50);
    }
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
    volume,
    audioRef,
    togglePlay,
    next,
    prev,
    addTrack,
    removeTrack,
    setQueue,
    selectTrack,
    seek,
    updateVolume,
    handlers: {
      onTimeUpdate: () => audioRef.current && setCurrentTime(audioRef.current.currentTime),
      onLoadedMetadata: () => audioRef.current && setDuration(audioRef.current.duration),
      onEnded: () => next()
    }
  };
};
