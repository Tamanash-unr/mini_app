import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";

import { CustomButton, CustomInput } from "../components";
import { setLoading, initAppData } from "../lib/appSlice";
import { setNickname, initUserData } from "../lib/userSlice";
import { validateUser, createUser } from "../lib/firebase/firebase_api";
import { icons } from "../constants"; 

const Home = () => {
  const [name, setName] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const user = useSelector(state => state.user.data)
  const loading = useSelector(state => state.app.isLoading)

  const doOnInit = async () => {
    if(!user.id){
      return
    }

    dispatch(setLoading(true))

    const appData = await validateUser(user.id)

    if(appData.status){
      dispatch(initAppData(appData.data))
      dispatch(initUserData(appData.data))

      navigate('/main')
    } else {
      toast.error(appData.message, {
        duration: 5000
      })

      if(appData.message === "User does not Exist!"){
        const init = toast.loading("Creating User")
        const newUser = await createUser(user)

        if(newUser.status) {
          toast.success("User Created", {id: init, duration:5000})
          navigate('/main')
        } else {
          toast.error(`Failed: ${newUser.message}`, {id: init, duration:5000})
        } 
      }
    }

    dispatch(setLoading(false))
  }

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

  useEffect(()=>{
    doOnInit()
  },[user])

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
      {
        loading ? 
        <div>
          <img src={icons.Gear} alt="WIP..." className='w-12 h-12 animate-spin'/>
        </div>
        :
        <div className="flex flex-col">
          {/* <CustomInput 
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
          /> */}
          Initializing...
        </div>
      }
      <Toaster 
        position="bottom-center"
        toastOptions={{
          className: 'ubuntu-medium',
          style: {
            background: '#1d1d1e',
            color: 'white',
          }
        }}
      />
    </div>
  )
}

export default Home