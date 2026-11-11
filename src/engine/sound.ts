// All sound effects are synthesized with Web Audio — no audio files to ship.
import type { SfxName } from './sfxNames';

let ctx: AudioContext | null = null;

let silentLoop: HTMLAudioElement | null = null;

/** A tiny silent WAV, looped through an <audio> element: on older iOS this switches the page to
 *  "playback" audio so sounds play even when the ring/silent switch is on silent. */
function silentWavUrl() {
  const n = 800; // 0.1 s at 8 kHz, 8-bit mono
  const b = new DataView(new ArrayBuffer(44 + n));
  const str = (o: number, s: string) => [...s].forEach((c, i) => b.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF'); b.setUint32(4, 36 + n, true); str(8, 'WAVE'); str(12, 'fmt ');
  b.setUint32(16, 16, true); b.setUint16(20, 1, true); b.setUint16(22, 1, true);
  b.setUint32(24, 8000, true); b.setUint32(28, 8000, true); b.setUint16(32, 1, true); b.setUint16(34, 8, true);
  str(36, 'data'); b.setUint32(40, n, true);
  for (let i = 0; i < n; i++) b.setUint8(44 + i, 128);
  return URL.createObjectURL(new Blob([b], { type: 'audio/wav' }));
}

/** Must be called from a tap (iOS only allows audio after a user gesture). Safe to call again. */
export function unlockAudio() {
  // Play even when the iPhone/iPad silent switch is on (like a music or video app).
  try {
    const nav = navigator as Navigator & { audioSession?: { type: string } };
    if (nav.audioSession) nav.audioSession.type = 'playback'; // iOS 17+ / Safari 17+
    else if (/iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document && !silentLoop) {
      silentLoop = new Audio(silentWavUrl());
      silentLoop.loop = true;
      silentLoop.setAttribute('playsinline', '');
      void silentLoop.play().catch(() => { silentLoop = null; });
    }
  } catch {
    /* not supported */
  }
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state !== 'running') void ctx.resume();
    // Play one silent sample inside the tap: fully unlocks Web Audio on older iOS.
    const src = ctx.createBufferSource();
    src.buffer = ctx.createBuffer(1, 1, 22050);
    src.connect(ctx.destination);
    src.start(0);
  } catch {
    ctx = null;
  }
}

/** 'running' when sound effects can play; 'suspended' / 'interrupted' after a call or app switch. */
export const audioState = () => ctx?.state ?? 'not started';

// iOS suspends audio after phone calls, Siri or switching apps: wake it on the next tap / return.
if (typeof document !== 'undefined') {
  const wake = () => { if (ctx && ctx.state !== 'running') void ctx.resume(); };
  document.addEventListener('pointerdown', wake, true);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); });
}

type Osc = { f: number; f2?: number; at?: number; dur: number; type?: OscillatorType; gain?: number };

function tone({ f, f2, at = 0, dur, type = 'sine', gain = 0.18 }: Osc) {
  if (!ctx) return;
  const t0 = ctx.currentTime + at;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t0);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.setValueAtTime(gain, t0 + Math.max(0.03, dur - 0.05));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function noise(dur: number, gain = 0.15) {
  if (!ctx) return;
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = ctx.createBufferSource();
  const filt = ctx.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.value = 1200;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.buffer = buf;
  src.connect(filt).connect(g).connect(ctx.destination);
  src.start();
}

/** Duration in seconds of each sound (so callers can wait for it). */
export const SFX_DURATION: Record<SfxName, number> = {
  ding: 0.35, pop: 0.1, wobble: 0.25, fanfare: 0.9, splash: 0.35, vroom: 1.1,
  honk: 0.75, horn: 1.1, siren: 2.0, neenaw: 1.7, woop: 1.4, rumble: 1.6, beepReverse: 1.8, hum: 1.3, raceEngine: 1.5,
};

