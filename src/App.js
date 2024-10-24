import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Home, LineGame, Overlay } from "./pages";
import { setUserData } from "./lib/userSlice";
import { updateBoostRate, updateMineState, updateMinedCoins } from "./lib/appSlice";

function App() {
  const dispatch = useDispatch()

  const mineState = useSelector(state => state.app.mineState);
  const boostRate = useSelector(state => state.app.boostRate)

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.ready()

    if(tg.initDataUnsafe.user) {
      dispatch(setUserData(tg.initDataUnsafe.user))
    }
  },[dispatch])
  
  useEffect(()=> {
    if(mineState === 1){
      const timer = setInterval(() => {
        dispatch(updateMinedCoins(1))
      }, 1000)

      const timeOutId = setTimeout(() => {
        clearInterval(timer)
        dispatch(updateBoostRate(0))
        dispatch(updateMineState(3))
      }, 60000)

      return () => {
        clearInterval(timer)
        clearTimeout(timeOutId)
      }
    }
  }, [mineState, boostRate, dispatch])

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game" element={<LineGame />} />
      <Route path="/main" element={<Overlay />} />
    </Routes>
  );
}

export default App;
