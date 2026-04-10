import React, { useState } from 'react';
import Sidebar from './Sidebar';
import AmbientVisualizer from './AmbientVisualizer';
import { useAmbientColor } from '../../hooks/useAmbientColor';
import { Menu } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  player: any;
  playlists: any;
  onViewChange: (view: string) => void;
  onCreatePlaylist: () => void;
}

const AppShell: React.FC<AppShellProps> = ({ 
  children, 
  player, 
  playlists,
  onViewChange,
  onCreatePlaylist
}) => {
  const ambient = useAmbientColor(player.currentSong?.coverUrl);
  const [activeView, setActiveView] = useState('library');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative w-full h-screen bg-[var(--bg-shell)] flex overflow-hidden font-sans selection:bg-emerald-500/30 transition-colors duration-500">
      {/* Background Visualizer */}
      <AmbientVisualizer color={ambient} isPlaying={player.isPlaying} />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative z-[70] h-full transition-transform duration-500 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar 
          playlists={playlists.playlists}
          activeView={activeView}
          onViewChange={(view) => {
            setActiveView(view);
            onViewChange(view);
            setIsSidebarOpen(false); // Close on mobile after selection
          }}
          onCreatePlaylist={onCreatePlaylist}
          onDeletePlaylist={playlists.deletePlaylist}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 h-full relative z-10 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-6 bg-[var(--bg-sidebar)] backdrop-blur-xl border-b border-[var(--border-color)]">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-[var(--text-main)]">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-black uppercase text-[var(--text-main)]">MusicScript</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
        
        <div className="flex-1 overflow-hidden p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppShell;
