import { useState, useEffect, useMemo, useRef } from 'react';
import { useMusicPlayer } from './hooks/useMusicPlayer';
import { useLibrary } from './hooks/useLibrary';
import { usePlaylists } from './hooks/usePlaylists';
import DefaultPlayer from './ui/layouts/DefaultPlayer';
import IpodPlayer from './ui/layouts/IpodPlayer';
import CassettePlayer from './ui/layouts/CassettePlayer';
import AddSongModal from './ui/components/AddSongModal';
import { SyncCenterView } from './ui/views/SyncCenterView';
import { SongEditorModal } from './ui/components/SongEditorModal';
import AppShell from './ui/components/AppShell';
import PlayerBar from './ui/components/PlayerBar';
import CreatePlaylistModal from './ui/components/CreatePlaylistModal';
import PlaylistPicker from './ui/components/PlaylistPicker';
import { OnboardingModal } from './ui/components/OnboardingModal';
import { DeleteTrackModal } from './ui/components/DeleteTrackModal';
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
  const [sourceTitle, setSourceTitle] = useState('Todas las canciones');
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [activeLyrics, setActiveLyrics] = useState<{ plain: string | null, synced: string | null } | null>(null);
  const [isLyricsLoading, setIsLyricsLoading] = useState(false);
  const [pickingForTrackId, setPickingForTrackId] = useState<string | null>(null);

  const [editingTrack, setEditingTrack] = useState<Song | null>(null);
  const [trimmingTrack, setTrimmingTrack] = useState<Song | null>(null);
  const [trackToDelete, setTrackToDelete] = useState<Song | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(!localStorage.getItem('ms_tutorial_seen'));
  
  const [showTranslation, setShowTranslation] = useState(() => localStorage.getItem('ms_show_translation') === 'true');

  useEffect(() => {
    localStorage.setItem('ms_show_translation', showTranslation.toString());
  }, [showTranslation]);
  
  const appContainerRef = useRef<HTMLDivElement>(null);
  const prevViewRef = useRef<string>('');

  // --- View Filtering Engine ---
  const lastQueueFingerprint = useRef<string>('');

  useEffect(() => {
    let filteredSongs: Song[] = [];
    let titleLine = 'Todas las canciones';
    
    // Check if we are in a music view or an info view
    const isMusicView = ['library', 'favorites', 'playlist'].includes(activeView);
    const isPlaylistView = !['library', 'favorites', 'ai', 'sync', 'guide'].includes(activeView);
    
    if (!isMusicView && !isPlaylistView) return; 

    if (activeView === 'favorites') {
      filteredSongs = library.getFavorites();
      titleLine = 'Favoritos';
    } else if (activeView === 'library') {
      filteredSongs = [...library.librarySongs];
      titleLine = 'Todas las canciones';
    } else {
        // Handle direct playlist ID or other music view
        const playlist = playlists.playlists.find(p => p.id === activeView);
        if (playlist) {
          filteredSongs = playlist.songIds
            .map(id => library.librarySongs.find(s => s.id === id))
            .filter((s): s is Song => !!s);
          titleLine = `Playlist: ${playlist.name}`;
        }
    }
    
    setSourceTitle(titleLine);

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
    setSourceTitle(titleLine);
  }, [activeView, library.librarySongs, playlists.playlists]);

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

  // --- Global Event Listeners ---
  useEffect(() => {
    const handleToggleLyrics = () => {
      // If no song is playing, we can't show lyrics
      if (!player.currentSong) return;
      
      // If we are not in a music view (e.g. AI Assistant), we should switch back to library first
      const isMusicView = ['library', 'favorites', 'playlist'].includes(activeView);
      if (!isMusicView) {
        setActiveView('library');
      }
      
      setIsLyricsOpen(prev => !prev);
    };

    window.addEventListener('toggleLyrics', handleToggleLyrics);
    return () => window.removeEventListener('toggleLyrics', handleToggleLyrics);
  }, [player.currentSong, activeView]);

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
    const song = library.librarySongs.find(s => s.id === id);
    if (song) setTrackToDelete(song);
  };

  const confirmDeleteLibrary = async () => {
    if (!trackToDelete) return;
    await library.removeFromLibrary(trackToDelete.id);
    setTrackToDelete(null);
  };

  const confirmDeletePlaylist = async () => {
    if (!trackToDelete) return;
    await playlists.removeTrackFromPlaylist(activeView, trackToDelete.id);
    setTrackToDelete(null);
  };

  const handleFetchLyrics = async (songId: string, openView: boolean = false) => {
    const song = library.librarySongs.find(s => s.id === songId);
    if (!song) return;

    if (activeSong?.id !== songId) {
       player.selectTrack(songId);
    }
    
    if (openView) {
      setIsLyricsOpen(true);
    }
    
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
    if (activeSong) {
      // UX FIXED: Close lyrics automatically on track change
      // Force return to default info (cover) mode
      setIsLyricsOpen(false);
      
      // Reset lyrics state but DON'T open the view automatically
      setActiveLyrics(null);
      
      // Silent fetch for the next time the user wants to see them
      handleFetchLyrics(activeSong.id, false);
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
            {viewMode === 'modern' && activeView !== 'guide' && activeView !== 'ai' && activeView !== 'sync' && (
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
                onFetchLyrics={(id) => handleFetchLyrics(id, true)}
                activeLyrics={activeLyrics}
                isLyricsLoading={isLyricsLoading}
                onCloseLyrics={() => setIsLyricsOpen(false)}
                currentTime={player.currentTime}
                onSeek={player.seek}
                showTranslation={showTranslation}
                onToggleTranslation={() => setShowTranslation(!showTranslation)}
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
            {activeView === 'sync' && <SyncCenterView />}
            
            {viewMode === 'ipod' && <IpodPlayer player={player} isDark={isDark} />}
            {viewMode === 'cassette' && <CassettePlayer player={player} isDark={isDark} />}
          </main>

          <PlayerBar 
            currentSong={player.currentSong}
            isPlaying={player.isPlaying}
            currentTime={player.currentTime}
            duration={player.duration}
            volume={player.volume}
            sourceTitle={sourceTitle}
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
      
      {/* FIRST-TIME USER ONBOARDING MODAL */}
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={() => {
          localStorage.setItem('ms_tutorial_seen', 'true');
          setShowOnboarding(false);
        }} 
      />

      <DeleteTrackModal 
        isOpen={!!trackToDelete}
        trackTitle={trackToDelete?.title || ''}
        isPlaylistContext={!['library', 'favorites'].includes(activeView)}
        onClose={() => setTrackToDelete(null)}
        onDeleteFromLibrary={confirmDeleteLibrary}
        onDeleteFromPlaylist={confirmDeletePlaylist}
      />
    </div>
  );
}

export default App;
