
import { Routes, Route } from "react-router-dom";
import { Home, Game, Overlay } from "./pages";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game" element={<Game />} />
      <Route path="/main" element={<Overlay />} />
    </Routes>
  );
}

export default App;
