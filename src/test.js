import { ScotlandYardGame } from "../src/gamelogic.js";

async function run() {
    const game = new ScotlandYardGame();
    await game.init();
}

run();