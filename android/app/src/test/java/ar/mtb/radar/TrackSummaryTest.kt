package ar.mtb.radar

import org.junit.Assert.*
import org.junit.Test

class TrackSummaryTest {
    private fun point(time: Long, lat: Double = 0.0, lon: Double = 0.0,
                      elevation: Double? = null, speed: Float = 0f) =
        TrackSample(lat,lon,elevation,5f,speed,time)
    private fun summarize(vararg points: TrackSample): TrackSummary {
        val accumulator = TrackSummaryAccumulator()
        points.forEach(accumulator::add)
        return accumulator.summary()
    }
    @Test fun emptySessionDoesNotInventMetrics() {
        val s=summarize()
        assertEquals(0,s.pointCount);assertEquals(0L,s.elapsedMillis)
        assertEquals(0.0,s.distanceMeters,0.0);assertNull(s.ascentMeters);assertNull(s.lastPoint)
    }
    @Test fun singlePointHasNoDurationOrDistance() {
        val p=point(1000L,speed=2f)
        val s=summarize(p)
        assertEquals(p,s.lastPoint);assertEquals(1,s.pointCount)
        assertEquals(0L,s.elapsedMillis);assertEquals(0.0,s.averageSpeedKmh,0.0)
    }
    @Test fun knownSyntheticDistanceAndWallTime() {
        val s=summarize(point(1000L),point(11000L,lon=0.001))
        assertEquals(111.1949,s.distanceMeters,0.01)
        assertEquals(10000L,s.elapsedMillis)
        assertEquals(40.0302,s.averageSpeedKmh,0.01)
    }
    @Test fun timeGapIsNotBridgedByInventingATrack() {
        val s=summarize(point(1000L),point(62000L,lon=1.0),point(63000L,lon=1.0001))
        assertEquals(1,s.gapCount)
        assertEquals(11.1195,s.distanceMeters,0.01)
        assertEquals(62000L,s.elapsedMillis)
    }
    @Test fun separateSessionsNeverShareAccumulatorState() {
        val first=summarize(point(1000L),point(2000L,lon=0.001))
        val second=summarize(point(3000L,lon=10.0))
        assertTrue(first.distanceMeters>100.0)
        assertEquals(0.0,second.distanceMeters,0.0)
    }
    @Test fun invalidCoordinatesAndOutOfOrderTimesAreIgnored() {
        val s=summarize(point(1000L),point(900L,lon=0.5),point(2000L,lat=Double.NaN),
            point(3000L,lon=181.0),point(0L),point(4000L,lon=0.0001))
        assertEquals(2,s.pointCount);assertEquals(4,s.invalidPointCount)
        assertEquals(11.1195,s.distanceMeters,0.01)
    }
    @Test fun duplicateTimestampsDoNotAddDistance() {
        val s=summarize(point(1000L),point(1000L,lon=0.001))
        assertEquals(1,s.pointCount);assertEquals(0.0,s.distanceMeters,0.0)
    }
    @Test fun altitudeNoiseDoesNotAccumulateAsClimbing() {
        val s=summarize(point(1000L,elevation=100.0),point(2000L,elevation=101.0),
            point(3000L,elevation=99.5),point(4000L,elevation=100.5),point(5000L,elevation=105.0))
        assertEquals(5.0,s.ascentMeters!!,0.0)
    }
    @Test fun missingOrInvalidAltitudeIsNotZeroElevation() {
        val s=summarize(point(1000L,elevation=null),point(2000L,elevation=Double.NaN))
        assertNull(s.ascentMeters)
    }
    @Test fun ascentDoesNotBridgeAMissingElevationOrTimeGap() {
        val s=summarize(point(1000L,elevation=100.0),point(2000L,elevation=null),
            point(3000L,elevation=200.0),point(65000L,elevation=500.0))
        assertEquals(0.0,s.ascentMeters!!,0.0);assertEquals(1,s.gapCount)
    }
    @Test fun invalidSpeedsDoNotPoisonSummary() {
        val s=summarize(point(1000L,speed=Float.NaN),point(2000L,speed=-1f),point(3000L,speed=5f))
        assertEquals(18.0,s.maxSpeedKmh,0.0)
    }
    @Test fun noOverflowForPositiveTimestampExtremes() {
        val s=summarize(point(1L),point(Long.MAX_VALUE))
        assertEquals(Long.MAX_VALUE-1L,s.elapsedMillis)
        assertEquals(1,s.gapCount);assertTrue(s.averageSpeedKmh.isFinite())
    }
}
