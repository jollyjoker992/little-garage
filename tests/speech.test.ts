// The speech engine against a fake speechSynthesis that can act like iOS Safari: a line that never
// starts (speech still locked, or queued behind a line that never ended).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Mode = 'ok' | 'locked' | 'stuckOnce';

class FakeUtterance {
  text: string;
  lang = '';
  rate = 1;
  pitch = 1;
  volume = 1;
  voice: unknown = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;
  constructor(text: string) { this.text = text.replace(/!$/, ''); }
}

function fakeSynth(mode: Mode) {
  const log: string[] = [];
  let stuck = mode === 'stuckOnce';
  const synth = {
    speaking: false,
    pending: false,
    paused: false,
    getVoices: () => [],
    addEventListener: () => {},
    resume: () => {},
    cancel: () => { log.push('cancel'); synth.speaking = false; synth.pending = false; stuck = false; },
    speak: (u: FakeUtterance) => {
      log.push(`speak ${u.text}`);
      if (mode === 'locked') return; // iOS before a tap: silently ignored
      if (stuck) { synth.speaking = true; return; } // queued behind a line that never ends
      synth.speaking = true;
      setTimeout(() => { log.push(`start ${u.text}`); u.onstart?.(); }, 50);
      setTimeout(() => { synth.speaking = false; log.push(`end ${u.text}`); u.onend?.(); }, 500);
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
  return { speech, L, log, synth, tap: () => listeners.click?.() };
}

/** Run say() to the end, moving the fake clock along. */
async function run<T>(p: Promise<T>) {
  let done = false;
  void p.then(() => { done = true; });
  for (let i = 0; i < 400 && !done; i++) await vi.advanceTimersByTimeAsync(100);
  expect(done).toBe(true);
  return p;
}

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('speech', () => {
  it('speaks each line once when the voice works', async () => {
    const { speech, L, log } = await load('ok');
    await run(speech.say([L('say.value', { value: 'one' }), L('say.value', { value: 'two' })]));
    expect(log).toEqual(['speak one', 'start one', 'end one', 'speak two', 'start two', 'end two']);
  });

  it('clears a stuck queue and says the line again', async () => {
    const { speech, L, log } = await load('stuckOnce');
    await run(speech.say([L('say.value', { value: 'one' }), L('say.value', { value: 'two' })]));
    expect(log).toEqual(['speak one', 'cancel', 'speak one', 'start one', 'end one', 'speak two', 'start two', 'end two']);
  });

  it('clears a line left in the queue before the next one', async () => {
    const { speech, L, log, synth } = await load('ok');
    synth.speaking = true; // a line from before that never ended
    await run(speech.say(L('say.value', { value: 'one' })));
    expect(log).toEqual(['cancel', 'speak one', 'start one', 'end one']);
  });

  it('moves on when speech is locked, without waiting twice on every line', async () => {
    const { speech, L, log } = await load('locked');
    const t0 = Date.now();
    await run(speech.say([1, 2, 3].map((n) => L('say.value', { value: `line${n}` }))));
    expect(log.filter((x) => x.startsWith('speak'))).toEqual(['speak line1', 'speak line1', 'speak line2', 'speak line3']);
    expect(Date.now() - t0).toBeLessThan(4 * speech.START_MS + 1000);
  });

  it('unlocks speech on a tap until a line has been heard', async () => {
    const { speech, L, log, tap } = await load('ok');
    tap();
    expect(log).toEqual(['speak  ']);
    await run(speech.say(L('say.value', { value: 'one' })));
    log.length = 0;
    tap();
    expect(log).toEqual([]);
  });

  it('unlocks again on a tap after a line could not be heard', async () => {
    const { speech, L, log, tap } = await load('locked');
    await run(speech.say(L('say.value', { value: 'one' })));
    log.length = 0;
    tap();
    expect(log).toEqual(['speak  ']);
  });

  it('does not add the silent line when the tap already started speech', async () => {
    const { speech, L, log, tap } = await load('ok');
    const p = speech.say(L('say.value', { value: 'one' }));
    tap();
    await run(p);
    expect(log).toEqual(['speak one', 'start one', 'end one']);
  });
});
