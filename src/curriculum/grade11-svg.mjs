import {grade11Math,grade11Family,grade11Sequence,grade11Grouped,grade11TrigSolutions,grade11Prob,monotoneProgress} from './grade11-engine.mjs';
import {formatMathText} from './math-formula-renderer.mjs';

// R84 Semantic Color Palette for Grade 11
const PI=Math.PI;
const ink='#334155';
const blue='#1D4ED8';   // Base / Đối tượng gốc / Mặt (P) / d₁ / cos / f(x) / A
const teal='#047857';   // Compare / Đối chiếu / Mặt (Q) song song / d₂ / sin / f'(x) / B
const orange='#B45309'; // Active / Đang dựng / Mặt (Q) cắt / Tia quét / Tiếp tuyến
const purple='#6D28D9'; // Result / Giao tuyến / Đoạn vuông góc chung / Góc φ / Hợp-Giao / Kết quả
const slate='#64748B';  // Helper / Đường phụ / Trục / Lưới chuẩn
const red='#B91C1C';    // Warning / Tiệm cận / Gián đoạn / Điểm kéo
const grid='#E2E8F0';

const f=x=>Number.isFinite(Number(x))?Number(Number(x).toFixed(2)):String(x);
const short=(s,max=43)=>String(s).length>max?String(s).slice(0,max-1)+'…':String(s);
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const line=(x1,y1,x2,y2,color=blue,width=2,dash='')=>`<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${color}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
const dot=(x,y,color=red,r=6.5,handle='')=>`<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${color}" stroke="white" stroke-width="2" ${handle?`data-handle="${esc(handle)}" style="cursor:grab;touch-action:none"`:''}/>`;
const txt=(x,y,s,size=13,color=ink,anchor='start',w=700)=>`<text x="${f(x)}" y="${f(y)}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="${size}" font-weight="${w}" fill="${color}" text-anchor="${anchor}">${esc(formatMathText(s))}</text>`;
const path=(d,color=blue,w=3,dash='')=>`<path d="${d}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
const rect=(x,y,w,h,fill='#EFF6FF',stroke=blue,rx=6)=>`<rect x="${f(x)}" y="${f(y)}" width="${f(Math.max(0,w))}" height="${f(Math.max(0,h))}" fill="${fill}" stroke="${stroke}" stroke-width="1.6" rx="${rx}"/>`;
const pill=(x,y,w,h,s,bg='#EFF6FF',bd='#BFDBFE',col='#1E3A8A',sz=11.0)=>`<g>${rect(x,y,w,h,bg,bd,7)}${txt(x+w/2,y+h/2+4,s,sz,col,'middle',750)}</g>`;

// Monotonic progress 0 -> 1 that holds steady at 100% (never wraps back to 0 at end)
const phase=(t,dur=6)=>monotoneProgress(t,dur,{holdAtEnd:true});
const stageIdx=ph=>ph<0.25?1:ph<0.55?2:ph<0.85?3:4;
const stagePill=(x,y,ph,labels)=>{
 const idx=stageIdx(ph);
 const lb=labels[idx-1]||labels[labels.length-1]||'';
 return pill(x,y,228,22,`Cảnh ${idx}/4 (${Math.round(ph*100)}%): ${lb}`,'#F5F3FF','#DDD6FE',purple,10.0);
};

function frac11(x,y,lhs,num,den,rhs='',col='#1E3A8A',s=12.2){
 const lw=lhs?String(lhs).length*(s*.56)+6:0,nw=Math.max(String(num).length,String(den).length)*(s*.56)+12,cx=x+lw+nw/2,rx=x+lw+nw+6;
 return `<g data-fy="${y}"><desc>${esc(`${lhs}${num}/${den}${rhs}`)}</desc>${lhs?txt(x,y,lhs,s,col,'start',700):''}${txt(cx,y-8,num,s-1,col,'middle',700)}${line(x+lw,y-4,x+lw+nw,y-4,col,1.6)}${txt(cx,y+11,den,s-1,col,'middle',700)}${rhs?txt(rx,y,rhs,s,col,'start',700):''}</g>`;
}
function card11(title,badge,rows=[],obs='',corr=''){
 const rawDesc=rows.map(r=>typeof r==='string'?r.replace(/<[^>]+>/g,' '):r.t).join(' | ');
 const fracRow=rows.find(r=>typeof r==='string');
 const textRows=rows.filter(r=>typeof r!=='string');
 const displayRows=fracRow?[fracRow,...textRows.slice(0,2)]:textRows.slice(0,3);
 return `<g opacity="0" pointer-events="none"><desc>1. Quan sát: ${esc(obs)} | 2. Tương quan: ${esc(corr)} | ${esc(rawDesc)}</desc>
 <defs><clipPath id="g11-card-clip"><rect x="24" y="78" width="358" height="196" rx="12"/></clipPath></defs>
 ${rect(20,74,368,204,'#F8FAFC','#CBD5E1',14)}
 <g clip-path="url(#g11-card-clip)">
  ${rect(32,86,344,30,'#EFF6FF','#BFDBFE',8)}
  ${txt(42,106,short(title,27),13.2,'#1E3A8A','start',800)}${badge?pill(268,89,102,24,badge,blue,blue,'#fff',10.8):''}
  ${displayRows.map((r,i)=>{
   if(typeof r==='string'){const m=r.match(/data-fy="(\d+)"/);const fy=m?Number(m[1]):174;return `<g transform="translate(0,${(150+i*42)-fy})">${r}</g>`;}
   return txt(36,148+i*40,short(r.t.replace(/^•\s*/,''),44),r.s||12.4,r.c||ink,'start',r.w||750);
  }).join('')}
 </g></g>`;
}
function stageBox(x=398,y=74,w=542,h=404){return rect(x,y,w,h,'#FFFFFF','#CBD5E1',14);}
function wrapper(body,id,title,conclusion){
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="394 70 550 412" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(title)}" style="width:100%;height:100%;max-height:100%;display:block;background:#F8FAFC;touch-action:none">
 <desc>3. KẾT LUẬN SGK: ${esc(conclusion)}</desc>
 <g opacity="0" pointer-events="none">
  <defs><clipPath id="g11-foot-clip"><rect x="24" y="292" width="358" height="52" rx="10"/></clipPath></defs>
  ${rect(10,10,940,480,'#FFFFFF','#CBD5E1',18)}
  ${rect(20,18,920,46,'#EFF6FF','#BFDBFE',12)}
  ${txt(36,46,`${id} • ${title}`,16.2,'#1E3A8A','start',800)}${pill(750,28,176,26,'SGK Toán 11 • R84 Chiều sâu',blue,blue,'#fff',11)}
 </g>
 ${body}
 <g opacity="0" pointer-events="none">
  ${rect(20,288,368,60,'#ECFDF5','#A7F3D0',12)}
  <g clip-path="url(#g11-foot-clip)">${txt(36,323,short(conclusion,46),12.2,teal,'start',800)}</g>
 </g></svg>`;
}
function planeAxes({xmin=-5,xmax=5,ymin=-3,ymax=3,left=416,right=922,top=92,bottom=408}={}){
 const X=x=>left+(x-xmin)/(xmax-xmin)*(right-left),Y=y=>bottom-(y-ymin)/(ymax-ymin)*(bottom-top);
 let h=stageBox();
 for(let i=Math.ceil(xmin);i<=Math.floor(xmax);i++){const x=X(i);h+=line(x,top,x,bottom,grid,1);if(i%2===0)h+=txt(x,Math.min(bottom+14,Y(0)+15),i,10.5,slate,'middle',600);}
 for(let j=Math.ceil(ymin);j<=Math.floor(ymax);j++){const y=Y(j);h+=line(left,y,right,y,grid,1);if(j!==0)h+=txt(Math.max(left+18,X(0)-8),y+4,j,10.5,slate,'end',600);}
 const y0=Y(Math.max(ymin,Math.min(ymax,0))),x0=X(Math.max(xmin,Math.min(xmax,0)));
 h+=line(left,y0,right,y0,slate,1.8)+line(x0,top,x0,bottom,slate,1.8);
 return {X,Y,h};
}

