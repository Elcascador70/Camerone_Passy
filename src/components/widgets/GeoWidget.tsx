import React, { useState, useEffect, useRef } from 'react';
import { TargetData, GeoLocation } from '../../types';
import { MapPin, Loader2, Crosshair, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';
import { geocodeAddress } from '../../services/osint/geoIntel';

interface GeoWidgetProps {
    target: TargetData;
}

const GeoWidget: React.FC<GeoWidgetProps> = ({ target }) => {
    const [location, setLocation] = useState<GeoLocation | null>(target.geoLocation ?? null);
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const lastTargetId = useRef('');

    const address = target.legalProfile?.fullAddress;
    const etablissements = target.legalProfile?.etablissements ?? [];

    useEffect(() => {
        if (target.id === lastTargetId.current) return;
        lastTargetId.current = target.id;

        if (target.geoLocation) {
            setLocation(target.geoLocation);
            return;
        }

        if (address) {
            runGeocode(address);
        }
    }, [target]);

    const runGeocode = async (addr: string) => {
        setLoading(true);
        try {
            const result = await geocodeAddress(addr);
            if (result) {
                setLocation(result);
            }
        } catch {
            // Geocoding failure is non-critical
        } finally {
            setLoading(false);
        }
    };

    const osmMapUrl = location
        ? `https://www.openstreetmap.org/export/embed.html?bbox=${location.lon - 0.02},${location.lat - 0.01},${location.lon + 0.02},${location.lat + 0.01}&layer=mapnik&marker=${location.lat},${location.lon}`
        : null;

    return (
        <div className={`flex flex-col border border-slate-800 relative transition-all duration-300
            ${isExpanded
                ? 'fixed inset-0 z-50 bg-slate-950 m-0 rounded-none'
                : 'h-full bg-slate-900'
            }
        `}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50 z-20">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center">
                    <MapPin className="w-3 h-3 mr-2 text-amber-500" />
                    GEOINT — Géolocalisation
                    {isExpanded && <span className="ml-2 text-amber-500">// FULLSCREEN</span>}
                </h3>
                <div className="flex items-center space-x-2">
                    {location && (
                        <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                            LOCALISÉ
                        </span>
                    )}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-slate-600 hover:text-slate-300 transition-colors"
                    >
                        {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 relative overflow-hidden">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-10">
                        <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                        <span className="ml-3 text-sm text-slate-400 font-mono">GÉOCODAGE EN COURS...</span>
                    </div>
                )}

                {/* Map Iframe or Radar Fallback */}
                {osmMapUrl ? (
                    <iframe
                        src={osmMapUrl}
                        className="w-full h-full border-0"
                        title="OpenStreetMap"
                        style={{ filter: 'hue-rotate(180deg) invert(90%) contrast(1.2) brightness(0.8)' }}
                    />
                ) : (
                    <div className="absolute inset-0 bg-slate-950">
                        {/* Grid Pattern Fallback */}
                        <div className="absolute inset-0"
                            style={{
                                backgroundImage: `linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`,
                                backgroundSize: '40px 40px',
                                opacity: 0.2,
                            }}>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-transparent via-amber-500/5 to-transparent rounded-full animate-[spin_4s_linear_infinite] pointer-events-none border border-slate-800/30"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                            <Crosshair className="w-8 h-8 text-slate-600" />
                            <span className="mt-2 text-xs text-slate-500 font-mono">
                                {address ? 'Géocodage en attente...' : 'Aucune adresse disponible'}
                            </span>
                            {address && !loading && (
                                <button
                                    onClick={() => runGeocode(address)}
                                    className="mt-2 flex items-center text-[10px] font-mono text-amber-500 border border-amber-500/30 hover:border-amber-500 px-2 py-1 transition-all"
                                >
                                    <RefreshCw className="w-3 h-3 mr-1" /> LANCER GÉOCODAGE
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Coordinate Overlay */}
                {location && (
                    <div className="absolute top-4 right-4 z-10 bg-slate-900/90 border border-slate-700 p-3 backdrop-blur">
                        <h4 className="text-amber-500 font-bold text-[10px] uppercase mb-2 border-b border-slate-700 pb-1">
                            Coordonnées Cible
                        </h4>
                        <div className="space-y-1 font-mono text-[10px] text-slate-400">
                            <div className="flex justify-between gap-4">
                                <span>LAT</span>
                                <span className="text-slate-200">{location.lat.toFixed(6)}°N</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span>LON</span>
                                <span className="text-slate-200">{location.lon.toFixed(6)}°E</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span>TYPE</span>
                                <span className="text-emerald-500">{location.type.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Etablissements Overlay (expanded mode) */}
                {isExpanded && etablissements.length > 0 && (
                    <div className="absolute bottom-4 right-4 z-10 w-72 bg-slate-900/90 border border-slate-700 p-3 backdrop-blur max-h-48 overflow-y-auto">
                        <h4 className="text-amber-500 font-bold text-[10px] uppercase mb-2 border-b border-slate-700 pb-1">
                            Établissements ({etablissements.length})
                        </h4>
                        <div className="space-y-2 font-mono text-[10px] text-slate-400">
                            {etablissements.map((e, i) => (
                                <div key={i} className="border-b border-slate-800 pb-1">
                                    <div className="flex justify-between">
                                        <span>SIRET</span>
                                        <span className="text-slate-200">{e.siret}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>VILLE</span>
                                        <span className="text-slate-200">{e.ville || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>STATUT</span>
                                        <span className={e.actif ? 'text-emerald-500' : 'text-red-500'}>
                                            {e.actif ? 'ACTIF' : 'FERMÉ'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bottom Info Bar */}
                <div className="absolute bottom-4 left-4 font-mono text-[10px] text-slate-500 z-10">
                    <span>SOURCE: OpenStreetMap Nominatim | SCOPE: {target.scope}</span>
                </div>
            </div>
        </div>
    );
};

export default GeoWidget;
