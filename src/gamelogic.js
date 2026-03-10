import { movePlayer, getGame } from "./APIHelper";

export class ScotlandYardGame {

    constructor(gameId, playerId) {

        this.gameId = gameId
        this.playerId = playerId
        this.state = null
    }

    
    async updateState() {

        this.state = await getGame(this.gameId)

        return this.state
    }

    getPlayers() {
        
        if(!this.state) return null

        return this.state.players[this.state.turn]
    }

    async move(destination) {
        if(!this.state)
            await this.updateState()

        const result = await movePlayer(
            this.playerId,
            destination
        )

        await this.updateState()

        return result
    }

    isGameOver() {
        if(!this.state) return false

        return this.state.status === "finished"
    }

    getWinner() {

        if(!this.state) return null

        return this.state.winner
    }
}