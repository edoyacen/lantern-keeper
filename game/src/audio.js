// Tiny synthesised sound effects (Web Audio, no files). Silent until the first user gesture.
let context = null;
let muted = false;

function ensureContext() {
  if (muted) return null;
  if (context === null) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  if (context.state === 'suspended') context.resume();
  return context;
}

function blip(frequency, endFrequency, seconds, type, volume) {
  const ctx = ensureContext();
  if (ctx === null) return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + seconds);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(now);
  oscillator.stop(now + seconds);
}

const SOUNDS = {
  shoot: () => blip(880, 420, 0.09, 'triangle', 0.05),
  hit: () => blip(300, 160, 0.08, 'square', 0.04),
  kill: () => blip(520, 1040, 0.14, 'sine', 0.07),
  shard: () => blip(988, 1480, 0.12, 'sine', 0.06),
  flare: () => blip(160, 900, 0.45, 'sawtooth', 0.07),
  hurt: () => blip(220, 70, 0.3, 'sawtooth', 0.09),
  beaconHit: () => blip(140, 60, 0.35, 'square', 0.08),
  wave: () => blip(392, 784, 0.5, 'triangle', 0.08),
  over: () => blip(330, 55, 1.0, 'sawtooth', 0.1),
  win: () => blip(440, 1760, 1.2, 'triangle', 0.1),
};

export function playSound(name) { SOUNDS[name]?.(); }
export function toggleMute() { muted = !muted; return muted; }
