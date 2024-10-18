import React from 'react'
import { motion } from 'framer-motion'

import { Card } from '../../components'
import { dummy } from '../../constants'

const DailyTasks = () => {
  return (
    <div className='flex flex-col items-center w-full overflow-y-scroll mt-4 mb-20'>
        <motion.div 
            className='flex flex-col items-start w-[90%] md:w-[60%] my-1 py-6'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
                duration: 0.8,
                ease: "easeOut"
            }}
        >
            <p className='ubuntu-bold text-xl md:text-2xl'>Daily Tasks</p>

            {
                dummy.dailyTasks.map((task, index) => (
                    <Card
                        key={`dailyTask_${index}`} 
                        title={task.title}
                        titleStyle="text-base md:text-xl"
                        btnTxt="Start"
                        btnStyle="min-w-[90px] md:min-w-[100px]"
                        txtStyle="flex justify-center items-center m-0 ubuntu-medium text-sm md:text-lg"
                        onExecute={()=> alert("Test")}
                        childIndex={index + 1}
                    />
                ))
            }
        </motion.div>
        <motion.div 
            className='flex flex-col items-start w-[90%] md:w-[60%] my-1 py-6'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
                duration: 0.8,
                ease: "easeOut"
            }}
        >
            <p className='ubuntu-bold text-xl md:text-2xl'>Social Tasks</p>
            {
                dummy.dailyTasks.map((task, index) => (
                    <Card 
                        key={`socialTask_${index}`}
                        title={task.title}
                        titleStyle="text-base md:text-xl"
                        btnTxt="Start"
                        btnStyle="min-w-[90px] md:min-w-[100px]"
                        txtStyle="flex justify-center items-center m-0 ubuntu-medium text-sm md:text-lg"
                        onExecute={()=> alert("Test")}
                        childIndex={index + 1}
                    />
                ))
            }
        </motion.div>
    </div>
  )
}

export default DailyTasks