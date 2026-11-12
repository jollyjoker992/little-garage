import type { Level } from '../content/levels';
import type { Thing } from '../content/things';
import type { Lang, Line } from './i18n';
import type { Rng } from './rng';
import type { SfxName } from './sfxNames';

export type Choice = { id: string; thing: Thing };

/** One question in a choice game. Produced by a pure generator, played by ChoiceGame. */
export type Round = {
  prompt: Line;
  /** Sound to play before the prompt (Sound Garage). */
  promptSfx?: SfxName;
  scene: Thing[];
  sceneStyle?: 'row' | 'lot' | 'road' | 'pair';
  /** Tap scene items to count them aloud. */
  countable?: boolean;
  choices: Choice[];
  answer: string;
  /** Spoken when the answer is found (before the cheer). */
  answerSay?: Line;
  /** The scene changes before the question (memory / story games). Choices wait until it's done. */
  stage?: Stage;
};

export type Stage =
  /** Quick Look: show the scene for `ms`, then cover it. */
  | { kind: 'flash'; ms: number; look: Line }
  /** Who Drove Away: show for `ms`, close the garage door, scene[index] leaves, open the door. */
  | { kind: 'vanish'; ms: number; index: number; look: Line; close: Line }
  /** Parking Stories: say lines[0], move the cars (leave / arrive), say lines[1]. */
  | { kind: 'story'; lines: [Line, Line]; motion: ('leave' | 'arrive' | null)[] };

/** childName: the name from Grown-ups settings ('' or missing = none). idx: which round of the game (0-based). */
export type Ctx = { lang: Lang; level: Level; childName?: string; idx?: number };
export type Generator<C> = (cfg: C, rng: Rng, ctx: Ctx) => Round;

/** Shuffle answer + distractors into choices with ids c0..cN. */
export function makeChoices(rng: Rng, answer: Thing, distractors: Thing[], shuffleFn: (r: Rng, a: Thing[]) => Thing[]): { choices: Choice[]; answer: string } {
  const all = shuffleFn(rng, [answer, ...distractors]);
  const choices = all.map((thing, i) => ({ id: `c${i}`, thing }));
  return { choices, answer: choices.find((c) => c.thing === answer)!.id };
}
