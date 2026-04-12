import React from 'react';
import { motion } from 'framer-motion';
import { Video, ExternalLink, Download, FileAudio, Info, Music as MusicIcon, HelpCircle } from 'lucide-react';

const GuideView: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto space-y-12 pb-20">

        {/* Header Section */}
        <header className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-emerald-600 rounded-[30px] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20 mb-6"
          >
            <HelpCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-black text-[var(--text-main)] italic tracking-tighter uppercase">¿Cómo utilizar MusicScript?</h1>
          <p className="text-[10px] md:text-xs font-black text-emerald-500 uppercase tracking-[0.4em] opacity-80 italic">Guía paso a paso para poblar tu biblioteca</p>
        </header>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* STEP 1: YouTube */}
          <GuideCard
            step="01"
            title="Desde YouTube"
            icon={<Video className="w-8 h-8 text-red-500" />}
            color="border-red-500/20 hover:border-red-500/50"
          >
            <p className="text-sm text-[var(--text-muted)] font-bold mb-6">Convierte cualquier video musical en una pista de alta calidad.</p>
            <ul className="space-y-4 mb-8">
              <StepItem num="1" text="Copia el enlace de tu canción favorita en YouTube." />
              <StepItem num="2" text="Pégalo en nuestro conversor recomendado." />
              <StepItem num="3" text="Descarga el archivo MP3 a tu dispositivo." />
            </ul>
            <a
              href="https://es.savemp3.net/plc59/youtube-video-to-mp3/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between w-full p-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest border border-red-500/20"
            >
              <span>Ir a SaveMP3</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </GuideCard>

          {/* STEP 2: Spotify */}
          <GuideCard
            step="02"
            title="Desde Spotify"
            icon={<MusicIcon className="w-8 h-8 text-emerald-500" />}
            color="border-emerald-500/20 hover:border-emerald-500/50"
          >
            <p className="text-sm text-[var(--text-muted)] font-bold mb-6">¿Tienes tus temazos en Spotify? También puedes traerlos.</p>
            <ul className="space-y-4 mb-8">
              <StepItem num="1" text="Busca el enlace de la canción en Spotify." />
              <StepItem num="2" text="Usa SpotiDown para extraer los archivos." />
              <StepItem num="3" text="Guarda los archivos en tu PC o móvil." />
            </ul>
            <a
              href="https://spotidown.app/es5"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between w-full p-4 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest border border-emerald-500/20"
            >
              <span>Ir a SpotiDown</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </GuideCard>

        </div>

        {/* FINAL STEP: Integration */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Download className="w-32 h-32" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 text-emerald-500 mb-4">
              <FileAudio className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Paso Final</span>
            </div>
            <h3 className="text-2xl md:text-4xl font-black text-[var(--text-main)] italic tracking-tighter uppercase mb-6">Súbelo a MusicScript</h3>
            <p className="text-[var(--text-muted)] font-bold text-lg mb-8 leading-relaxed">
              Una vez tengas tus archivos MP3, simplemente pulsa el botón <span className="text-emerald-500">+ AÑADIR</span> en la esquina superior derecha de la biblioteca. MusicScript extraerá automáticamente la carátula, el título y el artista. 🎉
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-500 uppercase">Sin líos</div>
              <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-500 uppercase">Privacidad Total</div>
              <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-500 uppercase">Estilo Premium</div>
            </div>
          </div>
        </motion.div>

        {/* Footer info */}
        <footer className="flex items-center justify-center gap-3 opacity-30">
          <Info className="w-4 h-4" />
          <p className="text-[10px] font-black uppercase tracking-widest">MusicScript no aloja archivos, todo se guarda localmente en tu navegador.</p>
        </footer>

      </div>
    </div>
  );
};

const GuideCard = ({ step, title, icon, color, children }: { step: string, title: string, icon: any, color: string, children: React.ReactNode }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    className={`bg-[var(--bg-card)] p-8 rounded-[32px] border transition-all duration-500 shadow-xl ${color}`}
  >
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center shadow-inner">
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest mb-0.5 italic">Paso {step}</p>
          <h4 className="text-xl font-black text-[var(--text-main)] italic uppercase tracking-tight">{title}</h4>
        </div>
      </div>
    </div>
    {children}
  </motion.div>
);

const StepItem = ({ num, text }: { num: string, text: string }) => (
  <li className="flex gap-4">
    <span className="w-5 h-5 flex-shrink-0 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded flex items-center justify-center border border-emerald-500/20">{num}</span>
    <span className="text-xs font-bold text-[var(--text-muted)] leading-relaxed">{text}</span>
  </li>
);

export default GuideView;
