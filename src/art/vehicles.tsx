// Vehicle drawings. viewBox 0 0 200 120, facing right, ground at y≈110.
// Every paintable element uses f()/s() with a region name listed in defaults.ts.
import { useId, type ReactNode } from 'react';
import type { BrandId } from '../content/brands';
import type { CarBody, VehicleId } from '../content/vehicles';
import { VEHICLE_DEFAULTS, type Fills } from './defaults';
import { LogoArt } from './logos';
import { painter } from './kit';

type Pt = ReturnType<typeof painter>;

export type VehicleProps = {
  v: VehicleId;
  fills?: Fills;
  body?: CarBody;
  brand?: BrandId;
  label?: string;
  load?: number;
  shadow?: boolean;
  className?: string;
  /** 'ground' keeps the wheels on the bottom edge of the box (default); 'center' centers it. */
  align?: 'ground' | 'center';
  /** Coloring-page lines only (Drawing Board pages). */
  lineArt?: boolean;
  /** Position when nested inside another SVG. */
  box?: { x: number; y: number; w: number; h: number };
};

const Wheel = ({ p, x, y = 96, r = 15 }: { p: Pt; x: number; y?: number; r?: number }) => (
  <g>
    <circle cx={x} cy={y} r={r} {...p.f('wheels')} />
    <circle cx={x} cy={y} r={r * 0.4} {...p.deco('#cfd8dc')} />
  </g>
);

