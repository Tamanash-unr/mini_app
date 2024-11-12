import React, {useCallback, useEffect} from 'react'
import { motion } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import SlotCounter from 'react-slot-counter'
import { useNavigate } from 'react-router-dom'

import { icons, gifs } from '../constants'
import { CustomButton } from '../components'
import { updateCoins, updateMineState, updateMinedCoins, updateEarnedFromGame, setModalOpen, setLoading } from '../lib/appSlice'
import { updateEarnedCoins } from '../lib/firebase/firebase_api'
import toast from 'react-hot-toast'

const Dashboard = () => {
    const nickname = useSelector(state => state.user.nickname)
    const name = useSelector(state => state.user.data.first_name)
    const uid = useSelector(state => state.user.data.id)
    const coins = useSelector(state => state.app.coinValue)
    const minedCoins = useSelector(state => state.app.minedCoins)
    const mineState = useSelector(state => state.app.mineState)
    const boostRate = useSelector(state => state.app.boostRate)
    const loading = useSelector(state => state.app.isLoading)
    const earned = useSelector(state => state.app.earnedFromGame)

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const hasEarnedFromGame = useCallback(async (value) => {
      if (value > 0) {
        const total = parseFloat((coins + value).toFixed(2))
        const result = await updateEarnedCoins(uid, total)

        if(!result.status){
          toast.error(result.message, {duration: 2500})
        } else {
          dispatch(updateCoins(value))
          dispatch(updateEarnedFromGame(0))
        }
      }
    },[])

    useEffect(()=>{
      hasEarnedFromGame(earned)
    }, [hasEarnedFromGame, earned])

    const onStartMine = async () => {
      if(mineState === 0){
        dispatch(updateMineState(1))
      }

      if(mineState === 1){
        dispatch(setModalOpen({isOpen: true, modalChild: 'boostPage'}))
      }

      if(mineState === 3){
        dispatch(setLoading(true))

        const total = parseFloat((coins + minedCoins).toFixed(2))
        const result = await updateEarnedCoins(uid, total)

        if(!result.status){
          toast.error(result.message, {duration: 2500})
        } else {
          dispatch(updateCoins(minedCoins))
          dispatch(updateMinedCoins(-1))
          dispatch(updateMineState(0))
        }

        dispatch(setLoading(false))
      }
    }

    const mineTxt = {
      0: 'Start Mining',
      1: 'Boost',
      3: 'Claim',
    }


  return (
    <div className='relative w-full h-screen z-10 p-2 flex flex-col items-center'>
      <div className="flex items-center text-xl py-3 px-3 md:px-8 top-0 w-full ubuntu-bold text-2xl">
          Welcome! {nickname === '' ? name : nickname}
      </div>
      <motion.div 
        className='flex w-full items-center justify-center mb-4'
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 1.5,
          delay: 0.3,
          ease: [0, 0.71, 0.2, 1.01]
        }}
      >
          <img src={icons.Placeholder} alt='Coin_Placeholder' className='size-8 md:size-12 mx-2 md:mx-3'/>
          <SlotCounter 
            value={coins}
            numberClassName='ubuntu-bold text-3xl md:text-5xl'
          />
      </motion.div>
      <img 
        src={gifs.tech} 
        alt='tech..' 
        className='w-[300px] h-[180px] md:w-[500px] md:h-[250px] rounded-xl border-2 border-indigo-600 shadow-[0px_4px_24px_#4f46e5] object-cover' 
      />
      <div className='relative w-[300px] h-[180px] md:w-[500px] md:h-[250px] mt-4 md:mt-2 mb-2 rounded-xl border-2 border-indigo-600 shadow-[0px_4px_24px_#4f46e5] overflow-hidden'>
        <img src={icons.Game} alt="game.." className='w-full h-full'/>
        <div className='absolute bottom-0 px-3 pb-2 pt-5 w-full bg-gradient-to-t from-slate-600 flex justify-between items-center'>
          <p className='m-0 ubuntu-bold text-xl md:text-2xl'>Line Game</p>
          <CustomButton 
            text="Play"
            textStyle="m-0 ubuntu-bold"
            buttonStyle="p-1 min-w-[100px]"
            onClick={() => navigate('/game')}
          />
        </div>
      </div>
      <div className='flex items-center justify-between mt-5 w-[95%] md:w-[60%] bg-slate-400/50 py-2 px-3 rounded-full'> 
        <div className='ubuntu-bold flex items-center'>
          <motion.img 
            src={icons.Pickaxe} 
            alt='pickaxe..' 
            className='w-8 h-8 mx-2 origin-bottom-left'
            initial={{ rotateZ: -10 }}
            animate={mineState === 1 ? { rotateZ: 30 } : { rotateZ: -10 }}
            transition={{
              duration: 1,
              repeat: mineState === 1 ? Infinity : 0,
              repeatType: 'reverse',
              ease: "easeInOut"
            }}
          />
          <SlotCounter 
            value={minedCoins}
            numberClassName='text-2xl md:text-3xl'
            containerClassName='mx-4'
          />
        </div>
        <CustomButton 
          text={mineTxt[mineState]}
          textStyle="ubuntu-bold mb-0 text-sm md:text-base"
          buttonStyle="flex items-center justify-center min-w-[90px] px-4"
          onClick={onStartMine}
          isLoading={loading}
        />
      </div>
      <p className='ubuntu-bold my-1.5 md:my-4 md:text-lg'>
          Mining Rate: &nbsp; 0.1/sec  &nbsp; Boost Rate: &nbsp; x{boostRate}
      </p>       
    </div>
  )
}

export default Dashboard