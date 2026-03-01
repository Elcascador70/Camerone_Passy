import React, { useState } from 'react';
import { Target, Briefcase, Globe, ArrowRight, ShieldAlert, ChevronDown, Building2, User, Link2 } from 'lucide-react';
import { Range, TargetData } from '../types';
import { profileCompany, CorporateProfilerError } from '../services/osint/corporateProfiler';
import { fetchTargetNews } from '../services/osint/newsAggregator';

interface WizardProps {
    onDeploy: (data: TargetData) => void;
}

const SECTORS_LIST = [
    'Défense', 'Renseignement', 'Technologie', 'Finance', 'Politique',
    'Médias', 'BTP', 'Santé', 'Industrie', 'ONG',
    'Luxe', 'Automobile', 'Aéronautique', 'Énergie',
    'Télécoms', 'Transports', 'Agroalimentaire', 'Grande Distribution', 'Services'
];

const Wizard: React.FC<WizardProps> = ({ onDeploy }) => {
    const [targetType, setTargetType] = useState<'company' | 'person'>('company');
    const [name, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [sector, setSector] = useState<string>('');
    const [range, setRange] = useState<Range>(Range.NATIONAL);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSectorList, setShowSectorList] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const normalizedName = name.trim();
        if (!normalizedName) return;

        setError(null);
        setLoading(true);
        try {
            let profile: any = {
                officialName: normalizedName,
                registrationNumber: 'N/A',
                fullAddress: 'Adresse inconnue',
                principalExecutiveName: 'N/A',
                legalCategoryOrNaf: 'Non défini'
            };
            let newsFeed: any[] = [];

            if (targetType === 'company') {
                try {
                    const [companyProfile, news] = await Promise.all([
                        profileCompany(normalizedName, 'FR'),
                        fetchTargetNews(normalizedName),
                    ]);
                    profile = companyProfile;
                    newsFeed = news;
                } catch (profileErr: any) {
                    // If mocking/demo, we might want to proceed anyway, but sticking to existing logic implies errors stop flow.
                    // However, for 'person', we skip profiling.
                    throw profileErr;
                }
            } else {
                const [news] = await Promise.all([
                    fetchTargetNews(normalizedName),
                ]);
                newsFeed = news;
            }

            onDeploy({
                id: crypto.randomUUID(),
                name: normalizedName,
                type: targetType === 'company' ? 'Multinationale' : 'Personne Physique',
                targetType,
                sector: sector || 'Non défini',
                scope: range,
                domain: domain.trim() || undefined,
                legalProfile: {
                    officialName: profile.officialName,
                    registrationNumber: profile.registrationNumber,
                    fullAddress: profile.fullAddress,
                    principalExecutiveName: profile.principalExecutiveName,
                    legalCategoryOrNaf: profile.legalCategoryOrNaf,
                    etablissements: profile.etablissements ?? [],
                    parentCompany: profile.parentCompany ?? null,
                },
                newsFeed,
                timestamp: new Date().toISOString()
            });
        } catch (err: any) {
            if (err instanceof CorporateProfilerError) {
                const messages: Record<string, string> = {
                    TARGET_NOT_FOUND: `Aucune entreprise trouvée pour "${normalizedName}".`,
                    NETWORK_ERROR: 'Erreur réseau. Vérifiez votre connexion internet.',
                    HTTP_ERROR: 'Le service de données est temporairement indisponible.',
                    BAD_INPUT: 'Le nom de la cible est invalide.',
                    UNSUPPORTED_COUNTRY: 'Seules les entreprises françaises sont supportées.',
                    INVALID_RESPONSE: 'Réponse inattendue du service de données.',
                };
                setError(messages[err.code] ?? err.message);
            } else {
                setError(err.message || 'Une erreur inattendue est survenue.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-4 relative overflow-hidden h-screen">

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-10 left-10 w-64 h-64 border border-slate-700 rounded-full border-dashed animate-[spin_10s_linear_infinite]"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 border border-slate-800 rounded-full opacity-50"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
            </div>

            <div className="w-full max-w-lg z-10">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center p-3 mb-4 bg-slate-900 border border-slate-700 rounded shadow-2xl">
                        <ShieldAlert className="w-8 h-8 text-amber-500" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-100 mb-2 uppercase">
                        Camerone Passy
                    </h1>
                    <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">
                        System Initialization // Secure Environment
                    </p>
                </div>

                {/* Card */}
                <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-8 shadow-2xl relative">
                    {/* Corner Markers */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-500"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-amber-500"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-amber-500"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-500"></div>

                    <div className="space-y-6">

                        {/* Type Toggle */}
                        <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 border border-slate-800 rounded-sm">
                            <button
                                type="button"
                                onClick={() => setTargetType('company')}
                                className={`flex items-center justify-center py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-sm ${targetType === 'company'
                                        ? 'bg-amber-500 text-slate-950 shadow-lg'
                                        : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                <Building2 className="w-3 h-3 mr-2" />
                                Entité Légale
                            </button>
                            <button
                                type="button"
                                onClick={() => setTargetType('person')}
                                className={`flex items-center justify-center py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-sm ${targetType === 'person'
                                        ? 'bg-amber-500 text-slate-950 shadow-lg'
                                        : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                <User className="w-3 h-3 mr-2" />
                                Personne Physique
                            </button>
                        </div>

                        {/* Step 1: Name */}
                        <div className="space-y-2">
                            <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <Target className="w-3 h-3 mr-2 text-amber-500" />
                                Identifiant Cible
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={targetType === 'company' ? "NOM DE L'ENTITÉ" : "NOM PRENOM"}
                                className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-slate-700 transition-all font-mono"
                                autoFocus
                            />
                        </div>

                        {/* Step 2: Domain (Optional) */}
                        {targetType === 'company' && (
                            <div className="space-y-2">
                                <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <Link2 className="w-3 h-3 mr-2 text-amber-500" />
                                    Domaine Web <span className="text-slate-600 ml-1 normal-case">(optionnel)</span>
                                </label>
                                <input
                                    type="text"
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                    placeholder="exemple.fr"
                                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-slate-700 transition-all font-mono"
                                />
                            </div>
                        )}

                        {/* Step 3: Sector (Flexible) */}
                        <div className="space-y-2 relative">
                            <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <Briefcase className="w-3 h-3 mr-2 text-amber-500" />
                                Secteur d'Activité
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={sector}
                                    onChange={(e) => {
                                        setSector(e.target.value);
                                        setShowSectorList(true);
                                    }}
                                    onClick={() => setShowSectorList(true)}
                                    placeholder="SÉLECTIONNER OU SAISIR..."
                                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-3 text-sm focus:border-amber-500 focus:outline-none font-mono placeholder-slate-700"
                                />
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />

                                {showSectorList && (
                                    <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 max-h-48 overflow-y-auto shadow-xl scrollbar-thin scrollbar-thumb-slate-600">
                                        {SECTORS_LIST.filter(s => s.toLowerCase().includes(sector.toLowerCase())).map((s) => (
                                            <div
                                                key={s}
                                                className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 cursor-pointer font-mono hover:text-amber-500 transition-colors"
                                                onClick={() => {
                                                    setSector(s);
                                                    setShowSectorList(false);
                                                }}
                                            >
                                                {s}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Backdrop to close list */}
                            {showSectorList && (
                                <div className="fixed inset-0 z-40" onClick={() => setShowSectorList(false)}></div>
                            )}
                        </div>

                        {/* Step 3: Range */}
                        <div className="space-y-2">
                            <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <Globe className="w-3 h-3 mr-2 text-amber-500" />
                                Rayon d'investigation
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {Object.values(Range).map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRange(r)}
                                        className={`text-[10px] uppercase font-bold py-2 px-1 border transition-all ${range === r
                                            ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                                            }`}
                                    >
                                        {r.split(' ')[0]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-900/20 border border-red-900/50 text-red-400 text-xs font-mono">
                                <span className="font-bold text-red-500">ERREUR:</span> {error}
                            </div>
                        )}

                        {/* Action Button */}
                        <button
                            type="submit"
                            disabled={!name || loading}
                            className={`w-full group relative overflow-hidden p-4 font-bold uppercase tracking-[0.2em] text-sm transition-all
                  ${loading ? 'bg-amber-900 cursor-wait text-amber-500/50' : 'bg-amber-500 hover:bg-amber-400 text-slate-950'}
                `}
                        >
                            <span className="relative z-10 flex items-center justify-center">
                                {loading ? 'INITIALISATION...' : 'LANCER LA TRAQUE'}
                                {!loading && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                            </span>
                        </button>
                    </div>
                </form>

                <div className="mt-4 text-center">
                    <p className="text-[10px] text-slate-600 font-mono">
                        SECURE CONNECTION ESTABLISHED. V.2.0.4<br />
                        UNAUTHORIZED ACCESS IS PROHIBITED.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Wizard;
