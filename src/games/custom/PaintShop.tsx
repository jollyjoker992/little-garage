import { useEffect, useMemo, useState, type PointerEvent } from 'react';
import { ArtById } from '../../art/ArtById';
import { defaultsFor, type Fills } from '../../art/defaults';
import { BRANDS, BRAND_BY_ID, spoken, type BrandId } from '../../content/brands';
import { COLORS, COLOR_IDS, colorIdOf, MIXES, type ColorId } from '../../content/colors';
import { LEVELS } from '../../content/levels';
import { CAR_BODIES, VEHICLE_IDS } from '../../content/vehicles';
import { levelFor } from '../../engine/adaptive';
import { L } from '../../engine/i18n';
import { say, stopSpeech } from '../../engine/speech';
import { sfx } from '../../engine/sound';
import { getState, uid, update } from '../../engine/store';
import { go } from '../../app/router';
import { Confetti } from '../../ui/Confetti';
import { TopBar } from '../../ui/TopBar';

/** Every page you can paint. New vehicles / brands appear here automatically. */
export const PAINT_PAGES: string[] = [
  ...CAR_BODIES.map((b) => `c:${b}`),
  ...VEHICLE_IDS.filter((v) => v !== 'car').map((v) => `v:${v}`),
  ...BRANDS.map((b) => `l:${b.id}`),
];

const BASIC_POTS: ColorId[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'black'];

/** Spoken name of a page: the brand name for logos (e.g. "Toyota!"), nothing for other pages. */
export const pageName = (art: string) => {
  const [kind, id] = art.split(':');
  return kind === 'l' ? L('say.value', { value: spoken(BRAND_BY_ID[id as BrandId]) }) : null;
};

/** Logo pages always show the small finished logo as a guide; other pages from Level 2. */
const isLogo = (art: string) => art.startsWith('l:');

const blank = (art: string): Fills => Object.fromEntries(Object.keys(defaultsFor(art)).map((r) => [r, COLORS.white]));

export function PaintShop({ openId }: { openId?: string }) {
  const cfg = LEVELS.paint[levelFor('paint')];
  const existing = openId ? getState().gallery.find((p) => p.id === openId) : undefined;
  const [art, setArt] = useState<string | null>(existing?.art ?? null);
  const [paintingId, setPaintingId] = useState<string | undefined>(existing?.id);
  const [fills, setFills] = useState<Fills>(existing?.fills ?? {});
  const [history, setHistory] = useState<Fills[]>([]);
  const [color, setColor] = useState<ColorId>('red');
  const [party, setParty] = useState(0);
  const [matched, setMatched] = useState(false);

  useEffect(() => {
    if (!openId) void say(L('game.paint.intro'));
    else if (existing) void say(pageName(existing.art));
    return () => stopSpeech();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showRef = cfg.reference || (art ? isLogo(art) : false);
  // A logo can only be matched if every one of its colors has a pot.
  const pots = cfg.pots === 'basic' && !(art && isLogo(art)) ? BASIC_POTS : COLOR_IDS;
  const defaults = useMemo(() => (art ? defaultsFor(art) : {}), [art]);

  const open = (a: string) => {
    sfx('pop');
    setArt(a);
    setPaintingId(undefined);
    setFills(blank(a));
    setHistory([]);
    setMatched(false);
    void say([pageName(a), (cfg.reference || isLogo(a)) && L('paint.match')]);
  };

  const pickColor = (c: ColorId) => {
    setColor(c);
    sfx('pop');
    void say(L('say.value', { value: L(`color.${c}`) }));
  };

  const paint = (e: PointerEvent) => {
    if ((e.target as Element).closest('.reference')) return; // the small guide is not paintable
    const el = (e.target as Element).closest('[data-region]');
    const region = el?.getAttribute('data-region');
    if (!region || !(region in defaults)) return;
    const hex = COLORS[color];
    if (fills[region] === hex) return;
    const nextFills = { ...fills, [region]: hex };
    setHistory((h) => [...h.slice(-30), fills]);
    setFills(nextFills);
    sfx('splash');
    const isMatch = showRef && Object.keys(defaults).every((r) => nextFills[r]?.toLowerCase() === defaults[r].toLowerCase());
    if (isMatch && !matched) {
      setMatched(true);
      setParty((x) => x + 1);
      void say([{ sfx: 'fanfare' }, L('paint.matched')]);
    } else {
      void say(L(`color.${colorIdOf(hex) ?? color}`));
    }
  };

  const undo = () => {
    if (!history.length) return;
    sfx('pop');
    setFills(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
  };

  const save = () => {
    if (!art) return;
    const id = paintingId ?? uid();
    setPaintingId(id);
    update((s) => ({ gallery: [{ id, art, fills, at: Date.now() }, ...s.gallery.filter((p) => p.id !== id)] }));
    setParty((x) => x + 1);
    void say([{ sfx: 'fanfare' }, L('paint.saved')]);
  };

  const mix = (m: (typeof MIXES)[number]) => {
    setColor(m.c);
    sfx('splash');
    void say(L('paint.mix', { a: L(`color.${m.a}`), b: L(`color.${m.b}`), c: L(`color.${m.c}`) }));
  };

  if (!art) {
    return (
      <div className="screen zone-colors">
        <TopBar back="#/zone/colors" onReplay={() => void say(L('paint.pick'))} />
        <div className="page-grid">
          {PAINT_PAGES.map((p) => (
            <button key={p} className="page-card pop-in" onClick={() => open(p)}>
              <ArtById art={p} className="thing-svg" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="screen paint zone-colors">
      <TopBar
        back="#/zone/colors"
        onBack={openId ? undefined : () => { stopSpeech(); setArt(null); }}
        onReplay={() => void say(showRef ? L('paint.match') : L('paint.pick'))}
      >
        <div className="paint-tools">
          <button className="tool-btn" onClick={undo} aria-label="Undo" disabled={!history.length}>↶</button>
          <button className="tool-btn" onClick={() => { stopSpeech(); setArt(null); go('#/game/paint'); }} aria-label="New picture">🖼️</button>
          <button className="tool-btn save" onClick={save} aria-label="Save">⭐</button>
        </div>
      </TopBar>
      <div className="paint-body">
        <div className="canvas" onPointerDown={paint}>
          <ArtById art={art} fills={fills} className="paint-svg" />
          {showRef && (
            <div className="reference" aria-label="The real one">
              <ArtById art={art} className="thing-svg" />
            </div>
          )}
        </div>
        <div className="palette">
          {pots.map((c) => (
            <button key={c} className={`pot ${c === color ? 'on' : ''}`} style={{ ['--pot' as string]: COLORS[c] }} onClick={() => pickColor(c)} aria-label={c} />
          ))}
          {cfg.mixing && MIXES.map((m) => (
            <button key={m.c} className="mix" onClick={() => mix(m)} aria-label={`${m.a} + ${m.b}`}>
              <span style={{ background: COLORS[m.a] }} />+<span style={{ background: COLORS[m.b] }} />=<span style={{ background: COLORS[m.c] }} />
            </button>
          ))}
        </div>
      </div>
      {party > 0 && <Confetti key={party} />}
    </div>
  );
}
