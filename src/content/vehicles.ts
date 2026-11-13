import type { SfxName } from '../engine/sfxNames';

export type VehicleId =
  | 'car' | 'policeCar' | 'bus' | 'fireTruck' | 'ambulance'
  | 'excavator' | 'bulldozer' | 'dumpTruck' | 'crane' | 'mixer' | 'roller'
  | 'motorbike' | 'bicycle' | 'taxi' | 'truck' | 'garbageTruck' | 'towTruck'
  | 'train' | 'plane' | 'boat' | 'helicopter' | 'rocket';

/** travel = trains, planes, boats… (not on the road). */
export type VehicleCategory = 'road' | 'emergency' | 'construction' | 'travel';

export type VehicleInfo = {
  id: VehicleId;
  category: VehicleCategory;
  /** Sound for Sound Garage. Only vehicles with a distinct sound are used there. */
  sound?: SfxName;
  /** First letter of the English name (Brand Letters L3, English only). */
  letterEn: string;
};

export const VEHICLES: Record<VehicleId, VehicleInfo> = {
  car: { id: 'car', category: 'road', sound: 'honk', letterEn: 'C' },
  bus: { id: 'bus', category: 'road', sound: 'horn', letterEn: 'B' },
  policeCar: { id: 'policeCar', category: 'emergency', sound: 'woop', letterEn: 'P' },
  fireTruck: { id: 'fireTruck', category: 'emergency', sound: 'siren', letterEn: 'F' },
  ambulance: { id: 'ambulance', category: 'emergency', sound: 'neenaw', letterEn: 'A' },
  excavator: { id: 'excavator', category: 'construction', sound: 'rumble', letterEn: 'E' },
  bulldozer: { id: 'bulldozer', category: 'construction', letterEn: 'B' },
  dumpTruck: { id: 'dumpTruck', category: 'construction', sound: 'beepReverse', letterEn: 'D' },
  crane: { id: 'crane', category: 'construction', letterEn: 'C' },
  mixer: { id: 'mixer', category: 'construction', letterEn: 'M' },
  roller: { id: 'roller', category: 'construction', letterEn: 'R' },
  // On the street (English Street town 3)
  motorbike: { id: 'motorbike', category: 'road', letterEn: 'M' },
  bicycle: { id: 'bicycle', category: 'road', letterEn: 'B' },
  taxi: { id: 'taxi', category: 'road', letterEn: 'T' },
  truck: { id: 'truck', category: 'road', letterEn: 'T' },
  garbageTruck: { id: 'garbageTruck', category: 'road', letterEn: 'G' },
  towTruck: { id: 'towTruck', category: 'road', letterEn: 'T' },
  // Far away (English Street town 6)
  train: { id: 'train', category: 'travel', letterEn: 'T' },
  plane: { id: 'plane', category: 'travel', letterEn: 'P' },
  boat: { id: 'boat', category: 'travel', letterEn: 'B' },
  helicopter: { id: 'helicopter', category: 'travel', letterEn: 'H' },
  rocket: { id: 'rocket', category: 'travel', letterEn: 'R' },
};

export const VEHICLE_IDS = Object.keys(VEHICLES) as VehicleId[];
export const CONSTRUCTION = VEHICLE_IDS.filter((v) => VEHICLES[v].category === 'construction');
export const SOUND_VEHICLES = VEHICLE_IDS.filter((v) => VEHICLES[v].sound);
/** Vehicles that have a line in "Who Does This Job?" (key job.<id>). */
export const JOB_VEHICLES: VehicleId[] = ['fireTruck', 'ambulance', 'policeCar', 'excavator', 'bulldozer', 'dumpTruck', 'crane', 'mixer', 'roller', 'bus'];

export type CarBody = 'sedan' | 'sports' | 'suv' | 'pickup' | 'mini' | 'van' | 'jeep' | 'convertible' | 'race' | 'monster';
export const CAR_BODIES: CarBody[] = ['sedan', 'sports', 'suv', 'pickup', 'mini', 'van', 'jeep', 'convertible', 'race', 'monster'];
