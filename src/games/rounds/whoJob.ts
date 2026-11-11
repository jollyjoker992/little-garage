import type { Generator } from '../../engine/round';
import { L } from '../../engine/i18n';
import type { JobCfg } from '../../content/levels';
import { choices, pick, sample } from './util';

export const whoJob: Generator<JobCfg> = (cfg, rng) => {
  const v = pick(rng, cfg.pool);
  const others = sample(rng, cfg.pool.filter((x) => x !== v), cfg.choices - 1);
  return {
    prompt: L(`job.${v}`),
    scene: [],
    ...choices(rng, { t: 'vehicle', v }, others.map((x) => ({ t: 'vehicle', v: x }))),
    answerSay: L('say.vehicle', { vehicle: L(`v.${v}`) }),
  };
};
