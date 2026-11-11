import type { Generator, Round } from '../../engine/round';
import { L } from '../../engine/i18n';
import type { DockCfg } from '../../content/levels';
import type { Thing } from '../../content/things';
import { choices, int, nearNumbers, pick, sample } from './util';

const BEDS = ['yellow', 'orange', 'green', 'blue', 'red', 'purple'] as const;
const truck = (load: number, color?: (typeof BEDS)[number]): Thing => ({ t: 'vehicle', v: 'dumpTruck', load, ...(color ? { color } : {}) });

export const loadingDock: Generator<DockCfg> = (cfg, rng): Round => {
  if (cfg.mode === 'add') {
    const a = int(rng, 1, cfg.max - 1);
    const b = int(rng, 1, cfg.max - a);
    const n = a + b;
    const others = nearNumbers(rng, n, 1, cfg.max + 1, 2);
    return {
      prompt: L('p.dock.add'),
      scene: [truck(a), truck(b)],
      sceneStyle: 'pair',
      countable: false,
      ...choices(rng, { t: 'number', n }, others.map((x) => ({ t: 'number', n: x }))),
      answerSay: L('say.value', { value: L(`num.${n}`) }),
    };
  }
  let a: number, b: number;
  do {
    a = int(rng, 1, cfg.max);
    b = int(rng, 1, cfg.max);
  } while (Math.abs(a - b) < cfg.minDiff);
  const fewer = cfg.mode === 'moreFewer' && pick(rng, [true, false]);
  const [ans, other] = fewer ? [Math.min(a, b), Math.max(a, b)] : [Math.max(a, b), Math.min(a, b)];
  const [c1, c2] = sample(rng, BEDS, 2);
  return {
    prompt: L(fewer ? 'p.dock.fewer' : 'p.dock.more'),
    scene: [],
    ...choices(rng, truck(ans, c1), [truck(other, c2)]),
    answerSay: L('say.value', { value: L(`num.${ans}`) }),
  };
};
