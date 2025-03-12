import { useState, useEffect } from "react";
import { MarketDataPoint } from "../../models/interfaces/MarketData";
import { useAppContext } from "../contexts/AppContext";

interface UseMarketDataReturn {
  data: MarketDataPoint[];
  loading: boolean;
  error: string | null;
  subscribe: (symbol: string) => void;
  unsubscribe: (symbol: string) => void;
  fetchHistorical: (symbol: string, interval: string) => void;
  clear: () => void;
  activeSymbol: string;
}

export const useMarketData = (): UseMarketDataReturn => {
  const { state, subscribe, unsubscribe, getHistoricalData, clearMarketData } =
    useAppContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Market verilerinde değişiklikler için tepki gösterme
  useEffect(() => {
    if (state.connection.connectingError) {
      setError(state.connection.connectingError);
    } else {
      setError(null);
    }
  }, [state.connection.connectingError]);

  // Yeni bir sembol aboneliği
  const handleSubscribe = (symbol: string) => {
    setLoading(true);
    setError(null);
    try {
      subscribe(symbol);
    } catch (err) {
      setError("Abonelik sırasında bir hata oluştu");
      console.error("Subscription error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Bir sembol aboneliğini iptal etme
  const handleUnsubscribe = (symbol: string) => {
    try {
      unsubscribe(symbol);
    } catch (err) {
      setError("Abonelik iptali sırasında bir hata oluştu");
      console.error("Unsubscription error:", err);
    }
  };

  // Geçmiş verileri getirme
  const handleFetchHistorical = (symbol: string, interval: string) => {
    setLoading(true);
    setError(null);
    try {
      getHistoricalData(symbol, interval);
    } catch (err) {
      setError("Geçmiş veriler alınırken bir hata oluştu");
      console.error("Historical data error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Market verilerini temizleme
  const handleClear = () => {
    clearMarketData();
  };

  return {
    data: state.marketData,
    loading,
    error,
    subscribe: handleSubscribe,
    unsubscribe: handleUnsubscribe,
    fetchHistorical: handleFetchHistorical,
    clear: handleClear,
    activeSymbol: state.connection.activeSymbol,
  };
};
