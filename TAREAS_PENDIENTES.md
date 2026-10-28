# Tareas Pendientes — Radar Táctico MTB

Última actualización: 2026-10-28 por Antigravity.
Leer junto con: `AGENTS.md`, `ESTADO_ACTUAL.md`, `DECISIONES.md`, `PROTOCOLO_HANDOFF.md`.

> **Regla:** No mergear a main sin revisión del usuario. Crear rama por tarea. Documentar qué se cambió y qué NO se probó.

---

## 🔴 P0 — Bloqueantes para uso real

### T-001: Crear proyecto Firebase real y documentar
**Estado:** Sin hacer
**Qué:** La app tiene una config demo ficticia (`AIzaSyDemoMTBRadarKey2026`) que no conecta a ningún servidor. Sin un proyecto real, toda la sincronización en la nube es inerte.
**Cómo:**
1. El usuario debe ir a `console.firebase.google.com` y crear un proyecto gratuito.
2. Activar **Firestore Database** en modo prueba (test).
3. Copiar las claves web (apiKey, projectId, etc.).
4. Pegarlas en la app: pestaña Historial → botón ☁️ Nube → sección "Proyecto Firebase Propio" → campo de texto → 💾 Guardar Config.
**Quién:** El usuario (necesita cuenta Google). Una IA puede guiarlo paso a paso.
**Archivos:** No requiere cambios de código. Solo interacción del usuario con la app.

### T-002: Migrar almacenamiento de localStorage a IndexedDB
**Estado:** Sin hacer
**Qué:** `localStorage` tiene un límite de ~5-10 MB. Con muchas salidas con puntos GPS se llena y se pierden datos. IndexedDB soporta gigas.
**Cómo:**
1. Crear una capa de abstracción sobre IndexedDB (DB name: `radar_mtb_db`, stores: `actividades`, `configuracion`, `checkpoints`).
2. Migrar las funciones `guardarEnHistorial()`, `obtenerActividadesGuardadas()` para que lean/escriban en IndexedDB.
3. Al iniciar la app, migrar datos existentes de `localStorage` a IndexedDB automáticamente.
4. Mantener `localStorage` solo para config ligera (Firebase config, preferencias de usuario).
**Archivos:** `index.html` — sección JS de historial (buscar `mtb_actividades_guardadas`).
**Keys de localStorage actuales:** `mtb_actividades_guardadas`, `mtb_odometro_mantenimiento`, `mtb_segmentos_privados`, `mtb_bikefit_historial`, `mtb_firebase_config_custom`.
**Riesgo:** No romper la compatibilidad con datos existentes del usuario.

### T-003: Autoguardado periódico durante grabación GPS
**Estado:** Sin hacer
**Qué:** Si la app se cierra durante una salida larga (batería, crash, Android mata la PWA), se pierde toda la sesión.
**Cómo:**
1. Cada 2-3 minutos durante `recorridoActivo === true`, guardar un checkpoint en IndexedDB con el estado actual (`trackPuntosGrabados`, `distanciaTotal`, `desnivelPositivoTotal`, tiempo, etc.).
2. Al abrir la app, verificar si hay un checkpoint sin finalizar → ofrecer recuperar la sesión.
3. Al finalizar normalmente, borrar el checkpoint.
**Depende de:** T-002 (IndexedDB).
**Archivos:** `index.html` — funciones `iniciarRecorrido()`, `finalizarEntrenamiento()`, y el bloque de `watchPosition`.

### T-004: Probar todo en celular real
**Estado:** Sin hacer
**Qué:** Nada de lo implementado fue probado en un teléfono. Hay que verificar en `https://mtbproyect.netlify.app/`:
- GPS real (iniciar, pausar, finalizar)
- Backup JSON (exportar y restaurar)
- Reproductor/scrubber de ruta en mapa
- Diagnóstico de conexión Firestore
- Comportamiento offline (modo avión)
- Que no haya regresiones del merge de Codex
**Quién:** El usuario prueba, reporta bugs, una IA los corrige.

