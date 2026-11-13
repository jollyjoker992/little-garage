import { beforeEach, describe, expect, it } from 'vitest';
import { MAX_TRIES, ROAD, UNITS, WORDS, WORD_BY_ID, wordsOf, type Stop } from '../src/content/english';
import { MATE_ORDER, PERSONALITY, mateLabel, type Mate } from '../src/content/classmates';
import { thingKey } from '../src/content/things';
import { LEVELS, type EngFindCfg } from '../src/content/levels';
import { DICTS, EN, L, lineKeys, splitClips, t, type Line } from '../src/engine/i18n';
import { CHANCE, activeMates, mateLine, mateSay, missingMate, tapLine } from '../src/engine/mates';
import { makeRng } from '../src/engine/rng';
import { getState, update } from '../src/engine/store';
import {
  actionCommand, currentUnit, findPrompt, finishStop, hasBadge, meansLine, openUnits, passed, recordWord, reviewStops, shownUnits,
  tryAgainLines, zipCheer,
} from '../src/engine/vocab';
import { GENERATORS } from '../src/games/rounds';
import { taught } from '../src/content/i18n/taught';
import { VEHICLE_DEFAULTS } from '../src/art/defaults';

const hasKey = (k: string) => k in DICTS.en && k in DICTS.vi;
const lines = (steps: unknown[]) => steps.filter((x): x is Line => !!x && typeof x === 'object' && 'key' in x);
const keysOf = (steps: unknown[]) => lines(steps).flatMap(lineKeys);
const said = (lang: 'en' | 'vi', steps: unknown[]) => lines(steps).map((l) => t(lang, l));
const ALL_BADGES = Object.fromEntries(UNITS.map((u) => [u.id, ROAD[u.id].length]));
const cfgOf = (s: Stop, vehicles?: string[]): EngFindCfg => ({ level: s.level, targets: s.words, pool: s.words, choices: s.choices, vehicles });

describe('per-line language', () => {
  it('a line pinned to English is English whatever the app language, and nested words follow it', () => {
    expect(t('vi', EN('v.fireTruck'))).toBe('fire truck');
    expect(t('vi', EN('eng.phrase2', { c: L('color.red'), w: L('v.bus') }))).toBe('red bus!');
    expect(t('vi', L('eng.a.find', { w: L('v.fireTruck') }))).toBe('Đâu là xe cứu hỏa?');
    expect(t('en', L('eng.a.find', { w: L('v.fireTruck') }))).toBe('Where is the fire truck?');
  });
  it('the always-English lines are the same in both dictionaries', () => {
    for (const k of Object.keys(taught)) expect(DICTS.vi[k], k).toEqual(DICTS.en[k]);
  });
  it('Zip speaks the app language', () => {
    expect(t('vi', L('zip.whatColor'))).toBe('Màu gì nhỉ?');
    expect(t('en', L('zip.whatColor'))).toBe('What color?');
  });
});

describe('English Street content', () => {
  it('every word has its line in both languages and a picture', () => {
    for (const w of WORDS) {
      expect(hasKey(w.key), w.key).toBe(true);
      expect(w.thing, w.id).toBeDefined();
    }
  });
  it('words of one kind look different from each other', () => {
    for (const kind of ['vehicle', 'color', 'action']) {
      const ks = WORDS.filter((w) => w.kind === kind).map((w) => thingKey(w.thing));
      expect(new Set(ks).size).toBe(ks.length);
    }
  });
  it('every town has a name and stops that go ★ → ★★ → ★★★ and cover all its words', () => {
    for (const u of UNITS) {
      expect(hasKey(`unit.${u.id}`)).toBe(true);
      const stops = ROAD[u.id];
      expect(stops.map((s) => s.level), `${u.id}: one stop per level`).toEqual([1, 2, 3]);
      const ids = wordsOf(u.id).map((w) => w.id).sort();
      // every word is introduced with help (★) before it is asked without
      expect(stops.filter((s) => s.level === 1).flatMap((s) => s.words).sort()).toEqual(ids);
      for (const s of stops.filter((x) => x.level > 1)) expect([...s.words].sort()).toEqual(ids);
      for (const s of stops) {
        expect(s.choices).toBeGreaterThanOrEqual(2);
        expect(s.kind === 'do' ? 6 : 4).toBeGreaterThanOrEqual(s.choices);
        if (s.level > 1) expect(s.rounds, `${u.id}: every word is asked`).toBeGreaterThanOrEqual(Math.min(6, s.words.length));
      }
    }
  });
});

