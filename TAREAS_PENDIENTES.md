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
**Estado:** ✅ COMPLETADA (2026-11-05 por Antigravity)
**Qué:** Se implementó `radar_mtb_db` con ObjectStores `actividades` y `checkpoints`.
**Detalle:** Funciones `abrirIndexedDB()`, `migrarLocalStorageAIndexedDB()`, `guardarActividadEnIDB()`, `obtenerActividadesDesdeIDB()`, `eliminarActividadDeIDB()`. Se ejecuta migración automática al cargar la página sin duplicados y se respalda cada sesión en IndexedDB independientemente del cupo de localStorage.

### T-003: Autoguardado periódico durante grabación GPS
**Estado:** ✅ COMPLETADA (2026-11-05 por Antigravity)
**Qué:** Checkpoints automáticos cada 2 minutos en IndexedDB (`sesion_activa`).
**Detalle:** Al iniciar o pausar la sesión se activa `iniciarAutoGuardado()`. Si la app se cierra inesperadamente por batería o el sistema operativo, al reabrir la app `verificarCheckpointPendiente()` detecta la sesión interrumpida y ofrece restaurarla y guardarla en el historial con todos sus puntos GPS y métricas intactas. Al finalizar normalmente se limpia el checkpoint.

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
**Estado:** ✅ COMPLETADA (2026-11-05 por Antigravity)
**Qué:** Se eliminó la dependencia de archivos MP3 externos faltantes.
**Detalle:** Se implementó `emitirTonoTactico()` con la Web Audio API nativa (Do5 en verde, Mi5 doble tono en amarillo, La5 triple tono urgente en rojo/pared). Además, `notificarEntrenador` ahora intenta `speechSynthesis` siempre (incluso offline, ya que Android dispone de los motores de voz TTS locales del sistema).

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
**Estado:** ✅ VERIFICADA (2026-11-05 por Antigravity)
**Qué:** La barra de 6 zonas opera en tiempo real en todos los modos (Libre, Fondo, HIIT, Escalada, Umbral, Regenerativo) con cursor dinámico y feedback de objetivo.

### T-012: Scroll en selector de tipo de entrenamiento
**Estado:** ✅ COMPLETADA (2026-11-05 por Antigravity)
**Qué:** Se optimizó `.selector-modo-scroll` con `touch-action: pan-x`, desplazamiento suave y flechas táctiles para navegación sin trabas en teléfonos.

### T-013: HIIT — revisar zonas disponibles
**Estado:** ✅ COMPLETADA (2026-11-05 por Antigravity)
**Qué:** Se incorporó `Z3 Tempo` a las opciones de ataque de intervalos (ahora disponibles Z3, Z4, Z5 y Z6+) y se sincronizó el objetivo en vivo para evaluar la zona elegida por el ciclista.

### T-014: Compresión inteligente de puntos GPS
**Estado:** Sin hacer
**Qué:** Actualmente se filtran 1 de cada 3 puntos si superan 500 al subir a Firestore. Implementar algoritmo Douglas-Peucker para mantener la forma del recorrido con menos datos.
**Archivos:** `index.html` — función `sincronizarActividadConFirestore()`.

### T-015: Notificación visual al sincronizar
**Estado:** Sin hacer
**Qué:** Cuando una actividad se sube exitosamente a Firestore (especialmente al reconectar después de estar offline), mostrar un toast/snackbar en vez de solo loguearlo en consola.

### T-016: Exportar GPX desde el reproductor de ruta
**Estado:** ✅ COMPLETADA (2026-11-05 por Antigravity)
**Qué:** Se agregó el botón `📥 GPX` directamente en los controles de `#widget-reproductor-ruta` junto con la función `descargarGPXDesdeScrubber()`. Permite descargar el track completo mientras se explora en el mapa.

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
