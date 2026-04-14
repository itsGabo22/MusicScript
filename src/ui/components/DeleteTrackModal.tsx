import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X, ListX } from 'lucide-react';

interface DeleteTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteFromLibrary: () => void;
  onDeleteFromPlaylist: () => void;
  trackTitle: string;
  isPlaylistContext: boolean;
}

export const DeleteTrackModal: React.FC<DeleteTrackModalProps> = ({
  isOpen,
  onClose,
  onDeleteFromLibrary,
  onDeleteFromPlaylist,
  trackTitle,
  isPlaylistContext
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[var(--bg-glass)] backdrop-blur-3xl border border-[var(--border-color)] rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            <div className="h-2 w-full bg-red-600" />
            
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-red-500/10 text-red-500">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-[var(--text-main)] italic uppercase tracking-tighter leading-tight">Confirmar Eliminación</h3>
              </div>
              
              <p className="text-[var(--text-muted)] font-bold text-sm leading-relaxed mb-8">
                Estás a punto de eliminar <span className="text-[var(--text-main)]">"{trackTitle}"</span>. 
                {isPlaylistContext ? ' ¿Deseas removerla solo de esta playlist o borrarla permanentemente de toda tu biblioteca?' : ' ¿Estás seguro de que deseas borrarla permanentemente?'}
              </p>
              
              <div className="flex flex-col gap-3">
                {isPlaylistContext && (
                  <button
                    onClick={onDeleteFromPlaylist}
                    className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20"
                  >
                    <ListX className="w-5 h-5" />
                    <span>Quitar de Playlist</span>
                  </button>
                )}
                
                <button
                  onClick={onDeleteFromLibrary}
                  className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-500 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-red-500/20"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>{isPlaylistContext ? 'Borrar de Biblioteca' : 'Eliminar Permanentemente'}</span>
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all hover:bg-white/5 active:scale-95"
                >
                  Cancelar
                </button>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