/** Car body geometry (200×120 box, facing right). Shared by the game cars and the Build-a-Car garage. */
export type CarShape = {
  body: string;
  windows: string[];
  /** top of the roof (label sign / roof extras sit on it) */
  roof: number;
  /** roof span [x1, x2] for roof extras */
  roofSpan: [number, number];
  /** rear deck height (spoiler / flag) */
  deck: number;
  badge: [number, number];
  stripe: [number, number, number];
  light: [number, number];
  wheels: { x: [number, number]; r: number };
  /** body raised this much (monster truck) */
  lift?: number;
  /** spare tyre on the back (off-road jeep) */
  spare?: boolean;
  /** no roof: the driver sits above the door */
  open?: boolean;
};
const W = { x: [50, 150] as [number, number], r: 15 };
const PICKUP = 'M12 94 L12 58 L100 58 L100 30 Q100 24 108 24 L140 24 Q146 24 150 30 L162 54 L180 58 Q188 60 188 70 L188 94 Z';
export const CAR_SHAPES: Record<CarBody, CarShape> = {
  sedan: {
    body: 'M14 94 Q10 70 30 64 L56 60 L76 34 Q81 28 91 28 L130 28 Q138 28 143 34 L160 60 L178 64 Q190 68 188 94 Z',
    windows: ['M81 38 L96 38 L96 58 L66 58 Z', 'M102 38 L130 38 Q134 38 136 42 L148 58 L102 58 Z'],
    roof: 28, roofSpan: [84, 134], deck: 62, badge: [88, 64], stripe: [16, 186, 74], light: [182, 70], wheels: W,
  },
  sports: {
    body: 'M10 94 Q8 76 28 72 L70 64 L96 44 Q101 40 111 40 L134 41 Q142 42 150 51 L166 64 L183 70 Q193 74 191 94 Z',
    windows: ['M101 48 L113 46 L113 62 L84 62 Z', 'M119 46 L134 47 L147 62 L119 62 Z'],
    roof: 40, roofSpan: [100, 138], deck: 72, badge: [94, 68], stripe: [14, 188, 78], light: [184, 76], wheels: W,
  },
  suv: {
    body: 'M12 94 L12 30 Q12 22 20 22 L135 22 Q142 22 146 28 L160 52 L180 56 Q188 58 188 68 L188 94 Z',
    windows: ['M22 30 L55 30 L55 52 L22 52 Z', 'M61 30 L98 30 L98 52 L61 52 Z', 'M104 30 L134 30 L148 52 L104 52 Z'],
    roof: 22, roofSpan: [24, 132], deck: 22, badge: [70, 60], stripe: [14, 186, 74], light: [182, 70], wheels: W,
  },
  pickup: {
    body: PICKUP,
    windows: ['M108 32 L138 32 L150 54 L108 54 Z'],
    roof: 24, roofSpan: [106, 144], deck: 58, badge: [118, 62], stripe: [14, 186, 74], light: [182, 70], wheels: W,
  },
  mini: {
    body: 'M34 94 Q30 70 48 64 L62 60 L76 38 Q80 32 90 32 L120 32 Q128 32 132 38 L146 60 L158 64 Q168 68 166 94 Z',
    windows: ['M81 40 L95 40 L95 58 L69 58 Z', 'M101 40 L120 40 Q124 40 126 44 L137 58 L101 58 Z'],
    roof: 32, roofSpan: [84, 124], deck: 64, badge: [92, 64], stripe: [36, 164, 74], light: [161, 70], wheels: { x: [62, 140], r: 14 },
  },
  van: {
    body: 'M12 94 L12 24 Q12 16 20 16 L148 16 Q156 16 160 24 L178 54 Q188 58 188 68 L188 94 Z',
    windows: ['M22 26 L56 26 L56 50 L22 50 Z', 'M64 26 L98 26 L98 50 L64 50 Z', 'M106 26 L140 26 L140 50 L106 50 Z', 'M148 26 L153 26 L170 52 L148 52 Z'],
    roof: 16, roofSpan: [24, 148], deck: 16, badge: [118, 58], stripe: [14, 186, 72], light: [182, 72], wheels: W,
  },
  jeep: {
    body: 'M20 94 L20 50 L40 50 L46 26 L134 26 L142 50 L182 54 Q190 56 190 64 L190 94 Z',
    windows: ['M52 32 L86 32 L86 50 L48 50 Z', 'M92 32 L130 32 L136 50 L92 50 Z'],
    roof: 26, roofSpan: [50, 130], deck: 50, badge: [100, 60], stripe: [22, 186, 72], light: [184, 66], wheels: { x: [54, 150], r: 17 }, spare: true,
  },
  convertible: {
    body: 'M10 94 Q8 76 28 70 L70 64 L97 64 L106 50 L113 50 L107 64 L168 64 L184 70 Q194 74 192 94 Z',
    windows: ['M106 50 L113 50 L107 64 L98 64 Z'],
    roof: 50, roofSpan: [60, 100], deck: 68, badge: [126, 70], stripe: [14, 188, 78], light: [185, 76], wheels: W, open: true,
  },
  race: {
    body: 'M6 92 L10 80 L58 76 L76 66 L112 66 L124 76 L178 80 Q196 82 196 92 Z',
    windows: ['M84 70 L106 70 L112 76 L80 76 Z'],
    roof: 66, roofSpan: [80, 110], deck: 80, badge: [136, 80], stripe: [12, 192, 85], light: [189, 85], wheels: { x: [42, 160], r: 16 },
  },
  monster: {
    body: PICKUP,
    windows: ['M108 32 L138 32 L150 54 L108 54 Z'],
    roof: 24, roofSpan: [106, 144], deck: 58, badge: [118, 62], stripe: [14, 186, 74], light: [182, 70], wheels: { x: [46, 154], r: 26 }, lift: 22,
  },
};

/** Centre of a polygon path's points (used to seat the driver in the front window). */
export function pathCenter(d: string): [number, number] {
  const n = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
  let x = 0, y = 0;
  for (let i = 0; i + 1 < n.length; i += 2) { x += n[i]; y += n[i + 1]; }
  return [x / (n.length / 2), y / (n.length / 2)];
}

