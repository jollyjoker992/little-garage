// A new classmate comes off the ship. He names them HIMSELF — by saying a name into the mic (his own voice
// becomes the friend's name), by tapping big letters, or by picking a ready name — then picks their car and
// color (English words!).
import { useEffect, useMemo, useRef, useState } from 'react';
import { ShipArt } from '../../art/english';
import { COLORS, type ColorId } from '../../content/colors';
import { MATE_COLORS, MATE_VEHICLES, NAME_CHIPS, NAME_LETTERS, NAME_MAX, mateLabel, mateName, type Mate, type MateId } from '../../content/classmates';
import { L, voiced, type Arg } from '../../engine/i18n';
import { mateLine } from '../../engine/mates';
import { HEARD, micSupported, startRecording } from '../../engine/mic';
import { makeRng, sample } from '../../engine/rng';
import { afterSpeech, say, stopSpeech } from '../../engine/speech';
import { sfx } from '../../engine/sound';
import { getState, update } from '../../engine/store';
import { wordLine } from '../../engine/vocab';
import { Confetti } from '../../ui/Confetti';
import { MateFigure } from '../../ui/MateBar';
import { TopBar } from '../../ui/TopBar';

type Step = 'name' | 'car' | 'color' | 'done';
type NameMode = 'menu' | 'mic' | 'keys' | 'chips';
type MicState = 'idle' | 'rec' | 'got';

/** Zip talks in the app language, with his own voice. */
const zip = (key: string, args?: Record<string, Arg>) => voiced(L(key, args), 'zip');
const capital = (s: string) => (s ? s[0] + s.slice(1).toLowerCase() : s);

function MicIcon() {
  return (
    <svg viewBox="0 0 48 48" className="thing-svg"><rect x="17" y="6" width="14" height="24" rx="7" fill="#fff" stroke="#263238" strokeWidth="3" />
      <path d="M11 22 Q11 36 24 36 Q37 36 37 22 M24 36 V43 M16 43 H32" fill="none" stroke="#263238" strokeWidth="3.5" strokeLinecap="round" /></svg>
  );
}

