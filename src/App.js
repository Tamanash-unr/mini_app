import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";

import { Home, Game, Overlay } from "./pages";
import { setUserData } from "./lib/userSlice";

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.ready()

    if(tg.initDataUnsafe.user) {
      dispatch(setUserData(tg.initDataUnsafe.user))
    }
  })  
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game" element={<Game />} />
      <Route path="/main" element={<Overlay />} />
    </Routes>
  );
}

export default App;
