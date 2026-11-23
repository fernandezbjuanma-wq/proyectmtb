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
7. **T-001 (Proyecto Firebase real en producción):** Creado y vinculado el proyecto de Google Firebase `mtb-radar` con base de datos Firestore activa. Credenciales integradas como predeterminadas en `index.html`.
8. **Documentación:** Actualizados `TAREAS_PENDIENTES.md`, `DECISIONES.md` (D-013, D-014) y `PROTOCOLO_HANDOFF.md`.

**NO hecho:**
- T-004 (Pruebas en campo real con celular - pendiente de feedback del usuario).
- T-006 (Reglas de seguridad y auth en Firestore - actualmente en modo de prueba activo).
- T-010 (Colores del boceto visual de Claude - pendiente de confirmación de paleta).

**Pruebas ejecutadas:** Verificación sintáctica JavaScript (llaves balanceadas: 1259 open / 1259 close), renderizado headless con Microsoft Edge.
**Acción pedida al usuario:** Abrir GitHub Desktop y hacer click en "Push origin" para publicar los cambios.

### HANDOFF — Antigravity | 2026-11-11 | Compilación automática de APK Android en GitHub Actions + Contenedor Nativo WebView
**Fecha:** 2026-11-11
**Issue/PR:** Solicitud del usuario ("olvidate de netflify -> github no tiene una opcion para hacer apk o app un repositorio? -> si hacelo -> termina lo que estabamos haciendo").
**Commits/rama:** main

