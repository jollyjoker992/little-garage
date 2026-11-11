import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CustomCar } from '../src/art/CustomCar';
import { BRANDS } from '../src/content/brands';
import { BODY_OPTIONS, DRIVERS, ENGINES, EXTRAS, PATTERNS, WHEELS, makeOrder, normalizeSpec, orderDone, orderProgress, randomSpec } from '../src/content/carParts';
import { DICTS } from '../src/engine/i18n';
import { makeRng } from '../src/engine/rng';

describe('Build a Car', () => {
  it('300 random cars all draw cleanly (no NaN / undefined in the SVG)', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const spec = randomSpec(makeRng(seed), BRANDS.map((b) => b.id), ['ZOOM', 'BAO']);
      const html = renderToStaticMarkup(<CustomCar spec={spec} />);
      expect(html, JSON.stringify(spec)).not.toMatch(/NaN|undefined/);
    }
  });
  it('every body × wheels combination draws', () => {
    for (const body of BODY_OPTIONS) for (const wheels of WHEELS) {
      expect(renderToStaticMarkup(<CustomCar spec={normalizeSpec({ body, wheels })} />)).not.toMatch(/NaN|undefined/);
    }
  });
  it('old saved cars (body/colour/brand/horn only) still load', () => {
    const s = normalizeSpec({ body: 'sedan', color: 'blue', brand: 'bmw', horn: 'honk' } as never);
    expect(s.extras).toEqual([]);
    expect(renderToStaticMarkup(<CustomCar spec={s} />)).toContain('<svg');
  });
  it('orders: L2 = colour + type, L3 adds exactly one more thing; matching works', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const o2 = makeOrder(makeRng(seed), 2);
      expect(Object.keys(o2).sort()).toEqual(['body', 'color']);
      const o3 = makeOrder(makeRng(seed), 3);
      expect(Object.keys(o3).length).toBe(3);
      const car = normalizeSpec({ body: o3.body, color: o3.color, number: o3.number ?? 0, wheels: o3.wheels ?? 'normal', pattern: o3.pattern ?? 'none' });
      expect(orderDone(car, o3)).toBe(true);
      expect(Object.values(orderProgress({ ...car, color: car.color === 'red' ? 'blue' : 'red' }, o3)).filter((x) => !x).length).toBe(1);
    }
  });
  it('every trait has a voice line in both languages', () => {
    const keys = [
      ...BODY_OPTIONS.map((b) => `body.${b}`), ...WHEELS.map((w) => `wheels.${w}`), ...PATTERNS.map((p) => `pattern.${p}`),
      ...EXTRAS.map((e) => `extra.${e}`), ...DRIVERS.map((d) => `driver.${d}`), ...ENGINES.map((e) => `engine.${e}`),
      ...['type', 'paint', 'wheels', 'pattern', 'number', 'plate', 'extras', 'driver', 'logo', 'sound'].map((c) => `cat.${c}`),
    ];
    for (const k of keys) expect(k in DICTS.en && k in DICTS.vi, k).toBe(true);
  });
});