function Car({ p, body = 'sedan', brand, label, police, taxi }: { p: Pt; body?: CarBody; brand?: BrandId; label?: string; police?: boolean; taxi?: boolean }) {
  const s = CAR_SHAPES[body];
  const lift = s.lift ?? 0;
  const wy = 111 - s.wheels.r;
  const clip = useId().replace(/:/g, '');
  return (<>
    {label && (
      <g pointerEvents="none">
        <rect x="78" y={s.roof - lift - 46} width="52" height="46" rx="8" fill={p.shadow ? p.ink : '#fff'} stroke={p.ink} strokeWidth="3" />
        {!p.shadow && <text x="104" y={s.roof - lift - 9} fontSize="40" fontWeight="900" textAnchor="middle" fill="#263238" fontFamily="Arial Rounded MT Bold, Arial, sans-serif">{label}</text>}
      </g>
    )}
    <g transform={lift ? `translate(0 ${-lift})` : undefined}>
      {police && (<>
        <rect x="90" y={s.roof - 10} width="14" height="10" rx="3" {...p.f('sirenL', 2)} />
        <rect x="104" y={s.roof - 10} width="14" height="10" rx="3" {...p.f('sirenR', 2)} />
      </>)}
      {taxi && (<>
        <rect x="88" y={s.roof - 14} width="32" height="14" rx="3" {...p.f('sign', 2)} />
        {[0, 1, 2].map((i) => <rect key={i} x={92 + i * 9} y={s.roof - 10} width="5" height="5" {...p.deco('#263238', 1)} />)}
      </>)}
      {s.spare && <circle cx="14" cy="68" r="12" {...p.deco('#263238', 3)} />}
      <clipPath id={`b${clip}`}><path d={s.body} /></clipPath>
      <path d={s.body} {...p.f('body')} />
      {s.windows.map((d) => <path key={d} d={d} {...p.f('window', 2.5)} />)}
      <rect x={s.stripe[0]} y={s.stripe[2]} width={s.stripe[1] - s.stripe[0]} height="7" rx="3" clipPath={`url(#b${clip})`} {...p.f('stripe', 1.5)} />
      <circle cx={s.light[0]} cy={s.light[1]} r="5" {...p.f('lights', 2)} />
      {brand && !p.shadow && <LogoArt brand={brand} x={s.badge[0]} y={s.badge[1]} size={22} />}
      {lift > 0 && <path d={`M${s.wheels.x[0]} 94 L${s.wheels.x[0]} ${94 + lift - 6} M${s.wheels.x[1]} 94 L${s.wheels.x[1]} ${94 + lift - 6}`} {...p.line} strokeWidth={6} />}
    </g>
    <Wheel p={p} x={s.wheels.x[0]} y={wy} r={s.wheels.r} />
    <Wheel p={p} x={s.wheels.x[1]} y={wy} r={s.wheels.r} />
  </>);
}

/** A cab at the front (right), shared by the trucks. */
const Cab = ({ p, region = 'cab' }: { p: Pt; region?: string }) => (<>
  <path d="M138 92 L138 40 Q138 34 144 34 L168 34 Q176 34 180 42 L190 62 L190 92 Z" {...p.f(region)} />
  <path d="M146 42 L166 42 Q170 42 172 46 L180 62 L146 62 Z" {...p.f('window', 2.5)} />
  <circle cx="186" cy="78" r="5" {...p.f('lights', 2)} />
</>);

