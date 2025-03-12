import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../../viewmodels/contexts/AppContext';

interface NavItemProps {
    icon: string;
    label: string;
    path: string;
    tabId: 'dashboard' | 'market-data' | 'connections' | 'settings';
    isActive: boolean;
    onClick: (tabId: 'dashboard' | 'market-data' | 'connections' | 'settings', path: string) => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, path, tabId, isActive, onClick }) => {
    return (
        <li className="px-3 py-1">
            <button
                onClick={() => onClick(tabId, path)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                    } w-full text-left font-medium`}
            >
                <i className={`bi bi-${icon}`}></i>
                {label}
            </button>
        </li>
    );
};

const Sidebar: React.FC = () => {
    const { state, setActiveTab } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();

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
        <div className="w-64 h-screen bg-gray-900 border-r border-gray-700 fixed left-0 top-0 shadow-lg overflow-y-auto">
            <div className="py-6 px-6 border-b border-gray-700 mb-6">
                <a
                    href="/"
                    onClick={(e) => {
                        e.preventDefault();
                        handleTabChange('dashboard', '/');
                    }}
                    className="text-emerald-500 text-xl font-semibold flex items-center gap-3 transition-opacity hover:opacity-90"
                >
                    <i className="bi bi-graph-up"></i>
                    Market Veri İzleyici
                </a>
            </div>

            <ul className="nav-menu">
                <NavItem
                    icon="speedometer2"
                    label="Dashboard"
                    path="/"
                    tabId="dashboard"
                    isActive={state.activeTab === 'dashboard'}
                    onClick={handleTabChange}
                />
                <NavItem
                    icon="graph-up"
                    label="Market Verileri"
                    path="/market-data"
                    tabId="market-data"
                    isActive={state.activeTab === 'market-data'}
                    onClick={handleTabChange}
                />
                <NavItem
                    icon="people"
                    label="Bağlantılar"
                    path="/connections"
                    tabId="connections"
                    isActive={state.activeTab === 'connections'}
                    onClick={handleTabChange}
                />
                <NavItem
                    icon="gear"
                    label="Ayarlar"
                    path="/settings"
                    tabId="settings"
                    isActive={state.activeTab === 'settings'}
                    onClick={handleTabChange}
                />
            </ul>
        </div>
    );
};

export default Sidebar; 