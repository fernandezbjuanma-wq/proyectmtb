package ar.mtb.radar

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.LinearLayout
import android.widget.Toast
import androidx.core.content.ContextCompat

class MainActivity : Activity() {
    private val url = "https://proyectmtb.netlify.app/"
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val layout = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        val start = Button(this).apply { text = "▶ Iniciar GPS nativo" }
        val stop = Button(this).apply { text = "■ Detener GPS nativo" }
        val export = Button(this).apply { text = "Exportar última grabación GPX" }
        val web = WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, request: android.webkit.WebResourceRequest?): Boolean {
                    val uri = request?.url ?: return true
                    return uri.host != "proyectmtb.netlify.app" || uri.scheme != "https"
                }
            }
            loadUrl(url)
        }
        layout.addView(start)
        layout.addView(stop)
        layout.addView(export)
        layout.addView(web, LinearLayout.LayoutParams(-1,0,1f))
        setContentView(layout)
        start.setOnClickListener {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION), 101)
            } else {
                ContextCompat.startForegroundService(this, Intent(this,TrackingService::class.java).setAction(TrackingService.ACTION_START))
                Toast.makeText(this,"Seguimiento nativo activado",Toast.LENGTH_SHORT).show()
            }
        }
        stop.setOnClickListener {
            startService(Intent(this,TrackingService::class.java).setAction(TrackingService.ACTION_STOP))
            Toast.makeText(this,"Seguimiento detenido",Toast.LENGTH_SHORT).show()
        }
        export.setOnClickListener {
            val db = TrackDatabase(this)
            val session = db.latest()
            if (session == null) {
                Toast.makeText(this,"Todavía no hay recorridos nativos",Toast.LENGTH_SHORT).show()
            } else {
                val gpx = GpxExport.fromPoints(db.points(session.id))
                val share = Intent(Intent.ACTION_SEND).apply {
                    type="application/gpx+xml"
                    putExtra(Intent.EXTRA_TEXT,gpx)
                }
                startActivity(Intent.createChooser(share,"Compartir GPX (texto)"))
            }
            db.close()
        }
    }
    override fun onRequestPermissionsResult(requestCode:Int,permissions:Array<out String>,grantResults:IntArray){
        super.onRequestPermissionsResult(requestCode,permissions,grantResults)
        if(requestCode==101 && grantResults.any{it==PackageManager.PERMISSION_GRANTED}) {
            ContextCompat.startForegroundService(this,Intent(this,TrackingService::class.java).setAction(TrackingService.ACTION_START))
        }
    }
}
