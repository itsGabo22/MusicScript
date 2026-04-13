import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Bot, SlidersHorizontal, Scissors, LayoutDashboard, Check, FileAudio, FileArchive } from 'lucide-react';
import MusicScriptLogo from './MusicScriptLogo';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const slides = [
  {
    title: "Bienvenido a MusicScript",
    description: "Mucho más que un reproductor de música. Has entrado a una estación de audio In-Browser y almacenamiento 100% privado en tu dispositivo.",
    icon: <MusicScriptLogo />,
    color: "from-emerald-500/20 to-teal-900/20",
    iconColor: "text-emerald-400"
  },
  {
    title: "Agrega tu Música",
    description: "Para empezar, pulsa el botón '+ AÑADIR' en la esquina superior de tu Biblioteca y sube tus archivos MP3 descargados. ¡MusicScript extraerá los nombres y carátulas por sí solo!",
    icon: <FileAudio className="w-16 h-16" />,
    color: "from-blue-500/20 to-indigo-900/20",
    iconColor: "text-blue-400"
  },
  {
    title: "Audio Profesional",
    description: "Toca el ícono de engranaje (herramientas) en cualquier canción de tu biblioteca para Recortarla nativamente en MP3/WAV. Usa el Ecualizador en la barra inferior para mejorar el sonido en tiempo real.",
    icon: <div className="flex gap-4"><SlidersHorizontal className="w-12 h-12" /><Scissors className="w-12 h-12" /></div>,
    color: "from-indigo-500/20 to-cyan-900/20",
    iconColor: "text-indigo-400"
  },
  {
    title: "Bóveda de Sincronización",
    description: "Exporta toda tu música en un archivo .mssync para llevarla a otros dispositivos. ¡Es universal, no requiere Wi-Fi y mantiene toda la calidad original!",
    icon: <FileArchive className="w-16 h-16" />,
    color: "from-blue-500/20 to-indigo-900/20",
    iconColor: "text-blue-400"
  },
  {
    title: "Asistente Inteligente (IA)",
    description: "Hemos integrado el cerebro de Gemini 2.0 Flash. Pídele a tu bot que analice tu biblioteca y tus favoritos para recomendarte o generarte listas de reproducción afines a tu humor.",
    icon: <Bot className="w-16 h-16" />,
    color: "from-purple-500/20 to-fuchsia-900/20",
    iconColor: "text-purple-400"
  },
  {
    title: "Todo en un solo lugar",
    description: "Adéntrate en modos iPod, Cassette o lee letras Holográficas. NOTA: Puedes repasar toda esta información en detalle abriendo el Menú (las 3 rayitas en celular) y entrando al MANUAL en la barra izquierda.",
    icon: <LayoutDashboard className="w-16 h-16" />,
    color: "from-orange-500/20 to-rose-900/20",
    iconColor: "text-orange-400"
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
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-xl"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-[var(--bg-glass)] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Top Decorative Gradient */}
          <div className={`absolute top-0 left-0 right-0 h-40 bg-gradient-to-b ${slides[currentSlide].color} opacity-50 transition-colors duration-700`} />

          {/* Slide Content */}
          <div className="relative p-8 md:p-12 pb-6 min-h-[350px] flex flex-col items-center text-center justify-center">

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center w-full"
              >
                <div className={`mb-6 p-4 rounded-full bg-white/5 border border-white/10 ${slides[currentSlide].iconColor}`}>
                  {slides[currentSlide].icon}
                </div>

                <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter text-white mb-4 uppercase">
                  {slides[currentSlide].title}
                </h2>

                <p className="text-[var(--text-muted)] text-base md:text-lg leading-relaxed max-w-md mx-auto">
                  {slides[currentSlide].description}
                </p>
              </motion.div>
            </AnimatePresence>

          </div>

          {/* Footer Controls */}
          <div className="relative p-6 md:p-8 bg-black/20 border-t border-white/5 flex items-center justify-between">

            {/* Dots */}
            <div className="flex items-center gap-2">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-emerald-500' : 'w-2 bg-white/20'}`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              {currentSlide > 0 && (
                <button
                  onClick={handlePrev}
                  className="p-3 md:px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all active:scale-95 font-bold tracking-widest text-xs uppercase"
                >
                  Atrás
                </button>
              )}

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 md:px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all active:scale-95 font-black tracking-widest text-xs uppercase shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
              >
                {currentSlide === slides.length - 1 ? (
                  <>Empezar <Check className="w-5 h-5" /></>
                ) : (
                  <>Siguiente <ChevronRight className="w-5 h-5" /></>
                )}
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
