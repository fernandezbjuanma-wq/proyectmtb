/* Ejecutar con: node --test tests/mtb-core.test.cjs  (Node 18+) */
const test=require("node:test");
const assert=require("node:assert/strict");
const core=require("../mtb-core.js");
const point=(lat,lon,time)=>({lat,lon,ele:500,time:new Date(time).toISOString()});
test("Haversine calcula 111.2 km por un grado ecuatorial",()=>{
  assert.ok(Math.abs(core.distanceKm({lat:0,lon:0},{lat:0,lon:1})-111.195)<.15);
});
test("GPS: segundos reales y huecos de señal",()=>{
  assert.equal(core.movingDelta(1000,6000,true,true),5);
  assert.equal(core.movingDelta(1000,60000,true,true),0);
  assert.equal(core.movingDelta(1000,6000,false,true),0);
  assert.equal(core.movingDelta(10000,9000,true,true),0);
});
test("Desnivel ignora ruido y suma diferencia al superar umbral",()=>{
  let r=core.altitudeStep(null,500);
  r=core.altitudeStep(r.anchor,500.5);assert.equal(r.up,0);
  r=core.altitudeStep(r.anchor,502);assert.equal(r.up,2);
});
test("Resumen mensual: filtra mes y vehículo",()=>{
 const rows=[
   {id:new Date(2026,9,10).getTime(),distancia:30,desnivel:400},
   {id:new Date(2026,9,12).getTime(),distancia:10,desnivel:100},
   {id:new Date(2026,9,13).getTime(),tipoActividad:"VEHICULO",distancia:99},
   {id:new Date(2026,8,10).getTime(),distancia:200}
 ];
 assert.deepEqual(core.monthlySummary(rows,2026,9),{rides:2,km:40,climb:500,maxKm:30});
});
test("No insertar HTML de terceros como contenido activo",()=>{
 assert.equal(core.safeHtml('<img src=x onerror="x">'),"&lt;img src=x onerror=&quot;x&quot;&gt;");
});
test("GPX recuperado es XML con nombre escapado",()=>{
 const gpx=core.pointsToGpx([point(-26.8,-65.2,Date.now())],"Cerro & río");
 assert.match(gpx,/Cerro &amp; río/);
 assert.match(gpx,/<trkpt lat="-26\.8000000"/);
});
test("Comparación por traza equivalente, dirección y largo",()=>{
 const a=Array.from({length:28},(_,i)=>point(-26.85,-65.2+i*.001,1000000+i*20000));
 const b=a.map(p=>({...p,time:new Date(Date.parse(p.time)+30000).toISOString()}));
 assert.equal(core.compareRoutes({puntos:a},{puntos:b}).comparable,true);
 assert.equal(core.compareRoutes({puntos:a},{puntos:b.slice().reverse()}).comparable,false);
 assert.equal(core.compareRoutes({puntos:a},{puntos:a.slice(0,10)}).comparable,false);
});
