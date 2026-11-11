import type { ReactNode } from 'react';
import { ChoiceGame } from './ChoiceGame';
import { BrandMemory } from './custom/BrandMemory';
import { BuildCar } from './custom/BuildCar';
import { DrawingBoard } from './custom/DrawingBoard';
import { PaintShop } from './custom/PaintShop';
import { TrafficLight } from './custom/TrafficLight';
import { Transporter } from './custom/Transporter';
import { Puzzle } from './custom/Puzzle';
import { LetterRoad } from './custom/LetterRoad';
import { GENERATORS } from './rounds';
import { SequenceGame } from './seq/SequenceGame';
import { SEQ_GENERATORS } from './seq/generators';
import { Garage } from '../screens/Garage';

/** Custom (non-choice) games: id → screen. `arg` is the optional extra route segment. */
const CUSTOM: Record<string, (arg?: string) => ReactNode> = {
  paint: (arg) => <PaintShop openId={arg} />,
  drawing: (arg) => <DrawingBoard openId={arg} />,
  brandMemory: () => <BrandMemory />,
  buildCar: () => <BuildCar />,
  traffic: () => <TrafficLight />,
  transporter: () => <Transporter />,
  roadPuzzle: () => <Puzzle />,
  letterRoad: () => <LetterRoad />,
  stickers: () => <Garage />,
};

export function isPlayable(id: string) {
  return id in GENERATORS || id in CUSTOM || id in SEQ_GENERATORS;
}

export function GameScreen({ id, arg }: { id: string; arg?: string }) {
  if (id in CUSTOM) return <>{CUSTOM[id](arg)}</>;
  if (id in GENERATORS) return <ChoiceGame key={id} gameId={id} />;
  if (id in SEQ_GENERATORS) return <SequenceGame key={id} gameId={id} />;
  return null;
}
