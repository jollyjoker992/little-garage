import type { Generator, Round } from '../../engine/round';
import { DICTS, L } from '../../engine/i18n';
import type { BrandLetterCfg } from '../../content/levels';
import { BRANDS, spoken } from '../../content/brands';
import type { Thing } from '../../content/things';
import { CONSTRUCTION, VEHICLES } from '../../content/vehicles';
import { choices, pick, sample, shuffle } from './util';

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

type Named = { thing: Thing; letter: string; name: string | ReturnType<typeof L> };

export const brandLetters: Generator<BrandLetterCfg> = (cfg, rng, ctx): Round => {
  const mode = pick(rng, cfg.modes);
  // Every logo/vehicle shows its written name, so he can see the first letter.
  const pool: Named[] = BRANDS.map((b) => ({ thing: { t: 'logo', brand: b.id, caption: b.name }, letter: b.letter, name: spoken(b) }));
  // Vehicle names start with different letters in Vietnamese ("xe ..."), so English only.
  if (cfg.vehicles && ctx.lang === 'en' && mode === 'toLetter') {
    for (const v of CONSTRUCTION) {
      const en = String(DICTS.en[`v.${v}`]);
      pool.push({ thing: { t: 'vehicle', v, caption: en[0].toUpperCase() + en.slice(1) }, letter: VEHICLES[v].letterEn, name: L(`v.${v}`) });
    }
  }
  const target = pick(rng, pool);

  if (mode === 'toLetter') {
    const others = sample(rng, ALPHA.filter((x) => x !== target.letter), cfg.choices - 1);
    return {
      prompt: L('p.brandLetter.toLetter', { name: target.name }),
      scene: [target.thing],
      ...choices(rng, { t: 'letter', ch: target.letter }, others.map((ch) => ({ t: 'letter', ch }))),
      answerSay: L('p.brandLetter.says', { name: target.name, letter: target.letter }),
    };
  }
  // toBrand: distractors must start with other (distinct) letters.
  const seen = new Set([target.letter]);
  const others: Named[] = [];
  for (const b of shuffle(rng, pool)) {
    if (others.length >= cfg.choices - 1) break;
    if (!seen.has(b.letter)) {
      seen.add(b.letter);
      others.push(b);
    }
  }
  return {
    prompt: L('p.brandLetter.toBrand', { letter: target.letter }),
    scene: [{ t: 'letter', ch: target.letter }],
    ...choices(rng, target.thing, others.map((o) => o.thing)),
    answerSay: L('p.brandLetter.says', { name: target.name, letter: target.letter }),
  };
};
