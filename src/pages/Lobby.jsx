import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Lobby() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);

  // Get info from localStorage (set when joining or creating game)
  const gameId = localStorage.getItem("gameId") || "123";
  const playerName = localStorage.getItem("playerName") || "Player 1";

  // Add current player to lobby only once
  useEffect(() => {
    setPlayers([playerName]); // set initial lobby with current player
  }, [playerName]);

  const startGame = () => {
    console.log("Game started!");
    navigate("/game"); // Navigate to game screen placeholder
  };

  return (
    <div className="container">
      <h1 className="title">Lobby</h1>
      <p className="subtitle">Game ID: {gameId}</p>

      <h2>Players in Lobby:</h2>
      <ul className="player-list">
        {players.map((p, index) => (
          <li key={index}>{p}</li>
        ))}
      </ul>

      <div className="button-container">
        <button className="nav-btn" onClick={startGame}>
          Start Game
        </button>
        <button className="nav-btn" onClick={() => navigate("/")}>
          Exit Lobby
        </button>
      </div>
    </div>
  );
}

export default Lobby;