import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ethers } from 'ethers'; // Ensure ethers@5.7.2
import {
  createAuthRequestMessage,
  createAuthVerifyMessageFromChallenge,
  createGetChannelsMessage,
  createGetLedgerBalancesMessage,
  createGetConfigMessage,
  createECDSAMessageSigner,
  generateRequestId,
  getCurrentTimestamp,
  parseAnyRPCResponse,
  RPCMethod,
} from '@erc7824/nitrolite';
import {
  setConnectionStatus,
  setAuthenticated,
  setError,
  setChannels,
} from '../lib/redux/clearNodeSlice';

function useClearNodeConnection(clearNodeUrl, stateWallet) {
  const dispatch = useDispatch();
  const { connectionStatus, isAuthenticated, error } = useSelector((state) => state.clearNode);

  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5; // Limit reconnection attempts
  const reconnectInterval = useRef(1000); // Initial delay in ms

  // Message signer function
  const messageSigner = useCallback(async (payload) => {
    if (!stateWallet) throw new Error('State wallet not available');
    try {
      const message = JSON.stringify(payload);
      // const digestHex = ethers.utils.id(message);
      // const messageBytes = ethers.utils.arrayify(digestHex);
      // const signature = await stateWallet.signMessage(message);
      // return signature;

      const digest = ethers.utils.id(message); // keccak256(JSON.stringify(payload)) -> 0x…
      const sigParts = await stateWallet._signingKey().signDigest(digest);
      return ethers.utils.joinSignature(sigParts); // 0x… 65-byte hex
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

  // Connect function with reconnection logic
  const connect = useCallback(() => {
    console.log("Connect Called!!")
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      dispatch(setError('Max reconnection attempts reached'));
      dispatch(setConnectionStatus('disconnected'));
      return;
    }

    // if (wsRef.current) {
    //   wsRef.current.close();
    // }

    dispatch(setConnectionStatus('connecting'));
    dispatch(setError(null));

    const newWs = new WebSocket(clearNodeUrl);

    newWs.onopen = async () => {
      reconnectAttempts.current = 0; // Reset attempts on success
      reconnectInterval.current = 1000; // Reset delay
      dispatch(setConnectionStatus('connected'));

      try {
        // const authRequest = await createAuthRequestMessage({
        //   address: process.env.REACT_APP_NITROLITE_APP_ADDRESS,
        //   session_key: stateWallet.address,
        //   application: process.env.REACT_APP_NITROLITE_CHANNEL_ID,
        //   app_name: 'Line Crypto',
        //   expire: (Math.floor(Date.now() / 1000) + 3600).toString(),
        //   scope: "console",
        //   allowances: [],
        // });

        // console.log("Formed Auth Request ===> ", authRequest)

        // newWs.send(authRequest);
        await getChannels()
      } catch (err) {
        dispatch(setError(`Auth request failed: ${err.message}`));
        newWs.close();
      }
    };

    newWs.onmessage = async (event) => {
      try {
        const message = parseAnyRPCResponse(event.data);

        console.log("Message Method Received: ", message.method, " ====== ", message)

        if (message.method === RPCMethod.AuthChallenge) {
          const challenge = message.params.challengeMessage; // use the exact field from broker
          const authVerify = await createAuthVerifyMessageFromChallenge(messageSigner, challenge);

          newWs.send(authVerify.replace("challenge", "challengeMessage"));
        } else if (message.method === RPCMethod.AuthVerify) {
          console.log("Auth Verify Call : ", message)
          if (message.params.success) {
            dispatch(setAuthenticated(true));
            localStorage.setItem('clearnode_jwt', message.params.jwtToken);
          } else {
            dispatch(setAuthenticated(false));
            dispatch(setError('Authentication failed'));
            newWs.close();
          }
        } else if (message.method === RPCMethod.GetChannels) {
          const safeChannels = message.params.channels.map((ch) => ({
            ...ch,
            amount: ch.amount.toString(), // BigInt → string
            createdAt: ch.createdAt.toISOString(), // Date → string
            updatedAt: ch.updatedAt.toISOString()
          }));

          dispatch(setChannels({ ...message.params, channels: safeChannels }));
        } else if (message.method === RPCMethod.Error) {
          console.error("WS Error :==> ", message)
          dispatch(setError(message.params.error));
        }
      } catch (err) {
        console.error(`Message handling error: ${err.message}`)
        dispatch(setError(`Message handling error: ${err.message}`));
      }
    };

    newWs.onerror = (err) => {
      console.error("Websocket Closed on Error: ", err)
      dispatch(setError(`WebSocket error: ${err.message || 'Unknown error'}`));
      dispatch(setConnectionStatus('error'));
    };

    newWs.onclose = () => {
      dispatch(setConnectionStatus('disconnected'));
      dispatch(setAuthenticated(false));
      // if (reconnectAttempts.current < maxReconnectAttempts) {
      //   reconnectAttempts.current += 1;
      //   reconnectInterval.current *= 2; // Exponential backoff
      //   setTimeout(() => {
      //     dispatch(setError(`Reconnecting... Attempt ${reconnectAttempts.current}`));
      //     connect();
      //   }, reconnectInterval.current);
      // } else {
      //   dispatch(setError('Failed to reconnect after max attempts'));
      // }
    };

    wsRef.current = newWs;
  }, [clearNodeUrl, stateWallet, messageSigner, dispatch]);

  // Disconnect function
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      reconnectAttempts.current = 0; // Reset attempts
      reconnectInterval.current = 1000; // Reset delay
    }
  }, []);

  // Auto-connect on mount
  // useEffect(() => {
  //   if (clearNodeUrl && stateWallet) {
  //     console.log("Connection Details =======> ", clearNodeUrl, stateWallet)
  //     connect();
  //   }
    
  //   // return () => disconnect();
  // }, []);

  // Helper methods
  const getChannels = useCallback(async () => {
    try {
      const message = await createGetChannelsMessage(messageSigner, process.env.REACT_APP_NITROLITE_APP_ADDRESS);
      console.info("Get Channel Message: ", message)

      return sendMessage(message);
    } catch (error) {
      console.error("Failed to create Get Channels Message: ", error)
    }    
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