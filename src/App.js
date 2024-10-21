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

    if(tg.initData) {
      dispatch(setUserData(tg.initData))
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
