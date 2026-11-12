import { L } from '../../engine/i18n';
import { pick, sample, shuffle } from '../../engine/rng';
import { DEFAULT_ROUNDS, type PlateCfg, type SizeOrderCfg } from '../../content/levels';
import type { Thing } from '../../content/things';
import { VEHICLE_IDS } from '../../content/vehicles';
import type { SeqGenerator } from './types';

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/** "Bảo Anh" → "BAOANH": plates only have plain A–Z letters. */
export function plateName(name: string): string {
  return name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'D').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8);
}

/** License Plate: copy the word on the plate by tapping its letters in order.
 *  With useName and a name set, the last plate of the game is the child's own name. */
export const licensePlate: SeqGenerator<PlateCfg> = (cfg, rng, ctx) => {
  const lastRound = (ctx.idx ?? 0) === (cfg.rounds ?? DEFAULT_ROUNDS) - 1;
  const own = cfg.useName && lastRound ? plateName(ctx.childName) : '';
  const mine = own.length >= 2;
  const word = mine ? own : pick(rng, cfg.words);
  const letters = word.split('');
  const extras = sample(rng, ALPHA.filter((c) => !letters.includes(c)), cfg.extras);
  const pool = shuffle(rng, [...letters, ...extras].map((ch, i) => ({ id: `t${i}`, key: ch, thing: { t: 'letter', ch } as Thing })));
  return {
    prompt: mine ? L('p.plate.name.kid') : L('p.plate.make', { word }),
    model: word,
    layout: 'plate',
    pool,
    order: letters,
    sayItem: (i) => L('say.value', { value: letters[i] }),
    hint: (i) => L('p.plate.find', { letter: letters[i] }),
    done: mine ? L('p.plate.nameDone.kid') : L('p.plate.done', { word }),
  };
};

const SCALES = [0.42, 0.6, 0.8, 1];

/** Size Parking: park the vehicles in order of size (small → big, or big → small at L3). */
export const sizeOrder: SeqGenerator<SizeOrderCfg> = (cfg, rng) => {
  const v = pick(rng, VEHICLE_IDS.filter((x) => x !== 'car'));
  const scales = cfg.count === 3 ? [0.45, 0.72, 1] : SCALES;
  const ranked = cfg.bigFirst ? [...scales].reverse() : scales;
  const pool = shuffle(rng, scales.map((scale, i) => ({ id: `v${i}`, key: String(scale), thing: { t: 'vehicle', v, scale } as Thing })));
  return {
    prompt: L(cfg.bigFirst ? 'p.size.orderRev' : 'p.size.order'),
    layout: 'parking',
    pool,
    order: ranked.map(String),
    sayItem: (i) => L(`num.${i + 1}`),
    hint: () => L(cfg.bigFirst ? 'p.size.nextBig' : 'p.size.nextSmall'),
    done: L(cfg.bigFirst ? 'p.size.doneRev' : 'p.size.done'),
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SEQ_GENERATORS: Record<string, SeqGenerator<any>> = { licensePlates: licensePlate, sizeOrder };
