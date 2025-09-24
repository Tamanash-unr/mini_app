import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import toast, { Toaster } from "react-hot-toast"

import { Navbar, Modal } from "../components"

import Dashboard from "./dashboard"
import CoinPage from "./coinPage"
import Friends from "./friends"
import Wallet from "./wallet"
import GameCenter from "./gameCenter"
import Wip from "./wip"
import { DailyRewards, BoostPage, ReferralRewards, ProfileInfo } from "./modals"
import { gifs } from "../constants"
import { getTaskData } from "../lib/firebase/firebase_api"
import { setModalOpen } from "../lib/redux/appSlice"
import { initTasks } from "../lib/redux/taskSlice"

const Overlay = () => {
    const currentTab = useSelector(state => state.app.currentTab)
    const daily = useSelector(state => state.app.dailyClaimed)

    const dispatch = useDispatch()

    const retrieveTasks = async () => {
      const data = await getTaskData();

      if(data.status){
        dispatch(initTasks(data.tasks))
      } else {
        toast.error(data.message, {duration: 2500})
      }
    }

    useEffect(() => {
      if(!daily){
        dispatch(setModalOpen({isOpen: true, modalChild: 'dailyRewards'}))
      }
    },[daily, dispatch])

    useEffect(()=>{
      retrieveTasks()
    },[])

    const body = {
        dashboard: <Dashboard />,
        coins: <CoinPage />,
        friends: <Friends />,
        wallet: <Wallet />,
        gameCenter: <GameCenter />,
        wip: <Wip />,
    }

    const modalBody = {
      dailyRewards: <DailyRewards />,
      boostPage: <BoostPage />,
      referralRewards: <ReferralRewards />,
      profileInfo: <ProfileInfo />,
    }

  return (
    <div className="relative text-white md:w-[60%] md:m-auto overflow-hidden">
        <Modal 
          children={modalBody}
        />
        <img src={gifs.stars_a} alt="background.." className='h-full md:w-[60%] fixed z-0'/>
        {
            body[currentTab]
        }
        <Navbar />
        <Toaster 
          toastOptions={{
            className: 'ubuntu-medium',
            style: {
                background: '#1d1d1e',
                color: 'white',
            },
            position: 'bottom-center'
          }}
        />
    </div>
  )
}

export default Overlay