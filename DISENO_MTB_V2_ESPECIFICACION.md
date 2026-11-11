# Radar Táctico MTB · Diseño V2 «Verde táctico» — Especificación

Estado: **PROPUESTA PARA REVISIÓN** (no aprobada; no reemplaza a `DISENO_MTB.md` hasta que el usuario la valide).
Fecha: 2026-11-03.
Acompaña a: `radar-tactico-v2-prototipo.html` (un solo archivo, funciona sin conexión).
Base de código leída: repositorio `fernandezbjuanma-wq/proyectmtb` (`index.html`, `sw.js`, `DISENO_MTB.md`, `ESTADO_ACTUAL.md`, `DECISIONES.md`, `PLAN_DESARROLLO.md`, `AGENTS.md`, `CLAUDE.md`).
**Este documento y el prototipo no modifican `index.html`.**

> Formato pensado para el flujo del repo: el contenido se puede pegar como propuesta de actualización de `DISENO_MTB.md` en una rama aparte, siguiendo la «Lista de comprobación de aprobación visual» (sección 13).

---

## 1. Resumen

- Se mantienen las **cuatro pestañas**: Preparación, Radar, Laboratorio, Historial.
- Se adopta la dirección visual **Verde táctico** (fondo casi negro verdoso, acento verde menta, semáforo verde/amarillo/rojo para el terreno).
- **El mapa del trayecto que se está grabando es el protagonista del Radar.** El Radar tiene tres vistas: **Mapa** (nueva, por defecto), **Cabina** (boceto A) y **Subida** (boceto B).
- En la vista Mapa el mapa ocupa ~58 % de la pantalla (390 × 844) con el panel de datos compacto, ~68 % con el panel oculto. La traza grabada y la ruta por delante van **coloreadas por terreno** (el mismo semáforo del radar).
- Todas las funciones que se encontraron en `index.html` tienen lugar en el diseño (matriz en la sección 8). Lo que es nuevo está marcado **Propuesta** y lo que el prototipo solo simula está marcado **Demo**.
- Los números de los bocetos (14,2 km/h · 6,2 % · 212 W · 6,82 km · 42:18 · +312 m · 486 kcal · pared a 400 m) son **valores de muestra**. El escenario «Boceto» del prototipo los reproduce.
- No hay datos reales: la ruta, el mapa, las coordenadas y las salidas del historial son **sintéticos**.

## 2. Cómo probar el prototipo

| Qué | Cómo |
|---|---|
| Ver el diseño | Abrir el `.html` en el navegador (escritorio: teléfono con marco + panel **Tweaks** a la derecha; celular: pantalla completa) |
| Variaciones | Panel **Tweaks** (en celular: Radar › ícono de ajustes › «Panel de diseño») |
| Estados reales | Tweaks › *Escenarios y simulación*: Boceto, Antes de salir, Entrando a la pared, Segmento en curso, Pausado, GPS débil, Sin GPS, Sin red con mapa, Sin red sin mapa, Todo activo, Detección de caída, Informe final |
| Ver qué función respalda cada elemento | Tweaks › *Dispositivo y anotaciones* › «Anotaciones»: verde = existe en el código · amarillo = demo · violeta = propuesta |
| Atajos por URL | `#scen=pared&tab=lab&view=cabina&pal=sol&an=1&tw=0` |

Qué **no** hace: no usa GPS, sensores, cámara de forma obligatoria ni red. La voz usa la síntesis del navegador si existe (apagada por defecto). La cámara de BikeFit se pide solo si se toca «Cámara».

---

## 3. Principios y reglas de honestidad

Tomados de `DISENO_MTB.md`, `AGENTS.md` y `ESTADO_ACTUAL.md`, y aplicados en el prototipo:

1. **Una mano, sol, lluvia y movimiento**: objetivos táctiles ≥ 44 × 44 px; números grandes; sin más de 3 niveles de jerarquía por pantalla.
2. **Estados distintos y visibles**: grabando · pausado · sin GPS · GPS débil · buscando · sin red · sin mapa · sincronización pendiente (sección 9). Nunca se mezclan.
3. **Texto + ícono, no solo color**: toda zona/estado lleva palabra e ícono (Pared ▲▲, Trepada ↗, Llano =, Bajada ↘). Hay paleta apta para daltonismo.
4. **Finalizar tiene confirmación obligatoria** y los botones «Seguir grabando» / «Finalizar y guardar» van separados (18 px) y distintos en color.
5. **SOS nunca insinúa que avisó a alguien**: abre un mensaje de WhatsApp con la última posición registrada; la persona elige contacto y toca Enviar. Sin posición válida, el botón se deshabilita (no se inventan coordenadas). Cuenta de caída de 30 s que **no envía sola**.
6. **Estimaciones marcadas «est.»**: potencia (Bike IQ), calorías, TSS, IF, recuperación, nutrición, desgaste.
7. **Sin red ≠ sin mapa**: «Sin conexión con mapa descargado» y «Sin conexión y sin mapa» son estados distintos y se dicen tal cual.
8. **«Subida a la nube» solo cuando el servidor confirma.** Hasta entonces: «Pendiente».
9. **Datos sintéticos rotulados** («Traza de demostración», coordenadas ficticias en SOS).
10. **Sin claves, teléfonos ni GPX personales** en el prototipo ni en esta especificación (el repo es público).

---

## 4. Sistema visual

### 4.1 Tokens de color (paleta por defecto «Verde táctico»)

