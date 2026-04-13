import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Download, FileAudio, Info, Scissors, SlidersHorizontal, Bot, Network } from 'lucide-react';
import MusicScriptLogo from '../components/MusicScriptLogo';

const GuideView: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto space-y-12 pb-20">

        {/* Header Section */}
        <header className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 mx-auto mb-6"
          >
            <MusicScriptLogo />
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
            icon={
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-red-600">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            }
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
            icon={
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-emerald-500">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.49 17.31c-.215.353-.675.465-1.03.25-2.813-1.718-6.354-2.106-10.523-1.154-.403.093-.81-.157-.903-.56-.094-.404.156-.81.56-.903 4.566-1.045 8.49-.6 11.646 1.328.355.216.466.677.25 1.03zm1.465-3.264c-.27.44-.848.578-1.288.308-3.22-1.977-8.122-2.55-11.927-1.396-.5.152-1.023-.13-1.176-.63-.153-.5.13-1.022.63-1.175 4.343-1.32 9.743-.678 13.454 1.597.44.27.578.847.308 1.287zm.126-3.41c-3.864-2.296-10.245-2.508-13.935-1.387-.593.18-1.22-.155-1.4-.748-.18-.593.155-1.22.748-1.4 4.234-1.285 11.282-1.013 15.714 1.62.533.316.71 1.01.394 1.543-.317.533-1.01.71-1.543.394z" />
              </svg>
            }
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

        {/* PRO FEATURES SECTION */}
        <div className="mt-16 text-center space-y-4">
          <h2 className="text-2xl md:text-4xl font-black text-[var(--text-main)] italic tracking-tighter uppercase mb-8">Herramientas PRO</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Audio Trimmer */}
          <GuideCard
            step="Pro"
            title="Cortador de Audio"
            icon={<Scissors className="w-7 h-7 text-blue-400" />}
            color="border-blue-500/20 hover:border-blue-500/50"
          >
            <p className="text-sm text-[var(--text-muted)] font-bold mb-6">Recorta canciones sin perder calidad y expórtalas a MP3 nativamente.</p>
            <ul className="space-y-4">
              <StepItem num="1" text="Haz clic en el engranaje ⚙️ de cualquier canción en tu librería." />
              <StepItem num="2" text="Mueve los cursores para elegir tu fragmento favorito." />
              <StepItem num="3" text="Guárdala como copia o Reemplaza la original." />
            </ul>
          </GuideCard>

          {/* Equalizer */}
          <GuideCard
            step="Pro"
            title="Ecualizador 5-Bandas"
            icon={<SlidersHorizontal className="w-7 h-7 text-indigo-400" />}
            color="border-indigo-500/20 hover:border-indigo-500/50"
          >
            <p className="text-sm text-[var(--text-muted)] font-bold mb-6">Refina tu experiencia acústica con presets en tiempo real.</p>
            <ul className="space-y-4">
              <StepItem num="1" text="Actívalo desde la barra de reproducción (abajo a la derecha)." />
              <StepItem num="2" text="Dibuja tu propia curva en los 'Sliders' verticales." />
              <StepItem num="3" text="O utiliza los botones inferiores para aplicar Presets como 'Rock' o 'Bass Boost'." />
            </ul>
          </GuideCard>

          {/* AIAssistant */}
          <GuideCard
            step="Pro"
            title="Cerebro Inteligente (IA)"
            icon={<Bot className="w-7 h-7 text-purple-400" />}
            color="border-purple-500/20 hover:border-purple-500/50"
          >
            <p className="text-sm text-[var(--text-muted)] font-bold mb-6">Un bot impulsado por Gemini que conoce tu librería.</p>
            <ul className="space-y-4">
              <StepItem num="1" text="Ingresa al ícono del Cerebro en el menú lateral." />
              <StepItem num="2" text="Pídele recomendaciones o deja que traduzca tus letras automáticamente." />
              <StepItem num="3" text="Configura su motor Gemini 2.5 Flash desde los ajustes de la IA." />
            </ul>
          </GuideCard>

          <GuideCard
            step="Pro"
            title="Respaldo y Migración"
            icon={<Network className="w-7 h-7 text-blue-500" />}
            color="border-blue-500/20 hover:border-blue-500/50"
          >
            <p className="text-sm text-[var(--text-muted)] font-bold mb-6">Mueve tu música entre navegadores de PC o crea copias de seguridad locales.</p>
            <ul className="space-y-4">
              <StepItem num="1" text="Entra a 'Sync Center' y genera tu archivo de bóveda (.mssync)." />
              <StepItem num="2" text="Guarda este archivo en una memoria USB o disco duro como respaldo." />
              <StepItem num="3" text="En el nuevo navegador o PC, entra a la misma sección y carga el archivo." />
              <StepItem num="4" text="¡Listo! Tu biblioteca se reconstruirá idénticamente en el nuevo entorno." />
            </ul>
          </GuideCard>

        </div>



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
