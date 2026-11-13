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

Safari / iOS Safari quirks the engine works around (`tests/speech.test.ts` acts them out). The rule: **a line is said again only when it certainly wasn't heard.**
- **Speech needs a tap (iOS).** iOS ignores `speak()` until it has been called inside a tap, and may ask again after the app was in the background. Until a line has really started, every tap that doesn't start speech itself speaks a silent, empty line (`unlockSpeech`). A line that is ignored (after `START_MS`, 3 s, it hasn't started and nothing is speaking) is skipped, not retried.
- **Thrown-away lines (Safari).** Right after a `cancel()`, Safari sometimes ends the next line at once without starting it. A line that ends within `DROP_MS` (400 ms) without a `start` or a word boundary is said once more.
- **Speaking without a start event (Safari).** Safari can say a line without firing `start`. While the browser says it is speaking, the line counts as playing and is never repeated (repeating it is how a 3-second retry once doubled instructions).
- **Lines that never end.** `onend` sometimes never fires, and a stuck line blocks the queue. A line gets 3 s + 2.5 s + 160 ms per character ÷ speed, then the sequence goes on; anything still in the queue is cleared before the next line.

## Drawing Board
A canvas (scaled for devicePixelRatio, max 2) under an outline layer (`ArtById` with every region `transparent`, `pointer-events: none`). Each finger is its own stroke (pointer events + coalesced events). Strokes are kept as data (`Stroke`: tool, color, size, seed, normalized points), so **undo** and **rotation** just replay them. The crayon texture and star colors come from the stroke's seed, so a replay looks exactly the same. Stickers are the regular drawings rendered to images through same-origin blob URLs, which never taint the canvas. Saving stores the paint layer as a PNG (so it can be reopened and drawn on) and a 640px JPEG thumbnail with the outline baked in, all in IndexedDB. The board auto-saves when it closes.

## English Street
- **Per-line language:** `Line.lang` pins a line to one language (`EN(key)` in i18n.ts); nested args follow it. `say()` picks the voice, the recording (`<lang>/<key>.mp3`) and the text from the step's language, so one sequence can mix the Vietnamese helper and English words. `Line.voice` picks a character voice (`VOICES` in speech.ts: `zip`, `word`, `mate:<id>`), and `onTalk()` tells the friend bar who is talking.
- **Content:** `content/english.ts` (units + words; a word's key is said in English for the lesson and in the app language for its meaning), `content/i18n/zip.ts` (lines always said in English, spread into both dictionaries), `content/classmates.ts`.
- **The road:** `content/english.ts` `ROAD[unit]` lists each town's stops (`kind` meet / find / do, `level` 1–3, words, rounds, choices). `State.engRoad[unit]` = stops passed; all of them = the badge. `engine/vocab.ts`: `openUnits` / `currentUnit` (Auto / On / Off switches), `finishStop()` (pass rule, level up, badge), `reviewStops()` (mixed ★★★ after all badges), the prompts per level (`findPrompt`, `actionCommand`, `meansLine`), and word stars (`recordWord`: the highest level answered first try). `engine/road.ts` keeps session-only notes (tries on the current stop, where Zip came from).
- **Screens:** `screens/EnglishZone.tsx` is the road (badges, stops, Zip, ▶). A stop is the route `#/game/engDrive/<unit>.<index>` → `games/english/DriveStop.tsx`, which runs `ShipArrives` (meet), `ChoiceGame` with the `engFind` generator and the stop's settings (find), or `ZipSays` (do), then shows `StopDone` (stars / level up / badge / try again).
- **Classmates:** `engine/mates.ts` returns at most one friend line per event (`mateSay('right')`), which the game adds to its own `say()` so friends never talk over it. Friend lines have no `lang` (app language) and a `mate:<id>` voice. `ui/MateBar.tsx` draws them, bobs the one talking, puts the silly one to sleep after 20 s idle, and handles taps.
- **Echo:** `engine/echo.ts` (`echoThing`, `echoColor`, `echoCount`, `echoSticker`) appends English words in the other zones when `engEcho` is on and the language is Vietnamese.
- English choice rounds use the optional `Round` fields `promptLines`, `answerSfx`, `cheer`, `tryAgain`, `hintLines`, `wordIds`, `wordLevel`. `ChoiceGame` takes `cfg` (the stop's settings) and `onDone(result)` instead of the adaptive levels and the sticker screen.

## State
`store.ts` keeps settings, levels, history, stickers, paintings, built cars and English Street (the road, word stars, "He said it", echo / town switches, the named classmates) in `localStorage` under `little-garage:v1`. Drawings are images, so they live in IndexedDB (`little-garage` → `drawings`, max 60). It is safe in private mode: it just won't persist.
