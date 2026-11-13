// One stop on English Street's road: plays the stop's game, then shows what happened —
// a star for the stop, a LEVEL UP when the next stop is a new level, or the town's BADGE.
import { useEffect, useMemo, useState } from 'react';
import { back as goBack } from '../../app/router';
import { ROAD, UNITS, WORDS, type Stop, type StopLevel, type UnitId } from '../../content/english';
import type { EngFindCfg } from '../../content/levels';
import { L, voiced } from '../../engine/i18n';
import { mateSay } from '../../engine/mates';
import { addTry, clearTries, setCameFrom, stopKey, triesOf } from '../../engine/road';
import { makeRng, shuffle } from '../../engine/rng';
import { say, stopSpeech } from '../../engine/speech';
import { sfx } from '../../engine/sound';
import { getState } from '../../engine/store';
import { finishStop, hasBadge, reviewStops, type StopOutcome, type StopResult } from '../../engine/vocab';
import { Confetti } from '../../ui/Confetti';
import { MateBar } from '../../ui/MateBar';
import { ThingView } from '../../ui/ThingView';
import { IconHome, LevelStars, TopBar } from '../../ui/TopBar';
import { ChoiceGame } from '../ChoiceGame';
import { Reward } from '../Reward';
import { ShipArrives } from './ShipArrives';
import { ZipSays } from './ZipSays';

const ROAD_HASH = '#/zone/english';

/** Zip's Garage settings for a stop: its words in a shuffled order; two-word rounds use vehicles he has met. */
function findCfg(stop: Stop): EngFindCfg {
  const s = getState();
  const met = (id: string) => (s.words[id]?.box ?? 0) > 0;
  const vehicles = stop.two ? WORDS.filter((w) => w.kind === 'vehicle' && met(w.id)).map((w) => w.id) : undefined;
  return { level: stop.level, targets: shuffle(makeRng(), stop.words), pool: stop.words, choices: stop.choices, vehicles, rounds: stop.rounds };
}

function StopGame({ stop, onDone }: { stop: Stop; onDone: (r: StopResult) => void }) {
  const cfg = useMemo(() => (stop.kind === 'find' ? findCfg(stop) : null), [stop]);
  if (stop.kind === 'meet') return <ShipArrives words={stop.words} back={ROAD_HASH} onDone={onDone} />;
  if (stop.kind === 'do') return <ZipSays level={stop.level} words={stop.words} rounds={stop.rounds} back={ROAD_HASH} onDone={onDone} />;
  return <ChoiceGame gameId="engFind" cfg={cfg!} back={ROAD_HASH} onDone={onDone} />;
}

/** After a stop: star, level up, badge, or "let's try this stop again". */
function StopDone({ unit, out, level, onAgain }: { unit: UnitId; out: StopOutcome; level: StopLevel; onAgain: () => void }) {
  const icon = UNITS.find((u) => u.id === unit)!.icon;
  useEffect(() => {
    if (!out.passed) void say([L('eng.stopRetry')]);
    else if (out.badge) void say([{ sfx: 'fanfare' }, L('eng.badge', { unit: L(`unit.${unit}`) }), ...mateSay('right'), voiced(L('zip.cheer'), 'zip')]);
    else if (out.levelUp) void say([{ sfx: 'fanfare' }, L(`eng.level${out.levelUp}`), ...mateSay('levelUp')]);
    else void say([{ sfx: 'ding' }, L(out.replay ? 'eng.stopAgain' : 'eng.stopDone'), ...mateSay('right')]);
    return () => stopSpeech();
  }, [out, unit]);
  const shown = out.levelUp ?? level;
  return (
    <div className={`screen stop-done zone-english ${out.badge ? 'is-badge' : ''}`}>
      <div className="reward-top"><TopBar back={ROAD_HASH} /></div>
      {out.passed && <Confetti n={out.badge || out.levelUp ? 70 : 30} />}
      {out.badge ? (
        <div className="badge-big pop-in"><div className="badge-art"><ThingView thing={icon} fit="center" /></div></div>
      ) : (
        <div className={`stars-big pop-in ${out.levelUp ? 'up' : ''} ${out.passed ? '' : 'retry'}`}>
          {[1, 2, 3].map((i) => <i key={i} className={[i <= shown && 'on', out.levelUp === i && 'new'].filter(Boolean).join(' ')}>★</i>)}
        </div>
      )}
      <div className="reward-actions">
        {out.passed ? (
          <button className="big-btn go pulse" onClick={() => { sfx('pop'); goBack(ROAD_HASH); }} aria-label="Next">
            <svg viewBox="0 0 48 48" width="64" height="64"><path d="M16 10 L38 24 L16 38 Z" fill="#fff" /></svg>
          </button>
        ) : (<>
          <button className="big-btn go pulse" onClick={() => { sfx('pop'); onAgain(); }} aria-label="Try again">
            <svg viewBox="0 0 48 48" width="64" height="64"><path d="M38 24 A14 14 0 1 1 30 11" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" /><path d="M26 4 L34 11 L26 18" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button className="big-btn" onClick={() => goBack(ROAD_HASH)} aria-label="Back"><IconHome size={72} /></button>
        </>)}
      </div>
      {!out.badge && <div className="stop-level"><LevelStars level={shown} /></div>}
      <MateBar />
    </div>
  );
}

/** `arg` is "<unit>.<stop index>", or "review.<n>" for the mixed stops after all the badges. */
export function DriveStop({ arg }: { arg?: string }) {
  const [unit, idxStr] = (arg ?? '').split('.');
  const index = Number(idxStr);
  const review = unit === 'review';
  const [stop] = useState<Stop | undefined>(() => {
    const s = getState();
    return review ? reviewStops(s.engRoad, s.engUnits)[index] : ROAD[unit as UnitId]?.[index];
  });
  const [round, setRound] = useState(0);
  const [out, setOut] = useState<StopOutcome | null>(null);
  const [reward, setReward] = useState(false);

  // A bad link or a locked stop: back to the road.
  const locked = !stop || (!review && index > (getState().engRoad[unit] ?? 0) && !hasBadge(getState().engRoad, unit as UnitId));
  useEffect(() => { if (locked) goBack(ROAD_HASH); }, [locked]);
  if (locked || !stop) return null;

  const key = stopKey(unit, index);
  const done = (r: StopResult) => {
    if (review) return setReward(true); // mixed practice: a sticker each time
    const res = finishStop(unit as UnitId, index, r, addTry(key));
    if (res.passed) { clearTries(key); if (!res.replay) setCameFrom(unit, index); }
    setOut(res);
  };

  if (reward) return <Reward back={ROAD_HASH} english onAgain={() => { setReward(false); setRound((x) => x + 1); }} />;
  if (out) return <StopDone unit={unit as UnitId} out={out} level={stop.level} onAgain={() => { setOut(null); setRound((x) => x + 1); }} />;
  return <StopGame key={`${round}-${triesOf(key)}`} stop={stop} onDone={done} />;
}
