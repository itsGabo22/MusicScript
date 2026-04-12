import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Circle, Database, Sparkles } from 'lucide-react';

interface PlayerProps {
  player: any;
  isDark?: boolean;
}

const CassettePlayer: React.FC<PlayerProps> = ({ player, isDark = false }) => {
  const { currentSong, isPlaying, togglePlay, next, prev, currentTime } = player;

  // Format time for 7-segment display (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full flex items-center justify-center p-4">
      {/* Responsive Scaling Wrapper */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`
          relative w-[340px] sm:w-[540px] h-[480px] sm:h-[340px] rounded-2xl p-6 border-4 flex flex-col items-center overflow-hidden group 
          transition-all duration-700
          ${isDark 
            ? 'bg-zinc-900 border-zinc-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)]' 
            : 'bg-zinc-100 border-zinc-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)]'}
        `}
      >
        {/* Heavy Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        
        <div className={`
          relative z-10 w-full h-full border-2 rounded-lg flex flex-col items-center p-4 sm:p-5 transition-colors
          ${isDark ? 'border-zinc-800 bg-gradient-to-b from-black/60 to-transparent' : 'border-zinc-800 bg-gradient-to-b from-zinc-900/50 to-transparent'}
        `}>
          
          {/* Main Label Panel */}
          <div className={`
            w-full h-24 rounded border-2 flex flex-col overflow-hidden shadow-inner relative transition-all duration-500
            ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-200 border-zinc-900'}
          `}>
             <div className={`
               h-10 w-full flex items-center justify-between px-6 font-black italic text-lg tracking-tighter border-b-2
               ${isDark ? 'bg-zinc-900 text-emerald-500 border-zinc-800' : 'bg-[#eab308] text-zinc-900 border-zinc-900/20'}
             `}>
                <span className="text-sm sm:text-xl">{isDark ? 'DARK SMOKE MK-III' : 'STUDIO MASTER MK-II'}</span>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] not-italic hidden sm:inline">HIGH BIAS</span>
                   <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] ${isDark ? 'border-emerald-500' : 'border-zinc-900'}`}>B</div>
                </div>
             </div>
             <div className={`flex-grow p-3 flex items-center justify-between transition-colors ${isDark ? 'bg-zinc-900/50' : 'bg-zinc-100'}`}>
                <div className="flex-1 min-w-0 pr-4">
                   <h3 className={`text-xs sm:text-sm font-black truncate uppercase tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                      {currentSong?.title || 'No Tape Inserted'}
                   </h3>
                   <p className={`text-[8px] sm:text-[9px] font-bold truncate uppercase tracking-widest ${isDark ? 'text-emerald-500/50' : 'text-zinc-600'}`}>
                      {currentSong?.artist || 'Unknown Artist'}
                   </p>
                </div>
                {/* Digital Counter */}
                <div className={`bg-black px-3 py-1 rounded border-2 shadow-lcd-inner ${isDark ? 'border-emerald-900/50' : 'border-zinc-700'}`}>
                   <span className={`font-mono font-black text-base sm:text-lg tracking-widest opacity-90 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)] ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`}>
                      {formatTime(currentTime)}
                   </span>
                </div>
             </div>
          </div>

          {/* The Tape window and Reels */}
          <div className="mt-4 sm:mt-8 flex justify-center items-center w-full gap-4 sm:gap-10">
             {/* Left Reel */}
             <div className="relative group scale-75 sm:scale-100">
                <motion.div 
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ repeat: Infinity, duration: isPlaying ? 4 : 0, ease: "linear" }}
                  className={`w-20 sm:w-24 h-20 sm:h-24 rounded-full border-[6px] flex items-center justify-center shadow-2xl relative transition-colors ${isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-zinc-950 border-zinc-800'}`}
                >
                   <div className={`w-14 sm:w-16 h-14 sm:h-16 border-4 border-dashed rounded-full ${isDark ? 'border-emerald-500/20' : 'border-zinc-600/30'}`} />
                   <div className="absolute w-2 sm:w-3 h-8 sm:h-10 bg-zinc-800 rounded-full rotate-45 opacity-40" />
                   <div className="w-4 h-4 bg-zinc-700 rounded-full border-2 border-zinc-900 shadow-inner" />
                </motion.div>
             </div>

             {/* Central window */}
             <div className={`w-24 sm:w-28 h-16 sm:h-20 rounded-xl border-4 shadow-lcd-inner relative overflow-hidden flex items-center justify-center transition-all ${isDark ? 'bg-emerald-950/20 border-zinc-800' : 'bg-black/80 border-zinc-900'}`}>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-500/10 to-transparent pointer-events-none" />
                <div className={`w-full h-1 rounded-full blur-[1px] ${isPlaying ? 'animate-pulse bg-emerald-500' : 'bg-zinc-700'}`} />
                {/* Small LED meter */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                   {[1,2,3,4,5].map(i => (
                      <motion.div 
                        key={i}
                        animate={{ 
                          opacity: isPlaying ? [0.2, 1, 0.2] : 0.2,
                          scale: isPlaying ? [1, 1.2, 1] : 1
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 0.2 + (i * 0.1), 
                          delay: i * 0.05 
                        }}
                        className={`w-1 sm:w-1.5 h-2 sm:h-3 rounded-sm ${i > 4 ? 'bg-red-500' : 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]'}`}
                      />
                   ))}
                </div>
             </div>

             {/* Right Reel */}
             <div className="relative group scale-75 sm:scale-100">
                <motion.div 
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ repeat: Infinity, duration: isPlaying ? 4 : 0, ease: "linear" }}
                  className={`w-20 sm:w-24 h-20 sm:h-24 rounded-full border-[6px] flex items-center justify-center shadow-2xl relative transition-colors ${isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-zinc-950 border-zinc-800'}`}
                >
                   <div className={`w-14 sm:w-16 h-14 sm:h-16 border-4 border-dashed rounded-full ${isDark ? 'border-emerald-500/20' : 'border-zinc-600/30'}`} />
                   <div className="absolute w-2 sm:w-3 h-8 sm:h-10 bg-zinc-800 rounded-full -rotate-45 opacity-40" />
                   <div className="w-4 h-4 bg-zinc-700 rounded-full border-2 border-zinc-900 shadow-inner" />
                </motion.div>
             </div>
          </div>

          {/* Buttons Deck */}
          <div className="mt-6 sm:mt-10 flex gap-4 sm:gap-10 items-center justify-center w-full px-4 sm:px-12">
            <div className="flex gap-2 sm:gap-4">
              <button onClick={prev} className={`p-2 sm:p-3 rounded-md shadow-lg border-b-4 active:border-b-0 active:translate-y-1 transition-all ${isDark ? 'bg-zinc-950 border-black text-emerald-900 hover:text-emerald-500' : 'bg-zinc-800 border-zinc-950 text-zinc-500 hover:text-white'}`}>
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </button>
              
              <button 
                onClick={togglePlay}
                className={`w-12 sm:w-16 h-10 sm:h-12 flex items-center justify-center rounded-md shadow-xl transition-all border-b-4 active:border-b-0 active:translate-y-1 ${isPlaying ? (isDark ? 'bg-emerald-900 border-emerald-950 text-white' : 'bg-zinc-950 border-black text-white') : (isDark ? 'bg-zinc-950 border-black text-zinc-600' : 'bg-zinc-800 border-zinc-950 text-zinc-400')}`}
              >
                {isPlaying ? <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-current" /> : <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />}
              </button>

              <button onClick={next} className={`p-2 sm:p-3 rounded-md shadow-lg border-b-4 active:border-b-0 active:translate-y-1 transition-all ${isDark ? 'bg-zinc-950 border-black text-emerald-900 hover:text-emerald-500' : 'bg-zinc-800 border-zinc-950 text-zinc-500 hover:text-white'}`}>
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </button>
            </div>
            
            {/* Record button decoration */}
            <div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border shadow-inner ${isDark ? 'bg-black/60 border-emerald-900/30' : 'bg-black/40 border-zinc-800'}`}>
               <Circle className={`w-2.5 h-2.5 fill-red-600 text-red-600 ${isPlaying ? 'animate-pulse' : 'opacity-40'}`} />
               <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-emerald-900' : 'text-zinc-500'}`}>IA READY</span>
            </div>
          </div>
        </div>

        {/* Industrial Screws */}
        {[
          "top-3 left-3",
          "top-3 right-3",
          "bottom-3 left-3",
          "bottom-3 right-3"
        ].map(pos => (
          <div key={pos} className={`absolute ${pos} w-4 h-4 rounded-full shadow-inner border flex items-center justify-center ${isDark ? 'bg-zinc-950 border-black/50' : 'bg-zinc-800 border-black/50'}`}>
             <div className="w-[1px] h-full bg-black/20 rotate-45" />
          </div>
        ))}

        <div className={`absolute bottom-2 right-6 text-[8px] font-bold uppercase tracking-widest opacity-20 pointer-events-none flex gap-2 ${isDark ? 'text-emerald-500' : 'text-zinc-900'}`}>
           <Database className="w-2 h-2" />
           <Sparkles className="w-2 h-2" />
           <span>High Fidelity AI Output</span>
        </div>
      </motion.div>
    </div>
  );
};

export default CassettePlayer;
