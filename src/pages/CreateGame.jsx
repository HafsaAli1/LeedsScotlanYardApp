import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Import helper functions to talk to the server
import { createGame, joinGame, getMaps } from "../services/api"; 
import "../App.css";

function CreateGame() {
  // Tools to move between pages 
  const navigate = useNavigate();

  // Variables to hold the information the user types into the form
  const [gameName, setGameName] = useState("");
  const [playerName, setPlayerName] = useState("");

  // Stores the list of maps from the server
  const [maps, setMaps] = useState([]); 

  // The map ID the user chooses
  const [selectedMap, setSelectedMap] = useState(""); 

  // Tracks if we are currently waiting for the server
  const [loading, setLoading] = useState(false); 

  // This runs as soon as the page opens to fetch the available maps from the server
  useEffect(() => {
    getMaps()
      .then(setMaps) // Save maps into the 'maps' variable
      .catch(console.error); // Show error in console if the server fails
  }, []);

  // The main function that runs when the Create Game button is clicked
  const handleCreate = async () => {
    // Don't let the user continue if fields are empty
    if (!gameName || !playerName || !selectedMap) return alert("Fill in all fields");

    setLoading(true); // Disable the button so the user doesn't click it twice
    try {
      // Ask the server to create a new game with the chosen map
      const createRes = await createGame(gameName, selectedMap);
      const gameCode = createRes.gameCode || createRes.gameId;

      // Immediately join the game you just created 
      const joinRes = await joinGame(gameCode, playerName);

      // Save important details into 'sessionStorage' so the browser remembers who you are
      sessionStorage.setItem("gameId", gameCode);
      sessionStorage.setItem("playerId", joinRes.playerId);
      sessionStorage.setItem("playerName", playerName);
      // Helps identify you as the creator when you return to the lobby
      sessionStorage.setItem("isCreator", "true"); 

      // Store starting position - where the server places you on map
      if (joinRes.location) {
        sessionStorage.setItem("currentLocation", joinRes.location);
      } else if (joinRes.startLocation) {
        sessionStorage.setItem("currentLocation", joinRes.startLocation);
      }

      // Send the user to the lobby to wait for other players
      navigate("/lobby");
    } catch (err) {
      // If anything goes wrong show an alert
      alert("Failed to initialize game: " + err.message);
    } finally {
      setLoading(false); // Re-enable the button
    }
  };

  return (
    <div className="container">
      <h1 className="title">Create Game</h1>
      
      <div className="form-box vertical-stack">
        {/* Input for Player Name */}
        <div className="input-group">
          <input 
            type="text" 
            placeholder="Enter your name" 
            value={playerName} 
            onChange={e => setPlayerName(e.target.value)} 
            className="input-field" 
          />
        </div>

        {/* Input for the Game Title */}
        <div className="input-group">
          <input 
            type="text" 
            placeholder="Enter game name" 
            value={gameName} 
            onChange={e => setGameName(e.target.value)} 
            className="input-field" 
          />
        </div>

        {/* Dropdown to select a map */}
        <div className="input-group">
          <select 
            value={selectedMap} 
            onChange={e => setSelectedMap(e.target.value)} 
            className="input-field"
          >
            <option value="">Choose a Map</option>
            {/* We loop through the 'maps' array to create an option for each map */}
            {maps.map(m => (
              <option key={m.mapId} value={m.mapId}>
                {m.mapName}
              </option>
            ))}
          </select>
        </div>
        
        {/* Submit button: Disables itself while loading */}
        <button 
          onClick={handleCreate} 
          className="nav-btn start-btn" 
          disabled={loading || !selectedMap}
        >
          {loading ? "Initialising..." : "Create Game"}
        </button>
      </div>
    </div>
  );
}

export default CreateGame;