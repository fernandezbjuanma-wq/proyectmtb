# Android: grabación GPS con pantalla bloqueada

Este es un **prototipo de integración nativa**, no un APK compilado ni un reemplazo del sitio de Netlify. Requiere Android Studio, compilación y pruebas en un teléfono. Se implementa como aplicación Android WebView con servicio de ubicación en primer plano; **no se puede conseguir lo mismo únicamente con JavaScript de una página web**.

## Estructura
- `TrackingService.kt`: servicio Android con notificación persistente y puntos GPS.
- `MainActivity.kt`: WebView para mostrar Radar MTB y puente mínimo para iniciar/detener servicio con gesto explícito.
- `AndroidManifest.xml`: permisos de ubicación y servicio `foregroundServiceType=location`.

## Pasos de integración aún pendientes
1. Crear proyecto Android Studio (Kotlin, minSdk 26, target SDK actual) y copiar estas fuentes a `app/src/main` ajustando el `package`.
2. Agregar dependencia de AndroidX Core y de ubicación de Google Play Services (o sustituirla por LocationManager): `com.google.android.gms:play-services-location`.
3. Establecer HTTPS propio de Netlify en `APP_URL`, **solo tras obtener su URL oficial** y validar el origen permitido; no cargar páginas arbitrarias en el puente.
4. Solicitar permiso de ubicación durante el uso antes de iniciar servicio. Para localización mientras la app no es visible, respetar permisos y restricciones de Android de cada versión. El inicio de servicio debe venir de una interacción visible del usuario.
5. Conectar el almacenamiento nativo seguro de tracks (Room/SQLite), restauración y exportación GPX. **La implementación actual del servicio no persiste todavía cada punto**; registra telemetría vía notificación como punto de partida. No utilizar para una salida real hasta completar el almacenamiento.
6. Vincular el servicio a la UI: `iniciarRecorrido` / `finalizarEntrenamiento` deben utilizar las señales del servicio y evitar doble grabación con `watchPosition`.
7. Probar pantalla bloqueada, otras apps, proceso terminado, permisos negados, baterías restringidas, sin internet y reinicio de teléfono.
8. No garantizar grabación si se usa 'Forzar detención' desde Ajustes.

## Advertencia
Este es el inicio de la ruta técnica adecuada, **NO una solución lista y probada**. Netlify aloja la UI; el seguimiento confiable con pantalla apagada requiere código nativo en el teléfono. Mantener separadas las sesiones de prueba y las salidas reales.
