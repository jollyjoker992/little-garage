import { useSyncExternalStore } from 'react';
import type { ColorId } from '../content/colors';
import type { Level } from '../content/levels';
import type { CarBody, VehicleId } from '../content/vehicles';
import { setKidName, type Lang } from './i18n';
import type { BuildSpec } from '../content/carParts';
import type { Mate } from '../content/classmates';

/** English Street word stars: box 0 = new, 1–3 = the highest level he got it right at (docs/ENGLISH_ZONE.md §5). */
export type WordState = { box: number; seen: number; last: number };
/** English echo in the other zones: off, after right answers / colors, and also when counting. */
export type EngEcho = 'off' | 'words' | 'counting';
/** Unit switch: opens after the badge before it (auto), open now (on), hidden (off). */
export type UnitMode = 'auto' | 'on' | 'off';
export type MateChat = 'quiet' | 'normal' | 'chatty';

export type Sticker = { v: VehicleId; color: ColorId; at: number };
export type Painting = { id: string; art: string; fills: Record<string, string>; at: number };
export type BuiltCar = Partial<BuildSpec> & { id: string; body: CarBody; color: ColorId; at: number };

export type State = {
  lang: Lang;
  rate: number;
  childName: string;
  /** Minutes per session; 0 = no limit. */
  sessionLimit: number;
  /** Parent-pinned level per game (overrides adaptive). */
  pinned: Record<string, Level>;
  /** Adaptive level per game. */
  levels: Record<string, Level>;
  /** Last results per game (true = right on first try). */
  history: Record<string, boolean[]>;
  hidden: string[];
  stickers: Sticker[];
  gallery: Painting[];
  cars: BuiltCar[];
  /** Car names grown-ups typed in Build a Car (newest first). */
  modelNames: string[];
  // ── English Street ──
  words: Record<string, WordState>;
  /** Words a grown-up heard him say on his own ("He said it!"). */
  said: Record<string, boolean>;
  /** Stops passed in each town of the road (all of them = the town's badge). */
  engRoad: Record<string, number>;
  engEcho: EngEcho;
  engUnits: Record<string, UnitMode>;
  /** Named classmates, in the order they arrived. */
  mates: Mate[];
  mateOn: boolean;
  mateCount: number;
  mateChat: MateChat;
  /** A new friend may come off the ship: true at the start and after each finished English game (one friend per visit). */
  mateDue: boolean;
};

const KEY = 'little-garage:v1';

const defaults = (): State => ({
  lang: typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('vi') ? 'vi' : 'en',
  rate: 0.9,
  childName: '',
  sessionLimit: 0,
  pinned: {},
  levels: {},
  history: {},
  hidden: [],
  stickers: [],
  gallery: [],
  cars: [],
  modelNames: [],
  words: {},
  said: {},
  engRoad: {},
  engEcho: 'off',
  engUnits: {},
  mates: [],
  mateOn: true,
  mateCount: 2,
  mateChat: 'normal',
  mateDue: true,
});

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const st = { ...defaults(), ...JSON.parse(raw) };
      if (st.lang !== 'en' && st.lang !== 'vi') st.lang = defaults().lang; // a damaged save must not stop the game from starting
      return st;
    }
  } catch {
    /* private mode / no storage: play without saving */
  }
  return defaults();
}

let state: State = load();
setKidName(state.childName);
const subs = new Set<() => void>();

export const getState = () => state;

export function update(fn: (s: State) => Partial<State>) {
  state = { ...state, ...fn(state) };
  setKidName(state.childName);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  subs.forEach((f) => f());
}

/** Clears progress but keeps the settings and the classmates he named. */
export function resetProgress() {
  update((s) => ({
    ...defaults(), lang: s.lang, rate: s.rate, childName: s.childName, sessionLimit: s.sessionLimit,
    engEcho: s.engEcho, engUnits: s.engUnits, mates: s.mates, mateOn: s.mateOn, mateCount: s.mateCount, mateChat: s.mateChat, mateDue: s.mateDue,
  }));
}

/** English Street only: forget which words he knows (switches and classmates stay). */
export function resetEnglish() {
  update((s) => {
    const levels = { ...s.levels }, history = { ...s.history };
    for (const k of Object.keys(levels)) if (k.startsWith('eng')) delete levels[k];
    for (const k of Object.keys(history)) if (k.startsWith('eng')) delete history[k];
    return { words: {}, said: {}, engRoad: {}, levels, history };
  });
}

function subscribe(f: () => void) {
  subs.add(f);
  return () => subs.delete(f);
}

/** Select a primitive or a stable sub-object of state. */
export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => sel(state), () => sel(state));
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
