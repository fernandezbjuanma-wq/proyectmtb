package ar.mtb.radar

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import android.location.Location
import android.os.SystemClock
import java.util.UUID
import kotlin.math.*

/** Cada punto se guarda inmediatamente en SQLite, sin depender de la red ni del WebView. */
class TrackDatabase(context: Context) : SQLiteOpenHelper(context, "radar_tracks_v1.db", null, 1) {
    data class Point(val lat: Double, val lon: Double, val elevation: Double?,
                     val accuracy: Float, val speed: Float, val timeMs: Long)
    data class Session(val id: String, val startedAt: Long, val endedAt: Long?, val count: Int)
    override fun onConfigure(db: SQLiteDatabase) { db.setForeignKeyConstraintsEnabled(true) }
    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL("CREATE TABLE sessions(id TEXT PRIMARY KEY,started_at INTEGER NOT NULL,ended_at INTEGER)")
        db.execSQL("""CREATE TABLE positions(
            id INTEGER PRIMARY KEY AUTOINCREMENT,session_id TEXT NOT NULL REFERENCES sessions(id),
            lat REAL NOT NULL,lon REAL NOT NULL,elevation REAL,accuracy REAL NOT NULL,
            speed REAL NOT NULL,utc_ms INTEGER NOT NULL,UNIQUE(session_id,utc_ms,lat,lon))""".trimIndent())
        db.execSQL("CREATE INDEX idx_positions_session ON positions(session_id,id)")
    }
    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        throw IllegalStateException("No eliminar sesiones: se necesita migración segura")
    }
    @Synchronized fun currentSession(): String? {
        readableDatabase.rawQuery("SELECT id FROM sessions WHERE ended_at IS NULL ORDER BY started_at DESC LIMIT 1",null).use {
            return if(it.moveToFirst()) it.getString(0) else null
        }
    }
    /** Solo se reanuda tras una pulsación explícita del usuario. */
    @Synchronized fun beginOrResume(): String {
        currentSession()?.let { return it }
        val id=UUID.randomUUID().toString()
        val v=ContentValues().apply { put("id",id);put("started_at",System.currentTimeMillis()) }
        writableDatabase.insertOrThrow("sessions",null,v)
        return id
    }
    @Synchronized fun finish(id: String) {
        writableDatabase.execSQL("UPDATE sessions SET ended_at=? WHERE id=? AND ended_at IS NULL",
            arrayOf<Any>(System.currentTimeMillis(),id))
    }
    @Synchronized fun finishUnfinished(): Boolean {
        val id=currentSession() ?: return false
        finish(id)
        return true
    }
    private fun meters(a: Point,b: Point): Double {
        val r=Math.PI/180.0
        val dlat=(b.lat-a.lat)*r; val dlon=(b.lon-a.lon)*r
        val q=sin(dlat/2).pow(2.0)+cos(a.lat*r)*cos(b.lat*r)*sin(dlon/2).pow(2.0)
        return 6371000.0*2*atan2(sqrt(q.coerceIn(0.0,1.0)),sqrt((1-q).coerceIn(0.0,1.0)))
    }
    @Synchronized fun record(id: String,loc: Location): Boolean {
        val fix=GpsFixPolicy.validate(
            GpsFixPolicy.Fix(loc.latitude,loc.longitude,if(loc.hasAccuracy())loc.accuracy else null,
                loc.time,loc.elapsedRealtimeNanos,if(loc.hasAltitude())loc.altitude else null,
                if(loc.hasSpeed())loc.speed else null),
            System.currentTimeMillis(),SystemClock.elapsedRealtimeNanos()
        ) ?: return false
        val p=Point(fix.latitude,fix.longitude,fix.elevation,fix.accuracy!!,fix.speed ?: 0f,fix.timeMs)
        val database=writableDatabase
        // La transacción también serializa otros helpers (por ejemplo, la Activity).
        // Ningún callback pendiente puede agregar puntos después de finish().
        database.beginTransaction()
        try {
            database.rawQuery("SELECT 1 FROM sessions WHERE id=? AND ended_at IS NULL",arrayOf(id)).use {
                if(!it.moveToFirst()) return false
            }
            database.rawQuery(
                "SELECT lat,lon,elevation,accuracy,speed,utc_ms FROM positions WHERE session_id=? ORDER BY id DESC LIMIT 1",
                arrayOf(id)
            ).use {
                if(it.moveToFirst()){
                    val last=Point(it.getDouble(0),it.getDouble(1),if(it.isNull(2))null else it.getDouble(2),
                        it.getFloat(3),it.getFloat(4),it.getLong(5))
                    if(p.timeMs<=last.timeMs) return false
                    val seconds=(p.timeMs.toDouble()-last.timeMs.toDouble())/1000.0
                    val distance=meters(last,p)
                    if(distance>70.0 && distance/seconds>45.0) return false
                }
            }
            val v=ContentValues().apply {
                put("session_id",id);put("lat",p.lat);put("lon",p.lon)
                if(p.elevation!=null)put("elevation",p.elevation)else putNull("elevation")
                put("accuracy",p.accuracy);put("speed",p.speed);put("utc_ms",p.timeMs)
            }
            val inserted=database.insertWithOnConflict("positions",null,v,SQLiteDatabase.CONFLICT_IGNORE)!=-1L
            database.setTransactionSuccessful()
            return inserted
        } finally {
            database.endTransaction()
        }
    }
    @Synchronized fun sessions(limit: Int=30): List<Session> {
        val out=mutableListOf<Session>()
        readableDatabase.rawQuery(
            """SELECT s.id,s.started_at,s.ended_at,COUNT(p.id) FROM sessions s
               LEFT JOIN positions p ON p.session_id=s.id GROUP BY s.id
               ORDER BY s.started_at DESC LIMIT ?""".trimIndent(),arrayOf(limit.toString())
        ).use {
            while(it.moveToNext())out.add(Session(it.getString(0),it.getLong(1),
                if(it.isNull(2))null else it.getLong(2),it.getInt(3)))
        }
        return out
    }
    @Synchronized fun forEachPoint(id:String,consumer:(Point)->Unit){
        readableDatabase.rawQuery(
            "SELECT lat,lon,elevation,accuracy,speed,utc_ms FROM positions WHERE session_id=? ORDER BY id",
            arrayOf(id)
        ).use {
            while(it.moveToNext())consumer(Point(it.getDouble(0),it.getDouble(1),
                if(it.isNull(2))null else it.getDouble(2),it.getFloat(3),it.getFloat(4),it.getLong(5)))
        }
    }
}
