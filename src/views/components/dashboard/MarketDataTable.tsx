import React, { useState, useEffect, useMemo } from 'react';
import Button from '../ui/Button';
import { useMarketData } from '../../../viewmodels/hooks/useMarketData';

const MarketDataTable: React.FC = () => {
    const { data, clear } = useMarketData();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState<string>('timestamp');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedView, setExpandedView] = useState(false);

    // Sayfa değiştiğinde üste scroll
    useEffect(() => {
        const tableTop = document.getElementById('market-table-top');
        if (tableTop) {
            tableTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [currentPage]);

    // Filtreleme fonksiyonu
    const filteredData = useMemo(() => {
        return data.filter(item => {
            const searchTermLower = searchTerm.toLowerCase();
            const time = item.date ? new Date(item.date) : new Date(item.timestamp || 0);
            const timeString = time.toLocaleString().toLowerCase();

            return timeString.includes(searchTermLower) ||
                (item.price || 0).toString().includes(searchTerm) ||
                (item.volume || 0).toString().includes(searchTerm);
        });
    }, [data, searchTerm]);

    // Sıralama fonksiyonu
    const sortedData = useMemo(() => {
        const sorted = [...filteredData].sort((a, b) => {
            let aValue, bValue;

            switch (sortField) {
                case 'timestamp':
                    aValue = a.timestamp || a.date || 0;
                    bValue = b.timestamp || b.date || 0;
                    break;
                case 'price':
                    aValue = a.price || a.close || 0;
                    bValue = b.price || b.close || 0;
                    break;
                case 'volume':
                    aValue = a.volume || 0;
                    bValue = b.volume || 0;
                    break;
                case 'high':
                    aValue = a.high || 0;
                    bValue = b.high || 0;
                    break;
                case 'low':
                    aValue = a.low || 0;
                    bValue = b.low || 0;
                    break;
                default:
                    aValue = a.timestamp || 0;
                    bValue = b.timestamp || 0;
            }

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return sorted;
    }, [filteredData, sortField, sortDirection]);

    // Sayfalama için veri dilimi
    const currentItems = useMemo(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return sortedData.slice(indexOfFirstItem, indexOfLastItem);
    }, [sortedData, currentPage, itemsPerPage]);

    // Toplam sayfa sayısı
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);

    // Sıralama değiştirme fonksiyonu
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    // Sayfa değiştirme fonksiyonları
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

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
        <div className="rounded-xl overflow-hidden shadow-lg border border-gray-700/30" id="market-table-top">
            {/* Tablo Başlık ve Kontrol Alanı */}
            <div className="bg-gray-800 p-4 border-b border-gray-700/30 flex flex-wrap gap-2 justify-between items-center">
                <div className="flex items-center">
                    <i className="bi bi-table text-emerald-400 mr-2 text-lg"></i>
                    <h2 className="text-gray-100 font-semibold">Market Verileri</h2>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    {/* Arama Alanı */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-gray-900 border border-gray-700 text-white text-xs rounded py-1.5 pl-8 pr-3 w-48 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <i className="bi bi-search text-xs"></i>
                        </div>
                    </div>

                    {/* Sayfa Başına Öğe Seçici */}
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1); // Sayfa başına öğe değiştiğinde ilk sayfaya dön
                        }}
                        className="bg-gray-900 border border-gray-700 text-white text-xs rounded px-2 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        aria-label="Sayfa başına gösterilecek satır sayısı"
                    >
                        <option value={5}>5 Satır</option>
                        <option value={10}>10 Satır</option>
                        <option value={20}>20 Satır</option>
                        <option value={50}>50 Satır</option>
                    </select>

                    {/* Genişletilmiş/Daraltılmış Görünüm Düğmesi */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedView(!expandedView)}
                        icon={<i className={`bi bi-arrows-${expandedView ? 'angle-contract' : 'angle-expand'}`}></i>}
                    >
                        {expandedView ? 'Daralt' : 'Genişlet'}
                    </Button>

                    {/* Temizle ve Dışa Aktar Düğmeleri */}
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
            </div>

            {/* Veri Tablosu */}
            <div className={`overflow-x-auto ${expandedView ? 'h-[70vh]' : 'h-[400px]'}`}>
                <table className="w-full text-gray-300">
                    <thead className="sticky top-0 bg-gray-900/90 backdrop-blur-sm z-10">
                        <tr className="text-xs">
                            <th
                                className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-800/30"
                                onClick={() => handleSort('timestamp')}
                            >
                                <div className="flex items-center">
                                    Zaman
                                    {sortField === 'timestamp' && (
                                        <i className={`bi bi-caret-${sortDirection === 'asc' ? 'up' : 'down'}-fill ml-1 text-emerald-400`}></i>
                                    )}
                                </div>
                            </th>
                            <th
                                className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-800/30"
                                onClick={() => handleSort('price')}
                            >
                                <div className="flex items-center">
                                    Fiyat
                                    {sortField === 'price' && (
                                        <i className={`bi bi-caret-${sortDirection === 'asc' ? 'up' : 'down'}-fill ml-1 text-emerald-400`}></i>
                                    )}
                                </div>
                            </th>
                            <th
                                className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-800/30"
                                onClick={() => handleSort('volume')}
                            >
                                <div className="flex items-center">
                                    Hacim
                                    {sortField === 'volume' && (
                                        <i className={`bi bi-caret-${sortDirection === 'asc' ? 'up' : 'down'}-fill ml-1 text-emerald-400`}></i>
                                    )}
                                </div>
                            </th>
                            <th
                                className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-800/30"
                                onClick={() => handleSort('high')}
                            >
                                <div className="flex items-center">
                                    Yüksek
                                    {sortField === 'high' && (
                                        <i className={`bi bi-caret-${sortDirection === 'asc' ? 'up' : 'down'}-fill ml-1 text-emerald-400`}></i>
                                    )}
                                </div>
                            </th>
                            <th
                                className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-800/30"
                                onClick={() => handleSort('low')}
                            >
                                <div className="flex items-center">
                                    Düşük
                                    {sortField === 'low' && (
                                        <i className={`bi bi-caret-${sortDirection === 'asc' ? 'up' : 'down'}-fill ml-1 text-emerald-400`}></i>
                                    )}
                                </div>
                            </th>
                            <th className="p-3 text-left font-semibold">Açılış</th>
                            <th className="p-3 text-left font-semibold">Kapanış</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-4 text-center text-gray-500">
                                    {filteredData.length === 0
                                        ? (data.length === 0
                                            ? 'Henüz veri yok. Bir sembole abone olun veya geçmiş verileri alın.'
                                            : 'Arama kriterlerine uygun sonuç bulunamadı.')
                                        : 'Bu sayfada gösterilecek veri yok.'}
                                </td>
                            </tr>
                        ) : (
                            currentItems.map((item, index) => {
                                const time = item.date ? new Date(item.date) : new Date(item.timestamp || 0);
                                return (
                                    <tr key={index} className="border-t border-gray-700/50 hover:bg-gray-800/40 text-sm">
                                        <td className="p-3">{time.toLocaleString()}</td>
                                        <td className="p-3">{(item.price || item.close || 0).toFixed(2)}</td>
                                        <td className="p-3">{(item.volume || 0).toFixed(2)}</td>
                                        <td className="p-3">{(item.high || 0).toFixed(2)}</td>
                                        <td className="p-3">{(item.low || 0).toFixed(2)}</td>
                                        <td className="p-3">{(item.open || 0).toFixed(2)}</td>
                                        <td className="p-3">{(item.close || item.price || 0).toFixed(2)}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Sayfalama Kontrolleri */}
            {filteredData.length > 0 && (
                <div className="bg-gray-800 p-3 border-t border-gray-700/30 flex flex-wrap justify-between items-center text-sm">
                    <div className="text-gray-400 text-xs">
                        Toplam {filteredData.length} kayıttan {itemsPerPage * (currentPage - 1) + 1}-
                        {Math.min(itemsPerPage * currentPage, filteredData.length)} arası gösteriliyor
                    </div>

                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => goToPage(1)}
                            disabled={currentPage === 1}
                            className={`p-1.5 rounded ${currentPage === 1 ? 'text-gray-500' : 'text-gray-300 hover:bg-gray-700'}`}
                            title="İlk Sayfa"
                        >
                            <i className="bi bi-chevron-double-left"></i>
                        </button>
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-1.5 rounded ${currentPage === 1 ? 'text-gray-500' : 'text-gray-300 hover:bg-gray-700'}`}
                            title="Önceki Sayfa"
                        >
                            <i className="bi bi-chevron-left"></i>
                        </button>

                        {/* Sayfa Numaraları */}
                        <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    // 5 veya daha az sayfa varsa, tüm sayfaları göster
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    // Başlangıç sayfalarındayken, ilk 5 sayfayı göster
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    // Son sayfalardayken, son 5 sayfayı göster
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    // Ortadayken, mevcut sayfa merkez olacak şekilde göster
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => goToPage(pageNum)}
                                        className={`w-7 h-7 text-xs flex items-center justify-center rounded ${currentPage === pageNum
                                            ? 'bg-emerald-600 text-white'
                                            : 'text-gray-300 hover:bg-gray-700'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`p-1.5 rounded ${currentPage === totalPages || totalPages === 0 ? 'text-gray-500' : 'text-gray-300 hover:bg-gray-700'}`}
                            title="Sonraki Sayfa"
                        >
                            <i className="bi bi-chevron-right"></i>
                        </button>
                        <button
                            onClick={() => goToPage(totalPages)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`p-1.5 rounded ${currentPage === totalPages || totalPages === 0 ? 'text-gray-500' : 'text-gray-300 hover:bg-gray-700'}`}
                            title="Son Sayfa"
                        >
                            <i className="bi bi-chevron-double-right"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketDataTable; 