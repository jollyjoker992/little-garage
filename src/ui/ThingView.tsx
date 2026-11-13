import type { ReactNode } from 'react';
import type { Thing } from '../content/things';
import { COLORS } from '../content/colors';
import { VehicleArt } from '../art/vehicles';
import { LogoArt } from '../art/logos';
import { OUT } from '../art/kit';
import { ActionIcon, ShipArt, ZipArt } from '../art/english';

const FONT = 'Arial Rounded MT Bold, Arial, sans-serif';

function Shape({ shape, color }: { shape: string; color: string }) {
  const p = { fill: color, stroke: OUT, strokeWidth: 4, strokeLinejoin: 'round' as const };
  switch (shape) {
    case 'circle': return <circle cx="50" cy="50" r="38" {...p} />;
    case 'square': return <rect x="14" y="14" width="72" height="72" rx="4" {...p} />;
    case 'triangle': return <path d="M50 10 L90 86 L10 86 Z" {...p} />;
    case 'rectangle': return <rect x="6" y="26" width="88" height="48" rx="4" {...p} />;
    case 'star': return <path d="M50 6 L61 37 L94 37 L67 57 L77 90 L50 70 L23 90 L33 57 L6 37 L39 37 Z" {...p} />;
    default: return <ellipse cx="50" cy="50" rx="44" ry="28" {...p} />;
  }
}

function ObjectArt({ obj }: { obj: string }) {
  const ink = { stroke: OUT, strokeWidth: 4, strokeLinejoin: 'round' as const };
  switch (obj) {
    case 'wheel': return (<><circle cx="50" cy="50" r="40" fill="#263238" {...ink} /><circle cx="50" cy="50" r="18" fill="#cfd8dc" {...ink} /></>);
    case 'window': return (<><rect x="14" y="14" width="72" height="72" fill="#81d4fa" {...ink} /><path d="M50 14 V86 M14 50 H86" {...ink} /></>);
    case 'sign': return (<><path d="M50 8 L94 88 L6 88 Z" fill="#fdd835" {...ink} /><text x="50" y="78" fontSize="44" fontWeight="900" textAnchor="middle" fill={OUT} fontFamily={FONT}>!</text></>);
    case 'door': return (<><rect x="8" y="22" width="84" height="56" rx="6" fill="#e53935" {...ink} /><rect x="64" y="46" width="16" height="6" rx="3" fill="#cfd8dc" {...ink} strokeWidth={2} /></>);
    case 'star': return <path d="M50 6 L61 37 L94 37 L67 57 L77 90 L50 70 L23 90 L33 57 L6 37 L39 37 Z" fill="#fdd835" {...ink} />;
    default: return (<><ellipse cx="50" cy="50" rx="40" ry="26" fill="#81d4fa" stroke={OUT} strokeWidth={8} /><rect x="74" y="62" width="20" height="10" fill={OUT} /></>);
  }
}

function Sign({ text, bg, color = '#263238', round }: { text: string; bg: string; color?: string; round?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="thing-svg">
      {round ? <circle cx="50" cy="50" r="44" fill={bg} stroke={OUT} strokeWidth="4" /> : <rect x="6" y="6" width="88" height="88" rx="18" fill={bg} stroke={OUT} strokeWidth="4" />}
      <text x="50" y="72" fontSize={text.length > 1 ? 52 : 64} fontWeight="900" textAnchor="middle" fill={color} fontFamily={FONT}>{text}</text>
    </svg>
  );
}

