# RADAR TÁCTICO MTB — DOCUMENTO ÚNICO DEL PROYECTO
Última actualización: **28/10/2026**. Responsable de las decisiones: **el usuario**.
**Regla permanente:** novedades, decisiones, errores, pendientes, pruebas, arquitectura, roadmap, diseño y handoffs se actualizan **solo aquí**. No generar más notas \`.md\` por cada tarea. \`AGENTS.md\` y \`CLAUDE.md\` son excepciones técnicas que únicamente indican dónde está esta fuente de verdad.

> **Estados claros:** "código escrito" ≠ "compilado" ≠ "probado en teléfono" ≠ "desplegado". Las funciones históricamente rotuladas "100% completadas" no necesariamente han sido validadas.

## A. Resumen y prioridades del usuario
- Proyecto: Radar Táctico MTB, app para entrenamiento, navegación, seguimiento GPS, análisis y seguridad en montaña.
- Interfaz con **cuatro pestañas fijas y en orden:** Preparación → Radar Live → Laboratorio → Historial.
- El usuario quiere trabajar también con Antigravity y Claude, **sin delegación de tareas salvo pedido expreso**. Antigravity ha trabajado en Netlify y un reproductor/scrubber interactivo de rutas; los cambios locales aún no aparecían en GitHub al último control. Claude trabaja en un diseño visual favorito del usuario: **no sustituir ni inventar su diseño**.
- Respaldo intocable: \`respaldo/original-antigravity-2026-10-24\`; otro respaldo \`respaldo/actual-con-documentacion-2026-10-24\`.
- **Prioridad inmediata:** conservar recorridos, corregir grabación GPS interrumpida al bloquear o cerrar la app, confirmar realmente el estado de la nube y evitar indicaciones SOS engañosas.
- URL de la web informada por el usuario: https://proyectmtb.netlify.app/ . En la última comprobación no se pudo recuperar su contenido; no afirmar que coincide con GitHub sin inspeccionarlo.

## B. Estado real por entrega
| Trabajo | Ubicación | Estado real |
|---|---|---|
| Base web anterior, mapa Leaflet, telemetría, Laboratorio, Historial, GPX, BikeFit, Ghost y Escuadrón | \`main\` | Código existente; muchas funciones requieren pruebas reales |
| Coordinación de IAs | PR #1 fusionado en \`main\` | Documentación, no cambia código de aplicación |
| Reparación GPS web, reinicio de sesión, cálculo temporal, SOS sin coordenadas ficticias, fallos de guardado | [PR #2](https://github.com/fernandezbjuanma-wq/proyectmtb/pull/2) | Borrador, sin pruebas con hardware ni merge |
| IndexedDB checkpoints GPS, recuperación interrumpida, estadísticas mensuales, comparador de rutas, privacidad básica | [PR #3](https://github.com/fernandezbjuanma-wq/proyectmtb/pull/3) | Borrador; depende del PR #2; no probado en dispositivos |
| Prototipo Android con foreground service, SQLite, controles nativos y GPX básico; bosquejo de reglas Firebase | [PR #4](https://github.com/fernandezbjuanma-wq/proyectmtb/pull/4) | **EXPERIMENTAL**; depende del PR #3; no compilado ni probado; NO despliegue de reglas |
| Netlify + reproductor/scrubber de Antigravity | Copia local de Antigravity (según usuario) | No se encontró en \`main\` o ramas de trabajo publicadas al revisar |
| Diseño de Claude | Trabajo independiente de Claude | Pendiente de que el usuario comparta el artefacto elegido y apruebe la integración |

**Dependencias GitHub:** PR #4 se basa en PR #3, que se basa en PR #2; no fusionar fuera de orden y revisar conflictos con el trabajo local antes de llevar nada a \`main\`.

## C. Novedades (bitácora única)
### 28/10/2026 — diagnóstico GPS web
- El sitio está alojado en Netlify, pero una página web/PWA no puede garantizar seguimiento GPS con el teléfono bloqueado o el navegador cerrado.
- Mantener audio silencioso, Screen Wake Lock y MediaSession **no crea un servicio GPS nativo**. Netlify es hosting web, no motor de localización en segundo plano.
- El usuario probó y observó pérdida de grabación; problema **NO resuelto en su despliegue público**.

### 28/10/2026 — PR #2: correcciones propuestas del código web
- Evitar duplicar \`watchPosition\`, guardar su ID y ejecutar \`clearWatch\` al finalizar.
- Reiniciar métricas, track, segmentos y contadores al comenzar otra salida.
- Tiempo en movimiento basado en timestamps GPS y tratamiento de huecos.
- Desnivel acumulado separado de cálculo de pendiente; pendiente validar filtros con GPX reales.
- Mensajes SOS con última posición conocida (no inventada) y aclaración de envío **manual** por WhatsApp.
- Guardado lleno: avisar y ofrecer exportar GPX, no borrar puntos silenciosamente.
- Sincronización: contador solamente de intentos exitosos reportados; **Firestore offline puede resolver operaciones desde caché sin confirmación remota**.

### 28/10/2026 — PR #3: seis áreas de mejora
- \`mtb-store.js\`: IndexedDB local, checkpoints por punto, borrador activo y recuperación opcional; no reactivar GPS automáticamente. Existe una limitación de cuota/cierre forzado, requiere pruebas.
- \`mtb-core.js\`: Haversine, tiempo movimiento, filtro de altitud, estadísticas por mes, GPX y comparación global de recorridos coincidentes (no comparador de segmentos parciales).
- \`tests/mtb-core.test.cjs\`: pruebas automatizadas para Node, sin dependencias adicionales. Se verificó sintaxis JavaScript y comprobaciones aisladas; no pruebas de navegador ni CI afirmadas.
- Historial: resumen mensual y migración no destructiva de sesiones. Borrado revisado.
- Escuadrón: consentimiento inicial, sanitización de nombres y limpieza de suscripciones; **la seguridad de Firestore del lado servidor sigue sin verificar**.
- No se modificó la estética favorita de Claude ni el reproductor de Antigravity.

### 28/10/2026 — PR #4: inicio solución Android y nube
- Directorio \`android/\`: estructura Gradle experimental, \`MainActivity.kt\`, \`TrackingService.kt\`, \`TrackDatabase.kt\`, \`GpxExport.kt\`, manifest.
- El servicio Android tipo \`location\` inicia GPS con notificación y escribe posiciones en SQLite; este esquema es la dirección correcta para continuar con pantalla apagada, sujeto a permisos y pruebas.
- WebView usa https://proyectmtb.netlify.app/; los botones de tracking web y Android **todavía NO están coordinados**. Hay riesgo de registrar dos sesiones. **NO es APK terminado**.
- Exportación nativa inicial comparte texto GPX; falta exportar un archivo GPX real.
- \`firebase.rules\` contiene ejemplo de **denegación por defecto** para actividades por usuario autenticado. **NO DESPLEGAR** hasta migrar cliente/colecciones: bloquearía al cliente antiguo.
- No se pudo confirmar desde aquí la configuración activa del proyecto Firebase ni acceder al contenido público de Netlify.

### 28/10/2026 — limpieza documental
- Se concentra el trabajo en **este mismo \`ROADMAP_FUTURO.md\`**. Se retiran documentos de informes redundantes de la rama de limpieza.
- \`AGENTS.md\` y \`CLAUDE.md\` quedan como punteros técnicos, sin almacenar avances divergentes.
- Todos los documentos retirados son recuperables mediante el historial y los respaldos de GitHub.

## D. Lista única de pendientes priorizados
### P0 — Antes de utilizarlo como grabador GPS confiable
- [ ] Compilar el prototipo Android y resolver errores de Kotlin/Gradle/manifest; generar e instalar APK de prueba.
- [ ] Comprobar permisos de ubicación y restricciones de servicio en Android actual con interacción explícita del usuario.
- [ ] Integrar UI web y servicio nativo con **una sola** fuente de tracking (no doble GPS), estado visible y control seguro de inicio/fin.
- [ ] Escribir y recuperar tracks SQLite aun si se suspende/cierra WebView; convertir exportación a archivo GPX verificable y restaurarlo en Historial.
- [ ] Probar pantalla bloqueada, otras apps, pérdida de internet, modo ahorro de batería, interrupciones GPS, reinicio de proceso y cierre forzado. **Forzar detención desde Ajustes puede parar el servicio.**
- [ ] Comprobar que el guardado web IndexedDB no pierde puntos y maneja correctamente conflictos multi-pestaña, cuotas y borradores.
- [ ] Verificar Netlify real con acceso a contenido publicado y comparar versión desplegada con GitHub/Antigravity antes de integrar.
- [ ] Probar rutas consecutivas sin mezcla de GPS y comprobar timeouts, precisión y distancias sobre GPX conocido.

### P1 — Nube, privacidad y recuperación
- [ ] Identificar el proyecto Firebase real; datos de \`FIREBASE_DEFAULT_CONFIG\` en web son demostrativos. No compartir secretos de administración.
- [ ] Habilitar Firebase Auth, definir aislamiento por UID y migrar con copia de seguridad de \`actividades_mtb\` a \`usuarios/{uid}/actividades/{id}\`.
- [ ] Probar reglas restrictivas en emulador antes de publicar. Revisión especial de \`escuadron_salas\`: autenticación, miembros autorizados, vencimiento, desconexión y control de retención de ubicación.
- [ ] Separar estados UI: guardado local / pendiente de envío / confirmado por servidor. No confundir escritura en caché con entrega real.
- [ ] Exportar/restaurar el Historial completo para proteger los entrenamientos y detectar duplicados de sincronización.
- [ ] Comprobar que recursos necesarios funcionan desconectados; los MP3 offline mencionados en el código web no aparecen en el árbol GitHub inspeccionado.
- [ ] Revisar uso de plantillas HTML dinámicas con datos de usuarios/Firestore restantes y errores asíncronos.
- [ ] No habilitar localización compartida como característica de seguridad hasta verificar reglas reales de acceso.

### P2 — Producto, diseño y análisis
- [ ] Importar y validar el diseño de Claude que el usuario prefirió, sin eliminar funciones.
- [ ] Integrar el scrubber de Antigravity después de comparar lo publicado con las ramas existentes.
- [ ] Optimizar ClimbPro por distancia acumulada real sobre el track y desnivel filtrado.
- [ ] Desarrollar mapas offline autorizados (tiles/archivos/licencia y cuotas) y trackback diferenciando huella inversa de rutas transitables.
- [ ] Mejorar comparador global y extenderlo a segmentos equivalentes con validación robusta.
- [ ] Configuración de panel Radar Live y coach de voz offline; esclarecer límites de audio ducking Spotify.
- [ ] Mejoras en garaje, mantenimiento y progreso mensual, señalando los parámetros estimados.
- [ ] En Laboratorio, dejar claro que Watts, TSS/IF, calorías, hidratación y recomendaciones son **estimaciones**, salvo mediciones con sensor.

## E. Roadmap de funcionalidades (visión vs evidencia)
**Quince áreas del roadmap histórico:** UI de 4 pestañas; GPS y keep-alive; mapas especializados; Laboratorio; nube offline; exportación Strava; telemetría de Escuadrón; presión y coach; SOS/detección de caídas; BikeFit; segmentos privados; Ghost Pacer; voz con ducking; odómetro; ClimbPro.

El código de muchas de estas funciones existe, **pero no está certificado** para uso en campo; no asumir "100% comprobado". Pueden usarse como base para la V2 sin reescritura total.

**Ocho mejoras V2 aprobadas como dirección:** (1) mapas offline y volver al inicio, (2) Radar Live personalizable, (3) ClimbPro mejorado, (4) coach de voz, (5) comparador de recorridos, (6) garaje/mantenimiento, (7) Escuadrón/seguridad, (8) desafíos/progreso. Se implementan por etapas cuando el usuario lo indique, sin asignación autónoma a otras IAs.

## F. Diseño y decisiones ya tomadas
| Decisión | Estado |
|---|---|
| Orden de 4 pestañas fijo | APROBADO |
| Organización básica del antiguo boceto de ChatGPT | ACEPTADA solo como estructura |
| Estética del antiguo boceto de ChatGPT | NO adoptada |
| Diseño visual realizado por Claude | Favorito del usuario, falta archivo/capturas y aprobación de integración |
| Antigravity como entorno de trabajo del usuario | MANTENER |
| Colaboración ChatGPT/Antigravity/Claude | Solo bajo tareas encargadas explícitamente por el usuario |
| GitHub como espacio de versiones y revisiones | APROBADO |
| Nunca cambiar main ni respaldos sin revisión y aprobación | REGLA DE SEGURIDAD |
| PWA web vs solución Android para GPS bloqueado | Seguimiento nativo en estudio, sin pruebas terminadas |
| Fuente/licencia de mapas offline y backend privado | PENDIENTE |

**Distribución de pestañas:** Preparación (GPX, mapas descargados, perfiles, garaje y ajustes); Radar Live (mapa, velocidad, GPS, grabación, ClimbPro, SOS); Laboratorio (entrenamiento, elevación, potencia estimada, comparaciones); Historial (actividades, sincronización, récords y evolución). Priorizar legibilidad bajo sol, funcionamiento sin red y claridad de fallos y datos estimados.

## G. Tecnología y guía de integración
**Web actual:** HTML/CSS/JS en \`index.html\` (~4200 líneas al estado original), Service Worker \`sw.js\`, \`manifest.json\`, Leaflet/GPX, Firebase SDK y datos en localStorage. En los PRs futuros hay módulos \`mtb-core.js\` y \`mtb-store.js\`.

**Android experimental:** carpeta \`android/\`, Kotlin/Gradle/SQLite. Abrir en Android Studio, revisar \`android/app/build.gradle.kts\`, compilar y corregir según SDK actual; conceder permisos con gesto voluntario, revisar restricciones actuales de Android para servicios foreground, conectar TrackDatabase con controles UI, exportar GPX como archivo y verificar en dispositivo. No dejar dos grabadores a la vez.

**Firebase:** el frontend antiguo usa colecciones globales sin usuario autenticado. El archivo \`firebase.rules\` del PR #4 es una propuesta sin despliegue: aplicar recién después de migrar cliente y datos, con pruebas de reglas y copias. Los estados de nube deben distinguir caché vs confirmación remota.

**Netlify:** aloja la web, no mantiene servicios GPS del navegador en background ni administra automáticamente las actividades. Revisar URL y logs de despliegue solo con acceso autorizado.

## H. Protocolo breve de trabajo y validación
1. El usuario asigna una tarea. La IA consulta **este documento** y el código efectivo, comprueba \`main\` y PRs abiertos.
2. Antes de cambiar funcionalidad, crear rama temática desde la versión correcta; conservar respaldos.
3. Codificar y ejecutar pruebas sintácticas/unitarias y, cuando corresponda, ensayos móviles. Identificar lo no probado.
4. Abrir PR con descripción técnica y pasos de prueba. **No fusionar sin aprobación del usuario.**
5. Registrar novedades, decisiones, errores, pruebas y tareas pendientes **aquí mismo**, con fecha y enlace al PR. **NO crear un informe .md nuevo por tarea.**
6. No publicar contraseñas, teléfonos, rastros personales, claves privadas ni ubicaciones sensibles en un repositorio público.
7. No prometer SOS automático, GPS continuo en navegador cerrado ni sincronización confirmada sin evidencia.
8. Si las otras IAs tienen cambios locales, evitar pisarlos y solicitar que se contrasten antes de integrar.

### Plantilla de entrada para nuevas tareas (agregar aquí)
\`AAAA-MM-DD | Tarea | Rama/PR | Cambios verificables | Pruebas realizadas | Límites | Pendientes | Decisión del usuario\`.


## J. Equipo de desarrollo, responsables y revisión cruzada — 28/10/2026
**Regla:** el dueño de una tarea la implementa; la IA contraria revisa el PR; el usuario autoriza merge. Ninguna IA puede iniciar la otra sesión o trabajar espontáneamente solo por aparecer aquí. La creación de tareas no consume créditos ni inicia Antigravity automáticamente. Los comentarios y PR se consultan al abrir el repositorio.

**Se verificó en main (SHA 1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7)** que Antigravity ya publicó Netlify/scrubber (commit d3645e0), integró parte de arreglos GPS (7622a0e) y actualizó nube/backup JSON (1e8ccd0). Las ramas y PRs antiguos deben compararse con esos avances, para evitar duplicados. La grabación GPS con pantalla bloqueada sigue NO resuelta/validada: la PWA no garantiza ejecución en background y el prototipo Android del PR #4 no es APK probado.

### Distribución amplia — GitHub Issues
| ID | Prioridad | Tarea | Implementa | Revisa | Issue |
|---|---|---|---|---|---|
| MTB-01 | P0 | Servicio GPS Android y SQLite | ChatGPT | Antigravity | #6 |
| MTB-02 | P0 | APK Android, permisos y una sola fuente GPS | Antigravity | ChatGPT | #7 |
| MTB-03 | P0 | Checkpoints web, recuperación, migración IndexedDB | ChatGPT | Antigravity | #8 |
| MTB-04 | P0 | Validación GPS con pantalla apagada y sin conexión | Antigravity | ChatGPT | #9 |
| MTB-05 | P0 | Firebase Auth, reglas privadas y migración | ChatGPT | Antigravity | #10 |
| MTB-06 | P0 | Sincronización real, estados de nube y diagnóstico | Antigravity | ChatGPT | #11 |
| MTB-07 | P1 | Escuadrón, consentimiento, caducidad y SOS | ChatGPT | Antigravity | #12 |
| MTB-08 | P1 | Mapas offline y volver al punto de partida | Antigravity | ChatGPT | #13 |
| MTB-09 | P1 | Distancia, altitud, potencia/TSS/IF estimados | ChatGPT | Antigravity | #14 |
| MTB-10 | P1 | Auditar Netlify, PWA y scrubber publicado | Antigravity | ChatGPT | #15 |
| MTB-11 | P2 | Comparador de rutas, segmentos y récords | ChatGPT | Antigravity | #16 |
| MTB-12 | P2 | ClimbPro, coach de voz y Radar Live | Antigravity | ChatGPT | #17 |
| MTB-13 | P2 | Historial, backups, progresos y mantenimiento | ChatGPT | Antigravity | #18 |
| MTB-14 | P2 | Integración diseño Claude cuando el usuario lo apruebe | Antigravity | ChatGPT | #19 |
| MTB-15 | P1 | CI, regresión, pruebas Firebase y almacenamiento | ChatGPT | Antigravity | #20 |
| MTB-16 | P1 | Resolver conflictos con ramas PR #2 a #5 | Antigravity | ChatGPT | #21 |

**P0 primero:** MTB-01/02/03/04, después MTB-05/06, con MTB-10/16 para integración sin conflictos. Tareas que tocan \`index.html\` se coordinan mediante PR pequeños y rebase sobre \`main\` actualizado. No usar como base estable el commit antiguo de los PR.

**Prueba y revisión recíproca:** quien implementa publica una rama/PR vinculado a issue, explica tests de verdad, evidencias, limitaciones y qué no probó. La otra IA revisa diff, deja comentarios de riesgo, detecta regresiones y solicita cambios; implementador corrige y se revisa nuevamente. **Ningún merge ni despliegue de datos/reglas** sin aprobación del usuario.

**Estado de arranque:** se crearon las 16 issues como propuestas de trabajo. No están implementadas por su creación y no se ha activado ningún agente automático. Claude mantiene su trabajo de diseño independiente; no se le transfieren tareas sin solicitud del usuario.


## K. Backlog ampliado de mejoras — 28/10/2026
**Se agregaron 12 issues nuevas, MTB-17 a MTB-28**, a las 16 anteriores. **Total: 28 tareas.** Cada tarea tiene responsable de desarrollo y la IA contraria revisa el pull request. Esto es una **propuesta de asignación en GitHub**, no una ejecución automática ni una asignación a una cuenta de GitHub de Antigravity.

**Regla de prioridad:** no iniciar trabajos P2 ni rediseños mientras GPS Android/registro de actividad/copia local y estados de nube P0 no hayan superado sus pruebas. Ante conflicto, primero resolver continuidad de GPS y datos.

| ID | Prioridad | Mejora nueva | Implementa | Revisa | Issue |
|---|---|---|---|---|---|
| MTB-17 | P1 | Chequeo pre-salida (GPS, permisos, batería, recursos offline) | Antigravity | ChatGPT | [#23](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/23) |
| MTB-18 | P1 | Privacidad de rutas para compartir y exportación protegida | ChatGPT | Antigravity | [#24](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/24) |
| MTB-19 | P1 | IDs de sesiones, deduplicación y multi-pestaña | ChatGPT | Antigravity | [#25](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/25) |
| MTB-20 | P2 | Biblioteca GPX, búsqueda, etiquetas y favoritos sin internet | Antigravity | ChatGPT | [#26](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/26) |
| MTB-21 | P2 | Entrenamientos por RPE, duración y zonas con datos reales | ChatGPT | Antigravity | [#27](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/27) |
| MTB-22 | P2 | Garaje con múltiples bicicletas y mantenimientos | Antigravity | ChatGPT | [#28](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/28) |
| MTB-23 | P1 | Diagnósticos de errores locales sin revelar ubicaciones | ChatGPT | Antigravity | [#29](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/29) |
| MTB-24 | P2 | Waypoints y desvíos con regreso asistido | Antigravity | ChatGPT | [#30](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/30) |
| MTB-25 | P1 | Rendimiento, consumo de batería y memoria | ChatGPT | Antigravity | [#31](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/31) |
| MTB-26 | P2 | Compatibilidad GPX, TCX y evaluación FIT | Antigravity | ChatGPT | [#32](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/32) |
| MTB-27 | P1 | Pruebas de desconexión, cuota y recuperación extrema | ChatGPT | Antigravity | [#33](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/33) |
| MTB-28 | P1 | Entorno de staging Netlify, versiones y rollback | Antigravity | ChatGPT | [#34](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/34) |

### Desarrollo sin instrucciones repetidas
1. Cada IA revisa el **único** \`ROADMAP_FUTURO.md\`, GitHub Issues y PRs cuando inicia su sesión o trabajo autorizado.
2. Selecciona **primero una tarea de su responsabilidad** cuya dependencia esté cumplida. No trabaja simultáneamente en el mismo archivo que otra IA sin coordinar cambios por PR.
3. Al completar la implementación, abre PR; **la IA contraria revisa** código, pruebas, riesgos de seguridad y consistencia con el diseño y exige correcciones, sin fusionar directamente.
4. Registra estado real, pruebas realizadas y pendientes en este roadmap. **No crear otro Markdown de informe por tarea.**
5. El usuario aprueba merge y despliegue; GitHub Issues no activa por sí solo Antigravity, ChatGPT ni una revisión automática.
6. Prioridad en continuidad del GPS: [PR #22](https://github.com/fernandezbjuanma-wq/proyectmtb/pull/22) compiló APK Android de prueba por CI, pero **falta prueba física de bloqueo, salida de la app y exportación real**. No llamar a eso «solucionado» hasta demostrarlo en dispositivo y validar que Netlify sigue funcionando.

### Elección de entorno
- **Chat**: decisiones, consultas, revisión puntual de estado y prioridades.
- **Work**: trabajos multi-etapa con archivos, aplicaciones, navegador y entrega verificable, cuando el usuario dispone del modo y concede acceso.
- **Codex**: desarrollo, corrección de código, compilaciones, ejecución de pruebas, ramas y PRs; especialmente si se trabaja en la carpeta local de Windows.
- Para conservar contexto, usar un proyecto de ChatGPT y GitHub como repositorio central; **Work web no tiene acceso automático a los archivos locales**, la app de escritorio puede solicitar permisos para acceder a carpetas.
- El usuario no tiene que asignar manualmente cada issue, pero una sesión o automatización autorizada debe iniciar la ejecución; no se ha configurado un agente Antigravity que ejecute issues por sí solo.


## I. Referencia histórica y recuperación
Los archivos de notas antiguos eliminados en la rama de consolidación permanecen recuperables en GitHub por historial de commits y en la rama de referencia:
[Estado previo a consolidación](https://github.com/fernandezbjuanma-wq/proyectmtb/tree/36fbd4119bb4c27c6fc0e62730a1f735fcca4bd0).

### Anexo: roadmap original (conservado íntegro como referencia histórica)

> **Nota:** se transcribe la visión original tal como fue escrita. Sus afirmaciones de "100% completo" no deben interpretarse como pruebas funcionales.

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
