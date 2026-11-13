// The speech engine against a fake speechSynthesis that acts like Safari / iOS Safari can:
// - locked: iOS before a tap — speak() is silently ignored;
// - dropOnce: Safari right after a cancel — the line ends at once, unheard;
// - talkNoStart: Safari speaks the line but never fires 'start' (it must not be said twice);
// - stuckOnce: the first line never starts or ends and blocks the queue until cancel().
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Mode = 'ok' | 'locked' | 'dropOnce' | 'talkNoStart' | 'stuckOnce';

class FakeUtterance {
  text: string;
  lang = '';
  rate = 1;
  pitch = 1;
  volume = 1;
  voice: unknown = null;
  onstart: (() => void) | null = null;
  onboundary: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;
  constructor(text: string) { this.text = text.replace(/!$/, ''); }
}

function fakeSynth(mode: Mode) {
  const log: string[] = [];
  let quirk = mode !== 'ok';
  const synth = {
    speaking: false,
    pending: false,
    paused: false,
    getVoices: () => [],
    addEventListener: () => {},
    resume: () => {},
    cancel: () => { log.push('cancel'); synth.speaking = false; synth.pending = false; },
    speak: (u: FakeUtterance) => {
      log.push(`speak ${u.text}`);
      if (mode === 'locked') return;
      if (quirk && mode === 'dropOnce') { quirk = false; setTimeout(() => { log.push(`end ${u.text}`); u.onend?.(); }, 20); return; }
      if (quirk && mode === 'stuckOnce') { quirk = false; synth.speaking = true; return; }
      synth.speaking = true;
      const talk = mode === 'talkNoStart' ? 4000 : 500; // longer than START_MS
      if (mode !== 'talkNoStart') setTimeout(() => { log.push(`start ${u.text}`); u.onstart?.(); }, 50);
      setTimeout(() => { synth.speaking = false; log.push(`end ${u.text}`); u.onend?.(); }, talk);
    },
  };
  return { synth, log };
}

async function load(mode: Mode) {
  vi.resetModules();
  const { synth, log } = fakeSynth(mode);
  const listeners: Record<string, () => void> = {};
  vi.stubGlobal('window', { speechSynthesis: synth });
  vi.stubGlobal('document', { visibilityState: 'visible', addEventListener: (t: string, f: () => void) => { listeners[t] = f; } });
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
  vi.stubGlobal('fetch', () => Promise.reject(new Error('offline')));
  const speech = await import('../src/engine/speech');
  const { L } = await import('../src/engine/i18n');
  const line = (x: string) => L('say.value', { value: x });
  return { speech, line, log, synth, tap: () => listeners.click?.() };
}

/** Run say() to the end, moving the fake clock along. */
async function run<T>(p: Promise<T>) {
  let done = false;
  void p.then(() => { done = true; });
  for (let i = 0; i < 600 && !done; i++) await vi.advanceTimersByTimeAsync(100);
  expect(done).toBe(true);
  return p;
}

const spoken = (log: string[]) => log.filter((x) => x.startsWith('speak')).map((x) => x.slice(6));

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('speech', () => {
  it('speaks each line once when the voice works', async () => {
    const { speech, line, log } = await load('ok');
    await run(speech.say([line('one'), line('two')]));
    expect(log).toEqual(['speak one', 'start one', 'end one', 'speak two', 'start two', 'end two']);
  });

  it('never says a line twice when Safari speaks it without a start event', async () => {
    const { speech, line, log } = await load('talkNoStart');
    await run(speech.say([line('one'), line('two')]));
    expect(log).toEqual(['speak one', 'end one', 'speak two', 'end two']);
  });

  it('says a line again when Safari threw it away unheard', async () => {
    const { speech, line, log } = await load('dropOnce');
    await run(speech.say([line('one'), line('two')]));
    expect(spoken(log)).toEqual(['one', 'one', 'two']);
    expect(log).toContain('start one');
  });

  it('clears a line stuck in the queue before the next one, without saying it again', async () => {
    const { speech, line, log } = await load('stuckOnce');
    await run(speech.say([line('one'), line('two')]));
    expect(spoken(log)).toEqual(['one', 'two']);
    expect(log.slice(-4)).toEqual(['cancel', 'speak two', 'start two', 'end two']);
  });

  it('moves on when speech is locked, one try per line', async () => {
    const { speech, line, log } = await load('locked');
    const t0 = Date.now();
    await run(speech.say([line('a'), line('b'), line('c')]));
    expect(spoken(log)).toEqual(['a', 'b', 'c']);
    expect(Date.now() - t0).toBeLessThan(3 * speech.START_MS + 1000);
  });

  it('unlocks speech on a tap until a line has been heard', async () => {
    const { speech, line, log, tap } = await load('ok');
    tap();
    expect(log).toEqual(['speak  ']);
    await run(speech.say(line('one')));
    log.length = 0;
    tap();
    expect(log).toEqual([]);
  });

  it('unlocks again on a tap after a line could not be heard', async () => {
    const { speech, line, log, tap } = await load('locked');
    await run(speech.say(line('one')));
    log.length = 0;
    tap();
    expect(log).toEqual(['speak  ']);
  });

  it('does not add the silent line when the tap already started speech', async () => {
    const { speech, line, log, tap } = await load('ok');
    const p = speech.say(line('one'));
    tap();
    await run(p);
    expect(log).toEqual(['speak one', 'start one', 'end one']);
  });
});
