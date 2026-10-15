/* ===================== peças, corte e orçamento ===================== */
const MATS=[["caixa","Caixa"],["frente","Frentes"],["fundo","Fundos"]];
function allParts(){
  const mods=P.items.filter(i=>i.t==="mod"&&visible(i)); let parts=[]; const hw={hinge:0,slide:0,pull:0,rod:0,rodSup:0,track:0,perfil:0,push:0}, warns=[], holes=[];
  mods.forEach((m,mi)=>{const g=modGeom(m), L=String.fromCharCode(65+(mi%26))+(mi>=26?Math.floor(mi/26):"");
    g.parts.forEach((p,i)=>parts.push(Object.assign(p,{code:L+(i+1),mi}))); for(const k in hw) hw[k]+=g.hw[k]||0; holes.push(...g.holes.map(h=>Object.assign(h,{mi,mod:m.name,L}))); if(g.warn) warns.push(m.name+": "+g.warn)});
  const panels=P.items.filter(i=>i.t==="rect"&&visible(i)&&+i.dep>0&&+i.dep<=5);
  panels.forEach((r,i)=>{const w=Math.abs(r.b[0]-r.a[0])*10,h=Math.abs(r.b[1]-r.a[1])*10, L=Math.round(Math.max(w,h)), W=Math.round(Math.min(w,h));
    parts.push({mid:r.id,mod:"Desenho",name:`Painel ${num(+r.dep*10,0)} mm`,q:1,L,W,mat:"caixa",edge:2*(L+W)/1000,code:"P"+(i+1),mi:mods.length+i})});
  if(P.items.some(i=>i.t==="rect"&&visible(i)&&+i.dep>5)) warns.push("Retângulos com mais de 5 cm de profundidade aparecem no 3D, mas não entram na lista de peças. Para isso, use Gerar móvel.");
  return {parts,hw,warns,holes,mods,hasParts:mods.length+panels.length>0};
}
const planCache={key:"",res:null};
function cutPlans(A){
  const res={}, ins={};
  const S=P.sheet, UW=S.w-2*(+S.trim||0), UH=S.h-2*(+S.trim||0), fits=(L,W)=>(L<=UW&&W<=UH)||(W<=UW&&L<=UH);
  for(const [k] of MATS){const pieces=[]; A.parts.filter(p=>p.mat===k).forEach(p=>{for(let i=0;i<p.q;i++){
    if(fits(p.L,p.W)||k!=="fundo"){pieces.push({code:p.code,name:p.name,L:p.L,W:p.W,mi:p.mi}); continue}
    // fundo maior que a chapa: divide em partes iguais (a emenda fica atrás de uma prateleira ou divisória)
    let done=false; for(let n=2;n<=4&&!done;n++) for(const [L,W] of [[Math.ceil(p.L/n),p.W],[p.L,Math.ceil(p.W/n)]]) if(!done&&fits(L,W)){for(let j=1;j<=n;j++) pieces.push({code:p.code,name:`${p.name} (parte ${j}/${n})`,L,W,mi:p.mi}); done=true}
    if(!done) pieces.push({code:p.code,name:p.name,L:p.L,W:p.W,mi:p.mi});
  }}); ins[k]=pieces}
  const key=JSON.stringify([ins,P.sheet,MATS.map(([k])=>!!P.mat[k].grain)]);
  if(planCache.key===key) return planCache.res;
  for(const [k] of MATS) res[k]=ins[k].length?pack(ins[k],P.sheet,!!P.mat[k].grain):{sheets:[],over:[],util:0,area:0,offA:0};
  planCache.key=key; planCache.res=res; return res;
}
const modHue=i=>`hsl(${(i*67+24)%360} 62% 74%)`;
function sheetSVG(sh,S){
  const fs=Math.max(30,S.w/55);
  const offs=(sh.off||[]).map(o=>{const f=Math.min(fs*.8,o.h*.3,o.w/8); return `<g><rect class="off" x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" vector-effect="non-scaling-stroke"><title>Sobra ${o.w}×${o.h}</title></rect>${f>=10?`<text class="offt" x="${o.x+o.w/2}" y="${o.y+o.h/2}" font-size="${f}" text-anchor="middle" dominant-baseline="middle">sobra ${o.w}×${o.h}</text>`:""}</g>`}).join("");
  return `<svg class="sheet-svg" viewBox="0 0 ${S.w} ${S.h}" role="img" aria-label="Chapa com ${sh.pieces.length} peças"><defs><pattern id="hatch" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="40" height="40" fill="none"/><path d="M0 0v40" stroke="currentColor" stroke-width="6" opacity=".18"/></pattern></defs><rect class="bg" x="0" y="0" width="${S.w}" height="${S.h}" vector-effect="non-scaling-stroke"/>${offs}${sh.pieces.map(p=>{
    const f=Math.min(fs,p.h*.42,p.w/(Math.max(p.code.length,3)*.62));
    const f2=Math.min(fs*.7,p.h*.24,p.w/9);
    return `<g><rect class="pc" x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="${modHue(p.mi)}" vector-effect="non-scaling-stroke"><title>${esc(p.code+" "+p.name+" "+p.L+"×"+p.W)}</title></rect>${f>=12?`<text x="${p.x+p.w/2}" y="${p.y+p.h/2-(f2>=10?f2*.35:0)}" font-size="${f}" text-anchor="middle" dominant-baseline="middle" font-weight="600">${esc(p.code)}</text>`:""}${f2>=10?`<text x="${p.x+p.w/2}" y="${p.y+p.h/2+f*.55}" font-size="${f2}" text-anchor="middle" dominant-baseline="middle" opacity=".75">${p.L}×${p.W}</text>`:""}</g>`}).join("")}</svg>`;
}
function renderParts(){
  const w=$("#partsWrap"), A=allParts();
  if(!A.hasParts){w.innerHTML=`<div class="phead"><div><h1>Peças e plano de corte</h1><p>Lista de corte, fita de borda, ferragens e aproveitamento de chapas.</p></div></div>
    <div class="card" style="text-align:center;padding:36px 16px"><h2>Nenhum móvel no projeto</h2><p class="note" style="margin-bottom:14px">As peças são geradas a partir dos móveis do projeto. Insira um modelo pronto${hasDrawing()?" ou transforme o armário que você desenhou em móvel":""}.</p><div class="row" style="justify-content:center"><button class="btn pri" data-go="insert">Inserir móvel</button>${hasDrawing()?`<button class="btn" data-go="conv">Gerar do desenho</button>`:""}</div></div>`; return}
  const plans=cutPlans(A), S=P.sheet, mt=P.mat;
  const edge=A.parts.reduce((a,p)=>a+p.edge*p.q,0), np=A.parts.reduce((a,p)=>a+p.q,0);
  const tiles=MATS.filter(([k])=>plans[k].sheets.length).map(([k,l])=>`<div class="tile"><span class="lb">${l}</span><span class="v">${plans[k].sheets.length} chapa${plans[k].sheets.length>1?"s":""}</span><span class="s">${esc(mt[k].name)} · ${Math.round(plans[k].util*100)}% de aproveitamento</span></div>`).join("");
  const over=MATS.flatMap(([k])=>plans[k].over.map(p=>p.code+" "+p.name+" ("+p.L+"×"+p.W+")"));
  const splits=[...new Set(MATS.flatMap(([k])=>plans[k].sheets.flatMap(sh=>sh.pieces.filter(p=>/\(parte 1\//.test(p.name)).map(p=>p.code+" "+p.name.replace(/ \(parte 1\/(\d)\)/," em $1 partes")))))];
  const offs=MATS.flatMap(([k,l])=>plans[k].sheets.flatMap((sh,i)=>(sh.off||[]).map(o=>({l,k,i,w:Math.max(o.w,o.h),h:Math.min(o.w,o.h)}))));
  w.innerHTML=`<div class="phead"><div><h1>Peças e plano de corte</h1><p>${A.mods.length} móve${A.mods.length>1?"is":"l"} · ${np} peças · chapa ${S.w} × ${S.h} mm</p></div><button class="btn" data-ex="csv">Exportar CSV</button></div>
  <div class="tiles">${tiles}
    ${offs.length?`<div class="tile"><span class="lb">Sobras aproveitáveis</span><span class="v">${offs.length}</span><span class="s">${offs.slice(0,4).map(o=>`${o.l} ${o.w}×${o.h}`).join(" · ")}${offs.length>4?" …":""}</span></div>`:""}
    <div class="tile"><span class="lb">Fita de borda</span><span class="v">${num(edge,1)} m</span><span class="s">sem perda; o orçamento soma 10%</span></div>
    <div class="tile"><span class="lb">Ferragens</span><span class="v">${A.hw.hinge+A.hw.slide+A.hw.pull+A.hw.track+A.hw.push}</span><span class="s">${A.hw.hinge} dobradiças · ${A.hw.slide} pares de corrediças · ${A.hw.pull} puxadores${A.hw.track?` · ${A.hw.track} kits de porta de correr`:""}${A.hw.perfil?` · ${num(A.hw.perfil,2)} m de perfil puxador`:""}${A.hw.push?` · ${A.hw.push} fechos toque`:""}${A.hw.rod?` · ${num(A.hw.rod,2)} m de tubo de cabide`:""}</span></div>
  </div>
  ${A.warns.length||over.length||splits.length?`<div class="card">${A.warns.map(x=>`<p class="warn">${esc(x)}</p>`).join("")}${over.length?`<p class="warn">Peças maiores que a chapa: ${esc(over.join(", "))}</p>`:""}${splits.length?`<p class="note">Fundo maior que a chapa foi dividido: ${esc(splits.join(", "))}. Faça a emenda atrás de uma prateleira ou divisória.</p>`:""}</div>`:""}
  <div class="card"><h2>Chapa e corte</h2><div class="r3" style="max-width:520px">
    <label class="f"><span class="lb">Chapa (mm)</span><input class="in n" data-sh="size" value="${S.w}x${S.h}" inputmode="decimal"></label>
    <label class="f"><span class="lb">Serra (mm)</span><input class="in n" data-sh="kerf" value="${S.kerf}" inputmode="decimal"></label>
    <label class="f"><span class="lb">Refilo (mm)</span><input class="in n" data-sh="trim" value="${S.trim}" inputmode="decimal"></label></div>
    <div class="grains">${MATS.filter(([k])=>plans[k].sheets.length).map(([k,l])=>`<label class="chk"><input type="checkbox" data-grain="${k}" ${mt[k].grain?"checked":""}> <span>${l}: respeitar o veio <small>(${esc(mt[k].name)})</small></span></label>`).join("")}</div>
    <p class="note" style="margin-top:8px">Cortes de ponta a ponta (próprios para esquadrejadeira). A ferramenta testa várias arrumações e fica com a que usa menos chapas e deixa a maior sobra inteira. Com o veio ligado, as peças não giram: o comprimento da peça segue o comprimento da chapa (o veio). A espessura da serra entra entre cada corte. Sobras com pelo menos ${OFF_MIN[0]/10} × ${OFF_MIN[1]/10} cm aparecem tracejadas em verde.</p></div>
  <div class="card"><h2>Lista de corte</h2><div class="tbl"><table><thead><tr><th>Cód.</th><th>Peça</th><th>Móvel</th><th class="n">Qtd</th><th class="n">Comp.</th><th class="n">Larg.</th><th>Material</th><th class="n">Fita (m)</th></tr></thead><tbody>
    ${A.parts.map(p=>`<tr><td class="code"><span style="display:inline-block;width:9px;height:9px;border-radius:2px;background:${modHue(p.mi)};margin-right:6px"></span>${p.code}</td><td>${esc(p.name)}</td><td>${esc(p.mod)}</td><td class="n">${p.q}</td><td class="n">${p.L}</td><td class="n">${p.W}</td><td>${esc(mt[p.mat].name)}</td><td class="n">${num(p.edge*p.q,2)}</td></tr>`).join("")}
  </tbody></table></div><p class="note" style="margin-top:8px">Medidas em milímetros. Comprimento × largura da peça acabada.</p></div>
  ${holesHTML(A)}
  ${MATS.filter(([k])=>plans[k].sheets.length).map(([k,l])=>`<div class="card"><h2>${l}: ${esc(mt[k].name)}</h2><div class="sheets">${plans[k].sheets.map((sh,i)=>`<div class="sheetc"><div class="cap"><span>Chapa ${i+1} de ${plans[k].sheets.length}</span><span>${sh.pieces.length} peças · ${Math.round(sh.pieces.reduce((a,p)=>a+p.w*p.h,0)/(S.w*S.h)*100)}%</span></div>${sheetSVG(sh,S)}</div>`).join("")}</div></div>`).join("")}`;
}
/* furação: dobradiças (caneco Ø35), corrediças (sistema 32) e cavilhas das junções */
const hingeYs=(h,n)=>{if(n<=1) return [Math.round(h/2)]; const a=100,b=h-100; return Array.from({length:n},(_,k)=>Math.round(a+(b-a)*k/(n-1)))};
function doorHoleSVG(w,h,side,ys){
  const S=Math.min(150/h,90/w), W=w*S, H=h*S, cx=side==="E"?22.5*S:W-22.5*S, r=Math.max(3,17.5*S);
  return `<svg viewBox="-6 -6 ${W+12} ${H+12}" width="${Math.round(W+12)}" height="${Math.round(H+12)}" aria-hidden="true"><rect x="0" y="0" width="${W}" height="${H}" fill="var(--surface-2)" stroke="var(--line-2)"/>${ys.map(y=>`<circle cx="${cx}" cy="${H-y*S}" r="${r}" fill="none" stroke="var(--accent)" stroke-width="1.5"/>`).join("")}</svg>`;
}
function holesHTML(A){
  const doors={}, slides=[], mods=A.mods;
  for(const h of A.holes){
    if(h.kind==="hinge"){const ys=hingeYs(Math.round(h.h),h.n), key=[Math.round(h.lw),Math.round(h.h),h.side,ys.join(",")].join("|"); (doors[key]=doors[key]||{w:Math.round(h.lw),h:Math.round(h.h),side:h.side,ys,q:0,mods:new Set()}).q++; doors[key].mods.add(h.mod)}
    if(h.kind==="slide") slides.push(h);
  }
  const dl=Object.values(doors), sg={};
  for(const h of slides){const key=h.mod+"|"+h.sec; (sg[key]=sg[key]||{mod:h.mod,sec:h.sec,sl:h.sl,ys:[]}).ys.push(Math.round(h.y+20))}
  const sl=Object.values(sg);
  if(!dl.length&&!sl.length&&!mods.length) return "";
  const t=+P.mat.caixa.t||18;
  return `<div class="card"><h2>Furação</h2>
    ${dl.length?`<h3 class="h3">Portas: furo de caneco Ø35 mm, 12 mm de fundo, centro a 22,5 mm da borda</h3><div class="holes">${dl.map(d=>`<div class="hole">${doorHoleSVG(d.w,d.h,d.side,d.ys)}<div><b>${d.q} porta${d.q>1?"s":""} ${d.h}×${d.w}</b><span class="note">Dobradiça do lado ${d.side==="E"?"esquerdo":"direito"} (vista de frente)</span><span class="note">Furos a ${d.ys.join(", ")} mm da base da porta</span><span class="note">${esc([...d.mods].join(", "))}</span></div></div>`).join("")}</div><p class="note">Na lateral ou divisória, a base da dobradiça vai na mesma altura de cada furo, a 37 mm da frente.</p>`:""}
    ${sl.length?`<h3 class="h3">Corrediças telescópicas</h3><div class="tbl"><table><thead><tr><th>Móvel</th><th>Vão</th><th class="n">Corrediça</th><th>Altura da linha de furos (do piso do móvel)</th></tr></thead><tbody>${sl.map(x=>`<tr><td>${esc(x.mod)}</td><td>${x.sec+1}</td><td class="n">${x.sl} mm</td><td>${x.ys.join(", ")} mm</td></tr>`).join("")}</tbody></table></div><p class="note">Nas laterais e divisórias, furos a 37 mm da frente e depois a cada 32 mm (sistema 32). Na gaveta, a corrediça vai alinhada à base da caixa.</p>`:""}
    <h3 class="h3">Cavilhas e minifix</h3><p class="note">Laterais com tampo e base: furo Ø8 mm (cavilha) ou Ø15 mm (minifix) a 37 mm da frente e de trás, mais um no meio se a profundidade passar de 40 cm. No topo da lateral, centro a ${num(t/2,1)} mm da borda; no tampo e na base, furo de topo Ø8 × 30 mm. Divisórias e prateleiras fixas seguem o mesmo padrão. Prateleiras móveis: furos Ø5 mm a 37 mm da frente e de trás, a cada 32 mm.</p>
  </div>`;
}
$("#partsWrap").addEventListener("change",e=>{
  const d=e.target.dataset; if(!d.sh&&!d.grain) return; const S=P.sheet;
  if(d.sh==="size"){const v=e.target.value.split(/[x×*\s]+/i).map(parseN); if(v.length>=2&&v[0]>=300&&v[1]>=300){S.w=v[0];S.h=v[1]} else toast("Use o formato 2750x1840")}
  if(d.sh==="kerf"){const v=parseN(e.target.value); if(v>=0&&v<20) S.kerf=v}
  if(d.sh==="trim"){const v=parseN(e.target.value); if(v>=0&&v<100) S.trim=v}
  if(e.target.dataset.grain){P.mat[e.target.dataset.grain].grain=e.target.checked}
  save(); renderParts();
});
document.addEventListener("click",e=>{const g=e.target.closest("[data-go]"); if(g&&g.dataset.go==="insert"){setView("draw"); showInsert()} if(g&&g.dataset.go==="conv"){setView("draw"); convFromDrawing()} const x=e.target.closest(".page [data-ex]"); if(x) doExport(x.dataset.ex)});

function quote(){
  const A=allParts(), plans=cutPlans(A), B=P.budget, mt=P.mat, lines=[];
  for(const [k] of MATS){const n=plans[k].sheets.length; if(n) lines.push({l:mt[k].name,d:`${n} chapa${n>1?"s":""} × ${brl(mt[k].price)}`,v:n*(+mt[k].price||0)})}
  const edge=A.parts.reduce((a,p)=>a+p.edge*p.q,0)*1.1;
  if(edge) lines.push({l:"Fita de borda",d:`${num(edge,1)} m × ${brl(B.edge)}`,v:edge*(+B.edge||0)});
  if(A.hw.hinge) lines.push({l:"Dobradiças",d:`${A.hw.hinge} × ${brl(B.hinge)}`,v:A.hw.hinge*(+B.hinge||0)});
  if(A.hw.slide) lines.push({l:"Corrediças (par)",d:`${A.hw.slide} × ${brl(B.slide)}`,v:A.hw.slide*(+B.slide||0)});
  if(A.hw.pull) lines.push({l:"Puxadores",d:`${A.hw.pull} × ${brl(B.pull)}`,v:A.hw.pull*(+B.pull||0)});
  if(A.hw.track) lines.push({l:"Kit de porta de correr",d:`${A.hw.track} folha${A.hw.track>1?"s":""} × ${brl(B.track)}`,v:A.hw.track*(+B.track||0)});
  if(A.hw.perfil) lines.push({l:"Perfil puxador",d:`${num(A.hw.perfil,2)} m × ${brl(B.perfil)}`,v:A.hw.perfil*(+B.perfil||0)});
  if(A.hw.push) lines.push({l:"Fecho toque",d:`${A.hw.push} × ${brl(B.push)}`,v:A.hw.push*(+B.push||0)});
  if(A.hw.rod) lines.push({l:"Tubo de cabide",d:`${num(A.hw.rod,2)} m × ${brl(B.rod)}`,v:A.hw.rod*(+B.rod||0)});
  if(A.hw.rodSup) lines.push({l:"Suportes de cabide",d:`${A.hw.rodSup} × ${brl(B.rodSup)}`,v:A.hw.rodSup*(+B.rodSup||0)});
  const mat=lines.reduce((a,l)=>a+l.v,0), labor=+B.labor||0, inst=+B.install||0, base=mat+labor+inst, margin=base*(+B.margin||0)/100;
  return {A,plans,lines,mat,labor,inst,base,margin,total:base+margin};
}
const money=(k,v)=>`<div class="unit"><input class="in n" data-q="${k}" value="${v}" inputmode="decimal"><em>R$</em></div>`;
function renderQuote(){
  const w=$("#quoteWrap"), B=P.budget, mt=P.mat;
  w.innerHTML=`<div class="phead"><div><h1>Orçamento</h1><p>${esc(P.name)}</p></div><div class="row"><button class="btn" data-qa="copy">Copiar resumo</button><button class="btn" data-qa="client">3D para o cliente</button><button class="btn pri" data-qa="pdf">Gerar PDF</button></div></div>
  <div class="qgrid">
    <div style="display:grid;gap:18px;min-width:0">
      <div class="card"><h2>Cliente</h2><div style="display:grid;gap:10px">
        <label class="f"><span class="lb">Nome do cliente</span><input class="in" data-q="client" value="${esc(B.client)}" placeholder="ex.: Maria Souza"></label>
        <label class="f"><span class="lb">Observações</span><textarea class="in" data-q="notes" rows="3">${esc(B.notes)}</textarea></label>
        <label class="f"><span class="lb">Seu WhatsApp (para o cliente aprovar)</span><input class="in" data-q="phone" value="${esc(B.phone||"")}" placeholder="ex.: 11 98765-4321" inputmode="tel"></label>
        <div class="f"><span class="lb">Situação do orçamento</span><div class="seg">${STATUS.map(([k,l])=>`<button data-st="${k}" aria-pressed="${(B.status||"rascunho")===k}">${l}</button>`).join("")}</div>${B.statusAt?`<span class="note">Atualizado em ${new Date(B.statusAt).toLocaleDateString("pt-BR")}</span>`:""}</div>
        <p class="note">Com o WhatsApp preenchido, o PDF e o 3D para o cliente ganham os botões <b>Aprovar</b> e <b>Pedir ajuste</b>, que abrem uma conversa com você já com a mensagem pronta.</p></div></div>
      <div class="card"><h2>Chapas</h2><span class="badge">Valores de exemplo: ajuste aos preços dos seus fornecedores</span>
        <div style="display:grid;gap:12px;margin-top:12px">${MATS.map(([k,l])=>`<div class="r3 mrow" style="grid-template-columns:2fr 1fr 1.3fr">
          <label class="f"><span class="lb">${l}</span><input class="in" data-m="${k}" data-mk="name" value="${esc(mt[k].name)}"></label>
          <label class="f"><span class="lb">Espessura</span><div class="unit"><input class="in n" data-m="${k}" data-mk="t" value="${mt[k].t}" inputmode="decimal"><em>mm</em></div></label>
          <label class="f"><span class="lb">Preço da chapa</span><div class="unit"><input class="in n" data-m="${k}" data-mk="price" value="${mt[k].price}" inputmode="decimal"><em>R$</em></div></label></div>`).join("")}</div></div>
      <div class="card"><h2>Ferragens e acabamento</h2><div class="r2">
        <label class="f"><span class="lb">Fita de borda (por metro)</span>${money("edge",B.edge)}</label>
        <label class="f"><span class="lb">Dobradiça (unidade)</span>${money("hinge",B.hinge)}</label>
        <label class="f"><span class="lb">Corrediça (par)</span>${money("slide",B.slide)}</label>
        <label class="f"><span class="lb">Puxador (unidade)</span>${money("pull",B.pull)}</label>
        <label class="f"><span class="lb">Tubo de cabide (por metro)</span>${money("rod",B.rod)}</label>
        <label class="f"><span class="lb">Suporte de cabide (unidade)</span>${money("rodSup",B.rodSup)}</label>
        <label class="f"><span class="lb">Porta de correr (kit por folha)</span>${money("track",B.track)}</label>
        <label class="f"><span class="lb">Perfil puxador (por metro)</span>${money("perfil",B.perfil)}</label>
        <label class="f"><span class="lb">Fecho toque (unidade)</span>${money("push",B.push)}</label></div></div>
      <div class="card"><h2>Serviço e margem</h2><div class="r3">
        <label class="f"><span class="lb">Mão de obra</span>${money("labor",B.labor)}</label>
        <label class="f"><span class="lb">Instalação e frete</span>${money("install",B.install)}</label>
        <label class="f"><span class="lb">Margem</span><div class="unit"><input class="in n" data-q="margin" value="${B.margin}" inputmode="decimal"><em>%</em></div></label></div></div>
    </div>
    <div class="card sticky" id="qSum"></div>
  </div>`;
  renderQSum();
}
function renderQSum(){
  const Q=quote(), el=$("#qSum"); if(!el) return;
  if(!Q.A.hasParts){el.innerHTML=`<h2>Resumo</h2><p class="note" style="margin-bottom:12px">Insira móveis no Desenho para calcular chapas, fita e ferragens.</p><button class="btn pri" data-go="insert">Inserir móvel</button>`; return}
  el.innerHTML=`<h2>Resumo</h2>
    <div style="display:grid;gap:4px;margin-bottom:8px">${Q.A.mods.map(m=>`<div class="note"><b style="color:var(--fg)">${esc(m.name)}</b> · ${fmtL(m.W)} × ${fmtL(m.H)} × ${fmtL(m.D)} ${P.unit} · ${esc(FIN[m.fb]?.[0])} / ${esc(FIN[m.ff]?.[0])}</div>`).join("")}</div>
    ${Q.lines.map(l=>`<div class="qline"><span>${esc(l.l)}</span><small>${esc(l.d)}</small><b>${brl(l.v)}</b></div>`).join("")}
    <div class="qline"><span><b style="font:inherit;font-weight:600">Materiais</b></span><small>&nbsp;</small><b>${brl(Q.mat)}</b></div>
    ${Q.labor?`<div class="qline"><span>Mão de obra</span><small>&nbsp;</small><b>${brl(Q.labor)}</b></div>`:""}
    ${Q.inst?`<div class="qline"><span>Instalação e frete</span><small>&nbsp;</small><b>${brl(Q.inst)}</b></div>`:""}
    ${Q.margin?`<div class="qline"><span>Margem</span><small>${num(P.budget.margin,1)}%</small><b>${brl(Q.margin)}</b></div>`:""}
    <div class="qtotal"><span class="lb">Total</span><b>${brl(Q.total)}</b></div>`;
}
$("#quoteWrap").addEventListener("input",e=>{
  const d=e.target.dataset, B=P.budget;
  if(d.q){ if(d.q==="client"||d.q==="notes"||d.q==="phone"){B[d.q]=e.target.value; if(d.q==="phone") lsSet("croqui3d-whats",e.target.value)} else {const v=parseN(e.target.value); B[d.q]=isFinite(v)?v:0} }
  else if(d.m){ const m=P.mat[d.m]; if(d.mk==="name") m.name=e.target.value; else {const v=parseN(e.target.value); if(isFinite(v)) m[d.mk]=v; if(d.mk==="t"){touch(); dirty3D=true}} }
  else return;
  save(); renderQSum();
});
$("#quoteWrap").addEventListener("click",e=>{const a=e.target.closest("[data-qa]")?.dataset.qa; if(a==="pdf") exportPDF(); if(a==="copy") copySummary(); if(a==="client") sendClient(); const st=e.target.closest("[data-st]"); if(st) setStatus(st.dataset.st)});
function summaryText(){
  const Q=quote(), B=P.budget;
  return [`*Orçamento: ${P.name}*`,B.client?`Cliente: ${B.client}`:"",`Data: ${new Date().toLocaleDateString("pt-BR")}`,"",
    ...Q.A.mods.map(m=>`• ${m.name}: ${fmtL(m.W)} × ${fmtL(m.H)} × ${fmtL(m.D)} ${P.unit}, caixa ${FIN[m.fb]?.[0]}, frentes ${FIN[m.ff]?.[0]}`),"",
    `*Total: ${brl(Q.total)}*`,B.notes?"\n"+B.notes:"","","Para aprovar, é só responder *APROVADO* aqui."].filter((l,i,a)=>l!==""||a[i-1]!=="").join("\n");
}
async function copySummary(){
  const t=summaryText();
  try{await navigator.clipboard.writeText(t); toast("Resumo copiado. Cole no WhatsApp ou e-mail")}
  catch(_){dlg(`<h2>Resumo do orçamento</h2><p>Selecione e copie o texto.</p><textarea class="in" rows="10" readonly>${esc(t)}</textarea><div class="row"><button class="btn ghost" data-x>Fechar</button></div>`,el=>{$("[data-x]",el).onclick=closeDlg; const ta=$("textarea",el); ta.focus(); ta.select()})}
}