| Token | Valor | Uso | Contraste* |
|---|---|---|---|
| `--bg` | `#0A110F` | fondo de app | — |
| `--bg2` | `#0D1613` | barra inferior, hojas, panel de datos | — |
| `--surface` | `#121C19` | tarjetas | — |
| `--surface2` | `#17231F` | campos, chips | — |
| `--line` / `--line2` | `#243430` / `#314842` | bordes | — |
| `--text` | `#EDF4F1` | texto principal | 17,1 : 1 |
| `--muted` | `#93A8A0` | texto secundario | 7,6 : 1 |
| `--dim` | `#7A8F88` | notas terciarias (nunca información esencial) | 5,6 : 1 |
| `--acc` | `#3DDC97` | acción principal, estado correcto | 10,8 : 1 |
| `--g` (verde) | `#3DDC97` | llano / bajada / OK | 10,8 : 1 |
| `--y` (amarillo) | `#FFC53D` | trepada / atención | 12,1 : 1 |
| `--r` (rojo) | `#FF5C4D` | pared / peligro | 6,3 : 1 |
| `--d` | `#4DA8DA` | agua, información | 7,2 : 1 |
| tinta sobre acento | `#04140D` / `#1b1300` / `#1d0502` | texto sobre verde / amarillo / rojo | 10,7 / 11,7 / 6,4 : 1 |
| `--glass` | `rgba(10,17,15,.82)` + blur 10 px | superposiciones sobre el mapa | — |

\*Contraste sobre `--bg`. Valores calculados con la fórmula WCAG.

**Paletas alternativas (no aprobadas, solo para comparar):** Semáforo (`#121210`), HUD (`#000`, acento cian `#4FD8F0`), Cerro (`#0E1424`, acento naranja `#FF8A3D`), **Solar** (alto contraste para sol directo: fondo `#F3F0E8`, texto `#15191A` 15,6 : 1, verde `#0A7A47`, amarillo `#B87D00`, rojo `#C42F1B`; texto amarillo/rojo sobre claro usa `#8A5E00` / `#B42E1A`).
**Zonas aptas para daltonismo:** azul `#3B9BFF` · ámbar `#FFB000` · magenta `#E6007E` (en Solar: `#0B5FC4` · `#C98A00` · `#B3005F`).
**Contraste alto:** aclara `--muted`, `--line` y sube el borde a 1,5 px.

### 4.2 Tipografía

| Rol | Fuente por defecto | Tamaños (390 px de ancho) |
|---|---|---|
| Números y títulos | **Barlow Condensed 700** | velocidad Cabina 96 · tramo próximo 104 · panel Mapa 46 / 58 · tarjetas 40 · títulos de página 40 · hojas 26 |
| Texto | **Barlow 400–700** | 13–18 |
| Etiquetas | Barlow 600, mayúsculas, interletrado .10–.13 em | 10,5–12 |

Alternativas en Tweaks: Archivo, Big Shoulders + Public Sans, B612 (diseñada para cabinas). Las fuentes se **embeben** (no hay CDN): para el repo conviene servir los `.woff2` locales y precachearlos en `sw.js`.
Números siempre `tabular-nums`. Formato es-AR (`4.320`, `6,82`, `−`).

### 4.3 Forma, espacio y movimiento

- Radio base 18 px (Tweaks 6–30). Botones: radio ×0,72. Bordes 1 px.
- Densidad: compacta ×0,84 · normal ×1 · amplia ×1,14.
- Altura de botones principales 52 px; secundarios 40 px; mínimo 32 px (solo acciones no críticas).
- Animaciones cortas (≤ .26 s); respeta `prefers-reduced-motion`.
- Íconos de trazo 2 px, 24 × 24 (set propio, estilo Lucide). Sin emojis en la interfaz final.

---

## 5. Componentes

| Componente | Clase | Uso | Estados / reglas |
|---|---|---|---|
| Barra inferior | `.nav` | 4 pestañas | 3 estilos: barra · solo íconos · flotante; la activa lleva ícono + etiqueta + indicador |
| Segmentado | `.seg` | Mapa/Cabina/Subida, modos, pestañas | uno activo; versión con scroll horizontal |
| Píldora de estado | `.pill` | GPS, Voz | `ok` · `warn` (parpadea) · `bad` · `off`; siempre con palabra |
| Chip REC | `.rec` | grabación | LISTO · REC mm:ss · PAUSA mm:ss · GUARDADA |
| Banner de sistema | `.sysbar` | GPS/red/pausa/sync | una sola línea de mensaje por prioridad (sección 9) |
| Tarjeta de aviso | `.aviso` / `.malert` | aviso táctico del coach | color por zona (g/y/r) + ícono + texto; toque = repetir por voz |
| Tarjeta métrica | `.mcard` | velocidad, inclinación, potencia | `est.` en las estimadas |
| Stat | `.stat` | grillas de 4 | número + unidad + etiqueta |
| Perfil de terreno | `.ribbon` (SVG) | terreno adelante | ventana −150 m / +1.600 m, áreas por zona, marcador VOS, etiqueta «PARED n %» |
| Tarjeta de tramo | `.hero` | vista Subida | distancia gigante + descripción + perfil |
| Lista de acciones | `.lrow` | Preparación | ícono + título + subtítulo de estado + chevron |
| Fila de salida | `.act` | Historial | día/semana · título · km/+m/tiempo · estado de nube |
| Botones | `.btn-p/-s/-o/-d/-dp/-y/-strava` | | primario verde · secundario · contorno · peligro (contorno / sólido) · amarillo = reanudar |
| Hoja inferior | `.sheet` | herramientas, SOS, ghost, escuadrón, nube, informe | cierra con ✕, fondo o Esc |
| Diálogo | `.dialog` | confirmaciones | botones apilados |
| Toast | `.toast` | confirmaciones breves | ok / warn / bad; no bloquean toques |
| Campo | `.fld` | formularios | etiqueta chica arriba, valor 17 px |
| Interruptor | `.tgl` | opciones | |
| Dock | `.dock` | datos bajo el mapa | completo · compacto (defecto) · oculto, se cambia con el asa |
| Controles de mapa | `.mbtn` | SOS, inicio, zoom, capas, orientación, centrar | 44 × 44 px, vidrio |

