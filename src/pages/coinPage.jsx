import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { setEarnTab } from '../lib/redux/appSlice'
import { TabButton } from '../components'

import { DailyTasks, Achievements, Redeem  } from './tabs'

const CoinPage = () => {
  const tab = useSelector(state => state.app.earnTab)
  const dispatch = useDispatch()

  const content = {
    'tasks': <DailyTasks />,
    'achievements': <Achievements />,
    'redeem': <Redeem />
  }

  return (
    <div className='relative flex flex-col items-center w-full h-dvh z-10'>
      <p className='w-full text-white mt-16 mb-1 text-center denver-regular text-6xl'>
        EARN
      </p>
      {/* <div className='flex w-full px-4 md:w-[60%] space-x-3'>
          <TabButton
              buttonStyle="p-2 w-full h-full rounded-full bg-black/75 hover:bg-black flex justify-center items-center"
              onClick={() => dispatch(setEarnTab("tasks"))}
              text="Tasks"
              textStyle="ubuntu-bold text-sm md:text-xl my-1"
          />
          <TabButton
              buttonStyle="p-2 w-full h-full rounded-full bg-black/75 hover:bg-black flex justify-center items-center"
              onClick={() => dispatch(setEarnTab("achievements"))}
              text="Achievements"
              textStyle="ubuntu-bold text-sm md:text-xl my-1 px-2"
          />
          <TabButton
              buttonStyle="p-2 w-full h-full rounded-full bg-black/75 hover:bg-black flex justify-center items-center"
              onClick={() => dispatch(setEarnTab("redeem"))}
              text="Code"
              textStyle="ubuntu-bold text-sm md:text-xl my-1"
          />
      </div> */}
      {
        content[tab]
      }
    </div>
  )
}

export default CoinPage