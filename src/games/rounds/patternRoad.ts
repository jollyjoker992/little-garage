import type { Generator } from '../../engine/round';
import { L } from '../../engine/i18n';
import type { PatternCfg } from '../../content/levels';
import type { Thing } from '../../content/things';
import { VEHICLE_IDS } from '../../content/vehicles';
import { choices, sample } from './util';

const CONE_COLORS = ['red', 'blue', 'yellow', 'green', 'purple', 'orange'] as const;

export const patternRoad: Generator<PatternCfg> = (cfg, rng) => {
  const unit = cfg.pattern.split('').map((ch) => ch.charCodeAt(0) - 65); // AAB → [0,0,1]
  const distinct = Math.max(...unit) + 1;
  const tokens: Thing[] = cfg.vehicles
    ? sample(rng, VEHICLE_IDS, Math.max(distinct, cfg.choices)).map((v) => ({ t: 'vehicle', v }))
    : sample(rng, CONE_COLORS, Math.max(distinct, cfg.choices)).map((color) => ({ t: 'cone', color }));
  const seq = Array.from({ length: unit.length * 2 }, (_, i) => unit[i % unit.length]);
  const answerIdx = seq[seq.length - 1];
  const scene: Thing[] = seq.slice(0, -1).map((i) => tokens[i]);
  scene.push({ t: 'mystery' });
  const others = tokens.filter((_, i) => i !== answerIdx).slice(0, cfg.choices - 1);
  return {
    prompt: L('p.pattern'),
    scene,
    sceneStyle: 'road',
    ...choices(rng, { ...tokens[answerIdx] }, others),
  };
};
