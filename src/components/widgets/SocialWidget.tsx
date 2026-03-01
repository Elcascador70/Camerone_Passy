import React, { useState, useEffect, useRef } from 'react';
import { TargetData, SocialProfile } from '../../types';
import { Users, Loader2, ExternalLink, ShieldCheck, ShieldAlert, RefreshCw } from 'lucide-react';
import { scanSocialProfiles } from '../../services/osint/socialScanner';

interface SocialWidgetProps {
    target: TargetData;
}

const NETWORK_COLORS: Record<string, string> = {
    LinkedIn: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    Twitter: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    Facebook: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    Instagram: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
};

const SocialWidget: React.FC<SocialWidgetProps> = ({ target }) => {
    const [profiles, setProfiles] = useState<SocialProfile[]>(target.socialProfiles ?? []);
    const [loading, setLoading] = useState(false);
    const [scanned, setScanned] = useState(false);
    const lastTargetId = useRef('');

    useEffect(() => {
        if (target.id === lastTargetId.current) return;
        lastTargetId.current = target.id;

        if (target.socialProfiles && target.socialProfiles.length > 0) {
            setProfiles(target.socialProfiles);
            setScanned(true);
            return;
        }

        runScan();
    }, [target]);

    const runScan = async () => {
        setLoading(true);
        setProfiles([]);
        try {
            const results = await scanSocialProfiles(target.name);
            const mapped: SocialProfile[] = results.map(r => ({
                network: r.network,
                url: r.url,
                confidence: r.confidence,
            }));
            setProfiles(mapped);
            setScanned(true);
        } catch {
            setScanned(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 border border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center">
                    <Users className="w-3 h-3 mr-2 text-amber-500" />
                    SOCMINT — Réseaux Sociaux
                </h3>
                <div className="flex items-center space-x-2">
                    {scanned && (
                        <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                            {profiles.length} PROFIL(S)
                        </span>
                    )}
                    <button
                        onClick={runScan}
                        disabled={loading}
                        className="text-slate-500 hover:text-amber-500 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto">
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                        <span className="ml-3 text-sm text-slate-400 font-mono">SCAN SOCMINT EN COURS...</span>
                    </div>
                )}

                {!loading && profiles.length === 0 && scanned && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Users className="w-8 h-8 text-slate-700 mb-3" />
                        <p className="text-sm text-slate-500 font-mono">Aucun profil social détecté pour cette cible.</p>
                        <p className="text-[10px] text-slate-600 font-mono mt-1">
                            Le scan utilise DuckDuckGo Dorking sur LinkedIn, Twitter, Facebook, Instagram.
                        </p>
                    </div>
                )}

                {!loading && profiles.length > 0 && (
                    <div className="space-y-3">
                        {profiles.map((profile, idx) => (
                            <div
                                key={idx}
                                className={`border ${NETWORK_COLORS[profile.network]?.split(' ')[2] ?? 'border-slate-700'} bg-slate-950/50 p-4 transition-all hover:bg-slate-950`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded border ${NETWORK_COLORS[profile.network] ?? 'text-slate-400 bg-slate-800 border-slate-700'}`}>
                                            {profile.network}
                                        </span>
                                        {profile.confidence === 'High' ? (
                                            <span className="flex items-center text-[10px] font-mono text-emerald-500">
                                                <ShieldCheck className="w-3 h-3 mr-1" /> HIGH CONFIDENCE
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-[10px] font-mono text-amber-500">
                                                <ShieldAlert className="w-3 h-3 mr-1" /> MEDIUM
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <a
                                    href={profile.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-mono text-slate-300 hover:text-amber-500 transition-colors flex items-center"
                                >
                                    {profile.url}
                                    <ExternalLink className="w-3 h-3 ml-2 flex-shrink-0" />
                                </a>
                            </div>
                        ))}
                    </div>
                )}

                {/* Method Info */}
                <div className="mt-6 pt-4 border-t border-slate-800/50">
                    <p className="text-[10px] text-slate-600 font-mono">
                        MÉTHODE: DuckDuckGo Lite Dorking | CIBLES: LinkedIn, Twitter/X, Facebook, Instagram | SCORING: URL + Title token matching
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SocialWidget;
