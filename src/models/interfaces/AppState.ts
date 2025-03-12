import {
  MarketDataPoint,
  ServerStats,
  WebSocketStats,
  CacheStats,
  ClientConnection,
} from "./MarketData";

export interface ConnectionState {
  isConnected: boolean;
  connectingError: string | null;
  activeSymbol: string;
  debugMode: boolean;
  serverUrl?: string;
}

export interface Stats {
  activeConnections: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  cacheHits: number;
  cacheMisses: number;
}

export type LogType = "info" | "success" | "warning" | "error";

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: LogType;
}

export interface AppState {
  connection: ConnectionState;
  stats: Stats;
  marketData: MarketDataPoint[];
  logs: LogEntry[];
  serverStats: ServerStats;
  wsStats: WebSocketStats;
  cacheStats: CacheStats;
  clients: ClientConnection[];
  activeTab: "dashboard" | "market-data" | "connections" | "settings";
}
