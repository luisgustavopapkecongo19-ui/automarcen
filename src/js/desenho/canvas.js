/* ===================== canvas 2D ===================== */
const cv=$("#cv"), ctx=cv.getContext("2d"), stage=$("#stage");
let CW=0,CH=0,dpr=1; const view={s:3,x:0,y:0};
const toW=(x,y)=>[(x-view.x)/view.s,(y-view.y)/view.s];
const toS=p=>[p[0]*view.s+view.x,p[1]*view.s+view.y];

function drawGrid(c,s,ox,oy,w,h,o){
  let g=P.grid, k=0; while(g*s<9&&k<12){g*=(k%2?2:5);k++}
  const step=g*s, maj=g*10;
  const lines=(isMaj)=>{
    const gg=isMaj?maj:g, st2=gg*s; if(st2<6) return;
    c.beginPath();
    const x0=Math.floor(-ox/st2), x1=Math.ceil((w-ox)/st2), y0=Math.floor(-oy/st2), y1=Math.ceil((h-oy)/st2);
    for(let i=x0;i<=x1;i++){ if(!isMaj&&Math.abs((i*gg)%maj)<1e-6) continue; const x=Math.round(ox+i*st2)+.5; c.moveTo(x,0);c.lineTo(x,h)}
    for(let j=y0;j<=y1;j++){ if(!isMaj&&Math.abs((j*gg)%maj)<1e-6) continue; const y=Math.round(oy+j*st2)+.5; c.moveTo(0,y);c.lineTo(w,y)}
    c.strokeStyle=isMaj?o.major:o.minor; c.lineWidth=1; c.stroke();
  };
  if(step>=6) lines(false); lines(true);
  // eixos e piso
  c.setLineDash([]); c.strokeStyle=o.axis; c.lineWidth=1;
  c.beginPath(); c.moveTo(Math.round(ox)+.5,0); c.lineTo(Math.round(ox)+.5,h); c.moveTo(0,Math.round(oy)+.5); c.lineTo(w,Math.round(oy)+.5); c.stroke();
  c.fillStyle=o.axis; c.font=`600 10px ${FONT}`; c.textBaseline="top"; c.textAlign="left";
  c.fillText("PISO  0,0",Math.round(ox)+6,Math.round(oy)+5);
}
function rp(c,pr,s,ox,oy,o,hi){
  const col=hi||(pr.col==="auto"?o.ink:pr.col);
  const X=x=>x*s+ox, Y=y=>y*s+oy;
  c.strokeStyle=col; c.lineWidth=Math.max(.6,(pr.lw||1)*o.lws*(hi?1.5:1)); c.lineCap="round"; c.lineJoin="round";
  c.setLineDash(pr.dash?[5*o.lws,4*o.lws]:[]);
  if(pr.k==="line"){c.beginPath();c.moveTo(X(pr.a[0]),Y(pr.a[1]));c.lineTo(X(pr.b[0]),Y(pr.b[1]));c.stroke()}
  else if(pr.k==="poly"){
    c.beginPath(); pr.pts.forEach((p,i)=>i?c.lineTo(X(p[0]),Y(p[1])):c.moveTo(X(p[0]),Y(p[1]))); if(pr.close) c.closePath();
    if(pr.fill){c.fillStyle=pr.fill==="ink"?col:pr.fill; c.globalAlpha=pr.fill==="ink"?1:pr.fin?.72:(hi?o.fa*.7:o.fa); c.fill(); c.globalAlpha=1}
    c.stroke();
  }
  else if(pr.k==="circle"){c.beginPath();c.arc(X(pr.c[0]),Y(pr.c[1]),pr.r*s,0,Math.PI*2);c.stroke()}
  else if(pr.k==="path"){
    const p=pr.pts.map(q=>[X(q[0]),Y(q[1])]); if(p.length<2) return;
    c.beginPath(); c.moveTo(p[0][0],p[0][1]);
    for(let i=1;i<p.length-1;i++){const mx=(p[i][0]+p[i+1][0])/2,my=(p[i][1]+p[i+1][1])/2;c.quadraticCurveTo(p[i][0],p[i][1],mx,my)}
    c.lineTo(p[p.length-1][0],p[p.length-1][1]); c.stroke();
  }
  else if(pr.k==="text"){
    const fs=pr.h*s; if(fs<3) return;
    c.save(); c.translate(X(pr.p[0]),Y(pr.p[1])); c.rotate(pr.ang||0);
    c.font=`500 ${fs}px ${FONT}`; c.textAlign=pr.align||"left"; c.textBaseline=pr.base||"top"; c.fillStyle=col; c.fillText(pr.s,0,0); c.restore();
  }
}
function renderScene(c,s,ox,oy,w,h,o){
  c.fillStyle=o.bg; c.fillRect(0,0,w,h);
  if(o.grid) drawGrid(c,s,ox,oy,w,h,o);
  for(const it of P.items){
    if(!visible(it)) continue;
    const hi=o.sel&&sel.has(it.id)?o.selCol:(o.sel&&hoverId===it.id&&tool==="select"?null:null);
    for(const pr of prims(it)) rp(c,pr,s,ox,oy,o,hi);
  }
}
const liveOpts=()=>({bg:C.bg,minor:C.minor,major:C.major,axis:C.axis,ink:C.ink,grid:true,sel:true,selCol:C.acc,lws:1,fa:.5});

