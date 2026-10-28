# 🚵‍♂️ RADAR TÁCTICO MTB - ROADMAP DEFINITIVO (VISIÓN + ARQUITECTURA)
**Documento Central para el Agente de Desarrollo (Antigravity)**

**Estado verificado al 2026-10-28:** EN DESARROLLO. Hay 28 tareas abiertas; GPS Android, recuperación de actividades y sincronización privada siguen pendientes de aceptación.

> Las secciones históricas 1–19 conservan la visión original y sus declaraciones de «completado». No representan pruebas ejecutadas ni aprobación del usuario. El seguimiento vigente está en «Continuidad y prioridades — 2026-10-28», al final de este documento.

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

### Compilación Android verificada el 28/10/2026
- GitHub Actions **BUILD SUCCESSFUL**, run `40758066360`: https://github.com/fernandezbjuanma-wq/proyectmtb/actions/runs/40758066360
- Artifact ZIP **radar-mtb-android-debug** ID `12847387191` (incluye `app-debug.apk`, firmado para depuración). No es APK final de Play Store.
- SHA de código compilado: `2f73497f8a3d56d5de1371c9ada10ef8f7ac3667` (el cambio posterior en ROADMAP no modifica binario).
- Verificación disponible: compilación y empaquetado Android exitosos; **aún no hubo prueba física en teléfono**. No presentar la función como validada con pantalla bloqueada.
- Instalación de prueba: entrar al enlace de Actions, sección **Artifacts**, bajar `radar-mtb-android-debug`, extraer `app-debug.apk` e instalar en Android. Aceptar permisos de ubicación precisa e iniciar desde botón superior ▶ GPS.
- Después de grabar, pulsar **■ Parar** → **GPX guardados** → seleccionar sesión y guardar archivo `.gpx`. Los puntos de ese archivo se guardan en SQLite aunque la web no esté visible. La nube y el Historial web aún no se completan automáticamente.
---

## Continuidad y prioridades — 2026-10-28

### Estado local preservado y fuentes consultadas
- Copia original inspeccionada: rama `main`, HEAD `decaef7`, un commit local no publicado sobre `origin/main` (`1e8ccd0`). Ese commit agrega `TAREAS_PENDIENTES.md` con 17 tareas; no equivale al plan vigente de 28 issues.
- No había modificaciones en archivos versionados ni cambios en staging. Había dos PDFs sin seguimiento (`Radar Táctico MTB - Bocetos.pdf` y `Radar Táctico MTB - Bocetos-selection.pdf`): no se editaron, copiaron ni publicaron.
- El acceso de escritura a metadatos Git del original quedó restringido. Se creó una copia de trabajo aislada y la rama `fix/mtb-01-timestamps-gps-20261028`, desde el head `edaef402` del PR #22. La copia original, su commit sin publicar y los PDFs se conservan.
- Leídos `AGENTS.md`, los seis documentos de contexto requeridos, este roadmap, las 28 issues abiertas y los cuatro PR abiertos al inicio; después se abrió el PR #35. Solo este roadmap recibe documentación nueva; no se borran ni consolidan otros MD.
- Contradicción documental: el encabezado histórico declaraba «100% completado», mientras el código y los handoffs no demuestran GPS bloqueado, recuperación ni privacidad de servidor. Las marcas históricas no constituyen aceptación.

