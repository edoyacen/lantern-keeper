// Wires the canvas, input, fixed-step loop, sounds and the screenshot scenes together.
import { FIELD, STEP } from './config.js';
import { createInput } from './input.js';
import { playSound, toggleMute } from './audio.js';
import { render } from './render.js';
import { runShotScene } from './shots.js';
import { PHASE_PLAY, createWorld, startRun, step } from './world.js';

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const ctx = canvas.getContext('2d');
canvas.width = FIELD.width;
canvas.height = FIELD.height;

const params = new URLSearchParams(location.search);
const world = createWorld(Number(params.get('seed')) || (Date.now() & 0xffff));
const ui = { muted: false };

function confirm() {
  if (world.phase !== PHASE_PLAY) startRun(world);
}
const input = createInput(canvas, { onConfirm: confirm, onMute: () => { ui.muted = toggleMute(); } });

function announce(event) {
  const messages = { wave: `Night ${world.wave} begins`, over: 'The light went out', win: 'Dawn breaks, you win' };
  if (messages[event]) status.textContent = messages[event];
}

if (params.has('shot')) {
  runShotScene(world, params.get('shot'));
  render(ctx, world, ui);
  document.title = `shot:${params.get('shot')}`;
} else {
  let last = performance.now();
  let accumulator = 0;
  const frame = (now) => {
    accumulator += Math.min(0.1, (now - last) / 1000);
    last = now;
    while (accumulator >= STEP) {
      step(world, input.poll(), STEP);
      accumulator -= STEP;
    }
    for (const event of world.events) { playSound(event); announce(event); }
    world.events.length = 0;
    render(ctx, world, ui);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
