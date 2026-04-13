import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Bot, SlidersHorizontal, Scissors, Check, FileAudio, FileArchive, Info } from 'lucide-react';
import MusicScriptLogo from './MusicScriptLogo';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Bienvenido a MusicScript",
      description: "Tu estación de audio Pro en el navegador. Privacidad total, potencia máxima y un diseño que te dejará sin aliento.",
      icon: <MusicScriptLogo className="w-48 h-48 text-emerald-500" />,
      color: "from-emerald-500/20 to-teal-500/10",
      iconColor: "text-emerald-500"
    },
    {
      title: "Sube tu Música",
      description: "Pulsa '+ AÑADIR' para cargar tus MP3. Usamos IndexedDB para que tu biblioteca viva en tu dispositivo, no en la nube.",
      icon: <FileAudio className="w-16 h-16" />,
      color: "from-blue-500/20 to-indigo-500/10",
      iconColor: "text-blue-500"
    },
    {
        title: "Todo bajo Control",
        description: "Encuentra el Manual de Usuario y todas tus herramientas en la barra lateral izquierda. ¡Todo a un click de distancia!",
        icon: <Info className="w-16 h-16" />,
        color: "from-orange-500/20 to-amber-500/10",
        iconColor: "text-orange-500"
    },
    {
      title: "Respaldo y Migración",
      description: "Exporta tu biblioteca completa en archivos .mssync. Ideal para mover tu música entre navegadores de PC o crear respaldos locales permanentes.",
      icon: <FileArchive className="w-16 h-16" />,
      color: "from-cyan-500/20 to-blue-500/10",
      iconColor: "text-blue-500"
    },
    {
      title: "Herramientas Pro",
      description: "Corta canciones, usa el Ecualizador de 5 bandas y disfruta del Visualizador Holográfico sincronizado.",
      icon: <div className="flex gap-4"><SlidersHorizontal className="w-12 h-12" /><Scissors className="w-12 h-12" /></div>,
      color: "from-indigo-500/20 to-purple-500/10",
      iconColor: "text-indigo-500"
    },
    {
      title: "Cerebro Inteligente",
      description: "Gemini 2.5 Flash analiza tus metadatos para recomendarte música y traduce letras al español en tiempo real.",
      icon: <Bot className="w-16 h-16" />,
      color: "from-purple-500/20 to-pink-500/10",
      iconColor: "text-purple-500"
    }
  ];

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-xl"
          onClick={onClose}
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 40 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative w-full max-w-xl bg-white/95 border border-black/10 rounded-[40px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] flex flex-col md:backdrop-blur-3xl"
        >
          {/* Top Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex gap-1 px-8 pt-6 z-50">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className="flex-1 h-full rounded-full overflow-hidden bg-slate-200 shadow-inner"
              >
                <motion.div 
                  initial={false}
                  animate={{ 
                    width: i <= currentSlide ? '100%' : '0%',
                    opacity: i <= currentSlide ? 1 : 0.3
                  }}
                  className={`h-full bg-gradient-to-r ${slides[currentSlide].color.replace('/20', '').replace('/10', '')} brightness-110`}
                />
              </div>
            ))}
          </div>

          {/* Dynamic Background Blob */}
          <div className={`absolute -top-24 -left-24 w-64 h-64 bg-gradient-to-br ${slides[currentSlide].color} blur-[120px] rounded-full transition-colors duration-1000 opacity-40 animate-glow-pulse`} />
          <div className={`absolute -bottom-24 -right-24 w-64 h-64 bg-gradient-to-br ${slides[currentSlide].color} blur-[120px] rounded-full transition-colors duration-1000 opacity-40 animate-glow-pulse`} style={{ animationDelay: '2s' }} />

          {/* Slide Content */}
          <div className="relative p-8 md:p-14 pb-8 md:pb-10 min-h-[480px] flex flex-col items-center text-center justify-center">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center w-full"
              >
                {/* Icon Container with Aura */}
                <div className="relative mb-10 md:mb-12 group">
                   <div className={`absolute inset-0 blur-3xl opacity-20 ${slides[currentSlide].iconColor.replace('text-', 'bg-')} scale-150 animate-glow-pulse`} />
                   <div className={`relative p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-xl ${slides[currentSlide].iconColor} animate-float`}>
                     {slides[currentSlide].icon}
                   </div>
                </div>

                <motion.h2 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl md:text-5xl font-black italic tracking-tighter text-slate-900 mb-4 md:mb-6 uppercase leading-tight text-center w-full"
                >
                  {slides[currentSlide].title}
                </motion.h2>

                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-slate-600 text-sm md:text-xl leading-relaxed max-w-sm mx-auto font-bold text-center italic"
                >
                  {slides[currentSlide].description}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Controls */}
          <div className="relative p-6 md:p-8 px-8 md:px-12 bg-slate-50 border-t border-slate-200 flex flex-row items-center justify-between gap-4">
            
            <div className="flex flex-col items-start min-w-[80px]">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Avance</span>
              <span className="text-xs md:text-sm font-black text-slate-900 italic">{currentSlide + 1} de {slides.length}</span>
            </div>

            <div className="flex gap-2 md:gap-4 shrink-0">
              {currentSlide > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all active:scale-95 font-black tracking-widest text-[9px] md:text-[10px] uppercase border border-slate-200"
                >
                  Atrás
                </button>
              )}

              <button
                onClick={handleNext}
                className="flex items-center gap-2 md:gap-3 px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all active:scale-95 font-black tracking-widest text-[9px] md:text-[10px] uppercase shadow-lg shadow-emerald-500/10"
                style={{ 
                  background: currentSlide === slides.length - 1 ? '' : `linear-gradient(135deg, ${slides[currentSlide].iconColor === 'text-emerald-500' ? '#10b981' : '#3b82f6'}, #2563eb)`
                }}
              >
                {currentSlide === slides.length - 1 ? (
                  <>Explorar <Check className="w-4 h-4" /></>
                ) : (
                  <>Siguiente <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
