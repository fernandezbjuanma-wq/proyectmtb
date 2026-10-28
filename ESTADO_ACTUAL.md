# Estado técnico observado en el repositorio

Fecha de inspección: 2026-10-24. Base observada: main, commit f17b37bba0ae3a0972a7db5a8084eeddfe955353.
Estos son hallazgos de lectura estática, NO resultados de pruebas ejecutadas.

## Archivos originales
- index.html: SPA de una sola página (aprox. 4.197 líneas) con HTML, CSS y JavaScript juntos.
- manifest.json: metadatos PWA, icono referenciado externamente.
- sw.js: Service Worker con estrategia de caché básica y lista de recursos.
- ROADMAP_FUTURO.md: visión y funcionalidades declaradas completas por el proyecto.
- Vuelta_ciclística_por_la_mañana.gpx: track de muestra incluido.

## Funciones detectadas en el código
- 4 pestañas: Preparación, Radar Live, Laboratorio, Historial.
- GPS con navigator.geolocation.watchPosition y filtros.
- Importación y exportación GPX, Leaflet y capas de mapas online.
- Entrenamiento con métricas estimadas, ClimbPro, Ghost Pacer, segmentos.
- Mantenimiento de la bicicleta, presión estimada y BikeFit manual.
- Historial local, Firebase/Firestore con intentos de persistencia y sincronización.
- Escuadrón y función de compartir coordenadas mediante enlace de WhatsApp.
- Detección por acelerómetro y ventana de confirmación de posible caída.

## Riesgos prioritarios que requieren validación
1. Una PWA no garantiza grabación GPS continua con pantalla bloqueada o app suspendida; audio en bucle no es garantía universal.
2. El Service Worker no descarga de manera controlada paquetes de mapas offline; el modo sin internet debe probarse desde cero, incluidas las dependencias externas y el GPX.
3. Compartir por WhatsApp abre una URL con texto y coordenadas; no equivale a enviar un SOS automático ni a ubicación continuamente actualizada.
4. La función compartirUbicacionWhatsApp usa unas coordenadas fijas si no hay ubicación actual: debe impedirse que un marcador ficticio se presente como ubicación auténtica.
5. Datos como potencia, TSS, calorías o desgaste deben indicarse como estimados si no hay sensores/mediciones reales.
6. Persistencia offline y conflictos de sincronización requieren ensayos con cierre forzado, reconexión y almacenamiento lleno.
7. Tracking grupal: autorización, control de acceso, expiración de sesiones, retención mínima y reglas de Firestore.
8. El proyecto es público; nunca agregar claves privadas, tokens, teléfonos reales ni GPX personales sin revisión.

## Antes de refactorizar
- Hacer copia de main y disponer de un GPX de prueba no sensible.
- Identificar IDs, funciones globales y almacenamiento local utilizado.
- Definir pruebas mínimas: iniciar, pausar/finalizar, guardar, restaurar, importar/exportar GPX, consultar historial, sin red, permisos negados.
- Separar responsabilidades gradualmente; no reescribir todo a la vez.
- Etiquetar qué funciones están probadas y cuáles siguen siendo hipótesis.

## Nube y Respaldos (implementado 2026-10-28)
- **Firebase Firestore** inicializado con `enablePersistence({ synchronizeTabs: true })`. Las actividades se suben automáticamente al finalizar cada salida (`sincronizarActividadConFirestore`). Si no hay internet, quedan en cola offline de IndexedDB y se suben solas al recuperar señal.
- **Prueba de conexión en vivo** (`probarConexionFirebase`): diagnóstico accesible desde el modal ☁️ Nube. Timeout de 6s para no congelar la UI sin conexión.
- **Sincronización manual bidireccional**: `sincronizarPendientesFirestore()` sube las pendientes; `descargarTodasDeNubeALocal()` baja hasta 100 actividades desde Firestore y las fusiona sin duplicados por ID.
- **Respaldo Universal JSON** (`exportarBackupCompleto`): empaqueta actividades, odómetro, segmentos privados y bikefit en un `.json` descargable. Restauración mediante `importarBackupJSON` con fusión sin duplicados y restauración opcional de odómetro/segmentos.
- **Botones en Historial**: 🔄 Sincronizar | 📦 Backup | ☁️ Nube.
- **Modal ☁️ NUBE Y RESPALDOS MTB** (`#modal-config-nube`): badge de estado en vivo, botón de diagnóstico, subir/descargar manual, exportar/importar JSON, credenciales Firebase propias opcionales con guía de 2 minutos.
- **Correcciones de Codex integradas** (merge de `fix/gps-sos-datos-20261028`): `clearWatch` al finalizar, reinicio de variables entre sesiones, SOS sin coordenadas ficticias, guardado que no borra puntos GPS silenciosamente.
- **Sin probar en celular real**: todas las funciones nuevas requieren verificación con el dispositivo del usuario en `https://mtbproyect.netlify.app/`.
