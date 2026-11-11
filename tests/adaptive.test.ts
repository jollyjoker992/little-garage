import { beforeEach, describe, expect, it } from 'vitest';
import { levelFor, recordRound } from '../src/engine/adaptive';
import { resetProgress, update } from '../src/engine/store';

describe('adaptive levels', () => {
  beforeEach(() => resetProgress());
  it('levels up after 4 of 5 first-try answers', () => {
    [true, true, false, true].forEach((x) => expect(recordRound('g', x)).toBeNull());
    expect(recordRound('g', true)).toBe('up');
    expect(levelFor('g')).toBe(2);
  });
  it('levels down after 3 misses in a row, never below 1', () => {
    for (let i = 0; i < 5; i++) recordRound('g', true);
    expect(levelFor('g')).toBe(2);
    recordRound('g', false); recordRound('g', false);
    expect(recordRound('g', false)).toBe('down');
    expect(levelFor('g')).toBe(1);
    for (let i = 0; i < 6; i++) recordRound('g', false);
    expect(levelFor('g')).toBe(1);
  });
  it('a pinned level never changes', () => {
    update(() => ({ pinned: { g: 3 } }));
    for (let i = 0; i < 10; i++) recordRound('g', false);
    expect(levelFor('g')).toBe(3);
  });
});
