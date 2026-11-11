// Drawing Board brushes. Pure canvas drawing: a stroke is stored as normalized points (0..1 of the
// canvas size) plus a seed, so replaying it (undo, rotation, reopening) draws exactly the same pixels.
import { makeRng, type Rng } from './rng';

export type Tool = 'pencil' | 'crayon' | 'brush' | 'rainbow' | 'stars' | 'stamp' | 'eraser';
export const TOOLS: Tool[] = ['pencil', 'crayon', 'brush', 'rainbow', 'stars', 'stamp', 'eraser'];
export const TOOL_ICON: Record<Tool, string> = { pencil: '✏️', crayon: '🖍️', brush: '🖌️', rainbow: '🌈', stars: '⭐', stamp: '🚗', eraser: '🧽' };

export type Pt = [number, number];
export type Stroke = { tool: Tool; color: string; size: number; seed: number; points: Pt[]; stamp?: string };

/** Base sizes in px for a 1000px-wide canvas (scaled to the real canvas), times the size setting. */
export const BASE_SIZE: Record<Tool, number> = { pencil: 5, crayon: 15, brush: 32, rainbow: 18, stars: 13, stamp: 170, eraser: 44 };
export const SIZE_MUL = { small: 0.6, medium: 1, big: 1.7 } as const;
export type SizeName = keyof typeof SIZE_MUL;

const STAR_COLORS = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#f06292'];

export type Surface = {
  ctx: CanvasRenderingContext2D;
  /** Canvas size in CSS px (the context is already scaled for devicePixelRatio). */
  w: number;
  h: number;
  stampImage: (id: string) => HTMLImageElement | undefined;
};

function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, rot: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.45 : r;
    const a = rot + (i * Math.PI) / 5;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = Math.max(1, r * 0.12);
  ctx.strokeStyle = 'rgba(38,50,56,.6)';
  ctx.stroke();
}

/** Draws one stroke point by point. The same points always produce the same drawing. */
export class StrokePainter {
  private rng: Rng;
  private dist = 0;
  private nextStar = 0;
  private last: [number, number] | null = null;

  constructor(private s: Surface, private stroke: Stroke) {
    this.rng = makeRng(stroke.seed);
  }

  add(p: Pt) {
    const { ctx, w: cw, h: ch } = this.s;
    const b: [number, number] = [p[0] * cw, p[1] * ch];
    const a = this.last ?? b;
    this.last = b;
    const k = cw / 1000;
    const w = this.stroke.size * k;
    const { tool } = this.stroke;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    ctx.save();

    if (tool === 'stamp') {
      const img = this.stroke.stamp ? this.s.stampImage(this.stroke.stamp) : undefined;
      if (img && img.width) {
        const hh = (w * img.height) / img.width;
        ctx.drawImage(img, b[0] - w / 2, b[1] - hh / 2, w, hh);
      }
    } else if (tool === 'stars') {
      const gap = w * 2.2;
      while (this.nextStar <= this.dist + len) {
        const t = len === 0 ? 0 : (this.nextStar - this.dist) / len;
        star(ctx, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, w * (0.7 + this.rng() * 0.6), STAR_COLORS[Math.floor(this.rng() * STAR_COLORS.length)], this.rng() * Math.PI);
        this.nextStar += gap;
      }
    } else {
      if (tool === 'eraser') ctx.globalCompositeOperation = 'destination-out';
      if (tool === 'crayon') ctx.globalAlpha = 0.88;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = w;
      ctx.strokeStyle = tool === 'rainbow' ? `hsl(${(this.stroke.seed % 360) + this.dist * 0.45} 90% 55%)` : tool === 'eraser' ? '#000' : this.stroke.color;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0] + (len < 0.01 ? 0.01 : 0), b[1]);
      ctx.stroke();
      if (tool === 'crayon') {
        // Waxy texture: little light specks along the line.
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(255,255,255,.38)';
        const n = Math.max(2, Math.round(len / 1.6));
        for (let i = 0; i < n; i++) {
          const t = this.rng();
          const x = a[0] + (b[0] - a[0]) * t + (this.rng() - 0.5) * w;
          const y = a[1] + (b[1] - a[1]) * t + (this.rng() - 0.5) * w;
          ctx.beginPath();
          ctx.arc(x, y, (0.5 + this.rng()) * k * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    this.dist += len;
    ctx.restore();
  }
}

export function paintStroke(s: Surface, stroke: Stroke) {
  const p = new StrokePainter(s, stroke);
  for (const pt of stroke.points) p.add(pt);
}
