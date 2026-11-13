// Grown-ups settings. Ordered by how often a grown-up needs them: basics → English Street → games →
// sound check → saved progress → about. Each section: a heading, at most one line of help; longer help
// folds out. All text follows the chosen language (content/i18n/ui.ts).
import { useEffect, useState } from 'react';
import { back } from '../app/router';
import { GAMES, ZONES } from '../content/catalog';
import type { Level } from '../content/levels';
import { clearDrawings } from '../engine/drawings';
import { L, t } from '../engine/i18n';
import { audioState, sfx, unlockAudio } from '../engine/sound';
import { onSpeech, say, speechSupported, voiceInfo, type SpeechEvent } from '../engine/speech';
import { resetEnglish, resetProgress, update, useStore } from '../engine/store';
import { isPlayable } from '../games/registry';
import { IconBack } from '../ui/TopBar';
import { useUi } from '../ui/useUi';
import { ParentEnglish } from './ParentEnglish';
import { Row, Seg } from './ParentParts';

const SOURCE_URL = 'https://github.com/jollyjoker992/little-garage';

type VoiceStatus = { k: 'p.voice.notTested' | 'p.voice.starting' | 'p.voice.speaking' | 'p.voice.finished' | 'p.voice.error' | 'p.voice.timeout' | 'p.voice.unsupported'; voice?: string; error?: string };

function SoundCheck({ lang }: { lang: 'en' | 'vi' }) {
  const u = useUi();
  const [engine, setEngine] = useState(audioState());
  const [voice, setVoice] = useState<VoiceStatus>({ k: 'p.voice.notTested' });
  const [info, setInfo] = useState(voiceInfo());
  useEffect(() => {
    const off = onSpeech((e: SpeechEvent) => {
      setVoice(
        e.type === 'start' ? { k: 'p.voice.speaking', voice: e.voice }
        : e.type === 'end' ? { k: 'p.voice.finished' }
        : e.type === 'error' ? { k: 'p.voice.error', error: e.error }
        : e.type === 'timeout' ? { k: 'p.voice.timeout' }
        : { k: 'p.voice.unsupported' },
      );
      setInfo(voiceInfo());
    });
    return () => { off(); };
  }, []);
  const engineKey = engine === 'running' ? 'p.engine.running' : engine === 'suspended' ? 'p.engine.suspended' : engine === 'closed' ? 'p.engine.closed' : 'p.engine.none';
  const noVi = lang === 'vi' && speechSupported() && !info.vi.length;
  return (
    <section>
      <h3>{u('p.sound')}</h3>
      <div className="ptests">
        <button className="pbtn" onClick={() => { unlockAudio(); sfx('honk'); setTimeout(() => setEngine(audioState()), 300); }}>{u('p.testSounds')}</button>
        <span className="pstatus">{u(engineKey)}</span>
        <button className="pbtn" onClick={() => { unlockAudio(); setVoice({ k: 'p.voice.starting' }); void say(L('cheer')); setInfo(voiceInfo()); }}>{u('p.testVoice')}</button>
        <span className="pstatus">{u(voice.k, { voice: voice.voice ?? '', error: voice.error ?? '' })}</span>
      </div>
      {noVi && <p className="pwarn">{u('p.voices.installVi')}</p>}
      <details className="pmore">
        <summary>{u('p.noSound')}</summary>
        <p>{u('p.noSoundHelp')}</p>
        <p className="muted">{speechSupported() ? u('p.voices', { total: info.total, vi: info.vi.join(', ') || u('p.voices.none'), en: info.en }) : u('p.voices.noSpeech')}</p>
      </details>
    </section>
  );
}

