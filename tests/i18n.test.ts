import { describe, expect, it } from 'vitest';
import { en } from '../src/content/i18n/en';
import { vi } from '../src/content/i18n/vi';
import { L, setKidName, t } from '../src/engine/i18n';
import { GENERATORS } from '../src/games/rounds';
import { LEVELS } from '../src/content/levels';
import { makeRng } from '../src/engine/rng';

const placeholders = (v: string | string[]) =>
  [...new Set((Array.isArray(v) ? v : [v]).flatMap((s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1])))].sort();

describe('voice scripts', () => {
  it('en and vi have the same keys', () => {
    expect(Object.keys(vi).sort()).toEqual(Object.keys(en).sort());
  });
  it('en and vi use the same {placeholders} per key', () => {
    for (const k of Object.keys(en)) expect(placeholders(vi[k]), k).toEqual(placeholders(en[k]));
  });
  it('no empty lines', () => {
    for (const d of [en, vi]) for (const [k, v] of Object.entries(d)) expect((Array.isArray(v) ? v : [v]).every((s) => s.trim()), k).toBe(true);
  });
});

describe("the child's name", () => {
  const all = (v: string | string[]) => (Array.isArray(v) ? v : [v]);
  it('{kid} only appears in ".kid" lines', () => {
    for (const d of [en, vi]) for (const [k, v] of Object.entries(d)) {
      if (all(v).some((x) => x.includes('{kid}'))) expect(k.endsWith('.kid'), k).toBe(true);
    }
  });
  it('every ".kid" line uses {kid} somewhere and keeps the slots of its plain line', () => {
    for (const d of [en, vi]) for (const [k, v] of Object.entries(d)) {
      if (!k.endsWith('.kid')) continue;
      expect(all(v).some((x) => x.includes('{kid}')), k).toBe(true);
      const base = d[k.slice(0, -4)];
      if (base) expect(placeholders(v).filter((p) => p !== 'kid'), k).toEqual(placeholders(base));
    }
  });
  it('says the plain line without a name and the personal line with one', () => {
    try {
      setKidName('');
      expect(t('en', L('levelUp'))).toBe("Level up! You're getting so good!");
      expect(t('en', L('app.title'))).toBe('Little Garage');
      setKidName('  King ');
      expect(t('en', L('levelUp'))).toBe("Level up! King, you're getting so good!");
      expect(t('en', L('app.title'))).toBe("King's Garage");
      expect(t('vi', L('app.title'))).toBe('Gara của King');
      expect(t('vi', L('reward', { color: L('color.red'), vehicle: L('v.bus') }))).toBe('King được một sticker mới! ' + t('vi', L('v.bus')) + ' màu ' + t('vi', L('color.red')) + '!');
      for (let i = 0; i < 20; i++) expect(t('en', L('cheer'), () => i / 20)).not.toContain('{kid}');
    } finally {
      setKidName('');
    }
  });
  it('Letter Highway: round 2 asks for the first letter of the name, which is "for" the child', () => {
    const cfg = LEVELS.letterHighway[2];
    for (let seed = 1; seed <= 100; seed++) {
      for (const idx of [0, 1, 2, 3, 4]) {
        const r = GENERATORS.letterHighway(cfg, makeRng(seed), { lang: 'en', level: 2, childName: 'King', idx });
        const ch = r.scene[0].t === 'letter' ? r.scene[0].ch : '';
        if (idx === 1) expect(ch).toBe('K');
        expect(r.answerSay?.key).toBe(ch === 'K' ? 'say.initial.kid' : 'say.value');
      }
      // No name, or a first letter not in the level's letters: plain rounds
      expect(GENERATORS.letterHighway(cfg, makeRng(seed), { lang: 'en', level: 2, idx: 1 }).answerSay?.key).toBe('say.value');
      expect(GENERATORS.letterHighway(LEVELS.letterHighway[1], makeRng(seed), { lang: 'en', level: 1, childName: 'King', idx: 1 }).answerSay?.key).toBe('say.value');
    }
  });
});
