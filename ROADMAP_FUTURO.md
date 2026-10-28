# Radar Táctico MTB — organización y roadmap central

**Estado: EN DESARROLLO.** La existencia de código, un APK o un check exitoso no equivale a aceptación de la función.

**Revisión:** 28/10/2026 · **Base auditada:** [main 1e8ccd0](https://github.com/fernandezbjuanma-wq/proyectmtb/commit/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7).
**Alcance:** inventario completo del árbol de main, documentación, 28 issues, 5 PR previos y estado de la copia local. Esta propuesta organiza el seguimiento; modifica únicamente este roadmap.

## Índice

1. [Cómo trabajar y leer el repositorio](#1-cómo-trabajar-y-leer-el-repositorio)
2. [Estado real y hallazgos](#2-estado-real-y-hallazgos)
3. [Las 28 tareas](#3-las-28-tareas)
4. [Orden de ejecución y dependencias](#4-orden-de-ejecución-y-dependencias)
5. [Pull requests e integración](#5-pull-requests-e-integración)
6. [Pruebas y aceptación](#6-pruebas-y-aceptación)
7. [Decisiones, diseño y planes históricos](#7-decisiones-diseño-y-planes-históricos)
8. [Bitácora y handoff](#8-bitácora-y-handoff)
9. [Visión original conservada](#9-visión-original-conservada)

## 1. Cómo trabajar y leer el repositorio

### Reglas operativas

- El usuario dirige el proyecto y aprueba integraciones y despliegues. Trabajar en ramas temáticas y abrir PR; no hacer push directo a main ni habilitar auto-merge como parte de una propuesta.
- Vincular una issue existente antes de cambios funcionales relevantes. Las 28 tareas ya existen: no recrearlas.
- Registrar avances, decisiones nuevas, pruebas y handoffs en ROADMAP_FUTURO.md. No crear informes Markdown adicionales. Los documentos previos se conservan como referencias; esta propuesta no aplica sus eliminaciones.
- Los roles ChatGPT/Antigravity/Claude son orientativos. Escribir una asignación no inicia otra IA ni demuestra que revisó algo. Los subagentes de ChatGPT no sustituyen la revisión cruzada de Antigravity.
- Conservar cuatro áreas: Preparación, Radar Live, Laboratorio e Historial. La estructura está aprobada; la apariencia final requiere la referencia de Claude y aprobación. No rediseñar por defecto.
- Preservar modificaciones locales y ramas de respaldo. No tocar datos, configuración Firebase, reglas activas, credenciales o permisos sin evaluación específica.
- No publicar coordenadas, teléfonos, contactos SOS, credenciales ni tracks reales. Usar fixtures sintéticos para pruebas.
- Mantener límites visibles: la PWA puede suspender GPS con pantalla bloqueada; WhatsApp requiere intervención humana; detección de caídas sin validación de campo; potencia/TSS/calorías y desgaste son estimaciones cuando no provienen de medición.

### Mapa completo de main

El árbol auditado tiene **15 archivos en la raíz: 10 Markdown y 5 archivos de aplicación/datos**, sin carpetas. Android, módulos de datos/cálculos, pruebas y workflows existen solo en propuestas de ramas.

| Archivo / grupo | Función y tratamiento |
| --- | --- |
| [index.html](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/index.html) | SPA con HTML/CSS/JavaScript, 7.013 líneas; GPS, mapas, datos, nube, SOS y cuatro áreas. Antes de refactorizar, inventariar funciones/IDs y preparar regresión. |
| [sw.js](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/sw.js) | Service Worker y caché PWA; revisar en #15/#34. |
| [manifest.json](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/manifest.json) | Instalación PWA, nombre, colores e icono; revisar codificación y recursos. |
| [netlify.toml](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/netlify.toml) | Publicación de raíz, redirección SPA y encabezados. El archivo no demuestra qué commit está desplegado. |
| Archivo GPX de referencia en raíz | Tratar como dato potencialmente sensible; no se abrieron ni reprodujeron coordenadas en esta auditoría. No usar en CI sin revisión. |
| [AGENTS.md](AGENTS.md), [CLAUDE.md](CLAUDE.md) | Reglas para agentes; leer antes de intervenir. |
| [ROADMAP_FUTURO.md](ROADMAP_FUTURO.md) | Entrada al estado operativo, tareas, prioridades, evidencia y handoffs. |
| [README_COLABORACION_IA.md](README_COLABORACION_IA.md), [PROTOCOLO_HANDOFF.md](PROTOCOLO_HANDOFF.md) | Contexto y protocolo anteriores; para avances nuevos rige el seguimiento central de este roadmap. |
| [ESTADO_ACTUAL.md](ESTADO_ACTUAL.md) | Inspección histórica y registro de nube; contrastar contra código/commit, no asumir vigencia de todos sus párrafos. |
| [DECISIONES.md](DECISIONES.md), [DISENO_MTB.md](DISENO_MTB.md) | Decisiones y límites visuales. Se resumen sin inventar nuevas aprobaciones en sección 7. |
| [PLAN_DESARROLLO.md](PLAN_DESARROLLO.md) | Ocho frentes V2 históricos; su numeración no equivale a las 28 tareas nuevas. Ver sección 7. |
| [HANDOFF_CHATGPT_2026-10-28.md](HANDOFF_CHATGPT_2026-10-28.md) | Evidencia histórica anterior al merge #2; sus frases “no fusionado” no describen el main actual. |

**Orden de lectura:** AGENTS → este roadmap → issue elegida → código y diff del PR. Además, cumplir la lectura inicial que exige AGENTS: README_COLABORACION_IA.md, ESTADO_ACTUAL.md, DISENO_MTB.md, PLAN_DESARROLLO.md, DECISIONES.md y PROTOCOLO_HANDOFF.md. Se leyeron para esta auditoría; el roadmap aporta el estado operativo actualizado.

No se movieron archivos: las rutas de la SPA, del Service Worker y de Netlify deben conservarse hasta una refactorización funcional con pruebas (#21/#15). Tampoco se añadió README ni un segundo inventario Markdown.

### Estados que se pueden afirmar

| Estado | Evidencia mínima |
| --- | --- |
| Pendiente | Issue con alcance/aceptación, sin prueba de implementación completa. |
| Propuesto en PR / parcial | Commit y diff identificables; falta integrar, revisar o completar criterios. |
| En main, sin validar | Presencia comprobada en la versión auditada; no implica funcionamiento real ni despliegue. |
| Verificado por prueba identificada | Resultado, comando/escenario, commit y entorno; indicar qué no cubre. |
| Aceptado por usuario | Revisión cruzada cuando corresponde, criterios comprobados y decisión expresa del usuario. |

## 2. Estado real y hallazgos

**Resumen:** 28 issues abiertas: **6 P0, 13 P1 y 9 P2**. Catorce proponen implementación ChatGPT y catorce Antigravity. Al corte no tienen etiquetas, assignees técnicos ni milestones de GitHub: las prioridades/roles están en títulos y cuerpos; la tabla siguiente los hace consultables sin cambiar asignaciones.

**main es la aplicación web.** No contiene android/, tests/, package.json, módulos mtb-core/mtb-store ni workflows CI. El PR #2 sí fue integrado en el merge [7622a0e](https://github.com/fernandezbjuanma-wq/proyectmtb/commit/7622a0e1d0eefe900ccb0c2742b023707737c672); no contarlo como pendiente. Los PR #3/#4/#5/#22/#35 siguen separados.

| Área | Evidencia en main | Estado y tarea |
| --- | --- | --- |
| GPS y pantalla bloqueada | [watchPosition](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/index.html#L3428) y [WakeLock/audio](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/index.html#L2792); no servicio Android en el árbol | PWA sin garantía de continuidad. Android propuesto en #22/#35; #6/#7/#9. |
| Guardado de salida | [Puntos en memoria](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/index.html#L3899) y [persistencia al finalizar](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/index.html#L4317) | Sin diario incremental/recuperación propia en main; #8/#25/#33. |
| Historial corrupto | [obtenerActividadesGuardadas y guardarEnHistorial](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/index.html#L5306) | JSON ilegible se convierte en lista vacía; un guardado posterior puede reemplazar el contenido. Validar forma y resguardar antes de escribir; #8. |
| Nube privada | [Inicialización](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/index.html#L4893), [consulta global](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/index.html#L5052), [escritura global](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/index.html#L5226) | Configuración demo y sin Auth/separación por UID en el cliente auditado. Las reglas activas no se inspeccionaron: privacidad de servidor no demostrada, sin afirmar exposición real; #10/#11/#12. |
| Integridad de backup remoto | [Reducción de puntos](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/index.html#L5221) | Si hay más de 500, la copia enviada conserva uno de cada tres. El original local no cambia; recuperar desde nube no garantiza la traza íntegra. #11/#18/#25. |
| Confirmación de nube | [Diagnóstico .get()](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/index.html#L5007) y estados de persistencia/red | Leer caché local o recibir online no demuestra conexión/confirmación del servidor. Separar local, en cola y confirmado; #11. |
| Restauración JSON | [Importador](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/index.html#L5126) | Aplica odómetro/segmentos antes de persistir actividades; BikeFit exportado no se restaura. Marca sincronizado heredada no acredita destino Firebase. #8/#11/#18. |
| Historial nube completo | [Descarga limit(100)](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/index.html#L5052) y [listado limit(30)](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/index.html#L5286) | Sin paginación: “todas” no demuestra completitud. #11/#18. |
| Datos importados / Escuadrón | [Historial innerHTML](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/index.html#L5378) y [miembros](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/index.html#L6508) | Campos importados/remotos pueden interpretarse como HTML; validar esquema y representar texto sin ejecutar markup. #12/#18. |
| Sesiones de Escuadrón | [onSnapshot](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/index.html#L6497) y [desconexión](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/index.html#L6588) | No se conserva/cancela el listener; identidad por nombre y expiración no acreditada. #10/#12. |
| Mensajes de éxito | [Guardado/subida](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/index.html#L4345) y [voz posterior](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/index.html#L4371) | Puede anunciar guardado/sincronización pese a fallo local o subida pendiente. #8/#11. |
| Versionado de PWA | [Caché fija y cache-first](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/sw.js#L2) | Riesgo de servir HTML anterior tras publicación. Activación borra cachés ajenas al nombre actual sin limitar prefijo. #15/#34. |
| Recursos offline | [Precache de audios](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/sw.js#L4) y árbol main | Tres MP3 referenciados ausentes; no hay paquete controlado de tiles. No afirmar voz/mapas totalmente offline. #13/#15/#17. |
| Instalación PWA | [Manifest](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7/manifest.json#L2) | Nombre con codificación defectuosa e icono externo. #15. |
| Despliegue / protección | Configuración Netlify; metadata de main indica protected:false al corte | No se comprobó el sitio publicado ni se cambiaron protecciones. Staging, versión visible y rollback requieren #15/#34 y aprobación de despliegue. |

Se reconocen correcciones ya presentes: cancelación del watch GPS al terminar, SOS sin coordenadas ficticias y con envío asistido, aviso ante cuota local sin descartar puntos, contador de sincronizaciones basado en resultado de la operación. Deben conservarse al reconciliar PR antiguos.

### Contradicciones documentales resueltas para el seguimiento

- El “100 % completado” del roadmap original es una **declaración histórica sin aceptación demostrada**. Se conserva al final para trazabilidad, no como estado vigente.
- El handoff anterior al merge dice “no fusionado”; DECISIONES D-012 y el commit de merge prueban integración de #2.
- ESTADO_ACTUAL conserva riesgos antiguos de coordenadas ficticias y después registra su corrección: el estado operativo se determina en el código de main y con regresión.
- PLAN_DESARROLLO y README proponen abrir issues/arrancar un PR de documentación que ya tiene antecedentes. Usar las issues actuales.
- El protocolo anterior repartía avances entre varios MD. El seguimiento nuevo se centraliza aquí, como requieren las issues. Los documentos previos permanecen disponibles.

## 3. Las 28 tareas

La identidad canónica es **el número de issue**. MTB-01…MTB-28 son los IDs de las tareas actuales, no los ocho frentes históricos. Cada issue conserva sus criterios completos; las dependencias se expresan abajo como números de issue, normalizando los IDs antiguos del cuerpo.

| Tarea | P | Issue y alcance | Implementa → revisa | Dependencias / antecedentes | Estado observado y siguiente acción |
| --- | --- | --- | --- | --- | --- |
| MTB-01 | P0 | [#6](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/6) Motor GPS nativo persistente y recuperación de sesión | ChatGPT → Antigravity | #7; antecedente PR #4 | Parcial en PR #22 y #35. Revisar política GPS, SQLite, pausa/reanudación y callbacks tras finalizar. |
| MTB-02 | P0 | [#7](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/7) Integración Android, APK y fuente única GPS | Antigravity → ChatGPT | #6; antecedente PR #4 | Parcial en PR #22. APK compilado; faltan fuente única integrada, permisos y ensayo físico. |
| MTB-03 | P0 | [#8](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/8) Autoguardado IndexedDB, restauración y migración sin pérdida | ChatGPT → Antigravity | Reconciliar PR #3 con main | Parcial en PR #3. Reconciliar con nube/scrubber de main; preservar historial corrupto y recuperar sesiones. |
| MTB-04 | P0 | [#9](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/9) Pruebas móviles de GPS y batería / aceptación de campo | Antigravity → ChatGPT | #6, #7, #8 | Pendiente de teléfono real. Registrar bloqueo 5/30/90 min, permisos, batería y recuperación. |
| MTB-05 | P0 | [#10](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/10) Firebase Auth + reglas privadas + migración de actividades | ChatGPT → Antigravity | Nube main; reglas PR #4 | Reglas propuestas en PR #4. Faltan Auth, pruebas entre usuarios y migración reversible; no desplegar reglas aisladas. |
| MTB-06 | P0 | [#11](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/11) Sincronización nube verificable y diagnóstico Netlify | Antigravity → ChatGPT | #10; nube main | Código en main, sin aceptación. Corregir estados de servidor/caché, reintentos y reducción silenciosa del track. |
| MTB-07 | P1 | [#12](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/12) Auditoría de privacidad Escuadrón y SOS | ChatGPT → Antigravity | #10, #11 | Cambios parciales en PR #3. Faltan consentimiento, expiración, listeners y seguridad de servidor. |
| MTB-08 | P1 | [#13](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/13) Mapas descargables offline y regreso por el recorrido | Antigravity → ChatGPT | #8, #9; proveedor/licencia | Pendiente. Elegir proveedor autorizado y verificar cobertura offline y backtrack. |
| MTB-09 | P1 | [#14](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/14) Precisión de altitud, distancia, potencia y carga de entrenamiento | ChatGPT → Antigravity | #8 | Motor parcial en PR #3. Probar distancias, desnivel y unidades; rotular estimaciones. |
| MTB-10 | P1 | [#15](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/15) Netlify, PWA e integración del scrubber de recorridos | Antigravity → ChatGPT | #8; despliegue actual | PWA/scrubber en main, sin aceptación completa. Verificar versión real, caché y aislamiento de reproducción. |
| MTB-11 | P2 | [#16](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/16) Comparador de rutas, segmentos y récords | ChatGPT → Antigravity | #14; PR #3 | Comparador parcial en PR #3. Validar geometría, sentido y tolerancias con datos sintéticos. |
| MTB-12 | P2 | [#17](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/17) ClimbPro real, entrenador de voz y accesibilidad de radar | Antigravity → ChatGPT | #13, #14; diseño | Funciones históricas no equivalen a aceptación. Resolver audios ausentes, perfil por distancia y referencia visual. |
| MTB-13 | P2 | [#18](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/18) Historial robusto: exportación/importación universal, estadísticas y mantenimiento | ChatGPT → Antigravity | #8, #11 | Backup en main y mejoras parciales en PR #3. Validar esquema, restauración atómica, BikeFit y paginación. |
| MTB-14 | P2 | [#19](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/19) Integración visual de Claude conservando funciones | Antigravity → ChatGPT | #7, #11; diseño Claude | Bloqueada por referencia visual autorizada/aprobada de Claude. Mantener las cuatro áreas. |
| MTB-15 | P1 | [#20](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/20) Pruebas automáticas CI y control de calidad de PRs | ChatGPT → Antigravity | #8, #10 (cobertura completa) | Tests parciales en PR #3 y CI Android en #22/#35. Iniciar validación básica; ampliar web/IndexedDB/Firebase. |
| MTB-16 | P1 | [#21](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/21) Integración y resolución de conflictos de ramas pendientes | Antigravity → ChatGPT | Transversal; aceptación por PR | Organización e integración transversal. Preservar trabajo local y reconciliar cada PR antes de aprobación. |
| MTB-17 | P1 | [#23](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/23) Chequeo pre-salida: GPS, permisos, batería, espacio y mapas | Antigravity → ChatGPT | #7, #9, #13 | Pendiente. Estados reales de permisos, GPS, red y cobertura; batería/espacio solo si la API los permite. |
| MTB-18 | P1 | [#24](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/24) Privacidad de recorridos: zonas sensibles y exportaciones seguras | ChatGPT → Antigravity | #10, #12, #18 | Pendiente. Redactar solo copia exportada; conservar original y probar rutas cortas/ida y vuelta. |
| MTB-19 | P1 | [#25](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/25) Integridad de sesiones: IDs estables, deduplicación y múltiples pestañas | ChatGPT → Antigravity | #6, #8, #10, #11 | Protección de cierre parcial en PR #35. Faltan IDs estables, idempotencia, pestañas y reconciliación. |
| MTB-20 | P2 | [#26](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/26) Biblioteca de rutas GPX totalmente local, etiquetas y favoritos | Antigravity → ChatGPT | #8, #13, #18 | Pendiente. Biblioteca local con búsqueda, duplicados y GPX inválidos; no confundir track con tiles. |
| MTB-21 | P2 | [#27](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/27) Planificador de entrenamiento ciclista por RPE, tiempo y zonas | ChatGPT → Antigravity | #14, #16, #18 | Planes históricos no equivalen a aceptación. Validar duración/RPE y diferenciar sensores de estimaciones. |
| MTB-22 | P2 | [#28](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/28) Garaje MTB multi-bicicleta y mantenimientos por componente | Antigravity → ChatGPT | #18 | Pendiente. Separar odómetros por bici, servicios y reseteos confirmados. |
| MTB-23 | P1 | [#29](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/29) Diagnóstico privado de errores, fallos GPS y sincronización | ChatGPT → Antigravity | #6, #8, #11, #20 | Pendiente. Registro local limitado, exportación sanitizada y sin transmisión automática. |
| MTB-24 | P2 | [#30](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/30) Waypoints, alertas de desvío y navegación de regreso asistida | Antigravity → ChatGPT | #13, #15, #23 | Pendiente. Waypoints offline, tolerancias y regreso por huella con límites explícitos. |
| MTB-25 | P1 | [#31](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/31) Auditoría de rendimiento: batería, memoria, mapas y escrituras | ChatGPT → Antigravity | #6, #7, #9, #20 | Pendiente. Medir latencia, memoria, almacenamiento y batería con umbrales cuantitativos. |
| MTB-26 | P2 | [#32](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/32) Compatibilidad importación y exportación GPX/TCX/FIT | Antigravity → ChatGPT | #18, #26 | GPX histórico parcial. Faltan fixtures GPX/TCX y evaluación de FIT/licencia; no inventar sensores. |
| MTB-27 | P1 | [#33](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/33) Pruebas de desconexión extrema y recuperación sin pérdida | ChatGPT → Antigravity | #8, #9, #20, #25 | Pendiente. Banco de fallos con tracks sintéticos; separar pruebas automatizadas de ensayos físicos. |
| MTB-28 | P1 | [#34](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/34) Publicación segura: staging Netlify, versionado y rollback comprobable | Antigravity → ChatGPT | #15, #21, #23 | Pendiente. Staging, commit visible, actualización de SW y rollback sin pérdida local. |

Todas siguen abiertas. “Parcial” describe una propuesta o código existente; ninguna fila acredita aceptación completa por el usuario.

## 4. Orden de ejecución y dependencias

Este orden es una **propuesta operativa de esta revisión**, no una nueva fecha comprometida ni una reasignación aprobada.

| Etapa | Trabajo que puede empezar | Condición para avanzar |
| --- | --- | --- |
| 0. Preparar revisión | #21 conciliación de ramas; #20 validación básica; contrato de IDs/estados de #25 | Snapshot de main/local, diff acotado, datos sintéticos y responsables de cada archivo. |
| 1A. GPS Android | #6/#7 sobre #22 y #35 | Un solo grabador, permisos/estado coherentes, SQLite/GPX, pausa y cierre correctos; compilar la versión exacta. |
| 1B. Guardado web | #8 recuperando módulos útiles de #3 | Checkpoints, historial corrupto, cuota, restauración y migración sin sobrescribir datos; no reemplazar el scrubber nuevo. |
| 1C. Nube privada | #10 → #11 | Auth + UID + reglas probadas + respaldo/migración antes de sincronización de producción. |
| 2. Aceptación del núcleo | #9 móvil, #20 cobertura web/Firebase y #25 integración de sesiones | Evidencia física y automatizada del mismo commit; correcciones y nueva revisión. |
| 3. Fiabilidad y operación | #12, #14, #15, #18; luego #13, #23, #29, #31, #33, #34 según dependencias | Consentimiento, restauración completa, métricas honestas, cache/versionado, fallos controlados y rollback. |
| 4. Ampliaciones | #16, #24, #17, #26, #28, #30, #27, #32; #19 cuando exista referencia aprobada | Respetar dependencias de la tabla y funciones existentes. No condicionar correcciones P0 al rediseño. |

**Destrabar el ciclo #6 ↔ #7:** acordar primero contrato de estados/permisos y fuente GPS; desarrollar motor e integración en partes revisables; aceptar ambas con pruebas integradas. No esperar a que una issue esté cerrada para iniciar la otra.

**#21 es transversal:** su dependencia “todas” no significa que la integración empiece al final. Revisar compatibilidad por PR desde ahora. La organización de este roadmap es un avance documental, no cierra #21.

**#20 empieza con validación básica:** ampliar cobertura cuando lleguen #8/#10; no esperar a cerrar ambas para detectar regresiones.

**Áreas para evitar pisarse:** #6 motor/SQLite; #7 Android/permisos/puente; #8 datos web; #10 Auth/reglas; #11 integración nube; #15 scrubber/SW; #19 visual. Coordinar cambios a index.html en #21, con inventario de funciones e IDs antes de refactorizar.

## 5. Pull requests e integración

Corte previo a esta propuesta: **5 PR abiertos, todos borradores**, sin revisiones GitHub registradas. La organización añade un PR documental independiente contra main. Los checks citados corresponden a esos commits; consultar de nuevo antes de integrar.

| PR | Base real → rama | Evidencia y tratamiento |
| --- | --- | --- |
| [#3](https://github.com/fernandezbjuanma-wq/proyectmtb/pull/3) | fix/gps-sos-datos-20261028 → feat/resiliencia-estadisticas-seguridad-20261028 | IndexedDB, métricas, historial, privacidad y comparación. Tests propuestos, sin checks/reviews registrados al corte. Reconciliar con nube/scrubber nuevos de main; rescatar módulos y diffs acotados. |
| [#4](https://github.com/fernandezbjuanma-wq/proyectmtb/pull/4) | rama de #3 → feat/android-background-gps-nube-segura-20261028 | Prototipo Android y reglas Firebase. Se solapa con #22 en 9 archivos Android. No integrar ambos motores ni desplegar reglas al cliente viejo. Separar propuesta Auth/reglas en #10. |
| [#5](https://github.com/fernandezbjuanma-wq/proyectmtb/pull/5) | rama de #4 → docs/roadmap-unico-20261028 | Consolidación documental que propone borrar 11 MD, algunos solo presentes en ramas. No aplicar por arrastre ni perder decisiones; reconciliar con este roadmap y los cambios de main. Aquí no se borran documentos. |
| [#22](https://github.com/fernandezbjuanma-wq/proyectmtb/pull/22) | main → feat/gps-android-grabacion-nativa-final-20261028 | Línea nativa más avanzada: servicio, SQLite, GPX y APK. Check android-debug exitoso en edaef402: [run 40758465010](https://github.com/fernandezbjuanma-wq/proyectmtb/actions/runs/40758465010). No demuestra teléfono ni nube/Historial integrado. |
| [#35](https://github.com/fernandezbjuanma-wq/proyectmtb/pull/35) | rama de #22 → fix/mtb-01-timestamps-gps-20261028 | Rechaza posiciones viejas/futuras/inválidas y protege cierre SQLite. Commit funcional 06a5ac0 compilado en [run 40764807561, intento 2](https://github.com/fernandezbjuanma-wq/proyectmtb/actions/runs/40764807561/attempts/2). Head documental 72ebfc8 también con android-debug exitoso: [run 40765630086](https://github.com/fernandezbjuanma-wq/proyectmtb/actions/runs/40765630086). CI compila/empaqueta; no ejecuta los 14 tests. Revisión Antigravity y SQLite/móvil pendientes. |

**Dependencias de rama:** #3 → #4 → #5 es una cadena; #22 parte de main y #35 apunta a #22. La base antigua fix/gps-sos de #3 ya tuvo merge en main mediante #2, pero eso no actualiza automáticamente los cambios de nube posteriores en #3.

**Plan de conciliación (#21):**

1. Preservar snapshot local y respaldos; comparar contra main exacto.
2. Usar #22+#35 como línea nativa propuesta, rescatar de #4 solo piezas útiles que no dupliquen el motor.
3. Recuperar de #3 el guardado/core/comparador en propuestas acotadas sobre main actual; comprobar nube, simulador y scrubber.
4. Llevar Auth/reglas/migración como unidad revisable (#10), con pruebas y plan de vuelta atrás.
5. Unificar novedades de roadmap de #3/#4/#5/#22/#35 y esta propuesta al integrar; ninguna versión antigua debe sobrescribir la matriz/bitácora nueva.
6. Resolver cada conflicto y ejecutar regresión; revisor de la otra IA deja evidencia y usuario decide merge. No cerrar ni borrar PR/ramas automáticamente.

El roadmap de #35 ya contenía avances nativos y hallazgos de guardado/nube: se incorporan aquí con atribución y límites. Este PR documental no incorpora su código.

## 6. Pruebas y aceptación

### Evidencia disponible, con alcance acotado

| Evidencia | Origen / resultado | Lo que no demuestra |
| --- | --- | --- |
| Lectura de main completo y revisión estática de rutas relevantes | Esta auditoría, commit 1e8ccd0; un script inline compila sin ejecutarlo; 238 IDs HTML sin duplicados | Funcionamiento de GPS, navegador, Firebase o recuperación real. |
| Compilación Android #22 | GitHub Actions, head edaef402, run enlazado en sección 5 | Continuidad al bloquear pantalla, consumo de batería, entrega de puntos al Historial web. |
| Política GPS #35 | PR declara 14 pruebas JUnit4 locales, Kotlin 2.0.21/JDK17; esta auditoría no las reejecutó. Check android-debug exitoso en el head documental 72ebfc8, sin ejecución de tests unitarios en CI | Concurrencia real de SQLite, fabricantes Android, notificaciones y ensayos físicos. |
| Casos de guardado/nube | Roadmap de #35 registra seis comprobaciones aisladas con Node y dobles de almacenamiento/Firebase; hallazgos contrastados con código en esta auditoría | Persistencia de navegador o reglas activas de servidor. |
| Inventario y enlaces de este roadmap | Verificar 28 filas únicas, prioridades/roles contra issues, dependencias, archivos y diffs antes de publicar | Cierre de issues ni aceptación funcional del producto. |

### Matriz pendiente del núcleo

| Escenario | Condiciones y evidencia requerida | Issues |
| --- | --- | --- |
| Android con pantalla bloqueada | 5/30/90 min; modelo, Android, ahorro de energía, número/tiempos de puntos y gaps, batería; no publicar coordenadas | #6/#7/#9/#31 |
| Permisos y ciclo de vida | Ubicación/notificaciones concedidas y denegadas; otra app; GPS apagado; proceso interrumpido; reabrir; Forzar detención con límite explícito | #7/#9 |
| SQLite y callback tardío | finish → record; dos helpers concurrentes; sesión inexistente/cerrada; notificación tras detener; pausa/reanudación | #6/#25 |
| Guardado web | Sin red, recarga/cierre, checkpoints, JSON corrupto o con forma incorrecta, cuota agotada y migración localStorage → IndexedDB | #8/#25/#33 |
| Backup y nube íntegros | Exportar/restaurar puntos completos, BikeFit y metadatos; archivos corruptos/duplicados; más de 100 actividades; cambiar destino Firebase | #11/#18 |
| Autenticación y seguridad | Dos usuarios no acceden a datos ajenos; reglas en emulador; migración reversible; no desplegar reglas aisladas | #10/#12/#20 |
| Reconexión y confirmación | Sin red → cola → confirmación servidor; fallo de reglas; dos pestañas; caché no presentada como conexión real | #11/#25/#33 |
| PWA y despliegue | Caché antigua → versión nueva, instalación, recursos offline faltantes, otras cachés del origen, commit visible y rollback | #15/#34 |
| Regresión existente | Iniciar/detener dos sesiones, GPX/simulador/scrubber adelante y atrás, mapa-métricas, SOS sin GPS, historial/importación | #8/#12/#15/#18/#20 |
| Privacidad y UX | HTML importado como texto, consentimiento/expiración Escuadrón, SOS asistido, datos estimados, pantalla pequeña y cuatro áreas | #12/#14/#19/#24 |

Para aceptar cada tarea: diff/commit identificados, pasos reproducibles, resultados y pruebas no hechas, revisión cruzada real, correcciones atendidas y decisión del usuario. Un check de compilación no cierra por sí solo una issue de producto.

## 7. Decisiones, diseño y planes históricos

### Decisiones conservadas de los documentos existentes

- D-001/D-002: cuatro áreas y orden conceptual aprobados.
- D-003/D-004: estética V1 de ChatGPT rechazada; diseño de Claude preferido pero artefacto visual pendiente de incorporar y aprobar.
- D-005/D-006: ocho líneas V2 como dirección; trabajo principalmente con Antigravity y colaboración ChatGPT/Claude. No son funciones finalizadas ni conexiones automáticas.
- D-007/D-008: GitHub como espacio común; revisión/aprobación humana antes de integrar propuestas.
- D-009: elección PWA/componente nativo requiere pruebas reales. Los PR #22/#35 son avance técnico propuesto, no aceptación de campo.
- D-010: proveedor/licencia offline y política de ubicación pendientes.
- D-011: arquitectura de nube híbrida Firestore + respaldo JSON APROBADA, con implementación parcial en main; aceptación funcional completa, privacidad y recuperación aún no verificadas.
- D-012: correcciones GPS/SOS/guardado integradas mediante merge #2, commit 7622a0e. Preservarlas.
- No se agregan decisiones de producto aprobadas por inferencia. Las recomendaciones de esta organización quedan sujetas a revisión.

### Evitar confusión de IDs: ocho frentes V2 y 28 tareas

Los alias V2-01…V2-08 se usan aquí para distinguir las ideas de PLAN_DESARROLLO; no renumeran issues ni modifican los documentos originales.

| Frente histórico | Relación con issues actuales | Alcance no cubierto inequívocamente |
| --- | --- | --- |
| V2-01 Mapas offline y volver al inicio | #13, #30 | Validación de licencia y cobertura sigue pendiente. |
| V2-02 Radar Live personalizable | #17, #19, #23 (parcial) | No afirmar que el conjunto completo de perfiles/campos ya está especificado o aceptado. |
| V2-03 ClimbPro | #14, #17 | Precisión de elevación/pendiente y prueba real. |
| V2-04 Coach de voz | #17, #27 | Audios offline y comportamiento multimedia por validar. |
| V2-05 Comparador | #16 | Validación de geometría/sentido y equivalencia pendiente. |
| V2-06 Bicicleta/mantenimiento | #18, #28 | Multi-bici y servicios completos pendientes. |
| V2-07 Escuadrón/seguridad | #10, #12, #24 | Reglas activas, privacidad y límites de SOS sin aceptación. |
| V2-08 Desafíos/progreso | #18 cubre estadísticas parcialmente | Objetivos/desafíos no tienen una issue dedicada inequívoca. Identificar alcance antes de abrir otra; no inventar una tarea aprobada. |

### Referencias externas pendientes de confirmar

La documentación contiene dos URLs Netlify distintas: mtbproyect.netlify.app y proyectmtb.netlify.app. Esta revisión no comprobó cuál corresponde a la producción vigente ni qué commit sirve. Resolverlo en #15/#34 antes de afirmar que GitHub y el teléfono están usando la misma versión.

Los PDFs locales de bocetos están sin seguimiento; su presencia no prueba que sean la referencia preferida de Claude ni autoriza publicarlos. No se copiaron ni se subieron.

## 8. Bitácora y handoff

### Avance Android previo, preservado del roadmap de #35

- Propuesta #22: servicio foreground location, TrackDatabase SQLite, controles nativos de iniciar/detener y sesiones interrumpidas, visor WebView restringido, exportación GPX incremental por selector de archivo. Proyecto minSdk26/target35.
- Compilación histórica: [run 40758066360](https://github.com/fernandezbjuanma-wq/proyectmtb/actions/runs/40758066360), SHA 2f73497f8a3d56d5de1371c9ada10ef8f7ac3667. El roadmap previo registró artifact radar-mtb-android-debug ID 12847387191. La vigencia/descarga de ese artifact no se comprobó en esta revisión.
- Para prueba: descargar artifact de una compilación exitosa del commit elegido, extraer app-debug.apk, instalar, conceder permisos, iniciar GPS y comprobar notificación; detener → GPX guardados → exportar. Es un APK debug, no publicación de Play Store.
- SQLite nativo no se transfiere automáticamente al Historial web/Firestore. Una PWA publicada en Netlify no gana GPS de segundo plano por existir el proyecto Android.
- #35 propone GpsFixPolicy/TrackDatabase con timestamp original, antigüedad por reloj monotónico, descarte de datos inválidos y transacción que comprueba sesión abierta antes de insertar. Mantiene esquema sin migración destructiva.
- La política reportó 14 pruebas JUnit4 y git diff --check local. El commit funcional 06a5ac0 compiló en [run 40764807561, intento 2](https://github.com/fernandezbjuanma-wq/proyectmtb/actions/runs/40764807561/attempts/2); según el PR se publicó artifact radar-mtb-android-debug ID 12849842749. El intento 1 falló al descargar una dependencia Maven por handshake TLS; se reintentó sin alterar workflow ni seguridad TLS. El head posterior 72ebfc8 solo actualizó documentación y también tuvo check de compilación exitoso en [run 40765630086](https://github.com/fernandezbjuanma-wq/proyectmtb/actions/runs/40765630086). El CI ejecuta assembleDebug, no los 14 tests JUnit; siguen pendientes pruebas de SQLite y de teléfono. No se descargaron ni validaron artifacts en esta revisión.
- Pausa/reanudación completa, permiso de notificaciones Android 13+, puente con Historial/Firestore y aviso tardío del servicio siguen pendientes.
- El roadmap de #35 registró un intento rechazado de ampliar el workflow CI; esa ampliación no forma parte de esa propuesta ni de esta organización.

### Estado local preservado

Copia original inspeccionada: rama main, HEAD decaef7, un commit sin publicar sobre origin/main 1e8ccd0. Ese commit agrega TAREAS_PENDIENTES.md con 17 tareas, un plan local distinto de las 28 issues actuales. Sin modificaciones versionadas/staging; dos PDFs de bocetos sin seguimiento.

La inspección de esta revisión fue de solo lectura. No se hizo fetch, reset, cambio de rama, commit ni publicación desde la copia original. La propuesta documental nace en una rama remota desde main auditado, para no mezclar trabajo local ni el PR #35 del otro chat.

### Handoff — organización del repositorio, 28/10/2026

**Pedido:** revisar y organizar el repositorio completo de GitHub.
**Hecho:** inventario de los 15 archivos de main, contexto y contradicciones; estado local; 28 issues con roles/dependencias; 5 PR previos con bases/checks; matriz de riesgos, secuencia y pruebas. Seguimiento central en este archivo.
**Archivos modificados:** únicamente ROADMAP_FUTURO.md, en propuesta separada contra main.
**Preservado:** visión original, decisiones históricas, avances/hallazgos de #35, copia local, PDFs y respaldos.
**No ejecutado:** pruebas físicas, navegador, Firebase real/emulador, sitio Netlify, migración o cambios funcionales, merge ni despliegue.
**Revisión pendiente:** Antigravity sobre el diff de esta organización; revisar #35 por separado con sus criterios de #6. No se presume que otra IA haya leído o aprobado.
**Siguiente paso concreto:** #21 comparar propuestas, #20 validación básica; en frentes separados #6/#7, #8, #10→#11. Recolectar aceptación móvil en #9 antes de declarar terminado el núcleo.
**Regla de mantenimiento:** actualizar esta misma bitácora y tabla al cambiar un estado, citando PR/commit/prueba. Revalidar snapshot y conservar las secciones nuevas al reconciliar roadmaps de ramas.

## 9. Visión original conservada

> Archivo histórico de las 19 ideas originales. Las marcas “COMPLETADO”, los porcentajes y las promesas de GPS/SOS/audio de este anexo son declaraciones previas, **no estado vigente, pruebas ejecutadas ni aprobación**. Para planificar usar secciones 2–6. La estética final sigue pendiente de referencia aprobada.

<details>
<summary>Abrir visión original de producto y arquitectura (histórica, sin aceptación demostrada)</summary>

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

</details>
