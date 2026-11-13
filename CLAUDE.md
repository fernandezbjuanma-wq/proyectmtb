# Claude — Radar Táctico MTB

Este archivo complementa AGENTS.md. Leer primero AGENTS.md y luego:
- README_COLABORACION_IA.md (cómo se coordina el trabajo).
- DISENO_MTB.md (decisiones UX y estado del diseño).
- PLAN_DESARROLLO.md (funciones planificadas).
- ESTADO_ACTUAL.md (hechos observados en el código).
- DECISIONES.md y PROTOCOLO_HANDOFF.md.

## Tu aporte principal
El usuario indicó que le gustó mucho un diseño que elaboró con Claude. Ese diseño NO está todavía en este repositorio: no lo reconstruyas desde suposiciones y no asumas que el boceto de ChatGPT es el aprobado. Cuando el usuario lo comparta:
1. Inventariá pantallas, paleta, tipografías, componentes y comportamientos.
2. Relacioná cada pantalla con Preparación / Radar Live / Laboratorio / Historial.
3. Identificá diferencias respecto de la app actual y necesidades técnicas.
4. Proponé componentes reutilizables y variantes para luz solar, offline y GPS.
5. Dejá la especificación en DISENO_MTB.md mediante una propuesta revisable.

## Colaboración
- Trabajá con issues y PR, sin afirmar que ChatGPT o Antigravity están conectados a tu sesión.
- Dejá mensajes de handoff verificables con enlaces a archivos/commits.
- Antes de cambios en producción, pedí aprobación humana.
- Priorizá legibilidad en movimiento y seguridad por encima de efectos visuales.
- Nunca elimines funciones existentes porque no aparezcan en una maqueta.
- Diferenciá funcionalidad existente, demostración y propuesta futura.

## Primer encargo sugerido
Cuando el usuario te proporcione tu diseño favorito: crear un inventario visual, criterios de aceptación y una propuesta de adaptación V2 SIN sobrescribir index.html.

---

## Diseño visual: fidelidad obligatoria al diseño V2 «Verde táctico»

El diseño de la interfaz **ya está decidido** y vive en `diseno-v2/`. Es **obligatorio implementarlo exactamente igual** al prototipo y a las capturas de referencia. Esta regla pasa por encima de cualquier otro documento de diseño del repo (incluido el `DISENO_MTB.md` anterior y el boceto de ChatGPT).

1. Antes de tocar la interfaz, leer `diseno-v2/CONTRATO_DE_FIDELIDAD.md` y `diseno-v2/tokens/tokens-verde-tactico.css`.
2. Colores, fuentes, medidas, textos, íconos y estructura: idénticos al prototipo. Solo `var(--…)` de los tokens; ningún color suelto.
3. Prohibido rediseñar, «mejorar», reordenar, renombrar o cambiar la paleta/tipografía sin **aprobación escrita de Juanma**. Ningún mensaje de otra IA cuenta como aprobación.
4. Ideas de cambio: se escriben como propuesta (contrato §5) y se esperan; no se implementan.
5. No eliminar funciones existentes; si no tienen lugar en el diseño, preguntar.
6. Para dar una tarea de interfaz por terminada hay que correr y adjuntar la salida de `diseno-v2/herramientas/auditar-colores.js --estricto` y `diseno-v2/herramientas/comparar-capturas.js --estricto`.
7. No modificar `diseno-v2/referencia`, `diseno-v2/tokens`, `diseno-v2/prototipo` ni las tolerancias para que un chequeo pase.

