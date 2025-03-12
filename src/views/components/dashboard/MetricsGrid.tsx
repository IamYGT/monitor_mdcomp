import React from 'react';
import { useAppContext } from '../../../viewmodels/contexts/AppContext';

interface MetricCardProps {
    value: string | number;
    label: string;
    icon?: string;
    changeValue?: number;
    tooltip?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ value, label, icon = "graph-up", changeValue, tooltip }) => {
    const isPositiveChange = changeValue && changeValue > 0;
    const isNegativeChange = changeValue && changeValue < 0;

    // Doğru değişim oku ikonunu ve rengini seç
    const changeIcon = isPositiveChange ? 'arrow-up' : isNegativeChange ? 'arrow-down' : 'dash';
    const changeColor = isPositiveChange ? 'text-emerald-400' : isNegativeChange ? 'text-red-400' : 'text-gray-400';

    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-800/80 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-700/50 group relative"
            title={tooltip}>
            {/* Üst İçerik */}
            <div className="p-5 flex justify-between items-start">
                <div>
                    <div className="text-gray-400 text-sm font-medium mb-1.5">{label}</div>
                    <div className="flex items-baseline">
                        <div className="text-2xl font-bold text-white mb-0.5">{value}</div>

                        {/* Değişim yüzdesi - varsa */}
                        {changeValue !== undefined && (
                            <div className={`ml-2 text-xs font-medium flex items-center ${changeColor}`}>
                                <i className={`bi bi-${changeIcon} mr-0.5`}></i>
                                {Math.abs(changeValue).toFixed(1)}%
                            </div>
                        )}
                    </div>
                </div>

                {/* İkon */}
                <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-500/10 p-2.5 rounded-lg shadow-inner">
                    <i className={`bi bi-${icon} text-xl text-emerald-400`}></i>
                </div>
            </div>

            {/* Alt Bilgi Çubuğu */}
            <div className="px-5 py-2.5 border-t border-gray-700/30 bg-gray-800/70">
                <div className="text-gray-400 text-xs flex items-center">
                    <i className="bi bi-info-circle mr-1.5"></i>
                    <span>Son güncelleme: {new Date().toLocaleTimeString()}</span>
                </div>
            </div>
        </div>
    );
};

const MetricsGrid: React.FC = () => {
    const { state } = useAppContext();

    // Son bir saatteki değişim yüzdeleri için simüle edilmiş değerler
    const changeValues = {
        connections: 5.2,
        requests: 12.8,
        successRate: -2.4,
        cacheHit: 7.6
    };

    // Başarı oranını hesaplama
    const successRate = ((state.stats.successfulRequests / state.stats.totalRequests) * 100 || 0).toFixed(1);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard
                value={state.stats.activeConnections}
                label="Aktif Bağlantılar"
                icon="people"
                changeValue={changeValues.connections}
                tooltip="Şu anda aktif olan WebSocket bağlantı sayısı"
            />
            <MetricCard
                value={state.stats.totalRequests}
                label="Toplam İstek"
                icon="arrow-repeat"
                changeValue={changeValues.requests}
                tooltip="Sunucuya yapılan toplam istek sayısı"
            />
            <MetricCard
                value={`${successRate}%`}
                label="Başarı Oranı"
                icon="check-circle"
                changeValue={changeValues.successRate}
                tooltip="Başarılı isteklerin toplam isteklere oranı"
            />
            <MetricCard
                value={state.cacheStats.hitRate}
                label="Önbellek İsabet Oranı"
                icon="speedometer2"
                changeValue={changeValues.cacheHit}
                tooltip="Önbellek tarafından karşılanan isteklerin oranı"
            />
        </div>
    );
};

export default MetricsGrid; 