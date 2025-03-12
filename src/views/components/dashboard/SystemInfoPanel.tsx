import React from 'react';
import { useAppContext } from '../../../viewmodels/contexts/AppContext';

interface InfoCardProps {
    title: string;
    icon: string;
    children: React.ReactNode;
    borderColor?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, icon, children, borderColor = 'border-emerald-500/30' }) => {
    return (
        <div className={`bg-gradient-to-br from-gray-800 to-gray-800/90 rounded-xl shadow-lg border border-gray-700/30 overflow-hidden transition-all hover:shadow-lg hover:border-opacity-50 ${borderColor}`}>
            <div className="px-5 py-4 border-b border-gray-700/30 flex items-center">
                <div className={`text-emerald-400 mr-2 bg-emerald-900/30 p-1.5 rounded-lg`}>
                    <i className={`bi bi-${icon} text-lg`}></i>
                </div>
                <h6 className="text-gray-200 text-sm font-medium">
                    {title}
                </h6>
            </div>
            <div className="p-4">
                {children}
            </div>
        </div>
    );
};

interface InfoMetricProps {
    label: string;
    value: string | number;
    icon?: string;
    trend?: 'up' | 'down' | 'stable';
    showChart?: boolean;
    color?: 'green' | 'red' | 'blue' | 'yellow' | 'purple' | 'default';
}

const InfoMetric: React.FC<InfoMetricProps> = ({
    label,
    value,
    icon,
    trend = 'stable',
    showChart = false,
    color = 'default'
}) => {
    // Farklı renkler için sınıf haritaları
    const colorClasses = {
        green: 'text-emerald-400 bg-emerald-900/20',
        red: 'text-red-400 bg-red-900/20',
        blue: 'text-blue-400 bg-blue-900/20',
        yellow: 'text-yellow-400 bg-yellow-900/20',
        purple: 'text-purple-400 bg-purple-900/20',
        default: 'text-emerald-400 bg-gray-800/50'
    };

    // Trend ikonunu belirle
    const trendIcon = trend === 'up'
        ? <i className="bi bi-arrow-up-right text-emerald-400"></i>
        : trend === 'down'
            ? <i className="bi bi-arrow-down-right text-red-400"></i>
            : <i className="bi bi-dash text-gray-400"></i>;

    // Simüle edilmiş basit çubuk grafiği için veri
    const chartBars = [30, 45, 25, 60, 35, 45, 40, 80, 60, 75];

    return (
        <div className="bg-gray-800/40 p-3 rounded-lg transition-all hover:bg-gray-800/60 border border-gray-700/30 hover:border-gray-700/50 group">
            <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center text-gray-400 text-xs">
                    {icon && <i className={`bi bi-${icon} mr-1.5`}></i>}
                    <span>{label}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                    {trendIcon}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className={`text-base font-semibold ${colorClasses[color].split(' ')[0]}`}>
                    {value}
                </div>

                {/* Trend ve Mini Grafik */}
                {showChart && (
                    <div className="hidden group-hover:flex items-end h-8 gap-0.5 mt-1.5">
                        {chartBars.map((height, i) => (
                            <div
                                key={i}
                                className={`w-1 rounded-sm ${colorClasses[color].split(' ')[0]} opacity-70`}
                                style={{ height: `${height}%` }}
                            ></div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const SystemInfoPanel: React.FC = () => {
    const { state } = useAppContext();

    // CPU kullanımı değerini sayıya çevirme
    const cpuUsageNumeric = parseInt(state.serverStats.cpuUsage.replace('%', '')) || 0;

    // Bellek kullanımını sayıya çevirme
    const memoryUsageNumeric = parseInt(state.serverStats.memoryUsage.split(' ')[0]) || 0;

    // İsabet oranını sayıya çevirme
    const hitRateNumeric = parseInt(state.cacheStats.hitRate.replace('%', '')) || 0;

    // Renk ve trend yönünü belirleme işlevi
    const getMetricProps = (value: number, threshold1 = 50, threshold2 = 80) => {
        if (value < threshold1) return { color: 'green' as const, trend: 'stable' as const };
        if (value < threshold2) return { color: 'yellow' as const, trend: 'up' as const };
        return { color: 'red' as const, trend: 'up' as const };
    };

    // İsabet oranı için ters mantık (daha yüksek daha iyi)
    const getHitRateProps = (value: number) => {
        if (value > 80) return { color: 'green' as const, trend: 'up' as const };
        if (value > 50) return { color: 'yellow' as const, trend: 'stable' as const };
        return { color: 'red' as const, trend: 'down' as const };
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoCard title="Sunucu Durumu" icon="cpu" borderColor="border-blue-500/30">
                <div className="grid grid-cols-2 gap-3">
                    <InfoMetric
                        label="CPU Kullanımı"
                        value={state.serverStats.cpuUsage}
                        icon="cpu-fill"
                        showChart={true}
                        {...getMetricProps(cpuUsageNumeric)}
                    />
                    <InfoMetric
                        label="Bellek"
                        value={state.serverStats.memoryUsage}
                        icon="memory"
                        showChart={true}
                        {...getMetricProps(memoryUsageNumeric, 500, 900)}
                    />
                    <InfoMetric
                        label="Çalışma Süresi"
                        value={state.serverStats.uptime}
                        icon="clock-history"
                        color="blue"
                        trend="stable"
                    />
                    <InfoMetric
                        label="Aktif Bağl."
                        value={state.stats.activeConnections}
                        icon="people"
                        color="purple"
                        trend="up"
                    />
                </div>
            </InfoCard>

            <InfoCard title="WebSocket İstatistikleri" icon="broadcast" borderColor="border-purple-500/30">
                <div className="grid grid-cols-2 gap-3">
                    <InfoMetric
                        label="Bağlantılar"
                        value={state.wsStats.connections}
                        icon="link"
                        color="purple"
                        trend="stable"
                    />
                    <InfoMetric
                        label="Mesaj/sn"
                        value={state.wsStats.messagesPerSecond.toFixed(1)}
                        icon="lightning"
                        color="yellow"
                        showChart={true}
                        trend="up"
                    />
                    <InfoMetric
                        label="Toplam Mesaj"
                        value={state.wsStats.totalMessages.toLocaleString()}
                        icon="envelope-fill"
                        color="blue"
                        trend="up"
                    />
                    <InfoMetric
                        label="Başarı Oranı"
                        value={`${((state.stats.successfulRequests / state.stats.totalRequests) * 100 || 0).toFixed(1)}%`}
                        icon="check-circle"
                        color="green"
                        trend="stable"
                    />
                </div>
            </InfoCard>

            <InfoCard title="Önbellek Durumu" icon="speedometer2" borderColor="border-emerald-500/30">
                <div className="grid grid-cols-2 gap-3">
                    <InfoMetric
                        label="Boyut"
                        value={state.cacheStats.size}
                        icon="hdd-fill"
                        color="blue"
                        trend="stable"
                    />
                    <InfoMetric
                        label="İsabet Oranı"
                        value={state.cacheStats.hitRate}
                        icon="bullseye"
                        showChart={true}
                        {...getHitRateProps(hitRateNumeric)}
                    />
                    <InfoMetric
                        label="Öğeler"
                        value={state.cacheStats.items.toLocaleString()}
                        icon="collection"
                        color="purple"
                        trend="stable"
                    />
                    <InfoMetric
                        label="Cache Hits"
                        value={state.stats.cacheHits.toLocaleString()}
                        icon="lightning-charge-fill"
                        color="green"
                        trend="up"
                    />
                </div>
            </InfoCard>
        </div>
    );
};

export default SystemInfoPanel; 