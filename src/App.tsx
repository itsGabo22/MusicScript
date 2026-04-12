import { useState, useEffect, useMemo, useRef } from 'react';
import { useMusicPlayer } from './hooks/useMusicPlayer';
import { useLibrary } from './hooks/useLibrary';
import { usePlaylists } from './hooks/usePlaylists';
import DefaultPlayer from './ui/layouts/DefaultPlayer';
import IpodPlayer from './ui/layouts/IpodPlayer';
import CassettePlayer from './ui/layouts/CassettePlayer';
import AddSongModal from './ui/components/AddSongModal';
import { SongEditorModal } from './ui/components/SongEditorModal';
import AppShell from './ui/components/AppShell';
import PlayerBar from './ui/components/PlayerBar';
import CreatePlaylistModal from './ui/components/CreatePlaylistModal';
import PlaylistPicker from './ui/components/PlaylistPicker';
import GuideView from './ui/views/GuideView';
import AIAssistant from './ui/views/AIAssistant';
import { LyricsService } from './infrastructure/services/LyricsService';
import { audioAnalyzer } from './infrastructure/services/AudioAnalyzerService';
import type { Song } from './core/entities/Song';

type ViewMode = 'modern' | 'ipod' | 'cassette';

function App() {
  const library = useLibrary();
  const playlists = usePlaylists();
  const player = useMusicPlayer();
  const [isDark, setIsDark] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('modern');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [activeView, setActiveView] = useState('library');
  const [pickingForTrackId, setPickingForTrackId] = useState<string | null>(null);
  const [editingTrack, setEditingTrack] = useState<Song | null>(null);
  const [trimmingTrack, setTrimmingTrack] = useState<Song | null>(null);
  
  // Lyrics State
  const [activeLyrics, setActiveLyrics] = useState<{ plain: string | null; synced: string | null } | null>(null);
  const [isLyricsLoading, setIsLyricsLoading] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  
  const appContainerRef = useRef<HTMLDivElement>(null);
  const prevViewRef = useRef<string>('');

  // --- View Filtering Engine ---
  const lastQueueFingerprint = useRef<string>('');

  useEffect(() => {
    // FIXED: Only update the player queue if the active view is a music container.
    // This prevents static views like 'guide' from clearing the player's memory.
    const isMusicView = activeView === 'library' || activeView === 'favorites' || playlists.playlists.some(p => p.id === activeView);
    if (!isMusicView) return;

    let filteredSongs: Song[] = [];
    
    if (activeView === 'favorites') {
      filteredSongs = library.getFavorites();
    } else if (activeView === 'library') {
      filteredSongs = [...library.librarySongs];
    } else {
      const playlist = playlists.playlists.find(p => p.id === activeView);
      if (playlist) {
        filteredSongs = playlist.songIds
          .map(id => library.librarySongs.find(s => s.id === id))
          .filter((s): s is any => !!s);
      }
    }
    
    // Fingerprint: A string representing the order and identity of the songs
    const currentFingerprint = filteredSongs.map(s => s.id).join(',');
    
    if (currentFingerprint !== lastQueueFingerprint.current || activeView !== prevViewRef.current) {
      player.setQueue(filteredSongs);
      lastQueueFingerprint.current = currentFingerprint;
    } else {
      // If only metadata (like isFavorite) changed, update the existing DLL nodes
      filteredSongs.forEach(s => {
        player.updateTrackMetadata(s.id, { isFavorite: s.isFavorite });
      });
    }
    
    prevViewRef.current = activeView;
  }, [activeView, library.librarySongs, playlists.playlists.length]);

  // --- Audio Analyzer Initialization ---
  useEffect(() => {
    if (player.audioRef.current) {
      audioAnalyzer.init(player.audioRef.current);
    }
  }, [player.audioRef]);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      
      const ctrl = e.ctrlKey || e.metaKey;
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          player.togglePlay();
          audioAnalyzer.resume();
          break;
        case 'ArrowLeft':
          if (ctrl) {
            e.preventDefault();
            player.seek(Math.max(0, player.currentTime - 10));
          } else {
            player.prev();
          }
          break;
        case 'ArrowRight':
          if (ctrl) {
            e.preventDefault();
            player.seek(Math.min(player.duration, player.currentTime + 10));
          } else {
            player.next();
          }
          break;
        case 'Escape':
          if (isLyricsOpen) setIsLyricsOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player, isLyricsOpen]);

  // --- Theme ---
  useEffect(() => {
    const target = document.body;
    if (isDark) {
      target.classList.add('dark');
      document.documentElement.classList.add('dark');
    } else {
      target.classList.remove('dark');
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const activeSong = useMemo(() => {
    if (!player.currentSong) return null;
    return player.songs.find(s => s.id === player.currentSong?.id) || player.currentSong;
  }, [player.currentSong, player.songs]);

  // --- Handlers ---
  const handleToggleFavorite = async (id: string) => {
    await library.toggleFavorite(id);
  };

  const handleAddSong = async (file: File, metadata: any) => {
    await library.addToLibrary(file, metadata);
    setIsModalOpen(false);
  };

  const handleEditTrack = async (id: string, metadata: Partial<Song>, position: 'start' | 'end' | number) => {
    await library.updateTrack(id, metadata, position);
    setEditingTrack(null);
    setIsModalOpen(false);
  };

  const handleDeleteTrack = async (id: string) => {
    await library.removeFromLibrary(id);
  };

  const handleFetchLyrics = async (songId: string) => {
    const song = library.librarySongs.find(s => s.id === songId);
    if (!song) return;

    if (activeSong?.id !== songId) {
       player.selectTrack(songId);
    }
    
    setIsLyricsOpen(true);
    setIsLyricsLoading(true);
    
    try {
      const result = await LyricsService.fetchLyrics(song.title, song.artist);
      setActiveLyrics(result);
    } catch (error) {
      console.error("Error fetching lyrics:", error);
      setActiveLyrics(null);
    } finally {
      setIsLyricsLoading(false);
    }
  };

  useEffect(() => {
    if (isLyricsOpen && activeSong) {
      const timer = setTimeout(() => {
        handleFetchLyrics(activeSong.id);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeSong?.id]);

  const cycleViewMode = () => {
    const modes: ViewMode[] = ['modern', 'ipod', 'cassette'];
    setViewMode(modes[(modes.indexOf(viewMode) + 1) % modes.length]);
  };

  return (
    <div ref={appContainerRef} className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-500 font-sans selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      <AppShell 
        player={player}
        playlists={playlists}
        onViewChange={setActiveView}
        onCreatePlaylist={() => setIsPlaylistModalOpen(true)}
        viewMode={viewMode}
        isDark={isDark}
        onToggleView={cycleViewMode}
        onToggleTheme={() => setIsDark(!isDark)}
      >
        <div className="flex flex-col h-full relative">
          <main className={`flex-1 w-full lg:overflow-hidden relative pt-4 lg:pt-0 flex flex-col ${viewMode !== 'modern' ? 'items-center justify-center p-4' : ''}`}>
            {viewMode === 'modern' && activeView !== 'guide' && activeView !== 'ai' && (
              <DefaultPlayer 
                player={player} 
                onToggleFavorite={handleToggleFavorite}
                onPickingChange={setPickingForTrackId}
                onDeleteTrack={handleDeleteTrack}
                onEditTrack={(song) => {
                   setEditingTrack(song);
                   setIsModalOpen(true);
                }}
                onTrimTrack={(song) => setTrimmingTrack(song)}
                activeView={activeView}
                isLyricsOpen={isLyricsOpen}
                onFetchLyrics={handleFetchLyrics}
                activeLyrics={activeLyrics}
                isLyricsLoading={isLyricsLoading}
                onCloseLyrics={() => setIsLyricsOpen(false)}
                currentTime={player.currentTime}
                onSeek={player.seek}
                coverUrl={activeSong?.coverUrl}
                onAddClick={() => {
                   setEditingTrack(null);
                   setIsModalOpen(true);
                }}
              />
            )}
            {activeView === 'guide' && <GuideView />}
            {activeView === 'ai' && (
              <AIAssistant 
                songs={library.librarySongs}
                favorites={library.getFavorites()}
                playlists={playlists.playlists}
                currentSong={activeSong}
              />
            )}
            {viewMode === 'ipod' && <IpodPlayer player={player} isDark={isDark} />}
            {viewMode === 'cassette' && <CassettePlayer player={player} isDark={isDark} />}
          </main>

          <PlayerBar 
            currentSong={activeSong}
            isPlaying={player.isPlaying}
            currentTime={player.currentTime}
            duration={player.duration}
            volume={player.volume}
            onTogglePlay={player.togglePlay}
            onNext={player.next}
            onPrev={player.prev}
            onSeek={player.seek}
            onVolumeChange={player.updateVolume}
            onToggleFavorite={() => activeSong && handleToggleFavorite(activeSong.id)}
            onAddToPlaylist={() => activeSong && setPickingForTrackId(activeSong.id)}
          />
        </div>
      </AppShell>

      <audio 
        ref={player.audioRef}
        src={activeSong?.audioUrl}
        onTimeUpdate={player.handlers.onTimeUpdate}
        onLoadedMetadata={player.handlers.onLoadedMetadata}
        onEnded={player.handlers.onEnded}
      />

      <AddSongModal 
        isOpen={isModalOpen}
        onClose={() => {
           setIsModalOpen(false);
           setEditingTrack(null);
        }}
        onAdd={handleAddSong}
        onEdit={handleEditTrack}
        playlistSize={library.librarySongs.length}
        editTrack={editingTrack}
      />

      <CreatePlaylistModal 
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        onCreate={playlists.createPlaylist}
      />

      <SongEditorModal 
        song={trimmingTrack}
        isOpen={!!trimmingTrack}
        onClose={() => setTrimmingTrack(null)}
        onSuccess={() => {
          library.refreshLibrary();
          setTrimmingTrack(null);
        }}
      />

      <PlaylistPicker 
        isOpen={!!pickingForTrackId}
        playlists={playlists.playlists}
        onClose={() => setPickingForTrackId(null)}
        onSelect={(playlistId) => {
          if (pickingForTrackId) {
            playlists.addTrackToPlaylist(playlistId, pickingForTrackId);
            setPickingForTrackId(null);
          }
        }}
      />
    </div>
  );
}

export default App;