const ART: Record<Exclude<VehicleId, 'car' | 'policeCar' | 'taxi'>, (p: Pt, extra: VehicleProps) => ReactNode> = {
  bus: (p) => (<>
    <rect x="8" y="22" width="184" height="72" rx="12" {...p.f('body')} />
    {[18, 52, 86, 120].map((x) => <rect key={x} x={x} y="32" width="28" height="24" rx="4" {...p.f('window', 2.5)} />)}
    <path d="M156 32 L176 32 Q184 32 184 40 L184 56 L156 56 Z" {...p.f('window', 2.5)} />
    <rect x="8" y="64" width="184" height="7" {...p.f('stripe', 1.5)} />
    <circle cx="186" cy="80" r="5" {...p.f('lights', 2)} />
    <Wheel p={p} x={44} /><Wheel p={p} x={158} />
  </>),
  fireTruck: (p) => (<>
    <rect x="20" y="6" width="120" height="10" rx="3" {...p.f('ladder', 2)} />
    {[34, 54, 74, 94, 114].map((x) => <line key={x} x1={x} y1="6" x2={x} y2="16" {...p.line} strokeWidth={2} />)}
    <rect x="135" y="12" width="20" height="10" rx="4" {...p.f('siren', 2)} />
    <path d="M8 94 L8 26 L130 26 L130 22 L160 22 Q170 22 176 32 L190 58 L190 94 Z" {...p.f('body')} />
    <path d="M138 30 L160 30 Q166 30 170 36 L180 56 L138 56 Z" {...p.f('window', 2.5)} />
    <rect x="8" y="66" width="182" height="7" {...p.f('stripe', 1.5)} />
    {[18, 50, 82].map((x) => <rect key={x} x={x} y="36" width="26" height="24" rx="3" fill="none" stroke={p.ink} strokeWidth="2" pointerEvents="none" />)}
    <Wheel p={p} x={38} /><Wheel p={p} x={78} /><Wheel p={p} x={158} />
  </>),
  ambulance: (p) => (<>
    <rect x="100" y="12" width="22" height="10" rx="4" {...p.f('siren', 2)} />
    <path d="M8 94 L8 22 L138 22 L138 34 L162 34 Q170 34 176 42 L190 60 L190 94 Z" {...p.f('body')} />
    <path d="M142 40 L162 40 Q166 40 170 46 L178 58 L142 58 Z" {...p.f('window', 2.5)} />
    <rect x="8" y="68" width="182" height="7" {...p.f('stripe', 1.5)} />
    <path d="M60 30 L76 30 L76 40 L86 40 L86 56 L76 56 L76 66 L60 66 L60 56 L50 56 L50 40 L60 40 Z" {...p.f('cross', 2)} />
    <Wheel p={p} x={44} /><Wheel p={p} x={156} />
  </>),
  excavator: (p) => (<>
    <path d="M58 64 L72 54 L140 14 L152 24 L84 68 Z" {...p.f('arm')} />
    <path d="M138 14 L152 10 L184 60 L172 68 Z" {...p.f('arm')} />
    <path d="M166 62 L196 60 L192 88 Q182 96 170 86 Z" {...p.f('bucket')} />
    <rect x="22" y="56" width="98" height="32" rx="5" {...p.f('body')} />
    <rect x="78" y="24" width="40" height="36" rx="5" {...p.f('cab')} />
    <rect x="85" y="30" width="26" height="22" rx="3" {...p.f('window', 2.5)} />
    <rect x="14" y="88" width="120" height="24" rx="12" {...p.f('tracks')} />
    {[30, 56, 82, 108].map((x) => <circle key={x} cx={x + 4} cy="100" r="6" {...p.deco('#90a4ae')} />)}
  </>),
  bulldozer: (p) => (<>
    <rect x="102" y="30" width="7" height="26" {...p.deco(p.ink)} />
    <rect x="30" y="54" width="104" height="34" rx="5" {...p.f('body')} />
    <rect x="44" y="22" width="50" height="34" rx="5" {...p.f('cab')} />
    <rect x="51" y="28" width="36" height="22" rx="3" {...p.f('window', 2.5)} />
    <rect x="128" y="70" width="26" height="9" {...p.deco(p.ink)} />
    <path d="M150 40 Q172 62 156 112 L180 112 Q194 72 176 40 Z" {...p.f('blade')} />
    <rect x="12" y="88" width="134" height="24" rx="12" {...p.f('tracks')} />
    {[22, 50, 78, 106, 130].map((x) => <circle key={x} cx={x + 4} cy="100" r="6" {...p.deco('#90a4ae')} />)}
  </>),
  dumpTruck: (p, { load = 0 }) => (<>
    {Array.from({ length: Math.min(load, 10) }, (_, i) => (
      <circle key={i} cx={32 + (i % 5) * 21} cy={i < 5 ? 26 : 10} r="10" {...p.f('rocks', 2.5)} />
    ))}
    <path d="M12 30 L132 30 L124 84 L22 84 Z" {...p.f('bed')} />
    <rect x="12" y="84" width="180" height="8" {...p.deco(p.ink)} />
    <path d="M138 92 L138 40 Q138 34 144 34 L168 34 Q176 34 180 42 L190 62 L190 92 Z" {...p.f('cab')} />
    <path d="M146 42 L166 42 Q170 42 172 46 L180 62 L146 62 Z" {...p.f('window', 2.5)} />
    <Wheel p={p} x={42} r={17} /><Wheel p={p} x={84} r={17} /><Wheel p={p} x={164} r={17} />
  </>),
  crane: (p) => (<>
    <path d="M40 72 L54 72 L132 8 L122 2 Z" {...p.f('arm')} />
    {[60, 80, 100].map((x) => <line key={x} x1={x - 8} y1={x * -0.8 + 108} x2={x + 4} y2={x * -0.8 + 104} {...p.line} strokeWidth={2} />)}
    <line x1="127" y1="5" x2="127" y2="46" {...p.line} strokeWidth={2.5} />
    {p.so('hook', 5, <path d="M120 46 L134 46 L134 52 Q134 62 126 62 Q118 62 118 56" />)}
    <rect x="10" y="68" width="150" height="24" rx="4" {...p.f('body')} />
    <path d="M150 92 L150 44 Q150 38 156 38 L176 38 Q184 38 186 46 L192 64 L192 92 Z" {...p.f('cab')} />
    <path d="M157 46 L175 46 L182 64 L157 64 Z" {...p.f('window', 2.5)} />
    <Wheel p={p} x={34} y={98} r={13} /><Wheel p={p} x={70} y={98} r={13} /><Wheel p={p} x={170} y={98} r={13} />
  </>),
  mixer: (p) => (<>
    <rect x="10" y="78" width="180" height="10" {...p.deco(p.ink)} />
    <path d="M14 78 L130 78 L126 70 L20 70 Z" {...p.f('body', 2)} />
    <ellipse cx="72" cy="46" rx="60" ry="30" transform="rotate(-10 72 46)" {...p.f('drum')} />
    {p.so('stripe', 6, <path d="M30 34 Q60 60 92 22 M52 70 Q84 50 112 30" />)}
    <path d="M140 88 L140 40 Q140 34 146 34 L168 34 Q176 34 180 42 L190 62 L190 88 Z" {...p.f('cab')} />
    <path d="M148 42 L166 42 Q170 42 172 46 L180 62 L148 62 Z" {...p.f('window', 2.5)} />
    <Wheel p={p} x={40} /><Wheel p={p} x={80} /><Wheel p={p} x={164} />
  </>),
  roller: (p) => (<>
    <rect x="50" y="14" width="64" height="8" rx="3" {...p.f('roof', 2)} />
    <line x1="56" y1="22" x2="56" y2="56" {...p.line} strokeWidth={4} />
    <line x1="108" y1="22" x2="108" y2="56" {...p.line} strokeWidth={4} />
    <path d="M30 92 L30 60 Q30 54 36 54 L140 54 Q148 54 150 62 L152 92 Z" {...p.f('body')} />
    <rect x="118" y="74" width="40" height="10" {...p.deco(p.ink)} />
    <circle cx="156" cy="88" r="24" {...p.f('drum')} />
    <circle cx="156" cy="88" r="6" {...p.deco('#cfd8dc')} />
    <Wheel p={p} x={56} y={94} r={18} />
  </>),
  // ── On the street ──
  motorbike: (p) => (<>
    <path d="M46 92 L82 64 L128 64 L154 92" {...p.line} strokeWidth={6} />
    <path d="M154 92 L138 38" {...p.line} strokeWidth={6} />
    <path d="M126 34 L150 28" {...p.line} strokeWidth={6} />
    <path d="M24 78 L62 80" {...p.line} strokeWidth={6} />
    <path d="M68 66 Q74 44 104 44 L130 44 Q144 46 140 60 L126 72 L78 74 Z" {...p.f('body')} />
    <path d="M52 52 Q56 42 72 44 L100 46 L96 56 L58 58 Z" {...p.f('seat', 2.5)} />
    <circle cx="148" cy="50" r="7" {...p.f('lights', 2)} />
    <Wheel p={p} x={46} y={92} r={19} /><Wheel p={p} x={154} y={92} r={19} />
  </>),
  bicycle: (p) => (<>
    {[48, 152].map((x) => (
      <g key={x}>
        {p.so('wheels', 6, <circle cx={x} cy={84} r={26} />)}
        <path d={`M${x - 18} ${84} L${x + 18} ${84} M${x} ${66} L${x} ${102}`} {...p.line} strokeWidth={1.5} />
        <circle cx={x} cy={84} r={4} {...p.deco('#90a4ae')} />
      </g>
    ))}
    <path d="M84 44 L82 34" {...p.line} strokeWidth={4} />
    <path d="M136 46 L132 26 M120 24 L144 26" {...p.line} strokeWidth={5} />
    {p.so('body', 7, <path d="M48 84 L84 46 L136 46 L152 84 M84 46 L100 84 L136 46 M100 84 L48 84" />)}
    <path d="M68 34 Q82 26 96 32 L92 38 L72 38 Z" {...p.f('seat', 2.5)} />
  </>),
  truck: (p) => (<>
    <rect x="8" y="16" width="128" height="72" rx="4" {...p.f('body')} />
    <rect x="8" y="88" width="182" height="6" {...p.deco(p.ink)} />
    <Cab p={p} />
    <Wheel p={p} x={38} /><Wheel p={p} x={78} /><Wheel p={p} x={162} />
  </>),
  garbageTruck: (p) => (<>
    <path d="M30 90 L30 26 Q30 20 36 20 L136 20 L136 90 Z" {...p.f('body')} />
    <path d="M8 90 L8 40 Q8 26 22 24 L36 24 L36 90 Z" {...p.f('hopper')} />
    <rect x="52" y="40" width="68" height="8" rx="3" {...p.f('stripe', 1.5)} />
    <rect x="52" y="60" width="68" height="8" rx="3" {...p.f('stripe', 1.5)} />
    <rect x="8" y="88" width="182" height="6" {...p.deco(p.ink)} />
    <Cab p={p} />
    <Wheel p={p} x={40} /><Wheel p={p} x={84} /><Wheel p={p} x={162} />
  </>),
  towTruck: (p) => (<>
    {p.so('boom', 8, <path d="M46 62 L22 24" />)}
    <path d="M22 24 L22 46" {...p.line} strokeWidth={2.5} />
    {p.so('hook', 4, <path d="M22 46 Q22 58 30 56 Q35 54 33 48" />)}
    <rect x="10" y="62" width="106" height="30" rx="5" {...p.f('body')} />
    <path d="M108 92 L108 40 Q108 28 120 28 L158 28 Q168 28 174 40 L186 62 Q192 66 192 76 L192 92 Z" {...p.f('body')} />
    <rect x="134" y="20" width="18" height="9" rx="3" {...p.f('siren', 2)} />
    <path d="M120 36 L156 36 Q163 36 167 44 L175 60 L120 60 Z" {...p.f('window', 2.5)} />
    <circle cx="187" cy="72" r="5" {...p.f('lights', 2)} />
    <Wheel p={p} x={48} /><Wheel p={p} x={152} />
  </>),
  // ── Far away ──
  train: (p) => (<>
    <rect x="4" y="104" width="192" height="6" {...p.deco('#8d6e63')} />
    <rect x="14" y="18" width="62" height="70" rx="4" {...p.f('cab')} />
    <rect x="24" y="28" width="42" height="26" rx="3" {...p.f('window', 2.5)} />
    <rect x="72" y="42" width="98" height="46" rx="12" {...p.f('body')} />
    <rect x="134" y="16" width="20" height="28" {...p.f('chimney', 2.5)} />
    <path d="M128 16 L160 16 L156 6 L132 6 Z" {...p.f('chimney', 2.5)} />
    <rect x="14" y="80" width="160" height="10" {...p.f('stripe', 2)} />
    <path d="M170 70 L194 92 L170 92 Z" {...p.f('stripe', 2)} />
    <circle cx="176" cy="54" r="6" {...p.f('lights', 2)} />
    <Wheel p={p} x={42} y={96} r={14} /><Wheel p={p} x={98} y={96} r={14} /><Wheel p={p} x={146} y={96} r={14} />
  </>),
  plane: (p) => (<>
    <path d="M44 52 L20 14 L38 14 L72 50 Z" {...p.f('tail')} />
    <path d="M12 60 Q12 46 30 46 L158 44 Q190 46 196 60 Q190 76 158 76 L30 74 Q12 72 12 60 Z" {...p.f('body')} />
    <rect x="34" y="64" width="140" height="5" {...p.f('stripe', 1.5)} />
    {[58, 78, 98, 118, 138].map((x) => <circle key={x} cx={x} cy={55} r={5} {...p.f('window', 2)} />)}
    <path d="M164 50 Q180 50 188 58 L164 58 Z" {...p.f('window', 2)} />
    <path d="M84 66 L122 66 L98 108 L80 108 Z" {...p.f('wing')} />
  </>),
  boat: (p) => (<>
    <rect x="96" y="10" width="6" height="52" {...p.deco(p.ink)} />
    <path d="M102 12 L102 54 L150 54 Z" {...p.f('sail')} />
    <path d="M96 18 L96 54 L58 54 Z" {...p.f('sail')} />
    <path d="M8 60 L192 60 L168 98 L32 98 Z" {...p.f('body')} />
    <rect x="12" y="62" width="176" height="7" {...p.f('stripe', 1.5)} />
    {[64, 100, 136].map((x) => <circle key={x} cx={x} cy={82} r={6} {...p.f('window', 2)} />)}
    <path d="M0 102 Q25 94 50 102 T100 102 T150 102 T200 102 L200 120 L0 120 Z" {...p.deco('#4fc3f7')} />
  </>),
  helicopter: (p) => (<>
    {p.so('rotor', 6, <path d="M36 16 L172 16" />)}
    <rect x="100" y="16" width="8" height="18" {...p.deco(p.ink)} />
    <path d="M12 46 L72 54 L72 66 L12 58 Z" {...p.f('tail')} />
    <path d="M6 34 L20 34 L22 60 L8 60 Z" {...p.f('tail')} />
    <path d="M66 50 Q70 32 104 32 L134 32 Q176 34 182 64 Q184 82 160 84 L86 84 Q66 82 66 64 Z" {...p.f('body')} />
    <path d="M136 38 Q166 40 172 62 L136 62 Z" {...p.f('window', 2.5)} />
    <path d="M84 100 L172 100 M100 84 L96 100 M152 84 L156 100" {...p.line} strokeWidth={4} />
  </>),
  rocket: (p) => (<>
    <path d="M88 92 L100 116 L112 92 Z" {...p.f('flame', 2)} />
    <path d="M84 82 L64 104 L64 84 L84 60 Z" {...p.f('fin')} />
    <path d="M116 82 L136 104 L136 84 L116 60 Z" {...p.f('fin')} />
    <path d="M100 4 Q124 26 120 92 L80 92 Q76 26 100 4 Z" {...p.f('body')} />
    <path d="M100 4 Q111 14 115 28 L85 28 Q89 14 100 4 Z" {...p.f('nose', 2.5)} />
    <circle cx="100" cy="52" r="11" {...p.f('window', 2.5)} />
  </>),
};

export function VehicleArt(props: VehicleProps) {
  const { v, fills, body, brand, label, shadow, className, align = 'ground', lineArt, box } = props;
  const p = painter(VEHICLE_DEFAULTS[v], fills, shadow, lineArt);
  const top = label && (v === 'car' || v === 'policeCar') ? -48 : 0;
  return (
    <svg {...(box ? { x: box.x, y: box.y, width: box.w, height: box.h } : {})} viewBox={`0 ${top} 200 ${120 - top}`} preserveAspectRatio={align === 'center' ? 'xMidYMid meet' : 'xMidYMax meet'} className={className} role="img" aria-label={v}>
      {v === 'car' ? <Car p={p} body={body} brand={brand} label={label} />
        : v === 'policeCar' ? <Car p={p} body="sedan" label={label} police />
        : v === 'taxi' ? <Car p={p} body="sedan" taxi />
        : ART[v](p, props)}
    </svg>
  );
}
