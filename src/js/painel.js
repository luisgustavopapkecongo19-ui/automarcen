/* ===================== painel lateral ===================== */
let ptab="props";
function openPanel(t){if(t) setPtab(t); $("#side").classList.add("open"); $("#bPanel").setAttribute("aria-pressed","true")}
function closePanel(){$("#side").classList.remove("open"); $("#bPanel").setAttribute("aria-pressed","false")}
$("#bPanel").onclick=()=>$("#side").classList.contains("open")?closePanel():openPanel();
$("#bClosePanel").onclick=closePanel;
$$("[data-ptab]").forEach(b=>b.onclick=()=>setPtab(b.dataset.ptab));
function setPtab(t){ptab=t; $$("[data-ptab]").forEach(b=>b.setAttribute("aria-selected",b.dataset.ptab===t)); renderPanel()}

const uIn=(k,v,extra="")=>`<div class="unit"><input class="in n" data-k="${k}" value="${v}" inputmode="decimal" ${extra}><em>${P.unit}</em></div>`;
const toU=cm=>P.unit==="mm"?Math.round(cm*10):+(+cm).toFixed(2);
function swatches(cur,key){
  return `<div class="sws">
    <button class="sw layer" data-${key}="layer" aria-pressed="${cur==="layer"}" title="Cor da camada" aria-label="Cor da camada"></button>
    ${INKS.map(([c,n])=>`<button class="sw${c==="auto"?" auto":""}" ${c!=="auto"?`style="background:${c}"`:""} data-${key}="${c}" aria-pressed="${cur===c}" title="${n}" aria-label="${n}"></button>`).join("")}
    <label class="sw custom" title="Outra cor"><input type="color" data-${key}c="1" value="${/^#/.test(cur)?cur:"#ff5a1f"}" aria-label="Escolher outra cor"></label>
  </div>`;
}
const LW=[[.8,"Fina"],[1.4,"Média"],[2.4,"Grossa"]];
const lwSeg=(cur,key)=>`<div class="seg">${LW.map(([v,n])=>`<button data-${key}="${v}" aria-pressed="${Math.abs((cur||1.4)-v)<.01}">${n}</button>`).join("")}</div>`;
const layerSel=(cur,k)=>`<select class="in" data-k="${k}">${P.layers.map(l=>`<option value="${l.id}"${l.id===cur?" selected":""}>${esc(l.name)}</option>`).join("")}</select>`;

