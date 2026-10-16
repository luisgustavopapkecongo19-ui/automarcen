/* ===================== HUD, coordenadas, contexto ===================== */
const TOOLS=[
  ["select","Selecionar","V",'<path d="M5 3l14 8-6 2-2 6z"/>'],
  ["insert","Móvel","N",'<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M12 3v18M9 11v2M15 11v2"/>'],
  "-",
  ["line","Linha","L",'<path d="M5 19 19 5"/><circle cx="5" cy="19" r="1.6"/><circle cx="19" cy="5" r="1.6"/>'],
  ["rect","Retâng.","R",'<rect x="4" y="6" width="16" height="12" rx="1"/>'],
  ["circle","Círculo","C",'<circle cx="12" cy="12" r="8"/><path d="M12 12h8"/>'],
  ["dim","Cota","D",'<path d="M4 7v10M20 7v10M4 12h16"/><path d="m6 10-2 2 2 2M18 10l2 2-2 2"/>'],
  ["text","Texto","T",'<path d="M5 6V4h14v2M12 4v16M9 20h6"/>'],
  "-",
  ["measure","Medir","M",'<path d="M3 17 17 3l4 4L7 21z"/><path d="m7 13 2 2M10 10l2 2M13 7l2 2"/>'],
  ["free","Lápis","P",'<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>'],
  ["erase","Apagar","E",'<path d="M8 20h12"/><path d="m4 15 9-9 6 6-7 7H8z"/><path d="m9 10 6 6"/>'],
  ["pan","Mover vista","H",'<path d="M12 3v18M3 12h18"/><path d="m9 6 3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"/>']
];
const MSG={
  select:"Toque para selecionar, arraste para mover",
  line:["Linha: primeiro ponto","Próximo ponto ou digite o comprimento"],
  rect:["Retângulo: primeiro canto","Canto oposto ou digite L x A"],
  circle:["Círculo: centro","Raio: toque ou digite o valor"],
  dim:["Cota: primeiro ponto","Cota: segundo ponto","Posicione a linha de cota"],
  measure:["Medir: primeiro ponto","Medir: segundo ponto","Toque para medir de novo"],
  text:"Toque onde o texto vai ficar", free:"Desenhe à mão livre",
  erase:"Toque ou arraste sobre o que quer apagar", pan:"Arraste para mover a vista"
};
function buildRail(){
  $("#rail").innerHTML=TOOLS.map(t=>t==="-"?"<hr>":`<button class="tb${t[0]==="insert"?" cta":""}" data-tool="${t[0]}" aria-pressed="${t[0]===tool}" title="${t[1]} (${t[2]})" aria-label="${t[1]}"><svg class="i" viewBox="0 0 24 24">${t[3]}</svg><span class="tl">${t[1]}</span><kbd>${t[2]}</kbd></button>`).join("");
}
$("#rail").addEventListener("click",e=>{const b=e.target.closest("[data-tool]"); if(!b) return; const t=b.dataset.tool; if(t==="insert") return showInsert(); setTool(t)});
function setTool(t){
  if(st&&st.tool==="line"&&tool!==t) finishChain();
  tool=t; st=null; snapMark=null; hoverId=null;
  if(t!=="select"&&sel.size){sel.clear(); renderPanel()}
  $$("#rail [data-tool]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.tool===t));
  cv.className=t==="select"?"sel":t==="pan"?"pan":"";
  updHUD(); updCtx(); draw();
}
function cancelTool(){ if(st){st=null; updHUD(); draw()} else if(sel.size){sel.clear(); renderPanel(); updCtx(); draw()} else if(tool!=="select") setTool("select") }
let hudRead="";
function showHUDRead(t){hudRead=t; $("#rd").textContent=t}
function updHUD(){
  let m=MSG[tool], stage=0;
  if(st){ if(st.tool==="dim") stage=st.stage===2?2:(st.fresh?0:1); else if(st.tool==="measure") stage=st.result?2:(st.fresh?0:1); else stage=1 }
  if(st&&st.fresh&&st.tool!=="dim"&&st.tool!=="measure") stage=1;
  const msg=Array.isArray(m)?m[Math.min(stage,m.length-1)]:m;
  $("#msg").textContent=msg||"";
  const numOn=!!st&&["line","rect","circle"].includes(st.tool)||(st&&st.tool==="dim"&&st.stage===2);
  $("#numBox").hidden=!numOn;
  if(numOn) numIn.placeholder=st.tool==="line"?`comprimento (${P.unit})`:st.tool==="rect"?`L x A (${P.unit})`:st.tool==="circle"?`raio (${P.unit})`:`afastamento`;
  const btns=[];
  if(st&&st.tool==="line"&&st.pts.length>1) btns.push(`<button class="btn sm" data-h="done">Concluir</button>`);
  if(st&&st.tool==="line"&&st.pts.length>2) btns.push(`<button class="btn sm" data-h="close">Fechar</button>`);
  if(st&&st.tool!=="box") btns.push(`<button class="btn sm ghost" data-h="cancel">Cancelar</button>`);
  $("#hudBtns").innerHTML=btns.join("");
  if(!st) showHUDRead("");
}
$("#hudBtns").addEventListener("click",e=>{const h=e.target.closest("[data-h]")?.dataset.h; if(h==="done") finishChain(); if(h==="close") closeChain(); if(h==="cancel") cancelTool()});
function updCoords(w){$("#coords").textContent=`X ${fmtL(w[0])} · Y ${fmtL(-w[1])} ${P.unit}`}
const isNarrow=()=>matchMedia("(max-width:900px)").matches;
function modCard(m){
  const u=P.unit, f=v=>num(toU(v),u==="mm"?0:1), n=(m.secs||[]).length;
  return `<div class="ch"><div><b>${esc(m.name||"Móvel")}</b><small>${f(m.W)} × ${f(m.H)} × ${f(m.D)} ${u}${n?` · ${n} vão${n>1?"s":""}`:""}</small></div><button class="cx" data-c="close" aria-label="Fechar"><svg class="i" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
  <div class="cdims">${[["W","Largura"],["H","Altura"],["D","Profund."]].map(([k,l])=>`<label>${l} (${u})<input class="in n" data-q="${k}" value="${toU(m[k])}" inputmode="decimal" enterkeyhint="done"></label>`).join("")}</div>
  <div class="cacts"><button data-c="edit" class="pri"><svg class="i" viewBox="0 0 24 24"><path d="M4 20l1-4L16 5l3 3L8 19z"/></svg>Editar</button><button data-c="3d"><svg class="i" viewBox="0 0 24 24"><path d="M12 3 4 7.5v9L12 21l8-4.5v-9z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/></svg>3D</button><button data-c="cor" aria-label="Cor do móvel"><span class="cdot" style="background:${finBg(FIN[m.ff]||FIN[0])}"></span>Cor</button><button data-c="dup" class="io" aria-label="Duplicar" title="Duplicar"><svg class="i" viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg></button><button data-c="del" class="del io" aria-label="Excluir" title="Excluir"><svg class="i" viewBox="0 0 24 24"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/></svg></button></div>`;
}
function updCtx(){
  const c=$("#ctx"); if(!sel.size||tool!=="select"){c.hidden=true; c.classList.remove("mcard"); return}
  const items=selItems(), one=items.length===1?items[0]:null, conv=!items.some(i=>i.t==="mod")&&!!convCandidates();
  if(one&&one.t==="mod"&&isNarrow()){ if(c.contains(document.activeElement)&&document.activeElement.dataset.q) return; c.classList.add("mcard"); c.innerHTML=modCard(one); c.hidden=false; return }
  c.classList.remove("mcard");
  c.innerHTML=`${conv?`<button data-c="conv" class="go"><svg class="i" viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M12 3v18M9.5 11v2M14.5 11v2"/></svg>Gerar móvel</button>`:""}<button data-c="edit" class="only-m"><svg class="i" viewBox="0 0 24 24"><path d="M4 20l1-4L16 5l3 3L8 19z"/></svg>Editar</button>
    ${one&&one.t==="mod"?`<button data-c="3d"><svg class="i" viewBox="0 0 24 24"><path d="M12 3 4 7.5v9L12 21l8-4.5v-9z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/></svg>3D</button>`:""}
    <button data-c="dup"><svg class="i" viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>Duplicar</button>
    ${items.some(i=>i.t!=="mod"&&i.t!=="text")?`<button data-c="rot"><svg class="i" viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>Girar</button>`:""}
    <button data-c="del" class="del"><svg class="i" viewBox="0 0 24 24"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/></svg>Excluir</button>`;
  c.hidden=false;
}
$("#ctx").addEventListener("click",e=>{const a=e.target.closest("[data-c]")?.dataset.c; if(!a) return;
  if(a==="close"){sel.clear(); renderPanel(); updCtx(); draw(); return}
  if(a==="conv") return showConvert(); if(a==="edit") openPanel("props"); if(a==="cor") showFin(); if(a==="del") delSel(); if(a==="dup") dupSel(); if(a==="rot") rotSel(); if(a==="3d") setView("3d")});
$("#ctx").addEventListener("change",e=>{const k=e.target.dataset.q; if(!k) return; const one=selItems().length===1?selItems()[0]:null; if(!one||one.t!=="mod") return;
  const cm=parseN(e.target.value)/U(); if(!(cm>=10)){e.target.value=toU(one[k]); return toast("Use uma medida a partir de 10 cm")}
  pushUndo(); if(k==="H"){const bottom=one.y+one.H; one.H=cm; one.y=bottom-cm} else one[k]=cm; e.target.blur(); afterEdit()});
$("#ctx").addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.dataset.q){e.preventDefault(); e.target.blur()}});
addEventListener("resize",()=>{updCtx(); updSave()});
/* abre o painel já nas cores (acabamentos) do móvel */
function showFin(){openPanel("props"); const g=$("#pbody [data-fb]")?.closest(".grp"); if(g) requestAnimationFrame(()=>g.scrollIntoView({block:"start",behavior:"smooth"}))}
function delSel(){if(!sel.size) return; pushUndo(); P.items=P.items.filter(i=>!sel.has(i.id)); sel.clear(); afterEdit(); updCtx()}
function dupSel(){if(!sel.size) return; pushUndo(); const d=P.grid*2, ns=new Set();
  for(const it of selItems()){const c=JSON.parse(JSON.stringify(it)); c.id=uid(); if(c.t==="mod"){c.x+=c.W; c.name=c.name+" (cópia)"} else translate(c,d,d); P.items.push(c); ns.add(c.id)}
  sel=ns; afterEdit(); updCtx()}
function rotSel(){pushUndo(); for(const it of selItems()) rotate90(it); afterEdit()}

/* teclado */
addEventListener("keydown",e=>{
  if(openDlg){ if(e.key==="Escape") closeDlg(); return }
  const tag=(e.target.tagName||"").toLowerCase(); if(tag==="input"||tag==="textarea"||tag==="select") return;
  if(curView!=="draw") return;
  const k=e.key;
  if((e.ctrlKey||e.metaKey)&&k.toLowerCase()==="z"){e.preventDefault(); e.shiftKey?doRedo():doUndo(); return}
  if((e.ctrlKey||e.metaKey)&&k.toLowerCase()==="y"){e.preventDefault(); doRedo(); return}
  if((e.ctrlKey||e.metaKey)&&k.toLowerCase()==="d"){e.preventDefault(); dupSel(); return}
  if((e.ctrlKey||e.metaKey)&&k.toLowerCase()==="a"){e.preventDefault(); sel=new Set(P.items.filter(editable).map(i=>i.id)); renderPanel(); updCtx(); draw(); return}
  if(e.ctrlKey||e.metaKey||e.altKey) return;
  if(k===" "){spaceDown=true; e.preventDefault(); return}
  if(k==="Escape"){if(H.open&&!st&&!sel.size) closeHelp(); else cancelTool(); return}
  if(k==="Delete"||k==="Backspace"){if(sel.size){e.preventDefault(); delSel()} return}
  if(k==="Enter"){if(st&&st.tool==="line") finishChain(); return}
  if(k==="F8"){e.preventDefault(); toggleOpt("ortho"); return}
  if(k==="F3"){e.preventDefault(); toggleOpt("osnap"); return}
  if(k==="F9"){e.preventDefault(); toggleOpt("grid"); return}
  if(st&&!$("#numBox").hidden&&/^[0-9.,<xd-]$/i.test(k)){numIn.focus(); numIn.value+=k; e.preventDefault(); return}
  const map={v:"select",l:"line",r:"rect",c:"circle",d:"dim",t:"text",m:"measure",p:"free",e:"erase",h:"pan"};
  if(map[k.toLowerCase()]) setTool(map[k.toLowerCase()]);
  else if(k.toLowerCase()==="n") showInsert();
  else if(k.toLowerCase()==="z") fit();
});
addEventListener("keyup",e=>{if(e.key===" ") spaceDown=false});

function toggleOpt(k){opt[k]=!opt[k]; $("#t"+{grid:"Grid",osnap:"Osnap",ortho:"Ortho"}[k]).setAttribute("aria-pressed",opt[k]); toast({grid:"Grade",osnap:"Encaixe em objetos",ortho:"Modo ortogonal"}[k]+(opt[k]?" ligado":" desligado"))}
$("#tInt").onclick=()=>setShowInt(!P.showInt,true);
$("#tGrid").onclick=()=>toggleOpt("grid"); $("#tOsnap").onclick=()=>toggleOpt("osnap"); $("#tOrtho").onclick=()=>toggleOpt("ortho");
$("#bFit").onclick=fit;
$("#tScale").onclick=()=>{const g=[1,5,10]; P.grid=g[(g.indexOf(P.grid)+1)%g.length]; updScale(); save(); draw(); renderPanel()};
function updScale(){$("#tScale").textContent=`□ ${P.unit==="mm"?P.grid*10+" mm":P.grid+" cm"}`}

