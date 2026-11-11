// Drawing Board pictures live in IndexedDB (they are images, too big for localStorage).
// Every call is safe to fail (private mode etc.): it just won't persist.
export type Drawing = {
  id: string;
  /** 'blank' or a Paint Shop page id (v:/c:/l:) whose outline is drawn on top. */
  page: string;
  /** The paint layer only (transparent PNG), so it can be reopened and drawn on. */
  paint: Blob;
  /** White background + paint + outline, small JPEG for My Garage. */
  thumb: Blob;
  at: number;
};

const DB = 'little-garage';
const STORE = 'drawings';
const MAX = 60;
/** Fired on window after a drawing is saved, so My Garage can refresh. */
export const CHANGED = 'little-garage:drawings-changed';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const r = fn(db.transaction(STORE, mode).objectStore(STORE));
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

export async function listDrawings(): Promise<Drawing[]> {
  try {
    return ((await tx('readonly', (s) => s.getAll())) as Drawing[]).sort((a, b) => b.at - a.at);
  } catch {
    return [];
  }
}

export async function getDrawing(id: string): Promise<Drawing | undefined> {
  try {
    return (await tx('readonly', (s) => s.get(id))) as Drawing | undefined;
  } catch {
    return undefined;
  }
}

export async function saveDrawing(d: Drawing): Promise<void> {
  try {
    await tx('readwrite', (s) => s.put(d));
    const all = await listDrawings();
    for (const old of all.slice(MAX)) await tx('readwrite', (s) => s.delete(old.id));
    window.dispatchEvent(new Event(CHANGED));
  } catch {
    /* ignore */
  }
}

export async function clearDrawings(): Promise<void> {
  try {
    await tx('readwrite', (s) => s.clear());
    window.dispatchEvent(new Event(CHANGED));
  } catch {
    /* ignore */
  }
}
