package ar.mtb.radar

import android.Manifest
import android.app.*
import android.content.*
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.location.LocationProvider
import android.net.Uri
import android.os.*
import android.util.Log
import java.util.UUID
import java.util.concurrent.atomic.AtomicInteger
import java.util.concurrent.atomic.AtomicLong

/** SQLite, comandos y avisos se serializan en el hilo GPS; main no espera a la base. */
class TrackingService : Service(), LocationListener {
    private class UiState(val errorNotificationId:Int=0) {
        @Volatile var destroyed=false
        @Volatile var active=false
        @Volatile var sessionId:String?=null
        @Volatile var message:String?=null
        @Volatile var lastFix:Long?=null
        @Volatile var starting=false
        val pendingStarts=AtomicInteger()
    }
    companion object {
        const val ACTION_START="ar.mtb.radar.TRACK_START"
        const val ACTION_START_NEW="ar.mtb.radar.TRACK_START_NEW"
        const val ACTION_STOP="ar.mtb.radar.TRACK_STOP"
        const val EXTRA_SESSION_ID="ar.mtb.radar.SESSION_ID"
        private const val EXTRA_NOTIFICATION_OWNER="ar.mtb.radar.NOTIFICATION_OWNER"
        private const val CHANNEL="mtb_gps_background"
        private val nextOwner=AtomicLong()
        private val nextNotification=AtomicInteger(4821)
        @Volatile private var visibleState=UiState()
        // Cada getter lee un propietario volátil y sus campos volátiles/atómicos.
        // Un hilo de una instancia destruida solo puede modificar su UiState viejo.
        val trackingActive:Boolean get()=visibleState.let { !it.destroyed && it.active }
        val trackingStarting:Boolean get()=visibleState.let { !it.destroyed && (it.starting || it.pendingStarts.get()>0) }
        val activeSessionId:String? get()=visibleState.let { if(it.destroyed)null else it.sessionId }
        val statusMessage:String? get()=visibleState.message
        val lastFixTimeMs:Long? get()=visibleState.lastFix
    }
    private data class Command(val action:String?,val expectedId:String?,val notificationOwner:Long?,
        val startId:Int,val foregroundError:String?) {
        val starts:Boolean get()=action==ACTION_START || action==ACTION_START_NEW
    }
    private val owner=nextOwner.incrementAndGet()
    private val notificationId=nextNotification.getAndIncrement()
    private val uiState=UiState(nextNotification.getAndIncrement())
    private val pendingCommands=AtomicInteger()
    private var previousErrorNotificationId=0
    private lateinit var gps:LocationManager
    private lateinit var db:TrackDatabase
    private lateinit var thread:HandlerThread
    private lateinit var worker:Handler
    // Los siguientes campos solo se usan en el hilo worker.
    private var currentId:String?=null
    private var accepted=0L
    private var gpsProviderEnabled=false
    private var waitingForGpsRecovery=false
    private var lastHandledStartId=0
    @Volatile private var callbackEpoch=0L
    private var registeredListener:LocationListener?=null

