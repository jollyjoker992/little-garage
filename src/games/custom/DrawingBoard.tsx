// Drawing Board: free finger painting with pens, crayons, brushes, rainbow and star pens, stickers
// and an eraser — on blank paper or over a vehicle/logo outline (outlines stay on top, like a
// coloring book). Work is saved to My Garage automatically when leaving or starting a new page.
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { back } from '../../app/router';
import { ArtById } from '../../art/ArtById';
import { BRAND_BY_ID, spoken, type BrandId } from '../../content/brands';
import { COLORS, COLOR_IDS, type ColorId } from '../../content/colors';
import { BASE_SIZE, SIZE_MUL, StrokePainter, TOOLS, TOOL_ICON, paintStroke, type Pt, type SizeName, type Stroke, type Surface, type Tool } from '../../engine/brushes';
import { getDrawing, saveDrawing } from '../../engine/drawings';
import { L, type Line } from '../../engine/i18n';
import { say, stopSpeech } from '../../engine/speech';
import { scribbleSpeed, scribbleStart, scribbleStop, sfx } from '../../engine/sound';
import { uid } from '../../engine/store';
import { Confetti } from '../../ui/Confetti';
import { TopBar } from '../../ui/TopBar';
import { PAINT_PAGES, pageName } from './PaintShop';

function artMarkup(art: string, w: number, h: number, asOutline: boolean) {
  return renderToStaticMarkup(<ArtById art={art} lineArt={asOutline} />)
    .replace('<svg ', `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(w)}" height="${Math.round(h)}" `);
}

/** Same-origin blob URL, so drawing it into a canvas never taints it (Safari-safe). */
function svgToImage(markup: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }));
  });
}

function blobToImage(b: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(b);
  });
}

// Sticker images (rendered once from the same drawings the other games use).
const stampImages = new Map<string, HTMLImageElement>();
let stampsLoading: Promise<void> | null = null;
function loadStamps() {
  stampsLoading ??= Promise.all(PAINT_PAGES.map(async (p) => {
    const square = p.startsWith('l:');
    stampImages.set(p, await svgToImage(artMarkup(p, 400, square ? 400 : 240, false)));
  })).then(() => undefined).catch(() => undefined);
  return stampsLoading;
}

export function stampName(p: string): Line {
  const [kind, id] = p.split(':');
  if (kind === 'l') return L('say.value', { value: spoken(BRAND_BY_ID[id as BrandId]) });
  if (kind === 'c') return L(`body.${id}`);
  return L(`v.${id}`);
}

const PENS: Tool[] = ['pencil', 'crayon', 'brush'];
const SIZES: SizeName[] = ['small', 'medium', 'big'];

type Sel = { n: number; page: string; base?: HTMLImageElement; id?: string };

