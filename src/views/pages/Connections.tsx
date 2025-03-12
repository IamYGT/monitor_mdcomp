import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ClientConnection } from '../../models/interfaces/MarketData';
import { useAppContext } from '../../viewmodels/contexts/AppContext';

// Bağlantı Listesi Tablosu Bileşeni
const ConnectionsList: React.FC<{
    connections: ClientConnection[],
    onCloseConnection: (id: string) => void
}> = ({ connections, onCloseConnection }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-gray-300">
                <thead>
                    <tr className="bg-gray-900/30">
                        <th className="p-4 text-left text-emerald-500 font-semibold">ID</th>
                        <th className="p-4 text-left text-emerald-500 font-semibold">IP Adresi</th>
                        <th className="p-4 text-left text-emerald-500 font-semibold">Bağlantı Zamanı</th>
                        <th className="p-4 text-left text-emerald-500 font-semibold">Semboller</th>
                        <th className="p-4 text-left text-emerald-500 font-semibold">İşlemler</th>
                    </tr>
                </thead>
                <tbody>
                    {connections.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="p-4 text-center text-gray-500">
                                Aktif bağlantı bulunamadı.
                            </td>
                        </tr>
                    ) : (
                        connections.map((conn) => (
                            <tr key={conn.id} className="border-t border-gray-700 hover:bg-gray-800">
                                <td className="p-4 font-mono text-sm">{conn.id.substring(0, 8)}...</td>
                                <td className="p-4">{conn.ipAddress}</td>
                                <td className="p-4">{new Date(conn.connectedAt).toLocaleString()}</td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1">
                                        {conn.subscribedSymbols.map(symbol => (
                                            <span key={symbol} className="bg-emerald-500/10 text-emerald-500 text-xs py-1 px-2 rounded-md">
                                                {symbol}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => onCloseConnection(conn.id)}
                                    >
                                        Kapat
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

// Bağlantılar Sayfası Ana Bileşeni
const Connections: React.FC = () => {
    const [filter, setFilter] = useState('');
    const { state, addLog } = useAppContext();

    // Örnek bağlantılar (normal durumda context'ten alınacak)
    const demoConnections: ClientConnection[] = [
        {
            id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
            ipAddress: "192.168.1.101",
            connectedAt: "2023-10-15T08:30:45Z",
            subscribedSymbols: ["BINANCE:BTCUSDT", "BINANCE:ETHUSDT"]
        },
        {
            id: "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
            ipAddress: "192.168.1.102",
            connectedAt: "2023-10-15T09:15:20Z",
            subscribedSymbols: ["BINANCE:SOLUSDT"]
        },
        {
            id: "9876fedc-ba98-7654-3210-abcdef123456",
            ipAddress: "192.168.1.103",
            connectedAt: "2023-10-15T10:05:12Z",
            subscribedSymbols: ["COINBASE:BTCUSD", "KRAKEN:ETHUSD", "BINANCE:BNBUSDT"]
        }
    ];

    // Gerçek bağlantı verileri veya örnek veriler
    const connections = state.clients.length > 0 ? state.clients : demoConnections;

    // Bağlantı kapatma işlevi
    const handleCloseConnection = (id: string) => {
        console.log('Bağlantı kapatılıyor:', id);
        // Gerçek bir API çağrısı yapılabilir veya context üzerinden işlem yapılabilir
        addLog(`Bağlantı kapatıldı: ${id}`, 'warning');
    };

    // Filtreleme fonksiyonu
    const filteredConnections = connections.filter(conn =>
        conn.id.includes(filter) ||
        conn.ipAddress.includes(filter) ||
        conn.subscribedSymbols.some(s => s.includes(filter))
    );

    // İlerleme çubuğu genişliğini belirle
    const renderProgressBar = () => {
        // Bağlantı sayısına göre koşullu sınıf
        if (connections.length === 0) return <div className="h-2"></div>;
        if (connections.length <= 5) return <div className="h-2 bg-emerald-500 rounded-full w-4 transition-all duration-300"></div>;
        if (connections.length <= 10) return <div className="h-2 bg-emerald-500 rounded-full w-8 transition-all duration-300"></div>;
        if (connections.length <= 20) return <div className="h-2 bg-emerald-500 rounded-full w-16 transition-all duration-300"></div>;
        if (connections.length <= 30) return <div className="h-2 bg-emerald-500 rounded-full w-24 transition-all duration-300"></div>;
        if (connections.length <= 40) return <div className="h-2 bg-emerald-500 rounded-full w-32 transition-all duration-300"></div>;
        if (connections.length <= 50) return <div className="h-2 bg-emerald-500 rounded-full w-40 transition-all duration-300"></div>;
        if (connections.length <= 60) return <div className="h-2 bg-emerald-500 rounded-full w-48 transition-all duration-300"></div>;
        if (connections.length <= 70) return <div className="h-2 bg-emerald-500 rounded-full w-56 transition-all duration-300"></div>;
        if (connections.length <= 80) return <div className="h-2 bg-emerald-500 rounded-full w-64 transition-all duration-300"></div>;
        if (connections.length <= 90) return <div className="h-2 bg-emerald-500 rounded-full w-72 transition-all duration-300"></div>;
        return <div className="h-2 bg-emerald-500 rounded-full w-full transition-all duration-300"></div>;
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-emerald-500 mb-2">Aktif Bağlantılar</h1>
                <p className="text-gray-400">
                    Tüm aktif WebSocket bağlantılarını görüntüleyin ve yönetin.
                </p>
            </div>

            <Card>
                <div className="mb-6">
                    <div className="flex gap-4 items-center">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="ID, IP adresi veya sembol ile filtrele..."
                                className="bg-gray-900/50 border border-gray-700 text-gray-300 rounded-lg p-2 w-full focus:ring-emerald-500 focus:border-emerald-500"
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                            />
                        </div>
                        <div>
                            <Button
                                variant="secondary"
                                onClick={() => setFilter('')}
                                icon={<i className="bi bi-x-circle"></i>}
                            >
                                Temizle
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="bg-emerald-500/10 text-emerald-500 p-4 rounded-lg mb-6 flex items-center">
                    <i className="bi bi-info-circle mr-2"></i>
                    <span>
                        Toplam {connections.length} aktif bağlantı, {connections.reduce((total, conn) => total + conn.subscribedSymbols.length, 0)} abone olunan sembol bulunuyor.
                    </span>
                </div>

                <ConnectionsList
                    connections={filteredConnections}
                    onCloseConnection={handleCloseConnection}
                />
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card title="Bağlantı Limitleri">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Maksimum Bağlantı:</span>
                            <span className="text-emerald-500 font-semibold">100</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Mevcut Bağlantı:</span>
                            <span className="text-emerald-500 font-semibold">{connections.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Bağlantı Başına Abone Olunabilecek Sembol:</span>
                            <span className="text-emerald-500 font-semibold">20</span>
                        </div>

                        {/* Sabit genişlikli ilerleme çubuğu - dinamik CSS değerleri yok */}
                        <div className="h-2 bg-gray-700 rounded-full mt-2">
                            {renderProgressBar()}
                        </div>
                    </div>
                </Card>

                <Card title="IP Kısıtlamaları">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="restrictedIp" className="block text-gray-400 text-sm mb-2">IP Kısıtla</label>
                            <div className="flex gap-2">
                                <input
                                    id="restrictedIp"
                                    type="text"
                                    placeholder="192.168.1.100"
                                    className="bg-gray-900/50 border border-gray-700 text-gray-300 rounded-lg p-2 flex-1 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                <Button
                                    variant="primary"
                                    icon={<i className="bi bi-plus"></i>}
                                >
                                    Ekle
                                </Button>
                            </div>
                        </div>

                        <div className="bg-gray-900/50 p-4 rounded-lg">
                            <div className="text-gray-400 text-sm mb-2">Kısıtlanan IP'ler</div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <div className="bg-red-500/10 text-red-500 border border-red-500 rounded-md py-1 px-2 text-sm flex items-center">
                                    10.0.0.5
                                    <button
                                        className="ml-2 text-red-400 hover:text-red-300"
                                        title="10.0.0.5 IP adresini kaldır"
                                        aria-label="10.0.0.5 IP adresini kaldır"
                                    >
                                        <i className="bi bi-x"></i>
                                    </button>
                                </div>
                                <div className="bg-red-500/10 text-red-500 border border-red-500 rounded-md py-1 px-2 text-sm flex items-center">
                                    172.16.0.100
                                    <button
                                        className="ml-2 text-red-400 hover:text-red-300"
                                        title="172.16.0.100 IP adresini kaldır"
                                        aria-label="172.16.0.100 IP adresini kaldır"
                                    >
                                        <i className="bi bi-x"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Connections; 