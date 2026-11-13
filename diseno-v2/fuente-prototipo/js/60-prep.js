/* ============================================================
   Preparación: lista de salida, presión SILCA, mantenimiento, ruta GPX, BikeFit, segmentos, coach
   ============================================================ */
(function () {
  'use strict';
  const RT = window.RT, U = RT.U, S = RT.S, R = RT.R, I = RT.icon, an = RT.an, ui = RT.ui;
  const prep = (RT.prep = {});
  let root;
  S.planSel = S.planSel || 'ESCALADA';
  /* datos demo del odómetro (el boceto mostraba 0 %: acá hay valores para ver los tres estados) */
  Object.assign(S.odo, { km: 2260.4, kmCad: 912, dCad: 28400, kmFre: 640, dFre: 21000, kmCub: 2180 });
  prep.odoSeed = Object.assign({}, S.odo);

  /* ---------- SILCA (misma fórmula que calcularPresionSilca) ---------- */
  RT.silca = (o) => {
    const peso = U.clamp(+o.peso || 78, 40, 140), ancho = +o.ancho || 2.25;
    let psi = 25 + (peso - 75) * 0.25;
    if (ancho <= 2.1) psi += 3.5; else if (ancho >= 2.6) psi -= 5.5; else if (ancho >= 2.4) psi -= 3; else if (ancho >= 2.35) psi -= 1.5;
    if (o.sistema === 'tubeless') psi -= 2.5;
    let tip;
    if (o.terreno === 'asfalto') { psi += 5; tip = 'En asfalto y enlace: más presión para rodar con baja fricción.'; }
    else if (o.terreno === 'roca') { psi -= 2; tip = 'En roca suelta: menos presión aumenta el contacto y absorbe impactos en las muñecas.'; }
    else if (o.terreno === 'barro') { psi -= 3; tip = 'En barro y lluvia: presión baja para que los tacos evacúen el barro y muerdan.'; }
    else tip = 'Sendero seco / ripio: equilibrio entre velocidad de avance y agarre en curvas.';
    const tra = Math.round(psi * 10) / 10, del = Math.round((psi - 2.5) * 10) / 10;
    return { del, tra, delBar: del * 0.0689476, traBar: tra * 0.0689476, tip };
  };
  /* ---------- desgaste (mismas reglas que actualizarOdometroUI) ---------- */
  RT.wear = () => {
    const o = S.odo, cad = Math.min(100, Math.round(((o.kmCad + o.dCad / 100) / 1500) * 100)), fre = Math.min(100, Math.round(((o.kmFre + o.dFre / 150) / 1200) * 100)), cub = Math.min(100, Math.round((o.kmCub / 2500) * 100));
    const st = (p) => (p > 85 ? 'r' : p > 60 ? 'y' : 'g');
    return [
      { k: 'cad', ic: 'link', n: 'Cadena', sub: '1.500 km + desnivel', p: cad, c: st(cad), t: cad > 85 ? '¡Reemplazo sugerido!' : cad > 60 ? 'Lubricar con cera' : 'Óptima', btn: 'Marcar cadena nueva' },
      { k: 'fre', ic: 'stop', n: 'Pastillas de freno', sub: '1.200 km + bajadas', p: fre, c: st(fre), t: fre > 85 ? 'Revisar espesor' : fre > 60 ? 'Espesor medio' : 'Buen espesor', btn: 'Marcar pastillas nuevas' },
      { k: 'cub', ic: 'bike', n: 'Cubiertas y tacos', sub: '2.500 km', p: cub, c: st(cub), t: cub > 85 ? 'Tacos gastados' : cub > 60 ? 'Agarre medio' : 'Excelente agarre', btn: 'Marcar cubiertas nuevas' }
    ];
  };
  const zIc = { g: 'check', y: 'warn', r: 'warn' };
  const fmtSeg = (s) => (s == null ? '--:--' : U.dur(s));
  const bestSeg = () => { const l = S.segs.filter((g) => g.pr); if (!l.length) return null; return l.reduce((a, b) => (b.pr < a.pr ? b : a)); };
  const bikeRes = () => { const p = prep.pts, a = [p[0].x - p[1].x, p[0].y - p[1].y], b = [p[2].x - p[1].x, p[2].y - p[1].y]; let d = Math.abs(Math.atan2(a[0] * b[1] - a[1] * b[0], a[0] * b[0] + a[1] * b[1])) * 180 / Math.PI; return { ext: Math.round(d), flex: Math.round(180 - d) }; };
  const bikeEstado = (flex) => (flex >= 25 && flex <= 35 ? { c: 'g', t: 'Altura óptima (zona de oro)', r: 'Alineación ideal (25°–35°). Máxima palanca en trepadas sin sobrecargar rótula ni isquiotibiales.' } : flex < 25 ? { c: 'r', t: 'Asiento muy alto (hiperextensión)', r: 'Riesgo de balanceo pélvico, dolor lumbar y tendinitis de la corva. Bajá el poste unos 5 a 15 mm.' } : { c: 'y', t: 'Asiento muy bajo (hiperflexión)', r: 'Exceso de compresión en el tendón rotuliano y pérdida de fuerza en cuádriceps. Subí el poste unos 10 a 20 mm.' });
  const routeSub = () => (S.routeLoaded ? `Track cargado · ${U.num(R.L / 1000, 1)} km · +${U.num(RT.ascentTo(R.L), 0)} m` : 'Sin track cargado · subí uno o probá el demo');
  const bikeSub = () => `Última medición: rodilla ${S.bikefit.flex}° · ${bikeEstado(S.bikefit.flex).t.split(' (')[0].toLowerCase()}`;
  const segSub = () => { const b = bestSeg(); return `${S.segs.length} segmento${S.segs.length === 1 ? '' : 's'}${b ? ` · mejor marca ${fmtSeg(b.pr)} en ${b.n}` : ''}`; };
  const planSub = () => (S.plan ? `Plan activo: ${RT.PLANS[S.plan].short}` : `Objetivo de hoy: ${RT.PLANS[S.planSel].short}`);
  const wearSub = () => RT.wear().map((w) => `${w.n.split(' ')[0]} ${w.p} %`).join(' · ');

  const opt = (arr, v) => arr.map((o) => `<option value="${o[0]}" ${String(o[0]) === String(v) ? 'selected' : ''}>${o[1]}</option>`).join('');
  const ANCHOS = [['2.10', '2,10" XC'], ['2.25', '2,25" MTB'], ['2.35', '2,35" Trail'], ['2.40', '2,40" Enduro'], ['2.60', '2,60" Plus']];
  const SIST = [['tubeless', 'Tubeless'], ['camara', 'Cámara']];
  const TERR = [['seco', 'Seco / ripio'], ['roca', 'Roca suelta'], ['barro', 'Barro / lluvia'], ['asfalto', 'Asfalto / enlace']];

  const silcaHTML = () => { const r = RT.silca(S.silca); return `<div class="pr" data-silca-out ${an('silca-del-psi · silca-tras-psi')}><div><div class="lbl sm">Delantera</div><div class="num zt-g"><span data-sl="del">${U.num(r.del, 1)}</span><small>PSI</small></div><div class="sub"><span data-sl="delb">${U.num(r.delBar, 2)}</span> bar</div></div><div class="vl"></div><div><div class="lbl sm">Trasera</div><div class="num"><span data-sl="tra">${U.num(r.tra, 1)}</span><small>PSI</small></div><div class="sub"><span data-sl="trab">${U.num(r.traBar, 2)}</span> bar</div></div></div><div class="hint" style="margin-top:12px" ${an('silca-consejo')}>${I('info', 15)} <b>Consejo táctico:</b> <span data-sl="tip">${r.tip}</span></div>`; };

  /* ---------- pestaña ---------- */
  prep.build = (el) => {
    root = el; render();
    RT.on('acts', () => prep.refreshRows()); RT.on('scenario', () => render());
    const A = RT.acts, C = RT.chg;
    A['chk'] = (t) => { const i = +t.dataset.i; S.checks[i] = !S.checks[i]; t.classList.toggle('on', S.checks[i]); const n = S.checks.filter(Boolean).length; const b = root.querySelector('#chkBadge'); b.firstChild.nodeValue = `${n} de 4`; b.className = 'badge ' + (n === 4 ? '' : 'y'); };
    C['silca'] = (t) => { const k = t.dataset.f; S.silca[k] = t.value; const r = RT.silca(S.silca); const q = (x) => root.querySelector(`[data-sl="${x}"]`); q('del').textContent = U.num(r.del, 1); q('tra').textContent = U.num(r.tra, 1); q('delb').textContent = U.num(r.delBar, 2); q('trab').textContent = U.num(r.traBar, 2); q('tip').textContent = r.tip; };
    A['prep.open'] = (t) => ({ odo: prep.openOdo, gpx: prep.openGpx, bike: prep.openBike, seg: prep.openSeg, plan: prep.openPlan }[t.dataset.k] || (() => {}))();
  };
  function render() {
    const n = S.checks.filter(Boolean).length, batLow = S.battery < 70;
    root.innerHTML = `<div class="tex"></div><div class="page"><div class="ph"><div><h1 class="page-title" ${an('header · 🛠️ PREPARACIÓN Y TÁCTICA')}>Preparación</h1><p class="page-sub">Ajustes antes de subir al cerro</p></div><button class="ibtn" data-act="hdr.cab" aria-label="Herramientas">${I('sliders', 22)}</button></div>
      <div class="stack">
      <div class="card" ${an('card-prep · Checklist Rápido de Seguridad')}><div class="row between"><span class="lbl">Lista para salir</span><span class="badge ${n === 4 ? '' : 'y'}" id="chkBadge">${n} de 4</span></div>
        <div class="chk">${['Casco y gafas', 'Hidratación con sales', 'Celu con más de 70 %', 'Llave allen y cámara'].map((t, i) => `<button class="${S.checks[i] ? 'on' : ''}" data-act="chk" data-i="${i}" aria-pressed="${S.checks[i]}"><span class="bx">${I('check', 14)}</span>${t}</button>`).join('')}</div>
        ${batLow ? `<div class="hint y" style="margin-top:12px">${I('battery', 15)} Batería actual ${S.battery} %: conviene cargar antes de salir.</div>` : `<div class="muted" style="font-size:12.5px;margin-top:12px">Batería actual ${S.battery} % <span class="ptag prop">Propuesta</span> tildar sola la casilla del celu</div>`}</div>
      <div class="card" ${an('card-prep · Estratega SILCA · calcularPresionSilca()')}><div class="row between"><h2 style="font-family:var(--font-d);font-weight:var(--fw-d);font-size:calc(24px*var(--num));text-transform:uppercase;letter-spacing:var(--ls-d)">Presión de cubiertas</h2><span class="lbl sm">Estrategia SILCA</span></div>
        <div class="grid2" style="margin-top:12px"><label class="fld"><span>Peso + bici</span><input type="number" inputmode="decimal" min="40" max="140" value="${S.silca.peso}" data-chg="silca" data-f="peso" ${an('silca-peso')}><em class="u" style="font-style:normal">kg</em></label>
        <label class="fld"><span>Cubierta</span><select data-chg="silca" data-f="ancho" ${an('silca-ancho')}>${opt(ANCHOS, S.silca.ancho)}</select>${I('chevD', 16, 'caret')}</label>
        <label class="fld"><span>Sistema</span><select data-chg="silca" data-f="sistema" ${an('silca-sistema')}>${opt(SIST, S.silca.sistema)}</select>${I('chevD', 16, 'caret')}</label>
        <label class="fld"><span>Terreno</span><select data-chg="silca" data-f="terreno" ${an('silca-terreno')}>${opt(TERR, S.silca.terreno)}</select>${I('chevD', 16, 'caret')}</label></div>
        <div style="margin-top:14px">${silcaHTML()}</div></div>
      <div class="stack" style="gap:calc(9px*var(--sp))" id="prepRows"></div></div></div>`;
    prep.refreshRows();
  }
  prep.refreshRows = () => {
    const box = root && root.querySelector('#prepRows'); if (!box) return;
    const row = (ic, k, t, sub, st) => `<button class="lrow" data-act="prep.open" data-k="${k}" ${an(st)}><span class="ico">${I(ic, 22)}</span><span class="grow"><b>${t}</b><small>${sub}</small></span>${I('chevR', 20, 'chev')}</button>`;
    box.innerHTML = row('wrench', 'odo', 'Mantenimiento', wearSub(), 'card-prep · Odómetro mecánico · actualizarOdometroUI()') + row('route', 'gpx', 'Ruta GPX', routeSub(), 'card-prep · Ruta GPX planificada · cargarGPXPorDefecto()') + row('ruler', 'bike', 'BikeFit', bikeSub(), 'card-prep · Escáner BikeFit · guardarAjusteBikeFit()') + row('medal', 'seg', 'Segmentos y PR', segSub(), 'card-prep · Segmentos privados · renderizarListaSegmentos()') + row('target', 'plan', 'Coach de entrenamiento', planSub(), 'card-prep · Planificador IA · activarPlanSeleccionado()');
  };

  /* ---------- Mantenimiento ---------- */
  prep.openOdo = () => {
    const sh = ui.sheet({
      title: 'Mantenimiento', full: true,
      render: () => `<p class="muted">Desgaste estimado por kilómetros y desnivel acumulado. Son <b>estimaciones</b>: revisá las piezas a ojo.</p>
        <div class="card tight"><div class="row between"><span class="lbl">Kilometraje total de la bici</span><b class="num" style="font-size:30px">${U.num(S.odo.km, 1)}<small style="font-size:.5em;color:var(--muted)"> km</small></b></div></div>
        ${RT.wear().map((w) => `<div class="card tight wear" style="margin-top:0" ${an('odo-barra-' + { cad: 'cadena', fre: 'frenos', cub: 'cubiertas' }[w.k] + ' · resetearComponenteOdometro()')}><div class="row between"><span class="row" style="gap:8px"><span class="zt-${w.c}">${I(w.ic, 19)}</span><span><b style="font-size:16px">${w.n}</b><br><small class="muted">${w.sub}</small></span></span><b class="num zt-${w.c}" style="font-size:28px">${w.p} %</b></div>
          <div class="bar" style="margin:10px 0 8px"><i style="width:${w.p}%;background:var(--${w.c})"></i></div><div class="row between"><span class="zt-${w.c}" style="display:inline-flex;align-items:center;gap:5px;font-weight:700;font-size:13.5px">${I(zIc[w.c], 14)}${w.t}</span><button class="btn btn-s xs" data-act="odo.new" data-k="${w.k}">${I('reset', 14)} ${w.btn}</button></div></div>`).join('')}
        <div class="hint">${I('info', 15)} Cadena: cada 100 m de desnivel suman 1 km extra de desgaste. Pastillas: cada 150 m. Al finalizar una salida se suman sus kilómetros solos.</div>`,
      foot: `<button class="btn btn-s" data-act="odo.demo" style="flex:1" ${an('datos de demostración', 'demo')}>Restablecer demo</button><button class="btn btn-p" data-close style="flex:1">Listo</button>`
    });
    RT.acts['odo.new'] = (t) => { const k = t.dataset.k, w = RT.wear().find((x) => x.k === k); ui.confirm(`¿${w.btn.replace('Marcar ', 'Confirmar que instalaste ')}?`, 'El desgaste de esta pieza vuelve a 0 %. No se puede deshacer.', 'Sí, es nueva', () => { const o = S.odo; if (k === 'cad') { o.kmCad = 0; o.dCad = 0; } if (k === 'fre') { o.kmFre = 0; o.dFre = 0; } if (k === 'cub') o.kmCub = 0; sh.refresh(); prep.refreshRows(); ui.toast('Desgaste reiniciado', 'ok'); }); };
    RT.acts['odo.demo'] = () => { Object.assign(S.odo, prep.odoSeed); sh.refresh(); prep.refreshRows(); ui.toast('Valores de demostración restablecidos', 'ok'); };
  };

  /* ---------- Ruta GPX ---------- */
  const fullProfile = () => {
    const W = 340, H = 92, e = R.e; let lo = 1e9, hi = -1e9; e.forEach((v) => { lo = Math.min(lo, v); hi = Math.max(hi, v); });
    const X = (s) => (s / R.L) * W, Y = (v) => 8 + (1 - (v - lo) / (hi - lo)) * (H - 22); let svg = '';
    RT.RUNS.forEach((r) => { const pts = []; for (let i = r.i0; i <= Math.min(R.N - 1, r.i1 + 1); i++) pts.push(`${X(i * 10).toFixed(1)},${Y(e[i]).toFixed(1)}`); const d = 'M' + pts.join('L'); svg += `<path d="${d}L${X(Math.min(R.L, (r.i1 + 1) * 10)).toFixed(1)},${H - 12}L${X(r.i0 * 10).toFixed(1)},${H - 12}Z" style="fill:var(--${r.c});opacity:.22"/><path d="${d}" style="fill:none;stroke:var(--${r.c});stroke-width:2.6;stroke-linejoin:round"/>`; });
    [0, 3, 6, 9].forEach((k) => { svg += `<text x="${Math.min(W - 14, Math.max(8, X(k * 1000)))}" y="${H - 1}" text-anchor="middle" style="font-size:11px">${k} km</text>`; });
    return `<svg class="ribbon" viewBox="0 0 ${W} ${H}" role="img" aria-label="Perfil completo de la ruta">${svg}</svg>`;
  };
  prep.openGpx = () => {
    const sh = ui.sheet({
      title: 'Ruta GPX', full: true,
      render: () => S.routeLoaded ? `<div class="row between"><span class="badge">${I('check', 15)} Track cargado</span><span class="muted">Cerro (demo) · traza sintética</span></div>
        <div class="grid3">${[[U.num(R.L / 1000, 1), 'km', 'Distancia'], ['+' + U.num(RT.ascentTo(R.L), 0), 'm', 'Desnivel'], [String(RT.RUNS.filter((r) => r.c !== 'g').length), '', 'Tramos duros']].map((x) => `<div class="stat"><div class="v">${x[0]}<small>${x[1]}</small></div><div class="l">${x[2]}</div></div>`).join('')}</div>
        <div class="card tight" ${an('widget-climbpro · actualizarClimbPro()')}><div class="row between"><span class="lbl">Perfil de la ruta</span><span class="leg"><span><i style="background:var(--g)"></i>Llano</span><span><i style="background:var(--y)"></i>Trepada</span><span><i style="background:var(--r)"></i>Pared</span></span></div>${fullProfile()}</div>
        <div class="card tight"><div class="lbl">Tramos que el radar va a avisar</div><div style="margin-top:6px">${RT.RUNS.filter((r) => r.c !== 'g').map((r) => `<div class="arow"><i style="background:var(--${r.c})"></i><span class="d">km ${U.num(r.s0 / 1000, 1)}</span><span class="n">${r.name} ${U.num(r.grade, 0)} %</span><span class="l">${U.distTxt(r.len)}</span></div>`).join('')}</div></div>
        <div class="hint">${I('info', 15)} Con el track cargado, el radar anticipa terreno hasta 1,5 km adelante. Sin track, solo muestra lo que estás pisando ahora.</div>`
        : `<div class="hint y">${I('warn', 15)} <b>Sin track cargado.</b> El radar sigue grabando tu recorrido, pero no puede avisar pendientes por adelantado. El mapa muestra solo tu traza.</div><div class="card tight" style="text-align:center;padding:26px 12px;color:var(--muted)">${I('route', 38)}<p style="margin-top:8px">Subí un archivo .gpx o probá la ruta de demostración.</p></div>`,
      foot: () => S.routeLoaded ? `<button class="btn btn-d" data-act="gpx.drop" style="flex:1" ${an('quitar track', 'prop')}>${I('trash', 17)} Quitar track</button><button class="btn btn-p" data-close style="flex:1">Listo</button>` : `<button class="btn btn-s" data-act="gpx.file" style="flex:1" ${an('input-gpx · cargarArchivoGPX()')}>${I('upload', 18)} Subir .gpx</button><button class="btn btn-p" data-act="gpx.demo" style="flex:1" ${an('cargarGPXPorDefecto()')}>${I('zap', 18)} Demo Cerro</button><input type="file" id="gpx-file" accept=".gpx,application/gpx+xml" hidden>`,
      mount: (el) => { const f = el.querySelector('#gpx-file'); if (f) f.onchange = () => { const fl = f.files[0]; if (!fl) return; const r = new FileReader(); r.onload = () => { const m = String(r.result).match(/<trkpt\b/g); if (!m || m.length < 2) ui.toast('Ese archivo no tiene puntos de recorrido (trkpt)', 'bad'); else ui.toast(`Leí ${m.length} puntos de «${fl.name}». En la app real se dibujaría esta ruta; el prototipo usa la traza de demostración.`, 'warn', 5200); }; r.readAsText(fl); }; }
    });
    RT.acts['gpx.file'] = () => document.getElementById('gpx-file').click();
    RT.acts['gpx.demo'] = () => { S.routeLoaded = true; sh.refresh(); prep.refreshRows(); RT.emit('tick'); RT.drawAll(); ui.toast('Ruta demo cargada', 'ok'); };
    RT.acts['gpx.drop'] = () => ui.confirm('¿Quitar el track?', 'El radar dejará de anticipar pendientes. La traza que ya grabaste no se borra.', 'Quitar', () => { S.routeLoaded = false; sh.refresh(); prep.refreshRows(); RT.emit('tick'); RT.drawAll(); ui.toast('Track quitado', 'warn'); }, true);
  };

  /* ---------- BikeFit ---------- */
  prep.pts = [{ x: 182, y: 80, k: 'd', n: 'Cadera' }, { x: 211, y: 174, k: 'g', n: 'Rodilla' }, { x: 190, y: 268, k: 'y', n: 'Tobillo' }];
  prep.openBike = () => {
    let img = null, stream = null, frozen = false;
    const stop = () => { if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; } };
    const sh = ui.sheet({
      title: 'BikeFit', full: true, onClose: stop,
      render: () => { const r = bikeRes(), e = bikeEstado(r.flex), p = prep.pts; return `<p class="muted">Apoyá el celu, pedaleá unos segundos y congelá la imagen con la pierna extendida abajo. Arrastrá los tres puntos sobre cadera, rodilla y tobillo.</p>
        <div class="bikefit" id="bfBox" style="position:relative;aspect-ratio:440/300"><video id="bfVid" playsinline muted style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:none"></video>
        <svg id="bfSvg" viewBox="0 0 440 300" style="position:absolute;inset:0;width:100%;height:100%;touch-action:none">${img ? `<image href="${img}" x="0" y="0" width="440" height="300" preserveAspectRatio="xMidYMid slice"/>` : `<g style="stroke:var(--line);stroke-width:1">${Array.from({ length: 10 }, (_, i) => `<line x1="${i * 44 + 22}" x2="${i * 44 + 22}" y1="0" y2="300"/>`).join('')}${Array.from({ length: 7 }, (_, i) => `<line y1="${i * 44 + 22}" y2="${i * 44 + 22}" x1="0" x2="440"/>`).join('')}</g><text x="220" y="289" text-anchor="middle" style="fill:var(--dim);font-size:12px;font-weight:600">Sin imagen · subí una foto o iniciá la cámara</text>`}
        <path id="bfL" d="M${p[0].x},${p[0].y}L${p[1].x},${p[1].y}L${p[2].x},${p[2].y}" style="fill:none;stroke:var(--text);stroke-width:3;stroke-linecap:round;stroke-linejoin:round;opacity:.9"/>
        ${p.map((q, i) => `<g class="bfp" data-i="${i}" style="cursor:grab"><circle cx="${q.x}" cy="${q.y}" r="22" fill="transparent"/><circle cx="${q.x}" cy="${q.y}" r="9" style="fill:var(--${q.k});stroke:#04140D;stroke-width:2.5"/><text x="${q.x + 14}" y="${q.y - 12}" style="fill:var(--text);font-size:12px;font-weight:700;paint-order:stroke;stroke:rgba(0,0,0,.7);stroke-width:3px">${q.n}</text></g>`).join('')}
        <text id="bfAng" x="${p[1].x - 16}" y="${p[1].y + 4}" text-anchor="end" style="fill:var(--text);font-size:17px;font-weight:800;paint-order:stroke;stroke:rgba(0,0,0,.75);stroke-width:4px">${r.ext}°</text></svg></div>
        <div class="row" style="gap:7px;flex-wrap:wrap"><button class="btn btn-s sm" data-act="bf.cam" ${an('toggleCamaraBikeFit()')}>${I('camera', 17)} ${stream ? 'Apagar cámara' : 'Cámara'}</button><button class="btn btn-s sm ${stream ? '' : 'dis'}" data-act="bf.frz" ${an('congelarOReanudarBikeFit()')}>${I('image', 17)} ${frozen ? 'Reanudar' : 'Congelar'}</button><button class="btn btn-s sm" data-act="bf.photo" ${an('cargarFotoBikeFit()')}>${I('upload', 17)} Subir foto</button><input type="file" id="bfFile" accept="image/*" hidden></div>
        <div class="card tight" id="bfDiag" ${an('bikefit-diagnostico-card')}><div class="row between"><div><div class="lbl sm">Ángulo de flexión</div><div class="num zt-${e.c}" style="font-size:50px" id="bfFlex">${r.flex}°</div><div class="muted" id="bfExt">Extensión: ${r.ext}°</div></div><div style="flex:1;margin-left:14px"><b class="zt-${e.c}" id="bfEst" style="display:flex;gap:6px;align-items:flex-start">${I(zIc[e.c], 17)}<span>${e.t}</span></b><p class="muted" id="bfRec" style="font-size:13px;margin-top:5px;line-height:1.3">${e.r}</p></div></div></div>
        <div class="hint y">${I('info', 15)} Los puntos se ubican a mano: el ángulo es una guía, no un diagnóstico. <span class="ptag prop">Propuesta</span> detección automática por visión.</div>`; },
      foot: `<button class="btn btn-s" data-act="bf.center" style="flex:1" ${an('resetearPuntosBikeFit()')}>${I('undo', 17)} Centrar puntos</button><button class="btn btn-p" data-act="bf.save" style="flex:1.2" ${an('guardarAjusteBikeFit()')}>${I('save', 18)} Guardar ajuste</button>`,
      mount: (el) => {
        const svg = el.querySelector('#bfSvg'), vid = el.querySelector('#bfVid'); if (stream) { vid.srcObject = stream; vid.style.display = 'block'; vid.play().catch(() => {}); }
        const upd = () => { const p = prep.pts, r = bikeRes(), e = bikeEstado(r.flex); svg.querySelector('#bfL').setAttribute('d', `M${p[0].x},${p[0].y}L${p[1].x},${p[1].y}L${p[2].x},${p[2].y}`); svg.querySelectorAll('.bfp').forEach((g, i) => { g.querySelectorAll('circle').forEach((c) => { c.setAttribute('cx', p[i].x); c.setAttribute('cy', p[i].y); }); const t = g.querySelector('text'); t.setAttribute('x', p[i].x + 14); t.setAttribute('y', p[i].y - 12); }); const a = svg.querySelector('#bfAng'); a.setAttribute('x', p[1].x - 16); a.setAttribute('y', p[1].y + 4); a.textContent = r.ext + '°'; el.querySelector('#bfFlex').textContent = r.flex + '°'; el.querySelector('#bfFlex').className = 'num zt-' + e.c; el.querySelector('#bfExt').textContent = 'Extensión: ' + r.ext + '°'; const es = el.querySelector('#bfEst'); es.className = 'zt-' + e.c; es.style.display = 'flex'; es.style.gap = '6px'; es.innerHTML = I(zIc[e.c], 17) + '<span>' + e.t + '</span>'; el.querySelector('#bfRec').textContent = e.r; };
        let drag = -1;
        svg.addEventListener('pointerdown', (ev) => { const g = ev.target.closest('.bfp'); if (!g) return; drag = +g.dataset.i; svg.setPointerCapture(ev.pointerId); ev.preventDefault(); });
        svg.addEventListener('pointermove', (ev) => { if (drag < 0) return; const b = svg.getBoundingClientRect(); prep.pts[drag].x = U.clamp(((ev.clientX - b.left) / b.width) * 440, 10, 430); prep.pts[drag].y = U.clamp(((ev.clientY - b.top) / b.height) * 300, 10, 290); upd(); });
        const end = () => { drag = -1; }; svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
        const f = el.querySelector('#bfFile'); f.onchange = () => { const fl = f.files[0]; if (!fl) return; stop(); const r = new FileReader(); r.onload = () => { img = r.result; sh.refresh(); }; r.readAsDataURL(fl); };
      }
    });
    const A = RT.acts;
    A['bf.photo'] = () => document.getElementById('bfFile').click();
    A['bf.center'] = () => { prep.pts[0].x = 182; prep.pts[0].y = 80; prep.pts[1].x = 211; prep.pts[1].y = 174; prep.pts[2].x = 190; prep.pts[2].y = 268; sh.refresh(); };
    A['bf.save'] = () => { const r = bikeRes(); S.bikefit = { flex: r.flex, ext: r.ext, fecha: 'Hoy' }; prep.refreshRows(); ui.toast(`Ajuste guardado: ${r.flex}° de flexión`, 'ok'); };
    A['bf.cam'] = async () => { if (stream) { stop(); frozen = false; sh.refresh(); return; } try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); img = null; frozen = false; sh.refresh(); } catch (e) { ui.toast('No pude abrir la cámara (permiso o dispositivo). Podés subir una foto.', 'warn', 4200); } };
    A['bf.frz'] = () => { const v = document.getElementById('bfVid'); if (!v) return; frozen = !frozen; if (frozen) v.pause(); else v.play().catch(() => {}); sh.refresh(); };
  };

  /* ---------- Segmentos y PR ---------- */
  prep.openSeg = () => {
    let creating = false, f = { n: '', a: 6.2, b: 7.0 };
    const sh = ui.sheet({
      title: 'Segmentos y PR', full: true,
      render: () => creating ? `<p class="muted">Marcá el inicio y el fin sobre la ruta. En la salida, el radar te cronometra al cruzar el inicio.</p>
        <label class="fld"><span>Nombre</span><input id="sgN" value="${U.esc(f.n)}" placeholder="Ej.: Trepada de las Antenas" ${an('input-seg-nombre')}></label>
        <div class="card tight"><div class="row between"><span class="lbl">Inicio</span><b class="num" style="font-size:24px" id="sgA">km ${U.num(f.a, 2)}</b></div><input type="range" class="rng" id="sgAr" min="0" max="${(R.L / 1000).toFixed(2)}" step="0.05" value="${f.a}" ${an('input-seg-inicio · fijarInicioSegmentoActual()')}><div class="row between" style="margin-top:6px"><span class="lbl">Fin</span><b class="num" style="font-size:24px" id="sgB">km ${U.num(f.b, 2)}</b></div><input type="range" class="rng" id="sgBr" min="0" max="${(R.L / 1000).toFixed(2)}" step="0.05" value="${f.b}" ${an('input-seg-fin · fijarFinSegmentoActual()')}><div class="row between" style="margin-top:8px"><button class="btn btn-s xs" data-act="sg.here" data-w="a">${I('gps', 14)} Inicio = mi posición</button><button class="btn btn-s xs" data-act="sg.here" data-w="b">${I('gps', 14)} Fin = mi posición</button></div><div class="muted" style="margin-top:10px" id="sgD">Distancia: ${U.distTxt(Math.abs(f.b - f.a) * 1000)}</div></div>`
        : `<p class="muted">Tus propios tramos de sendero. Los tiempos y récords quedan <b>solo en tu teléfono</b>.</p>
        ${S.segs.length ? S.segs.map((g) => `<div class="seg-card" ${an('tarjeta-segmento-item · renderizarListaSegmentos()')}><span class="ico" style="width:42px;height:42px;border-radius:12px;background:var(--acc-soft);color:var(--acc);display:grid;place-items:center">${I('medal', 22)}</span><div class="t"><b>${g.n}</b><small>${U.num(g.dist / 1000, 2)} km · ${g.v} pasada${g.v === 1 ? '' : 's'}</small></div><div class="pr2"><div class="lbl sm">PR</div><div class="num">${fmtSeg(g.pr)}</div></div><button class="ibtn sm" data-act="sg.del" data-id="${g.id}" aria-label="Eliminar ${U.esc(g.n)}" ${an('eliminarSegmento()')}>${I('trash', 17)}</button></div>`).join('') : `<div class="card tight muted" style="text-align:center;padding:20px">No tenés segmentos. Creá uno o cargá los ejemplos.</div>`}`,
      foot: () => creating ? `<button class="btn btn-s" data-act="sg.cancel" style="flex:1">Cancelar</button><button class="btn btn-p" data-act="sg.save" style="flex:1.3" ${an('guardarNuevoSegmento()')}>Guardar segmento</button>` : `<button class="btn btn-s" data-act="sg.ex" style="flex:1" ${an('cargarSegmentosEjemplo()', 'demo')}>${I('zap', 17)} Ejemplos</button><button class="btn btn-p" data-act="sg.new" style="flex:1.3" ${an('abrirModalNuevoSegmento()')}>${I('plus', 18)} Crear segmento</button>`,
      mount: (el) => { const a = el.querySelector('#sgAr'), b = el.querySelector('#sgBr'); if (!a) return; const up = () => { f.a = +a.value; f.b = +b.value; el.querySelector('#sgA').textContent = 'km ' + U.num(f.a, 2); el.querySelector('#sgB').textContent = 'km ' + U.num(f.b, 2); el.querySelector('#sgD').textContent = 'Distancia: ' + U.distTxt(Math.abs(f.b - f.a) * 1000); }; a.oninput = up; b.oninput = up; el.querySelector('#sgN').oninput = (e) => { f.n = e.target.value; }; }
    });
    const A = RT.acts;
    A['sg.new'] = () => { creating = true; sh.refresh(); }; A['sg.cancel'] = () => { creating = false; sh.refresh(); };
    A['sg.here'] = (t) => { f[t.dataset.w] = Math.round((S.s / 1000) * 20) / 20; sh.refresh(); };
    A['sg.save'] = () => { const a = Math.min(f.a, f.b) * 1000, b = Math.max(f.a, f.b) * 1000; if (b - a < 100) return ui.toast('El segmento tiene que medir al menos 100 m', 'warn'); S.segs.push({ id: 'u' + Date.now(), n: f.n.trim() || 'Segmento sin nombre', a, b, dist: b - a, pr: null, v: 0 }); creating = false; f = { n: '', a: 6.2, b: 7.0 }; sh.refresh(); prep.refreshRows(); ui.toast('Segmento creado', 'ok'); };
    A['sg.del'] = (t) => { const g = S.segs.find((x) => String(x.id) === t.dataset.id); if (!g) return; ui.confirm('¿Eliminar este segmento?', `«${g.n}» y su récord se borran de este teléfono.`, 'Eliminar', () => { S.segs.splice(S.segs.indexOf(g), 1); sh.refresh(); prep.refreshRows(); RT.drawAll(); }, true); };
    A['sg.ex'] = () => { GEO.segs.forEach((g) => { if (!S.segs.find((x) => x.id === g.id)) S.segs.push({ id: g.id, n: g.n, a: g.a, b: g.b, dist: g.b - g.a, pr: g.pr, v: g.v }); }); sh.refresh(); prep.refreshRows(); RT.drawAll(); ui.toast('Segmentos de ejemplo cargados', 'ok'); };
  };

  /* ---------- Coach de entrenamiento ---------- */
  prep.openPlan = () => {
    const sh = ui.sheet({
      title: 'Coach de entrenamiento', full: true,
      render: () => { const P = RT.PLANS[S.planSel], tot = P.ph.reduce((a, p) => a + p[1], 0); return `<p class="muted">Elegí tu objetivo de hoy. El coach divide la salida en fases y te da instrucciones en cada una.</p>
        <div class="grid2" ${an('grid-planes-ia · seleccionarPlanIA()')}>${Object.keys(RT.PLANS).map((k) => `<button class="planopt ${S.planSel === k ? 'on' : ''}" data-act="pl.sel" data-k="${k}"><span class="zt-g">${I(RT.PLANS[k].ic, 22)}</span><b>${RT.PLANS[k].short}</b><small>${RT.PLANS[k].d}</small></button>`).join('')}</div>
        <div class="card tight" ${an('plan-detalle-preview')}><div class="row between"><b style="font-size:17px">${P.n}</b><span class="badge" style="height:24px;font-size:12.5px">${tot} min</span></div>
        <div class="stack" style="gap:9px;margin-top:11px">${P.ph.map((p, i) => `<div class="row" style="align-items:flex-start;gap:11px"><span class="num" style="font-size:26px;color:var(--acc);min-width:22px">${i + 1}</span><div><b>${p[0]} <span class="muted" style="font-weight:600">· ${p[1]} min</span></b><div class="muted" style="font-size:13px;margin-top:2px;line-height:1.3">${p[2]}</div></div></div>`).join('')}</div></div>
        ${S.plan ? `<div class="hint">${I('check', 15)} <b>Plan activo:</b> ${RT.PLANS[S.plan].short}. Aparece en el Radar como tarjeta de fase.</div>` : ''}`; },
      foot: () => S.plan ? `<button class="btn btn-d" data-act="pl.off" style="flex:1">Desactivar plan</button><button class="btn btn-p" data-act="pl.on" style="flex:1.3" ${an('activarPlanSeleccionado()')}>Activar este plan</button>` : `<button class="btn btn-p block" data-act="pl.on" style="width:100%" ${an('activarPlanSeleccionado()')}>${I('target', 19)} Activar este plan para hoy</button>`
    });
    RT.acts['pl.sel'] = (t) => { S.planSel = t.dataset.k; sh.refresh(); prep.refreshRows(); };
    RT.acts['pl.on'] = () => { S.plan = S.planSel; S.planT = 0; sh.close(); prep.refreshRows(); RT.emit('tick'); ui.toast(`Plan «${RT.PLANS[S.plan].short}» activado. Mirá la tarjeta en el Radar.`, 'ok', 3800); RT.speak(`Plan ${RT.PLANS[S.plan].n} activado para hoy. ${RT.PLANS[S.plan].ph[0][2]}`); RT.go('radar'); };
    RT.acts['pl.off'] = () => { S.plan = null; sh.close(); prep.refreshRows(); RT.emit('tick'); ui.toast('Plan desactivado', 'warn'); };
  };
})();