---

## 6. Pantallas

### 6.1 Radar (pestaña central)

**Cabecera común (todas las vistas):** logo · píldora GPS · píldora Voz · botón de herramientas (hoja «Cabina y herramientas»). Debajo: banner de sistema (si corresponde) y fila `Mapa | Cabina | Subida` + chip REC.

#### Vista MAPA (nueva, por defecto)

Jerarquía (de arriba hacia abajo):
1. Tira de recorrido: **km · tiempo · +desnivel** (34 px, sobre el mapa).
2. **Tarjeta de aviso compacta** sobre el mapa: ícono, título («Pared 11 % durante 300 m»), subtítulo y **distancia grande** («400 m») cuando hay un tramo por delante. Toque = repetir por voz.
3. **Mapa del trayecto** (ver sección 7).
4. Controles laterales: izquierda **SOS · volver al inicio · + · −**; derecha **capas · orientación · centrar**. Abajo: escala y píldoras de widgets activos (liebre, segmento, plan, volver al inicio, mapa offline).
5. **Dock** (asa para cambiar tamaño):
   - *Completo:* velocidad / inclinación / potencia + perfil «Terreno adelante» + controles.
   - *Compacto (defecto):* las tres métricas + controles.
   - *Oculto:* velocidad e inclinación en una línea + Pausar + Finalizar (solo ícono).
6. Controles de grabación: **Iniciar / Pausar / Reanudar** (grande, 52 px) y **Finalizar** (contorno rojo; abre confirmación).

#### Vista CABINA (boceto A «Cabina»)

Modos de entrenamiento (scroll) → tarjeta de aviso → widgets activos → **minimapa** (acceso al mapa) → velocidad 96 px + inclinación + potencia → barra de zona de potencia (Z1–Z6+) → «Terreno adelante» con pendiente media de los próximos 1,5 km → 4 stats (distancia, tiempo, ascenso, calorías est.) → Pausar / Finalizar.

#### Vista SUBIDA (boceto B «Anticipación»)

Tarjeta «Próximo tramo» con distancia a 104 px («400 m»), «Pared de 11 % durante 300 m» y perfil → **minimapa** → velocidad / inclinación / potencia → widgets → lista «Después» (A 700 m · Trepada 6 % · 400 m; A 1,1 km · Llano y bajada · 500 m) → 4 stats → controles.

**Reglas comunes:** el color del aviso, del chip de zona y del perfil usan el mismo semáforo; el bloqueo antisudor, la caída y el SOS cubren toda la pantalla; si no hay track cargado, «Terreno adelante» dice «Sin track cargado» (no inventa pendientes) y el aviso pasa a «PACING COACH · SIN TRACK».

### 6.2 Preparación

Título «Preparación · Ajustes antes de subir al cerro».
1. **Lista para salir** (4 casillas, «4 de 4»): casco y gafas · hidratación con sales · celu > 70 % · llave allen y cámara. Muestra la batería actual (*Propuesta:* tildar sola la casilla del celular).
2. **Presión de cubiertas (SILCA)**: peso + bici, cubierta, sistema, terreno → PSI y bar delantera/trasera + consejo. Se recalcula al cambiar (en el código actual hay un botón «Calcular»).
3. Lista de hojas: **Mantenimiento** (cadena, pastillas, cubiertas con % y estado en texto; «Marcar nuevo» con confirmación) · **Ruta GPX** (cargar, demo, quitar; perfil completo y tramos que va a avisar) · **BikeFit** (3 puntos arrastrables, ángulo de flexión, diagnóstico; foto o cámara) · **Segmentos y PR** (lista, crear con inicio/fin sobre la ruta o «mi posición», eliminar, ejemplos) · **Coach de entrenamiento** (4 planes, fases, activar/desactivar).

### 6.3 Laboratorio

Título «Laboratorio · Informe de la última salida» + estado de nube.
1. **Mapa de la traza** (coloreada por zona) con el título y la fecha de la salida, y botón «Explorar».
2. **Perfil con explorador**: arrastrar sobre el perfil mueve un marcador en el mapa; muestra km, altura, pendiente y tipo de terreno.
3. **Rendimiento**: distancia, tiempo en movimiento, desnivel, vel. media, vel. máxima, potencia media (est.), cota cumbre, potencia pico (est.).
4. **Carga y zonas**: TSS (est.), IF, recuperación; barra de zonas y minutos por zona.
5. **Pared más dura** y **Segmentos PR**; lista de segmentos de la salida.
6. **Nutrición y recarga** (kcal est., carbohidratos, líquidos + sales; tres sugerencias).
7. **Descargar GPX** · **Subir a Strava** (descarga el GPX y abre la página de carga; no sube solo) · eliminar del teléfono (con confirmación).

### 6.4 Historial

