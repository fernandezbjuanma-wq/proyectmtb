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
