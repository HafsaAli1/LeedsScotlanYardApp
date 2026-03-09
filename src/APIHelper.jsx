const API = "http://trinity-developments.co.uk/api";

// Creating API endpoint to list available maps as a coded function
export async function getMaps() {
    const res = await fetch(`${API}/maps`);
    return await res.json();
}

// Creating API endpoint to identify desired map as a coded function
export async function getMap(mapid) {
    const res = await fetch(`${API}/maps/${mapId}`);
    return await res.json();
}

// Creating API endpoint to list available games as a coded function
export async function getOpenGames() {
    const res = await fetch(`${API}/games`);
    return await res.json();
}

// Creating API endpoint to create new game as a coded function
export async function createGame(mapId) {
    const res = await fetch(`${API}/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mapId })
});
    return await res.json();
}

// Creating API endpoint to join game as a coded function
export async function joinGame(gameId, name) {
    const res = await fetch(`${API}/games/${gameId}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    });
}

// Creating API endpoint to start game as a coded function
export async function startGame(gameId, playerId) {
    await fetch(`${API}/games/${gameId}/start/${playerId}`, {
        method: "PATCH"
    });
}

// Creating API endpoint to get desired game as a coded function
export async function getGame(gameId) {
    const res = await fetch(`${API}/games/${gameId}`);
    return await res.json();
}

// Creating API endpoint to move player as a coded function
export async function movePlayer(playerId, location) {
    const res = await fetch(`${API}/players/${playerId}/moves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location })
    });
    return await res.json()
}