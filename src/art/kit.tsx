import { cloneElement, type ReactElement, type SVGAttributes } from 'react';
import type { Fills } from './defaults';

export const OUT = '#263238';
const SHADOW = '#37474f';

type P = SVGAttributes<SVGElement> & { 'data-region'?: string };

/**
 * Region painter: f(region) for filled shapes, so(region) for outlined lines, txt(region) for lettering,
 * deco(color) for fixed-color details that aren't paintable (wheel hubs, chassis bars).
 * lineArt: the coloring page — every region and detail is white with its outline, exactly like the blank
 * Paint Shop page (white hides the lines behind each part). The Drawing Board lays it over the paint with
 * mix-blend-mode: multiply, so white turns see-through and only the lines stay on top.
 */
export function painter(defaults: Fills, fills?: Fills, shadow?: boolean, lineArt?: boolean) {
  const col = (r: string) => (lineArt ? '#ffffff' : shadow ? SHADOW : fills?.[r] ?? defaults[r]);
  const ink = shadow ? SHADOW : OUT;
  return {
    f: (r: string, w = 3): P => ({ 'data-region': r, fill: col(r), stroke: ink, strokeWidth: w, strokeLinejoin: 'round' }),
    s: (r: string, w = 8): P => ({ 'data-region': r, fill: 'none', stroke: col(r), strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round', pointerEvents: 'stroke' }),
    /** Text region with a dark outline under the fill, so it stays visible when painted white. */
    txt: (r: string): P => ({ 'data-region': r, fill: col(r), stroke: ink, strokeWidth: 3, strokeLinejoin: 'round', paintOrder: 'stroke', fontWeight: 800, textAnchor: 'middle', fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif' }),
    /** Stroke-drawn region with a dark outline: draws the shape twice (wide dark line, then the colored line). */
    so: (r: string, w: number, el: ReactElement) => (
      <>
        {cloneElement(el, { fill: 'none', stroke: ink, strokeWidth: w + 4, strokeLinecap: 'round', strokeLinejoin: 'round', pointerEvents: 'none' })}
        {cloneElement(el, { 'data-region': r, fill: 'none', stroke: col(r), strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round', pointerEvents: 'stroke' })}
      </>
    ),
    deco: (color: string, w = 2): P => (lineArt ? { fill: '#ffffff', stroke: ink, strokeWidth: w, pointerEvents: 'none' } : { fill: shadow ? SHADOW : color, pointerEvents: 'none' }),
    ink,
    line: { stroke: ink, strokeWidth: 3, fill: 'none', strokeLinecap: 'round' } as P,
    shadow: !!shadow,
  };
}
