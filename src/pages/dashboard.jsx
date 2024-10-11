import React from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'

import { icons } from '../constants'

const Dashboard = ({  }) => {

    const coins = useSelector(state => state.app.coinValue)


  return (
    <div className='w-full h-screen'>
        <motion.div 
          className='fixed flex flex-col w-full h-full items-center my-16 md:w-[60%]'
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 1.5,
            delay: 0.6,
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