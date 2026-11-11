/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'favicon.ico', 'apple-touch-icon*.png', 'audio/manifest.json'],
      manifest: {
        name: 'Little Garage',
        short_name: 'Little Garage',
        description: 'Car games for little learners: numbers, letters, colors and logic.',
        theme_color: '#1e88e5',
        background_color: '#29b6f6',
        display: 'fullscreen',
        orientation: 'landscape',
        start_url: './',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,ico,json,mp3}'], globIgnores: ['og-image.png'] },
    }),
  ],
  test: { environment: 'node', include: ['tests/**/*.test.{ts,tsx}'] },
});
