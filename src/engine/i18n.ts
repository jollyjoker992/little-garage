import { en } from '../content/i18n/en';
import { vi } from '../content/i18n/vi';

export type Lang = 'en' | 'vi';
export type Arg = string | number | Line;
/** A spoken/visible line: an i18n key plus template args. Args can be nested lines (e.g. a color name). */
export type Line = { key: string; args?: Record<string, Arg> };

export const DICTS: Record<Lang, Record<string, string | string[]>> = { en, vi };
export const LANG_TAG: Record<Lang, string> = { en: 'en-US', vi: 'vi-VN' };

export const L = (key: string, args?: Record<string, Arg>): Line => ({ key, args });

export function t(lang: Lang, line: Line | string, rnd: () => number = Math.random): string {
  const l = typeof line === 'string' ? { key: line } : line;
  let v = DICTS[lang][l.key] ?? DICTS.en[l.key] ?? l.key;
  if (Array.isArray(v)) v = v[Math.floor(rnd() * v.length)];
  return v.replace(/\{(\w+)\}/g, (_, name: string) => {
    const a = l.args?.[name];
    if (a == null) return '';
    return typeof a === 'object' ? t(lang, a, rnd) : String(a);
  });
}

/** All keys referenced by a line, including nested args (used by tests). */
export function lineKeys(line: Line): string[] {
  const out = [line.key];
  for (const a of Object.values(line.args ?? {})) if (typeof a === 'object') out.push(...lineKeys(a));
  return out;
}
