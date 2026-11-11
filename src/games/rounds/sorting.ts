import type { Generator } from '../../engine/round';
import { L } from '../../engine/i18n';
import type { SortCfg } from '../../content/levels';
import type { Thing } from '../../content/things';
import type { VehicleId } from '../../content/vehicles';
import { choices, pick, randomCar } from './util';

type Group = 'construction' | 'emergency' | 'road';
const MEMBERS: Record<Group, VehicleId[]> = {
  construction: ['excavator', 'bulldozer', 'dumpTruck', 'crane', 'mixer', 'roller'],
  emergency: ['fireTruck', 'ambulance', 'policeCar'],
  road: ['car', 'bus'],
};

/** Sorting Garage: send each vehicle to the right garage (by colour, then by what job it does). */
export const sorting: Generator<SortCfg> = (cfg, rng) => {
  if (cfg.mode === 'color') {
    const color = pick(rng, ['red', 'blue'] as const);
    const other = color === 'red' ? 'blue' : 'red';
    return {
      prompt: L('p.sort.color'),
      scene: [randomCar(rng, { color })],
      ...choices(rng, { t: 'garage', sign: color }, [{ t: 'garage', sign: other }]),
      answerSay: L('say.sortedColor', { color: L(`color.${color}`) }),
    };
  }
  const groups: Group[] = cfg.mode === 'twoGroups' ? ['construction', 'emergency'] : ['construction', 'emergency', 'road'];
  const g = pick(rng, groups);
  const v = pick(rng, MEMBERS[g]);
  const vehicle: Thing = v === 'car' ? randomCar(rng) : { t: 'vehicle', v };
  return {
    prompt: L('p.sort.group'),
    scene: [vehicle],
    ...choices(rng, { t: 'garage', sign: g }, groups.filter((x) => x !== g).map((x) => ({ t: 'garage', sign: x }))),
    answerSay: L('say.sorted', { vehicle: L(`v.${v}`), group: L(`group.${g}`) }),
  };
};
