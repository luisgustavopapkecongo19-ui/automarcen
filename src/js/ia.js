/* ===== IA da versão instalável: Gemini pelo Firebase AI Logic. Só na versão instalável; a do claude.ai usa o Claude =====
   Imita o "sample" do claude.ai (mesmas chamadas e códigos de erro), então o chat e a foto/voz usam o mesmo código nas duas versões.
   Regras: só quem entrou na conta usa a IA; cada pessoa tem IA_LIMITE pedidos por dia, contados em users/{uid}/uso/{dia}
   (firestore.rules confere a conta). O App Check (reCAPTCHA Enterprise) liga sozinho quando FB_RECAPTCHA (conta.js) tiver a chave. */
const IA_MODELOS={quick:"gemini-3.5-flash-lite",default:"gemini-3.5-flash"};
const IA_LIMITE=50;
const IA_URL=m=>`https://firebasevertexai.googleapis.com/v1beta/projects/${FB_CFG.projectId}/models/${m}:`;
const iaErr=(code,msg)=>Object.assign(new Error(msg||code),{code});
const iaDia=()=>{const d=new Date(); return `${d.getUTCFullYear()}-${d.getUTCMonth()+1}-${d.getUTCDate()}`}; // o mesmo dia que as regras calculam (UTC)
async function iaConta(){
  // gasta um dos pedidos do dia; recusa quando acabou
  const ref=FB.db.collection("users").doc(FB.user.uid).collection("uso").doc(iaDia());
  try{
    await FB.db.runTransaction(async t=>{
      const s=await t.get(ref), n=s.exists?(s.data().n|0):0;
      if(n>=IA_LIMITE) throw iaErr("quota");
      if(s.exists) t.update(ref,{n:n+1}); else t.set(ref,{n:1});
    });
  }catch(e){ if(e.code==="quota") throw e; if(e.code==="permission-denied") throw iaErr("quota"); throw iaErr("network",e.message) }
}
async function iaHeaders(){
  const h={"Content-Type":"application/json","x-goog-api-key":FB_CFG.apiKey,"x-goog-api-client":"gl-js/automarcen fire/10.14.1"};
  try{h.Authorization="Firebase "+await FB.user.getIdToken()}catch(_){}
  if(FB.appCheck){try{const t=await Promise.race([FB.appCheck.getToken(),new Promise(ok=>setTimeout(ok,10000))]); if(t&&t.token) h["X-Firebase-AppCheck"]=t.token}catch(_){}} // sem o selo, o Firebase recusa e o app volta para o guia
  return h;
}
// foto do celular (3 a 8 MB) vira JPEG de até 1600 px: lê igual e sobe bem mais rápido
async function iaImagem(f){
  try{
    const bmp=await createImageBitmap(f), k=Math.min(1,1600/Math.max(bmp.width,bmp.height));
    const c=document.createElement("canvas"); c.width=Math.round(bmp.width*k); c.height=Math.round(bmp.height*k);
    c.getContext("2d").drawImage(bmp,0,0,c.width,c.height); bmp.close&&bmp.close();
    return {mimeType:"image/jpeg",data:c.toDataURL("image/jpeg",.85).split(",")[1]};
  }catch(_){
    if(!/^image\/(jpeg|png|webp|heic|heif)$/.test(f.type)) throw iaErr("image_rejected");
    const b=await new Promise((ok,bad)=>{const r=new FileReader(); r.onload=()=>ok(r.result); r.onerror=bad; r.readAsDataURL(f)});
    return {mimeType:f.type,data:String(b).split(",")[1]};
  }
}
// mensagens no jeito do claude.ai ({role,content}) → "contents" do Gemini (user/model, sem dois seguidos do mesmo lado)
function iaContents(msgs){
  const out=[];
  for(const m of msgs){
    const role=m.role==="assistant"?"model":"user", text=String(m.content||"");
    const last=out[out.length-1];
    if(last&&last.role===role) last.parts[0].text+="\n\n"+text; else out.push({role,parts:[{text}]});
  }
  return out;
}
const iaTexto=j=>((((j||{}).candidates||[])[0]||{}).content||{parts:[]}).parts.map(p=>p.text||"").join("");
async function iaPedir(contents,opts){
  opts=opts||{};
  if(!FB.user) throw iaErr("login");
  if(!online()) throw iaErr("network");
  if(Date.now()<IA.off) throw iaErr("off"); // o Firebase recusou há pouco (App Check ou IA desligada): espera 2 min sem gastar pedido do dia
  await iaConta();
  const model=IA_MODELOS[opts.modelTier]||IA_MODELOS.quick, stream=!!opts.onText;
  const body={contents,generationConfig:Object.assign({temperature:.4},opts.json?{responseMimeType:"application/json"}:{})};
  let res;
  try{ res=await fetch(IA_URL(model)+(stream?"streamGenerateContent?alt=sse":"generateContent"),{method:"POST",headers:await iaHeaders(),body:JSON.stringify(body),signal:opts.signal}) }
  catch(e){ if(e&&e.name==="AbortError") throw iaErr("cancelled"); throw iaErr("network",e&&e.message) }
  if(!res.ok){
    let msg=""; try{msg=JSON.stringify(await res.json())}catch(_){}
    console.warn("IA",res.status,msg);
    if(res.status===401||res.status===403) IA.off=Date.now()+120000;
    throw iaErr(res.status===429?"rate_limited":res.status===400&&/image|inline/i.test(msg)?"image_rejected":res.status===401||res.status===403?"off":"error",msg);
  }
  if(!stream){ const j=await res.json(); return iaTexto(j) }
  // resposta aos poucos (SSE): "data: {...}" por pedaço
  const rd=res.body.getReader(), dec=new TextDecoder(); let buf="", text="";
  try{
    for(;;){
      const {done,value}=await rd.read(); if(done) break;
      buf+=dec.decode(value,{stream:true});
      let i; while((i=buf.indexOf("\n"))>=0){
        const line=buf.slice(0,i).trim(); buf=buf.slice(i+1);
        if(!line.startsWith("data:")) continue;
        try{ text+=iaTexto(JSON.parse(line.slice(5))); opts.onText({text}) }catch(_){}
      }
    }
  }catch(e){ if(e&&e.name==="AbortError") throw Object.assign(iaErr("cancelled"),{text}); throw iaErr("network") }
  return text;
}
// o "sample" da versão instalável
async function IA(msgs,opts){ return {text:await iaPedir(iaContents(msgs),opts)} }
IA.json=async(prompt,opts)=>{
  opts=opts||{};
  const parts=[];
  for(const f of opts.images||[]) parts.push({inlineData:await iaImagem(f)});
  parts.push({text:prompt});
  const t=await iaPedir([{role:"user",parts}],Object.assign({},opts,{json:true,onText:null}));
  try{return JSON.parse(t)}catch(_){ const m=t.match(/\{[\s\S]*\}/); if(m) return JSON.parse(m[0]); throw iaErr("error","JSON") }
};
IA.limits=async()=>({images:{mediaTypes:["image/*"]}});
IA.gemini=true; IA.off=0;
