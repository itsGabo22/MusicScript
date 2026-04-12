import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, X, Download, Copy, Save, Play, Square } from 'lucide-react';
import type { Song } from '../../core/entities/Song';
import { AudioEditorService } from '../../infrastructure/services/AudioEditorService';
import { db } from '../../infrastructure/persistence/MusicDatabase';

interface SongEditorModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SongEditorModal: React.FC<SongEditorModalProps> = ({ song, isOpen, onClose, onSuccess }) => {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(1);
  const [duration, setDuration] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const playStartTimeRef = useRef(0);

  useEffect(() => {
    if (isOpen && song) {
      loadAudioData();
    } else {
      cleanup();
    }
    return cleanup;
  }, [isOpen, song]);

  const loadAudioData = async () => {
    try {
      setIsProcessing(true);
      const trackRecord = await db.tracks.get(song!.id);
      if (!trackRecord) throw new Error("Track not found in DB");
      
      const blob = trackRecord.audioBlob;
      
      const buffer = await AudioEditorService.decodeAudio(blob);
      setAudioBuffer(buffer);
      setDuration(buffer.duration);
      setStartTime(0);
      setEndTime(buffer.duration);
    } catch (e) {
      console.error(e);
      alert("Error al cargar la pista para edición.");
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const cleanup = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
    }
    if (contextRef.current) {
      contextRef.current.close().catch(console.error);
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    sourceNodeRef.current = null;
    contextRef.current = null;
    setAudioBuffer(null);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePreview = () => {
    if (isPlaying) {
      stopPreview();
    } else {
      startPreview();
    }
  };

  const startPreview = () => {
    if (!audioBuffer) return;
    
    // Create new context for strictly playback control
    contextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = contextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(contextRef.current.destination);
    
    source.start(0, startTime, endTime - startTime);
    sourceNodeRef.current = source;
    
    playStartTimeRef.current = contextRef.current.currentTime - startTime;
    setIsPlaying(true);
    
    source.onended = () => {
      setIsPlaying(false);
    };

    const updateTime = () => {
      if (contextRef.current && sourceNodeRef.current) {
        const t = contextRef.current.currentTime - playStartTimeRef.current;
        if (t >= endTime) {
           stopPreview();
        } else {
           setCurrentTime(t);
           rafRef.current = requestAnimationFrame(updateTime);
        }
      }
    };
    rafRef.current = requestAnimationFrame(updateTime);
  };

  const stopPreview = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    setIsPlaying(false);
  };

  const processAndGetBlob = (format: 'wav' | 'mp3' = 'wav'): Blob | null => {
    if (!audioBuffer) return null;
    setIsProcessing(true);
    let trimmedBlob: Blob | null = null;
    try {
      // Allow the UI to paint the loading state deeply if mp3 is requested as it's synchronous block
      const newBuffer = AudioEditorService.trimAudio(audioBuffer, startTime, endTime);
      trimmedBlob = format === 'mp3' 
        ? AudioEditorService.encodeToMp3(newBuffer)
        : AudioEditorService.encodeToWav(newBuffer);
    } catch(e) {
      console.error(e);
      alert("Error procesando el audio.");
    }
    setIsProcessing(false);
    return trimmedBlob;
  };

  const formatT = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ACTIONS
  const handleDownload = (format: 'wav' | 'mp3' = 'wav') => {
    // Timeout to allow the "Procesando" state to render before the blocking synchronous encoding starts
    setTimeout(() => {
      const blob = processAndGetBlob(format);
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${song?.artist} - ${song?.title} (Recorte).${format}`;
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    }, 10);
  };

  const handleSaveCopy = async () => {
    if (!song) return;
    const blob = processAndGetBlob();
    if (!blob) return;
    
    setIsProcessing(true);
    try {
      const newId = crypto.randomUUID();
      await db.tracks.add({
        ...song,
        id: newId,
        title: `${song.title} (Recorte)`,
        audioBlob: blob,
        addedAt: Date.now(),
        sortOrder: Date.now(),
        isFavorite: false
      });
      onSuccess();
      onClose();
    } catch(e) {
      console.error(e);
      alert("Error al guardar la copia.");
    }
    setIsProcessing(false);
  };

  const handleReplace = async () => {
    if (!song) return;
    const confirm = window.confirm("¿Seguro que deseas reemplazar el archivo original en la biblioteca? Esta acción es destructiva.");
    if (!confirm) return;

    const blob = processAndGetBlob();
    if (!blob) return;
    
    setIsProcessing(true);
    try {
      await db.tracks.update(song.id, { audioBlob: blob });
      onSuccess();
      onClose();
    } catch(e) {
      console.error(e);
      alert("Error al reemplazar el archivo.");
    }
    setIsProcessing(false);
  };

  if (!isOpen || !song) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-[var(--bg-main)] w-full max-w-xl rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-2xl"
        >
          <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
            <h2 className="text-xl font-black uppercase italic tracking-wider text-[var(--text-main)] flex items-center gap-3">
              <Scissors className="text-emerald-500" />
              Recortar Canción
            </h2>
            <button onClick={onClose} className="p-2 text-[var(--text-muted)] hover:text-white rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8">
            <div className="mb-4">
              <h3 className="text-emerald-500 font-bold uppercase text-sm truncate">{song.title}</h3>
              <p className="text-[var(--text-muted)] text-sm">{song.artist}</p>
            </div>

            {isProcessing && !audioBuffer ? (
              <div className="h-32 flex items-center justify-center text-emerald-500 animate-pulse font-bold">
                Decodificando Audio...
              </div>
            ) : (
              <div className="space-y-8">
                {/* Visualizer Area */}
                <div className="h-24 bg-black/20 rounded-2xl border border-[var(--border-color)] relative flex items-center overflow-hidden p-4">
                   <div 
                     className="absolute inset-y-0 bg-emerald-500/20 backdrop-blur-sm pointer-events-none transition-all"
                     style={{ 
                       left: `${(startTime / duration) * 100}%`,
                       right: `${100 - (endTime / duration) * 100}%`
                     }}
                   />
                   {/* Current playing cursor */}
                   {isPlaying && (
                     <div 
                       className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_10px_white] z-10"
                       style={{ left: `${(currentTime / duration) * 100}%` }}
                     />
                   )}
                   <p className="text-center w-full block text-[var(--text-muted)] text-xs font-black uppercase opacity-30 select-none">Preview Activo</p>
                </div>

                {/* Range Controls */}
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-black text-emerald-500">
                      <span>INICIO: {formatT(startTime)}</span>
                    </div>
                    <input 
                      type="range" min="0" max={duration} step="0.1" 
                      value={startTime} onChange={(e) => setStartTime(Math.min(parseFloat(e.target.value), endTime - 1))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-black text-red-500">
                      <span>FIN: {formatT(endTime)}</span>
                    </div>
                    <input 
                      type="range" min="0" max={duration} step="0.1" 
                      value={endTime} onChange={(e) => setEndTime(Math.max(parseFloat(e.target.value), startTime + 1))}
                      className="w-full accent-red-500"
                    />
                  </div>
                </div>

                {/* Main Actions */}
                <div className="pt-4 flex flex-wrap gap-3 border-t border-[var(--border-color)]">
                  <button
                    onClick={togglePreview}
                    className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-black/20 rounded-2xl flex-1 flex justify-center items-center text-[var(--text-main)] transition-colors"
                  >
                    {isPlaying ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5 text-emerald-500" />}
                  </button>
                  
                  <div className="flex gap-2 flex-[2]">
                    <button
                      onClick={() => handleDownload('wav')}
                      disabled={isProcessing}
                      className="p-3 bg-[var(--bg-card)] border border-[var(--border-color)] hover:text-emerald-500 rounded-2xl flex-1 flex justify-center items-center gap-2 font-bold text-xs tracking-wider uppercase transition-colors disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" /> Bajar WAV
                    </button>
                    <button
                      onClick={() => handleDownload('mp3')}
                      disabled={isProcessing}
                      className="p-3 bg-[var(--bg-card)] border border-[var(--border-color)] hover:text-emerald-500 rounded-2xl flex-1 flex justify-center items-center gap-2 font-bold text-xs tracking-wider uppercase transition-colors disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" /> Bajar MP3
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveCopy}
                    disabled={isProcessing}
                    className="flex-1 p-3 bg-[var(--bg-card)] border border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-500 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Copy className="w-4 h-4" /> Hacer Copia
                  </button>
                  <button
                    onClick={handleReplace}
                    disabled={isProcessing}
                    className="flex-1 p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> Sustituir Original
                  </button>
                </div>

              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
