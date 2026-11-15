# Lantern Keeper

A small original browser game for make.fun's best-game bounty. Shadow wisps swarm the last beacon; carry the lamp, shoot light, and hold it for six nights until dawn.

- Move: WASD or arrow keys. Aim: mouse. Shoot: hold click or Space. Flare burst: E or right click. Mute: M. Restart: R or Enter.
- Collect glowing shards to mend the beacon. Lose all hearts or all beacon light and the night is lost.
- Run locally: `node serve.ts`, then open http://localhost:8080. Static files only, no network, no build step.
- Entry program: `main.ts` copies `game/` and `screenshots/` to `/output` and writes `dossier.json`.

Code layout: `game/src/world.js` (rules), `render.js` + `hud.js` + `overlay.js` (drawing), `input.js`, `audio.js` (synth sounds), `shots.js` (deterministic screenshot scenes), `config.js`, `random.js`.

MIT licensed.
