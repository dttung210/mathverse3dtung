/** Pure SVG generators for Grade 9 2D models and 3D展开/cross-sections. */
import {grade9Math,grade9Experiment,grade9TriangleCenters} from './grade9-engine.mjs';
import {formatMathText} from './math-formula-renderer.mjs';
const f=(n,d=2)=>Number.isFinite(n)?Number(n.toFixed(d)):0;
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const clamp01=x=>Math.max(0,Math.min(1,Number(x)||0));
// R82 Semantic Palette (compatible with Grade 6-8 V2)
const BLUE='#1D4ED8',BLUE_FILL='#DBEAFE';
const ORANGE='#B45309',ORANGE_FILL='#FEF3C7';
const VIOLET='#6D28D9',VIOLET_FILL='#EDE9FE';
const GREEN='#15803D',GREEN_FILL='#DCFCE7';
const RED='#B91C1C',RED_FILL='#FEE2E2';
const SLATE='#475569',SLATE_FILL='#F1F5F9';
const INK='#0F172A';

const frame=(title,sub,body)=>`<svg viewBox="0 0 960 500" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block" role="img" aria-label="${esc(title)}"><defs><linearGradient id="g9bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#f1f5f9"/></linearGradient></defs><rect width="960" height="500" rx="22" fill="url(#g9bg)"/><rect x="18" y="18" width="924" height="464" rx="18" fill="#ffffff" stroke="#cbd5e1"/><g opacity="0" pointer-events="none"><text x="42" y="54" font-size="22" font-weight="800" fill="${INK}">${esc(title)}</text><text x="42" y="78" font-size="13" font-weight="600" fill="${SLATE}">${esc(sub)}</text></g>${body}</svg>`;
const dot=([x,y],c=ORANGE,r=7,drag='',fillOverride='')=>`<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${fillOverride||c}" stroke="${fillOverride?c:'#fff'}" stroke-width="2.5"${drag?` data-point="${drag}" style="cursor:pointer"`:''}/>`;
const label=([x,y],t,dx=10,dy=-10,c=INK)=>`<text x="${f(x+dx)}" y="${f(y+dy)}" font-size="14" font-weight="750" fill="${c}" style="paint-order:stroke;stroke:#ffffff;stroke-width:3.8px;stroke-linejoin:round">${esc(formatMathText(t))}</text>`;
const seg=([x1,y1],[x2,y2],c=BLUE,w=3.2,dash='')=>`<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${dash?` stroke-dasharray="${dash}"`:''}/>`;
const text=(x,y,t,sz=15,w=700,c=INK)=>`<text x="${f(x)}" y="${f(y)}" font-size="${sz}" font-weight="${w}" fill="${c}" style="paint-order:stroke;stroke:#ffffff;stroke-width:3.2px;stroke-linejoin:round">${esc(formatMathText(t))}</text>`;
const pill=(x,y,w,h,t,bg=SLATE_FILL,bd=SLATE,col=INK,sz=13)=>`<g><rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="9" fill="${bg}" stroke="${bd}" stroke-width="1.5"/><text x="${f(x+w/2)}" y="${f(y+h/2+4.5)}" text-anchor="middle" font-size="${sz}" font-weight="800" fill="${col}">${esc(formatMathText(t))}</text></g>`;
const rightMark=(V,U,W,size=13,c=VIOLET)=>{
 const l1=Math.hypot(U[0]-V[0],U[1]-V[1])||1,l2=Math.hypot(W[0]-V[0],W[1]-V[1])||1;
 const u=[(U[0]-V[0])/l1*size,(U[1]-V[1])/l1*size],w=[(W[0]-V[0])/l2*size,(W[1]-V[1])/l2*size];
 const p1=[V[0]+u[0],V[1]+u[1]],p2=[V[0]+u[0]+w[0],V[1]+u[1]+w[1]],p3=[V[0]+w[0],V[1]+w[1]];
 return `<path d="M ${f(p1[0])} ${f(p1[1])} L ${f(p2[0])} ${f(p2[1])} L ${f(p3[0])} ${f(p3[1])}" fill="none" stroke="${c}" stroke-width="2.3"/>`;
};
const angleArc=(V,P1,P2,r=28,lbl='',c=ORANGE,labelOffset=[0,0])=>{
 const a1=Math.atan2(P1[1]-V[1],P1[0]-V[0]),a2=Math.atan2(P2[1]-V[1],P2[0]-V[0]);
 let diff=a2-a1;while(diff<=-Math.PI)diff+=2*Math.PI;while(diff>Math.PI)diff-=2*Math.PI;
 const s=a1,e=a1+diff,x1=V[0]+r*Math.cos(s),y1=V[1]+r*Math.sin(s),x2=V[0]+r*Math.cos(e),y2=V[1]+r*Math.sin(e);
 const sweep=diff>=0?1:0,mid=a1+diff/2,lx=V[0]+(r+18)*Math.cos(mid)+labelOffset[0],ly=V[1]+(r+18)*Math.sin(mid)+4+labelOffset[1];
 return `<path d="M ${f(V[0])} ${f(V[1])} L ${f(x1)} ${f(y1)} A ${r} ${r} 0 0 ${sweep} ${f(x2)} ${f(y2)} Z" fill="${c}22" stroke="none"/><path d="M ${f(x1)} ${f(y1)} A ${r} ${r} 0 0 ${sweep} ${f(x2)} ${f(y2)}" fill="none" stroke="${c}" stroke-width="2.3"/>${lbl?`<text x="${f(lx)}" y="${f(ly)}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${c}" style="paint-order:stroke;stroke:#ffffff;stroke-width:3.5px;stroke-linejoin:round">${esc(lbl)}</text>`:''}`;
};
const fracRow=(x,y,lhs,num,den,rhs='',c=INK,sz=12.5)=>{
 const lw=lhs.length*(sz*.55)+6,nw=Math.max(num.length,den.length)*(sz*.58)+12,cx=x+lw+nw/2,rx=x+lw+nw+6;
 return `<g><desc>${esc(`${lhs} ${num}/${den} ${rhs}`)}</desc>${text(x,y,lhs,sz,700,c)}${text(cx,y-8,num,sz-1,700,c).replace('<text ',`<text text-anchor="middle" `)}<line x1="${f(x+lw)}" y1="${f(y-4)}" x2="${f(x+lw+nw)}" y2="${f(y-4)}" stroke="${c}" stroke-width="1.5"/>${text(cx,y+10,den,sz-1,700,c).replace('<text ',`<text text-anchor="middle" `)}${rhs?text(rx,y,rhs,sz,700,c):''}</g>`;
};

function drawInequality(id,p,t){
 const m=grade9Math(id,p).result,u=clamp01(t/6),x=v=>480+v*56,y=265,ax=x(p.a),bx=x(p.b);
 let ticks='';for(let i=-6;i<=6;i++)ticks+=`${seg([x(i),y-8],[x(i),y+8],SLATE,2)}<text x="${f(x(i))}" y="${y+28}" text-anchor="middle" font-size="12" font-weight="600" fill="${SLATE}">${i}</text>`;
 // Mũi tên trục số
 const axisSvg=seg([100,y],[860,y],SLATE,3)+`<polygon points="864,${y} 852,${y-6} 852,${y+6}" fill="${SLATE}"/>`;
 if(id==='9-02-C01'){
  // 9-02-C01 (MOT_NHAN): Nền trục xám (#475569), tập nghiệm xanh dương (#1D4ED8), đầu mút cam (#B45309)
  const rayEnd=ax+(850-ax)*Math.max(0.25,u);
  const probeV=p.a+Math.max(0.5,3.2*u),px=x(probeV);
  // Gạch bỏ miền loại bỏ bên trái mốc a
  let hatch='';for(let hx=115;hx<ax-8;hx+=18)hatch+=seg([hx,y-12],[hx-8,y+12],'#cbd5e1',1.8);
  const body=`<desc>• Kết luận: x ≥ a</desc>`
   +hatch
   +`<rect x="${f(ax)}" y="${y-20}" width="${f(Math.max(4,rayEnd-ax))}" height="40" fill="${BLUE_FILL}" opacity="0.55"/>`
   +seg([100,y],[ax,y],'#94a3b8',4,'6 5')
   +seg([ax,y],[rayEnd,y],BLUE,7)
   +dot([ax,y],ORANGE,9.5,'0')
   +dot([px,y],BLUE,6.5)
   +text(ax,y-26,`[${f(p.a)}`,18,800,ORANGE).replace('<text ','<text text-anchor="middle" ')
   +pill(110,48,470,34,`Tập nghiệm S = [${f(p.a)}; +∞)  ·  Điểm thử x = ${f(probeV,2)} ≥ ${f(p.a)} (thuộc S)`,BLUE_FILL,BLUE,BLUE,13.5)
   +pill(600,48,250,34,'Chấm đặc [ : lấy mốc biên a  |  ○ ( : không lấy mốc',ORANGE_FILL,ORANGE,ORANGE,11.5);
  return frame('Biểu diễn miền nghiệm trên trục số',`Mô hình ${id}`,axisSvg+ticks+body);
 }
 // 9-02-C02 (DA_MAU): Tập 1 xanh dương (#1D4ED8), tập 2 xanh lá (#15803D), giao tím (#6D28D9); miền loại bỏ xám
 // 0% -> 50%: Hai trục độc lập ở trên và dưới tịnh tiến dần về trục chính y
 const shift=(1-Math.min(1,u/0.6))*58;
 const y1=y-shift,y2=y+shift;
 const set1=seg([ax,y1],[850,y1],BLUE,5.5)+dot([ax,y1],BLUE,8,'0')+label([ax,y1],`x ≥ ${f(p.a)}`,8,-12,BLUE);
 const set2=seg([110,y2],[bx,y2],GREEN,5.5)+dot([bx,y2],GREEN,8,'1')+label([bx,y2],`x ≤ ${f(p.b)}`,-48,-12,GREEN);
 const body=m.empty
  ? `<desc>• Kết luận: tập nghiệm rỗng</desc>`
   +set1+set2
   +pill(160,48,640,36,`a = ${f(p.a)} > b = ${f(p.b)} ⇒ Hai miền không chồng lấn: [${f(p.a)}; +∞) ∩ (−∞; ${f(p.b)}] = ∅ (tập nghiệm rỗng)`,RED_FILL,RED,RED,13.5)
  : `<desc>• Kết luận: [a; b]</desc>`
   +set1+set2
   +(u>=0.45?`<rect x="${f(ax)}" y="${y-24}" width="${f(Math.max(4,bx-ax))}" height="48" rx="6" fill="${VIOLET_FILL}" opacity="0.65" stroke="${VIOLET}" stroke-width="1.5"/>`
    +seg([ax,y],[bx,y],VIOLET,8.5)
    +dot([ax,y],VIOLET,9,'0')+dot([bx,y],VIOLET,9,'1'):'')
   +pill(160,48,640,36,`Giao hai điều kiện: [${f(p.a)}; +∞) ∩ (−∞; ${f(p.b)}] = [${f(p.a)}; ${f(p.b)}] (độ dài đoạn nghiệm L = ${f(p.b-p.a)})`,VIOLET_FILL,VIOLET,VIOLET,13.5);
 return frame('Biểu diễn miền nghiệm trên trục số',`Mô hình ${id}`,axisSvg+ticks+body);
}