Acumulado (km, desnivel, salidas) → pestañas **En este teléfono · N / En la nube · M** → franja amarilla «N salidas sin subir a la nube» con **Sincronizar** → salidas agrupadas por mes (día/semana, título, km · +m · tiempo, ícono de nube con texto accesible) → toque abre el informe en Laboratorio. Botón de nube (arriba a la derecha) abre «Nube y respaldos».

### 6.5 Hojas y diálogos transversales

| Elemento | Contenido |
|---|---|
| Cabina y herramientas | modo, HIIT, modo solar, bloqueo antisudor, voz, repetir aviso, ghost, escuadrón, nube, SOS, modo bici/vehículo, simulador, (solo prototipo) Tweaks |
| SOS · WhatsApp | aviso de límites, última posición con antigüedad y precisión, texto del mensaje, «Abrir WhatsApp» |
| Posible caída | 30 s, «Estoy bien · cancelar»; al vencer, explica que **no se envía solo** |
| Bloqueo antisudor | velocidad e inclinación visibles; desbloqueo manteniendo 2 s |
| Finalizar | confirmación con resumen y botones separados |
| Informe de sesión | km/tiempo/desnivel, mapa de la traza, estado de nube, «Ver informe completo», «Explorar ruta», GPX, eliminar |
| Ghost Pacer | ritmo fijo / ruta GPX / mejor salida; liebre en mapa y widget ± segundos |
| Escuadrón | alias, código de sala, conectar, lista de ciclistas, compañeros simulados (demo) |
| Nube y respaldos | estado, probar conexión, subir/bajar, exportar/restaurar `.json`, proyecto Firebase propio |
| Simulador GPX | velocidad 1×–30×, reproducir/pausar/detener |

---

## 7. Especificación del mapa del trayecto (prioridad del usuario)

### 7.1 Objetivos
1. Ver **dónde estoy, por dónde vine y por dónde sigo**, de un vistazo y con una mano.
2. Ver **qué terreno viene** sin leer números: la ruta por delante está coloreada con el mismo semáforo.
3. Funcionar **sin conexión** y decir con honestidad qué falta.

### 7.2 Capas (de abajo hacia arriba)
| # | Capa | Detalle |
|---|---|---|
| 1 | Mapa base | 4 estilos: Táctico oscuro (defecto), Topográfico, Satélite, Solar claro; «Auto» sigue a la paleta (Solar → mapa claro) |
| 2 | Vegetación, agua, senderos (trazos) y caminos | senderos punteados; caminos con contorno |
| 3 | Curvas de nivel | cada 10 m, resaltadas cada 50 m; se pueden apagar |
| 4 | **Ruta GPX por delante** | contorno oscuro + línea coloreada por zona (86 % del grosor) + punteado blanco |
| 5 | **Traza grabada** | contorno oscuro + línea coloreada por zona; grosor 3–11 px (defecto 6) |
| 6 | Volver al inicio | línea punteada cian sobre la propia huella (*Propuesta MTB-01*) |
| 7 | Kilómetros, nombres, segmentos | discos numerados, etiquetas con halo; los segmentos solo con zoom cercano |
| 8 | Inicio y meta | disco blanco / bandera |
| 9 | **Pared por delante** | pin rojo con «!» + etiqueta «PARED 11 % · 400 m» |
| 10 | Liebre y escuadrón | disco violeta «L» · discos azules con inicial y velocidad |
| 11 | **Ciclista** | disco con halo; **círculo de precisión** = ±m del GPS; **cono de rumbo** |

Modos de color de la traza: *Semáforo* (defecto) · *Velocidad* (azul→rojo) · *Un color*.

### 7.3 Cámara
- **Seguir** (defecto): el ciclista queda al **70 %** de la altura del mapa (66 % en minimapas) para dejar el mayor espacio al camino por delante.
- **Rumbo arriba** (defecto): el mapa rota para que el avance apunte hacia arriba; el botón de brújula alterna con «Norte arriba» y aparece una flecha del norte cuando está rotado.
- **Zoom automático por velocidad** (metros por píxel): < 10 km/h → 2,6 · < 18 → 3,4 · < 26 → 4,4 · más → 5,4; suavizado. Rango manual 0,8–16 m/px.
- **Arrastrar** el mapa suspende el seguimiento; **pellizco / rueda / doble toque** hacen zoom y suspenden el zoom automático. El botón **Centrar** (objetivo) restablece seguimiento y zoom automático.
- «Encuadrar toda la ruta» en el menú de capas.
- Escala dinámica abajo a la izquierda (1-2-5 × 10ⁿ m).

### 7.4 Controles y ubicación (zona del pulgar)
- Izquierda: **SOS** (rojo) · volver al inicio · + · −. SOS queda lejos de Finalizar y requiere abrir la hoja de confirmación.
- Derecha: capas · orientación · centrar.
- Todos 44 × 44 px. Cuando el mapa mide < 340 px de alto (dock completo + banner) se ocultan zoom y brújula.
- Menú de capas: mapa base, capas (ruta, kilómetros, segmentos, curvas, nombres), encuadrar, volver al inicio.

### 7.5 Estados del mapa
| Estado | Qué se ve |
|---|---|
| GPS bueno | disco verde, círculo de precisión sólido, cono de rumbo |
| GPS débil (±19 m) | círculo ámbar punteado más grande + banner amarillo («la distancia y el desnivel pueden ser imprecisos») + píldora «GPS ±19» |
| Buscando satélites | disco amarillo, sin círculo ni cono; banner; no deja iniciar |
| **Sin señal GPS** | disco gris con etiqueta «última posición», banner rojo con segundos desde la última posición válida; **la grabación espera** |
| Sin conexión con mapa descargado | banner informativo + píldora «Mapa offline»; todo se sigue dibujando |
| **Sin conexión y sin mapa** | fondo con cuadrícula + nota «Sin mapa de fondo: solo se dibuja tu traza» + píldora amarilla; la traza y la ruta siguen visibles |
| Sin track cargado | se dibuja solo la traza grabada; avisos de terreno dicen «sin track» |
| Pausado | banner amarillo «no se suma distancia ni tiempo»; botón amarillo «Reanudar» |

