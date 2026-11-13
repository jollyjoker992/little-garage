import { back } from '../app/router';
import { IconBack } from '../ui/TopBar';
import { GAMES, ZONES } from '../content/catalog';
import type { Level } from '../content/levels';
import { useEffect, useState } from 'react';
import { L, t } from '../engine/i18n';
import { audioState, sfx, unlockAudio } from '../engine/sound';
import { onSpeech, speechSupported, voiceInfo, type SpeechEvent } from '../engine/speech';
import { say } from '../engine/speech';
import { resetProgress, update, useStore } from '../engine/store';
import { clearDrawings } from '../engine/drawings';
import { isPlayable } from '../games/registry';
import { ParentEnglish } from './ParentEnglish';

function SoundCheck({ lang }: { lang: 'en' | 'vi' }) {
  const [engine, setEngine] = useState(audioState());
  const [voice, setVoice] = useState('not tested yet');
  const [info, setInfo] = useState(voiceInfo());
  useEffect(() => {
    const off = onSpeech((e: SpeechEvent) => {
      setVoice(
        e.type === 'start' ? `speaking with ${e.voice}…`
        : e.type === 'end' ? 'finished ✓'
        : e.type === 'error' ? `error: ${e.error}`
        : e.type === 'timeout' ? 'no sound reported (timed out)'
        : 'this browser has no voice support',
      );
      setInfo(voiceInfo());
    });
    return () => { off(); };
  }, []);
  return (
    <section>
      <h3>Sound check</h3>
      <p className="muted">
        No sound on iPhone/iPad? Turn the volume up and the silent switch off (no orange), then tap the tests below.
        Vietnamese voice: Settings → Accessibility → Spoken Content → Voices → Vietnamese → download "Linh".
      </p>
      <div className="prow">
        <button className="pbtn" onClick={() => { unlockAudio(); sfx('honk'); setTimeout(() => setEngine(audioState()), 300); }}>📯 Test sounds</button>
        <span>Sound effects: <b>{engine}</b></span>
      </div>
      <div className="prow">
        <button className="pbtn" onClick={() => { unlockAudio(); setVoice('starting…'); void say(L('cheer')); setInfo(voiceInfo()); }}>🗣️ Test voice</button>
        <span>Voice: <b>{voice}</b></span>
      </div>
      <p className="muted">
        {speechSupported() ? `${info.total} voices · Vietnamese: ${info.vi.join(', ') || 'none installed'} · English: ${info.en}` : 'Speech is not supported in this browser.'}
        {lang === 'vi' && speechSupported() && !info.vi.length && ' — install the Vietnamese voice, or switch the language to English.'}
      </p>
    </section>
  );
}

export function Parent() {
  const s = useStore((x) => x);
  const games = GAMES.filter((g) => g.status === 'ready' && isPlayable(g.id));
  return (
    <div className="screen parent">
      <div className="parent-head">
        <button className="round-btn" onClick={() => back('#/')} aria-label="Back"><IconBack /></button>
        <h2>Grown-ups</h2>
        <button className="pbtn" onClick={() => back('#/')}>Done</button>
      </div>
      <section>
        <h3>Voice</h3>
        <div className="prow">
          <label>Language</label>
          <div className="seg">
            {(['en', 'vi'] as const).map((l) => (
              <button key={l} className={s.lang === l ? 'on' : ''} onClick={() => { update(() => ({ lang: l })); void say(L('app.welcome')); }}>{l === 'en' ? 'English' : 'Tiếng Việt'}</button>
            ))}
          </div>
        </div>
        <div className="prow">
          <label>Speed ({s.rate.toFixed(1)})</label>
          <input type="range" min="0.6" max="1.2" step="0.1" value={s.rate} onChange={(e) => update(() => ({ rate: Number(e.target.value) }))} onPointerUp={() => void say(L('cheer'))} />
        </div>
      </section>
      <section>
        <h3>Child's name</h3>
        <div className="prow">
          <label htmlFor="child-name">The voice says it (cheers, stickers, hello and bye), the home screen shows it, and it goes on license plates. A short name or nickname works best.</label>
          <input id="child-name" className="ptext" type="text" maxLength={20} placeholder="e.g. Bảo" value={s.childName} onChange={(e) => update(() => ({ childName: e.target.value }))} />
        </div>
      </section>
      <SoundCheck lang={s.lang} />
      <ParentEnglish />
      <section>
        <h3>Session limit</h3>
        <div className="seg">
          {[0, 10, 15, 20, 30].map((m) => (
            <button key={m} className={s.sessionLimit === m ? 'on' : ''} onClick={() => update(() => ({ sessionLimit: m }))}>{m ? `${m} min` : 'Off'}</button>
          ))}
        </div>
      </section>
      <section>
        <h3>Games & levels</h3>
        <p className="muted">"Auto" moves up after 4 of 5 first-try answers and down after 3 misses in a row. Untick a game to hide it.</p>
        {ZONES.filter((z) => z.id !== 'english').map((z) => (
          <div key={z.id} className="pzone">
            <h4>{t('en', L(`zone.${z.id}`))}</h4>
            {games.filter((g) => g.zones[0] === z.id).map((g) => (
              <div key={g.id} className="prow game-row">
                <label className="check">
                  <input type="checkbox" checked={!s.hidden.includes(g.id)} onChange={(e) => update((st) => ({ hidden: e.target.checked ? st.hidden.filter((x) => x !== g.id) : [...st.hidden, g.id] }))} />
                  {t('en', L(`game.${g.id}`))}
                </label>
                {g.id !== 'stickers' && (
                  <div className="seg small">
                    <button className={!s.pinned[g.id] ? 'on' : ''} onClick={() => update((st) => { const p = { ...st.pinned }; delete p[g.id]; return { pinned: p }; })}>Auto {!s.pinned[g.id] ? `(${s.levels[g.id] ?? 1})` : ''}</button>
                    {([1, 2, 3] as Level[]).map((lv) => (
                      <button key={lv} className={s.pinned[g.id] === lv ? 'on' : ''} onClick={() => update((st) => ({ pinned: { ...st.pinned, [g.id]: lv } }))}>{lv}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </section>
      <section>
        <h3>Progress</h3>
        <p className="muted">{s.stickers.length} stickers · {s.gallery.length} paintings · {s.cars.length} built cars. Saved on this device only.</p>
        <button className="pbtn danger" onClick={() => { if (window.confirm('Reset all progress, stickers, paintings and drawings?')) { resetProgress(); void clearDrawings(); } }}>Reset progress</button>
      </section>
      <section className="ptrademarks">
        <h3>Car brands</h3>
        <p className="muted">Car brand names and logos are trademarks of their owners. Little Garage is a free, non-commercial learning game and is not affiliated with or endorsed by any car maker. The badges are simple kid-style drawings so a child can name the cars they see on the street.</p>
      </section>
      <p className="muted small">Little Garage · free, no ads, no tracking · MIT licensed (brand names and logos excluded)</p>
    </div>
  );
}
