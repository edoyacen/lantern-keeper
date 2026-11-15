// Draws the world to the canvas. Reads state only, never changes the rules.
import { BEACON, FIELD, FLARE, PLAYER, WAVES, WISP_KINDS } from './config.js';
import { PHASE_OVER, PHASE_PLAY, PHASE_TITLE, PHASE_WON } from './world.js';
import { drawHud } from './hud.js';
import { drawOverlay } from './overlay.js';

const STARS = Array.from({ length: 70 }, (_, i) => ({
  x: (Math.sin(i * 91.7) * 0.5 + 0.5) * FIELD.width,
  y: (Math.sin(i * 47.3 + 2) * 0.5 + 0.5) * FIELD.height,
  r: 0.6 + ((i * 7) % 5) * 0.3,
}));
const TUFTS = Array.from({ length: 46 }, (_, i) => ({
  x: (Math.sin(i * 12.9) * 0.5 + 0.5) * FIELD.width,
  y: (Math.sin(i * 78.2 + 1) * 0.5 + 0.5) * FIELD.height,
  h: 6 + (i % 4) * 2,
}));

function glow(ctx, x, y, radius, color, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, color.replace('A', alpha));
  g.addColorStop(1, color.replace('A', 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawGround(ctx, world) {
  const sky = ctx.createLinearGradient(0, 0, 0, FIELD.height);
  sky.addColorStop(0, '#0a0c1f');
  sky.addColorStop(1, '#141a33');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  ctx.fillStyle = 'rgba(200,210,255,0.55)';
  for (const star of STARS) {
    ctx.globalAlpha = 0.4 + 0.4 * Math.sin(world.time * 1.5 + star.x);
    ctx.fillRect(star.x, star.y, star.r, star.r);
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(70,110,110,0.55)';
  ctx.lineWidth = 1.5;
  for (const tuft of TUFTS) {
    ctx.beginPath();
    ctx.moveTo(tuft.x - 3, tuft.y);
    ctx.lineTo(tuft.x - 1, tuft.y - tuft.h);
    ctx.moveTo(tuft.x + 3, tuft.y);
    ctx.lineTo(tuft.x + 1, tuft.y - tuft.h * 0.8);
    ctx.stroke();
  }
}

function drawBeacon(ctx, world) {
  const life = world.beacon.health / BEACON.maxHealth;
  ctx.globalCompositeOperation = 'lighter';
  glow(ctx, BEACON.x, BEACON.y, 120 + life * 190, 'rgba(255,190,90,A)', 0.18 + life * 0.3);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#3a3150';
  ctx.fillRect(BEACON.x - 14, BEACON.y + 6, 28, 22);
  ctx.fillStyle = world.beacon.flash > 0 ? '#ff6a5c' : `rgba(255,${170 + life * 60},${90 + life * 60},1)`;
  ctx.beginPath();
  ctx.arc(BEACON.x, BEACON.y - 4, BEACON.radius * (0.55 + life * 0.35), 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d9c6ff';
  ctx.lineWidth = 3;
  ctx.strokeRect(BEACON.x - 16, BEACON.y - 24, 32, 32);
}

function drawWisps(ctx, world) {
  for (const wisp of world.wisps) {
    const spec = WISP_KINDS[wisp.kind];
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, wisp.x, wisp.y, spec.radius * 2.6, `hsla(${spec.hue},90%,60%,A)`, 0.45);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = wisp.flash > 0 ? '#ffffff' : `hsl(${spec.hue},70%,${wisp.kind === 'brute' ? 38 : 55}%)`;
    ctx.beginPath();
    ctx.arc(wisp.x, wisp.y, spec.radius * (1 + Math.sin(world.time * 8 + wisp.phase) * 0.06), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#071018';
    ctx.fillRect(wisp.x - spec.radius * 0.5, wisp.y - spec.radius * 0.2, spec.radius * 0.3, spec.radius * 0.3);
    ctx.fillRect(wisp.x + spec.radius * 0.2, wisp.y - spec.radius * 0.2, spec.radius * 0.3, spec.radius * 0.3);
    if (spec.health > 1) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(wisp.x - 16, wisp.y - spec.radius - 9, 32, 4);
      ctx.fillStyle = '#9ff5d6';
      ctx.fillRect(wisp.x - 16, wisp.y - spec.radius - 9, 32 * Math.max(0, wisp.health / spec.health), 4);
    }
  }
}

function drawPlayer(ctx, world) {
  const p = world.player;
  const angle = Math.atan2(p.aimY - p.y, p.aimX - p.x);
  ctx.globalCompositeOperation = 'lighter';
  glow(ctx, p.x, p.y, 90, 'rgba(255,214,140,A)', 0.28);
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = 'rgba(255,225,160,0.22)';
  ctx.setLineDash([4, 8]);
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + Math.cos(angle) * 140, p.y + Math.sin(angle) * 140);
  ctx.stroke();
  ctx.setLineDash([]);
  if (p.invulnerable > 0 && Math.floor(world.time * 14) % 2 === 0) ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#ffd98a';
  ctx.beginPath();
  ctx.arc(p.x, p.y, PLAYER.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a2b14';
  ctx.beginPath();
  ctx.arc(p.x + Math.cos(angle) * 6, p.y + Math.sin(angle) * 6, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawEffects(ctx, world) {
  ctx.globalCompositeOperation = 'lighter';
  for (const bullet of world.bullets) {
    ctx.strokeStyle = 'rgba(255,220,130,0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bullet.x, bullet.y);
    ctx.lineTo(bullet.x - bullet.vx * 0.03, bullet.y - bullet.vy * 0.03);
    ctx.stroke();
  }
  for (const shard of world.shards) {
    glow(ctx, shard.x, shard.y, 16, 'rgba(255,240,170,A)', 0.8);
  }
  for (const particle of world.particles) {
    ctx.globalAlpha = 1 - particle.age / particle.life;
    ctx.fillStyle = `hsl(${particle.hue},90%,65%)`;
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
  }
  ctx.globalAlpha = 1;
  for (const ring of world.rings) {
    const t = ring.age / ring.life;
    ctx.strokeStyle = `rgba(255,230,170,${1 - t})`;
    ctx.lineWidth = 6 * (1 - t) + 1;
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.radius * t, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
}

export function render(ctx, world, uiState) {
  ctx.save();
  if (world.shake > 0) ctx.translate((Math.random() - 0.5) * world.shake * 14, (Math.random() - 0.5) * world.shake * 14);
  drawGround(ctx, world);
  drawBeacon(ctx, world);
  drawEffects(ctx, world);
  drawWisps(ctx, world);
  if (world.phase !== PHASE_TITLE) drawPlayer(ctx, world);
  ctx.restore();
  if (world.phase === PHASE_PLAY || world.phase === PHASE_OVER || world.phase === PHASE_WON) drawHud(ctx, world, WAVES.length, FLARE.cooldownSeconds);
  drawOverlay(ctx, world, uiState);
}
