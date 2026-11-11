import type { Level } from '../content/levels';
import { getState, update } from './store';

const WINDOW = 5;
const UP_NEED = 4; // 4 of the last 5 right on the first try → level up
const DOWN_STREAK = 3; // 3 misses in a row → level down

export function levelFor(gameId: string): Level {
  const s = getState();
  return s.pinned[gameId] ?? s.levels[gameId] ?? 1;
}

/** Record one round. Returns 'up' / 'down' when the level changed. */
export function recordRound(gameId: string, firstTry: boolean): 'up' | 'down' | null {
  const s = getState();
  const hist = [...(s.history[gameId] ?? []), firstTry].slice(-WINDOW);
  let change: 'up' | 'down' | null = null;
  let level = s.levels[gameId] ?? 1;
  if (!s.pinned[gameId]) {
    if (hist.length >= WINDOW && hist.filter(Boolean).length >= UP_NEED && level < 3) {
      level = (level + 1) as Level;
      change = 'up';
    } else if (hist.length >= DOWN_STREAK && hist.slice(-DOWN_STREAK).every((x) => !x) && level > 1) {
      level = (level - 1) as Level;
      change = 'down';
    }
  }
  update((st) => ({
    history: { ...st.history, [gameId]: change ? [] : hist },
    levels: { ...st.levels, [gameId]: level },
  }));
  return change;
}
