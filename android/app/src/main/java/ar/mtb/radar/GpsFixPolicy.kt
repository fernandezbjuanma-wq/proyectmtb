package ar.mtb.radar

/** Validación pura: nunca convertir una posición vieja en una posición de ahora. */
object GpsFixPolicy {
    const val MAX_AGE_MS = 120_000L
    const val MAX_AGE_NANOS = MAX_AGE_MS * 1_000_000L

    data class Fix(
        val latitude: Double,
        val longitude: Double,
        val accuracy: Float?,
        val timeMs: Long,
        val elapsedRealtimeNanos: Long,
        val elevation: Double? = null,
        val speed: Float? = null
    )

    fun validate(fix: Fix, nowMs: Long, nowElapsedNanos: Long): Fix? {
        if (!fix.latitude.isFinite() || fix.latitude !in -90.0..90.0) return null
        if (!fix.longitude.isFinite() || fix.longitude !in -180.0..180.0) return null
        val accuracy = fix.accuracy ?: return null
        if (!accuracy.isFinite() || accuracy < 0f || accuracy > 40f) return null

        // Comparar antes de restar evita overflow incluso con valores Long extremos.
        if (fix.timeMs <= 0L || nowMs < fix.timeMs) return null
        if (nowMs - fix.timeMs > MAX_AGE_MS) return null
        if (fix.elapsedRealtimeNanos <= 0L || nowElapsedNanos < fix.elapsedRealtimeNanos) return null
        if (nowElapsedNanos - fix.elapsedRealtimeNanos > MAX_AGE_NANOS) return null

        // Un sensor opcional inválido no debe hacer perder una posición válida.
        return fix.copy(
            elevation = fix.elevation?.takeIf { it.isFinite() },
            speed = fix.speed?.takeIf { it.isFinite() && it >= 0f }
        )
    }
}
