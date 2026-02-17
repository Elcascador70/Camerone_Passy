import React from 'react';
import { TargetData } from '../../types';
import { Radio, AlertCircle, FileText, Database } from 'lucide-react';

interface TickerWidgetProps {
    target: TargetData;
}

const TickerWidget: React.FC<TickerWidgetProps> = ({ target: _ }) => {
    const events = [
        { id: 1, time: '14:02', type: 'alert', text: 'Modification des CGV détectée', icon: AlertCircle, color: 'text-amber-500' },
        { id: 2, time: '13:45', type: 'info', text: 'Nouveau dépôt de brevet INPI', icon: FileText, color: 'text-blue-400' },
        { id: 3, time: '12:30', type: 'data', text: 'Mise à jour base WHOIS', icon: Database, color: 'text-slate-400' },
        { id: 4, time: '11:15', type: 'info', text: 'Mention presse: Les Echos', icon: FileText, color: 'text-slate-400' },
        { id: 5, time: '09:00', type: 'data', text: 'Scan ports serveur terminé', icon: Database, color: 'text-slate-400' },
    ];

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
                    Flux temps réel // Latence: 12ms
                </div>
            </div>
        </div>
    );
};

export default TickerWidget;
