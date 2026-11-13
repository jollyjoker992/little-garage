import type { BrandId } from './brands';
import type { ColorId } from './colors';
import type { ObjectId, ShapeId } from './shapes';
import type { CarBody, VehicleId } from './vehicles';
import type { ActionId } from './english';

/** Anything a game can show in its scene or as a choice. Rendered by src/ui/ThingView.tsx. */
export type Thing =
  | { t: 'vehicle'; v: VehicleId; color?: ColorId; body?: CarBody; brand?: BrandId; label?: string; load?: number; scale?: number; shadow?: boolean; caption?: string }
  | { t: 'logo'; brand: BrandId; caption?: string }
  | { t: 'letter'; ch: string }
  | { t: 'number'; n: number }
  | { t: 'shape'; shape: ShapeId; color: ColorId }
  | { t: 'cone'; color: ColorId; label?: string }
  | { t: 'object'; obj: ObjectId }
  | { t: 'icon'; icon: 'trafficLight' | 'garage' | 'crayon' | 'ship' }
  | { t: 'garage'; sign: 'construction' | 'emergency' | 'road' | ColorId }
  | { t: 'word'; text: string; /** font size (% of card width), shared by all words in a round */ k?: number }
  | { t: 'dots'; n: number }
  | { t: 'mystery' }
  | { t: 'speaker' }
  /** Zip, the English-only tow truck (English Street). */
  | { t: 'zip'; lights?: boolean }
  /** An action button / picture: go, stop, slow, fast, honk, lights. */
  | { t: 'action'; a: ActionId };

/** Stable identity of what a thing looks like (two things with the same key look identical). */
export function thingKey(x: Thing): string {
  return JSON.stringify(x, Object.keys(x).sort());
}
