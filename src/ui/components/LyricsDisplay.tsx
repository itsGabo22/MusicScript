import React, { useEffect, useRef, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { LyricsService } from '../../infrastructure/services/LyricsService';

interface LyricLine {
  time: number;
  text: string;
}

interface LyricsDisplayProps {
  lyrics: { plain: string | null; synced: string | null } | null;
  isLoading: boolean;
  onClose: () => void;
  title: string;
  artist: string;
  currentTime: number;
  onSeek: (time: number) => void;
  coverUrl?: string;
}

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  lyrics,
  isLoading,
  onClose,
  title,
  artist,
  currentTime,
  onSeek,
  coverUrl
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [translatedLines, setTranslatedLines] = useState<string[]>([]);
  const lastUserInteraction = useRef<number>(0);

  // Parse LRC format: [mm:ss.xx] Lyrics line
  const parsedLyrics = useMemo(() => {
    if (!lyrics?.synced) return null;

    const lines = lyrics.synced.split('\n');
    const result: LyricLine[] = [];

    lines.forEach(line => {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
      if (match) {
        const mins = parseInt(match[1]);
        const secs = parseInt(match[2]);
        const fracStr = match[3];
        const fracStrClean = fracStr.length === 2 ? fracStr : fracStr.slice(0, 3);
        const frac = parseInt(fracStrClean);
        const fracSeconds = fracStrClean.length === 2 ? frac / 100 : frac / 1000;
        const time = mins * 60 + secs + fracSeconds;
        const text = match[4].trim();
        if (text) result.push({ time, text });
      }
    });

    return result;
  }, [lyrics]);

  // AI Translation logical trigger
  useEffect(() => {
    const translate = async () => {
      if (!parsedLyrics || parsedLyrics.length === 0) return;
      
      try {
        const originalLines = parsedLyrics.map(l => l.text);
        const results = await LyricsService.translateLyrics(originalLines);
        setTranslatedLines(results);
      } catch (error) {
        console.error("Error translation effect:", error);
      }
    };

    translate();
  }, [parsedLyrics]);

  const activeIndex = useMemo(() => {
    if (!parsedLyrics) return -1;
    let index = -1;
    // Add a small anticipatory offset (0.3s) for a snappier feel
    const adjustedTime = currentTime + 0.3;

    for (let i = 0; i < parsedLyrics.length; i++) {
      if (adjustedTime >= parsedLyrics[i].time) {
        index = i;
      } else {
        break;
      }
    }
    return index;
  }, [parsedLyrics, currentTime]);

  const handleScrollInteraction = () => {
    setIsAutoScrolling(false);
    lastUserInteraction.current = Date.now();
  };

  useEffect(() => {
    const checkInteraction = setInterval(() => {
      if (!isAutoScrolling && Date.now() - lastUserInteraction.current > 4000) {
        setIsAutoScrolling(true);
      }
    }, 1000);
    return () => clearInterval(checkInteraction);
  }, [isAutoScrolling]);

  // FIXED: Precision Auto-scroll "Pursuit" logic using native browser centering
  useEffect(() => {
    if (isAutoScrolling && activeIndex !== -1 && scrollRef.current) {
      const activeElement = scrollRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }, [activeIndex, isAutoScrolling]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="absolute inset-0 z-40 bg-black/90 backdrop-blur-2xl rounded-[40px] p-4 md:p-8 flex flex-col border border-white/10 shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0 bg-white/5 p-3 rounded-3xl border border-white/5 relative z-30">
        <div className="flex items-center gap-4 min-w-0 flex-1 px-1">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="relative shrink-0"
          >
            <div className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-full" />
            <img
              src={coverUrl || 'https://picsum.photos/200/200'}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-emerald-500/50 relative z-10"
              alt="Cover"
            />
          </motion.div>

          <div className="min-w-0 flex-1">
            <h3 className="font-black text-sm md:text-base text-white italic truncate uppercase">{title}</h3>
            <p className="text-[8px] text-emerald-500 font-black tracking-widest uppercase opacity-80">{artist}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-all">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Lyrics container with CSS Mask for professional fade */}
      <div className="flex-grow relative overflow-hidden group">
        <div
          ref={scrollRef}
          onWheel={handleScrollInteraction}
          onTouchStart={handleScrollInteraction}
          className="h-full w-full overflow-y-auto pr-2 lyrics-scroll relative pb-96 pt-32 scroll-smooth"
          style={{
            willChange: 'scroll-position',
            position: 'relative',
            maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)'
          }}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-emerald-500/50">
              <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <p className="text-[9px] font-black uppercase tracking-widest">Sincronizando...</p>
            </div>
          ) : parsedLyrics ? (
            <div className="flex flex-col items-center gap-14 py-20 px-4">
              {parsedLyrics.map((line, idx) => {
                const isActive = idx === activeIndex;
                const hasTranslation = translatedLines[idx] && translatedLines[idx].trim() !== "";
                
                return (
                  <motion.div
                    key={idx}
                    data-active={isActive ? "true" : "false"}
                    onClick={() => {
                      onSeek(Math.max(0, line.time - 0.1));
                      setIsAutoScrolling(true);
                    }}
                    animate={{
                      opacity: isActive ? 1 : 0.3,
                      scale: isActive ? 1.05 : 0.95,
                      filter: isActive ? 'blur(0px)' : 'blur(0.4px)'
                    }}
                    transition={{ duration: 0.5 }}
                    className={`cursor-pointer transition-all text-center w-full px-4`}
                  >
                    <p className={`font-black text-xl md:text-3xl lg:text-4xl leading-snug tracking-tight ${isActive ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]' : 'text-white/60'
                      }`}>
                      {line.text}
                    </p>
                    {hasTranslation && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`text-[0.5em] md:text-[0.45em] font-bold italic mt-2 uppercase tracking-widest ${isActive ? 'text-white/60' : 'text-white/30'}`}
                      >
                        {translatedLines[idx]}
                      </motion.p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center text-white/10 uppercase font-black text-sm tracking-widest">
              {lyrics?.plain ? lyrics.plain : "Sin letras"}
            </div>
          )}
        </div>
      </div>

      {!isAutoScrolling && (
        <button
          onClick={() => setIsAutoScrolling(true)}
          className="absolute bottom-12 right-12 bg-emerald-600 text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl z-40 animate-pulse border border-emerald-400/20 active:scale-95"
        >
          Retomar Sincronización
        </button>
      )}

      <div className="mt-4 pt-4 border-t border-white/5 text-center flex flex-col gap-1 items-center">
        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest italic">MUSICSCRIPT LYRICS SYSTEM v3.0</p>
        <p className="text-[7px] font-bold text-emerald-500/30 uppercase tracking-[0.2em]">Powered by LYRICS.OVH & LRCLIB</p>
      </div>
    </motion.div>
  );
};

export default LyricsDisplay;
