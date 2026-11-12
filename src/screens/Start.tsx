import { VehicleArt } from '../art/vehicles';
import { L, t } from '../engine/i18n';
import { useStore } from '../engine/store';

export function Start({ onStart }: { onStart: () => void }) {
  const lang = useStore((s) => s.lang);
  useStore((s) => s.childName); // re-render when the name changes
  const title = t(lang, L('app.title')); // "King's Garage" when a name is set
  return (
    <div className="screen start">
      <h1 className={`title ${title.length > 16 ? 'long' : ''}`}>{title}</h1>
      <div className="start-cars">
        <div className="drive-in"><VehicleArt v="excavator" /></div>
        <div className="drive-in" style={{ animationDelay: '0.2s' }}><VehicleArt v="car" body="sports" brand="ferrari" /></div>
        <div className="drive-in" style={{ animationDelay: '0.4s' }}><VehicleArt v="dumpTruck" load={4} /></div>
      </div>
      <button className="big-btn go start-btn pulse" onClick={onStart}>
        <svg viewBox="0 0 48 48" width="72" height="72"><path d="M14 8 L40 24 L14 40 Z" fill="#fff" stroke="#fff" strokeWidth="4" strokeLinejoin="round" /></svg>
      </button>
    </div>
  );
}
