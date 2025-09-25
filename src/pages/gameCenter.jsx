import React from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useSelector, useDispatch } from 'react-redux'

import { GameCards, CustomButton } from '../components'
import { icons } from '../constants'
import { updateTickets, setCurrentTab } from '../lib/redux/appSlice'

const GameCenter = () => {
  const tickets = useSelector(state => state.app.tickets)
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const walletConnected = useSelector(state => state.clearNode.isAuthenticated);
  const connectionStatus = useSelector(state => state.clearNode.connectionStatus);

  const apps = [
    {
      id: "app_line",
      icon: icons.LineGame,
      type: "internal",
      link: '/game',
      name: "Line Game"
    },
    {
      id: "app_space",
      icon: icons.SpaceGame,
      type: "internal",
      link: '/space_game',
      name: "Space Game"
    },
    {
      id: "app_endlessCar",
      icon: icons.EndlessCarGame,
      type: "internal",
      link: '/endless_car_game',
      name: "Endless Car Game"
    }
  ]

  function launchInternalApp(link) {
    if(tickets <= 0){
      toast.error('You have no tickets to play', {duration: 2500})
      return;
    }

    // Check if wallet is connected
    if(!walletConnected || connectionStatus !== 'connected') {
      toast.error('⚠️ Connect your wallet for real rewards! Games without wallet give mock coins.', {
        duration: 4000,
        style: {
          background: '#1e293b',
          color: '#60a5fa',
          fontWeight: 'bold',
          border: '1px solid #3b82f6'
        }
      });
      // Still allow playing but with warning
      setTimeout(() => {
        dispatch(updateTickets(-1));
        navigate(link);
      }, 1500);
      return;
    }

    dispatch(updateTickets(-1));
    navigate(link);
  }

  return (
    <div className='relative flex flex-col gap-y-5 items-center w-full mb-24 z-10'>
      <h1 className='mt-8 mb-2 text-5xl denver-regular '>
        GAME CENTER
      </h1>

      {/* Wallet Connection Status */}
      {!walletConnected && (
        <div className="w-[90%] md:w-[80%] mx-auto mb-4 p-4 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl shadow-[0px_4px_24px_#4f46e5]">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src={icons.Wallet} alt="Wallet" className="w-8 h-8" />
            <h3 className="text-xl font-bold text-indigo-400">Connect Wallet for Real Rewards</h3>
          </div>
          <p className="text-center text-gray-300 mb-3">
            You're playing with mock rewards. Connect your wallet to earn real USDC!
          </p>
          <CustomButton
            text="Connect Wallet"
            textStyle="ubuntu-bold text-base"
            buttonStyle="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-[0px_4px_24px_#4f46e5]"
            onClick={() => {
              dispatch(setCurrentTab("wallet"));
              navigate('/main');
            }}
          />
        </div>
      )}

      <div className='w-[90%] md:w-[50%] rounded-xl bg-sky-600/65 py-4 px-2'>
        <div className='flex items-center justify-between'>
          <h3 className='px-2 pb-2 text-2xl font-bold'>Popular Apps</h3>
          <div className='flex items-center gap-x-2'>
            {walletConnected && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                <span className="text-green-400 text-xs">●</span>
                <span className="text-green-400 text-xs font-bold">LIVE</span>
              </div>
            )}
            <h3 className='flex items-center gap-x-2 px-2 pb-2 text-2xl font-bold'>
              <img src={icons.Ticket} alt="ticket.." className='size-5' />{tickets}
            </h3>
          </div>
        </div>
        <div className='grid grid-cols-2 gap-x-2 gap-y-4 my-2 w-full'>
          {
            apps.map((app, index) => (
              <GameCards
                key={`${app.id}_${index}`}
                imgSrc={app.icon}
                imgClass="w-full h-40 md:h-60 rounded-lg object-cover bg-gray-950"
                txtClass="font-bold"
                btnTxtClass="text-md font-bold"
                appName={app.name}
                doOnClick={() => launchInternalApp(app.link)}
              />
            ))
          }
        </div>
      </div>
      {/* New Games */}
      {/* <div className='w-[90%] md:w-[80%] rounded-xl bg-green-600/65 p-4'>
        <h3 className='text-xl font-bold'>New Games</h3>
        <div className='flex gap-x-4 my-2 w-full overflow-x-scroll'>
          <GameCards />
          <GameCards />
          <GameCards />
          <GameCards />
          <GameCards />
          <GameCards />
          <GameCards />
          <GameCards />
        </div>
      </div> */}
      {/* Legendary Games */}
      {/* <div className='w-[90%] md:w-[80%] rounded-xl bg-amber-600/65 p-4'>
        <h3 className='text-xl font-bold'>Legendary Games</h3>
        <div className='flex gap-x-4 my-2 w-full overflow-x-scroll'>
          <GameCards />
          <GameCards />
          <GameCards />
          <GameCards />
          <GameCards />
          <GameCards />
          <GameCards />
          <GameCards />
        </div>
      </div> */}
      {/* Epic Games */}
      {/* <div className='w-[90%] md:w-[80%] rounded-xl bg-indigo-600/65 p-4'>
        <h3 className='text-xl font-bold'>Epic Games</h3>
        <div className='flex gap-x-4 my-2 w-full overflow-x-scroll'>
          <GameCards />
          <GameCards />
          <GameCards />
          <GameCards />
          <GameCards />
          <GameCards />
          <GameCards />
          <GameCards />
        </div>
      </div> */}
    </div>
  )
}

export default GameCenter