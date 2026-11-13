import { useEffect, useState } from 'react';
import { go } from '../app/router';
import { ArtById } from '../art/ArtById';
import { VehicleArt } from '../art/vehicles';
import { CustomCar } from '../art/CustomCar';
import { normalizeSpec } from '../content/carParts';
import { brandLine } from '../engine/brandSay';
import { COLORS } from '../content/colors';
import { L } from '../engine/i18n';
import { say, stopSpeech } from '../engine/speech';
import { sfx } from '../engine/sound';
import { useStore } from '../engine/store';
import { CHANGED, listDrawings } from '../engine/drawings';
import { TopBar } from '../ui/TopBar';
import { ThingView } from '../ui/ThingView';
import { UNITS, WORDS } from '../content/english';
import { MASTERED, hasBadge, wordLine } from '../engine/vocab';
import { LevelStars } from '../ui/TopBar';

type Tab = 'stickers' | 'paintings' | 'drawings' | 'cars' | 'words';

export function Garage() {
  const stickers = useStore((s) => s.stickers);
  const gallery = useStore((s) => s.gallery);
  const cars = useStore((s) => s.cars);
  const progress = useStore((s) => s.words);
  const road = useStore((s) => s.engRoad);
  // English Street: a badge per finished town, and a card for every word he has met (its stars = the level he knows it at).
  const badges = UNITS.filter((u) => hasBadge(road, u.id));
  const cards = WORDS.filter((w) => (progress[w.id]?.box ?? 0) >= 1);
  const [tab, setTab] = useState<Tab>('stickers');
  const [drawings, setDrawings] = useState<{ id: string; url: string }[]>([]);
  useEffect(() => {
    let alive = true;
    let urls: string[] = [];
    const load = () => void listDrawings().then((ds) => {
      if (!alive) return;
      urls.forEach((u) => URL.revokeObjectURL(u));
      const items = ds.map((d) => ({ id: d.id, url: URL.createObjectURL(d.thumb) }));
      urls = items.map((i) => i.url);
      setDrawings(items);
    });
    load();
    window.addEventListener(CHANGED, load);
    return () => { alive = false; window.removeEventListener(CHANGED, load); urls.forEach((u) => URL.revokeObjectURL(u)); };
  }, []);
  useEffect(() => { void say(L('garage.intro')); return () => stopSpeech(); }, []);

  return (
    <div className="screen garage zone-garage">
      <TopBar>
        <div className="tabs">
          <button className={tab === 'stickers' ? 'on' : ''} onClick={() => setTab('stickers')}>⭐ {stickers.length}</button>
          <button className={tab === 'paintings' ? 'on' : ''} onClick={() => setTab('paintings')}>🎨 {gallery.length}</button>
          <button className={tab === 'drawings' ? 'on' : ''} onClick={() => setTab('drawings')}>✏️ {drawings.length}</button>
          <button className={tab === 'cars' ? 'on' : ''} onClick={() => setTab('cars')}>🚗 {cars.length}</button>
          <button className={tab === 'words' ? 'on' : ''} onClick={() => setTab('words')}>📚 {cards.length}</button>
        </div>
      </TopBar>
      <div className="collection">
        {tab === 'stickers' && stickers.slice().reverse().map((s, i) => (
          <button key={i} className="col-item pop-in" onClick={() => { sfx('pop'); void say(L('say.vehicle', { vehicle: L(`v.${s.v}`) })); }}>
            <VehicleArt v={s.v} fills={{ body: COLORS[s.color], bed: COLORS[s.color] }} load={s.v === 'dumpTruck' ? 3 : 0} />
          </button>
        ))}
        {tab === 'paintings' && gallery.map((p) => (
          <button key={p.id} className="col-item pop-in" onClick={() => go(`#/game/paint/${p.id}`)}>
            <ArtById art={p.art} fills={p.fills} className="thing-svg" />
          </button>
        ))}
        {tab === 'drawings' && drawings.map((d) => (
          <button key={d.id} className="col-item drawing-item pop-in" onClick={() => go(`#/game/drawing/${d.id}`)}>
            <img src={d.url} alt="" />
          </button>
        ))}
        {tab === 'cars' && cars.map((c) => {
          const car = normalizeSpec(c);
          return (
            <button key={c.id} className="col-item pop-in" onClick={(e) => {
              sfx(car.horn);
              const el = e.currentTarget.firstElementChild as HTMLElement | null;
              el?.classList.remove('zoom'); void el?.getBoundingClientRect(); el?.classList.add('zoom');
              void say([800, car.brand ? brandLine(car.brand) : L(`body.${car.body}`)]);
            }}>
              <div className="garage-car"><CustomCar spec={car} className="thing-svg" /></div>
            </button>
          );
        })}
        {tab === 'words' && badges.map((u) => (
          <button key={u.id} className="col-item word-item badge-item pop-in" onClick={() => { sfx('ding'); void say(L(`unit.${u.id}`)); }}>
            <div className="wi-art badge-mini">
              <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#ffecb3" stroke="#f9a825" strokeWidth="7" /></svg>
              <div className="badge-mini-icon"><ThingView thing={u.icon} fit="center" /></div>
            </div>
          </button>
        ))}
        {tab === 'words' && cards.map((w) => (
          <button key={w.id} className={`col-item word-item pop-in ${(progress[w.id]?.box ?? 0) >= MASTERED ? 'gold' : ''}`} onClick={() => { sfx('pop'); void say([wordLine(w), w.sfx && { sfx: w.sfx }]); }}>
            <div className="wi-art"><ThingView thing={w.thing} fit="center" /></div>
            <span className="word-stars"><LevelStars level={progress[w.id]?.box ?? 0} /></span>
          </button>
        ))}
        {((tab === 'words' && !cards.length) || (tab === 'stickers' && !stickers.length) || (tab === 'paintings' && !gallery.length) || (tab === 'drawings' && !drawings.length) || (tab === 'cars' && !cars.length)) && (
          <div className="empty">🚗💨</div>
        )}
      </div>
    </div>
  );
}