export function Parent() {
  const s = useStore((x) => x);
  const u = useUi();
  const games = GAMES.filter((g) => g.status === 'ready' && isPlayable(g.id));
  const words = Object.values(s.words).filter((w) => w.box > 0).length;
  return (
    <div className="screen parent">
      <div className="parent-head">
        <button className="round-btn" onClick={() => back('#/')} aria-label={u('p.back')}><IconBack /></button>
        <h2>{u('p.title')}</h2>
        <button className="pbtn" onClick={() => back('#/')}>{u('p.done')}</button>
      </div>

      <section>
        <h3>{u('p.basics')}</h3>
        <Row label={u('p.language')}>
          <Seg value={s.lang} options={[['en', 'English'], ['vi', 'Tiếng Việt']]} onPick={(l) => { update(() => ({ lang: l })); void say(L('app.welcome')); }} />
        </Row>
        <Row label={u('p.speed')} hint={`${s.rate.toFixed(1)}×`}>
          <input type="range" min="0.6" max="1.2" step="0.1" value={s.rate} onChange={(e) => update(() => ({ rate: Number(e.target.value) }))} onPointerUp={() => void say(L('cheer'))} />
        </Row>
        <Row label={u('p.name')} hint={u('p.nameHint')} htmlFor="child-name">
          <input id="child-name" className="ptext" type="text" maxLength={20} placeholder={u('p.namePlaceholder')} value={s.childName} onChange={(e) => update(() => ({ childName: e.target.value }))} />
        </Row>
        <Row label={u('p.limit')} hint={u('p.limitHint')}>
          <Seg value={s.sessionLimit} options={[0, 10, 15, 20, 30].map((m) => [m, m ? u('p.minutes', { n: m }) : u('p.off')])} onPick={(m) => update(() => ({ sessionLimit: m }))} />
        </Row>
      </section>

      <ParentEnglish />

      <section>
        <h3>{u('p.games')}</h3>
        <p className="phint">{u('p.gamesHint')}</p>
        {ZONES.filter((z) => z.id !== 'english').map((z) => {
          const zg = games.filter((g) => g.zones[0] === z.id);
          const shown = zg.filter((g) => !s.hidden.includes(g.id)).length;
          return (
            <details key={z.id} className="pfold">
              <summary>
                <span>{t(s.lang, L(`zone.${z.id}`))}</span>
                <small>{u('p.gameCount', { n: shown === zg.length ? zg.length : `${shown}/${zg.length}` })}</small>
              </summary>
              {zg.map((g) => (
                <div key={g.id} className="prow game-row">
                  <label className="check">
                    <input type="checkbox" checked={!s.hidden.includes(g.id)} onChange={(e) => update((st) => ({ hidden: e.target.checked ? st.hidden.filter((x) => x !== g.id) : [...st.hidden, g.id] }))} />
                    {t(s.lang, L(`game.${g.id}`))}
                  </label>
                  {g.id !== 'stickers' && (
                    <div className="seg small">
                      <button className={!s.pinned[g.id] ? 'on' : ''} onClick={() => update((st) => { const p = { ...st.pinned }; delete p[g.id]; return { pinned: p }; })}>{u('p.auto')} {!s.pinned[g.id] ? `(${s.levels[g.id] ?? 1})` : ''}</button>
                      {([1, 2, 3] as Level[]).map((lv) => (
                        <button key={lv} className={s.pinned[g.id] === lv ? 'on' : ''} onClick={() => update((st) => ({ pinned: { ...st.pinned, [g.id]: lv } }))}>{lv}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </details>
          );
        })}
      </section>

      <SoundCheck lang={s.lang} />

      <section>
        <h3>{u('p.data')}</h3>
        <p className="phint">{u('p.dataSummary', { stickers: s.stickers.length, paintings: s.gallery.length, cars: s.cars.length, words })}</p>
        <div className="pbuttons">
          <button className="pbtn outline-danger" onClick={() => { if (window.confirm(u('e.resetConfirm'))) resetEnglish(); }}>{u('p.resetEnglish')}</button>
          <button className="pbtn danger" onClick={() => { if (window.confirm(u('p.resetConfirm'))) { resetProgress(); void clearDrawings(); } }}>{u('p.resetAll')}</button>
        </div>
      </section>

      <section className="pabout">
        <h3>{u('p.about')}</h3>
        <p>{u('p.footer')}</p>
        {/* The app's only outside link, for grown-ups (GAME_DESIGN rule 9). Opens outside the app. */}
        <p>{u('p.openSource')} <a className="psource" href={SOURCE_URL} target="_blank" rel="noopener noreferrer">{u('p.sourceLink')}</a></p>
        <p className="muted">{u('p.brands')}</p>
      </section>
    </div>
  );
}
