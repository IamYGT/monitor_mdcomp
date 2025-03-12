import React, { ReactNode, useState, useEffect } from 'react';
import { useAppContext } from '../../../viewmodels/contexts/AppContext';
import StatusBar from './StatusBar';

interface MainContentProps {
    children: ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
    const { } = useAppContext();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [statusBarCollapsed, setStatusBarCollapsed] = useState(false);

    // Sidebar içindeki collapse durumunu izlemek için ekran genişliğini dinleyelim
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarCollapsed(true);
            }
        };

        // İlk render
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Mobilde otomatik sidebar kapat, bilgisayarda otomatik düzenle
    useEffect(() => {
        const checkSidebar = () => {
            const sidebarElement = document.querySelector('aside');
            if (sidebarElement) {
                const sidebarWidth = sidebarElement.clientWidth;
                setSidebarCollapsed(sidebarWidth <= 80);
            }
        };

        // Her 500ms'de bir sidebar durumunu kontrol et
        const interval = setInterval(checkSidebar, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <main
            className={`transition-all duration-300 ease-in-out 
            ${sidebarCollapsed ? 'ml-20' : 'ml-64'} 
            p-2 md:p-3 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen`}
        >
            <div className="w-full max-w-none">
                {/* Gizlenebilir Durum Çubuğu */}
                <div className="relative mb-3">
                    <button
                        onClick={() => setStatusBarCollapsed(!statusBarCollapsed)}
                        className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 rounded-full w-6 h-6 
                        bg-gray-800 border border-gray-700 shadow-lg z-10 flex items-center justify-center
                        text-gray-400 hover:text-gray-200 transition-colors"
                        title={statusBarCollapsed ? "Durum çubuğunu göster" : "Durum çubuğunu gizle"}
                    >
                        <i className={`bi bi-chevron-${statusBarCollapsed ? 'down' : 'up'} text-xs`}></i>
                    </button>

                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${statusBarCollapsed ? 'max-h-0 opacity-0 mb-0' : 'max-h-96 opacity-100'
                        }`}>
                        <StatusBar />
                    </div>
                </div>

                {/* İçerik alanı */}
                <div className="space-y-4">
                    {children}
                </div>
            </div>
        </main>
    );
};

export default MainContent; 