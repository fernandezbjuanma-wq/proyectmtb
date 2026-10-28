# 🚵 Radar Táctico MTB

**Un lugar para entender el proyecto y saber qué sigue.**

| Estado | Prioridad actual | Pendientes |
| --- | --- | --- |
| En desarrollo | GPS y guardado confiable | 28 tareas abiertas |

### Lo próximo

1. **Grabar en Android con pantalla bloqueada:** revisar el APK propuesto y probarlo en un teléfono.
2. **Recuperar actividades sin perder puntos:** completar el autoguardado web y su restauración.
3. **Sincronizar con privacidad:** autenticación, reglas y confirmación real del servidor.

La app conserva **Preparación · Radar Live · Laboratorio · Historial**. El diseño visual de Claude sigue pendiente de referencia y aprobación.

**Lectura rápida:** [Tareas](#3-las-28-tareas) · [Orden de trabajo](#4-orden-de-ejecución-y-dependencias) · [Decisiones y diseño](#7-decisiones-diseño-y-planes-históricos) · [Últimos avances](#8-bitácora-y-handoff)

### Solo tres documentos

| Archivo | Para qué abrirlo |
| --- | --- |
| **[ROADMAP_FUTURO.md](ROADMAP_FUTURO.md)** | Este centro del proyecto: estado, tareas, diseño, decisiones y seguimiento. |
| [AGENTS.md](AGENTS.md) | Entrada breve para los agentes; remite a las reglas de este documento. |
| [CLAUDE.md](CLAUDE.md) | Entrada breve para Claude y su trabajo de diseño. |

Los siete documentos relacionados se unifican aquí; sus originales completos quedan en el [archivo documental](#10-archivo-documental-consolidado). La raíz propuesta pasa de **10 a 3 Markdown** y de **15 a 8 archivos totales**. La aplicación conserva sus archivos y rutas.

---

**Actualización:** 28/10/2026 · **Código auditado:** [main 1e8ccd0](https://github.com/fernandezbjuanma-wq/proyectmtb/commit/1e8ccd06fe5cd0c6eed1ebef931051cd84007ee7) · **Propuesta:** [#36](https://github.com/fernandezbjuanma-wq/proyectmtb/pull/36).

Las secciones técnicas están plegadas para facilitar la lectura. Al abrirlas se conservan las pruebas, fuentes y límites de cada afirmación.

## 1. Cómo trabajar y leer el repositorio

**Para agentes:** estas son las reglas vigentes. Los textos del archivo documental son antecedentes y no reemplazan este bloque.

<details>
<summary>Reglas vigentes, colaboración y criterios de aceptación</summary>

## Fuente de verdad y autoridad
- El usuario dirige el proyecto. Las decisiones expresas del usuario prevalecen sobre sugerencias de las IAs.
- El código existente y su comportamiento deben inspeccionarse antes de cambiarse. No asumir que ROADMAP_FUTURO.md demuestra que una función está probada.
- La colaboración se coordina mediante GitHub: issues, ramas, commits, pull requests y documentos. Estos archivos NO crean comunicación autónoma ni sesiones entre modelos.
- Leer al empezar este roadmap: reglas, estado real, tarea elegida, decisiones/diseño, pruebas y bitácora. El contenido de los seis documentos antes exigidos está consolidado aquí; sus originales se conservan en el archivo histórico. Si hay contradicciones, señalar su fecha y contrastar con código y decisiones explícitas.
- No decir que otra IA aprobó, leyó o ejecutó algo sin evidencia visible. No inventar resultados ni pruebas.

## Producto
Aplicación de ciclismo de montaña centrada en mapas, GPS, navegación, entrenamiento y seguridad.
Conservar la navegación principal en exactamente cuatro áreas: Preparación, Radar Live, Laboratorio e Historial.
Los ocho frentes V2 están en la sección 7; son propuestas de trabajo, NO funciones verificadas. Sus IDs históricos no equivalen a las 28 issues.
El usuario aprobó el ORDEN de un boceto anterior, pero NO su apariencia. Indicó que prefiere un diseño realizado por Claude; sus archivos visuales aún deben incorporarse y aprobarse en el repositorio. No imponer una estética nueva por defecto.

## Roles orientativos (no son conexiones automáticas)
- Usuario: decisiones, pruebas de uso y aprobación final.
- Antigravity: implementación en su entorno, ejecución y pruebas.
- Claude: aporte de diseño visual, UX y revisión; puede implementar si el usuario lo indica.
- ChatGPT: arquitectura, planificación, especificaciones y revisión técnica; puede proponer cambios mediante GitHub.
Los roles pueden cambiar por tarea y no implican acceso a sesiones privadas de las otras IAs.

## Reglas de edición
1. Crear issue o vincular uno existente antes de cambios funcionales relevantes.
2. Trabajar en una rama temática separada de main; nunca hacer push directo a main como parte de una propuesta.
3. Documentar qué cambia, por qué, cómo se verificó y qué falta; abrir PR para revisión humana.
4. Antes de refactorizar index.html (SPA monolítica), registrar las funciones y los IDs HTML afectados. No eliminar funcionalidades silenciosamente.
5. No tocar datos, configuración Firebase, secretos, credenciales o permisos sin evaluación explícita.
6. Cambios visuales mayores necesitan comparación con el diseño de Claude aportado por el usuario y aprobación.
7. Evitar dependencias nuevas, llamadas a servicios o telemetría no consentidas.
8. No publicar localizaciones precisas, contactos SOS ni tracks reales del usuario en issues o material público sin permiso.
9. Mantener modo sin conexión honesto: GPS, tiles y sincronización deben presentar límites y fallas.
10. Toda funcionalidad de seguridad debe indicar su límite real: WhatsApp no es envío automático, la detección de caídas no está validada, y una PWA puede suspender GPS en segundo plano.

## Criterios mínimos para dar una tarea por lista
- Implementación controlada y reversible; sin regresiones evidentes.
- Pruebas manuales con pasos reproducibles; pruebas automatizadas cuando sea viable.
- Verificación explícita de conexión y desconexión, permisos, errores y pantalla pequeña según corresponda.
- Etiquetas correctas para datos estimados: vatios, TSS, calorías, desgaste y similares.
- Handoff registrado en la bitácora de este roadmap, con enlaces, pruebas y dudas.
- Estado final confirmado por el usuario: aprobado, cambios pedidos o rechazado.

## Qué hacer si falta información
Pedir el artefacto faltante sin inventarlo. Para el diseño de Claude, solicitar un enlace, capturas o exportación, y NO afirmar que está integrado antes de recibirlo.

### Documento único y revisión cruzada

- Registrar avances, decisiones nuevas y handoffs únicamente en ROADMAP_FUTURO.md. No recrear los documentos retirados ni agregar informes Markdown.
- La flecha de cada tarea indica implementador → revisor requerido. No sustituir esa revisión por autoevaluación o subagentes del mismo proveedor.
- Nunca quitar funciones por no aparecer en una maqueta. Distinguir siempre función existente, demo y propuesta futura.
- Antes de integrar ramas antiguas, trasladar al roadmap cualquier novedad exclusiva y resolver sus enlaces. No aceptar árboles/documentos antiguos completos por defecto.

### Flujo de trabajo

Usuario define el resultado → issue existente con aceptación → rama temática → implementación y pruebas → PR → revisión cruzada con correcciones → decisión del usuario → registro de resultado. GitHub funciona como espacio común; no activa otras sesiones ni garantiza lectura de mensajes.

### Plantillas breves

**Issue:** objetivo ciclista; estado en código; referencia visual; alcance; dependencias; aceptación; pruebas; implementador/revisor; bloqueantes y enlaces.

**Handoff en la bitácora o PR:** fecha; issue/PR; commit/rama; hecho; pendiente; archivos; decisiones y evidencia; pruebas ejecutadas y NO ejecutadas; riesgos/privacidad/offline; dudas; siguiente acción y aprobación.

</details>

### Mapa simple del repositorio

| Grupo | Archivos y función |
| --- | --- |
| Aplicación | index.html: interfaz y lógica web; sw.js: caché PWA; manifest.json: instalación; netlify.toml: publicación. |
| Referencia de datos | GPX ya existente; dato potencialmente sensible, sin abrir ni reproducir sus coordenadas en esta revisión. |
| Documentación | Este roadmap y las dos entradas mínimas para agentes. |

El código auditado de main concentraba la SPA en 7.013 líneas. Android, mtb-core/mtb-store, pruebas y workflows se encuentran en propuestas de ramas, no integrados en ese main. No se cambiaron rutas de aplicación ni archivos de datos.

## 2. Estado real y hallazgos

**Resumen:** 28 issues abiertas: **6 P0, 13 P1 y 9 P2**. Catorce proponen implementación ChatGPT y catorce Antigravity. Al corte no tienen etiquetas, assignees técnicos ni milestones de GitHub: las prioridades/roles están en títulos y cuerpos; la tabla siguiente los hace consultables sin cambiar asignaciones.

**main es la aplicación web.** No contiene android/, tests/, package.json, módulos mtb-core/mtb-store ni workflows CI. El PR #2 sí fue integrado en el merge [7622a0e](https://github.com/fernandezbjuanma-wq/proyectmtb/commit/7622a0e1d0eefe900ccb0c2742b023707737c672); no contarlo como pendiente. Los PR #3/#4/#5/#22/#35 siguen separados.

<details>
<summary>Abrir diagnóstico técnico y contradicciones resueltas</summary>

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
- El protocolo anterior repartía avances entre varios MD. El seguimiento y sus contenidos se centralizan aquí. Sus originales completos se conservan en el archivo documental de este roadmap.

</details>

## 3. Las 28 tareas

**6 críticas (P0) · 13 de fiabilidad (P1) · 9 de evolución (P2).** Abrí el grupo que necesites. Cada fila enlaza la issue con sus criterios completos; la identidad canónica es el número de issue.

<details>
<summary>🔴 Prioridad crítica · 6 tareas</summary>

| Tarea | P | Issue y alcance | Implementa → revisa | Dependencias / antecedentes | Estado observado y siguiente acción |
| --- | --- | --- | --- | --- | --- |
| MTB-01 | P0 | [#6](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/6) Motor GPS nativo persistente y recuperación de sesión | ChatGPT → Antigravity | #7; antecedente PR #4 | Parcial en PR #22 y #35. Revisar política GPS, SQLite, pausa/reanudación y callbacks tras finalizar. |
| MTB-02 | P0 | [#7](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/7) Integración Android, APK y fuente única GPS | Antigravity → ChatGPT | #6; antecedente PR #4 | Parcial en PR #22. APK compilado; faltan fuente única integrada, permisos y ensayo físico. |
| MTB-03 | P0 | [#8](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/8) Autoguardado IndexedDB, restauración y migración sin pérdida | ChatGPT → Antigravity | Reconciliar PR #3 con main | Parcial en PR #3. Reconciliar con nube/scrubber de main; preservar historial corrupto y recuperar sesiones. |
| MTB-04 | P0 | [#9](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/9) Pruebas móviles de GPS y batería / aceptación de campo | Antigravity → ChatGPT | #6, #7, #8 | Pendiente de teléfono real. Registrar bloqueo 5/30/90 min, permisos, batería y recuperación. |
| MTB-05 | P0 | [#10](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/10) Firebase Auth + reglas privadas + migración de actividades | ChatGPT → Antigravity | Nube main; reglas PR #4 | Reglas propuestas en PR #4. Faltan Auth, pruebas entre usuarios y migración reversible; no desplegar reglas aisladas. |
| MTB-06 | P0 | [#11](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/11) Sincronización nube verificable y diagnóstico Netlify | Antigravity → ChatGPT | #10; nube main | Código en main, sin aceptación. Corregir estados de servidor/caché, reintentos y reducción silenciosa del track. |

</details>

<details>
<summary>🟠 Fiabilidad y operación · 13 tareas</summary>

| Tarea | P | Issue y alcance | Implementa → revisa | Dependencias / antecedentes | Estado observado y siguiente acción |
| --- | --- | --- | --- | --- | --- |
| MTB-07 | P1 | [#12](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/12) Auditoría de privacidad Escuadrón y SOS | ChatGPT → Antigravity | #10, #11 | Cambios parciales en PR #3. Faltan consentimiento, expiración, listeners y seguridad de servidor. |
| MTB-08 | P1 | [#13](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/13) Mapas descargables offline y regreso por el recorrido | Antigravity → ChatGPT | #8, #9; proveedor/licencia | Pendiente. Elegir proveedor autorizado y verificar cobertura offline y backtrack. |
| MTB-09 | P1 | [#14](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/14) Precisión de altitud, distancia, potencia y carga de entrenamiento | ChatGPT → Antigravity | #8 | Motor parcial en PR #3. Probar distancias, desnivel y unidades; rotular estimaciones. |
| MTB-10 | P1 | [#15](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/15) Netlify, PWA e integración del scrubber de recorridos | Antigravity → ChatGPT | #8; despliegue actual | PWA/scrubber en main, sin aceptación completa. Verificar versión real, caché y aislamiento de reproducción. |
| MTB-15 | P1 | [#20](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/20) Pruebas automáticas CI y control de calidad de PRs | ChatGPT → Antigravity | #8, #10 (cobertura completa) | Tests parciales en PR #3 y CI Android en #22/#35. Iniciar validación básica; ampliar web/IndexedDB/Firebase. |
| MTB-16 | P1 | [#21](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/21) Integración y resolución de conflictos de ramas pendientes | Antigravity → ChatGPT | Transversal; aceptación por PR | Organización e integración transversal. Preservar trabajo local y reconciliar cada PR antes de aprobación. |
| MTB-17 | P1 | [#23](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/23) Chequeo pre-salida: GPS, permisos, batería, espacio y mapas | Antigravity → ChatGPT | #7, #9, #13 | Pendiente. Estados reales de permisos, GPS, red y cobertura; batería/espacio solo si la API los permite. |
| MTB-18 | P1 | [#24](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/24) Privacidad de recorridos: zonas sensibles y exportaciones seguras | ChatGPT → Antigravity | #10, #12, #18 | Pendiente. Redactar solo copia exportada; conservar original y probar rutas cortas/ida y vuelta. |
| MTB-19 | P1 | [#25](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/25) Integridad de sesiones: IDs estables, deduplicación y múltiples pestañas | ChatGPT → Antigravity | #6, #8, #10, #11 | Protección de cierre parcial en PR #35. Faltan IDs estables, idempotencia, pestañas y reconciliación. |
| MTB-23 | P1 | [#29](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/29) Diagnóstico privado de errores, fallos GPS y sincronización | ChatGPT → Antigravity | #6, #8, #11, #20 | Pendiente. Registro local limitado, exportación sanitizada y sin transmisión automática. |
| MTB-25 | P1 | [#31](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/31) Auditoría de rendimiento: batería, memoria, mapas y escrituras | ChatGPT → Antigravity | #6, #7, #9, #20 | Pendiente. Medir latencia, memoria, almacenamiento y batería con umbrales cuantitativos. |
| MTB-27 | P1 | [#33](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/33) Pruebas de desconexión extrema y recuperación sin pérdida | ChatGPT → Antigravity | #8, #9, #20, #25 | Pendiente. Banco de fallos con tracks sintéticos; separar pruebas automatizadas de ensayos físicos. |
| MTB-28 | P1 | [#34](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/34) Publicación segura: staging Netlify, versionado y rollback comprobable | Antigravity → ChatGPT | #15, #21, #23 | Pendiente. Staging, commit visible, actualización de SW y rollback sin pérdida local. |

</details>

<details>
<summary>🟢 Evolución del producto · 9 tareas</summary>

| Tarea | P | Issue y alcance | Implementa → revisa | Dependencias / antecedentes | Estado observado y siguiente acción |
| --- | --- | --- | --- | --- | --- |
| MTB-11 | P2 | [#16](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/16) Comparador de rutas, segmentos y récords | ChatGPT → Antigravity | #14; PR #3 | Comparador parcial en PR #3. Validar geometría, sentido y tolerancias con datos sintéticos. |
| MTB-12 | P2 | [#17](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/17) ClimbPro real, entrenador de voz y accesibilidad de radar | Antigravity → ChatGPT | #13, #14; diseño | Funciones históricas no equivalen a aceptación. Resolver audios ausentes, perfil por distancia y referencia visual. |
| MTB-13 | P2 | [#18](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/18) Historial robusto: exportación/importación universal, estadísticas y mantenimiento | ChatGPT → Antigravity | #8, #11 | Backup en main y mejoras parciales en PR #3. Validar esquema, restauración atómica, BikeFit y paginación. |
| MTB-14 | P2 | [#19](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/19) Integración visual de Claude conservando funciones | Antigravity → ChatGPT | #7, #11; diseño Claude | Bloqueada por referencia visual autorizada/aprobada de Claude. Mantener las cuatro áreas. |
| MTB-20 | P2 | [#26](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/26) Biblioteca de rutas GPX totalmente local, etiquetas y favoritos | Antigravity → ChatGPT | #8, #13, #18 | Pendiente. Biblioteca local con búsqueda, duplicados y GPX inválidos; no confundir track con tiles. |
| MTB-21 | P2 | [#27](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/27) Planificador de entrenamiento ciclista por RPE, tiempo y zonas | ChatGPT → Antigravity | #14, #16, #18 | Planes históricos no equivalen a aceptación. Validar duración/RPE y diferenciar sensores de estimaciones. |
| MTB-22 | P2 | [#28](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/28) Garaje MTB multi-bicicleta y mantenimientos por componente | Antigravity → ChatGPT | #18 | Pendiente. Separar odómetros por bici, servicios y reseteos confirmados. |
| MTB-24 | P2 | [#30](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/30) Waypoints, alertas de desvío y navegación de regreso asistida | Antigravity → ChatGPT | #13, #15, #23 | Pendiente. Waypoints offline, tolerancias y regreso por huella con límites explícitos. |
| MTB-26 | P2 | [#32](https://github.com/fernandezbjuanma-wq/proyectmtb/issues/32) Compatibilidad importación y exportación GPX/TCX/FIT | Antigravity → ChatGPT | #18, #26 | GPX histórico parcial. Faltan fixtures GPX/TCX y evaluación de FIT/licencia; no inventar sensores. |

</details>

Todas siguen abiertas. Una implementación parcial o una compilación exitosa no acreditan aceptación completa. Los roles no inician automáticamente ninguna IA.

## 4. Orden de ejecución y dependencias

**Ahora:** GPS Android, recuperación web y nube privada en frentes separados, con integración y pruebas desde el inicio.

<details>
<summary>Ver etapas, bloqueantes y reparto de archivos</summary>

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

</details>

## 5. Pull requests e integración

**Hay propuestas con dependencias entre sí.** Consultar sus bases antes de integrar para preservar el trabajo de cada rama.

<details>
<summary>Ver PR, compilaciones y plan de conciliación</summary>

Corte previo a esta propuesta: **5 PR abiertos, todos borradores**, sin revisiones GitHub registradas. La propuesta #36 organiza y consolida la documentación sobre main. Los checks citados corresponden a esos commits; consultar de nuevo antes de integrar.

| PR | Base real → rama | Evidencia y tratamiento |
| --- | --- | --- |
| [#3](https://github.com/fernandezbjuanma-wq/proyectmtb/pull/3) | fix/gps-sos-datos-20261028 → feat/resiliencia-estadisticas-seguridad-20261028 | IndexedDB, métricas, historial, privacidad y comparación. Tests propuestos, sin checks/reviews registrados al corte. Reconciliar con nube/scrubber nuevos de main; rescatar módulos y diffs acotados. |
| [#4](https://github.com/fernandezbjuanma-wq/proyectmtb/pull/4) | rama de #3 → feat/android-background-gps-nube-segura-20261028 | Prototipo Android y reglas Firebase. Se solapa con #22 en 9 archivos Android. No integrar ambos motores ni desplegar reglas al cliente viejo. Separar propuesta Auth/reglas en #10. |
| [#5](https://github.com/fernandezbjuanma-wq/proyectmtb/pull/5) | rama de #4 → docs/roadmap-unico-20261028 | Consolidación documental que propone borrar 11 MD, algunos solo presentes en ramas. No aplicar por arrastre ni perder decisiones; reconciliar con este roadmap y los cambios de main. Esta propuesta retira siete MD de main tras incorporar íntegro su contenido al archivo documental; no reproduce las once eliminaciones de #5. |
| [#22](https://github.com/fernandezbjuanma-wq/proyectmtb/pull/22) | main → feat/gps-android-grabacion-nativa-final-20261028 | Línea nativa más avanzada: servicio, SQLite, GPX y APK. Check android-debug exitoso en edaef402: [run 40758465010](https://github.com/fernandezbjuanma-wq/proyectmtb/actions/runs/40758465010). No demuestra teléfono ni nube/Historial integrado. |
| [#35](https://github.com/fernandezbjuanma-wq/proyectmtb/pull/35) | rama de #22 → fix/mtb-01-timestamps-gps-20261028 | Rechaza posiciones viejas/futuras/inválidas y protege cierre SQLite. Commit funcional 06a5ac0 compilado en [run 40764807561, intento 2](https://github.com/fernandezbjuanma-wq/proyectmtb/actions/runs/40764807561/attempts/2). Head documental 72ebfc8 también con android-debug exitoso: [run 40765630086](https://github.com/fernandezbjuanma-wq/proyectmtb/actions/runs/40765630086). CI compila/empaqueta; no ejecuta los 14 tests. Revisión Antigravity y SQLite/móvil pendientes. |

**Dependencias de rama:** #3 → #4 → #5 es una cadena; #22 parte de main y #35 apunta a #22. La base antigua fix/gps-sos de #3 ya tuvo merge en main mediante #2, pero eso no actualiza automáticamente los cambios de nube posteriores en #3.

**Plan de conciliación (#21):**

1. Preservar snapshot local y respaldos; comparar contra main exacto.
2. Usar #22+#35 como línea nativa propuesta, rescatar de #4 solo piezas útiles que no dupliquen el motor.
3. Recuperar de #3 el guardado/core/comparador en propuestas acotadas sobre main actual; comprobar nube, simulador y scrubber.
4. Llevar Auth/reglas/migración como unidad revisable (#10), con pruebas y plan de vuelta atrás.
5. Unificar novedades de roadmap de #3/#4/#5/#22/#35 y esta propuesta al integrar; ninguna versión antigua debe sobrescribir la matriz/bitácora nueva ni recrear informes separados.
6. Resolver cada conflicto y ejecutar regresión; revisor de la otra IA deja evidencia y usuario decide merge. No cerrar ni borrar PR/ramas automáticamente.

El roadmap de #35 ya contenía avances nativos y hallazgos de guardado/nube: se incorporan aquí con atribución y límites. Este PR documental no incorpora su código.

**Mantener los tres MD al integrar:** #3 propone NOTA_CAMBIOS_CHATGPT_2026-10-28.md; #4 agrega otros planes/informes y android/README.md. Conservar la información pertinente dentro de este roadmap sin recrear esos archivos. La revisión de referencias funcionales no encontró dependencias a los siete MD retirados en main ni en 31 contenidos funcionales distintos de los PR anteriores.

</details>

## 6. Pruebas y aceptación

**Compilar no demuestra funcionamiento en el teléfono.** La aceptación requiere evidencia del commit probado y decisión del usuario.

<details>
<summary>Ver evidencia disponible y matriz de pruebas pendientes</summary>

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

</details>

## 7. Decisiones, diseño y planes históricos

**Aprobado:** las cuatro áreas y su orden conceptual. **Pendiente:** la apariencia final basada en la referencia preferida de Claude.

<details>
<summary>Decisiones registradas, ocho frentes V2 y enlaces</summary>

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

El handoff del PR #35, commit a7dbd158, registra que el usuario confirmó https://proyectmtb.netlify.app/ como su URL actual; mtbproyect.netlify.app es una referencia antigua. Esa revisión encontró protección privada de Netlify y no pudo inspeccionar HTML ni verificar el SHA desplegado. Esta consolidación conserva esa evidencia atribuida; falta comprobar el despliegue exacto en #15/#34.

Los PDFs locales de bocetos están sin seguimiento; su presencia no prueba que sean la referencia preferida de Claude ni autoriza publicarlos. No se copiaron ni se subieron.

</details>

<details>
<summary>Diseño de pantallas y proceso de adaptación</summary>

## Arquitectura de pantallas
### 1. Preparación
Resumen pre-salida, rutas GPX, mapa offline descargado, perfiles de Radar, entrenador de voz, Mi Garaje y mantenimiento, presión de cubiertas, BikeFit, entrenamiento y segmentos.

### 2. Radar Live
Prioridad visual: velocidad, distancia, mapa, estado GPS / grabación. Vistas internas configurables MAPA, DATOS, SUBIDA; accesos legibles a volver al inicio, pausa/finalización y SOS. ClimbPro y avisos contextualizados, no una pila de widgets simultáneos.

### 3. Laboratorio
Resumen post-salida, gráficas de altitud, pendiente, velocidad, datos estimados marcados, segmentos, comparación de rutas, sugerencias de recuperación con evidencia disponible.

### 4. Historial
Actividad individual, calendario, sincronización local/nube visible, récords personales, objetivos y evolución mensual, acceso a comparación.

## Principios no negociables
- Uso con una mano y lectura rápida con sol, lluvia y movimiento; no saturar pantalla.
- Diferenciar registrar actividad / actividad pausada / no hay GPS / offline / sincronización pendiente.
- Mostrar indicadores por texto e icono, no solo por color.
- Evitar botones peligrosos muy cerca de otros; confirmar finalización de grabación.
- Sin dependencias de red para los datos esenciales que se hayan preparado offline.
- SOS nunca puede insinuar que ya avisó a alguien sin confirmación real.
- Colores no aprobados se consideran ejemplos de exploración, no especificación.


### Trabajo de diseño con Claude

Recibir el artefacto favorito sin inventar su apariencia → inventariar pantallas, paleta, tipografías, componentes y comportamientos → mapearlo a las cuatro áreas y funciones reales → identificar diferencias técnicas → proponer adaptación revisable en esta sección → aprobación del usuario antes de cambios visuales.

Priorizar legibilidad en movimiento, sol, lluvia y pantalla pequeña. No eliminar funciones por faltar en una maqueta. Conservar versiones, registrar cuál referencia eligió el usuario y distinguir implementación existente, demo y propuesta. El primer encargo es inventario visual y criterios de adaptación, sin sobrescribir index.html por defecto.

</details>

## 8. Bitácora y handoff

**Último cambio:** documentación unificada y portada más simple, conservando el contenido de origen.

<details>
<summary>Abrir avances Android, estado local y registro de esta consolidación</summary>

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

### Handoff — organización y consolidación, 28/10/2026

**Pedido:** revisar el repositorio y unir los Markdown relacionados para reducir desorden y mejorar lectura.
**Hecho:** revisión de código/documentación, 28 tareas y propuestas previas; portada resumida; tablas técnicas desplegables; siete documentos incorporados completos al archivo histórico; AGENTS/CLAUDE reducidos a entradas que remiten a estas reglas.
**Archivos de esta propuesta:** ROADMAP_FUTURO.md, AGENTS.md y CLAUDE.md actualizados; siete documentos redundantes retirados de la rama tras preservar su contenido. Quedan tres Markdown.
**Preservado:** originales completos con nombre/commit/blob de origen; visión de las 19 ideas; decisiones; avances y hallazgos de #35; copia local y PDFs; código, datos y respaldos.
**Validación:** cotejar cada texto original íntegro, 28 filas únicas, enlaces y anclas; verificar árbol de tres Markdown y que los blobs funcionales/datos conservan su SHA. Revisar referencias en main y PR anteriores para evitar rutas documentales rotas.
**No ejecutado:** pruebas físicas, navegador, Firebase real/emulador, migración, merge ni despliegue. La inspección del sitio Netlify privado corresponde al handoff atribuido de #35, no a esta consolidación.
**Revisión pendiente:** Antigravity sobre la propuesta #36; decisión del usuario para incorporarla a main. No se presume que otra IA haya aprobado.
**Mantenimiento:** actualizar solo este documento; incorporar aquí novedades de ramas al integrarlas, conservar procedencia y evitar recrear informes sueltos.

### Novedad del otro chat, incorporada con atribución

El roadmap de #35 en a7dbd158 registra revisión de la web y una propuesta de evolución a app autosuficiente: servicio nativo/SQLite y APK de prueba; luego interfaz y dependencias esenciales locales dentro del APK con puente restringido y fuente GPS única; después Historial/backup/sincronización privada y distribución con firma estable. Son propuestas pendientes, no aprobaciones. La MainActivity actual carga Netlify: el sitio privado o la falta de red limita la interfaz completa. Esto no invalida la grabación nativa independiente y requiere integración en #7/#8/#25.

</details>

## 9. Visión original conservada

> Archivo histórico de las 19 ideas originales. Las marcas “COMPLETADO”, los porcentajes y las promesas de GPS/SOS/audio de este anexo son declaraciones previas, **no estado vigente, pruebas ejecutadas ni aprobación**. Para planificar usar las secciones de estado, tareas y pruebas. La estética final sigue pendiente de referencia aprobada.

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

## 10. Archivo documental consolidado

Los **siete originales se conservan completos** a continuación, agrupados por tema. Son antecedentes con fecha y procedencia: las referencias a archivos retirados y las instrucciones antiguas de edición se adaptaron en las secciones vigentes de este roadmap. No representan por sí solas el estado actual ni nuevas aprobaciones.

<details>
<summary>Producto y decisiones</summary>

<a id="archivo-decisiones"></a>

<details>
<summary>DECISIONES.md · original íntegro</summary>

**Origen:** [DECISIONES.md en commit 4939222](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/49392220d9be6e7dd9fcd9caadb08f0ae76cfdcc/DECISIONES.md) · blob fbb20569e0184770605216f6afc503da85dfad33.
**Condición:** documento histórico integrado; para trabajar usar reglas, estado y decisiones vigentes arriba.

---

# Registro de decisiones — Radar Táctico MTB

Actualizar solo decisiones basadas en afirmaciones explícitas del usuario o evidencia. Fecha de inicio: 2026-10-24.

| Código | Estado | Decisión y justificación |
| --- | --- | --- |
| D-001 | APROBADA | Mantener cuatro secciones: Preparación, Radar Live, Laboratorio, Historial. |
| D-002 | APROBADA | Conservar el orden/organización conceptual de la propuesta visual V1 de ChatGPT. |
| D-003 | RECHAZADA | No adoptar como estética final la propuesta V1 de ChatGPT: al usuario no le gusta su aspecto. |
| D-004 | PENDIENTE DE INSUMO | El usuario manifestó que le gusta un diseño elaborado por Claude. Deben obtenerse sus archivos/capturas para usarlo como referencia visual y confirmar qué partes desea conservar. |
| D-005 | APROBADA COMO DIRECCIÓN | Investigar e integrar las ocho mejoras MTB-01 a MTB-08 detalladas en PLAN_DESARROLLO.md; sujeto a diseño y verificación técnica. |
| D-006 | APROBADA | Seguir desarrollando principalmente con Antigravity, sumando ChatGPT y Claude como colaboradores de ideas, diseño y revisión. |
| D-007 | APROBADA | Usar GitHub como espacio compartido de documentos, tareas y propuestas, con usuario como aprobador. |
| D-008 | NORMA DEL PROCESO | No aplicar cambios funcionales en main sin revisión y aprobación humana. |
| D-009 | PENDIENTE | Decidir PWA vs componente nativo tras ensayos reales de GPS en segundo plano. |
| D-010 | PENDIENTE | Seleccionar tecnología/licencia de mapas offline y política de datos de ubicación. |
| D-011 | APROBADA | Arquitectura de Nube Híbrida: Firebase Firestore BaaS Offline-First + Respaldo Universal JSON. El usuario aprobó ambas opciones ("me gustan las dos opciones para tener buenos respaldos y no perder el registro"). Firestore con `enablePersistence` para sincronización automática con 4G/Wi-Fi; Backup JSON local (.json descargable) para portabilidad total sin cuenta ni internet. Implementado en commit sobre main el 2026-10-28 por Antigravity. |
| D-012 | APROBADA | Integrar en main las correcciones de fiabilidad GPS, SOS y guardado propuestas por ChatGPT en la rama `fix/gps-sos-datos-20261028`. Merge realizado en commit `7622a0e` el 2026-10-28 por Antigravity. |

## Convenciones
APROBADA: confirmada expresamente. APROBADA COMO DIRECCIÓN: intención validada pero detalles abiertos. PENDIENTE: requiere decisión/evidencia. RECHAZADA: no usar salvo nueva instrucción.
Al registrar decisiones nuevas: fecha, proponente, evidencia o issue/PR, alternativas y consecuencia.

</details>

<a id="archivo-diseno-mtb"></a>

<details>
<summary>DISENO_MTB.md · original íntegro</summary>

**Origen:** [DISENO_MTB.md en commit 4939222](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/49392220d9be6e7dd9fcd9caadb08f0ae76cfdcc/DISENO_MTB.md) · blob 8a53b5b0be1f46513721f9734f8288f3ebb18047.
**Condición:** documento histórico integrado; para trabajar usar reglas, estado y decisiones vigentes arriba.

---

# Diseño de Radar Táctico MTB V2

Estado: ESTRUCTURA APROBADA / ESTÉTICA FINAL PENDIENTE.
Fecha de registro: 2026-10-24.

## Decisiones del usuario
- Mantener cuatro pestañas principales: Preparación, Radar Live, Laboratorio e Historial.
- Le gustó el orden propuesto en el boceto V1 de ChatGPT, pero NO su estética.
- El usuario informó que le gustó mucho más un diseño realizado por Claude.
- Aún NO contamos con capturas, enlace ni archivos del diseño de Claude dentro del repositorio; pendiente recibirlos e inventariarlos. No inventar su apariencia.
- Las variantes de color, tipografía e iconografía vistas en propuestas anteriores NO están aprobadas como diseño final.

## Arquitectura de pantallas
### 1. Preparación
Resumen pre-salida, rutas GPX, mapa offline descargado, perfiles de Radar, entrenador de voz, Mi Garaje y mantenimiento, presión de cubiertas, BikeFit, entrenamiento y segmentos.

### 2. Radar Live
Prioridad visual: velocidad, distancia, mapa, estado GPS / grabación. Vistas internas configurables MAPA, DATOS, SUBIDA; accesos legibles a volver al inicio, pausa/finalización y SOS. ClimbPro y avisos contextualizados, no una pila de widgets simultáneos.

### 3. Laboratorio
Resumen post-salida, gráficas de altitud, pendiente, velocidad, datos estimados marcados, segmentos, comparación de rutas, sugerencias de recuperación con evidencia disponible.

### 4. Historial
Actividad individual, calendario, sincronización local/nube visible, récords personales, objetivos y evolución mensual, acceso a comparación.

## Principios no negociables
- Uso con una mano y lectura rápida con sol, lluvia y movimiento; no saturar pantalla.
- Diferenciar registrar actividad / actividad pausada / no hay GPS / offline / sincronización pendiente.
- Mostrar indicadores por texto e icono, no solo por color.
- Evitar botones peligrosos muy cerca de otros; confirmar finalización de grabación.
- Sin dependencias de red para los datos esenciales que se hayan preparado offline.
- SOS nunca puede insinuar que ya avisó a alguien sin confirmación real.
- Colores no aprobados se consideran ejemplos de exploración, no especificación.

## Cómo integrar el diseño de Claude (pendiente)
1. Usuario comparte capturas, archivo HTML, Figma, enlace o exportación autorizada.
2. Claude o ChatGPT redacta inventario: pantallas, patrones visuales, componentes, tipografía, paleta, acciones.
3. Se confecciona matriz: elemento de Claude -> sección Radar MTB -> función real del código -> trabajo requerido.
4. Usuario valida la adaptación; solo entonces se crean PR de UI.
5. Archivar versiones sin borrar la referencia anterior.

## Lista de comprobación de aprobación visual
[ ] Capturas o archivo del diseño favorito de Claude incorporados
[ ] Paleta, tipografía y componentes aprobados por el usuario
[ ] Cuatro secciones y funciones existentes localizadas
[ ] Diseño móvil probado con ancho pequeño, bajo sol y con guantes/sudor
[ ] Estados sin GPS, sin red, grabando y seguridad diseñados
[ ] Aprobar antes de cambiar la apariencia real de index.html

</details>

<a id="archivo-plan-desarrollo"></a>

<details>
<summary>PLAN_DESARROLLO.md · original íntegro</summary>

**Origen:** [PLAN_DESARROLLO.md en commit 4939222](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/49392220d9be6e7dd9fcd9caadb08f0ae76cfdcc/PLAN_DESARROLLO.md) · blob a44fdfbcc6dfe7606f2ef65078e81e85dc7e59ef.
**Condición:** documento histórico integrado; para trabajar usar reglas, estado y decisiones vigentes arriba.

---

# Radar Táctico MTB V2 — plan compartido
Fecha: 2026-10-24. Estado: PROPUESTAS APROBADAS COMO IDEAS, NO IMPLEMENTACIONES FINALIZADAS.

## Alcance aprobado: 8 líneas de mejora
| ID | Mejora | Área principal | Definición de terminado |
| --- | --- | --- | --- |
| MTB-01 | Mapas offline y volver al inicio | Preparación / Radar | Descarga previa con proveedor/licencia válidos, verificación de cobertura, estado offline y seguimiento inverso de track con aviso de límites |
| MTB-02 | Radar Live personalizable | Preparación / Radar | Perfiles y campos configurables, guardado persistente y controles aptos para el movimiento |
| MTB-03 | ClimbPro mejorado | Radar / Laboratorio | Segmentos de subida desde GPX, perfil, pendiente y distancia/ascenso restantes, validación de elevaciones |
| MTB-04 | Coach de voz | Preparación / Radar | Configuración de notificaciones por prioridad, frecuencia y silencio, audios offline y alertas de entrenamiento |
| MTB-05 | Comparador de recorridos | Historial / Laboratorio | Alineación geográfica verificable, comparación de tramos equivalentes y récords sin falsas equivalencias |
| MTB-06 | Mi bicicleta y mantenimiento | Preparación | Garaje con componentes, reparaciones, kilometraje y avisos de inspección orientativos |
| MTB-07 | Escuadrón y seguridad | Radar | Consentimiento explícito, sesiones privadas, última ubicación conocida con hora, SOS verificable y límites claros |
| MTB-08 | Desafíos y progreso | Historial | Objetivos de distancia, desnivel y constancia, progresos derivados de actividades sin incentivos riesgosos |

## Fases propuestas, NO calendario comprometido
Fase 0: revisar diseño de Claude, arquitectura y pruebas de regresión; definir métricas y estado offline.
Fase 1: Radar Live personalizable, Mi Garaje, indicadores de persistencia.
Fase 2: mapas offline autorizados, trackback y ClimbPro.
Fase 3: comparador, coach de voz, objetivos y progreso.
Fase 4: sesiones de Escuadrón con privacidad y evaluación de funciones SOS.

## Dependencias y bloqueantes
- No rediseñar la UI final antes de recibir el diseño visual preferido de Claude.
- Para mapa offline, confirmar derechos de uso, formato, proveedor y almacenamiento disponible.
- Para trackback, diferenciar línea por huella de una ruta calculada por senderos.
- Para GPS en segundo plano, probar dispositivos reales y valorar un contenedor nativo si la PWA no ofrece garantías.
- Para compartir ubicación y SOS, definir permisos, política de retención, conectividad y fallos.
- No marcar «completado» por existir código sin pruebas de campo.

## Plantilla de aceptación por cada mejora
- Necesidad ciclista: quién, dónde, bajo qué condiciones.
- Pantallas/estado de interfaz y comportamiento offline.
- Cambios propuestos en datos y código.
- Riesgos, privacidad y recuperación ante fallo.
- Prueba con datos de ejemplo y pasos reproducibles.
- Evidencia adjunta en PR y aprobación del usuario.

## Próximo trabajo
1. Añadir referencia del diseño de Claude al repositorio con permiso del usuario.
2. Abrir una issue por cada MTB-01...MTB-08 con criterios concretos.
3. Elegir la primera tarea y asignar un agente ejecutor.
4. Recibir y revisar PR, registrar decisión y continuar.

</details>

</details>

<details>
<summary>Estado y entregas</summary>

<a id="archivo-estado-actual"></a>

<details>
<summary>ESTADO_ACTUAL.md · original íntegro</summary>

**Origen:** [ESTADO_ACTUAL.md en commit 4939222](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/49392220d9be6e7dd9fcd9caadb08f0ae76cfdcc/ESTADO_ACTUAL.md) · blob 686078de337cd8a41b1b80404e119228101deb87.
**Condición:** documento histórico integrado; para trabajar usar reglas, estado y decisiones vigentes arriba.

---

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
- **Sin probar en celular real**: todas las funciones nuevas requieren verificación con el dispositivo del usuario en `https://mtbproyect.netlify.app/`.

</details>

<a id="archivo-handoff-chatgpt-2026-10-28"></a>

<details>
<summary>HANDOFF_CHATGPT_2026-10-28.md · original íntegro</summary>

**Origen:** [HANDOFF_CHATGPT_2026-10-28.md en commit 4939222](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/49392220d9be6e7dd9fcd9caadb08f0ae76cfdcc/HANDOFF_CHATGPT_2026-10-28.md) · blob 28942add73219f535d5e8a1dde3ddf3d476c9bbe.
**Condición:** documento histórico integrado; para trabajar usar reglas, estado y decisiones vigentes arriba.

---

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

</details>

</details>

<details>
<summary>Colaboración y continuidad</summary>

<a id="archivo-readme-colaboracion-ia"></a>

<details>
<summary>README_COLABORACION_IA.md · original íntegro</summary>

**Origen:** [README_COLABORACION_IA.md en commit 4939222](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/49392220d9be6e7dd9fcd9caadb08f0ae76cfdcc/README_COLABORACION_IA.md) · blob 17fef5b6560cc5408d7762eaaf99ec121fbe6836.
**Condición:** documento histórico integrado; para trabajar usar reglas, estado y decisiones vigentes arriba.

---

# Centro de colaboración — Radar Táctico MTB

## Objetivo
Permitir que el usuario, ChatGPT, Google Antigravity y Claude Code trabajen con el mismo contexto, intercambien propuestas y revisen entregas mediante GitHub. El repositorio es fernandezbjuanma-wq/proyectmtb.

IMPORTANTE: GitHub funciona como buzón compartido, NO como conversación automática entre modelos. Ninguna IA monitorea por sí sola nuevas tareas, inicia sesiones de otras herramientas ni intercambia mensajes en tiempo real gracias a estos archivos. Para que una IA trabaje, el usuario debe abrirla, darle acceso al repositorio y pedirle que lea la tarea. Una automatización futura requeriría integración/configuración y permisos específicos.

## Orden recomendado de lectura
1. AGENTS.md: reglas y prioridades compartidas.
2. CLAUDE.md: instrucciones específicas para Claude Code.
3. ESTADO_ACTUAL.md: arquitectura y restricciones verificadas.
4. DISENO_MTB.md: decisiones sobre interfaz.
5. PLAN_DESARROLLO.md: entregables de V2.
6. DECISIONES.md: decisiones aprobadas, pendientes y rechazadas.
7. PROTOCOLO_HANDOFF.md: cómo dejar trabajo para la siguiente IA.

## Flujo de colaboración humano-en-el-bucle
1. Usuario elige idea, interfaz o problema.
2. Una IA redacta issue con contexto, alcance y criterios de aceptación.
3. El agente implementador trabaja en una rama y abre PR, sin tocar main.
4. Otro agente revisa el PR con foco en su especialidad; comentarios quedan en GitHub.
5. Usuario decide. Solo después de su aprobación se integra al proyecto.
6. El implementador documenta cambios y deja un handoff verificable.

## Cómo incorporarse desde Antigravity
- Abrir la carpeta del repositorio y actualizar los cambios remotos.
- Confirmar que Antigravity ha leído AGENTS.md. Sus reglas del proyecto pueden usar este archivo.
- Leer la tarea en GitHub, trabajar en rama independiente y publicar PR.
- No confiar en instrucciones previas o contexto local si contradicen DECISIONES.md.
- No copiar secretos de Firebase, contactos o tracks privados al repositorio público.

## Cómo incorporarse desde Claude
- Si se utiliza Claude Code, abrir el proyecto: CLAUDE.md aporta el contexto inicial.
- Compartir en el repositorio el diseño de Claude aprobado por el usuario (o un enlace autorizado) y documentarlo.
- Puede revisar PR con su propia sesión, si dispone de acceso y el usuario se lo pide.
- Usar los mismos issues y handoffs que el resto del equipo.

## Cómo incorporarse desde ChatGPT
- Con la conexión GitHub habilitada, consultar issues, archivos, commits y PR.
- Proponer cambios o revisiones de código, no dar por ejecutadas pruebas locales.
- Señalar expresamente cuándo depende de que el usuario o Antigravity prueben en el celular.

## Primeros pasos sugeridos
- Revisar y aprobar este PR de documentación.
- Incorporar capturas/exportación del diseño preferido de Claude; registrar cuál es la versión elegida.
- Crear issues concretos por función de V2 y comenzar por confiabilidad GPS/offline y UI del Radar.
- Agregar pruebas reproducibles y una estrategia de copias de seguridad de actividades.

</details>

<a id="archivo-protocolo-handoff"></a>

<details>
<summary>PROTOCOLO_HANDOFF.md · original íntegro</summary>

**Origen:** [PROTOCOLO_HANDOFF.md en commit 4939222](https://github.com/fernandezbjuanma-wq/proyectmtb/blob/49392220d9be6e7dd9fcd9caadb08f0ae76cfdcc/PROTOCOLO_HANDOFF.md) · blob ffcf2998189c6f5268dacf11517d31a6b60ac3cb.
**Condición:** documento histórico integrado; para trabajar usar reglas, estado y decisiones vigentes arriba.

---

# Protocolo de comunicación entre IAs — GitHub como buzón

## Qué sí permite
ChatGPT, Antigravity y Claude pueden leer el mismo repositorio y, cuando tienen acceso y la sesión activa, intercambiar información mediante issues, comentarios, archivos y pull requests. El usuario inicia las sesiones y decide cuándo tomar una tarea.

## Qué NO permite automáticamente
Este protocolo NO conecta las APIs de los modelos, NO permite chats directos entre IAs, NO genera agentes siempre activos ni garantiza que el destinatario lea un mensaje. Los comentarios son persistentes, pero deben ser consultados por cada IA. Sin integraciones adicionales no hay respuesta automática de los otros agentes.

## Forma de trabajar
1. Crear una issue por tarea: título, contexto, objetivo y aceptación.
2. Indicar «Sugerido para: Antigravity / Claude / ChatGPT»; es preferencia de trabajo, NO asignación técnica automática.
3. Crear rama por cambio, por ejemplo feat/mtb-02-radar-personalizado.
4. Implementar y dejar evidencia de pruebas, límites y riesgos.
5. Abrir PR contra main. Solicitar revisión al otro agente a través del usuario o su integración GitHub, si está disponible.
6. El revisor comenta con sugerencias y referencias concretas. Usuario aprueba antes de merge.
7. Actualizar DECISIONES.md, ESTADO_ACTUAL.md y PLAN_DESARROLLO.md solo cuando el cambio lo amerite.

## Plantilla de issue
Título: [MTB-XX] Acción concreta
Objetivo ciclista:
Estado actual en código:
Diseño aprobado o referencia:
Alcance / no alcance:
Dependencias:
Criterios de aceptación:
Pruebas requeridas:
Agente sugerido:
Bloqueantes:
Enlaces:

## Plantilla de handoff (pegar en PR/issue)
### HANDOFF — [Nombre del agente]
Fecha:
Issue/PR:
Commit / rama:
Hecho:
NO hecho:
Archivos afectados:
Decisiones tomadas y evidencias:
Pruebas ejecutadas / resultados:
Pruebas NO ejecutadas:
Riesgos, privacidad, compatibilidad y offline:
Preguntas para el próximo agente:
Acción pedida a usuario/otro agente:

## Regla de evidencia
Evitar «terminado» sin PR/commit y verificaciones. Si se proponen cambios desde ChatGPT pero el código no se ejecutó, indicar «sin prueba local». No compartir credenciales, contactos privados ni ubicaciones sensibles.

## Primer handoff para Antigravity
Lee AGENTS.md y ESTADO_ACTUAL.md. Este PR es de DOCUMENTACIÓN; no actualices la UI ni funciones hasta que el usuario apruebe una issue concreta y entregue el diseño elegido de Claude.
## Primer handoff para Claude
Lee CLAUDE.md y DISENO_MTB.md. Tu diseño anterior fue el favorito del usuario, pero aún no está incluido; pide al usuario el artefacto original y documenta su lenguaje visual antes de proponer implementación.

### HANDOFF — Antigravity | 2026-10-28 | Cloud + Backup + Merge Codex
**Fecha:** 2026-10-28
**Issue/PR:** Trabajo directo sobre main por indicación del usuario.
**Commits/rama:** main, sobre `d3645e0` → merge `7622a0e` (integra Codex `fix/gps-sos-datos-20261028`) → commit pendiente de cloud.

**Hecho:**
1. Merge limpio de la rama de Codex `fix/gps-sos-datos-20261028` (commits `fe0a513` + `8069504`) a main. Sin conflictos. Incluye: `clearWatch` GPS, reinicio de variables entre sesiones, SOS sin coordenadas ficticias, guardado que no descarta puntos silenciosamente.
2. Modal `#modal-config-nube` ampliado con 4 secciones: badge de estado en vivo, sincronización bidireccional, respaldo JSON universal, credenciales Firebase propias.
3. Funciones JS implementadas: `probarConexionFirebase()` (diagnóstico con timeout 6s), `descargarTodasDeNubeALocal()` (descarga hasta 100 actividades + fusión sin duplicados), `exportarBackupCompleto()` (empaqueta actividades + odómetro + segmentos + bikefit en JSON descargable), `importarBackupJSON(event)` (importa y fusiona desde archivo).
4. `actualizarEstadoNubeUI()` actualizado para reflejar estado en el badge del modal.
5. Botones de Historial reorganizados: 🔄 Sincronizar | 📦 Backup | ☁️ Nube.
6. `DECISIONES.md` actualizado con D-011 (Cloud Híbrida) y D-012 (merge Codex).
7. `ESTADO_ACTUAL.md` actualizado con sección de Nube y Respaldos.

**NO hecho:**
- Pruebas en celular real ni en `https://mtbproyect.netlify.app/`.
- IndexedDB para almacenamiento incremental de sesiones largas.
- Reglas de seguridad de Firestore (el proyecto demo no tiene restricciones).
- Mapas offline ni GPS de segundo plano nativo.
- Diseño visual de Claude (pendiente de aprobación por el usuario).

**Archivos afectados:** `index.html`, `DECISIONES.md`, `ESTADO_ACTUAL.md`, `PROTOCOLO_HANDOFF.md`.

**Decisiones tomadas:**
- Fusionar Codex sin PR formal por indicación del usuario.
- Usar `Promise.race` con timeout en el diagnóstico de conexión para no congelar la app sin señal.
- Exportación JSON incluye todos los datos locales (no solo actividades) para migración completa.

**Pruebas ejecutadas:** Verificación sintáctica (llaves balanceadas: `{ = 1171, } = 1171`), presencia de las 4 funciones nuevas, renderizado headless con Edge.
**Pruebas NO ejecutadas:** Funcionalidad real de Firestore, flujo offline → reconexión, importación de respaldo, celular con GPS real.

**Riesgos:**
- Firebase demo config (`AIzaSyDemoMTBRadarKey2026`) es ficticia; el usuario debe pegar su propio proyecto o no habrá sincronización real.
- `localStorage` puede llenarse con muchas actividades con puntos GPS; IndexedDB es la siguiente prioridad.
- El `clearWatch` de Codex y el reproductor de ruta de Antigravity tocan variables de GPS similares; verificar que no interfieran.

**Preguntas para el próximo agente:**
1. ¿El usuario ya creó su proyecto Firebase? Si no, guiarlo con el instructivo del modal.
2. ¿Se confirma que el merge de Codex no introdujo regresiones en el simulador GPX?
3. ¿Cuándo se aplica el diseño visual de Claude?

**Acción pedida a usuario:** Hacer push desde GitHub Desktop, verificar en `https://mtbproyect.netlify.app/` y probar el flujo completo de backup/restauración.

</details>

</details>
