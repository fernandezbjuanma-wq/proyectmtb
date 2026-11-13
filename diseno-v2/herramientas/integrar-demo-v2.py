import re, sys

path = r'C:\Users\coni_\OneDrive\Desktop\juan\GitHub\proyectmtb\index.html'
with open(path, 'r', encoding='utf8') as f:
    html = f.read()

# 1. Update tab definitions
html = html.replace('<div id="tab-prep" class="tab-page">', '<div id="tab-prep" class="tab-page tab" aria-label="Preparación">')
html = html.replace('<div id="tab-radar" class="tab-page active" data-radar-view="mapa">', '<div id="tab-radar" class="tab-page tab active on" data-radar-view="mapa" data-view="mapa" aria-label="Radar en vivo">')
html = html.replace('<div id="tab-lab" class="tab-page">', '<div id="tab-lab" class="tab-page tab" aria-label="Laboratorio">')
html = html.replace('<div id="tab-hist" class="tab-page">', '<div id="tab-hist" class="tab-page tab" aria-label="Historial">')

# 2. Add data-act attributes
html = html.replace('id="pildora-gps-header"', 'id="pildora-gps-header" data-act="hdr.gps"')
html = html.replace('id="pildora-voz-header"', 'id="pildora-voz-header" data-act="hdr.voice"')
html = html.replace('class="btn-header-ajustes"', 'class="btn-header-ajustes" id="bCab" data-act="hdr.cab"')
html = html.replace('class="v2-dock-handle"', 'class="v2-dock-handle" data-act="dock.cycle"')
html = html.replace('id="v2-btn-capa"', 'id="bLayers" data-act="map.layers"')
html = html.replace('id="v2-btn-huella"', 'id="v2-btn-huella" data-act="map.home"')
html = html.replace('id="v2-btn-rumbo"', 'id="bNorth" data-act="map.north"')
html = html.replace('id="v2-btn-centrar"', 'id="bLocate" data-act="map.locate"')
html = html.replace('id="btn-start"', 'id="btn-start" data-act="rec.toggle"')
html = html.replace('id="btn-finish"', 'id="btn-finish" data-act="rec.finish"')
html = html.replace('id="btn-bloqueo"', 'id="btn-bloqueo" data-act="cab.lock"')
html = html.replace('id="btn-ghost"', 'id="btn-ghost" data-act="cab.ghost"')
html = html.replace('id="btn-escuadron"', 'id="btn-escuadron" data-act="cab.squad"')
html = html.replace('id="btn-nube-cockpit"', 'id="btn-nube-cockpit" data-act="cab.nube"')
html = html.replace('id="btn-sos"', 'id="btn-sos" data-act="cab.sos"')

# Ensure simulator button exists in cockpit toolbar
if 'data-act="cab.sim"' not in html:
    html = html.replace(
        '<button id="btn-nube-cockpit" class="btn-cockpit" data-act="cab.nube"',
        '<button id="btn-sim" class="btn-cockpit" data-act="cab.sim" onclick="toggleModalSimuladorGPX()" style="color:var(--text);border-color:var(--line2);">🎮 Simulador GPX</button>\n                    <button id="btn-nube-cockpit" class="btn-cockpit" data-act="cab.nube"'
    )

