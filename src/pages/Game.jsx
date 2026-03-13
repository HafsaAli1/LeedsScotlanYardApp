// import { useEffect, useState, useCallback } from "react";
// // Import our API helpers to talk to the Scotland Yard server
// import { getGameState, getMaps, getPlayerStatus, getMapDetails, movePlayer } from "../services/api";
// import MapView from "./MapView";
// import "../App.css";

// function Game() {
//   // --- STATE MANAGEMENT (The game's memory) ---
//   // Is the game still loading data?
//   const [loading, setLoading] = useState(true);    

//   // The URL of the map background
//   const [mapImage, setMapImage] = useState("");   
  
//   // The X/Y coordinates for all stations
//   const [nodes, setNodes] = useState([]);               

//   // General game info (whose turn it is, etc.)
//   const [gameState, setGameState] = useState(null);     

//   // Specific info about YOU (your tickets, your role)
//   const [playerInfo, setPlayerInfo] = useState(null); 
  
//   // The ticket you just clicked on
//   const [selectedTicket, setSelectedTicket] = useState(null); 

//   // Fetching the map 
//   // use useCallback so this function doesn't get recreated every time the component updates
//   const loadAllData = useCallback(async (isInitial = false) => {
//     const gId = sessionStorage.getItem("gameId");
//     const pId = sessionStorage.getItem("playerId");

//     try {
//       // Pull 3 things at once: The current game state, the list of maps, and personal status
//       const [game, maps, status] = await Promise.all([
//         getGameState(gId),
//         getMaps(),
//         getPlayerStatus(pId)
//       ]);

//       // If this is the very first time the page loads, set up the map background and nodes
//       if (isInitial) {
//         const mapDetails = await getMapDetails(game.mapId);
//         const selectedMap = maps.find(m => m.mapId === game.mapId);
//         // removw thumb to get the high-quality full map image
//         if (selectedMap) setMapImage(selectedMap.mapThumb.replace("Thumb", ""));
//         setNodes(mapDetails.locations);
//       }

//       // Check if YOU are Dr. X 
//       const myIdStr = String(pId).trim();
//       const isDrX = game.creatorPlayerId 
//         ? myIdStr === String(game.creatorPlayerId).trim() 
//         : (game.players && String(game.players[0].playerId) === myIdStr);

//       // Figure out where you are standing. The server might say Hidden so we fall back to local memory.
//       let myPos = status.location !== "Hidden" ? status.location : null;
//       if (!myPos) myPos = status.startLocation || status.initialLocation || status.nodeId;
//       if (!myPos) myPos = sessionStorage.getItem("currentLocation");

//       // Save everything into our state variables
//       setGameState(game);
//       setPlayerInfo({
//         ...status,
//         role: isDrX ? "fugitive" : "detective",
//         tickets: status.tickets || { taxi: 10, bus: 8, underground: 4 }, // Fallback if server is empty
//         realLocation: myPos 
//       });

//       if (isInitial) setLoading(false);
//     } catch (err) {
//       console.error("Sync Error:", err);
//       if (isInitial) setLoading(false);
//     }
//   }, []);

// // 
  
//   // Runs once on startup to load the map and player info from the server
//   useEffect(() => { loadAllData(true); }, [loadAllData]);

//   // Set up an interval to refresh the game every 5 seconds so you see other players move
//   useEffect(() => {
//     const interval = setInterval(() => { loadAllData(false); }, 5000); 
//     return () => clearInterval(interval); // Clean up the timer if the user leaves the page
//   }, [loadAllData]);

//   // What happens when you click a node
//   const handleNodeClick = async (locationId) => {
//     // You must pick a ticket before you can move
//     if (!selectedTicket) {
//       alert("Please select a ticket type first!");
//       return;
//     }

//     // Get your Game ID and Player ID from sessionStorage so we can tell the server who we are and where we want to go
//     const gId = sessionStorage.getItem("gameId");
//     const pId = sessionStorage.getItem("playerId");

