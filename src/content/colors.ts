// The one palette used everywhere: quiz games, art defaults and the Paint Shop pots.
// Art defaults MUST only use these hex values (tests enforce it) so Paint Shop "match the real one" is achievable.
export const COLORS = {
  red: '#e53935',
  orange: '#fb8c00',
  yellow: '#fdd835',
  green: '#43a047',
  blue: '#1e88e5',
  sky: '#81d4fa',
  purple: '#8e24aa',
  pink: '#f06292',
  brown: '#8d6e63',
  black: '#263238',
  gray: '#9e9e9e',
  white: '#ffffff',
} as const;

export type ColorId = keyof typeof COLORS;
export const COLOR_IDS = Object.keys(COLORS) as ColorId[];

/** Colors used for "find the color" games — easy to tell apart. */
export const BASIC_COLORS: ColorId[] = ['red', 'blue', 'yellow', 'green'];
export const MORE_COLORS: ColorId[] = ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'pink', 'brown', 'black', 'white'];

export function colorIdOf(hex: string): ColorId | undefined {
  return COLOR_IDS.find((c) => COLORS[c].toLowerCase() === hex.toLowerCase());
}

/** Paint Shop color mixing lessons (Level 3). */
export const MIXES: { a: ColorId; b: ColorId; c: ColorId }[] = [
  { a: 'yellow', b: 'blue', c: 'green' },
  { a: 'red', b: 'yellow', c: 'orange' },
  { a: 'red', b: 'blue', c: 'purple' },
  { a: 'red', b: 'white', c: 'pink' },
  { a: 'black', b: 'white', c: 'gray' },
];
