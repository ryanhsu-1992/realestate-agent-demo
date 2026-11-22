// Atelier "air": one still frame of a domain-warped noise field (no loop, so nothing moves past 5s).
(() => {
  const c = document.querySelector('canvas.air'); if (!c) return;
  const cs = getComputedStyle(document.documentElement);
  const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const rgb = (v) => { probe.fillStyle = cs.getPropertyValue(v).trim(); probe.fillRect(0, 0, 1, 1); return probe.getImageData(0, 0, 1, 1).data; };
  const base = rgb('--color-paper'), veil = rgb('--air-veil'), amber = rgb('--air-amber');
  const W = 192, H = 120; c.width = W; c.height = H;
  const ctx = c.getContext('2d'); const img = ctx.createImageData(W, H);
  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  const sm = (t) => t * t * (3 - 2 * t);
  const noise = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const a = hash(xi, yi), b = hash(xi + 1, yi), d = hash(xi, yi + 1), e = hash(xi + 1, yi + 1);
    return a + (b - a) * sm(xf) + (d - a) * sm(yf) + (a - b - d + e) * sm(xf) * sm(yf); };
  const fbm = (x, y) => { let v = 0, a = 0.5; for (let i = 0; i < 4; i++) { v += a * noise(x, y); x *= 2.02; y *= 2.02; a *= 0.5; } return v; };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const u = x / W * 3, v = y / H * 2;
    const qx = fbm(u, v), qy = fbm(u + 5.2, v + 1.3);
    const n = fbm(u + 2.4 * qx, v + 2.4 * qy);
    const t1 = Math.min(1, Math.max(0, (n - 0.35) * 2.2)), t2 = Math.min(1, Math.max(0, (qy - 0.5) * 2));
    const i = (y * W + x) * 4;
    for (let k = 0; k < 3; k++) img.data[i + k] = base[k] + (veil[k] - base[k]) * t1 * 0.9 + (amber[k] - base[k]) * t2 * 0.35;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0); c.classList.add('is-drawn');
})();
