// Generates docs/SCRIPTS.md from src/content/i18n/*.ts so the script doc never drifts from the game.
// Run: npm run docs:scripts   (Node 22.18+ strips TypeScript types natively)
import { writeFileSync } from 'node:fs';
import { en } from '../src/content/i18n/en.ts';
import { vi } from '../src/content/i18n/vi.ts';

const SECTIONS = [
  ['App', /^app\.|^garage\.|^sleep$/],
  ['Feedback (all games)', /^(cheer|tryAgain|hint|reveal|levelUp|reward)/],
  ['Zones', /^zone\./],
  ['Game names & intros', /^game\./],
  ['Prompts', /^(p|say)\./],
  ['Jobs (Who Does This Job?)', /^job\./],
  ['Vehicles', /^v\./],
  ['Numbers', /^num\./],
  ['Colors', /^color\./],
  ['Shapes, sizes, objects, car bodies', /^(shape|size|obj|body)\./],
  ['Paint Shop', /^paint\./],
  ['Build a Car', /^build\./],
  ['Traffic Light', /^traffic\./],
  ['Logo Match', /^memory\./],
];

const fmt = (v) => (Array.isArray(v) ? v.map((x) => `• ${x}`).join('<br>') : v).replace(/\|/g, '\\|');
const used = new Set();
let out = `# Voice scripts

> Generated from \`src/content/i18n/en.ts\` and \`vi.ts\` by \`npm run docs:scripts\`. **Edit the .ts files, then regenerate.**

- Lines with several options (•) are picked at random each time.
- \`{name}\` slots are filled by the game (a color, a vehicle, a brand…).
- **Recorded voice:** put \`public/audio/<lang>/<key>.mp3\` (e.g. \`public/audio/vi/cheer.mp3\`) and add \`"<lang>/<key>"\` to \`public/audio/manifest.json\`. Recordings replace the browser voice for lines **without** \`{slots}\`; lines with slots always use the browser voice.

`;
for (const [title, re] of SECTIONS) {
  const keys = Object.keys(en).filter((k) => re.test(k) && !used.has(k));
  if (!keys.length) continue;
  keys.forEach((k) => used.add(k));
  out += `## ${title}\n\n| Key | English | Tiếng Việt |\n|---|---|---|\n`;
  for (const k of keys) out += `| \`${k}\` | ${fmt(en[k])} | ${fmt(vi[k] ?? '⚠️ missing')} |\n`;
  out += '\n';
}
const rest = Object.keys(en).filter((k) => !used.has(k));
if (rest.length) {
  out += `## Other\n\n| Key | English | Tiếng Việt |\n|---|---|---|\n`;
  for (const k of rest) out += `| \`${k}\` | ${fmt(en[k])} | ${fmt(vi[k] ?? '⚠️ missing')} |\n`;
}
writeFileSync(new URL('../docs/SCRIPTS.md', import.meta.url), out);
console.log(`docs/SCRIPTS.md: ${Object.keys(en).length} lines`);