function angles(id,p,t){
 const n=Number(id.slice(-2)),a=p.angle*PI/180,b=p.angle2*PI/180,ph=phase(t),progress=.18+.82*ph;
 const theta=n===4?a:(a*progress);
 const O=[n===1?628:658,254],R=Math.min(130,90+10.5*p.radius);
 const rays=(th,color,w=3,dash='')=>line(O[0],O[1],O[0]+R*Math.cos(th),O[1]-R*Math.sin(th),color,w,dash);
 let h=stageBox();
 // Base unit/trig circle + coordinate axes
 h+=`<circle cx="${O[0]}" cy="${O[1]}" r="${f(R)}" fill="${blue}" fill-opacity="0.06" stroke="${blue}" stroke-width="2.6"/>`;
 h+=line(O[0]-R-34,O[1],O[0]+R+34,O[1],slate,1.8)+line(O[0],O[1]-R-30,O[0],O[1]+R+30,slate,1.8)+dot(...O,ink,4.5);
 // Initial ray OA on Ox+
 h+=line(O[0],O[1],O[0]+R,O[1],blue,3.2);
 // Spiral orientation arc
 const arcPts=[];const stepsArc=56;
 for(let k=0;k<=stepsArc;k++){
  const ang=theta*k/stepsArc,radArc=26+Math.abs(ang)*2.2;
  arcPts.push([O[0]+radArc*Math.cos(ang),O[1]-radArc*Math.sin(ang)]);
 }
 if(arcPts.length>1)h+=path(arcPts.map((P,i)=>(i?'L':'M')+P.map(f).join(' ')).join(' '),orange,2.4);

 const Mx=O[0]+R*Math.cos(theta),My=O[1]-R*Math.sin(theta);

 if(n===1){
  // 11-01-C01: Radian unwrapping ruler on the right (x=882)
  const rx=882,ry0=254,scaleRad=32;
  h+=line(rx,112,rx,396,slate,2);
  for(const [k,lb] of [[-PI,'-π'],[-PI/2,'-π/2'],[0,'0'],[PI/2,'π/2'],[PI,'π']]){
   const yy=ry0-k*scaleRad;
   h+=line(rx-5,yy,rx+5,yy,slate,1.6)+txt(rx+9,yy+4,lb,9.8,slate,'start',700);
  }
  const radClamp=Math.max(-4.2,Math.min(4.2,theta)),ryCur=ry0-radClamp*scaleRad;
  h+=line(rx,ry0,rx,ryCur,purple,4.2)+dot(rx,ryCur,purple,6)+line(Mx,My,rx,ryCur,orange,1.5,'4 3');
  h+=txt(rx-8,104,'Trục rad',10,purple,'middle',800);
  h+=stagePill(412,84,ph,['Tia đầu OA','Quét tia OM','Trải cung rad','Họ góc α+k2π']);
 }else if(n===2){
  // 11-01-C02: Unit circle projections H(cos α; 0), K(0; sin α), right triangle OHM & tangent axis
  h+=`<polygon points="${O[0]},${O[1]} ${f(Mx)},${O[1]} ${f(Mx)},${f(My)}" fill="${purple}" fill-opacity="${f(0.08+0.12*ph)}"/>`;
  h+=line(O[0],O[1],Mx,O[1],blue,3.4)+line(Mx,O[1],Mx,My,teal,3.2);
  if(ph>0.55&&Math.abs(Math.cos(theta))>0.18){
   const tx=O[0]+R,ty=O[1]-R*Math.tan(theta);
   if(ty>=92&&ty<=416){
    h+=line(tx,104,tx,404,orange,1.6,'5 4')+line(O[0],O[1],tx,ty,orange,1.8,'4 3')+dot(tx,ty,orange,5.5)+txt(tx+8,ty+4,`tan α=${f(Math.tan(theta))}`,10,orange,'start',750);
   }
  }
  h+=stagePill(412,84,ph,['Điểm M trên ĐTLG','Chiếu H(cos), K(sin)','Tam giác vuông OHM','cos²α+sin²α=1']);
 }else if(n===3){
  // 11-01-C03: Arc length l = R|α| & sector area S = ½R²|α| + unrolled segment comparison
  const pts=[];for(let j=0;j<=70;j++){const z=theta*j/70;pts.push([O[0]+R*Math.cos(z),O[1]-R*Math.sin(z)]);}
  const secPoly=[[O[0],O[1]],...pts].map(P=>P.map(f).join(',')).join(' ');
  h+=`<polygon points="${secPoly}" fill="${purple}" fill-opacity="0.14"/>`;
  h+=path(pts.map((P,i)=>(i?'L':'M')+P.map(f).join(' ')).join(' '),purple,5)+dot(O[0]+R,O[1],blue,7,'radius');
  // Unrolled arc bar at bottom
  const arcLen=p.radius*Math.abs(theta),barW=Math.min(260,arcLen*22),bx=520,by=442;
  h+=line(bx,by,bx+barW,by,purple,4.5)+dot(bx,by,blue,4.5)+dot(bx+barW,by,purple,5.5);
  h+=txt(bx+barW+8,by+4,`Trải phẳng l = R|α| = ${f(arcLen)}`,10.2,purple,'start',800);
  h+=stagePill(412,84,ph,['Bán kính R','Quét góc |α| rad','Cung tròn l=R|α|','Quạt S=½R²|α|']);
 }else if(n===4){
  // 11-01-C04: Angle addition α + β
  const bSweep=b*progress,sumAng=a+bSweep;
  const Nx=O[0]+R*Math.cos(sumAng),Ny=O[1]-R*Math.sin(sumAng);
  h+=rays(a,blue,2.8)+rays(sumAng,purple,3.5)+dot(O[0]+R*Math.cos(a+b),O[1]-R*Math.sin(a+b),teal,7.5,'angle2');
  h+=line(Nx,Ny,Nx,O[1],purple,1.8,'4 3')+dot(Nx,O[1],purple,5)+txt(Nx,O[1]-8,`cos(α+β)=${f(Math.cos(sumAng))}`,10,purple,'middle',800);
  h+=stagePill(412,84,ph,['Góc nền α','Ghép thêm góc β','Tia tổng α+β','Chiếu cos(α+β), sin(α+β)']);
 }

 // Projections H(cos, 0) in blue and K(0, sin) in teal
 h+=line(Mx,My,Mx,O[1],blue,1.8,'5 4')+dot(Mx,O[1],blue,4.8)+txt(Mx,O[1]+18,`H(${f(Math.cos(theta))};0)`,10.8,blue,'middle',750);
 h+=line(Mx,My,O[0],My,teal,1.8,'5 4')+dot(O[0],My,teal,4.8)+txt(O[0]-10,My+4,`K(0;${f(Math.sin(theta))})`,10.8,teal,'end',750);
 h+=rays(theta,orange,3.4)+dot(Mx,My,purple,8.5,'angle')+txt(Mx+12,My-10,`M(${f(Math.cos(theta))};${f(Math.sin(theta))})`,11.2,purple,'start',800);
 h+=txt(O[0]+R+12,O[1]-6,'A(1;0)',10.8,ink,'start',700)+txt(O[0]+8,O[1]-R-10,'B(0;1)',10.8,ink,'start',700);
 h+=pill(748,84,182,22,n===1?`α = ${f(p.angle)}° = ${f(a)} rad`:n===3?`l = R|α| = ${f(p.radius*Math.abs(a))}`:n===4?`α+β = ${f(p.angle+p.angle2)}°`:`cos²α + sin²α = 1`,'#EFF6FF','#BFDBFE',blue,10.2);

 const titles=['Góc lượng giác & Radian','Đường tròn lượng giác','Độ dài cung tròn l = R·|α|','Công thức cộng lượng giác'];
 const rows=n===1?[
  {t:`• Số đo độ: α = ${f(p.angle)}°`,c:blue,w:800},
  frac11(36,174,'Radian: α = ','α° · π','180°',` = ${f(a)} rad`,teal,12),
  {t:`• Số vòng quay: k = ${Math.trunc(p.angle/360)} vòng`,c:ink},
  {t:`• M(cos α; sin α) = (${f(Math.cos(a))}; ${f(Math.sin(a))})`,c:purple,w:750},
  {t:'• Họ góc: α + k·360° (k ∈ ℤ)',c:slate,s:11.4}
 ]:n===2?[
  {t:`• Góc α = ${f(p.angle)}° (${f(a)} rad)`,c:blue,w:800},
  {t:`• Hoành độ: cos α = x_M = ${f(Math.cos(a))}`,c:blue,w:800},
  {t:`• Tung độ: sin α = y_M = ${f(Math.sin(a))}`,c:teal,w:800},
  frac11(36,238,'tan α = ','sin α','cos α',` = ${Math.abs(Math.cos(a))<1e-6?'--':f(Math.tan(a))}`,orange,12),
  {t:`• sin²α + cos²α = ${f(Math.sin(a)**2+Math.cos(a)**2)} = 1`,c:purple,w:800}
 ]:n===3?[
  {t:`• R = ${f(p.radius)}  |  α = ${f(p.angle)}° = ${f(a)} rad`,c:blue,w:750},
  {t:`• Độ dài cung: l = R·|α| = ${f(p.radius*Math.abs(a))}`,c:purple,w:800},
  frac11(36,206,'S quạt = ','1','2',`·R²·|α| = ${f(.5*p.radius*p.radius*Math.abs(a))}`,teal,12),
  {t:`• Tỉ lệ cung / chu vi: ${f(Math.abs(a)/(2*PI)*100)}%`,c:ink}
 ]:[
  {t:`• α = ${f(p.angle)}°  |  β = ${f(p.angle2)}°`,c:blue,w:800},
  {t:`• Tổng hai góc: α + β = ${f(p.angle+p.angle2)}°`,c:teal,w:800},
  {t:`• cos(α+β) = ${f(Math.cos(a+b))}`,c:purple,w:750},
  {t:`• sin(α+β) = ${f(Math.sin(a+b))}`,c:teal,w:750},
  {t:`• cos(α−β) = ${f(Math.cos(a-b))}`,c:ink,s:11.5}
 ];
 h+=card11(titles[n-1],id,rows,'Đường tròn lượng giác tâm O và hình chiếu H(cos α;0), K(0;sin α).','Kéo điểm M trên đường tròn để thấy cos α, sin α biến thiên.');
 return wrapper(h,id,titles[n-1],n===1?`180° = π rad ⇒ α = ${f(a)} rad; mọi góc α + k2π có chung điểm biểu diễn M.`:n===2?`Với mọi góc α: x_M = cos α = ${f(Math.cos(a))}, y_M = sin α = ${f(Math.sin(a))} và sin²α + cos²α = 1.`:n===3?`Cung tròn bán kính R = ${f(p.radius)} chắn góc |α| rad có độ dài l = R·|α| = ${f(p.radius*Math.abs(a))}.`:`Công thức cộng: cos(α+β) = ${f(Math.cos(a+b))}; sin(α+β) = ${f(Math.sin(a+b))}.`);
}

