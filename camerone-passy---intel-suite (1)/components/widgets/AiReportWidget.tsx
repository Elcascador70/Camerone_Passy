import React from 'react';
import { TargetData } from '../../types';
import { BrainCircuit, Copy, Share2 } from 'lucide-react';

interface AiReportWidgetProps {
  target: TargetData;
}

const AiReportWidget: React.FC<AiReportWidgetProps> = ({ target }) => {
  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 relative">
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
                    <span className="px-2 py-0.5 bg-slate-800 text-[10px] rounded text-slate-300 font-mono">MODEL: GPT-INTEL-V4</span>
                    <span className="px-2 py-0.5 bg-slate-800 text-[10px] rounded text-slate-300 font-mono">CONFIDENCE: 92%</span>
                 </div>
                 
                 <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    <strong className="text-amber-500">ANALYSE SYNTHÉTIQUE :</strong> La cible <span className="text-white font-mono">{target.name}</span> montre des signaux faibles indiquant une réorientation stratégique majeure dans le secteur {target.sector}.
                 </p>
                 
                 <ul className="text-sm text-slate-400 space-y-2 list-disc pl-4 marker:text-amber-500">
                    <li>
                        Augmentation anormale des recrutements sur les profils R&D (+15% sur 30 jours).
                    </li>
                    <li>
                        Corrélation forte avec les fluctuations récentes des matières premières.
                    </li>
                    <li>
                        <span className="text-amber-500 font-bold">ALERTE :</span> Possible fusion-acquisition détectée via l'analyse des connexions LinkedIn du COMEX.
                    </li>
                 </ul>

                 <div className="mt-6 pt-4 border-t border-slate-800/50 flex justify-end">
                     <button className="text-[10px] uppercase font-bold text-amber-500 hover:text-amber-400 border border-amber-500/30 hover:border-amber-500 px-3 py-1.5 transition-all">
                        Générer Rapport Complet PDF
                     </button>
                 </div>
             </div>
        </div>
    </div>
  );
};

export default AiReportWidget;