// src/pages/Lobby.jsx

// Import React hooks and navigation
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Import API function to get the current game state from the server
import { getGameState } from "../services/api";

// Import CSS for styling
import "../App.css";

function Lobby() {
  // Hook to programmatically navigate between pages
  const navigate = useNavigate();

  // State to store the list of players currently in the lobby
  const [players, setPlayers] = useState([]);

  // State to store the game code to display on screen
  // Get the stored gameId from localStorage (set when creating/joining a game)
  const [gameCode, setGameCode] = useState(localStorage.getItem("gameId") || "");

  // useEffect runs when the component mounts
  useEffect(() => {
    // Get gameId from localStorage
    const gameId = localStorage.getItem("gameId");

    // If there is no gameId (user came here directly), redirect to Home
    if (!gameId) {
      navigate("/"); // Go back to home page
      return;
    }

    // Function to fetch the current game state from the server
    const fetchPlayers = async () => {
      try {
        // Call API to get current game state
        const data = await getGameState(gameId);

        // Update players state with the array of players returned by server
        setPlayers(data.players || []); // default to empty array if no players
      } catch (err) {
        // Log error to console
        console.error(err);

        // Show alert if fetching game state fails
        alert("Failed to fetch game state.");
      }
    };

    // Fetch players once when component mounts
    fetchPlayers();

    // Set up an interval to refresh the players list every 3 seconds
    const interval = setInterval(fetchPlayers, 3000);

    // Cleanup interval when component unmounts to avoid memory leaks
    return () => clearInterval(interval);
  }, [navigate]); // Dependency array ensures useEffect only runs once on mount

  // Function to handle clicking the "Back" button
  const handleBack = () => {
    navigate("/"); // Go back to the Home page
  };

  // JSX returned to render the Lobby page
  return (
    <div className="container">
      {/* Page title */}
      <h1 className="title">Lobby</h1>

      {/* Display the game code for players to join */}
      <p className="subtitle">
        Game Code: <strong>{gameCode}</strong>
      </p>

      {/* List of players currently in the lobby */}
      <h2>Players in Lobby:</h2>
      <ul>
        {players.map((player) => (
          // Each player must have a unique key (playerId)
          <li key={player.playerId}>{player.playerName}</li>
        ))}
      </ul>

      {/* Back button to return to Home */}
      <button className="nav-btn" onClick={handleBack}>
        Back
      </button>
    </div>
  );
}


export default Lobby;