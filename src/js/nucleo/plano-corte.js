/* plano de corte: guilhotina (cortes de ponta a ponta). Testa várias ordens e regras de corte e fica com o
   melhor resultado (menos chapas, depois a maior sobra aproveitável). Com veio, a peça não gira: o
   comprimento (L) acompanha o comprimento da chapa. */
const OFF_MIN=[300,150]; // sobra aproveitável: pelo menos 30 × 15 cm
function packOnce(items,S,grain,rule){
  const tr=+S.trim||0, k=+S.kerf||0, UW=S.w-2*tr, UH=S.h-2*tr;
  const sheets=[], over=[], md=Math.min(...items.map(p=>Math.min(p.L,p.W)),OFF_MIN[1]); // retalho menor que isso não serve para nada
  const orients=p=>grain?[[p.L,p.W,false]]:[[p.L,p.W,false],[p.W,p.L,true]];
  const fitIn=(sh,p)=>{let best=null;
    for(const f of sh.free) for(const [w,h,r] of orients(p)){
      if(w<=f.w&&h<=f.h){const ss=Math.min(f.w-w,f.h-h), ls=Math.max(f.w-w,f.h-h), sc=rule===2?f.w*f.h:ss; if(!best||sc<best.sc||(sc===best.sc&&ls<best.ls)) best={f,w,h,r,sc,ls}}
    } return best};
  for(const p of items){
    if(!orients(p).some(([w,h])=>w<=UW&&h<=UH)){over.push(p);continue}
    let best=null,bs=null;
    for(const sh of sheets){const b=fitIn(sh,p); if(b&&(!best||b.sc<best.sc)){best=b;bs=sh}}
    if(!best){bs={free:[{x:0,y:0,w:UW,h:UH}],pieces:[]}; sheets.push(bs); best=fitIn(bs,p)}
    const {f,w,h,r}=best;
    bs.pieces.push(Object.assign({},p,{x:f.x+tr,y:f.y+tr,w,h,rot:r}));
    bs.free.splice(bs.free.indexOf(f),1);
    const rw=f.w-w-k, rh=f.h-h-k;
    const vert=rule===1?true:(f.w-w<f.h-h); // 1: sempre corte longitudinal primeiro (faixas)
    const add=(r)=>{if(r.w>=md&&r.h>=md) bs.free.push(r)};
    if(vert){ if(rw>0) add({x:f.x+w+k,y:f.y,w:rw,h:h}); if(rh>0) add({x:f.x,y:f.y+h+k,w:f.w,h:rh}) }
    else { if(rw>0) add({x:f.x+w+k,y:f.y,w:rw,h:f.h}); if(rh>0) add({x:f.x,y:f.y+h+k,w:w,h:rh}) }
  }
  const used=sheets.reduce((a,sh)=>a+sh.pieces.reduce((b,p)=>b+p.w*p.h,0),0);
  for(const sh of sheets){
    sh.off=sh.free.filter(f=>Math.max(f.w,f.h)>=OFF_MIN[0]&&Math.min(f.w,f.h)>=OFF_MIN[1]).map(f=>({x:f.x+tr,y:f.y+tr,w:Math.floor(f.w),h:Math.floor(f.h)})).sort((a,b)=>b.w*b.h-a.w*a.h);
    delete sh.free;
  }
  const offA=sheets.reduce((a,sh)=>a+sh.off.reduce((b,o)=>b+o.w*o.h,0),0), bigOff=sheets.length?Math.max(0,...sheets[sheets.length-1].off.map(o=>o.w*o.h)):0;
  return {sheets,over,util:sheets.length?used/(sheets.length*S.w*S.h):0,area:used/1e6,offA,bigOff};
}
function pack(pieces,S,grain){
  const orders=[
    (a,b)=>(b.L*b.W)-(a.L*a.W)||Math.max(b.L,b.W)-Math.max(a.L,a.W),
    (a,b)=>Math.max(b.L,b.W)-Math.max(a.L,a.W)||(b.L*b.W)-(a.L*a.W),
    (a,b)=>b.L-a.L||b.W-a.W,
    (a,b)=>b.W-a.W||b.L-a.L
  ];
  const tr=+S.trim||0, UA=(S.w-2*tr)*(S.h-2*tr), lb=Math.max(1,Math.ceil(pieces.reduce((a,p)=>a+p.L*p.W,0)/UA));
  let best=null, tries=0;
  for(const o of orders){const items=pieces.map(p=>Object.assign({},p)).sort(o);
    for(const rule of [0,1,2]){const r=packOnce(items,S,grain,rule); tries++;
      if(!best||r.sheets.length<best.sheets.length||(r.sheets.length===best.sheets.length&&r.bigOff>best.bigOff)) best=r}
    if(best.sheets.length<=lb) break; // já no mínimo possível de chapas
    if(tries>=6&&pieces.length>150) break; // lista grande: duas ordens bastam e a tela não trava
  }
  return best;
}

