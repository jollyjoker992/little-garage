// What the classmates say during a game. Games call mateSay('right') etc. and add the lines to their own
// say() sequence, so a friend never talks over the game. Friends talk in the APP language (Grown-ups
// settings) with their own voice; only English words they help teach are said in English (by the game).
import { MATE_ORDER, PERSONALITY, mateName, mateVoice, type Mate, type MateId, type Personality } from '../content/classmates';
import { L, voiced, type Arg, type Line } from './i18n';
import { getState, type MateChat, type State } from './store';

export type MateEvent = 'start' | 'right' | 'miss' | 'hint' | 'streak' | 'levelUp' | 'end';

/** How often a friend speaks up, per event. Quiet friends only cheer now and then. */
export const CHANCE: Record<MateChat, Partial<Record<MateEvent, number>>> = {
  quiet: { right: 0.3, levelUp: 1 },
  normal: { start: 1, right: 0.5, miss: 0.4, hint: 1, streak: 1, levelUp: 1, end: 1 },
  chatty: { start: 1, right: 1, miss: 0.8, hint: 1, streak: 1, levelUp: 1, end: 1 },
};
/** Who likes to say what: the speedy friend starts games, the curious one spots hints, the shy one encourages. */
const PREFER: Partial<Record<MateEvent, Personality>> = { start: 'speedy', hint: 'curious', miss: 'shy', streak: 'speedy' };

/** Friends playing now: named ones, in arrival order, up to the number set in Grown-ups. */
export function activeMates(s: State = getState()): Mate[] {
  if (!s.mateOn) return [];
  return MATE_ORDER.slice(0, s.mateCount).map((id) => s.mates.find((m) => m.id === id)).filter((m): m is Mate => !!m);
}

/**
 * The next friend waiting to come off the ship, or null. One friend per visit: the first one right away,
 * the next ones only after he has finished an English game since the last arrival (State.mateDue).
 */
export function missingMate(s: State = getState()): MateId | null {
  if (!s.mateOn) return null;
  const next = MATE_ORDER.slice(0, s.mateCount).find((id) => !s.mates.some((m) => m.id === id)) ?? null;
  return next && (s.mates.length === 0 || s.mateDue) ? next : null;
}

/** A friend's line: the friend's name and voice are filled in. */
export const mateLine = (m: Mate, key: string, args: Record<string, Arg> = {}): Line =>
  voiced(L(key, { mate: mateName(m), ...args }), mateVoice(m.id));

let turn = 0;
function pickMate(ms: Mate[], ev: MateEvent, rnd: () => number): Mate {
  const pref = ms.find((m) => PERSONALITY[m.id] === PREFER[ev]);
  if (pref && rnd() < 0.6) return pref;
  return ms[turn++ % ms.length];
}

/** At most one friend line for this event (or none: chattiness, no friends yet). */
export function mateSay(ev: MateEvent, rnd: () => number = Math.random): Line[] {
  const s = getState();
  const ms = activeMates(s);
  if (!ms.length) return [];
  if (rnd() >= (CHANCE[s.mateChat][ev] ?? 0)) return [];
  return [mateLine(pickMate(ms, ev, rnd), `mate.${ev}`)];
}

/** A friend reacts to a new English word: "Wow!" (app language) — the game then has them say the word in English. */
export function mateWow(rnd: () => number = Math.random): { line: Line; mate: Mate } | null {
  const ms = activeMates();
  if (!ms.length) return null;
  const m = ms[Math.floor(rnd() * ms.length)];
  return { line: mateLine(m, 'mate.wow'), mate: m };
}

/** What a friend says when tapped: depends on their personality, their car and color. */
export const tapLine = (m: Mate): Line => mateLine(m, `mate.tap.${PERSONALITY[m.id]}`, { car: L(`v.${m.v}`), color: L(`color.${m.color}`) });
