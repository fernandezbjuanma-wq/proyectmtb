# HANDOFF — ChatGPT | Correcciones de confiabilidad 2026-10-28

## Contexto y versión
- Rama: `fix/gps-sos-datos-20261028`
- Base: `main` commit `84bd8b3fd26711481daebc7cd60d75699ca6fc54`
- Código modificado: `index.html` solamente.
- Los respaldos `respaldo/original-antigravity-2026-10-24` y `respaldo/actual-con-documentacion-2026-10-24` NO fueron alterados.
- No aparecen commits posteriores de Antigravity en GitHub; **podría tener trabajo local aún no subido**.
- Trabajo propuesto por ChatGPT. Pendiente de revisión de Antigravity, Claude (si interviene), pruebas de navegador/celular y aprobación del usuario. **NO fusionar a main sin revisión**.

## Modificaciones realizadas
1. **Suscripción GPS controlada:** se guarda el identificador de `watchPosition` y se ejecuta `clearWatch` al finalizar; se ignoran callbacks tras cerrar la grabación y se previene iniciar dos veces.
2. **Reinicio de sesión:** variables de distancia, cronómetro, puntos GPS, desnivel, métricas y segmentos se restablecen al iniciar. Se resetean contadores UI.
3. **Movimiento:** `segundosEnMovimiento` usa la diferencia temporal entre muestras consecutivas con velocidad de movimiento, descartando huecos mayores a 15 segundos. Es aún una estimación: comprobar en GPX de prueba.
4. **Desnivel:** separación de referencia para acumulación vertical y referencia de ventana de pendiente, para evitar sumas repetidas. Umbral inicial de 1,5 m sujeto a calibración.
5. **SOS/WhatsApp:** sin coordenadas ficticias. Se etiqueta *última posición registrada* con hora/antigüedad y se informa que abrir WhatsApp **NO es enviar el aviso automáticamente**. Mensaje de posible caída revisado.
6. **Persistencia:** cuando `localStorage` está lleno, ya no se eliminan puntos GPS silenciosamente: informa que se debe exportar GPX manualmente. **Falta reemplazar localStorage por IndexedDB y añadir autoguardado**, crítico para sesiones largas.
7. **Sincronización:** la función de carga a Firestore devuelve éxito o fallo; el contador manual solo aumenta cuando el servidor confirma y muestra confirmados/pendientes.

## Qué NO se hizo
- No se ejecutaron pruebas móviles ni de browser; solo comprobación sintáctica de JavaScript y revisión de presencia de cambios.
- No se implementó almacenamiento incremental, IndexedDB, mapas offline ni soporte GPS nativo de segundo plano.
- No se probaron reglas de seguridad de Firestore ni permisos de Escuadrón.
- No se reemplazó el diseño de Claude ni se editaron CSS/HTML de la interfaz, salvo texto informativo del SOS.
- No se arreglaron problemas de GPX, precisión ClimbPro, Audio Ducking, ni origen de MP3 faltantes.
- No se hizo merge a main.

## Riesgos y puntos que el revisor debe comprobar
- Los callbacks de geolocalización pendientes y el ciclo simulador no deben crear puntos fuera de sesión.
- Un cambio de permisos GPS o una lectura fallida debe presentar estado recuperable.
- Tras finalizar, iniciar una segunda ruta debe dar cero contadores y un track nuevo.
- `segundosEnMovimiento` difiere del tiempo real si hay huecos grandes: validar diseño de tolerancias.
- El SOS sigue siendo una alerta asistida: requiere interacción humana y conexión para abrir WhatsApp.
- Una sesión llena de puntos puede agotar `localStorage`: siguiente trabajo prioritario, guardado incremental con IndexedDB.
- `window.open` puede devolver un objeto aunque el usuario jamás mande mensaje.
- Firestore puede resolver escritura local persistente sin confirmar entrega efectiva al servidor; etiquetado de sincronización necesita pruebas offline/reconexión.
- Los recursos `zona_verde.mp3`, `zona_amarilla.mp3` y `zona_roja.mp3` siguen ausentes del árbol de archivos.

## Pruebas manuales solicitadas a Antigravity
1. Abrir app con HTTPS/localhost, dar permisos, iniciar una ruta, terminar y confirmar que no se agregan nuevos puntos.
2. Iniciar segunda ruta: km, ascenso, tiempo, potencia, track y segmentos comienzan en cero.
3. Simular secuencia de posiciones GPS con timestamps espaciados a intervalos 1s y 5s: tiempo de movimiento consistente, sin sumar 1s fijo por muestra.
4. Forzar pausa de señal >15s y verificar que no se invente tiempo ni distancia de movimiento.
5. Sin permisos GPS y sin posición, tocar SOS: no se envían coordenadas inventadas.
6. Con ubicación, verificar texto de WhatsApp y ausencia de mensaje de envío automático.
7. Forzar cuota de almacenamiento agotada y verificar aviso + posibilidad de exportar GPX sin haber borrado sus puntos en memoria.
8. Probar pérdida/recuperación de red en Firestore y validar qué significa «sincronizado».
9. Probar simulador GPX y varias sesiones consecutivas sin regresiones.
10. Comparar ascenso y pendiente con GPX conocido, con tramos llanos y datos ruidosos.

## Próximos PR sugeridos
- P0: IndexedDB + checkpoints periódicos + recuperación de actividad interrumpida.
- P0: pruebas reales de GPS con pantalla bloqueada, decidir PWA frente a contenedor nativo.
- P1: seguridad Firestore/Escuadrón (autenticación, reglas y control de sesiones).
- P1: arquitectura de mapas offline con licencias y pruebas desconectadas.
- P1: reparar audios offline faltantes.
- P2: ClimbPro por distancia acumulada y revisión de métricas físicas estimadas.

## Siguiente agente
Antigravity: revisar diff de la PR, ejecutar pruebas y proponer ajustes con commits a una rama revisable; NO asumir que el código fue probado.
Claude: revisar UX de las alertas de SOS, estados de grabación y errores de guardado; respetar el diseño preferido del usuario.
ChatGPT: revisar las propuestas/PR de Antigravity y Claude cuando aparezcan en GitHub.

**Handoff completo: propuesta pendiente de pruebas y aprobación humana.**
