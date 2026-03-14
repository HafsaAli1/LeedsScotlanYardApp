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













// import { useEffect, useState, useCallback } from "react";
// // Ensure getPlayerStatus is exported from your ../services/api file
// import { getGameState, getMaps, getPlayerStatus, getMapDetails, movePlayer } from "../services/api";
// import MapView from "./MapView";
// import "../App.css";

// // Icons
// import taxiIcon from "../assets/tickets/taxi.png";
// import busIcon from "../assets/tickets/bus.png";
// import undergroundIcon from "../assets/tickets/underground.png";
// import mrxIcon from "../assets/tickets/mrx.png";
// import doubleIcon from "../assets/tickets/2x.png";

// function Game() {
//   const [loading, setLoading] = useState(true);
//   const [mapImage, setMapImage] = useState("");
//   const [nodes, setNodes] = useState([]);
//   const [gameState, setGameState] = useState(null);
//   const [playerInfo, setPlayerInfo] = useState(null);
//   const [selectedTicket, setSelectedTicket] = useState(null);

//   const loadAllData = useCallback(async (isInitial = false) => {
//     const gId = sessionStorage.getItem("gameId");
//     const pId = sessionStorage.getItem("playerId");

//     try {
//       // 1. Fetch Core Game Data
//       const [game, maps, status] = await Promise.all([
//         getGameState(gId),
//         getMaps(),
//         getPlayerStatus(pId)
//       ]);

//       // 2. Fetch Detailed Data for all players to sync ticket counts
//       let me = status;
//       if (game.players) {
//         const detailedPlayers = await Promise.all(
//           game.players.map(async (p) => {
//             const res = await fetch(`http://trinity-developments.co.uk/players/${p.playerId}`);
//             return res.json();
//           })
//         );
//         me = detailedPlayers.find(p => String(p.playerId) === String(pId)) || status;
//       }

//       // 3. Setup Map (Only on first load)
//       if (isInitial) {
//         const mapDetails = await getMapDetails(game.mapId);
//         const selectedMap = maps.find(m => m.mapId === game.mapId);
//         if (selectedMap) setMapImage(selectedMap.mapThumb.replace("Thumb", ""));
//         setNodes(mapDetails.locations);
//       }

//       // 4. Update State
//       // 4. Update State
//       const myIdStr = String(pId).trim();
      
//       // We check if you are the creator OR if you are the first player in the list (Dr. X)
//       const isDrX = game.creatorPlayerId 
//         ? myIdStr === String(game.creatorPlayerId).trim() 
//         : (game.players && String(game.players[0].playerId) === myIdStr);

//       setGameState(game);
//       setPlayerInfo({
//         ...me,
//         role: isDrX ? "fugitive" : "detective", // Correctly sets Dr. X vs Detective
//         tickets: {
//           taxi: me?.yellow ?? 0,
//           bus: me?.green ?? 0,
//           underground: me?.red ?? 0,
//           black: me?.black ?? 0,
//           x2: me?.x2 ?? 0
//         },
//         currentLocation: me?.location !== "Hidden" ? me?.location : (sessionStorage.getItem("currentLocation") || "Hidden")
//       });

//       if (isInitial) setLoading(false);
//     } catch (err) {
//       console.error("Sync Error:", err);
//       if (isInitial) setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadAllData(true);
//   }, [loadAllData]);

//   useEffect(() => {
//     const interval = setInterval(() => { loadAllData(false); }, 5000);
//     return () => clearInterval(interval);
//   }, [loadAllData]);

//   const handleNodeClick = async (locationId) => {
//     if (!selectedTicket) {
//       alert("Please select a ticket type first!");
//       return;
//     }
//     const gId = sessionStorage.getItem("gameId");
//     const pId = sessionStorage.getItem("playerId");

