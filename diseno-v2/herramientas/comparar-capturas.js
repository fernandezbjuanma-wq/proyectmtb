#!/usr/bin/env node
/* Comparador de capturas: tu app vs. el diseño aprobado (40 pantallas/estados de ../referencia).
 *
 *   cd diseno-v2/herramientas && npm install && npx playwright install chromium
 *   cp implementacion.ejemplo.json implementacion.json     # y completalo (ver LEEME / CONTRATO)
 *   node comparar-capturas.js --impl implementacion.json              # compara todos los estados
 *   node comparar-capturas.js --impl implementacion.json --estado 01,04,22   # solo algunos (prefijo de id)
 *   node comparar-capturas.js --impl implementacion.json --estricto   # exit 1 si algún estado falla
 *   node comparar-capturas.js --autotest                              # prueba interna: el prototipo contra sí mismo (debe dar 0 %)
 *
 * Cómo compara:
 *   · Mismo tamaño que la referencia: 390×844 px CSS, escala 2 (780×1688 px), movimiento reducido.
 *   · Las zonas de mapa/canvas se TAPAN en ambas imágenes (la app real usa un mapa real); el resto se compara píxel a píxel
 *     con pixelmatch (umbral de color 0.01 = casi exacto). Un estado APRUEBA si el % de píxeles distintos ≤ tolerancia (2 % por defecto).
 *   · Escribe ../informe-fidelidad/<id>-diff.png (referencia | tu app | diferencias) y informe.json / informe.md.
 *
 * Archivo de implementación (implementacion.json):
 *   {
 *     "url_base": "http://localhost:5173/",             // dónde corre tu app (modo demo con datos fijos, ver contrato §6)
 *     "esperar_ms": 900,
 *     "selector_scroll": ".tab.on .page",                // contenedor que hace scroll en tu app (para las acciones {scroll})
 *     "mascaras_css": [".leaflet-container", "canvas"],  // además de las máscaras de la referencia
 *     "estados": {
 *       "01-radar-mapa": { "url": "?demo=1#/radar", "acciones": [] },
 *       "22-hoja-cabina-herramientas": { "url": "?demo=1#/radar", "acciones": [ { "click": "[data-testid=hdr-herramientas]" } ] }
 *     }
 *   }
 *   Las «acciones» son las mismas que usa la referencia (ver ../referencia/manifiesto.json):
 *   { "click": "selector" } · { "scroll": 600 } (px en el contenedor con scroll de la pestaña activa) · { "eval": "js" }
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

const args = process.argv.slice(2);
const opt = (n, d = null) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d; };
const flag = (n) => args.includes(n);

const REF = path.resolve(__dirname, '..', 'referencia');
const M = JSON.parse(fs.readFileSync(path.join(REF, 'manifiesto.json'), 'utf8'));
const MED = JSON.parse(fs.readFileSync(path.join(REF, 'medidas.json'), 'utf8'));
const OUT = path.resolve(opt('--salida', path.join(__dirname, '..', 'informe-fidelidad')));
const solo = (opt('--estado', '') || '').split(',').filter(Boolean);
const estricto = flag('--estricto');
const tolGlobal = opt('--tolerancia') ? parseFloat(opt('--tolerancia')) : null;
const SCALE = M.viewport.escala;
/* Sensibilidad de color de pixelmatch: 0.01 = casi exacto (detecta hasta un cambio de tono del fondo). Se puede ajustar con --umbral 0.05 solo para depurar. */
const UMBRAL = opt('--umbral') ? parseFloat(opt('--umbral')) : (M.umbral_color_por_defecto ?? 0.01);

let impl;
if (flag('--autotest')) {
  const extra = opt('--extra', '');
  const base = 'file://' + path.resolve(REF, M.prototipo);
  impl = { url_base: base, esperar_ms: 900, mascaras_css: [], estados: Object.fromEntries(M.estados.map((e) => [e.id, { url: e.hash + extra, acciones: e.acciones || [] }])) };
} else {
  const f = opt('--impl');
  if (!f) { console.error('Falta --impl implementacion.json (o usá --autotest). Ver el encabezado de este archivo.'); process.exit(2); }
  impl = JSON.parse(fs.readFileSync(path.resolve(f), 'utf8'));
}

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

