/* ============================================================
   Panel Tweaks (variaciones de diseño + simulación de escenarios) y aplicación de la configuración
   ============================================================ */
(function () {
  'use strict';
  const RT = window.RT, U = RT.U, S = RT.S, I = RT.icon, ui = RT.ui;
  const tw = (RT.tw = {});
  const DEVS = [['390x844', '390 × 844'], ['360x780', '360 × 780'], ['412x915', '412 × 915'], ['430x932', '430 × 932'], ['320x640', '320 × 640']];

  /* ---------- aplicar configuración a la página ---------- */
  RT.applyCfg = () => {
    const c = RT.cfg, b = document.body, d = b.dataset, st = b.style;
    d.pal = c.pal; d.zones = c.zones; d.contrast = c.contrast; d.font = c.font; d.tex = c.tex; d.glow = c.glow; d.nav = c.nav; d.frame = c.frame; d.an = c.an; d.props = c.props;
    st.setProperty('--num', c.num); st.setProperty('--tx', c.tx); st.setProperty('--rad', c.rad + 'px');
    st.setProperty('--sp', { compacto: 0.84, normal: 1, amplio: 1.14 }[c.sp] || 1);
    if (c.contrast === 'high') st.removeProperty('--bw'); else st.setProperty('--bw', c.bw + 'px');
    const [w, h] = c.dev.split('x').map(Number); st.setProperty('--dw', w + 'px'); st.setProperty('--dh', h + 'px');
    S.solar = c.pal === 'sol';
    RT.refit();
  };
  RT.refit = () => {
    const wrap = document.getElementById('devwrap'); if (!wrap) return; const st = document.body.style, [dw, dh] = RT.cfg.dev.split('x').map(Number);
    let fit = 1; if (window.innerWidth > 560) fit = Math.min(1, (wrap.clientWidth - 40) / dw, (wrap.clientHeight - 40) / dh);
    fit = Math.max(0.35, fit); RT.fit = fit; st.setProperty('--fit', fit.toFixed(4));
    setTimeout(() => { RT.maps.forEach((m) => m.resize()); RT.drawAll(); }, 20);
  };
  window.addEventListener('resize', () => RT.refit());

  /* ---------- esquema del panel ---------- */
  const seg = (k, label, opts, hint) => ({ t: 'seg', k, label, opts, hint });
  const GROUPS = [
    { id: 'sim', n: 'Escenarios y simulación', c: [
      { t: 'scen' },
      { t: 'sim' },
      seg('gps', 'Señal GPS', [['ok', 'Buena'], ['weak', 'Débil'], ['search', 'Buscando'], ['lost', 'Perdida']], 'Se prueban los estados honestos del GPS.'),
      seg('net', 'Conexión', [['online', 'Con red'], ['offline', 'Sin red']]),
      seg('tiles', 'Mapa descargado', [['ok', 'Sí'], ['none', 'No']], 'Sin red y sin mapa: el radar dibuja solo tu traza.'),
      { t: 'btns', b: [['tw.fall', 'Simular caída'], ['tw.lock', 'Bloquear pantalla'], ['tw.sos', 'Abrir SOS']] }
    ] },
    { id: 'radar', n: 'Radar · mapa del trayecto', c: [
      seg('view', 'Vista', [['mapa', 'Mapa'], ['cabina', 'Cabina'], ['subida', 'Subida']], 'Mapa = grabación con el trayecto como protagonista.'),
      seg('dock', 'Panel inferior', [['full', 'Completo'], ['compact', 'Compacto'], ['hide', 'Oculto']]),
      seg('mapStyle', 'Estilo de mapa', [['auto', 'Auto'], ['tactico', 'Táctico'], ['topo', 'Topo'], ['sat', 'Satélite'], ['solar', 'Solar']]),
      seg('routeColor', 'Color de la traza', [['semaforo', 'Semáforo'], ['velocidad', 'Velocidad'], ['mono', 'Un color']]),
      { t: 'rng', k: 'trailW', label: 'Grosor de la traza', min: 3, max: 11, step: 1, fmt: (v) => v + ' px' },
      { t: 'tog', k: 'lyRoute', label: 'Ruta GPX por delante' }, { t: 'tog', k: 'lyKm', label: 'Kilómetros' }, { t: 'tog', k: 'lySegs', label: 'Segmentos' }, { t: 'tog', k: 'lyContours', label: 'Curvas de nivel' }, { t: 'tog', k: 'lyLabels', label: 'Nombres de lugares' }
    ] },
    { id: 'color', n: 'Color', c: [
      { t: 'sw', k: 'pal', label: 'Paleta', opts: [['verde', 'Verde táctico', '#0A110F', '#3DDC97'], ['semaforo', 'Semáforo', '#121210', '#2BD97C'], ['hud', 'HUD', '#000000', '#4FD8F0'], ['cerro', 'Cerro', '#0E1424', '#FF8A3D'], ['sol', 'Solar (alto contraste)', '#F3F0E8', '#0A7A47']] },
      seg('zones', 'Colores de zona', [['std', 'Verde · amarillo · rojo'], ['cb', 'Apto daltonismo']], 'El significado también va en texto e ícono.'),
      seg('contrast', 'Contraste', [['normal', 'Normal'], ['high', 'Alto']]),
      { t: 'tog', k: 'glowT', label: 'Brillo en tarjetas', map: 'glow' }
    ] },
    { id: 'type', n: 'Tipografía', c: [
      seg('font', 'Familia', [['barlow', 'Barlow Cond.'], ['archivo', 'Archivo'], ['shoulders', 'Big Shoulders'], ['b612', 'B612 (cabina)']], 'B612 fue diseñada para cabinas de avión.'),
      { t: 'rng', k: 'num', label: 'Tamaño de números', min: 0.85, max: 1.25, step: 0.05, fmt: (v) => Math.round(v * 100) + ' %' },
      { t: 'rng', k: 'tx', label: 'Tamaño de texto', min: 0.9, max: 1.25, step: 0.05, fmt: (v) => Math.round(v * 100) + ' %' }
    ] },
    { id: 'shape', n: 'Forma, espacio y textura', c: [
      { t: 'rng', k: 'rad', label: 'Redondeo', min: 6, max: 30, step: 2, fmt: (v) => v + ' px' },
      seg('sp', 'Densidad', [['compacto', 'Compacta'], ['normal', 'Normal'], ['amplio', 'Amplia']]),
      { t: 'rng', k: 'bw', label: 'Grosor de bordes', min: 0, max: 2, step: 0.5, fmt: (v) => v + ' px' },
      seg('nav', 'Navegación', [['bar', 'Barra'], ['icons', 'Solo íconos'], ['pill', 'Flotante']]),
      seg('tex', 'Textura de fondo', [['none', 'Ninguna'], ['grid', 'Cuadrícula'], ['topo', 'Topo'], ['grain', 'Grano'], ['scan', 'Líneas']])
    ] },
    { id: 'dev', n: 'Dispositivo y anotaciones', c: [
      seg('dev', 'Tamaño de pantalla', DEVS),
      seg('frame', 'Marco de teléfono', [['on', 'Con marco'], ['off', 'Sin marco']]),
      { t: 'tog', k: 'anT', label: 'Anotaciones: elemento → función del código', map: 'an', hint: 'Cada recuadro muestra la función o el id del repo que respalda ese elemento. Verde = existe · Amarillo = demo · Violeta = propuesta.' },
      { t: 'tog', k: 'propsT', label: 'Mostrar etiquetas “propuesta”', map: 'props' }
    ] }
  ];
  const shut = new Set(['dev', 'shape', 'type']);
  let body;

  const val = (k) => (k === 'gps' ? S.gps : k === 'net' ? S.net : k === 'tiles' ? S.tiles : RT.cfg[k]);
  const ctrl = (c) => {
    if (c.t === 'scen') return `<div class="tw-c"><label>Escenario <em>cambia el estado de la salida</em></label><div class="tw-seg">${RT.SCEN.map((s) => `<button data-act="tw.scen" data-k="${s[0]}" class="${tw.scen === s[0] ? 'on' : ''}">${s[1]}</button>`).join('')}</div></div>`;
    if (c.t === 'sim') return `<div class="tw-c"><label>Simulador <em>${S.rec === 'rec' ? 'grabando' : 'sin grabar'}</em></label><div class="tw-row"><button class="tw-btn ${S.playing ? '' : 'p'}" data-act="tw.play">${S.playing ? 'Pausar simulación' : 'Reproducir ruta'}</button></div><div class="tw-seg" style="margin-top:6px">${[1, 5, 10, 30].map((k) => `<button data-act="tw.simk" data-k="${k}" class="${S.simK === k ? 'on' : ''}">${k}×</button>`).join('')}</div></div>`;
    if (c.t === 'btns') return `<div class="tw-row">${c.b.map((b) => `<button class="tw-btn" data-act="${b[0]}">${b[1]}</button>`).join('')}</div>`;
    if (c.t === 'seg') return `<div class="tw-c"><label>${c.label}</label><div class="tw-seg">${c.opts.map((o) => `<button data-act="tw.set" data-k="${c.k}" data-v="${o[0]}" class="${String(val(c.k)) === String(o[0]) ? 'on' : ''}">${o[1]}</button>`).join('')}</div>${c.hint ? `<div class="tw-note" style="margin-top:5px">${c.hint}</div>` : ''}</div>`;
    if (c.t === 'sw') return `<div class="tw-c"><label>${c.label} <em>${(c.opts.find((o) => o[0] === RT.cfg[c.k]) || [])[1] || ''}</em></label><div class="tw-sw">${c.opts.map((o) => `<button data-act="tw.set" data-k="${c.k}" data-v="${o[0]}" class="${RT.cfg[c.k] === o[0] ? 'on' : ''}" title="${o[1]}" aria-label="${o[1]}"><i style="background:${o[2]}"></i><i style="background:${o[3]}"></i></button>`).join('')}</div></div>`;
    if (c.t === 'rng') return `<div class="tw-c"><label>${c.label} <em id="twv-${c.k}">${c.fmt(RT.cfg[c.k])}</em></label><input class="tw-r" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${RT.cfg[c.k]}" data-chg="tw.rng" data-k="${c.k}"></div>`;
    if (c.t === 'tog') { const on = c.map ? (c.map === 'glow' ? RT.cfg.glow === 'on' : c.map === 'an' ? RT.cfg.an === 'on' : RT.cfg.props === 'on') : RT.cfg[c.k]; return `<div class="tw-c"><button class="tw-t" style="width:100%" data-act="tw.tog" data-k="${c.k}" aria-pressed="${!!on}"><span>${c.label}</span><span class="tgl ${on ? 'on' : ''}"></span></button>${c.hint ? `<div class="tw-note" style="margin-top:5px">${c.hint}</div>` : ''}</div>`; }
    return '';
  };
  tw.build = (el) => {
    el.innerHTML = `<div class="tw-h"><div><b>Tweaks</b><small>Radar Táctico MTB · diseño V2</small></div><button class="ibtn sm" data-act="tw.close" aria-label="Cerrar panel" style="background:#111c18;border-color:#25392f;color:#cfe0d9">${I('x', 19)}</button></div><div class="tw-b" id="twBody"></div>`;
    body = el.querySelector('#twBody'); tw.render();
    const A = RT.acts, C = RT.chg;
    A['tw.close'] = () => tw.toggle(false);
    A['tw.set'] = (t) => { const k = t.dataset.k, v = t.dataset.v; if (k === 'gps') RT.setGps(v); else if (k === 'net') { S.net = v; RT.emit('tick'); } else if (k === 'tiles') { S.tiles = v; RT.drawAll(); RT.emit('tick'); } else { RT.setCfg(k, isNaN(+v) || k === 'pal' ? v : v, k === 'view' || k === 'dock'); if (k === 'view') { S.view = v; } if (k === 'dock') S.dock = v; RT.emit('cfg', { k, v }); } if (k === 'pal') { S.solar = v === 'sol'; } RT.applyCfg(); tw.render(); setTimeout(() => RT.drawAll(), 30); };
    A['tw.tog'] = (t) => { const k = t.dataset.k, def = GROUPS.flatMap((g) => g.c).find((c) => c.k === k); if (def && def.map) { const m = def.map, cur = RT.cfg[m] === 'on'; RT.setCfg(m, cur ? 'off' : 'on'); } else RT.setCfg(k, !RT.cfg[k]); RT.applyCfg(); tw.render(); RT.drawAll(); };
    C['tw.rng'] = (t) => { const k = t.dataset.k, v = +t.value; RT.setCfg(k, v); const def = GROUPS.flatMap((g) => g.c).find((c) => c.k === k); const l = document.getElementById('twv-' + k); if (l && def) l.textContent = def.fmt(v); RT.applyCfg(); };
    A['tw.scen'] = (t) => { tw.scen = t.dataset.k; RT.go('radar'); ui.closeAll(); const f = document.getElementById('fall'); if (f) f.remove(); const l = document.getElementById('lockfs'); if (l) l.remove(); RT.scenario(t.dataset.k); S.view = RT.cfg.view; tw.render(); };
    A['tw.play'] = () => { RT.setPlaying(!S.playing); tw.render(); }; A['tw.simk'] = (t) => { S.simK = +t.dataset.k; tw.render(); };
    A['tw.fall'] = () => { RT.go('radar'); RT.ui.fall(); }; A['tw.lock'] = () => { RT.go('radar'); RT.ui.lock(); }; A['tw.sos'] = () => { RT.go('radar'); RT.ui.sos(); };
    A['tw.reset'] = () => { Object.assign(RT.cfg, RT.CFG0); U.store.set('rtv2_cfg', RT.cfg); S.view = RT.cfg.view; S.dock = RT.cfg.dock; RT.applyCfg(); RT.emit('cfg', { k: 'all' }); tw.render(); ui.toast('Diseño restablecido', 'ok'); };
    A['tw.copy'] = () => { const txt = JSON.stringify(RT.cfg, null, 2); const ok = () => ui.toast('Configuración copiada', 'ok'); if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, () => U.download('radar-tweaks.json', txt, 'application/json')); else U.download('radar-tweaks.json', txt, 'application/json'); };
    A['tw.hdr'] = (t) => { const g = t.closest('.tw-g'); const id = g.dataset.id; if (shut.has(id)) shut.delete(id); else shut.add(id); g.classList.toggle('shut'); };
    A['tw.open'] = () => tw.toggle(true);
    RT.on('tick', (() => { let last = ''; return () => { const sig = [S.gps, S.net, S.tiles, S.playing, S.rec, S.simK].join(); if (sig !== last) { last = sig; tw.render(); } }; })());
  };
  tw.render = () => {
    if (!body) return; const top = body.scrollTop;
    body.innerHTML = GROUPS.map((g) => `<div class="tw-g ${shut.has(g.id) ? 'shut' : ''}" data-id="${g.id}"><button class="tw-gh" data-act="tw.hdr"><span>${g.n}</span>${I('chevD', 16)}</button><div class="tw-gc">${g.c.map(ctrl).join('')}${g.id === 'dev' ? `<div class="tw-row"><button class="tw-btn" data-act="tw.copy">Copiar configuración</button><button class="tw-btn" data-act="tw.reset">Restablecer</button></div><div class="tw-note">La configuración se guarda en este navegador (localStorage).</div>` : ''}</div></div>`).join('');
    body.scrollTop = top;
  };
  tw.toggle = (open) => {
    const b = document.body, mobile = window.innerWidth <= 860;
    if (mobile) b.classList.toggle('tw-open', open == null ? !b.classList.contains('tw-open') : open);
    else b.classList.toggle('tw-hidden', open == null ? !b.classList.contains('tw-hidden') : !open);
    setTimeout(() => RT.refit(), 30);
  };
  const css = document.createElement('style'); css.textContent = '@media (max-width:560px){#twfab{display:none!important}}.tw-seg button:focus-visible,.tw-btn:focus-visible{outline:2px solid #3DDC97}';
  document.head.appendChild(css);
})();