### Pull requests abiertos y dependencias
| PR | Base → rama | Estado comprobado / próximo paso |
| --- | --- | --- |
| [#3](https://github.com/fernandezbjuanma-wq/proyectmtb/pull/3) | `fix/gps-sos-datos-20261028` → `feat/resiliencia-estadisticas-seguridad-20261028` | Borrador. IndexedDB y cálculos propuestos; reconciliar con nube y scrubber de main antes de integrar. |
| [#4](https://github.com/fernandezbjuanma-wq/proyectmtb/pull/4) | rama de #3 → `feat/android-background-gps-nube-segura-20261028` | Borrador encadenado a #3; prototipo Android y reglas propuestas. No desplegar reglas al cliente antiguo. |
| [#5](https://github.com/fernandezbjuanma-wq/proyectmtb/pull/5) | rama de #4 → `docs/roadmap-unico-20261028` | Borrador encadenado a #4; elimina documentos en su propuesta. Esta entrega no aplica esas eliminaciones. |
| [#22](https://github.com/fernandezbjuanma-wq/proyectmtb/pull/22) | `main` → `feat/gps-android-grabacion-nativa-final-20261028` | Borrador independiente sobre main `1e8ccd0`. Check `android-debug` exitoso para head `edaef402`: [run 40758465010](https://github.com/fernandezbjuanma-wq/proyectmtb/actions/runs/40758465010). No hay revisión Antigravity registrada ni prueba física demostrada. |

La nueva rama es una continuación acotada de #22, no una integración de #3/#4/#5. El [PR #35](https://github.com/fernandezbjuanma-wq/proyectmtb/pull/35) apunta a la rama de #22 para mostrar solo las correcciones y mantener ambas propuestas pendientes de aprobación.

### Plan vigente de 28 tareas y revisión cruzada
La flecha indica implementador → revisor requerido. La tabla refleja alcance y antecedentes; ninguna asignación inicia automáticamente una sesión ni acredita revisión de la otra IA.

| Tarea | Prioridad | Issue y alcance | Implementa → revisa | Estado observado |
| --- | --- | --- | --- | --- |
| MTB-01 | P0 | [#6](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/6) Motor GPS nativo persistente y recuperación de sesión | ChatGPT → Antigravity | Corrección en esta rama; falta revisión Antigravity |
| MTB-02 | P0 | [#7](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/7) Integración Android, APK y fuente única GPS | Antigravity → ChatGPT | Parcial en PR #22; falta integración y pruebas físicas |
| MTB-03 | P0 | [#8](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/8) Autoguardado IndexedDB, restauración y migración sin pérdida | ChatGPT → Antigravity | Propuesta en PR #3; falta reconciliar con main |
| MTB-04 | P0 | [#9](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/9) Pruebas móviles de GPS y batería / aceptación de campo | Antigravity → ChatGPT | Pendiente de teléfono real |
| MTB-05 | P0 | [#10](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/10) Firebase Auth + reglas privadas + migración de actividades | ChatGPT → Antigravity | Reglas de PR #4 son borrador; Auth/migración pendientes |
| MTB-06 | P0 | [#11](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/11) Sincronización nube verificable y diagnóstico Netlify | Antigravity → ChatGPT | Auditoría local: estados de nube no prueban servidor |
| MTB-07 | P1 | [#12](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/12) Auditoría de privacidad Escuadrón y SOS | ChatGPT → Antigravity | Pendiente de implementación/aceptación |
| MTB-08 | P1 | [#13](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/13) Mapas descargables offline y regreso por el recorrido | Antigravity → ChatGPT | Pendiente de implementación/aceptación |
| MTB-09 | P1 | [#14](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/14) Precisión de altitud, distancia, potencia y carga de entrenamiento | ChatGPT → Antigravity | Pendiente de implementación/aceptación |
| MTB-10 | P1 | [#15](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/15) Netlify, PWA e integración del scrubber de recorridos | Antigravity → ChatGPT | Pendiente de implementación/aceptación |
| MTB-11 | P2 | [#16](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/16) Comparador de rutas, segmentos y récords | ChatGPT → Antigravity | Pendiente de implementación/aceptación |
| MTB-12 | P2 | [#17](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/17) ClimbPro real, entrenador de voz y accesibilidad de radar | Antigravity → ChatGPT | Pendiente de implementación/aceptación |
| MTB-13 | P2 | [#18](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/18) Historial robusto: exportación/importación universal, estadísticas y mantenimiento | ChatGPT → Antigravity | Pendiente de implementación/aceptación |
| MTB-14 | P2 | [#19](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/19) Integración visual de Claude conservando funciones | Antigravity → ChatGPT | Pendiente de implementación/aceptación |
| MTB-15 | P1 | [#20](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/20) Pruebas automáticas CI y control de calidad de PRs | ChatGPT → Antigravity | Pendiente de implementación/aceptación |
| MTB-16 | P1 | [#21](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/21) Integración y resolución de conflictos de ramas pendientes | Antigravity → ChatGPT | Pendiente; PR #3/#4/#5 encadenados; #22 parte de main |
| MTB-17 | P1 | [#23](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/23) Chequeo pre-salida: GPS, permisos, batería, espacio y mapas | Antigravity → ChatGPT | Pendiente de implementación/aceptación |
| MTB-18 | P1 | [#24](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/24) Privacidad de recorridos: zonas sensibles y exportaciones seguras | ChatGPT → Antigravity | Pendiente de implementación/aceptación |
| MTB-19 | P1 | [#25](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/25) Integridad de sesiones: IDs estables, deduplicación y múltiples pestañas | ChatGPT → Antigravity | Pendiente de implementación/aceptación |
| MTB-20 | P2 | [#26](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/26) Biblioteca de rutas GPX totalmente local, etiquetas y favoritos | Antigravity → ChatGPT | Pendiente de implementación/aceptación |
| MTB-21 | P2 | [#27](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/27) Planificador de entrenamiento ciclista por RPE, tiempo y zonas | ChatGPT → Antigravity | Pendiente de implementación/aceptación |
| MTB-22 | P2 | [#28](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/28) Garaje MTB multi-bicicleta y mantenimientos por componente | Antigravity → ChatGPT | Pendiente de implementación/aceptación |
| MTB-23 | P1 | [#29](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/29) Diagnóstico privado de errores, fallos GPS y sincronización | ChatGPT → Antigravity | Pendiente de implementación/aceptación |
| MTB-24 | P2 | [#30](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/30) Waypoints, alertas de desvío y navegación de regreso asistida | Antigravity → ChatGPT | Pendiente de implementación/aceptación |
| MTB-25 | P1 | [#31](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/31) Auditoría de rendimiento: batería, memoria, mapas y escrituras | ChatGPT → Antigravity | Pendiente de implementación/aceptación |
| MTB-26 | P2 | [#32](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/32) Compatibilidad importación y exportación GPX/TCX/FIT | Antigravity → ChatGPT | Pendiente de implementación/aceptación |
| MTB-27 | P1 | [#33](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/33) Pruebas de desconexión extrema y recuperación sin pérdida | ChatGPT → Antigravity | Pendiente de implementación/aceptación |
| MTB-28 | P1 | [#34](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/34) Publicación segura: staging Netlify, versionado y rollback comprobable | Antigravity → ChatGPT | Pendiente de implementación/aceptación |

### Orden de ejecución
1. **GPS Android y guardado nativo (#6/#7):** corregir integridad de posiciones y sesiones sobre #22, compilar, instalar y ejecutar matriz física de #9. Pausa/reanudación y puente seguro hacia Radar Live aún requieren trabajo.
2. **Guardado y recuperación web (#8):** reconciliar IndexedDB del PR #3 con main; primero preservar historial corrupto y manejar cuota sin sobrescribir datos. El guardado nativo SQLite no sustituye el Historial web.
3. **Sincronización privada (#10/#11):** definir identidad persistente, datos por UID, reglas probadas y migración con respaldo. Después verificar confirmación del servidor, reconexión y conflictos; no desplegar reglas aisladas que bloqueen al cliente actual.
4. **Integración (#21) y aceptación:** revisión cruzada real, correcciones, nueva revisión y aprobación expresa del usuario antes de cualquier merge a main. No se habilita auto-merge.

### Avance acotado de MTB-01 (#6)
**Responsable:** ChatGPT. **Revisor obligatorio pendiente:** Antigravity. Los subagentes de esta sesión son auxiliares de ChatGPT, no constituyen la revisión cruzada de Antigravity.

- Problema: `TrackDatabase.record()` convertía tiempos inválidos o viejos en la hora actual y admitía tiempos futuros; también podía insertar un callback después de `finish()`.
- Corrección propuesta: política GPS pura para validar tiempo UTC y antigüedad por reloj monotónico sin retimar posiciones; descartar coordenadas/precisión inválidas y sanear valores opcionales no finitos. [Referencia Android Location](https://developer.android.com/reference/android/location/Location#getElapsedRealtimeNanos()).
- Guardado propuesto: transacción SQLite que comprueba sesión existente y abierta antes de leer el último punto e insertar. Conserva el esquema y las sesiones existentes, sin migración destructiva.
- Archivos funcionales: `TrackDatabase.kt`, `GpsFixPolicy.kt`; pruebas en `android/app/src/test/java/ar/mtb/radar/GpsFixPolicyTest.kt`. JUnit 4 se usa solo para pruebas; no se agrega dependencia de producción.
- Verificación de esta corrección: **14 pruebas JUnit4 pasaron** con Kotlin 2.0.21 y JDK 17 efímeros, sin Android ni red durante su ejecución. Cubren límite de edad, posiciones viejas/futuras/cero, reloj monotónico, overflow, coordenadas/precisión y valores opcionales. Comando previsto en entorno Android: `gradle -p android :app:testDebugUnitTest :app:assembleDebug`; la ejecución local usó el compilador Kotlin y JUnitCore directamente, sin SDK Android. `git diff --check` pasó. El éxito previo de CI corresponde a #22 antes de este arreglo.
- **Compilación de esta corrección confirmada:** `android-debug` exitoso para commit `06a5ac0bf87c6df3da96e062bae68cc1eb7793d8`, [run 40764807561, intento 2](https://github.com/fernandezbjuanma-wq/proyectmtb/actions/runs/40764807561/attempts/2). El intento 1 falló por handshake TLS al descargar una dependencia de Maven; se reintentó el job sin alterar workflow ni seguridad TLS. Esto demuestra compilación/empaquetado, no pruebas móviles ni ejecución de los tests unitarios en CI.
- La transacción y su interacción con `finish()` recibieron revisión estática interna de ChatGPT; no se ejecutó una prueba SQLite Android ni se comprobó esta versión en teléfono. El callback de notificación de `TrackingService` también requiere ensayar detener mientras llega un punto: persiste un riesgo previo de aviso tardío aunque la sesión ya esté cerrada.
- El workflow de CI existente se conserva. La revisión automática rechazó ampliarlo por interpretar que excedía el alcance documental y agregaba efectos persistentes; no se aplicó esa modificación.
- No implementado aquí: pausa/reanudación completa, permiso de notificaciones Android 13+ (#7), integración SQLite→Historial/Firestore ni garantía bajo «Forzar detención».
- Pruebas físicas pendientes (#9): ubicación precisa concedida/denegada, notificaciones concedidas/denegadas, bloqueo 5/30/90 min, otra app, sin red, GPS apagado, proceso interrumpido, almacenamiento lleno, reabrir sesión y exportar/reimportar GPX. Registrar dispositivo, Android, cantidad/horas de puntos y fallos sin publicar trazas personales.

### Hallazgos de guardado y nube para #8/#10/#11/#18
Inspección del `index.html` de main `1e8ccd0` (sin cambios funcionales web en esta entrega). Seis comprobaciones aisladas con Node y dobles de almacenamiento/Firebase confirmaron los siguientes comportamientos; no son pruebas de un servidor ni del navegador real.

- **Historial corrupto:** `obtenerActividadesGuardadas()` (aprox. líneas 5306–5310) devuelve lista vacía si el JSON es inválido; el guardado siguiente (5323–5326) reemplaza el historial por la nueva sesión sin advertencia. JSON con forma objeto provoca excepción fuera del bloque de escritura. #8 debe resguardar el contenido ilegible y fallar sin sustituirlo.
- **Restauración parcial:** `importarBackupJSON()` escribe odómetro/segmentos antes de persistir actividades. Si se agota la cuota, hay cambios parciales y el mensaje los atribuye a JSON inválido. Se exporta BikeFit pero no se restaura. #18 debe validar todo antes de aplicar y ofrecer recuperación verificable.
- **Marca de nube heredada:** restaurar conserva `sincronizadoNube:true`; la cola excluye esas actividades aunque el destino Firebase sea otro. La marca local no prueba pertenencia ni confirmación de servidor. #11/#18.
- **Conexión aparente:** el fallo de `enablePersistence` puede terminar mostrando «Nube Lista». El diagnóstico acepta lectura desde caché como conexión viva; se reprodujo con `metadata.fromCache:true`. #11 debe separar persistencia local, pendiente y confirmado por servidor.
- **Privacidad sin demostrar:** el cliente usa la colección global `actividades_mtb` sin autenticación ni separación por UID observables. Las reglas activas del servidor no se inspeccionaron; no afirmar que están abiertas ni que son privadas. #10 sigue pendiente. No se modificaron configuración, credenciales ni reglas.
- La escritura local con cuota excedida sí conserva los puntos en memoria y devuelve fallo; esto no resuelve la corrupción previa ni el cierre del proceso sin checkpoints.

### Handoff de esta continuidad
Antigravity: revisar el diff acotado de #6 y ejecutar las pruebas Kotlin/SQLite y la matriz móvil; comentar hallazgos y volver a revisar correcciones. Esta es una acción pendiente para una sesión habilitada, no una revisión ya realizada. ChatGPT mantiene pendientes #8/#10 y revisará los PR de #7/#11 cuando existan. Usuario: decidir aceptación y merge únicamente después de evidencia y revisión cruzada.
