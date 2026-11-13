import { describe, expect, it } from 'vitest';
import { LEVELS, type Level } from '../src/content/levels';
import { DICTS, lineKeys, type Lang } from '../src/engine/i18n';
import { makeRng } from '../src/engine/rng';
import { plateName, SEQ_GENERATORS } from '../src/games/seq/generators';

const hasKey = (k: string) => k in DICTS.en && k in DICTS.vi;

describe.each(Object.keys(SEQ_GENERATORS))('%s', (id) => {
  const levels = (LEVELS as Record<string, Record<Level, unknown>>)[id];
  for (const lv of [1, 2, 3] as Level[]) {
    for (const childName of ['', 'Bảo']) {
      it(`level ${lv} (name "${childName}") always makes a solvable round`, () => {
        for (let seed = 1; seed <= 200; seed++) {
          const r = SEQ_GENERATORS[id](levels[lv], makeRng(seed), { lang: 'vi' as Lang, level: lv, childName });
          // every key in the order is available in the pool, as many times as needed
          const counts: Record<string, number> = {};
          for (const p of r.pool) counts[p.key] = (counts[p.key] ?? 0) + 1;
          for (const k of r.order) counts[k] = (counts[k] ?? 0) - 1;
          expect(Object.values(counts).every((c) => c >= 0), `seed ${seed}`).toBe(true);
          expect(new Set(r.pool.map((p) => p.id)).size).toBe(r.pool.length);
          const lines = [...[r.prompt].flat(), ...[r.done].flat(), ...r.order.flatMap((_, i) => [r.sayItem(i), r.hint(i)])];
          for (const l of lines) for (const k of lineKeys(l)) expect(hasKey(k), k).toBe(true);
        }
      });
    }
  }
});

describe('rules', () => {
  it('plate names: plain A–Z, accents removed, đ → D', () => {
    expect(plateName('Bảo Anh')).toBe('BAOANH');
    expect(plateName('Đức')).toBe('DUC');
    expect(plateName('Minh-Khôi 2')).toBe('MINHKHOI');
  });
  it('L2/L3: the last plate spells the child name when set; other plates and L1 never do', () => {
    for (const lv of [1, 2, 3] as Level[]) {
      const cfg = LEVELS.licensePlates[lv];
      const rounds = cfg.rounds ?? 5;
      for (let idx = 0; idx < rounds; idx++) {
        const r = SEQ_GENERATORS.licensePlates(cfg, makeRng(idx), { lang: 'vi', level: lv, childName: 'Bảo', idx });
        const named = lv > 1 && idx === rounds - 1;
        expect(r.order.join('') === 'BAO', `L${lv} round ${idx}`).toBe(named);
        expect([r.prompt].flat()[0].key, `L${lv} round ${idx}`).toBe(named ? 'p.plate.name.kid' : 'p.plate.make');
      }
    }
    const r = SEQ_GENERATORS.licensePlates(LEVELS.licensePlates[3], makeRng(1), { lang: 'vi', level: 3, childName: '', idx: 3 });
    expect([r.prompt].flat()[0].key).toBe('p.plate.make');
  });
  it('size parking: small → big (L1, L2), big → small (L3)', () => {
    for (const lv of [1, 2, 3] as Level[]) {
      const r = SEQ_GENERATORS.sizeOrder(LEVELS.sizeOrder[lv], makeRng(lv), { lang: 'en', level: lv, childName: '' });
      const s = r.order.map(Number);
      const sorted = [...s].sort((a, b) => a - b);
      expect(s).toEqual(lv === 3 ? sorted.reverse() : sorted);
    }
  });
});

describe('letter roads', async () => {
  const { STROKES, sample } = await import('../src/games/letterStrokes');
  it('all 26 capitals exist, stay inside the box, and every level letter has a road', () => {
    expect(Object.keys(STROKES).sort().join('')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    for (const [ch, strokes] of Object.entries(STROKES)) {
      for (const s of strokes) {
        expect(s.length, ch).toBeGreaterThanOrEqual(2);
        for (const [x, y] of s) expect(x >= 0 && x <= 100 && y >= 0 && y <= 100, `${ch} ${x},${y}`).toBe(true);
        expect(sample(s).len.at(-1)!, ch).toBeGreaterThan(20);
      }
    }
    for (const lv of [1, 2, 3] as const) for (const ch of LEVELS.letterRoad[lv].letters) expect(STROKES[ch], ch).toBeDefined();
  });
});
