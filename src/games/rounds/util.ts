import { makeChoices as mk } from '../../engine/round';
import { int, pick, sample, shuffle, type Rng } from '../../engine/rng';
import type { Thing } from '../../content/things';
import { CAR_BODIES } from '../../content/vehicles';
import { COLOR_IDS, type ColorId } from '../../content/colors';

export { int, pick, sample, shuffle };
export const choices = (rng: Rng, answer: Thing, distractors: Thing[]) => mk(rng, answer, distractors, shuffle);

/** k distinct numbers in [lo, hi] other than n, preferring close ones. */
export function nearNumbers(rng: Rng, n: number, lo: number, hi: number, k: number): number[] {
  const pool = [];
  for (let x = lo; x <= hi; x++) if (x !== n) pool.push(x);
  return shuffle(rng, pool)
    .sort((a, b) => Math.abs(a - n) - Math.abs(b - n))
    .slice(0, Math.min(k, pool.length));
}

const CAR_COLORS: ColorId[] = COLOR_IDS.filter((c) => c !== 'white' && c !== 'sky' && c !== 'black');
export const randomCar = (rng: Rng, extra: Partial<Extract<Thing, { t: 'vehicle' }>> = {}): Thing => ({
  t: 'vehicle', v: 'car', color: pick(rng, CAR_COLORS), body: pick(rng, CAR_BODIES), ...extra,
});
export const CAR_PAINT = CAR_COLORS;
