import {grade12Math,grade12Grouped,grade12Bayes,grade12Optimization,grade12Volume,grade12Valid,R85_PALETTE,monotoneProgress,stageIndexFromProgress} from './grade12-engine.mjs';
import {formatMathText} from './math-formula-renderer.mjs';

const c={
 blue:R85_PALETTE.origin,      // #1D4ED8
 teal:R85_PALETTE.compare,     // #15803D
 orange:R85_PALETTE.active,    // #C2410C
 purple:R85_PALETTE.result,    // #7C3AED
 slate:R85_PALETTE.aux,        // #64748B
 red:R85_PALETTE.invalid,      // #B91C1C
 ox:R85_PALETTE.axes.Ox,       // #9A3412
 oy:R85_PALETTE.axes.Oy,       // #15803D
 oz:R85_PALETTE.axes.Oz,       // #1D4ED8
 ink:'#1E293B',
 light:'#EFF6FF',
 grid:'#E2E8F0'
};

const n=x=>Number.isFinite(Number(x))?Number(Number(x).toFixed(2)):String(x);
const short=(s,max=43)=>String(s).length>max?String(s).slice(0,max-1)+'…':String(s);
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const text=(x,y,s,size=13,color=c.ink,anchor='start',w=700)=>`<text x="${n(x)}" y="${n(y)}" fill="${color}" font-size="${size}" text-anchor="${anchor}" font-weight="${w}" font-family="Inter,Segoe UI,Arial,sans-serif">${esc(formatMathText(s))}</text>`;
const rect=(x,y,w,h,color=c.light,stroke=c.grid,rx=6)=>`<rect x="${n(x)}" y="${n(y)}" width="${n(Math.max(0,w))}" height="${n(Math.max(0,h))}" rx="${rx}" fill="${color}" stroke="${stroke}" stroke-width="1.6"/>`;
const line=(x1,y1,x2,y2,color=c.ink,width=2,dash='')=>`<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${color}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
const dot=(x,y,col=c.red,r=6.8,handle='')=>`<circle cx="${n(x)}" cy="${n(y)}" r="${r}" fill="${col}" stroke="white" stroke-width="2" ${handle?`data-handle="${handle}" style="cursor:grab;touch-action:none"`:''}/>`;
const pill=(x,y,w,h,s,bg='#EFF6FF',bd='#BFDBFE',col='#1E3A8A',sz=11.0)=>`<g>${rect(x,y,w,h,bg,bd,7)}${text(x+w/2,y+h/2+4,s,sz,col,'middle',750)}</g>`;

const phase=(t,dur=6)=>monotoneProgress(t,dur,{holdAtEnd:true});
const stagePill=(x,y,ph,labels)=>{
 const idx=stageIndexFromProgress(ph);
 const lb=labels[idx-1]||labels[labels.length-1]||'';
 return pill(x,y,232,22,`Cảnh ${idx}/4 (${Math.round(ph*100)}%): ${lb}`,'#F5F3FF','#DDD6FE',c.purple,10.0);
};

function frac12(x,y,lhs,num,den,rhs='',col='#1E3A8A',s=12){
 const lw=lhs?String(lhs).length*(s*.56)+6:0,nw=Math.max(String(num).length,String(den).length)*(s*.56)+12,cx=x+lw+nw/2,rx=x+lw+nw+6;
 return `<g data-fy="${y}"><desc>${esc(`${lhs}${num}/${den}${rhs}`)}</desc>${lhs?text(x,y,lhs,s,col,'start',700):''}${text(cx,y-8,num,s-1,col,'middle',700)}${line(x+lw,y-4,x+lw+nw,y-4,col,1.6)}${text(cx,y+11,den,s-1,col,'middle',700)}${rhs?text(rx,y,rhs,s,col,'start',700):''}</g>`;
}
function card12(title,badge,rows=[],obs='',corr=''){
 const rawDesc=rows.map(r=>typeof r==='string'?r.replace(/<[^>]+>/g,' '):r.t).join(' | ');
 const fracRow=rows.find(r=>typeof r==='string');
 const textRows=rows.filter(r=>typeof r!=='string');
 const displayRows=fracRow?[fracRow,...textRows.slice(0,2)]:textRows.slice(0,3);
 return `<g opacity="0" pointer-events="none"><desc>1. Quan sát: ${esc(obs)} | 2. Tương quan: ${esc(corr)} | ${esc(rawDesc)}</desc>
 <defs><clipPath id="g12-card-clip"><rect x="24" y="78" width="358" height="196" rx="12"/></clipPath></defs>
 ${rect(20,74,368,204,'#F8FAFC','#CBD5E1',14)}
 <g clip-path="url(#g12-card-clip)">
  ${rect(32,86,344,30,'#EFF6FF','#BFDBFE',8)}
  ${text(42,106,short(title,27),13.2,'#1E3A8A','start',800)}${badge?pill(268,89,102,24,badge,c.blue,c.blue,'#fff',10.8):''}
  ${displayRows.map((r,i)=>{
   if(typeof r==='string'){const m=r.match(/data-fy="(\d+)"/);const fy=m?Number(m[1]):174;return `<g transform="translate(0,${(150+i*42)-fy})">${r}</g>`;}
   return text(36,148+i*40,short(r.t.replace(/^•\s*/,''),44),r.s||12.4,r.c||c.ink,'start',r.w||750);
  }).join('')}
 </g></g>`;
}
function stageBox(x=398,y=74,w=542,h=404){return rect(x,y,w,h,'#FFFFFF','#CBD5E1',14);}
const wrapper=(h,id,title,conclusion)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="394 70 550 412" preserveAspectRatio="xMidYMid meet" width="960" height="500" role="img" aria-label="${esc(title)}" style="width:100%;height:100%;max-height:100%;display:block;background:#F8FAFC;touch-action:none">
 <desc>3. KẾT LUẬN SGK: ${esc(conclusion)}</desc>
 <g opacity="0" pointer-events="none">
  <defs><clipPath id="g12-foot-clip"><rect x="24" y="292" width="358" height="52" rx="10"/></clipPath></defs>
  ${rect(10,10,940,480,'#FFFFFF','#CBD5E1',18)}
  ${rect(20,18,920,46,'#EFF6FF','#BFDBFE',12)}
  ${text(36,46,`${id} • ${title}`,16.2,'#1E3A8A','start',800)}${pill(750,28,176,26,'SGK Toán 12 • R85 Chiều sâu',c.blue,c.blue,'#fff',11)}
 </g>
 ${h}
 <g opacity="0" pointer-events="none">
  ${rect(20,288,368,60,'#ECFDF5','#A7F3D0',12)}
  <g clip-path="url(#g12-foot-clip)">${text(36,323,short(conclusion,46),12.2,c.teal,'start',800)}</g>
 </g></svg>`;
const axes=(xmin,xmax,ymin,ymax)=>{
 const left=424,right=916,top=104,bottom=396;
 const X=x=>left+(x-xmin)/(xmax-xmin)*(right-left),Y=y=>bottom-(y-ymin)/(ymax-ymin)*(bottom-top);
 let h=stageBox();
 for(let i=0;i<=8;i++){const x=left+(right-left)*i/8;h+=line(x,top,x,bottom,c.grid,1);}
 for(let i=0;i<=5;i++){const y=top+(bottom-top)*i/5;h+=line(left,y,right,y,c.grid,1);}
 h+=line(left,Y(Math.max(ymin,Math.min(ymax,0))),right,Y(Math.max(ymin,Math.min(ymax,0))),c.slate,1.8);
 h+=line(X(Math.max(xmin,Math.min(xmax,0))),top,X(Math.max(xmin,Math.min(xmax,0))),bottom,c.slate,1.8);
 return {h,X,Y,left,right,top,bottom};
};
const path=(fn,from,to,X,Y,segments=120,col=c.blue)=>{let d='';for(let i=0;i<=segments;i++){const x=from+(to-from)*i/segments,y=fn(x);if(!Number.isFinite(y))continue;d+=(d?' L':'M')+n(X(x))+' '+n(Y(y));}return `<path d="${d}" stroke="${col}" stroke-width="3.2" fill="none"/>`;};