//     try {
//       await movePlayer(gId, pId, locationId, selectedTicket);
//       sessionStorage.setItem("currentLocation", locationId);
//       setSelectedTicket(null);
//       loadAllData(false);
//     } catch (err) {
//       alert(`Invalid move: ${err.message}`);
//     }
//   };

//   if (loading) return <div className="container"><h2>Loading Map...</h2></div>;

//   return (
//     <div className="game-screen">
//       <div className="floating-header">
//         <span className={`badge ${playerInfo?.role}`}>
//           {playerInfo?.role === "fugitive" ? "Dr. X" : "Detective"}
//         </span>
//         <span className="station-pill">Station: {playerInfo?.currentLocation}</span>
//         <span className="phase-pill">PHASE: {gameState?.state}</span>
//       </div>

//       <div className="map-viewport">
//         <MapView 
//           image={mapImage} 
//           nodes={nodes} 
//           onNodeClick={handleNodeClick} 
//           activeTicket={selectedTicket}
//           playerLocation={playerInfo?.currentLocation} 
//           allPlayers={gameState?.players} 
//         />
//       </div>

//       <div className="game-hud">
//         <div className="inventory-bar">
//           <div className="ticket-row">
//             <TicketItem type="taxi" icon={taxiIcon} count={playerInfo?.tickets?.taxi} selected={selectedTicket} onClick={setSelectedTicket} />
//             <TicketItem type="bus" icon={busIcon} count={playerInfo?.tickets?.bus} selected={selectedTicket} onClick={setSelectedTicket} />
//             <TicketItem type="underground" icon={undergroundIcon} count={playerInfo?.tickets?.underground} selected={selectedTicket} onClick={setSelectedTicket} />
//             <TicketItem type="black" icon={mrxIcon} count={playerInfo?.tickets?.black} selected={selectedTicket} onClick={setSelectedTicket} />
//             <TicketItem type="x2" icon={doubleIcon} count={playerInfo?.tickets?.x2} selected={selectedTicket} onClick={setSelectedTicket} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function TicketItem({ type, icon, count, selected, onClick }) {
//   return (
//     <div 
//       className={`ticket-unit ${selected === type ? 'active' : ''} ${count === 0 ? 'disabled' : ''}`}
//       onClick={() => count > 0 && onClick(type)}
//     >
//       <img src={icon} alt={type} style={{ width: '30px', height: 'auto' }} />
//       <span className="ticket-count">{count ?? 0}</span>
//     </div>
//   );
// }

// export default Game;














