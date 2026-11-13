// The car the child builds: any body + paint, second colour pattern, wheels & rims, door number,
// licence plate, roof extras and a driver in the window. Pure display (not a Paint Shop page).
import { useId } from 'react';
import { COLORS } from '../content/colors';
import { MODEL_MAX, rimHex, type BuildSpec } from '../content/carParts';
import { LogoArt } from './logos';
import { OUT } from './kit';
import { CAR_SHAPES, pathCenter } from './vehicles';

const WHEEL_SCALE = { small: 0.8, normal: 1, monster: 1.65 } as const;

/** True for colours where dark spokes would disappear (black, brown, purple…). */
const isDark = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 < 110;
};

/** The rim inside a black tyre: 4 styles, in the chosen wheel colour. */
export function Rim({ x, y, r, style, color }: { x: number; y: number; r: number; style: number; color: string }) {
  const hub = r * 0.45;
  const line = isDark(color) ? '#eceff1' : OUT;
  if (style === 1) return (<>
    <circle cx={x} cy={y} r={hub} fill={color} />
    {[0, 72, 144, 216, 288].map((a) => <line key={a} x1={x} y1={y} x2={x + Math.cos((a * Math.PI) / 180) * hub} y2={y + Math.sin((a * Math.PI) / 180) * hub} stroke={line} strokeWidth="1.6" />)}
  </>);
  if (style === 2) return (<>
    <circle cx={x} cy={y} r={hub} fill={color} />
    {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={x + Math.cos((a * Math.PI) / 180) * hub * 0.55} cy={y + Math.sin((a * Math.PI) / 180) * hub * 0.55} r={hub * 0.18} fill={line} />)}
  </>);
  if (style === 3) return (<>
    <circle cx={x} cy={y} r={hub * 1.15} fill={color} stroke={OUT} strokeWidth="1.5" />
    <circle cx={x} cy={y} r={hub * 0.4} fill={isDark(color) ? '#eceff1' : '#fff'} stroke={OUT} strokeWidth="1" />
  </>);
  return <circle cx={x} cy={y} r={hub} fill={color} />;
}

export function Driver({ kind, x, y, s }: { kind: string; x: number; y: number; s: number }) {
  const eyes = (<><circle cx={x - s * 0.32} cy={y - s * 0.1} r={s * 0.12} fill={OUT} /><circle cx={x + s * 0.32} cy={y - s * 0.1} r={s * 0.12} fill={OUT} /></>);
  const smile = <path d={`M${x - s * 0.3} ${y + s * 0.25} Q${x} ${y + s * 0.5} ${x + s * 0.3} ${y + s * 0.25}`} fill="none" stroke={OUT} strokeWidth={s * 0.1} strokeLinecap="round" />;
  if (kind === 'boy') return (<g>
    <circle cx={x} cy={y} r={s} fill="#ffcc80" stroke={OUT} strokeWidth="1.2" />
    <path d={`M${x - s} ${y - s * 0.1} Q${x - s * 0.9} ${y - s * 1.3} ${x} ${y - s * 1.05} Q${x + s * 0.9} ${y - s * 1.3} ${x + s} ${y - s * 0.1} Q${x} ${y - s * 0.7} ${x - s} ${y - s * 0.1} Z`} fill="#5d4037" />
    {eyes}{smile}
  </g>);
  if (kind === 'dog') return (<g>
    <ellipse cx={x - s * 0.95} cy={y} rx={s * 0.35} ry={s * 0.7} fill="#5d4037" />
    <ellipse cx={x + s * 0.95} cy={y} rx={s * 0.35} ry={s * 0.7} fill="#5d4037" />
    <circle cx={x} cy={y} r={s} fill="#bcaaa4" stroke={OUT} strokeWidth="1.2" />
    {eyes}<ellipse cx={x} cy={y + s * 0.25} rx={s * 0.22} ry={s * 0.16} fill={OUT} />
  </g>);
  if (kind === 'cat') return (<g>
    <path d={`M${x - s * 0.95} ${y - s * 0.3} L${x - s * 0.75} ${y - s * 1.35} L${x - s * 0.15} ${y - s * 0.85} Z M${x + s * 0.95} ${y - s * 0.3} L${x + s * 0.75} ${y - s * 1.35} L${x + s * 0.15} ${y - s * 0.85} Z`} fill="#fb8c00" stroke={OUT} strokeWidth="1.2" />
    <circle cx={x} cy={y} r={s} fill="#ffb74d" stroke={OUT} strokeWidth="1.2" />
    {eyes}<path d={`M${x - s * 0.9} ${y + s * 0.2} L${x - s * 0.35} ${y + s * 0.25} M${x + s * 0.9} ${y + s * 0.2} L${x + s * 0.35} ${y + s * 0.25}`} stroke={OUT} strokeWidth="1" />
  </g>);
  if (kind === 'bear') return (<g>
    <circle cx={x - s * 0.75} cy={y - s * 0.8} r={s * 0.38} fill="#795548" stroke={OUT} strokeWidth="1.2" />
    <circle cx={x + s * 0.75} cy={y - s * 0.8} r={s * 0.38} fill="#795548" stroke={OUT} strokeWidth="1.2" />
    <circle cx={x} cy={y} r={s} fill="#8d6e63" stroke={OUT} strokeWidth="1.2" />
    <ellipse cx={x} cy={y + s * 0.3} rx={s * 0.42} ry={s * 0.32} fill="#d7ccc8" />
    {eyes}<circle cx={x} cy={y + s * 0.2} r={s * 0.13} fill={OUT} />
  </g>);
  if (kind === 'bunny') return (<g>
    <ellipse cx={x - s * 0.45} cy={y - s * 1.35} rx={s * 0.28} ry={s * 0.8} fill="#fafafa" stroke={OUT} strokeWidth="1.2" />
    <ellipse cx={x + s * 0.45} cy={y - s * 1.35} rx={s * 0.28} ry={s * 0.8} fill="#fafafa" stroke={OUT} strokeWidth="1.2" />
    <ellipse cx={x - s * 0.45} cy={y - s * 1.3} rx={s * 0.12} ry={s * 0.5} fill="#f8bbd0" />
    <ellipse cx={x + s * 0.45} cy={y - s * 1.3} rx={s * 0.12} ry={s * 0.5} fill="#f8bbd0" />
    <circle cx={x} cy={y} r={s} fill="#fafafa" stroke={OUT} strokeWidth="1.2" />
    {eyes}<ellipse cx={x} cy={y + s * 0.2} rx={s * 0.16} ry={s * 0.11} fill="#f06292" />
    <circle cx={x - s * 0.6} cy={y + s * 0.3} r={s * 0.16} fill="#f8bbd0" opacity=".8" /><circle cx={x + s * 0.6} cy={y + s * 0.3} r={s * 0.16} fill="#f8bbd0" opacity=".8" />
  </g>);
  return null;
}

