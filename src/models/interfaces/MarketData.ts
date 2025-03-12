export interface MarketDataPoint {
  date?: string;
  timestamp?: number;
  symbol: string;
  price?: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
}

export interface HistoricalDataResponse {
  metadata: {
    symbol: string;
    interval: string;
    exchange: string;
  };
  data: MarketDataPoint[];
}

export interface MarketSymbol {
  symbol: string;
  lastPrice: number;
  priceChange24h: number;
  volume24h: number;
  marketCap?: number;
}

export interface ServerStats {
  cpuUsage: string;
  memoryUsage: string;
  uptime: string;
}

export interface WebSocketStats {
  connections: number;
  messagesPerSecond: number;
  totalMessages: number;
}

export interface CacheStats {
  size: string;
  hitRate: string;
  items: number;
}

export interface ClientConnection {
  id: string;
  ipAddress: string;
  connectedAt: string;
  subscribedSymbols: string[];
}

export interface ServerSettings {
  cacheSizeLimit: number;
  cacheTTL: number;
  wsPort: number;
  logLevel: "error" | "warn" | "info" | "debug";
  autoReconnect: boolean;
}
