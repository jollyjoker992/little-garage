import { getState } from './store';
import { CLIP_MARK, LANG_TAG, resolveKey, splitClips, t, type Lang, type Line } from './i18n';
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
/** The token of the say() sequence that is playing now (0 = nothing). */
let running = 0;
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

/**
 * Character voices: pitch and a speed factor (× the Grown-ups speed). A line picks one with `voice`.
 * zip = the English-only tow truck; word = an English word being taught (a little slower);
 * mate:<id> = a classmate (see content/classmates.ts).
 */
export const VOICES: Record<string, { pitch: number; rate: number }> = {
  zip: { pitch: 1.35, rate: 1 },
  word: { pitch: 1.1, rate: 0.82 },
  'mate:bear': { pitch: 0.75, rate: 0.9 },
  'mate:cat': { pitch: 1.5, rate: 1.02 },
  'mate:dog': { pitch: 1.2, rate: 1.12 },
  'mate:bunny': { pitch: 1.4, rate: 0.86 },
};

// ── Who is talking (the classmates bob while their line plays) ──
const talkers = new Set<(voice: string | null) => void>();
export const onTalk = (fn: (voice: string | null) => void) => { talkers.add(fn); return () => talkers.delete(fn); };
const talk = (voice: string | null) => talkers.forEach((f) => f(voice));
export const isSpeaking = () => !!(synth?.speaking || (audio && !audio.paused));

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
  running = 0;
  talk(null);
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

/** A line that hasn't started (and isn't being spoken) after this long was ignored: iOS speech is still locked. */
export const START_MS = 3000;
/** A line that ends sooner than this without starting was thrown away (Safari, right after a cancel). */
export const DROP_MS = 400;
/** Longest a line may take: generous, scaled by its speed. */
const lineMs = (text: string, rate: number) => 2500 + (text.length * 160) / Math.max(0.3, rate);

/** True once any line has really started in this page: iOS then allows speech without a tap. */
let unlocked = false;

/**
 * iOS only lets a page speak once speak() has been called inside a tap. Every tap calls this (see the
 * listener below, which runs after the tap's own handlers) until a line has really been heard: when the
 * tap didn't start any speech itself, it speaks a silent, empty line inside the tap.
 */
export function unlockSpeech() {
  if (!synth || unlocked || running !== 0 || synth.speaking || synth.pending) return;
  const u = new SpeechSynthesisUtterance(' ');
  u.volume = 0;
  synth.speak(u);
}
if (typeof document !== 'undefined') {
  for (const type of ['touchend', 'click'] as const) document.addEventListener(type, unlockSpeech, { passive: true });
  // Back from the background (or the iPad was asleep): iOS may want a tap again before it speaks.
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') unlocked = false; });
}

type Outcome = 'ok' | 'dropped' | 'ignored';

/**
 * Speak one line once. 'ok': it was spoken (or may have been — never say those twice). 'dropped': it ended
 * at once without starting or saying a word, so nothing was heard. 'ignored': nothing happened at all.
 */
function speakOnce(text: string, my: number, lang?: Lang, voice?: string): Promise<Outcome> {
  return new Promise((resolve) => {
    if (!synth || my !== token) return resolve('ok');
    const st = getState();
    const vc = voice ? VOICES[voice] : undefined;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANG_TAG[lang ?? st.lang];
    const v = pickVoice(u.lang);
    if (v) u.voice = v;
    u.rate = Math.min(2, st.rate * (vc?.rate ?? 1));
    u.pitch = vc?.pitch ?? 1.1;
    const t0 = Date.now();
    let heard = false;
    const hear = () => { heard = true; unlocked = true; };
    const done = (r: Outcome) => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
      if (utter === u) utter = null;
      resolve(r);
    };
    const quickSilence = () => !heard && Date.now() - t0 < DROP_MS;
    // Not started and the browser isn't speaking: the line was ignored. (Speaking without a start event
    // happens in Safari: then it's playing, so wait for its end.)
    const startTimer = setTimeout(() => { if (!heard && !synth.speaking && !synth.pending) { emit({ type: 'timeout' }); done('ignored'); } }, START_MS);
    // iOS sometimes never fires onend; don't hang the game.
    const endTimer = setTimeout(() => { emit({ type: 'timeout' }); done('ok'); }, START_MS + lineMs(text, u.rate));
    u.onstart = () => { hear(); emit({ type: 'start', voice: u.voice?.name ?? '(default voice)' }); };
    u.onboundary = hear;
    u.onend = () => { emit({ type: 'end' }); done(quickSilence() ? 'dropped' : 'ok'); };
    u.onerror = (e) => {
      emit({ type: 'error', error: e.error });
      done(e.error !== 'canceled' && e.error !== 'interrupted' && quickSilence() ? 'dropped' : 'ok');
    };
    utter = u;
    if (synth.paused) synth.resume(); // un-stick Safari's queue after the app was in the background
    synth.speak(u);
  });
}

