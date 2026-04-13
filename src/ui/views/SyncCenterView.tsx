import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MonitorPlay, Download, Check, RefreshCw, FileArchive, ArrowUpCircle, AlertCircle, History } from 'lucide-react';
import { syncBridgeService } from '../../infrastructure/services/SyncBridgeService';
import { usePlaylists } from '../../hooks/usePlaylists';
import { useLibrary } from '../../hooks/useLibrary';
import type { TrackRecord } from '../../infrastructure/persistence/MusicDatabase';

type SyncPerspective = 'idle' | 'host' | 'client';

export const SyncCenterView: React.FC = () => {
  const [perspective, setPerspective] = useState<SyncPerspective>('idle');
  
  // Vault state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, message: '' });
  const [isSuccess, setIsSuccess] = useState(false);
  const [importSummary, setImportSummary] = useState<{ imported: number; skipped: number; replaced: number } | null>(null);

  // Conflict Resolution
  const [conflict, setConflict] = useState<{
    track: Omit<TrackRecord, 'audioBlob'>;
    resolve: (action: 'skip' | 'replace') => void;
  } | null>(null);

  const playlistsData = usePlaylists();
  const libraryData = useLibrary();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('all');

  const handleExport = async () => {
    try {
      setIsProcessing(true);
      setIsSuccess(false);
      
      const blob = await syncBridgeService.exportVault((msg, p) => {
        setProgress({ current: p, total: 100, message: msg });
      }, selectedPlaylistId === 'all' ? undefined : selectedPlaylistId);
      
      let filename = `MusicScript_Vault_${new Date().toISOString().split('T')[0]}.mssync`;
      
      if (selectedPlaylistId !== 'all') {
        const pl = playlistsData.playlists.find(p => p.id === selectedPlaylistId);
        if (pl) {
          filename = `MusicScript_Playlist_${pl.name.replace(/\s+/g, '_')}.mssync`;
        }
      }

      syncBridgeService.downloadBlob(blob, filename);
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Error al exportar la bóveda");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setImportSummary(null);
      setIsSuccess(false);

      const result = await syncBridgeService.importVault(
        file,
        (track) => {
          return new Promise((resolve) => {
            setConflict({ track, resolve: (action) => {
              setConflict(null);
              resolve(action);
            }});
          });
        },
        (msg, p) => {
          setProgress({ current: p, total: 100, message: msg });
        }
      );

      setImportSummary(result);
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Error al importar la bóveda. Asegúrate de que sea un archivo .mssync o .zip válido.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto space-y-8 pb-32 md:pb-20">
        
        {/* HEADER */}
        <header className="text-center space-y-4">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex justify-center items-center gap-6 mb-6">
             <MonitorPlay className="w-16 h-16 text-emerald-500 opacity-80" />
             <div className="w-24 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-blue-500/0 relative">
               <motion.div 
                 animate={{ x: [0, 96, 0] }}
                 transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                 className="absolute -top-1 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]"
               />
             </div>
             <MonitorPlay className="w-16 h-16 text-blue-500 opacity-80" />
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-black text-center text-[var(--text-main)] italic tracking-tighter uppercase">Sync Center</h1>
          <p className="text-[10px] md:text-xs font-black text-center text-[var(--text-muted)] uppercase tracking-[0.4em] italic leading-loose mx-auto">
            Centro de Migración y Respaldo (PC) <br className="md:hidden" />
            <span className="text-emerald-400 opacity-80">(Transfiere tu música entre navegadores o crea backups)</span>
          </p>
        </header>

        {perspective === 'idle' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <button onClick={() => setPerspective('host')} className="group bg-[var(--bg-card)] border border-white/5 hover:border-emerald-500/50 p-8 rounded-3xl transition-all shadow-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col items-center text-center">
               <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <FileArchive className="w-10 h-10 text-emerald-500" />
               </div>
               <h3 className="text-2xl font-black text-[var(--text-main)] text-center uppercase tracking-tighter italic mb-4">Exportar Bóveda</h3>
               <p className="text-sm font-bold text-[var(--text-muted)] text-center leading-relaxed">Genera un archivo .mssync con tu música seleccionada para migrarla.</p>
            </button>

            <button onClick={() => setPerspective('client')} className="group bg-[var(--bg-card)] border border-white/5 hover:border-blue-500/50 p-8 rounded-3xl transition-all shadow-xl hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] flex flex-col items-center text-center">
               <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <ArrowUpCircle className="w-10 h-10 text-blue-500" />
               </div>
               <h3 className="text-2xl font-black text-[var(--text-main)] text-center uppercase tracking-tighter italic mb-4">Importar Bóveda</h3>
               <p className="text-sm font-bold text-[var(--text-muted)] text-center leading-relaxed">Carga un archivo .mssync para restaurar o migrar tu biblioteca en este navegador.</p>
            </button>
          </div>
        )}

        {perspective !== 'idle' && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[var(--bg-card)] border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <button onClick={() => { setPerspective('idle'); setIsSuccess(false); setImportSummary(null); }} className="absolute py-2 top-6 left-6 text-xs text-white/50 hover:text-white uppercase font-black tracking-widest">
              ← Volver
            </button>

            {perspective === 'host' && (
              <div className="flex flex-col items-center pt-8">
                <h2 className="text-3xl font-black italic uppercase text-center text-[var(--text-main)] mb-2">Preparar Bóveda</h2>
                <p className="text-[var(--text-muted)] font-bold text-center mb-10 max-w-sm mx-auto">Exporta tu música para llevarla a otro navegador o guardarla como respaldo local.</p>

                {!isProcessing && !isSuccess && (
                  <div className="w-full flex flex-col items-center space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    {/* Selector de Contenido */}
                    <div className="w-full max-w-sm">
                       <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest block mb-3 text-center">Contenido de la Bóveda</label>
                       <select 
                         value={selectedPlaylistId}
                         onChange={(e) => setSelectedPlaylistId(e.target.value)}
                         className="w-full bg-black/20 border border-white/5 text-white/80 p-4 rounded-2xl font-bold focus:border-emerald-500 outline-none transition-all appearance-none text-center cursor-pointer hover:bg-black/30"
                       >
                         <option value="all">Toda la Biblioteca ({libraryData.librarySongs.length} canciones)</option>
                         <optgroup label="Exportar Playlist Específica">
                            {playlistsData.playlists.map(pl => (
                              <option key={pl.id} value={pl.id}>{pl.name} ({pl.songIds.length} canciones)</option>
                            ))}
                         </optgroup>
                       </select>
                    </div>

                    <button 
                      onClick={handleExport}
                      className="group relative bg-emerald-600 hover:bg-emerald-500 text-white p-10 rounded-[32px] transition-all shadow-2xl hover:shadow-emerald-500/20 active:scale-95 flex flex-col items-center gap-4 w-full max-w-sm"
                    >
                      <Download className="w-12 h-12 group-hover:-translate-y-1 transition-transform" />
                      <span className="text-xl font-black uppercase italic tracking-tighter">Generar Archivo .mssync</span>
                    </button>
                  </div>
                )}

                {isProcessing && (
                  <div className="w-full max-w-md bg-black/30 p-8 rounded-3xl border border-white/5 text-center mx-auto">
                    <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-6" />
                    <p className="font-black text-[var(--text-main)] text-center uppercase italic text-sm mb-4 tracking-widest">{progress.message}</p>
                    <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden mb-3">
                      <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${progress.current}%` }} />
                    </div>
                    <p className="text-[10px] font-black text-center text-white/40 uppercase tracking-widest">{progress.current}% COMPLETADO</p>
                  </div>
                )}

                {isSuccess && (
                  <div className="text-center animate-in fade-in zoom-in-95 w-full">
                    <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check className="w-12 h-12 text-emerald-500" />
                    </div>
                    <h3 className="text-3xl font-black text-center text-[var(--text-main)] uppercase italic mb-2 tracking-tighter">¡Bóveda Generada!</h3>
                    <p className="text-[var(--text-muted)] text-center font-bold mb-8">El archivo ya debería estar en tu carpeta de descargas.</p>
                    <button onClick={() => setPerspective('idle')} className="text-xs font-black text-center text-white/30 hover:text-white uppercase tracking-widest mx-auto block">Finalizar</button>
                  </div>
                )}
              </div>
            )}

            {perspective === 'client' && (
              <div className="flex flex-col items-center pt-8">
                <h2 className="text-3xl font-black italic uppercase text-center text-[var(--text-main)] mb-2">Importar Bóveda</h2>
                <p className="text-[var(--text-muted)] font-bold text-center mb-12 max-w-sm mx-auto">Selecciona el archivo .mssync para añadir la música a este navegador.</p>

                {!isProcessing && !isSuccess && (
                   <label className="group w-full max-w-md h-64 border-2 border-dashed border-white/10 hover:border-blue-500/40 rounded-[40px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-blue-500/5 transition-all">
                      <input 
                        type="file" 
                        accept=".mssync, .zip, application/zip, application/x-zip-compressed" 
                        onChange={handleImport} 
                        className="hidden" 
                      />
                      <ArrowUpCircle className="w-16 h-16 text-blue-500/50 group-hover:text-blue-500 transition-colors" />
                      <p className="text-center">
                        <span className="block font-black text-[var(--text-main)] uppercase italic text-lg tracking-tighter">Click para buscar</span>
                        <span className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest">o arrastra el archivo aquí</span>
                      </p>
                   </label>
                )}

                {isProcessing && (
                  <div className="w-full max-w-md bg-black/30 p-8 rounded-3xl border border-white/5 text-center mx-auto">
                    <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-6" />
                    <p className="font-black text-[var(--text-main)] text-center uppercase italic text-sm mb-4 tracking-widest">{progress.message}</p>
                    <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden mb-3">
                      <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${progress.current}%` }} />
                    </div>
                  </div>
                )}

                {isSuccess && importSummary && (
                  <div className="text-center animate-in fade-in zoom-in-95 w-full">
                    <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <History className="w-12 h-12 text-blue-500" />
                    </div>
                    <h3 className="text-3xl font-black text-center text-[var(--text-main)] uppercase italic mb-2 tracking-tighter">¡Sincronización Exitosa!</h3>
                    <div className="flex justify-center gap-6 mt-6 mb-8">
                       <div className="text-center">
                         <p className="text-2xl font-black text-emerald-400">{importSummary.imported}</p>
                         <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Nuevas</p>
                       </div>
                       <div className="text-center">
                         <p className="text-2xl font-black text-blue-400">{importSummary.replaced}</p>
                         <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Reemplazadas</p>
                       </div>
                       <div className="text-center">
                         <p className="text-2xl font-black text-white/30">{importSummary.skipped}</p>
                         <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Omitidas</p>
                       </div>
                    </div>
                    <button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all mx-auto block">Ver mi Biblioteca</button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* MODALES / DIÁLOGOS DE CONFLICTO */}
        {conflict && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[var(--bg-card)] border border-white/10 rounded-[32px] p-8 max-w-md w-full shadow-2xl space-y-6 text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                   <AlertCircle className="w-8 h-8 text-orange-500" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-black text-center text-[var(--text-main)] uppercase italic tracking-tighter">Canción Duplicada</h3>
                   <p className="text-sm font-bold text-[var(--text-muted)] text-center italic leading-relaxed mx-auto">
                     La canción <span className="text-[var(--text-main)]">"{conflict.track.title}"</span> ya se encuentra en tu biblioteca. <br/>¿Qué deseas hacer?
                   </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={() => conflict.resolve('skip')}
                     className="bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all"
                   >
                     Omitir
                   </button>
                   <button 
                     onClick={() => conflict.resolve('replace')}
                     className="bg-orange-600 hover:bg-orange-500 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg hover:shadow-orange-500/20"
                   >
                     Reemplazar
                   </button>
                </div>
             </motion.div>
          </div>
        )}

      </div>
    </div>
  );
};
