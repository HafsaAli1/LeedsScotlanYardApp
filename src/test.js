import { ScotlandYardGame } from "../gamelogic";

async function run() {
    const game = new ScotlandYardGame();
    await game.init();
}

run();