function Icon({ icon }: { icon: string }) {
  if (icon === 'ship') return <ShipArt />;
  if (icon === 'trafficLight') {
    return (
      <svg viewBox="0 0 100 100" className="thing-svg">
        <rect x="30" y="4" width="40" height="92" rx="12" fill={OUT} />
        <circle cx="50" cy="22" r="11" fill="#e53935" />
        <circle cx="50" cy="50" r="11" fill="#fdd835" />
        <circle cx="50" cy="78" r="11" fill="#43a047" />
      </svg>
    );
  }
  if (icon === 'crayon') {
    return (
      <svg viewBox="0 0 100 100" className="thing-svg">
        <path d="M10 80 Q24 60 36 74 T62 70 T88 62" fill="none" stroke="#e53935" strokeWidth="7" strokeLinecap="round" />
        <path d="M10 92 Q30 80 46 88 T86 82" fill="none" stroke="#1e88e5" strokeWidth="6" strokeLinecap="round" />
        <g transform="rotate(-40 50 40)">
          <rect x="22" y="30" width="56" height="20" rx="4" fill="#fdd835" stroke={OUT} strokeWidth="3.5" />
          <rect x="36" y="30" width="22" height="20" fill="#43a047" stroke={OUT} strokeWidth="3" />
          <path d="M78 30 L94 40 L78 50 Z" fill="#fdd835" stroke={OUT} strokeWidth="3.5" strokeLinejoin="round" />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" className="thing-svg">
      <path d="M8 44 L50 12 L92 44 L92 92 L8 92 Z" fill="#ef6c00" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
      <rect x="24" y="50" width="52" height="42" fill="#cfd8dc" stroke={OUT} strokeWidth="4" />
      {[60, 70, 80].map((y) => <line key={y} x1="24" y1={y} x2="76" y2={y} stroke={OUT} strokeWidth="3" />)}
      <path d="M50 20 L54 31 L65 31 L56 38 L59 49 L50 42 L41 49 L44 38 L35 31 L46 31 Z" fill="#fdd835" stroke={OUT} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

/** Renders any Thing so it fits inside its box. `fit="center"` centers vehicles (icons); default keeps them on the ground. */
/** A garage building with a sign on the roof: a color, or a picture of the vehicles that park there. */
function GarageArt({ sign }: { sign: string }) {
  const isColor = sign in COLORS;
  return (
    <svg viewBox="0 0 120 100" className="thing-svg">
      <path d="M6 40 L60 8 L114 40 L114 96 L6 96 Z" fill={isColor ? COLORS[sign as keyof typeof COLORS] : '#ffcc80'} stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
      <rect x="24" y="50" width="72" height="46" fill="#eceff1" stroke={OUT} strokeWidth="3.5" />
      {[60, 70, 80, 90].map((y) => <line key={y} x1="24" y1={y} x2="96" y2={y} stroke={OUT} strokeWidth="2.5" />)}
      {!isColor && (<>
        <circle cx="60" cy="31" r="23" fill="#fff" stroke={OUT} strokeWidth="3" />
        {sign === 'construction' && <VehicleArt v="excavator" box={{ x: 39, y: 15, w: 42, h: 30 }} align="center" />}
        {sign === 'road' && <VehicleArt v="car" body="sedan" box={{ x: 39, y: 16, w: 42, h: 30 }} align="center" />}
        {sign === 'emergency' && (<>
          <path d="M47 42 Q47 20 60 20 Q73 20 73 42 Z" fill="#e53935" stroke={OUT} strokeWidth="3" />
          <rect x="43" y="41" width="34" height="6" rx="2" fill={OUT} />
          <path d="M60 11 V15 M43 17 L47 21 M77 17 L73 21" stroke="#fb8c00" strokeWidth="3" strokeLinecap="round" />
        </>)}
      </>)}
    </svg>
  );
}

const DICE: Record<number, [number, number][]> = {
  1: [[50, 50]], 2: [[30, 30], [70, 70]], 3: [[27, 27], [50, 50], [73, 73]],
  4: [[30, 30], [70, 30], [30, 70], [70, 70]], 5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[30, 24], [70, 24], [30, 50], [70, 50], [30, 76], [70, 76]],
};
/** Quick Look: rocks in a truck bed, laid out like dice so they can be seen at a glance. */
function Dots({ n }: { n: number }) {
  const groups = n <= 6 ? [n] : [5, n - 5];
  const w = groups.length * 100;
  return (
    <svg viewBox={`0 0 ${w} 100`} className="thing-svg">
      {groups.map((g, gi) => (
        <g key={gi} transform={`translate(${gi * 100} 0)`}>
          <rect x="4" y="4" width="92" height="92" rx="12" fill="#fdd835" stroke={OUT} strokeWidth="4" />
          {DICE[g].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="11" fill="#8d6e63" stroke={OUT} strokeWidth="3" />)}
        </g>
      ))}
    </svg>
  );
}

/** A written word on a card (Read the Brand). Long words get a smaller size so they always fit. */
/** --k: font size as a % of the card's width (from the longest word, so all fit). */
export const wordSize = (longest: number) => Math.min(26, 130 / Math.max(1, longest));
function Word({ text, k = wordSize(text.length) }: { text: string; k?: number }) {
  return <div className="word-card" style={{ ['--k' as string]: k }}>{text}</div>;
}

/** A picture with its written name underneath; the first letter is big and red. */
function Captioned({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className="thing-cap">
      <div className="thing-cap-art">{children}</div>
      <div className="caption"><b>{caption[0]}</b>{caption.slice(1)}</div>
    </div>
  );
}

export function ThingView({ thing, fit = 'ground' }: { thing: Thing; fit?: 'ground' | 'center' }) {
  if ((thing.t === 'logo' || thing.t === 'vehicle') && thing.caption) {
    const { caption, ...plain } = thing;
    return <Captioned caption={caption}><ThingView thing={plain as Thing} fit={fit} /></Captioned>;
  }
  switch (thing.t) {
    case 'vehicle': {
      const fills = thing.color ? { body: COLORS[thing.color], ...(thing.v === 'dumpTruck' ? { bed: COLORS[thing.color] } : {}) } : undefined;
      return (
        <div className={`thing-vehicle ${fit}`} style={{ ['--s' as string]: thing.scale ?? 1 }}>
          <VehicleArt v={thing.v} body={thing.body} brand={thing.brand} label={thing.label} load={thing.load} shadow={thing.shadow} fills={fills} align={fit} className="thing-svg" />
        </div>
      );
    }
    case 'logo': return <LogoArt brand={thing.brand} className="thing-svg" />;
    case 'letter': return <Sign text={thing.ch} bg="#fff" />;
    case 'number': return <Sign text={String(thing.n)} bg="#fff59d" round />;
    case 'shape': return <svg viewBox="0 0 100 100" className="thing-svg"><Shape shape={thing.shape} color={COLORS[thing.color]} /></svg>;
    case 'object': return <svg viewBox="0 0 100 100" className="thing-svg"><ObjectArt obj={thing.obj} /></svg>;
    case 'cone':
      return (
        <svg viewBox="0 0 100 100" className="thing-svg">
          <path d="M40 10 L60 10 L82 84 L18 84 Z" fill={COLORS[thing.color]} stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
          <path d="M33 40 L67 40 L71 54 L29 54 Z" fill="#fff" />
          <rect x="8" y="84" width="84" height="10" rx="4" fill={OUT} />
          {thing.label && (<>
            <circle cx="50" cy="47" r="20" fill="#fff" stroke={OUT} strokeWidth="3" />
            <text x="50" y="57" fontSize="28" fontWeight="900" textAnchor="middle" fill={OUT} fontFamily={FONT}>{thing.label}</text>
          </>)}
        </svg>
      );
    case 'icon': return <Icon icon={thing.icon} />;
    case 'garage': return <GarageArt sign={thing.sign} />;
    case 'word': return <Word text={thing.text} k={thing.k} />;
    case 'dots': return <Dots n={thing.n} />;
    case 'mystery': return <Sign text="?" bg="#e1f5fe" color="#1e88e5" round />;
    case 'zip': return <div className={`thing-vehicle ${fit}`}><ZipArt lights={thing.lights} /></div>;
    case 'action': return <ActionIcon a={thing.a} />;
    case 'speaker':
      return (
        <svg viewBox="0 0 100 100" className="thing-svg">
          <circle cx="50" cy="50" r="46" fill="#fff59d" stroke={OUT} strokeWidth="4" />
          <path d="M26 40 L38 40 L54 26 L54 74 L38 60 L26 60 Z" fill={OUT} />
          <path d="M62 38 Q70 50 62 62 M70 30 Q84 50 70 70" fill="none" stroke={OUT} strokeWidth="5" strokeLinecap="round" />
        </svg>
      );
  }
}
