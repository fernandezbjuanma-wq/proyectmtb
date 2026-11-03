package ar.mtb.radar

import org.junit.Assert.*
import org.junit.Test

class GpsFixPolicyTest {
    private val nowMs = 1_800_000_000_000L
    private val nowNanos = 900_000_000_000L
    // Datos sintéticos; no son un recorrido del usuario.
    private val fresh = GpsFixPolicy.Fix(0.0, 0.0, 5f, nowMs - 1_000L, nowNanos - 1_000_000_000L)
    private fun validate(fix: GpsFixPolicy.Fix) = GpsFixPolicy.validate(fix, nowMs, nowNanos)

    @Test fun preservesOriginalTimestampOfFreshFix() {
        assertEquals(fresh, validate(fresh))
        assertEquals(fresh.timeMs, validate(fresh)!!.timeMs)
    }

    @Test fun acceptsFixAtAgeLimit() {
        val boundary = fresh.copy(timeMs = nowMs - GpsFixPolicy.MAX_AGE_MS,
            elapsedRealtimeNanos = nowNanos - GpsFixPolicy.MAX_AGE_NANOS)
        assertEquals(boundary, validate(boundary))
    }

    @Test fun rejectsOldUtcTimestampInsteadOfRetimingIt() {
        assertNull(validate(fresh.copy(timeMs = nowMs - GpsFixPolicy.MAX_AGE_MS - 1L)))
    }

    @Test fun rejectsOldMonotonicTimestampEvenWhenUtcLooksFresh() {
        assertNull(validate(fresh.copy(elapsedRealtimeNanos = nowNanos - GpsFixPolicy.MAX_AGE_NANOS - 1L)))
    }

    @Test fun rejectsFutureUtcWithoutPoisoningNextFix() {
        assertNull(validate(fresh.copy(timeMs = nowMs + 1L)))
        assertEquals(fresh, validate(fresh))
    }

    @Test fun rejectsFutureMonotonicTime() {
        assertNull(validate(fresh.copy(elapsedRealtimeNanos = nowNanos + 1L)))
    }

    @Test fun rejectsMissingOrNegativeUtcTime() {
        for (time in listOf(0L, -1L, Long.MIN_VALUE)) {
            assertNull(validate(fresh.copy(timeMs = time)))
        }
    }

    @Test fun rejectsMissingOrNegativeMonotonicTime() {
        for (time in listOf(0L, -1L, Long.MIN_VALUE)) {
            assertNull(validate(fresh.copy(elapsedRealtimeNanos = time)))
        }
    }

    @Test fun rejectsNonFiniteOrOutOfRangeCoordinates() {
        for (coordinate in listOf(Double.NaN, Double.POSITIVE_INFINITY, Double.NEGATIVE_INFINITY, 180.1, -180.1)) {
            assertNull(validate(fresh.copy(longitude = coordinate)))
        }
        for (latitude in listOf(Double.NaN, Double.POSITIVE_INFINITY, Double.NEGATIVE_INFINITY, 90.1, -90.1)) {
            assertNull(validate(fresh.copy(latitude = latitude)))
        }
    }

    @Test fun acceptsCoordinateBoundaries() {
        assertNotNull(validate(fresh.copy(latitude = -90.0, longitude = -180.0)))
        assertNotNull(validate(fresh.copy(latitude = 90.0, longitude = 180.0)))
    }

    @Test fun rejectsMissingNegativeOrNonFiniteAccuracy() {
        for (accuracy in listOf(null, -1f, 40.1f, Float.NaN, Float.POSITIVE_INFINITY, Float.NEGATIVE_INFINITY)) {
            assertNull(validate(fresh.copy(accuracy = accuracy)))
        }
        assertNotNull(validate(fresh.copy(accuracy = 0f)))
        assertNotNull(validate(fresh.copy(accuracy = 40f)))
    }

    @Test fun removesInvalidOptionalMeasurementsWithoutLosingPosition() {
        for (elevation in listOf(Double.NaN, Double.POSITIVE_INFINITY, Double.NEGATIVE_INFINITY)) {
            val result = validate(fresh.copy(elevation = elevation))!!
            assertNull(result.elevation)
            assertEquals(fresh.latitude, result.latitude, 0.0)
            assertEquals(fresh.timeMs, result.timeMs)
        }
        for (speed in listOf(-1f, Float.NaN, Float.POSITIVE_INFINITY, Float.NEGATIVE_INFINITY)) {
            val result = validate(fresh.copy(speed = speed))!!
            assertNull(result.speed)
            assertEquals(fresh.timeMs, result.timeMs)
        }
    }

    @Test fun preservesFiniteOptionalMeasurementsIncludingNegativeElevation() {
        val measured = fresh.copy(elevation = -25.0, speed = 8f)
        assertEquals(measured, validate(measured))
        assertEquals(fresh, validate(fresh))
    }

    @Test fun handlesLongExtremesWithoutOverflow() {
        assertNull(validate(fresh.copy(timeMs = Long.MAX_VALUE)))
        assertNull(validate(fresh.copy(elapsedRealtimeNanos = Long.MAX_VALUE)))
        assertNull(GpsFixPolicy.validate(fresh, Long.MIN_VALUE, nowNanos))
        assertNull(GpsFixPolicy.validate(fresh, nowMs, Long.MIN_VALUE))
        val old = fresh.copy(timeMs = 1L, elapsedRealtimeNanos = 1L)
        assertNull(GpsFixPolicy.validate(old, Long.MAX_VALUE, Long.MAX_VALUE))
        val extremeFresh = fresh.copy(timeMs = Long.MAX_VALUE - 1L,
            elapsedRealtimeNanos = Long.MAX_VALUE - 1L)
        assertEquals(extremeFresh, GpsFixPolicy.validate(extremeFresh, Long.MAX_VALUE, Long.MAX_VALUE))
    }
}
