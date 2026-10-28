package ar.mtb.radar

import android.Manifest
import android.app.*
import android.content.*
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.*
import android.util.Log

/**
 * Grabador de rutas Android: servicio foreground + notificación + SQLite.
 * Se inicia con un gesto del usuario en MainActivity y funciona sin conexión.
 * Android puede detener servicios por restricciones del sistema o "Forzar detención".
 */
class TrackingService : Service(), LocationListener {
    companion object {
        const val ACTION_START="ar.mtb.radar.TRACK_START"
        const val ACTION_STOP="ar.mtb.radar.TRACK_STOP"
        private const val CHANNEL="mtb_gps_background"
        private const val NOTIFICATION_ID=4821
        @Volatile var trackingActive=false
            private set
    }
    private lateinit var gps:LocationManager
    private lateinit var db:TrackDatabase
    private lateinit var thread:HandlerThread
    private var currentId:String?=null
    private var accepted=0
    override fun onBind(intent:Intent?):IBinder?=null
    override fun onCreate(){
        super.onCreate()
        gps=getSystemService(LOCATION_SERVICE) as LocationManager
        db=TrackDatabase(applicationContext)
        thread=HandlerThread("radar-mtb-gps").apply { start() }
        val notifications=getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        notifications.createNotificationChannel(
            NotificationChannel(CHANNEL,"GPS · Radar MTB",NotificationManager.IMPORTANCE_LOW)
        )
    }
    private fun notification(message:String):Notification{
        val stop=PendingIntent.getService(
            this,1,Intent(this,TrackingService::class.java).setAction(ACTION_STOP),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val show=PendingIntent.getActivity(
            this,2,Intent(this,MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        return Notification.Builder(this,CHANNEL)
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setContentTitle("Radar MTB · GPS grabando")
            .setContentText(message)
            .setContentIntent(show)
            .setOngoing(true)
            .addAction(Notification.Action.Builder(
                android.R.drawable.ic_media_pause,"Detener grabación",stop).build())
            .build()
    }
    override fun onStartCommand(intent:Intent?,flags:Int,startId:Int):Int{
        when(intent?.action){
            ACTION_STOP -> { stopTracking(); return START_NOT_STICKY }
            ACTION_START -> {
                if(trackingActive)return START_NOT_STICKY
                if(checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)!=PackageManager.PERMISSION_GRANTED){
                    Log.w("RadarMTB","Sin permiso de ubicación precisa")
                    stopSelf();return START_NOT_STICKY
                }
                if(!gps.isProviderEnabled(LocationManager.GPS_PROVIDER)){
                    Log.w("RadarMTB","GPS deshabilitado por el usuario")
                    stopSelf();return START_NOT_STICKY
                }
                try {
                    // En Android 14+ tipo location y permisos se verifican en tiempo de ejecución.
                    if(Build.VERSION.SDK_INT>=Build.VERSION_CODES.Q)
                        startForeground(NOTIFICATION_ID,notification("Esperando posición GPS..."),ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION)
                    else startForeground(NOTIFICATION_ID,notification("Esperando posición GPS..."))
                    currentId=db.beginOrResume()
                    accepted=0
                    trackingActive=true
                    gps.requestLocationUpdates(LocationManager.GPS_PROVIDER,1000L,2f,this,thread.looper)
                    if(gps.isProviderEnabled(LocationManager.NETWORK_PROVIDER)){
                        gps.requestLocationUpdates(LocationManager.NETWORK_PROVIDER,5000L,15f,this,thread.looper)
                    }
                } catch(e:Exception){
                    Log.e("RadarMTB","No se pudo iniciar el seguimiento",e)
                    stopTracking()
                }
                return START_NOT_STICKY
            }
            else -> return START_NOT_STICKY
        }
    }
    override fun onLocationChanged(location:Location){
        if(!trackingActive)return
        val id=currentId?:return
        try{
            if(db.record(id,location)){
                accepted++
                if(accepted==1 || accepted%30==0){
                    val n=getSystemService(NOTIFICATION_SERVICE) as NotificationManager
                    n.notify(NOTIFICATION_ID,notification(accepted.toString()+" puntos guardados en el teléfono"))
                }
            }
        }catch(e:Exception){
            Log.e("RadarMTB","Error grave de escritura GPS",e)
            val n=getSystemService(NOTIFICATION_SERVICE) as NotificationManager
            n.notify(NOTIFICATION_ID,notification("ERROR de guardado GPS: revisá el almacenamiento"))
        }
    }
    override fun onProviderDisabled(provider:String){
        if(provider==LocationManager.GPS_PROVIDER && trackingActive){
            val n=getSystemService(NOTIFICATION_SERVICE) as NotificationManager
            n.notify(NOTIFICATION_ID,notification("GPS apagado. Activá la ubicación del teléfono."))
        }
    }
    private fun stopTracking(){
        trackingActive=false
        try{gps.removeUpdates(this)}catch(_:Exception){}
        currentId?.let { id ->
            try{db.finish(id)}catch(e:Exception){Log.e("RadarMTB","Error al finalizar sesión",e)}
        }
        currentId=null
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }
    override fun onDestroy(){
        trackingActive=false
        try{gps.removeUpdates(this)}catch(_:Exception){}
        if(::thread.isInitialized)thread.quitSafely()
        // SQLite queda en el espacio privado de la app incluso si el proceso muere.
        super.onDestroy()
    }
}
