// The classmates: little friends the child names, who ride along in every English Street game
// (docs/ENGLISH_ZONE.md §8). They talk in the app language (Grown-ups settings); only the English words
// they help teach are said in English.
import type { ColorId } from './colors';
import type { VehicleId } from './vehicles';

export type MateId = 'bear' | 'cat' | 'dog' | 'bunny';
export type Personality = 'silly' | 'curious' | 'speedy' | 'shy';
/** Who comes off the ship first, second… (Grown-ups choose how many: 1–4). */
export const MATE_ORDER: MateId[] = ['bear', 'cat', 'dog', 'bunny'];
export const PERSONALITY: Record<MateId, Personality> = { bear: 'silly', cat: 'curious', dog: 'speedy', bunny: 'shy' };
/** Short names that sound fine in both the English and the Vietnamese voice. */
export const NAME_CHIPS = ['Bin', 'Na', 'Su', 'Bo', 'Mia', 'Tom', 'Ben', 'Kiki', 'Max', 'Lily', 'Bi', 'Tin'];
/** Vehicles and colors a new friend can pick (words from unit 1 and 3). */
export const MATE_VEHICLES: VehicleId[] = ['car', 'bus', 'fireTruck', 'policeCar', 'ambulance', 'excavator', 'dumpTruck', 'crane'];
export const MATE_COLORS: ColorId[] = ['red', 'blue', 'yellow', 'green', 'orange', 'pink', 'purple', 'white'];

export type Mate = {
  id: MateId;
  /** The written name ('' when he only said it into the mic). */
  name: string;
  /** How the voice should say the name, when it reads it badly. */
  spoken?: string;
  /** The name as he said it into the mic (a small audio data URL, kept on the device). Played wherever the name is said. */
  clip?: string;
  v: VehicleId;
  color: ColorId;
};
export const mateVoice = (id: MateId) => `mate:${id}`;
/** How the name is said: his recording if there is one, else the "spoken as" text, else the name. */
export const mateName = (m: Pick<Mate, 'name' | 'spoken' | 'clip'>): string | { clip: string } =>
  m.clip ? { clip: m.clip } : (m.spoken?.trim() || m.name).trim();
/** What to show under the friend: the written name, or a speaker when the name is only a recording. */
export const mateLabel = (m: Pick<Mate, 'name' | 'clip'>) => m.name.trim() || (m.clip ? '🔊' : '');
/** Letters on the name keyboard: the whole alphabet he practises on the Highway. */
export const NAME_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const NAME_MAX = 8;
