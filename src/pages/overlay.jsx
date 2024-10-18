import { useSelector } from "react-redux"

import { Navbar } from "../components"

import Dashboard from "./dashboard"
import CoinPage from "./coinPage"
import Friends from "./friends"
import Wallet from "./wallet"
import Wip from "./wip"
import { gifs } from "../constants"


const Overlay = () => {
    const currentTab = useSelector((state) => state.app.currentTab)

    const body = {
        dashboard: <Dashboard />,
        coins: <CoinPage />,
        friends: <Friends />,
        wallet: <Wallet />,
        wip: <Wip />,
    }

  return (
    <div className="relative text-white md:w-[60%] md:m-auto overflow-hidden">
        <img src={gifs.stars_a} alt="background.." className='h-full md:w-[60%] fixed z-0'/>
        {
            body[currentTab]
        }
        <Navbar />
    </div>
  )
}

export default Overlay