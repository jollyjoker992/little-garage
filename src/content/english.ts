// English Street content: the units and their words (see docs/ENGLISH_ZONE.md §4).
// A word's `key` is an i18n key: said in English it's the word being taught ("fire truck"), said in the app
// language it's the meaning ("xe cứu hỏa"). So every key must exist in en.ts and vi.ts (tests check it).
import type { SfxName } from '../engine/sfxNames';
import type { ColorId } from './colors';
import type { Thing } from './things';
import { VEHICLES, type VehicleId } from './vehicles';

export type ActionId = 'go' | 'stop' | 'slow' | 'fast' | 'honk' | 'lights';
export type UnitId = 'rescue' | 'build' | 'street' | 'colors' | 'actions' | 'travel';
export type WordKind = 'vehicle' | 'color' | 'action';
export type EngWord = {
  id: string; unit: UnitId; kind: WordKind; key: string; thing: Thing; sfx?: SfxName; v?: VehicleId; color?: ColorId; a?: ActionId;
  /** The ★★ frame when "Đâu là xe:" doesn't fit (a plane is not a "xe"). */
  frame?: string;
};
/** The towns of the road, in the order they open. */
export type Unit = { id: UnitId; icon: Thing };

export const UNITS: Unit[] = [
  { id: 'rescue', icon: { t: 'vehicle', v: 'fireTruck' } },
  { id: 'build', icon: { t: 'vehicle', v: 'excavator' } },
  { id: 'street', icon: { t: 'vehicle', v: 'motorbike' } },
  { id: 'colors', icon: { t: 'vehicle', v: 'car', body: 'sports', color: 'pink' } },
  { id: 'actions', icon: { t: 'action', a: 'go' } },
  { id: 'travel', icon: { t: 'vehicle', v: 'plane' } },
];

const vehicle = (unit: UnitId, v: VehicleId): EngWord => ({
  id: `v.${v}`, unit, kind: 'vehicle', key: `v.${v}`, v, sfx: VEHICLES[v].sound,
  thing: v === 'car' ? { t: 'vehicle', v, body: 'sedan', color: 'red' } : { t: 'vehicle', v },
  ...(VEHICLES[v].category === 'travel' ? { frame: 'eng.whereThing' } : {}),
});
const color = (c: ColorId): EngWord => ({
  id: `color.${c}`, unit: 'colors', kind: 'color', key: `color.${c}`, color: c, thing: { t: 'vehicle', v: 'car', body: 'sports', color: c },
});
const action = (a: ActionId, sfx?: SfxName): EngWord => ({ id: `act.${a}`, unit: 'actions', kind: 'action', key: `act.${a}`, a, sfx, thing: { t: 'action', a } });

export const WORDS: EngWord[] = [
  ...(['car', 'bus', 'fireTruck', 'policeCar', 'ambulance'] as VehicleId[]).map((v) => vehicle('rescue', v)),
  ...(['excavator', 'bulldozer', 'dumpTruck', 'crane', 'mixer', 'roller'] as VehicleId[]).map((v) => vehicle('build', v)),
  ...(['motorbike', 'bicycle', 'taxi', 'truck', 'garbageTruck', 'towTruck'] as VehicleId[]).map((v) => vehicle('street', v)),
  ...(['red', 'blue', 'yellow', 'green', 'orange', 'pink', 'black', 'white'] as ColorId[]).map(color),
  action('go', 'vroom'), action('stop'), action('slow'), action('fast', 'raceEngine'), action('honk', 'honk'), action('lights'),
  ...(['train', 'plane', 'boat', 'helicopter', 'rocket'] as VehicleId[]).map((v) => vehicle('travel', v)),
];

export const WORD_BY_ID = Object.fromEntries(WORDS.map((w) => [w.id, w])) as Record<string, EngWord>;
export const wordsOf = (unit: UnitId) => WORDS.filter((w) => w.unit === unit);

// ── The road: every unit is a town with three stops, one per level; finishing them earns the town's badge ──
// A stop's LEVEL decides how much help the helper gives (docs/ENGLISH_ZONE.md §5):
//   ★   1  full help: "Đâu là xe cứu hỏa? Tiếng Anh là: fire truck!"
//   ★★  2  no meaning in the app language: "Đâu là xe:" + "fire truck!"
//   ★★★ 3  just the English word: "fire truck!"
export type StopLevel = 1 | 2 | 3;
/** meet = the ship brings new words · find = Zip's Garage (tap the picture) · do = Zip Says (tap the action). */
export type StopKind = 'meet' | 'find' | 'do';
export type Stop = {
  kind: StopKind;
  level: StopLevel;
  /** Word ids practised at this stop. */
  words: string[];
  rounds: number;
  /** Cards / buttons shown. */
  choices: number;
  /** Colors at level 3: ask for two words ("red bus") using vehicles he already knows. */
  two?: boolean;
};

const idsOf = (unit: UnitId) => wordsOf(unit).map((w) => w.id);

/** Picture towns: ★ the ship brings every word of the town, then Zip's Garage at ★★ and ★★★. */
function pictureTown(unit: UnitId, two = false): Stop[] {
  const all = idsOf(unit);
  return [
    { kind: 'meet', level: 1, words: all, rounds: all.length, choices: 2 },
    { kind: 'find', level: 2, words: all, rounds: all.length, choices: 3 },
    { kind: 'find', level: 3, words: all, rounds: Math.max(6, all.length), choices: 4, two },
  ];
}

/** The action town: Zip Says at ★ (meaning + glowing button), ★★ and ★★★. */
function actionTown(unit: UnitId): Stop[] {
  const all = idsOf(unit);
  return [1, 2, 3].map((level) => ({ kind: 'do' as const, level: level as StopLevel, words: all, rounds: all.length, choices: all.length }));
}

export const ROAD: Record<UnitId, Stop[]> = {
  rescue: pictureTown('rescue'),
  build: pictureTown('build'),
  street: pictureTown('street'),
  colors: pictureTown('colors', true),
  actions: actionTown('actions'),
  travel: pictureTown('travel'),
};

/** Pass a stop with this share of rounds right on the first try (ship stops always pass). */
export const PASS = 0.6;
/** After this many tries a stop passes anyway, so he is never stuck. */
export const MAX_TRIES = 3;