import { useEffect, useState, useCallback } from "react";
import { getGameState, getMaps, getPlayerStatus, getMapDetails, movePlayer } from "../services/api";
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
  const [moveHistory, setMoveHistory] = useState([]);

  const [isLogOpen, setIsLogOpen] = useState(false);

  const loadAllData = useCallback(async (isInitial = false) => {
    const gId = sessionStorage.getItem("gameId");
    const pId = sessionStorage.getItem("playerId");

    try {
      // 1. Fetch Core Game Data
      const [game, maps, status] = await Promise.all([
        getGameState(gId),
        getMaps(),
        getPlayerStatus(pId)
      ]);

      if (game.players) {
      const historyResults = await Promise.all(
        game.players.map(async (p) => {
          const moveRes = await fetch(`http://trinity-developments.co.uk/players/${p.playerId}/moves`);
          const moveData = await moveRes.json();
          return {
            playerName: p.playerName,
            role: p.role || (p.playerId === game.creatorPlayerId ? 'fugitive' : 'detective'),
            moves: moveData.moves || [] // The API returns an object with a "moves" array
          };
        })
      );
      setMoveHistory(historyResults);
    }
      // 2. Fetch Detailed Data for all players to sync ticket counts
      let me = status;
      if (game.players) {
        const detailedPlayers = await Promise.all(
          game.players.map(async (p) => {
            const res = await fetch(`http://trinity-developments.co.uk/players/${p.playerId}`);
            return res.json();
          })
        );
        me = detailedPlayers.find(p => String(p.playerId) === String(pId)) || status;
      }

      // 3. Setup Map (Only on first load)
      if (isInitial) {
        const mapDetails = await getMapDetails(game.mapId);
        const selectedMap = maps.find(m => m.mapId === game.mapId);
        if (selectedMap) setMapImage(selectedMap.mapThumb.replace("Thumb", ""));
        setNodes(mapDetails.locations);
      }

      // 4. Update State Logic
      const myIdStr = String(pId).trim();
      const serverRole = me.role?.toLowerCase(); 
      
      const isDrX = serverRole 
        ? serverRole === "fugitive" 
        : (game.creatorPlayerId 
            ? myIdStr === String(game.creatorPlayerId).trim() 
            : (game.players && String(game.players[0].playerId) === myIdStr));

      setGameState(game);
      setPlayerInfo({
        ...me,
        role: isDrX ? "fugitive" : "detective",
        tickets: {
          taxi: me?.yellow ?? 0,
          bus: me?.green ?? 0,
          underground: me?.red ?? 0,
          black: me?.black ?? 0,
          x2: me?.["2x"] ?? me?.x2 ?? 0 
        },
        currentLocation: me?.location !== "Hidden" ? me?.location : (sessionStorage.getItem("currentLocation") || "Hidden")
      });

      if (isInitial) setLoading(false);
    } catch (err) {
      console.error("Sync Error:", err);
      if (isInitial) setLoading(false);
    }
  }, []);




  useEffect(() => {
    loadAllData(true);
  }, [loadAllData]);

  useEffect(() => {
    const interval = setInterval(() => { loadAllData(false); }, 5000);
    return () => clearInterval(interval);
  }, [loadAllData]);

  const handleNodeClick = async (locationId) => {
    const myRole = playerInfo?.role?.toLowerCase();
    const currentPhase = gameState?.state?.toLowerCase();

    // 1. Turn Validation
    if (myRole !== currentPhase) {
      const turnOwner = currentPhase === "fugitive" ? "Dr. X" : "the Detectives";
      alert(`It is not your turn! Waiting for ${turnOwner}.`);
      return;
    }

    if (!selectedTicket) {
      alert("Please select a ticket type first!");
      return;
    }

    // 2. Map UI labels to API-required lowercase strings
    const ticketMapping = {
      taxi: "yellow",
      bus: "green",
      underground: "red",
      black: "black",
      x2: "x2"
    };

    const gId = sessionStorage.getItem("gameId");
    const pId = sessionStorage.getItem("playerId");

    try {
      const response = await fetch(`http://trinity-developments.co.uk/players/${pId}/moves`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", 
          "Accept": "application/json"
        },
        body: JSON.stringify({
          gameID: Number(gId),           
          ticket: ticketMapping[selectedTicket.toLowerCase()],
          destination: Number(locationId) 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Move rejected by server");
      }

      // 4. Success: Update local state immediately
      console.log("Move Successful:", data);
      
      sessionStorage.setItem("currentLocation", locationId);
      setSelectedTicket(null);
      alert("Move successful!");
      
      // Refresh to get new turn state and ticket counts
      await loadAllData(false);

    } catch (err) {
      console.error("Move Error:", err);
      alert(`Invalid move: ${err.message}`);
    }
  };
  //   try {
  //     await movePlayer(gId, pId, locationId, apiTicket);
  //     sessionStorage.setItem("currentLocation", locationId);
  //     setSelectedTicket(null);
  //     await loadAllData(false);
  //     alert("Move successful!");
  //   } catch (err) {
  //     alert(`Invalid move: ${err.message}`);
  //   }
  // };


  if (loading) return <div className="container"><h2>Loading Map...</h2></div>;

  return (
    <div className="game-screen">
      <div className="floating-header">
        {/* ADDED: Button to open the Travel Log */}
        <button className="log-toggle-btn" onClick={() => setIsLogOpen(true)}>
          Travel Log
        </button>
        <span className={`badge ${playerInfo?.role}`}>
          {playerInfo?.role === "fugitive" ? "Dr. X" : "Detective"}
        </span>
        <span className="station-pill">Station: {playerInfo?.currentLocation}</span>
        <span className="phase-pill">PHASE: {gameState?.state}</span>
        {/* Round Pill - Pulled from gameState (round and length) */}
        {gameState && (
          <span className="round-pill">
            Round: {gameState.round} / {gameState.length}
          </span>
        )}
      </div>
      {/*Show log only if isLogOpen is true */}
      {isLogOpen && (
        <MoveLog history={moveHistory} onClose={() => setIsLogOpen(false)} />
      )}
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

      <div className="game-hud">
        <div className="inventory-bar">
          <div className="ticket-row">
            <TicketItem type="taxi" icon={taxiIcon} count={playerInfo?.tickets?.taxi} selected={selectedTicket} onClick={setSelectedTicket} />
            <TicketItem type="bus" icon={busIcon} count={playerInfo?.tickets?.bus} selected={selectedTicket} onClick={setSelectedTicket} />
            <TicketItem type="underground" icon={undergroundIcon} count={playerInfo?.tickets?.underground} selected={selectedTicket} onClick={setSelectedTicket} />
            <TicketItem type="black" icon={mrxIcon} count={playerInfo?.tickets?.black} selected={selectedTicket} onClick={setSelectedTicket} />
            <TicketItem type="x2" icon={doubleIcon} count={playerInfo?.tickets?.x2} selected={selectedTicket} onClick={setSelectedTicket} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TicketItem({ type, icon, count, selected, onClick }) {
  return (
    <div 
      className={`ticket-unit ${selected === type ? 'active' : ''} ${count === 0 ? 'disabled' : ''}`}
      onClick={() => count > 0 && onClick(type)}
    >
      <img src={icon} alt={type} style={{ width: '30px', height: 'auto' }} />
      <span className="ticket-count">x{count ?? 0}</span>
    </div>
  );
}

// function MoveLog({ history }) {
//   const translateTicket = (apiTicket) => {
//     const ticket = apiTicket?.toLowerCase();
//     if (ticket === 'green') return 'BUS';
//     if (ticket === 'yellow') return 'TAXI';
//     if (ticket === 'red') return 'UNDERGROUND';
//     return apiTicket?.toUpperCase();
//   };

function MoveLog({ history, onClose }) {
  const translateTicket = (apiTicket) => {
    const ticket = apiTicket?.toLowerCase();
    if (ticket === 'green') return 'BUS';
    if (ticket === 'yellow') return 'TAXI';
    if (ticket === 'red') return 'UNDERGROUND';
    return apiTicket?.toUpperCase();
  };

  return (
    <div className="move-log-overlay">
      <div className="log-header-container">
        <h3 className="log-title">Travel Log</h3>
        <button className="log-close-btn" onClick={onClose}>×</button>
      </div>
      <div className="log-content">
        {history.map((player, pIdx) => {
          const isFugitive = player.role === 'fugitive';
          
          return (
            <div key={pIdx} className="log-player-block">
              <div className="log-player-header">
                <span className={`log-role-dot ${player.role}`}></span>
                <strong>{player.playerName}</strong>
              </div>
              <div className="log-move-list">
                {player.moves.map((m, mIdx) => {
                  const roundNumber = mIdx + 1;
                  
                  // If it's Dr. X, only show the location at specific rounds.
                  // Otherwise, show "???"
                  const shouldShowLocation = !isFugitive || (roundNumber % 3 === 0);

                  return (
                    <div key={mIdx} className="log-entry">
                      <span className="log-round">{roundNumber}</span>
                      <span className={`log-ticket-type ${m.ticket?.toLowerCase()}`}>
                        {translateTicket(m.ticket)}
                      </span>
                      <span className="log-station">
                        {shouldShowLocation ? m.destination : "???"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default Game;