// Simplified, kid-recognizable brand badges (not exact trademarks). viewBox 0 0 100 100.
// Brand names and logos are trademarks of their owners, not covered by the MIT License — see README.md#trademarks.
// Rules: every paintable part is a filled shape (f), an outlined line (so) or outlined lettering;
// lettering is stored as outlines in logoText.ts (never <text>), so taps only hit what you see.
import type { ReactNode } from 'react';
import type { BrandId } from '../content/brands';
import { LOGO_DEFAULTS, type Fills } from './defaults';
import { painter } from './kit';
import { BMW, FORD, JEEP, LAMBORGHINI, LAND, MG, NISSAN, PORSCHE, ROVER, VOLVO } from './logoText';

type Pt = ReturnType<typeof painter>;

const LOGOS: Record<BrandId, (p: Pt) => ReactNode> = {
  toyota: ({ f, so }) => (<>
    <rect x="4" y="14" width="92" height="72" rx="36" {...f('bg')} />
    {so('mark', 6, <ellipse cx="50" cy="50" rx="36" ry="24" />)}
    {so('mark', 6, <ellipse cx="50" cy="46" rx="11" ry="24" />)}
    {so('mark', 6, <ellipse cx="50" cy="36" rx="25" ry="9" />)}
  </>),
  honda: ({ f }) => (<>
    <rect x="8" y="8" width="84" height="84" rx="20" {...f('bg')} />
    <path d="M26 20 L40 20 L42 44 L58 44 L60 20 L74 20 L68 80 L57 80 L56 56 L44 56 L43 80 L32 80 Z" {...f('mark')} />
  </>),
  bmw: ({ f, ink, deco }) => (<>
    <circle cx="50" cy="50" r="47" {...f('ring')} />
    <path d="M50 50 L50 18 A32 32 0 0 0 18 50 Z" {...f('blue')} />
    <path d="M50 50 L82 50 A32 32 0 0 0 50 18 Z" {...f('white')} />
    <path d="M50 50 L50 82 A32 32 0 0 0 82 50 Z" {...f('blue')} />
    <path d="M50 50 L18 50 A32 32 0 0 0 50 82 Z" {...f('white')} />
    <path d={BMW} {...deco('#fff', 1)} stroke={ink} strokeWidth="1.2" paintOrder="stroke" />
  </>),
  mercedes: ({ f, so }) => (<>
    <circle cx="50" cy="50" r="44" {...f('bg')} />
    {so('ring', 7, <circle cx="50" cy="50" r="44" />)}
    <path d="M50 8 L57 47 L87 72 L50 58 L13 72 L43 47 Z" {...f('star')} />
  </>),
  audi: ({ f, so }) => (<>
    <rect x="2" y="24" width="96" height="52" rx="14" {...f('bg')} />
    {[22, 40, 58, 76].map((cx) => <g key={cx}>{so('rings', 5, <circle cx={cx} cy="50" r="15" />)}</g>)}
  </>),
  // Chrome double "V".
  vinfast: ({ f }) => (<>
    <circle cx="50" cy="50" r="46" {...f('bg')} />
    <path d="M12 22 L26 22 L50 70 L74 22 L88 22 L50 90 Z" {...f('outer', 2.5)} />
    <path d="M30 22 L40 22 L50 44 L60 22 L70 22 L50 62 Z" {...f('inner', 2.5)} />
  </>),
  ford: ({ f, so }) => (<>
    <ellipse cx="50" cy="50" rx="47" ry="30" {...f('bg')} />
    {so('rim', 3, <ellipse cx="50" cy="50" rx="41" ry="24" />)}
    <path d={FORD} {...f('mark', 1.2)} />
  </>),
  tesla: ({ f }) => (<>
    <circle cx="50" cy="50" r="46" {...f('bg')} />
    <path d="M14 24 Q50 12 86 24 L82 32 Q66 26 56 27 L56 86 L50 90 L44 86 L44 27 Q34 26 18 32 Z" {...f('mark')} />
  </>),
  porsche: ({ f, ink }) => (<>
    <path d="M12 10 L88 10 L88 52 Q88 84 50 96 Q12 84 12 52 Z" {...f('bg')} />
    <path d={PORSCHE} {...f('antlers', 0.8)} />
    <rect x="18" y="28" width="30" height="26" {...f('stripes', 2)} />
    <rect x="52" y="56" width="30" height="24" {...f('stripes', 2)} />
    <rect x="52" y="28" width="30" height="26" {...f('antlers', 2)} />
    <rect x="18" y="56" width="30" height="24" {...f('antlers', 2)} />
    <path d="M38 42 L62 42 L62 60 Q62 70 50 74 Q38 70 38 60 Z" {...f('center', 2)} />
    <path d="M45 66 L47 56 L44 52 L50 48 L55 50 L54 56 L56 66" fill="none" stroke={ink} strokeWidth="2.5" pointerEvents="none" />
  </>),
  // Yellow shield, Italian stripes, black prancing horse (rearing, facing left).
  ferrari: ({ f }) => (<>
    <path d="M14 8 L86 8 L86 62 Q86 86 50 96 Q14 86 14 62 Z" {...f('bg')} />
    <rect x="14" y="8" width="24" height="10" {...f('green', 2)} />
    <rect x="38" y="8" width="24" height="10" {...f('white', 2)} />
    <rect x="62" y="8" width="24" height="10" {...f('red', 2)} />
    <path d="M 33.8 40.8 Q 31.4 37.6 34.4 34.5 L 42.8 26.9 L 46.4 24.4 L 48.2 21.2 L 50 25 Q 56 25 59.6 28.8 L 65 28.8 Q 61.4 31.3 61.4 33.2 L 66.2 35.1 Q 62 37 61.4 38.2 L 65 41.4 Q 60.8 42 59 43.3 Q 60.2 49.6 62 54 Q 63.8 56.5 64.4 59 Q 66.8 52.7 68 45.2 Q 68.6 40.1 72.2 37.6 Q 70.4 43.9 70.4 50.2 Q 69.8 57.8 66.2 62.8 Q 65.6 66.6 63.8 69.1 L 66.2 75.4 L 64.4 81.7 L 61.4 81.1 L 62.6 75.4 L 59.6 71.6 Q 56 72.9 54.8 76.7 L 52.4 88 L 47.6 88 L 50.6 76.7 Q 50 70.4 47.6 65.3 Q 45.8 61.5 44 59 L 39.8 60.3 L 41.6 66.6 L 38.6 67.2 L 36.2 60.3 Q 38 56.5 41.6 55.2 L 36.8 52.7 L 32 50.2 L 33.8 57.8 L 30.2 57.8 L 28.4 50.2 Q 30.8 46.4 35.6 46.4 L 41.6 47.7 Q 44 44.5 43.4 42 Q 40.4 43.3 36.8 43.3 Q 34.4 43.3 33.8 40.8 Z" {...f('horse', 2)} />
  </>),
  // Black shield, gold edge, LAMBORGHINI, gold charging bull (head down, tail up).
  lamborghini: ({ f, so }) => (<>
    <path d="M14 8 L86 8 L86 60 Q86 86 50 96 Q14 86 14 60 Z" {...f('bg')} />
    {so('edge', 4, <path d="M18 12 L82 12 L82 60 Q82 82 50 91 Q18 82 18 60 Z" />)}
    <path d={LAMBORGHINI} {...f('text', 0.6)} />
    <path d="M 27.6 57.2 Q 34.3 51.4 41.6 48.6 Q 48.9 44.7 55.6 45.2 Q 60.1 46.2 62.3 50 L 66.8 58.2 L 75.2 52.4 L 70.7 60.1 L 73.5 67.8 L 69 71.6 L 64.6 67.8 L 63.4 72.6 L 66.8 82.2 L 62.9 83.6 L 59 74.5 L 55.6 72.6 L 53.4 75.4 L 54.5 84.1 L 50.6 84.1 L 50 75 L 44.4 72.1 L 39.4 72.6 L 38.8 81.2 L 36.6 84.1 L 33.2 84.1 L 34.3 76.4 L 29.8 72.6 L 26.5 81.2 L 23.1 80.2 L 25.4 70.6 Q 23.7 66.8 24.8 63 Q 21.4 57.2 22.6 51.4 Q 24.2 44.7 32.1 42.3 Q 27.6 46.2 27 51 Q 27 54.3 27.6 57.2 Z" {...f('bull', 2)} />
  </>),
  volkswagen: ({ f, so }) => (<>
    <circle cx="50" cy="50" r="46" {...f('bg')} />
    {so('ring', 5, <circle cx="50" cy="50" r="40" />)}
    {so('mark', 6, <path d="M30 22 L50 58 L70 22" />)}
    {so('mark', 6, <path d="M18 38 L34 76 L50 50 L66 76 L82 38" />)}
  </>),
  // New "KIA" wordmark: one zig-zag stroke (/|/|/|) plus the K's leg.
  kia: ({ f }) => (<>
    <rect x="2" y="26" width="96" height="48" rx="12" {...f('bg')} />
    <path d="M5 61 L17 39 L22 39 L22 53 L51 39 L58 39 L58 54 L89 39 L95 39 L95 61 L89 61 L89 46 L58 61 L51 61 L51 46 L39.5 51.5 L46 61 L39 61 L33 54.7 L22 60 L22 61 Z" {...f('mark', 1.5)} />
  </>),
  // Slanted "H" in a blue oval with a thin inner ring.
  hyundai: ({ f, so }) => (<>
    <ellipse cx="50" cy="50" rx="47" ry="31" {...f('bg')} />
    {so('ring', 3, <ellipse cx="50" cy="50" rx="41" ry="25.5" />)}
    <path d="M33 52 L67 40 L67 48 L33 60 Z" {...f('mark', 1.5)} />
    <path d="M19 63 Q24 41 42 27 L54 27 Q38 43 35 65 Z" {...f('mark', 1.5)} />
    <path d="M81 37 Q76 59 58 73 L46 73 Q62 57 65 35 Z" {...f('mark', 1.5)} />
  </>),
  // Oval ring with the "wing" V inside.
  mazda: ({ f, so }) => (<>
    <ellipse cx="50" cy="50" rx="47" ry="39" {...f('bg')} />
    {so('ring', 5, <ellipse cx="50" cy="50" rx="41" ry="33" />)}
    <path d="M12 42 Q33 33 50 60 Q67 33 88 42 L87 48 Q67 42 50 69 Q33 42 13 48 Z" {...f('mark', 1.5)} />
  </>),
  // "Jeep" wordmark.
  jeep: ({ f }) => (<>
    <rect x="4" y="22" width="92" height="56" rx="14" {...f('bg')} />
    <path d={JEEP} {...f('mark', 1.5)} />
  </>),
  // Three red diamonds meeting in the middle.
  mitsubishi: ({ f }) => (<>
    <rect x="6" y="4" width="88" height="88" rx="18" {...f('bg')} />
    <path d="M50.0 55.0 L61.0 33.0 L50.0 11.0 L39.0 33.0 Z" {...f('mark', 2)} />
    <path d="M50.0 55.0 L63.6 75.5 L88.1 77.0 L74.6 56.5 Z" {...f('mark', 2)} />
    <path d="M50.0 55.0 L25.4 56.5 L11.9 77.0 L36.4 75.5 Z" {...f('mark', 2)} />
  </>),
  // Ring broken by the NISSAN name across the middle.
  nissan: ({ f, so }) => (<>
    <circle cx="50" cy="50" r="47" {...f('bg')} />
    {so('ring', 4, <path d="M12.2 42 A39 39 0 0 1 87.8 42" />)}
    {so('ring', 4, <path d="M12.2 58 A39 39 0 0 0 87.8 58" />)}
    <path d={NISSAN} {...f('text', 0.8)} />
  </>),
  // Gold bowtie with a silver edge.
  chevrolet: ({ f, so }) => (<>
    <rect x="2" y="18" width="96" height="64" rx="14" {...f('bg')} />
    {so('edge', 5, <path d="M12 40 L38 40 L40 28 L64 28 L62 40 L94 40 L88 60 L62 60 L60 72 L36 72 L38 60 L6 60 Z" />)}
    <path d="M12 40 L38 40 L40 28 L64 28 L62 40 L94 40 L88 60 L62 60 L60 72 L36 72 L38 60 L6 60 Z" {...f('mark', 2)} />
  </>),
  // Octagon with tall MG letters.
  mg: ({ f, so }) => (<>
    <path d="M93.4 68.0 L68.0 93.4 L32.0 93.4 L6.6 68.0 L6.6 32.0 L32.0 6.6 L68.0 6.6 L93.4 32.0 Z" {...f('bg')} />
    {so('ring', 4, <path d="M87.0 65.3 L65.3 87.0 L34.7 87.0 L13.0 65.3 L13.0 34.7 L34.7 13.0 L65.3 13.0 L87.0 34.7 Z" />)}
    <path d={MG} {...f('mark', 1.2)} />
  </>),
  // Slanted "L" inside an oval; its foot runs out to the oval.
  lexus: ({ f, so }) => (<>
    <ellipse cx="50" cy="50" rx="47" ry="34" {...f('bg')} />
    {so('ring', 3.5, <ellipse cx="50" cy="50" rx="40" ry="27" />)}
    <path d="M51 27 L60 27 L44 64 L86 64 Q84 69 80 71 L33 71 Z" {...f('mark', 1.5)} />
  </>),
  // Green oval, thin ring, LAND / ROVER with little dash arrows.
  landrover: ({ f, so }) => (<>
    <ellipse cx="50" cy="50" rx="47" ry="32" {...f('bg')} />
    {so('ring', 2.5, <ellipse cx="50" cy="50" rx="41" ry="26" />)}
    <path d={LAND} {...f('text', 0.8)} />
    <path d={ROVER} {...f('text', 0.8)} />
    <path d="M72 40 L80 40 L78 44 L70 44 Z M28 56 L20 56 L22 52 L30 52 Z" {...f('text', 0.8)} />
  </>),
  // Ring with the arrow to the top right, VOLVO across the middle.
  volvo: ({ f, so }) => (<>
    <rect x="4" y="4" width="92" height="92" rx="18" {...f('bg')} />
    {so('ring', 6, <circle cx="46" cy="54" r="34" />)}
    {so('ring', 6, <path d="M70 30 L84 16" />)}
    <path d="M78 10 L92 8 L90 22 Z" {...f('ring', 1.5)} />
    <path d={VOLVO} {...f('text', 0.8)} />
  </>),
  // Red pointed "S".
  suzuki: ({ f }) => (<>
    <rect x="6" y="4" width="88" height="92" rx="18" {...f('bg')} />
    <path d="M49.5 13.0 L85.0 37.0 L74.2 43.5 L63.5 43.5 L41.2 29.7 L60.2 45.4 L72.6 54.6 L85.8 63.9 L49.5 86.1 L14.8 62.0 L25.5 55.6 L36.3 55.6 L58.5 69.4 L39.6 53.7 L27.2 44.5 L14.0 35.2 Z" {...f('mark', 2)} />
  </>),
};

export function LogoArt({ brand, fills, x, y, size, className, lineArt }: { brand: BrandId; fills?: Fills; x?: number; y?: number; size?: number; className?: string; lineArt?: boolean }) {
  const p = painter(LOGO_DEFAULTS[brand], fills, false, lineArt);
  return (
    <svg viewBox="0 0 100 100" x={x} y={y} width={size} height={size} className={className} role="img" aria-label={brand}>
      {LOGOS[brand](p)}
    </svg>
  );
}
