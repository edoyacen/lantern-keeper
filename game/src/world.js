// The rules of Lantern Keeper: one fixed step advances the whole night. No drawing happens here.
import { BEACON, BULLET, FIELD, FLARE, INTERMISSION_SECONDS, PLAYER, SHARD, WAVES, WISP_KINDS } from './config.js';
import { createRandom } from './random.js';

export const PHASE_TITLE = 'title';
export const PHASE_PLAY = 'play';
export const PHASE_OVER = 'over';
export const PHASE_WON = 'won';

export function createWorld(seed = 1) {
  const world = { seed, phase: PHASE_TITLE, events: [] };
  resetRun(world);
  return world;
}

/** Puts a fresh night on the table; the phase is left for the caller to set. */
export function resetRun(world) {
  world.rng = createRandom(world.seed);
  world.time = 0;
  world.player = {
    x: BEACON.x - 70, y: BEACON.y + 40, aimX: BEACON.x, aimY: BEACON.y - 100,
    hearts: PLAYER.hearts, invulnerable: 0, fireCooldown: 0, flareCooldown: 0, flareFlash: 0,
  };
  world.beacon = { health: BEACON.maxHealth, flash: 0 };
  world.bullets = [];
  world.wisps = [];
  world.shards = [];
  world.particles = [];
  world.rings = [];
  world.wave = 0;
  world.queue = [];
  world.spawnTimer = 0;
  world.intermission = 1.2;
  world.score = 0;
  world.kills = 0;
  world.shake = 0;
}

export function startRun(world) {
  resetRun(world);
  world.phase = PHASE_PLAY;
}

function emit(world, name) { world.events.push(name); }

function burst(world, x, y, hue, count, speed) {
  for (let i = 0; i < count; i += 1) {
    const angle = world.rng.range(0, Math.PI * 2);
    const velocity = world.rng.range(speed * 0.3, speed);
    world.particles.push({ x, y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity, life: world.rng.range(0.3, 0.7), age: 0, hue, size: world.rng.range(1.5, 3.5) });
  }
}

function beginWave(world) {
  const plan = WAVES[world.wave];
  world.wave += 1;
  world.queue = [];
  for (const kind of Object.keys(WISP_KINDS)) for (let i = 0; i < plan[kind]; i += 1) world.queue.push(kind);
  for (let i = world.queue.length - 1; i > 0; i -= 1) {
    const j = Math.floor(world.rng.next() * (i + 1));
    [world.queue[i], world.queue[j]] = [world.queue[j], world.queue[i]];
  }
  world.spawnTimer = 0.6;
  emit(world, 'wave');
}

function spawnWisp(world, kind) {
  const spec = WISP_KINDS[kind];
  const side = Math.floor(world.rng.next() * 4);
  const margin = 30;
  const along = world.rng.next();
  const x = side === 0 ? -margin : side === 1 ? FIELD.width + margin : along * FIELD.width;
  const y = side === 2 ? -margin : side === 3 ? FIELD.height + margin : along * FIELD.height;
  world.wisps.push({ kind, x, y, health: spec.health, flash: 0, phase: world.rng.range(0, 6.28), vx: 0, vy: 0 });
}

function movePlayer(world, input, dt) {
  const player = world.player;
  player.x = Math.min(FIELD.width - PLAYER.radius, Math.max(PLAYER.radius, player.x + input.moveX * PLAYER.speed * dt));
  player.y = Math.min(FIELD.height - PLAYER.radius, Math.max(PLAYER.radius, player.y + input.moveY * PLAYER.speed * dt));
  player.aimX = input.aimX;
  player.aimY = input.aimY;
  player.invulnerable = Math.max(0, player.invulnerable - dt);
  player.fireCooldown = Math.max(0, player.fireCooldown - dt);
  player.flareCooldown = Math.max(0, player.flareCooldown - dt);
  player.flareFlash = Math.max(0, player.flareFlash - dt);
}

