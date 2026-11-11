// Letter Road: drive a car along a capital letter drawn as a road, stroke by stroke, in writing order.
// The car only moves forward along the road (finger must stay on it), so it teaches the real strokes.
import { useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { VehicleArt } from '../../art/vehicles';
import { LEVELS } from '../../content/levels';
import { levelFor, recordRound } from '../../engine/adaptive';
import { L } from '../../engine/i18n';
import { makeRng, pick } from '../../engine/rng';
import { say, stopSpeech } from '../../engine/speech';
import { sfx, wait } from '../../engine/sound';
import { Confetti } from '../../ui/Confetti';
import { Dots, TopBar } from '../../ui/TopBar';
import { Reward } from '../Reward';
import { sample, STROKES, type Pt } from '../letterStrokes';

const BACK = '#/zone/letters';
const ON_ROAD = 11; // how far (in letter units) the finger may be from the road's centre line
const AHEAD = 14; // how far ahead of the car a touch can jump

const toPath = (pts: Pt[]) => 'M' + pts.map((p) => p.join(' ')).join(' L');

export function LetterRoad() {
  const rng = useRef(makeRng()).current;
  const cfg = LEVELS.letterRoad[levelFor('letterRoad')];
  const rounds = cfg.rounds ?? 5;
  const pickLetter = (prev?: string) => pick(rng, cfg.letters.split('').filter((c) => c !== prev));
  const [letter, setLetter] = useState(() => pickLetter());
  const [idx, setIdx] = useState(0);
  const [stroke, setStroke] = useState(0);
  const [prog, setProg] = useState(0); // distance driven along the current stroke
  const [party, setParty] = useState(0);
  const [done, setDone] = useState(false);
  const [finished, setFinished] = useState(false); // letter finished
  const svgRef = useRef<SVGSVGElement>(null);
  const driving = useRef(false);
  const alive = useRef(true);
  const roads = useMemo(() => STROKES[letter].map(sample), [letter]);
  const cur = roads[stroke];

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; stopSpeech(); };
  }, []);
  useEffect(() => { void say([idx === 0 && L('game.letterRoad.intro'), L('p.road.letter', { letter })]); }, [letter]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Finger position in letter units. */
  const toLocal = (e: { clientX: number; clientY: number }): Pt | null => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return [p.x, p.y];
  };

  /** Move the car to the road point nearest the finger (only forward, within a short window ahead). */
  const progRef = useRef(0);
  progRef.current = prog;
  const advance = (p: Pt) => {
    const at = progRef.current;
    let best = -1, bestD = ON_ROAD;
    for (let i = 0; i < cur.pts.length; i++) {
      const l = cur.len[i];
      if (l < at - 2 || l > at + AHEAD) continue;
      const d = Math.hypot(cur.pts[i][0] - p[0], cur.pts[i][1] - p[1]);
      if (d <= bestD) { bestD = d; best = i; }
    }
    if (best >= 0 && cur.len[best] > at) {
      progRef.current = cur.len[best]; // keep up with fast finger events between renders
      setProg(cur.len[best]);
    }
  };

  const total = cur.len[cur.len.length - 1];
  useEffect(() => {
    if (finished || prog < total - 1.5) return;
    // stroke complete
    driving.current = false;
    sfx('ding');
    if (stroke + 1 < roads.length) {
      setStroke((s) => s + 1);
      setProg(0);
      void say(L('p.road.next'));
      return;
    }
    setFinished(true);
    void (async () => {
      sfx('fanfare');
      setParty((x) => x + 1);
      const change = recordRound('letterRoad', true);
      await say([L('p.road.done', { letter }), L('cheer'), change === 'up' && L('levelUp')]);
      await wait(600);
      if (!alive.current) return;
      setFinished(false);
      setStroke(0);
      setProg(0);
      if (idx + 1 >= rounds) setDone(true);
      else { setIdx((i) => i + 1); setLetter((l) => pickLetter(l)); }
    })();
  }, [prog]); // eslint-disable-line react-hooks/exhaustive-deps

  const down = (e: RPointerEvent<SVGSVGElement>) => {
    if (finished) return;
    const p = toLocal(e);
    if (!p) return;
    const [cx, cy] = cur.pts[cur.len.findIndex((l) => l >= prog)] ?? cur.pts[0];
    if (Math.hypot(cx - p[0], cy - p[1]) > ON_ROAD + 4) {
      void say(L('p.road.start'));
      return;
    }
    try { svgRef.current?.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    driving.current = true;
    sfx('vroom');
    advance(p);
  };
  const move = (e: RPointerEvent<SVGSVGElement>) => {
    if (!driving.current) return;
    const coalesced = e.nativeEvent.getCoalescedEvents?.() ?? [];
    for (const ev of coalesced.length ? coalesced : [e.nativeEvent]) {
      const p = toLocal(ev);
      if (p) advance(p);
    }
  };
  const up = () => { driving.current = false; };

  if (done) return <Reward back={BACK} onAgain={() => { setDone(false); setIdx(0); setLetter(pickLetter()); }} />;

  // car position + heading
  const i = Math.max(0, cur.len.findIndex((l) => l >= prog));
  const [x, y] = cur.pts[i];
  const [nx, ny] = cur.pts[Math.min(i + 2, cur.pts.length - 1)];
  const [px, py] = cur.pts[Math.max(i - 2, 0)];
  const ang = (Math.atan2(ny - py, nx - px) * 180) / Math.PI;
  const flip = Math.abs(ang) > 90;
  const drivenPts = cur.pts.slice(0, i + 1);
  const start = cur.pts[0];
  const [ax, ay] = cur.pts[Math.min(8, cur.pts.length - 1)];

  return (
    <div className="screen letter-road zone-letters">
      <TopBar back={BACK} onReplay={() => void say(L('p.road.letter', { letter }))}>
        <Dots total={rounds} done={idx} />
      </TopBar>
      <div className="lr-body">
        <svg ref={svgRef} className="lr-svg" viewBox="-8 -8 116 116" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          {roads.map((r, k) => (
            <g key={k} className={k === stroke ? 'lr-road cur' : k < stroke ? 'lr-road done' : 'lr-road todo'}>
              <path d={toPath(r.pts)} className="lr-asphalt" data-points={k === stroke ? JSON.stringify(r.pts.filter((_, j) => j % 3 === 0 || j === r.pts.length - 1)) : undefined} />
              <path d={toPath(r.pts)} className="lr-dash" />
              {(k < stroke || finished) && <path d={toPath(r.pts)} className="lr-paint" />}
            </g>
          ))}
          {!finished && drivenPts.length > 1 && <path d={toPath(drivenPts)} className="lr-paint" />}
          {!finished && (<>
            <g transform={`translate(${start[0]} ${start[1]})`} className="lr-flag">
              <circle r="6.5" />
              <path d="M-1.5 -4 L-1.5 4 M-1.5 -4 L3.5 -2.2 L-1.5 -0.4" />
            </g>
            {prog < 1 && <path className="lr-arrow" d={`M${start[0]} ${start[1]} L${ax} ${ay}`} markerEnd="url(#lr-head)" />}
            <g transform={`translate(${x} ${y}) rotate(${ang}) scale(1 ${flip ? -1 : 1})`} className="lr-car">
              <VehicleArt v="car" body="sports" box={{ x: -14, y: -9, w: 28, h: 17 }} fills={{ body: '#e53935' }} align="center" />
            </g>
          </>)}
          <defs>
            <marker id="lr-head" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 Z" fill="#43a047" />
            </marker>
          </defs>
        </svg>
      </div>
      {party > 0 && <Confetti key={party} />}
    </div>
  );
}
