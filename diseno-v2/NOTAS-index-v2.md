# index-v2.html — Radar Táctico MTB con el diseño «Verde táctico»

Un solo archivo. **No reemplaza** tu `index.html` de producción: se prueba aparte (por ejemplo, subilo a una carpeta de prueba de tu hosting o abrilo desde un servidor local). No toqué el repositorio.

## Qué es
- El diseño aprobado (Radar en Mapa / Cabina / Subida, Preparación, Laboratorio, Historial y todas las hojas) conectado al **motor real de tu app**, que va dentro del archivo sin modificar.
- El mapa de la ruta que estás grabando es el protagonista del Radar: tiles reales, traza coloreada por tramo, pared marcada, rider con precisión del GPS, Ghost y escuadrón.
- `?demo=1` al final de la dirección muestra el diseño con datos de ejemplo (lo que ves en las capturas de referencia).

## Qué verifiqué (navegador de prueba, GPS simulado)
- Modo demostración: los **40 estados** coinciden con tus capturas de referencia (diferencia máxima 0,26 %, tolerancia 2 %). El auditor de colores da 0 colores fuera del diseño.
- Modo real: arranque con GPS, iniciar / pausar / reanudar / finalizar, informe, guardado en el teléfono (sigue ahí al recargar), Historial, Laboratorio con la traza propia, descarga de GPX, eliminar salida, cargar un GPX en Preparación, salir sobre esa ruta (aviso de pared, tramos, mapa), simulador de GPX, caída (cuenta regresiva y cancelar), bloqueo antisudor, SOS, Ghost Pacer, Escuadrón, hoja de nube, odómetro, segmentos y plan.

## Qué NO pude probar (hace falta tu celular)
Voz real (síntesis del teléfono), subida a la nube con tu Firebase, cámara del BikeFit, el envío del SOS por WhatsApp, GPS y sensores reales, pantalla encendida, instalación como PWA y uso sin conexión.

## Error que ya existe en tu `index.html` actual
Al tocar **Finalizar**, el motor intenta escribir en 22 campos del informe (`rep-vel-media`, `rep-tss`, `barra-z1`…) que ya no están en la pantalla, y se corta con «Cannot set properties of null». Lo confirmé corriendo tu `index.html` de producción con un GPS de prueba. En `index-v2.html` quedó resuelto con campos ocultos; en producción sigue igual hasta que se corrija.

## Decisiones tuyas pendientes
1. `sw.js` no incluye `index-v2.html` (agregarlo es un cambio en producción: necesita tu aprobación).
2. Mapa sin conexión: solo se guardan los mosaicos OSM de zoom 13–15; CyclOSM no.
3. Al abrir, el GPS pide permiso de ubicación enseguida (para mostrar «Listo para salir» con tu posición).
4. Los colores de la traza de vuelta/segmento/ghost/escuadrón del mapa no están en los tokens oficiales: los dejé marcados aparte para que los apruebes.
5. Rótulos del diseño que son propuestas, no funciones existentes (por ejemplo «IA óptica» en BikeFit): decidir si se quedan.
6. Faltan los audios mp3 del pack de voz (la app usa la voz del teléfono).
7. El motor conserva su propio mapa Leaflet oculto (no se ve ni descarga mosaicos); es necesario porque el motor lo usa.
