/* ===================== ponteiro ===================== */
const ptrs=new Map(); let pinch=null, panDrag=null, down=null, spaceDown=false;
const evPt=e=>{const r=cv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]};
const lastPt=()=>st&&st.pts&&st.pts.length?st.pts[st.pts.length-1]:null;

cv.addEventListener("pointerdown",e=>{
  if(e.button===2) return;
  try{cv.setPointerCapture(e.pointerId)}catch(_){}
  ptrs.set(e.pointerId,evPt(e));
  if(ptrs.size===2){ if(down){cancelDrag(); down=null} startPinch(); return }
  if(ptrs.size>2) return;
  ptrTol=tolFor(e);
  const sp=evPt(e), w=toW(sp[0],sp[1]);
  if(tool==="pan"||e.button===1||spaceDown){panDrag={sp,vx:view.x,vy:view.y}; cv.style.cursor="grabbing"; return}
  down={sp,w,moved:false,shift:e.shiftKey};
  onDown(w,e);
});
cv.addEventListener("pointermove",e=>{
  const sp=evPt(e); if(ptrs.has(e.pointerId)) ptrs.set(e.pointerId,sp); if(!down&&!ptrs.size) ptrTol=tolFor(e);
  if(pinch&&ptrs.size>=2){movePinch(); return}
  if(panDrag){view.x=panDrag.vx+sp[0]-panDrag.sp[0]; view.y=panDrag.vy+sp[1]-panDrag.sp[1]; draw(); return}
  const w=toW(sp[0],sp[1]); updCoords(w);
  if(down&&!down.moved&&Math.hypot(sp[0]-down.sp[0],sp[1]-down.sp[1])>6) down.moved=true;
  if(e.pointerType!=="mouse"&&!down) return;
  onMove(w,e);
});
function ptrUp(e){
  if(!ptrs.has(e.pointerId)) return; ptrs.delete(e.pointerId);
  if(pinch){if(ptrs.size<2) pinch=null; return}
  if(panDrag){panDrag=null; cv.style.cursor=""; return}
  if(!down) return; const d=down; down=null; const sp=evPt(e); onUp(toW(sp[0],sp[1]),d,e);
}
cv.addEventListener("pointerup",ptrUp);
cv.addEventListener("pointercancel",e=>{ptrs.delete(e.pointerId); if(down){cancelDrag(); down=null} pinch=null; panDrag=null; draw()});
cv.addEventListener("pointerleave",e=>{if(e.pointerType==="mouse"&&!down){snapMark=null; hoverId=null; draw()}});
cv.addEventListener("dblclick",()=>{if(st&&st.tool==="line") finishChain()});
cv.addEventListener("wheel",e=>{e.preventDefault(); const sp=evPt(e); zoomAt(sp[0],sp[1],Math.exp(-e.deltaY*(e.ctrlKey?.01:.0015)))},{passive:false});
cv.addEventListener("contextmenu",e=>{e.preventDefault(); if(st) finishChain()});

function startPinch(){const [a,b]=[...ptrs.values()]; pinch={d:Math.hypot(b[0]-a[0],b[1]-a[1]),c:[(a[0]+b[0])/2,(a[1]+b[1])/2],s:view.s,vx:view.x,vy:view.y}}
function movePinch(){
  const [a,b]=[...ptrs.values()]; if(!b) return;
  const d=Math.hypot(b[0]-a[0],b[1]-a[1]), c=[(a[0]+b[0])/2,(a[1]+b[1])/2];
  const ns=clamp(pinch.s*d/Math.max(1,pinch.d),.05,80), wx=(pinch.c[0]-pinch.vx)/pinch.s, wy=(pinch.c[1]-pinch.vy)/pinch.s;
  view.s=ns; view.x=c[0]-wx*ns; view.y=c[1]-wy*ns; draw();
}
function cancelDrag(){
  if(st&&(st.tool==="free"||st.tool==="box")) st=null;
  if(st&&st.fresh) st=null;
  if(down&&down.origAll&&down.moved){P.items=JSON.parse(down.origAll); touch()}
  updHUD(); draw();
}

