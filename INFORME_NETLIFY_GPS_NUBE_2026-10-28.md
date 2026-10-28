# Informe: Netlify, GPS con pantalla bloqueada y nube — 28/10/2026

## Verificación real
- URL suministrada por el usuario: https://proyectmtb.netlify.app/
- Se intentó consultar el despliegue remoto; no estuvo accesible desde las herramientas de esta sesión. **No se pudo inspeccionar el HTML publicado, su versión, ni ejecutar la app desplegada.**
- `main` en GitHub permanece en commit `84bd8b3fd26711481daebc7cd60d75699ca6fc54`, sin los cambios locales recientes de Antigravity.

## Solución técnica preparada
Se añadió proyecto Android Gradle mínimo en `android/` para abrir el sitio público en WebView y ofrecer un **botón separado** para iniciar/detener grabación GPS mediante servicio foreground Android. El servicio crea notificación y guarda cada posición GPS aceptada en SQLite. Al cerrar WebView/pantalla, el servicio puede continuar si Android lo permite. Se incluyó generador GPX nativo y una interfaz inicial de exportación en modo texto compartido, todavía no un archivo adjunto.

**Estado del proyecto Android: EXPERIMENTAL, NO compilado ni probado. No es APK listo para instalar.**
Dependencias/restricciones: configuración SDK y Gradle; solicitar permisos oportunos; permitir tracking solamente por elección del usuario; permisos/foreground según versión Android. El servicio no tiene política de reinicio forzado, ni reanudación tras reinicio del móvil. Evitar dos grabaciones paralelas: botón GPS nativo y botón GPS web actual son sistemas separados y todavía no están sincronizados. Antes de usar en campo, integrar sus estados y exportación a la historia completa.

## Nube
En el código publicado de GitHub:
- Firebase tiene configuración *demo* por defecto, sin prueba de servicio real.
- Cliente original utiliza colecciones globales `actividades_mtb` y `escuadron_salas` sin autenticación.
- No es posible confirmar qué reglas están implementadas en el backend porque no hay acceso a su proyecto Firebase ni consola de Netlify.
- `firebase.rules` contiene propuesta de reglas cerradas con rutas por usuario autenticado; **NO DESPLEGAR tal como está**, pues bloquearía el cliente actual.

## Recomendación
1. Obtener artefactos de Antigravity para conciliar Netlify y scrubber; no fusionar cambios encima sin comprobar diferencias.
2. Completar/compilar/probar APK de Android con grabación bloqueada en teléfono real durante >30 minutos.
3. Verificar recuperación y exportación de GPX tras cierres normales, batería restringida y pérdida de internet.
4. Configurar Firebase Auth y migración privada de actividades, con reglas probadas localmente.
5. Separar claramente etiquetas local / pendiente / confirmación remota por servidor y no prometer sincronía sin acuse.
6. Solo tras pruebas integrar a `main`, sin alterar los respaldos existentes.
