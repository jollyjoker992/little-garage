// Level configs for every game. Level 1 ≈ age 3, Level 2 ≈ 3½, Level 3 ≈ 4.
// Tweak difficulty here — no engine code changes needed. `rounds` = rounds per session (then a sticker reward).
import { BASIC_COLORS, MORE_COLORS, type ColorId } from './colors';
import type { ShapeId } from './shapes';
import { JOB_VEHICLES, type VehicleId } from './vehicles';

export type Level = 1 | 2 | 3;
export type Levels<C> = Record<Level, C & { rounds?: number }>;

export type CountCfg = { min: number; max: number; choices: number };
export type NumberRoadCfg = { max: number; len: number; gapMiddle: boolean; choices: number };
export type DockCfg = { mode: 'more' | 'moreFewer' | 'add'; max: number; minDiff: number };
export type LetterCfg = { pool: string; choices: number; lower: boolean };
export type BrandLetterCfg = { modes: ('toLetter' | 'toBrand')[]; choices: number; vehicles: boolean };
export type AbcCfg = { len: number; gapMiddle: boolean; choices: number; maxStart: number };
export type WashCfg = { colors: ColorId[]; choices: number; twoAttr: boolean };
export type ShapeCfg = { shapes: ShapeId[]; choices: number; objects: boolean };
export type SizeCfg = { sizes: 2 | 3; mixVehicles: boolean };
export type OddCfg = { mode: 'type' | 'color' | 'category' };
export type PatternCfg = { pattern: 'AB' | 'AAB' | 'ABC'; vehicles: boolean; choices: number };
export type ShadowCfg = { choices: number; similar: boolean };
export type JobCfg = { pool: VehicleId[]; choices: number };
export type SoundCfg = { choices: number };
export type MemoryCfg = { pairs: number; faceUp: boolean };
export type PaintCfg = { pots: 'basic' | 'all'; reference: boolean; mixing: boolean };
export type TrafficCfg = { requests: boolean; yellow: boolean };
export type SortCfg = { mode: 'color' | 'twoGroups' | 'threeGroups' };
export type ReadCfg = { choices: number; sameLetter: boolean };
export type QuickCfg = { min: number; max: number; choices: number; ms: number };
export type WhoLeftCfg = { count: number; similar: boolean; ms: number };
export type PlateCfg = { words: string[]; extras: number; useName: boolean };
export type SizeOrderCfg = { count: 3 | 4; bigFirst: boolean };
export type CarrierCfg = { min: number; max: number; pre: boolean };
export type PuzzleCfg = { cols: number; rows: number };
export type LetterRoadCfg = { letters: string };
export type BuildCfg = { orders: boolean; traits: 2 | 3 };
export type StoryCfg = { max: number; ops: ('take' | 'add')[]; kmax: number; choices: number };

