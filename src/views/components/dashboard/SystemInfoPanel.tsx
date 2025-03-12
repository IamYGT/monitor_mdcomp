import React from 'react';
import { useAppContext } from '../../../viewmodels/contexts/AppContext';

interface InfoCardProps {
    title: string;
    children: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, children }) => {
    return (
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-md transition-all hover:shadow-lg">
            <h6 className="text-emerald-500 mb-4 text-sm font-semibold uppercase tracking-wide">
                {title}
            </h6>
            {children}
        </div>
    );
};

interface InfoMetricProps {
    label: string;
    value: string | number;
}

const InfoMetric: React.FC<InfoMetricProps> = ({ label, value }) => {
    return (
        <div className="bg-gray-900/50 p-3 rounded-lg text-sm text-center transition-all hover:bg-gray-900/70">
            {label}
            <span className="text-emerald-500 block mt-1 font-semibold">{value}</span>
        </div>
    );
};

const SystemInfoPanel: React.FC = () => {
    const { state } = useAppContext();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <InfoCard title="Sunucu Durumu">
                <div className="grid grid-cols-2 gap-3">
                    <InfoMetric label="CPU Kullanımı" value={state.serverStats.cpuUsage} />
                    <InfoMetric label="Bellek" value={state.serverStats.memoryUsage} />
                    <InfoMetric label="Çalışma Süresi" value={state.serverStats.uptime} />
                </div>
            </InfoCard>

            <InfoCard title="WebSocket İstatistikleri">
                <div className="grid grid-cols-2 gap-3">
                    <InfoMetric label="Bağlantılar" value={state.wsStats.connections} />
                    <InfoMetric label="Mesaj/sn" value={state.wsStats.messagesPerSecond} />
                    <InfoMetric label="Toplam Mesaj" value={state.wsStats.totalMessages} />
                </div>
            </InfoCard>

            <InfoCard title="Önbellek Durumu">
                <div className="grid grid-cols-2 gap-3">
                    <InfoMetric label="Boyut" value={state.cacheStats.size} />
                    <InfoMetric label="İsabet Oranı" value={state.cacheStats.hitRate} />
                    <InfoMetric label="Öğeler" value={state.cacheStats.items} />
                </div>
            </InfoCard>
        </div>
    );
};

export default SystemInfoPanel; 