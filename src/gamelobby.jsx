import React, { useState, useEffect } from "react";
import { getOpenGames, createGame, joinGame } from "./APIHelper";

export default function Lobby({ setGame, setPlayer }) {
    const [games, setGames] = useState([]);
    const [name, setName] = useState("");

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