import { useEffect, useRef, useState } from 'react';
import { back as goBack } from '../app/router';
import { COLORS, type ColorId } from '../content/colors';
import { VEHICLE_IDS, type VehicleId } from '../content/vehicles';
import { L } from '../engine/i18n';
import { pick, makeRng } from '../engine/rng';
import { say } from '../engine/speech';
import { update } from '../engine/store';
import { Confetti } from '../ui/Confetti';
import { IconHome, TopBar } from '../ui/TopBar';
import { VehicleArt } from '../art/vehicles';

const STICKER_COLORS: ColorId[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'];

/** End-of-session reward: a new sticker for My Garage. */
export function Reward({ onAgain, back }: { onAgain: () => void; back: string }) {
  const [sticker] = useState(() => {
    const r = makeRng();
    return { v: pick(r, VEHICLE_IDS) as VehicleId, color: pick(r, STICKER_COLORS) };
  });
  const saved = useRef(false);
  useEffect(() => {
    if (!saved.current) update((s) => ({ stickers: [...s.stickers, { ...sticker, at: Date.now() }] }));
    saved.current = true;
    void say([{ sfx: 'fanfare' }, L('reward', { color: L(`color.${sticker.color}`), vehicle: L(`v.${sticker.v}`) }), L('reward.again')]);
  }, [sticker]);
  return (
    <div className="screen reward">
      <div className="reward-top"><TopBar back={back} /></div>
      <Confetti n={60} />
      <div className="sticker-big pop-in">
        <VehicleArt v={sticker.v} fills={{ body: COLORS[sticker.color], bed: COLORS[sticker.color] }} load={sticker.v === 'dumpTruck' ? 3 : 0} />
      </div>
      <div className="reward-actions">
        <button className="big-btn go" onClick={onAgain} aria-label="Play again">
          <svg viewBox="0 0 48 48" width="64" height="64"><path d="M38 24 A14 14 0 1 1 30 11" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" /><path d="M26 4 L34 11 L26 18" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button className="big-btn" onClick={() => goBack(back)} aria-label="Back"><IconHome size={72} /></button>
      </div>
    </div>
  );
}
