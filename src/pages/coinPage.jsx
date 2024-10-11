import React from 'react'

import { gifs } from '../constants'

const CoinPage = () => {
  return (
    <div className='w-full h-screen'>
        <img src={gifs.stars_a} className='h-full md:w-[60%] fixed z-0'/>
    </div>
  )
}

export default CoinPage