function fireBullets(world, input) {
  const player = world.player;
  if (!input.fire || player.fireCooldown > 0) return;
  const angle = Math.atan2(player.aimY - player.y, player.aimX - player.x);
  world.bullets.push({ x: player.x, y: player.y, vx: Math.cos(angle) * BULLET.speed, vy: Math.sin(angle) * BULLET.speed, age: 0 });
  player.fireCooldown = PLAYER.fireInterval;
  emit(world, 'shoot');
}

function castFlare(world, input) {
  const player = world.player;
  if (!input.flare || player.flareCooldown > 0) return;
  player.flareCooldown = FLARE.cooldownSeconds;
  player.flareFlash = 0.5;
  world.rings.push({ x: player.x, y: player.y, age: 0, life: 0.55, radius: FLARE.radius });
  for (const wisp of world.wisps) {
    const dx = wisp.x - player.x;
    const dy = wisp.y - player.y;
    const distance = Math.hypot(dx, dy) || 1;
    if (distance > FLARE.radius + WISP_KINDS[wisp.kind].radius) continue;
    wisp.health -= FLARE.damage;
    wisp.flash = 0.15;
    wisp.vx += (dx / distance) * FLARE.push * 3;
    wisp.vy += (dy / distance) * FLARE.push * 3;
  }
  world.shake = 0.25;
  emit(world, 'flare');
}

function killWisp(world, wisp) {
  const spec = WISP_KINDS[wisp.kind];
  wisp.dead = true;
  world.score += spec.score;
  world.kills += 1;
  burst(world, wisp.x, wisp.y, spec.hue, wisp.kind === 'brute' ? 26 : 12, 190);
  if (world.rng.next() < SHARD.dropChance || wisp.kind === 'brute') world.shards.push({ x: wisp.x, y: wisp.y, age: 0 });
  emit(world, 'kill');
}

function moveWisps(world, dt) {
  const player = world.player;
  for (const wisp of world.wisps) {
    const spec = WISP_KINDS[wisp.kind];
    const chasePlayer = wisp.kind === 'swarmer' && Math.hypot(player.x - wisp.x, player.y - wisp.y) < 260;
    const targetX = chasePlayer ? player.x : BEACON.x;
    const targetY = chasePlayer ? player.y : BEACON.y;
    const dx = targetX - wisp.x;
    const dy = targetY - wisp.y;
    const distance = Math.hypot(dx, dy) || 1;
    const wobble = Math.sin(world.time * 3 + wisp.phase) * 0.35;
    const speed = spec.speed * (1 + Math.min(world.wave, 6) * 0.04);
    const ax = (dx / distance) * speed - (dy / distance) * speed * wobble;
    const ay = (dy / distance) * speed + (dx / distance) * speed * wobble;
    wisp.x += (ax + wisp.vx) * dt;
    wisp.y += (ay + wisp.vy) * dt;
    wisp.vx *= Math.pow(0.02, dt);
    wisp.vy *= Math.pow(0.02, dt);
    wisp.flash = Math.max(0, wisp.flash - dt);

    if (Math.hypot(BEACON.x - wisp.x, BEACON.y - wisp.y) < BEACON.radius + spec.radius) {
      world.beacon.health -= spec.beaconDamage;
      world.beacon.flash = 0.4;
      wisp.dead = true;
      burst(world, wisp.x, wisp.y, 12, 14, 160);
      world.shake = 0.35;
      emit(world, 'beaconHit');
    } else if (Math.hypot(player.x - wisp.x, player.y - wisp.y) < PLAYER.radius + spec.radius) {
      if (player.invulnerable <= 0) {
        player.hearts -= 1;
        player.invulnerable = PLAYER.invulnerableSeconds;
        world.shake = 0.3;
        emit(world, 'hurt');
      }
      if (wisp.kind !== 'brute') {
        wisp.dead = true;
        burst(world, wisp.x, wisp.y, spec.hue, 8, 120);
      }
    }
  }
}

