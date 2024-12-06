import React from 'react'
import { motion } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'

import { Card } from '../../components'
import { updateCoins, setCurrentTab } from '../../lib/redux/appSlice'
import { updateClaimedTask, updateCompletedTask } from '../../lib/redux/userSlice'
import { icons } from '../../constants'
import {updateTaskData } from '../../lib/firebase/firebase_api'
import toast from 'react-hot-toast'

const DailyTasks = () => {
    const tasks = useSelector(state => state.tasks.dailyTasks)
    const coins = useSelector(state => state.app.coinValue)
    const uid = useSelector(state => state.user.data.id)
    const userTaskData = useSelector(state => state.user.tasks.daily)

    const dispatch = useDispatch()

    const checkGCLogin = async (taskData, btnLoading) => {
        if(!userTaskData[taskData.id]){
            dispatch(updateCompletedTask({type: 'daily', taskId: taskData.id}))
            dispatch(setCurrentTab("gameCenter"))
        } else if(userTaskData[taskData.id] && userTaskData[taskData.id].completed) {
            btnLoading(true)

            await claimTask('daily', taskData.id, taskData.reward)

            btnLoading(false)
        }
    }
  
    const checkDaily = async (taskData, btnLoading) => {
        if(userTaskData[taskData.id] && userTaskData[taskData.id].completed) {
            btnLoading(true)

            await claimTask('daily', taskData.id, taskData.reward)
            
            /*const toastID = toast.loading('Updating..')

            const total = parseFloat((coins + taskData.reward).toFixed(2))
            console.log(total)
            const updateTask = await updateTaskData(uid, taskData.id, {completed: false, claimed: true}, 'daily', total)

            if(updateTask.status){
                dispatch(updateClaimedTask({type: 'daily', taskId: taskData.id}))
                dispatch(updateCoins(taskData.reward))
                toast.success("Task Claimed", { duration: 2500, id: toastID })
            } else {
                toast.error(updateTask.message, { duration: 5000, id: toastID })
            } */

            btnLoading(false)
        }
    }
  
    const checkVisitChannel = async (taskData, btnLoading) => {
        if(!userTaskData[taskData.id]){
            dispatch(updateCompletedTask({type: 'daily', taskId: taskData.id}))
        } else if(userTaskData[taskData.id] && userTaskData[taskData.id].completed) {
            btnLoading(true)

            await claimTask('daily', taskData.id, taskData.reward)

            btnLoading(false)
        }
    }

    const claimTask = async (taskType, taskId, reward) => {
        const toastID = toast.loading('Updating..')

        const total = parseFloat((coins + reward).toFixed(2))
        const updateTask = await updateTaskData(uid, taskId, {completed: false, claimed: true}, taskType, total)

        if(updateTask.status){
            dispatch(updateClaimedTask({type: taskType, taskId}))
            dispatch(updateCoins(reward))
            toast.success("Task Claimed", { duration: 2500, id: toastID })
        } else {
            toast.error(updateTask.message, { duration: 5000, id: toastID })
        }
    }

    const getBtnText = (id) => {
        if(userTaskData[id] && userTaskData[id].completed){
            return 'Claim'
        } else if(userTaskData[id] && userTaskData[id].claimed){
            return 'Claimed'
        }

        return 'Start'
    }
  
    const taskFunctions = {
      'checkGCLogin': checkGCLogin,
      'checkDailyLogin': checkDaily,
      'checkVisitChannel': checkVisitChannel,
    }

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
                    tasks.map((task, index) => (
                        <Card
                            key={`dailyTask_${index}`} 
                            title={task.title}
                            titleStyle="text-base md:text-xl"
                            btnTxt={getBtnText(task.id)}
                            btnStyle="min-w-[90px] md:min-w-[100px]"
                            txtStyle="flex justify-center items-center m-0 ubuntu-medium text-sm md:text-lg"
                            subtitle={`${task.reward}`}
                            subtitleStyle="text-md flex items-center"
                            subIcon={icons.Placeholder}
                            subIconStyle='w-5 h-5 mr-1 mt-1'
                            onExecute={(btnLoading) => taskFunctions[task.functionToTrigger](task, btnLoading)}
                            childIndex={index + 1}
                            btnDisabled={userTaskData[task.id]?.claimed ?? false}
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
                <p className='ubuntu-bold text-sm md:text-lg'>
                    Coming Soon...
                </p>
            </motion.div>
        </div>
    )
}

export default DailyTasks