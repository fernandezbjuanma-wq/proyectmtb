# Bloque para agregar al final de AGENTS.md y de CLAUDE.md del repo

(Copiar tal cual, desde la línea de abajo. Lo lee cada IA automáticamente cuando abre el repo.)

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