describe('levels: how much help', () => {
  const w = WORD_BY_ID['v.fireTruck'];
  it('★ gives the meaning and the English word; ★★ a frame and the word, no meaning; ★★★ just the word', () => {
    expect(said('vi', findPrompt(1, w))).toEqual(['Đâu là xe cứu hỏa?', 'Tiếng Anh là:', 'fire truck!', 'fire truck!']);
    expect(said('vi', findPrompt(2, w))).toEqual(['Đâu là xe:', 'fire truck!']);
    expect(said('vi', findPrompt(3, w))).toEqual(['fire truck!']);
    expect(said('vi', findPrompt(2, WORD_BY_ID['color.red']))).toEqual(['Đâu là xe màu:', 'red!']);
    expect(said('vi', findPrompt(2, WORD_BY_ID['v.plane']))).toEqual(['Đâu là:', 'plane!']); // a plane is not a "xe"
    expect(said('vi', findPrompt(1, WORD_BY_ID['v.motorbike']))).toEqual(['Đâu là xe máy?', 'Tiếng Anh là:', 'motorbike!', 'motorbike!']);
  });
  it('from ★★ on, the name in the app language is never said (only after two misses, as help)', () => {
    for (const word of WORDS) for (const lv of [2, 3] as const) {
      const meaning = t('vi', L(word.key));
      for (const line of said('vi', word.kind === 'action' ? actionCommand(lv, word) : findPrompt(lv, word))) expect(line).not.toContain(meaning);
    }
    expect(said('vi', [meansLine(w)])).toEqual(['Nghĩa là xe cứu hỏa!']);
  });
  it('Zip Says: ★ "Zip nói: go! Nghĩa là chạy!" · ★★ "Zip nói: go!" · ★★★ "go!"', () => {
    const go = WORD_BY_ID['act.go'];
    expect(said('vi', actionCommand(1, go))).toEqual(['Zip nói:', 'go!', 'Nghĩa là chạy!']);
    expect(said('vi', actionCommand(2, go))).toEqual(['Zip nói:', 'go!']);
    expect(said('vi', actionCommand(3, go))).toEqual(['go!']);
  });
});

