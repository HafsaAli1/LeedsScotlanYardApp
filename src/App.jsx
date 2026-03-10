import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateGame from "./pages/CreateGame";
import JoinGame from "./pages/JoinGame";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateGame />} />
        <Route path="/join" element={<JoinGame />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;




// import React from "react";
// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import Home from "./pages/Home";
// import CreateGame from "./pages/CreateGame";
// import JoinGame from "./pages/JoinGame";
// import Lobby from "./pages/Lobby";

// // Placeholder for Game screen
// function Game() {
//   return (
//     <h2 style={{ textAlign: "center", marginTop: "50px" }}>
//       Game Screen (to be implemented)
//     </h2>
//   );
// }

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/create" element={<CreateGame />} />
//         <Route path="/join" element={<JoinGame />} />
//         <Route path="/lobby" element={<Lobby />} />
//         <Route path="/game" element={<Game />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;