function optimization(id,p,t){
 const mode=Number(id.slice(-2)),v=grade12Optimization(id,p),ph=phase(t,6);let maxX,fn,dfn,x,label;
 if(mode===1){maxX=p.P/2;fn=z=>z*(p.P/2-z);dfn=z=>(p.P/2)-2*z;x=p.x;label='Tối ưu diện tích hình chữ nhật';}
 else {maxX=p.demand/p.slope;fn=z=>z*(p.demand-p.slope*z);dfn=z=>p.demand-2*p.slope*z;x=p.price;label='Tối ưu doanh thu R(p) theo giá p';}
 const best=fn(v.optimum),{h:axesHtml,X,Y}=axes(0,maxX,0,best*1.22);let h=axesHtml;
 const startTrial=Math.max(0.12*maxX,Math.min(0.88*maxX,Math.abs(x-v.optimum)>0.08*maxX?x:0.22*maxX));
 const trial=startTrial+(v.optimum-startTrial)*ph;
 const slopeTrial=dfn(trial),dxT=maxX*0.14;
 // Parabolic objective curve (origin #1D4ED8)
 h+=path(fn,0,maxX,X,Y,120,c.blue);
 // User handle position (compare #15803D) & animated trial point (active #C2410C)
 h+=line(X(x),Y(fn(x)),X(x),Y(0),c.teal,1.8,'5 4')+dot(X(x),Y(fn(x)),c.red,8.2,mode===1?'x':'price');
 h+=line(X(trial),Y(fn(trial)),X(trial),Y(0),c.orange,2.0,'4 3');
 h+=line(X(Math.max(0,trial-dxT)),Y(fn(trial)-slopeTrial*dxT),X(Math.min(maxX,trial+dxT)),Y(fn(trial)+slopeTrial*dxT),c.orange,2.4);
 h+=dot(X(trial),Y(fn(trial)),c.orange,6.8);
 // Optimal apex & horizontal tangent (result #7C3AED)
 h+=line(X(Math.max(0,v.optimum-maxX*.22)),Y(v.best),X(Math.min(maxX,v.optimum+maxX*.22)),Y(v.best),c.purple,2.8,'7 4');
 h+=dot(X(v.optimum),Y(v.best),c.purple,7.8);
 h+=pill(Math.min(790,Math.max(430,X(v.optimum)-70)),Math.max(106,Y(v.best)-28),140,21,`Đỉnh tối ưu (${n(v.optimum)}; ${n(v.best)})`,'#F5F3FF','#DDD6FE',c.purple,10.2);
 if(mode===1){
  const wRect=Math.max(24,Math.min(126,trial/(p.P/2)*152)),hRect=Math.max(24,Math.min(92,(p.P/2-trial)/(p.P/2)*152));
  const wOpt=Math.max(24,Math.min(126,v.optimum/(p.P/2)*152));
  h+=rect(438,118,wOpt,wOpt,'#F5F3FF',c.purple,4);
  h+=rect(438,118,wRect,hRect,'#DBEAFE88',c.blue,4)+text(438+wRect/2,113,`x=${n(trial)}`,10.8,c.blue,'middle',800)+text(438+wRect+6,118+hRect/2,`y=${n(p.P/2-trial)}`,10.8,c.teal,'start',800);
 }else{
  const qNow=Math.max(0,p.demand-p.slope*trial);
  h+=pill(436,114,196,22,`Giá thử p=${n(trial)} ⇒ Q=${n(qNow)}, R=${n(fn(trial))}`,'#FFF7ED','#FED7AA',c.orange,10.0);
 }
 h+=stagePill(700,80,ph,mode===1?['Chu vi cố định P','Biến thiên cạnh x','Đạo hàm S\'(x)=0','Hình vuông cực đại']:['Hàm cầu Q(p)','Khảo sát R(p)','Điểm dừng R\'(p)=0','Giá tối ưu p*']);
 const rows=mode===1?[
  {t:`• Chu vi P = 2(x + y) = ${n(p.P)} ⇒ y = ${n(p.P/2)} − x`,c:c.blue,w:800},
  {t:`• Diện tích: S(x) = −x² + ${n(p.P/2)}x`,c:c.teal,w:800},
  {t:`• Đạo hàm: S'(x) = −2x + ${n(p.P/2)} = 0 ⇔ x₀ = ${n(v.optimum)}`,c:c.orange,w:800},
  {t:`• Tại x = ${n(x)}: y = ${n(p.P/2-x)} ⇒ S(x) = ${n(v.value)}`,c:c.ink,w:750},
  {t:`• GTLN: max S = S(${n(v.optimum)}) = ${n(v.best)} (hình vuông)`,c:c.purple,w:800}
 ]:[
  {t:`• Hàm cầu: Q(p) = ${n(p.demand)} − ${n(p.slope)}p (giá p = ${n(x)})`,c:c.blue,w:800},
  {t:`• Doanh thu: R(p) = −${n(p.slope)}p² + ${n(p.demand)}p`,c:c.teal,w:800},
  {t:`• Đạo hàm: R'(p) = −${n(2*p.slope)}p + ${n(p.demand)} = 0 ⇔ p₀ = ${n(v.optimum)}`,c:c.orange,w:800},
  {t:`• Tại p = ${n(x)}: R(p) = ${n(v.value)} (lượng cầu Q = ${n(v.demand)})`,c:c.ink,w:750},
  {t:`• Doanh thu cực đại: max R = R(${n(v.optimum)}) = ${n(v.best)}`,c:c.purple,w:800}
 ];
 h+=card12(label,id,rows,'Đồ thị hàm mục tiêu parabol với tiếp tuyến ngang tại đỉnh cực đại.','Kéo điểm đỏ hoặc phát chuyển động để hội tụ về điểm dừng đạo hàm bằng 0.');
 return wrapper(h,id,label,mode===1?`Trong các hình chữ nhật có chu vi P = ${n(p.P)}, hình vuông cạnh x₀ = ${n(v.optimum)} có diện tích lớn nhất S_max = ${n(v.best)}.`:`Doanh thu R(p) đạt GTLN = ${n(v.best)} tại điểm dừng R'(p₀) = 0 ⇔ giá bán tối ưu p₀ = ${n(v.optimum)}.`);
}

