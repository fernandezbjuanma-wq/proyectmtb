/* ============================================================
   Arranque: navegación, reloj de simulación, atajos de prueba por hash
   ============================================================ */
(function () {
  'use strict';
  const RT = window.RT, U = RT.U, S = RT.S, I = RT.icon, an = RT.an;
  const TABS = [['prep', 'Preparación', 'wrench', 'cambiarPestanaApp(\'prep\')'], ['radar', 'Radar', 'radar', 'cambiarPestanaApp(\'radar\')'], ['lab', 'Laboratorio', 'flask', 'cambiarPestanaApp(\'lab\')'], ['hist', 'Historial', 'history', 'cambiarPestanaApp(\'hist\')']];

  RT.go = (t) => {
    S.tab = t;
    document.querySelectorAll('.tab').forEach((e) => e.classList.toggle('on', e.id === 'tab-' + t));
    document.querySelectorAll('#nav button').forEach((b) => { const on = b.dataset.t === t; b.classList.toggle('on', on); if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    if (t === 'lab') RT.lab.onShow();
    if (t === 'radar') setTimeout(() => { RT.maps.forEach((m) => m.resize()); RT.drawAll(); RT.radar.update(true); }, 30);
    RT.emit('tab', t);
  };
  RT.acts.nav = (t) => RT.go(t.dataset.t);

  const hash = {}; (location.hash || '').replace(/^#/, '').split('&').forEach((p) => { const [k, v] = p.split('='); if (k) hash[k] = decodeURIComponent(v || ''); });

  RT.applyCfg();
  if (hash.view) RT.cfg.view = hash.view;
  document.getElementById('nav').innerHTML = TABS.map((t) => `<button data-act="nav" data-t="${t[0]}" ${an('bottom-nav · ' + t[3])}>${I(t[2], 24)}<span>${t[1]}</span></button>`).join('');
  RT.prep.build(document.getElementById('tab-prep'));
  RT.radar.build(document.getElementById('tab-radar'));
  RT.lab.build(document.getElementById('tab-lab'));
  RT.hist.build(document.getElementById('tab-hist'));
  RT.tw.build(document.getElementById('tweaks'));
  document.getElementById('twfab').addEventListener('click', () => RT.tw.toggle());
  document.getElementById('twfab').innerHTML = I('sliders', 24);
  if (window.innerWidth <= 860) document.body.classList.remove('tw-hidden');
  if (hash.tw === '0') document.body.classList.add('tw-hidden');
  if (hash.an === '1') { RT.cfg.an = 'on'; RT.applyCfg(); }
  if (hash.pal) { RT.cfg.pal = hash.pal; RT.applyCfg(); }
  if (hash.map) RT.cfg.mapStyle = hash.map;

  /* barra de estado del teléfono */
  const clock = () => { const d = new Date(); document.getElementById('clock').textContent = d.getHours() + ':' + U.pad2(d.getMinutes()); };
  clock(); setInterval(clock, 20000);
  document.getElementById('osr').innerHTML = `${I('signal', 15)}${I(S.net === 'offline' ? 'wifiOff' : 'wifi', 15)}<span style="display:inline-flex;align-items:center;gap:3px">${I('battery', 17)}<span>${S.battery}%</span></span>`;
  RT.on('tick', (() => { let last = ''; return () => { const k = S.net + S.battery; if (k !== last) { last = k; document.getElementById('osr').innerHTML = `${I('signal', 15)}${I(S.net === 'offline' ? 'wifiOff' : 'wifi', 15)}<span style="display:inline-flex;align-items:center;gap:3px">${I('battery', 17)}<span>${S.battery}%</span></span>`; } }; })());

  RT.scenario(hash.scen || 'boceto');
  if (hash.scen) RT.tw.scen = hash.scen; else RT.tw.scen = 'boceto';
  RT.tw.render();
  RT.go(hash.tab || 'radar');
  RT.refit();

  /* reloj de simulación: avanza solo si hay reproducción activa */
  let last = performance.now();
  setInterval(() => { const n = performance.now(), dt = Math.min(1, (n - last) / 1000); last = n; RT.tick(dt); }, 250);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { const st = RT.ui.stack || []; if (st.length) st[st.length - 1].close(); } });
  window.addEventListener('load', () => setTimeout(() => RT.refit(), 100));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { RT.drawAll(); RT.radar.update(true); });
})();
