// English Street art: Zip the tow truck, the ship, and the action icons. Display only (not Paint Shop pages).
import type { ActionId } from '../content/english';
import { OUT } from './kit';

const ink = { stroke: OUT, strokeWidth: 3, strokeLinejoin: 'round' as const };

/** Zip: a small blue tow truck with big eyes in the windshield. viewBox 0 0 210 120, facing right, ground at y≈111. */
export function ZipArt({ lights, className }: { lights?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 210 120" className={className ?? 'thing-svg'} preserveAspectRatio="xMidYMax meet">
      {lights && <path d="M190 64 L210 50 L210 92 L190 80 Z" fill="#fff59d" opacity=".85" />}
      {/* boom + hook */}
      <path d="M44 62 L20 22" stroke={OUT} strokeWidth="11" strokeLinecap="round" />
      <path d="M44 62 L20 22" stroke="#fb8c00" strokeWidth="6" strokeLinecap="round" />
      <path d="M20 22 L20 48" stroke={OUT} strokeWidth="2.5" />
      <path d="M20 48 Q20 60 28 58 Q33 56 31 50" fill="none" stroke={OUT} strokeWidth="4" strokeLinecap="round" />
      <rect x="34" y="52" width="22" height="12" rx="3" fill="#90a4ae" {...ink} />
      {/* bed */}
      <rect x="10" y="62" width="106" height="32" rx="6" fill="#1e88e5" {...ink} />
      <path d="M18 72 H108" stroke="#fdd835" strokeWidth="5" strokeLinecap="round" />
      {/* cab */}
      <path d="M108 94 L108 40 Q108 28 120 28 L158 28 Q168 28 174 40 L186 62 Q192 66 192 76 L192 94 Z" fill="#1e88e5" {...ink} />
      <rect x="134" y="20" width="18" height="9" rx="3" fill="#fb8c00" {...ink} />
      {/* windshield with eyes */}
      <path d="M120 36 L156 36 Q163 36 167 44 L175 60 L120 60 Z" fill="#b3e5fc" {...ink} />
      <ellipse cx="136" cy="48" rx="9" ry="10" fill="#fff" stroke={OUT} strokeWidth="2" />
      <ellipse cx="157" cy="48" rx="9" ry="10" fill="#fff" stroke={OUT} strokeWidth="2" />
      <circle cx="139" cy="50" r="4.5" fill={OUT} />
      <circle cx="160" cy="50" r="4.5" fill={OUT} />
      <circle cx="140.5" cy="48" r="1.5" fill="#fff" />
      <circle cx="161.5" cy="48" r="1.5" fill="#fff" />
      {/* smile on the door */}
      <path d="M128 72 Q144 84 160 72" fill="none" stroke={OUT} strokeWidth="3.5" strokeLinecap="round" />
      {/* light + bumper */}
      <circle cx="187" cy="70" r="5" fill={lights ? '#fff59d' : '#fdd835'} {...ink} strokeWidth={2} />
      <rect x="184" y="86" width="12" height="8" rx="3" fill="#90a4ae" {...ink} strokeWidth={2} />
      {/* wheels */}
      {[48, 152].map((x) => (
        <g key={x}>
          <circle cx={x} cy="96" r="15" fill={OUT} />
          <circle cx={x} cy="96" r="6" fill="#cfd8dc" />
        </g>
      ))}
    </svg>
  );
}

