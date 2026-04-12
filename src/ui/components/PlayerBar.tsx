import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Maximize2, ListPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { audioAnalyzer } from '../../infrastructure/services/AudioAnalyzerService';

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
  const [visualData, setVisualData] = useState<number[]>(new Array(16).fill(0));
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
      className="fixed bottom-0 left-0 right-0 h-24 md:h-28 bg-[var(--bg-glass)] backdrop-blur-3xl border-t border-white/5 z-[80] px-4 md:px-8 flex items-center justify-center transition-all duration-500 shadow-[0_-20px_50px_rgba(0,0,0,0.3)]"
    >
      <div className="flex flex-col items-center gap-3 w-full max-w-4xl px-2 md:px-0 relative">
        
        {/* PLAYER CONTROLS */}
        <div className="flex items-center gap-8 sm:gap-12">
          <button 
            onClick={onToggleFavorite}
            className={`p-2 transition-all active:scale-75 z-[100] ${currentSong.isFavorite ? 'text-emerald-500' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
          >
            <Heart className={`w-6 h-6 ${currentSong.isFavorite ? 'fill-current' : ''}`} />
          </button>
          
          <div className="flex items-center gap-8 sm:gap-12 text-[var(--text-main)]">
            <button onClick={onPrev} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all active:scale-90 z-50">
              <SkipBack className="w-7 h-7 fill-current" />
            </button>
            <button 
              onClick={onTogglePlay}
              className="w-14 h-14 md:w-16 md:h-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center transition-all active:scale-95 shadow-[0_15px_35px_rgba(16,185,129,0.4)] z-50 relative group"
            >
              <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              {isPlaying ? <Pause className="w-8 h-8 fill-current relative z-10" /> : <Play className="w-8 h-8 fill-current ml-1 relative z-10" />}
            </button>
            <button onClick={onNext} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all active:scale-90 z-50">
              <SkipForward className="w-7 h-7 fill-current" />
            </button>
          </div>

          <button 
            onClick={onAddToPlaylist}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all active:scale-75 z-[100]"
          >
            <ListPlus className="w-6 h-6" />
          </button>
        </div>
        
        {/* SUPER PROGRESS BAR AREA */}
        <div className="w-full flex items-center gap-4 relative mt-2">
          <span className="text-[10px] font-black text-[var(--text-muted)] w-10 text-right tabular-nums italic">{formatTime(currentTime)}</span>
          
          <div className="relative flex-1 group h-1 bg-[var(--border-color)] rounded-full cursor-pointer">
            
            {/* THE "SUPER CURVE" HOLOGRAPHIC VISUALIZER - INTEGRATED WITH PROGRESS */}
            <div className="absolute left-0 right-0 bottom-[1.5px] h-24 md:h-28 pointer-events-none z-0 overflow-visible">
               <svg 
                 viewBox="0 0 1000 100" 
                 preserveAspectRatio="none" 
                 className="w-full h-full drop-shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all duration-300"
               >
                 {/* Background track curve */}
                 <path 
                   d={svgPath} 
                   fill="rgba(16, 185, 129, 0.05)" 
                   stroke="rgba(16, 185, 129, 0.15)" 
                   strokeWidth="1.5"
                 />
                 
                 {/* Progress-synced curve */}
                 <svg x="0" y="0" width={`${(currentTime / (duration || 1)) * 1000}`} overflow="hidden">
                    <path 
                      d={svgPath} 
                      fill="rgba(16, 185, 129, 0.2)" 
                      stroke="rgba(16, 185, 129, 0.9)" 
                      strokeWidth="3.5"
                      className="transition-all duration-300"
                    />
                 </svg>
               </svg>
            </div>

            <input 
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="absolute inset-x-0 -top-10 bottom-0 w-full opacity-0 cursor-pointer z-30"
            />
            
            {/* Progress line */}
            <div 
              className="absolute h-full bg-emerald-500 rounded-full group-hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.8)] z-10"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
            
            <div 
              className="absolute w-4 h-4 bg-white shadow-2xl border-2 border-emerald-500 rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-125 z-40"
              style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-black text-[var(--text-muted)] w-10 tabular-nums italic">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="absolute right-8 hidden lg:flex items-center gap-6">
        <div className="flex items-center gap-3 w-28">
          <Volume2 className="w-4 h-4 text-[var(--text-muted)]" />
          <div className="relative flex-1 h-1 bg-[var(--border-color)] rounded-full group cursor-pointer overflow-hidden">
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
              className="absolute h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              style={{ width: `${volume * 100}%` }}
            />
          </div>
        </div>
        <button 
          onClick={toggleFullscreen}
          className="p-2 text-[var(--text-muted)] hover:text-emerald-500 transition-all active:scale-90"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

export default PlayerBar;