    override fun onBind(intent:Intent?):IBinder?=null
    override fun onCreate(){
        super.onCreate()
        previousErrorNotificationId=visibleState.errorNotificationId
        visibleState=uiState
        gps=getSystemService(LOCATION_SERVICE) as LocationManager
        db=TrackDatabase(applicationContext) // El constructor no abre la base.
        thread=HandlerThread("radar-mtb-gps").apply { start() }
        worker=Handler(thread.looper)
        (getSystemService(NOTIFICATION_SERVICE) as NotificationManager).createNotificationChannel(
            NotificationChannel(CHANNEL,"GPS · Radar MTB",NotificationManager.IMPORTANCE_LOW))
    }
    private fun alive()=!uiState.destroyed && visibleState===uiState
    private fun validId(value:String?)=value!=null && runCatching {
        UUID.fromString(value).toString().equals(value,true)
    }.getOrDefault(false)
    private fun notification(message:String,active:Boolean,sessionId:String?=null):Notification {
        val show=PendingIntent.getActivity(this,notificationId,Intent(this,MainActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val builder=Notification.Builder(this,CHANNEL)
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setContentTitle(if(active)"Radar MTB · Registro GPS" else "Radar MTB · GPS detenido")
            .setContentText(message).setStyle(Notification.BigTextStyle().bigText(message))
            .setContentIntent(show).setOngoing(active).setAutoCancel(!active)
        if(active && sessionId!=null){
            // Los extras no forman parte de la identidad de PendingIntent. La URI sí.
            val stopIntent=Intent(this,TrackingService::class.java).setAction(ACTION_STOP)
                .setData(Uri.Builder().scheme("radarmtb").authority("tracking")
                    .appendPath(owner.toString()).appendPath(sessionId).build())
                .putExtra(EXTRA_SESSION_ID,sessionId).putExtra(EXTRA_NOTIFICATION_OWNER,owner)
            val stop=PendingIntent.getService(this,notificationId,stopIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            builder.addAction(Notification.Action.Builder(android.R.drawable.ic_media_pause,"Detener grabación",stop).build())
        }
        return builder.build()
    }
    override fun onStartCommand(intent:Intent?,flags:Int,startId:Int):Int {
        if(!alive()){ stopSelfResult(startId); return START_NOT_STICKY }
        val action=intent?.action
        val starts=action==ACTION_START || action==ACTION_START_NEW
        pendingCommands.incrementAndGet()
        if(starts)uiState.pendingStarts.incrementAndGet()
        var foregroundError:String?=null
        if(starts && !uiState.active){
            try {
                if(checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)!=PackageManager.PERMISSION_GRANTED)
                    foregroundError="Falta permiso de ubicación precisa. La grabación no se inició."
                else {
                    // Única operación de inicio en main: cumplir pronto el contrato foreground.
                    val initial=notification("Preparando GPS Android…",true)
                    if(Build.VERSION.SDK_INT>=Build.VERSION_CODES.Q)
                        startForeground(notificationId,initial,ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION)
                    else startForeground(notificationId,initial)
                }
            }catch(e:Exception){
                Log.w("RadarMTB","Android rechazó el inicio foreground (${e.javaClass.simpleName})")
                foregroundError="Android no permitió iniciar el servicio GPS. Revisá los permisos y volvé a intentarlo desde la app."
            }
        }
        val command=Command(action,intent?.getStringExtra(EXTRA_SESSION_ID),
            if(intent?.hasExtra(EXTRA_NOTIFICATION_OWNER)==true)intent.getLongExtra(EXTRA_NOTIFICATION_OWNER,-1L)else null,
            startId,foregroundError)
        if(!worker.post { handleCommand(command) }){
            pendingCommands.decrementAndGet()
            if(starts)uiState.pendingStarts.decrementAndGet()
            uiState.active=false; uiState.sessionId=null
            uiState.message="El grabador se está cerrando. Los puntos confirmados se conservan; volvé a iniciar desde la app."
            stopSelfResult(startId)
        }
        return START_NOT_STICKY
    }
    private fun handleCommand(command:Command){
        try {
            if(!alive())return
            when(command.action){
                ACTION_START,ACTION_START_NEW -> startWorker(command)
                ACTION_STOP -> stopWorker(command)
                else -> Unit
            }
        }finally{
            if(command.starts)uiState.pendingStarts.decrementAndGet()
            pendingCommands.decrementAndGet()
            lastHandledStartId=command.startId
            stopIfIdle()
        }
    }
    private fun rejectCommand(){
        Log.w("RadarMTB","Acción GPS obsoleta o sin identidad de sesión ignorada")
        if(!uiState.active)uiState.message="La sesión cambió. Se ignoró la acción anterior; revisá Historial antes de continuar."
    }
    private fun startWorker(command:Command){
        if(command.foregroundError!=null){failWorker(command.foregroundError);return}
        if(uiState.active){
            if(command.action==ACTION_START_NEW)rejectCommand()
            return
        }
        if(command.action==ACTION_START_NEW && !validId(command.expectedId)){rejectCommand();return}
        uiState.starting=true
        uiState.message="Iniciando GPS Android…"
        try {
            if(checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)!=PackageManager.PERMISSION_GRANTED){
                failWorker("Falta permiso de ubicación precisa. La sesión anterior se conserva.");return
            }
            gpsProviderEnabled=gps.isProviderEnabled(LocationManager.GPS_PROVIDER)
            if(!gpsProviderEnabled){failWorker("GPS apagado. Activá la ubicación y volvé a iniciar.");return}
            val id=if(command.action==ACTION_START_NEW)db.beginNewAfter(command.expectedId!!)else db.beginOrResume()
            if(!alive())return // Si Android destruyó el servicio, queda interrumpida y recuperable.
            currentId=id
            accepted=0L; waitingForGpsRecovery=false
            uiState.sessionId=id;uiState.lastFix=null;uiState.active=true
            val listener=SessionListener(++callbackEpoch)
            registeredListener=listener
            gps.requestLocationUpdates(LocationManager.GPS_PROVIDER,1000L,2f,listener,thread.looper)
            if(gps.isProviderEnabled(LocationManager.NETWORK_PROVIDER))
                gps.requestLocationUpdates(LocationManager.NETWORK_PROVIDER,5000L,15f,listener,thread.looper)
            if(!alive())return
            uiState.message="Esperando una posición válida. Todavía no se guardaron puntos nuevos."
            cancelErrorNotifications()
            notifyWorker(uiState.message!!,true,id)
        }catch(_:SecurityException){
            failWorker("Se perdió el permiso de ubicación. La sesión queda interrumpida y recuperable.")
        }catch(e:Exception){
            Log.e("RadarMTB","No se pudo iniciar la sesión (${e.javaClass.simpleName})")
            failWorker("No se pudo iniciar o recuperar la grabación. La sesión cambió o hubo un error de almacenamiento; revisá Historial.")
        }finally{uiState.starting=false}
    }
    private fun stopWorker(command:Command){
        if(!validId(command.expectedId) || command.expectedId!=currentId || !uiState.active ||
            (command.notificationOwner!=null && command.notificationOwner!=owner)){
            rejectCommand();return
        }
        val id=currentId!!
        uiState.active=false;uiState.sessionId=null;currentId=null
        removeUpdatesWorker()
        try {
            db.finish(id)
            if(!alive())return
            uiState.message="Grabación finalizada. Los puntos confirmados se conservan en Historial."
            cancelErrorNotifications()
            notifyWorker(uiState.message!!,false)
        }catch(e:Exception){
            Log.e("RadarMTB","No se pudo finalizar la sesión (${e.javaClass.simpleName})")
            failWorker("No se pudo finalizar la sesión. Queda interrumpida; los puntos confirmados se conservan.")
        }
    }
    private fun notifyWorker(message:String,active:Boolean,sessionId:String?=null){
        if(!alive())return
        try {(getSystemService(NOTIFICATION_SERVICE) as NotificationManager)
            .notify(notificationId,notification(message,active,sessionId))}
        catch(e:Exception){Log.w("RadarMTB","No se pudo mostrar el aviso GPS (${e.javaClass.simpleName})")}
        finally {if(!alive())try{(getSystemService(NOTIFICATION_SERVICE) as NotificationManager).cancel(notificationId)}catch(_:Exception){}}
    }
    private fun cancelErrorNotifications(){
        try{
            val notifications=getSystemService(NOTIFICATION_SERVICE) as NotificationManager
            if(previousErrorNotificationId!=0)notifications.cancel(previousErrorNotificationId)
            notifications.cancel(uiState.errorNotificationId)
        }catch(e:Exception){Log.w("RadarMTB","No se pudo retirar un aviso anterior (${e.javaClass.simpleName})")}
    }
    /** Nunca marca ended_at al fallar: solo el usuario puede finalizar o recuperar la sesión. */
    private fun failWorker(message:String){
        if(!alive())return
        uiState.active=false;uiState.sessionId=null;currentId=null;uiState.message=message
        removeUpdatesWorker()
        notifyWorker(message,false)
        try {
            cancelErrorNotifications()
            (getSystemService(NOTIFICATION_SERVICE) as NotificationManager)
                .notify(uiState.errorNotificationId,notification(message,false))
        }catch(e:Exception){Log.w("RadarMTB","No se pudo mostrar el error GPS (${e.javaClass.simpleName})")}
        finally {if(!alive())try{(getSystemService(NOTIFICATION_SERVICE) as NotificationManager).cancel(uiState.errorNotificationId)}catch(_:Exception){}}
    }
    private fun stopIfIdle(){
        if(alive() && !uiState.active && !uiState.starting && pendingCommands.get()==0 && uiState.pendingStarts.get()==0 && lastHandledStartId>0)
            stopSelfResult(lastHandledStartId) // Android rechaza el stop si llegó un startId posterior.
        // No se quita foreground aquí: Android lo hace al destruir esta instancia.
    }
    private fun enqueueEvent(epoch:Long,event:()->Unit){
        if(!alive())return
        // LocationManager ya entrega sus callbacks en este Looper. No ponerlos detrás de STOP.
        if(Looper.myLooper()===thread.looper){
            if(alive() && epoch==callbackEpoch)event()
        }else worker.post {if(alive() && epoch==callbackEpoch)event()}
    }
    private fun enqueueLocation(location:Location,epoch:Long){
        val fix=Location(location)
        enqueueEvent(epoch) { recordWorker(fix) }
    }
    override fun onLocationChanged(location:Location)=enqueueLocation(location,callbackEpoch)
    private fun recordWorker(location:Location){
        if(!uiState.active)return
        val id=currentId?:return
        try {
            if(checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)!=PackageManager.PERMISSION_GRANTED){
                failWorker("Se perdió el permiso de ubicación. La sesión queda interrumpida y recuperable.");return
            }
            if(db.record(id,location) && alive()){
                accepted++;uiState.lastFix=location.time
                val recovered=waitingForGpsRecovery && gpsProviderEnabled && location.provider==LocationManager.GPS_PROVIDER
                if(!waitingForGpsRecovery || recovered){
                    waitingForGpsRecovery=false
                    uiState.message="$accepted puntos nuevos confirmados en este tramo. Guardado local; sin sincronización nube."
                    if(accepted==1L || accepted%30L==0L || recovered)notifyWorker(uiState.message!!,true,id)
                }
            }
        }catch(_:SecurityException){failWorker("Se perdió el permiso de ubicación. La sesión queda interrumpida y recuperable.")}
        catch(e:Exception){
            Log.e("RadarMTB","Error de escritura GPS (${e.javaClass.simpleName})")
            failWorker("ERROR de guardado GPS. Grabación interrumpida; revisá el espacio y recuperá la sesión desde Historial.")
        }finally{stopIfIdle()}
    }
    private fun enqueueDisabled(provider:String,epoch:Long){enqueueEvent(epoch) {
        if(uiState.active && provider==LocationManager.GPS_PROVIDER){
            gpsProviderEnabled=false;waitingForGpsRecovery=true
            uiState.message="GPS apagado. Activá la ubicación; falta una nueva posición válida de GPS."
            notifyWorker(uiState.message!!,true,currentId)
        }
    }}
    private fun enqueueEnabled(provider:String,epoch:Long){enqueueEvent(epoch) {
        if(uiState.active && provider==LocationManager.GPS_PROVIDER)gpsProviderEnabled=true
    }}
    private fun enqueueStatus(provider:String?,status:Int,epoch:Long){enqueueEvent(epoch) {
        if(uiState.active && provider==LocationManager.GPS_PROVIDER && status!=LocationProvider.AVAILABLE){
            waitingForGpsRecovery=true
            uiState.message="GPS sin señal válida. Esperando una nueva posición; los puntos anteriores están guardados."
            notifyWorker(uiState.message!!,true,currentId)
        }
    }}
    override fun onProviderDisabled(provider:String)=enqueueDisabled(provider,callbackEpoch)
    override fun onProviderEnabled(provider:String)=enqueueEnabled(provider,callbackEpoch)
    @Deprecated("Callback necesario para dispositivos anteriores a Android 11")
    override fun onStatusChanged(provider:String?,status:Int,extras:Bundle?)=enqueueStatus(provider,status,callbackEpoch)
    private inner class SessionListener(private val epoch:Long):LocationListener {
        override fun onLocationChanged(location:Location)=enqueueLocation(location,epoch)
        override fun onProviderDisabled(provider:String)=enqueueDisabled(provider,epoch)
        override fun onProviderEnabled(provider:String)=enqueueEnabled(provider,epoch)
        @Deprecated("Callback necesario para dispositivos anteriores a Android 11")
        override fun onStatusChanged(provider:String?,status:Int,extras:Bundle?)=enqueueStatus(provider,status,epoch)
    }
    private fun removeUpdatesWorker(){
        callbackEpoch++
        registeredListener?.let {try{gps.removeUpdates(it)}catch(_:Exception){}}
        registeredListener=null
    }
    override fun onDestroy(){
        // No espera al actor ni al disco. Los callbacks ya en curso no publican tras destroyed.
        if(uiState.active || uiState.starting)
            uiState.message="Grabación interrumpida. Los puntos confirmados se conservan; podés recuperar la sesión."
        uiState.destroyed=true;uiState.active=false;uiState.sessionId=null
        if(::worker.isInitialized){worker.post {
            removeUpdatesWorker();currentId=null
            // IDs propios: el cleanup viejo nunca cancela el foreground de una instancia nueva.
            try{(getSystemService(NOTIFICATION_SERVICE) as NotificationManager).cancel(notificationId)}catch(_:Exception){}
            try{db.close()}catch(_:Exception){}
        }}
        if(::thread.isInitialized)thread.quitSafely()
        super.onDestroy()
    }
}
