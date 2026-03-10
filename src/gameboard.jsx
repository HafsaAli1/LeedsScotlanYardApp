import React, {useEffect,useState} from "react"
import {getMap,getGame,movePlayer} from "./APIHelper"
import { getValidMoves,nextTurn} from "./gamelogic"
import {isRevealRound} from "./gamejs"
import MoveMenu from "./gamemenu"

export default function GameBoard({game,player}) {
    const [map,setMap] = useState(null)
    const [state, setState] = useState(null)
    const [round,setRound] = useState(1)
    const [turn,setTurn] = useState(0)

    useEffect(()=>{
        getMap(102).then(setMap)

        const poll = setInterval(()=>{
            getGame(game.id).then(setState)
        },2000)

        return ()=>clearInterval(poll)
    },[game])

    if(!map || !state) return <div>Loading...</div>

    const currentPlayer = state.players[turn]

    function handleMove(move) {
        movePlayer(player.id,move.B)

        setTurn(nextTurn(state.players,turn))

        if(turn === state.players.length-1) {
            setRound(r=>r+1)
        }

        const validMoves = getValidMoves(
            currentPlayer.location,
            map.connections,
            currentPlayer.tickets
        )

        return(
            <div>
                <h2>Round {round}</h2>

                {isRevealRound(round) && <h3>Mr X Revealed</h3>}

                <div style={{position: "relative"}}>
                    <img src={`/maps/${map.image}` }
                    width={map.width}
                    height={map.height}
                    />

                    {map.locations.map(loc =>(
                        <div
                        key={loc.number}
                        style={{
                            position: "absolute",
                            left:loc.xPos,
                            top:loc.yPos,
                            width:12,
                            height:12,
                            background:"white",
                            borderRadius:"50%"
                        }}
                        />
                    ))}

                    {state.players.map(p =>{
                        if(p.role === "MRX" && !isRevealRound(round))
                            return null
                        return(
                            <div
                            key={p.id}
                            style={{
                                position:"absolute",
                                left:p.xPos,
                                top:p.yPos,
                                width:16,
                                height:16,
                                background:p.role==="MRX"?"black":"blue",
                                borderRadius:"50%"
                            }}
                            />
                        )
                    })}
                </div>

                <MoveMenu
                moves={validMoves}
                onMove={handleMove}
                />
            </div>
        )
    }
}