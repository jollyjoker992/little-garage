import { useEffect, useRef, useState } from 'react';
import { VehicleArt } from '../../art/vehicles';
import { LEVELS } from '../../content/levels';
import { levelFor, recordRound } from '../../engine/adaptive';
import { L } from '../../engine/i18n';
import { makeRng, pick } from '../../engine/rng';
import { say, stopSpeech } from '../../engine/speech';
import { sfx } from '../../engine/sound';
import { Confetti } from '../../ui/Confetti';
import { Dots, TopBar } from '../../ui/TopBar';
import { Reward } from '../Reward';

type Light = 'red' | 'yellow' | 'green';
const SPEED: Record<Light, number> = { red: 0, yellow: 6, green: 22 }; // % of screen per second

export function TrafficLight() {
  const cfg = LEVELS.traffic[levelFor('traffic')];
  const rng = useRef(makeRng()).current;
  const [light, setLight] = useState<Light>('green');
  const [ask, setAsk] = useState<Light | null>(null);
  const [score, setScore] = useState(0);
  const [party, setParty] = useState(0);
  const [done, setDone] = useState(false);
  const carRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<Light>('green');
  const misses = useRef(0);
  lightRef.current = light;

  const options: Light[] = cfg.yellow ? ['red', 'yellow', 'green'] : ['red', 'green'];
  const nextAsk = (current: Light) => pick(rng, options.filter((o) => o !== current));

  // Move the car with requestAnimationFrame.
  useEffect(() => {
    let x = 10, last = performance.now(), raf = 0;
    const loop = (now: number) => {
      x += (SPEED[lightRef.current] * (now - last)) / 1000;
      last = now;
      if (x > 110) x = -30;
      if (carRef.current) carRef.current.style.left = `${x}%`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const first = cfg.requests ? nextAsk('green') : null;
    setAsk(first);
    void say([L('game.traffic.intro'), first && L(`traffic.ask.${first}`)]);
    return () => stopSpeech();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tap = (c: Light) => {
    setLight(c);
    if (c === 'green') sfx('vroom');
    else sfx('pop');
    if (!ask) return void say(L(`traffic.${c}`));
    if (c === ask) {
      sfx('ding');
      setParty((x) => x + 1);
      recordRound('traffic', misses.current === 0);
      misses.current = 0;
      const s = score + 1;
      setScore(s);
      if (s >= (cfg.rounds ?? 5)) {
        void say([L(`traffic.${c}`), L('cheer')]).then(() => setDone(true));
        return;
      }
      const n = nextAsk(c);
      setAsk(n);
      void say([L(`traffic.${c}`), L('cheer'), 1200, L(`traffic.ask.${n}`)]);
    } else {
      misses.current++;
      void say([L(`traffic.${c}`), L('tryAgain'), L(`traffic.ask.${ask}`)]);
    }
  };

  if (done) return <Reward back="#/zone/play" onAgain={() => { setScore(0); setDone(false); const n = nextAsk(light); setAsk(n); void say(L(`traffic.ask.${n}`)); }} />;

  return (
    <div className="screen traffic zone-play">
      <TopBar back="#/zone/play" onReplay={() => void say(ask ? L(`traffic.ask.${ask}`) : L('game.traffic.intro'))}>
        {cfg.requests && <Dots total={cfg.rounds ?? 5} done={score} />}
      </TopBar>
      <div className="traffic-body">
        <div className="signal">
          {(['red', 'yellow', 'green'] as Light[]).map((c) => (
            <button key={c} className={`lamp ${c} ${light === c ? 'lit' : ''}`} onClick={() => tap(c)} aria-label={c} disabled={c === 'yellow' && !cfg.yellow && !!cfg.requests} />
          ))}
        </div>
        <div className="road">
          <div className="road-line" />
          <div className="road-car" ref={carRef}><VehicleArt v="car" body="sports" fills={{ body: '#1e88e5' }} /></div>
        </div>
      </div>
      {party > 0 && <Confetti key={party} n={20} />}
    </div>
  );
}
