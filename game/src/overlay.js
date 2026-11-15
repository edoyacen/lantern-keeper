// Full-screen cards: title, wave banner, game over and dawn.
import { FIELD } from './config.js';
import { PHASE_OVER, PHASE_PLAY, PHASE_TITLE, PHASE_WON } from './world.js';

function card(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(6,7,18,0.72)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = accent;
  ctx.font = '800 58px Georgia, serif';
  ctx.fillText(title, FIELD.width / 2, 190);
  ctx.fillStyle = '#e3e0fa';
  lines.forEach((line, i) => {
    ctx.font = i === lines.length - 1 ? '700 20px system-ui, sans-serif' : '500 18px system-ui, sans-serif';
    ctx.fillStyle = i === lines.length - 1 ? accent : '#e3e0fa';
    ctx.fillText(line, FIELD.width / 2, 275 + i * 34);
  });
  ctx.textAlign = 'left';
}

export function drawOverlay(ctx, world, ui) {
  if (world.phase === PHASE_TITLE) {
    card(ctx, 'Lantern Keeper', [
      'Shadow wisps swarm the last beacon. Hold it until dawn.',
      'WASD or arrows move  |  Mouse aims  |  Hold click or Space to shoot light',
      'E or right click: flare burst  |  Collect glowing shards to mend the beacon',
      'Click or press Enter to light the night',
    ], '#ffc766');
  } else if (world.phase === PHASE_OVER) {
    card(ctx, 'The light went out', [
      `Night ${world.wave}  |  Wisps banished ${world.kills}  |  Score ${world.score}`,
      'Press R, Enter or click to try again',
    ], '#ff8f7a');
  } else if (world.phase === PHASE_WON) {
    card(ctx, 'Dawn breaks', [
      `Every night survived  |  Wisps banished ${world.kills}  |  Score ${world.score}`,
      'Press R, Enter or click to keep the light again',
    ], '#9ff5d6');
  } else if (world.phase === PHASE_PLAY && world.intermission > 0 && world.queue.length === 0 && world.wisps.length === 0) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f2eeff';
    ctx.font = '800 40px Georgia, serif';
    ctx.fillText(`Night ${world.wave + 1} approaches`, FIELD.width / 2, 120);
    ctx.textAlign = 'left';
  }
  if (ui.muted) {
    ctx.fillStyle = '#9a96c0';
    ctx.font = '600 12px system-ui, sans-serif';
    ctx.fillText('MUTED (M)', 16, FIELD.height - 14);
  }
}
