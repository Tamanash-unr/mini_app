/**
 * Simplified WebSocket Service matching reference implementation pattern
 * Based on Chapter 2 reference documentation
 */

export const WsStatus = {
  CONNECTING: 'Connecting',
  CONNECTED: 'Connected', 
  DISCONNECTED: 'Disconnected'
};

class WebSocketService {
  constructor() {
    this.socket = null;
    this.status = WsStatus.DISCONNECTED;
    this.statusListeners = new Set();
    this.messageListeners = new Set();
    this.messageQueue = [];
    this.requestId = 1;
  }

  connect() {
    if (this.socket && this.socket.readyState < 2) return;
    
    const wsUrl = process.env.REACT_APP_CLEARNODE_WS_URL || 'wss://clearnet.yellow.com/ws';
    if (!wsUrl) {
      console.error('REACT_APP_CLEARNODE_WS_URL is not set');
      this.updateStatus(WsStatus.DISCONNECTED);
      return;
    }

    this.updateStatus(WsStatus.CONNECTING);
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('🔗 WebSocket Connected successfully to:', this.url);
      this.updateStatus(WsStatus.CONNECTED);
      this.messageQueue.forEach((msg) => this.socket?.send(msg));
      this.messageQueue = [];
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.messageListeners.forEach((listener) => listener(data));
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    this.socket.onclose = (event) => {
      console.log('🔌 WebSocket closed:', event.code, event.reason);
      this.updateStatus(WsStatus.DISCONNECTED);
    };
    this.socket.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      this.updateStatus(WsStatus.DISCONNECTED);
    };
  }

  send(payload) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(payload);
    } else {
      this.messageQueue.push(payload);
    }
  }

  sendMethod(method, params) {
    const payload = JSON.stringify({ 
      jsonrpc: '2.0', 
      id: this.requestId++, 
      method, 
      params 
    });
    this.send(payload);
  }

  updateStatus(newStatus) {
    this.status = newStatus;
    this.statusListeners.forEach((listener) => listener(this.status));
  }

  addStatusListener(listener) {
    this.statusListeners.add(listener);
    listener(this.status); // Immediately call with current status
  }

  removeStatusListener(listener) {
    this.statusListeners.delete(listener);
  }

  addMessageListener(listener) {
    this.messageListeners.add(listener);
  }

  removeMessageListener(listener) {
    this.messageListeners.delete(listener);
  }

  getStatus() {
    return this.status;
  }

  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'User initiated disconnect');
      this.socket = null;
    }
    this.updateStatus(WsStatus.DISCONNECTED);
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;
