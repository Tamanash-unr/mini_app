import React, { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTonConnectUI } from '@tonconnect/ui-react'
import { Address } from '@ton/core'
import toast from 'react-hot-toast'

import { CustomButton } from '../components'
import { setLoading } from '../lib/redux/appSlice'
import { icons } from '../constants'

const Wallet = () => {
  const [tonConnectUI] = useTonConnectUI();
  const loading = useSelector(state => state.app.isLoading)
  const coins = useSelector(state => state.app.coinValue)

  const dispatch = useDispatch()

  const [currentTab, setCurrentTab] = useState(0);
  const [tonWalletAddress, setTonWalletAddress] = useState(null)

  const handleWalletConnection = useCallback((address) => {
    setTonWalletAddress(address)
    toast.success("Wallet Connected Successfully!", {duration: 2500})
    dispatch(setLoading(false))
  },[dispatch])

  const handleWalletDisconnect = useCallback(() => {
    setTonWalletAddress(null)
    dispatch(setLoading(false))
  },[dispatch])

  useEffect(() => {
    const checkWalletConnection = async () => {
      if(tonConnectUI.account?.address){
        handleWalletConnection(tonConnectUI.account?.address)
      } else {
        handleWalletDisconnect()
      }
    }

    checkWalletConnection()

    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      if(wallet){
        handleWalletConnection(wallet.account.address)
      } else {
        handleWalletDisconnect()
      }
    })

    return () => {
      unsubscribe()
    }
  },[tonConnectUI, handleWalletConnection, handleWalletDisconnect])

  const handleWalletAction = async () => {
    if(tonConnectUI.connected){
      dispatch(setLoading(true))
      await tonConnectUI.disconnect()
    } else {
      await tonConnectUI.openModal()
    }
  }

  const formatAddress = (address) => {
    const tempAddress = Address.parse(address).toString()
    return `${tempAddress.slice(0,4)}....${tempAddress.slice(-4)}`
  }

  return (
    <div className='relative w-full h-screen z-10 p-2 flex flex-col items-center'>
      <div className='flex flex-col ubuntu-bold text-3xl md:text-4xl my-10 md:my-20 text-center'>
        Get Real Crypto. Earn and Buy Tokens
        <CustomButton 
          text={tonWalletAddress ? 'Disconnect Wallet' : 'Connect Wallet'} 
          textStyle="m-0 ubuntu-bold text-xl"
          buttonStyle="w-[80%] md:w-[60%] mx-auto my-10"
          onClick={handleWalletAction}
          isLoading={loading}
        />
        {
          tonWalletAddress &&
          <div className='my-2 min-w-[60%] mx-auto ubuntu-bold text-lg px-4 py-2 rounded-full bg-black/75'>
            { formatAddress(tonWalletAddress) }
          </div>
        }
      </div>
      <div className='flex w-[95%] md:w-[60%] items-center justify-between ubuntu-bold text-2xl md:text-3xl'>
        <p className='m-0'>Points</p>
        <div className='flex items-center justify-center bg-slate-400/50 w-32 rounded-full py-2 px-4'>
          <img src={icons.Placeholder} alt="lineCoin.." className='w-7 mr-2' />
          {coins}
        </div>
      </div>
      <div className='flex items-center justify-center bg-zinc-900 rounded-full p-2 my-5'>
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
      </div>
    </div>
  )
}

export default Wallet