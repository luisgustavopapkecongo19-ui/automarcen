/* ===================== cliente: aprovar pelo WhatsApp e 3D para o cliente ===================== */
const STATUS=[["rascunho","Rascunho"],["enviado","Enviado"],["aprovado","Aprovado"],["recusado","Recusado"]];
function waNum(){let d=String(P.budget.phone||"").replace(/\D/g,""); if(!d) return ""; if(d.length<=11) d="55"+d; return d}
function waLink(kind){
  const Q=quote(), n=waNum(); if(!n) return "";
  const t=kind==="ok"?`Olá! Aprovo o orçamento "${P.name}" no valor de ${brl(Q.total)}.`:`Olá! Sobre o orçamento "${P.name}" (${brl(Q.total)}), gostaria de ajustar: `;
  return `https://wa.me/${n}?text=${encodeURIComponent(t)}`;
}
function setStatus(st){P.budget.status=st; P.budget.statusAt=Date.now(); save(); renderQuote()}
function sceneData(){
  const out=[];
  for(const m of P.items.filter(i=>i.t==="mod"&&visible(i))){
    const g=modGeom(m), ox=m.x, oy=-(m.y+m.H), fb=(FIN[m.fb]||FIN[0])[1], ff=(FIN[m.ff]||FIN[0])[1];
    for(const b of g.boxes){
      const hex=b.kind==="front"?ff:b.kind==="back"?"#d9d4cb":b.kind==="groove"?"#1f1d1b":b.kind==="metal"||b.kind==="rod"?"#a9adb3":fb;
      const r=[+(ox+b.x/10).toFixed(2),+(oy+b.y/10).toFixed(2),+(b.z/10).toFixed(2),+(b.w/10).toFixed(2),+(b.h/10).toFixed(2),+(b.d/10).toFixed(2),hex,b.kind==="metal"||b.kind==="rod"?1:0];
      if(b.door) r.push("d"+m.id+b.door.id,+(ox+b.door.hx/10).toFixed(2),b.door.sign,+(g.D/10).toFixed(2));
      else if(b.drawer) r.push("g"+m.id+b.drawer,+(b.out/10).toFixed(2));
      else if(b.slide) r.push("s"+m.id+b.slide.id,+(b.slide.dx/10).toFixed(2));
      out.push(r);
    }
  }
  return out;
}
function clientHTML(){
  const Q=quote(), B=P.budget, data=JSON.stringify(sceneData()), ok=waLink("ok"), adj=waLink("adj");
  const mods=Q.A.mods.map(m=>`<li><b>${esc(m.name)}</b> ${fmtL(m.W)} × ${fmtL(m.H)} × ${fmtL(m.D)} ${P.unit} · ${esc(FIN[m.fb]?.[0])} / ${esc(FIN[m.ff]?.[0])}</li>`).join("");
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(P.name)} · orçamento</title>
<style>body{margin:0;font:15px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:#f3f4f6;color:#15181c}header{padding:14px 16px;background:#fff;border-bottom:1px solid #e3e5e9}h1{margin:0;font-size:18px}p{margin:4px 0;color:#646a74}#v{height:58vh;min-height:300px;position:relative;background:#eef0f3}#v canvas{width:100%;height:100%;display:block;touch-action:none}#tg{position:absolute;right:10px;top:10px}main{padding:14px 16px;display:grid;gap:12px;max-width:720px;margin:auto}.card{background:#fff;border:1px solid #e3e5e9;border-radius:14px;padding:14px}.tot{font-size:22px;font-weight:700;color:#c24806}ul{margin:6px 0;padding-left:18px}a.b,button.b{display:block;text-align:center;padding:13px;border-radius:12px;font-weight:600;text-decoration:none;border:1px solid #cdd1d8;background:#fff;color:#15181c;font-size:15px}a.ok{background:#16a34a;border-color:#16a34a;color:#fff}.row{display:grid;gap:8px;grid-template-columns:1fr 1fr}#msg{text-align:center;color:#646a74}</style></head><body>
<header><h1>${esc(P.name)}</h1><p>${B.client?"Para "+esc(B.client)+" · ":""}${new Date().toLocaleDateString("pt-BR")}</p></header>
<div id="v"><canvas id="c"></canvas><button class="b" id="tg" style="padding:8px 12px">Abrir portas</button><p id="msg" style="position:absolute;inset:auto 0 10px;margin:0">Arraste para girar · dois dedos para aproximar</p></div>
<main><div class="card"><p>Valor total</p><div class="tot">${brl(Q.total)}</div><ul>${mods}</ul>${B.notes?`<p>${esc(B.notes)}</p>`:""}</div>
${ok?`<div class="row"><a class="b ok" href="${esc(ok)}">Aprovar</a><a class="b" href="${esc(adj)}">Pedir ajuste</a></div><p style="text-align:center;font-size:13px">Os botões abrem o WhatsApp com a mensagem pronta.</p>`:""}</main>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"><\/script><script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"><\/script>
<script>const D=${data.replace(/</g,"\\u003c")};
(function(){if(!window.THREE){document.getElementById("msg").textContent="Abra com internet para ver o 3D.";return}
const cv=document.getElementById("c"),R=new THREE.WebGLRenderer({canvas:cv,antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,2));R.outputEncoding=THREE.sRGBEncoding;
const S=new THREE.Scene();S.background=new THREE.Color(0xeef0f3);const C=new THREE.PerspectiveCamera(32,1,1,5000),O=new THREE.OrbitControls(C,cv);O.enableDamping=true;O.maxPolarAngle=Math.PI*.495;
S.add(new THREE.HemisphereLight(0xffffff,0x8d8577,.75));const L=new THREE.DirectionalLight(0xffffff,.8);L.position.set(-160,320,260);S.add(L);
const G=new THREE.Group();S.add(G);const grp={},anim=[],mc={};
for(const r of D){const[x,y,z,w,h,d,hex,met,key,a,b,c]=r;const k=hex+met;const mt=mc[k]||(mc[k]=new THREE.MeshStandardMaterial(met?{color:0xa9adb3,metalness:.85,roughness:.3}:{color:new THREE.Color(hex).convertSRGBToLinear(),roughness:.6}));
const ms=new THREE.Mesh(new THREE.BoxGeometry(Math.max(.05,w),Math.max(.05,h),Math.max(.05,d)),mt);if(!met)ms.add(new THREE.LineSegments(new THREE.EdgesGeometry(ms.geometry),new THREE.LineBasicMaterial({color:0,transparent:true,opacity:.18})));
let p=G,px=0,pz=0;if(key){if(!grp[key]){const g=new THREE.Group();G.add(g);grp[key]=g;if(key[0]==="d"){g.position.set(a,0,c);anim.push([g,"r",b])}else if(key[0]==="g")anim.push([g,"z",a]);else anim.push([g,"x",a])}p=grp[key];if(key[0]==="d"){px=a;pz=c}}
ms.position.set(x+w/2-px,y+h/2,z+d/2-pz);p.add(ms)}
const bx=new THREE.Box3().setFromObject(G),ce=bx.getCenter(new THREE.Vector3()),sz=bx.getSize(new THREE.Vector3());
function fit(){const r=cv.getBoundingClientRect();R.setSize(r.width,r.height,false);C.aspect=r.width/r.height;C.updateProjectionMatrix();const vt=Math.tan(C.fov*Math.PI/360),dd=Math.max((sz.y+sz.z*.5)*1.2/(2*vt),Math.hypot(sz.x,sz.z)*1.15/(2*vt*C.aspect));const dir=new THREE.Vector3(-.5,.4,1).normalize();C.position.copy(ce).addScaledVector(dir,dd+sz.z/2);O.target.copy(ce);C.far=dd*10;C.updateProjectionMatrix()}
fit();addEventListener("resize",fit);let open=0,v=0;document.getElementById("tg").onclick=e=>{open=1-open;e.target.textContent=open?"Fechar portas":"Abrir portas"};
(function t(){v+=(open-v)*.12;for(const[g,k,a]of anim){if(k==="r")g.rotation.y=-a*v*1.75;else g.position[k]=v*a}O.update();R.render(S,C);requestAnimationFrame(t)})()})();<\/script></body></html>`;
}
async function sendClient(){
  const Q=quote(); if(!Q.A.hasParts){toast("Insira móveis para gerar o orçamento"); return}
  if(!waNum()) toast("Dica: preencha seu WhatsApp no Orçamento para o cliente aprovar com um toque");
  const html=clientHTML();
  if(await saveFile(fileBase()+"-3d-cliente.html",new Blob([html],{type:"text/html"}))){toast("Arquivo 3D salvo. Mande para o cliente pelo WhatsApp"); if(P.budget.status==="rascunho"||!P.budget.status) setStatus("enviado")}
}
async function exportPDF(){
  const Q=quote(); if(!Q.A.hasParts){toast("Insira móveis para gerar o orçamento"); return}
  toast("Gerando PDF…");
  try{await lib("pdf")}catch(_){toast("O gerador de PDF não carregou. Verifique a conexão"); return}
  try{await lib("3d")}catch(_){}
  const {jsPDF}=window.jspdf, doc=new jsPDF({unit:"mm",format:"a4"}), B=P.budget, M=15, PW=210;
  let y=M+4;
  const ink=()=>doc.setTextColor(26,29,34), mut=()=>doc.setTextColor(100,106,116);
  doc.setFillColor(226,88,11); doc.rect(0,0,PW,4,"F");
  doc.setFont("helvetica","bold"); doc.setFontSize(20); ink(); doc.text("Orçamento",M,y+4);
  doc.setFontSize(10); doc.setFont("helvetica","normal"); mut(); doc.text(new Date().toLocaleDateString("pt-BR"),PW-M,y+4,{align:"right"});
  y+=11; ink(); doc.setFontSize(12); doc.setFont("helvetica","bold"); doc.text(P.name,M,y);
  if(B.client){y+=6; doc.setFont("helvetica","normal"); doc.setFontSize(10); mut(); doc.text("Cliente: ",M,y); ink(); doc.text(B.client,M+15,y)}
  y+=8;
  // imagens
  const imgs=[];
  try{const s3=snapshot3D(); if(s3) imgs.push(s3)}catch(_){}
  try{const c=renderPNG(1600,false); if(c) imgs.push({url:c.toDataURL("image/jpeg",.88),w:c.width,h:c.height})}catch(_){}
  if(imgs.length){
    const gap=6, colW=(PW-2*M-gap*(imgs.length-1))/imgs.length, maxH=78;
    let rowH=0; const dims=imgs.map(im=>{let w=colW,h=w*im.h/im.w; if(h>maxH){h=maxH; w=h*im.w/im.h} rowH=Math.max(rowH,h); return [w,h]});
    imgs.forEach((im,i)=>{const [w,h]=dims[i], x=M+i*(colW+gap)+(colW-w)/2; doc.setDrawColor(225,227,231); doc.roundedRect(M+i*(colW+gap),y,colW,rowH,2,2,"S"); doc.addImage(im.url,"JPEG",x,y+(rowH-h)/2,w,h)});
    y+=rowH+8;
  }
  // móveis
  doc.setFont("helvetica","bold"); doc.setFontSize(11); ink(); doc.text("Móveis",M,y); y+=5;
  doc.setFont("helvetica","normal"); doc.setFontSize(9.5);
  for(const m of Q.A.mods){
    const g=modGeom(m), desc=m.secs.map(secLabel).join(", ")+` · puxador ${(PULLS.find(x=>x[0]===(m.pull||"barra"))||PULLS[0])[1].toLowerCase()}`;
    ink(); doc.text(`${m.name}`,M,y); mut(); doc.text(`${fmtL(m.W)} × ${fmtL(m.H)} × ${fmtL(m.D)} ${P.unit}  ·  caixa ${FIN[m.fb]?.[0]}  ·  frentes ${FIN[m.ff]?.[0]}`,M+45,y);
    y+=4.2; doc.setFontSize(8.5); doc.text(doc.splitTextToSize(desc,PW-2*M-45),M+45,y); y+=5.5; doc.setFontSize(9.5);
    if(y>265){doc.addPage(); y=M}
  }
  y+=3;
  // valores
  const row=(l,d,v,bold)=>{ if(y>270){doc.addPage(); y=M} doc.setFont("helvetica",bold?"bold":"normal"); ink(); doc.text(l,M,y); if(d){mut(); doc.text(d,M+70,y)} ink(); doc.text(v,PW-M,y,{align:"right"}); y+=2.6; doc.setDrawColor(232,234,238); doc.line(M,y,PW-M,y); y+=4.4 };
  doc.setFont("helvetica","bold"); doc.setFontSize(11); ink(); doc.text("Valores",M,y); y+=6; doc.setFontSize(9.5);
  for(const l of Q.lines) row(l.l,l.d,brl(l.v));
  row("Materiais","",brl(Q.mat),true);
  if(Q.labor) row("Mão de obra","",brl(Q.labor));
  if(Q.inst) row("Instalação e frete","",brl(Q.inst));
  if(Q.margin) row("Margem",num(B.margin,1)+"%",brl(Q.margin));
  y+=2; if(y>262){doc.addPage(); y=M}
  doc.setFillColor(253,238,228); doc.roundedRect(M,y,PW-2*M,14,2,2,"F");
  doc.setFont("helvetica","bold"); doc.setFontSize(12); ink(); doc.text("Total",M+5,y+9);
  doc.setFontSize(16); doc.setTextColor(194,72,6); doc.text(brl(Q.total),PW-M-5,y+9.5,{align:"right"}); y+=22;
  if(B.notes){ if(y>255){doc.addPage(); y=M} doc.setFont("helvetica","bold"); doc.setFontSize(10); ink(); doc.text("Observações",M,y); y+=5; doc.setFont("helvetica","normal"); doc.setFontSize(9.5); mut(); doc.text(doc.splitTextToSize(B.notes,PW-2*M),M,y) }
  const okL=waLink("ok"), adjL=waLink("adj");
  if(okL){
    if(y>250){doc.addPage(); y=M} y+=4;
    doc.setFont("helvetica","bold"); doc.setFontSize(10); ink(); doc.text("Aprovação",M,y); y+=4;
    const bw=(PW-2*M-6)/2;
    doc.setFillColor(22,163,74); doc.roundedRect(M,y,bw,11,2,2,"F"); doc.setTextColor(255,255,255); doc.setFontSize(11); doc.text("Aprovar pelo WhatsApp",M+bw/2,y+7.2,{align:"center"}); doc.link(M,y,bw,11,{url:okL});
    doc.setDrawColor(205,209,216); doc.roundedRect(M+bw+6,y,bw,11,2,2,"S"); ink(); doc.text("Pedir ajuste",M+bw+6+bw/2,y+7.2,{align:"center"}); doc.link(M+bw+6,y,bw,11,{url:adjL});
    y+=16; doc.setFont("helvetica","normal"); doc.setFontSize(8.5); mut(); doc.text("Toque em um dos botões: o WhatsApp abre com a mensagem pronta.",M,y);
  }
  const blob=doc.output("blob");
  if(await saveFile(fileBase()+"-orcamento.pdf",blob)){toast("PDF do orçamento salvo"); if(!P.budget.status||P.budget.status==="rascunho"){P.budget.status="enviado"; P.budget.statusAt=Date.now(); save(); if(curView==="quote") renderQuote()}}
}

