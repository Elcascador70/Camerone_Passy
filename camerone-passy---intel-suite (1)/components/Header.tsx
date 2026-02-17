import React from 'react';
import { Search, Bell, AlertTriangle } from 'lucide-react';
import { TargetData } from '../types';

interface HeaderProps {
  target: TargetData;
}

const Header: React.FC<HeaderProps> = ({ target }) => {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-20">
      
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-sm pl-10 pr-3 py-2.5 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 placeholder-slate-600 font-mono"
            placeholder={`RECHERCHE INTRA-DOSSIER : ${target.name.toUpperCase()}...`}
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-6">
        
        {/* Threat Level Indicator (DEFCON Style) */}
        <div className="hidden md:flex items-center space-x-3 bg-slate-950 px-4 py-1.5 border border-slate-800 rounded-sm">
           <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Niveau Menace</span>
           <div className="flex items-center space-x-1">
              <div className="w-2 h-6 bg-red-900/50 rounded-sm"></div>
              <div className="w-2 h-6 bg-red-900/50 rounded-sm"></div>
              <div className="w-2 h-6 bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)] rounded-sm"></div>
              <div className="w-2 h-6 bg-slate-800 rounded-sm"></div>
              <div className="w-2 h-6 bg-slate-800 rounded-sm"></div>
           </div>
           <span className="text-amber-500 font-bold font-mono text-lg">3</span>
        </div>

        {/* Notifications */}
        <button className="relative text-slate-400 hover:text-slate-200 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-slate-900 bg-amber-500"></span>
        </button>
        
        {/* User Status */}
        <div className="flex items-center space-x-2">
            <div className="text-right hidden md:block">
                <div className="text-xs font-bold text-slate-300">AGENT 404</div>
                <div className="text-[10px] text-amber-500 font-mono tracking-wide">ENCRYPTED</div>
            </div>
            <div className="w-8 h-8 bg-slate-800 border border-slate-600 rounded flex items-center justify-center text-slate-400">
                <AlertTriangle className="w-4 h-4" />
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;