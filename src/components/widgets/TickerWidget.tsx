import React from 'react';
import { TargetData } from '../../types';
import { Radio, AlertCircle, FileText, Database } from 'lucide-react';

interface TickerWidgetProps {
    target: TargetData;
}

const TickerWidget: React.FC<TickerWidgetProps> = ({ target }) => {
    const formatTime = (dateInput: string): string => {
        const date = new Date(dateInput);
        if (Number.isNaN(date.getTime())) {
            return '--:--';
        }
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const newsEvents = target.newsFeed.slice(0, 5).map((item, index) => ({
        id: `news-${index}`,
        time: formatTime(item.pubDate),
        text: `${item.source}: ${item.title}`,
        icon: index === 0 ? AlertCircle : FileText,
        color: index === 0 ? 'text-amber-500' : 'text-blue-400',
    }));

    const legalEvents = target.legalProfile
        ? [
            {
                id: 'legal-1',
                time: '--:--',
                text: `SIRET: ${target.legalProfile.registrationNumber}`,
                icon: Database,
                color: 'text-slate-400',
            },
            {
                id: 'legal-2',
                time: '--:--',
                text: `Dirigeant: ${target.legalProfile.principalExecutiveName ?? 'Non renseigné'}`,
                icon: AlertCircle,
                color: 'text-slate-400',
            },
        ]
        : [];

    const fallbackEvents = [
        {
            id: 'fallback-1',
            time: '--:--',
            text: `Aucune actualité remontée pour ${target.name}`,
            icon: AlertCircle,
            color: 'text-slate-400',
        },
    ];

    const events = newsEvents.length > 0 ? newsEvents : legalEvents.length > 0 ? legalEvents : fallbackEvents;

    return (
        <div className="flex flex-col h-full bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center">
                    <Radio className="w-3 h-3 mr-2 text-amber-500" />
                    Détecteur de Mouvement
                </h3>
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-slate-800">
                <ul className="divide-y divide-slate-800/50">
                    {events.map((evt) => (
                        <li key={evt.id} className="px-4 py-3 hover:bg-slate-800/30 transition-colors flex items-start group cursor-default">
                            <span className="text-[10px] font-mono text-slate-500 pt-0.5 w-10 shrink-0">{evt.time}</span>
                            <evt.icon className={`w-3 h-3 mt-0.5 mr-3 shrink-0 ${evt.color}`} />
                            <span className="text-xs text-slate-300 font-medium group-hover:text-amber-50 transition-colors">
                                {evt.text}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="p-2 border-t border-slate-800 bg-slate-950/30">
                <div className="text-[10px] text-center text-slate-600 font-mono uppercase">
                    Flux temps réel // CIBLE: {target.name.toUpperCase()}
                </div>
            </div>
        </div>
    );
};

export default TickerWidget;