export const LEVELS = {
  count: {
    1: { min: 1, max: 5, choices: 2 },
    2: { min: 3, max: 8, choices: 3 },
    3: { min: 5, max: 10, choices: 4 },
  } as Levels<CountCfg>,
  // Only "what comes next" (a missing number in the middle means little before he knows the order).
  numberRoad: {
    1: { max: 5, len: 3, gapMiddle: false, choices: 2 },
    2: { max: 10, len: 4, gapMiddle: false, choices: 3 },
    3: { max: 10, len: 5, gapMiddle: false, choices: 4 },
  } as Levels<NumberRoadCfg>,
  loadingDock: {
    1: { mode: 'more', max: 6, minDiff: 2 },
    2: { mode: 'moreFewer', max: 7, minDiff: 1 },
    3: { mode: 'add', max: 5, minDiff: 1 },
  } as Levels<DockCfg>,
  letterHighway: {
    1: { pool: 'ABCDEF', choices: 2, lower: false },
    2: { pool: 'ABCDEFGHIJKLM', choices: 3, lower: false },
    3: { pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', choices: 4, lower: true },
  } as Levels<LetterCfg>,
  brandLetters: {
    1: { modes: ['toLetter'], choices: 2, vehicles: false },
    2: { modes: ['toBrand'], choices: 3, vehicles: false },
    3: { modes: ['toLetter', 'toBrand'], choices: 4, vehicles: true },
  } as Levels<BrandLetterCfg>,
  abcConvoy: {
    1: { len: 3, gapMiddle: false, choices: 2, maxStart: 0 },
    2: { len: 4, gapMiddle: false, choices: 3, maxStart: 8 },
    3: { len: 5, gapMiddle: true, choices: 3, maxStart: 21 },
  } as Levels<AbcCfg>,
  carWash: {
    1: { colors: BASIC_COLORS, choices: 2, twoAttr: false },
    2: { colors: MORE_COLORS, choices: 3, twoAttr: false },
    3: { colors: BASIC_COLORS, choices: 4, twoAttr: true },
  } as Levels<WashCfg>,
  shapeGarage: {
    1: { shapes: ['circle', 'square', 'triangle'], choices: 2, objects: false },
    2: { shapes: ['circle', 'square', 'triangle', 'rectangle', 'star', 'oval'], choices: 3, objects: false },
    3: { shapes: ['circle', 'square', 'triangle', 'rectangle', 'star', 'oval'], choices: 3, objects: true },
  } as Levels<ShapeCfg>,
  bigSmall: {
    1: { sizes: 2, mixVehicles: false },
    2: { sizes: 3, mixVehicles: false },
    3: { sizes: 3, mixVehicles: true },
  } as Levels<SizeCfg>,
  // Only the "which group doesn't belong" version (by type / by colour were too easy).
  oddOneOut: {
    1: { mode: 'category' },
    2: { mode: 'category' },
    3: { mode: 'category' },
  } as Levels<OddCfg>,
  patternRoad: {
    1: { pattern: 'AB', vehicles: false, choices: 2 },
    2: { pattern: 'AAB', vehicles: false, choices: 3 },
    3: { pattern: 'ABC', vehicles: true, choices: 3 },
  } as Levels<PatternCfg>,
  // Only similar-looking vehicles (very different shadows were too easy).
  mechanic: {
    1: { choices: 2, similar: true },
    2: { choices: 3, similar: true },
    3: { choices: 4, similar: true },
  } as Levels<ShadowCfg>,
  whoJob: {
    1: { pool: ['fireTruck', 'excavator', 'ambulance'], choices: 2 },
    2: { pool: ['fireTruck', 'excavator', 'ambulance', 'crane', 'mixer', 'dumpTruck', 'roller'], choices: 3 },
    3: { pool: JOB_VEHICLES, choices: 4 },
  } as Levels<JobCfg>,
  soundGarage: {
    1: { choices: 2 },
    2: { choices: 3 },
    3: { choices: 4 },
  } as Levels<SoundCfg>,
  brandMemory: {
    1: { pairs: 2, faceUp: true },
    2: { pairs: 3, faceUp: false },
    3: { pairs: 5, faceUp: false },
  } as Levels<MemoryCfg>,
  paint: {
    1: { pots: 'basic', reference: false, mixing: false },
    2: { pots: 'all', reference: true, mixing: false },
    3: { pots: 'all', reference: true, mixing: true },
  } as Levels<PaintCfg>,
  sorting: {
    1: { mode: 'color', rounds: 8 },
    2: { mode: 'twoGroups', rounds: 8 },
    3: { mode: 'threeGroups', rounds: 8 },
  } as Levels<SortCfg>,
  // L3 puts a brand with the SAME first letter among the choices, so he has to read past the first letter.
  readBrand: {
    1: { choices: 2, sameLetter: false },
    2: { choices: 3, sameLetter: false },
    3: { choices: 3, sameLetter: true },
  } as Levels<ReadCfg>,
  quickLook: {
    1: { min: 1, max: 3, choices: 3, ms: 2000 },
    2: { min: 1, max: 5, choices: 3, ms: 1500 },
    3: { min: 3, max: 8, choices: 4, ms: 1300 },
  } as Levels<QuickCfg>,
  whoLeft: {
    1: { count: 3, similar: false, ms: 3000 },
    2: { count: 4, similar: false, ms: 3500 },
    3: { count: 5, similar: true, ms: 4000 },
  } as Levels<WhoLeftCfg>,
  parkingStory: {
    1: { max: 5, ops: ['take'], kmax: 2, choices: 3 },
    2: { max: 7, ops: ['take', 'add'], kmax: 2, choices: 3 },
    3: { max: 10, ops: ['take', 'add'], kmax: 4, choices: 4 },
  } as Levels<StoryCfg>,
  // L3 spells his own name when it is set in Grown-ups (otherwise longer brand names).
  licensePlates: {
    1: { words: ['MG', 'VW', 'KIA', 'BMW', 'BUS', 'CAR'], extras: 1, useName: false, rounds: 4 },
    2: { words: ['FORD', 'JEEP', 'AUDI', 'TAXI', 'MAZDA', 'VOLVO', 'HONDA', 'LEXUS', 'TESLA'], extras: 2, useName: false, rounds: 4 },
    3: { words: ['TOYOTA', 'NISSAN', 'SUZUKI', 'VINFAST', 'PORSCHE', 'FERRARI', 'TRUCK'], extras: 2, useName: true, rounds: 4 },
  } as Levels<PlateCfg>,
  sizeOrder: {
    1: { count: 3, bigFirst: false, rounds: 4 },
    2: { count: 4, bigFirst: false, rounds: 4 },
    3: { count: 4, bigFirst: true, rounds: 4 },
  } as Levels<SizeOrderCfg>,
  transporter: {
    1: { min: 1, max: 5, pre: false, rounds: 4 },
    2: { min: 3, max: 8, pre: false, rounds: 4 },
    3: { min: 4, max: 10, pre: true, rounds: 4 },
  } as Levels<CarrierCfg>,
  roadPuzzle: {
    1: { cols: 2, rows: 1, rounds: 3 },
    2: { cols: 2, rows: 2, rounds: 3 },
    3: { cols: 3, rows: 2, rounds: 3 },
  } as Levels<PuzzleCfg>,
  letterRoad: {
    1: { letters: 'LTIHEFVXZ', rounds: 5 },
    2: { letters: 'OCUJDPNAMWKY', rounds: 5 },
    3: { letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', rounds: 5 },
  } as Levels<LetterRoadCfg>,
  // L1 free building; L2 customer orders (colour + type); L3 orders with a third thing.
  buildCar: {
    1: { orders: false, traits: 2 },
    2: { orders: true, traits: 2, rounds: 3 },
    3: { orders: true, traits: 3, rounds: 3 },
  } as Levels<BuildCfg>,
  traffic: {
    1: { requests: false, yellow: false },
    2: { requests: true, yellow: false, rounds: 5 },
    3: { requests: true, yellow: true, rounds: 6 },
  } as Levels<TrafficCfg>,
};

export const DEFAULT_ROUNDS = 5;
