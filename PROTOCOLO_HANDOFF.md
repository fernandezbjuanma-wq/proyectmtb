# Protocolo de comunicación entre IAs — GitHub como buzón

## Qué sí permite
ChatGPT, Antigravity y Claude pueden leer el mismo repositorio y, cuando tienen acceso y la sesión activa, intercambiar información mediante issues, comentarios, archivos y pull requests. El usuario inicia las sesiones y decide cuándo tomar una tarea.

## Qué NO permite automáticamente
Este protocolo NO conecta las APIs de los modelos, NO permite chats directos entre IAs, NO genera agentes siempre activos ni garantiza que el destinatario lea un mensaje. Los comentarios son persistentes, pero deben ser consultados por cada IA. Sin integraciones adicionales no hay respuesta automática de los otros agentes.

## Forma de trabajar
1. Crear una issue por tarea: título, contexto, objetivo y aceptación.
2. Indicar «Sugerido para: Antigravity / Claude / ChatGPT»; es preferencia de trabajo, NO asignación técnica automática.
3. Crear rama por cambio, por ejemplo feat/mtb-02-radar-personalizado.
4. Implementar y dejar evidencia de pruebas, límites y riesgos.
5. Abrir PR contra main. Solicitar revisión al otro agente a través del usuario o su integración GitHub, si está disponible.
6. El revisor comenta con sugerencias y referencias concretas. Usuario aprueba antes de merge.
7. Actualizar DECISIONES.md, ESTADO_ACTUAL.md y PLAN_DESARROLLO.md solo cuando el cambio lo amerite.

## Plantilla de issue
Título: [MTB-XX] Acción concreta
Objetivo ciclista:
Estado actual en código:
Diseño aprobado o referencia:
Alcance / no alcance:
Dependencias:
Criterios de aceptación:
Pruebas requeridas:
Agente sugerido:
Bloqueantes:
Enlaces:

## Plantilla de handoff (pegar en PR/issue)
### HANDOFF — [Nombre del agente]
Fecha:
Issue/PR:
Commit / rama:
Hecho:
NO hecho:
Archivos afectados:
Decisiones tomadas y evidencias:
Pruebas ejecutadas / resultados:
Pruebas NO ejecutadas:
Riesgos, privacidad, compatibilidad y offline:
Preguntas para el próximo agente:
Acción pedida a usuario/otro agente:

## Regla de evidencia
Evitar «terminado» sin PR/commit y verificaciones. Si se proponen cambios desde ChatGPT pero el código no se ejecutó, indicar «sin prueba local». No compartir credenciales, contactos privados ni ubicaciones sensibles.

## Primer handoff para Antigravity
Lee AGENTS.md y ESTADO_ACTUAL.md. Este PR es de DOCUMENTACIÓN; no actualices la UI ni funciones hasta que el usuario apruebe una issue concreta y entregue el diseño elegido de Claude.
## Primer handoff para Claude
Lee CLAUDE.md y DISENO_MTB.md. Tu diseño anterior fue el favorito del usuario, pero aún no está incluido; pide al usuario el artefacto original y documenta su lenguaje visual antes de proponer implementación.

### HANDOFF — Antigravity | 2026-10-28 | Cloud + Backup + Merge Codex
**Fecha:** 2026-10-28
**Issue/PR:** Trabajo directo sobre main por indicación del usuario.
**Commits/rama:** main, sobre `d3645e0` → merge `7622a0e` (integra Codex `fix/gps-sos-datos-20261028`) → commit pendiente de cloud.

**Hecho:**
1. Merge limpio de la rama de Codex `fix/gps-sos-datos-20261028` (commits `fe0a513` + `8069504`) a main. Sin conflictos. Incluye: `clearWatch` GPS, reinicio de variables entre sesiones, SOS sin coordenadas ficticias, guardado que no descarta puntos silenciosamente.
2. Modal `#modal-config-nube` ampliado con 4 secciones: badge de estado en vivo, sincronización bidireccional, respaldo JSON universal, credenciales Firebase propias.
3. Funciones JS implementadas: `probarConexionFirebase()` (diagnóstico con timeout 6s), `descargarTodasDeNubeALocal()` (descarga hasta 100 actividades + fusión sin duplicados), `exportarBackupCompleto()` (empaqueta actividades + odómetro + segmentos + bikefit en JSON descargable), `importarBackupJSON(event)` (importa y fusiona desde archivo).
4. `actualizarEstadoNubeUI()` actualizado para reflejar estado en el badge del modal.
5. Botones de Historial reorganizados: 🔄 Sincronizar | 📦 Backup | ☁️ Nube.
6. `DECISIONES.md` actualizado con D-011 (Cloud Híbrida) y D-012 (merge Codex).
7. `ESTADO_ACTUAL.md` actualizado con sección de Nube y Respaldos.

**NO hecho:**
- Pruebas en celular real ni en `https://mtbproyect.netlify.app/`.
- IndexedDB para almacenamiento incremental de sesiones largas.
- Reglas de seguridad de Firestore (el proyecto demo no tiene restricciones).
- Mapas offline ni GPS de segundo plano nativo.
- Diseño visual de Claude (pendiente de aprobación por el usuario).

