import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = true
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-[var(--bg-glass)] backdrop-blur-3xl border border-[var(--border-color)] rounded-[32px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className={`h-2 w-full ${isDestructive ? 'bg-red-500' : 'bg-emerald-500'}`} />
            
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-2xl ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-[var(--text-main)] italic uppercase">{title}</h3>
              </div>
              
              <p className="text-[var(--text-muted)] font-bold text-sm leading-relaxed mb-8">
                {message}
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={onConfirm}
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-white transition-all active:scale-95 ${
                    isDestructive 
                      ? 'bg-red-600 hover:bg-red-500 shadow-[0_10px_30px_rgba(239,68,68,0.3)]' 
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_10px_30px_rgba(16,185,129,0.3)]'
                  }`}
                >
                  {confirmText}
                </button>
                <button
                  onClick={onCancel}
                  className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all hover:bg-white/5 active:scale-95"
                >
                  {cancelText}
                </button>
              </div>
            </div>
            
            <button 
              onClick={onCancel}
              className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
