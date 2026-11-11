import type { Generator } from '../../engine/round';
import { L } from '../../engine/i18n';
import type { QuickCfg } from '../../content/levels';
import { choices, int, nearNumbers } from './util';

/** Quick Look: rocks flash for a moment (dice patterns), then get covered — how many? */
export const quickLook: Generator<QuickCfg> = (cfg, rng) => {
  const n = int(rng, cfg.min, cfg.max);
  const others = nearNumbers(rng, n, 1, Math.max(cfg.max, cfg.choices + 1), cfg.choices - 1);
  return {
    prompt: L('p.quick.ask'),
    scene: [{ t: 'dots', n }],
    stage: { kind: 'flash', ms: cfg.ms, look: L('p.quick.look') },
    ...choices(rng, { t: 'number', n }, others.map((x) => ({ t: 'number', n: x }))),
    answerSay: L('say.value', { value: L(`num.${n}`) }),
  };
};
