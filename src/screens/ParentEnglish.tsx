// Grown-ups settings → English Street: English echo, the towns of the road (Auto / On / Off, stops passed,
// badge, word stars), and the classmates (on/off, how many, names, chattiness).
import { useState } from 'react';
import { MATE_ORDER, PERSONALITY, mateName, type Mate } from '../content/classmates';
import { ROAD, UNITS, wordsOf, type UnitId } from '../content/english';
import { L, t, voiced } from '../engine/i18n';
import { mateLine } from '../engine/mates';
import { say } from '../engine/speech';
import { unlockAudio } from '../engine/sound';
import { resetEnglish, update, useStore, type EngEcho, type MateChat, type UnitMode } from '../engine/store';
import { KNOWN, MASTERED, boxesOf, hasBadge, openUnits, stopsDone, wordLine } from '../engine/vocab';
import { MateFigure } from '../ui/MateBar';

const ECHO: [EngEcho, string][] = [['off', 'Off'], ['words', 'Words'], ['counting', 'Words + counting']];
const CHAT: [MateChat, string][] = [['quiet', 'Quiet'], ['normal', 'Normal'], ['chatty', 'Chatty']];
const MODES: UnitMode[] = ['auto', 'on', 'off'];
const stars = (box: number) => '★'.repeat(box) + '☆'.repeat(Math.max(0, MASTERED - box));

