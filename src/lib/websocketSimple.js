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
    // Reconnection/heartbeat
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.baseReconnectMs = 3000; // per docs, start at 3s
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
    this.heartbeatMs = 30000; // send heartbeat every 30s (hook may also do app-level heartbeat)
    this.intentionalClose = false;
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
    this.intentionalClose = false;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('🔗 WebSocket Connected successfully to:', this.url);
      this.updateStatus(WsStatus.CONNECTED);
      // reset reconnection attempts
      this.reconnectAttempts = 0;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      // start lightweight heartbeat (no server pong expected; app-level heartbeats run in hook)
      this.startHeartbeat();
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
      this.stopHeartbeat();
      if (!this.intentionalClose) {
        this.attemptReconnect();
      }
    };
    this.socket.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      this.updateStatus(WsStatus.DISCONNECTED);
      this.stopHeartbeat();
      if (!this.intentionalClose) {
        this.attemptReconnect();
      }
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
    this.intentionalClose = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      try {
        this.socket.close(1000, 'User initiated disconnect');
      } catch (_) {}
      this.socket = null;
    }
    this.updateStatus(WsStatus.DISCONNECTED);
  }

  // Internal helpers
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Maximum reconnection attempts reached');
      return;
    }
    this.reconnectAttempts += 1;
    const base = this.baseReconnectMs * Math.pow(2, this.reconnectAttempts - 1);
    const jitter = Math.floor(Math.random() * 500);
    const delay = base + jitter;
    console.log(`⏳ Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      // Send a lightweight keepalive frame; this is best-effort
      try {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify({ type: 'ping', t: Date.now() }));
        }
      } catch (_) {}
    }, this.heartbeatMs);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;
