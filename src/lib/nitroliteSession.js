import { webSocketService } from './websocket';

/**
 * Nitrolite Session Manager
 * Handles application session lifecycle and state management
 */
class NitroliteSessionManager {
  constructor() {
    this.activeSessions = new Map(); // sessionId -> session data
    this.sessionListeners = new Set();
    this.isInitialized = false;
  }

  /**
   * Initialize the session manager
   */
  initialize() {
    if (this.isInitialized) return;

    // Listen to WebSocket messages for session updates
    webSocketService.addMessageListener(this.handleMessage.bind(this));
    this.isInitialized = true;
    console.log('🎮 Nitrolite Session Manager initialized');
  }

  /**
   * Handle incoming WebSocket messages related to sessions
   */
  handleMessage(message) {
    switch (message.method) {
      case 'create_app_session':
        this.handleSessionCreated(message);
        break;
      case 'close_app_session':
        this.handleSessionClosed(message);
        break;
      case 'session_update':
        this.handleSessionUpdate(message);
        break;
    }
  }

  /**
   * Create a new application session
   */
  async createSession(config) {
    console.log('🎮 Creating app session with config:', config);

    try {
      // Validate required parameters
      if (!config.participants || config.participants.length < 2) {
        throw new Error('At least 2 participants required');
      }

      if (!config.allocations || config.allocations.length === 0) {
        throw new Error('Allocations are required');
      }

      // Create session configuration
      const sessionConfig = {
        definition: {
          protocol: config.protocol || 'nitroliterpc',
          participants: config.participants,
          weights: config.weights || config.participants.map(() => Math.floor(100 / config.participants.length)),
          quorum: config.quorum || 100,
          challenge: config.challenge || 0,
          nonce: config.nonce || Date.now(),
        },
        allocations: config.allocations,
      };

      // Send session creation request via WebSocket
      const response = await webSocketService.createAppSession(sessionConfig);
      
      // Extract session ID from response
      const sessionData = response.params || response.res?.[2]?.[0];
      if (!sessionData?.app_session_id) {
        throw new Error('No session ID received from response');
      }

      const sessionId = sessionData.app_session_id;

      // Store session locally
      const session = {
        id: sessionId,
        status: sessionData.status || 'open',
        config: sessionConfig,
        createdAt: new Date(),
        participants: config.participants,
        allocations: config.allocations,
      };

      this.activeSessions.set(sessionId, session);
      this.notifySessionListeners('session_created', session);

      console.log('✅ Session created successfully:', sessionId);
      return session;

    } catch (error) {
      console.error('❌ Failed to create session:', error);
      this.notifySessionListeners('session_error', { type: 'create_failed', error });
      throw error;
    }
  }

  /**
   * Close an application session
   */
  async closeSession(sessionId, finalAllocations) {
    console.log('🔚 Closing session:', sessionId);

    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // Use provided allocations or fall back to current allocations
      const allocations = finalAllocations || session.allocations;

      const closeConfig = {
        app_session_id: sessionId,
        allocations: allocations,
      };

      // Send close request via WebSocket
      const response = await webSocketService.closeAppSession(closeConfig);

      // Update session status
      session.status = 'closed';
      session.closedAt = new Date();
      session.finalAllocations = allocations;

      this.notifySessionListeners('session_closed', session);

      console.log('✅ Session closed successfully:', sessionId);
      return response;

    } catch (error) {
      console.error('❌ Failed to close session:', error);
      this.notifySessionListeners('session_error', { type: 'close_failed', error, sessionId });
      throw error;
    }
  }

  /**
   * Get session by ID
   */
  getSession(sessionId) {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Get all active sessions
   */
  getActiveSessions() {
    return Array.from(this.activeSessions.values()).filter(session => session.status === 'open');
  }

  /**
   * Get all sessions
   */
  getAllSessions() {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Handle session created message
   */
  handleSessionCreated(message) {
    console.log('📥 Session created message:', message);
    
    const sessionData = message.params || message.res?.[2]?.[0];
    if (sessionData?.app_session_id) {
      const session = this.activeSessions.get(sessionData.app_session_id);
      if (session) {
        session.status = sessionData.status || 'open';
        this.notifySessionListeners('session_updated', session);
      }
    }
  }

  /**
   * Handle session closed message
   */
  handleSessionClosed(message) {
    console.log('📥 Session closed message:', message);
    
    const sessionData = message.params || message.res?.[2]?.[0];
    if (sessionData?.app_session_id) {
      const session = this.activeSessions.get(sessionData.app_session_id);
      if (session) {
        session.status = 'closed';
        session.closedAt = new Date();
        this.notifySessionListeners('session_closed', session);
      }
    }
  }

  /**
   * Handle session update message
   */
  handleSessionUpdate(message) {
    console.log('📥 Session update message:', message);
    
    const sessionData = message.params;
    if (sessionData?.app_session_id) {
      const session = this.activeSessions.get(sessionData.app_session_id);
      if (session) {
        // Update session with new data
        Object.assign(session, sessionData);
        this.notifySessionListeners('session_updated', session);
      }
    }
  }

  /**
   * Add session event listener
   */
  addSessionListener(listener) {
    this.sessionListeners.add(listener);
  }

  /**
   * Remove session event listener
   */
  removeSessionListener(listener) {
    this.sessionListeners.delete(listener);
  }

  /**
   * Notify session listeners
   */
  notifySessionListeners(event, data) {
    console.log(`📊 Session event: ${event}`, data);
    for (const listener of this.sessionListeners) {
      try {
        listener(event, data);
      } catch (error) {
        console.error('❌ Session listener error:', error);
      }
    }
  }

  /**
   * Clear all sessions (for cleanup)
   */
  clearSessions() {
    this.activeSessions.clear();
    this.notifySessionListeners('sessions_cleared');
  }

  /**
   * Get session statistics
   */
  getStats() {
    const sessions = this.getAllSessions();
    return {
      total: sessions.length,
      active: sessions.filter(s => s.status === 'open').length,
      closed: sessions.filter(s => s.status === 'closed').length,
    };
  }
}

// Helper functions for common session patterns

/**
 * Create a simple two-player session
 */
export function createTwoPlayerSession(participantA, participantB, amount, asset = 'usdc') {
  return {
    participants: [participantA, participantB],
    weights: [100, 0], // First player has control
    allocations: [
      {
        participant: participantA,
        asset: asset,
        amount: amount,
      },
      {
        participant: participantB,
        asset: asset,
        amount: '0',
      },
    ],
  };
}

/**
 * Create a gaming session with server control
 */
export function createGameSession(participants, serverAddress) {
  const allParticipants = [...participants, serverAddress];
  const weights = [...participants.map(() => 0), 100]; // Server has full control

  return {
    participants: allParticipants,
    weights: weights,
    quorum: 100,
    allocations: allParticipants.map(participant => ({
      participant,
      asset: 'usdc',
      amount: '0',
    })),
  };
}

/**
 * Create equal partnership session
 */
export function createEqualPartnershipSession(participants, totalAmount, asset = 'usdc') {
  const equalAmount = Math.floor(parseInt(totalAmount) / participants.length).toString();
  
  return {
    participants,
    weights: participants.map(() => Math.floor(100 / participants.length)),
    quorum: 51, // Majority consensus
    allocations: participants.map(participant => ({
      participant,
      asset: asset,
      amount: equalAmount,
    })),
  };
}

// Create and export singleton instance
export const nitroliteSessionManager = new NitroliteSessionManager();
export default nitroliteSessionManager;
