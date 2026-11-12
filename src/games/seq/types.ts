import type { Line, Lang } from '../../engine/i18n';
import type { Rng } from '../../engine/rng';
import type { Thing } from '../../content/things';
import type { Level } from '../../content/levels';

/** One "tap them in the right order" puzzle (License Plate, Size Parking). */
export type SeqRound = {
  prompt: Line;
  /** Shown above the slots: the plate to copy. */
  model?: string;
  layout: 'plate' | 'parking';
  pool: { id: string; thing: Thing; key: string }[];
  /** keys in the right order (items with the same key, like two E's, are interchangeable). */
  order: string[];
  sayItem: (step: number) => Line;
  hint: (step: number) => Line;
  done: Line;
};

/** idx = which round of the game this is (0-based). */
export type SeqCtx = { lang: Lang; level: Level; childName: string; idx?: number };
export type SeqGenerator<C> = (cfg: C, rng: Rng, ctx: SeqCtx) => SeqRound;
