/* ============================================================
   Radar Live · MAPA (héroe) · CABINA (boceto A) · SUBIDA (boceto B)
   ============================================================ */
(function () {
  'use strict';
  const RT = window.RT, U = RT.U, S = RT.S, R = RT.R, I = RT.icon, an = RT.an;
  const radar = (RT.radar = {});
  let root, VM, maps = {};
  const zIcon = (k, sz) => I(RT.ZM[k].icon, sz || 14);

  /* ---------- perfil “terreno adelante” ---------- */
  function ribbon(id, o) {
    o = o || {};
    if (!S.routeLoaded) return `<div class="mnote" style="position:static;transform:none;max-width:none;margin:6px 0">Sin track cargado. Cargá un GPX en Preparación para ver el terreno de adelante.</div>`;
    const W = 340, H = o.h || 84, pT = 17, pB = 17, past = 150, hz = 1600, sA = Math.max(0, S.s - past), sB = Math.min(R.L, S.s + hz);
    const pts = []; for (let s = Math.floor(sA / 10) * 10; s <= sB; s += 10) pts.push([s, R.e[Math.min(R.N - 1, s / 10)], R.c[Math.min(R.N - 1, s / 10)]]);
    let lo = 1e9, hi = -1e9; pts.forEach((p) => { lo = Math.min(lo, p[1]); hi = Math.max(hi, p[1]); }); const rng = Math.max(40, hi - lo); lo -= 3;
    const X = (s) => ((s - sA) / (sB - sA)) * W, Y = (e) => pT + (1 - (e - lo) / (rng + 3)) * (H - pT - pB), base = H - pB;
    let svg = ''; let i = 0;
    while (i < pts.length - 1) {
      const past_ = pts[i][0] < S.s - 5, c = past_ ? 'p' : pts[i][2]; let j = i;
      while (j < pts.length - 1 && ((pts[j][0] < S.s - 5) ? 'p' : pts[j][2]) === c) j++;
      const seg = pts.slice(i, Math.min(pts.length, j + 1)), d = seg.map((p, k) => `${k ? 'L' : 'M'}${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join('');
      const col = c === 'p' ? 'var(--dim)' : `var(--${c})`;
      svg += `<path d="${d}L${X(seg[seg.length - 1][0]).toFixed(1)},${base}L${X(seg[0][0]).toFixed(1)},${base}Z" style="fill:${col};opacity:${c === 'p' ? 0.18 : 0.24}"/><path d="${d}" style="fill:none;stroke:${col};stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round"/>`;
      i = j;
    }
    const wall = RT.runsAhead(S.s, hz).find((r) => r.c === 'r' && r.end > 0);
    if (wall) { const mid = S.s + (wall.start + wall.end) / 2, ew = Math.min(...pts.filter((p) => p[0] >= S.s + wall.start && p[0] <= S.s + wall.end).map((p) => p[1])); svg += `<text x="${U.clamp(X(mid), 40, W - 40).toFixed(1)}" y="${Math.max(11, Y(ew) - 22).toFixed(1)}" text-anchor="middle" style="fill:var(--r);font-size:11.5px;font-weight:800;letter-spacing:.1em">PARED ${S.frozen ? 11 : U.num(wall.grade, 0)} %</text>`; }
    const px = X(S.s), py = Y(RT.at(S.s).e);
    svg += `<line x1="${px}" x2="${px}" y1="${py - 18}" y2="${base}" style="stroke:var(--text);stroke-width:1.6;stroke-dasharray:3 3;opacity:.85"/><circle cx="${px}" cy="${py}" r="6" style="fill:var(--bg);stroke:var(--text);stroke-width:3"/>`;
    const lab = [['VOS', S.s], ['+500 m', S.s + 500], ['+1 km', S.s + 1000], ['+1,5 km', S.s + 1500]];
    lab.forEach((l) => { if (l[1] <= sB + 1) svg += `<text x="${U.clamp(X(l[1]), l[0] === 'VOS' ? 12 : 22, W - 22).toFixed(1)}" y="${H - 3}" text-anchor="middle" style="font-size:11.5px;${l[0] === 'VOS' ? 'fill:var(--text);font-weight:800' : ''}">${l[0]}</text>`; });
    return `<svg class="ribbon" viewBox="0 0 ${W} ${H}" role="img" aria-label="Perfil de terreno por delante">${svg}</svg>`;
  }

  /* ---------- widgets activos (segmento · liebre · plan) ---------- */
  function widgets(v, kind) {
    const out = [];
    if (v.seg) { const ok = v.seg.df <= 0; out.push({ k: ok ? 'ok' : 'warn', ic: 'flag', act: 'w.seg', t: `Segmento · ${v.seg.n}`, s: `Quedan ${U.distTxt(v.seg.rem)} · PR ${U.dur(v.seg.pr)}`, n: `${U.dur(v.seg.el)}`, d: `${v.seg.df <= 0 ? '−' : '+'}${Math.abs(Math.round(v.seg.df))} s`, ps: `${U.dur(v.seg.el)} · ${v.seg.df <= 0 ? '−' : '+'}${Math.abs(Math.round(v.seg.df))} s`, an: 'banner-segmento-live' }); }
    if (v.gh) { const ahead = v.gh.df >= 0, a = Math.abs(Math.round(v.gh.df)); out.push({ k: ahead ? 'ok' : a > 20 ? 'bad' : 'warn', ic: 'ghost', act: 'w.ghost', t: `Ghost Pacer · ${v.gh.name}`, s: ahead ? 'Adelantado a la liebre' : 'Atrasado respecto de la liebre', n: `${ahead ? '+' : '−'}${U.pad2(Math.floor(a / 60))}:${U.pad2(a % 60)}`, ps: `${ahead ? '+' : '−'}${a} s ${ahead ? 'adelantado' : 'atrasado'}`, an: 'widget-ghost-pacer' }); }
    if (v.plan) out.push({ k: 'ok', ic: 'target', act: 'w.plan', t: `Plan IA · ${v.plan.n}`, s: `Fase ${v.plan.idx + 1}/${v.plan.tot}: ${v.plan.ph[0]} · ${U.num(v.plan.left, 0)} min`, n: '', ps: `Fase ${v.plan.idx + 1}/${v.plan.tot} · ${U.num(v.plan.left, 0)} min`, an: 'widget-plan-entrenamiento' });
    if (kind === 'pills') {
      if (S.trackback) out.push({ k: 'ok', ic: 'home', act: 'map.home', ps: `Volviendo al inicio · ${U.num(v.ridden / 1000, 1)} km por tu huella`, an: 'MTB-01 trackback' });
      if (S.net === 'offline') out.push({ k: S.tiles === 'none' ? 'warn' : 'ok', ic: 'wifiOff', act: 'map.tiles', ps: S.tiles === 'none' ? 'Sin mapa descargado' : 'Mapa offline', an: 'MTB-01 mapa offline' });
      return out.map((w) => `<button class="wpill" data-k="${w.k}" data-act="${w.act}" ${an(w.an, 'ex')}>${I(w.ic, 15)} ${w.ps}</button>`).join('');
    }
    return out.map((w) => `<button class="wcard" data-act="${w.act}" ${an(w.an)} style="${w.k === 'bad' ? 'border-color:var(--warn-line)' : w.k === 'ok' ? 'border-color:var(--acc-line)' : 'border-color:rgba(255,197,61,.45)'}"><span class="zt-${w.k === 'ok' ? 'g' : w.k === 'bad' ? 'r' : 'y'}">${I(w.ic, 22)}</span><span class="t"><b>${w.t}</b><small>${w.s}</small></span>${w.n ? `<span class="n zt-${w.k === 'ok' ? 'g' : w.k === 'bad' ? 'r' : 'y'}">${w.d || w.n}</span>` : ''}</button>`).join('');
  }

  /* ---------- plantillas ---------- */
  const cards3 = (cls) => `<div class="${cls}"><div class="mcard sp" ${an('card-velocidad-principal · ui-velocidad')}><div class="lbl sm">Velocidad</div><div class="v num"><span data-b="speed">0,0</span><small>km/h</small></div><div class="s" data-h="tgt"></div></div>
    <div class="mcard" ${an('ui-pendiente · badge-tipo-terreno')}><div class="lbl sm">Inclinación</div><div class="v num" data-zc><span data-b="grade">0,0</span><small>%</small></div><div class="s" data-h="zlab"></div></div>
    <div class="mcard" ${an('ui-potencia · Bike IQ')}><div class="lbl sm">Potencia</div><div class="v num"><span data-b="power">0</span><small>W</small></div><div class="s">Bike IQ <span class="est">est.</span></div></div></div>`;
  const stats4 = () => `<div class="stats4" ${an('grid-metricas-secundarias-4')}>${[['dist', 'km', 'Distancia'], ['time', '', 'Tiempo'], ['asc', 'm', 'Ascenso'], ['kcal', 'kcal', 'Calorías']].map((x) => `<div class="stat"><div class="v"><span data-b="${x[0]}">0</span>${x[1] ? `<small>${x[1]}</small>` : ''}</div><div class="l">${x[2]}${x[0] === 'kcal' ? '<span class="est">est.</span>' : ''}</div></div>`).join('')}</div>`;
  const ctl = () => `<div class="ctl"><button class="btn btn-p" data-act="rec.toggle" data-b-btn="rec" ${an('btn-start · toggleIniciarPausar()')}></button><button class="btn btn-d" data-act="rec.finish" data-b-btn="fin" ${an('btn-finish · finalizarEntrenamiento()')}>${I('stop', 15)} Finalizar</button></div>`;
  const alertCard = (cls) => `<div class="${cls}" data-bc ${an('ui-card-aviso-tactico')}><div class="ai" data-h="aicon"></div><div class="at"><div class="am" data-b="ameta">PACING COACH</div><div class="ah" data-b="atitle"></div><div class="as" data-b="asub"></div></div>`;

  radar.build = (el) => {
    root = el;
    el.innerHTML = `<div class="tex"></div>
    <header class="rh"><div class="logo" ${an('header-radar-moderno')}>${I('radar', 28)}<b>Radar Táctico</b></div>
      <div class="rh-r"><span class="pill" id="pGps" data-act="hdr.gps" ${an('pildora-gps-header · actualizarSenalGPS()')}><i class="dot"></i><span>GPS</span></span><button class="pill" id="pVoz" data-act="hdr.voice" ${an('pildora-voz-header')}><i class="dot"></i><span>Voz</span></button><button class="ibtn" data-act="hdr.cab" aria-label="Ajustes de cabina" ${an('btn-header-ajustes · toggleRanuraCockpit()')}>${I('sliders', 22)}</button></div></header>
    <div class="sysbar" id="sysbar" hidden></div>
    <div class="vrow"><div class="seg" id="vseg" ${an('Mapa · Cabina (A) · Subida (B)', 'prop')}>${[['mapa', 'Mapa'], ['cabina', 'Cabina'], ['subida', 'Subida']].map((v) => `<button data-act="rv" data-v="${v[0]}">${v[1]}</button>`).join('')}</div><div class="rec" id="recChip" ${an('estado de grabación', 'prop')}><i></i><span>LISTO</span></div></div>
    <div class="rbody" id="rbody" data-view="mapa">
      <section class="v v-mapa">
        <div class="mapwrap" id="mapwrap"><canvas id="cvMain"></canvas>
          <div class="mo mo-top"><div class="strip" ${an('grid-metricas-secundarias-4')}><div><b data-b="dist">0</b><small>km</small></div><div><b data-b="time">00:00</b></div><div><b data-b="asc">+0</b><small>m</small></div></div>${alertCard('malert').replace('data-bc', 'data-bc data-act="alert.repeat"')}<div class="big" data-h="abig" hidden></div></div></div>
          <div class="mo mo-left"><button class="mbtn sos" data-act="map.sos" ${an('btn-sos · compartirUbicacionWhatsApp()')}>SOS</button><button class="mbtn" data-act="map.home" data-b-on="trackback" aria-label="Volver al inicio" ${an('MTB-01 · volver al inicio', 'prop')}>${I('home', 22)}</button><button class="mbtn zbtn" data-act="map.zin" aria-label="Acercar">${I('plus', 22)}</button><button class="mbtn zbtn" data-act="map.zout" aria-label="Alejar">${I('minus', 22)}</button></div>
          <div class="mo mo-right"><button class="mbtn" data-act="map.layers" id="bLayers" aria-label="Capas" ${an('L.control.layers · CyclOSM/OpenTopo/Satélite')}>${I('layers', 22)}</button><button class="mbtn zbtn" data-act="map.north" id="bNorth" aria-label="Orientación">${I('compass', 22)}</button><button class="mbtn" data-act="map.locate" id="bLocate" aria-label="Seguir mi posición" ${an('mapa.panTo(posición)')}>${I('locate', 22)}</button></div>
          <div class="mo mo-bot"><span class="sbar" id="sbar"><i></i><span>100 m</span></span><span data-h="pills" style="display:contents"></span></div>
          <div class="mnote" id="mnote" hidden></div><div id="popHost"></div></div>
        <div class="dock" id="dock" data-m="full"><button class="handle" data-act="dock.cycle" aria-label="Cambiar tamaño del panel"><i></i></button>
          ${cards3('dm')}<div class="dribbon" ${an('widget-climbpro · actualizarClimbPro()')}><div class="rb-h"><span class="lbl sm">Terreno adelante</span><span class="leg"><span><i style="background:var(--g)"></i>Llano</span><span><i style="background:var(--y)"></i>Trepada</span><span><i style="background:var(--r)"></i>Pared</span></span></div><div data-ribbon="dock"></div></div>
          <div class="hudmini"><span class="num" data-b="speed">0</span><small>km/h</small><span class="num zt-g" data-zc style="font-size:30px"><span data-b="grade">0</span>%</span></div>${ctl()}</div>
      </section>
      <section class="v v-cabina"><div class="vscroll">
        <div class="seg scroll modes" ${an('selector-modo-scroll · cambiarModoEntrenamiento()')}>${Object.keys(RT.MODES).map((k) => `<button data-act="mode.set" data-k="${k}">${RT.MODES[k].n}</button>`).join('')}</div>
        ${alertCard('aviso')}<button class="asp" data-act="alert.repeat" aria-label="Repetir aviso" style="display:none"></button></div>
        <div class="widgets" data-h="widgets"></div>
        <div class="mini" ${an('mapa en miniatura', 'prop')}><canvas id="cvMiniA"></canvas><button class="chip mcap2" data-act="rv" data-v="mapa">${I('expand', 14)} Mapa</button></div>
        <div class="a-tele"><div class="card spd" ${an('card-velocidad-principal')}><div class="lbl">Velocidad</div><div class="v num" data-b="speed">0,0</div><div class="u"><span>km/h</span><span class="tg" data-b="tgt2" ${an('ui-velocidad-target · calcularVelocidadTarget()')}></span></div></div><div class="col"><div class="mcard" ${an('ui-pendiente · badge-tipo-terreno')}><div class="lbl sm">Inclinación</div><div class="v num" data-zc><span data-b="grade">0,0</span><small>%</small></div><div class="s" data-h="zlab"></div></div><div class="mcard" ${an('ui-potencia')}><div class="lbl sm">Potencia</div><div class="v num"><span data-b="power">0</span><small>W</small></div><div class="s">Bike IQ <span class="est">est.</span></div></div></div></div>
        <div class="card pzone" data-h="pzone" ${an('grafico-zonas-box · actualizarGraficoZonas()')}></div>
        <div class="card tight" ${an('widget-climbpro')}><div class="row between"><span class="lbl">Terreno adelante</span><span class="leg"><span><i style="background:var(--g)"></i>Llano</span><span><i style="background:var(--y)"></i>Trepada</span><span><i style="background:var(--r)"></i>Pared</span></span></div><div data-ribbon="a"></div><div class="row between muted" style="font-size:12.5px;margin-top:2px"><span data-b="cpLen"></span><span data-b="cpAvg"></span></div></div>
        ${stats4()}${ctl()}</div></section>
      <section class="v v-subida"><div class="vscroll">
        <div class="card hero" data-bc ${an('próximo tramo · ClimbPro')}><div class="hm"><span class="row" style="gap:7px">${I('volume', 16)} Próximo tramo</span><span class="zchip" data-zattr data-b="nkind"></span></div><div class="hbig"><span data-b="ndist">—</span><small data-b="nunit"></small></div><div class="ht" data-b="ndesc"></div><div data-ribbon="b"></div></div>
        <div class="mini" ${an('mapa en miniatura', 'prop')}><canvas id="cvMiniB"></canvas><button class="chip mcap2" data-act="rv" data-v="mapa">${I('expand', 14)} Mapa</button></div>
        ${cards3('grid3 dm-b')}
        <div class="widgets" data-h="widgets"></div>
        <div class="card"><div class="lbl">Después</div><div data-h="after" style="margin-top:6px"></div></div>
        ${stats4()}${ctl()}</div></section>
    </div>`;
    maps.main = new RT.RMap(el.querySelector('#cvMain'), { interactive: true });
    maps.a = new RT.RMap(el.querySelector('#cvMiniA'), { mini: true, mpp: 6 });
    maps.b = new RT.RMap(el.querySelector('#cvMiniB'), { mini: true, mpp: 6 });
    el.querySelector('.rbody').classList.add('built');
    /* acciones */
    const A = RT.acts;
    A.rv = (t) => { S.view = t.dataset.v; RT.setCfg('view', S.view, true); radar.update(true); setTimeout(() => { RT.maps.forEach((m) => m.resize()); RT.drawAll(); }, 30); };
    A['rec.toggle'] = () => RT.rec.toggle(); A['rec.finish'] = () => RT.rec.askFinish();
    A['dock.cycle'] = () => { S.dock = { full: 'compact', compact: 'hide', hide: 'full' }[S.dock]; RT.setCfg('dock', S.dock, true); radar.update(true); setTimeout(() => { RT.maps.forEach((m) => m.resize()); RT.drawAll(); }, 30); };
    A['hdr.cab'] = () => RT.ui.cabina(); A['hdr.voice'] = () => RT.setVoice(!S.voice);
    A['hdr.gps'] = () => RT.ui.toast({ ok: `GPS correcto · precisión ±${S.acc} m`, weak: `GPS débil (±${S.acc} m): la distancia puede ser imprecisa`, search: 'Buscando satélites…', lost: 'Sin señal GPS: la grabación espera hasta recuperarla' }[S.gps], S.gps === 'ok' ? 'ok' : 'warn');
    A['map.sos'] = () => RT.ui.sos();
    A['map.home'] = () => { if (S.trackback) { S.trackback = false; RT.ui.toast('Volver al inicio cancelado', 'warn'); } else { S.trackback = true; RT.ui.toast('Volviendo por tu misma huella. No es una ruta calculada por senderos.', 'ok', 4200); } RT.drawAll(); radar.update(true); };
    A['map.zin'] = () => RT.zoomBy(0.7); A['map.zout'] = () => RT.zoomBy(1.4);
    A['map.north'] = () => { S.headUp = !S.headUp; RT.ui.toast(S.headUp ? 'Mapa con rumbo arriba' : 'Norte arriba', 'ok', 1600); RT.drawAll(); radar.update(true); };
    A['map.locate'] = () => { RT.recenter(); radar.update(true); };
    A['map.layers'] = () => { S.layersOpen = !S.layersOpen; radar.layersPop(); };
    A['map.tiles'] = () => RT.ui.toast(S.tiles === 'none' ? 'No hay mapa descargado para esta zona. Descargalo en Preparación › Mapas offline, con conexión.' : 'Usando el mapa descargado (sin conexión).', S.tiles === 'none' ? 'warn' : 'ok', 4200);
    A['alert.repeat'] = () => { const a = VM.al; const v = S.voice; S.voice = true; RT.speak(`${a.title}. ${a.sub}`); S.voice = v; if (!('speechSynthesis' in window)) RT.ui.toast(a.title, 'warn'); };
    A['mode.set'] = (t) => { S.mode = t.dataset.k; RT.ui.toast(RT.MODES[S.mode].t, 'ok', 1800); radar.update(true); };
    A['w.seg'] = () => RT.ui.toast(`Segmento: ${VM.seg ? VM.seg.n : ''}. El cronómetro corre solo al cruzar el inicio.`, 'ok'); A['w.ghost'] = () => RT.ui.ghost(); A['w.plan'] = () => RT.prep.openPlan();
    A['ly.style'] = (t) => { RT.setCfg('mapStyle', t.dataset.k); radar.layersPop(); }; A['ly.tg'] = (t) => { RT.setCfg(t.dataset.k, !RT.cfg[t.dataset.k]); radar.layersPop(); };
    A['ly.fit'] = () => { RT.fitRoute(); S.layersOpen = false; radar.layersPop(); }; A['ly.home'] = () => { S.layersOpen = false; radar.layersPop(); A['map.home'](); };
    RT.on('tick', () => radar.update()); RT.on('mode', () => radar.update(true)); RT.on('follow', () => radar.update(true)); RT.on('zoom', () => radar.update());
    RT.on('cfg', (d) => { if (d.k === 'view') { S.view = RT.cfg.view; } if (d.k === 'dock') S.dock = RT.cfg.dock; radar.update(true); });
    RT.on('scenario', () => radar.update(true));
    S.view = RT.cfg.view; S.dock = RT.cfg.dock;
    radar.update(true);
  };

  /* ---------- popover de capas ---------- */
  radar.layersPop = () => {
    const host = root.querySelector('#popHost'); if (!S.layersOpen) { host.innerHTML = ''; return; }
    const st = RT.cfg.mapStyle, sw = { tactico: '#0a110f', topo: '#eee8d4', sat: '#1c2a1a', solar: '#f5f5ef' };
    const tg = (k, ic, t) => `<button class="opt ${RT.cfg[k] ? 'on' : ''}" data-act="ly.tg" data-k="${k}">${I(ic, 17)}${t}<span class="tg"></span></button>`;
    host.innerHTML = `<div class="pop"><h4>Mapa base</h4>${[['auto', 'Automático', '#44574f'], ['tactico', 'Táctico oscuro', sw.tactico], ['topo', 'Topográfico', sw.topo], ['sat', 'Satélite', sw.sat], ['solar', 'Solar claro', sw.solar]].map((o) => `<button class="opt ${st === o[0] ? 'on' : ''}" data-act="ly.style" data-k="${o[0]}"><span class="sw" style="background:${o[2]}"></span>${o[1]}</button>`).join('')}<h4>Capas</h4>${tg('lyRoute', 'route', 'Ruta GPX')}${tg('lyKm', 'flag', 'Kilómetros')}${tg('lySegs', 'medal', 'Segmentos')}${tg('lyContours', 'mountain', 'Curvas de nivel')}${tg('lyLabels', 'map', 'Nombres')}<h4>Navegación</h4><button class="opt" data-act="ly.fit">${I('expand', 17)}Encuadrar toda la ruta</button><button class="opt ${S.trackback ? 'on' : ''}" data-act="ly.home">${I('home', 17)}Volver al inicio<span class="ptag prop">MTB-01</span></button></div>`;
  };

  /* ---------- actualización de pantalla ---------- */
  const setTxt = (key, val) => root.querySelectorAll(`[data-b="${key}"]`).forEach((n) => { if (n.textContent !== val) n.textContent = val; });
  const setHtml = (key, val) => root.querySelectorAll(`[data-h="${key}"]`).forEach((n) => { if (n._v !== val) { n._v = val; n.innerHTML = val; } });
  const pbar = (w) => { const z = RT.pzone(w); return `<div class="row between"><b style="font-size:15px">Zona ${z} · ${RT.PZN[z]}</b><span class="muted" style="font-size:12.5px">${S.mode === 'LIBRE' ? 'Target: métricas abiertas' : RT.MODES[S.mode].b}</span></div><div class="zb">${['Z1', 'Z2', 'Z3', 'Z4', 'Z5', 'Z6+'].map((n, i) => `<span class="${z === i + 1 ? 'on' : ''}">${n}</span>`).join('')}</div>`; };
  radar.update = (force) => {
    if (!root) return; if (S.tab !== 'radar' && !force) return; const v = (VM = RT.vm()), idle = S.rec === 'idle', done = S.rec === 'done';
    const mapView = S.view === 'mapa';
    root.querySelector('#rbody').dataset.view = S.view;
    root.querySelectorAll('#vseg button').forEach((b) => b.classList.toggle('on', b.dataset.v === S.view));
    root.querySelectorAll('.modes button').forEach((b) => b.classList.toggle('on', b.dataset.k === S.mode));
    root.querySelector('#dock').dataset.m = S.dock;
    /* cabecera */
    const gps = root.querySelector('#pGps'), gs = { ok: ['ok', 'GPS'], weak: ['warn', `GPS ±${S.acc}`], search: ['warn', 'Buscando'], lost: ['bad', 'Sin GPS'] }[S.gps];
    gps.dataset.s = gs[0]; gps.lastElementChild.textContent = gs[1];
    const voz = root.querySelector('#pVoz'); voz.dataset.s = S.voice ? 'ok' : 'off'; voz.lastElementChild.textContent = 'Voz'; voz.title = S.voice ? 'Voz activada' : 'Voz apagada';
    const rc = root.querySelector('#recChip'), rs = { idle: ['idle', 'LISTO'], rec: ['rec', 'REC ' + U.dur(v.t)], paused: ['paused', 'PAUSA ' + U.dur(v.t)], done: ['done', 'GUARDADA'] }[S.rec];
    rc.dataset.s = rs[0]; rc.lastElementChild.textContent = rs[1];
    /* banner de estado (prioridad) */
    const sb = root.querySelector('#sysbar'); let msg = null;
    const age = S.lostAt ? Math.round((Date.now() - S.lostAt) / 1000) : 0;
    if (S.gps === 'lost') msg = ['bad', 'satellite', `Sin señal GPS: la grabación espera. Última posición válida hace ${age} s.`];
    else if (S.gps === 'search') msg = ['warn', 'satellite', 'Buscando satélites… esperá la señal antes de salir.'];
    else if (S.gps === 'weak') msg = ['warn', 'satellite', `GPS débil (±${S.acc} m): la distancia y el desnivel pueden ser imprecisos.`];
    else if (S.net === 'offline') msg = [S.tiles === 'none' ? 'warn' : 'info', 'wifiOff', S.tiles === 'none' ? 'Sin conexión y sin mapa descargado: se ve tu traza, sin mapa de fondo.' : 'Sin conexión: seguís viendo el mapa descargado. Las salidas se suben después.'];
    else if (S.rec === 'paused') msg = ['warn', 'pause', 'Grabación en pausa: no se suma distancia ni tiempo.'];
    else if (idle && S.pendSync) msg = ['info', 'cloud', `${S.pendSync} salidas sin subir a la nube.`];
    sb.hidden = !msg; if (msg) { sb.dataset.k = msg[0]; const h = I(msg[1], 18) + `<span>${msg[2]}</span>`; if (sb._h !== h) { sb._h = h; sb.innerHTML = h; } }
    /* números */
    setTxt('speed', U.num(v.v, 1)); setTxt('grade', U.num(v.g, 1)); setTxt('power', String(Math.round(v.p))); setTxt('dist', U.num(v.dist / 1000, 2)); setTxt('time', U.dur(v.t)); setTxt('asc', '+' + Math.round(v.asc)); setTxt('kcal', String(Math.round(v.kcal)));
    root.querySelectorAll('[data-zc]').forEach((n) => { n.className = n.className.replace(/\bzt-\w\b/g, '').trim() + ' zt-' + v.zc; });
    setHtml('zlab', `<span class="zt-${v.zc}" style="display:inline-flex;align-items:center;gap:4px">${zIcon(v.kind, 13)}${RT.ZM[v.kind].name.toUpperCase()}</span>`);
    const tgt = v.v < 1 || idle ? '' : `Objetivo ${U.num(v.tgt, 0)} · ${v.tdiff}`; setHtml('tgt', tgt ? `<span class="muted" style="text-transform:none;letter-spacing:0;font-weight:600">${tgt}</span>` : ''); setTxt('tgt2', tgt);
    setHtml('pzone', pbar(v.p));
    /* aviso */
    const al = v.al; root.querySelectorAll('[data-bc]').forEach((n) => (n.dataset.c = al.c));
    setTxt('ameta', al.meta); setTxt('atitle', al.title); setTxt('asub', al.sub);
    setHtml('aicon', I(al.icon, 24));
    const big = root.querySelector('[data-h="abig"]'); void big;
    /* próximo tramo / después */
    let nx = v.next, af = v.after.slice();
    if (S.frozen && nx && nx.c === 'r') { nx = Object.assign({}, nx, { start: 400, full: 300, clen: 300, grade: 11 }); af = [{ c: 'y', name: 'Trepada', kind: 'TREPADA', grade: 6, start: 700, clen: 400 }, { c: 'g', name: 'Llano y bajada', kind: 'MIXTO', grade: 0, start: 1100, clen: 500 }]; }
    const hero = root.querySelector('.hero'); if (hero) hero.dataset.c = nx ? nx.c : 'g';
    if (nx) { const d = nx.start; setTxt('ndist', d < 1000 ? String(Math.round(d / 10) * 10) : U.num(d / 1000, 1)); setTxt('nunit', d < 1000 ? 'm' : 'km'); setTxt('ndesc', nx.c === 'g' ? `${nx.name} durante ${U.distTxt(nx.full)}` : `${nx.name} de ${U.num(nx.grade, 0)} % durante ${U.distTxt(nx.full)}`); const nk = root.querySelector('[data-b="nkind"]'); nk.dataset.z = nx.c; nk.innerHTML = `${zIcon(nx.kind === 'MIXTO' ? 'LLANO' : nx.kind, 13)}${nx.name.toUpperCase()}`; }
    else { setTxt('ndist', '—'); setTxt('nunit', ''); setTxt('ndesc', S.routeLoaded ? 'Sin cambios de terreno por delante' : 'Sin track cargado: cargá un GPX en Preparación'); const nk = root.querySelector('[data-b="nkind"]'); nk.dataset.z = 'g'; nk.innerHTML = `${zIcon('LLANO', 13)}SIN CAMBIOS`; }
    setHtml('after', af.length ? af.map((r) => `<div class="arow"><i style="background:var(--${r.c})"></i><span class="d">A ${U.distTxt(r.start)}</span><span class="n">${r.kind === 'TREPADA' || r.kind === 'PARED' ? `${r.name} ${U.num(r.grade, 0)} %` : r.name}</span><span class="l">${U.distTxt(r.clen)}${r.clipped ? '+' : ''}</span></div>`).join('') : `<div class="muted" style="padding:8px 0">${S.routeLoaded ? 'No hay más cambios a la vista.' : 'Necesita un track GPX cargado.'}</div>`);
    const win = v.ahead.length ? v.ahead[v.ahead.length - 1].end : 0; let avg = 0; if (v.ahead.length) { const e1 = RT.at(Math.min(R.L, S.s + 1500)).e - RT.at(S.s).e; avg = e1 / Math.min(1500, R.L - S.s) * 100; }
    setTxt('cpLen', S.routeLoaded ? `Próximos ${U.num(Math.min(1500, R.L - S.s) / 1000, 1)} km` : ''); setTxt('cpAvg', S.routeLoaded ? `Pendiente media: ${U.num(avg, 1)} %` : '');
    /* widgets */
    setHtml('widgets', widgets(v, 'cards')); setHtml('pills', widgets(v, 'pills'));
    /* mapa: alerta grande solo cuando hay distancia */
    const mo = root.querySelector('.malert'); if (mo) { let big2 = mo.querySelector('.big'); if (al.dist != null && !idle) { if (!big2) { big2 = document.createElement('div'); big2.className = 'big'; mo.appendChild(big2); } const t = al.dist < 1000 ? `${Math.round(al.dist / 10) * 10}<small>m</small>` : `${U.num(al.dist / 1000, 1)}<small>km</small>`; if (big2._v !== t) { big2._v = t; big2.innerHTML = t; } } else if (big2) big2.remove(); }
    /* botones de control */
    root.querySelectorAll('[data-b-btn="rec"]').forEach((b) => { const m = { idle: ['play', 'Iniciar recorrido', 'btn btn-p'], rec: ['pause', 'Pausar', 'btn btn-p'], paused: ['play', 'Reanudar', 'btn btn-y'], done: ['play', 'Nueva salida', 'btn btn-p'] }[S.rec]; const h = I(m[0], 20) + ' ' + m[1]; if (b._h !== h) { b._h = h; b.innerHTML = h; } b.className = m[2]; });
    root.querySelectorAll('[data-b-btn="fin"]').forEach((b) => b.classList.toggle('dis', idle || done));
    root.querySelector('[data-b-on="trackback"]').classList.toggle('on', S.trackback);
    root.querySelector('#bLocate').classList.toggle('on', S.follow); root.querySelector('#bLocate').style.opacity = S.follow ? 1 : 1;
    root.querySelector('#bNorth').classList.toggle('on', S.headUp);
    const sbar = RT.scaleBar(); const sb2 = root.querySelector('#sbar'); sb2.firstElementChild.style.width = sbar.px + 'px'; sb2.lastElementChild.textContent = sbar.txt;
    const note = root.querySelector('#mnote'); const nt = S.net === 'offline' && S.tiles === 'none' ? 'Sin mapa de fondo: solo se dibuja tu traza.' : ''; note.hidden = !nt; note.textContent = nt;
    const mw = root.querySelector('#mapwrap'); mw.classList.toggle('tight', mw.clientHeight < 340);
    /* perfiles (se redibujan solo si cambió la posición) */
    const sig = Math.round(S.s / 6) + '|' + S.routeLoaded + '|' + S.frozen;
    root.querySelectorAll('[data-ribbon]').forEach((n) => { if (n.offsetParent === null && !force) return; const key = n.dataset.ribbon + sig; if (n._k !== key || force) { n._k = key; n.innerHTML = ribbon(n.dataset.ribbon, { h: n.dataset.ribbon === 'b' ? 96 : n.dataset.ribbon === 'dock' ? 66 : 92 }); } });
  };
  /* iconos auxiliares de CSS */
  const st = document.createElement('style'); st.textContent = '.sbar{display:inline-flex;align-items:center;gap:6px;height:22px;padding:0 8px;border-radius:8px;background:var(--glass);border:1px solid var(--line2);font:700 11px var(--font-b);color:var(--text)}.sbar i{display:block;height:5px;border:2px solid var(--text);border-top:0;border-radius:0 0 1px 1px}.mapwrap.tight .zbtn{display:none}.dm-b{margin:0}.dm-b .mcard .v{font-size:calc(40px*var(--num))}.dm-b .mcard.sp .v{font-size:calc(40px*var(--num))}.dm-b{grid-template-columns:repeat(3,1fr)}.hero .zchip{height:24px}'; document.head.appendChild(st);
})();