function trigEquations(id,p,t){
 const s=grade11TrigSolutions(id,p),isSin=s.kind==='sin',isCos=s.kind==='cos',isTan=s.kind==='tan',m=s.value,ph=phase(t);
 const {X,Y,h:ax}=planeAxes({xmin:-2*PI,xmax:2*PI,ymin:-3.2,ymax:3.2});let h=ax;
 const calc=x=>isSin?Math.sin(x):isCos?Math.cos(x):isTan?Math.tan(x):Math.cos(x)/Math.sin(x);

 // Draw vertical asymptotes for tan/cot in warning red #B91C1C
 if(isTan||s.kind==='cot'){
  for(let k=-3;k<=3;k++){
   const xa=isTan?(PI/2+k*PI):(k*PI);
   if(xa>=-2*PI+0.05&&xa<=2*PI-0.05)h+=line(X(xa),92,X(xa),408,red,1.4,'5 4');
  }
 }

 let d='',prior=null;
 for(let i=0;i<=520;i++){
  const x=-2*PI+4*PI*i/520,y=calc(x),ok=Number.isFinite(y)&&Math.abs(y)<3.15;
  if(!ok){prior=null;continue;}
  const xx=X(x),yy=Y(y);
  d+=`${!prior||Math.abs(prior-yy)>85?'M':'L'}${f(xx)} ${f(yy)} `;prior=yy;
 }
 h+=path(d,blue,3)+line(X(-2*PI),Y(m),X(2*PI),Y(m),orange,2.4,'7 4')+dot(X(0),Y(m),orange,7.5,'m');
 h+=pill(826,Math.max(114,Math.min(390,Y(m)-24)),96,20,`y = m = ${f(m)}`,'#FEF3C7','#FCD34D',orange,10.2);

 const roots=[];
 for(const base of s.solutions)for(let k=-4;k<=4;k++){
  const x=base+k*s.period;
  if(x>=-2*PI&&x<=2*PI&&roots.every(z=>Math.abs(z-x)>1e-6))roots.push(x);
 }
 roots.sort((a,b)=>a-b);

 // Progressive root reveal & periodic step bridge (+kT)
 const visibleCount=Math.max(1,Math.ceil(roots.length*(0.25+0.75*ph)));
 for(let idx=0;idx<roots.length;idx++){
  const x=roots[idx],isVis=idx<visibleCount;
  h+=line(X(x),Y(m),X(x),Y(0),isVis?purple:slate,isVis?1.8:1.1,'3 3');
  h+=dot(X(x),Y(m),isVis?purple:teal,isVis?6.5:4.8)+dot(X(x),Y(0),isVis?purple:teal,4.2);
  if(isVis&&idx>0&&ph>=0.55){
   const xPrev=roots[idx-1];
   if(Math.abs((x-xPrev)-s.period)<0.08){
    const mx=(X(xPrev)+X(x))/2,by=Y(0)+22;
    h+=path(`M ${f(X(xPrev))} ${f(Y(0)+6)} Q ${f(mx)} ${f(by)} ${f(X(x))} ${f(Y(0)+6)}`,teal,1.6,'3 2');
   }
  }
 }

 // Synchronized mini unit-circle inset on top-right of stage
 const cx=466,cy=152,cr=34;
 h+=rect(420,112,92,82,'#FFFFFF','#CBD5E1',8);
 h+=`<circle cx="${cx}" cy="${cy}" r="${cr}" fill="${blue}" fill-opacity="0.06" stroke="${blue}" stroke-width="1.6"/>`;
 h+=line(cx-cr-6,cy,cx+cr+6,cy,slate,1)+line(cx,cy-cr-6,cx,cy+cr+6,slate,1);
 for(const base of s.solutions){
  h+=line(cx,cy,cx+cr*Math.cos(base),cy-cr*Math.sin(base),purple,2)+dot(cx+cr*Math.cos(base),cy-cr*Math.sin(base),purple,3.8);
 }

 const at=-2*PI+4*PI*(.12+.78*ph),val=calc(at);
 if(Number.isFinite(val)&&Math.abs(val)<3.1)h+=dot(X(at),Y(val),orange,6.8);

 if((isSin||isCos)&&Math.abs(m)>1){
  h+=pill(568,118,220,24,`⚠️ |m| = ${f(Math.abs(m))} > 1: Vô nghiệm trên ℝ`,'#FEE2E2','#FCA5A5',red,10.5);
 }

 const formulaStr=isSin?`x = arcsin(${f(m)}) + k2π`:isCos?`x = ±arccos(${f(m)}) + k2π`:isTan?`x = arctan(${f(m)}) + kπ`:`x = arccot(${f(m)}) + kπ`;
 h+=stagePill(414,82,ph,['Đồ thị & ĐTLG','Cắt bởi đường y=m','Chiếu nghiệm gốc','Chu kì họ nghiệm +kT']);
 h+=pill(748,82,178,22,`${s.kind}(x) = ${f(m)} (${roots.length} nghiệm)`,'#F5F3FF','#DDD6FE',purple,10.2);

 h+=card11(`PT lượng giác ${s.kind}(x) = m`,id,[
  {t:`• Phương trình: ${s.kind}(x) = ${f(m)}`,c:blue,w:800},
  {t:`• Đường ngang y = ${f(m)} cắt y = ${s.kind}(x)`,c:orange,w:750},
  {t:`• Chu kì cơ sở: T = ${isTan||s.kind==='cot'?'π':'2π'} ≈ ${f(s.period)}`,c:teal,w:800},
  {t:`• Số nghiệm trên [−2π; 2π]: ${roots.length} nghiệm`,c:purple,w:800},
  {t:`• Họ nghiệm: ${formulaStr}`,c:ink,s:11.4,w:750}
 ],`Giao điểm của y = ${s.kind}(x) và đường ngang y = m.`,`Dịch chuyển m làm các hoành độ giao điểm trượt tuần hoàn.`);
 return wrapper(h,id,`Phương trình lượng giác ${s.kind}(x) = m`,`Hoành độ giao điểm của y = ${s.kind}(x) và y = ${f(m)} là nghiệm (${roots.length} nghiệm trên [−2π; 2π]).`);
}

function sequence(id,p,t){
 const mode=Number(id.slice(-2)),a=grade11Sequence(id,p),min=Math.min(0,...a),max=Math.max(1,...a),range=Math.max(1,max-min),ph=phase(t);
 const X=i=>442+i*450/Math.max(1,p.n-1),Y=v=>384-(v-min)/range*244;
 let h=stageBox()+line(422,384,916,384,slate,2)+line(422,102,422,396,slate,2);
 const sum=a.reduce((s,x)=>s+x,0),activeIdx=Math.min(a.length-1,Math.floor(ph*a.length));
 const partialSum=a.slice(0,activeIdx+1).reduce((s,x)=>s+x,0);

 // Reference envelope: collinear line for AP (mode 2) or exponential curve for GP (mode 3)
 if(mode===2&&a.length>=2){
  h+=line(X(0),Y(a[0]),X(a.length-1),Y(a.at(-1)),teal,1.8,'5 4');
  // Gauss pairing arcs when ph >= 0.65
  if(ph>=0.65&&a.length>=4){
   const mx=(X(0)+X(a.length-1))/2;
   h+=path(`M ${f(X(0))} ${f(388)} Q ${f(mx)} ${f(424)} ${f(X(a.length-1))} ${f(388)}`,purple,1.8,'4 3');
   h+=txt(mx,416,`Ghép cặp Gauss: u₁ + u_${a.length} = ${f(a[0]+a.at(-1))}`,9.8,purple,'middle',800);
  }
 }else if(mode===3&&a.length>=2&&p.q>0){
  let expD='';
  for(let k=0;k<=80;k++){
   const idx=(a.length-1)*k/80,val=p.u1*Math.pow(p.q,idx),xx=X(idx),yy=Y(val);
   if(yy>=96&&yy<=396)expD+=`${expD?'L':'M'}${f(xx)} ${f(yy)} `;
  }
  if(expD)h+=path(expD,teal,1.8,'5 4');
 }

 for(let i=0;i<a.length;i++){
  const x=X(i),y=Y(a[i]),act=i===activeIdx,visited=i<=activeIdx;
  if(i<a.length-1&&mode>=2){
   const x2=X(i+1),y2=Y(a[i+1]),mx=(x+x2)/2,my=Math.min(y,y2)-18;
   h+=path(`M ${f(x)} ${f(y)} Q ${f(mx)} ${f(my)} ${f(x2)} ${f(y2)}`,act?orange:visited?teal:'#CBD5E1',act?2.4:1.4,'4 3');
   if(act)h+=pill(mx-30,my-16,60,18,mode===2?`+d=${f(p.d)}`:`×q=${f(p.q)}`,'#FEF3C7','#FCD34D',orange,9.6);
  }
  const hKey=i===0?(mode===1?'rate':'u1'):i===a.length-1?(mode===1?'rate':mode===2?'d':'q'):'';
  const colBar=act?orange:visited?blue:slate;
  const colDot=act?purple:visited?blue:teal;
  h+=line(x,384,x,y,colBar,act?2.8:1.8,'4 3')+dot(x,y,colDot,act?7.8:6,hKey)+txt(x,400,`n=${i+1}`,9.8,slate,'middle',700)+txt(x,y-10,f(a[i]),10.2,act?purple:ink,'middle',800);
 }

 const titles=['Dãy số (u_n) trên ℕ*','Cấp số cộng (CSC)','Cấp số nhân (CSN)'];
 h+=stagePill(414,82,ph,['Khởi tạo u₁','Quét bước nhảy','Quy luật u_n','Tổng tích lũy S_n']);
 h+=pill(716,82,212,22,`S_${activeIdx+1} = ${f(partialSum)}  |  S_${p.n} = ${f(sum)}`,'#F5F3FF','#DDD6FE',purple,10.0);

 const rows=[
  {t:`• u₁ = ${f(a[0])}  |  Số số hạng n = ${p.n}`,c:blue,w:800},
  mode===2?{t:`• Công sai d = ${f(p.d)}  |  u_${p.n} = ${f(a.at(-1))}`,c:teal,w:800}:
  mode===3?{t:`• Công bội q = ${f(p.q)}  |  u_${p.n} = ${f(a.at(-1))}`,c:teal,w:800}:
  {t:`• Số hạng thứ n: u_${p.n} = ${f(a.at(-1))}`,c:teal,w:800},
  mode===2?frac11(36,206,`S_${p.n} = `,'n(u₁ + u_n)','2',` = ${f(sum)}`,purple,12):
  mode===3?frac11(36,206,`S_${p.n} = `,'u₁(1 − qⁿ)','1 − q',` = ${f(sum)}`,purple,12):
  {t:`• Tổng S_${p.n} = ${f(sum)}`,c:purple,w:800},
  {t:`• Đang quét n = ${activeIdx+1}: u_${activeIdx+1} = ${f(a[activeIdx])}`,c:orange,w:750}
 ];
 h+=card11(titles[mode-1],id,rows,'Các điểm rời rạc (n; u_n) trên tập ℕ*.',mode===2?'Cấp số cộng có các điểm (n; u_n) thẳng hàng.':mode===3?'Cấp số nhân biến thiên theo lũy thừa q^{n−1}.':'Dãy số xác định tại các mốc nguyên dương n.');
 return wrapper(h,id,titles[mode-1],mode===2?`Cấp số cộng: u_n = u₁ + (n−1)d = ${f(a.at(-1))}, tổng S_n = ${f(sum)}.`:mode===3?`Cấp số nhân: u_n = u₁·q^{n−1} = ${f(a.at(-1))}, tổng S_n = ${f(sum)}.`:`Dãy số (u_n) biểu diễn bởi các điểm rời rạc (n; u_n).`);
}

