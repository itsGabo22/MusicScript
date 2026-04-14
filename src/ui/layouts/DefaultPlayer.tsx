import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Heart, Trash2, ListMusic, Plus, MoreVertical, Edit2, Scissors, Languages } from 'lucide-react';
import type { Song } from '../../core/entities/Song';
import LyricsDisplay from '../components/LyricsDisplay';
import AmbientVisualizer from '../components/AmbientVisualizer';
import MusicScriptLogo from '../components/MusicScriptLogo';

interface DefaultPlayerProps {
  player: any;
  onToggleFavorite: (id: string) => void;
  onDeleteTrack: (id: string) => void;
  onPickingChange: (id: string | null) => void;
  onAddClick: () => void;
  onEditTrack: (song: Song) => void;
  onTrimTrack?: (song: Song) => void;
  activeView: string;
  isLyricsOpen: boolean;
  onFetchLyrics: (id: string) => void;
  activeLyrics: { plain: string | null; synced: string | null } | null;
  isLyricsLoading: boolean;
  onCloseLyrics: () => void;
  currentTime: number;
  onSeek: (time: number) => void;
  showTranslation?: boolean;
  onToggleTranslation?: () => void;
  coverUrl?: string | null;
}

const DefaultPlayer: React.FC<DefaultPlayerProps> = ({
  player,
  onToggleFavorite,
  onDeleteTrack,
  onPickingChange,
  onAddClick,
  onEditTrack,
  onTrimTrack,
  activeView,
  isLyricsOpen,
  onFetchLyrics,
  activeLyrics,
  isLyricsLoading,
  onCloseLyrics,
  currentTime,
  onSeek,
  showTranslation,
  onToggleTranslation
}) => {
  const songs = player.songs;
  const currentSong = player.currentSong;
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const getViewTitle = () => {
    if (activeView === 'library') return 'Biblioteca';
    if (activeView === 'favorites') return 'Tus Favoritos';
    return 'Mi Playlist';
  };

  return (
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
                    <div className="w-32 h-32 opacity-20">
                      <MusicScriptLogo showText={false} />
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
             </motion.div>
          </AnimatePresence>

          <AmbientVisualizer isPlaying={player.isPlaying} color={{ r: 16, g: 185, b: 129 }} />

          <AnimatePresence>
            {isLyricsOpen && currentSong && (
              <LyricsDisplay 
                key={currentSong.id}
                lyrics={activeLyrics}
                isLoading={isLyricsLoading}
                onClose={onCloseLyrics}
                title={currentSong.title}
                artist={currentSong.artist}
                currentTime={currentTime}
                onSeek={onSeek}
                showTranslation={showTranslation}
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
          
          <div className="flex items-center gap-2">
            {isLyricsOpen && (
              <button 
                 onClick={onToggleTranslation}
                 title="Traducir letras (Gemini AI)"
                 className={`p-2.5 md:p-3.5 rounded-2xl transition-all shadow-xl active:scale-90 flex-shrink-0 animate-in zoom-in duration-300 ${showTranslation ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)]'}`}
              >
                 <Languages className="w-5 h-5 md:w-7 md:h-7" />
              </button>
            )}
            
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

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar smooth-scroll mx-2 md:mx-0 bg-black/5 md:bg-transparent rounded-[32px] p-2 md:p-0">
          <div className="space-y-3 pb-44 md:pb-8">
            {songs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
                <div className="w-24 h-24 mb-4">
                  <MusicScriptLogo showText={false} />
                </div>
                <p className="font-black text-xs uppercase tracking-widest italic">Lista Vacía</p>
              </div>
            ) : (
              songs.map((song: Song, index: number) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`group relative flex items-center gap-4 p-3.5 rounded-[28px] transition-all duration-500 border border-transparent cursor-pointer ${
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
                        <div className="w-6 h-6 opacity-30">
                          <MusicScriptLogo showText={false} />
                        </div>
                      </div>
                    )}
                    {currentSong?.id === song.id && (
                      <div className="absolute inset-0 bg-emerald-600/40 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-4 h-4 fill-white text-white animate-pulse" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-black text-emerald-500/50 italic">#{index}</span>
                       <h4 className={`text-sm font-black truncate tracking-tight uppercase italic flex-1 ${currentSong?.id === song.id ? 'text-emerald-500' : 'text-[var(--text-main)]'}`}>
                         {song.title}
                       </h4>
                    </div>
                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest truncate opacity-80 italic">
                      {song.artist}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all px-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onToggleFavorite(song.id); }}
                      className={`p-2 transition-all ${song.isFavorite ? 'text-emerald-500 bg-emerald-500/10' : 'text-[var(--text-muted)] hover:text-red-500'} rounded-xl`}
                    >
                      <Heart className={`w-4 h-4 ${song.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    
                    {/* SURGICAL MENU: Three dots (...) */}
                    <div className="relative">
                       <button 
                         onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === song.id ? null : song.id); }}
                         className="p-2 text-[var(--text-muted)] hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
                       >
                         <MoreVertical className="w-4 h-4" />
                       </button>

                       <AnimatePresence>
                         {openMenuId === song.id && (
                           <>
                             <div className="fixed inset-0 z-[50]" onClick={() => setOpenMenuId(null)} />
                             <motion.div 
                               initial={{ opacity: 0, scale: 0.9, y: 10 }}
                               animate={{ opacity: 1, scale: 1, y: 0 }}
                               exit={{ opacity: 0, scale: 0.9, y: 10 }}
                               className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-main)] backdrop-blur-3xl border border-[var(--border-color)] rounded-2xl shadow-2xl z-[60] py-2 overflow-hidden"
                             >
                               <MenuButton 
                                  icon={<Scissors className="w-3.5 h-3.5" />}
                                  label="Recortar Canción"
                                  onClick={() => { onTrimTrack?.(song); setOpenMenuId(null); }}
                               />
                               <MenuButton 
                                  icon={<Edit2 className="w-3.5 h-3.5" />}
                                  label="Editar / Mover"
                                  onClick={() => { onEditTrack(song); setOpenMenuId(null); }}
                               />
                               <MenuButton 
                                  icon={<Plus className="w-3.5 h-3.5" />}
                                  label="Añadir a Playlist"
                                  onClick={() => { onPickingChange(song.id); setOpenMenuId(null); }}
                               />
                               <MenuButton 
                                  icon={<Trash2 className="w-3.5 h-3.5 text-red-500" />}
                                  label="Eliminar"
                                  variant="danger"
                                  onClick={() => { onDeleteTrack(song.id); setOpenMenuId(null); }}
                               />
                             </motion.div>
                           </>
                         )}
                       </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            {/* Mobile Spacer to prevent PlayerBar overlap */}
            <div className="h-44 md:hidden" />
          </div>
        </div>
      </div>
    </div>
  );
};

const MenuButton = ({ icon, label, onClick, variant = 'default' }: { icon: any, label: string, onClick: () => void, variant?: 'default' | 'danger' }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-emerald-500/10 ${variant === 'danger' ? 'text-red-500 hover:bg-red-500/10' : 'text-[var(--text-muted)] hover:text-emerald-500'}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default DefaultPlayer;
