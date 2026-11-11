import type { Generator } from '../../engine/round';
import { L } from '../../engine/i18n';
import type { ShapeCfg } from '../../content/levels';
import { OBJECT_SHAPE, type ObjectId, type ShapeId } from '../../content/shapes';
import type { Thing } from '../../content/things';
import { choices, pick, sample } from './util';

const COLORS = ['red', 'blue', 'green', 'orange', 'purple', 'pink'] as const;

export const shapeGarage: Generator<ShapeCfg> = (cfg, rng) => {
  const colors = sample(rng, COLORS, cfg.choices);
  const shape = (s: ShapeId, i: number): Thing => ({ t: 'shape', shape: s, color: colors[i] });
  if (cfg.objects) {
    const obj = pick(rng, Object.keys(OBJECT_SHAPE) as ObjectId[]);
    const target = OBJECT_SHAPE[obj];
    const others = sample(rng, cfg.shapes.filter((s) => s !== target), cfg.choices - 1);
    return {
      prompt: L('p.shape.object', { object: L(`obj.${obj}`) }),
      scene: [{ t: 'object', obj }],
      ...choices(rng, shape(target, 0), others.map((s, i) => shape(s, i + 1))),
      answerSay: L('say.value', { value: L(`shape.${target}`) }),
    };
  }
  const [target, ...others] = sample(rng, cfg.shapes, cfg.choices);
  return {
    prompt: L('p.shape.find', { shape: L(`shape.${target}`) }),
    scene: [],
    ...choices(rng, shape(target, 0), others.map((s, i) => shape(s, i + 1))),
  };
};
