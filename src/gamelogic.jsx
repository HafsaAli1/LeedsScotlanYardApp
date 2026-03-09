import { tickets } from "./playertickets";

export function getValidMoves(location, connections, tickets) {
    const possible = connections.filter(c => c.A === location)

    return possible.filter(move => {
        return tickets[move.Ticket] > 0
    })
}

export function useTicket(player, ticket) {
    if(player.tickets[ticket] <= 0) {
        throw new Error("No", tickets[ticket], "tickets left")
    }

    player.tickets[ticket] -= 1
}

export function nextTurn(players, currentIndex) {
    return (currentIndex + 1) % players.length
}

export function detectivesWin(players, mrXlocation) {
    return players
        .filter(p => p.role === "Detective")
        .some(p => p.location === mrXlocation)
}

export function mrXWin(round) {
    return round >= 24
}