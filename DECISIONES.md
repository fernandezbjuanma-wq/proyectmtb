# Registro de decisiones — Radar Táctico MTB

Actualizar solo decisiones basadas en afirmaciones explícitas del usuario o evidencia. Fecha de inicio: 2026-10-24.

| Código | Estado | Decisión y justificación |
| --- | --- | --- |
| D-001 | APROBADA | Mantener cuatro secciones: Preparación, Radar Live, Laboratorio, Historial. |
| D-002 | APROBADA | Conservar el orden/organización conceptual de la propuesta visual V1 de ChatGPT. |
| D-003 | RECHAZADA | No adoptar como estética final la propuesta V1 de ChatGPT: al usuario no le gusta su aspecto. |
| D-004 | APROBADA | Adoptar e implementar el Diseño V2 «Verde táctico» (`DISENO_MTB_V2_ESPECIFICACION.md` y `radar-tactico-v2-prototipo.html`) entregado por el usuario ("te dejo estos diseños para que los implementes tal cual esta ahi . quiero que subas a github estos detalles tambien"). |
| D-005 | APROBADA COMO DIRECCIÓN | Investigar e integrar las ocho mejoras MTB-01 a MTB-08 detalladas en PLAN_DESARROLLO.md; sujeto a diseño y verificación técnica. |
| D-006 | APROBADA | Seguir desarrollando principalmente con Antigravity, sumando ChatGPT y Claude como colaboradores de ideas, diseño y revisión. |
| D-007 | APROBADA | Usar GitHub como espacio compartido de documentos, tareas y propuestas, con usuario como aprobador. |
| D-008 | NORMA DEL PROCESO | No aplicar cambios funcionales en main sin revisión y aprobación humana. |
| D-009 | PENDIENTE | Decidir PWA vs componente nativo tras ensayos reales de GPS en segundo plano. |
| D-010 | PENDIENTE | Seleccionar tecnología/licencia de mapas offline y política de datos de ubicación. |
| D-011 | APROBADA | Arquitectura de Nube Híbrida: Firebase Firestore BaaS Offline-First + Respaldo Universal JSON. El usuario aprobó ambas opciones ("me gustan las dos opciones para tener buenos respaldos y no perder el registro"). Firestore con `enablePersistence` para sincronización automática con 4G/Wi-Fi; Backup JSON local (.json descargable) para portabilidad total sin cuenta ni internet. Implementado en commit sobre main el 2026-10-28 por Antigravity. |
| D-012 | APROBADA | Integrar en main las correcciones de fiabilidad GPS, SOS y guardado propuestas por ChatGPT en la rama `fix/gps-sos-datos-20261028`. Merge realizado en commit `7622a0e` el 2026-10-28 por Antigravity. |
| D-013 | APROBADA | Persistencia Robusta con IndexedDB y Checkpoints de Autoguardado: Implementación de almacenamiento local con IndexedDB (`radar_mtb_db`) para resolver el límite de 5-10MB de `localStorage`, checkpoints periódicos automáticos cada 2 min para recuperar sesiones interrumpidas ante cierre o batería baja, y sintetizador táctico Web Audio API para alertas sonoras offline sin depender de archivos MP3 externos. Implementado el 2026-11-05 por Antigravity. |
| D-014 | APROBADA | Integración definitiva del proyecto real de Google Firebase `mtb-radar`: Configuración vinculada directamente en el código fuente como predeterminada (`FIREBASE_DEFAULT_CONFIG`) para almacenamiento y sincronización en la nube con soporte offline IndexedDB. Conexión completada el 2026-11-05 por Juan y Antigravity. |
| D-015 | APROBADA | Compilación automática de APK Android mediante GitHub Actions: Configuración de proyecto Android nativo con WebView acelerado por hardware (`android/`) y workflow de GitHub Actions (`.github/workflows/compilar-apk.yml`) para generar el instalable `radar-mtb.apk` automáticamente en cada push a main. Implementado el 2026-11-05 por Antigravity. |
| D-016 | APROBADA | Cierre integral de tareas técnicas pendientes (T-005, T-006, T-007, T-009, T-014, T-015, T-017): Implementación de Wake Lock activo + `FLAG_KEEP_SCREEN_ON` en APK, reglas de seguridad `firestore.rules` + `ciclistaId`, caché de mapas offline (`mtb-map-tiles-v1`) con descargador por bounding box, Escuadrón con expiración de 2h y marcadores reales en mapa, compresión geométrica Douglas-Peucker, toasts visuales de sincronización y validación matemática de ClimbPro con histéresis de 2.5m sobre GPX real de 52.58 km (+870m). Implementado el 2026-11-11 por Antigravity. |
| D-017 | APROBADA | Implementación completa del Diseño V2 «Verde táctico» (`DISENO_MTB_V2_ESPECIFICACION.md` + `radar-tactico-v2-prototipo.html`) en `index.html` y APK Android: Paleta Verde táctico (`#0A110F` / `#3DDC97`) + Modo Solar (`#F3F0E8` / `#0A7A47`), tipografía WOFF2 embebida offline (`Barlow Condensed` y `Barlow`), tres vistas en Radar (`Mapa` protagonista por defecto con controles 44×44px y dock interactivo, `Cabina` Boceto A y `Subida` Boceto B con anticipación de pared a 104px y lista `Después`), volver al inicio sobre la huella (`MTB-01`), confirmación obligatoria al finalizar con botones separados, insignias `est.` en métricas estimadas y resolución de discrepancias SILCA/BikeFit/Batería. Implementado el 2026-11-11 por Antigravity. |

## Convenciones
APROBADA: confirmada expresamente. APROBADA COMO DIRECCIÓN: intención validada pero detalles abiertos. PENDIENTE: requiere decisión/evidencia. RECHAZADA: no usar salvo nueva instrucción.
Al registrar decisiones nuevas: fecha, proponente, evidencia o issue/PR, alternativas y consecuencia.
