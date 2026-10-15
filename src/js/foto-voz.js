/* ===================== montar móvel a partir de foto do croqui ou de uma frase (voz ou texto) ===================== */
const SPEC_TIPOS=["balcao","aereo","gaveteiro","armario","roupeiro","estante","comoda","escrivaninha","livre"];
const SEC_OK=["porta","porta2","gavetas","pgav","correr","nicho"];
function specToMods(spec){
  const list=(spec&&Array.isArray(spec.moveis)?spec.moveis:[]).slice(0,12), out=[];
  for(const v of list){
    const tk=SPEC_TIPOS.includes(v.tipo)?v.tipo:"livre", T=TPL[tk];
    const n=x=>{x=+x; return isFinite(x)&&x>0?x:0};
    let W=n(v.largura)||T.W, H=n(v.altura)||T.H, D=n(v.profundidade)||T.D;
    if(W>400||H>400||D>200){W/=W>400?10:1; H/=H>400?10:1; D/=D>200?10:1} // vieram em mm
    const secs=(Array.isArray(v.vaos)?v.vaos:[]).filter(s=>s&&SEC_OK.includes(s.tipo)).slice(0,8).map(s=>{
      const o={w:n(s.largura),type:s.tipo,n:Math.max(0,Math.round(+s.qtd||0))};
      if(o.type==="gavetas"&&!o.n) o.n=3; if(o.type==="pgav"&&!o.n) o.n=2;
      if((o.type==="correr"||o.type==="pgav")&&+s.folhas) o.lv=+s.folhas;
      if(o.w>200) o.w/=10; return o});
    const over={name:String(v.nome||T.name).slice(0,40),W:clamp(W,10,400),H:clamp(H,10,300),D:clamp(D,10,120),elev:Math.max(0,+v.altura_piso||0)};
    if(secs.length) over.secs=secs;
    if(v.rodape!==undefined&&isFinite(+v.rodape)) over.plinth=clamp(+v.rodape,0,30);
    out.push({tk,over});
  }
  return out;
}
function insertSpec(spec){
  const ms=specToMods(spec); if(!ms.length){toast("Não entendi nenhum móvel. Tente de novo com as medidas"); return 0}
  const mods=P.items.filter(i=>i.t==="mod"), x0=mods.length?Math.max(...mods.map(m=>m.x+m.W))+30:0, ids=[], cur={lo:x0,up:x0};
  pushUndo();
  for(const {tk,over} of ms){const k=(over.elev||0)>=100?"up":"lo", m=makeModule(tk,Object.assign({x:cur[k]},over)); if(tk==="aereo"||(over.elev||0)>0) m.plinth=over.plinth??0; P.items.push(m); ids.push(m.id); cur[k]+=m.W}
  sel=new Set(ids); closeDlg(); setView("draw"); setTool("select"); afterEdit(); updCtx(); fit();
  toast(ms.length>1?`${ms.length} móveis inseridos. Confira as medidas`:"Móvel inserido. Confira as medidas no painel"); return ms.length;
}
function specSummary(spec){
  return specToMods(spec).map(({tk,over})=>{const m=makeModule(tk,over); return `<li><b>${esc(m.name)}</b>: ${fmtL(m.W)} × ${fmtL(m.H)} × ${fmtL(m.D)} ${P.unit}${-(m.y+m.H)>0?`, a ${fmtL(-(m.y+m.H))} do piso`:""} · ${esc(m.secs.map(secLabel).join(", "))}</li>`}).join("");
}
const SPEC_FORMAT=`Responda só com JSON neste formato (medidas em centímetros):
{"moveis":[{"nome":"Balcão pia","tipo":"balcao","largura":147,"altura":85,"profundidade":60,"altura_piso":0,"vaos":[{"largura":45,"tipo":"gavetas","qtd":4},{"largura":0,"tipo":"porta2","qtd":1}]}],"duvidas":"o que ficou em dúvida, em uma frase, ou vazio"}
- tipo do móvel: balcao, aereo, gaveteiro, armario, roupeiro, estante, comoda, escrivaninha ou livre.
- vaos da esquerda para a direita. tipo do vão: porta (uma folha), porta2 (porta dupla), gavetas, pgav (porta em cima de gavetas no mesmo vão; qtd = gavetas), correr (portas de correr; "folhas": 2 ou 3) ou nicho (aberto). qtd = gavetas, ou prateleiras em porta e nicho. largura 0 = automática.
- altura_piso: distância do chão até a base do móvel (aéreo costuma ser 150). Medida que faltar: use a medida comum de marcenaria e diga em "duvidas".`;
// frase → móvel, sem internet (entende o jeito comum de falar na oficina)
function parseSpeech(txt){
  const NW={um:1,uma:1,dois:2,duas:2,tres:3,quatro:4,cinco:5,seis:6,sete:7,oito:8,nove:9,dez:10};
  let t=" "+txt.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/(\d),(\d)/g,"$1.$2").replace(/[^a-z0-9. ]+/g," ")+" ";
  t=t.replace(/\b(um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez)\b/g,w=>NW[w]).replace(/\s+/g," ");
  const tipo=[["roupeiro","roupeiro|guarda roupa|guardaroupa"],["aereo","aereo|armario de cima|suspenso"],["gaveteiro","gaveteiro"],["comoda","comoda"],["escrivaninha","escrivaninha|mesa de estudo|mesa de escritorio"],["estante","estante|prateleira aberta|livreiro"],["armario","armario"],["balcao","balcao|gabinete|pia"]].find(([k,r])=>new RegExp("\\b("+r+")\\b").test(t));
  const tk=tipo?tipo[0]:"livre", T=TPL[tk];
  const lab=(re)=>{const m=t.match(re); return m?+m[1]:0};
  let W=lab(/largura (?:de )?(\d+(?:\.\d+)?)/)||lab(/(\d+(?:\.\d+)?) (?:cm )?de largura/);
  let H=lab(/altura (?:de )?(\d+(?:\.\d+)?)/)||lab(/(\d+(?:\.\d+)?) (?:cm )?de altura/)||lab(/(\d+(?:\.\d+)?) (?:cm )?de alto/);
  let D=lab(/profundidade (?:de )?(\d+(?:\.\d+)?)/)||lab(/(\d+(?:\.\d+)?) (?:cm )?de (?:profundidade|fundo)/);
  const E=lab(/(?:a|com) (\d+(?:\.\d+)?) (?:cm )?do (?:chao|piso)/)||lab(/altura do (?:chao|piso) (?:de )?(\d+(?:\.\d+)?)/);
  const seq=t.match(/(\d+(?:\.\d+)?)(?: cm)? (?:por|x) (\d+(?:\.\d+)?)(?:(?: cm)? (?:por|x) (\d+(?:\.\d+)?))?/);
  if(seq){const a=+seq[1],b=+seq[2],c=seq[3]?+seq[3]:0;
    if(!W) W=a;
    if(c){if(!H) H=b; if(!D) D=c}
    else if(["balcao","gaveteiro","comoda","escrivaninha"].includes(tk)&&b<=65){if(!D) D=b}
    else if(!H) H=b;
  }
  if(!W){const m=t.match(/\b(\d+(?:\.\d+)?)\b(?! ?(?:cm )?(?:gavetas?|portas?|prateleiras?|folhas?|nichos?|do chao|do piso))/); if(m&&!(E&&+m[1]===E)) W=+m[1]}
  const cnt=re=>{const m=t.match(re); return m?(+m[1]||1):0};
  const portas=cnt(/(\d+)? ?portas?\b(?! de correr)/)||(/\bporta\b/.test(t)?1:0), gav=cnt(/(\d+)? ?gavetas?\b/), prat=cnt(/(\d+)? ?prateleiras?\b/);
  const correr=/correr|deslizante/.test(t), sobre=/porta(?:s)? (?:em cima|sobre|acima)|gavetas? (?:embaixo|em baixo|abaixo)|em cima d[ae]s? gavetas?/.test(t), nicho=/\bnichos?\b|abert[oa]/.test(t);
  const nc=cnt(/(\d+) ?portas? de correr/)||cnt(/correr com (\d+) folhas?/);
  const vaos=[];
  if(correr) vaos.push({largura:0,tipo:"correr",qtd:prat||(tk==="roupeiro"?4:1),folhas:nc>=3?3:2});
  else if(sobre&&gav) vaos.push({largura:0,tipo:"pgav",qtd:gav,folhas:portas>=2?2:1});
  else {
    if(gav) vaos.push({largura:portas||nicho?45:0,tipo:"gavetas",qtd:gav});
    let p=portas; while(p>0){if(p>=2){vaos.push({largura:0,tipo:"porta2",qtd:prat||1}); p-=2} else {vaos.push({largura:0,tipo:"porta",qtd:prat||1}); p--}}
    if(nicho&&!portas) vaos.push({largura:0,tipo:"nicho",qtd:prat||1});
    if(gav&&vaos.length>1&&tk!=="gaveteiro") vaos.push(vaos.shift()); // gavetas à direita, como no balcão da pia
  }
  const ok=!!(W||vaos.length||tipo);
  return ok?{moveis:[{nome:T.name,tipo:tk,largura:W,altura:H,profundidade:D,altura_piso:E||(tk==="aereo"?150:0),vaos}]}:null;
}
async function aiSpec(input,opts){
  if(!H.sample) throw {code:"not_declared"};
  return await H.sample.json(input,Object.assign({cache:false},opts||{}));
}
function specDlg(title,body,mount){dlg(`<h2>${title}</h2>${body}`,mount,"spec")}
function specResult(el,spec,note){
  const li=specSummary(spec), r=$("#spRes",el);
  if(!li){r.innerHTML=`<p class="warn">Não consegui montar um móvel com isso. Diga o tipo e as medidas, por exemplo: “balcão de 120 por 60 com duas portas e três gavetas”.</p>`; return}
  r.innerHTML=`<div class="callout"><b>Entendi assim:</b><ul class="splist">${li}</ul>${spec.duvidas?`<span class="note">Dúvida: ${esc(spec.duvidas)}</span>`:""}${note?`<span class="note">${esc(note)}</span>`:""}<div class="row" style="justify-content:flex-start"><button class="btn pri" data-spins>Inserir no projeto</button></div></div>`;
  $("[data-spins]",r).onclick=()=>insertSpec(spec);
}
async function showPhoto(){
//#if app
  if(!H.sample) return specDlg("Croqui por foto",`<p>A leitura de foto usa o Claude e só funciona na versão do AutoMarcen dentro do claude.ai. Nesta versão instalada ela fica desligada.</p><p class="note">Você pode descrever o móvel em <b>Falar ou escrever</b>, que funciona no aparelho, até sem internet.</p><div class="row"><button class="btn" data-x>Fechar</button><button class="btn pri" data-voice>Falar ou escrever</button></div>`,el=>{$("[data-x]",el).onclick=closeDlg; $("[data-voice]",el).onclick=showVoice});
//#endif
  let caps=null; try{caps=H.sample&&H.sample.limits?await H.sample.limits():null}catch(_){}
  if(!online()) return specDlg("Croqui por foto",`<p>A leitura da foto precisa de internet. Sem sinal, use <b>Falar ou escrever</b>, que funciona no aparelho.</p><div class="row"><button class="btn" data-x>Fechar</button><button class="btn pri" data-voice>Falar ou escrever</button></div>`,el=>{$("[data-x]",el).onclick=closeDlg; $("[data-voice]",el).onclick=showVoice});
  if(!caps||!caps.images) return specDlg("Croqui por foto",`<p>A leitura de foto usa o Claude e precisa estar liberada para a sua conta. Nesta tela ela não está disponível.</p><p class="note">Você pode descrever o móvel em <b>Falar ou escrever</b>.</p><div class="row"><button class="btn" data-x>Fechar</button><button class="btn pri" data-voice>Falar ou escrever</button></div>`,el=>{$("[data-x]",el).onclick=closeDlg; $("[data-voice]",el).onclick=showVoice});
  specDlg("Croqui por foto",`<p>Tire uma foto do desenho no papel (de frente, com boa luz e as medidas legíveis). O Claude lê o croqui e monta o móvel com as medidas.</p>
    <label class="btn pri photo"><input type="file" id="spFile" accept="${esc((caps.images.mediaTypes||["image/jpeg","image/png"]).join(","))}" hidden>Escolher ou tirar foto</label>
    <img id="spImg" alt="Foto do croqui" hidden class="spimg">
    <div id="spRes"></div>
    <p class="note">Usa o seu uso do Claude. Confira sempre as medidas antes de cortar.</p>
    <div class="row"><button class="btn ghost" data-x>Fechar</button></div>`,el=>{
    $("[data-x]",el).onclick=closeDlg;
    $("#spFile",el).onchange=async e=>{
      const f=e.target.files&&e.target.files[0]; if(!f) return;
      const img=$("#spImg",el); img.src=URL.createObjectURL(f); img.hidden=false;
      const r=$("#spRes",el); r.innerHTML=`<p class="note">Lendo o croqui…</p>`;
      try{
        const spec=await aiSpec(`A imagem é a foto de um croqui de marcenaria feito à mão (papel quadriculado ou liso), com medidas escritas. Identifique cada móvel desenhado, as medidas externas e a divisão em vãos (portas, gavetas, nichos), da esquerda para a direita. Se houver vista de frente e de lado, use a de lado para a profundidade.\n${SPEC_FORMAT}`,{images:[f],modelTier:"default"});
        if(openDlg&&openDlg.contains(r)) specResult(el,spec);
      }catch(err){
        const c=err&&err.code; r.innerHTML=`<p class="warn">${c==="not_granted"?"A leitura foi recusada. Para usar, permita o uso do Claude quando ele pedir.":c==="image_rejected"?"Essa foto não pôde ser lida. Tente outra, em JPG ou PNG.":c==="rate_limited"?"Muitos pedidos agora. Tente de novo em instantes.":"Não consegui ler a foto agora. Tente de novo ou use Falar ou escrever."}</p>`;
      }
    };
  });
}
function showVoice(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  specDlg("Falar ou escrever",`<p>Diga ou escreva o móvel, por exemplo: <i>“balcão de 147 por 60 com duas portas e três gavetas”</i> ou <i>“aéreo de 120 por 70 a 150 do chão com duas portas”</i>.</p>
    <div class="spin"><textarea class="in" id="spTxt" rows="3" placeholder="Descreva o móvel" autofocus></textarea>${SR?`<button class="btn" id="spMic" type="button" aria-label="Falar"><svg class="i" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg><span>Falar</span></button>`:""}</div>
    <p class="note" id="spMicNote">${SR?"Toque em Falar e fale normalmente. ":""}No celular, o microfone do teclado também funciona.</p>
    <div id="spRes"></div>
    <div class="row"><button class="btn ghost" data-x>Fechar</button><button class="btn pri" data-go2>Montar móvel</button></div>`,el=>{
    $("[data-x]",el).onclick=()=>{try{rec&&rec.abort()}catch(_){} closeDlg()};
    let rec=null;
    if(SR) $("#spMic",el).onclick=()=>{
      if(rec){try{rec.stop()}catch(_){} return}
      try{rec=new SR(); rec.lang="pt-BR"; rec.interimResults=true; rec.maxAlternatives=1}catch(_){rec=null; return}
      const ta=$("#spTxt",el), base=ta.value?ta.value+" ":"", mic=$("#spMic",el);
      mic.classList.add("on"); $("span",mic).textContent="Ouvindo…";
      rec.onresult=e=>{let s=""; for(const r of e.results) s+=r[0].transcript; ta.value=base+s};
      rec.onerror=e=>{ $("#spMicNote",el).textContent=e.error==="not-allowed"||e.error==="service-not-allowed"?"O microfone não foi liberado nesta tela. Use o microfone do teclado do celular ou escreva.":e.error==="no-speech"?"Não ouvi nada. Toque em Falar e tente de novo.":"O ditado não funcionou aqui. Use o microfone do teclado ou escreva." };
      rec.onend=()=>{rec=null; mic.classList.remove("on"); $("span",mic).textContent="Falar"; if($("#spTxt",el).value.trim()) go()};
      try{rec.start()}catch(_){rec=null; mic.classList.remove("on")}
    };
    const go=async()=>{
      const txt=$("#spTxt",el).value.trim(); if(!txt) return;
      const loc=parseSpeech(txt), r=$("#spRes",el), nt=txt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""), kinds=(nt.match(/\b(balcao|aereo|armario|gaveteiro|roupeiro|estante|comoda|escrivaninha|guarda roupa|torre|painel|rack)\b/g)||[]).length, simple=loc&&loc.moveis[0].largura&&kinds<=1&&!/;/.test(nt);
//#if app
      if(simple||!H.sample||!online()){ if(loc) specResult(el,loc,!simple&&H.sample&&!online()?"Entendido no aparelho. Para frases com vários móveis, use com internet.":!simple&&!H.sample?"Entendido no aparelho. Se tiver mais de um móvel, descreva um de cada vez.":""); else specResult(el,{moveis:[]}); return }
//#else
      if(simple||!H.sample||!online()){ if(loc) specResult(el,loc,!simple&&(!H.sample||!online())?"Entendido no aparelho. Para frases com vários móveis, use com internet.":""); else specResult(el,{moveis:[]}); return }
//#endif
      r.innerHTML=`<p class="note">Montando…</p>`;
      try{const spec=await aiSpec(`Um marceneiro descreveu um ou mais móveis falando (pode ter erros de ditado):\n"""${txt.slice(0,1500)}"""\nMonte os móveis.\n${SPEC_FORMAT}`,{modelTier:"quick"}); specResult(el,spec)}
      catch(_){ if(loc) specResult(el,loc,"Entendido no aparelho."); else r.innerHTML=`<p class="warn">Não entendi. Diga o tipo e as medidas, por exemplo: “balcão de 120 por 60 com duas portas”.</p>` }
    };
    $("[data-go2]",el).onclick=go;
    $("#spTxt",el).addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault(); go()}});
  });
}

