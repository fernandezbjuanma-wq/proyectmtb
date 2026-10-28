package ar.mtb.radar

import android.Manifest
import android.app.*
import android.content.*
import android.content.pm.PackageManager
import android.location.LocationManager
import android.net.Uri
import android.os.*
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.*
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** UI Android: controles nativos independientes del ciclo de vida de la web Netlify. */
class MainActivity : Activity() {
    private val site="https://proyectmtb.netlify.app/"
    private val permissionRequest=101
    private val gpxRequest=102
    private lateinit var state:TextView
    private lateinit var browser:WebView
    private val ui=Handler(Looper.getMainLooper())
    private var pendingExport:String?=null
    private var refreshEnabled=false
    private val refresh=object:Runnable {
        override fun run(){
            updateState()
            if(refreshEnabled)ui.postDelayed(this,2500L)
        }
    }
    override fun onCreate(savedInstanceState:Bundle?){
        super.onCreate(savedInstanceState)
        pendingExport=savedInstanceState?.getString("pending_export")
        val column=LinearLayout(this).apply {
            orientation=LinearLayout.VERTICAL
            setPadding(8,8,8,4)
        }
        state=TextView(this).apply {
            text="Radar MTB · GPS Android"
            textSize=15f
            setPadding(6,6,6,6)
        }
        column.addView(state)
        val buttons=LinearLayout(this).apply { orientation=LinearLayout.HORIZONTAL }
        val start=Button(this).apply { text="▶ GPS";textSize=12f }
        val stop=Button(this).apply { text="■ Parar";textSize=12f }
        val list=Button(this).apply { text="GPX guardados";textSize=12f }
        buttons.addView(start,LinearLayout.LayoutParams(0,-2,1f))
        buttons.addView(stop,LinearLayout.LayoutParams(0,-2,1f))
        buttons.addView(list,LinearLayout.LayoutParams(0,-2,1.5f))
        column.addView(buttons)
        val note=TextView(this).apply {
            text="GPS confiable: usá los botones de ARRIBA. La web es un visor; las rutas nativas se exportan desde GPX guardados."
            textSize=11f
            setPadding(6,0,6,4)
        }
        column.addView(note)
        browser=WebView(this).apply {
            settings.javaScriptEnabled=true
            settings.domStorageEnabled=true
            settings.allowFileAccess=false
            webViewClient=object:WebViewClient(){
                override fun shouldOverrideUrlLoading(view:WebView?,request:WebResourceRequest?):Boolean{
                    val uri=request?.url?:return false
                    if(uri.scheme=="https" && uri.host=="proyectmtb.netlify.app")return false
                    try{startActivity(Intent(Intent.ACTION_VIEW,uri))}catch(_:Exception){}
                    return true
                }
                override fun onPageFinished(view:WebView?,url:String?){
                    if(url?.startsWith(site)!=true)return
                    // Evitar dos grabadores (web + servicio Android) en esta versión nativa.
                    val js="""(function(){
                        if(window.__radarNativeLocked)return;
                        window.__radarNativeLocked=true;
                        document.addEventListener('click',function(event){
                            var b=event.target.closest && event.target.closest('#btn-start,#btn-finish');
                            if(b){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
                                alert('Esta versión usa GPS Android. Iniciá o detené desde los controles superiores.');}
                        },true);
                        if(typeof window.iniciarRecorrido==='function')window.iniciarRecorrido=function(){
                            alert('Usá el botón ▶ GPS del encabezado Android.');
                        };
                    })();"""
                    view?.evaluateJavascript(js,null)
                }
            }
            loadUrl(site)
        }
        column.addView(browser,LinearLayout.LayoutParams(-1,0,1f))
        setContentView(column)
        start.setOnClickListener { requestStart() }
        stop.setOnClickListener { requestStop() }
        list.setOnClickListener { showSessions() }
        updateState()
    }
    private fun toast(t:String){Toast.makeText(this,t,Toast.LENGTH_LONG).show()}
    private fun requestStart(){
        if(TrackingService.trackingActive){toast("El GPS nativo ya está grabando.");return}
        if(checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)!=PackageManager.PERMISSION_GRANTED){
            requestPermissions(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION,Manifest.permission.ACCESS_COARSE_LOCATION),permissionRequest)
            return
        }
        val manager=getSystemService(LOCATION_SERVICE) as LocationManager
        if(!manager.isProviderEnabled(LocationManager.GPS_PROVIDER)){
            AlertDialog.Builder(this).setMessage("Activá la ubicación/GPS del teléfono antes de iniciar.")
                .setPositiveButton("Entendido",null).show()
            return
        }
        TrackDatabase(this).use { db ->
            if(db.currentSession()!=null){
                AlertDialog.Builder(this).setTitle("Hay una ruta interrumpida")
                    .setMessage("Podés continuar la misma ruta o cerrarla para empezar otra. Los puntos anteriores no se borran.")
                    .setPositiveButton("Continuar"){_,_->startNative()}
                    .setNeutralButton("Nueva ruta"){_,_->
                        TrackDatabase(this).use { it.finishUnfinished() }
                        startNative()
                    }
                    .setNegativeButton("Cancelar",null).show()
            }else startNative()
        }
    }
    private fun startNative(){
        try{
            startForegroundService(Intent(this,TrackingService::class.java).setAction(TrackingService.ACTION_START))
            toast("Iniciando GPS. Verificá que aparezca la notificación de grabación.")
        }catch(e:Exception){toast("No se pudo iniciar GPS: "+(e.message?:"error"))}
        ui.postDelayed({updateState()},1000L)
    }
    private fun requestStop(){
        if(!TrackingService.trackingActive){
            toast("No hay servicio GPS activo. Las sesiones guardadas siguen disponibles.")
            return
        }
        AlertDialog.Builder(this).setTitle("Finalizar recorrido")
            .setMessage("¿Terminás la grabación GPS nativa? Los puntos se conservarán en el teléfono.")
            .setPositiveButton("Finalizar"){_,_->
                startService(Intent(this,TrackingService::class.java).setAction(TrackingService.ACTION_STOP))
                ui.postDelayed({updateState()},1000L)
            }.setNegativeButton("Seguir grabando",null).show()
    }
    private fun updateState(){
        try{
            val current=TrackDatabase(this).use { it.sessions(1).firstOrNull() }
            val label=if(TrackingService.trackingActive)"● GPS NATIVO GRABANDO" else "■ GPS nativo detenido"
            val suffix=if(current==null)"Sin actividades todavía"
                else (current.count.toString()+" puntos en última ruta ("+
                    if(current.endedAt==null)"interrumpida o activa)" else "finalizada)")
            state.text=label+"  ·  "+suffix
        }catch(e:Exception){state.text="No se pudo leer el historial GPS: "+e.message}
    }
    private fun showSessions(){
        try{
            val items=TrackDatabase(this).use { it.sessions(30) }
            if(items.isEmpty()){toast("No hay rutas guardadas todavía.");return}
            val fmt=SimpleDateFormat("dd/MM HH:mm",Locale("es","AR"))
            val lines=items.map {
                fmt.format(Date(it.startedAt))+" · "+it.count+" puntos · "+
                (if(it.endedAt==null)"en curso/interrumpida" else "completa")
            }.toTypedArray()
            AlertDialog.Builder(this).setTitle("Rutas guardadas en el teléfono")
                .setItems(lines){_,index->
                    val selected=items[index]
                    if(selected.count==0){toast("Esa sesión no tiene puntos GPS.");return@setItems}
                    pendingExport=selected.id
                    val save=Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
                        addCategory(Intent.CATEGORY_OPENABLE)
                        type="application/gpx+xml"
                        putExtra(Intent.EXTRA_TITLE,"RadarMTB_"+fmt.format(Date(selected.startedAt)).replace(" ","_").replace("/","-").replace(":","-")+".gpx")
                    }
                    startActivityForResult(save,gpxRequest)
                }.setNegativeButton("Cerrar",null).show()
        }catch(e:Exception){toast("Error consultando rutas: "+e.message)}
    }
    override fun onActivityResult(requestCode:Int,resultCode:Int,data:Intent?){
        super.onActivityResult(requestCode,resultCode,data)
        if(requestCode!=gpxRequest||resultCode!=RESULT_OK)return
        val id=pendingExport?:return
        val uri:Uri=data?.data?:return
        Thread {
            try{
                TrackDatabase(applicationContext).use { db ->
                    contentResolver.openOutputStream(uri,"w")?.bufferedWriter(Charsets.UTF_8)?.use { writer ->
                        GpxExport.write(db,id,writer)
                    }?:throw IllegalStateException("No se pudo abrir el archivo")
                }
                runOnUiThread {toast("GPX exportado. El archivo contiene los puntos GPS registrados.")}
            }catch(e:Exception){
                runOnUiThread {toast("Falló exportación GPX: "+e.message)}
            }
        }.start()
    }
    override fun onRequestPermissionsResult(requestCode:Int,permissions:Array<out String>,results:IntArray){
        super.onRequestPermissionsResult(requestCode,permissions,results)
        if(requestCode==permissionRequest){
            if(checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)==PackageManager.PERMISSION_GRANTED)
                requestStart()
            else toast("Sin permiso de ubicación precisa no se puede registrar la ruta.")
        }
    }
    override fun onSaveInstanceState(outState:Bundle){
        outState.putString("pending_export",pendingExport)
        super.onSaveInstanceState(outState)
    }
    override fun onResume(){super.onResume();refreshEnabled=true;ui.post(refresh)}
    override fun onPause(){refreshEnabled=false;ui.removeCallbacks(refresh);super.onPause()}
    override fun onDestroy(){browser.destroy();super.onDestroy()}
}
