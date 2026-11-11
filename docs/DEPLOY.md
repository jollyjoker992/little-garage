# Deploy to Cloudflare Pages

The app is a static site: `npm run build` → `dist/`.

## Option A — Git integration (recommended)
1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pick `little-garage`.
2. Framework preset: **Vite** (or None). Build command: `npm run build`. Output directory: `dist`. Env var `NODE_VERSION=22`.
3. Every push to `main` deploys; other branches get preview URLs.

## Option B — from your machine
```sh
npx wrangler login        # once
npm run deploy            # build + wrangler pages deploy dist --project-name little-garage
```

## Keep it private (optional)
Pages URLs are public but unlisted. To restrict access: Cloudflare **Zero Trust → Access → Applications → Add** for the `*.pages.dev` domain, allowing only your family's emails.

## Install on the iPad
Open the URL in **Safari → Share → Add to Home Screen**. It then opens fullscreen and works **offline** after the first load. New deploys update automatically next time it is opened online.

## Notes
- Hash routing (`#/game/count`) means no SPA redirect rules are needed.
- Icons: edit `scripts/icons/icon-full.svg` (full square, no transparency — iOS adds the rounded corners and would turn transparent parts black) and `scripts/icons/icon-maskable.svg` (car inside Android's safe circle); `public/icon.svg` is the rounded browser-tab version. Then `npm run icons` (needs `brew install librsvg imagemagick`).
