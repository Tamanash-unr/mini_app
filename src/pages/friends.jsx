import React from 'react'
import { useSelector } from 'react-redux'
import aes from 'crypto-js/aes'
import utf8 from 'crypto-js/enc-utf8'
import toast from 'react-hot-toast'

import { CustomButton } from '../components'
import { icons } from '../constants'
import { base64UrlEncode, base64UrlDecode } from '../lib/helper'

const Friends = () => {
  const count = useSelector(state => state.user.friendsCount)
  const referralId = useSelector(state => state.user.data.referralId)
  const appUrl = "http://t.me/tm_miniapp_bot/tm_webapp"

  const testEncrypt = () => {
      // const data = aes.encrypt('1897626681', process.env.REACT_APP_SECRET_KEY).toString()
      // const urlSafeData = base64UrlEncode(data)
      // console.log("base64 :", data)
      // console.log("urlSafe :", urlSafeData)
      
      // const dec_urlSafe = base64UrlDecode(urlSafeData)
      // const dec_Data = aes.decrypt(dec_urlSafe, process.env.REACT_APP_SECRET_KEY)
      // const decryptedData = dec_Data.toString(utf8)
      // console.log("dec_urlSafe :", dec_urlSafe)
      // console.log("decrypted :", decryptedData)
  }

  const handleInviteFriend = () => {
    const tg = window.Telegram.WebApp;
    const inviteLink = `${appUrl}?startapp=${referralId}`
    const shareText = "Join me on Line Crypto!"
    const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`

    tg.openTelegramLink(fullUrl)
  }

  const handleCopyLink = () => {
    const inviteLink = `${appUrl}?startapp=${referralId}`
    navigator.clipboard.writeText(inviteLink)
    toast.success("Copied to Clipboard", {duration: 2500})
  }

  return (
    <div className='relative w-full h-screen z-10 p-2 flex flex-col items-center'>
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
        onClick={handleInviteFriend}
      />
    </div>
  )
}

export default Friends