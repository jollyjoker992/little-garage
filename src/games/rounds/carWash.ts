import type { Generator, Round } from '../../engine/round';
import { L } from '../../engine/i18n';
import type { WashCfg } from '../../content/levels';
import type { Thing } from '../../content/things';
import type { ColorId } from '../../content/colors';
import { choices, pick, sample, shuffle } from './util';

export const carWash: Generator<WashCfg> = (cfg, rng): Round => {
  if (!cfg.twoAttr) {
    const [target, ...others] = sample(rng, cfg.colors, cfg.choices);
    const body = pick(rng, ['sedan', 'sports', 'suv'] as const);
    const car = (color: ColorId): Thing => ({ t: 'vehicle', v: 'car', body, color });
    return {
      prompt: L('p.wash.find', { color: L(`color.${target}`) }),
      scene: [],
      ...choices(rng, car(target), others.map(car)),
      answerSay: L('say.value', { value: L(`color.${target}`) }),
    };
  }
  // Two attributes: size + color (+ vehicle type). Distractors share one attribute with the answer.
  const [c1, c2] = sample(rng, cfg.colors, 2);
  const vtype = pick(rng, ['car', 'dumpTruck'] as const);
  const otherType = vtype === 'car' ? 'dumpTruck' : 'car';
  const big = pick(rng, [true, false]);
  const mk = (v: 'car' | 'dumpTruck', color: ColorId, isBig: boolean): Thing => ({ t: 'vehicle', v, color, scale: isBig ? 1 : 0.6, ...(v === 'car' ? { body: 'sedan' as const } : { load: 0 }) });
  const target = mk(vtype, c1, big);
  const distractors = shuffle(rng, [mk(vtype, c1, !big), mk(vtype, c2, big), mk(otherType, c1, big)]).slice(0, cfg.choices - 1);
  return {
    prompt: L('p.wash.two', { size: L(big ? 'size.big' : 'size.small'), color: L(`color.${c1}`), vehicle: L(`v.${vtype}`) }),
    scene: [],
    ...choices(rng, target, distractors),
  };
};
