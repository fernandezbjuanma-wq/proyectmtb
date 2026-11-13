import re, os

index_path = r'C:\Users\coni_\OneDrive\Desktop\juan\GitHub\proyectmtb\index.html'
with open(index_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. READ CLEAN V2 CSS
clean_css_path = r'C:\Users\coni_\OneDrive\Desktop\juan\GitHub\proyectmtb\diseno-v2\herramientas\test_css_clean.css'
with open(clean_css_path, 'r', encoding='utf-8') as f:
    clean_css = f.read()

# Add Leaflet adjustments to clean_css
clean_css += """
/* Leaflet UI Overrides para diseno-v2 Verde Tactico */
.leaflet-control-layers, .leaflet-control-zoom { display: none !important; }
.leaflet-container { background: var(--bg) !important; font-family: var(--font-b) !important; }
.leaflet-control-attribution { background: var(--glass) !important; color: var(--muted) !important; font-size: 10px !important; }
.leaflet-control-attribution a { color: var(--acc) !important; text-decoration: none; }
#mapa { width: 100% !important; height: 100% !important; position: absolute !important; inset: 0 !important; }
"""

# Insert clean_css into <style> if not already present
if '/* ---------- cabecera del Radar ---------- */' not in html:
    # Insert right before </style>
    style_end = html.find('</style>')
    if style_end != -1:
        html = html[:style_end] + '\n/* V2 COMPONENTS & SCREENS CSS */\n' + clean_css + '\n' + html[style_end:]
        print("CSS rules injected into <style>.")
else:
    print("CSS rules already present.")

# 2. DEFINE THE OFFICIAL V2 TAB-RADAR HTML
tab_radar_html = """
    <!-- ======================================================== -->
    <!-- 2. PESTAÑA: RADAR LIVE (DISEÑO OFICIAL V2 VERDE TÁCTICO) -->
    <!-- ======================================================== -->
    <div id="tab-radar" class="tab-page tab active on" data-radar-view="mapa" data-view="mapa" aria-label="Radar en vivo">
        <!-- Cabecera táctica superior oficial V2 -->
        <header class="rh">
            <div class="logo">
                <svg class="ic" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>
                <b>Radar Táctico</b>
            </div>
            <div class="rh-r">
                <span class="pill ok" id="pGps" data-act="hdr.gps" title="Señal satelital GPS"><i class="dot"></i><span id="txtGps">GPS</span></span>
                <button type="button" class="pill ok" id="pVoz" data-act="hdr.voice" onclick="repetirUltimoAvisoCoach()" title="Voz del Pacing Coach"><i class="dot"></i><span>Voz</span></button>
                <button type="button" class="ibtn" id="bCab" data-act="hdr.cab" onclick="toggleRanuraCockpit()" aria-label="Ajustes de cabina y herramientas">
                    <svg class="ic" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 4h-7"/><path d="M10 4H3"/><path d="M21 12h-9"/><path d="M8 12H3"/><path d="M21 20h-5"/><path d="M12 20H3"/><path d="M14 2v4"/><path d="M8 10v4"/><path d="M16 18v4"/></svg>
                </button>
            </div>
        </header>

        <!-- Barra de estado del sistema (offline, buscando satélites, pausa...) -->
        <div class="sysbar" id="sysbar" hidden></div>

        <!-- Selector segmentado de vistas y chip de grabación REC -->
        <div class="vrow">
            <div class="seg" id="vseg">
                <button type="button" class="on" data-act="rv" data-v="mapa" onclick="cambiarVistaRadarV2('mapa')">Mapa</button>
                <button type="button" data-act="rv" data-v="cabina" onclick="cambiarVistaRadarV2('cabina')">Cabina</button>
                <button type="button" data-act="rv" data-v="subida" onclick="cambiarVistaRadarV2('subida')">Subida</button>
            </div>
            <div class="rec" id="recChip"><i></i><span id="recChipTxt">LISTO</span></div>
        </div>

        <!-- Cuerpo del radar con las 3 vistas tácticas -->
        <div class="rbody" id="rbody" data-view="mapa">
            <!-- VISTA 1: MAPA HÉROE (Referencia 01, 02, 03, 06) -->
            <section class="v v-mapa">
                <div class="mapwrap" id="mapwrap">
                    <!-- Mapa interactivo Leaflet a pantalla completa -->
                    <div id="mapa"></div>

                    <!-- Overlay Superior: Métricas de franja y aviso táctico -->
                    <div class="mo mo-top">
                        <div class="strip">
                            <div><b id="strip-dist">0,00</b><small>km</small></div>
                            <div><b id="strip-time">00:00</b></div>
                            <div><b id="strip-asc">+0</b><small>m</small></div>
                        </div>
                        <div class="malert g" id="malert" data-bc data-act="alert.repeat" onclick="repetirUltimoAvisoCoach()">
                            <div class="ai" id="malert-ai"></div>
                            <div class="at">
                                <div class="am" id="malert-am">PACING COACH</div>
                                <div class="ah" id="malert-ah">Listo para salir</div>
                                <div class="as" id="malert-as">Tocá Iniciar recorrido cuando estés listo</div>
                            </div>
                            <div class="ar" id="malert-ar">OK</div>
                        </div>
                    </div>

                    <!-- Overlay Izquierdo: SOS, Huella Trackback, Zoom (+ / -) -->
                    <div class="mo mo-left">
                        <button type="button" class="mbtn sos" data-act="map.sos" onclick="compartirUbicacionWhatsApp()" title="SOS Emergencia WhatsApp">SOS</button>
                        <button type="button" class="mbtn" data-act="map.home" id="btn-map-home" onclick="toggleVolverAlInicioHuella()" aria-label="Volver al inicio por la huella" title="Volver al inicio">
                            <svg class="ic" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        </button>
                        <button type="button" class="mbtn zbtn" data-act="map.zin" id="btn-map-zin" onclick="zoomInMapaV2()" aria-label="Acercar">
                            <svg class="ic" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        </button>
                        <button type="button" class="mbtn zbtn" data-act="map.zout" id="btn-map-zout" onclick="zoomOutMapaV2()" aria-label="Alejar">
                            <svg class="ic" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
                        </button>
                    </div>

                    <!-- Overlay Derecho: Capas tácticas, Orientación rumbo/norte, Centrar GPS -->
                    <div class="mo mo-right">
                        <button type="button" class="mbtn" data-act="map.layers" id="bLayers" onclick="togglePopoverCapas()" aria-label="Capas tácticas de mapa" title="Capas">
                            <svg class="ic" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>
                        </button>
                        <button type="button" class="mbtn zbtn" data-act="map.north" id="bNorth" onclick="toggleRumboMapaV2()" aria-label="Orientación del mapa" title="Norte / Rumbo">
                            <svg class="ic" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                        </button>
                        <button type="button" class="mbtn on" data-act="map.locate" id="bLocate" onclick="centrarMapaEnCiclistaV2()" aria-label="Seguir mi posición" title="Centrar posición">
                            <svg class="ic" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><circle cx="12" cy="12" r="7"/></svg>
                        </button>
                    </div>

                    <!-- Overlay Inferior: Escala y badges de estado -->
                    <div class="mo mo-bot">
                        <span class="sbar" id="sbar"><i></i><span id="sbar-txt">100 m</span></span>
                        <span id="map-pills" style="display:contents"></span>
                    </div>

                    <!-- Popover flotante de capas tácticas (Referencia 06) -->
                    <div id="popHost">
                        <div class="pop" id="popLayers" style="display:none;">
                            <h4>Mapa base</h4>
                            <button type="button" class="opt on" id="opt-layer-cyclosm" data-act="ly.style" data-k="cyclosm" onclick="seleccionarCapaBaseV2('cyclosm')">
                                <span class="sw" style="background:var(--acc);"></span>CyclOSM (MTB)
                            </button>
                            <button type="button" class="opt" id="opt-layer-opentopo" data-act="ly.style" data-k="opentopo" onclick="seleccionarCapaBaseV2('opentopo')">
                                <span class="sw" style="background:#eee8d4;"></span>OpenTopo (Curvas)
                            </button>
                            <button type="button" class="opt" id="opt-layer-satelite" data-act="ly.style" data-k="satelite" onclick="seleccionarCapaBaseV2('satelite')">
                                <span class="sw" style="background:#1c2a1a;"></span>Satélite (Aéreo)
                            </button>
                            <h4>Capas</h4>
                            <button type="button" class="opt on" id="opt-tg-huella" data-act="ly.tg" data-k="huella" onclick="toggleCapaTactico('huella')">
                                <svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg> Track GPX <span class="tg"></span>
                            </button>
                            <button type="button" class="opt on" id="opt-tg-agua" data-act="ly.tg" data-k="agua" onclick="toggleCapaTactico('agua')">
                                <svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg> Puntos de agua <span class="tg"></span>
                            </button>
                            <button type="button" class="opt on" id="opt-tg-seg" data-act="ly.tg" data-k="seg" onclick="toggleCapaTactico('seg')">
                                <svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/></svg> Segmentos y PR <span class="tg"></span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Panel de datos inferior tipo Dock (3 modos: full, compact, hide) -->
                <div class="dock" id="dock" data-m="compact">
                    <button type="button" class="handle" data-act="dock.cycle" onclick="ciclarModoDockV2()" aria-label="Cambiar tamaño del panel de datos"><i></i></button>
                    <!-- 3 Tarjetas de Telemetría (Velocidad, Inclinación, Potencia) -->
                    <div class="dm">
                        <div class="mcard sp">
                            <div class="lbl sm">Velocidad</div>
                            <div class="v num"><span id="dock-speed">0,0</span><small>km/h</small></div>
                            <div class="s" id="dock-tgt"></div>
                        </div>
                        <div class="mcard">
                            <div class="lbl sm">Inclinación</div>
                            <div class="v num zt-g" id="dock-grade-wrap"><span id="dock-grade">0,0</span><small>%</small></div>
                            <div class="s" id="dock-zlab"><span class="zchip g">Llano</span></div>
                        </div>
                        <div class="mcard">
                            <div class="lbl sm">Potencia</div>
                            <div class="v num"><span id="dock-power">0</span><small>W</small></div>
                            <div class="s">Bike IQ <span class="est">est.</span></div>
                        </div>
                    </div>
                    <!-- Terreno adelante (ClimbPro ribbon) para modo full -->
                    <div class="dribbon">
                        <div class="rb-h">
                            <span class="lbl sm">Terreno adelante</span>
                            <span class="leg"><span><i style="background:var(--g)"></i>Llano</span><span><i style="background:var(--y)"></i>Trepada</span><span><i style="background:var(--r)"></i>Pared</span></span>
                        </div>
                        <div id="dock-ribbon-container">
                            <svg class="ribbon" viewBox="0 0 340 84" role="img" aria-label="Perfil de terreno por delante">
                                <path d="M0,67 L340,67" style="stroke:var(--line2);stroke-width:1.5;stroke-dasharray:4 4;"/>
                                <path d="M0,67 Q80,62 140,54 T240,36 T340,28" style="fill:none;stroke:var(--acc);stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round;"/>
                                <circle cx="28" cy="65" r="5" style="fill:var(--bg);stroke:var(--text);stroke-width:2.5;"/>
                                <text x="28" y="80" text-anchor="middle" style="font-size:11px;fill:var(--text);font-weight:800;">VOS</text>
                                <text x="180" y="80" text-anchor="middle" style="font-size:11px;fill:var(--muted);">+500 m</text>
                                <text x="310" y="80" text-anchor="middle" style="font-size:11px;fill:var(--muted);">+1 km</text>
                            </svg>
                        </div>
                    </div>
                    <!-- HUD Miniatura para modo oculto (hide) -->
                    <div class="hudmini">
                        <span class="num" id="hudmini-speed">0,0</span><small>km/h</small>
                        <span class="num zt-g" id="hudmini-grade-wrap"><span id="hudmini-grade">0,0</span>%</span>
                    </div>
                    <!-- Botones de Control: Pausar e Iniciar / Finalizar -->
                    <div class="ctl">
                        <button type="button" class="btn btn-p" data-act="rec.toggle" id="btn-rec-toggle" onclick="toggleIniciarPausar()">
                            <svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M7 4.6v14.8a1 1 0 0 0 1.5.86l12-7.4a1 1 0 0 0 0-1.72l-12-7.4A1 1 0 0 0 7 4.6z"/></svg>
                            <span id="txt-rec-toggle">Iniciar Recorrido</span>
                        </button>
                        <button type="button" class="btn btn-d" data-act="rec.finish" id="btn-rec-finish" onclick="finalizarEntrenamiento()" style="display:none;">
                            <svg class="ic" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>
                            Finalizar
                        </button>
                    </div>
                </div>
            </section>

            <!-- VISTA 2: CABINA TÁCTICA (Referencia 04) -->
            <section class="v v-cabina">
                <div class="vscroll">
                    <!-- Segmentado de modos de entrenamiento -->
                    <div class="seg scroll modes">
                        <button type="button" class="on" data-act="mode.set" data-k="libre" onclick="seleccionarModoEntrenamiento('libre')">Libre</button>
                        <button type="button" data-act="mode.set" data-k="pacing" onclick="seleccionarModoEntrenamiento('pacing')">Pacing</button>
                        <button type="button" data-act="mode.set" data-k="subida" onclick="seleccionarModoEntrenamiento('subida')">Subida</button>
                        <button type="button" data-act="mode.set" data-k="fondo" onclick="seleccionarModoEntrenamiento('fondo')">Fondo</button>
                    </div>
                    <!-- Tarjeta de aviso táctico del coach -->
                    <div class="aviso" id="cabina-aviso" data-bc onclick="repetirUltimoAvisoCoach()">
                        <div class="ai" id="cabina-aviso-ai"></div>
                        <div class="at">
                            <div class="am" id="cabina-aviso-am">PACING COACH</div>
                            <div class="ah" id="cabina-aviso-ah">Ritmo en Zona 1</div>
                            <div class="as" id="cabina-aviso-as">Terreno llano · Cadencia fluida</div>
                        </div>
                    </div>
                    <!-- Widgets de tramo / liebre si están activos -->
                    <div class="widgets" id="cabina-widgets"></div>
                    <!-- Miniatura de mapa para volver rápido -->
                    <div class="mini">
                        <div id="cvMiniA" style="width:100%;height:100%;background:var(--surface2);border-radius:var(--rad);display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:12.5px;font-weight:600;">
                            Vista previa del mapa
                        </div>
                        <button type="button" class="chip mcap2" data-act="rv" data-v="mapa" onclick="cambiarVistaRadarV2('mapa')">
                            <svg class="ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg> Mapa
                        </button>
                    </div>
                    <!-- Telemetría gigante de cabina (Velocidad, Inclinación, Potencia) -->
                    <div class="a-tele">
                        <div class="card spd">
                            <div class="lbl">Velocidad</div>
                            <div class="v num" id="cabina-speed">0,0</div>
                            <div class="u"><span>km/h</span><span class="tg" id="cabina-tgt"></span></div>
                        </div>
                        <div class="col">
                            <div class="mcard">
                                <div class="lbl sm">Inclinación</div>
                                <div class="v num zt-g" id="cabina-grade-wrap"><span id="cabina-grade">0,0</span><small>%</small></div>
                                <div class="s" id="cabina-zlab"><span class="zchip g">Llano</span></div>
                            </div>
                            <div class="mcard">
                                <div class="lbl sm">Potencia</div>
                                <div class="v num"><span id="cabina-power">0</span><small>W</small></div>
                                <div class="s">Bike IQ <span class="est">est.</span></div>
                            </div>
                        </div>
                    </div>
                    <!-- Gráfico de zonas de potencia táctica -->
                    <div class="card pzone" id="cabina-pzone">
                        <div class="lbl" style="margin-bottom:8px;">Zonas de potencia</div>
                        <div class="grafico-zonas-contenedor" id="grafico-zonas-box" style="height:24px;border-radius:8px;display:flex;overflow:hidden;position:relative;">
                            <div class="seg-zona sz1 activa" style="flex:1;background:var(--acc);" title="Z1"></div>
                            <div class="seg-zona sz2" style="flex:1;background:var(--d);" title="Z2"></div>
                            <div class="seg-zona sz3" style="flex:1;background:var(--g);" title="Z3"></div>
                            <div class="seg-zona sz4" style="flex:1;background:var(--y);" title="Z4"></div>
                            <div class="seg-zona sz5" style="flex:1;background:var(--r);" title="Z5"></div>
                            <div class="seg-zona sz6" style="flex:1;background:var(--pz5, #8A2BE2);" title="Z6"></div>
                        </div>
                    </div>
                    <!-- Terreno adelante (ClimbPro) -->
                    <div class="card tight">
                        <div class="row between"><span class="lbl">Terreno adelante</span><span class="leg"><span><i style="background:var(--g)"></i>Llano</span><span><i style="background:var(--y)"></i>Trepada</span><span><i style="background:var(--r)"></i>Pared</span></span></div>
                        <div id="cabina-ribbon-container" style="margin-top:6px;">
                            <svg class="ribbon" viewBox="0 0 340 84" role="img">
                                <path d="M0,67 L340,67" style="stroke:var(--line2);stroke-width:1.5;stroke-dasharray:4 4;"/>
                                <path d="M0,67 Q80,62 140,54 T240,36 T340,28" style="fill:none;stroke:var(--acc);stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round;"/>
                                <circle cx="28" cy="65" r="5" style="fill:var(--bg);stroke:var(--text);stroke-width:2.5;"/>
                                <text x="28" y="80" text-anchor="middle" style="font-size:11px;fill:var(--text);font-weight:800;">VOS</text>
                            </svg>
                        </div>
                    </div>
                    <!-- 4 Métricas secundarias (Distancia, Tiempo, Ascenso, Calorías) -->
                    <div class="stats4">
                        <div class="stat"><div class="v"><span id="cabina-dist">0,00</span><small>km</small></div><div class="l">Distancia</div></div>
                        <div class="stat"><div class="v"><span id="cabina-time">00:00</span></div><div class="l">Tiempo</div></div>
                        <div class="stat"><div class="v"><span id="cabina-asc">+0</span><small>m</small></div><div class="l">Ascenso</div></div>
                        <div class="stat"><div class="v"><span id="cabina-kcal">0</span><small>kcal</small></div><div class="l">Calorías<span class="est">est.</span></div></div>
                    </div>
                    <!-- Botones de Control de Grabación -->
                    <div class="ctl">
                        <button type="button" class="btn btn-p" data-act="rec.toggle" onclick="toggleIniciarPausar()">
                            <svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M7 4.6v14.8a1 1 0 0 0 1.5.86l12-7.4a1 1 0 0 0 0-1.72l-12-7.4A1 1 0 0 0 7 4.6z"/></svg>
                            <span class="txt-rec-toggle-cabina">Iniciar Recorrido</span>
                        </button>
                        <button type="button" class="btn btn-d btn-rec-finish-cabina" data-act="rec.finish" onclick="finalizarEntrenamiento()" style="display:none;">
                            <svg class="ic" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>
                            Finalizar
                        </button>
                    </div>
                </div>
            </section>

            <!-- VISTA 3: SUBIDA / CLIMBPRO (Referencia 05) -->
            <section class="v v-subida">
                <div class="vscroll">
                    <!-- Tarjeta Héroe del Próximo Tramo / Subida -->
                    <div class="card hero" id="subida-hero" data-bc>
                        <div class="hm">
                            <span class="row" style="gap:7px">
                                <svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg>
                                Próximo tramo
                            </span>
                            <span class="zchip y" id="subida-hero-nkind">Trepada</span>
                        </div>
                        <div class="hbig"><span id="subida-hero-dist">400</span><small id="subida-hero-unit">m</small></div>
                        <div class="ht" id="subida-hero-desc">Pared 11 % durante 300 m · Plato chico y cadencia ágil</div>
                        <div id="subida-ribbon-container" style="margin-top:10px;">
                            <svg class="ribbon" viewBox="0 0 340 84" role="img">
                                <path d="M0,67 Q80,62 140,54 T240,36 T340,28" style="fill:none;stroke:var(--y);stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round;"/>
                                <circle cx="28" cy="65" r="5" style="fill:var(--bg);stroke:var(--text);stroke-width:2.5;"/>
                            </svg>
                        </div>
                    </div>
                    <!-- Miniatura de mapa -->
                    <div class="mini">
                        <div id="cvMiniB" style="width:100%;height:100%;background:var(--surface2);border-radius:var(--rad);display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:12.5px;font-weight:600;">
                            Vista previa del mapa
                        </div>
                        <button type="button" class="chip mcap2" data-act="rv" data-v="mapa" onclick="cambiarVistaRadarV2('mapa')">
                            <svg class="ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg> Mapa
                        </button>
                    </div>
                    <!-- 3 Tarjetas de telemetría -->
                    <div class="grid3 dm-b">
                        <div class="mcard sp"><div class="lbl sm">Velocidad</div><div class="v num"><span id="subida-speed">0,0</span><small>km/h</small></div></div>
                        <div class="mcard"><div class="lbl sm">Inclinación</div><div class="v num zt-y"><span id="subida-grade">0,0</span><small>%</small></div></div>
                        <div class="mcard"><div class="lbl sm">Potencia</div><div class="v num"><span id="subida-power">0</span><small>W</small></div><div class="s">Bike IQ <span class="est">est.</span></div></div>
                    </div>
                    <!-- Widgets activos -->
                    <div class="widgets" id="subida-widgets"></div>
                    <!-- Información de lo que viene después -->
                    <div class="card">
                        <div class="lbl">Después</div>
                        <div id="subida-after" style="margin-top:6px;font-size:14px;color:var(--muted);font-weight:500;">
                            Cima a 1,2 km · Bajada técnica con curvas cerradas
                        </div>
                    </div>
                    <!-- 4 Métricas secundarias -->
                    <div class="stats4">
                        <div class="stat"><div class="v"><span id="subida-dist">0,00</span><small>km</small></div><div class="l">Distancia</div></div>
                        <div class="stat"><div class="v"><span id="subida-time">00:00</span></div><div class="l">Tiempo</div></div>
                        <div class="stat"><div class="v"><span id="subida-asc">+0</span><small>m</small></div><div class="l">Ascenso</div></div>
                        <div class="stat"><div class="v"><span id="subida-kcal">0</span><small>kcal</small></div><div class="l">Calorías<span class="est">est.</span></div></div>
                    </div>
                    <!-- Botones de Control de Grabación -->
                    <div class="ctl">
                        <button type="button" class="btn btn-p" data-act="rec.toggle" onclick="toggleIniciarPausar()">
                            <svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M7 4.6v14.8a1 1 0 0 0 1.5.86l12-7.4a1 1 0 0 0 0-1.72l-12-7.4A1 1 0 0 0 7 4.6z"/></svg>
                            <span class="txt-rec-toggle-subida">Iniciar Recorrido</span>
                        </button>
                        <button type="button" class="btn btn-d btn-rec-finish-subida" data-act="rec.finish" onclick="finalizarEntrenamiento()" style="display:none;">
                            <svg class="ic" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>
                            Finalizar
                        </button>
                    </div>
                </div>
            </section>
        </div>
    </div>

    <!-- Hoja modal táctica de Ajustes de Cabina y Herramientas (bCab) -->
    <div class="sheet" id="sheet-cabina" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.72);z-index:99;align-items:flex-end;" onclick="if(event.target===this)toggleRanuraCockpit()">
        <div style="background:var(--surface);width:100%;border-radius:24px 24px 0 0;border-top:1px solid var(--line);padding:20px 16px calc(24px + env(safe-area-inset-bottom));max-height:85vh;overflow-y:auto;box-shadow:var(--shadow);">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                <b style="font-family:var(--font-d);font-size:22px;text-transform:uppercase;color:var(--text);letter-spacing:0.04em;">Ajustes de cabina</b>
                <button type="button" class="ibtn" onclick="toggleRanuraCockpit()" style="color:var(--muted);"><svg class="ic" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <button type="button" class="btn btn-cockpit" id="btn-bloqueo" data-act="cab.lock" onclick="activarBloqueoPantalla(); toggleRanuraCockpit();" style="border:1px solid var(--line2);background:var(--surface2);color:var(--text);height:50px;font-size:13px;border-radius:12px;font-weight:700;"><svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Anti-sudor</button>
                <button type="button" class="btn btn-cockpit" id="btn-ghost" data-act="cab.ghost" onclick="abrirModalGhostPacer(); toggleRanuraCockpit();" style="border:1px solid var(--line2);background:var(--surface2);color:var(--text);height:50px;font-size:13px;border-radius:12px;font-weight:700;"><svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg> Ghost Pacer</button>
                <button type="button" class="btn btn-cockpit" id="btn-escuadron" data-act="cab.squad" onclick="abrirModalEscuadron(); toggleRanuraCockpit();" style="border:1px solid var(--line2);background:var(--surface2);color:var(--text);height:50px;font-size:13px;border-radius:12px;font-weight:700;"><svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> Escuadrón</button>
                <button type="button" class="btn btn-cockpit" id="btn-nube-cockpit" data-act="cab.nube" onclick="abrirConfigNube(); toggleRanuraCockpit();" style="border:1px solid var(--line2);background:var(--surface2);color:var(--d);height:50px;font-size:13px;border-radius:12px;font-weight:700;"><svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg> Nube</button>
                <button type="button" class="btn btn-cockpit" id="btn-sim" data-act="cab.sim" onclick="toggleModalSimuladorGPX(); toggleRanuraCockpit();" style="border:1px solid var(--line2);background:var(--surface2);color:var(--text);height:50px;font-size:13px;border-radius:12px;font-weight:700;"><svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect width="20" height="12" x="2" y="6" rx="6"/></svg> Simulador</button>
                <button type="button" class="btn btn-cockpit" id="btn-sos" data-act="cab.sos" onclick="compartirUbicacionWhatsApp(); toggleRanuraCockpit();" style="border:1px solid var(--r);background:var(--surface2);color:var(--r);height:50px;font-size:13px;border-radius:12px;font-weight:700;"><svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg> SOS WhatsApp</button>
            </div>
        </div>
    </div>
"""

# Replace in html
radar_tag_start = html.find('<!-- ======================================================== -->\n    <!-- 2. PESTAÑA: RADAR LIVE')
if radar_tag_start == -1:
    radar_tag_start = html.find('<div id="tab-radar"')

lab_tag_start = html.find('<!-- ======================================================== -->\n    <!-- 3. PESTAÑA: LABORATORIO')
if lab_tag_start == -1:
    lab_tag_start = html.find('<div id="tab-lab"')

html = html[:radar_tag_start] + tab_radar_html + '\n    ' + html[lab_tag_start:]
print("Tab radar replaced with official V2 structure.")

# 3. HELPER FUNCTIONS IN JS (numEsAR, zoom helpers, popover helpers, telemetry updates)
js_helpers = """
        // ========================================================
        // UTILIDADES Y CONTROLADORES V2 TÁCTICO OFICIAL
        // ========================================================
        function numEsAR(n, d = 1) {
            if (n == null || !isFinite(n)) return '0,0';
            const s = Math.abs(n).toFixed(d);
            let [entero, frac] = s.split('.');
            if (entero.length > 3) entero = entero.replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.');
            const neg = n < 0 && Number(s) !== 0;
            return (neg ? '−' : '') + entero + (frac != null ? ',' + frac : '');
        }

        function zoomInMapaV2() {
            if (mapa) mapa.zoomIn();
        }

        function zoomOutMapaV2() {
            if (mapa) mapa.zoomOut();
        }

        function togglePopoverCapas() {
            const pop = document.getElementById('popLayers');
            if (!pop) return;
            const isVis = pop.style.display !== 'none';
            pop.style.display = isVis ? 'none' : 'block';
        }

        function toggleCapaTactico(capaKey) {
            const btn = document.getElementById('opt-tg-' + capaKey);
            if (!btn) return;
            const activa = btn.classList.toggle('on');
            if (capaKey === 'huella' && typeof polylineRutaGrabada !== 'undefined' && polylineRutaGrabada && mapa) {
                if (activa) { if (!mapa.hasLayer(polylineRutaGrabada)) mapa.addLayer(polylineRutaGrabada); }
                else { if (mapa.hasLayer(polylineRutaGrabada)) mapa.removeLayer(polylineRutaGrabada); }
            }
        }

        function seleccionarCapaBaseV2(key) {
            if (!mapa || typeof v2CapasMapa === 'undefined' || !v2CapasMapa) return;
            Object.keys(v2CapasMapa).forEach(k => {
                const item = v2CapasMapa[k];
                if (item && item.layer) {
                    if (k === key) {
                        if (!mapa.hasLayer(item.layer)) mapa.addLayer(item.layer);
                    } else {
                        if (mapa.hasLayer(item.layer)) mapa.removeLayer(item.layer);
                    }
                }
                const optBtn = document.getElementById('opt-layer-' + k);
                if (optBtn) optBtn.classList.toggle('on', k === key);
            });
            const pop = document.getElementById('popLayers');
            if (pop) pop.style.display = 'none';
        }

        function toggleRanuraCockpit() {
            const sheet = document.getElementById('sheet-cabina');
            if (!sheet) return;
            const isVis = sheet.style.display === 'flex';
            sheet.style.display = isVis ? 'none' : 'flex';
        }

        function ciclarModoDockV2() {
            const dock = document.getElementById('dock');
            if (!dock) return;
            const current = dock.getAttribute('data-m') || 'compact';
            const next = { full: 'compact', compact: 'hide', hide: 'full' }[current] || 'compact';
            dock.setAttribute('data-m', next);
            if (mapa) {
                setTimeout(() => { mapa.invalidateSize(); }, 60);
            }
        }

        function cambiarVistaRadarV2(vista) {
            v2VistaActiva = vista;
            const rbody = document.getElementById('rbody');
            if (rbody) {
                rbody.setAttribute('data-view', vista);
            }
            const segButtons = document.querySelectorAll('#vseg button');
            segButtons.forEach(btn => {
                const v = btn.getAttribute('data-v');
                btn.classList.toggle('on', v === vista);
            });
            if (vista === 'mapa' && mapa) {
                setTimeout(() => { mapa.invalidateSize(); }, 60);
            }
        }

        function actualizarTelemetriaV2() {
            const vStr = numEsAR(typeof velocidadKmh !== 'undefined' ? velocidadKmh : 0, 1);
            const dStr = numEsAR(typeof distanciaTotal !== 'undefined' ? distanciaTotal : 0, 2);
            const gStr = numEsAR(typeof pendienteFiltrada !== 'undefined' ? pendienteFiltrada : 0, 1);
            const pStr = String(Math.round(typeof potenciaEstimada !== 'undefined' ? potenciaEstimada : 0));
            const tStr = typeof formatearTiempo === 'function' ? formatearTiempo(typeof tiempoTranscurrido !== 'undefined' ? tiempoTranscurrido : 0) : '00:00';
            const ascStr = '+' + Math.round(typeof desnivelPositivoTotal !== 'undefined' ? desnivelPositivoTotal : 0);

            // Strip Top (Mapa)
            const sDist = document.getElementById('strip-dist'); if (sDist) sDist.textContent = dStr;
            const sTime = document.getElementById('strip-time'); if (sTime) sTime.textContent = tStr;
            const sAsc = document.getElementById('strip-asc'); if (sAsc) sAsc.textContent = ascStr;

            // Dock (Mapa)
            const dSpd = document.getElementById('dock-speed'); if (dSpd) dSpd.textContent = vStr;
            const dGrd = document.getElementById('dock-grade'); if (dGrd) dGrd.textContent = gStr;
            const dPwr = document.getElementById('dock-power'); if (dPwr) dPwr.textContent = pStr;

            // Hudmini (Dock colapsado)
            const hSpd = document.getElementById('hudmini-speed'); if (hSpd) hSpd.textContent = vStr;
            const hGrd = document.getElementById('hudmini-grade'); if (hGrd) hGrd.textContent = gStr;

            // Cabina
            const cSpd = document.getElementById('cabina-speed'); if (cSpd) cSpd.textContent = vStr;
            const cGrd = document.getElementById('cabina-grade'); if (cGrd) cGrd.textContent = gStr;
            const cPwr = document.getElementById('cabina-power'); if (cPwr) cPwr.textContent = pStr;
            const cDst = document.getElementById('cabina-dist'); if (cDst) cDst.textContent = dStr;
            const cTim = document.getElementById('cabina-time'); if (cTim) cTim.textContent = tStr;
            const cAsc = document.getElementById('cabina-asc'); if (cAsc) cAsc.textContent = ascStr;
            const cKcl = document.getElementById('cabina-kcal'); if (cKcl) cKcl.textContent = String(Math.round(typeof caloriasEstimadas !== 'undefined' ? caloriasEstimadas : 0));

            // Subida
            const subSpd = document.getElementById('subida-speed'); if (subSpd) subSpd.textContent = vStr;
            const subGrd = document.getElementById('subida-grade'); if (subGrd) subGrd.textContent = gStr;
            const subPwr = document.getElementById('subida-power'); if (subPwr) subPwr.textContent = pStr;
            const subDst = document.getElementById('subida-dist'); if (subDst) subDst.textContent = dStr;
            const subTim = document.getElementById('subida-time'); if (subTim) subTim.textContent = tStr;
            const subAsc = document.getElementById('subida-asc'); if (subAsc) subAsc.textContent = ascStr;
            const subKcl = document.getElementById('subida-kcal'); if (subKcl) subKcl.textContent = String(Math.round(typeof caloriasEstimadas !== 'undefined' ? caloriasEstimadas : 0));

            // Actualizar chip REC y estado de botones
            const recChip = document.getElementById('recChip');
            const recChipTxt = document.getElementById('recChipTxt');
            const btnToggle = document.getElementById('btn-rec-toggle');
            const btnFinish = document.getElementById('btn-rec-finish');
            const btnsFinishCabina = document.querySelectorAll('.btn-rec-finish-cabina, .btn-rec-finish-subida');
            const txtToggles = document.querySelectorAll('.txt-rec-toggle-cabina, .txt-rec-toggle-subida');

            if (typeof recorridoActivo !== 'undefined' && recorridoActivo) {
                if (typeof recorridoPausado !== 'undefined' && recorridoPausado) {
                    if (recChip) { recChip.className = 'rec paused'; }
                    if (recChipTxt) { recChipTxt.textContent = 'PAUSADO'; }
                    if (btnToggle) {
                        btnToggle.innerHTML = `<svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M7 4.6v14.8a1 1 0 0 0 1.5.86l12-7.4a1 1 0 0 0 0-1.72l-12-7.4A1 1 0 0 0 7 4.6z"/></svg><span id="txt-rec-toggle">Reanudar</span>`;
                    }
                    txtToggles.forEach(t => t.textContent = 'Reanudar');
                    if (btnFinish) btnFinish.style.display = 'inline-flex';
                    btnsFinishCabina.forEach(b => b.style.display = 'inline-flex');
                } else {
                    if (recChip) { recChip.className = 'rec'; }
                    if (recChipTxt) { recChipTxt.textContent = 'REC ' + tStr; }
                    if (btnToggle) {
                        btnToggle.innerHTML = `<svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg><span id="txt-rec-toggle">Pausar</span>`;
                    }
                    txtToggles.forEach(t => t.textContent = 'Pausar');
                    if (btnFinish) btnFinish.style.display = 'inline-flex';
                    btnsFinishCabina.forEach(b => b.style.display = 'inline-flex');
                }
            } else {
                if (recChip) { recChip.className = 'rec'; }
                if (recChipTxt) { recChipTxt.textContent = 'LISTO'; }
                if (btnToggle) {
                    btnToggle.innerHTML = `<svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M7 4.6v14.8a1 1 0 0 0 1.5.86l12-7.4a1 1 0 0 0 0-1.72l-12-7.4A1 1 0 0 0 7 4.6z"/></svg><span id="txt-rec-toggle">Iniciar Recorrido</span>`;
                }
                txtToggles.forEach(t => t.textContent = 'Iniciar Recorrido');
                if (btnFinish) btnFinish.style.display = 'none';
                btnsFinishCabina.forEach(b => b.style.display = 'none');
            }
        }
"""

if 'function numEsAR' not in html:
    html = html.replace('// ========================================================', js_helpers + '\n        // ========================================================', 1)
    print("JS helpers injected.")

# 4. UPDATE aplicarEscenarioDemoV2 TO SET VALUES ON EXACT IDS
demo_scen_fn = """
        function aplicarEscenarioDemoV2(scen, F) {
            // Elementos del diseño oficial V2
            const sDist = document.getElementById('strip-dist');
            const sTime = document.getElementById('strip-time');
            const sAsc = document.getElementById('strip-asc');
            const dSpd = document.getElementById('dock-speed');
            const dGrd = document.getElementById('dock-grade');
            const dPwr = document.getElementById('dock-power');
            const hSpd = document.getElementById('hudmini-speed');
            const hGrd = document.getElementById('hudmini-grade');
            const cSpd = document.getElementById('cabina-speed');
            const cGrd = document.getElementById('cabina-grade');
            const cPwr = document.getElementById('cabina-power');
            const subSpd = document.getElementById('subida-speed');
            const subGrd = document.getElementById('subida-grade');
            const subPwr = document.getElementById('subida-power');
            const sysbar = document.getElementById('sysbar');
            const recChip = document.getElementById('recChip');
            const recChipTxt = document.getElementById('recChipTxt');
            const pGps = document.getElementById('pGps');
            const txtGps = document.getElementById('txtGps');
            const malert = document.getElementById('malert');
            const malertAi = document.getElementById('malert-ai');
            const malertAm = document.getElementById('malert-am');
            const malertAh = document.getElementById('malert-ah');
            const malertAs = document.getElementById('malert-as');
            const malertAr = document.getElementById('malert-ar');
            const btnToggle = document.getElementById('btn-rec-toggle');
            const btnFinish = document.getElementById('btn-rec-finish');
            const popLayers = document.getElementById('popLayers');

            // Valores de Referencia Boceto (01-radar-mapa, 02, 03, 06)
            if (sDist) sDist.textContent = "6,82";
            if (sTime) sTime.textContent = "42:18";
            if (sAsc) sAsc.textContent = "+312";
            if (dSpd) dSpd.textContent = "14,2";
            if (dGrd) dGrd.textContent = "6,2";
            if (dPwr) dPwr.textContent = "212";
            if (hSpd) hSpd.textContent = "14,2";
            if (hGrd) hGrd.textContent = "6,2";
            if (cSpd) cSpd.textContent = "14,2";
            if (cGrd) cGrd.textContent = "6,2";
            if (cPwr) cPwr.textContent = "212";
            if (subSpd) subSpd.textContent = "14,2";
            if (subGrd) subGrd.textContent = "6,2";
            if (subPwr) subPwr.textContent = "212";
            if (recChip) recChip.className = "rec";
            if (recChipTxt) recChipTxt.textContent = "REC 42:18";
            if (pGps) { pGps.className = "pill ok"; }
            if (txtGps) { txtGps.textContent = "GPS"; }
            if (btnToggle) {
                btnToggle.innerHTML = `<svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg><span>Pausar</span>`;
            }
            if (btnFinish) btnFinish.style.display = "inline-flex";

            if (malert) {
                malert.className = "malert r";
                if (malertAi) malertAi.textContent = "▲▲";
                if (malertAm) malertAm.textContent = "AVISO · EN 400 M";
                if (malertAh) malertAh.textContent = "Pared 11 % durante 300 m";
                if (malertAs) malertAs.textContent = "Bajá a plato chico y subí la cadencia";
                if (malertAr) malertAr.textContent = "400 m";
            }

            if (scen === 'antes') {
                if (sDist) sDist.textContent = "0,00";
                if (sTime) sTime.textContent = "00:00";
                if (sAsc) sAsc.textContent = "+0";
                if (dSpd) dSpd.textContent = "0,0";
                if (dGrd) dGrd.textContent = "0,0";
                if (dPwr) dPwr.textContent = "0";
                if (recChipTxt) recChipTxt.textContent = "LISTO";
                if (btnToggle) {
                    btnToggle.innerHTML = `<svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M7 4.6v14.8a1 1 0 0 0 1.5.86l12-7.4a1 1 0 0 0 0-1.72l-12-7.4A1 1 0 0 0 7 4.6z"/></svg><span>Iniciar Recorrido</span>`;
                }
                if (btnFinish) btnFinish.style.display = "none";
                if (sysbar) {
                    sysbar.hidden = false;
                    sysbar.setAttribute('data-k', 'info');
                    sysbar.textContent = "Buscando GPS… Esperá la señal antes de iniciar";
                }
                if (malert) {
                    malert.className = "malert g";
                    if (malertAi) malertAi.textContent = "✓";
                    if (malertAm) malertAm.textContent = "LISTO PARA SALIR";
                    if (malertAh) malertAh.textContent = "Tocá Iniciar recorrido cuando estés listo";
                    if (malertAs) malertAs.textContent = "Presión de cubiertas y ruta verificadas";
                    if (malertAr) malertAr.textContent = "OK";
                }
            } else if (scen === 'pared') {
                if (dSpd) dSpd.textContent = "14,0";
                if (dGrd) dGrd.textContent = "11,4";
                if (dPwr) dPwr.textContent = "340";
                if (malert) {
                    malert.className = "malert r";
                    if (malertAi) malertAi.textContent = "▲▲";
                    if (malertAm) malertAm.textContent = "EN LA PARED";
                    if (malertAh) malertAh.textContent = "Pared 11 % · quedan 260 m";
                    if (malertAs) malertAs.textContent = "Plato chico y cadencia firme";
                    if (malertAr) malertAr.textContent = "260 m";
                }
            } else if (scen === 'pausa') {
                if (recChip) recChip.className = "rec paused";
                if (recChipTxt) recChipTxt.textContent = "PAUSADO";
                if (btnToggle) {
                    btnToggle.innerHTML = `<svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M7 4.6v14.8a1 1 0 0 0 1.5.86l12-7.4a1 1 0 0 0 0-1.72l-12-7.4A1 1 0 0 0 7 4.6z"/></svg><span>Reanudar</span>`;
                }
                if (sysbar) {
                    sysbar.hidden = false;
                    sysbar.setAttribute('data-k', 'warn');
                    sysbar.textContent = "Grabación en pausa · El tiempo detenido no suma kilómetros";
                }
            } else if (scen === 'gps_debil') {
                if (pGps) { pGps.className = "pill warn"; }
                if (txtGps) { txtGps.textContent = "GPS ±19m"; }
                if (sysbar) {
                    sysbar.hidden = false;
                    sysbar.setAttribute('data-k', 'warn');
                    sysbar.textContent = "GPS débil (±19 m): buscando satélites…";
                }
            } else if (scen === 'sin_gps') {
                if (pGps) { pGps.className = "pill bad"; }
                if (txtGps) { txtGps.textContent = "Sin GPS"; }
                if (sysbar) {
                    sysbar.hidden = false;
                    sysbar.setAttribute('data-k', 'bad');
                    sysbar.textContent = "Sin señal GPS hace 12 s: se detuvo el registro de distancia";
                }
            } else if (scen === 'offline') {
                if (sysbar) {
                    sysbar.hidden = false;
                    sysbar.setAttribute('data-k', 'info');
                    sysbar.textContent = "Sin conexión: se sube sola cuando vuelva la red";
                }
                const pills = document.getElementById('map-pills');
                if (pills) {
                    pills.innerHTML = '<button class="wpill" data-k="ok"><svg class="ic" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/></svg> Mapa offline</button>';
                }
            } else if (scen === 'offline_sin') {
                if (sysbar) {
                    sysbar.hidden = false;
                    sysbar.setAttribute('data-k', 'warn');
                    sysbar.textContent = "Sin conexión y sin mapa: solo se dibuja tu traza";
                }
                const pills = document.getElementById('map-pills');
                if (pills) {
                    pills.innerHTML = '<button class="wpill" data-k="warn"><svg class="ic" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 2 20 20"/><path d="M12 20h.01"/></svg> Sin mapa descargado</button>';
                }
            } else if (scen === 'segmento') {
                const pills = document.getElementById('map-pills');
                if (pills) {
                    pills.innerHTML = '<button class="wpill" data-k="ok" style="border-color:var(--acc);color:var(--acc);"><svg class="ic" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/></svg> Segmento: Cuesta de las Cañas · −12 s</button>';
                }
            }
        }
"""

# Replace existing aplicarEscenarioDemoV2
m_demo = re.search(r'function aplicarEscenarioDemoV2\(.*?\n\s*\}', html, re.DOTALL)
if m_demo:
    html = html[:m_demo.start()] + demo_scen_fn.strip() + html[m_demo.end():]
    print("aplicarEscenarioDemoV2 updated.")

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("index.html successfully updated with Tarea 1: Radar V2!")
