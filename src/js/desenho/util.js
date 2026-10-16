/* ===================== utilidades de desenho ===================== */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const cssv=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
let C={}; function readColors(){C={bg:cssv("--cv-bg"),minor:cssv("--cv-minor"),major:cssv("--cv-major"),ink:cssv("--cv-ink"),axis:cssv("--cv-axis"),acc:cssv("--accent"),snap:cssv("--snap"),win:cssv("--win"),surf:cssv("--surface"),fg:cssv("--fg")}}
const FONT=`"Instrument Sans",system-ui,sans-serif`;
const layer=id=>P.layers.find(l=>l.id===id)||P.layers[0];
const itemCol=it=>it.col==="layer"||!it.col?layer(it.layer).color:it.col;
const U=()=>P.unit==="mm"?10:1; // fator de exibição
const fmtL=cm=>P.unit==="mm"?String(Math.round(cm*10)):num(cm,1);
const fmtLU=cm=>fmtL(cm)+" "+P.unit;
const parseN=s=>{const v=parseFloat(String(s).replace(/\s/g,"").replace(",","."));return isFinite(v)?v:NaN};

let ver=0; const pcache=new WeakMap();
function touch(){ver++}
function prims(it){const c=pcache.get(it); if(c&&c.v===ver) return c.p; const p=buildPrims(it); pcache.set(it,{v:ver,p}); return p}

function dimPrims(a,b,off,col,h,lw,label){
  const L=dist(a,b); if(L<1e-6) return [];
  const u=[(b[0]-a[0])/L,(b[1]-a[1])/L], n=[-u[1],u[0]];
  const A=[a[0]+n[0]*off,a[1]+n[1]*off], B=[b[0]+n[0]*off,b[1]+n[1]*off];
  const sg=Math.sign(off)||1, ext=h*.45, gp=Math.min(Math.abs(off)*.3,h*.35), out=[];
  if(Math.abs(off)>1e-6){
    for(const [p,q] of [[a,A],[b,B]]) out.push({k:"line",a:[p[0]+n[0]*gp*sg,p[1]+n[1]*gp*sg],b:[q[0]+n[0]*ext*sg,q[1]+n[1]*ext*sg],col,lw});
  }
  out.push({k:"line",a:[A[0]-u[0]*ext,A[1]-u[1]*ext],b:[B[0]+u[0]*ext,B[1]+u[1]*ext],col,lw});
  const tk=h*.32, d=[(u[0]+n[0])*tk,(u[1]+n[1])*tk];
  for(const q of [A,B]) out.push({k:"line",a:[q[0]-d[0],q[1]-d[1]],b:[q[0]+d[0],q[1]+d[1]],col,lw:lw+1});
  let ang=Math.atan2(u[1],u[0]);
  if(ang>=Math.PI/2-1e-6) ang-=Math.PI; else if(ang<-Math.PI/2-1e-6) ang+=Math.PI;
  const up=[Math.sin(ang),-Math.cos(ang)], mid=[(A[0]+B[0])/2,(A[1]+B[1])/2];
  out.push({k:"text",p:[mid[0]+up[0]*h*.2,mid[1]+up[1]*h*.2],s:label??fmtL(L),h,ang,col,align:"center",base:"bottom"});
  return out;
}
function modPrims(m,col){
  const g=modGeom(m), X=x=>m.x+x/10, Y=y=>m.y+m.H-y/10, out=[];
  const fb=(FIN[m.fb]||FIN[0])[1], ff=(FIN[m.ff]||FIN[0])[1];
  const showI=!!P.showInt;
  for(const r of g.r2d){
    if(r.int&&!showI) continue;
    const pts=[[X(r.x),Y(r.y)],[X(r.x+r.w),Y(r.y)],[X(r.x+r.w),Y(r.y+r.h)],[X(r.x),Y(r.y+r.h)]];
    if(r.door&&showI){ if(r.fill==="front") out.push({k:"poly",pts,close:1,col,lw:.7,dash:1,fill:null,snap:false}); continue }
    out.push({k:"poly",pts,close:1,col,lw:r.lw||1.1,fill:r.fill==="front"?ff:r.fill==="body"?fb:r.fill==="ink"?"ink":r.fill==="groove"?"#6a645d":null,fin:r.fill==="front"||r.fill==="body",snap:r.fill!=="ink"});
  }
  for(const l of g.l2d){ if((l.int&&!showI)||(l.door&&showI)) continue; out.push({k:"line",a:[X(l.x1),Y(l.y1)],b:[X(l.x2),Y(l.y2)],col,lw:l.lw||.8,dash:l.dash}) }
  if(m.dims){
    const h=P.textH, o=h*2.4, dc=layer("cotas").color;
    const bl=[m.x,m.y+m.H], br=[m.x+m.W,m.y+m.H], tl=[m.x,m.y];
    out.push(...dimPrims(bl,br,o,dc,h,1));
    out.push(...dimPrims(bl,tl,-o,dc,h,1));
    if(g.secs.length>1) for(const s of g.secs) out.push(...dimPrims([X(s.a),m.y],[X(s.b),m.y],-o*.85,dc,h*.85,1));
  }
  return out;
}
function buildPrims(it){
  const col=itemCol(it), lw=it.lw||1.4;
  switch(it.t){
    case "line": return [{k:"line",a:it.a,b:it.b,col,lw,snap:1}];
    case "rect":{const [x0,y0]=it.a,[x1,y1]=it.b; return [{k:"poly",pts:[[x0,y0],[x1,y0],[x1,y1],[x0,y1]],close:1,col,lw,snap:1,fill:+it.dep>0?SOLID:null}]}
    case "circle": return [{k:"circle",c:it.c,r:it.r,col,lw,snap:1}];
    case "free": return [{k:"path",pts:it.pts,col,lw}];
    case "text": return String(it.s).split("\n").map((ln,i)=>({k:"text",p:[it.p[0],it.p[1]+i*it.h*1.25],s:ln,h:it.h,ang:0,col,align:"left",base:"top"}));
    case "dim": return dimPrims(it.a,it.b,it.off||0,col,it.h||P.textH,it.lw||1);
    case "mod": return modPrims(it,col);
  }
  return [];
}
function textW(pr){return String(pr.s).length*pr.h*.56}
function primBounds(pr,bb){
  const add=p=>{bb[0]=Math.min(bb[0],p[0]);bb[1]=Math.min(bb[1],p[1]);bb[2]=Math.max(bb[2],p[0]);bb[3]=Math.max(bb[3],p[1])};
  if(pr.k==="line"){add(pr.a);add(pr.b)}
  else if(pr.k==="poly"||pr.k==="path") pr.pts.forEach(add);
  else if(pr.k==="circle"){add([pr.c[0]-pr.r,pr.c[1]-pr.r]);add([pr.c[0]+pr.r,pr.c[1]+pr.r])}
  else if(pr.k==="text"){
    const w=textW(pr), ca=Math.cos(pr.ang||0), sa=Math.sin(pr.ang||0);
    const x0=pr.align==="center"?-w/2:0, y0=pr.base==="top"?0:pr.base==="bottom"?-pr.h:-pr.h/2;
    for(const [dx,dy] of [[x0,y0],[x0+w,y0],[x0,y0+pr.h],[x0+w,y0+pr.h]]) add([pr.p[0]+dx*ca-dy*sa,pr.p[1]+dx*sa+dy*ca]);
  }
  return bb;
}
function itemBounds(it){const bb=[Infinity,Infinity,-Infinity,-Infinity]; for(const pr of prims(it)) primBounds(pr,bb); return bb}
const visible=it=>{const L=layer(it.layer);return L&&L.visible};
const editable=it=>{const L=layer(it.layer);return L&&L.visible&&!L.locked};
function sceneBounds(items){const bb=[Infinity,Infinity,-Infinity,-Infinity]; for(const it of items||P.items) if(visible(it)) for(const pr of prims(it)) primBounds(pr,bb); return isFinite(bb[0])?bb:null}

