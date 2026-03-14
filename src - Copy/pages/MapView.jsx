import React from 'react';

// This component draws the map and all the interactive nodes on top of it
const MapView = ({ image, nodes, onNodeClick, activeTicket, playerLocation, allPlayers }) => {
  // Pull player ID from storage so we can identify which dot you are
  const myPlayerId = sessionStorage.getItem("playerId");
  

  // look through the player list to find our own data
  const me = allPlayers?.find(p => String(p.playerId) === String(myPlayerId));
  // Check if our role is fugitive
  const amIDrX = me?.role?.toLowerCase() === 'fugitive' || me?.role?.toLowerCase() === 'drx';


  // This function decides what color a player's dot should be
  const getPlayerColor = (player) => {
    if (!player) return 'rgba(255, 255, 255, 0.3)'; // Default transparent white for empty spots
    
    // Check if the server already gave them a specific color
    const serverColor = player.color || player.playerColor || player.assignedColor;
    if (serverColor) return serverColor;

    // If the server didn't provide a color, we assign one ourselves
    if (player.role?.toLowerCase() === 'fugitive') return '#ff0000'; // Dr. X is always Red
    
    // List of bright colors for detectives
    const detectiveColors = ['#2ecc71', '#3498db', '#f1c40f', '#9b59b6', '#e67e22'];
    // Use the player's position in the list to give them a consistent color
    const index = allPlayers.indexOf(player) % detectiveColors.length;
    return detectiveColors[index];
  };

  return (
    // The main container for the map. 'inline-block' keeps it the size of the image.
    <div className="map-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
      {/* The background map image */}
      <img src={image} alt="Map" className="map-img" style={{ display: 'block' }} />

      {/* loop through every single station (node) and draw it on the map */}
      {nodes.map((node) => {
        const nodeLoc = String(node.location);
        
        // Check if you are standing at this specific station
        const isMeHere = String(playerLocation) === nodeLoc;

        // Check if another player is here, but only if you are allowed to see them
        const otherPlayer = allPlayers?.find(p => {
          // Skip if the player being checked is actually you
          if (String(p.playerId) === String(myPlayerId)) return false;
          
          // Is this player standing at this station?
          const isAtNode = String(p.location) === nodeLoc;
          if (!isAtNode) return false;


          // If you are Dr. X, you can see every detective's dot
          if (amIDrX) return true; 
          
          // If you are a Detective, you only see other Detectives.
          // You don't see Dr. X unless he is at a "Reveal" station
          const isTargetDrX = p.role?.toLowerCase() === 'fugitive' || p.role?.toLowerCase() === 'drx';
          return !isTargetDrX; 
        });

        // dot colouring
        let bgColor = 'rgba(255, 255, 255, 0.3)'; 
        
        if (isMeHere) {
          bgColor = getPlayerColor(me); // Use your color
        } else if (otherPlayer) {
          bgColor = getPlayerColor(otherPlayer); // Use their assigned color 
        } else if (activeTicket) {
          // If you have clicked a ticket, highlight nearby stations in Yellow to show where you can move
          bgColor = 'rgba(255, 255, 0, 0.6)'; 
        }

        const isOccupied = isMeHere || otherPlayer;

        return (
          // The actual clickable circle on the map
          <div
            key={node.location}
            onClick={() => onNodeClick(node.location)} // Handles moving when clicked
            className="map-node"
            style={{
              position: 'absolute',
              // Use X and Y positions from the server to place the dot correctly
              left: `${node.xPos}px`,
              top: `${node.yPos}px`,
              transform: 'translate(-50%, -50%)', // Center the circle on the coordinate
              width: isOccupied ? '28px' : '18px', // Make dots bigger if a player is there
              height: isOccupied ? '28px' : '18px',
              borderRadius: '50%',
              backgroundColor: bgColor,
              border: isOccupied ? '3px solid white' : '1px solid #000',
              // Add a glow effect if a player is standing there
              boxShadow: isOccupied ? `0 0 12px ${bgColor}` : 'none',
              cursor: 'pointer',
              zIndex: isOccupied ? 100 : 10, // Put players on top of empty dots
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'all 0.2s ease' // Smooth animation when dots change size/color
            }}
          >
            {/* Show YOU or the Detective's name below the dot */}
            {isOccupied && (
              <div style={{ 
                position: 'absolute', 
                top: '32px', 
                backgroundColor: 'rgba(0,0,0,0.7)', 
                color: 'white', 
                fontSize: '10px', 
                padding: '2px 6px', 
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                fontWeight: 'bold',
                pointerEvents: 'none' // Don't block clicks to the map
              }}>
                {isMeHere ? "YOU" : otherPlayer.playerName}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MapView;
