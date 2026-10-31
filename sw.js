const CACHE='agrodrone-v1';
const ARQUIVOS=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARQUIVOS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

// Abre do cache (funciona offline) e atualiza em segundo plano para a próxima abertura
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const cached=await c.match(r,{ignoreSearch:true});
    const rede=fetch(r).then(resp=>{if(resp.ok)c.put(r,resp.clone());return resp}).catch(()=>null);
    return cached||(await rede)||(r.mode==='navigate'?c.match('./index.html'):Response.error());
  }));
});
