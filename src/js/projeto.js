/* ===================== projeto e armazenamento ===================== */
const KEY="marcenaria-cad-v2", OLD_KEY="caderno-projetos";
const LAYERS0=[{id:"estrutura",name:"Estrutura",color:"auto"},{id:"moveis",name:"Móveis",color:"auto"},{id:"cotas",name:"Cotas",color:"#e5484d"},{id:"anot",name:"Anotações",color:"#3b82f6"},{id:"esboco",name:"Esboço",color:"#8b919c"}];
const INKS=[["auto","Tinta"],["#e5484d","Vermelho"],["#f59e0b","Âmbar"],["#16a34a","Verde"],["#2563eb","Azul"],["#7c3aed","Roxo"],["#8d5a2b","Madeira"]];
const TPL={
  balcao:{name:"Balcão",W:120,H:85,D:55,plinth:10,elev:0,fb:0,ff:4,secs:[{w:0,type:"porta2",n:1},{w:45,type:"gavetas",n:4}]},
  aereo:{name:"Aéreo",W:120,H:70,D:35,plinth:0,elev:150,fb:0,ff:4,secs:[{w:0,type:"porta",n:1},{w:0,type:"porta",n:1}]},
  gaveteiro:{name:"Gaveteiro",W:45,H:72,D:50,plinth:8,elev:0,fb:0,ff:2,secs:[{w:0,type:"gavetas",n:4}]},
  armario:{name:"Armário",W:90,H:210,D:55,plinth:8,elev:0,fb:0,ff:0,secs:[{w:0,type:"porta2",n:4,int:[{t:"gavetas",h:54,n:3},{t:"cabide",h:0},{t:"prat",h:40,n:0}]}]},
  roupeiro:{name:"Roupeiro",W:160,H:230,D:58,plinth:10,elev:0,fb:0,ff:6,secs:[{w:0,type:"porta2",n:4,int:[{t:"gavetas",h:54,n:3},{t:"cabide",h:0},{t:"prat",h:40,n:0}]},{w:0,type:"porta2",n:4,int:[{t:"cabide",h:0},{t:"cabide",h:0},{t:"prat",h:40,n:0}]}]},
  estante:{name:"Estante",W:90,H:180,D:35,plinth:6,elev:0,fb:4,ff:4,secs:[{w:0,type:"nicho",n:4},{w:0,type:"nicho",n:4}]},
  balcaopg:{name:"Balcão gaveta+porta",W:80,H:85,D:55,plinth:10,elev:0,fb:0,ff:4,secs:[{w:0,type:"pgav",n:1,lv:1,hinge:"E"},{w:0,type:"pgav",n:1,lv:1,hinge:"D"}]},
  roupcorrer:{name:"Roupeiro de correr",W:200,H:240,D:62,plinth:10,elev:0,fb:0,ff:5,pull:"perfil",secs:[{w:0,type:"correr",lv:2,int:[{t:"gavetas",h:54,n:3},{t:"cabide",h:0},{t:"prat",h:40,n:0}]}]},
  comoda:{name:"Cômoda",W:90,H:85,D:45,plinth:8,elev:0,fb:0,ff:5,pull:"cava",secs:[{w:0,type:"gavetas",n:5}]},
  escrivaninha:{name:"Escrivaninha",W:120,H:75,D:55,plinth:0,elev:0,fb:0,ff:4,secs:[{w:0,type:"nicho",n:0},{w:40,type:"gavetas",n:3}]},
  livre:{name:"Módulo",W:80,H:80,D:50,plinth:10,elev:0,fb:0,ff:0,secs:[{w:0,type:"porta",n:1}]}
};
/* conjuntos prontos: vários móveis de uma vez (x e elev em cm, relativos ao conjunto) */
const KITS={
  cozinha:{name:"Cozinha completa",note:"Balcão da pia, aéreo e torre quente (gaveteiro, nicho do forno e micro-ondas, porta em cima). Depois ajuste cada móvel.",mods:[
    ["balcao",{name:"Balcão pia",W:120,H:85,D:60,x:0,secs:[{w:0,type:"porta2",n:1},{w:40,type:"gavetas",n:4}]}],
    ["aereo",{name:"Aéreo",W:120,H:70,D:35,x:0,elev:150}],
    ["gaveteiro",{name:"Torre: gavetas",W:60,H:75,D:58,x:120,plinth:10,ff:4,secs:[{w:0,type:"gavetas",n:3}]}],
    ["livre",{name:"Torre: forno e micro",W:60,H:105,D:58,x:120,elev:75,plinth:0,ff:4,secs:[{w:0,type:"nicho",n:1}]}],
    ["aereo",{name:"Torre: porta",W:60,H:40,D:58,x:120,elev:180,secs:[{w:0,type:"porta",n:0,hinge:"D"}]}]
  ]},
  tv:{name:"Painel de TV",note:"Rack suspenso com gavetas e um painel de 18 mm atrás da TV.",mods:[
    ["livre",{name:"Rack",W:180,H:45,D:45,x:0,elev:20,plinth:0,ff:6,secs:[{w:0,type:"nicho",n:0},{w:60,type:"gavetas",n:2},{w:0,type:"nicho",n:0}]}]
  ],panel:{x0:-10,x1:190,y0:75,y1:200,dep:1.8}}
};
const TPL_ICON={
  balcao:'<rect x="6" y="10" width="44" height="30" rx="1"/><path d="M6 14h44M28 14v26M36 22h14M36 30h14M6 40h44"/>',
  aereo:'<rect x="6" y="8" width="44" height="26" rx="1"/><path d="M28 8v26M24 26v4M32 26v4"/>',
  gaveteiro:'<rect x="16" y="6" width="24" height="38" rx="1"/><path d="M16 15h24M16 24h24M16 33h24M25 11h6M25 20h6M25 29h6M25 38h6"/>',
  armario:'<rect x="15" y="4" width="26" height="40" rx="1"/><path d="M28 4v36M15 40h26M25 20v6M31 20v6"/>',
  roupeiro:'<rect x="12" y="4" width="32" height="42" rx="1"/><path d="M28 4v42M22 20v8M34 20v8"/>',
  estante:'<rect x="14" y="4" width="28" height="42" rx="1"/><path d="M14 14h28M14 24h28M14 34h28M28 4v42"/>',
  balcaopg:'<rect x="6" y="10" width="44" height="30" rx="1"/><path d="M6 14h44M28 14v26M6 21h44M13 17.5h8M35 17.5h8M24 26v6M32 26v6M6 40h44"/>',
  roupcorrer:'<rect x="8" y="4" width="40" height="42" rx="1"/><path d="M28 4v40M27 6h3v36h-3M16 25h7M33 25h7M18 23l-2 2 2 2M38 23l2 2-2 2"/>',
  comoda:'<rect x="10" y="8" width="36" height="34" rx="1"/><path d="M10 14.5h36M10 21h36M10 27.5h36M10 34h36M10 42h36M18 8v0"/>',
  escrivaninha:'<path d="M6 14h44M8 14v28M34 14v28M50 14v28M34 23h16M34 32h16M39 18.5h6M39 27.5h6"/>',
  livre:'<rect x="12" y="8" width="32" height="36" rx="1" stroke-dasharray="3 3"/><path d="M28 18v16M20 26h16"/>',
  kit_cozinha:'<rect x="4" y="24" width="30" height="18" rx="1"/><rect x="4" y="6" width="30" height="10" rx="1"/><rect x="38" y="4" width="14" height="38" rx="1"/><path d="M38 12h14M38 26h14M19 24v18M19 6v10M41 18h8v5h-8z"/>',
  kit_tv:'<rect x="6" y="6" width="44" height="22" rx="1"/><rect x="16" y="9" width="24" height="14" rx="1"/><rect x="8" y="32" width="40" height="9" rx="1"/><path d="M22 32v9M34 32v9M25 36.5h6"/>'
};
function defaultMat(){return{caixa:{name:"MDF 18 mm Branco TX",t:18,price:0},frente:{name:"MDF 18 mm Carvalho",t:18,price:0,grain:true},fundo:{name:"MDF 6 mm Branco",t:6,price:0}}}
function defaultBudget(){return{client:"",notes:"Prazo de entrega a combinar. Instalação inclusa.",edge:0,hinge:0,slide:0,pull:0,rod:0,rodSup:0,track:0,perfil:0,push:0,phone:"",status:"rascunho",statusAt:0,labor:0,install:0,margin:30}}
/* preços que a pessoa já digitou neste aparelho (os padrões vêm zerados: cada região tem um valor) */
function myPrices(){try{const o=JSON.parse(lsGet("croqui3d-precos")||"null"); return o&&typeof o==="object"?o:null}catch(_){return null}}
function newProject(name){const ph=lsGet("croqui3d-whats")||"", mp=myPrices(), mat=defaultMat(), budget=Object.assign(defaultBudget(),{phone:ph});
  if(mp){for(const k in mat) if(+mp.mat?.[k]>0) mat[k].price=+mp.mat[k]; for(const k in mp.budget||{}) if(k in budget&&+mp.budget[k]>0) budget[k]=+mp.budget[k]}
  return{id:uid(),name,grid:5,unit:"cm",textH:4,layers:LAYERS0.map(l=>({...l,visible:true,locked:false})),curLayer:"estrutura",items:[],mat,budget,sheet:{w:2750,h:1840,kerf:4,trim:10},updated:Date.now()}}
