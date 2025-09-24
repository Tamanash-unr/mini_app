import React, {useState, useEffect, useRef} from 'react'
import Confetti from 'react-confetti'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'

import { CustomButton } from '../../components'
import { icons } from '../../constants'
import { setDailyClaimed, setModalOpen, updateCoins, setLoading, updateTickets } from '../../lib/redux/appSlice'
import { updateCompletedTask } from '../../lib/redux/userSlice'
import { updateDailyClaim } from '../../lib/firebase/firebase_api'

const DailyRewards = ({  }) => {
    const [showConfetti, setShowConfetti] = useState(false)
    const [disabled, setDisabled] = useState(false)
    const dailyStreak = useSelector(state => state.app.dailyStreak)
    const loading = useSelector(state => state.app.isLoading)
    const svgRef = useRef([]);
    
    const dailyTickets = 4;

    const uid = useSelector(state => state.user.data.id)
    const coinsEarned = useSelector(state => state.app.coinValue)
    const tickets = useSelector(state => state.app.tickets)

    const dispatch = useDispatch();

    const doOnClaim = async () => {
        dispatch(setLoading(true))
        setDisabled(true)

        const coins = dailyStreak > 0 ? dailyStreak * 50 : 25;
        const taskData = {
            completed: true,
            claimed: false
        }

        const result = await updateDailyClaim(uid, {dailyStreak: dailyStreak+1, coinsEarned: coinsEarned+coins, tickets: tickets+dailyTickets}, {id: "1866457923", data: taskData})
        
        if(result.status){
            setShowConfetti(true);
            dispatch(updateCoins(coins))
            dispatch(updateTickets(dailyTickets));
            dispatch(updateCompletedTask({type: 'daily', taskId: "1866457923"}))
        } else {
            toast.error(result.message, {duration: 5000})
            setDisabled(false)
        }
        
        dispatch(setLoading(false))
    }

    const onClaimComplete = () => {
        dispatch(setDailyClaimed(true))
        setShowConfetti(false)
        dispatch(setModalOpen({isOpen: false, modalChild: null}))
    }

    useEffect(() => {
        const svgFiles = [icons.svgCoin];
        let loadedCount = 0;
        
        // Create Image objects for each SVG
        svgFiles.forEach((svgSrc) => {
        const img = new Image();
        
        img.onload = () => {
            loadedCount++;
            // When all images are loaded, set imagesLoaded to true
            // if (loadedCount === svgFiles.length) {
            // setImagesLoaded(true);
            // }
        };
        
        img.src = svgSrc;
        svgRef.current.push(img);
        });
    },[])
    
    const drawSvgConfetti = (ctx, colors) => {
        if (svgRef.current.length === 0){
            console.error("Failed to load Images");
            return false;
        };

        const svgImage = svgRef.current[0];
        
        ctx.save();

        const aspectRatio = svgImage.naturalWidth / svgImage.naturalHeight;
        let drawWidth, drawHeight;

        if (aspectRatio > 1) {
            drawWidth = 30;
            drawHeight = 30 / aspectRatio;
          } else {
            drawHeight = 30;
            drawWidth = 30 * aspectRatio;
          }

        ctx.drawImage(svgImage, -drawWidth/2, -drawHeight/2, drawWidth, drawHeight);

        ctx.restore();

        return true;
    }
  return (
    <div className='flex justify-center items-center h-full'>
        <div className='ubuntu-bold bg-zinc-900 p-8 rounded-lg w-[85%] md:w-[40%]'>
            <h1 className='text-2xl md:text-4xl flex items-center justify-center'>
                Daily Rewards
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
                <div className='flex items-center gap-x-3'>
                    <motion.div 
                        className='flex flex-col items-center text-4xl my-4 bg-gray-400 bg-opacity-50 py-2 px-6 rounded-lg'
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
                        <div className='flex items-center'>
                            <img src={icons.Placeholder} alt="coin.." className='h-8 w-8 mr-2'/>
                            {
                                dailyStreak > 0 ?
                                dailyStreak * 50 :
                                25
                            }
                        </div>
                    </motion.div>
                    <motion.div 
                        className='flex flex-col items-center text-4xl my-4 bg-gray-400 bg-opacity-50 py-2 px-6 rounded-lg'
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
                        <div className='flex items-center'>
                            <img src={icons.Ticket} alt="coin.." className='h-8 w-8 mr-2'/>
                            {dailyTickets}
                        </div> 
                    </motion.div>
                </div>
                <CustomButton 
                    text="Claim Bonus"
                    textStyle="m-0 ubuntu-bold"
                    buttonStyle='mt-4'
                    onClick={doOnClaim}
                    isLoading={loading}
                    disabled={disabled}
                />
            </div>
        </div>
        {
            showConfetti && 
            <Confetti
                className='w-full h-full'
                recycle={false}
                numberOfPieces={150}
                onConfettiComplete={onClaimComplete}
                drawShape={drawSvgConfetti}
            />
        }
    </div>
  )
}

export default DailyRewards