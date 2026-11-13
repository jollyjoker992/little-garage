// English Street progress and what is said around an English word (docs/ENGLISH_ZONE.md §5).
//
// Progress is the ROAD: every unit is a town with stops (content/english.ts). `State.engRoad[unit]` counts
// the stops he has passed there; all of them = the town's badge, which opens the next town.
// A stop's level (★ ★★ ★★★) decides the help: 1 = meaning in the app language + the English word,
// 2 = a short frame + the English word (no meaning), 3 = just the English word.
// English is ONLY ever the word being taught, said on its own.
import { MAX_TRIES, PASS, ROAD, UNITS, WORDS, WORD_BY_ID, type EngWord, type Stop, type StopLevel, type UnitId } from '../content/english';
import { EN, L, voiced, type Line } from './i18n';
import type { Step } from './speech';
import { getState, update, type State, type UnitMode } from './store';

/** A word's stars: the highest level he answered it at, first try (1 = met with help). */
export const KNOWN = 2;
export const MASTERED = 3;
export const boxesOf = (s: State) => Object.fromEntries(Object.entries(s.words).map(([k, v]) => [k, v.box]));

// ── The road ──

export type Road = Record<string, number>;
export const stopsDone = (road: Road, unit: UnitId) => Math.min(road[unit] ?? 0, ROAD[unit].length);
export const hasBadge = (road: Road, unit: UnitId) => stopsDone(road, unit) >= ROAD[unit].length;

/** Towns he can enter: "on" ones, the first switched-on one, and each "auto" town once the one before has its badge. */
export function openUnits(modes: Record<string, UnitMode>, road: Road): UnitId[] {
  const out: UnitId[] = [];
  let prev: { open: boolean; done: boolean } | null = null;
  for (const u of UNITS) {
    const m = modes[u.id] ?? 'auto';
    if (m === 'off') continue;
    const open: boolean = m === 'on' || prev === null || (prev.open && prev.done);
    if (open) out.push(u.id);
    prev = { open, done: hasBadge(road, u.id) };
  }
  return out.length ? out : [UNITS[0].id];
}

/** Towns on the road (not switched off), in order. */
export const shownUnits = (modes: Record<string, UnitMode>): UnitId[] => {
  const on = UNITS.filter((u) => (modes[u.id] ?? 'auto') !== 'off').map((u) => u.id);
  return on.length ? on : [UNITS[0].id];
};

/** Where he is now: the first open town without a badge; 'review' when every town on the road has its badge. */
export function currentUnit(modes: Record<string, UnitMode>, road: Road): UnitId | 'review' {
  return openUnits(modes, road).find((u) => !hasBadge(road, u)) ?? 'review';
}

/** The review town (after all badges): mixed ★★★ stops that never run out. */
export function reviewStops(road: Road, modes: Record<string, UnitMode>): Stop[] {
  const done = shownUnits(modes).filter((u) => hasBadge(road, u));
  const pics = WORDS.filter((w) => done.includes(w.unit) && w.kind !== 'action').map((w) => w.id);
  const acts = WORDS.filter((w) => done.includes(w.unit) && w.kind === 'action').map((w) => w.id);
  const out: Stop[] = [];
  if (pics.length >= 4) out.push({ kind: 'find', level: 3, words: pics, rounds: 6, choices: 4, two: true });
  if (acts.length >= 2) out.push({ kind: 'do', level: 3, words: acts, rounds: 6, choices: acts.length });
  return out;
}

export type StopResult = { first: number; total: number };
/** Did he pass? Ship stops always do; the others need PASS of the rounds right first try (or MAX_TRIES tries). */
export const passed = (stop: Stop, r: StopResult, tries: number) =>
  stop.kind === 'meet' || tries >= MAX_TRIES || r.first >= Math.ceil(r.total * PASS);

export type StopOutcome = { passed: boolean; /** the next stop is a new level */ levelUp?: StopLevel; badge?: boolean; replay?: boolean };

