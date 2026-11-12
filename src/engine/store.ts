import { useSyncExternalStore } from 'react';
import type { ColorId } from '../content/colors';
import type { Level } from '../content/levels';
import type { CarBody, VehicleId } from '../content/vehicles';
import { setKidName, type Lang } from './i18n';
import type { BuildSpec } from '../content/carParts';

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
});

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaults(), ...JSON.parse(raw) };
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

export function resetProgress() {
  update((s) => ({ ...defaults(), lang: s.lang, rate: s.rate, childName: s.childName, sessionLimit: s.sessionLimit }));
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