### 7.6 Implementación sugerida en el repo
El código actual usa **Leaflet 1.9.4** (`#mapa`, capas CyclOSM / OpenTopo / Satélite desde servidores en línea) y un bloque de 260 px al final del Radar oculto hasta el primer fix. El prototipo dibuja en `<canvas>` solo para ser autónomo; **no hay que copiar el canvas**. Equivalencias:

| Diseño | En Leaflet |
|---|---|
| Traza por zona | un `L.polyline` por tramo de igual color (los tramos ya salen de `actualizarClimbPro`); contorno = polilínea inferior más gruesa y oscura |
| Ruta por delante | idem, con `dashArray` blanco encima |
| Ciclista, precisión, cono | `L.circleMarker` + `L.circle` (radio = precisión) + marcador `L.divIcon` rotado |
| Controles | controles HTML propios sobre el contenedor (no `L.control.layers`) |
| Rumbo arriba | **no existe en Leaflet puro**: requiere un plugin de rotación o migrar a MapLibre GL (riesgo, sección 12) |
| Zoom automático | `mapa.setZoom()` suavizado según velocidad |
| Mapa offline | **Propuesta MTB-01**: hoy `sw.js` no descarga paquetes de mapa de forma controlada; falta un gestor de descarga por región (con licencia válida del proveedor), estimador de tamaño, verificación de cobertura y caducidad |
| Curvas de nivel | requieren un proveedor/capa con curvas (OpenTopo ya las trae); en el prototipo son sintéticas |

---

## 8. Matriz de funciones

Estado: **E** = existe en el código (el diseño solo cambia su presentación) · **D** = demo en el prototipo (la lógica real existe o hay que verificarla) · **P** = propuesta nueva.
«Código» cita funciones/ids de `index.html` verificados con `grep` el 2026-11-03.

### 8.1 Radar

| Función | Código | Estado | Dónde (diseño) | Trabajo |
|---|---|---|---|---|
| Señal GPS | `pildora-gps-header`, `actualizarSenalGPS()` | E | píldora + banner | mapear 4 estados |
| Voz del coach | `pildora-voz-header` | E | píldora «Voz» | |
| Ajustes de cabina | `btn-header-ajustes`, `toggleRanuraCockpit()` | E | hoja «Cabina y herramientas» | |
| Modo de entrenamiento | `cambiarModoEntrenamiento()`, `selector-modo-scroll` | E | Cabina + hoja | |
| Aviso táctico | `ui-card-aviso-tactico` | E | `.aviso` / `.malert` | |
| Repetir aviso | `repetirUltimoAvisoCoach()` | E | toque en el aviso + hoja | |
| Velocidad / objetivo | `card-velocidad-principal`, `calcularVelocidadTarget()` | E | tarjeta | |
| Inclinación / terreno | `ui-pendiente`, `badge-tipo-terreno` | E | tarjeta | |
| Potencia estimada | `calcularPotenciaVirtual()` | E | tarjeta «est.» | |
| Zonas de potencia | `grafico-zonas-box`, `actualizarGraficoZonas()` | E | barra Z1–Z6+ | |
| Terreno adelante | `widget-climbpro`, `actualizarClimbPro()` | E | `.ribbon` | rediseño visual |
| Vista Subida | — (datos de ClimbPro) | P | tercera vista | |
| Mapa Leaflet | `#mapa`, `mapa = L.map` | E → P | vista Mapa a pantalla grande | rediseño (sección 7) |
| Capas de mapa | `L.control.layers` (CyclOSM / OpenTopo / Satélite) | E | menú de capas | |
| Centrar | `mapa.panTo` | E | botón «centrar» | |
| Traza por zona, rumbo arriba, zoom automático, escala | — | P | mapa | |
| Volver al inicio por la huella | — | P (MTB-01) | botón + capa | avisos de tramo; no es ruta calculada |
| Mapa offline | — | P (MTB-01) | Preparación › Ruta + estado | |
| Iniciar / Pausar / Reanudar | `toggleIniciarPausar()` | E | botones | |
| Finalizar | `finalizarEntrenamiento()` | E + P | botón + diálogo | confirmación obligatoria |
| SOS WhatsApp | `compartirUbicacionWhatsApp()` | E | hoja | texto honesto, sin coordenadas inventadas |
| Detección de caída | `cancelarAlertaCaida()` (acelerómetro 3,2 G · 30 s) | E | pantalla completa | no envía solo |
| Bloqueo antisudor | `activarBloqueoPantalla()`, `desbloquearPantalla()` | E | pantalla completa | |
| Modo solar | `toggleModoSolar()` | E | hoja → paleta Solar | |
| Ghost Pacer | `abrirModalGhostPacer()`, `toggleGhostPacer()` | E | hoja + widget + liebre | |
| Escuadrón | `abrirModalEscuadron()`, `toggleConexionEscuadron()`, `toggleDemoEscuadron()` | E / D | hoja + mapa | consentimiento, expiración y reglas sin validar (MTB-07) |
| Segmento en vivo | `banner-segmento-live` | E | widget | |
| Plan de entrenamiento | `widget-plan-entrenamiento` | E | widget | |
| HIIT | `toggleIntervalosHIIT()`, `configurarZonaAtaqueHIIT()` | E | hoja | |
| Modo vehículo | `toggleModoVehiculoPermitido()` | E | hoja | |
| Simulador GPX | `abrirPanelSimulador()`, `togglePlayPausaSim()`, `cambiarVelocidadSim()`, `detenerSimulador()` | E | hoja | |
| Nube y respaldos | `abrirConfigNube()`, `probarConexionFirebase()`, `sincronizarPendientesFirestore()`, `descargarTodasDeNubeALocal()`, `exportarBackupCompleto()`, `importarBackupJSON()`, `guardarConfigFirebasePersonalizada()`, `restaurarConfigFirebaseDefault()` | E | hoja | |

