/* ===== modelos da comunidade: quem aceitar ajuda a montar modelos prontos melhores. Só na versão instalável =====
   Começa DESLIGADO. A pessoa liga em ⋯ → Minha conta → "Ajudar a melhorar os modelos" (fica guardado neste aparelho, por conta).
   Ligado, o app manda para a coleção "contribuicoes" do Firestore uma cópia SEM IDENTIFICAÇÃO só da estrutura dos móveis do projeto:
   tipo (pela palavra do nome: balcão, aéreo, roupeiro…), medidas, posição de um móvel em relação ao outro, vãos, portas, gavetas,
   interior, puxador e acabamento. NUNCA vai: nome do projeto ou do móvel, cliente, preços, telefone, fotos, desenho solto nem a conta.
   Um documento por projeto, com id sorteado e guardado só neste aparelho (sem ligação com a conta), regravado quando os móveis mudam.
   As regras (firestore.rules) deixam gravar e apagar pelo id, mas não ler; só o dono do AutoMarcen lê, aprova e publica em "modelos".
   Ao desligar, o app apaga o que saiu deste aparelho. */
const CT={key:"automarcen-modelos-ok", map:"automarcen-contrib", wait:60000, timer:0, fila:new Set(), off:false, base:null};
const ctOk=()=>!!(FB.user&&lsGet(CT.key+"-"+FB.user.uid)==="1");
const ctMapa=()=>{try{const o=JSON.parse(lsGet(CT.map)||"{}"); return o&&typeof o==="object"?o:{}}catch(_){return {}}};
const ctId=()=>{const a="abcdefghijklmnopqrstuvwxyz0123456789", r=crypto.getRandomValues(new Uint8Array(24)); return Array.from(r,b=>a[b%36]).join("")};
const ctHash=s=>{let h=0x811c9dc5; for(let i=0;i<s.length;i++){h^=s.charCodeAt(i); h=Math.imul(h,0x01000193)} return (h>>>0).toString(36)};
// tipo do móvel pela palavra do nome; o nome em si nunca sai do aparelho
const CT_TIPOS=[["roupeiro|guarda ?roupa|closet","roupeiro"],["aereo|suspenso","aereo"],["torre|forno|micro","torre"],["gaveteiro","gaveteiro"],["comoda","comoda"],["escrivaninha|mesa|bancada de estudo","escrivaninha"],["rack|painel|tv","rack"],["estante|nicho|livreiro","estante"],["armario","armario"],["balcao|pia|gabinete|cuba","balcao"]];
function ctTipo(nome){
  const n=String(nome||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  for(const [re,t] of CT_TIPOS) if(new RegExp("\\b("+re+")").test(n)) return t;
  return "outro";
}
const ctN=v=>Math.round((+v||0)*10)/10;
const ctI=(v,max)=>Math.max(0,Math.min(max,Math.round(+v||0)));
// só a estrutura, por lista de campos permitidos: texto livre não passa
function ctMovel(m,x0){
  const o={tipo:ctTipo(m.name),W:ctN(m.W),H:ctN(m.H),D:ctN(m.D),x:ctN(m.x-x0),elev:ctN(-(+m.y||0)-(+m.H||0)),plinth:ctN(m.plinth),
    pull:PULLS.some(p=>p[0]===m.pull)?m.pull:"barra",fb:ctI(m.fb,FIN.length-1),ff:ctI(m.ff,FIN.length-1),secs:[]};
  for(const s of (m.secs||[]).slice(0,12)){
    const q={w:ctN(s.w),type:SEC_TYPES[s.type]?s.type:"porta",n:ctI(s.n,20)};
    if(s.lv) q.lv=ctI(s.lv,3);
    if(s.hinge==="E"||s.hinge==="D") q.hinge=s.hinge;
    if(+s.gh>0) q.gh=ctN(s.gh);
    if(Array.isArray(s.hs)) q.hs=s.hs.slice(0,10).map(ctN);
    if(Array.isArray(s.int)) q.int=s.int.slice(0,10).map(z=>({t:/^[a-z]{2,12}$/.test(z&&z.t)?z.t:"prat",h:ctN(z&&z.h),n:ctI(z&&z.n,20)}));
    o.secs.push(q);
  }
  return o;
}
// móvel igual a um modelo pronto, sem mexer em nada, não ensina nada novo
const ctForma=o=>JSON.stringify(Object.assign({},o,{x:0,elev:0,tipo:""}));
function ctPadroes(){
  if(CT.base) return CT.base;
  const lst=Object.keys(TPL).map(k=>makeModule(k));
  for(const K of Object.values(KITS)) for(const [k,o] of K.mods) lst.push(makeModule(k,JSON.parse(JSON.stringify(o))));
  return CT.base=new Set(lst.map(m=>ctForma(ctMovel(m,m.x))));
}
function ctConteudo(pr){
  if(!pr||pr.sample) return null;
  const mods=(pr.items||[]).filter(i=>i&&i.t==="mod").slice(0,30); if(!mods.length) return null;
  const x0=Math.min(...mods.map(m=>+m.x||0)), moveis=mods.map(m=>ctMovel(m,x0));
  const base=ctPadroes(); if(moveis.every(o=>base.has(ctForma(o)))) return null;
  const s=JSON.stringify({moveis}); return s.length<=20000?{n:moveis.length,s}:null;
}
function contribLater(pid){
  if(CT.off||!ctOk()) return;
  CT.fila.add(pid); clearTimeout(CT.timer); CT.timer=setTimeout(contribFlush,CT.wait);
}
async function contribFlush(){
  clearTimeout(CT.timer); CT.timer=0;
  if(CT.off||!ctOk()||!FB.db||!online()) return;
  const mapa=ctMapa();
  for(const pid of [...CT.fila]){
    CT.fila.delete(pid);
    const pr=store.projects.find(p=>p.id===pid), c=ctConteudo(pr); if(!c) continue;
    const h=ctHash(c.s), e=mapa[pid]||{}; if(e.h===h) continue;
    const id=e.id||ctId();
    try{
      await FB.db.collection("contribuicoes").doc(id).set({v:1,app:APP_VER,n:c.n,s:c.s,quando:firebase.firestore.FieldValue.serverTimestamp()});
      mapa[pid]={id,h}; lsSet(CT.map,JSON.stringify(mapa));
    }catch(err){
      // sem as regras novas no console, o Firestore recusa: para por aqui até abrir o app de novo
      if(err&&err.code==="permission-denied"){CT.off=true; console.warn("modelos: o Firestore recusou (regras v4 ainda não publicadas?)"); return}
      CT.fila.add(pid);
    }
  }
}
// ao entrar na conta (ou abrir o app já entrado): confere todos os projetos; os que não mudaram não sobem de novo
function contribAll(){ if(ctOk()) for(const p of store.projects) contribLater(p.id) }
async function contribSet(on){
  if(!FB.user) return;
  lsSet(CT.key+"-"+FB.user.uid,on?"1":"0");
  if(on){CT.off=false; contribAll(); return}
  CT.fila.clear(); clearTimeout(CT.timer);
  const mapa=ctMapa(); let falhou=0;
  for(const pid of Object.keys(mapa)){
    try{await FB.db.collection("contribuicoes").doc(mapa[pid].id).delete(); delete mapa[pid]}catch(_){falhou++}
  }
  lsSet(CT.map,JSON.stringify(mapa));
  toast(falhou?"Desligado. Parte do que já foi enviado não foi apagada agora; tente de novo com internet":"Desligado. Nada mais é enviado, e o que saiu deste aparelho foi apagado");
}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"&&CT.fila.size) contribFlush()});
addEventListener("online",()=>{if(CT.fila.size) contribFlush()});
function contribBlock(){
  return `<div class="grp"><label class="chk"><input type="checkbox" id="aMod"${ctOk()?" checked":""}> <span><b>Ajudar a melhorar os modelos</b></span></label>
    <span class="note">Manda uma cópia <b>sem identificação</b> só do formato dos seus móveis: medidas, vãos, portas, gavetas, interior, puxador e cor. Com ela montamos modelos prontos melhores para todos. <b>Não vai</b> nome do projeto ou do móvel, cliente, preço, telefone, foto nem a sua conta. Desligado, nada é enviado; ao desligar, o que saiu deste aparelho é apagado.</span></div>`;
}

/* ----- etapa 2: o dono aprova; os aprovados viram "Modelos da comunidade" no botão Móvel e exemplos para a IA ----- */
const DONO_UID="JeTDR8WREIhuSVvH2xhnu68jlGR2"; // o mesmo de donoApp() em firestore.rules
const MD={cache:"automarcen-modelos-cache", lista:null, at:0, busy:null};
const ehDono=()=>!!(FB.user&&FB.user.uid===DONO_UID);
const MD_TIPO={balcao:"Balcão",aereo:"Aéreo",torre:"Torre",gaveteiro:"Gaveteiro",comoda:"Cômoda",escrivaninha:"Escrivaninha",rack:"Rack",estante:"Estante",armario:"Armário",roupeiro:"Roupeiro",outro:"Módulo"};
const mdParse=s=>{try{const o=JSON.parse(s); return Array.isArray(o&&o.moveis)?o.moveis.slice(0,30):[]}catch(_){return []}};
// estrutura (como sai de ctMovel) → móvel de verdade
function mdMod(o,dx){
  const tk=TPL[o.tipo]?o.tipo:"livre";
  const m=makeModule(tk,{name:MD_TIPO[o.tipo]||"Módulo",W:+o.W||80,H:+o.H||80,D:+o.D||50,x:(+o.x||0)+(dx||0),elev:Math.max(0,+o.elev||0),
    plinth:Math.max(0,+o.plinth||0),pull:o.pull||"barra",fb:+o.fb||0,ff:+o.ff||0,secs:JSON.parse(JSON.stringify(o.secs&&o.secs.length?o.secs:[{w:0,type:"porta",n:1}]))});
  return m;
}
const mdLinha=o=>{const m=mdMod(o,0); return `${MD_TIPO[o.tipo]||"Módulo"} ${fmtL(m.W)} × ${fmtL(m.H)} × ${fmtL(m.D)}${o.elev>0?`, a ${fmtL(o.elev)} do piso`:""} · ${m.secs.map(secLabel).join(", ")}`};
function mdNome(ms){
  if(ms.length===1){const m=mdMod(ms[0],0); return `${MD_TIPO[ms[0].tipo]||"Módulo"} ${num(m.W)}×${num(m.H)}`}
  const t=[...new Set(ms.map(o=>MD_TIPO[o.tipo]||"Módulo"))]; return "Conjunto: "+t.slice(0,3).join(", ").toLowerCase();
}
// vista de frente em SVG (só traço, segue o tema)
function mdSvg(ms,w,h){
  const R=[]; let x0=1e9,x1=-1e9,y1=-1e9;
  for(const o of ms){
    const m=mdMod(o,0), g=modGeom(m), ox=(+o.x||0)*10, oy=Math.max(0,+o.elev||0)*10;
    for(const r of g.r2d){ if(r.int) continue; const a=ox+r.x, b=oy+r.y+r.h; R.push([a,b,r.w,r.h,r.fill]); x0=Math.min(x0,a); x1=Math.max(x1,a+r.w); y1=Math.max(y1,b) }
  }
  if(!R.length) return "";
  const W=x1-x0||1, H=y1||1, pad=Math.max(W,H)*.04;
  return `<svg viewBox="${x0-pad} ${-pad} ${W+2*pad} ${H+2*pad}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" style="stroke:currentColor;fill:none;stroke-width:${(Math.max(W,H)/90).toFixed(1)}">`+
    R.map(([a,b,rw,rh,f])=>`<rect x="${a.toFixed(0)}" y="${(y1-b).toFixed(0)}" width="${rw.toFixed(0)}" height="${rh.toFixed(0)}"${f==="front"?' style="fill:currentColor;fill-opacity:.12"':f==="ink"?' style="fill:currentColor"':""}/>`).join("")+"</svg>";
}
/* modelos aprovados: guardados neste aparelho e renovados de 6 em 6 horas (ou na hora, para o dono) */
function mdLocal(){ if(MD.lista) return MD.lista; try{const o=JSON.parse(lsGet(MD.cache)||"null"); if(o&&Array.isArray(o.lista)){MD.lista=o.lista; MD.at=+o.at||0}}catch(_){} return MD.lista||[] }
function mdCarregar(forca){
  mdLocal();
  if(!FB.user||!FB.db||!online()) return Promise.resolve(MD.lista||[]);
  if(!forca&&Date.now()-MD.at<6*3600e3) return Promise.resolve(MD.lista);
  if(MD.busy) return MD.busy;
  MD.busy=FB.db.collection("modelos").orderBy("criado","desc").limit(60).get().then(snap=>{
    MD.lista=snap.docs.map(d=>{const x=d.data(); return {id:d.id,nome:String(x.nome||"Modelo").slice(0,60),s:String(x.s||"")}}).filter(x=>mdParse(x.s).length);
    MD.at=Date.now(); lsSet(MD.cache,JSON.stringify({at:MD.at,lista:MD.lista})); return MD.lista;
  }).catch(e=>{console.warn("modelos",e); return MD.lista||[]}).finally(()=>{MD.busy=null});
  return MD.busy;
}
// parte do Inserir móvel (dialogos.js): botões dos modelos da comunidade
function mdBotoes(){
  const L=mdLocal(); if(!L.length) return "";
  return `<span class="lb">Modelos da comunidade</span><div class="tpls" data-com>${L.map(x=>`<button class="tpl" data-t="com_${esc(x.id)}" aria-pressed="false">${mdSvg(mdParse(x.s),56,48)}${esc(x.nome)}</button>`).join("")}</div>`;
}
function mdForm(id){
  const x=mdLocal().find(q=>q.id===id); if(!x) return "";
  const ms=mdParse(x.s);
  return `<p class="note">Modelo aprovado, montado a partir de móveis de marceneiros que usam o AutoMarcen. Depois ajuste as medidas no painel.</p><ul class="note" style="margin:0;padding-left:18px">${ms.map(o=>`<li>${esc(mdLinha(o))}</li>`).join("")}</ul><label class="f"><span class="lb">Nome</span><input class="in" id="iN" value="${esc(x.nome)}"></label>`;
}
function mdInserir(id,nome){
  const x=mdLocal().find(q=>q.id===id); if(!x) return;
  const ms=mdParse(x.s), mods=P.items.filter(i=>i.t==="mod"), x0=mods.length?Math.max(...mods.map(m=>m.x+m.W))+30:0, ids=[];
  pushUndo();
  for(const o of ms){const m=mdMod(o,x0); if(ms.length===1&&nome) m.name=nome.slice(0,40); P.items.push(m); ids.push(m.id)}
  sel=new Set(ids); closeDlg(); setTool("select"); afterEdit(); updCtx(); fit();
  toast(ms.length>1?`${ms.length} móveis inseridos. Toque em cada um para ajustar`:"Móvel inserido. Toque em Editar para ajustar");
}
// exemplos para a IA (foto e frase): no formato que ela responde, poucos e curtos
function mdExemplos(){
  const L=mdLocal().slice(0,6); if(!L.length) return "";
  const ex=L.map(x=>JSON.stringify({moveis:mdParse(x.s).slice(0,4).map(o=>({tipo:TPL[o.tipo]?o.tipo:"livre",largura:o.W,altura:o.H,profundidade:o.D,altura_piso:o.elev||0,
    vaos:(o.secs||[]).map(s=>Object.assign({largura:s.w||0,tipo:s.type,qtd:s.n||0},s.lv?{folhas:s.lv}:{}))}))})).join("\n");
  return `\nModelos que marceneiros do AutoMarcen aprovaram (servem só de referência de proporções e divisões comuns quando a foto ou a frase não disser; nunca troque uma medida informada por eles):\n${ex.slice(0,3000)}`;
}

/* tela do dono: contribuições → aprovar (vira modelo) ou recusar (apaga). Iguais aparecem juntas */
async function showAprovar(aba){
  if(!ehDono()) return;
  aba=aba||"novos";
  dlg(`<h2>Aprovar modelos</h2><div class="seg"><button data-aba="novos" aria-pressed="${aba==="novos"}">Enviados</button><button data-aba="pub" aria-pressed="${aba==="pub"}">Publicados</button></div><div id="apL"><p class="note">Carregando…</p></div><div class="row act"><button class="btn ghost" data-x>Fechar</button></div>`,async el=>{
    $("[data-x]",el).onclick=closeDlg;
    $$("[data-aba]",el).forEach(b=>b.onclick=()=>showAprovar(b.dataset.aba));
    const box=$("#apL",el), vivo=()=>openDlg&&openDlg.contains(box);
    if(!online()){box.innerHTML=`<p class="warn">Sem internet. Conecte-se para ver os modelos.</p>`; return}
    try{
      if(aba==="pub"){
        const L=await mdCarregar(true); if(!vivo()) return;
        box.innerHTML=L.length?L.map(x=>`<div class="callout" style="grid-template-columns:auto 1fr;align-items:center">${mdSvg(mdParse(x.s),72,60)}<div><b>${esc(x.nome)}</b><ul class="note" style="margin:4px 0;padding-left:18px">${mdParse(x.s).map(o=>`<li>${esc(mdLinha(o))}</li>`).join("")}</ul><button class="btn sm" data-tirar="${esc(x.id)}">Tirar do app</button></div></div>`).join(""):`<p class="note">Nenhum modelo publicado ainda.</p>`;
        box.onclick=async e=>{const b=e.target.closest("[data-tirar]"); if(!b) return; b.disabled=true;
          try{await FB.db.collection("modelos").doc(b.dataset.tirar).delete(); await mdCarregar(true); toast("Modelo tirado do app"); showAprovar("pub")}catch(err){b.disabled=false; toast("Não deu certo. Tente de novo")}};
        return;
      }
      const snap=await FB.db.collection("contribuicoes").orderBy("quando","desc").limit(100).get(); if(!vivo()) return;
      const grupos=new Map();
      for(const d of snap.docs){const x=d.data(), ms=mdParse(x.s); if(!ms.length) continue; const k=JSON.stringify(ms);
        if(!grupos.has(k)) grupos.set(k,{ms,ids:[],quando:x.quando&&x.quando.toDate?x.quando.toDate():null}); grupos.get(k).ids.push(d.id)}
      const G=[...grupos.values()];
      if(!G.length){box.innerHTML=`<p class="note">Nada novo por enquanto. Os móveis chegam aqui quando alguém liga “Ajudar a melhorar os modelos” em Minha conta.</p>`; return}
      box.innerHTML=`<p class="note">${G.length} formato${G.length>1?"s":""} enviado${G.length>1?"s":""}. Aprovar publica para todos no botão Móvel e serve de exemplo para a IA. Recusar apaga.</p>`+G.map((g,i)=>`<div class="callout" data-g="${i}">
        <div style="display:flex;gap:10px;align-items:center">${mdSvg(g.ms,96,72)}<div class="note">${g.ids.length>1?`<b>${g.ids.length} pessoas enviaram igual</b><br>`:""}${g.quando?g.quando.toLocaleDateString("pt-BR"):""}</div></div>
        ${g.ms.map((o,j)=>`<label class="chk"><input type="checkbox" data-mv="${j}" checked> <span>${esc(mdLinha(o))}</span></label>`).join("")}
        <label class="f"><span class="lb">Nome do modelo</span><input class="in" data-nome value="${esc(mdNome(g.ms))}" maxlength="60"></label>
        <div class="row"><button class="btn ghost" data-rec>Recusar</button><button class="btn pri" data-ok>Aprovar</button></div></div>`).join("");
      box.onclick=async e=>{
        const b=e.target.closest("[data-ok],[data-rec]"); if(!b) return;
        const c=b.closest("[data-g]"), g=G[+c.dataset.g]; $$("button",c).forEach(x=>x.disabled=true);
        try{
          if(b.matches("[data-ok]")){
            const ms=g.ms.filter((_,j)=>$(`[data-mv="${j}"]`,c).checked); if(!ms.length){$$("button",c).forEach(x=>x.disabled=false); return toast("Marque pelo menos um móvel")}
            const x0=Math.min(...ms.map(o=>+o.x||0)), lim=ms.map(o=>Object.assign({},o,{x:ctN((+o.x||0)-x0)}));
            await FB.db.collection("modelos").add({nome:$("[data-nome]",c).value.trim().slice(0,60)||mdNome(lim),n:lim.length,s:JSON.stringify({moveis:lim}),criado:firebase.firestore.FieldValue.serverTimestamp()});
            mdCarregar(true);
          }
          for(const id of g.ids) await FB.db.collection("contribuicoes").doc(id).delete();
          c.remove(); toast(b.matches("[data-ok]")?"Aprovado: já aparece em Móvel → Modelos da comunidade":"Recusado e apagado");
          if(!$("[data-g]",box)) box.innerHTML=`<p class="note">Tudo revisado.</p>`;
        }catch(err){ console.warn(err); $$("button",c).forEach(x=>x.disabled=false); toast(err&&err.code==="permission-denied"?"O Firestore recusou: confira se as regras v4 estão publicadas":"Não deu certo. Tente de novo") }
      };
    }catch(err){ console.warn(err); if(vivo()) box.innerHTML=`<p class="warn">Não consegui abrir${err&&err.code==="permission-denied"?": o Firestore recusou (regras v4 e o seu UID)":""}. Tente de novo.</p>` }
  },"aprovar");
}
