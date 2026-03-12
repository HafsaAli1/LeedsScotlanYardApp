const BASE_URL = "http://trinity-developments.co.uk";


// Gets the list of all available maps
export async function getMaps() {
  const res = await fetch(`${BASE_URL}/maps`);
  if (!res.ok) throw new Error("Failed to fetch maps");
  return res.json();
}

// Gets the specific X and Y coordinates for every station on a map (for clickable nodes)
export async function getMapDetails(mapId) {
  const res = await fetch(`${BASE_URL}/maps/${mapId}`);
  if (!res.ok) throw new Error("Failed to fetch map details");
  return res.json(); // Returns an array of 'locations'
}


// Tells the server to create a brand new room
export async function createGame(gameName, mapId) {
  const res = await fetch(`${BASE_URL}/games`, {
    method: "POST", // 'POST' is used when we are creating something new
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: gameName, mapId }),
  });
  return res.json();
}

// Adds a player to an existing game room using a Game ID
export async function joinGame(gameId, playerName) {
  const res = await fetch(`${BASE_URL}/games/${gameId}/players`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerName }),
  });
  return res.json();
}

// Sees whose turn it is, player list, and scores
export async function getGameState(gameId) {
  const res = await fetch(`${BASE_URL}/games/${gameId}`);
  return res.json();
}

// Tells the server to start the game
export async function startGame(gameId, playerId) {
  const res = await fetch(`${BASE_URL}/games/${gameId}/start/${playerId}`, {
    method: "PATCH", // 'PATCH' is used when we are updating a piece of existing data
    headers: { "Content-Type": "application/json" },
  });

  // The server requires at least 3 players to begin a valid game
  if (!res.ok) throw new Error("Need at least 3 players to start!");

  // Some server responses are empty strings; this handles that without crashing
  const text = await res.text();
  return text ? JSON.parse(text) : { success: true };
}

// Movement
// Sends move choice to the server
export async function movePlayer(gameId, playerId, toNodeId, ticketType) {
  // package the move into a 'payload' object
  const payload = {
    playerId: Number(playerId),
    toNodeId: Number(toNodeId), // The server expects a number, not text
    ticketType: ticketType.toLowerCase() // 'Taxi', 'Bus', or 'Underground'
  };

  const res = await fetch(`${BASE_URL}/games/${gameId}/move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// Gets specific details for one player (their current tickets and secret location)
export async function getPlayerStatus(playerId) {
  const res = await fetch(`${BASE_URL}/players/${playerId}`);
  if (!res.ok) throw new Error("Could not get player status");
  return await res.json();
}


