import React, { useState } from 'react';
import Sidebar from './Sidebar';
import AmbientVisualizer from './AmbientVisualizer';
import { useAmbientColor } from '../../hooks/useAmbientColor';
import { Menu, Sun, Moon, LayoutGrid, Smartphone, Disc } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  player: any;
  playlists: any;
  onViewChange: (view: string) => void;
  onCreatePlaylist: () => void;
  // NEW PROPS for theme/view control
  viewMode: 'modern' | 'ipod' | 'cassette';
  isDark: boolean;
  onToggleView: () => void;
  onToggleTheme: () => void;
}

const AppShell: React.FC<AppShellProps> = ({ 
  children, 
  player, 
  playlists,
  onViewChange,
  onCreatePlaylist,
  viewMode,
  isDark,
  onToggleView,
  onToggleTheme
}) => {
  const ambient = useAmbientColor(player.currentSong?.coverUrl);
  const [activeView, setActiveView] = useState('library');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const ViewIcon = () => {
    switch(viewMode) {
      case 'modern': return <LayoutGrid className="w-5 h-5" />;
      case 'ipod': return <Smartphone className="w-5 h-5" />;
      case 'cassette': return <Disc className="w-5 h-5" />;
    }
  };

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
            setIsSidebarOpen(false);
          }}
          onCreatePlaylist={onCreatePlaylist}
          onDeletePlaylist={playlists.deletePlaylist}
          onClose={() => setIsSidebarOpen(false)}
          // Pass props to sidebar for PC view
          viewMode={viewMode}
          isDark={isDark}
          onToggleView={onToggleView}
          onToggleTheme={onToggleTheme}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 h-full relative z-10 flex flex-col overflow-hidden">
        {/* Mobile Header - INTEGRATED CONTROLS */}
        <div className="md:hidden flex items-center justify-between p-4 bg-[var(--bg-sidebar)] backdrop-blur-xl border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-[var(--text-main)]">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-black uppercase text-[var(--text-main)] italic tracking-tighter">MusicScript</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onToggleView}
              className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20"
            >
              <ViewIcon />
            </button>
            <button 
              onClick={onToggleTheme}
              className="p-2.5 bg-[var(--bg-card)] text-[var(--text-main)] rounded-xl border border-[var(--border-color)]"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Main Content container - Reduced padding to expand content upwards */}
        <div className="flex-1 overflow-y-auto md:overflow-hidden p-4 md:p-6 lg:p-4 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppShell;
