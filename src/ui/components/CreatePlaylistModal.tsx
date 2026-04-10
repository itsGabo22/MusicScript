import React, { useState } from 'react';
import { X, Plus, ListMusic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim());
      setName('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border border-white/10"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                    <ListMusic className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-black uppercase text-[var(--text-main)] italic tracking-tighter leading-none">Nueva Playlist</h2>
                </div>
                <button onClick={onClose} className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1">Nombre de la Colección</label>
                  <input 
                    autoFocus
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Mi Playlist Épica"
                    className="w-full bg-slate-100 dark:bg-white/5 border border-transparent focus:border-emerald-500/30 rounded-2xl p-5 text-lg font-bold text-[var(--text-main)] placeholder:text-[var(--text-muted)]/30 outline-none transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={!name.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3"
                >
                  <Plus className="w-5 h-5" />
                  Crear Playlist
                </button>
              </form>
            </div>
            
            <div className="bg-emerald-500/5 p-4 text-center">
              <p className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-[0.1em]">La música es el lenguaje universal</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreatePlaylistModal;
