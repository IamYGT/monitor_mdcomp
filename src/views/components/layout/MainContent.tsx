import React, { ReactNode } from 'react';
// useAppContext burada doğrudan kullanılmadığı için import kaldırıldı
import StatusBar from './StatusBar';

interface MainContentProps {
    children: ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
    // StatusBar bileşeni kendi içinde useAppContext'i kullanıyor

    return (
        <div className="ml-64 p-6 bg-gray-900 min-h-screen">
            <StatusBar />
            {children}
        </div>
    );
};

export default MainContent; 