export type ShapeId = 'circle' | 'square' | 'triangle' | 'rectangle' | 'star' | 'oval';
export const SHAPES: ShapeId[] = ['circle', 'square', 'triangle', 'rectangle', 'star', 'oval'];

/** Real-world car objects and their shape (Shape Garage L3). Key: obj.<id> in i18n. */
export type ObjectId = 'wheel' | 'window' | 'sign' | 'door' | 'star' | 'mirror';
export const OBJECT_SHAPE: Record<ObjectId, ShapeId> = {
  wheel: 'circle',
  window: 'square',
  sign: 'triangle',
  door: 'rectangle',
  star: 'star',
  mirror: 'oval',
};
