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
    const dailyTasks = useSelector(state => state.tasks.dailyTasks)
    const socialTasks = useSelector(state => state.tasks.socialTasks)
    const coins = useSelector(state => state.app.coinValue)
    const uid = useSelector(state => state.user.data.id)
    const dailyTaskData = useSelector(state => state.user.tasks.daily)
    const socialTaskData = useSelector(state => state.user.tasks.social)

    const dispatch = useDispatch()

    const iconsMap = {
        'telegram': icons.Telegram,
        'twitter': icons.Twitter,
        'instagram': icons.Instagram
    }

    const checkGCLogin = async (taskData, btnLoading) => {
        if(!dailyTaskData[taskData.id]){
            dispatch(updateCompletedTask({type: 'daily', taskId: taskData.id}))
            dispatch(setCurrentTab("gameCenter"))
        } else if(dailyTaskData[taskData.id] && dailyTaskData[taskData.id].completed) {
            btnLoading(true)

            await claimTask('daily', taskData.id, taskData.reward)

            btnLoading(false)
        }
    }
  
    const checkDaily = async (taskData, btnLoading) => {
        if(dailyTaskData[taskData.id] && dailyTaskData[taskData.id].completed) {
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
        if(!dailyTaskData[taskData.id]){
            dispatch(updateCompletedTask({type: 'daily', taskId: taskData.id}))
        } else if(dailyTaskData[taskData.id] && dailyTaskData[taskData.id].completed) {
            btnLoading(true)

            await claimTask('daily', taskData.id, taskData.reward)

            btnLoading(false)
        }
    }

    const checkIgPage = async (taskData, btnLoading) => {
        const externalUrl = 'https://www.instagram.com/linecryptocoin/';
        if (window.Telegram?.WebApp?.openLink) {
            try {
                btnLoading(true);

                // 3. Update the component's state
                if(!socialTaskData[taskData.id]){
                    dispatch(updateCompletedTask({type: 'social', taskId: taskData.id}))
                } else if(socialTaskData[taskData.id] && socialTaskData[taskData.id].completed) {
                    await claimTask('social', taskData.id, taskData.reward)
                    return
                }

                // 2. Open the external link
                window.Telegram.WebApp.openLink(externalUrl, { try_instant_view: false }); // try_instant_view is optional
        
                // This happens immediately after initiating the link opening
                toast.success(`Attempted to open: ${externalUrl}`, { duration: 1000 });
              } catch (error) {
                toast.error(`Error calling openLink: ${error}`, { duration: 1500 });
                // Use showAlert for user feedback within Telegram if needed
                window.Telegram.WebApp.showAlert('Could not open the link.');
              } finally {
                btnLoading(false); // Optional: Reset loading state
              }
        }
    }

    const checkXPage = async (taskData, btnLoading) => {
        const externalUrl = 'https://x.com/LineCryptoCoin';
        if (window.Telegram?.WebApp?.openLink) {
            try {
                btnLoading(true);

                if(!socialTaskData[taskData.id]){
                    dispatch(updateCompletedTask({type: 'social', taskId: taskData.id}))
                } else if(socialTaskData[taskData.id] && socialTaskData[taskData.id].completed) {
                    await claimTask('social', taskData.id, taskData.reward)
                    return
                }

                // 2. Open the external link
                window.Telegram.WebApp.openLink(externalUrl, { try_instant_view: false }); // try_instant_view is optional
        
                // 3. Update the component's state
                
                // This happens immediately after initiating the link opening
                toast.success(`Attempted to open: ${externalUrl}`, { duration: 1000 });
              } catch (error) {
                toast.error(`Error calling openLink: ${error}`, { duration: 1500 });
                // Use showAlert for user feedback within Telegram if needed
                window.Telegram.WebApp.showAlert('Could not open the link.');
              } finally {
                btnLoading(false); // Optional: Reset loading state
              }
        }
    }

    const checkCommunity = async (taskData, btnLoading) => {
        const externalUrl = 'https://t.me/LineCommunity';
        if (window.Telegram?.WebApp?.openTelegramLink) {
            try {
                btnLoading(true);

                if(!socialTaskData[taskData.id]){
                    dispatch(updateCompletedTask({type: 'social', taskId: taskData.id}))
                } else if(socialTaskData[taskData.id] && socialTaskData[taskData.id].completed) {
                    await claimTask('social', taskData.id, taskData.reward)
                    return
                }

                // 2. Open the external link
                window.Telegram.WebApp.openTelegramLink(externalUrl); // try_instant_view is optional
        
                // 3. Update the component's state
                
                // This happens immediately after initiating the link opening
                toast.success(`Attempted to open: ${externalUrl}`, { duration: 1000 });
              } catch (error) {
                toast.error(`Error calling openLink: ${error}`, { duration: 1500 });
                // Use showAlert for user feedback within Telegram if needed
                window.Telegram.WebApp.showAlert('Could not open the link.');
              } finally {
                btnLoading(false); // Optional: Reset loading state
              }
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

    const getBtnText = (id, type) => {
        if(type === 'daily'){
            if(dailyTaskData[id] && dailyTaskData[id].completed){
                return 'Claim'
            } else if(dailyTaskData[id] && dailyTaskData[id].claimed){
                return 'Claimed'
            }
        } else {
            if(socialTaskData[id] && socialTaskData[id].completed){
                return 'Claim'
            } else if(socialTaskData[id] && socialTaskData[id].claimed){
                return 'Claimed'
            }
        }

        return 'Start'
    }
  
    const taskFunctions = {
      'checkGCLogin': checkGCLogin,
      'checkDailyLogin': checkDaily,
      'checkVisitChannel': checkVisitChannel,
      'checkIgPage': checkIgPage,
      'checkXPage': checkXPage,
      'checkCommunity': checkCommunity
    }

    return (
        <div className='flex flex-col items-center w-full overflow-y-scroll mb-20'>
            <motion.div 
                className='flex flex-col items-start w-[90%] md:w-[60%] my-4'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    duration: 0.8,
                    ease: "easeOut"
                }}
            >
                <p className='ubuntu-bold text-xl md:text-2xl'>Daily Tasks</p>

                {
                    dailyTasks.map((task, index) => (
                        <Card
                            key={`dailyTask_${index}`} 
                            title={task.title}
                            titleStyle="text-base md:text-xl"
                            btnTxt={getBtnText(task.id, 'daily')}
                            btnStyle="min-w-[90px] md:min-w-[100px]"
                            txtStyle="flex justify-center items-center m-0 ubuntu-medium text-sm md:text-lg"
                            subtitle={`${task.reward}`}
                            subtitleStyle="text-md flex items-center"
                            subIcon={icons.Placeholder}
                            subIconStyle='w-5 h-5 mr-1 mt-1'
                            onExecute={(btnLoading) => taskFunctions[task.functionToTrigger](task, btnLoading)}
                            childIndex={index + 1}
                            btnDisabled={dailyTaskData[task.id]?.claimed ?? false}
                        />
                    ))
                }
            </motion.div>
            <motion.div 
                className='flex flex-col items-start w-[90%] md:w-[60%] my-4'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    duration: 0.8,
                    ease: "easeOut"
                }}
            >
                <p className='ubuntu-bold text-xl md:text-2xl'>Social Tasks</p>
                {/* <p className='ubuntu-bold text-sm md:text-lg'>
                    {JSON.stringify(socialTasks)}
                </p> */}
                {/* <Card
                    key={`socialTask`} 
                    cardIcon={icons.Placeholder}
                    cardIconStyle="w-4 h-4"
                    title={'task.title'}
                    titleStyle="flex items-center text-base md:text-xl"
                    // btnTxt={getBtnText(task.id)}
                    btnTxt={'Go'}
                    btnStyle="min-w-[90px] md:min-w-[100px]"
                    txtStyle="flex justify-center items-center m-0 ubuntu-medium text-sm md:text-lg"
                    // subtitle={`${task.reward}`}
                    subtitle={`Done`}
                    subtitleStyle="text-md flex items-center"
                    subIcon={icons.Placeholder}
                    subIconStyle='w-5 h-5 mr-1 mt-1'
                    onExecute={(btnLoading) => console.log('done')}
                    childIndex={1}
                    btnDisabled={true}
                /> */}
                {
                    socialTasks.map((task, index) => (
                        <Card
                            key={`socialTask_${index}`}
                            cardIcon={iconsMap[task.icon]} 
                            cardIconStyle="w-6 h-6 mr-2"
                            title={task.title}
                            titleStyle="flex items-center text-base md:text-xl"
                            btnTxt={getBtnText(task.id, 'social')}
                            btnStyle="min-w-[90px] md:min-w-[100px]"
                            txtStyle="flex justify-center items-center m-0 ubuntu-medium text-sm md:text-lg"
                            subtitle={`${task.reward}`}
                            subtitleStyle="text-md flex items-center"
                            subIcon={icons.Placeholder}
                            subIconStyle='w-5 h-5 mr-1 mt-1'
                            onExecute={(btnLoading) => taskFunctions[task.functionToTrigger](task, btnLoading)}
                            childIndex={index + 1}
                            btnDisabled={socialTaskData[task.id]?.claimed ?? false}
                        />
                    ))
                }
            </motion.div>
        </div>
    )
}

export default DailyTasks