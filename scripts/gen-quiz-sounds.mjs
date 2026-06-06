// Generates short bundled WAV sound effects for the KG quiz:
//   assets/sounds/correct.wav  — a happy rising 3-note chime
//   assets/sounds/wrong.wav    — a short low "buzzer"
// Run: node scripts/gen-quiz-sounds.mjs
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'assets', 'sounds');
const SAMPLE_RATE = 44100;

function encodeWav(samples) {
  // samples: Float32 array in [-1, 1] (mono)
  const numSamples = samples.length;
  const dataSize = numSamples * 2; // 16-bit
  const buffer = Buffer.alloc(44 + dataSize);
  let o = 0;
  buffer.write('RIFF', o); o += 4;
  buffer.writeUInt32LE(36 + dataSize, o); o += 4;
  buffer.write('WAVE', o); o += 4;
  buffer.write('fmt ', o); o += 4;
  buffer.writeUInt32LE(16, o); o += 4;       // PCM chunk size
  buffer.writeUInt16LE(1, o); o += 2;        // audioFormat = PCM
  buffer.writeUInt16LE(1, o); o += 2;        // channels = mono
  buffer.writeUInt32LE(SAMPLE_RATE, o); o += 4;
  buffer.writeUInt32LE(SAMPLE_RATE * 2, o); o += 4; // byteRate
  buffer.writeUInt16LE(2, o); o += 2;        // blockAlign
  buffer.writeUInt16LE(16, o); o += 2;       // bitsPerSample
  buffer.write('data', o); o += 4;
  buffer.writeUInt32LE(dataSize, o); o += 4;
  for (let i = 0; i < numSamples; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(s * 32767), o);
    o += 2;
  }
  return buffer;
}

// Envelope: smooth attack + release to avoid clicks.
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
    // soften square a touch with its fundamental to avoid harshness
    if (type === 'square') v = 0.7 * v + 0.3 * Math.sin(phase);
    out[i] = v * amp * env(i, n, attack, release);
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

// Correct: rising C5 -> E5 -> G5 chime, last note rings longer.
const correct = concat([
  tone({ freq: 523.25, durSec: 0.12, amp: 0.42 }),
  tone({ freq: 659.25, durSec: 0.12, amp: 0.42 }),
  tone({ freq: 783.99, durSec: 0.26, amp: 0.45, release: 0.14 }),
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
