// The heads-up display: beacon light, hearts, wave, score and the flare cooldown.
import { BEACON, FIELD, PLAYER } from './config.js';

export function drawHud(ctx, world, waveCount, flareCooldownSeconds) {
  ctx.font = '600 15px system-ui, sans-serif';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = 'rgba(8,10,24,0.65)';
  ctx.fillRect(16, 14, 260, 46);
  ctx.fillStyle = '#c9c2e8';
  ctx.fillText('BEACON LIGHT', 28, 28);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(28, 40, 236, 10);
  const life = world.beacon.health / BEACON.maxHealth;
  ctx.fillStyle = life > 0.35 ? '#ffc766' : '#ff6a5c';
  ctx.fillRect(28, 40, 236 * life, 10);

  for (let i = 0; i < PLAYER.hearts; i += 1) {
    ctx.fillStyle = i < world.player.hearts ? '#ff8f7a' : 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.arc(300 + i * 22, 36, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#e9e6ff';
  ctx.font = '700 18px system-ui, sans-serif';
  ctx.fillText(`NIGHT ${Math.max(1, world.wave)} OF ${waveCount}`, FIELD.width / 2, 28);
  ctx.textAlign = 'right';
  ctx.fillText(`${world.score}`, FIELD.width - 20, 28);
  ctx.font = '600 12px system-ui, sans-serif';
  ctx.fillStyle = '#9a96c0';
  ctx.fillText('SCORE', FIELD.width - 20, 46);

  const ready = world.player.flareCooldown <= 0;
  const x = FIELD.width - 56;
  const y = FIELD.height - 46;
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = ready ? '#ffe3a1' : '#8a7fc0';
  ctx.beginPath();
  ctx.arc(x, y, 20, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - world.player.flareCooldown / flareCooldownSeconds));
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = ready ? '#ffe3a1' : '#8a7fc0';
  ctx.font = '700 13px system-ui, sans-serif';
  ctx.fillText('E', x, y + 1);
  ctx.textAlign = 'left';
}
