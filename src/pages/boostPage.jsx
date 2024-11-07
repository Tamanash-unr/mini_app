import React, {useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'

import { Card } from '../components'
import { dummy, icons } from '../constants'
import { setModalOpen, updateBoostRate, updateCoins, updateMineState } from '../lib/appSlice'
import { updateBoostLevel } from '../lib/userSlice'

const BoostPage = () => { 
    const currentBoost = useSelector(state => state.user.boostLevel)
    const coins = useSelector(state => state.app.coinValue)
    const dispatch = useDispatch()

    useEffect(()=>{},[currentBoost])

    const onClose = () => {
        dispatch(setModalOpen({isOpen: false, modalChild: null}))
    }

    const getBtnText = (level) => {
        if(currentBoost >= level){
            return 'Unlocked'
        } 
        
        if(currentBoost+1 === parseInt(level)) {
            return 'Activate'
        }

        return 'Unlock Previous'
    }

    const onBoostLevelActivate = (level) =>{
        if(coins < dummy.boostLevels[level]){
            return toast.error("Not enough Coins", {
                duration: 2500,
                position: 'bottom-center',
                style: {
                    background: '#1d1d1e',
                    color: 'white',
                }
            })
        }

        if(parseInt(level) > 0){
            const rate = parseFloat((1 + (0.15 * parseInt(level))).toFixed(2))

            dispatch(updateBoostRate(rate))
            dispatch(updateMineState(1))
            dispatch(updateCoins(-(dummy.boostLevels[level])))
        }

        dispatch(updateBoostLevel(parseInt(level)))
        onClose()
    }

    return (
    <div className='flex justify-center items-center h-full'>
        <div className='ubuntu-bold bg-zinc-900 rounded-xl w-[95%] md:w-[40%] min-h-[75%] md:max-h-[60%] overflow-hidden'>
            <h1 className='text-2xl md:text-4x pt-6 px-8 flex items-center justify-between'>
                Boost Rate
                <button className='text-2xl hover:text-gray-400' onClick={onClose}>x</button>
            </h1>
            <div className='overflow-y-scroll w-full px-4 h-[480px] md:h-[450px] mb-2'>
            {
                Object.keys(dummy.boostLevels).map((level, index) => (
                    <Card   
                        key={`boostLevel_${level}`}
                        title={`Level ${level} --> x${parseFloat((1 + (0.15 * parseInt(level))).toFixed(2))}`}
                        titleStyle="text-base md:text-xl"
                        subtitle={`${dummy.boostLevels[level]}`}
                        subtitleStyle="text-md flex items-center"
                        subIcon={icons.Placeholder}
                        subIconStyle='w-5 h-5 mr-1'
                        btnStyle="min-w-[90px] md:min-w-[100px]"
                        btnTxt={`${getBtnText(level)}`}
                        txtStyle="flex justify-center items-center m-0 ubuntu-bold text-sm"
                        childIndex={index + 1}
                        btnDisabled={getBtnText(level) !== 'Activate' ? true : false}
                        onExecute={() => onBoostLevelActivate(level)}
                    />
                ))
            }
            </div>
        </div>
    </div>
    )
}

export default BoostPage