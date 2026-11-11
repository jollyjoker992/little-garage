import type { Generator } from '../../engine/round';
import { L } from '../../engine/i18n';
import type { NumberRoadCfg } from '../../content/levels';
import type { Thing } from '../../content/things';
import { choices, int, nearNumbers } from './util';

export const numberRoad: Generator<NumberRoadCfg> = (cfg, rng) => {
  const start = int(rng, 1, Math.max(1, cfg.max - cfg.len + 1));
  const seq = Array.from({ length: cfg.len }, (_, i) => start + i);
  const gap = cfg.gapMiddle ? int(rng, 1, cfg.len - 2) : cfg.len - 1;
  const n = seq[gap];
  const scene: Thing[] = seq.map((x, i) => (i === gap ? { t: 'cone', color: 'orange', label: '?' } : { t: 'cone', color: 'orange', label: String(x) }));
  const others = nearNumbers(rng, n, 1, Math.max(10, cfg.max), cfg.choices - 1);
  return {
    prompt: L(cfg.gapMiddle ? 'p.numberRoad.missing' : 'p.numberRoad.next'),
    scene,
    sceneStyle: 'road',
    ...choices(rng, { t: 'number', n }, others.map((x) => ({ t: 'number', n: x }))),
    answerSay: L('say.value', { value: L(`num.${n}`) }),
  };
};
