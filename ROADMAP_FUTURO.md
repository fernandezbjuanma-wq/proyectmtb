# 🚵‍♂️ RADAR TÁCTICO MTB - ROADMAP DEFINITIVO (VISIÓN + ARQUITECTURA)
**Documento Central para el Agente de Desarrollo (Antigravity)**

**Estado del Proyecto:** 🏆 100% COMPLETADO | TODAS LAS PRIORIDADES (1, 2, 3 Y 4) TOTALMENTE OPERATIVAS

---

## 🔴 PRIORIDAD 1: CIMIENTOS Y CORE TÁCTICO (100% COMPLETADA)

### 1. Arquitectura UI/UX y Diseño Visual ✅
*   **La Idea (Visión):** Navegación fluida estilo Strava con 4 pestañas fijas en la base (Preparación, Radar Live, Laboratorio, Historial). Diseño en "Modo Oscuro Premium" inspirado en la naturaleza (cielo nocturno, agua y bosque).
*   **Implementación Técnica:** SPA (Single Page Application) usando Bottom Navigation Bar. CSS Grid/Flexbox puro. Paleta: Fondo `#1a1a24`, Tarjetas `#2d3748`, Acentos/Navegación `#20c997`, y Botones `#1e5631` y `#d4af37`.
*   **Estado:** **COMPLETADO.** 4 pestañas operativas y barra fija con cambio instantáneo.

### 2. Blindaje de GPS y Background Keep-Alive ✅
*   **La Idea (Visión):** La app no debe apagarse ni dejar de grabar al bloquear la pantalla en el bolsillo. Debe filtrar "saltos fantasmas" si se pierde señal bajo los árboles en el cerro.
*   **Implementación Técnica:** Usar `AudioContext` inaudible para evitar la suspensión del hilo JS. Filtrar `geolocation.watchPosition` descartando `accuracy > 25m`, aceleraciones irreales (> 15 m/s²), y pausando el odómetro a `< 1.2 km/h`.
*   **Estado:** **COMPLETADO.** Con filtro de velocidad máxima de 140 km/h y auto-detección de vehículo.

### 3. Mapas Especializados y Marcador ✅
*   **La Idea (Visión):** Mapas tácticos (senderos, topografía) reemplazando el pin clásico por un ícono de ciclista dinámico.
*   **Implementación Técnica:** Librería `Leaflet.js`. Marcador táctico personalizado con halo verde radiante `🚴`. Integradas tres TileLayers: CyclOSM, OpenTopoMap y ESRI Satellite.
*   **Estado:** **COMPLETADO.** Selector de capas en vivo y marcador táctico con pulso.

### 4. Laboratorio Post-Entrenamiento ✅
*   **La Idea (Visión):** Informe profundo (Garmin/TrainingPeaks/VeloViewer) con carga de entrenamiento, zonas de esfuerzo, detección de la pared más empinada del día, potencia en Watts (Bike IQ) y recarga de glucógeno IA (Nua Coach).
*   **Implementación Técnica:** Fórmulas de Carga (TSS/IF), física de potencia en vatios, algoritmo de pendiente máxima (VeloViewer) e informe de nutrición deportiva.
*   **Estado:** **COMPLETADO.** Integrado como pestaña fija e invocable desde el historial.

---

## 🟠 PRIORIDAD 2: ECOSISTEMA DE DATOS Y CONECTIVIDAD (100% COMPLETADA)

### 5. Persistencia Offline y Nube ✅
*   **La Idea (Visión):** Guardado asegurado en la montaña sin internet. Subida automática a la nube al enganchar Wi-Fi/4G.
*   **Implementación Técnica:** Arquitectura Offline-First con `localStorage` y SDK Firebase Firestore ejecutando sincronización automática con el evento `online`.
*   **Estado:** **COMPLETADO.** Pestañas de vista Local vs Nube y botón de sincronización.

### 6. Ecosistema Strava (Integración y Extracción Ligera) ✅
*   **La Idea (Visión):** Subida rápida a Strava al terminar. Generador de GPX optimizado con botón directo hacia la plataforma de subida de Strava.
*   **Implementación Técnica:** Generador de GPX estándar con namespaces de elevación y tiempo, y enlace directo a Strava Upload.
*   **Estado:** **COMPLETADO.** Botones en Laboratorio e Historial.

