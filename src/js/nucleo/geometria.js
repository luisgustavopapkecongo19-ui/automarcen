/* geometria paramétrica de um módulo (mm). x: esq→dir, y: piso→topo, z: fundo→frente */
function modGeom(m){
  const t=+P.mat.caixa.t||18, tb=+P.mat.fundo.t||6, tf=+P.mat.frente.t||18, gap=3;
  const W=m.W*10,H=m.H*10,D=m.D*10,pl=Math.max(0,(+m.plinth||0)*10);
  const r2d=[],l2d=[],boxes=[],parts=[],hw={hinge:0,slide:0,pull:0,rod:0,rodSup:0,track:0,perfil:0,push:0},secs=[],holes=[];
  const PS=m.pull||"barra";
  let warn="";
  const add=(name,q,L,Wd,mat,edge)=>{if(q>0&&L>0&&Wd>0)parts.push({mid:m.id,mod:m.name,name,q,L:Math.round(L),W:Math.round(Wd),mat,edge:Math.max(0,edge)/1000})};
  const B=(x,y,z,w,h,d,kind,extra)=>boxes.push(Object.assign({x,y,z,w,h,d,kind},extra||{}));
  const Wi=W-2*t, sideH=H-t;
  B(0,0,0,t,sideH,D,"body"); B(W-t,0,0,t,sideH,D,"body");
  add("Lateral",2,sideH,D,"caixa",sideH);
  B(0,H-t,0,W,t,D,"body"); add("Tampo",1,W,D,"caixa",W+2*D);
  B(t,pl,tb,Wi,t,D-tb,"body"); add("Base",1,Wi,D-tb,"caixa",Wi);
  if(pl>0){B(t,0,D-60-t,Wi,pl,t,"body"); add("Rodapé",1,Wi,pl,"caixa",Wi)}
  const fH=sideH-pl; B(t,pl,0,Wi,fH,tb,"back"); add("Fundo",1,Wi,fH,"fundo",0);
  r2d.push({x:0,y:0,w:W,h:H,fill:"body",lw:1.6});
  r2d.push({x:0,y:H-t,w:W,h:t,fill:"body"});
  if(pl>0) r2d.push({x:t,y:0,w:Wi,h:pl,fill:null});
  const yb=pl+t, yt=H-t, hIn=yt-yb, Din=D-tb;
  const list=m.secs&&m.secs.length?m.secs:[{w:0,type:"porta"}];
  const n=list.length, avail=Wi-(n-1)*t;
  let fixed=0,autos=0; list.forEach(s=>{if(+s.w>0)fixed+=s.w*10;else autos++});
  let ws=list.map(s=>+s.w>0?s.w*10:0);
  if(autos){const aw=(avail-fixed)/autos; ws=ws.map(w=>w||aw); if(aw<100) warn="Os vãos automáticos ficaram muito estreitos."}
  else if(Math.abs(fixed-avail)>0.5){ws[n-1]+=avail-fixed; warn=`O último vão foi ajustado para ${num(ws[n-1]/10)} cm para fechar a largura.`}
  if(ws.some(w=>w<=0)){warn="A soma dos vãos passa da largura interna do móvel."; ws=ws.map(w=>Math.max(w,20))}
  const hingeCount=h=>h<=900?2:h<=1600?3:h<=2100?4:5;
  let x=t;
  list.forEach((s,i)=>{
    const w=ws[i], a=x, b=x+w; secs.push({a,b,w});
    if(i<n-1){B(b,yb,tb,t,hIn,Din,"body"); add("Divisória",1,hIn,Din,"caixa",hIn); r2d.push({x:b,y:yb,w:t,h:hIn,fill:"body"})}
    const fx0=(i===0?0:a-t/2)+gap/2, fx1=(i===n-1?W:b+t/2)-gap/2;
    const fy0=(pl>0?pl:0)+gap/2, fy1=(pl>0?H-t:H)-gap/2;
    const fw=fx1-fx0, fh=fy1-fy0, q=Math.max(0,Math.round(+s.n||0));
    const hid=s.type!=="nicho"?1:0;
    const shelves=(cnt)=>{
      for(let k=1;k<=cnt;k++){const ys=yb+k*hIn/(cnt+1)-t/2; B(a,ys,tb,w,t,Din-20,"inner"); r2d.push({x:a,y:ys,w,h:t,fill:"body",int:hid})}
      add("Prateleira",cnt,w-2,Din-20,"caixa",w-2);
    };
    const interior=()=>{ // zonas de baixo para cima, separadas por prateleira fixa
      const Z=s.int.filter(z=>z&&z.t), nz=Z.length, av=hIn-(nz-1)*t;
      let fix=0,au=0; Z.forEach(z=>{if(+z.h>0) fix+=z.h*10; else au++});
      let hz=Z.map(z=>+z.h>0?z.h*10:0);
      if(au){const ah=(av-fix)/au; hz=hz.map(h=>h||ah); if(ah<150) warn=warn||`Vão ${i+1}: as zonas automáticas do interior ficaram muito baixas.`}
      else if(Math.abs(fix-av)>.5) hz[nz-1]+=av-fix;
      if(hz.some(h=>h<=0)){warn=`Vão ${i+1}: a soma das alturas do interior passa da altura interna.`; const tot=hz.reduce((p2,h)=>p2+Math.max(h,1),0); hz=hz.map(h=>Math.max(h,1)*av/tot)}
      let y=yb, nFix=0;
      Z.forEach((z,zi)=>{
        const z0=y, zh=hz[zi], z1=y+zh, cnt=Math.max(0,Math.round(+z.n||0));
        if(z.t==="cabide"){
          const yr=z1-60, len=w-4, zc=tb+Din/2;
          B(a+2,yr-12,zc-12,len,25,25,"rod"); B(a,yr-15,zc-15,22,30,30,"metal"); B(b-22,yr-15,zc-15,22,30,30,"metal");
          l2d.push({x1:a+12,y1:yr,x2:b-12,y2:yr,int:hid,lw:2.2});
          const nh=Math.max(1,Math.min(6,Math.floor(w/170)));
          for(let k=1;k<=nh;k++){const cx=a+k*w/(nh+1), sw=Math.min(190,w/(nh+1)*.85), sy=yr-110;
            l2d.push({x1:cx,y1:yr+18,x2:cx,y2:yr-35,int:hid,lw:.8},{x1:cx,y1:yr-35,x2:cx-sw/2,y2:sy,int:hid,lw:.8},{x1:cx,y1:yr-35,x2:cx+sw/2,y2:sy,int:hid,lw:.8},{x1:cx-sw/2,y1:sy,x2:cx+sw/2,y2:sy,int:hid,lw:.8})}
          hw.rod+=len/1000; hw.rodSup+=2;
        } else if(z.t==="gavetas"){
          const k=Math.max(1,cnt||2), gp=3, rec=25, fwI=w-6, bw=w-26;
          const sl=Math.max(250,Math.floor((Din-rec-t-20)/50)*50), dh=(zh-10-(k-1)*gp)/k, bh=Math.max(60,dh-50);
          let yy=z0+5;
          for(let j=0;j<k;j++){
            const g="i"+i+"_"+zi+"_"+j, o={drawer:g,out:sl*.75}, zf=D-rec-t, zb=zf-sl;
            B(a+3,yy,zf,fwI,dh,t,"inner",o);
            B(a+13,yy+15,zb,t,bh,sl,"inner",o); B(a+13+bw-t,yy+15,zb,t,bh,sl,"inner",o);
            B(a+13+t,yy+15,zb,bw-2*t,bh,t,"inner",o); B(a+13,yy+15,zb,bw,6,sl,"back",o);
            B(a+w/2-45,yy+dh-28,zf+t,90,10,4,"metal",o);
            r2d.push({x:a+3,y:yy,w:fwI,h:dh,fill:"body",int:hid});
            r2d.push({x:a+w/2-45,y:yy+dh-28,w:90,h:10,fill:"ink",lw:.5,int:hid});
            yy+=dh+gp;
          }
          add("Frente de gaveta interna",k,fwI,dh,"caixa",2*(fwI+dh));
          add("Lateral de gaveta",2*k,sl,bh,"caixa",sl);
          add("Frente/traseira de gaveta",k,bw-2*t,bh,"caixa",bw-2*t);
          add("Fundo de gaveta",k,bw,sl,"fundo",0);
          hw.slide+=k;
        } else {
          for(let k=1;k<=cnt;k++){const ys=z0+k*zh/(cnt+1)-t/2; B(a,ys,tb,w,t,Din-20,"inner"); r2d.push({x:a,y:ys,w,h:t,fill:"body",int:hid})}
          add("Prateleira",cnt,w-2,Din-20,"caixa",w-2);
        }
        y=z1;
        if(zi<nz-1){B(a,y,tb,w,t,Din,"inner"); r2d.push({x:a,y,w,h:t,fill:"body",int:hid}); nFix++; y+=t}
      });
      add("Prateleira fixa",nFix,w-2,Din,"caixa",w-2);
    };
    const hasInt=Array.isArray(s.int)&&s.int.some(z=>z&&z.t);
    // puxador conforme o estilo do móvel. dir "h": no topo da frente (gaveta); "v": na borda de abrir (porta)
    const pullOn=(x0,y0,w0,h0,o,f2,dir,zf,side,hy,hl)=>{
      const zz=zf+tf, fl=Object.assign({lw:.6},f2);
      if(PS==="nenhum"){hw.push++; return}
      if(PS==="cava"||PS==="perfil"){
        const sw=PS==="cava"?22:20, kind=PS==="cava"?"groove":"metal", dz=PS==="cava"?-8:0, dd=PS==="cava"?8:16;
        // a cava fica 1 mm para fora da frente nas faces à vista; rente a ela, o 3D pisca em riscos (z-fighting)
        const e=PS==="cava"?1:0;
        if(dir==="h"){B(x0-e,y0+h0-sw,zz+dz,w0+2*e,sw+e,dd+e,kind,o); r2d.push(Object.assign({x:x0,y:y0+h0-sw,w:w0,h:sw,fill:PS==="cava"?"groove":"ink"},fl)); if(PS==="perfil") hw.perfil+=w0/1000}
        else {const xs=side==="R"?x0+w0-sw:x0; B(xs-e,y0-e,zz+dz,sw+2*e,h0+2*e,dd+e,kind,o); r2d.push(Object.assign({x:xs,y:y0,w:sw,h:h0,fill:PS==="cava"?"groove":"ink"},fl)); if(PS==="perfil") hw.perfil+=h0/1000}
        return;
      }
      hw.pull++;
      if(dir==="h"){
        if(PS==="botao"){const cx=x0+w0/2; B(cx-15,y0+h0-60,zz,30,30,22,"metal",o); r2d.push(Object.assign({x:cx-15,y:y0+h0-60,w:30,h:30,fill:"ink"},fl)); return}
        const pw=Math.min(160,w0*.45); B(x0+w0/2-pw/2,y0+h0-45,zz,pw,12,14,"metal",o); r2d.push(Object.assign({x:x0+w0/2-pw/2,y:y0+h0-45,w:pw,h:12,fill:"ink"},fl));
      } else {
        const xp=side==="R"?x0+w0-40:x0+28;
        if(PS==="botao"){B(xp-9,hy+hl/2-15,zz,30,30,22,"metal",o); r2d.push(Object.assign({x:xp-9,y:hy+hl/2-15,w:30,h:30,fill:"ink"},fl)); return}
        B(xp,hy,zz,12,hl,14,"metal",o); r2d.push(Object.assign({x:xp,y:hy,w:12,h:hl,fill:"ink"},fl));
      }
    };
    // gavetas com frente: y0 = base da 1ª frente, tot = soma das alturas das frentes
    const drawerFronts=(y0,tot,k,hsA,tag)=>{
      const hsOk=Array.isArray(hsA)&&hsA.length===k&&hsA.every(v=>+v>0);
      const sum=hsOk?hsA.reduce((a2,b2)=>a2+(+b2),0):k, sl=Math.max(250,Math.floor((Din-20)/50)*50), bw=w-26, hs=[];
      let y=y0;
      for(let j=0;j<k;j++){
        const dh=hsOk?tot*(+hsA[j])/sum:tot/k, g=tag+i+"_"+j, bh=Math.max(60,dh-60), by=y+15, bx=a+13, o={drawer:g,out:sl*.75}; hs.push([dh,bh]);
        B(fx0,y,D,fw,dh,tf,"front",o);
        B(bx,by,D-sl,t,bh,sl,"inner",o); B(bx+bw-t,by,D-sl,t,bh,sl,"inner",o);
        B(bx+t,by,D-sl,bw-2*t,bh,t,"inner",o); B(bx+t,by,D-t,bw-2*t,bh,t,"inner",o);
        B(bx,by,D-sl,bw,6,sl,"back",o);
        r2d.push({x:fx0,y,w:fw,h:dh,fill:"front"});
        pullOn(fx0,y,fw,dh,o,{},"h",D);
        holes.push({mid:m.id,kind:"slide",sec:i,y:by,sl});
        y+=dh+gap;
      }
      const grp={}; for(const [dh,bh] of hs){const key=Math.round(dh)+"|"+Math.round(bh); grp[key]=(grp[key]||0)+1}
      for(const key in grp){const [dh,bh]=key.split("|").map(Number), c=grp[key];
        add("Frente de gaveta",c,fw,dh,"frente",2*(fw+dh));
        add("Lateral de gaveta",2*c,sl,bh,"caixa",sl);
        add("Frente/traseira de gaveta",2*c,bw-2*t,bh,"caixa",bw-2*t);}
      add("Fundo de gaveta",k,bw,sl,"fundo",0);
      hw.slide+=k;
    };
    // portas de abrir: y0 = base da folha, h = altura da folha
    const doorLeaves=(y0,h,leaves)=>{
      const lw=(fw-(leaves-1)*gap)/leaves;
      for(let j=0;j<leaves;j++){
        const lx=fx0+j*(lw+gap);
        const hingeLeft=leaves===2?j===0:(s.hinge?s.hinge==="E":(a+w/2)<W/2);
        const hx=hingeLeft?lx:lx+lw, hs=hingeLeft?lx+lw:lx;
        const id="p"+i+"_"+j, hl=Math.min(160,h*.3), dr={door:{id,hx,sign:hingeLeft?1:-1}};
        const hy=pl===0&&y0===fy0?y0+50:(H<=1300||y0>fy0?y0+h-50-hl:y0+h/2-hl/2);
        B(lx,y0,D,lw,h,tf,"front",dr);
        r2d.push({x:lx,y:y0,w:lw,h,fill:"front",door:1});
        pullOn(lx,y0,lw,h,dr,{door:1},"v",D,hingeLeft?"R":"L",hy,hl);
        l2d.push({x1:hs,y1:y0,x2:hx,y2:y0+h/2,dash:1,door:1},{x1:hs,y1:y0+h,x2:hx,y2:y0+h/2,dash:1,door:1});
        const nh=hingeCount(h); hw.hinge+=nh;
        holes.push({mid:m.id,kind:"hinge",sec:i,leaf:j,y0,h,lw,n:nh,side:hingeLeft?"E":"D"});
      }
      add(leaves===2?"Porta (par)":"Porta",leaves,h,lw,"frente",2*(h+lw));
    };
    if(s.type==="nicho"){
      r2d.push({x:a,y:yb,w,h:hIn,fill:null}); if(hasInt) interior(); else shelves(q);
    } else if(s.type==="gavetas"){
      const k=Math.max(1,q||3);
      drawerFronts(fy0,fh-(k-1)*gap,k,s.hs,"d");
    } else if(s.type==="pgav"){
      const k=Math.max(1,q||2), GH=+s.gh>0?clamp(s.gh*10,k*80,fh-250):Math.min(fh*.5,k*170);
      drawerFronts(fy0,GH-(k-1)*gap,k,s.hs,"g");
      const ys=Math.max(yb,fy0+GH+gap/2-t/2); B(a,ys,tb,w,t,Din,"body"); r2d.push({x:a,y:ys,w,h:t,fill:"body",int:hid}); add("Prateleira fixa",1,w-2,Din,"caixa",w-2);
      const zH=yt-(ys+t), ns=s.np!==undefined&&s.np!==""?Math.max(0,+s.np||0):(zH>450?1:0);
      for(let k2=1;k2<=ns;k2++){const yy=ys+t+k2*zH/(ns+1)-t/2; B(a,yy,tb,w,t,Din-20,"inner"); r2d.push({x:a,y:yy,w,h:t,fill:"body",int:hid})}
      add("Prateleira",ns,w-2,Din-20,"caixa",w-2);
      const yd=fy0+GH+gap; doorLeaves(yd,fy1-yd,+s.lv||(fw>650?2:1));
    } else if(s.type==="correr"){
      if(hasInt) interior(); else shelves(s.n===undefined||s.n===""?1:q);
      const L=clamp(+s.lv||2,2,3), ov=30, lw=(fw+(L-1)*ov)/L;
      for(let j=0;j<L;j++){
        const lx=fx0+j*(lw-ov), outer=j%2===1, zf=D+(outer?tf+8:0), o=outer?{slide:{id:"c"+i+"_"+j,dx:-(lw-ov)}}:{};
        B(lx,fy0,zf,lw,fh,tf,"front",o);
        r2d.push({x:lx,y:fy0,w:lw,h:fh,fill:"front",door:1});
        if(PS!=="nenhum") pullOn(lx,fy0,lw,fh,o,{door:1},"v",zf,j===0?"L":"R",fy0+fh/2-80,160);
        const cy=fy0+fh/2+(outer?120:-120), x1=lx+lw*.32, x2=lx+lw*.68, ah=Math.min(40,lw*.06);
        l2d.push({x1,y1:cy,x2,y2:cy,door:1,lw:.7},{x1,y1:cy,x2:x1+ah,y2:cy+ah*.6,door:1,lw:.7},{x1,y1:cy,x2:x1+ah,y2:cy-ah*.6,door:1,lw:.7},{x1:x2,y1:cy,x2:x2-ah,y2:cy+ah*.6,door:1,lw:.7},{x1:x2,y1:cy,x2:x2-ah,y2:cy-ah*.6,door:1,lw:.7});
      }
      hw.track+=L;
      add("Porta de correr",L,fh,lw,"frente",2*(fh+lw));
    } else {
      if(hasInt) interior(); else shelves(s.n===undefined||s.n===""?1:q);
      doorLeaves(fy0,fh,s.type==="porta2"?2:1);
    }
    x=b+t;
  });
  return {r2d,l2d,boxes,parts,hw,secs,holes,warn,t,W,H,D,pl};
}

