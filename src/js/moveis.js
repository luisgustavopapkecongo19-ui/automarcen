/* ===================== desenho → móvel ===================== */
const isOutline=i=>(i.t==="rect"||i.t==="line")&&i.layer!=="cotas"&&i.layer!=="anot";
const hasDrawing=()=>P.items.some(i=>isOutline(i)&&visible(i));
function convCandidates(){
  const items=selItems().filter(isOutline); if(!items.length) return null;
  let all=items;
  if(items.length===1&&items[0].t==="rect"){
    const r=items[0], bx=[Math.min(r.a[0],r.b[0]),Math.min(r.a[1],r.b[1]),Math.max(r.a[0],r.b[0]),Math.max(r.a[1],r.b[1])], tol=.6;
    all=all.concat(P.items.filter(i=>i!==r&&editable(i)&&isOutline(i)&&(b=>b[0]>=bx[0]-tol&&b[2]<=bx[2]+tol&&b[1]>=bx[1]-tol&&b[3]<=bx[3]+tol)(itemBounds(i))));
  }
  const segs=[];
  for(const it of all){ if(it.t==="line") segs.push([it.a,it.b]); else {const [x0,y0]=it.a,[x1,y1]=it.b; segs.push([[x0,y0],[x1,y0]],[[x1,y0],[x1,y1]],[[x1,y1],[x0,y1]],[[x0,y1],[x0,y0]])} }
  const bb=[Infinity,Infinity,-Infinity,-Infinity];
  for(const sg of segs) for(const q of sg){bb[0]=Math.min(bb[0],q[0]);bb[1]=Math.min(bb[1],q[1]);bb[2]=Math.max(bb[2],q[0]);bb[3]=Math.max(bb[3],q[1])}
  const W=bb[2]-bb[0], H=bb[3]-bb[1]; if(!(W>=15&&H>=15)) return null;
  // precisa de um contorno: as quatro bordas desenhadas
  const tol=Math.max(.6,Math.min(W,H)*.012);
  const cover=(fix,ax,v,lo,hi)=>{let len=0; for(const [a,b] of segs){ if(Math.abs(a[fix]-v)<tol&&Math.abs(b[fix]-v)<tol){const s0=Math.max(lo,Math.min(a[ax],b[ax])),s1=Math.min(hi,Math.max(a[ax],b[ax])); if(s1>s0) len+=s1-s0} } return len>=(hi-lo)*.8};
  if(!(cover(0,1,bb[0],bb[1],bb[3])&&cover(0,1,bb[2],bb[1],bb[3])&&cover(1,0,bb[1],bb[0],bb[2])&&cover(1,0,bb[3],bb[0],bb[2]))) return null;
  return {items:all,segs,bb,W,H,tol};
}
function analyzeConv(c){
  const {segs,bb,W,H,tol}=c;
  const onEdge=(a,b)=>[[0,bb[0]],[0,bb[2]],[1,bb[1]],[1,bb[3]]].some(([k,v])=>Math.abs(a[k]-v)<tol&&Math.abs(b[k]-v)<tol);
  const V=[],Hs=[];
  for(const [a,b] of segs){ if(onEdge(a,b)) continue; const dx=Math.abs(b[0]-a[0]),dy=Math.abs(b[1]-a[1]);
    if(dx<=Math.max(tol,dy*.08)) V.push({x:(a[0]+b[0])/2,y0:Math.min(a[1],b[1]),y1:Math.max(a[1],b[1])});
    else if(dy<=Math.max(tol,dx*.08)) Hs.push({y:(a[1]+b[1])/2,x0:Math.min(a[0],b[0]),x1:Math.max(a[0],b[0])}) }
  let plinth=0;
  for(const h of Hs){const d=bb[3]-h.y; if(d>=3&&d<=20&&(h.x1-h.x0)>=.7*W) plinth=Math.max(plinth,d)}
  const top=bb[1], bottom=bb[3]-plinth;
  const xs=V.filter(v=>Math.min(v.y1,bottom)-Math.max(v.y0,top)>=.45*(bottom-top)&&v.x>bb[0]+3&&v.x<bb[2]-3).map(v=>v.x).sort((p,q)=>p-q);
  const div=[]; for(const x of xs) if(!div.length||x-div[div.length-1]>4) div.push(x);
  const bounds=[bb[0],...div,bb[2]], t=(+P.mat.caixa.t||18)/10, secs=[];
  for(let i=0;i<bounds.length-1;i++){
    const a=bounds[i], b=bounds[i+1], sw=b-a;
    const ys=[]; Hs.filter(h=>h.y>top+4&&h.y<bottom-4&&Math.min(h.x1,b)-Math.max(h.x0,a)>=.6*sw).map(h=>h.y).sort((p,q)=>p-q).forEach(y=>{if(!ys.length||y-ys[ys.length-1]>4) ys.push(y)});
    const inW=sw-(i===0?t:t/2)-(i===bounds.length-2?t:t/2);
    const edges=[bottom,...[...ys].sort((p,q)=>q-p),top], hs=[]; for(let j=0;j<edges.length-1;j++) hs.push(+(edges[j]-edges[j+1]).toFixed(1));
    secs.push(ys.length?(ys.length<=7?{w:+inW.toFixed(1),type:"gavetas",n:ys.length+1,hs}:{w:+inW.toFixed(1),type:"gavetas",n:8}):{w:+inW.toFixed(1),type:inW>65?"porta2":"porta",n:H>150?4:1});
  }
  secs[secs.length-1].w=0;
  const elev=Math.max(0,+(-bb[3]).toFixed(1));
  const kind=H>=150?"armario":elev>=100?"aereo":"balcao";
  return {x:bb[0],W:+W.toFixed(1),H:+H.toFixed(1),elev,plinth:+(plinth||(elev<5&&kind!=="aereo"?0:0)).toFixed(1),secs,
    D:kind==="armario"?55:kind==="aereo"?35:55,name:kind==="armario"?"Armário":kind==="aereo"?"Aéreo":"Balcão"};
}
function convBlock(){return `<div class="callout"><b>É um armário?</b><span class="note">Transforme este desenho em móvel 3D, com lista de peças, plano de corte e orçamento.</span><button class="btn pri" data-a="conv" style="justify-self:start">Gerar móvel</button></div>`}
function convFromDrawing(){
  if(!convCandidates()){
    const ids=P.items.filter(i=>isOutline(i)&&editable(i)).map(i=>i.id);
    if(ids.length){sel=new Set(ids); renderPanel(); updCtx(); draw()}
  }
  if(convCandidates()) return showConvert();
  setTool("select");
  toast("Toque no retângulo do contorno do armário e depois em Gerar móvel");
}
function showConvert(){
  const c=convCandidates();
  if(!c) return toast("Selecione o contorno do armário (um retângulo ou quatro linhas fechadas)");
  const a=analyzeConv(c);
  const desc=a.secs.map(x=>x.type==="gavetas"?`${x.n} gavetas`:SEC_TYPES[x.type].toLowerCase()).join(", ");
  const field=(id,v)=>uIn("x",toU(v)).replace('data-k="x"',`id="${id}"`);
  dlg(`<h2>Gerar móvel do desenho</h2>
    <p>Encontrei um móvel de <b>${fmtL(a.W)} × ${fmtL(a.H)} ${P.unit}</b> com ${a.secs.length} vão${a.secs.length>1?"s":""}: ${esc(desc)}.${a.plinth?` Rodapé de ${fmtL(a.plinth)} ${P.unit}.`:""}</p>
    <div class="r2"><label class="f"><span class="lb">Nome</span><input class="in" id="cvN" value="${esc(a.name)}" maxlength="40"></label>
      <label class="f"><span class="lb">Profundidade</span>${field("cvD",a.D)}</label></div>
    <div class="r2"><label class="f"><span class="lb">Rodapé</span>${field("cvP",a.plinth)}</label>
      <label class="f"><span class="lb">Altura do piso</span>${field("cvE",a.elev)}</label></div>
    <label class="chk"><input type="checkbox" id="cvDel" checked> Substituir as linhas do desenho pelo móvel</label>
    <p class="note">Linhas verticais viram divisões; linhas horizontais dentro de um vão viram gavetas. Depois ajuste portas, gavetas, prateleiras e acabamento no painel do móvel.</p>
    <div class="row act"><button class="btn ghost" data-x>Cancelar</button><button class="btn pri" data-ok>Gerar móvel</button></div>`,el=>{
    $("[data-x]",el).onclick=closeDlg;
    $("[data-ok]",el).onclick=()=>{
      const g=id=>parseN($(id,el).value)/U();
      const D=g("#cvD"), pl=Math.max(0,g("#cvP")||0), E=Math.max(0,g("#cvE")||0);
      if(!(D>=10)) return toast("Informe a profundidade (mínimo 10 cm)");
      if(pl>=a.H/2) return toast("O rodapé está maior que metade da altura");
      pushUndo();
      if($("#cvDel",el).checked){const ids=new Set(c.items.map(i=>i.id)); P.items=P.items.filter(i=>!ids.has(i.id))}
      const m=makeModule("livre",{name:$("#cvN",el).value.trim()||a.name,W:a.W,H:a.H,D,plinth:pl,x:a.x,elev:E,secs:a.secs,fb:0,ff:4});
      P.items.push(m); sel=new Set([m.id]); closeDlg(); setTool("select"); afterEdit(); updCtx();
      toast("Móvel gerado. Veja na aba 3D");
    };
  });
}

