// Zip Says: Zip says ONE English action word and he taps that button; then Zip does it.
// The stop's level decides the help:
//   ★   "Zip nói:" · "go!" · "Nghĩa là chạy!" and the right button glows (it teaches, it doesn't test)
//   ★★  "Zip nói:" · "go!"
//   ★★★ "go!"
// A wrong button wobbles and Zip doesn't move; after two misses the meaning is added and the button glows.
import { useEffect, useRef, useState } from 'react';
import { ActionIcon, ZipArt } from '../../art/english';
import { WORD_BY_ID, type ActionId, type StopLevel } from '../../content/english';
import { L } from '../../engine/i18n';
import { mateSay } from '../../engine/mates';
import { makeRng, shuffle } from '../../engine/rng';
import { afterSpeech, say, stopSpeech, type Step } from '../../engine/speech';
import { sfx } from '../../engine/sound';
import { actionCommand, meansLine, recordWord, tryAgainLines, wordLine, zipCheer, type StopResult } from '../../engine/vocab';
import { Confetti } from '../../ui/Confetti';
import { MateBar } from '../../ui/MateBar';
import { Dots, LevelStars, TopBar } from '../../ui/TopBar';

/** Speed in % of the road per second. Honk and lights don't change the speed. */
const SPEED: Partial<Record<ActionId, number>> = { go: 20, stop: 0, slow: 6, fast: 42 };
const SFX: Partial<Record<ActionId, 'vroom' | 'honk' | 'raceEngine' | 'pop'>> = { go: 'vroom', honk: 'honk', fast: 'raceEngine', stop: 'pop', slow: 'pop', lights: 'pop' };
const word = (a: ActionId) => WORD_BY_ID[`act.${a}`];

export function ZipSays({ level, words, rounds, back = '#/zone/english', onDone }: { level: StopLevel; words: string[]; rounds: number; back?: string; onDone: (r: StopResult) => void }) {
  const rng = useRef(makeRng()).current;
  const actions = useRef(words.map((id) => WORD_BY_ID[id].a!)).current;
  // Every word of the stop is asked in turn (shuffled), never the same one twice in a row.
  const queue = useRef<ActionId[]>([]);
  const [moving, setMoving] = useState<ActionId>('stop');
  const [lights, setLights] = useState(false);
  const [hop, setHop] = useState(0);
  const [ask, setAsk] = useState<ActionId | null>(null);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [shake, setShake] = useState<{ a: ActionId; n: number } | null>(null);
  // Buttons wait while Zip is saying the word: he listens first, then taps.
  const [busy, setBusy] = useState(true);
  const [party, setParty] = useState(0);
  const firstTries = useRef(0);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const zipRef = useRef<HTMLDivElement>(null);
  const speed = useRef(0);
  speed.current = SPEED[moving] ?? 0;

  // Drive Zip along the road.
  useEffect(() => {
    let x = 8, last = performance.now(), raf = 0;
    const loop = (now: number) => {
      x += (speed.current * (now - last)) / 1000;
      last = now;
      if (x > 104) x = -34;
      if (zipRef.current) zipRef.current.style.left = `${x}%`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const command = (a: ActionId) => actionCommand(level, word(a));
  const newAsk = (prev?: ActionId) => {
    if (!queue.current.length) {
      queue.current = shuffle(rng, actions);
      if (queue.current[0] === prev && queue.current.length > 1) queue.current.push(queue.current.shift()!);
    }
    const a = queue.current.shift()!;
    setAsk(a);
    setMisses(0);
    return a;
  };

  useEffect(() => {
    const first = newAsk();
    void say([L('game.engDo.intro'), ...mateSay('start'), 400, ...command(first)]).finally(() => setBusy(false));
    return () => stopSpeech();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const perform = (a: ActionId) => {
    const s = SFX[a];
    if (s) sfx(s);
    if (a === 'honk') setHop((h) => h + 1);
    else if (a === 'lights') setLights((l) => !l);
    else setMoving(a);
  };

  const tap = (a: ActionId) => {
    if (!ask || busy) return;
    if (a !== ask) {
      const m = misses + 1;
      sfx('wobble');
      setShake({ a, n: (shake?.n ?? 0) + 1 });
      setMisses(m);
      // Two misses above ★: the meaning is given (and the button glows).
      void say([...tryAgainLines(), ...(m === 1 ? mateSay('miss') : []), ...command(ask), m >= 2 && level > 1 && meansLine(word(ask))]);
      return;
    }
    perform(a);
    sfx('ding');
    setParty((x) => x + 1);
    if (misses === 0) firstTries.current++;
    recordWord(`act.${a}`, level, misses === 0);
    const n = score + 1;
    setScore(n);
    setBusy(true);
    const praise: Step[] = [wordLine(word(a), 'zip'), ...mateSay('right'), zipCheer()];
    void say(praise).then(async () => {
      // The last round: finish even if a tap cut the praise short.
      if (n >= rounds) { await afterSpeech(); if (alive.current) onDone({ first: firstTries.current, total: rounds }); return; }
      const nx = newAsk(a);
      void say([600, ...command(nx)]).finally(() => setBusy(false));
    });
  };

  return (
    <div className="screen game zip-says zone-english">
      <TopBar back={back} onReplay={() => void say(ask ? command(ask) : L('game.engDo.intro'))}>
        <LevelStars level={level} />
        <Dots total={rounds} done={score} />
      </TopBar>
      <div className="zs-road">
        <div className="road-line" />
        <div className={`zs-zip hop${hop % 2} ${hop ? 'hopping' : ''}`} ref={zipRef}>
          <ZipArt lights={lights} />
        </div>
      </div>
      <div className={`zs-buttons n${actions.length} ${busy ? 'waiting' : ''}`}>
        {actions.map((a) => (
          <button
            key={`${a}-${shake?.a === a ? shake.n : 0}`}
            className={['zs-btn', 'pop-in', shake?.a === a && 'shake', a === ask && !busy && (level === 1 || misses >= 2) && 'glow', (a === moving || (a === 'lights' && lights)) && 'on'].filter(Boolean).join(' ')}
            data-answer={a === ask ? 'yes' : undefined}
            onClick={() => tap(a)}
            aria-label={a}
          >
            <ActionIcon a={a} />
          </button>
        ))}
      </div>
      <MateBar />
      {party > 0 && <Confetti key={party} n={24} />}
    </div>
  );
}
