/* ============================================================
   Historial: acumulado, teléfono / nube, sincronización y salidas por mes
   ============================================================ */
(function () {
  'use strict';
  const RT = window.RT, U = RT.U, S = RT.S, I = RT.icon, an = RT.an, ui = RT.ui;
  const hist = (RT.hist = {});
  let root, tabSel = 'local';

  hist.build = (el) => {
    root = el; render();
    RT.on('acts', render); RT.on('tick', () => { if (hist._net !== S.net || hist._pend !== S.pendSync) render(); }); RT.on('scenario', render);
    RT.acts['hist.tab'] = (t) => { tabSel = t.dataset.k; render(); };
    RT.acts['hist.open'] = (t) => { RT.actSel = t.dataset.id; RT.emit('acts'); RT.go('lab'); };
    RT.acts['hist.sync'] = () => { if (S.net === 'offline') return ui.toast('Sin conexión: las salidas esperan en este teléfono hasta que vuelva la red.', 'warn', 4200); const n = RT.ACTS.filter((a) => !a.sync).length; ui.toast(`Subiendo ${n} salida${n === 1 ? '' : 's'}…`, 'ok', 1400); setTimeout(() => { RT.ACTS.forEach((a) => (a.sync = true)); S.pendSync = 0; RT.emit('acts'); ui.toast('Listo: el servidor confirmó la subida', 'ok'); }, 1500); };
  };
  function render() {
    hist._net = S.net; hist._pend = S.pendSync;
    const all = RT.ACTS.slice().sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0)), cloud = all.filter((a) => a.sync), list = tabSel === 'nube' ? cloud : all;
    const km = all.reduce((t, a) => t + a.dist, 0), asc = all.reduce((t, a) => t + a.asc, 0), pend = all.length - cloud.length, y0 = new Date().getFullYear();
    let html = '', lastM = '';
    list.forEach((a) => {
      const d = RT.fmtDate(a.fecha), mk = d.m + (new Date(a.fecha + 'T12:00:00').getFullYear() !== y0 ? ' ' + new Date(a.fecha + 'T12:00:00').getFullYear() : '');
      if (mk !== lastM) { lastM = mk; html += `<div class="month">${mk}</div>`; }
      html += `<button class="act" data-act="hist.open" data-id="${a.id}" ${an('tarjeta-actividad · verReporteDeActividadObjeto()')}><span class="dt"><span class="num">${d.d}</span><small>${d.w}</small></span><span class="grow"><b>${U.esc(a.titulo)}</b><span class="m">${U.num(a.dist, 1)} km · +${U.num(a.asc, 0)} m · ${U.durHM(a.dur)} h</span></span><span class="sy ${a.sync ? 'ok' : 'wait'}" title="${a.sync ? 'Subida a la nube' : 'Pendiente de subir'}">${I(a.sync ? 'cloudOk' : 'cloud', 21)}<span class="sr">${a.sync ? 'Subida a la nube' : 'Pendiente de subir'}</span></span>${I('chevR', 18, 'chev')}</button>`;
    });
    const empty = tabSel === 'nube' ? 'Todavía no hay salidas confirmadas en la nube.' : 'Todavía no grabaste salidas. Tu primera aparece acá apenas finalices una.';
    root.innerHTML = `<div class="tex"></div><div class="page"><div class="ph"><div><h1 class="page-title" ${an('header · 📁 HISTORIAL DE ACTIVIDADES')}>Historial</h1><p class="page-sub">Tus salidas en el cerro</p></div><button class="ibtn" data-act="cab.nube" aria-label="Nube y respaldos" ${an('abrirConfigNube() · exportarBackupCompleto()')}>${I(S.net === 'offline' ? 'wifiOff' : 'cloud', 22)}</button></div>
      <div class="stack"><div class="card" ${an('card-prep · Tu Rendimiento Acumulado · actualizarTotalesCiclistaHistorial()')}><div class="lbl">Acumulado</div><div class="big3"><div><div class="num">${U.num(km, 0)}<small>km</small></div><div class="l">Totales</div></div><div><div class="num zt-y">+${U.num(asc, 0)}<small>m</small></div><div class="l">Desnivel</div></div><div><div class="num">${all.length}</div><div class="l">Salidas</div></div></div></div>
      <div class="seg" ${an('pestanas-historial · cambiarPestanaHistorial()')}><button class="${tabSel === 'local' ? 'on' : ''}" data-act="hist.tab" data-k="local">${I('phone', 16)} En este teléfono · ${all.length}</button><button class="${tabSel === 'nube' ? 'on' : ''}" data-act="hist.tab" data-k="nube">${I('cloud', 16)} En la nube · ${cloud.length}</button></div>
      ${pend ? `<div class="syncbar" ${an('btn-nube-action · sincronizarPendientesFirestore()')}><i class="dt"></i><span class="grow">${pend} salida${pend === 1 ? '' : 's'} sin subir a la nube${S.net === 'offline' ? ' · sin conexión' : ''}</span><button class="btn btn-y xs" data-act="hist.sync">${I('sync', 15)} Sincronizar</button></div>` : ''}
      <div class="stack" style="gap:calc(9px*var(--sp))">${html || `<div class="card tight muted" style="text-align:center;padding:26px 14px">${I('history', 34)}<p style="margin-top:8px">${empty}</p></div>`}</div></div></div>`;
  }
})();
