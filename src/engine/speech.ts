import { getState } from './store';
import { LANG_TAG, t, type Line } from './i18n';
import { sfx, SFX_DURATION, wait } from './sound';
import type { SfxName } from './sfxNames';

/** A step in a spoken sequence: a line, a sound effect, a pause (ms), or nothing. */
export type Step = Line | { sfx: SfxName } | number | null | undefined | false;

// Recorded overrides: public/audio/<lang>/<key>.mp3, listed in public/audio/manifest.json as "<lang>/<key>".
let recorded = new Set<string>();
fetch('audio/manifest.json')
  .then((r) => (r.ok ? r.json() : []))
  .then((a: string[]) => (recorded = new Set(a)))
  .catch(() => {});

let token = 0;
let audio: HTMLAudioElement | null = null;
const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
/** Keep a reference to the utterance being spoken: Safari can garbage-collect it mid-sentence. */
let utter: SpeechSynthesisUtterance | null = null;

// Voices load asynchronously (especially on iOS); keep the latest list.
let voices: SpeechSynthesisVoice[] = [];
const loadVoices = () => { voices = synth?.getVoices() ?? []; };
if (synth) {
  loadVoices();
  synth.addEventListener?.('voiceschanged', loadVoices);
}

// ── Speech status, for the Grown-ups "Sound check" ──
export type SpeechEvent = { type: 'start' | 'end' | 'error' | 'timeout' | 'unsupported'; voice?: string; error?: string };
const listeners = new Set<(e: SpeechEvent) => void>();
export const onSpeech = (fn: (e: SpeechEvent) => void) => { listeners.add(fn); return () => listeners.delete(fn); };
const emit = (e: SpeechEvent) => listeners.forEach((f) => f(e));
export const speechSupported = () => !!synth;
export function voiceInfo() {
  if (!voices.length) loadVoices();
  const of = (l: string) => voices.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(l));
  return { total: voices.length, vi: of('vi').map((v) => v.name), en: of('en').length };
}

/** Stop speaking; returns true if something was actually cancelled. */
function halt(): boolean {
  token++;
  let cancelled = false;
  // Only cancel when speaking: Safari drops the next utterance after a needless cancel().
  if (synth && (synth.speaking || synth.pending)) {
    synth.cancel();
    cancelled = true;
  }
  if (audio) {
    audio.pause();
    audio = null;
  }
  return cancelled;
}

export function stopSpeech() {
  halt();
}

function pickVoice(tag: string): SpeechSynthesisVoice | undefined {
  if (!voices.length) loadVoices();
  const lang = tag.slice(0, 2);
  const matches = voices.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(lang));
  // Prefer local, natural-sounding voices.
  return (
    matches.find((v) => /samantha|linh|premium|enhanced|natural/i.test(v.name)) ??
    matches.find((v) => v.localService) ??
    matches[0]
  );
}

function speakText(text: string, my: number): Promise<void> {
  return new Promise((resolve) => {
    if (!synth) {
      emit({ type: 'unsupported' });
      return resolve();
    }
    if (my !== token) return resolve();
    const { lang, rate } = getState();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANG_TAG[lang];
    const v = pickVoice(u.lang);
    if (v) u.voice = v;
    u.rate = rate;
    u.pitch = 1.1;
    const done = () => {
      clearTimeout(timer);
      if (utter === u) utter = null;
      resolve();
    };
    // iOS sometimes never fires onend; don't hang the game.
    const timer = setTimeout(() => { emit({ type: 'timeout' }); done(); }, 1500 + text.length * 110);
    u.onstart = () => emit({ type: 'start', voice: u.voice?.name ?? '(default voice)' });
    u.onend = () => { emit({ type: 'end' }); done(); };
    u.onerror = (e) => { emit({ type: 'error', error: e.error }); done(); };
    utter = u;
    if (synth.paused) synth.resume(); // un-stick Safari's queue after the app was in the background
    synth.speak(u);
  });
}

function playFile(src: string, my: number): Promise<void> {
  return new Promise((resolve) => {
    if (my !== token) return resolve();
    audio = new Audio(src);
    audio.onended = () => resolve();
    audio.onerror = () => resolve();
    audio.play().catch(() => resolve());
  });
}

/** Play steps in order. A new say() (or stopSpeech) cancels the previous sequence. Resolves when done or cancelled. */
export async function say(steps: Step | Step[]) {
  const cancelled = halt();
  const my = token;
  // Safari ignores an utterance spoken immediately after cancel(); give it a moment.
  // (When nothing was playing we speak right away, so a first line inside a tap stays inside the tap.)
  if (cancelled) await wait(90);
  const list = Array.isArray(steps) ? steps : [steps];
  const { lang } = getState();
  for (const step of list) {
    if (my !== token) return false;
    if (!step) continue;
    if (typeof step === 'number') await wait(step);
    else if ('sfx' in step) {
      sfx(step.sfx);
      await wait(SFX_DURATION[step.sfx] * 1000 + 150);
    } else {
      const rec = `${lang}/${step.key}`;
      if (!step.args && recorded.has(rec)) await playFile(`audio/${rec}.mp3`, my);
      else await speakText(t(lang, step), my);
    }
  }
  return my === token;
}

export const isCurrent = (my: number) => my === token;
export const currentToken = () => token;

// The app speaks its welcome line inside the ▶ tap (iOS only allows speech that starts from a tap);
// Home then skips its own welcome for that first visit.
let welcomedAt = 0;
export function speakFirstLine(line: Line) {
  welcomedAt = Date.now();
  void say(line);
}
export const justWelcomed = () => Date.now() - welcomedAt < 2000;
