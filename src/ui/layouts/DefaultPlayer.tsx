import React, { useState } from 'react';
import { Plus, Trash2, Music, Heart, ListPlus } from 'lucide-react';
import type { Song } from '../../core/entities/Song';
import type { PlaylistRecord } from '../../infrastructure/persistence/MusicDatabase';
import PlaylistPicker from '../components/PlaylistPicker';

interface PlayerProps {
  player: any; 
  onAddClick: () => void;
  onToggleFavorite?: (id: string) => void;
  playlists: PlaylistRecord[];
  onAddToPlaylist: (playlistId: string, trackId: string) => void;
}

const DefaultPlayer: React.FC<PlayerProps> = ({ 
  player, 
  onAddClick, 
  onToggleFavorite,
  playlists,
  onAddToPlaylist
}) => {
  const { 
    songs, 
    currentSong, 
    isPlaying, 
    removeTrack, 
    selectTrack
  } = player;

  const [pickingForTrack, setPickingForTrack] = useState<string | null>(null);

  return (
    <div className="w-full h-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-center justify-center animate-in fade-in zoom-in duration-700">
      
      {/* Left Panel: Mega Cover Info - Static on Desktop */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center lg:h-full py-4 lg:pb-32">
        <div className="relative w-full max-w-[300px] lg:max-w-[380px] aspect-square mb-6 lg:mb-10 group">
          <div className="absolute -inset-4 bg-emerald-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <img 
            src={currentSong?.coverUrl || 'https://picsum.photos/800/800'} 
            alt="Cover" 
            className={`w-full h-full object-cover rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.7)] transition-all duration-1000 ${isPlaying ? 'scale-[1.02]' : 'scale-100'}`}
          />
          <div className="absolute inset-0 rounded-[48px] ring-1 ring-inset ring-black/5 dark:ring-white/10" />
        </div>
        
        <div className="w-full text-center space-y-3 px-4">
          <h1 className="text-3xl lg:text-5xl font-black text-[var(--text-main)] uppercase tracking-tighter leading-none italic">{currentSong?.title || 'Seleccionar Pista'}</h1>
          <p className="text-base lg:text-xl font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em]">{currentSong?.artist || 'Autor Desconocido'}</p>
        </div>
      </div>

      {/* Right Panel: Scrollable Playlist */}
      <div className="w-full lg:w-1/2 lg:h-full flex flex-col py-4 lg:py-10">
        <div className="bg-[var(--bg-card)] backdrop-blur-2xl rounded-[48px] border border-[var(--border-color)] flex flex-col overflow-hidden shadow-2xl h-[450px] lg:h-full transition-all duration-500">
          <div className="p-6 lg:p-10 border-b border-[var(--border-color)] flex flex-col sm:flex-row justify-between items-center gap-6 bg-emerald-500/5">
            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tighter">En esta vista</h3>
              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mt-1">{songs.length} CANCIONES FILTRADAS</p>
            </div>
            <button 
              onClick={onAddClick}
              className="w-full sm:w-auto group flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              Añadir Música
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 pb-40 custom-scrollbar">
            {songs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20">
                <Music className="w-24 h-24 mb-6 text-[var(--text-main)]" />
                <p className="font-black uppercase tracking-[0.3em] text-[var(--text-main)]">Sin resultados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {songs.map((song: Song, index) => (
                  <div 
                    key={song.id}
                    onClick={() => selectTrack(song.id)}
                    className={`group flex items-center gap-4 p-4 rounded-[28px] cursor-pointer transition-all duration-500 ${
                      currentSong?.id === song.id 
                      ? 'bg-emerald-500/10 border border-emerald-500/30' 
                      : 'hover:bg-emerald-500/5 border border-transparent'
                    }`}
                  >
                    <span className="w-6 text-[10px] font-black text-[var(--text-muted)] group-hover:text-emerald-500 transition-colors">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <div className="relative shrink-0">
                      <img src={song.coverUrl} alt="" className="w-12 h-12 md:w-16 rounded-[18px] object-cover shadow-2xl" />
                      {currentSong?.id === song.id && isPlaying && (
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-[18px] animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-black text-lg truncate ${currentSong?.id === song.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-main)]'}`}>{song.title}</p>
                      <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-[0.2em]">{song.artist}</p>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setPickingForTrack(song.id); }}
                        className="p-3 text-[var(--text-muted)] hover:text-emerald-500 transition-all hover:scale-125 select-none"
                      >
                        <ListPlus className="w-5 h-5" />
                      </button>
                      
                      {pickingForTrack === song.id && (
                        <PlaylistPicker 
                          isOpen={true}
                          playlists={playlists}
                          onSelect={(pid) => onAddToPlaylist(pid, song.id)}
                          onClose={() => setPickingForTrack(null)}
                          isAtBottom={index > songs.length / 2}
                        />
                      )}

                      <button 
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(song.id); }}
                        className={`p-3 transition-all hover:scale-125 ${song.isFavorite ? 'text-emerald-500' : 'text-[var(--text-muted)] hover:text-emerald-500'}`}
                      >
                        <Heart className={`w-5 h-5 ${song.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeTrack(song.id); }}
                        className="p-3 text-[var(--text-muted)] hover:text-red-500 transition-all hover:scale-125"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultPlayer;
