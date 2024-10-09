import { useSelector, useDispatch } from "react-redux"

import { TabButton } from "../components"
import { icons } from "../constants"

import Dashboard from "./dashboard"
import CoinPage from "./coinPage"
import Store from "./store"
import Profile from "./profile"
import { setCurrentTab } from "../lib/appSlice"

const Overlay = () => {
    const nickname = useSelector((state) => state.user.nickname)
    const currentTab = useSelector((state) => state.app.currentTab)
    const dispatch = useDispatch()

    const body = {
        dashboard: <Dashboard />,
        coins: <CoinPage />,
        store: <Store />,
        profile: <Profile />
    }

    console.log(body[currentTab])

  return (
    <div className="relative text-white">
        <div className="fixed z-20 flex items-center text-xl p-4 top-0 bg-black w-full h-16 ubuntu-bold">
            Welcome! {nickname}
        </div>
        {
            body[currentTab]
        }
        <nav className="fixed bottom-0 z-20 flex items-center justify-between text-xl px-4 bg-black w-full h-16">
            <TabButton
                icon={icons.Home} 
                iconStyle="w-[30px] h-[30px]"
                buttonStyle="p-2 w-full h-full flex justify-center items-center"
                onClick={() => dispatch(setCurrentTab("dashboard"))}

            />
            <TabButton 
                icon={icons.Coins} 
                iconStyle="w-[30px] h-[30px]"
                buttonStyle="p-2 w-full h-full flex justify-center items-center"
                onClick={() => dispatch(setCurrentTab("coins"))}
            />
            <TabButton 
                icon={icons.Store} 
                iconStyle="w-[30px] h-[30px]"
                buttonStyle="p-2 w-full h-full flex justify-center items-center"
                onClick={() => dispatch(setCurrentTab("store"))}
            />
            <TabButton 
                icon={icons.Profile} 
                iconStyle="w-[30px] h-[30px]"
                buttonStyle="p-2 w-full h-full flex justify-center items-center"
                onClick={() => dispatch(setCurrentTab("profile"))}
            />
        </nav>
    </div>
  )
}

export default Overlay