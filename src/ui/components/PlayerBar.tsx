import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Maximize2, ListPlus } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlayerBarProps {
  currentSong: any;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleFavorite?: () => void;
  onAddToPlaylist?: () => void;
}

const PlayerBar: React.FC<PlayerBarProps> = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  volume,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  onToggleFavorite,
  onAddToPlaylist
}) => {
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => console.error(e));
    } else {
      document.exitFullscreen();
    }
  };

  if (!currentSong) return null;

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 h-24 md:h-28 bg-[var(--bg-glass)] backdrop-blur-xl border-t border-[var(--border-color)] z-[80] px-4 md:px-8 flex items-center justify-between transition-all duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
    >
      {/* Left: Song Info */}
      <div className="hidden sm:flex items-center gap-4 w-[25%] lg:w-[30%] min-w-0">
        <div className="relative group shrink-0">
          <img 
            src={currentSong.coverUrl || 'https://picsum.photos/200/200'} 
            alt="" 
            className="w-12 h-12 md:w-16 md:h-16 rounded-2xl object-cover shadow-2xl group-hover:scale-110 transition-transform duration-500" 
          />
        </div>
        <div className="min-w-0">
          <h4 className="font-black text-sm text-[var(--text-main)] truncate uppercase tracking-tight italic leading-none mb-1">{currentSong.title}</h4>
          <p className="text-[9px] md:text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest truncate">{currentSong.artist}</p>
        </div>
      </div>

      {/* Center: Controls & Progress */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl px-2 md:px-0">
        <div className="flex items-center gap-4 sm:gap-8">
          {/* Favorites Button */}
          <button 
            onClick={onToggleFavorite}
            className={`p-4 -m-2 transition-all active:scale-75 z-[100] ${currentSong.isFavorite ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`}
          >
            <Heart className={`w-6 h-6 ${currentSong.isFavorite ? 'fill-current' : ''}`} />
          </button>
          
          <div className="flex items-center gap-4 sm:gap-8 text-[var(--text-main)]">
            <button onClick={onPrev} className="p-2 text-[var(--text-muted)] hover:text-emerald-500 transition-colors active:scale-90 z-50">
              <SkipBack className="w-6 h-6 fill-current" />
            </button>
            <button 
              onClick={onTogglePlay}
              className="w-14 h-14 md:w-16 md:h-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center transition-all active:scale-90 shadow-[0_10px_30px_rgba(16,185,129,0.3)] z-50"
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>
            <button onClick={onNext} className="text-[var(--text-muted)] hover:text-emerald-500 transition-colors active:scale-90 z-50 p-2">
              <SkipForward className="w-6 h-6 fill-current" />
            </button>
          </div>

          {/* Add to Playlist Button */}
          <button 
            onClick={onAddToPlaylist}
            className="p-4 -m-2 text-[var(--text-muted)] hover:text-emerald-500 transition-all active:scale-75 z-[100]"
          >
            <ListPlus className="w-6 h-6" />
          </button>
        </div>
        
        <div className="w-full flex items-center gap-3">
          <span className="text-[9px] font-black text-[var(--text-muted)] w-8 text-right tabular-nums">{formatTime(currentTime)}</span>
          <div className="relative flex-1 group h-1 bg-[var(--border-color)] rounded-full cursor-pointer">
            <input 
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
            />
            <div 
              className="absolute h-full bg-emerald-500 rounded-full group-hover:bg-emerald-400 transition-all"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
            <div 
              className="absolute w-3 h-3 bg-white border-2 border-emerald-500 rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
            />
          </div>
          <span className="text-[9px] font-black text-[var(--text-muted)] w-8 tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Utilities */}
      <div className="hidden sm:flex items-center justify-end gap-2 md:gap-6 w-auto sm:w-[25%] lg:w-[30%]">
        <div className="flex items-center gap-1.5 md:gap-3 w-12 sm:w-24 lg:w-32">
          <Volume2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-[var(--text-muted)] shrink-0" />
          <div className="relative flex-1 h-1 bg-[var(--border-color)] rounded-full group cursor-pointer hidden sm:block">
            <input 
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
            />
            <div 
              className="absolute h-full bg-emerald-500 rounded-full"
              style={{ width: `${volume * 100}%` }}
            />
          </div>
        </div>
        <button 
          onClick={toggleFullscreen}
          className="p-1.5 md:p-2 text-[var(--text-muted)] hover:text-emerald-500 transition-colors active:scale-90"
        >
          <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </motion.div>
  );
};

export default PlayerBar;
