import type { Generator } from '../../engine/round';
import { L } from '../../engine/i18n';
import type { CountCfg } from '../../content/levels';
import { choices, int, nearNumbers, randomCar } from './util';

export const count: Generator<CountCfg> = (cfg, rng) => {
  const n = int(rng, cfg.min, cfg.max);
  const scene = Array.from({ length: n }, () => randomCar(rng));
  const others = nearNumbers(rng, n, 1, Math.max(cfg.max, cfg.choices), cfg.choices - 1);
  return {
    prompt: L('p.count'),
    scene,
    sceneStyle: 'lot',
    countable: true,
    ...choices(rng, { t: 'number', n }, others.map((x) => ({ t: 'number', n: x }))),
    answerSay: L('say.value', { value: L(`num.${n}`) }),
  };
};
