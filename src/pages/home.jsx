import { useDispatch, useSelector } from "react-redux";
import { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { CustomButton, CustomInput } from "../components";
import { setNickname } from "../lib/userSlice";

const Home = () => {
    const [name, setName] = useState('')
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const user = useSelector(state => state.user.test)

  const doOnClick = () => {
    dispatch(setNickname(name))
    navigate('/main')
  }

  const neonAnimation = {
    initial: { textShadow: '0 0 4px #fff, 0 0 10px #fff, 0 0 30px #3838c5, 0 0 50px #3838c5, 0 0 70px #3838c5, 0 0 90px #3838c5' },
    animate: {
      textShadow: [
        '0 0 4px #fff, 0 0 10px #fff, 0 0 30px #3838c5, 0 0 50px #3838c5, 0 0 70px #3838c5, 0 0 90px #3838c5',
        '0 0 2px #fff, 0 0 5px #fff, 0 0 15px #3838c5, 0 0 25px #3838c5, 0 0 35px #3838c5, 0 0 45px #3838c5',
      ],
      transition: { duration: 1, repeat: Infinity, repeatType: 'mirror' },
    },
  };

  return (
    <div className="flex flex-col h-screen w-full md:w-[60%] md:m-auto bg-black text-white items-center justify-center">
      <motion.div 
        className="denver-regular text-8xl md:text-9xl uppercase my-10"
        initial="initial"
        animate="animate"
        variants={neonAnimation}
      >
        Line
      </motion.div>
      <p className="w-[60%] text-wrap">
        {
          typeof user === "object" ? JSON.stringify(user) : user
        }
      </p>
      <div className="flex flex-col">
        <CustomInput 
            placeholder="Your Nickname..."
            value={name}
            onChange={setName}
            containerStyle="my-4"
            inputStyle="text-lg"
        />
        <CustomButton 
            text="Continue"
            textStyle="ubuntu-bold w-full h-full flex items-center justify-center"
            buttonStyle="w-1/2 h-12 m-auto"
            onClick={doOnClick}
        />
      </div>
    </div>
  )
}

export default Home