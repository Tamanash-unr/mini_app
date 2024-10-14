import React from 'react'
import { icons } from '../constants'

const WIP = () => {
  return (
    <div className='relative flex flex-col items-center justify-center w-full h-dvh z-20'>
        <img src={icons.Gear} alt="WIP..." className='w-20 h-20 animate-spin'/>
        <p className='w-full text-white my-8 text-center ubuntu-bold text-3xl md:text-5xl'>
          Work In Progress
        </p>
    </div>
  )
}

export default WIP