---

## 🟡 P1 — Importantes para seguridad y experiencia

### T-005: GPS en segundo plano (pantalla bloqueada)
**Estado:** Sin hacer. Decisión pendiente (D-009 en DECISIONES.md).
**Qué:** La PWA puede suspender `watchPosition` cuando se bloquea la pantalla. El audio keepalive es un workaround parcial.
**Opciones:**
- A) Wake Lock API (`navigator.wakeLock.request('screen')`) — evita que la pantalla se apague pero gasta batería.
- B) Capacitor/TWA — envolver la PWA en un contenedor nativo con servicio de foreground.
- C) Aceptar la limitación y documentarla.
**Archivos:** `index.html` — función `iniciarRecorrido()` y `detenerKeepAliveAudio()`.

### T-006: Reglas de seguridad de Firestore
**Estado:** Sin hacer
**Qué:** Ahora la base Firestore (cuando se cree) queda abierta: cualquiera con las credenciales puede leer/escribir. Hay que protegerla.
**Cómo:**
1. Activar Firebase Authentication (anónima o email).
2. Configurar reglas en Firestore que restrinjan lectura/escritura al `uid` del usuario autenticado.
3. Ajustar el JS para autenticar antes de leer/escribir.
**Archivos:** `index.html` — función `inicializarFirebase()`. También agregar el SDK de auth: `firebase-auth-compat.js`.

### T-007: Mapas offline
**Estado:** Sin hacer. Decisión pendiente (D-010 en DECISIONES.md).
**Qué:** Sin señal celular los tiles del mapa no cargan. El ciclista ve un mapa gris.
**Opciones:**
- A) Cache agresivo en `sw.js` — cachear los tiles que el usuario visitó.
- B) Descarga previa de zona (bounding box) en IndexedDB.
- C) Usar un paquete MBTiles offline con Leaflet plugin.
**Archivos:** `sw.js`, `index.html` (inicialización de Leaflet).

### T-008: Audios de entrenamiento faltantes
**Estado:** Sin hacer
**Qué:** Los archivos `zona_verde.mp3`, `zona_amarilla.mp3`, `zona_roja.mp3` están referenciados en el código pero no existen en el repositorio. Las alertas de voz de zonas de entrenamiento no suenan.
**Cómo:** Generar o conseguir los 3 archivos MP3 y agregarlos al repo. Alternativa: usar la Web Speech API (`speechSynthesis`) en lugar de archivos MP3.
**Archivos:** Crear `zona_verde.mp3`, `zona_amarilla.mp3`, `zona_roja.mp3` en la raíz. Actualizar `sw.js` para cachearlos.

### T-009: Escuadrón — autenticación y control
**Estado:** Sin hacer
**Qué:** La funcionalidad de grupo (compartir ubicación entre ciclistas) necesita identificación, expiración de sesiones y privacidad.
**Cómo:**
1. Cada ciclista se autentica (Firebase Auth).
2. Las sesiones de escuadrón tienen un código único y expiran después de X horas.
3. Las reglas de Firestore protegen la subcolección de coordenadas.
**Depende de:** T-001 (Firebase real), T-006 (auth).

---

## 🟢 P2 — Mejoras de calidad y UX

### T-010: Aplicar diseño visual de Claude
**Estado:** Pendiente de insumo del usuario (D-004 en DECISIONES.md).
**Qué:** El usuario expresó que le gusta un diseño elaborado por Claude pero aún no se aplicaron los colores/estilos. Hay bocetos PDF en el repo (`Radar Táctico MTB - Bocetos.pdf`).
**Acción:** El usuario debe confirmar qué colores, tipografía y layout quiere de esos bocetos. La IA que lo implemente debe respetar los 4 tabs y los IDs HTML existentes.

