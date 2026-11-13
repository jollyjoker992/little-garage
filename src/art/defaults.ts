// Default colors for every paintable region of every drawing.
// The keys ARE the region list: each SVG element with data-region="x" must have an entry here.
// Values must come from the palette (src/content/colors.ts) — tests enforce it.
import { COLORS as C } from '../content/colors';
import type { BrandId } from '../content/brands';
import type { VehicleId } from '../content/vehicles';

export type Fills = Record<string, string>;

const car: Fills = { body: C.red, window: C.sky, stripe: C.white, lights: C.yellow, wheels: C.black };

export const VEHICLE_DEFAULTS: Record<VehicleId, Fills> = {
  car,
  policeCar: { body: C.white, window: C.sky, stripe: C.blue, lights: C.yellow, wheels: C.black, sirenL: C.red, sirenR: C.blue },
  bus: { body: C.yellow, window: C.sky, stripe: C.black, lights: C.white, wheels: C.black },
  fireTruck: { body: C.red, window: C.sky, stripe: C.white, ladder: C.gray, siren: C.blue, wheels: C.black },
  ambulance: { body: C.white, window: C.sky, stripe: C.red, cross: C.red, siren: C.blue, wheels: C.black },
  excavator: { body: C.yellow, cab: C.yellow, arm: C.yellow, bucket: C.gray, window: C.sky, tracks: C.black },
  bulldozer: { body: C.yellow, cab: C.yellow, blade: C.gray, window: C.sky, tracks: C.black },
  dumpTruck: { bed: C.yellow, cab: C.orange, window: C.sky, rocks: C.brown, wheels: C.black },
  crane: { body: C.yellow, cab: C.yellow, arm: C.orange, hook: C.gray, window: C.sky, wheels: C.black },
  mixer: { body: C.gray, cab: C.blue, drum: C.orange, stripe: C.white, window: C.sky, wheels: C.black },
  roller: { body: C.yellow, roof: C.black, drum: C.gray, wheels: C.black },
  // Every vehicle's main part is "body", so "a red train" paints the right part.
  motorbike: { body: C.red, seat: C.black, lights: C.yellow, wheels: C.black },
  bicycle: { body: C.blue, seat: C.brown, wheels: C.black },
  taxi: { body: C.yellow, window: C.sky, stripe: C.black, lights: C.white, wheels: C.black, sign: C.orange },
  truck: { body: C.white, cab: C.blue, window: C.sky, lights: C.yellow, wheels: C.black },
  garbageTruck: { body: C.green, hopper: C.gray, stripe: C.yellow, cab: C.green, window: C.sky, lights: C.yellow, wheels: C.black },
  towTruck: { body: C.blue, boom: C.orange, hook: C.gray, window: C.sky, siren: C.orange, lights: C.yellow, wheels: C.black },
  train: { body: C.green, cab: C.red, window: C.sky, chimney: C.black, stripe: C.yellow, lights: C.yellow, wheels: C.black },
  plane: { body: C.white, tail: C.red, wing: C.gray, window: C.sky, stripe: C.blue },
  boat: { body: C.red, sail: C.white, stripe: C.white, window: C.sky },
  helicopter: { body: C.orange, tail: C.orange, window: C.sky, rotor: C.gray },
  rocket: { body: C.white, nose: C.red, fin: C.red, window: C.sky, flame: C.orange },
};

export const LOGO_DEFAULTS: Record<BrandId, Fills> = {
  toyota: { bg: C.red, mark: C.white },
  honda: { bg: C.white, mark: C.red },
  bmw: { ring: C.black, blue: C.blue, white: C.white },
  mercedes: { bg: C.white, ring: C.gray, star: C.gray },
  audi: { bg: C.white, rings: C.gray },
  vinfast: { bg: C.white, outer: C.gray, inner: C.blue },
  ford: { bg: C.blue, rim: C.white, mark: C.white },
  tesla: { bg: C.white, mark: C.red },
  porsche: { bg: C.yellow, stripes: C.red, antlers: C.black, center: C.yellow },
  ferrari: { bg: C.yellow, green: C.green, white: C.white, red: C.red, horse: C.black },
  lamborghini: { bg: C.black, edge: C.yellow, text: C.yellow, bull: C.yellow },
  volkswagen: { bg: C.blue, ring: C.white, mark: C.white },
  kia: { bg: C.white, mark: C.black },
  hyundai: { bg: C.blue, ring: C.white, mark: C.white },
  mazda: { bg: C.white, ring: C.black, mark: C.black },
  jeep: { bg: C.white, mark: C.green },
  mitsubishi: { bg: C.white, mark: C.red },
  nissan: { bg: C.white, ring: C.gray, text: C.black },
  chevrolet: { bg: C.white, edge: C.gray, mark: C.yellow },
  mg: { bg: C.red, ring: C.gray, mark: C.white },
  lexus: { bg: C.black, ring: C.gray, mark: C.gray },
  landrover: { bg: C.green, ring: C.white, text: C.white },
  volvo: { bg: C.white, ring: C.gray, text: C.blue },
  suzuki: { bg: C.white, mark: C.red },
};

/** Paint Shop page ids: v:<vehicle>, c:<carBody>, l:<brand>. */
export function defaultsFor(art: string): Fills {
  const [kind, id] = art.split(':');
  if (kind === 'l') return LOGO_DEFAULTS[id as BrandId];
  if (kind === 'c') return car;
  return VEHICLE_DEFAULTS[id as VehicleId];
}
