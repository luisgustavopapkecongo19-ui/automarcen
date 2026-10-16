/* ===== salvar: neste aparelho (navegador) + na conta Claude (pasta privada de cada pessoa) ===== */
const SV={local:!!LS,cloud:"pending",synced:false,busy:false,again:false,err:null,dirty:new Set(),dead:new Set(),parts:{},remote:{},col:null,warned:false,retryT:0};
const CHUNK=100000;
let saveT=0;
function save(){
  if(P){P.updated=Date.now(); delete P.sample; SV.dirty.add(P.id)
//#if app
    contribLater(P.id) // modelos da comunidade: só se a pessoa ligou (modelos.js)
//#endif
  }
  queueSave()
}
function queueSave(){ clearTimeout(saveT); saveT=setTimeout(flushSave,900); updSave() }
async function flushSave(){
  clearTimeout(saveT); saveT=0;
  SV.local=lsSet(KEY,JSON.stringify(store));
  if(!SV.local&&SV.cloud!=="on"&&!SV.warned&&store.projects.some(p=>!p.sample)){SV.warned=true; toast("Este navegador não está guardando o projeto. Toque em “Não salvo”")}
  await cloudFlush(); updSave();
}
const docId=pid=>"p-"+String(pid).replace(/[^A-Za-z0-9_-]/g,"");
async function initCloud(){
//#if app
  return fbInit();
//#else
  try{
    if(!(window.claude&&window.claude.use)) throw 0;
    const [db,user]=await Promise.all([window.claude.use("db"),window.claude.use("user")]);
    if(!db||!user) throw 0;
    const [id,canW]=await Promise.all([user.id(),user.can("data.write")]);
    if(!id||canW===false) throw 0;
    cloudAttach(db.collection("data/users/"+id));
  }catch(_){SV.cloud="off"; updSave()}
//#endif
}
/* liga a pasta da conta: recebe as mudanças e, na primeira resposta do servidor, sobe o que só existe aqui */
function cloudAttach(col){
  SV.col=col; SV.cloud="on"; SV.synced=false; updSave();
  const t=setTimeout(()=>{if(SV.col===col&&!SV.synced){SV.synced=true; markForUpload(); cloudFlush()}},8000);
  return col.onSnapshot(snap=>{
    if(SV.col!==col) return;
    applyRemote(snap);
    if(!SV.synced&&!snap.metadata.fromCache){SV.synced=true; clearTimeout(t); markForUpload(); cloudFlush()}
    updSave();
  },()=>{clearTimeout(t); if(SV.col===col){SV.cloud="off"; SV.col=null; updSave()}});
}
function markForUpload(){
  for(const p of store.projects){ if(p.sample) continue; const m=SV.remote[p.id]; if(!m||(p.updated||0)>(m.updated||0)) SV.dirty.add(p.id) }
}
function applyRemote(snap){
  const metas={}, chunks={};
  for(const d of snap.docs){const x=d.data(); if(!x||!x.pid) continue; if(x.kind==="project") metas[x.pid]=x; else if(x.kind==="chunk") chunks[x.pid+"|"+x.rev+"|"+x.i]=x.s}
  SV.remote=metas;
  let changed=false, cur=false;
  for(const pid in metas){
    const m=metas[pid]; SV.parts[pid]=Math.max(SV.parts[pid]||1,m.n||1);
    if(SV.dirty.has(pid)) continue;
    const i=store.projects.findIndex(p=>p.id===pid), local=store.projects[i];
    if(local&&(local.updated||0)>=(m.updated||0)) continue;
    if(m.deleted){ if(local){store.projects.splice(i,1); changed=true; if(local===P) cur=true} continue }
    if(typeof m.s!=="string") continue;
    const parts=[m.s]; let ok=true;
    for(let k=1;k<(m.n||1);k++){const c=chunks[pid+"|"+m.rev+"|"+k]; if(typeof c!=="string"){ok=false;break} parts.push(c)}
    if(!ok) continue;
    let pr; try{pr=ensure(JSON.parse(parts.join("")))}catch(_){continue}
    pr.id=pid; pr.updated=m.updated; delete pr.sample;
    if(local){for(const k of Object.keys(local)) delete local[k]; Object.assign(local,pr); if(local===P) cur=true} else store.projects.push(pr);
    changed=true;
  }
  if(!changed) return;
  if(!store.projects.length) store.projects.push(newProject("Projeto 1"));
  const best=store.projects.filter(p=>!p.sample).sort((a,b)=>(b.updated||0)-(a.updated||0))[0];
  if(!store.projects.includes(P)) switchTo(best||store.projects[0]);
  else if(P.sample&&best&&P.items.length===sampleCount) switchTo(best);
  else if(cur) refreshCurrent();
  SV.local=lsSet(KEY,JSON.stringify(store));
  if(openDlg&&openDlg.dataset.kind==="projects") showProjects();
}
let sampleCount=-1;
const online=()=>navigator.onLine!==false;
async function cloudFlush(){
  if(!SV.col||SV.cloud!=="on"||!SV.synced) return;
  if(!online()) return; // sem internet: fica no aparelho e sobe quando a conexão voltar
  if(SV.busy){SV.again=true; return}
  SV.busy=true; updSave();
  try{
    while(SV.dirty.size||SV.dead.size){
      if(SV.dead.size){const pid=[...SV.dead][0]; await writeTomb(pid); SV.dead.delete(pid); continue}
      const pid=[...SV.dirty][0]; SV.dirty.delete(pid);
      const pr=store.projects.find(x=>x.id===pid); if(!pr||pr.sample) continue;
      try{await writeProject(pr)}catch(e){SV.dirty.add(pid); throw e}
    }
    SV.err=null;
  }catch(e){
    const code=(e&&e.code)||"unavailable"; SV.err=code;
    if(["invalid_argument","not_granted","revoked","capability_disabled","capability_removed","transform_error","permission-denied","unauthenticated","invalid-argument"].includes(code)){SV.cloud="off"; SV.err=null}
    else if(code!=="quota_exceeded"&&code!=="resource-exhausted"&&!SV.retryT) SV.retryT=setTimeout(()=>{SV.retryT=0; cloudFlush()},4000+Math.random()*4000);
  }finally{
    SV.busy=false; updSave();
    if(SV.again){SV.again=false; if(SV.dirty.size||SV.dead.size) cloudFlush()}
  }
}
async function writeProject(pr){
  const json=JSON.stringify(pr), n=Math.max(1,Math.ceil(json.length/CHUNK)), rev=pr.updated||Date.now(), base=docId(pr.id);
  for(let k=1;k<n;k++) await SV.col.doc(base+".c"+k).set({kind:"chunk",pid:pr.id,rev,i:k,s:json.slice(k*CHUNK,(k+1)*CHUNK)});
  await SV.col.doc(base).set({kind:"project",pid:pr.id,name:pr.name,updated:rev,rev,n,s:json.slice(0,CHUNK)});
  const old=SV.parts[pr.id]||1; for(let k=n;k<old;k++) await SV.col.doc(base+".c"+k).delete();
  SV.parts[pr.id]=n;
}
async function writeTomb(pid){
  const base=docId(pid); await SV.col.doc(base).set({kind:"project",pid,deleted:true,updated:Date.now(),n:1});
  const old=SV.parts[pid]||1; for(let k=1;k<old;k++) await SV.col.doc(base+".c"+k).delete(); SV.parts[pid]=1;
}
const SAVE_ICO={
  ok:'<path d="M7 18.5a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 11a3.75 3.75 0 0 1-.5 7.5z"/><path d="m9.4 13.6 2 2 3.6-3.6"/>',
  busy:'<path d="M7 18.5a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 11a3.75 3.75 0 0 1-.5 7.5z"/><path d="M12 16.5v-5M9.8 13.5 12 11.3l2.2 2.2"/>',
  local:'<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
  warn:'<path d="M12 4 2.8 20h18.4z"/><path d="M12 10v4.5M12 17.4v.1"/>',
  off:'<path d="M7 18.5a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 11a3.75 3.75 0 0 1-.5 7.5z"/><path d="M4 4l16 16"/>'
};
function saveState(){
  const pending=!!saveT||SV.busy||(online()&&SV.cloud==="on"&&SV.synced&&SV.dirty.size>0&&!SV.err);
  if(pending) return ["busy","Salvando…","Salvando o projeto"];
//#if app
  if(!online()&&SV.local&&!saveT&&SV.cloud==="on") return ["off","Sem internet","Sem internet. O projeto está salvo neste aparelho e vai para a sua conta quando a conexão voltar"];
//#else
  if(!online()&&SV.local&&!saveT) return ["off","Sem internet","Sem internet. O projeto está salvo neste aparelho e vai para a sua conta quando a conexão voltar"];
//#endif
  if(SV.cloud==="on"){
    if(SV.err) return ["err","Não salvou","A conta não respondeu. Toque para tentar de novo"];
//#if app
    if(SV.synced) return ["ok","Salvo","Salvo na sua conta AutoMarcen. Aparece nos seus outros aparelhos"];
//#else
    if(SV.synced) return ["ok","Salvo","Salvo na sua conta Claude. Aparece nos seus outros aparelhos"];
//#endif
  }
//#if app
  if(SV.local) return ["local","Salvo no aparelho","Salvo neste aparelho. Para abrir em outros aparelhos, entre na sua conta (menu ⋯ → Entrar na conta)"];
//#else
  if(SV.local) return ["local","Salvo no aparelho","Salvo neste navegador, só neste aparelho"];
//#endif
  if(SV.cloud==="pending") return ["busy","Conectando…","Conectando"];
  return ["warn","Não salvo","Este navegador não está guardando o projeto. Toque para ver como salvar"];
}
function updSave(){
  const b=document.getElementById("bSave"); if(!b) return;
  const [k,t,title]=saveState(); b.dataset.s=k; b.title=title;
  document.getElementById("saveTxt").textContent=k==="local"&&matchMedia("(max-width:760px)").matches?"Salvo":t;
  document.getElementById("saveIco").innerHTML=SAVE_ICO[k==="err"?"warn":k]||SAVE_ICO.local;
}
async function saveNow(){
  if(P.sample){delete P.sample; P.updated=Date.now()}
  SV.dirty.add(P.id); SV.err=null;
  await flushSave();
  const [k]=saveState();
//#if app
  if(!online()&&SV.local&&SV.cloud==="on") toast("Sem internet: salvo neste aparelho. Vai para a conta quando a conexão voltar");
//#else
  if(!online()&&SV.local) toast("Sem internet: salvo neste aparelho. Vai para a conta quando a conexão voltar");
//#endif
  else if(SV.cloud==="on"&&SV.synced&&!SV.err&&!SV.dirty.has(P.id)) toast("Projeto salvo na sua conta");
  else if(SV.cloud==="on"&&!SV.synced) toast(SV.local?"Salvo no aparelho. Conectando à sua conta…":"Conectando à sua conta…");
  else if(SV.cloud==="on"&&SV.err) toast(SV.local?"Salvo no aparelho. A conta não respondeu, nova tentativa em instantes":"A conta não respondeu. Tente de novo em instantes");
//#if app
  else if(SV.local&&FB.known&&!FB.user) toast("Salvo neste aparelho. Para abrir em outros aparelhos, entre na conta: menu ⋯ → Entrar na conta");
//#endif
  else if(SV.local) toast("Projeto salvo neste aparelho");
  else showSaveHelp();
}
function syncChips(){const b=document.getElementById("tInt"); if(b) b.setAttribute("aria-pressed",!!P.showInt)}
function refreshCurrent(){syncChips();undoS=[]; redoS=[]; sel.clear(); st=null; touch(); dirty3D=true; $("#projName").textContent=P.name; updScale(); updUndo(); renderPanel(); updCtx(); draw(); if(curView!=="draw") setView(curView)}


