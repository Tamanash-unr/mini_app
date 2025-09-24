import React,{ useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

import { setModalOpen, setLoading, updateCoins } from '../../lib/redux/appSlice'
import { icons } from '../../constants'
import { CustomButton } from '../../components'
import { claimReferralReward } from '../../lib/firebase/firebase_api'
import { resetReferralReward } from '../../lib/redux/userSlice'

const ReferralRewards = () => {
    const [disabled, setDisabled] = useState(false)
    const uid = useSelector(state => state.user.data.id)
    const reward = useSelector(state => state.user.data.referralReward)
    const loading = useSelector(state => state.app.isLoading)

    const dispatch = useDispatch()

    const onClose = () => {
        dispatch(setModalOpen({isOpen: false, modalChild: null}))
    }

    const doOnClaim = async () => {
        dispatch(setLoading(true))
        const toastId = toast.loading("Claiming Reward..")

        const result = await claimReferralReward(uid, reward)

        if(result.status){
            dispatch(updateCoins(reward))
            dispatch(resetReferralReward())
            
            toast.success("Reward Claimed", {id: toastId})
        } else {
            toast.error(result.message, {id: toastId})
        }

        dispatch(setLoading(false))
    }

    useEffect(()=> {
        if(reward <= 0){
            setDisabled(true)
        }
    },[reward, setDisabled])

    return (
        <div className='flex justify-center items-center h-full'>
            <div className='ubuntu-bold bg-zinc-900 p-8 rounded-lg w-[85%] md:w-[40%]'>
                <div className='flex justify-between items-center'>
                    <div className='text-2xl md:text-2xl flex gap-2'>
                        Referral Rewards
                        <img src={icons.Gift} alt="bolt.." className='h-5 md:h-7 w-5 md:w-7' />
                    </div>                
                    <button className='text-2xl hover:text-gray-400' onClick={onClose} disabled={loading}>x</button>
                </div>                
                <div className='flex flex-col items-center'>
                    <motion.div 
                        className='text-6xl my-6 flex items-center gap-2'
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
                        <img src={icons.Placeholder} alt="line-coin.." className='w-12 h-12'/>
                        {reward}
                    </motion.div>
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
        </div>
    )
}

export default ReferralRewards