function tapar(png, rects) { /* pinta de magenta sólido (mismo color en ambas imágenes) y cuenta píxeles tapados */
  const mask = new Uint8Array(png.width * png.height);
  for (const r of rects) {
    const x0 = Math.max(0, Math.floor(r.x * SCALE)), y0 = Math.max(0, Math.floor(r.y * SCALE));
    const x1 = Math.min(png.width, Math.ceil((r.x + r.w) * SCALE)), y1 = Math.min(png.height, Math.ceil((r.y + r.h) * SCALE));
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) mask[y * png.width + x] = 1;
  }
  for (let i = 0; i < mask.length; i++) if (mask[i]) { const o = i * 4; png.data[o] = 255; png.data[o + 1] = 0; png.data[o + 2] = 255; png.data[o + 3] = 255; }
  return mask.reduce((a, b) => a + b, 0);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const br = await chromium.launch();
  const filas = [];
  for (const e of M.estados) {
    if (solo.length && !solo.some((p) => e.id.startsWith(p))) continue;
    const def = impl.estados && impl.estados[e.id];
    if (!def) { filas.push({ id: e.id, titulo: e.titulo, estado: 'SIN_IMPLEMENTAR', diff_pct: null }); console.log(e.id.padEnd(34), '✖ SIN IMPLEMENTAR (falta en implementacion.json)'); continue; }
    const ctx = await br.newContext({ viewport: { width: M.viewport.ancho, height: M.viewport.alto }, deviceScaleFactor: SCALE, reducedMotion: 'reduce' });
    const pg = await ctx.newPage();
    const errs = []; pg.on('pageerror', (x) => errs.push(x.message));
    try {
      const url = /^(file|https?):/.test(def.url || '') ? def.url : (impl.url_base || '') + (def.url || '');
      await pg.goto(url);
      await pg.evaluate(() => document.fonts && document.fonts.ready);
      await pg.waitForTimeout(impl.esperar_ms || 900);
      for (const a of def.acciones || []) {
        if (a.click) await pg.click(a.click + ' >> visible=true', { timeout: 4000 });
        else if (a.scroll !== undefined) await pg.evaluate(([px, sel]) => { const s = document.querySelector(sel); if (s) s.scrollTop = px; }, [a.scroll, impl.selector_scroll || '.tab.on .page, .tab.on .vscroll']);
        else if (a.eval) await pg.evaluate(a.eval);
        await pg.waitForTimeout(a.esperar || 450);
      }
      await pg.waitForTimeout(500);
      const buf = await pg.screenshot();
      const A = PNG.sync.read(fs.readFileSync(path.join(REF, e.id + '.png')));
      const B = PNG.sync.read(buf);
      if (A.width !== B.width || A.height !== B.height) {
        filas.push({ id: e.id, titulo: e.titulo, estado: 'TAMAÑO_DISTINTO', diff_pct: null, detalle: `referencia ${A.width}×${A.height} · tu app ${B.width}×${B.height}` });
        console.log(e.id.padEnd(34), `✖ tamaño distinto: ref ${A.width}×${A.height} vs app ${B.width}×${B.height}`);
        await ctx.close(); continue;
      }
      let rects = (MED[e.id] && MED[e.id].mascaras) || [];
      for (const s of [...(e.mascaras || []), ...(impl.mascaras_css || [])]) rects = rects.concat(await pg.evaluate(rectsDe, s));
      const tapadosA = tapar(A, rects), tapadosB = tapar(B, rects);
      const diff = new PNG({ width: A.width, height: A.height });
      const n = pixelmatch(A.data, B.data, diff.data, A.width, A.height, { threshold: UMBRAL, includeAA: false, diffColor: [255, 40, 80] });
      const util = A.width * A.height - Math.max(tapadosA, tapadosB);
      const pct = Math.round((n / util) * 10000) / 100;
      const tol = tolGlobal ?? e.tolerancia_pct ?? M.tolerancia_pct_por_defecto ?? 2;
      const ok = pct <= tol;
      /* hoja lado a lado: referencia | tu app | diferencias */
      const W = A.width, H = A.height, sheet = new PNG({ width: W * 3 + 40, height: H });
      sheet.data.fill(40);
      [A, B, diff].forEach((img, k) => PNG.bitblt(img, sheet, 0, 0, W, H, k * (W + 20), 0));
      if (!ok || flag('--todos-los-diff')) fs.writeFileSync(path.join(OUT, e.id + '-diff.png'), PNG.sync.write(sheet));
      filas.push({ id: e.id, titulo: e.titulo, estado: ok ? 'OK' : 'DIFERENTE', diff_pct: pct, tolerancia_pct: tol, errores_js: errs.length });
      console.log(e.id.padEnd(34), ok ? '✔' : '✖', String(pct).padStart(6) + ' %', `(tolerancia ${tol} %)`, errs.length ? ' · errores JS: ' + errs[0] : '');
    } catch (err) {
      filas.push({ id: e.id, titulo: e.titulo, estado: 'ERROR', diff_pct: null, detalle: String(err.message).split('\n')[0] });
      console.log(e.id.padEnd(34), '✖ ERROR:', String(err.message).split('\n')[0]);
    }
    await ctx.close();
  }
  await br.close();

  const ok = filas.filter((f) => f.estado === 'OK').length;
  const resumen = { fecha: new Date().toISOString(), total: filas.length, aprueban: ok, fallan: filas.length - ok, estados: filas };
  fs.writeFileSync(path.join(OUT, 'informe.json'), JSON.stringify(resumen, null, 2));
  const md = ['# Informe de fidelidad al diseño V2', '', `Aprueban **${ok} / ${filas.length}** estados.`, '', '| Estado | Resultado | Diferencia |', '|---|---|---|',
    ...filas.map((f) => `| ${f.id} · ${f.titulo} | ${f.estado} | ${f.diff_pct == null ? (f.detalle || '—') : f.diff_pct + ' %'} |`), '',
    'Las imágenes `<id>-diff.png` de esta carpeta muestran: referencia | tu app | diferencias (rosa).'];
  fs.writeFileSync(path.join(OUT, 'informe.md'), md.join('\n'));
  console.log(`\n${ok}/${filas.length} estados fieles al diseño. Informe en ${OUT}`);
  if (estricto && ok !== filas.length) process.exit(1);
})();
