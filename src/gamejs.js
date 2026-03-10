export const Tickets = {
    Taxi: "Taxi",
    Bus: "Bus",
    Train: "Train",
    Black: "Black",
    Double: "Double",
}

export function DetectiveTickets() {
    return {
        Taxi: 10,
        Bus: 8,
        Train: 4
    }
}

export function MrXTickets() {
    return {
        Taxi: 10,
        Bus: 8,
        Train: 4,
        Black: 2,
        Double: 2
    }
}

export function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5)
}

export function AssignRoles(players) {
    const shuffled = shuffle(players)

    return shuffled.map((p, i) => ({
        ...p,
        role: i === 0 ? "MrX" : "Detective",
        tickets: i === 0 ? MrXTickets() : DetectiveTickets()
    }))
}

export function GenerateStartLocations(players, startLocations, connections) {
    const used = []
    const result = {}

    const shuffled = shuffle(startLocations)

    players.forEach(player => {
        for (let loc of shuffled) {
            if (used.includes(loc)) continue

            const connected = connections
                .filter(c => c.A === loc || c.B === loc)
                .map(c => c.A === loc ? c.B : c.A)
            
                const conflict = used.some(u => connected.includes(u))

                if (!conflict) {
                    result[player.id] = loc
                    used.push(loc)
                    break
                }
        }
    })

    return result
}