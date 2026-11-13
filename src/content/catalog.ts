import type { Thing } from './things';

export type ZoneId = 'numbers' | 'letters' | 'colors' | 'logic' | 'garage' | 'play' | 'english';

export type Zone = { id: ZoneId; icon: Thing; bg: string };

// Name + intro lines: zone.<id>, zone.<id>.intro in i18n.
export const ZONES: Zone[] = [
  { id: 'numbers', icon: { t: 'number', n: 3 }, bg: '#ffe082' },
  { id: 'letters', icon: { t: 'letter', ch: 'A' }, bg: '#90caf9' },
  { id: 'colors', icon: { t: 'vehicle', v: 'car', color: 'pink', body: 'sports' }, bg: '#f8bbd0' },
  { id: 'logic', icon: { t: 'vehicle', v: 'excavator' }, bg: '#ffcc80' },
  { id: 'garage', icon: { t: 'vehicle', v: 'fireTruck' }, bg: '#b0bec5' },
  { id: 'play', icon: { t: 'vehicle', v: 'car', color: 'green', body: 'suv' }, bg: '#a5d6a7' },
  { id: 'english', icon: { t: 'zip' }, bg: '#d1c4e9' },
];

/** ready = playable · planned = designed, not built · off = built but switched off (set back to 'ready' to bring it back). */
export type GameStatus = 'ready' | 'planned' | 'off';

export type GameEntry = {
  id: string;
  zones: ZoneId[];
  icon: Thing;
  status: GameStatus;
  /** One-line mechanic, used in docs. */
  about: string;
};

