import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createAuthRequestMessage,
  createAuthVerifyMessage,
  createEIP712AuthMessageSigner,
  createGetChannelsMessage,
  createGetLedgerBalancesMessage,
  createGetConfigMessage,
  createECDSAMessageSigner,
  parseAnyRPCResponse,
  RPCMethod,
} from '@erc7824/nitrolite';
import {
  setConnectionStatus,
  setAuthenticated,
  setError,
  setChannels,
} from '../lib/redux/clearNodeSlice';
import { webSocketService, WsStatus } from '../lib/websocketSimple';
import { nitroliteSessionManager } from '../lib/nitroliteSession';
import { 
  generateSessionKey, 
  getStoredSessionKey, 
  storeSessionKey, 
  removeSessionKey,
  storeJWT,
  removeJWT,
  getAuthDomain,
  AUTH_SCOPE,
  APP_NAME,
  SESSION_DURATION 
} from '../lib/sessionUtils';

// New: Create App Session helpers
import {
  createAppSessionMessage,
  RPCMethod as NitroRPCMethod,
} from '@erc7824/nitrolite';

function useClearNodeConnection(clearNodeUrl, walletClient) {
  const dispatch = useDispatch();
  const { connectionStatus, isAuthenticated, error } = useSelector((state) => state.clearNode);

  // Chapter 3: Authentication state
  const [sessionKey, setSessionKey] = useState(null);
  const [isAuthAttempted, setIsAuthAttempted] = useState(false);
  const [sessionExpireTimestamp, setSessionExpireTimestamp] = useState('');
  const [authRetryCount, setAuthRetryCount] = useState(0);
  const MAX_AUTH_RETRIES = 3;
  
  const isInitialized = useRef(false);

  // Chapter 2: Initialize WebSocket connection (runs once on mount)
  useEffect(() => {
    if (!isInitialized.current) {
      // Get or generate session key on startup
      const existingSessionKey = getStoredSessionKey();
      if (existingSessionKey) {
        setSessionKey(existingSessionKey);
      } else {
        const newSessionKey = generateSessionKey();
        storeSessionKey(newSessionKey);
        setSessionKey(newSessionKey);
      }

      // Subscribe to status updates from our service
      webSocketService.addStatusListener((status) => {
        console.log('🔄 WebSocket status changed:', status);
        
        switch (status) {
          case WsStatus.CONNECTING:
            dispatch(setConnectionStatus('connecting'));
            break;
          case WsStatus.CONNECTED:
            dispatch(setConnectionStatus('connected'));
            break;
          case WsStatus.DISCONNECTED:
            dispatch(setConnectionStatus('disconnected'));
            dispatch(setAuthenticated(false));
            dispatch(setChannels({ channels: [] }));
            break;
        }
      });

      // Tell the service to connect
      webSocketService.connect();

      isInitialized.current = true;
    }

    // On cleanup, remove the listener
    return () => {
      if (isInitialized.current) {
        webSocketService.removeStatusListener(() => {});
      }
    };
  }, [dispatch]);

  // Chapter 3: Auto-trigger authentication when conditions are met
  useEffect(() => {
    if (
      walletClient?.account &&
      sessionKey &&
      connectionStatus === 'connected' &&
      !isAuthenticated &&
      !isAuthAttempted &&
      authRetryCount < MAX_AUTH_RETRIES
    ) {
      setIsAuthAttempted(true);
      console.log(`🔐 Starting authentication attempt ${authRetryCount + 1}/${MAX_AUTH_RETRIES}`);

      // Generate fresh timestamp for this auth attempt
      const expireTimestamp = String(Math.floor(Date.now() / 1000) + SESSION_DURATION);
      setSessionExpireTimestamp(expireTimestamp);

      // Chapter 3 docs: use address/session_key in auth_request
      const authParams = {
        address: walletClient.account.address,
        session_key: sessionKey.address,
        app_name: APP_NAME,
        expire: expireTimestamp,
        scope: AUTH_SCOPE,
        application: walletClient.account.address,
        allowances: [],
      };

      console.log('🔐 Starting authentication with params:', authParams);

      createAuthRequestMessage(authParams).then((payload) => {
        console.log('📤 Sending auth request payload:', payload);
        webSocketService.send(payload);
      }).catch((error) => {
        console.error('❌ Auth request creation failed:', error);
        dispatch(setError(`Auth request creation failed: ${error.message}`));
        setIsAuthAttempted(false);
        setAuthRetryCount(prev => prev + 1);
      });
    }
  }, [walletClient, sessionKey, connectionStatus, isAuthenticated, isAuthAttempted, authRetryCount]);

  // Chapter 3: Handle server messages for authentication
  useEffect(() => {
    const handleMessage = async (data) => {
      console.log('📨 Received raw message:', data);
      const response = parseAnyRPCResponse(JSON.stringify(data));
      console.log('📋 Parsed message:', response);

      // Handle auth challenge
      if (
        response.method === RPCMethod.AuthChallenge &&
        walletClient &&
        sessionKey &&
        walletClient.account &&
        sessionExpireTimestamp
      ) {
        console.log('🔐 Received auth challenge:', response.params);
      console.log('🔐 Challenge message structure:', response);
        // Chapter 3 docs: EIP-712 signer uses scope, application, participant, expire, allowances
        const authParams = {
          scope: AUTH_SCOPE,
          application: walletClient.account.address,
          participant: sessionKey.address,
          expire: sessionExpireTimestamp,
          allowances: [],
        };

        const eip712Signer = createEIP712AuthMessageSigner(walletClient, authParams, getAuthDomain());

        try {
          console.log('🔐 Creating EIP-712 signer with params:', authParams);
          console.log('🔐 Challenge response structure:', JSON.stringify(response, null, 2));

          // Chapter 3 docs: createAuthVerifyMessage(eip712Signer, challengeResponse)
          const authVerifyPayload = await createAuthVerifyMessage(
            eip712Signer,
            response
          );
          console.log('📤 Sending auth verify payload:', authVerifyPayload);
          webSocketService.send(authVerifyPayload);
        } catch (error) {
          console.error('❌ Signature creation failed:', error);
          dispatch(setError(`Signature creation failed: ${error.message}`));
          setIsAuthAttempted(false);
          setAuthRetryCount(prev => prev + 1);
        }
      }

      // Handle auth success
      if (response.method === RPCMethod.AuthVerify && response.params?.success) {
        console.log('✅ Authentication successful!', response.params);
        dispatch(setAuthenticated(true));
        if (response.params.jwtToken) {
          console.log('🔑 Storing JWT token');
          storeJWT(response.params.jwtToken);
        }
        // Note: Do NOT call getChannels() here with a captured stale closure.
        // A dedicated effect below will react to isAuthenticated=true and call it.
      }

      // Handle errors
      if (response.method === RPCMethod.Error) {
        console.error('❌ Authentication error:', response.params);
        removeJWT();
        removeSessionKey();
        dispatch(setError(`Authentication failed: ${response.params.error}`));

        // Only reset auth attempt if we haven't reached max retries
        if (authRetryCount < MAX_AUTH_RETRIES) {
          setIsAuthAttempted(false);
          setAuthRetryCount(prev => prev + 1);
        }
      }

      // Handle channels
      if (response.method === RPCMethod.GetChannels) {
        console.log('📋 Processing channels data:', response.params);
        
        if (response.params && response.params.channels) {
          const safeChannels = response.params.channels.map((ch) => ({
            ...ch,
            amount: ch.amount?.toString() || '0',
            createdAt: ch.createdAt ? new Date(ch.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: ch.updatedAt ? new Date(ch.updatedAt).toISOString() : new Date().toISOString()
          }));

          dispatch(setChannels({ 
            ...response.params, 
            channels: safeChannels 
          }));
        }
      }
    };

    webSocketService.addMessageListener(handleMessage);
    return () => webSocketService.removeMessageListener(handleMessage);
  }, [walletClient, sessionKey, sessionExpireTimestamp, dispatch]);

  // Connect function (simplified)
  const connect = useCallback(async () => {
    console.log("🔗 Connect called - WebSocket should already be connected");
    return connectionStatus === 'connected';
  }, [connectionStatus]);

  // Disconnect function
  const disconnect = useCallback(() => {
    console.log('🔌 Disconnect called');
    webSocketService.disconnect();
  }, []);

  // Chapter 4: Balance fetching with session key signer
  const getLedgerBalances = useCallback(async (participant) => {
    if (!isAuthenticated || !sessionKey) {
      throw new Error('Please authenticate first');
    }

    try {
      console.log('💰 Fetching ledger balances for:', participant);
      
      // Create session signer
      const sessionSigner = createECDSAMessageSigner(sessionKey.privateKey);
      
      // Create signed request
      const getBalancesPayload = await createGetLedgerBalancesMessage(sessionSigner, participant);
      webSocketService.send(getBalancesPayload);
      
      console.log('✅ Balance request sent');
      return true;
    } catch (error) {
      console.error('❌ Failed to get ledger balances:', error);
      dispatch(setError(`Failed to get ledger balances: ${error.message}`));
      throw error;
    }
  }, [isAuthenticated, sessionKey, dispatch]);

  // Simple channel fetching
  const getChannels = useCallback(async () => {
    if (!isAuthenticated || !sessionKey) {
      throw new Error('Please authenticate first');
    }

    try {
      console.log('📋 Fetching channels...');
      
      // Create session signer
      const sessionSigner = createECDSAMessageSigner(sessionKey.privateKey);
      
      // Create signed request
      const getChannelsPayload = await createGetChannelsMessage(sessionSigner);
      webSocketService.send(getChannelsPayload);
      
      console.log('✅ Channels request sent');
      return true;
    } catch (error) {
      console.error('❌ Failed to get channels:', error);
      dispatch(setError(`Failed to get channels: ${error.message}`));
      throw error;
    }
  }, [isAuthenticated, sessionKey, dispatch]);

  // Create an application session (based on docs and example API)
  const createAppSession = useCallback(
    async ({ participants, weights, quorum = 100, protocol = 'nitroliterpc', allocations, session_data }) => {
      if (!isAuthenticated || !sessionKey) {
        throw new Error('Please authenticate first');
      }

      try {
        console.log('🎮 Creating app session…');

        // Validate inputs
        if (!participants || participants.length < 2) {
          throw new Error('At least two participants are required');
        }
        if (!allocations || allocations.length === 0) {
          throw new Error('Allocations are required');
        }

        const definition = {
          protocol,
          participants,
          weights: weights && weights.length === participants.length ? weights : new Array(participants.length).fill(0).map((_, i) => (i === 0 ? 100 : 0)),
          quorum,
          challenge: 0,
          nonce: Date.now(),
        };

        const sessionSigner = createECDSAMessageSigner(sessionKey.privateKey);

        // Updated: According to new API structure, pass params directly, not as array
        const params = {
          definition,
          allocations,
          ...(session_data ? { session_data } : {}),
        };

        // Build the signed message
        const payload = await createAppSessionMessage(sessionSigner, params);
        console.log('📤 Sending create_app_session payload');

        // Return a promise and resolve when the corresponding response arrives
        return await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            webSocketService.removeMessageListener(handleOnce);
            reject(new Error('App session creation timeout'));
          }, 15000);

          const handleOnce = (data) => {
            try {
              const resp = parseAnyRPCResponse(JSON.stringify(data));
              if (resp.method === NitroRPCMethod.CreateAppSession) {
                clearTimeout(timeoutId);
                webSocketService.removeMessageListener(handleOnce);
                console.log('✅ App session created:', resp.params);
                // According to new API, response should be directly in params, not wrapped in array
                resolve(resp.params);
              }
              if (resp.method === NitroRPCMethod.Error) {
                clearTimeout(timeoutId);
                webSocketService.removeMessageListener(handleOnce);
                reject(new Error(resp.params?.error || 'Create app session failed'));
              }
            } catch (e) {
              // ignore non-JSON or unrelated messages
            }
          };

        
          webSocketService.addMessageListener(handleOnce);
          webSocketService.send(payload);
        });
      } catch (error) {
        console.error('❌ Failed to create app session:', error);
        dispatch(setError(`Failed to create app session: ${error.message}`));
        throw error;
      }
    },
    [isAuthenticated, sessionKey, dispatch]
  );

  // Convenience: create session from channel id, tagging the session with channel metadata
  const createAppSessionFromChannel = useCallback(
    async ({ channelId, counterparty, asset = 'usdc', amount = '1000000' }) => {
      if (!walletClient?.account) throw new Error('Wallet not connected');

      const me = walletClient.account.address;
      return await createAppSession({
        participants: [me, counterparty],
        allocations: [
          { participant: me, asset, amount },
          { participant: counterparty, asset, amount: '0' },
        ],
        session_data: JSON.stringify({ channel_id: channelId }),
      });
    },
    [createAppSession, walletClient]
  );

  // After authentication, automatically fetch channels
  useEffect(() => {
    if (isAuthenticated) {
      getChannels().catch((err) => console.error('getChannels after auth failed:', err));
    }
  }, [isAuthenticated, getChannels]);

  return {
    connectionStatus,
    isAuthenticated,
    error: error,
    connect,
    disconnect,
    getChannels,
    getLedgerBalances,
    createAppSession,
    createAppSessionFromChannel,
    sessionKey, // Expose session key for transfer hook
  };
}

export default useClearNodeConnection;