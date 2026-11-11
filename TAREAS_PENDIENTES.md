# Tareas Pendientes — Radar Táctico MTB

Última actualización: 2026-11-11 por Antigravity.
Leer junto con: `AGENTS.md`, `ESTADO_ACTUAL.md`, `DECISIONES.md`, `PROTOCOLO_HANDOFF.md`.

> **Regla:** No mergear a main sin revisión del usuario. Crear rama por tarea. Documentar qué se cambió y qué NO se probó.

---

## 🔴 P0 — Bloqueantes para uso real

### T-001: Crear proyecto Firebase real y documentar
**Estado:** ✅ COMPLETADA (2026-11-05 por Juan y Antigravity)
**Qué:** Proyecto de Google Firebase `mtb-radar` creado, base de datos Firestore habilitada e integrado como configuración predeterminada en `index.html`.
**Detalle:** `FIREBASE_DEFAULT_CONFIG` apunta al proyecto real de producción `mtb-radar` con persistencia offline activa.

### T-002: Migrar almacenamiento de localStorage a IndexedDB
**Estado:** ✅ COMPLETADA (2026-11-05 por Antigravity)
**Qué:** Se implementó `radar_mtb_db` con ObjectStores `actividades` y `checkpoints`.
**Detalle:** Funciones `abrirIndexedDB()`, `migrarLocalStorageAIndexedDB()`, `guardarActividadEnIDB()`, `obtenerActividadesDesdeIDB()`, `eliminarActividadDeIDB()`.

### T-003: Autoguardado periódico durante grabación GPS
**Estado:** ✅ COMPLETADA (2026-11-05 por Antigravity)
**Qué:** Checkpoints automáticos cada 2 minutos en IndexedDB (`sesion_activa`).
**Detalle:** `iniciarAutoGuardado()`, `guardarCheckpointSesion()`, `verificarCheckpointPendiente()` y `limpiarCheckpoint()`.

### T-004: Probar todo en celular real (vía APK Android desde GitHub Actions)
**Estado:** ⏳ Lista para prueba en campo por el usuario
**Qué:** Se configuró la compilación automática de `radar-mtb.apk` en GitHub Actions (`.github/workflows/compilar-apk.yml`). El usuario puede descargar e instalar el APK en su teléfono para verificar en salida real:
- GPS real (iniciar, pausar, finalizar) y pantalla encendida (`FLAG_KEEP_SCREEN_ON` + Wake Lock)
- Sincronización en tiempo real con Firebase `mtb-radar` y toasts visuales
- Mapas Offline descargados antes de subir al cerro
- Reproductor/scrubber de ruta en mapa y exportación GPX

---

## 🟡 P1 — Importantes para seguridad y experiencia

### T-005: GPS en segundo plano y pantalla activa (D-009 y D-015)
**Estado:** ✅ COMPLETADA (2026-11-11 por Antigravity)
**Qué:** Doble protección implementada:
1. En `index.html`: `solicitarWakeLock()` (`navigator.wakeLock.request('screen')`) se activa automáticamente al iniciar el recorrido dentro de `activarKeepAliveAudio()` y se renueva en `visibilitychange`.
2. En `android/app/src/main/java/ar/mtb/radar/MainActivity.kt`: `WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON` y `webView.keepScreenOn = true` mantienen el GPS y la pantalla activos en el contenedor nativo Android.

### T-006: Reglas de seguridad de Firestore e Identidad de Ciclista
**Estado:** ✅ COMPLETADA (2026-11-11 por Antigravity)
**Qué:**
1. Creado el archivo `firestore.rules` en la raíz del repositorio con reglas de validación de esquema, límites de tamaño, protección por `ciclistaId` y control de salas de escuadrón.
2. Implementado `obtenerCiclistaId()` en `index.html` que genera y persiste un ID único por dispositivo (`mtb_ciclista_id`), adjuntándolo en cada subida a Firestore (`actividades_mtb` y `escuadron_salas`).
3. Añadido botón `🔒 Copiar Reglas Firestore` en `#modal-config-nube`.

### T-007: Mapas offline (Service Worker + Descargador de Zona por Bounding Box)
**Estado:** ✅ COMPLETADA (2026-11-11 por Antigravity)
**Qué:**
1. Actualizado `sw.js` (`v8`) con caché dedicada persistente `mtb-map-tiles-v1` (Cache-First para tiles de OpenStreetMap, Esri, OpenTopoMap y Carto, más tile SVG oscuro de respaldo cuando no hay señal).
2. Implementado `descargarZonaMapaOffline()` y `contarTilesOfflineGuardados()` en `index.html` con botón `📥 Descargar Mapa Offline de la Zona Visible` en la pestaña Preparación (descarga niveles de zoom 13, 14 y 15 del área visible o del track GPX cargado).

### T-008: Audios de entrenamiento faltantes
**Estado:** ✅ COMPLETADA (2026-11-05 por Antigravity)
**Qué:** Implementado sintetizador `emitirTonoTactico()` con Web Audio API + Web Speech API offline/online.

