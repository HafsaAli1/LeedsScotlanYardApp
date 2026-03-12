import readline from "readline";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const API = "http://trinity-developments.co.uk/";

const TicketNames = {
    0: "Taxi",
    1: "Bus",
    2: "Train"
};

console.log("Program started");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function APIRequest(endpoint, method = "GET", body = null) {
    const options = {
        method,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const res = await fetch(`${API}/${endpoint}`, options);

    if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
    }

    const result = await res.json();
    return result;
}

// -------------------- Map Loader --------------------

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

        if (!edges[conn.A]) edges[conn.A] = []
        if (!edges[conn.B]) edges[conn.B] = []

        edges[conn.A].push({
            to: conn.B,
            ticket: conn.Ticket
        })

        edges[conn.B].push({
            to: conn.A,
            ticket: conn.Ticket
        })
    })

    return { nodes, edges }
}

export async function loadMapfromSQL() {

    const filepath = path.resolve(__dirname, "Team1Map2 1.sql");
    const text = await fs.readFile(filepath, "utf8");

    const locations = [];
    const connections = [];

    let mode = null;

    const lines = text.split("\n");

    for (const line of lines) {

        if (line.includes("INSERT INTO `locations`")) {
            mode = "locations";
        }

        if (line.includes("INSERT INTO `connections`")) {
            mode = "connections";
        }

        const rows = line.match(/\(([^)]+)\)/g);

        if (!rows) continue;

        for (const row of rows) {

            const values = row
                .replace(/[()']/g, "")
                .split(",")
                .map(v => Number(v.trim()));

            if (mode === "locations" && values.length >= 4) {

                locations.push({
                    Number: values[1],
                    xPos: values[2],
                    yPos: values[3]
                });

            } else if (mode === "connections" && values.length >= 4) {

                connections.push({
                    A: values[1],
                    B: values[2],
                    Ticket: values[3]
                });
            }
        }
    }

    console.log("Locations parsed:", locations.length);
    console.log("Connections parsed:", connections.length);

    return buildMap(locations, connections);
}

// -------------------- Game Class --------------------

export class ScotlandYardGame {
    constructor(gameId, playerId) {
        this.gameId = gameId;
        this.playerId = playerId;

        this.state = { status: "running", turn: 1, winner: null, players: [] };
        this.map = null;
        this.players = {};
        this.playerCount = 5;
    }

    async updateGameState() {
        try {
            const response = await APIRequest("updateGame", "POST", {
                gameId: this.gameId,
                players: this.players,
                turn: this.state.turn,
                status: this.state.status,
                winner: this.state.winner
            });

            console.log("Game state updated:", response);
        } catch (error) {
            console.error("Failed to update game state:", err.message);
        }
    }

    async fetchGameState() {
        try {
            const data = await APIRequest(`getGameState?gameId=${this.gameId}`);
            console.log("Received game state:", data);
            return data;
        } catch (error) {
            console.error("Failed to fetch game state:", err.message);
        }
    }
    
    async loadPlayersFromAPI() {
    try {
        const gameData = await APIRequest(`games/${this.gameId}`);
        if (!gameData.players || !gameData.players.length) {
            console.warn("No players returned from API, will randomize locally");
            this.randomisePlayers();
            return;
        }

        gameData.players.forEach(p => {
            this.players[p.id] = {
                id: p.id,
                location: p.location,
                role: p.role ?? "Detective"
            };
        });

        console.log("Players loaded from API");
    } catch (err) {
        console.error("Failed to fetch players:", err.message);
        console.log("Randomizing players locally...");
        this.randomisePlayers();
    }
}


    AssignMrX() {
        const ids = Object.keys(this.players);
        const mrXId = ids[Math.floor(Math.random() * ids.length)];
        this.players[mrXId].role = "Mr X";

        // Ensure Mr X starts on a valid node
        if ((this.map.edges[this.players[mrXId].location] || []).length === 0) {
            const connectedNodes = Object.keys(this.map.edges).filter(n => this.map.edges[n].length > 0);
            this.players[mrXId].location = Number(connectedNodes[Math.floor(Math.random() * connectedNodes.length)]);
        }
    }

    async sendMove(player, location, ticket) {
        try {
            await APIRequest(`players/${player.id}/moves`, "POST", {
                location,
                ticket
            });
            console.log(`Player ${player.id} moved to ${location} using ${TicketNames[ticket] ?? `Ticket ${ticket}`}`);
        } catch (err) {
            console.error("Failed to send move:", err.message);
        }
            
        }
    

    async loadMap() {
        if (!this.map) this.map = await loadMapfromSQL();
        return this.map;
    }

    randomisePlayers() {

    const nodeIds = Object.keys(this.map.edges)
    .filter(n => this.map.edges[n].length > 0)
    .map(Number)
    const usedNodes = new Set()

    while (Object.keys(this.players).length < this.playerCount) {

        const randomNode = nodeIds[Math.floor(Math.random() * nodeIds.length)]

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

    async init() {
        console.log("Loading map...");
        this.map = await loadMapfromSQL();
        console.log("Map Loaded. Node count:", Object.keys(this.map.nodes).length);
        console.log("Total nodes:", Object.keys(this.map.nodes).length)
console.log("Total edges:", Object.keys(this.map.edges).length)

        await this.loadPlayersFromAPI();
        console.log("Players randomised");

        this.AssignMrX();
        console.log("\nGenerated Players:");
        console.table(this.players);

        await this.printPlayerInfo();
    }

    async printPlayerInfo() {
        console.log("\n--- Player Locations ---\n");
        for (const player of Object.values(this.players)) {
            const moves = await this.getValidMovesForLocation(player.location);
            console.log(`Player ${player.id} (${player.role}) is at location ${player.location}`);
            const moveLocations = moves.length ? moves.map(m => m.location).join(", ") : "No moves";
            console.log(`Possible moves: ${moveLocations}`);
            console.log("-----------------------");
        }
    }

    async getValidMovesForLocation(location) {
        await this.loadMap();
        const moves = this.map.edges[location] || [];
        const unique = new Map()

        for (const m of moves) {
            const key = `${m.to}-${m.ticket}`
            unique.set(key, { location: m.to, ticket: m.ticket })
        }

        return [...unique.values()]
    }

    isGameOver() {
        return this.state.status === "finished";
    }

    CheckWinCondition() {
        const mrX = Object.values(this.players).find(p => p.role === "Mr X");
        const detectives = Object.values(this.players).filter(p => p.role === "Detective");

        for (const d of detectives) {
            if (d.location === mrX.location) {
                this.state.status = "finished";
                this.state.winner = "Detectives";
            }
        }
    }

    getWinner() {
        return this.state.winner;
    }
}

// -------------------- User Input --------------------

function UserInput(query) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
        rl.question(query, ans => { rl.close(); resolve(ans); });
    });
}

