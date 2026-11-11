import type { Generator } from '../../engine/round';
import { L } from '../../engine/i18n';
import type { LetterCfg } from '../../content/levels';
import { choices, pick, randomCar, sample } from './util';

export const letterHighway: Generator<LetterCfg> = (cfg, rng) => {
  const letters = cfg.pool.split('');
  const target = pick(rng, letters);
  const others = sample(rng, letters.filter((x) => x !== target), cfg.choices - 1);
  const label = (ch: string) => (cfg.lower ? ch.toLowerCase() : ch);
  return {
    prompt: L('p.letter.find', { letter: target }),
    scene: [{ t: 'letter', ch: target }],
    ...choices(rng, randomCar(rng, { label: label(target) }), others.map((ch) => randomCar(rng, { label: label(ch) }))),
    answerSay: L('say.value', { value: target }),
  };
};
