import React, { useState } from 'react';
import { useAppContext } from '../../../viewmodels/contexts/AppContext';
import Button from '../ui/Button';

const StatusBar: React.FC = () => {
    const { state, toggleDebugMode } = useAppContext();
    const [showDetailedStatus, setShowDetailedStatus] = useState(false);
    const [showServerAddress, setShowServerAddress] = useState(false); // Sunucu adresini gösterme durumu

    // Ek istatistik göstergeleri için hesaplamalar
    const messagesPerSecond = state.wsStats.messagesPerSecond;
    const formattedMPS = messagesPerSecond.toFixed(1);

    // Aktif sembolü kısaltma
    const activeSymbolDisplay = state.connection.activeSymbol.replace('BINANCE:', '');

    // Sunucu adresi
    const serverAddress = state.connection.serverUrl || "ws://154.194.35.202:8080"; // varsayılan değer veya state'ten al

    return (
        <div className="grid gap-4 mb-3">
            {/* Ana durum kartı */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-800/70 rounded-xl shadow-lg border border-gray-700/30 overflow-hidden">
                {/* Kart içeriği */}
                <div className="flex flex-wrap md:flex-nowrap items-center p-3 gap-4">
                    {/* Bağlantı durumu */}
                    <div className="flex items-center gap-3 min-w-fit">
                        <div className={`h-3 w-3 rounded-full ${state.connection.isConnected
                            ? 'bg-emerald-500 animate-pulse'
                            : 'bg-red-500'}`}></div>
                        <span className="text-gray-400 text-sm font-medium">Durum:</span>
                        <span className={`font-semibold ${state.connection.isConnected
                            ? 'text-emerald-400'
                            : 'text-red-400'}`}>
                            {state.connection.isConnected ? 'Bağlı' : 'Bağlantı Kesildi'}
                        </span>

                        {/* Sunucu adresi - gizlenebilir */}
                        <div className="flex items-center ml-2">
                            <button
                                onClick={() => setShowServerAddress(!showServerAddress)}
                                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                                title={showServerAddress ? "Sunucu adresini gizle" : "Sunucu adresini göster"}
                            >
                                <i className={`bi bi-${showServerAddress ? 'eye-slash' : 'eye'}`}></i>
                            </button>

                            {showServerAddress && (
                                <span className="ml-2 text-xs text-gray-400 select-all">{serverAddress}</span>
                            )}
                        </div>
                    </div>

                    {/* Aktif Sembol */}
                    <div className="flex items-center gap-3 border-l border-gray-700/30 pl-4">
                        <i className="bi bi-graph-up text-gray-400"></i>
                        <span className="text-gray-400 text-sm font-medium">Aktif Sembol:</span>
                        <span className="text-blue-400 font-semibold">
                            {activeSymbolDisplay}
                        </span>
                    </div>

                    {/* İşlem İstatistikleri - Masa */}
                    <div className="hidden md:flex items-center gap-4 text-xs border-l border-gray-700/30 pl-4 ml-auto">
                        <div className="flex flex-col items-center">
                            <span className="text-gray-500">Mesaj/Sn</span>
                            <span className="text-emerald-400 font-medium">{formattedMPS}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-gray-500">Bağlantılar</span>
                            <span className="text-emerald-400 font-medium">{state.wsStats.connections}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-gray-500">Cache</span>
                            <span className="text-emerald-400 font-medium">{state.cacheStats.hitRate}</span>
                        </div>
                    </div>

                    {/* Kontrol butonları */}
                    <div className="flex gap-2 ml-auto md:ml-0">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowDetailedStatus(!showDetailedStatus)}
                            icon={<i className={`bi bi-chevron-${showDetailedStatus ? 'up' : 'down'}`}></i>}
                        >
                            {showDetailedStatus ? 'Detayları Gizle' : 'Detayları Göster'}
                        </Button>

                        <Button
                            variant={state.connection.debugMode ? "primary" : "outline"}
                            size="sm"
                            onClick={toggleDebugMode}
                            icon={<i className="bi bi-bug"></i>}
                        >
                            Debug {state.connection.debugMode ? '(Açık)' : '(Kapalı)'}
                        </Button>
                    </div>
                </div>

                {/* Detaylı durum paneli - Açılır kapanır */}
                <div className={`bg-gray-800/50 border-t border-gray-700/50 overflow-hidden transition-all duration-300 ease-in-out ${showDetailedStatus ? 'max-h-64' : 'max-h-0'}`}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4">
                        {/* Sunucu Bilgileri */}
                        <div className="space-y-3">
                            <h3 className="text-xs uppercase tracking-wide text-gray-500 font-medium">Sunucu</h3>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="text-gray-400">CPU:</div>
                                <div className="text-emerald-400">{state.serverStats.cpuUsage}</div>

                                <div className="text-gray-400">Bellek:</div>
                                <div className="text-emerald-400">{state.serverStats.memoryUsage}</div>

                                <div className="text-gray-400">Çalışma:</div>
                                <div className="text-emerald-400">{state.serverStats.uptime}</div>
                            </div>
                        </div>

                        {/* WebSocket İstatistikleri */}
                        <div className="space-y-3">
                            <h3 className="text-xs uppercase tracking-wide text-gray-500 font-medium">WebSocket</h3>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="text-gray-400">Bağlantılar:</div>
                                <div className="text-emerald-400">{state.wsStats.connections}</div>

                                <div className="text-gray-400">Mesaj/Sn:</div>
                                <div className="text-emerald-400">{formattedMPS}</div>

                                <div className="text-gray-400">Toplam:</div>
                                <div className="text-emerald-400">{state.wsStats.totalMessages}</div>
                            </div>
                        </div>

                        {/* Önbellek İstatistikleri */}
                        <div className="space-y-3">
                            <h3 className="text-xs uppercase tracking-wide text-gray-500 font-medium">Önbellek</h3>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="text-gray-400">Boyut:</div>
                                <div className="text-emerald-400">{state.cacheStats.size}</div>

                                <div className="text-gray-400">İsabet:</div>
                                <div className="text-emerald-400">{state.cacheStats.hitRate}</div>

                                <div className="text-gray-400">Öğeler:</div>
                                <div className="text-emerald-400">{state.cacheStats.items}</div>
                            </div>
                        </div>

                        {/* İstek İstatistikleri */}
                        <div className="space-y-3">
                            <h3 className="text-xs uppercase tracking-wide text-gray-500 font-medium">İstekler</h3>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="text-gray-400">Toplam:</div>
                                <div className="text-emerald-400">{state.stats.totalRequests}</div>

                                <div className="text-gray-400">Başarılı:</div>
                                <div className="text-emerald-400">{state.stats.successfulRequests}</div>

                                <div className="text-gray-400">Hatalı:</div>
                                <div className="text-emerald-400">{state.stats.failedRequests}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatusBar; 