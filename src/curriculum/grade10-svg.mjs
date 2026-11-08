import {grade10Defaults,grade10Family,grade10Math,grade10Valid,grade10Experiment} from './grade10-engine.mjs?v=r107_v15';
import {formatLinearInequality2D,formatLinearEquation2D,formatLinearExpr2D,formatMathText} from './math-formula-renderer.mjs?v=r107_v15';
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'),fmt=(x,d=2)=>Number.isFinite(Number(x))?Number(x).toFixed(d).replace(/\.00$/,''):'0';
const short=(s,max=43)=>String(s).length>max?String(s).slice(0,max-1)+'…':String(s);
const txt=(x,y,t,c='#16364d',s=13,a='start',w=700)=>`<text x="${fmt(x,2)}" y="${fmt(y,2)}" fill="${c}" font-size="${s}" font-weight="${w}" text-anchor="${a}" font-family="Inter,Segoe UI,sans-serif">${esc(formatMathText(t))}</text>`;
const line=(x1,y1,x2,y2,c='#1D4ED8',w=2.4,d='')=>`<line x1="${fmt(x1,2)}" y1="${fmt(y1,2)}" x2="${fmt(x2,2)}" y2="${fmt(y2,2)}" stroke="${c}" stroke-width="${w}" ${d?`stroke-dasharray="${d}"`:''}/>`;
const dot=(x,y,r=5.2,f='#B45309',s='#fff',h='')=>`<circle cx="${fmt(x,2)}" cy="${fmt(y,2)}" r="${fmt(r,2)}" fill="${f}" stroke="${s}" stroke-width="2" ${h?`data-handle="${h}"`:''}/>`;
const pill=(x,y,w,h,t,bg='#eef7fb',bd='#bdd9e7',c='#124e68',s=11.5)=>`<g><rect x="${fmt(x,2)}" y="${fmt(y,2)}" width="${fmt(w,2)}" height="${fmt(h,2)}" rx="7" fill="${bg}" stroke="${bd}"/><text x="${fmt(x+w/2,2)}" y="${fmt(y+h/2+4,2)}" fill="${c}" font-size="${s}" font-weight="700" text-anchor="middle" font-family="Inter,Segoe UI,sans-serif">${esc(formatMathText(t))}</text></g>`;
function frac10(x,y,lhs,num,den,rhs='',c='#124e68',s=12.2){
 const lw=lhs?String(lhs).length*(s*.56)+6:0,nw=Math.max(String(num).length,String(den).length)*(s*.56)+12,cx=x+lw+nw/2,rx=x+lw+nw+6;
 return `<g><desc>${esc(`${lhs}${num}/${den}${rhs}`)}</desc>${lhs?txt(x,y,lhs,c,s,'start',700):''}${txt(cx,y-8,num,c,s-1,'middle',700)}${line(x+lw,y-4,x+lw+nw,y-4,c,1.6)}${txt(cx,y+11,den,c,s-1,'middle',700)}${rhs?txt(rx,y,rhs,c,s,'start',700):''}</g>`;
}
function rightMark(Vx,Vy,Ax,Ay,Bx,By,sz=11,col='#c2572b'){
 const u1x=Ax-Vx,u1y=Ay-Vy,l1=Math.hypot(u1x,u1y)||1,u2x=Bx-Vx,u2y=By-Vy,l2=Math.hypot(u2x,u2y)||1;
 const p1x=Vx+u1x/l1*sz,p1y=Vy+u1y/l1*sz,p2x=Vx+u2x/l2*sz,p2y=Vy+u2y/l2*sz,p3x=p1x+u2x/l2*sz,p3y=p1y+u2y/l2*sz;
 return `<path d="M ${fmt(p1x,2)} ${fmt(p1y,2)} L ${fmt(p3x,2)} ${fmt(p3y,2)} L ${fmt(p2x,2)} ${fmt(p2y,2)}" fill="none" stroke="${col}" stroke-width="1.8"/>`;
}
function angleArc(Vx,Vy,Ax,Ay,Bx,By,r=22,label='',col='#1D4ED8'){
 const a1=Math.atan2(Ay-Vy,Ax-Vx),a2=Math.atan2(By-Vy,Bx-Vx);
 let d=a2-a1;while(d<=-Math.PI)d+=2*Math.PI;while(d>Math.PI)d-=2*Math.PI;
 const sx=Vx+r*Math.cos(a1),sy=Vy+r*Math.sin(a1),ex=Vx+r*Math.cos(a1+d),ey=Vy+r*Math.sin(a1+d),sw=d>=0?1:0,ma=a1+d/2;
 return `<g><path d="M ${fmt(Vx,2)} ${fmt(Vy,2)} L ${fmt(sx,2)} ${fmt(sy,2)} A ${fmt(r,2)} ${fmt(r,2)} 0 0 ${sw} ${fmt(ex,2)} ${fmt(ey,2)} Z" fill="${col}" fill-opacity="0.14"/><path d="M ${fmt(sx,2)} ${fmt(sy,2)} A ${fmt(r,2)} ${fmt(r,2)} 0 0 ${sw} ${fmt(ex,2)} ${fmt(ey,2)}" fill="none" stroke="${col}" stroke-width="2"/>${label?`<text x="${fmt(Vx+(r+16)*Math.cos(ma),2)}" y="${fmt(Vy+(r+16)*Math.sin(ma)+4,2)}" fill="${col}" font-size="11.5" font-weight="800" text-anchor="middle" font-family="Inter,Segoe UI,sans-serif" style="paint-order:stroke;stroke:#ffffff;stroke-width:3px;stroke-linejoin:round">${esc(label)}</text>`:''}</g>`;
}
function card10(title,badge,rows=[],obs='',corr=''){
 const rawDesc=rows.map(r=>typeof r==='string'?r.replace(/<[^>]+>/g,' '):r.t).join(' | ');
 const fracRow=rows.find(r=>typeof r==='string');
 const textRows=rows.filter(r=>typeof r!=='string');
 const displayRows=fracRow?[fracRow,...textRows.slice(0,2)]:textRows.slice(0,3);
 return `<g opacity="0" pointer-events="none"><desc>1. Quan sát: ${esc(obs)} | 2. Tương quan: ${esc(corr)} | ${esc(rawDesc)}</desc>
 <defs><clipPath id="g10-card-clip"><rect x="24" y="82" width="358" height="196" rx="12"/></clipPath></defs>
 <rect x="20" y="78" width="368" height="204" rx="14" fill="#f8fcfe" stroke="#c5dfec" stroke-width="1.5"/>
 <g clip-path="url(#g10-card-clip)">
  <rect x="32" y="90" width="344" height="32" rx="8" fill="#e6f4fa"/>
  ${txt(42,111,short(title,27),'#0f4963',13.2,'start',800)}${badge?pill(268,94,102,24,badge,'#1D4ED8','#1D4ED8','#fff',10.8):''}
  ${displayRows.map((r,i)=>typeof r==='string'?`<g transform="translate(0,${(154+i*42)-214})">${r}</g>`:txt(36,152+i*40,short(r.t.replace(/^•\s*/,''),44),r.c||'#1d4b63',r.s||12.6,'start',r.w||750)).join('')}
 </g></g>`;
}
function stageBox(x=398,y=78,w=542,h=416){
 return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#ffffff" stroke="#cde2ee" stroke-width="1.5"/>`;
}
function footer10(id,conclusion,t=0){
 const pulse=4.5+1.2*Math.sin(t*2.4);
 return `<g opacity="0" pointer-events="none"><desc>3. KẾT LUẬN SGK: ${esc(conclusion)}</desc>
 <rect x="20" y="442" width="920" height="66" rx="10" fill="#ffffffea" opacity="0" pointer-events="none"/>
 <defs><clipPath id="g10-foot-clip"><rect x="24" y="296" width="358" height="54" rx="10"/></clipPath></defs>
 <rect x="20" y="292" width="368" height="62" rx="12" fill="#eef8f5" stroke="#a9dec9" stroke-width="1.4"/>
 ${dot(36,323,pulse,'#15803D')}
 <g clip-path="url(#g10-foot-clip)">
  ${txt(50,327,short(conclusion,46),'#0f5e4b',12.2,'start',800)}
 </g></g>`;
}
export const GRADE10_VIEW={ox:668,oy:256,unit:30,triOrigin:[460,368],triScale:38};
const toScreen=(x,y,{ox=668,oy=256,unit=30}=GRADE10_VIEW)=>[ox+x*unit,oy-y*unit];
function arrow(x1,y1,x2,y2,c='#1D4ED8',label='',w=3,labelSide=1,labelFrac=0.52,labelOff=14){
 const a=Math.atan2(y2-y1,x2-x1),h=10,p1=[x2-h*Math.cos(a-.42),y2-h*Math.sin(a-.42)],p2=[x2-h*Math.cos(a+.42),y2-h*Math.sin(a+.42)];
 const lx=x1+(x2-x1)*labelFrac+labelSide*labelOff*Math.sin(a),ly=y1+(y2-y1)*labelFrac-labelSide*labelOff*Math.cos(a);
 const ltxt=label?`<text x="${fmt(lx,2)}" y="${fmt(ly+4,2)}" fill="${c}" font-size="11.5" font-weight="800" text-anchor="middle" font-family="Inter,Segoe UI,sans-serif" style="paint-order:stroke;stroke:#ffffff;stroke-width:4px;stroke-linejoin:round">${esc(formatMathText(label))}</text>`:'';
 return `<g>${line(x1,y1,x2,y2,c,w)}<polygon points="${fmt(x2,2)},${fmt(y2,2)} ${fmt(p1[0],2)},${fmt(p1[1],2)} ${fmt(p2[0],2)},${fmt(p2[1],2)}" fill="${c}"/>${ltxt}</g>`;
}
function haloTxt(x,y,t,c='#16364d',s=11.5,a='start',w=800){
 return `<text x="${fmt(x,2)}" y="${fmt(y,2)}" fill="${c}" font-size="${s}" font-weight="${w}" text-anchor="${a}" font-family="Inter,Segoe UI,sans-serif" style="paint-order:stroke;stroke:#ffffff;stroke-width:4px;stroke-linejoin:round">${esc(formatMathText(t))}</text>`;
}
function axes(view=GRADE10_VIEW,box={x:398,y:78,w:542,h:416}){
 const {ox,oy,unit}=view,g=[stageBox(box.x,box.y,box.w,box.h)];
 const minI=Math.ceil((box.x+14-ox)/unit),maxI=Math.floor((box.x+box.w-14-ox)/unit);
 const minJ=Math.ceil((oy-(box.y+box.h-14))/unit),maxJ=Math.floor((oy-(box.y+14))/unit);
 for(let i=minI;i<=maxI;i++){
  const x=ox+i*unit;g.push(line(x,box.y+10,x,box.y+box.h-10,i===0?'#3b6982':'#e8f1f6',i===0?2:1));
  if(i!==0&&i%2===0)g.push(txt(x,Math.min(box.y+box.h-14,Math.max(box.y+22,oy+15)),i,'#69889c',10,'middle',600));
 }
 for(let j=minJ;j<=maxJ;j++){
  const y=oy-j*unit;g.push(line(box.x+10,y,box.x+box.w-10,y,j===0?'#3b6982':'#e8f1f6',j===0?2:1));
  if(j!==0&&j%2===0)g.push(txt(Math.max(box.x+20,Math.min(box.x+box.w-22,ox-10)),y+4,j,'#69889c',10,'end',600));
 }
 g.push(txt(box.x+box.w-18,oy-8,'x','#2c5973',12.5,'end',800),txt(ox+10,box.y+22,'y','#2c5973',12.5,'start',800),txt(ox-8,oy+15,'O','#2c5973',11,'end',700));
 return g.join('');
}
function clipLine(a,b,c,R=7.4){
 const pts=[];
 if(Math.abs(b)>1e-8)for(const x of [-R,R]){const y=(c-a*x)/b;if(y>=-5.4&&y<=5.4)pts.push([x,y]);}
 if(Math.abs(a)>1e-8)for(const y of [-5.4,5.4]){const x=(c-b*y)/a;if(x>=-R&&x<=R&&!pts.some(p=>Math.hypot(p[0]-x,p[1]-y)<1e-4))pts.push([x,y]);}
 return pts.slice(0,2);
}
function renderDots(pts,col,prefix='',t=0,phaseShift=0){
 const activeAnim=t>0&&t<5.95?(1-t/6):0;
 return pts.map((p,i)=>{
  const jx=activeAnim?2.2*Math.sin(t*2.4+i*1.1+phaseShift)*activeAnim:0,jy=activeAnim?2.2*Math.cos(t*2.1+i*0.9+phaseShift)*activeAnim:0;
  const px=p[0]+jx,py=p[1]+jy;
  return `<g><circle cx="${fmt(px,2)}" cy="${fmt(py,2)}" r="8" fill="${col}" fill-opacity="0.22" stroke="${col}" stroke-width="1.6"/>${txt(px,py+3.5,prefix?`${prefix}${i+1}`:`${i+1}`,col,9.2,'middle',800)}</g>`;
 }).join('');
}
function vennElementCoords(n,cx,cy,rx,ry){
 const out=[];const count=Math.max(0,Math.min(12,Math.round(Number(n)||0)));
 for(let i=0;i<count;i++){
  const row=Math.floor(i/3),col=i%3,x=cx+(col-1)*rx,y=cy+(row-1.2)*ry;
  out.push([x,y]);
 }
 return out;
}
function phaseIndex(t){
 const ph=Math.min(1,Math.max(0,(t%6.0001)/6));
 return ph<=0.20?1:ph<=0.45?2:ph<=0.75?3:4;
}
function vennSVG(id,p,m,t,exp){
 const mode=Number(id.split('-C')[1]),ph=Math.min(1,Math.max(0,(t%6.0001)/6)),pulse=t>0&&t<5.95?1+.02*Math.sin(t*2.4):1,pIdx=phaseIndex(t),showAux=exp?.showAux!==false;
 if(mode===4){
  const openBLeft=!!exp?.openBLeft;
  const X=x=>452+(x+6)*36,i=m.result.intersection,u=m.result.union;
  const xL1=X(p.l1),xR1=X(p.r1),xL2=X(p.l2),xR2=X(p.r2);
  const xScanVal=-5.5+11*ph,xScan=X(xScanVal),inA=xScanVal>=p.l1&&xScanVal<=p.r1,inB=openBLeft?(xScanVal>p.l2&&xScanVal<=p.r2):(xScanVal>=p.l2&&xScanVal<=p.r2);
  const brBLeft=openBLeft?'(':'[';
  const phaseNotes=['Pha 1: Trượt thước kẹp A = [l₁; r₁]','Pha 2: Trượt thước kẹp B & gióng đầu mút','Pha 3: Tia laser quét vùng chồng lấp A ∩ B','Pha 4: Hợp nhất thanh A ∩ B và A ∪ B'];
  const ticks=[];for(let k=-6;k<=6;k++)ticks.push(line(X(k),134,X(k),412,'#eef5f9',1),txt(X(k),432,k,'#58798e',10.5,'middle',700));
  return [
   card10('Khoảng, đoạn trên trục số','10-01-C04',[
    {t:`A = [${fmt(p.l1,1)}; ${fmt(p.r1,1)}]  |  B = ${brBLeft}${fmt(p.l2,1)}; ${fmt(p.r2,1)}]`,c:'#1D4ED8',w:800},
    {t:`A ∩ B = ${i?(Math.abs(i[0]-i[1])<1e-9?`{${fmt(i[0],1)}}`:`${openBLeft&&Math.abs(i[0]-p.l2)<1e-9?'(':'['}${fmt(i[0],1)}; ${fmt(i[1],1)}]`):'∅'}`,c:'#15803D',w:800},
    {t:`A ∪ B = ${u.map((s,idx)=>idx===1&&openBLeft?`(${fmt(s[0],1)}; ${fmt(s[1],1)}]`:`[${fmt(s[0],1)}; ${fmt(s[1],1)}]`).join(' ∪ ')}`,c:'#234f68',w:750}
   ],'Cơ cấu 2 thước kẹp trượt đồng bộ trên trục số.','Kéo đầu mút của A hoặc B thấy miền giao A ∩ B co giãn.'),
   stageBox(),
   ticks.join(''),
   i?`<rect x="${fmt(X(i[0]),2)}" y="146" width="${fmt(Math.max(3,X(i[1])-X(i[0])),2)}" height="210" fill="#15803D" fill-opacity="0.11"/>`:'',
   showAux?`${line(xL1,168,xL1,366,'#1D4ED8',1.4,'4 4')}${line(xR1,168,xR1,366,'#1D4ED8',1.4,'4 4')}${line(xL2,248,xL2,366,'#B45309',1.4,'4 4')}${line(xR2,248,xR2,366,'#B45309',1.4,'4 4')}`:'',
   // Caliper Track A
   line(432,168,916,168,'#9bb5c7',2),
   `<rect x="${fmt(xL1,2)}" y="159" width="${fmt(Math.max(4,xR1-xL1),2)}" height="18" rx="6" fill="#1D4ED8" fill-opacity="0.28" stroke="#1D4ED8" stroke-width="2.2"/>`,
   txt(xL1,174,'[','#1D4ED8',19,'middle',900),txt(xR1,174,']','#1D4ED8',19,'middle',900),
   dot(xL1,148,7.5,'#1D4ED8','#fff','l1'),dot(xR1,148,7.5,'#1D4ED8','#fff','r1'),
   txt((xL1+xR1)/2,144,`A = [${fmt(p.l1,1)}; ${fmt(p.r1,1)}]`,'#1D4ED8',11.5,'middle',800),
   // Caliper Track B
   line(432,248,916,248,'#9bb5c7',2),
   `<rect x="${fmt(xL2,2)}" y="239" width="${fmt(Math.max(4,xR2-xL2),2)}" height="18" rx="6" fill="#B45309" fill-opacity="0.28" stroke="#B45309" stroke-width="2.2"/>`,
   txt(xL2,254,brBLeft,'#B45309',19,'middle',900),txt(xR2,254,']','#B45309',19,'middle',900),
   dot(xL2,228,7.5,openBLeft?'#fff':'#B45309','#B45309','l2'),dot(xR2,228,7.5,'#B45309','#fff','r2'),
   txt((xL2+xR2)/2,224,`B = ${brBLeft}${fmt(p.l2,1)}; ${fmt(p.r2,1)}]`,'#B45309',11.5,'middle',800),
   // Result Track: Intersection & Union
   line(432,334,916,334,'#9bb5c7',2),
   u.map(seg=>`<rect x="${fmt(X(seg[0]),2)}" y="352" width="${fmt(Math.max(4,X(seg[1])-X(seg[0])),2)}" height="10" rx="5" fill="#63a4c4" fill-opacity="0.65"/>`).join(''),
   txt(442,376,'A ∪ B','#2c6987',10.5,'start',800),
   i?`<g><rect x="${fmt(X(i[0]),2)}" y="324" width="${fmt(Math.max(4,X(i[1])-X(i[0])),2)}" height="20" rx="6" fill="#15803D" fill-opacity="0.38" stroke="#15803D" stroke-width="2.2"/>${txt(X(i[0]),339,openBLeft&&Math.abs(i[0]-p.l2)<1e-9?'(':'[','#0b5e4c',19,'middle',900)}${txt(X(i[1]),339,']','#0b5e4c',19,'middle',900)}${Math.abs(i[0]-i[1])<1e-9?dot(X(i[0]),334,7,'#15803D'):''}${txt((X(i[0])+X(i[1]))/2,316,`A ∩ B`,'#0b5e4c',11.5,'middle',900)}</g>`:pill(610,318,130,24,'A ∩ B = ∅','#fff3eb','#f1c19e','#b84a18'),
   // Scanning Laser Beam
   showAux?`<g>${line(xScan,128,xScan,412,inA&&inB?'#15803D':inA||inB?'#1D4ED8':'#94a7b5',2.4,'4 3')}${dot(xScan,168,inA?7:4.5,inA?'#1D4ED8':'#cbd5e1')}${dot(xScan,248,inB?7:4.5,inB?'#B45309':'#cbd5e1')}${dot(xScan,334,inA&&inB?8:4.5,inA&&inB?'#15803D':'#cbd5e1')}${pill(Math.max(418,Math.min(820,xScan-46)),112,92,20,`x = ${fmt(xScanVal,1)}`,inA&&inB?'#e5f7f1':'#f1f5f9',inA&&inB?'#15803D':'#cbd5e1',inA&&inB?'#0f6953':'#475569',9.8)}</g>`:'',
   line(432,412,916,412,'#3b6982',2),
   t>0?pill(412,84,296,22,phaseNotes[pIdx-1],'#fff4eb','#f3c299','#b84a18',9.8):'',
   footer10(id,`A ∩ B = ${i?`[${fmt(i[0],1)}; ${fmt(i[1],1)}]`:'∅'} • A ∪ B = ${u.map(s=>`[${fmt(s[0],1)}; ${fmt(s[1],1)}]`).join(' ∪ ')}`,t)
  ].join('');
 }
 const r=m.result,onlyA=Math.round(p.onlyA),inter=Math.round(r.intersection),onlyB=Math.round(p.onlyB),outside=Math.round(p.outside),nA=onlyA+inter,nB=onlyB+inter;
 const swapDiff=!!exp?.swapDiff;
 // Smooth dynamic circle sliding based on intersection ratio & timeline
 const overlapRatio=Math.min(1,inter/Math.max(1,Math.min(nA||1,nB||1)));
 const baseHalfGap=72-28*overlapRatio;
 const animSlide=(t>0&&ph<0.40)?24*(1-ph/0.40):0;
 const cxA=632-baseHalfGap-animSlide,cxB=632+baseHalfGap+animSlide,cyV=248,radV=98;
 // Element beads placed neatly inside each region, while drag handles live on a dedicated control rail below (y=368) — ZERO overlap!
 const centerOnlyA=cxA-44,centerOnlyB=cxB+44;
 const dotsA=vennElementCoords(onlyA,centerOnlyA,cyV+8,19,20),dotsAB=vennElementCoords(inter,632,cyV+8,15,20),dotsB=vennElementCoords(onlyB,centerOnlyB,cyV+8,19,20),dotsOut=vennElementCoords(outside,882,196,17,20);
 const activePool=mode===1?(pIdx===3?dotsAB:[...dotsA,...dotsAB,...dotsB]):mode===2?(swapDiff?dotsB:dotsA):[...dotsB,...dotsOut];
 const scanPt=activePool.length?activePool[Math.floor((t*3.2)%activePool.length)]:[632,cyV];
 const modeNames=['Giao A ∩ B & Hợp A ∪ B','Hiệu hai tập hợp A \\ B & B \\ A','Phần bù CᵤA = U \\ A'];
 const modeFormulas=[
  `n(A ∪ B) = n(A) + n(B) − n(A ∩ B) = ${nA} + ${nB} − ${inter} = ${r.union}`,
  swapDiff?`n(B \\ A) = n(B) − n(A ∩ B) = ${nB} − ${inter} = ${onlyB}`:`n(A \\ B) = n(A) − n(A ∩ B) = ${nA} − ${inter} = ${r.difference}`,
  `n(CᵤA) = n(U) − n(A) = ${r.total} − ${nA} = ${r.complement}`
 ];
 const vennPhases=mode===1?[
  'Pha 1: Hai vòng tập hợp A, B trượt lại gần nhau trong U',
  'Pha 2: Hạt phần tử phân luồng vào 3 miền rời nhau',
  'Pha 3: Khóa miền giao A ∩ B (phần tử chung)',
  `Pha 4: Ghép thanh lực lượng n(A∪B) = ${nA}+${nB}−${inter} = ${r.union}`
 ]:mode===2?[
  'Pha 1: Quét hai tập hợp A và B trong vũ trụ U',
  'Pha 2: Cắt bỏ phần giao A ∩ B → Giữ khay A \\ B',
  'Pha 3: Đảo vách ngăn sang khay B \\ A đối diện',
  `Pha 4: Đối chiếu n(A\\B)=${onlyA} ≠ n(B\\A)=${onlyB}`
 ]:[
  'Pha 1: Khởi tạo hộp vũ trụ U chứa toàn bộ hạt',
  `Pha 2: Khoanh vùng tập con A (${nA} phần tử)`,
  'Pha 3: Quét sáng toàn bộ miền phần bù CᵤA = U \\ A',
  `Pha 4: Thanh bù trừ n(CᵤA) = ${r.total} − ${nA} = ${r.complement}`
 ];
 const hlInter=mode===1&&(t===0||pIdx>=3);
 const hlDiffA=mode===2&&(!swapDiff&&(t===0||pIdx===2||pIdx===4));
 const hlDiffB=mode===2&&(swapDiff||(t>0&&(pIdx===3||pIdx===4)));
 // Dynamic stacked cardinality bar at bottom (y=412..468)
 const totU=Math.max(1,r.total),barTotalW=440,wOnlyA=(onlyA/totU)*barTotalW,wInter=(inter/totU)*barTotalW,wOnlyB=(onlyB/totU)*barTotalW,wOut=(outside/totU)*barTotalW;
 const bx0=448,by0=428;
 return [
  `<desc>A \\ B = ${onlyA} | A ∩ B = ${inter} | B \\ A = ${onlyB} | Ngoài: ${outside}</desc>`,
  card10(modeNames[mode-1],id,[
   {t:`n(U) = ${r.total}  |  n(A) = ${nA}  |  n(B) = ${nB}`,c:'#1D4ED8',w:800},
   {t:mode===1?`n(A ∩ B) = ${inter}  |  n(A ∪ B) = ${r.union}`:mode===2?`n(A \\ B) = ${r.difference}  |  n(B \\ A) = ${onlyB}`:`n(CᵤA) = ${onlyB} + ${outside} = ${r.complement}`,c:'#15803D',w:800}
  ],'Mô phỏng động 2 vòng tập hợp trượt giao nhau và thanh ghép lực lượng.',mode===1?'n(A∪B) = n(A) + n(B) − n(A∩B).':mode===2?'A \\ B gồm các phần tử thuộc A nhưng không thuộc B.':'CᵤA gồm các phần tử trong U nằm ngoài A.'),
  stageBox(),
  `<defs><clipPath id="clipA10"><circle cx="${fmt(cxA,2)}" cy="${cyV}" r="${radV}"/></clipPath><clipPath id="clipB10"><circle cx="${fmt(cxB,2)}" cy="${cyV}" r="${radV}"/></clipPath></defs>`,
  `<rect x="412" y="90" width="514" height="392" rx="14" fill="${mode===3?'#fff6ec':'#f9fcfe'}" stroke="#8fb3c9" stroke-width="2"/>`,
  pill(424,102,92,22,`U = ${r.total}`,'#e6f4fa','#9bcbe0','#0f4963',11),
  mode===3?`<circle cx="${fmt(cxA,2)}" cy="${cyV}" r="${radV}" fill="#ffffff"/>`:'',
  `<circle cx="${fmt(cxA,2)}" cy="${cyV}" r="${radV}" fill="#219ebc" fill-opacity="${mode===1?(pIdx===4?.34:.20):hlDiffA?.44:.08}" stroke="#1D4ED8" stroke-width="3"/>`,
  `<circle cx="${fmt(cxB,2)}" cy="${cyV}" r="${radV}" fill="#f3a261" fill-opacity="${mode===1?(pIdx===4?.34:.20):hlDiffB?.44:mode===3?.28:.10}" stroke="#B45309" stroke-width="3"/>`,
  `<g clip-path="url(#clipA10)"><circle cx="${fmt(cxB,2)}" cy="${cyV}" r="${fmt(radV*pulse,2)}" fill="${hlInter?'#15803D':mode===2?'#ffffff':'#f3a261'}" fill-opacity="${hlInter?.52:mode===2?.95:.16}"/></g>`,
  // Clean Region Headers above circles
  pill(cxA-34,122,86,22,`A (${nA})`,'#e6f4fa','#1D4ED8','#1D4ED8',11.5),
  pill(cxB-52,122,86,22,`B (${nB})`,'#fff1e6','#B45309','#c25918',11.5),
  showAux?`${txt(centerOnlyA,176,'A \\ B','#1D4ED8',10.5,'middle',800)}${txt(632,176,'A ∩ B','#0f6e58',10.5,'middle',800)}${txt(centerOnlyB,176,'B \\ A','#b85616',10.5,'middle',800)}`:'',
  txt(centerOnlyA,196,`${onlyA}`,'#1D4ED8',16,'middle',900),
  txt(632,196,`${inter}`,'#0f6e58',16,'middle',900),
  txt(centerOnlyB,196,`${onlyB}`,'#b85616',16,'middle',900),
  txt(882,158,`Ngoài: ${outside}`,'#446072',10.8,'middle',800),
  // Orbiting/breathing element particles (never overlapped by handles!)
  renderDots(dotsA,'#1D4ED8','a',t,0),
  renderDots(dotsAB,'#15803D','g',t,1.2),
  renderDots(dotsB,'#B45309','b',t,2.4),
  renderDots(dotsOut,'#5c7686','u',t,3.6),
  `<circle cx="${fmt(scanPt[0],2)}" cy="${fmt(scanPt[1],2)}" r="${fmt(11.5*pulse,2)}" fill="none" stroke="#B45309" stroke-width="2.4"/>`,
  // Dedicated Drag Control Knobs on bottom rim (y=366) with guide lines to regions
  line(centerOnlyA,344,centerOnlyA,366,'#1D4ED8',1.4,'3 2'),
  line(632,344,632,366,'#15803D',1.4,'3 2'),
  line(centerOnlyB,344,centerOnlyB,366,'#B45309',1.4,'3 2'),
  dot(centerOnlyA,368,7.2,'#1D4ED8','#fff','onlyA'),
  dot(632,368,7.8,'#15803D','#fff','inter'),
  dot(centerOnlyB,368,7.2,'#B45309','#fff','onlyB'),
  txt(centerOnlyA,388,`↕ A\\B (${onlyA})`,'#1D4ED8',9.8,'middle',800),
  txt(632,388,`↕ A∩B (${inter})`,'#0f6e58',9.8,'middle',800),
  txt(centerOnlyB,388,`↕ B\\A (${onlyB})`,'#c25918',9.8,'middle',800),
  // Visual Stacked Length Meter at bottom (replaces text-heavy box)
  `<g>
   <rect x="426" y="402" width="486" height="68" rx="10" fill="#f4f9fc" stroke="#cde1ec"/>
   <rect x="${fmt(bx0,2)}" y="${by0}" width="${fmt(Math.max(2,wOnlyA),2)}" height="16" rx="3" fill="#1D4ED8" fill-opacity="${mode===2&&swapDiff?0.28:0.88}"/>
   <rect x="${fmt(bx0+wOnlyA,2)}" y="${by0}" width="${fmt(Math.max(2,wInter),2)}" height="16" rx="3" fill="#15803D" fill-opacity="${mode===1?0.95:0.25}"/>
   <rect x="${fmt(bx0+wOnlyA+wInter,2)}" y="${by0}" width="${fmt(Math.max(2,wOnlyB),2)}" height="16" rx="3" fill="#B45309" fill-opacity="${mode===2&&!swapDiff?0.28:0.88}"/>
   <rect x="${fmt(bx0+wOnlyA+wInter+wOnlyB,2)}" y="${by0}" width="${fmt(Math.max(2,wOut),2)}" height="16" rx="3" fill="#94a7b5" fill-opacity="${mode===3?0.9:0.3}"/>
   ${txt(668,418,modeFormulas[mode-1],'#0f4963',10.6,'middle',800)}
   ${txt(bx0+wOnlyA/2,458,onlyA>0?`A\\B:${onlyA}`:'','#1D4ED8',9.5,'middle',800)}
   ${txt(bx0+wOnlyA+wInter/2,458,inter>0?`A∩B:${inter}`:'','#0f6e58',9.5,'middle',800)}
   ${txt(bx0+wOnlyA+wInter+wOnlyB/2,458,onlyB>0?`B\\A:${onlyB}`:'','#c25918',9.5,'middle',800)}
   ${txt(bx0+wOnlyA+wInter+wOnlyB+wOut/2,458,outside>0?`Ngoài:${outside}`:'','#546e7a',9.5,'middle',700)}
  </g>`,
  t>0?pill(524,98,390,22,vennPhases[pIdx-1],'#fff4eb','#f3c299','#b84a18',9.5):'',
  footer10(id,modeFormulas[mode-1],t)
 ].join('');
}
function clipHalfScreen(poly,a,b,c){
 const inside=P=>a*P[0]+b*P[1]-c<=1e-9;
 const out=[];
 for(let i=0;i<poly.length;i++){
  const P=poly[i],Q=poly[(i+1)%poly.length],u=a*P[0]+b*P[1]-c,v=a*Q[0]+b*Q[1]-c,I=inside(P),J=inside(Q);
  if(I&&J)out.push(Q);
  else if(I&&!J){const h=u/(u-v);out.push([P[0]+h*(Q[0]-P[0]),P[1]+h*(Q[1]-P[1])]);}
  else if(!I&&J){const h=u/(u-v);out.push([P[0]+h*(Q[0]-P[0]),P[1]+h*(Q[1]-P[1])],Q);}
 }
 return out.filter((P,i,all)=>i===0||Math.hypot(P[0]-all[i-1][0],P[1]-all[i-1][1])>1e-7);
}
function inequalitySVG(id,p,m,t,exp){
 const mode=Number(id.split('-C')[1]);
 // Full-viewport mathematical bounding box [-8.6, 8.6] x [-7.6, 5.6]
 const fullBbox=[[-8.6,-7.6],[8.6,-7.6],[8.6,5.6],[-8.6,5.6]];
 const fullPoly1=clipHalfScreen(fullBbox,p.a,p.b,p.c);
 const fullPoly2=mode>=2?clipHalfScreen(fullBbox,p.d,p.e,p.f):[];
 
 // For mode 3 (Linear programming): compute SGK 4-line quadrant I polygon if valid
 const quadBbox=[[0,0],[8.5,0],[8.5,5.5],[0,5.5]];
 const quadPoly=mode===3?clipHalfScreen(clipHalfScreen(quadBbox,p.a,p.b,p.c),p.d,p.e,p.f):[];
 const useQuad=mode===3&&quadPoly.length>=3;
 const activePoly=useQuad?quadPoly:(mode===1?fullPoly1:clipHalfScreen(fullPoly1,p.d,p.e,p.f));
 const poly=useQuad?quadPoly:m.result.vertices;

 const pts=activePoly.map(([x,y])=>toScreen(x,y).map(v=>fmt(v,2)).join(',')).join(' ');
 const ptsS1=fullPoly1.map(([x,y])=>toScreen(x,y).map(v=>fmt(v,2)).join(',')).join(' ');
 const ptsS2=fullPoly2.map(([x,y])=>toScreen(x,y).map(v=>fmt(v,2)).join(',')).join(' ');
 const strictIneq=!!exp?.strictIneq,showAux=exp?.showAux!==false;
 const testM=exp?.testM||[0,0],[mx,my]=testM,Mscr=toScreen(mx,my);
 const lhsM=p.a*mx+p.b*my,inM=strictIneq?(lhsM<p.c-1e-9):(lhsM<=p.c+1e-9);
 const lhsM2=p.d*mx+p.e*my,inM2=lhsM2<=p.f+1e-9;
 const l1=clipLine(p.a,p.b,p.c,8.5),l2=clipLine(p.d,p.e,p.f,8.5);

 // Calculate objective rows and best extreme vertex for activePoly in mode 3
 const rows3=activePoly.map(P=>({x:P[0],y:P[1],value:p.u*P[0]+p.v*P[1]}));
 const best3=rows3.length?rows3.reduce((a,b)=>a.value>=b.value?a:b):null;
 const best=mode===3?(best3||m.result.objective):m.result.objective;

 const ph=Math.min(1,Math.max(0,(t%6.0001)/6)),pIdx=phaseIndex(t),sweepVal=best?best.value*(0.15+0.85*ph):0;
 const isoLine=mode===3&&best?clipLine(p.u,p.v,t>0&&pIdx<3?sweepVal:best.value,8.5):[];
 const bestPt=best?toScreen(best.x,best.y):null;

 // Normal inward direction for d1: points into feasible halfplane a*x + b*y <= c
 const nLen1=Math.hypot(p.a,p.b)||1;
 const inX1=-p.a/nLen1,inY1=-p.b/nLen1;
 // Normal inward direction for d2: points into feasible halfplane d*x + e*y <= f
 const nLen2=Math.hypot(p.d,p.e)||1;
 const inX2=-p.d/nLen2,inY2=-p.e/nLen2;

 // Endpoints & midpoints for line labels and handles
 const p1ScrA=l1.length===2?toScreen(...l1[0]):null;
 const p1ScrB=l1.length===2?toScreen(...l1[1]):null;
 // For d1 (negative slope), place pill at the lower-right endpoint (larger screen y)
 const botP1=p1ScrA&&p1ScrB?(p1ScrA[1]>=p1ScrB[1]?p1ScrA:p1ScrB):null;
 const midP1=l1.length===2?toScreen((l1[0][0]*0.25+l1[1][0]*0.75),(l1[0][1]*0.25+l1[1][1]*0.75)):null;

 const p2ScrA=l2.length===2?toScreen(...l2[0]):null;
 const p2ScrB=l2.length===2?toScreen(...l2[1]):null;
 // For d2 (positive slope), place pill at top-right endpoint (smaller screen y)
 const topP2=p2ScrA&&p2ScrB?(p2ScrA[1]<=p2ScrB[1]?p2ScrA:p2ScrB):null;
 const midP2=l2.length===2?toScreen((l2[0][0]*0.75+l2[1][0]*0.25),(l2[0][1]*0.75+l2[1][1]*0.25)):null;

 // Compact line labels at outer endpoints (no giant pill)
 const lbl1X=botP1?Math.max(424,Math.min(910,botP1[0]+8)):750;
 const lbl1Y=botP1?Math.max(104,Math.min(474,botP1[1]-8)):400;
 const tagD1=l1.length===2?haloTxt(lbl1X,lbl1Y,'(d₁)','#1D4ED8',12,'start',800):'';

 const lbl2X=topP2?Math.max(424,Math.min(910,topP2[0]-8)):750;
 const lbl2Y=topP2?Math.max(104,Math.min(474,topP2[1]+16)):100;
 const tagD2=mode>=2&&l2.length===2?haloTxt(lbl2X,lbl2Y,'(d₂)','#B45309',12,'end',800):'';

 // Directional arrows on d1 (inward half-plane)
 const dirArrows1=l1.length===2?[0.35,0.65].map(frac=>{
  const amx=l1[0][0]*(1-frac)+l1[1][0]*frac;
  const amy=l1[0][1]*(1-frac)+l1[1][1]*frac;
  const s0=toScreen(amx,amy),s1=toScreen(amx+inX1*0.85,amy+inY1*0.85);
  return arrow(s0[0],s0[1],s1[0],s1[1],'#1D4ED8','',2.2);
 }).join(''):'';

 // Directional arrows on d2 (inward half-plane)
 const dirArrows2=mode>=2&&l2.length===2?[0.35,0.65].map(frac=>{
  const amx=l2[0][0]*(1-frac)+l2[1][0]*frac;
  const amy=l2[0][1]*(1-frac)+l2[1][1]*frac;
  const s0=toScreen(amx,amy),s1=toScreen(amx+inX2*0.85,amy+inY2*0.85);
  return arrow(s0[0],s0[1],s1[0],s1[1],'#B45309','',2.2);
 }).join(''):'';

 // Axis intercepts for Mode 1
 const interceptB1=Math.abs(p.b)>1e-4&&Math.abs(p.c/p.b)<=5.4?toScreen(0,p.c/p.b):null;
 const interceptA1=Math.abs(p.a)>1e-4&&Math.abs(p.c/p.a)<=8.0?toScreen(p.c/p.a,0):null;

 // Intersection point I = d1 ∩ d2 for Mode 2
 const det=p.a*p.e-p.b*p.d;
 const ptI=mode>=2&&Math.abs(det)>1e-4?[(p.c*p.e-p.b*p.f)/det,(p.a*p.f-p.c*p.d)/det]:null;
 const scrI=ptI&&Math.abs(ptI[0])<=8.2&&Math.abs(ptI[1])<=5.4?toScreen(ptI[0],ptI[1]):null;

 // Centroid of polygon to push vertex labels outward without overlapping edges
 const cxPoly=activePoly.length?activePoly.reduce((s,v)=>s+v[0],0)/activePoly.length:0;
 const cyPoly=activePoly.length?activePoly.reduce((s,v)=>s+v[1],0)/activePoly.length:0;

 // Gradient vector direction for Mode 3
 const uLen=Math.hypot(p.u,p.v)||1;
 const midIso=isoLine.length===2?[(isoLine[0][0]+isoLine[1][0])/2,(isoLine[0][1]+isoLine[1][1])/2]:null;
 const gradStart=midIso?toScreen(...midIso):null;
 const gradEnd=midIso?toScreen(midIso[0]+p.u/uLen*1.2,midIso[1]+p.v/uLen*1.2):null;

 const ineqPhases=mode===1?[
  `Pha 1: Dựng đường bờ (d₁): ${formatLinearExpr2D(p.a,p.b)} = ${fmt(p.c,1)}`,
  `Pha 2: Thử điểm M(${fmt(mx,1)}; ${fmt(my,1)}) → VT = ${fmt(lhsM,1)} vs c = ${fmt(p.c,1)}`,
  `Pha 3: Tô phủ nửa mặt phẳng nghiệm ${formatLinearInequality2D(p.a,p.b,strictIneq?'<':'<=',p.c)}`,
  `Pha 4: Đường bờ ${strictIneq?'nét đứt (không lấy biên)':'nét liền (có lấy biên)'}`
 ]:mode===2?[
  'Pha 1: Phủ màu nửa mặt phẳng nghiệm S₁ của (d₁)',
  'Pha 2: Phủ màu nửa mặt phẳng nghiệm S₂ của (d₂)',
  'Pha 3: Giữ lại miền giao chung S = S₁ ∩ S₂',
  activePoly.length>=3?'Pha 4: Khóa miền nghiệm chung của hệ BPT':'Pha 4: Hai nửa mặt phẳng rời nhau → S = ∅'
 ]:[
  'Pha 1: Xác định giao của 4 đường ràng buộc trên Oxy',
  `Pha 2: Sóng mức F(x,y) = ${formatLinearExpr2D(p.u,p.v)} trượt theo ∇F(${p.u};${p.v})`,
  best?`Pha 3: Chạm đỉnh cực trị (${fmt(best.x,1)}; ${fmt(best.y,1)}) → Max F = ${fmt(best.value,1)}`:'Pha 3: Quét tìm cực trị',
  'Pha 4: Bật bảng đối chiếu giá trị F tại các đỉnh'
 ];

 return [
  card10(mode===1?'BPT bậc nhất hai ẩn':mode===2?'Miền nghiệm hệ BPT':'Quy hoạch tuyến tính',id,[
   {t:`(d₁): ${formatLinearInequality2D(p.a,p.b,strictIneq?'<':'<=',p.c)}`,c:'#1D4ED8',w:800},
   mode>=2?{t:`(d₂): ${formatLinearInequality2D(p.d,p.e,'<=',p.f)}`,c:'#B45309',w:750}:{t:`Thử M(${fmt(mx,1)};${fmt(my,1)}): ${fmt(lhsM,1)} ${strictIneq?'<':'≤'} ${fmt(p.c,1)} (${inM?'Đúng':'Sai'})`,c:inM?'#15803D':'#B91C1C',w:750},
   mode===3&&best?{t:`Max F = ${fmt(best.value,2)} tại (${fmt(best.x,1)}; ${fmt(best.y,1)})`,c:'#b84a18',w:800}:{t:`Miền nghiệm: ${activePoly.length} đỉnh`,c:'#15803D',w:800}
  ],'Màn quét nửa mặt phẳng phủ kín khung lưới và thước sóng đường mức F(x,y) = k.','Đổi hệ số a, b, c hoặc kéo điểm thử M trên mặt phẳng.'),
  axes(),
  `<defs><clipPath id="ineqGridClip"><rect x="408" y="88" width="522" height="396" rx="10"/></clipPath></defs>`,
  `<g clip-path="url(#ineqGridClip)">`,
  mode===2&&showAux&&ptsS1?`<polygon points="${ptsS1}" fill="#1D4ED8" fill-opacity="0.07"/>`:'',
  mode===2&&showAux&&ptsS2?`<polygon points="${ptsS2}" fill="#B45309" fill-opacity="0.07"/>`:'',
  activePoly.length>=3?`<polygon points="${pts}" fill="#1793b5" fill-opacity="${fmt(.24+.06*Math.sin(t*2.4),3)}" stroke="none"/>`:'',
  // Boundaries
  l1.length===2?line(...toScreen(...l1[0]),...toScreen(...l1[1]),'#1D4ED8',3.2,strictIneq?'8 5':''):'',
  mode>=2&&l2.length===2?line(...toScreen(...l2[0]),...toScreen(...l2[1]),'#B45309',2.8,'7 4'):'',
  // Mode 3: Lines 3 & 4 (x >= 0, y >= 0)
  mode===3?`<g>
   ${line(...toScreen(0,-5.4),...toScreen(0,5.4),'#7c3aed',2.6)}
   ${line(...toScreen(-8.5,0),...toScreen(8.5,0),'#059669',2.6)}
  </g>`:'',
  mode===3&&isoLine.length===2?`<g>${line(...toScreen(...isoLine[0]),...toScreen(...isoLine[1]),'#15803D',3.2,'6 3')}${gradStart&&gradEnd?arrow(gradStart[0],gradStart[1],gradEnd[0],gradEnd[1],'#15803D','',2.6):''}</g>`:'',
  `</g>`,
  activePoly.length<3?pill(580,242,190,28,'Miền nghiệm S = ∅ (rỗng)','#fff1e6','#f3c299','#c25918',11.5):'',

  // MODE 1 SPECIFIC VISUALS:
  mode===1?`<g>
   ${tagD1}
   ${dirArrows1}
   ${midP1?dot(midP1[0],midP1[1],6,'#1D4ED8','#fff','P1'):''}
   ${interceptA1?dot(interceptA1[0],interceptA1[1],4.5,'#1D4ED8','#fff')+haloTxt(interceptA1[0],interceptA1[1]+14,'A','#1D4ED8',10.5,'middle',700):''}
   ${interceptB1?dot(interceptB1[0],interceptB1[1],4.5,'#1D4ED8','#fff')+haloTxt(interceptB1[0]+12,interceptB1[1]+4,'B','#1D4ED8',10.5,'start',700):''}
   <circle cx="${fmt(Mscr[0],2)}" cy="${fmt(Mscr[1],2)}" r="${fmt(10*(1+.06*Math.sin(t*3)),2)}" fill="${inM?'#15803D':'#B91C1C'}" fill-opacity="0.18"/>
   ${dot(Mscr[0],Mscr[1],7,inM?'#15803D':'#B91C1C','#fff','M')}
   ${haloTxt(Mscr[0]+(mx>=0?11:-11),Mscr[1]-8,'M',inM?'#0f6953':'#b42318',11,mx>=0?'start':'end',800)}
  </g>`:'',

  // MODE 2 SPECIFIC VISUALS:
  mode===2?`<g>
   ${tagD1}
   ${tagD2}
   ${dirArrows1}
   ${dirArrows2}
   ${midP1?dot(midP1[0],midP1[1],6,'#1D4ED8','#fff','P1'):''}
   ${midP2?dot(midP2[0],midP2[1],6,'#B45309','#fff','P2'):''}
   ${scrI?`<g>${dot(scrI[0],scrI[1],5.5,'#0e435c','#fff')}${haloTxt(scrI[0]+9,scrI[1]-6,'I','#0e435c',11,'start',800)}</g>`:''}
   <circle cx="${fmt(Mscr[0],2)}" cy="${fmt(Mscr[1],2)}" r="${fmt(10*(1+.06*Math.sin(t*3)),2)}" fill="${(inM&&inM2)?'#15803D':'#B91C1C'}" fill-opacity="0.18"/>
   ${dot(Mscr[0],Mscr[1],7,(inM&&inM2)?'#15803D':'#B91C1C','#fff','M')}
   ${haloTxt(Mscr[0]+(mx>=0?11:-11),Mscr[1]-8,'M',(inM&&inM2)?'#0f6953':'#b42318',11,mx>=0?'start':'end',800)}
  </g>`:'',

  // MODE 3 SPECIFIC VISUALS:
  mode===3?`<g>
   ${tagD1}
   ${tagD2}
   ${dirArrows1}
   ${dirArrows2}
   ${midP1?dot(midP1[0],midP1[1],6,'#1D4ED8','#fff','P1'):''}
   ${midP2?dot(midP2[0],midP2[1],6,'#B45309','#fff','P2'):''}
   ${haloTxt(toScreen(0,4.8)[0]+9,toScreen(0,4.8)[1]+6,'(d₃)','#7c3aed',11,'start',800)}
   ${haloTxt(toScreen(7.6,0)[0]-6,toScreen(7.6,0)[1]-10,'(d₄)','#059669',11,'end',800)}
   ${gradEnd?`<g>${dot(gradEnd[0],gradEnd[1],6,'#15803D','#fff','U')}${haloTxt(gradEnd[0]+8,gradEnd[1]-6,'∇F','#15803D',11,'start',800)}</g>`:''}
  </g>`:'',

  // Interior intersection vertices V_i
  mode===3&&showAux?activePoly.map((v,i)=>{
   const [sx,sy]=toScreen(v[0],v[1]),isBest=best&&Math.abs(v[0]-best.x)<1e-4&&Math.abs(v[1]-best.y)<1e-4;
   const dx=v[0]-cxPoly,dy=v[1]-cyPoly,dl=Math.hypot(dx,dy)||1;
   const lx=sx+(dx/dl)*16,ly=sy-(dy/dl)*14+4;
   return `<g>${dot(sx,sy,isBest?6.5:4.8,isBest?'#15803D':'#1D4ED8')}${haloTxt(lx,ly,`V_${i+1}`,isBest?'#0f6953':'#0f4c68',11,'middle',800)}</g>`;
  }).join(''):'',
  best&&mode===3?`<circle cx="${fmt(bestPt[0],2)}" cy="${fmt(bestPt[1],2)}" r="${fmt(11*(1+.08*Math.sin(t*3)),2)}" fill="#15803D" fill-opacity="0.22"/>`:'',
  t>0?pill(408,84,352,22,ineqPhases[pIdx-1],'#fff4eb','#f3c299','#b84a18',9.5):'',
  footer10(id,mode===3&&best?`Max F = ${fmt(best.value,2)} tại đỉnh (${fmt(best.x,2)}; ${fmt(best.y,2)})`:`Bờ ax + by = c chia Oxy thành 2 nửa mặt phẳng`,t)
 ].join('');
}
function triangleSVG(id,p,m,t,exp){
 const mode=Number(id.split('-C')[1]),[ox,oy]=GRADE10_VIEW.triOrigin,s=GRADE10_VIEW.triScale,S=([x,y])=>[ox+x*s,oy-y*s];
 const showAux=exp?.showAux!==false,lockSides=!!exp?.lockSides,pIdx=phaseIndex(t);
 const ph=t>0?Math.min(1,Math.max(0,(t%6.0001)/6)):1;
 const b0=m.result.b,c0=m.result.c,angA0=m.result.angA;
 let curCx=p.cx,curCy=p.cy,phaseNote='';
 const cc0=[c0/2,(p.cx*(p.cx-c0)+p.cy*p.cy)/(2*p.cy)];
 const R0=m.result.R,thetaC0=Math.atan2(p.cy-cc0[1],p.cx-cc0[0]);
 if(mode===1&&t>0){
  const a60=Math.PI/3,a90=Math.PI/2,a120=2*Math.PI/3;
  let ang=angA0;
  if(ph<=0.20){const u=ph/0.20;ang=angA0+(a60-angA0)*u;phaseNote='Pha 1: Khóa bản lề b=AC, c=AB tại góc nhọn A';}
  else if(ph<=0.45){const u=(ph-0.20)/0.25;ang=a60+(a90-a60)*u;phaseNote='Pha 2: Mở góc A 60° → 90°, cạnh đối a=BC giãn dài';}
  else if(ph<=0.75){
   if(ph<=0.58){ang=a90;phaseNote='Pha 3: Khớp vuông A = 90° ⇒ Pythagore: a² = b² + c²';}
   else{const u=(ph-0.58)/0.17;ang=a90+(a120-a90)*u;phaseNote='Pha 3: Mở tiếp bản lề A sang góc tù 120° (a² > b²+c²)';}
  }else{const u=(ph-0.75)/0.25;ang=a120+(angA0-a120)*Math.max(0,(u-0.5)*2);phaseNote='Pha 4: Cân bằng thanh bình phương a² = b²+c²−2bc·cosA';}
  curCx=b0*Math.cos(ang);curCy=Math.max(0.8,b0*Math.sin(ang));
 }else if(mode===2&&t>0){
  if(t<5.95&&Number.isFinite(R0)&&R0<25){
   const slideAng=thetaC0+0.38*Math.sin(ph*Math.PI*2);
   const tryCx=cc0[0]+R0*Math.cos(slideAng),tryCy=cc0[1]+R0*Math.sin(slideAng);
   if(tryCy>1.1){curCx=tryCx;curCy=tryCy;}
  }
  phaseNote=pIdx===1?'Pha 1: Dựng tam giác ABC và 3 cặp cạnh – góc đối':pIdx===2?'Pha 2: Quay compa dựng đường tròn ngoại tiếp (O; R)':pIdx===3?'Pha 3: Trượt đỉnh C trên cung tròn giữ nguyên c/sinC = 2R':'Pha 4: Đồng bộ 3 cột tỉ số a/sinA = b/sinB = c/sinC = 2R';
 }else if(mode===3&&t>0){
  phaseNote=pIdx===1?'Pha 1: Hạ quả dọi đường cao h_c = CH vuông góc đáy AB':pIdx===2?'Pha 2: Quét tam giác vuông AHC ⇒ h_c = b·sinA':pIdx===3?'Pha 3: Gấp ghép tam giác thành hình chữ nhật c × ½h_c':'Pha 4: Tổng hợp diện tích S = ½·c·h_c = ½·b·c·sinA';
 }
 const r=((mode===1||mode===2)&&t>0&&t<5.95)?(() => {
  const A=[0,0],B=[c0,0],C=[curCx,curCy],a=Math.hypot(curCx-c0,curCy),b=Math.hypot(curCx,curCy),c=c0;
  const cosA=(b*b+c*c-a*a)/(2*b*c),cosB=(a*a+c*c-b*b)/(2*a*c),cosC=(a*a+b*b-c*c)/(2*a*b);
  const angA=Math.acos(Math.max(-1,Math.min(1,cosA))),angB=Math.acos(Math.max(-1,Math.min(1,cosB))),angC=Math.acos(Math.max(-1,Math.min(1,cosC))),area=c*curCy/2;
  return {A,B,C,a,b,c,a2:a*a,b2:b*b,c2:c*c,twoBcCosA:2*b*c*cosA,cosA,cosB,cosC,angA,angB,angC,area,R:a*b*c/(4*area)};
 })():m.result;
 const cc=[c0/2,(curCx*(curCx-c0)+curCy*curCy)/(2*curCy)];
 const A=S(r.A),B=S(r.B),C=S(r.C),O=S(cc),H=S([r.C[0],0]),pulse=1+.025*Math.sin(t*2.2);
 const G=[(A[0]+B[0]+C[0])/3,(A[1]+B[1]+C[1])/3];
 // Outward normal placement for side pills so they NEVER overlap interior altitudes or circumcenter!
 const outPos=(P1,P2,dist=24)=>{
  const mx=(P1[0]+P2[0])/2,my=(P1[1]+P2[1])/2;
  let nx=-(P2[1]-P1[1]),ny=P2[0]-P1[0];
  const nl=Math.hypot(nx,ny)||1;nx/=nl;ny/=nl;
  if(nx*(mx-G[0])+ny*(my-G[1])<0){nx=-nx;ny=-ny;}
  return [Math.max(438,Math.min(896,mx+nx*dist)),Math.max(106,Math.min(404,my+ny*dist))];
 };
 const posBC=outPos(B,C,28),posAC=outPos(A,C,28),posAB=[(A[0]+B[0])/2,A[1]+26];
 const degA=r.angA*180/Math.PI,degB=r.angB*180/Math.PI,degC=r.angC*180/Math.PI;
 const isRightA=Math.abs(degA-90)<1.5,isObtuseA=degA>90.8;
 const semi=(r.a+r.b+r.c)/2,rIn=r.area/semi;
 const rotAng=t*1.4,Rscreen=r.R*s,Pcirc=[O[0]+Rscreen*Math.cos(rotAng),O[1]-Rscreen*Math.sin(rotAng)];
 const bRadScreen=r.b*s,arcStart=[A[0]+bRadScreen*Math.cos(0.28),A[1]-bRadScreen*Math.sin(0.28)],arcEnd=[A[0]+bRadScreen*Math.cos(2.45),A[1]-bRadScreen*Math.sin(2.45)];
 const a2=r.a*r.a,b2=r.b*r.b,c2=r.c*r.c,b2c2=b2+c2,twoBcCos=2*r.b*r.c*r.cosA,maxSq=Math.max(1,a2,b2c2);
 const barScale=150/maxSq,wB2=Math.max(6,b2*barScale),wC2=Math.max(6,c2*barScale),wA2=Math.max(6,a2*barScale);
 const angleStateText=isRightA?'A = 90° ⇒ Pythagore: a² = b² + c²':isObtuseA?`Góc tù A = ${fmt(degA,1)}° ⇒ a² > b² + c²`:`Góc nhọn A = ${fmt(degA,1)}° ⇒ a² < b² + c²`;
 const sinRatio=2*r.R,midY=(C[1]+A[1])/2;
 // Mode 3 animated altitude drop & half-height rectangle folding over t = 0..6
 const altDropFrac=(mode===3&&t>0&&t<5.95)?Math.min(1,Math.max(0.12,ph/0.35)):1;
 const Hdrop=[C[0],C[1]+(H[1]-C[1])*altDropFrac];
 const rectFoldFrac=(mode===3&&t>0&&t<5.95)?Math.min(1,Math.max(0,(ph-0.42)/0.38)):1;
 const Mac=[(A[0]+C[0])/2,(A[1]+C[1])/2],Mbc=[(B[0]+C[0])/2,(B[1]+C[1])/2];
 const flapL=[C[0]+(A[0]-C[0])*rectFoldFrac,C[1]+(A[1]-C[1])*rectFoldFrac];
 const flapR=[C[0]+(B[0]-C[0])*rectFoldFrac,C[1]+(B[1]-C[1])*rectFoldFrac];
 // Dedicated bottom dashboard (y=414..482) so geometry stage (y=96..406) is 100% open and uncluttered!
 const bottomDash=mode===1?`<g>
  <rect x="412" y="414" width="514" height="68" rx="10" fill="#f6fafd" stroke="#cde1ec"/>
  ${txt(424,432,angleStateText,isRightA?'#0f6953':isObtuseA?'#c25918':'#1D4ED8',10.2,'start',800)}
  ${txt(424,451,`b² + c² = ${fmt(b2c2,1)}`,'#1D4ED8',10,'start',800)}
  <rect x="532" y="441" width="${fmt(wB2,1)}" height="11" rx="3" fill="#1D4ED8"/><rect x="${fmt(532+wB2+2,1)}" y="441" width="${fmt(wC2,1)}" height="11" rx="3" fill="#219ebc"/>
  ${txt(424,471,`a² = ${fmt(a2,1)}`,'#B45309',10,'start',800)}
  <rect x="532" y="461" width="${fmt(wA2,1)}" height="11" rx="3" fill="#B45309"/>
  ${txt(712,452,`−2bc·cosA = ${fmt(-twoBcCos,2)}`,'#15803D',10.2,'start',800)}
  ${txt(712,470,lockSides?'🔒 Đang khóa b, c (quay góc A)':'Kéo đỉnh C hoặc B để thử','#47677b',9.5,'start',700)}
 </g>`:mode===2?`<g>
  <rect x="412" y="414" width="514" height="68" rx="10" fill="#f6fafd" stroke="#cde1ec"/>
  ${txt(424,433,`Định lí Sin: Mọi tỉ số cạnh / sin góc đối đều bằng đường kính 2R = ${fmt(sinRatio,2)}`,'#0f4963',10.2,'start',800)}
  ${pill(424,444,116,28,`a/sinA = ${fmt(sinRatio,2)}`,'#eef7fb','#1D4ED8','#1D4ED8',10)}
  ${pill(548,444,116,28,`b/sinB = ${fmt(sinRatio,2)}`,'#eef7fb','#1D4ED8','#1D4ED8',10)}
  ${pill(672,444,116,28,`c/sinC = ${fmt(sinRatio,2)}`,'#e5f7f1','#15803D','#0f6953',10)}
  ${pill(796,444,118,28,`2R = ${fmt(sinRatio,2)}`,'#fff1e6','#B45309','#c25918',10.2)}
 </g>`:`<g>
  <rect x="412" y="414" width="514" height="68" rx="10" fill="#f6fafd" stroke="#cde1ec"/>
  ${txt(424,435,`Đường cao h_c = b·sinA = ${fmt(r.C[1],2)}  |  Đáy c = AB = ${fmt(r.c,2)}`,'#1D4ED8',10.2,'start',800)}
  ${txt(424,456,`Diện tích S = ½·c·h_c = ½·b·c·sinA = ${fmt(r.area,2)}  (Bán kính nội tiếp r = S/p = ${fmt(rIn,2)})`,'#15803D',10.2,'start',800)}
  ${pill(782,426,132,26,`S = ${fmt(r.area,2)}`,'#15803D','#15803D','#fff',11.5)}
 </g>`;
 return [
  card10(mode===1?'Định lí Côsin':mode===2?'Định lí Sin & Bán kính R':'Diện tích tam giác',id,[
   {t:`a = ${fmt(r.a)}, b = ${fmt(r.b)}, c = ${fmt(r.c)}`,c:'#16465f',w:800},
   mode===1?frac10(36,214,'cos A = ','b² + c² − a²','2bc',` = ${fmt(r.cosA,2)}`,'#124e68',12):
   mode===2?frac10(36,214,'ĐL Sin: ','a','sin A',` = 2R = ${fmt(2*r.R,2)}`,'#124e68',11.8):
   frac10(36,214,'S = ','1','2',`·c·h = ${fmt(r.area,2)}`,'#124e68',12),
   mode===1?{t:`a² = b²+c²−2bc·cosA = ${fmt(a2,2)}`,c:'#15803D',w:800}:
   mode===2?{t:`R = ${fmt(r.R,2)}  |  2R = ${fmt(2*r.R,2)}`,c:'#B45309',w:800}:
   {t:`p = ${fmt(semi,2)}  |  r = S/p = ${fmt(rIn,2)}`,c:'#15803D',w:800}
  ],'Cơ cấu bản lề góc A, đường tròn ngoại tiếp (O; R) và gấp ghép diện tích.','Kéo đỉnh C hoặc B trên hình để quan sát cơ cấu biến đổi động.'),
  stageBox(),
  `<defs><clipPath id="triStageClip"><rect x="404" y="84" width="530" height="326" rx="10"/></clipPath></defs>`,
  `<g clip-path="url(#triStageClip)">`,
  mode===1&&showAux&&bRadScreen<260?`<path d="M ${fmt(arcStart[0],2)} ${fmt(arcStart[1],2)} A ${fmt(bRadScreen,2)} ${fmt(bRadScreen,2)} 0 0 0 ${fmt(arcEnd[0],2)} ${fmt(arcEnd[1],2)}" fill="none" stroke="#9fc5d8" stroke-width="1.6" stroke-dasharray="5 4"/>`:'',
  mode===1&&showAux?`<g>${line(A[0]-70,A[1],B[0]+40,B[1],'#bed6e3',1.3,'4 4')}${line(C[0],C[1],H[0],H[1],'#15803D',1.8,'4 3')}${rightMark(H[0],H[1],C[0],C[1],B[0],B[1],8,'#15803D')}</g>`:'',
  // Mode 2: Clean Circumcircle (O; R) WITHOUT overlapping altitude line!
  mode===2&&Number.isFinite(r.R)&&Rscreen<220?`<g>
   <circle cx="${fmt(O[0],2)}" cy="${fmt(O[1],2)}" r="${fmt(Rscreen*pulse,2)}" fill="#B45309" fill-opacity="0.04" stroke="#B45309" stroke-width="2.2" stroke-dasharray="6 4"/>
   ${showAux?`${line(O[0],O[1],A[0],A[1],'#B45309',1.6,'4 3')}${line(O[0],O[1],B[0],B[1],'#B45309',1.6,'4 3')}${line(O[0],O[1],C[0],C[1],'#B45309',2.2)}${dot(O[0],O[1],5,'#B45309')}${haloTxt(O[0]+10,O[1]+14,`O (R=${fmt(r.R,2)})`,'#c25918',10.8,'start',800)}`:''}
   ${t>0?dot(Pcirc[0],Pcirc[1],5.5,'#B45309'):''}
  </g>`:'',
  // Mode 3: Animated Half-Height Rectangle Folding overlay & folding flaps
  mode===3&&showAux&&rectFoldFrac>0.02?`<g>
   <rect x="${fmt(A[0],2)}" y="${fmt(A[1]-(A[1]-midY)*rectFoldFrac,2)}" width="${fmt(Math.max(4,B[0]-A[0]),2)}" height="${fmt(Math.max(2,(A[1]-midY)*rectFoldFrac),2)}" fill="#15803D" fill-opacity="${fmt(0.10+0.14*rectFoldFrac,2)}" stroke="#15803D" stroke-width="1.6" stroke-dasharray="5 3"/>
   ${line(Mac[0],Mac[1],Mbc[0],Mbc[1],'#0f6953',1.8,'4 3')}
   ${t>0&&t<5.95?`<polygon points="${fmt(Mac[0],2)},${fmt(Mac[1],2)} ${fmt(H[0],2)},${fmt(midY,2)} ${fmt(flapL[0],2)},${fmt(flapL[1],2)}" fill="#B45309" fill-opacity="0.18" stroke="#B45309" stroke-width="1.5" stroke-dasharray="3 2"/><polygon points="${fmt(Mbc[0],2)},${fmt(Mbc[1],2)} ${fmt(H[0],2)},${fmt(midY,2)} ${fmt(flapR[0],2)},${fmt(flapR[1],2)}" fill="#B45309" fill-opacity="0.18" stroke="#B45309" stroke-width="1.5" stroke-dasharray="3 2"/>`:''}
  </g>`:'',
  `<polygon points="${A.map(v=>fmt(v,2)).join(',')} ${B.map(v=>fmt(v,2)).join(',')} ${C.map(v=>fmt(v,2)).join(',')}" fill="#1793b5" fill-opacity="${mode===3?fmt(.22+.08*Math.sin(t*2.4),2):'0.15'}" stroke="#1D4ED8" stroke-width="2.8"/>`,
  mode===3&&t>0&&t<5.95&&ph>0.22&&ph<=0.55?`<polygon points="${A.map(v=>fmt(v,2)).join(',')} ${H.map(v=>fmt(v,2)).join(',')} ${C.map(v=>fmt(v,2)).join(',')}" fill="#15803D" fill-opacity="0.22"/>`:'',
  mode===1?line(B[0],B[1],C[0],C[1],'#B45309',3.8):'',
  mode===1&&isRightA?rightMark(A[0],A[1],B[0],B[1],C[0],C[1],12,'#15803D'):angleArc(A[0],A[1],B[0],B[1],C[0],C[1],24,`${fmt(degA,0)}°`,mode===1?'#B45309':'#1D4ED8'),
  angleArc(B[0],B[1],C[0],C[1],A[0],A[1],20,`${fmt(degB,0)}°`,'#1D4ED8'),
  angleArc(C[0],C[1],A[0],A[1],B[0],B[1],20,`${fmt(degC,0)}°`,mode===1?'#1D4ED8':'#B45309'),
  // Mode 3: Animated Altitude h_c = CH dropping from C to H with clean label outside
  mode===3?`<g>${(r.C[0]<0||r.C[0]>r.c)?line(Math.min(A[0],H[0])-18,A[1],Math.max(B[0],H[0])+18,B[1],'#90b4c8',1.6,'5 4'):''}${line(C[0],C[1],Hdrop[0],Hdrop[1],'#15803D',2.8,'5 3')}${altDropFrac>=0.95?rightMark(H[0],H[1],C[0],C[1],B[0],B[1],10,'#15803D'):''}${dot(Hdrop[0],Hdrop[1],4.8,'#15803D')}${haloTxt(H[0],H[1]+16,'H','#15803D',11,'middle',800)}${haloTxt(H[0]+8,(C[1]+Hdrop[1])/2,`h = ${fmt(r.C[1]*altDropFrac,2)}`,'#0f6953',10.8,'start',800)}</g>`:'',
  `</g>`,
  // Outward Side Pills (never cross interior lines!)
  pill(posBC[0]-37,posBC[1]-10,74,20,`a = ${fmt(r.a,2)}`,mode===1?'#fff1e6':'#eef7fb',mode===1?'#f2c199':'#b8d8e8',mode===1?'#c25918':'#1D4ED8',10.5),
  pill(posAC[0]-37,posAC[1]-10,74,20,`b = ${fmt(r.b,2)}`,'#eef7fb','#b8d8e8','#1D4ED8',10.5),
  pill(posAB[0]-37,posAB[1]-10,74,20,`c = ${fmt(r.c,2)}`,'#eef7fb','#b8d8e8','#1D4ED8',10.5),
  dot(A[0],A[1],5.5,'#1D4ED8'),dot(B[0],B[1],6.6,'#1D4ED8','#fff','B'),dot(C[0],C[1],7*pulse,'#B45309','#fff','C'),
  haloTxt(A[0]-12,A[1]+14,'A','#103c54',13,'end',800),
  haloTxt(B[0]+12,B[1]+14,'B (kéo)','#103c54',11.8,'start',800),
  haloTxt(C[0],Math.max(102,C[1]-14),lockSides?'C (quay góc A)':'C (kéo)','#c25918',11.8,'middle',800),
  bottomDash,
  t>0&&phaseNote?pill(408,84,320,22,phaseNote,'#fff4eb','#f3c299','#b84a18',9.4):'',
  footer10(id,mode===1?`a² = b² + c² − 2bc·cos A = ${fmt(r.b*r.b,2)} + ${fmt(r.c*r.c,2)} − (${fmt(2*r.b*r.c*r.cosA,2)}) = ${fmt(r.a*r.a,2)}`:mode===2?`a/sin A = b/sin B = c/sin C = 2R = ${fmt(2*r.R,2)}`:`S = ½·c·h = ½·bc·sin A = ${fmt(r.area,2)}`,t)
 ].join('');
}
function vectorSVG(id,p,m,t,exp){
 const fam=grade10Family(id),mode=Number(id.split('-C')[1]),r=m.result,O=toScreen(0,0),ph=t>0?Math.min(1,Math.max(0,(t%6.0001)/6)):0,pIdx=phaseIndex(t),showAux=exp?.showAux!==false;
 if(fam==='10-05'){
  const translateAB=!!exp?.translateAB;
  const shiftDx=translateAB?2.0:0,shiftDy=translateAB?-2.5:0;
  const mid=[(p.ax+p.bx)/2,(p.ay+p.by)/2],cent=[(p.ax+p.bx)/3,(p.ay+p.by)/3],lenU=r.length,lenV=Math.hypot(p.vx,p.vy);
  const A=toScreen(p.ax,p.ay),B=toScreen(p.bx,p.by),M=toScreen(...mid),V=toScreen(p.vx,p.vy);
  const As=toScreen(p.ax+shiftDx,p.ay+shiftDy),Bs=toScreen(p.bx+shiftDx,p.by+shiftDy);
  const cosVal=lenU*lenV>1e-8?r.dot/(lenU*lenV):0,angDeg=Math.acos(Math.max(-1,Math.min(1,cosVal)))*180/Math.PI;
  const Pmov=toScreen(p.ax+(p.bx-p.ax)*ph,p.ay+(p.by-p.ay)*ph);
  const Uo=toScreen(r.u[0],r.u[1]);
  const uxvx=r.u[0]*p.vx,uyvy=r.u[1]*p.vy;
  // Animated step-by-step construction of Δx, Δy, and AB over t = 0..6
  const isAnim=(t>0&&t<5.95);
  const dxFrac=isAnim?Math.min(1,Math.max(0.08,(ph-0.12)/0.36)):1;
  const dyFrac=isAnim?Math.min(1,Math.max(0,(ph-0.42)/0.34)):1;
  const vecFrac=isAnim?Math.min(1,Math.max(0.15,(ph-0.18)/0.58)):1;
  const Kx=A[0]+(B[0]-A[0])*dxFrac,Ky=A[1]+(B[1]-A[1])*dyFrac;
  const Bcur=[A[0]+(B[0]-A[0])*vecFrac,A[1]+(B[1]-A[1])*vecFrac];
  const UoCur=[O[0]+(Uo[0]-O[0])*vecFrac,O[1]+(Uo[1]-O[1])*vecFrac];
  const Vcur=[O[0]+(V[0]-O[0])*vecFrac,O[1]+(V[1]-O[1])*vecFrac];
  // Screen direction unit vector from A to B so labels sit cleanly outside the segment and right triangle
  const abDx=B[0]-A[0],abDy=B[1]-A[1],abLen=Math.hypot(abDx,abDy)||1,abUx=abDx/abLen,abUy=abDy/abLen;
  const abSide=(r.u[0]*r.u[1]>=0)?1:-1;
  const lblAx=A[0]-abUx*24,lblAy=A[1]-abUy*22+(abUy>0?-4:8);
  const lblBx=B[0]+abUx*24,lblBy=B[1]+abUy*22+(abUy<0?-6:10);
  const phaseNotes=mode===1?[
   `Pha 1: Đặt điểm đầu A(${fmt(p.ax,1)};${fmt(p.ay,1)}) và điểm cuối B(${fmt(p.bx,1)};${fmt(p.by,1)})`,
   `Pha 2: Dựng độ dời hoành độ Δx = x_B − x_A = ${fmt(r.u[0],1)}`,
   `Pha 3: Dựng độ dời tung độ Δy = y_B − y_A = ${fmt(r.u[1],1)}`,
   `Pha 4: Tổng hợp vectơ AB = (${fmt(r.u[0],1)};${fmt(r.u[1],1)}), |AB| = ${fmt(lenU,2)}`
  ]:mode===2?[
   `Pha 1: Dựng thanh ngang |Δx| = ${fmt(Math.abs(r.u[0]),1)}`,
   `Pha 2: Dựng thanh dọc |Δy| = ${fmt(Math.abs(r.u[1]),1)}`,
   `Pha 3: Khép tam giác vuông Pythagore & chốt trung điểm M`,
   `Pha 4: Cạnh huyền |AB| = √(Δx² + Δy²) = ${fmt(lenU,2)}`
  ]:[
   `Pha 1: Thanh tích hoành độ uₓ·vₓ = ${fmt(uxvx,1)}`,
   `Pha 2: Thanh tích tung độ uᵧ·vᵧ = ${fmt(uyvy,1)}`,
   `Pha 3: Ghép tổng đại số u·v = ${fmt(uxvx,1)} + (${fmt(uyvy,1)}) = ${fmt(r.dot,1)}`,
   `Pha 4: Góc θ = ${fmt(angDeg,1)}° (${r.dot>1e-6?'Góc nhọn':r.dot<-1e-6?'Góc tù':'Vuông góc 90°'})`
  ];
  return [
   card10(mode===1?'Tọa độ vectơ & Độ dài':mode===2?'Độ dài vectơ & Trung điểm':'Tích vô hướng tọa độ',id,[
    {t:`AB = (${fmt(r.u[0],1)}; ${fmt(r.u[1],1)}), |AB| = ${fmt(lenU,2)}`,c:'#1D4ED8',w:800},
    mode===2?{t:`M(${fmt(mid[0],2)}; ${fmt(mid[1],2)}) | G(${fmt(cent[0],2)}; ${fmt(cent[1],2)})`,c:'#15803D',w:800}:
    mode===3?frac10(36,214,'cos(AB,v) = ','u·v','|AB|·|v|',` = ${fmt(cosVal,2)}`,'#B45309',11.8):
    {t:`|AB| = √(Δx² + Δy²) = ${fmt(lenU,2)}`,c:'#15803D',w:800}
   ],'Khung tam giác độ dời (Δx, Δy) và tọa độ vectơ trên hệ trục Oxy.','Kéo đầu mút A, B trên mặt phẳng để cập nhật vectơ AB.'),
   axes(),
   mode<=2&&showAux?`${line(A[0],A[1],A[0],O[1],'#90b4c8',1.1,'3 3')}${line(A[0],A[1],O[0],A[1],'#90b4c8',1.1,'3 3')}${line(B[0],B[1],B[0],O[1],'#90b4c8',1.1,'3 3')}${line(B[0],B[1],O[0],B[1],'#90b4c8',1.1,'3 3')}`:'',
   (mode===1||mode===2)&&showAux?`<g>
    ${dyFrac>0.9?`<polygon points="${A[0]},${A[1]} ${B[0]},${A[1]} ${B[0]},${B[1]}" fill="#15803D" fill-opacity="0.11"/>${rightMark(B[0],A[1],A[0],A[1],B[0],B[1],9,'#15803D')}`:''}
    ${line(A[0],A[1],Kx,A[1],'#15803D',2.4,'4 3')}
    ${dyFrac>0.02?line(B[0],A[1],B[0],Ky,'#15803D',2.4,'4 3'):''}
    ${haloTxt((A[0]+Kx)/2,A[1]+(B[1]>A[1]?-10:18),`Δx = ${fmt(r.u[0]*dxFrac,1)}`,'#0f6953',10.2,'middle',800)}
    ${dyFrac>0.1?haloTxt(B[0]+(B[0]>=A[0]?12:-12),(A[1]+Ky)/2+4,`Δy = ${fmt(r.u[1]*dyFrac,1)}`,'#0f6953',10.2,B[0]>=A[0]?'start':'end',800):''}
   </g>`:'',
   // Mode 1: Optional translated copy A'B' in lower-right open area so it NEVER collides with B!
   mode===1&&translateAB?`<g><polygon points="${As[0]},${As[1]} ${Bs[0]},${As[1]} ${Bs[0]},${Bs[1]}" fill="#15803D" fill-opacity="0.14" stroke="#15803D" stroke-width="1.6" stroke-dasharray="3 2"/>${arrow(As[0],As[1],Bs[0],Bs[1],'#15803D',`A'B'=(${fmt(r.u[0],1)};${fmt(r.u[1],1)})`,2.6,-abSide,0.5,18)}${line(A[0],A[1],As[0],As[1],'#15803D',1.3,'3 3')}${line(B[0],B[1],Bs[0],Bs[1],'#15803D',1.3,'3 3')}</g>`:'',
   arrow(A[0],A[1],Bcur[0],Bcur[1],'#1D4ED8',mode===2?`|AB| = ${fmt(lenU*vecFrac,2)}`:`AB(${fmt(r.u[0],1)};${fmt(r.u[1],1)})`,3.2,abSide,mode===2?0.34:0.46,22),
   mode===3?`<g>${arrow(O[0],O[1],UoCur[0],UoCur[1],'#1D4ED8',`u(${fmt(r.u[0],1)};${fmt(r.u[1],1)})`,2.6,1,0.58,18)}${arrow(O[0],O[1],Vcur[0],Vcur[1],'#B45309',`v(${fmt(p.vx,1)};${fmt(p.vy,1)})`,2.8,-1,0.58,18)}${dot(V[0],V[1],6.4,'#B45309','#fff','V')}${angleArc(O[0],O[1],Uo[0],Uo[1],V[0],V[1],28,`${fmt(angDeg,0)}°`,'#15803D')}
    <rect x="420" y="432" width="500" height="36" rx="8" fill="#f7fbfd" stroke="#cde1ec"/>
    <rect x="434" y="440" width="${fmt(Math.min(180,Math.max(8,Math.abs(uxvx)*12*dxFrac)),1)}" height="8" rx="4" fill="${uxvx>=0?'#1D4ED8':'#B91C1C'}"/>
    <rect x="434" y="454" width="${fmt(Math.min(180,Math.max(8,Math.abs(uyvy)*12*dyFrac)),1)}" height="8" rx="4" fill="${uyvy>=0?'#15803D':'#B45309'}"/>
    ${txt(630,455,`uₓvₓ (${fmt(uxvx,1)}) + uᵧvᵧ (${fmt(uyvy,1)}) = ${fmt(r.dot,2)}`,'#0f4963',10.6,'start',800)}
   </g>`:'',
   t>0?`<g>${dot(Pmov[0],Pmov[1],5.5,'#15803D')}</g>`:'',
   dot(A[0],A[1],6.4,'#1D4ED8','#fff','A'),dot(B[0],B[1],6.4,'#B45309','#fff','B'),
   haloTxt(lblAx,lblAy,`A(${fmt(p.ax,1)};${fmt(p.ay,1)})`,'#1D4ED8',11,'middle',800),
   haloTxt(lblBx,lblBy,`B(${fmt(p.bx,1)};${fmt(p.by,1)})`,'#c25918',11,'middle',800),
   mode===2?`<g>${dot(M[0],M[1],5.8,'#15803D')}${haloTxt(M[0]-abUy*22*abSide,M[1]+abUx*22*abSide,`M(${fmt(mid[0],1)};${fmt(mid[1],1)})`,'#15803D',10.8,'middle',800)}${pill(428,438,480,28,`|AB| = √((${fmt(r.u[0],1)})² + (${fmt(r.u[1],1)})²) = √(${fmt(r.u[0]**2,1)} + ${fmt(r.u[1]**2,1)}) = ${fmt(lenU,2)}`,'#eef8f5','#98d9c4','#0f6953',10.8)}</g>`:'',
   t>0?pill(408,84,392,22,phaseNotes[pIdx-1],'#fff4eb','#f3c299','#b84a18',9.4):'',
   footer10(id,mode===1?`AB = (${fmt(r.u[0],1)}; ${fmt(r.u[1],1)}), |AB| = ${fmt(lenU,2)}`:mode===2?`|AB| = √(Δx² + Δy²) = ${fmt(lenU,2)} • M(${fmt(mid[0],1)}; ${fmt(mid[1],1)})`:`u·v = x₁x₂ + y₁y₂ = ${fmt(r.dot,2)}`,t)
  ].join('');
 }
 const vecRule=exp?.vecRule||'parallelogram',compareRev=!!exp?.compareRev;
 const lenU=Math.hypot(p.ux,p.uy),lenV=Math.hypot(p.vx,p.vy),res=r.resultant||[0,0],lenR=Math.hypot(...res),deg=r.angle===null?null:r.angle*180/Math.PI;
 const U=toScreen(p.ux,p.uy),V=toScreen(p.vx,p.vy),R=toScreen(...res),negV=toScreen(-p.vx,-p.vy);
 // Smooth translation vector v' sliding along rail OA (u)
 const slideFrac=t>0?Math.min(1,Math.max(0,(ph-0.1)/0.65)):1;
 const shiftStart=toScreen(p.ux*slideFrac,p.uy*slideFrac),shiftEnd=toScreen(p.ux*slideFrac+p.vx,p.uy*slideFrac+p.vy);
 // Mode 2: 180 deg rotation arc for -v
 const rotFrac=t>0?Math.min(1,Math.max(0,ph*1.4)):1,vAng=Math.atan2(p.vy,p.vx),rotAng=vAng+Math.PI*rotFrac;
 const Vrot=toScreen(lenV*Math.cos(rotAng),lenV*Math.sin(rotAng));
 // Mode 3: Animated scalar kEff over t = 0..6 and clean non-overlapping parallel offset track!
 let kEff=p.k;
 if(mode===3&&t>0&&t<5.95){
  const kPos=Math.max(1.4,Math.abs(p.k)||1.5),kNeg=-Math.max(1.0,(Math.abs(p.k)||1.5)*0.75);
  if(ph<=0.25)kEff=0.25+0.75*(ph/0.25);
  else if(ph<=0.55)kEff=1.0+(kPos-1.0)*((ph-0.25)/0.30);
  else if(ph<=0.78)kEff=kPos*(1-(ph-0.55)/0.23);
  else kEff=kNeg+(p.k-kNeg)*((ph-0.78)/0.22);
 }
 const resCur=mode===3?[p.ux*kEff,p.uy*kEff]:res,lenRCur=mode===3?Math.hypot(...resCur):lenR;
 const Rcur=mode===3?toScreen(...resCur):R;
 const uScDx=U[0]-O[0],uScDy=U[1]-O[1],uScLen=Math.hypot(uScDx,uScDy)||1;
 let trackNx=-uScDy/uScLen,trackNy=uScDx/uScLen;
 if(trackNy>0){trackNx=-trackNx;trackNy=-trackNy;} // always offset upward on screen so u and k·u never collide!
 const trackOff=44,Otrack=[O[0]+trackNx*trackOff,O[1]+trackNy*trackOff],Rtrack=[Rcur[0]+trackNx*trackOff,Rcur[1]+trackNy*trackOff];
 const uSide= (uScDx>=0)?-1:1; // place u label below the lower rail
 const kuSide= (resCur[0]>=0)?1:-1; // place k·u label above the upper rail
 // Mode 4: Animated orthogonal projection drop from U to ProjPt over t = 0..6
 const projScale=lenV>1e-6?r.dot/(lenV*lenV):0,ProjPt=toScreen(p.vx*projScale,p.vy*projScale);
 const projDropFrac=(mode===4&&t>0&&t<5.95)?Math.min(1,Math.max(0.1,(ph-0.12)/0.55)):1;
 const Pdrop=[U[0]+(ProjPt[0]-U[0])*projDropFrac,U[1]+(ProjPt[1]-U[1])*projDropFrac];
 const Pshadow=[O[0]+(ProjPt[0]-O[0])*projDropFrac,O[1]+(ProjPt[1]-O[1])*projDropFrac];
 const isZeroVec=mode===3&&(Math.abs(kEff)<1e-3||lenU<1e-9);
 const modeTitles=['Tổng hai vectơ u + v','Hiệu hai vectơ u − v','Tích của vectơ với số k·u','Tích vô hướng u · v'];
 const vecPhases=mode===1?[
  'Pha 1: Đặt hai vectơ u và v chung gốc O',
  'Pha 2: Trượt tịnh tiến bản sao v dọc theo giá của u đến ngọn U',
  'Pha 3: Khép hình bình hành & dựng đường chéo u + v',
  'Pha 4: Đồng nhất Hình bình hành ↔ Quy tắc 3 điểm nối tiếp'
 ]:mode===2?[
  'Pha 1: Đặt hai vectơ u và v chung gốc O',
  'Pha 2: Quay compa 180° dựng vectơ đối −v ngược chiều v',
  'Pha 3: Trượt ghép u + (−v) trùng khớp vectơ hiệu u − v',
  'Pha 4: Đối chiếu u − v ngược chiều với v − u'
 ]:mode===3?[
  'Pha 1: Thanh chuẩn vectơ gốc u (1 đơn vị độ dài)',
  'Pha 2: Khi k > 0 → k·u giãn cùng hướng trên ray đối chiếu song song',
  'Pha 3: Khi k → 0 → Co về điểm gốc 0 (không có hướng)',
  'Pha 4: Khi k < 0 → Đổi ngược chiều 180° với độ dài |k|·|u|'
 ]:[
  'Pha 1: Mở góc θ = (u, v) giữa hai vectơ chung gốc O',
  'Pha 2: Chiếu vuông góc ngọn U xuống giá của vectơ v',
  `Pha 3: Góc ${deg===null?'không xác định':deg<89.5?'nhọn (<90°) ⇒ hình chiếu cùng chiều v (u·v > 0)':deg>90.5?'tù (>90°) ⇒ hình chiếu ngược chiều v (u·v < 0)':'vuông (90°) ⇒ hình chiếu thu về O (u·v = 0)'}`,
  `Pha 4: Thanh tích vô hướng u·v = |u|·|v|·cos θ = ${fmt(r.dot,2)}`
 ];
 return [
  card10(modeTitles[mode-1],id,[
   {t:`u = (${fmt(p.ux,1)}; ${fmt(p.uy,1)})  |  ${mode!==3?`v = (${fmt(p.vx,1)}; ${fmt(p.vy,1)})`:`k = ${fmt(p.k,2)}`}`,c:'#1D4ED8',w:800},
   mode===1?{t:`u + v = (${fmt(res[0],1)}; ${fmt(res[1],1)}), |u+v| = ${fmt(lenR,2)}`,c:'#15803D',w:800}:
   mode===2?{t:`u − v = (${fmt(res[0],1)}; ${fmt(res[1],1)}), |u−v| = ${fmt(lenR,2)}`,c:'#15803D',w:800}:
   mode===3?{t:`k·u = (${fmt(res[0],1)}; ${fmt(res[1],1)}), |k·u| = ${fmt(lenR,2)}`,c:'#15803D',w:800}:
   frac10(36,214,'cos(u,v) = ','u · v','|u|·|v|',` = ${fmt(r.dot/(Math.max(1e-6,lenU*lenV)),2)}`,'#15803D',12)
  ],'Mô phỏng trượt tịnh tiến vectơ, quay 180° vectơ đối và chiếu vuông góc.',mode===1?'Đường chéo hình bình hành là vectơ tổng u + v.':mode===2?'Vectơ hiệu u − v nối từ ngọn v tới ngọn u.':mode===3?'k < 0 đổi ngược chiều vectơ; độ dài gấp |k| lần.':'Góc (u,v) = 90° khi và chỉ khi u · v = 0.'),
  axes(),
  // Mode 1: Sliding rail & ghost vector v' with non-overlapping label side
  mode===1?`<g>
   ${vecRule==='parallelogram'?`<polygon points="${O.join(',')} ${U.join(',')} ${R.join(',')} ${V.join(',')}" fill="#15803D" fill-opacity="0.11"/>${line(U[0],U[1],R[0],R[1],'#B45309',1.8,'5 4')}${line(V[0],V[1],R[0],R[1],'#1D4ED8',1.8,'5 4')}`:''}
   ${arrow(shiftStart[0],shiftStart[1],shiftEnd[0],shiftEnd[1],'#B45309',t>0&&slideFrac<0.98?'v (trượt)':'v (ghép nối)',2.6,-1,0.52,18)}
  </g>`:'',
  // Mode 2: 180° rotation arc for -v and bridge vector BA
  mode===2?`<g>
   ${showAux?`${angleArc(O[0],O[1],V[0],V[1],negV[0],negV[1],22,'180°','#94a7b5')}${arrow(O[0],O[1],t>0?Vrot[0]:negV[0],t>0?Vrot[1]:negV[1],'#94a7b5','−v',2.2,-1,0.56,16)}${line(U[0],U[1],R[0],R[1],'#94a7b5',1.4,'4 3')}`:''}
   ${arrow(V[0],V[1],V[0]+(U[0]-V[0])*(t>0?ph:1),V[1]+(U[1]-V[1])*(t>0?ph:1),'#15803D','u−v (BA)',3,1,0.5,18)}
   ${compareRev?arrow(U[0],U[1],V[0],V[1],'#B91C1C','v−u (ngược chiều)',2.4,-1,0.5,18):''}
  </g>`:'',
  // Mode 3: Dedicated Parallel Comparison Track for k*u so u and k*u never overlap!
  mode===3&&lenU>1e-6?`<g>
   ${showAux?[-2,-1,1,2,3].map(tk=>{const Ptk=toScreen(p.ux*tk,p.uy*tk);return `<g><circle cx="${fmt(Ptk[0],2)}" cy="${fmt(Ptk[1],2)}" r="3.2" fill="#94a7b5"/>${haloTxt(Ptk[0]-trackNx*15,Ptk[1]-trackNy*15,`${tk}u`,'#607d8b',9.2,'middle',700)}</g>`;}).join(''):''}
   ${line(O[0],O[1],Otrack[0],Otrack[1],'#94a7b5',1.4,'3 3')}
   ${!isZeroVec?`${line(Rcur[0],Rcur[1],Rtrack[0],Rtrack[1],'#15803D',1.5,'3 3')}${dot(Otrack[0],Otrack[1],4.2,'#15803D')}${arrow(Otrack[0],Otrack[1],Rtrack[0],Rtrack[1],'#15803D',`${fmt(kEff,1)}u = (${fmt(resCur[0],1)};${fmt(resCur[1],1)})`,3.4,kuSide,0.5,20)}${dot(Rtrack[0],Rtrack[1],6.2,'#15803D','#fff','K')}`:`${dot(Otrack[0],Otrack[1],6.5,'#c25918','#fff','K')}`}
   <rect x="424" y="432" width="490" height="36" rx="8" fill="#f7fbfd" stroke="#cde1ec"/>
   ${txt(438,447,`|u| = ${fmt(lenU,2)}`,'#1D4ED8',10,'start',800)}<rect x="550" y="438" width="${fmt(Math.min(180,Math.max(8,lenU*22)),1)}" height="8" rx="4" fill="#1D4ED8"/>
   ${txt(438,461,`|k·u| = |${fmt(kEff,1)}|·|u| = ${fmt(lenRCur,2)}`,'#15803D',10,'start',800)}<rect x="550" y="452" width="${fmt(Math.min(180,Math.max(4,lenRCur*22)),1)}" height="8" rx="4" fill="#15803D"/>
   ${txt(745,454,kEff>1e-3?'Cùng hướng u':kEff<-1e-3?'Ngược hướng u':'Vectơ-không 0','#0f5e4b',10.2,'start',800)}
  </g>`:'',
  mode===3&&isZeroVec?pill(518,396,308,26,'k·u = 0 (Vectơ-không không có hướng xác định)','#fff1e6','#f2c199','#c25918',10.2):'',
  // Mode 4: Orthogonal Spotlight Projection & Signed Power Meter
  mode===4&&deg!==null?`<g>
   ${showAux?`<polygon points="${O.join(',')} ${U.join(',')} ${Pdrop.join(',')}" fill="${r.dot>=0?'#15803D':'#B91C1C'}" fill-opacity="0.10"/>${line(U[0],U[1],Pdrop[0],Pdrop[1],'#15803D',2.2,'4 3')}${projDropFrac>=0.95?rightMark(ProjPt[0],ProjPt[1],U[0],U[1],O[0],O[1],8,'#15803D'):''}${line(O[0],O[1],Pshadow[0],Pshadow[1],r.dot>=0?'#15803D':'#B91C1C',5)}${dot(Pdrop[0],Pdrop[1],5.2,'#15803D')}${haloTxt(ProjPt[0],ProjPt[1]+16,"H'",'#15803D',10.2,'middle',800)}`:''}
   ${Math.abs(deg-90)<1.2?rightMark(O[0],O[1],U[0],U[1],V[0],V[1],12,'#15803D'):angleArc(O[0],O[1],U[0],U[1],V[0],V[1],32,`${fmt(deg,0)}°`,'#15803D')}
   <rect x="442" y="432" width="452" height="34" rx="8" fill="#eef8f5" stroke="#98d9c4"/>
   ${line(668,436,668,462,'#3b6982',1.8)}
   <rect x="${fmt(r.dot>=0?668:Math.max(450,668+r.dot*8*projDropFrac),1)}" y="442" width="${fmt(Math.min(210,Math.max(4,Math.abs(r.dot)*8*projDropFrac)),1)}" height="12" rx="4" fill="${Math.abs(deg-90)<1.2?'#1D4ED8':r.dot>0?'#15803D':'#B91C1C'}"/>
   ${txt(454,453,`u·v = ${fmt(r.dot,2)} (${Math.abs(deg-90)<1.2?'90° ⇒ u·v=0':r.dot>0?'Nhọn >0':'Tù <0'})`,'#0f5e4b',10,'start',800)}
  </g>`:'',
  arrow(O[0],O[1],U[0],U[1],'#1D4ED8',`u(${fmt(p.ux,1)};${fmt(p.uy,1)})`,3.2,mode===3?uSide:1,0.48,20),
  mode!==3&&(mode!==1||vecRule==='parallelogram')?arrow(O[0],O[1],V[0],V[1],'#B45309',`v(${fmt(p.vx,1)};${fmt(p.vy,1)})`,3,-1,0.48,18):'',
  (mode===1||mode===2)&&!isZeroVec?arrow(O[0],O[1],R[0],R[1],'#15803D',mode===1?`u+v (${fmt(res[0],1)};${fmt(res[1],1)})`:`u−v (${fmt(res[0],1)};${fmt(res[1],1)})`,3.4,1,0.66,18):'',
  dot(U[0],U[1],6.6,'#B45309','#fff','U'),mode!==3?dot(V[0],V[1],6.2,'#B45309','#fff','V'):'',
  t>0?pill(408,84,396,22,vecPhases[pIdx-1],'#fff4eb','#f3c299','#b84a18',9.4):'',
  footer10(id,mode===1?`Quy tắc hình bình hành: OA + OB = OC ⇒ u + v = (${fmt(res[0],1)}; ${fmt(res[1],1)})`:mode===2?`OA − OB = BA ⇒ u − v = (${fmt(res[0],1)}; ${fmt(res[1],1)})`:mode===3?`k·u = (${fmt(res[0],1)}; ${fmt(res[1],1)}), |k·u| = ${fmt(lenR,2)}`:`u · v = |u|·|v|·cos(u,v) = ${fmt(r.dot,2)}`,t)
 ].join('');
}
function lineSVG(id,p,m,t,exp){
 const mode=Number(id.split('-C')[1]),r=m.result,l1=clipLine(p.a,p.b,-p.c),l2=clipLine(p.d,p.e,-p.f),P=toScreen(p.px,p.py),H=toScreen(...r.foot);
 const showAux=exp?.showAux!==false,pIdx=phaseIndex(t);
 // Normalize normal vector n(a,b) and direction vector u(-b,a) to fixed 68px screen length so they NEVER bunch up near H!
 const abNorm=Math.max(1e-6,Math.hypot(p.a,p.b)),nx=p.a/abNorm,ny=p.b/abNorm,ux=-ny,uy=nx;
 const vecLenMath=2.25; // 67.5px on screen
 const normEnd=toScreen(r.foot[0]+nx*vecLenMath,r.foot[1]+ny*vecLenMath);
 const dirEnd=toScreen(r.foot[0]+ux*vecLenMath,r.foot[1]+uy*vecLenMath);
 const nTipLbl=toScreen(r.foot[0]+nx*(vecLenMath+0.62),r.foot[1]+ny*(vecLenMath+0.62));
 const uTipLbl=toScreen(r.foot[0]+ux*(vecLenMath+0.68),r.foot[1]+uy*(vecLenMath+0.68));
 const hLblPt=toScreen(r.foot[0]-nx*0.65-ux*0.45,r.foot[1]-ny*0.65-uy*0.45);
 const hpDx=P[0]-H[0],hpDy=P[1]-H[1],hpLen=Math.hypot(hpDx,hpDy)||1;
 const pLblX=P[0]+(hpDx/hpLen)*18,pLblY=P[1]+(hpDy/hpLen)*16-4;
 const deg=r.angle*180/Math.PI,ph=t>0?Math.min(1,Math.max(0,(t%6.0001)/6)):1;
 const posText=r.coincident?'Δ₁ ≡ Δ₂ (Trùng nhau)':r.parallel?'Δ₁ ∥ Δ₂ (Song song)':`Cắt tại I(${fmt(r.intersection[0],1)}; ${fmt(r.intersection[1],1)})`;
 const tParam=(t>0&&t<5.95)?(-2.0+4.0*ph):(Number.isFinite(p.t)?p.t:1.5);
 const PtMath=[r.foot[0]+tParam*ux*1.4,r.foot[1]+tParam*uy*1.4],Mglide=toScreen(...PtMath);
 const mGlideLbl=toScreen(PtMath[0]-nx*0.65,PtMath[1]-ny*0.65);
 const obliqueOffset=(t>0&&t<5.95)?(2.4*(1-ph)):1.8;
 const obliqueMath=[r.foot[0]+obliqueOffset*ux,r.foot[1]+obliqueOffset*uy],Moblique=toScreen(...obliqueMath);
 const dOblique=Math.hypot(p.px-obliqueMath[0],p.py-obliqueMath[1]);
 // Time ticks along Δ1 for parametric mode 2 (excluding t=0 so H stays clean)
 const paramTicks=[-2,-1,1,2].map(tk=>{
  const pt=toScreen(r.foot[0]+tk*ux*1.4,r.foot[1]+tk*uy*1.4);
  const lbl=toScreen(r.foot[0]+tk*ux*1.4-nx*0.48,r.foot[1]+tk*uy*1.4-ny*0.48);
  return `<g><circle cx="${fmt(pt[0],2)}" cy="${fmt(pt[1],2)}" r="3.2" fill="#1D4ED8"/>${haloTxt(lbl[0],lbl[1]+3,`t=${tk}`,'#0f4c68',8.8,'middle',700)}</g>`;
 }).join('');
 const linePhases=mode===1?[
  `Pha 1: Chốt điểm tựa H(${fmt(r.foot[0],1)}; ${fmt(r.foot[1],1)}) ∈ Δ₁`,
  `Pha 2: Gắn ê-ke pháp tuyến n = (${p.a}; ${p.b}) vuông góc Δ₁`,
  `Pha 3: Trượt điểm M trên Δ₁ kiểm chứng n · HM = 0`,
  `Pha 4: PT tổng quát ${formatLinearEquation2D(p.a,p.b,p.c)}`
 ]:mode===2?[
  `Pha 1: Đặt điểm xuất phát M₀(${fmt(r.foot[0],1)}; ${fmt(r.foot[1],1)}) ứng với t = 0`,
  `Pha 2: Hạt chuyển động P(t) = M₀ + t·u trượt theo 2 chiều âm/dương`,
  `Pha 3: Vectơ vận tốc chỉ phương u = (${-p.b}; ${p.a}) dẫn hướng trên Δ₁`,
  'Pha 4: Quỹ đạo P(t) vạch toàn bộ đường thẳng Δ₁ khi t ∈ ℝ'
 ]:mode===3?[
  'Pha 1: Dựng hai đường thẳng Δ₁, Δ₂ và cặp pháp tuyến n₁, n₂',
  `Pha 2: Định thức Δ = a₁b₂ − a₂b₁ = ${fmt(r.det,1)} → ${posText}`,
  `Pha 3: Thước đo góc nhọn giữa hai đường thẳng φ = ${fmt(deg,1)}° ≤ 90°`,
  `Pha 4: cos φ = |n₁·n₂| / (|n₁|·|n₂|) = ${fmt(Math.cos(r.angle),2)}`
 ]:[
  `Pha 1: Từ P(${fmt(p.px,1)};${fmt(p.py,1)}) chiếu vuông góc PH ⊥ Δ₁`,
  `Pha 2: Quét con lắc tia xiên PM = ${fmt(dOblique,2)} dọc theo Δ₁`,
  `Pha 3: Cạnh huyền PM luôn lớn hơn hoặc bằng cạnh góc vuông PH = ${fmt(r.distance,2)}`,
  `Pha 4: Khoảng cách ngắn nhất d(P, Δ₁) = PH = ${fmt(r.distance,2)}`
 ];
 return [
  card10(mode===1?'PT tổng quát & VTPT':mode===2?'PT tham số & VTCP':mode===3?'Vị trí tương đối & Góc':'Khoảng cách từ điểm đến Δ',id,[
   {t:`Δ₁: ${formatLinearEquation2D(p.a,p.b,p.c)}`,c:'#1D4ED8',w:800},
   mode===3?{t:`Δ₂: ${formatLinearEquation2D(p.d,p.e,p.f)} | φ = ${fmt(deg,1)}°`,c:'#B45309',w:800}:
   frac10(36,214,'d(P,Δ₁) = ','|ax_P+by_P+c|','√(a²+b²)',` = ${fmt(r.distance,2)}`,'#15803D',11.6)
  ],'Cơ cấu ê-ke pháp tuyến – chỉ phương, hạt chuyển động P(t) và con lắc tia xiên PM.','Kéo điểm P hoặc đầu vectơ pháp tuyến n trên mặt phẳng Oxy.'),
  axes(),
  l1.length===2?`<g>${line(...toScreen(...l1[0]),...toScreen(...l1[1]),'#1D4ED8',3)}${pill(toScreen(...l1[1])[0]-26,toScreen(...l1[1])[1]-12,44,20,'Δ₁','#e6f4fa','#9bcbe0','#1D4ED8',10.5)}</g>`:'',
  mode===3&&l2.length===2?`<g>${line(...toScreen(...l2[0]),...toScreen(...l2[1]),'#B45309',2.6,'7 4')}${pill(toScreen(...l2[0])[0]-22,toScreen(...l2[0])[1]-12,44,20,'Δ₂','#fff1e6','#f3c299','#c25918',10.5)}</g>`:'',
  // Rigid T-square rig (n perpendicular to u) with labels placed cleanly past arrow tips!
  mode<=2?`<g>
   ${arrow(H[0],H[1],normEnd[0],normEnd[1],'#B45309','',2.8)}
   ${dot(normEnd[0],normEnd[1],6.2,'#B45309','#fff','N')}
   ${haloTxt(nTipLbl[0],nTipLbl[1]+4,`n(${fmt(p.a,1)};${fmt(p.b,1)})`,'#c25918',10.8,'middle',800)}
   ${arrow(H[0],H[1],dirEnd[0],dirEnd[1],'#15803D','',2.6)}
   ${haloTxt(uTipLbl[0],uTipLbl[1]+4,`u(${fmt(-p.b,1)};${fmt(p.a,1)})`,'#0f6953',10.8,'middle',800)}
   ${rightMark(H[0],H[1],normEnd[0],normEnd[1],dirEnd[0],dirEnd[1],10,'#B45309')}
   ${mode===1&&t>0&&t<5.95?`${line(H[0],H[1],Mglide[0],Mglide[1],'#15803D',3.2)}${dot(Mglide[0],Mglide[1],5.8,'#15803D','#fff')}${haloTxt(mGlideLbl[0],mGlideLbl[1]+4,'M ∈ Δ₁ (n·HM=0)','#0f6953',10,'middle',800)}`:''}
  </g>`:'',
  // Mode 2: Moving particle P(t) with time ticks along line and bottom status bar
  mode===2?`<g>${showAux?paramTicks:''}${line(H[0],H[1],Mglide[0],Mglide[1],'#15803D',4.2)}${dot(Mglide[0],Mglide[1],6.8,'#15803D','#fff')}${haloTxt(mGlideLbl[0],mGlideLbl[1]+4,`P(t=${fmt(tParam,1)})`,'#0f6953',10.5,'middle',800)}${pill(428,438,480,26,`Hạt P(t = ${fmt(tParam,2)}) = (${fmt(PtMath[0],2)}; ${fmt(PtMath[1],2)}) ∈ Δ₁`,'#eef8f5','#98d9c4','#0f6953',10.4)}</g>`:'',
  mode===3?`<g>${r.intersection?`${l1.length===2&&l2.length===2?angleArc(toScreen(...r.intersection)[0],toScreen(...r.intersection)[1],toScreen(...l1[1])[0],toScreen(...l1[1])[1],toScreen(...l2[1])[0],toScreen(...l2[1])[1],26*(t>0&&t<5.95?0.6+0.4*ph:1),`${fmt(deg,0)}°`,'#15803D'):''}${dot(...toScreen(...r.intersection),6.5,'#15803D')}${haloTxt(toScreen(...r.intersection)[0]+14,toScreen(...r.intersection)[1]-10,`I(${fmt(r.intersection[0],1)};${fmt(r.intersection[1],1)})`,'#0f6953',10.8,'start',800)}`:''}${t>0&&t<5.95?dot(Mglide[0],Mglide[1],5.4,'#1D4ED8'):''}${pill(428,438,480,26,`${posText} • Góc φ = ${fmt(deg,1)}°`,'#eef8f5','#98d9c4','#0f6953',10.5)}</g>`:'',
  line(P[0],P[1],H[0],H[1],'#15803D',2.4,'5 4'),
  // Mode 4: Pendulum oblique ray PM vs perpendicular PH with comparison bars
  mode===4&&showAux?`<g>
   <polygon points="${P[0]},${P[1]} ${H[0]},${H[1]} ${Moblique[0]},${Moblique[1]}" fill="#B45309" fill-opacity="0.10"/>
   ${line(P[0],P[1],Moblique[0],Moblique[1],'#B45309',2.2,'4 3')}${dot(Moblique[0],Moblique[1],5.2,'#B45309')}
   ${haloTxt(Moblique[0]+10,Moblique[1]-8,`M (PM=${fmt(dOblique,2)} ≥ PH)`,'#c25918',10.2,'start',800)}
   <rect x="428" y="432" width="480" height="34" rx="8" fill="#f7fbfd" stroke="#cde1ec"/>
   ${txt(440,446,`PH=${fmt(r.distance,2)}`,'#15803D',9.8,'start',800)}<rect x="520" y="437" width="${fmt(Math.min(180,Math.max(8,r.distance*28)),1)}" height="8" rx="4" fill="#15803D"/>
   ${txt(440,460,`PM=${fmt(dOblique,2)}`,'#B45309',9.8,'start',800)}<rect x="520" y="451" width="${fmt(Math.min(180,Math.max(8,dOblique*28)),1)}" height="8" rx="4" fill="#B45309"/>
   ${txt(715,453,'PH ≤ PM (Ngắn nhất)','#0f5e4b',10,'start',800)}
  </g>`:'',
  mode===4?haloTxt((P[0]+H[0])/2-uy*18,(P[1]+H[1])/2-ux*18,`PH = ${fmt(r.distance,2)}`,'#0f6953',10.6,'middle',800):'',
  l1.length===2&&mode!==3?rightMark(H[0],H[1],P[0],P[1],...toScreen(...l1[0]),10,'#15803D'):'',
  dot(P[0],P[1],6.6,'#B45309','#fff','P'),dot(H[0],H[1],5,'#15803D'),
  haloTxt(pLblX,pLblY,`P(${fmt(p.px,1)};${fmt(p.py,1)})`,'#c25918',11,'middle',800),
  haloTxt(hLblPt[0],hLblPt[1]+4,`H(${fmt(r.foot[0],1)};${fmt(r.foot[1],1)})`,'#15803D',10.5,'middle',800),
  t>0?pill(408,84,396,22,linePhases[pIdx-1],'#fff4eb','#f3c299','#b84a18',9.4):'',
  footer10(id,mode<=2?`n = (${fmt(p.a,1)}; ${fmt(p.b,1)}) ⊥ u = (${fmt(-p.b,1)}; ${fmt(p.a,1)})`:mode===3?`${posText} • φ = ${fmt(deg,2)}°`:`d(P, Δ₁) = PH = ${fmt(r.distance,2)} ≤ PM`,t)
 ].join('');
}
function circleSVG(id,p,m,t,exp){
 const mode=Number(id.split('-C')[1]),r=m.result,C=toScreen(p.h,p.k),R=p.r*GRADE10_VIEW.unit,pIdx=phaseIndex(t),showAux=exp?.showAux!==false,skewLine=!!exp?.skewLine;
 const ph=t>0?Math.min(1,Math.max(0,(t%6.0001)/6)):1;
 const baseAng=Math.atan2(r.contact[1]-p.k,r.contact[0]-p.h),ang=(t>0&&t<5.95&&mode!==2)?(baseAng-1.6*(1-ph)):baseAng;
 const contactDyn=[p.h+p.r*Math.cos(ang),p.k+p.r*Math.sin(ang)],M=toScreen(...contactDyn),Mx=toScreen(contactDyn[0],p.k);
 const nx=Math.cos(ang),ny=Math.sin(ang),tan=clipLine(nx,ny,nx*contactDyn[0]+ny*contactDyn[1]);
 const skewAng=ang+0.42,snx=Math.cos(skewAng),sny=Math.sin(skewAng),skew=clipLine(snx,sny,snx*contactDyn[0]+sny*contactDyn[1]);
 const qEff=(mode===2&&t>0&&t<5.95)?(p.q-1.5*(1-ph)):p.q;
 const sec=clipLine(-p.m,1,qEff);
 const denom=Math.hypot(p.m,1),footX=(p.h+p.m*(p.k-qEff))/(p.m*p.m+1),footY=p.m*footX+qEff,Hsec=toScreen(footX,footY);
 const relState=r.intersections.length===2?'d < R (Cắt 2 điểm)':r.intersections.length===1?'d = R (Tiếp xúc)':'d > R (Không giao)';
 // Outward radial unit vector in screen coordinates so I and M/T labels never collide with the circle or radius
 const rDx=M[0]-C[0],rDy=M[1]-C[1],rLen=Math.hypot(rDx,rDy)||1,rUx=rDx/rLen,rUy=rDy/rLen;
 const iLbl=[C[0]-rUx*22,C[1]-rUy*20+4],mLbl=[M[0]+rUx*24,M[1]+rUy*20+4],radMid=[(C[0]+M[0])/2-rUy*16,(C[1]+M[1])/2+rUx*16+4];
 const circPhases=mode===1?[
  `Pha 1: Ghim mũi kim compa tại tâm I(${fmt(p.h,1)}; ${fmt(p.k,1)})`,
  `Pha 2: Mở khẩu độ compa cố định R = ${fmt(p.r,2)}`,
  'Pha 3: Đầu bút M(x; y) quay tròn giữ khoảng cách IM = R',
  `Pha 4: Tam giác vuông Pythagore ⇒ (x − ${fmt(p.h,1)})² + (y − ${fmt(p.k,1)})² = ${fmt(p.r*p.r,2)}`
 ]:mode===2?[
  `Pha 1: Dựng đường tròn (I; R=${fmt(p.r,1)}) và thanh trượt d: y = ${fmt(p.m,1)}x + ${fmt(p.q,1)}`,
  `Pha 2: Hạ thước đo khoảng cách vuông góc IH = d(I, d) = ${fmt(r.distance,2)}`,
  `Pha 3: Đối chiếu thanh d(I, d) = ${fmt(r.distance,2)} với bán kính R = ${fmt(p.r,2)}`,
  `Pha 4: Chốt trạng thái giao cắt: ${relState}`
 ]:[
  `Pha 1: Đặt con trượt tiếp điểm T(${fmt(contactDyn[0],1)}; ${fmt(contactDyn[1],1)}) ∈ (C)`,
  'Pha 2: Khóa thước tiếp tuyến Δ luôn vuông góc bán kính IT tại T',
  'Pha 3: Thử nghiêng lệch góc → Đường thẳng lập tức cắt (C) tại điểm thứ 2',
  'Pha 4: PT tiếp tuyến (x_T − h)(x − x_T) + (y_T − k)(y − y_T) = 0'
 ];
 return [
  card10(mode===1?'PT đường tròn (C)':mode===2?'Đường thẳng & Đường tròn':'Tiếp tuyến tại T ∈ (C)',id,[
   {t:`(x − ${fmt(p.h,1)})² + (y − ${fmt(p.k,1)})² = ${fmt(p.r*p.r,2)}`,c:'#1D4ED8',w:800},
   mode===3?{t:`Δ ⊥ IT tại T(${fmt(contactDyn[0],2)}; ${fmt(contactDyn[1],2)})`,c:'#15803D',w:800}:
   {t:`d(I, Δ) = ${fmt(r.distance,2)}  |  ${relState}`,c:'#15803D',w:800}
  ],'Cơ cấu compa quay tâm I, thanh trượt cát tuyến và thước vuông góc tiếp tuyến.','Kéo tâm I hoặc điểm tiếp xúc T trên mặt phẳng Oxy.'),
  axes(),
  `<circle cx="${fmt(C[0],2)}" cy="${fmt(C[1],2)}" r="${fmt(R,2)}" fill="#1793b5" fill-opacity="0.14" stroke="#1D4ED8" stroke-width="3"/>`,
  // Mode 1: Rotating right-triangle (x-h, y-k, R) inside circle with outward labels
  mode===1&&showAux?`<g><polygon points="${C[0]},${C[1]} ${Mx[0]},${Mx[1]} ${M[0]},${M[1]}" fill="#15803D" fill-opacity="0.13" stroke="#15803D" stroke-width="1.6" stroke-dasharray="4 3"/>${rightMark(Mx[0],Mx[1],C[0],C[1],M[0],M[1],8,'#15803D')}${haloTxt((C[0]+Mx[0])/2,C[1]+(M[1]>C[1]?-10:18),`|x−h|=${fmt(Math.abs(contactDyn[0]-p.h),1)}`,'#0f6953',9.6,'middle',800)}${haloTxt(Mx[0]+(Mx[0]>=C[0]?10:-10),(Mx[1]+M[1])/2+3,`|y−k|=${fmt(Math.abs(contactDyn[1]-p.k),1)}`,'#0f6953',9.6,Mx[0]>=C[0]?'start':'end',800)}</g>`:'',
  line(C[0],C[1],M[0],M[1],'#15803D',2.6),
  haloTxt(radMid[0],radMid[1],`R=${fmt(p.r,1)}`,'#0f6b54',10.4,'middle',800),
  mode===3&&tan.length===2?`<g>${line(...toScreen(...tan[0]),...toScreen(...tan[1]),'#B45309',3)}${rightMark(M[0],M[1],C[0],C[1],...toScreen(...tan[0]),11,'#B45309')}</g>`:'',
  mode===3&&(skewLine||(t>0&&pIdx===3))&&skew.length===2?`<g>${line(...toScreen(...skew[0]),...toScreen(...skew[1]),'#B91C1C',2.2,'5 4')}${pill(424,438,488,24,'Đường qua T nhưng không vuông góc IT luôn cắt (C) tại điểm thứ hai!','#fff1f0','#f3b5b0','#b42318',10)}</g>`:'',
  mode===2&&sec.length===2?`<g>${line(...toScreen(...sec[0]),...toScreen(...sec[1]),'#B45309',2.8)}${denom>0?`${line(C[0],C[1],Hsec[0],Hsec[1],'#B45309',2,'4 3')}${rightMark(Hsec[0],Hsec[1],C[0],C[1],...toScreen(...sec[0]),9,'#B45309')}${dot(Hsec[0],Hsec[1],5.8,'#B45309','#fff','Hsec')}${haloTxt(Hsec[0]+12,Hsec[1]+14,`H (d=${fmt(r.distance,2)})`,'#c25918',10,'start',800)}`:''}</g>`:'',
  mode===2?`<g>${r.intersections.map((pt,idx)=>{const [sx,sy]=toScreen(...pt);return `<g><circle cx="${fmt(sx,2)}" cy="${fmt(sy,2)}" r="10" fill="#15803D" fill-opacity="0.22"/>${dot(sx,sy,6,'#15803D')}${haloTxt(sx+(idx===0?-12:12),sy-12,`G${idx+1}`,'#15803D',10.8,idx===0?'end':'start',800)}</g>`;}).join('')}
   <rect x="424" y="432" width="490" height="36" rx="8" fill="#f7fbfd" stroke="#cde1ec"/>
   ${txt(436,448,`d(I,d)=${fmt(r.distance,2)}`,'#B45309',10,'start',800)}<rect x="530" y="439" width="${fmt(Math.min(160,Math.max(6,r.distance*36)),1)}" height="8" rx="4" fill="#B45309"/>
   ${txt(436,462,`Bán kính R=${fmt(p.r,2)}`,'#1D4ED8',10,'start',800)}<rect x="530" y="453" width="${fmt(Math.min(160,Math.max(6,p.r*36)),1)}" height="8" rx="4" fill="#1D4ED8"/>
   ${txt(710,455,relState,'#15803D',10.5,'start',800)}
  </g>`:'',
  dot(C[0],C[1],6.6,'#B45309','#fff','I'),dot(M[0],M[1],6.4,'#15803D','#fff','T'),
  haloTxt(iLbl[0],iLbl[1],`I(${fmt(p.h,1)};${fmt(p.k,1)})`,'#c25918',11,'middle',800),
  haloTxt(mLbl[0],mLbl[1],mode===1?`M(${fmt(contactDyn[0],1)};${fmt(contactDyn[1],1)})`:`T(${fmt(contactDyn[0],1)};${fmt(contactDyn[1],1)})`,'#15803D',11,'middle',800),
  t>0?pill(408,84,396,22,circPhases[pIdx-1],'#fff4eb','#f3c299','#b84a18',9.4):'',
  footer10(id,mode===1?`(x − ${fmt(p.h,1)})² + (y − ${fmt(p.k,1)})² = R² = ${fmt(p.r*p.r,2)}`:mode===3?`Tiếp tuyến Δ ⊥ IT tại T(${fmt(contactDyn[0],1)}; ${fmt(contactDyn[1],1)})`:`d(I,Δ) = ${fmt(r.distance,2)} vs R = ${fmt(p.r,2)} ⇒ ${relState}`,t)
 ].join('');
}
function conicSVG(id,p,m,t,exp){
 const mode=Number(id.split('-C')[1]),r=m.result,O=toScreen(0,0),u=GRADE10_VIEW.unit,pIdx=phaseIndex(t),showAux=exp?.showAux!==false;
 const ph=t>0?Math.min(1,Math.max(0,(t%6.0001)/6)):1;
 const baseAng=Number.isFinite(exp?.mAng)?exp.mAng:0.65;
 const ang=(t>0&&t<5.95)?(0.15+ph*(Math.PI*1.75)):baseAng;
 if(mode===1){
  const F1=toScreen(-r.c,0),F2=toScreen(r.c,0),mx=p.a*Math.cos(ang),my=p.b*Math.sin(ang),P=toScreen(mx,my);
  const d1=Math.hypot(mx+r.c,my),d2=Math.hypot(mx-r.c,my);
  const pDx=P[0]-O[0],pDy=P[1]-O[1],pLen=Math.hypot(pDx,pDy)||1,mOut=[P[0]+(pDx/pLen)*24,P[1]+(pDy/pLen)*20+4];
  const tot=Math.max(1e-6,d1+d2),barW=260,w1=(d1/tot)*barW,w2=barW-w1,bx=540,by=452;
  const tracePts=[];
  if(t>0&&t<5.95){
   const steps=48;
   for(let k=0;k<=steps;k++){const aStep=(ang*k)/steps;tracePts.push(toScreen(p.a*Math.cos(aStep),p.b*Math.sin(aStep)).map(v=>fmt(v,2)).join(','));}
  }
  const ellPhases=[
   `Pha 1: Ghim 2 đinh tiêu điểm F₁(−${fmt(r.c,2)}; 0) và F₂(${fmt(r.c,2)}; 0)`,
   `Pha 2: Căng sợi dây F₁–M–F₂ dài cố định 2a = ${fmt(2*r.major,1)}`,
   `Pha 3: Đầu bút M trượt làm MF₁ = ${fmt(d1,2)} và MF₂ = ${fmt(d2,2)} bù trừ nhau`,
   `Pha 4: Thanh dây căng tổng MF₁ + MF₂ = ${fmt(d1+d2,2)} = 2a bất biến!`
  ];
  return [
   card10('Đường Elip (E)',id,[
    frac10(36,214,'(E): ','x²',`${fmt(p.a*p.a,1)}`,` + y²/${fmt(p.b*p.b,1)} = 1`,'#1D4ED8',11.8),
    {t:`F₁(−${fmt(r.c,2)}; 0), F₂(${fmt(r.c,2)}; 0) | c = ${fmt(r.c,2)}`,c:'#B45309',w:750},
    {t:`MF₁ + MF₂ = ${fmt(d1,2)} + ${fmt(d2,2)} = 2a = ${fmt(2*r.major,2)}`,c:'#15803D',w:800}
   ],'Cơ cấu căng dây tiêu điểm F₁–M–F₂ vẽ đường Elip (E).','Khi M chạy quanh Elip, tổng chiều dài sợi dây MF₁ + MF₂ = 2a không đổi.'),
   axes(),
   showAux?`<rect x="${fmt(O[0]-p.a*u,2)}" y="${fmt(O[1]-p.b*u,2)}" width="${fmt(2*p.a*u,2)}" height="${fmt(2*p.b*u,2)}" fill="none" stroke="#b8d4e3" stroke-width="1.2" stroke-dasharray="4 3"/>`:'',
   `<ellipse cx="${fmt(O[0],2)}" cy="${fmt(O[1],2)}" rx="${fmt(p.a*u,2)}" ry="${fmt(p.b*u,2)}" fill="#6D28D9" fill-opacity="0.10" stroke="${t>0&&t<5.95?'#475569':'#6D28D9'}" stroke-width="${t>0&&t<5.95?'1.8':'3.2'}" stroke-dasharray="${t>0&&t<5.95?'5 4':'none'}"/>`,
   tracePts.length?`<polyline points="${tracePts.join(' ')}" fill="none" stroke="#6D28D9" stroke-width="3.6"/>`:'',
   // Taut string F1-M-F2 with halo labels placed on opposite sides of the segments
   line(F1[0],F1[1],P[0],P[1],'#1D4ED8',2.8),line(F2[0],F2[1],P[0],P[1],'#B45309',2.8),
   haloTxt((F1[0]+P[0])/2-14,(F1[1]+P[1])/2-8,`MF₁=${fmt(d1,2)}`,'#1D4ED8',10,'end',800),
   haloTxt((F2[0]+P[0])/2+14,(F2[1]+P[1])/2-8,`MF₂=${fmt(d2,2)}`,'#c25918',10,'start',800),
   dot(O[0]+p.a*u,O[1],5.6,'#1D4ED8','#fff','A'),dot(O[0],O[1]-p.b*u,5.6,'#1D4ED8','#fff','B'),
   dot(F1[0],F1[1],5.8,'#B45309'),dot(F2[0],F2[1],5.8,'#B45309'),dot(P[0],P[1],7,'#15803D','#fff','M'),
   haloTxt(F1[0],F1[1]+20,`F₁`,'#B45309',11,'middle',800),
   haloTxt(F2[0],F2[1]+20,`F₂`,'#B45309',11,'middle',800),
   haloTxt(mOut[0],mOut[1],`M(${fmt(mx,1)};${fmt(my,1)})`,'#15803D',11,'middle',800),
   // Partitioned constant-width string bar at bottom
   `<g><rect x="${bx}" y="${by}" width="${fmt(w1,2)}" height="14" rx="4" fill="#1D4ED8"/><rect x="${fmt(bx+w1,2)}" y="${by}" width="${fmt(w2,2)}" height="14" rx="4" fill="#B45309"/><line x1="${fmt(bx+w1,2)}" y1="${by-3}" x2="${fmt(bx+w1,2)}" y2="${by+17}" stroke="#15803D" stroke-width="2.5"/>${txt(bx-8,by+11,`MF₁=${fmt(d1,1)}`,'#1D4ED8',10,'end',800)}${txt(bx+barW+8,by+11,`MF₂=${fmt(d2,1)} (Tổng 2a=${fmt(2*r.major,1)})`,'#B45309',10,'start',800)}</g>`,
   t>0?pill(408,84,396,22,ellPhases[pIdx-1],'#fff4eb','#f3c299','#b84a18',9.4):'',
   footer10(id,`MF₁ + MF₂ = 2a = ${fmt(2*r.major,2)} (c² = |a² − b²|)`,t)
  ].join('');
 }
 if(mode===2){
  const branch=(t>0&&pIdx===3)?-1:(exp?.branch===-1?-1:1);
  const L=[],R=[];for(let t0=-1.15;t0<=1.15;t0+=.11){const ch=Math.cosh(t0),sh=Math.sinh(t0);R.push(toScreen(p.a*ch,p.b*sh).map(v=>fmt(v,2)).join(','));L.push(toScreen(-p.a*ch,p.b*sh).map(v=>fmt(v,2)).join(','));}
  const as1=clipLine(p.b,-p.a,0),as2=clipLine(p.b,p.a,0),F1=toScreen(-r.c,0),F2=toScreen(r.c,0);
  const baseTau=Number.isFinite(exp?.mY)?Math.max(-1.05,Math.min(1.05,Math.asinh(exp.mY/Math.max(0.5,p.b)))):0.55;
  const tau=(t>0&&t<5.95)?(-0.85+1.70*ph):baseTau,mx=branch*p.a*Math.cosh(tau),my=p.b*Math.sinh(tau),M=toScreen(mx,my);
  const d1=Math.hypot(mx+r.c,my),d2=Math.hypot(mx-r.c,my),signedDiff=d1-d2;
  const wD1=Math.min(180,Math.max(10,d1*16)),wD2=Math.min(180,Math.max(10,d2*16));
  const hypPhases=[
   `Pha 1: Dựng khung chữ nhật cơ sở 2a×2b và phễu tiệm cận y = ±${fmt(r.asymptote,2)}x`,
   `Pha 2: M trượt nhánh phải ⇒ MF₁ − MF₂ = +2a = +${fmt(2*p.a,1)}`,
   `Pha 3: Nhảy sang nhánh trái ⇒ MF₁ − MF₂ = −2a = −${fmt(2*p.a,1)}`,
   `Pha 4: Độ chênh lệch |MF₁ − MF₂| = 2a = ${fmt(2*p.a,1)} luôn cố định!`
  ];
  return [
   card10('Đường Hypebol (H)',id,[
    frac10(36,214,'(H): ','x²',`${fmt(p.a*p.a,1)}`,` − y²/${fmt(p.b*p.b,1)} = 1`,'#1D4ED8',11.8),
    {t:`Tiệm cận: y = ±(b/a)x = ±${fmt(r.asymptote,2)}x`,c:'#B45309',w:750},
    {t:`|MF₁ − MF₂| = 2a = ${fmt(2*p.a,2)}`,c:'#15803D',w:800}
   ],'Khung chữ X tiệm cận và hai thanh đo hiệu khoảng cách |MF₁ − MF₂| = 2a.','Đổi a, b hoặc kéo M để quan sát hiệu hai bán kính qua tiêu điểm.'),
   axes(),
   showAux?`<rect x="${fmt(O[0]-p.a*u,2)}" y="${fmt(O[1]-p.b*u,2)}" width="${fmt(2*p.a*u,2)}" height="${fmt(2*p.b*u,2)}" fill="#15803D" fill-opacity="0.06" stroke="#90b4c8" stroke-width="1.5" stroke-dasharray="4 3"/>`:'',
   showAux&&as1.length===2?line(...toScreen(...as1[0]),...toScreen(...as1[1]),'#94a7b5',1.8,'5 4'):'',
   showAux&&as2.length===2?line(...toScreen(...as2[0]),...toScreen(...as2[1]),'#94a7b5',1.8,'5 4'):'',
   `<polyline points="${L.join(' ')}" fill="none" stroke="${branch===-1?'#15803D':'#1D4ED8'}" stroke-width="3.2"/><polyline points="${R.join(' ')}" fill="none" stroke="${branch===1?'#15803D':'#1D4ED8'}" stroke-width="3.2"/>`,
   line(F1[0],F1[1],M[0],M[1],'#1D4ED8',2.2,'4 3'),line(F2[0],F2[1],M[0],M[1],'#B45309',2.2,'4 3'),
   dot(O[0]+p.a*u,O[1],5.6,'#1D4ED8','#fff','A'),dot(O[0],O[1]-p.b*u,5.6,'#1D4ED8','#fff','B'),
   dot(F1[0],F1[1],5.5,'#B45309'),dot(F2[0],F2[1],5.5,'#B45309'),dot(M[0],M[1],7,'#15803D','#fff','M'),
   haloTxt(F1[0],F1[1]+20,'F₁','#B45309',11,'middle',800),haloTxt(F2[0],F2[1]+20,'F₂','#B45309',11,'middle',800),
   haloTxt(M[0]+(branch>0?14:-14),M[1]+(my>=0?-12:18),`M(${fmt(mx,1)};${fmt(my,1)})`,'#15803D',10.8,branch>0?'start':'end',800),
   // Side-by-side comparison bars for MF1 and MF2 showing constant difference 2a
   `<g><rect x="434" y="434" width="470" height="34" rx="8" fill="#f7fbfd" stroke="#cde1ec"/>
    <rect x="446" y="440" width="${fmt(wD1,1)}" height="8" rx="4" fill="#1D4ED8"/>
    <rect x="446" y="454" width="${fmt(wD2,1)}" height="8" rx="4" fill="#B45309"/>
    ${txt(640,455,`MF₁ − MF₂ = ${fmt(signedDiff,1)} ⇒ |MF₁ − MF₂| = ${fmt(Math.abs(signedDiff),1)} = 2a`,'#0f6953',10,'start',800)}
   </g>`,
   t>0?pill(408,84,396,22,hypPhases[pIdx-1],'#fff4eb','#f3c299','#b84a18',9.4):'',
   footer10(id,`|MF₁ − MF₂| = 2a = ${fmt(2*p.a,2)} • c = √(a² + b²) = ${fmt(r.c,2)}`,t)
  ].join('');
 }
 const pts=[];for(let y=-4.2;y<=4.2;y+=.2)pts.push(toScreen(y*y/(2*p.p),y).map(v=>fmt(v,2)).join(','));
 const baseY=Number.isFinite(exp?.mY)?exp.mY:2.0;
 const y0=(t>0&&t<5.95)?(-2.8+5.6*ph):baseY,x0=y0*y0/(2*p.p),P=toScreen(x0,y0),F=toScreen(r.focus[0],0),D=toScreen(r.directrix,y0),dx=toScreen(r.directrix,0)[0];
 const dMF=Math.hypot(x0-r.focus[0],y0),rPx=dMF*u;
 const parPhases=[
  `Pha 1: Đặt tiêu điểm F(${fmt(r.focus[0],2)}; 0) và ray đường chuẩn Δ: x = ${fmt(r.directrix,2)}`,
  `Pha 2: Con trượt H chạy dọc ray Δ kéo theo thước vuông góc MH`,
  `Pha 3: Điểm M(${fmt(x0,2)}; ${fmt(y0,2)}) luôn cách đều F và H: MF = MH = ${fmt(dMF,2)}`,
  `Pha 4: Vòng tròn tâm M bán kính MF luôn tiếp xúc đường chuẩn Δ tại H!`
 ];
 return [
  card10('Đường Parabol (P): y² = 2px',id,[
   {t:`(P): y² = 2px = ${fmt(2*p.p,2)}x (p = ${fmt(p.p,2)})`,c:'#1D4ED8',w:800},
   {t:`F(${fmt(r.focus[0],2)}; 0)  |  Δ: x = −p/2 = ${fmt(r.directrix,2)}`,c:'#B45309',w:800},
   {t:`MF = d(M, Δ) = MH = ${fmt(dMF,2)}`,c:'#15803D',w:800}
  ],'Cơ cấu thước chữ T trượt trên đường chuẩn Δ giữ MF = MH.','Khi M chạy trên Parabol, hai thanh MF và MH luôn bằng nhau.'),
  axes(),
  line(dx,92,dx,436,'#B45309',2.8,'6 4'),
  pill(dx-42,442,84,22,`Δ: x = ${fmt(r.directrix,2)}`,'#fff1e6','#f3c299','#c25918',10.2),
  showAux?`<circle cx="${fmt(P[0],2)}" cy="${fmt(P[1],2)}" r="${fmt(rPx,2)}" fill="#15803D" fill-opacity="0.08" stroke="#15803D" stroke-width="1.6" stroke-dasharray="4 3"/>`:'',
  `<polyline points="${pts.join(' ')}" fill="none" stroke="#1D4ED8" stroke-width="3.2"/>`,
  // T-square slider block at H on directrix and equal-length rods MF, MH
  `<rect x="${fmt(D[0]-5,2)}" y="${fmt(D[1]-12,2)}" width="10" height="24" rx="3" fill="#B45309"/>`,
  line(P[0],P[1],F[0],F[1],'#15803D',2.8),line(P[0],P[1],D[0],D[1],'#15803D',2.8),
  rightMark(D[0],D[1],P[0],P[1],dx,88,10,'#B45309'),
  dot(F[0],F[1],6.2,'#B45309','#fff','F'),dot(P[0],P[1],7,'#15803D','#fff','M'),dot(D[0],D[1],5,'#B45309'),
  haloTxt(F[0]+10,F[1]+18,`F(${fmt(r.focus[0],1)};0)`,'#B45309',10.8,'start',800),
  haloTxt(D[0]-12,D[1]+4,'H (trượt)','#B45309',10.5,'end',800),
  haloTxt(P[0]+14,P[1]+(y0>=0?-10:18),`M (MF=MH=${fmt(dMF,2)})`,'#15803D',10.8,'start',800),
  t>0?pill(408,84,396,22,parPhases[pIdx-1],'#fff4eb','#f3c299','#b84a18',9.4):'',
  footer10(id,`M ∈ (P) ⇔ MF = d(M, Δ) = MH = ${fmt(dMF,2)}`,t)
 ].join('');
}
function statsSVG(id,p,m,t,exp){
 const mode=Number(id.split('-C')[1]),r=m.result,pulse=t>0&&t<5.95?1+.02*Math.sin(t*2.2):1,ph=t>0?Math.min(1,Math.max(0,(t%6.0001)/6)):1,pIdx=phaseIndex(t),showAux=exp?.showAux!==false;
 if(mode===4){
  const X=v=>450+((v+5)/15)*430,ex=X(p.exact),es=X(p.estimate),lo=X(p.estimate-p.tolerance),hi=X(p.estimate+p.tolerance);
  const relErr=Math.abs(p.estimate)>1e-8?r.error/Math.abs(p.estimate):null,scanX=lo+(hi-lo)*ph;
  const errPhases=[
   `Pha 1: Đặt kim đo số gần đúng a = ${fmt(p.estimate,2)} và mốc chuẩn ā = ${fmt(p.exact,2)}`,
   `Pha 2: Thước kẹp sai số tuyệt đối Δₐ = |a − ā| = ${fmt(r.error,2)}`,
   `Pha 3: Quét cổng dung sai [a − d; a + d] = [${fmt(p.estimate-p.tolerance,2)}; ${fmt(p.estimate+p.tolerance,2)}] → ${r.ok?'ĐẠT':'VƯỢT NGƯỠNG'}`,
   `Pha 4: Đồng hồ sai số tương đối δₐ = Δₐ / |a| = ${relErr!==null?`${fmt(relErr*100,2)}%`:'Không xác định (a=0)'}`
  ];
  return [
   card10('Số gần đúng & Sai số',id,[
    {t:`a = ${fmt(p.estimate,2)} ± ${fmt(p.tolerance,2)} (Số đúng ā = ${fmt(p.exact,2)})`,c:'#1D4ED8',w:800},
    {t:`Δ_a = |ā − a| = ${fmt(r.error,2)} (${r.ok?'≤ d: ĐẠT':'> d: VƯỢT'})`,c:r.ok?'#15803D':'#B91C1C',w:800},
    {t:`δ_a = Δ_a/|a| = ${relErr!==null?`${fmt(relErr*100,2)}%`:'Không xác định'}`,c:'#B45309',w:800}
   ],'Thước kẹp băng dung sai [a − d; a + d] và cổng kiểm định sai số.','Kéo trực tiếp a hoặc ā trên trục số để kiểm tra băng dung sai.'),
   stageBox(),
   line(436,275,906,275,'#5e7f93',2.8),
   // Caliper tolerance gate [a-d, a+d]
   `<rect x="${fmt(lo,2)}" y="232" width="${fmt(Math.max(4,hi-lo),2)}" height="86" rx="10" fill="${r.ok?'#15803D':'#B91C1C'}" fill-opacity="0.20" stroke="${r.ok?'#15803D':'#B91C1C'}" stroke-width="2.4"/>`,
   line(lo,224,lo,326,r.ok?'#15803D':'#B91C1C',2.6),
   line(hi,224,hi,326,r.ok?'#15803D':'#B91C1C',2.6),
   t>0?line(scanX,226,scanX,324,'#15803D',2.2,'3 3'):'',
   line(es,180,ex,180,r.ok?'#15803D':'#B91C1C',2.8),
   line(es,174,es,275,'#B45309',1.4,'3 3'),
   line(ex,174,ex,275,'#1D4ED8',1.4,'3 3'),
   pill((es+ex)/2-76,136,152,22,`Δₐ = ${fmt(r.error,2)} (${r.ok?'≤ d: Đạt':'> d: Vượt'})`,r.ok?'#e5f7f1':'#fff1f0',r.ok?'#98d9c4':'#f3b5b0',r.ok?'#0f6953':'#b42318',10),
   haloTxt(Math.min(lo,es-42),216,`a−d=${fmt(p.estimate-p.tolerance,2)}`,'#15803D',9.8,'middle',800),
   haloTxt(Math.max(hi,es+42),216,`a+d=${fmt(p.estimate+p.tolerance,2)}`,'#15803D',9.8,'middle',800),
   dot(ex,275,7.6,'#1D4ED8','#fff','exact'),dot(es,275,7.6*pulse,'#B45309','#fff','estimate'),
   haloTxt(ex,348,`ā = ${fmt(p.exact,2)} (kéo)`,'#1D4ED8',11.2,'middle',800),
   haloTxt(es,196,`a = ${fmt(p.estimate,2)} (kéo)`,'#c25918',11.2,'middle',800),
   pill(460,432,424,26,`δₐ = Δₐ / |a| = ${relErr!==null?`${fmt(relErr*100,2)}%`:'Không xác định (a = 0)'}`,'#f7fbfd','#cde1ec','#0f4963',10.5),
   t>0?pill(408,84,396,22,errPhases[pIdx-1],'#fff4eb','#f3c299','#b84a18',9.4):'',
   footer10(id,`a ± d = ${fmt(p.estimate,2)} ± ${fmt(p.tolerance,2)} • Δₐ = ${fmt(r.error,2)}`,t)
  ].join('');
 }
 const minV=Math.min(0,...r.values),maxV=Math.max(18,...r.values),span=Math.max(1,maxV-minV);
 const X=v=>444+((v-minV)/span)*440,actIdx=t>0?Math.floor((t*2.2)%r.values.length):-1;
 const upperFence=r.q3+1.5*r.iqr,isOutlier=r.values.at(-1)>upperFence;
 const yBase=246,yAvg=yBase-((r.avg-minV)/span)*116;
 const xFulcrum=X(r.avg),xMed=X(r.median);
 // Horizontal collision-avoidance for Q1, Me, Q3 labels above the Box-plot
 const xQ1Lbl=Math.min(X(r.q1),xMed-54),xQ3Lbl=Math.max(X(r.q3),xMed+54);
 const statPhases=mode===1?[
  `Pha 1: Sắp xếp các quả nặng mẫu số liệu n = ${r.n} trên thanh cân`,
  `Pha 2: Điểm tựa trọng tâm x̄ = ${fmt(r.avg,2)} cân bằng tổng mô-men độ lệch`,
  `Pha 3: Chốt trung vị Mₑ = ${fmt(r.median,2)} ở chính giữa và Mốt M₀ = ${r.modes.length?r.modes.map(v=>fmt(v,1)).join(', '):'--'}`,
  `Pha 4: Kéo ngoại lệ x₁₀ làm trọng tâm x̄ dịch chuyển mạnh còn Mₑ = ${fmt(r.median,2)} đứng vững!`
 ]:mode===2?[
  `Pha 1: Thước đo khoảng biến thiên R = Max − Min = ${fmt(r.range,2)}`,
  `Pha 2: Chia mẫu bằng 3 vách tứ phân vị Q₁ = ${fmt(r.q1,1)}, Mₑ = ${fmt(r.median,1)}, Q₃ = ${fmt(r.q3,1)}`,
  `Pha 3: Khóa hộp Box-plot chứa 50% dữ liệu trung tâm (Δ_Q = Q₃ − Q₁ = ${fmt(r.iqr,2)})`,
  `Pha 4: Cảnh báo hàng rào ngoại lệ Q₃ + 1.5·Δ_Q = ${fmt(upperFence,2)}`
 ]:[
  `Pha 1: Căng dây chuẩn trung bình cộng x̄ = ${fmt(r.avg,2)}`,
  'Pha 2: Đo các thanh lò xo độ lệch (xᵢ − x̄) từ đỉnh cột tới x̄',
  'Pha 3: Bung các ô vuông diện tích độ lệch (xᵢ − x̄)² ≥ 0',
  `Pha 4: Trung bình diện tích hình vuông ⇒ Phương sai s² = ${fmt(r.variance,2)}, s = ${fmt(r.stddev,2)}`
 ];
 const bars=r.values.map((v,i)=>{
  const h=Math.max(6,((v-minV)/span)*116),x=434+i*47,y=yBase-h,act=i===actIdx,isMode=mode===1&&r.modes.some(mv=>Math.abs(mv-v)<1e-6);
  const devPx=Math.abs(y-yAvg),sqSide=Math.min(38,Math.max(5,devPx*0.46));
  return `<g>
   ${mode===3&&showAux?`<rect x="${fmt(x+17-sqSide/2,2)}" y="${fmt(Math.min(y,yAvg),2)}" width="${fmt(sqSide,2)}" height="${fmt(devPx,2)}" rx="3" fill="#B45309" fill-opacity="0.22" stroke="#B45309" stroke-width="1.2" stroke-dasharray="2 2"/>${line(x+17,y,x+17,yAvg,'#B45309',2,'3 2')}`:''}
   <rect x="${fmt(x,2)}" y="${fmt(y,2)}" width="34" height="${fmt(h,2)}" rx="5" fill="${act?'#15803D':isMode?'#0f6953':i===r.values.length-1?'#B45309':'#1D4ED8'}" fill-opacity="${act?1:.86}"/>
   ${dot(x+17,y,4.8,i===r.values.length-1?'#B45309':'#1D4ED8','#fff',i===r.values.length-1?'outlier':`bar-${i}`)}
   ${haloTxt(x+17,y-8,fmt(v,1),'#143d54',9.8,'middle',800)}
   ${txt(x+17,yBase+15,`x_${i+1}`,'#547387',9.2,'middle',700)}
  </g>`;
 }).join('');
 return [
  card10(mode===1?'Số TB, Trung vị & Mốt':mode===2?'Khoảng biến thiên & Tứ phân vị':'Phương sai & Độ lệch chuẩn',id,[
   {t:`x_TB = ${fmt(r.avg,2)}  |  M_e = ${fmt(r.median,2)}`,c:'#1D4ED8',w:800},
   {t:`Q₁ = ${fmt(r.q1,2)} | Q₂ = ${fmt(r.median,2)} | Q₃ = ${fmt(r.q3,2)} (Δ_Q = ${fmt(r.iqr,2)})`,c:'#15803D',w:800},
   {t:`s² = ${fmt(r.variance,2)}  |  s = ${fmt(r.stddev,2)}`,c:isOutlier?'#B91C1C':'#b84a18',w:800}
  ],'Cơ cấu cân đòn trọng tâm x̄, hộp tứ phân vị Box-plot và ô vuông phương sai.','Tăng giá trị cuối thấy trọng tâm x̄, s lệch mạnh còn M_e, Δ_Q bền vững.'),
  stageBox(),
  line(428,yBase,916,yBase,'#6c8b9e',2),
  bars,
  line(428,yAvg,916,yAvg,'#15803D',2.2,'6 4'),
  pill(416,Math.max(108,Math.min(220,yAvg-22)),98,20,`x̄ = ${fmt(r.avg,2)}`,'#e5f7f1','#98d9c4','#0f6953',10),
  mode===1&&r.modes.length?pill(772,108,142,22,`Mốt M₀ = ${r.modes.map(v=>fmt(v,1)).join(', ')}`,'#eef7fb','#b8d8e8','#1D4ED8',10.2):'',
  mode===3?pill(732,108,184,22,`s² = ${fmt(r.variance,2)} • s = ${fmt(r.stddev,2)}`,'#fff1e6','#f3c299','#c25918',10.2):'',
  // Physical Balance Beam & Fulcrum at x_bar + Box-plot on number line (y=358) with non-colliding labels
  line(432,358,904,358,'#8aa6b8',2),
  line(X(r.values[0]),358,X(r.values.at(-1)),358,'#355c72',2.8),
  line(X(r.values[0]),346,X(r.values[0]),370,'#355c72',2.6),
  line(X(r.values.at(-1)),346,X(r.values.at(-1)),370,'#355c72',2.6),
  `<rect x="${fmt(X(r.q1),2)}" y="338" width="${fmt(Math.max(8,X(r.q3)-X(r.q1)),2)}" height="40" rx="6" fill="#1793b5" fill-opacity="0.24" stroke="#1D4ED8" stroke-width="2.4"/>`,
  line(xMed,338,xMed,378,'#B45309',3.4*pulse),
  // Triangle Fulcrum for Mean x_bar
  `<polygon points="${fmt(xFulcrum,2)},360 ${fmt(xFulcrum-11,2)},382 ${fmt(xFulcrum+11,2)},382" fill="#15803D" stroke="#0b5e4c" stroke-width="1.5"/>`,
  haloTxt(xFulcrum,398,`▲ Trọng tâm x̄ = ${fmt(r.avg,2)}`,'#0f6953',10,'middle',800),
  haloTxt(X(r.values[0]),418,`Min = ${fmt(r.values[0],1)}`,'#4a6b7f',9.8,'start',700),
  haloTxt(xQ1Lbl,328,`Q₁=${fmt(r.q1,1)}`,'#1D4ED8',9.8,'middle',800),
  haloTxt(xMed,328,`Mₑ=${fmt(r.median,1)}`,'#c25918',10,'middle',800),
  haloTxt(xQ3Lbl,328,`Q₃=${fmt(r.q3,1)}`,'#1D4ED8',9.8,'middle',800),
  haloTxt(X(r.values.at(-1)),418,`Max = ${fmt(r.values.at(-1),1)}${isOutlier?' (Ngoại lệ!)':''}`,isOutlier?'#B91C1C':'#4a6b7f',9.8,'end',800),
  mode===2?pill(456,436,428,24,`Khoảng biến thiên R = ${fmt(r.range,2)}  |  Khoảng tứ phân vị Δ_Q = Q₃ − Q₁ = ${fmt(r.iqr,2)}`,'#eef8f5','#98d9c4','#0f6953',10):'',
  t>0?pill(408,84,396,22,statPhases[pIdx-1],'#fff4eb','#f3c299','#b84a18',9.4):'',
  footer10(id,mode===1?`Q₁ = ${fmt(r.q1,2)}, Mₑ = ${fmt(r.median,2)}, Q₃ = ${fmt(r.q3,2)}`:mode===2?`ΔQ = Q₃ − Q₁ = ${fmt(r.iqr,2)} | R = ${fmt(r.range,2)}`:`s² = ${fmt(r.variance,2)}, s = ${fmt(r.stddev,2)}`,t)
 ].join('');
}
function probSVG(id,p,m,t,exp){
 const mode=Number(id.split('-C')[1]),r=m.result,pIdx=phaseIndex(t),showAux=exp?.showAux!==false;
 if(mode===4){
  const n=r.n,coeffs=r.coefficients,kSel=t>0?Math.floor((t*1.8)%(n+1)):Math.min(p.k||1,n);
  const rows=[];
  const maxRow=Math.min(n,6);
  for(let row=0;row<=maxRow;row++){
   const rowVals=[];let c=1;
   for(let j=0;j<=row;j++){if(j>0)c=Math.round(c*(row-j+1)/j);rowVals.push(c);}
   const y=118+row*40,rowSum=2**row;
   rows.push(txt(416,y+4,`n=${row}`,'#607d8b',9.8,'start',700));
   rows.push(pill(858,y-10,64,20,`∑=${rowSum}`,'#eef8f5','#98d9c4','#0f6953',9));
   rowVals.forEach((v,j)=>{
    const x=648+(j-row/2)*48,active=(row===maxRow&&j===Math.min(kSel,maxRow));
    if(showAux&&row===maxRow&&row>0&&j>0&&j<row&&j===Math.min(kSel,maxRow)){
     const py=y-40,px1=648+((j-1)-(row-1)/2)*48,px2=648+(j-(row-1)/2)*48;
     const dropFrac=(t*2.4)%1,d1x=px1+(x-px1)*dropFrac,d1y=py+12+(y-24-py)*dropFrac,d2x=px2+(x-px2)*dropFrac,d2y=py+12+(y-24-py)*dropFrac;
     rows.push(line(px1,py+12,x-5,y-12,'#B45309',2.2,'3 2'),line(px2,py+12,x+5,y-12,'#B45309',2.2,'3 2'));
     if(t>0)rows.push(dot(d1x,d1y,4,'#B45309'),dot(d2x,d2y,4,'#B45309'));
    }
    rows.push(`<g><rect x="${fmt(x-19,2)}" y="${fmt(y-12,2)}" width="38" height="24" rx="7" fill="${active?'#B45309':row===maxRow?'#1D4ED8':'#eef6fb'}" stroke="${active?'#b85314':'#bdd9e8'}"/><text x="${fmt(x,2)}" y="${fmt(y+4,2)}" fill="${row===maxRow||active?'#fff':'#17465f'}" font-size="10.5" font-weight="800" text-anchor="middle">${v}</text></g>`);
   });
  }
  const terms=coeffs.map((c,k)=>`${c}${n-k>0?`a${n-k>1?`^${n-k}`:''}`:''}${k>0?`b${k>1?`^${k}`:''}`:''}`).join(' + ');
  const pascPhases=[
   `Pha 1: Thác số tam giác Pascal chảy từ đỉnh n = 0 xuống hàng n = ${n}`,
   `Pha 2: Hai ô cha gộp hạt tạo ô con Cₙ₋₁ᵏ⁻¹ + Cₙ₋₁ᵏ = Cₙᵏ = ${coeffs[kSel]}`,
   `Pha 3: Gắn hệ số hàng n vào số hạng khai triển (a + b)^${n}`,
   `Pha 4: Tổng hệ số hàng thứ n gấp đôi mỗi tầng: ∑ C_${n}^k = 2^${n} = ${2**n}`
  ];
  return [
   card10('Nhị thức Newton & Pascal',id,[
    {t:`C_${n}^${kSel} = ${coeffs[kSel]}  |  T_${kSel+1} = C_${n}^${kSel} a^${n-kSel} b^${kSel}`,c:'#1D4ED8',w:800},
    {t:`∑ C_${n}^k = 2^${n} = ${2**n}`,c:'#15803D',w:800}
   ],'Thác cộng dồn tam giác Pascal Cₙ₋₁ᵏ⁻¹ + Cₙ₋₁ᵏ = Cₙᵏ và tổng lũy thừa 2ⁿ.','Tăng n để đối chiếu hệ số khai triển (a+b)^n.'),
   stageBox(),
   rows.join(''),
   pill(414,404,510,28,short(`(a + b)^${n} = ${terms}`,62),'#eef7fb','#b8d8e8','#0f4863',10.2),
   pill(460,440,418,24,`Tổng hệ số hàng n = ${n}: ∑ C_${n}^k = 2^${n} = ${2**n}`,'#eef8f5','#98d9c4','#0f6953',10.2),
   t>0?pill(408,84,396,22,pascPhases[pIdx-1],'#fff4eb','#f3c299','#b84a18',9.4):'',
   footer10(id,`(a + b)^${n} = ∑ C_${n}^k a^(${n}−k) b^k • Tổng hệ số = 2^${n} = ${2**n}`,t)
  ].join('');
 }
 const kVal=Math.min(p.k,p.n);
 // Mode 1 (10-11-C01): Dedicated separate models for QUY TẮC CỘNG vs QUY TẮC NHÂN
 if(mode===1){
  const ruleMode=exp?.ruleMode||'add',lockedSub=exp?.lockedSubMode;
  const nA=Math.max(1,Math.min(6,Math.round(p.n))),nB=Math.max(1,Math.min(5,Math.round(kVal)));
  const totalAdd=r.addition,totalMul=r.multiplication;
  const tabHeader=lockedSub==='add'?pill(416,92,508,30,`➕ MÔ HÌNH QUY TẮC CỘNG: Chọn 1 trong 2 phương án độc lập A (${p.n} cách) hoặc B (${kVal} cách) ⇒ N = ${p.n} + ${kVal} = ${totalAdd}`,'#1D4ED8','#1D4ED8','#ffffff',10.4):
   lockedSub==='multiply'?pill(416,92,508,30,`✖ MÔ HÌNH QUY TẮC NHÂN: Thực hiện liên tiếp Bước 1 (${p.n} cách) rồi Bước 2 (${kVal} cách) ⇒ N = ${p.n} × ${kVal} = ${totalMul}`,'#B45309','#B45309','#ffffff',10.4):
   `<g>
   <g data-submodel="add" style="cursor:pointer">
    <rect x="416" y="92" width="246" height="30" rx="9" fill="${ruleMode==='add'?'#1D4ED8':'#eef6fb'}" stroke="#1D4ED8" stroke-width="1.8"/>
    <text x="539" y="111" fill="${ruleMode==='add'?'#ffffff':'#1D4ED8'}" font-size="11" font-weight="800" text-anchor="middle">➕ MÔ HÌNH QUY TẮC CỘNG (${p.n}+${kVal}=${totalAdd})</text>
   </g>
   <g data-submodel="multiply" style="cursor:pointer">
    <rect x="674" y="92" width="250" height="30" rx="9" fill="${ruleMode==='multiply'?'#B45309':'#fff4eb'}" stroke="#B45309" stroke-width="1.8"/>
    <text x="799" y="111" fill="${ruleMode==='multiply'?'#ffffff':'#c25918'}" font-size="11" font-weight="800" text-anchor="middle">✖ MÔ HÌNH QUY TẮC NHÂN (${p.n}×${kVal}=${totalMul})</text>
   </g>
  </g>`;
  let stageContent='';
  if(ruleMode==='add'){
   // Full-stage Parallel Choice Gate for Addition Rule (m + n independent options)
   const activeAdd=Math.floor((t*2.4)%Math.max(1,nA+nB)),flowU=(t*2.4)%1;
   const startPt=[448,278],endPt=[888,278];
   const linesA=[],nodesA=[],linesB=[],nodesB=[];
   for(let i=0;i<nA;i++){
    const cy=160+(i+0.5)*(110/nA),cx=668,isAct=activeAdd===i;
    linesA.push(line(startPt[0],startPt[1],cx-26,cy,isAct?'#15803D':'#9ec8de',isAct?3:1.6),line(cx+26,cy,endPt[0],endPt[1],isAct?'#15803D':'#9ec8de',isAct?3:1.6));
    if(isAct&&t>0){
     const px=flowU<0.5?startPt[0]+(cx-startPt[0])*(flowU*2):cx+(endPt[0]-cx)*((flowU-0.5)*2);
     const py=flowU<0.5?startPt[1]+(cy-startPt[1])*(flowU*2):cy+(endPt[1]-cy)*((flowU-0.5)*2);
     nodesA.push(dot(px,py,5.5,'#15803D'));
    }
    nodesA.push(`<g><rect x="${cx-26}" y="${fmt(cy-11,2)}" width="52" height="22" rx="7" fill="${isAct?'#15803D':'#e6f4fa'}" stroke="#1D4ED8" stroke-width="1.6"/><text x="${cx}" y="${fmt(cy+4,2)}" fill="${isAct?'#fff':'#1D4ED8'}" font-size="10" font-weight="800" text-anchor="middle">Cách A${i+1}</text></g>`);
   }
   for(let j=0;j<nB;j++){
    const cy=300+(j+0.5)*(110/nB),cx=668,isAct=activeAdd===(nA+j);
    linesB.push(line(startPt[0],startPt[1],cx-26,cy,isAct?'#15803D':'#f0c49b',isAct?3:1.6),line(cx+26,cy,endPt[0],endPt[1],isAct?'#15803D':'#f0c49b',isAct?3:1.6));
    if(isAct&&t>0){
     const px=flowU<0.5?startPt[0]+(cx-startPt[0])*(flowU*2):cx+(endPt[0]-cx)*((flowU-0.5)*2);
     const py=flowU<0.5?startPt[1]+(cy-startPt[1])*(flowU*2):cy+(endPt[1]-cy)*((flowU-0.5)*2);
     nodesB.push(dot(px,py,5.5,'#15803D'));
    }
    nodesB.push(`<g><rect x="${cx-26}" y="${fmt(cy-11,2)}" width="52" height="22" rx="7" fill="${isAct?'#15803D':'#fff1e6'}" stroke="#B45309" stroke-width="1.6"/><text x="${cx}" y="${fmt(cy+4,2)}" fill="${isAct?'#fff':'#c25918'}" font-size="10" font-weight="800" text-anchor="middle">Cách B${j+1}</text></g>`);
   }
   stageContent=[
    `<rect x="572" y="138" width="192" height="136" rx="12" fill="#f3fafe" stroke="#b5d8eb" stroke-dasharray="5 3"/>`,
    haloTxt(668,152,`Phương án A (${nA} cách)`,'#1D4ED8',10.5,'middle',800),
    `<rect x="572" y="286" width="192" height="134" rx="12" fill="#fff9f3" stroke="#f2c8a2" stroke-dasharray="5 3"/>`,
    haloTxt(668,300,`Phương án B (${nB} cách)`,'#c25918',10.5,'middle',800),
    linesA.join(''),linesB.join(''),nodesA.join(''),nodesB.join(''),
    `<circle cx="${startPt[0]}" cy="${startPt[1]}" r="18" fill="#1D4ED8"/>`,
    txt(startPt[0],startPt[1]+4,'Chọn 1','#fff',9.5,'middle',800),
    `<circle cx="${endPt[0]}" cy="${endPt[1]}" r="22" fill="#15803D"/>`,
    txt(endPt[0],endPt[1]+4,`${totalAdd}`,'#fff',12,'middle',800),
    pill(436,434,464,28,`Quy tắc Cộng (2 phương án độc lập A hoặc B): N = ${p.n} + ${kVal} = ${totalAdd} cách`,'#eef8f5','#98d9c4','#0f6953',10.5)
   ].join('');
  }else{
   // Full-stage 2-Step Sequential Tree for Multiplication Rule (m x n pairs)
   const activePair=Math.floor((t*2.2)%Math.max(1,nA*nB)),actA=Math.floor(activePair/nB),actB=activePair%nB,branchFrac=(t*2.2)%1;
   const treeLines=[],treeNodes=[];
   const rootX=444,rootY=280,step1X=600,step2X=776;
   for(let i=0;i<nA;i++){
    const y1=146+(i+0.5)*(268/nA),isActA=i===actA;
    treeLines.push(line(rootX,rootY,step1X,y1,isActA?'#1D4ED8':'#bfd6e4',isActA?2.8:1.5));
    if(isActA&&t>0&&branchFrac<0.5){
     const u=branchFrac*2;treeNodes.push(dot(rootX+(step1X-rootX)*u,rootY+(y1-rootY)*u,5.5,'#1D4ED8'));
    }
    treeNodes.push(`<g><circle cx="${step1X}" cy="${fmt(y1,2)}" r="12" fill="${isActA?'#1D4ED8':'#e6f4fa'}" stroke="#1D4ED8" stroke-width="1.8"/><text x="${step1X}" y="${fmt(y1+3.5,2)}" fill="${isActA?'#fff':'#1D4ED8'}" font-size="9.8" font-weight="800" text-anchor="middle">A${i+1}</text></g>`);
    for(let j=0;j<nB;j++){
     const spanY=(240/nA),y2=y1-spanY*0.36+(nB>1?j*(spanY*0.72)/(nB-1):0),isAct=(i===actA&&j===actB);
     treeLines.push(line(step1X+12,y1,step2X,y2,isAct?'#B45309':'#d2e1ea',isAct?2.6:1.2));
     if(isAct&&t>0&&branchFrac>=0.5){
      const u=(branchFrac-0.5)*2;treeNodes.push(dot(step1X+12+(step2X-step1X-12)*u,y1+(y2-y1)*u,5.5,'#B45309'));
     }
     treeNodes.push(`<circle cx="${step2X}" cy="${fmt(y2,2)}" r="${isAct?6:3.6}" fill="${isAct?'#B45309':'#15803D'}"/>`);
     if(isAct)treeNodes.push(pill(step2X+12,y2-11,126,22,`Bộ (A_${i+1}, B_${j+1})`,'#fff1e6','#f2c199','#c25918',10.2));
    }
   }
   stageContent=[
    haloTxt(600,140,`Bước 1 (${nA} cách)`,'#1D4ED8',10.2,'middle',800),
    haloTxt(776,140,`Bước 2 (${nB} cách/nhánh)`,'#c25918',10.2,'middle',800),
    treeLines.join(''),
    `<circle cx="${rootX}" cy="${rootY}" r="14" fill="#154c68"/>`,
    txt(rootX,rootY+3.5,'Gốc','#fff',8.8,'middle',800),
    treeNodes.join(''),
    pill(436,434,464,28,`Quy tắc Nhân (2 công đoạn liên tiếp A rồi B): N = ${p.n} × ${kVal} = ${totalMul} cách`,'#fff1e6','#f2c199','#c25918',10.5)
   ].join('');
  }
  const countPhases=[
   `Pha 1: Khởi tạo tập A (${p.n} lựa chọn) và tập B (${kVal} lựa chọn)`,
   `Pha 2: Cổng rẽ độc lập (Quy tắc Cộng) ⇒ ${p.n} + ${kVal} = ${totalAdd} cách`,
   `Pha 3: Hạt chảy qua 2 tầng liên tiếp (Quy tắc Nhân) ⇒ ${p.n} × ${kVal} = ${totalMul} nhánh`,
   `Pha 4: Đối chiếu trực quan: Cộng = ${totalAdd} cách vs Nhân = ${totalMul} bộ`
  ];
  return [
   card10('Quy tắc cộng & Quy tắc nhân',id,[
    {t:`Quy tắc cộng: ${p.n} + ${kVal} = ${totalAdd} cách`,c:'#1D4ED8',w:800},
    {t:`Quy tắc nhân: ${p.n} × ${kVal} = ${totalMul} cách`,c:'#B45309',w:800}
   ],'Tách riêng mô hình Cổng Cộng (song song) và Cây Nhân (2 bước liên tiếp).','Bấm chọn tab Quy tắc Cộng hoặc Quy tắc Nhân để xem mô hình riêng.'),
   stageBox(),
   tabHeader,
   stageContent,
   t>0?pill(408,84,396,22,countPhases[pIdx-1],'#fff4eb','#f3c299','#b84a18',9.4):'',
   footer10(id,`Cộng: ${totalAdd} cách • Nhân: ${totalMul} cách`,t)
  ].join('');
 }
 // Mode 2 (10-11-C02): 3 Visually Distinct Interactive Models for HOÁN VỊ P_n, CHỈNH HỢP A_n^k, TỔ HỢP C_n^k
 if(mode===2){
  const combTab=exp?.combTab||(exp?.orderMode==='unordered'?'C':exp?.orderMode==='perm'?'P':'A'),lockedSub=exp?.lockedSubMode;
  const n=Math.round(p.n),k=Math.round(kVal),factK=Math.max(1,Math.round(r.arrangements/Math.max(1,r.combinations)));
  const stepIdx=Math.floor(t*1.6)+(exp?.permStep||0);
  const PAL=['#1D4ED8','#B45309','#15803D','#7c3aed','#dc2626','#0284c7','#ca8a04','#0f766e','#be185d'];
  const tabHeader=lockedSub==='P'?pill(410,90,518,30,`🔢 MÔ HÌNH HOÁN VỊ Pₙ = ${n}! = ${r.permutations} (Xếp hết n = ${n} phần tử)`,'#1D4ED8','#1D4ED8','#ffffff',10.4):
   lockedSub==='A'?pill(410,90,518,30,`🏆 MÔ HÌNH CHỈNH HỢP Aₙᵏ = ${r.arrangements} (Chọn k = ${k} từ n = ${n} xếp thứ tự)`,'#B45309','#B45309','#ffffff',10.4):
   lockedSub==='C'?pill(410,90,518,30,`🧺 MÔ HÌNH TỔ HỢP Cₙᵏ = ${r.combinations} (Chọn k = ${k} từ n = ${n} không thứ tự)`,'#15803D','#15803D','#ffffff',10.4):
   `<g>
   <g data-submodel="P" style="cursor:pointer">
    <rect x="414" y="90" width="164" height="30" rx="9" fill="${combTab==='P'?'#1D4ED8':'#eef6fb'}" stroke="#1D4ED8" stroke-width="1.8"/>
    <text x="496" y="109" fill="${combTab==='P'?'#fff':'#1D4ED8'}" font-size="10.5" font-weight="800" text-anchor="middle">🔢 Hoán vị Pₙ = ${r.permutations}</text>
   </g>
   <g data-submodel="A" style="cursor:pointer">
    <rect x="586" y="90" width="168" height="30" rx="9" fill="${combTab==='A'?'#B45309':'#fff4eb'}" stroke="#B45309" stroke-width="1.8"/>
    <text x="670" y="109" fill="${combTab==='A'?'#fff':'#c25918'}" font-size="10.5" font-weight="800" text-anchor="middle">🏆 Chỉnh hợp Aₙᵏ = ${r.arrangements}</text>
   </g>
   <g data-submodel="C" style="cursor:pointer">
    <rect x="762" y="90" width="164" height="30" rx="9" fill="${combTab==='C'?'#15803D':'#eef8f5'}" stroke="#15803D" stroke-width="1.8"/>
    <text x="844" y="109" fill="${combTab==='C'?'#fff':'#0f6953'}" font-size="10.5" font-weight="800" text-anchor="middle">🧺 Tổ hợp Cₙᵏ = ${r.combinations}</text>
   </g>
  </g>`;
  let stageContent='';
  if(combTab==='P'){
   // ==================== 1. MÔ HÌNH HOÁN VỊ P_n = n! ====================
   const visN=Math.min(n,6);
   const baseArr=Array.from({length:visN},(_,i)=>i+1);
   const samplePerms=[];
   const genPerms=(arr,l=0)=>{
    if(samplePerms.length>=6)return;
    if(l===arr.length-1){samplePerms.push([...arr]);return;}
    for(let i=l;i<arr.length;i++){
     [arr[l],arr[i]]=[arr[i],arr[l]];
     genPerms(arr,l+1);
     [arr[l],arr[i]]=[arr[i],arr[l]];
    }
   };
   genPerms([...baseArr],0);
   const activePermIdx=stepIdx%Math.max(1,samplePerms.length);
   const curPerm=samplePerms[activePermIdx]||baseArr;
   const swapA=stepIdx%Math.max(1,visN-1),swapB=swapA+1;
   const slotW=Math.min(46,Math.floor((280-(visN-1)*6)/visN)),startX=416+Math.max(0,Math.floor((280-visN*slotW-(visN-1)*6)/2));
   const xA=startX+swapA*(slotW+6)+slotW/2,xB=startX+swapB*(slotW+6)+slotW/2,midSwapX=(xA+xB)/2;
   const swapArcs=`<g>
    <path d="M ${fmt(xA,1)} 180 Q ${fmt(midSwapX,1)} 148 ${fmt(xB,1)} 180" fill="none" stroke="#B45309" stroke-width="2.4" stroke-dasharray="4 2"/>
    <path d="M ${fmt(xB,1)} 238 Q ${fmt(midSwapX,1)} 268 ${fmt(xA,1)} 238" fill="none" stroke="#15803D" stroke-width="2.4" stroke-dasharray="4 2"/>
    ${pill(Math.max(414,Math.min(586,midSwapX-56)),132,112,20,`⇄ VT${swapA+1} ↔ VT${swapB+1}`,'#fff4eb','#B45309','#c25918',9.2)}
   </g>`;
   const pCards=curPerm.map((val,i)=>{
    const x=startX+i*(slotW+6),isSwapping=(i===swapA||i===swapB),col=PAL[(val-1)%PAL.length];
    const barH=Math.max(14,Math.round(((n-i)/n)*68));
    return `<g>
     <rect x="${x}" y="182" width="${slotW}" height="52" rx="9" fill="${col}" stroke="${isSwapping?'#fde047':'#ffffff'}" stroke-width="${isSwapping?3:1.8}"/>
     ${txt(x+slotW/2,198,`VT ${i+1}`,'#e0f2fe',8.6,'middle',700)}
     ${txt(x+slotW/2,221,`${String.fromCharCode(64+val)}${val}`,'#ffffff',12.5,'middle',900)}
     <rect x="${x+5}" y="${354-barH}" width="${slotW-10}" height="${barH}" rx="4" fill="#1D4ED8" fill-opacity="${fmt(0.35+0.65*(n-i)/n,2)}" stroke="#1D4ED8"/>
     ${txt(x+slotW/2,372,`${n-i} cách`,'#1D4ED8',8.8,'middle',800)}
    </g>`;
   }).join('');
   const permRows=samplePerms.map((arr,idx)=>{
    const y=164+idx*32,isCur=idx===activePermIdx;
    const str=arr.map(v=>`${String.fromCharCode(64+v)}${v}`).join('–');
    return `<g data-perm-idx="${idx}" style="cursor:pointer">
     <rect x="716" y="${y}" width="206" height="26" rx="7" fill="${isCur?'#1D4ED8':'#ffffff'}" stroke="${isCur?'#1D4ED8':'#cde1ec'}" stroke-width="1.5"/>
     ${txt(726,y+17,`#${idx+1}`,isCur?'#bae6fd':'#64748b',9.2,'start',800)}
     ${txt(826,y+17,str,isCur?'#ffffff':'#0f4963',9.8,'middle',800)}
    </g>`;
   }).join('');
   const facChain=Array.from({length:n},(_,i)=>n-i).join(' × ');
   stageContent=[
    `<rect x="408" y="126" width="296" height="264" rx="12" fill="#f5fafe" stroke="#b9d9eb"/>`,
    swapArcs,
    pCards,
    `<rect x="708" y="126" width="222" height="264" rx="12" fill="#f8fafc" stroke="#cbd5e1"/>`,
    haloTxt(819,148,`Bảng hoán vị sinh ra (P_${n} = ${r.permutations}):`,'#0f4963',9.8,'middle',800),
    permRows,
    r.permutations>samplePerms.length?txt(819,374,`... +${r.permutations-samplePerms.length} hoán vị khác`,'#c25918',9.2,'middle',800):'',
    pill(408,400,522,32,`Công thức: P_${n} = ${facChain} = ${n}! = ${r.permutations} hoán vị (Dùng hết ${n} phần tử)`,'#eef7fb','#1D4ED8','#1D4ED8',10.6)
   ].join('');
  }else if(combTab==='A'){
   // ==================== 2. MÔ HÌNH CHỈNH HỢP A_n^k = n!/(n-k)! ====================
   const visN=Math.min(n,8),visK=Math.min(k,5),leftOut=Math.max(0,n-k);
   const sampleArrs=[];
   const baseSubsets=[];
   const genSub=(start,curr)=>{
    if(baseSubsets.length>=6)return;
    if(curr.length===k){baseSubsets.push([...curr]);return;}
    for(let i=start;i<=n;i++){curr.push(i);genSub(i+1,curr);curr.pop();}
   };
   genSub(1,[]);
   for(const sub of baseSubsets){
    if(sampleArrs.length>=6)break;
    sampleArrs.push([...sub]);
    if(k>=2&&sampleArrs.length<6){
     sampleArrs.push([sub[1],sub[0],...sub.slice(2)]);
    }
   }
   if(!sampleArrs.length)sampleArrs.push(Array.from({length:k},(_,i)=>i+1));
   const activeArrIdx=stepIdx%sampleArrs.length;
   const chosen=sampleArrs[activeArrIdx]||sampleArrs[0];
   const isSwappedPair=(k>=2&&(activeArrIdx%2)===1);
   const manualStep=exp?.arrStep||0;
   const animStep=t>0?Math.min(visK,Math.max(1,Math.ceil((t/4.5)*visK))):0;
   const activeSeatsCount=manualStep>0?Math.min(visK,manualStep):(animStep>0?animStep:visK);
   const activeChosen=chosen.slice(0,activeSeatsCount);
   const seatOfVal=new Map();
   activeChosen.forEach((val,sIdx)=>seatOfVal.set(val,sIdx));
   const fullChosenSet=new Set(chosen);
   // Hàng 1: n ứng viên (y = 150) — gọn thoáng, không có tiêu đề chèn giữa đường mũi tên
   const candGap=Math.min(36,Math.floor(264/Math.max(1,visN)));
   const candStartX=430+Math.max(0,Math.floor((264-(visN-1)*candGap)/2));
   const candCoords=Array.from({length:visN},(_,i)=>[candStartX+i*candGap,150]);
   // Hàng 2: k Ghế xếp hạng (y = 226)
   const seatGap=visK<=2?24:visK===3?14:visK===4?8:5;
   const seatW=Math.min(80,Math.floor((284-(visK-1)*seatGap)/Math.max(1,visK)));
   const seatStartX=418+Math.max(0,Math.floor((284-visK*seatW-(visK-1)*seatGap)/2));
   const seatCoords=Array.from({length:visK},(_,i)=>[seatStartX+i*(seatW+seatGap)+seatW/2,226]);
   const candNodes=Array.from({length:visN},(_,i)=>{
    const val=i+1,letter=String.fromCharCode(64+val),col=PAL[i%PAL.length];
    const [cx,cy]=candCoords[i];
    const assignedSeat=seatOfVal.has(val)?seatOfVal.get(val):-1;
    const isRejected=(activeSeatsCount===visK)&&!fullChosenSet.has(val);
    return `<g>
     <circle cx="${cx}" cy="${cy}" r="13" fill="${assignedSeat>=0?col:isRejected?'#f1f5f9':'#e0f2fe'}" stroke="${assignedSeat>=0?'#ffffff':isRejected?'#94a3b8':'#0284c7'}" stroke-width="2"/>
     <text x="${cx}" y="${cy+4}" fill="${assignedSeat>=0?'#ffffff':isRejected?'#94a3b8':'#0369a1'}" font-size="11" font-weight="900" text-anchor="middle">${letter}</text>
     ${isRejected?line(cx-8,cy-8,cx+8,cy+8,'#ef4444',1.8):''}
    </g>`;
   }).join('');
   // Đường mũi tên nối thoáng 100% từ ứng viên xuống ghế (y = 164..224 không có chữ cản)
   const assignArrows=activeChosen.slice(0,visK).map((val,sIdx)=>{
    const cIdx=Math.min(visN-1,Math.max(0,val-1));
    const [x1,y1]=candCoords[cIdx],[x2,y2]=seatCoords[sIdx];
    const col=PAL[cIdx%PAL.length],midX=(x1+x2)/2,midY=194+(sIdx%2)*7;
    const isCurrentStep=(manualStep>0&&sIdx===activeSeatsCount-1);
    return `<g>
     <path d="M ${fmt(x1,1)} ${y1+14} C ${fmt(x1,1)} 188, ${fmt(x2,1)} 192, ${fmt(x2,1)} ${y2-2}" fill="none" stroke="${col}" stroke-width="${isCurrentStep?3.2:2.2}" stroke-dasharray="${isCurrentStep?'none':'4 2'}"/>
     <polygon points="${fmt(x2,1)},${y2} ${fmt(x2-4.5,1)},${y2-8} ${fmt(x2+4.5,1)},${y2-8}" fill="${col}"/>
     <circle cx="${fmt(midX,1)}" cy="${fmt(midY,1)}" r="8" fill="${col}" stroke="#fff" stroke-width="1.4"/>
     ${txt(midX,midY+3,`${sIdx+1}`,'#fff',8.2,'middle',900)}
    </g>`;
   }).join('');
   const rankTitles=['🥇 Hạng 1','🥈 Hạng 2','🥉 Hạng 3','🏅 Hạng 4','🎖 Hạng 5'];
   const podiums=Array.from({length:visK},(_,i)=>{
    const sx=seatStartX+i*(seatW+seatGap),sy=226,sh=74;
    const isFilled=i<activeSeatsCount,isNext=i===activeSeatsCount;
    const val=chosen[i]||1,letter=String.fromCharCode(64+val),col=isFilled?PAL[(val-1)%PAL.length]:'#94a3b8';
    const ways=n-i;
    return `<g>
     <rect x="${sx}" y="${sy}" width="${seatW}" height="${sh}" rx="9" fill="${isFilled?'#ffffff':isNext?'#fffbeb':'#f8fafc'}" stroke="${isFilled?col:isNext?'#f59e0b':'#cbd5e1'}" stroke-width="${isFilled||isNext?2.3:1.5}"/>
     <rect x="${sx}" y="${sy}" width="${seatW}" height="18" rx="8" fill="${isFilled?col:'#e2e8f0'}"/>
     ${txt(sx+seatW/2,sy+12.5,rankTitles[i]||`Hạng ${i+1}`,isFilled?'#ffffff':'#475569',8.5,'middle',800)}
     <circle cx="${fmt(sx+seatW/2,1)}" cy="${sy+37}" r="12.5" fill="${isFilled?col:'#f1f5f9'}" stroke="${isFilled?'#fff':'#94a3b8'}" stroke-width="1.8"/>
     ${txt(sx+seatW/2,sy+41.5,isFilled?letter:'?',isFilled?'#ffffff':'#64748b',11,'middle',900)}
     ${pill(sx+4,sy+53,seatW-8,16,`${ways} cách`,isFilled?'#fff7ed':'#f1f5f9',isFilled?'#ea580c':'#cbd5e1',isFilled?'#c2410c':'#64748b',8.4)}
     ${i<visK-1?txt(sx+seatW+seatGap/2,sy+42,'×','#B45309',13,'middle',900):''}
    </g>`;
   }).join('');
   // Hàng 3: Thanh giai thừa [n]..[1] & KHO LOẠI BỎ (n - k)
   const facBoxW=Math.min(22,Math.floor(156/Math.max(1,visN)));
   const facBoxes=Array.from({length:visN},(_,i)=>{
    const factor=n-i,inK=i<k,fx=416+i*(facBoxW+3),fy=342;
    return `<g>
     <rect x="${fx}" y="${fy}" width="${facBoxW}" height="22" rx="5" fill="${inK?'#ea580c':'#e2e8f0'}" stroke="${inK?'#c2410c':'#94a3b8'}" stroke-width="1.4"/>
     ${txt(fx+facBoxW/2,fy+14.5,`${factor}`,inK?'#ffffff':'#64748b',9.2,'middle',800)}
     ${!inK?line(fx+2,fy+20,fx+facBoxW-2,fy+2,'#dc2626',1.8):''}
    </g>`;
   }).join('');
   const leftoverLetters=Array.from({length:n},(_,i)=>i+1).filter(v=>!fullChosenSet.has(v)).map(v=>String.fromCharCode(64+v));
   const arrChain=Array.from({length:k},(_,i)=>n-i).join(' × ');
   const partialWays=Array.from({length:activeSeatsCount},(_,i)=>n-i).reduce((a,b)=>a*b,1);
   const partialChain=Array.from({length:activeSeatsCount},(_,i)=>n-i).join(' × ');
   const arrRows=sampleArrs.map((arr,idx)=>{
    const y=160+idx*29,isCur=idx===activeArrIdx;
    const pairPartner=(k>=2)?(idx%2===0?idx+1:idx-1):-1;
    const isPartner=(pairPartner===activeArrIdx);
    const labelStr=arr.slice(0,4).map((v,s)=>`G${s+1}:${String.fromCharCode(64+v)}`).join(' ');
    return `<g data-perm-idx="${idx}" style="cursor:pointer">
     <rect x="724" y="${y}" width="200" height="25" rx="6" fill="${isCur?'#B45309':isPartner?'#fff7ed':'#ffffff'}" stroke="${isCur?'#c2410c':isPartner?'#fdba74':'#cbd5e1'}" stroke-width="1.5"/>
     ${txt(733,y+16,`#${idx+1}`,isCur?'#ffedd5':'#64748b',9,'start',800)}
     ${txt(832,y+16,`(${labelStr})`,isCur?'#ffffff':'#0f4963',9.2,'middle',800)}
    </g>`;
   }).join('');
   const pairA=sampleArrs[activeArrIdx-(activeArrIdx%2)]||chosen;
   const pairB=sampleArrs[activeArrIdx-(activeArrIdx%2)+1]||chosen;
   const strPairA=pairA.slice(0,3).map(v=>String.fromCharCode(64+v)).join(',');
   const strPairB=pairB.slice(0,3).map(v=>String.fromCharCode(64+v)).join(',');
   const bottomFormula=manualStep>0
    ?`Bước ${activeSeatsCount}/${k}: Ghế ${activeSeatsCount} có ${n-activeSeatsCount+1} cách ⇒ ${partialChain} = ${partialWays}`
    :isSwappedPair
    ?`⇄ Đảo ghế: (${strPairA}) ≠ (${strPairB}) ⇒ 2 chỉnh hợp khác nhau!`
    :`Công thức: A_${n}^${k} = ${n}! / (${n}−${k})! = ${arrChain} = ${r.arrangements} chỉnh hợp`;
   stageContent=[
    `<rect x="408" y="126" width="304" height="264" rx="12" fill="#fffaf5" stroke="#f3c299" stroke-width="1.5"/>`,
    candNodes,
    assignArrows,
    podiums,
    `<rect x="414" y="314" width="292" height="68" rx="9" fill="#fefce8" stroke="#fde047" stroke-width="1.4"/>`,
    txt(420,332,`Khử (${n}−${k})! = ${leftOut}! ở mẫu số:`,'#854d0e',8.8,'start',800),
    facBoxes,
    `<rect x="582" y="320" width="118" height="56" rx="8" fill="#fef2f2" stroke="#f87171" stroke-dasharray="4 2" stroke-width="1.4"/>`,
    txt(641,336,`KHO LOẠI BỎ (${leftOut} dư)`,'#b91c1c',8.2,'middle',800),
    pill(590,344,102,22,leftOut>0?`Dư: ${leftoverLetters.slice(0,4).join(', ')}`:`Dư: 0`,'#ffffff','#fca5a5','#b91c1c',8.6),
    `<rect x="716" y="126" width="214" height="264" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>`,
    haloTxt(823,146,`BẢNG CHỈNH HỢP A_${n}^${k} = ${r.arrangements}`,'#c2410c',9.6,'middle',800),
    arrRows,
    pill(724,348,198,28,k>=2?`Đảo ghế: (${strPairA}) ≠ (${strPairB})`:`Chọn 1 ghế từ ${n} người`,'#fffbeb','#f59e0b','#b91c1c',8.8),
    pill(408,400,522,32,bottomFormula,'#fff7ed','#ea580c','#9a3412',10.2)
   ].join('');
  }else{
   // ==================== 3. MÔ HÌNH TỔ HỢP C_n^k = A_n^k / k! ====================
   const allSubsets=[];
   const buildComb=(start,curr)=>{
    if(allSubsets.length>=12)return;
    if(curr.length===k){allSubsets.push([...curr]);return;}
    for(let i=start;i<=n;i++){curr.push(i);buildComb(i+1,curr);curr.pop();}
   };
   buildComb(1,[]);
   const activeSubIdx=stepIdx%Math.max(1,allSubsets.length);
   const curSub=allSubsets[activeSubIdx]||Array.from({length:k},(_,i)=>i+1);
   const tuple1=[...curSub];
   const tuple2=curSub.length>=2?[curSub[1],curSub[0],...curSub.slice(2)]:[...curSub];
   const tuple3=curSub.length>=3?[curSub[2],curSub[0],curSub[1],...curSub.slice(3)]:(curSub.length===2?[curSub[1],curSub[0]]:[...curSub]);
   const tupleList=k===1?[`(${tuple1.join(',')})`]:k===2?[`(${tuple1.join(',')})`,`(${tuple2.join(',')})`]:[
    `(${tuple1.join(',')})`,
    `(${tuple2.join(',')})`,
    `(${tuple3.join(',')})`,
    `... (${factK} bộ trùng)`
   ];
   const leftTuples=tupleList.map((s,idx)=>{
    const y=174+idx*38;
    return `<g>${pill(416,y,134,26,s,'#fff1e6','#B45309','#c25918',9.5)}${line(550,y+13,604,242,'#15803D',2,'4 3')}</g>`;
   }).join('');
   const bagCx=654,bagCy=242,bagR=48,rotOffset=t*1.4+(exp?.bagSpin||0)*1.1;
   const ringBalls=curSub.map((val,i)=>{
    const ang=-Math.PI/2+rotOffset+(i*2*Math.PI)/Math.max(1,curSub.length);
    const bx=bagCx+Math.cos(ang)*(curSub.length===1?0:28),by=bagCy+Math.sin(ang)*(curSub.length===1?0:28);
    return `<g><circle cx="${fmt(bx,1)}" cy="${fmt(by,1)}" r="12" fill="#15803D" stroke="#fff" stroke-width="2"/><text x="${fmt(bx,1)}" y="${fmt(by+4,1)}" fill="#fff" font-size="10" font-weight="800" text-anchor="middle">${val}</text></g>`;
   }).join('');
   const subPills=allSubsets.slice(0,10).map((sub,idx)=>{
    const col=idx%2,row=Math.floor(idx/2),x=730+col*96,y=164+row*32,isAct=idx===activeSubIdx;
    return `<g data-perm-idx="${idx}" style="cursor:pointer">${pill(x,y,90,25,`{${sub.join(',')}}`,isAct?'#15803D':'#ffffff',isAct?'#0f6953':'#98d9c4',isAct?'#ffffff':'#0f6953',9.4)}</g>`;
   }).join('');
   stageContent=[
    `<rect x="408" y="126" width="308" height="264" rx="12" fill="#f2fbf7" stroke="#98d9c4"/>`,
    txt(484,150,`${k}! = ${factK} chỉnh hợp trùng:`,'#c25918',9.4,'middle',800),
    leftTuples,
    pill(562,230,42,24,`÷ ${k}!`,'#fef08a','#ca8a04','#854d0e',9.5),
    `<circle cx="${bagCx}" cy="${bagCy}" r="${bagR}" fill="#dcfce7" stroke="#15803D" stroke-width="2.8" stroke-dasharray="6 3"/>`,
    ringBalls,
    txt(bagCx,176,`GIỎ TẬP HỢP`,'#0f6953',9.4,'middle',800),
    pill(598,304,112,26,`{ ${curSub.join(', ')} }`,'#15803D','#0f6953','#ffffff',10.2),
    txt(562,366,`Không phân biệt thứ tự ({1,2} ≡ {2,1})`,'#0f6953',9.2,'middle',800),
    `<rect x="722" y="126" width="208" height="264" rx="12" fill="#f8fafc" stroke="#cbd5e1"/>`,
    txt(826,148,`Danh sách C_${n}^${k} = ${r.combinations} tập con:`,'#0f4963',9.6,'middle',800),
    subPills,
    r.combinations>10?txt(826,356,`... +${r.combinations-10} tập con khác`,'#0f6953',9,'middle',800):txt(826,356,`Đủ ${r.combinations} tập con phân biệt`,'#0f6953',9,'middle',800),
    pill(408,400,522,32,`Công thức: C_${n}^${k} = A_${n}^${k} / ${k}! = ${r.arrangements} / ${factK} = ${r.combinations} tổ hợp`,'#eef7fb','#1D4ED8','#1D4ED8',10.6)
   ].join('');
  }
  const combPhases=combTab==='P'?[
   `Pha 1: Lấy toàn bộ n = ${n} phần tử xếp vào đủ ${n} vị trí`,
   `Pha 2: Đổi chỗ cặp phần tử bất kỳ sinh ra hoán vị mới`,
   `Pha 3: Tháp nhân giai thừa ${n} × ${n-1} × ... × 1`,
   `Pha 4: Tổng số hoán vị P_${n} = ${n}! = ${r.permutations}`
  ]:combTab==='A'?[
   `Pha 1: Chọn k = ${k} phần tử từ n = ${n} ứng viên (Loại bỏ ${n-k} phần tử thừa)`,
   `Pha 2: Xếp vào k vị trí cấp bậc Hạng 1, Hạng 2... có phân biệt thứ tự`,
   `Pha 3: Đổi vị trí trên bục trao giải tạo ra chỉnh hợp mới`,
   `Pha 4: Tổng số chỉnh hợp A_${n}^${k} = ${n}!/(${n}-${k})! = ${r.arrangements}`
  ]:[
   `Pha 1: Chọn ra k = ${k} phần tử từ n = ${n} phần tử`,
   `Pha 2: Gom cả ${k}! = ${factK} thứ tự trùng nhau qua phễu khử thứ tự (÷ ${k}!)`,
   `Pha 3: Đưa vào Giỏ tròn tập hợp { ... } không phân biệt vị trí`,
   `Pha 4: Tổng số tập con C_${n}^${k} = A_${n}^${k} / ${k}! = ${r.combinations}`
  ];
  return [
   card10('Hoán vị, Chỉnh hợp & Tổ hợp',id,[
    {t:`P_${n} = ${n}! = ${r.permutations} | A_${n}^${k} = ${r.arrangements} | C_${n}^${k} = ${r.combinations}`,c:'#1D4ED8',w:800},
    {t:`Quan hệ: A_${n}^${k} = k! · C_${n}^${k} = ${factK} × ${r.combinations}`,c:'#15803D',w:800}
   ],'Tách riêng 3 cơ cấu: Bàn Đổi Chỗ Hoán vị Pₙ, Bục Cấp Bậc Chỉnh hợp Aₙᵏ và Giỏ Tròn Tổ hợp Cₙᵏ.','Tương tác đổi chỗ hoặc xoay giỏ để thấy rõ sự khác biệt về thứ tự.'),
   stageBox(),
   tabHeader,
   stageContent,
   t>0?pill(408,84,396,22,combPhases[pIdx-1],'#fff4eb','#f3c299','#b84a18',9.4):'',
   footer10(id,`A_${n}^${k} = k! · C_${n}^${k} = ${r.arrangements}`,t)
  ].join('');
 }
  // Mode 3 (10-11-C03): Mô hình Hộp rút bóng đồng khả năng Ω & Bục kết quả rút ngẫu nhiên (SGK Toán 10 Bài 26)
  // Chu kì 4 giây: 2s đầu xóc hộp và rút ngẫu nhiên + 2s sau đặt bóng lên bục kết quả để học sinh đối chiếu biến cố A
  const triesCount=Number.isFinite(exp?.tries)?exp.tries:(r.experiment?.tries||0);
  const q=grade10Experiment(id,p,triesCount,exp?.seed||20261026);
  const wanted=Math.min(p.wanted,p.n),probTheory=wanted/p.n;
  const outs=q.outcomes||[];
  const cycle=t%4,roundIdx=Math.floor(t/4);
  const isSpinning=t>0&&cycle<2.0;
  const activeBall=outs.length?outs[outs.length-1]:((roundIdx%p.n)+1);
  const isFavorable=activeBall<=wanted;
  const defsGrad=`<defs>
   <radialGradient id="g10-ball-green" cx="35%" cy="35%" r="65%">
    <stop offset="0%" stop-color="#a7f3d0"/>
    <stop offset="50%" stop-color="#10b981"/>
    <stop offset="100%" stop-color="#047857"/>
   </radialGradient>
   <radialGradient id="g10-ball-white" cx="35%" cy="35%" r="65%">
    <stop offset="0%" stop-color="#ffffff"/>
    <stop offset="65%" stop-color="#e2e8f0"/>
    <stop offset="100%" stop-color="#94a3b8"/>
   </radialGradient>
   <radialGradient id="g10-ball-amber" cx="35%" cy="35%" r="65%">
    <stop offset="0%" stop-color="#fef3c7"/>
    <stop offset="50%" stop-color="#f59e0b"/>
    <stop offset="100%" stop-color="#b45309"/>
   </radialGradient>
  </defs>`;

  // 1. Left Panel: Transparent Ball Urn + Result Podium (x=414..648, y=118..438)
  const podCx=531,podCy=182,podR=23;
  let podiumBall='';
  if(q.tries===0&&t===0){
   podiumBall=`<circle cx="${podCx}" cy="${podCy}" r="${podR+4}" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="4 3"/>
   <text x="${podCx}" y="${podCy+6}" font-size="16" font-weight="800" fill="#94a3b8" text-anchor="middle" font-family="Inter,sans-serif">?</text>`;
  }else if(isSpinning){
   const jx=podCx+Math.sin(t*18)*3,jy=podCy+Math.cos(t*18)*2.5;
   podiumBall=`<circle cx="${podCx}" cy="${podCy}" r="${podR+6}" fill="#fef3c7" stroke="#f59e0b" stroke-width="2.4" stroke-dasharray="6 3"/>
   <circle cx="${fmt(jx,1)}" cy="${fmt(jy,1)}" r="${podR}" fill="url(#g10-ball-amber)" stroke="#b45309" stroke-width="2"/>
   <text x="${podCx}" y="${podCy+5}" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle" font-family="Inter,sans-serif">Rút...</text>`;
  }else{
   const bgRing=isFavorable?'#d1fae5':'#fee2e2',bdRing=isFavorable?'#10b981':'#ef4444';
   const ballFill=isFavorable?'url(#g10-ball-green)':'url(#g10-ball-white)';
   const txtCol=isFavorable?'#ffffff':'#1e293b';
   podiumBall=`<circle cx="${podCx}" cy="${podCy}" r="${podR+7}" fill="${bgRing}" stroke="${bdRing}" stroke-width="2.6"/>
   <circle cx="${podCx}" cy="${podCy}" r="${podR}" fill="${ballFill}" stroke="${isFavorable?'#047857':'#94a3b8'}" stroke-width="2.2"/>
   <text x="${podCx}" y="${podCy+7}" font-size="18" font-weight="900" fill="${txtCol}" text-anchor="middle" font-family="Inter,sans-serif">${activeBall}</text>
   <rect x="${podCx+11}" y="${podCy-23}" width="18" height="18" rx="9" fill="${bdRing}" stroke="#ffffff" stroke-width="1.6"/>
   <text x="${podCx+20}" y="${podCy-10}" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle" font-family="Inter,sans-serif">${isFavorable?'✓':'✗'}</text>`;
  }

  const resBadge=q.tries===0&&t===0
   ? pill(422,216,218,24,'Bấm [▶ Phát] hoặc [Rút 1 quả]','#f1f5f9','#cbd5e1','#475569',9.4)
   : isSpinning
   ? pill(422,216,218,24,'🔄 Đang xóc hộp và rút... (chờ 2s)','#fffbeb','#f59e0b','#92400e',9.6)
   : isFavorable
   ? pill(422,216,218,24,`🎯 RÚT BÓNG [${activeBall}] (XANH) ➔ TRÚNG A ✓`,'#d1fae5','#10b981','#065f46',9.6)
   : pill(422,216,218,24,`🎯 RÚT BÓNG [${activeBall}] (TRẮNG) ➔ TRƯỢT A ✗`,'#fee2e2','#ef4444','#991b1b',9.6);

  const boxX=422,boxY=248,boxW=218,boxH=128;
  const ballsInBox=[];
  const nTotal=p.n;
  if(nTotal<=5){
   const stepX=boxW/(nTotal+1);
   for(let i=0;i<nTotal;i++){
    const num=i+1,isFav=num<=wanted;
    let bx=boxX+(i+1)*stepX,by=boxY+boxH*0.5;
    if(isSpinning){bx+=Math.sin(t*14+i*2.3)*3.5;by+=Math.cos(t*16+i*1.8)*3;}
    const ballFill=isFav?'url(#g10-ball-green)':'url(#g10-ball-white)';
    const strokeC=isFav?'#047857':'#94a3b8';
    const numC=isFav?'#ffffff':'#1e293b';
    const isDrawn=!isSpinning&&q.tries>0&&num===activeBall;
    ballsInBox.push(`<g>
     ${isDrawn?`<circle cx="${fmt(bx,1)}" cy="${fmt(by,1)}" r="18" fill="none" stroke="${isFav?'#10b981':'#ef4444'}" stroke-width="2" stroke-dasharray="3 2"/>`:''}
     <circle cx="${fmt(bx,1)}" cy="${fmt(by,1)}" r="14" fill="${ballFill}" stroke="${strokeC}" stroke-width="1.8"/>
     <text x="${fmt(bx,1)}" y="${fmt(by+5,1)}" font-size="12" font-weight="900" fill="${numC}" text-anchor="middle" font-family="Inter,sans-serif">${num}</text>
    </g>`);
   }
  }else{
   const half=Math.ceil(nTotal/2),rem=nTotal-half;
   const stepX1=boxW/(half+1),stepX2=boxW/(rem+1);
   for(let i=0;i<nTotal;i++){
    const num=i+1,isFav=num<=wanted;
    let bx,by;
    if(i<half){bx=boxX+(i+1)*stepX1;by=boxY+38;}
    else{bx=boxX+(i-half+1)*stepX2;by=boxY+88;}
    if(isSpinning){bx+=Math.sin(t*14+i*2.3)*3.5;by+=Math.cos(t*16+i*1.8)*3;}
    const ballFill=isFav?'url(#g10-ball-green)':'url(#g10-ball-white)';
    const strokeC=isFav?'#047857':'#94a3b8';
    const numC=isFav?'#ffffff':'#1e293b';
    const isDrawn=!isSpinning&&q.tries>0&&num===activeBall;
    ballsInBox.push(`<g>
     ${isDrawn?`<circle cx="${fmt(bx,1)}" cy="${fmt(by,1)}" r="17" fill="none" stroke="${isFav?'#10b981':'#ef4444'}" stroke-width="2" stroke-dasharray="3 2"/>`:''}
     <circle cx="${fmt(bx,1)}" cy="${fmt(by,1)}" r="13" fill="${ballFill}" stroke="${strokeC}" stroke-width="1.8"/>
     <text x="${fmt(bx,1)}" y="${fmt(by+4.5,1)}" font-size="11.5" font-weight="900" fill="${numC}" text-anchor="middle" font-family="Inter,sans-serif">${num}</text>
    </g>`);
   }
  }

  const recentOuts=outs.slice(-7);
  let ribbonBalls='';
  if(recentOuts.length===0){
   ribbonBalls=txt(791,185,'Chưa rút quả nào — Bấm [Rút 1 quả]','#94a3b8',9.5,'middle',600);
  }else{
   const rw=recentOuts.length,rxStart=791-((rw-1)*16);
   ribbonBalls=recentOuts.map((val,idx)=>{
    const bx=rxStart+idx*32,by=184,isFav=val<=wanted;
    return `<g>
     <circle cx="${fmt(bx,1)}" cy="${by}" r="11" fill="${isFav?'url(#g10-ball-green)':'url(#g10-ball-white)'}" stroke="${isFav?'#047857':'#94a3b8'}" stroke-width="1.6"/>
     <text x="${fmt(bx,1)}" y="${by+4}" font-size="10" font-weight="900" fill="${isFav?'#ffffff':'#1e293b'}" text-anchor="middle" font-family="Inter,sans-serif">${val}</text>
    </g>`;
   }).join('');
  }

  const relPoints=q.runningRel&&q.runningRel.length?q.runningRel:(outs.length?outs.map((v,i)=>({n:i+1,f:outs.slice(0,i+1).filter(x=>x<=wanted).length/(i+1)})):[]);
  const convPts=[];
  for(let i=0;i<relPoints.length;i++){
   const pt=relPoints[i];
   const cx=676+(i/Math.max(1,relPoints.length-1))*230;
   const cy=404-pt.f*78;
   convPts.push(`${fmt(cx,1)},${fmt(cy,1)}`);
  }
  const yTheory=404-probTheory*78;
  const lastPt=convPts.length?convPts[convPts.length-1].split(','):null;

  const probPhases=[
   `Pha 1: Đang xóc hộp đồng khả năng Ω gồm n(Ω) = ${p.n} quả bóng... (2s)`,
   `Pha 2: Đã rút được bóng [${activeBall}] ➔ ${isFavorable?'Thuộc biến cố A (Xanh) ✓':'Không thuộc A (Trắng) ✗'} (chờ 2s)`,
   `Pha 3: Xác suất lý thuyết P(A) = ${wanted}/${p.n} = ${fmt(probTheory*100,1)}%`,
   `Pha 4: Sau N = ${q.tries} phép thử, tần số f(N) = ${q.tries?fmt(q.relative*100,1)+'%':'0%'} hội tụ về P(A)`
  ];
  return [
   defsGrad,
   card10('Xác suất cổ điển P(A)',id,[
    frac10(36,214,'P(A) = ','n(A)','n(Ω)',` = ${wanted}/${p.n} = ${fmt(probTheory*100,1)}%`,'#1D4ED8',12),
    {t:`• Biến cố thuận lợi A: ${wanted} bóng Xanh`,c:'#15803D',w:800},
    {t:`• Không gian mẫu Ω: ${p.n} bóng đồng khả năng`,c:'#1D4ED8',w:800},
    {t:`• Thực tế rút được: ${q.hits}/${q.tries} lần trúng (${q.tries?fmt(q.relative*100,1)+'%':'0%'})`,c:'#B45309',w:800}
   ],'Hộp rút bóng đồng khả năng Ω & Bục kết quả rút ngẫu nhiên kiểm chứng SGK.','Chỉnh n(Ω), n(A) hoặc bấm [Rút 1 quả], [Rút 10 quả] để xem quá trình rút và hội tụ.'),
   stageBox(),
   pill(414,88,512,24,t>0?probPhases[pIdx-1]:`🎲 Phép thử ngẫu nhiên: Hộp đựng ${p.n} quả bóng đồng khả năng (SGK Toán 10 Bài 26)`,t>0?'#fff4eb':'#f1f5f9',t>0?'#f3c299':'#cbd5e1',t>0?'#b84a18':'#0f4963',9.6),

   // LEFT PANEL: Transparent Urn + Podium (x=414..648, y=118..438)
   `<rect x="414" y="118" width="234" height="320" rx="12" fill="#f8fcff" stroke="#cbdde8" stroke-width="1.4"/>`,
   txt(531,136,'HỘP RÚT BÓNG ĐỒNG KHẢ NĂNG','#0f4963',11.2,'middle',800),
   txt(531,150,`n(Ω) = ${p.n} bóng · n(A) = ${wanted} bóng Xanh`,'#15803D',9.6,'middle',700),
   `<rect x="516" y="206" width="30" height="12" rx="3" fill="#cbdde8" stroke="#94b8d1"/>`,
   `<rect x="496" y="214" width="70" height="7" rx="3" fill="#94b8d1" stroke="#64748b"/>`,
   podiumBall,
   resBadge,
   `<rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="8" fill="#e8f4f9" fill-opacity="0.45" stroke="#7ea8c2" stroke-width="2"/>`,
   `<line x1="${boxX+4}" y1="${boxY+4}" x2="${boxX+boxW-4}" y2="${boxY+4}" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>`,
   ballsInBox.join(''),
   txt(531,boxY+boxH-8,'Mọi bóng đồng chất, cơ hội rút như nhau','#64748b',8.8,'middle',600),
   `<g>
    <circle cx="436" cy="388" r="5" fill="url(#g10-ball-green)" stroke="#047857" stroke-width="1"/>
    ${txt(446,391,`${wanted} bóng Xanh (Thuộc A)`,'#065f46',9,'start',700)}
    <circle cx="546" cy="388" r="5" fill="url(#g10-ball-white)" stroke="#94a3b8" stroke-width="1"/>
    ${txt(556,391,`${p.n-wanted} bóng Trắng (A')`,'#475569',9,'start',700)}
   </g>`,
   pill(422,404,218,24,`P(A) = n(A)/n(Ω) = ${wanted}/${p.n} = ${fmt(probTheory*100,1)}%`,'#e6f7f2','#a3e4d2','#0f6953',10),

   // RIGHT PANEL: Monitor & LLN Convergence (x=656..926, y=118..438)
   `<rect x="656" y="118" width="270" height="320" rx="12" fill="#ffffff" stroke="#cbdde8" stroke-width="1.4"/>`,
   txt(791,136,'KIỂM CHỨNG ĐỊNH LUẬT SỐ LỚN','#0f4963',11.2,'middle',800),
   txt(791,150,`Đã rút: ${q.tries} lần · Trúng: ${q.hits} · Trượt: ${q.tries-q.hits}`,'#475569',9.5,'middle',700),
   `<rect x="666" y="160" width="250" height="42" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>`,
   txt(672,171,'Lịch sử các quả bóng rút gần đây:','#64748b',8.6,'start',700),
   ribbonBalls,
   `<rect x="666" y="208" width="250" height="74" rx="6" fill="#fbfcfe" stroke="#cbd5e1"/>`,
   txt(674,223,`Lý thuyết P(A) = ${wanted}/${p.n} = ${fmt(probTheory*100,1)}%`,'#1D4ED8',9.4,'start',800),
   `<rect x="674" y="228" width="234" height="8" rx="4" fill="#e2eef5"/>`,
   `<rect x="674" y="228" width="${fmt(Math.max(4,234*probTheory),1)}" height="8" rx="4" fill="#1D4ED8"/>`,
   txt(674,249,`Thực tế f(N) = ${q.hits}/${q.tries} ${q.tries?'= '+fmt(q.relative*100,1)+'%':'= 0%'}`,'#B45309',9.4,'start',800),
   `<rect x="674" y="254" width="234" height="8" rx="4" fill="#fef3c7"/>`,
   `<rect x="674" y="254" width="${fmt(Math.max(4,234*(q.tries?q.relative:0)),1)}" height="8" rx="4" fill="#B45309"/>`,
   txt(674,273,`Sai lệch: |f(N) − P(A)| = ${q.tries?fmt(Math.abs(q.relative-probTheory)*100,1)+'%':'—'}`,'#059669',8.8,'start',700),
   `<rect x="666" y="288" width="250" height="142" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>`,
   txt(674,302,'Đồ thị f(N) bám sát đường lý thuyết P(A):','#0f4963',9.2,'start',800),
   line(676,404,906,404,'#cbd5e1',1.2),
   line(676,365,906,365,'#e2e8f0',1,'3 3'),
   line(676,326,906,326,'#e2e8f0',1,'3 3'),
   line(676,yTheory,906,yTheory,'#1D4ED8',2,'5 4'),
   haloTxt(904,Math.max(320,yTheory-4),`P(A)=${fmt(probTheory*100,0)}%`,'#1D4ED8',8.5,'end',800),
   convPts.length>1?`<polyline points="${convPts.join(' ')}" fill="none" stroke="#B45309" stroke-width="2.2"/>`:'',
   lastPt?dot(Number(lastPt[0]),Number(lastPt[1]),4,'#B45309','#ffffff'):'',
   txt(791,422,'💡 Rút càng nhiều (N lớn), f(N) càng tiến sát P(A)','#059669',8.8,'middle',800),

   pill(414,448,512,24,'Định nghĩa SGK: P(A) = n(A) / n(Ω) · Mọi quả bóng đều đồng khả năng được rút','#eef8f5','#98d9c4','#0f6953',10),
   footer10(id,`P(A) = n(A)/n(Ω) = ${wanted}/${p.n} = ${fmt(probTheory*100,1)}%`,t)
  ].join('');
}
export function grade10SceneSVG(id,params=grade10Defaults(id),t=0,exp=null){
 if(!grade10Valid(id,params))return `<svg viewBox="0 0 960 520" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block" xmlns="http://www.w3.org/2000/svg"><rect width="960" height="520" rx="20" fill="#fff7f3"/>${txt(480,250,'Tham số ngoài miền hợp lệ Toán 10; hãy chỉnh lại thanh trượt.','#b5442b',18,'middle',800)}</svg>`;
 const fam=grade10Family(id),m=grade10Math(id,params,exp||{});
 const titles={'10-01':'Tập hợp và biểu đồ Venn','10-02':'Bất phương trình & Hệ BPT bậc nhất hai ẩn','10-03':'Hệ thức lượng trong tam giác','10-04':'Các phép toán vectơ','10-05':'Vectơ trong mặt phẳng tọa độ Oxy','10-07':'Phương trình đường thẳng trong Oxy','10-08':'Phương trình đường tròn trong Oxy','10-09':'Ba đường Conic: Elip, Hypebol, Parabol','10-10':'Các số đặc trưng của mẫu số liệu','10-11':'Đại số tổ hợp & Xác suất cổ điển'};
 const head=`<g opacity="0" pointer-events="none"><rect x="10" y="10" width="940" height="500" rx="20" fill="#ffffff" stroke="#d5e5ef" stroke-width="1.5"/><rect x="20" y="20" width="920" height="48" rx="12" fill="#eef6fb" stroke="#c8dfec"/>${txt(36,49,`${id} • ${titles[fam]||'Mô hình Toán 10'}`,'#0e435c',17,'start',800)}${pill(748,31,178,26,'SGK Toán 10 • Tương tác chuẩn','#1D4ED8','#1D4ED8','#fff',11)}</g>`;
 const body=fam==='10-01'?vennSVG(id,params,m,t,exp):fam==='10-02'?inequalitySVG(id,params,m,t,exp):fam==='10-03'?triangleSVG(id,params,m,t,exp):fam==='10-04'||fam==='10-05'?vectorSVG(id,params,m,t,exp):fam==='10-07'?lineSVG(id,params,m,t,exp):fam==='10-08'?circleSVG(id,params,m,t,exp):fam==='10-09'?conicSVG(id,params,m,t,exp):fam==='10-10'?statsSVG(id,params,m,t,exp):probSVG(id,params,m,t,exp);
 return `<svg viewBox="394 74 550 424" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block" xmlns="http://www.w3.org/2000/svg">${head}${body}</svg>`;
}
