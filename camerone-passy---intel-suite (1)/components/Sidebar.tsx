import React from 'react';
import { Radar, Globe, UserSearch, FileText, Settings, LogOut, Shield } from 'lucide-react';

interface SidebarProps {
  onReset: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onReset }) => {
  const menuItems = [
    { icon: Radar, label: 'Radar Scientifique', active: true },
    { icon: Globe, label: 'Sentinelle Web', active: false },
    { icon: UserSearch, label: 'Profiler Dirigeants', active: false },
    { icon: FileText, label: 'Rapport SWOT', active: false },
  ];

  return (
    <aside className="w-20 lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 z-30 transition-all duration-300">
      
      {/* Branding */}
      <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
        <Shield className="w-8 h-8 text-amber-500 shrink-0" />
        <span className="hidden lg:block ml-3 font-bold text-slate-200 tracking-wider text-sm">
          CAMERONE PASSY
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center px-4 lg:px-6 py-3 border-l-2 transition-colors ${
              item.active 
              ? 'border-amber-500 bg-slate-800/50 text-amber-500' 
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="hidden lg:block ml-3 text-xs font-bold uppercase tracking-wide">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Footer / System */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <button className="w-full flex items-center justify-center lg:justify-start px-2 py-2 text-slate-500 hover:text-slate-300 transition-colors">
          <Settings className="w-5 h-5" />
          <span className="hidden lg:block ml-3 text-xs uppercase">Configuration</span>
        </button>
        <button 
          onClick={onReset}
          className="w-full flex items-center justify-center lg:justify-start px-2 py-2 text-amber-500/70 hover:text-amber-500 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden lg:block ml-3 text-xs uppercase font-bold">Clôturer Dossier</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;