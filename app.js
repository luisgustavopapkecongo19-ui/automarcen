"use strict";
/* Croqui 3D instalado: funciona sem internet (service worker), botão Instalar app e armazenamento persistente */
(()=>{
  if("serviceWorker" in navigator){
    const had=!!navigator.serviceWorker.controller;
    navigator.serviceWorker.register("sw.js").then(reg=>{
      reg.addEventListener("updatefound",()=>{
        const w=reg.installing; if(!w) return;
        w.addEventListener("statechange",()=>{
          if(w.state==="activated"&&had&&typeof toast==="function") toast("Nova versão do Croqui 3D pronta. Feche e abra de novo para usar");
          if(w.state==="activated"&&!had&&typeof toast==="function") toast("Pronto: o Croqui 3D agora abre também sem internet");
        });
      });
    }).catch(()=>{});
  }
  // pede ao navegador para não apagar os projetos quando o aparelho fica sem espaço
  try{ if(navigator.storage&&navigator.storage.persist) navigator.storage.persisted().then(p=>p||navigator.storage.persist()).catch(()=>{}) }catch(_){}

  // botão "Instalar app" (Chrome no Android e no computador)
  let ev=null;
  const acts=document.querySelector(".acts");
  const b=document.createElement("button");
  b.className="btn sm pri"; b.id="bInstall"; b.hidden=true; b.style.marginRight="4px"; b.style.alignSelf="center";
  b.title="Instalar o Croqui 3D como app"; b.textContent="Instalar app";
  if(acts) acts.prepend(b);
  addEventListener("beforeinstallprompt",e=>{e.preventDefault(); ev=e; b.hidden=false});
  b.onclick=async()=>{ if(!ev) return; ev.prompt(); try{await ev.userChoice}catch(_){} ev=null; b.hidden=true };
  addEventListener("appinstalled",()=>{b.hidden=true; if(typeof toast==="function") toast("Croqui 3D instalado. Procure o ícone na tela inicial")});
})();
