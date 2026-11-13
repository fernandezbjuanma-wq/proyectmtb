#!/usr/bin/env node
/* Auditor de colores y tipografías del diseño V2 «Verde táctico».
 *
 * Busca en tu código (CSS, HTML, JS/TS, SVG) colores o fuentes que NO pertenezcan al diseño aprobado.
 * No necesita instalar nada (solo Node 16+).
 *
 *   node auditar-colores.js ../../index.html ../../src          # informe
 *   node auditar-colores.js ../../src --estricto                # exit 1 si hay colores/fuentes fuera del diseño
 *   node auditar-colores.js archivo.css --json                  # salida JSON para otras herramientas
 *   node auditar-colores.js archivo.css --tokens otra/ruta.css  # tokens alternativos (no recomendado)
 *
 * Qué se considera «aprobado»:
 *   · cualquier color que aparezca en ../tokens/tokens-verde-tactico.css (con cualquier transparencia)
 *   · negro y blanco puros (#000 / #fff, con cualquier transparencia: sombras, velos)
 *   · transparent / currentColor / inherit
 * Para silenciar una línea justificada y aprobada por Juanma: agregá  /* audit:ok *​/  en esa línea.
 * (No lo uses para «hacer pasar» el auditor: el contrato prohíbe cambiar colores sin aprobación.)
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const estricto = flag('--estricto'), asJson = flag('--json');
const tokensPath = path.resolve(opt('--tokens') || path.join(__dirname, '..', 'tokens', 'tokens-verde-tactico.css'));
const skipVal = new Set([opt('--tokens')].filter(Boolean));
const targets = args.filter((a) => !a.startsWith('--') && !skipVal.has(a));
if (!targets.length) { console.error('Uso: node auditar-colores.js <archivo|carpeta>... [--estricto] [--json] [--tokens ruta.css]'); process.exit(2); }

/* ---------- colores ---------- */
const NAMED = { white: [255, 255, 255, 1], black: [0, 0, 0, 1] };
function hexToRgba(h) {
  h = h.slice(1);
  if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6 && h.length !== 8) return null;
  const n = (i) => parseInt(h.substr(i, 2), 16);
  return [n(0), n(2), n(4), h.length === 8 ? +(n(6) / 255).toFixed(3) : 1];
}
function hslToRgb(h, s, l) {
  s /= 100; l /= 100; h = ((h % 360) + 360) % 360;
  const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}
function parseFn(s) {
  const m = s.match(/^(rgba?|hsla?)\(\s*([^)]*)\)$/i); if (!m) return null;
  const parts = m[2].replace(/\//g, ' ').split(/[\s,]+/).filter(Boolean);
  if (parts.some((p) => /var\(|calc\(/.test(p))) return null; /* dinámico: no auditable */
  const num = (p) => (p.endsWith('%') ? parseFloat(p) : parseFloat(p));
  let a = parts[3] !== undefined ? (parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3])) : 1;
  if (/^rgb/i.test(m[1])) {
    const c = parts.slice(0, 3).map((p) => (p.endsWith('%') ? Math.round(parseFloat(p) * 2.55) : Math.round(num(p))));
    return c.some(isNaN) ? null : [...c, a];
  }
  const [h, s2, l] = [parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2])];
  if ([h, s2, l].some(isNaN)) return null;
  return [...hslToRgb(h, s2, l), a];
}
const COLOR_RE = /#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{4}\b|#[0-9a-fA-F]{3}\b|\b(?:rgba?|hsla?)\([^)]*\)/g;
const key = (c) => c.slice(0, 3).join(',');
const hex2 = (c) => '#' + c.slice(0, 3).map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();

