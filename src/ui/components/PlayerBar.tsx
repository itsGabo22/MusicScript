import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Maximize2, ListPlus, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { audioAnalyzer } from '../../infrastructure/services/AudioAnalyzerService';
import { EqualizerModal } from './EqualizerModal';

interface PlayerBarProps {
  currentSong: any;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  sourceTitle?: string;
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
  sourceTitle,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  onToggleFavorite,
  onAddToPlaylist
}) => {
  const [visualData, setVisualData] = useState<number[]>(new Array(16).fill(0));
  const [intensities, setIntensities] = useState({ bass: 0.05, avg: 0.05 });
  const [isEQOpen, setIsEQOpen] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const update = (time: number) => {
      const data = audioAnalyzer.getFrequencyData();
      if (data.length > 0) {
        const reducedData = [];
        const step = Math.floor(data.length / 32);
        
        let bassSum = 0;
        let totalSum = 0;

        for (let i = 0; i < 16; i++) {
          const val = data[i * step] / 255;
          // Subtly different physics when playing vs paused
          const factor = isPlaying ? 0.95 : 0.05;
          const idleWave = !isPlaying ? Math.sin(time / 500 + i * 0.5) * 0.02 : 0;
          const boostedVal = 0.05 + val * factor + idleWave;
          
          reducedData.push(boostedVal);
          totalSum += val;
          if (i < 4) bassSum += val;
        }
        
        setVisualData(reducedData);
        setIntensities({
          bass: isPlaying ? (bassSum / 4) : 0.05,
          avg: isPlaying ? (totalSum / 16) : 0.05
        });
      }
      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

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

  // UNIFIED CENTER-AXIS WAVE SYSTEM
  const svgPaths = useMemo(() => {
    const width = 1000;
    const center = 50; // Center axis
    const topPoints = visualData.map((val, i) => ({
      x: (i / (visualData.length - 1)) * width,
      y: center - (val * 85) // Explosive scaling
    }));
    const botPoints = visualData.map((val, i) => ({
      x: (i / (visualData.length - 1)) * width,
      y: center + (val * 85)
    }));

    const buildPath = (pts: {x: number, y: number}[]) => {
      if (pts.length === 0) return "";
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
          const p0 = pts[i];
          const p1 = pts[i + 1];
          const cp1x = p0.x + (p1.x - p0.x) / 2;
          d += ` C ${cp1x} ${p0.y}, ${cp1x} ${p1.y}, ${p1.x} ${p1.y}`;
      }
      return d;
    };

    return { top: buildPath(topPoints), bot: buildPath(botPoints), centerLine: `M 0 ${center} L ${width} ${center}` };
  }, [visualData]);

  if (!currentSong) return null;

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 h-24 md:h-28 bg-[var(--bg-glass)] backdrop-blur-3xl border-t border-white/10 z-[100] px-2 md:px-8 flex items-center transition-all duration-500 shadow-[0_-20px_60px_rgba(0,0,0,0.5)]"
    >
      {/* 0. PREMIUM ENERGY BLOBS (Reactive Background - Now more visible) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-t-[40px]">
        <motion.div 
          animate={{ 
            x: [0, 80, -40, 0], 
            y: [0, -40, 60, 0],
            scale: 1.5 + intensities.bass * 1.5,
            opacity: 0.2 + intensities.avg * 0.4
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[10%] w-72 h-72 bg-emerald-500/40 blur-[120px] rounded-full mix-blend-overlay"
        />
        <motion.div 
          animate={{ 
            x: [0, -60, 90, 0], 
            y: [0, 70, -30, 0],
            scale: 1 + intensities.avg * 2,
            opacity: 0.15 + intensities.bass * 0.3
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[20%] w-96 h-96 bg-blue-500/30 blur-[150px] rounded-full mix-blend-screen"
        />
      </div>

      {/* 1. SONG INFO (LEFT) */}
      <div className="flex w-[25%] md:w-[30%] items-center gap-2 md:gap-5 shrink-0 min-w-0 relative z-20">
        <motion.div 
          animate={{ 
            scale: isPlaying ? 1 + intensities.bass * 0.08 : 1,
            rotate: isPlaying ? intensities.bass * 2 : 0
          }}
          className="relative group cursor-pointer shrink-0" 
          onClick={() => window.dispatchEvent(new CustomEvent('toggleLyrics'))}
        >
          <img 
            src={currentSong.coverUrl || 'https://picsum.photos/100/100'} 
            className="w-10 h-10 md:w-16 md:h-16 rounded-2xl object-cover border border-white/20 group-hover:border-emerald-500/80 transition-all shadow-2xl"
            alt="Cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition-all">
            <Maximize2 className="w-5 h-5 text-white" />
          </div>
        </motion.div>
        <div className="min-w-0 pr-1">
          <h4 className="text-[10px] md:text-sm lg:text-lg font-black text-[var(--text-main)] truncate italic uppercase tracking-tight leading-tight">{currentSong.title}</h4>
          <p className="text-[8px] md:text-[11px] text-emerald-500 font-black truncate tracking-[0.1em] uppercase opacity-90">{currentSong.artist}</p>
        </div>
      </div>

      {/* 2. PLAYER CONTROLS (CENTER) */}
      <div className="flex-1 flex flex-col items-center gap-1.5 md:gap-4 px-1 md:px-4 relative z-20">
        <div className="flex items-center gap-2 sm:gap-8 lg:gap-14">
          <div className="flex items-center gap-1 md:gap-4">
            <button 
              onClick={onToggleFavorite}
              className={`p-1.5 md:p-2.5 transition-all active:scale-75 ${currentSong.isFavorite ? 'text-emerald-500' : 'text-[var(--text-muted)] hover:text-emerald-500'}`}
              style={{ filter: isPlaying ? `drop-shadow(0 0 ${intensities.avg * 15}px #10b981)` : 'none' }}
            >
              <Heart className={`w-4 h-4 md:w-7 md:h-7 ${currentSong.isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={onAddToPlaylist}
              className="p-1.5 md:p-2.5 text-[var(--text-muted)] hover:text-emerald-500 transition-all active:scale-75"
              style={{ filter: isPlaying ? `drop-shadow(0 0 ${intensities.avg * 10}px #10b981)` : 'none' }}
            >
              <ListPlus className="w-4 h-4 md:w-7 md:h-7" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6 lg:gap-12 text-[var(--text-main)]">
            <button onClick={onPrev} className="p-1.5 md:p-2 text-[var(--text-muted)] hover:text-emerald-500 transition-all active:scale-90">
              <SkipBack className="w-6 h-6 md:w-9 md:h-9 fill-current" />
            </button>
            <motion.button 
              animate={{ 
                scale: isPlaying ? 1 + intensities.bass * 0.15 : 1,
                boxShadow: isPlaying ? `0 0 ${20 + intensities.avg * 40}px rgba(16, 185, 129, 0.6)` : '0 10px 20px rgba(0,0,0,0.3)'
              }}
              onClick={onTogglePlay}
              className="w-12 h-12 md:w-18 md:h-18 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center transition-all active:scale-95 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              {isPlaying ? <Pause className="w-6 h-6 md:w-10 md:h-10 fill-current relative z-10" /> : <Play className="w-6 h-6 md:w-10 md:h-10 fill-current ml-1 relative z-10" />}
            </motion.button>
            <button onClick={onNext} className="p-1.5 md:p-2 text-[var(--text-muted)] hover:text-emerald-500 transition-all active:scale-90">
              <SkipForward className="w-6 h-6 md:w-9 md:h-9 fill-current" />
            </button>
          </div>

          <button 
            onClick={() => setIsEQOpen(!isEQOpen)}
            className={`p-1.5 md:p-2.5 transition-all active:scale-90 rounded-full ${isEQOpen ? 'text-emerald-500 bg-emerald-500/20' : 'text-[var(--text-muted)] hover:text-emerald-500'}`}
          >
            <SlidersHorizontal className="w-4 h-4 md:w-7 md:h-7" />
          </button>
        </div>
        
        {/* UNIFIED WAVE PROGRESS SYSTEM */}
        <div className="w-full flex items-center gap-2 md:gap-6 relative max-w-2xl px-2 group/progress">
          <span className="text-[8px] md:text-[11px] font-black text-[var(--text-muted)] w-8 md:w-12 text-right tabular-nums opacity-80">{formatTime(currentTime)}</span>
          
          <div className="relative flex-1 group h-1 bg-[var(--border-color)] rounded-full cursor-pointer">
            {/* 1. HOLOGRAPHIC WAVE SYSTEM (Unified Eje) */}
            <div className="absolute left-0 right-0 top-[-16px] bottom-[-16px] pointer-events-none z-0 overflow-hidden">
               <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full opacity-10">
                 <path d={svgPaths.top} fill="none" stroke="#10b981" strokeWidth="1" />
                 <path d={svgPaths.bot} fill="none" stroke="#10b981" strokeWidth="1" opacity="0.5" />
                 <path d={svgPaths.centerLine} fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.3" />
               </svg>
            </div>

            {/* 2. PROGRESS WAVE (Clipped) */}
            <div 
              className="absolute left-0 top-[-16px] bottom-[-16px] pointer-events-none z-10 overflow-hidden transition-all duration-300"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            >
               <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-[100vw] h-full" style={{ width: `${(100 / (currentTime / duration || 0.001))}%` }}>
                 <path d={svgPaths.top} fill="url(#waveFill)" stroke="#10b981" strokeWidth="2.5" />
                 <path d={svgPaths.bot} fill="url(#mirrorFill)" stroke="#34d399" strokeWidth="2.5" />
                 <defs>
                   <linearGradient id="waveFill" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#10b981dd" />
                     <stop offset="50%" stopColor="#10b98111" />
                   </linearGradient>
                   <linearGradient id="mirrorFill" x1="0" y1="1" x2="0" y2="0">
                     <stop offset="0%" stopColor="#34d39999" />
                     <stop offset="50%" stopColor="#34d39900" />
                   </linearGradient>
                 </defs>
               </svg>
            </div>

            {/* 3. SLIDER */}
            <input 
              type="range" min="0" max={duration || 0} value={currentTime}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="absolute inset-x-0 -top-8 bottom-0 w-full opacity-0 cursor-pointer z-40"
            />
            
            {/* 4. PHYSICAL BAR */}
            <div 
              className="absolute h-full bg-emerald-500 rounded-full group-hover:bg-emerald-400 transition-all shadow-[0_0_25px_rgba(16,185,129,1)] z-30"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            >
               <motion.div 
                 animate={{ scale: [1, 1.2, 1] }}
                 transition={{ duration: 1, repeat: Infinity }}
                 className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_15px_#fff] scale-0 group-hover/progress:scale-100 transition-transform" 
               />
            </div>
          </div>
          
          <span className="text-[8px] md:text-[11px] font-black text-[var(--text-muted)] w-8 md:w-12 tabular-nums opacity-80">{formatTime(duration)}</span>
        </div>
      </div>

      {/* 3. PC EXTRA CONTROLS */}
      <div className="hidden md:flex md:w-[30%] items-center justify-end gap-5 shrink-0 relative z-20">
        {sourceTitle && (
            <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/5 px-4 py-1.5 rounded-full max-w-[240px]">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest truncate">{sourceTitle}</span>
            </div>
        )}
        <div className="flex items-center gap-4 w-32 shrink-0">
          <Volume2 className="w-5 h-5 text-[var(--text-muted)]" />
          <div className="relative flex-1 h-1.5 bg-[var(--border-color)] rounded-full group cursor-pointer overflow-hidden shadow-inner">
            <input 
              type="range" min="0" max="1" step="0.01" value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
            />
            <div className="absolute h-full bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" style={{ width: `${volume * 100}%` }} />
          </div>
        </div>
        <button 
          onClick={toggleFullscreen}
          className="p-2.5 text-[var(--text-muted)] hover:text-emerald-500 transition-all group"
        >
          <Maximize2 className="w-6 h-6 group-hover:scale-125 group-hover:rotate-12 transition-transform" />
        </button>
      </div>
      <EqualizerModal isOpen={isEQOpen} onClose={() => setIsEQOpen(false)} />
    </motion.div>
  );
};

export default PlayerBar;
