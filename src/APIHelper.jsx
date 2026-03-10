const API = "http://trinity-developments.co.uk/api";

export async function getMaps() {
    
    const res = await fetch(`${API}/maps`);

    if (!res.ok) {
        throw new Error("Failed to get maps");
    }

    return await res.json();
}

export async function getMap(mapId) {
    
    const res = await fetch(`${API}/maps/${mapId}`);

    if (!res.ok) {
        throw new Error("Failed to get map");
    }

    return await res.json();
}

export async function getOpenGames() {
    
    const res = await fetch(`${API}/games`);

    if (!res.ok) {
        throw new Error("Failed to get games");
    }

    return await res.json();
}

export async function createGame(mapId) {
    
    const res = await fetch(`${API}/games`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            mapId: mapId
        })
    });

    if (!res.ok) {
        throw new Error("Failed to create game");
    }

    return await res.json();
}

export async function joinGame(gameId, name) {

    const res = await fetch(`${API}/games/${gameId}/players`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name
        })
    });

    if (!res.ok) {
        throw new Error("Failed to join game");
    }

    return await res.json();
}

export async function startGame(gameId, playerId) {

    const res = await fetch(`${API}/games/${gameId}/start/${playerId}`, {
        method: "PATCH"
    });

    if (!res.ok) {
        throw new Error("Failed to start game");
    }

    return true;
}

export async function getGame(gameId) {

    const res = await fetch(`${API}/games/${gameId}`);

    if (!res.ok) {
        throw new Error("Failed to fetch game");
    }

    return await res.json();
}

export async function movePlayer(playerId, location) {

    const res = await fetch(`${API}/players/${playerId}/moves`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            location: location
        })
    });

    if (!res.ok) {
        throw new Error("Move failed");
    }

    return await res.json();
}