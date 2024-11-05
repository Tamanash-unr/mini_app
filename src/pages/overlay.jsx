import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"

import { Navbar, Modal } from "../components"

import Dashboard from "./dashboard"
import CoinPage from "./coinPage"
import Friends from "./friends"
import Wallet from "./wallet"
import Wip from "./wip"
import DailyRewards from "./dailyRewards"
import { gifs } from "../constants"
import { setModalOpen } from "../lib/appSlice"


const Overlay = () => {
    const currentTab = useSelector(state => state.app.currentTab)
    const daily = useSelector(state => state.app.dailyClaimed)

    const dispatch = useDispatch()

    useEffect(() => {
      if(!daily){
        dispatch(setModalOpen({isOpen: true, modalChild: 'dailyRewards'}))
      }
    },[daily, dispatch])

    const body = {
        dashboard: <Dashboard />,
        coins: <CoinPage />,
        friends: <Friends />,
        wallet: <Wallet />,
        wip: <Wip />,
    }

    const modalBody = {
      dailyRewards: <DailyRewards />,
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
    </div>
  )
}

export default Overlay