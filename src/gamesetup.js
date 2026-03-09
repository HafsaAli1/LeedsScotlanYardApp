const min_players = 3
const max_players = 6

// Assign each player a randomised role
export function roleAssignment(players) {
    const shuffled = [...players].sort(()=>Math.random()-0.5)

    return shuffled.map((p,i)=>({
        ...p,
        role: i === 0 ? "MRX" : "Detective"
    }))
}

function getConnectedLocations(node, connections) {
    return connections
        .filter(c => c.A === node || c.B === node)
        .map(c => c.A === node ? c.B : c.A)
}

export function generateStartLocations(players, startLocations, connections) {
    const used = []
    const result = {}

    const shuffled = [...startLocations].sort(()=>Math.random()-0.5)

    players.forEach(player=> {
        for(let loc of shuffled) {
            if(used.includes(loc)) continue

            const connected = getConnectedLocations(loc, connections)

            const conflict = used.some(u => connected.includes(u))

            if(!conflict) {
                result[player.id] = loc
                used.push(loc)
                break
            }
        }
    })

    return result
}

function validateStarts(players,connections) {
    for(let p of players) {
        for(let other of players) {
            if(p.id===other.id) continue

            const connected = getConnectedLocations(p.location,connections)

            if(connected.includes(other.location))
                return false
        }
    }

    return true
}