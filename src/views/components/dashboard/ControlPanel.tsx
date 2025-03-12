import React, { useState } from 'react';
import Button from '../ui/Button';
import { useMarketData } from '../../../viewmodels/hooks/useMarketData';

// Önceden tanımlanmış popüler semboller
const PRESET_SYMBOLS = [
    { name: 'BTC/USDT', value: 'BINANCE:BTCUSDT' },
    { name: 'ETH/USDT', value: 'BINANCE:ETHUSDT' },
    { name: 'BNB/USDT', value: 'BINANCE:BNBUSDT' },
    { name: 'SOL/USDT', value: 'BINANCE:SOLUSDT' },
    { name: 'XRP/USDT', value: 'BINANCE:XRPUSDT' },
];

// Önceden tanımlanmış aralıklar için açıklamalar
const INTERVAL_DESCRIPTIONS: Record<string, string> = {
    '1': '1 dakika',
    '5': '5 dakika',
    '15': '15 dakika',
    '30': '30 dakika',
    '60': '1 saat',
    '240': '4 saat',
    'D': '1 gün',
    'W': '1 hafta'
};

const ControlPanel: React.FC = () => {
    const [symbol, setSymbol] = useState('BINANCE:BTCUSDT');
    const [interval, setInterval] = useState('D');
    const [activeSubscriptions, setActiveSubscriptions] = useState<string[]>([]);
    const { subscribe, unsubscribe, fetchHistorical, loading } = useMarketData();

    const handleSubscribe = () => {
        subscribe(symbol);
        if (!activeSubscriptions.includes(symbol)) {
            setActiveSubscriptions([...activeSubscriptions, symbol]);
        }
    };

    const handleUnsubscribe = (symbolToUnsubscribe = symbol) => {
        unsubscribe(symbolToUnsubscribe);
        setActiveSubscriptions(activeSubscriptions.filter(s => s !== symbolToUnsubscribe));
    };

    const handleGetHistorical = () => {
        fetchHistorical(symbol, interval);
    };

    const handlePresetSymbolClick = (presetSymbol: string) => {
        setSymbol(presetSymbol);
    };

    return (
        <div className="space-y-5">
            <div>
                <div className="mb-4">
                    <h3 className="text-sm text-gray-300 font-medium mb-2 flex items-center">
                        <i className="bi bi-bookmark-star mr-1.5 text-emerald-400"></i>
                        Hızlı Sembol Seçimi
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                        {PRESET_SYMBOLS.map((preset) => (
                            <button
                                key={preset.value}
                                onClick={() => handlePresetSymbolClick(preset.value)}
                                className={`text-xs px-2 py-1.5 rounded-md transition-all ${symbol === preset.value
                                    ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-600/30'
                                    : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/80 border border-gray-700/40'
                                    }`}
                                title={`${preset.name} sembolüne abone ol`}
                            >
                                <div className="flex items-center">
                                    <span className="mr-1">{preset.name}</span>
                                    {activeSubscriptions.includes(preset.value) && (
                                        <i className="bi bi-check-circle-fill text-emerald-500 text-xs"></i>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-400 text-sm mb-2 flex items-center" htmlFor="symbol">
                        <i className="bi bi-graph-up mr-1.5 text-emerald-400"></i>
                        Sembol
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                id="symbol"
                                type="text"
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value)}
                                className="bg-gray-900/50 border border-gray-700 text-gray-300 rounded-lg p-2 w-full focus:ring-emerald-500 focus:border-emerald-500 pr-8"
                                placeholder="Örn: BINANCE:BTCUSDT"
                            />
                            {symbol && (
                                <button
                                    onClick={() => setSymbol('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                    title="Temizle"
                                >
                                    <i className="bi bi-x"></i>
                                </button>
                            )}
                        </div>
                        <Button
                            variant="primary"
                            onClick={handleSubscribe}
                            isLoading={loading}
                            icon={<i className="bi bi-play-fill"></i>}
                            title="Seçili sembole abone ol"
                        >
                            Abone Ol
                        </Button>
                    </div>
                </div>

                <div className="mb-4 pb-4 border-b border-gray-700/30">
                    <label className="block text-gray-400 text-sm mb-2 flex items-center" htmlFor="interval">
                        <i className="bi bi-clock mr-1.5 text-emerald-400"></i>
                        Aralık
                    </label>
                    <select
                        id="interval"
                        value={interval}
                        onChange={(e) => setInterval(e.target.value)}
                        className="bg-gray-900/50 border border-gray-700 text-gray-300 rounded-lg p-2 w-full focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        {Object.entries(INTERVAL_DESCRIPTIONS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-3">
                    <Button
                        variant="primary"
                        fullWidth
                        onClick={handleGetHistorical}
                        isLoading={loading}
                        icon={<i className="bi bi-clock-history"></i>}
                        title="Seçili sembol ve aralık için geçmiş verileri getir"
                    >
                        Geçmiş Verileri Al
                    </Button>
                </div>
            </div>

            {/* Aktif Abonelikler Bölümü */}
            {activeSubscriptions.length > 0 && (
                <div className="pt-3 border-t border-gray-700/30">
                    <h3 className="text-sm text-gray-300 font-medium mb-2 flex items-center">
                        <i className="bi bi-broadcast mr-1.5 text-emerald-400"></i>
                        Aktif Abonelikler
                    </h3>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {activeSubscriptions.map((sub) => (
                            <div key={sub} className="flex items-center justify-between bg-gray-800/60 rounded-lg px-3 py-1.5 text-xs">
                                <div className="flex items-center">
                                    <i className="bi bi-dot text-emerald-500 text-xl animate-pulse"></i>
                                    <span className="ml-1 text-gray-300">{sub.replace('BINANCE:', '')}</span>
                                </div>
                                <button
                                    onClick={() => handleUnsubscribe(sub)}
                                    className="text-gray-500 hover:text-red-400 transition-colors"
                                    title="Aboneliği iptal et"
                                >
                                    <i className="bi bi-x-circle"></i>
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setActiveSubscriptions([])}
                        className="mt-2 text-xs text-red-400 hover:text-red-300 flex items-center transition-colors"
                        title="Tüm abonelikleri iptal et"
                        disabled={loading}
                    >
                        <i className="bi bi-trash mr-1"></i>
                        Tüm Abonelikleri İptal Et
                    </button>
                </div>
            )}
        </div>
    );
};

export default ControlPanel; 