const SFX: Record<SfxName, () => void> = {
  ding: () => { tone({ f: 880, dur: 0.15 }); tone({ f: 1320, at: 0.12, dur: 0.22 }); },
  pop: () => tone({ f: 700, f2: 250, dur: 0.09, gain: 0.2 }),
  wobble: () => tone({ f: 320, f2: 180, dur: 0.25, type: 'triangle', gain: 0.15 }),
  fanfare: () => [523, 659, 784, 1047].forEach((f, i) => tone({ f, at: i * 0.15, dur: i === 3 ? 0.4 : 0.16, type: 'triangle', gain: 0.2 })),
  splash: () => noise(0.35, 0.25),
  vroom: () => { tone({ f: 70, f2: 260, dur: 1.0, type: 'sawtooth', gain: 0.1 }); tone({ f: 140, f2: 420, dur: 1.0, type: 'square', gain: 0.04 }); },
  honk: () => [0, 0.4].forEach((at) => { tone({ f: 415, at, dur: 0.3, type: 'square', gain: 0.08 }); tone({ f: 523, at, dur: 0.3, type: 'square', gain: 0.08 }); }),
  horn: () => { tone({ f: 155, dur: 1.0, type: 'sawtooth', gain: 0.09 }); tone({ f: 196, dur: 1.0, type: 'sawtooth', gain: 0.09 }); },
  siren: () => [0, 1].forEach((i) => { tone({ f: 600, f2: 1200, at: i, dur: 0.5, type: 'triangle' }); tone({ f: 1200, f2: 600, at: i + 0.5, dur: 0.5, type: 'triangle' }); }),
  neenaw: () => [0, 1, 2, 3].forEach((i) => tone({ f: i % 2 ? 740 : 960, at: i * 0.42, dur: 0.4, type: 'square', gain: 0.07 })),
  woop: () => [0, 0.7].forEach((at) => tone({ f: 350, f2: 1300, at, dur: 0.6, type: 'sawtooth', gain: 0.07 })),
  rumble: () => { for (let i = 0; i < 8; i++) tone({ f: 55 + (i % 2) * 8, at: i * 0.2, dur: 0.2, type: 'sawtooth', gain: 0.14 }); },
  beepReverse: () => [0, 0.6, 1.2].forEach((at) => tone({ f: 1050, at, dur: 0.35, type: 'square', gain: 0.07 })),
  hum: () => { for (let i = 0; i < 6; i++) tone({ f: 70 + (i % 2) * 6, at: i * 0.2, dur: 0.22, type: 'triangle', gain: 0.14 }); },
  raceEngine: () => { tone({ f: 120, f2: 520, dur: 0.6, type: 'sawtooth', gain: 0.08 }); tone({ f: 180, f2: 700, at: 0.65, dur: 0.8, type: 'sawtooth', gain: 0.08 }); },
};

export function sfx(name: SfxName) {
  try {
    SFX[name]();
  } catch {
    /* audio not available */
  }
}

export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Scribble: a soft pencil-on-paper noise while drawing, louder when moving faster ──
let scribble: { src: AudioBufferSourceNode; gain: GainNode } | null = null;

export function scribbleStart() {
  if (!ctx || scribble) return;
  try {
    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = 2600;
    filt.Q.value = 0.9;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(filt).connect(gain).connect(ctx.destination);
    src.start();
    scribble = { src, gain };
  } catch {
    scribble = null;
  }
}

/** speed: CSS px per pointer event. */
export function scribbleSpeed(speed: number) {
  if (!ctx || !scribble) return;
  scribble.gain.gain.setTargetAtTime(Math.min(0.07, speed * 0.0035), ctx.currentTime, 0.04);
}

export function scribbleStop() {
  if (!ctx || !scribble) return;
  const s = scribble;
  scribble = null;
  s.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
  setTimeout(() => { try { s.src.stop(); } catch { /* already stopped */ } }, 200);
}
