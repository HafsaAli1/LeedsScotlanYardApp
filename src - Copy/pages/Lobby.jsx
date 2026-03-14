import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getGameState, startGame } from "../services/api";
import "../App.css";

function Lobby() {
  const navigate = useNavigate();
  // 'players' holds the list of people currently in the lobby
  const [players, setPlayers] = useState([]);
  
  // Retrieve our saved Game ID and Player ID from the browser's memory
  const gameId = sessionStorage.getItem("gameId");
  const myPlayerId = sessionStorage.getItem("playerId");

  // This Effect handles the Polling - checking the server repeatedly
  useEffect(() => {
    // If we don't have a Game ID go back to homepage
    if (!gameId) { navigate("/"); return; }

    const fetchPlayers = async () => {
      try {
        // Ask the server for the latest game info
        const data = await getGameState(gameId);
        
        // create player list
        // use a Map to ensure we don't list the same person twice
        const playerMap = new Map();
        if (data.players) {
          data.players.forEach(p => {
            const id = p.playerId?.toString();
            // Store the ID and Name together
            if (id) playerMap.set(id, p.playerName);
          });
        }

        // If the server's player list is empty, make sure the creator is at least shown
        if (playerMap.size === 0 && data.creatorName) {
           playerMap.set(data.creatorPlayerId?.toString(), data.creatorName);
        }

        // Convert Map into a simple list (array) to display on the screen
        setPlayers(Array.from(playerMap.entries()).map(([id, name]) => ({ id, name })));

  
        // check if the game has officially started on the server
        const state = data.state?.toLowerCase();
        const isStarted = ["fugitive", "detective", "drx", "active", "started"].includes(state);

        if (isStarted) {
          // Before we leave the lobby, find "Me" in the player list.
          // save starting station number so the map knows where to put the dot.
          if (data.players) {
            const me = data.players.find(p => p.playerId.toString() === myPlayerId.toString());
            
            if (me && me.location && me.location !== "Hidden") {
              console.log("Lobby captured starting location:", me.location);
              sessionStorage.setItem("currentLocation", me.location);
            }
          }
          
          // Send everyone to the Map screen.
          navigate("/game");
        }
      } catch (err) { 
        console.error("Lobby Poll Error:", err); 
      }
    };

    // Set up a timer to run the 'fetchPlayers' function every 2 seconds
    const interval = setInterval(fetchPlayers, 2000);
    
    // Also run it immediately once so we don't wait 2 seconds for the first look
    fetchPlayers();
    
    // If the user leaves this page, stop the 2-second timer
    return () => clearInterval(interval);
  }, [gameId, navigate, myPlayerId]);

  // This function runs when the creator clicks the Start Game button
  const handleStart = async () => {
    try {
      // Tell the server to officially move the game from Lobby to Started
      const data = await startGame(gameId, myPlayerId);
      
      // Save starting location if it was given in the response
      if (data && data.location) {
        sessionStorage.setItem("currentLocation", data.location);
      }
      
      // Move to the game screen
      navigate("/game");
    } catch (err) {
      alert("Error starting game: " + err.message);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Lobby</h1>
      <p>Code: <strong>{gameId}</strong></p>
      
      {/* Box showing everyone who has joined so far */}
      <div className="player-list-box">
        <h3>Players ({players.length})</h3>
        <ul>
          {players.map(p => (
            <li key={p.id} className={p.id === myPlayerId ? "me-highlight" : ""}>
              {/* Highlight own name to find yourself in the list */}
              {p.name} {p.id === myPlayerId ? "(You)" : ""}
            </li>
          ))}
        </ul>
      </div>

      {/* Only show the 'Start' button if there are 3 or more players */}
      {players.length >= 3 ? (
        <button className="nav-btn start-btn" onClick={handleStart}>
          Start Game
        </button>
      ) : (
        // Otherwise show a message about how many more people are needed
        <p className="wait-text">Waiting for {3 - players.length} more players...</p>
      )}
    </div>
  );
}

export default Lobby;
