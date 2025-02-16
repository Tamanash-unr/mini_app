import React, {useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'

import { Card } from '../../components'
import { dummy, icons } from '../../constants'
import { setModalOpen, updateBoostRate, updateCoins, updateMineState } from '../../lib/redux/appSlice'
import { updateBoostLevel } from '../../lib/redux/userSlice'
import { updateBoostLevel as api_BoostLevel } from '../../lib/firebase/firebase_api'

const ProfileInfo = () => { 
    const currentBoost = useSelector(state => state.user.boostLevel);
    const uid = useSelector(state => state.user.data.id);
    const coins = useSelector(state => state.app.coinValue);
    const profilePic = useSelector(state => state.user.data.photo_url);
    const boostRate = useSelector(state => state.app.boostRate);
    const fname = useSelector(state => state.user.data.first_name);
    const lname = useSelector(state => state.user.data.last_name);
    const dispatch = useDispatch()

    useEffect(()=>{},[currentBoost])

    const onClose = () => {
        dispatch(setModalOpen({isOpen: false, modalChild: null}))
    }

    return (
    <div className='flex justify-center items-center h-full'>
        <div className='relative ubuntu-bold bg-zinc-900 rounded-xl w-[95%] md:w-[40%] min-h-[75%] md:min-h-[60%] overflow-hidden'>
            <button className='absolute right-6 my-2 text-2xl hover:text-gray-400' onClick={onClose}>x</button>
            <div className='overflow-y-scroll w-full px-4 h-[500px] md:h-[550px] mb-2'>
                <div className='my-3 flex flex-col items-center'>
                {
                    profilePic !== '' ?
                    <img src={profilePic} alt='profilePic...' className='rounded-full size-16 md:size-16 object-cover border-2 border-indigo-600'/> :
                    <div className='bg-white rounded-full size-16 md:size-16 flex items-center justify-center border-2 border-indigo-600'>
                    <p className='text-black text-xl m-0'>
                        {`${fname !== '' ? fname[0].toUpperCase() : 'U'}${lname !== '' ? lname[0].toUpperCase() : ''}`}
                    </p>
                    </div>
                }
                    <p className='m-0 py-2 text-xl'>{fname + ' ' + lname}</p>
                </div>
                <div className='mx-auto bg-neutral-800 rounded-xl p-3 flex flex-col'>
                    <div className='flex items-center justify-center text-xl'>
                        <img src={icons.Placeholder} alt='Coin_Placeholder' className='size-8 md:size-12 mx-2 md:mx-3'/>
                        {coins}
                    </div>
                    <hr className='w-[95%] h-2 mx-auto mt-2'/>
                    <div className='flex items-center justify-center'>
                        <div className='w-full flex items-center justify-center gap-x-2'>
                            <img src={icons.Ticket} alt="ticket.." className='size-8' />
                            Tickets Left: 10
                        </div>
                        <div className='h-[50px] border-[0.5px] border-white mx-2'/>
                        <div className='w-full flex items-center justify-center gap-x-1'>
                            <img src={icons.Rocket} alt="rocket.." className='size-10' />            
                            Boost Rate: x{boostRate}
                        </div>
                    </div>
                </div>
                <div className='my-2'>
                    <h2 className='text-xl mb-1'>Recent</h2>
                    <div className='flex gap-x-4'>
                        <div className='flex flex-col'>
                            <div className='size-12 rounded-xl bg-neutral-800'/>
                            App 1
                        </div>
                        <div className='flex flex-col'>
                            <div className='size-12 rounded-xl bg-neutral-800'/>
                            App 2
                        </div>
                        <div className='flex flex-col'>
                            <div className='size-12 rounded-xl bg-neutral-800'/>
                            App 3
                        </div>
                        <div className='flex flex-col'>
                            <div className='size-12 rounded-xl bg-neutral-800'/>
                            App 4
                        </div>
                    </div>
                </div>
                <div className='my-2'>
                    <h2 className='text-xl mb-1'>Favorites</h2>
                    <div className='flex gap-x-4'>
                        <div className='flex flex-col'>
                            <div className='size-12 rounded-xl bg-neutral-800'/>
                            App 1
                        </div>
                        <div className='flex flex-col'>
                            <div className='size-12 rounded-xl bg-neutral-800'/>
                            App 2
                        </div>
                        <div className='flex flex-col'>
                            <div className='size-12 rounded-xl bg-neutral-800'/>
                            App 3
                        </div>
                        <div className='flex flex-col'>
                            <div className='size-12 rounded-xl bg-neutral-800'/>
                            App 4
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
}

export default ProfileInfo