function grouped(id,p,t){
 const mode=Number(id.slice(-2)),s=grade12Grouped(p),ph=phase(t,6),scale=11.2,base=378;
 let h=stageBox()+line(422,base,916,base,c.slate,2)+line(422,104,422,base,c.slate,2);
 const focus=Math.min(3,Math.floor(ph*3.999)),cum=[];let running=0;
 const Xv=v=>448+((v-p.lo)/Math.max(1e-6,4*p.w))*428;
 for(let i=0;i<4;i++){
  const x=448+i*112,w=92,hCol=s.counts[i]*scale*(0.35+0.65*ph),y=base-hCol,rep=p.lo+(i+.5)*p.w;running+=s.counts[i];cum.push(running);
  const isFocus=i===focus;
  h+=rect(x,y,w,base-y,isFocus?'#FFEDD5':'#DBEAFE',isFocus?c.orange:c.blue,5);
  h+=text(x+w/2,y-10,`n_${i+1}=${s.counts[i]}`,11.2,c.ink,'middle',800)+text(x+w/2,398,`[${n(p.lo+i*p.w)};${n(p.lo+(i+1)*p.w)})`,10.8,c.ink,'middle',700)+text(x+w/2,414,`c_${i+1}=${n(rep)}`,10.4,c.teal,'middle',700);
  h+=dot(x+w/2,base-s.counts[i]*scale,c.red,6.8,'n'+(i+1));
 }
 h+=pill(428,80,142,22,mode===1?`R = ${n(s.range)}`:mode===2?`Δ_Q ≈ ${n(s.iqr)}`:`s ≈ ${n(s.sd)} (s² ≈ ${n(s.variance)})`,'#F5F3FF','#DDD6FE',c.purple,10.2);
 h+=stagePill(700,80,ph,mode===1?['Các lớp ghép nhóm','Biên dưới a₁','Biên trên a_{k+1}','Khoảng biến thiên R']:mode===2?['Tần số tích lũy','Nội suy Q₁, Me','Nội suy Q₃','Khoảng tứ phân vị Δ_Q']:['Giá trị đại diện cᵢ','Số trung bình x̄','Độ lệch (cᵢ − x̄)²','Phương sai s² & độ lệch chuẩn s']);
 h+=line(Xv(s.mean),112,Xv(s.mean),base,c.orange,2.2,'6 4')+pill(Math.min(826,Math.max(430,Xv(s.mean)-48)),110,96,20,`x_TB ≈ ${n(s.mean)}`,'#FFF7ED','#FED7AA',c.orange,10.2);
 if(mode===1){
  const xMin=448,xMax=448+3*112+92,xSpan=xMin+(xMax-xMin)*(0.25+0.75*ph);
  h+=line(xMin,166,xSpan,166,c.purple,3.6)+line(xMin,154,xMin,178,c.blue,2.6)+line(xMax,154,xMax,178,c.teal,2.6);
  h+=pill((xMin+xMax)/2-78,136,156,22,`R = a₅ − a₁ = ${n(p.lo+4*p.w)} − ${n(p.lo)} = ${n(s.range)}`,'#F5F3FF','#DDD6FE',c.purple,10.2);
 }else if(mode===2){
  const xQ1=Xv(s.Q1),xMe=Xv(s.Me),xQ3=Xv(s.Q3);
  h+=rect(xQ1,206,Math.max(4,(xQ3-xQ1)*(0.25+0.75*ph)),28,'#F5F3FFAA',c.purple,5);
  h+=line(xQ1,198,xQ1,242,c.teal,2.8)+line(xMe,198,xMe,242,c.orange,2.4,'4 3')+line(xQ3,198,xQ3,242,c.blue,2.8);
  h+=pill((xQ1+xQ3)/2-64,176,128,22,`Δ_Q = Q₃ − Q₁ ≈ ${n(s.iqr)}`,'#F5F3FF','#DDD6FE',c.purple,10.4);
 }else{
  const xLo=Xv(Math.max(p.lo,s.mean-s.sd*(0.25+0.75*ph))),xHi=Xv(Math.min(p.lo+4*p.w,s.mean+s.sd*(0.25+0.75*ph)));
  h+=rect(xLo,164,Math.max(4,xHi-xLo),20,'#F5F3FFAA',c.purple,5);
  h+=line(xLo,174,xHi,174,c.purple,3.4);
  h+=pill(Math.min(796,Math.max(430,Xv(s.mean)-76)),138,152,22,`x_TB ± s = [${n(s.mean-s.sd)}; ${n(s.mean+s.sd)}]`,'#F5F3FF','#DDD6FE',c.purple,10.0);
 }
 const titles=['Khoảng biến thiên R ghép nhóm','Khoảng tứ phân vị Δ_Q ghép nhóm','Phương sai s² & Độ lệch chuẩn s'];
 h+=card12(titles[mode-1],id,[
  {t:`• Cỡ mẫu N = ${s.N}  |  Tần số: [${s.counts.join('; ')}]`,c:c.blue,w:800},
  {t:`• Số trung bình: x_TB ≈ ${n(s.mean)}`,c:c.orange,w:800},
  mode===1?{t:`• Khoảng biến thiên: R = ${n(p.lo+4*p.w)} − ${n(p.lo)} = ${n(s.range)}`,c:c.purple,w:800}:
  mode===2?{t:`• Q₁ ≈ ${n(s.Q1)}, Q₃ ≈ ${n(s.Q3)} ⇒ Δ_Q ≈ ${n(s.iqr)}`,c:c.purple,w:800}:
  {t:`• Phương sai: s² = (1/N)∑ n_i(c_i − x_TB)² ≈ ${n(s.variance)}`,c:c.purple,w:800},
  {t:`• Độ lệch chuẩn: s = √s² ≈ ${n(s.sd)}  |  R = ${n(s.range)}`,c:c.ink,w:750},
  {t:`• Nhóm ${focus+1}: tần số tích lũy CF_${focus+1} = ${cum[focus]}/${s.N}`,c:c.teal,s:11.4}
 ],'Biểu đồ tần số ghép nhóm kèm đường trung bình x_TB và thước đo phân tán.','Kéo nút đỏ đỉnh cột để thay đổi phân bố tần số các nhóm.');
 return wrapper(h,id,titles[mode-1],mode===1?`Khoảng biến thiên R = a_{k+1} − a₁ = ${n(s.range)} đo độ trải rộng mẫu ghép nhóm.`:mode===2?`Khoảng tứ phân vị Δ_Q = Q₃ − Q₁ ≈ ${n(s.iqr)} đo độ phân tán 50% số liệu giữa.`:`Phương sai s² ≈ ${n(s.variance)} và độ lệch chuẩn s ≈ ${n(s.sd)} đo độ phân tán quanh x_TB ≈ ${n(s.mean)}.`);
}

function antiderivative(id,p,t){
 const ph=phase(t,6),a=axes(-1.6,3.0,-1.2,5.6);let h=a.h;
 const fun=x=>x*x,anti=x=>x**3/3,antiUp=x=>x**3/3+1.1,antiDn=x=>x**3/3-1.1;
 // Family of shifted antiderivatives F(x) + C (aux #64748B)
 h+=path(antiUp,-1.6,2.8,a.X,a.Y,100,c.slate).replace('stroke-width="3.2"','stroke-width="1.6" stroke-dasharray="5 4"');
 h+=path(antiDn,-1.5,3.0,a.X,a.Y,100,c.slate).replace('stroke-width="3.2"','stroke-width="1.6" stroke-dasharray="5 4"');
 // Primary antiderivative F(x) = x³/3 (origin #1D4ED8) and derivative f(x) = x² (compare #15803D)
 h+=path(anti,-1.6,3.0,a.X,a.Y,140,c.blue)+path(fun,-1.6,2.35,a.X,a.Y,140,c.teal);
 const xStart=Math.max(-1.1,p.x-0.85),x=xStart+(p.x-xStart)*ph;
 const yy=anti(x),slope=fun(x),dx=Math.min(.55,2.4-x),dy=slope*dx;
 // Vertical alignment connecting (x, F(x)) and (x, f(x))
 h+=line(a.X(x),a.Y(Math.min(0,yy,slope)),a.X(x),a.Y(Math.max(0,yy,slope)),c.slate,1.6,'4 3');
 // Differential triangle (result #7C3AED) & tangent line (active #C2410C)
 h+=line(a.X(x),a.Y(yy),a.X(x+dx),a.Y(yy),c.purple,2.2,'4 3')+line(a.X(x+dx),a.Y(yy),a.X(x+dx),a.Y(yy+dy),c.purple,2.4,'4 3');
 h+=line(a.X(x-.38),a.Y(yy-slope*.38),a.X(x+dx+.18),a.Y(yy+slope*(dx+.18)),c.orange,3.0);
 h+=dot(a.X(x),a.Y(yy),c.red,8,'x')+dot(a.X(x),a.Y(slope),c.teal,7);
 h+=pill(428,80,128,22,'F(x) = x³/3 + C','#EFF6FF','#BFDBFE',c.blue,10.2);
 h+=pill(562,80,132,22,`F'(x) = f(x) = ${n(slope)}`,'#ECFDF5','#A7F3D0',c.teal,10.2);
 h+=stagePill(700,80,ph,['Đồ thị F(x) & f(x)','Tiếp tuyến tại x','Tam giác vi phân','Họ F(x) + C']);
 h+=card12('Nguyên hàm F(x) & Đạo hàm f(x)',id,[
  {t:`• Hàm dưới dấu tích phân: f(x) = x²`,c:c.teal,w:800},
  frac12(36,174,'Họ nguyên hàm: ∫ x² dx = ','x³','3',' + C',c.blue,12),
  {t:`• Hoành độ đang xét: x = ${n(x)}`,c:c.orange,w:800},
  {t:`• Giá trị: F(${n(x)}) = ${n(yy)}  |  F'(${n(x)}) = f(${n(x)}) = ${n(slope)}`,c:c.purple,w:800},
  {t:`• Vi phân: Δy ≈ F'(x)·Δx = ${n(slope)}·${n(dx)} = ${n(dy)}`,c:c.ink,s:11.4}
 ],'Đồ thị họ nguyên hàm F(x) = x³/3 + C và đạo hàm F′(x) = x².','Khi điểm x di chuyển, hệ số góc tiếp tuyến của F(x) luôn bằng đúng tung độ f(x).');
 return wrapper(h,id,'Nguyên hàm F(x) và đạo hàm F′(x) = f(x)',`Định nghĩa nguyên hàm: F'(x) = f(x) ∀x ∈ K • Tại x = ${n(x)}, độ dốc tiếp tuyến của F(x) bằng f(${n(x)}) = ${n(slope)}.`);
}

