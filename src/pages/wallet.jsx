import React, { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
// import { useTonConnectUI } from '@tonconnect/ui-react'
// import { Address } from '@ton/core'
import toast from 'react-hot-toast'

import { CustomButton } from '../components'
import { setLoading } from '../lib/redux/appSlice'
import { icons } from '../constants'

// Nitrolite Integration
import useClearNodeConnection from '../hooks/useClearNodeConnection';
import useTransfer from '../hooks/useTransfer';
import { generateSessionKey, getStoredSessionKey, storeSessionKey } from '../lib/sessionUtils';
import { createWalletClient, custom } from 'viem';
import { mainnet } from 'viem/chains';
import { ethers } from "ethers";


const Wallet = () => {
  // const [tonConnectUI] = useTonConnectUI();
  const loading = useSelector(state => state.app.isLoading)
  const coins = useSelector(state => state.app.coinValue)
  const userId = useSelector(state => state.user.data.id)
  const sessionId = useSelector(state => state.app.sessionId)

  const dispatch = useDispatch()

  const [currentTab, setCurrentTab] = useState(0);
  const [account, setAccount] = useState(null); // User's wallet address
  const [walletClient, setWalletClient] = useState(null); // Viem wallet client
  const [balances, setBalances] = useState(null); // User balances
  const [isTelegramMiniApp, setIsTelegramMiniApp] = useState(false); // Flag to detect Telegram environment

  /* ------------- Nitrolite ----------------- */
  const clearNodeUrl = process.env.REACT_APP_CLEARNODE_WS_URL || 'wss://clearnet.yellow.com/ws';
  
  // Use our new hook for ClearNode connection
  const {
    connectionStatus,
    isAuthenticated,
    error: nitroliteError,
    connect,
    disconnect,
    getChannels,
    getLedgerBalances,
    sessionKey, // Get session key from hook
    createAppSessionFromChannel, // Added for app session creation
  } = useClearNodeConnection(clearNodeUrl, walletClient);

  // Use transfer hook
  const { handleTransfer, handleSponsorPost } = useTransfer(sessionKey, isAuthenticated);

  // Validate environment variables on startup
  useEffect(() => {
    const requiredVars = [
      'REACT_APP_NITROLITE_APP_ADDRESS',
      'REACT_APP_NITROLITE_CHANNEL_ID',
      'REACT_APP_CLEARNODE_WS_URL'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      console.error('❌ Missing environment variables:', missingVars);
      toast.error(`Missing environment variables: ${missingVars.join(', ')}. Please check your .env file.`);
    } else {
      console.log('✅ All required environment variables are configured');
    }
  }, []);

  // Initialize Telegram Mini App environment safely
  useEffect(() => {
    const initializeTelegramMiniApp = async () => {
      try {
        // Check if we're in Telegram environment
        const isTelegram = !!(window.Telegram?.WebApp);

        if (isTelegram) {
          setIsTelegramMiniApp(true);
          console.log('📱 Running in Telegram Mini App environment');

          // Initialize Telegram WebApp
          if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.ready();
            console.log('✅ Telegram WebApp initialized');
          }
        } else {
          console.log('🖥️ Running in browser environment (not Telegram)');
          setIsTelegramMiniApp(false);
        }
      } catch (error) {
        console.warn('⚠️ Failed to initialize Telegram Mini App:', error);
        setIsTelegramMiniApp(false);
      }
    };

    initializeTelegramMiniApp();
  }, []);

  // Format address like in reference implementation
  const formatAddress = (address) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  // Determine display status
  const getDisplayStatus = () => {
    if (!account) return 'No Wallet';
    if (!connectionStatus || connectionStatus === 'disconnected') return 'Disconnected';
    if (connectionStatus === 'connecting') return 'Connecting';
    if (connectionStatus === 'connected' && !isAuthenticated) return 'Authenticating';
    if (isAuthenticated) return 'Connected';
    if (connectionStatus === 'error') return 'Error';
    return connectionStatus;
  };

  // Connect wallet using viem (following reference implementation)
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask!');
      return;
    }
    
    dispatch(setLoading(true));
    
    try {
      // First get the address
      const tempClient = createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum),
      });
      const [address] = await tempClient.requestAddresses();

      // Create wallet client with account for EIP-712 signing (Chapter 3 requirement)
      const client = createWalletClient({
        account: address,
        chain: mainnet,
        transport: custom(window.ethereum),
      });

      setWalletClient(client);
      setAccount(address);
      
      toast.success('Wallet Connected Successfully!', { duration: 2500 });
      callTelegramAnalytics('connection-completed');
      
    } catch (err) {
      console.error('Wallet connection failed:', err);
      toast.error('Wallet connection failed');
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Auto-connect to Nitrolite when wallet is set
  useEffect(() => {
    if (walletClient && account) {
      console.log('🔗 Wallet connected, initiating Nitrolite connection...');
      connect().then((success) => {
        if (success) {
          toast.success('Nitrolite Connected!', { duration: 2500 });
        }
      }).catch((error) => {
        console.error('Nitrolite connection failed:', error);
        toast.error('Nitrolite connection failed');
      });
    }
  }, [walletClient, account, connect]);

  // Show error toasts for Nitrolite errors
  useEffect(() => {
    if (nitroliteError && walletClient) {
      toast.error(`Nitrolite Error: ${nitroliteError}`);
    }
  }, [nitroliteError, walletClient]);

  // Disconnect both wallet and Nitrolite
  const handleDisconnectWallet = () => {
    console.log('🔌 Disconnecting wallet and Nitrolite...');

    setAccount(null);
    setWalletClient(null);
    disconnect();

    toast.success('Disconnected successfully', { duration: 2500 });
    dispatch(setLoading(false));
  };

  // const channelData = useSelector((state) => state.clearNode.channels);

  // (Removed connectionStatus-based loading effect)

  // (Removed old connectionStatus-based debug effect)
/* ---------------------------------------------------------- */

  

  // Removed old handleWalletConnection - now using connectWallet directly
  
  const callTelegramAnalytics = async (eventName) => {
    // Only send analytics if we have valid data
    if (!userId || !sessionId) return;

    try {
    await fetch("https://tganalytics.xyz/events", {
      method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          event_name: eventName,
          session_id: sessionId,
          app_name: process.env.REACT_APP_ANALYTICS_IDENTIFIER,
        })
      });
    } catch (error) {
      // Silently fail analytics - don't break the app
      console.log('Analytics failed:', error);
    }
  }

  // Test functions for Nitrolite
  const handleGetChannels = async () => {
    try {
      dispatch(setLoading(true));
      const channels = await getChannels();
      console.log('📋 Channels:', channels);
      toast.success('Channels fetched successfully!');
    } catch (error) {
      console.error('Failed to get channels:', error);
      toast.error('Failed to get channels');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGetBalances = async () => {
    if (!account) {
      toast.error('Please connect wallet first');
      return;
    }
    
    try {
      dispatch(setLoading(true));
      const balances = await getLedgerBalances(account);
      console.log('💰 Balances:', balances);
      toast.success('Balances fetched successfully!');
    } catch (error) {
      console.error('Failed to get balances:', error);
      toast.error('Failed to get balances');
    } finally {
      dispatch(setLoading(false));
    }
  };


          const handleDebugInfo = () => {
            console.log('🔍 Debug Information:');
            console.log('- Account:', account);
            console.log('- WalletClient:', walletClient);
            console.log('- Connection Status:', connectionStatus);
            console.log('- Authenticated:', isAuthenticated);
            console.log('- Session Key:', sessionKey);
            console.log('- Error:', nitroliteError);
            console.log('- Environment Variables:');
            console.log('  - REACT_APP_NITROLITE_APP_ADDRESS:', process.env.REACT_APP_NITROLITE_APP_ADDRESS);
            console.log('  - REACT_APP_NITROLITE_CHANNEL_ID:', process.env.REACT_APP_NITROLITE_CHANNEL_ID);
            console.log('  - REACT_APP_CLEARNODE_WS_URL:', process.env.REACT_APP_CLEARNODE_WS_URL);
            console.log('  - REACT_APP_APP_NAME:', process.env.REACT_APP_APP_NAME);
            console.log('  - REACT_APP_AUTH_SCOPE:', process.env.REACT_APP_AUTH_SCOPE);

            // Check if required environment variables are set
            const requiredVars = [
              'REACT_APP_NITROLITE_APP_ADDRESS',
              'REACT_APP_NITROLITE_CHANNEL_ID',
              'REACT_APP_CLEARNODE_WS_URL'
            ];

            const missingVars = requiredVars.filter(varName => !process.env[varName]);
            if (missingVars.length > 0) {
              console.error('❌ Missing environment variables:', missingVars);
              toast.error(`Missing environment variables: ${missingVars.join(', ')}`);
            } else {
              console.log('✅ All required environment variables are set');
              toast.success('All environment variables are configured correctly');
            }
          };

          const handleRetryAuthentication = async () => {
            if (!account) {
              toast.error('Please connect wallet first');
              return;
            }

            if (!connectionStatus || connectionStatus === 'disconnected') {
              toast.error('Please connect to ClearNode first');
              return;
            }

            try {
              dispatch(setLoading(true));

              // Force reconnect to reset authentication state
              await disconnect();
              setTimeout(async () => {
                await connect();
              }, 1000);

              toast.success('Retrying authentication...');
            } catch (error) {
              console.error('Retry error:', error);
              toast.error('Retry failed');
            } finally {
              dispatch(setLoading(false));
            }
          };

          const handleCreateTestSession = async () => {
            if (!account) {
              toast.error('Please connect wallet first');
              return;
            }

            if (!isAuthenticated) {
              toast.error('Please wait for authentication to complete');
              return;
            }

            try {
              dispatch(setLoading(true));

              // Test counterparty address (you should replace this with a real address)
              const counterparty = '0x742d35Cc6506C244C9F05F2c5C4A582eA6754e9F';

              const result = await createAppSessionFromChannel({
                channelId: process.env.REACT_APP_NITROLITE_CHANNEL_ID,
                counterparty,
                asset: 'usdc',
                amount: '0' // Start with zero - no upfront allocation needed
              });

              console.log('✅ Test session created:', result);
              toast.success('Test session created successfully!');
            } catch (error) {
              console.error('Session creation error:', error);
              toast.error(`Session creation failed: ${error.message}`);
            } finally {
              dispatch(setLoading(false));
            }
          };

          const handleTestTransfer = async () => {
            if (!account) {
              toast.error('Please connect wallet first');
              return;
            }

            if (!isAuthenticated) {
              toast.error('Please wait for authentication to complete');
              return;
            }

            try {
              dispatch(setLoading(true));
              const result = await handleTransfer(
                '0x742d35Cc6506C244C9F05F2c5C4A582eA6754e9F', // Test recipient
                '0.01', // 0.01 USDC
                'usdc'
              );

              if (result.success) {
                toast.success('Test transfer sent successfully!');
              } else {
                toast.error(`Transfer failed: ${result.error}`);
              }
            } catch (error) {
              console.error('Transfer error:', error);
              toast.error('Transfer failed');
            } finally {
              dispatch(setLoading(false));
            }
          };

  // Removed old handleWalletDisconnect - now using handleDisconnectWallet directly

  // useEffect(() => {
  //   const checkWalletConnection = async () => {
  //     if(tonConnectUI.account?.address){
  //       handleWalletConnection(tonConnectUI.account?.address)
  //     } else {
  //       handleWalletDisconnect()
  //     }
  //   }

  //   checkWalletConnection()

  //   const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
  //     if(wallet){
  //       handleWalletConnection(wallet.account.address)
  //     } else {
  //       handleWalletDisconnect()
  //     }
  //   })

  //   return () => {
  //     unsubscribe()
  //   }
  // },[tonConnectUI, handleWalletConnection, handleWalletDisconnect])

  // const handleWalletAction = async () => {
  //   if(tonConnectUI.connected){
  //     dispatch(setLoading(true))
  //     await tonConnectUI.disconnect()
  //     callTelegramAnalytics('disconnection')
  //   } else {
  //     callTelegramAnalytics('connection-started')
  //     await tonConnectUI.openModal()
  //   }
  // }

  // const formatAddress = (address) => {
  //   const tempAddress = Address.parse(address).toString()
  //   return `${tempAddress.slice(0,4)}....${tempAddress.slice(-4)}`
  // }

  return (
    <div className='relative w-full h-screen z-10 p-2 flex flex-col items-center'>
      <div className='flex flex-col ubuntu-bold text-3xl md:text-4xl my-10 md:my-20 text-center'>
        Get Real Crypto. Earn and Buy Tokens
        <CustomButton
          text={
            !account
              ? 'Connect Wallet'
              : 'Disconnect Wallet'
          }
          textStyle="m-0 ubuntu-bold text-xl"
          buttonStyle={`w-[80%] md:w-[60%] mx-auto my-10 ${
            !account 
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-[0px_4px_24px_#4f46e5]'
              : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
          }`}
          onClick={() => {
            if (!account) {
              connectWallet();
            } else {
              handleDisconnectWallet();
            }
          }}
          isLoading={loading}
        />
        {account && (
          <div className='my-2 min-w-[75%] md:min-w-[60%] mx-auto ubuntu-bold text-lg px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30'>
            <span className="text-emerald-400">✅ Connected:</span> {formatAddress(account)}
          </div>
        )}
      </div>
      <div className='flex w-[95%] md:w-[60%] items-center justify-between ubuntu-bold text-2xl md:text-3xl'>
        <p className='m-0'>Total Coins</p>
        <div className='flex items-center justify-center bg-slate-400/50 min-w-32 rounded-full py-2 px-4'>
          <img src={icons.Placeholder} alt="lineCoin.." className='w-7 mr-2' />
          {coins}
        </div>
      </div>
      <div className='w-[90%] md:w-3/4 bg-zinc-900/80 rounded-2xl px-2 py-6 my-5'>
        <p className='w-full text-center ubuntu-bold text-lg'>Yellow Network Status</p>
        <div className='md:w-3/4 mx-auto ubuntu-medium flex flex-col items-center gap-y-3 text-sm md:text-base'>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            isAuthenticated 
              ? 'bg-emerald-500/20 border border-emerald-500/30' 
              : 'bg-red-500/20 border border-red-500/30'
          }`}>
            <span className={`text-sm font-bold ${isAuthenticated ? 'text-emerald-400' : 'text-red-400'}`}>
              {isAuthenticated ? '🟢 Connected' : '🔴 Not Connected'}
            </span>
          </div>
          
          {nitroliteError && (
            <div className='text-red-400 text-center text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20'>
              <p className='font-semibold'>Connection Issue:</p>
              <p className='text-xs'>{nitroliteError}</p>
            </div>
          )}
          
          {!isAuthenticated && !nitroliteError && (
            <div className='text-center text-gray-400 text-sm'>
              <p>Connecting to Yellow Network...</p>
              <p className='text-xs'>This may take a few moments</p>
            </div>
          )}
        </div>
        
        {/* User Actions */}
        {!isAuthenticated && connectionStatus === 'connected' && (
          <div className='flex flex-col gap-2 mt-4'>
            <CustomButton
              text="Retry Connection"
              textStyle="m-0 ubuntu-medium text-sm"
              buttonStyle="w-full mx-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              onClick={handleRetryAuthentication}
              isLoading={loading}
            />
          </div>
        )}

        {isAuthenticated && (
          <div className='flex flex-col gap-2 mt-4'>
            <p className='text-center text-emerald-400 font-semibold text-sm'>
              ✅ Successfully connected to Yellow Network!
            </p>
            <p className='text-center text-gray-400 text-xs'>
              Your wallet is now ready for real crypto rewards.
            </p>
          </div>
        )}
      </div>
      {/* <div className='flex items-center justify-center bg-zinc-900 rounded-full p-2 my-5'>
        <button 
          className={`py-2 md:w-[280px] px-8 text-lg ubuntu-bold rounded-full transition-colors duration-500 ${currentTab === 0 ? 'bg-gray-500' : ''}`}
          onClick={() => setCurrentTab(0)}
        >
          Balances
        </button>
        <button 
          className={`py-2 md:w-[280px] px-8 text-lg ubuntu-bold rounded-full transition-colors duration-500 ${currentTab === 1 ? 'bg-gray-500' : ''}`}
          onClick={() => setCurrentTab(1)}
        >
          History
        </button>
      </div> */}
    </div>
  )
}

export default Wallet