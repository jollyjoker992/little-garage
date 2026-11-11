import { useEffect, useState } from 'react';

// Hash routes: #/  #/zone/<id>  #/game/<id>[/<arg>]  #/garage  #/parent
//
// In-app back: we keep our own stack of visited routes so the ⬅ button always returns to the
// previous screen — needed because the installed iPad app has no browser back button.
const here = () => window.location.hash || '#/';
const stack: string[] = typeof window !== 'undefined' ? [here()] : [];
let popping = false;

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    const h = here();
    if (popping) {
      popping = false;
      return;
    }
    if (stack[stack.length - 2] === h) stack.pop(); // browser/OS back gesture
    else stack.push(h);
  });
}

export function go(hash: string) {
  window.location.hash = hash.replace(/^#/, '');
}

/** Go to the previous in-app screen, or to `fallback` when this screen was opened directly. */
export function back(fallback = '#/') {
  if (stack.length > 1) {
    stack.pop();
    popping = true;
    window.history.back();
  } else {
    go(fallback);
  }
}

export function useRoute(): string[] {
  const parse = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [r, setR] = useState(parse);
  useEffect(() => {
    const on = () => setR(parse());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return r;
}