function onDown(w,e){
  if(tool==="select"){
    const hit=hitTest(w);
    if(hit){
      if(e.shiftKey){sel.has(hit.id)?sel.delete(hit.id):sel.add(hit.id)} else if(!sel.has(hit.id)) sel=new Set([hit.id]);
      down.mode="move"; down.start=snapAt(w,null,false,sel); down.origAll=JSON.stringify(P.items);
    } else { if(!e.shiftKey) sel.clear(); down.mode="box"; st={tool:"box",a:w,b:w} }
    renderPanel(); updCtx(); draw(); return;
  }
  if(tool==="erase"){down.erased=false; eraseAt(w); return}
  if(tool==="free"){st={tool:"free",pts:[w]}; return}
  if(tool==="text") return;
  const p=snapAt(w,st&&st.tool!=="dim"?lastPt():null,e.shiftKey);
  if(tool==="measure"&&st&&st.result) st=null;
  if(tool==="dim"){
    if(!st) st={tool:"dim",a:p,cur:p,stage:1,fresh:true};
    else if(st.stage===1){st.cur=p; st.fresh=false}
    else st.off=offFrom(w);
  } else if(["line","rect","circle","measure"].includes(tool)){
    if(!st) st={tool,pts:[p],cur:p,fresh:true}; else {st.cur=p; st.fresh=false}
  }
  updHUD(); draw();
}
function onMove(w,e){
  if(tool==="select"){
    if(down&&down.mode==="move"&&down.moved){
      const p=snapAt(w,null,false,sel); let dx=p[0]-down.start[0], dy=p[1]-down.start[1];
      if(e.shiftKey||opt.ortho){if(Math.abs(dx)>Math.abs(dy)) dy=0; else dx=0}
      const orig=JSON.parse(down.origAll); P.items=orig.map(it=>{if(sel.has(it.id)) translate(it,dx,dy); return it}); touch();
      showHUDRead(`Δx ${fmtL(dx)}  Δy ${fmtL(-dy)} ${P.unit}`);
    } else if(down&&down.mode==="box"&&st){st.b=w}
    else if(!down){const h=hitTest(w); const id=h?h.id:null; if(id!==hoverId){hoverId=id; draw()}; return}
    draw(); return;
  }
  if(tool==="erase"){if(down) eraseAt(w); return}
  if(tool==="free"){if(st&&down){const l=st.pts[st.pts.length-1]; if(dist(l,w)*view.s>1.5) st.pts.push(w); draw()} return}
  if(tool==="pan"||tool==="text"){snapMark=null; return}
  if(st&&st.tool==="dim"&&st.stage===2){st.off=offFrom(w); snapMark=null; draw(); return}
  const base=st&&st.tool!=="dim"?lastPt():(st&&st.tool==="dim"?st.a:null);
  const p=snapAt(w,base,e.shiftKey);
  if(st&&!st.result) st.cur=p;
  updHUD(); draw();
}
function offFrom(w){const a=st.a,b=st.b,L=dist(a,b); if(L<1e-9) return 0; const n=[-(b[1]-a[1])/L,(b[0]-a[0])/L]; return (w[0]-a[0])*n[0]+(w[1]-a[1])*n[1]}
function onUp(w,d,e){
  if(tool==="select"){
    if(d.mode==="move"){ if(d.moved){undoS.push(d.origAll); if(undoS.length>120) undoS.shift(); redoS=[]; afterEdit()} }
    else if(d.mode==="box"&&st){ if(d.moved) boxSelect(st.a,st.b,e.shiftKey); st=null; renderPanel(); updCtx() }
    showHUDRead(""); draw(); return;
  }
  if(tool==="erase") return;
  if(tool==="free"){ if(st&&st.pts.length>1) addItem({t:"free",pts:st.pts.map(p=>[+p[0].toFixed(2),+p[1].toFixed(2)])}); st=null; draw(); return }
  if(tool==="text"){ if(!d.moved) askText(snapAt(w,null,false)); return }
  if(!st) return;
  if(st.tool==="dim"){
    if(st.stage===1){ if(st.fresh&&!d.moved){st.fresh=false} else if(dist(st.a,st.cur)>1e-6){st.b=st.cur; st.stage=2; st.off=0} }
    else { addItem({t:"dim",a:st.a,b:st.b,off:+(st.off||0).toFixed(2),h:P.textH,lw:1}); st=null }
    updHUD(); draw(); return;
  }
  const a=st.pts[0];
  if(st.fresh&&!d.moved){st.fresh=false; updHUD(); draw(); return}
  if(st.tool==="line"){
    const last=lastPt();
    if(dist(last,st.cur)>1e-6){commitLine(last,st.cur); if(st.fresh){st=null} else {st.pts.push(st.cur)}}
    else if(st.fresh) st=null;
  }
  else if(st.tool==="rect"){ if(st.cur[0]!==a[0]&&st.cur[1]!==a[1]) addItem({t:"rect",a,b:st.cur}); st=null }
  else if(st.tool==="circle"){ const r=dist(a,st.cur); if(r>0) addItem({t:"circle",c:a,r:+r.toFixed(3)}); st=null }
  else if(st.tool==="measure"){ st.result=[a,st.cur] }
  updHUD(); draw();
}
function commitLine(a,b){addItem({t:"line",a:[+a[0].toFixed(3),+a[1].toFixed(3)],b:[+b[0].toFixed(3),+b[1].toFixed(3)]})}
function finishChain(){st=null; snapMark=null; updHUD(); draw()}
function closeChain(){if(st&&st.tool==="line"&&st.pts.length>2){commitLine(lastPt(),st.pts[0]); finishChain()}}
function boxSelect(a,b,add){
  const win=b[0]>=a[0], r=[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])];
  if(!add) sel.clear();
  for(const it of P.items){ if(!editable(it)) continue; const bb=itemBounds(it); if(!isFinite(bb[0])) continue;
    const inside=bb[0]>=r[0]&&bb[2]<=r[2]&&bb[1]>=r[1]&&bb[3]<=r[3];
    const cross=bb[0]<=r[2]&&bb[2]>=r[0]&&bb[1]<=r[3]&&bb[3]>=r[1];
    if(win?inside:cross) sel.add(it.id) }
}
function eraseAt(w){
  const tol=ptrTol/view.s; const hit=P.items.filter(it=>editable(it)&&hitItem(it,w,tol));
  if(!hit.length) return;
  const ids=new Set(hit.slice(-1).map(i=>i.id));
  if(!down.erased){pushUndo(); down.erased=true}
  P.items=P.items.filter(i=>!ids.has(i.id)); ids.forEach(id=>sel.delete(id)); touch(); save(); draw(); dirty3D=true;
}

