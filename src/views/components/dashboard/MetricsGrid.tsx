import React from 'react';
import { useAppContext } from '../../../viewmodels/contexts/AppContext';

interface MetricCardProps {
    value: string | number;
    label: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ value, label }) => {
    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-1 border border-gray-700">
            <div className="text-2xl font-bold text-emerald-500 mb-2">{value}</div>
            <div className="text-gray-400 text-sm">{label}</div>
        </div>
    );
};

const MetricsGrid: React.FC = () => {
    const { state } = useAppContext();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <MetricCard
                value={state.stats.activeConnections}
                label="Aktif Bağlantılar"
            />
            <MetricCard
                value={state.stats.totalRequests}
                label="Toplam İstek"
            />
            <MetricCard
                value={`${((state.stats.successfulRequests / state.stats.totalRequests) * 100 || 0).toFixed(1)}%`}
                label="Başarı Oranı"
            />
            <MetricCard
                value={state.cacheStats.hitRate}
                label="Önbellek İsabet Oranı"
            />
        </div>
    );
};

export default MetricsGrid; 