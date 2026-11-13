// The classmates riding along at the bottom of every English Street screen. They bob while they talk,
// the silly one falls asleep when nobody plays for a while, and tapping a friend makes them do something funny.
import { useEffect, useRef, useState } from 'react';
import { VehicleArt } from '../art/vehicles';
import { Driver } from '../art/CustomCar';
import { COLORS } from '../content/colors';
import { PERSONALITY, mateLabel, mateVoice, type Mate } from '../content/classmates';
import { activeMates, mateLine, tapLine } from '../engine/mates';
import { isSpeaking, onTalk, say } from '../engine/speech';
import { sfx } from '../engine/sound';
import { useStore } from '../engine/store';

const IDLE_MS = 20_000;
const TAP_SFX = { silly: 'honk', curious: 'pop', speedy: 'vroom', shy: 'pop' } as const;

/** A friend: their head popping out of the top of their own vehicle. */
export function MateFigure({ mate }: { mate: Pick<Mate, 'id' | 'v' | 'color'> }) {
  const c = COLORS[mate.color];
  return (
    <svg viewBox="0 0 200 175" className="mate-svg" preserveAspectRatio="xMidYMax meet">
      <VehicleArt v={mate.v} body="sedan" fills={{ body: c, bed: c, cab: c }} box={{ x: 0, y: 55, w: 200, h: 120 }} />
      <g className="mate-head"><Driver kind={mate.id} x={100} y={66} s={30} /></g>
    </svg>
  );
}

export function MateBar() {
  useStore((s) => s.mates); useStore((s) => s.mateOn); useStore((s) => s.mateCount); // re-render on changes
  const mates = activeMates();
  const [talking, setTalking] = useState<string | null>(null);
  const [asleep, setAsleep] = useState(false);
  const [hop, setHop] = useState<{ id: string; n: number } | null>(null);
  const lastTouch = useRef(Date.now());
  const taps = useRef({ n: 0, at: 0 });
  const sleeper = mates.find((m) => PERSONALITY[m.id] === 'silly') ?? mates[0];

  useEffect(() => { const off = onTalk(setTalking); return () => { off(); }; }, []);
  useEffect(() => {
    const touch = () => { lastTouch.current = Date.now(); };
    window.addEventListener('pointerdown', touch, true);
    const id = setInterval(() => {
      if (Date.now() - lastTouch.current > IDLE_MS && !isSpeaking()) setAsleep(true);
    }, 2000);
    return () => { window.removeEventListener('pointerdown', touch, true); clearInterval(id); };
  }, []);

  if (!mates.length) return null;

  const onTap = (m: Mate) => {
    setHop({ id: m.id, n: (hop?.n ?? 0) + 1 });
    if (asleep && m.id === sleeper?.id) {
      setAsleep(false);
      sfx('honk');
      void say(mateLine(m, 'mate.wake'));
      return;
    }
    const now = Date.now();
    taps.current = now - taps.current.at < 8000 ? { n: taps.current.n + 1, at: now } : { n: 1, at: now };
    sfx(TAP_SFX[PERSONALITY[m.id]]);
    // Lots of taps in a row: the friend steers him back to the game.
    void say(taps.current.n >= 4 ? mateLine(m, 'mate.tooMany') : tapLine(m));
    if (taps.current.n >= 4) taps.current = { n: 0, at: 0 };
  };

  return (
    <div className={`mate-bar n${mates.length}`}>
      {mates.map((m) => {
        const sleeping = asleep && m.id === sleeper?.id;
        const isTalking = talking === mateVoice(m.id);
        return (
          <button
            key={m.id}
            className={['mate', isTalking && 'talking', sleeping && 'asleep', hop?.id === m.id && `hop${hop.n % 2}`].filter(Boolean).join(' ')}
            onClick={() => onTap(m)}
            aria-label={mateLabel(m)}
          >
            <MateFigure mate={m} />
            {sleeping && <span className="mate-zzz">z<i>z</i><b>z</b></span>}
            {mateLabel(m) && <span className="mate-name">{mateLabel(m)}</span>}
          </button>
        );
      })}
    </div>
  );
}
