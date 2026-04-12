import React, { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Music2 } from 'lucide-react';

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
  const activeLineRef = useRef<HTMLParagraphElement>(null);

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
        const frac = parseInt(fracStr);
        const fracSeconds = fracStr.length === 2 ? frac / 100 : frac / 1000;
        const time = mins * 60 + secs + fracSeconds;
        const text = match[4].trim();
        if (text) result.push({ time, text });
      }
    });

    return result;
  }, [lyrics]);

  const activeIndex = useMemo(() => {
    if (!parsedLyrics) return -1;
    let index = -1;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (currentTime >= parsedLyrics[i].time) {
        index = i;
      } else {
        break;
      }
    }
    return index;
  }, [parsedLyrics, currentTime]);

  // FIXED: Improved auto-scroll logic to ensure the active line is centered
  useEffect(() => {
    if (activeIndex !== -1 && activeLineRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const element = activeLineRef.current;
      
      // Calculate target scroll position to center the element
      const elementRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      const relativeTop = element.offsetTop;
      const targetScroll = relativeTop - (container.clientHeight / 2) + (element.clientHeight / 2);
      
      container.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  }, [activeIndex]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="absolute inset-0 z-40 bg-black/95 backdrop-blur-3xl rounded-[40px] p-4 md:p-8 flex flex-col border border-white/10 shadow-2xl overflow-hidden"
    >
      {/* Header with Mini Disco Cover */}
      <div className="flex justify-between items-center mb-6 shrink-0 bg-white/5 p-3 rounded-3xl border border-white/5">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="relative shrink-0"
          >
            <div className="absolute inset-0 bg-emerald-500/30 blur-lg rounded-full" />
            <img
              src={coverUrl || 'https://picsum.photos/200/200'}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-emerald-500 shadow-xl relative z-10"
              alt="Mini Cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/200/200';
              }}
            />
            <div className="absolute inset-0 rounded-full border border-black/40 z-20" />
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-black rounded-full -translate-x-1/2 -translate-y-1/2 z-30 ring-2 ring-emerald-500" />
          </motion.div>

          <div className="min-w-0 flex-1 overflow-hidden px-2">
            <div className="whitespace-nowrap flex overflow-hidden">
               <h3 className="font-black text-sm md:text-lg text-white italic truncate w-full">
                  {title}
               </h3>
            </div>
            <p className="text-[9px] text-emerald-500 font-black tracking-[0.2em] uppercase opacity-80 truncate">{artist}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-all text-white/40 hover:text-white shrink-0 ml-2"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>

      {/* Lyrics area */}
      <div
        ref={scrollRef}
        className="flex-grow overflow-y-auto pr-2 scroll-smooth selection:bg-emerald-500/30 lyrics-scroll relative pb-64"
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-5 text-emerald-500/50">
            <div className="w-8 h-8 md:w-10 md:h-10 border-[3px] border-current border-t-transparent rounded-full animate-spin" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em] animate-pulse">Sintonizando...</p>
          </div>
        ) : parsedLyrics ? (
          <div className="py-[40%] flex flex-col items-center gap-10 md:gap-14">
            {parsedLyrics.map((line, idx) => {
              const isActive = idx === activeIndex;
              return (
                <motion.p
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => onSeek(Math.max(0, line.time - 0.2))}
                  animate={{
                    opacity: isActive ? 1 : (activeIndex > idx ? 0.2 : 0.35),
                    scale: isActive ? 1.05 : 0.95,
                    filter: isActive ? 'blur(0px)' : 'blur(0.5px)'
                  }}
                  className={`cursor-pointer transition-all duration-700 text-center font-black text-xl md:text-3xl lg:text-4xl leading-tight max-w-[90%] tracking-tight ${
                    isActive ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {line.text}
                </motion.p>
              );
            })}
          </div>
        ) : lyrics?.plain ? (
          <div className="whitespace-pre-wrap font-bold text-white/80 leading-[2.5] text-center text-base md:text-xl py-12 px-6 flex flex-col gap-6 opacity-70">
            {lyrics.plain.split('\n').map((l, i) => (
              <p key={i} className="hover:text-white transition-colors cursor-default">{l}</p>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center gap-6 text-white/10">
            <Music2 className="w-16 h-16" />
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] max-w-[220px] leading-relaxed">
              Sin letras disponibles.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 text-center shrink-0">
        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] italic">
          SYNCED BY OVH ECOSYSTEM
        </p>
      </div>
    </motion.div>
  );
};

export default LyricsDisplay;
