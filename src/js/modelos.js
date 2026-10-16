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
