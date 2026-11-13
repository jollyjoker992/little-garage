// Tap the items in the right order to fill the slots (License Plate letters, Size Parking vehicles).
import { useCallback, useEffect, useRef, useState } from 'react';
import { GAME_BY_ID } from '../../content/catalog';
import { DEFAULT_ROUNDS, LEVELS } from '../../content/levels';
import { levelFor, recordRound } from '../../engine/adaptive';
import { L } from '../../engine/i18n';
import { makeRng } from '../../engine/rng';
import { say, stopSpeech } from '../../engine/speech';
import { sfx, wait } from '../../engine/sound';
import { getState } from '../../engine/store';
import { Confetti } from '../../ui/Confetti';
import { ThingView } from '../../ui/ThingView';
import { Dots, TopBar } from '../../ui/TopBar';
import { Reward } from '../Reward';
import { SEQ_GENERATORS } from './generators';
import type { SeqRound } from './types';

export function SequenceGame({ gameId }: { gameId: string }) {
  const rng = useRef(makeRng()).current;
  const back = `#/zone/${GAME_BY_ID[gameId]?.zones[0] ?? ''}`;
  const make = useCallback((idx: number): { round: SeqRound; rounds: number } => {
    const level = levelFor(gameId);
    const cfg = (LEVELS as Record<string, Record<number, { rounds?: number }>>)[gameId][level];
    const st = getState();
    return { round: SEQ_GENERATORS[gameId](cfg, rng, { lang: st.lang, level, childName: st.childName, idx }), rounds: cfg.rounds ?? DEFAULT_ROUNDS };
  }, [gameId, rng]);

  const [{ round: r, rounds }, setRound] = useState(() => make(0));
  const [idx, setIdx] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]); // pool ids, in slot order
  const [misses, setMisses] = useState(0);
  const [roundMisses, setRoundMisses] = useState(0);
  const [shake, setShake] = useState<string | null>(null);
  const [party, setParty] = useState(0);
  const [finished, setFinished] = useState(false);
  const busy = useRef(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; stopSpeech(); };
  }, []);
  useEffect(() => {
    void say([idx === 0 && L(`game.${gameId}.intro`), ...[r.prompt].flat()]);
  }, [r, idx, gameId]);

  const step = placed.length;
  const nextKey = r.order[step];
  const isNext = (key: string) => key === nextKey;

  const tap = async (id: string, key: string) => {
    if (busy.current || placed.includes(id)) return;
    if (!isNext(key)) {
      sfx('wobble');
      setShake(id);
      setTimeout(() => setShake(null), 450);
      setMisses((m) => m + 1);
      setRoundMisses((m) => m + 1);
      void say([L('tryAgain'), r.hint(step)]);
      return;
    }
    sfx('pop');
    const now = [...placed, id];
    setPlaced(now);
    setMisses(0);
    if (now.length < r.order.length) {
      void say(r.sayItem(step));
      return;
    }
    busy.current = true;
    sfx('ding');
    setParty((x) => x + 1);
    const change = recordRound(gameId, roundMisses === 0);
    await say([r.sayItem(step), ...[r.done].flat(), L('cheer'), change === 'up' && { sfx: 'fanfare' }, change === 'up' && L('levelUp')]);
    await wait(500);
    if (!alive.current) return;
    busy.current = false;
    setPlaced([]);
    setRoundMisses(0);
    if (idx + 1 >= rounds) setFinished(true);
    else {
      setIdx(idx + 1);
      setRound(make(idx + 1));
    }
  };

  if (finished) return <Reward back={back} onAgain={() => { setFinished(false); setIdx(0); setRound(make(0)); }} />;

  const byId = Object.fromEntries(r.pool.map((p) => [p.id, p]));
  return (
    <div className={`screen seq seq-${r.layout} zone-${GAME_BY_ID[gameId]?.zones[0]}`}>
      <TopBar back={back} onReplay={() => void say(r.prompt)}>
        <Dots total={rounds} done={idx} />
      </TopBar>
      {r.layout === 'plate' ? (
        <div className="seq-top">
          <div className="plate model"><i />{r.model}</div>
          <div className="plate slots">
            <i />
            {r.order.map((_, i) => <span key={i} className={i === step ? 'cur' : ''}>{placed[i] ? byId[placed[i]].key : ''}</span>)}
          </div>
        </div>
      ) : (
        <div className="seq-top spots">
          {r.order.map((_, i) => (
            <div key={i} className={`spot ${i === step ? 'cur' : ''}`}>
              <span className="spot-num">{i + 1}</span>
              {placed[i] && <ThingView thing={byId[placed[i]].thing} />}
            </div>
          ))}
        </div>
      )}
      <div className={`choices pool n${Math.min(r.pool.length, 6)}`} key={`pool-${idx}`}>
        {r.pool.map((p) => (
          <button
            key={p.id}
            data-answer={!placed.includes(p.id) && isNext(p.key) ? 'yes' : undefined}
            className={['choice', 'pop-in', placed.includes(p.id) && 'used', shake === p.id && 'shake', misses >= 2 && isNext(p.key) && !placed.includes(p.id) && 'glow'].filter(Boolean).join(' ')}
            onClick={() => void tap(p.id, p.key)}
          >
            <ThingView thing={p.thing} />
          </button>
        ))}
      </div>
      {party > 0 && <Confetti key={party} />}
    </div>
  );
}
