/* ===== avisos de falha: quando uma parte do app dá erro, manda um aviso curto e sem identificação (termos, cláusula 7). Só na versão instalável =====
   Só com a conta entrada e os termos aceitos (tmOk). Vai: a mensagem do erro sem textos entre aspas, e-mails e números longos,
   o arquivo e a linha, a aba aberta e a versão do app. Não vai: projeto, medidas, cliente, conta nem aparelho.
   No máximo 3 por abertura do app, sem repetir. As regras (firestore.rules: falhas) só deixam criar; só o dono lê e apaga, no console do Firebase. */
const FL={max:3,n:0,vistos:new Set(),fila:[]};
const flLimpa=(s,max)=>String(s==null?"":s).replace(/"[^"]*"|'[^']*'|`[^`]*`/g,'"…"').replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g,"[e-mail]")
  .replace(/\d{4,}/g,"#").replace(/\s+/g," ").trim().slice(0,max);
const flArq=u=>{try{const p=new URL(u,location.href); return p.origin===location.origin?(p.pathname.split("/").pop()||"index.html"):""}catch(_){return ""}};
// primeiro ponto do app na pilha do erro: só arquivo:linha:coluna
function flOnde(stack){
  for(const m of String(stack||"").matchAll(/(https?:\/\/[^\s)]+?):(\d+):(\d+)/g)){const f=flArq(m[1]); if(f) return `${f}:${m[2]}:${m[3]}`}
  return "";
}
function flAnotar(msg,onde){
  try{
    if(FL.n>=FL.max) return;
    const m=flLimpa(msg,300); if(!m||/^Script error\.?$/i.test(m)) return;
    const k=m+"|"+onde; if(FL.vistos.has(k)) return;
    FL.vistos.add(k); FL.n++; FL.fila.push({msg:m,onde:String(onde||"").slice(0,80)}); flEnviar();
  }catch(_){}
}
function flEnviar(){
  if(!FL.fila.length||!FB.db||!tmOk()||!online()) return;
  const aba=String(typeof curView==="string"?curView:"").slice(0,20);
  for(const f of FL.fila.splice(0))
    FB.db.collection("falhas").add({v:1,app:APP_VER,msg:f.msg,onde:f.onde,aba,quando:firebase.firestore.FieldValue.serverTimestamp()}).catch(()=>{});
}
// erros de extensões do navegador e de outros sites ficam de fora
addEventListener("error",e=>{const f=e.filename&&flArq(e.filename); if(f) flAnotar(e.message,`${f}:${e.lineno|0}:${e.colno|0}`)});
// recusas com código (sem internet, Firestore, IA) são tratadas pelo app e não são falhas
addEventListener("unhandledrejection",e=>{const r=e.reason; if(!r||r.code) return; const o=flOnde(r.stack); if(o) flAnotar(r.message||r,o)});
addEventListener("online",flEnviar);
