// The ship stop (★): new English words come off the ship. Each word is shown and said with full help
// ("Ai đây nhỉ? Là xe cứu hỏa! Tiếng Anh là: fire truck!"), a friend repeats it, he's invited to say it
// with Zip, then he finds it next to one other card.
import { useEffect, useRef, useState } from 'react';
import { ShipArt, ZipArt } from '../../art/english';
import { WORD_BY_ID, wordsOf, type EngWord } from '../../content/english';
import { mateVoice } from '../../content/classmates';
import { L } from '../../engine/i18n';
import { mateSay, mateWow } from '../../engine/mates';
import { makeRng, pick, shuffle } from '../../engine/rng';
import { afterSpeech, say, stopSpeech, type Step } from '../../engine/speech';
import { sfx, wait } from '../../engine/sound';
import { findPrompt, meaning, meetWord, recordWord, tryAgainLines, wordLine, zipCheer, type StopResult } from '../../engine/vocab';
import { Confetti } from '../../ui/Confetti';
import { MateBar } from '../../ui/MateBar';
import { ThingView } from '../../ui/ThingView';
import { Dots, LevelStars, TopBar } from '../../ui/TopBar';

type Phase = 'show' | 'check';
const MEET_KEY = { vehicle: 'eng.meet.vehicle', color: 'eng.meet.color', action: 'eng.meet.action' } as const;

/** What to say while the word is on stage. */
function showLines(w: EngWord, first: boolean): Step[] {
  const wow = mateWow();
  return [
    first && { sfx: 'horn' },
    first && L('game.engMeet.intro'),
    first && mateSay('start')[0],
    w.sfx && { sfx: w.sfx },
    L(MEET_KEY[w.kind], { w: meaning(w) }),
    L('eng.inEnglish'),
    wordLine(w), 500, wordLine(w),
    ...(wow ? [wow.line, wordLine(w, mateVoice(wow.mate.id))] : []),
    L('eng.sayWithZip'), 2500,
    wordLine(w, 'zip'),
  ];
}

export function ShipArrives({ words, back = '#/zone/english', onDone }: { words: string[]; back?: string; onDone: (r: StopResult) => void }) {
  const [list] = useState(() => words.map((id) => WORD_BY_ID[id]));
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('show');
  const [check, setCheck] = useState<{ things: EngWord[]; answer: string } | null>(null);
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [party, setParty] = useState(0);
  const [showDone, setShowDone] = useState(false);
  const firstTries = useRef(0);
  const alive = useRef(true);
  /** The word on show (-1 once its check has started), so a word's check starts only once. */
  const shownIdx = useRef(0);
  const w = list[idx];

  useEffect(() => { alive.current = true; return () => { alive.current = false; stopSpeech(); }; }, []);

  // Show the word, then ask for it next to one other card.
  useEffect(() => {
    if (!w || phase !== 'show') return;
    setShowDone(false);
    const my = idx;
    void (async () => {
      await say(showLines(w, idx === 0));
      // Tapping the picture (the word again) or a friend cuts the lines short: wait for whatever is being
      // said now, then go on to "find it" — never wait for the cut lines to finish.
      await afterSpeech();
      if (!alive.current || shownIdx.current !== my) return;
      setShowDone(true);
      await wait(400);
      if (alive.current && shownIdx.current === my) startCheck();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, phase]);

  function startCheck() {
    shownIdx.current = -1;
    meetWord(w.id);
    const rng = makeRng();
    // The other card: a word of this stop when there is one, else any word of the same kind in the unit.
    const others = [...list, ...wordsOf(w.unit)].filter((x) => x.kind === w.kind && x.id !== w.id);
    setCheck({ things: shuffle(rng, [w, pick(rng, others.slice(0, Math.max(1, list.length - 1)))]), answer: w.id });
    setWrong([]); setSolved(false);
    setPhase('check');
    void say(findPrompt(1, w));
  }

  const nextWord = () => {
    if (!alive.current) return;
    if (idx + 1 >= list.length) return onDone({ first: firstTries.current, total: list.length });
    shownIdx.current = idx + 1;
    setPhase('show');
    setCheck(null);
    setIdx(idx + 1);
  };

  const onPick = async (id: string) => {
    if (!check || solved) return;
    if (id === check.answer) {
      setSolved(true);
      setParty((x) => x + 1);
      sfx('ding');
      const first = wrong.length === 0;
      if (first) firstTries.current++;
      recordWord(w.id, 1, first);
      await say([wordLine(w), w.sfx && { sfx: w.sfx }, ...mateSay('right'), zipCheer()]);
      await wait(300);
      nextWord();
      return;
    }
    if (wrong.includes(id)) return;
    sfx('wobble');
    setWrong((x) => [...x, id]);
    void say([...tryAgainLines(), ...mateSay('miss'), ...findPrompt(1, w)]);
  };

  if (!w) return null;
  const replay = () => void (phase === 'show' ? say(showLines(w, false)) : say(findPrompt(1, w)));
  return (
    <div className="screen game ship-arrives zone-english">
      <TopBar back={back} onReplay={replay}>
        <LevelStars level={1} />
        <Dots total={list.length} done={idx + (solved ? 1 : 0)} />
      </TopBar>
      <div className="sa-body">
        <div className="sa-ship"><ShipArt /></div>
        {phase === 'show' && (
          <button className={`sa-show ${showDone ? 'shown' : ''}`} key={`show-${idx}`} onClick={() => { sfx('pop'); void say([wordLine(w), w.sfx && { sfx: w.sfx }]); }}>
            {w.kind === 'action'
              ? <div className={`sa-zip act-${w.a}`}><ZipArt lights={w.a === 'lights'} /></div>
              : <div className="sa-thing"><ThingView thing={w.thing} /></div>}
          </button>
        )}
        {phase === 'check' && check && (
          <div className="choices n2 sa-check" key={`check-${idx}`}>
            {check.things.map((x) => (
              <button
                key={x.id}
                data-answer={x.id === check.answer ? 'yes' : undefined}
                className={['choice', 'pop-in', wrong.includes(x.id) && 'shake dim', wrong.length >= 2 && x.id === check.answer && !solved && 'glow', solved && x.id === check.answer && 'win'].filter(Boolean).join(' ')}
                onClick={() => void onPick(x.id)}
              >
                <ThingView thing={x.thing} />
              </button>
            ))}
          </div>
        )}
      </div>
      <MateBar />
      {party > 0 && <Confetti key={party} />}
    </div>
  );
}
