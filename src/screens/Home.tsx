import { useEffect, useState } from 'react';
import { fullscreenSupported, isStandalone, toggleFullscreen, useFullscreen } from '../engine/fullscreen';
import { go } from '../app/router';
import { ZONES } from '../content/catalog';
import { L, t } from '../engine/i18n';
import { justWelcomed, say } from '../engine/speech';
import { sfx } from '../engine/sound';
import { useStore } from '../engine/store';
import { ThingView } from '../ui/ThingView';

export function Home() {
  const lang = useStore((s) => s.lang);
  useStore((s) => s.childName); // re-render when the name changes
  const title = t(lang, L('app.title')); // "King's Garage" when a name is set
  const full = useFullscreen();
  const [tip, setTip] = useState(false);
  const showFs = !isStandalone();
  const onFs = () => {
    sfx('pop');
    if (fullscreenSupported()) toggleFullscreen();
    else {
      setTip(true);
      setTimeout(() => setTip(false), 6000);
    }
  };
  useEffect(() => { if (!justWelcomed()) void say(L('app.welcome')); }, []);
  return (
    <div className="screen home">
      <header className="home-head">
        <h1 className={`title small ${title.length > 16 ? 'long' : ''}`}>{title}</h1>
        <div className="home-head-actions">
          {showFs && (
            <button className="hold-btn fs-btn" onClick={onFs} aria-label={full ? 'Exit full screen' : 'Full screen'}>
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#263238" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                {full
                  ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
                  : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}
              </svg>
            </button>
          )}
          <button className="garage-btn" onClick={() => { sfx('honk'); go('#/garage'); }} aria-label="My Garage"><ThingView thing={{ t: 'icon', icon: 'garage' }} /></button>
          <button className="hold-btn gear" onClick={() => { sfx('pop'); go('#/parent'); }} aria-label="Grown-ups settings">⚙️</button>
        </div>
      </header>
      {tip && (
        <div className="fs-tip" role="status" onClick={() => setTip(false)}>
          On iPhone, tap <b>Share</b> <span aria-hidden>⬆️</span> → <b>Add to Home Screen</b>, then open Little Garage from the home screen to play full screen.
        </div>
      )}
      <div className="zone-grid">
        {ZONES.map((z, i) => (
          <button key={z.id} className="zone-card pop-in" style={{ background: z.bg, animationDelay: `${i * 0.06}s` }} onClick={() => { sfx('pop'); go(`#/zone/${z.id}`); }}>
            <div className="zone-icon"><ThingView thing={z.icon} fit="center" /></div>
            <span className="zone-name">{t(lang, L(`zone.${z.id}`))}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