/* entrada numérica (estilo linha de comando) */
const numIn=$("#numIn");
function applyNum(){
  const raw=numIn.value.trim(); numIn.value="";
  if(!st) return;
  if(st.tool==="line"){
    if(!raw){finishChain(); return}
    const [l,an]=raw.split("<"); const L=parseN(l)/U(); if(!(L>0)) return toast("Digite um comprimento, por exemplo 147 ou 147<90");
    const last=lastPt(); let dir;
    if(an!==undefined&&an!==""){const a=parseN(an)*Math.PI/180; dir=[Math.cos(a),-Math.sin(a)]}
    else {const v=[st.cur[0]-last[0],st.cur[1]-last[1]], d=Math.hypot(v[0],v[1]); dir=d>1e-9?[v[0]/d,v[1]/d]:[1,0]}
    const np=[last[0]+dir[0]*L,last[1]+dir[1]*L]; commitLine(last,np); st.pts.push(np); st.cur=np; st.fresh=false;
  } else if(st.tool==="rect"){
    const v=raw.split(/[x×*;\s]+/i).filter(Boolean).map(s=>parseN(s)/U());
    if(v.length<2||!(v[0]>0)||!(v[1]>0)) return toast("Digite largura x altura, por exemplo 60x80");
    const a=st.pts[0], sx=Math.sign(st.cur[0]-a[0])||1, sy=Math.sign(st.cur[1]-a[1])||-1;
    addItem({t:"rect",a,b:[a[0]+sx*v[0],a[1]+sy*v[1]]}); st=null;
  } else if(st.tool==="circle"){
    let r=parseN(raw.replace(/^d/i,""))/U(); if(/^d/i.test(raw)) r/=2; if(!(r>0)) return toast("Digite o raio, ou d e o diâmetro (d60)");
    addItem({t:"circle",c:st.pts[0],r}); st=null;
  } else if(st.tool==="dim"&&st.stage===2){
    const o=parseN(raw)/U(); if(!isFinite(o)) return; addItem({t:"dim",a:st.a,b:st.b,off:st.off<0?-Math.abs(o):Math.abs(o),h:P.textH,lw:1}); st=null;
  }
  updHUD(); draw();
}
numIn.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault(); applyNum()} else if(e.key==="Escape"){numIn.value=""; numIn.blur(); cancelTool()} e.stopPropagation()});

