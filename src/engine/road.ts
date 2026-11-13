// Small session-only notes for the road screen (not saved): how often he tried the stop he is on,
// and which stop he just came back from (so Zip can drive from it to the next one).
const tries = new Map<string, number>();
export const stopKey = (unit: string, index: number) => `${unit}.${index}`;
export const triesOf = (key: string) => tries.get(key) ?? 0;
export const addTry = (key: string) => { tries.set(key, triesOf(key) + 1); return triesOf(key); };
export const clearTries = (key: string) => { tries.delete(key); };

let cameFrom: { unit: string; index: number } | null = null;
export const setCameFrom = (unit: string, index: number) => { cameFrom = { unit, index }; };
/** Read once: where Zip was before he came back to the road. */
export const takeCameFrom = () => { const c = cameFrom; cameFrom = null; return c; };

let reviewTurn = 0;
/** The mixed review stops take turns. */
export const nextReview = (n: number) => (n ? reviewTurn++ % n : 0);
let greeted = false;
/** True the first time English Street is opened in this session (the long hello is said once). */
export const firstVisit = () => { const f = !greeted; greeted = true; return f; };

let lastTown = '';
/** True when this town was not the one announced last (its name is said once per arrival). */
export const newTown = (town: string) => { const n = town !== lastTown; lastTown = town; return n; };
