import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useMarketData } from '../../../viewmodels/hooks/useMarketData';

const ControlPanel: React.FC = () => {
    const [symbol, setSymbol] = useState('BINANCE:BTCUSDT');
    const [interval, setInterval] = useState('D');
    const { subscribe, unsubscribe, fetchHistorical, loading } = useMarketData();

    const handleSubscribe = () => {
        subscribe(symbol);
    };

    const handleUnsubscribe = () => {
        unsubscribe(symbol);
    };

    const handleGetHistorical = () => {
        fetchHistorical(symbol, interval);
    };

    return (
        <Card title="Kontrol Paneli">
            <div className="space-y-4">
                <div>
                    <label className="block text-gray-400 text-sm mb-2" htmlFor="symbol">
                        Sembol
                    </label>
                    <div className="flex gap-2">
                        <input
                            id="symbol"
                            type="text"
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
                            className="bg-gray-900/50 border border-gray-700 text-gray-300 rounded-lg p-2 w-full focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <Button
                            variant="primary"
                            onClick={handleSubscribe}
                            isLoading={loading}
                            icon={<i className="bi bi-play-fill"></i>}
                        >
                            Abone Ol
                        </Button>
                    </div>
                </div>

                <div>
                    <label className="block text-gray-400 text-sm mb-2" htmlFor="interval">
                        Aralık
                    </label>
                    <select
                        id="interval"
                        value={interval}
                        onChange={(e) => setInterval(e.target.value)}
                        className="bg-gray-900/50 border border-gray-700 text-gray-300 rounded-lg p-2 w-full focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <option value="1">1 dakika</option>
                        <option value="5">5 dakika</option>
                        <option value="15">15 dakika</option>
                        <option value="30">30 dakika</option>
                        <option value="60">1 saat</option>
                        <option value="240">4 saat</option>
                        <option value="D">1 gün</option>
                        <option value="W">1 hafta</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Button
                        variant="primary"
                        fullWidth
                        onClick={handleGetHistorical}
                        isLoading={loading}
                        icon={<i className="bi bi-clock-history"></i>}
                    >
                        Geçmiş Verileri Al
                    </Button>

                    <Button
                        variant="danger"
                        fullWidth
                        onClick={handleUnsubscribe}
                        icon={<i className="bi bi-stop-fill"></i>}
                    >
                        Aboneliği İptal Et
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default ControlPanel; 