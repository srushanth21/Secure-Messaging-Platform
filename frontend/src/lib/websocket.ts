type MessageHandler = (data: any) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string = '';
  private handlers: Set<MessageHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private isIntentionalClose = false;

  connect(token: string) {
    const wsBase = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    const newUrl = `${wsBase}/ws/${token}`;

    if (this.ws?.readyState === WebSocket.OPEN) {
      if (this.url === newUrl) return; // Already connected to correct URL
      this.disconnect(); // Token changed, disconnect old session
    }

    this.url = newUrl;
    this.isIntentionalClose = false;
    this.initWs();
  }

  private initWs() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handlers.forEach(handler => handler(data));
      } catch (e) {
        console.error('Failed to parse WS message', e);
      }
    };

    this.ws.onclose = () => {
      if (!this.isIntentionalClose && this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.initWs();
        }, 1000 * Math.pow(2, this.reconnectAttempts));
      }
    };
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  onMessage(handler: MessageHandler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  disconnect() {
    this.isIntentionalClose = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsClient = new WebSocketClient();
