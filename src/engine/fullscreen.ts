// Full screen for the whole app (Fullscreen API, with the webkit-prefixed version for older iPad Safari).
// iPhone Safari has no Fullscreen API for pages — there, "Add to Home Screen" gives a full-screen app
// (the PWA manifest asks for display: fullscreen).
import { useSyncExternalStore } from 'react';

type FsDoc = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => void; webkitFullscreenEnabled?: boolean };
type FsEl = HTMLElement & { webkitRequestFullscreen?: () => void };

const doc = () => document as FsDoc;

export const fullscreenSupported = () => !!(doc().fullscreenEnabled || doc().webkitFullscreenEnabled);

/** Opened from the home screen (already full screen, no browser bars). */
export const isStandalone = () =>
  window.matchMedia?.('(display-mode: fullscreen), (display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

export const isFullscreen = () => !!(doc().fullscreenElement || doc().webkitFullscreenElement);

/** Must be called from a tap. Never throws. */
export function enterFullscreen() {
  if (!fullscreenSupported() || isFullscreen()) return;
  const el = document.documentElement as FsEl;
  try {
    if (el.requestFullscreen) void el.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
    else el.webkitRequestFullscreen?.();
  } catch {
    /* browser refused */
  }
}

export function exitFullscreen() {
  if (!isFullscreen()) return;
  try {
    if (document.exitFullscreen) void document.exitFullscreen().catch(() => {});
    else doc().webkitExitFullscreen?.();
  } catch {
    /* ignore */
  }
}

export const toggleFullscreen = () => (isFullscreen() ? exitFullscreen() : enterFullscreen());

function subscribe(cb: () => void) {
  document.addEventListener('fullscreenchange', cb);
  document.addEventListener('webkitfullscreenchange', cb);
  return () => {
    document.removeEventListener('fullscreenchange', cb);
    document.removeEventListener('webkitfullscreenchange', cb);
  };
}

/** Re-renders when the app enters or leaves full screen (button, Esc key, swipe). */
export const useFullscreen = () => useSyncExternalStore(subscribe, isFullscreen, () => false);