### 8.2 Preparación

| Función | Código | Estado |
|---|---|---|
| Checklist | «Checklist rápido de seguridad» | E |
| Presión SILCA | `calcularPresionSilca()`, `silca-*` | E |
| Odómetro y desgaste | `actualizarOdometroUI()`, `resetearComponenteOdometro()` | E |
| Ruta GPX | `cargarArchivoGPX()`, `cargarGPXPorDefecto()`, `input-gpx` | E (el prototipo solo valida el archivo) |
| BikeFit | `toggleCamaraBikeFit()`, `congelarOReanudarBikeFit()`, `cargarFotoBikeFit()`, `resetearPuntosBikeFit()`, `guardarAjusteBikeFit()` | E (puntos manuales) |
| Segmentos privados | `abrirModalNuevoSegmento()`, `guardarNuevoSegmento()`, `cargarSegmentosEjemplo()`, `renderizarListaSegmentos()`, `eliminarSegmento()` | E |
| Planificador IA | `seleccionarPlanIA()`, `activarPlanSeleccionado()` | E |
| Batería → casilla automática | — | P |
| Mi garaje (más componentes) | — | P (MTB-06) |
| Configurar campos del Radar | — | P (MTB-02; el dock y las vistas del prototipo son el anticipo) |
| Avisos por prioridad / frecuencia | — | P (MTB-04) |

### 8.3 Laboratorio e Historial

| Función | Código | Estado |
|---|---|---|
| Métricas, TSS, IF, zonas, nutrición | ids `lab-*` | E |
| Descargar GPX | `generarDescargaGPX()`, `descargarGPXDeActividadObjeto()` | E |
| Subir a Strava | `abrirStravaUpload()` (descarga GPX y abre `strava.com/upload/select`) | E |
| Mapa de la salida + explorador | `abrirActividadEnMapaScrubber()`, `enfocarMapaScrubber()`, `reabrirReproductorRuta()` | E → mapa y perfil rediseñados |
| Eliminar salida | `eliminarActividad()` | E |
| Totales acumulados | `actualizarTotalesCiclistaHistorial()` | E |
| Pestañas teléfono / nube | `cambiarPestanaHistorial()` | E |
| Lista de salidas | `renderizarListaActividades()`, `verReporteDeActividadObjeto()` | E |
| Sincronizar / Backup / Nube | `sincronizarPendientesFirestore()`, `exportarBackupCompleto()`, `abrirConfigNube()` | E |
| Calendario, récords personales, evolución mensual | — | P (`DISENO_MTB.md`) |
| Comparador de recorridos | — | P (MTB-05) |
| Desafíos y progreso | — | P (MTB-08) |

**No incluido en esta entrega:** comparador de recorridos, desafíos, calendario, garaje completo, configuración de perfiles del Radar. El diseño deja lugar pero no los dibuja.

---

## 9. Matriz de estados del sistema

Prioridad del banner (arriba gana): **Sin GPS** > Buscando > GPS débil > Sin red > Pausa > Pendiente de subir.

| Estado | Píldora GPS | Banner | Chip REC | Botón principal | Mapa |
|---|---|---|---|---|---|
| Antes de salir | «Buscando» → «GPS» | «Buscando satélites…» | LISTO | Iniciar (no deja si no hay GPS) | ciclista amarillo |
| Grabando, GPS ok | «GPS» verde | — | REC mm:ss | Pausar | normal |
| GPS débil | «GPS ±19» ámbar | advertencia de imprecisión | REC | Pausar | círculo grande punteado |
| Sin GPS | «Sin GPS» rojo | «la grabación espera · última posición hace N s» | REC (tiempo quieto) | Pausar | disco gris «última posición» |
| Sin red + mapa | «GPS» | informativo | REC | | + píldora «Mapa offline» |
| Sin red, sin mapa | «GPS» | amarillo | REC | | cuadrícula + nota |
| Pausado | | amarillo | PAUSA mm:ss | **Reanudar** (amarillo) | |
| Finalizada | | | GUARDADA | Nueva salida | informe |
| Pendiente de nube | | «N salidas sin subir» (solo en reposo) | | | |

---

## 10. Fórmulas usadas y discrepancias detectadas

