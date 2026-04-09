import { useState } from 'react';
import { useMusicPlayer } from './hooks/useMusicPlayer';
import { Moon, Sun, Monitor, Smartphone } from 'lucide-react';
import DefaultPlayer from './ui/layouts/DefaultPlayer';
import IpodPlayer from './ui/layouts/IpodPlayer';

type ViewMode = 'modern' | 'ipod';

function App() {
  const player = useMusicPlayer();
  const [isDark, setIsDark] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('modern');

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.body.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors duration-500`}>
      {/* Top Controls */}
      <div className="fixed top-6 right-6 flex gap-3 z-50">
        <button 
          onClick={() => setViewMode(viewMode === 'modern' ? 'ipod' : 'modern')}
          className="p-3 rounded-2xl bg-white/40 dark:bg-emerald-950/40 backdrop-blur-lg shadow-xl border border-white/20 dark:border-emerald-500/20 hover:scale-110 transition-all hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 group"
          title="Switch Player Mode"
        >
          {viewMode === 'modern' ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
        </button>
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-white/40 dark:bg-emerald-950/40 backdrop-blur-lg shadow-xl border border-white/20 dark:border-emerald-500/20 hover:scale-110 transition-all hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-emerald-900 dark:text-emerald-400" />}
        </button>
      </div>

      <main className="w-full max-w-4xl flex items-center justify-center">
        {viewMode === 'modern' ? (
          <DefaultPlayer player={player} />
        ) : (
          <IpodPlayer player={player} />
        )}
      </main>

      {/* Hidden Audio Tag */}
      <audio 
        ref={player.audioRef}
        src={player.currentSong?.audioUrl}
        onTimeUpdate={player.handlers.onTimeUpdate}
        onLoadedMetadata={player.handlers.onLoadedMetadata}
        onEnded={player.handlers.onEnded}
      />
    </div>
  );
}

export default App;
