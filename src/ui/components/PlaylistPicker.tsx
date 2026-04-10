import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListMusic } from 'lucide-react';
import type { PlaylistRecord } from '../../infrastructure/persistence/MusicDatabase';

interface PlaylistPickerProps {
  isOpen: boolean;
  playlists: PlaylistRecord[];
  onSelect: (playlistId: string) => void;
  onClose: () => void;
  isAtBottom?: boolean;
}

const PlaylistPicker: React.FC<PlaylistPickerProps> = ({ 
  isOpen, 
  playlists, 
  onSelect, 
  onClose,
  isAtBottom 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[110]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-[var(--bg-glass)] backdrop-blur-3xl border border-[var(--border-color)] rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] z-[200] overflow-hidden p-2"
          >
            <div className="p-3 border-b border-[var(--border-color)] mb-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Guardar en Playlist</p>
            </div>
            
            <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
              {playlists.length === 0 ? (
                <p className="p-4 text-center text-xs text-[var(--text-muted)] font-bold uppercase italic">Sin playlists</p>
              ) : (
                playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => {
                      onSelect(playlist.id);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-emerald-500/10 text-[var(--text-main)] transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <ListMusic className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold truncate">{playlist.name}</span>
                  </button>
                )
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PlaylistPicker;
