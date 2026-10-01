# 🚵‍♂️ RADAR TÁCTICO MTB - ROADMAP DEFINITIVO (VISIÓN + ARQUITECTURA)
**Documento Central para el Agente de Desarrollo (Antigravity)**

**Instrucción para la IA:** Este documento detalla la visión del producto (la experiencia del usuario) y las especificaciones técnicas obligatorias. La app debe construirse como una PWA Mobile-First, priorizando el rendimiento de batería, la persistencia offline y la alta legibilidad bajo el sol.

---

## 🔴 PRIORIDAD 1: CIMIENTOS Y CORE TÁCTICO

### 1. Arquitectura UI/UX y Diseño Visual
*   **La Idea (Visión):** Navegación fluida estilo Strava con 4 pestañas fijas en la base (Preparación, Radar Live, Laboratorio, Historial). Diseño en "Modo Oscuro Premium" inspirado en la naturaleza (cielo nocturno, agua y bosque).
*   **Implementación Técnica:** SPA (Single Page Application) usando Bottom Navigation Bar. CSS Grid/Flexbox puro. Variables de color: Fondo `#1a1a24` (Escorpio/Acuario), Tarjetas `#2d3748`, Acentos/Navegación `#20c997` (Cáncer), y Botones/Alertas `#1e5631` y `#d4af37` (Virgo).

### 2. Blindaje de GPS y Background Keep-Alive
*   **La Idea (Visión):** La app no debe apagarse ni dejar de grabar al bloquear la pantalla en el bolsillo. Debe filtrar "saltos fantasmas" si se pierde señal bajo los árboles en el cerro.
*   **Implementación Técnica:** Usar `AudioContext` inaudible para evitar la suspensión del hilo JS. Filtrar `geolocation.watchPosition` descartando `accuracy > 25m`, aceleraciones irreales, y pausando el odómetro a `< 1.2 km/h`.

### 3. Mapas Especializados y Marcador
*   **La Idea (Visión):** Mapas tácticos (senderos, topografía) reemplazando el pin clásico por un ícono de ciclista dinámico.
*   **Implementación Técnica:** Librería `Leaflet.js`. Marcador `L.icon` rotatorio. Integrar tres TileLayers: CyclOSM, OpenTopoMap y ESRI.

### 4. Laboratorio Post-Entrenamiento
*   **La Idea (Visión):** Informe profundo (Garmin/TrainingPeaks) con carga de entrenamiento, zonas de esfuerzo, y detección de la pared más empinada del día.
*   **Implementación Técnica:** Fórmulas de Carga (TSS/IF). Algoritmo que procese el array de altitudes calculando la pendiente máxima cada 100m para extraer el Insight estilo VeloViewer.

---

## 🟠 PRIORIDAD 2: ECOSISTEMA DE DATOS Y CONECTIVIDAD

### 5. Persistencia Offline y Nube
*   **La Idea (Visión):** Guardado asegurado en la montaña sin internet. Subida automática a la nube al enganchar Wi-Fi/4G.
*   **Implementación Técnica:** Arquitectura Offline-First con `IndexedDB`. Integración con SDK Firebase Firestore ejecutando la sincronización con un event listener de `online`.

### 6. Ecosistema Strava (Integración y Extracción Ligera)
*   **La Idea (Visión):** Subida automática a Strava al terminar (sincronización bidireccional). Además, una herramienta para pegar un link de Strava y extraer la ruta para analizarla sin descargar archivos.
*   **Implementación Técnica:** Flujo OAuth 2.0 y endpoint `POST /uploads` de Strava API. Para extracción: usar API pública o un scraper ligero para parsear los datos de una URL de actividad.

### 7. Telemetría y Radar Grupal
*   **La Idea (Visión):** Compartir tu ubicación en vivo por un link de WhatsApp (Baliza SOS/Seguridad para que Cona o tu familia vean por dónde andás) y ver en tu mapa a los amigos que pedalean con vos (Radar de Escuadrón con Facundo y el grupo).
*   **Implementación Técnica:** Firebase Realtime Database. Emitir payload `{lat, lng, id}` y actualizar marcadores secundarios en Leaflet para usuarios suscritos al mismo grupo.

