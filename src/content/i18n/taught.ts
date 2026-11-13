// The ONLY lines that are always said in English, whatever the app language: the English words being taught
// (English Street), on their own — never instructions. Everything else (Zip, the friends, the helper) speaks
// the app language. Spread into en.ts and vi.ts so every key exists in both (tests require it).
// Single taught words use 'say.value' ("fire truck!"); these are the multi-word ones.
export const taught: Record<string, string | string[]> = {
  /** Two taught words together (Zip's Garage L3): "red bus!" */
  'eng.phrase2': '{c} {w}!',
  /** English echo of a sticker: "red fire truck!" */
  'echo.colorVehicle': '{color} {vehicle}!',
};
