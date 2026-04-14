import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { DoublyLinkedList } from '../core/datastructures/DoublyLinkedList';
import type { Song } from '../core/entities/Song';
import { PlaylistLoader } from '../infrastructure/loaders/PlaylistLoader';
import { audioAnalyzer } from '../infrastructure/services/AudioAnalyzerService';

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
    const wasPlaying = isPlaying;
    const currentTrackId = currentSong?.id;
    
    // 1. Update the underlying DLL
    playlist.clear();
    newSongs.forEach(s => playlist.add(s));
    
    // 2. Try to re-sync the current pointer in the NEW list
    if (currentTrackId) {
       const found = playlist.setCurrentById(currentTrackId);
       
       // If the playing song is NOT in the new list, we don't clear it.
       // We keep it as the 'Active' song, but the DLL internal pointer is now null or first.
       // The UI will still show the current song but 'Next' will trigger the next logic from the new list.
       if (!found) {
         // Current song exists as a 'loose' track not in the current active view
         // This is fine, we just update the 'songs' state for the list view
         setSongs(newSongs);
       } else {
         syncState();
       }
    } else {
      syncState();
    }
    
    // 3. Resume audio if it was playing (avoid browser-induced pauses)
    if (wasPlaying) {
      setTimeout(() => {
        if (audioRef.current && audioRef.current.paused) {
          audioRef.current.play().catch(() => {
            setIsPlaying(false);
          });
        }
      }, 0);
    }
  };

  const updateTrackMetadata = (id: string, metadata: Partial<Song>) => {
    if (playlist.updateValue(id, metadata)) {
      syncState();
    }
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
    // Mobile browsers require AudioContext to be resumed within a user interaction
    audioAnalyzer.resume();
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
      if (isPlaying) play();
    }
  };

  const prev = () => {
    const song = playlist.prev();
    if (song) {
      setCurrentSong(song);
      if (isPlaying) play();
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
      
      // UX CRITICAL: Force-update native element to bypass React render cycle delay
      if (audioRef.current) {
        audioRef.current.src = song.audioUrl;
        // Resuming context within user click handler
        audioAnalyzer.resume();
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(true);
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
    updateTrackMetadata,
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