export function FriendArrives({ id, onDone }: { id: MateId; onDone: () => void }) {
  const opts = useMemo(() => {
    const rng = makeRng();
    const used = getState().mates.map((m) => m.name);
    return {
      names: sample(rng, NAME_CHIPS.filter((n) => !used.includes(n)), 4),
      cars: sample(rng, MATE_VEHICLES, 4),
      colors: sample(rng, MATE_COLORS, 4),
    };
  }, []);
  const canMic = useMemo(micSupported, []);
  const [step, setStep] = useState<Step>('name');
  const [mode, setMode] = useState<NameMode>('menu');
  const [mic, setMic] = useState<MicState>('idle');
  const [level, setLevel] = useState(0);
  const [typed, setTyped] = useState('');
  const [mate, setMate] = useState<Mate>({ id, name: '', v: opts.cars[0], color: opts.colors[0] });
  const [picked, setPicked] = useState(false);
  const [party, setParty] = useState(0);
  const recording = useRef<{ stop: () => void } | null>(null);
  const alive = useRef(true);

  const ask = (st: Step) => {
    if (st === 'name') void say([{ sfx: 'horn' }, L('eng.friend.arrive'), zip('zip.whatName'), L(canMic ? 'eng.friend.how' : 'eng.friend.howNoMic')]);
    if (st === 'car') void say(zip('zip.whatCar', { mate: mateName(mate) }));
    if (st === 'color') void say(zip('zip.whatColor'));
  };
  useEffect(() => {
    ask(step);
    if (step === 'done') {
      update((s) => ({ mates: [...s.mates.filter((m) => m.id !== id), mate], mateDue: false }));
      setParty((x) => x + 1);
      void say([{ sfx: 'fanfare' }, mateLine(mate, 'mate.hello'), L('eng.friend.done', { mate: mateName(mate) })]).then(async () => { await afterSpeech(); if (alive.current) onDone(); });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
  useEffect(() => { alive.current = true; return () => { alive.current = false; recording.current?.stop(); stopSpeech(); }; }, []);

  const next = () => { sfx('pop'); setPicked(false); setStep(step === 'name' ? 'car' : step === 'car' ? 'color' : 'done'); };
  const hello = (m: Mate) => void say(mateLine(m, 'mate.hello'));

  // ── Naming ──
  const openMode = (m: NameMode) => {
    sfx('pop');
    setMode(m);
    const line: Record<NameMode, string> = { menu: canMic ? 'eng.friend.how' : 'eng.friend.howNoMic', mic: 'eng.friend.sayName', keys: 'eng.friend.typeName', chips: 'eng.friend.pickReady' };
    void say(L(line[m]));
  };
  const pickName = (n: string) => { sfx('pop'); setPicked(true); const m = { ...mate, name: n, clip: undefined }; setMate(m); hello(m); };
  const tapLetter = (ch: string) => {
    const t = (typed + ch).slice(0, NAME_MAX);
    sfx('pop');
    setTyped(t);
    const m = { ...mate, name: capital(t), clip: undefined };
    setMate(m);
    setPicked(true);
    void say(L('say.value', { value: ch }));
  };
  const backspace = () => {
    const t = typed.slice(0, -1);
    sfx('pop');
    setTyped(t);
    setMate({ ...mate, name: capital(t) });
    setPicked(!!t);
  };
  const sayName = typed ? () => hello(mate) : undefined;

  const record = async () => {
    if (mic === 'rec') { recording.current?.stop(); return; }
    stopSpeech();
    sfx('pop');
    setMic('rec');
    try {
      const r = startRecording(3000, (v) => alive.current && setLevel(v));
      recording.current = r;
      const { url, peak } = await r.done;
      recording.current = null;
      if (!alive.current) return;
      setLevel(0);
      if (peak < HEARD) { setMic('idle'); void say(L('eng.friend.notHeard')); return; }
      const m = { ...mate, name: '', clip: url };
      setMate(m);
      setMic('got');
      setPicked(true);
      hello(m); // "Tớ là [his voice]! Chào King!"
    } catch {
      // Mic refused or not available: letters instead.
      if (!alive.current) return;
      setMic('idle');
      setMode('keys');
      void say(L('eng.friend.noMic'));
    }
  };

  const label = mateLabel(mate);
  const replay: () => void = () => (step === 'name' && mode !== 'menu' ? openMode(mode) : ask(step));
  const nameView = () => {
    if (mode === 'menu') return (
      <div className="fa-opts name-modes">
        {canMic && <button className="fa-opt mode-mic pop-in" onClick={() => openMode('mic')} aria-label="Say a name"><MicIcon /></button>}
        <button className="fa-opt mode-keys pop-in" onClick={() => openMode('keys')} aria-label="Tap letters">ABC</button>
        <button className="fa-opt mode-chips pop-in" onClick={() => openMode('chips')} aria-label="Pick a name">🎲</button>
      </div>
    );
    if (mode === 'chips') return (
      <div className="fa-opts">
        {opts.names.map((n) => <button key={n} className={`fa-opt name-chip pop-in ${mate.name === n ? 'on' : ''}`} onClick={() => pickName(n)}>{n}</button>)}
      </div>
    );
    if (mode === 'mic') return (
      <div className="fa-opts mic-row">
        <button className={`mic-btn ${mic}`} style={{ ['--lv' as string]: level }} onClick={() => void record()} aria-label={mic === 'rec' ? 'Stop' : 'Record'}>
          <MicIcon />
        </button>
        {mic === 'got' && <button className="fa-opt hear-btn pop-in" onClick={() => hello(mate)} aria-label="Hear it">🔊</button>}
      </div>
    );
    return (
      <div className="name-keys">
        {NAME_LETTERS.map((ch) => <button key={ch} className="nk" onClick={() => tapLetter(ch)} disabled={typed.length >= NAME_MAX}>{ch}</button>)}
        <button className="nk del" onClick={backspace} disabled={!typed} aria-label="Delete">⌫</button>
      </div>
    );
  };

  return (
    <div className={`screen friend-arrives zone-english ${step === 'name' ? `naming n-${mode}` : ''}`}>
      <TopBar onReplay={replay} onBack={step === 'name' && mode !== 'menu' ? () => { setMode('menu'); setMic('idle'); } : undefined} back="#/" />
      <div className="fa-stage">
        <div className="fa-ship"><ShipArt /></div>
        <div className={`fa-friend ${step === 'done' ? 'win' : 'drive-in'}`} key={step === 'name' ? 'in' : 'stay'} onClick={() => (mate.name || mate.clip) && hello(mate)}>
          <MateFigure mate={{ ...mate }} />
          {(label || (mode === 'keys' && step === 'name')) && <span className={`mate-name big ${mode === 'keys' && step === 'name' ? 'typing' : ''}`} onClick={sayName}>{mode === 'keys' && step === 'name' ? (typed || ' ') : label}</span>}
        </div>
      </div>
      {step !== 'done' && (
        <div className="fa-row">
          {step === 'name' && nameView()}
          {step === 'car' && (
            <div className="fa-opts">
              {opts.cars.map((v) => (
                <button key={v} className={`fa-opt pop-in ${mate.v === v && picked ? 'on' : ''}`} onClick={() => { sfx('pop'); setPicked(true); setMate({ ...mate, v }); void say(wordLine(`v.${v}`)); }}>
                  <MateFigure mate={{ ...mate, v }} />
                </button>
              ))}
            </div>
          )}
          {step === 'color' && (
            <div className="fa-opts">
              {opts.colors.map((c: ColorId) => (
                <button key={c} className={`fa-opt pot-opt pop-in ${mate.color === c && picked ? 'on' : ''}`} onClick={() => { sfx('splash'); setPicked(true); setMate({ ...mate, color: c }); void say(wordLine(`color.${c}`)); }} aria-label={c}>
                  <span className="pot" style={{ ['--pot' as string]: COLORS[c] }} />
                </button>
              ))}
            </div>
          )}
          <button className={`big-btn go fa-ok ${picked ? 'pulse' : ''}`} disabled={!picked || mic === 'rec'} onClick={next} aria-label="OK">
            <svg viewBox="0 0 48 48" width="56" height="56"><path d="M10 25 L20 35 L38 13" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      )}
      {party > 0 && <Confetti key={party} n={50} />}
    </div>
  );
}

