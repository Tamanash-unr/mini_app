import React from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useSelector, useDispatch } from 'react-redux'

import { GameCards } from '../components'
import { icons } from '../constants'
import { updateTickets } from '../lib/redux/appSlice'

const GameCenter = () => {
  const tickets = useSelector(state => state.app.tickets)
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

    dispatch(updateTickets(-1));
    navigate(link);
  }

  return (
    <div className='relative flex flex-col gap-y-5 items-center w-full mb-24 z-10'>
      <h1 className='mt-8 mb-2 text-5xl denver-regular '>
        GAME CENTER
      </h1>
      <div className='w-[90%] md:w-[50%] rounded-xl bg-sky-600/65 py-4 px-2'>
        <div className='flex items-center justify-between'>
          <h3 className='px-2 pb-2 text-2xl font-bold'>Popular Apps</h3>
          <h3 className='flex items-center gap-x-2 px-2 pb-2 text-2xl font-bold'>
            <img src={icons.Ticket} alt="ticket.." className='size-5' />{tickets}
          </h3>
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