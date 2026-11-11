import type { Generator } from '../../engine/round';
import { L } from '../../engine/i18n';
import type { ShadowCfg } from '../../content/levels';
import { VEHICLE_IDS, VEHICLES } from '../../content/vehicles';
import { choices, pick, sample, shuffle } from './util';

export const mechanic: Generator<ShadowCfg> = (cfg, rng) => {
  const v = pick(rng, VEHICLE_IDS);
  const rest = VEHICLE_IDS.filter((x) => x !== v);
  // "similar": prefer vehicles from the same category (harder).
  const others = cfg.similar
    ? [...shuffle(rng, rest.filter((x) => VEHICLES[x].category === VEHICLES[v].category)), ...shuffle(rng, rest.filter((x) => VEHICLES[x].category !== VEHICLES[v].category))].slice(0, cfg.choices - 1)
    : sample(rng, rest.filter((x) => VEHICLES[x].category !== VEHICLES[v].category), cfg.choices - 1);
  return {
    prompt: L('p.shadow'),
    scene: [{ t: 'vehicle', v, shadow: true }],
    ...choices(rng, { t: 'vehicle', v }, others.map((x) => ({ t: 'vehicle', v: x }))),
    answerSay: L('say.vehicle', { vehicle: L(`v.${v}`) }),
  };
};
