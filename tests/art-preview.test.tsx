// Not a real test: `npm run art:preview` writes every drawing to art-preview/*.svg (+ a contact sheet)
// so new logos/vehicles can be eyeballed without running the app. Skipped in normal `npm test`.
import { mkdirSync, writeFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { it } from 'vitest';
import { ArtById } from '../src/art/ArtById';
import { defaultsFor } from '../src/art/defaults';
import { PAINT_PAGES } from '../src/games/custom/PaintShop';

const dir = process.env.ART_PREVIEW;

it.skipIf(!dir)('writes art previews', () => {
  mkdirSync(dir!, { recursive: true });
  const blank = (art: string) => Object.fromEntries(Object.keys(defaultsFor(art)).map((r) => [r, '#ffffff']));
  const tiles: string[] = [];
  PAINT_PAGES.forEach((page, i) => {
    writeFileSync(`${dir}/${page.replace(':', '_')}-line.svg`, renderToStaticMarkup(<ArtById art={page} lineArt />).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" '));
    for (const [suffix, fills] of [['', undefined], ['-blank', blank(page)]] as const) {
      const svg = renderToStaticMarkup(<ArtById art={page} fills={fills} />).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" ');
      writeFileSync(`${dir}/${page.replace(':', '_')}${suffix}.svg`, svg);
      const inner = renderToStaticMarkup(<ArtById art={page} fills={fills} />).replace('<svg ', `<svg x="${(i % 8) * 110 + 5}" y="${Math.floor(i / 8) * 230 + (suffix ? 115 : 5)}" width="100" height="100" `);
      tiles.push(inner);
    }
  });
  writeFileSync(`${dir}/sheet.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="890" height="${Math.ceil(PAINT_PAGES.length / 8) * 230}"><rect width="100%" height="100%" fill="#fff"/>${tiles.join('')}</svg>`);
});
