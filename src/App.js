import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Nitrolite Integration
import useClearNodeConnection from "./hooks/useClearNodeConnection";
import { ethers } from "ethers";

import { Home, LineGame, Overlay } from "./pages";
import { setUserData } from "./lib/redux/userSlice";
import { updateMineState, updateMinedCoins, setStartParam, updateCurrentMiningDuration, setSessionId, updateErrorLog } from "./lib/redux/appSlice";

function App() {
  const dispatch = useDispatch()

  const mineState = useSelector(state => state.app.mineState);
  const boostRate = useSelector(state => state.app.boostRate);
  const miningDuration = useSelector(state => state.app.miningDuration);
  const currentElapsed = useSelector(state => state.app.currentMiningDuration);
  const finalDuration = ((miningDuration * 60 * 60) * 1000);

  const stateWallet = new ethers.Wallet('0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'); // Initialize securely
  const clearNodeUrl = 'wss://clearnet.yellow.com/ws';

  const {
    connectionStatus,
    isAuthenticated,
    error,
    getChannels,
    disconnect,
  } = useClearNodeConnection(clearNodeUrl, stateWallet);

  const channels = useSelector((state) => state.clearNode.channels);

  useEffect(() => {
    console.info("NITROLITE Connection:\nConnection Status: ", connectionStatus, "\nAuthenticated: ", isAuthenticated, "\nChannels : ", channels)
  }, [])

  const handleTimerCompletion = () => {
    // clearInterval(miningInterval)
    // miningInterval = null
    dispatch(updateMineState(3))
    // restart(new Date().getTime() + (miningDuration * 60 * 1000 ), false)
  }

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.ready()

    if(tg.initDataUnsafe.user) {
      dispatch(setUserData(tg.initDataUnsafe.user))
    }

    if(tg.initDataUnsafe.start_param){
      dispatch(setStartParam(tg.initDataUnsafe.start_param))
    }
  },[dispatch])
  
  // const [currentElapsed, setCurrentElapsed] = useState(0)

  useEffect(()=> {
    if(mineState === 1){
      // start()

      let remainingTime = currentElapsed > 0 ? finalDuration - (currentElapsed * 1000) : finalDuration;

      const updateTimer = () => {
        if(remainingTime <= 0){
          handleTimerCompletion();
          return
        }

        dispatch(updateMinedCoins(0.1))
        dispatch(updateCurrentMiningDuration(1))

        remainingTime -= 1000;
        setTimeout(updateTimer, 1000)
      }

      updateTimer()

      // miningInterval = setInterval(() => {
      //   dispatch(updateMinedCoins(0.1))
      //   dispatch(updateCurrentMiningDuration(1))
      // }, 1000)

      // const timeOutId = setTimeout(() => {
      //   clearInterval(timer)
      //   dispatch(updateMineState(3))
      // }, 480000)

      return () => {
        // clearInterval(timer)
        // clearTimeout(timeOutId)
        clearTimeout(updateTimer)
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