function drawTrigTriangle(id,p,t){
 const m=grade9Math(id,p).result,u=clamp01(t/6),s=Math.min(350/Math.max(p.a,1.2),250/Math.max(p.b,1.2),84);
 const B=[560,395],A=[B[0]-p.a*s,B[1]],C=[B[0],B[1]-p.b*s];
 const P=[A[0]+(C[0]-A[0])*u,A[1]+(C[1]-A[1])*u];
 const degA=m.alpha,degC=90-degA;
 // R82 9-03: Cạnh đối cam (#B45309), cạnh kề xanh dương (#1D4ED8), cạnh huyền xanh lá (#15803D); góc đang xét tím (#6D28D9)
 const poly=`<polygon points="${f(A[0])},${f(A[1])} ${f(B[0])},${f(B[1])} ${f(C[0])},${f(C[1])}" fill="${BLUE_FILL}" fill-opacity="0.38" stroke="none"/>`;
 const sideAdj=seg(A,B,BLUE,4.5);
 const sideOpp=seg(B,C,ORANGE,4.5);
 const sideHyp=seg(A,C,GREEN,4.5);
 const rMark=rightMark(B,A,C,15,SLATE);
 const arcA=angleArc(A,B,C,40,`α=${f(degA,1)}°`,VIOLET,[20,-6]);
 const arcC=angleArc(C,A,B,32,`β=${f(degC,1)}°`,SLATE,[-14,14]);
 // Thanh tỉ số trực quan bên phải vùng vẽ (không đè lên tam giác)
 const barX=665,barW=240;
 const ratioPanel=id==='9-03-C01'
  ? `<g><rect x="${barX-16}" y="86" width="${barW+32}" height="156" rx="12" fill="#f8fafc" stroke="#cbd5e1"/>`
    +text(barX,112,`Tỉ số sin α & cos α (huyền = ${f(m.c,2)})`,13,800,VIOLET)
    +text(barX,140,`sin α = đối/huyền = ${f(m.sin,3)}`,12.5,750,ORANGE)
    +`<rect x="${barX}" y="148" width="${barW}" height="12" rx="6" fill="#e2e8f0"/><rect x="${barX}" y="148" width="${f(barW*m.sin)}" height="12" rx="6" fill="${ORANGE}"/>`
    +text(barX,184,`cos α = kề/huyền = ${f(m.cos,3)}`,12.5,750,BLUE)
    +`<rect x="${barX}" y="192" width="${barW}" height="12" rx="6" fill="#e2e8f0"/><rect x="${barX}" y="192" width="${f(barW*m.cos)}" height="12" rx="6" fill="${BLUE}"/>`
    +text(barX,228,`sin²α + cos²α = ${f(m.sin*m.sin+m.cos*m.cos,2)}`,12,800,GREEN)+`</g>`
  : id==='9-03-C02'
  ? `<g><rect x="${barX-16}" y="86" width="${barW+32}" height="156" rx="12" fill="#f8fafc" stroke="#cbd5e1"/>`
    +text(barX,112,`Tỉ số tan α & cot α (α = ${f(degA,1)}°)`,13,800,VIOLET)
    +text(barX,140,`tan α = đối/kề = ${f(m.tan,3)}`,12.5,750,GREEN)
    +`<rect x="${barX}" y="148" width="${barW}" height="12" rx="6" fill="#e2e8f0"/><rect x="${barX}" y="148" width="${f(barW*Math.min(1,m.tan/3))}" height="12" rx="6" fill="${GREEN}"/>`
    +text(barX,184,`cot α = kề/đối = ${f(m.cot,3)}`,12.5,750,VIOLET)
    +`<rect x="${barX}" y="192" width="${barW}" height="12" rx="6" fill="#e2e8f0"/><rect x="${barX}" y="192" width="${f(barW*Math.min(1,m.cot/3))}" height="12" rx="6" fill="${VIOLET}"/>`
    +text(barX,228,`tan α · cot α = 1`,12,800,INK)+`</g>`
  : `<g><rect x="${barX-16}" y="86" width="${barW+32}" height="156" rx="12" fill="#f8fafc" stroke="#cbd5e1"/>`
    +text(barX,112,'Giải tam giác vuông ABC (∠B = 90°)',13,800,VIOLET)
    +text(barX,140,`• Cạnh kề AB = c = ${f(p.a,2)}`,12.5,750,BLUE)
    +text(barX,166,`• Cạnh đối BC = a = ${f(p.b,2)}`,12.5,750,ORANGE)
    +text(barX,192,`• Cạnh huyền AC = √(a²+c²) = ${f(m.c,2)}`,12.5,800,VIOLET)
    +text(barX,220,`• ∠A = ${f(degA,1)}° ; ∠C = 90°−∠A = ${f(degC,1)}°`,12,750,GREEN)+`</g>`;
 const card=`<g opacity="0" pointer-events="none"><rect x="555" y="102" width="355" height="196" rx="14" fill="#f8fafc" stroke="#cbd5e1"/>`
  +text(572,132,`∠B = 90°  ·  α + β = ${f(degA,1)}° + ${f(degC,1)}° = 90°`,13.5,800,INK)
  +fracRow(572,172,'• sin α =','đối','huyền',`= ${f(m.sin,2)} = cos β`,GREEN,12.5)
  +fracRow(572,216,'• cos α =','kề','huyền',`= ${f(m.cos,2)} = sin β`,BLUE,12.5)
  +fracRow(572,260,'• tan α =','đối','kề',`= ${f(m.tan,2)} = cot β`,ORANGE,12.5)+`</g>`;
 return frame('Tỉ số lượng giác tam giác vuông',`Mô hình ${id}`,
  poly+sideAdj+sideOpp+sideHyp+rMark+arcA+arcC+ratioPanel
  +dot(A,VIOLET,7.5,'0')+dot(C,ORANGE,7.5,'1')+dot(B,SLATE,7)+dot(P,GREEN,6)
  +label(A,'A',-22,6,VIOLET)+label(B,'B',12,6,SLATE)+label(C,'C',10,-8,ORANGE)
  +text((A[0]+B[0])/2,B[1]+28,`kề = ${f(p.a)}`,14.5,800,BLUE).replace('<text ','<text text-anchor="middle" ')
  +text(B[0]+14,(B[1]+C[1])/2,`đối = ${f(p.b)}`,14.5,800,ORANGE)
  +text((A[0]+C[0])/2-14,(A[1]+C[1])/2-14,`huyền = ${f(m.c,2)}`,14.5,800,GREEN).replace('<text ','<text text-anchor="end" ')
  +card);
}

function drawIndirectMeasure(id,p,t){
 const m=grade9Math(id,p).result,u=clamp01(t/6),ox=200,oy=395,scale=Math.min(350/Math.max(p.d,1),210/Math.max(p.h,1),26),tx=ox+p.d*scale,top=oy-p.h*scale;
 const A=[ox,oy],B=[tx,oy],C=[tx,top];
 const rayEnd=[ox+(tx-ox)*Math.max(0.25,u),A[1]+(top-A[1])*Math.max(0.25,u)];
 const rMark=rightMark(B,A,C,14,SLATE);
 const arc=angleArc(A,B,C,44,`α=${f(m.alpha,1)}°`,ORANGE,[20,-6]);
 const card=`<desc>• Kết luận</desc><g opacity="0" pointer-events="none"><rect x="520" y="36" width="390" height="54" rx="12" fill="#f8fafc" stroke="#cbd5e1"/>${text(538,68,`BC = d · tan α = ${f(p.d)} · tan(${f(m.alpha,1)}°) = ${f(p.h,2)} m`,14.5,800,VIOLET)}</g>`;
 if(id==='9-04-C02'){
  // 9-04-C02: Đo khoảng cách qua sông (hai bờ sông + đường cơ sở AB xanh dương + hai tia ngắm xanh dương/xanh lá + khoảng cách BC tím)
  const riverTop=top-12,riverBot=oy-24;
  return frame('Khoảng cách qua sông bằng giác kế',`Mô hình ${id}`,
   `<rect x="90" y="${f(riverTop)}" width="780" height="${f(Math.max(24,riverBot-riverTop))}" rx="12" fill="#dbeafe" opacity="0.45"/>`
   +seg([80,oy],[880,oy],SLATE,3.5)
   +seg(A,B,BLUE,4)+seg(A,C,GREEN,3.5,'6 4')+seg(A,rayEnd,GREEN,4)+seg(B,C,VIOLET,4.5)
   +rMark+arc+dot(A,BLUE,7.5,'0')+dot(B,BLUE,7)+dot(C,VIOLET,8.5,'1')
   +label(A,'A (Giác kế)',-38,24,BLUE)+label(B,'B (Mốc bờ gần)',-20,24,BLUE)+label(C,'C (Mốc bên kia sông)',14,-6,VIOLET)
   +text((ox+tx)/2,oy+26,`Đường cơ sở d = AB = ${f(p.d)} m`,14.5,800,BLUE).replace('<text ','<text text-anchor="middle" ')
   +text(tx+14,(oy+top)/2,`Khoảng cách BC = ${f(p.h,2)} m`,14.5,800,VIOLET)
   +pill(110,42,540,34,`BC = AB · tan α = ${f(p.d)} · tan(${f(m.alpha,1)}°) = ${f(p.h,2)} m`,VIOLET_FILL,VIOLET,VIOLET,13.5)+card);
 }
 // 9-04-C01: Tia ngắm cam (#B45309), đáy xanh dương (#1D4ED8), chiều cao cần tìm tím (#6D28D9)
 return frame('Chiều cao tháp từ góc nâng',`Mô hình ${id}`,
  seg([80,oy],[890,oy],SLATE,4)
  +`<rect x="${f(tx-16)}" y="${f(top)}" width="32" height="${f(oy-top)}" rx="5" fill="${VIOLET_FILL}" stroke="${VIOLET}" stroke-width="2"/>`
  +seg(A,B,BLUE,4)+seg(A,C,ORANGE,2.5,'6 4')+seg(A,rayEnd,ORANGE,4.2)+seg(B,C,VIOLET,4.8)
  +rMark+arc+dot(A,BLUE,7.5,'0')+dot(B,SLATE,6.5)+dot(C,VIOLET,8.5,'1')+dot(rayEnd,ORANGE,6.5)
  +label(A,'A',-22,-10,BLUE)+label(B,'B',12,18,SLATE)+label(C,'C (Đỉnh)',16,-6,VIOLET)
  +text((ox+tx)/2,oy+28,`Khoảng cách ngang d = ${f(p.d)} m`,14.5,800,BLUE).replace('<text ','<text text-anchor="middle" ')
  +text(tx+22,(oy+top)/2,`h = ${f(p.h,2)} m`,15,800,VIOLET)
  +pill(110,42,520,34,`Chiều cao h = d · tan α = ${f(p.d)} · tan(${f(m.alpha,1)}°) = ${f(p.h,2)} m`,VIOLET_FILL,VIOLET,VIOLET,13.5)+card);
}

