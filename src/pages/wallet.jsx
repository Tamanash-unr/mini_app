import React, { useState } from 'react'
import { useSelector } from 'react-redux'

import { CustomButton } from '../components'
import { icons } from '../constants'

const Wallet = () => {
  const coins = useSelector(state => state.app.coinValue)

  const [currentTab, setCurrentTab] = useState(0);

  return (
    <div className='relative w-full h-screen z-10 p-2 flex flex-col items-center'>
      <div className='flex flex-col ubuntu-bold text-3xl md:text-4xl my-10 md:my-20 text-center'>
        Get Real Crypto. Earn and Buy Tokens
        <CustomButton 
          text="Connect Wallet" 
          textStyle="m-0 ubuntu-bold text-xl"
          buttonStyle="w-[80%] md:w-[60%] mx-auto my-10"
          onClick={() => false}
        />
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