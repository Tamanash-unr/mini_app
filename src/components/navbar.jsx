import { useDispatch } from "react-redux"

import TabButton from "./tabButton"
import { icons } from "../constants"
import { setCurrentTab } from "../lib/appSlice"

const Navbar = () => {
    
    const dispatch = useDispatch()

  return (
    <nav className="fixed bottom-0 z-20 rounded-t-full flex items-center justify-between text-xl px-4 bg-black w-full h-16 md:w-[60%]">
        <TabButton
            icon={icons.Home} 
            iconStyle="w-[25px] md:w-[30px] h-[25px] md:h-[30px]"
            buttonStyle="p-2 w-full h-full flex justify-center items-center"
            onClick={() => dispatch(setCurrentTab("dashboard"))}

        />
        <TabButton 
            icon={icons.Coins} 
            iconStyle="w-[25px] md:w-[30px] h-[25px] md:h-[30px]"
            buttonStyle="p-2 w-full h-full flex justify-center items-center"
            onClick={() => dispatch(setCurrentTab("coins"))}
        />
        <div className="relative flex justify-center w-48 mx-4 md:mx-auto md:w-1/2 h-full">
            <TabButton 
                icon={icons.Coins} 
                iconStyle="w-[30px] md:w-[30px] h-[30px] md:h-[30px]"
                buttonStyle="absolute w-20 md:w-auto p-6 md:p-9 flex justify-center items-center bg-indigo-600 rounded-full bottom-5 md:bottom-2"
                onClick={() => dispatch(setCurrentTab("coins"))}
            />
        </div>
        <TabButton 
            icon={icons.Store} 
            iconStyle="w-[25px] md:w-[30px] h-[25px] md:h-[30px]"
            buttonStyle="p-2 w-full h-full flex justify-center items-center"
            onClick={() => dispatch(setCurrentTab("store"))}
        />
        <TabButton 
            icon={icons.Profile} 
            iconStyle="w-[25px] md:w-[30px] h-[25px] md:h-[30px]"
            buttonStyle="p-2 w-full h-full flex justify-center items-center"
            onClick={() => dispatch(setCurrentTab("profile"))}
        />
    </nav>
  )
}

export default Navbar