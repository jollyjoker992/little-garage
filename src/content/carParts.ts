// Build-a-Car: every trait the child can pick, plus customer orders (Level 2–3).
import type { BrandId } from './brands';
import type { ColorId } from './colors';
import type { CarBody } from './vehicles';
import { CAR_BODIES } from './vehicles';
import type { SfxName } from '../engine/sfxNames';
import { int, pick, sample, type Rng } from '../engine/rng';

export type Wheels = 'small' | 'normal' | 'monster';
export type Pattern = 'none' | 'stripes' | 'flames' | 'stars' | 'dots' | 'twoTone';
export type Extra = 'spoiler' | 'rack' | 'siren' | 'taxi' | 'flag';
export type Driver = 'none' | 'boy' | 'dog' | 'cat' | 'bear';
export type Engine = 'hum' | 'vroom' | 'race';

export type BuildSpec = {
  body: CarBody;
  color: ColorId;
  color2: ColorId;
  pattern: Pattern;
  wheels: Wheels;
  rim: 0 | 1 | 2 | 3;
  /** 0 = no number */
  number: number;
  /** '' = no plate */
  plate: string;
  extras: Extra[];
  driver: Driver;
  brand: BrandId | null;
  horn: SfxName;
  engine: Engine;
};

export const BODY_OPTIONS: CarBody[] = CAR_BODIES;
export const PAINTS: ColorId[] = ['red', 'orange', 'yellow', 'green', 'blue', 'sky', 'purple', 'pink', 'black', 'white', 'gray', 'brown'];
export const WHEELS: Wheels[] = ['small', 'normal', 'monster'];
export const RIMS = [0, 1, 2, 3] as const;
export const PATTERNS: Pattern[] = ['none', 'stripes', 'flames', 'stars', 'dots', 'twoTone'];
export const EXTRAS: Extra[] = ['spoiler', 'rack', 'siren', 'taxi', 'flag'];
export const DRIVERS: Driver[] = ['none', 'boy', 'dog', 'cat', 'bear'];
export const HORNS: SfxName[] = ['honk', 'horn', 'woop', 'beepReverse'];
export const ENGINES: Engine[] = ['hum', 'vroom', 'race'];
export const ENGINE_SFX: Record<Engine, SfxName> = { hum: 'hum', vroom: 'vroom', race: 'raceEngine' };

export const DEFAULT_SPEC: BuildSpec = {
  body: 'sedan', color: 'red', color2: 'white', pattern: 'none', wheels: 'normal', rim: 0, number: 0, plate: '',
  extras: [], driver: 'none', brand: 'toyota', horn: 'honk', engine: 'vroom',
};

/** Fill in fields missing from cars saved by older versions. */
export const normalizeSpec = (s: Partial<BuildSpec>): BuildSpec => ({ ...DEFAULT_SPEC, ...s, extras: s.extras ?? [] });

/** 🎲 Surprise: a random, fun car. */
export function randomSpec(rng: Rng, brands: BrandId[], plates: string[]): BuildSpec {
  const [color, color2] = sample(rng, PAINTS, 2);
  return {
    body: pick(rng, BODY_OPTIONS),
    color, color2,
    pattern: pick(rng, PATTERNS),
    wheels: pick(rng, WHEELS),
    rim: pick(rng, RIMS),
    number: rng() < 0.6 ? int(rng, 1, 9) : 0,
    plate: rng() < 0.5 ? pick(rng, plates) : '',
    extras: EXTRAS.filter(() => rng() < 0.3),
    driver: pick(rng, DRIVERS),
    brand: pick(rng, brands),
    horn: pick(rng, HORNS),
    engine: pick(rng, ENGINES),
  };
}

// ── Customer orders ────────────────────────────────────────────────────────
export type Order = { color: ColorId; body: CarBody; number?: number; wheels?: Wheels; pattern?: Pattern };
const ORDER_COLORS: ColorId[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'black', 'white'];
const ORDER_PATTERNS: Pattern[] = ['stripes', 'flames', 'stars', 'dots'];

/** Level 2: colour + type. Level 3: + a number, monster wheels or a pattern. */
export function makeOrder(rng: Rng, traits: 2 | 3): Order {
  const o: Order = { color: pick(rng, ORDER_COLORS), body: pick(rng, BODY_OPTIONS.filter((b) => b !== 'monster')) };
  if (traits === 3) {
    const k = pick(rng, ['number', 'wheels', 'pattern'] as const);
    if (k === 'number') o.number = int(rng, 1, 9);
    if (k === 'wheels') o.wheels = 'monster';
    if (k === 'pattern') o.pattern = pick(rng, ORDER_PATTERNS);
  }
  return o;
}

/** Which order items the car already matches. */
export function orderProgress(spec: BuildSpec, o: Order) {
  return {
    color: spec.color === o.color,
    body: spec.body === o.body,
    ...(o.number !== undefined ? { number: spec.number === o.number } : {}),
    ...(o.wheels ? { wheels: spec.wheels === o.wheels } : {}),
    ...(o.pattern ? { pattern: spec.pattern === o.pattern } : {}),
  } as Record<string, boolean>;
}
export const orderDone = (spec: BuildSpec, o: Order) => Object.values(orderProgress(spec, o)).every(Boolean);
