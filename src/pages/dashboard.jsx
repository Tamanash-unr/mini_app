import React from 'react'
import { gifs, icons } from '../constants'
import { useSelector } from 'react-redux'

const Dashboard = ({  }) => {

    const coins = useSelector(state => state.app.coinValue)


  return (
    <div className='w-full h-screen'>
        <img src={gifs.stars_a} className='h-full md:w-[60%] fixed z-0'/>
        <div className='fixed flex flex-col w-full h-full items-center my-16 md:w-[60%]'>
            <img src={icons.Placeholder} className='size-72 mt-20'/>
            <p className='ubuntu-bold text-3xl'>
                <span className='ubuntu-bold-italic'>L</span> {coins}
            </p>
        </div>        
    </div>
  )
}

export default Dashboard