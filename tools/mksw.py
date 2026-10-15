"""Gera o sw.js: a lista de arquivos que o app guarda no aparelho e a versão do cache (muda quando qualquer arquivo muda).
Chamado pelo tools/build.py. Sozinho: python3 tools/mksw.py <pasta>"""
import sys, pathlib, hashlib, json

SKIP_DIRS = {".git", "tools", "src", "dist"}

def files(P):
    return sorted(str(f.relative_to(P)) for f in P.rglob("*") if f.is_file()
                  and f.name not in ("sw.js", "README.md", ".nojekyll", ".gitignore")
                  and not SKIP_DIRS & set(f.relative_to(P).parts)
                  and not f.name.startswith("LICENSE") and not f.name.endswith(".txt"))

def version(P):
    h = hashlib.sha256()
    for f in files(P): h.update(f.encode()); h.update((P / f).read_bytes())
    return h.hexdigest()[:10]

def make(P):
    P = pathlib.Path(P)
    ver, assets = version(P), ["./"] + files(P)
    return f'''/* AutoMarcen: guarda o app no aparelho para abrir sem internet. Gerado automaticamente; a versão muda quando qualquer arquivo muda. */
const CACHE="croqui3d-{ver}";
const ASSETS={json.dumps(assets)};
self.addEventListener("install",e=>{{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(u=>new Request(u,{{cache:"reload"}})))).then(()=>self.skipWaiting()))}});
self.addEventListener("activate",e=>{{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("croqui3d-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))}});
self.addEventListener("fetch",e=>{{
  const r=e.request; if(r.method!=="GET") return;
  const u=new URL(r.url); if(u.origin!==location.origin) return;
  if(r.mode==="navigate"){{
    e.respondWith(caches.match("./",{{ignoreSearch:true}}).then(hit=>hit||fetch(r)).catch(()=>caches.match("index.html")));
    return;
  }}
  e.respondWith(caches.match(r,{{ignoreSearch:true}}).then(hit=>hit||fetch(r).then(res=>{{
    if(res&&res.ok&&res.type==="basic"){{const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp))}}
    return res;
  }})));
}});
'''

if __name__ == "__main__":
    P = pathlib.Path(sys.argv[1])
    (P / "sw.js").write_text(make(P))
    print(version(P), len(files(P)) + 1)
