import type { Generator } from '../../engine/round';
import { L } from '../../engine/i18n';
import type { WhoLeftCfg } from '../../content/levels';
import type { Thing } from '../../content/things';
import { CONSTRUCTION, VEHICLE_IDS } from '../../content/vehicles';
import { choices, int, sample, shuffle } from './util';

/** Who Drove Away?: remember the parked vehicles; the door closes; one leaves — which one? */
export const whoLeft: Generator<WhoLeftCfg> = (cfg, rng) => {
  const vs = cfg.similar ? sample(rng, CONSTRUCTION, cfg.count) : sample(rng, VEHICLE_IDS, cfg.count);
  const scene: Thing[] = vs.map((v) => ({ t: 'vehicle', v }));
  const index = int(rng, 0, cfg.count - 1);
  const others = shuffle(rng, scene.filter((_, i) => i !== index)).slice(0, 3); // at most 4 choices
  return {
    prompt: L('p.who.ask'),
    scene,
    sceneStyle: 'road',
    stage: { kind: 'vanish', ms: cfg.ms, index, look: L('p.who.look'), close: L('p.who.close') },
    ...choices(rng, scene[index], others),
    answerSay: L('say.vehicle', { vehicle: L(`v.${vs[index]}`) }),
  };
};