# 3. Add Preparación Rows right after SILCA card if not present
rows_html = """
        <!-- Filas de Lista Tácticas de Preparación (V2 Diseño Aprobado) -->
        <div class="stack" style="display:flex;flex-direction:column;gap:9px;margin-top:14px;margin-bottom:14px;" id="prepRows">
            <button type="button" class="lrow" data-act="prep.open" data-k="odo" onclick="scrollearACardPrep('odo')">
                <span class="ico"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></span>
                <span class="grow"><b style="display:block;font-size:17px;font-weight:700;color:var(--text);">Mantenimiento</b><small id="prep-sub-odo" style="display:block;color:var(--muted);font-size:12.5px;margin-top:2px;">Cadena 0 % · Pastillas 0 % · Cubiertas 0 %</small></span>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chev" style="color:var(--muted);margin-left:auto;"><path d="m9 18 6-6-6-6"/></svg>
            </button>
            <button type="button" class="lrow" data-act="prep.open" data-k="gpx" onclick="scrollearACardPrep('gpx')">
                <span class="ico"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg></span>
                <span class="grow"><b style="display:block;font-size:17px;font-weight:700;color:var(--text);">Ruta GPX</b><small id="prep-sub-gpx" style="display:block;color:var(--muted);font-size:12.5px;margin-top:2px;">Track cargado · 52.6 km · +1.840 m</small></span>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chev" style="color:var(--muted);margin-left:auto;"><path d="m9 18 6-6-6-6"/></svg>
            </button>
            <button type="button" class="lrow" data-act="prep.open" data-k="bike" onclick="scrollearACardPrep('bike')">
                <span class="ico"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></svg></span>
                <span class="grow"><b style="display:block;font-size:17px;font-weight:700;color:var(--text);">BikeFit</b><small id="prep-sub-bike" style="display:block;color:var(--muted);font-size:12.5px;margin-top:2px;">Última medición: rodilla 30° · altura óptima</small></span>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chev" style="color:var(--muted);margin-left:auto;"><path d="m9 18 6-6-6-6"/></svg>
            </button>
            <button type="button" class="lrow" data-act="prep.open" data-k="seg" onclick="scrollearACardPrep('seg')">
                <span class="ico"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/><path d="M12 18v-2h-.5"/></svg></span>
                <span class="grow"><b style="display:block;font-size:17px;font-weight:700;color:var(--text);">Segmentos y PR</b><small id="prep-sub-seg" style="display:block;color:var(--muted);font-size:12.5px;margin-top:2px;">4 segmentos · mejor marca 02:45 en Cuesta de las Cañas</small></span>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chev" style="color:var(--muted);margin-left:auto;"><path d="m9 18 6-6-6-6"/></svg>
            </button>
            <button type="button" class="lrow" data-act="prep.open" data-k="plan" onclick="scrollearACardPrep('plan')">
                <span class="ico"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></span>
                <span class="grow"><b style="display:block;font-size:17px;font-weight:700;color:var(--text);">Coach de entrenamiento</b><small id="prep-sub-plan" style="display:block;color:var(--muted);font-size:12.5px;margin-top:2px;">Objetivo de hoy: Escalada (+D)</small></span>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chev" style="color:var(--muted);margin-left:auto;"><path d="m9 18 6-6-6-6"/></svg>
            </button>
        </div>
"""

if 'id="prepRows"' not in html:
    # insert right after silca card
    silca_end_marker = '</div>\n        </div>\n\n        <!-- 2. ODÓMETRO'
    if silca_end_marker in html:
        html = html.replace(silca_end_marker, '</div>\n        </div>\n' + rows_html + '\n        <!-- 2. ODÓMETRO')

# Ensure card IDs for scrolling
html = html.replace('<!-- 2. ODÓMETRO MECÁNICO Y DESGASTE PREDICTIVO -->\n        <div class="card-prep">', '<!-- 2. ODÓMETRO MECÁNICO Y DESGASTE PREDICTIVO -->\n        <div class="card-prep" id="card-prep-odo">')
html = html.replace('<!-- 3. RUTA PLANIFICADA, CLIMBPRO Y MAPA OFFLINE -->\n        <div class="card-prep"', '<!-- 3. RUTA PLANIFICADA, CLIMBPRO Y MAPA OFFLINE -->\n        <div class="card-prep" id="card-prep-gpx"')
html = html.replace('<!-- 5. ESCÁNER BIOMECÁNICO BIKEFIT', '<div id="card-prep-bike"></div>\n        <!-- 5. ESCÁNER BIOMECÁNICO BIKEFIT')
html = html.replace('<!-- 6. SEGMENTOS PRIVADOS Y MEDALLERO PR (Prioridad 3, Ítem 9) -->\n        <div class="card-prep">', '<!-- 6. SEGMENTOS PRIVADOS Y MEDALLERO PR -->\n        <div class="card-prep" id="card-prep-seg">')
html = html.replace('<!-- 7. ENTRENAMIENTOS GUIADOS / PLANIFICADOR IA (Prioridad 3, Ítem 8) -->\n        <div class="card-prep">', '<!-- 7. ENTRENAMIENTOS GUIADOS / PLANIFICADOR IA -->\n        <div class="card-prep" id="card-prep-plan">')

