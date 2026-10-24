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
