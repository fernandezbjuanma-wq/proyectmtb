package ar.mtb.radar

import android.Manifest
import android.app.*
import android.content.*
import android.content.pm.PackageManager
import android.location.*
import android.os.*
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat

/**
 * Prototipo de tracking; la escritura persistente de puntos en SQLite/Room está PENDIENTE.
 * No presentarlo como grabador confiable hasta agregar esa capa y probarlo.
 */
class TrackingService : Service(), LocationListener {
    companion object {
        const val ACTION_START = "ar.mtb.radar.START_TRACKING"
        const val ACTION_STOP = "ar.mtb.radar.STOP_TRACKING"
        const val CHANNEL = "radar_mtb_tracking"
        const val NOTIFICATION_ID = 4821
    }
    private lateinit var locationManager: LocationManager
    private lateinit var trackDb: TrackDatabase
    private var sessionId: String? = null
    override fun onBind(intent: Intent?): IBinder? = null
    override fun onCreate() {
        super.onCreate()
        locationManager = getSystemService(LOCATION_SERVICE) as LocationManager
        trackDb = TrackDatabase(applicationContext)
        val manager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        manager.createNotificationChannel(NotificationChannel(CHANNEL, "Grabación GPS MTB", NotificationManager.IMPORTANCE_LOW))
    }
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            stopTracking()
            return START_NOT_STICKY
        }
        if (intent?.action != ACTION_START) return START_NOT_STICKY
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            stopSelf()
            return START_NOT_STICKY
        }
        sessionId = trackDb.begin()
        val stopIntent = Intent(this, TrackingService::class.java).setAction(ACTION_STOP)
        val pending = PendingIntent.getService(this, 1, stopIntent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
        val notification = NotificationCompat.Builder(this, CHANNEL)
            .setContentTitle("Radar MTB · Grabación activa")
            .setContentText("Seguimiento GPS en segundo plano. Podés detenerlo desde aquí.")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setOngoing(true)
            .addAction(android.R.drawable.ic_media_pause, "Detener", pending)
            .build()
        startForeground(NOTIFICATION_ID, notification)
        try {
            locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 1000L, 2f, this, Looper.getMainLooper())
        } catch (e: SecurityException) {
            stopTracking()
        }
        return START_NOT_STICKY
    }
    override fun onLocationChanged(location: Location) {
        sessionId?.let { id ->
            try { trackDb.record(id, location) }
            catch (error: Exception) { android.util.Log.e("RadarMTB", "Falló persistencia GPS", error) }
        }
    }
    private fun stopTracking() {
        sessionId?.let { trackDb.end(it) }
        sessionId = null
        locationManager.removeUpdates(this)
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }
    override fun onDestroy() {
        locationManager.removeUpdates(this)
        trackDb.close()
        super.onDestroy()
    }
}