import { MatchFoundPayload, CoinDeductionEvent } from '@tresno/shared';
import { recordWebSocketEvent } from '../chucker/chuckerInterceptor';

type MessageHandler = (data: any) => void;

class SocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private listeners: Map<string, Set<MessageHandler>> = new Map();
  private isConnected = false;
  private isManualDisconnect = false;
  private reconnectTimer: any = null;

  constructor() {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    this.url = `ws://${host}:4000/ws`;
  }

  connect(userId: string, nickname: string) {
    this.isManualDisconnect = false;
    clearTimeout(this.reconnectTimer);
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[Socket] Connected to Backend Signaling at:', this.url);
        this.isConnected = true;
        recordWebSocketEvent('OPEN', 'WS_CONNECTED', { url: this.url }, this.url);
        // Kirim identitas user ke backend
        this.send('AUTH', {
          userId,
          userSummary: {
            id: userId,
            nickname,
            gender: 'male',
            level: 1,
          },
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const { type, payload } = JSON.parse(event.data);
          console.log(`[Socket] Received event: ${type}`, payload);
          recordWebSocketEvent('RECV', type, payload, this.url);
          const callbacks = this.listeners.get(type);
          if (callbacks) {
            callbacks.forEach((cb) => cb(payload));
          }
        } catch (err) {
          console.error('[Socket] Failed to parse message:', err);
          recordWebSocketEvent('ERROR', 'PARSE_ERROR', { error: String(err), raw: event.data }, this.url);
        }
      };

      this.ws.onclose = () => {
        console.log('[Socket] Disconnected from Backend Signaling');
        this.isConnected = false;
        recordWebSocketEvent('CLOSE', 'WS_DISCONNECTED', { url: this.url }, this.url);
        // Auto-reconnect hanya jika bukan manual disconnect
        if (!this.isManualDisconnect) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = setTimeout(() => {
            this.connect(userId, nickname);
          }, 3000);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[Socket] Error on WebSocket:', err);
        recordWebSocketEvent('ERROR', 'WS_ERROR', { error: String(err) }, this.url);
      };
    } catch (e) {
      console.warn('[Socket] Connection failed:', e);
      recordWebSocketEvent('ERROR', 'CONNECT_FAILED', { error: String(e) }, this.url);
    }
  }

  send(type: string, payload: any) {
    recordWebSocketEvent('SEND', type, payload, this.url);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('[Socket] Cannot send, socket is not open:', type);
    }
  }

  on(type: string, handler: MessageHandler) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler);

    return () => {
      this.listeners.get(type)?.delete(handler);
    };
  }

  disconnect() {
    this.isManualDisconnect = true;
    clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}

export const socketService = new SocketService();
