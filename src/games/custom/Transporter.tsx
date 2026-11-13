// Car Transporter: "Load 4 cars onto the truck!" — tap cars to load (counted aloud), tap to unload,
import { echoCount } from '../../engine/echo';
// GO checks the count. L3: some cars are already on: "The truck has 3. Make it 7!" (adding up to 10).
import { useCallback, useEffect, useRef, useState } from 'react';
import { LEVELS } from '../../content/levels';
import type { Thing } from '../../content/things';
import { levelFor, recordRound } from '../../engine/adaptive';
import { L } from '../../engine/i18n';
import { int, makeRng } from '../../engine/rng';
import { say, stopSpeech } from '../../engine/speech';
import { sfx, wait } from '../../engine/sound';
import { Confetti } from '../../ui/Confetti';
import { ThingView } from '../../ui/ThingView';
import { Dots, TopBar } from '../../ui/TopBar';
import { randomCar } from '../rounds/util';
import { Reward } from '../Reward';

const BACK = '#/zone/numbers';
type Round = { need: number; pre: number; cars: Thing[] };

function Carrier({ loaded, pre, cars, onUnload, leaving }: { loaded: number[]; pre: number; cars: Thing[]; onUnload: (i: number) => void; leaving: boolean }) {
  // 10 spots: top deck 0–4, bottom deck 5–9 (filled in that order).
  const spots = Array.from({ length: 10 }, (_, i) => (i < pre ? -1 - i : loaded[i - pre] ?? null));
  return (
    <div className={`carrier ${leaving ? 'drive-off' : ''}`}>
      <div className="decks">
        {[0, 1].map((deck) => (
          <div key={deck} className="deck">
            {spots.slice(deck * 5, deck * 5 + 5).map((car, j) => {
              const slot = deck * 5 + j;
              return (
                <button key={slot} className={`slot ${car === null ? 'empty' : ''} ${car !== null && car < 0 ? 'pre' : ''}`} onClick={() => car !== null && car >= 0 && onUnload(car)} aria-label={`spot ${slot + 1}`}>
                  {car !== null && <ThingView thing={car < 0 ? { t: 'vehicle', v: 'car', color: 'gray', body: 'sedan' } : cars[car]} />}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <svg className="carrier-cab" viewBox="0 0 90 140" aria-hidden>
        <path d="M8 132 L8 52 Q8 44 16 44 L50 44 Q60 44 66 54 L84 90 L84 132 Z" fill="#e53935" stroke="#263238" strokeWidth="4" strokeLinejoin="round" />
        <path d="M18 54 L48 54 Q54 54 58 60 L70 86 L18 86 Z" fill="#81d4fa" stroke="#263238" strokeWidth="3" />
        <circle cx="46" cy="128" r="12" fill="#263238" />
        <circle cx="46" cy="128" r="5" fill="#cfd8dc" />
      </svg>
      <div className="carrier-wheels">{[0, 1, 2].map((w) => <i key={w} />)}</div>
    </div>
  );
}

export function Transporter() {
  const rng = useRef(makeRng()).current;
  const cfg = LEVELS.transporter[levelFor('transporter')];
  const make = useCallback((): Round => {
    const need = int(rng, cfg.min, cfg.max);
    const pre = cfg.pre ? int(rng, 1, Math.max(1, need - 2)) : 0;
    const add = need - pre;
    const count = Math.min(10 - pre, add + 3);
    return { need, pre, cars: Array.from({ length: count }, () => randomCar(rng)) };
  }, [rng, cfg]);
  const [r, setR] = useState(make);
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [party, setParty] = useState(0);
  const [done, setDone] = useState(false);
  const busy = useRef(false);
  const alive = useRef(true);
  const rounds = cfg.rounds ?? 4;

  const prompt = r.pre
    ? L('p.carrier.make', { k: L(`num.${r.pre}`), n: L(`num.${r.need}`) })
    : L(r.need === 1 ? 'p.carrier.load1' : 'p.carrier.load', { n: L(`num.${r.need}`) });

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; stopSpeech(); };
  }, []);
  useEffect(() => { void say([idx === 0 && L('game.transporter.intro'), prompt]); }, [r]); // eslint-disable-line react-hooks/exhaustive-deps

  const have = r.pre + loaded.length;

  const load = (i: number) => {
    if (busy.current || loaded.includes(i) || have >= 10) return;
    sfx('pop');
    setLoaded((l) => [...l, i]);
    void say([L(`num.${have + 1}`), ...echoCount(have + 1)]);
  };
  const unload = (i: number) => {
    if (busy.current) return;
    sfx('pop');
    setLoaded((l) => l.filter((x) => x !== i));
    if (have - 1 > 0) void say(L(`num.${have - 1}`));
  };

  const go = async () => {
    if (busy.current) return;
    if (have !== r.need) {
      sfx('wobble');
      setTries((t) => t + 1);
      void say(L(have < r.need ? 'p.carrier.more' : 'p.carrier.less', { have: have ? L(`num.${have}`) : '0', need: L(`num.${r.need}`) }));
      return;
    }
    busy.current = true;
    setLeaving(true);
    sfx('honk');
    await wait(600);
    sfx('vroom');
    setParty((x) => x + 1);
    const change = recordRound('transporter', tries === 0);
    await say([(r.need === 1 ? L('p.carrier.go1') : L('p.carrier.go', { n: L(`num.${r.need}`) })), L('cheer'), change === 'up' && { sfx: 'fanfare' }, change === 'up' && L('levelUp')]);
    await wait(400);
    if (!alive.current) return;
    busy.current = false;
    setLeaving(false);
    setLoaded([]);
    setTries(0);
    if (idx + 1 >= rounds) setDone(true);
    else { setIdx((x) => x + 1); setR(make()); }
  };

  // For automated tests: load the right number of cars and press GO.
  useEffect(() => {
    (window as unknown as { __autoplay?: () => void }).__autoplay = () => {
      const missing = r.need - r.pre - loaded.length;
      if (missing > 0) setLoaded((l) => [...l, ...r.cars.map((_, i) => i).filter((i) => !l.includes(i)).slice(0, missing)]);
      setTimeout(() => document.querySelector<HTMLButtonElement>('.carrier-go')?.click(), 100);
    };
    return () => { delete (window as unknown as { __autoplay?: () => void }).__autoplay; };
  });

  if (done) return <Reward back={BACK} onAgain={() => { setDone(false); setIdx(0); setR(make()); }} />;

  return (
    <div className="screen transporter zone-numbers">
      <TopBar back={BACK} onReplay={() => void say(prompt)}>
        <Dots total={rounds} done={idx} />
      </TopBar>
      <div className="carrier-row">
        <div className="need-sign"><ThingView thing={{ t: 'number', n: r.need }} /></div>
        <Carrier loaded={loaded} pre={r.pre} cars={r.cars} onUnload={unload} leaving={leaving} />
        <button className="big-btn go carrier-go" onClick={() => void go()} aria-label="Go">GO!</button>
      </div>
      <div className="lot-row" key={`lot-${idx}`}>
        {r.cars.map((c, i) => (
          <button key={i} className={`lot-car pop-in ${loaded.includes(i) ? 'used' : ''}`} onClick={() => load(i)}>
            <ThingView thing={c} />
          </button>
        ))}
      </div>
      {party > 0 && <Confetti key={party} />}
    </div>
  );
}