// Name + intro lines: game.<id>, game.<id>.intro in i18n.
// To add a game: add an entry here, a generator (choice game) or component (custom game) in src/games/registry.tsx,
// level configs in src/content/levels.ts, and its lines in both i18n files.
export const GAMES: GameEntry[] = [
  // Parking Lot — numbers
  { id: 'count', zones: ['numbers'], status: 'ready', icon: { t: 'vehicle', v: 'car', color: 'blue' }, about: 'Tap each parked car to count it aloud, then pick the number.' },
  { id: 'numberRoad', zones: ['numbers'], status: 'ready', icon: { t: 'cone', color: 'orange', label: '1' }, about: 'Numbered cones in order; pick the next or the missing number.' },
  { id: 'loadingDock', zones: ['numbers'], status: 'ready', icon: { t: 'vehicle', v: 'dumpTruck', load: 3 }, about: 'Which dump truck has more / fewer rocks; L3 adds two loads.' },
  { id: 'transporter', zones: ['numbers'], status: 'ready', icon: { t: 'vehicle', v: 'car', color: 'red', body: 'pickup' }, about: 'Load N cars onto the car carrier (counted aloud), then GO; L3 starts with some cars on: make it N.' },
  { id: 'parkingStory', zones: ['numbers'], status: 'ready', icon: { t: 'vehicle', v: 'car', color: 'green', body: 'suv' }, about: 'Cars are parked, some drive away or more arrive: how many now? (adding / taking away)' },
  { id: 'quickLook', zones: ['numbers'], status: 'ready', icon: { t: 'dots', n: 4 }, about: 'Rocks flash for a moment, then get covered: how many? (seeing small numbers at a glance)' },
  { id: 'garageNumbers', zones: ['numbers'], status: 'planned', icon: { t: 'number', n: 2 }, about: 'Drag car "3" into garage "3".' },
  { id: 'fuelUp', zones: ['numbers'], status: 'planned', icon: { t: 'number', n: 5 }, about: 'Tap the fuel pump N times to fill the tank (one-to-one counting).' },
  // Highway — letters
  { id: 'readBrand', zones: ['letters'], status: 'ready', icon: { t: 'logo', brand: 'ford' }, about: 'A logo and written names: tap the word that says the brand. L3 includes a name with the same first letter.' },
  { id: 'letterHighway', zones: ['letters'], status: 'ready', icon: { t: 'vehicle', v: 'car', label: 'A', color: 'yellow' }, about: 'A letter sign appears; tap the car wearing that letter.' },
  { id: 'brandLetters', zones: ['letters'], status: 'ready', icon: { t: 'logo', brand: 'toyota' }, about: 'Toyota starts with T! Brand → letter and letter → brand.' },
  { id: 'abcConvoy', zones: ['letters'], status: 'off', icon: { t: 'vehicle', v: 'car', label: 'B', color: 'green', body: 'pickup' }, about: 'Cars line up in ABC order; pick the next or missing letter.' },
  { id: 'letterRoad', zones: ['letters'], status: 'ready', icon: { t: 'letter', ch: 'S' }, about: 'Drive a car along a capital letter drawn as a road, stroke by stroke in writing order (first writing).' },
  { id: 'licensePlates', zones: ['letters'], status: 'ready', icon: { t: 'logo', brand: 'bmw' }, about: 'Copy the word on a license plate by tapping its letters in order; L3 spells his own name.' },
  // Paint Shop — colors & shapes
  { id: 'carWash', zones: ['colors'], status: 'off', icon: { t: 'vehicle', v: 'car', color: 'red' }, about: 'Tap the car of the spoken color; L3 adds size and vehicle type.' },
  { id: 'paint', zones: ['colors', 'play'], status: 'ready', icon: { t: 'vehicle', v: 'car', color: 'purple', body: 'sports' }, about: 'Coloring book: tap a paint pot, tap a part of a car or logo.' },
  { id: 'drawing', zones: ['colors', 'play'], status: 'ready', icon: { t: 'icon', icon: 'crayon' }, about: 'Free finger drawing: pencil, crayon, brush, rainbow and star pens, car/logo stickers, eraser; blank paper or a vehicle/logo outline to color in.' },
  { id: 'shapeGarage', zones: ['colors'], status: 'off', icon: { t: 'shape', shape: 'triangle', color: 'orange' }, about: 'Tap the spoken shape; L3: what shape is the wheel?' },
  { id: 'tireShop', zones: ['colors'], status: 'planned', icon: { t: 'object', obj: 'wheel' }, about: 'Match tires to vehicles by size and count.' },
  // Construction Site — logic
  { id: 'sorting', zones: ['logic'], status: 'ready', icon: { t: 'garage', sign: 'construction' }, about: 'Send each vehicle to the right garage: by colour, then builders vs rescue, then + everyday cars.' },
  { id: 'bigSmall', zones: ['logic'], status: 'off', icon: { t: 'vehicle', v: 'crane' }, about: 'Tap the big / small / biggest / smallest vehicle.' },
  { id: 'oddOneOut', zones: ['logic'], status: 'ready', icon: { t: 'vehicle', v: 'bulldozer' }, about: 'Three alike and one different: find the different one.' },
  { id: 'patternRoad', zones: ['logic'], status: 'ready', icon: { t: 'cone', color: 'red' }, about: 'Cones (or vehicles) in a pattern; what comes next?' },
  { id: 'mechanic', zones: ['logic'], status: 'ready', icon: { t: 'vehicle', v: 'excavator', shadow: true }, about: 'Whose shadow is this? Match a silhouette to its vehicle.' },
  { id: 'sizeOrder', zones: ['logic'], status: 'ready', icon: { t: 'vehicle', v: 'dumpTruck', load: 2 }, about: 'Park the vehicles in order of size: small to big (L3: big to small).' },
  { id: 'whoLeft', zones: ['logic'], status: 'ready', icon: { t: 'mystery' }, about: 'Remember the parked vehicles; the garage door closes and one drives away: which one?' },
  { id: 'storyOrder', zones: ['logic'], status: 'planned', icon: { t: 'vehicle', v: 'dumpTruck', load: 2 }, about: 'Put pictures in order: dig → load → dump.' },
  { id: 'roadPuzzle', zones: ['logic'], status: 'ready', icon: { t: 'logo', brand: 'mitsubishi' }, about: 'Jigsaw of a logo or vehicle: 2 / 4 / 6 pieces; drag a piece to its spot, or tap the piece then its spot.' },
  // Garage — memory & listening
  { id: 'brandMemory', zones: ['garage'], status: 'ready', icon: { t: 'logo', brand: 'bmw' }, about: 'Match each logo with its car; face-up then flip cards.' },
  { id: 'soundGarage', zones: ['garage'], status: 'ready', icon: { t: 'speaker' }, about: 'Hear a sound (siren, honk, beep-beep) and tap who makes it.' },
  { id: 'whoJob', zones: ['garage'], status: 'ready', icon: { t: 'vehicle', v: 'ambulance' }, about: '"There\'s a fire!" — tap the vehicle that does that job.' },
  { id: 'whereIsCar', zones: ['garage'], status: 'planned', icon: { t: 'vehicle', v: 'car', color: 'orange' }, about: 'On / under / in front of / behind.' },
  // Playground — free play
  { id: 'buildCar', zones: ['play'], status: 'ready', icon: { t: 'vehicle', v: 'car', color: 'orange', body: 'pickup', brand: 'ford' }, about: 'Pick body, color, logo and horn; the car joins My Garage.' },
  { id: 'traffic', zones: ['play'], status: 'ready', icon: { t: 'icon', icon: 'trafficLight' }, about: 'Red stop, yellow slow, green go; L2+ follow the spoken request.' },
  // English Street — English through vehicles (docs/ENGLISH_ZONE.md). The zone screen is the road; this is one stop of it.
  { id: 'engDrive', zones: ['english'], status: 'ready', icon: { t: 'zip' }, about: 'Drive with Zip: the road of stops (ship: new words · Zip\'s Garage: tap the picture · Zip Says: tap the action), three star levels per town, a badge for each town.' },
  { id: 'stickers', zones: ['play'], status: 'ready', icon: { t: 'icon', icon: 'garage' }, about: 'My Garage: stickers, paintings and built cars.' },
];

export const GAME_BY_ID = Object.fromEntries(GAMES.map((g) => [g.id, g])) as Record<string, GameEntry>;
