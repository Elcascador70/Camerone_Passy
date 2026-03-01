import React, { useState } from 'react';
import { TargetData, DashboardTab } from '../types';
import Sidebar from './Sidebar';
import Header from './Header';
import OverviewWidget from './widgets/OverviewWidget';
import MapWidget from './widgets/MapWidget';
import ReputationWidget from './widgets/ReputationWidget';
import TickerWidget from './widgets/TickerWidget';
import SocialWidget from './widgets/SocialWidget';
import CyberWidget from './widgets/CyberWidget';
import FinanceWidget from './widgets/FinanceWidget';
import GeoWidget from './widgets/GeoWidget';
import AiReportWidget from './widgets/AiReportWidget';

interface DashboardProps {
    target: TargetData;
    onReset?: () => void;
    onNewSearch: (data: TargetData) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ target, onReset, onNewSearch }) => {
    const [activeTab, setActiveTab] = useState<DashboardTab>('Vue Globale');

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
            <Sidebar
                onReset={onReset || (() => window.location.reload())}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-slate-950 to-transparent z-20 pointer-events-none" />

                <Header target={target} onNewSearch={onNewSearch} />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">

                        {/* Vue Globale */}
                        {activeTab === 'Vue Globale' && (
                            <div className="lg:col-span-12 min-h-[500px]">
                                <OverviewWidget target={target} onNavigate={setActiveTab} />
                            </div>
                        )}

                        {/* Identité & Légal */}
                        {activeTab === 'Identité' && (
                            <>
                                <div className="lg:col-span-8 h-[450px]">
                                    <MapWidget target={target} />
                                </div>
                                <div className="lg:col-span-4 h-[450px]">
                                    <ReputationWidget target={target} />
                                </div>
                            </>
                        )}

                        {/* Sentinelle Médias */}
                        {activeTab === 'Sentinelle Médias' && (
                            <>
                                <div className="lg:col-span-8 h-[450px]">
                                    <TickerWidget target={target} />
                                </div>
                                <div className="lg:col-span-4 h-[450px]">
                                    <ReputationWidget target={target} />
                                </div>
                            </>
                        )}

                        {/* SOCMINT */}
                        {activeTab === 'SOCMINT' && (
                            <div className="lg:col-span-12 min-h-[450px]">
                                <SocialWidget target={target} />
                            </div>
                        )}

                        {/* CYBINT */}
                        {activeTab === 'CYBINT' && (
                            <div className="lg:col-span-12 min-h-[500px]">
                                <CyberWidget target={target} />
                            </div>
                        )}

                        {/* FININT */}
                        {activeTab === 'FININT' && (
                            <div className="lg:col-span-12 min-h-[500px]">
                                <FinanceWidget target={target} />
                            </div>
                        )}

                        {/* GEOINT */}
                        {activeTab === 'GEOINT' && (
                            <div className="lg:col-span-12 h-[550px]">
                                <GeoWidget target={target} />
                            </div>
                        )}

                        {/* Profiler IA */}
                        {activeTab === 'Profiler IA' && (
                            <div className="lg:col-span-12 min-h-[450px]">
                                <AiReportWidget target={target} />
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
