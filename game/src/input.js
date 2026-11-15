// Keyboard and mouse state, read once per step by the world.
import { FIELD } from './config.js';

const MOVE_KEYS = {
  KeyW: [0, -1], ArrowUp: [0, -1],
  KeyS: [0, 1], ArrowDown: [0, 1],
  KeyA: [-1, 0], ArrowLeft: [-1, 0],
  KeyD: [1, 0], ArrowRight: [1, 0],
};

export function createInput(canvas, handlers) {
  const held = new Set();
  const state = { moveX: 0, moveY: 0, aimX: FIELD.width / 2, aimY: FIELD.height / 3, fire: false, flare: false };

  const toField = (event) => {
    const box = canvas.getBoundingClientRect();
    state.aimX = ((event.clientX - box.left) / box.width) * FIELD.width;
    state.aimY = ((event.clientY - box.top) / box.height) * FIELD.height;
  };

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    held.add(event.code);
    if (event.code in MOVE_KEYS || event.code === 'Space') event.preventDefault();
    if (event.code === 'Space') state.fire = true;
    if (event.code === 'KeyE' || event.code === 'ShiftLeft') state.flare = true;
    if (event.code === 'KeyR' || event.code === 'Enter') handlers.onConfirm();
    if (event.code === 'KeyM') handlers.onMute();
  });
  window.addEventListener('keyup', (event) => {
    held.delete(event.code);
    if (event.code === 'Space') state.fire = false;
    if (event.code === 'KeyE' || event.code === 'ShiftLeft') state.flare = false;
  });
  window.addEventListener('blur', () => { held.clear(); state.fire = false; state.flare = false; });
  canvas.addEventListener('mousemove', toField);
  canvas.addEventListener('mousedown', (event) => {
    toField(event);
    if (event.button === 2) state.flare = true;
    else { state.fire = true; handlers.onConfirm(); }
  });
  window.addEventListener('mouseup', (event) => {
    if (event.button === 2) state.flare = false;
    else state.fire = false;
  });
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());

  return {
    state,
    /** Folds the held movement keys into a unit-length move vector. */
    poll() {
      let x = 0;
      let y = 0;
      for (const code of held) {
        const dir = MOVE_KEYS[code];
        if (dir) { x += dir[0]; y += dir[1]; }
      }
      const length = Math.hypot(x, y) || 1;
      state.moveX = x / length;
      state.moveY = y / length;
      return state;
    },
  };
}
