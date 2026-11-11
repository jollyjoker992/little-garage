import { useRef, useState, type ReactNode } from 'react';

/** Parent gate: must be held for `ms` (a 3-year-old taps, a parent holds). */
export function HoldButton({ onDone, ms = 3000, children, className = '' }: { onDone: () => void; ms?: number; children: ReactNode; className?: string }) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<number>();
  const start = () => {
    setHolding(true);
    timer.current = window.setTimeout(() => {
      setHolding(false);
      onDone();
    }, ms);
  };
  const stop = () => {
    setHolding(false);
    clearTimeout(timer.current);
  };
  return (
    <button
      className={`hold-btn ${holding ? 'holding' : ''} ${className}`}
      style={{ ['--hold-ms' as string]: `${ms}ms` }}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(e) => e.preventDefault()}
      aria-label="Grown-ups: hold for 3 seconds"
    >
      <span className="hold-ring" />
      {children}
    </button>
  );
}
