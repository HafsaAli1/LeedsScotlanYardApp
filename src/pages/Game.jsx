import { useEffect, useState } from "react";
import { getGameState, getMaps } from "../services/api";
import "../App.css";

function Game() {
  const [mapImage, setMapImage] = useState("");

  useEffect(() => {
    const loadMap = async () => {
      try {
        const gameId = localStorage.getItem("gameId");

        const game = await getGameState(gameId);
        const maps = await getMaps();

        const selectedMap = maps.find(
          (map) => map.mapId === game.mapId
        );

        // if (selectedMap) {
        //   setMapImage(`http://trinity-developments.co.uk/images/Team1map2.png`);
        // }

        const fullImage = selectedMap.mapThumb.replace("Thumb", "");
        setMapImage(fullImage);

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
        <div className="map-container">
          <img src={mapImage} alt="Game Map" className="map-image" />
        </div>
      ) : (
        <p>Loading map...</p>
      )}
    </div>
  );
}

export default Game;