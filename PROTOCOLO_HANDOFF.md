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