function drawCircleArc(id,p,t){
 const m=grade9Math(id,p).result,u=clamp01(t/6),O=[500,268],R=Math.min(p.r*46,154);
 // Với 9-05-C01, khi phát chuyển động tới 100% (t=6), góc mở tiến tới 180° để thấy dây AB trở thành đường kính 2R
 const ang=id==='9-05-C01'&&t>0?Number((p.theta+(180-p.theta)*u).toFixed(1)):p.theta;
 const rad=ang*Math.PI/180,a1=-rad/2,a2=rad/2;
 const A=[O[0]+R*Math.cos(a1),O[1]+R*Math.sin(a1)],B=[O[0]+R*Math.cos(a2),O[1]+R*Math.sin(a2)],large=ang>180?1:0;
 const sweepAng=a1+rad*Math.max(0.15,u),P=[O[0]+R*Math.cos(sweepAng),O[1]+R*Math.sin(sweepAng)];
 const activeLarge=(rad*Math.max(0.15,u))>Math.PI?1:0;
 const arcFull=`M ${f(A[0])} ${f(A[1])} A ${f(R)} ${f(R)} 0 ${large} 1 ${f(B[0])} ${f(B[1])}`;
 const arcSweep=`M ${f(A[0])} ${f(A[1])} A ${f(R)} ${f(R)} 0 ${activeLarge} 1 ${f(P[0])} ${f(P[1])}`;
 const sector=`M ${O[0]} ${O[1]} L ${f(A[0])} ${f(A[1])} A ${f(R)} ${f(R)} 0 ${large} 1 ${f(B[0])} ${f(B[1])} Z`;
 const innerR=R*(p.inner||.55),Ai=[O[0]+innerR*Math.cos(a1),O[1]+innerR*Math.sin(a1)],Bi=[O[0]+innerR*Math.cos(a2),O[1]+innerR*Math.sin(a2)];
 const H=[(A[0]+B[0])/2,(A[1]+B[1])/2];
 const cArc=angleArc(O,A,B,36,`${f(ang,0)}°`,VIOLET,[10,-12]);
 const rMarkH=id==='9-05-C01'&&Math.hypot(H[0]-O[0],H[1]-O[1])>12?rightMark(H,O,B,11,SLATE):'';
 const chordVal=2*p.r*Math.sin(rad/2),arcVal=p.r*rad;
 const leftCard=`<desc>• Kết luận</desc><g opacity="0" pointer-events="none"><rect x="40" y="122" width="420" height="202" rx="14" fill="#f8fafc" stroke="#cbd5e1"/>`
  +text(58,154,`R = ${f(p.r)}  ·  ∠AOB = ${f(ang,0)}°`,15,800,INK)
  +text(58,186,`AB = 2R·sin(θ/2) = ${f(chordVal,2)} ≤ 2R = ${f(2*p.r,2)}`,13.5,700,INK)
  +fracRow(58,226,'ℓ =','π · R · θ','180°',`= ${f(arcVal,2)}`,GREEN,13)
  +fracRow(58,270,'S quạt =','π · R² · θ','360°',`= ${f(m.sector,2)}`,ORANGE,13)
  +(id==='9-05-C04'?text(58,306,`S vành khuyên = π(R² − r²) = ${f(m.annulus,2)} ; S quạt = ${f(m.sector,2)}`,13,800,INK):'')+`</g>`;
 const isDiam=Math.abs(ang-180)<1e-3;
 const topBadge=id==='9-05-C01'
  ? pill(42,42,520,34,isDiam?`θ = 180° ⇒ Dây AB đi qua tâm O và trở thành đường kính lớn nhất 2R = ${f(2*p.r,2)}`:`Dây cung AB = 2R·sin(θ/2) = ${f(chordVal,2)} < Đường kính 2R = ${f(2*p.r,2)}`,isDiam?VIOLET_FILL:ORANGE_FILL,isDiam?VIOLET:ORANGE,isDiam?VIOLET:ORANGE,13)
  : id==='9-05-C02'
  ? pill(42,42,490,34,`Góc ở tâm ∠AOB = ${f(ang,0)}° chắn cung nhỏ AB ⇒ sđ cung AB = ${f(ang,0)}°`,VIOLET_FILL,VIOLET,VIOLET,13)
  : id==='9-05-C03'
  ? pill(42,42,490,34,`Độ dài cung tròn: ℓ = (π·R·θ)/180° = ${f(arcVal,2)} (R = ${f(p.r)}, θ = ${f(ang,0)}°)`,VIOLET_FILL,VIOLET,VIOLET,13)
  : pill(42,42,580,34,`S quạt = ${f(m.sector,2)}  |  S vành khuyên = π(R² − r²) = ${f(m.annulus,2)} (phần lỗ r = ${f(p.r*(p.inner||.55),2)} rỗng)`,BLUE_FILL,BLUE,BLUE,13);
 return frame('Dây cung, cung tròn và hình quạt',`Mô hình ${id}`,
  leftCard+topBadge
  +`<circle cx="${O[0]}" cy="${O[1]}" r="${f(R)}" fill="${id==='9-05-C04'?BLUE_FILL+'55':'#f8fafc'}" stroke="${id==='9-05-C01'||id==='9-05-C03'?SLATE:BLUE}" stroke-width="3"/>`
  +(id==='9-05-C04'?`<circle cx="${O[0]}" cy="${O[1]}" r="${f(innerR)}" fill="#ffffff" stroke="${SLATE}" stroke-width="2.4" stroke-dasharray="6 4"/><path d="M ${f(A[0])} ${f(A[1])} A ${f(R)} ${f(R)} 0 ${large} 1 ${f(B[0])} ${f(B[1])} L ${f(Bi[0])} ${f(Bi[1])} A ${f(innerR)} ${f(innerR)} 0 ${large} 0 ${f(Ai[0])} ${f(Ai[1])} Z" fill="${ORANGE_FILL}" fill-opacity="0.72" stroke="${ORANGE}" stroke-width="2.6"/>`:'')
  +(id==='9-05-C03'?`<path d="${arcFull}" fill="none" stroke="#cbd5e1" stroke-width="5" stroke-dasharray="5 4"/><path d="${arcSweep}" fill="none" stroke="${ORANGE}" stroke-width="6.5"/>`:`<path d="${arcFull}" fill="none" stroke="${ORANGE}" stroke-width="6"/>`)
  +cArc
  +seg([O[0]-R,O[1]],[O[0]+R,O[1]],id==='9-05-C01'?VIOLET:SLATE,id==='9-05-C01'?2.8:2,'6 4')
  +seg(O,A,id==='9-05-C02'?BLUE:SLATE,2.8)+seg(O,B,id==='9-05-C02'?BLUE:SLATE,2.8)
  +(id==='9-05-C01'?seg(A,B,isDiam?VIOLET:ORANGE,4.8)+seg(O,H,SLATE,2.2,'4 3')+rMarkH+dot(H,SLATE,4.5)+label(H,'H',8,-10,SLATE):'')
  +dot(O,BLUE,6,'0')+dot(A,ORANGE,7.5,'1')+dot(B,ORANGE,7.5,'1')+dot(P,VIOLET,6)
  +label(O,'O',-24,-10,BLUE)+label(A,'A',12,-8,ORANGE)+label(B,'B',12,18,ORANGE));
}