function grouped(id,p,t){
 const mode=Number(id.slice(-2)),d=grade11Grouped(p),scale=11.0,baseY=374,ph=phase(t);
 let h=stageBox()+line(422,baseY,916,baseY,slate,2)+line(422,104,422,baseY,slate,2);
 const reps=[],actIdx=Math.min(3,Math.floor(ph*4));
 for(let i=0;i<4;i++){
  const x=448+i*112,w=92,val=d.counts[i],y=baseY-val*scale,rep=(d.bounds[i]+d.bounds[i+1])/2;reps.push(rep);
  const act=i===actIdx;
  h+=rect(x,y,w,val*scale,act?'#FEF3C7':'#DBEAFE',act?orange:blue,5);
  // Representative midpoint pin c_i
  if(ph>=0.25||mode>=2){
   h+=line(x+w/2,baseY,x+w/2,y,teal,1.6,'3 3')+dot(x+w/2,baseY,teal,4.5);
  }
  h+=dot(x+w/2,y,red,7,'n'+(i+1))+txt(x+w/2,y-10,`n_${i+1}=${val}`,11.2,ink,'middle',800)+txt(x+w/2,394,`[${f(d.bounds[i])};${f(d.bounds[i+1])})`,10.8,ink,'middle',700)+txt(x+w/2,410,`c_${i+1}=${f(rep)}`,10.2,teal,'middle',700);
 }
 const Xv=v=>448+((v-d.bounds[0])/Math.max(1e-6,d.bounds[4]-d.bounds[0]))*428;

 if(mode===2){
  // Balance fulcrum ▲ under x_TB showing weighted center of mass
  const curMean=d.bounds[0]+(d.mean-d.bounds[0])*(0.35+0.65*ph),xm=Xv(curMean);
  h+=line(xm,112,xm,baseY,purple,2.4,'6 4');
  h+=`<polygon points="${f(xm)},${baseY+2} ${f(xm-10)},${baseY+16} ${f(xm+10)},${baseY+16}" fill="${purple}"/>`;
  h+=pill(Math.min(820,Math.max(430,xm-52)),112,104,20,`x_TB ≈ ${f(d.mean)}`,'#F5F3FF','#DDD6FE',purple,10.2);
 }
 if(mode===3){
  // Cumulative frequency ogive CF(x) + Quartile interpolation Q1, Me, Q3
  const cfPts=[[448,baseY]];
  let acc=0;
  for(let i=0;i<4;i++){
   acc+=d.counts[i];
   const xRight=448+i*112+92,yCf=baseY-(acc/Math.max(1,d.N))*220;
   cfPts.push([xRight,yCf]);
  }
  h+=path(cfPts.map((P,i)=>(i?'L':'M')+P.map(f).join(' ')).join(' '),teal,2.6);
  for(const P of cfPts)h+=dot(P[0],P[1],teal,4.5);
  const xQ1=Xv(d.Q1),xMe=Xv(d.Me),xQ3=Xv(d.Q3);
  h+=rect(xQ1,126,Math.max(4,xQ3-xQ1),18,'#F5F3FF',purple,4);
  h+=line(xQ1,126,xQ1,baseY,orange,1.6,'4 3')+line(xMe,114,xMe,baseY,purple,2.4,'5 3')+line(xQ3,126,xQ3,baseY,orange,1.6,'4 3');
  h+=pill(Math.min(826,Math.max(430,xMe-48)),108,96,20,`M_e ≈ ${f(d.Me)}`,'#F5F3FF','#DDD6FE',purple,10.2);
 }

 h+=stagePill(414,82,ph,mode===1?['Các khoảng ghép nhóm','Giá trị đại diện c_i','Tần số cột n_i','Cỡ mẫu N = ∑n_i']:mode===2?['Giá trị đại diện c_i','Trọng số n_i·c_i','Đặt đòn cân mẫu','Điểm cân bằng x_TB']:['Cộng dồn tần số CF','Đường gấp khúc CF(x)','Nội suy N/4, N/2, 3N/4','Chốt Q₁, M_e, Q₃']);
 h+=pill(786,82,140,22,`N = ${d.N}  |  x̄ ≈ ${f(d.mean)}`,'#EFF6FF','#BFDBFE',blue,10.2);

 h+=card11(mode===1?'Mẫu số liệu ghép nhóm':mode===2?'Số trung bình mẫu ghép nhóm':'Trung vị & Tứ phân vị',id,[
  {t:`• Cỡ mẫu N = ${d.counts.join(' + ')} = ${d.N}`,c:blue,w:800},
  {t:`• Đại diện nhóm: c_i = [${reps.map(r=>f(r)).join('; ')}]`,c:teal,w:750},
  {t:`• Số trung bình: x_TB = (∑ n_i c_i)/N ≈ ${f(d.mean)}`,c:orange,w:800},
  {t:`• Q₁ ≈ ${f(d.Q1)}  |  M_e ≈ ${f(d.Me)}  |  Q₃ ≈ ${f(d.Q3)}`,c:purple,w:800},
  {t:`• Khoảng tứ phân vị: Δ_Q = Q₃ − Q₁ ≈ ${f(d.Q3-d.Q1)}`,c:red,w:750}
 ],'Biểu đồ cột tần số ghép nhóm với giá trị đại diện c_i.','Kéo đỉnh cột đỏ trên biểu đồ để thay đổi tần số n_i.');
 return wrapper(h,id,mode===1?'Mẫu số liệu ghép nhóm':mode===2?'Số trung bình mẫu ghép nhóm':'Tứ phân vị mẫu ghép nhóm',`Mẫu ghép nhóm N = ${d.N}: x_TB ≈ ${f(d.mean)}; Q₁ ≈ ${f(d.Q1)}, M_e ≈ ${f(d.Me)}, Q₃ ≈ ${f(d.Q3)}.`);
}