function bayes(id,p,t){
 const r=grade12Bayes(p),mode=Number(id.slice(-2)),ph=phase(t,6),x1=442,x2=622,x3=828;
 let h=stageBox();
 const nodes=[[x1,222,'Ω'],[x2,148,'A'],[x2,296,"A'"],[x3,104,'A∩B'],[x3,188,"A∩B'"],[x3,256,"A'∩B"],[x3,340,"A'∩B'"]];
 const segs=[
  [0,1,`P(A)=${n(p.prior)}`],[0,2,`P(A')=${n(1-p.prior)}`],
  [1,3,`P(B|A)=${n(p.pa)}`],[1,4,`P(B'|A)=${n(1-p.pa)}`],
  [2,5,`P(B|A')=${n(p.pb)}`],[2,6,`P(B'|A')=${n(1-p.pb)}`]
 ];
 // Primary route highlighted depends on mode (12-11-C01..C04)
 const primaryRoute=[0,1,3],secondaryRoute=[0,2,5];
 const segIdx=ph<.5?0:1,locT=ph<.5?ph*2:(ph-.5)*2;
 const P0=nodes[primaryRoute[segIdx]],P1=nodes[primaryRoute[segIdx+1]];
 const pulseX=P0[0]+(P1[0]-P0[0])*locT,pulseY=P0[1]+(P1[1]-P0[1])*locT;
 const Q0=nodes[secondaryRoute[segIdx]],Q1=nodes[secondaryRoute[segIdx+1]];
 const pulse2X=Q0[0]+(Q1[0]-Q0[0])*locT,pulse2Y=Q0[1]+(Q1[1]-Q0[1])*locT;

 for(const [from,to,lab] of segs){
  const a=nodes[from],b=nodes[to],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;
  h+=line(a[0],a[1],b[0],b[1],c.slate,2.2);
  h+=pill(mx-46,my-11,92,20,lab,'#F8FAFC','#CBD5E1',c.ink,9.8);
 }
 // Highlight active branches per mode
 for(let j=1;j<primaryRoute.length;j++){
  const a=nodes[primaryRoute[j-1]],b=nodes[primaryRoute[j]];
  h+=line(a[0],a[1],b[0],b[1],mode===2?c.orange:c.blue,4.2);
 }
 if(mode!==2){
  for(let j=1;j<secondaryRoute.length;j++){
   const a=nodes[secondaryRoute[j-1]],b=nodes[secondaryRoute[j]];
   h+=line(a[0],a[1],b[0],b[1],c.teal,3.6);
  }
 }
 h+=dot(pulseX,pulseY,c.orange,7.5);
 if(mode===4||mode===3||mode===1)h+=dot(pulse2X,pulse2Y,c.teal,6.5);

 for(const [i,[x,y,label]] of nodes.entries()){
  const isEnd=i>=3,isB=(i===3||i===5),isPrimaryLeaf=i===3;
  const strokeCol=isPrimaryLeaf?c.purple:isB?c.teal:i===1?c.blue:c.slate;
  const fillCol=isPrimaryLeaf?'#F5F3FF':isB?'#ECFDF5':'#EFF6FF';
  h+=`<circle cx="${x}" cy="${y}" r="${isPrimaryLeaf?24:isEnd?21:19}" fill="${fillCol}" stroke="${strokeCol}" stroke-width="${isPrimaryLeaf?3.2:2.4}"/>`+text(x,y+4,label,10.8,c.ink,'middle',800);
 }
 h+=text(862,108,`${n(r.both)}`,11.2,c.purple,'start',800)+text(862,192,`${n(p.prior*(1-p.pa))}`,10.8,c.slate,'start',700)+text(862,260,`${n(r.pNotAAndB)}`,11.2,c.teal,'start',800)+text(862,344,`${n((1-p.prior)*(1-p.pb))}`,10.8,c.slate,'start',700);

 // Mode-specific bottom analytical strip (y = 382..456)
 const bx=488,by=422,barW=310;
 if(mode===1){
  // Sample space reduction to B: P(A|B) = P(A∩B)/P(B)
  const wAB=Math.max(8,r.posterior*barW*(0.3+0.7*ph)),wNotAB=Math.max(8,(1-r.posterior)*barW*(0.3+0.7*ph));
  h+=pill(430,384,260,22,`Thu hẹp không gian mẫu về B: P(B) = ${n(r.pB)}`,'#EFF6FF','#BFDBFE',c.blue,10.0);
  h+=rect(bx,by,wAB,18,c.purple,c.purple,4)+rect(bx+wAB,by,wNotAB,18,c.teal,c.teal,4)+dot(bx+wAB,by+9,c.red,7,'prior');
  h+=text(bx-8,by+13,`P(A∩B)=${n(r.both)}`,10,c.purple,'end',800)+text(bx+wAB+wNotAB+8,by+13,`P(A|B)=${n(r.posterior)}`,10.5,c.purple,'start',800);
 }else if(mode===2){
  // Multiplication rule along path Ω -> A -> A∩B
  const wPrior=Math.max(12,p.prior*barW),wBoth=Math.max(8,r.both*barW*(0.25+0.75*ph));
  h+=pill(430,384,264,22,`Nhân dọc nhánh: P(A∩B) = ${n(p.prior)} × ${n(p.pa)} = ${n(r.both)}`,'#FFF7ED','#FED7AA',c.orange,10.0);
  h+=rect(bx,by,barW,18,'#F1F5F9',c.slate,4)+rect(bx,by,wPrior,18,'#DBEAFE',c.blue,4)+rect(bx,by,wBoth,18,c.purple,c.purple,4)+dot(bx+wPrior,by+9,c.red,7,'prior');
  h+=text(bx-8,by+13,`P(A)=${n(p.prior)}`,10,c.blue,'end',800)+text(bx+barW+8,by+13,`P(A∩B)=${n(r.both)}`,10.5,c.purple,'start',800);
 }else if(mode===3){
  // Bayes posterior update: Prior P(A) vs Posterior P(A|B)
  const wPrior=Math.max(8,p.prior*barW),wPost=Math.max(8,r.posterior*barW*(0.25+0.75*ph));
  h+=pill(430,384,264,22,`Cập nhật Bayes: Tiên nghiệm ${n(p.prior)} → Hậu nghiệm ${n(r.posterior)}`,'#F5F3FF','#DDD6FE',c.purple,10.0);
  h+=rect(bx,by-6,wPrior,11,c.blue,c.blue,3)+rect(bx,by+9,wPost,13,c.purple,c.purple,3)+dot(bx+wPrior,by,c.red,7,'prior');
  h+=text(bx-8,by+3,`Tiên nghiệm P(A)`,9.8,c.blue,'end',800)+text(bx+Math.max(wPrior,wPost)+8,by+18,`P(A|B)=${n(r.posterior)}`,10.5,c.purple,'start',800);
 }else{
  // Total probability partition: P(B) = P(A∩B) + P(A'∩B)
  const w1=Math.max(8,r.both*barW*(0.25+0.75*ph)),w2=Math.max(8,r.pNotAAndB*barW*(0.25+0.75*ph));
  h+=pill(430,384,264,22,`Toàn phần: P(B) = ${n(r.both)} + ${n(r.pNotAAndB)} = ${n(r.pB)}`,'#ECFDF5','#A7F3D0',c.teal,10.0);
  h+=rect(bx,by,barW,18,'#F1F5F9',c.slate,4)+rect(bx,by,w1,18,c.blue,c.blue,4)+rect(bx+w1,by,w2,18,c.teal,c.teal,4)+dot(bx+w1,by+9,c.red,7,'prior');
  h+=text(bx-8,by+13,`Hợp xung khắc`,9.8,c.teal,'end',800)+text(bx+barW+8,by+13,`P(B)=${n(r.pB)}`,10.5,c.purple,'start',800);
 }
 h+=stagePill(414,80,ph,mode===1?['Không gian mẫu Ω','Sự kiện B xảy ra','Lọc nhánh A∩B','Tỉ số P(A∩B)/P(B)']:mode===2?['Gốc Ω','Bước 1: P(A)','Bước 2: P(B|A)','Tích P(A)·P(B|A)']:mode===3?['Tiên nghiệm P(A)','Quan sát sự kiện B','So sánh hai nhánh B','Hậu nghiệm Bayes P(A|B)']:['Phân hoạch {A, A\'}','Nhánh A∩B','Nhánh A\'∩B','Cộng toàn phần P(B)']);
 const titles=['Xác suất có điều kiện P(A|B)','Công thức nhân xác suất','Công thức Bayes P(A|B)','Xác suất toàn phần P(B)'];
 h+=card12(titles[mode-1],id,[
  {t:`• Tiên nghiệm: P(A) = ${n(p.prior)}  |  P(A') = ${n(1-p.prior)}`,c:c.blue,w:800},
  {t:`• Điều kiện: P(B|A) = ${n(p.pa)}  |  P(B|A') = ${n(p.pb)}`,c:c.teal,w:800},
  {t:`• Nhánh B: P(A∩B) = ${n(r.both)}, P(A'∩B) = ${n(r.pNotAAndB)}`,c:c.orange,w:750},
  {t:`• Toàn phần: P(B) = ${n(r.both)} + ${n(r.pNotAAndB)} = ${n(r.pB)}`,c:c.ink,w:800},
  {t:`• Bayes: P(A|B) = P(A∩B)/P(B) = ${n(r.posterior)}`,c:c.purple,w:800}
 ],'Sơ đồ hình cây xác suất 2 tầng từ Ω → {A, A\'} → {B, B\'}.','Đổi P(A), P(B|A), P(B|A\') thấy xác suất toàn phần P(B) và hậu nghiệm P(A|B) cập nhật.');
 return wrapper(h,id,titles[mode-1],mode===1?`Xác suất có điều kiện: P(B|A) = P(A∩B)/P(A) = ${n(p.pa)}; P(A|B) = ${n(r.posterior)}.`:mode===2?`Công thức nhân xác suất: P(A ∩ B) = P(A) · P(B|A) = ${n(p.prior)} · ${n(p.pa)} = ${n(r.both)}.`:mode===3?`Công thức Bayes: P(A|B) = P(A)·P(B|A) / P(B) = ${n(r.both)} / ${n(r.pB)} ≈ ${n(r.posterior)}.`:`Xác suất toàn phần: P(B) = P(A)P(B|A) + P(A')P(B|A') = ${n(r.pB)}.`);
}

