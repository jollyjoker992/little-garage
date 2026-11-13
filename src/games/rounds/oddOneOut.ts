import type { Generator } from '../../engine/round';
import { L } from '../../engine/i18n';
import type { OddCfg } from '../../content/levels';
import type { Thing } from '../../content/things';
import { CONSTRUCTION, VEHICLE_IDS, VEHICLES, type VehicleCategory, type VehicleId } from '../../content/vehicles';
import { choices, pick, sample } from './util';
import { CAR_PAINT } from './util';

export const oddOneOut: Generator<OddCfg> = (cfg, rng) => {
  let same: Thing[];
  let odd: Thing;
  if (cfg.mode === 'type') {
    const v = pick(rng, CONSTRUCTION);
    same = [0, 1, 2].map(() => ({ t: 'vehicle', v }));
    odd = { t: 'vehicle', v: 'car', color: pick(rng, CAR_PAINT), body: 'sedan' };
  } else if (cfg.mode === 'color') {
    const [c1, c2] = sample(rng, CAR_PAINT, 2);
    const body = pick(rng, ['sedan', 'sports', 'suv', 'pickup'] as const);
    same = [0, 1, 2].map(() => ({ t: 'vehicle', v: 'car', body, color: c1 }));
    odd = { t: 'vehicle', v: 'car', body, color: c2 };
  } else {
    const groups: Record<VehicleCategory, VehicleId[]> = {
      construction: VEHICLE_IDS.filter((v) => VEHICLES[v].category === 'construction'),
      emergency: VEHICLE_IDS.filter((v) => VEHICLES[v].category === 'emergency'),
      road: VEHICLE_IDS.filter((v) => VEHICLES[v].category === 'road'),
      travel: VEHICLE_IDS.filter((v) => VEHICLES[v].category === 'travel'),
    };
    const [gSame, gOdd] = sample(rng, ['construction', 'emergency'] as VehicleCategory[], 2);
    same = sample(rng, groups[gSame], 3).map((v) => ({ t: 'vehicle', v }));
    odd = { t: 'vehicle', v: pick(rng, groups[gOdd]) };
  }
  return { prompt: L('p.odd'), scene: [], ...choices(rng, odd, same) };
};
