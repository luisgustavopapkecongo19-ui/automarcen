/* ===================== início ===================== */
/* aparência: tema (automático, claro, escuro) e tamanho das letras, guardados neste aparelho */
const LOOK_KEY="croqui3d-aparencia", FS=[[1,"Normal"],[1.15,"Grande"],[1.3,"Maior"]];
let LOOK={theme:"auto",fs:1}; try{Object.assign(LOOK,JSON.parse(lsGet(LOOK_KEY)||"{}"))}catch(_){}
function applyLook(){
  const r=document.documentElement; if(LOOK.theme==="auto") delete r.dataset.ui; else r.dataset.ui=LOOK.theme;
  r.style.setProperty("--fs",LOOK.fs||1); r.classList.toggle("bigtext",(LOOK.fs||1)>1);
  if(typeof C!=="undefined"&&P){readColors(); draw(); if(typeof resize==="function"&&curView==="draw") resize()}
}
applyLook();
function showLook(){
  const seg=(k,opts)=>`<div class="seg">${opts.map(([v,l])=>`<button data-look="${k}" data-v="${v}" aria-pressed="${String(LOOK[k])===String(v)}">${l}</button>`).join("")}</div>`;
  dlg(`<h2>Aparência</h2>
    <div class="grp"><span class="lb">Tema</span>${seg("theme",[["auto","Automático"],["light","Claro"],["dark","Escuro"]])}<span class="note">Automático segue o celular ou o computador. O escuro cansa menos a vista à noite.</span></div>
    <div class="grp"><span class="lb">Tamanho das letras</span>${seg("fs",FS)}<span class="note">Vale para menus, painéis e listas. As cotas do desenho mudam em Texto das cotas, no painel.</span></div>
    <div class="row"><button class="btn pri" data-x>Pronto</button></div>`,el=>{
    el.addEventListener("click",e=>{const b=e.target.closest("[data-look]"); if(!b) return; const k=b.dataset.look; LOOK[k]=k==="fs"?+b.dataset.v:b.dataset.v; lsSet(LOOK_KEY,JSON.stringify(LOOK)); applyLook(); $$(`[data-look="${k}"]`,el).forEach(x=>x.setAttribute("aria-pressed",x===b))});
    $("[data-x]",el).onclick=closeDlg;
  },"look");
}
$("#bLook").onclick=showLook;
function closeMore(){$("#moreMenu").hidden=true; $("#bMore").setAttribute("aria-expanded","false")}
$("#bMore").onclick=e=>{e.stopPropagation(); const m=$("#moreMenu"); m.hidden=!m.hidden; $("#bMore").setAttribute("aria-expanded",String(!m.hidden))};
$("#moreMenu").addEventListener("click",e=>{const a=e.target.closest("[data-m]")?.dataset.m; if(!a) return; closeMore();
  if(a==="look") showLook(); if(a==="export") showExport(); if(a==="proj") $("#bProj").click(); if(a==="org") showOrg();
//#if app
  if(a==="acct") showAcct();
//#endif
});
addEventListener("click",e=>{if(!$("#moreMenu").hidden&&!e.target.closest("#moreMenu,#bMore")) closeMore()});
addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#moreMenu").hidden) closeMore()});
$("#bUndo2").onclick=()=>doUndo(); $("#bRedo2").onclick=()=>doRedo();
function onTheme(){readColors(); draw()}
matchMedia("(prefers-color-scheme: dark)").addEventListener("change",onTheme);
new MutationObserver(onTheme).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme","data-ui"]});
load(); sampleCount=P.sample?P.items.length:-1; readColors(); buildRail(); setTool("select");
$("#bSave").onclick=()=>{const [k]=saveState(); if(k==="warn") showSaveHelp(); else saveNow()};
updSave(); initCloud();
addEventListener("offline",()=>{updSave(); toast("Sem internet. Pode continuar: o projeto fica salvo neste aparelho")});
addEventListener("online",()=>{SV.err=null; if(SV.cloud==="off"&&!SV.col) initCloud(); updSave(); if(SV.cloud==="on"&&SV.synced&&(SV.dirty.size||SV.dead.size)){toast("Internet de volta. Salvando na sua conta…"); cloudFlush()}});
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"&&saveT) flushSave()});
addEventListener("pagehide",()=>{if(saveT) flushSave()});
$("#projName").textContent=P.name; updScale(); updUndo(); renderPanel(); syncChips();
new ResizeObserver(()=>{if(curView==="draw") resize()}).observe(stage);
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(()=>{touch(); draw()});
let startView=lsGet(KEY+"-view")||"draw";
if(startView!=="draw") setView(startView);
checkNews();
const idle=window.requestIdleCallback||(f=>setTimeout(f,1));
setTimeout(()=>idle(()=>{lib("3d").catch(()=>{}).then(()=>idle(()=>lib("pdf").catch(()=>{})))},{timeout:3000}),2500);