function makeModule(tplKey,over){const t=JSON.parse(JSON.stringify(TPL[tplKey]||TPL.livre));const m=Object.assign({id:uid(),t:"mod",layer:"moveis",col:"layer",lw:1.2,x:0,y:0,dims:true},t,over||{});m.y=-((+m.elev||0)+m.H);delete m.elev;return m}
function ensure(p){
  const d=newProject(p.name||"Projeto");
  for(const k of ["grid","unit","textH","curLayer","sheet"]) if(p[k]===undefined) p[k]=d[k];
  if(!Array.isArray(p.layers)) p.layers=d.layers;
  for(const l of LAYERS0) if(!p.layers.find(x=>x.id===l.id)) p.layers.push({...l,visible:true,locked:false});
  p.mat=Object.assign(defaultMat(),p.mat||{}); p.budget=Object.assign(defaultBudget(),p.budget||{});
  p.items=(p.items||[]).filter(Boolean).map(it=>Object.assign({id:it.id||uid(),layer:"estrutura",col:"layer",lw:1.4},it));
  p.id=p.id||uid(); p.updated=p.updated||Date.now(); return p;
}
function migrateOld(raw){
  try{
    const o=JSON.parse(raw); if(!o||!o.projects) return [];
    return o.projects.map(op=>{
      const p=newProject(op.name||"Projeto"); p.grid=op.grid||5;
      for(const it of op.items||[]){
        const col=(!it.c||it.c==="#1f2328")?"layer":it.c;
        if(it.t==="line") p.items.push({id:uid(),t:"line",layer:"estrutura",col,lw:1.6,a:it.p[0],b:it.p[1]});
        else if(it.t==="rect") p.items.push({id:uid(),t:"rect",layer:"estrutura",col,lw:1.6,a:it.p[0],b:it.p[1]});
        else if(it.t==="dim") p.items.push({id:uid(),t:"dim",layer:"cotas",col:it.c==="#c62828"?"layer":col,lw:1,a:it.p[0],b:it.p[1],off:0,h:it.fs||4});
        else if(it.t==="text") p.items.push({id:uid(),t:"text",layer:"anot",col,lw:1,p:it.p[0],s:it.s,h:it.fs||5});
        else if(it.t==="free") p.items.push({id:uid(),t:"free",layer:"esboco",col,lw:2,pts:it.p});
      }
      return p;
    });
  }catch(e){return []}
}
let store={current:null,projects:[]};
let LS=null; try{const t="__mc_t"; localStorage.setItem(t,"1"); localStorage.removeItem(t); LS=localStorage}catch(_){LS=null}
const lsGet=k=>{try{return LS?LS.getItem(k):null}catch(_){return null}};
const lsSet=(k,v)=>{try{if(!LS) return false; LS.setItem(k,v); return true}catch(_){return false}};
function load(){
  let s=null; try{s=JSON.parse(lsGet(KEY)||"null")}catch(e){}
  if(s&&Array.isArray(s.projects)&&s.projects.length) store=s;
  else{
    const raw=lsGet(OLD_KEY), old=raw?migrateOld(raw):[];
    // quem chega pela primeira vez começa com um projeto vazio; os modelos ficam em Móvel
    const kept=old.filter(p=>p.items.length), novo=newProject("Projeto 1"); novo.sample=true;
    store={current:null,projects:kept.length?kept:[novo]};
  }
  store.projects.forEach(ensure);
  P=store.projects.find(p=>p.id===store.current)||store.projects[0]; store.current=P.id;
}

