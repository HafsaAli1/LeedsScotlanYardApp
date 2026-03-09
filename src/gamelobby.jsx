import React, { useState, useEffect } from "react";
import { getOpenGames, createGame, joinGame, startGame } from "./APIHelper";

const min_players = 3

export default function Lobby({ setGame, setPlayer }) {
    const [games, setGames] = useState([]);
    const [name, setName] = useState("");
    const [game,setLocalGame] = useState(null)

    useEffect(() => {
        getOpenGames().then(setGames);
    }, []);

    async function handleCreate() {
        const game = await createGame(102);
        const player = await joinGame(game.id, name);

        setGame(game);
        setPlayer(player);
    }

    async function handleJoin(id) {
        const player = await joinGame(id, name);
        
        setGame({ id });
        setPlayer(player);
    }

    async function handleStart() {
        if(player_tickets.length < min_players) {
            alert("At least 3 players needed to start")
            return
        }
        await startGame(game.id,players[0].id)

    setGame(game)
    }

    return (
        <div>
            <h1>Scotland Yard</h1>

            <input
            placeholder="Player name"
            value={name}
            onChange={(e) => setName(e.target.value)} 
            />

            <button onClick={handleCreate}>
                Create Game
            </button>

            <h2>Open Games</h2>

            {games.map(g => (
                <div key={g.id}>
                    Game {g.id}
                    <button onClick={() => handleJoin(g.id)}>
                        Join
                    </button>
                </div>
            ))}
        </div>
    );
}