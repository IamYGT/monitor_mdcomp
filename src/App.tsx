import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useAppContext } from './viewmodels/contexts/AppContext';
import Sidebar from './views/components/layout/Sidebar';
import MainContent from './views/components/layout/MainContent';
import Dashboard from './views/pages/Dashboard';
import MarketData from './views/pages/MarketData';
import Connections from './views/pages/Connections';
import Settings from './views/pages/Settings';

const App: React.FC = () => {
  // WebSocket bağlantı ayarları
  const defaultWsUrl = 'ws://154.194.35.202:8080'; // Varsayılan WS bağlantı - port 8080
  const [manualIpAddress, setManualIpAddress] = useState('154.194.35.202'); // Manuel IP giriş alanı için
  const [manualPort, setManualPort] = useState('8080'); // Manuel Port giriş alanı için
  const [protocol, setProtocol] = useState('ws'); // ws protokolü seçili
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'connected-hidden' | 'error'>('disconnected');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const connectionAttemptRef = useRef<number>(0);
  const maxConnectionAttempts = 3;

  // Varsayılan WebSocket URL'ini kullan
  const initialWsUrl = defaultWsUrl;

  const [wsUrl, setWsUrl] = useState(initialWsUrl);
  const socketStatusTimerRef = useRef<number | null>(null);

  // Manuel IP ve port bilgisiyle bağlanma fonksiyonu
  const connectToServer = () => {
    // Önceki bağlantı denemelerini sıfırla
    connectionAttemptRef.current = 0;
    setErrorMessage(null);

    // Yeni URL oluştur
    const newWsUrl = `${protocol}://${manualIpAddress}:${manualPort}`;
    console.log(`Sunucuya bağlanma girişimi: ${newWsUrl}`);

    // Bağlantı durumunu güncelle
    setConnectionStatus('connecting');
    setWsUrl(newWsUrl);

    // 10 saniye içinde bağlantı kurulamamışsa hata göster
    if (socketStatusTimerRef.current) {
      window.clearTimeout(socketStatusTimerRef.current);
    }

    socketStatusTimerRef.current = window.setTimeout(() => {
      if (connectionStatus !== 'connected') {
        setConnectionStatus('error');
        setErrorMessage(`${newWsUrl} adresine bağlantı kurulamadı. Port açık olmayabilir veya sunucu çalışmıyor olabilir.`);
      }
    }, 10000);
  };

  // Sayfa yüklendiğinde otomatik olarak bağlan
  useEffect(() => {
    // İlk yükleme sonrası otomatik bağlantı
    connectToServer();

    // Clean-up fonksiyonu
    return () => {
      if (socketStatusTimerRef.current) {
        window.clearTimeout(socketStatusTimerRef.current);
      }
    };
  }, []); // Boş dependency array sadece component mount olduğunda çalışmasını sağlar

  // WebSocket durumunu dinle - Bu özellik için AppContext'i genişletmemiz gerekebilir
  useEffect(() => {
    // Hata olaylarını global olarak dinle (WebSocketService tarafından fırlatılan console.error olaylarını yakalamak için)
    const originalConsoleError = console.error;
    console.error = function (...args) {
      // WebSocket hatalarını yakala
      if (args[0] && typeof args[0] === 'string' && (
        args[0].includes('WebSocket') ||
        args[0].includes('ws://') ||
        args[0].includes('wss://'))) {
        setErrorMessage(`Bağlantı hatası: ${args[0]}`);
        setConnectionStatus('error');

        // Yeniden bağlantı denemesi limitini kontrol et
        connectionAttemptRef.current += 1;
        if (connectionAttemptRef.current >= maxConnectionAttempts) {
          setErrorMessage(`${connectionAttemptRef.current} başarısız bağlantı denemesi. Lütfen bağlantı bilgilerini kontrol edin.`);
        }
      }
      // Orijinal console.error çağrısı
      originalConsoleError.apply(console, args);
    };

    // Bağlantı durumunu yönet
    window.addEventListener('online', () => {
      if (connectionStatus === 'error') {
        setErrorMessage('İnternet bağlantısı yeniden kuruldu. Sunucuya bağlanılıyor...');
        connectToServer();
      }
    });

    window.addEventListener('offline', () => {
      setErrorMessage('İnternet bağlantısı kesildi. Sunucu bağlantısı kaybedildi.');
      setConnectionStatus('error');
    });

    return () => {
      // Temizleme işlemleri
      console.error = originalConsoleError;
      if (socketStatusTimerRef.current) {
        window.clearTimeout(socketStatusTimerRef.current);
      }
      window.removeEventListener('online', connectToServer);
      window.removeEventListener('offline', () => { });
    };
  }, [connectionStatus]);

  // WebSocketConnection durumunu izlemek için
  const ConnectionStatus: React.FC<{
    onStatusChange: (status: 'connected' | 'disconnected' | 'error', errorMessage?: string) => void
  }> = ({ onStatusChange }) => {
    const { state } = useAppContext();

    useEffect(() => {
      // AppContext'ten gelen bağlantı durumunu yakala
      if (state.connection.isConnected) {
        onStatusChange('connected');
      } else if (state.connection.connectingError) {
        onStatusChange('error', state.connection.connectingError);
      } else {
        onStatusChange('disconnected');
      }
    }, [state.connection.isConnected, state.connection.connectingError, onStatusChange]);

    return null; // Bu bileşen UI render etmez, sadece durum izleme yapar
  };

  // Mesaj konsola logla
  console.log(`WebSocket bağlantı noktası: ${wsUrl} (Durum: ${connectionStatus})`);

  return (
    <Router>
      <AppProvider wsUrl={wsUrl}>
        {/* ConnectionStatus bileşeni ile AppContext'ten bağlantı durumunu al */}
        <ConnectionStatus
          onStatusChange={(status, errorMsg) => {
            if (status === 'connected') {
              setConnectionStatus('connected');
              // Bağlantı başarılı bildirimi
              console.log('Bağlantı başarılı! WebSocket bağlantısı kuruldu.');

              // 5 saniye sonra bildirimi gizle
              setTimeout(() => {
                setConnectionStatus('connected-hidden');
              }, 5000);
            } else if (status === 'error') {
              setConnectionStatus('error');
              setErrorMessage(errorMsg || 'Bağlantı hatası oluştu.');
            }
          }}
        />

        <div className="flex min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 relative">
          {/* Yukarı Çıkma Butonu */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed right-6 bottom-6 bg-emerald-600/80 hover:bg-emerald-600 text-white p-3 rounded-full shadow-lg z-50 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-400 backdrop-blur-sm"
            title="Yukarı çık"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>

          {/* Bağlantı durumu bildirim alanı */}
          <div className={`fixed top-0 left-0 right-0 transition-transform duration-300 transform ${connectionStatus === 'connecting' ? 'translate-y-0' : '-translate-y-full'} bg-blue-600 text-white px-4 py-2 text-center text-sm z-50 shadow-md`}>
            <div className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Sunucuya bağlanılıyor: {wsUrl}</span>
            </div>
          </div>

          {/* Bağlantı hatası bildirimi */}
          <div className={`fixed top-0 left-0 right-0 transition-all duration-300 transform ${connectionStatus === 'error' && errorMessage ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'} bg-red-600 text-white px-4 py-2 text-center text-sm z-50 shadow-md`}>
            <div className="flex items-center justify-center">
              <span className="mr-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                {errorMessage}
              </span>
              <button
                onClick={connectToServer}
                className="ml-auto bg-white text-red-600 text-xs px-3 py-1 rounded hover:bg-gray-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white"
              >
                Yeniden Dene
              </button>
            </div>
          </div>

          {/* Bağlantı başarılı bildirimi - Auto-hide after 5 seconds */}
          <div className={`fixed top-0 left-0 right-0 transition-all duration-300 transform ${connectionStatus === 'connected' ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'} bg-emerald-600 text-white px-4 py-2 text-center text-sm z-50 shadow-md`}>
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Sunucuya bağlantı kuruldu: {wsUrl}</span>
            </div>
          </div>

          {/* Ana uygulama başlığı - Yeniden Tasarlandı */}
          <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-sm text-white shadow-md z-40 border-b border-gray-700/50">
            <div className="flex items-center justify-between px-4 h-14">
              {/* Logo ve Başlık */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center px-3 py-1.5 bg-gradient-to-r from-emerald-900/40 to-emerald-700/30 rounded-lg border border-emerald-600/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                  </svg>
                  <span className="font-bold text-base ml-2 tracking-wide text-white">Market Veri İzleyici</span>
                </div>

                {/* Bağlantı durumu - Badge */}
                <div className={`px-2.5 py-1 rounded-full flex items-center transition-colors duration-300 ${connectionStatus === 'connected' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/50' :
                  connectionStatus === 'connecting' ? 'bg-blue-900/40 text-blue-400 border border-blue-700/50' :
                    connectionStatus === 'error' ? 'bg-red-900/40 text-red-400 border border-red-700/50' :
                      'bg-gray-800/40 text-gray-400 border border-gray-700/50'
                  }`}>
                  <div className={`h-2 w-2 rounded-full mr-2 ${connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' :
                    connectionStatus === 'connecting' ? 'bg-blue-400 animate-pulse' :
                      connectionStatus === 'error' ? 'bg-red-400' : 'bg-gray-400'
                    }`}></div>
                  <span className="text-xs font-medium">
                    {connectionStatus === 'connected' || connectionStatus === 'connected-hidden' ? 'Bağlı' :
                      connectionStatus === 'connecting' ? 'Bağlanıyor...' :
                        connectionStatus === 'error' ? 'Bağlantı Hatası' : 'Bağlı Değil'}
                  </span>
                </div>
              </div>

              {/* Sunucu Bağlantı Formu */}
              <div className="relative group">
                <div className="flex items-center bg-gray-800/70 border border-gray-700/50 rounded-lg p-1 pr-2">
                  <div className="flex items-center mr-2 bg-gray-900/70 px-3 py-1.5 rounded-md text-xs text-gray-400">
                    <span className="mr-2 hidden sm:inline">Sunucu:</span>
                    <select
                      value={protocol}
                      onChange={(e) => setProtocol(e.target.value)}
                      className="bg-transparent text-gray-300 text-xs appearance-none cursor-pointer focus:outline-none"
                      aria-label="Protokol seçimi"
                      title="Bağlantı protokolü"
                    >
                      <option value="wss" className="bg-gray-800 text-gray-300">WSS</option>
                      <option value="ws" className="bg-gray-800 text-gray-300">WS</option>
                    </select>
                  </div>

                  <div className="flex space-x-1">
                    <input
                      type="text"
                      placeholder="IP adresi"
                      value={manualIpAddress}
                      onChange={(e) => setManualIpAddress(e.target.value)}
                      className="bg-transparent border-b border-gray-700 text-white text-xs px-1 py-0.5 w-28 focus:border-blue-500 focus:outline-none"
                      title="Sunucu IP adresi"
                    />

                    <div className="text-gray-500 flex items-center">:</div>

                    <input
                      type="text"
                      placeholder="Port"
                      value={manualPort}
                      onChange={(e) => setManualPort(e.target.value)}
                      className="bg-transparent border-b border-gray-700 text-white text-xs px-1 py-0.5 w-12 focus:border-blue-500 focus:outline-none"
                      title="Sunucu port numarası"
                    />

                    <button
                      onClick={connectToServer}
                      disabled={connectionStatus === 'connecting'}
                      className="ml-2 rounded-md px-3 py-1 text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-900 focus:ring-blue-500
                      disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed
                      bg-blue-600 hover:bg-blue-700 text-white"
                      title={connectionStatus === 'connecting' ? 'Bağlantı kuruluyor...' : 'Sunucuya bağlan'}
                    >
                      {connectionStatus === 'connecting' ? (
                        <div className="flex items-center space-x-1">
                          <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Bağlanıyor</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>Bağlan</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* İpucu Balonu */}
                <div className="absolute right-0 top-full mt-1 w-64 bg-gray-800 text-xs text-gray-300 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-2 border border-gray-700/50 z-50">
                  <div className="text-gray-400 font-medium mb-1">Bağlantı Bilgileri:</div>
                  <div className="flex">
                    <div className="w-1/3 text-gray-500">Protokol:</div>
                    <div>{protocol.toUpperCase()}</div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-gray-500">IP Adresi:</div>
                    <div>{manualIpAddress}</div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-gray-500">Port:</div>
                    <div>{manualPort}</div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-gray-500">Durum:</div>
                    <div className={
                      connectionStatus === 'connected' || connectionStatus === 'connected-hidden' ? 'text-emerald-400' :
                        connectionStatus === 'connecting' ? 'text-blue-400' :
                          connectionStatus === 'error' ? 'text-red-400' : 'text-gray-400'
                    }>
                      {connectionStatus === 'connected' || connectionStatus === 'connected-hidden' ? 'Bağlı' :
                        connectionStatus === 'connecting' ? 'Bağlanıyor...' :
                          connectionStatus === 'error' ? 'Bağlantı Hatası' : 'Bağlı Değil'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ana içerik alanı - Başlık için padding eklenmiş */}
          <div className="flex flex-1 pt-14 w-full">
            <Sidebar />
            <MainContent>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/market-data" element={<MarketData />} />
                <Route path="/connections" element={<Connections />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </MainContent>
          </div>
        </div>
      </AppProvider>
    </Router>
  );
};

export default App;
