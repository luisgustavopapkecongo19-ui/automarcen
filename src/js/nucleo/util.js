/*CORE-START*/
const uid=()=>Math.random().toString(36).slice(2,10);
const dist=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const num=(v,d=1)=>(Math.round((+v||0)*10**d)/10**d).toLocaleString("pt-BR",{maximumFractionDigits:d});
const brl=v=>(+v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const SOLID="#d8c7ae";
const FIN=[["Branco TX","#efede8"],["Cinza Cristal","#c6c8c4"],["Grafite","#4a4e55"],["Preto","#232427"],["Carvalho","#b88c5f"],["Freijó","#a3774b"],["Nogueira","#6b4831"],["Verde Sálvia","#8ea288"],["Azul Petróleo","#2f5463"],["Terracota","#b3633e"],["Amêndoa","#c9a27a",1],["Cinamomo","#8a5a3c",1],["Tauari","#d6b88f",1],["Jequitibá","#c08c5a",1],["Branco Neve","#f7f7f4"],["Areia","#d9cbb4"],["Fendi","#b7aa98"],["Rosa Quartzo","#d8b4ac"]];
FIN[4][2]=FIN[5][2]=FIN[6][2]=1; // padrão madeirado (veio)
const WOOD=new Set(FIN.filter(f=>f[2]).map(f=>f[1]));
const finBg=f=>f[2]?`repeating-linear-gradient(90deg,${f[1]} 0 3px,color-mix(in srgb,${f[1]} 82%,#000) 3px 4px,${f[1]} 4px 7px)`:f[1];
const SEC_TYPES={porta:"Porta",porta2:"Porta dupla",gavetas:"Gavetas",pgav:"Porta sobre gavetas",correr:"Portas de correr",nicho:"Nicho aberto"};
let P=null; // projeto atual

