import React from 'react'
import { useSelector } from 'react-redux'

import { CustomButton } from '../components'
import { icons } from '../constants'



const Friends = () => {
  const count = useSelector(state => state.user.friendsCount)

  return (
    <div className='relative w-full h-screen z-20 p-2 flex flex-col items-center'>
      <h1 className='ubuntu-bold text-2xl md:text-4xl'>
        <img src={icons.FriendsPortrait} alt='friendsPortrait..' className='mx-auto my-4 w-44 h-44 md:w-auto md:h-auto' />
        Invite Friends. Earn Rewards
      </h1>
      <div className='self-start md:w-[60%] mx-auto '>
        <p className='ubuntu-bold text-2xl md:text-3xl'>How it works?</p>
        <ul className='px-4 ubuntu-medium space-y-2 text-lg md:text-2xl'>
          <li>- Share your invitation Link.</li>
          <li>- Your friends join Line with the Link.</li>
          <li>- Score 10% for each friend who joins.</li>
        </ul>
      </div>
      <CustomButton 
        text="Invite Friends"
        textStyle="m-0 ubuntu-bold text-xl md:text-[28px]"
        buttonStyle="min-w-[80%] md:min-w-[40%] mt-10 md:mt-20 py-4"
        onClick={() => false}
      />
    </div>
  )
}

export default Friends