function inscribedCircle(id,p,t){
 const O=[500,268],R=154,u=clamp01(t/6),central=p.theta,inscribed=central/2,ang=central*Math.PI/180;
 const A=[O[0]+R*Math.cos(-ang/2),O[1]+R*Math.sin(-ang/2)],B=[O[0]+R*Math.cos(ang/2),O[1]+R*Math.sin(ang/2)];
 const large=central>180?1:0;
 const sharedArc=`M ${f(A[0])} ${f(A[1])} A ${f(R)} ${f(R)} 0 ${large} 1 ${f(B[0])} ${f(B[1])}`;
 const leftCard=`<desc>• Kết luận</desc><g opacity="0" pointer-events="none"><rect x="40" y="138" width="410" height="142" rx="14" fill="#f8fafc" stroke="#cbd5e1"/>`
  +text(58,172,`∠AOB = ${f(central,1)}°  ·  ∠AMB = ${f(inscribed,1)}°`,15.5,800,ORANGE)
  +fracRow(58,220,'∠AMB =','1','2','· ∠AOB',BLUE,14)
  +text(58,260,'Góc nội tiếp bằng nửa góc ở tâm cùng chắn cung',13,700,VIOLET)+`</g>`;
 if(id==='9-07-C02'){
  // 9-07-C02: Các góc nội tiếp cùng chắn một cung AB (cung chắn cam #B45309, góc M xanh dương #1D4ED8, góc N xanh lá #15803D, kết luận bằng nhau tím #6D28D9)
  const mAng=Math.PI-0.48+0.32*u,nAng=Math.PI+0.52-0.28*u;
  const M=[O[0]+R*Math.cos(mAng),O[1]+R*Math.sin(mAng)],N=[O[0]+R*Math.cos(nAng),O[1]+R*Math.sin(nAng)];
  const arcM=angleArc(M,A,B,34,`${f(inscribed,1)}°`,BLUE,[12,-4]);
  const arcN=angleArc(N,A,B,34,`${f(inscribed,1)}°`,GREEN,[12,6]);
  return frame('Các góc nội tiếp cùng chắn một cung',`Mô hình ${id}`,
   leftCard
   +pill(42,42,560,34,`Cùng chắn cung AB (${f(central,0)}°): ∠AMB = ∠ANB = ${f(inscribed,1)}° (hai góc nội tiếp bằng nhau)`,VIOLET_FILL,VIOLET,VIOLET,13)
   +`<circle cx="${O[0]}" cy="${O[1]}" r="${R}" fill="#f8fafc" stroke="${SLATE}" stroke-width="2.6"/>`
   +`<path d="${sharedArc}" fill="none" stroke="${ORANGE}" stroke-width="6.5"/>`
   +seg(M,A,BLUE,3.2)+seg(M,B,BLUE,3.2)
   +seg(N,A,GREEN,3.2)+seg(N,B,GREEN,3.2)
   +arcM+arcN
   +dot(O,SLATE,5.5)+dot(A,ORANGE,7.5,'0')+dot(B,ORANGE,7.5,'0')+dot(M,BLUE,8,'0')+dot(N,GREEN,8,'0')
   +label(O,'O',-20,-8,SLATE)+label(A,'A',12,-6,ORANGE)+label(B,'B',12,18,ORANGE)+label(M,'M',-26,-8,BLUE)+label(N,'N',-26,16,GREEN));
 }
 // 9-07-C01: Góc ở tâm xanh dương (#1D4ED8), góc nội tiếp cam (#B45309), cung chắn chung tím (#6D28D9)
 const mAng=Math.PI-0.35+0.7*u,M=[O[0]+R*Math.cos(mAng),O[1]+R*Math.sin(mAng)];
 const arcO=angleArc(O,A,B,32,`${f(central,0)}°`,BLUE,[10,-12]);
 const arcM=angleArc(M,A,B,38,`${f(inscribed,1)}°`,ORANGE,[14,0]);
 return frame('Góc ở tâm và góc nội tiếp',`Mô hình ${id}`,
  leftCard
  +pill(42,42,540,34,`Cung chắn AB: ∠AMB = ½ ∠AOB = ½ · ${f(central,0)}° = ${f(inscribed,1)}° (tỉ lệ 1 : 2)`,VIOLET_FILL,VIOLET,VIOLET,13)
  +`<circle cx="${O[0]}" cy="${O[1]}" r="${R}" fill="#f8fafc" stroke="${SLATE}" stroke-width="2.6"/>`
  +`<path d="${sharedArc}" fill="none" stroke="${VIOLET}" stroke-width="6.5"/>`
  +seg(O,A,BLUE,3.4)+seg(O,B,BLUE,3.4)+seg(M,A,ORANGE,3.4)+seg(M,B,ORANGE,3.4)+arcO+arcM
  +dot(O,BLUE,6.5)+dot(A,VIOLET,7.5,'0')+dot(B,VIOLET,7.5,'0')+dot(M,ORANGE,8,'0')
  +label(O,'O',-24,-10,BLUE)+label(A,'A',12,-6,VIOLET)+label(B,'B',12,18,VIOLET)+label(M,'M',-26,-8,ORANGE));
}

function centersTriangle(id,p,t){
 const scale=30+p.r*3.8,z=grade9TriangleCenters(p),[cx,cy]=[500,280],map=([x,y])=>[cx+x*scale,cy-y*scale];
 const A=map(z.A),B=map(z.B),C=map(z.C),O=map(z.O),I=map(z.I),R=z.R*scale,r=z.r*scale,u=clamp01(t/6);
 const leftCard=`<desc>• Kết luận</desc><g opacity="0" pointer-events="none"><rect x="40" y="142" width="410" height="128" rx="14" fill="#f8fafc" stroke="#cbd5e1"/>`
  +text(58,178,`Ngoại tiếp: R = OA = OB = OC = ${f(z.R,2)}`,15,800,BLUE)
  +text(58,216,`Nội tiếp: r = S / p = ${f(z.r,2)}`,15,800,ORANGE)
  +text(58,250,`O: giao 3 trung trực  ·  I: giao 3 phân giác`,13.5,700,VIOLET)+`</g>`;
 if(id==='9-07-C03'){
  // 9-07-C03: Đường tròn ngoại tiếp tam giác (Trung trực xám #475569, tâm O tím #6D28D9, 3 bán kính OA=OB=OC xanh dương #1D4ED8)
  const M_ab=[(A[0]+B[0])/2,(A[1]+B[1])/2],M_bc=[(B[0]+C[0])/2,(B[1]+C[1])/2];
  return frame('Đường tròn ngoại tiếp tam giác',`Mô hình ${id}`,
   leftCard
   +pill(42,42,560,34,`Tâm ngoại tiếp O (giao 3 đường trung trực): OA = OB = OC = R = ${f(z.R,2)}`,VIOLET_FILL,VIOLET,VIOLET,13)
   +`<polygon points="${f(A[0])},${f(A[1])} ${f(B[0])},${f(B[1])} ${f(C[0])},${f(C[1])}" fill="${BLUE_FILL}44" stroke="${INK}" stroke-width="3.2"/>`
   +seg(M_ab,O,SLATE,2.2,'6 4')+seg(M_bc,O,SLATE,2.2,'6 4')
   +rightMark(M_ab,B,O,10,SLATE)+rightMark(M_bc,C,O,10,SLATE)
   +(u>=0.25?seg(O,A,BLUE,2.8,'5 3')+seg(O,B,BLUE,2.8,'5 3')+seg(O,C,BLUE,2.8,'5 3'):'')
   +`<circle cx="${f(O[0])}" cy="${f(O[1])}" r="${f(R)}" fill="none" stroke="${BLUE}" stroke-width="3.5" stroke-opacity="${f(0.35+0.65*u)}"/>`
   +dot(M_ab,SLATE,4.5)+dot(M_bc,SLATE,4.5)+dot(O,VIOLET,7.5,'0')+dot(A,BLUE,6.5)+dot(B,BLUE,6.5)+dot(C,BLUE,6.5)
   +label(A,'A',-22,12,INK)+label(B,'B',12,12,INK)+label(C,'C',8,-10,INK)+label(O,'O (Tâm ngoại tiếp)',12,-8,VIOLET));
 }
 // 9-07-C04: Đường tròn nội tiếp tam giác (Phân giác xanh dương #1D4ED8 / xanh lá #15803D, bán kính vuông góc cam #B45309, tâm I tím #6D28D9)
 const proj=(P,Q,K)=>{const dx=Q[0]-P[0],dy=Q[1]-P[1],len2=dx*dx+dy*dy||1,tProj=((K[0]-P[0])*dx+(K[1]-P[1])*dy)/len2;return [P[0]+tProj*dx,P[1]+tProj*dy];};
 const H_ab=proj(A,B,I),H_bc=proj(B,C,I),H_ca=proj(C,A,I);
 return frame('Đường tròn nội tiếp tam giác',`Mô hình ${id}`,
  leftCard
  +pill(42,42,570,34,`Tâm nội tiếp I (giao 3 phân giác): khoảng cách tới 3 cạnh IH₁ = IH₂ = IH₃ = r = ${f(z.r,2)}`,VIOLET_FILL,VIOLET,VIOLET,13)
  +`<polygon points="${f(A[0])},${f(A[1])} ${f(B[0])},${f(B[1])} ${f(C[0])},${f(C[1])}" fill="${SLATE_FILL}" stroke="${INK}" stroke-width="3.2"/>`
  +seg(A,I,BLUE,2.6,'6 4')+seg(B,I,GREEN,2.6,'6 4')
  +(u>=0.25?seg(I,H_ab,ORANGE,3)+seg(I,H_bc,ORANGE,3)+seg(I,H_ca,ORANGE,3)+rightMark(H_ab,B,I,10,ORANGE)+rightMark(H_bc,C,I,10,ORANGE):'')
  +`<circle cx="${f(I[0])}" cy="${f(I[1])}" r="${f(r)}" fill="${ORANGE_FILL}55" stroke="${ORANGE}" stroke-width="3.2" stroke-opacity="${f(0.35+0.65*u)}"/>`
  +dot(H_ab,ORANGE,5)+dot(H_bc,ORANGE,5)+dot(H_ca,ORANGE,5)+dot(I,VIOLET,7.5,'0')+dot(A,BLUE,6.5)+dot(B,GREEN,6.5)+dot(C,INK,6.5)
  +label(A,'A',-22,12,BLUE)+label(B,'B',12,12,GREEN)+label(C,'C',8,-10,INK)+label(I,'I (Tâm nội tiếp)',12,-10,VIOLET));
}

function cyclicQuad(id,p,t){
 const O=[500,268],R=154,u=clamp01(t/6),a1=(-142+18*u)*Math.PI/180,a2=-25*Math.PI/180,a3=(35+p.theta*.45)*Math.PI/180,a4=145*Math.PI/180;
 const pts=[a1,a2,a3,a4].map(a=>[O[0]+R*Math.cos(a),O[1]+R*Math.sin(a)]);
 const oppA=Math.round(p.theta*.65),oppC=180-oppA;
 // R82 9-07-C05: Góc A cam (#B45309), góc C xanh lá (#15803D), đường tròn xanh dương (#1D4ED8), tổng kết tím (#6D28D9)
 const arcA=angleArc(pts[0],pts[3],pts[1],32,`${f(oppA,0)}°`,ORANGE);
 const arcC=angleArc(pts[2],pts[1],pts[3],32,`${f(oppC,0)}°`,GREEN);
 const leftCard=`<desc>• Kết luận</desc><g opacity="0" pointer-events="none"><rect x="40" y="142" width="410" height="128" rx="14" fill="#f8fafc" stroke="#cbd5e1"/>`
  +text(58,178,`∠DAB = ${f(oppA,1)}°  ·  ∠BCD = ${f(oppC,1)}°`,15.5,800,ORANGE)
  +text(58,216,`∠A + ∠C = ${f(oppA,0)}° + ${f(oppC,0)}° = 180°`,16,800,VIOLET)
  +text(58,250,`∠B + ∠D = 180°`,14,700,BLUE)+`</g>`;
 return frame('Tứ giác nội tiếp đường tròn',`Mô hình ${id}`,
  leftCard
  +pill(42,42,560,34,`Tứ giác ABCD nội tiếp (O): Tổng hai góc đối ∠A + ∠C = ${f(oppA,0)}° + ${f(oppC,0)}° = 180°`,VIOLET_FILL,VIOLET,VIOLET,13)
  +`<circle cx="${O[0]}" cy="${O[1]}" r="${R}" fill="#f8fafc" stroke="${BLUE}" stroke-width="3.2"/>`
  +`<polygon points="${pts.map(P=>P.map(x=>f(x)).join(',')).join(' ')}" fill="${BLUE_FILL}38" stroke="${BLUE}" stroke-width="3.2"/>`
  +arcA+arcC+pts.map((P,i)=>dot(P,i===0?ORANGE:i===2?GREEN:BLUE,7.5,String(i))+label(P,'ABCD'[i],P[0]>=O[0]?12:-22,P[1]>=O[1]?18:-10,i===0?ORANGE:i===2?GREEN:INK)).join(''));
}

