package ar.mtb.radar

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import android.location.Location
import java.util.UUID

/**
 * Persistencia transaccional LOCAL, independiente del navegador, internet y Firebase.
 * SQLite es privado para la aplicación Android. Cada GPS aceptado se escribe en disco.
 */
class TrackDatabase(context: Context) : SQLiteOpenHelper(context, "radar_tracks_v1.db", null, 1) {
    data class RecordedPoint(
        val lat: Double, val lon: Double, val altitude: Double?,
        val accuracy: Float, val speed: Float, val timeMs: Long
    )
    data class Summary(val id: String, val startedAt: Long, val endedAt: Long?, val count: Int)

    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL("CREATE TABLE sessions (id TEXT PRIMARY KEY, started_at INTEGER NOT NULL, ended_at INTEGER)")
        db.execSQL("CREATE TABLE positions (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL, lat REAL NOT NULL, lon REAL NOT NULL, altitude REAL, accuracy REAL NOT NULL, speed REAL NOT NULL, utc_ms INTEGER NOT NULL, FOREIGN KEY(session_id) REFERENCES sessions(id))")
        db.execSQL("CREATE INDEX idx_positions_session ON positions(session_id, id)")
    }
    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        // Nunca eliminar tablas ni recorridos sin migración explícita.
        throw IllegalStateException("Se necesita migración segura de TrackDatabase")
    }
    fun currentSession(): String? {
        readableDatabase.rawQuery("SELECT id FROM sessions WHERE ended_at IS NULL ORDER BY started_at DESC LIMIT 1", null).use {
            return if (it.moveToFirst()) it.getString(0) else null
        }
    }
    @Synchronized fun begin(): String {
        currentSession()?.let { return it }
        val id = UUID.randomUUID().toString()
        writableDatabase.execSQL("INSERT INTO sessions(id,started_at) VALUES(?,?)", arrayOf(id, System.currentTimeMillis()))
        return id
    }
    @Synchronized fun record(id: String, location: Location) {
        if (location.accuracy > 50f || !location.latitude.isFinite() || !location.longitude.isFinite()) return
        writableDatabase.execSQL(
            "INSERT INTO positions(session_id,lat,lon,altitude,accuracy,speed,utc_ms) SELECT ?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM sessions WHERE id=? AND ended_at IS NULL)",
            arrayOf(id, location.latitude, location.longitude,
                if(location.hasAltitude()) location.altitude else null,
                location.accuracy.toDouble(), if(location.hasSpeed()) location.speed.toDouble() else 0.0,
                location.time.takeIf { it > 0L } ?: System.currentTimeMillis(), id)
        )
    }
    @Synchronized fun end(id: String) {
        writableDatabase.execSQL("UPDATE sessions SET ended_at=? WHERE id=? AND ended_at IS NULL", arrayOf(System.currentTimeMillis(),id))
    }
    fun latest(): Summary? {
        readableDatabase.rawQuery("""
            SELECT s.id,s.started_at,s.ended_at,COUNT(p.id)
            FROM sessions s LEFT JOIN positions p ON p.session_id=s.id
            GROUP BY s.id ORDER BY s.started_at DESC LIMIT 1
        """.trimIndent(), null).use {
            if (!it.moveToFirst()) return null
            return Summary(it.getString(0),it.getLong(1), if(it.isNull(2)) null else it.getLong(2),it.getInt(3))
        }
    }
    fun points(id: String): List<RecordedPoint> {
        val out = mutableListOf<RecordedPoint>()
        readableDatabase.rawQuery(
            "SELECT lat,lon,altitude,accuracy,speed,utc_ms FROM positions WHERE session_id=? ORDER BY id",
            arrayOf(id)
        ).use {
            while(it.moveToNext()) out.add(RecordedPoint(
                it.getDouble(0),it.getDouble(1),if(it.isNull(2)) null else it.getDouble(2),
                it.getFloat(3),it.getFloat(4),it.getLong(5)
            ))
        }
        return out
    }
}
