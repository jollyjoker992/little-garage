import type { ReactNode } from 'react';
import { back as goBack } from '../app/router';
import { sfx } from '../engine/sound';

export function IconHome({ size = 44 }: { size?: number }) {
  return (<svg viewBox="0 0 48 48" width={size} height={size}><path d="M6 24 L24 8 L42 24 L38 24 L38 40 L28 40 L28 30 L20 30 L20 40 L10 40 L10 24 Z" fill="#fff" stroke="#263238" strokeWidth="3" strokeLinejoin="round" /></svg>);
}
export function IconSpeaker() {
  return (<svg viewBox="0 0 48 48" width="44" height="44"><path d="M8 18 L16 18 L26 10 L26 38 L16 30 L8 30 Z" fill="#fff" stroke="#263238" strokeWidth="3" strokeLinejoin="round" /><path d="M32 18 Q37 24 32 30 M36 13 Q45 24 36 35" fill="none" stroke="#263238" strokeWidth="3.5" strokeLinecap="round" /></svg>);
}
export function IconBack() {
  return (<svg viewBox="0 0 48 48" width="44" height="44"><path d="M30 8 L12 24 L30 40" fill="none" stroke="#263238" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}

/** `back` is where ⬅ goes when there is no previous in-app screen; `onBack` overrides it (e.g. close a sub-view). */
export function TopBar({ onReplay, back = '#/', onBack, children }: { onReplay?: () => void; back?: string; onBack?: () => void; children?: ReactNode }) {
  return (
    <div className="topbar">
      <button className="round-btn" onClick={() => { sfx('pop'); if (onBack) onBack(); else goBack(back); }} aria-label="Back"><IconBack /></button>
      <div className="topbar-mid">{children}</div>
      {onReplay ? <button className="round-btn" onClick={onReplay} aria-label="Say it again"><IconSpeaker /></button> : <span className="round-btn-spacer" />}
    </div>
  );
}

export function Dots({ total, done }: { total: number; done: number }) {
  return (
    <div className="dots">
      {Array.from({ length: total }, (_, i) => <span key={i} className={i < done ? 'on' : ''} />)}
    </div>
  );
}
