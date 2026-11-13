/* ============================================================
   Simulación de la salida, estado de grabación, avisos del coach, escenarios
   ============================================================ */
(function () {
  'use strict';
  const RT = window.RT, U = RT.U, S = RT.S, R = RT.R, F = RT.FROZEN;
  S.s0 = 0; S.maxP = 388; S.maxAlt = 892;

  /* ---------- voz (Web Speech API del navegador; apagada por defecto) ---------- */
  RT.speak = (txt) => {
    if (!S.voice || !('speechSynthesis' in window)) return;
    try { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(txt); u.lang = 'es-AR'; u.rate = 1.05; window.speechSynthesis.speak(u); } catch (e) { /* sin voz */ }
  };

  /* ---------- aviso táctico ---------- */
  RT.alertFor = (ahead, cur, g) => {
    const wall = ahead.find((r) => r.c === 'r'), nxt = ahead.find((r) => r.start > 1 && r.c !== cur.c);
    const dTxt = (d) => U.distTxt(d).toUpperCase();
    if (cur.c === 'r') return { c: 'r', icon: 'warn', meta: 'EN LA PARED', title: `Pared ${U.num(Math.abs(cur.grade), 0)} % · quedan ${U.distTxt(cur.end)}`, sub: 'Plato chico, cadencia firme y no te pases de vatios.', dist: cur.end, dlbl: 'para salir' };
    if (wall && wall.start < 900) return { c: 'r', icon: 'warn', meta: `AVISO · EN ${dTxt(wall.start)}`, title: `Pared ${U.num(wall.grade, 0)} % durante ${U.distTxt(wall.full)}`, sub: 'Bajá a plato chico y subí la cadencia', dist: wall.start, dlbl: 'hasta la pared' };
    if (nxt && nxt.c === 'y' && nxt.start < 500) return { c: 'y', icon: 'trendUp', meta: `AVISO · EN ${dTxt(nxt.start)}`, title: `Trepada ${U.num(nxt.grade, 0)} % durante ${U.distTxt(nxt.full)}`, sub: 'Pasá a plato medio y mantené la cadencia.', dist: nxt.start, dlbl: 'hasta la trepada' };
    if (cur.c === 'y') return { c: 'y', icon: 'trendUp', meta: 'PACING COACH · TREPADA', title: `Trepada constante ${U.num(g, 1)} %`, sub: 'Cadencia 80–90 rpm y respiración pareja.', dist: null };
    if (nxt && nxt.kind === 'BAJADA' && nxt.start < 350) return { c: 'g', icon: 'trendDown', meta: `AVISO · EN ${dTxt(nxt.start)}`, title: 'Bajada adelante', sub: 'Soltá piernas y dedos livianos en los frenos.', dist: nxt.start };
    if (g < -2) return { c: 'g', icon: 'trendDown', meta: 'PACING COACH · BAJADA', title: 'Bajada: cuidá la velocidad', sub: 'Mirá lejos y frená antes de la curva, no en ella.', dist: null };
    return { c: 'g', icon: 'check', meta: 'PACING COACH · TERRENO FAVORABLE', title: 'Llano y favorable', sub: 'Podés apretar un poco más y ganar tiempo acá.', dist: null };
  };

  /* ---------- modelo de vista (lo que dibujan las pantallas) ---------- */
  RT.vm = () => {
    const fz = S.frozen, idle = S.rec === 'idle';
    const pt = RT.at(S.s), cur = RT.runsAhead(S.s, 1600), c0 = cur[0] || null;
    const g = idle ? 0 : fz ? F.g : pt.g, v = idle ? 0 : fz ? F.v : S.v, p = idle ? 0 : fz ? F.p : S.p;
    const kind = RT.kindOf(g), zc = RT.ZM[kind].c;
    const ahead = S.routeLoaded ? cur : [];
    const curRun = ahead.find((r) => r.start <= 0.5) || { c: zc, grade: g, end: 0, kind };
    let al = RT.alertFor(ahead, curRun, g);
    if (fz && S.routeLoaded) al = Object.assign({}, al, { c: 'r', icon: 'warn', meta: 'AVISO · EN 400 M', title: F.alert.title, sub: F.alert.sub, dist: 400, dlbl: 'hasta la pared' });
    if (!S.routeLoaded) al = (al.dist != null || al.c !== 'g') ? Object.assign({}, al, { meta: 'PACING COACH · SIN TRACK', dist: null }) : Object.assign({}, al, { meta: 'PACING COACH · SIN TRACK' });
    if (S.rec === 'idle') al = { c: 'g', icon: 'play', meta: 'LISTO PARA SALIR', title: S.gps === 'search' ? 'Buscando GPS…' : 'Todo en orden', sub: S.gps === 'search' ? 'Esperá la señal antes de iniciar.' : 'Tocá Iniciar recorrido cuando estés listo.', dist: null };
    const nextIdx = ahead.findIndex((r) => r.start > 1 && r.c !== curRun.c);
    const next = nextIdx >= 0 ? ahead[nextIdx] : (curRun.c === 'r' ? ahead.find((r) => r.start > 1) : null);
    const after = []; if (next) { const k0 = ahead.indexOf(next); for (let k = k0 + 1; k < ahead.length && after.length < 2; k++) after.push(ahead[k]); }
    const dist = S.s - S.s0, t = fz ? F.t : S.t, asc = fz ? F.asc : S.asc, kcal = fz ? F.kcal : S.kcal;
    const tgt = RT.targetFor(S.mode, g, S.hiit.fase === 'ATAQUE');
    const tdiff = v < 1 ? '' : v > tgt * 1.12 ? 'Bajá el ritmo' : v < tgt * 0.88 ? 'Podés apretar' : 'Ritmo OK';
    const pz = RT.pzone(p);
    // segmento en vivo
    let seg = null; if (S.seg) { const el = Math.max(0, S.t - S.seg.tIn), done = U.clamp((S.s - S.seg.a) / (S.seg.b - S.seg.a), 0, 1), exp = S.seg.pr * done, df = el - exp; seg = { n: S.seg.n, el, rem: Math.max(0, S.seg.b - S.s), pr: S.seg.pr, df }; }
    // ghost
    let gh = null; if (S.ghost.on) { const sp = S.ghost.mode === 'ritmo' ? S.ghost.kmh / 3.6 : Math.max(1.5, RT.simSpeed(RT.at(S.ghost.s).g) / 3.6), df = (S.s - S.ghost.s) / sp; gh = { df, dm: S.s - S.ghost.s, kmh: S.ghost.mode === 'ritmo' ? S.ghost.kmh : sp * 3.6, name: S.ghost.name }; }
    // plan IA
    let plan = null; if (S.plan) { const P = RT.PLANS[S.plan]; let acc = 0, i = 0; const min = S.planT / 60; for (; i < P.ph.length; i++) { if (min < acc + P.ph[i][1]) break; acc += P.ph[i][1]; } const idx = Math.min(i, P.ph.length - 1); plan = { n: P.short, idx, tot: P.ph.length, ph: P.ph[idx], left: Math.max(0, acc + P.ph[idx][1] - min), pct: U.clamp((min - acc) / P.ph[idx][1], 0, 1) }; }
    return { g, v, p, kind, zc, ahead, curRun, al, next, after, dist, t, asc, kcal, tgt, tdiff, pz, seg, gh, plan, pt, idle, ridden: S.s - S.s0 };
  };

  /* ---------- squad demo ---------- */
  RT.squadNow = () => (S.squad.on && S.squad.demo ? [{ k: 'F', n: 'Facundo', s: U.clamp(S.s + 130 + 30 * Math.sin(S.t / 30), 0, R.L), kmh: S.v * 1.06 + 1 }, { k: 'C', n: 'Cona', s: U.clamp(S.s - 90 + 20 * Math.cos(S.t / 25), 0, R.L), kmh: Math.max(0, S.v * 0.95 - 0.5) }] : []);

  /* ---------- paso de simulación ---------- */
  let lastAlertSig = '';
  RT.tick = (dtr) => {
    // GPS: mientras hay señal se actualiza la última posición válida (nunca se inventa una)
    if (S.gps === 'ok' || S.gps === 'weak') S.lastFix = { t: Date.now(), acc: S.acc };
    if (S.playing && S.rec === 'rec' && (S.gps === 'ok' || S.gps === 'weak')) {
      S.frozen = false; const dt = dtr * S.simK, pt = RT.at(S.s);
      const tv = RT.simSpeed(pt.g) * (1 + 0.05 * Math.sin(S.t / 17) + 0.03 * Math.sin(S.t / 5.3));
      S.v += (tv - S.v) * (1 - Math.exp(-dt / 3.5));
      S.s = Math.min(R.L, S.s + (S.v / 3.6) * dt); S.t += dt;
      const q = RT.at(S.s); S.p = RT.powerEst(S.v, q.g); S.kcal += (S.p * dt) / 1000;
      const d = q.e - S.altRef; if (d >= 3) { S.asc += d; S.altRef = q.e; } else if (d <= -3) S.altRef = q.e;
      S.zt[q.c] += dt; S.pz[RT.pzone(S.p)] += dt; S.maxV = Math.max(S.maxV, S.v); S.maxP = Math.max(S.maxP, S.p); S.maxAlt = Math.max(S.maxAlt, q.e);
      if (q.g > S.maxG) { S.maxG = q.g; S.maxGs = S.s; }
      if (S.plan) S.planT += dt;
      if (S.ghost.on && S.ghost.mode !== 'ritmo') S.ghost.s = Math.min(R.L, S.ghost.s + (RT.simSpeed(RT.at(S.ghost.s).g) / 3.6) * dt * 1.03);
      if (S.ghost.on && S.ghost.mode === 'ritmo') S.ghost.s = Math.min(R.L, S.ghost.s + (S.ghost.kmh / 3.6) * dt);
      if (S.hiit.on) { S.hiit.t -= dt; if (S.hiit.t <= 0) { if (S.hiit.fase === 'ATAQUE') { S.hiit.fase = 'DESCANSO'; S.hiit.t = 90; } else { S.hiit.serie = Math.min(5, S.hiit.serie + 1); S.hiit.fase = 'ATAQUE'; S.hiit.t = 60; } } }
      if (S.s >= R.L - 1) { S.playing = false; S.rec = 'paused'; RT.ui.toast('Llegaste al final del track. Pausé la grabación.', 'ok'); }
    }
    // segmentos privados (se cronometran mientras se graba)
    if (S.rec === 'rec') {
      const inSeg = S.segs.find((g) => S.s >= g.a && S.s <= g.b);
      if (inSeg && (!S.seg || S.seg.id !== inSeg.id)) { S.seg = { id: inSeg.id, n: inSeg.n, a: inSeg.a, b: inSeg.b, pr: inSeg.pr, tIn: S.t }; RT.ui.toast(`Segmento: ${inSeg.n}`, 'ok'); RT.speak(`Comienza el segmento ${inSeg.n}`); }
      else if (!inSeg && S.seg) { const tm = S.t - S.seg.tIn, g = S.segs.find((x) => x.id === S.seg.id), pr = tm < g.pr; S.segDone.push({ n: S.seg.n, time: tm, pr }); if (pr) { g.pr = Math.round(tm); g.v++; } RT.ui.toast(pr ? `¡Nuevo PR en ${S.seg.n}! ${U.dur(tm)}` : `${S.seg.n}: ${U.dur(tm)} (PR ${U.dur(g.pr)})`, pr ? 'ok' : 'warn'); S.seg = null; }
    } else if (S.rec !== 'paused') S.seg = null;
    // voz: solo cuando cambia el aviso
    if (S.voice && S.rec === 'rec') { const a = RT.vm().al, sig = a.meta + a.title; if (sig !== lastAlertSig) { lastAlertSig = sig; RT.speak(`${a.title}. ${a.sub}`); } }
    RT.emit('tick');
  };

  /* ---------- grabación ---------- */
  const resetSession = () => {
    S.s0 = S.s; S.t = 0; S.kcal = 0; S.asc = 0; S.altRef = RT.at(S.s).e; S.zt = { g: 0, y: 0, r: 0 }; S.pz = [0, 0, 0, 0, 0, 0, 0]; S.maxV = 0; S.maxP = 0; S.maxG = 0; S.maxGs = S.s; S.maxAlt = RT.at(S.s).e; S.segDone = []; S.seg = null; S.planT = 0; S.v = 0; S.p = 0; S.frozen = false; S.done = false;
    if (S.ghost.on) S.ghost.s = S.s;
  };
  RT.rec = {
    toggle() {
      if (S.rec === 'idle' || S.rec === 'done') { if (S.gps === 'search' || S.gps === 'lost') { RT.ui.toast('Todavía no hay señal GPS. Esperá a que se fije la posición.', 'warn'); return; } if (S.rec === 'done') { S.s = 0; } resetSession(); S.rec = 'rec'; S.v = 6; RT.ui.toast('Grabando recorrido', 'ok'); RT.speak('Recorrido iniciado'); }
      else if (S.rec === 'rec') { S.rec = 'paused'; RT.ui.toast('Grabación en pausa', 'warn'); RT.speak('Recorrido en pausa'); }
      else if (S.rec === 'paused') { S.rec = 'rec'; RT.ui.toast('Grabación reanudada', 'ok'); }
      RT.emit('rec');
    },
    askFinish() { if (S.rec === 'idle') return; RT.ui.finishConfirm(); },
    finish() {
      const sec = Math.max(1, S.frozen ? F.t : S.t), dist = (S.s - S.s0) / 1000, asc = S.frozen ? F.asc : S.asc, kcal = Math.round(S.frozen ? F.kcal : S.kcal);
      const zt = S.frozen ? { g: 1250, y: 1160, r: 128 } : S.zt;
      const tss = Math.round(RT.calcTSS(sec, zt.g, zt.y, zt.r)), n = RT.nutri(kcal, sec, asc), now = new Date();
      const iso = `${now.getFullYear()}-${U.pad2(now.getMonth() + 1)}-${U.pad2(now.getDate())}`;
      const act = { id: 'n' + Date.now(), fecha: iso, titulo: S.vehicle ? 'Test en vehículo' : 'Salida MTB', tipo: S.vehicle ? 'VEHICULO' : 'CICLISMO', dist, asc, dur: sec, vavg: dist / (sec / 3600), vmax: S.maxV || 31.4, pavg: Math.round((kcal * 1000) / sec), ppk: S.maxP, alt: Math.round(S.maxAlt), tss, if: RT.calcIF(zt.g, zt.y, zt.r), rec: RT.recovery(tss), z: [zt.g / 60, zt.y / 60, zt.r / 60].map(Math.round), wall: [S.maxG, S.maxGs / 1000], pr: S.segDone.filter((x) => x.pr).length, segs: S.segDone.slice(), kcal, carbs: n.carbs, fluid: n.fluid, sync: false, end: S.s, s0: S.s0 };
      RT.ACTS.unshift(act); RT.actSel = act.id; S.pendSync++; S.rec = 'done'; S.playing = false; RT.emit('rec'); RT.emit('acts');
      RT.ui.report(act);
      // odómetro de mantenimiento (mismas reglas que actualizarOdometroConSesion)
      const o = S.odo; o.km += dist; o.kmCad += dist; o.dCad += asc; o.kmFre += dist; o.dFre += asc; o.kmCub += dist;
    }
  };

  /* ---------- escenarios (Tweaks › Simulación) ---------- */
  const base = () => { S.rec = 'rec'; S.playing = false; S.gps = 'ok'; S.acc = 5; S.net = 'online'; S.lastFix = { t: Date.now(), acc: 5 }; S.seg = null; S.segDone = []; S.s0 = 0; S.done = false; S.layersOpen = false; S.trackback = false; };
  const placeAt = (s) => { S.s = s; const p = RT.at(s); S.cx = p.x; S.cy = p.y; S.altRef = p.e; S.follow = true; RT.emit('recenter'); };
  const frozenVals = () => { S.frozen = true; S.t = F.t; S.v = F.v; S.p = F.p; S.kcal = F.kcal; S.asc = F.asc; S.zt = { g: 1250, y: 1160, r: 128 }; S.maxV = 31.4; S.maxP = 388; S.maxG = 11.4; S.maxGs = 7380; };
  const running = (s, secs) => { S.frozen = false; S.t = secs; S.v = 13.5; S.kcal = secs * 0.19; S.asc = Math.round(RT.ascentTo(s)); S.zt = { g: secs * 0.45, y: secs * 0.46, r: secs * 0.09 }; S.maxV = 31.4; S.maxP = 388; S.maxG = 11.4; S.maxGs = 7380; };
  RT.SCEN = [
    ['boceto', 'Boceto (km 6,82)'], ['antes', 'Antes de salir'], ['pared', 'Entrando a la pared'], ['segmento', 'Segmento en curso'], ['pausa', 'Pausado'],
    ['gps_debil', 'GPS débil'], ['sin_gps', 'Sin GPS'], ['offline', 'Sin red · mapa descargado'], ['offline_sin', 'Sin red · sin mapa'], ['todo', 'Todo activo (liebre, escuadrón, plan)'], ['caida', 'Detección de caída'], ['final', 'Informe final']
  ];
  RT.scenario = (id) => {
    base(); S.mode = 'LIBRE'; S.ghost.on = false; S.squad.on = false; S.plan = null; S.hiit.on = false; S.tiles = 'ok'; S.cfgTiles = null; RT.cfg.offlineMap === 'none' && 0;
    if (id === 'boceto') { placeAt(6820); frozenVals(); }
    else if (id === 'antes') { S.rec = 'idle'; S.frozen = false; placeAt(0); S.t = 0; S.v = 0; S.p = 0; S.kcal = 0; S.asc = 0; S.gps = 'search'; S.acc = 30; S.lastFix = null; S.s0 = 0; setTimeout(() => { if (S.gps === 'search' && S.rec === 'idle') { S.gps = 'ok'; S.acc = 5; S.lastFix = { t: Date.now(), acc: 5 }; RT.ui.toast('GPS fijado · ±5 m', 'ok'); RT.emit('tick'); } }, 3200); }
    else if (id === 'pared') { placeAt(7080); running(7080, 2840); S.playing = true; S.simK = 3; S.v = 14; }
    else if (id === 'segmento') { placeAt(7010); running(7010, 2780); const g = S.segs[0]; S.seg = { id: g.id, n: g.n, a: g.a, b: g.b, pr: g.pr, tIn: S.t - 70 }; S.playing = false; }
    else if (id === 'pausa') { placeAt(6820); frozenVals(); S.rec = 'paused'; }
    else if (id === 'gps_debil') { placeAt(6820); frozenVals(); S.gps = 'weak'; S.acc = 19; S.lastFix = { t: Date.now(), acc: 19 }; }
    else if (id === 'sin_gps') { placeAt(6820); frozenVals(); S.gps = 'lost'; S.lostAt = Date.now() - 12000; }
    else if (id === 'offline') { placeAt(6820); frozenVals(); S.net = 'offline'; S.tiles = 'ok'; }
    else if (id === 'offline_sin') { placeAt(6820); frozenVals(); S.net = 'offline'; S.tiles = 'none'; }
    else if (id === 'todo') { placeAt(6820); frozenVals(); S.ghost = { on: true, kmh: 20, mode: 'ritmo', s: 6820 - 60, name: 'Ritmo fijo 20 km/h' }; S.squad.on = true; S.squad.demo = true; S.squad.connected = true; S.plan = 'ESCALADA'; S.planT = 38 * 60; S.mode = 'ESCALADA'; }
    else if (id === 'caida') { placeAt(6820); frozenVals(); setTimeout(() => RT.ui.fall(), 120); }
    else if (id === 'final') { placeAt(6820); frozenVals(); setTimeout(() => RT.rec.finish(), 120); }
    RT.emit('scenario', id); RT.emit('tick');
  };
  RT.setGps = (st) => { S.gps = st; if (st === 'ok') { S.acc = 5; S.lastFix = { t: Date.now(), acc: 5 }; } else if (st === 'weak') { S.acc = 19; S.lastFix = S.lastFix || { t: Date.now(), acc: 19 }; } else if (st === 'lost') S.lostAt = Date.now(); else if (st === 'search') { S.acc = 30; } RT.emit('tick'); };
  RT.setPlaying = (b) => { if (b && S.rec === 'idle') RT.rec.toggle(); if (b && S.rec === 'paused') { S.rec = 'rec'; } if (b && (S.rec === 'rec')) { S.frozen = false; } S.playing = !!b && S.rec === 'rec'; RT.emit('tick'); };
})();
