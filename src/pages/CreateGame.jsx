import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function CreateGame() {
  const navigate = useNavigate();
  const [gameName, setGameName] = useState("");

  const handleCreate = () => {
    // For now, just log and navigate (API call will go here later)
    console.log("Creating game:", gameName);
    navigate("/"); // go back to Home for now
  };

  return (
    <div className="container">
      <h1 className="title">Create Game</h1>
      <p className="subtitle">Enter game name:</p>

      <input
        type="text"
        placeholder="Game Name"
        value={gameName}
        onChange={(e) => setGameName(e.target.value)}
        className="input-field"
      />

      <div className="button-container">
        <button className="nav-btn" onClick={handleCreate}>
          Create
        </button>
        <button className="nav-btn" onClick={() => navigate("/")}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default CreateGame;