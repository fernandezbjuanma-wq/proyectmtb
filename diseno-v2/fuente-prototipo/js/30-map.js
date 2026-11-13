/* ============================================================
   Mapa del recorrido (canvas 2D, 100 % sin conexión)
   - Base sintética: curvas de nivel, vegetación, arroyo, senderos, camino
   - Traza grabada coloreada por semáforo, ruta GPX por delante, pared marcada, segmentos, liebre, escuadrón
   ============================================================ */
(function () {
  'use strict';
  const RT = window.RT, U = RT.U, S = RT.S, R = RT.R;

  const STYLES = {
    tactico: { bg: '#0a110f', veg: '#0f1d17', water: '#1f567a', cont: '#1a2a24', contM: '#2c463b', trail: '#4a5c53', road: '#5d7268', roadC: '#0a110f', label: '#86a094', labelW: '#5c9cc4', halo: '#0a110f', grid: '#12201b' },
    topo: { bg: '#eee8d4', veg: '#dbe4bf', water: '#9ccae4', cont: '#dccaa8', contM: '#b8925f', trail: '#8b6a43', road: '#fffdf6', roadC: '#b3a584', label: '#5a4630', labelW: '#2a6b92', halo: '#eee8d4', grid: '#e3dcc6' },
    sat: { bg: '#1c2a1a', veg: '#12200f', water: '#1d4660', cont: 'rgba(255,255,255,.06)', contM: 'rgba(255,255,255,.12)', trail: 'rgba(235,225,200,.55)', road: 'rgba(230,222,200,.75)', roadC: 'rgba(0,0,0,.35)', label: '#e6ecdd', labelW: '#9fd0ee', halo: 'rgba(0,0,0,.65)', grid: 'transparent' },
    solar: { bg: '#f5f5ef', veg: '#e0e9d4', water: '#b4d5e8', cont: '#d8d8cc', contM: '#a6a696', trail: '#6c6c5e', road: '#ffffff', roadC: '#95958a', label: '#22221c', labelW: '#1c6fa6', halo: '#f5f5ef', grid: '#e9e9e0' }
  };
  RT.mapStyleName = () => (RT.cfg.mapStyle === 'auto' ? (RT.cfg.pal === 'sol' ? 'solar' : 'tactico') : RT.cfg.mapStyle);

  /* geometrías base (Path2D en coordenadas del mundo, metros) */
  const P = {};
  const poly = (arr, close) => { const p = new Path2D(); for (let i = 0; i < arr.length; i += 2) { if (i === 0) p.moveTo(arr[i], arr[i + 1]); else p.lineTo(arr[i], arr[i + 1]); } if (close) p.closePath(); return p; };
  P.minor = new Path2D(); P.major = new Path2D(); P.veg = new Path2D(); P.trails = new Path2D(); P.roads = new Path2D();
  GEO.contours.forEach((c) => c.p.forEach((a) => (c.m ? P.major : P.minor).addPath(poly(a, false))));
  GEO.veg.forEach((a) => P.veg.addPath(poly(a, true)));
  GEO.trails.forEach((a) => P.trails.addPath(poly(a, false)));
  GEO.roads.forEach((a) => P.roads.addPath(poly(a, false)));
  P.water = poly(GEO.water, false);
  let satPat = null;
  const satTile = () => {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const rn = U.rng(11);
    for (let y = 0; y < 128; y += 2) for (let x = 0; x < 128; x += 2) { const v = rn(), h = 95 + v * 28, l = 17 + rn() * 11; g.fillStyle = `hsl(${h},32%,${l}%)`; g.fillRect(x, y, 2, 2); }
    return c;
  };

  const speedColor = (g) => { const v = RT.simSpeed(g); const t = U.clamp((v - 5) / 26, 0, 1); return `hsl(${210 - t * 120},85%,${52 + t * 6}%)`; };
  const zoneCol = (c) => RT.cssVar('--' + c) || '#3ddc97';

  RT.maps = [];
  RT.dropMap = (m) => { const i = RT.maps.indexOf(m); if (i >= 0) RT.maps.splice(i, 1); };
  class RMap {
    constructor(cv, o) {
      this.cv = cv; this.ctx = cv.getContext('2d'); this.o = o || {};
      this.cam = this.o.mini || this.o.lab ? { cx: S.cx, cy: S.cy, mpp: this.o.mpp || 5, follow: true, headUp: false } : S;
      this.w = 300; this.h = 200; this.k = 1; this.lastMpp = 0;
      RT.maps.push(this);
      if (this.o.interactive) this.bind();
      if (window.ResizeObserver) new ResizeObserver(() => { this.resize(); this.draw(); }).observe(cv);
    }
    resize() {
      const w = this.cv.clientWidth, h = this.cv.clientHeight; if (!w || !h) return;
      const k = Math.min(3, (window.devicePixelRatio || 1) * (RT.fit || 1));
      this.w = w; this.h = h; this.k = k; this.cv.width = Math.round(w * k); this.cv.height = Math.round(h * k);
    }
    /* cámara */
    rider() { return RT.at(this.o.lab ? (this.o.sEnd ? this.o.sEnd() : R.L) : S.s); }
    camera() {
      const cam = this.cam, r = this.rider(); let cx, cy, ax = this.w / 2, ay = this.h / 2, mpp = cam.mpp, rot = 0;
      if (this.o.lab) {
        const sEnd = this.o.sEnd ? this.o.sEnd() : R.L, n = Math.floor(sEnd / 10); let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
        for (let i = 0; i <= n; i++) { x0 = Math.min(x0, R.x[i]); x1 = Math.max(x1, R.x[i]); y0 = Math.min(y0, R.y[i]); y1 = Math.max(y1, R.y[i]); }
        cx = (x0 + x1) / 2; cy = (y0 + y1) / 2; mpp = Math.max((x1 - x0 + 160) / this.w, (y1 - y0 + 160) / this.h); return { cx, cy, ax, ay, mpp, rot };
      }
      const hu = this.o.mini ? S.headUp : cam.headUp;
      if (cam.follow) { cx = r.x; cy = r.y; ay = this.o.mini ? this.h * 0.66 : this.h * 0.7; if (hu) rot = Math.PI / 2 - r.hd; }
      else { cx = cam.cx; cy = cam.cy; if (hu) rot = Math.PI / 2 - r.hd; }
      return { cx, cy, ax, ay, mpp, rot };
    }
    w2s(x, y) { const c = this.c, dx = x - c.cx, dy = y - c.cy, co = Math.cos(c.rot), si = Math.sin(c.rot); return [c.ax + (dx * co - dy * si) / c.mpp, c.ay - (dx * si + dy * co) / c.mpp]; }
    s2w(px, py) { const c = this.c, rx = (px - c.ax) * c.mpp, ry = -(py - c.ay) * c.mpp, co = Math.cos(-c.rot), si = Math.sin(-c.rot); return [c.cx + rx * co - ry * si, c.cy + rx * si + ry * co]; }

    draw() {
      const cv = this.cv; if (!cv.offsetParent && !this.o.force) return; if (!this.w || cv.width < 4) { this.resize(); if (cv.width < 4) return; }
      const ctx = this.ctx, k = this.k, st = STYLES[RT.mapStyleName()], c = (this.c = this.camera()), mini = this.o.mini, lab = this.o.lab;
      const noTiles = !mini && !lab && S.net === 'offline' && S.tiles === 'none';
      ctx.setTransform(k, 0, 0, k, 0, 0); ctx.fillStyle = st.bg; ctx.fillRect(0, 0, this.w, this.h);
      if (RT.mapStyleName() === 'sat' && !noTiles) { satPat = satPat || ctx.createPattern(satTile(), 'repeat'); ctx.fillStyle = satPat; ctx.fillRect(0, 0, this.w, this.h); }
      const px = c.mpp; // 1 px en metros
      /* ---- mundo ---- */
      ctx.save(); ctx.translate(c.ax, c.ay); ctx.scale(1 / c.mpp, -1 / c.mpp); ctx.rotate(c.rot); ctx.translate(-c.cx, -c.cy);
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      if (noTiles) {
        ctx.strokeStyle = st.grid; ctx.lineWidth = px; ctx.beginPath(); const gs = 200, x0 = Math.floor((c.cx - 2000) / gs) * gs, y0 = Math.floor((c.cy - 2000) / gs) * gs;
        for (let x = x0; x < c.cx + 2000; x += gs) { ctx.moveTo(x, y0); ctx.lineTo(x, c.cy + 2000); } for (let y = y0; y < c.cy + 2000; y += gs) { ctx.moveTo(x0, y); ctx.lineTo(c.cx + 2000, y); } ctx.stroke();
      } else {
        ctx.fillStyle = st.veg; ctx.globalAlpha = RT.mapStyleName() === 'sat' ? 0.55 : 1; ctx.fill(P.veg); ctx.globalAlpha = 1;
        if (RT.cfg.lyContours || mini) { ctx.strokeStyle = st.cont; ctx.lineWidth = 0.9 * px; ctx.stroke(P.minor); ctx.strokeStyle = st.contM; ctx.lineWidth = 1.3 * px; ctx.stroke(P.major); }
        ctx.strokeStyle = st.water; ctx.lineWidth = 3 * px; ctx.stroke(P.water);
        ctx.setLineDash([5 * px, 4 * px]); ctx.strokeStyle = st.trail; ctx.lineWidth = 1.6 * px; ctx.stroke(P.trails); ctx.setLineDash([]);
        ctx.strokeStyle = st.roadC; ctx.lineWidth = 6 * px; ctx.stroke(P.roads); ctx.strokeStyle = st.road; ctx.lineWidth = 3.6 * px; ctx.stroke(P.roads);
      }
      const sNow = lab ? (this.o.sEnd ? this.o.sEnd() : R.L) : S.s, iNow = Math.min(R.N - 1, Math.floor(sNow / 10)), i0 = Math.floor((lab ? (this.o.s0 || 0) : (S.s0 || 0)) / 10);
      const tw = (RT.cfg.trailW || 6) * (mini ? 0.7 : 1) * px, mode = RT.cfg.routeColor;
      const colOf = (i) => (mode === 'mono' ? zoneCol('acc') : mode === 'velocidad' ? speedColor(R.g[i]) : zoneCol(R.c[i]));
      const strokeRange = (a, b, w, alpha, colFn, dash) => { // agrupa tramos del mismo color
        ctx.globalAlpha = alpha; ctx.lineWidth = w; if (dash) ctx.setLineDash(dash);
        let cur = null, started = false;
        for (let i = a; i < b; i++) { const col = colFn(i); if (col !== cur) { if (started) ctx.stroke(); ctx.beginPath(); ctx.strokeStyle = col; ctx.moveTo(R.x[i], R.y[i]); cur = col; started = true; } ctx.lineTo(R.x[i + 1], R.y[i + 1]); }
        if (started) ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      };
      const showRoute = (S.routeLoaded && RT.cfg.lyRoute) || lab;
      if (showRoute && !lab) { // ruta por delante
        ctx.beginPath(); ctx.moveTo(R.x[iNow], R.y[iNow]); for (let i = iNow + 1; i < R.N; i++) ctx.lineTo(R.x[i], R.y[i]);
        ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = tw + 4 * px; ctx.stroke();
        strokeRange(iNow, R.N - 1, tw * 0.86, 0.95, colOf);
        ctx.setLineDash([2 * px, 9 * px]); ctx.beginPath(); ctx.moveTo(R.x[iNow], R.y[iNow]); for (let i = iNow + 1; i < R.N; i++) ctx.lineTo(R.x[i], R.y[i]); ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1.6 * px; ctx.stroke(); ctx.setLineDash([]);
      }
      if (lab && this.o.ghostFull) { /* nada: la traza completa se dibuja abajo */ }
      // traza grabada
      if (iNow > i0 || lab) {
        ctx.beginPath(); ctx.moveTo(R.x[i0], R.y[i0]); for (let i = i0 + 1; i <= iNow; i++) ctx.lineTo(R.x[i], R.y[i]);
        const q = RT.at(sNow); ctx.lineTo(q.x, q.y); ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = tw + 5 * px; ctx.stroke();
        strokeRange(i0, iNow, tw, 1, colOf);
        ctx.beginPath(); ctx.moveTo(R.x[iNow], R.y[iNow]); ctx.lineTo(q.x, q.y); ctx.strokeStyle = colOf(iNow); ctx.lineWidth = tw; ctx.stroke();
      }
      // volver al inicio (por la misma huella, NO es una ruta calculada)
      if (S.trackback && !lab) { ctx.beginPath(); ctx.moveTo(RT.at(sNow).x, RT.at(sNow).y); for (let i = iNow; i >= i0; i--) ctx.lineTo(R.x[i], R.y[i]); ctx.setLineDash([9 * px, 6 * px]); ctx.strokeStyle = '#4fd8f0'; ctx.lineWidth = 3.4 * px; ctx.stroke(); ctx.setLineDash([]); }
      ctx.restore();

      /* ---- sprites en pantalla ---- */
      ctx.setTransform(k, 0, 0, k, 0, 0); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const fnt = (sz, w) => `${w || 600} ${sz}px ${RT.cssVar('--font-b') || 'Barlow'}`;
      const halo = (txt, x, y, col, sz) => { ctx.font = fnt(sz, 700); ctx.lineWidth = 3.2; ctx.strokeStyle = st.halo; ctx.strokeText(txt, x, y); ctx.fillStyle = col; ctx.fillText(txt, x, y); };
      const inView = (x, y, m) => x > -m && x < this.w + m && y > -m && y < this.h + m;
      const disc = (x, y, r, fill, ring, rw) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fillStyle = fill; ctx.fill(); if (ring) { ctx.lineWidth = rw || 2; ctx.strokeStyle = ring; ctx.stroke(); } };
      const pin = (x, y, col, txt, ink) => { ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x - 4, y - 8, x - 11, y - 12, x - 11, y - 19); ctx.arc(x, y - 19, 11, Math.PI, 0); ctx.bezierCurveTo(x + 11, y - 12, x + 4, y - 8, x, y); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.stroke(); if (txt) { ctx.font = fnt(11, 800); ctx.fillStyle = ink || '#fff'; ctx.fillText(txt, x, y - 19); } };
      const pill = (txt, x, y, bg, fg) => { ctx.font = fnt(11.5, 800); const w = ctx.measureText(txt).width + 14; let rx = U.clamp(x, w / 2 + 6, this.w - w / 2 - 6), ry = U.clamp(y, 14, this.h - 14); ctx.beginPath(); ctx.roundRect ? ctx.roundRect(rx - w / 2, ry - 10, w, 20, 10) : ctx.rect(rx - w / 2, ry - 10, w, 20); ctx.fillStyle = bg; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.stroke(); ctx.fillStyle = fg; ctx.fillText(txt, rx, ry + 0.5); };
      if (!noTiles && RT.cfg.lyLabels && !mini && c.mpp < 8) GEO.labels.forEach((l) => { const [x, y] = this.w2s(l.x, l.y); if (inView(x, y, 0)) halo(l.t, x, y, l.k === 'w' ? st.labelW : st.label, l.k === 'a' ? 12.5 : 11); });
      if (RT.cfg.lyKm && !mini && c.mpp < 9 && !noTiles) for (let km = 1; km * 1000 < R.L; km++) { const q = RT.at(km * 1000), [x, y] = this.w2s(q.x, q.y); if (inView(x, y, 10)) { disc(x, y, 8.5, 'rgba(8,12,11,.85)', 'rgba(255,255,255,.55)', 1.2); ctx.font = fnt(10, 800); ctx.fillStyle = '#fff'; ctx.fillText(km, x, y + 0.5); } }
      if (S.routeLoaded || lab) { const a = this.w2s(R.x[0], R.y[0]); if (inView(a[0], a[1], 20)) { disc(a[0], a[1], 8, '#fff', '#0b1311', 2.5); disc(a[0], a[1], 3, '#0b1311'); } if (!lab) { const b = this.w2s(R.x[R.N - 1], R.y[R.N - 1]); if (inView(b[0], b[1], 20)) pin(b[0], b[1], '#fff', '⚑', '#0b1311'); } }
      if (RT.cfg.lySegs && !mini && S.routeLoaded && c.mpp < 7) S.segs.forEach((g) => { const A = RT.at(g.a), B = RT.at(g.b), a = this.w2s(A.x, A.y), b = this.w2s(B.x, B.y); [a, b].forEach((p, j) => { if (inView(p[0], p[1], 10)) { disc(p[0], p[1], 6.5, j ? '#fff' : '#b794ff', '#0b1311', 2); } }); const rp = this.w2s(RT.at(S.s).x, RT.at(S.s).y); if (inView(a[0], a[1], 0) && c.mpp < 4.2 && Math.hypot(a[0] - rp[0], a[1] - rp[1]) > 60) halo(g.n, a[0], a[1] - 14, '#c7b0ff', 10.5); });
      if (!lab && S.routeLoaded) { // pared por delante
        const wl = RT.runsAhead(S.s, 2000).find((r) => r.c === 'r' && r.start > 0.5);
        if (wl) { const q = RT.at(wl.s0), [x, y] = this.w2s(q.x, q.y), fz = S.frozen ? 400 : wl.start; pin(x, y, zoneCol('r'), '!', RT.cssVar('--r-ink') || '#fff'); if (!mini) pill(`PARED ${U.num(wl.grade, 0)} % · ${U.distTxt(fz)}`, x, y - 46, zoneCol('r'), RT.cssVar('--r-ink') || '#fff'); }
      }
      if (!lab && S.ghost.on && !mini) { const q = RT.at(S.ghost.s), [x, y] = this.w2s(q.x, q.y); disc(x, y, 11, '#b794ff', '#fff', 2); ctx.font = fnt(13, 800); ctx.fillStyle = '#1c0d3a'; ctx.fillText('👻'.length ? 'L' : 'L', x, y + 0.5); halo('liebre', x, y + 21, '#d4c2ff', 10.5); }
      if (!lab) RT.squadNow().forEach((m) => { const q = RT.at(m.s), [x, y] = this.w2s(q.x, q.y); if (mini && !inView(x, y, 0)) return; disc(x, y, 11, '#4da8da', '#fff', 2); ctx.font = fnt(12, 800); ctx.fillStyle = '#03121c'; ctx.fillText(m.k, x, y + 0.5); if (!mini) halo(`${m.n} · ${U.num(m.kmh, 0)}`, x, y + 22, '#a6d6f0', 10.5); });
      if (lab && this.o.scrub) { const sc = this.o.scrub(); if (sc != null) { const q = RT.at(sc), [x, y] = this.w2s(q.x, q.y); disc(x, y, 13, 'rgba(255,255,255,.25)'); disc(x, y, 7.5, '#fff', zoneCol(q.c), 3); } }
      /* ---- ciclista ---- */
      if (!lab) {
        const q = RT.at(sNow), [x, y] = this.w2s(q.x, q.y), lost = S.gps === 'lost', search = S.gps === 'search', wk = S.gps === 'weak', col = lost ? '#8a9a93' : search ? '#d9b23a' : zoneCol('acc');
        const racc = U.clamp((S.acc || 5) / c.mpp, 14, 70);
        if (!search) { ctx.beginPath(); ctx.arc(x, y, racc, 0, 6.2832); ctx.fillStyle = wk ? 'rgba(255,197,61,.14)' : 'rgba(61,220,151,.12)'; if (lost) ctx.fillStyle = 'rgba(138,154,147,.10)'; ctx.fill(); ctx.lineWidth = 1.3; ctx.setLineDash(wk || lost ? [4, 4] : []); ctx.strokeStyle = wk ? 'rgba(255,197,61,.7)' : lost ? 'rgba(138,154,147,.7)' : 'rgba(61,220,151,.5)'; ctx.stroke(); ctx.setLineDash([]); }
        if (!lost && !search && (S.rec === 'rec') && sNow < R.L - 1) { const a = q.hd + c.rot - Math.PI / 2 * 0; const ang = -(q.hd + c.rot) + Math.PI / 2 * 0; const th = Math.PI / 2 - (q.hd + c.rot) - Math.PI / 2; ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 2 - (q.hd + c.rot)); ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 34, -Math.PI / 2 - 0.55, -Math.PI / 2 + 0.55); ctx.closePath(); const gr = ctx.createRadialGradient(0, 0, 4, 0, 0, 34); gr.addColorStop(0, 'rgba(61,220,151,.6)'); gr.addColorStop(1, 'rgba(61,220,151,0)'); ctx.fillStyle = gr; ctx.fill(); ctx.restore(); }
        disc(x, y, 11.5, '#fff'); disc(x, y, 8.2, col, 'rgba(0,0,0,.35)', 1.2);
        if (lost) { halo('última posición', x, y + 26, '#c9d6cf', 10.5); }
      }
      /* ---- rosa de los vientos mínima ---- */
      if (!mini && !lab && c.rot) { ctx.save(); ctx.translate(this.w - 30, 120); ctx.rotate(c.rot); ctx.fillStyle = zoneCol('r'); ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(5, 3); ctx.lineTo(-5, 3); ctx.fill(); ctx.restore(); }
      if (this.o.after) this.o.after(this);
    }

    /* interacción (mapa principal): arrastrar, pellizcar, rueda, doble toque */
    bind() {
      const cv = this.cv, ptrs = new Map(); let d0 = 0, mpp0 = 0, moved = false;
      const fit = () => RT.fit || 1;
      const startFree = () => { if (S.follow) { const c = this.c; S.follow = false; S.cx = c.cx; S.cy = c.cy; RT.emit('follow'); } };
      cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); moved = false; if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; d0 = Math.hypot(a.x - b.x, a.y - b.y); mpp0 = S.mpp; } });
      cv.addEventListener('pointermove', (e) => {
        const p = ptrs.get(e.pointerId); if (!p) return;
        if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); if (d0) { S.zoomAuto = false; S.mpp = U.clamp(mpp0 * (d0 / d), 0.8, 16); this.draw(); } p.x = e.clientX; p.y = e.clientY; return; }
        const dx = (e.clientX - p.x) / fit(), dy = (e.clientY - p.y) / fit(); if (Math.abs(dx) + Math.abs(dy) < 0.5) return; moved = true; startFree();
        const c = this.c, co = Math.cos(c.rot), si = Math.sin(c.rot), wx = -dx * c.mpp, wy = dy * c.mpp; // inverso de la rotación
        S.cx += wx * co + wy * si; S.cy += -wx * si + wy * co; p.x = e.clientX; p.y = e.clientY; this.draw();
      });
      const up = (e) => { ptrs.delete(e.pointerId); if (ptrs.size < 2) d0 = 0; };
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
      cv.addEventListener('wheel', (e) => { e.preventDefault(); S.zoomAuto = false; S.mpp = U.clamp(S.mpp * (e.deltaY > 0 ? 1.18 : 0.85), 0.8, 16); RT.emit('zoom'); this.draw(); }, { passive: false });
      cv.addEventListener('dblclick', () => { S.zoomAuto = false; S.mpp = U.clamp(S.mpp * 0.6, 0.8, 16); RT.emit('zoom'); this.draw(); });
    }
  }
  RT.RMap = RMap;

  /* zoom automático según velocidad (suave) */
  RT.autoZoom = () => { if (!S.zoomAuto) return; const v = S.frozen ? RT.FROZEN.v : S.v, t = v < 10 ? 2.6 : v < 18 ? 3.4 : v < 26 ? 4.4 : 5.4; S.mpp += (t - S.mpp) * 0.08; };
  RT.zoomBy = (f) => { S.zoomAuto = false; S.mpp = U.clamp(S.mpp * f, 0.8, 16); RT.emit('zoom'); RT.drawAll(); };
  RT.fitRoute = () => { S.follow = false; S.cx = (R.bbox[0] + R.bbox[2]) / 2; S.cy = (R.bbox[1] + R.bbox[3]) / 2; S.mpp = 5.6; S.zoomAuto = false; S.headUp = false; RT.emit('follow'); RT.drawAll(); };
  RT.recenter = () => { S.follow = true; S.zoomAuto = true; RT.emit('follow'); RT.drawAll(); };
  RT.scaleBar = () => { const m = S.mpp * 64, pw = Math.pow(10, Math.floor(Math.log10(m))), n = [1, 2, 5, 10].find((v) => v * pw >= m * 0.55) || 10, len = n * pw; return { len, px: len / S.mpp, txt: len >= 1000 ? `${len / 1000} km` : `${len} m` }; };

  let raf = 0, dirty = true;
  RT.drawAll = () => { dirty = true; };
  RT.on('tick', () => { RT.autoZoom(); dirty = true; });
  RT.on('cfg', () => { dirty = true; });
  RT.on('scenario', () => { dirty = true; });
  RT.on('recenter', () => { dirty = true; });
  (function loop() { if (dirty) { dirty = false; RT.maps.forEach((m) => { try { m.draw(); } catch (e) { console.error('map', e); } }); } raf = requestAnimationFrame(loop); })();
})();
