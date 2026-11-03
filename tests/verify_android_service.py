#!/usr/bin/env python3
"""Compile a real TrackingService.kt against JVM doubles, without Android/SQLite.

Requires a local Kotlin compiler and JDK 17. Creates files only in TemporaryDirectory.
This is not Android instrumentation, an SDK build, or a physical GPS/storage test.
"""
import argparse
import hashlib
import os
from pathlib import Path
import subprocess
import tempfile


STUBS = {
    "Android.kt": r'''package android
object Manifest { object permission { const val ACCESS_FINE_LOCATION="fine" } }
object R { object drawable { const val ic_menu_mylocation=1; const val ic_media_pause=2 } }
''',
    "Content.kt": r'''package android.content
import android.net.Uri
open class Context
class Intent(context:Context?=null, type:Class<*>?=null){
 companion object {const val FLAG_ACTIVITY_CLEAR_TOP=1;const val FLAG_ACTIVITY_SINGLE_TOP=2}
 var action:String?=null; var data:Uri?=null
 private val extras=mutableMapOf<String,Any>()
 fun setAction(v:String):Intent {action=v;return this}
 fun addFlags(v:Int)=this
 fun setData(v:Uri):Intent {data=v;return this}
 fun putExtra(k:String,v:String):Intent {extras[k]=v;return this}
 fun putExtra(k:String,v:Long):Intent {extras[k]=v;return this}
 fun getStringExtra(k:String)=extras[k] as? String
 fun hasExtra(k:String)=extras.containsKey(k)
 fun getLongExtra(k:String,fallback:Long)=extras[k] as? Long ?: fallback
}
''',
    "Uri.kt": r'''package android.net
class Uri(private val value:String){
 override fun toString()=value
 class Builder {
  private var value=""
  fun scheme(v:String):Builder {value=v+"://";return this}
  fun authority(v:String):Builder {value+=v;return this}
  fun appendPath(v:String):Builder {value+="/"+v;return this}
  fun build()=Uri(value)
 }
}
''',
    "Pm.kt": r'''package android.content.pm
object PackageManager {const val PERMISSION_GRANTED=0}
object ServiceInfo {const val FOREGROUND_SERVICE_TYPE_LOCATION=8}
''',
    "Os.kt": r'''package android.os
import ar.mtb.radar.Env
import java.util.concurrent.CountDownLatch
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.TimeUnit
interface IBinder
class Bundle
class Looper {
 companion object {private val current=ThreadLocal<Looper>();fun myLooper():Looper?=current.get()}
 private val queue=LinkedBlockingQueue<Runnable>()
 private val poison=Runnable{}
 private var accepting=true
 val terminated=CountDownLatch(1)
 fun post(task:Runnable):Boolean=synchronized(queue){if(!accepting)false else {queue.offer(task);true}}
 fun quit():Boolean=synchronized(queue){accepting=false;queue.offer(poison);true}
 fun run(){current.set(this);try{while(true){val task=queue.take();if(task===poison)break
  try{task.run()}catch(t:Throwable){Env.failures.add(t)}
 }}finally{current.remove();terminated.countDown()}}
 fun drain(){val done=CountDownLatch(1);check(post(Runnable{done.countDown()}));check(done.await(3,TimeUnit.SECONDS)){"worker did not drain"}
  Env.failures.firstOrNull()?.let{throw AssertionError("uncaught worker failure",it)}
 }
}
class HandlerThread(private val name:String){
 val looper=Looper()
 fun start(){Env.loopers.add(looper);Thread({looper.run()},name).apply{isDaemon=true;start()}}
 fun quitSafely()=looper.quit()
}
class Handler(private val looper:Looper){fun post(task:Runnable)=looper.post(task)}
object Build {object VERSION {@Volatile var SDK_INT=35};object VERSION_CODES {const val Q=29}}
''',
    "Location.kt": r'''package android.location
import android.os.*
import ar.mtb.radar.Env
class Location(val provider:String?,val time:Long){constructor(other:Location):this(other.provider,other.time)}
// Abstract methods model API26, so omitted legacy overrides fail compilation.
interface LocationListener {
 fun onLocationChanged(location:Location)
 fun onProviderDisabled(provider:String)
 fun onProviderEnabled(provider:String)
 fun onStatusChanged(provider:String?,status:Int,extras:Bundle?)
}
class LocationManager {
 companion object {const val GPS_PROVIDER="gps";const val NETWORK_PROVIDER="network"}
 fun isProviderEnabled(provider:String)=if(provider==GPS_PROVIDER)Env.gpsEnabled else false
 fun requestLocationUpdates(provider:String,time:Long,distance:Float,listener:LocationListener,looper:Looper){
  Env.events.add("request");Env.listeners.add(listener)
 }
 fun removeUpdates(listener:LocationListener){Env.events.add("removeUpdates")}
}
object LocationProvider {const val AVAILABLE=2}
''',
    "Log.kt": r'''package android.util
object Log {fun e(tag:String,msg:String)=0;fun w(tag:String,msg:String)=0}
''',
    "App.kt": r'''package android.app
import android.content.*
import android.os.IBinder
import ar.mtb.radar.Env
import java.util.concurrent.ConcurrentHashMap
open class Service:Context(){
 companion object {const val LOCATION_SERVICE="location";const val NOTIFICATION_SERVICE="notification";const val START_NOT_STICKY=2}
 @Volatile var latestDeliveredStartId=0
 @Volatile var foregroundId=0
 val applicationContext:Context get()=this
 open fun onBind(intent:Intent?):IBinder?=null
 open fun onCreate(){}
 open fun onStartCommand(intent:Intent?,flags:Int,startId:Int)=START_NOT_STICKY
 open fun onDestroy(){}
 fun getSystemService(name:String):Any=if(name==LOCATION_SERVICE)Env.gps else Env.notifications
 fun checkSelfPermission(name:String)=if(Env.permission)0 else -1
 fun startForeground(id:Int,n:Notification){foregroundId=id;Env.events.add("foreground2");Env.notices[id]=n}
 fun startForeground(id:Int,n:Notification,type:Int){foregroundId=id;Env.events.add("foreground3");Env.notices[id]=n}
 fun stopSelfResult(startId:Int):Boolean {val stopped=startId==latestDeliveredStartId
  Env.events.add("stopSelfResult:"+stopped+":"+startId);return stopped}
}
class Notification(val title:String,val text:String,val actions:List<Action>){
 class Builder(context:Context,channel:String){
  private var title="";private var text="";private val actions=mutableListOf<Action>()
  fun setSmallIcon(icon:Int)=this
  fun setContentTitle(v:String):Builder {title=v;return this}
  fun setContentText(v:String):Builder {text=v;return this}
  fun setStyle(v:BigTextStyle)=this
  fun setContentIntent(v:PendingIntent)=this
  fun setOngoing(v:Boolean)=this
  fun setAutoCancel(v:Boolean)=this
  fun addAction(v:Action):Builder {actions.add(v);return this}
  fun build()=Notification(title,text,actions.toList())
 }
 class BigTextStyle {fun bigText(v:String)=this}
 class Action(val intent:PendingIntent){class Builder(icon:Int,label:String,private val intent:PendingIntent){fun build()=Action(intent)}}
}
class PendingIntent(var intent:Intent){
 companion object {
  const val FLAG_UPDATE_CURRENT=1;const val FLAG_IMMUTABLE=2
  private val cache=ConcurrentHashMap<String,PendingIntent>()
  fun getActivity(context:Context,id:Int,intent:Intent,flags:Int)=PendingIntent(intent)
  fun getService(context:Context,id:Int,intent:Intent,flags:Int):PendingIntent {
   val key=id.toString()+":"+intent.action+":"+intent.data
   val pi=cache.computeIfAbsent(key){PendingIntent(intent)};pi.intent=intent;return pi
  }
 }
}
class NotificationChannel(id:String,name:String,importance:Int)
class NotificationManager {
 companion object {const val IMPORTANCE_LOW=1}
 fun createNotificationChannel(v:NotificationChannel){}
 fun notify(id:Int,v:Notification){Env.notices[id]=v;Env.events.add("notify:"+id+":"+v.title)}
 fun cancel(id:Int){Env.notices.remove(id);Env.events.add("cancel:"+id)}
}
''',
    "Harness.kt": r'''package ar.mtb.radar
import android.app.*
import android.content.*
import android.location.*
import android.os.*
import java.util.UUID
import java.util.concurrent.*
import java.util.concurrent.atomic.AtomicInteger

class MainActivity
object Env {
 val events=CopyOnWriteArrayList<String>();val failures=CopyOnWriteArrayList<Throwable>()
 val loopers=CopyOnWriteArrayList<Looper>();val listeners=CopyOnWriteArrayList<LocationListener>()
 val notices=ConcurrentHashMap<Int,Notification>();val sessions=ConcurrentHashMap<String,Boolean>()
 val points=CopyOnWriteArrayList<String>();val dbThreads=CopyOnWriteArrayList<String>()
 val gps=LocationManager();val notifications=NotificationManager();val dbLock=Any()
 @Volatile var permission=true;@Volatile var gpsEnabled=true
 @Volatile var failWrite=false;@Volatile var failBegin=false;@Volatile var failFinish=false
 @Volatile var accepted=true
 @Volatile var beginEntered:CountDownLatch?=null;@Volatile var beginRelease:CountDownLatch?=null
 @Volatile var recordEntered:CountDownLatch?=null;@Volatile var recordRelease:CountDownLatch?=null
 fun reset(){
  check(loopers.all{it.terminated.count==0L}){"prior fixture still running"}
  events.clear();failures.clear();loopers.clear();listeners.clear();notices.clear();sessions.clear();points.clear();dbThreads.clear()
  permission=true;gpsEnabled=true;failWrite=false;failBegin=false;failFinish=false;accepted=true
  beginEntered=null;beginRelease=null;recordEntered=null;recordRelease=null;Build.VERSION.SDK_INT=35
 }
 fun dbEvent(name:String){events.add(name);dbThreads.add(Thread.currentThread().name)}
}
class TrackDatabase(context:Context){
 private var closed=false
 fun beginOrResume():String {
  Env.dbEvent("begin");Env.beginEntered?.countDown();check(Env.beginRelease?.await(3,TimeUnit.SECONDS)!=false)
  check(!closed);if(Env.failBegin)throw IllegalStateException("synthetic open failure")
  return synchronized(Env.dbLock){Env.sessions.entries.firstOrNull{!it.value}?.key ?: UUID.randomUUID().toString().also{Env.sessions[it]=false}}
 }
 fun beginNewAfter(expected:String):String {
  Env.dbEvent("beginNew");check(!closed)
  return synchronized(Env.dbLock){
   check(Env.sessions.entries.firstOrNull{!it.value}?.key==expected){"session changed"}
   Env.sessions[expected]=true;UUID.randomUUID().toString().also{Env.sessions[it]=false}
  }
 }
 fun record(id:String,location:Location):Boolean {
  Env.dbEvent("record");Env.recordEntered?.countDown();check(Env.recordRelease?.await(3,TimeUnit.SECONDS)!=false)
  check(!closed);if(Env.failWrite)throw IllegalStateException("synthetic write failure")
  if(!Env.accepted||Env.sessions[id]!=false)return false
  Env.points.add(id);Env.events.add("written:"+id);return true
 }
 fun finish(id:String){Env.dbEvent("finish:"+id);check(!closed);if(Env.failFinish)throw IllegalStateException();Env.sessions[id]=true}
 fun close(){Env.dbEvent("close");closed=true}
}
private fun fixture():TrackingService {Env.reset();return TrackingService().also{it.onCreate()}}
private fun deliver(s:TrackingService,action:String,id:String?=null){
 val intent=Intent().setAction(action);if(id!=null)intent.putExtra(TrackingService.EXTRA_SESSION_ID,id)
 deliverIntent(s,intent)
}
private fun deliverIntent(s:TrackingService,intent:Intent){
 s.latestDeliveredStartId++;s.onStartCommand(intent,0,s.latestDeliveredStartId)
}
private fun start(s:TrackingService)=deliver(s,TrackingService.ACTION_START)
private fun drain()=Env.loopers.last().drain()
private fun stop(s:TrackingService){deliver(s,TrackingService.ACTION_STOP,TrackingService.activeSessionId);drain()}
private fun destroy(s:TrackingService,index:Int=Env.loopers.lastIndex){
 s.onDestroy();check(Env.loopers[index].terminated.await(3,TimeUnit.SECONDS));check(Env.failures.isEmpty()){Env.failures.toString()}
}
private fun current()=TrackingService.activeSessionId ?: error("no active session")
private fun listener()=Env.listeners.last()
private fun fast(label:String,block:()->Unit){
 val done=CountDownLatch(1);var failure:Throwable?=null
 Thread({try{block()}catch(t:Throwable){failure=t}finally{done.countDown()}},"synthetic-main").apply{isDaemon=true;start()}
 check(done.await(700,TimeUnit.MILLISECONDS)){"$label waited for blocked SQLite"};failure?.let{throw it}
}
private fun workerIoOnly(){check(Env.dbThreads.all{it=="radar-mtb-gps"}){"DB accessed outside worker: "+Env.dbThreads}}
fun main(){
 var count=0
 fun test(name:String,body:()->Unit){body();workerIoOnly();count++;println("PASS: "+name)}
 test("main starts foreground before blocked SQLite; duplicate START is idempotent"){
  val s=fixture();Env.beginEntered=CountDownLatch(1);Env.beginRelease=CountDownLatch(1)
  fast("START"){start(s)};check(Env.beginEntered!!.await(1,TimeUnit.SECONDS));check(TrackingService.trackingStarting)
  check(Env.events.indexOf("foreground3")<Env.events.indexOf("begin"));fast("duplicate START"){start(s)}
  Env.beginRelease!!.countDown();drain();check(TrackingService.trackingActive);check(!TrackingService.trackingStarting)
  check(Env.events.count{it=="begin"}==1);stop(s);destroy(s)
 }
 test("STOP does not block main; queued newer START survives; old listener cannot write to B"){
  val s=fixture();start(s);drain();val a=current();val old=listener()
  Env.recordEntered=CountDownLatch(1);Env.recordRelease=CountDownLatch(1)
  old.onLocationChanged(Location("gps",1000));check(Env.recordEntered!!.await(1,TimeUnit.SECONDS))
  fast("STOP"){deliver(s,TrackingService.ACTION_STOP,a)};fast("newer START"){start(s)}
  check(Env.events.none{it.startsWith("stopSelfResult:true")})
  Env.recordRelease!!.countDown();drain();val b=current();check(a!=b);check(Env.sessions[a]==true)
  check(TrackingService.trackingActive);check(Env.events.none{it.startsWith("stopSelfResult:true")})
  val n=Env.points.size;old.onLocationChanged(Location("gps",1001));drain();check(Env.points.size==n)
  deliver(s,TrackingService.ACTION_STOP,a);drain();check(current()==b&&Env.sessions[b]==false)
  stop(s);destroy(s)
 }
 test("GPS callback delivered on worker before STOP is persisted in FIFO order"){
  val s=fixture();start(s);drain();val a=current();val l=listener();val looper=Env.loopers.last()
  val entered=CountDownLatch(1);val release=CountDownLatch(1)
  check(looper.post(Runnable{entered.countDown();check(release.await(3,TimeUnit.SECONDS))}))
  check(entered.await(1,TimeUnit.SECONDS))
  check(looper.post(Runnable{l.onLocationChanged(Location("gps",6000))}))
  fast("FIFO STOP"){deliver(s,TrackingService.ACTION_STOP,a)}
  release.countDown();drain()
  check(Env.points.count{it==a}==1){"position delivered before STOP was discarded by reposting"}
  check(Env.events.indexOf("written:"+a)<Env.events.indexOf("finish:"+a))
  check(!TrackingService.trackingActive&&Env.sessions[a]==true);destroy(s)
 }
 test("START_NEW atomically closes the expected interrupted session"){
  val s=fixture();val a=UUID.randomUUID().toString();Env.sessions[a]=false
  deliver(s,TrackingService.ACTION_START_NEW,a);drain();val b=current()
  check(a!=b&&Env.sessions[a]==true&&Env.sessions[b]==false);check(Env.events.count{it=="beginNew"}==1)
  stop(s);destroy(s)
 }
 test("stale START_NEW never closes another interrupted session"){
  val s=fixture();val stale=UUID.randomUUID().toString();val b=UUID.randomUUID().toString();Env.sessions[b]=false
  deliver(s,TrackingService.ACTION_START_NEW,stale);drain();check(!TrackingService.trackingActive)
  check(Env.sessions.size==1&&Env.sessions[b]==false);destroy(s)
 }
 test("missing STOP identity and START_NEW during recording are ignored"){
  val s=fixture();start(s);drain();val a=current()
  deliver(s,TrackingService.ACTION_STOP);deliver(s,TrackingService.ACTION_START_NEW,a);drain()
  check(current()==a&&Env.sessions[a]==false);check(Env.events.none{it=="beginNew"||it.startsWith("finish:")})
  stop(s);destroy(s)
 }
 test("missing START_NEW identity does not mutate SQLite"){
  val s=fixture();val a=UUID.randomUUID().toString();Env.sessions[a]=false
  deliver(s,TrackingService.ACTION_START_NEW);drain();check(Env.sessions[a]==false)
  check(Env.events.none{it=="beginNew"||it=="begin"});destroy(s)
 }
 test("write failure stops honestly without finalizing the recoverable session"){
  val s=fixture();start(s);drain();val a=current();Env.failWrite=true
  listener().onLocationChanged(Location("gps",2000));drain()
  check(!TrackingService.trackingActive&&Env.sessions[a]==false)
  check(TrackingService.statusMessage!!.contains("ERROR de guardado"))
  check(Env.notices.values.all{it.title.contains("detenido")});destroy(s)
 }
 test("GPS-off warning survives network and rejected fixes until accepted GPS"){
  val s=fixture();start(s);drain();val l=listener();l.onProviderDisabled("gps");drain();val warning=TrackingService.statusMessage
  l.onLocationChanged(Location("network",3000));drain();check(TrackingService.statusMessage==warning)
  l.onProviderEnabled("gps");Env.accepted=false;l.onLocationChanged(Location("gps",3001));drain();check(TrackingService.statusMessage==warning)
  Env.accepted=true;l.onLocationChanged(Location("gps",3002));drain();check(TrackingService.lastFixTimeMs==3002L)
  check(TrackingService.statusMessage!!.contains("confirmados"));stop(s);destroy(s)
 }
 test("permission revoked during recording keeps the session recoverable"){
  val s=fixture();start(s);drain();val a=current();Env.permission=false
  listener().onLocationChanged(Location("gps",4000));drain();check(!TrackingService.trackingActive)
  check(Env.sessions[a]==false);check(Env.events.any{it.startsWith("stopSelfResult:true")});destroy(s)
 }
 test("permission denied before start never opens SQLite"){
  val s=fixture();Env.permission=false;start(s);drain();check(!TrackingService.trackingActive)
  check(Env.events.none{it=="begin"});check(TrackingService.statusMessage!!.contains("permiso"));destroy(s)
 }
 test("destroy never waits for blocked DB; old cleanup cannot cancel a newer instance"){
  val old=fixture();start(old);drain();val oldId=current();val oldListener=listener()
  val oldStop=Env.notices[old.foregroundId]!!.actions.single().intent.intent
  Env.recordEntered=CountDownLatch(1);Env.recordRelease=CountDownLatch(1)
  oldListener.onLocationChanged(Location("gps",5000));check(Env.recordEntered!!.await(1,TimeUnit.SECONDS))
  fast("onDestroy"){old.onDestroy()}
  val newer=TrackingService();newer.onCreate();start(newer);drain();val newFg=newer.foregroundId
  check(current()==oldId);val newStop=Env.notices[newFg]!!.actions.single().intent.intent
  check(oldStop.data.toString()!=newStop.data.toString())
  deliverIntent(newer,oldStop);drain();check(TrackingService.trackingActive&&Env.sessions[oldId]==false)
  Env.recordRelease!!.countDown();check(Env.loopers[0].terminated.await(3,TimeUnit.SECONDS))
  check(Env.notices.containsKey(newFg));check(TrackingService.trackingActive&&current()==oldId)
  val n=Env.points.size;oldListener.onLocationChanged(Location("gps",5001));drain();check(Env.points.size==n)
  stop(newer);destroy(newer)
 }
 test("API26 branch and all legacy LocationListener callbacks are available"){
  val s=fixture();Build.VERSION.SDK_INT=26;start(s);drain();val l=listener()
  check(Env.events.contains("foreground2")&&!Env.events.contains("foreground3"))
  l.onStatusChanged("gps",0,Bundle());l.onProviderDisabled("gps");l.onProviderEnabled("gps");drain()
  stop(s);destroy(s)
 }
 test("finish SQL failure leaves a stopped but recoverable session"){
  val s=fixture();start(s);drain();val a=current();Env.failFinish=true
  stop(s);check(!TrackingService.trackingActive&&Env.sessions[a]==false)
  check(TrackingService.statusMessage!!.contains("No se pudo finalizar"));destroy(s)
 }
 println("PASS: $count JVM scenarios against the supplied real source; Android and SQLite are doubles.")
}
''',
}


