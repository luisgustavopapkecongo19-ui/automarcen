/* ===== conta AutoMarcen (Firebase): entrar com Google ou e-mail e salvar os projetos na nuvem. Só na versão instalável =====
   Cada pessoa tem a própria pasta no Firestore: users/{uid}/projetos. As regras do Firestore só deixam o dono ler e gravar. */
const FB_CFG={
  apiKey:"AIzaSyC1z5Yj23AL9M0wOq24k_JW6lrhX7M3tmY",
  authDomain:"automarcen.firebaseapp.com",
  projectId:"automarcen",
  storageBucket:"automarcen.firebasestorage.app",
  messagingSenderId:"1035263726882",
  appId:"1:1035263726882:web:3a259b672c3913fd9d017b"
};
// chave do site do reCAPTCHA Enterprise para o App Check (protege a IA). Vazia = App Check desligado
const FB_RECAPTCHA="";
const FB={auth:null,db:null,user:null,unsub:null,ready:null,watching:false,known:false,appCheck:null};
function fbLoad(){
  if(FB.ready) return FB.ready;
  FB.ready=loadScript("vendor/firebase/app.js")
    .then(()=>Promise.all([loadScript("vendor/firebase/auth.js"),loadScript("vendor/firebase/firestore.js"),FB_RECAPTCHA?loadScript("vendor/firebase/app-check.js"):0]))
    .then(()=>{
      if(!firebase.apps.length) firebase.initializeApp(FB_CFG);
      if(FB_RECAPTCHA&&!FB.appCheck) try{FB.appCheck=firebase.appCheck(); FB.appCheck.activate(new firebase.appCheck.ReCaptchaEnterpriseProvider(FB_RECAPTCHA),true)}catch(e){FB.appCheck=null; console.warn("App Check",e)}
      FB.auth=firebase.auth(); FB.auth.languageCode="pt-BR";
      FB.db=firebase.firestore();
    }).catch(e=>{FB.ready=null; throw e});
  return FB.ready;
}
async function fbInit(){
  try{await fbLoad()}catch(_){SV.cloud="off"; updSave(); return}
  if(FB.watching){ if(FB.user&&!SV.col) fbUse(FB.user); return }
  FB.watching=true;
  FB.auth.onAuthStateChanged(u=>{FB.known=true; fbUse(u)});
}
function fbUse(u){
  if(FB.unsub){try{FB.unsub()}catch(_){} FB.unsub=null}
  const prev=FB.user&&FB.user.uid; FB.user=u||null;
  SV.col=null; SV.synced=false; SV.remote={}; SV.parts={}; SV.err=null;
  if(prev&&(!u||prev!==u.uid)){SV.dirty.clear(); SV.dead.clear()}
  if(!u){SV.cloud="off"; updSave(); updAcct(); return}
  FB.unsub=cloudAttach(FB.db.collection("users").doc(u.uid).collection("projetos"));
  updAcct();
}
function updAcct(){
  const b=document.querySelector('[data-m="acct"] span'); if(b) b.textContent=FB.user?"Minha conta":"Entrar na conta";
  if(openDlg&&openDlg.dataset.kind==="acct") showAcct();
}
const FB_ERR={
  "auth/invalid-email":"Confira o e-mail: ele não parece válido",
  "auth/missing-email":"Escreva o seu e-mail",
  "auth/missing-password":"Escreva a senha",
  "auth/invalid-credential":"E-mail ou senha incorretos",
  "auth/wrong-password":"E-mail ou senha incorretos",
  "auth/user-not-found":"Não há conta com este e-mail. Toque em Criar conta",
  "auth/email-already-in-use":"Este e-mail já tem conta. Toque em Entrar",
  "auth/weak-password":"A senha precisa ter pelo menos 6 caracteres",
  "auth/popup-blocked":"O navegador bloqueou a janela do Google. Permita janelas pop-up para este site e tente de novo",
  "auth/network-request-failed":"Sem conexão com a internet. Conecte-se e tente de novo",
  "auth/too-many-requests":"Muitas tentativas seguidas. Espere alguns minutos e tente de novo",
  "auth/unauthorized-domain":"Este endereço não está autorizado no Firebase (Authentication → Domínios autorizados)",
  "auth/operation-not-allowed":"Este jeito de entrar não está ligado no Firebase",
  "auth/user-disabled":"Esta conta foi desativada"
};
const fbMsg=e=>FB_ERR[e&&e.code]||("Não deu certo"+(e&&e.code?" ("+e.code.replace("auth/","")+")":"")+". Tente de novo");
const G_ICO='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z"/></svg>';
function showAcct(){
  if(FB.user){
    const u=FB.user, who=u.email||u.displayName||"sua conta";
    dlg(`<h2>Minha conta</h2>
      <p>Conectado como <b>${esc(who)}</b>. Os projetos ficam salvos na nuvem e aparecem em todos os aparelhos onde você entrar com esta conta.</p>
      <p class="note">Sem internet, o projeto fica salvo neste aparelho e sobe para a conta quando a conexão voltar. Ao sair da conta, os projetos continuam neste aparelho.</p>
      <div class="row act"><button class="btn ghost" data-x>Fechar</button><button class="btn" data-out>Sair da conta</button></div>`,el=>{
      $("[data-x]",el).onclick=closeDlg;
      $("[data-out]",el).onclick=async()=>{try{await FB.auth.signOut(); closeDlg(); toast("Você saiu da conta. Os projetos continuam neste aparelho")}catch(e){toast(fbMsg(e))}};
    },"acct");
    return;
  }
  dlg(`<h2>Entrar na conta</h2>
    <p>Com a conta, os projetos ficam salvos na nuvem e abrem no celular, no tablet e no computador.</p>
    <button class="btn" data-g style="width:100%;justify-content:center;gap:10px;padding:11px">${G_ICO}Entrar com Google</button>
    <p class="note" style="text-align:center">ou com e-mail e senha</p>
    <label class="f"><span class="lb">E-mail</span><input class="in" id="aE" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false"></label>
    <label class="f"><span class="lb">Senha</span><input class="in" id="aP" type="password" autocomplete="current-password" minlength="6"></label>
    <p class="note" id="aMsg" role="status">${online()?"":"Sem internet agora. Para entrar, conecte-se."}</p>
    <div class="row act"><button class="btn ghost" data-forgot>Esqueci a senha</button><button class="btn" data-new>Criar conta</button><button class="btn pri" data-in>Entrar</button></div>`,el=>{
    const msg=t=>{$("#aMsg",el).textContent=t};
    const E=()=>$("#aE",el).value.trim(), S=()=>$("#aP",el).value;
    const busy=on=>$$("button",el).forEach(b=>b.disabled=on);
    const run=async(f,okTxt)=>{
      msg(""); busy(true);
      try{await fbLoad(); if(!FB.watching) fbInit(); await f(); if(okTxt){closeDlg(); toast(okTxt)}}
      catch(e){ if(!(e&&/popup-closed|cancelled-popup/.test(e.code||""))) msg(fbMsg(e)) }
      finally{ if(openDlg&&openDlg.contains(el)) busy(false) }
    };
    $("[data-g]",el).onclick=()=>run(()=>FB.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider().setCustomParameters({prompt:"select_account"})),"Pronto: seus projetos agora vão para a sua conta");
    $("[data-in]",el).onclick=()=>run(()=>FB.auth.signInWithEmailAndPassword(E(),S()),"Pronto: seus projetos agora vão para a sua conta");
    $("[data-new]",el).onclick=()=>run(()=>FB.auth.createUserWithEmailAndPassword(E(),S()),"Conta criada. Seus projetos agora vão para a nuvem");
    $("[data-forgot]",el).onclick=()=>{ if(!E()) return msg("Escreva o seu e-mail acima e toque de novo em Esqueci a senha");
      run(async()=>{await FB.auth.sendPasswordResetEmail(E()); msg("Enviamos um e-mail para criar uma senha nova. Veja também a caixa de spam")}) };
    $("#aP",el).addEventListener("keydown",e=>{if(e.key==="Enter") $("[data-in]",el).click()});
  },"acct");
}
