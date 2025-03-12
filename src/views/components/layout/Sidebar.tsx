import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../../viewmodels/contexts/AppContext';

interface NavItemProps {
    icon: string;
    label: string;
    path: string;
    tabId: 'dashboard' | 'market-data' | 'connections' | 'settings';
    isActive: boolean;
    onClick: (tabId: 'dashboard' | 'market-data' | 'connections' | 'settings', path: string) => void;
    badge?: number | string;
    tooltip?: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, path, tabId, isActive, onClick, badge, tooltip }) => {
    return (
        <li className="px-3 py-1.5">
            <button
                onClick={() => onClick(tabId, path)}
                className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 ease-in-out ${isActive
                    ? 'bg-gradient-to-r from-emerald-600/40 to-emerald-500/20 text-emerald-400 shadow-md'
                    : 'text-gray-400 hover:bg-gray-800/70 hover:text-gray-200'
                    } text-left font-medium relative group`}
                title={tooltip}
            >
                <i className={`bi bi-${icon} text-lg ${isActive ? 'text-emerald-400' : 'text-gray-500'} mr-3 transition-transform duration-200 ease-in-out group-hover:scale-110`}></i>
                <span className="transition-all duration-200">{label}</span>

                {badge && (
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center min-w-5 h-5 text-xs px-1.5 py-0.5 rounded-full ${typeof badge === 'number' && badge > 0 ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-300'
                        }`}>
                        {badge}
                    </span>
                )}

                {/* Aktif sekme göstergesi */}
                {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-md"></span>
                )}
            </button>
        </li>
    );
};

const Sidebar: React.FC = () => {
    const { state, setActiveTab } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    // Mevcut URL'e göre aktif sekmeyi belirle
    React.useEffect(() => {
        if (location.pathname === '/') {
            setActiveTab('dashboard');
        } else if (location.pathname === '/market-data') {
            setActiveTab('market-data');
        } else if (location.pathname === '/connections') {
            setActiveTab('connections');
        } else if (location.pathname === '/settings') {
            setActiveTab('settings');
        }
    }, [location, setActiveTab]);

    // Hem sekme durumunu değiştir hem de sayfayı yönlendir
    const handleTabChange = (tabId: 'dashboard' | 'market-data' | 'connections' | 'settings', path: string) => {
        setActiveTab(tabId);
        navigate(path);

        // Debug için loglama
        console.log(`Sekme değiştirildi: ${tabId}, Yönlendiriliyor: ${path}`);
    };

    return (
        <aside className={`transition-all duration-300 ease-in-out ${collapsed ? 'w-20' : 'w-64'} h-screen bg-gray-900/80 backdrop-blur-md border-r border-gray-700/50 fixed left-0 top-0 shadow-lg overflow-y-auto flex flex-col z-30 pt-14`}>
            {/* Sidebar Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute top-16 right-2 p-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-full transition-colors"
                title={collapsed ? "Menüyü Genişlet" : "Menüyü Daralt"}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Navigation Menu */}
            <div className="flex-1 py-4">
                <ul className="nav-menu space-y-1">
                    <NavItem
                        icon="speedometer2"
                        label={collapsed ? "" : "Dashboard"}
                        path="/"
                        tabId="dashboard"
                        isActive={state.activeTab === 'dashboard'}
                        onClick={handleTabChange}
                        tooltip="Dashboard"
                    />
                    <NavItem
                        icon="graph-up"
                        label={collapsed ? "" : "Market Verileri"}
                        path="/market-data"
                        tabId="market-data"
                        isActive={state.activeTab === 'market-data'}
                        onClick={handleTabChange}
                        badge={state.marketData.length}
                        tooltip="Market Verileri"
                    />
                    <NavItem
                        icon="people"
                        label={collapsed ? "" : "Bağlantılar"}
                        path="/connections"
                        tabId="connections"
                        isActive={state.activeTab === 'connections'}
                        onClick={handleTabChange}
                        badge={state.clients.length > 0 ? state.clients.length : undefined}
                        tooltip="Bağlantılar"
                    />
                    <NavItem
                        icon="gear"
                        label={collapsed ? "" : "Ayarlar"}
                        path="/settings"
                        tabId="settings"
                        isActive={state.activeTab === 'settings'}
                        onClick={handleTabChange}
                        tooltip="Ayarlar"
                    />
                </ul>
            </div>

            {/* Sistem Bilgileri - Mini Widget */}
            <div className={`px-4 py-3 mx-3 mb-4 bg-gray-800/60 rounded-lg border border-gray-700/50 shadow-inner ${collapsed ? 'hidden' : 'block'}`}>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span>Sistem Durumu</span>
                    <span className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1"></span>
                        Aktif
                    </span>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">CPU</span>
                        <span className="text-emerald-400">{state.serverStats.cpuUsage}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Bellek</span>
                        <span className="text-emerald-400">{state.serverStats.memoryUsage}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Çalışma Süresi</span>
                        <span className="text-emerald-400">{state.serverStats.uptime}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar; 