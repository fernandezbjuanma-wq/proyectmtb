# AGENTS.md — instrucciones operativas (Radar Táctico MTB)

**Fuente de verdad única:** [ROADMAP_FUTURO.md](./ROADMAP_FUTURO.md). Al empezar, leerlo completo: contiene estado, novedades, decisiones, diseño, plan de trabajo, riesgos, tests, arquitectura y pendientes.

**Regla documental:** NO crear archivos .md de informes, handoffs, decisiones o seguimiento por tarea. Actualizar únicamente ROADMAP_FUTURO.md en la sección de bitácora y pendientes. Este AGENTS.md existe solo para que los agentes detecten las reglas de manera automática; CLAUDE.md existe por compatibilidad con Claude Code.

**Autoridad:** solo el usuario decide qué hace ChatGPT, Antigravity o Claude. No delegar ni alterar tareas ajenas sin pedido explícito.

**Seguridad y edición:**
- No sobrescribir \`main\` ni ramas \`respaldo/\`; trabajar en rama y PR con aprobación humana.
- Nunca asumir que una función existe/funciona porque el roadmap antiguo diga «100% completo».
- No interferir en versiones locales de Antigravity ni diseño visual de Claude que no estén publicados.
- No publicar secretos, contactos SOS, ubicaciones ni tracks personales en un repo público.
- No prometer GPS continuo con WebView cerrado, SOS automático o respaldo nube real sin pruebas.
- Mantener cuatro pestañas: Preparación → Radar Live → Laboratorio → Historial.
- Describir pruebas realizadas y no realizadas; distinguir código, prototipo, APK, despliegue y validación.
- Antes de desplegar reglas Firebase, verificar autenticación, migración y pruebas; evitar bloquear datos existentes.
- Si algo cambia, registrar en **el mismo ROADMAP_FUTURO.md** fecha, PR, cambios, pruebas y pendientes.

**Resumen:** una nota viva y dos archivos pequeños de instrucciones técnicas; ninguna documentación nueva por cada tarea.
