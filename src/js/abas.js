/* ===================== abas ===================== */
let curView="draw";
$$("[data-view]").forEach(b=>b.onclick=()=>setView(b.dataset.view));
function setView(v){
  curView=v; $$("[data-view]").forEach(b=>b.setAttribute("aria-selected",b.dataset.view===v));
  for(const k of ["draw","3d","parts","quote"]) $("#v-"+k).hidden=k!==v;
  closePanel(); closeDlg();
  if(v==="draw"){resize(); draw()}
  if(v==="3d"){
    if(!window.THREE||!window.THREE.OrbitControls){
      $("#b3d").hidden=true; show3DEmpty("wait");
      lib("3d").then(()=>{if(curView==="3d") setView("3d")},()=>{if(curView==="3d") show3DEmpty("load")}); return}
    const t=init3D(); if(!t){$("#b3d").hidden=true; show3DEmpty("fail"); return}
    size3D(); const wasDirty=dirty3D||!t.group.children.length; build3D(); if(wasDirty||!t._placed){cam3D("iso"); t._placed=true}
    if(!loop3D){loop3D=true; tick3D()}
  }
  if(v==="parts") renderParts();
  if(v==="quote") renderQuote();
  lsSet(KEY+"-view",v);
}

