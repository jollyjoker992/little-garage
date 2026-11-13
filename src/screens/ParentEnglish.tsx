// Grown-ups → English Street: a one-line summary, how levels work (fold-out), the towns (Auto / On / Off,
// stops passed, badge; tap to see the words), the classmates, and English echo for the other zones.
import { useState } from 'react';
import { MATE_ORDER, PERSONALITY, mateName, type Mate } from '../content/classmates';
import { ROAD, UNITS, wordsOf, type UnitId } from '../content/english';
import type { UiKey } from '../content/i18n/ui';
import { L, t, voiced } from '../engine/i18n';
import { mateLine } from '../engine/mates';
import { say } from '../engine/speech';
import { unlockAudio } from '../engine/sound';
import { update, useStore, type EngEcho, type MateChat, type UnitMode } from '../engine/store';
import { KNOWN, MASTERED, boxesOf, hasBadge, openUnits, stopsDone, wordLine } from '../engine/vocab';
import { MateFigure } from '../ui/MateBar';
import { useUi } from '../ui/useUi';
import { Row, Seg } from './ParentParts';

const MODES: UnitMode[] = ['auto', 'on', 'off'];
const MODE_LABEL: Record<UnitMode, UiKey> = { auto: 'p.auto', on: 'p.on', off: 'p.off' };
const ECHO_LABEL: Record<EngEcho, UiKey> = { off: 'p.off', words: 'e.echo.words', counting: 'e.echo.counting' };
const stars = (box: number) => '★'.repeat(box) + '☆'.repeat(Math.max(0, MASTERED - box));