function limits(id,p,t){
 const {X,Y,h:ax}=planeAxes({xmin:-4,xmax:4,ymin:-1,ymax:5}),mode=Number(id.slice(-2)),ph=phase(t);let h=ax;
 if(mode===1){
  const act=Math.max(1,Math.round((0.15+0.85*ph)*p.n));
  const eps=Math.max(0.22,0.85*(1-0.65*ph));
  // ε-band around L=0 in teal
  h+=rect(X(-4),Y(eps),X(4)-X(-4),Math.abs(Y(-eps)-Y(eps)),'#ECFDF5',teal,0);
  h+=line(X(-4),Y(eps),X(4),Y(eps),teal,1.4,'5 4')+txt(X(3.85),Y(eps)-5,`+ε = ${f(eps)}`,9.8,teal,'end',750);
  for(let n=1;n<=p.n;n++){
   const val=p.rate/(n+1),x=-3.5+(n-1)*7/Math.max(1,p.n-1),inBand=Math.abs(val)<=eps;
   const isAct=n===act;
   h+=line(X(x),Y(0),X(x),Y(val),isAct?orange:inBand?purple:grid,isAct?2.4:1.3,'3 3');
   h+=dot(X(x),Y(val),isAct?orange:inBand?purple:blue,isAct?7.8:5.6,n===1?'rate':n===p.n?'n':'');
  }
  h+=line(X(-4),Y(0),X(4),Y(0),purple,2.4,'6 4')+pill(790,Y(0)-28,124,20,'lim u_n = 0','#F5F3FF','#DDD6FE',purple,10.2);
  h+=stagePill(414,82,ph,['Các số hạng đầu','Dải lân cận (−ε;+ε)','Ngưỡng chỉ số N₀','Hội tụ lim u_n = 0']);
  h+=card11('Giới hạn dãy số lim u_n = 0',id,[
   frac11(36,148,'u_n = ',`${f(p.rate)}`,'n + 1',` (n = 1 … ${p.n})`,blue,12),
   {t:`• u₁ = ${f(p.rate/2)}  |  u_${p.n} = ${f(p.rate/(p.n+1))}`,c:teal,w:800},
   {t:`• Đang quét n = ${act}: u_${act} = ${f(p.rate/(act+1))}`,c:orange,w:800},
   {t:'• Khi n → +∞ thì |u_n − 0| < ε → 0',c:purple,w:750}
  ],'Các điểm u_n = c/(n+1) lọt vào dải ε sát về y = 0.','Khi n lớn dần, khoảng cách từ u_n tới trục hoành tiến về 0.');
  return wrapper(h,id,'Giới hạn của dãy số',`Khi n → +∞ thì u_n = ${f(p.rate)}/(n+1) → 0.`);
 }

 const x0=p.x0,y0=x0+1,delta=p.jump,dleft=y0+delta,isCont=Math.abs(delta)<1e-6;
 // Separate left branch (#1D4ED8) and right branch (#047857) for immediate semantic clarity
 const leftPts=[],rightPts=[];
 for(let i=0;i<=190;i++){
  const x=-4+(8*i/190);
  if(Math.abs(x-x0)<.025)continue;
  const curv=mode===3?0.22*(x-x0)*(x-x0):0;
  if(x<x0)leftPts.push([x,x+1+delta+curv]);
  else rightPts.push([x,x+1+curv]);
 }
 h+=path(leftPts.map(([x,y],i)=>(i?'L':'M')+f(X(x))+' '+f(Y(y))).join(' '),blue,3.2);
 h+=path(rightPts.map(([x,y],i)=>(i?'L':'M')+f(X(x))+' '+f(Y(y))).join(' '),teal,3.2);
 h+=line(X(x0),94,X(x0),406,slate,1.4,'4 4');
 h+=line(X(0),Y(dleft),X(x0),Y(dleft),blue,1.5,'4 3')+pill(X(0)-70,Y(dleft)-10,66,19,`L⁻=${f(dleft)}`,'#EFF6FF','#BFDBFE',blue,9.8);
 h+=line(X(0),Y(y0),X(x0),Y(y0),teal,1.5,'4 3')+pill(X(0)+6,Y(y0)-10,66,19,`L⁺=${f(y0)}`,'#ECFDF5','#A7F3D0',teal,9.8);
 if(mode===3){
  // Continuity band around f(x0) for 11-10-C03
  h+=rect(X(x0-0.65),Y(y0+0.35),X(x0+0.65)-X(x0-0.65),Math.abs(Y(y0-0.35)-Y(y0+0.35)),isCont?'#F5F3FF':'#FEF2F2',isCont?purple:red,4);
 }
 if(!isCont){
  h+=line(X(x0),Y(dleft),X(x0),Y(y0),red,2.6,'3 2');
 }
 h+=`<circle cx="${f(X(x0))}" cy="${f(Y(dleft))}" r="7.5" fill="white" stroke="${isCont?purple:red}" stroke-width="3" data-handle="jump" style="cursor:grab;touch-action:none"/>`;
 h+=dot(X(x0),Y(y0),isCont?purple:teal,7.5,'x0');
 const approachL=x0-(.14+1.3*(1-ph)),approachR=x0+(.14+1.3*(1-ph));
 const yL=approachL+1+delta+(mode===3?0.22*(approachL-x0)**2:0),yR=approachR+1+(mode===3?0.22*(approachR-x0)**2:0);
 h+=line(X(approachL),Y(0),X(approachL),Y(yL),orange,1.5,'3 3')+dot(X(approachL),Y(yL),orange,6.8);
 h+=line(X(approachR),Y(0),X(approachR),Y(yR),purple,1.5,'3 3')+dot(X(approachR),Y(yR),purple,6.8);
 h+=txt(X(x0)-18,Y(0)-6,'→x₀⁻',10,orange,'end',800)+txt(X(x0)+18,Y(0)-6,'x₀⁺←',10,purple,'start',800);
 h+=stagePill(414,82,ph,['Điểm xét x₀','Tiến từ bên trái x→x₀⁻','Tiến từ bên phải x→x₀⁺',isCont?'Khớp L⁻=L⁺=f(x₀)':'Bước nhảy Δ = L⁻ − L⁺']);
 h+=pill(782,82,144,22,isCont?'L⁻ = L⁺ = f(x₀) (Liên tục)':'L⁻ ≠ L⁺ (Gián đoạn)',isCont?'#F5F3FF':'#FEE2E2',isCont?'#DDD6FE':'#FCA5A5',isCont?purple:red,10.0);

 h+=card11(mode===2?'Giới hạn một bên':'Hàm số liên tục tại x₀',id,[
  {t:`• Điểm xét x₀ = ${f(x0)}  |  f(x₀) = ${f(y0)}`,c:blue,w:800},
  {t:`• Giới hạn trái (x → x₀⁻): L⁻ = ${f(dleft)}`,c:blue,w:800},
  {t:`• Giới hạn phải (x → x₀⁺): L⁺ = ${f(y0)}`,c:teal,w:800},
  {t:`• Độ nhảy tại x₀: Δ = L⁻ − L⁺ = ${f(delta)}`,c:red,w:800},
  {t:`• ${isCont?'L⁻ = L⁺ = f(x₀) ⇒ LIÊN TỤC':'L⁻ ≠ L⁺ ⇒ GIÁN ĐOẠN tại x₀'}`,c:isCont?purple:red,w:800}
 ],'Hai điểm động tiến về x₀ từ bên trái và bên phải.','Chỉnh bước nhảy Δ = 0 để hai nhánh nối liền tại (x₀; f(x₀)).');
 return wrapper(h,id,mode===2?'Giới hạn một phía của hàm số':'Tính liên tục của hàm số tại x₀',isCont?`Tại x₀ = ${f(x0)}: L⁻ = L⁺ = f(x₀) = ${f(y0)} ⇒ Hàm số liên tục tại x₀.`:`Tại x₀ = ${f(x0)}: L⁻ (${f(dleft)}) ≠ L⁺ (${f(y0)}) ⇒ Hàm số gián đoạn tại x₀.`);
}

function probability(id,p,t,{trials=0,seed=20261027}={}){
 const mode=Number(id.slice(-2)),prob=mode===3?p.pa*p.pb:grade11Prob(p).union;
 // Monotonic 0->1 progress over 8s (matches Grade11Lab maxT=8 for 11-13 and works cleanly at t=0, 2, 2.6, 4, 8)
 const ph=phase(t,8);
 let h=stageBox();
 if(mode<3){
  const cy=246,r=mode===2?92:102;
  // In mode 1, circles slide closer as ph increases to visualize the overlap lens A ∩ B
  const spread=mode===1?(18*(1-ph)):0;
  const cx1=(mode===2?552:600)-spread,cx2=(mode===2?782:734)+spread;
  const scanX=442+452*ph,scanY=cy+24*Math.sin(ph*PI*2);

  h+=`<rect x="418" y="108" width="502" height="296" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.6"/>`;
  h+=txt(432,128,'Không gian mẫu Ω',10.8,slate,'start',750);
  // Highlight intersection lens in purple for mode 1
  if(mode===1){
   const clipId=`g11-venn-clip-${Math.round(ph*1000)}`;
   h+=`<defs><clipPath id="${clipId}"><circle cx="${f(cx1)}" cy="${cy}" r="${r}"/></clipPath></defs>`;
   h+=`<circle cx="${f(cx2)}" cy="${cy}" r="${r}" clip-path="url(#${clipId})" fill="${purple}" fill-opacity="${f(0.22+0.25*ph)}"/>`;
  }
  h+=`<circle cx="${f(cx1)}" cy="${cy}" r="${r}" fill="${blue}" fill-opacity="0.18" stroke="${blue}" stroke-width="3"/>`;
  h+=`<circle cx="${f(cx2)}" cy="${cy}" r="${r}" fill="${teal}" fill-opacity="0.18" stroke="${teal}" stroke-width="3"/>`;
  h+=dot(cx1-36,cy,blue,7,'pa')+dot(cx2+36,cy,teal,7,'pb');
  if(mode===1)h+=dot((cx1+cx2)/2,cy+26,purple,7,'overlap');
  h+=txt(cx1-36,cy-r-10,`P(A) = ${f(p.pa)}`,12,blue,'middle',800)+txt(cx2+36,cy-r-10,`P(B) = ${f(p.pb)}`,12,teal,'middle',800);
  h+=pill(mode===2?620:616,cy-12,102,24,mode===2?'A ∩ B = ∅':`P(A∩B)=${f(p.overlap)}`,'#F5F3FF','#DDD6FE',purple,10.5);
  // Active probability scanner ray & probe
  h+=line(scanX,114,scanX,396,orange,1.6,'4 3')+dot(scanX,scanY,orange,7.5);
  h+=stagePill(414,82,ph,mode===1?['Miền biến cố A, B','Giao miền A ∩ B','Trừ phần đếm lặp','Hợp P(A∪B)=P(A)+P(B)−P(AB)']:['Miền A trong Ω','Miền B tách rời A','Kiểm chứng A ∩ B = ∅','Cộng P(A∪B)=P(A)+P(B)']);
  h+=pill(466,368,404,26,`P(A ∪ B) = ${f(p.pa)} + ${f(p.pb)}${mode===1?` − ${f(p.overlap)}`:''} = ${f(prob)} (Tiến trình ${Math.round(ph*100)}%)`,'#F5F3FF','#DDD6FE',purple,10.5);

  h+=card11(mode===1?'Quy tắc cộng xác suất':'Hai biến cố xung khắc',id,[
   {t:`• P(A) = ${f(p.pa)}  |  P(B) = ${f(p.pb)}`,c:blue,w:800},
   {t:`• Phần giao: P(A ∩ B) = ${f(mode===2?0:p.overlap)}`,c:purple,w:800},
   {t:`• P(A ∪ B) = P(A) + P(B) − P(A ∩ B)`,c:ink,w:750},
   {t:`• Kết quả: P(A ∪ B) = ${f(prob)}`,c:purple,w:800}
  ],'Biểu đồ Venn xác suất của hai biến cố A, B.','Khi A, B xung khắc (A∩B = ∅) thì P(A∪B) = P(A) + P(B).');
  return wrapper(h,id,mode===1?'Quy tắc cộng xác suất':'Biến cố xung khắc',mode===1?`Quy tắc cộng: P(A ∪ B) = P(A) + P(B) − P(A ∩ B) = ${f(prob)}.`:`Khi A và B xung khắc (A ∩ B = ∅) ⇒ P(A ∪ B) = P(A) + P(B) = ${f(prob)}.`);
 }

 // 11-13-C03: Independent probability multiplication rule with 2D product square + empirical bar chart
 const effTrials=trials>0?trials:Math.max(20,Math.round((p.trials||120)*(0.2+0.8*ph)));
 const model=grade11Math(id,p,{trials:effTrials,seed}).result,count=model.trials||effTrials,estimated=model.relative;
 // Left side: 2D unit square product grid (x=426..562, y=148..284)
 const sqX=428,sqY=150,sqS=132,wA=sqS*p.pa,hB=sqS*p.pb;
 h+=rect(sqX,sqY,sqS,sqS,'#F8FAFC',slate,4);
 h+=rect(sqX,sqY,wA,sqS,'#DBEAFE',blue,0);
 h+=rect(sqX,sqY,sqS,hB,'#D1FAE5',teal,0);
 h+=rect(sqX,sqY,wA,hB,'#DDD6FE',purple,0);
 h+=txt(sqX+sqS/2,sqY-8,'Ô tích P(A)·P(B)',10.2,purple,'middle',800);
 h+=txt(sqX+wA/2,sqY+sqS+15,`P(A)=${f(p.pa)}`,9.8,blue,'middle',750);
 h+=txt(sqX+sqS+6,sqY+hB/2+4,`P(B)=${f(p.pb)}`,9.6,teal,'start',750);

 // Right side: Comparison columns
 const baseY=356,h1=prob*200,h2=estimated*200,hColA=p.pa*200,hColB=p.pb*200;
 h+=line(596,baseY,922,baseY,slate,2);
 const cols=[
  {x:608,h:hColA,val:p.pa,lab:'P(A)',col:blue},
  {x:686,h:hColB,val:p.pb,lab:'P(B)',col:teal},
  {x:764,h:h1,val:prob,lab:'P(A)·P(B)',col:purple},
  {x:842,h:h2,val:estimated,lab:`f (${model.hits}/${count})`,col:orange}
 ];
 for(const c of cols){
  h+=rect(c.x,baseY-c.h,62,c.h,c.col,c.col,5)+txt(c.x+31,baseY-c.h-8,f(c.val),11,ink,'middle',800)+txt(c.x+31,376,c.lab,9.8,ink,'middle',700);
 }
 h+=dot(608+31,baseY-hColA,blue,7,'pa')+dot(686+31,baseY-hColB,teal,7,'pb');
 h+=stagePill(414,82,ph,['Xác suất P(A)','Xác suất P(B)','Diện tích tích P(A)P(B)','Thực nghiệm f → P(AB)']);
 h+=pill(456,392,432,26,`Thực nghiệm N = ${count}: f = ${model.hits}/${count} ≈ ${f(estimated)} ↔ P(AB) = ${f(prob)}`,'#FEF3C7','#FCD34D',orange,10.2);

 h+=card11('Quy tắc nhân xác suất độc lập',id,[
  {t:`• P(A) = ${f(p.pa)}  |  P(B) = ${f(p.pb)}`,c:blue,w:800},
  {t:`• Độc lập: P(A ∩ B) = P(A)·P(B) = ${f(prob)}`,c:purple,w:800},
  {t:`• Biến cố đối: P(A') = ${f(1-p.pa)} | P(B') = ${f(1-p.pb)}`,c:ink},
  {t:`• Thực nghiệm: f = ${model.hits}/${count} ≈ ${f(estimated)}`,c:orange,w:800},
  {t:`• Độ lệch |f − P(AB)| = ${f(Math.abs(estimated-prob))}`,c:red,w:750}
 ],'Ô vuông diện tích P(A)·P(B) và biểu đồ tần suất thực nghiệm.','Tăng số phép thử N để thấy f hội tụ sát về P(A)·P(B).');
 return wrapper(h,id,'Quy tắc nhân xác suất độc lập',`Hai biến cố A, B độc lập ⇔ P(A ∩ B) = P(A)·P(B) = ${f(prob)}.`);
}

