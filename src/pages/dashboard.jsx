import React, {useCallback, useEffect, useState} from 'react'
import { motion } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import SlotCounter from 'react-slot-counter'
import { useNavigate } from 'react-router-dom'

import { icons, gifs } from '../constants'
import { CustomButton } from '../components'
import { updateCoins, updateMineState, updateMinedCoins, updateEarnedFromGame, setModalOpen, setLoading, updateTickets } from '../lib/redux/appSlice'
import { updateEarnedCoins, serverUpdateMining } from '../lib/firebase/firebase_api'
import toast from 'react-hot-toast'

const Dashboard = () => {
    const nickname = useSelector(state => state.user.nickname)
    const fname = useSelector(state => state.user.data.first_name)
    const lname = useSelector(state => state.user.data.last_name)
    const uid = useSelector(state => state.user.data.id)
    const profilePic = useSelector(state => state.user.data.photo_url)
    const coins = useSelector(state => state.app.coinValue)
    const tickets = useSelector(state => state.app.tickets)
    const minedCoins = useSelector(state => state.app.minedCoins)
    const mineState = useSelector(state => state.app.mineState)
    const miningDuration = useSelector(state => state.app.miningDuration)
    const currentMiningDuration = useSelector(state => state.app.currentMiningDuration)
    const boostLevel = useSelector(state => state.user.boostLevel)
    const boostRate = useSelector(state => state.app.boostRate);
    const loading = useSelector(state => state.app.isLoading)
    const earned = useSelector(state => state.app.earnedFromGame)
    const userRank = useSelector(state => state.app.userRank);

    const [miningProgress, setMiningProgress] = useState(0)

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const hasEarnedFromGame = useCallback(async (value) => {
      if (value > 0) {
        const total = parseFloat((coins + value).toFixed(2))
        const result = await updateEarnedCoins(uid, total, tickets)

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
        const result = await updateEarnedCoins(uid, total, tickets)

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

    const onShowProfile = () => {
      dispatch(setModalOpen({isOpen: true, modalChild: 'profileInfo'}))
    }

    const onPlay = () => {
      if(tickets <= 0){
        toast.error('You have no tickets to play', {duration: 2500})
        return;
      }

      dispatch(updateTickets(-1)); 
      navigate('/game');
    }

    const getRankTxt = () => {
      const rank = Math.floor(boostLevel/5)

      return (
        <p className={`m-0 pb-1.5 ${userRank[rank > 3 ? 3 : rank].style} text-transparent bg-clip-text`}>
          <i class={userRank[rank > 3 ? 3 : rank].icon} />
          {userRank[rank > 3 ? 3 : rank].name}
          <i class={userRank[rank > 3 ? 3 : rank].icon} />
        </p>
      )
    }

    const getRankProgress = () => {
      const progress = ((boostLevel%5)/5)*100

      return (
        <div className={`h-2 my-0.5 bg-sky-400 rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}/>
      )
    }

  return (
    <div className='relative w-full h-full z-10 flex flex-col items-center mb-20'>
      <div className="relative bg-black flex flex-col items-center justify-between text-xl py-3 px-0 top-0 w-full ubuntu-bold text-[16px] md:text-2xl mb-32 md:mb-36 h-6">
          <div className='w-full rounded-b-3xl md:rounded-b-full flex flex-col items-center justify-center -mt-3 md:-mt-2 bg-inherit hover:cursor-pointer' onClick={onShowProfile}>
            {/* User Profile */}
            <div className='flex items-center justify-center w-full gap-x-2 pt-1.5'>
              {
                profilePic !== '' ?
                <img src={profilePic} alt='profilePic...' className='rounded-full size-10 md:size-16 object-cover'/> :
                <div className='bg-white rounded-full size-10 md:size-12 flex items-center justify-center'>
                  <p className='text-black text-xl m-0'>
                    {`${fname !== '' ? fname[0].toUpperCase() : 'U'}${lname !== '' ? lname[0].toUpperCase() : ''}`}
                  </p>
                </div>
              }
              <p className='m-0 max-w-[60%] truncate'>{nickname === '' ? fname : nickname}</p>
            </div>
            {
              getRankTxt()
            }
          </div>
          {/* Level Indicator */}
          <div className='flex flex-col w-2/4 md:w-1/4 text-center my-2.5'>
              Level {Math.floor(boostLevel%5)}/5<br/>
              <div className='w-full h-2 my-0.5 bg-black rounded-full'>
                {getRankProgress()}
              </div>
          </div>
          {/* Info Badges */}
          {/* <div className='flex items-center justify-between mt-2 mb-6 w-[90%] md:w-3/4'>
              <div className='bg-black min-w-[90px] rounded-full px-3 md:px-6 py-1 md:py-2 flex items-center justify-center gap-x-2'>
                <img src={icons.Nft} alt="Nft.." className='size-7 md:size-8'/>
                NFT
              </div>
              <div className='bg-black min-w-[90px] rounded-full px-3 md:px-6 py-1 md:py-2 flex items-center justify-center gap-x-2'>
                <img src={icons.Rocket} alt="Rocket.." className='size-7 md:size-8'/>
                x{boostRate}
              </div>
              <div className='bg-black min-w-[90px] rounded-full px-3 md:px-6 py-1 md:py-2 flex items-center justify-center gap-x-2'>
                <img src={icons.Ticket} alt="Ticket.." className='size-5 md:size-6'/>
                {tickets}
              </div>
          </div> */}
          {/* <div>
            Welcome! {nickname === '' ? fname : nickname}
          </div> */}
          {/* <div className='absolute right-4 md:right-10'>
            {
              profilePic !== '' ?
              <img src={profilePic} alt='profilePic...' className='rounded-full size-16 object-cover border-4 border-indigo-600'/> :
              <div className='bg-white rounded-full size-12 flex items-center justify-center border-4 border-indigo-600'>
                <p className='text-black text-xl m-0'>
                  {`${fname !== '' ? fname[0].toUpperCase() : 'U'}${lname !== '' ? lname[0].toUpperCase() : ''}`}
                </p>
              </div>
            }
          </div> */}
      </div>
      {/* Coins Display */}
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
      {/* Tech Image */}
      <img 
        src={gifs.tech} 
        alt='tech..' 
        className='w-[300px] h-[180px] md:w-[500px] md:h-[250px] rounded-xl border-2 border-indigo-600 shadow-[0px_4px_24px_#4f46e5] object-cover' 
      />
      {/* Line Game */}
      <div className='relative w-[300px] h-[180px] md:w-[500px] md:h-[250px] mt-4 md:mt-2 mb-2 rounded-xl border-2 border-indigo-600 shadow-[0px_4px_24px_#4f46e5] overflow-hidden'>
        <img src={icons.Game} alt="game.." className='w-full h-full'/>
        <div className='absolute bottom-0 px-3 pb-2 pt-5 w-full bg-gradient-to-t from-indigo-600 flex justify-between items-center'>
          <p className='m-0 ubuntu-bold text-xl md:text-2xl'>
            <span className='block md:inline'>Play</span> Line Game
          </p>
          <CustomButton
            btnIcon={icons.Ticket}
            btnIconStyle="size-5"
            preText={`${tickets}`}
            preTextStyle="ubuntu-bold ml-1 mr-2 text-lg md:text-xl" 
            text=""
            textStyle="m-0 ubuntu-bold"
            buttonStyle="p-1 min-w-28 flex items-center justify-center"
            onClick={onPlay}
          />
        </div>
      </div>
      {/* Mining Progress Bar */}
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
      {/* Mining Info Text */}
      <div className='flex items-center gap-x-3 ubuntu-bold my-1.5 md:my-4 md:text-lg'>
          {/* Mining Rate: &nbsp; 360/hr */}
          <div className='bg-black/75 rounded-lg px-3 md:px-6 py-2 md:py-2 flex items-center justify-center gap-x-2'>
            <img src={icons.Pickaxe} alt="Rocket.." className='size-6 md:size-8'/>
            {(360 * boostRate).toFixed(0)}/hr
          </div>
          <div className='bg-black/75 rounded-lg px-3 md:px-6 py-1.5 md:py-2 flex items-center justify-center gap-x-2'>
            <img src={icons.Rocket} alt="Rocket.." className='size-7 md:size-8'/>
            x{boostRate}
          </div>
      </div>       
    </div>
  )
}

export default Dashboard