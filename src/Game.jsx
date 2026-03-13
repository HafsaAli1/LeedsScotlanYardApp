import { useEffect, useState, useCallback } from "react";
import { getGameState,
         getMaps,
         getPlayerStatus,
         getMapDetails,
         movePlayer,
         updateGame
} from "../services/api";

import MapView from "./MapView";
import "../App.css";

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
      const [game, maps, status] = await Promise.all([
        getGameState(gId),
        getMaps(),
        getPlayerStatus(pId)
      ]);

      if (isInitial) {

        const mapDetails = await getMapDetails(game.mapId);
        const selectedMap = maps.find(m => m.id === game.mapId);

        if (selectedMap)
          setMapImage(selectedMap.mapThumb.replace("Thumb", ""));

        setNodes(mapDetails.locations);
      }

      const myIdStr = String(pId).trim();

      const isDrX =
        game.creatorPlayerId
        ? myIdStr === String(game.creatorPlayerId).trim()
        : (game.players && String(game.players[0].playerId) === myIdStr);
    
      let myPos = status.location !== "Hidden" ? status.lcoation : null;

      if (!myPos) myPos = status.startLocation || status.initialLocation || status.nodeId;
      if (!myPos) myPos = sessionStorage.getItem("currentLocation");

      setGameState(game);

      setPlayerInfo({
        ...status,
        playerId: pId,
        role: isDrX ? "fugitive" : "detective",

        tickets: {
          taxi: status?.yellow ?? 0,
          bus: status?.green ?? 0,
          underground: status?.red ?? 0,
          black: status?.black ?? 0,
          x2: status?.x2 ?? 0
        },

        realLocation: myPos
      });

      if (isInitial) setLoading(false);

    } catch (err) {

      console.error("Sync Error: ", err);

      if (isInitial) setLoading(false);
    }

  }, []);

  useEffect(() => { loadAllData(true); }, [loadAllData]);

  useEffect(() => {

    const interval = setInterval(() => {
      loadAllData(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [loadAllData]);

  const getNextPlayer = () => {

    if (!gameState?.players) return null;

    const ids = gameState.players.map(p => p.playerId);

    const index = ids.indexOf(gameState.currentPlayerId);

    const nextIndex = (index + 1) % ids.length;

    return ids[nextIndex];
  };

  const handleNodeClick = async (locationId) => {

    if (!selectedTicket) {
      
      alert("Please select a ticket to move.");
      return;
    }

    const gId = sessionStorage.getItem("gameId");
    const pId = sessionStorage.getItem("playerId");

    if (gameState.currentPlayerId !== Number(pId)) {

      alert("It's not your turn!");
      return;
    }

    try {

      await movePlayer(gId, pId, locationId, selectedTicket);

      sessionStorage.setItem("currentLocation", locationId);

      setPlayerInfo(prev => ({
        ...prev,
        realLocation: locationId,
        tickets: {
          ...prev.tickets,
          [selectedTicket]: 
          prev.tickets[selectedTicket] - 1
        }
      }));

      const nextPlayer = getNextPlayer();

      await updateGame({
        gameId: gId,
        currentPlayerId: nextPlayer,
        turn: gameState.turn + 1
      });

      setSelectedTicket(null);

      alert("Move Successful!");

      loadAllData(false);

    } catch (err) {

      alert(`Invalid Move: ${err.message}`);
    }
  };

  if (loading)
    return (
      <div className="container">
        <h2>Loading...</h2>
      </div>
    );

  return (
    <div className="game-screen">

      <div className="game-header-centered">
        <div className="header-status-box">

          <span className={`badge ${playerInfo?.role}`}>
            {playerInfo?.role === "fugitive" ? "Dr. X" : "Detective"}
          </span>

          <p className="station-display">
            Your Station:
            <strong>{playerInfo?.realLocation || "Hidden"}</strong>
          </p>

        </div>
      </div>

      <div className="turn-indicator">

        <h3>
          PHASE:
          <span className={gameState?.state?.toLowerCase()}>
            {gameState?.state?.toUpperCase()}
          </span>
        </h3>

        <p>
          Current Player:
          <strong> {gameState?.currentPlayerId}</strong>
        </p>

      </div>

      <div className="map-scroll-container">

        <MapView
          image={mapImage}
          nodes={nodes}
          onNodeClick={handleNodeClick}
          activeTicket={selectedTicket}
          playerLocation={playerInfo?.realLocation}
          allPlayers={gameState?.players}
        />

      </div>

      {/* ADVANCED TICKET BAR */}

      <div className="ticket-bar-advanced">

        <TicketItem
          type="taxi"
          icon={taxiIcon}
          count={playerInfo?.tickets.taxi}
          selected={selectedTicket}
          onClick={setSelectedTicket}
        />

        <TicketItem
          type="bus"
          icon={busIcon}
          count={playerInfo?.tickets.bus}
          selected={selectedTicket}
          onClick={setSelectedTicket}
        />

        <TicketItem
          type="underground"
          icon={undergroundIcon}
          count={playerInfo?.tickets.underground}
          selected={selectedTicket}
          onClick={setSelectedTicket}
        />

        <TicketItem
          type="black"
          icon={mrxIcon}
          count={playerInfo?.tickets.black}
          selected={selectedTicket}
          onClick={setSelectedTicket}
        />

        <TicketItem
          type="x2"
          icon={doubleIcon}
          count={playerInfo?.tickets.x2}
          selected={selectedTicket}
          onClick={setSelectedTicket}
        />

      </div>

    </div>
  );
}

function TicketItem({ type, icon, count, selected, onClick }) {

  return (
    <div
      className={`ticket-unit ${selected === type ? "active" : ""} ${count === 0 ? "disabled" : ""}`}
      onClick={() => count > 0 && onClick(type)}
    >

      <img src={icon} alt={type} />

      <span className="ticket-count">
        {count}
      </span>

    </div>
  );
}

export default Game;