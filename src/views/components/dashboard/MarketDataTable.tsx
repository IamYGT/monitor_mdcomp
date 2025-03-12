import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
    const [selectedRow, setSelectedRow] = useState<number | null>(null);

    // Kullanıcı tercihlerini kaydetmek için yerel depolama
    const [visibleColumns, setVisibleColumns] = useState<{ [key: string]: boolean }>({
        timestamp: true,
        symbol: true,
        price: true,
        volume: true,
        high: true,
        low: true,
        open: true,
        close: true
    });

    // Sütunları tanımlama
    const columns = [
        {
            id: 'timestamp', label: 'Zaman', sortable: true, customRender: (item: any) => {
                const time = item.date ? new Date(item.date) : new Date(item.timestamp || 0);
                return time.toLocaleTimeString();
            }
        },
        {
            id: 'symbol', label: 'Sembol', sortable: true, customRender: (item: any) =>
                item.symbol ? item.symbol.replace('BINANCE:', '') : '-'
        },
        {
            id: 'price', label: 'Fiyat', sortable: true, customRender: (item: any) => {
                const price = item.price || item.close || 0;
                return `$${parseFloat(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
        },
        {
            id: 'volume', label: 'Hacim', sortable: true, customRender: (item: any) => {
                return item.volume ? item.volume.toLocaleString() : '-';
            }
        },
        {
            id: 'high', label: 'Yüksek', sortable: true, customRender: (item: any) => {
                return item.high ? `$${parseFloat(item.high).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-';
            }
        },
        {
            id: 'low', label: 'Düşük', sortable: true, customRender: (item: any) => {
                return item.low ? `$${parseFloat(item.low).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-';
            }
        },
        {
            id: 'open', label: 'Açılış', sortable: false, customRender: (item: any) => {
                return item.open ? `$${parseFloat(item.open).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-';
            }
        },
        {
            id: 'close', label: 'Kapanış', sortable: false, customRender: (item: any) => {
                return item.close ? `$${parseFloat(item.close).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-';
            }
        }
    ];

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
            if (!searchTerm.trim()) return true;

            const searchTermLower = searchTerm.toLowerCase();
            const time = item.date ? new Date(item.date) : new Date(item.timestamp || 0);
            const timeString = time.toLocaleString().toLowerCase();
            const symbolString = (item.symbol || '').toLowerCase();

            return timeString.includes(searchTermLower) ||
                symbolString.includes(searchTermLower) ||
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
                case 'symbol':
                    aValue = a.symbol || '';
                    bValue = b.symbol || '';
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
                case 'open':
                    aValue = a.open || 0;
                    bValue = b.open || 0;
                    break;
                case 'close':
                    aValue = a.close || 0;
                    bValue = b.close || 0;
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
    const handleSort = useCallback((field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    }, [sortField, sortDirection]);

    // Sayfa değiştirme fonksiyonları
    const goToPage = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [totalPages]);

    // Görünür sütunları toggle fonksiyonu
    const toggleColumnVisibility = useCallback((columnId: string) => {
        setVisibleColumns(prev => ({
            ...prev,
            [columnId]: !prev[columnId]
        }));
    }, []);

    // Sütun görünürlük durumu
    const visibleColumnsCount = Object.values(visibleColumns).filter(Boolean).length;

    return (
        <div id="market-table-top" className="p-2 overflow-x-auto">
            {/* Kontrol Paneli */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                    {/* Arama Alanı */}
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                            placeholder="Ara..."
                            className="w-48 md:w-64 px-3 py-2 pr-8 text-sm bg-gray-800/80 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        {searchTerm && (
                            <button
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                onClick={() => setSearchTerm('')}
                                title="Aramayı temizle"
                            >
                                <i className="bi bi-x"></i>
                            </button>
                        )}
                        {!searchTerm && (
                            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                                <i className="bi bi-search"></i>
                            </span>
                        )}
                    </div>

                    {/* Sayfa Boyutu Seçici */}
                    <div className="flex items-center bg-gray-800/80 border border-gray-700 rounded-lg overflow-hidden">
                        <span className="text-gray-400 text-xs px-2">Sayfa Boyutu:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1); // Reset to first page on change
                            }}
                            className="bg-transparent text-gray-300 text-sm border-l border-gray-700 px-2 py-1.5 focus:outline-none"
                            aria-label="Sayfa başına gösterilecek öğe sayısı"
                            title="Sayfa boyutunu seçin"
                        >
                            <option value={5} className="bg-gray-800">5</option>
                            <option value={10} className="bg-gray-800">10</option>
                            <option value={25} className="bg-gray-800">25</option>
                            <option value={50} className="bg-gray-800">50</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-2">
                    {/* Sütun Görünürlük Menüsü */}
                    <div className="relative group z-10">
                        <button className="px-3 py-1.5 bg-gray-800/80 text-sm text-gray-300 rounded-lg border border-gray-700 hover:bg-gray-700 flex items-center">
                            <i className="bi bi-layout-three-columns mr-1"></i>
                            <span className="hidden sm:inline">Sütunlar</span>
                            <i className="bi bi-caret-down-fill ml-1 text-gray-500 text-xs"></i>
                        </button>

                        <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg w-48 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                            <h4 className="text-xs text-gray-400 mb-2 pb-1 border-b border-gray-700">Görünür Sütunlar</h4>
                            <div className="space-y-1">
                                {columns.map(column => (
                                    <label key={column.id} className="flex items-center p-1.5 hover:bg-gray-700/50 rounded text-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={visibleColumns[column.id] || false}
                                            onChange={() => toggleColumnVisibility(column.id)}
                                            className="mr-2 accent-emerald-500"
                                            disabled={visibleColumns[column.id] && visibleColumnsCount <= 2}
                                        />
                                        {column.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Genişlet/Daralt Düğmesi */}
                    <button
                        onClick={() => setExpandedView(!expandedView)}
                        className="px-3 py-1.5 bg-gray-800/80 text-sm text-gray-300 rounded-lg border border-gray-700 hover:bg-gray-700 flex items-center"
                        title={expandedView ? "Normal görünüme geç" : "Genişletilmiş görünüme geç"}
                    >
                        <i className={`bi bi-${expandedView ? 'fullscreen-exit' : 'fullscreen'} mr-1`}></i>
                        <span className="hidden sm:inline">{expandedView ? "Daralt" : "Genişlet"}</span>
                    </button>

                    {/* Verileri Temizle Düğmesi */}
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={clear}
                        icon={<i className="bi bi-trash"></i>}
                        iconPosition="left"
                    >
                        <span className="hidden sm:inline">Temizle</span>
                    </Button>
                </div>
            </div>

            {/* Veri Tablosu */}
            <div className={`border border-gray-700/50 rounded-lg overflow-hidden shadow-lg ${expandedView ? 'h-[70vh]' : 'max-h-[50vh]'}`}>
                <div className="overflow-auto h-full">
                    <table className="w-full bg-gray-800/30">
                        <thead className="sticky top-0 bg-gray-900/90 backdrop-blur-sm z-10">
                            <tr className="border-b border-gray-700">
                                {columns.map(column => {
                                    // Sütun görünür değilse render etme
                                    if (!visibleColumns[column.id]) return null;

                                    return (
                                        <th key={column.id} className="px-4 py-3 text-left text-xs font-medium text-gray-300 tracking-wider whitespace-nowrap">
                                            {column.sortable ? (
                                                <button
                                                    className="flex items-center gap-1 hover:text-emerald-400 transition-colors focus:outline-none"
                                                    onClick={() => handleSort(column.id)}
                                                >
                                                    {column.label}
                                                    {sortField === column.id ? (
                                                        <i className={`bi bi-sort-${sortDirection === 'asc' ? 'up' : 'down'} text-emerald-400`}></i>
                                                    ) : (
                                                        <i className="bi bi-arrow-down-up text-gray-500 opacity-60"></i>
                                                    )}
                                                </button>
                                            ) : (
                                                <span>{column.label}</span>
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {currentItems.length > 0 ? (
                                currentItems.map((item, index) => (
                                    <tr
                                        key={index}
                                        className={`
                                            ${index % 2 === 0 ? 'bg-gray-800/20' : 'bg-gray-800/10'}
                                            ${selectedRow === index ? 'bg-emerald-900/20 border-l-2 border-emerald-500' : ''}
                                            hover:bg-gray-700/30 cursor-pointer transition-colors
                                        `}
                                        onClick={() => setSelectedRow(selectedRow === index ? null : index)}
                                    >
                                        {columns.map(column => {
                                            // Sütun görünür değilse render etme
                                            if (!visibleColumns[column.id]) return null;

                                            return (
                                                <td key={column.id} className="px-4 py-2.5 text-sm text-gray-300 whitespace-nowrap">
                                                    {column.customRender(item)}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={visibleColumnsCount} className="px-4 py-8 text-center text-gray-400">
                                        {searchTerm ? (
                                            <div>
                                                <i className="bi bi-search text-2xl block mb-2"></i>
                                                Arama kriterlerine uygun veri bulunamadı
                                            </div>
                                        ) : (
                                            <div>
                                                <i className="bi bi-bar-chart-line text-2xl block mb-2"></i>
                                                Henüz veri yok
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sayfalama ve Durum Bilgisi */}
            <div className="flex flex-wrap gap-3 justify-between items-center mt-3 text-sm">
                <div className="text-gray-400">
                    Toplam <span className="text-gray-200">{filteredData.length}</span> veri noktası
                    {searchTerm && (
                        <>, <span className="text-emerald-400">{filteredData.length}</span> eşleşme</>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => goToPage(1)}
                            disabled={currentPage === 1}
                            className="px-2 py-1 bg-gray-800 rounded border border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="İlk Sayfa"
                        >
                            <i className="bi bi-chevron-double-left"></i>
                        </button>
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-2 py-1 bg-gray-800 rounded border border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Önceki Sayfa"
                        >
                            <i className="bi bi-chevron-left"></i>
                        </button>

                        <div className="px-3 py-1 text-center">
                            <span className="text-emerald-400">{currentPage}</span>
                            <span className="text-gray-500 mx-1">/</span>
                            <span className="text-gray-300">{totalPages}</span>
                        </div>

                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-2 py-1 bg-gray-800 rounded border border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Sonraki Sayfa"
                        >
                            <i className="bi bi-chevron-right"></i>
                        </button>
                        <button
                            onClick={() => goToPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-2 py-1 bg-gray-800 rounded border border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Son Sayfa"
                        >
                            <i className="bi bi-chevron-double-right"></i>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketDataTable; 