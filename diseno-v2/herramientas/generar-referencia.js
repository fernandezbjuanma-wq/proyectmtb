#!/usr/bin/env node
/* Regenera las capturas de referencia y medidas.json a partir del prototipo y del manifiesto.
 *
 *   cd diseno-v2/herramientas && npm install && npx playwright install chromium
 *   node generar-referencia.js            -> escribe ../referencia/*.png y ../referencia/medidas.json
 *   node generar-referencia.js 01,04      -> solo esos estados (por prefijo de id)
 *
 * Solo hay que regenerar las capturas si el usuario aprueba un cambio de diseño.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const REF = path.resolve(__dirname, '..', 'referencia');
const M = JSON.parse(fs.readFileSync(path.join(REF, 'manifiesto.json'), 'utf8'));
const solo = (process.argv[2] || '').split(',').filter(Boolean);
const URL = 'file://' + path.resolve(REF, M.prototipo);

/* Mide los elementos visibles: posición y tamaño en px CSS (se usa para dar medidas exactas y para las máscaras). */
const medir = () => {
  const SEL = 'button, a[href], input, select, textarea, canvas, svg.ribbon, h1, h2, h3, [data-act], .card, .mcard, .stat, .pill, .rec, .aviso, .malert, .dock, .sysbar, .hero, .lrow, .act, .month, .seg, .sheet, .dialog, .toast';
  const out = [], seen = new Set();
  document.querySelectorAll(SEL).forEach((el) => {
    if (seen.has(el)) return; seen.add(el);
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    if (r.width < 1 || r.height < 1 || cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return;
    if (r.right < 0 || r.bottom < 0 || r.left > innerWidth || r.top > innerHeight) return;
    const label = (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    out.push({
      tag: el.tagName.toLowerCase(), clase: (el.getAttribute('class') || '').split(/\s+/).filter(Boolean).slice(0, 3).join(' '),
      accion: el.getAttribute('data-act') || undefined, texto: label,
      x: Math.round(r.x * 2) / 2, y: Math.round(r.y * 2) / 2, w: Math.round(r.width * 2) / 2, h: Math.round(r.height * 2) / 2,
    });
  });
  return out;
};
const rectsDe = (sel) => {
  const o = [];
  document.querySelectorAll(sel).forEach((el) => {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    if (r.width < 1 || r.height < 1 || cs.visibility === 'hidden' || cs.display === 'none') return;
    const x0 = Math.max(0, r.left), y0 = Math.max(0, r.top), x1 = Math.min(innerWidth, r.right), y1 = Math.min(innerHeight, r.bottom);
    if (x1 > x0 && y1 > y0) o.push({ x: Math.floor(x0), y: Math.floor(y0), w: Math.ceil(x1 - x0), h: Math.ceil(y1 - y0) });
  });
  return o;
};

(async () => {
  const br = await chromium.launch();
  const medidas = fs.existsSync(path.join(REF, 'medidas.json')) ? JSON.parse(fs.readFileSync(path.join(REF, 'medidas.json'), 'utf8')) : {};
  let n = 0;
  for (const e of M.estados) {
    if (solo.length && !solo.some((p) => e.id.startsWith(p))) continue;
    const ctx = await br.newContext({ viewport: { width: M.viewport.ancho, height: M.viewport.alto }, deviceScaleFactor: M.viewport.escala, reducedMotion: 'reduce' });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', (x) => errs.push(x.message));
    await pg.goto(URL + e.hash);
    await pg.waitForTimeout(900);
    for (const a of e.acciones || []) {
      if (a.click) await pg.click(a.click + ' >> visible=true', { timeout: 3000 });
      else if (a.scroll !== undefined) await pg.evaluate((px) => { const s = document.querySelector('.tab.on .page, .tab.on .vscroll'); if (s) s.scrollTop = px; }, a.scroll);
      else if (a.eval) await pg.evaluate(a.eval);
      await pg.waitForTimeout(a.esperar || 450);
    }
    await pg.waitForTimeout(500);
    await pg.screenshot({ path: path.join(REF, e.id + '.png') });
    const masc = [];
    for (const s of e.mascaras || M.mascaras_por_defecto || []) masc.push(...(await pg.evaluate(rectsDe, s)));
    medidas[e.id] = { titulo: e.titulo, viewport_css: [M.viewport.ancho, M.viewport.alto], mascaras: masc, elementos: await pg.evaluate(medir) };
    console.log(e.id.padEnd(34), errs.length ? 'ERRORES: ' + errs.join(' | ') : 'ok', '·', medidas[e.id].elementos.length, 'elementos');
    n++;
    await ctx.close();
  }
  fs.writeFileSync(path.join(REF, 'medidas.json'), JSON.stringify(medidas));
  console.log('\n' + n + ' estados generados en ' + REF);
  await br.close();
})();
