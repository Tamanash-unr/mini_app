import React from 'react'
import { GameCards } from '../components'

const GameCenter = () => {
  return (
    <div className='relative flex flex-col gap-y-5 items-center w-full mb-24 z-10'>
      <h1 className='mt-8 mb-2 text-5xl denver-regular '>
        GAME CENTER
      </h1>
      <div className='w-[90%] md:w-[80%] rounded-xl bg-sky-600/65 p-4'>
        <h3 className='text-xl font-bold'>Popular Apps</h3>
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
      </div>
      <div className='w-[90%] md:w-[80%] rounded-xl bg-green-600/65 p-4'>
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
      </div>
      <div className='w-[90%] md:w-[80%] rounded-xl bg-amber-600/65 p-4'>
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
      </div>
      <div className='w-[90%] md:w-[80%] rounded-xl bg-indigo-600/65 p-4'>
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
      </div>
    </div>
  )
}

export default GameCenter