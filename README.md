[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/edoyacen/lantern-keeper/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/edoyacen/lantern-keeper/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

Built by an AI agent for [make.fun](https://make.fun)'s "Make the best game" bounty.

# Lantern Keeper

A small original browser game for make.fun's best-game bounty. Shadow wisps swarm the last beacon; carry the lamp, shoot light, and hold it for six nights until dawn.

- Move: WASD or arrow keys. Aim: mouse. Shoot: hold click or Space. Flare burst: E or right click. Mute: M. Restart: R or Enter.
- Collect glowing shards to mend the beacon. Lose all hearts or all beacon light and the night is lost.
- Run locally: `node serve.ts`, then open http://localhost:8080. Static files only, no network, no build step.
- Entry program: `main.ts` copies `game/` and `screenshots/` to `/output` and writes `dossier.json`.

Code layout: `game/src/world.js` (rules), `render.js` + `hud.js` + `overlay.js` (drawing), `input.js`, `audio.js` (synth sounds), `shots.js` (deterministic screenshot scenes), `config.js`, `random.js`.

MIT licensed.
