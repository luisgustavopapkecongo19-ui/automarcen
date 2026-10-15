/* ===================== exportação ===================== */
let dl=null, dlState="pending";
//#if app
dl={save:async({filename,data})=>{const blob=data instanceof Blob?data:new Blob([data],{type:/\.json$/.test(filename)?"application/json":/\.svg$/.test(filename)?"image/svg+xml":/\.csv$/.test(filename)?"text/csv;charset=utf-8":/\.html?$/.test(filename)?"text/html;charset=utf-8":"application/octet-stream"});const u=URL.createObjectURL(blob), a=document.createElement("a"); a.href=u; a.download=filename; a.rel="noopener"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(u),60000)}}; dlState="ok";
//#else
(async()=>{try{dl=window.claude&&window.claude.use?await window.claude.use("downloads"):null}catch(_){dl=null} dlState=dl?"ok":"none"})();
//#endif
async function saveFile(name,data){
  if(!dl){toast(dlState==="pending"?"Preparando o download, tente de novo em instantes":"Downloads não estão disponíveis nesta tela"); return false}
  try{await dl.save({filename:name,data}); return true}
  catch(e){ if(e&&e.code==="declined") return false; if(e&&e.code==="rate_limited") toast("Já existe um download aguardando confirmação"); else toast("Não foi possível salvar o arquivo"); return false }
}
const fileBase=()=>(P.name||"projeto").normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"").toLowerCase()||"projeto";
const PRINT={bg:"#ffffff",ink:"#1a1d22",grid:false,sel:false,lws:1,fa:.55,minor:"#eee",major:"#ddd",axis:"#ccc"};

