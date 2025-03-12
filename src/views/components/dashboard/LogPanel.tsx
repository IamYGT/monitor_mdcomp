import React, { useState, useMemo, useEffect } from 'react';
import Button from '../ui/Button';
import LogItem from '../ui/LogItem';
import { useLogger } from '../../../viewmodels/hooks/useLogger';
import { LogType } from '../../../models/interfaces/AppState';

const LogPanel: React.FC = () => {
    const { logs, clearLogs } = useLogger();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLogTypes, setSelectedLogTypes] = useState<LogType[]>(['info', 'success', 'warning', 'error']);
    const [isAutoScroll, setIsAutoScroll] = useState(true);

    // Logların en altına otomatik scroll
    useEffect(() => {
        if (isAutoScroll && logs.length > 0) {
            const logContainer = document.getElementById('log-container');
            if (logContainer) {
                logContainer.scrollTop = logContainer.scrollHeight;
            }
        }
    }, [logs, isAutoScroll]);

    // Sayfa değiştiğinde en üste scroll
    useEffect(() => {
        const logContainer = document.getElementById('log-container');
        if (logContainer && !isAutoScroll) {
            logContainer.scrollTop = 0;
        }
    }, [currentPage, isAutoScroll]);

    // Log tiplerini filtreleme fonksiyonu
    const handleLogTypeToggle = (type: LogType) => {
        setSelectedLogTypes(prev => {
            if (prev.includes(type)) {
                return prev.filter(t => t !== type);
            } else {
                return [...prev, type];
            }
        });
        setCurrentPage(1); // Filtreleme yapıldığında ilk sayfaya dön
    };

    // Log türü butonları için stil
    const getLogTypeButtonStyle = (type: LogType) => {
        const baseStyle = "px-2 py-1 rounded-md text-xs border ";

        if (selectedLogTypes.includes(type)) {
            switch (type) {
                case 'info': return baseStyle + "bg-emerald-500/30 border-emerald-500 text-emerald-200";
                case 'success': return baseStyle + "bg-green-500/30 border-green-600 text-green-200";
                case 'warning': return baseStyle + "bg-amber-500/30 border-amber-600 text-amber-200";
                case 'error': return baseStyle + "bg-red-500/30 border-red-600 text-red-200";
                default: return baseStyle;
            }
        } else {
            return baseStyle + "bg-gray-800 border-gray-600 text-gray-400";
        }
    };

    // Filtreleme fonksiyonu
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            // Log tipi filtreleme
            if (!selectedLogTypes.includes(log.type)) return false;

            // Metin araması
            if (searchTerm.trim() === '') return true;

            const searchLower = searchTerm.toLowerCase();
            const messageLower = log.message.toLowerCase();
            const timeLower = log.timestamp.toLocaleString().toLowerCase();

            return messageLower.includes(searchLower) || timeLower.includes(searchLower);
        });
    }, [logs, searchTerm, selectedLogTypes]);

    // Sayfalama
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

    const currentLogs = useMemo(() => {
        // Otomatik scroll modunda son sayfayı göster
        if (isAutoScroll && filteredLogs.length > 0) {
            const lastPage = Math.max(1, totalPages);
            if (currentPage !== lastPage) {
                setCurrentPage(lastPage);
            }
            const startIdx = Math.max(0, filteredLogs.length - itemsPerPage);
            return filteredLogs.slice(startIdx);
        }

        // Normal sayfalama
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
    }, [filteredLogs, currentPage, itemsPerPage, isAutoScroll, totalPages]);

    // Sayfa değiştirme fonksiyonu
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="rounded-xl overflow-hidden shadow-lg border border-gray-700/30">
            {/* Panel Başlık ve Kontrol Alanı */}
            <div className="bg-gray-800 p-3 border-b border-gray-700/30 flex flex-wrap gap-2 justify-between items-center">
                <div className="flex items-center">
                    <i className="bi bi-list-ul text-emerald-400 mr-2 text-lg"></i>
                    <h2 className="text-gray-100 font-semibold">Sistem Logları</h2>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    {/* Arama Alanı */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Log ara..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                if (isAutoScroll) setIsAutoScroll(false);
                                setCurrentPage(1);
                            }}
                            className="bg-gray-900 border border-gray-700 text-white text-xs rounded py-1.5 pl-8 pr-3 w-48 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <i className="bi bi-search text-xs"></i>
                        </div>
                    </div>

                    {/* Log Tipi Filtreleri */}
                    <div className="flex space-x-1">
                        <button
                            onClick={() => handleLogTypeToggle('info')}
                            className={getLogTypeButtonStyle('info')}
                            title="Bilgi mesajları"
                        >
                            <i className="bi bi-info-circle mr-1"></i>Bilgi
                        </button>
                        <button
                            onClick={() => handleLogTypeToggle('success')}
                            className={getLogTypeButtonStyle('success')}
                            title="Başarı mesajları"
                        >
                            <i className="bi bi-check-circle mr-1"></i>Başarı
                        </button>
                        <button
                            onClick={() => handleLogTypeToggle('warning')}
                            className={getLogTypeButtonStyle('warning')}
                            title="Uyarı mesajları"
                        >
                            <i className="bi bi-exclamation-triangle mr-1"></i>Uyarı
                        </button>
                        <button
                            onClick={() => handleLogTypeToggle('error')}
                            className={getLogTypeButtonStyle('error')}
                            title="Hata mesajları"
                        >
                            <i className="bi bi-x-octagon mr-1"></i>Hata
                        </button>
                    </div>

                    {/* Otomatik Scroll Düğmesi */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAutoScroll(!isAutoScroll)}
                        className={isAutoScroll ? "border-emerald-500 text-emerald-400" : ""}
                    >
                        <i className={`bi bi-arrow-down-circle${isAutoScroll ? '-fill' : ''} mr-1`}></i>
                        Oto-Scroll
                    </Button>

                    {/* Temizle Düğmesi */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearLogs}
                        icon={<i className="bi bi-trash"></i>}
                    >
                        Temizle
                    </Button>
                </div>
            </div>

            {/* Log Listesi */}
            <div id="log-container" className="h-96 overflow-y-auto px-2">
                {currentLogs.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                        {filteredLogs.length === 0
                            ? (logs.length === 0
                                ? 'Henüz log kaydı bulunmuyor.'
                                : 'Arama kriterlerine uygun log bulunamadı.')
                            : 'Bu sayfada gösterilecek log yok.'}
                    </div>
                ) : (
                    currentLogs.map(log => <LogItem key={log.id} log={log} />)
                )}
            </div>

            {/* Sayfalama Kontrolleri */}
            {!isAutoScroll && filteredLogs.length > 0 && (
                <div className="bg-gray-800 p-3 border-t border-gray-700/30 flex flex-wrap justify-between items-center text-sm">
                    <div className="text-gray-400 text-xs">
                        Toplam {filteredLogs.length} log kaydından {itemsPerPage * (currentPage - 1) + 1}-
                        {Math.min(itemsPerPage * currentPage, filteredLogs.length)} arası gösteriliyor
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
                            disabled={currentPage === totalPages}
                            className={`p-1.5 rounded ${currentPage === totalPages ? 'text-gray-500' : 'text-gray-300 hover:bg-gray-700'}`}
                            title="Sonraki Sayfa"
                        >
                            <i className="bi bi-chevron-right"></i>
                        </button>
                        <button
                            onClick={() => goToPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className={`p-1.5 rounded ${currentPage === totalPages ? 'text-gray-500' : 'text-gray-300 hover:bg-gray-700'}`}
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

export default LogPanel; 