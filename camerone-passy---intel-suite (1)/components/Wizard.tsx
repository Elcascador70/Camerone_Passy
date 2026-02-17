import React, { useState } from 'react';
import { Target, Briefcase, Globe, ArrowRight, ShieldAlert } from 'lucide-react';
import { Sector, Range, TargetData } from '../types';

interface WizardProps {
  onLaunch: (data: TargetData) => void;
}

const Wizard: React.FC<WizardProps> = ({ onLaunch }) => {
  const [name, setName] = useState('');
  const [sector, setSector] = useState<Sector>(Sector.TECH);
  const [range, setRange] = useState<Range>(Range.NATIONAL);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    // Simulate system initialization delay
    setTimeout(() => {
      onLaunch({
        name,
        sector,
        range,
        timestamp: new Date().toISOString()
      });
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      
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
                  placeholder="NOM DE L'ENTITÉ OU DU DIRIGEANT"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-slate-700 transition-all font-mono"
                  autoFocus
                />
              </div>

              {/* Step 2: Sector */}
              <div className="space-y-2">
                <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Briefcase className="w-3 h-3 mr-2 text-amber-500" />
                  Secteur d'Activité
                </label>
                <div className="relative">
                  <select 
                    value={sector}
                    onChange={(e) => setSector(e.target.value as Sector)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-3 text-sm focus:border-amber-500 focus:outline-none appearance-none font-mono"
                  >
                    {Object.values(Sector).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
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
                      className={`text-[10px] uppercase font-bold py-2 px-1 border transition-all ${
                        range === r 
                        ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                      }`}
                    >
                      {r.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

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
            SECURE CONNECTION ESTABLISHED. V.2.0.4<br/>
            UNAUTHORIZED ACCESS IS PROHIBITED.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Wizard;