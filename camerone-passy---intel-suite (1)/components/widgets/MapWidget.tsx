import React from 'react';
import { TargetData } from '../../types';
import { Maximize2, Crosshair, MapPin } from 'lucide-react';

interface MapWidgetProps {
  target: TargetData;
}

const MapWidget: React.FC<MapWidgetProps> = ({ target }) => {
  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 relative group overflow-hidden">
        {/* Widget Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm z-10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center">
                <Crosshair className="w-3 h-3 mr-2 text-amber-500" />
                Radar de Zone
            </h3>
            <div className="flex space-x-2">
                <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">LIVE TRACKING</span>
                <Maximize2 className="w-4 h-4 text-slate-600 hover:text-slate-300 cursor-pointer" />
            </div>
        </div>

        {/* Map Placeholder Content */}
        <div className="flex-1 relative bg-slate-950 overflow-hidden">
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 z-0" 
                 style={{
                    backgroundImage: `linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    opacity: 0.2
                 }}>
            </div>

            {/* Radar Sweep Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-transparent via-amber-500/5 to-transparent rounded-full animate-[spin_4s_linear_infinite] pointer-events-none z-0 border border-slate-800/30"></div>

            {/* Center Target */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                <div className="relative">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-20 animate-ping"></span>
                    <div className="w-4 h-4 bg-amber-500 rounded-full border-2 border-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.8)]"></div>
                </div>
                <div className="mt-2 bg-slate-900/80 border border-slate-700 px-2 py-1 text-[10px] font-mono text-amber-500 whitespace-nowrap backdrop-blur">
                    {target.name.toUpperCase()}
                </div>
            </div>

            {/* Random secondary targets */}
            <div className="absolute top-1/3 left-1/4">
                <MapPin className="w-4 h-4 text-slate-600" />
                <span className="text-[9px] text-slate-600 font-mono ml-1">SR-20</span>
            </div>
            <div className="absolute bottom-1/4 right-1/3">
                <MapPin className="w-4 h-4 text-slate-600" />
                <span className="text-[9px] text-slate-600 font-mono ml-1">OP-99</span>
            </div>

            {/* Map UI Overlays */}
            <div className="absolute bottom-4 left-4 font-mono text-[10px] text-slate-500 space-y-1 z-10">
                <div className="flex space-x-4">
                    <span>LAT: 48.8566 N</span>
                    <span>LNG: 2.3522 E</span>
                </div>
                <div>ZOOM: 84% // SECTOR: {target.sector}</div>
            </div>
        </div>
    </div>
  );
};

export default MapWidget;