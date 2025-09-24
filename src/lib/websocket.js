import { ethers } from 'ethers';
import {
  createAuthRequestMessage,
  createAuthVerifyMessageFromChallenge,
  createAuthVerifyMessageWithJWT,
  createGetChannelsMessage,
  createGetLedgerBalancesMessage,
  createGetConfigMessage,
  createAppSessionMessage,
  createCloseAppSessionMessage,
  parseAnyRPCResponse,
  RPCMethod,
} from '@erc7824/nitrolite';

/**
 * Enhanced WebSocket Service for Nitrolite ClearNode Communication
 * Based on the official Nitrolite documentation patterns
 */
class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.isAuthenticated = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 1000;
    this.statusListeners = new Set();
    this.messageListeners = new Set();
    this.requestMap = new Map(); // Track pending requests
    this.config = null;
    this.stateWallet = null;
    this.jwtToken = null;
    
    // Bind methods to maintain context
    this.handleOpen = this.handleOpen.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  /**
   * Connect to ClearNode with configuration
   */
  async connect(url, config) {
    console.log('🔗 Connecting to ClearNode:', url);
    
    this.config = config;
    this.stateWallet = config.stateWallet;
    
    // Check if we have a stored JWT token for reconnection
    this.jwtToken = localStorage.getItem('clearnode_jwt');
    
    if (this.socket) {
      this.socket.close();
    }

    this.notifyStatusChange('connecting');
    
    try {
      this.socket = new WebSocket(url);
      this.socket.onopen = this.handleOpen;
      this.socket.onmessage = this.handleMessage;
      this.socket.onerror = this.handleError;
      this.socket.onclose = this.handleClose;
      
      return new Promise((resolve, reject) => {
        this.connectResolve = resolve;
        this.connectReject = reject;
        
        // Set connection timeout
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('Connection timeout'));
          }
        }, 10000);
      });
    } catch (error) {
      console.error('❌ Connection failed:', error);
      this.notifyStatusChange('error', error);
      throw error;
    }
  }

  /**
   * Handle WebSocket connection opened
   */
  async handleOpen() {
    console.log('✅ WebSocket connected');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.reconnectInterval = 1000;
    this.notifyStatusChange('connected');

    try {
      // Try JWT reconnection first if we have a token
      if (this.jwtToken) {
        console.log('🔄 Attempting JWT reconnection');
        await this.authenticateWithJWT();
      } else {
        // Start fresh authentication flow
        console.log('🔐 Starting authentication flow');
        await this.startAuthentication();
      }
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      this.notifyStatusChange('auth_failed', error);
      if (this.connectReject) {
        this.connectReject(error);
      }
    }
  }

  /**
   * Start authentication flow with challenge-response
   */
  async startAuthentication() {
    if (!this.config || !this.stateWallet) {
      throw new Error('Missing configuration or state wallet');
    }

    // Store expire timestamp for consistency across auth flow
    this.authExpireTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour

    const authRequest = await createAuthRequestMessage({
      wallet: this.config.nitroConfig.appAddress || process.env.REACT_APP_NITROLITE_APP_ADDRESS,
      participant: await this.stateWallet.getAddress(),
      app_name: this.config.nitroConfig.appName || 'Line Crypto',
      expire: this.authExpireTimestamp,
      scope: this.config.nitroConfig.scope || 'console',
      application: this.config.nitroConfig.channelId || process.env.REACT_APP_NITROLITE_CHANNEL_ID,
      allowances: [],
    });

    console.log('📤 Sending auth request');
    this.socket.send(authRequest);
  }

  /**
   * Authenticate using stored JWT token
   */
  async authenticateWithJWT() {
    if (!this.jwtToken) {
      throw new Error('No JWT token available');
    }

    const authVerifyMsg = await createAuthVerifyMessageWithJWT(this.jwtToken);
    console.log('📤 Sending JWT authentication');
    this.socket.send(authVerifyMsg);
  }

  /**
   * Handle incoming WebSocket messages
   */
  async handleMessage(event) {
    try {
      const message = parseAnyRPCResponse(event.data);
      console.log('📥 Received message:', message.method, message);

      // Notify message listeners
      this.notifyMessageListeners(message);

      // Handle specific message types
      switch (message.method) {
        case RPCMethod.AuthChallenge:
          await this.handleAuthChallenge(message);
          break;
          
        case RPCMethod.AuthVerify:
          await this.handleAuthVerify(message);
          break;
          
        case RPCMethod.GetChannels:
          this.handleGetChannels(message);
          break;
          
        case RPCMethod.GetLedgerBalances:
          this.handleGetLedgerBalances(message);
          break;
          
        case RPCMethod.CreateAppSession:
          this.handleAppSessionCreated(message);
          break;
          
        case RPCMethod.CloseAppSession:
          this.handleAppSessionClosed(message);
          break;

        case RPCMethod.Transfer:
          this.handleTransfer(message);
          break;

        case 'BalanceUpdate':
          this.handleBalanceUpdate(message);
          break;
          
        case RPCMethod.Error:
          this.handleError(message);
          break;
          
        default:
          console.log('📋 Unhandled message type:', message.method);
      }

      // Handle pending request responses
      if (message.res && message.res[0]) {
        const requestId = message.res[0];
        const handler = this.requestMap.get(requestId);
        if (handler) {
          handler.resolve(message);
          this.requestMap.delete(requestId);
        }
      }

    } catch (error) {
      console.error('❌ Message handling error:', error);
      this.notifyStatusChange('error', error);
    }
  }

  /**
   * Handle authentication challenge
   */
  async handleAuthChallenge(message) {
    console.log('🔐 Handling auth challenge');
    
    try {
      // Create message signer function
      const messageSigner = async (payload) => {
        const messageStr = JSON.stringify(payload);
        const digest = ethers.utils.id(messageStr);
        const sigParts = await this.stateWallet._signingKey().signDigest(digest);
        return ethers.utils.joinSignature(sigParts);
      };

      const challenge = message.params.challengeMessage;
      const authVerify = await createAuthVerifyMessageFromChallenge(
        messageSigner,
        challenge
      );

      console.log('📤 Sending auth verification');
      this.socket.send(authVerify);
    } catch (error) {
      console.error('❌ Auth challenge failed:', error);
      throw error;
    }
  }

  /**
   * Handle authentication verification result
   */
  async handleAuthVerify(message) {
    console.log('🔐 Authentication result:', message.params);
    
    if (message.params.success) {
      this.isAuthenticated = true;
      
      // Store JWT token for future reconnections
      if (message.params.jwtToken) {
        this.jwtToken = message.params.jwtToken;
        localStorage.setItem('clearnode_jwt', this.jwtToken);
      }
      
      console.log('✅ Authentication successful');
      this.notifyStatusChange('authenticated');
      
      if (this.config.onAuthResult) {
        this.config.onAuthResult({ type: 'auth_success', data: message.params });
      }
      
      if (this.connectResolve) {
        this.connectResolve();
      }
    } else {
      this.isAuthenticated = false;
      console.error('❌ Authentication failed');
      this.notifyStatusChange('auth_failed');
      
      if (this.config.onAuthResult) {
        this.config.onAuthResult({ type: 'auth_failed', data: message.params });
      }
      
      if (this.connectReject) {
        this.connectReject(new Error('Authentication failed'));
      }
    }
  }

  /**
   * Handle channels data
   */
  handleGetChannels(message) {
    console.log('📋 Received channels:', message.params);
    // The channels data is already in the correct format from parseAnyRPCResponse
  }

  /**
   * Handle ledger balances
   */
  handleGetLedgerBalances(message) {
    console.log('💰 Received ledger balances:', message.params);
  }

  /**
   * Handle app session created
   */
  handleAppSessionCreated(message) {
    console.log('🎮 App session created:', message.params);
  }

  /**
   * Handle app session closed
   */
  handleAppSessionClosed(message) {
    console.log('🔚 App session closed:', message.params);
  }

  /**
   * Handle transfer messages
   */
  handleTransfer(message) {
    console.log('💸 Transfer processed:', message.params);
  }

  /**
   * Handle balance updates
   */
  handleBalanceUpdate(message) {
    console.log('💰 Balance updated:', message.params);
  }

  /**
   * Handle WebSocket errors
   */
  handleError(error) {
    console.error('❌ WebSocket error:', error);
    this.notifyStatusChange('error', error);
  }

  /**
   * Handle WebSocket connection closed
   */
  handleClose(event) {
    console.log('🔌 WebSocket closed:', event.code, event.reason);
    this.isConnected = false;
    this.isAuthenticated = false;
    this.notifyStatusChange('disconnected');

    // Clean up pending requests
    for (const [requestId, handler] of this.requestMap.entries()) {
      handler.reject(new Error('Connection closed'));
      this.requestMap.delete(requestId);
    }

    // Attempt reconnection if not manually closed
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.attemptReconnect();
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  attemptReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Reconnecting in ${delay}ms (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    this.notifyStatusChange('reconnecting', { attempt: this.reconnectAttempts, delay });

    setTimeout(() => {
      if (this.config) {
        this.connect(this.socket.url, this.config).catch(error => {
          console.error(`❌ Reconnection attempt ${this.reconnectAttempts} failed:`, error);
        });
      }
    }, delay);
  }

  /**
   * Send a request and wait for response
   */
  async sendRequest(method, params = [], timeout = 30000) {
    if (!this.isConnected || !this.isAuthenticated) {
      throw new Error('Not connected or authenticated');
    }

    const requestId = Date.now().toString();
    const timestamp = Math.floor(Date.now() / 1000);
    const requestData = [requestId, method, params, timestamp];
    const request = { req: requestData };

    // Sign the request
    const messageSigner = async (payload) => {
      const messageStr = JSON.stringify(payload);
      const digest = ethers.utils.id(messageStr);
      const sigParts = await this.stateWallet._signingKey().signDigest(digest);
      return ethers.utils.joinSignature(sigParts);
    };

    const signature = await messageSigner(request);
    request.sig = [signature];

    return new Promise((resolve, reject) => {
      // Set up response handler
      const timeoutId = setTimeout(() => {
        this.requestMap.delete(requestId);
        reject(new Error(`Request timeout for ${method}`));
      }, timeout);

      this.requestMap.set(requestId, {
        resolve: (response) => {
          clearTimeout(timeoutId);
          resolve(response);
        },
        reject,
        timeout: timeoutId
      });

      // Send the request
      try {
        this.socket.send(JSON.stringify(request));
      } catch (error) {
        clearTimeout(timeoutId);
        this.requestMap.delete(requestId);
        reject(error);
      }
    });
  }

  /**
   * Get channels using the SDK helper
   */
  async getChannels() {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      const messageSigner = async (payload) => {
        const messageStr = JSON.stringify(payload);
        const digest = ethers.utils.id(messageStr);
        const sigParts = await this.stateWallet._signingKey().signDigest(digest);
        return ethers.utils.joinSignature(sigParts);
      };

      const message = await createGetChannelsMessage(
        messageSigner,
        this.config.nitroConfig.appAddress || process.env.REACT_APP_NITROLITE_APP_ADDRESS
      );

      return new Promise((resolve, reject) => {
        const parsed = JSON.parse(message);
        const requestId = parsed.req[0];

        const timeoutId = setTimeout(() => {
          this.requestMap.delete(requestId);
          reject(new Error('Get channels timeout'));
        }, 30000);

        this.requestMap.set(requestId, {
          resolve: (response) => {
            clearTimeout(timeoutId);
            resolve(response);
          },
          reject,
          timeout: timeoutId
        });

        this.socket.send(message);
      });
    } catch (error) {
      console.error('❌ Get channels failed:', error);
      throw error;
    }
  }

  /**
   * Get ledger balances for a participant
   */
  async getLedgerBalances(participant) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      const messageSigner = async (payload) => {
        const messageStr = JSON.stringify(payload);
        const digest = ethers.utils.id(messageStr);
        const sigParts = await this.stateWallet._signingKey().signDigest(digest);
        return ethers.utils.joinSignature(sigParts);
      };

      const message = await createGetLedgerBalancesMessage(messageSigner, participant);

      return new Promise((resolve, reject) => {
        const parsed = JSON.parse(message);
        const requestId = parsed.req[0];

        const timeoutId = setTimeout(() => {
          this.requestMap.delete(requestId);
          reject(new Error('Get ledger balances timeout'));
        }, 30000);

        this.requestMap.set(requestId, {
          resolve: (response) => {
            clearTimeout(timeoutId);
            resolve(response);
          },
          reject,
          timeout: timeoutId
        });

        this.socket.send(message);
      });
    } catch (error) {
      console.error('❌ Get ledger balances failed:', error);
      throw error;
    }
  }

  /**
   * Create an application session
   */
  async createAppSession(sessionConfig) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      const messageSigner = async (payload) => {
        const messageStr = JSON.stringify(payload);
        const digest = ethers.utils.id(messageStr);
        const sigParts = await this.stateWallet._signingKey().signDigest(digest);
        return ethers.utils.joinSignature(sigParts);
      };

      const message = await createAppSessionMessage(messageSigner, [sessionConfig]);

      return new Promise((resolve, reject) => {
        const parsed = JSON.parse(message);
        const requestId = parsed.req[0];

        const timeoutId = setTimeout(() => {
          this.requestMap.delete(requestId);
          reject(new Error('Create app session timeout'));
        }, 30000);

        this.requestMap.set(requestId, {
          resolve: (response) => {
            clearTimeout(timeoutId);
            resolve(response);
          },
          reject,
          timeout: timeoutId
        });

        this.socket.send(message);
      });
    } catch (error) {
      console.error('❌ Create app session failed:', error);
      throw error;
    }
  }

  /**
   * Close an application session
   */
  async closeAppSession(closeConfig) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      const messageSigner = async (payload) => {
        const messageStr = JSON.stringify(payload);
        const digest = ethers.utils.id(messageStr);
        const sigParts = await this.stateWallet._signingKey().signDigest(digest);
        return ethers.utils.joinSignature(sigParts);
      };

      const message = await createCloseAppSessionMessage(messageSigner, [closeConfig]);

      return new Promise((resolve, reject) => {
        const parsed = JSON.parse(message);
        const requestId = parsed.req[0];

        const timeoutId = setTimeout(() => {
          this.requestMap.delete(requestId);
          reject(new Error('Close app session timeout'));
        }, 30000);

        this.requestMap.set(requestId, {
          resolve: (response) => {
            clearTimeout(timeoutId);
            resolve(response);
          },
          reject,
          timeout: timeoutId
        });

        this.socket.send(message);
      });
    } catch (error) {
      console.error('❌ Close app session failed:', error);
      throw error;
    }
  }

  /**
   * Send a raw message (for pre-formatted messages like transfers)
   */
  sendRawMessage(message) {
    if (!this.isConnected) {
      throw new Error('Not connected');
    }

    try {
      this.socket.send(message);
      return true;
    } catch (error) {
      console.error('❌ Failed to send raw message:', error);
      throw error;
    }
  }

  /**
   * Disconnect from ClearNode
   */
  disconnect() {
    console.log('🔌 Disconnecting from ClearNode');
    
    // Clear stored JWT token
    localStorage.removeItem('clearnode_jwt');
    this.jwtToken = null;
    
    // Clear reconnection attempts
    this.reconnectAttempts = this.maxReconnectAttempts;
    
    if (this.socket) {
      this.socket.close(1000, 'User initiated disconnect');
      this.socket = null;
    }
    
    this.isConnected = false;
    this.isAuthenticated = false;
    this.notifyStatusChange('disconnected');
  }

  /**
   * Add status change listener
   */
  addStatusListener(listener) {
    this.statusListeners.add(listener);
  }

  /**
   * Remove status change listener
   */
  removeStatusListener(listener) {
    this.statusListeners.delete(listener);
  }

  /**
   * Add message listener
   */
  addMessageListener(listener) {
    this.messageListeners.add(listener);
  }

  /**
   * Remove message listener
   */
  removeMessageListener(listener) {
    this.messageListeners.delete(listener);
  }

  /**
   * Notify status change listeners
   */
  notifyStatusChange(status, data = null) {
    console.log(`📊 Status changed: ${status}`, data);
    for (const listener of this.statusListeners) {
      try {
        listener(status, data);
      } catch (error) {
        console.error('❌ Status listener error:', error);
      }
    }
  }

  /**
   * Notify message listeners
   */
  notifyMessageListeners(message) {
    for (const listener of this.messageListeners) {
      try {
        listener(message);
      } catch (error) {
        console.error('❌ Message listener error:', error);
      }
    }
  }

  /**
   * Get current connection status
   */
  getStatus() {
    if (!this.socket) return 'disconnected';
    if (this.isAuthenticated) return 'authenticated';
    if (this.isConnected) return 'connected';
    return 'connecting';
  }
}

// Create and export singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService;