/** The ship at the port: hull, stacked containers and an open ramp. viewBox 0 0 300 170. */
export function ShipArt({ className }: { className?: string }) {
  const boxes: [number, number, string][] = [[60, 62, '#e53935'], [112, 62, '#1e88e5'], [164, 62, '#43a047'], [86, 30, '#fdd835'], [138, 30, '#8e24aa']];
  return (
    <svg viewBox="0 0 300 170" className={className ?? 'thing-svg'} preserveAspectRatio="xMidYMax meet">
      <path d="M0 150 Q25 140 50 150 T100 150 T150 150 T200 150 T250 150 T300 150 V170 H0 Z" fill="#4fc3f7" />
      <rect x="226" y="40" width="16" height="56" fill="#eceff1" {...ink} />
      <path d="M232 40 L232 18" stroke={OUT} strokeWidth="3" />
      <path d="M232 18 L252 24 L232 30 Z" fill="#e53935" {...ink} strokeWidth={2} />
      {boxes.map(([x, y, c], i) => (
        <g key={i}>
          <rect x={x} y={y} width="50" height="32" rx="2" fill={c} {...ink} />
          {[12, 24, 36].map((dx) => <path key={dx} d={`M${x + dx} ${y + 5} V${y + 27}`} stroke="rgba(0,0,0,.25)" strokeWidth="2.5" />)}
        </g>
      ))}
      <path d="M20 94 L280 94 L258 146 L44 146 Z" fill="#37474f" {...ink} />
      <path d="M28 108 L272 108" stroke="#e53935" strokeWidth="6" />
      {[70, 110, 150, 190, 230].map((x) => <circle key={x} cx={x} cy="126" r="6" fill="#b3e5fc" stroke={OUT} strokeWidth="2" />)}
    </svg>
  );
}

/** Action buttons / pictures for Zip Says and the action words. viewBox 0 0 100 100. */
export function ActionIcon({ a }: { a: ActionId }) {
  const disc = (fill: string) => <circle cx="50" cy="50" r="44" fill={fill} {...ink} strokeWidth={4} />;
  switch (a) {
    case 'go': return (<svg viewBox="0 0 100 100" className="thing-svg">{disc('#43a047')}<path d="M30 50 H66 M52 34 L68 50 L52 66" fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" /></svg>);
    case 'stop': return (<svg viewBox="0 0 100 100" className="thing-svg"><path d="M32 6 H68 L94 32 V68 L68 94 H32 L6 68 V32 Z" fill="#e53935" {...ink} strokeWidth={4} /><rect x="24" y="42" width="52" height="16" rx="5" fill="#fff" /></svg>);
    case 'slow': return (<svg viewBox="0 0 100 100" className="thing-svg">{disc('#fdd835')}
      {/* a little turtle */}
      <ellipse cx="48" cy="56" rx="24" ry="16" fill="#66bb6a" {...ink} />
      <path d="M32 54 Q48 34 64 54" fill="none" stroke={OUT} strokeWidth="2.5" />
      <circle cx="76" cy="54" r="8" fill="#a5d6a7" {...ink} />
      <circle cx="78" cy="52" r="1.8" fill={OUT} />
      {[34, 60].map((x) => <rect key={x} x={x} y="66" width="8" height="9" rx="3" fill="#a5d6a7" {...ink} strokeWidth={2} />)}
    </svg>);
    case 'fast': return (<svg viewBox="0 0 100 100" className="thing-svg">{disc('#fb8c00')}{[24, 42, 60].map((x) => <path key={x} d={`M${x} 32 L${x + 16} 50 L${x} 68`} fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />)}</svg>);
    case 'honk': return (<svg viewBox="0 0 100 100" className="thing-svg">{disc('#29b6f6')}
      <path d="M22 42 H36 L60 28 V72 L36 58 H22 Z" fill="#fff" {...ink} />
      <path d="M68 38 Q74 50 68 62 M76 30 Q86 50 76 70" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    </svg>);
    case 'lights': return (<svg viewBox="0 0 100 100" className="thing-svg">{disc('#5c6bc0')}
      <path d="M38 22 Q20 22 20 50 Q20 78 38 78 Z" fill="#fff59d" {...ink} />
      {[30, 42, 54, 66].map((y) => <path key={y} d={`M48 ${y} L80 ${y + (y - 48) * 0.3}`} stroke="#fff59d" strokeWidth="6" strokeLinecap="round" />)}
    </svg>);
  }
}