function renderPNG(maxPx=2400,titleBlock=true){
  const b=sceneBounds(); if(!b) return null;
  const pad=Math.max(12,(b[2]-b[0])*.06), bw=b[2]-b[0]+pad*2, bh=b[3]-b[1]+pad*2;
  const tb=titleBlock?120:0, s=Math.min(14,(maxPx-40)/bw,(maxPx-40-tb)/bh);
  const c=document.createElement("canvas"); c.width=Math.round(bw*s); c.height=Math.round(bh*s)+tb; const g=c.getContext("2d");
  renderScene(g,s,(-b[0]+pad)*s,(-b[1]+pad)*s,c.width,c.height,{...PRINT,lws:Math.max(1,c.width/1400)});
  if(titleBlock){
    const y0=c.height-tb+20, w=Math.min(c.width-40,640), x0=c.width-w-20;
    g.strokeStyle="#1a1d22"; g.lineWidth=1.5; g.strokeRect(x0,y0,w,tb-40);
    g.beginPath(); g.moveTo(x0+w*.62,y0); g.lineTo(x0+w*.62,y0+tb-40); g.stroke();
    g.fillStyle="#1a1d22"; g.textBaseline="top"; g.textAlign="left";
    g.font=`700 22px ${FONT}`; g.fillText(P.name,x0+14,y0+14,w*.6-20);
    g.font=`500 14px ${FONT}`; g.fillStyle="#646a74"; g.fillText(`Medidas em ${P.unit} · sem escala`,x0+14,y0+48,w*.6-20);
    g.fillText("Data",x0+w*.62+14,y0+14); g.fillStyle="#1a1d22"; g.font=`600 16px ${FONT}`; g.fillText(new Date().toLocaleDateString("pt-BR"),x0+w*.62+14,y0+34);
  }
  return c;
}
function toSVG(){
  const b=sceneBounds(); if(!b) return null;
  const pad=Math.max(10,(b[2]-b[0])*.05), vb=[b[0]-pad,b[1]-pad,b[2]-b[0]+pad*2,b[3]-b[1]+pad*2], k=v=>+v.toFixed(3);
  const col=c=>c==="auto"?"#1a1d22":c, out=[];
  for(const it of P.items){ if(!visible(it)) continue; const L=layer(it.layer);
    out.push(`<g id="${esc(it.id)}" data-layer="${esc(L.name)}">`);
    for(const pr of prims(it)){
      const sw=k((pr.lw||1)*vb[2]/900), dash=pr.dash?` stroke-dasharray="${k(sw*4)} ${k(sw*3)}"`:"";
      if(pr.k==="line") out.push(`<line x1="${k(pr.a[0])}" y1="${k(pr.a[1])}" x2="${k(pr.b[0])}" y2="${k(pr.b[1])}" stroke="${col(pr.col)}" stroke-width="${sw}"${dash}/>`);
      else if(pr.k==="poly"){const pts=pr.pts.map(p=>k(p[0])+","+k(p[1])).join(" "), fill=pr.fill?(pr.fill==="ink"?col(pr.col):pr.fill):"none"; out.push(`<${pr.close?"polygon":"polyline"} points="${pts}" fill="${fill}"${pr.fill&&pr.fill!=="ink"?' fill-opacity=".55"':""} stroke="${col(pr.col)}" stroke-width="${sw}"${dash}/>`)}
      else if(pr.k==="circle") out.push(`<circle cx="${k(pr.c[0])}" cy="${k(pr.c[1])}" r="${k(pr.r)}" fill="none" stroke="${col(pr.col)}" stroke-width="${sw}"/>`);
      else if(pr.k==="path") out.push(`<polyline points="${pr.pts.map(p=>k(p[0])+","+k(p[1])).join(" ")}" fill="none" stroke="${col(pr.col)}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`);
      else if(pr.k==="text"){const anchor=pr.align==="center"?"middle":"start", bl=pr.base==="top"?"hanging":pr.base==="middle"?"middle":"alphabetic", deg=k((pr.ang||0)*180/Math.PI);
        out.push(`<text x="${k(pr.p[0])}" y="${k(pr.p[1])}" font-size="${k(pr.h)}" font-family="Arial, sans-serif" fill="${col(pr.col)}" text-anchor="${anchor}" dominant-baseline="${bl}"${deg?` transform="rotate(${deg} ${k(pr.p[0])} ${k(pr.p[1])})"`:""}>${esc(pr.s)}</text>`)}
    }
    out.push("</g>");
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map(k).join(" ")}" width="${k(vb[2]*10)}mm" height="${k(vb[3]*10)}mm"><title>${esc(P.name)}</title><rect x="${k(vb[0])}" y="${k(vb[1])}" width="${k(vb[2])}" height="${k(vb[3])}" fill="#fff"/>${out.join("")}</svg>`;
}
function toDXF(){return buildDXF(P.items.filter(visible).map(it=>({layer:layer(it.layer).name,prims:prims(it)})))}
function partsCSV(){
  const A=allParts(), mt=P.mat, rows=[["Código","Peça","Móvel","Qtd","Comprimento (mm)","Largura (mm)","Espessura (mm)","Material","Fita de borda (m)"]];
  for(const p of A.parts) rows.push([p.code,p.name,p.mod,p.q,p.L,p.W,mt[p.mat].t,mt[p.mat].name,(p.edge*p.q).toFixed(2).replace(".",",")]);
  return "﻿"+rows.map(r=>r.map(v=>{const s=String(v); return /[;"\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s}).join(";")).join("\r\n");
}
$("#bExport").onclick=showExport;
function showExport(){
  const has=!!sceneBounds(), mods=P.items.some(i=>i.t==="mod"||(i.t==="rect"&&+i.dep>0&&+i.dep<=5));
  const opts=[
    ["png","Imagem da prancha","PNG com carimbo, para WhatsApp ou e-mail",has],
    ["dxf","Desenho CAD (DXF)","Arquivo .dxf em milímetros, por camada, dentro de um .zip",has],
    ["svg","Vetor (SVG)","Abre em programas de desenho vetorial e no navegador",has],
    ["pdf","Orçamento em PDF","Proposta para o cliente com desenho, 3D e valores",mods],
    ["csv","Lista de peças (CSV)","Abre em planilhas e em otimizadores de corte",mods],
    ["json","Projeto (.json)","Arquivo de backup para abrir em outro aparelho",true],
    ["code","Código do projeto","Texto para copiar e colar em outro aparelho ou mandar pelo WhatsApp",true]
  ];
  dlg(`<h2>Exportar</h2>
    <div class="list">${opts.map(([k,t,d,ok])=>`<button class="li" data-ex="${k}" ${ok?"":"disabled style='opacity:.45'"}><span class="t"><b>${t}</b><small>${d}</small></span><svg class="i" viewBox="0 0 24 24"><path d="M12 4v12M7 11l5 5 5-5M5 20h14"/></svg></button>`).join("")}</div>
    ${dlState==="none"?`<p class="warn">Nesta tela os downloads não estão disponíveis. A imagem pode ser salva tocando e segurando, e o projeto pode ser copiado como código.</p>`:""}
    <div class="row act"><button class="btn ghost" data-x>Fechar</button></div>`,el=>{
    $("[data-x]",el).onclick=closeDlg;
    $$("[data-ex]",el).forEach(b=>b.onclick=()=>doExport(b.dataset.ex));
  });
}
async function doExport(k){
  const base=fileBase();
  if(k==="png"){const c=renderPNG(); if(!c) return; c.toBlob(async blob=>{ if(dl){if(await saveFile(base+".png",blob)) toast("Imagem salva")} else showImage(c.toDataURL("image/png"))},"image/png")}
  if(k==="svg"){const s=toSVG(); if(s&&await saveFile(base+".svg",s)) toast("SVG salvo")}
  if(k==="dxf"){const s=toDXF(); const blob=new Blob(makeZipParts([{name:base+".dxf",data:s}]),{type:"application/zip"}); if(await saveFile(base+"-dxf.zip",blob)) toast("DXF salvo. Descompacte o .zip e abra no seu programa de CAD")}
  if(k==="csv"){if(await saveFile(base+"-pecas.csv",partsCSV())) toast("Lista de peças salva")}
  if(k==="json"){ if(dlState==="none") return showCode(); const s=JSON.stringify({app:"marcenaria-cad",version:2,project:P},null,1); if(await saveFile(base+".json",s)) toast("Arquivo do projeto salvo")}
  if(k==="code") showCode();
  if(k==="pdf"){await exportPDF()}
}
function showImage(url){dlg(`<h2>Imagem da prancha</h2><p>Toque e segure a imagem para salvar ou compartilhar.</p><img src="${url}" alt="Prancha exportada" style="width:100%;border:1px solid var(--line);border-radius:10px;background:#fff"><div class="row"><button class="btn ghost" data-x>Fechar</button></div>`,el=>$("[data-x]",el).onclick=closeDlg)}

