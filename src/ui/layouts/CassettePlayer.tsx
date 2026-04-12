import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Circle } from 'lucide-react';

interface PlayerProps {
  player: any;
}

const CassettePlayer: React.FC<PlayerProps> = ({ player }) => {
  const { currentSong, isPlaying, togglePlay, next, prev, currentTime } = player;

  // Format time for 7-segment display (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative w-[540px] h-[340px] bg-cassette-plastic rounded-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] p-6 border-4 border-zinc-900 overflow-hidden group ring-1 ring-white/10"
    >
      {/* Heavy Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      <div className="relative z-10 w-full h-full border-2 border-zinc-800 rounded-lg flex flex-col items-center p-5 bg-gradient-to-b from-zinc-900/50 to-transparent">
        
        {/* Main Label Panel */}
        <div className="w-full h-24 bg-zinc-200 rounded border-2 border-zinc-900 flex flex-col overflow-hidden shadow-inner relative">
           <div className="bg-cassette-gold h-10 w-full flex items-center justify-between px-6 font-black italic text-zinc-900 text-lg tracking-tighter border-b-2 border-zinc-900/20">
              <span className="text-xl">STUDIO MASTER MK-II</span>
              <div className="flex items-center gap-2">
                 <span className="text-[10px] not-italic">HIGH BIAS</span>
                 <div className="w-6 h-6 rounded-full border-2 border-zinc-900 flex items-center justify-center text-[10px]">A</div>
              </div>
           </div>
           <div className="flex-grow p-3 flex items-center justify-between bg-zinc-100">
              <div className="flex-1 min-w-0 pr-4">
                 <h3 className="text-sm font-black text-zinc-900 truncate uppercase tracking-tight">
                    {currentSong?.title || 'No Tape Inserted'}
                 </h3>
                 <p className="text-[9px] font-bold text-zinc-600 truncate uppercase tracking-widest">
                    {currentSong?.artist || 'Unknown Artist'}
                 </p>
              </div>
              {/* Digital Counter */}
              <div className="bg-zinc-900 px-3 py-1 rounded border-2 border-zinc-700 shadow-lcd-inner">
                 <span className="text-emerald-500 font-mono font-black text-lg tracking-widest opacity-90 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">
                    {formatTime(currentTime)}
                 </span>
              </div>
           </div>
        </div>

        {/* The Tape window and Reels */}
        <div className="mt-8 flex justify-center items-center w-full gap-10">
           {/* Left Reel */}
           <div className="relative group">
              <motion.div 
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="w-24 h-24 bg-zinc-950 rounded-full border-[6px] border-zinc-800 flex items-center justify-center shadow-2xl relative"
              >
                 <div className="w-16 h-16 border-4 border-dashed border-zinc-600/30 rounded-full" />
                 <div className="absolute w-3 h-10 bg-zinc-800 rounded-full rotate-45 opacity-40" />
                 <div className="absolute w-10 h-3 bg-zinc-800 rounded-full -rotate-45 opacity-40" />
                 <div className="w-4 h-4 bg-zinc-700 rounded-full border-2 border-zinc-900 shadow-inner" />
              </motion.div>
           </div>

           {/* Central window */}
           <div className="w-28 h-20 bg-black/80 rounded-xl border-4 border-zinc-900 shadow-lcd-inner relative overflow-hidden flex items-center justify-center group-hover:bg-black/60 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-500/10 to-transparent pointer-events-none" />
              <div className="w-full h-1 bg-zinc-700/50 rounded-full blur-[1px] animate-pulse" />
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
                      className={`w-1.5 h-3 rounded-sm ${i > 4 ? 'bg-red-500' : 'bg-emerald-500'}`}
                    />
                 ))}
              </div>
           </div>

           {/* Right Reel */}
           <div className="relative group">
              <motion.div 
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="w-24 h-24 bg-zinc-950 rounded-full border-[6px] border-zinc-800 flex items-center justify-center shadow-2xl relative"
              >
                 <div className="w-16 h-16 border-4 border-dashed border-zinc-600/30 rounded-full" />
                 <div className="absolute w-3 h-10 bg-zinc-800 rounded-full -rotate-45 opacity-40" />
                 <div className="absolute w-10 h-3 bg-zinc-800 rounded-full rotate-45 opacity-40" />
                 <div className="w-4 h-4 bg-zinc-700 rounded-full border-2 border-zinc-900 shadow-inner" />
              </motion.div>
           </div>
        </div>

        {/* Buttons Deck */}
        <div className="absolute bottom-6 flex gap-10 items-center justify-center w-full px-12">
          <div className="flex gap-4">
            <button onClick={prev} className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-white rounded-md shadow-lg border-b-4 border-zinc-950 active:border-b-0 active:translate-y-1 transition-all">
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            
            <button 
              onClick={togglePlay}
              className={`w-16 h-12 flex items-center justify-center rounded-md shadow-xl transition-all border-b-4 active:border-b-0 active:translate-y-1 ${isPlaying ? 'bg-zinc-950 border-black text-white' : 'bg-zinc-800 border-zinc-950 text-zinc-400 hover:bg-zinc-700'}`}
            >
              {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current" />}
            </button>

            <button onClick={next} className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-white rounded-md shadow-lg border-b-4 border-zinc-950 active:border-b-0 active:translate-y-1 transition-all">
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>
          
          {/* Record button decoration - Separated */}
          <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-lg border border-zinc-800 shadow-inner">
             <Circle className="w-2.5 h-2.5 fill-red-600 text-red-600 animate-pulse" />
             <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Record</span>
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
        <div key={pos} className={`absolute ${pos} w-4 h-4 bg-zinc-800 rounded-full shadow-inner border border-black/50 flex items-center justify-center`}>
           <div className="w-[1px] h-full bg-black/20 rotate-45" />
        </div>
      ))}
    </motion.div>
  );
};

export default CassettePlayer;
