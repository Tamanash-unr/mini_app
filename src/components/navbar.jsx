import { useDispatch } from "react-redux"
import { motion } from "framer-motion"
import { useNavigate } from 'react-router-dom'

import TabButton from "./tabButton"
import { icons } from "../constants"
import { setCurrentTab } from "../lib/redux/appSlice"

const Navbar = () => {
    const navigate = useNavigate()

    const bounceAnimation = {
        y: {
            duration: 0.8,
            ease: "easeOut",
            repeat: Infinity,
            repeatType: 'reverse'
        }
    };

    const enterAnimation = {
        y: {
            duration: 1.2,
            ease: "easeOut",
        }
    };
    
    const dispatch = useDispatch()

  return (
    <motion.nav 
        className="fixed bottom-0 z-20 rounded-t-3xl md:rounded-t-full flex items-center justify-between text-xl px-4 bg-black w-full h-20 md:w-[60%]"
        transition={enterAnimation}
        animate={{
            y:[100, 1]
        }}
    >
        <TabButton
            icon={icons.Home} 
            iconStyle="w-[22px] md:w-[30px] h-[22px] md:h-[30px]"
            buttonStyle="p-2 mt-2 w-full h-full flex flex-col justify-center items-center"
            onClick={() => dispatch(setCurrentTab("dashboard"))}
            text="Home"
            textStyle="ubuntu-bold text-sm my-1"
        />
        <TabButton 
            icon={icons.Coins} 
            iconStyle="w-[22px] md:w-[30px] h-[22px] md:h-[30px]"
            buttonStyle="p-2 mt-2 w-full h-full flex flex-col justify-center items-center"
            onClick={() => dispatch(setCurrentTab("coins"))}
            text="Earn"
            textStyle="ubuntu-bold text-sm my-1"
        />
        <motion.div 
            className="relative flex justify-center w-48 mx-8 md:mx-auto md:w-1/2 h-full"
            transition={bounceAnimation}
            animate={{
                y: ["20%", "-18%"],
            }}
        >
            <TabButton 
                icon={icons.Gamepad} 
                iconStyle="w-[38px] md:w-[65px] h-[38px] md:h-[65px]"
                buttonStyle="absolute w-[70px] md:w-auto p-4 md:p-5 flex justify-center items-center rounded-full bottom-5 md:bottom-2 gradient-purple shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f]"
                onClick={() => dispatch(setCurrentTab("wip"))}
            />
        </motion.div>
        <TabButton 
            icon={icons.Friends} 
            iconStyle="w-[22px] md:w-[30px] h-[22px] md:h-[30px]"
            buttonStyle="p-2 mt-2 w-full h-full flex flex-col justify-center items-center"
            onClick={() => dispatch(setCurrentTab("friends"))}
            text="Friends"
            textStyle="ubuntu-bold text-sm my-1"
        />
        <TabButton 
            icon={icons.Wallet} 
            iconStyle="w-[22px] md:w-[30px] h-[22px] md:h-[30px]"
            buttonStyle="p-2 mt-2 w-full h-full flex flex-col justify-center items-center"
            onClick={() => dispatch(setCurrentTab("wallet"))}
            text="Wallet"
            textStyle="ubuntu-bold text-sm my-1"
        />
    </motion.nav>
  )
}

export default Navbar