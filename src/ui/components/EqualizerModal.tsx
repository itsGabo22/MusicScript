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
        className="fixed z-50 bottom-28 left-4 right-4 sm:left-auto sm:right-8 sm:w-[420px] bg-[var(--bg-card)]/90 backdrop-blur-2xl border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden"
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

        <div className="p-6">
          {/* Presets */}
          <div className="flex overflow-x-auto gap-2 pb-4 mb-6 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {Object.keys(PRESETS).map((preset) => (
              <button
                key={preset}
                onClick={() => applyPreset(preset)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  activePreset === preset 
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' 
                    : 'bg-black/20 text-[var(--text-muted)] border-[var(--border-color)] hover:bg-black/40 hover:text-white'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Sliders */}
          <div className="flex justify-between h-56 bg-black/40 rounded-3xl p-6 border border-white/5 shadow-inner backdrop-blur-xl">
            {gains.map((gain, idx) => (
              <div key={idx} className="flex flex-col items-center gap-4">
                <span className="text-[10px] font-black text-emerald-400 w-6 text-center tabular-nums">
                  {gain > 0 ? '+' : ''}{gain}
                </span>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={gain}
                  onChange={(e) => handleGainChange(idx, parseFloat(e.target.value))}
                  className="w-1.5 h-full bg-zinc-800 rounded-full appearance-none outline-none focus:outline-none cursor-pointer"
                  style={{
                    writingMode: 'vertical-lr',
                    direction: 'rtl',
                    accentColor: '#10b981'
                  } as any}
                />
                <span className="text-[9px] font-black tracking-wider text-zinc-500 uppercase">{BANDS[idx]}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
