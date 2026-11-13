# diseno-v2 — Diseño «Verde táctico» de Radar Táctico MTB (paquete de fidelidad)

Esta carpeta hace que **todas las IAs construyan la app con el diseño exacto que Claude entregó**, sin cambiarlo.

## Cómo usarla (3 pasos)

1. **Subir la carpeta al repo.** En GitHub: *Add file → Upload files* y arrastrá la carpeta `diseno-v2/` completa (sin `node_modules`) a la raíz del repositorio `proyectmtb`. Confirmá el commit.
2. **Avisarle a las IAs que la lean.** Copiá el bloque de `AGENTS_AGREGAR.md` al final de `AGENTS.md` y de `CLAUDE.md` del repo.
3. **Pegar el texto de `PROMPT_PARA_IAS.md`** al empezar cada chat con ChatGPT, Codex, Antigravity, etc.

Cuando una IA diga que terminó una pantalla, pedile la salida de los dos controles (ver abajo). Si fallan, no terminó.

## Qué hay adentro

| Archivo / carpeta | Qué es |
|---|---|
| `CONTRATO_DE_FIDELIDAD.md` | Las reglas: qué no se puede cambiar, qué sí, cómo proponer cambios, cómo se verifica |
| `PROMPT_PARA_IAS.md` | Texto listo para pegar en cada chat |
| `AGENTS_AGREGAR.md` | Bloque para `AGENTS.md` / `CLAUDE.md` |
| `prototipo/` | El diseño vivo (un `.html` que se abre en el navegador) |
| `especificacion/` | La especificación escrita |
| `tokens/` | Colores, tipografía y medidas oficiales (CSS) |
| `fuentes/` | Barlow y Barlow Condensed (sin conexión) |
| `referencia/` | 40 capturas de cada pantalla y estado + medidas de cada elemento |
| `herramientas/` | Los dos controles automáticos (auditor de colores y comparador de pantallas) |
| `fuente-prototipo/` | Código del prototipo (CSS de referencia) |

## Los dos controles automáticos

Requieren Node.js. Una sola vez: `cd diseno-v2/herramientas && npm install && npx playwright install chromium`.

- **Colores y fuentes:** `node auditar-colores.js ../../index.html --estricto` → lista cada color o fuente que no es del diseño. Sobre el `index.html` actual detecta, por ejemplo, el verde viejo `#20C997` (88 veces).
- **Pantallas:** `node comparar-capturas.js --impl implementacion.json --estricto` → saca capturas de la app y las compara con las 40 de referencia. Los sectores de mapa se tapan porque la app usa mapa real.

La app necesita un **modo demo con datos fijos** para poder compararse (contrato §6); se lo pedís a la IA que programe.

## Para cambiar el diseño en el futuro

Solo con tu aprobación: se actualiza el prototipo, se regeneran las capturas (`node generar-referencia.js`) y se anota en el registro del contrato (§10). Hasta entonces, nadie lo toca.

## Licencias

Las fuentes Barlow son de uso libre (SIL OFL 1.1, ver `fuentes/LEEME.txt`). Los datos del prototipo son todos de muestra (sintéticos).
