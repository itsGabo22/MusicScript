import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Circle } from 'lucide-react';

interface PlayerProps {
  player: any;
}

const CassettePlayer: React.FC<PlayerProps> = ({ player }) => {
  const { currentSong, isPlaying, togglePlay, next, prev } = player;

  return (
    <motion.div 
      initial={{ scale: 0.8, rotate: -2, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      className="relative w-[500px] h-[320px] bg-gradient-to-br from-zinc-800 to-black rounded-lg shadow-2xl p-4 border-4 border-zinc-700 overflow-hidden group"
    >
      {/* Cassette Texture/Label */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
      
      <div className="relative z-10 w-full h-full border-2 border-zinc-600 rounded flex flex-col items-center p-4">
        {/* Label Area */}
        <div className="w-full h-16 bg-white/10 backdrop-blur-sm rounded border border-white/20 flex items-center justify-between px-6 mb-8 mt-2">
          <div className="flex-1 overflow-hidden">
             <p className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1 italic">Side A - Stereo</p>
             <h3 className="text-lg font-black text-white truncate uppercase tracking-tighter">{currentSong?.title || 'No Tape Inserted'}</h3>
          </div>
          <div className="flex gap-2">
             <div className="w-8 h-8 rounded-full border border-emerald-500/30 flex items-center justify-center">
                <span className="text-[10px] font-bold text-emerald-500">60</span>
             </div>
          </div>
        </div>

        {/* Wheels Area */}
        <div className="flex justify-between w-64 items-center mb-10">
          <div className="relative group">
            <motion.div 
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="w-20 h-20 bg-zinc-900 rounded-full border-4 border-zinc-700 flex items-center justify-center shadow-inner"
            >
              <div className="w-12 h-12 border-2 border-dashed border-zinc-600 rounded-full" />
              <div className="absolute w-2 h-2 bg-emerald-500 rounded-full top-2" />
            </motion.div>
          </div>

          {/* Window to see tape */}
          <div className="w-24 h-16 bg-black/40 rounded-lg border border-zinc-700 flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
             <div className="w-20 h-1 bg-zinc-600 rounded-full animate-pulse opacity-20" />
          </div>

          <div className="relative group">
            <motion.div 
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="w-20 h-20 bg-zinc-900 rounded-full border-4 border-zinc-700 flex items-center justify-center shadow-inner"
            >
              <div className="w-12 h-12 border-2 border-dashed border-zinc-600 rounded-full" />
              <div className="absolute w-2 h-2 bg-emerald-500 rounded-full bottom-2" />
            </motion.div>
          </div>
        </div>

        {/* Bottom Controls (The 'Buttons' of the deck) */}
        <div className="absolute bottom-4 flex gap-4">
          <button onClick={prev} className="p-2 text-zinc-500 hover:text-emerald-400 hover:bg-white/5 rounded transition-all active:translate-y-1">
            <SkipBack className="w-6 h-6 fill-current" />
          </button>
          <button 
            onClick={togglePlay}
            className="p-3 bg-zinc-700 hover:bg-emerald-600 text-white rounded-lg shadow-lg transition-all active:translate-y-1"
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
          </button>
          <button onClick={next} className="p-2 text-zinc-500 hover:text-emerald-400 hover:bg-white/5 rounded transition-all active:translate-y-1">
            <SkipForward className="w-6 h-6 fill-current" />
          </button>
        </div>
      </div>

      {/* Screws */}
      <div className="absolute top-2 left-2"><Circle className="w-3 h-3 text-zinc-700" /></div>
      <div className="absolute top-2 right-2"><Circle className="w-3 h-3 text-zinc-700" /></div>
      <div className="absolute bottom-2 left-2"><Circle className="w-3 h-3 text-zinc-700" /></div>
      <div className="absolute bottom-2 right-2"><Circle className="w-3 h-3 text-zinc-700" /></div>
    </motion.div>
  );
};

export default CassettePlayer;
