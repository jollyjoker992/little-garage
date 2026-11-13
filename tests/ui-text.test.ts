import { describe, expect, it } from 'vitest';
import { UI, uiText } from '../src/content/i18n/ui';

const slots = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('screen text for grown-ups', () => {
  it('has every label in both languages, with the same {slots}', () => {
    expect(Object.keys(UI.vi).sort()).toEqual(Object.keys(UI.en).sort());
    for (const k of Object.keys(UI.en) as (keyof typeof UI.en)[]) {
      expect(UI.vi[k].trim(), k).not.toBe('');
      expect(slots(UI.vi[k]), k).toEqual(slots(UI.en[k]));
    }
  });
  it('follows the chosen language', () => {
    expect(uiText('vi', 'p.title')).toBe('Người lớn');
    expect(uiText('en', 'p.title')).toBe('Grown-ups');
    expect(uiText('vi', 'p.minutes', { n: 15 })).toBe('15 phút');
  });
});
