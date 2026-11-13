import { uiText, type UiKey } from '../content/i18n/ui';
import { useStore } from '../engine/store';

/** Screen text in the language chosen in Grown-ups (re-renders when it changes). */
export function useUi() {
  const lang = useStore((s) => s.lang);
  return (key: UiKey, args?: Record<string, string | number>) => uiText(lang, key, args);
}
