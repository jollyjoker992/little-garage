// Build a Car: a big car on a garage lift; pick a category, then one big option row.
// GO = test drive (tap to honk), then the car parks in My Garage.
// Level 2–3: a customer orders a car ("a red sports car… with number 3!") — build it, then GO.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CustomCar, DriverIcon, PatternSwatch, WheelIcon } from '../../art/CustomCar';
import { LogoArt } from '../../art/logos';
import { BRANDS, BRAND_BY_ID, spoken } from '../../content/brands';
import {
  BODY_OPTIONS, DEFAULT_SPEC, DRIVERS, ENGINES, ENGINE_SFX, EXTRAS, HORNS, PAINTS, PATTERNS, RIMS, WHEELS,
  makeOrder, orderDone, orderProgress, randomSpec, type BuildSpec, type Order,
} from '../../content/carParts';
import { COLORS } from '../../content/colors';
import { LEVELS } from '../../content/levels';
import { levelFor, recordRound } from '../../engine/adaptive';
import { L, type Line } from '../../engine/i18n';
import { makeRng } from '../../engine/rng';
import type { SfxName } from '../../engine/sfxNames';
import { say, stopSpeech } from '../../engine/speech';
import { sfx, wait } from '../../engine/sound';
import { uid, update, useStore } from '../../engine/store';
import { Confetti } from '../../ui/Confetti';
import { Dots, TopBar } from '../../ui/TopBar';
import { plateName } from '../seq/generators';
import { Reward } from '../Reward';

type Cat = 'type' | 'paint' | 'wheels' | 'pattern' | 'number' | 'plate' | 'extras' | 'driver' | 'logo' | 'sound';
const CATS: { id: Cat; icon: string }[] = [
  { id: 'type', icon: '🚙' }, { id: 'paint', icon: '🎨' }, { id: 'wheels', icon: '🛞' }, { id: 'pattern', icon: '🔥' }, { id: 'number', icon: '🔢' },
  { id: 'plate', icon: '🔤' }, { id: 'extras', icon: '🧢' }, { id: 'driver', icon: '🐶' }, { id: 'logo', icon: '⭐' }, { id: 'sound', icon: '📯' },
];
const HORN_ICON: Partial<Record<SfxName, string>> = { honk: '📢', horn: '🎺', woop: '🚨', beepReverse: '🔔' };
const ENGINE_ICON = { hum: '🔈', vroom: '🚗', race: '🏎️' } as const;
const BACK = '#/zone/play';

function orderLines(o: Order): Line[] {
  const lines: Line[] = [L('order.make', { color: L(`color.${o.color}`), body: L(`body.${o.body}`) })];
  if (o.number !== undefined) lines.push(L('order.number', { n: L(`num.${o.number}`) }));
  if (o.wheels) lines.push(L('order.wheels'));
  if (o.pattern) lines.push(L('order.pattern', { pattern: L(`pattern.${o.pattern}`) }));
  return lines;
}

