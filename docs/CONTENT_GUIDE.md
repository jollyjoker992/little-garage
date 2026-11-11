# Content guide — how to change things

Always run `npm test` after a change. The tests catch missing translations, missing regions and broken rounds.

## Change wording / translations
Edit `src/content/i18n/en.ts` **and** `vi.ts` (same keys and `{slots}` in both), then `npm run docs:scripts` to refresh `docs/SCRIPTS.md`.

## Record a real voice (e.g. Dad's)
1. Record a short mp3 per line, e.g. `public/audio/vi/cheer.mp3`, `public/audio/vi/game.count.intro.mp3`.
2. Add `"vi/cheer"`, `"vi/game.count.intro"` to `public/audio/manifest.json`.
3. Lines with `{slots}` (e.g. `p.wash.find`) can't be recorded; they always use the browser voice.
For random lines like `cheer`, the recording is used every time.

## Make a game easier / harder
Edit `src/content/levels.ts`. Example: count to 4 at Level 1 → `count: { 1: { min: 1, max: 4, choices: 2 } }`. Add `rounds: 8` to change session length.

## Add a brand
1. `src/content/brands.ts`: `{ id: 'peugeot', name: 'Peugeot', letter: 'P', color: 'blue', body: 'sedan' }` and add `'peugeot'` to `BrandId`. Add `spoken: '…'` if the name reads badly aloud (MG uses `'M G'`).
2. `src/art/defaults.ts`: `nissan: { bg: C.white, mark: C.black }` (palette colors only).
3. `src/art/logos.tsx`: a drawing in a 100×100 box — look at the real logo first (Wikipedia infobox) and match its shape. Use `f('bg')` for filled shapes, `so('mark', 6, <path d="…" />)` for line-drawn parts (drawn with a dark outline so they stay visible on a blank coloring page) and `txt('mark')` for lettering (also outlined).
It automatically appears in Brand Letters, Logo Match, Build a Car and Paint Shop.
4. **Lettering:** never use `<text>`. Convert words to outlines once (see the header of `src/art/logoText.ts`) and draw them with `f('mark')`. Tests fail if a drawing contains `<text>`.
5. **Check it:** `npm run art:preview` writes every drawing (colored + blank) to `art-preview/`. Then run the app, tap ▶, and paste `scripts/tap-audit.js` into the browser console. Every page should show `bad ≈ 0`.

## Add a vehicle
1. `src/content/vehicles.ts`: add the id to `VehicleId` and `VEHICLES` (category, optional `sound`, `letterEn`).
2. `src/art/defaults.ts`: its regions + default colors.
3. `src/art/vehicles.tsx`: drawing in a 200×120 box facing right, regions via `p.f('...')`.
4. i18n: `v.<id>` in both languages, plus `job.<id>` if you add it to `JOB_VEHICLES`.
It automatically shows up in Odd One Out, Big & Small, Shadow Garage, Pattern Road, Paint Shop and stickers.

## Add a choice game
1. `src/content/catalog.ts`: add `{ id, zones, status: 'ready', icon, about }`.
2. `src/content/levels.ts`: a config type plus levels 1–3.
3. `src/games/rounds/<id>.ts`: a pure `Generator` returning a `Round` (copy `whoJob.ts`, the simplest). Register it in `rounds/index.ts`.
4. i18n: `game.<id>`, `game.<id>.intro` and any prompt keys, in both languages.
5. `npm test`: your generator is tested automatically.

## Add a custom game (drag-and-drop, free play…)
Add a component in `src/games/custom/`, register it in `CUSTOM` in `src/games/registry.tsx` and in `tests/catalog.test.ts`, then add it to the catalog and i18n as above. Use `say()`, `sfx()`, `recordRound()` and `<Reward/>` for consistent feel.

## Build a Car: add a car type or a trait
- **Car type:** add it to `CarBody` / `CAR_BODIES` in `src/content/vehicles.ts` and its geometry to `CAR_SHAPES` in `src/art/vehicles.tsx` (body path, windows, roof, roof span, rear deck, badge, stripe, light, wheels; optional `lift`, `spare`, `open`). It becomes a Paint Shop page and appears in the games automatically; add `body.<id>` in both languages.
- **Trait option:** add it to the list in `src/content/carParts.ts`, draw it in `src/art/CustomCar.tsx`, and add its voice line (`wheels.*`, `pattern.*`, `extra.*`, `driver.*`, `engine.*`).

## Add a Drawing Board tool
Add it to `Tool`, `TOOLS`, `TOOL_ICON` and `BASE_SIZE` in `src/engine/brushes.ts` and draw it in `StrokePainter.add()`. Use `this.rng` for any randomness so undo replays it identically. Add a `tool.<id>` line in both languages. Stickers are every Paint Shop page automatically.

## Hide a game temporarily
Grown-ups settings (tap ⚙️ on the home screen) → untick it. Or set `status: 'planned'` in the catalog.

## About the logos
The badges are simplified drawings meant for a young child to recognize, not exact copies. The brand names and logos are trademarks of their owners and are **not** covered by the project's MIT License (see [Trademarks](../README.md#trademarks)). When you add a brand, draw your own simplified badge instead of copying artwork. To ship without brands: brands come from `BRANDS` in `src/content/brands.ts` and are drawn by `src/art/logos.tsx`. They appear in the brand games (`readBrand`, `brandLetters`, `brandMemory`), as Paint Shop pages, as the Logo option in Build a Car, as the badge on drawn cars (`src/art/vehicles.tsx`, `src/art/CustomCar.tsx`), and as some game icons in `src/content/catalog.ts`.
