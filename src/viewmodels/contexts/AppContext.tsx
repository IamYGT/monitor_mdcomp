import React, { createContext, useReducer, useContext, ReactNode, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppState, ConnectionState, Stats, LogEntry, LogType } from '../../models/interfaces/AppState';
import { MarketDataPoint, ServerStats, WebSocketStats, CacheStats, ClientConnection } from '../../models/interfaces/MarketData';
import WebSocketService, { WebSocketIncomingMessage } from '../../models/services/WebSocketService';

// Başlangıç durumu
const initialState: AppState = {
    connection: {
        isConnected: false,
        connectingError: null,
        activeSymbol: 'BINANCE:BTCUSDT',
        debugMode: false,
        serverUrl: ''  // Default olarak boş, gerçek değer AppProvider'dan gelecek
    },
    stats: {
        activeConnections: 0,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        cacheHits: 0,
        cacheMisses: 0
    },
    marketData: [],
    logs: [],
    serverStats: {
        cpuUsage: '0%',
        memoryUsage: '0 MB',
        uptime: '0:00:00'
    },
    wsStats: {
        connections: 0,
        messagesPerSecond: 0,
        totalMessages: 0
    },
    cacheStats: {
        size: '0 KB',
        hitRate: '0%',
        items: 0
    },
    clients: [],
    activeTab: 'dashboard'
};

// Eylem tipleri
type ActionType =
    | { type: 'SET_CONNECTION_STATE'; payload: Partial<ConnectionState> }
    | { type: 'UPDATE_STATS'; payload: Partial<Stats> }
    | { type: 'ADD_MARKET_DATA'; payload: MarketDataPoint }
    | { type: 'CLEAR_MARKET_DATA' }
    | { type: 'ADD_LOG'; payload: { message: string; type: LogType } }
    | { type: 'CLEAR_LOGS' }
    | { type: 'UPDATE_SERVER_STATS'; payload: Partial<ServerStats> }
    | { type: 'UPDATE_WS_STATS'; payload: Partial<WebSocketStats> }
    | { type: 'UPDATE_CACHE_STATS'; payload: Partial<CacheStats> }
    | { type: 'UPDATE_CLIENTS'; payload: ClientConnection[] }
    | { type: 'SET_ACTIVE_TAB'; payload: AppState['activeTab'] };

// Reducer fonksiyonu
const appReducer = (state: AppState, action: ActionType): AppState => {
    switch (action.type) {
        case 'SET_CONNECTION_STATE':
            return {
                ...state,
                connection: {
                    ...state.connection,
                    ...action.payload
                }
            };
        case 'UPDATE_STATS':
            return {
                ...state,
                stats: {
                    ...state.stats,
                    ...action.payload
                }
            };
        case 'ADD_MARKET_DATA':
            return {
                ...state,
                marketData: [action.payload, ...state.marketData].slice(0, 50)
            };
        case 'CLEAR_MARKET_DATA':
            return {
                ...state,
                marketData: []
            };
        case 'ADD_LOG':
            const newLog: LogEntry = {
                id: uuidv4(),
                timestamp: new Date(),
                message: action.payload.message,
                type: action.payload.type
            };
            return {
                ...state,
                logs: [newLog, ...state.logs].slice(0, 1000)
            };
        case 'CLEAR_LOGS':
            return {
                ...state,
                logs: []
            };
        case 'UPDATE_SERVER_STATS':
            return {
                ...state,
                serverStats: {
                    ...state.serverStats,
                    ...action.payload
                }
            };
        case 'UPDATE_WS_STATS':
            return {
                ...state,
                wsStats: {
                    ...state.wsStats,
                    ...action.payload
                }
            };
        case 'UPDATE_CACHE_STATS':
            return {
                ...state,
                cacheStats: {
                    ...state.cacheStats,
                    ...action.payload
                }
            };
        case 'UPDATE_CLIENTS':
            return {
                ...state,
                clients: action.payload
            };
        case 'SET_ACTIVE_TAB':
            return {
                ...state,
                activeTab: action.payload
            };
        default:
            return state;
    }
};

