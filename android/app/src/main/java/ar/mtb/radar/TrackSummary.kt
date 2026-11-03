package ar.mtb.radar

import kotlin.math.*

/** Copia de una muestra confirmada en SQLite; no se consulta el GPS desde la interfaz. */
data class TrackSample(
    val lat: Double, val lon: Double, val elevation: Double?,
    val accuracy: Float, val speed: Float, val timeMs: Long
)

data class TrackSummary(
    val distanceMeters: Double = 0.0,
    val elapsedMillis: Long = 0L,
    val averageSpeedKmh: Double = 0.0,
    val maxSpeedKmh: Double = 0.0,
    val ascentMeters: Double? = null,
    val pointCount: Int = 0,
    val lastPoint: TrackSample? = null,
    val firstTimeMs: Long? = null,
    val lastTimeMs: Long? = null,
    val gapCount: Int = 0,
    val invalidPointCount: Int = 0
)

/** Resumen incremental y acotado en memoria. Las métricas GPS son estimaciones. */
class TrackSummaryAccumulator {
    companion object {
        const val MAX_GAP_MS = 60_000L
        const val ELEVATION_STEP_METERS = 3.0
        fun meters(a: TrackSample, b: TrackSample): Double {
            val radians = Math.PI / 180.0
            val lat = (b.lat - a.lat) * radians
            val lon = (b.lon - a.lon) * radians
            val q = (sin(lat / 2).pow(2) + cos(a.lat * radians) *
                cos(b.lat * radians) * sin(lon / 2).pow(2)).coerceIn(0.0, 1.0)
            return 6_371_000.0 * 2 * atan2(sqrt(q), sqrt(1 - q))
        }
    }
    private var firstTime: Long? = null
    private var last: TrackSample? = null
    private var count = 0
    private var invalid = 0
    private var distance = 0.0
    private var maximumSpeed = 0.0
    private var ascent = 0.0
    private var elevationSamples = 0
    private var elevationAnchor: Double? = null
    private var gaps = 0

    fun add(point: TrackSample) {
        if (!point.lat.isFinite() || point.lat !in -90.0..90.0 ||
            !point.lon.isFinite() || point.lon !in -180.0..180.0 || point.timeMs <= 0L ||
            last?.let { point.timeMs <= it.timeMs } == true) {
            invalid++
            return
        }
        val previous = last
        if (previous != null) {
            if (point.timeMs - previous.timeMs > MAX_GAP_MS) {
                // Una recta entre extremos no reconstruye una parte perdida del recorrido.
                gaps++
                elevationAnchor = null
            } else {
                distance += meters(previous, point)
            }
        }
        val elevation = point.elevation?.takeIf { it.isFinite() }
        if (elevation == null) {
            elevationAnchor = null
        } else {
            elevationSamples++
            val anchor = elevationAnchor
            if (anchor == null) elevationAnchor = elevation
            else if (elevation - anchor >= ELEVATION_STEP_METERS) {
                ascent += elevation - anchor
                elevationAnchor = elevation
            } else if (anchor - elevation >= ELEVATION_STEP_METERS) {
                elevationAnchor = elevation
            }
        }
        if (point.speed.isFinite() && point.speed >= 0f) {
            maximumSpeed = max(maximumSpeed, point.speed.toDouble() * 3.6)
        }
        if (firstTime == null) firstTime = point.timeMs
        count++
        last = point
    }

    fun summary(): TrackSummary {
        val lastTime = last?.timeMs
        val first = firstTime
        val elapsed = if (lastTime != null && first != null) lastTime - first else 0L
        return TrackSummary(distance, elapsed,
            if (elapsed > 0L) distance / elapsed * 3_600.0 else 0.0,
            maximumSpeed, if (elevationSamples >= 2) ascent else null,
            count, last, first, lastTime, gaps, invalid)
    }
}
