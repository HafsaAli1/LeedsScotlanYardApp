// src/pages/CreateGame.jsx

// Import React hooks and navigation
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Import API functions to interact with the server
import { createGame, getMaps } from "../services/api";

// Import CSS for styling
import "../App.css";

function CreateGame() {
  // Hook to programmatically navigate between pages
  const navigate = useNavigate();

  // State to store the game name entered by the user
  const [gameName, setGameName] = useState("");

  // State to store all available maps fetched from the server
  const [maps, setMaps] = useState([]);

  // State to track which map the user selects from the dropdown
  const [selectedMap, setSelectedMap] = useState("");

  // State to track loading state when creating a game
  const [loading, setLoading] = useState(false);

  // State to store the game code returned by the server after creation
  const [generatedCode, setGeneratedCode] = useState("");

  // useEffect runs once on component mount to fetch available maps from server
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        // Call API to get all maps
        const data = await getMaps();

        // Store maps in state to render in dropdown
        setMaps(data);

        // If maps exist, automatically select the first one by default
        if (data.length > 0) setSelectedMap(data[0].mapId);
      } catch (err) {
        // Log any errors from fetching maps
        console.error(err);
      }
    };

    fetchMaps(); // Trigger map fetch
  }, []); // Empty dependency array = run once when component mounts

  // Function to handle creating a new game
  const handleCreate = async () => {
    // Validate that user entered a game name
    if (!gameName) {
      alert("Please enter a game name");
      return;
    }

    // Validate that a map is selected
    if (!selectedMap) {
      alert("Please select a map");
      return;
    }

    // Set loading state to true to disable button and show "Creating..."
    setLoading(true);

    try {
      // Call API to create a game with the entered name and selected map
      const response = await createGame(gameName, selectedMap);

      // Save game info to localStorage so other pages can access it
      localStorage.setItem("gameId", response.gameId); // unique ID for the game
      localStorage.setItem("playerId", response.creatorPlayerId); // ID of the creator

      // Store the game code returned by server (or fallback to gameId)
      setGeneratedCode(response.gameCode || response.gameId);

    } catch (err) {
      // Log error and notify the user
      console.error(err);
      alert("Failed to create game");
    } finally {
      // Reset loading state regardless of success or failure
      setLoading(false);
    }
  };

  // Function to navigate to the Join Game page
  const handleNext = () => {
    navigate("/join");
  };

  // JSX returned to render the Create Game page
  return (
    <div className="container">
      {/* Page title */}
      <h1 className="title">Create Game</h1>
      <p className="subtitle">Enter a name for your game and choose a map!</p>

      {/* Input field for game name */}
      <input
        type="text"
        placeholder="Game Name"
        value={gameName}
        onChange={(e) => setGameName(e.target.value)} // Update state as user types
        className="input-field"
      />

      {/* Dropdown to select map */}
      <select
        value={selectedMap}
        onChange={(e) => setSelectedMap(e.target.value)} // Update selected map
        className="input-field"
      >
        {maps.map((map) => (
          <option key={map.mapId} value={map.mapId}>
            {map.mapName} {/* Display map name in dropdown */}
          </option>
        ))}
      </select>

      {/* Conditional rendering based on whether game code has been generated */}
      {!generatedCode ? (
        // Button to create game if code has not been generated yet
        <button className="nav-btn" onClick={handleCreate} disabled={loading}>
          {loading ? "Creating..." : "Create Game"} {/* Show loading text if creating */}
        </button>
      ) : (
        // Once game is created, display the code and Next button
        <div>
          <p>
            Game Code: <strong>{generatedCode}</strong>
          </p>
          <button className="nav-btn" onClick={handleNext}>
            Next {/* Navigate to Join Game page */}
          </button>
        </div>
      )}
    </div>
  );
}


export default CreateGame;