package ar.mtb.radar

import java.io.Writer
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

/** Exporta como archivo GPX estándar, línea a línea, sin retener toda la ruta en RAM. */
object GpxExport {
    fun write(db: TrackDatabase, sessionId: String, writer: Writer) {
        val fmt=SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",Locale.US)
        fmt.timeZone=TimeZone.getTimeZone("UTC")
        writer.write("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n")
        writer.write("<gpx version=\"1.1\" creator=\"Radar MTB Android\" ")
        writer.write("xmlns=\"http://www.topografix.com/GPX/1/1\">\n")
        writer.write("<trk><name>Ruta MTB grabada</name><trkseg>\n")
        db.forEachPoint(sessionId) { p ->
            writer.write("<trkpt lat=\"" + p.lat + "\" lon=\"" + p.lon + "\">")
            if(p.elevation!=null)writer.write("<ele>" + p.elevation + "</ele>")
            writer.write("<time>"+fmt.format(Date(p.timeMs))+"</time></trkpt>\n")
        }
        writer.write("</trkseg></trk></gpx>\n")
        writer.flush()
    }
}