export function ParentEnglish() {
  const s = useStore((x) => x);
  const [open, setOpen] = useState<UnitId | null>(null);
  const boxes = boxesOf(s);
  const active = openUnits(s.engUnits, s.engRoad);
  const onUnits = UNITS.filter((u) => (s.engUnits[u.id] ?? 'auto') !== 'off');
  const known = Object.values(boxes).filter((b) => b >= KNOWN).length;
  const total = UNITS.reduce((a, u) => a + wordsOf(u.id).length, 0);
  const said = Object.values(s.said).filter(Boolean).length;

  const setMode = (id: UnitId, m: UnitMode) => update((st) => ({ engUnits: { ...st.engUnits, [id]: m } }));
  const setMate = (id: Mate['id'], patch: Partial<Mate>) => update((st) => ({ mates: st.mates.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));

  return (
    <section>
      <h3>English Street</h3>
      <p className="muted">He learns English words through vehicles with Zip the tow truck. Everyone (Zip, the friends, the helper) talks in the language above; English is only the words being taught, said on their own.</p>
      <p className="muted">
        English Street is a road. Each town has 3 stops (★ ★★ ★★★) and a badge. The stars on a stop are its level:
        ★ full help ("Đâu là xe cứu hỏa? Tiếng Anh là: fire truck!") · ★★ no meaning ("Đâu là xe: fire truck!") · ★★★ just the word ("fire truck!").
        A stop is passed with 60% of its rounds right on the first try (or on the 3rd try).
      </p>
      <div className="prow">
        <label>English echo in the other games<br /><span className="muted">"Xe cứu hỏa — fire truck!" (only when the language is Tiếng Việt)</span></label>
        <div className="seg">{ECHO.map(([k, label]) => <button key={k} className={s.engEcho === k ? 'on' : ''} onClick={() => update(() => ({ engEcho: k }))}>{label}</button>)}</div>
      </div>
      <p className="muted">Words he knows: <b>{known} / {total}</b> · He said it himself: <b>{said}</b></p>

      <h4>Towns</h4>
      <p className="muted">Auto: opens when the town before it has its badge. On: open now. Off: hidden from the road; progress is kept.</p>
      {UNITS.map((u, ui) => {
        const ws = wordsOf(u.id);
        const k = ws.filter((w) => (boxes[w.id] ?? 0) >= KNOWN).length;
        const mode = s.engUnits[u.id] ?? 'auto';
        const lastOn = mode !== 'off' && onUnits.length === 1;
        const state = mode === 'off' ? 'hidden' : hasBadge(s.engRoad, u.id) ? 'badge ✓' : active.includes(u.id) ? 'open' : 'locked';
        return (
          <div key={u.id} className="punit">
            <div className="prow game-row">
              <button className="plink" onClick={() => setOpen(open === u.id ? null : u.id)}>
                {open === u.id ? '▾' : '▸'} {ui + 1}. {t('en', L(`unit.${u.id}`))} <span className="muted">· stops {stopsDone(s.engRoad, u.id)}/{ROAD[u.id].length} · {k}/{ws.length} words ★★ · {state}</span>
              </button>
              <div className="seg small">
                {MODES.map((m) => (
                  <button key={m} className={mode === m ? 'on' : ''} disabled={m === 'off' && lastOn} onClick={() => setMode(u.id, m)}>{m === 'auto' ? 'Auto' : m === 'on' ? 'On' : 'Off'}</button>
                ))}
              </div>
            </div>
            {lastOn && <p className="muted">At least one town stays on.</p>}
            {open === u.id && (
              <div className="pwords">
                {ws.map((w) => {
                  const b = boxes[w.id] ?? 0;
                  return (
                    <div key={w.id} className="pword">
                      <button className="pbtn ghost" onClick={() => { unlockAudio(); void say(wordLine(w)); }}>🔊</button>
                      <span className="pword-en">{t('en', L(w.key))}</span>
                      <span className="muted">{t('vi', L(w.key))}</span>
                      <span className="pstars" title={`box ${b}`}>{b ? stars(b) : 'new'}</span>
                      <label className="check small"><input type="checkbox" checked={!!s.said[w.id]} onChange={(e) => update((st) => ({ said: { ...st.said, [w.id]: e.target.checked } }))} />He said it!</label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <h4>Classmates</h4>
      <p className="muted">Little friends he names himself when they come off the ship: he says a name into the mic (his recording becomes the name, kept on this device), taps letters, or picks a ready name. The mic needs the https site (or localhost). They ride along in every English game, cheer, give hints and joke when tapped. They talk in the language above.</p>
      <div className="prow">
        <label>Classmates</label>
        <div className="seg">
          <button className={s.mateOn ? 'on' : ''} onClick={() => update(() => ({ mateOn: true }))}>On</button>
          <button className={!s.mateOn ? 'on' : ''} onClick={() => update(() => ({ mateOn: false }))}>Off</button>
        </div>
      </div>
      {s.mateOn && (<>
        <div className="prow">
          <label>How many</label>
          <div className="seg">{[1, 2, 3, 4].map((n) => <button key={n} className={s.mateCount === n ? 'on' : ''} onClick={() => update(() => ({ mateCount: n, mateDue: true }))}>{n}</button>)}</div>
        </div>
        <div className="prow">
          <label>How chatty</label>
          <div className="seg">{CHAT.map(([k, label]) => <button key={k} className={s.mateChat === k ? 'on' : ''} onClick={() => update(() => ({ mateChat: k }))}>{label}</button>)}</div>
        </div>
        {MATE_ORDER.slice(0, s.mateCount).map((id) => {
          const m = s.mates.find((x) => x.id === id);
          return (
            <div key={id} className="pmate">
              <div className="pmate-face">{m ? <MateFigure mate={m} /> : <span className="muted">?</span>}</div>
              {m ? (
                <div className="pmate-fields">
                  <label className="muted">{id} · {PERSONALITY[id]}</label>
                  <input className="ptext" maxLength={14} placeholder={m.clip ? 'Name (optional)' : 'Name'} value={m.name} onChange={(e) => setMate(id, { name: e.target.value })} aria-label="Name" />
                  {m.clip && (<>
                    <button className="pbtn" onClick={() => { unlockAudio(); void new Audio(m.clip).play(); }}>▶ His recording</button>
                    <button className="pbtn ghost" disabled={!m.name.trim()} title={m.name.trim() ? '' : 'Type a name first'} onClick={() => setMate(id, { clip: undefined })}>Use the typed name</button>
                  </>)}
                  <input className="ptext" maxLength={24} placeholder="Spoken as (optional)" value={m.spoken ?? ''} onChange={(e) => setMate(id, { spoken: e.target.value })} aria-label="Spoken as" />
                  <button className="pbtn" onClick={() => { unlockAudio(); void say([mateLine(m, 'mate.hello'), voiced(L('say.value', { value: mateName(m) }), 'zip')]); }}>🔊 Test</button>
                  <button className="pbtn ghost" onClick={() => update((st) => ({ mates: st.mates.filter((x) => x.id !== id), mateDue: true }))}>New friend</button>
                </div>
              ) : <span className="muted">The {id} comes off the ship on a later visit to English Street (one new friend per visit, after he finishes a game), and he names them.</span>}
            </div>
          );
        })}
      </>)}
      <button className="pbtn danger" onClick={() => { if (window.confirm('Start the road again and forget the word stars and badges? Town switches and classmates stay.')) resetEnglish(); }}>Reset English progress</button>
    </section>
  );
}
