import React from "react"

export default function MoveMenu({moves,onMove}) {
    return(
        <div>
            <h3>Available Moves</h3>
            {
                moves.map((m,i)=>(
                    <button key={i} 
                    onClick={()=>onMove(m)}
                    >
                        Move to {m.B} (ticket {m.Ticket})
                    </button>
                ))
            }
        </div>
    )
}

export default function PlayerMenu({player}) {
    return(
        <div>
            <h3>{player.name}</h3>

            <p>Taxi: {player.tickets[0]}</p>
            <p>Bus: {player.tickets[1]}</p>
            <p>Train: {player.tickets[2]}</p>
            <p>Black: {player.tickets[3]}</p>
            <p>Double: {player.tickets[4]}</p>
        </div>
    )
}