export function ParentEnglish() {
  const s = useStore((x) => x);
  const u = useUi();
  const [open, setOpen] = useState<UnitId | null>(null);
  const boxes = boxesOf(s);
  const active = openUnits(s.engUnits, s.engRoad);
  const onUnits = UNITS.filter((x) => (s.engUnits[x.id] ?? 'auto') !== 'off');
  const known = Object.values(boxes).filter((b) => b >= KNOWN).length;
  const total = UNITS.reduce((a, x) => a + wordsOf(x.id).length, 0);
  const said = Object.values(s.said).filter(Boolean).length;

  const setMode = (id: UnitId, m: UnitMode) => update((st) => ({ engUnits: { ...st.engUnits, [id]: m } }));
  const setMate = (id: Mate['id'], patch: Partial<Mate>) => update((st) => ({ mates: st.mates.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));

  return (
    <section>
      <h3>{u('e.title')}</h3>
      <p className="phint">{u('e.hint')}</p>
      <p className="pstat">{u('e.stats', { known, total, said })}</p>
      <details className="pmore">
        <summary>{u('e.how')}</summary>
        <ul className="plist">
          <li>{u('e.lv1')}</li>
          <li>{u('e.lv2')}</li>
          <li>{u('e.lv3')}</li>
          <li>{u('e.pass')}</li>
        </ul>
      </details>

      <h4>{u('e.towns')}</h4>
      <p className="phint">{u('e.townsHint')}</p>
      <div className="ptowns">
        {UNITS.map((unit, ui) => {
          const ws = wordsOf(unit.id);
          const mode = s.engUnits[unit.id] ?? 'auto';
          const lastOn = mode !== 'off' && onUnits.length === 1;
          const done = stopsDone(s.engRoad, unit.id);
          const badge = hasBadge(s.engRoad, unit.id);
          const state: UiKey = mode === 'off' ? 'e.state.hidden' : badge ? 'e.state.badge' : active.includes(unit.id) ? 'e.state.open' : 'e.state.locked';
          return (
            <div key={unit.id} className={`ptown ${mode === 'off' ? 'off' : ''}`}>
              <div className="ptown-row">
                <button className="ptown-name" onClick={() => setOpen(open === unit.id ? null : unit.id)} aria-expanded={open === unit.id}>
                  <span className="chev">{open === unit.id ? '▾' : '▸'}</span>
                  <span className="ptown-title">{ui + 1}. {t(s.lang, L(`unit.${unit.id}`))}</span>
                  <span className="pdots" title={u(state)}>
                    {ROAD[unit.id].map((_, i) => <i key={i} className={i < done ? 'on' : ''} />)}
                    {badge && <b>🏅</b>}
                  </span>
                  <small>{u(state)}</small>
                </button>
                <div className="seg small">
                  {MODES.map((m) => (
                    <button key={m} className={mode === m ? 'on' : ''} disabled={m === 'off' && lastOn} onClick={() => setMode(unit.id, m)}>{u(MODE_LABEL[m])}</button>
                  ))}
                </div>
              </div>
              {lastOn && <p className="phint">{u('e.oneOn')}</p>}
              {open === unit.id && (
                <div className="pwords">
                  {ws.map((w) => {
                    const b = boxes[w.id] ?? 0;
                    return (
                      <div key={w.id} className="pword">
                        <button className="pplay" onClick={() => { unlockAudio(); void say(wordLine(w)); }} aria-label="🔊">🔊</button>
                        <span className="pword-en">{t('en', L(w.key))}</span>
                        <span className="pword-vi">{s.lang !== 'en' ? t(s.lang, L(w.key)) : ''}</span>
                        <span className="pstars">{b ? stars(b) : u('e.new')}</span>
                        <label className="check small"><input type="checkbox" checked={!!s.said[w.id]} onChange={(e) => update((st) => ({ said: { ...st.said, [w.id]: e.target.checked } }))} />{u('e.saidIt')}</label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Row label={u('e.mates')} hint={u('e.matesHint')}>
        <Seg value={s.mateOn ? 'on' : 'off'} options={[['on', u('p.on')], ['off', u('p.off')]]} onPick={(v) => update(() => ({ mateOn: v === 'on' }))} />
      </Row>
      {s.mateOn && (<>
        <Row label={u('e.howMany')}>
          <Seg value={s.mateCount} options={[1, 2, 3, 4].map((n) => [n, n])} onPick={(n) => update(() => ({ mateCount: n, mateDue: true }))} />
        </Row>
        <Row label={u('e.chatty')}>
          <Seg value={s.mateChat} options={(['quiet', 'normal', 'chatty'] as MateChat[]).map((k) => [k, u(`e.chat.${k}`)])} onPick={(k) => update(() => ({ mateChat: k }))} />
        </Row>
        <div className="pmates">
          {MATE_ORDER.slice(0, s.mateCount).map((id) => {
            const m = s.mates.find((x) => x.id === id);
            return (
              <div key={id} className="pmate">
                <div className="pmate-face">{m ? <MateFigure mate={m} /> : <span>?</span>}</div>
                <div className="pmate-fields">
                  <b>{u(`e.animal.${id}`)} <small>· {u(`e.kind.${PERSONALITY[id]}`)}</small></b>
                  {m ? (<>
                    <input className="ptext" maxLength={14} placeholder={u(m.clip ? 'e.nameOptional' : 'e.name')} value={m.name} onChange={(e) => setMate(id, { name: e.target.value })} aria-label={u('e.name')} />
                    <input className="ptext" maxLength={24} placeholder={u('e.spokenAs')} value={m.spoken ?? ''} onChange={(e) => setMate(id, { spoken: e.target.value })} aria-label={u('e.spokenAs')} />
                    <div className="pbuttons">
                      <button className="pbtn ghost" onClick={() => { unlockAudio(); void say([mateLine(m, 'mate.hello'), voiced(L('say.value', { value: mateName(m) }), 'zip')]); }}>{u('e.test')}</button>
                      {m.clip && <button className="pbtn ghost" onClick={() => { unlockAudio(); void new Audio(m.clip).play(); }}>{u('e.recording')}</button>}
                      {m.clip && <button className="pbtn ghost" disabled={!m.name.trim()} title={m.name.trim() ? '' : u('e.typeFirst')} onClick={() => setMate(id, { clip: undefined })}>{u('e.useTyped')}</button>}
                      <button className="pbtn ghost" onClick={() => update((st) => ({ mates: st.mates.filter((x) => x.id !== id), mateDue: true }))}>{u('e.newFriend')}</button>
                    </div>
                  </>) : <span className="phint">{u('e.comesLater')}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </>)}

      <Row label={u('e.echo')} hint={u('e.echoHint')}>
        <Seg value={s.engEcho} options={(['off', 'words', 'counting'] as EngEcho[]).map((k) => [k, u(ECHO_LABEL[k])])} onPick={(k) => update(() => ({ engEcho: k }))} />
      </Row>
    </section>
  );
}
