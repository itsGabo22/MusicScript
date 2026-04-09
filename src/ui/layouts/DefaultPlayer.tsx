import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Plus, Trash2, Music } from 'lucide-react';
import type { Song } from '../../core/entities/Song';

interface PlayerProps {
  player: any; // Using any for brevity in this setup, ideally type it
}

const DefaultPlayer: React.FC<PlayerProps> = ({ player }) => {
  const { 
    songs, 
    currentSong, 
    isPlaying, 
    currentTime, 
    duration, 
    togglePlay, 
    next, 
    prev, 
    addSongs, 
    removeSong, 
    selectSong, 
    seek 
  } = player;

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 bg-white dark:bg-black/60 backdrop-blur-3xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden p-8 border border-slate-100 dark:border-white/10 transition-all duration-500">
      
      {/* Left: Now Playing */}
      <div className="md:col-span-1 flex flex-col items-center">
        <div className="relative w-64 h-64 mb-6 group">
          <img 
            src={currentSong?.coverUrl || 'https://picsum.photos/400/400'} 
            alt="Cover" 
            className={`w-full h-full object-cover rounded-2xl shadow-xl transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}
          />
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Play className="w-12 h-12 text-white fill-current" />
            </div>
          )}
        </div>
        
        <h2 className="text-2xl font-black text-center truncate w-full text-slate-900 dark:text-white uppercase tracking-tight">{currentSong?.title || 'No Song Selected'}</h2>
        <p className="text-emerald-600 dark:text-emerald-400 font-bold mb-6 tracking-wide">{currentSong?.artist || 'Unknown'}</p>

        {/* Controls */}
        <div className="flex items-center gap-6 mb-8">
          <button onClick={prev} className="p-3 text-slate-900 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 rounded-full transition-all">
            <SkipBack className="w-7 h-7 fill-current" />
          </button>
          <button 
            onClick={togglePlay}
            className="w-16 h-16 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 dark:hover:bg-emerald-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-90"
          >
            {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
          </button>
          <button onClick={next} className="p-3 text-slate-900 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 rounded-full transition-all">
            <SkipForward className="w-7 h-7 fill-current" />
          </button>
        </div>

        {/* Progress */}
        <div className="w-full">
          <input 
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between mt-2 text-xs font-mono font-black text-slate-900 dark:text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Right: Playlist */}
      <div className="md:col-span-2 flex flex-col h-[500px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-wider">
            <Music className="w-6 h-6 text-emerald-600" />
            Playlist
          </h3>
          <label className="flex items-center gap-2 bg-slate-900 dark:bg-emerald-900/40 text-white dark:text-emerald-100 px-5 py-2.5 rounded-2xl cursor-pointer hover:bg-emerald-700 dark:hover:bg-emerald-800 transition-all font-bold text-sm shadow-md">
            <Plus className="w-4 h-4" />
            <span>Add Music</span>
            <input type="file" multiple className="hidden" accept="audio/*" onChange={(e) => e.target.files && addSongs(e.target.files)} />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar">
          {songs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
              <Music className="w-16 h-16 mb-4 opacity-10" />
              <p className="font-bold uppercase tracking-widest text-sm opacity-50">Empty Library</p>
            </div>
          ) : (
            <div className="space-y-3">
              {songs.map((song: Song) => (
                <div 
                  key={song.id}
                  onClick={() => selectSong(song.id)}
                  className={`group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
                    currentSong?.id === song.id 
                    ? 'bg-emerald-50/80 dark:bg-emerald-900/40 border-2 border-emerald-500/20 dark:border-emerald-500/10 shadow-[0_4px_20px_rgba(16,185,129,0.1)]' 
                    : 'bg-slate-50/30 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:translate-x-1'
                  }`}
                >
                  <div className="relative">
                    <img src={song.coverUrl} alt="" className="w-14 h-14 rounded-xl object-cover shadow-lg" />
                    {currentSong?.id === song.id && isPlaying && (
                      <div className="absolute inset-0 bg-emerald-500/20 rounded-xl animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-black text-base truncate ${currentSong?.id === song.id ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-900 dark:text-slate-300'}`}>{song.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight">{song.artist}</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeSong(song.id); }}
                    className="opacity-0 group-hover:opacity-100 p-2.5 text-slate-400 hover:text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DefaultPlayer;
