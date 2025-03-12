import React, { ReactNode } from 'react';
import { useAppContext } from '../../../viewmodels/contexts/AppContext';
import StatusBar from './StatusBar';

interface MainContentProps {
    children: ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
    const { state } = useAppContext();

    return (
        <div className="ml-64 p-6 bg-gray-900 min-h-screen">
            <StatusBar />
            {children}
        </div>
    );
};

export default MainContent; 