function resize(){
  dpr=Math.min(devicePixelRatio||1,2); const r=stage.getBoundingClientRect(); if(!r.width) return;
  const first=!CW; CW=r.width; CH=r.height; cv.width=Math.round(CW*dpr); cv.height=Math.round(CH*dpr);
  if(first) fit(); else draw();
}
let rafQ=0;
function draw(){if(rafQ) return; rafQ=requestAnimationFrame(()=>{rafQ=0; drawNow()})}
function drawNow(){
  if(!CW) return;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  renderScene(ctx,view.s,view.x,view.y,CW,CH,liveOpts());
  const o=liveOpts(), acc=C.acc;
  if(!P.items.length&&!st){ // projeto vazio: uma dica discreta no meio da tela
    const lines=["Projeto vazio","Toque em Móvel para pôr um móvel pronto","ou desenhe com Linha e Retângulo"];
    ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillStyle=C.fg; ctx.globalAlpha=.5;
    lines.forEach((t,i)=>{ctx.font=`${i?400:600} ${i?13:15}px ${FONT}`; ctx.fillText(t,CW/2,CH/2-22+i*22)}); ctx.globalAlpha=1;
  }
  const pv=(pr)=>rp(ctx,pr,view.s,view.x,view.y,o,acc);
  // hover
  if(tool==="select"&&hoverId&&!sel.has(hoverId)){const it=byId(hoverId); if(it&&visible(it)){ctx.globalAlpha=.45; for(const pr of prims(it)) rp(ctx,pr,view.s,view.x,view.y,o,acc); ctx.globalAlpha=1}}
  // seleção: alças nos limites
  if(sel.size){
    ctx.setLineDash([4,3]); ctx.strokeStyle=acc; ctx.lineWidth=1;
    for(const it of selItems()){const b=itemBounds(it); if(!isFinite(b[0])) continue; const a=toS([b[0],b[1]]),z=toS([b[2],b[3]]); ctx.strokeRect(a[0]-4,a[1]-4,z[0]-a[0]+8,z[1]-a[1]+8)}
    ctx.setLineDash([]);
  }
  // pré-visualizações
  if(st){
    const last=st.pts?st.pts[st.pts.length-1]:null;
    if(st.tool==="line"&&last){pv({k:"line",a:last,b:st.cur,lw:1.4,dash:1}); labelAt(st.cur,`${fmtLU(dist(last,st.cur))}  ${num(angDeg(last,st.cur),0)}°`)}
    if(st.tool==="rect"&&last){const [x0,y0]=last,[x1,y1]=st.cur; pv({k:"poly",pts:[[x0,y0],[x1,y0],[x1,y1],[x0,y1]],close:1,lw:1.4,dash:1}); labelAt(st.cur,`${fmtL(Math.abs(x1-x0))} × ${fmtL(Math.abs(y1-y0))} ${P.unit}`)}
    if(st.tool==="circle"&&last){const r=dist(last,st.cur); pv({k:"circle",c:last,r,lw:1.4,dash:1}); pv({k:"line",a:last,b:st.cur,lw:1,dash:1}); labelAt(st.cur,`R ${fmtLU(r)}`)}
    if(st.tool==="measure"&&last){const b=st.result?st.result[1]:st.cur; pv({k:"line",a:last,b,lw:1.6}); labelAt(b,`${fmtLU(dist(last,b))}  Δx ${fmtL(Math.abs(b[0]-last[0]))}  Δy ${fmtL(Math.abs(b[1]-last[1]))}`)}
    if(st.tool==="dim"){
      if(st.stage===1) pv({k:"line",a:st.a,b:st.cur,lw:1,dash:1});
      else for(const pr of dimPrims(st.a,st.b,st.off||0,acc,P.textH,1)) pv(pr);
    }
    if(st.tool==="free"&&st.pts.length>1) pv({k:"path",pts:st.pts,lw:curLw});
    if(st.tool==="box"){
      const a=toS(st.a), b=toS(st.b), win=st.b[0]>=st.a[0];
      ctx.fillStyle=win?C.win:C.snap; ctx.globalAlpha=.08; ctx.fillRect(a[0],a[1],b[0]-a[0],b[1]-a[1]); ctx.globalAlpha=1;
      ctx.strokeStyle=win?C.win:C.snap; ctx.setLineDash(win?[]:[5,4]); ctx.lineWidth=1; ctx.strokeRect(a[0]+.5,a[1]+.5,b[0]-a[0],b[1]-a[1]); ctx.setLineDash([]);
    }
  }
  // marcador de encaixe
  if(snapMark&&tool!=="select"&&tool!=="pan"&&tool!=="erase"){
    const [x,y]=toS(snapMark.p); ctx.strokeStyle=C.snap; ctx.lineWidth=2; ctx.setLineDash([]); ctx.beginPath();
    if(snapMark.kind==="end") ctx.rect(x-6,y-6,12,12);
    else if(snapMark.kind==="mid"){ctx.moveTo(x,y-7);ctx.lineTo(x+7,y+5);ctx.lineTo(x-7,y+5);ctx.closePath()}
    else if(snapMark.kind==="center"||snapMark.kind==="quad") ctx.arc(x,y,6,0,Math.PI*2);
    else {ctx.lineWidth=1.2;ctx.moveTo(x-5,y);ctx.lineTo(x+5,y);ctx.moveTo(x,y-5);ctx.lineTo(x,y+5)}
    ctx.stroke();
  }
}
function labelAt(w,txt){
  const [x,y]=toS(w); ctx.font=`600 12px ${FONT}`; const tw=ctx.measureText(txt).width;
  let lx=x+14, ly=y-30; if(lx+tw+12>CW) lx=x-tw-26; if(ly<56) ly=y+16;
  ctx.fillStyle=C.fg; ctx.globalAlpha=.9; roundRect(ctx,lx,ly,tw+12,22,6); ctx.fill(); ctx.globalAlpha=1;
  ctx.fillStyle=C.surf; ctx.textBaseline="middle"; ctx.textAlign="left"; ctx.fillText(txt,lx+6,ly+11);
}
function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
const angDeg=(a,b)=>{let d=Math.atan2(-(b[1]-a[1]),b[0]-a[0])*180/Math.PI; return d<0?d+360:d};

