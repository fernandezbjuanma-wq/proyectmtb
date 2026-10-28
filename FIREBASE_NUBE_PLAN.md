# Firebase — diagnóstico y propuesta segura (2026-10-28)

## Situación actual observada
- `index.html` usa `firebase-firestore-compat` sin `firebase-auth`. La configuración predeterminada visible es demostrativa (no demuestra que exista un backend real).
- Escribe en `actividades_mtb/{id}` y usa `escuadron_salas/{sala}/miembros/{nombre}` sin un identificador de usuario autenticado.
- `enablePersistence` usa caché local; un éxito de escritura en caché no confirma que haya llegado al servidor.
- No contamos con acceso a la consola Firebase del propietario ni a sus reglas actuales: **no se puede verificar que esté seguro ni desplegar reglas desde aquí**.

## Propuesta
1. Crear/seleccionar proyecto Firebase real y habilitar autenticación Firebase Auth. Usar identificación con sesión persistente.
2. Migrar gradualmente las rutas a `usuarios/{uid}/actividades/{id}`. No borrar ni migrar actividades previas sin una copia exportada.
3. Aplicar y probar `firebase.rules` en emuladores (deny-by-default) antes de desplegarlo. **No instalar estas reglas tal cual hasta migrar el cliente**, pues bloquearían la app antigua.
4. Mostrar tres estados distintos: guardado en teléfono / pendiente de servidor / confirmado por servidor.
5. Mantener datos GPS privados y evitar subir trazas reales al repositorio público.
6. Implementar Escuadrón con miembros autenticados, expiración temporal, consentimiento y revocación; hasta entonces NO usarlo para compartir ubicación privada.
7. Netlify no es una nube de actividades por sí solo: sirve archivos web; el historial requiere backend y/o almacenamiento local seguro.

## Siguiente validación
Solicitar URL de Netlify y acceso autorizado a configuración de Firebase si se desea revisar despliegue real. No compartir claves privadas.