### 10.1 Tomadas del código (el prototipo las replica)
- **Zonas de terreno:** pendiente < −2 % bajada · ≤ 2 % llano · 2–8 % trepada · > 8 % pared.
- **Potencia estimada:** masa 85 kg, Crr 0,008, CdA 0,45, eficiencia 0,95, ρ 1,205 (gravedad + rodadura + aire).
- **Zonas de potencia:** Z1 < 100 W · Z2 ≤ 170 · Z3 ≤ 220 · Z4 ≤ 275 · Z5 ≤ 340 · Z6+.
- **IF** = (z1·0,65 + z2·0,85 + z3·1,15)/tiempo · **TSS** = horas·IF²·100 · **recuperación** = clamp(TSS·0,4, 12, 48) h.
- **Nutrición:** carbohidratos = max(30, kcal·0,5/4) g; líquidos = max(400, h·650 + desnivel·0,4) ml.
- **SILCA:** base 25 PSI + (peso − 75)·0,25; ancho ≤ 2,10 → +3,5, ≥ 2,35 → −1,5, ≥ 2,40 → −3, ≥ 2,60 → −5,5; tubeless −2,5; terreno asfalto +5 / roca −2 / barro −3; trasera = base, delantera = base − 2,5; 1 PSI = 0,0689476 bar.
- **Odómetro:** cadena (km + desnivel/100)/1.500; pastillas (km + desnivel/150)/1.200; cubiertas km/2.500. Amarillo > 60 %, rojo > 85 %.
- **BikeFit:** flexión óptima 25°–35°; < 25° asiento alto; > 35° bajo.
- **Velocidad objetivo** por modo (Fondo, HIIT, Escalada, Umbral, Recuperación, Libre) con la misma tabla del código.

