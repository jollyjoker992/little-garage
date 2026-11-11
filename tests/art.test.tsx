import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ArtById } from '../src/art/ArtById';
import { defaultsFor, LOGO_DEFAULTS, VEHICLE_DEFAULTS } from '../src/art/defaults';
import { COLORS } from '../src/content/colors';
import { PAINT_PAGES } from '../src/games/custom/PaintShop';

const palette = new Set(Object.values(COLORS).map((c) => c.toLowerCase()));

describe('art', () => {
  it('every default color comes from the palette (so Paint Shop can match it)', () => {
    for (const fills of [...Object.values(VEHICLE_DEFAULTS), ...Object.values(LOGO_DEFAULTS)]) {
      for (const [r, c] of Object.entries(fills)) expect(palette.has(c.toLowerCase()), `${r}=${c}`).toBe(true);
    }
  });

  it.each(PAINT_PAGES)('%s: drawn regions == defaults regions', (page) => {
    const html = renderToStaticMarkup(<ArtById art={page} />);
    const drawn = new Set([...html.matchAll(/data-region="([^"]+)"/g)].map((m) => m[1]));
    expect([...drawn].sort()).toEqual(Object.keys(defaultsFor(page)).sort());
  });

  // <text> hit-tests by whole character boxes (tapping above "Ford" painted the letters) and depends on
  // device fonts. Lettering must be outlines (src/art/logoText.ts). Check tap areas with scripts/tap-audit.js.
  // Drawing Board pages are the blank coloring page: only white fills (they vanish under multiply) and lines.
  it.each(PAINT_PAGES)('%s: line art has no colored fills', (page) => {
    const html = renderToStaticMarkup(<ArtById art={page} lineArt />);
    const fills = [...html.matchAll(/fill="([^"]+)"/g)].map((m) => m[1].toLowerCase()).filter((f) => !['none', 'transparent', '#ffffff', '#fff'].includes(f));
    expect(fills).toEqual([]);
  });

  // ...and its shapes are exactly the blank Paint Shop page (same elements, same geometry).
  it.each(PAINT_PAGES)('%s: line art matches the blank Paint Shop page', (page) => {
    const geom = (html: string) => html.replace(/ (fill|stroke|stroke-width|pointer-events|paint-order)="[^"]*"/g, '');
    const blank = Object.fromEntries(Object.keys(defaultsFor(page)).map((r) => [r, '#ffffff']));
    expect(geom(renderToStaticMarkup(<ArtById art={page} lineArt />))).toBe(geom(renderToStaticMarkup(<ArtById art={page} fills={blank} />)));
  });

  it.each(PAINT_PAGES)('%s: no <text> elements', (page) => {
    expect(renderToStaticMarkup(<ArtById art={page} />)).not.toContain('<text');
  });
});
