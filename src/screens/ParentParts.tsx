// Small building blocks of the Grown-ups screen.
import type { ReactNode } from 'react';

/** One setting: label (+ a short hint) on the left, its control on the right (below it on phones). */
export function Row({ label, hint, htmlFor, children }: { label: ReactNode; hint?: ReactNode; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="prow">
      <label className="plabel" htmlFor={htmlFor}>
        <span>{label}</span>
        {hint && <small>{hint}</small>}
      </label>
      <div className="pctl">{children}</div>
    </div>
  );
}

/** Segmented buttons for a small set of choices. */
export function Seg<T extends string | number>({ value, options, onPick, small }: { value: T; options: [T, ReactNode][]; onPick: (v: T) => void; small?: boolean }) {
  return (
    <div className={`seg ${small ? 'small' : ''}`}>
      {options.map(([v, label]) => <button key={String(v)} className={value === v ? 'on' : ''} onClick={() => onPick(v)}>{label}</button>)}
    </div>
  );
}
