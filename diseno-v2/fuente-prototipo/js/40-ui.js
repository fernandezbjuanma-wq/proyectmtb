/* ============================================================
   UI compartida: acciones delegadas, toasts, hojas, diálogos y superposiciones de seguridad
   ============================================================ */
(function () {
  'use strict';
  const RT = window.RT, U = RT.U, S = RT.S, I = RT.icon, R = RT.R;
  const ui = (RT.ui = {});
  RT.acts = {}; RT.chg = {};
  /** anotación diseño → código: data-an="#id · funcion()" data-st="ex|demo|prop" */
  RT.an = (txt, st) => `data-an="${U.esc(txt)}" data-st="${st || 'ex'}"`;

  document.addEventListener('click', (e) => { const t = e.target.closest('[data-act]'); if (!t) return; const f = RT.acts[t.dataset.act]; if (f) { f(t, e); } });
  document.addEventListener('input', (e) => { const t = e.target.closest('[data-chg]'); if (t && RT.chg[t.dataset.chg]) RT.chg[t.dataset.chg](t, e); });
  document.addEventListener('change', (e) => { const t = e.target.closest('[data-chg]'); if (t && t.tagName === 'SELECT' && RT.chg[t.dataset.chg]) RT.chg[t.dataset.chg](t, e); });

  /* ---------- toasts ---------- */
  ui.toast = (msg, k, ms) => {
    const box = document.getElementById('toasts'); if (!box) return;
    const el = U.html(`<div class="toast" data-k="${k || 'ok'}">${I(k === 'bad' ? 'warn' : k === 'warn' ? 'info' : 'check', 18)}<span>${U.esc(msg)}</span></div>`);
    box.appendChild(el); while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = 0; setTimeout(() => el.remove(), 320); }, ms || 3200);
  };

  /* ---------- hojas ---------- */
  const layer = () => document.getElementById('layer');
  ui.sheet = (o) => {
    const wrap = U.html(`<div class="sheet-wrap${o.center ? ' center' : ''}"><div class="sheet-bg"></div></div>`);
    const body = document.createElement('div'); body.className = 'sheet' + (o.full ? ' full' : '');
    const draw = () => {
      body.innerHTML = `<div class="sheet-h"><h2>${o.title}</h2><button class="ibtn sm" data-close aria-label="Cerrar">${I('x', 20)}</button></div><div class="sheet-b">${o.render ? o.render() : o.body}</div>${o.foot ? `<div class="sheet-f">${typeof o.foot === 'function' ? o.foot() : o.foot}</div>` : ''}`;
      if (o.mount) o.mount(body, api);
    };
    const api = { el: wrap, body, refresh: draw, close: () => { wrap.remove(); const i = ui.stack.indexOf(api); if (i >= 0) ui.stack.splice(i, 1); if (o.onClose) o.onClose(); } };
    wrap.appendChild(body); layer().appendChild(wrap); draw();
    wrap.querySelector('.sheet-bg').addEventListener('click', api.close);
    wrap.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) api.close(); });
    (ui.stack = ui.stack || []).push(api); return api;
  };
  ui.closeAll = () => { (ui.stack || []).slice().forEach((s) => s.close()); };
  ui.dialog = (html, o) => {
    const wrap = U.html(`<div class="sheet-wrap center"><div class="sheet-bg"></div><div class="dialog">${html}</div></div>`); layer().appendChild(wrap);
    const api = { el: wrap, close: () => wrap.remove() }; wrap.querySelector('.sheet-bg').addEventListener('click', () => { if (!(o && o.modal)) api.close(); });
    wrap.addEventListener('click', (e) => { const b = e.target.closest('[data-d]'); if (b) { const f = o && o.on && o.on[b.dataset.d]; api.close(); if (f) f(); } });
    return api;
  };
  ui.confirm = (title, text, ok, onOk, danger) => ui.dialog(`<h3>${title}</h3><p class="muted">${text}</p><div class="stack" style="gap:10px"><button class="btn btn-s block" data-d="no">Cancelar</button><button class="btn ${danger ? 'btn-dp' : 'btn-p'} block" data-d="ok">${ok}</button></div>`, { on: { ok: onOk } });

  /* ---------- finalizar: confirmación obligatoria, botones bien separados ---------- */
  ui.finishConfirm = () => {
    const v = RT.vm();
    ui.dialog(`<h3>¿Finalizar la salida?</h3><p class="muted">Se guardará en este teléfono (${U.num(v.dist / 1000, 2)} km · ${U.dur(v.t)}) y se subirá a la nube cuando haya conexión. Si todavía no terminaste, podés seguir grabando.</p>
      <div class="stack" style="gap:18px"><button class="btn btn-p block" data-d="no" ${RT.an('seguir grabando', 'prop')}>${I('play', 18)} Seguir grabando</button><button class="btn btn-dp block" data-d="ok" ${RT.an('finalizarEntrenamiento()')}>${I('stop', 16)} Finalizar y guardar</button></div>`, { modal: true, on: { ok: () => RT.rec.finish() } });
  };

  /* ---------- informe al terminar ---------- */
  ui.report = (a, o) => {
    o = o || {};
    const sh = ui.sheet({
      title: o.title || 'Sesión finalizada', full: true,
      render: () => `<div class="row between"><span class="badge">${I('bike', 15)} Ciclismo MTB</span><span class="badge ${a.sync ? '' : 'y'}" id="rp-sync">${I(a.sync ? 'cloudOk' : 'cloud', 15)} ${a.sync ? 'Subida a la nube' : S.net === 'offline' ? 'Pendiente · sin conexión' : 'Subiendo…'}</span></div>
        <div class="grid3">${[[U.num(a.dist, 1), 'km', 'Distancia'], [U.dur(a.dur), '', 'Tiempo mov.'], ['+' + U.num(a.asc, 0), 'm', 'Desnivel']].map((x) => `<div class="stat"><div class="v">${x[0]}<small>${x[1]}</small></div><div class="l">${x[2]}</div></div>`).join('')}</div>
        <div class="card mapcard" style="height:200px"><canvas id="cvRep"></canvas><span class="chip mcap">${I('route', 14)} Tu traza · coloreada por zona</span></div>
        <p class="muted" style="font-size:13.5px">Guardada en este teléfono. ${a.sync ? '' : 'Se sube sola cuando haya conexión; si falla, te lo vamos a mostrar en Historial.'} Potencia, TSS y calorías son <b>estimaciones</b>.</p>`,
      foot: `<div class="stack" style="width:100%;gap:10px"><button class="btn btn-p block" data-act="rep.lab" ${RT.an('cambiarPestanaApp(\'lab\')')}>${I('flask', 19)} Ver informe completo</button><div class="grid2"><button class="btn btn-s" data-act="rep.explore" ${RT.an('enfocarMapaScrubber()')}>${I('route', 18)} Explorar ruta</button><button class="btn btn-s" data-act="rep.gpx" ${RT.an('generarDescargaGPX()')}>${I('download', 18)} GPX</button></div>${o.del ? `<button class="btn btn-d sm block" data-act="rep.del" ${RT.an('eliminarActividad()')}>${I('trash', 17)} Eliminar del teléfono</button>` : ''}</div>`,
      mount: (el, api) => { const cv = el.querySelector('#cvRep'); if (cv) { RT.dropMap(api.map); const m = new RT.RMap(cv, { lab: true, force: true, sEnd: () => a.end === 'full' ? R.L : a.end, s0: a.s0 || 0 }); setTimeout(() => { m.resize(); m.draw(); }, 60); api.map = m; } },
      onClose: () => RT.dropMap(sh.map)
    });
    RT.acts['rep.lab'] = () => { sh.close(); RT.go('lab'); }; RT.acts['rep.explore'] = () => { sh.close(); RT.go('lab'); setTimeout(() => RT.acts['lab.explore'] && RT.acts['lab.explore'](), 80); }; RT.acts['rep.gpx'] = () => RT.dlGpx(a); RT.acts['rep.del'] = () => ui.confirm('¿Eliminar esta salida?', 'Se borra de este teléfono. Si ya estaba en la nube, la copia de la nube no se toca desde acá. No se puede deshacer.', 'Eliminar', () => { const i = RT.ACTS.indexOf(a); if (i >= 0) RT.ACTS.splice(i, 1); if (RT.actSel === a.id) RT.actSel = (RT.ACTS[0] || {}).id; sh.close(); RT.emit('acts'); ui.toast('Salida eliminada del teléfono', 'warn'); }, true);
    if (!a.sync && S.net === 'online') setTimeout(() => { a.sync = true; S.pendSync = Math.max(0, S.pendSync - 1); const b = document.getElementById('rp-sync'); if (b) { b.className = 'badge'; b.innerHTML = I('cloudOk', 15) + ' Subida a la nube'; } RT.emit('acts'); }, 2400);
  };
  RT.dlGpx = (a) => { U.download(`${a.titulo.replace(/\s+/g, '_')}_${a.fecha}.gpx`, RT.gpx(a.titulo, a.end === 'full' ? RT.R.L : a.end), 'application/gpx+xml'); ui.toast('GPX descargado (traza sintética de demostración)', 'ok'); };

  /* ---------- posible caída: cuenta de 30 s, sin envío automático ---------- */
  ui.fall = () => {
    if (document.getElementById('fall')) return; let n = 30;
    const el = U.html(`<div class="fs" id="fall"><div class="dialog"><div style="color:var(--r)">${I('siren', 54)}</div><h3 style="color:var(--r)">¡Impacto brusco detectado!</h3><p class="muted" id="fall-txt">Se detectó un posible impacto. Si no cancelás, se intentará abrir WhatsApp con tu última posición registrada. Vas a tener que elegir un contacto y tocar <b>Enviar</b>: <b>no se envía solo</b>.</p><div class="cnt" id="fall-n">30</div><div class="lbl">segundos restantes</div><button class="btn btn-p block" id="fall-ok" style="height:64px;font-size:22px" ${RT.an('cancelarAlertaCaida()')}>${I('check', 22)} Estoy bien · cancelar</button></div></div>`);
    document.getElementById('app').appendChild(el); RT.speak('Atención. Posible impacto detectado. ¿Te encuentras bien?');
    const t = setInterval(() => { n--; const x = document.getElementById('fall-n'); if (x) x.textContent = n; if (n <= 0) { clearInterval(t); const tx = document.getElementById('fall-txt'); if (tx) tx.innerHTML = 'Se cumplió el tiempo. <b>Acá se abriría WhatsApp</b> con tu última posición registrada' + (S.lastFix ? '' : ' (no hay ninguna: no se enviarían coordenadas)') + '. Falta que elijas un contacto y toques Enviar; sin conexión no va a salir.'; const b = document.getElementById('fall-ok'); if (b) b.innerHTML = 'Cerrar'; const c = document.getElementById('fall-n'); if (c) c.textContent = '0'; } }, 1000);
    el.querySelector('#fall-ok').addEventListener('click', () => { clearInterval(t); el.remove(); ui.toast('Alerta cancelada. Me alegro de que estés bien.', 'ok'); });
  };

  /* ---------- bloqueo antisudor (mantener 2 s para desbloquear) ---------- */
  ui.lock = () => {
    if (document.getElementById('lockfs')) return; S.locked = true;
    const el = U.html(`<div class="fs" id="lockfs"><div class="dialog"><div style="color:var(--acc)">${I('lock', 46)}</div><h3>Pantalla bloqueada</h3><p class="muted">Protección contra gotas de sudor y lluvia. La grabación sigue activa.</p>
      <div class="row" style="gap:18px;align-items:flex-end"><div><div class="num" data-lk="v" style="font-size:80px">0</div><div class="lbl">km/h</div></div><div><div class="num" data-lk="g" style="font-size:44px">0,0 %</div><div class="lbl" data-lk="z">LLANO</div></div></div>
      <button class="btn btn-s block holdbtn" id="lk-btn" style="height:62px" ${RT.an('btn-desbloquear-mantener · desbloquearPantalla()')}><i class="pg"></i><span>${I('unlock', 20)} Mantené presionado 2 s</span></button></div></div>`);
    document.getElementById('app').appendChild(el);
    const upd = () => { const v = RT.vm(); el.querySelector('[data-lk=v]').textContent = U.num(v.v, 1); el.querySelector('[data-lk=g]').textContent = U.num(v.g, 1) + ' %'; const z = el.querySelector('[data-lk=z]'); z.textContent = RT.ZM[v.kind].name.toUpperCase(); z.className = 'lbl zt-' + v.zc; };
    upd(); const off = () => {}; RT.on('tick', () => { if (document.getElementById('lockfs')) upd(); });
    const btn = el.querySelector('#lk-btn'), pg = btn.querySelector('.pg'); let t0 = 0, raf = 0;
    const loop = () => { const p = Math.min(1, (performance.now() - t0) / 2000); pg.style.width = p * 100 + '%'; if (p >= 1) { S.locked = false; el.remove(); ui.toast('Pantalla desbloqueada', 'ok'); } else raf = requestAnimationFrame(loop); };
    const down = (e) => { e.preventDefault(); t0 = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }, up = () => { cancelAnimationFrame(raf); pg.style.width = '0'; };
    btn.addEventListener('pointerdown', down); ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => btn.addEventListener(ev, up));
  };

  /* ---------- SOS: honesto sobre sus límites ---------- */
  RT.coords = () => { const p = RT.at(S.s), lat0 = -26.815, lon0 = -65.31; return { lat: lat0 + (p.y - 800) / 111320, lon: lon0 + (p.x - 500) / (111320 * Math.cos((lat0 * Math.PI) / 180)) }; };
  ui.sos = () => {
    const fix = S.lastFix, age = fix ? Math.max(1, Math.round((Date.now() - fix.t) / 1000)) : null, c = RT.coords();
    ui.sheet({
      title: 'SOS · WhatsApp',
      body: `<div class="hint r"><b>Esto no es un aviso automático.</b> Abrir WhatsApp solo prepara un mensaje con tu última posición registrada. Vos elegís el contacto y tocás <b>Enviar</b>; necesita conexión y que la app no esté suspendida.</div>
        <div class="card tight"><div class="lbl">Última posición registrada</div>${fix ? `<div class="num" style="font-size:30px;margin:6px 0 4px">${U.num(c.lat, 5)}, ${U.num(c.lon, 5)}</div><div class="muted">hace ${age} s · precisión ±${fix.acc} m · <span class="dim">coordenadas ficticias de la demo</span></div>` : `<div style="margin-top:6px;font-weight:700" class="zt-y">Todavía no hay una posición válida.</div><div class="muted">No se enviarán coordenadas inventadas.</div>`}</div>
        <div class="card tight"><div class="lbl">Mensaje que se prepararía</div><p style="margin-top:6px;font-size:14px;line-height:1.35">“Necesito ayuda. Mi última posición registrada${fix ? ` (hace ${age} s, ±${fix.acc} m)` : ''}: ${fix ? `https://maps.google.com/?q=${c.lat.toFixed(5)},${c.lon.toFixed(5)}` : 'sin posición disponible'}”</p></div>`,
      foot: `<button class="btn btn-s" data-close style="flex:1">Cancelar</button><button class="btn btn-dp ${fix ? '' : 'dis'}" style="flex:1.4" data-act="sos.go" ${RT.an('compartirUbicacionWhatsApp()')}>${I('message', 19)} Abrir WhatsApp</button>`
    });
    RT.acts['sos.go'] = () => { ui.closeAll(); ui.toast('Prototipo: acá se abriría WhatsApp. Falta elegir contacto y tocar Enviar.', 'warn', 4500); };
  };

  /* ---------- ajustes de cabina ---------- */
  ui.cabina = () => {
    const sh = ui.sheet({
      title: 'Cabina y herramientas', full: true,
      render: () => {
        const m = RT.MODES[S.mode], row = (ic, t, sub, act, on, tg, st, kind) => `<button class="lrow" data-act="${act}" ${st ? RT.an(st, kind) : ''}><span class="ico">${I(ic, 22)}</span><span class="grow"><b>${t}</b><small>${sub}</small></span>${tg ? `<span class="tgl ${on ? 'on' : ''}"></span>` : I('chevR', 20, 'chev')}</button>`;
        return `<div class="lbl">Modo de entrenamiento</div>
          <div class="seg scroll modes" ${RT.an('selector-modo-scroll · cambiarModoEntrenamiento()')}>${Object.keys(RT.MODES).map((k) => `<button class="${S.mode === k ? 'on' : ''}" data-act="cab.mode" data-k="${k}">${RT.MODES[k].n}</button>`).join('')}</div>
          <div class="card tight" style="display:flex;flex-direction:column;gap:6px"><div class="row between"><b style="font-size:16px">${m.t}</b><span class="badge" style="height:24px;font-size:12px">${m.b}</span></div><div class="muted" style="font-size:13.5px">${m.d}</div>
          ${S.mode === 'HIIT' ? `<div class="hr"></div><div class="row between"><div><div class="lbl sm">Serie ${S.hiit.serie} de 5 · ${S.hiit.fase === 'ESPERA' ? 'en espera' : S.hiit.fase.toLowerCase()}</div><div class="num" style="font-size:40px">${U.dur(S.hiit.t)}</div></div><button class="btn sm ${S.hiit.on ? 'btn-d' : 'btn-p'}" data-act="cab.hiit" ${RT.an('toggleIntervalosHIIT()')}>${S.hiit.on ? 'Detener' : 'Iniciar series'}</button></div><div class="seg" ${RT.an('configurarZonaAtaqueHIIT()')}>${[[4, 'Z4 Umbral'], [5, 'Z5 VO2 máx'], [6, 'Z6+ Sprint']].map((z) => `<button class="${S.hiit.zona === z[0] ? 'on' : ''}" data-act="cab.hz" data-z="${z[0]}">${z[1]}</button>`).join('')}</div>` : ''}</div>
          <div class="lbl" style="margin-top:4px">Herramientas</div>
          ${row('sun', 'Modo solar', 'Alto contraste para leer con sol directo', 'cab.solar', S.solar, 1, 'toggleModoSolar()')}
          ${row('lock', 'Bloqueo antisudor', 'Bloquea el táctil; se desbloquea manteniendo 2 s', 'cab.lock', 0, 0, 'activarBloqueoPantalla()')}
          ${row('mic', 'Voz del coach', S.voice ? 'Activada · avisos hablados' : 'Apagada · solo avisos en pantalla', 'cab.voice', S.voice, 1, 'pildora-voz-header')}
          ${row('volume', 'Repetir último aviso', 'Vuelve a decir el aviso táctico actual', 'cab.repeat', 0, 0, 'repetirUltimoAvisoCoach()')}
          ${row('ghost', 'Ghost Pacer', S.ghost.on ? `Activo · ${S.ghost.name}` : 'Competí contra una liebre virtual', 'cab.ghost', 0, 0, 'abrirModalGhostPacer()')}
          ${row('users', 'Escuadrón', S.squad.connected ? `Conectado · sala ${S.squad.room}` : 'Compartí tu posición con el pelotón', 'cab.squad', 0, 0, 'abrirModalEscuadron()')}
          ${row('cloud', 'Respaldo en la nube', S.pendSync ? `${S.pendSync} salidas sin subir` : 'Todo al día', 'cab.nube', 0, 0, 'abrirConfigNube()')}
          ${row('siren', 'SOS por WhatsApp', 'Prepara un mensaje con tu última posición', 'cab.sos', 0, 0, 'compartirUbicacionWhatsApp()')}
          ${row('bike', S.vehicle ? 'Auto-detección de vehículo' : 'Modo bici puro', S.vehicle ? 'ON · solo para pruebas en auto' : 'Las bajadas no activan el modo auto', 'cab.veh', S.vehicle, 1, 'toggleModoVehiculoPermitido()')}
          ${row('gauge', 'Simulador GPX (prueba en PC)', 'Reproduce la ruta para probar voz, mapa y métricas', 'cab.sim', 0, 0, 'abrirPanelSimulador()')}
          ${row('sliders', 'Panel de diseño (Tweaks)', 'Colores, tipografía, mapa y escenarios de prueba', 'cab.tw', 0, 0, 'solo prototipo', 'prop')}`;
      }
    });
    const A = RT.acts;
    A['cab.mode'] = (t) => { S.mode = t.dataset.k; RT.emit('mode'); sh.refresh(); ui.toast(RT.MODES[S.mode].t, 'ok'); RT.speak(`Modo ${RT.MODES[S.mode].n}`); };
    A['cab.hiit'] = () => { S.hiit.on = !S.hiit.on; if (S.hiit.on) { S.hiit.fase = 'ATAQUE'; S.hiit.t = 60; S.hiit.serie = 1; } else S.hiit.fase = 'ESPERA'; sh.refresh(); };
    A['cab.hz'] = (t) => { S.hiit.zona = +t.dataset.z; sh.refresh(); };
    A['cab.solar'] = () => { RT.setSolar(!S.solar); sh.refresh(); };
    A['cab.lock'] = () => { sh.close(); ui.lock(); };
    A['cab.voice'] = () => { RT.setVoice(!S.voice); sh.refresh(); };
    A['cab.repeat'] = () => { const a = RT.vm().al; if (!('speechSynthesis' in window)) ui.toast('Este navegador no tiene voz. Aviso: ' + a.title, 'warn'); else { const v = S.voice; S.voice = true; RT.speak(`${a.title}. ${a.sub}`); S.voice = v; ui.toast('Repitiendo aviso por voz', 'ok'); } };
    A['cab.ghost'] = () => ui.ghost(); A['cab.squad'] = () => ui.squad(); A['cab.nube'] = () => ui.nube(); A['cab.sos'] = () => ui.sos();
    A['cab.veh'] = () => { S.vehicle = !S.vehicle; sh.refresh(); ui.toast(S.vehicle ? 'Detección de vehículo activada para pruebas en auto.' : 'Modo bici puro asegurado.', 'warn'); };
    A['cab.sim'] = () => ui.simPanel();
    A['cab.tw'] = () => { sh.close(); RT.tw.toggle(true); };
  };
  RT.setSolar = (b) => { S.solar = b; RT.setCfg('pal', b ? 'sol' : (RT.cfg.palBeforeSolar || 'verde'), true); if (b) RT.cfg.palBeforeSolar = RT.cfg.palBeforeSolar || 'verde'; RT.applyCfg(); RT.emit('cfg', { k: 'pal' }); ui.toast(b ? 'Modo solar: alto contraste' : 'Modo solar apagado', 'ok'); };
  RT.setVoice = (b) => { S.voice = b; RT.emit('tick'); ui.toast(b ? ('speechSynthesis' in window ? 'Voz del coach activada' : 'Voz activada (este navegador no tiene síntesis de voz)') : 'Voz del coach apagada', b ? 'ok' : 'warn'); if (b) RT.speak('Voz del coach activada'); };

  /* ---------- ghost pacer ---------- */
  ui.ghost = () => {
    let mode = S.ghost.mode, kmh = S.ghost.kmh;
    const sh = ui.sheet({
      title: 'Ghost Pacer', render: () => `<p class="muted">Competí en vivo contra un ritmo objetivo. La liebre aparece en el mapa y el widget te dice si vas ganando o perdiendo segundos.</p>
      <div class="stack" ${RT.an('abrirModalGhostPacer()')}>${[['ritmo', 'timer', 'Ritmo fijo objetivo', 'Una liebre que va a velocidad constante.'], ['gpx', 'route', 'Ruta GPX planificada', 'Compara tu ritmo contra el track cargado en Preparación.'], ['sesion', 'trophy', 'Tu mejor salida del historial', 'Disponible si tenés salidas con puntos satelitales.']].map((m) => `<button class="lrow" data-act="gh.m" data-k="${m[0]}" style="${mode === m[0] ? 'border-color:var(--acc-line);background:var(--acc-soft)' : ''}"><span class="ico">${I(m[1], 22)}</span><span class="grow"><b>${m[2]}</b><small style="white-space:normal">${m[3]}</small></span><span class="tgl ${mode === m[0] ? 'on' : ''}"></span></button>`).join('')}</div>
      ${mode === 'ritmo' ? `<div class="seg">${[18, 20, 23, 26].map((k) => `<button class="${kmh === k ? 'on' : ''}" data-act="gh.k" data-k="${k}">${k} km/h</button>`).join('')}</div>` : ''}`,
      foot: `<button class="btn btn-s" data-close style="flex:1">Cerrar</button><button class="btn ${S.ghost.on ? 'btn-d' : 'btn-p'}" style="flex:1.5" data-act="gh.go" ${RT.an('toggleGhostPacer()')}>${S.ghost.on ? 'Desactivar liebre' : 'Activar liebre'}</button>`
    });
    RT.acts['gh.m'] = (t) => { mode = t.dataset.k; sh.refresh(); }; RT.acts['gh.k'] = (t) => { kmh = +t.dataset.k; sh.refresh(); };
    RT.acts['gh.go'] = () => { if (S.ghost.on) { S.ghost.on = false; ui.toast('Liebre desactivada', 'warn'); } else { S.ghost = { on: true, mode, kmh, s: S.s, name: mode === 'ritmo' ? `Ritmo fijo ${kmh} km/h` : mode === 'gpx' ? 'Ruta GPX planificada' : 'Tu mejor salida' }; ui.toast('Liebre activada: ' + S.ghost.name, 'ok'); } sh.close(); RT.emit('tick'); };
  };

  /* ---------- escuadrón ---------- */
  ui.squad = () => {
    const sh = ui.sheet({
      title: 'Radar de escuadrón', full: true,
      render: () => `<p class="muted">Compartí tu ubicación con tus amigos y mirá sus posiciones en el mapa.</p>
        <div class="hint y"><b>Antes de activarlo:</b> solo se comparte con quien tenga el código de sala, mientras la sala esté abierta. Es una función en evaluación (privacidad, expiración y reglas de acceso sin validar).</div>
        <div class="grid2"><label class="fld"><span>Tu nombre / alias</span><input id="sq-n" value="${U.esc(S.squad.name)}" ${RT.an('escuadron-nombre-input')}></label><label class="fld"><span>Código de sala</span><input id="sq-r" value="${U.esc(S.squad.room)}" ${RT.an('escuadron-sala-input')}></label></div>
        <button class="btn ${S.squad.connected ? 'btn-d' : 'btn-p'} block" data-act="sq.conn" ${RT.an('toggleConexionEscuadron()')}>${I('wifi', 19)} ${S.squad.connected ? 'Desconectar escuadrón' : 'Conectar escuadrón'}</button>
        <div class="card tight"><div class="row between"><div class="lbl">Ciclistas en la sala</div><b class="num" style="font-size:24px">${S.squad.connected ? 1 + (S.squad.demo ? 2 : 0) : 0}</b></div>
        ${S.squad.connected ? `<div class="stack" style="gap:8px;margin-top:10px">${[['Juan MTB (vos)', 'acc', 'J'], ...(S.squad.demo ? [['Facundo', 'd', 'F'], ['Cona', 'd', 'C']] : [])].map((m) => `<div class="row"><span class="ico" style="width:34px;height:34px;border-radius:50%;background:var(--acc-soft);display:grid;place-items:center;font-weight:800">${m[2]}</span><b>${m[0]}</b><span class="muted" style="margin-left:auto">última posición hace ${m[2] === 'J' ? 2 : 4} s</span></div>`).join('')}</div>` : '<div class="muted" style="margin-top:8px">No hay ciclistas conectados en esta sala aún.</div>'}
        <button class="btn btn-s sm block" style="margin-top:12px" data-act="sq.demo" ${RT.an('toggleDemoEscuadron()', 'demo')}>${I('bike', 17)} ${S.squad.demo ? 'Quitar compañeros simulados' : 'Probar con compañeros simulados (demo)'}</button></div>`,
      foot: `<button class="btn btn-s block" data-close style="width:100%">Volver al radar</button>`
    });
    RT.acts['sq.conn'] = () => { S.squad.name = document.getElementById('sq-n').value || 'Juan MTB'; S.squad.room = document.getElementById('sq-r').value || 'CERRO'; S.squad.connected = !S.squad.connected; S.squad.on = S.squad.connected; if (!S.squad.connected) S.squad.demo = false; sh.refresh(); ui.toast(S.squad.connected ? 'Escuadrón conectado (demo local)' : 'Escuadrón desconectado', S.squad.connected ? 'ok' : 'warn'); RT.emit('tick'); };
    RT.acts['sq.demo'] = () => { S.squad.demo = !S.squad.demo; if (S.squad.demo) { S.squad.connected = true; S.squad.on = true; } sh.refresh(); RT.emit('tick'); };
  };

  /* ---------- nube y respaldos ---------- */
  ui.nube = () => {
    const sh = ui.sheet({
      title: 'Nube y respaldos', full: true,
      render: () => { const t = S.nube.test; return `<p class="muted">Sincronización con Firestore y copias de seguridad de tus salidas.</p>
        <div class="card tight"><div class="row between"><b>Estado de conexión</b><span class="badge ${S.net === 'offline' ? 'y' : ''}">${S.net === 'offline' ? 'Sin red' : 'Offline-first listo'}</span></div><p class="muted" style="margin:6px 0 10px;font-size:13.5px">Tus salidas se guardan seguras en el celular y se suben solas al enganchar Wi-Fi/4G.</p><button class="btn btn-o sm block" data-act="nb.test" ${RT.an('probarConexionFirebase()')}>${I('wifi', 18)} Probar conexión con Firestore</button>${t ? `<div class="hint ${t.ok ? '' : 'y'}" style="margin-top:10px">${t.txt}</div>` : ''}</div>
        <div class="card tight"><div class="lbl">Sincronización de salidas</div><p class="muted" style="margin:6px 0 10px;font-size:13.5px">${S.pendSync ? `Hay ${S.pendSync} salidas sin subir.` : 'No hay salidas pendientes.'} “Sincronizado” solo se marca cuando el servidor confirma.</p><div class="grid2"><button class="btn btn-s sm" data-act="nb.up" ${RT.an('sincronizarPendientesFirestore()')}>${I('upload', 17)} Subir pendientes</button><button class="btn btn-s sm" data-act="nb.down" ${RT.an('descargarTodasDeNubeALocal()')}>${I('download', 17)} Bajar de la nube</button></div></div>
        <div class="card tight"><div class="lbl">Respaldo universal (archivo .json)</div><p class="muted" style="margin:6px 0 10px;font-size:13.5px">Historial, odómetro, segmentos y BikeFit en un archivo para Drive o WhatsApp, o para cambiar de teléfono.</p><div class="grid2"><button class="btn btn-s sm" data-act="nb.exp" ${RT.an('exportarBackupCompleto()')}>${I('pack', 17)} Exportar</button><button class="btn btn-s sm" data-act="nb.imp" ${RT.an('importarBackupJSON()')}>${I('upload', 17)} Restaurar</button></div><input type="file" id="nb-file" accept=".json" hidden></div>
        <div class="card tight"><div class="lbl">Proyecto Firebase propio (opcional)</div><textarea class="fld" id="nb-cfg" rows="3" style="width:100%;margin-top:8px;font:12px ui-monospace,monospace;background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:10px;resize:none" placeholder='{"apiKey": "AIzaSy...", "projectId": "tu-proyecto-mtb"}'></textarea><div class="grid2" style="margin-top:8px"><button class="btn btn-s sm" data-act="nb.save" ${RT.an('guardarConfigFirebasePersonalizada()')}>Guardar config</button><button class="btn btn-s sm" data-act="nb.def" ${RT.an('restaurarConfigFirebaseDefault()')}>Predeterminado</button></div><p class="dim" style="font-size:12px;margin-top:8px">No pegues claves reales en un repositorio público.</p></div>`; },
      foot: '<button class="btn btn-p block" data-close style="width:100%">Listo</button>',
      mount: (el) => { const f = el.querySelector('#nb-file'); if (f) f.onchange = () => { const r = new FileReader(); r.onload = () => { try { const j = JSON.parse(r.result); const n = (j.actividades || []).filter((a) => !RT.ACTS.find((x) => x.id === a.id)).length; ui.toast(`Backup leído: ${n} salidas nuevas para fusionar (demo)`, 'ok'); } catch (e) { ui.toast('Ese archivo no es un backup válido', 'bad'); } }; if (f.files[0]) r.readAsText(f.files[0]); }; }
    });
    const A = RT.acts;
    A['nb.test'] = () => { S.nube.test = { ok: true, txt: 'Probando… (máx. 6 s para no congelar la pantalla)' }; sh.refresh(); setTimeout(() => { S.nube.test = S.net === 'offline' ? { ok: false, txt: 'Sin conexión: no se pudo llegar al servidor. Tus salidas siguen guardadas en el teléfono.' } : { ok: true, txt: 'Conexión correcta · escritura y lectura confirmadas por el servidor (simulado).' }; sh.refresh(); }, 1200); };
    A['nb.up'] = () => { if (S.net === 'offline') return ui.toast('Sin conexión: quedan en cola hasta que vuelva la red', 'warn'); RT.ACTS.forEach((a) => (a.sync = true)); S.pendSync = 0; RT.emit('acts'); sh.refresh(); ui.toast('Subidas y confirmadas por el servidor', 'ok'); };
    A['nb.down'] = () => ui.toast(S.net === 'offline' ? 'Sin conexión' : 'Nada nuevo en la nube (demo)', S.net === 'offline' ? 'warn' : 'ok');
    A['nb.exp'] = () => { U.download('radar-mtb-backup.json', JSON.stringify({ version: 2, app: 'Radar Táctico MTB (prototipo)', fecha: new Date().toISOString(), actividades: RT.ACTS.map((a) => Object.assign({}, a, { puntos: undefined })), odometro: S.odo, segmentos: S.segs, bikefit: S.bikefit }, null, 1), 'application/json'); ui.toast('Backup exportado (.json)', 'ok'); };
    A['nb.imp'] = () => document.getElementById('nb-file').click();
    A['nb.save'] = () => { const v = document.getElementById('nb-cfg').value.trim(); try { JSON.parse(v); ui.toast('Configuración válida (demo: no se guarda)', 'ok'); } catch (e) { ui.toast('JSON inválido', 'bad'); } };
    A['nb.def'] = () => ui.toast('Se usará el proyecto predeterminado', 'ok');
  };

  /* ---------- simulador (en la app real: panel “Simulador GPX”) ---------- */
  ui.simPanel = () => {
    const sh = ui.sheet({
      title: 'Simulador GPX', render: () => `<p class="muted">Reproduce el pedaleo de la ruta para probar voz, mapa y métricas desde una PC.</p><div class="row between"><div class="lbl">Velocidad</div><div class="seg" style="width:230px" ${RT.an('cambiarVelocidadSim()')}>${[1, 5, 10, 30].map((k) => `<button class="${S.simK === k ? 'on' : ''}" data-act="sim.k" data-k="${k}">${k}×</button>`).join('')}</div></div>
      <div class="grid2"><button class="btn ${S.playing ? 'btn-y' : 'btn-p'}" data-act="sim.play" ${RT.an('togglePlayPausaSim()')}>${I(S.playing ? 'pause' : 'play', 18)} ${S.playing ? 'Pausar' : 'Reproducir'}</button><button class="btn btn-s" data-act="sim.stop" ${RT.an('detenerSimulador()')}>${I('stop', 16)} Detener</button></div>
      <div class="muted">Progreso: punto ${Math.floor(S.s / 10)} / ${RT.R.N - 1}</div>`
    });
    RT.acts['sim.k'] = (t) => { S.simK = +t.dataset.k; sh.refresh(); RT.emit('sim'); }; RT.acts['sim.play'] = () => { RT.setPlaying(!S.playing); sh.refresh(); }; RT.acts['sim.stop'] = () => { RT.scenario('boceto'); sh.close(); };
  };
})();
