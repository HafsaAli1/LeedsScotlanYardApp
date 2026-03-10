import fs from "fs/promises";
import path from "path";

function buildMap(locations, connections) {

    const nodes = {}
    const edges = {}

    locations.forEach(loc => {

        nodes[loc.Number] = {
            id: loc.Number,
            x: loc.xPos,
            y: loc.yPos
        }

        edges[loc.Number]
    })

    connections.forEach(conn => {

        edges[conn.A].push({
            to: conn.B.Ticket
        })
    })

    return {nodes, edges}
}

export async function loadMapfromSQL() {
    
    const filepath = path.resolve("./Team1Map2 1.sql");
    const text = await fs.readFile(filepath, "utf8");

    const locations = []
    const connections = []

    const locationRegex =
        /INSERT INTO locations VALUES \((\d+),\s*(\d+),\s*(\d+)\)/g

    const connectionRegex =
        /INSERT INTO connections VALUES \((\d+),\s*(\d+),\s*(\d+)\)/g
    
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