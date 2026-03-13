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

const TicketNames = {
    taxi: "Taxi",
    bus: "Bus",
    train: "Train",
};

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
                const selectedMap = maps.find(m => m.mapId === game.mapId);

                if (selectedMap)
                    setMapImage(selectedMap.mapThumb.replace("Thumb", ""));

                setNodes(mapDetails.locations);
            }

            const myIdStr = String(pId).trim();

            const isDrX =
                game.creatorPlayerId
                ? myIdStr === String(game.creatorPlayerId).trim()
                : (game.players && String(game.players[0].playerId) === myIdStr);
            
            let myPos = status.location !== "Hidden" ? status.location : null;

            if (!myPos) myPos = status.startLocation || status.initialLocation || status.nodeId;
            if (!myPos) myPos = sessionStorage.getItem("currentLocation");

            setGameState(game);

            setPlayerInfo({
                ...status,
                playerId: pId,
                role: isDrX ? "fugitive" : "detective",
                tickets: status.tickets || { taxi: 10, bus: 8, train: 4 },
                realLocation: myPos
            });

            if (isInitial) setLoading(false);
        } catch (err) {

            console.error("Sync Error: ", err);

            if (isInitial) setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAllData(true);
    }, [loadAllData]);

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
            alert("Please select a ticket type before moving.");
            return;
        }

        const gId = sessionStorage.getItem("gameId");
        const pId = sessionStorage.getItem("playerId");

        if (gameState.currentPlayerId !== Number(pId)) {

            alert("It is not your turn yet. Please wait for the other players to move.");
            return;
        }

        try {

            await movePlayer(gId, pId, locationId, selectedTicket);

            sessionStorage.setItem("currentLocation", locationId);

            setPlayerInfo(prev =>({
                ...prev,
                realLocation: locationId,
                tickets: {
                    ...prev.tickets,
                    [selectedTicket.toLowerCase()]:
                    prev.tickets[selectedTicket.toLowerCase()] - 1
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

            {playerInfo?.role === "fugitive"
              ? "Dr. X"
              : "Detective"}

          </span>

          <p className="station-display">

            Your Station:
            <strong>
              {playerInfo?.realLocation || "Hidden"}
            </strong>

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

      <div className="ticket-bar">

        {playerInfo?.tickets &&
          Object.entries(playerInfo.tickets).map(([type, count]) => (

            <div
              key={type}
              className={`ticket ${type.toLowerCase()} ${selectedTicket === type ? "selected" : ""}`}
              onClick={() => count > 0 && setSelectedTicket(type)}
            >

              <span className="count">{count}</span>

              <span className="label">

                {TicketNames[type] || type.toUpperCase()}

              </span>

            </div>

          ))}

      </div>

    </div>
  );
}

export default Game;