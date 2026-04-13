import { X, Library, Heart, HelpCircle, LayoutGrid, Sparkles, Plus, ListMusic, Trash2, Smartphone, Disc, Sun, Moon, Network } from 'lucide-react';
import MusicScriptLogo from './MusicScriptLogo';
import type { PlaylistRecord } from '../../infrastructure/persistence/MusicDatabase';

interface SidebarProps {
  playlists: PlaylistRecord[];
  activeView: string;
  onViewChange: (view: string) => void;
  onCreatePlaylist: () => void;
  onDeletePlaylist: (id: string) => void;
  onClose?: () => void;
  // NEW PROPS for theme/view control in PC
  viewMode: 'modern' | 'ipod' | 'cassette';
  isDark: boolean;
  onToggleView: () => void;
  onToggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  playlists,
  activeView,
  onViewChange,
  onCreatePlaylist,
  onDeletePlaylist,
  onClose,
  viewMode,
  isDark,
  onToggleView,
  onToggleTheme
}) => {
  const ViewIcon = () => {
    switch (viewMode) {
      case 'modern': return <LayoutGrid className="w-5 h-5" />;
      case 'ipod': return <Smartphone className="w-5 h-5" />;
      case 'cassette': return <Disc className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-72 h-full bg-[var(--bg-sidebar)] backdrop-blur-3xl border-r border-[var(--border-color)] flex flex-col p-6 overflow-hidden transition-colors duration-500">
      <div className="flex items-center justify-between mb-10 px-2 lg:px-0">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 flex items-center justify-center -ml-3">
            <MusicScriptLogo showText={false} />
          </div>
          <h1 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter italic">MusicScript</h1>
        </div>
        <button onClick={onClose} className="md:hidden p-2 text-[var(--text-muted)] hover:text-emerald-500">
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
        {/* Main Navigation */}
        <div className="space-y-1">
          <p className="px-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-[0.2em] mb-3 opacity-60">Biblioteca</p>
          <NavItem
            icon={<Library className="w-5 h-5" />}
            label="Todas las Canciones"
            active={activeView === 'library'}
            onClick={() => onViewChange('library')}
          />
          <NavItem
            icon={<Heart className="w-5 h-5" />}
            label="Favoritos"
            active={activeView === 'favorites'}
            onClick={() => onViewChange('favorites')}
          />
        </div>

        {/* AI Assistant */}
        <div className="space-y-1">
          <p className="px-4 text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] mb-3 opacity-60">Inteligencia</p>
          <NavItem
            icon={<Sparkles className="w-5 h-5" />}
            label="Asistente IA"
            active={activeView === 'ai'}
            onClick={() => onViewChange('ai')}
          />
        </div>

        {/* Sync Center */}
        <div className="space-y-1">
          <p className="px-4 text-[10px] font-black uppercase text-blue-500 tracking-[0.2em] mb-3 opacity-60">Conexión</p>
          <NavItem
            icon={<Network className="w-5 h-5" />}
            label="Sync Center"
            active={activeView === 'sync'}
            onClick={() => onViewChange('sync')}
          />
        </div>

        {/* Playlists */}
        <div className="space-y-1">
          <div className="px-4 flex justify-between items-center mb-3">
            <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-[0.2em] opacity-60">Playlists</p>
            <button
              onClick={onCreatePlaylist}
              className="p-1 hover:bg-white/10 rounded-full transition-colors text-[var(--text-muted)] hover:text-emerald-400"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            {playlists.map((pl) => (
              <div key={pl.id} className="group relative">
                <NavItem
                  icon={<ListMusic className="w-5 h-5" />}
                  label={pl.name}
                  active={activeView === pl.id}
                  onClick={() => onViewChange(pl.id)}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); onDeletePlaylist(pl.id); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        {/* Help / Guide */}
        <div className="space-y-1 pt-4">
          <NavItem
            icon={<HelpCircle className="w-5 h-5" />}
            label="¿Cómo Utilizar?"
            active={activeView === 'guide'}
            onClick={() => onViewChange('guide')}
          />
        </div>
      </nav>

      {/* FOOTER: Integrated Theme and Mode Controls for PC view */}
      <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={onToggleView}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-2xl border border-emerald-500/20 transition-all active:scale-95 text-xs font-black uppercase tracking-widest"
          >
            <ViewIcon />
            <span className="hidden lg:inline">{viewMode}</span>
          </button>
          <button
            onClick={onToggleTheme}
            className="p-3 bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--border-color)] rounded-2xl border border-[var(--border-color)] transition-all active:scale-95"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/10">
          <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1 tracking-widest opacity-80">PROYECTO UNIVERSITARIO</p>
          <p className="text-xs text-[var(--text-muted)] font-black uppercase italic">Gabriel Paz 2026</p>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm ${active
      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/10'
      : 'text-[var(--text-muted)] hover:bg-emerald-500/10 hover:text-emerald-500'
      }`}
  >
    {icon}
    <span className="truncate">{label}</span>
  </button>
);

export default Sidebar;
