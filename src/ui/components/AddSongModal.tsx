import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Music, User, ListOrdered } from 'lucide-react';

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (file: File, metadata: { title: string, artist: string, position: 'start' | 'end' | number }) => void;
  playlistSize: number;
}

const AddSongModal: React.FC<AddSongModalProps> = ({ isOpen, onClose, onAdd, playlistSize }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [positionType, setPositionType] = useState<'start' | 'end' | 'index'>('end');
  const [index, setIndex] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      // Auto-fill title from filename
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    onAdd(file, {
      title,
      artist,
      position: positionType === 'index' ? index : positionType
    });

    // Reset and close
    setFile(null);
    setTitle('');
    setArtist('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-emerald-600">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Music className="w-6 h-6" />
                Add New Track
              </h3>
              <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* File Upload */}
              <div className="relative group">
                <input 
                  type="file" 
                  accept="audio/*" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  required={!file}
                />
                <div className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all ${file ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700 group-hover:border-emerald-400'}`}>
                  <Upload className={`w-10 h-10 ${file ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <p className="text-sm font-bold text-center text-slate-600 dark:text-slate-300">
                    {file ? file.name : 'Click or drop MP3 file here'}
                  </p>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Music className="w-3 h-3" /> Song Title
                  </label>
                  <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Bohemian Rhapsody"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3" /> Artist Name
                  </label>
                  <input 
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="e.g. Queen"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                  />
                </div>
              </div>

              {/* Position (Taller Req) */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <ListOrdered className="w-3 h-3" /> Insert Position
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'start', label: 'Start' },
                    { id: 'end', label: 'End' },
                    { id: 'index', label: 'Specific Pos' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => setPositionType(pos.id as any)}
                      className={`p-3 text-xs font-bold rounded-xl border transition-all ${positionType === pos.id ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200 dark:shadow-none' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-300'}`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
                
                {positionType === 'index' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Index (0 to {playlistSize}):</span>
                    <input 
                      type="number"
                      min="0"
                      max={playlistSize}
                      value={index}
                      onChange={(e) => setIndex(parseInt(e.target.value))}
                      className="w-20 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                    />
                  </motion.div>
                )}
              </div>

              <button 
                type="submit"
                disabled={!file}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-100 dark:shadow-none transition-all active:scale-[0.98]"
              >
                Save to Library
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddSongModal;