export function DrawingBoard({ openId }: { openId?: string }) {
  const [sel, setSel] = useState<Sel | null>(null);
  const [loading, setLoading] = useState(!!openId);
  const n = useRef(0);

  useEffect(() => {
    void loadStamps();
    if (!openId) {
      void say(L('game.drawing.intro'));
      return () => stopSpeech();
    }
    let alive = true;
    void getDrawing(openId).then(async (d) => {
      if (!alive) return;
      if (d) {
        const base = await blobToImage(d.paint).catch(() => undefined);
        if (alive) setSel({ n: ++n.current, page: d.page, base, id: d.id });
      }
      if (alive) setLoading(false);
    });
    return () => { alive = false; stopSpeech(); };
  }, [openId]);

  if (loading) return <div className="screen zone-colors" />;
  if (!sel) {
    return (
      <div className="screen zone-colors">
        <TopBar back="#/zone/colors" onReplay={() => void say(L('draw.pick'))} />
        <div className="page-grid">
          <button className="page-card blank-page pop-in" onClick={() => { sfx('pop'); setSel({ n: ++n.current, page: 'blank' }); }} aria-label="Blank page">✏️</button>
          {PAINT_PAGES.map((p) => (
            <button key={p} className="page-card pop-in" onClick={() => { sfx('pop'); setSel({ n: ++n.current, page: p }); }}>
              <ArtById art={p} lineArt className="thing-svg" />
            </button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <Board
      key={sel.n}
      page={sel.page}
      base={sel.base}
      id={sel.id}
      onClose={() => (openId ? back('#/garage') : setSel(null))}
      onNew={() => setSel(null)}
    />
  );
}

function Board({ page, base, id, onClose, onNew }: { page: string; base?: HTMLImageElement; id?: string; onClose: () => void; onNew: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const active = useRef(new Map<number, { stroke: Stroke; painter: StrokePainter }>());
  const size = useRef({ w: 0, h: 0 });
  const outlineRect = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const dirty = useRef(false);
  const idRef = useRef(id);
  const lastPen = useRef<Tool>('crayon');
  const [tool, setTool] = useState<Tool>('crayon');
  const [color, setColor] = useState<ColorId>('red');
  const [sizeName, setSizeName] = useState<SizeName>('medium');
  const [stamp, setStamp] = useState(PAINT_PAGES[0]);
  const [count, setCount] = useState(0);
  const [party, setParty] = useState(0);
  // Pointer handlers read the latest picks from refs (a second finger can change them mid-stroke).
  const cur = useRef({ tool, color, sizeName, stamp });
  cur.current = { tool, color, sizeName, stamp };
  const pick = (next: Partial<typeof cur.current>) => {
    cur.current = { ...cur.current, ...next };
    if (next.tool) setTool(next.tool);
    if (next.color) setColor(next.color);
    if (next.sizeName) setSizeName(next.sizeName);
    if (next.stamp) setStamp(next.stamp);
  };

  const surface = (): Surface | null => {
    const ctx = canvasRef.current?.getContext('2d');
    return ctx ? { ctx, w: size.current.w, h: size.current.h, stampImage: (s) => stampImages.get(s) } : null;
  };

  const replay = useCallback(() => {
    const s = surface();
    if (!s) return;
    s.ctx.clearRect(0, 0, s.w, s.h);
    if (base) s.ctx.drawImage(base, 0, 0, s.w, s.h);
    for (const st of strokes.current) paintStroke(s, st);
  }, [base]);

  // Size the canvas to its box; re-draw everything after rotation.
  useLayoutEffect(() => {
    const wrap = wrapRef.current!;
    const c = canvasRef.current!;
    const fit = () => {
      const r = wrap.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size.current = { w: r.width, h: r.height };
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      c.getContext('2d')!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const svg = outlineRef.current?.querySelector('svg');
      if (svg) {
        const o = svg.getBoundingClientRect();
        outlineRect.current = { x: o.left - r.left, y: o.top - r.top, w: o.width, h: o.height };
      }
      replay();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    void loadStamps().then(replay);
    return () => ro.disconnect();
  }, [replay]);

  // `el` is passed on unmount: React clears canvasRef before effect cleanups run.
  const saveNow = async (cheer: boolean, el: HTMLCanvasElement | null = canvasRef.current) => {
    const c = el;
    if (!c || (!strokes.current.length && !base) || (!dirty.current && !cheer)) return;
    dirty.current = false;
    const paint = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/png'));
    const { w, h } = size.current;
    const tw = 640;
    const th = Math.round((640 * h) / w);
    const k = tw / w;
    const t = Object.assign(document.createElement('canvas'), { width: tw, height: th });
    const tc = t.getContext('2d')!;
    tc.fillStyle = '#fff';
    tc.fillRect(0, 0, tw, th);
    tc.drawImage(c, 0, 0, tw, th);
    const r = outlineRect.current;
    if (page !== 'blank' && r) {
      const img = await svgToImage(artMarkup(page, r.w * k * 2, r.h * k * 2, true)).catch(() => null);
      if (img) {
        tc.globalCompositeOperation = 'multiply'; // same as the on-screen overlay: white vanishes, lines stay
        tc.drawImage(img, r.x * k, r.y * k, r.w * k, r.h * k);
        tc.globalCompositeOperation = 'source-over';
      }
    }
    const thumb = await new Promise<Blob | null>((res) => t.toBlob(res, 'image/jpeg', 0.82));
    if (!paint || !thumb) return;
    idRef.current ??= uid();
    await saveDrawing({ id: idRef.current, page, paint, thumb, at: Date.now() });
    if (cheer) {
      setParty((x) => x + 1);
      void say([{ sfx: 'fanfare' }, L('paint.saved')]);
    }
  };

  // Say what to do; auto-save when leaving (back, new page, session end).
  useEffect(() => {
    void say([page !== 'blank' && pageName(page), L('draw.go')]);
    const el = canvasRef.current;
    return () => {
      scribbleStop();
      stopSpeech();
      void saveNow(false, el);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toPt = (e: { clientX: number; clientY: number }): Pt => {
    const r = canvasRef.current!.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  };

  const down = (e: RPointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const s = surface();
    if (!s) return;
    try {
      canvasRef.current!.setPointerCapture(e.pointerId);
    } catch {
      /* some pointers can't be captured; drawing still works */
    }
    const { tool, color, sizeName, stamp } = cur.current;
    const stroke: Stroke = {
      tool,
      color: COLORS[color],
      size: BASE_SIZE[tool] * SIZE_MUL[sizeName],
      seed: Math.floor(Math.random() * 1e9),
      points: [toPt(e)],
      ...(tool === 'stamp' ? { stamp } : {}),
    };
    strokes.current.push(stroke);
    dirty.current = true;
    setCount(strokes.current.length);
    const painter = new StrokePainter(s, stroke);
    painter.add(stroke.points[0]);
    if (tool === 'stamp') {
      sfx('pop');
      return;
    }
    active.current.set(e.pointerId, { stroke, painter });
    scribbleStart();
  };

  const move = (e: RPointerEvent<HTMLCanvasElement>) => {
    const a = active.current.get(e.pointerId);
    if (!a) return;
    const native = e.nativeEvent;
    const evs = native.getCoalescedEvents?.() ?? [];
    for (const ev of evs.length ? evs : [native]) {
      const p = toPt(ev);
      const prev = a.stroke.points[a.stroke.points.length - 1];
      const d = Math.hypot((p[0] - prev[0]) * size.current.w, (p[1] - prev[1]) * size.current.h);
      if (d < 1.5) continue;
      a.stroke.points.push(p);
      a.painter.add(p);
      scribbleSpeed(d);
    }
  };

  const up = (e: RPointerEvent<HTMLCanvasElement>) => {
    if (active.current.delete(e.pointerId) && active.current.size === 0) scribbleStop();
  };

  const undo = () => {
    if (!strokes.current.length) return;
    strokes.current.pop();
    dirty.current = true;
    setCount(strokes.current.length);
    replay();
    sfx('pop');
  };

  const pickTool = (t: Tool) => {
    pick({ tool: t });
    if (PENS.includes(t)) lastPen.current = t;
    sfx('pop');
    void say(L(`tool.${t}`));
  };

  const pickColor = (c: ColorId) => {
    // Picking a color while on the eraser/stickers means "I want to draw".
    const t = cur.current.tool;
    pick({ color: c, ...(t === 'eraser' || t === 'stamp' || t === 'rainbow' || t === 'stars' ? { tool: lastPen.current } : {}) });
    sfx('pop');
    void say(L(`color.${c}`));
  };

  const usesColor = tool === 'pencil' || tool === 'crayon' || tool === 'brush';

  return (
    <div className="screen draw zone-colors">
      <TopBar back="#/zone/colors" onBack={onClose} onReplay={() => void say(L('draw.go'))}>
        <div className="paint-tools">
          <button className="tool-btn" onClick={undo} aria-label="Undo" disabled={!count}>↶</button>
          <button className="tool-btn" onClick={() => { sfx('pop'); onNew(); }} aria-label="New page">📄</button>
          <button className="tool-btn save" onClick={() => void saveNow(true)} aria-label="Save">⭐</button>
        </div>
      </TopBar>
      <div className="draw-body">
        <div className="draw-tools">
          {TOOLS.map((t) => (
            <button key={t} className={`draw-tool ${t === tool ? 'on' : ''}`} onClick={() => pickTool(t)} aria-label={t}>
              <span>{TOOL_ICON[t]}</span>
              {PENS.includes(t) && <i style={{ background: COLORS[color] }} />}
            </button>
          ))}
          <div className="draw-sizes">
            {SIZES.map((sz) => (
              <button key={sz} className={sz === sizeName ? 'on' : ''} onClick={() => { pick({ sizeName: sz }); sfx('pop'); void say(L(`size.${sz}`)); }} aria-label={sz}>
                <i style={{ width: `${SIZE_MUL[sz] * 16}px`, height: `${SIZE_MUL[sz] * 16}px`, background: usesColor ? COLORS[color] : '#263238' }} />
              </button>
            ))}
          </div>
        </div>
        <div className="draw-wrap" ref={wrapRef}>
          <canvas ref={canvasRef} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onLostPointerCapture={up} />
          {page !== 'blank' && (
            <div className="draw-outline" ref={outlineRef}>
              <ArtById art={page} lineArt className="thing-svg" />
            </div>
          )}
        </div>
        <div className="draw-side">
          {page !== 'blank' && (
            <div className="draw-ref" aria-label="The real one">
              <ArtById art={page} className="thing-svg" />
            </div>
          )}
          {tool === 'stamp' ? (
            <div className="stamp-grid">
              {PAINT_PAGES.map((p) => (
                <button key={p} className={`stamp ${p === stamp ? 'on' : ''}`} onClick={() => { pick({ stamp: p }); sfx('pop'); void say(stampName(p)); }}>
                  <ArtById art={p} className="thing-svg" />
                </button>
              ))}
            </div>
          ) : (
            <div className="palette draw-palette">
              {COLOR_IDS.map((c) => (
                <button key={c} className={`pot ${c === color && usesColor ? 'on' : ''}`} style={{ ['--pot' as string]: COLORS[c] }} onClick={() => pickColor(c)} aria-label={c} />
              ))}
            </div>
          )}
        </div>
      </div>
      {party > 0 && <Confetti key={party} />}
    </div>
  );
}