### 7. Telemetría y Radar Grupal ✅
*   **La Idea (Visión):** Compartir tu ubicación en vivo por un link de WhatsApp (Baliza SOS/Seguridad para que Cona o tu familia vean por dónde andás) y ver en tu mapa a los amigos que pedalean con vos (Radar de Escuadrón con Facundo y el grupo).
*   **Implementación Técnica:** Enlace directo de WhatsApp con coordenadas Google Maps en vivo desde el Cockpit y por impacto de caída. Sistema de salas Firestore en tiempo real con marcadores grupales personalizados en Leaflet y modo de prueba con compañeros simulados.
*   **Estado:** **COMPLETADO.** Baliza SOS activa + Radar de Escuadrón con salas compartidas y compañeros virtuales demo.

---

## 🟡 PRIORIDAD 3: SEGURIDAD, ASISTENCIA Y BIOMECÁNICA (100% COMPLETADA)

### 8. Escuadrón de Agentes IA (Ciclo de Entrenamiento) ✅
*   **La Idea (Visión):** "Estratega" previo para presión de cubiertas (SILCA). "Táctico" en vivo para hidratación y semáforo de pendientes. "Recuperador" post-ruta (Nua Coach).
*   **Implementación Técnica:** Calculador SILCA en pestaña Preparación (según peso, ancho 2.1-2.6", tubeless/cámara y terreno). Entrenador de voz en vivo con Audio Ducking. Nutrición IA post-ruta.
*   **Estado:** **COMPLETADO.** Todo integrado en Preparación, Radar y Laboratorio.

### 9. Baliza Táctica SOS (Detección de Caídas) ✅
*   **La Idea (Visión):** Alarma por impacto fuerte en el manubrio. Cuenta regresiva sonora de 30 segundos y envío de ubicación a WhatsApp si no se cancela.
*   **Implementación Técnica:** Sensor `devicemotion`. Detección de vector resultante > 32 m/s² (~3.2G). Modal con alarma y botón "ESTOY BIEN".
*   **Estado:** **COMPLETADO.** Activo durante la grabación de recorrido.

### 10. Escáner Biomecánico Cinético (MyBikeFitting) ✅
*   **La Idea (Visión):** Grabarse pedaleando con el celu apoyado para medir el ángulo de la rodilla y saber si el asiento está bien ajustado.
*   **Implementación Técnica:** Acceso a cámara vía `getUserMedia` o carga de fotos desde galería. `<canvas>` superpuesto interactivo con 3 marcadores arrastrables (Cadera, Rodilla, Tobillo), plomada vertical KOPS, cálculo del ángulo de flexión/extensión en tiempo real con trigonometría y recomendaciones ergonómicas inmediatas (25°-35° zona de oro).
*   **Estado:** **COMPLETADO.** Integrado en pestaña Preparación con guardado local de ajustes.

---

## 🟢 PRIORIDAD 4: GAMIFICACIÓN Y HARDWARE VIRTUAL (100% COMPLETADA)

### 11. Segmentos Privados y Medallas PR ✅
*   **La Idea (Visión):** Marcar tus propios sectores. La app te cronometra en silencio y te da medallas (Oro, Plata, Bronce) si rompés tus propios récords (PRs).
*   **Implementación Técnica:** Gestor en Preparación para crear segmentos fijando inicio y fin satelitales. Detección automática de entrada por proximidad (<30m), banner dinámico en vivo en Radar Live, comparación con el mejor tiempo y asignación de medallas (🥇 Oro PR, 🥈 Plata, 🥉 Bronce) reflejadas en el Laboratorio.
*   **Estado:** **COMPLETADO.** Almacenamiento local, detección satelital en vivo y reporte de medallas post-ruta.

### 12. Fantasma de Rendimiento (Ghost Pacer) ✅
*   **La Idea (Visión):** Competir en vivo contra tu mejor tiempo pasado en una ruta, con alertas de audio de ventajas o desventajas de tiempo.
*   **Implementación Técnica:** Liebre virtual configurable (ritmo fijo, track GPX o mejor salida previa). Widget en vivo en Radar Live con diferencia de segundos (+/-), barra deslizante Pacer Bar, marcador dinámico `👻` en el mapa Leaflet y alertas de audio del entrenador de voz.
*   **Estado:** **COMPLETADO.** Selector en Cockpit, widget diferencial y marcador en vivo en el mapa.

### 13. Entrenador Táctico de Voz con "Audio Ducking" ✅
*   **La Idea (Visión):** La app te habla las instrucciones de terreno bajando automáticamente la música de Spotify.
*   **Implementación Técnica:** `speechSynthesis` HD + audios locales offline con prioridad multimedia móvil.
*   **Estado:** **COMPLETADO.**

### 14. Odómetro Mecánico de la Bicicleta (Mantenimiento Predictivo) ✅
*   **La Idea (Visión):** Control de desgaste de cadena, pastillas de freno y cubiertas, acelerando el desgaste según el desnivel positivo (+D) acumulado.
*   **Implementación Técnica:** Almacenamiento local en pestaña Preparación con barras de porcentaje y botones de reset al reemplazar componentes.
*   **Estado:** **COMPLETADO.**

### 15. Conversor MapsToGPX y Widget ClimbPro ✅
*   **La Idea (Visión):** Altimetría de los próximos 1.5 km por delante con gradiente de color según la dureza.
*   **Implementación Técnica:** Canvas interactivo ClimbPro con detección de rampas duras (>8%).
*   **Estado:** **COMPLETADO.**

---

## 🚀 REFINAMIENTOS MAESTROS Y COACHING INTELIGENTE (100% COMPLETADOS)

### 16. Blindaje de Pantalla y Segundo Plano Reforzado (WakeLock + Audio Loop) ✅
*   **La Idea (Visión):** Que la app nunca se suspenda ni se apague la pantalla durante la rodada en el cerro, aun con el celular en el bolsillo o en el soporte del manubrio.
*   **Implementación Técnica:** API nativa `navigator.wakeLock.request('screen')`, re-adquisición automática con evento `visibilitychange`, loop de audio silencioso en `<audio id="audio-keepalive">` y sesión multimedia `navigator.mediaSession` activa.
*   **Estado:** **COMPLETADO.** Pantalla despierta y grabación continua en segundo plano.

### 17. Modo Bici Puro vs Auto-Detección de Vehículo Conmutable ✅
*   **La Idea (Visión):** Evitar que las bajadas rápidas en cerro o senderos activen erróneamente el modo auto.
*   **Implementación Técnica:** Desactivada por defecto (`autoDeteccionVehiculo = false`), umbral elevado a 85 km/h condicionado a terreno llano (pendiente >= -1%), y botón táctico en el Cockpit (`🚲 Modo Bici Puro` / `🚗 Auto-Detección ON`) para pruebas.
*   **Estado:** **COMPLETADO.**

### 18. Pacing Coach de Terreno, Elevación (+D) y Paredes Anticipadas ✅
*   **La Idea (Visión):** Indicaciones tácticas por voz y visuales que evalúen la velocidad según el terreno, comparen con el historial previo en llano indicando si apretar un poco más, feliciten al pasar cotas de altitud (ej: de 700m a 820m) y anticipen paredes duras mediante la ruta ClimbPro/GPX.
*   **Implementación Técnica:** Función `evaluarRitmoYTerreno()` integrada al pipeline GPS. Análisis de gradiente por tramos con escaneo a 500m hacia adelante en GPX, cálculo de hitos de elevación relativa y banner táctico `#ui-consejo-coach` con audio ducking.
*   **Estado:** **COMPLETADO.**

### 19. Planificador Táctico de Entrenamientos IA (Fases Guiadas en Vivo) ✅
*   **La Idea (Visión):** Planificar la salida junto a la IA según el objetivo del día (Escalada, Fondo, Intervalos HIIT o Recuperación) recibiendo instrucciones paso a paso durante la ruta.
*   **Implementación Técnica:** Tarjeta en pestaña Preparación con 4 planes y desglose de fases (Calentamiento, Bloque Principal, Enfriamiento). Widget interactivo en vivo `#widget-plan-entrenamiento` en Radar Live con barra de progreso, temporizador de fase y órdenes de voz automáticas en cada transición.
*   **Estado:** **COMPLETADO.**

---

## AVANCE REAL — 2026-10-28 — Registro GPS Android con pantalla bloqueada
**Responsable:** ChatGPT · **Revisión cruzada propuesta:** Antigravity · **Trabajo:** MTB-01/02/03/04 · **Rama:** \`feat/gps-android-grabacion-nativa-final-20261028\`

**Problema confirmado por el usuario:** La PWA alojada en \`https://proyectmtb.netlify.app/\` deja de grabar cuando Android suspende el navegador, se apaga la pantalla o se cierra la web. Audio silencioso y Screen Wake Lock **no garantizan** continuidad. No prometerlo para el sitio web.

### Código agregado en rama independiente desde main actualizado de Antigravity
- \`android/app/src/main/java/ar/mtb/radar/TrackingService.kt\`: servicio foreground de tipo \`location\`, notificación persistente con acción de detener, escucha GPS y escritura SQLite. Funciona conceptualmente aunque WebView esté en segundo plano, sujeto a las restricciones de Android. Sin internet requerido para las coordenadas.
- \`TrackDatabase.kt\`: sesiones con ID, timestamps, coordenadas aceptadas, índice, deduplicación y filtro de precisión/saltos. Registro local independiente del navegador. Si un proceso muere, los puntos ya escritos permanecen y la sesión inconclusa puede reanudarse a pedido del usuario.
- \`MainActivity.kt\`: controles nativos Iniciar/Detener GPS, estado de puntos guardados, listado de sesiones, elección de nueva ruta vs continuar ruta interrumpida, visor WebView restringido al origen Netlify. Los controles de grabación web se interceptan dentro de la app Android para evitar doble registro.
- \`GpxExport.kt\`: escritura streaming de GPX válido por el selector \`ACTION_CREATE_DOCUMENT\` de Android (archivo, no texto de WhatsApp).
- \`android/*gradle* / AndroidManifest.xml\`: proyecto Android Gradle/Kotlin minSdk26/target35, permisos requeridos.
- \`.github/workflows/android-gps.yml\`: compilación de APK debug como artifact de GitHub Actions al subir cambios a la rama o abrir PR. No se incorporó a Netlify ni se modificó la web publicada.

### Lo que NO debe confundirse con terminado
- El **sitio Netlify** no adquiere GPS de segundo plano por este trabajo: solo la aplicación Android instalada, una vez compilada, podrá intentarlo.
- La grabación nativa es inicialmente independiente del Historial web/Firestore: aparece en el listado nativo y se exporta a GPX. Importación automática a Historial web y sincronización nube requieren integración adicional.
- **No se ha probado aún en un teléfono físico** ni verificado autonomía/batería. No usar como sistema de rescate. Android puede detenerlo mediante «Forzar detención», restricciones del fabricante o permisos revocados.
- Confirmar **CI Android APK** antes de presentar APK como compilado; si falla, corregir errores en esta misma rama.
- Probar en teléfono: 10/30/60 min pantalla apagada, abrir otra app, cerrar vista, perder datos móviles, GPS desactivado, permisos denegados, interrupción/cierre del proceso, exportación y reimportación GPX. Validar cantidad y timestamps de puntos grabados.
- No fusionar main ni tocar respaldos sin revisión y aprobación del usuario.

### Próximo orden
1. Comprobar éxito de GitHub Actions y disponer del APK debug de prueba.
2. Instalar APK en Android, autorizar ubicación precisa, pulsar **▶ GPS**, comprobar notificación, bloquear pantalla y hacer recorrido breve. Verificar \`GPX guardados\` y exportación en formato .gpx.
3. Corregir lo observado en la prueba móvil y sincronizar esa fuente GPS con Radar Live/Historial.
4. Solo después integrar la versión probada con el diseño de Claude y el despliegue Netlify.