function renderPanel(){
  const pb=$("#pbody");
  const one=selItems().length===1?selItems()[0]:null; if(!one||one.id!==intOpen.mid) intOpen={mid:null,i:-1};
  if(ptab==="layers"){pb.innerHTML=layersHTML(); return}
  const items=selItems();
  if(!items.length) pb.innerHTML=docHTML();
  else if(items.length>1) pb.innerHTML=multiHTML(items);
  else pb.innerHTML=itemHTML(items[0]);
}
function docHTML(){
  const mods=P.items.filter(i=>i.t==="mod").length;
  return `<div class="ph"><h3>Desenho</h3><span class="tag">${P.items.length} objetos</span></div>
  <div class="grp"><span class="lb">Ao desenhar</span>
    <div class="f"><span class="lb" style="text-transform:none;letter-spacing:0;font-weight:500">Camada atual</span>${layerSel(P.curLayer,"curLayer")}</div>
    <div class="f"><span class="note">Cor</span>${swatches(curCol,"cc")}</div>
    <div class="f"><span class="note">Espessura</span>${lwSeg(curLw,"clw")}</div>
  </div>
  <div class="grp"><span class="lb">Unidades e grade</span>
    <div class="seg">${["cm","mm"].map(u=>`<button data-unit="${u}" aria-pressed="${P.unit===u}">${u==="cm"?"Centímetros":"Milímetros"}</button>`).join("")}</div>
    <div class="r2">
      <label class="f"><span class="note">Grade</span><select class="in" data-k="grid">${[1,5,10].map(g=>`<option value="${g}"${g===P.grid?" selected":""}>${P.unit==="mm"?g*10+" mm":g+" cm"}</option>`).join("")}</select></label>
      <label class="f"><span class="note">Texto das cotas</span>${uIn("textH",toU(P.textH))}</label>
    </div>
  </div>
  <div class="grp"><span class="lb">Marcenaria</span>
    <p class="note">${mods?`${mods} móve${mods>1?"is":"l"} no projeto. Selecione um para editar vãos, portas, gavetas e acabamentos.`:"Insira um móvel paramétrico para gerar o 3D, a lista de peças, o plano de corte e o orçamento."}</p>
    <button class="btn pri" data-a="insert">Inserir móvel</button>
  </div>
  <div class="grp"><span class="lb">Ajuda</span>
    <p class="note">Tire dúvidas escrevendo do seu jeito, ou veja o passo a passo com imagens no guia.</p>
    <div class="row" style="justify-content:flex-start"><button class="btn pri" data-a="chat">Tirar dúvidas</button><a class="btn" href="https://claude.ai/artifact/LoxsKJPStynxu7bheZw574" target="_blank" rel="noopener" style="text-decoration:none;color:inherit">Abrir o guia</a></div>
  </div>
  <div class="grp"><span class="lb">Atalhos</span>
    <p class="note">V selecionar · L linha · R retângulo · C círculo · D cota · T texto · M medir · N móvel · Z ajustar · F8 orto · F3 encaixe · Enter conclui · Esc cancela. Na linha, digite <b>147</b> ou <b>147&lt;90</b> para comprimento e ângulo.</p>
  </div>`;
}
function multiHTML(items){
  return `<div class="ph"><h3>${items.length} objetos</h3><span class="tag">seleção</span></div>
  ${!items.some(i=>i.t==="mod")&&convCandidates()?convBlock():""}
  <label class="f"><span class="lb">Camada</span>${layerSel("", "mLayer").replace('<select','<select data-placeholder="1"').replace(">",">"+'<option value="" selected disabled>Mover para…</option>')}</label>
  <div class="f"><span class="lb">Cor</span>${swatches("","mcol")}</div>
  <div class="f"><span class="lb">Espessura</span>${lwSeg(0,"mlw")}</div>
  <div class="row" style="justify-content:flex-start"><button class="btn" data-a="dup">Duplicar</button><button class="btn del" data-a="del">Excluir</button></div>`;
}
function itemHTML(it){
  const names={line:"Linha",rect:"Retângulo",circle:"Círculo",dim:"Cota",text:"Texto",free:"Traço livre",mod:"Móvel"};
  let body="";
  if(it.t==="line"){const L=dist(it.a,it.b); body=`<div class="r2"><label class="f"><span class="lb">Comprimento</span>${uIn("len",toU(L))}</label><label class="f"><span class="lb">Ângulo</span><div class="unit"><input class="in n" data-k="ang" value="${num(angDeg(it.a,it.b),2).replace(/\./g,"")}" inputmode="decimal"><em>°</em></div></label></div>
    <div class="r2"><label class="f"><span class="lb">Início X</span>${uIn("ax",toU(it.a[0]))}</label><label class="f"><span class="lb">Início Y</span>${uIn("ay",toU(-it.a[1]))}</label></div>`}
  if(it.t==="rect"){const w=Math.abs(it.b[0]-it.a[0]),h=Math.abs(it.b[1]-it.a[1]); body=`<div class="r2"><label class="f"><span class="lb">Largura</span>${uIn("rw",toU(w))}</label><label class="f"><span class="lb">Altura</span>${uIn("rh",toU(h))}</label></div><p class="note">Área ${num(w*h/10000,3)} m²</p>
    <label class="f"><span class="lb">Profundidade no 3D</span>${uIn("dep",toU(+it.dep||0))}</label>
    <p class="note">${+it.dep>0?(+it.dep<=5?"Aparece no 3D como painel e entra na lista de peças.":"Aparece no 3D como volume. Para ter portas, gavetas e peças, use Gerar móvel."):"0 = só linha na parede. Com profundidade, vira painel (até 5 cm, entra na lista de peças) ou volume no 3D."}</p>`}
  if(it.t==="circle") body=`<div class="r2"><label class="f"><span class="lb">Raio</span>${uIn("cr",toU(it.r))}</label><label class="f"><span class="lb">Diâmetro</span>${uIn("cd",toU(it.r*2))}</label></div>`;
  if(it.t==="dim") body=`<div class="kv"><span>Medida</span><b>${fmtLU(dist(it.a,it.b))}</b></div><div class="r2"><label class="f"><span class="lb">Afastamento</span>${uIn("off",toU(it.off||0))}</label><label class="f"><span class="lb">Altura do texto</span>${uIn("th",toU(it.h||P.textH))}</label></div>`;
  if(it.t==="text") body=`<label class="f"><span class="lb">Texto</span><textarea class="in" data-k="txt" rows="3">${esc(it.s)}</textarea></label><label class="f"><span class="lb">Altura do texto</span>${uIn("th",toU(it.h))}</label>`;
  if(it.t==="mod") return modHTML(it);
  return `<div class="ph"><h3>${names[it.t]}</h3><span class="tag">${esc(layer(it.layer).name)}</span></div>
  ${it.t==="rect"&&convCandidates()?convBlock():""}
  ${body}
  <label class="f"><span class="lb">Camada</span>${layerSel(it.layer,"layer")}</label>
  <div class="f"><span class="lb">Cor</span>${swatches(it.col,"icol")}</div>
  <div class="f"><span class="lb">Espessura</span>${lwSeg(it.lw,"ilw")}</div>
  <div class="row" style="justify-content:flex-start"><button class="btn" data-a="dup">Duplicar</button><button class="btn del" data-a="del">Excluir</button></div>`;
}
function modHTML(m){
  const g=modGeom(m), hw=g.hw, pc=g.parts.reduce((a,p)=>a+p.q,0), elev=-(m.y+m.H);
  return `<div class="ph"><h3>${esc(m.name)}</h3><span class="tag">móvel</span></div>
  <label class="f"><span class="lb">Nome</span><input class="in" data-k="name" value="${esc(m.name)}" maxlength="40"></label>
  <div class="grp"><span class="lb">Dimensões externas</span>
    <div class="r3"><label class="f"><span class="note">Largura</span>${uIn("W",toU(m.W))}</label><label class="f"><span class="note">Altura</span>${uIn("H",toU(m.H))}</label><label class="f"><span class="note">Profund.</span>${uIn("D",toU(m.D))}</label></div>
    <div class="r2"><label class="f"><span class="note">Rodapé</span>${uIn("plinth",toU(m.plinth))}</label><label class="f"><span class="note">Altura do piso</span>${uIn("elev",toU(elev))}</label></div>
  </div>
  <div class="grp"><span class="lb">Vãos (esquerda → direita)</span>
    <div class="secs">${m.secs.map((s,i)=>`<div class="sec">
      <span class="k">${i+1}</span>
      <input class="in n" data-sec="${i}" data-sk="w" value="${+s.w>0?toU(s.w):""}" placeholder="auto" inputmode="decimal" aria-label="Largura do vão ${i+1}">
      <select class="in" data-sec="${i}" data-sk="type" aria-label="Tipo do vão ${i+1}">${Object.entries(SEC_TYPES).map(([k,v])=>`<option value="${k}"${k===s.type?" selected":""}>${v}</option>`).join("")}</select>
      <input class="in n" data-sec="${i}" data-sk="n" ${!isDrw(s)&&Array.isArray(s.int)&&s.int.length?'value="" disabled placeholder="—"':`value="${s.n??(s.type==="gavetas"?3:s.type==="pgav"?2:1)}"`} inputmode="numeric" title="${isDrw(s)?"Número de gavetas":"Número de prateleiras"}" aria-label="${isDrw(s)?"Gavetas":"Prateleiras"} no vão ${i+1}">
      <button class="ib" data-secdel="${i}" aria-label="Remover vão ${i+1}" ${m.secs.length<2?"disabled":""}><svg class="i" viewBox="0 0 24 24" style="width:16px;height:16px"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
    </div>${secExtra(s,i,g)}${!isDrw(s)?intRow(s,i):""}${s.type==="porta"||(s.type==="pgav"&&secLeaves(s,g,i)===1)?`<div class="sec" style="margin-top:-2px"><span></span><span class="note" style="grid-column:2/4">Dobradiça do lado</span><div class="seg" style="grid-column:4/6;padding:2px">${["E","D"].map(h=>`<button data-sec="${i}" data-hinge="${h}" aria-pressed="${(s.hinge||(g.secs[i]&&(g.secs[i].a+g.secs[i].w/2)<g.W/2?"E":"D"))===h}" style="padding:3px 0">${h}</button>`).join("")}</div></div>`:""}`).join("")}</div>
    <p class="note">Largura do vão interno em ${P.unit}; deixe vazio para dividir automaticamente. O último campo é a quantidade de gavetas ou prateleiras. Para cabide, gavetas internas e maleiro, use <b>Editar interior</b>.</p>
    ${g.warn?`<p class="warn">${esc(g.warn)}</p>`:""}
    <button class="btn sm" data-a="addsec" style="justify-self:start">+ Adicionar vão</button>
  </div>
  <div class="grp"><span class="lb">Puxador</span><div class="seg">${PULLS.map(([k,l])=>`<button data-pull="${k}" aria-pressed="${(m.pull||"barra")===k}">${l}</button>`).join("")}</div><span class="note">${{barra:"Puxador de barra, conta no orçamento por unidade.",botao:"Puxador de botão, conta por unidade.",perfil:"Perfil de alumínio na borda da frente, conta por metro.",cava:"Cava usinada na frente, sem ferragem.",nenhum:"Sem puxador: fecho toque (abre ao empurrar), conta por unidade."}[m.pull||"barra"]}</span></div>
  <div class="grp"><span class="lb">Acabamento da caixa</span><div class="fin">${FIN.map((f,i)=>`<button style="background:${finBg(f)}" data-fb="${i}" aria-pressed="${m.fb===i}" title="${f[0]}" aria-label="${f[0]}"></button>`).join("")}</div><span class="note">${FIN[m.fb]?.[0]||""}</span></div>
  <div class="grp"><span class="lb">Acabamento das frentes</span><div class="fin">${FIN.map((f,i)=>`<button style="background:${finBg(f)}" data-ff="${i}" aria-pressed="${m.ff===i}" title="${f[0]}" aria-label="${f[0]}"></button>`).join("")}</div><span class="note">${FIN[m.ff]?.[0]||""}</span></div>
  <div class="seg"><button data-dims="1" aria-pressed="${!!m.dims}">Cotas automáticas</button><button data-dims="0" aria-pressed="${!m.dims}">Sem cotas</button></div>
  <div class="grp"><span class="lb">Resumo</span><div class="kv">
    <span>Peças</span><b>${pc}</b><span>Dobradiças</span><b>${hw.hinge}</b><span>Corrediças (par)</span><b>${hw.slide}</b><span>Puxadores</span><b>${hw.pull}</b>${hw.rod?`<span>Tubo de cabide</span><b>${num(hw.rod,2)} m</b>`:""}
  </div></div>
  <div class="row" style="justify-content:flex-start"><button class="btn pri" data-a="3d">Ver em 3D</button><button class="btn" data-a="dup">Duplicar</button><button class="btn del" data-a="del">Excluir</button></div>`;
}
function secLabel(s){
  const n=+s.n, it=Array.isArray(s.int)&&s.int.length?` (${intSummary(s)})`:"";
  if(s.type==="gavetas") return `${n||3} gavetas`;
  if(s.type==="pgav") return `porta sobre ${n||2} gaveta${(n||2)>1?"s":""}`;
  if(s.type==="correr") return `${clamp(+s.lv||2,2,3)} portas de correr`+it;
  return (s.type==="nicho"?"nicho":s.type==="porta2"?"porta dupla":"porta")+it;
}
const isDrw=s=>s.type==="gavetas"||s.type==="pgav";
function secLeaves(s,g,i){if(s.type==="correr") return clamp(+s.lv||2,2,3); const sc=g.secs[i]; return +s.lv||(sc&&sc.w>650?2:1)}
function secExtra(s,i,g){
  const lv=secLeaves(s,g,i);
  const seg=(opts)=>`<div class="seg" style="grid-column:4/6;padding:2px">${opts.map(v=>`<button data-sec="${i}" data-lv="${v}" aria-pressed="${lv===v}" style="padding:3px 0">${v}</button>`).join("")}</div>`;
  if(s.type==="pgav") return `<div class="sec" style="margin-top:-2px"><span></span><span class="note" style="grid-column:2/3">Altura das gavetas</span><input class="in n" data-sec="${i}" data-sk="gh" value="${+s.gh>0?toU(s.gh):""}" placeholder="auto" inputmode="decimal" aria-label="Altura do bloco de gavetas no vão ${i+1}"><span></span><span></span></div>
    <div class="sec" style="margin-top:-2px"><span></span><span class="note" style="grid-column:2/4">Folhas da porta</span>${seg([1,2])}</div>`;
  if(s.type==="correr") return `<div class="sec" style="margin-top:-2px"><span></span><span class="note" style="grid-column:2/4">Folhas de correr</span>${seg([2,3])}</div>`;
  return "";
}
const PULLS=[["barra","Barra"],["botao","Botão"],["perfil","Perfil"],["cava","Cava"],["nenhum","Toque"]];
function layersHTML(){
  return `<div class="ph"><h3>Camadas</h3><button class="btn sm" data-a="newlayer">+ Nova</button></div>
  <div class="layers">${P.layers.map(l=>`<div class="lay${l.id===P.curLayer?" cur":""}">
    <span class="dot" style="background:${l.color==="auto"?"var(--cv-ink)":l.color}">${l.color!=="auto"?`<input type="color" data-lcol="${l.id}" value="${l.color}" aria-label="Cor da camada ${esc(l.name)}">`:""}</span>
    <button class="nm" data-lcur="${l.id}" title="Usar como camada atual">${esc(l.name)}</button>
    <button class="ib" data-lvis="${l.id}" aria-pressed="${l.visible}" aria-label="${l.visible?"Ocultar":"Mostrar"} ${esc(l.name)}"><svg class="i" viewBox="0 0 24 24" style="width:17px;height:17px">${l.visible?'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>':'<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/>'}</svg></button>
    <button class="ib" data-llock="${l.id}" aria-pressed="${!l.locked}" aria-label="${l.locked?"Destravar":"Travar"} ${esc(l.name)}"><svg class="i" viewBox="0 0 24 24" style="width:17px;height:17px"><rect x="5" y="11" width="14" height="10" rx="2"/>${l.locked?'<path d="M8 11V7a4 4 0 0 1 8 0v4"/>':'<path d="M8 11V7a4 4 0 0 1 7.5-2"/>'}</svg></button>
  </div>`).join("")}</div>
  <p class="note">Toque no nome para desenhar nessa camada. Camadas travadas ficam visíveis mas não podem ser selecionadas. As cotas vão para Cotas e os textos para Anotações quando a camada atual é Estrutura.</p>`;
}

