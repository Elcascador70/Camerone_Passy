import React from 'react';
import {
    LayoutDashboard,
    Building2,
    Newspaper,
    Users,
    Globe,
    DollarSign,
    MapPin,
    BrainCircuit,
    Settings,
    LogOut,
    Shield,
} from 'lucide-react';
import { DashboardTab } from '../types';

interface SidebarProps {
    onReset: () => void;
    activeTab: DashboardTab;
    onTabChange: (tab: DashboardTab) => void;
}

const menuItems: { icon: typeof LayoutDashboard; label: DashboardTab; short: string }[] = [
    { icon: LayoutDashboard, label: 'Vue Globale', short: 'Overview' },
    { icon: Building2, label: 'Identité', short: 'Identité' },
    { icon: Newspaper, label: 'Sentinelle Médias', short: 'Médias' },
    { icon: Users, label: 'SOCMINT', short: 'Social' },
    { icon: Globe, label: 'CYBINT', short: 'Cyber' },
    { icon: DollarSign, label: 'FININT', short: 'Finance' },
    { icon: MapPin, label: 'GEOINT', short: 'Géo' },
    { icon: BrainCircuit, label: 'Profiler IA', short: 'Profiler' },
];

const Sidebar: React.FC<SidebarProps> = ({ onReset, activeTab, onTabChange }) => {
    return (
        <aside className="w-16 lg:w-56 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 z-30 transition-all duration-300">

            {/* Branding */}
            <div className="h-14 flex items-center justify-center lg:justify-start lg:px-5 border-b border-slate-800">
                <Shield className="w-7 h-7 text-amber-500 shrink-0" />
                <span className="hidden lg:block ml-2 font-bold text-slate-200 tracking-wider text-xs">
                    CAMERONE PASSY
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto">
                {menuItems.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => onTabChange(item.label)}
                        className={`w-full flex items-center px-3 lg:px-5 py-2.5 border-l-2 transition-colors ${activeTab === item.label
                                ? 'border-amber-500 bg-slate-800/50 text-amber-500'
                                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                            }`}
                        title={item.label}
                    >
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span className="hidden lg:block ml-2.5 text-[10px] font-bold uppercase tracking-wide truncate">
                            {item.label}
                        </span>
                    </button>
                ))}
            </nav>

            {/* Footer / System */}
            <div className="p-3 border-t border-slate-800 space-y-1">
                <button className="w-full flex items-center justify-center lg:justify-start px-2 py-2 text-slate-500 hover:text-slate-300 transition-colors">
                    <Settings className="w-4 h-4" />
                    <span className="hidden lg:block ml-2 text-[10px] uppercase">Config</span>
                </button>
                <button
                    onClick={onReset}
                    className="w-full flex items-center justify-center lg:justify-start px-2 py-2 text-amber-500/70 hover:text-amber-500 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:block ml-2 text-[10px] uppercase font-bold">Clôturer</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
