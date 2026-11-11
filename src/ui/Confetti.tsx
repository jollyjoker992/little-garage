import { useMemo } from 'react';

const COLORS = ['#e53935', '#fdd835', '#43a047', '#1e88e5', '#fb8c00', '#8e24aa', '#f06292'];

export function Confetti({ n = 36 }: { n?: number }) {
  const bits = useMemo(
    () => Array.from({ length: n }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      dur: 1.2 + Math.random() * 1.2,
      color: COLORS[i % COLORS.length],
      rot: Math.random() * 360,
    })),
    [n],
  );
  return (
    <div className="confetti" aria-hidden>
      {bits.map((b, i) => (
        <span key={i} style={{ left: `${b.left}%`, background: b.color, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s`, transform: `rotate(${b.rot}deg)` }} />
      ))}
    </div>
  );
}
