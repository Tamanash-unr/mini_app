import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// import TelegramAnalytics from '@telegram-apps/analytics';

import { Home, LineGame, Overlay } from "./pages";
import { setUserData } from "./lib/redux/userSlice";
import { updateMineState, updateMinedCoins, setStartParam, updateCurrentMiningDuration, setSessionId } from "./lib/redux/appSlice";

function App() {
  const dispatch = useDispatch()

  const mineState = useSelector(state => state.app.mineState);
  const boostRate = useSelector(state => state.app.boostRate);
  const miningDuration = useSelector(state => state.app.miningDuration);
  const currentElapsed = useSelector(state => state.app.currentMiningDuration);
  const finalDuration = ((miningDuration * 60 * 60) * 1000);

  // let miningInterval = null

  // const {
  //   totalSeconds,
  //   seconds,
  //   minutes,
  //   hours,
  //   days,
  //   isRunning,
  //   start,
  //   pause,
  //   restart,
  // } = useTimer({
  //   autoStart: false,
  //   expiryTimestamp: new Date().getTime() + ((miningDuration * 60) * 1000 ), // Duration in milliseconds
  //   onExpire: () => handleTimerCompletion(),
  // });

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

    // TelegramAnalytics.init({
    //     token: process.env.REACT_APP_ANALYTICS_RECORDING_TOKEN,
    //     appName: process.env.REACT_APP_ANALYTICS_IDENTIFIER,
    // });
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