/* projetos */
$("#bProj").onclick=showProjects;
function showProjects(){
  const list=[...store.projects].sort((a,b)=>b.updated-a.updated);
  dlg(`<h2>Projetos</h2>
    <div class="row" style="justify-content:flex-start"><button class="btn pri" data-new>+ Novo projeto</button><button class="btn" data-imp>Importar</button></div>
    <div class="list">${list.map(p=>`<div class="li${p.id===P.id?" on":""}">
      <button class="t" data-open="${p.id}" style="text-align:left"><b>${esc(p.name)}</b><small>${p.items.filter(i=>i.t==="mod").length} móveis · ${new Date(p.updated).toLocaleDateString("pt-BR")}${p.budget&&p.budget.status&&p.budget.status!=="rascunho"?` · <b class="stt st-${p.budget.status}">${(STATUS.find(x=>x[0]===p.budget.status)||["",""])[1]}</b>`:""}</small></button>
      <button class="ib" data-ren="${p.id}" aria-label="Renomear"><svg class="i" viewBox="0 0 24 24"><path d="M4 20l1-4L16 5l3 3L8 19z"/></svg></button>
      <button class="ib" data-cp="${p.id}" aria-label="Duplicar"><svg class="i" viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg></button>
      <button class="ib" data-del="${p.id}" aria-label="Excluir" style="color:var(--danger)"><svg class="i" viewBox="0 0 24 24"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/></svg></button>
    </div>`).join("")}</div>
    <p>${SV.cloud==="on"?"Os projetos ficam salvos na sua conta Claude e aparecem em todos os aparelhos em que você abrir este link.":SV.local?"Os projetos ficam salvos neste aparelho, dentro deste navegador. Para levar para outro aparelho ou mandar para outra pessoa, use Exportar → Código do projeto.":"Este navegador não está guardando os projetos. Use Exportar → Código do projeto para não perder o trabalho."}</p>
    <button class="note" data-news style="justify-self:center;font-family:var(--mono);text-decoration:underline;text-underline-offset:3px">AutoMarcen · ${APP_VER} · novidades</button>`,el=>{
    $("[data-new]",el).onclick=()=>{const p=newProject("Projeto "+(store.projects.length+1)); store.projects.push(p); SV.dirty.add(p.id); switchTo(p); closeDlg(); askRename(p)};
    $("[data-imp]",el).onclick=showImport;
    $("[data-news]",el).onclick=()=>showNews(null);
    $$("[data-open]",el).forEach(b=>b.onclick=()=>{switchTo(store.projects.find(p=>p.id===b.dataset.open)); closeDlg()});
    $$("[data-ren]",el).forEach(b=>b.onclick=()=>askRename(store.projects.find(p=>p.id===b.dataset.ren),true));
    $$("[data-cp]",el).forEach(b=>b.onclick=()=>{const src=store.projects.find(p=>p.id===b.dataset.cp); const c=ensure(JSON.parse(JSON.stringify(src))); c.id=uid(); c.name=src.name+" (cópia)"; c.updated=Date.now(); delete c.sample; store.projects.push(c); SV.dirty.add(c.id); queueSave(); showProjects()});
    $$("[data-del]",el).forEach(b=>b.onclick=()=>confirmDel(store.projects.find(p=>p.id===b.dataset.del)));
  },"projects");
}
function askRename(p,back){
  dlg(`<h2>Nome do projeto</h2><input class="in" id="nIn" value="${esc(p.name)}" maxlength="60" autofocus>
    <div class="row"><button class="btn ghost" data-x>Cancelar</button><button class="btn pri" data-ok>Salvar</button></div>`,el=>{
    const ok=()=>{p.name=$("#nIn",el).value.trim()||"Sem nome"; p.updated=Date.now(); delete p.sample; SV.dirty.add(p.id); queueSave(); $("#projName").textContent=P.name; back?showProjects():closeDlg(); if(curView==="quote") renderQuote()};
    $("[data-ok]",el).onclick=ok; $("[data-x]",el).onclick=()=>back?showProjects():closeDlg();
    $("#nIn",el).addEventListener("keydown",e=>{if(e.key==="Enter")ok()});
  });
}
function confirmDel(p){
  dlg(`<h2>Excluir “${esc(p.name)}”?</h2><p>O projeto será apagado ${SV.cloud==="on"?"da sua conta e de todos os seus aparelhos":"deste aparelho"}. Não dá para desfazer.</p>
    <div class="row"><button class="btn ghost" data-x>Cancelar</button><button class="btn pri" style="background:var(--danger);border-color:var(--danger);color:#fff" data-ok>Excluir</button></div>`,el=>{
    $("[data-x]",el).onclick=showProjects;
    $("[data-ok]",el).onclick=()=>{store.projects=store.projects.filter(x=>x.id!==p.id); SV.dirty.delete(p.id); if(!p.sample) SV.dead.add(p.id); if(!store.projects.length) store.projects.push(newProject("Projeto 1")); if(p.id===P.id) switchTo(store.projects[0]); else queueSave(); showProjects()};
  });
}
function switchTo(p){P=p; syncChips(); store.current=p.id; undoS=[]; redoS=[]; sel.clear(); st=null; touch(); dirty3D=true; $("#projName").textContent=P.name; updScale(); updUndo(); renderPanel(); updCtx(); fit(); queueSave(); if(curView!=="draw") setView(curView)}
$("#fileIn").addEventListener("change",async e=>{
  const f=e.target.files[0]; e.target.value=""; if(!f) return;
  importText(await f.text());
});
function importText(txt){
  try{const o=JSON.parse(String(txt).trim()); const src=o&&o.project?o.project:o; if(!src||!Array.isArray(src.items)) throw 0;
    const p=ensure(src); p.id=uid(); p.updated=Date.now(); delete p.sample; store.projects.push(p); SV.dirty.add(p.id); switchTo(p); closeDlg(); toast(`Projeto “${p.name}” importado`); return true}
  catch(_){toast("Esse texto ou arquivo não é um projeto válido"); return false}
}
function showImport(){
  dlg(`<h2>Importar projeto</h2>
    <p>Abra um projeto que você salvou em arquivo ou copiou como código.</p>
    <button class="btn" data-file style="justify-self:start">Escolher arquivo (.json)</button>
    <label class="f"><span class="lb">Ou cole o código do projeto</span><textarea class="in code" id="impTxt" placeholder='{"app":"marcenaria-cad", …}'></textarea></label>
    <div class="row act"><button class="btn ghost" data-x>Voltar</button><button class="btn pri" data-ok>Importar código</button></div>`,el=>{
    $("[data-file]",el).onclick=()=>$("#fileIn").click();
    $("[data-x]",el).onclick=showProjects;
    $("[data-ok]",el).onclick=()=>{const v=$("#impTxt",el).value; if(!v.trim()) return toast("Cole o código do projeto"); importText(v)};
  });
}
const projCode=()=>JSON.stringify({app:"marcenaria-cad",version:2,project:P});
function showCode(){
  const code=projCode();
  dlg(`<h2>Código do projeto</h2>
    <p>Copie e guarde este texto (no WhatsApp, e-mail ou bloco de notas). Para abrir em outro aparelho: Projetos → Importar → cole o código.</p>
    <textarea class="in code" id="codeTxt" readonly>${esc(code)}</textarea>
    <p class="note">${num(code.length/1024,0)} KB de texto · projeto “${esc(P.name)}”</p>
    <div class="row act"><button class="btn ghost" data-x>Fechar</button><button class="btn pri" data-copy>Copiar código</button></div>`,el=>{
    $("[data-x]",el).onclick=closeDlg;
    $("[data-copy]",el).onclick=async()=>{const ta=$("#codeTxt",el);
      try{await navigator.clipboard.writeText(code); toast("Código copiado")}catch(_){ta.focus(); ta.select(); try{ta.setSelectionRange(0,code.length)}catch(__){} toast("Texto selecionado. Toque em Copiar no menu do aparelho")}};
  });
}
function showSaveHelp(){
  const dlOk=dlState==="ok";
  dlg(`<h2>Este navegador não está guardando o projeto</h2>
    <p>O navegador bloqueou o armazenamento desta página. Isso acontece no modo anônimo ou quando os dados de sites estão bloqueados. Se a página for fechada, o desenho se perde.</p>
    <ol class="steps"><li>Toque em <b>Copiar código</b> e cole numa conversa do WhatsApp, num e-mail ou no bloco de notas.</li><li>Para continuar depois, abra o link, toque em <b>Projetos → Importar</b> e cole o código.</li>${dlOk?"<li>Ou baixe o arquivo do projeto (.json) e importe depois.</li>":""}</ol>
    <div class="row act"><button class="btn ghost" data-x>Fechar</button>${dlOk?`<button class="btn" data-file>Baixar arquivo</button>`:""}<button class="btn pri" data-code>Copiar código</button></div>`,el=>{
    $("[data-x]",el).onclick=closeDlg; $("[data-code]",el).onclick=showCode;
    const f=$("[data-file]",el); if(f) f.onclick=()=>doExport("json");
  });
}

