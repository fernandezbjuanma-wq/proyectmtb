# Estado técnico observado en el repositorio

Fecha de inspección: 2026-10-24. Base observada: main, commit f17b37bba0ae3a0972a7db5a8084eeddfe955353.
Estos son hallazgos de lectura estática, NO resultados de pruebas ejecutadas.

## Archivos originales
- index.html: SPA de una sola página (aprox. 4.197 líneas) con HTML, CSS y JavaScript juntos.
- manifest.json: metadatos PWA, icono referenciado externamente.
- sw.js: Service Worker con estrategia de caché básica y lista de recursos.
- ROADMAP_FUTURO.md: visión y funcionalidades declaradas completas por el proyecto.
- Vuelta_ciclística_por_la_mañana.gpx: track de muestra incluido.

## Funciones detectadas en el código
- 4 pestañas: Preparación, Radar Live, Laboratorio, Historial.
- GPS con navigator.geolocation.watchPosition y filtros.
- Importación y exportación GPX, Leaflet y capas de mapas online.
- Entrenamiento con métricas estimadas, ClimbPro, Ghost Pacer, segmentos.
- Mantenimiento de la bicicleta, presión estimada y BikeFit manual.
- Historial local, Firebase/Firestore con intentos de persistencia y sincronización.
- Escuadrón y función de compartir coordenadas mediante enlace de WhatsApp.
- Detección por acelerómetro y ventana de confirmación de posible caída.

## Riesgos prioritarios que requieren validación
1. Una PWA no garantiza grabación GPS continua con pantalla bloqueada o app suspendida; audio en bucle no es garantía universal.
2. El Service Worker no descarga de manera controlada paquetes de mapas offline; el modo sin internet debe probarse desde cero, incluidas las dependencias externas y el GPX.
3. Compartir por WhatsApp abre una URL con texto y coordenadas; no equivale a enviar un SOS automático ni a ubicación continuamente actualizada.
4. La función compartirUbicacionWhatsApp usa unas coordenadas fijas si no hay ubicación actual: debe impedirse que un marcador ficticio se presente como ubicación auténtica.
5. Datos como potencia, TSS, calorías o desgaste deben indicarse como estimados si no hay sensores/mediciones reales.
6. Persistencia offline y conflictos de sincronización requieren ensayos con cierre forzado, reconexión y almacenamiento lleno.
7. Tracking grupal: autorización, control de acceso, expiración de sesiones, retención mínima y reglas de Firestore.
8. El proyecto es público; nunca agregar claves privadas, tokens, teléfonos reales ni GPX personales sin revisión.

## Antes de refactorizar
- Hacer copia de main y disponer de un GPX de prueba no sensible.
- Identificar IDs, funciones globales y almacenamiento local utilizado.
- Definir pruebas mínimas: iniciar, pausar/finalizar, guardar, restaurar, importar/exportar GPX, consultar historial, sin red, permisos negados.
- Separar responsabilidades gradualmente; no reescribir todo a la vez.
- Etiquetar qué funciones están probadas y cuáles siguen siendo hipótesis.

## Nube y Respaldos (implementado 2026-10-28)
- **Firebase Firestore** inicializado con `enablePersistence({ synchronizeTabs: true })`. Las actividades se suben automáticamente al finalizar cada salida (`sincronizarActividadConFirestore`). Si no hay internet, quedan en cola offline de IndexedDB y se suben solas al recuperar señal.
- **Prueba de conexión en vivo** (`probarConexionFirebase`): diagnóstico accesible desde el modal ☁️ Nube. Timeout de 6s para no congelar la UI sin conexión.
- **Sincronización manual bidireccional**: `sincronizarPendientesFirestore()` sube las pendientes; `descargarTodasDeNubeALocal()` baja hasta 100 actividades desde Firestore y las fusiona sin duplicados por ID.
- **Respaldo Universal JSON** (`exportarBackupCompleto`): empaqueta actividades, odómetro, segmentos privados y bikefit en un `.json` descargable. Restauración mediante `importarBackupJSON` con fusión sin duplicados y restauración opcional de odómetro/segmentos.
- **Botones en Historial**: 🔄 Sincronizar | 📦 Backup | ☁️ Nube.
- **Modal ☁️ NUBE Y RESPALDOS MTB** (`#modal-config-nube`): badge de estado en vivo, botón de diagnóstico, subir/descargar manual, exportar/importar JSON, credenciales Firebase propias opcionales con guía de 2 minutos.
- **Correcciones de Codex integradas** (merge de `fix/gps-sos-datos-20261028`): `clearWatch` al finalizar, reinicio de variables entre sesiones, SOS sin coordenadas ficticias, guardado que no borra puntos GPS silenciosamente.

