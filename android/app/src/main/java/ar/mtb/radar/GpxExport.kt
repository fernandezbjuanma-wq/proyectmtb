package ar.mtb.radar

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

object GpxExport {
    fun fromPoints(points: List<TrackDatabase.RecordedPoint>): String {
        val fmt=SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'",Locale.US).apply { timeZone=TimeZone.getTimeZone("UTC") }
        val xml=StringBuilder("<?xml version=\"1.0\" encoding=\"UTF-8\"?><gpx version=\"1.1\" creator=\"Radar MTB Android\" xmlns=\"http://www.topografix.com/GPX/1/1\"><trk><name>Radar MTB</name><trkseg>")
        for(p in points){
            xml.append("<trkpt lat=\"").append(p.lat).append("\" lon=\"").append(p.lon).append("\">")
            p.altitude?.let { xml.append("<ele>").append(it).append("</ele>") }
            xml.append("<time>").append(fmt.format(Date(p.timeMs))).append("</time></trkpt>")
        }
        return xml.append("</trkseg></trk></gpx>").toString()
    }
}