def local_tool(parser, home, relative, option):
    if not home:
        parser.error(f"{option} or its corresponding environment variable is required")
    candidate = Path(home).expanduser().resolve() / relative
    if not candidate.is_file():
        parser.error(f"Missing local tool: {candidate}")
    return candidate


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, type=Path, help="Actual TrackingService.kt to compile")
    parser.add_argument("--kotlin-home", default=os.environ.get("KOTLIN_HOME"))
    parser.add_argument("--java-home", default=os.environ.get("JAVA_HOME"))
    parser.add_argument("--temp-parent", type=Path, help="Optional writable parent for the owned temporary directory")
    args = parser.parse_args()
    source = args.source.expanduser().resolve()
    if not source.is_file():
        parser.error(f"Source does not exist: {source}")
    java = local_tool(parser, args.java_home, Path("bin") / ("java.exe" if os.name == "nt" else "java"), "--java-home")
    compiler = local_tool(parser, args.kotlin_home, Path("lib/kotlin-compiler.jar"), "--kotlin-home")
    kotlin_home = compiler.parent.parent
    print("JVM doubles only; no Android SDK, real SQLite, device, or GPS.", flush=True)
    print(f"Source SHA256: {hashlib.sha256(source.read_bytes()).hexdigest()}", flush=True)
    temp_parent = (args.temp_parent or Path(tempfile.gettempdir())).expanduser().resolve()
    if not temp_parent.is_dir():
        parser.error(f"Temporary parent does not exist: {temp_parent}")
    with tempfile.TemporaryDirectory(prefix="radar-service-jvm-", dir=temp_parent) as temporary:
        scratch = Path(temporary).resolve()
        if scratch.parent != temp_parent or not scratch.name.startswith("radar-service-jvm-"):
            raise RuntimeError("Unexpected temporary directory outside the selected parent")
        for name, content in STUBS.items():
            (scratch / name).write_text(content, encoding="utf-8")
        jar = scratch / "service-check.jar"
        compile_args = [str(java), "-cp", str(kotlin_home / "lib" / "*"),
                        "org.jetbrains.kotlin.cli.jvm.K2JVMCompiler", "-kotlin-home", str(kotlin_home),
                        "-jvm-target", "17", "-nowarn", "-include-runtime", "-d", str(jar), str(source)]
        compile_args.extend(str(scratch / name) for name in STUBS)
        subprocess.run(compile_args, check=True, shell=False)
        subprocess.run([str(java), "-cp", str(jar), "ar.mtb.radar.HarnessKt"], check=True, shell=False)


if __name__ == "__main__":
    main()
