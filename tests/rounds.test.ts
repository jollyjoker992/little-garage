import { describe, expect, it } from 'vitest';
import { LEVELS, type Level } from '../src/content/levels';
import { thingKey } from '../src/content/things';
import { DICTS, lineKeys, type Lang } from '../src/engine/i18n';
import { makeRng } from '../src/engine/rng';
import { GENERATORS } from '../src/games/rounds';

const SEEDS = 250;
const hasKey = (k: string) => k in DICTS.en && k in DICTS.vi;

describe.each(Object.keys(GENERATORS))('%s', (id) => {
  const levels = (LEVELS as Record<string, Record<Level, Record<string, unknown>>>)[id];

  it('has configs for levels 1-3 and intro lines', () => {
    expect(levels, 'missing LEVELS entry').toBeDefined();
    for (const lv of [1, 2, 3] as Level[]) expect(levels[lv]).toBeDefined();
    expect(hasKey(`game.${id}`)).toBe(true);
    expect(hasKey(`game.${id}.intro`)).toBe(true);
  });

  for (const lv of [1, 2, 3] as Level[]) {
    for (const lang of ['en', 'vi'] as Lang[]) {
      it(`level ${lv} (${lang}) always makes a valid round`, () => {
        for (let seed = 1; seed <= SEEDS; seed++) {
          const r = GENERATORS[id](levels[lv], makeRng(seed), { lang, level: lv });
          const ids = r.choices.map((c) => c.id);
          expect(new Set(ids).size, 'duplicate ids').toBe(ids.length);
          expect(r.choices.length).toBeGreaterThanOrEqual(2);
          expect(r.choices.length).toBeLessThanOrEqual(4);
          const ans = r.choices.find((c) => c.id === r.answer);
          expect(ans, `seed ${seed}: answer not among choices`).toBeDefined();
          // The answer must look different from every other choice.
          const ak = thingKey(ans!.thing);
          expect(r.choices.filter((c) => thingKey(c.thing) === ak).length, `seed ${seed}: answer has a look-alike`).toBe(1);
          const stageLines = !r.stage ? [] : r.stage.kind === 'story' ? r.stage.lines : r.stage.kind === 'vanish' ? [r.stage.look, r.stage.close] : [r.stage.look];
          for (const line of [r.prompt, r.answerSay, ...stageLines].filter(Boolean)) {
            for (const k of lineKeys(line!)) expect(hasKey(k), `missing i18n key ${k}`).toBe(true);
          }
          const cfgChoices = levels[lv].choices as number | undefined;
          if (cfgChoices) expect(r.choices.length, `seed ${seed}`).toBe(cfgChoices);
        }
      });
    }
  }
});

describe('specific rules', () => {
  it('count: number of cars matches the answer and stays in range', () => {
    for (const lv of [1, 2, 3] as Level[]) {
      const cfg = LEVELS.count[lv];
      for (let seed = 1; seed <= SEEDS; seed++) {
        const r = GENERATORS.count(cfg, makeRng(seed), { lang: 'en', level: lv });
        const ans = r.choices.find((c) => c.id === r.answer)!.thing as { n: number };
        expect(ans.n).toBe(r.scene.length);
        expect(ans.n).toBeGreaterThanOrEqual(cfg.min);
        expect(ans.n).toBeLessThanOrEqual(cfg.max);
      }
    }
  });
  it('brandLetters toBrand: only one choice starts with the letter', async () => {
    const { BRAND_BY_ID } = await import('../src/content/brands');
    for (let seed = 1; seed <= SEEDS; seed++) {
      const r = GENERATORS.brandLetters(LEVELS.brandLetters[2], makeRng(seed), { lang: 'en', level: 2 });
      const letter = (r.scene[0] as { ch: string }).ch;
      const starting = r.choices.filter((c) => c.thing.t === 'logo' && BRAND_BY_ID[c.thing.brand].letter === letter);
      expect(starting.length).toBe(1);
    }
  });
});

describe('new game rules', () => {
  it('readBrand L3: exactly one wrong word shares the first letter; L1/L2: none do', async () => {
    const { BRANDS } = await import('../src/content/brands');
    const letterOf = (name: string) => BRANDS.find((b) => b.name === name)!.letter;
    for (const lv of [1, 2, 3] as Level[]) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const r = GENERATORS.readBrand(LEVELS.readBrand[lv], makeRng(seed), { lang: 'en', level: lv });
        const words = r.choices.map((c) => (c.thing as { text: string }).text);
        const ans = (r.choices.find((c) => c.id === r.answer)!.thing as { text: string }).text;
        const same = words.filter((w) => w !== ans && letterOf(w) === letterOf(ans)).length;
        expect(same, `L${lv} seed ${seed}: ${words}`).toBe(lv === 3 ? 1 : 0);
      }
    }
  });
  it('sorting: the right garage is the vehicle\'s group', () => {
    const group: Record<string, string> = { excavator: 'construction', bulldozer: 'construction', dumpTruck: 'construction', crane: 'construction', mixer: 'construction', roller: 'construction', fireTruck: 'emergency', ambulance: 'emergency', policeCar: 'emergency', car: 'road', bus: 'road' };
    for (const lv of [1, 2, 3] as Level[]) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const r = GENERATORS.sorting(LEVELS.sorting[lv], makeRng(seed), { lang: 'en', level: lv });
        const v = r.scene[0] as { v: string; color?: string };
        const sign = (r.choices.find((c) => c.id === r.answer)!.thing as { sign: string }).sign;
        expect(sign).toBe(lv === 1 ? v.color : group[v.v]);
        expect(r.choices.length).toBe(lv === 3 ? 3 : 2);
      }
    }
  });

  it('parkingStory: the answer is what is left in the lot after the story', () => {
    for (const lv of [1, 2, 3] as Level[]) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const r = GENERATORS.parkingStory(LEVELS.parkingStory[lv], makeRng(seed), { lang: 'en', level: lv });
        if (r.stage?.kind !== 'story') throw new Error('no story');
        const left = r.stage.motion.filter((m) => m !== 'leave').length;
        expect((r.choices.find((c) => c.id === r.answer)!.thing as { n: number }).n).toBe(left);
        expect(left).toBeLessThanOrEqual(LEVELS.parkingStory[lv].max);
      }
    }
  });
  it('whoLeft: the answer is the vehicle that vanished', () => {
    for (const lv of [1, 2, 3] as Level[]) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const r = GENERATORS.whoLeft(LEVELS.whoLeft[lv], makeRng(seed), { lang: 'en', level: lv });
        if (r.stage?.kind !== 'vanish') throw new Error('no vanish');
        expect(r.choices.find((c) => c.id === r.answer)!.thing).toEqual(r.scene[r.stage.index]);
      }
    }
  });

  it('readBrand: all words in a round share one size', () => {
    for (let seed = 1; seed <= SEEDS; seed++) {
      const r = GENERATORS.readBrand(LEVELS.readBrand[3], makeRng(seed), { lang: 'en', level: 3 });
      expect(new Set(r.choices.map((c) => (c.thing as { k?: number }).k)).size).toBe(1);
    }
  });
});