### 10.2 Discrepancias para resolver (no se escondieron en el prototipo)
| # | Hallazgo | Qué hace el prototipo | Decisión pendiente |
|---|---|---|---|
| 1 | El HTML estático de SILCA muestra 23,5 / 26,0 PSI, pero la fórmula con los valores por defecto (78 kg, 2,25", tubeless, seco) da **20,8 / 23,3 PSI** | usa la fórmula | corregir el HTML o la fórmula |
| 2 | Recuperación: el HTML estático dice «24 horas»; la fórmula da 34 h para TSS 84 | la salida de muestra muestra 24 h (como el boceto) y las nuevas usan la fórmula | unificar |
| 3 | Masa del modelo de potencia 85 kg vs. «Peso + bici» SILCA 78 kg | cada uno con su valor | un único perfil «ciclista + bici» (MTB-06) |
| 4 | Los bocetos mostraban desgaste 0 % | el prototipo usa valores de ejemplo para mostrar los 3 estados | |
| 5 | «Pared 11 % durante 300 m» del boceto vs. la ruta sintética (~11,4 % máx.) | en el escenario Boceto se fija el texto del boceto | ninguno (es muestra) |
| 6 | BikeFit se presenta como «IA óptica» pero los puntos son manuales | el prototipo dice «guía, no diagnóstico» | cambiar el rótulo o implementar detección |
| 7 | Strava: no hay subida real, solo descarga + página de carga | lo dice en el diálogo | |
| 8 | Persistencia en `localStorage` (11 usos) y el historial incluye puntos de traza | se persiste solo la configuración del prototipo | evaluar IndexedDB para puntos (cuota y borrados) |
| 9 | `index.html` referencia `zona_verde.mp3`, `zona_amarilla.mp3`, `zona_roja.mp3` | la voz usa síntesis del navegador | verificar que los audios existan y estén en `sw.js` |
| 10 | La PWA no garantiza grabar con pantalla bloqueada o app suspendida | el prototipo no graba | probar en celular real antes de prometerlo |

---

## 11. Criterios de aceptación

**Generales**
- [ ] Todas las pantallas se usan sin desplazamiento horizontal desde 320 px de ancho.
- [ ] Objetivos táctiles ≥ 44 × 44 px; separación ≥ 10 px entre Pausar y Finalizar y confirmación obligatoria al finalizar.
- [ ] Ningún estado depende solo del color (texto + ícono).
- [ ] Texto esencial con contraste ≥ 4,5 : 1 y elementos gráficos ≥ 3 : 1 en las paletas Verde y Solar.
- [ ] Datos estimados con «est.»; datos sintéticos rotulados.
- [ ] Lectura de velocidad e inclinación a 1 m del celular, al sol, con la paleta Solar.

**Radar › Mapa**
- [ ] El mapa ocupa ≥ 55 % del alto con dock compacto en 390 × 844.
- [ ] Se ven a la vez traza grabada, ruta por delante coloreada y ciclista con rumbo; la pared próxima está marcada con su distancia.
- [ ] Arrastrar suspende el seguimiento; «Centrar» lo restablece; el zoom automático responde a la velocidad.
- [ ] Los 8 estados de la sección 7.5 son distinguibles entre sí.
- [ ] Con 1 h de grabación el dibujo se mantiene fluido (≥ 30 fps al arrastrar) en un celular de gama media.
- [ ] Sin red y sin mapa, la traza sigue visible.

**Radar › Cabina / Subida**
- [ ] «Subida» reproduce el boceto B: 400 m · Pared de 11 % durante 300 m · A 700 m Trepada 6 % 400 m · A 1,1 km Llano y bajada 500 m.
- [ ] El aviso cambia de color y de texto al entrar a cada tipo de tramo.

**Preparación / Laboratorio / Historial**
- [ ] SILCA recalcula al instante y coincide con la fórmula.
- [ ] «Marcar nuevo» pide confirmación; el desgaste vuelve a 0 %.
- [ ] El informe de una salida muestra mapa, perfil explorable y métricas coherentes con las del historial.
- [ ] «Subida a la nube» solo aparece tras confirmación del servidor.

**Seguridad**
- [ ] SOS sin posición válida no ofrece enviar coordenadas.
- [ ] La cuenta de caída llega a 0 sin enviar nada por sí sola.

---

## 12. Riesgos y límites

1. **Rumbo arriba en Leaflet** necesita plugin o cambio de motor (MapLibre). Alternativa: norte arriba + cono de rumbo (menos legible en giros).
2. **Mapas offline**: licencias de los proveedores de teselas, tamaño de descarga y espacio de almacenamiento; no copiar tiles sin permiso.
3. **Curvas de nivel** y elevación: la precisión del desnivel del GPS es limitada; validar con datos de elevación del GPX (MTB-03).
4. **Rendimiento** de muchas polilíneas coloreadas en celulares modestos (agrupar tramos, simplificar la traza).
5. **Grabación con pantalla apagada** en una PWA no está garantizada.
6. **Fuentes** embebidas suman ~0,5 MB al HTML; en el repo conviene archivos `.woff2` precacheados.
7. El prototipo es **un solo archivo de ~0,7 MB**; no es la arquitectura del repo.
8. Diseño probado en un navegador de escritorio con viewport móvil: **falta probar en celular real** (sol, guantes, sudor).

---

## 13. Plan de implementación propuesto

Regla: **no tocar `index.html` hasta que el usuario apruebe**. Cada fase es un PR chico con su prueba, en una rama aparte, y lo pesado detrás de un interruptor (`?ui=v2`) hasta terminar.

| Fase | Qué | Prueba mínima |
|---|---|---|
| 0 | Aprobar: paleta, tipografía, componentes, vista Mapa y valores por defecto de Tweaks | checklist de `DISENO_MTB.md` |
| 1 | Tokens CSS y fuentes locales; componentes base (botones, tarjetas, píldoras, hojas) sin cambiar la lógica | capturas antes/después en 320, 390 y 430 px |
| 2 | Nueva barra inferior y re-skin de Preparación, Laboratorio e Historial | funciones de la sección 8.2/8.3 intactas |
| 3 | Radar: vistas Cabina (A) y Subida (B) con los datos existentes | simulador GPX con `Vuelta_ciclística_por_la_mañana.gpx` |
| 4 | Radar › Mapa: contenedor grande, dock, controles, traza y ruta por zona sobre Leaflet | simulador + estados GPS/red |
| 5 | MTB-01: volver al inicio y mapas offline | modo avión desde cero, cierre forzado |
| 6 | Pruebas en celular real y ajustes de contraste/tamaños | recorrido real corto con una persona acompañando |

Después de cada fase: actualizar `ESTADO_ACTUAL.md` (qué quedó probado y qué no) y `DECISIONES.md`.

---

## 14. Variaciones que expone el prototipo (Tweaks) y valores propuestos

| Grupo | Controles | Valor propuesto |
|---|---|---|
| Escenarios y simulación | 12 escenarios, simulador 1×–30×, GPS, red, mapa descargado, caída, bloqueo, SOS | — |
| Radar | vista, panel inferior, estilo de mapa, color de traza, grosor, 5 capas | Mapa · Compacto · Auto · Semáforo · 6 px · todas |
| Color | 5 paletas, zonas estándar/daltonismo, contraste, brillo | Verde táctico · estándar · normal · apagado |
| Tipografía | 4 familias, tamaño de números, tamaño de texto | Barlow Condensed · 100 % · 100 % |
| Forma y espacio | redondeo, densidad, borde, navegación, textura | 18 px · normal · 1 px · barra · ninguna |
| Dispositivo | 5 tamaños, marco, anotaciones, etiquetas «propuesta» | 390 × 844 |

---

## 15. Decisiones que necesito del usuario

1. ¿Vista **Mapa** como pantalla de inicio del Radar y **rumbo arriba** por defecto?
2. ¿Dock compacto por defecto (mapa grande) o completo (perfil de terreno siempre visible)?
3. ¿Se acepta la traza coloreada por terreno, o preferís un solo color y que el semáforo quede solo en el perfil?
4. SILCA: ¿cuál es el valor correcto, el estático (23,5 / 26,0) o la fórmula (20,8 / 23,3)?
5. Recuperación: ¿24 h fijas o la fórmula?
6. ¿Probamos primero Fase 1–2 (re-skin) o Fase 4 (mapa) en el repo?
7. ¿Se mantiene el rótulo «IA óptica» en BikeFit?

---

## Apéndice A · Valores de los bocetos (escenario «Boceto»)

| Dato | Valor |
|---|---|
| Velocidad · inclinación · potencia | 14,2 km/h · 6,2 % Trepada · 212 W |
| Recorrido | 6,82 km · 42:18 · +312 m · 486 kcal |
| Aviso | EN 400 m · «Pared 11 % durante 300 m» · «Bajá a plato chico y subí la cadencia» |
| Después | A 700 m Trepada 6 % 400 m · A 1,1 km Llano y bajada 500 m |
| Historial | 9 salidas · 186 km · +4.320 m · 7 en la nube · 2 sin subir |
| Laboratorio (última salida) | 24,6 km · 1:48 · +612 m · 13,6 / 41,2 km/h · 168 W · TSS 84 · IF 0,71 · 24 h · Z1 38 min · Z2 52 min · Z3 14 min · pared 12,4 % km 7,3 · 1.120 kcal · 85 g · 900 ml |
| Segmentos de ejemplo | La Bajada del Zorro 01:55 · Trepada de las Antenas 04:05 · Sendero de la Cascada 05:10 |

## Apéndice B · Archivos entregados

- `radar-tactico-v2-prototipo.html` — prototipo interactivo (sin dependencias externas).
- `DISENO_MTB_V2_ESPECIFICACION.md` — este documento.
