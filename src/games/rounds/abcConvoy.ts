import type { Generator } from '../../engine/round';
import { L } from '../../engine/i18n';
import type { AbcCfg } from '../../content/levels';
import type { Thing } from '../../content/things';
import { choices, int, sample } from './util';

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const abcConvoy: Generator<AbcCfg> = (cfg, rng) => {
  const start = int(rng, 0, Math.min(cfg.maxStart, 26 - cfg.len));
  const seq = ALPHA.slice(start, start + cfg.len).split('');
  const gap = cfg.gapMiddle ? int(rng, 1, cfg.len - 2) : cfg.len - 1;
  const target = seq[gap];
  const colors = ['red', 'blue', 'green', 'orange', 'purple'] as const;
  const scene: Thing[] = seq.map((ch, i) => ({ t: 'vehicle', v: 'car', body: 'pickup', color: colors[i % colors.length], label: i === gap ? '?' : ch }));
  const near = ALPHA.slice(Math.max(0, start - 2), Math.min(26, start + cfg.len + 2)).split('').filter((x) => x !== target);
  const others = sample(rng, near, cfg.choices - 1);
  return {
    prompt: L(cfg.gapMiddle ? 'p.abc.missing' : 'p.abc.next'),
    scene,
    sceneStyle: 'road',
    ...choices(rng, { t: 'letter', ch: target }, others.map((ch) => ({ t: 'letter', ch }))),
    answerSay: L('say.value', { value: target }),
  };
};
