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
