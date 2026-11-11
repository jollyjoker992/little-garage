import type { Generator } from '../../engine/round';
import { L } from '../../engine/i18n';
import type { SizeCfg } from '../../content/levels';
import type { Thing } from '../../content/things';
import { VEHICLE_IDS } from '../../content/vehicles';
import { choices, pick, sample } from './util';

export const bigSmall: Generator<SizeCfg> = (cfg, rng) => {
  const scales = cfg.sizes === 2 ? [1, 0.5] : [1, 0.7, 0.42];
  const wantBig = pick(rng, [true, false]);
  const vs = cfg.mixVehicles ? sample(rng, VEHICLE_IDS, scales.length) : Array(scales.length).fill(pick(rng, VEHICLE_IDS));
  const things: Thing[] = scales.map((scale, i) => ({ t: 'vehicle', v: vs[i], scale }));
  const target = wantBig ? things[0] : things[things.length - 1];
  const key = cfg.sizes === 2 ? (wantBig ? 'p.size.big' : 'p.size.small') : wantBig ? 'p.size.biggest' : 'p.size.smallest';
  return {
    prompt: L(key),
    scene: [],
    ...choices(rng, target, things.filter((x) => x !== target)),
  };
};