/** Record a finished stop. Only the frontier stop (the next one to do) moves him along the road. */
export function finishStop(unit: UnitId, index: number, r: StopResult, tries: number): StopOutcome {
  const stops = ROAD[unit];
  const stop = stops[index];
  const done = stopsDone(getState().engRoad, unit);
  if (index < done) return { passed: true, replay: true };
  if (!passed(stop, r, tries)) return { passed: false };
  update((s) => ({ engRoad: { ...s.engRoad, [unit]: index + 1 }, mateDue: true }));
  const next = stops[index + 1];
  return { passed: true, badge: !next, levelUp: next && next.level > stop.level ? next.level : undefined };
}

// ── Word stars ──

/** He met the word (the ship, or Zip Says with help): 1 star. */
export function meetWord(id: string) {
  update((s) => {
    const cur = s.words[id] ?? { box: 0, seen: 0, last: 0 };
    return { words: { ...s.words, [id]: { box: Math.max(1, cur.box), seen: cur.seen + 1, last: Date.now() } } };
  });
}

/** A round about this word ended: right on the first try at this level → the word has (at least) that many stars. */
export function recordWord(id: string, level: StopLevel, firstTry: boolean) {
  update((s) => {
    const cur = s.words[id] ?? { box: 0, seen: 0, last: 0 };
    return { words: { ...s.words, [id]: { box: Math.max(1, cur.box, firstTry ? level : 0), seen: cur.seen + 1, last: Date.now() } } };
  });
}

// ── What is said ──

/** The English word itself, a little slower: "fire truck!" `w` can also be any i18n key. */
export const wordLine = (w: EngWord | string, voice = 'word'): Line => EN('say.value', { value: L(typeof w === 'string' ? WORD_BY_ID[w]?.key ?? w : w.key) }, voice);
/** The word's meaning in the app language ("xe cứu hỏa"). */
export const meaning = (w: EngWord): Line => L(w.key);
/** "Nghĩa là xe cứu hỏa!" — help after two misses at levels 2 and 3. */
export const meansLine = (w: EngWord): Line => L('eng.means', { w: meaning(w) });

const FRAME = { vehicle: 'eng.where', color: 'eng.whereColor', action: 'eng.whereAction' } as const;
const FULL = { vehicle: 'eng.a.find', color: 'eng.a.findColor', action: 'eng.a.findAction' } as const;

/**
 * Asking for a word at a level:
 *   ★   "Đâu là xe cứu hỏa?" · "Tiếng Anh là:" · "fire truck!" · "fire truck!"
 *   ★★  "Đâu là xe…" · "fire truck!"
 *   ★★★ "fire truck!"
 */
export function findPrompt(level: StopLevel, w: EngWord): Step[] {
  if (level === 3) return [wordLine(w, 'zip')];
  if (level === 2) return [L(w.frame ?? FRAME[w.kind]), wordLine(w)];
  return [L(FULL[w.kind], { w: meaning(w) }), L('eng.inEnglish'), wordLine(w), 400, wordLine(w)];
}

/** Two words at once (colors ★★★): "red bus!" */
export const phrase2 = (c: EngWord, v: EngWord, voice = 'zip'): Line => EN('eng.phrase2', { c: L(c.key), w: L(v.key) }, voice);

/** Zip's cheer and try-again, in the app language. */
export const zipCheer = (): Line => voiced(L('zip.cheer'), 'zip');
export const tryAgainLines = (): Line[] => [voiced(L('zip.tryAgain'), 'zip')];

/**
 * Zip Says: the command is the action word.
 *   ★   "Zip nói:" · "go!" · "Nghĩa là chạy!" (and the button glows)
 *   ★★  "Zip nói:" · "go!"
 *   ★★★ "go!"
 */
export function actionCommand(level: StopLevel, w: EngWord): Step[] {
  const word = wordLine(w, 'zip');
  if (level === 3) return [word];
  if (level === 2) return [L('eng.zipSays'), word];
  return [L('eng.zipSays'), word, meansLine(w)];
}
