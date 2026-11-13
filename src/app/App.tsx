import { useEffect, useRef, useState } from 'react';
import type { ZoneId } from '../content/catalog';
import { unlockAudio } from '../engine/sound';
import { enterFullscreen } from '../engine/fullscreen';
import { L } from '../engine/i18n';
import { speakFirstLine, stopSpeech } from '../engine/speech';
import { getState, useStore } from '../engine/store';
import { GameScreen } from '../games/registry';
import { Garage } from '../screens/Garage';
import { Home } from '../screens/Home';
import { Parent } from '../screens/Parent';
import { Sleep } from '../screens/Sleep';
import { Start } from '../screens/Start';
import { ZoneScreen } from '../screens/ZoneScreen';
import { EnglishZone } from '../screens/EnglishZone';
import { useRoute } from './router';

export function App() {
  const [started, setStarted] = useState(false);
  const [sleeping, setSleeping] = useState(false);
  const startedAt = useRef(Date.now());
  const route = useRoute();
  const lang = useStore((s) => s.lang);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  // Session limit check.
  useEffect(() => {
    const id = setInterval(() => {
      const limit = getState().sessionLimit;
      if (started && limit && Date.now() - startedAt.current > limit * 60_000) setSleeping(true);
    }, 10_000);
    return () => clearInterval(id);
  }, [started]);

  if (!started) {
    return <Start onStart={() => { unlockAudio(); speakFirstLine(L('app.welcome')); enterFullscreen(); startedAt.current = Date.now(); setStarted(true); }} />;
  }
  if (sleeping && route[0] !== 'parent') {
    return <Sleep onContinue={() => { stopSpeech(); startedAt.current = Date.now(); setSleeping(false); }} />;
  }

  const [page, id, arg] = route;
  let screen;
  if (page === 'zone' && id === 'english') screen = <EnglishZone key={id} />;
  else if (page === 'zone' && id) screen = <ZoneScreen key={id} id={id as ZoneId} />;
  else if (page === 'game' && id) screen = <GameScreen key={`${id}/${arg ?? ''}`} id={id} arg={arg} />;
  else if (page === 'garage') screen = <Garage />;
  else if (page === 'parent') screen = <Parent />;
  else screen = <Home />;
  return <div className="app">{screen}</div>;
}
