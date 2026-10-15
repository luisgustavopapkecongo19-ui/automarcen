/* ===================== 3D ===================== */
let T=null, dirty3D=true, open3D=false, openV=0, loop3D=false, need3D=true;
function init3D(){
  if(T) return T; if(!window.THREE) return null;
  const canvas=$("#c3d");
  let renderer; try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true})}catch(_){return null}
  renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputEncoding=THREE.sRGBEncoding;
  const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(32,1,1,5000);
  const controls=new THREE.OrbitControls(camera,canvas); controls.enableDamping=true; controls.dampingFactor=.12; controls.maxPolarAngle=Math.PI*.495;
  scene.add(new THREE.HemisphereLight(0xffffff,0x8d8577,.72));
  const sun=new THREE.DirectionalLight(0xffffff,.78); sun.position.set(-160,320,260); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); sun.shadow.bias=-.0004;
  Object.assign(sun.shadow.camera,{left:-400,right:400,top:400,bottom:-400,near:1,far:1200}); scene.add(sun); scene.add(sun.target);
  const fill=new THREE.DirectionalLight(0xffffff,.25); fill.position.set(200,120,180); scene.add(fill);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(4000,4000),new THREE.ShadowMaterial({opacity:.16})); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
  const wall=new THREE.Mesh(new THREE.PlaneGeometry(4000,4000),new THREE.ShadowMaterial({opacity:.08})); wall.position.z=-.5; wall.receiveShadow=true; scene.add(wall);
  const group=new THREE.Group(); scene.add(group);
  T={renderer,scene,camera,controls,group,doors:[],drawers:[],sun};
  new ResizeObserver(()=>size3D()).observe(canvas.parentElement);
  return T;
}
function size3D(){if(!T) return; need3D=true; const r=$("#c3d").getBoundingClientRect(); if(!r.width) return; T.renderer.setSize(r.width,r.height,false); T.camera.aspect=r.width/r.height; T.camera.updateProjectionMatrix()}
const matCache={};
let woodTex=null;
function makeWoodTex(){ // veio de madeira desenhado em canvas (sem baixar imagens)
  const cv=document.createElement("canvas"); cv.width=256; cv.height=1024; const x=cv.getContext("2d");
  x.fillStyle="#fff"; x.fillRect(0,0,256,1024);
  let seed=7; const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  for(let k=0;k<140;k++){
    const x0=rnd()*256, a=.025+rnd()*.07, w=.5+rnd()*1.6, ph=rnd()*6, fr=.002+rnd()*.004, amp=.5+rnd()*3;
    x.strokeStyle=`rgba(60,35,15,${a})`; x.lineWidth=w; x.beginPath();
    for(let y=0;y<=1024;y+=16){const xx=x0+Math.sin(y*fr+ph)*amp+Math.sin(y*fr*3.1+ph)*amp*.3; y?x.lineTo(xx,y):x.moveTo(xx,y)}
    x.stroke();
  }
  const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.encoding=THREE.sRGBEncoding; t.anisotropy=4; return t;
}
function mat3(hex,kind){
  const key=hex+kind; if(matCache[key]) return matCache[key];
  const c=new THREE.Color(hex).convertSRGBToLinear();
  const wood=WOOD.has(hex)&&kind!=="metal"&&kind!=="back"&&kind!=="groove";
  if(wood&&!woodTex) woodTex=makeWoodTex();
  const m=kind==="metal"?new THREE.MeshStandardMaterial({color:0xa9adb3,metalness:.85,roughness:.28}):new THREE.MeshStandardMaterial({color:c,roughness:kind==="front"?.5:.68,metalness:0,map:wood?woodTex:null});
  return matCache[key]=m;
}
let EDGE_M=null; const edgeMat=()=>EDGE_M||(EDGE_M=new THREE.LineBasicMaterial({color:0x000000,transparent:true,opacity:.18}));
const geoC=new Map(); // caixas iguais (laterais, gavetas, portas) reaproveitam a mesma geometria
function boxGeo(w,h,d){const k=w.toFixed(1)+"|"+h.toFixed(1)+"|"+d.toFixed(1); let g=geoC.get(k); if(!g){g=new THREE.BoxGeometry(w,h,d); g.userData.cached=1; geoC.set(k,g)} return g}
function edgeGeo(g){if(!g.userData.edges){g.userData.edges=new THREE.EdgesGeometry(g); g.userData.edges.userData.cached=1} return g.userData.edges}
function build3D(){
  const t=init3D(); if(!t) return false;
  while(t.group.children.length){const o=t.group.children.pop(); o.traverse(x=>{if(x.geometry&&!x.geometry.userData.cached) x.geometry.dispose()})}
  if(geoC.size>3000){for(const g of geoC.values()){g.dispose(); if(g.userData.edges) g.userData.edges.dispose()} geoC.clear()}
  t.doors=[]; t.drawers=[]; t.slides=[];
  const mods=P.items.filter(i=>i.t==="mod"&&visible(i));
  for(const m of mods){
    const g=modGeom(m), ox=m.x, oy=-(m.y+m.H), fb=(FIN[m.fb]||FIN[0])[1], ff=(FIN[m.ff]||FIN[0])[1];
    const doors={}, drawers={};
    for(const b of g.boxes){
      const hex=b.kind==="front"?ff:b.kind==="back"?"#d9d4cb":b.kind==="groove"?"#1f1d1b":fb;
      let geo;
      if(b.kind==="rod"){geo=new THREE.CylinderGeometry(b.h/20,b.h/20,Math.max(.05,b.w/10),18); geo.rotateZ(Math.PI/2)}
      else geo=boxGeo(Math.max(.05,b.w/10),Math.max(.05,b.h/10),Math.max(.05,b.d/10));
      const mesh=new THREE.Mesh(geo,mat3(hex,b.kind==="rod"?"metal":b.kind)); mesh.castShadow=true; mesh.receiveShadow=true;
      if(b.kind!=="metal"&&b.kind!=="back"&&b.kind!=="rod"&&b.kind!=="groove") mesh.add(new THREE.LineSegments(edgeGeo(geo),edgeMat()));
      const wx=ox+(b.x+b.w/2)/10, wy=oy+(b.y+b.h/2)/10, wz=(b.z+b.d/2)/10;
      if(b.door){
        let grp=doors[b.door.id];
        if(!grp){grp=new THREE.Group(); grp.position.set(ox+b.door.hx/10,0,g.D/10); grp.userData.sign=b.door.sign; t.group.add(grp); t.doors.push(grp); doors[b.door.id]=grp}
        mesh.position.set(wx-grp.position.x,wy,wz-grp.position.z); grp.add(mesh);
      } else if(b.slide){
        let grp=doors["s"+b.slide.id];
        if(!grp){grp=new THREE.Group(); grp.userData.dx=b.slide.dx/10; t.group.add(grp); t.slides.push(grp); doors["s"+b.slide.id]=grp}
        mesh.position.set(wx,wy,wz); grp.add(mesh);
      } else if(b.drawer){
        let grp=drawers[b.drawer];
        if(!grp){grp=new THREE.Group(); grp.userData.out=b.out/10; t.group.add(grp); t.drawers.push(grp); drawers[b.drawer]=grp}
        mesh.position.set(wx,wy,wz); grp.add(mesh);
      } else { mesh.position.set(wx,wy,wz); t.group.add(mesh) }
    }
  }
  // desenho 2D na parede (linhas, retângulos, círculos, traços) e retângulos com profundidade como sólidos
  const pos=[], cols=[], tmp=new THREE.Color();
  const seg=(a,b,hex)=>{pos.push(a[0],-a[1],.25,b[0],-b[1],.25); tmp.set(hex); cols.push(tmp.r,tmp.g,tmp.b,tmp.r,tmp.g,tmp.b)};
  let sketch=0;
  for(const it of P.items){
    if(!visible(it)||it.t==="mod"||it.t==="dim"||it.t==="text") continue;
    if(it.t==="rect"&&+it.dep>0){
      const x0=Math.min(it.a[0],it.b[0]),x1=Math.max(it.a[0],it.b[0]),y0=Math.min(it.a[1],it.b[1]),y1=Math.max(it.a[1],it.b[1]), d=+it.dep;
      const c=itemCol(it), hex=c==="auto"?SOLID:c;
      const geo=new THREE.BoxGeometry(Math.max(.05,x1-x0),Math.max(.05,y1-y0),d);
      const mesh=new THREE.Mesh(geo,mat3(hex,"body")); mesh.castShadow=mesh.receiveShadow=true;
      mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),edgeMat()));
      mesh.position.set((x0+x1)/2,-(y0+y1)/2,d/2); t.group.add(mesh); continue;
    }
    const c=itemCol(it), hex=c==="auto"?"#3a3f47":c;
    for(const pr of prims(it)){
      if(pr.k==="line") seg(pr.a,pr.b,hex);
      else if(pr.k==="poly"){const q=pr.pts; for(let i=0;i<q.length;i++){const j=(i+1)%q.length; if(!pr.close&&j===0) break; seg(q[i],q[j],hex)}}
      else if(pr.k==="path"){for(let i=1;i<pr.pts.length;i++) seg(pr.pts[i-1],pr.pts[i],hex)}
      else if(pr.k==="circle"){const n=48; for(let i=0;i<n;i++){const a0=i/n*Math.PI*2,a1=(i+1)/n*Math.PI*2; seg([pr.c[0]+Math.cos(a0)*pr.r,pr.c[1]+Math.sin(a0)*pr.r],[pr.c[0]+Math.cos(a1)*pr.r,pr.c[1]+Math.sin(a1)*pr.r],hex)}}
    }
    if(isOutline(it)) sketch++;
  }
  if(pos.length){
    const geo=new THREE.BufferGeometry(); geo.setAttribute("position",new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute("color",new THREE.Float32BufferAttribute(cols,3));
    t.group.add(new THREE.LineSegments(geo,new THREE.LineBasicMaterial({vertexColors:true})));
  }
  const solids=P.items.some(i=>i.t==="rect"&&visible(i)&&+i.dep>0);
  show3DEmpty(mods.length||solids||pos.length?null:"empty");
  $("#b3d").hidden=!sketch;
  dirty3D=false; applyOpen(); need3D=true; return true;
}
function show3DEmpty(kind){
  const e=$("#e3d"), b=$("#e3dBody"); if(!kind){e.hidden=true; return}
  const drawn=hasDrawing();
  b.innerHTML=kind==="wait"?`<h3>Carregando o 3D…</h3><p>Só na primeira vez.</p>`:kind==="fail"?`<h3>O 3D não abriu neste aparelho</h3><p>O navegador não liberou o modo 3D (WebGL). O desenho, as peças e o orçamento continuam funcionando.</p>`
    :kind==="load"?`<h3>O 3D não carregou</h3><p>Verifique a internet e abra a aba 3D de novo.</p><button class="btn pri" onclick="location.reload()">Recarregar página</button>`
    :`<h3>Nenhum móvel no projeto</h3><p>O 3D mostra os móveis do projeto. Insira um modelo pronto${drawn?" ou transforme o armário que você desenhou em móvel":""}.</p><div class="row" style="justify-content:center"><button class="btn pri" data-go="insert">Inserir móvel</button>${drawn?`<button class="btn" data-go="conv">Gerar do desenho</button>`:""}</div>`;
  e.hidden=false;
}
function applyOpen(){if(!T) return; need3D=true; for(const d of T.doors) d.rotation.y=-d.userData.sign*openV*1.75; for(const d of T.drawers) d.position.z=openV*d.userData.out; for(const d of T.slides||[]) d.position.x=openV*d.userData.dx}
function cam3D(kind){ need3D=true;
  if(!T) return; const box=new THREE.Box3().setFromObject(T.group); if(box.isEmpty()) return;
  const c=box.getCenter(new THREE.Vector3()), sz=box.getSize(new THREE.Vector3());
  const vt=Math.tan(T.camera.fov*Math.PI/360), ht=vt*(T.camera.aspect||1);
  const w=kind==="front"?sz.x:Math.hypot(sz.x,sz.z), h=kind==="top"?Math.hypot(sz.z,sz.y):sz.y+sz.z*.5;
  const d=Math.max(h*1.18/(2*vt), w*1.12/(2*ht), 60/(2*vt));
  const dir=kind==="front"?new THREE.Vector3(0,.08,1):kind==="top"?new THREE.Vector3(0,1,.35):new THREE.Vector3(-.55,.42,1);
  dir.normalize(); T.camera.position.copy(c).addScaledVector(dir,d+sz.z/2); T.controls.target.copy(c); T.camera.near=1; T.camera.far=d*10; T.camera.updateProjectionMatrix(); T.controls.update();
  T.sun.target.position.copy(c); T.sun.position.set(c.x-160,c.y+320,c.z+260);
}
function tick3D(){
  if(curView!=="3d"){loop3D=false; return}
  const target=open3D?1:0;
  if(Math.abs(openV-target)>.002){openV+=matchMedia("(prefers-reduced-motion: reduce)").matches?(target-openV):(target-openV)*.14; applyOpen()}
  // desenha só quando algo muda (girar, abrir portas, trocar o projeto): poupa bateria e deixa o celular leve
  const moved=T.controls.update();
  if(moved||need3D||Math.abs(openV-target)>.002){T.renderer.render(T.scene,T.camera); need3D=false}
  requestAnimationFrame(tick3D);
}
function snapshot3D(){
  const t=init3D(); if(!t) return null;
  if(dirty3D||!t.group.children.length) build3D(); if(!t.group.children.length) return null;
  const prevSize=t.renderer.getSize(new THREE.Vector2()), prevPos=t.camera.position.clone(), prevTgt=t.controls.target.clone(), prevAsp=t.camera.aspect, prevOpen=openV;
  openV=0; applyOpen();
  t.renderer.setPixelRatio(1); t.renderer.setSize(1400,1000,false); t.camera.aspect=1.4; t.camera.updateProjectionMatrix(); cam3D("iso");
  t.renderer.setClearColor(0xf4f5f7,1); t.renderer.render(t.scene,t.camera);
  const url=t.renderer.domElement.toDataURL("image/jpeg",.86);
  t.renderer.setClearColor(0x000000,0); t.renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  if(prevSize.x) t.renderer.setSize(prevSize.x,prevSize.y,false); t.camera.aspect=prevAsp||1; t.camera.position.copy(prevPos); t.controls.target.copy(prevTgt); t.camera.updateProjectionMatrix(); openV=prevOpen; applyOpen();
  return {url,w:1400,h:1000};
}
$$("[data-cam]").forEach(b=>b.onclick=()=>cam3D(b.dataset.cam));
$("#bOpen").onclick=()=>{open3D=!open3D; $("#bOpen").textContent=open3D?"Fechar portas e gavetas":"Abrir portas e gavetas"};