export function grade12SpatialSVG(id,p,t=0){
 const fam=id.slice(0,5),mode=Number(id.slice(-2)),ph=phase(t,6);
 let h=stageBox();
 if(id==='12-03-C02'){
  const v=grade12Optimization(id,p),L=p.L,x=p.x,S=204,cutPx=Math.max(14,Math.min(82,(x/L)*S)),bx=434,by=156;
  const foldFrac=t>0?Math.min(1,Math.max(0,(ph-0.25)/0.55)):0,flapIn=cutPx*0.42*foldFrac;
  h+=rect(bx,by,S,S,'#EFF6FF',c.blue,4);
  for(const [cx,cy] of [[bx,by],[bx+S-cutPx,by],[bx,by+S-cutPx],[bx+S-cutPx,by+S-cutPx]]){
   h+=rect(cx,cy,cutPx,cutPx,'#FEF2F2',c.red,2)+line(cx,cy,cx+cutPx,cy+cutPx,c.red,1.4)+line(cx+cutPx,cy,cx,cy+cutPx,c.red,1.4);
  }
  if(foldFrac>0.02){
   h+=`<polygon points="${bx+cutPx},${by+cutPx} ${bx+S-cutPx},${by+cutPx} ${bx+S-cutPx-flapIn},${by+flapIn} ${bx+cutPx+flapIn},${by+flapIn}" fill="${c.teal}" fill-opacity="0.18" stroke="${c.teal}" stroke-width="1.6" stroke-dasharray="4 2"/>`;
   h+=`<polygon points="${bx+cutPx},${by+S-cutPx} ${bx+S-cutPx},${by+S-cutPx} ${bx+S-cutPx-flapIn},${by+S-flapIn} ${bx+cutPx+flapIn},${by+S-flapIn}" fill="${c.teal}" fill-opacity="0.18" stroke="${c.teal}" stroke-width="1.6" stroke-dasharray="4 2"/>`;
  }
  h+=rect(bx+cutPx,by+cutPx,S-2*cutPx,S-2*cutPx,'#ECFDF5',c.teal,2.2);
  h+=text(bx+S/2,by+S/2+4,`${n(L-2*x)}×${n(L-2*x)}`,11.5,c.teal,'middle',800)+text(bx+cutPx/2,by-6,`x=${n(x)}`,10.5,c.red,'middle',800);
  h+=pill(bx+14,by+S+18,176,22,`V = x(L−2x)² = ${n(v.value)}`,'#F5F3FF','#DDD6FE',c.purple,10.2);
  const gx=684,gy=362,gw=226,gh=186,maxX=L/2;
  const Xg=z=>gx+(z/maxX)*gw,Yg=val=>gy-(val/Math.max(1e-6,v.best*1.12))*gh,fn=z=>z*(L-2*z)**2;
  const xScan=t>0?(0.04+0.88*ph)*maxX:x;
  h+=line(gx,gy,gx+gw,gy,c.slate,1.8)+line(gx,gy-gh,gx,gy,c.slate,1.8)+path(fn,0,maxX,Xg,Yg,90,c.blue);
  if(t>0)h+=line(Xg(xScan),gy,Xg(xScan),Yg(fn(xScan)),c.teal,1.4,'3 3')+dot(Xg(xScan),Yg(fn(xScan)),c.teal,5.2);
  h+=dot(Xg(v.optimum),Yg(v.best),c.purple,7)+dot(Xg(x),Yg(v.value),c.red,7.5,'x')+dot(bx+cutPx,by+cutPx,c.red,6.5,'x')+line(Xg(x),gy,Xg(x),Yg(v.value),c.orange,1.6,'4 3');
  h+=pill(Xg(v.optimum)-58,Yg(v.best)-26,116,20,`Max V=${n(v.best)} (L/6)`,'#F5F3FF','#DDD6FE',c.purple,9.8);
  h+=stagePill(700,80,ph,['Tấm bìa L×L','Cắt 4 góc x×x','Gấp 4 thành hộp','Cực đại x* = L/6']);
 }else if(fam==='12-04'){
  const O=[648,284],proj=(x,y,z)=>[O[0]+(y-x*.55)*30,O[1]-(z-x*.32)*30];
  const Ox=proj(4,0,0),Oy=proj(0,4.5,0),Oz=proj(0,0,4.2);
  h+=line(...O,...Ox,c.ox,2.0)+text(Ox[0]-10,Ox[1]+14,'Ox',11.2,c.ox,'middle',800);
  h+=line(...O,...Oy,c.oy,2.0)+text(Oy[0]+10,Oy[1]+4,'Oy',11.2,c.oy,'start',800);
  h+=line(...O,...Oz,c.oz,2.0)+text(Oz[0],Oz[1]-8,'Oz',11.2,c.oz,'middle',800);
  const V=proj(p.vx,p.vy,p.vz),Vxy=proj(p.vx,p.vy,0),Vx=proj(p.vx,0,0),Vy=proj(0,p.vy,0);
  const Vscan=proj(p.vx*ph,p.vy*ph,p.vz*ph);
  h+=line(...O,...Vxy,c.slate,1.4,'4 3')+line(...Vxy,...V,c.teal,1.8,'4 3')+line(...Vx,...Vxy,c.slate,1.2,'3 3')+line(...Vy,...Vxy,c.slate,1.2,'3 3');
  h+=line(...O,...V,c.blue,3.2)+dot(...V,c.blue,7.5,'vz')+dot(...Vxy,c.teal,6,'vy')+text(V[0]+8,V[1]-8,`v(${n(p.vx)};${n(p.vy)};${n(p.vz)})`,11,c.blue,'start',800);
  if(t>0)h+=dot(...Vscan,c.orange,5.2);
  if(mode>=2){
   const U=proj(p.ux,p.uy,p.uz),S=proj(p.vx+p.ux,p.vy+p.uy,p.vz+p.uz);
   h+=line(...O,...U,c.teal,3)+dot(...U,c.teal,7.5,'uz')+text(U[0]+8,U[1]+14,`u(${n(p.ux)};${n(p.uy)};${n(p.uz)})`,11,c.teal,'start',800);
   if(mode===2){
    // 12-04-C02: Biểu diễn tọa độ vectơ u = u₁i + u₂j + u₃k và vectơ tự do AB = v − u
    const Uxy=proj(p.ux,p.uy,0),Puv=proj(p.ux+(p.vx-p.ux)*ph,p.uy+(p.vy-p.uy)*ph,p.uz+(p.vz-p.uz)*ph);
    h+=line(...O,...Uxy,c.slate,1.4,'4 3')+line(...Uxy,...U,c.orange,1.8,'4 3')+line(...U,...V,c.purple,3.0,'5 3')+dot(...Puv,c.purple,5.5);
    h+=pill(424,80,236,22,`u = (${n(p.ux)};${n(p.uy)};${n(p.uz)}) · |u| = ${n(Math.hypot(p.ux,p.uy,p.uz))}`,'#EFF6FF','#BFDBFE',c.blue,10.0);
   }else if(mode===4){
    // 12-04-C04: Quy tắc hình bình hành u + v
    const St=proj(p.vx+p.ux*ph,p.vy+p.uy*ph,p.vz+p.uz*ph);
    h+=line(...V,...St,c.orange,2.4,'5 3')+line(...U,...S,c.slate,1.6,'4 3')+line(...O,...S,c.purple,3.4)+dot(...S,c.purple,7)+text(S[0]+8,S[1]-6,'u+v',11.5,c.purple,'start',800);
   }
   if(mode===3){
    const m=grade12Math(id,p).result,Puv=proj(p.ux+(p.vx-p.ux)*ph,p.uy+(p.vy-p.uy)*ph,p.uz+(p.vz-p.uz)*ph);
    h+=line(...U,...V,c.orange,1.8,'4 3')+dot(...Puv,c.purple,5.2);
    h+=pill(424,80,210,22,`u·v = ${n(m.dot)} · cos(u,v) = ${n(m.cos)}`,'#F5F3FF','#DDD6FE',c.purple,10.2);
   }
  }
  h+=stagePill(700,80,ph,mode===1?['Hệ trục Oxyz','Chiếu xuống (Oxy)','Dựng cao độ z','Điểm M & độ dài OM']:mode===2?['Vectơ đơn vị i, j, k','Chiếu tọa độ u','Vectơ tự do AB = v−u','Bộ ba tọa độ (u₁;u₂;u₃)']:mode===3?['Hai vectơ u, v','Góc giữa hai vectơ','Tích tọa độ từng trục','Tích vô hướng u·v']:['Vectơ gốc u, v','Tịnh tiến nối đuôi','Quy tắc hình bình hành','Vectơ tổng u + v']);
 }else if(fam==='12-07'){
  const m=grade12Volume(p),ox=442,oy=278,lenPx=226,sc=35,sl=mode===3?p.slice:(.15+.7*ph),sx=ox+sl*lenPx;
  const r1p=p.r1*sc,r2p=p.r2*sc,rsp=m.radius*sc,holeP=(mode===2?p.hole:0)*sc;
  h+=line(ox-16,oy,ox+lenPx+24,oy,c.ox,2.2)+text(ox+lenPx+30,oy+4,'Ox',11,c.ox,'start',800);
  h+=`<polygon points="${ox},${n(oy-r1p)} ${ox+lenPx},${n(oy-r2p)} ${ox+lenPx},${n(oy+r2p)} ${ox},${n(oy+r1p)}" fill="${c.blue}" fill-opacity="0.15" stroke="${c.blue}" stroke-width="2.4"/>`;
  if(mode===1){
   // 12-07-C01: Tổng tích phân các lát cắt mặt cắt S(x_k) dọc trục Ox
   for(let k=0;k<5;k++){
    const tk=(k+0.5)/5,xk=ox+tk*lenPx,rk=(p.r1+(p.r2-p.r1)*tk)*sc;
    h+=rect(xk-lenPx/12,oy-rk,lenPx/6,2*rk,'#ECFDF5',c.teal,2);
   }
  }
  if(mode===2&&holeP>0)h+=rect(ox,oy-holeP,lenPx,2*holeP,'#FFFFFF',c.orange,0);
  h+=line(sx,oy-rsp,sx,oy+rsp,c.orange,3)+dot(sx,oy-rsp,c.red,7,'slice')+dot(ox,oy-r1p,c.blue,7,'r1')+dot(ox+lenPx,oy-r2p,c.teal,7,'r2');
  const cx=816,cy=212;
  h+=`<circle cx="${cx}" cy="${cy}" r="${n(rsp)}" fill="${c.teal}" fill-opacity="0.20" stroke="${c.teal}" stroke-width="2.6"/>`;
  if(mode===2&&holeP>0)h+=`<circle cx="${cx}" cy="${cy}" r="${n(holeP)}" fill="#FFFFFF" stroke="${c.orange}" stroke-width="2.2" stroke-dasharray="4 3"/>`;
  h+=line(cx,cy,cx+rsp,cy,c.purple,2.4)+dot(cx,cy,c.ink,4)+text(cx,cy+rsp+16,`S(x) = ${n(m.section)}`,10.5,c.purple,'middle',800);
  const slL=Math.hypot(p.h||4,p.r2-p.r1),sxq=Math.PI*(p.r1+p.r2)*slL,open=.3+.7*ph,ang=Math.min(130,36+74*open)*Math.PI/180,rOut=54,rIn=26,ny=346;
  const xA1=cx-rOut*Math.sin(ang/2),yA1=ny+rOut*(1-Math.cos(ang/2)),xA2=cx+rOut*Math.sin(ang/2),yA2=yA1;
  const xB1=cx-rIn*Math.sin(ang/2),yB1=ny-22+rIn*(1-Math.cos(ang/2)),xB2=cx+rIn*Math.sin(ang/2),yB2=yB1;
  h+=`<path d="M ${n(xB1)} ${n(yB1)} A ${rIn} ${rIn} 0 0 1 ${n(xB2)} ${n(yB2)} L ${n(xA2)} ${n(yA2)} A ${rOut} ${rOut} 0 0 0 ${n(xA1)} ${n(yA1)} Z" fill="#FEF3C7" fill-opacity="0.82" stroke="${c.orange}" stroke-width="2"/>`;
  h+=text(cx,ny+38,`Khai triển mặt bên: S_xq = π(r₁+r₂)l = ${n(sxq)}`,10,c.orange,'middle',800);
  h+=pill(424,80,mode===2?258:mode===1?212:174,22,mode===2?`[MỞ RỘNG] V = π∫(R²−r²)dx = ${n(m.volume)}`:mode===1?`V = ∫ S(x)dx = ${n(m.volume)}`:`V = π∫r(x)²dx = ${n(m.volume)}`,'#F5F3FF','#DDD6FE',c.purple,10.0);
  h+=stagePill(700,80,ph,mode===2?['Hai bán kính R(x), r₀','Lát cắt hình vành khuyên','Quét quanh trục Ox','Hiệu thể tích V_ngoài − V_trong']:mode===1?['Vật thể giới hạn a..b','Thiết diện S(x) vuông góc Ox','Cộng tích phân các lát','Thể tích V = ∫ S(x)dx']:['Đường sinh r(x)','Lát cắt S(x) = πr(x)²','Quay quanh trục Ox','Thể tích tích phân V']);
 }else if(fam==='12-08'){
  const m=grade12Math(id,p).result,Hpt=[668,312];
  h+=`<polygon points="500,352 790,352 836,272 546,272" fill="${R85_PALETTE.planes.plane_a}" fill-opacity="0.14" stroke="${R85_PALETTE.planes.plane_a}" stroke-width="2.2"/>`+text(516,342,'(P)',12,R85_PALETTE.planes.plane_a,'start',800);
  if(mode===1||mode===3){
   const Npt=[668,172],Mpt=[748,188],Pmov=[Mpt[0]+(748-Mpt[0])*ph,Mpt[1]+(312-Mpt[1])*ph],Mscan=[668+82*Math.cos(ph*Math.PI*2),312+24*Math.sin(ph*Math.PI*2)];
   h+=line(Hpt[0],Hpt[1],Npt[0],Npt[1],c.orange,3)+dot(...Npt,c.orange,7.5,'C')+text(Npt[0]-10,Npt[1]+4,`n(${n(p.A)};${n(p.B)};${n(p.C)})`,11,c.orange,'end',800);
   h+=`<polyline points="668,298 682,298 682,312" fill="none" stroke="${c.orange}" stroke-width="2"/>`;
   if(mode===3){
    h+=line(748,188,748,312,c.purple,2.8,'5 4')+dot(748,188,c.red,7.5,'vz')+dot(748,312,c.teal,6)+dot(...Pmov,c.orange,5);
    h+=text(758,188,'M₀',12,c.red,'start',800)+text(758,326,'H',11.5,c.teal,'start',800)+pill(756,238,108,21,`d(M₀,(P)) = ${n(m.dist)}`,'#F5F3FF','#DDD6FE',c.purple,10.2);
   }else{
    h+=line(668,312,Mscan[0],Mscan[1],c.teal,2,'4 3')+dot(...Mscan,c.purple,5.2)+dot(668,312,c.teal,6.5,'vx')+text(680,326,`M₀(${n(p.vx)};${n(p.vy)};${n(p.vz)})`,11,c.teal,'start',800);
   }
  }else if(mode===2){
   const rad=(p.deg||45)*Math.PI/180,gap=(p.dist||0)*24,Qx=668+130*Math.cos(rad),Qy=312-gap-130*Math.sin(rad),Pscan=[560+210*ph,312-gap*ph];
   h+=line(530,312,806,312,R85_PALETTE.planes.plane_a,3)+line(668-80*Math.cos(rad),312-gap+80*Math.sin(rad),Qx,Qy,R85_PALETTE.planes.plane_b,3)+dot(668,312-gap,c.teal,6.5,'dist')+dot(Qx,Qy,c.orange,7.5,'deg')+dot(...Pscan,c.purple,5);
   h+=pill(424,80,224,22,`Vị trí (P),(Q): ${m.state} (d=${n(p.dist)})`,'#EFF6FF','#BFDBFE',c.blue,10.0)+text(Qx+8,Qy,'(Q)',12,R85_PALETTE.planes.plane_b,'start',800);
  }else{
   const rad=(p.deg||45)*Math.PI/180,Qx=668+130*Math.cos(rad),Qy=312-130*Math.sin(rad);
   const n1x=668,n1y=212,n2x=668-95*Math.sin(rad*ph),n2y=312-95*Math.cos(rad*ph);
   h+=line(530,312,806,312,R85_PALETTE.planes.plane_a,3)+line(668-80*Math.cos(rad),312+80*Math.sin(rad),Qx,Qy,R85_PALETTE.planes.plane_b,3);
   h+=line(668,312,n1x,n1y,c.blue,2.4,'4 3')+line(668,312,n2x,n2y,c.orange,2.4,'4 3')+text(n1x+8,n1y,'n₁',11,c.blue,'start',800)+text(n2x-8,n2y,'n₂',11,c.orange,'end',800);
   h+=dot(668,312,R85_PALETTE.planes.intersection,6.5)+dot(Qx,Qy,c.orange,7.5,'deg');
   h+=pill(424,80,236,22,`cos φ = |n₁·n₂|/(|n₁||n₂|) ⇒ φ = ${n(Math.min(p.deg,180-p.deg))}°`,'#F5F3FF','#DDD6FE',c.purple,10.0)+text(Qx+8,Qy,'(Q)',12,R85_PALETTE.planes.plane_b,'start',800);
  }
  h+=stagePill(700,80,ph,mode===1?['Điểm M₀ ∈ (P)','Vectơ pháp tuyến n','Quan hệ n ⊥ M₀M','Phương trình tổng quát']:mode===3?['Mặt phẳng (P) & M₀','Hạ vuông góc M₀H','Chân đường cao H','Khoảng cách d(M₀,(P))']:mode===2?['Hai mặt phẳng (P),(Q)','Xét cặp pháp tuyến n₁, n₂','Khoảng cách / giao tuyến','Kết luận vị trí tương đối']:['Hai mặt phẳng (P),(Q)','Hai pháp tuyến n₁, n₂','Góc giữa hai pháp tuyến','Góc nhọn φ = ((P),(Q))']);
 }else if(fam==='12-09'){
  if(mode<=2){
   const A=[506,340],B=[828,168],M0=[618,280],U=[714,228],Mt=[A[0]+(B[0]-A[0])*ph,A[1]+(B[1]-A[1])*ph];
   const canon=grade12Math(id,p).result.canonical||'';
   h+=line(...A,...B,c.blue,2.8)+line(...M0,...U,c.orange,3.6)+dot(...M0,c.blue,7.5,'vx')+dot(...U,c.orange,7.5,'ux')+dot(...Mt,c.purple,6.8);
   if(mode===1){
    // 12-09-C01: Tam giác bước tỉ số chính tắc Δx : Δy : Δz = u₁ : u₂ : u₃
    h+=line(M0[0],M0[1],U[0],M0[1],c.teal,1.8,'4 3')+line(U[0],M0[1],U[0],U[1],c.teal,1.8,'4 3')+text((M0[0]+U[0])/2,M0[1]+14,`u=(${n(p.ux)};${n(p.uy)};${n(p.uz)})`,10,c.teal,'middle',800);
   }else{
    // 12-09-C02: Các mốc thời gian tham số t = -1, 0, 1, 2 dọc theo đường thẳng
    for(const [tk,lb] of [[0.18,'t=-1'],[0.35,'t=0'],[0.65,'t=1'],[0.85,'t=2']]){
     const px=A[0]+(B[0]-A[0])*tk,py=A[1]+(B[1]-A[1])*tk;
     h+=dot(px,py,c.teal,4.2)+text(px-6,py-10,lb,9.5,c.teal,'end',750);
    }
   }
   h+=text(M0[0]-8,M0[1]-10,`M₀(${n(p.vx)};${n(p.vy)};${n(p.vz)})`,11,c.blue,'end',800)+text(U[0]+8,U[1]+14,`u(${n(p.ux)};${n(p.uy)};${n(p.uz)})`,11,c.orange,'start',800)+text(Mt[0]+10,Mt[1]+16,'M(t)',11,c.purple,'start',800);
   h+=pill(424,80,264,22,mode===1?`Chính tắc: ${short(canon,30)}`:`Tham số: M(t) = M₀ + t·u`,'#EFF6FF','#BFDBFE',c.blue,9.8);
  }else if(mode===3){
   const m=grade12Math(id,p).result,gap=(p.dist||0)*28,rad=(p.deg||45)*Math.PI/180,dx=120*Math.cos(rad),dy=60*Math.sin(rad);
   h+=line(510,316,826,316,c.blue,3)+line(668-dx,316-gap+dy,668+dx,316-gap-dy,c.teal,3)+line(668,316,668,316-gap*ph,c.purple,2.6,'4 3');
   h+=dot(668,316,c.blue,5.5)+dot(668,316-gap,c.orange,7.5,'dist')+dot(668+dx,316-gap-dy,c.teal,7,'deg')+pill(424,80,196,22,`d₁, d₂: ${m.state} (d=${n(p.dist)})`,'#F5F3FF','#DDD6FE',c.purple,10.2);
  }else{
   const rad=Math.min(89,p.deg||45)*Math.PI/180,O=[620,320],S=[620+148*Math.cos(rad),320-148*Math.sin(rad)],Sdrop=[S[0],S[1]+(O[1]-S[1])*ph];
   h+=`<polygon points="490,352 800,352 840,288 530,288" fill="${c.blue}" fill-opacity="0.14" stroke="${c.blue}" stroke-width="2"/>`;
   h+=line(O[0],O[1],O[0],184,c.orange,2.4,'4 3')+line(O[0],O[1],S[0],O[1],c.teal,2.6)+line(O[0],O[1],S[0],S[1],c.blue,3.2)+line(S[0],S[1],Sdrop[0],Sdrop[1],c.teal,1.8,'4 3')+dot(...Sdrop,c.teal,5);
   h+=dot(...O,c.ink,5.5)+dot(...S,c.blue,7.5,'deg')+text(O[0]-8,192,'n',12,c.orange,'end',800)+text(S[0]+8,S[1],'d',12,c.blue,'start',800)+pill(424,80,188,22,`sin α = |u·n|/(|u||n|) ⇒ α = ${n(Math.min(90,p.deg))}°`,'#F5F3FF','#DDD6FE',c.purple,10.0);
  }
  h+=stagePill(700,80,ph,mode<=2?['Điểm gốc M₀','Vectơ chỉ phương u','Điểm trượt M(t)','Phương trình đường thẳng']:mode===3?['Hai đường d₁, d₂','So sánh u₁, u₂','Đoạn vuông góc chung','Kết luận vị trí tương đối']:['Đường d & mặt (P)','Pháp tuyến n & hình chiếu d\'','Quan hệ phụ nhau','Góc α = (d, (P))']);
 }else if(fam==='12-10'){
  const C=[668,268],sc=40,Rpx=p.r*sc,dPx=(p.dist??0)*sc,yCut=C[1]-dPx,secR=p.dist<=p.r?Math.sqrt(Math.max(0,p.r*p.r-p.dist*p.dist))*sc:0;
  h+=`<circle cx="${C[0]}" cy="${C[1]}" r="${n(Rpx)}" fill="${c.blue}" fill-opacity="0.14" stroke="${c.blue}" stroke-width="3"/>`+dot(...C,c.blue,6.5,'vx')+dot(C[0]+Rpx,C[1],c.teal,7,'r')+text(C[0]-10,C[1]+16,`I (R=${n(p.r)})`,11.5,c.blue,'end',800);
  if(mode===1){
   const ang=-Math.PI/4+ph*Math.PI*1.15,Mx=C[0]+Rpx*Math.cos(ang),My=C[1]+Rpx*Math.sin(ang);
   h+=`<ellipse cx="${C[0]}" cy="${C[1]}" rx="${n(Rpx)}" ry="${n(Rpx*.34)}" fill="none" stroke="${c.teal}" stroke-width="1.8" stroke-dasharray="5 4"/>`;
   h+=line(C[0],C[1],Mx,My,c.orange,2.6)+dot(Mx,My,c.purple,7.5,'r')+text(Mx+10,My-6,`M (IM=R=${n(p.r)})`,11,c.purple,'start',800);
   h+=pill(424,80,210,22,`Mặt cầu tâm I, bán kính R = ${n(p.r)}`,'#F5F3FF','#DDD6FE',c.purple,10.2);
  }else{
   h+=line(480,yCut,856,yCut,c.orange,2.6)+line(C[0],C[1],C[0],C[1]-(C[1]-yCut)*ph,c.teal,2.2,'4 3')+dot(C[0],yCut,c.orange,7.5,'dist')+text(C[0]-8,(C[1]+yCut)/2,`d=${n(p.dist)}`,10.5,c.teal,'end',800);
   if(secR>0){
    if(mode===2)h+=`<ellipse cx="${C[0]}" cy="${n(yCut)}" rx="${n(secR*ph)}" ry="${n(Math.max(4,secR*.28*ph))}" fill="${c.purple}" fill-opacity="0.22" stroke="${c.purple}" stroke-width="2.4"/>`;
    h+=line(C[0],C[1],C[0]+secR*ph,yCut,c.blue,2,'4 3')+dot(C[0]+secR,yCut,c.purple,6.5)+dot(C[0]-secR,yCut,c.purple,6.5);
    h+=pill(424,80,mode===3?260:210,22,mode===3?`[MỞ RỘNG] Cắt tại 2 điểm (a/2 = ${n(secR/sc)})`:`Giao tuyến đường tròn r = √(R²−d²) = ${n(secR/sc)}`,'#F5F3FF','#DDD6FE',c.purple,10.0);
   }else{
    const isTan=Math.abs(p.dist-p.r)<1e-6;
    if(isTan)h+=dot(C[0],yCut,c.purple,7.5);
    h+=pill(424,80,mode===3?256:208,22,(mode===3?'[MỞ RỘNG] ':'')+(isTan?'Tiếp xúc tại H (d = R)':'Không giao nhau (d > R)'),isTan?'#F5F3FF':'#FEF2F2',isTan?'#DDD6FE':'#FECACA',isTan?c.purple:c.red,10.0);
   }
  }
  h+=stagePill(700,80,ph,mode===1?['Tâm I(a;b;c)','Bán kính IM = R','Đường xích đạo','Mặt cầu (S) hoàn chỉnh']:mode===2?['Mặt cầu (S) & (P)','Khoảng cách d = IH','Tam giác vuông IHM','Thiết diện r = √(R²−d²)']:['Mặt cầu (S) & Δ','Khoảng cách d(I,Δ)','So sánh d với R','Số giao điểm (2 / 1 / 0)']);
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="394 70 550 412" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block;background:#F8FAFC">${h}</svg>`;
}

export function grade12SceneSVG(id,p,t=0){
 if(!grade12Valid(id,p))throw Error('Tham số chưa hợp lệ: '+id);
 const f=id.slice(0,5);let svg;
 if(f==='12-03')svg=optimization(id,p,t);
 else if(f==='12-05')svg=grouped(id,p,t);
 else if(f==='12-06')svg=antiderivative(id,p,t);
 else if(f==='12-11')svg=bayes(id,p,t);
 else throw Error('Lab Toán 12 này cần xem WebGL 3D: '+id);
 if(!grade12Math(id,p).latex||/NaN|Infinity|undefined|<script/i.test(svg))throw Error('Lỗi hình SVG Toán 12 '+id);
 return svg;
}
