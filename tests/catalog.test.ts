import { describe, expect, it } from 'vitest';
import { GAMES, ZONES } from '../src/content/catalog';
import { DICTS } from '../src/engine/i18n';
import { GENERATORS } from '../src/games/rounds';
import { SEQ_GENERATORS } from '../src/games/seq/generators';
import { BRANDS, BRAND_BY_ID, spoken } from '../src/content/brands';

const CUSTOM = ['paint', 'drawing', 'transporter', 'roadPuzzle', 'letterRoad', 'brandMemory', 'buildCar', 'traffic', 'stickers'];

describe('catalog', () => {
  it('every ready game is implemented', () => {
    for (const g of GAMES.filter((x) => x.status === 'ready')) expect(g.id in GENERATORS || g.id in SEQ_GENERATORS || CUSTOM.includes(g.id), g.id).toBe(true);
  });
  it('every game and zone has a name + intro in both languages', () => {
    for (const k of [...GAMES.flatMap((g) => [`game.${g.id}`, `game.${g.id}.intro`]), ...ZONES.flatMap((z) => [`zone.${z.id}`, `zone.${z.id}.intro`])]) {
      expect(k in DICTS.en && k in DICTS.vi, k).toBe(true);
    }
  });
  it('every zone has at least one ready game', () => {
    for (const z of ZONES) expect(GAMES.some((g) => g.zones.includes(z.id) && g.status === 'ready'), z.id).toBe(true);
  });
});

describe('brands', () => {
  it('have unique ids and a single uppercase first letter matching the name', () => {
    expect(new Set(BRANDS.map((b) => b.id)).size).toBe(BRANDS.length);
    for (const b of BRANDS) expect(b.name[0].toUpperCase(), b.id).toBe(b.letter);
  });
  it('MG is spoken letter by letter (a voice may read "MG" as milligrams)', () => {
    expect(spoken(BRAND_BY_ID.mg)).toBe('M G');
    expect(spoken(BRAND_BY_ID.toyota)).toBe('Toyota');
  });
});