export function grade11SpatialSVG(id,p,t=0){
 const fam=grade11Family(id),mode=Number(id.slice(-2)),ph=phase(t,6);
 const deg=p.deg??60,rad=deg*PI/180,dist=p.dist??2,H=p.h??3,a=p.a??4,b=p.b??2;
 let h=stageBox();
 const planePoly=(cx,cy,w,d,col=blue,op=.12)=>`<polygon points="${f(cx-w/2-d)},${f(cy+d)} ${f(cx+w/2-d)},${f(cy+d)} ${f(cx+w/2+d)},${f(cy-d)} ${f(cx-w/2+d)},${f(cy-d)}" fill="${col}" fill-opacity="${op}" stroke="${col}" stroke-width="2"/>`;
 h+=stagePill(414,82,ph,['Khởi tạo hệ quy chiếu','Dựng yếu tố trung gian','Chốt quan hệ hình học','Kết luận & đo đạc']);

 if(fam==='11-05'){
  if(mode===1){
   const A=[560,290],B=[780,310],C=[650+40*Math.cos(rad),195-35*Math.sin(rad)],M=[A[0]+(B[0]-A[0])*ph*.6+(C[0]-A[0])*(1-ph)*.5,A[1]+(B[1]-A[1])*ph*.6+(C[1]-A[1])*(1-ph)*.5];
   h+=planePoly(668,262,320,76,blue,.12)+`<polygon points="${A.join(',')} ${B.join(',')} ${C.join(',')}" fill="${teal}" fill-opacity="0.18" stroke="${teal}" stroke-width="2.4"/>`;
   h+=dot(...A,blue,6.5,'deg')+txt(A[0]-12,A[1]+16,'A',12,blue,'middle',800)+dot(...B,blue,6.5,'deg')+txt(B[0]+14,B[1]+14,'B',12,blue,'middle',800)+dot(...C,orange,7.5,'deg')+txt(C[0],C[1]-12,'C',12,orange,'middle',800);
   h+=dot(...M,purple,5.5)+txt(M[0]+10,M[1]-6,'M ∈ (ABC)',11,purple,'start',800)+txt(490,328,'(P) ≡ (ABC)',12,blue,'start',800);
  }else if(mode===2){
   const I1=[600,340],I2=[736,156],M=[I1[0]+(I2[0]-I1[0])*ph,I1[1]+(I2[1]-I1[1])*ph];
   const Q2=[I2[0]+110*Math.cos(rad),I2[1]-70*Math.sin(rad)],Q1=[I1[0]+110*Math.cos(rad),I1[1]-70*Math.sin(rad)];
   h+=planePoly(668,288,330,62,blue,.12)+`<polygon points="${I1[0]},${I1[1]} ${I2[0]},${I2[1]} ${f(Q2[0])},${f(Q2[1])} ${f(Q1[0])},${f(Q1[1])}" fill="${orange}" fill-opacity="0.18" stroke="${orange}" stroke-width="2"/>`;
   h+=line(I1[0]-18,I1[1]+24,I2[0]+18,I2[1]-24,purple,3.2)+dot(...M,purple,6.5,'deg')+dot(...Q2,orange,7.5,'deg')+txt(I2[0]+22,I2[1]-18,'d = (P) ∩ (Q)',11.5,purple,'start',800)+txt(490,338,'(P)',12,blue,'start',800)+txt(I2[0]+70,I2[1]-36,'(Q)',12,orange,'start',800);
  }else{
   const H0=296,topY=H0-dist*34,dx=110*Math.cos(rad),dy=55*Math.sin(rad);
   h+=planePoly(668,H0,330,62,blue,.11)+line(520,H0,816,H0,blue,3)+txt(824,H0+4,'d₁ ⊂ (P)',11.5,blue,'start',800);
   h+=line(668-dx,H0+dy,668+dx,H0-dy,slate,1.8,'5 4')+line(668-dx,topY+dy,668+dx,topY-dy,teal,3.2)+txt(668+dx+10,topY-dy,`d₂`,12,teal,'start',800);
   const my=H0+(topY-H0)*ph;
   h+=line(668,H0,668,topY,purple,2.8,'4 3')+dot(668,my,orange,5)+dot(668,H0,blue,6)+dot(668,topY,teal,7.5,'dist')+dot(668+dx,topY-dy,orange,7,'deg')+pill(676,(H0+topY)/2-10,76,20,`h = ${f(dist)}`,'#F5F3FF','#DDD6FE',purple,10.2)+pill(788,82,136,22,`d₁, d₂ chéo nhau`,'#EFF6FF','#BFDBFE',blue,10.2);
  }
 }else if(fam==='11-06'){
  if(mode===1){
   const gap=dist*26,y1=260-gap/2,y2=260+gap/2,mx=520+280*ph;
   h+=planePoly(668,260,340,78,blue,.1)+line(500,y1,836,y1,blue,3)+line(500,y2,836,y2,teal,3);
   h+=line(mx,y1,mx,y2,purple,2.2,'4 3')+dot(mx,y1,blue,7.5,'dist')+dot(mx,y2,teal,7.5,'dist')+txt(844,y1+4,'d₁',12,blue,'start',800)+txt(844,y2+4,'d₂',12,teal,'start',800)+pill(mx+10,250,74,20,`d = ${f(dist)}`,'#F5F3FF','#DDD6FE',purple,10.2);
  }else if(mode===2){
   const H0=310,yTop=H0-dist*34,mx=530+260*ph;
   h+=planePoly(668,H0,330,60,blue,.12)+line(510,H0,826,H0,teal,2.2,'5 4')+line(510,yTop,826,yTop,orange,3.2);
   h+=line(mx,yTop,mx,H0,purple,2.2,'4 3')+dot(mx,yTop,orange,7.5,'dist')+dot(mx,H0,teal,6)+txt(832,yTop+4,'d ∥ (P)',11.5,orange,'start',800)+txt(832,H0+4,"d' ⊂ (P)",11,teal,'start',750)+pill(mx+10,(yTop+H0)/2-10,74,20,`h = ${f(dist)}`,'#F5F3FF','#DDD6FE',purple,10.2);
  }else if(mode===3){
   const gap=dist*28,yP=200-gap/2,yQ=290+gap/2,mx=610+90*ph;
   h+=planePoly(668,yP,310,48,blue,.14)+planePoly(668,yQ,310,48,teal,.14);
   h+=line(580,yP-20,740,yP+20,orange,2.8)+line(580,yQ-20,740,yQ+20,orange,2.8)+line(mx,yP,mx,yQ,purple,2.4,'4 3')+dot(mx,yP,blue,7.5,'dist')+dot(mx,yQ,teal,7.5,'dist');
   h+=txt(485,yP+32,'(P)',12,blue,'start',800)+txt(485,yQ+32,'(Q)',12,teal,'start',800)+txt(748,yP+22,'a',12,orange,'start',800)+txt(748,yQ+22,'b (a ∥ b)',11.5,orange,'start',800)+pill(mx+8,(yP+yQ)/2-10,76,20,`h = ${f(dist)}`,'#F5F3FF','#DDD6FE',purple,10.2);
  }else{
   const H0=336,topY=H0-H*30,sh=(p.shift??1)*28,A=[560,topY],B=[720,topY+18],C=[640,topY-34];
   const Ap=[A[0]+sh,H0],Bp=[B[0]+sh,H0+18],Cp=[C[0]+sh,H0-34];
   h+=planePoly(668,H0,340,60,blue,.11)+`<polygon points="${A.join(',')} ${B.join(',')} ${C.join(',')}" fill="${orange}" fill-opacity="0.2" stroke="${orange}" stroke-width="2.4"/>`;
   h+=`<polygon points="${Ap.join(',')} ${Bp.join(',')} ${Cp.join(',')}" fill="${teal}" fill-opacity="0.22" stroke="${teal}" stroke-width="2.4"/>`;
   for(const [P0,P1,lb] of [[A,Ap,'A'],[B,Bp,'B'],[C,Cp,'C']]){
    const Mx=P0[0]+(P1[0]-P0[0])*ph,My=P0[1]+(P1[1]-P0[1])*ph;
    h+=line(P0[0],P0[1],P1[0],P1[1],slate,1.6,'4 3')+dot(Mx,My,purple,4.8)+dot(...P0,orange,6.5,'h')+dot(...P1,teal,6.5,'shift')+txt(P0[0]-6,P0[1]-8,lb,11,orange,'end',800)+txt(P1[0]+8,P1[1]+14,`${lb}'`,11,teal,'start',800);
   }
  }
 }else if(fam==='11-07'||fam==='11-08'){
  const isAngleLinePlane=(id==='11-08-C01'),isDihedral=(id==='11-07-C03'||id==='11-08-C02'),isPerp=(id==='11-07-C02'||id==='11-08-C03'),isSkewDist=(id==='11-08-C04');
  if(id==='11-07-C01'){
   const O=[668,276],L=130,ux=O[0]+L,uy=O[1],vx=O[0]+L*Math.cos(rad),vy=O[1]-L*Math.sin(rad);
   const shift=(1-ph)*42;
   h+=line(O[0]-90,O[1],ux,uy,blue,3)+line(O[0]-70*Math.cos(rad),O[1]+70*Math.sin(rad)-shift,vx,vy-shift,teal,2.2,'4 3');
   h+=line(O[0]-70*Math.cos(rad),O[1]+70*Math.sin(rad),vx,vy,orange,3)+dot(...O,ink,5.5)+dot(vx,vy,orange,7.5,'deg');
   h+=path(`M ${f(O[0]+38)} ${f(O[1])} A 38 38 0 0 0 ${f(O[0]+38*Math.cos(rad))} ${f(O[1]-38*Math.sin(rad))}`,purple,2.6)+txt(O[0]+52,O[1]-16,`${f(deg)}°`,12,purple,'start',800)+txt(ux+8,uy+4,'d₁',12,blue,'start',800)+txt(vx+8,vy-4,"d₂'",12,orange,'start',800);
  }else if(isPerp){
   const Hpt=[650,312],S=[650,312-H*34],M=[776,312],Pmov=[S[0],S[1]+(Hpt[1]-S[1])*ph];
   h+=planePoly(668,312,330,62,blue,.12)+line(540,312,796,312,blue,2.2)+line(600,348,710,276,teal,2.2);
   h+=line(S[0],S[1],Hpt[0],Hpt[1],purple,3.2)+`<polyline points="${Hpt[0]},${Hpt[1]-12} ${Hpt[0]+12},${Hpt[1]-12} ${Hpt[0]+12},${Hpt[1]}" fill="none" stroke="${purple}" stroke-width="2"/>`;
   if(id==='11-08-C03')h+=line(S[0],S[1],M[0],M[1],orange,2.2,'5 4')+dot(...M,orange,6)+txt(M[0]+8,M[1]+4,'M (SM > SH)',11,orange,'start',800);
   h+=dot(...S,orange,7.5,'h')+dot(...Hpt,purple,5.5)+dot(...Pmov,purple,4.8)+txt(S[0]-10,S[1]-8,'S',12,orange,'end',800)+txt(Hpt[0]-10,Hpt[1]+16,'H',12,purple,'end',800)+pill(S[0]-82,(S[1]+Hpt[1])/2-10,74,20,`SH = ${f(H)}`,'#F5F3FF','#DDD6FE',purple,10.2);
  }else if(isAngleLinePlane){
   const Hpt=[600,320],A=[770,320],S=[600,320-160*Math.sin(rad)],Pmov=[S[0],S[1]+(Hpt[1]-S[1])*ph];
   h+=planePoly(668,320,330,58,blue,.12)+`<polygon points="${S.join(',')} ${Hpt.join(',')} ${A.join(',')}" fill="${purple}" fill-opacity="0.14"/>`;
   h+=line(S[0],S[1],Hpt[0],Hpt[1],slate,2.4,'4 3')+line(Hpt[0],Hpt[1],A[0],A[1],teal,2.8)+line(S[0],S[1],A[0],A[1],orange,3.2);
   h+=`<polyline points="${Hpt[0]},${Hpt[1]-12} ${Hpt[0]+12},${Hpt[1]-12} ${Hpt[0]+12},${Hpt[1]}" fill="none" stroke="${purple}" stroke-width="2"/>`;
   h+=dot(...Pmov,purple,4.8)+dot(...S,orange,7.5,'deg')+dot(...Hpt,teal,5.5)+dot(...A,blue,6)+txt(S[0]-10,S[1]-6,'S',12,orange,'end',800)+txt(Hpt[0]-10,Hpt[1]+16,'H',12,teal,'end',800)+txt(A[0]+10,A[1]+4,'A',12,blue,'start',800)+pill(A[0]-92,A[1]-28,76,20,`φ = ${f(deg)}°`,'#F5F3FF','#DDD6FE',purple,10.2);
  }else if(isDihedral){
   const O=[640,310],R=145,curRad=rad*(0.25+0.75*ph),Qx=O[0]+R*Math.cos(curRad),Qy=O[1]-R*Math.sin(curRad);
   h+=planePoly(668,310,320,54,blue,.12)+`<polygon points="${O[0]-50},${O[1]+35} ${O[0]+50},${O[1]-35} ${f(Qx+50)},${f(Qy-35)} ${f(Qx-50)},${f(Qy+35)}" fill="${orange}" fill-opacity="0.18" stroke="${orange}" stroke-width="2"/>`;
   h+=line(O[0],O[1],O[0]+R,O[1],blue,3)+line(O[0],O[1],Qx,Qy,orange,3)+dot(...O,ink,5.5)+dot(Qx,Qy,orange,7.5,'deg');
   if(id==='11-07-C03'){
    // 11-07-C03: Hai mặt phẳng vuông góc (thêm đường thẳng a ⊂ (Q), a ⊥ Δ chứng minh (Q) ⊥ (P))
    h+=line(O[0]-50,O[1]+35,O[0]+50,O[1]-35,purple,3)+txt(O[0]-54,O[1]+48,'Δ = (P)∩(Q)',10.5,purple,'middle',800);
    h+=line(Qx,Qy,Qx,O[1],teal,2,'4 3')+dot(Qx,O[1],teal,5.5)+txt(Qx+8,(Qy+O[1])/2,'a ⊂ (Q)',10.5,teal,'start',800);
   }
   h+=path(`M ${f(O[0]+42)} ${f(O[1])} A 42 42 0 0 0 ${f(O[0]+42*Math.cos(curRad))} ${f(O[1]-42*Math.sin(curRad))}`,purple,2.8)+pill(O[0]+50,O[1]-36,id==='11-07-C03'?118:82,20,id==='11-07-C03'?`(P)⊥(Q): φ=${f(deg)}°`:`[P,d,Q] = ${f(deg)}°`,'#F5F3FF','#DDD6FE',purple,10.2)+txt(O[0]+R+8,O[1]+4,'Ox ⊂ (P)',11,blue,'start',800)+txt(Qx+8,Qy,`Oy ⊂ (Q)`,11,orange,'start',800);
  }else if(isSkewDist){
   const I=[668,316],J=[668,316-dist*34],dx=115*Math.cos(rad),dy=52*Math.sin(rad),my=I[1]+(J[1]-I[1])*ph;
   h+=planePoly(668,316,330,56,blue,.1)+line(520,316,816,316,blue,3)+line(668-dx,J[1]+dy,668+dx,J[1]-dy,teal,3);
   h+=line(I[0],I[1],J[0],J[1],purple,3.2)+`<polyline points="${I[0]},${I[1]-10} ${I[0]+10},${I[1]-10} ${I[0]+10},${I[1]}" fill="none" stroke="${purple}" stroke-width="1.8"/>`;
   h+=dot(668,my,orange,4.8)+dot(...I,blue,5.5)+dot(...J,teal,7.5,'dist')+dot(668+dx,J[1]-dy,orange,7,'deg')+txt(I[0]-10,I[1]+16,'H ∈ d₁',11,blue,'end',800)+txt(J[0]-10,J[1]-8,'K ∈ d₂',11,teal,'end',800)+pill(680,(I[1]+J[1])/2-10,82,20,`HK = ${f(dist)}`,'#F5F3FF','#DDD6FE',purple,10.2);
  }
 }else{
  const m=grade11Math(id,p).result,Hpx=H*30,baseY=356,topY=baseY-Hpx,zPx=baseY-Hpx*ph,open=.28+.72*ph;
  if(mode===1){
   const cx=535,w=a*21,B1=[cx-w,baseY],B2=[cx+w,baseY],B3=[cx,baseY-36],T1=[B1[0],topY],T2=[B2[0],topY],T3=[B3[0],topY-36],S1=[B1[0],zPx],S2=[B2[0],zPx],S3=[B3[0],zPx-36];
   h+=`<polygon points="${B1.join(',')} ${B2.join(',')} ${B3.join(',')}" fill="${blue}" fill-opacity="0.16" stroke="${blue}" stroke-width="2.2"/>`;
   h+=`<polygon points="${S1.join(',')} ${S2.join(',')} ${S3.join(',')}" fill="${orange}" fill-opacity="0.26" stroke="${orange}" stroke-width="2.2"/>`;
   h+=`<polygon points="${T1.join(',')} ${T2.join(',')} ${T3.join(',')}" fill="${teal}" fill-opacity="0.14" stroke="${teal}" stroke-width="2.2"/>`;
   h+=line(...B1,...T1,blue,2.2)+line(...B2,...T2,blue,2.2)+line(...B3,...T3,slate,1.8,'4 3')+dot(...T2,teal,7.5,'h')+dot(...B2,blue,7.5,'a');
   const nw=Math.min(48,a*14)*open,nh=Math.min(115,H*24),nx=795-1.5*nw,ny=255-nh/2,th=nw*0.866;
   for(let j=0;j<3;j++)h+=`<rect x="${f(nx+j*nw)}" y="${f(ny)}" width="${f(nw)}" height="${f(nh)}" fill="${j%2?purple:orange}" fill-opacity="0.2" stroke="${j%2?purple:orange}" stroke-width="1.8"/>`;
   h+=`<polygon points="${f(nx+nw)},${f(ny)} ${f(nx+2*nw)},${f(ny)} ${f(nx+1.5*nw)},${f(ny-th)}" fill="${blue}" fill-opacity="0.22" stroke="${blue}" stroke-width="1.8"/>`;
   h+=`<polygon points="${f(nx+nw)},${f(ny+nh)} ${f(nx+2*nw)},${f(ny+nh)} ${f(nx+1.5*nw)},${f(ny+nh+th)}" fill="${blue}" fill-opacity="0.22" stroke="${blue}" stroke-width="1.8"/>`;
   h+=txt(795,ny-th-10,'Khai triển 2D (3 mặt bên + 2 đáy)',10.5,ink,'middle',800)+txt(795,ny+nh+th+16,`S_xq = 3a·h = ${f(3*a*H)}`,10.5,orange,'middle',800);
   h+=pill(780,82,138,22,`V = B·h = ${f(m.volume)}`,'#F5F3FF','#DDD6FE',purple,10.2)+txt(cx,baseY+20,`a = ${f(a)}`,11.5,blue,'middle',800)+txt(B2[0]+10,(baseY+topY)/2,`h = ${f(H)}`,11.5,purple,'start',800);
  }else if(mode===2){
   const cx=535,w=a*19,S=[cx,topY-18],B1=[cx-w-18,baseY+15],B2=[cx+w-18,baseY+15],B3=[cx+w+18,baseY-15],B4=[cx-w+18,baseY-15],O=[cx,baseY];
   const k=0.15+0.85*(1-ph),P1=[S[0]+(B1[0]-S[0])*k,S[1]+(B1[1]-S[1])*k],P2=[S[0]+(B2[0]-S[0])*k,S[1]+(B2[1]-S[1])*k],P3=[S[0]+(B3[0]-S[0])*k,S[1]+(B3[1]-S[1])*k],P4=[S[0]+(B4[0]-S[0])*k,S[1]+(B4[1]-S[1])*k];
   h+=`<polygon points="${B1.join(',')} ${B2.join(',')} ${B3.join(',')} ${B4.join(',')}" fill="${blue}" fill-opacity="0.16" stroke="${blue}" stroke-width="2.2"/>`;
   h+=`<polygon points="${P1.join(',')} ${P2.join(',')} ${P3.join(',')} ${P4.join(',')}" fill="${orange}" fill-opacity="0.24" stroke="${orange}" stroke-width="2"/>`;
   for(const B of [B1,B2,B3,B4])h+=line(...S,...B,slate,2);
   const ncx=800,ncy=265,bs=Math.min(54,a*14),dSlant=Math.hypot(H,a/2),wing=Math.min(64,dSlant*13)*open,hb=bs/2;
   h+=`<rect x="${f(ncx-hb)}" y="${f(ncy-hb)}" width="${f(bs)}" height="${f(bs)}" fill="${blue}" fill-opacity="0.22" stroke="${blue}" stroke-width="2"/>`;
   for(const pts of [[[ncx-hb,ncy-hb],[ncx+hb,ncy-hb],[ncx,ncy-hb-wing]],[[ncx+hb,ncy-hb],[ncx+hb,ncy+hb],[ncx+hb+wing,ncy]],[[ncx+hb,ncy+hb],[ncx-hb,ncy+hb],[ncx,ncy+hb+wing]],[[ncx-hb,ncy+hb],[ncx-hb,ncy-hb],[ncx-hb-wing,ncy]]]){
    h+=`<polygon points="${pts.map(pt=>pt.map(f).join(',')).join(' ')}" fill="${orange}" fill-opacity="0.22" stroke="${orange}" stroke-width="1.8"/>`;
   }
   h+=txt(ncx,ncy-hb-wing-10,'Khai triển 2D (1 đáy + 4 mặt bên)',10.5,ink,'middle',800)+txt(ncx,ncy+hb+wing+16,`d = ${f(dSlant)} · S_xq = ${f(2*a*dSlant)}`,10.5,orange,'middle',800);
   h+=line(...S,...O,purple,2.6,'4 3')+dot(...S,orange,7.5,'h')+dot(...B2,blue,7.5,'a')+dot(...O,purple,5.5)+txt(S[0],S[1]-10,'S',12,orange,'middle',800)+txt(O[0]+8,O[1]+14,'H',11.5,purple,'start',800)+pill(772,82,146,22,`V = ⅓B·h = ${f(m.volume)}`,'#F5F3FF','#DDD6FE',purple,10.2);
  }else{
   const cx=535,w1=a*19,w2=b*19,B1=[cx-w1-18,baseY+14],B2=[cx+w1-18,baseY+14],B3=[cx+w1+18,baseY-14],B4=[cx-w1+18,baseY-14];
   const T1=[cx-w2-11,topY+8],T2=[cx+w2-11,topY+8],T3=[cx+w2+11,topY-8],T4=[cx-w2+11,topY-8];
   const Apex=[cx,topY-42];
   h+=`<polygon points="${B1.join(',')} ${B2.join(',')} ${B3.join(',')} ${B4.join(',')}" fill="${blue}" fill-opacity="0.16" stroke="${blue}" stroke-width="2.2"/>`;
   h+=`<polygon points="${T1.join(',')} ${T2.join(',')} ${T3.join(',')} ${T4.join(',')}" fill="${teal}" fill-opacity="0.22" stroke="${teal}" stroke-width="2.2"/>`;
   for(const [P0,P1] of [[B1,T1],[B2,T2],[B3,T3],[B4,T4]]){
    h+=line(...P0,...P1,slate,2);
    if(ph<0.75)h+=line(...P1,...Apex,orange,1.2,'3 3');
   }
   const ncx=800,ncy=268,bs1=Math.min(54,a*13),bs2=Math.min(34,b*13),dSlant=Math.hypot(H,(a-b)/2),wing=Math.min(46,dSlant*11)*open,hb1=bs1/2,hb2=bs2/2;
   h+=`<rect x="${f(ncx-hb1)}" y="${f(ncy-hb1)}" width="${f(bs1)}" height="${f(bs1)}" fill="${blue}" fill-opacity="0.22" stroke="${blue}" stroke-width="2"/>`;
   for(const pts of [[[ncx-hb1,ncy-hb1],[ncx+hb1,ncy-hb1],[ncx+hb2,ncy-hb1-wing],[ncx-hb2,ncy-hb1-wing]],[[ncx+hb1,ncy-hb1],[ncx+hb1,ncy+hb1],[ncx+hb1+wing,ncy+hb2],[ncx+hb1+wing,ncy-hb2]],[[ncx+hb1,ncy+hb1],[ncx-hb1,ncy+hb1],[ncx-hb2,ncy+hb1+wing],[ncx+hb2,ncy+hb1+wing]],[[ncx-hb1,ncy+hb1],[ncx-hb1,ncy-hb1],[ncx-hb1-wing,ncy-hb2],[ncx-hb1-wing,ncy+hb2]]]){
    h+=`<polygon points="${pts.map(pt=>pt.map(f).join(',')).join(' ')}" fill="${orange}" fill-opacity="0.22" stroke="${orange}" stroke-width="1.8"/>`;
   }
   h+=`<rect x="${f(ncx-hb2)}" y="${f(ncy-hb1-wing-bs2)}" width="${f(bs2)}" height="${f(bs2)}" fill="${teal}" fill-opacity="0.24" stroke="${teal}" stroke-width="1.8"/>`;
   h+=txt(ncx,ncy-hb1-wing-bs2-8,'Khai triển chóp cụt (2 đáy + 4 mặt thang)',10.2,ink,'middle',800)+txt(ncx,ncy+hb1+wing+16,`S_xq = 2(a+b)d = ${f(2*(a+b)*dSlant)}`,10.5,orange,'middle',800);
   const my=baseY+(topY-baseY)*ph;
   h+=line(cx,topY,cx,baseY,purple,2.6,'4 3')+dot(cx,my,orange,4.8)+dot(cx,topY,purple,7.5,'h')+dot(...B2,blue,7.5,'a')+dot(...T2,teal,7.5,'b')+txt(cx,baseY+32,`S₁ = a² = ${f(a*a)}`,11,blue,'middle',800)+txt(cx,topY-18,`S₂ = b² = ${f(b*b)}`,11,teal,'middle',800)+pill(780,82,138,22,`V = ${f(m.volume)}`,'#F5F3FF','#DDD6FE',purple,10.2);
  }
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="394 70 550 412" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block;background:#F8FAFC">${h}</svg>`;
}

/** Geometry-only SVG, truthful 2D modes. For spatial cases use grade11SolidModel with Three.js. */
export function grade11SceneSVG(id,p,t=0,opt={}){
 const math=grade11Math(id,p,opt),family=grade11Family(id);
 let svg;if(family==='11-01')svg=angles(id,p,t);
 else if(family==='11-02')svg=trigEquations(id,p,t);
 else if(family==='11-03')svg=sequence(id,p,t);
 else if(family==='11-04')svg=grouped(id,p,t);
 else if(family==='11-10')svg=limits(id,p,t);
 else if(family==='11-13')svg=probability(id,p,t,opt);
 else throw Error('Lab không gian 3D phải dùng WebGL: '+id);
 if(!math.latex||/NaN|Infinity|undefined|<script/i.test(svg))throw Error('Lỗi dữ liệu SVG Toán 11: '+id);
 return svg;
}
