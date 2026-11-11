import { useEffect, useRef, useState } from 'react';
import { BRANDS, spoken, type Brand } from '../../content/brands';
import { LEVELS } from '../../content/levels';
import type { Thing } from '../../content/things';
import { levelFor, recordRound } from '../../engine/adaptive';
import { L } from '../../engine/i18n';
import { makeRng, sample, shuffle } from '../../engine/rng';
import { say, stopSpeech } from '../../engine/speech';
import { sfx, wait } from '../../engine/sound';
import { Confetti } from '../../ui/Confetti';
import { ThingView } from '../../ui/ThingView';
import { TopBar } from '../../ui/TopBar';
import { Reward } from '../Reward';

type Card = { id: string; brand: Brand; thing: Thing };

function deal(pairs: number): Card[] {
  const r = makeRng();
  const brands = sample(r, BRANDS, pairs);
  return shuffle(r, brands.flatMap((b) => [
    { id: `${b.id}-logo`, brand: b, thing: { t: 'logo', brand: b.id } as Thing },
    { id: `${b.id}-car`, brand: b, thing: { t: 'vehicle', v: 'car', color: b.color, body: b.body, brand: b.id } as Thing },
  ]));
}

export function BrandMemory() {
  const cfg = LEVELS.brandMemory[levelFor('brandMemory')];
  const [cards, setCards] = useState(() => deal(cfg.pairs));
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [party, setParty] = useState(0);
  const [done, setDone] = useState(false);
  const mistakes = useRef(0);
  const busy = useRef(false);

  useEffect(() => {
    void say(L('game.brandMemory.intro'));
    return () => stopSpeech();
  }, []);

  const tap = async (c: Card) => {
    if (busy.current || matched.includes(c.id) || open.includes(c.id)) return;
    sfx('pop');
    const now = [...open, c.id];
    setOpen(now);
    if (now.length < 2) {
      void say(L('say.value', { value: spoken(c.brand) }));
      return;
    }
    const [a, b] = now.map((id) => cards.find((x) => x.id === id)!);
    busy.current = true;
    if (a.brand.id === b.brand.id) {
      sfx('ding');
      setParty((x) => x + 1);
      const m = [...matched, a.id, b.id];
      setMatched(m);
      setOpen([]);
      busy.current = false;
      await say(L('memory.match', { name: spoken(a.brand) }));
      if (m.length === cards.length) {
        recordRound('brandMemory', mistakes.current <= cfg.pairs);
        await say(L('cheer'));
        setDone(true);
      }
    } else {
      mistakes.current++;
      void say(L('say.value', { value: spoken(c.brand) }));
      await wait(1100);
      sfx('wobble');
      setOpen([]);
      busy.current = false;
    }
  };

  if (done) {
    return <Reward back="#/zone/garage" onAgain={() => { mistakes.current = 0; setCards(deal(cfg.pairs)); setMatched([]); setOpen([]); setDone(false); }} />;
  }

  return (
    <div className="screen zone-garage">
      <TopBar back="#/zone/garage" onReplay={() => void say(L('game.brandMemory.intro'))} />
      <div className={`memory-grid n${cards.length}`}>
        {cards.map((c) => {
          const shown = cfg.faceUp || open.includes(c.id) || matched.includes(c.id);
          return (
            <button key={c.id} className={`mem-card ${shown ? 'up' : 'down'} ${open.includes(c.id) ? 'sel' : ''} ${matched.includes(c.id) ? 'matched' : ''}`} onClick={() => void tap(c)}>
              {shown ? <ThingView thing={c.thing} /> : <span className="mem-back">?</span>}
            </button>
          );
        })}
      </div>
      {party > 0 && <Confetti key={party} n={24} />}
    </div>
  );
}
