# Radar Táctico MTB — instrucciones compartidas para agentes

Vigente desde: 2026-10-24. Idioma de trabajo: español de Argentina.

## Fuente de verdad y autoridad
- El usuario dirige el proyecto. Las decisiones expresas del usuario prevalecen sobre sugerencias de las IAs.
- El código existente y su comportamiento deben inspeccionarse antes de cambiarse. No asumir que ROADMAP_FUTURO.md demuestra que una función está probada.
- La colaboración se coordina mediante GitHub: issues, ramas, commits, pull requests y documentos. Estos archivos NO crean comunicación autónoma ni sesiones entre modelos.
- Leer al empezar: README_COLABORACION_IA.md, ESTADO_ACTUAL.md, DISENO_MTB.md, PLAN_DESARROLLO.md, DECISIONES.md y PROTOCOLO_HANDOFF.md. Si difieren, señalar la contradicción.
- No decir que otra IA aprobó, leyó o ejecutó algo sin evidencia visible. No inventar resultados ni pruebas.

## Producto
Aplicación de ciclismo de montaña centrada en mapas, GPS, navegación, entrenamiento y seguridad.
Conservar la navegación principal en exactamente cuatro áreas: Preparación, Radar Live, Laboratorio e Historial.
Los ocho frentes de la V2 están definidos en PLAN_DESARROLLO.md; son propuestas de trabajo, NO funciones verificadas.
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
- Handoff registrado según PROTOCOLO_HANDOFF.md, con enlaces y dudas.
- Estado final confirmado por el usuario: aprobado, cambios pedidos o rechazado.

## Qué hacer si falta información
Pedir el artefacto faltante sin inventarlo. Para el diseño de Claude, solicitar un enlace, capturas o exportación, y NO afirmar que está integrado antes de recibirlo.
