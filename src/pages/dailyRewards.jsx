import React, {useState} from 'react'
import Confetti from 'react-confetti'
import { motion } from 'framer-motion'
import { useDispatch } from 'react-redux'

import { CustomButton } from '../components'
import { icons } from '../constants'
import { setDailyClaimed, setModalOpen, updateCoins } from '../lib/appSlice'

const DailyRewards = ({  }) => {
    const [showConfetti, setShowConfetti] = useState(false)
    const [dailyStreak, setDailyStreak] = useState(1)
    const [claim, setClaim] = useState(false)

    const dispatch = useDispatch();

    const doOnClaim = () => {
        const coins = dailyStreak > 0 ? dailyStreak * 50 : 25;

        setShowConfetti(true);
        setClaim(true);
        dispatch(updateCoins(coins))
        dispatch(setDailyClaimed(true))
    }

    const onClaimComplete = () => {
        setShowConfetti(false)
        dispatch(setModalOpen({isOpen: false, modalChild: null}))
    }

  return (
    <div className='flex justify-center items-center h-full'>
        <div className='ubuntu-bold bg-zinc-900 p-8 rounded-lg w-[85%] md:w-[40%]'>
            <h1 className='text-2xl md:text-4xl flex items-center'>
                Daily Rewards
                <img src={icons.Bolt} alt="bolt.." className='h-10 md:h-12 w-10 md:w-12' />
            </h1>
            <div className='flex flex-col items-center'>
                <div className='text-xl my-2'>
                    Day
                </div>
                <motion.div 
                    className='text-8xl'
                    initial={{
                        y: 50,
                        opacity: 0,
                        scale: 0.2
                    }}
                    animate={{
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        transition: {
                            delay: 0.5,
                            duration: 0.85,
                            ease: [0, 0.71, 0.2, 1.01],
                        }
                    }}
                >
                    {dailyStreak}
                </motion.div>
                <div className='text-xl my-2'>
                    Streak
                </div>
                <motion.div 
                    className='flex items-center text-4xl my-4 bg-gray-400 bg-opacity-50 py-2 px-8 rounded-lg'
                    initial={{
                        y: 100,
                        opacity: 0,
                        scale: 0.2
                    }}
                    animate={{
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        transition: {
                            delay: 1,
                            duration: 0.85,
                            ease: [0, 0.71, 0.2, 1.01],
                        }
                    }}
                >
                    <img src={icons.Placeholder} alt="coin.." className='h-8 w-8 mr-2'/>
                    {
                        dailyStreak > 0 ?
                        dailyStreak * 50 :
                        25
                    }
                </motion.div>
                <CustomButton 
                    text="Claim Bonus"
                    textStyle="m-0 ubuntu-bold"
                    buttonStyle='mt-4'
                    onClick={doOnClaim}
                    disabled={claim}
                />
            </div>
        </div>
        {
            showConfetti && 
            <Confetti
                className='w-full h-full'
                recycle={false}
                numberOfPieces={500}
                onConfettiComplete={onClaimComplete}
            />
        }
    </div>
    
  )
}

export default DailyRewards