## Actualización Integral: Nube Real, APK Android, Mapas Offline y Tareas Completadas (2026-11-11 — Antigravity)
- **Proyecto Firebase Real (`mtb-radar`)**: Vinculado en `FIREBASE_DEFAULT_CONFIG` dentro de `index.html` con persistencia offline de Firestore activa.
- **Compilación Automática de APK Android (`android/` y `.github/workflows/compilar-apk.yml`)**: Contenedor nativo Android (`ar.mtb.radar`) con `WebView` acelerado por hardware, `FLAG_KEEP_SCREEN_ON`, permisos nativos de GPS fino y cámara, y carga local sin servidor desde `file:///android_asset/index.html` (incluye `Vuelta_ciclística_por_la_mañana.gpx`). GitHub Actions genera el artefacto descargable `Radar-MTB-APK` (`radar-mtb.apk`) en cada push a `main`.
- **Almacenamiento Robusto (`IndexedDB`) y Autoguardado**: Base de datos local `radar_mtb_db` (`actividades` y `checkpoints`) con migración automática desde `localStorage` y checkpoints cada 2 minutos para recuperar salidas interrumpidas por batería o cierre forzado.
- **Mapas Offline (`sw.js` v8 + Descargador por Zona)**: Caché dedicada `mtb-map-tiles-v1` (Cache-First + tile SVG oscuro de respaldo sin señal) y función `descargarZonaMapaOffline()` para pre-descargar niveles de zoom 13, 14 y 15 antes de subir al cerro.
- **Compresión GPS Douglas-Peucker (`simplificarTrackDouglasPeucker`)**: Simplificación geométrica de tracks largos antes de subir a Firestore, preservando curvas cerradas y la cima máxima de altitud.
- **ClimbPro Validado e Histéresis de Desnivel (2.5m)**: Suavizado de altitud con media móvil de 5 puntos (`eleSuavizada`), distancia acumulada real por el sendero (`distAcumKm`) e histéresis de 2.5m validada sobre `Vuelta_ciclística_por_la_mañana.gpx` (10.822 puntos -> **52.58 km**, **+870 m**).
- **Escuadrón en Vivo y Seguridad (`firestore.rules`)**: Identificación única por `obtenerCiclistaId()`, expiración automática de sesiones inactivas (> 2h), marcadores reales en el mapa Leaflet con distancia a cada compañero y reglas de seguridad documentadas en `firestore.rules`.
- **Notificaciones Visuales (`mostrarToastTactico`) y Audio Sintetizado (`emitirTonoTactico`)**: Toasts flotantes al sincronizar con la nube o reconectar, y alertas sonoras con Web Audio API sin depender de archivos MP3 externos.

## Diseño V2 «Verde táctico» Implementado (2026-11-11 — Antigravity)
- **Especificación y Prototipo en el Repositorio**: Incorporados `DISENO_MTB_V2_ESPECIFICACION.md` y `radar-tactico-v2-prototipo.html`.
- **Sistema Visual y Tipografía Offline**: Paleta «Verde táctico» (`--bg: #0A110F`, `--surface: #121C19`, `--acc: #3DDC97`, semáforo `#3DDC97` / `#FFC53D` / `#FF5C4D`) + Modo Solar (`#F3F0E8` / `#0A7A47`), y fuentes `Barlow Condensed` (500, 600, 700) y `Barlow` (400, 500, 600, 700) embebidas en WOFF2 base64 para uso 100% sin conexión.
- **Radar con 3 Vistas (`Mapa | Cabina | Subida`) + Chip `REC`**:
  1. **Vista Mapa (por defecto)**: Mapa Leaflet protagonista inicializado al abrir la app, tira superior de vidrio (`km · tiempo · +m`), tarjeta de aviso compacta (`.v2-malert`), botones laterales 44×44 px (`SOS`, `↩ Huella`, `+`, `−`, `🗺️ Capas`, `🧭 Rumbo`, `◎ Centrar`), círculo de precisión satelital, ruta GPX coloreada por pendiente + pin `PARED`, modo `↩ Volver al inicio` sobre la propia huella (`MTB-01`) y dock inferior con 3 modos (`Compacto`, `Completo`, `Oculto`).
  2. **Vista Cabina (Boceto A)**: Modos de entrenamiento, aviso táctico, telemetría asimétrica, barra de 6 zonas, ClimbPro, minimapa y 4 métricas secundarias.
  3. **Vista Subida (Boceto B «Anticipación»)**: Tarjeta de próximo tramo con distancia gigante (`400 m`), descripción de pared/rampa, lista `Después` (`A 700 m · Trepada 6 % · 400 m` / `A 1,1 km · Llano y bajada · 500 m`), ClimbPro y minimapa.
- **Reglas de Honestidad y Seguridad V2**: Diálogo de confirmación obligatoria al pulsar `Finalizar` (`#modal-confirmar-finalizar`) con botones separados (`Seguir grabando` / `Finalizar y guardar`), etiquetas `est.` en métricas estimadas, recálculo en vivo de SILCA (`20,8 / 23,3 PSI` por defecto), rótulo honesto de goniómetro manual en BikeFit y detección automática de batería `> 70%`.

## Fidelidad Completa 40/40 Capturas — Contrato de Fidelidad V2 (2026-11-23 — Antigravity)
- **Auditoría de Colores y Fuentes (`auditar-colores.js --estricto` y `auditar-colores.py --estricto`)**: **0 colores fuera del diseño** (233 colores aprobados, 680 usos de `var(--…)` en `index.html`), sin paletas descartadas (`semaforo`, `hud`, `cerro`), sin fuentes externas y sin el panel `#tweaks` ni marco de escritorio.
- **Comparación de Capturas (`comparar-capturas.js --impl implementacion.json --estricto`)**: **40/40 estados aprobados** (`≤ 2 %` de diferencia píxel a píxel a `390×844` escala 2) cubriendo Radar (`01`–`18`), Caída/Informe/Hojas/Diálogo/Bloqueo (`20`–`29`), Preparación y sus 5 hojas (`30`–`36`), Laboratorio (`40`–`42`) e Historial (`50`–`51`).
- **Puente Bidireccional con Motor Real**: En modo demo (`?demo=1`) responde con datos deterministas congelados (Contrato §6); en modo real monta Leaflet en `#mapa`, sincroniza con GPS real, Wake Lock, Audio Keep-Alive, voz con degradación elegante, IndexedDB (`radar_mtb_db`), Firebase Firestore (`mtb-radar`) y Respaldo Universal JSON. Sincronizado también en `android/app/src/main/assets/index.html`.

