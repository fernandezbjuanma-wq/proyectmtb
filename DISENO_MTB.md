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
