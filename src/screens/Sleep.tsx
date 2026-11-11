import { useEffect } from 'react';
import { VehicleArt } from '../art/vehicles';
import { L } from '../engine/i18n';
import { say } from '../engine/speech';
import { HoldButton } from '../ui/HoldButton';

export function Sleep({ onContinue }: { onContinue: () => void }) {
  useEffect(() => { void say(L('sleep')); }, []);
  return (
    <div className="screen sleep">
      <div className="moon">🌙</div>
      <div className="sleep-cars">
        <VehicleArt v="car" body="sedan" /><VehicleArt v="excavator" /><VehicleArt v="bus" />
      </div>
      <div className="zzz">Z z z</div>
      <HoldButton onDone={onContinue} className="gear">⚙️</HoldButton>
    </div>
  );
}
