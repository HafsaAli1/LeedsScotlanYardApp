import { ScotlandYardGame } from "./gamelogic.js";

async function run() {
    const game = new ScotlandYardGame();
    await game.init();
}

await run();