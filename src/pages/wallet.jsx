import React, { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
// import { useTonConnectUI } from '@tonconnect/ui-react'
// import { Address } from '@ton/core'
import toast from 'react-hot-toast'

import { CustomButton } from '../components'
import { setLoading } from '../lib/redux/appSlice'
import { icons } from '../constants'

/* -------------------- Nitrolite Integration ----------------------- */
import useClearNodeConnection from "../hooks/useClearNodeConnection";
import { ethers } from "ethers";
/* ---------------------------------------------------------------- */


const Wallet = () => {
  // const [tonConnectUI] = useTonConnectUI();
  const loading = useSelector(state => state.app.isLoading)
  const coins = useSelector(state => state.app.coinValue)
  const userId = useSelector(state => state.user.data.id)
  const sessionId = useSelector(state => state.app.sessionId)

  const dispatch = useDispatch()

  const [currentTab, setCurrentTab] = useState(0);
  const [tonWalletAddress, setTonWalletAddress] = useState("")

  /* ------------- Nitrolite ----------------- */
  const stateWallet = new ethers.Wallet(process.env.REACT_APP_NITROLITE_KEY); // Initialize securely
  
  // const clearNodeUrl = 'wss://clearnet.yellow.com/ws';
  const clearNodeUrl = 'wss://clearnet-sandbox.yellow.com/ws'; // Sandbox URL

  const {
    connectionStatus,
    isAuthenticated,
    error,
    getChannels,
    connect,
    disconnect,
  } = useClearNodeConnection(clearNodeUrl, stateWallet);

  const channelData = useSelector((state) => state.clearNode.channels);

  useEffect(() => {
    if(connectionStatus == "connecting" || connectionStatus == "disconnecting") {
      dispatch(setLoading(true))
    } else {
      dispatch(setLoading(false))
    }
  },[dispatch, connectionStatus, setLoading])

  // useEffect(() => {
  //   console.info(
  //     'NITROLITE Connection:\nConnection Status:',
  //     connectionStatus,
  //     '\nAuthenticated:',
  //     isAuthenticated,
  //     '\nChannels:',
  //     channels,
  //     '\nError:',
  //     error
  //   );
  //   if (isAuthenticated) {
  //     getChannels(); // Auto-fetch channels when authenticated
  //   }
  // }, [connectionStatus, isAuthenticated, channels, error]);

/* ---------------------------------------------------------- */

  

  const handleWalletConnection = useCallback((address) => {
    setTonWalletAddress(address)
    toast.success("Wallet Connected Successfully!", {duration: 2500})
    callTelegramAnalytics('connection-completed')
    dispatch(setLoading(false))
  },[dispatch])
  
  const callTelegramAnalytics = async (eventName) => {
    await fetch("https://tganalytics.xyz/events", {
      method: 'POST',
      body: {
          user_id: userId,
          event_name: eventName,
          session_id: sessionId,
          app_name: process.env.REACT_APP_ANALYTICS_IDENTIFIER,
      }
    });
  }

  const handleWalletDisconnect = useCallback(() => {
    setTonWalletAddress("")
    dispatch(setLoading(false))
  },[dispatch])

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
          // text={tonWalletAddress ? 'Disconnect Wallet' : 'Connect Wallet'} 
          text={connectionStatus == "connected" ? 'Disconnect from Nitrolite' : 'Connect to Nitrolite'} 
          textStyle="m-0 ubuntu-bold text-xl"
          buttonStyle="w-[80%] md:w-[60%] mx-auto mt-10 mb-4"
          // onClick={handleWalletAction}
          onClick={() => connectionStatus == "connected" ? disconnect() : connect()}
          isLoading={loading}
        />
        {
          tonWalletAddress &&
          <div className='my-2 min-w-[75%] md:min-w-[60%] mx-auto ubuntu-bold text-lg px-4 py-2 rounded-full bg-black/75'>
            {/* { formatAddress(tonWalletAddress) } */}
            { "Wallet Address here: ....." }
          </div>
        }
      </div>
      <div className='flex w-[95%] md:w-[60%] items-center justify-between ubuntu-bold text-2xl md:text-3xl'>
        <p className='m-0'>Total Coins</p>
        <div className='flex items-center justify-center bg-slate-400/50 min-w-32 rounded-full py-2 px-4'>
          <img src={icons.Placeholder} alt="lineCoin.." className='w-7 mr-2' />
          {coins}
        </div>
      </div>
      <div className='w-[90%] md:w-3/4 bg-zinc-900/80 rounded-2xl px-2 py-6 my-5'>
        <p className='w-full text-center ubuntu-bold text-lg'>Nitrolite Status</p>
        <ul className='md:w-3/4 mx-auto ubuntu-medium flex flex-col items-center gap-y-2 text-sm md:text-base'>
          <li>
            Websocket Connection Status: {connectionStatus.toUpperCase()}
          </li>
          <li>
            Auth Status: {isAuthenticated.toString()}
          </li>
          <li>
            Channels Found: {channelData.channels.length}
          </li>
          {
            error && 
            <li>
              Error: {error}
            </li>
          }          
        </ul>
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