/* ===================== diálogos ===================== */
let openDlg=null;
function dlg(html,mount,kind){
  closeDlg(); const s=document.createElement("div"); s.className="scrim";
  s.innerHTML=`<div class="dlg" role="dialog" aria-modal="true">${html}</div>`; s.dataset.kind=kind||"";
  s.addEventListener("pointerdown",e=>{if(e.target===s) closeDlg()});
  document.body.appendChild(s); openDlg=s; mount&&mount(s.firstChild);
  const f=s.querySelector("[autofocus]"); if(f&&matchMedia("(pointer:fine)").matches) setTimeout(()=>f.focus(),40);
}
function closeDlg(){if(openDlg){openDlg.remove(); openDlg=null}}
let toastT=0;
function toast(t){$$(".toast").forEach(x=>x.remove()); const d=document.createElement("div"); d.className="toast"; d.textContent=t; document.body.appendChild(d); clearTimeout(toastT); toastT=setTimeout(()=>d.remove(),2200)}

function askText(pos){
  dlg(`<h2>Adicionar texto</h2>
    <textarea class="in" id="tIn" rows="3" placeholder="ex.: MDF 18 mm, puxador perfil" autofocus></textarea>
    <label class="f"><span class="lb">Altura do texto</span>${uIn("x",toU(P.textH*1.2)).replace('data-k="x"','id="tH"')}</label>
    <div class="row"><button class="btn ghost" data-x>Cancelar</button><button class="btn pri" data-ok>Adicionar</button></div>`,el=>{
    const ok=()=>{const v=$("#tIn",el).value.trim(); const h=parseN($("#tH",el).value)/U(); if(v) addItem({t:"text",p:pos,s:v,h:h>0?h:P.textH}); closeDlg()};
    $("[data-ok]",el).onclick=ok; $("[data-x]",el).onclick=closeDlg;
  });
}
function askLayer(){
  dlg(`<h2>Nova camada</h2><input class="in" id="lIn" placeholder="ex.: Elétrica, Bancada, Iluminação" maxlength="30" autofocus>
    <div class="row"><button class="btn ghost" data-x>Cancelar</button><button class="btn pri" data-ok>Criar</button></div>`,el=>{
    const ok=()=>{const v=$("#lIn",el).value.trim(); if(!v) return; const id=uid(); P.layers.push({id,name:v,color:"#0ea5e9",visible:true,locked:false}); P.curLayer=id; save(); closeDlg(); setPtab("layers")};
    $("[data-ok]",el).onclick=ok; $("[data-x]",el).onclick=closeDlg; $("#lIn",el).addEventListener("keydown",e=>{if(e.key==="Enter")ok()});
  });
}
function showInsert(){
  let cur="balcao";
  const form=k=>{
//#if app
    if(k.startsWith("com_")) return mdForm(k.slice(4));
//#endif
    if(k.startsWith("kit_")){const K=KITS[k.slice(4)]; return `<p class="note">${esc(K.note)}</p><label class="f"><span class="lb">Nome</span><input class="in" id="iN" value="${esc(K.name)}"></label>`}
    const t=TPL[k]; return `<div class="r3">
      <label class="f"><span class="lb">Largura</span>${uIn("W",toU(t.W)).replace('data-k="W"','id="iW"')}</label>
      <label class="f"><span class="lb">Altura</span>${uIn("H",toU(t.H)).replace('data-k="H"','id="iH"')}</label>
      <label class="f"><span class="lb">Profund.</span>${uIn("D",toU(t.D)).replace('data-k="D"','id="iD"')}</label></div>
      <div class="r2"><label class="f"><span class="lb">Nome</span><input class="in" id="iN" value="${t.name}"></label>
      <label class="f"><span class="lb">Altura do piso</span>${uIn("E",toU(t.elev)).replace('data-k="E"','id="iE"')}</label></div>`};
  dlg(`<h2>Inserir móvel</h2>
    <div class="quick2"><button class="btn" data-photo><svg class="i" viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>Croqui por foto</button><button class="btn" data-voice><svg class="i" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>Falar ou escrever</button></div>
    <p>Ou escolha um modelo. Depois você ajusta vãos, portas, gavetas e acabamentos no painel.</p>
    <div class="tpls">${Object.keys(TPL).map(k=>`<button class="tpl" data-t="${k}" aria-pressed="${k===cur}"><svg viewBox="0 0 56 48">${TPL_ICON[k]}</svg>${TPL[k].name}</button>`).join("")}${Object.keys(KITS).map(k=>`<button class="tpl" data-t="kit_${k}" aria-pressed="false"><svg viewBox="0 0 56 48">${TPL_ICON["kit_"+k]}</svg>${KITS[k].name}</button>`).join("")}</div>
    <div id="iCom">${typeof mdBotoes==="function"?mdBotoes():""}</div>
    <div id="iForm">${form(cur)}</div>
    <div class="row act"><button class="btn ghost" data-x>Cancelar</button><button class="btn pri" data-ok>Inserir</button></div>`,el=>{
    el.addEventListener("click",e=>{const b=e.target.closest(".tpl[data-t]"); if(!b) return; cur=b.dataset.t; $$("[data-t]",el).forEach(x=>x.setAttribute("aria-pressed",x===b)); $("#iForm",el).innerHTML=form(cur)});
//#if app
    // modelos da comunidade: mostra os guardados e renova em segundo plano
    mdCarregar().then(()=>{const c=$("#iCom",el); if(c&&openDlg&&openDlg.contains(c)&&!cur.startsWith("com_")) c.innerHTML=mdBotoes()});
//#endif
    $("[data-x]",el).onclick=closeDlg; $("[data-photo]",el).onclick=showPhoto; $("[data-voice]",el).onclick=showVoice;
    $("[data-ok]",el).onclick=()=>{
      if(cur.startsWith("kit_")) return insertKit(cur.slice(4),$("#iN",el).value.trim());
//#if app
      if(cur.startsWith("com_")) return mdInserir(cur.slice(4),$("#iN",el).value.trim());
//#endif
      const g=id=>parseN($(id,el).value)/U();
      const W=g("#iW"),H=g("#iH"),D=g("#iD"),E=Math.max(0,g("#iE")||0);
      if(!(W>=10&&H>=10&&D>=10)) return toast("Confira as medidas: mínimo de 10 cm");
      const mods=P.items.filter(i=>i.t==="mod"), isUpper=E>=100, up=m=>(-(m.y+m.H))>=100;
      const same=mods.filter(m=>isUpper?up(m):!up(m));
      let x=same.length?Math.max(...same.map(m=>m.x+m.W)):(mods.length?Math.min(...mods.map(m=>m.x)):0);
      const m=makeModule(cur,{name:$("#iN",el).value.trim()||TPL[cur].name,W,H,D,x,elev:E});
      if(cur==="aereo"||E>0) m.plinth=0;
      pushUndo(); P.items.push(m); sel=new Set([m.id]); closeDlg(); setTool("select"); afterEdit(); updCtx();
      const b=itemBounds(m), a=toS([b[0],b[1]]), z=toS([b[2],b[3]]);
      if(a[0]<0||a[1]<60||z[0]>CW||z[1]>CH-60) fit();
      if(matchMedia("(max-width:900px)").matches) toast("Toque em Editar para ajustar vãos e acabamentos");
    };
  });
}

function insertKit(k,label){
  const K=KITS[k], mods=P.items.filter(i=>i.t==="mod"), x0=mods.length?Math.max(...mods.map(m=>m.x+m.W))+30:0, ids=[];
  pushUndo();
  for(const [tk,o] of K.mods){const m=makeModule(tk,Object.assign({},JSON.parse(JSON.stringify(o)),{x:x0+(o.x||0)})); if(/aereo/.test(tk)||(o.elev||0)>0) m.plinth=o.plinth??0; P.items.push(m); ids.push(m.id)}
  if(K.panel){const q=K.panel, r={id:uid(),t:"rect",layer:"moveis",col:"layer",lw:1.2,a:[x0+q.x0,-q.y1],b:[x0+q.x1,-q.y0],dep:q.dep}; P.items.push(r); ids.push(r.id)}
  sel=new Set(ids); closeDlg(); setTool("select"); afterEdit(); updCtx(); fit();
  toast(`${K.name} inserido. Toque em cada móvel para ajustar`);
}

