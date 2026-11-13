// English echo in the other zones (Grown-ups → English echo). When the app speaks Vietnamese, the English
// word follows the Vietnamese one: "Đúng rồi! Xe cứu hỏa — fire truck!"
import type { ColorId } from '../content/colors';
import type { Thing } from '../content/things';
import { EN, L, type Line } from './i18n';
import { getState } from './store';

const on = (min: 'words' | 'counting' = 'words') => {
  const s = getState();
  return s.lang !== 'en' && (s.engEcho === 'counting' || s.engEcho === min);
};
const word = (key: string): Line => EN('say.value', { value: L(key) }, 'word');

/** The English name of what was picked (vehicles, car types, numbers, shapes, objects). */
export function echoThing(th: Thing | undefined): Line[] {
  if (!th || !on()) return [];
  switch (th.t) {
    case 'vehicle': return [word(th.v === 'car' && th.body ? `body.${th.body}` : `v.${th.v}`)];
    case 'number': case 'dots': return [word(`num.${th.n}`)];
    case 'shape': return [word(`shape.${th.shape}`)];
    case 'object': return [word(`obj.${th.obj}`)];
    default: return [];
  }
}

export const echoColor = (c: ColorId | string): Line[] => (on() ? [word(`color.${c}`)] : []);
/** Counting aloud also in English ("một — one"), only with "words + counting". */
export const echoCount = (n: number): Line[] => (on('counting') && getState().engEcho === 'counting' ? [word(`num.${n}`)] : []);
/** The sticker reward: "red fire truck!" */
export const echoSticker = (color: ColorId, v: string): Line[] => (on() ? [EN('echo.colorVehicle', { color: L(`color.${color}`), vehicle: L(`v.${v}`) }, 'word')] : []);
