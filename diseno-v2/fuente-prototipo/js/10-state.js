/* ============================================================
   Estado, ruta derivada, zonas, modelo físico (fórmulas tomadas de index.html), datos de demostración
   ============================================================ */
(function () {
  'use strict';
  const RT = window.RT, U = RT.U;

  /* ---------- zonas del semáforo (mismos umbrales que el código: <-2 bajada · ≤2 llano · 2–8 trepada · >8 pared) ---------- */
  RT.kindOf = (g) => (g > 8 ? 'PARED' : g > 2 ? 'TREPADA' : g < -2 ? 'BAJADA' : 'LLANO');
  RT.ZM = {
    PARED: { c: 'r', icon: 'dblUp', name: 'Pared' },
    TREPADA: { c: 'y', icon: 'trendUp', name: 'Trepada' },
    LLANO: { c: 'g', icon: 'equal', name: 'Llano' },
    BAJADA: { c: 'g', icon: 'trendDown', name: 'Bajada' }
  };
  RT.cssVar = (n) => getComputedStyle(document.body).getPropertyValue(n).trim();

  /* ---------- ruta sintética ---------- */
  const N = GEO.rx.length;
  const R = (RT.R = { N, L: GEO.L, x: GEO.rx, y: GEO.ry, e: GEO.re, bbox: GEO.bbox, g: new Float32Array(N), k: new Array(N), c: new Array(N), hd: new Float32Array(N) });
  for (let i = 0; i < N; i++) {
    const a = Math.max(0, i - 5), b = Math.min(N - 1, i + 5);
    R.g[i] = ((R.e[b] - R.e[a]) / ((b - a) * 10)) * 100;
    const a2 = Math.max(0, i - 2), b2 = Math.min(N - 1, i + 2);
    R.hd[i] = Math.atan2(R.y[b2] - R.y[a2], R.x[b2] - R.x[a2]);
    R.k[i] = RT.kindOf(R.g[i]); R.c[i] = RT.ZM[R.k[i]].c;
  }
  /** punto interpolado a la distancia s (m) */
  RT.at = (s) => {
    s = U.clamp(s, 0, R.L - 0.01); const i = Math.floor(s / 10), f = (s - i * 10) / 10, j = Math.min(N - 1, i + 1);
    return { i, x: U.lerp(R.x[i], R.x[j], f), y: U.lerp(R.y[i], R.y[j], f), e: U.lerp(R.e[i], R.e[j], f), g: U.lerp(R.g[i], R.g[j], f), hd: R.hd[i], c: R.c[i], k: R.k[i] };
  };
  /* tramos (runs) de igual color de semáforo, fusionando los menores a 80 m */
  const RUNS = (RT.RUNS = []);
  (function () {
    let cur = null;
    for (let i = 0; i < N; i++) { if (!cur || cur.c !== R.c[i]) { cur = { c: R.c[i], i0: i, i1: i }; RUNS.push(cur); } else cur.i1 = i; }
    let ch = true;
    while (ch) { ch = false; for (let j = 0; j < RUNS.length && RUNS.length > 1; j++) { const r = RUNS[j]; if (r.i1 - r.i0 < 8) { if (j > 0) RUNS[j - 1].i1 = r.i1; else RUNS[j + 1].i0 = r.i0; RUNS.splice(j, 1); ch = true; break; } } }
    for (let j = RUNS.length - 1; j > 0; j--) if (RUNS[j].c === RUNS[j - 1].c) { RUNS[j - 1].i1 = RUNS[j].i1; RUNS.splice(j, 1); }
    RUNS.forEach((r) => {
      r.s0 = r.i0 * 10; r.s1 = Math.min(R.L, (r.i1 + 1) * 10); r.len = r.s1 - r.s0;
      r.grade = ((R.e[Math.min(N - 1, r.i1 + 1)] - R.e[r.i0]) / r.len) * 100;
      let nb = 0, nl = 0; for (let i = r.i0; i <= r.i1; i++) { if (R.k[i] === 'BAJADA') nb++; else nl++; }
      r.kind = r.c === 'r' ? 'PARED' : r.c === 'y' ? 'TREPADA' : nb / (nb + nl) > 0.7 ? 'BAJADA' : nl / (nb + nl) > 0.7 ? 'LLANO' : 'MIXTO';
      r.name = r.kind === 'MIXTO' ? 'Llano y bajada' : RT.ZM[r.kind].name;
    });
  })();
  /** tramos por delante de s (relativos), recortados a la ventana h */
  RT.runsAhead = (s, h) => {
    const out = [];
    for (const r of RUNS) { if (r.s1 <= s || r.s0 >= s + h) continue; const a = Math.max(r.s0, s), b = Math.min(r.s1, s + h); out.push(Object.assign({}, r, { start: a - s, end: b - s, clen: b - a, full: r.len, clipped: r.s1 > s + h })); }
    return out;
  };
  RT.ascentTo = (s) => { let ref = R.e[0], tot = 0; for (let i = 0; i <= Math.floor(s / 10); i++) { const d = R.e[i] - ref; if (d >= 3) { tot += d; ref = R.e[i]; } else if (d <= -3) ref = R.e[i]; } return tot; };

  /* ---------- modelo físico: fórmulas de calcularPotenciaVirtual / calcularIF / calcularTSS del código ---------- */
  RT.rider = { mass: 85 };
  RT.powerEst = (kmh, g) => {
    if (kmh < 1.2) return 0;
    const v = kmh / 3.6, th = Math.atan(g / 100), m = RT.rider.mass;
    const p = (m * 9.81 * Math.sin(th) * v + 0.008 * m * 9.81 * Math.cos(th) * v + 0.5 * 1.205 * 0.45 * v * v * v) / 0.95;
    return Math.min(1800, Math.max(0, Math.round(p)));
  };
  RT.pzone = (w) => (w < 100 ? 1 : w <= 170 ? 2 : w <= 220 ? 3 : w <= 275 ? 4 : w <= 340 ? 5 : 6);
  RT.PZN = ['', 'Recuperación activa', 'Fondo aeróbico', 'Tempo', 'Umbral', 'VO2 máx', 'Anaeróbico'];
  RT.calcIF = (z1, z2, z3) => { const t = z1 + z2 + z3; return t ? (z1 * 0.65 + z2 * 0.85 + z3 * 1.15) / t : 0.7; };
  RT.calcTSS = (sec, z1, z2, z3) => (sec / 3600) * Math.pow(RT.calcIF(z1, z2, z3), 2) * 100;
  RT.recovery = (tss) => Math.min(48, Math.max(12, Math.round(tss * 0.4)));
  RT.nutri = (kcal, sec, asc) => { const carbs = Math.max(30, Math.round((kcal * 0.5) / 4)); return { carbs, fluid: Math.max(400, Math.round((sec / 3600) * 650 + asc * 0.4)), fast: Math.round(carbs * 0.4) }; };
  /** velocidad objetivo según modo (misma tabla que calcularVelocidadTarget) */
  RT.targetFor = (modo, g, ataque) => {
    if (modo === 'FONDO') return g < -3 ? 34 : g < 0 ? 26 : g <= 2 ? 23 : g <= 5 ? 15.5 : 10;
    if (modo === 'HIIT') return ataque ? (g > 3 ? 18 : 32) : 16;
    if (modo === 'ESCALADA') return g >= 6 ? 9.5 : g >= 3 ? 13 : 20;
    if (modo === 'UMBRAL') return g <= 2 ? 27 : g <= 5 ? 18 : 12;
    if (modo === 'RECUPERACION') return g < 0 ? 22 : 16;
    return g < -3 ? 32 : g <= 2 ? 21 : 12;
  };
  /** velocidad "de pedaleo" simulada según pendiente (tabla de la demo, no del código) */
  const TT = [[-10, 34], [-6, 30], [-3, 25], [0, 20], [2, 17.5], [4, 15.5], [6, 13.8], [8, 11.5], [11, 8], [14, 6], [20, 4.5]];
  RT.simSpeed = (g) => { if (g <= TT[0][0]) return TT[0][1]; for (let i = 1; i < TT.length; i++) if (g <= TT[i][0]) { const t = (g - TT[i - 1][0]) / (TT[i][0] - TT[i - 1][0]); return U.lerp(TT[i - 1][1], TT[i][1], t); } return TT[TT.length - 1][1]; };

  RT.MODES = {
    LIBRE: { n: 'Libre', t: 'Rodaje libre (paseo / exploración)', b: 'Métricas abiertas', d: 'Salida sin alarmas de zona ni metas rígidas. Registra todas tus métricas a tu propio ritmo en las 6 zonas fisiológicas.' },
    FONDO: { n: 'Fondo Z2', t: 'Resistencia aeróbica (Zona 2)', b: 'Target: Z2 · 100–170 W', d: 'Pedaleo constante y conversable. El radar te avisa si te pasás de Zona 2 en las trepadas.' },
    HIIT: { n: 'Series HIIT', t: 'Intervalos de alta intensidad', b: 'Target: Z5 en ataque · Z1 en pausa', d: '5 series de ataque con descanso activo. Elegí la intensidad de ataque (Z4, Z5 o Z6+).' },
    ESCALADA: { n: 'Escalada (+D)', t: 'Trabajo de subida y fuerza', b: 'Target: Z3–Z4 en trepada', d: 'Bloques de trepada con cadencia estable. El radar prioriza avisos de pared y cambios de plato.' },
    UMBRAL: { n: 'Ritmo Umbral', t: 'Ritmo sostenido en el umbral', b: 'Target: Z4 · 221–275 W', d: 'Esfuerzo sostenido cerca del FTP. Ideal para tramos largos y parejos.' },
    RECUPERACION: { n: 'Regenerativo', t: 'Recuperación y soltura', b: 'Target: Z1 · < 100 W', d: 'Pedaleo suave para soltar piernas. Sin exigencias de ritmo.' }
  };
  RT.PLANS = {
    ESCALADA: { n: 'Escalada y potencia (+D)', short: 'Escalada (+D)', ic: 'mountain', d: 'Subidas duras, fuerza y cadencia en trepada.', ph: [['Calentamiento', 10, 'Calentamiento suave en plato chico. Prepará las piernas a 85–90 rpm sin sobreexigir.'], ['Bloque de ascenso (+D)', 35, 'Bloque de trepada en Zona 3. Buscá cuestas, mantené tracción y apretá con firmeza.'], ['Enfriamiento', 10, 'Enfriamiento y soltura. Bajá pulsaciones en piñón liviano y respirá hondo.']] },
    FONDO: { n: 'Resistencia y fondo (Zona 2)', short: 'Fondo (Zona 2)', ic: 'timer', d: 'Resistencia aeróbica y control de pulsaciones.', ph: [['Calentamiento aeróbico', 15, 'Calentamiento progresivo para elevar temperatura muscular sin generar fatiga.'], ['Ritmo crucero (Z2)', 60, 'Mantenete en Zona 2 constante. Respiración nasal controlada, podés conversar sin agitarte.'], ['Enfriamiento', 15, 'Enfriamiento paulatino e hidratación constante a sorbos cortos.']] },
    HIIT: { n: 'Intervalos HIIT y potencia', short: 'Intervalos HIIT', ic: 'zap', d: '5 series de ataque y potencia anaeróbica.', ph: [['Activación y piques', 10, 'Calentamiento activo con 2 aceleraciones cortas de 15 segundos.'], ['Series de ataque HIIT', 25, 'Aceleraciones a máxima potencia alternadas con pedaleo suave.'], ['Regenerativo', 10, 'Vuelta a la calma muy suave para drenar el ácido láctico.']] },
    RECUPERACION: { n: 'Regenerativo y soltura', short: 'Recuperación', ic: 'leaf', d: 'Pedaleo suave para soltar piernas.', ph: [['Inicio suave', 10, 'Pedaleo muy liviano en terreno plano. Cero tensión en rodillas.'], ['Rodaje Zona 1', 25, 'Zona 1 continua. Relajá hombros, cuello y soltá los brazos en el manubrio.'], ['Soltura final', 10, 'Cierre de sesión suave y respiración profunda.']] }
  };

  /* ---------- valores del boceto (escenario "Boceto") ---------- */
  RT.FROZEN = { v: 14.2, g: 6.2, p: 212, s: 6820, t: 2538, asc: 312, kcal: 486, alert: { c: 'r', dist: 400, title: 'Pared 11 % durante 300 m', sub: 'Bajá a plato chico y subí la cadencia' } };

  /* ---------- estado vivo ---------- */
  RT.S = {
    tab: 'radar', view: 'mapa',
    rec: 'rec', playing: false, simK: 5, frozen: true, done: false,
    s: 6820, t: 2538, v: 14.2, p: 212, kcal: 486, ascOff: 0, asc: 312, altRef: null, maxV: 31.4, maxG: 11.4, maxGs: 7380,
    zt: { g: 1250, y: 1160, r: 128 }, pz: [0, 140, 880, 1030, 410, 78, 0],
    gps: 'ok', acc: 5, lastFix: { t: Date.now(), acc: 5 }, lostAt: null,
    net: 'online', tiles: 'ok', battery: 84,
    voice: false, solar: false, locked: false, vehicle: false,
    routeLoaded: true, mode: 'LIBRE', hiit: { on: false, serie: 1, fase: 'ESPERA', t: 60, zona: 5 },
    plan: null, planT: 0,
    ghost: { on: false, kmh: 20, mode: 'ritmo', s: 0, name: 'Ritmo fijo 20 km/h' },
    squad: { on: false, connected: false, demo: false, name: 'Juan MTB', room: 'CERRO-YUNGA' },
    seg: null, segDone: [],
    follow: true, headUp: true, zoomAuto: true, mpp: 3.4, cx: 0, cy: 0, trackback: false,
    dock: 'full', alertMin: false, layersOpen: false,
    odo: { km: 0, kmCad: 0, dCad: 0, kmFre: 0, dFre: 0, kmCub: 0 },
    checks: [true, true, true, true],
    silca: { peso: 78, ancho: '2.25', sistema: 'tubeless', terreno: 'seco' },
    bikefit: { flex: 60, ext: 120, fecha: 'Oct 2026' },
    segs: GEO.segs.map((g) => ({ id: g.id, n: g.n, a: g.a, b: g.b, dist: g.b - g.a, pr: g.pr, v: g.v })),
    coach: null,
    nube: { estado: 'offline-first', test: null },
    pendSync: 2
  };
  { const p = RT.at(RT.S.s); RT.S.cx = p.x; RT.S.cy = p.y; RT.S.altRef = p.e; RT.S.ascOff = RT.S.asc - RT.ascentTo(RT.S.s); }

  /* ---------- configuración "Tweaks" (persistente) ---------- */
  RT.CFG0 = {
    pal: 'verde', zones: 'std', contrast: 'normal', font: 'barlow', num: 1, tx: 1, rad: 18, sp: 'normal', bw: 1, tex: 'none', glow: 'off', nav: 'bar',
    view: 'mapa', dock: 'compact', mapStyle: 'auto', routeColor: 'semaforo', trailW: 6, offlineMap: 'ok',
    lyRoute: true, lyKm: true, lySegs: true, lyContours: true, lyLabels: true,
    frame: 'on', dev: '390x844', an: 'off', props: 'on'
  };
  RT.cfg = Object.assign({}, RT.CFG0, U.store.get('rtv2_cfg', {}));
  RT.setCfg = (k, v, silent) => { RT.cfg[k] = v; U.store.set('rtv2_cfg', RT.cfg); if (!silent) RT.emit('cfg', { k, v }); };

  /* ---------- historial de demostración (coincide con el boceto: 9 salidas · 186 km · +4.320 m) ---------- */
  const mk = (id, d, tit, km, asc, dur, extra) => Object.assign({ id, fecha: d, titulo: tit, dist: km, asc, dur, tipo: 'CICLISMO', sync: true, end: 'full' }, extra || {});
  RT.ACTS = [
    mk('a9', '2026-10-12', 'Trepada a Villa Nougués', 24.6, 612, 6480, { vavg: 13.6, vmax: 41.2, pavg: 168, ppk: 392, alt: 1214, tss: 84, if: 0.71, rec: 24, z: [38, 52, 14], wall: [12.4, 7.3], pr: 0, kcal: 1120, carbs: 85, fluid: 900, demo: true }),
    mk('a8', '2026-10-08', 'Fondo por las yungas', 31.2, 540, 8460, { sync: false, vavg: 13.3, vmax: 38.4, pavg: 152, ppk: 340, alt: 1090, z: [88, 44, 9], wall: [9.8, 11.2], pr: 1 }),
    mk('a7', '2026-10-05', 'Intervalos en el cerro', 12.4, 320, 3480, { sync: false, vavg: 12.8, vmax: 35.1, pavg: 201, ppk: 520, alt: 960, z: [20, 28, 10], wall: [13.1, 3.4], pr: 0 }),
    mk('a6', '2026-09-28', 'Sendero de la Cascada', 18.9, 410, 5520, { vavg: 12.4, vmax: 33.6, pavg: 158, ppk: 360, alt: 1010, z: [52, 34, 6], wall: [10.6, 8.1], pr: 2 }),
    mk('a5', '2026-09-21', 'Rodaje en la Loma', 21.4, 640, 6180, { vavg: 12.9, vmax: 36.0, pavg: 171, ppk: 380, alt: 1120, z: [45, 48, 10], wall: [11.2, 6.0], pr: 0 }),
    mk('a4', '2026-09-14', 'Cumbre del Pelado', 27.8, 712, 7620, { vavg: 13.1, vmax: 39.8, pavg: 176, ppk: 410, alt: 1290, z: [58, 55, 14], wall: [12.9, 14.2], pr: 1 }),
    mk('a3', '2026-09-07', 'Fondo Z2 por el río', 19.6, 480, 5400, { vavg: 13.0, vmax: 31.2, pavg: 148, ppk: 300, alt: 940, z: [48, 38, 4], wall: [8.8, 5.2], pr: 0 }),
    mk('a2', '2026-08-31', 'Vuelta del dique', 16.3, 330, 4560, { vavg: 12.9, vmax: 29.4, pavg: 140, ppk: 280, alt: 880, z: [46, 26, 4], wall: [8.2, 9.4], pr: 0 }),
    mk('a1', '2026-08-24', 'Primer reconocimiento', 13.8, 276, 4020, { vavg: 12.4, vmax: 27.8, pavg: 135, ppk: 270, alt: 850, z: [42, 21, 4], wall: [7.9, 4.1], pr: 0 })
  ];
  RT.ACTS.forEach((a) => {
    if (a.tss == null) { const sec = a.dur, z = a.z.map((m) => m * 60); a.if = RT.calcIF(z[0], z[1], z[2]); a.tss = Math.round(RT.calcTSS(sec, z[0], z[1], z[2])); a.rec = RT.recovery(a.tss); a.kcal = Math.round(a.pavg * a.dur / 1000); const n = RT.nutri(a.kcal, a.dur, a.asc); a.carbs = n.carbs; a.fluid = n.fluid; }
  });
  RT.actSel = 'a9';
  RT.fmtDate = (iso) => { const d = new Date(iso + 'T12:00:00'); return { d: d.getDate(), w: ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'][d.getDay()], m: ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'][d.getMonth()], full: d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' }) }; };

  /* ---------- GPX (para descargar de verdad) ---------- */
  RT.gpx = (title, sEnd, t0) => {
    const lat0 = -26.815, lon0 = -65.31, mlat = 111320, mlon = 111320 * Math.cos((lat0 * Math.PI) / 180);
    const n = Math.floor(sEnd / 10); let pts = '', t = t0 || Date.parse('2026-10-12T08:30:00-03:00');
    for (let i = 0; i <= n; i++) { pts += `      <trkpt lat="${(lat0 + (R.y[i] - 800) / mlat).toFixed(6)}" lon="${(lon0 + (R.x[i] - 500) / mlon).toFixed(6)}"><ele>${R.e[i].toFixed(1)}</ele><time>${new Date(t).toISOString()}</time></trkpt>\n`; t += 2600; }
    return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Radar Táctico MTB · prototipo V2" xmlns="http://www.topografix.com/GPX/1/1">\n  <metadata><name>${U.esc(title)}</name><desc>Traza SINTÉTICA de demostración (no es una ubicación real)</desc></metadata>\n  <trk><name>${U.esc(title)}</name><trkseg>\n${pts}  </trkseg></trk>\n</gpx>\n`;
  };
})();
