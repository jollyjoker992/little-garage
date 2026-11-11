import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from './app/App';
import './styles.css';

registerSW({ immediate: true });

// Stop long-press menus during play (double-tap zoom is disabled in CSS with touch-action).
document.addEventListener('contextmenu', (e) => e.preventDefault());

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
