import React from 'react'

import { icons } from '../constants'

const GameCards = () => {
  return (
    <div className='bg-sky-600 rounded-xl p-2 min-w-[200px]'>
        <img src={icons.gcenterStock} alt='cardImg..' className='w-[200] h-[200px] rounded-lg object-cover' />
        <div className='w-full flex items-center justify-between pt-2'>
            <p className='m-0 font-semibold'>Game Name</p>
            <button className='bg-green-600 px-4 py-0.5 font-semibold rounded-full'>Play</button>
        </div>
    </div>
  )
}

export default GameCards