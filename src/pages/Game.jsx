// import { useEffect, useState } from "react";
// import { getGameState, getMaps } from "../services/api";
// import "../App.css";

// function Game() {
//   const [mapImage, setMapImage] = useState("");

//   useEffect(() => {
//     const loadMap = async () => {
//       try {
//         const gameId = localStorage.getItem("gameId");

//         const game = await getGameState(gameId);
//         const maps = await getMaps();

//         const selectedMap = maps.find(
//           (map) => map.mapId === game.mapId
//         );

//         // if (selectedMap) {
//         //   setMapImage(`http://trinity-developments.co.uk/images/Team1map2.png`);
//         // }

//         const fullImage = selectedMap.mapThumb.replace("Thumb", "");
//         setMapImage(fullImage);

//       } catch (err) {
//         console.error("Failed to load map:", err);
//       }
//     };

//     loadMap();
//   }, []);

//   return (
//     <div className="container">
//       <h1>Game Board</h1>

//       {mapImage ? (
//         <div className="map-container">
//           <img src={mapImage} alt="Game Map" className="map-image" />
//         </div>
//       ) : (
//         <p>Loading map...</p>
//       )}
//     </div>
//   );
// }

// export default Game;







import { useEffect, useState } from "react";
import { getGameState, getMaps } from "../services/api";
import "../App.css";
import taxiIcon from "../assets/tickets/taxi.png";
import busIcon from "../assets/tickets/bus.png";
import undergroundIcon from "../assets/tickets/underground.png";
import mrxIcon from "../assets/tickets/mrx.png";
import doubleIcon from "../assets/tickets/2x.png";

function Game() {
  const [mapImage, setMapImage] = useState("");
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const loadMap = async () => {
      try {
        const gameId = localStorage.getItem("gameId");
        const game = await getGameState(gameId);
        const maps = await getMaps();

        const selectedMap = maps.find((map) => map.mapId === game.mapId);

        if (selectedMap) {
          const fullImage = selectedMap.mapThumb.replace("Thumb", "");
          setMapImage(fullImage);
        }

        if (game.players) {
          const detailedPlayers = await Promise.all(
            game.players.map(async (p) => {
              const res = await fetch(`http://trinity-developments.co.uk/players/${p.playerId}`);
              return res.json();
            })
          );
          setPlayers(detailedPlayers);
        }
      } catch (err) {
        console.error("Failed to load map:", err);
      }
    };

    loadMap();
  }, []);

  return (
    <div className="container">
      <h1>Game Board</h1>

      {mapImage ? (
        <div className="game-layout">
          
          {/* Left Column: Map + Current Player */}
          <div className="left-column">
            <div className="map-container">
              <img src={mapImage} alt="Game Map" className="map-image" />
            </div>

            <div className="current-player-box">
              <span className="current-player-title">Current Player</span>
              <div className="current-player-name">
                {players.length > 0 ? players[0].playerName : "Loading..."}
                
                <div className="ticket-row">
                  <div className="ticket">
                    <img src={taxiIcon} alt="Taxi" />
                    <span>{players[0]?.yellow ?? 0}</span>
                  </div>
                  <div className="ticket">
                    <img src={busIcon} alt="Bus" />
                    <span>{players[0]?.green ?? 0}</span>
                  </div>
                  <div className="ticket">
                    <img src={undergroundIcon} alt="Underground" />
                    <span>{players[0]?.red ?? 0}</span>
                  </div>
                  <div className="ticket">
                    <img src={mrxIcon} alt="Mr X" />
                    <span>{players[0]?.black ?? 0}</span>
                  </div>
                  <div className="ticket">
                    <img src={doubleIcon} alt="Double Move" />
                    <span>{players[0]?.["x2"] ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Other Players */}
          <div className="players-panel">
            <div className="players-list">
              {players.slice(1).map((player) => (
                <div key={player.playerId} className="player-box">
                  <p className="player-name">{player.playerName}</p>
                  <div className="ticket-row">
                    <div className="ticket">
                      <img src={taxiIcon} alt="Taxi" />
                      <span>{player.yellow ?? 0}</span>
                    </div>
                    <div className="ticket">
                      <img src={busIcon} alt="Bus" />
                      <span>{player.green ?? 0}</span>
                    </div>
                    <div className="ticket">
                      <img src={undergroundIcon} alt="Underground" />
                      <span>{player.red ?? 0}</span>
                    </div>
                    <div className="ticket">
                      <img src={mrxIcon} alt="Mr X" />
                      <span>{player.black ?? 0}</span>
                    </div>
                    <div className="ticket">
                      <img src={doubleIcon} alt="Double Move" />
                      <span>{player["x2"] ?? 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div> 
      ) : (
        <p>Loading map...</p>
      )}
    </div>
  );
}

export default Game;