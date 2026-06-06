// Generates short bundled WAV sound effects for the KG quiz:
//   assets/sounds/correct.wav  — a gentle fireworks celebration (whistle -> pop -> sparkle chime)
//   assets/sounds/wrong.wav    — a short low "buzzer"
// Run: node scripts/gen-quiz-sounds.mjs
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'assets', 'sounds');
const SAMPLE_RATE = 44100;

function encodeWav(samples) {
  const numSamples = samples.length;
  const dataSize = numSamples * 2; // 16-bit
  const buffer = Buffer.alloc(44 + dataSize);
  let o = 0;
  buffer.write('RIFF', o); o += 4;
  buffer.writeUInt32LE(36 + dataSize, o); o += 4;
  buffer.write('WAVE', o); o += 4;
  buffer.write('fmt ', o); o += 4;
  buffer.writeUInt32LE(16, o); o += 4;
  buffer.writeUInt16LE(1, o); o += 2;        // PCM
  buffer.writeUInt16LE(1, o); o += 2;        // mono
  buffer.writeUInt32LE(SAMPLE_RATE, o); o += 4;
  buffer.writeUInt32LE(SAMPLE_RATE * 2, o); o += 4;
  buffer.writeUInt16LE(2, o); o += 2;
  buffer.writeUInt16LE(16, o); o += 2;
  buffer.write('data', o); o += 4;
  buffer.writeUInt32LE(dataSize, o); o += 4;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(s * 32767), o);
    o += 2;
  }
  return buffer;
}

// Smooth attack + release envelope to avoid clicks.
function env(i, total, attack = 0.01, release = 0.06) {
  const t = i / SAMPLE_RATE;
  const dur = total / SAMPLE_RATE;
  const a = Math.min(1, t / attack);
  const r = Math.min(1, (dur - t) / release);
  return Math.max(0, Math.min(a, r));
}

function tone({ freq, durSec, amp = 0.4, type = 'sine', attack = 0.01, release = 0.06 }) {
  const n = Math.floor(durSec * SAMPLE_RATE);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const phase = (2 * Math.PI * freq * i) / SAMPLE_RATE;
    let v = type === 'square' ? Math.sign(Math.sin(phase)) : Math.sin(phase);
    if (type === 'square') v = 0.7 * v + 0.3 * Math.sin(phase);
    out[i] = v * amp * env(i, n, attack, release);
  }
  return out;
}

// Pitch-sweeping sine (firework "whistle").
function sweep({ f0, f1, durSec, amp = 0.2, attack = 0.01, release = 0.08 }) {
  const n = Math.floor(durSec * SAMPLE_RATE);
  const out = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const freq = f0 + (f1 - f0) * t;
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    out[i] = Math.sin(phase) * amp * env(i, n, attack, release);
  }
  return out;
}

// White-noise burst (soft "pop").
function noise({ durSec, amp = 0.3, attack = 0.002, release = 0.05 }) {
  const n = Math.floor(durSec * SAMPLE_RATE);
  const out = new Float32Array(n);
  let seed = 12345;
  const rand = () => {
    // deterministic LCG so the asset is reproducible
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed / 0x7fffffff) * 2 - 1;
  };
  for (let i = 0; i < n; i++) {
    out[i] = rand() * amp * env(i, n, attack, release);
  }
  return out;
}

function concat(parts) {
  const total = parts.reduce((s, p) => s + p.length, 0);
  const out = new Float32Array(total);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.length; }
  return out;
}

function silence(durSec) {
  return new Float32Array(Math.floor(durSec * SAMPLE_RATE));
}

// Mix layers at given start times, then soft-limit the peak.
function mix(totalSec, layers) {
  const total = Math.floor(totalSec * SAMPLE_RATE);
  const out = new Float32Array(total);
  for (const { part, at = 0 } of layers) {
    const off = Math.floor(at * SAMPLE_RATE);
    for (let i = 0; i < part.length && off + i < total; i++) out[off + i] += part[i];
  }
  let peak = 0;
  for (let i = 0; i < out.length; i++) peak = Math.max(peak, Math.abs(out[i]));
  if (peak > 0.92) {
    const g = 0.92 / peak;
    for (let i = 0; i < out.length; i++) out[i] *= g;
  }
  return out;
}

// Correct: gentle fireworks — a soft rising whistle, a gentle pop,
// then a warm bell chord with a sparkling chime cascade falling down.
const sparkleFreqs = [2093.0, 1760.0, 2349.32, 1975.53, 2637.02, 1567.98]; // C7 A6 D7 B6 E7 G6
const sparkles = [];
let at = 0.32;
let sAmp = 0.2;
for (const f of sparkleFreqs) {
  sparkles.push({ part: tone({ freq: f, durSec: 0.16, amp: sAmp, attack: 0.004, release: 0.12 }), at });
  at += 0.08;
  sAmp = Math.max(0.09, sAmp - 0.02);
}

const correct = mix(1.05, [
  // launch whistle (gentle rising sweep)
  { part: sweep({ f0: 520, f1: 1250, durSec: 0.3, amp: 0.16, release: 0.06 }), at: 0 },
  // soft pop
  { part: tone({ freq: 150, durSec: 0.09, amp: 0.3, release: 0.07 }), at: 0.29 },
  { part: noise({ durSec: 0.06, amp: 0.1, release: 0.05 }), at: 0.29 },
  // warm celebratory bell chord (C5 / E5 / G5)
  { part: tone({ freq: 523.25, durSec: 0.55, amp: 0.16, attack: 0.006, release: 0.32 }), at: 0.31 },
  { part: tone({ freq: 659.25, durSec: 0.55, amp: 0.13, attack: 0.006, release: 0.32 }), at: 0.31 },
  { part: tone({ freq: 783.99, durSec: 0.55, amp: 0.13, attack: 0.006, release: 0.32 }), at: 0.31 },
  // sparkle cascade
  ...sparkles,
]);

// Wrong: two short descending low "buzz" tones.
const wrong = concat([
  tone({ freq: 220, durSec: 0.16, amp: 0.34, type: 'square', release: 0.05 }),
  silence(0.03),
  tone({ freq: 160, durSec: 0.2, amp: 0.34, type: 'square', release: 0.08 }),
]);

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'correct.wav'), encodeWav(correct));
writeFileSync(join(OUT_DIR, 'wrong.wav'), encodeWav(wrong));
console.log('Wrote correct.wav and wrong.wav to', OUT_DIR);
