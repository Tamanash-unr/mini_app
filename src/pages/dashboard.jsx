import React, {useCallback, useEffect, useState} from 'react'
import { motion } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import SlotCounter from 'react-slot-counter'
import { useNavigate } from 'react-router-dom'

import { icons, gifs } from '../constants'
import { CustomButton } from '../components'
import { updateCoins, updateMineState, updateMinedCoins, updateEarnedFromGame, setModalOpen, setLoading } from '../lib/redux/appSlice'
import { updateEarnedCoins, serverUpdateMining } from '../lib/firebase/firebase_api'
import toast from 'react-hot-toast'

const Dashboard = () => {
    const nickname = useSelector(state => state.user.nickname)
    const name = useSelector(state => state.user.data.first_name)
    const uid = useSelector(state => state.user.data.id)
    const coins = useSelector(state => state.app.coinValue)
    const minedCoins = useSelector(state => state.app.minedCoins)
    const mineState = useSelector(state => state.app.mineState)
    const miningDuration = useSelector(state => state.app.miningDuration)
    const currentMiningDuration = useSelector(state => state.app.currentMiningDuration)
    const boostLevel = useSelector(state => state.user.boostLevel)
    const loading = useSelector(state => state.app.isLoading)
    const earned = useSelector(state => state.app.earnedFromGame)

    const [miningProgress, setMiningProgress] = useState(0)

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

    useEffect(() => {
      const progressStatus = () => {
        const progress = Math.floor((currentMiningDuration / (miningDuration * 60 * 60)) * 100)
        console.log(progress, (miningDuration * 60 * 60), currentMiningDuration)

        setMiningProgress(progress)
      }

      progressStatus()
    }, [setMiningProgress, currentMiningDuration])

    const onStartMine = async () => {
      if(mineState === 0){
        dispatch(setLoading(true))

        const result = await serverUpdateMining(uid, true)

        if(!result.status){ 
          toast.error(result.message, {duration: 2500})
        } else {
          dispatch(updateMineState(1))
        }

        dispatch(setLoading(false))
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
      <div className="relative flex items-center justify-between text-xl py-3 px-3 md:px-8 top-0 w-full ubuntu-bold text-2xl mt-2 md:mt-6">
          <div>
            Welcome! {nickname === '' ? name : nickname}
          </div>
          <div className="absolute right-2 h-[50px] w-[50px] sm:w-[70px] sm:h-[70px] p-8 md:p-10 text-xl sm:text-2xl flex justify-center items-center">
            <img src={icons.FullCrown} alt='crown...' className='absolute bottom-0.5 h-full w-full'/>
            <span className='relative z-10'>{boostLevel}</span>
          </div>
      </div>
      <motion.div 
        className='flex w-full items-center justify-center mb-4'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 2,
          delay: 0.3,
        }}
      >
          <img src={icons.Placeholder} alt='Coin_Placeholder' className='size-8 md:size-12 mx-2 md:mx-3'/>
          <SlotCounter 
            value={coins}
            numberClassName='ubuntu-bold text-3xl md:text-5xl'
            separatorClassName='text-3xl md:text-5xl'
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
      <div className='relative flex items-center justify-between mt-5 w-[95%] md:w-[60%] bg-slate-400/50 py-2 px-3 rounded-full overflow-hidden'>
        <div
          className="absolute z-0 h-full left-0 bg-indigo-400/75 rounded-full transition-all duration-500"
          style={{ width: `${miningProgress}%` }}
        />
        <div className='relative z-10 ubuntu-bold flex items-center'>
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
            charClassName='mx-[0.5px]'
            separatorClassName='text-xl md:text-3xl'
          />
        </div>
        <CustomButton 
          text={mineTxt[mineState]}
          textStyle="ubuntu-bold mb-0 text-sm md:text-base"
          buttonStyle="relative z-10 flex items-center justify-center min-w-[90px] px-4"
          onClick={onStartMine}
          isLoading={loading}
        />
      </div>
      <p className='ubuntu-bold my-1.5 md:my-4 md:text-lg'>
          Mining Rate: &nbsp; 360/hr
          {/* &nbsp; Boost Rate: &nbsp; x{boostRate} */}
      </p>       
    </div>
  )
}

export default Dashboard