import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ethers } from 'ethers'; // Ensure ethers@5.7.2
import {
  createAuthRequestMessage,
  createAuthVerifyMessage,
  createGetChannelsMessage,
  createGetLedgerBalancesMessage,
  createGetConfigMessage,
  generateRequestId,
  getCurrentTimestamp,
  parseRPCResponse,
  RPCMethod,
} from '@erc7824/nitrolite';
import {
  setConnectionStatus,
  setAuthenticated,
  setError,
  setChannels,
} from '../lib/redux/clearNodeSlice'; // Adjust path to your Redux slice

function useClearNodeConnection(clearNodeUrl, stateWallet) {
  const dispatch = useDispatch();
  const { connectionStatus, isAuthenticated, error } = useSelector((state) => state.clearNode);

  const wsRef = useRef(null);

  // Message signer function (updated for ethers v5.7.2)
  const messageSigner = useCallback(async (payload) => {
    if (!stateWallet) throw new Error('State wallet not available');
    try {
      const message = JSON.stringify(payload);
      const digestHex = ethers.utils.id(message); // Use ethers.utils.id
      const messageBytes = ethers.utils.arrayify(digestHex); // Use ethers.utils.arrayify
      const { serialized: signature } = stateWallet.signingKey.sign(messageBytes);
      return signature;
    } catch (err) {
      dispatch(setError(`Error signing message: ${err.message}`));
      throw err;
    }
  }, [stateWallet, dispatch]);

  // Create a signed request
  const createSignedRequest = useCallback(async (method, params = []) => {
    if (!stateWallet) throw new Error('State wallet not available');
    const requestId = generateRequestId();
    const timestamp = getCurrentTimestamp();
    const requestData = [requestId, method, params, timestamp];
    const request = { req: requestData };
    const signature = await messageSigner(request);
    request.sig = [signature];
    return JSON.stringify(request);
  }, [stateWallet, messageSigner]);

  // Send message helper
  const sendMessage = useCallback((message) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      dispatch(setError('WebSocket not connected'));
      return false;
    }
    try {
      ws.send(typeof message === 'string' ? message : JSON.stringify(message));
      return true;
    } catch (err) {
      dispatch(setError(`Error sending message: ${err.message}`));
      return false;
    }
  }, [dispatch]);

  // Connect function
  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    dispatch(setConnectionStatus('connecting'));
    dispatch(setError(null));

    const newWs = new WebSocket(clearNodeUrl);
    newWs.onopen = async () => {
      dispatch(setConnectionStatus('connected'));
      try {
        const authRequest = await createAuthRequestMessage({
          wallet: stateWallet.address,
          participant: stateWallet.address,
          app_name: 'Line Crypto', // Replace with your app's domain
          expire: Math.floor(Date.now() / 1000) + 3600,
          scope: 'console',
          application: '0x710d43…39809b', // From channel setup
          allowances: [],
        });
        newWs.send(authRequest);
      } catch (err) {
        dispatch(setError(`Auth request failed: ${err.message}`));
      }
    };

    newWs.onmessage = async (event) => {
      try {
        const message = parseRPCResponse(event.data);
        if (message.method === RPCMethod.AuthChallenge) {
          const authVerify = await createAuthVerifyMessage(messageSigner, message);
          newWs.send(authVerify);
        } else if (message.method === RPCMethod.AuthVerify) {
          if (message.params.success) {
            dispatch(setAuthenticated(true));
            localStorage.setItem('clearnode_jwt', message.params.jwtToken);
          } else {
            dispatch(setAuthenticated(false));
            dispatch(setError('Authentication failed'));
          }
        } else if (message.method === RPCMethod.GetChannels) {
          dispatch(setChannels(message.params));
        } else if (message.method === RPCMethod.Error) {
          dispatch(setError(message.params.error));
        }
      } catch (err) {
        dispatch(setError(`Message handling error: ${err.message}`));
      }
    };

    newWs.onerror = (err) => {
      dispatch(setError(`WebSocket error: ${err.message || 'Unknown error'}`));
      dispatch(setConnectionStatus('error'));
    };

    newWs.onclose = () => {
      dispatch(setConnectionStatus('disconnected'));
      dispatch(setAuthenticated(false));
    };

    wsRef.current = newWs;
  }, [clearNodeUrl, stateWallet, messageSigner, dispatch]);

  // Disconnect function
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (clearNodeUrl && stateWallet) {
      connect();
    }
    return () => disconnect();
  }, [clearNodeUrl, stateWallet, connect, disconnect]);

  // Helper methods
  const getChannels = useCallback(async () => {
    const message = await createGetChannelsMessage(messageSigner, stateWallet.address);
    return sendMessage(message);
  }, [messageSigner, sendMessage, stateWallet]);

  const getLedgerBalances = useCallback(async (channelId) => {
    const message = await createGetLedgerBalancesMessage(messageSigner, channelId);
    return sendMessage(message);
  }, [messageSigner, sendMessage]);

  const getConfig = useCallback(async () => {
    const message = await createGetConfigMessage(messageSigner, stateWallet.address);
    return sendMessage(message);
  }, [messageSigner, sendMessage, stateWallet]);

  return {
    connectionStatus,
    isAuthenticated,
    error,
    connect,
    disconnect,
    sendMessage,
    getChannels,
    getLedgerBalances,
    getConfig,
    createSignedRequest,
  };
}

export default useClearNodeConnection;