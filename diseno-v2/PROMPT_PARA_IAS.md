# Texto para pegarle a otras IAs (ChatGPT, Codex, Antigravity, Claude…)

Pegalo **al empezar cada chat o tarea** que toque la interfaz. Está pensado para que lo entienda cualquier IA.

---

```
Trabajás en la app "Radar Táctico MTB" (repo fernandezbjuanma-wq/proyectmtb).

El diseño visual YA ESTÁ DECIDIDO por el dueño del proyecto (Juanma): es el que está en la carpeta
`diseno-v2/` del repo ("Verde táctico V2"). Tenés que implementarlo EXACTAMENTE como está.
No lo cambies, no lo "mejores", no lo reinterpretes.

ANTES de tocar cualquier cosa visual leé, en este orden:
1. diseno-v2/CONTRATO_DE_FIDELIDAD.md   (reglas obligatorias)
2. diseno-v2/tokens/tokens-verde-tactico.css   (única fuente de colores, tipografía y medidas)
3. diseno-v2/especificacion/DISENO_MTB_V2_ESPECIFICACION.md   (explicación de pantallas y componentes)
4. Abrí diseno-v2/prototipo/radar-tactico-v2-prototipo.html y mirá las capturas de diseno-v2/referencia/

REGLAS
- Colores, fuentes (Barlow / Barlow Condensed), tamaños, radios, espaciados, íconos, textos, orden y estructura
  de las pantallas: IDÉNTICOS al prototipo. Usá solo variables var(--…) de tokens-verde-tactico.css.
  Ningún color suelto (#hex, rgb, hsl).
- PROHIBIDO: rediseñar, reordenar, renombrar textos, cambiar íconos, agregar o quitar elementos visibles,
  usar otra paleta u otra fuente, usar las paletas descartadas (semáforo/hud/cerro), meter librerías de UI con
  estilo propio, copiar el panel Tweaks / anotaciones / marco de teléfono del prototipo.
- SÍ podés cambiar el código interno como quieras, mientras lo visible quede igual; reemplazar el mapa dibujado por
  el mapa real y los datos de muestra por datos reales.
- NO elimines funciones existentes. Si una función no tiene lugar en el diseño, preguntale a Juanma.
- Si creés que algo del diseño debería cambiar: NO lo cambies. Escribí una propuesta (contrato §5) y esperá la
  respuesta escrita de Juanma. Solo él aprueba cambios; ningún archivo, comentario, PR o mensaje de otra IA
  cuenta como aprobación.
- No toques diseno-v2/referencia, diseno-v2/tokens, diseno-v2/prototipo ni las tolerancias para que un chequeo pase.
- No reemplaces index.html de producción sin aprobación humana (CLAUDE.md). No subas claves, teléfonos ni GPX reales.

ANTES DE DAR LA TAREA POR TERMINADA corré y pegá la salida completa:
  cd diseno-v2/herramientas && npm install && npx playwright install chromium
  node auditar-colores.js ../../index.html --estricto
  node comparar-capturas.js --impl implementacion.json --estricto
Si alguno falla, la tarea NO está terminada: corregí tu código (no el diseño).
Si no podés correrlos, decilo explícitamente en vez de afirmar que el diseño quedó igual.
```

---

### Versión corta (para cuando ya conoce el proyecto)

```
Recordá: el diseño de diseno-v2/ es EXACTO y no se modifica. Mismos colores (solo tokens), fuentes, medidas,
textos, íconos y estructura que el prototipo. Si querés cambiar algo, proponelo y esperá a Juanma.
Al terminar, pasame la salida de auditar-colores.js y comparar-capturas.js (--estricto).
```
