/* ===== termos de uso (com o uso aceitável) e privacidade: aceite obrigatório para usar a conta. Só na versão instalável =====
   O texto fica na página termos/index.html do site. TM_VER é a versão em vigor: ao mudar o texto de forma importante, suba TM_VER,
   a VERSAO de termos/index.html e o mínimo em aceitou() de firestore.rules; quem já tem conta aceita de novo ao abrir o app.
   O aceite fica na conta, em users/{uid}/conta/termos ({v, app, aceito}), e também neste aparelho, para não ler toda vez.
   Sem o aceite, a conta fica entrada mas parada: não sincroniza, não usa a IA e não manda nada (modelos.js e falhas.js conferem tmOk). */
const TM_VER=1, TM_URL="termos/";
const TM={key:"automarcen-termos-", marcado:false, sessao:null};
const tmOk=()=>!!(FB.user&&(TM.sessao===FB.user.uid||(+lsGet(TM.key+FB.user.uid)||0)>=TM_VER));
const tmLinks=()=>`os <a href="${TM_URL}#termos" target="_blank" rel="noopener">Termos de uso</a> e a <a href="${TM_URL}#privacidade" target="_blank" rel="noopener">Política de privacidade</a>`;
const tmCaixa=id=>`<label class="chk"><input type="checkbox" id="${id}"> <span>Li e aceito ${tmLinks()} do AutoMarcen</span></label>`;
function tmGravar(u){
  TM.sessao=u.uid; // vale já nesta abertura; no aparelho, só depois que a conta confirmar
  return FB.db.collection("users").doc(u.uid).collection("conta").doc("termos")
    .set({v:TM_VER,app:APP_VER,aceito:firebase.firestore.FieldValue.serverTimestamp()})
    .then(()=>lsSet(TM.key+u.uid,String(TM_VER)))
    .catch(e=>console.warn("termos: o aceite não foi gravado na conta (regras v5 ainda não publicadas?)",e));
}
// ao entrar: já aceitou esta versão? Primeiro o aparelho, depois a conta. Quem marcou a caixa no Entrar grava agora
async function tmConferir(u){
  if(TM.sessao===u.uid||(+lsGet(TM.key+u.uid)||0)>=TM_VER) return true;
  if(TM.marcado){TM.marcado=false; tmGravar(u); return true}
  try{
    const s=await FB.db.collection("users").doc(u.uid).collection("conta").doc("termos").get();
    if(s.exists&&(+s.data().v||0)>=TM_VER){lsSet(TM.key+u.uid,String(TM_VER)); return true}
  }catch(e){console.warn("termos",e)}
  return false;
}
// conta entrada sem o aceite desta versão (conta antiga ou termos novos): aceitar ou sair
function tmPedir(u){
  if(FB.user!==u) return;
  dlg(`<h2>Termos do AutoMarcen</h2>
    <p>Para continuar usando a sua conta, leia e aceite os termos. Eles dizem o que pode e o que não pode ser feito com o app e como cuidamos dos seus dados.</p>
    <p class="note">Com o aceite, o app manda uma cópia <b>sem identificação</b> só do formato dos seus móveis, para montar modelos melhores, e um aviso curto e anônimo quando alguma parte falha. A IA analisa o projeto aberto quando você pede ajuda a ela. Não vai nome, cliente, preço, telefone, foto nem a sua conta.</p>
    ${tmCaixa("tmOk")}
    <div class="row act"><button class="btn ghost" data-out>Sair da conta</button><button class="btn pri" data-ok disabled>Aceitar e continuar</button></div>`,el=>{
    const s=el.parentNode; s.addEventListener("pointerdown",e=>{if(e.target===s) e.stopImmediatePropagation()},true); // tocar fora não fecha
    $("#tmOk",el).onchange=e=>{$("[data-ok]",el).disabled=!e.target.checked};
    $("[data-ok]",el).onclick=()=>{ if(FB.user!==u) return closeDlg(); tmGravar(u); closeDlg(); fbLigar(u); toast("Pronto: seus projetos agora vão para a sua conta") };
    $("[data-out]",el).onclick=async()=>{try{await FB.auth.signOut(); closeDlg(); toast("Você saiu da conta. Os projetos continuam neste aparelho")}catch(e){toast(fbMsg(e))}};
  },"termos");
}
// parte de Minha conta
function tmBloco(){
  return `<div class="grp"><b>Termos e privacidade</b>
    <span class="note">Você aceitou a versão ${TM_VER} dos termos. Por eles, o app manda uma cópia <b>sem identificação</b> só do formato dos seus móveis (medidas, vãos, portas, gavetas, interior, puxador e cor), para montar modelos prontos melhores para todos, e um aviso curto e anônimo quando alguma parte do app falha. A IA analisa o projeto aberto quando você pede ajuda a ela. <b>Não vai</b> nome do projeto ou do móvel, cliente, preço, telefone, foto nem a sua conta.</span>
    <a class="note" href="${TM_URL}" target="_blank" rel="noopener">Ler os termos de uso e a privacidade</a></div>`;
}
