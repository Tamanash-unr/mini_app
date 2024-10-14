import React from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'

import { icons } from '../constants'

const Dashboard = ({  }) => {
    const nickname = useSelector(state => state.user.nickname)
    const coins = useSelector(state => state.app.coinValue)


  return (
    <div className='w-full h-screen'>
      <div className="fixed z-20 flex items-center text-xl py-4 px-8 top-0 w-full h-16 ubuntu-bold text-2xl md:w-[60%]">
          Welcome! {nickname}
      </div>
      <motion.div 
        className='fixed flex flex-col w-full h-full items-center my-16 md:w-[60%]'
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 1.5,
          delay: 0.3,
          ease: [0, 0.71, 0.2, 1.01]
        }}
      >
          <img src={icons.Placeholder} className='size-72 mt-20'/>
          <p className='ubuntu-bold text-3xl'>
              <span className='ubuntu-bold-italic'>L</span> {coins}
          </p>
      </motion.div>        
    </div>
  )
}

export default Dashboard