import { useDispatch, useSelector } from "react-redux";
import { useState } from "react"; 
import { useNavigate } from "react-router-dom";

import { CustomButton, CustomInput } from "../components";
import { setNickname } from "../lib/userSlice";

const Home = () => {
    const [name, setName] = useState('')
    const dispatch = useDispatch()
    const navigate = useNavigate()

  const doOnClick = () => {
    dispatch(setNickname(name))
    navigate('/main')
  }

  return (
    <div className="flex flex-col h-screen w-full md:w-[60%] bg-black text-white items-center justify-center">
      <div className="denver-regular text-8xl md:text-9xl uppercase my-10">
        Line
      </div>
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