### T-009: Escuadrón — identificación, control de sala, expiración y marcadores en mapa
**Estado:** ✅ COMPLETADA (2026-11-11 por Antigravity)
**Qué:**
1. Identificación única de cada miembro por `obtenerCiclistaId()` para evitar colisiones de nombres en Firestore.
2. Expiración automática de sesiones inactivas (`ESCUADRON_EXPIRACION_MS = 2 horas`) y marca `expiraEn`.
3. Renderizado en tiempo real de marcadores Leaflet en el mapa (`escuadronMarcadores`) para compañeros reales conectados, mostrando velocidad y distancia en metros/km respecto al usuario.
4. Botones `🎲 Código` (`generarCodigoSalaEscuadron()`) y `📲 Invitar` por WhatsApp (`compartirSalaEscuadronWhatsApp()`).

---

## 🟢 P2 — Mejoras de calidad y UX

### T-010: Aplicar diseño visual de Claude (Diseño V2 «Verde táctico»)
**Estado:** ✅ COMPLETADA (2026-11-11 por Antigravity)
**Qué:** Implementada en `index.html` y en el APK (`android/app/src/main/assets/index.html`) la especificación completa `DISENO_MTB_V2_ESPECIFICACION.md` junto con el prototipo de referencia `radar-tactico-v2-prototipo.html`:
1. Paleta «Verde táctico» (`--bg: #0A110F`, `--acc: #3DDC97`, semáforo `#3DDC97` / `#FFC53D` / `#FF5C4D`) y paleta Solar de alto contraste (`#F3F0E8` / `#0A7A47`).
2. Fuentes offline embebidas en WOFF2 (`Barlow Condensed` 500/600/700 con `tabular-nums` y `Barlow` 400/500/600/700).
3. Radar con 3 vistas (`Mapa` protagonista por defecto con tira `km · tiempo · +m`, alerta compacta, botones de vidrio 44×44px y dock `Compacto | Completo | Oculto`; `Cabina` Boceto A; `Subida` Boceto B con tarjeta de anticipación a 104px y lista `Después`).
4. Traza GPX coloreada por zona de terreno, círculo de precisión satelital y modo `↩ Volver al inicio` sobre la propia huella (`MTB-01`).
5. Diálogo de confirmación obligatoria al pulsar `Finalizar` con botones separados (`Seguir grabando` / `Finalizar y guardar`), insignias `est.` en métricas estimadas, recálculo automático en SILCA y detección automática de batería `> 70%`.

### T-011: Zonas de entrenamiento — barra unificada en tiempo real
**Estado:** ✅ COMPLETADA (2026-11-05 por Antigravity)

### T-012: Scroll en selector de tipo de entrenamiento
**Estado:** ✅ COMPLETADA (2026-11-05 por Antigravity)

### T-013: HIIT — revisar zonas disponibles
**Estado:** ✅ COMPLETADA (2026-11-05 por Antigravity)

### T-014: Compresión inteligente de puntos GPS (Douglas-Peucker)
**Estado:** ✅ COMPLETADA (2026-11-11 por Antigravity)
**Qué:** Implementado el algoritmo geométrico Ramer-Douglas-Peucker (`simplificarTrackDouglasPeucker` y `distanciaPerpendicularMetros`) en `sincronizarActividadConFirestore()`. Conserva curvas cerradas (caracoles), punto inicial, final y cima máxima de altitud reduciendo el peso del documento en Firestore sin perder la forma real del sendero.

### T-015: Notificación visual al sincronizar (Toast Táctico)
**Estado:** ✅ COMPLETADA (2026-11-11 por Antigravity)
**Qué:** Implementado `mostrarToastTactico()` con notificaciones flotantes al sincronizar una actividad con Firestore, al reconectar a internet y subir pendientes automáticamente (`sincronizarPendientesFirestore(true)`), al validar un GPX y al descargar mapas offline.

### T-016: Exportar GPX desde el reproductor de ruta
**Estado:** ✅ COMPLETADA (2026-11-05 por Antigravity)

### T-017: ClimbPro — validar con GPX conocido (`Vuelta_ciclística_por_la_mañana.gpx`)
**Estado:** ✅ COMPLETADA (2026-11-11 por Antigravity)
**Qué:**
1. Corregida la histéresis de desnivel en grabación GPS (`actualizarPosicion`) y en análisis GPX (`inicializarDatosGPX`) con umbral de 2.5m (estándar Strava/Garmin). Validado sobre `Vuelta_ciclística_por_la_mañana.gpx` (10.822 puntos, **52.58 km**, **+870 m** de desnivel positivo, cima **1286 msnm**).
2. Suavizado de altitud por media móvil de 5 puntos (`eleSuavizada`) y cálculo de distancia acumulada real por el sendero (`distAcumKm`) en lugar de línea recta a través de curvas en U.
3. Añadido resumen de validación ClimbPro (`#gpx-climbpro-resumen`) en Preparación y empaquetado el archivo GPX dentro de `android/app/src/main/assets/` para uso offline en el APK.
