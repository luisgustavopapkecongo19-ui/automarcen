/* ===================== estado de edição ===================== */
let ptrTol=9; const tolFor=e=>e.pointerType==="touch"?26:e.pointerType==="pen"?14:9;
let tool="select", st=null, sel=new Set(), snapMark=null, hoverId=null, curCol="layer", curLw=1.4;
const opt={grid:true,osnap:true,ortho:false};
let undoS=[], redoS=[];
function pushUndo(){undoS.push(JSON.stringify(P.items)); if(undoS.length>120) undoS.shift(); redoS=[]; updUndo()}
function doUndo(){if(!undoS.length)return; redoS.push(JSON.stringify(P.items)); P.items=JSON.parse(undoS.pop()); afterEdit(true)}
function doRedo(){if(!redoS.length)return; undoS.push(JSON.stringify(P.items)); P.items=JSON.parse(redoS.pop()); afterEdit(true)}
function updUndo(){$("#bUndo").disabled=$("#bUndo2").disabled=!undoS.length; $("#bRedo").disabled=$("#bRedo2").disabled=!redoS.length}
function afterEdit(clean){if(clean) sel=new Set([...sel].filter(id=>P.items.some(i=>i.id===id))); touch(); save(); draw(); renderPanel(); updUndo(); updCtx(); dirty3D=true}
const byId=id=>P.items.find(i=>i.id===id);
const selItems=()=>P.items.filter(i=>sel.has(i.id));

function addItem(o){
  pushUndo();
  const it=Object.assign({id:uid(),layer:P.curLayer,col:curCol,lw:curLw},o);
  if(it.t==="dim"&&P.curLayer==="estrutura") it.layer="cotas";
  if(it.t==="text"&&P.curLayer==="estrutura") it.layer="anot";
  if(it.t==="free"&&P.curLayer==="estrutura") it.layer="esboco";
  if(!editable(it)){const L=layer(it.layer); L.visible=true; L.locked=false}
  P.items.push(it); afterEdit(); return it;
}

