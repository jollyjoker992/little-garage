import { useEffect, useState } from 'react';
import { go } from '../app/router';
import { ArtById } from '../art/ArtById';
import { VehicleArt } from '../art/vehicles';
import { CustomCar } from '../art/CustomCar';
import { normalizeSpec } from '../content/carParts';
import { BRAND_BY_ID, spoken } from '../content/brands';
import { COLORS } from '../content/colors';
import { L } from '../engine/i18n';
import { say, stopSpeech } from '../engine/speech';
import { sfx } from '../engine/sound';
import { useStore } from '../engine/store';
import { CHANGED, listDrawings } from '../engine/drawings';
import { TopBar } from '../ui/TopBar';

type Tab = 'stickers' | 'paintings' | 'drawings' | 'cars';

export function Garage() {
  const stickers = useStore((s) => s.stickers);
  const gallery = useStore((s) => s.gallery);
  const cars = useStore((s) => s.cars);
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
              void say([800, car.brand ? L('say.value', { value: spoken(BRAND_BY_ID[car.brand]) }) : L(`body.${car.body}`)]);
            }}>
              <div className="garage-car"><CustomCar spec={car} className="thing-svg" /></div>
            </button>
          );
        })}
        {((tab === 'stickers' && !stickers.length) || (tab === 'paintings' && !gallery.length) || (tab === 'drawings' && !drawings.length) || (tab === 'cars' && !cars.length)) && (
          <div className="empty">🚗💨</div>
        )}
      </div>
    </div>
  );
}