---

## 🟡 PRIORIDAD 3: SEGURIDAD, ASISTENCIA Y BIOMECÁNICA

### 8. Escuadrón de Agentes IA (Ciclo de Entrenamiento)
*   **La Idea (Visión):** "Estratega" previo (Consultar al Coach) para nutrición/presión de cubiertas. "Táctico" en vivo para pautas de hidratación y alimentación. "Recuperador" post-ruta para el descanso tras enviar el JSON al recuperar conexión.
*   **Implementación Técnica:** Llamadas a API LLM (Gemini/ChatGPT). Fórmulas matemáticas de interpolación (Motor SILCA) para presión. Motor Táctico usando `setInterval` y telemetría cruzada (TSS/clima) para emitir comandos de voz.

### 9. Baliza Táctica SOS (Detección de Caídas)
*   **La Idea (Visión):** Alarma por impacto fuerte e inmovilidad. Envío de SMS con coordenadas GPS a contacto de emergencia si no se cancela.
*   **Implementación Técnica:** Sensor `devicemotion`. Si vector G > umbral e inmovilidad de 30s -> alarma sonora y generar URI `sms:[numero]?body=[Coordenadas]`.

### 10. Escáner Biomecánico Cinético (MyBikeFitting)
*   **La Idea (Visión):** Grabarse pedaleando con el celu apoyado para medir el ángulo de la rodilla y saber si el asiento está bien ajustado.
*   **Implementación Técnica:** Acceso a `getUserMedia`. Superponer un `<canvas>` sobre el `<video>` usando APIs de dibujo 2D para trazar plomadas y ángulos en tiempo real.

---

## 🟢 PRIORIDAD 4: GAMIFICACIÓN Y HARDWARE VIRTUAL

### 11. Segmentos Privados y Medallas PR
*   **La Idea (Visión):** Marcar tus propios sectores. La app te cronometra en silencio y te da medallas (Oro, Plata, Bronce) si rompés tus propios récords (PRs).
*   **Implementación Técnica:** Algoritmos geoespaciales (`turf.js`). Definir radio de tolerancia (20m) en puntos de inicio/fin. Guardar historial local y renderizar UI de medallas según ranking.

### 12. Fantasma de Rendimiento (Ghost Pacer)
*   **La Idea (Visión):** Competir en vivo contra tu mejor tiempo pasado en una ruta, con alertas de audio de ventajas o desventajas de tiempo.
*   **Implementación Técnica:** Parseo de archivo `.gpx` propio. Interpolación constante del tiempo/distancia del track cargado vs. la ubicación actual de `watchPosition`.

### 13. Entrenador Táctico de Voz con "Audio Ducking"
*   **La Idea (Visión):** Que la app te hable las instrucciones de terreno bajando automáticamente el volumen de tu música de Spotify.
*   **Implementación Técnica:** Usar `window.speechSynthesis`. Implementar alertas nativas que fuercen la atenuación (ducking) del sistema operativo móvil antes de reproducir el mensaje.

### 14. Odómetro Mecánico de la Bicicleta (Mantenimiento Predictivo)
*   **La Idea (Visión):** Control de desgaste. Un asistente que te avise cuándo cambiar cadena o pastillas cruzando los kilómetros con el estrés de las trepadas.
*   **Implementación Técnica:** JSON local en Firestore para registrar fechas/km de componentes. Lógica matemática que reste vida útil acelerando el desgaste según el TSS/desnivel acumulado.

### 15. Conversor MapsToGPX y Widget ClimbPro
*   **La Idea (Visión):** Pegar un enlace de Google Maps y que la app dibuje las montañas y pendientes de los próximos 1.5 km al instante.
*   **Implementación Técnica:** Regex (Expresiones Regulares) para extraer coordenadas de la URL de Google Maps y pasarlas como array de waypoints al Canvas del trazador de altimetría.