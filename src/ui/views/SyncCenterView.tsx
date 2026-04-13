import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Smartphone, MonitorPlay, Wifi, ArrowRightLeft, Send, Download, Check, RefreshCw } from 'lucide-react';
import { syncService, type SyncMode } from '../../infrastructure/services/SyncService';
import { usePlaylists } from '../../hooks/usePlaylists';

type SyncPerspective = 'idle' | 'host' | 'client';

export const SyncCenterView: React.FC = () => {
  const [perspective, setPerspective] = useState<SyncPerspective>('idle');
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [pin, setPin] = useState('');
  const [clientPinInput, setClientPinInput] = useState('');
  
  // Transfer state
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [lastReceivedTrack, setLastReceivedTrack] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Host options
  const [sendMode, setSendMode] = useState<SyncMode>('library');
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const playlistsData = usePlaylists();

  useEffect(() => {
    syncService.onConnectionStateChange = (state) => setConnectionState(state);
    
    syncService.onReceiveTrack = (track, current, total) => {
      setLastReceivedTrack(track.title);
      setProgress({ current, total });
      if (current === 1) setIsTransferring(true);
    };

    syncService.onTransferComplete = () => {
      setIsTransferring(false);
      setIsSuccess(true);
    };

    return () => {
      syncService.disconnect();
    };
  }, []);

  const generatePin = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const startHosting = async () => {
    try {
      setConnectionState('connecting');
      const newPin = generatePin();
      setPin(newPin);
      await syncService.initializeAsHost(newPin);
      setPerspective('host');
    } catch (error) {
      console.error(error);
      setConnectionState('error');
    }
  };

  const startClientConnect = async (targetPin: string) => {
    try {
      setConnectionState('connecting');
      setPerspective('client');
      await syncService.connectAsClient(targetPin);
    } catch (error) {
      console.error(error);
      setConnectionState('error');
    }
  };

  // QR Scanner logic
  useEffect(() => {
    if (perspective === 'client' && connectionState === 'disconnected') {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render((text) => {
        scanner.clear();
        setClientPinInput(text);
        startClientConnect(text);
      }, () => {
        // ignore scan errors, they happen every frame it doesn't find a QR
      });

      return () => {
        scanner.clear().catch(e => console.error(e));
      };
    }
  }, [perspective, connectionState]);

  const handleStartSendingData = async () => {
    if (connectionState !== 'connected') return;
    setIsTransferring(true);
    setIsSuccess(false);
    setProgress({ current: 0, total: 100 }); // indeterminate start
    try {
      await syncService.transferData(sendMode, selectedPlaylist, (current, total) => {
        setProgress({ current, total });
      });
      setIsTransferring(false);
      setIsSuccess(true);
    } catch(e) {
      console.error(e);
      setConnectionState('error');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        
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
             <Smartphone className="w-16 h-16 text-blue-500 opacity-80" />
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase">Sync Center</h1>
          <p className="text-[10px] md:text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.4em] italic">Red WebRTC de Transferencia P2P</p>
        </header>

        {perspective === 'idle' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <button onClick={startHosting} className="group bg-[var(--bg-card)] border border-white/5 hover:border-emerald-500/50 p-8 rounded-3xl transition-all shadow-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col items-center text-center">
               <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <Send className="w-10 h-10 text-emerald-500" />
               </div>
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-4">Compartir Música</h3>
               <p className="text-sm font-bold text-[var(--text-muted)] leading-relaxed">Conviertete en el servidor anfitrión para enviar tu biblioteca o tus playlists a otro de tus dispositivos.</p>
            </button>

            <button onClick={() => setPerspective('client')} className="group bg-[var(--bg-card)] border border-white/5 hover:border-blue-500/50 p-8 rounded-3xl transition-all shadow-xl hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] flex flex-col items-center text-center">
               <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <Download className="w-10 h-10 text-blue-500" />
               </div>
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-4">Recibir Música</h3>
               <p className="text-sm font-bold text-[var(--text-muted)] leading-relaxed">Conéctate a la sala usando un código PIN o escaneando un código QR desde la cámara de tu celular.</p>
            </button>
          </div>
        )}

        {perspective !== 'idle' && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[var(--bg-card)] border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            
            {/* Status indicator */}
            <div className={`absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
              connectionState === 'connected' ? 'bg-emerald-500/20 text-emerald-400' :
              connectionState === 'connecting' ? 'bg-orange-500/20 text-orange-400' :
              connectionState === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/50'
            }`}>
              <Wifi className={`w-3 h-3 ${connectionState === 'connecting' && 'animate-pulse'}`} />
              {connectionState === 'connected' ? 'CONECTADO P2P' :
               connectionState === 'connecting' ? 'BUSCANDO PARES...' :
               connectionState === 'error' ? 'ERROR DE RED' : 'DESCONECTADO'}
            </div>

            <button onClick={() => { syncService.disconnect(); setPerspective('idle'); setIsSuccess(false); }} className="absolute py-2 top-6 left-6 text-xs text-white/50 hover:text-white uppercase font-black tracking-widest">
              ← Cancelar
            </button>

            {/* HOST VIEW */}
            {perspective === 'host' && (
              <div className="flex flex-col items-center pt-8">
                {connectionState !== 'connected' ? (
                  <>
                    <h2 className="text-3xl font-black italic uppercase text-white mb-2">Escanea para Unirte</h2>
                    <p className="text-[var(--text-muted)] font-bold text-center mb-8">Usa MusicScript en el otro dispositivo para escanear este QR o ingresa el código PIN manualmente.</p>
                    
                    <div className="bg-white p-4 rounded-2xl shadow-lg mb-8">
                      <QRCodeSVG value={pin} size={200} level="H" fgColor="#000" bgColor="#fff" />
                    </div>

                    <div className="text-center">
                      <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">O ingresa este PIN temporal:</p>
                      <span className="text-5xl font-black tracking-widest text-emerald-400 font-mono tracking-[0.2em]">{pin}</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full max-w-lg space-y-8 animate-in fade-in zoom-in-95">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                        <Check className="w-10 h-10 text-emerald-500" />
                      </div>
                      <h2 className="text-3xl font-black italic uppercase text-white mb-2">¡Dispositivo Conectado!</h2>
                      <p className="text-[var(--text-muted)] font-bold">Selecciona qué datos vas a transferir al cliente.</p>
                    </div>

                    <div className="flex flex-col gap-4 bg-black/20 p-6 rounded-3xl border border-white/5">
                      <label className="flex items-center gap-3 p-4 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition-colors">
                        <input type="radio" checked={sendMode === 'library'} onChange={() => setSendMode('library')} className="accent-emerald-500 w-5 h-5" />
                        <div>
                          <p className="font-black text-white italic uppercase">Bóveda Completa</p>
                          <p className="text-xs text-[var(--text-muted)]">Transfiere toda la base de datos de canciones (.mp3/.wav).</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition-colors">
                        <input type="radio" checked={sendMode === 'playlist'} onChange={() => setSendMode('playlist')} className="accent-emerald-500 w-5 h-5" />
                        <div className="flex-1">
                          <p className="font-black text-white italic uppercase mb-1">Solo una Playlist</p>
                          {sendMode === 'playlist' && (
                            <select 
                              value={selectedPlaylist} 
                              onChange={(e) => setSelectedPlaylist(e.target.value)} 
                              className="w-full mt-2 bg-black/40 border border-white/10 text-white rounded-lg p-2 text-sm focus:outline-none focus:border-emerald-500"
                            >
                              <option value="">Selecciona una playlist...</option>
                              {playlistsData.playlists.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.songIds.length} pistas)</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </label>
                    </div>

                    {!isTransferring && !isSuccess && (
                      <button 
                        onClick={handleStartSendingData}
                        disabled={sendMode === 'playlist' && !selectedPlaylist}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all"
                      >
                        Iniciar Transferencia P2P
                      </button>
                    )}

                    {isTransferring && (
                      <div className="bg-black/30 p-6 rounded-2xl border border-emerald-500/20 text-center">
                        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
                        <p className="font-bold text-[var(--text-muted)] text-sm mb-2">Enviando paquete webRTC...</p>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-2">
                           <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: progress.total ? `${(progress.current / progress.total) * 100}%` : '0%' }} />
                        </div>
                        <p className="text-xs text-white/50">{progress.current} de {progress.total} pistas</p>
                      </div>
                    )}

                    {isSuccess && (
                      <div className="bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/30 text-center">
                        <Check className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                        <h3 className="font-black text-emerald-400 uppercase italic">¡Transferencia Completa!</h3>
                      </div>
                    )}

                  </div>
                )}
              </div>
            )}

            {/* CLIENT VIEW */}
            {perspective === 'client' && (
              <div className="flex flex-col items-center pt-8">
                {connectionState !== 'connected' ? (
                  <>
                    <h2 className="text-3xl font-black italic uppercase text-white mb-2">Ingresa al Servidor</h2>
                    <p className="text-[var(--text-muted)] font-bold text-center mb-8">Escanea el QR en la pantalla de la PC principal, o ingresa su código PIN aquí manualmente.</p>
                    
                    <div id="reader" className="w-full max-w-sm mb-6 rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black/40" />

                    <div className="flex gap-2 w-full max-w-sm relative z-20">
                      <input 
                        type="text" 
                        value={clientPinInput}
                        onChange={(e) => setClientPinInput(e.target.value.toUpperCase())}
                        placeholder="EJ: 8X91A"
                        className="flex-1 bg-black/40 border border-white/10 text-white rounded-xl px-4 font-mono text-xl tracking-[0.2em] focus:outline-none focus:border-blue-500 transition-colors uppercase"
                      />
                      <button 
                        onClick={() => startClientConnect(clientPinInput)}
                        disabled={!clientPinInput}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                        Conectar
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full max-w-lg space-y-8 animate-in fade-in zoom-in-95 text-center mt-12">
                     <div className="w-20 h-20 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-4 relative">
                        <ArrowRightLeft className="w-10 h-10 text-blue-500" />
                        {isTransferring && (
                          <div className="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                        )}
                     </div>
                     <h2 className="text-3xl font-black italic uppercase text-white mb-2">
                       {isSuccess ? '¡Completado!' : isTransferring ? 'Recibiendo Pistas...' : 'Esperando Host...'}
                     </h2>
                     <p className="text-[var(--text-muted)] font-bold">
                       {isSuccess ? 'Los archivos han sido guardados en tu IndexedDB local.' : isTransferring ? `Descargando: ${lastReceivedTrack}` : 'Esperando a que la computadora principal inicie la transferencia.'}
                     </p>

                     {(isTransferring || isSuccess) && (
                       <div className="bg-black/30 p-6 rounded-2xl border border-blue-500/20 text-center mt-8">
                         <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden mb-2">
                            <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: progress.total ? `${(progress.current / progress.total) * 100}%` : '0%' }} />
                         </div>
                         <p className="text-xs font-black uppercase tracking-widest text-blue-400">{progress.total ? Math.round((progress.current / progress.total) * 100) : 0}% COMPLETADO</p>
                       </div>
                     )}
                  </div>
                )}
              </div>
            )}

          </motion.div>
        )}

      </div>
    </div>
  );
};