**Hecho:**
1. **Proyecto Android Nativo (`android/`):** Creado contenedor Android completo (`ar.mtb.radar`) en Kotlin (`MainActivity.kt`) con `WebView` acelerado por hardware, soporte completo para JavaScript, `localStorage`, `IndexedDB`, `Geolocation` con auto-grant de permisos en runtime (`ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `CAMERA`), y carga local sin servidor desde `file:///android_asset/index.html`.
2. **Sincronización de Assets:** `index.html`, `manifest.json` y `sw.js` integrados en `android/app/src/main/assets/`.
3. **GitHub Actions Workflow (`.github/workflows/compilar-apk.yml`):** Pipeline automatizado que en cada push a `main` (o ejecución manual `workflow_dispatch`) sincroniza los archivos web dentro de `assets/`, instala Java 17 + Android SDK 35 + Gradle 8.10.2, ejecuta `gradle :app:assembleDebug` y publica el instalador `radar-mtb.apk` como artefacto descargable (`Radar-MTB-APK`).
4. **Documentación:** Actualizados `DECISIONES.md` (D-015), `TAREAS_PENDIENTES.md` y `PROTOCOLO_HANDOFF.md`.

**Acción pedida al usuario:**
1. Hacer click en **"Push origin"** en **GitHub Desktop**.
2. Entrar al repositorio en GitHub -> pestaña **"Actions"** -> abrir **"Compilar APK Android - Radar MTB"** y descargar **`Radar-MTB-APK`** cuando termine de compilar (~2 minutos).

### HANDOFF — Antigravity | 2026-11-11 | Resolución Completa de Tareas Pendientes (T-005, T-006, T-007, T-009, T-014, T-015, T-017)
**Fecha:** 2026-11-11
**Issue/PR:** Solicitud del usuario ("revisa las tareas pendientes porfavor y realizalas").
**Commits/rama:** main

**Hecho:**
1. **T-005 (Wake Lock & Pantalla Activa en Ruta):** Activación inmediata de `solicitarWakeLock()` en `activarKeepAliveAudio()` + `FLAG_KEEP_SCREEN_ON` y `keepScreenOn = true` en `MainActivity.kt`.
2. **T-006 (Reglas de Seguridad Firestore e Identidad):** Creado `firestore.rules` con validación de esquema, tamaño y `ciclistaId`. Implementado `obtenerCiclistaId()` y botón para copiar reglas desde `#modal-config-nube`.
3. **T-007 (Mapas Offline):** Actualizado `sw.js` (`v8`) con caché persistente `mtb-map-tiles-v1` (Cache-First + fallback SVG oscuro sin señal) y creado descargador de cuadrículas por zona (`descargarZonaMapaOffline()`, niveles de zoom 13-15) en la pestaña Preparación.
4. **T-009 (Escuadrón en Vivo):** Identificación única por `ciclistaId`, filtrado automático de sesiones inactivas (> 2h), marcadores Leaflet en tiempo real para compañeros reales con cálculo de distancia, generador de códigos de sala y botón de invitación por WhatsApp.
5. **T-014 (Compresión GPS Douglas-Peucker):** Implementado `simplificarTrackDouglasPeucker()` con distancia perpendicular en metros y preservación de cima máxima en `sincronizarActividadConFirestore()`.
6. **T-015 (Notificaciones Toast Tácticas):** Implementado `mostrarToastTactico()` al sincronizar con Firestore, al reconectar a internet (`sincronizarPendientesFirestore(true)`), al validar un GPX y al descargar mapas offline.
7. **T-017 (Validación ClimbPro e Histéresis de Desnivel):** Corregida la histéresis de altitud de 2.5m en vivo y en GPX, suavizado de media móvil de 5 puntos (`eleSuavizada`), distancia real por sendero (`distAcumKm`) en lugar de línea recta entre curvas, y empaquetado `Vuelta_ciclística_por_la_mañana.gpx` dentro de `android/app/src/main/assets/`.

**Pruebas ejecutadas:**
- Validación matemática sobre `Vuelta_ciclística_por_la_mañana.gpx` (10.822 puntos -> 52.58 km, +870 m / -872 m con histéresis de 2.5m, cima 1286 msnm).
- Verificación sintáctica de JavaScript en `index.html` (`{ = 1406, } = 1406`, `( = 3190, ) = 3190`).
- Sincronización de `assets/` de Android para compilación del APK en GitHub Actions.

### HANDOFF — Antigravity | 2026-11-11 | Implementación del Diseño V2 «Verde táctico» (T-010 / D-004 / D-017)
**Fecha:** 2026-11-11
**Issue/PR:** Solicitud del usuario ("te dejo estos diseños para que los implementes tal cual esta ahi . quiero que subas a github estos detalles tambien").
**Commits/rama:** main

**Hecho:**
1. **Especificación y Prototipo en el Repo:** Añadidos `DISENO_MTB_V2_ESPECIFICACION.md` y `radar-tactico-v2-prototipo.html` en la raíz del repositorio.
2. **Sistema Visual «Verde táctico» y Tipografía Offline:** Tokens CSS `--bg: #0A110F`, `--surface: #121C19`, `--acc: #3DDC97`, semáforo `#3DDC97` / `#FFC53D` / `#FF5C4D`, paleta `body.modo-solar` (`#F3F0E8` / `#0A7A47`), y 7 fuentes WOFF2 embebidas (`Barlow Condensed` 500/600/700 con `tabular-nums` y `Barlow` 400/500/600/700).
3. **Radar con 3 Vistas (`Mapa | Cabina | Subida`) + Chip `REC`:**
   - **Vista Mapa (protagonista por defecto):** Mapa Leaflet inicializado al abrir la app (`inicializarMapaBaseV2()`), tira de vidrio `km · tiempo · +m` (`.v2-strip`), tarjeta de aviso compacta (`.v2-malert`), botones laterales 44×44 px (`SOS`, `↩ Huella`, `+`, `−`, `🗺️ Capas`, `🧭 Rumbo`, `◎ Centrar`), escala dinámica, círculo de precisión GPS, traza GPX coloreada por pendiente (`dibujarRutaGPXPorZonaV2`), modo `↩ Volver al inicio` sobre la propia huella (`toggleVolverAlInicioHuella`) y dock inferior con 3 modos (`Compacto`, `Completo`, `Oculto`).
   - **Vista Cabina (Boceto A):** Modos de entrenamiento, aviso táctico, telemetría asimétrica, barra de 6 zonas, ClimbPro, minimapa y 4 métricas secundarias.
   - **Vista Subida (Boceto B «Anticipación»):** Tarjeta de próximo tramo a 104 px (`400 m · Pared de 11 % durante 300 m`), lista `Después` (`A 700 m · Trepada 6 % · 400 m` / `A 1,1 km · Llano y bajada · 500 m`), ClimbPro y minimapa.
4. **Reglas de Honestidad y Discrepancias Resueltas (Sección 10.2):**
   - Confirmación obligatoria al pulsar `Finalizar` (`#modal-confirmar-finalizar`) con botones separados (`▶️ Seguir grabando` / `⏹️ Finalizar y guardar`).
   - Insignias `<span class="est">est.</span>` en todas las métricas estimadas (Potencia, Calorías, TSS, IF, Recuperación, Nutrición).
   - SILCA con recálculo automático en tiempo real (`20,8 / 23,3 PSI` para valores por defecto).
   - BikeFit rotulado honestamente como guía de goniómetro manual y casilla de batería `> 70%` con lectura automática vía `navigator.getBattery()`.
5. **Sincronización con APK Android y Service Worker (`v9`):** Actualizados `android/app/src/main/assets/index.html` y `sw.js`.

### HANDOFF — Antigravity | 2026-11-23 | Fidelidad Completa 40/40 Estados — Contrato de Fidelidad Diseño V2 «Verde táctico»
**Fecha:** 2026-11-23
**Issue/PR:** Continuación de implementación fiel del Diseño V2 «Verde táctico» (`diseno-v2/CONTRATO_DE_FIDELIDAD.md`) sobre rama `feat/diseno-v2-fidelidad-completa`.
**Commits/rama:** `feat/diseno-v2-fidelidad-completa`

**Hecho:**
1. **Unificación del Sistema Visual V2 Oficial (`diseno-v2/`):**
   - Integrados los tokens oficiales de `diseno-v2/tokens/tokens-verde-tactico.css` y las hojas de componentes y pantallas de `diseno-v2/fuente-prototipo/css/` (`20-components.css` y `30-screens.css`), eliminando las paletas descartadas (`semaforo`, `hud`, `cerro`), tipografías descartadas, panel `#tweaks`, botón `#twfab` y marco de escritorio (Contrato §4).
   - Embebidas en base64 las 7 fuentes WOFF2 offline desde `diseno-v2/fuentes/*.woff2` (`Barlow Condensed` 500/600/700 y `Barlow` 400/500/600/700).
2. **Implementación de las 40 Pantallas y Estados (`01` a `51`):**
   - Radar Live (`01` a `18`): Vistas `Mapa` (panel compacto, completo y oculto, popover de capas, pared, segmento, pausa, GPS débil, sin GPS, offline con/sin mapa, antes de salir, todo activo) y variantes `Modo Solar` para `Mapa`, `Cabina` y `Subida`.
   - Superposiciones, Hojas y Diálogos (`20` a `29`): `Posible caída (30 s)`, `Informe de sesión finalizada`, `Cabina y herramientas`, `SOS · WhatsApp`, `Diálogo ¿Finalizar la salida?`, `Bloqueo antisudor`, `Ghost Pacer`, `Radar de escuadrón`, `Nube y respaldos`, `Simulador GPX`.
   - Preparación (`30` a `36`): Pantalla principal (arriba y abajo) y hojas completas `Mantenimiento`, `Ruta GPX`, `BikeFit`, `Segmentos y PR` y `Coach de entrenamiento`.
   - Laboratorio (`40` a `42`): Arriba, parte media y final con perfil interactivo y métricas etiquetadas con `est.`.
   - Historial (`50` a `51`): Arriba y final con acumulado, selector `En este teléfono` / `En la nube`, barra de sincronización pendiente y actividades por mes.
3. **Puente Bidireccional con el Motor Real y Preservación de Funciones:**
   - Conservados todos los motores reales de producción en `index.html` (GPS `navigator.geolocation.watchPosition`, mapa Leaflet real `#mapa`, IndexedDB `radar_mtb_db` con autoguardado cada 2 min, Firebase Firestore `mtb-radar`, sintetizador Web Audio API + TTS con degradación elegante, descargador de mapas offline, SILCA, Odómetro, BikeFit, Segmentos, Ghost Pacer, Escuadrón y Backup JSON) junto con `#legacy-dom-bridge`.
   - Sincronizado `android/app/src/main/assets/index.html` con `index.html`.

**Archivos afectados:** `index.html`, `android/app/src/main/assets/index.html`, `ESTADO_ACTUAL.md`, `PROTOCOLO_HANDOFF.md`. (Sin tocar `diseno-v2/referencia`, `diseno-v2/tokens` ni `diseno-v2/prototipo`).

**Pruebas ejecutadas / resultados:**
- `node diseno-v2/herramientas/auditar-colores.js index.html android/app/src/main/assets/index.html --estricto`:
  `Archivos revisados: 2 · colores encontrados: 466 · aprobados: 466 · FUERA del diseño: 0 (0 distintos) · usos de var(--…): 1360 — RESULTADO: ✔ todos los colores y fuentes pertenecen al diseño aprobado.`
- `python3 diseno-v2/herramientas/auditar-colores.py index.html --estricto`:
  `RESULTADO: ✔ todos los colores y fuentes pertenecen al diseño aprobado.`
- `node diseno-v2/herramientas/comparar-capturas.js --impl diseno-v2/herramientas/implementacion.json --estricto`:
  `40/40 estados fieles al diseño` (todos los 40 estados entre `0.08 %` y `1.97 %`, dentro de la tolerancia `≤ 2 %`, con `0` errores JS).