function regularCircle(id,p,t){
 const O=[500,268],R=154,n=Math.max(3,Math.round(p.n||p.sides||6)),u=clamp01(t/6),rot=u*(2*Math.PI/n);
 const pts=Array.from({length:n},(_,i)=>{const a=rot-Math.PI/2+2*Math.PI*i/n;return [O[0]+R*Math.cos(a),O[1]+R*Math.sin(a)];});
 const m=grade9Math(id,p).result,central=360/n,interior=m.polyAngle??(180-360/n),rIn=R*Math.cos(Math.PI/n);
 const M=[(pts[0][0]+pts[1][0])/2,(pts[0][1]+pts[1][1])/2];
 const leftCard=`<desc>• Kết luận</desc><g opacity="0" pointer-events="none"><rect x="40" y="138" width="410" height="136" rx="14" fill="#f8fafc" stroke="#cbd5e1"/>`
  +text(58,172,`Đa giác đều n = ${n} cạnh`,15.5,800,INK)
  +fracRow(58,214,'Góc ở tâm α =','360°',String(n),`= ${f(central,1)}°`,ORANGE,13.5)
  +text(58,254,`Góc trong mỗi đỉnh: ${f(interior,1)}°`,14.5,800,GREEN)+`</g>`;
 // R82 9-07-C06: Đường tròn ngoài xanh dương (#1D4ED8), đường tròn trong xanh lá (#15803D), apothem cam (#B45309)
 return frame('Đa giác đều và phép quay giữ nguyên hình',`Mô hình ${id}`,
  leftCard
  +pill(42,42,580,34,`n = ${n} cạnh: R ngoại tiếp = ${f(p.r,2)}  |  r nội tiếp (apothem OM) = R·cos(180°/${n}) = ${f(m.inradius,2)}`,VIOLET_FILL,VIOLET,VIOLET,13)
  +`<circle cx="${O[0]}" cy="${O[1]}" r="${R}" fill="#f8fafc" stroke="${BLUE}" stroke-width="3"/>`
  +`<polygon points="${pts.map(P=>P.map(x=>f(x)).join(',')).join(' ')}" fill="${BLUE_FILL}33" stroke="${INK}" stroke-width="3"/>`
  +`<circle cx="${O[0]}" cy="${O[1]}" r="${f(rIn)}" fill="none" stroke="${GREEN}" stroke-width="2.6" stroke-dasharray="6 4"/>`
  +pts.map((P,i)=>seg(O,P,SLATE,1.6,'4 3')+dot(P,BLUE,6.5,i===0?'0':'')).join('')
  +seg(O,M,ORANGE,3.6)+rightMark(M,pts[0],O,10,ORANGE)+dot(M,ORANGE,6)+label(M,'M (r)',10,-6,ORANGE)
  +dot(O,VIOLET,6.5)+label(O,'O',-20,16,VIOLET));
}

function drawFrequency(id,p,t){
 const m=grade9Math(id,p).result,labels=id==='9-12-C03'?['[4; 5.5)','[5.5; 7)','[7; 8.5)','[8.5; 10]']:['Nhóm A','Nhóm B','Nhóm C','Nhóm D'],base=410;
 const active=Math.min(3,Math.floor(clamp01(t/6)*4)),counts=m.data||m.counts||[p.n1,p.n2,p.n3,p.n4];
 const bars=counts.map((c,i)=>{
  const x=id==='9-12-C03'?190+i*125:165+i*150,w=id==='9-12-C03'?121:86,h=c*11.4,y=base-h;
  const val=id==='9-12-C01'?`${c}`:`${f(m.proportions[i]*100,1)}%`;
  const fillCol=i===active?ORANGE:id==='9-12-C02'&&(i%2===1)?GREEN:BLUE;
  const strokeCol=i===active?ORANGE:INK;
  return `<rect data-bar="${i}" x="${x}" y="${f(y)}" width="${w}" height="${f(h)}" rx="${id==='9-12-C03'?3:9}" fill="${fillCol}" fill-opacity="0.86" stroke="${strokeCol}" stroke-width="${i===active?3:1.2}"/>${dot([x+w/2,y],ORANGE,7,'P'+i)}<text x="${x+w/2}" y="${f(y-12)}" text-anchor="middle" font-size="14" font-weight="800" fill="${INK}">${val}</text><text x="${x+w/2}" y="${base+26}" text-anchor="middle" font-size="13" font-weight="700" fill="${SLATE}">${labels[i]}</text>`;
 }).join('');
 return frame('Tần số và tần số tương đối',`Mô hình ${id} · kéo đỉnh cột để đổi cỡ mẫu N = ${m.total} (nhóm đang quét: ${labels[active]})`,
  seg([120,base],[820,base],SLATE,3)+bars
  +pill(580,48,310,36,`Tổng cỡ mẫu N = ${m.total}  ·  Σfᵢ = 100%`,VIOLET_FILL,VIOLET,VIOLET,14)
  +text(120,462,'• Kết luận: Tần số tương đối fᵢ = nᵢ/N cho biết tỉ lệ phần trăm của từng nhóm trong tổng mẫu N (Σfᵢ = 100%)',13,700,GREEN));
}

function drawProbability(id,p,t,opts={}){
 const ex=grade9Experiment(id,p,opts.tries||0,opts.seed??20260926);
 const prob=ex.theoretical??ex.probability??(id==='9-13-C02'?(p.wanted/p.sides)**2:p.wanted/p.sides);
 const lastOut=ex.outcomes?.length?ex.outcomes.at(-1):null;
 if(id==='9-13-C01'){
  // R82 9-13-C01 (GIU_TRUNG_TINH): Các ô có cùng kích thước và màu trung tính đồng nhất để không ám chỉ xác suất khác nhau; chỉ viền cam ô vừa quay trúng
  const O=[455,270],R=155,n=Math.round(p.sides);
  const period=4.0,cycle=Math.floor((t||0)/period),phase=(t||0)-cycle*period;
  const spinEase=phase<2.0?1-Math.pow(1-phase/2.0,3):1;
  const targetSector=lastOut?((Number(lastOut)-0.5)/n):(((cycle*3+1)%n)+0.5)/n;
  const a=lastOut!==null&&(phase>=2.0||phase<1e-6||!t)?-Math.PI/2+2*Math.PI*(Number(lastOut)-.5)/n:-Math.PI/2+2*Math.PI*(cycle*2+spinEase*(2+targetSector));
  const stopIdx=lastOut?Number(lastOut):((Math.floor(((a+Math.PI/2)/(2*Math.PI)%1+1)%1*n))%n)+1;
  let sectors='';
  for(let i=0;i<n;i++){
   const a1=-Math.PI/2+2*Math.PI*i/n,a2=-Math.PI/2+2*Math.PI*(i+1)/n,amid=(a1+a2)/2;
   const x1=O[0]+R*Math.cos(a1),y1=O[1]+R*Math.sin(a1),x2=O[0]+R*Math.cos(a2),y2=O[1]+R*Math.sin(a2);
   const isPicked=(i+1)===stopIdx&&(phase>=2.0||phase<1e-6||!t);
   const fav=i<p.wanted;
   sectors+=`<path d="M ${O[0]} ${O[1]} L ${f(x1)} ${f(y1)} A ${R} ${R} 0 0 1 ${f(x2)} ${f(y2)} Z" fill="${isPicked?ORANGE_FILL:SLATE_FILL}" stroke="${isPicked?ORANGE:SLATE}" stroke-width="${isPicked?3.5:2}"/>`;
   const lx=O[0]+R*0.65*Math.cos(amid),ly=O[1]+R*0.65*Math.sin(amid)+5;
   sectors+=`<text x="${f(lx)}" y="${f(ly)}" text-anchor="middle" font-size="13" font-weight="800" fill="${fav?BLUE:INK}">${i+1}${fav?'★':''}</text>`;
  }
  const stateTxt=phase>=2.0||phase<1e-6||!t?`⏸ Dừng tại ô số ${stopIdx} (${stopIdx<=p.wanted?'Thuận lợi ★':'Không thuận lợi'})`:`↻ Đang quay lần ${cycle+1}...`;
  return frame('Không gian mẫu và biến cố thuận lợi',`Mô hình ${id}`,
   sectors+seg(O,[O[0]+R*Math.cos(a),O[1]+R*Math.sin(a)],ORANGE,5)+dot(O,INK,8)
   +text(52,145,`Thuận lợi (★): ${p.wanted}/${n} ô bằng nhau`,16,750,BLUE)
   +text(52,178,`P(A) = ${f(prob,3)}`,18,800,VIOLET)
   +text(52,212,`Thử ${ex.tries}: f = ${f(ex.relative,3)}`,16,700,INK)
   +text(52,246,stateTxt,14,800,phase>=2.0?GREEN:ORANGE)
   +text(52,452,'• Kết luận: Trong phép thử đồng khả năng, n ô có diện tích bằng nhau; P(A) = n(A)/n(Ω)',12.5,700,INK));
 }
 if(id==='9-13-C02'){
  // Fix 9-13-C02: Luôn phụ thuộc mượt vào t để s(0) !== s(2.7), đồng thời khớp đúng tọa độ cx = left + (last2[0]-0.5)*sz, cy = top + (last2[1]-0.5)*sz ở t=2 khi có tries>0
  const n=Math.round(p.sides),sz=37,left=470-n*sz/2,top=175;let cells='';
  const period=4.0,cycle=Math.floor((t||0)/period),phase=(t||0)-cycle*period;
  const isSpinning=opts.tries>0?(t>0&&phase<1.8):(t>0&&phase<3.2);
  const scanIdx=Math.floor(((t||0)*5.3)%(n*n)),stopIdx=((cycle*5+2)%(n*n));
  const pick=isSpinning
   ? [Math.floor(scanIdx/n)+1,(scanIdx%n)+1]
   : (lastOut?String(lastOut).split('-').map(Number):[Math.floor(stopIdx/n)+1,(stopIdx%n)+1]);
  for(let r=1;r<=n;r++)for(let c=1;c<=n;c++){
   const fav=r<=p.wanted&&c<=p.wanted,isSel=!isSpinning&&r===pick[0]&&c===pick[1],x=left+(r-1)*sz,y=top+(c-1)*sz;
   cells+=`<rect x="${f(x)}" y="${f(y)}" width="${sz-4}" height="${sz-4}" rx="6" fill="${isSel?ORANGE_FILL:fav?VIOLET_FILL:SLATE_FILL}" stroke="${isSel?ORANGE:fav?VIOLET:BLUE}" stroke-width="${isSel?2.8:fav?1.8:1}"/><text x="${f(x+7)}" y="${f(y+22)}" font-size="11" font-weight="700" fill="${fav?VIOLET:INK}">${r},${c}</text>`;
  }
  const px=left+(pick[0]-.5)*sz,py=top+(pick[1]-.5)*sz;
  const stateTxt=isSpinning?`↻ Đang duyệt cặp (${pick[0]}, ${pick[1]}) [t=${f(t,1)}s]...`:`⏸ ĐÃ DỪNG: Cặp (${pick[0]}, ${pick[1]}) ${pick[0]<=p.wanted&&pick[1]<=p.wanted?'∈ A (thuận lợi)':'∉ A'}`;
  return frame('Bảng không gian mẫu hai phép chọn',`Mô hình ${id}`,
   cells+dot([px,py],ORANGE,7)
   +text(52,155,`Ω có ${n*n} cặp kết quả đồng khả năng`,16,750,BLUE)
   +text(52,188,`${p.wanted*p.wanted} cặp thuận lợi · P = ${f(prob,3)}`,17,800,VIOLET)
   +text(52,220,`Thử ${ex.tries} lần: f = ${f(ex.relative,3)}`,16,700,INK)
   +text(52,252,stateTxt,13.5,800,isSpinning?ORANGE:GREEN)
   +text(52,452,`• Kết luận: Bảng liệt kê đầy đủ n² = ${n*n} cặp kết quả (i, j) giúp đếm chính xác số kết quả thuận lợi n(A) = ${p.wanted*p.wanted}`,12.5,700,INK));
 }
 // 9-13-C03: Thực nghiệm và thống kê kết quả (Tần suất xanh dương #1D4ED8, mốc lý thuyết xanh lá #15803D, kết quả mới cam #B45309)
 const y=v=>395-v*240,py=y(prob);
 const period=4.0,cycle=Math.floor((t||0)/period),phase=(t||0)-cycle*period,isSpinning=t>0&&phase<2.0;
 const series=[];let hits=0;
 const sampleRun=ex.outcomes?.length?ex.outcomes:grade9Experiment(id,p,16,opts.seed??20260926).outcomes;
 for(let i=0;i<sampleRun.length;i++){if(Number(sampleRun[i])<=p.wanted)hits++;series.push(hits/(i+1));}
 const pts=series.map((v,i,a)=>`${f(130+i*(700/Math.max(1,a.length-1)))},${f(y(v))}`).join(' ');
 const prog=clamp01((t||0)/6);
 const curIdx=Math.min(series.length-1,Math.floor(prog*Math.max(1,series.length-1)));
 const waveX=130+prog*700,waveY=y(series[curIdx]??prob);
 const stateTxt=isSpinning?`↻ Đang thực hiện loạt phép thử (t = ${f(t,1)}s)...`:`⏸ Tần số tương đối thực nghiệm f(N) = ${f(ex.relative,3)} · Mốc lý thuyết P(A) = ${f(prob,3)}`;
 return frame('Tần số tương đối thực nghiệm hội tụ về xác suất lý thuyết',`Mô hình ${id}`,
  seg([130,395],[840,395],SLATE,3)+seg([130,145],[130,395],SLATE,3)
  +seg([130,py],[840,py],GREEN,2.8,'7 5')
  +`<polyline fill="none" stroke="${BLUE}" stroke-width="3.5" points="${pts}"/>`
  +dot([waveX,waveY],ORANGE,7)
  +text(140,118,`P lý thuyết = ${f(prob,3)} · Tần số tương đối thực nghiệm f(${ex.tries}) = ${f(ex.relative,3)}`,14.5,800,INK)
  +text(140,142,stateTxt,13.5,800,isSpinning?ORANGE:GREEN)
  +text(130,445,'• Kết luận: Khi số phép thử N lớn, tần số tương đối thực nghiệm f = k/N dao động quanh xác suất lý thuyết P(A)',12.5,700,GREEN));
}

