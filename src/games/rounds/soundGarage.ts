import type { Generator } from '../../engine/round';
import { L } from '../../engine/i18n';
import type { SoundCfg } from '../../content/levels';
import { SOUND_VEHICLES, VEHICLES } from '../../content/vehicles';
import { choices, pick, sample } from './util';

export const soundGarage: Generator<SoundCfg> = (cfg, rng) => {
  const v = pick(rng, SOUND_VEHICLES);
  const others = sample(rng, SOUND_VEHICLES.filter((x) => x !== v), cfg.choices - 1);
  return {
    prompt: L('p.sound'),
    promptSfx: VEHICLES[v].sound,
    scene: [{ t: 'speaker' }],
    ...choices(rng, { t: 'vehicle', v }, others.map((x) => ({ t: 'vehicle', v: x }))),
    answerSay: L('say.vehicle', { vehicle: L(`v.${v}`) }),
  };
};
