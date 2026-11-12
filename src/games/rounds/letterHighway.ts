import type { Generator } from '../../engine/round';
import { L } from '../../engine/i18n';
import type { LetterCfg } from '../../content/levels';
import { plateName } from '../seq/generators';
import { choices, pick, randomCar, sample } from './util';

export const letterHighway: Generator<LetterCfg> = (cfg, rng, ctx) => {
  const letters = cfg.pool.split('');
  // Round 2 of every game asks for the first letter of the child's name, and it gets "K is for King!".
  const initial = plateName(ctx.childName ?? '')[0];
  const target = initial && letters.includes(initial) && ctx.idx === 1 ? initial : pick(rng, letters);
  const others = sample(rng, letters.filter((x) => x !== target), cfg.choices - 1);
  const label = (ch: string) => (cfg.lower ? ch.toLowerCase() : ch);
  return {
    prompt: L('p.letter.find', { letter: target }),
    scene: [{ t: 'letter', ch: target }],
    ...choices(rng, randomCar(rng, { label: label(target) }), others.map((ch) => randomCar(rng, { label: label(ch) }))),
    answerSay: target === initial ? L('say.initial.kid', { letter: target }) : L('say.value', { value: target }),
  };
};
