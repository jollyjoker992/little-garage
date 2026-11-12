import { useCallback, useEffect, useRef, useState } from 'react';
import { GAME_BY_ID } from '../content/catalog';
import { DEFAULT_ROUNDS, LEVELS } from '../content/levels';
import { levelFor, recordRound } from '../engine/adaptive';
import { L } from '../engine/i18n';
import { makeRng } from '../engine/rng';
import { thingKey } from '../content/things';
import type { Round } from '../engine/round';
import { say, stopSpeech } from '../engine/speech';
import { sfx, wait } from '../engine/sound';
import { getState } from '../engine/store';
import { Confetti } from '../ui/Confetti';
import { ThingView } from '../ui/ThingView';
import { Dots, TopBar } from '../ui/TopBar';
import { Reward } from './Reward';
import { GENERATORS } from './rounds';

type Session = { idx: number; round: Round; rounds: number };

/** Plays any generator-based game: speak → wait for tap → feedback → next round → sticker. */
export function ChoiceGame({ gameId }: { gameId: string }) {
  const rng = useRef(makeRng()).current;
  const back = `#/zone/${GAME_BY_ID[gameId]?.zones[0] ?? ''}`;

  const lastSig = useRef('');
  const make = useCallback((idx: number): Session => {
    const level = levelFor(gameId);
    const cfg = (LEVELS as Record<string, Record<number, { rounds?: number }>>)[gameId][level];
    // Never show the same question twice in a row (same answer + same choices).
    let round = GENERATORS[gameId](cfg, rng, { lang: getState().lang, level, childName: getState().childName, idx });
    const sig = (x: Round) => JSON.stringify([x.prompt, x.scene.map(thingKey), x.choices.map((c) => thingKey(c.thing)).sort()]);
    for (let tries = 0; tries < 8 && sig(round) === lastSig.current; tries++) round = GENERATORS[gameId](cfg, rng, { lang: getState().lang, level, childName: getState().childName, idx });
    lastSig.current = sig(round);
    return { idx, round, rounds: cfg.rounds ?? DEFAULT_ROUNDS };
  }, [gameId, rng]);

  const [s, setS] = useState(() => make(0));
  const [misses, setMisses] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState<string | null>(null);
  const [counted, setCounted] = useState<number[]>([]);
  const [party, setParty] = useState(0);
  const [finished, setFinished] = useState(false);
  const busy = useRef(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true; // (React's dev mode mounts, unmounts and re-mounts once)
    return () => { alive.current = false; stopSpeech(); };
  }, []);

  const r = s.round;
  const promptSteps = useCallback(() => [r.promptSfx && { sfx: r.promptSfx }, r.prompt], [r]);

  // Stage runner: 'look' → (covered / moved) → 'ask'. Choices are disabled until 'ask'.
  const [phase, setPhase] = useState<'look' | 'covered' | 'moved' | 'ask'>('ask');
  const [replay, setReplay] = useState(0);
  const runId = useRef(0);
  useEffect(() => {
    const my = ++runId.current;
    const live = () => alive.current && runId.current === my;
    const st = s.round.stage;
    const intro = s.idx === 0 && replay === 0 && L(`game.${gameId}.intro`);
    void (async () => {
      if (!st) {
        setPhase('ask');
        await say([intro, ...promptSteps()]);
        return;
      }
      setPhase('look');
      if (st.kind === 'story') {
        await say([intro, st.lines[0]]);
        if (!live()) return;
        await wait(300);
        if (!live()) return;
        setPhase('moved');
        await wait(1300);
        if (!live()) return;
        await say(st.lines[1]);
      } else {
        await say([intro, st.look]);
        if (!live()) return;
        await wait(st.ms);
        if (!live()) return;
        setPhase('covered');
        if (st.kind === 'vanish') {
          await say(st.close);
          await wait(700);
          if (!live()) return;
          setPhase('moved'); // door opens again, one vehicle is gone
        }
      }
      if (!live()) return;
      setPhase('ask');
      await say(promptSteps());
    })();
  }, [s, gameId, promptSteps, replay]);

  const next = () => {
    if (!alive.current) return;
    busy.current = false;
    setMisses(0); setWrong([]); setSolved(null); setCounted([]); setReplay(0);
    if (s.idx + 1 >= s.rounds) setFinished(true);
    else setS(make(s.idx + 1));
  };

  const onChoice = async (id: string) => {
    if (busy.current || solved || phase !== 'ask') return;
    if (id === r.answer) {
      busy.current = true;
      setSolved(id);
      setParty((x) => x + 1);
      sfx('ding');
      const change = recordRound(gameId, misses === 0);
      await say([r.answerSay, L('cheer'), change === 'up' && { sfx: 'fanfare' }, change === 'up' && L('levelUp')]);
      await wait(400);
      next();
      return;
    }
    if (wrong.includes(id)) return;
    sfx('wobble');
    const m = misses + 1;
    setMisses(m);
    setWrong((w) => [...w, id]);
    if (m >= 3) {
      busy.current = true;
      setSolved(r.answer);
      recordRound(gameId, false);
      await say([L('reveal'), r.answerSay]);
      await wait(700);
      next();
    } else {
      void say([L('tryAgain'), m >= 2 && L('hint'), ...promptSteps()]);
    }
  };

  const onScene = (i: number) => {
    if (phase !== 'ask') return;
    const th = r.scene[i];
    if (th.t === 'speaker' && r.promptSfx) return void say([{ sfx: r.promptSfx }]);
    if (!r.countable) return;
    sfx('pop');
    const pos = counted.indexOf(i);
    const n = pos >= 0 ? pos + 1 : counted.length + 1;
    if (pos < 0) setCounted((c) => [...c, i]);
    void say(L(`num.${n}`));
  };

  if (finished) {
    return <Reward back={back} onAgain={() => { setFinished(false); setS(make(0)); }} />;
  }

  return (
    <div className={`screen game zone-${GAME_BY_ID[gameId]?.zones[0]} ${r.scene.length ? '' : 'no-scene'}`}>
      <TopBar back={back} onReplay={() => (r.stage ? setReplay((x) => x + 1) : void say(promptSteps()))}>
        <Dots total={s.rounds} done={s.idx + (solved ? 1 : 0)} />
      </TopBar>
      {r.scene.length > 0 && (
        <div
          className={`scene scene-${r.sceneStyle ?? 'row'} n${r.scene.length} ${r.scene.some((x) => x.t === 'vehicle') ? 'has-vehicles' : ''} ${
            r.stage && (phase === 'covered' || (r.stage.kind === 'flash' && phase === 'ask')) ? 'covered' : ''}`}
          key={`scene-${s.idx}`}
          style={r.sceneStyle === 'lot' ? { ['--cols' as string]: Math.min(r.scene.length, 5), ['--cols-p' as string]: Math.min(r.scene.length, 3), ['--rows' as string]: Math.ceil(r.scene.length / 5), ['--rows-p' as string]: Math.ceil(r.scene.length / 3), ['--colw' as string]: r.scene.length <= 3 ? '24vw' : '18vw' } : undefined}
        >
          {r.scene.map((th, i) => {
            const c = counted.indexOf(i);
            const st = r.stage;
            const motion = st?.kind === 'story' ? st.motion[i] : null;
            const moved = phase === 'moved' || phase === 'ask';
            const gone = st?.kind === 'vanish' && st.index === i && moved;
            const cls = motion ? `m-${motion} ${moved ? 'moved' : ''}` : gone ? 'gone' : 'drive-in';
            return (
              <button key={i} className={`scene-item ${cls} t-${th.t} ${c >= 0 ? 'counted' : ''}`} style={{ animationDelay: `${i * 0.08}s` }} onClick={() => onScene(i)}>
                <ThingView thing={th} />
                {c >= 0 && <span className="count-badge">{c + 1}</span>}
              </button>
            );
          })}
        </div>
      )}
      <div className={`choices n${r.choices.length} ${phase === 'ask' ? '' : 'waiting'}`} key={`choices-${s.idx}`}>
        {r.choices.map((c) => (
          <button
            key={c.id}
            data-answer={c.id === r.answer ? 'yes' : undefined}
            className={['choice', 'pop-in', wrong.includes(c.id) && 'shake dim', misses >= 2 && c.id === r.answer && !solved && 'glow', solved === c.id && 'win'].filter(Boolean).join(' ')}
            onClick={() => void onChoice(c.id)}
          >
            <ThingView thing={c.thing} />
          </button>
        ))}
      </div>
      {party > 0 && <Confetti key={party} />}
    </div>
  );
}