function moveBullets(world, dt) {
  for (const bullet of world.bullets) {
    bullet.age += dt;
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    if (bullet.age > BULLET.lifeSeconds || bullet.x < -20 || bullet.y < -20 || bullet.x > FIELD.width + 20 || bullet.y > FIELD.height + 20) { bullet.dead = true; continue; }
    for (const wisp of world.wisps) {
      if (wisp.dead) continue;
      if (Math.hypot(wisp.x - bullet.x, wisp.y - bullet.y) < WISP_KINDS[wisp.kind].radius + BULLET.radius) {
        wisp.health -= 1;
        wisp.flash = 0.1;
        bullet.dead = true;
        burst(world, bullet.x, bullet.y, 45, 3, 90);
        emit(world, 'hit');
        break;
      }
    }
  }
  for (const wisp of world.wisps) if (!wisp.dead && wisp.health <= 0) killWisp(world, wisp);
}

function collectShards(world, dt) {
  const player = world.player;
  for (const shard of world.shards) {
    shard.age += dt;
    const dx = player.x - shard.x;
    const dy = player.y - shard.y;
    const distance = Math.hypot(dx, dy) || 1;
    if (distance < SHARD.magnetRadius) {
      const pull = (1 - distance / SHARD.magnetRadius) * 420 + 80;
      shard.x += (dx / distance) * pull * dt;
      shard.y += (dy / distance) * pull * dt;
    }
    if (distance < PLAYER.radius + 8) {
      shard.dead = true;
      world.beacon.health = Math.min(BEACON.maxHealth, world.beacon.health + SHARD.healBeacon);
      world.score += SHARD.score;
      emit(world, 'shard');
    } else if (shard.age > 12) shard.dead = true;
  }
}

function advanceWaves(world, dt) {
  if (world.queue.length > 0) {
    world.spawnTimer -= dt;
    if (world.spawnTimer <= 0) {
      spawnWisp(world, world.queue.pop());
      world.spawnTimer = WAVES[world.wave - 1].interval;
    }
    return;
  }
  if (world.wisps.length > 0) return;
  if (world.wave >= WAVES.length) {
    world.phase = PHASE_WON;
    emit(world, 'win');
    return;
  }
  if (world.intermission <= 0) world.intermission = INTERMISSION_SECONDS;
  world.intermission -= dt;
  if (world.intermission <= 0) beginWave(world);
}

function decay(world, dt) {
  for (const particle of world.particles) { particle.age += dt; particle.x += particle.vx * dt; particle.y += particle.vy * dt; particle.vx *= 0.96; particle.vy *= 0.96; }
  for (const ring of world.rings) ring.age += dt;
  world.particles = world.particles.filter((p) => p.age < p.life);
  world.rings = world.rings.filter((r) => r.age < r.life);
  world.beacon.flash = Math.max(0, world.beacon.flash - dt);
  world.shake = Math.max(0, world.shake - dt);
}

/** Advances the night by one fixed step. `input` is {moveX, moveY, aimX, aimY, fire, flare}. */
export function step(world, input, dt) {
  world.time += dt;
  if (world.phase === PHASE_PLAY) {
    movePlayer(world, input, dt);
    fireBullets(world, input);
    castFlare(world, input);
    moveBullets(world, dt);
    moveWisps(world, dt);
    collectShards(world, dt);
    world.bullets = world.bullets.filter((b) => !b.dead);
    world.wisps = world.wisps.filter((w) => !w.dead);
    world.shards = world.shards.filter((s) => !s.dead);
    advanceWaves(world, dt);
    if (world.beacon.health <= 0 || world.player.hearts <= 0) {
      world.beacon.health = Math.max(0, world.beacon.health);
      world.phase = PHASE_OVER;
      emit(world, 'over');
    }
  }
  decay(world, dt);
}
