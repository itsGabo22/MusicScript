import { useState, useEffect, useMemo } from 'react';
import { useMusicPlayer } from './hooks/useMusicPlayer';
import { useLibrary } from './hooks/useLibrary';
import { usePlaylists } from './hooks/usePlaylists';
import { Moon, Sun, Smartphone, Disc, LayoutGrid } from 'lucide-react';
import DefaultPlayer from './ui/layouts/DefaultPlayer';
import IpodPlayer from './ui/layouts/IpodPlayer';
import CassettePlayer from './ui/layouts/CassettePlayer';
import AddSongModal from './ui/components/AddSongModal';
import AppShell from './ui/components/AppShell';
import PlayerBar from './ui/components/PlayerBar';
import CreatePlaylistModal from './ui/components/CreatePlaylistModal';
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

  // Compute filtered songs based on sidebar selection
  const filteredSongs = useMemo(() => {
    if (activeView === 'library') return library.librarySongs;
    if (activeView === 'favorites') return library.getFavorites();
    
    const playlist = playlists.playlists.find(p => p.id === activeView);
    if (!playlist) return library.librarySongs;
    
    return library.librarySongs.filter(s => playlist.songIds.includes(s.id));
  }, [activeView, library.librarySongs, playlists.playlists]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.body.classList.toggle('dark');
  };

  const handleAddSong = async (file: File, metadata: { title: string, artist: string, position: 'start' | 'end' | number }) => {
    const song = await library.addToLibrary(file, metadata);
    await player.addTrack(song, metadata.position);
  };

  const handleViewChange = (viewId: string) => {
    setActiveView(viewId);
    // When switching view, we could optionally update the player queue
    // For now, let's keep the queue independent until the user picks a song
  };

  const handleSelectSong = (songId: string) => {
    // When a song is selected from a filtered view, updated the player's queue to that view
    player.setQueue(filteredSongs);
    player.selectTrack(songId);
  };

  // Initialize Audio Analyzer
  useEffect(() => {
    if (player.isPlaying && player.audioRef.current) {
      audioAnalyzer.init(player.audioRef.current);
      audioAnalyzer.resume();
    }
  }, [player.isPlaying]);

  return (
    <AppShell 
      player={player} 
      playlists={playlists}
      onViewChange={handleViewChange}
      onCreatePlaylist={() => setIsPlaylistModalOpen(true)}
    >
      {/* Top Floating Controls */}
      <div className="absolute top-10 right-10 flex gap-3 z-50">
        <button 
          onClick={() => {
            const modes: ViewMode[] = ['modern', 'ipod', 'cassette'];
            const nextIdx = (modes.indexOf(viewMode) + 1) % modes.length;
            setViewMode(modes[nextIdx]);
          }}
          className="p-3 rounded-2xl bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-color)] text-[var(--text-main)] hover:text-emerald-500 transition-all shadow-2xl"
        >
          {viewMode === 'modern' && <LayoutGrid className="w-5 h-5" />}
          {viewMode === 'ipod' && <Smartphone className="w-5 h-5" />}
          {viewMode === 'cassette' && <Disc className="w-5 h-5" />}
        </button>
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-color)] text-[var(--text-main)] hover:text-emerald-500 transition-all shadow-2xl"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className={`w-full h-full flex items-center justify-center`}>
        {viewMode === 'modern' && (
          <DefaultPlayer 
            player={{ ...player, songs: filteredSongs, selectTrack: handleSelectSong }} 
            onAddClick={() => setIsModalOpen(true)} 
            onToggleFavorite={library.toggleFavorite}
            playlists={playlists.playlists}
            onAddToPlaylist={playlists.addTrackToPlaylist}
          />
        )}
        {viewMode === 'ipod' && <IpodPlayer player={player} />}
        {viewMode === 'cassette' && <CassettePlayer player={player} />}
      </div>

      {/* Persistent Bottom Bar (Modern Only for now) */}
      {viewMode === 'modern' && player.currentSong && (
        <PlayerBar 
          currentSong={player.currentSong}
          isPlaying={player.isPlaying}
          currentTime={player.currentTime}
          duration={player.duration}
          volume={player.volume}
          onTogglePlay={player.togglePlay}
          onNext={player.next}
          onPrev={player.prev}
          onSeek={player.seek}
          onVolumeChange={player.updateVolume}
          onToggleFavorite={() => library.toggleFavorite(player.currentSong!.id)}
        />
      )}

      <AddSongModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddSong}
        playlistSize={player.songs.length}
      />

      <CreatePlaylistModal 
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        onCreate={playlists.createPlaylist}
      />

      <audio 
        ref={player.audioRef}
        src={player.currentSong?.audioUrl}
        onTimeUpdate={player.handlers.onTimeUpdate}
        onLoadedMetadata={player.handlers.onLoadedMetadata}
        onEnded={player.handlers.onEnded}
        crossOrigin="anonymous"
      />
    </AppShell>
  );
}

export default App;