### T-011: Zonas de entrenamiento — barra unificada en tiempo real
**Estado:** A medias
**Qué:** El usuario pidió que las zonas Z1-Z5 se muestren en una barra visual única que se actualice en tiempo real durante CUALQUIER tipo de entrenamiento (no separadas por tipo). La barra ya existe en el HTML pero la lógica de actualización en tiempo real para todos los modos puede no estar completa.
**Archivos:** `index.html` — buscar `zona-entrenamiento`, `barra-zona`, `actualizarZonaEntrenamiento`.

### T-012: Scroll en selector de tipo de entrenamiento
**Estado:** Reportado por el usuario como bug
**Qué:** La lista de tipos de entrenamiento no se desplazaba y no dejaba ver los que quedaban abajo.
**Archivos:** `index.html` — el contenedor del selector de entrenamientos necesita `overflow-y: auto` y un `max-height`.

### T-013: HIIT — revisar zonas disponibles
**Estado:** Reportado por el usuario
**Qué:** En modo HIIT solo aparecen Z4 y Z5. El usuario preguntó si eso es correcto. HIIT por definición trabaja en alta intensidad (Z4-Z5) pero podría tener fases de recuperación en Z1-Z2. Evaluar y documentar la decisión.

### T-014: Compresión inteligente de puntos GPS
**Estado:** Sin hacer
**Qué:** Actualmente se filtran 1 de cada 3 puntos si superan 500 al subir a Firestore. Implementar algoritmo Douglas-Peucker para mantener la forma del recorrido con menos datos.
**Archivos:** `index.html` — función `sincronizarActividadConFirestore()`.

### T-015: Notificación visual al sincronizar
**Estado:** Sin hacer
**Qué:** Cuando una actividad se sube exitosamente a Firestore (especialmente al reconectar después de estar offline), mostrar un toast/snackbar en vez de solo loguearlo en consola.

### T-016: Exportar GPX desde el reproductor de ruta
**Estado:** Sin hacer
**Qué:** Poder descargar el GPX directamente mientras se mira el recorrido en el mapa con el scrubber, sin tener que volver al historial.
**Archivos:** `index.html` — widget `#widget-reproductor-ruta`.

### T-017: ClimbPro — validar con GPX conocido
**Estado:** Sin hacer
**Qué:** El cálculo de desnivel, pendiente y el perfil ClimbPro pueden tener imprecisiones. Validar con un track de subida larga conocida y comparar con Strava/Garmin.

---

## 🗒️ Notas técnicas para cualquier IA que retome

- **Repo:** `C:\Users\coni_\OneDrive\Desktop\juan\GitHub\proyectmtb` — branch `main`
- **Git no está en PATH del sistema.** Usar: `& "C:\Users\coni_\AppData\Local\GitHubDesktop\app-3.6.6\resources\app\git\cmd\git.exe" -C "ruta" comando`
- **Push:** No se puede hacer push desde terminal (falta auth). El usuario debe usar GitHub Desktop.
- **Node.js no instalado** — no hay `node --check` para validar JS.
- **`index.html` es una SPA monolítica** (~6800 líneas, HTML+CSS+JS todo junto).
- **Line endings:** mezcla CRLF/LF. Para editar con herramientas programáticas a veces hay que normalizar.
- **Firebase SDK:** v10.12.0 compat cargado por CDN.
- **Variables JS clave:** `db`, `firebaseInicializado`, `recorridoActivo`, `trackPuntosGrabados`, `gpsWatchId`, `ultimaPosicion`, `distanciaTotal`, `desnivelPositivoTotal`.
- **LocalStorage keys:** `mtb_actividades_guardadas`, `mtb_odometro_mantenimiento`, `mtb_segmentos_privados`, `mtb_bikefit_historial`, `mtb_firebase_config_custom`.
- **Idioma:** Español argentino (vos, pedaleás, subí, etc.).
- **Reglas de edición:** Leer `AGENTS.md` antes de tocar cualquier cosa. No pushear a main directo. No borrar IDs HTML existentes. No cambiar diseño visual sin aprobación.
