import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Music, User, ListOrdered, Loader2, Save } from 'lucide-react';
import { PlaylistLoader } from '../../infrastructure/loaders/PlaylistLoader';
import type { Song } from '../../core/entities/Song';

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (file: File, metadata: { title: string, artist: string, position: 'start' | 'end' | number }) => void;
  onEdit?: (id: string, metadata: Partial<Song>, position: 'start' | 'end' | number) => void;
  playlistSize: number;
  editTrack?: Song | null; // NEW: Track being edited
}

const AddSongModal: React.FC<AddSongModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  onEdit,
  playlistSize, 
  editTrack 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [positionType, setPositionType] = useState<'start' | 'end' | 'index'>('end');
  const [index, setIndex] = useState(0);

  // Sync state when entering edit mode
  useEffect(() => {
    if (editTrack && isOpen) {
      setTitle(editTrack.title);
      setArtist(editTrack.artist);
      setCoverUrl(editTrack.coverUrl || null);
      setFile(null); // No file change for edits (surgical)
      setPositionType('end'); // Reset position type for move
    } else if (isOpen) {
      // Clear for new song
      setTitle('');
      setArtist('');
      setCoverUrl(null);
      setFile(null);
    }
  }, [editTrack, isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setIsExtracting(true);

      try {
        const tags = await PlaylistLoader.extractTags(selectedFile);
        if (tags.title) setTitle(tags.title);
        else setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
        
        if (tags.artist) setArtist(tags.artist);
        if (tags.coverUrl) setCoverUrl(tags.coverUrl);
        else setCoverUrl(null);
      } catch (err) {
        console.error("Error extracting tags:", err);
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      } finally {
        setIsExtracting(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalPos = positionType === 'index' ? index : positionType;

    if (editTrack && onEdit) {
      onEdit(editTrack.id, { title, artist }, finalPos);
    } else if (file) {
      onAdd(file, {
        title,
        artist,
        position: finalPos
      });
    }

    onClose();
  };

  const isEditMode = !!editTrack;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            className="bg-[var(--bg-main)] w-full max-w-lg rounded-[40px] shadow-[0_32px_128px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10"
          >
            {/* Header */}
            <div className={`p-8 border-b border-white/5 flex justify-between items-center ${isEditMode ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
              <div>
                <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-3 italic uppercase tracking-tighter">
                  {isEditMode ? <Save className="w-6 h-6" /> : <Music className="w-6 h-6" />}
                  {isEditMode ? 'Editar Canción' : 'Nueva Canción'}
                </h3>
                <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em] mt-1 italic">
                  {isEditMode ? 'Ajusta los metadatos y el orden' : 'Añade una pista a la biblioteca'}
                </p>
              </div>
              <button onClick={onClose} className="p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* File Upload (Only for New) */}
              {!isEditMode && (
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="audio/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    required={!isEditMode}
                  />
                  <div className={`p-8 border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center gap-4 transition-all ${file ? 'border-emerald-500 bg-emerald-500/5' : 'border-[var(--border-color)] group-hover:border-emerald-500/50'}`}>
                    {isExtracting ? (
                      <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                    ) : file ? (
                      <div className="flex items-center gap-4 w-full">
                        <div className="w-16 h-16 rounded-[24px] bg-[var(--bg-card)] flex items-center justify-center overflow-hidden shrink-0 shadow-xl border border-white/5">
                          {coverUrl ? (
                            <img src={coverUrl} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <Music className="w-6 h-6 text-[var(--text-muted)]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-[var(--text-main)] truncate italic">{file.name}</p>
                          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Listo para subir</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-[var(--bg-card)] rounded-3xl flex items-center justify-center shadow-lg">
                          <Upload className="w-8 h-8 text-[var(--text-muted)]" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-black text-[var(--text-main)] uppercase tracking-tighter">Click para seleccionar</p>
                          <p className="text-[10px] text-[var(--text-muted)] mt-1 uppercase font-bold tracking-widest">Archivos MP3 o WAV</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Edit Preview for Mode Edit */}
              {isEditMode && (
                 <div className="flex items-center gap-6 p-6 bg-indigo-500/5 rounded-[32px] border border-indigo-500/10 mb-2">
                    <div className="w-20 h-20 rounded-[28px] overflow-hidden shadow-2xl border border-white/10 shrink-0">
                        {coverUrl ? (
                          <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center"><Music className="w-8 h-8 text-white/20" /></div>
                        )}
                    </div>
                    <div className="min-w-0">
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 italic">Edición Quirúrgica</p>
                       <h4 className="text-lg font-black text-[var(--text-main)] truncate italic uppercase">{editTrack?.title}</h4>
                    </div>
                 </div>
              )}

              {/* Metadata Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest flex items-center gap-2 italic">
                    <Music className="w-3.5 h-3.5" /> Título
                  </label>
                  <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Bohemian Rhapsody"
                    required
                    className="w-full p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-[var(--text-main)] font-bold text-sm"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest flex items-center gap-2 italic">
                    <User className="w-3.5 h-3.5" /> Artista
                  </label>
                  <input 
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="e.g. Queen"
                    required
                    className="w-full p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-[var(--text-main)] font-bold text-sm"
                  />
                </div>
              </div>

              {/* Position UI */}
              <div className="space-y-4 pt-2">
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest flex items-center gap-2 italic">
                  <ListOrdered className="w-3.5 h-3.5" /> Posición en Lista
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'start', label: 'Inicio' },
                    { id: 'end', label: 'Final' },
                    { id: 'index', label: 'Específica' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => setPositionType(pos.id as any)}
                      className={`py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all ${positionType === pos.id ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-500/20' : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-emerald-500/50'}`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
                
                {positionType === 'index' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="flex items-center justify-between bg-emerald-500/5 p-5 rounded-[28px] border border-emerald-500/10"
                  >
                    <span className="text-xs font-black text-emerald-500 uppercase tracking-widest italic">Índice (0 - {playlistSize}):</span>
                    <input 
                      type="number"
                      min="0"
                      max={playlistSize}
                      value={index}
                      onChange={(e) => setIndex(parseInt(e.target.value))}
                      className="w-24 p-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-center font-black text-[var(--text-main)]"
                    />
                  </motion.div>
                )}
              </div>

              <button 
                type="submit"
                disabled={!isEditMode && !file}
                className={`w-full py-5 text-[11px] font-black uppercase tracking-[0.3em] rounded-3xl shadow-2xl transition-all active:scale-[0.98] ${isEditMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-slate-300'}`}
              >
                {isEditMode ? 'Guardar Cambios' : 'Subir a Biblioteca'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddSongModal;
