import { useState, useEffect, useMemo, useRef } from 'react';
import { useMusicPlayer } from './hooks/useMusicPlayer';
import { useLibrary } from './hooks/useLibrary';
import { usePlaylists } from './hooks/usePlaylists';
import DefaultPlayer from './ui/layouts/DefaultPlayer';
import IpodPlayer from './ui/layouts/IpodPlayer';
import CassettePlayer from './ui/layouts/CassettePlayer';
import AddSongModal from './ui/components/AddSongModal';
import AppShell from './ui/components/AppShell';
import PlayerBar from './ui/components/PlayerBar';
import CreatePlaylistModal from './ui/components/CreatePlaylistModal';
import PlaylistPicker from './ui/components/PlaylistPicker';
import { LyricsService } from './infrastructure/services/LyricsService';
import { audioAnalyzer } from './infrastructure/services/AudioAnalyzerService';

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
  
  // Lyrics State
  const [activeLyrics, setActiveLyrics] = useState<{ plain: string | null; synced: string | null } | null>(null);
  const [isLyricsLoading, setIsLyricsLoading] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  
  const appContainerRef = useRef<HTMLDivElement>(null);
  const prevViewRef = useRef<string>('');

  // --- View Filtering Engine ---
  useEffect(() => {
    if (prevViewRef.current === activeView) return;
    
    let filteredSongs = [...library.librarySongs];
    if (activeView === 'favorites') {
      filteredSongs = library.librarySongs.filter(s => s.isFavorite);
    } else if (activeView !== 'library') {
      const playlist = playlists.playlists.find(p => p.id === activeView);
      if (playlist) {
        filteredSongs = playlist.songIds
          .map(id => library.librarySongs.find(s => s.id === id))
          .filter((s): s is any => !!s);
      }
    }
    
    player.setQueue(filteredSongs);
    prevViewRef.current = activeView;
  }, [activeView, library.librarySongs.length, playlists.playlists.length]);

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
        case 'ArrowUp':
          if (ctrl) {
            e.preventDefault();
            player.updateVolume(Math.min(1, player.volume + 0.1));
          }
          break;
        case 'ArrowDown':
          if (ctrl) {
            e.preventDefault();
            player.updateVolume(Math.max(0, player.volume - 0.1));
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
    const updatedSong = library.librarySongs.find(s => s.id === id);
    if (updatedSong) {
      player.updateTrackMetadata(id, { isFavorite: !updatedSong.isFavorite });
    }
  };

  const handleAddSong = async (file: File, metadata: any) => {
    const song = await library.addToLibrary(file, metadata);
    if (song) {
      player.addTrack(song, metadata.position);
    }
  };

  const handleDeleteTrack = async (id: string) => {
    await library.removeFromLibrary(id);
    player.removeTrack(id); 
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

  useEffect(() => {
    if (isLyricsOpen && window.innerWidth < 1024) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        appContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [isLyricsOpen]);

  const cycleViewMode = () => {
    const modes: ViewMode[] = ['modern', 'ipod', 'cassette'];
    const currentIndex = modes.indexOf(viewMode);
    setViewMode(modes[(currentIndex + 1) % modes.length]);
  };

  return (
    <div ref={appContainerRef} className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-500 font-sans selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      <AppShell 
        player={player}
        playlists={playlists}
        onViewChange={setActiveView}
        onCreatePlaylist={() => setIsPlaylistModalOpen(true)}
        // PASS PROPS TO SHELL
        viewMode={viewMode}
        isDark={isDark}
        onToggleView={cycleViewMode}
        onToggleTheme={() => setIsDark(!isDark)}
      >
        <div className="flex flex-col h-full relative">
          
          {/* EXPANDED: Removed absolute floating buttons and REDUCED top padding to ZERO in PC view (lg:pt-0) */}
          <main className={`flex-1 w-full lg:h-screen lg:overflow-hidden relative pt-4 lg:pt-0 flex flex-col ${viewMode !== 'modern' ? 'items-center justify-center p-4' : ''}`}>
            {viewMode === 'modern' && (
              <DefaultPlayer 
                player={player} 
                onToggleFavorite={handleToggleFavorite}
                onPickingChange={setPickingForTrackId}
                onDeleteTrack={handleDeleteTrack}
                activeView={activeView}
                isLyricsOpen={isLyricsOpen}
                onFetchLyrics={handleFetchLyrics}
                activeLyrics={activeLyrics}
                isLyricsLoading={isLyricsLoading}
                onCloseLyrics={() => setIsLyricsOpen(false)}
                currentTime={player.currentTime}
                onSeek={player.seek}
                coverUrl={activeSong?.coverUrl}
                onAddClick={() => setIsModalOpen(true)}
              />
            )}
            {viewMode === 'ipod' && <IpodPlayer player={player} />}
            {viewMode === 'cassette' && <CassettePlayer player={player} />}
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
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddSong}
        playlistSize={library.librarySongs.length}
      />

      <CreatePlaylistModal 
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        onCreate={playlists.createPlaylist}
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
