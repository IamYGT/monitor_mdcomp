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
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
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
            } else if (status === 'error') {
              setConnectionStatus('error');
              setErrorMessage(errorMsg || 'Bağlantı hatası oluştu.');
            }
          }}
        />

        <div className="flex min-h-screen bg-gray-900 text-gray-100 relative">
          {/* Bağlantı durumu bildirim alanı */}
          {connectionStatus === 'connecting' && (
            <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white px-4 py-1 text-center text-sm z-50">
              ⏳ Sunucuya bağlanılıyor: {wsUrl}
            </div>
          )}

          {/* Bağlantı hatası bildirimi */}
          {connectionStatus === 'error' && errorMessage && (
            <div className="absolute top-0 left-0 right-0 bg-red-600 text-white px-4 py-1 text-center text-sm z-50 flex items-center justify-center">
              <span className="mr-2">⚠️ {errorMessage}</span>
              <button
                onClick={connectToServer}
                className="bg-white text-red-600 text-xs px-2 py-0.5 rounded hover:bg-gray-200"
              >
                Yeniden Dene
              </button>
            </div>
          )}

          {/* Bağlantı başarılı bildirimi */}
          {connectionStatus === 'connected' && (
            <div className="absolute top-0 left-0 right-0 bg-green-600 text-white px-4 py-1 text-center text-sm z-50">
              ✅ Sunucuya bağlantı kuruldu: {wsUrl}
            </div>
          )}

          {/* IP Giriş Formu */}
          <div className="absolute top-2 right-4 z-50 flex items-center space-x-2">
            <select
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white text-xs rounded px-2 py-1"
              aria-label="Protokol seçimi"
            >
              <option value="wss">WSS</option>
              <option value="ws">WS</option>
            </select>
            <input
              type="text"
              placeholder="IP adresi"
              value={manualIpAddress}
              onChange={(e) => setManualIpAddress(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white text-xs rounded px-2 py-1 w-32"
            />
            <input
              type="text"
              placeholder="Port"
              value={manualPort}
              onChange={(e) => setManualPort(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white text-xs rounded px-2 py-1 w-14"
            />
            <button
              onClick={connectToServer}
              disabled={connectionStatus === 'connecting'}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs rounded px-2 py-1 disabled:bg-gray-600"
            >
              {connectionStatus === 'connecting' ? 'Bağlanıyor...' : 'Bağlan'}
            </button>
          </div>

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
      </AppProvider>
    </Router>
  );
};

export default App;
