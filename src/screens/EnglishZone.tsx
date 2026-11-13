// English Street IS the road: a row of badges (one town per unit) and the stops of the town he is in.
// Zip waits at the next stop; ▶ plays it. Finishing a town's stops earns its badge and opens the next town.
// A new classmate comes off the ship first, when one is waiting to be named.
import { useEffect, useRef, useState } from 'react';
import { go } from '../app/router';
import { ShipArt, ZipArt } from '../art/english';
import { ROAD, UNITS, WORD_BY_ID, type Stop, type UnitId } from '../content/english';
import type { Thing } from '../content/things';
import { L, voiced } from '../engine/i18n';
import { mateSay, missingMate } from '../engine/mates';
import { firstVisit, newTown, nextReview, takeCameFrom } from '../engine/road';
import { say, stopSpeech, type Step } from '../engine/speech';
import { sfx } from '../engine/sound';
import { useStore } from '../engine/store';
import { currentUnit, hasBadge, openUnits, reviewStops, shownUnits, stopsDone } from '../engine/vocab';
import { FriendArrives } from '../games/english/FriendArrives';
import { MateBar } from '../ui/MateBar';
import { ThingView } from '../ui/ThingView';
import { LevelStars, TopBar } from '../ui/TopBar';

type Town = UnitId | 'review';
const STOP_NAME = { meet: 'game.engMeet', find: 'game.engFind', do: 'game.engDo' } as const;
const unitIcon = (u: UnitId) => UNITS.find((x) => x.id === u)!.icon;
const stopIcon = (town: Town, s: Stop): Thing | 'ship' =>
  s.kind === 'meet' ? 'ship' : s.kind === 'do' ? WORD_BY_ID[s.words[0]].thing : town === 'review' ? { t: 'mystery' } : unitIcon(town);