describe('the road: stops, level ups, badges', () => {
  beforeEach(() => update(() => ({ engRoad: {}, engUnits: {}, words: {} })));
  it('starts in the first town; the next town opens with the badge', () => {
    expect(openUnits({}, {})).toEqual(['rescue']);
    expect(currentUnit({}, {})).toBe('rescue');
    expect(openUnits({}, { rescue: 2 })).toEqual(['rescue']);
    expect(hasBadge({ rescue: 3 }, 'rescue')).toBe(true);
    expect(openUnits({}, { rescue: 3 })).toEqual(['rescue', 'build']);
    expect(currentUnit({}, { rescue: 3 })).toBe('build');
    expect(openUnits({}, { rescue: 3, build: 3 })).toEqual(['rescue', 'build', 'street']);
  });
  it('switches: On opens now, Off takes the town off the road, one town always stays', () => {
    expect(openUnits({ colors: 'on' }, {})).toEqual(['rescue', 'colors']);
    expect(openUnits({ rescue: 'off' }, {})).toEqual(['build']);
    expect(shownUnits({ rescue: 'off', build: 'off', street: 'off', colors: 'off', actions: 'off', travel: 'off' })).toEqual(['rescue']);
    expect(currentUnit({ build: 'off', street: 'off', colors: 'off', actions: 'off', travel: 'off' }, { rescue: 3 })).toBe('review');
  });
  it('a stop passes with 60% first-try answers; ship stops always pass; the 3rd try passes anyway', () => {
    const find = ROAD.rescue[1], meet = ROAD.rescue[0];
    expect(passed(find, { first: 3, total: 5 }, 1)).toBe(true);
    expect(passed(find, { first: 2, total: 5 }, 1)).toBe(false);
    expect(passed(find, { first: 0, total: 5 }, MAX_TRIES)).toBe(true);
    expect(passed(meet, { first: 0, total: 3 }, 1)).toBe(true);
  });
  it('walking a town: one stop per level, a level up after each, then the badge', () => {
    const ok = { first: 5, total: 5 };
    expect(ROAD.rescue.map((s) => s.level)).toEqual([1, 2, 3]);
    expect(finishStop('rescue', 0, ok, 1)).toEqual({ passed: true, badge: false, levelUp: 2 });
    expect(finishStop('rescue', 1, { first: 1, total: 5 }, 1)).toEqual({ passed: false });
    expect(getState().engRoad.rescue).toBe(1);
    expect(finishStop('rescue', 1, ok, 2)).toEqual({ passed: true, badge: false, levelUp: 3 });
    expect(finishStop('rescue', 0, ok, 1)).toEqual({ passed: true, replay: true }); // replaying an old stop changes nothing
    expect(getState().engRoad.rescue).toBe(2);
    expect(finishStop('rescue', 2, ok, 1)).toEqual({ passed: true, badge: true, levelUp: undefined });
    expect(hasBadge(getState().engRoad, 'rescue')).toBe(true);
  });
  it('after every badge the road turns into mixed ★★★ practice', () => {
    expect(currentUnit({}, ALL_BADGES)).toBe('review');
    const stops = reviewStops(ALL_BADGES, {});
    expect(stops.map((s) => [s.kind, s.level])).toEqual([['find', 3], ['do', 3]]);
    expect(reviewStops({ rescue: 3 }, {}).map((s) => s.kind)).toEqual(['find']);
  });
});

describe("Zip's Garage rounds on the road", () => {
  it('asks every word of the stop in turn, shows the right number of cards, says known lines', () => {
    for (const u of UNITS) for (const stop of ROAD[u.id].filter((s) => s.kind === 'find')) {
      const cfg = cfgOf(stop, stop.two ? wordsOf('rescue').map((w) => w.id) : undefined);
      const asked = new Set<string>();
      for (let idx = 0; idx < stop.words.length; idx++) {
        const r = GENERATORS.engFind(cfg, makeRng(idx + 1), { lang: 'vi', level: 1, idx });
        asked.add(r.wordIds![0]);
        expect(r.choices.length).toBe(stop.choices);
        expect(new Set(r.choices.map((c) => thingKey(c.thing))).size).toBe(stop.choices);
        expect(r.wordLevel).toBe(stop.level);
        for (const k of keysOf([r.prompt, r.answerSay, r.cheer, ...(r.promptLines ?? []), ...(r.tryAgain ?? []), ...(r.hintLines ?? [])])) expect(hasKey(k), k).toBe(true);
      }
      expect(asked.size).toBe(stop.words.length);
    }
  });
  it('colors ★★★ asks for two words once he knows some vehicles: "red bus!"', () => {
    const r = GENERATORS.engFind(LEVELS.engFind[3], makeRng(7), { lang: 'vi', level: 3, idx: 0 });
    expect(said('vi', r.promptLines ?? [])).toEqual([expect.stringMatching(/^red (car|bus|fire truck|police car|ambulance)!$/)]);
  });
});

