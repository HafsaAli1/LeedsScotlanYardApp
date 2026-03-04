import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function JoinGame() {
  const navigate = useNavigate();
  const [gameId, setGameId] = useState("");
  const [playerName, setPlayerName] = useState("");

  const handleJoin = () => {
    if (!gameId || !playerName) {
      alert("Please enter both Game ID and your Name");
      return;
    }

    // Save info to localStorage to pass to Lobby
    localStorage.setItem("gameId", gameId);
    localStorage.setItem("playerName", playerName);

    // Navigate to Lobby
    navigate("/lobby");
  };

  return (
    <div className="container">
      <h1 className="title">Join Game</h1>
      <p className="subtitle">
        Enter the Game ID and your player name to join an existing game.
      </p>

      <input
        type="text"
        placeholder="Game ID"
        value={gameId}
        onChange={(e) => setGameId(e.target.value)}
        className="input-field"
      />

      <input
        type="text"
        placeholder="Your Name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className="input-field"
      />

      <div className="button-container">
        <button className="nav-btn" onClick={handleJoin}>
          Join
        </button>
        <button className="nav-btn" onClick={() => navigate("/")}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default JoinGame;