import React from 'react';
import { useAppContext } from '../../../viewmodels/contexts/AppContext';
import Button from '../ui/Button';

const StatusBar: React.FC = () => {
    const { state, toggleDebugMode } = useAppContext();

    return (
        <div className="flex gap-6 p-4 bg-gray-800 rounded-xl mb-6 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${state.connection.isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-400 text-sm font-medium">Durum:</span>
                <span className="text-emerald-500 font-semibold">
                    {state.connection.isConnected ? 'Bağlı' : 'Bağlantı Kesildi'}
                </span>
            </div>

            <div className="flex items-center gap-3">
                <i className="bi bi-lightning text-gray-400"></i>
                <span className="text-gray-400 text-sm font-medium">Aktif Sembol:</span>
                <span className="text-emerald-500 font-semibold">
                    {state.connection.activeSymbol}
                </span>
            </div>

            <div className="flex items-center gap-3 ml-auto">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleDebugMode}
                    icon={<i className="bi bi-bug"></i>}
                >
                    Debug Modu {state.connection.debugMode ? '(Açık)' : '(Kapalı)'}
                </Button>
            </div>
        </div>
    );
};

export default StatusBar; 