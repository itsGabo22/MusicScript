import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Heart, Trash2, ListMusic, Plus } from 'lucide-react';
import type { Song } from '../../core/entities/Song';
import LyricsDisplay from '../components/LyricsDisplay';
import AmbientVisualizer from '../components/AmbientVisualizer';

interface DefaultPlayerProps {
  player: any;
  onToggleFavorite: (id: string) => void;
  onDeleteTrack: (id: string) => void;
  onPickingChange: (id: string | null) => void;
  onAddClick: () => void;
  activeView: string;
  isLyricsOpen: boolean;
  onFetchLyrics: (id: string) => void;
  activeLyrics: { plain: string | null; synced: string | null } | null;
  isLyricsLoading: boolean;
  onCloseLyrics: () => void;
  currentTime: number;
  onSeek: (time: number) => void;
  coverUrl?: string | null;
}

const DefaultPlayer: React.FC<DefaultPlayerProps> = ({
  player,
  onToggleFavorite,
  onDeleteTrack,
  onPickingChange,
  onAddClick,
  activeView,
  isLyricsOpen,
  onFetchLyrics,
  activeLyrics,
  isLyricsLoading,
  onCloseLyrics,
  currentTime,
  onSeek
}) => {
  const songs = player.songs;
  const currentSong = player.currentSong;

  const getViewTitle = () => {
    if (activeView === 'library') return 'Biblioteca';
    if (activeView === 'favorites') return 'Tus Favoritos';
    return 'Mi Playlist';
  };

  return (
    /* FULL EXPANSION: Removed top padding almost completely (lg:pt-2) to fill the screen upwards */
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden p-4 md:p-6 lg:p-6 lg:pt-2 pb-28 lg:pb-32 gap-6 lg:gap-10 relative animate-in fade-in duration-700">
      
      {/* LEFT COLUMN: Image, Info, and Integrated Lyrics */}
      <div className="w-full lg:w-[45%] flex flex-col relative min-h-[380px] lg:h-full overflow-hidden">
        <div className="flex-1 relative rounded-[40px] overflow-hidden shadow-2xl group border border-white/5 bg-black/5">
          <AnimatePresence mode="wait">
             <motion.div
               key={currentSong?.id || 'empty'}
               initial={{ opacity: 0, scale: 1.1 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="absolute inset-0"
             >
                {currentSong?.coverUrl ? (
                  <img src={currentSong.coverUrl} alt={currentSong.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                    <Music className="w-20 h-20 text-white/10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
             </motion.div>
          </AnimatePresence>

          <AmbientVisualizer isPlaying={player.isPlaying} color={{ r: 16, g: 185, b: 129 }} />

          {/* Integrated Lyrics Overlay */}
          <AnimatePresence>
            {isLyricsOpen && currentSong && (
              <LyricsDisplay 
                lyrics={activeLyrics}
                isLoading={isLyricsLoading}
                onClose={onCloseLyrics}
                title={currentSong.title}
                artist={currentSong.artist}
                currentTime={currentTime}
                onSeek={onSeek}
                coverUrl={currentSong.coverUrl}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Floating Info Card */}
        <div className="mt-4 px-4 flex justify-between items-center bg-[var(--bg-glass)] backdrop-blur-xl p-3 md:p-5 rounded-[32px] border border-white/5 shadow-xl">
          <div className="min-w-0">
            <motion.h1 
              key={currentSong?.title}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-xl md:text-2xl lg:text-3xl font-black text-[var(--text-main)] italic tracking-tighter truncate uppercase"
            >
              {currentSong ? currentSong.title : 'Seleccione Disco'}
            </motion.h1>
            <motion.p 
              key={currentSong?.artist}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mt-0.5 italic opacity-80"
            >
              {currentSong ? currentSong.artist : 'Esperando Sincronización...'}
            </motion.p>
          </div>
          
          {currentSong && (
            <button 
               onClick={() => onFetchLyrics(currentSong.id)}
               className={`p-2.5 md:p-3.5 rounded-2xl transition-all shadow-xl active:scale-90 flex-shrink-0 ${isLyricsOpen ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-emerald-500 hover:border-emerald-500/50 border border-[var(--border-color)]'}`}
            >
               <ListMusic className="w-5 h-5 md:w-7 md:h-7" />
            </button>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive List */}
      <div className="w-full lg:w-[55%] flex flex-col h-full lg:h-full lg:overflow-hidden pt-4 lg:pt-0">
        <header className="flex justify-between items-center mb-6 shrink-0 bg-transparent px-2">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase text-emerald-500 tracking-[0.3em] mb-1 italic">Viendo</p>
            <h2 className="text-xl md:text-3xl font-black text-[var(--text-main)] tracking-tighter italic uppercase truncate">{getViewTitle()}</h2>
          </div>
          <button 
            onClick={onAddClick}
            className="group flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/10 active:scale-95 border border-emerald-400/20 flex-shrink-0 ml-4"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar smooth-scroll">
          <div className="space-y-3">
            {songs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
                <Music className="w-16 h-16 mb-4" />
                <p className="font-black text-xs uppercase tracking-widest italic">Lista Vacía</p>
              </div>
            ) : (
              songs.map((song: Song, index: number) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`group flex items-center gap-4 p-3.5 rounded-[28px] transition-all duration-500 border border-transparent cursor-pointer ${
                    currentSong?.id === song.id 
                      ? 'bg-emerald-600/10 border-emerald-500/20 shadow-lg' 
                      : 'hover:bg-[var(--bg-card)] hover:border-[var(--border-color)] active:scale-[0.98]'
                  }`}
                  onClick={() => player.selectTrack(song.id)}
                >
                  <div className="relative w-12 h-12 md:w-14 md:h-14 shrink-0 overflow-hidden rounded-2xl shadow-lg border border-white/10">
                    {song.coverUrl ? (
                      <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Music className="w-6 h-6" />
                      </div>
                    )}
                    {currentSong?.id === song.id && (
                      <div className="absolute inset-0 bg-emerald-600/40 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-4 h-4 fill-white text-white animate-pulse" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-black truncate tracking-tight uppercase italic ${currentSong?.id === song.id ? 'text-emerald-500' : 'text-[var(--text-main)]'}`}>
                      {song.title}
                    </h4>
                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest truncate opacity-80 italic">
                      {song.artist}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all px-2 md:flex">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onFetchLyrics(song.id); }}
                      className="p-2 text-[var(--text-muted)] hover:text-emerald-500 rounded-xl transition-colors"
                      title="Ver Letras"
                    >
                      <ListMusic className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onToggleFavorite(song.id); }}
                      className={`p-2 transition-all ${song.isFavorite ? 'text-emerald-500 bg-emerald-500/10' : 'text-[var(--text-muted)] hover:text-red-500'} rounded-xl`}
                    >
                      <Heart className={`w-4 h-4 ${song.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onPickingChange(song.id); }}
                      className="p-2 text-[var(--text-muted)] hover:text-emerald-500 rounded-xl transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteTrack(song.id); }}
                      className="p-2 text-[var(--text-muted)] hover:text-red-500 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultPlayer;
