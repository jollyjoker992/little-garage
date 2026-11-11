import { describe, expect, it } from 'vitest';
import { en } from '../src/content/i18n/en';
import { vi } from '../src/content/i18n/vi';

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
