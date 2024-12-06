import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

import { CustomButton, Card, Indicator } from '../components'
import { setModalOpen } from '../lib/redux/appSlice'
import { icons } from '../constants'

const Friends = () => {
  const count = useSelector(state => state.user.friendsCount)
  const referrals = useSelector(state => state.user.data.referrals)
  const referralId = useSelector(state => state.user.data.referralId)
  const referralReward = useSelector(state => state.user.data.referralReward)
  const appUrl = "http://t.me/tm_miniapp_bot/tm_webapp"

  const dispatch = useDispatch()


  const handleInviteFriend = () => {
    const tg = window.Telegram.WebApp;
    const inviteLink = `${appUrl}?startapp=${referralId}`
    const shareText = "Join me on Line Crypto!"
    const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`

    tg.openTelegramLink(fullUrl)
  }

  const handleCopyLink = () => {
    try {
      const inviteLink = `${appUrl}?startapp=${referralId}`
      navigator.clipboard.writeText(inviteLink)
      toast.success("Copied to Clipboard", {duration: 2500})
    } catch (error) {
      toast.error(error, {duration: 2500})
    }
  }

  return (
    <div className='relative w-full h-screen z-10 p-2 flex flex-col items-center md:w-[60%] md:mx-auto'>
      {
        count > 0 ? 
          <>
            <h1 className='ubuntu-bold text-2xl md:text-4xl'>
              <img src={icons.FriendsPortrait} alt='friendsPortrait..' className='mx-auto my-4 w-24 h-24 md:w-18 md:h-18' />
              Invite Friends. Earn Rewards
            </h1>
            <div className='flex gap-2 mb-4'>
              <CustomButton 
                text="Invite Friends"
                textStyle="m-0 ubuntu-bold text-sm md:text-xl"
                buttonStyle="md:min-w-[40%] py-3 px-4 flex items-center"
                btnIcon={icons.Friends}
                btnIconStyle="w-6 h-6 mr-2"
                onClick={handleInviteFriend}
              />
              <CustomButton 
                text="Copy Invite Link"
                textStyle="m-0 ubuntu-bold text-sm md:text-xl"
                buttonStyle="md:min-w-[40%] py-3 px-4 flex items-center"
                btnIcon={icons.Copy}
                btnIconStyle="w-8 h-8"
                onClick={handleCopyLink}
              />
            </div>
            <div className='w-[90%] md:w-full flex justify-between items-center'>
              <h3 className='ubuntu-bold text-xl md:text-2xl'>Your Referrals</h3>
              <div className='flex gap-2'>
                <div className='flex items-center bg-black/75 rounded-xl px-4 py-2 ubuntu-bold text-2xl'>
                  <img src={icons.User} alt="userIcon.." className='w-5 h-5 mr-2'/>
                  {count}
                </div>
                <div className='relative flex items-center bg-black/75 rounded-xl px-4 py-2 ubuntu-bold text-2xl hover:cursor-pointer hover:bg-white/25' onClick={() => dispatch(setModalOpen({isOpen: true, modalChild: 'referralRewards'}))}>
                  <img src={icons.Gift} alt="userIcon.." className='w-7 h-7'/>
                  { referralReward > 0 && <Indicator styleInner="bg-red-600" styleOuter="bg-red-600" /> }
                </div>
              </div>
            </div>
            <div className='flex flex-col items-center w-full overflow-y-scroll mb-20'>
              <motion.div 
                className='flex flex-col items-start w-[90%] my-1 py-6'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    duration: 0.8,
                    ease: "easeOut"
                }}
              >
                {
                  referrals.map((name, index) => (
                    <Card 
                      key={`referrals_${index}`}
                      contentStyle="flex items-center"
                      title={name}
                      titleStyle="text-base md:text-xl"
                      cardIcon={icons.User}
                      cardIconStyle="w-8 h-8 mr-4"
                      txtStyle="flex justify-center items-center m-0 ubuntu-medium text-sm md:text-lg"
                      childIndex={index + 1}
                      hideBtn={true}
                    />
                  ))
                }
              </motion.div>
            </div>
          </>
        :
          <>
            <h1 className='ubuntu-bold text-2xl md:text-4xl'>
              <img src={icons.FriendsPortrait} alt='friendsPortrait..' className='mx-auto my-4 w-44 h-44 md:w-auto md:h-auto' />
              Invite Friends. Earn Rewards
            </h1>
            <div className='self-start md:w-[60%] mx-auto '>
              <p className='ubuntu-bold text-2xl md:text-3xl'>How it works?</p>
              <ul className='px-4 ubuntu-medium space-y-2 text-lg md:text-2xl'>
                <li>- Share your invitation Link.</li>
                <li>- Your friends join Line with the Link.</li>
                <li>- Score 50 coins for each friend who joins.</li>
              </ul>
            </div>
            <div className='flex gap-2 mb-2'>
              <CustomButton 
                text="Invite Friends"
                textStyle="m-0 ubuntu-bold text-sm md:text-xl"
                buttonStyle="md:min-w-[40%] mt-10 py-3 px-4 flex items-center"
                btnIcon={icons.Friends}
                btnIconStyle="w-6 h-6 mr-2"
                onClick={handleInviteFriend}
              />
              <CustomButton 
                text="Copy Invite Link"
                textStyle="m-0 ubuntu-bold text-sm md:text-xl"
                buttonStyle="md:min-w-[40%] mt-10 py-3 px-4 flex items-center"
                btnIcon={icons.Copy}
                btnIconStyle="w-8 h-8"
                onClick={handleCopyLink}
              />
            </div>
          </>
      }
    </div>
  )
}

export default Friends