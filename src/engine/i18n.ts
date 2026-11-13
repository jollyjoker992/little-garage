import { en } from '../content/i18n/en';
import { vi } from '../content/i18n/vi';

export type Lang = 'en' | 'vi';
/** A recorded sound used as a word inside a line (a friend's name in the child's own voice). */
export type Clip = { clip: string };
export type Arg = string | number | Line | Clip;
const isClip = (a: unknown): a is Clip => typeof a === 'object' && a !== null && 'clip' in a;

/** Marks where a recorded clip goes inside a spoken text: "Tớ là ␟<url>␟! Chào King!" */
export const CLIP_MARK = '\u241F';
/** Split a spoken text into speech parts and recorded clips, in order. */
export function splitClips(text: string): { say?: string; clip?: string }[] {
  return text.split(CLIP_MARK).map((part, i) => (i % 2 ? { clip: part } : { say: part })).filter((p) => (p.say ?? p.clip ?? '').trim());
}
/**
 * A spoken/visible line: an i18n key plus template args. Args can be nested lines (e.g. a color name).
 * `lang` pins the line to one language whatever the app language is (English Street: the English words and
 * Zip always speak English). Nested args follow the line's language.
 * `voice` picks a character voice (pitch / speed): see VOICES in speech.ts.
 */
export type Line = { key: string; args?: Record<string, Arg>; lang?: Lang; voice?: string };

export const DICTS: Record<Lang, Record<string, string | string[]>> = { en, vi };
export const LANG_TAG: Record<Lang, string> = { en: 'en-US', vi: 'vi-VN' };

export const L = (key: string, args?: Record<string, Arg>): Line => ({ key, args });
/** A line that is always said in English (English Street words, Zip). */
export const EN = (key: string, args?: Record<string, Arg>, voice?: string): Line => ({ key, args, lang: 'en', voice });
/** The same line said by a character voice. */
export const voiced = (line: Line, voice: string): Line => ({ ...line, voice });

// ── The child's name ──
// A line "x" can have a personal version "x.kid" that uses {kid}. When a name is set (Grown-ups settings),
// the game says "x.kid" instead of "x"; without a name it says "x". {kid} is only allowed in ".kid" lines (tests enforce it).
let kid = '';
/** Called by the store whenever the name changes. */
export const setKidName = (name: string) => { kid = name.trim(); };
export const kidName = () => kid;

/** The key actually used for a line: its ".kid" version when a name is set and one exists. */
export function resolveKey(lang: Lang, key: string): string {
  const k = `${key}.kid`;
  return kid && (k in DICTS[lang] || k in DICTS.en) ? k : key;
}

export function t(appLang: Lang, line: Line | string, rnd: () => number = Math.random): string {
  const l: Line = typeof line === 'string' ? { key: line } : line;
  const lang = l.lang ?? appLang;
  const key = resolveKey(lang, l.key);
  let v = DICTS[lang][key] ?? DICTS.en[key] ?? key;
  if (Array.isArray(v)) v = v[Math.floor(rnd() * v.length)];
  return v.replace(/\{(\w+)\}/g, (_, name: string) => {
    const a = l.args?.[name] ?? (name === 'kid' ? kid : null);
    if (a == null) return '';
    if (isClip(a)) return `${CLIP_MARK}${a.clip}${CLIP_MARK}`;
    return typeof a === 'object' ? t(lang, a, rnd) : String(a);
  });
}

/** All keys referenced by a line, including nested args (used by tests). */
export function lineKeys(line: Line): string[] {
  const out = [line.key];
  for (const a of Object.values(line.args ?? {})) if (typeof a === 'object' && !isClip(a)) out.push(...lineKeys(a));
  return out;
}
