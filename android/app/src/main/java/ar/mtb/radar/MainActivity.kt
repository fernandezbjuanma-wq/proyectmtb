package ar.mtb.radar

import android.Manifest
import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Typeface
import android.location.LocationManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.provider.Settings
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.Executors

/** Interfaz Android local. El único grabador es TrackingService; la UI no solicita posiciones. */
class MainActivity : Activity() {
    private enum class Area(val label: String) {
        PREPARATION("Preparación"), RADAR("Radar Live"), LAB("Laboratorio"), HISTORY("Historial")
    }
    private enum class Action { NONE, START, STOP }
    private data class Snapshot(
        val sessions: List<TrackDatabase.Session>,
        val unfinishedId: String?,
        val radarSessionId: String?,
        val radarSummary: TrackSummary?,
        val labSession: TrackDatabase.Session?,
        val labSummary: TrackSummary?,
        val stopTargetSession: TrackDatabase.Session?
    )

    private val main = Handler(Looper.getMainLooper())
    private val io = Executors.newSingleThreadExecutor()
    private val bindings = mutableListOf<(Snapshot?) -> Unit>()
    private lateinit var body: LinearLayout
    private lateinit var scroll: ScrollView
    private lateinit var banner: TextView
    private val tabs = mutableMapOf<Area, Button>()
    private var area = Area.PREPARATION
    private var selectedSessionId: String? = null
    private var pendingExport: String? = null
    private var historyLimit = 30
    private var snapshot: Snapshot? = null
    private var screenKey: String? = null
    private var notice: String? = null
    private var resumed = false
    private var destroyed = false
    private var readInFlight = false
    private var refreshAgain = false
    private var action = Action.NONE
    private var commandIssuedAt: Long? = null
    private var expectedStopSessionId: String? = null
    private var requestedNewFromId: String? = null
    private var waitingPermissionCode = 0
    private var continueStartOnResume = false
    private var notificationPromptOffered = false
    private var actionDialog: AlertDialog? = null
    private var versionLabel = "0.3.0-alpha"
    private val refresh = Runnable { loadSnapshot() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        area = Area.values().getOrElse(savedInstanceState?.getInt("area", 0) ?: 0) { Area.PREPARATION }
        selectedSessionId = savedInstanceState?.getString("selected_session")
        pendingExport = savedInstanceState?.getString("pending_export")
        historyLimit = (savedInstanceState?.getInt("history_limit", 30) ?: 30).coerceAtLeast(30)
        notificationPromptOffered = savedInstanceState?.getBoolean("notification_prompt", false) ?: false
        notice = savedInstanceState?.getString("notice")
        val savedCommandTime = savedInstanceState?.getLong("command_issued_at", -1L) ?: -1L
        val nowElapsed = SystemClock.elapsedRealtime()
        if (savedCommandTime > nowElapsed) {
            // El reloj monotónico se reinició: no restaurar ni reenviar esa orden.
            action = Action.NONE
            commandIssuedAt = null
            notice = "La solicitud anterior quedó sin confirmar. Revisá el estado actual; no se envió otra orden al GPS."
        } else if (savedCommandTime >= 0L) {
            // Una orden enviada solo se observa después de rotar; nunca se reenvía.
            action = Action.values().getOrElse(savedInstanceState?.getInt("command_action", 0) ?: 0) { Action.NONE }
            if (action != Action.NONE) {
                commandIssuedAt = savedCommandTime
                expectedStopSessionId = savedInstanceState?.getString("stop_target")
                requestedNewFromId = savedInstanceState?.getString("start_new_from")
            }
        } else if (savedInstanceState?.getBoolean("start_waiting_permission", false) == true) {
            // Esta intención procede de la pulsación anterior, no de abrir la app.
            action = Action.START
            waitingPermissionCode = savedInstanceState.getInt("waiting_permission", 0)
            continueStartOnResume = savedInstanceState.getBoolean("permission_result_ready", false)
        }
        versionLabel = try { packageManager.getPackageInfo(packageName, 0).versionName ?: versionLabel }
            catch (_: Exception) { versionLabel }

        val root = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        root.setOnApplyWindowInsetsListener { view, insets ->
            view.setPadding(dp(12) + insets.systemWindowInsetLeft, dp(8) + insets.systemWindowInsetTop,
                dp(12) + insets.systemWindowInsetRight, dp(4) + insets.systemWindowInsetBottom)
            insets
        }
        root.addView(label("Radar Táctico MTB", 23f, true))
        banner = label("Leyendo actividades guardadas…", 14f)
        banner.accessibilityLiveRegion = View.ACCESSIBILITY_LIVE_REGION_POLITE
        root.addView(banner)
        body = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(0, dp(12), 0, dp(12)) }
        scroll = ScrollView(this).apply { isFillViewport = true; addView(body) }
        root.addView(scroll, LinearLayout.LayoutParams(-1, 0, 1f))
        val navigation = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        for (destination in Area.values()) {
            val tab = Button(this).apply {
                text = destination.label
                textSize = 11f
                isAllCaps = false
                minHeight = dp(56)
                setPadding(dp(2), dp(4), dp(2), dp(4))
                setOnClickListener { area = destination; screenKey = null; render(); scheduleRefresh(0) }
            }
            tabs[destination] = tab
            navigation.addView(tab, LinearLayout.LayoutParams(0, -2, 1f))
        }
        root.addView(navigation)
        setContentView(root)
        root.requestApplyInsets()
        render()
    }

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()
    private fun label(value: String, size: Float = 16f, bold: Boolean = false) = TextView(this).apply {
        text = value
        textSize = size
        setPadding(0, dp(7), 0, dp(7))
        if (bold) setTypeface(typeface, Typeface.BOLD)
    }
    private fun paragraph(value: String) { body.addView(label(value)) }
    private fun boundText(size: Float = 17f, text: (Snapshot?) -> String) {
        val view = label("", size)
        body.addView(view)
        bindings.add { view.text = text(it) }
    }
    private fun button(title: String, enabled: (Snapshot?) -> Boolean = { true }, click: () -> Unit) {
        val view = Button(this).apply {
            text = title; isAllCaps = false; minHeight = dp(52)
            setOnClickListener { click() }
        }
        body.addView(view, LinearLayout.LayoutParams(-1, -2))
        bindings.add { view.isEnabled = enabled(it) }
    }
    private fun fineLocationGranted() = checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
    private fun notificationsGranted() = Build.VERSION.SDK_INT < 33 ||
        checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
    private fun gpsEnabled(): Boolean = try {
        (getSystemService(LOCATION_SERVICE) as LocationManager).isProviderEnabled(LocationManager.GPS_PROVIDER)
    } catch (_: Exception) { false }
    private fun inform(message: String) { notice = message; render() }
    private fun number(value: Double, decimals: Int = 1): String = String.format(Locale("es", "AR"), "%.${decimals}f", value)
    private fun duration(milliseconds: Long): String {
        val seconds = milliseconds.coerceAtLeast(0L) / 1000L
        return String.format(Locale("es", "AR"), "%02d:%02d:%02d", seconds / 3600L, seconds / 60L % 60L, seconds % 60L)
    }
    private fun date(time: Long): String = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale("es", "AR")).format(Date(time))
    private fun sessionState(session: TrackDatabase.Session, state: Snapshot?): String = when {
        session.endedAt != null -> "Finalizada"
        TrackingService.trackingActive && state?.unfinishedId == session.id -> "En grabación"
        else -> "Interrumpida · puntos conservados"
    }

    private fun render() {
        if (destroyed) return
        val data = snapshot?.let {
            val serviceSession = TrackingService.activeSessionId
            if ((TrackingService.trackingActive || TrackingService.trackingStarting) &&
                (serviceSession == null || it.radarSessionId != serviceSession)) it.copy(radarSummary = null)
            else it
        }
        val key = area.name + when (area) {
            Area.HISTORY -> ":" + historyLimit + ":" + data?.sessions?.joinToString { it.id }
            Area.LAB -> ":" + data?.labSession?.id
            else -> ""
        }
        if (screenKey != key) {
            screenKey = key
            bindings.clear()
            body.removeAllViews()
            body.addView(label(area.label, 22f, true))
            when (area) {
                Area.PREPARATION -> buildPreparation()
                Area.RADAR -> buildRadar()
                Area.LAB -> buildLab()
                Area.HISTORY -> buildHistory(data)
            }
            scroll.scrollTo(0, 0)
        }
        val messages = mutableListOf<String>()
        notice?.let { messages.add(it) }
        TrackingService.statusMessage?.let { messages.add(it) }
        if (!notificationsGranted()) messages.add("Notificaciones desactivadas: los avisos de grabación no aparecerán en la bandeja. Podés habilitarlas en Ajustes.")
        if (messages.isEmpty()) messages.add(when {
            TrackingService.trackingStarting -> "Iniciando grabador Android…"
            TrackingService.trackingActive -> "Grabador Android activo · guardado local"
            else -> "Actividades en este teléfono · sin conexión necesaria"
        })
        banner.text = messages.distinct().joinToString("\n")
        for ((destination, tab) in tabs) {
            tab.isSelected = destination == area
            tab.setTypeface(tab.typeface, if (destination == area) Typeface.BOLD else Typeface.NORMAL)
            tab.contentDescription = destination.label + if (destination == area) ", seleccionada" else ""
        }
        bindings.forEach { it(data) }
    }

    private fun buildPreparation() {
        paragraph("Versión $versionLabel · primera versión Android nativa")
        paragraph("Las salidas se guardan en este teléfono. La grabación y el historial se abren sin cargar un sitio web.")
        boundText { if (fineLocationGranted()) "Ubicación precisa: concedida" else "Ubicación precisa: falta permiso" }
        boundText { if (gpsEnabled()) "GPS del teléfono: activado" else "GPS del teléfono: desactivado" }
        boundText { if (notificationsGranted()) "Permiso de notificaciones: concedido" else "Permiso de notificaciones: no concedido" }
        boundText { data ->
            when {
                TrackingService.trackingStarting -> "El servicio está preparando la grabación. Esperá la confirmación de inicio."
                TrackingService.trackingActive -> "Ya hay una grabación activa. Podés seguirla en Radar Live."
                data?.unfinishedId != null -> "Hay una actividad interrumpida. Al iniciar podés continuarla o cerrarla para empezar otra; sus puntos se conservan."
                data == null -> "Consultando sesiones guardadas…"
                else -> "Listo para iniciar una salida."
            }
        }
        button("Iniciar GPS", { !TrackingService.trackingActive && !TrackingService.trackingStarting && action == Action.NONE && it != null }) { requestStart() }
        button("Cancelar inicio pendiente", { action == Action.START && commandIssuedAt == null }) { cancelAction() }
        button("Abrir ajustes de GPS") { openSettings(Settings.ACTION_LOCATION_SOURCE_SETTINGS) }
        button("Permisos y notificaciones de la app") {
            openSettings(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:$packageName"))
        }
        paragraph("Esta alpha tiene almacenamiento propio: los registros de Chrome y del APK anterior no se importan automáticamente. Conservá sus respaldos y sus instalaciones.")
        paragraph("Android puede interrumpir la grabación por restricciones del sistema o Forzar detención. Comprobá la notificación y los puntos guardados antes de salir.")
    }

    private fun buildRadar() {
        boundText(20f) { data ->
            when {
                (action == Action.START && commandIssuedAt != null) || TrackingService.trackingStarting -> "Iniciando GPS…"
                action == Action.STOP && commandIssuedAt != null -> "Finalizando y conservando los puntos…"
                TrackingService.trackingActive && TrackingService.lastFixTimeMs == null -> "GPS iniciado · esperando una posición válida"
                TrackingService.trackingActive -> "Grabación GPS activa"
                data?.unfinishedId != null -> "Grabación interrumpida · recuperable desde Preparación"
                else -> "GPS detenido"
            }
        }
        boundText { data ->
            if (TrackingService.trackingActive || TrackingService.trackingStarting || data?.unfinishedId != null) "Datos de la sesión actual"
            else "Última actividad guardada"
        }
        boundText(28f) { "${number((it?.radarSummary?.distanceMeters ?: 0.0) / 1000.0, 2)} km" }
        boundText { "${it?.radarSummary?.pointCount ?: 0} puntos confirmados en el teléfono" }
        boundText { "Intervalo registrado por GPS: ${duration(it?.radarSummary?.elapsedMillis ?: 0L)}" }
        boundText { data ->
            val point = data?.radarSummary?.lastPoint
            if (point == null) "Velocidad y precisión: esperando un punto GPS guardado"
            else "Último punto: ${number(point.speed.toDouble() * 3.6)} km/h · precisión ±${number(point.accuracy.toDouble(), 0)} m"
        }
        boundText { data ->
            val time = data?.radarSummary?.lastTimeMs
            if (time == null) "Todavía no hay posiciones guardadas en esta sesión."
            else {
                val now = System.currentTimeMillis()
                if (time > now) "La última posición tiene una hora futura; revisá el reloj del teléfono"
                else {
                    val ageSeconds = (now - time) / 1000L
                    "Última posición guardada: hace ${ageSeconds} s" + if (ageSeconds > 30L) " · sin posición reciente" else ""
                }
            }
        }
        boundText { data -> qualityMessage(data?.radarSummary) }
        button("Iniciar GPS", { !TrackingService.trackingActive && !TrackingService.trackingStarting && action == Action.NONE && it != null }) { requestStart() }
        button("Cancelar inicio pendiente", { action == Action.START && commandIssuedAt == null }) { cancelAction() }
        button("Finalizar recorrido", { TrackingService.trackingActive && action == Action.NONE }) { requestStop() }
        paragraph("Distancia y velocidad dependen de la calidad GPS. El intervalo entre puntos incluye pausas y ausencias de señal; no es tiempo en movimiento.")
    }

    private fun buildLab() {
        boundText { data -> data?.labSession?.let { "${date(it.startedAt)} · ${sessionState(it, data)}" }
            ?: "Todavía no hay una actividad finalizada para analizar." }
        boundText { data -> data?.labSummary?.let { "Distancia GPS: ${number(it.distanceMeters / 1000.0, 2)} km" } ?: "" }
        boundText { data -> data?.labSummary?.let { "Intervalo entre puntos: ${duration(it.elapsedMillis)}" } ?: "" }
        boundText { data -> data?.labSummary?.let { "Media estimada sobre ese intervalo: ${number(it.averageSpeedKmh)} km/h" } ?: "" }
        boundText { data -> data?.labSummary?.let { "Velocidad máxima registrada: ${number(it.maxSpeedKmh)} km/h" } ?: "" }
        boundText { data -> data?.labSummary?.let { summary ->
            "Desnivel positivo GPS estimado: " + (summary.ascentMeters?.let { "${number(it, 0)} m" } ?: "sin altitudes suficientes")
        } ?: "" }
        boundText { data -> data?.labSummary?.let { "${it.pointCount} puntos conservados" } ?: "" }
        boundText { data -> qualityMessage(data?.labSummary) }
        button("Exportar GPX", { it?.labSession?.endedAt != null && (it.labSummary?.pointCount ?: 0) > 0 && pendingExport == null }) {
            snapshot?.labSession?.let { requestExport(it) }
        }
        paragraph("La media usa el intervalo completo entre puntos, incluidas interrupciones. No representa exclusivamente tiempo en movimiento.")
        paragraph("El GPX contiene las coordenadas y horarios registrados. Elegí dónde guardar el archivo y con quién compartirlo.")
    }
    private fun qualityMessage(summary: TrackSummary?): String {
        if (summary == null) return ""
        val messages = mutableListOf<String>()
        if (summary.gapCount > 0) messages.add("${summary.gapCount} intervalos sin continuidad GPS; las métricas pueden estar incompletas")
        if (summary.invalidPointCount > 0) messages.add("${summary.invalidPointCount} puntos no utilizables en el cálculo; el registro original se conserva")
        return messages.joinToString(". ")
    }

    private fun buildHistory(data: Snapshot?) {
        if (data == null) { paragraph("Leyendo actividades…"); return }
        if (data.sessions.isEmpty()) paragraph("Todavía no hay actividades en esta app. Las salidas grabadas aquí aparecerán en este historial.")
        else {
            paragraph("Últimas ${data.sessions.size} actividades · ordenadas desde la más reciente")
            for (session in data.sessions) {
                val entry = Button(this).apply { isAllCaps = false; minHeight = dp(64) }
                body.addView(entry, LinearLayout.LayoutParams(-1, -2))
                bindings.add { current ->
                    val item = current?.sessions?.firstOrNull { it.id == session.id } ?: session
                    entry.text = "${date(item.startedAt)}\n${item.count} puntos · ${sessionState(item, current)}"
                }
                entry.setOnClickListener {
                    selectedSessionId = session.id
                    area = Area.LAB
                    screenKey = null
                    snapshot = snapshot?.copy(labSession = session, labSummary = null)
                    render()
                    scheduleRefresh(0)
                }
            }
        }
        if (data.sessions.size >= historyLimit) button("Mostrar 30 actividades más", { !readInFlight }) {
            historyLimit += 30
            screenKey = null
            scheduleRefresh(0)
        }
        paragraph("Una sesión interrumpida conserva sus puntos. Para continuarla o cerrarla, usá Iniciar GPS en Preparación.")
    }

    private fun scheduleRefresh(delay: Long = 2_500L) {
        main.removeCallbacks(refresh)
        if (resumed && !destroyed) main.postDelayed(refresh, delay)
    }
    private fun findSession(db: TrackDatabase, id: String): TrackDatabase.Session? = db.readableDatabase.rawQuery(
        "SELECT s.id,s.started_at,s.ended_at,COUNT(p.id) FROM sessions s LEFT JOIN positions p ON p.session_id=s.id WHERE s.id=? GROUP BY s.id",
        arrayOf(id)
    ).use {
        if (!it.moveToFirst()) null else TrackDatabase.Session(it.getString(0), it.getLong(1),
            if (it.isNull(2)) null else it.getLong(2), it.getInt(3))
    }
    private fun loadSnapshot() {
        if (!resumed || destroyed) return
        if (readInFlight) { refreshAgain = true; return }
        readInFlight = true
        val selection = selectedSessionId
        val limit = historyLimit
        val stopTarget = expectedStopSessionId
        io.execute {
            try {
                val result = TrackDatabase(applicationContext).use { db ->
                    val sessions = db.sessions(limit)
                    val unfinished = db.currentSession()
                    val radarId = TrackingService.activeSessionId ?: unfinished ?: sessions.firstOrNull()?.id
                    val lab = selection?.let { id -> sessions.firstOrNull { it.id == id } ?: findSession(db, id) }
                        ?: sessions.firstOrNull { it.endedAt != null }
                    val radarSummary = radarId?.let { db.summary(it) }
                    val labSummary = lab?.let { if (it.id == radarId) radarSummary else db.summary(it.id) }
                    val stopSession = stopTarget?.let { id -> sessions.firstOrNull { it.id == id } ?: findSession(db, id) }
                    Snapshot(sessions, unfinished, radarId, radarSummary, lab, labSummary, stopSession)
                }
                main.post { finishRead(result, null, selection) }
            } catch (_: Exception) {
                main.post { finishRead(null, "No se pudo leer el almacenamiento de actividades. No se modificaron tus sesiones.", selection) }
            }
        }
    }
    private fun finishRead(result: Snapshot?, error: String?, selection: String?) {
        readInFlight = false
        if (destroyed) return
        if (error != null) notice = error
        if (result != null && selection == selectedSessionId) snapshot = result
        if (commandIssuedAt != null) {
            val serviceSession = TrackingService.activeSessionId
            val stopTarget = expectedStopSessionId
            val stopSession = result?.stopTargetSession
            when {
                action == Action.START && TrackingService.trackingActive && serviceSession != null &&
                    result != null && result.unfinishedId == serviceSession && result.radarSessionId == serviceSession &&
                    (requestedNewFromId == null || serviceSession != requestedNewFromId) -> {
                    action = Action.NONE; commandIssuedAt = null; area = Area.RADAR; notice = null
                    requestedNewFromId = null
                }
                action == Action.STOP && stopTarget != null && result != null && stopSession != null &&
                    stopSession.id == stopTarget && stopSession.endedAt != null &&
                    !(TrackingService.trackingActive && serviceSession == stopTarget) -> {
                    action = Action.NONE; commandIssuedAt = null
                    val finished = stopSession
                    expectedStopSessionId = null
                    selectedSessionId = finished.id
                    snapshot = result.copy(labSession = finished,
                        labSummary = if (result.labSession?.id == finished.id) result.labSummary else null)
                    area = Area.LAB
                    notice = "Grabación finalizada. Los puntos permanecen en el teléfono."
                    refreshAgain = true
                }
                SystemClock.elapsedRealtime() - (commandIssuedAt ?: 0L) > 10_000L -> {
                    if (action == Action.START && TrackingService.trackingStarting) {
                        notice = "El servicio sigue preparando el inicio. Esperá su confirmación; no se envió una segunda orden."
                    } else {
                        notice = "No se pudo confirmar la acción del GPS. Revisá el estado y los permisos antes de continuar."
                        action = Action.NONE; commandIssuedAt = null
                        expectedStopSessionId = null; requestedNewFromId = null
                    }
                }
            }
        }
        if (resumed) render()
        val immediately = refreshAgain || selection != selectedSessionId
        refreshAgain = false
        scheduleRefresh(if (immediately) 0L else 2_500L)
    }

    private fun requestStart() {
        if (action != Action.NONE || TrackingService.trackingActive || TrackingService.trackingStarting) return
        action = Action.START
        notice = null
        continueStart()
    }
    private fun continueStart() {
        if (action != Action.START || commandIssuedAt != null || waitingPermissionCode != 0) return
        if (!resumed) { continueStartOnResume = true; return }
        if (!fineLocationGranted()) {
            waitingPermissionCode = LOCATION_REQUEST
            requestPermissions(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION), LOCATION_REQUEST)
            render(); return
        }
        if (Build.VERSION.SDK_INT >= 33 && !notificationsGranted() && !notificationPromptOffered) {
            notificationPromptOffered = true
            waitingPermissionCode = NOTIFICATION_REQUEST
            requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), NOTIFICATION_REQUEST)
            render(); return
        }
        if (!gpsEnabled()) {
            action = Action.NONE
            inform("Activá el GPS del teléfono antes de iniciar una salida.")
            return
        }
        io.execute {
            try {
                val unfinished = TrackDatabase(applicationContext).use { it.currentSession() }
                main.post {
                    if (!mayStartAfterRead()) return@post
                    if (unfinished == null) startNative()
                    else actionDialog = AlertDialog.Builder(this).setTitle("Actividad interrumpida")
                        .setMessage("Podés continuar la misma actividad o conservarla como finalizada y empezar otra. Sus puntos no se borran.")
                        .setPositiveButton("Continuar") { _, _ -> startNative() }
                        .setNeutralButton("Nueva actividad") { _, _ -> closeInterruptedAndStart(unfinished) }
                        .setNegativeButton("Cancelar") { _, _ -> cancelAction() }
                        .setOnCancelListener { cancelAction() }.show()
                }
            } catch (_: Exception) { main.post { cancelAction(); inform("No se pudo consultar la sesión anterior. No se inició otra grabación.") } }
        }
        render()
    }
    private fun mayStartAfterRead(): Boolean {
        if (destroyed) return false
        if (!resumed || action != Action.START || commandIssuedAt != null ||
            TrackingService.trackingActive || TrackingService.trackingStarting) {
            cancelAction()
            return false
        }
        return true
    }
    private fun closeInterruptedAndStart(id: String) {
        // La comprobación, el cierre y la nueva sesión se hacen juntos en el servicio.
        startNative(id)
    }
    private fun startNative(newAfterId: String? = null) {
        if (!mayStartAfterRead()) return
        try {
            snapshot = snapshot?.copy(unfinishedId = null, radarSummary = null)
            val command = Intent(this, TrackingService::class.java).setAction(
                if (newAfterId == null) TrackingService.ACTION_START else TrackingService.ACTION_START_NEW)
            if (newAfterId != null) command.putExtra(TrackingService.EXTRA_SESSION_ID, newAfterId)
            requestedNewFromId = newAfterId
            startForegroundService(command)
            commandIssuedAt = SystemClock.elapsedRealtime()
            area = Area.RADAR
            notice = "Inicio solicitado. Esperando que el servicio y los primeros puntos confirmen la grabación."
            render(); scheduleRefresh(300L)
        } catch (_: Exception) { cancelAction(); inform("No se pudo iniciar el servicio GPS. Revisá permisos y ubicación del teléfono.") }
    }
    private fun requestStop() {
        if (!TrackingService.trackingActive || action != Action.NONE) return
        val target = TrackingService.activeSessionId
        if (target == null) { inform("Todavía no se identificó la sesión activa. Esperá la actualización del estado."); return }
        action = Action.STOP
        expectedStopSessionId = target
        render()
        actionDialog = AlertDialog.Builder(this).setTitle("Finalizar recorrido")
            .setMessage("¿Terminás la grabación? Los puntos confirmados se conservarán en este teléfono.")
            .setPositiveButton("Finalizar") { _, _ ->
                if (!TrackingService.trackingActive || TrackingService.activeSessionId != target) {
                    cancelAction()
                    inform("La sesión activa cambió. Revisá su estado antes de finalizar otra actividad.")
                    scheduleRefresh(0)
                    return@setPositiveButton
                }
                try {
                    startService(Intent(this, TrackingService::class.java).setAction(TrackingService.ACTION_STOP)
                        .putExtra(TrackingService.EXTRA_SESSION_ID, target))
                    commandIssuedAt = SystemClock.elapsedRealtime()
                    notice = "Finalización solicitada…"
                    render(); scheduleRefresh(300L)
                } catch (_: Exception) { cancelAction(); inform("No se pudo solicitar la finalización. Verificá el estado del GPS.") }
            }
            .setNegativeButton("Seguir grabando") { _, _ -> cancelAction() }
            .setOnCancelListener { cancelAction() }.show()
    }
    private fun cancelAction() {
        action = Action.NONE; commandIssuedAt = null; continueStartOnResume = false
        expectedStopSessionId = null; requestedNewFromId = null; waitingPermissionCode = 0
        if (!destroyed) render()
    }
    private fun openSettings(settingsAction: String, uri: Uri? = null) {
        try { startActivity(Intent(settingsAction, uri)) }
        catch (_: Exception) { inform("No se pudieron abrir esos ajustes. Buscá Radar MTB en los ajustes del teléfono.") }
    }

    private fun requestExport(session: TrackDatabase.Session) {
        if (session.endedAt == null || session.count == 0 || pendingExport != null) return
        pendingExport = session.id
        val name = SimpleDateFormat("yyyy-MM-dd_HH-mm-ss", Locale.US).format(Date(session.startedAt))
        val save = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "application/gpx+xml"
            putExtra(Intent.EXTRA_TITLE, "RadarMTB_$name.gpx")
        }
        try { startActivityForResult(save, GPX_REQUEST) }
        catch (_: Exception) { pendingExport = null; inform("No se pudo abrir el selector de archivos. La actividad sigue guardada.") }
        render()
    }
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode != GPX_REQUEST) return
        val id = pendingExport
        pendingExport = null
        if (resultCode != RESULT_OK || id == null) { render(); return }
        val uri = data?.data
        if (uri == null) { inform("No se obtuvo un archivo de destino. La actividad sigue guardada."); return }
        notice = "Exportando GPX…"
        io.execute {
            try {
                TrackDatabase(applicationContext).use { db ->
                    val closed = db.readableDatabase.rawQuery("SELECT ended_at FROM sessions WHERE id=?", arrayOf(id)).use {
                        it.moveToFirst() && !it.isNull(0)
                    }
                    check(closed) { "La sesión debe estar finalizada" }
                    contentResolver.openOutputStream(uri, "w")?.bufferedWriter(Charsets.UTF_8)?.use { GpxExport.write(db, id, it) }
                        ?: throw IllegalStateException("No se pudo abrir el archivo")
                }
                main.post { if (!destroyed) inform("GPX guardado en el archivo que elegiste. La actividad original se conserva.") }
            } catch (_: Exception) {
                main.post { if (!destroyed) inform("Falló la exportación GPX; el archivo puede estar incompleto. La actividad original sigue guardada.") }
            }
        }
        render()
    }
    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, results: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, results)
        // Ignorar respuestas tardías si el usuario canceló el inicio o la orden ya salió.
        if (action != Action.START || commandIssuedAt != null || waitingPermissionCode != requestCode) return
        waitingPermissionCode = 0
        if (requestCode == LOCATION_REQUEST) {
            if (fineLocationGranted()) continueStart()
            else { cancelAction(); inform("Ubicación precisa no concedida. La grabación no se inició. Podés cambiar el permiso en Ajustes.") }
        } else if (requestCode == NOTIFICATION_REQUEST) {
            if (!notificationsGranted()) notice = "Podés grabar, pero las notificaciones están desactivadas. Habilitalas desde los ajustes de la app para ver los avisos."
            continueStart()
        }
    }
    override fun onSaveInstanceState(outState: Bundle) {
        outState.putInt("area", area.ordinal)
        outState.putString("selected_session", selectedSessionId)
        outState.putString("pending_export", pendingExport)
        outState.putInt("history_limit", historyLimit)
        outState.putBoolean("notification_prompt", notificationPromptOffered)
        outState.putString("notice", notice)
        outState.putLong("command_issued_at", commandIssuedAt ?: -1L)
        outState.putInt("command_action", if (commandIssuedAt != null) action.ordinal else Action.NONE.ordinal)
        outState.putString("stop_target", expectedStopSessionId)
        outState.putString("start_new_from", requestedNewFromId)
        outState.putBoolean("start_waiting_permission", action == Action.START && commandIssuedAt == null &&
            (waitingPermissionCode != 0 || continueStartOnResume))
        outState.putInt("waiting_permission", waitingPermissionCode)
        outState.putBoolean("permission_result_ready", continueStartOnResume)
        super.onSaveInstanceState(outState)
    }
    override fun onResume() {
        super.onResume(); resumed = true
        if (action == Action.START && commandIssuedAt == null) {
            if (continueStartOnResume) {
                continueStartOnResume = false
                continueStart()
            } else if ((waitingPermissionCode == LOCATION_REQUEST && fineLocationGranted()) ||
                (waitingPermissionCode == NOTIFICATION_REQUEST && notificationsGranted())) {
                // Cubre la recreación si Android actualizó el permiso antes del callback.
                waitingPermissionCode = 0
                continueStart()
            }
        }
        scheduleRefresh(0L)
    }
    override fun onPause() { resumed = false; main.removeCallbacks(refresh); super.onPause() }
    override fun onDestroy() {
        destroyed = true; actionDialog?.dismiss(); actionDialog = null
        main.removeCallbacks(refresh); io.shutdown()
        super.onDestroy()
    }
    companion object {
        private const val LOCATION_REQUEST = 101
        private const val NOTIFICATION_REQUEST = 103
        private const val GPX_REQUEST = 102
    }
}