/**
 * Speak one line. The lines of a sequence are spoken one after another, so anything still in the browser's
 * queue is left over (a line that never ended): clear it first, or the new line waits behind it in silence.
 * A line the browser threw away unheard is said once more; a line that may have been heard never is.
 */
async function speakText(text: string, my: number, lang?: Lang, voice?: string): Promise<void> {
  if (!synth) return emit({ type: 'unsupported' });
  if (my !== token) return;
  if (synth.speaking || synth.pending) {
    synth.cancel();
    await wait(150);
  }
  for (let attempt = 0; attempt < 2; attempt++) {
    if (my !== token) return;
    const r = await speakOnce(text, my, lang, voice);
    if (r === 'ok') return;
    if (r === 'ignored') break; // speech is locked: trying again won't help
    await wait(150);
  }
  unlocked = false; // nothing came out: let the next tap unlock speech again
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
  running = my;
  // Safari ignores an utterance spoken immediately after cancel(); give it a moment.
  // (When nothing was playing we speak right away, so a first line inside a tap stays inside the tap.)
  if (cancelled) await wait(90);
  const list = Array.isArray(steps) ? steps : [steps];
  const appLang = getState().lang;
  try {
    for (const step of list) {
      if (my !== token) return false;
      if (!step) continue;
      if (typeof step === 'number') await wait(step);
      else if ('sfx' in step) {
        sfx(step.sfx);
        await wait(SFX_DURATION[step.sfx] * 1000 + 150);
      } else {
        const lang = step.lang ?? appLang;
        talk(step.voice ?? null);
        // A recording of the personal ".kid" line wins; a recording of the plain line beats the browser voice saying the name.
        // Character lines look for "<lang>/<key>@<voice>" first (e.g. vi/mate.right@mate-bear.mp3), then the plain key.
        const keys = [resolveKey(lang, step.key), step.key];
        const tag = step.voice?.replace(':', '-');
        const rec = [...(tag ? keys.map((k) => `${lang}/${k}@${tag}`) : []), ...keys.map((k) => `${lang}/${k}`)].find((r) => recorded.has(r));
        const text = rec && !step.args ? '' : t(appLang, step);
        if (!step.args && rec) await playFile(`audio/${rec}.mp3`, my);
        else if (text.includes(CLIP_MARK)) {
          // A line with a recorded word in it (a friend named in the child's voice): speak around the clip.
          for (const part of splitClips(text)) {
            if (my !== token) break;
            if (part.clip) await playFile(part.clip, my);
            else await speakText(part.say!, my, lang, step.voice);
          }
        } else await speakText(text, my, lang, step.voice);
        if (my === token) talk(null);
      }
    }
  } finally {
    if (my === token) { talk(null); running = 0; }
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

/** True when no say() sequence is playing (pauses and sound effects between lines count as playing). */
export const speechIdle = () => running === 0;

/**
 * Wait until nothing is being said. Use it before moving on to the next screen: a tap can replace the
 * current lines with new ones (the word again, a friend's joke), and the game must still move on after them.
 */
export async function afterSpeech(): Promise<void> {
  while (running !== 0) await wait(150);
}
