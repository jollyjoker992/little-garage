export type Rng = () => number;

/** Small seeded PRNG (mulberry32) so round generators are testable. */
export function makeRng(seed: number = Date.now()): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const int = (r: Rng, min: number, max: number) => min + Math.floor(r() * (max - min + 1));
export const pick = <T>(r: Rng, arr: readonly T[]): T => arr[Math.floor(r() * arr.length)];

export function shuffle<T>(r: Rng, arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const sample = <T>(r: Rng, arr: readonly T[], n: number): T[] => shuffle(r, arr).slice(0, n);