describe('word stars', () => {
  beforeEach(() => update(() => ({ words: {} })));
  it('a word has as many stars as the highest level he got it right at, first try; they never go down', () => {
    recordWord('v.bus', 1, false);
    expect(getState().words['v.bus'].box).toBe(1); // met
    recordWord('v.bus', 2, true);
    expect(getState().words['v.bus'].box).toBe(2);
    recordWord('v.bus', 3, false);
    expect(getState().words['v.bus'].box).toBe(2);
    recordWord('v.bus', 3, true);
    recordWord('v.bus', 2, false);
    expect(getState().words['v.bus'].box).toBe(3);
  });
});

describe('English only for the words being taught', () => {
  const TAUGHT = new Set(['say.value', ...Object.keys(taught)]);
  /** Every English line is a taught word on its own; no app-language line has English inside it. */
  const check = (steps: unknown[], where: string) => {
    for (const l of lines(steps)) {
      if (l.lang === 'en') expect(TAUGHT.has(l.key), `${where}: "${l.key}" is said in English but is not a taught word`).toBe(true);
      else for (const a of Object.values(l.args ?? {})) if (typeof a === 'object' && 'key' in a) expect(a.lang, `${where}: "${l.key}" mixes in English`).toBeUndefined();
    }
  };
  it('prompts, commands, help, cheers and the friends', () => {
    for (const w of WORDS) for (const lv of [1, 2, 3] as const) {
      check(findPrompt(lv, w), `find ${w.id}`);
      if (w.kind === 'action') check(actionCommand(lv, w), `cmd ${w.id}`);
      check([meansLine(w)], 'means');
    }
    for (const u of UNITS) for (const stop of ROAD[u.id].filter((s) => s.kind === 'find')) for (let seed = 1; seed <= 40; seed++) {
      const r = GENERATORS.engFind(cfgOf(stop, wordsOf('rescue').map((w) => w.id)), makeRng(seed), { lang: 'vi', level: 1, idx: seed });
      check([r.prompt, r.answerSay, r.cheer, ...(r.promptLines ?? []), ...(r.tryAgain ?? []), ...(r.hintLines ?? [])], `engFind ${u.id}`);
    }
    check([zipCheer(), ...tryAgainLines()], 'feedback');
    update(() => ({ mates: [{ id: 'bear', name: 'Bin', v: 'bus', color: 'red' }], mateOn: true, mateCount: 1, mateChat: 'chatty' }));
    for (const ev of Object.keys(CHANCE.chatty)) check(mateSay(ev as never, () => 0), `mate ${ev}`);
    expect(zipCheer().lang).toBeUndefined();
  });
  it('every line the road and the stop screens say exists in both languages', () => {
    for (const k of ['eng.whereThing', 'eng.road.town', 'eng.road.replay', 'eng.road.allDone', 'eng.road.locked', 'eng.badge.locked', 'eng.stopDone', 'eng.stopAgain', 'eng.stopRetry', 'eng.level2', 'eng.level3', 'eng.badge', 'drive.stop', 'eng.means', 'eng.zipSays', 'eng.where', 'eng.whereColor', 'eng.whereAction']) expect(hasKey(k), k).toBe(true);
  });
});

