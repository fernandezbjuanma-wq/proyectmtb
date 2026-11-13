#!/usr/bin/env python3
"""Genera la geografía sintética del prototipo (ruta + mapa base) -> src/js/00-geo.js
Todo es inventado: NO usa el GPX ni la ubicación real de nadie.
Coordenadas en metros, x = este, y = norte."""
import json, sys, numpy as np
from scipy.interpolate import splprep, splev, PchipInterpolator
from scipy.ndimage import gaussian_filter
from scipy.spatial import cKDTree
from skimage import measure

rng = np.random.default_rng(7)
OUT = sys.argv[1]
PREV = sys.argv[2] if len(sys.argv) > 2 else None
L = 9000.0

# ---------- 1. Traza en planta ----------
ctl = np.array([(60,150),(140,110),(240,140),(310,220),(335,320),(290,410),(210,455),(165,545),(235,615),
                (340,645),(435,605),(480,520),(565,490),(655,540),(705,630),(785,690),(875,660),(905,565),
                (860,480),(905,395),(965,325)], float)
tck, _ = splprep([ctl[:,0], ctl[:,1]], s=0, k=3)
u = np.linspace(0, 1, 6000)
x, y = splev(u, tck)
d = np.hypot(np.diff(x), np.diff(y)); sc = np.concatenate([[0], np.cumsum(d)])
k = L / sc[-1]
x, y, sc = x * k, y * k, sc * k
S = np.arange(0, L + 1, 10.0)
rx, ry = np.interp(S, sc, x), np.interp(S, sc, y)

# ---------- 2. Perfil de elevación ----------
prof = [(0,660),(700,668),(1700,737),(2400,722),(3300,792),(3700,796),(4100,772),(4400,780),(4800,762),(5000,770),
        (5600,814),(5900,798),(6400,838),(6820,864),(7220,888.8),(7520,921.8),(7920,945.8),(8120,946.3),(8420,938.8),(9000,904)]
if PREV: prof = json.loads(PREV)
ps = np.array(prof, float)
h = np.interp(S, ps[:,0], ps[:,1])
h = gaussian_filter(h, 3, mode='nearest') + gaussian_filter(rng.normal(0, 0.5, len(S)), 3)

def grade(i, w=5):
    a, b = max(0, i - w), min(len(S) - 1, i + w)
    return (h[b] - h[a]) / ((b - a) * 10) * 100

def ascent_to(s, thr=3.0):
    ref, tot = h[0], 0.0
    for i in range(int(s / 10) + 1):
        if h[i] - ref >= thr: tot += h[i] - ref; ref = h[i]
        elif ref - h[i] >= thr: ref = h[i]
    return tot

print('largo', S[-1], 'grado@6820', round(grade(682), 2), 'grado@7370', round(grade(737), 2), 'ascenso@6820', round(ascent_to(6820)), file=sys.stderr)

# ---------- 3. Campo de alturas ----------
PAD = 650
x0, x1 = rx.min() - PAD, rx.max() + PAD
y0, y1 = ry.min() - PAD, ry.max() + PAD
R = 25.0
gx = np.arange(x0, x1 + R, R); gy = np.arange(y0, y1 + R, R)
GX, GY = np.meshgrid(gx, gy)
def fbm(sig, amp):
    f = gaussian_filter(rng.normal(0, 1, GX.shape), sig); return f / f.std() * amp
base = fbm(22, 38) + fbm(9, 12) + fbm(4, 3.5) + (GX - GX.mean()) * 0.035 + (GY - GY.mean()) * 0.02
tree = cKDTree(np.c_[rx, ry])
dist, idx = tree.query(np.c_[GX.ravel(), GY.ravel()])
dist = dist.reshape(GX.shape); idx = idx.reshape(GX.shape)
# base evaluada sobre la traza
bi = lambda px, py: base[np.clip(((py - y0) / R).round().astype(int), 0, base.shape[0]-1), np.clip(((px - x0) / R).round().astype(int), 0, base.shape[1]-1)]
base_r = bi(rx, ry)
w = np.exp(-(dist / 120.0) ** 2)
H = base + w * (h[idx] - base_r[idx]) + (h.mean() - base.mean()) * (1 - w) * 0
H = H + (np.interp(0, [0, 1], [0, 0]))
# nivelar el resto del terreno alrededor de la cota media de la traza
H = H + (1 - w) * (h.mean() - 0) - (1 - w) * base.mean() * 0
H = gaussian_filter(H, 0.8)

# ---------- 4. Curvas de nivel ----------
def contours(level):
    out = []
    for c in measure.find_contours(H, level):
        c = measure.approximate_polygon(c, 0.9)
        if len(c) < 3: continue
        pts = []
        for r, cc in c:
            pts += [int(round(x0 + cc * R)), int(round(y0 + r * R))]
        out.append(pts)
    return out
lo, hi = int(np.floor(H.min() / 10) * 10), int(np.ceil(H.max() / 10) * 10)
cont = []
for lv in range(lo, hi + 1, 10):
    cs = contours(lv)
    if cs: cont.append({'m': 1 if lv % 50 == 0 else 0, 'z': lv, 'p': cs})

# ---------- 5. Vegetación y agua ----------
N2 = gaussian_filter(rng.normal(0, 1, GX.shape), 9); N2 = N2 / N2.std()
veg = []
for c in measure.find_contours(N2, 0.35):
    if len(c) < 12: continue
    if not np.allclose(c[0], c[-1]): continue
    c = measure.approximate_polygon(c, 1.1)
    if len(c) < 5: continue
    veg.append([int(round(v)) for r, cc in c for v in (x0 + cc * R, y0 + r * R)])

