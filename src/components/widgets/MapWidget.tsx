import React, { useState } from 'react';
import { TargetData } from '../../types';
import { Maximize2, Minimize2, Crosshair, MapPin } from 'lucide-react';

interface MapWidgetProps {
    target: TargetData;
}

const MapWidget: React.FC<MapWidgetProps> = ({ target }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const registration = target.legalProfile?.registrationNumber ?? 'N/A';
    const executive = target.legalProfile?.principalExecutiveName ?? 'N/A';
    const legalAddress = target.legalProfile?.fullAddress ?? 'Adresse indisponible';
    const parentCompany = target.legalProfile?.parentCompany;
    const etablissements = target.legalProfile?.etablissements ?? [];

    return (
        <div className={`flex flex-col border border-slate-800 relative group overflow-hidden transition-all duration-300
            ${isExpanded
                ? 'fixed inset-0 z-50 bg-slate-950 m-0 rounded-none'
                : 'h-full bg-slate-900'
            }
        `}>
            {/* Widget Header */}
            <div className={`flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm z-20 
                ${isExpanded ? 'bg-slate-950' : ''}
            `}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center">
                    <Crosshair className="w-3 h-3 mr-2 text-amber-500" />
                    Radar de Zone {isExpanded && <span className="ml-2 text-amber-500">// FULLSCREEN MODE</span>}
                </h3>
                <div className="flex space-x-2">
                    <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">LIVE TRACKING</span>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-slate-600 hover:text-slate-300 transition-colors"
                    >
                        {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Map Placeholder Content */}
            <div className="flex-1 relative bg-slate-950 overflow-hidden">

                {/* Grid Pattern */}
                <div className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: `linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`,
                        backgroundSize: isExpanded ? '80px 80px' : '40px 40px',
                        opacity: 0.2
                    }}>
                </div>

                {/* Radar Sweep Effect - Larger in fullscreen */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent rounded-full animate-[spin_4s_linear_infinite] pointer-events-none z-0 border border-slate-800/30
                     ${isExpanded ? 'w-[1200px] h-[1200px]' : 'w-[600px] h-[600px]'}
                `}></div>

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
                    <span className="text-[9px] text-slate-600 font-mono ml-1">{target.scope}</span>
                </div>
                <div className="absolute bottom-1/4 right-1/3">
                    <MapPin className="w-4 h-4 text-slate-600" />
                    <span className="text-[9px] text-slate-600 font-mono ml-1">{target.type}</span>
                </div>

                {/* Extra info in fullscreen */}
                {isExpanded && (
                    <div className="absolute top-10 right-10 z-10 w-64 bg-slate-900/90 border border-slate-700 p-4 backdrop-blur">
                        <h4 className="text-amber-500 font-bold text-xs uppercase mb-2 border-b border-slate-700 pb-2">Target Coordinates</h4>
                        <div className="space-y-2 font-mono text-[10px] text-slate-400">
                            <div className="flex justify-between"><span>LATITUDE</span> <span className="text-slate-200">48.8566 N</span></div>
                            <div className="flex justify-between"><span>LONGITUDE</span> <span className="text-slate-200">2.3522 E</span></div>
                            <div className="flex justify-between"><span>PRECISION</span> <span className="text-emerald-500">HIGH</span></div>
                            <div className="flex justify-between"><span>LAST PING</span> <span className="text-slate-200">00:00:12</span></div>
                        </div>
                        {etablissements.length > 0 && (
                            <>
                                <h4 className="text-amber-500 font-bold text-xs uppercase mb-2 border-b border-slate-700 pb-2 mt-4">Établissements ({etablissements.length})</h4>
                                <div className="space-y-2 font-mono text-[10px] text-slate-400 max-h-48 overflow-y-auto">
                                    {etablissements.map((e, i) => (
                                        <div key={i} className="border-b border-slate-800 pb-1">
                                            <div className="flex justify-between"><span>SIRET</span> <span className="text-slate-200">{e.siret}</span></div>
                                            <div className="flex justify-between"><span>VILLE</span> <span className="text-slate-200">{e.ville || 'N/A'}</span></div>
                                            <div className="flex justify-between"><span>STATUT</span> <span className={e.actif ? 'text-emerald-500' : 'text-red-500'}>{e.actif ? 'ACTIF' : 'FERMÉ'}</span></div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Map UI Overlays */}
                <div className="absolute bottom-4 left-4 font-mono text-[10px] text-slate-500 space-y-1 z-10">
                    <div className="flex space-x-4">
                        <span>SIRET: {registration}</span>
                        <span>DIR: {executive}</span>
                    </div>
                    {parentCompany && <div>GROUPE: <span className="text-amber-500">{parentCompany}</span></div>}
                    <div>SECTOR: {target.sector} // HQ: {legalAddress}</div>
                    {etablissements.length > 0 && <div>SITES: <span className="text-slate-400">{etablissements.length} établissement(s)</span></div>}
                </div>
            </div>
        </div>
    );
};

export default MapWidget;
