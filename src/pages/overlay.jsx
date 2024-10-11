import { useSelector } from "react-redux"

import { Navbar } from "../components"

import Dashboard from "./dashboard"
import CoinPage from "./coinPage"
import Store from "./store"
import Profile from "./profile"
import { gifs } from "../constants"


const Overlay = () => {
    const nickname = useSelector((state) => state.user.nickname)
    const currentTab = useSelector((state) => state.app.currentTab)

    const body = {
        dashboard: <Dashboard />,
        coins: <CoinPage />,
        store: <Store />,
        profile: <Profile />
    }

    console.log(body[currentTab])

  return (
    <div className="relative text-white md:w-[60%] md:m-auto">
        <div className="fixed z-20 flex items-center text-xl p-4 top-0 bg-black w-full h-16 ubuntu-bold md:w-[60%]">
            Welcome! {nickname}
        </div>
        <img src={gifs.stars_a} className='h-full md:w-[60%] fixed z-0'/>
        {
            body[currentTab]
        }
        <Navbar />
    </div>
  )
}

export default Overlay