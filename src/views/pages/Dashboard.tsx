import React, { useState } from 'react';
import { useAppContext } from '../../viewmodels/contexts/AppContext';
import MetricsGrid from '../components/dashboard/MetricsGrid';
import ControlPanel from '../components/dashboard/ControlPanel';
import MarketDataTable from '../components/dashboard/MarketDataTable';
import LogPanel from '../components/dashboard/LogPanel';
import SystemInfoPanel from '../components/dashboard/SystemInfoPanel';

const Dashboard: React.FC = () => {
    const { state } = useAppContext();
    const [activePanel, setActivePanel] = useState<'logs' | 'market' | 'system'>('market');
    const [controlPanelCollapsed, setControlPanelCollapsed] = useState(false);

    return (
        <div className="space-y-4">
            {/* İstatistik Kartları - Daha kompakt hale getirildi */}
            <MetricsGrid />

            {/* Ana İçerik Bölümü - Panel Organizasyonu */}
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Katlanabilir Kontrol Paneli */}
                <div className={`transition-all duration-300 ${controlPanelCollapsed ? 'lg:w-12' : 'lg:w-1/5'} rounded-xl overflow-hidden`}>
                    <div className="bg-gray-800/70 shadow-lg border border-gray-700/30 rounded-xl h-full relative">
                        {/* Katla/Genişlet Düğmesi */}
                        <button
                            onClick={() => setControlPanelCollapsed(!controlPanelCollapsed)}
                            className="absolute top-3 right-3 p-1 rounded-full bg-gray-700/50 hover:bg-gray-600 z-10 transition-colors"
                            title={controlPanelCollapsed ? "Kontrol Panelini Genişlet" : "Kontrol Panelini Daralt"}
                        >
                            <i className={`bi bi-chevron-${controlPanelCollapsed ? 'right' : 'left'} text-xs`}></i>
                        </button>

                        {controlPanelCollapsed ? (
                            <div className="p-2 flex flex-col items-center space-y-6">
                                <button
                                    onClick={() => setControlPanelCollapsed(false)}
                                    className="w-6 h-24 bg-gray-700/50 rounded-lg writing-mode-vertical-rl text-xs font-medium text-gray-300 flex items-center justify-center hover:bg-gray-700"
                                >
                                    <i className="bi bi-sliders rotate-90 mb-2"></i>
                                    Kontroller
                                </button>
                            </div>
                        ) : (
                            <div className="p-3">
                                <ControlPanel />

                                {/* Mobil Panel Seçici */}
                                <div className="mt-4 lg:hidden">
                                    <h3 className="text-sm text-gray-400 mb-3 font-medium">Panel Seçimi</h3>
                                    <div className="flex bg-gray-900/50 p-1 rounded-lg">
                                        <button
                                            onClick={() => setActivePanel('market')}
                                            className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-all ${activePanel === 'market'
                                                ? 'bg-emerald-600/20 text-emerald-400'
                                                : 'text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            Market Verileri
                                        </button>
                                        <button
                                            onClick={() => setActivePanel('system')}
                                            className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-all ${activePanel === 'system'
                                                ? 'bg-blue-600/20 text-blue-400'
                                                : 'text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            Sistem Bilgisi
                                        </button>
                                        <button
                                            onClick={() => setActivePanel('logs')}
                                            className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-all ${activePanel === 'logs'
                                                ? 'bg-purple-600/20 text-purple-400'
                                                : 'text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            Loglar {state.logs.length > 0 && (
                                                <span className="ml-1 bg-purple-600 text-white px-1.5 py-0.5 rounded-full text-xs">
                                                    {state.logs.length > 99 ? "99+" : state.logs.length}
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Ana İçerik Panelleri - Daha Geniş Alan */}
                <div className={`transition-all duration-300 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4`}>
                    {/* Market Verileri Paneli - Daha Geniş Alan */}
                    <div className={`${activePanel === 'market' || window.innerWidth >= 1024 ? 'lg:col-span-2' : 'hidden'}`}>
                        <div className="bg-gray-800/70 rounded-xl shadow-lg border border-gray-700/30 overflow-hidden">
                            <div className="p-3 border-b border-gray-700/30 flex justify-between items-center">
                                <h2 className="text-base font-semibold text-gray-100 flex items-center">
                                    <i className="bi bi-graph-up text-emerald-400 mr-2"></i>
                                    Market Verileri
                                </h2>
                                <div className="text-xs text-gray-400">
                                    Son Güncelleme: {state.marketData.length > 0 ?
                                        new Date(state.marketData[0]?.timestamp || Date.now()).toLocaleTimeString() :
                                        'Veri Yok'}
                                </div>
                            </div>
                            <MarketDataTable />
                        </div>
                    </div>

                    {/* Sistem Bilgisi ve Logları Yan Yana (Geniş Ekranda) */}
                    <div className={`${activePanel === 'system' || window.innerWidth >= 1024 ? 'block' : 'hidden'} h-full`}>
                        <div className="bg-gray-800/70 rounded-xl shadow-lg border border-gray-700/30 overflow-hidden h-full">
                            <div className="p-3 border-b border-gray-700/30">
                                <h2 className="text-base font-semibold text-gray-100 flex items-center">
                                    <i className="bi bi-cpu text-blue-400 mr-2"></i>
                                    Sistem Bilgileri
                                </h2>
                            </div>
                            <SystemInfoPanel />
                        </div>
                    </div>

                    <div className={`${activePanel === 'logs' || window.innerWidth >= 1024 ? 'block' : 'hidden'} h-full`}>
                        <div className="bg-gray-800/70 rounded-xl shadow-lg border border-gray-700/30 overflow-hidden h-full">
                            <div className="p-3 border-b border-gray-700/30 flex justify-between items-center">
                                <h2 className="text-base font-semibold text-gray-100 flex items-center">
                                    <i className="bi bi-journal-text text-purple-400 mr-2"></i>
                                    Sistem Logları
                                </h2>
                                <div className="text-xs text-gray-400">
                                    {state.logs.length > 0 ? `${state.logs.length} log kaydı` : 'Log kaydı yok'}
                                </div>
                            </div>
                            <LogPanel />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 