// Context arayüzü
interface AppContextProps {
    state: AppState;
    connect: () => void;
    disconnect: () => void;
    subscribe: (symbol: string) => void;
    unsubscribe: (symbol: string) => void;
    getHistoricalData: (symbol: string, interval: string) => void;
    clearMarketData: () => void;
    clearLogs: () => void;
    toggleDebugMode: () => void;
    setActiveTab: (tab: AppState['activeTab']) => void;
    addLog: (message: string, type: LogType) => void;
}

// Context oluşturma
export const AppContext = createContext<AppContextProps | undefined>(undefined);

// Props arayüzü
interface AppProviderProps {
    children: ReactNode;
    wsUrl: string;
}

// Provider bileşeni
export const AppProvider: React.FC<AppProviderProps> = ({ children, wsUrl }) => {
    const [state, dispatch] = useReducer(appReducer, {
        ...initialState,
        connection: {
            ...initialState.connection,
            serverUrl: wsUrl  // WebSocket URL'sini connection state'ine yükle
        }
    });
    const wsService = WebSocketService.getInstance(wsUrl);

    // Bağlantı durumu değiştiğinde state güncelleme
    const handleConnect = () => {
        dispatch({
            type: 'SET_CONNECTION_STATE',
            payload: { isConnected: true, connectingError: null }
        });
        dispatch({
            type: 'ADD_LOG',
            payload: { message: 'WebSocket bağlantısı kuruldu', type: 'success' }
        });
        dispatch({
            type: 'UPDATE_STATS',
            payload: { activeConnections: state.stats.activeConnections + 1 }
        });
    };

    const handleDisconnect = () => {
        dispatch({
            type: 'SET_CONNECTION_STATE',
            payload: { isConnected: false }
        });
        dispatch({
            type: 'ADD_LOG',
            payload: { message: 'WebSocket bağlantısı kesildi', type: 'warning' }
        });
        dispatch({
            type: 'UPDATE_STATS',
            payload: { activeConnections: Math.max(0, state.stats.activeConnections - 1) }
        });
    };

    const handleError = (error: Event) => {
        // Hata türünü belirleme ve anlamlı mesaj oluşturma
        let errorMessage = "WebSocket bağlantı hatası";
        let errorType: LogType = 'error';

        if (error.type === 'error') {
            errorMessage = "Sunucu ile iletişim kurulamadı. Ağ bağlantınızı kontrol edin.";
        } else if (error.type === 'timeout') {
            errorMessage = "Bağlantı zaman aşımına uğradı. Sunucu yanıt vermiyor.";
        }

        // Bağlantı hata durumunu güncelle
        dispatch({
            type: 'SET_CONNECTION_STATE',
            payload: { connectingError: errorMessage }
        });

        // Hatayı logla
        dispatch({
            type: 'ADD_LOG',
            payload: {
                message: `WebSocket hatası: ${errorMessage} (${error.type})`,
                type: errorType
            }
        });

        // İstatistikleri güncelle
        dispatch({
            type: 'UPDATE_STATS',
            payload: { failedRequests: state.stats.failedRequests + 1 }
        });

        // Kullanıcıya öneriler sun
        setTimeout(() => {
            dispatch({
                type: 'ADD_LOG',
                payload: {
                    message: "Bağlantı sorunu devam ediyorsa, yedek sunucu seçeneğini kullanabilir veya istemci moduna geçebilirsiniz.",
                    type: 'info'
                }
            });
        }, 3000);
    };

    const handleMessage = (message: WebSocketIncomingMessage) => {
        dispatch({
            type: 'UPDATE_STATS',
            payload: { totalRequests: state.stats.totalRequests + 1 }
        });

        if (state.connection.debugMode) {
            dispatch({
                type: 'ADD_LOG',
                payload: {
                    message: `Raw mesaj alındı: ${JSON.stringify(message, null, 2)}`,
                    type: 'info'
                }
            });
        }

        if (message.type === 'realtime' && message.data) {
            const marketData = message.data as MarketDataPoint;
            dispatch({ type: 'ADD_MARKET_DATA', payload: marketData });
            dispatch({
                type: 'SET_CONNECTION_STATE',
                payload: { activeSymbol: marketData.symbol }
            });

            if (state.connection.debugMode) {
                dispatch({
                    type: 'ADD_LOG',
                    payload: {
                        message: `Gerçek zamanlı veri alındı: ${marketData.symbol} - $${marketData.price}`,
                        type: 'info'
                    }
                });
            }

            dispatch({
                type: 'UPDATE_STATS',
                payload: { successfulRequests: state.stats.successfulRequests + 1 }
            });
        } else if (message.type === 'historical' && message.data) {
            const historicalData = message.data;
            if ('metadata' in historicalData && Array.isArray(historicalData.data)) {
                const metadata = historicalData.metadata;
                dispatch({
                    type: 'ADD_LOG',
                    payload: {
                        message: `Geçmiş veriler alındı: ${metadata.symbol}:
            Interval: ${metadata.interval}
            Exchange: ${metadata.exchange}
            Veri Noktaları: ${historicalData.data.length}`,
                        type: 'success'
                    }
                });

                historicalData.data.forEach(item => {
                    dispatch({ type: 'ADD_MARKET_DATA', payload: item });
                });

                dispatch({
                    type: 'UPDATE_STATS',
                    payload: { successfulRequests: state.stats.successfulRequests + 1 }
                });
            }
        } else if (message.type === 'error') {
            dispatch({
                type: 'ADD_LOG',
                payload: { message: `Error: ${message.message}`, type: 'error' }
            });
            dispatch({
                type: 'UPDATE_STATS',
                payload: { failedRequests: state.stats.failedRequests + 1 }
            });
        }
    };

    // WebSocket servisine event listener'lar ekleme
    useEffect(() => {
        wsService.addConnectListener(handleConnect);
        wsService.addDisconnectListener(handleDisconnect);
        wsService.addErrorListener(handleError);
        wsService.addMessageListener(handleMessage);

        // Kullanıcıya bağlantı denemesi hakkında bilgi ver
        dispatch({
            type: 'ADD_LOG',
            payload: {
                message: `${wsUrl} adresine bağlantı kurulmaya çalışılıyor...`,
                type: 'info'
            }
        });

        // Bağlantı sorunlarını daha iyi yönetmek için ek ayarlar
        wsService.updateReconnectSettings(10, 2000); // Daha fazla deneme ve artan bekleme süresi
        wsService.setConnectionTimeout(15000); // 15 saniye bağlantı zaman aşımı

        // Bağlantıyı başlat
        console.log(`WebSocket bağlantısı başlatılıyor: ${wsUrl}`);
        wsService.connect();

        // Bağlantı durumunu periyodik olarak kontrol et
        const connectionCheckInterval = setInterval(() => {
            const isCurrentlyConnected = wsService.isConnected();
            const connectionStatus = wsService.getConnectionStatus();

            // Bağlantı durum değişimini logla
            if (isCurrentlyConnected !== state.connection.isConnected) {
                dispatch({
                    type: 'ADD_LOG',
                    payload: {
                        message: `Bağlantı durumu değişti: ${connectionStatus}`,
                        type: isCurrentlyConnected ? 'success' : 'warning'
                    }
                });

                dispatch({
                    type: 'SET_CONNECTION_STATE',
                    payload: {
                        isConnected: isCurrentlyConnected,
                        connectingError: isCurrentlyConnected ? null : 'Bağlantı kesildi'
                    }
                });
            }
        }, 5000);

        // Temizlik işlemleri
        return () => {
            console.log('WebSocket kaynakları temizleniyor');
            wsService.removeConnectListener(handleConnect);
            wsService.removeDisconnectListener(handleDisconnect);
            wsService.removeErrorListener(handleError);
            wsService.removeMessageListener(handleMessage);
            wsService.disconnect();
            clearInterval(connectionCheckInterval);
        };
    }, [wsUrl]); // wsUrl değişirse etkileşimi yeniden kur

    // Periyodik olarak simüle edilmiş sistem verilerini güncelle
    useEffect(() => {
        const intervalId = setInterval(() => {
            const uptime = new Date(Date.now() - new Date().setHours(0, 0, 0, 0));
            const hours = uptime.getHours();
            const minutes = uptime.getMinutes();
            const seconds = uptime.getSeconds();
            const uptimeString = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            dispatch({
                type: 'UPDATE_SERVER_STATS',
                payload: {
                    cpuUsage: `${Math.floor(Math.random() * 100)}%`,
                    memoryUsage: `${Math.floor(Math.random() * 1000)} MB`,
                    uptime: uptimeString
                }
            });

            dispatch({
                type: 'UPDATE_WS_STATS',
                payload: {
                    connections: state.stats.activeConnections,
                    messagesPerSecond: Math.floor(Math.random() * 100),
                    totalMessages: state.stats.totalRequests
                }
            });

            const hitRate = state.stats.cacheHits / (state.stats.cacheHits + state.stats.cacheMisses) * 100 || 0;
            dispatch({
                type: 'UPDATE_CACHE_STATS',
                payload: {
                    size: `${Math.floor(Math.random() * 100)} MB`,
                    hitRate: `${hitRate.toFixed(1)}%`,
                    items: Math.floor(Math.random() * 1000)
                }
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [state.stats]);

    // Context değerlerini memoize et
    const connect = useCallback(() => wsService.connect(), []);
    const disconnect = useCallback(() => wsService.disconnect(), []);

    const subscribe = useCallback((symbol: string) => {
        wsService.subscribe(symbol);
        dispatch({
            type: 'ADD_LOG',
            payload: { message: `${symbol} için abonelik başlatıldı`, type: 'success' }
        });
    }, []);

    const unsubscribe = useCallback((symbol: string) => {
        wsService.unsubscribe(symbol);
        dispatch({
            type: 'ADD_LOG',
            payload: { message: `${symbol} için abonelik iptal edildi`, type: 'warning' }
        });
    }, []);

    const getHistoricalData = useCallback((symbol: string, interval: string) => {
        wsService.getHistoricalData(symbol, interval);
        dispatch({
            type: 'ADD_LOG',
            payload: { message: `${symbol} için geçmiş veriler istendi (${interval})`, type: 'info' }
        });
    }, []);

    const clearMarketData = useCallback(() => {
        dispatch({ type: 'CLEAR_MARKET_DATA' });
        dispatch({
            type: 'ADD_LOG',
            payload: { message: 'Market verileri temizlendi', type: 'info' }
        });
    }, []);

    const clearLogs = useCallback(() => {
        dispatch({ type: 'CLEAR_LOGS' });
    }, []);

    const toggleDebugMode = useCallback(() => {
        const newDebugMode = !state.connection.debugMode;
        dispatch({
            type: 'SET_CONNECTION_STATE',
            payload: { debugMode: newDebugMode }
        });
        dispatch({
            type: 'ADD_LOG',
            payload: { message: `Debug modu ${newDebugMode ? 'etkinleştirildi' : 'devre dışı bırakıldı'}`, type: 'info' }
        });
    }, [state.connection.debugMode]);

    const setActiveTab = useCallback((tab: AppState['activeTab']) => {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
    }, []);

    const addLog = useCallback((message: string, type: LogType) => {
        dispatch({
            type: 'ADD_LOG',
            payload: { message, type }
        });
    }, []);

    // Context değerleri
    const contextValue: AppContextProps = {
        state,
        connect,
        disconnect,
        subscribe,
        unsubscribe,
        getHistoricalData,
        clearMarketData,
        clearLogs,
        toggleDebugMode,
        setActiveTab,
        addLog
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

// Özel hook
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}; 