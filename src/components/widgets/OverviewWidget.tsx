import React from 'react';
import { TargetData } from '../../types';
import {
    LayoutDashboard,
    Building2,
    Newspaper,
    Users,
    Globe,
    TrendingUp,
    MapPin,
    BrainCircuit,
    ChevronRight,
    AlertTriangle,
    CheckCircle2,
    Clock,
} from 'lucide-react';
import type { DashboardTab } from '../../types';

interface OverviewWidgetProps {
    target: TargetData;
    onNavigate: (tab: DashboardTab) => void;
}

interface DomainCard {
    tab: DashboardTab;
    label: string;
    icon: React.ReactNode;
    status: 'ready' | 'partial' | 'empty';
    summary: string;
    metric?: string;
}

const OverviewWidget: React.FC<OverviewWidgetProps> = ({ target, onNavigate }) => {
    const domains: DomainCard[] = [
        {
            tab: 'Identité',
            label: 'Identité & Légal',
            icon: <Building2 className="w-4 h-4" />,
            status: target.legalProfile ? 'ready' : 'empty',
            summary: target.legalProfile
                ? `${target.legalProfile.officialName} — SIRET ${target.legalProfile.registrationNumber}`
                : 'Aucun profil légal disponible',
            metric: target.legalProfile?.etablissements
                ? `${target.legalProfile.etablissements.length} établ.`
                : undefined,
        },
        {
            tab: 'Sentinelle Médias',
            label: 'Médias & Actualités',
            icon: <Newspaper className="w-4 h-4" />,
            status: target.newsFeed.length > 0 ? 'ready' : 'empty',
            summary: target.newsFeed.length > 0
                ? target.newsFeed[0].title
                : 'Aucun signal médiatique détecté',
            metric: target.newsFeed.length > 0
                ? `${target.newsFeed.length} signaux`
                : undefined,
        },
        {
            tab: 'SOCMINT',
            label: 'Réseaux Sociaux',
            icon: <Users className="w-4 h-4" />,
            status: target.socialProfiles && target.socialProfiles.length > 0 ? 'ready' : 'partial',
            summary: target.socialProfiles && target.socialProfiles.length > 0
                ? `${target.socialProfiles.length} profil(s) identifié(s)`
                : 'Scan en attente — cliquez pour lancer',
            metric: target.socialProfiles
                ? `${target.socialProfiles.filter(p => p.confidence === 'High').length} certifié(s)`
                : undefined,
        },
        {
            tab: 'CYBINT',
            label: 'Cyber & Technique',
            icon: <Globe className="w-4 h-4" />,
            status: target.cyberProfile ? 'ready' : target.domain ? 'partial' : 'empty',
            summary: target.cyberProfile
                ? `${target.cyberProfile.domain} — ${target.cyberProfile.dns.length} records DNS`
                : target.domain
                    ? 'Domaine renseigné — scan disponible'
                    : 'Aucun domaine renseigné',
        },
        {
            tab: 'FININT',
            label: 'Finance & Marchés',
            icon: <TrendingUp className="w-4 h-4" />,
            status: target.financialBriefing ? 'ready' : 'partial',
            summary: target.financialBriefing
                ? target.financialBriefing.summary.slice(0, 100) + '...'
                : 'Briefing FININT en attente — cliquez pour générer',
        },
        {
            tab: 'GEOINT',
            label: 'Géolocalisation',
            icon: <MapPin className="w-4 h-4" />,
            status: target.geoLocation ? 'ready' : target.legalProfile?.fullAddress ? 'partial' : 'empty',
            summary: target.geoLocation
                ? `${target.geoLocation.lat.toFixed(4)}°N, ${target.geoLocation.lon.toFixed(4)}°E`
                : target.legalProfile?.fullAddress
                    ? 'Adresse disponible — géolocalisation en attente'
                    : 'Aucune donnée de localisation',
        },
        {
            tab: 'Profiler IA',
            label: 'Profiler IA',
            icon: <BrainCircuit className="w-4 h-4" />,
            status: target.newsFeed.length > 0 ? 'partial' : 'empty',
            summary: target.newsFeed.length > 0
                ? `${target.newsFeed.length} signaux exploitables pour analyse psychologique`
                : 'Pas de données textuelles pour le profilage',
        },
    ];

    const readyCount = domains.filter(d => d.status === 'ready').length;
    const totalCount = domains.length;

    const statusColor = (s: DomainCard['status']) => {
        if (s === 'ready') return 'text-emerald-500';
        if (s === 'partial') return 'text-amber-500';
        return 'text-slate-600';
    };

    const StatusIcon = ({ status }: { status: DomainCard['status'] }) => {
        if (status === 'ready') return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
        if (status === 'partial') return <Clock className="w-3 h-3 text-amber-500" />;
        return <AlertTriangle className="w-3 h-3 text-slate-600" />;
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 border border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center">
                    <LayoutDashboard className="w-3 h-3 mr-2 text-amber-500" />
                    Vue Globale — {target.name}
                </h3>
                <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                        {readyCount}/{totalCount} DOMAINES ACTIFS
                    </span>
                </div>
            </div>

            {/* Target Summary Bar */}
            <div className="px-4 py-2 border-b border-slate-800/50 bg-slate-950/50 flex flex-wrap gap-x-6 gap-y-1">
                <span className="text-[10px] font-mono text-slate-500">
                    TYPE: <span className="text-slate-300">{target.targetType === 'company' ? 'ENTITÉ LÉGALE' : 'PERSONNE PHYSIQUE'}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                    SECTEUR: <span className="text-slate-300">{target.sector}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                    SCOPE: <span className="text-slate-300">{target.scope}</span>
                </span>
                {target.domain && (
                    <span className="text-[10px] font-mono text-slate-500">
                        DOMAINE: <span className="text-amber-500">{target.domain}</span>
                    </span>
                )}
            </div>

            {/* Domain Cards Grid */}
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {domains.map((domain) => (
                        <button
                            key={domain.tab}
                            onClick={() => onNavigate(domain.tab)}
                            className="text-left bg-slate-950/50 border border-slate-800 hover:border-amber-500/30 p-4 transition-all group cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <span className={`${statusColor(domain.status)}`}>
                                        {domain.icon}
                                    </span>
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 group-hover:text-amber-500 transition-colors">
                                        {domain.label}
                                    </span>
                                </div>
                                <StatusIcon status={domain.status} />
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono leading-relaxed line-clamp-2 mb-2">
                                {domain.summary}
                            </p>
                            <div className="flex items-center justify-between">
                                {domain.metric && (
                                    <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                        {domain.metric}
                                    </span>
                                )}
                                <ChevronRight className="w-3 h-3 text-slate-700 group-hover:text-amber-500 transition-colors ml-auto" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OverviewWidget;
