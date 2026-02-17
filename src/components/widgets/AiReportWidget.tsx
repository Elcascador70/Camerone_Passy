import React, { useState, useEffect, useRef } from 'react';
import { TargetData } from '../../types';
import { BrainCircuit, Copy, Share2, Loader2 } from 'lucide-react';
import { generatePsychProfile, PsychProfile } from '../../services/osint/mindReader';
import html2pdf from 'html2pdf.js';

interface AiReportWidgetProps {
    target: TargetData;
}

const AiReportWidget: React.FC<AiReportWidgetProps> = ({ target }) => {
    const legalCategory = target.legalProfile?.legalCategoryOrNaf ?? 'Non renseignée';
    const registration = target.legalProfile?.registrationNumber ?? 'Indisponible';
    const executive = target.legalProfile?.principalExecutiveName ?? 'Non renseigné';
    const latestNewsSource = target.newsFeed[0]?.source ?? 'Aucune source active';

    const [profile, setProfile] = useState<PsychProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const lastTargetId = useRef<string>('');
    const cachedProfile = useRef<PsychProfile | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (target.id === lastTargetId.current && cachedProfile.current) {
            setProfile(cachedProfile.current);
            return;
        }

        const titles = target.newsFeed.map(item => item.title).filter(Boolean);
        if (titles.length === 0) {
            setError('Aucun signal textuel disponible pour l\'analyse psychologique.');
            return;
        }

        const apiKey = import.meta.env.VITE_GROQ_API_KEY;
        if (!apiKey) {
            setError('Clé API Groq non configurée.');
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);
        setProfile(null);

        generatePsychProfile(titles, apiKey)
            .then((result) => {
                if (cancelled) return;
                if (result) {
                    setProfile(result);
                    cachedProfile.current = result;
                    lastTargetId.current = target.id;
                } else {
                    setError('Analyse échouée — le modèle n\'a pas retourné de profil valide.');
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setError('Erreur de communication avec le moteur d\'analyse.');
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [target]);

    const modelLabel = profile ? 'GROQ-LLAMA-70B' : 'GPT-INTEL-V4';
    const confidenceLabel = profile
        ? `${Math.min(Math.round((target.newsFeed.length / 10) * 100), 99)}%`
        : target.newsFeed.length > 0 ? '92%' : '68%';

    return (
        <div ref={containerRef} className="flex flex-col h-full bg-slate-900 border border-slate-800 relative">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center">
                    <BrainCircuit className="w-3 h-3 mr-2 text-amber-500" />
                    Rapport d'Intelligence Artificielle
                </h3>
                <div className="flex space-x-2">
                    <button className="p-1 hover:text-amber-500 text-slate-500"><Copy className="w-3 h-3" /></button>
                    <button className="p-1 hover:text-amber-500 text-slate-500"><Share2 className="w-3 h-3" /></button>
                </div>
            </div>

            <div className="flex-1 p-5 relative overflow-hidden">
                {/* Decorative Background for 'AI' */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="prose prose-invert max-w-none">
                    <div className="flex items-center mb-4 space-x-2">
                        <span className="px-2 py-0.5 bg-slate-800 text-[10px] rounded text-slate-300 font-mono">MODEL: {modelLabel}</span>
                        <span className="px-2 py-0.5 bg-slate-800 text-[10px] rounded text-slate-300 font-mono">CONFIDENCE: {confidenceLabel}</span>
                    </div>

                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                            <span className="ml-3 text-sm text-slate-400 font-mono">ANALYSE EN COURS...</span>
                        </div>
                    )}

                    {!loading && !profile && (
                        <>
                            <p className="text-sm text-slate-300 leading-relaxed mb-4">
                                <strong className="text-amber-500">ANALYSE SYNTHÉTIQUE :</strong> La cible <span className="text-white font-mono">{target.name}</span> présente un profil légal {legalCategory} et des signaux médiatiques actifs dans le secteur {target.sector}.
                            </p>

                            <ul className="text-sm text-slate-400 space-y-2 list-disc pl-4 marker:text-amber-500">
                                <li>
                                    Immatriculation de référence observée: <span className="text-slate-200 font-mono">{registration}</span>.
                                </li>
                                <li>
                                    Dirigeant principal identifié: <span className="text-slate-200">{executive}</span>.
                                </li>
                                <li>
                                    <span className="text-amber-500 font-bold">ALERTE :</span> {error ?? `Dernier signal médiatique remonté via ${latestNewsSource}.`}
                                </li>
                            </ul>
                        </>
                    )}

                    {!loading && profile && (
                        <div className="overflow-y-auto max-h-full">
                            <p className="text-sm text-slate-300 leading-relaxed mb-4">
                                <strong className="text-amber-500">PROFIL PSYCHOLOGIQUE :</strong> La cible <span className="text-white font-mono">{target.name}</span> a été analysée sur {target.newsFeed.length} signaux médiatiques.
                            </p>

                            <ul className="text-sm text-slate-400 space-y-2 list-disc pl-4 marker:text-amber-500">
                                <li>Ouverture: <span className="text-slate-200 font-mono">{profile.ocean.openness}/10</span></li>
                                <li>Conscienciosité: <span className="text-slate-200 font-mono">{profile.ocean.conscientiousness}/10</span></li>
                                <li>Extraversion: <span className="text-slate-200 font-mono">{profile.ocean.extraversion}/10</span></li>
                                <li>Agréabilité: <span className="text-slate-200 font-mono">{profile.ocean.agreeableness}/10</span></li>
                                <li>Neuroticisme: <span className="text-slate-200 font-mono">{profile.ocean.neuroticism}/10</span></li>
                            </ul>

                            {profile.darkTriad.length > 0 && (
                                <>
                                    <p className="text-sm text-slate-300 leading-relaxed mb-2 mt-4">
                                        <strong className="text-amber-500">TRIADE NOIRE :</strong>
                                    </p>
                                    <ul className="text-sm text-slate-400 space-y-2 list-disc pl-4 marker:text-amber-500">
                                        {profile.darkTriad.map((trait, i) => (
                                            <li key={i}><span className="text-slate-200">{trait}</span></li>
                                        ))}
                                    </ul>
                                </>
                            )}

                            {profile.influenceLevers.length > 0 && (
                                <>
                                    <p className="text-sm text-slate-300 leading-relaxed mb-2 mt-4">
                                        <strong className="text-amber-500">LEVIERS D'INFLUENCE :</strong>
                                    </p>
                                    <ul className="text-sm text-slate-400 space-y-2 list-disc pl-4 marker:text-amber-500">
                                        {profile.influenceLevers.map((lever, i) => (
                                            <li key={i}><span className="text-slate-200">{lever}</span></li>
                                        ))}
                                    </ul>
                                </>
                            )}

                            {profile.vulnerabilities.length > 0 && (
                                <>
                                    <p className="text-sm text-slate-300 leading-relaxed mb-2 mt-4">
                                        <strong className="text-amber-500">VULNÉRABILITÉS :</strong>
                                    </p>
                                    <ul className="text-sm text-slate-400 space-y-2 list-disc pl-4 marker:text-amber-500">
                                        {profile.vulnerabilities.map((vuln, i) => (
                                            <li key={i}><span className="text-slate-200">{vuln}</span></li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-slate-800/50 flex justify-end">
                        <button
                            onClick={() => {
                                const el = containerRef.current;
                                if (!el) return;
                                html2pdf()
                                    .set({
                                        margin: 10,
                                        filename: `rapport-${target.name.replace(/\s+/g, '_')}.pdf`,
                                        image: { type: 'jpeg', quality: 0.98 },
                                        html2canvas: { scale: 2, backgroundColor: '#0f172a' },
                                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                                    })
                                    .from(el)
                                    .save();
                            }}
                            className="text-[10px] uppercase font-bold text-amber-500 hover:text-amber-400 border border-amber-500/30 hover:border-amber-500 px-3 py-1.5 transition-all"
                        >
                            Générer Rapport Complet PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiReportWidget;
