/* Radar MTB: cálculos puros, sin acceso a GPS, mapas ni servicios externos. */
(function(root,factory){
    const core=factory();
    if(typeof module==="object" && module.exports) module.exports=core;
    else root.MTBCore=core;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
    "use strict";
    const rad=Math.PI/180;
    const valid=(n)=>typeof n==="number" && Number.isFinite(n);
    function point(p){
        const lat=Number(p?.lat),lon=Number(p?.lon);
        return valid(lat)&&valid(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180;
    }
    function distanceKm(a,b){
        if(!point(a)||!point(b)) return NaN;
        const dLat=(Number(b.lat)-Number(a.lat))*rad;
        const dLon=(Number(b.lon)-Number(a.lon))*rad;
        const h=Math.sin(dLat/2)**2+Math.cos(Number(a.lat)*rad)*Math.cos(Number(b.lat)*rad)*Math.sin(dLon/2)**2;
        return 6371*2*Math.atan2(Math.sqrt(Math.max(0,h)),Math.sqrt(Math.max(0,1-h)));
    }
    function movingDelta(previousTimestamp,currentTimestamp,previousMoving,currentMoving,maxGapSec=15){
        if(!previousMoving||!currentMoving||!valid(previousTimestamp)||!valid(currentTimestamp))return 0;
        const seconds=(currentTimestamp-previousTimestamp)/1000;
        return seconds>0&&seconds<=maxGapSec?seconds:0;
    }
    function altitudeStep(anchor,altitude,threshold=1.5){
        if(!valid(altitude))return {anchor,up:0,down:0};
        if(!valid(anchor))return {anchor:altitude,up:0,down:0};
        const delta=altitude-anchor;
        if(Math.abs(delta)<threshold)return {anchor,up:0,down:0};
        return {anchor:altitude,up:Math.max(0,delta),down:Math.max(0,-delta)};
    }
    function safeHtml(s){
        return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    }
    function activityMs(a){
        const id=Number(a?.fechaMs??a?.id);
        return valid(id)&&id>946684800000&&id<4102444800000?id:NaN;
    }
    function monthlySummary(activities,year,month){
        const list=(activities||[]).filter(a=>{
            const ms=activityMs(a);
            if(!valid(ms)||a.tipoActividad==="VEHICULO")return false;
            const d=new Date(ms);
            return d.getFullYear()===year&&d.getMonth()===month;
        });
        return {rides:list.length,km:list.reduce((s,a)=>s+(Number(a.distancia)||0),0),
            climb:list.reduce((s,a)=>s+(Number(a.desnivel)||0),0),
            maxKm:list.reduce((m,a)=>Math.max(m,Number(a.distancia)||0),0)};
    }
    function trackData(track){
        if(!Array.isArray(track))return null;
        const pts=track.filter(point);
        if(pts.length<8)return null;
        const sums=[0];
        for(let i=1;i<pts.length;i++){
            const d=distanceKm(pts[i-1],pts[i]);
            sums.push(sums[i-1]+(valid(d)?d:0));
        }
        if(sums.at(-1)<0.3)return null;
        return {pts,sums,length:sums.at(-1)};
    }
    function sample(data,fraction){
        const target=data.length*fraction;
        let low=0,high=data.sums.length-1;
        while(low<high){const mid=Math.floor((low+high)/2);if(data.sums[mid]<target)low=mid+1;else high=mid;}
        if(low===0)return data.pts[0];
        const hi=data.pts[low],lo=data.pts[low-1];
        const den=data.sums[low]-data.sums[low-1]||1;
        const w=Math.max(0,Math.min(1,(target-data.sums[low-1])/den));
        return {lat:Number(lo.lat)+(Number(hi.lat)-Number(lo.lat))*w,lon:Number(lo.lon)+(Number(hi.lon)-Number(lo.lon))*w};
    }
    function compareRoutes(a,b){
        const t1=trackData(a?.puntos),t2=trackData(b?.puntos);
        if(!t1||!t2)return {comparable:false,reason:"Se requieren dos tracks GPX de al menos 300 m."};
        const ratio=Math.abs(t1.length-t2.length)/Math.max(t1.length,t2.length);
        if(ratio>0.15)return {comparable:false,reason:"Las distancias de las rutas difieren demasiado."};
        const diffs=[];
        for(let i=0;i<=20;i++)diffs.push(distanceKm(sample(t1,i/20),sample(t2,i/20))*1000);
        const sorted=[...diffs].sort((x,y)=>x-y);
        const near=diffs.filter(d=>d<=100).length;
        if(sorted[10]>80||near<17||Math.max(diffs[0],diffs.at(-1))>150){
            return {comparable:false,reason:"Los recorridos no coinciden suficientemente en ubicación y sentido."};
        }
        const elapsed=(s)=>{
            const p=s.puntos||[];
            const start=Date.parse(p[0]?.time),end=Date.parse(p.at(-1)?.time);
            if(Number.isFinite(start)&&Number.isFinite(end)&&end>start)return (end-start)/1000;
            return parseDuration(s.tiempoMov);
        };
        const sA=elapsed(a),sB=elapsed(b);
        return {comparable:true,kmA:t1.length,kmB:t2.length,medianDeviationM:sorted[10],
            secondsA:sA,secondsB:sB,differenceSeconds:valid(sA)&&valid(sB)?sB-sA:null};
    }
    function parseDuration(str){
        if(typeof str!=="string")return NaN;
        const parts=str.split(":").map(Number);
        if(parts.some(n=>!valid(n)||n<0)||parts.length<2||parts.length>3)return NaN;
        return parts.reduce((s,n)=>s*60+n,0);
    }
    function pointsToGpx(points,name="Recorrido recuperado"){
        const escapeXml=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));
        const rows=(points||[]).filter(point).map(p=>{
            const elev=valid(Number(p.ele))?"<ele>"+Number(p.ele).toFixed(1)+"</ele>":"";
            const date=new Date(p.time);
            const time=Number.isFinite(date.getTime())?"<time>"+date.toISOString()+"</time>":"";
            return '<trkpt lat="'+Number(p.lat).toFixed(7)+'" lon="'+Number(p.lon).toFixed(7)+'">'+elev+time+'</trkpt>';
        });
        return '<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Radar MTB" xmlns="http://www.topografix.com/GPX/1/1"><trk><name>'+
        escapeXml(name)+'</name><trkseg>'+rows.join("")+'</trkseg></trk></gpx>';
    }
    return {distanceKm,movingDelta,altitudeStep,safeHtml,monthlySummary,compareRoutes,pointsToGpx,parseDuration};
});
