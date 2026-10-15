/* ===================== organizador: clientes, projetos, orçamentos e materiais, relatórios e exportar tudo =====================
   Monta os grupos a partir dos projetos salvos (no aparelho e na conta). Cada grupo tem id e aponta para os outros:
   cliente ← projeto ← orçamento; material → projetos. O "Exportar tudo" leva esse formato, pronto para importar em outro banco. */
const ORG_VER=1, orgCache=new Map();
const orgKey=s=>String(s||"").trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/\s+/g," ");
const orgMonth=t=>{const d=new Date(t||0); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")};
const orgMonthTxt=m=>{const [y,mm]=m.split("-"); return new Date(+y,+mm-1,1).toLocaleDateString("pt-BR",{month:"long",year:"numeric"})};
/* orçamento de um projeto qualquer (troca o projeto aberto por um instante) */
function orgQuote(p){
  const c=orgCache.get(p.id); if(c&&c.u===p.updated) return c.q;
  const old=P; let q=null;
  try{P=p; const r=quote(); q={mat:r.mat,labor:r.labor,inst:r.inst,margin:r.margin,total:r.total,
    sheets:MATS.map(([k])=>({k,n:r.plans[k].sheets.length}))}}catch(_){q=null}finally{P=old}
  orgCache.set(p.id,{u:p.updated,q}); return q;
}
function orgData(){
  const clientes=new Map(), projetos=[], orcamentos=[], materiais=new Map();
  for(const p of store.projects){
    if(p.sample) continue;
    const B=p.budget||{}, nome=String(B.client||"").trim(), ck=orgKey(nome)||"__sem";
    if(!clientes.has(ck)) clientes.set(ck,{id:"c-"+(ck==="__sem"?"sem-cliente":ck.replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")),nome:nome||"Sem cliente",projetoIds:[]});
    const cli=clientes.get(ck); cli.projetoIds.push(p.id);
    projetos.push({id:p.id,nome:p.name||"Projeto",clienteId:cli.id,moveis:(p.items||[]).filter(i=>i.t==="mod").length,atualizado:p.updated||0});
    const q=orgQuote(p), sit=B.status||"rascunho", data=(sit!=="rascunho"&&B.statusAt)||p.updated||0;
    orcamentos.push({id:"o-"+p.id,projetoId:p.id,clienteId:cli.id,situacao:sit,data,mes:orgMonth(data),
      materiais:q?+q.mat.toFixed(2):0,maoDeObra:+B.labor||0,instalacao:+B.install||0,margemPct:+B.margin||0,total:q?+q.total.toFixed(2):0});
    if(q) for(const s of q.sheets){ if(!s.n) continue; const m=(p.mat||{})[s.k]||{}, mk=orgKey(m.name)+"|"+(+m.t||0);
      if(!materiais.has(mk)) materiais.set(mk,{id:"m-"+mk.replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),nome:m.name||s.k,espessuraMm:+m.t||0,precoChapa:+m.price||0,chapas:0,projetoIds:[]});
      const mm=materiais.get(mk); mm.chapas+=s.n; if(!mm.projetoIds.includes(p.id)) mm.projetoIds.push(p.id) }
  }
  return {clientes:[...clientes.values()],projetos,orcamentos,materiais:[...materiais.values()]};
}
/* relatórios */
function orgByMonth(D,clienteId){
  const m=new Map();
  for(const o of D.orcamentos){ if(clienteId&&o.clienteId!==clienteId) continue;
    if(!m.has(o.mes)) m.set(o.mes,{mes:o.mes,n:0,orcado:0,aprovado:0,nAprov:0});
    const r=m.get(o.mes); r.n++; r.orcado+=o.total; if(o.situacao==="aprovado"){r.aprovado+=o.total; r.nAprov++} }
  return [...m.values()].sort((a,b)=>b.mes.localeCompare(a.mes));
}
const brl0=v=>(+v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0});
const orgStTxt=k=>(STATUS.find(s=>s[0]===k)||[k,k])[1];
let orgTab="clientes", orgCli=null;
function showOrg(){
  const D=orgData(), byP=new Map(D.projetos.map(p=>[p.id,p]));
  const tabs=[["clientes","Clientes"],["meses","Por mês"],["materiais","Materiais"]];
  let body="";
  if(!D.projetos.length) body=`<p>Ainda não há projetos seus. Crie um projeto e preencha o <b>Nome do cliente</b> na aba Orçamento: ele aparece aqui.</p>`;
  else if(orgTab==="clientes"&&orgCli){
    const c=D.clientes.find(x=>x.id===orgCli)||D.clientes[0], os=D.orcamentos.filter(o=>o.clienteId===c.id).sort((a,b)=>b.data-a.data);
    body=`<button class="btn sm ghost" data-back style="justify-self:start">‹ Todos os clientes</button><h3 class="h3">${esc(c.nome)}</h3>
      <div class="tbl"><table><thead><tr><th>Projeto</th><th>Situação</th><th class="n">Total</th></tr></thead><tbody>
      ${os.map(o=>`<tr data-open="${esc(o.projetoId)}" style="cursor:pointer"><td><b>${esc(byP.get(o.projetoId).nome)}</b><br><span class="note">${orgMonthTxt(o.mes)}</span></td><td>${orgStTxt(o.situacao)}</td><td class="n">${brl0(o.total)}</td></tr>`).join("")}
      </tbody></table></div>
      <h3 class="h3">Por mês</h3>${orgMonthTable(orgByMonth(D,c.id))}<p class="note">Toque num projeto para abrir.</p>`;
  }else if(orgTab==="clientes"){
    const rows=D.clientes.map(c=>{const os=D.orcamentos.filter(o=>o.clienteId===c.id); return {c,n:os.length,orc:os.reduce((a,o)=>a+o.total,0),apr:os.filter(o=>o.situacao==="aprovado").reduce((a,o)=>a+o.total,0)}}).sort((a,b)=>b.apr-a.apr||b.orc-a.orc);
    body=`<div class="tbl"><table><thead><tr><th>Cliente</th><th class="n">Orçado</th><th class="n">Vendido</th></tr></thead><tbody>
      ${rows.map(r=>`<tr data-cli="${esc(r.c.id)}" style="cursor:pointer"><td><b>${esc(r.c.nome)}</b><br><span class="note">${r.n} projeto${r.n>1?"s":""}</span></td><td class="n">${brl0(r.orc)}</td><td class="n">${brl0(r.apr)}</td></tr>`).join("")}
      </tbody></table></div><p class="note">Toque num cliente para ver os orçamentos dele mês a mês. O nome vem do campo <b>Nome do cliente</b>, na aba Orçamento.</p>`;
  }else if(orgTab==="meses"){
    body=orgMonthTable(orgByMonth(D))+`<p class="note">O mês é o da última mudança de situação do orçamento (ou da última edição, se ainda for rascunho). Vendido = orçamentos aprovados.</p>`;
  }else{
    const ms=D.materiais.sort((a,b)=>b.chapas-a.chapas);
    body=ms.length?`<div class="tbl"><table><thead><tr><th>Material</th><th class="n">Chapas</th><th class="n">Gasto</th></tr></thead><tbody>
      ${ms.map(m=>`<tr><td><b>${esc(m.nome)}</b><br><span class="note">${m.projetoIds.length} projeto${m.projetoIds.length>1?"s":""} · ${m.precoChapa?brl(m.precoChapa)+" a chapa":"sem preço"}</span></td><td class="n">${m.chapas}</td><td class="n">${brl0(m.chapas*m.precoChapa)}</td></tr>`).join("")}
      </tbody></table></div><p class="note">Soma das chapas do plano de corte de todos os projetos.</p>`:`<p>Nenhum projeto tem móveis ainda.</p>`;
  }
  dlg(`<h2>Clientes e relatórios</h2>
    <div class="seg" role="tablist">${tabs.map(([k,l])=>`<button data-tab="${k}" aria-pressed="${orgTab===k}">${l}</button>`).join("")}</div>
    ${body}
    <div class="row act"><button class="btn ghost" data-x>Fechar</button><button class="btn" data-all>Exportar tudo (.json)</button></div>`,el=>{
    $("[data-x]",el).onclick=closeDlg;
    $("[data-all]",el).onclick=orgExport;
    $$("[data-tab]",el).forEach(b=>b.onclick=()=>{orgTab=b.dataset.tab; orgCli=null; showOrg()});
    $$("[data-cli]",el).forEach(r=>r.onclick=()=>{orgCli=r.dataset.cli; showOrg()});
    const bk=$("[data-back]",el); if(bk) bk.onclick=()=>{orgCli=null; showOrg()};
    $$("[data-open]",el).forEach(r=>r.onclick=()=>{const p=store.projects.find(x=>x.id===r.dataset.open); if(p){closeDlg(); switchTo(p); setView("quote")}});
  },"org");
}
function orgMonthTable(rows){
  if(!rows.length) return `<p>Sem orçamentos.</p>`;
  return `<div class="tbl"><table><thead><tr><th>Mês</th><th class="n">Orçado</th><th class="n">Vendido</th></tr></thead><tbody>
    ${rows.map(r=>`<tr><td><b>${orgMonthTxt(r.mes)}</b><br><span class="note">${r.n} orçamento${r.n>1?"s":""}, ${r.nAprov} aprovado${r.nAprov===1?"":"s"}</span></td><td class="n">${brl0(r.orcado)}</td><td class="n">${brl0(r.aprovado)}</td></tr>`).join("")}
    </tbody></table></div>`;
}
/* tudo num arquivo só: os grupos ligados por id e, junto, cada projeto completo para não perder nada numa mudança de banco */
async function orgExport(){
  const D=orgData();
  const out={formato:"automarcen-dados",versao:ORG_VER,exportadoEm:new Date().toISOString(),...D,
    projetosCompletos:store.projects.filter(p=>!p.sample)};
  const d=new Date(), f=`automarcen-tudo-${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}.json`;
  if(await saveFile(f,new Blob([JSON.stringify(out,null,1)],{type:"application/json"}))) toast("Arquivo com todos os dados salvo");
}