//     try {
//       // Tell the server we want to move
//       await movePlayer(gId, pId, locationId, selectedTicket);
      
//       // Immediately update our local station so the dot moves instantly
//       sessionStorage.setItem("currentLocation", locationId);
      
//       setPlayerInfo(prev => ({
//         ...prev,
//         realLocation: locationId,
//         tickets: {
//           ...prev.tickets,
//           [selectedTicket.toLowerCase()]: prev.tickets[selectedTicket.toLowerCase()] - 1
//         }
//       }));

//       // Reset the selection and refresh data
//       setSelectedTicket(null);
//       alert("Move successful!");
//       loadAllData(false); 
//     } catch (err) {
//       // If the move is not valid, show the server's error message
//       alert(`Invalid move: ${err.message}`);
//     }
//   };

//   // Show a loading screen while we wait for the first batch of data
//   if (loading) return <div className="container"><h2>Loading...</h2></div>;

//   return (
//     <div className="game-screen">
//       {/* HEADER: Shows your Role and your current Station number */}
//       <div className="game-header-centered">
//         <div className="header-status-box">
//           <span className={`badge ${playerInfo?.role}`}>
//             {playerInfo?.role === "fugitive" ? "Dr. X" : "Detective"}
//           </span>
//           <p className="station-display">
//             Your Station: <strong>{playerInfo?.realLocation || "Hidden"}</strong>
//           </p>
//         </div>
//       </div>

//       {/* PHASE: Shows whose turn it is  */}
//       <div className="turn-indicator">
//         <h3>PHASE: <span className={gameState?.state?.toLowerCase()}>
//           {gameState?.state?.toUpperCase()}
//         </span></h3>
//       </div>

//       {/* MAP: The interactive board */}
//       <div className="map-scroll-container">
//         <MapView 
//           image={mapImage} 
//           nodes={nodes} 
//           onNodeClick={handleNodeClick} 
//           activeTicket={selectedTicket}
//           playerLocation={playerInfo?.realLocation} 
//           allPlayers={gameState?.players} 
//         />
//       </div>

//       {/* TICKET BAR: Click these to select your transport method */}
//       <div className="ticket-bar">
//         {playerInfo?.tickets && Object.entries(playerInfo.tickets).map(([type, count]) => (
//           <div 
//             key={type} 
//             className={`ticket ${type.toLowerCase()} ${selectedTicket === type ? "selected" : ""}`}
//             onClick={() => count > 0 && setSelectedTicket(type)}
//           >
//             <span className="count">{count}</span>
//             <span className="label">{type.toUpperCase()}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default Game;

import { useEffect, useState, useCallback } from "react";
import { getGameState, getMaps, getMapDetails, movePlayer } from "../services/api";
import MapView from "./MapView";
import "../App.css";

// Icons
import taxiIcon from "../assets/tickets/taxi.png";
import busIcon from "../assets/tickets/bus.png";
import undergroundIcon from "../assets/tickets/underground.png";
import mrxIcon from "../assets/tickets/mrx.png";
import doubleIcon from "../assets/tickets/2x.png";

