// Not a real test: `npm run og:image` draws the 1200×630 social-share picture (public/og-image.png)
// from the game's own vehicle art. Skipped in normal `npm test`.
import { writeFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { it } from 'vitest';
import { VehicleArt } from '../src/art/vehicles';

const out = process.env.OG_IMAGE;

it.skipIf(!out)('writes the share image SVG', () => {
  const art = renderToStaticMarkup(
    <g>
      <VehicleArt v="excavator" box={{ x: 610, y: 250, w: 330, h: 198 }} />
      <VehicleArt v="dumpTruck" load={4} box={{ x: 860, y: 300, w: 300, h: 180 }} />
      <VehicleArt v="car" body="sports" fills={{ body: '#e53935' }} box={{ x: 560, y: 400, w: 330, h: 198 }} />
      <VehicleArt v="fireTruck" box={{ x: 880, y: 430, w: 290, h: 174 }} />
    </g>,
  );
  const font = "Arial Rounded MT Bold, Arial, sans-serif";
  const chip = (x: number, label: string, fill: string) =>
    `<g transform="translate(${x} 420)"><rect width="120" height="64" rx="18" fill="${fill}" stroke="#263238" stroke-width="5"/><text x="60" y="45" font-size="36" font-family="${font}" font-weight="900" text-anchor="middle" fill="#263238">${label}</text></g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#29b6f6"/><stop offset="1" stop-color="#e1f5fe"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#sky)"/>
  <circle cx="1090" cy="95" r="62" fill="#fdd835"/><circle cx="1090" cy="95" r="86" fill="#fdd835" opacity=".25"/>
  <path d="M760 120 q0-40 40-40 q14-36 56-30 q34-24 66 6 q44 0 44 38 q0 30-34 30 h-142 q-30 0-30-4z" fill="#fff"/>
  <rect y="560" width="1200" height="70" fill="#546e7a"/><rect y="552" width="1200" height="10" fill="#43a047"/>
  <g fill="#fdd835">${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${30 + i * 200}" y="590" width="110" height="14" rx="7"/>`).join('')}</g>
  <text x="60" y="170" font-size="104" font-family="${font}" font-weight="900" fill="#fff" stroke="#1565c0" stroke-width="10" paint-order="stroke">Little Garage</text>
  <text x="64" y="250" font-size="54" font-family="${font}" font-weight="900" fill="#1565c0">Gara Nhỏ</text>
  <text x="64" y="320" font-size="34" font-family="${font}" fill="#263238">Car games for little learners · 3–4 years</text>
  <text x="64" y="366" font-size="30" font-family="${font}" fill="#37474f">Trò chơi ô tô cho bé 3–4 tuổi</text>
  ${chip(60, '123', '#fff59d')}${chip(195, 'ABC', '#bbdefb')}${chip(330, 'Paint', '#f8bbd0')}
  ${art}
</svg>`;
  writeFileSync(out!, svg);
});
