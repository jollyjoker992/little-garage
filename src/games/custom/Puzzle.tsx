// Picture Puzzle: a logo or vehicle cut into 2 / 4 / 6 pieces. Drag a piece to its place, or tap a
// piece and then tap its spot. Pieces snap in when close; a wrong spot sends the piece back.
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { ArtById } from '../../art/ArtById';
import { LEVELS } from '../../content/levels';
import { levelFor, recordRound } from '../../engine/adaptive';
import { L } from '../../engine/i18n';
import { makeRng, pick, shuffle } from '../../engine/rng';
import { say, stopSpeech } from '../../engine/speech';
import { sfx, wait } from '../../engine/sound';
import { Confetti } from '../../ui/Confetti';
import { Dots, TopBar } from '../../ui/TopBar';
import { Reward } from '../Reward';
import { BRAND_BY_ID, spoken, type BrandId } from '../../content/brands';
import type { Line } from '../../engine/i18n';
import { PAINT_PAGES } from './PaintShop';

const BACK = '#/zone/logic';
/** The picture's name to put in "It's {name}!" (no extra punctuation). */
function artWord(page: string): string | Line {
  const [kind, id] = page.split(':');
  if (kind === 'l') return spoken(BRAND_BY_ID[id as BrandId]);
  return L(kind === 'c' ? `body.${id}` : `v.${id}`);
}
type Piece = { id: string; r: number; c: number };

