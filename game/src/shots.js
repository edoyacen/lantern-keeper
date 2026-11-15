// Deterministic screenshot scenes (?shot=start|play|end&seed=N): the real rules played forward by a
// simple autopilot that aims at the nearest wisp, so each frame is what a short game truly looks like.
import { BEACON } from './config.js';
import { startRun, step } from './world.js';

const STEP_SECONDS = 1 / 60;

function nearest(world, from) {
  let best = null;
  let bestDistance = Infinity;
  for (const wisp of world.wisps) {
    const d = Math.hypot(wisp.x - from.x, wisp.y - from.y);
    if (d < bestDistance) { best = wisp; bestDistance = d; }
  }
  return best;
}

function autopilot(world, skilled) {
  const target = nearest(world, BEACON);
  const aim = target ?? { x: BEACON.x, y: BEACON.y - 80 };
  const toward = (a, b) => { const dx = b.x - a.x; const dy = b.y - a.y; const l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
  const home = { x: BEACON.x + (target ? (target.x - BEACON.x) * 0.45 : 0), y: BEACON.y + (target ? (target.y - BEACON.y) * 0.45 : 40) };
  const [mx, my] = toward(world.player, home);
  const near = Math.hypot(home.x - world.player.x, home.y - world.player.y) < 18;
  return {
    moveX: near ? 0 : mx, moveY: near ? 0 : my,
    aimX: aim.x, aimY: aim.y,
    fire: skilled ? target !== null : Math.floor(world.time * 2) % 3 === 0 && target !== null,
    flare: skilled && world.wisps.filter((w) => Math.hypot(w.x - world.player.x, w.y - world.player.y) < 140).length >= 3,
  };
}

function play(world, seconds, skilled) {
  for (let i = 0; i < Math.round(seconds / STEP_SECONDS); i += 1) {
    step(world, autopilot(world, skilled), STEP_SECONDS);
    world.events.length = 0;
    if (world.phase !== 'play') break;
  }
}

export function runShotScene(world, scene) {
  if (scene === 'start') return;
  startRun(world);
  if (scene === 'play') { play(world, 31, true); return; }
  if (scene === 'end') {
    world.wave = 3;
    world.score = 840;
    world.kills = 52;
    play(world, 600, false);
  }
}
