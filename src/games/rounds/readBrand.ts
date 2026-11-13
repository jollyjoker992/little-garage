import type { Generator } from '../../engine/round';
import { L } from '../../engine/i18n';
import type { ReadCfg } from '../../content/levels';
import { BRANDS, type Brand } from '../../content/brands';
import { brandLine } from '../../engine/brandSay';
import { choices, pick, shuffle } from './util';

/** Read the Brand: a logo, and written names to choose from. L3 adds a name with the same first letter. */
export const readBrand: Generator<ReadCfg> = (cfg, rng) => {
  const hasSibling = (b: Brand) => BRANDS.some((o) => o.id !== b.id && o.letter === b.letter);
  const target = pick(rng, cfg.sameLetter ? BRANDS.filter(hasSibling) : BRANDS);
  const others: Brand[] = [];
  if (cfg.sameLetter) others.push(pick(rng, BRANDS.filter((o) => o.id !== target.id && o.letter === target.letter)));
  const used = new Set([target.letter]);
  for (const b of shuffle(rng, BRANDS)) {
    if (others.length >= cfg.choices - 1) break;
    if (!used.has(b.letter) && b.id !== target.id) {
      used.add(b.letter);
      others.push(b);
    }
  }
  // Every word in the round gets the same size (set by the longest), so the cards look consistent.
  const k = Math.round(Math.min(26, 130 / Math.max(...[target, ...others].map((b) => b.name.length))) * 10) / 10;
  return {
    prompt: brandLine(target),
    promptLines: [L('p.read.find'), brandLine(target)],
    scene: [{ t: 'logo', brand: target.id }],
    ...choices(rng, { t: 'word', text: target.name, k }, others.map((b) => ({ t: 'word', text: b.name, k }))),
    answerSay: brandLine(target),
  };
};
