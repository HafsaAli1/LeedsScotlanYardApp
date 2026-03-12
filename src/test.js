const API = "http://trinity-developments.co.uk/api";

console.log("Program started")

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

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function buildMap(locations, connections) {

    const nodes = {}
    const edges = {}

    locations.forEach(loc => {

        nodes[loc.Number] = {
            id: loc.Number,
            x: loc.xPos,
            y: loc.yPos
        }

        edges[loc.Number] = []
    })

    connections.forEach(conn => {

        edges[conn.A].push({
            to: conn.B,
            ticket: conn.Ticket
        })
    })

    return {nodes, edges}
}

export async function loadMapfromSQL() {
    
    const filepath = path.resolve(__dirname, "Team1Map2 1.sql");
    const text = await fs.readFile(filepath, "utf8");

    const locations = []
    const connections = []

    const locationRegex =
/INSERT INTO `locations` .* VALUES \('\d+',\s*'(\d+)',\s*'(\d+)',\s*'(\d+)'\);/g

const connectionRegex =
/INSERT INTO `connections` .* VALUES \('\d+',\s*'(\d+)',\s*'(\d+)',\s*'(\d+)'\);/g
    
    let match

    while ((match = locationRegex.exec(text)) !== null) {
        locations.push({
            Number: Number(match[1]),
            xPos: Number(match[2]),
            yPos: Number(match[3])
        })
    }

    while ((match = connectionRegex.exec(text)) !== null) {

        connections.push({
            A: Number(match[1]),
            B: Number(match[2]),
            Ticket: Number(match[3])
        })
    }

    return buildMap(locations, connections)
}

export class ScotlandYardGame {

    constructor(gameId, playerId) {

        this.gameId = gameId
        this.playerId = playerId

        this.state = null
        this.map = null
        this.players = {}
        this.playerCount = 5
    }

    AssignMrX() {

    const ids = Object.keys(this.players)

    const randomId =
        ids[Math.floor(Math.random() * ids.length)]

    this.players[randomId].role = "Mr X"
}

    async loadMap() {
        
        if (!this.map) {
            this.map = await loadMapfromSQL()
        }

        return this.map
    }

    async init() {
        
        console.log("Loading map...")

        this.map = await loadMapfromSQL()

        console.log("Map Loaded")
        console.log("Node count: ", Object.keys(this.map.nodes).length)

        this.randomisePlayers()

        console.log("Players randomised")

        this.AssignMrX()

        console.log("\nGenerated Players:")
        console.table(this.players)

        await this.printPlayerInfo()
    }

    async printPlayerInfo() {

        console.log("\n--- Player Locations ---\n")

        for (const player of Object.values(this.players)) {

            const moves = await this.getValidMovesForLocation(player.location)

            console.log(
                `Player ${player.id} (${player.role}) is at location ${player.location}`
            )

            const moveLocations = moves.length ? moves.map(m => m.location).join(", ") : "No moves"
console.log(`Possible moves: ${moveLocations}`)

            console.log("-----------------------")
        }
    }

    randomisePlayers() {

    const nodeIds = Object.keys(this.map.nodes).map(Number)
    const usedNodes = new Set()

    while (Object.keys(this.players).length < this.playerCount) {

        const randomNode =
            nodeIds[Math.floor(Math.random() * nodeIds.length)]

        if (usedNodes.has(randomNode)) continue

        const id = Object.keys(this.players).length + 1

        this.players[id] = {
            id: id,
            location: randomNode,
            role: "Detective"
        }

        usedNodes.add(randomNode)
    }
}

    getPlayers() {

        if (!this.state) return []

        return this.state.players
    }

    getCurrentPlayer() {

        if (!this.state) return null

        return this.state.players[this.state.turn]
    }

    getPlayer() {

        if (!this.state) return null

        return this.state.players.find(
            p => p.id === this.playerId
        )
    }

    async getValidMoves() {

        await this.loadMap()

        const player = this.getPlayer()

        if (!player) return []

        const location = player.location
        
        const moves = this.map.edges[location] || []

        return moves.map(
            m => ({
                location: m.to,
                ticket: m.ticket
            })
        )
    }

    async getValidMovesForLocation(location) {

        await this.loadMap()

        const moves = this.map.edges[location] || []

        return moves.map(
            m => ({
                location: m.to,
                ticket: m.ticket
            })
        )
    }

    async move(destination) {

        await this.loadMap()

        const validMoves = await this.getValidMoves()

        const valid = validMoves.find(
            m => m.location === destination
        )

        if (!valid) {
            throw new Error("Invalid move")
        }

        const result = await movePlayer(
            this.playerId,
            destination
        )

        await this.updateState()

        return result
    }

    isGameOver() {
        if (!this.state) return false

        return this.state.status === "finished"
    }

    getWinner() {

        if (!this.state) return null

        return this.state.winner
    }
}

async function run() {

    console.log("Creating game instance...")
    const game = new ScotlandYardGame(1, 1);
    console.log("Running Initialization...")
    await game.init();
    console.log("Initialization complete.")
}

run().catch(err => console.error(err));