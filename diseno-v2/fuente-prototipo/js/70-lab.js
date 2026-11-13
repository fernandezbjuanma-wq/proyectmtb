/* ============================================================
   Laboratorio: informe de una salida (mapa de la traza + explorador de perfil + métricas)
   ============================================================ */
(function () {
  'use strict';
  const RT = window.RT, U = RT.U, S = RT.S, R = RT.R, I = RT.icon, an = RT.an, ui = RT.ui;
  const lab = (RT.lab = {});
  let root, map = null, scrub = null, cvP = null;
  const act = () => RT.ACTS.find((a) => a.id === RT.actSel) || RT.ACTS[0];
  const endOf = (a) => (a.end === 'full' ? R.L : a.end);

  lab.build = (el) => {
    root = el; render();
    RT.on('acts', () => { if (root.classList.contains('on')) render(); else lab.dirty = true; });
    RT.on('cfg', () => { if (cvP) drawProf(); });
    const A = RT.acts;
    A['lab.gpx'] = () => RT.dlGpx(act());
    A['lab.strava'] = () => { const a = act(); ui.dialog(`<h3>Subir a Strava</h3><p class="muted">La app no sube sola a Strava: descarga el archivo <b>.gpx</b> de la salida y abre la página de carga de Strava para que elijas ese archivo. Necesitás tener sesión iniciada en Strava y conexión a internet.</p><div class="stack" style="gap:10px"><button class="btn btn-s block" data-d="no">Cancelar</button><button class="btn btn-strava block" data-d="ok" ${an('abrirStravaUpload()')}>${I('upload', 18)} Descargar y abrir Strava</button></div>`, { on: { ok: () => { RT.dlGpx(a); ui.toast('Prototipo: acá se abriría strava.com/upload/select en otra pestaña.', 'warn', 4600); } } }); };
    A['lab.del'] = () => { const a = act(); ui.confirm('¿Eliminar esta salida?', 'Se borra de este teléfono. Si ya estaba en la nube, la copia de la nube no se toca desde acá. No se puede deshacer.', 'Eliminar', () => { const i = RT.ACTS.indexOf(a); if (i >= 0) RT.ACTS.splice(i, 1); RT.actSel = (RT.ACTS[0] || {}).id; if (!a.sync) S.pendSync = Math.max(0, S.pendSync - 1); RT.emit('acts'); ui.toast('Salida eliminada del teléfono', 'warn'); }, true); };
    A['lab.explore'] = () => { RT.go('lab'); const b = root.querySelector('#labExp'); if (!b) return; if (scrub == null) { const a = act(); scrub = (a.s0 || 0) + (endOf(a) - (a.s0 || 0)) * 0.62; paintExplore(); RT.drawAll(); } setTimeout(() => b.scrollIntoView({ block: 'center', behavior: 'smooth' }), 60); };
    A['lab.sync'] = () => { if (S.net === 'offline') return ui.toast('Sin conexión: se sube sola cuando vuelva la red', 'warn'); const a = act(); a.sync = true; S.pendSync = Math.max(0, S.pendSync - 1); RT.emit('acts'); ui.toast('Subida y confirmada por el servidor', 'ok'); };
  };
  lab.onShow = () => { if (lab.dirty) { lab.dirty = false; render(); } setTimeout(() => { RT.maps.forEach((m) => m.resize()); if (cvP) drawProf(); RT.drawAll(); }, 40); };

  function render() {
    if (map) { RT.dropMap(map); map = null; }
    const a = act();
    if (!a) { root.innerHTML = `<div class="tex"></div><div class="page"><div class="ph"><div><h1 class="page-title">Laboratorio</h1><p class="page-sub">Informe de la última salida</p></div></div><div class="card" style="text-align:center;padding:36px 16px;color:var(--muted)">${I('flask', 40)}<p style="margin-top:10px">Todavía no hay salidas para analizar. Grabá una desde el Radar.</p><button class="btn btn-p" data-act="go.radar" style="margin-top:16px">Ir al Radar</button></div></div>`; return; }
    scrub = null;
    const d = RT.fmtDate(a.fecha), segs = a.segs || [], z = a.z, zt = Math.max(1, z[0] + z[1] + z[2]);
    const zTxt = (m) => (m >= 60 ? `${Math.floor(m / 60)} h ${U.pad2(m % 60)} min` : `${m} min`);
    const st = (v, u, l, extra) => `<div><div class="num">${v}<small>${u}</small></div><div class="l">${l}${extra || ''}</div></div>`;
    root.innerHTML = `<div class="tex"></div><div class="page"><div class="ph"><div><h1 class="page-title" ${an('header · 🧪 LABORATORIO TÁCTICO')}>Laboratorio</h1><p class="page-sub">${RT.ACTS[0] === a ? 'Informe de la última salida' : 'Informe de la salida'}</p></div>
      <button class="badge ${a.sync ? '' : 'y'}" data-act="${a.sync ? 'cab.nube' : 'lab.sync'}" ${an('lab-badge-sync')} style="margin-top:6px">${I(a.sync ? 'cloudOk' : 'cloud', 15)} ${a.sync ? 'Nube lista' : S.net === 'offline' ? 'Pendiente' : 'Subir ahora'}</button></div>
      <div class="stack">
      <div class="card mapcard" style="height:230px" ${an('mapa del recorrido · enfocarMapaScrubber()')}><canvas id="cvLab"></canvas><span class="chip" style="position:absolute;left:10px;top:10px;z-index:3;background:var(--glass);color:var(--text);max-width:70%"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${U.esc(a.titulo)} · ${d.d} ${d.m.slice(0, 3).toLowerCase()}</span></span><span class="chip mcap">${I('route', 14)} ${a.demo || !a.id.startsWith('n') ? 'Traza de demostración' : 'Tu traza'}</span><button class="chip mcap2" data-act="lab.explore">${I('expand', 14)} Explorar</button></div>
      <div class="card tight" id="labExp" ${an('scrubber de ruta · enfocarMapaScrubber()')}><div class="row between"><span class="lbl">Perfil de la salida</span><span class="leg"><span><i style="background:var(--g)"></i>Llano</span><span><i style="background:var(--y)"></i>Trepada</span><span><i style="background:var(--r)"></i>Pared</span></span></div><canvas class="cv-prof" id="cvProf" style="margin-top:8px" role="img" aria-label="Perfil de elevación; arrastrá para explorar"></canvas><div class="row between" id="expRead" style="margin-top:8px;min-height:24px"><span class="muted">Arrastrá sobre el perfil para ver cada punto en el mapa.</span></div></div>
      <div class="card" ${an('seccion-reporte · Rendimiento')}><div class="lbl">Rendimiento</div><div class="big3">${st(U.num(a.dist, 1), 'km', 'Distancia')}${st(U.durHM(a.dur), 'h', 'En movimiento')}${st('+' + U.num(a.asc, 0), 'm', 'Desnivel')}${st(U.num(a.vavg, 1), 'km/h', 'Vel. media')}${st(U.num(a.vmax, 1), 'km/h', 'Vel. máxima')}${st(U.num(a.pavg, 0), 'W', 'Potencia media', '<span class="est">est.</span>')}</div><div class="hr" style="margin:14px 0 10px"></div><div class="row between muted" style="font-size:13.5px"><span>Cota cumbre <b style="color:var(--text)">${U.num(a.alt, 0)} m</b></span><span>Potencia pico <b style="color:var(--text)">${U.num(a.ppk, 0)} W</b><span class="est">est.</span></span></div></div>
      <div class="card" ${an('seccion-reporte · Carga y zonas · calcularTSS() calcularIF()')}><div class="lbl">Carga y zonas</div><div class="big3">${st(U.num(a.tss, 0), '', 'TSS', '<span class="est">est.</span>')}${st(U.num(a['if'], 2), '', 'Factor IF')}${st(String(a.rec), 'h', 'Recuperación')}</div>
        <div class="zbar" role="img" aria-label="Distribución del esfuerzo por zonas"><i style="flex:${z[0] / zt};background:var(--g)"></i><i style="flex:${z[1] / zt};background:var(--y)"></i><i style="flex:${z[2] / zt};background:var(--r)"></i></div>
        <div class="zleg"><span><i style="background:var(--g)"></i>Z1 · ${zTxt(z[0])}</span><span><i style="background:var(--y)"></i>Z2 · ${zTxt(z[1])}</span><span><i style="background:var(--r)"></i>Z3 · ${zTxt(z[2])}</span></div><p class="dim" style="font-size:12px;margin-top:10px">Zonas por terreno (llano · trepada · pared). TSS, IF y recuperación son estimaciones, no mediciones fisiológicas.</p></div>
      <div class="grid2"><div class="card tight" ${an('lab-pared-max · lab-pared-km')}><div class="lbl sm">Pared más dura</div><div class="num zt-r" style="font-size:calc(42px*var(--num));margin-top:7px">${U.num(a.wall[0], 1)} <small style="font-size:.45em">%</small></div><div class="muted" style="margin-top:4px">km ${U.num(a.wall[1], 1)}</div></div><div class="card tight" ${an('lab-lista-segmentos-sesion')}><div class="lbl sm">Segmentos PR</div><div class="num" style="font-size:calc(42px*var(--num));margin-top:7px">${a.pr}</div><div class="muted" style="margin-top:4px">en esta salida</div></div></div>
      ${segs.length ? `<div class="card tight"><div class="lbl">Segmentos de la salida</div>${segs.map((g) => `<div class="arow"><i style="background:${g.pr ? 'var(--y)' : 'var(--dim)'}"></i><span class="n">${g.n}</span><span class="l">${U.dur(g.time)}${g.pr ? ' · PR' : ''}</span></div>`).join('')}</div>` : ''}
      <div class="card" ${an('seccion-reporte · Nutrición y recarga')}><div class="lbl">Nutrición y recarga</div><div class="big3">${st(U.num(a.kcal, 0), 'kcal', 'Energía', '<span class="est">est.</span>')}${st(U.num(a.carbs, 0), 'g', 'Carbohidratos')}${st(U.num(a.fluid, 0), 'ml', 'Líquidos + sales')}</div>
        <div class="stack" style="gap:9px;margin-top:14px;font-size:14px;line-height:1.35"><div class="row" style="align-items:flex-start;gap:10px"><span class="zt-y" style="margin-top:1px">${I('zap', 17)}</span><span><b>Primeros 45 min:</b> carbohidratos de absorción rápida con proteína.</span></div><div class="row" style="align-items:flex-start;gap:10px"><span style="color:var(--d);margin-top:1px">${I('drop', 17)}</span><span><b>Rehidratación:</b> reponé líquidos con sales y electrolitos.</span></div><div class="row" style="align-items:flex-start;gap:10px"><span class="zt-g" style="margin-top:1px">${I('leaf', 17)}</span><span><b>Cena reparadora:</b> comida completa para reponer glucógeno.</span></div></div><p class="dim" style="font-size:12px;margin-top:10px">Sugerencias generales calculadas con fórmulas simples; no reemplazan a un nutricionista.</p></div>
      <div class="grid2"><button class="btn btn-s" data-act="lab.gpx" ${an('lab-btn-descarga-gpx · generarDescargaGPX()')}>${I('download', 19)} Descargar GPX</button><button class="btn btn-strava" data-act="lab.strava" ${an('abrirStravaUpload()')}>${I('upload', 19)} Subir a Strava</button></div>
      <button class="btn btn-d sm block" data-act="lab.del" ${an('eliminarActividad()')}>${I('trash', 17)} Eliminar esta salida del teléfono</button></div></div>`;
    map = new RT.RMap(root.querySelector('#cvLab'), { lab: true, sEnd: () => endOf(a), s0: a.s0 || 0, scrub: () => scrub });
    cvP = root.querySelector('#cvProf');
    initProf(a);
    setTimeout(() => { map.resize(); drawProf(); RT.drawAll(); }, 30);
  }
  RT.acts['go.radar'] = () => RT.go('radar');

  /* ---------- perfil con explorador ---------- */
  function initProf(a) {
    const posFrom = (e) => { const b = cvP.getBoundingClientRect(), x = U.clamp((e.clientX - b.left) / b.width, 0, 1), s0 = a.s0 || 0; return s0 + x * (endOf(a) - s0); };
    let down = false; const mv = (e) => { scrub = posFrom(e); paintExplore(); RT.drawAll(); };
    cvP.addEventListener('pointerdown', (e) => { down = true; cvP.setPointerCapture(e.pointerId); mv(e); });
    cvP.addEventListener('pointermove', (e) => { if (down) mv(e); });
    ['pointerup', 'pointercancel'].forEach((ev) => cvP.addEventListener(ev, () => { down = false; }));
    if (window.ResizeObserver) new ResizeObserver(() => drawProf()).observe(cvP);
  }
  function drawProf() {
    if (!cvP || !cvP.clientWidth) return; const a = act(); if (!a) return;
    const k = Math.min(2.5, window.devicePixelRatio || 1), w = cvP.clientWidth, h = cvP.clientHeight; cvP.width = Math.round(w * k); cvP.height = Math.round(h * k);
    const g = cvP.getContext('2d'); g.setTransform(k, 0, 0, k, 0, 0); g.clearRect(0, 0, w, h);
    const s0 = a.s0 || 0, s1 = endOf(a), i0 = Math.floor(s0 / 10), i1 = Math.min(R.N - 1, Math.floor(s1 / 10)); let lo = 1e9, hi = -1e9;
    for (let i = i0; i <= i1; i++) { lo = Math.min(lo, R.e[i]); hi = Math.max(hi, R.e[i]); }
    const X = (i) => 6 + ((i - i0) / Math.max(1, i1 - i0)) * (w - 12), Y = (v) => 10 + (1 - (v - lo) / Math.max(10, hi - lo)) * (h - 22), base = h - 6;
    for (let i = i0; i < i1; i++) { const col = RT.cssVar('--' + R.c[i]) || '#3ddc97'; g.fillStyle = col; g.globalAlpha = 0.22; g.beginPath(); g.moveTo(X(i), base); g.lineTo(X(i), Y(R.e[i])); g.lineTo(X(i + 1), Y(R.e[i + 1])); g.lineTo(X(i + 1), base); g.fill(); g.globalAlpha = 1; g.strokeStyle = col; g.lineWidth = 2.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(X(i), Y(R.e[i])); g.lineTo(X(i + 1), Y(R.e[i + 1])); g.stroke(); }
    g.fillStyle = RT.cssVar('--muted') || '#999'; g.font = `600 10.5px ${RT.cssVar('--font-b') || 'sans-serif'}`; g.textAlign = 'left'; g.fillText(`${U.num(hi, 0)} m`, 8, 10); g.fillText(`${U.num(lo, 0)} m`, 8, h - 9);
    if (scrub != null) { const i = Math.min(i1, Math.max(i0, scrub / 10)), x = X(i), q = RT.at(scrub); g.strokeStyle = RT.cssVar('--text') || '#fff'; g.lineWidth = 1.5; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(x, 4); g.lineTo(x, base); g.stroke(); g.setLineDash([]); g.beginPath(); g.arc(x, Y(q.e), 6, 0, 6.2832); g.fillStyle = RT.cssVar('--bg') || '#000'; g.fill(); g.lineWidth = 3; g.strokeStyle = RT.cssVar('--text') || '#fff'; g.stroke(); }
  }
  function paintExplore() {
    drawProf(); const box = root.querySelector('#expRead'); if (!box || scrub == null) return; const q = RT.at(scrub), kn = RT.ZM[q.k];
    box.innerHTML = `<span class="num" style="font-size:24px">km ${U.num(scrub / 1000, 2)}</span><span class="muted">${U.num(q.e, 0)} m</span><span class="zt-${q.c}" style="display:inline-flex;align-items:center;gap:5px;font-weight:700">${I(kn.icon, 15)}${kn.name} ${U.num(q.g, 1)} %</span>`;
  }
})();
