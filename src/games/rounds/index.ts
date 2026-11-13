import type { Generator } from '../../engine/round';
import { abcConvoy } from './abcConvoy';
import { bigSmall } from './bigSmall';
import { brandLetters } from './brandLetters';
import { carWash } from './carWash';
import { count } from './count';
import { letterHighway } from './letterHighway';
import { loadingDock } from './loadingDock';
import { mechanic } from './mechanic';
import { numberRoad } from './numberRoad';
import { oddOneOut } from './oddOneOut';
import { patternRoad } from './patternRoad';
import { shapeGarage } from './shapeGarage';
import { soundGarage } from './soundGarage';
import { whoJob } from './whoJob';
import { readBrand } from './readBrand';
import { sorting } from './sorting';
import { quickLook } from './quickLook';
import { whoLeft } from './whoLeft';
import { parkingStory } from './parkingStory';
import { engFind } from './engFind';

/** Choice games: game id → round generator. Level configs live in src/content/levels.ts under the same id. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GENERATORS: Record<string, Generator<any>> = {
  count, numberRoad, loadingDock, letterHighway, brandLetters, abcConvoy,
  carWash, shapeGarage, bigSmall, oddOneOut, patternRoad, mechanic, whoJob, soundGarage,
  sorting, readBrand, quickLook, whoLeft, parkingStory, engFind,
};