function fit(){
  const b=sceneBounds(); if(!CW) return;
  if(!b){view.s=3;view.x=CW/2;view.y=CH*.65;draw();return}
  const bw=Math.max(20,b[2]-b[0]), bh=Math.max(20,b[3]-b[1]);
  const padT=70, padB=70, padX=40;
  view.s=clamp(Math.min((CW-padX*2)/bw,(CH-padT-padB)/bh),.05,80);
  view.x=CW/2-(b[0]+bw/2)*view.s; view.y=padT+(CH-padT-padB)/2-(b[1]+bh/2)*view.s; draw();
}
function zoomAt(x,y,f){const ns=clamp(view.s*f,.05,80), wx=(x-view.x)/view.s, wy=(y-view.y)/view.s; view.s=ns; view.x=x-wx*ns; view.y=y-wy*ns; draw()}

/* encaixe */
function snapAt(w,base,shift,exclude){
  snapMark=null; const tol=(ptrTol>12?20:12)/view.s; let best=null;
  if(opt.osnap){
    for(const it of P.items){ if(!visible(it)||(exclude&&exclude.has(it.id))) continue;
      for(const pr of prims(it)){ if(!pr.snap) continue; for(const [pt,kind] of keyPts(pr)){const d=dist(pt,w); if(d<tol&&(!best||d<best.d||(d-best.d<1e-6&&kind==="end"))) best={p:pt,d,kind}} } }
  }
  if(best&&opt.grid&&ptrTol>12){const g=P.grid, gp=[Math.round(w[0]/g)*g,Math.round(w[1]/g)*g]; if(dist(gp,w)<best.d*.6) best=null}
  if(best){snapMark={p:best.p,kind:best.kind}; return [best.p[0],best.p[1]]}
  let p=[w[0],w[1]];
  const ortho=base&&(opt.ortho||shift);
  if(ortho){if(Math.abs(p[0]-base[0])>=Math.abs(p[1]-base[1])) p[1]=base[1]; else p[0]=base[0]}
  if(opt.grid){const g=P.grid; if(ortho){if(p[1]===base[1]) p[0]=Math.round(p[0]/g)*g; else p[1]=Math.round(p[1]/g)*g} else p=[Math.round(p[0]/g)*g,Math.round(p[1]/g)*g]; snapMark={p,kind:"grid"}}
  const lk=ptrTol>12?14:7;
  if(base&&!ortho){ if(Math.abs(p[1]-base[1])*view.s<lk) p[1]=base[1]; else if(Math.abs(p[0]-base[0])*view.s<lk) p[0]=base[0] }
  return p;
}
function hitTest(w){
  const tol=ptrTol/view.s;
  for(let i=P.items.length-1;i>=0;i--){const it=P.items[i]; if(!editable(it)||it.t==="mod") continue; if(hitItem(it,w,tol)) return it}
  for(let i=P.items.length-1;i>=0;i--){const it=P.items[i]; if(editable(it)&&it.t==="mod"&&hitItem(it,w,tol)) return it}
  return null;
}