export function BuildCar() {
  const cfg = LEVELS.buildCar[levelFor('buildCar')];
  const rng = useRef(makeRng()).current;
  const childName = useStore((s) => s.childName);
  const [spec, setSpec] = useState<BuildSpec>(DEFAULT_SPEC);
  const [cat, setCat] = useState<Cat>('type');
  const [order, setOrder] = useState<Order | null>(() => (cfg.orders ? makeOrder(rng, cfg.traits) : null));
  const [ordersDone, setOrdersDone] = useState(0);
  const [tries, setTries] = useState(0);
  const [driving, setDriving] = useState(false);
  const [hop, setHop] = useState(0);
  const [bump, setBump] = useState(0);
  const [party, setParty] = useState(0);
  const [done, setDone] = useState(false);
  const matched = useRef(false);
  const alive = useRef(true);
  const rounds = cfg.rounds ?? 3;

  const myPlate = plateName(childName);
  const plates = [...new Set([myPlate, 'ZOOM', 'BEEP', 'VROOM', spec.brand ? BRAND_BY_ID[spec.brand].name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6) : '', 'GO'].filter((x) => x.length >= 2))];

  useEffect(() => {
    alive.current = true;
    void say([L('game.buildCar.intro'), ...(order ? orderLines(order) : [])]);
    return () => { alive.current = false; stopSpeech(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cheer once when the car first matches the order.
  useEffect(() => {
    if (!order) return;
    const ok = orderDone(spec, order);
    if (ok && !matched.current) { sfx('ding'); void say(L('order.done')); }
    matched.current = ok;
  }, [spec, order]);

  const set = <K extends keyof BuildSpec>(k: K, v: BuildSpec[K], line?: Line | null, sound: SfxName = 'pop') => {
    setSpec((s) => ({ ...s, [k]: v }));
    setBump((b) => b + 1);
    sfx(sound);
    if (line) void say(line);
  };
  const toggleExtra = (e: (typeof EXTRAS)[number]) => {
    const on = spec.extras.includes(e);
    set('extras', on ? spec.extras.filter((x) => x !== e) : [...spec.extras, e], on ? null : L(`extra.${e}`));
  };
  const surprise = () => {
    setSpec(randomSpec(rng, BRANDS.map((b) => b.id), plates));
    setBump((b) => b + 1);
    sfx('splash');
    void say(L('build.surprise'));
  };

  const go = async () => {
    if (driving) return;
    if (order && !orderDone(spec, order)) {
      sfx('wobble');
      setTries((t) => t + 1);
      void say([L('order.notYet'), ...orderLines(order)]);
      return;
    }
    setDriving(true);
    sfx(ENGINE_SFX[spec.engine]);
    void say(L('build.drive'));
    await wait(3600);
    if (!alive.current) return;
    update((s) => ({ cars: [{ ...spec, id: uid(), at: Date.now() }, ...s.cars] }));
    setDriving(false);
    setParty((x) => x + 1);
    sfx('fanfare');
    if (!order) { void say(L('build.parked')); return; }
    const change = recordRound('buildCar', tries === 0);
    const n = ordersDone + 1;
    setOrdersDone(n);
    setTries(0);
    if (n >= rounds) {
      await say([L('build.parked'), L('cheer'), change === 'up' && L('levelUp')]);
      if (alive.current) setDone(true);
      return;
    }
    const next = makeOrder(rng, cfg.traits);
    matched.current = false;
    setOrder(next);
    void say([L('build.parked'), L('cheer'), ...orderLines(next)]);
  };

  if (done) return <Reward back={BACK} onAgain={() => { setDone(false); setOrdersDone(0); const o = makeOrder(rng, cfg.traits); setOrder(o); void say(orderLines(o)); }} />;

  const opt = (key: string, value: string | number, on: boolean, onTap: () => void, child: ReactNode, cls = '') => (
    <button key={`${key}-${value}`} data-trait={key} data-value={String(value)} className={`bopt ${cls} ${on ? 'on' : ''}`} onClick={onTap}>{child}</button>
  );
  const pot = (key: 'color' | 'color2', c: (typeof PAINTS)[number]) =>
    opt(key, c, spec[key] === c, () => set(key, c, L(`color.${c}`), 'splash'), <span className="bpot" style={{ background: COLORS[c] }} />, 'round');

  const options: Record<Cat, ReactNode> = {
    type: BODY_OPTIONS.map((b) => opt('body', b, spec.body === b, () => set('body', b, L(`body.${b}`)), <CustomCar spec={{ ...spec, body: b }} className="thing-svg" />, 'car')),
    paint: PAINTS.map((c) => pot('color', c)),
    wheels: [
      ...WHEELS.map((w) => opt('wheels', w, spec.wheels === w, () => set('wheels', w, L(`wheels.${w}`)), <CustomCar spec={{ ...spec, wheels: w }} className="thing-svg" />, 'car')),
      <i key="d1" className="bdiv" />,
      ...RIMS.map((r) => opt('rim', r, spec.rim === r, () => set('rim', r), <WheelIcon rim={r} color={COLORS[spec.color2]} />, 'round')),
    ],
    pattern: [
      ...PATTERNS.map((pt) => opt('pattern', pt, spec.pattern === pt, () => set('pattern', pt, L(`pattern.${pt}`)), <CustomCar spec={{ ...spec, pattern: pt }} className="thing-svg" />, 'car')),
      <i key="d2" className="bdiv" />,
      ...PAINTS.map((c) => pot('color2', c)),
    ],
    number: Array.from({ length: 10 }, (_, n) => opt('number', n, spec.number === n, () => set('number', n, n ? L(`num.${n}`) : L('number.none')), <span className="bnum">{n || '–'}</span>, 'round')),
    plate: ['', ...plates].map((pl) => opt('plate', pl || 'none', spec.plate === pl, () => set('plate', pl, pl ? L('plate.says', { word: pl === myPlate && childName ? childName : pl }) : L('plate.none')), <span className="bplate">{pl || '–'}</span>, 'wide')),
    extras: EXTRAS.map((e) => opt('extras', e, spec.extras.includes(e), () => toggleExtra(e), <CustomCar spec={{ ...spec, extras: [e], pattern: spec.pattern }} className="thing-svg" />, 'car')),
    driver: DRIVERS.map((d) => opt('driver', d, spec.driver === d, () => set('driver', d, L(`driver.${d}`)), <DriverIcon kind={d} />, 'round')),
    logo: [
      opt('brand', 'none', spec.brand === null, () => set('brand', null, L('logo.none')), <span className="bnum">–</span>, 'round'),
      ...BRANDS.map((b) => opt('brand', b.id, spec.brand === b.id, () => set('brand', b.id, L('say.value', { value: spoken(b) })), <LogoArt brand={b.id} />, 'round')),
    ],
    sound: [
      ...HORNS.map((h) => opt('horn', h, spec.horn === h, () => set('horn', h, null, h), <span className="bemoji">{HORN_ICON[h]}</span>, 'round')),
      <i key="d3" className="bdiv" />,
      ...ENGINES.map((en) => opt('engine', en, spec.engine === en, () => set('engine', en, L(`engine.${en}`), ENGINE_SFX[en]), <span className="bemoji">{ENGINE_ICON[en]}</span>, 'round')),
    ],
  };

  const prog = order ? orderProgress(spec, order) : null;
  return (
    <div className="screen build2 zone-play">
      <TopBar back={BACK} onReplay={() => void say(order ? orderLines(order) : L('game.buildCar.intro'))}>
        {order && <Dots total={rounds} done={ordersDone} />}
      </TopBar>
      <div className={`bld ${order ? 'has-order' : ''}`}>
        {order && prog && (
          <div className="bld-order" data-order={JSON.stringify(order)} onClick={() => void say(orderLines(order))}>
            <span className="bo-icon">📋</span>
            <span className={`bo-item ${prog.color ? 'ok' : ''}`}><span className="bpot" style={{ background: COLORS[order.color] }} /></span>
            <span className={`bo-item car ${prog.body ? 'ok' : ''}`}><CustomCar spec={{ ...DEFAULT_SPEC, body: order.body, color: order.color, brand: null }} className="thing-svg" /></span>
            {order.number !== undefined && <span className={`bo-item ${prog.number ? 'ok' : ''}`}><span className="bnum">{order.number}</span></span>}
            {order.wheels && <span className={`bo-item ${prog.wheels ? 'ok' : ''}`}><span className="bemoji">🛞</span></span>}
            {order.pattern && <span className={`bo-item ${prog.pattern ? 'ok' : ''}`}><PatternSwatch pattern={order.pattern} /></span>}
          </div>
        )}
        <div className="bld-stage">
          <div className="bld-car pop-in" key={bump} onClick={() => sfx(spec.horn)}>
            <CustomCar spec={spec} className="thing-svg" />
          </div>
          <div className="bld-lift" />
          <button className="big-btn bld-surprise" onClick={surprise} aria-label="Surprise">🎲</button>
          <button className="big-btn go bld-go" onClick={() => void go()} aria-label="Go">GO!</button>
        </div>
        <div className="bld-opts" key={cat}>{options[cat]}</div>
        <div className="bld-cats">
          {CATS.map((c) => (
            <button key={c.id} data-cat={c.id} className={`bcat ${cat === c.id ? 'on' : ''}`} onClick={() => { setCat(c.id); sfx('pop'); void say(L(`cat.${c.id}`)); }} aria-label={c.id}>{c.icon}</button>
          ))}
        </div>
      </div>
      {driving && (
        <div className="drive-scene" onPointerDown={() => { sfx(spec.horn); setHop((h) => h + 1); }}>
          <div className="ds-sun" />
          <div className="ds-road"><i /></div>
          <div className="ds-car"><div className={`ds-hop h${hop % 2}`}><CustomCar spec={spec} className="thing-svg" /></div></div>
        </div>
      )}
      {party > 0 && <Confetti key={party} />}
    </div>
  );
}
