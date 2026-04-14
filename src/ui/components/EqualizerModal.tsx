import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { audioAnalyzer } from '../../infrastructure/services/AudioAnalyzerService';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESETS = {
  'Plano': [0, 0, 0, 0, 0],
  'Bass Boost': [10, 6, 0, -2, -4],
  'Rock': [6, 4, -2, 4, 6],
  'Pop': [-2, 2, 6, 4, -2],
  'Acústico': [4, 2, 0, 2, 4],
  'Electrónica': [6, 0, -4, 2, 6]
};

const BANDS = ['60Hz', '230Hz', '910Hz', '3.6KHz', '14KHz'];

export const EqualizerModal: React.FC<EqualizerModalProps> = ({ isOpen, onClose }) => {
  const [gains, setGains] = useState<number[]>([0, 0, 0, 0, 0]);
  const [activePreset, setActivePreset] = useState<string>('Plano');

  useEffect(() => {
    if (isOpen) {
      setGains(audioAnalyzer.getEqualizerGains());
    }
  }, [isOpen]);

  const handleGainChange = (index: number, value: number) => {
    const newGains = [...gains];
    newGains[index] = value;
    setGains(newGains);
    audioAnalyzer.setEqualizerGains(newGains);
    setActivePreset('Custom');
  };

  const applyPreset = (presetName: string) => {
    const presetGains = PRESETS[presetName as keyof typeof PRESETS];
    setGains(presetGains);
    audioAnalyzer.setEqualizerGains(presetGains);
    setActivePreset(presetName);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed z-[200] bottom-28 left-4 right-4 sm:left-auto sm:right-8 sm:w-[420px] bg-[var(--bg-card)]/90 backdrop-blur-2xl border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-black/20">
          <div className="flex items-center gap-2 text-white font-black uppercase tracking-wider text-sm p-1">
            <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
            MusicScript EQ
          </div>
          <button onClick={onClose} className="p-2 text-[var(--text-muted)] hover:text-white hover:bg-white/10 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 md:p-6 transition-all">
          {/* Presets */}
          <div className="flex overflow-x-auto gap-2 pb-4 mb-4 md:mb-6 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {Object.keys(PRESETS).map((preset) => (
              <button
                key={preset}
                onClick={() => applyPreset(preset)}
                className={`whitespace-nowrap px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-bold transition-all border ${
                  activePreset === preset 
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' 
                    : 'bg-black/20 text-[var(--text-muted)] border-[var(--border-color)] hover:bg-black/40 hover:text-white'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Sliders Container */}
          <div className="flex justify-between h-48 md:h-56 bg-black/40 rounded-[32px] p-4 md:p-6 border border-white/5 shadow-inner backdrop-blur-xl gap-2">
            {gains.map((gain, idx) => {
              const DESCRIPTIONS = ['Graves', 'Bajos', 'Medios', 'Brillo', 'Aire'];
              return (
                <div key={idx} className="flex flex-col items-center justify-between h-full flex-1">
                  <span className="text-[9px] md:text-[10px] font-black text-emerald-400 w-full text-center tabular-nums">
                    {gain > 0 ? '+' : ''}{gain}dB
                  </span>
                  <div className="relative h-24 md:h-28 w-6 flex items-center justify-center">
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="1"
                      value={gain}
                      onChange={(e) => handleGainChange(idx, parseFloat(e.target.value))}
                      className="absolute w-24 md:w-28 h-1 md:h-1.5 bg-zinc-800 rounded-full appearance-none outline-none cursor-pointer accent-emerald-500"
                      style={{
                        transform: 'rotate(-90deg)',
                        WebkitAppearance: 'none'
                      }}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-0.5 mt-2">
                    <span className="text-[7px] md:text-[9px] font-black tracking-wider text-emerald-500/50 uppercase whitespace-nowrap">{BANDS[idx]}</span>
                    <span className="text-[6px] md:text-[7px] font-black tracking-[0.1em] text-zinc-500 uppercase whitespace-nowrap opacity-60">{DESCRIPTIONS[idx]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
