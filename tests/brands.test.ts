import { describe, expect, it } from 'vitest';
import { BRANDS } from '../src/content/brands';
import { LEVELS, type Level } from '../src/content/levels';
import { brandLine, plateLine, plateSpoken } from '../src/engine/brandSay';
import { t, lineKeys, DICTS, type Line } from '../src/engine/i18n';
import { makeRng } from '../src/engine/rng';
import { GENERATORS } from '../src/games/rounds';
import { SEQ_GENERATORS } from '../src/games/seq/generators';

const hasKey = (k: string) => k in DICTS.en && k in DICTS.vi;
const lines = (xs: unknown[]) => xs.flat().filter((x): x is Line => !!x && typeof x === 'object' && 'key' in x);
const names = BRANDS.map((b) => b.name.toLowerCase());
/** Every brand name is said in English and on its own; no app-language line contains one. */
function check(xs: unknown[], where: string) {
  for (const l of lines(xs)) {
    const vi = t('vi', l).toLowerCase();
    if (l.lang === 'en') continue;
    for (const n of names) expect(vi.includes(n) && n.length > 2, `${where}: "${t('vi', l)}" has a brand inside a Vietnamese line`).toBe(false);
  }
}

describe('car brands are said in English, on their own', () => {
  it('a brand line is English whatever the app language', () => {
    expect(brandLine('toyota').lang).toBe('en');
    expect(t('vi', brandLine('toyota'))).toBe('Toyota!');
    expect(t('vi', brandLine('mg'))).toBe('M G!');
  });
  it('plates: brands by name, other words in English lower case (not spelled out)', () => {
    expect(plateSpoken('KIA')).toBe('Kia');
    expect(plateSpoken('VINFAST')).toBe('VinFast');
    expect(plateSpoken('MG')).toBe('M G');
    expect(plateSpoken('VW')).toBe('V W');
    expect(plateSpoken('TAXI')).toBe('taxi');
    expect(plateLine('FORD').lang).toBe('en');
  });
  it('Read the Brand, Brand Letters and License Plates never put a brand inside a Vietnamese sentence', () => {
    for (const lv of [1, 2, 3] as Level[]) for (let seed = 1; seed <= 80; seed++) {
      for (const id of ['readBrand', 'brandLetters']) {
        const r = GENERATORS[id]((LEVELS as never)[id][lv], makeRng(seed), { lang: 'vi', level: lv });
        const said = [r.prompt, ...(r.promptLines ?? []), r.answerSay, ...(r.answerMore ?? [])];
        check(said, `${id} L${lv}`);
        for (const k of lines(said).flatMap(lineKeys)) expect(hasKey(k), k).toBe(true);
        expect(lines(said).some((l) => l.lang === 'en'), `${id}: the brand is said`).toBe(true);
      }
      const p = SEQ_GENERATORS.licensePlates(LEVELS.licensePlates[lv], makeRng(seed), { lang: 'vi', level: lv, childName: '', idx: 0 });
      check([p.prompt, p.done], `licensePlates L${lv}`);
    }
  });
});