function Star({ x, y, r, fill }: { x: number; y: number; r: number; fill: string }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)}`;
  });
  return <path d={`M${pts.join(' L')} Z`} fill={fill} />;
}

export function CustomCar({ spec, className }: { spec: BuildSpec; className?: string }) {
  const s = CAR_SHAPES[spec.body];
  const id = useId().replace(/:/g, '');
  const wheelR = s.wheels.r * WHEEL_SCALE[spec.wheels];
  const lift = (s.lift ?? 0) + Math.max(0, wheelR - s.wheels.r) * 0.9;
  const wy = 111 - wheelR;
  const c1 = COLORS[spec.color];
  const c2 = COLORS[spec.color2];
  const ink = { stroke: OUT, strokeWidth: 3, strokeLinejoin: 'round' as const };
  const front = s.windows[s.windows.length - 1];
  const [dx, dy] = s.open ? [86, 58] : pathCenter(front);
  const top = s.roof;
  const [rx1, rx2] = s.roofSpan;
  const rc = (rx1 + rx2) / 2;
  const has = (e: string) => spec.extras.includes(e as never);

  return (
    <svg viewBox="-8 -40 216 160" className={className} role="img" aria-label={`${spec.color} ${spec.body}`}>
      <defs>
        <clipPath id={`b${id}`}><path d={s.body} /></clipPath>
        <clipPath id={`w${id}`}><path d={front} /></clipPath>
      </defs>
      <g transform={lift ? `translate(0 ${-lift})` : undefined}>
        {/* roof extras behind the body */}
        {has('rack') && (<g>
          <rect x={rx1} y={top - 6} width={rx2 - rx1} height="4" rx="2" fill="#78909c" stroke={OUT} strokeWidth="2" />
          <rect x={rx1 + 6} y={top - 18} width={rx2 - rx1 - 12} height="12" rx="4" fill={c2} stroke={OUT} strokeWidth="2.5" />
        </g>)}
        {has('siren') && (<g>
          <rect x={rc - 16} y={top - 9} width="16" height="9" rx="3" fill="#e53935" stroke={OUT} strokeWidth="2" />
          <rect x={rc} y={top - 9} width="16" height="9" rx="3" fill="#1e88e5" stroke={OUT} strokeWidth="2" />
        </g>)}
        {has('taxi') && (<g>
          <rect x={rc - 17} y={top - 13} width="34" height="13" rx="3" fill="#fdd835" stroke={OUT} strokeWidth="2" />
          <text x={rc} y={top - 3.5} fontSize="9" fontWeight="900" textAnchor="middle" fill={OUT} fontFamily="Arial, sans-serif">TAXI</text>
        </g>)}
        {has('flag') && (<g>
          <line x1="22" y1={s.deck} x2="22" y2={s.deck - 36} stroke={OUT} strokeWidth="2.5" />
          <path d={`M22 ${s.deck - 36} L46 ${s.deck - 29} L22 ${s.deck - 22} Z`} fill={c2} stroke={OUT} strokeWidth="2" />
        </g>)}
        {has('spoiler') && (<g>
          <line x1="20" y1={s.deck} x2="20" y2={s.deck - 12} stroke={OUT} strokeWidth="3" />
          <line x1="32" y1={s.deck} x2="32" y2={s.deck - 12} stroke={OUT} strokeWidth="3" />
          <rect x="8" y={s.deck - 18} width="34" height="7" rx="3" fill={c2} stroke={OUT} strokeWidth="2.5" />
        </g>)}
        {s.spare && <circle cx="14" cy="68" r="12" fill="#263238" />}
        {/* body + pattern */}
        <path d={s.body} fill={c1} />
        <g clipPath={`url(#b${id})`}>
          {spec.pattern === 'none' && <rect x={s.stripe[0]} y={s.stripe[2]} width={s.stripe[1] - s.stripe[0]} height="7" rx="3" fill="#fff" stroke={OUT} strokeWidth="1.5" />}
          {spec.pattern === 'stripes' && (<>
            <rect x="0" y={s.stripe[2] - 8} width="200" height="6" fill={c2} />
            <rect x="0" y={s.stripe[2] + 2} width="200" height="6" fill={c2} />
          </>)}
          {spec.pattern === 'twoTone' && <rect x="0" y="0" width="200" height={(s.deck + s.stripe[2]) / 2} fill={c2} />}
          {spec.pattern === 'flames' && (
            <path d={`M200 ${s.stripe[2] + 14} L130 ${s.stripe[2] + 14} Q118 ${s.stripe[2] + 6} 104 ${s.stripe[2] + 10} Q118 ${s.stripe[2] - 2} 112 ${s.stripe[2] - 12} Q128 ${s.stripe[2] - 4} 134 ${s.stripe[2] - 16} Q142 ${s.stripe[2] - 4} 152 ${s.stripe[2] - 14} Q156 ${s.stripe[2] - 2} 170 ${s.stripe[2] - 10} Q170 ${s.stripe[2]} 200 ${s.stripe[2] - 6} Z`}
              fill={c2} stroke={OUT} strokeWidth="1.5" />
          )}
          {spec.pattern === 'stars' && [30, 70, 110, 150, 185].map((x, i) => <Star key={x} x={x} y={s.stripe[2] + (i % 2 ? -6 : 6)} r={7} fill={c2} />)}
          {spec.pattern === 'dots' && Array.from({ length: 24 }, (_, i) => <circle key={i} cx={8 + (i % 12) * 16 + (i >= 12 ? 8 : 0)} cy={s.stripe[2] + (i >= 12 ? 10 : -4)} r="4" fill={c2} />)}
        </g>
        <path d={s.body} fill="none" {...ink} />
        {/* windows + driver */}
        {s.windows.map((d) => <path key={d} d={d} fill="#81d4fa" {...ink} strokeWidth={2.5} />)}
        {spec.driver !== 'none' && (
          s.open
            ? <Driver kind={spec.driver} x={dx} y={dy} s={7} />
            : <g clipPath={`url(#w${id})`}><Driver kind={spec.driver} x={dx} y={dy + 3} s={6.5} /></g>
        )}
        {!s.open && <path d={front} fill="none" {...ink} strokeWidth={2.5} />}
        <circle cx={s.light[0]} cy={s.light[1]} r="5" fill="#fdd835" stroke={OUT} strokeWidth="2" />
        {/* door number, logo, plate */}
        {spec.number > 0 && (<g>
          <circle cx={s.badge[0] + 8} cy={s.badge[1] + 10} r="10" fill="#fff" stroke={OUT} strokeWidth="2.5" />
          <text x={s.badge[0] + 8} y={s.badge[1] + 15} fontSize="14" fontWeight="900" textAnchor="middle" fill={OUT} fontFamily="Arial, sans-serif">{spec.number}</text>
        </g>)}
        {spec.brand && <LogoArt brand={spec.brand} x={s.light[0] - 30} y={s.light[1] - 8} size={16} />}

        {lift > 0 && <path d={`M${s.wheels.x[0]} 94 L${s.wheels.x[0]} ${94 + lift - 4} M${s.wheels.x[1]} 94 L${s.wheels.x[1]} ${94 + lift - 4}`} stroke={OUT} strokeWidth="6" strokeLinecap="round" />}
      </g>
      {/* wheels */}
      {s.wheels.x.map((x) => (
        <g key={x}>
          <circle cx={x} cy={wy} r={wheelR} fill="#263238" stroke={OUT} strokeWidth="3" />
          <Rim x={x} y={wy} r={wheelR} style={spec.rim} color={rimHex(spec.rimColor ?? 'silver')} />
        </g>
      ))}
      {/* model name and plate: drawn over the wheels so big wheels never hide them */}
      {spec.model && <g transform={lift ? `translate(0 ${-lift})` : undefined}><ModelName text={spec.model} s={s} /></g>}
      {spec.plate && (<g transform={lift ? `translate(0 ${-lift})` : undefined}>
        <rect x={s.stripe[0] - 18} y="80" width={Math.max(24, spec.plate.length * 5.2 + 7)} height="11" rx="2" fill="#fff" stroke={OUT} strokeWidth="1.8" />
        <text x={s.stripe[0] - 18 + Math.max(24, spec.plate.length * 5.2 + 7) / 2} y="88.3" fontSize="7.5" fontWeight="900" textAnchor="middle" fill={OUT} fontFamily="Arial, sans-serif">{spec.plate}</text>
      </g>)}
    </svg>
  );
}

