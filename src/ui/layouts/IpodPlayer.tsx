import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlayerProps {
  player: any;
}

const IpodPlayer: React.FC<PlayerProps> = ({ player }) => {
  const { currentSong, isPlaying, togglePlay, next, prev } = player;

  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative w-80 h-[500px] bg-gradient-to-br from-[#f8fafc] via-[#e2e8f0] to-[#94a3b8] dark:from-[#1e293b] dark:via-[#0f172a] dark:to-[#020617] rounded-[50px] shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] dark:shadow-[10px_10px_30px_#000] p-6 flex flex-col items-center border-[6px] border-[#CBD5E1] dark:border-[#1e293b]"
    >
      {/* Screen Container */}
      <div className="w-full h-48 bg-[#a8dadc] dark:bg-[#1a2e2e] rounded-lg shadow-inner mb-8 p-4 flex flex-col items-center justify-center overflow-hidden border-4 border-[#457b9d] dark:border-[#064e3b] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-white/10 pointer-events-none" />
        
        {currentSong ? (
          <div className="flex flex-col items-center w-full relative z-10">
            <img 
              src={currentSong.coverUrl} 
              alt="" 
              className={`w-24 h-24 mb-3 rounded-lg shadow-lg border border-black/10 transition-transform ${isPlaying ? 'scale-105' : 'scale-100'}`} 
            />
            <div className="text-center w-full">
              <p className="text-sm font-bold truncate text-slate-800 dark:text-emerald-300 px-2 leading-tight">{currentSong.title}</p>
              <p className="text-[10px] text-slate-600 dark:text-emerald-500/80 font-mono truncate uppercase tracking-tighter">{currentSong.artist}</p>
            </div>
            {/* Minimal Progress Bar */}
            <div className="w-full h-2 bg-black/10 dark:bg-black/40 mt-3 rounded-full overflow-hidden border border-black/5">
               <motion.div 
                animate={{ width: `${(player.currentTime / player.duration) * 100}%` }}
                className="h-full bg-emerald-600 dark:bg-emerald-400"
               />
            </div>
          </div>
        ) : (
          <div className="text-center relative z-10">
            <Menu className="w-8 h-8 mx-auto text-slate-500/50 mb-2" />
            <p className="text-xs font-mono text-slate-600 dark:text-emerald-600/50">MusicScript v1.0</p>
          </div>
        )}
      </div>

      {/* Click Wheel Area */}
      <div 
        onWheel={(e) => {
          if (e.deltaY > 0) next();
          else prev();
        }}
        className="relative w-56 h-56 bg-white dark:bg-slate-900 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex items-center justify-center border-4 border-[#f1f5f9] dark:border-[#1e293b] cursor-ns-resize group"
      >
        <div className="absolute inset-0 rounded-full group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors pointer-events-none" />
        
        {/* Wheel Buttons */}
        <button 
          onClick={() => {}} 
          className="absolute top-4 text-slate-800 dark:text-slate-600 font-black text-xs uppercase hover:text-emerald-600 transition-colors"
        >
          Menu
        </button>
        
        <button 
          onClick={next}
          className="absolute right-4 text-slate-800 dark:text-slate-600 hover:text-emerald-600 transition-colors"
        >
          <SkipForward className="w-6 h-6 fill-current shadow-sm" />
        </button>

        <button 
          onClick={prev}
          className="absolute left-4 text-slate-800 dark:text-slate-600 hover:text-emerald-600 transition-colors"
        >
          <SkipBack className="w-6 h-6 fill-current shadow-sm" />
        </button>

        <button 
          onClick={togglePlay}
          className="absolute bottom-4 text-slate-800 dark:text-slate-600 hover:text-emerald-600 transition-colors"
        >
          <div className="flex gap-1 justify-center items-center">
            <Play className="w-3 h-3 fill-current" />
            <Pause className="w-3 h-3 fill-current" />
          </div>
        </button>

        {/* Center Button */}
        <button 
          onClick={togglePlay}
          className="w-20 h-20 bg-gradient-to-br from-white to-[#e2e8f0] dark:from-[#334155] dark:to-[#0f172a] rounded-full shadow-md border-2 border-slate-200 dark:border-slate-800 active:scale-95 transition-transform"
        />
      </div>

      <div className="mt-8 text-[11px] font-mono font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">
        iPod
      </div>
    </motion.div>
  );
};

export default IpodPlayer;