/* ---------- tokens aprobados ---------- */
if (!fs.existsSync(tokensPath)) { console.error('No encuentro el archivo de tokens: ' + tokensPath); process.exit(2); }
const tokenSrc = fs.readFileSync(tokensPath, 'utf8');
/* solo el CSS efectivo: sin comentarios (la lista «excluido» está en un comentario) */
const tokenCss = tokenSrc.replace(/\/\*[\s\S]*?\*\//g, '');
const aprobados = new Map(); /* rgb → nombre del token */
const tokenNames = [];
for (const m of tokenCss.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
  for (const cm of m[2].matchAll(COLOR_RE)) {
    const c = cm[0].startsWith('#') ? hexToRgba(cm[0]) : parseFn(cm[0]);
    if (!c) continue;
    if (!aprobados.has(key(c))) aprobados.set(key(c), m[1]);
  }
}
/* tokens «cercanos» sugeridos: solo los del bloque :root (paleta por defecto), opacos */
const rootBlock = (tokenCss.match(/:root\s*\{([\s\S]*?)\n\}/) || [, ''])[1];
for (const m of rootBlock.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) { const c = hexToRgba(m[2]); if (c && c[3] >= .99 && !/-ink$/.test(m[1]) && m[1] !== '--strava') tokenNames.push({ n: m[1], c }); }
for (const m of tokenCss.matchAll(/\bcolor\s*:\s*(#[0-9a-fA-F]{3,8})\b/g)) { const c = hexToRgba(m[1]); if (c && !aprobados.has(key(c))) aprobados.set(key(c), '(.zt-*)'); }
aprobados.set('0,0,0', 'negro'); aprobados.set('255,255,255', 'blanco');

function cercano(c) {
  let best = null, bd = 1e9;
  for (const t of tokenNames) { const d = (t.c[0] - c[0]) ** 2 + (t.c[1] - c[1]) ** 2 + (t.c[2] - c[2]) ** 2; if (d < bd) { bd = d; best = t.n; } }
  return best;
}

/* ---------- fuentes ---------- */
const FONT_OK = /^(var\(|inherit|initial|unset|system-ui|-apple-system|sans-serif|monospace|ui-monospace|arial narrow|barlow|barlow condensed|segoe ui|arial)/i;
const FONT_MAL = /(inter|roboto|archivo|b612|big shoulders|public sans|poppins|montserrat|open sans|lato|helvetica|times|georgia|courier|sf pro|oswald|bebas|rajdhani|orbitron|space grotesk|ibm plex|jetbrains|fira)/i;

/* ---------- recorrido ---------- */
const rel = (f) => { const r = path.relative(process.cwd(), f); return r.startsWith('../../..') ? f : r; };
const EXT = new Set(['.css', '.html', '.htm', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.svg', '.scss']);
const SKIP_DIR = new Set(['node_modules', '.git', 'dist', 'build', 'referencia', 'prototipo', 'fuente-prototipo', 'fuentes', '.next', 'coverage']);
function walk(p, out) {
  const st = fs.statSync(p);
  if (st.isDirectory()) { if (SKIP_DIR.has(path.basename(p)) && !targets.map((t) => path.resolve(t)).includes(path.resolve(p))) return; for (const f of fs.readdirSync(p)) walk(path.join(p, f), out); }
  else if (EXT.has(path.extname(p).toLowerCase()) && path.resolve(p) !== tokensPath) out.push(p);
}
const files = []; targets.forEach((t) => { if (!fs.existsSync(t)) { console.error('No existe: ' + t); process.exit(2); } walk(t, files); });

/* ---------- análisis ---------- */
const bad = new Map(); /* hex → {n, c, nearest, sitios[]} */
const fontBad = [], palBad = [];
let totalColores = 0, totalOk = 0, usosVar = 0;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  /* base64 y data-URI de fuentes/imágenes: no son colores */
  const lines = src.split('\n');
  let enComentario = false;
  lines.forEach((line, i) => {
    if (line.length > 4000 && /base64,/.test(line)) return;
    if (/audit:ok/.test(line)) return;
    /* quitar comentarios de bloque (también multilínea) y de línea en JS/CSS */
    let L = line, ini;
    if (enComentario) { const e = L.indexOf('*/'); if (e < 0) return; L = L.slice(e + 2); enComentario = false; }
    while ((ini = L.indexOf('/*')) >= 0) { const e = L.indexOf('*/', ini + 2); if (e < 0) { L = L.slice(0, ini); enComentario = true; break; } L = L.slice(0, ini) + ' ' + L.slice(e + 2); }
    L = L.replace(/(^|\s)\/\/.*$/, '$1');
    usosVar += (L.match(/var\(--/g) || []).length;
    for (const m of L.matchAll(COLOR_RE)) {
      const c = m[0].startsWith('#') ? hexToRgba(m[0]) : parseFn(m[0]);
      if (!c) continue;
      totalColores++;
      if (aprobados.has(key(c))) { totalOk++; continue; }
      const k = hex2(c);
      if (!bad.has(k)) bad.set(k, { color: k, n: 0, cercano: cercano(c), sitios: [] });
      const b = bad.get(k); b.n++; if (b.sitios.length < 4) b.sitios.push(rel(f) + ':' + (i + 1));
    }
    for (const m of L.matchAll(/font-family\s*:\s*([^;}{]+)/gi)) {
      const first = m[1].trim().replace(/^['"]/, '').split(/,/)[0].replace(/['"]/g, '').trim();
      if (!FONT_OK.test(first) || FONT_MAL.test(first)) fontBad.push({ fuente: m[1].trim().slice(0, 60), sitio: rel(f) + ':' + (i + 1) });
    }
    for (const m of L.matchAll(/data-pal\s*=\s*["']?(semaforo|hud|cerro)["']?/gi)) palBad.push({ paleta: m[1], sitio: rel(f) + ':' + (i + 1) });
  });
}

const lista = [...bad.values()].sort((a, b) => b.n - a.n);
const resultado = { archivos: files.length, colores_totales: totalColores, colores_aprobados: totalOk, colores_fuera_del_diseno: totalColores - totalOk, colores_distintos_fuera: lista.length, usos_de_var: usosVar, fuentes_fuera: fontBad, paletas_excluidas: palBad, detalle: lista };

if (asJson) console.log(JSON.stringify(resultado, null, 2));
else {
  console.log(`\nAuditoría de colores · diseño V2 «Verde táctico»`);
  console.log(`Archivos revisados: ${files.length} · colores encontrados: ${totalColores} · aprobados: ${totalOk} · FUERA del diseño: ${totalColores - totalOk} (${lista.length} distintos) · usos de var(--…): ${usosVar}\n`);
  if (lista.length) {
    console.log('COLORES FUERA DEL DISEÑO (reemplazar por el token más parecido, o pedir aprobación):');
    for (const b of lista.slice(0, 60)) console.log(`  ${b.color}  ×${String(b.n).padEnd(4)} token más cercano: var(${b.cercano})   ${b.sitios.join('  ')}`);
    if (lista.length > 60) console.log(`  … y ${lista.length - 60} colores más (usá --json para ver todos)`);
  }
  if (fontBad.length) { console.log('\nFUENTES FUERA DEL DISEÑO (solo Barlow y Barlow Condensed):'); fontBad.slice(0, 30).forEach((f) => console.log(`  ${f.fuente}   ${f.sitio}`)); }
  if (palBad.length) { console.log('\nPALETAS EXCLUIDAS (semáforo / hud / cerro no están aprobadas):'); palBad.slice(0, 20).forEach((p) => console.log(`  ${p.paleta}   ${p.sitio}`)); }
  const falla = lista.length || fontBad.length || palBad.length;
  console.log(falla ? '\nRESULTADO: ✖ hay diferencias con el diseño aprobado.' : '\nRESULTADO: ✔ todos los colores y fuentes pertenecen al diseño aprobado.');
}
if (estricto && (lista.length || fontBad.length || palBad.length)) process.exit(1);
