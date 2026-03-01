import React, { useState, useEffect, useRef } from 'react';
import { TargetData, CyberProfile } from '../../types';
import { Globe, Loader2, Server, Shield, RefreshCw, AlertTriangle } from 'lucide-react';
import { profileDomain, guessDomain } from '../../services/osint/cyberIntel';

interface CyberWidgetProps {
    target: TargetData;
}

const DNS_TYPE_COLORS: Record<string, string> = {
    A: 'text-emerald-400',
    AAAA: 'text-teal-400',
    MX: 'text-blue-400',
    NS: 'text-violet-400',
    TXT: 'text-amber-400',
    CNAME: 'text-pink-400',
};

const CyberWidget: React.FC<CyberWidgetProps> = ({ target }) => {
    const [cyberProfile, setCyberProfile] = useState<CyberProfile | null>(target.cyberProfile ?? null);
    const [loading, setLoading] = useState(false);
    const [scanned, setScanned] = useState(!!target.cyberProfile);
    const [domainInput, setDomainInput] = useState(target.domain ?? '');
    const lastTargetId = useRef('');

    useEffect(() => {
        if (target.id === lastTargetId.current) return;
        lastTargetId.current = target.id;

        if (target.cyberProfile) {
            setCyberProfile(target.cyberProfile);
            setScanned(true);
            return;
        }

        const domain = target.domain || guessDomain(target.name);
        if (domain) {
            setDomainInput(domain);
            runScan(domain);
        }
    }, [target]);

    const runScan = async (domain?: string) => {
        const d = domain || domainInput.trim();
        if (!d) return;
        setLoading(true);
        setCyberProfile(null);
        try {
            const result = await profileDomain(d);
            setCyberProfile(result);
            setScanned(true);
        } catch {
            setScanned(true);
        } finally {
            setLoading(false);
        }
    };

    const whois = cyberProfile?.whois;
    const dnsRecords = cyberProfile?.dns ?? [];

    return (
        <div className="flex flex-col h-full bg-slate-900 border border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center">
                    <Globe className="w-3 h-3 mr-2 text-amber-500" />
                    CYBINT — Intelligence Technique
                </h3>
                {scanned && cyberProfile && (
                    <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                        {cyberProfile.domain}
                    </span>
                )}
            </div>

            {/* Domain Input */}
            <div className="px-4 py-2 border-b border-slate-800/50 bg-slate-950/50 flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500">DOMAINE:</span>
                <input
                    type="text"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runScan()}
                    placeholder="exemple.fr"
                    className="flex-1 bg-transparent border border-slate-700 px-2 py-1 text-xs font-mono text-slate-300 placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                />
                <button
                    onClick={() => runScan()}
                    disabled={loading || !domainInput.trim()}
                    className="text-xs font-mono text-amber-500 border border-amber-500/30 hover:border-amber-500 px-3 py-1 transition-all disabled:opacity-30 flex items-center"
                >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    <span className="ml-1">SCAN</span>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto">
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                        <span className="ml-3 text-sm text-slate-400 font-mono">SCAN CYBINT EN COURS...</span>
                    </div>
                )}

                {!loading && !scanned && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Globe className="w-8 h-8 text-slate-700 mb-3" />
                        <p className="text-sm text-slate-500 font-mono">Entrez un domaine et lancez le scan.</p>
                    </div>
                )}

                {!loading && scanned && cyberProfile && (
                    <div className="space-y-6">
                        {/* WHOIS Section */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-3 flex items-center">
                                <Shield className="w-3 h-3 mr-2" /> WHOIS / RDAP
                            </h4>
                            {whois ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {[
                                        ['Domaine', whois.domainName],
                                        ['Registrar', whois.registrar || 'N/A'],
                                        ['Création', whois.creationDate ? new Date(whois.creationDate).toLocaleDateString('fr-FR') : 'N/A'],
                                        ['Expiration', whois.expirationDate ? new Date(whois.expirationDate).toLocaleDateString('fr-FR') : 'N/A'],
                                        ['Organisation', whois.registrantOrg || 'N/A'],
                                        ['Pays', whois.registrantCountry || 'N/A'],
                                    ].map(([label, value]) => (
                                        <div key={label} className="flex justify-between bg-slate-950/50 border border-slate-800 px-3 py-2">
                                            <span className="text-[10px] font-mono text-slate-500 uppercase">{label}</span>
                                            <span className="text-[11px] font-mono text-slate-300">{value}</span>
                                        </div>
                                    ))}
                                    {whois.nameServers.length > 0 && (
                                        <div className="md:col-span-2 bg-slate-950/50 border border-slate-800 px-3 py-2">
                                            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Serveurs DNS</span>
                                            <div className="flex flex-wrap gap-1">
                                                {whois.nameServers.map((ns, i) => (
                                                    <span key={i} className="text-[10px] font-mono text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">
                                                        {ns}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {whois.status.length > 0 && (
                                        <div className="md:col-span-2 bg-slate-950/50 border border-slate-800 px-3 py-2">
                                            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Statuts</span>
                                            <div className="flex flex-wrap gap-1">
                                                {whois.status.map((s, i) => (
                                                    <span key={i} className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center text-sm text-slate-500 font-mono">
                                    <AlertTriangle className="w-3 h-3 mr-2 text-amber-500" />
                                    Données WHOIS/RDAP indisponibles pour ce domaine.
                                </div>
                            )}
                        </div>

                        {/* DNS Records Section */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-3 flex items-center">
                                <Server className="w-3 h-3 mr-2" /> Records DNS ({dnsRecords.length})
                            </h4>
                            {dnsRecords.length > 0 ? (
                                <div className="space-y-1">
                                    {dnsRecords.map((record, idx) => (
                                        <div key={idx} className="flex items-center bg-slate-950/50 border border-slate-800 px-3 py-2">
                                            <span className={`text-[10px] font-mono font-bold w-12 ${DNS_TYPE_COLORS[record.type] ?? 'text-slate-400'}`}>
                                                {record.type}
                                            </span>
                                            <span className="text-[11px] font-mono text-slate-400 flex-1 truncate">
                                                {record.data}
                                            </span>
                                            {record.ttl && (
                                                <span className="text-[9px] font-mono text-slate-600 ml-2">
                                                    TTL:{record.ttl}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 font-mono">Aucun record DNS résolu.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Method Info */}
                <div className="mt-6 pt-4 border-t border-slate-800/50">
                    <p className="text-[10px] text-slate-600 font-mono">
                        MÉTHODE: Google DNS-over-HTTPS + RDAP (via corsproxy) | RECORDS: A, AAAA, MX, NS, TXT, CNAME
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CyberWidget;
