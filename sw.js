/* AutoMarcen: guarda o app no aparelho para abrir sem internet. Gerado automaticamente; a versão muda quando qualquer arquivo muda. */
const CACHE="croqui3d-a9d186e675";
const ASSETS=["./", "app.js", "fonts/fonts.css", "fonts/ibm-plex-mono-latin-400-normal.woff2", "fonts/ibm-plex-mono-latin-500-normal.woff2", "fonts/ibm-plex-mono-latin-600-normal.woff2", "fonts/instrument-sans-latin-400-normal.woff2", "fonts/instrument-sans-latin-500-normal.woff2", "fonts/instrument-sans-latin-600-normal.woff2", "fonts/instrument-sans-latin-700-normal.woff2", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "index.html", "manifest.webmanifest", "vendor/OrbitControls.js", "vendor/firebase/app-check.js", "vendor/firebase/app.js", "vendor/firebase/auth.js", "vendor/firebase/firestore.js", "vendor/jspdf.umd.min.js", "vendor/three.min.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(u=>new Request(u,{cache:"reload"})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("croqui3d-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return;
  const u=new URL(r.url); if(u.origin!==location.origin||u.pathname.includes("/termos/")) return;
  if(r.mode==="navigate"){
    e.respondWith(caches.match("./",{ignoreSearch:true}).then(hit=>hit||fetch(r)).catch(()=>caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(res=>{
    if(res&&res.ok&&res.type==="basic"){const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp))}
    return res;
  })));
});
