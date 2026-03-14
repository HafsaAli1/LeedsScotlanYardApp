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


  if (loading) return <div className="container"><h2>Loading Map...</h2></div>;
  if (gameState?.state === "over") console.log("The Winner is:", gameState.winner);
  return (
    <div className="game-screen">
      {/* WINNER REVEAL OVERLAY */}
      {gameState?.state?.toLowerCase() === "over" && (
        <div className="winner-overlay">
          <div className="winner-content">
            <h1 className="game-over-title">GAME OVER</h1>
            
            {/* Logic: If winner is 'detective' OR 'student' OR 'detectives', they win.
              We use .includes to be safe against different API naming conventions.
            */}
            {["detective", "student", "detectives"].includes(gameState.winner?.toLowerCase()) ? (
              <>
                <h2 className="victory-text">✨ SUCCESS! ✨</h2>
                <p className="victory-sub">You caught Dr. X! The assessment feedback is safe.</p>
              </>
            ) : (
              <>
                <h2 className="defeat-text"> DR. X ESCAPED </h2>
                <p className="defeat-sub">You failed to catch Dr. X and he has fled with you assessment feedback! </p>
              </>
            )}

            <div className="final-stats">
              <p>Total Rounds: {gameState.round}</p>
            </div>

            <button className="reset-btn" onClick={() => window.location.href = '/'}>
              Main Menu
            </button>
          </div>
        </div>
      )}
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