export function grade9SceneSVG(id,p,t=0,opts={}){
 if(id.startsWith('9-02'))return drawInequality(id,p,t);
 if(id.startsWith('9-03'))return drawTrigTriangle(id,p,t);
 if(id.startsWith('9-04'))return drawIndirectMeasure(id,p,t);
 if(id.startsWith('9-05'))return drawCircleArc(id,p,t);
 if(id==='9-07-C01'||id==='9-07-C02')return inscribedCircle(id,p,t);
 if(id==='9-07-C03'||id==='9-07-C04')return centersTriangle(id,p,t);
 if(id==='9-07-C05')return cyclicQuad(id,p,t);
 if(id==='9-07-C06')return regularCircle(id,p,t);
 if(id.startsWith('9-12'))return drawFrequency(id,p,t);
 if(id.startsWith('9-13'))return drawProbability(id,p,t,opts);
 throw Error('Không có cảnh SVG cho '+id);
}

export function grade9NetSVG(id,p,t=0){
 const m=grade9Math(id,p).result,u=clamp01(t),open=0.22+0.78*u;

 if(id==='9-09-C01'){
  const rPx=Math.min(110,p.r*26),hPx=Math.min(185,p.h*30)*open;
  const ox=390,oy=340,oTop=[ox,oy-hPx],aBot=[ox+rPx,oy],bTop=[ox+rPx,oy-hPx];
  return frame('Hình chữ nhật OO′AB quay quanh trục OO′ tạo hình trụ',id,
   `<ellipse cx="${ox}" cy="${oy}" rx="${f(rPx)}" ry="${f(rPx*0.26)}" fill="${GREEN_FILL}" fill-opacity="0.55" stroke="${GREEN}" stroke-width="2.6"/>`
   +`<ellipse cx="${ox}" cy="${f(oy-hPx)}" rx="${f(rPx)}" ry="${f(rPx*0.26)}" fill="${GREEN_FILL}" fill-opacity="0.55" stroke="${GREEN}" stroke-width="2.6"/>`
   +`<rect x="${ox}" y="${f(oy-hPx)}" width="${f(rPx)}" height="${f(hPx)}" fill="${BLUE_FILL}" fill-opacity="0.72" stroke="${BLUE}" stroke-width="3"/>`
   +seg([ox-rPx,oy],[ox-rPx,oy-hPx],SLATE,2.2,'5 4')
   +seg([ox,oy+25],[ox,oy-hPx-25],VIOLET,3.4,'6 4')
   +seg(aBot,bTop,ORANGE,4.2)
   +rightMark([ox,oy],aBot,oTop,11,VIOLET)+rightMark(oTop,bTop,[ox,oy],11,VIOLET)
   +dot([ox,oy],VIOLET,6)+dot(oTop,VIOLET,6)+dot(aBot,ORANGE,6.5)+dot(bTop,ORANGE,6.5)
   +label([ox,oy],'O',-24,14,VIOLET)+label(oTop,'O′',-26,-6,VIOLET)+label(aBot,'A',12,14,ORANGE)+label(bTop,'B',12,-6,ORANGE)
   +text(ox+rPx+16,oy-hPx/2,`Đường sinh AB = l = h = ${f(p.h,1)}`,14,800,ORANGE)
   +text(ox+rPx/2-18,oy+22,`r = ${f(p.r,1)}`,13.5,800,BLUE)
   +text(48,145,`• Trục quay: OO′ = h = ${f(p.h,2)}`,14.5,750,VIOLET)
   +text(48,178,`• Bán kính đáy tròn: OA = O′B = r = ${f(p.r,2)}`,14.5,750,BLUE)
   +text(48,211,`• Đường sinh mặt trụ: l = AB = h = ${f(p.h,2)} (${Math.round(u*100)}%)`,14.5,800,ORANGE)
   +text(48,452,'• Kết luận: Khi quay hình chữ nhật OO′AB một vòng quanh cạnh OO′ cố định, ta được một hình trụ',12.5,700,INK));
 }

 if(id==='9-09-C02'){
  // R82 9-09-C02: Mặt bên xanh dương (#1D4ED8), đường cắt cam (#B45309), hai đáy xanh lá (#15803D)
  const fullW=Math.min(380,2*Math.PI*p.r*24),w=Math.max(48,fullW*open),h=Math.min(170,p.h*28),r=Math.min(46,p.r*12.5);
  const cx=530,cy=255,xLeft=cx-w/2,xRight=cx+w/2,yTop=cy-h/2,yBot=cy+h/2;
  return frame('Khai triển hình trụ: 2 đáy tròn + mặt bên chữ nhật',id,
   `<rect x="${f(cx-fullW/2)}" y="${f(yTop)}" width="${f(fullW)}" height="${f(h)}" rx="6" fill="none" stroke="#cbd5e1" stroke-width="1.8" stroke-dasharray="5 4"/>`
   +`<rect x="${f(xLeft)}" y="${f(yTop)}" width="${f(w)}" height="${f(h)}" rx="6" fill="${BLUE_FILL}" fill-opacity="0.78" stroke="${BLUE}" stroke-width="3"/>`
   +seg([xLeft,yTop],[xLeft,yBot],ORANGE,4.2)+seg([xRight,yTop],[xRight,yBot],ORANGE,4.2,'6 3')
   +`<circle cx="${cx}" cy="${f(yTop-r-10)}" r="${f(r)}" fill="${GREEN_FILL}" stroke="${GREEN}" stroke-width="3"/>`
   +`<circle cx="${cx}" cy="${f(yBot+r+10)}" r="${f(r)}" fill="${GREEN_FILL}" stroke="${GREEN}" stroke-width="3"/>`
   +seg([cx,yTop-r-10],[cx+r,yTop-r-10],BLUE,2.5)+label([cx+r/2,yTop-r-10],`r=${f(p.r,1)}`,-10,-6,BLUE)
   +text(cx,yBot+18,`Chiều dài mở = 2πr = ${f(2*Math.PI*p.r,2)}`,13,800,BLUE).replace('<text ','<text text-anchor="middle" ')
   +text(xRight+12,cy+4,`h = ${f(p.h,1)}`,13.5,800,ORANGE)
   +text(48,145,`• Chu vi đáy: 2πr = ${f(2*Math.PI*p.r,2)}`,14.5,750,BLUE)
   +text(48,178,`• Diện tích xung quanh: Sxq = 2πrh = ${f(m.surface,2)}`,14.5,750,BLUE)
   +text(48,211,`• Diện tích toàn phần: Stp = 2πrh + 2πr² = ${f(m.total,2)}`,15,800,GREEN)
   +text(48,452,'• Kết luận: Mặt xung quanh hình trụ cắt dọc đường sinh (cam) trải phẳng thành hình chữ nhật 2πr × h',12.5,700,INK));
 }

 if(id==='9-09-C03'){
  const rPx=Math.min(95,p.r*22),hFull=185,hCur=hFull*open,cx=560,yBot=355,yCur=yBot-hCur,yTop=yBot-hFull;
  const sBase=Math.PI*p.r*p.r,curV=sBase*p.h*open;
  return frame('Tích lũy các lớp thiết diện tròn S = πr² theo chiều cao h',id,
   `<rect x="${f(cx-rPx)}" y="${f(yTop)}" width="${f(2*rPx)}" height="${f(hFull)}" fill="none" stroke="${SLATE}" stroke-width="2" stroke-dasharray="5 4"/>`
   +`<rect x="${f(cx-rPx)}" y="${f(yCur)}" width="${f(2*rPx)}" height="${f(hCur)}" fill="${BLUE_FILL}" fill-opacity="0.65" stroke="${BLUE}" stroke-width="2.6"/>`
   +`<ellipse cx="${cx}" cy="${yBot}" rx="${f(rPx)}" ry="${f(rPx*0.26)}" fill="${GREEN_FILL}" stroke="${GREEN}" stroke-width="2.8"/>`
   +`<ellipse cx="${cx}" cy="${f(yCur)}" rx="${f(rPx)}" ry="${f(rPx*0.26)}" fill="${ORANGE_FILL}" stroke="${ORANGE}" stroke-width="3"/>`
   +seg([cx,yCur],[cx+rPx,yCur],ORANGE,2.8)+dot([cx,yCur],VIOLET,5.5)
   +text(cx+rPx+16,yCur+4,`Lát cắt z = ${f(p.h*open,2)} · S(z) = πr² = ${f(sBase,2)}`,13.5,800,ORANGE)
   +text(48,145,`• Diện tích đĩa tròn đáy: S_đáy = πr² = ${f(sBase,2)}`,14.5,750,GREEN)
   +text(48,178,`• Độ cao lớp quét: z = ${f(p.h*open,2)} / h = ${f(p.h,2)} (${Math.round(u*100)}%)`,14.5,750,ORANGE)
   +text(48,211,`• Thể tích tích lũy: V(z) = πr²·z = ${f(curV,2)} → V = ${f(m.volume,2)}`,15,800,VIOLET)
   +text(48,452,'• Kết luận: Mọi thiết diện vuông góc trục hình trụ đều là hình tròn diện tích πr² ⇒ V = S_đáy · h = πr²h',12.5,700,INK));
 }

 if(id==='9-10-C01'){
  const rPx=Math.min(115,p.r*26),hPx=Math.min(185,p.h*30)*open;
  const ox=430,oy=345,S=[ox,oy-hPx],A=[ox+rPx,oy],Aleft=[ox-rPx,oy];
  return frame('Tam giác vuông △SOA quay quanh trục cao SO tạo hình nón',id,
   `<ellipse cx="${ox}" cy="${oy}" rx="${f(rPx)}" ry="${f(rPx*0.25)}" fill="${GREEN_FILL}" fill-opacity="0.55" stroke="${GREEN}" stroke-width="2.8"/>`
   +`<polygon points="${ox},${oy} ${f(A[0])},${oy} ${ox},${f(S[1])}" fill="${BLUE_FILL}" fill-opacity="0.75" stroke="${BLUE}" stroke-width="2.8"/>`
   +seg(S,Aleft,SLATE,2.2,'5 4')+seg([ox,oy+22],[ox,S[1]-22],VIOLET,3.4,'6 4')
   +seg([ox,oy],S,VIOLET,3.8)+seg([ox,oy],A,GREEN,3.4)+seg(S,A,ORANGE,4.2)
   +rightMark([ox,oy],A,S,11,VIOLET)
   +dot([ox,oy],VIOLET,6)+dot(S,VIOLET,6.5)+dot(A,ORANGE,6.5)
   +label([ox,oy],'O (Tâm đáy)',-88,18,VIOLET)+label(S,'S (Đỉnh nón)',12,-6,VIOLET)+label(A,'A',12,14,ORANGE)
   +text((S[0]+A[0])/2+14,(S[1]+A[1])/2,`l = √(r²+h²) = ${f(m.l,2)}`,14,800,ORANGE)
   +text(48,145,`• Chiều cao trục: SO = h = ${f(p.h,2)}`,14.5,750,VIOLET)
   +text(48,178,`• Bán kính đáy: OA = r = ${f(p.r,2)}`,14.5,750,GREEN)
   +text(48,211,`• Đường sinh Pythagore: l = √(r²+h²) = ${f(m.l,2)} (${Math.round(u*100)}%)`,14.5,800,ORANGE)
   +text(48,452,'• Kết luận: Quay tam giác vuông △SOA một vòng quanh cạnh góc vuông SO cố định tạo thành hình nón; l² = r² + h²',12.5,700,INK));
 }

 if(id==='9-10-C02'){
  // R82 9-10-C02: Quạt xanh dương (#1D4ED8), cung mép & đường sinh cắt cam (#B45309), đáy xanh lá (#15803D)
  const R=Math.min(180,m.l*26),fullDeg=Math.min(340,360*p.r/m.l),deg=Math.max(18,fullDeg*open),rad=deg*Math.PI/180;
  const O=[560,255],A=[O[0]+R*Math.cos(-rad/2),O[1]+R*Math.sin(-rad/2)],B=[O[0]+R*Math.cos(rad/2),O[1]+R*Math.sin(rad/2)],large=deg>180?1:0;
  const rBase=Math.min(68,p.r*17),CBase=[245,275];
  return frame('Khai triển hình nón: quạt mặt bên và đáy tròn',id,
   `<path d="M ${O[0]} ${O[1]} L ${f(A[0])} ${f(A[1])} A ${f(R)} ${f(R)} 0 ${large} 1 ${f(B[0])} ${f(B[1])} Z" fill="${BLUE_FILL}" fill-opacity="0.75" stroke="${BLUE}" stroke-width="3"/>`
   +`<path d="M ${f(A[0])} ${f(A[1])} A ${f(R)} ${f(R)} 0 ${large} 1 ${f(B[0])} ${f(B[1])}" fill="none" stroke="${ORANGE}" stroke-width="4.5"/>`
   +seg(O,A,ORANGE,3.6)+seg(O,B,ORANGE,3.6,'6 3')
   +`<circle cx="${CBase[0]}" cy="${CBase[1]}" r="${f(rBase)}" fill="${GREEN_FILL}" stroke="${GREEN}" stroke-width="3.2"/>`
   +seg(CBase,[CBase[0]+rBase,CBase[1]],BLUE,2.6)+dot(CBase,GREEN,5)+dot(O,VIOLET,6)
   +label(O,'S',-20,-8,VIOLET)+label(CBase,'O',-18,-6,GREEN)
   +text(CBase[0],CBase[1]+rBase+22,`Chu vi đáy = 2πr = ${f(2*Math.PI*p.r,2)}`,13,800,GREEN).replace('<text ','<text text-anchor="middle" ')
   +text(48,145,`• Đường sinh l = √(r²+h²) = ${f(m.l,2)}`,14.5,750,ORANGE)
   +text(48,176,`• Góc quạt α = (r/l)·360° = ${f(360*p.r/m.l,1)}°`,14.5,750,BLUE)
   +text(48,207,`• Sxq = πrl = ${f(m.area,2)} · Stp = ${f(m.total,2)}`,14.5,800,VIOLET)
   +text(48,452,'• Kết luận: Mặt xung quanh hình nón trải thành quạt tròn bán kính l, cung quạt bằng đúng chu vi đáy 2πr',12.5,700,INK));
 }

 if(id==='9-10-C03'){
  const rPx=Math.min(105,p.r*24),hFull=190,zRatio=0.12+0.76*u,scaleZ=1-zRatio,rCutPx=rPx*scaleZ;
  const cx=560,yBot=355,yTop=yBot-hFull,yCut=yBot-hFull*zRatio,rCutReal=p.r*scaleZ;
  return frame('Thiết diện tròn thu nhỏ r(z) & Thể tích hình nón V = ⅓πr²h',id,
   `<polygon points="${f(cx-rPx)},${yBot} ${f(cx+rPx)},${yBot} ${cx},${yTop}" fill="${BLUE_FILL}" fill-opacity="0.45" stroke="${BLUE}" stroke-width="2.6"/>`
   +`<ellipse cx="${cx}" cy="${yBot}" rx="${f(rPx)}" ry="${f(rPx*0.24)}" fill="${GREEN_FILL}" stroke="${GREEN}" stroke-width="2.8"/>`
   +`<ellipse cx="${cx}" cy="${f(yCut)}" rx="${f(rCutPx)}" ry="${f(Math.max(3,rCutPx*0.24))}" fill="${ORANGE_FILL}" stroke="${ORANGE}" stroke-width="3"/>`
   +seg([cx,yBot],[cx,yTop],VIOLET,2.8,'5 4')
   +seg([cx,yCut],[cx+rCutPx,yCut],ORANGE,3)+dot([cx,yTop],VIOLET,6)+dot([cx,yCut],ORANGE,5.5)
   +label([cx,yTop],'S',8,-8,VIOLET)
   +text(cx+rCutPx+14,yCut+4,`r(z) = ${f(rCutReal,2)} · S(z) = ${f(Math.PI*rCutReal*rCutReal,2)}`,13.5,800,ORANGE)
   +text(48,145,`• Diện tích xung quanh: Sxq = πrl = ${f(m.area,2)}`,14.5,750,BLUE)
   +text(48,178,`• Tỉ lệ bán kính lát cắt tại z/h = ${Math.round(zRatio*100)}%: r(z)/r = ${f(scaleZ,2)}`,14.5,750,ORANGE)
   +text(48,211,`• Thể tích nón: V = ⅓πr²h = ${f(m.vol,2)} (bằng 1/3 hình trụ cùng r, h)`,14.5,800,VIOLET)
   +text(48,452,'• Kết luận: Thiết diện song song đáy thu nhỏ theo r(z) = r(1 − z/h); thể tích hình nón V = ⅓πr²h',12.5,700,INK));
 }

 if(id==='9-11-C01'){
  const R=Math.min(124,p.r*25),O=[560,265],ang=(-0.35+0.95*u)*Math.PI/2;
  const M=[O[0]+R*Math.sin(ang),O[1]-R*Math.cos(ang)];
  const latY=M[1],latRx=Math.max(4,Math.abs(R*Math.sin(ang)));
  return frame('Quay nửa đường tròn đường kính AB = 2R quanh trục AB tạo mặt cầu',id,
   `<circle cx="${O[0]}" cy="${O[1]}" r="${f(R)}" fill="${BLUE_FILL}55" stroke="${BLUE}" stroke-width="3.2"/>`
   +`<path d="M ${O[0]} ${f(O[1]-R)} A ${f(R)} ${f(R)} 0 0 1 ${O[0]} ${f(O[1]+R)}" fill="${ORANGE_FILL}66" stroke="${ORANGE}" stroke-width="4.2"/>`
   +`<ellipse cx="${O[0]}" cy="${O[1]}" rx="${f(R)}" ry="${f(R*0.28)}" fill="none" stroke="${GREEN}" stroke-width="2.4" stroke-dasharray="6 4"/>`
   +`<ellipse cx="${O[0]}" cy="${f(latY)}" rx="${f(latRx)}" ry="${f(latRx*0.26)}" fill="none" stroke="${VIOLET}" stroke-width="2.6"/>`
   +seg([O[0],O[1]-R-20],[O[0],O[1]+R+20],VIOLET,3,'6 4')
   +seg(O,M,ORANGE,3.4)+dot(O,BLUE,6.5)+dot([O[0],O[1]-R],VIOLET,6)+dot([O[0],O[1]+R],VIOLET,6)+dot(M,ORANGE,7)
   +label(O,'O (Tâm)',-72,6,BLUE)+label([O[0],O[1]-R],'A',10,-6,VIOLET)+label([O[0],O[1]+R],'B',10,18,VIOLET)+label(M,'M',10,-6,ORANGE)
   +pill(42,42,580,34,`Tâm O · Bán kính OM = R = ${f(p.r,2)} · Đường kính AB = 2R = ${f(2*p.r,2)} (Mặt cầu không có khai triển phẳng)`,BLUE_FILL,BLUE,INK,12.5)
   +text(48,145,`• Quỹ tích mặt cầu: Mọi điểm M trên mặt cầu đều cách tâm O khoảng R = ${f(p.r,2)}`,14,750,BLUE)
   +text(48,178,`• Đường tròn lớn đi qua tâm O có bán kính lớn nhất bằng R = ${f(p.r,2)}`,14,750,GREEN)
   +text(48,211,`• Tiến độ quét vĩ tuyến tạo mặt cầu: ${Math.round(u*100)}%`,14.5,800,VIOLET)
   +text(48,456,'• Kết luận: Quay nửa đường tròn tâm O bán kính R một vòng quanh đường kính AB cố định tạo thành mặt cầu',12.8,750,VIOLET));
 }

 if(id==='9-11-C02'){
  const rCur=p.r*(0.55+0.45*u),R=Math.min(110,rCur*22),O=[235,275];
  const cR=Math.min(42,rCur*9.5);
  let circles='';
  for(let i=0;i<4;i++){
   const cx=475+(i%2)*145,cy=215+Math.floor(i/2)*115;
   circles+=`<circle cx="${cx}" cy="${cy}" r="${f(cR)}" fill="${GREEN_FILL}" stroke="${GREEN}" stroke-width="2.6"/>`
    +text(cx,cy+5,`πR²`,13,800,GREEN).replace('<text ','<text text-anchor="middle" ');
  }
  return frame('Đối chiếu Diện tích mặt cầu S = 4πR² (4 hình tròn lớn) & Thể tích V = (4/3)πR³',id,
   `<circle cx="${O[0]}" cy="${O[1]}" r="${f(R)}" fill="${BLUE_FILL}66" stroke="${BLUE}" stroke-width="3.2"/>`
   +`<ellipse cx="${O[0]}" cy="${O[1]}" rx="${f(R)}" ry="${f(R*0.28)}" fill="${ORANGE_FILL}55" stroke="${ORANGE}" stroke-width="2.4"/>`
   +seg(O,[O[0]+R,O[1]],VIOLET,3.2)+dot(O,BLUE,6)+dot([O[0]+R,O[1]],VIOLET,6)
   +label(O,'O',-20,-8,BLUE)+text(O[0]+R/2-18,O[1]-10,`R(t)=${f(rCur,2)}`,13,800,VIOLET)
   +circles
   +text(548,145,`4 hình tròn lớn (4 × πR²) = Diện tích mặt cầu S = 4πR²`,14,800,GREEN).replace('<text ','<text text-anchor="middle" ')
   +pill(42,42,620,34,`Bán kính R = ${f(p.r,2)} (${Math.round(u*100)}%)  ·  S = 4πR² = ${f(m.area,2)}  ·  V = (4/3)πR³ = ${f(m.volume,2)} (Mặt cầu không có khai triển phẳng)`,BLUE_FILL,BLUE,INK,12.5)
   +text(48,456,'• Kết luận: Diện tích mặt cầu S = 4πR² đúng bằng 4 lần diện tích hình tròn lớn; thể tích khối cầu V = (4/3)πR³',12.8,750,VIOLET));
 }

 // R82/R91 9-11-C03: Mặt cầu & mặt phẳng cắt (d < R: đường tròn, d = R: tiếp điểm, d > R: không giao; không có khai triển phẳng)
 const R=Math.min(126,p.r*25),dy=p.d*25,r=Math.min(R,m.crossR*25),O=[295,280],H=[O[0],O[1]-dy],M=[O[0]+r*open,O[1]-dy];
 const C2=[695,275],rAnim=r*open;
 const isTangent=Math.abs(p.d-p.r)<=1e-5,isDisjoint=p.d>p.r+1e-5;
 const rMark=!isTangent&&!isDisjoint&&dy>8&&rAnim>8?rightMark(H,O,M,11,VIOLET):'';
 const rightView=isDisjoint
  ? `<g><circle cx="${C2[0]}" cy="${C2[1]}" r="56" fill="${SLATE_FILL}" stroke="${SLATE}" stroke-width="2" stroke-dasharray="6 4"/><text x="${C2[0]}" y="${C2[1]+5}" text-anchor="middle" font-size="13.5" font-weight="800" fill="${RED}">d &gt; R: Không giao</text></g>`
  : isTangent
  ? `<g><circle cx="${C2[0]}" cy="${C2[1]}" r="56" fill="${VIOLET_FILL}44" stroke="${VIOLET}" stroke-width="1.8" stroke-dasharray="5 4"/>${dot(C2,VIOLET,7.5)}${text(C2[0],C2[1]-22,'d = R: 1 Tiếp điểm H (r = 0)',13.5,800,VIOLET).replace('<text ','<text text-anchor="middle" ')}</g>`
  : `<g><circle cx="${C2[0]}" cy="${C2[1]}" r="${f(r)}" fill="none" stroke="#cbd5e1" stroke-width="1.6" stroke-dasharray="4 4"/><circle cx="${C2[0]}" cy="${C2[1]}" r="${f(rAnim)}" fill="${ORANGE_FILL}" stroke="${ORANGE}" stroke-width="3.2"/>${seg(C2,[C2[0]+rAnim,C2[1]],ORANGE,2.8)}${dot(C2,VIOLET,5.5)}${label(C2,'H',-18,-6,VIOLET)}${text(C2[0],C2[1]-r-14,`Thiết diện nhìn thẳng: r = √(R² − d²) = ${f(m.crossR,2)} (${Math.round(u*100)}%)`,13.5,800,ORANGE).replace('<text ','<text text-anchor="middle" ')}</g>`;
 return frame('Hình cầu và mặt cắt phẳng: đường tròn lớn & thiết diện',id,
  `<circle cx="${O[0]}" cy="${O[1]}" r="${f(R)}" fill="${BLUE_FILL}66" stroke="${BLUE}" stroke-width="3.2"/>`
  +`<ellipse cx="${O[0]}" cy="${O[1]}" rx="${f(R)}" ry="${f(R*0.28)}" fill="none" stroke="${SLATE}" stroke-width="1.6" stroke-dasharray="5 5"/>`
  +seg([O[0]-R-28,H[1]],[O[0]+R+28,H[1]],isDisjoint?RED:BLUE,2.6,'7 4')
  +(!isDisjoint&&!isTangent?`<ellipse cx="${H[0]}" cy="${f(H[1])}" rx="${f(rAnim)}" ry="${f(Math.max(4,rAnim*0.28))}" fill="${ORANGE_FILL}" fill-opacity="0.8" stroke="${ORANGE}" stroke-width="2.6"/>`:'')
  +seg(O,H,VIOLET,2.8,'4 3')+(!isDisjoint&&!isTangent?seg(H,M,ORANGE,3.2)+seg(O,M,BLUE,2.8)+rMark+dot(M,ORANGE,6)+label(M,'M',10,-4,ORANGE)+text((O[0]+M[0])/2+6,(O[1]+M[1])/2+14,`R=${f(p.r,1)}`,12.5,800,BLUE):'')
  +dot(O,BLUE,6)+dot(H,isDisjoint?RED:VIOLET,6.5)
  +label(O,'O',-22,12,BLUE)+label(H,'H',-22,-6,isDisjoint?RED:VIOLET)
  +rightView
  +pill(42,42,580,34,`S = 4πR² = ${f(m.area,2)}  ·  V = (4/3)πR³ = ${f(m.volume,2)}  ·  OH = d = ${f(p.d,2)} (Mặt cầu không có khai triển phẳng)`,BLUE_FILL,BLUE,INK,12.5)
  +text(48,456,isDisjoint?'• Kết luận: Khi d > R, mặt phẳng không cắt mặt cầu (0 điểm chung)':isTangent?'• Kết luận: Khi d = R, mặt phẳng tiếp xúc với mặt cầu tại đúng 1 tiếp điểm H':'• Kết luận: Mặt phẳng cách tâm O khoảng d < R cắt mặt cầu theo đường tròn bán kính r = √(R² − d²)',12.8,750,isDisjoint?RED:VIOLET));
}
