import React, { useState } from 'react';
import { TargetData, DashboardTab } from '../types';
import Sidebar from './Sidebar';
import Header from './Header';
import MapWidget from './widgets/MapWidget';
import ReputationWidget from './widgets/ReputationWidget';
import TickerWidget from './widgets/TickerWidget';
import AiReportWidget from './widgets/AiReportWidget';

interface DashboardProps {
    target: TargetData;
    onReset?: () => void;
    onNewSearch: (data: TargetData) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ target, onReset, onNewSearch }) => {
    const [activeTab, setActiveTab] = useState<DashboardTab>('Radar Scientifique');

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
            <Sidebar
                onReset={onReset || (() => window.location.reload())}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Top Grid Overlay for aesthetic */}
                <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-slate-950 to-transparent z-20 pointer-events-none" />

                <Header target={target} onNewSearch={onNewSearch} />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">

                        {activeTab === 'Radar Scientifique' && (
                            <>
                                <div className="lg:col-span-8 h-[400px]">
                                    <MapWidget target={target} />
                                </div>
                                <div className="lg:col-span-4 h-[400px]">
                                    <ReputationWidget target={target} />
                                </div>
                            </>
                        )}

                        {activeTab === 'Sentinelle Web' && (
                            <div className="lg:col-span-12 h-[400px]">
                                <TickerWidget target={target} />
                            </div>
                        )}

                        {activeTab === 'Profiler Dirigeants' && (
                            <div className="lg:col-span-12 h-[400px]">
                                <AiReportWidget target={target} />
                            </div>
                        )}

                        {activeTab === 'Rapport SWOT' && (
                            <>
                                <div className="lg:col-span-8 h-[400px]">
                                    <MapWidget target={target} />
                                </div>
                                <div className="lg:col-span-4 h-[400px]">
                                    <ReputationWidget target={target} />
                                </div>
                                <div className="lg:col-span-4 h-[350px]">
                                    <TickerWidget target={target} />
                                </div>
                                <div className="lg:col-span-8 h-[350px]">
                                    <AiReportWidget target={target} />
                                </div>
                            </>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