export function Puzzle() {
  const rng = useRef(makeRng()).current;
  const cfg = LEVELS.roadPuzzle[levelFor('roadPuzzle')];
  const make = useCallback(() => {
    const art = pick(rng, PAINT_PAGES);
    const pieces: Piece[] = [];
    for (let r = 0; r < cfg.rows; r++) for (let c = 0; c < cfg.cols; c++) pieces.push({ id: `${r}-${c}`, r, c });
    return { art, tray: shuffle(rng, pieces) };
  }, [rng, cfg]);
  const [{ art, tray }, setRound] = useState(make);
  const [idx, setIdx] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number } | null>(null);
  const [bounce, setBounce] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [party, setParty] = useState(0);
  const [done, setDone] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const alive = useRef(true);
  const rounds = cfg.rounds ?? 3;
  const square = art.startsWith('l:');
  // Tray pieces mirror the board's grid at 3/4 size, so the tray always fits beside the board.
  const [cell, setCell] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const b = boardRef.current;
    if (!b) return;
    const fit = () => { const r = b.getBoundingClientRect(); setCell({ w: r.width / cfg.cols, h: r.height / cfg.rows }); };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(b);
    return () => ro.disconnect();
  }, [art, cfg.cols, cfg.rows]);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; stopSpeech(); };
  }, []);
  useEffect(() => { void say([idx === 0 && L('game.roadPuzzle.intro'), L('p.puzzle.go')]); }, [art]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Which board cell is under a screen point. */
  const cellAt = (x: number, y: number) => {
    const b = boardRef.current!.getBoundingClientRect();
    if (x < b.left || x > b.right || y < b.top || y > b.bottom) return null;
    return { r: Math.floor(((y - b.top) / b.height) * cfg.rows), c: Math.floor(((x - b.left) / b.width) * cfg.cols) };
  };

  // ── Placing pieces ─────────────────────────────────────────────────────────
  // Placements use functional updates (a drop and Safari's follow-up click can land in the same tick),
  // and the round finishes exactly once, from an effect, when every piece is in.
  const finishing = useRef(false);
  const place = (id: string) => setPlaced((prev) => (prev.includes(id) ? prev : [...prev, id]));
  useEffect(() => {
    if (finishing.current || placed.length < cfg.rows * cfg.cols) return;
    finishing.current = true;
    void (async () => {
      sfx('fanfare');
      setParty((x) => x + 1);
      const change = recordRound('roadPuzzle', mistakes === 0);
      await say([L('p.puzzle.done', { name: artWord(art) }), L('cheer'), change === 'up' && L('levelUp')]);
      await wait(700);
      if (!alive.current) return;
      setPlaced([]);
      setSelected(null);
      setMistakes(0);
      if (idx + 1 >= rounds) setDone(true);
      else { setIdx((i) => i + 1); setRound(make()); }
      finishing.current = false;
    })();
  }, [placed]); // eslint-disable-line react-hooks/exhaustive-deps

  const tryPlace = (p: Piece, at: { r: number; c: number } | null) => {
    if (at && at.r === p.r && at.c === p.c) {
      sfx('ding');
      place(p.id);
      setSelected(null);
      return;
    }
    if (at) {
      sfx('wobble');
      setMistakes((m) => m + 1);
      setBounce(p.id);
      setTimeout(() => setBounce(null), 450);
      void say(L('p.puzzle.again'));
    }
  };

  // ── Dragging ────────────────────────────────────────────────────────────────
  // The finger is followed on the whole window (not just the piece), so a drag always ends cleanly
  // on iPhone/iPad even if the piece loses the touch; the drop point is the piece's centre.
  const dragRef = useRef<{ id: string; pid: number; x0: number; y0: number; cx: number; cy: number; moved: boolean } | null>(null);
  const stopListening = useRef<() => void>(() => {});
  const lastDrop = useRef(0);
  useEffect(() => () => stopListening.current(), []);

  const down = (p: Piece) => (e: RPointerEvent<HTMLButtonElement>) => {
    if (finishing.current || placed.includes(p.id)) return;
    if (dragRef.current) { stopListening.current(); dragRef.current = null; } // a lost finger-lift never blocks the next touch
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    dragRef.current = { id: p.id, pid: e.pointerId, x0: e.clientX, y0: e.clientY, cx: r.left + r.width / 2, cy: r.top + r.height / 2, moved: false };
    setDrag({ id: p.id, dx: 0, dy: 0 });
    const onMove = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d || ev.pointerId !== d.pid) return;
      const dx = ev.clientX - d.x0, dy = ev.clientY - d.y0;
      if (Math.hypot(dx, dy) > 8) d.moved = true;
      setDrag({ id: d.id, dx, dy });
    };
    const onEnd = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d || ev.pointerId !== d.pid) return;
      stopListening.current();
      dragRef.current = null;
      setDrag(null);
      if (ev.type === 'pointercancel') return;
      if (!d.moved) {
        // a tap: select this piece, then tap its spot on the board
        sfx('pop');
        setSelected(d.id);
        return;
      }
      lastDrop.current = Date.now();
      tryPlace(p, cellAt(d.cx + ev.clientX - d.x0, d.cy + ev.clientY - d.y0));
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
    stopListening.current = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
    };
  };
  const tapCell = (r: number, c: number) => {
    if (Date.now() - lastDrop.current < 450) return; // the click Safari sends right after a drag
    const p = tray.find((x) => x.id === selected);
    if (p) tryPlace(p, { r, c });
  };

  if (done) return <Reward back={BACK} onAgain={() => { setDone(false); setIdx(0); setRound(make()); }} />;

  const cellStyle = (p: Piece) => ({
    width: `${cfg.cols * 100}%`,
    height: `${cfg.rows * 100}%`,
    left: `${-p.c * 100}%`,
    top: `${-p.r * 100}%`,
  });
  return (
    <div className="screen puzzle zone-logic">
      <TopBar back={BACK} onReplay={() => void say(L('p.puzzle.go'))}>
        <Dots total={rounds} done={idx} />
      </TopBar>
      <div className="puzzle-body">
        <div className={`puzzle-board ${square ? 'sq' : 'wide'}`} ref={boardRef} style={{ gridTemplateColumns: `repeat(${cfg.cols}, 1fr)`, gridTemplateRows: `repeat(${cfg.rows}, 1fr)` }}>
          <div className="puzzle-ghost"><ArtById art={art} className="thing-svg" /></div>
          {tray.slice().sort((a, b) => a.r - b.r || a.c - b.c).map((p) => (
            <button key={p.id} data-cell={p.id} className={`puzzle-cell ${placed.includes(p.id) ? 'filled' : ''}`} style={{ gridRow: p.r + 1, gridColumn: p.c + 1 }} onClick={() => tapCell(p.r, p.c)} aria-label={`spot ${p.id}`}>
              {placed.includes(p.id) && <div className="piece-art" style={cellStyle(p)}><ArtById art={art} className="thing-svg" /></div>}
            </button>
          ))}
        </div>
        <div className="puzzle-tray" style={{ gridTemplateColumns: `repeat(${cfg.cols}, auto)` }}>
          {tray.filter((p) => !placed.includes(p.id)).map((p) => (
            <button
              key={p.id}
              data-piece={p.id}
              className={['puzzle-piece', square ? 'sq' : 'wide', selected === p.id && 'sel', bounce === p.id && 'shake', drag?.id === p.id && 'dragging'].filter(Boolean).join(' ')}
              style={{ width: cell.w * 0.75, height: cell.h * 0.75, ...(drag?.id === p.id ? { transform: `translate(${drag.dx}px, ${drag.dy}px) scale(1.05)` } : {}) }}
              onPointerDown={down(p)}
              onContextMenu={(e) => e.preventDefault()}
            >
              <div className="piece-art" style={cellStyle(p)}><ArtById art={art} className="thing-svg" /></div>
            </button>
          ))}
        </div>
      </div>
      {party > 0 && <Confetti key={party} />}
    </div>
  );
}
