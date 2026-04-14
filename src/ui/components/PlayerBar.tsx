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
  const [isEQOpen, setIsEQOpen] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      const data = audioAnalyzer.getFrequencyData();
      if (data.length > 0) {
        const reducedData = [];
        // Use 16 points for a smooth but reactive curve
        const step = Math.floor(data.length / 32);
        for (let i = 0; i < 16; i++) {
          // Add a base value (0.05) so the wave never disappears completely (stays fused)
          const base = 0.05;
          const val = base + (data[i * step] / 255) * (isPlaying ? 0.95 : 0.05);
          reducedData.push(val);
        }
        setVisualData(reducedData);
      }
      rafRef.current = requestAnimationFrame(update);
    };

    update();
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

  // GENERATE THE "SUPER BAR" SVG PATH
  const svgPath = useMemo(() => {
    const width = 1000; // Reference width
    const height = 100; // Reference height
    const points = visualData.map((val, i) => {
      const x = (i / (visualData.length - 1)) * width;
      const y = height - (val * height * 0.8);
      return { x, y };
    });

    if (points.length === 0) return "";

    // Build the curve using bezier commands
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cp1x = p0.x + (p1.x - p0.x) / 2;
        d += ` C ${cp1x} ${p0.y}, ${cp1x} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    
    // Close the path to the bottom to create the "joined" fill look
    d += ` L ${width} ${height} L 0 ${height} Z`;
    return d;
  }, [visualData]);

  if (!currentSong) return null;

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 h-24 md:h-28 bg-[var(--bg-glass)] backdrop-blur-3xl border-t border-white/5 z-[100] px-2 md:px-8 flex items-center transition-all duration-500 shadow-[0_-20px_50px_rgba(0,0,0,0.4)]"
    >
      {/* 1. SONG INFO (LEFT - Ultra Compact on Mobile) */}
      <div className="flex w-[25%] md:w-[30%] items-center gap-1.5 md:gap-4 shrink-0 min-w-0">
        <div className="relative group cursor-pointer shrink-0" onClick={() => window.dispatchEvent(new CustomEvent('toggleLyrics'))}>
          <img 
            src={currentSong.coverUrl || 'https://picsum.photos/100/100'} 
            className="w-9 h-9 md:w-14 md:h-14 rounded-xl object-cover border border-white/10 group-hover:border-emerald-500/50 transition-all shadow-lg"
            alt="Cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition-all">
            <Maximize2 className="w-3 h-3 md:w-5 md:h-5 text-white" />
          </div>
        </div>
        <div className="min-w-0 pr-1">
          <h4 className="text-[9px] md:text-sm lg:text-base font-black text-[var(--text-main)] truncate italic uppercase tracking-tight leading-tight">{currentSong.title}</h4>
          <p className="text-[7px] md:text-[10px] text-emerald-500 font-bold truncate tracking-widest uppercase opacity-80">{currentSong.artist}</p>
          {sourceTitle && (
            <div className="hidden lg:flex items-center gap-1 mt-1 bg-white/5 px-2 py-0.5 rounded-full w-fit max-w-full">
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[6px] font-black text-white/40 uppercase tracking-widest truncate">From: {sourceTitle}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. PLAYER CONTROLS (CENTER - The Master Cluster) */}
      <div className="flex-1 flex flex-col items-center gap-1 md:gap-3 px-1 md:px-4 relative z-10">
        <div className="flex items-center gap-1.5 sm:gap-6 md:gap-8 lg:gap-12">
          {/* Action Cluster (Compact) */}
          <div className="flex items-center gap-0.5 md:gap-2">
            <button 
              onClick={onToggleFavorite}
              className={`p-1.5 md:p-2 transition-all active:scale-75 ${currentSong.isFavorite ? 'text-emerald-500' : 'text-[var(--text-muted)] hover:text-emerald-500'}`}
            >
              <Heart className={`w-4 h-4 md:w-6 md:h-6 ${currentSong.isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={onAddToPlaylist}
              className="p-1.5 md:p-2 text-[var(--text-muted)] hover:text-emerald-500 transition-all active:scale-75"
            >
              <ListPlus className="w-4 h-4 md:w-6 md:h-6" />
            </button>
          </div>
          
          {/* Native Controls */}
          <div className="flex items-center gap-2 sm:gap-6 lg:gap-10 text-[var(--text-main)]">
            <button onClick={onPrev} className="p-1.5 md:p-2 text-[var(--text-muted)] hover:text-emerald-500 transition-all active:scale-90">
              <SkipBack className="w-5 h-5 md:w-8 md:h-8 fill-current" />
            </button>
            <button 
              onClick={onTogglePlay}
              className="w-10 h-10 md:w-16 md:h-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center transition-all active:scale-95 shadow-[0_10px_30px_rgba(16,185,129,0.5)] relative group"
            >
              <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              {isPlaying ? <Pause className="w-5 h-5 md:w-8 md:h-8 fill-current relative z-10" /> : <Play className="w-5 h-5 md:w-8 md:h-8 fill-current ml-0.5 relative z-10" />}
            </button>
            <button onClick={onNext} className="p-1.5 md:p-2 text-[var(--text-muted)] hover:text-emerald-500 transition-all active:scale-90">
              <SkipForward className="w-5 h-5 md:w-8 md:h-8 fill-current" />
            </button>
          </div>

          {/* EQ Group (Compact) */}
          <button 
            onClick={() => setIsEQOpen(!isEQOpen)}
            className={`p-1.5 md:p-2 transition-all active:scale-90 rounded-full ${isEQOpen ? 'text-emerald-500 bg-emerald-500/10' : 'text-[var(--text-muted)] hover:text-emerald-500'}`}
          >
            <SlidersHorizontal className="w-4 h-4 md:w-6 md:h-6" />
          </button>
        </div>
        
        {/* PROGRESS SYSTEM - WAVE VISUALIZER INTEGRATED */}
        <div className="w-full flex items-center gap-2 md:gap-4 relative max-w-2xl px-1">
          <span className="text-[7px] md:text-[9px] font-black text-[var(--text-muted)] w-8 md:w-10 text-right tabular-nums opacity-60">{formatTime(currentTime)}</span>
          
          <div className="relative flex-1 group h-1 bg-[var(--border-color)] rounded-full cursor-pointer">
            {/* 1. HOLOGRAPHIC WAVE BACKGROUND (Faint) */}
            <div className="absolute left-0 right-0 bottom-0 h-12 md:h-20 pointer-events-none z-0 overflow-hidden opacity-10">
               <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full">
                 <path d={svgPath} fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500" />
               </svg>
            </div>

            {/* 2. PROGRESS WAVE (Vibrant & Clipped) */}
            <div 
              className="absolute left-0 bottom-0 h-12 md:h-20 pointer-events-none z-10 overflow-hidden transition-all duration-300"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            >
               <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-[100vw] h-full" style={{ width: `${(100 / (currentTime / duration || 0.001))}%` }}>
                 <path d={svgPath} fill="url(#waveGradient)" stroke="url(#waveStroke)" strokeWidth="3" />
                 <defs>
                   <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="rgba(16, 185, 129, 0.4)" />
                     <stop offset="100%" stopColor="transparent" />
                   </linearGradient>
                   <linearGradient id="waveStroke" x1="0" y1="0" x2="1" y2="0">
                     <stop offset="0%" stopColor="#10b981" />
                     <stop offset="100%" stopColor="#34d399" />
                   </linearGradient>
                 </defs>
               </svg>
            </div>

            {/* 3. INTERACTIVE SLIDER */}
            <input 
              type="range" min="0" max={duration || 0} value={currentTime}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="absolute inset-x-0 -top-6 bottom-0 w-full opacity-0 cursor-pointer z-30"
            />
            
            {/* 4. SOLID PROGRESS BAR (Holographic Line) */}
            <div 
              className="absolute h-full bg-emerald-500 rounded-full group-hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,1)] z-20"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            >
               <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 md:w-3 md:h-3 bg-white rounded-full shadow-[0_0_10px_#fff] scale-0 group-hover:scale-100 transition-transform" />
            </div>
          </div>
          
          <span className="text-[7px] md:text-[9px] font-black text-[var(--text-muted)] w-8 md:w-10 tabular-nums opacity-60">{formatTime(duration)}</span>
        </div>
      </div>

      {/* 3. EXTRA CONTROLS (PC ONLY) */}
      <div className="hidden md:flex md:w-[30%] items-center justify-end gap-3 shrink-0">
        <div className="flex items-center gap-3 w-24 shrink-0">
          <Volume2 className="w-4 h-4 text-[var(--text-muted)]" />
          <div className="relative flex-1 h-1 bg-[var(--border-color)] rounded-full group cursor-pointer overflow-hidden">
            <input 
              type="range" min="0" max="1" step="0.01" value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
            />
            <div className="absolute h-full bg-emerald-500 rounded-full" style={{ width: `${volume * 100}%` }} />
          </div>
        </div>
        <button 
          onClick={toggleFullscreen}
          className="p-2 text-[var(--text-muted)] hover:text-emerald-500 transition-all"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>
      <EqualizerModal isOpen={isEQOpen} onClose={() => setIsEQOpen(false)} />
    </motion.div>
  );
};

export default PlayerBar;
