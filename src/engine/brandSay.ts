// Car brand names are always said in ENGLISH, whatever the app language, and always on their own
// ("Toyota!" in the English voice, then "Đúng cặp rồi!" in Vietnamese) — never inside a sentence of the
// other language. Plates with English words (FORD, BUS, ZOOM…) follow the same rule.
import { BRANDS, BRAND_BY_ID, spoken, type Brand, type BrandId } from '../content/brands';
import { EN, type Line } from './i18n';

/** "Toyota!" in the English voice. */
export const brandLine = (b: Brand | BrandId): Line => EN('say.value', { value: spoken(typeof b === 'string' ? BRAND_BY_ID[b] : b) });

/** How the English voice should read a plate: brands by name (KIA → Kia, MG → M G), VW letter by letter, words in lower case so they aren't spelled out. */
export function plateSpoken(word: string): string {
  const brand = BRANDS.find((b) => b.name.toUpperCase().replace(/[^A-Z]/g, '') === word);
  if (brand) return spoken(brand);
  if (word === 'VW') return 'V W';
  return word.toLowerCase();
}

/** A plate word, said on its own in English. */
export const plateLine = (word: string): Line => EN('say.value', { value: plateSpoken(word) });
