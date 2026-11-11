import type { Generator } from '../../engine/round';
import { L } from '../../engine/i18n';
import type { StoryCfg } from '../../content/levels';
import { choices, int, nearNumbers, pick, randomCar } from './util';

/** Parking Stories: "4 cars are parked. 1 drives away!" — how many now? (adding / taking away). */
export const parkingStory: Generator<StoryCfg> = (cfg, rng) => {
  const op = pick(rng, cfg.ops);
  let n: number, k: number;
  if (op === 'take') {
    n = int(rng, 2, cfg.max);
    k = int(rng, 1, Math.min(cfg.kmax, n - 1));
  } else {
    n = int(rng, 2, cfg.max - 1);
    k = int(rng, 1, Math.min(cfg.kmax, cfg.max - n));
  }
  const answer = op === 'take' ? n - k : n + k;
  const total = op === 'take' ? n : n + k;
  const scene = Array.from({ length: total }, () => randomCar(rng));
  // The cars on the right drive away (take) or park in the empty spots on the right (add).
  const motion = scene.map((_, i) => (op === 'take' ? (i >= n - k ? 'leave' : null) : i >= n ? 'arrive' : null)) as ('leave' | 'arrive' | null)[];
  const move = op === 'take' ? (k === 1 ? L('p.story.leave1') : L('p.story.leaveN', { k: L(`num.${k}`) })) : k === 1 ? L('p.story.arrive1') : L('p.story.arriveN', { k: L(`num.${k}`) });
  const others = nearNumbers(rng, answer, 1, Math.max(cfg.max, cfg.choices + 1), cfg.choices - 1);
  return {
    prompt: L('p.story.ask'),
    scene,
    sceneStyle: 'lot',
    countable: true,
    stage: { kind: 'story', lines: [L('p.story.parked', { n: L(`num.${n}`) }), move], motion },
    ...choices(rng, { t: 'number', n: answer }, others.map((x) => ({ t: 'number', n: x }))),
    answerSay: L('say.value', { value: L(`num.${answer}`) }),
  };
};