# arroyo: descenso por la línea de máxima pendiente desde un punto alto lejos de la traza
far = np.where(dist > 350, H, -1e9); fi = np.unravel_index(np.argmax(far), H.shape)
pr, pc = fi; water = [[int(x0 + pc * R), int(y0 + pr * R)]]
Hs = gaussian_filter(H, 2.0)
for _ in range(220):
    best = None
    for dr in (-1, 0, 1):
        for dc in (-1, 0, 1):
            if dr == dc == 0: continue
            rr, cc2 = pr + dr, pc + dc
            if 0 <= rr < Hs.shape[0] and 0 <= cc2 < Hs.shape[1]:
                v = Hs[rr, cc2] + rng.normal(0, 0.15)
                if best is None or v < best[0]: best = (v, rr, cc2)
    if best is None or best[0] >= Hs[pr, pc] + 0.01: break
    pr, pc = best[1], best[2]; water.append([int(x0 + pc * R), int(y0 + pr * R)])
water = [v for p in water[::2] for v in p]

# ---------- 6. Senderos y camino ----------
def wander(px, py, ang, n, step=22.0):
    pts = [px, py]; a = ang
    for _ in range(n):
        a += rng.normal(0, 0.16); px += np.cos(a) * step; py += np.sin(a) * step
        if not (x0 < px < x1 and y0 < py < y1): break
        pts += [int(px), int(py)]
    return [int(v) for v in pts]
trails = []
for s_, a_ in [(1500, 2.4), (3300, -0.4), (4800, 3.4), (5700, 0.5), (7000, 1.2), (8300, -1.4)]:
    i = int(s_ / 10); trails.append(wander(rx[i], ry[i], a_, 60))
roads = []
for k_ in range(2):
    t = np.linspace(0, 1, 60); yy = y0 + 160 + k_ * 90 + 80 * np.sin(t * 5 + k_) ; xx = x0 + t * (x1 - x0)
    roads.append([int(v) for p in zip(xx, yy) for v in p])

# ---------- 7. Segmentos y etiquetas ----------
segs = [
  {'id': 1, 'n': 'Trepada de las Antenas', 'a': 6850, 'b': 7700, 'pr': 245, 'v': 3},
  {'id': 2, 'n': 'Sendero de la Cascada', 'a': 1700, 'b': 2900, 'pr': 310, 'v': 2},
  {'id': 3, 'n': 'La Bajada del Zorro', 'a': 4100, 'b': 4750, 'pr': 115, 'v': 5},
]
def at(s): i = int(s / 10); return int(rx[i]), int(ry[i])
labels = [
  {'t': 'Cumbre', 'k': 'p', 'x': at(7920)[0], 'y': at(7920)[1]},
  {'t': 'Mirador', 'k': 'p', 'x': at(5600)[0], 'y': at(5600)[1]},
  {'t': 'Arroyo Seco', 'k': 'w', 'x': water[len(water)//2 - (len(water)//2) % 2], 'y': water[len(water)//2 - (len(water)//2) % 2 + 1]},
  {'t': 'Quebrada del Tala', 'k': 'a', 'x': int(x0 + (x1 - x0) * 0.2), 'y': int(y0 + (y1 - y0) * 0.78)},
  {'t': 'Cerro Pelado', 'k': 'a', 'x': int(x0 + (x1 - x0) * 0.72), 'y': int(y0 + (y1 - y0) * 0.25)},
  {'t': 'Camino vecinal', 'k': 'r', 'x': int(x0 + (x1 - x0) * 0.5), 'y': roads[0][31]},
]
geo = {
  'L': int(L), 'step': 10, 'bbox': [int(x0), int(y0), int(x1), int(y1)],
  'rx': [round(float(v), 1) for v in rx], 'ry': [round(float(v), 1) for v in ry], 're': [round(float(v), 1) for v in h],
  'contours': cont, 'veg': veg, 'water': water, 'trails': trails, 'roads': roads, 'segs': segs, 'labels': labels,
}
js = 'const GEO=' + json.dumps(geo, separators=(',', ':')) + ';\n'
open(OUT, 'w').write(js)
print('bytes', len(js), 'contornos', len(cont), 'veg', len(veg), 'agua pts', len(water)//2, file=sys.stderr)

# preview
if len(sys.argv) > 3:
    import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
    fig, ax = plt.subplots(figsize=(8, 8)); ax.set_facecolor('#0b1210')
    for c in cont:
        for p in c['p']:
            a = np.array(p).reshape(-1, 2); ax.plot(a[:,0], a[:,1], lw=0.9 if c['m'] else 0.3, c='#4d6b5f' if c['m'] else '#27382f')
    for p in veg:
        a = np.array(p).reshape(-1, 2); ax.fill(a[:,0], a[:,1], c='#16261f', alpha=.8)
    a = np.array(water).reshape(-1, 2); ax.plot(a[:,0], a[:,1], c='#2f6f9a', lw=1.5)
    for t in trails: a = np.array(t).reshape(-1, 2); ax.plot(a[:,0], a[:,1], c='#7a8a82', lw=0.8, ls='--')
    for t in roads: a = np.array(t).reshape(-1, 2); ax.plot(a[:,0], a[:,1], c='#a9b4ad', lw=1.4)
    g = np.array([grade(i) for i in range(len(S))])
    col = np.where(g < -2, '#4da8da', np.where(g <= 2, '#3ddc97', np.where(g <= 8, '#ffc53d', '#ff5c4d')))
    for i in range(len(S) - 1): ax.plot(rx[i:i+2], ry[i:i+2], c=col[i], lw=3)
    ax.set_aspect('equal'); ax.set_xticks([]); ax.set_yticks([]); fig.savefig(sys.argv[3], dpi=90, facecolor='#0b1210')
