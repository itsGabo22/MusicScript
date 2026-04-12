import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Info, Sparkles } from 'lucide-react';

interface PlayerProps {
  player: any;
  isDark?: boolean;
}

const IpodPlayer: React.FC<PlayerProps> = ({ player, isDark = false }) => {
  const { currentSong, isPlaying, togglePlay, next, prev, currentTime, duration } = player;
  const [showMenu, setShowMenu] = useState(false);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Formatting for LCD look
  const formatLCDTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full flex items-center justify-center p-4">
      {/* Responsive Scaling Wrapper */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`
          w-[320px] sm:w-[340px] h-[520px] sm:h-[540px] rounded-[50px] p-7 flex flex-col items-center select-none
          transition-colors duration-700 overflow-hidden
          ${isDark 
            ? 'bg-gradient-to-br from-zinc-800 to-zinc-950 shadow-[0_40px_100px_-15px_rgba(0,0,0,0.8)] border-t border-white/10' 
            : 'bg-zinc-200 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] border-t-4 border-white/60'}
          ring-2 ring-black/20
        `}
      >
          {/* Internal reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />

          {/* Screen LCD Panel */}
          <div className={`
            w-full h-48 sm:h-52 rounded-xl border-[6px] p-5 flex flex-col relative overflow-hidden transition-all duration-500
            ${isDark 
              ? 'bg-[#0a0a0a] border-zinc-800 shadow-[0_0_20px_rgba(34,211,238,0.1)]' 
              : 'bg-[#b8c5b0] border-zinc-700 shadow-lcd-inner'}
          `}>
              {/* Scanline Effect */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
              
              <div className={`
                flex justify-between items-center text-[9px] font-black tracking-widest uppercase mb-2
                ${isDark ? 'text-cyan-400 opacity-80' : 'text-zinc-900 opacity-60'}
              `}>
                  <span>MusicScript</span>
                  <div className={`flex items-center gap-1 ${isDark ? 'text-cyan-400' : 'text-zinc-900'}`}>
                     <div className={`w-4 h-2 border rounded-sm relative ${isDark ? 'border-cyan-400/50' : 'border-zinc-900'}`}>
                        <div className={`h-full w-3/4 ${isDark ? 'bg-cyan-400' : 'bg-zinc-900'}`} />
                        <div className={`absolute -right-1 top-0.5 w-0.5 h-1 ${isDark ? 'bg-cyan-400' : 'bg-zinc-900'}`} />
                     </div>
                  </div>
              </div>

              <div className="flex-grow flex flex-col items-center justify-center gap-1 text-center">
                  <AnimatePresence mode="wait">
                    {currentSong ? (
                       <motion.div 
                         key={currentSong.id}
                         initial={{ x: 10, opacity: 0 }}
                         animate={{ x: 0, opacity: 1 }}
                         exit={{ x: -10, opacity: 0 }}
                         className="w-full flex flex-col items-center"
                       >
                          <p className={`font-black text-lg sm:text-xl truncate w-full italic tracking-tighter ${isDark ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]' : 'text-zinc-900'}`}>
                            {currentSong.title}
                          </p>
                          <p className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-widest opacity-70 mb-2 ${isDark ? 'text-cyan-500' : 'text-zinc-800'}`}>
                            {currentSong.artist}
                          </p>
                          
                          {currentSong.coverUrl && (
                            <div className="relative group">
                              <img 
                                src={currentSong.coverUrl} 
                                alt="cover" 
                                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-sm border shadow-lg transition-all ${isDark ? 'border-cyan-900/40 grayscale group-hover:grayscale-0' : 'border-zinc-900/40 opacity-80'}`} 
                              />
                            </div>
                          )}
                       </motion.div>
                    ) : (
                      <p className={`text-xs font-black uppercase tracking-widest italic opacity-40 ${isDark ? 'text-cyan-900' : 'text-zinc-800'}`}>
                        Inserte Disco
                      </p>
                    )}
                  </AnimatePresence>
              </div>

              {/* Progress Bar & Counter */}
              <div className="mt-2">
                <div className="flex justify-between text-[8px] font-black mb-1 tabular-nums opacity-60">
                   <span className={isDark ? 'text-cyan-400' : 'text-zinc-900'}>{formatLCDTime(currentTime)}</span>
                   <span className={isDark ? 'text-cyan-400' : 'text-zinc-900'}>{formatLCDTime(duration)}</span>
                </div>
                <div className={`w-full h-2 rounded-full p-[1px] border ${isDark ? 'bg-cyan-950/20 border-cyan-900/30' : 'bg-zinc-900/10 border-zinc-900/30'}`}>
                  <motion.div 
                    animate={{ width: `${progress}%` }}
                    className={`h-full rounded-full ${isDark ? 'bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-zinc-900'}`} 
                  />
                </div>
              </div>
          </div>

          {/* Click Wheel Area */}
          <div className="mt-8 sm:mt-12 group">
            <div className={`
              w-48 h-48 sm:w-56 sm:h-56 rounded-full relative flex items-center justify-center transition-all duration-500
              ${isDark 
                ? 'bg-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_2px_5px_rgba(255,255,255,0.05)] border border-white/5' 
                : 'bg-white shadow-retro-wheel border border-zinc-300'}
            `}>
                {/* Center Select Button */}
                <button 
                  onClick={togglePlay}
                  className={`
                    w-20 h-20 sm:w-22 sm:h-22 rounded-full border z-10 active:scale-90 transition-all outline-none flex items-center justify-center
                    shadow-md
                    ${isDark 
                      ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700 active:from-zinc-900 active:to-black' 
                      : 'bg-gradient-to-br from-white to-zinc-200 border-zinc-300 active:bg-zinc-300'}
                  `}
                >
                   {isPlaying ? (
                     <Pause className={`w-6 h-6 fill-current ${isDark ? 'text-cyan-400' : 'text-zinc-700'}`} />
                   ) : (
                     <Play className={`w-6 h-6 fill-current ml-1 ${isDark ? 'text-cyan-400' : 'text-zinc-700'}`} />
                   )}
                </button>
                
                {/* Wheel Controls */}
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className={`absolute top-6 font-black text-[9px] sm:text-[10px] tracking-[0.3em] uppercase transition-colors ${isDark ? 'text-zinc-600 hover:text-cyan-400' : 'text-zinc-400 hover:text-zinc-900'}`}
                >
                  MENU
                </button>
                
                <button 
                  onClick={prev}
                  className={`absolute left-6 transition-all active:scale-75 ${isDark ? 'text-zinc-700 hover:text-cyan-400' : 'text-zinc-400 hover:text-zinc-900'}`}
                >
                  <SkipBack className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                </button>

                <button 
                  onClick={next}
                  className={`absolute right-6 transition-all active:scale-75 ${isDark ? 'text-zinc-700 hover:text-cyan-400' : 'text-zinc-400 hover:text-zinc-900'}`}
                >
                  <SkipForward className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                </button>

                <div className={`absolute bottom-6 flex gap-1 opacity-20 group-hover:opacity-100 transition-opacity ${isDark ? 'text-cyan-400' : 'text-zinc-400'}`}>
                   <Info className="w-3 h-3" />
                   <Sparkles className="w-3 h-3" />
                </div>
            </div>
          </div>

          <div className={`mt-6 sm:mt-8 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.5em] italic transition-colors ${isDark ? 'text-cyan-500/40' : 'text-black/20'}`}>
             {isDark ? 'Black Edition' : 'Classic Mono'}
          </div>
      </motion.div>
    </div>
  );
};

export default IpodPlayer;
