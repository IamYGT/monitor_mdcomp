import {
  MarketDataPoint,
  HistoricalDataResponse,
} from "../interfaces/MarketData";

// WebSocket mesaj tipleri
export type WebSocketMessageType =
  | "subscribe"
  | "unsubscribe"
  | "getHistorical";

// WebSocket yanıt tipleri
export type WebSocketResponseType = "realtime" | "historical" | "error";

// Giden mesaj arayüzü
export interface WebSocketOutgoingMessage {
  type: WebSocketMessageType;
  symbols?: string;
  symbol?: string;
  interval?: string;
  limit?: number;
}

// Gelen mesaj arayüzü
export interface WebSocketIncomingMessage {
  type: WebSocketResponseType;
  data?: MarketDataPoint | HistoricalDataResponse;
  message?: string;
}

// WebSocket olayları için callback tipleri
export type MessageCallback = (data: WebSocketIncomingMessage) => void;
export type ConnectionCallback = () => void;
export type ErrorCallback = (error: Event) => void;

class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private autoReconnect = true;
  private mockMode = false; // Gerçek bağlantı olmadan test etmek için mock modu
  private connectionTimeout = 10000; // 10 saniye timeout süresi
  private timeoutTimer: ReturnType<typeof setTimeout> | null = null;

  private messageListeners: MessageCallback[] = [];
  private connectListeners: ConnectionCallback[] = [];
  private disconnectListeners: ConnectionCallback[] = [];
  private errorListeners: ErrorCallback[] = [];

  private constructor(url: string) {
    this.url = url;

    // Test URL veya development modunda mock modunu otomatik etkinleştir
    if (
      url.includes("example.com") ||
      url.includes("localhost") ||
      url.includes("mock.local") ||
      (import.meta.env.DEV && !url.includes("154.194.35.202"))
    ) {
      // Localhost ve port bilgisi eklenmiş mi kontrol et
      if (url.includes("localhost") && !url.match(/:\d+$/)) {
        // Varsayılan olarak 8080 portunu ekle
        this.url = `${url}:8080`;
        console.log(`WebSocket URL'e varsayılan port eklendi: ${this.url}`);
      }

      console.log(`WebSocket servisi mock modunda çalışıyor: ${this.url}`);
      this.mockMode = true;

      // Mock mod tipini belirle
      const isMockServer = url.includes("localhost:8080");
      if (isMockServer) {
        console.log(
          "Localhost:8080 üzerinde WebSocket mock sunucusu kullanılıyor"
        );
      } else {
        console.log("Tamamen simüle edilmiş WebSocket modu (sunucu yok)");
      }
    } else if (url.includes("154.194.35.202")) {
      console.log(
        "WebSocket servisi gerçek IP adresi ile çalışıyor: 154.194.35.202"
      );
      this.mockMode = false;

      // URL'de port kontrolü ve düzeltme
      if (!url.match(/:\d+$/)) {
        // WSS bağlantıları için standart port 443'ü, WS için 80'i ekle
        const isSecure = url.startsWith("wss://");
        this.url = `${url}:${isSecure ? "443" : "80"}`;
        console.log(`WebSocket URL'e port eklendi: ${this.url}`);
      }

      // SSL/TLS sertifika hataları için uyarı
      if (url.startsWith("wss://")) {
        console.log(
          "Güvenli WebSocket (WSS) bağlantısı kullanılıyor. Sertifika geçerli olmalıdır."
        );
      } else {
        console.log("UYARI: Güvensiz WebSocket (WS) bağlantısı kullanılıyor.");
      }
    }
  }

  public static getInstance(url: string): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService(url);
    } else if (WebSocketService.instance.url !== url) {
      // URL değiştiyse mevcut bağlantıyı kapat ve yeni bir bağlantı oluştur
      console.log(
        `WebSocket URL değişti: ${WebSocketService.instance.url} -> ${url}`
      );
      WebSocketService.instance.disconnect();
      WebSocketService.instance = new WebSocketService(url);
    }
    return WebSocketService.instance;
  }

  public connect(): void {
    // Eğer zaten bağlıysa veya bağlanma sürecindeyse, tekrar bağlanma
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.CONNECTING ||
        this.ws.readyState === WebSocket.OPEN)
    ) {
      console.log("WebSocket bağlantısı zaten açık veya açılıyor");
      return;
    }

    // Mock modundaysa gerçek bağlantı kurmadan başarılı bir bağlantı simüle et
    if (this.mockMode) {
      console.log("Mock WebSocket bağlantısı simüle ediliyor");
      setTimeout(() => {
        this.notifyConnectListeners();

        // Mock veri gönderimi simülasyonu
        this.startMockDataSimulation();
      }, 500);
      return;
    }

    try {
      console.log(`WebSocket bağlanılıyor: ${this.url}`);

      // Varolan WebSocket nesnesini temizle
      if (this.ws) {
        this.ws.onopen = null;
        this.ws.onclose = null;
        this.ws.onmessage = null;
        this.ws.onerror = null;
        this.ws.close();
        this.ws = null;
      }

      // Yeni WebSocket bağlantısı oluştur
      this.ws = new WebSocket(this.url);

      // Bağlantı timeout kontrolü
      this.timeoutTimer = setTimeout(() => {
        console.log(
          `WebSocket bağlantı zaman aşımı: ${this.connectionTimeout}ms süre doldu`
        );
        if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
          this.ws.close();
          this.notifyErrorListeners(new Event("timeout"));
          this.notifyDisconnectListeners();

          // Yeniden bağlanma denemesi yap
          if (
            this.autoReconnect &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this.reconnectAttempts++;
            console.log(
              `Zaman aşımı sonrası yeniden bağlanma denemesi ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
            );
            setTimeout(
              () => this.connect(),
              this.reconnectInterval * this.reconnectAttempts
            ); // Artan bekleme süresi
          }
        }
      }, this.connectionTimeout);

      this.ws.onopen = () => {
        console.log("WebSocket bağlantısı kuruldu");
        if (this.timeoutTimer) {
          clearTimeout(this.timeoutTimer);
          this.timeoutTimer = null;
        }
        this.reconnectAttempts = 0;
        this.notifyConnectListeners();
      };

      this.ws.onclose = (event) => {
        console.log(
          `WebSocket bağlantısı kapandı. Kod: ${event.code}, Neden: ${event.reason}`
        );
        if (this.timeoutTimer) {
          clearTimeout(this.timeoutTimer);
          this.timeoutTimer = null;
        }
        this.notifyDisconnectListeners();
        if (
          this.autoReconnect &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this.reconnectAttempts++;
          console.log(
            `Yeniden bağlanma denemesi ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
          );
          setTimeout(
            () => this.connect(),
            this.reconnectInterval * this.reconnectAttempts
          );
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketIncomingMessage;
          console.log("WebSocket mesajı alındı:", data);
          this.notifyMessageListeners(data);
        } catch (error) {
          console.error("WebSocket mesajı işlenirken hata:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket hatası:", error);
        if (this.timeoutTimer) {
          clearTimeout(this.timeoutTimer);
          this.timeoutTimer = null;
        }
        this.notifyErrorListeners(error);
      };
    } catch (error) {
      console.error("WebSocket bağlantısı oluşturulurken hata:", error);
      this.notifyErrorListeners(new Event("error"));
    }
  }

  // Mock veri simülasyonu başlat
  private startMockDataSimulation(): void {
    const symbols = ["BINANCE:BTCUSDT", "BINANCE:ETHUSDT", "BINANCE:SOLUSDT"];
    let currentSymbol = symbols[0];

    // Periyodik olarak random fiyat verileri gönderelim
    setInterval(() => {
      const randomPrice = 20000 + Math.random() * 10000;
      const mockData: WebSocketIncomingMessage = {
        type: "realtime",
        data: {
          symbol: currentSymbol,
          price: randomPrice,
          timestamp: Date.now(),
          volume: Math.random() * 100,
        },
      };

      this.notifyMessageListeners(mockData);
    }, 2000);

    // Her 10 saniyede sembolü değiştirelim
    setInterval(() => {
      const index = (symbols.indexOf(currentSymbol) + 1) % symbols.length;
      currentSymbol = symbols[index];
    }, 10000);
  }

  public disconnect(): void {
    if (this.mockMode) {
      console.log("Mock WebSocket bağlantısı kapatılıyor");
      this.notifyDisconnectListeners();
      return;
    }

    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }

    if (this.ws) {
      this.autoReconnect = false;
      try {
        this.ws.close();
      } catch (error) {
        console.error("WebSocket kapatılırken hata:", error);
      }
      this.ws = null;
    }
  }

  public send(message: WebSocketOutgoingMessage): void {
    if (this.mockMode) {
      console.log("Mock modunda mesaj gönderiliyor:", message);

      // Abone olma isteğine yanıt olarak mock veri gönder
      if (message.type === "subscribe" && message.symbols) {
        setTimeout(() => {
          const mockData: WebSocketIncomingMessage = {
            type: "realtime",
            data: {
              symbol: message.symbols?.[0] ?? "BINANCE:BTCUSDT", // Sembol dizisinden ilk elemanı al veya varsayılan değeri kullan
              price: 30000 + Math.random() * 5000,
              timestamp: Date.now(),
              volume: Math.random() * 100,
            },
          };

          this.notifyMessageListeners(mockData);
        }, 300);
      }

      // Geçmiş veri isteğine yanıt olarak mock veri gönder
      if (message.type === "getHistorical") {
        // Sembolü kontrol et - eğer yoksa varsayılan kullan
        if (!message.symbol) {
          console.error("getHistorical isteğinde sembol belirtilmemiş");
          return;
        }

        // Tip güvenliği için string olarak güvenli bir değer alıyoruz
        const mockSymbol = String(message.symbol);
        const mockInterval = message.interval ? String(message.interval) : "D";

        setTimeout(() => {
          try {
            // Mock veri dizisi oluştur
            const mockData: MarketDataPoint[] = [];

            // Veri doldur
            for (let i = 0; i < 30; i++) {
              const basePrice = 30000 + Math.random() * 5000;
              mockData.push({
                symbol: mockSymbol,
                timestamp: Date.now() - i * 60000,
                price: basePrice + (Math.random() * 200 - 100),
                volume: Math.random() * 100,
                high: basePrice + 100,
                low: basePrice - 100,
                open: basePrice - 50,
                close: basePrice + 50,
              });
            }

            // Yanıtı gönder
            this.notifyMessageListeners({
              type: "historical",
              data: {
                metadata: {
                  symbol: mockSymbol,
                  interval: mockInterval,
                  exchange: "BINANCE",
                },
                data: mockData,
              },
            });
          } catch (err) {
            console.error("Mock tarihsel veri oluşturulurken hata:", err);

            // Hata durumunda error mesajı gönder
            this.notifyMessageListeners({
              type: "error",
              message: "Tarihsel veri alınırken hata oluştu",
            });
          }
        }, 1000);
      }

      return;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error("WebSocket bağlantısı açık değil. Mesaj gönderilemiyor.");
    }
  }

  public subscribe(symbol: string): void {
    this.send({
      type: "subscribe",
      symbols: symbol,
    });
  }

  public unsubscribe(symbol: string): void {
    this.send({
      type: "unsubscribe",
      symbols: symbol,
    });
  }

  public getHistoricalData(
    symbol: string,
    interval: string,
    limit: number = 300
  ): void {
    this.send({
      type: "getHistorical",
      symbol,
      interval,
      limit,
    });
  }

  public addMessageListener(callback: MessageCallback): void {
    this.messageListeners.push(callback);
  }

  public removeMessageListener(callback: MessageCallback): void {
    this.messageListeners = this.messageListeners.filter(
      (listener) => listener !== callback
    );
  }

  public addConnectListener(callback: ConnectionCallback): void {
    this.connectListeners.push(callback);
  }

  public removeConnectListener(callback: ConnectionCallback): void {
    this.connectListeners = this.connectListeners.filter(
      (listener) => listener !== callback
    );
  }

  public addDisconnectListener(callback: ConnectionCallback): void {
    this.disconnectListeners.push(callback);
  }

  public removeDisconnectListener(callback: ConnectionCallback): void {
    this.disconnectListeners = this.disconnectListeners.filter(
      (listener) => listener !== callback
    );
  }

  public addErrorListener(callback: ErrorCallback): void {
    this.errorListeners.push(callback);
  }

  public removeErrorListener(callback: ErrorCallback): void {
    this.errorListeners = this.errorListeners.filter(
      (listener) => listener !== callback
    );
  }

  public isConnected(): boolean {
    if (this.mockMode) {
      return true; // Mock modunda her zaman bağlı görünür
    }
    return !!this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  // WebSocket bağlantısının durumunu metin olarak döndür
  public getConnectionStatus(): string {
    if (this.mockMode || this.url.includes("mock.local")) {
      return "Bağlı (Mock Mod) - Gerçek veri yok";
    }

    if (!this.ws) {
      return "Bağlantı Yok";
    }

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return `Bağlanıyor... (${this.url})`;
      case WebSocket.OPEN:
        return `Bağlı (${this.url})`;
      case WebSocket.CLOSING:
        return "Kapanıyor...";
      case WebSocket.CLOSED:
        return `Bağlantı Kapalı (${this.reconnectAttempts}/${this.maxReconnectAttempts} deneme)`;
      default:
        return "Bilinmeyen Durum";
    }
  }

  // Yeniden bağlanma ayarlarını güncelle
  public updateReconnectSettings(maxAttempts: number, interval: number): void {
    this.maxReconnectAttempts = maxAttempts;
    this.reconnectInterval = interval;
    console.log(
      `Yeniden bağlantı ayarları güncellendi: ${maxAttempts} deneme, ${interval}ms aralık`
    );
  }

  // Bağlantı zaman aşımı süresini ayarla
  public setConnectionTimeout(timeout: number): void {
    this.connectionTimeout = timeout;
    console.log(
      `WebSocket bağlantı zaman aşımı: ${timeout}ms olarak ayarlandı`
    );
  }

  public setAutoReconnect(value: boolean): void {
    this.autoReconnect = value;
    console.log(`Otomatik yeniden bağlanma: ${value ? "etkin" : "devre dışı"}`);
  }

  private notifyMessageListeners(data: WebSocketIncomingMessage): void {
    this.messageListeners.forEach((listener) => listener(data));
  }

  private notifyConnectListeners(): void {
    this.connectListeners.forEach((listener) => listener());
  }

  private notifyDisconnectListeners(): void {
    this.disconnectListeners.forEach((listener) => listener());
  }

  private notifyErrorListeners(error: Event): void {
    this.errorListeners.forEach((listener) => listener(error));
  }
}

export default WebSocketService;
