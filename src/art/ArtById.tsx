import type { BrandId } from '../content/brands';
import type { CarBody, VehicleId } from '../content/vehicles';
import type { Fills } from './defaults';
import { LogoArt } from './logos';
import { VehicleArt } from './vehicles';

/** Render a Paint Shop page by id: v:<vehicle>, c:<carBody>, l:<brand>. */
export function ArtById({ art, fills, className, lineArt }: { art: string; fills?: Fills; className?: string; lineArt?: boolean }) {
  const [kind, id] = art.split(':');
  if (kind === 'l') return <LogoArt brand={id as BrandId} fills={fills} className={className} lineArt={lineArt} />;
  if (kind === 'c') return <VehicleArt v="car" body={id as CarBody} fills={fills} className={className} lineArt={lineArt} />;
  return <VehicleArt v={id as VehicleId} fills={fills} className={className} load={id === 'dumpTruck' ? 3 : undefined} lineArt={lineArt} />;
}