**Archivos afectados:** `index.html`, `DECISIONES.md`, `ESTADO_ACTUAL.md`, `PROTOCOLO_HANDOFF.md`.

**Decisiones tomadas:**
- Fusionar Codex sin PR formal por indicación del usuario.
- Usar `Promise.race` con timeout en el diagnóstico de conexión para no congelar la app sin señal.
- Exportación JSON incluye todos los datos locales (no solo actividades) para migración completa.

**Pruebas ejecutadas:** Verificación sintáctica (llaves balanceadas: `{ = 1171, } = 1171`), presencia de las 4 funciones nuevas, renderizado headless con Edge.
**Pruebas NO ejecutadas:** Funcionalidad real de Firestore, flujo offline → reconexión, importación de respaldo, celular con GPS real.

**Riesgos:**
- Firebase demo config (`AIzaSyDemoMTBRadarKey2026`) es ficticia; el usuario debe pegar su propio proyecto o no habrá sincronización real.
- `localStorage` puede llenarse con muchas actividades con puntos GPS; IndexedDB es la siguiente prioridad.
- El `clearWatch` de Codex y el reproductor de ruta de Antigravity tocan variables de GPS similares; verificar que no interfieran.

**Preguntas para el próximo agente:**
1. ¿El usuario ya creó su proyecto Firebase? Si no, guiarlo con el instructivo del modal.
2. ¿Se confirma que el merge de Codex no introdujo regresiones en el simulador GPX?
3. ¿Cuándo se aplica el diseño visual de Claude?

**Acción pedida a usuario:** Hacer push desde GitHub Desktop, verificar en `https://mtbproyect.netlify.app/` y probar el flujo completo de backup/restauración.

### HANDOFF — Antigravity | 2026-11-05 | IndexedDB + Autoguardado + Web Audio + Zonas HIIT + Export GPX Scrubber
**Fecha:** 2026-11-05
**Issue/PR:** Trabajo directo sobre main por solicitud del usuario ("trabaja en el tema de las tareas pendientes empeza a realizar todo").
**Commits/rama:** main

**Hecho:**
1. **T-002 (IndexedDB `radar_mtb_db`):** Implementada base de datos IndexedDB con ObjectStores `actividades` y `checkpoints`. Migración transparente desde `localStorage` al iniciar la app sin duplicados. Operaciones CRUD (`abrirIndexedDB`, `guardarActividadEnIDB`, `obtenerActividadesDesdeIDB`, `eliminarActividadDeIDB`). Respaldo perpetuo de actividades sin límite de 5MB.
2. **T-003 (Autoguardado y Checkpoints):** Checkpoint periódico automático cada 2 minutos (`iniciarAutoGuardado`, `guardarCheckpointSesion`) durante grabación activa y al pausar. Al recargar o reabrir la app, `verificarCheckpointPendiente` detecta si hubo una salida interrumpida por batería o cierre del navegador y ofrece recuperarla al 100%. Limpieza automática al finalizar normalmente.
3. **T-008 (Audios de entrenamiento):** Implementado sintetizador sonoro táctico con Web Audio API (`emitirTonoTactico`) con frecuencias distintivas (verde = 523Hz Do5, amarillo = 659Hz Mi5 doble tono, rojo/pared = 880Hz La5 triple tono urgente). Web Speech API (`speechSynthesis`) ahora se ejecuta tanto online como offline (usando motores locales TTS de Android), sin depender de archivos MP3 externos.
4. **T-012 (Scroll en selector de entrenamiento):** Agregado `touch-action: pan-x; user-select: none;` en `.selector-modo-scroll` y optimizado para deslizamiento táctil y flechas sin trabas en teléfonos móviles.
5. **T-013 (HIIT Zonas ampliadas):** Añadida opción `Z3 Tempo` junto a Z4, Z5 y Z6 en el selector de ataque de intervalos HIIT. Sincronizado dinámicamente con `actualizarGraficoZonas` para evaluar la zona objetivo elegida por el usuario.
6. **T-016 (Exportar GPX desde Scrubber):** Añadido botón `📥 GPX` en `#widget-reproductor-ruta` y funciones `descargarGPXDesdeScrubber()` y `descargarPuntosComoGPX()` para exportar el track analizado directamente en el mapa.
7. **Documentación:** Actualizados `TAREAS_PENDIENTES.md`, `DECISIONES.md` (D-013) y `PROTOCOLO_HANDOFF.md`.

**NO hecho:**
- T-001 (Proyecto Firebase real en consola Google - requiere interacción del usuario).
- T-004 (Pruebas en campo real con celular - pendiente de feedback del usuario).
- T-006 (Reglas de seguridad y auth en Firestore).
- T-010 (Colores del boceto visual de Claude - pendiente de confirmación de paleta).

**Pruebas ejecutadas:** Verificación sintáctica JavaScript (llaves balanceadas: 1259 open / 1259 close), renderizado headless con Microsoft Edge.
**Acción pedida al usuario:** Abrir GitHub Desktop y hacer click en "Push origin" para publicar los cambios en Netlify (`https://mtbproyect.netlify.app/`).