function Game() {
  const [loading, setLoading] = useState(true);
  const [mapImage, setMapImage] = useState("");
  const [nodes, setNodes] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [playerInfo, setPlayerInfo] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const loadAllData = useCallback(async (isInitial = false) => {
    const gId = sessionStorage.getItem("gameId");
    const pId = sessionStorage.getItem("playerId");

    try {
      const [game, maps] = await Promise.all([
        getGameState(gId),
        getMaps()
      ]);

      if (isInitial) {
        const mapDetails = await getMapDetails(game.mapId);
        const selectedMap = maps.find(m => m.mapId === game.mapId);
        if (selectedMap) setMapImage(selectedMap.mapThumb.replace("Thumb", ""));
        setNodes(mapDetails.locations);
      }

      // Fetch detailed player data (for ticket counts)
      if (game.players) {
        const detailedPlayers = await Promise.all(
          game.players.map(async (p) => {
            const res = await fetch(`http://trinity-developments.co.uk/players/${p.playerId}`);
            return res.json();
          })
        );

        // Find YOUR specific data
        const me = detailedPlayers.find(p => String(p.playerId) === String(pId));

        setGameState(game);
        setPlayerInfo({
          ...me,
          // Map server colors to our ticket names
          tickets: {
            taxi: me?.yellow ?? 0,
            bus: me?.green ?? 0,
            underground: me?.red ?? 0,
            black: me?.black ?? 0,
            x2: me?.x2 ?? 0
          },
          role: me?.role || (String(pId) === String(game.creatorPlayerId) ? "fugitive" : "detective"),
          currentLocation: me?.location !== "Hidden" ? me?.location : (sessionStorage.getItem("currentLocation") || "Hidden")
        });
      }

      if (isInitial) setLoading(false);
    } catch (err) {
      console.error("Sync Error:", err);
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => { loadAllData(true); }, [loadAllData]);

  useEffect(() => {
    const interval = setInterval(() => { loadAllData(false); }, 5000);
    return () => clearInterval(interval);
  }, [loadAllData]);

  const handleNodeClick = async (locationId) => {
    if (!selectedTicket) {
      alert("Please select a ticket type first!");
      return;
    }
    const gId = sessionStorage.getItem("gameId");
    const pId = sessionStorage.getItem("playerId");

    try {
      await movePlayer(gId, pId, locationId, selectedTicket);
      sessionStorage.setItem("currentLocation", locationId);
      setSelectedTicket(null);
      loadAllData(false);
    } catch (err) {
      alert(`Invalid move: ${err.message}`);
    }
  };

  if (loading) return <div className="container"><h2>Loading Map...</h2></div>;

  return (
    <div className="game-screen">
      {/* Floating Header: Minimal height so it doesn't block map */}
      <div className="floating-header">
        <span className={`badge ${playerInfo?.role}`}>
          {playerInfo?.role === "fugitive" ? "Dr. X" : "Detective"}
        </span>
        <span className="station-pill">Station: {playerInfo?.currentLocation}</span>
        <span className="phase-pill">PHASE: {gameState?.state}</span>
      </div>

      {/* Full Screen Map Container */}
      <div className="map-viewport">
        <MapView 
          image={mapImage} 
          nodes={nodes} 
          onNodeClick={handleNodeClick} 
          activeTicket={selectedTicket}
          playerLocation={playerInfo?.currentLocation} 
          allPlayers={gameState?.players} 
        />
      </div>

      {/* Semi-Transparent Bottom HUD */}
      <div className="game-hud">
        <div className="inventory-bar">
          <div className="ticket-row">
            <TicketItem type="taxi" icon={taxiIcon} count={playerInfo?.tickets.taxi} selected={selectedTicket} onClick={setSelectedTicket} />
            <TicketItem type="bus" icon={busIcon} count={playerInfo?.tickets.bus} selected={selectedTicket} onClick={setSelectedTicket} />
            <TicketItem type="underground" icon={undergroundIcon} count={playerInfo?.tickets.underground} selected={selectedTicket} onClick={setSelectedTicket} />
            <TicketItem type="black" icon={mrxIcon} count={playerInfo?.tickets.black} selected={selectedTicket} onClick={setSelectedTicket} />
            <TicketItem type="x2" icon={doubleIcon} count={playerInfo?.tickets.x2} selected={selectedTicket} onClick={setSelectedTicket} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for tickets to keep main JSX clean
function TicketItem({ type, icon, count, selected, onClick }) {
  return (
    <div 
      className={`ticket-unit ${selected === type ? 'active' : ''} ${count === 0 ? 'disabled' : ''}`}
      onClick={() => count > 0 && onClick(type)}
    >
      <img src={icon} alt={type} />
      <span className="ticket-count">{count}</span>
    </div>
  );
}

export default Game;