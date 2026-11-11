import type { ColorId } from './colors';
import type { CarBody } from './vehicles';

export type BrandId =
  | 'toyota' | 'honda' | 'bmw' | 'mercedes' | 'audi' | 'vinfast' | 'ford' | 'tesla'
  | 'porsche' | 'ferrari' | 'lamborghini' | 'volkswagen' | 'kia' | 'hyundai' | 'mazda' | 'jeep'
  | 'mitsubishi' | 'nissan' | 'chevrolet' | 'mg' | 'lexus' | 'landrover' | 'volvo' | 'suzuki';

export type Brand = {
  id: BrandId;
  /** Shown under logos, and spoken as-is in every language. */
  name: string;
  /** How to say it when the written name reads badly aloud (e.g. "MG" → "M G"). */
  spoken?: string;
  letter: string;
  /** Car color used when a car "of this brand" is drawn. */
  color: ColorId;
  body: CarBody;
};

// To add a brand: add it here, add its logo in src/art/logos.tsx + defaults in src/art/defaults.ts.
export const BRANDS: Brand[] = [
  { id: 'toyota', name: 'Toyota', letter: 'T', color: 'red', body: 'sedan' },
  { id: 'honda', name: 'Honda', letter: 'H', color: 'gray', body: 'sedan' },
  { id: 'bmw', name: 'BMW', letter: 'B', color: 'blue', body: 'sedan' },
  { id: 'mercedes', name: 'Mercedes', letter: 'M', color: 'black', body: 'sedan' },
  { id: 'audi', name: 'Audi', letter: 'A', color: 'white', body: 'sedan' },
  { id: 'vinfast', name: 'VinFast', letter: 'V', color: 'sky', body: 'suv' },
  { id: 'ford', name: 'Ford', letter: 'F', color: 'blue', body: 'pickup' },
  { id: 'tesla', name: 'Tesla', letter: 'T', color: 'red', body: 'sedan' },
  { id: 'porsche', name: 'Porsche', letter: 'P', color: 'gray', body: 'sports' },
  { id: 'ferrari', name: 'Ferrari', letter: 'F', color: 'red', body: 'sports' },
  { id: 'lamborghini', name: 'Lamborghini', letter: 'L', color: 'yellow', body: 'sports' },
  { id: 'volkswagen', name: 'Volkswagen', letter: 'V', color: 'sky', body: 'sedan' },
  { id: 'kia', name: 'Kia', letter: 'K', color: 'orange', body: 'suv' },
  { id: 'hyundai', name: 'Hyundai', letter: 'H', color: 'white', body: 'suv' },
  { id: 'mazda', name: 'Mazda', letter: 'M', color: 'red', body: 'sedan' },
  { id: 'jeep', name: 'Jeep', letter: 'J', color: 'green', body: 'suv' },
  { id: 'mitsubishi', name: 'Mitsubishi', letter: 'M', color: 'red', body: 'suv' },
  { id: 'nissan', name: 'Nissan', letter: 'N', color: 'gray', body: 'sedan' },
  { id: 'chevrolet', name: 'Chevrolet', letter: 'C', color: 'yellow', body: 'pickup' },
  { id: 'mg', name: 'MG', spoken: 'M G', letter: 'M', color: 'red', body: 'suv' },
  { id: 'lexus', name: 'Lexus', letter: 'L', color: 'black', body: 'suv' },
  { id: 'landrover', name: 'Land Rover', letter: 'L', color: 'green', body: 'suv' },
  { id: 'volvo', name: 'Volvo', letter: 'V', color: 'blue', body: 'suv' },
  { id: 'suzuki', name: 'Suzuki', letter: 'S', color: 'white', body: 'sedan' },
];

/** The name to speak (pronunciation fix when needed). */
export const spoken = (b: Brand) => b.spoken ?? b.name;

export const BRAND_BY_ID = Object.fromEntries(BRANDS.map((b) => [b.id, b])) as Record<BrandId, Brand>;