function segDist(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy;let t=l?((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l:0;t=clamp(t,0,1);return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)}
function hitItem(it,w,tol){
  if(it.t==="mod"){const b=itemBounds(it), x0=it.x,y0=it.y; return w[0]>=x0-tol&&w[0]<=x0+it.W+tol&&w[1]>=y0-tol&&w[1]<=y0+it.H+tol}
  for(const pr of prims(it)){
    if(pr.k==="line"&&segDist(w,pr.a,pr.b)<tol) return true;
    if(pr.k==="poly"){const p=pr.pts; for(let i=0;i<p.length;i++){const j=(i+1)%p.length; if(!pr.close&&j===0) break; if(segDist(w,p[i],p[j])<tol) return true}}
    if(pr.k==="path"){for(let i=1;i<pr.pts.length;i++) if(segDist(w,pr.pts[i-1],pr.pts[i])<tol) return true}
    if(pr.k==="circle"&&Math.abs(dist(w,pr.c)-pr.r)<tol) return true;
    if(pr.k==="text"){const bb=primBounds(pr,[Infinity,Infinity,-Infinity,-Infinity]); if(w[0]>=bb[0]-tol&&w[0]<=bb[2]+tol&&w[1]>=bb[1]-tol&&w[1]<=bb[3]+tol) return true}
  }
  return false;
}
function keyPts(pr){
  const o=[];
  if(pr.k==="line"){o.push([pr.a,"end"],[pr.b,"end"],[[(pr.a[0]+pr.b[0])/2,(pr.a[1]+pr.b[1])/2],"mid"])}
  else if(pr.k==="poly"){const p=pr.pts; for(let i=0;i<p.length;i++){o.push([p[i],"end"]); const j=(i+1)%p.length; if(pr.close||j) o.push([[(p[i][0]+p[j][0])/2,(p[i][1]+p[j][1])/2],"mid"])}}
  else if(pr.k==="circle"){o.push([pr.c,"center"]); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) o.push([[pr.c[0]+dx*pr.r,pr.c[1]+dy*pr.r],"quad"])}
  return o;
}
function translate(it,dx,dy){
  const mv=p=>[p[0]+dx,p[1]+dy];
  if(it.a) it.a=mv(it.a); if(it.b) it.b=mv(it.b); if(it.c) it.c=mv(it.c);
  if(it.p) it.p=mv(it.p); if(it.pts) it.pts=it.pts.map(mv);
  if(it.t==="mod"){it.x+=dx;it.y+=dy}
}
function rotate90(it){
  const bb=itemBounds(it), cx=(bb[0]+bb[2])/2, cy=(bb[1]+bb[3])/2, r=p=>[cx-(p[1]-cy),cy+(p[0]-cx)];
  if(it.t==="mod") return false;
  if(it.a) it.a=r(it.a); if(it.b) it.b=r(it.b); if(it.c) it.c=r(it.c); if(it.pts) it.pts=it.pts.map(r);
  if(it.t==="text") return false;
  return true;
}