/** The model name ("RAPTOR") on the back half of the side, above the stripe and behind the door number
 *  (where real cars wear their model badge): white capitals with a dark outline, squeezed to fit. */
function ModelName({ text, s }: { text: string; s: (typeof CAR_SHAPES)[keyof typeof CAR_SHAPES] }) {
  const word = text.slice(0, MODEL_MAX).toUpperCase();
  const x1 = s.stripe[0] + (s.spare ? 18 : s.deck >= 80 ? 24 : 12); // after the spare tyre / the thin tail of a race car
  const x2 = s.badge[0] - 6; // a gap before the door number
  const size = 9.5;
  const room = x2 - x1;
  const natural = word.length * size * 0.74;
  return (
    <text x={(x1 + x2) / 2} y={s.stripe[2] - 2} fontSize={size} fontWeight="900" fontStyle="italic" textAnchor="middle" fontFamily="Arial, sans-serif"
      fill="#fff" stroke={OUT} strokeWidth="2.4" strokeLinejoin="round" paintOrder="stroke"
      {...(natural > room ? { textLength: room, lengthAdjust: 'spacingAndGlyphs' } : {})}>{word}</text>
  );
}

/** Small icons for the option buttons. */
export function WheelIcon({ rim, color = '#cfd8dc' }: { rim: number; color?: string }) {
  return (
    <svg viewBox="0 0 40 40" className="thing-svg">
      <circle cx="20" cy="20" r="17" fill="#263238" />
      <Rim x={20} y={20} r={17} style={rim} color={color} />
    </svg>
  );
}
export function DriverIcon({ kind }: { kind: string }) {
  return (
    <svg viewBox="0 0 40 40" className="thing-svg">
      <rect x="2" y="2" width="36" height="36" rx="8" fill="#81d4fa" stroke={OUT} strokeWidth="2.5" />
      {kind === 'none' ? <path d="M12 12 L28 28 M28 12 L12 28" stroke="#90a4ae" strokeWidth="4" strokeLinecap="round" /> : <Driver kind={kind} x={20} y={23} s={11} />}
    </svg>
  );
}

