import type { Thing } from '../../content/things';
import { thingKey } from '../../content/things';
import type { EngFindCfg } from '../../content/levels';
import { WORD_BY_ID, type EngWord } from '../../content/english';
import type { Generator } from '../../engine/round';
import { findPrompt, meansLine, phrase2, tryAgainLines, wordLine, zipCheer } from '../../engine/vocab';
import { choices, pick, shuffle } from './util';

const paint = (v: EngWord, c: EngWord): Thing => ({ t: 'vehicle', v: v.v!, color: c.color, ...(v.v === 'car' ? { body: 'sedan' as const } : {}) });

/**
 * Zip's Garage: hear an English word, tap its picture. The stop's level decides the help:
 * ★ meaning + word · ★★ "Đâu là xe…" + word · ★★★ just the word. After two misses the meaning is added.
 * Targets come in the stop's order (round idx), so every word of the stop is asked.
 */
export const engFind: Generator<EngFindCfg> = (cfg, rng, ctx) => {
  const idx = ctx.idx ?? Math.floor(rng() * cfg.targets.length);
  const target = WORD_BY_ID[cfg.targets[idx % cfg.targets.length]];
  const same = cfg.pool.map((id) => WORD_BY_ID[id]).filter((w) => w.kind === target.kind && w.id !== target.id);
  const base = { scene: [], cheer: zipCheer(), tryAgain: tryAgainLines(), wordIds: [target.id], wordLevel: cfg.level, hintLines: cfg.level > 1 ? [wordLine(target), meansLine(target)] : undefined };

  // Colors at ★★★: "red bus!" — the other cards share the color or the vehicle.
  const vehicles = (cfg.vehicles ?? []).map((id) => WORD_BY_ID[id]);
  if (target.kind === 'color' && vehicles.length >= 2 && same.length >= 1) {
    const v = pick(rng, vehicles);
    const v2 = pick(rng, vehicles.filter((x) => x !== v));
    const [c2, c3] = shuffle(rng, same);
    const answer = paint(v, target);
    const seen = new Set([thingKey(answer)]);
    const others = [paint(v, c2), paint(v2, target), paint(v2, c3 ?? c2), paint(v2, c2)]
      .filter((t) => { const k = thingKey(t); if (seen.has(k)) return false; seen.add(k); return true; })
      .slice(0, cfg.choices - 1);
    return {
      ...base,
      prompt: phrase2(target, v),
      promptLines: [phrase2(target, v)],
      ...choices(rng, answer, others),
      answerSay: phrase2(target, v, 'word'),
      answerSfx: v.sfx,
      hintLines: [phrase2(target, v, 'word'), meansLine(target)],
    };
  }

  const others = shuffle(rng, same).slice(0, cfg.choices - 1);
  return {
    ...base,
    prompt: wordLine(target, 'zip'),
    promptLines: findPrompt(cfg.level, target),
    ...choices(rng, target.thing, others.map((w) => w.thing)),
    answerSay: wordLine(target),
    answerSfx: target.sfx,
  };
};
