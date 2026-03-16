// Import React hooks and navigation
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Import API function to join a game on the server
import { joinGame } from "../services/api";

// Import CSS for styling
import "../App.css";

function JoinGame() {
  // Hook to navigate between pages
  const navigate = useNavigate();

  // State to store the Game ID entered by the player
  const [gameId, setGameId] = useState("");

  // State to store the player's name
  const [playerName, setPlayerName] = useState("");

  // State to track loading state when attempting to join a game
  const [loading, setLoading] = useState(false);

  // Function to handle joining a game
  const handleJoin = async () => {
    // Validate that both Game ID and player name are provided
    if (!gameId || !playerName) {
      alert("Please enter both Game ID and your Name");
      return; // Exit function early if validation fails
    }

    // Set loading state to true to disable buttons and show feedback
    setLoading(true);

    try {
      const response = await joinGame(gameId, playerName);

      // Store important info in sessionStorage
      sessionStorage.setItem("playerId", response.playerId);
      sessionStorage.setItem("gameId", gameId);
      sessionStorage.setItem("playerName", playerName);


      // Capture the detective's starting location immediately
      if (response.location) {
        console.log("Join captured starting location:", response.location);
        sessionStorage.setItem("currentLocation", response.location);
      }
      

      navigate("/lobby");
    } catch (err) {
      console.error(err);
      alert("Failed to join game");
    } finally {
      setLoading(false);
    }
  };

  // JSX returned to render the Join Game page
  return (
    <div className="container">
      {/* Page title */}
      <h1 className="title">Join Game</h1>

      {/* Subtitle with instructions */}
      <p className="subtitle">
        Enter the Game ID and your player name to join an existing game.
      </p>

      {/* Input field for Game ID */}
      <input
        type="text"
        placeholder="Game ID"
        value={gameId} // Controlled input using state
        onChange={(e) => setGameId(e.target.value)} // Update state as user types
        className="input-field"
      />

      {/* Input field for Player Name */}
      <input
        type="text"
        placeholder="Your Name"
        value={playerName} // Controlled input using state
        onChange={(e) => setPlayerName(e.target.value)} // Update state as user types
        className="input-field"
      />

      {/* Buttons container */}
      <div className="button-container">
        {/* Button to join the game */}
        <button className="nav-btn" onClick={handleJoin} disabled={loading}>
          {loading ? "Joining..." : "Join Game"} {/* Show loading feedback */}
        </button>

        {/* Button to go back to Home page */}
        <button className="nav-btn" onClick={() => navigate("/")}>
          Back
        </button>
      </div>
    </div>
  );
}


export default JoinGame;








