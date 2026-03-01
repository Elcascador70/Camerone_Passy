import React, { useState, useEffect, useRef } from 'react';
import { TargetData, FinancialBriefing } from '../../types';
import { TrendingUp, TrendingDown, Minus, Loader2, AlertTriangle, ShieldCheck, RefreshCw, DollarSign } from 'lucide-react';
import { generateFinancialBriefing } from '../../services/osint/financialIntel';

interface FinanceWidgetProps {
    target: TargetData;
}

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-emerald-500" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-slate-500" />;
};

const FinanceWidget: React.FC<FinanceWidgetProps> = ({ target }) => {
    const [briefing, setBriefing] = useState<FinancialBriefing | null>(target.financialBriefing ?? null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const lastTargetId = useRef('');
    const cachedBriefing = useRef<FinancialBriefing | null>(null);

    useEffect(() => {
        if (target.id === lastTargetId.current && cachedBriefing.current) {
            setBriefing(cachedBriefing.current);
            return;
        }

        if (target.financialBriefing) {
            setBriefing(target.financialBriefing);
            cachedBriefing.current = target.financialBriefing;
            lastTargetId.current = target.id;
            return;
        }

        runAnalysis();
    }, [target]);

    const runAnalysis = async () => {
        const apiKey = import.meta.env.VITE_GROQ_API_KEY;
        if (!apiKey) {
            setError('Clé API Groq non configurée.');
            return;
        }

        setLoading(true);
        setError(null);
        setBriefing(null);

        try {
            const result = await generateFinancialBriefing(
                target.name,
                target.newsFeed,
                target.legalProfile,
                target.sector,
                apiKey
            );

            if (result) {
                setBriefing(result);
                cachedBriefing.current = result;
                lastTargetId.current = target.id;
            } else {
                setError('Le moteur d\'analyse n\'a pas retourné de briefing valide.');
            }
        } catch {
            setError('Erreur de communication avec le moteur d\'analyse.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 border border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center">
                    <DollarSign className="w-3 h-3 mr-2 text-amber-500" />
                    FININT — Intelligence Financière
                </h3>
                <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                        MODEL: GROQ-LLAMA-70B
                    </span>
                    <button
                        onClick={runAnalysis}
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
                        <span className="ml-3 text-sm text-slate-400 font-mono">ANALYSE FININT EN COURS...</span>
                    </div>
                )}

                {!loading && error && (
                    <div className="flex items-center justify-center py-12 text-center">
                        <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                        <span className="text-sm text-slate-400 font-mono">{error}</span>
                    </div>
                )}

                {!loading && !error && !briefing && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <DollarSign className="w-8 h-8 text-slate-700 mb-3" />
                        <p className="text-sm text-slate-500 font-mono">Aucune analyse financière disponible.</p>
                    </div>
                )}

                {!loading && briefing && (
                    <div className="space-y-6">
                        {/* Summary */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2 flex items-center">
                                <ShieldCheck className="w-3 h-3 mr-2" /> Synthèse
                            </h4>
                            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 border border-slate-800 p-3">
                                {briefing.summary}
                            </p>
                        </div>

                        {/* Key Metrics */}
                        {briefing.keyMetrics.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">
                                    Métriques Clés
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {briefing.keyMetrics.map((metric, idx) => (
                                        <div key={idx} className="bg-slate-950/50 border border-slate-800 p-3 flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] font-mono text-slate-500 uppercase block">{metric.label}</span>
                                                <span className="text-sm font-mono text-slate-200 font-bold">{metric.value}</span>
                                            </div>
                                            <TrendIcon trend={metric.trend} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Risks & Opportunities */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {briefing.risks.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2 flex items-center">
                                        <AlertTriangle className="w-3 h-3 mr-2" /> Risques Identifiés
                                    </h4>
                                    <ul className="space-y-1">
                                        {briefing.risks.map((risk, idx) => (
                                            <li key={idx} className="text-[11px] text-slate-400 font-mono bg-red-500/5 border border-red-500/10 px-3 py-2 flex items-start">
                                                <span className="text-red-500 mr-2 mt-0.5">&#9679;</span>
                                                {risk}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {briefing.opportunities.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2 flex items-center">
                                        <TrendingUp className="w-3 h-3 mr-2" /> Opportunités
                                    </h4>
                                    <ul className="space-y-1">
                                        {briefing.opportunities.map((opp, idx) => (
                                            <li key={idx} className="text-[11px] text-slate-400 font-mono bg-emerald-500/5 border border-emerald-500/10 px-3 py-2 flex items-start">
                                                <span className="text-emerald-500 mr-2 mt-0.5">&#9679;</span>
                                                {opp}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Sector Outlook */}
                        {briefing.sectorOutlook && (
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">
                                    Analyse Sectorielle
                                </h4>
                                <p className="text-[11px] text-slate-400 font-mono leading-relaxed bg-slate-950/50 border border-slate-800 p-3">
                                    {briefing.sectorOutlook}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Method Info */}
                <div className="mt-6 pt-4 border-t border-slate-800/50">
                    <p className="text-[10px] text-slate-600 font-mono">
                        MÉTHODE: Analyse LLM (Groq Llama-3.3-70B) des signaux médiatiques et données légales | TEMP: 0.3
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FinanceWidget;
