import React, { useState } from 'react';
import Card from '../components/ui/Card';
import { MarketSymbol } from '../../models/interfaces/MarketData';

const MarketData: React.FC = () => {
    const [exchange, setExchange] = useState('BINANCE');
    const [marketType, setMarketType] = useState('spot');

    // Örnek veriler
    const marketSymbols: MarketSymbol[] = [
        { symbol: 'BTCUSDT', lastPrice: 60123.45, priceChange24h: 2.5, volume24h: 12345670, marketCap: 1150000000000 },
        { symbol: 'ETHUSDT', lastPrice: 3245.67, priceChange24h: 1.8, volume24h: 5678900, marketCap: 380000000000 },
        { symbol: 'SOLUSDT', lastPrice: 128.90, priceChange24h: 4.2, volume24h: 2345670, marketCap: 55000000000 },
        { symbol: 'BNBUSDT', lastPrice: 560.23, priceChange24h: -0.8, volume24h: 1234560, marketCap: 85000000000 },
        { symbol: 'XRPUSDT', lastPrice: 0.5423, priceChange24h: -1.5, volume24h: 9876540, marketCap: 28000000000 },
        { symbol: 'DOGEUSDT', lastPrice: 0.1234, priceChange24h: 12.3, volume24h: 8765430, marketCap: 16000000000 },
        { symbol: 'ADAUSDT', lastPrice: 0.4567, priceChange24h: -2.7, volume24h: 4321098, marketCap: 15000000000 },
        { symbol: 'AVAXUSDT', lastPrice: 34.56, priceChange24h: 5.6, volume24h: 3456789, marketCap: 12000000000 }
    ];

    // Fiyat değişiminin rengini belirleme
    const getPriceChangeClass = (change: number) => {
        return change >= 0
            ? 'bg-green-500/10 text-green-500 border border-green-500'
            : 'bg-red-500/10 text-red-500 border border-red-500';
    };

    // Biçimlendirme fonksiyonları
    const formatPrice = (price: number) => {
        return price < 1 ? price.toFixed(4) : price.toFixed(2);
    };

    const formatVolume = (volume: number) => {
        if (volume >= 1e9) return (volume / 1e9).toFixed(2) + ' Milyar';
        if (volume >= 1e6) return (volume / 1e6).toFixed(2) + ' Milyon';
        return volume.toLocaleString();
    };

    const formatMarketCap = (marketCap: number) => {
        if (marketCap >= 1e12) return (marketCap / 1e12).toFixed(2) + ' Trilyon';
        if (marketCap >= 1e9) return (marketCap / 1e9).toFixed(2) + ' Milyar';
        if (marketCap >= 1e6) return (marketCap / 1e6).toFixed(2) + ' Milyon';
        return marketCap.toLocaleString();
    };

    return (
        <Card title="Gelişmiş Market Verileri">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label htmlFor="exchange" className="block text-gray-400 text-sm mb-2">Borsa</label>
                    <select
                        id="exchange"
                        aria-label="Borsa seçimi"
                        value={exchange}
                        onChange={(e) => setExchange(e.target.value)}
                        className="bg-gray-900/50 border border-gray-700 text-gray-300 rounded-lg p-2 w-full focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <option value="BINANCE">Binance</option>
                        <option value="COINBASE">Coinbase</option>
                        <option value="KRAKEN">Kraken</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="marketType" className="block text-gray-400 text-sm mb-2">Market Tipi</label>
                    <select
                        id="marketType"
                        aria-label="Market tipi seçimi"
                        value={marketType}
                        onChange={(e) => setMarketType(e.target.value)}
                        className="bg-gray-900/50 border border-gray-700 text-gray-300 rounded-lg p-2 w-full focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <option value="spot">Spot</option>
                        <option value="futures">Vadeli</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-gray-300">
                    <thead>
                        <tr className="bg-gray-900/30">
                            <th className="p-4 text-left text-emerald-500 font-semibold">Sembol</th>
                            <th className="p-4 text-left text-emerald-500 font-semibold">Son Fiyat</th>
                            <th className="p-4 text-left text-emerald-500 font-semibold">24s Değişim</th>
                            <th className="p-4 text-left text-emerald-500 font-semibold">24s Hacim</th>
                            <th className="p-4 text-left text-emerald-500 font-semibold">Piyasa Değeri</th>
                        </tr>
                    </thead>
                    <tbody>
                        {marketSymbols.map((item) => (
                            <tr key={item.symbol} className="border-t border-gray-700 hover:bg-gray-800">
                                <td className="p-4 font-medium">{exchange}:{item.symbol}</td>
                                <td className="p-4">${formatPrice(item.lastPrice)}</td>
                                <td className="p-4">
                                    <span className={`inline-block py-1 px-2 rounded-md text-xs ${getPriceChangeClass(item.priceChange24h)}`}>
                                        {item.priceChange24h > 0 ? '+' : ''}{item.priceChange24h}%
                                    </span>
                                </td>
                                <td className="p-4">${formatVolume(item.volume24h)}</td>
                                <td className="p-4">${formatMarketCap(item.marketCap || 0)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default MarketData; 