describe('classmates', () => {
  const mates: Mate[] = MATE_ORDER.map((id, i) => ({ id, name: ['Bin', 'Na', 'Su', 'Bo'][i], v: 'bus', color: 'red' }));
  beforeEach(() => update(() => ({ mates, mateOn: true, mateCount: 2, mateChat: 'normal' })));
  it('play in arrival order up to the number set; the next one waits to be named', () => {
    expect(activeMates().map((m) => m.id)).toEqual(['bear', 'cat']);
    // One friend per visit: the next one only comes after a finished stop (mateDue).
    update(() => ({ mates: [mates[0]], mateDue: false }));
    expect(missingMate()).toBe(null);
    update(() => ({ mateDue: true }));
    expect(missingMate()).toBe('cat');
    update(() => ({ mates: [], mateDue: false }));
    expect(missingMate()).toBe('bear'); // the very first friend never waits
    update(() => ({ mates: [mates[0]] }));
    update(() => ({ mateOn: false }));
    expect(missingMate()).toBe(null);
    expect(activeMates()).toEqual([]);
    expect(mateSay('start')).toEqual([]);
  });
  it('speak the app language (no pinned language) with their own voice', () => {
    for (const m of mates) {
      for (const line of [mateLine(m, 'mate.hello'), tapLine(m), ...mateSay('start', () => 0)]) {
        expect(line.lang).toBeUndefined();
        expect(line.voice).toMatch(/^mate:/);
        expect(t('vi', line)).not.toMatch(/\{\w+\}/);
        expect(t('en', line)).not.toMatch(/\{\w+\}/);
      }
    }
    expect(t('vi', mateLine(mates[0], 'mate.hello'))).toBe('Tớ là Bin! Chào cậu!');
    expect(t('en', mateLine(mates[0], 'mate.hello'))).toBe("I'm Bin! Hi!");
  });
  it('have every line they can say, for every personality and event', () => {
    for (const id of MATE_ORDER) expect(hasKey(`mate.tap.${PERSONALITY[id]}`)).toBe(true);
    for (const ev of Object.keys(CHANCE.chatty)) expect(hasKey(`mate.${ev}`), ev).toBe(true);
    for (const k of ['mate.wake', 'mate.tooMany', 'mate.wow']) expect(hasKey(k)).toBe(true);
  });
  it('quiet friends never start a game, chatty ones always cheer', () => {
    update(() => ({ mateChat: 'quiet' }));
    expect(mateSay('start', () => 0)).toEqual([]);
    update(() => ({ mateChat: 'chatty' }));
    expect(mateSay('right', () => 0.99)).toHaveLength(1);
  });
});

describe('a friend named in his own voice', () => {
  const clip = 'data:audio/mp4;base64,AAAA';
  const m: Mate = { id: 'bear', name: '', clip, v: 'bus', color: 'red' };
  it('his recording is played where the name goes, in both languages', () => {
    expect(splitClips(t('vi', mateLine(m, 'mate.hello')))).toEqual([{ say: 'Tớ là ' }, { clip }, { say: '! Chào cậu!' }]);
    expect(splitClips(t('en', mateLine(m, 'mate.hello')))).toEqual([{ say: "I'm " }, { clip }, { say: '! Hi!' }]);
    expect(splitClips(t('vi', L('zip.whatCar', { mate: { clip } })))).toEqual([{ clip }, { say: ' ơi, xe của cậu là xe gì?' }]);
  });
  it('a recording is not an i18n key, and plain lines have no clip parts', () => {
    expect(lineKeys(mateLine(m, 'mate.hello'))).toEqual(['mate.hello']);
    expect(splitClips(t('en', L('mate.hello', { mate: 'Bin' })))).toEqual([{ say: "I'm Bin! Hi!" }]);
  });
  it('shows a speaker under a friend who only has a recorded name', () => {
    expect(mateLabel(m)).toBe('🔊');
    expect(mateLabel({ ...m, name: 'Su' })).toBe('Su');
  });
});

describe('the new vehicles', () => {
  it('two new towns teach 11 more vehicles, each with a name in both languages', () => {
    expect(wordsOf('street').map((w) => w.v)).toEqual(['motorbike', 'bicycle', 'taxi', 'truck', 'garbageTruck', 'towTruck']);
    expect(wordsOf('travel').map((w) => w.v)).toEqual(['train', 'plane', 'boat', 'helicopter', 'rocket']);
    expect(t('vi', L('v.garbageTruck'))).toBe('xe rác');
    expect(t('en', L('v.towTruck'))).toBe('tow truck');
  });
  it('every vehicle word can be painted a color for "red train!" (its main part is "body"; the dump truck\'s is "bed")', () => {
    for (const w of WORDS.filter((x) => x.kind === 'vehicle')) expect(Object.keys(VEHICLE_DEFAULTS[w.v!]).some((r) => r === 'body' || r === 'bed'), w.id).toBe(true);
  });
});
