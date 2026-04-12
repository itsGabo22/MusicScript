import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Zap, Info, Brain, Trash2, Settings, User, Image as ImageIcon, Check, X } from 'lucide-react';
import { AIService } from '../../infrastructure/services/AIService';
import type { AIContext } from '../../infrastructure/services/AIService';
import type { Song } from '../../core/entities/Song';

interface AIAssistantProps {
  songs: Song[];
  favorites: Song[];
  playlists: any[];
  currentSong?: Song | null;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ songs, favorites, playlists, currentSong }) => {
  const [botName, setBotName] = useState(() => localStorage.getItem('ms_bot_name') || 'Cerebro Musical');
  const [botPersona, setBotPersona] = useState(() => localStorage.getItem('ms_bot_persona') || 'un asistente experto en música');
  const [botPhoto, setBotPhoto] = useState(() => localStorage.getItem('ms_bot_photo') || '');
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState({ name: botName, persona: botPersona, photo: botPhoto });

  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: `¡Hola! Soy ${botName}. Puedo recomendarte música según tu humor, darte datos curiosos de artistas o ayudarte a descubrir nuevas canciones. ¿Qué te apecese hoy?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSaveSettings = () => {
    setBotName(tempSettings.name);
    setBotPersona(tempSettings.persona);
    setBotPhoto(tempSettings.photo);
    localStorage.setItem('ms_bot_name', tempSettings.name);
    localStorage.setItem('ms_bot_persona', tempSettings.persona);
    localStorage.setItem('ms_bot_photo', tempSettings.photo);
    setIsSettingsOpen(false);
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', text: textToSend }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const context: AIContext = {
      library: songs.map(s => `${s.title} - ${s.artist}`),
      favorites: favorites.map(s => `${s.title} - ${s.artist}`),
      playlists: playlists.map(p => ({
        name: p.name,
        songs: p.songIds
      })),
      currentSong: currentSong ? { title: currentSong.title, artist: currentSong.artist } : undefined
    };

    const response = await AIService.getResponse(textToSend, context, botName, botPersona);
    setMessages([...newMessages, { role: 'ai', text: response }]);
    setIsLoading(false);
  };

  const QuickButton = ({ icon, text, onClick }: { icon: any, text: string, onClick: () => void }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-full text-[10px] sm:text-xs font-bold transition-all border border-emerald-500/20 active:scale-95"
    >
      {icon}
      {text}
    </button>
  );

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-[var(--bg-main)]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] bg-[var(--bg-sidebar)]/30 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="relative group">
            {botPhoto ? (
              <img src={botPhoto} alt="Bot" className="w-12 h-12 rounded-2xl object-cover shadow-lg border-2 border-emerald-500/50" />
            ) : (
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Brain className="text-white w-6 h-6 animate-pulse" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[var(--bg-main)] rounded-full animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter italic">{botName}</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest opacity-80">Personalizado para ti</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-3 rounded-xl transition-all ${isSettingsOpen ? 'bg-emerald-500 text-white' : 'text-[var(--text-muted)] hover:text-emerald-500 hover:bg-emerald-500/10'}`}
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setMessages([messages[0]])}
            className="p-3 text-[var(--text-muted)] hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden flex flex-col">
        {/* Settings Panel Overlay */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[var(--bg-card)] border-b border-[var(--border-color)] overflow-hidden shadow-2xl z-10"
            >
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-2">
                       <User className="w-3 h-3" /> Nombre del Bot
                    </label>
                    <input 
                      type="text" 
                      value={tempSettings.name}
                      onChange={e => setTempSettings({...tempSettings, name: e.target.value})}
                      className="w-full bg-black/20 border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-2">
                       <Sparkles className="w-3 h-3" /> Personalidad / Rol
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ej: Freddie Mercury"
                      value={tempSettings.persona}
                      onChange={e => setTempSettings({...tempSettings, persona: e.target.value})}
                      className="w-full bg-black/20 border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-2">
                       <ImageIcon className="w-3 h-3" /> URL de Foto
                    </label>
                    <input 
                      type="text" 
                      placeholder="https://..."
                      value={tempSettings.photo}
                      onChange={e => setTempSettings({...tempSettings, photo: e.target.value})}
                      className="w-full bg-black/20 border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setIsSettingsOpen(false)} className="px-4 py-2 text-xs font-bold text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-2">
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                  <button onClick={handleSaveSettings} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-600/20">
                    <Check className="w-4 h-4" /> Guardar Cambios
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat History */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex gap-3 max-w-[85%]">
                {msg.role === 'ai' && (
                  <div className="flex-shrink-0 mt-1">
                    {botPhoto ? (
                      <img src={botPhoto} className="w-8 h-8 rounded-lg object-cover border border-emerald-500/30" alt="Bot" />
                    ) : (
                      <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                        <Brain className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                )}
                <div className={`
                  p-4 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'user' 
                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/10 rounded-tr-none' 
                    : 'bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] rounded-tl-none'}
                `}>
                  {msg.text.split('\n').map((line, idx) => {
                    // Procesar links [txt](url) y negritas **txt**
                    const htmlLine = line
                      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #34d399; text-decoration: underline; font-weight: bold;">$1</a>')
                      .replace(/\*\*([^*]+)\*\*/g, '<strong style="color: #fff;">$1</strong>');
                    return (
                      <p key={idx} className={idx > 0 ? 'mt-2' : ''} dangerouslySetInnerHTML={{ __html: htmlLine }} />
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="flex gap-3">
                  <div className="w-8 h-8 bg-zinc-800 rounded-lg animate-pulse" />
                  <div className="bg-[var(--bg-card)] p-4 rounded-2xl flex gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Bottom Input Area - Natural flow with deep padding to clear fixed bar */}
        <div className="w-full px-6 pt-4 pb-48 bg-[var(--bg-main)] border-t border-[var(--border-color)]">
          <div className="max-w-4xl mx-auto space-y-4">
             {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <QuickButton 
                icon={<Sparkles className="w-4 h-4" />} 
                text="Ponme algo alegre" 
                onClick={() => handleSend("Recomiéndame algo de mi biblioteca que sea alegre y motivador.")} 
              />
              <QuickButton 
                icon={<Info className="w-4 h-4" />} 
                text="Datos de este artista" 
                onClick={() => handleSend(currentSong ? `Dime curiosidades sobre ${currentSong.artist}.` : "¿Quién es el artista que está sonando?")} 
              />
              <QuickButton 
                icon={<Zap className="w-4 h-4" />} 
                text="Similares" 
                onClick={() => handleSend(currentSong ? `Busco canciones similares a "${currentSong.title}" de ${currentSong.artist}.` : "Dime qué canción debería descargar basándote en mis favoritos.")} 
              />
            </div>

            {/* Input Container */}
            <div className="relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Habla con ${botName}...`}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 pr-16 text-sm text-[var(--text-main)] focus:outline-none focus:border-emerald-500 transition-all resize-none shadow-xl h-20 sm:h-24"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className={`
                  absolute right-4 bottom-4 p-3 rounded-xl transition-all
                  ${input.trim() ? 'bg-emerald-500 text-white shadow-lg scale-100 active:scale-90' : 'bg-zinc-800 text-zinc-500 scale-90'}
                `}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
