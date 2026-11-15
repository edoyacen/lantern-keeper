// Every tunable number of Lantern Keeper lives here so the rules read in one place.
export const FIELD = { width: 960, height: 600 };
export const STEP = 1 / 60;

export const PLAYER = { radius: 13, speed: 235, hearts: 5, invulnerableSeconds: 1.2, fireInterval: 0.17 };
export const BEACON = { x: FIELD.width / 2, y: FIELD.height / 2, radius: 26, maxHealth: 100 };
export const BULLET = { speed: 640, radius: 4, lifeSeconds: 0.85 };
export const FLARE = { radius: 175, damage: 2, cooldownSeconds: 7, push: 220 };
export const SHARD = { healBeacon: 4, score: 5, magnetRadius: 95, dropChance: 0.35 };

export const WISP_KINDS = {
  drifter: { radius: 11, speed: 52, health: 1, beaconDamage: 8, score: 10, hue: 172 },
  swarmer: { radius: 8, speed: 118, health: 1, beaconDamage: 5, score: 15, hue: 196 },
  brute: { radius: 20, speed: 36, health: 5, beaconDamage: 20, score: 60, hue: 150 },
};

export const WAVES = [
  { drifter: 8, swarmer: 0, brute: 0, interval: 1.1 },
  { drifter: 8, swarmer: 5, brute: 0, interval: 0.95 },
  { drifter: 8, swarmer: 8, brute: 1, interval: 0.85 },
  { drifter: 10, swarmer: 10, brute: 2, interval: 0.75 },
  { drifter: 10, swarmer: 14, brute: 3, interval: 0.65 },
  { drifter: 12, swarmer: 16, brute: 5, interval: 0.55 },
];
export const INTERMISSION_SECONDS = 3;
