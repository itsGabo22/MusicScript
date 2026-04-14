import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, ListX } from 'lucide-react';

interface DeleteTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLibrary: () => void;
  onConfirmPlaylist?: () => void;
  songTitle?: string;
  isFromPlaylist?: boolean;
}

const DeleteTrackModal: React.FC<DeleteTrackModalProps> = ({
  isOpen,
  onClose,
  onConfirmLibrary,
  onConfirmPlaylist,
  songTitle,
  isFromPlaylist
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative w-full max-w-md bg-[var(--bg-glass)] backdrop-blur-3xl border border-white/10 rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            <div className="h-2 w-full bg-red-600" />
            
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-5 mb-8">
                <div className="p-4 bg-red-500/10 rounded-2xl text-red-500 ring-1 ring-red-500/20">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[var(--text-main)] italic uppercase tracking-tighter leading-none">Confirmar Acción</h3>
                  <p className="text-[10px] font-black text-red-500/80 uppercase tracking-widest mt-1">Esta acción es irreversible</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-10">
                <p className="text-[var(--text-main)] font-black italic uppercase text-sm">
                  ¿Qué deseas hacer con esta canción?
                </p>
                <p className="text-[var(--text-muted)] font-bold text-xs leading-relaxed bg-black/5 p-4 rounded-2xl border border-white/5">
                   "{songTitle || 'Esta canción'}"
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                {isFromPlaylist && onConfirmPlaylist && (
                  <button
                    onClick={onConfirmPlaylist}
                    className="group w-full flex items-center justify-center gap-4 py-5 bg-white/5 hover:bg-white/10 text-[var(--text-main)] rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 border border-white/5"
                  >
                    <ListX className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
                    <span>Solo quitar de la Playlist</span>
                  </button>
                )}
                
                <button
                  onClick={onConfirmLibrary}
                  className="group w-full flex items-center justify-center gap-4 py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-xl shadow-red-600/20"
                >
                  <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Eliminar de todo el Sistema</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-4 text-[var(--text-muted)] font-black uppercase tracking-widest text-[9px] hover:text-[var(--text-main)] transition-colors mt-2"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteTrackModal;
