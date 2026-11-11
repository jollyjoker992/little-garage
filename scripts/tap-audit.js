// Paint Shop tap-area audit. Paste into the browser console on the running app (any screen, after ▶).
// For every Paint Shop page it colors each region uniquely, rasterizes the drawing, and checks a grid of
// points: the region you SEE at a point must be the region a TAP there selects. Prints one row per page.
// A healthy page shows bad ≈ 0 (a handful of anti-aliased edge points is fine).
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8000', '#8000ff', '#0080ff', '#80ff00'];
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const rows = [];
  location.hash = '/game/paint'; await sleep(700);
  const n = document.querySelectorAll('.page-card').length;
  for (let i = 0; i < n; i++) {
    location.hash = '/game/paint/x'; await sleep(120); location.hash = '/game/paint'; await sleep(350);
    document.querySelectorAll('.page-card')[i].click(); await sleep(350);
    const svg = document.querySelector('.paint-svg');
    const els = [...svg.querySelectorAll('[data-region]')];
    const regions = [...new Set(els.map((e) => e.getAttribute('data-region')))];
    const col = Object.fromEntries(regions.map((r, k) => [r, COLORS[k]]));
    for (const e of els) e.setAttribute(e.getAttribute('fill') === 'none' ? 'stroke' : 'fill', col[e.getAttribute('data-region')]);
    const rect = svg.getBoundingClientRect();
    const clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); clone.setAttribute('width', rect.width); clone.setAttribute('height', rect.height);
    const img = new Image();
    await new Promise((res) => { img.onload = res; img.src = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' })); });
    const cv = Object.assign(document.createElement('canvas'), { width: Math.round(rect.width), height: Math.round(rect.height) });
    const ctx = cv.getContext('2d'); ctx.drawImage(img, 0, 0, cv.width, cv.height);
    const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
    const rgb = Object.fromEntries(regions.map((r) => [r, hex(col[r])]));
    let checked = 0, bad = 0; const pairs = {};
    for (let y = 2; y < cv.height; y += 5) for (let x = 2; x < cv.width; x += 5) {
      const o = (y * cv.width + x) * 4; if (data[o + 3] < 250) continue;
      const seen = regions.find((r) => rgb[r].every((c, k) => Math.abs(c - data[o + k]) <= 2)); if (!seen) continue;
      checked++;
      const hit = document.elementFromPoint(rect.left + x + 0.5, rect.top + y + 0.5)?.closest('[data-region]')?.getAttribute('data-region') ?? '(nothing)';
      if (hit !== seen) { bad++; pairs[`${seen} -> ${hit}`] = (pairs[`${seen} -> ${hit}`] || 0) + 1; }
    }
    rows.push({ page: svg.getAttribute('aria-label'), checked, bad, pairs: JSON.stringify(pairs) });
  }
  location.hash = '/game/paint';
  window.__tapAudit = rows; // read by automated runs
  console.table(rows);
})();
