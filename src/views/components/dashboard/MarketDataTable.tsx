import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useMarketData } from '../../../viewmodels/hooks/useMarketData';

const MarketDataTable: React.FC = () => {
    const { data, clear } = useMarketData();

    const handleExport = () => {
        if (data.length === 0) return;

        const headers = ['Zaman', 'Fiyat', 'Hacim', 'Yüksek', 'Düşük', 'Açılış', 'Kapanış'];

        const csvRows = [
            headers.join(','),
            ...data.map(item => {
                const time = item.date ? new Date(item.date) : new Date(item.timestamp || 0);
                return [
                    time.toLocaleString(),
                    (item.price || item.close || 0).toFixed(2),
                    (item.volume || 0).toFixed(2),
                    (item.high || 0).toFixed(2),
                    (item.low || 0).toFixed(2),
                    (item.open || 0).toFixed(2),
                    (item.close || item.price || 0).toFixed(2)
                ].join(',');
            })
        ];

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `market_data_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Card
            title="Market Verileri"
            actions={
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clear}
                        icon={<i className="bi bi-trash"></i>}
                    >
                        Temizle
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        disabled={data.length === 0}
                        icon={<i className="bi bi-download"></i>}
                    >
                        Dışa Aktar
                    </Button>
                </div>
            }
            noPadding
        >
            <div className="overflow-x-auto">
                <table className="w-full text-gray-300">
                    <thead>
                        <tr className="bg-gray-900/30">
                            <th className="p-4 text-left text-emerald-500 font-semibold">Zaman</th>
                            <th className="p-4 text-left text-emerald-500 font-semibold">Fiyat</th>
                            <th className="p-4 text-left text-emerald-500 font-semibold">Hacim</th>
                            <th className="p-4 text-left text-emerald-500 font-semibold">Yüksek</th>
                            <th className="p-4 text-left text-emerald-500 font-semibold">Düşük</th>
                            <th className="p-4 text-left text-emerald-500 font-semibold">Açılış</th>
                            <th className="p-4 text-left text-emerald-500 font-semibold">Kapanış</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-4 text-center text-gray-500">
                                    Henüz veri yok. Bir sembole abone olun veya geçmiş verileri alın.
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => {
                                const time = item.date ? new Date(item.date) : new Date(item.timestamp || 0);
                                return (
                                    <tr key={index} className="border-t border-gray-700 hover:bg-gray-800">
                                        <td className="p-4">{time.toLocaleString()}</td>
                                        <td className="p-4">{(item.price || item.close || 0).toFixed(2)}</td>
                                        <td className="p-4">{(item.volume || 0).toFixed(2)}</td>
                                        <td className="p-4">{(item.high || 0).toFixed(2)}</td>
                                        <td className="p-4">{(item.low || 0).toFixed(2)}</td>
                                        <td className="p-4">{(item.open || 0).toFixed(2)}</td>
                                        <td className="p-4">{(item.close || item.price || 0).toFixed(2)}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default MarketDataTable; 