/** A clear swatch of a pattern (customer order cards). */
export function PatternSwatch({ pattern }: { pattern: string }) {
  const c = '#fb8c00';
  return (
    <svg viewBox="0 0 48 48" className="thing-svg">
      <rect x="2" y="2" width="44" height="44" rx="10" fill="#fff" stroke={OUT} strokeWidth="2.5" />
      {pattern === 'stripes' && (<><rect x="2" y="16" width="44" height="6" fill={c} /><rect x="2" y="26" width="44" height="6" fill={c} /></>)}
      {pattern === 'flames' && <path d="M8 40 Q6 28 14 22 Q14 30 19 30 Q16 18 24 8 Q26 20 31 22 Q32 16 36 14 Q42 26 40 40 Z" fill={c} stroke={OUT} strokeWidth="1.8" />}
      {pattern === 'stars' && (<><Star x={15} y={16} r={8} fill={c} /><Star x={33} y={18} r={7} fill={c} /><Star x={24} y={34} r={8} fill={c} /></>)}
      {pattern === 'dots' && [12, 24, 36].flatMap((x) => [14, 26, 38].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="4.5" fill={c} />))}
      {pattern === 'twoTone' && <rect x="2" y="2" width="44" height="22" rx="10" fill={c} />}
    </svg>
  );
}
