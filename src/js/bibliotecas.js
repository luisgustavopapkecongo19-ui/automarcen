"use strict";
/* bibliotecas grandes (3D e PDF) carregam sob demanda, para a tela abrir rápido */
const LIBS={};
function loadScript(src){return new Promise((ok,bad)=>{const s=document.createElement("script"); s.src=src; s.async=true; s.onload=ok; s.onerror=()=>{s.remove(); bad(new Error(src))}; document.head.appendChild(s)})}
function lib(k){
  if(LIBS[k]) return LIBS[k];
//#if app
  const p=k==="3d"?(window.THREE?Promise.resolve():loadScript("vendor/three.min.js")).then(()=>window.THREE.OrbitControls?0:loadScript("vendor/OrbitControls.js"))
//#else
  const p=k==="3d"?(window.THREE?Promise.resolve():loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js")).then(()=>window.THREE.OrbitControls?0:loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"))
//#endif
//#if app
    :(window.jspdf?Promise.resolve():loadScript("vendor/jspdf.umd.min.js"));
//#else
    :(window.jspdf?Promise.resolve():loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"));
//#endif
  return LIBS[k]=p.catch(e=>{delete LIBS[k]; throw e});
}