// -------------------- Game Loop --------------------

async function GamePlay(game) {
    console.log("\n--- Game Started ---\n");

    const playerIds = Object.keys(game.players).map(Number);
    let turnIndex = 0;

    while (!game.isGameOver()) {
        const playerId = playerIds[turnIndex];
        const player = game.players[playerId];

        console.log(`\nPlayer ${player.id} (${player.role})'s turn. Current location: ${player.location}`);
        const validMoves = await game.getValidMovesForLocation(player.location);

        if (!validMoves.length) {
            console.log("No valid moves. Skipping turn.");
        } else if (player.role === "Mr X") {
            // Mr X moves automatically
            const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            player.location = randomMove.location;
            console.log(`Mr X moves to ${player.location}`);
            game.CheckWinCondition();
        } else {
            // Detective: choose move
            console.log("Valid moves:");
            validMoves.forEach((m, i) => console.log(`${i + 1}: Move to ${m.location} using ${TicketNames[m.ticket] ?? `Ticket ${m.ticket}`}`));

            let choice;
            while (true) {
                choice = Number(await UserInput(`Choose a move (1-${validMoves.length}): `));
                if (choice >= 1 && choice <= validMoves.length) break;
                console.log("Invalid choice, try again.");
            }

            player.location = validMoves[choice - 1].location;
            console.log(`Player ${player.id} moved to ${player.location}`);
            game.CheckWinCondition();

            await game.sendMove(player, player.location, validMoves[choice - 1].ticket);
            await game.updateGameState();
        }

        turnIndex = (turnIndex + 1) % playerIds.length;
    }

    console.log("\n--- Game Over ---");
    console.log("Winner:", game.getWinner());
}

// -------------------- Run Game --------------------

async function run() {
    console.log("Creating game on API...");

    // 1️⃣ Create the game (empty payload)
    const newGame = await APIRequest("games", "POST", {});
    const gameId = newGame.id;
    console.log("Game created with ID:", gameId);

    // 2️⃣ Join all players
    for (let i = 1; i <= 5; i++) {
        await APIRequest(`games/${gameId}/players`, "POST", { playerId: i });
        console.log(`Player ${i} joined the game.`);
    }

    // 3️⃣ Start the game
    await APIRequest(`games/${gameId}/start/1`, "PATCH");
    console.log("Game started");

    // 4️⃣ Create local game instance
    const game = new ScotlandYardGame(gameId, 1);

    // 5️⃣ Initialize local game (loads map and players from API)
    await game.init();

    // 6️⃣ Run the game loop
    await GamePlay(game);
}

run().catch(err => console.error(err));