/* interior dos vãos */
const INT_PRESETS=[
  {name:"Roupeiro",z:[{t:"gavetas",h:54,n:3},{t:"cabide",h:0},{t:"prat",h:40,n:0}]},
  {name:"Cabide longo",z:[{t:"cabide",h:0},{t:"prat",h:40,n:0}]},
  {name:"Cabide duplo",z:[{t:"cabide",h:0},{t:"cabide",h:0},{t:"prat",h:40,n:0}]},
  {name:"Gavetas + prateleiras",z:[{t:"gavetas",h:54,n:3},{t:"prat",h:0,n:3}]},
  {name:"Só prateleiras",z:[{t:"prat",h:0,n:4}]}
];
const ZT={prat:"Prateleiras",cabide:"Cabideiro",gavetas:"Gavetas internas"};
let intOpen={mid:null,i:-1};
function intSummary(s){
  if(!Array.isArray(s.int)||!s.int.length){const q=s.n===undefined||s.n===""?(s.type==="nicho"?0:1):(+s.n||0); return q?`${q} prateleira${q>1?"s":""}`:"vazio"}
  const Z=[...s.int].reverse();
  return Z.map((z,ri)=>z.t==="cabide"?"cabideiro":z.t==="gavetas"?`${z.n||2} gavetas internas`:(+z.n?`${z.n} prateleira${z.n>1?"s":""}`:(ri===0&&Z.length>1?"maleiro":"espaço livre"))).join(" · ");
}
function intRow(s,i){
  const m=selItems()[0], open=m&&intOpen.mid===m.id&&intOpen.i===i;
  return `<div class="introw"><span class="note">Interior: <b>${esc(intSummary(s))}</b></span><button class="btn sm${open?"":" pri"}" data-intopen="${i}">${open?"Fechar":"Editar interior"}</button></div>${open?intEditor(s,i):""}`;
}
function intEditor(s,i){
  const Z=Array.isArray(s.int)?s.int:[], rows=Z.map((z,zi)=>({z,zi})).reverse();
  return `<div class="intbox">
    <span class="lb">Modelos prontos</span>
    <div class="pills">${INT_PRESETS.map((p2,k)=>`<button class="pill" data-intpre="${i}:${k}">${p2.name}</button>`).join("")}</div>
    <span class="lb">Zonas, de cima para baixo</span>
    ${rows.length?rows.map(({z,zi},ri)=>`<div class="zrow">
      <select class="in" data-zi="${i}:${zi}" data-zk="t" aria-label="Tipo da zona">${Object.entries(ZT).map(([k,v])=>`<option value="${k}"${k===z.t?" selected":""}>${v}</option>`).join("")}</select>
      <div class="unit"><input class="in n" data-zi="${i}:${zi}" data-zk="h" value="${+z.h>0?toU(z.h):""}" placeholder="auto" inputmode="decimal" aria-label="Altura da zona"><em>${P.unit}</em></div>
      <input class="in n" data-zi="${i}:${zi}" data-zk="n" value="${z.t==="cabide"?"":(+z.n||0)}" ${z.t==="cabide"?"disabled placeholder='—'":""} inputmode="numeric" title="${z.t==="gavetas"?"Quantidade de gavetas":"Quantidade de prateleiras (0 = espaço livre)"}" aria-label="Quantidade">
      <button class="ib" data-zdel="${i}:${zi}" aria-label="Remover zona"><svg class="i" viewBox="0 0 24 24" style="width:16px;height:16px"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
    </div>`).join(""):`<p class="note">Sem zonas: o vão usa ${esc(intSummary(s))}. Escolha um modelo pronto ou adicione zonas.</p>`}
    <div class="row" style="justify-content:flex-start"><button class="btn sm" data-zadd="${i}">+ Zona no topo</button>${Z.length?`<button class="btn sm ghost" data-intclear="${i}">Tirar zonas</button>`:""}</div>
    <p class="note">Altura vazia = automática. Entre uma zona e outra entra uma prateleira fixa. No cabideiro, o tubo fica 6 cm abaixo do topo da zona. Prateleiras com quantidade 0 deixam o espaço livre (maleiro, no topo). Gavetas internas ficam 2,5 cm recuadas para não bater nas dobradiças.</p>
  </div>`;
}
function setShowInt(v,msg){ if(!!P.showInt===v) return; P.showInt=v; $("#tInt").setAttribute("aria-pressed",v); touch(); draw(); queueSave(); if(msg) toast(v?"Mostrando o interior: as portas ficam tracejadas":"Mostrando a frente com as portas") }

