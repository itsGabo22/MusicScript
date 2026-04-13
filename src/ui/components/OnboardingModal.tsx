import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Bot, SlidersHorizontal, Scissors, Check, FileAudio, FileArchive, Sparkles } from 'lucide-react';
import MusicScriptLogo from './MusicScriptLogo';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const slides = [
  {
    title: "Bienvenido a MusicScript",
    description: "Mucho más que un reproductor de música. Has entrado a una estación de audio Pro en tu dispositivo, con almacenamiento 100% privado.",
    icon: <div className="scale-150"><MusicScriptLogo /></div>,
    color: "from-emerald-500/30 to-teal-500/10",
    iconColor: "text-emerald-500"
  },
  {
    title: "Sube tu Música",
    description: "Para empezar, pulsa '+ AÑADIR' y sube tus archivos MP3/WAV. ¡Extraeremos los metadatos y carátulas automáticamente!",
    icon: <FileAudio className="w-16 h-16" />,
    color: "from-blue-500/30 to-indigo-500/10",
    iconColor: "text-blue-500"
  },
  {
    title: "Edición Nativa",
    description: "Recorta tus canciones directamente en el navegador y ajusta el sonido con nuestro Ecualizador dinámico de 10 bandas.",
    icon: <div className="flex gap-4"><SlidersHorizontal className="w-12 h-12" /><Scissors className="w-12 h-12" /></div>,
    color: "from-indigo-500/30 to-purple-500/10",
    iconColor: "text-indigo-500"
  },
  {
    title: "Bóveda de Sync",
    description: "Exporta tu biblioteca completa en un archivo .mssync. Transfórmala de PC a Celular sin cables y con control total de duplicados.",
    icon: <FileArchive className="w-16 h-16" />,
    color: "from-blue-500/30 to-cyan-500/10",
    iconColor: "text-blue-500"
  },
  {
    title: "Inteligencia Artificial",
    description: "Gemini 2.0 Flash analiza tus gustos para recomendarte canciones o generar listas basadas en tu humor del momento.",
    icon: <Bot className="w-16 h-16" />,
    color: "from-purple-500/30 to-pink-500/10",
    iconColor: "text-purple-500"
  },
  {
    title: "Inmersión Total",
    description: "Disfruta de modos visuales tipo iPod, Cassette o letras Holográficas. Todo optimizado para una experiencia premium.",
    icon: <Sparkles className="w-16 h-16" />,
    color: "from-orange-500/30 to-red-500/10",
    iconColor: "text-orange-500"
  }
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

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
        {/* Backdrop optimized for depth */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-xl dark:bg-black/60"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 40 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative w-full max-w-xl bg-white/80 dark:bg-slate-900/80 border border-black/5 dark:border-white/10 rounded-[40px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] flex flex-col backdrop-blur-3xl"
        >
          {/* Top Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex gap-1 px-4 pt-4 z-50">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className="flex-1 h-full rounded-full overflow-hidden bg-black/5 dark:bg-white/10"
              >
                <motion.div 
                  initial={false}
                  animate={{ 
                    width: i < currentSlide ? '100%' : i === currentSlide ? '100%' : '0%',
                    opacity: i <= currentSlide ? 1 : 0.3
                  }}
                  className={`h-full bg-gradient-to-r ${slides[i].iconColor.replace('text-', 'from-').replace('text-', 'to-')} brightness-110`}
                />
              </div>
            ))}
          </div>

          {/* Dynamic Background Blob */}
          <div className={`absolute -top-24 -left-24 w-64 h-64 bg-gradient-to-br ${slides[currentSlide].color} blur-[120px] rounded-full transition-colors duration-1000 opacity-60 animate-glow-pulse`} />
          <div className={`absolute -bottom-24 -right-24 w-64 h-64 bg-gradient-to-br ${slides[currentSlide].color} blur-[120px] rounded-full transition-colors duration-1000 opacity-60 animate-glow-pulse`} style={{ animationDelay: '2s' }} />

          {/* Slide Content */}
          <div className="relative p-10 md:p-14 pb-8 min-h-[420px] flex flex-col items-center text-center justify-center">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.9, rotateY: -20 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="flex flex-col items-center w-full"
              >
                {/* Icon Container with Aura */}
                <div className="relative mb-12 group">
                   <div className={`absolute inset-0 blur-3xl opacity-30 ${slides[currentSlide].iconColor.replace('text-', 'bg-')} scale-150 animate-glow-pulse`} />
                   <div className={`relative p-8 rounded-3xl bg-white/20 dark:bg-white/5 border border-white/20 dark:border-white/10 shadow-xl ${slides[currentSlide].iconColor} animate-float`}>
                     {slides[currentSlide].icon}
                   </div>
                </div>

                <motion.h2 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-5xl font-black italic tracking-tighter text-[var(--text-main)] mb-6 uppercase leading-tight"
                >
                  {slides[currentSlide].title}
                </motion.h2>

                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-[var(--text-muted)] text-base md:text-xl leading-relaxed max-w-sm mx-auto font-bold opacity-90"
                >
                  {slides[currentSlide].description}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Controls */}
          <div className="relative p-8 px-10 bg-black/5 dark:bg-black/20 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
            
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-50 mb-1">Paso</span>
              <span className="text-sm font-black text-[var(--text-main)] italic">{currentSlide + 1} de {slides.length}</span>
            </div>

            <div className="flex gap-4">
              {currentSlide > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-6 py-4 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-main)] transition-all active:scale-95 font-black tracking-widest text-[10px] uppercase border border-black/5 dark:border-white/5"
                >
                  Atrás
                </button>
              )}

              <button
                onClick={handleNext}
                className={`flex items-center gap-3 px-10 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all active:scale-95 font-black tracking-widest text-[10px] uppercase shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40`}
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
