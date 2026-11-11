// Capital letters as "roads": each letter is a list of strokes in writing order; each stroke is a
// polyline in a 100×100 box (arcs are sampled). Angles: 0° = right, 90° = down (screen coordinates).
export type Pt = [number, number];

function arc(cx: number, cy: number, rx: number, ry: number, from: number, to: number, step = 10): Pt[] {
  const n = Math.max(2, Math.ceil(Math.abs(to - from) / step));
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = ((from + ((to - from) * i) / n) * Math.PI) / 180;
    return [Math.round((cx + rx * Math.cos(a)) * 10) / 10, Math.round((cy + ry * Math.sin(a)) * 10) / 10] as Pt;
  });
}

export const STROKES: Record<string, Pt[][]> = {
  A: [[[50, 10], [18, 90]], [[50, 10], [82, 90]], [[30, 62], [70, 62]]],
  B: [[[25, 10], [25, 90]], [[25, 10], [52, 10], ...arc(52, 30, 20, 20, -90, 90), [25, 50]], [[25, 50], [55, 50], ...arc(55, 70, 22, 20, -90, 90), [25, 90]]],
  C: [arc(54, 50, 32, 40, -45, -315)],
  D: [[[25, 10], [25, 90]], [[25, 10], [42, 10], ...arc(42, 50, 36, 40, -90, 90), [25, 90]]],
  E: [[[75, 10], [25, 10], [25, 90], [75, 90]], [[25, 50], [65, 50]]],
  F: [[[75, 10], [25, 10], [25, 90]], [[25, 50], [65, 50]]],
  G: [[...arc(52, 50, 32, 40, -40, -360), [60, 50]]],
  H: [[[25, 10], [25, 90]], [[75, 10], [75, 90]], [[25, 50], [75, 50]]],
  I: [[[50, 10], [50, 90]]],
  J: [[[65, 10], [65, 68], ...arc(45, 68, 20, 22, 0, 180)]],
  K: [[[25, 10], [25, 90]], [[72, 10], [25, 55]], [[40, 42], [75, 90]]],
  L: [[[28, 10], [28, 90], [75, 90]]],
  M: [[[18, 90], [18, 10], [50, 60], [82, 10], [82, 90]]],
  N: [[[22, 90], [22, 10], [78, 90], [78, 10]]],
  O: [arc(50, 50, 32, 40, -90, -450)],
  P: [[[25, 90], [25, 10], [52, 10], ...arc(52, 30, 20, 20, -90, 90), [25, 50]]],
  Q: [arc(50, 48, 32, 38, -90, -450), [[58, 70], [82, 92]]],
  R: [[[25, 90], [25, 10], [52, 10], ...arc(52, 30, 20, 20, -90, 90), [25, 50]], [[46, 50], [75, 90]]],
  S: [[...arc(50, 30, 24, 20, -20, -270), ...arc(50, 70, 24, 20, -90, 160).slice(1)]],
  T: [[[15, 10], [85, 10]], [[50, 10], [50, 90]]],
  U: [[[22, 10], [22, 62], ...arc(50, 62, 28, 28, 180, 0), [78, 10]]],
  V: [[[18, 10], [50, 90], [82, 10]]],
  W: [[[10, 10], [30, 90], [50, 30], [70, 90], [90, 10]]],
  X: [[[20, 10], [80, 90]], [[80, 10], [20, 90]]],
  Y: [[[18, 10], [50, 50]], [[82, 10], [50, 50], [50, 90]]],
  Z: [[[20, 10], [80, 10], [20, 90], [80, 90]]],
};

/** Dense points every ~1 unit along a stroke, with the distance travelled to each point. */
export function sample(stroke: Pt[]): { pts: Pt[]; len: number[] } {
  const pts: Pt[] = [stroke[0]];
  const len = [0];
  for (let i = 1; i < stroke.length; i++) {
    const [ax, ay] = stroke[i - 1];
    const [bx, by] = stroke[i];
    const d = Math.hypot(bx - ax, by - ay);
    const n = Math.max(1, Math.ceil(d));
    for (let k = 1; k <= n; k++) {
      pts.push([ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n]);
      len.push(len[len.length - 1] + d / n);
    }
  }
  return { pts, len };
}
