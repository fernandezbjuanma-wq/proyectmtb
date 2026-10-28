/* Radar MTB: almacenamiento local durable. Sin conexión a Firebase. */
(function(root,factory){
    const api=factory();
    if(typeof module==="object"&&module.exports)module.exports=api;
    else root.MTBStore=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
    "use strict";
    const DB_NAME="mtb-radar-actividades-v2",VERSION=1;
    let dbPromise=null,writeQueue=Promise.resolve();
    function supported(){return typeof indexedDB!=="undefined";}
    function open(){
        if(!supported())return Promise.reject(new Error("IndexedDB no disponible"));
        if(!dbPromise){
            dbPromise=new Promise((resolve,reject)=>{
                const req=indexedDB.open(DB_NAME,VERSION);
                req.onupgradeneeded=()=>{
                    const db=req.result;
                    if(!db.objectStoreNames.contains("drafts"))db.createObjectStore("drafts",{keyPath:"id"});
                    if(!db.objectStoreNames.contains("points"))db.createObjectStore("points",{keyPath:["rideId","seq"]});
                    if(!db.objectStoreNames.contains("activities"))db.createObjectStore("activities",{keyPath:"id"});
                };
                req.onsuccess=()=>resolve(req.result);
                req.onerror=()=>reject(req.error||new Error("No se pudo abrir IndexedDB"));
                req.onblocked=()=>reject(new Error("IndexedDB bloqueada por otra pestaña"));
            }).catch(e=>{dbPromise=null;throw e;});
        }
        return dbPromise;
    }
    function transact(stores,mode,fill){
        return open().then(db=>new Promise((resolve,reject)=>{
            let done=false,result;
            const tx=db.transaction(stores,mode);
            tx.oncomplete=()=>{if(!done){done=true;resolve(result);}};
            tx.onerror=()=>{if(!done){done=true;reject(tx.error||new Error("Falló transacción"));}};
            tx.onabort=()=>{if(!done){done=true;reject(tx.error||new Error("Transacción cancelada"));}};
            try{result=fill(tx,(value)=>{result=value;});}catch(e){tx.abort();reject(e);}
        }));
    }
    function serial(fn){
        const next=writeQueue.catch(()=>{}).then(fn);
        writeQueue=next.catch(()=>{});
        return next;
    }
    function start(rideId){
        return serial(()=>transact(["drafts"],"readwrite",tx=>
            tx.objectStore("drafts").put({id:"active",rideId,startedAt:Date.now(),snapshot:{},updatedAt:Date.now()})
        ));
    }
    function checkpoint(rideId,snapshot,point,seq){
        return serial(()=>transact(["drafts","points"],"readwrite",tx=>{
            tx.objectStore("drafts").put({id:"active",rideId,startedAt:snapshot.inicioMs||rideId,snapshot,updatedAt:Date.now()});
            if(point&&Number.isInteger(seq)&&seq>=0){
                tx.objectStore("points").put({rideId,seq,point});
            }
        }));
    }
    function get(store,key){
        return transact([store],"readonly",(tx,set)=>{
            const req=tx.objectStore(store).get(key);
            req.onsuccess=()=>set(req.result||null);
        });
    }
    async function recover(){
        await writeQueue.catch(()=>{});
        const draft=await get("drafts","active");
        if(!draft)return null;
        const points=await transact(["points"],"readonly",(tx,set)=>{
            const req=tx.objectStore("points").getAll(IDBKeyRange.bound([draft.rideId,0],[draft.rideId,Number.MAX_SAFE_INTEGER]));
            req.onsuccess=()=>set((req.result||[]).sort((a,b)=>a.seq-b.seq).map(x=>x.point));
        });
        return {draft,points};
    }
    function finish(activity,rideId){
        return serial(()=>transact(["drafts","points","activities"],"readwrite",tx=>{
            tx.objectStore("activities").put(activity);
            if(Number.isFinite(rideId)){
                tx.objectStore("drafts").delete("active");
                tx.objectStore("points").delete(IDBKeyRange.bound([rideId,0],[rideId,Number.MAX_SAFE_INTEGER]));
            }
        }));
    }
    function putActivity(activity){
        return serial(()=>transact(["activities"],"readwrite",tx=>tx.objectStore("activities").put(activity)));
    }
    function deleteActivity(id){
        return serial(()=>transact(["activities"],"readwrite",tx=>tx.objectStore("activities").delete(id)));
    }
    async function listActivities(){
        await writeQueue.catch(()=>{});
        return transact(["activities"],"readonly",(tx,set)=>{
            const req=tx.objectStore("activities").getAll();
            req.onsuccess=()=>set(req.result||[]);
        });
    }
    function importLegacy(activities){
        return serial(()=>transact(["activities"],"readwrite",tx=>{
            const store=tx.objectStore("activities");
            // No sobrescribir una sesión ya mejorada en IndexedDB.
            for(const activity of activities||[]){
                if(activity&&activity.id!==undefined){
                    const req=store.get(activity.id);
                    req.onsuccess=()=>{if(!req.result)store.put(activity);};
                }
            }
        }));
    }
    return {supported,start,checkpoint,recover,finish,putActivity,deleteActivity,listActivities,importLegacy};
});
