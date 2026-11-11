# Architecture

**Stack:** Vite + React 18 + TypeScript, plain CSS, vite-plugin-pwa (offline/home-screen), Vitest. No backend.

## Folder map
```
src/
  app/          App.tsx (start screen → hash router → session limit), router.ts
  engine/       pure-ish runtime
    i18n.ts       Line = { key, args }, t(lang, line), nested args
    speech.ts     say([...steps]) — lines, {sfx}, pauses; recorded-mp3 override; cancel on new say
    sound.ts      Web Audio synthesized sfx (no audio files)
    store.ts      localStorage-backed store + useStore() hook
    adaptive.ts   levelFor(game), recordRound(game, firstTry) → 'up' | 'down' | null
    round.ts      Round / Generator types
    rng.ts        seeded RNG + shuffle/sample/pick
    brushes.ts    Drawing Board tools; strokes = normalized points + seed, so replay is pixel-identical
    drawings.ts   IndexedDB store for drawings (paint layer PNG + thumbnail JPEG)
  content/      ALL DATA — edit these to change the game
    catalog.ts    zones + game list (status, zone, icon)
    levels.ts     per-game level 1/2/3 configs
    i18n/en.ts, vi.ts   every spoken/visible line
    brands.ts, vehicles.ts, colors.ts, shapes.ts, things.ts
  art/          SVG drawings
    defaults.ts   default color per paintable region (the region list!)
    kit.tsx       painter(): f(region) filled shape · so(region, w, <el/>) outlined line · txt(region) outlined text
    vehicles.tsx, logos.tsx, ArtById.tsx
  ui/           ThingView (renders any Thing), TopBar, Confetti, HoldButton
  games/
    rounds/       one pure generator per choice game + index.ts registry
    ChoiceGame.tsx  plays any generator (speak → tap → feedback → next → Reward)
    custom/       PaintShop, DrawingBoard, BrandMemory, BuildCar, TrafficLight, Transporter, Puzzle, LetterRoad
    seq/          SequenceGame: tap items in the right order (License Plates, Size Parking)
    letterStrokes.ts  capital letters as stroke polylines (Letter Road)
    registry.tsx  id → screen
    Reward.tsx    sticker reward
  screens/      Start, Home, ZoneScreen, Garage, Parent, Sleep
tests/          rounds, i18n, art regions, catalog, adaptive
scripts/        gen-scripts-doc.mjs (docs/SCRIPTS.md), gen-icons.sh
```

## Choice games: the round contract
```ts
type Round = {
  prompt: Line;            // spoken, replayable with the 🔊 button
  promptSfx?: SfxName;     // played first (Sound Garage)
  scene: Thing[];          // shown above the choices
  sceneStyle?: 'row' | 'lot' | 'road' | 'pair';
  countable?: boolean;     // scene items can be tapped to count aloud
  choices: { id, thing }[];
  answer: string;          // id of the right choice
  answerSay?: Line;        // said when found
};
type Generator<C> = (cfg: C, rng: Rng, ctx: { lang, level }) => Round;
```
A round can also have a `stage` (`flash` for Quick Look, `vanish` for Who Drove Away?, `story` for Parking Stories): the scene changes first and the choices stay disabled until the question is asked.

The right choice carries `data-answer` (invisible to the child) so automated browser runs can play any game end to end.

Generators are **pure**, so tests run each one 250 times per level per language and check that the answer is present, looks unique, and that every i18n key exists.

`Thing` (src/content/things.ts) is what can be drawn: `vehicle` (color, body, brand badge, roof label, rock load, scale, shadow), `logo`, `letter`, `number`, `shape`, `cone`, `object`, `mystery`, `speaker`.

## Art: one drawing, many uses
Every paintable SVG element is tagged `data-region="body"` (via `painter().f('body')`) and colored from a `fills` map, falling back to `art/defaults.ts`. So:
- quiz games pass a preset color (`{ body: red }`),
- Shadow Garage passes `shadow` (all dark),
- Paint Shop passes the child's colors,
- tests render each drawing and check that its regions equal its defaults keys, and that every default uses a palette color (so "match the real one" can be achieved).

## Layout
Every picture fits its box: SVGs are `width/height: 100%` with viewBox "meet". Vehicles stand on the ground (`xMidYMax`) unless `fit="center"` (home/zone icons), and `Thing.scale` shrinks the box (Big & Small). Choice cards are sized by count (`.choices.n2/.n3/.n4` set `--cw`); games with no scene get bigger cards, and 4 choices become a 2×2 grid. Portrait has its own rules at the end of `styles.css`. Checked at iPad Air landscape 1180×820, iPad Air portrait 820×1180 and iPad mini landscape 1133×744.

## Speech
`say([L('tryAgain'), L('hint'), { sfx: 'siren' }, 500, prompt])` plays the steps in order. Any new `say()` cancels the previous one, so taps always interrupt cleanly. Voice: Web Speech API (`en-US` / `vi-VN`; iPad has "Samantha" and "Linh"). If `public/audio/manifest.json` lists `"<lang>/<key>"`, that mp3 plays instead.

## Drawing Board
A canvas (scaled for devicePixelRatio, max 2) under an outline layer (`ArtById` with every region `transparent`, `pointer-events: none`). Each finger is its own stroke (pointer events + coalesced events). Strokes are kept as data (`Stroke`: tool, color, size, seed, normalized points), so **undo** and **rotation** just replay them. The crayon texture and star colors come from the stroke's seed, so a replay looks exactly the same. Stickers are the regular drawings rendered to images through same-origin blob URLs, which never taint the canvas. Saving stores the paint layer as a PNG (so it can be reopened and drawn on) and a 640px JPEG thumbnail with the outline baked in, all in IndexedDB. The board auto-saves when it closes.

## State
`store.ts` keeps settings, levels, history, stickers, paintings and built cars in `localStorage` under `little-garage:v1`. Drawings are images, so they live in IndexedDB (`little-garage` → `drawings`, max 60). It is safe in private mode: it just won't persist.
