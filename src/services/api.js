// src/services/api.js

// Base URL of your server
const BASE_URL = "http://trinity-developments.co.uk/";


// Fetch all available maps
// Returns a list of maps from the server
export async function getMaps() {
  const res = await fetch(`${BASE_URL}/maps`);
  if (!res.ok) throw new Error("Failed to fetch maps");
  return res.json(); // returns an array of maps
}


// Create a new game
// gameName: the name the player gives the game
// mapId: the ID of the map they want to play on
// Returns an object from the server including:
// - gameId: the unique ID of the game
// - gameCode: code players use to join
// - creatorPlayerId: your player ID as the game creator
export async function createGame(gameName, mapId) {
  const res = await fetch(`${BASE_URL}/games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: gameName, mapId }),
  });

  if (!res.ok) throw new Error("Failed to create game");
  return res.json();
}


// Join an existing game
// gameId: the ID or code of the game to join
// playerName: the name the player wants to use
// Returns an object including:
// - playerId: the unique ID assigned to this player
export async function joinGame(gameId, playerName) {
  const res = await fetch(`${BASE_URL}/games/${gameId}/players`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerName }),
  });

  if (!res.ok) throw new Error("Failed to join game");
  return res.json();
}

// Get the current state of a game
// gameId: the ID of the game
// Returns an object including:
// - players: array of players currently in the game
export async function getGameState(gameId) {
  const res = await fetch(`${BASE_URL}/games/${gameId}`);
  if (!res.ok) throw new Error("Failed to fetch game state");
  return res.json();
}