# 4. Add deterministic demo engine in JS
demo_engine_js = """
        // ========================================================
        // MOTOR DE MODO DEMOSTRACIÓN DETERMINISTA V2 (CONTRATO §6)
        // ========================================================
        function scrollearACardPrep(key) {
            const el = document.getElementById('card-prep-' + key);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                el.style.transition = 'box-shadow 0.4s ease';
                el.style.boxShadow = '0 0 16px var(--acc-line)';
                setTimeout(() => { el.style.boxShadow = ''; }, 1200);
            }
        }

        function inicializarModoDemoDeterminista() {
            const urlParams = new URLSearchParams(window.location.search);
            const esDemo = urlParams.get('demo') === '1';

            const hash = {};
            (window.location.hash || '').replace(/^#/, '').split('&').forEach(p => {
                const [k, v] = p.split('=');
                if (k) hash[k] = decodeURIComponent(v || '');
            });

            if (hash.pal === 'sol' || urlParams.get('pal') === 'sol') {
                document.body.setAttribute('data-pal', 'sol');
            }

            if (!esDemo) return;

            console.log("[Demo] Modo Demostración Determinista V2 activado. Escenario:", hash.scen || 'boceto');
            document.body.classList.add('modo-demo-v2');

            // Pausar geolocalización real para evitar fluctuaciones
            if (watchIdGPS) {
                navigator.geolocation.clearWatch(watchIdGPS);
                watchIdGPS = null;
            }

            const FROZEN = {
                v: 14.2, g: 6.2, p: 212, dist: 6.82, s: 6820, t: 2538, asc: 312, kcal: 486
            };

            aplicarEscenarioDemoV2(hash.scen || 'boceto', FROZEN);

            if (hash.tab) {
                cambiarPestanaApp(hash.tab);
            }
            if (hash.view) {
                cambiarVistaRadarV2(hash.view);
            }
        }

        function aplicarEscenarioDemoV2(scen, F) {
            const dVel = document.getElementById('v2-dock-vel');
            const dPend = document.getElementById('v2-dock-pend');
            const dWatts = document.getElementById('v2-dock-watts');
            const dKcal = document.getElementById('v2-dock-kcal');
            const sKm = document.getElementById('v2-strip-km');
            const sTiempo = document.getElementById('v2-strip-tiempo');
            const sDesnivel = document.getElementById('v2-strip-desnivel');
            const sysbar = document.getElementById('v2-sysbar');
            const sysbarTxt = document.getElementById('v2-sysbar-txt');
            const chipRec = document.getElementById('v2-chip-rec');
            const chipRecTxt = document.getElementById('v2-chip-rec-txt');
            const pGps = document.getElementById('pildora-gps-header');
            const txtGps = document.getElementById('ui-gps-header-texto');
            const mapAlert = document.getElementById('v2-map-alert');
            const mapAlertIco = document.getElementById('v2-map-alert-ico');
            const mapAlertK = document.getElementById('v2-map-alert-k');
            const mapAlertT = document.getElementById('v2-map-alert-t');
            const mapAlertDist = document.getElementById('v2-map-alert-dist');

            // Valores base Boceto
            if (dVel) dVel.textContent = "14,2";
            if (dPend) dPend.textContent = "6,2";
            if (dWatts) dWatts.textContent = "212";
            if (dKcal) dKcal.textContent = "486 kcal";
            if (sKm) sKm.textContent = "6,82";
            if (sTiempo) sTiempo.textContent = "42:18";
            if (sDesnivel) sDesnivel.textContent = "+312";
            if (chipRec) chipRec.className = "v2-rec";
            if (chipRecTxt) chipRecTxt.textContent = "REC 42:18";
            if (pGps) pGps.className = "pildora-header-status activo";
            if (txtGps) txtGps.textContent = "GPS ±5m";

            if (mapAlert) {
                mapAlert.className = "v2-malert r";
                if (mapAlertIco) mapAlertIco.textContent = "▲▲";
                if (mapAlertK) mapAlertK.textContent = "AVISO · EN 400 M";
                if (mapAlertT) mapAlertT.textContent = "Pared 11 % durante 300 m · Bajá a plato chico y subí la cadencia";
                if (mapAlertDist) mapAlertDist.textContent = "400 m";
            }

            if (scen === 'antes') {
                if (dVel) dVel.textContent = "0,0";
                if (dPend) dPend.textContent = "0,0";
                if (dWatts) dWatts.textContent = "0";
                if (sKm) sKm.textContent = "0,00";
                if (sTiempo) sTiempo.textContent = "00:00";
                if (sDesnivel) sDesnivel.textContent = "+0";
                if (chipRecTxt) chipRecTxt.textContent = "LISTO";
                if (sysbar) {
                    sysbar.style.display = "flex";
                    sysbar.className = "v2-sysbar info";
                    if (sysbarTxt) sysbarTxt.textContent = "Buscando GPS… Esperá la señal antes de iniciar";
                }
                if (mapAlert) {
                    mapAlert.className = "v2-malert g";
                    if (mapAlertK) mapAlertK.textContent = "LISTO PARA SALIR";
                    if (mapAlertT) mapAlertT.textContent = "Tocá Iniciar recorrido cuando estés listo";
                    if (mapAlertDist) mapAlertDist.textContent = "OK";
                }
            } else if (scen === 'pared') {
                if (dVel) dVel.textContent = "14,0";
                if (dPend) dPend.textContent = "11,4";
                if (dWatts) dWatts.textContent = "340";
                if (mapAlert) {
                    mapAlert.className = "v2-malert r";
                    if (mapAlertK) mapAlertK.textContent = "EN LA PARED";
                    if (mapAlertT) mapAlertT.textContent = "Pared 11 % · quedan 260 m · Plato chico y cadencia firme";
                    if (mapAlertDist) mapAlertDist.textContent = "260 m";
                }
            } else if (scen === 'pausa') {
                if (chipRec) chipRec.className = "v2-rec paused";
                if (chipRecTxt) chipRecTxt.textContent = "PAUSADO";
                if (sysbar) {
                    sysbar.style.display = "flex";
                    sysbar.className = "v2-sysbar warn";
                    if (sysbarTxt) sysbarTxt.textContent = "Grabación en pausa · El tiempo detenido no suma kilómetros";
                }
            } else if (scen === 'gps_debil') {
                if (pGps) pGps.className = "pildora-header-status warn";
                if (txtGps) txtGps.textContent = "GPS ±19m";
                if (sysbar) {
                    sysbar.style.display = "flex";
                    sysbar.className = "v2-sysbar warn";
                    if (sysbarTxt) sysbarTxt.textContent = "GPS débil (±19 m): buscando satélites…";
                }
            } else if (scen === 'sin_gps') {
                if (pGps) pGps.className = "pildora-header-status bad";
                if (txtGps) txtGps.textContent = "Sin GPS";
                if (sysbar) {
                    sysbar.style.display = "flex";
                    sysbar.className = "v2-sysbar bad";
                    if (sysbarTxt) sysbarTxt.textContent = "Sin señal GPS hace 12 s: se detuvo el registro de distancia";
                }
            } else if (scen === 'offline') {
                if (sysbar) {
                    sysbar.style.display = "flex";
                    sysbar.className = "v2-sysbar info";
                    if (sysbarTxt) sysbarTxt.textContent = "Sin conexión: se sube sola cuando vuelva la red";
                }
                const pOff = document.getElementById('v2-mpill-offline');
                if (pOff) { pOff.textContent = "Mapa offline"; pOff.className = "v2-mpill ok"; }
            } else if (scen === 'offline_sin') {
                if (sysbar) {
                    sysbar.style.display = "flex";
                    sysbar.className = "v2-sysbar warn";
                    if (sysbarTxt) sysbarTxt.textContent = "Sin conexión y sin mapa: solo se dibuja tu traza";
                }
                const pOff = document.getElementById('v2-mpill-offline');
                if (pOff) { pOff.textContent = "Sin mapa descargado"; pOff.className = "v2-mpill warn"; }
            } else if (scen === 'segmento') {
                const segPill = document.getElementById('v2-mpill-huella');
                if (segPill) {
                    segPill.style.display = "inline-flex";
                    segPill.textContent = "Segmento: Cuesta de las Cañas · −12 s";
                    segPill.style.borderColor = "var(--acc)";
                    segPill.style.color = "var(--acc)";
                }
            } else if (scen === 'todo') {
                const segPill = document.getElementById('v2-mpill-huella');
                if (segPill) {
                    segPill.style.display = "inline-flex";
                    segPill.textContent = "Ghost Pacer: +14 s adelantado · Escuadrón: 2 cerca";
                    segPill.style.borderColor = "var(--acc)";
                    segPill.style.color = "var(--acc)";
                }
            } else if (scen === 'caida') {
                setTimeout(() => {
                    const mCaida = document.getElementById('modal-alerta-caida');
                    if (mCaida) mCaida.style.display = 'flex';
                }, 150);
            } else if (scen === 'final') {
                setTimeout(() => {
                    const mFin = document.getElementById('modal-confirmar-finalizar') || document.getElementById('modal-reporte');
                    if (mFin) mFin.style.display = 'block';
                }, 150);
            }
        }

        // Delegación de eventos [data-act] para compatibilidad con la suite Playwright de V2
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-act]');
            if (!target) return;
            const act = target.getAttribute('data-act');
            if (act === 'dock.cycle') {
                ciclarModoDockV2();
            } else if (act === 'hdr.cab') {
                toggleRanuraCockpit();
            } else if (act === 'rec.toggle') {
                toggleIniciarPausar();
            } else if (act === 'rec.finish') {
                finalizarEntrenamiento();
            } else if (act === 'cab.sos') {
                compartirUbicacionWhatsApp();
            } else if (act === 'cab.lock') {
                activarBloqueoPantalla();
            } else if (act === 'cab.ghost') {
                abrirModalGhostPacer();
            } else if (act === 'cab.squad') {
                abrirModalEscuadron();
            } else if (act === 'cab.nube') {
                abrirConfigNube();
            } else if (act === 'cab.sim') {
                toggleModalSimuladorGPX();
            } else if (act === 'prep.open') {
                const k = target.getAttribute('data-k');
                scrollearACardPrep(k);
            } else if (act === 'nav') {
                const t = target.getAttribute('data-t');
                if (t) cambiarPestanaApp(t);
            }
        });
"""

if 'inicializarModoDemoDeterminista' not in html:
    html = html.replace('// CONTROLADOR DE VISTAS Y MAPA HERO', demo_engine_js + '\n        // CONTROLADOR DE VISTAS Y MAPA HERO')

# Call inicializarModoDemoDeterminista in load event listener
if 'inicializarModoDemoDeterminista();' not in html:
    html = html.replace('actualizarGraficoZonas(0);', 'actualizarGraficoZonas(0);\n            inicializarModoDemoDeterminista();')

with open(path, 'w', encoding='utf8') as f:
    f.write(html)

print("Demo engine, data-act attributes and Preparacion rows integrated successfully.")
