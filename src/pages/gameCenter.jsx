import React from 'react'
import { GameCards } from '../components'
import { icons } from '../constants'

const GameCenter = () => {
  const apps = [
    {
      icon: icons.Tomarket,
      link: 'https://t.me/Tomarket_ai_bot/app?startapp',
      name: "Tomarket"
    },
    {
      icon: icons.Blum,
      link: 'https://t.me/blum/app?startapp',
      name: "Blum"
    }
  ]

  return (
    <div className='relative flex flex-col gap-y-5 items-center w-full mb-24 z-10'>
      <h1 className='mt-8 mb-2 text-5xl denver-regular '>
        GAME CENTER
      </h1>
      <div className='w-[90%] md:w-[80%] rounded-xl bg-sky-600/65 py-4 px-2'>
        <h3 className='px-2 pb-2 text-2xl font-bold'>Popular Apps</h3>
        <div className='grid grid-cols-2 gap-2 my-2 w-full overflow-x-scroll'>
          {/* <GameCards
            imgClass="w-full h-40 rounded-lg object-contain bg-gray-950"
            btnTxtClass="text-sm"
            doOnClick={() => console.log('hello')}
          />
          <GameCards
            imgClass="w-full h-40 rounded-lg object-contain bg-gray-950"
            btnTxtClass="text-sm"
            doOnClick={() => console.log('hello')}
          />
          <GameCards
            imgClass="w-full h-40 rounded-lg object-contain bg-gray-950"
            btnTxtClass="text-sm"
            doOnClick={() => console.log('hello')}
          />
          <GameCards
            imgClass="w-full h-40 rounded-lg object-contain bg-gray-950"
            btnTxtClass="text-sm"
            doOnClick={() => console.log('hello')}
          /> */}
          {
            apps.map(app => (
              <GameCards
                imgSrc={app.icon}
                imgClass="w-full h-40 rounded-lg object-contain bg-gray-950"
                txtClass="font-bold"
                btnTxtClass="text-md font-bold"
                appName={app.name}
                doOnClick={() => window.Telegram.WebApp.openTelegramLink(app.link)}
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