/* ZIP sem compressão e DXF */
const CRC_T=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(u){let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=CRC_T[(c^u[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
function makeZipParts(files){
  const enc=new TextEncoder(), chunks=[], central=[]; let off=0;
  const d=new Date(), dt=(d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1), dd=((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate();
  for(const f of files){
    const name=enc.encode(f.name), data=typeof f.data==="string"?enc.encode(f.data):f.data, crc=crc32(data);
    const lh=new DataView(new ArrayBuffer(30));
    lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(8,0,true);
    lh.setUint16(10,dt,true);lh.setUint16(12,dd,true);lh.setUint32(14,crc,true);lh.setUint32(18,data.length,true);
    lh.setUint32(22,data.length,true);lh.setUint16(26,name.length,true);lh.setUint16(28,0,true);
    chunks.push(new Uint8Array(lh.buffer),name,data);
    const ch=new DataView(new ArrayBuffer(46));
    ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint16(10,0,true);
    ch.setUint16(12,dt,true);ch.setUint16(14,dd,true);ch.setUint32(16,crc,true);ch.setUint32(20,data.length,true);ch.setUint32(24,data.length,true);
    ch.setUint16(28,name.length,true);ch.setUint16(30,0,true);ch.setUint16(32,0,true);ch.setUint16(34,0,true);ch.setUint16(36,0,true);
    ch.setUint32(38,0,true);ch.setUint32(42,off,true);
    central.push(new Uint8Array(ch.buffer),name);
    off+=30+name.length+data.length;
  }
  const cd=central.reduce((a,c)=>a+c.length,0), e=new DataView(new ArrayBuffer(22));
  e.setUint32(0,0x06054b50,true);e.setUint16(4,0,true);e.setUint16(6,0,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);
  e.setUint32(12,cd,true);e.setUint32(16,off,true);e.setUint16(20,0,true);
  return [...chunks,...central,new Uint8Array(e.buffer)];
}
const ACI=[[1,"#ff0000"],[2,"#ffff00"],[3,"#00ff00"],[4,"#00ffff"],[5,"#0000ff"],[6,"#ff00ff"],[8,"#808080"],[30,"#ff7f00"],[34,"#7f3f00"]];
function aci(hex){
  if(!hex||hex==="auto"||!/^#[0-9a-f]{6}$/i.test(hex)) return 7;
  const h=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)), c=h(hex);
  if(Math.max(...c)-Math.min(...c)<24) return c[0]<60||c[0]>200?7:8;
  let best=7,bd=1e9; for(const [n,v] of ACI){const q=h(v),d=(q[0]-c[0])**2+(q[1]-c[1])**2+(q[2]-c[2])**2; if(d<bd){bd=d;best=n}} return best;
}
const dxfStr=s=>String(s).replace(/[^\x20-\x7e]/g,ch=>"\\U+"+ch.charCodeAt(0).toString(16).toUpperCase().padStart(4,"0"));
const dxfLayer=name=>String(name).normalize("NFD").replace(/[̀-ͯ]/g,"").toUpperCase().replace(/[^A-Z0-9_-]+/g,"_")||"0";
/* entities: [{layer, prims}] — coordenadas em cm, y para baixo; saída em mm, y para cima */
function buildDXF(entities){
  const o=[]; const g=(c,v)=>{o.push(String(c),String(v))};
  const X=x=>(x*10).toFixed(3), Y=y=>(-y*10).toFixed(3);
  g(0,"SECTION");g(2,"HEADER");g(9,"$ACADVER");g(1,"AC1009");g(9,"$INSUNITS");g(70,4);g(0,"ENDSEC");
  g(0,"SECTION");g(2,"ENTITIES");
  const line=(a,b,ly,c)=>{g(0,"LINE");g(8,ly);g(62,c);g(10,X(a[0]));g(20,Y(a[1]));g(30,0);g(11,X(b[0]));g(21,Y(b[1]));g(31,0)};
  for(const e of entities){
    const ly=dxfLayer(e.layer);
    for(const pr of e.prims){
      const c=aci(pr.col);
      if(pr.k==="line") line(pr.a,pr.b,ly,c);
      else if(pr.k==="poly"){for(let i=0;i<pr.pts.length;i++){const j=i+1; if(j<pr.pts.length) line(pr.pts[i],pr.pts[j],ly,c); else if(pr.close) line(pr.pts[i],pr.pts[0],ly,c)}}
      else if(pr.k==="path"){for(let i=1;i<pr.pts.length;i++) line(pr.pts[i-1],pr.pts[i],ly,c)}
      else if(pr.k==="circle"){g(0,"CIRCLE");g(8,ly);g(62,c);g(10,X(pr.c[0]));g(20,Y(pr.c[1]));g(30,0);g(40,(pr.r*10).toFixed(3))}
      else if(pr.k==="text"&&pr.s){
        const ha=pr.align==="center"?1:0, va=pr.base==="top"?3:pr.base==="middle"?2:1;
        g(0,"TEXT");g(8,ly);g(62,c);g(10,X(pr.p[0]));g(20,Y(pr.p[1]));g(30,0);g(40,(pr.h*10).toFixed(3));g(1,dxfStr(pr.s));
        g(50,(-(pr.ang||0)*180/Math.PI).toFixed(3));g(72,ha);g(11,X(pr.p[0]));g(21,Y(pr.p[1]));g(31,0);g(73,va);
      }
    }
  }
  g(0,"ENDSEC");g(0,"EOF");
  return o.join("\r\n")+"\r\n";
}
/*CORE-END*/