/* eventos do painel */
const pb=$("#pbody");
pb.addEventListener("click",e=>{
  const t=e.target.closest("button"); if(!t) return; const d=t.dataset;
  const one=selItems().length===1?selItems()[0]:null;
  if(d.a==="insert") return showInsert();
  if(d.a==="chat") return openHelp();
  if(d.a==="conv") return showConvert();
  if(d.a==="dup") return dupSel();
  if(d.a==="del") return delSel();
  if(d.a==="3d") return setView("3d");
  if(d.a==="newlayer") return askLayer();
  if(d.a==="addsec"&&one){pushUndo(); one.secs.push({w:0,type:"porta",n:1}); return afterEdit()}
  if(d.secdel!==undefined&&one){pushUndo(); one.secs.splice(+d.secdel,1); return afterEdit()}
  if(d.hinge&&one){pushUndo(); one.secs[+d.sec].hinge=d.hinge; return afterEdit()}
  if(d.lv&&one){pushUndo(); one.secs[+d.sec].lv=+d.lv; return afterEdit()}
  if(d.pull&&one){pushUndo(); one.pull=d.pull; return afterEdit()}
  if(d.intopen!==undefined&&one){const i=+d.intopen; if(intOpen.mid===one.id&&intOpen.i===i) intOpen={mid:null,i:-1}; else {intOpen={mid:one.id,i}; setShowInt(true,true)} return renderPanel()}
  if(d.intpre&&one){const [i,k]=d.intpre.split(":").map(Number); pushUndo(); one.secs[i].int=JSON.parse(JSON.stringify(INT_PRESETS[k].z)); setShowInt(true); return afterEdit()}
  if(d.zadd!==undefined&&one){const sc=one.secs[+d.zadd]; pushUndo(); if(!Array.isArray(sc.int)||!sc.int.length) sc.int=[{t:"prat",h:0,n:sc.n===undefined||sc.n===""?1:(+sc.n||0)}]; sc.int.push({t:"prat",h:40,n:0}); setShowInt(true); return afterEdit()}
  if(d.zdel&&one){const [i,zi]=d.zdel.split(":").map(Number); pushUndo(); one.secs[i].int.splice(zi,1); if(!one.secs[i].int.length) delete one.secs[i].int; return afterEdit()}
  if(d.intclear!==undefined&&one){pushUndo(); delete one.secs[+d.intclear].int; return afterEdit()}
  if(d.fb!==undefined&&one){pushUndo(); one.fb=+d.fb; return afterEdit()}
  if(d.ff!==undefined&&one){pushUndo(); one.ff=+d.ff; return afterEdit()}
  if(d.dims!==undefined&&one){pushUndo(); one.dims=d.dims==="1"; return afterEdit()}
  if(d.cc!==undefined){curCol=d.cc; return renderPanel()}
  if(d.clw!==undefined){curLw=+d.clw; return renderPanel()}
  if(d.unit){P.unit=d.unit; touch(); save(); updScale(); renderPanel(); draw(); return}
  if(d.icol!==undefined&&one){pushUndo(); one.col=d.icol; return afterEdit()}
  if(d.ilw!==undefined&&one){pushUndo(); one.lw=+d.ilw; return afterEdit()}
  if(d.mcol!==undefined){pushUndo(); selItems().forEach(i=>i.col=d.mcol); return afterEdit()}
  if(d.mlw!==undefined){pushUndo(); selItems().forEach(i=>i.lw=+d.mlw); return afterEdit()}
  if(d.lcur){P.curLayer=d.lcur; save(); return renderPanel()}
  if(d.lvis){const l=layer(d.lvis); l.visible=!l.visible; if(!l.visible) selItems().filter(i=>i.layer===l.id).forEach(i=>sel.delete(i.id)); touch(); save(); draw(); updCtx(); dirty3D=true; return renderPanel()}
  if(d.llock){const l=layer(d.llock); l.locked=!l.locked; if(l.locked) selItems().filter(i=>i.layer===l.id).forEach(i=>sel.delete(i.id)); save(); updCtx(); draw(); return renderPanel()}
});
pb.addEventListener("input",e=>{
  const el=e.target;
  if(el.dataset.ccc){curCol=el.value; return}
  if(el.dataset.lcol){const l=layer(el.dataset.lcol); l.color=el.value; touch(); save(); draw(); return}
});
pb.addEventListener("change",e=>{
  const el=e.target, d=el.dataset, one=selItems().length===1?selItems()[0]:null;
  const v=parseN(el.value), cm=v/U();
  if(d.ccc){curCol=el.value; return renderPanel()}
  if(d.icolc&&one){pushUndo(); one.col=el.value; return afterEdit()}
  if(d.mcolc){pushUndo(); selItems().forEach(i=>i.col=el.value); return afterEdit()}
  if(d.lcol) return renderPanel();
  if(d.k==="curLayer"){P.curLayer=el.value; save(); return}
  if(d.k==="grid"){P.grid=+el.value; updScale(); save(); draw(); return}
  if(d.k==="textH"){if(cm>0){P.textH=cm; touch(); save(); draw()} return}
  if(d.k==="mLayer"){pushUndo(); selItems().forEach(i=>i.layer=el.value); return afterEdit()}
  if(d.zi&&one){
    const [i,zi]=d.zi.split(":").map(Number), z=one.secs[i].int[zi]; pushUndo();
    if(d.zk==="t"){z.t=el.value; if(el.value==="gavetas"){z.n=Math.max(1,+z.n||3); if(!(+z.h>0)) z.h=54} if(el.value==="cabide") delete z.n}
    if(d.zk==="h") z.h=el.value.trim()===""?0:Math.max(0,cm);
    if(d.zk==="n") z.n=clamp(Math.round(v)||0,0,z.t==="gavetas"?8:12);
    return afterEdit();
  }
  if(d.sec!==undefined&&one){
    const s=one.secs[+d.sec]; pushUndo();
    if(d.sk==="w") s.w=el.value.trim()===""?0:Math.max(0,cm);
    if(d.sk==="type"){const was=s.type; s.type=el.value; delete s.lv; if(el.value==="gavetas") s.n=Math.max(2,+s.n||3); else if(el.value==="pgav"){s.n=2; delete s.int} else if(s.n===undefined||was==="pgav") s.n=1}
    if(d.sk==="n"){s.n=clamp(Math.round(v)||0,0,isDrw(s)?8:12); delete s.hs}
    if(d.sk==="gh") s.gh=el.value.trim()===""?0:Math.max(0,cm);
    return afterEdit();
  }
  if(!one) return;
  const k=d.k; if(!k) return;
  pushUndo();
  if(k==="layer") one.layer=el.value;
  else if(k==="name") one.name=el.value.trim()||"Móvel";
  else if(k==="txt"){ if(el.value.trim()) one.s=el.value }
  else if(!isFinite(cm)) {undoS.pop(); return renderPanel()}
  else if(k==="len"&&cm>0){const L=dist(one.a,one.b)||1; const u=[(one.b[0]-one.a[0])/L,(one.b[1]-one.a[1])/L]; one.b=[one.a[0]+u[0]*cm,one.a[1]+u[1]*cm]}
  else if(k==="ang"){const L=dist(one.a,one.b), a=v*Math.PI/180; one.b=[one.a[0]+Math.cos(a)*L,one.a[1]-Math.sin(a)*L]}
  else if(k==="ax"){const dx=cm-one.a[0]; one.a=[one.a[0]+dx,one.a[1]]; one.b=[one.b[0]+dx,one.b[1]]}
  else if(k==="ay"){const dy=-cm-one.a[1]; one.a=[one.a[0],one.a[1]+dy]; one.b=[one.b[0],one.b[1]+dy]}
  else if(k==="rw"&&cm>0){const s=Math.sign(one.b[0]-one.a[0])||1; one.b=[one.a[0]+s*cm,one.b[1]]}
  else if(k==="rh"&&cm>0){const s=Math.sign(one.b[1]-one.a[1])||1; one.b=[one.b[0],one.a[1]+s*cm]}
  else if(k==="cr"&&cm>0) one.r=cm;
  else if(k==="cd"&&cm>0) one.r=cm/2;
  else if(k==="off") one.off=cm;
  else if(k==="dep"&&cm>=0) one.dep=+cm.toFixed(2);
  else if(k==="th"&&cm>0) one.h=cm;
  else if(["W","H","D"].includes(k)&&cm>=10){ if(k==="H"){const bottom=one.y+one.H; one.H=cm; one.y=bottom-cm} else one[k]=cm }
  else if(k==="plinth"&&cm>=0&&cm<one.H/2) one.plinth=cm;
  else if(k==="elev"&&cm>=0) one.y=-(cm+one.H);
  else {undoS.pop(); return renderPanel()}
  afterEdit();
});

