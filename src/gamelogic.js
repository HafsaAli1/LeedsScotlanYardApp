import { movePlayer, getGame } from "./APIHelper.js";
import { loadMapfromSQL } from "./dataloader.js";

export class ScotlandYardGame {

    constructor(gameId, playerId) {

        this.gameId = gameId
        this.playerId = playerId

        this.state = null
        this.map = null
    }

    async loadMap() {
        
        if (!this.map) {
            this.map = await loadMapfromSQL()
        }

        return this.map
    }

    async init() {
        this.map = await loadMapfromSQL()

        this.randomisePlayers()

        this.printPlayerInfo
    }

    printPlayerInfo() {

        console.log("\n--- Player Locations ---\n")

        this.players.forEach(player => {

            const moves = this.getValidMoves(player.lcoation)

            console.log(
                `Player ${player.id} (${player.role}) is at location ${player.location}`
            )

            console.log(
                `Possible moves: ${moves.join(", ")}`
            )

            console.log("-----------------------")
        })
    }

    randomisePlayers() {
        const nodeIds = Object.keys(this.map.nodes).map(Number)
        const usedNodes = new Set()

        while (this.players.length < this.playerCount) {

            const randomNode =
                nodeIds[Math.random() * nodeIds.length]

            if (usedNodes.has(randomNode)) continue

            const adjacent =
                this.map.edges[randomNode]?.map(e => e.to) || []
            
            const conflict = this.players.some(
                p => adjacent.includes(p.location)
            )
            
            if (conflict) continue

            const player = {
                id: this.players.length + 1,
                location: randomNode,
                role: "Detective"
            }

            this.players.push(player)
            usedNodes.add(randomNode)
        }
    }

    AssignMrX() {

        const index =
            Math.floor(Math.random() * this.players.length)

        this.players[index].role = "Mr X"
    }

    async updateState() {

        this.state = await getGame(this.gameId)

        return this.state
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