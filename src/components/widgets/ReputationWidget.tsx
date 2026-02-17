import React from 'react';
import { TargetData } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, TrendingDown, ThumbsDown, ThumbsUp } from 'lucide-react';

interface ReputationWidgetProps {
    target: TargetData;
}

const ReputationWidget: React.FC<ReputationWidgetProps> = ({ target }) => {
    const positiveKeywords = ['croissance', 'succès', 'partenariat', 'innovation', 'record', 'hausse', 'contrat'];
    const negativeKeywords = ['crise', 'plainte', 'fraude', 'perte', 'licenciement', 'amende', 'baisse', 'attaque'];

    const sentiment = target.newsFeed.reduce(
        (acc, item) => {
            const text = `${item.title} ${item.source}`.toLowerCase();
            if (negativeKeywords.some((keyword) => text.includes(keyword))) {
                acc.negative += 1;
            } else if (positiveKeywords.some((keyword) => text.includes(keyword))) {
                acc.positive += 1;
            } else {
                acc.neutral += 1;
            }
            return acc;
        },
        { positive: 0, neutral: 0, negative: 0 }
    );

    const total = sentiment.positive + sentiment.neutral + sentiment.negative;
    const positiveValue = total > 0 ? Math.round((sentiment.positive / total) * 100) : 35;
    const neutralValue = total > 0 ? Math.round((sentiment.neutral / total) * 100) : 20;
    const negativeValue = total > 0 ? Math.round((sentiment.negative / total) * 100) : 45;

    const data = [
        { name: 'Positif', value: positiveValue },
        { name: 'Neutre', value: neutralValue },
        { name: 'Négatif', value: negativeValue },
    ];

    const dominant = data.reduce((acc, current) => (current.value > acc.value ? current : acc), data[0]);
    const dominantClass =
        dominant.name === 'Négatif' ? 'text-red-500' : dominant.name === 'Positif' ? 'text-emerald-500' : 'text-slate-400';
    const trendText =
        dominant.name === 'Négatif'
            ? `Dégradation détectée suite aux dernières publications sur ${target.newsFeed[0]?.source ?? 'les médias'} concernant le secteur ${target.sector}.`
            : dominant.name === 'Positif'
                ? `Signal favorable détecté sur les dernières mentions publiques de ${target.name} dans le secteur ${target.sector}.`
                : `Tendance stable observée sur les dernières mentions publiques de ${target.name} dans le secteur ${target.sector}.`;

    const COLORS = ['#10b981', '#64748b', '#ef4444']; // Green, Slate, Red

    return (
        <div className="flex flex-col h-full bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center">
                    <Activity className="w-3 h-3 mr-2 text-amber-500" />
                    E-Réputation
                </h3>
            </div>

            <div className="flex-1 p-4 flex flex-col relative">

                {/* Main Gauge */}
                <div className="flex-1 relative min-h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                startAngle={180}
                                endAngle={0}
                                stroke="none"
                            >
                                {data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }}
                                itemStyle={{ color: '#e2e8f0' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-2 text-center">
                        <span className={`block text-2xl font-bold ${dominantClass}`}>{dominant.value}%</span>
                        <span className="text-[10px] uppercase text-slate-500">{dominant.name}</span>
                    </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="mt-2 grid grid-cols-2 gap-3">
                    <div className="bg-slate-950/50 p-2 border border-slate-800 rounded flex items-center justify-between">
                        <div className="flex items-center text-xs text-slate-400">
                            <ThumbsUp className="w-3 h-3 mr-2 text-emerald-500" />
                            Approbation
                        </div>
                        <span className="font-mono text-emerald-500 text-sm">{positiveValue}%</span>
                    </div>
                    <div className="bg-slate-950/50 p-2 border border-slate-800 rounded flex items-center justify-between">
                        <div className="flex items-center text-xs text-slate-400">
                            <ThumbsDown className="w-3 h-3 mr-2 text-red-500" />
                            Hostilité
                        </div>
                        <span className="font-mono text-red-500 text-sm">{negativeValue}%</span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 flex items-start space-x-2">
                    <TrendingDown className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-400 leading-relaxed">
                        {trendText}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ReputationWidget;
