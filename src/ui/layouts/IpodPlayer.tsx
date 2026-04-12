import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Circle } from 'lucide-react';

interface PlayerProps {
  player: any;
}

const IpodPlayer: React.FC<PlayerProps> = ({ player }) => {
  const { currentSong, isPlaying, togglePlay, next, prev, currentTime, duration } = player;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-[340px] h-[540px] bg-ipod-silver rounded-[50px] p-7 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] flex flex-col items-center border-t-4 border-white/40 ring-1 ring-black/20"
    >
        {/* Screen LCD Panel */}
        <div className="w-full h-52 bg-ipod-screen rounded-xl border-[8px] border-zinc-700 shadow-lcd-inner p-5 flex flex-col relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            
            <div className="flex justify-between items-center text-[10px] font-black text-zinc-900 tracking-widest uppercase mb-2">
                <span className="opacity-60">MusicScript</span>
                <span className="flex items-center gap-1">
                   <div className="w-4 h-2 border border-zinc-900 rounded-sm relative">
                      <div className="h-full bg-zinc-900 w-3/4" />
                      <div className="absolute -right-1 top-0.5 w-0.5 h-1 bg-zinc-900" />
                   </div>
                </span>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center gap-2">
                {currentSong ? (
                   <>
                    <motion.p 
                      key={currentSong.id}
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="font-black text-xl text-zinc-900 truncate w-full text-center leading-tight tracking-tight italic"
                    >
                      {currentSong.title}
                    </motion.p>
                    <p className="text-[11px] text-zinc-800 font-bold uppercase tracking-widest opacity-70">
                      {currentSong.artist}
                    </p>
                    {/* Small cover preview on screen */}
                    {currentSong.coverUrl && (
                      <img 
                        src={currentSong.coverUrl} 
                        alt="cover" 
                        className="w-16 h-16 mt-2 rounded-sm border border-zinc-900/40 shadow-lg grayscale-[0.2]" 
                      />
                    )}
                   </>
                ) : (
                  <p className="text-sm font-bold text-zinc-800 opacity-40 uppercase tracking-widest italic">
                    Inserte Disco
                  </p>
                )}
            </div>

            {/* Retro Progress Bar */}
            <div className="w-full h-3 bg-zinc-900/10 rounded-full mt-4 p-[1.5px] border border-zinc-900/30">
                <motion.div 
                   animate={{ width: `${progress}%` }}
                   className="h-full bg-zinc-900 rounded-full" 
                />
            </div>
        </div>

        {/* Click Wheel Premium */}
        <div className="mt-12 w-56 h-56 bg-[#FAFAFA] rounded-full relative shadow-retro-wheel border border-zinc-300 flex items-center justify-center select-none group">
            {/* Center Select Button */}
            <button 
               onClick={togglePlay}
               className="w-22 h-22 bg-gradient-to-br from-white to-zinc-200 rounded-full border border-zinc-300 shadow-md z-10 active:scale-95 active:bg-zinc-300 transition-all outline-none"
            />
            
            <button 
              onClick={() => {}} 
              className="absolute top-6 text-zinc-400 font-black text-[10px] tracking-[0.3em] uppercase hover:text-zinc-600 transition-colors"
            >
              MENU
            </button>
            <button 
              onClick={togglePlay}
              className="absolute bottom-6 text-zinc-400 hover:text-zinc-600 transition-all active:scale-90"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
            <button 
              onClick={prev}
              className="absolute left-6 text-zinc-400 hover:text-zinc-600 transition-all active:scale-90"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <button 
              onClick={next}
              className="absolute right-6 text-zinc-400 hover:text-zinc-600 transition-all active:scale-90"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
        </div>

        <div className="mt-8 text-[11px] font-black text-white/50 uppercase tracking-[0.5em] italic">
           Classic
        </div>
    </motion.div>
  );
};

export default IpodPlayer;