function Road() {
  const road = useStore((s) => s.engRoad);
  const modes = useStore((s) => s.engUnits);
  const towns = shownUnits(modes);
  const open = openUnits(modes, road);
  const here = currentUnit(modes, road);
  const [sel, setSel] = useState<Town>(here);
  const came = useRef(takeCameFrom()).current;
  const stops = sel === 'review' ? reviewStops(road, modes) : ROAD[sel];
  const done = sel === 'review' ? 0 : stopsDone(road, sel);
  // The mixed review stops take turns: picked once per visit to the road.
  const [revNext] = useState(() => { const k = reviewStops(road, modes).length; return k ? nextReview(k) : -1; });
  const nextIdx = sel === 'review' ? revNext : done < stops.length ? done : -1;
  // Zip starts where he just was and drives to the next stop.
  const [zipAt, setZipAt] = useState(() => (came && came.unit === sel ? came.index : Math.max(0, nextIdx)));
  const [shake, setShake] = useState(0);

  const stopLine = (i: number): Step => L('drive.stop', { n: L(`num.${i + 1}`), place: L(STOP_NAME[stops[i].kind]) });
  /** `full`: also say where he is (once per arrival in a town, and on the 🔊 button). */
  const intro = (full: boolean): Step[] => {
    if (sel === 'review') return [full && L('eng.road.allDone'), nextIdx >= 0 && stopLine(nextIdx)];
    if (nextIdx < 0) return [L('eng.road.town', { unit: L(`unit.${sel}`) }), L('eng.road.replay')];
    return [full && L('eng.road.town', { unit: L(`unit.${sel}`) }), stopLine(nextIdx)];
  };

  useEffect(() => {
    const first = firstVisit();
    const t = setTimeout(() => setZipAt(nextIdx >= 0 ? nextIdx : stops.length - 1), came ? 500 : 0);
    if (came) sfx('vroom');
    void say([
      first && L('zone.english.intro'), first && voiced(L('zip.hello'), 'zip'), first && mateSay('start')[0],
      came && 900,
      ...intro(newTown(sel)),
    ]);
    return () => { clearTimeout(t); stopSpeech(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickTown = (t: Town) => {
    const isOpen = t === 'review' ? here === 'review' : open.includes(t);
    if (!isOpen) { sfx('wobble'); setShake((x) => x + 1); return void say(L('eng.badge.locked')); }
    sfx('pop');
    setSel(t);
    const d = t === 'review' ? 0 : stopsDone(road, t);
    const st = t === 'review' ? reviewStops(road, modes) : ROAD[t];
    setZipAt(Math.min(d, st.length - 1));
    newTown(t);
    void say(t === 'review' ? L('eng.road.allDone') : [L('eng.road.town', { unit: L(`unit.${t}`) }), d >= st.length && L('eng.road.replay')]);
  };
  const play = (i: number) => {
    if (sel !== 'review' && i > done) { sfx('wobble'); setShake((x) => x + 1); return void say(L('eng.road.locked')); }
    sfx('pop');
    go(`#/game/engDrive/${sel}.${i}`);
  };

  const n = Math.max(1, stops.length);
  return (
    <div className="screen eng-road zone-english">
      <TopBar onReplay={() => void say(intro(true))}>
        <div className="medals" key={`m${shake}`}>
          {towns.map((u) => {
            const got = hasBadge(road, u);
            return (
              <button key={u} className={['medal', got && 'got', open.includes(u) ? 'open' : 'locked', sel === u && 'sel', here === u && 'here'].filter(Boolean).join(' ')} onClick={() => pickTown(u)} aria-label={u}>
                <ThingView thing={unitIcon(u)} fit="center" />
                {got && <span className="medal-star">★</span>}
              </button>
            );
          })}
          <button className={['medal', 'review', here === 'review' ? 'open here' : 'locked', sel === 'review' && 'sel'].filter(Boolean).join(' ')} onClick={() => pickTown('review')} aria-label="review">
            <svg viewBox="0 0 48 48" className="thing-svg"><path d="M38 24 A14 14 0 1 1 30 11" fill="none" stroke="#fb8c00" strokeWidth="6" strokeLinecap="round" /><path d="M26 4 L34 11 L26 18" fill="none" stroke="#fb8c00" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </TopBar>
      <div className="dz-map">
        <div className="dz-stops" style={{ ['--n' as string]: n }}>
          {stops.map((st, i) => {
            const icon = stopIcon(sel, st);
            const state = sel === 'review' ? (i === nextIdx ? 'next' : '') : i < done ? 'done' : i === done ? 'next' : 'locked';
            return (
              <button key={i} className={`dz-stop ${state}`} onClick={() => play(i)} aria-label={`Stop ${i + 1}`}>
                <div className="dz-card">{icon === 'ship' ? <ShipArt /> : <ThingView thing={icon} fit="center" />}</div>
                <LevelStars level={st.level} />
                {state === 'done' && <span className="dz-check">✓</span>}
              </button>
            );
          })}
        </div>
        <div className="dz-road">
          <div className="dz-line" />
          <div className="dz-zip" style={{ left: `${((1 + 2 * Math.max(0, zipAt)) / (2 * n)) * 100}%` }}><ZipArt /></div>
        </div>
      </div>
      {nextIdx >= 0 && (
        <button className="big-btn go dz-go pulse" onClick={() => play(nextIdx)} aria-label="Go">
          <svg viewBox="0 0 48 48" width="64" height="64"><path d="M16 10 L38 24 L16 38 Z" fill="#fff" /></svg>
        </button>
      )}
      <MateBar />
    </div>
  );
}

export function EnglishZone() {
  // Decided once when he opens the street: the friend keeps the screen until the welcome is over,
  // even though they're saved the moment he finishes naming them.
  const [arriving, setArriving] = useState(() => missingMate());
  if (arriving) return <FriendArrives key={arriving} id={arriving} onDone={() => setArriving(null)} />;
  return <Road />;
}
