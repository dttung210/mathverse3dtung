import {clamp,deg,dist,polygonPoints,polygonMeasures,polygonArea,gcd,primeFactors,smallestFactor,midpoint,reflectAxisX,reflectCenter,isCollinear,classifyAngle,clockAngle,outcomeLabels,fractionRatio} from './math.mjs?v=r107_v15';
export const W=920,H=560;
const colors={teal:'#28c0bb',blue:'#74a9ff',amber:'#fbb84d',pink:'#fa809a',purple:'#a49bfa',green:'#4ade80',text:'#e9f4ff',muted:'#9cb5c5',glass:'#122a3b'};
const lightColors={teal:'#087e84',blue:'#1D4ED8',amber:'#B45309',pink:'#B91C1C',purple:'#6D28D9',green:'#15803D',text:'#173b52',muted:'#475569',glass:'#f1f8fb'};
let currentCanvasTheme='dark';
const map=([x,y])=>[W/2+x*46,H/2-y*46];
const ctxMove=(c,a)=>c.moveTo(a[0],a[1]);
const ctxLine=(c,a)=>c.lineTo(a[0],a[1]);
function fillText(c,text,x,y,size=17,color=colors.text,align='left',bold=false){
 if(typeof align==='boolean'){bold=align;align='left';}
 const str=String(text);
 let fitSize=size;
 if(str.length>4){
  const avail=align==='left'?Math.max(90,W-14-x):align==='right'?Math.max(90,x-14):Math.max(90,2*Math.min(x-14,W-14-x));
  c.font=`${bold?'700':'500'} ${size}px ui-sans-serif,system-ui,Segoe UI,Arial`;
  const mw=c.measureText?.(str)?.width||(str.length*size*.55);
  if(mw>avail)fitSize=Math.max(10.5,+(size*avail/mw).toFixed(1));
 }
 c.fillStyle=color;c.font=`${bold?'700':'500'} ${fitSize}px ui-sans-serif,system-ui,Segoe UI,Arial`;c.textAlign=align;c.textBaseline='middle';c.fillText(str,x,y);
}
function line(c,a,b,color=colors.teal,width=3,dash=[]){c.save();c.beginPath();ctxMove(c,a);ctxLine(c,b);c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dash);c.stroke();c.restore();}
function poly(c,pts,fill='rgba(50,174,183,.23)',stroke=colors.teal,width=3){if(!pts.length)return;c.beginPath();ctxMove(c,pts[0]);pts.slice(1).forEach(p=>ctxLine(c,p));c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
function arc(c,x,y,r,begin,end,color=colors.amber,width=3){c.beginPath();c.arc(x,y,r,begin,end);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function circle(c,x,y,r,fill=colors.blue,stroke='transparent',width=2){c.beginPath();c.arc(x,y,Math.max(.1,r),0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke!=='transparent'){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function dot(c,p,label='',color=colors.amber,ref=null){
 circle(c,p[0],p[1],7,color,'#fff',2);
 if(!label)return;
 if(ref){
  const dx=p[0]-ref[0],dy=p[1]-ref[1],len=Math.hypot(dx,dy)||1;
  fillText(c,label,p[0]+dx/len*20,p[1]+dy/len*20,14,colors.text,'center',true);
 }else fillText(c,label,p[0]+13,p[1]-14,14,colors.text,'left',true);
}
function rect(c,x,y,w,h,fill='rgba(60,170,179,.23)',stroke='#77cfd5',width=2){c.fillStyle=fill;c.fillRect(x,y,w,h);if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.strokeRect(x,y,w,h);}}
function dashLine(c,a,b,color=colors.muted){line(c,a,b,color,2,[6,6]);}
function arrow(c,a,b,color=colors.amber,width=3){line(c,a,b,color,width);const t=Math.atan2(b[1]-a[1],b[0]-a[0]);poly(c,[b,[b[0]-12*Math.cos(t-.55),b[1]-12*Math.sin(t-.55)],[b[0]-12*Math.cos(t+.55),b[1]-12*Math.sin(t+.55)]],color,color,1);}
function labelTop(c,text){fillText(c,text,34,28,15,colors.muted);}
function drawRightMark(c,H,P1,P2,sz=11,color=colors.amber){
 const ux=P1[0]-H[0],uy=P1[1]-H[1],ul=Math.hypot(ux,uy)||1;
 const vx=P2[0]-H[0],vy=P2[1]-H[1],vl=Math.hypot(vx,vy)||1;
 const p1=[H[0]+ux/ul*sz,H[1]+uy/ul*sz],p3=[H[0]+vx/vl*sz,H[1]+vy/vl*sz],p2=[p1[0]+vx/vl*sz,p1[1]+vy/vl*sz];
 c.save();c.beginPath();ctxMove(c,p1);ctxLine(c,p2);ctxLine(c,p3);c.strokeStyle=color;c.lineWidth=2.2;c.stroke();c.restore();
}
function drawTickMarks(c,P1,P2,count=1,color=colors.amber){
 const mx=(P1[0]+P2[0])/2,my=(P1[1]+P2[1])/2,dx=P2[0]-P1[0],dy=P2[1]-P1[1],len=Math.hypot(dx,dy)||1;
 const tx=dx/len,ty=dy/len,nx=-ty,ny=tx;
 for(let i=0;i<count;i++){
  const off=(i-(count-1)/2)*5.5,cx=mx+tx*off,cy=my+ty*off;
  line(c,[cx-nx*6,cy-ny*6],[cx+nx*6,cy+ny*6],color,2.2);
 }
}
function drawAngleArc(c,V,P1,P2,r=24,color=colors.amber,label='',arcs=1){
 const a1=Math.atan2(P1[1]-V[1],P1[0]-V[0]),a2=Math.atan2(P2[1]-V[1],P2[0]-V[0]);
 let d=a2-a1;while(d<=-Math.PI)d+=Math.PI*2;while(d>Math.PI)d-=Math.PI*2;
 const sA=d>=0?a1:a2,eA=d>=0?a2:a1,span=Math.abs(d);
 for(let k=0;k<arcs;k++){
  const rk=r-k*4.5;
  c.save();c.beginPath();c.arc(V[0],V[1],rk,sA,sA+span);c.strokeStyle=color;c.lineWidth=2.2;c.stroke();c.restore();
 }
 if(label){
  const mid=sA+span/2,lr=r+15;
  fillText(c,label,V[0]+lr*Math.cos(mid),V[1]+lr*Math.sin(mid),12,color,'center',true);
 }
}
function drawGrid(c){const light=currentCanvasTheme==='light';rect(c,0,0,W,H,light?'#f1f8fb':'#102634',null);c.save();c.strokeStyle=light?'rgba(29,88,116,.12)':'rgba(122,192,213,.075)';c.lineWidth=1;for(let x=0;x<=W;x+=40){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();}for(let y=0;y<=H;y+=40){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}c.restore();line(c,[0,H/2],[W,H/2],light?'rgba(26,92,122,.25)':'rgba(115,174,201,.20)',1);line(c,[W/2,0],[W/2,H],light?'rgba(26,92,122,.25)':'rgba(115,174,201,.20)',1);}
function caption(c,text){fillText(c,text,34,H-22,14,colors.muted);}

function drawPolylineProgress(c,pts,progress,color=colors.blue,width=3.5){
 const list=Array.isArray(pts)?pts:[];
 if(list.length<2)return;
 const total=list.length,scaled=clamp(progress,0,1)*total,whole=Math.floor(scaled),frac=scaled-whole;
 c.save();c.beginPath();ctxMove(c,list[0]);
 for(let i=0;i<whole;i++)ctxLine(c,list[(i+1)%total]);
 if(whole<total&&frac>0){
  const from=list[whole%total],to=list[(whole+1)%total];
  ctxLine(c,[from[0]+(to[0]-from[0])*frac,from[1]+(to[1]-from[1])*frac]);
 }
 c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();c.restore();
}

function drawPolygon(c,model,p,state={}){
 const v=model.variant,pts=polygonPoints(v,p).map(map),center=[W/2,H/2];
 const u=clamp(p.progress??(state.time?state.time/8000:1),0,1);
 const light=currentCanvasTheme==='light';
 let obs='',concl='';
 if(v==='rectangle'){
  const A=pts[0],B=pts[1],C=pts[2],D=pts[3];
  const O=[(A[0]+C[0])/2,(A[1]+C[1])/2];
  const aVal=clamp(p.a,1,9),bVal=clamp(p.b??3,1,9),diag=Math.hypot(aVal,bVal);
  // Stage 1 (0%): Origin point A and reference axes on grid
  const ux=B[0]-A[0],uy=B[1]-A[1],ul=Math.hypot(ux,uy)||1;
  const vx=D[0]-A[0],vy=D[1]-A[1],vl=Math.hypot(vx,vy)||1;
  dashLine(c,[A[0]-ux/ul*28,A[1]-uy/ul*28],[A[0]+ux*1.12,A[1]+uy*1.12],colors.muted);
  dashLine(c,[A[0]-vx/vl*28,A[1]-vy/vl*28],[A[0]+vx*1.12,A[1]+vy*1.12],colors.muted);
  if(u<0.08){
   dot(c,A,'A',colors.blue,center);
   obs='Bước 1 (0% — Khởi tạo): Xác định điểm gốc A và hai trục tham chiếu vuông góc trên hệ lưới.';
  }else if(u<0.35){
   // Stage 2 (25%): Construct segment AB = a and perpendicular ray at A
   const kAB=clamp((u-0.08)/0.12,0,1);
   const Bcur=[A[0]+ux*kAB,A[1]+uy*kAB];
   line(c,A,Bcur,colors.blue,3.6);
   if(u>=0.16){
    const kRay=clamp((u-0.16)/0.08,0.35,1);
    arrow(c,A,[A[0]+vx*kRay*1.08,A[1]+vy*kRay*1.08],colors.amber,2.6);
    drawRightMark(c,A,B,D,12,colors.purple);
   }
   drawTickMarks(c,A,Bcur,1,colors.blue);
   fillText(c,`a = ${aVal.toFixed(1)}`,(A[0]+Bcur[0])/2,(A[1]+Bcur[1])/2+18,13.5,colors.blue,'center',true);
   dot(c,A,'A',colors.blue,center);
   if(kAB>=0.95)dot(c,B,'B',colors.amber,center);
   obs='Bước 2 (25% — Dựng cạnh & tia vuông góc): Dựng đoạn AB = a và tia vuông góc tại đỉnh A (góc 90°).';
  }else if(u<0.62){
   // Stage 3 (50%): Construct AD = b, then C and remaining sides BC, CD to complete ABCD
   const kClose=clamp((u-0.35)/0.12,0,1);
   if(kClose>=0.98){
    poly(c,pts,light?'rgba(219,234,254,.45)':'rgba(50,189,189,.18)',colors.blue,3.5);
   }else{
    line(c,A,B,colors.blue,3.5);
    line(c,A,D,colors.amber,3.5);
    const CfromD=[D[0]+ux*kClose,D[1]+uy*kClose];
    const CfromB=[B[0]+vx*kClose,B[1]+vy*kClose];
    line(c,D,CfromD,colors.blue,3.2);
    line(c,B,CfromB,colors.amber,3.2);
   }
   drawTickMarks(c,A,B,1,colors.blue);drawTickMarks(c,C,D,1,colors.blue);
   drawTickMarks(c,B,C,2,colors.amber);drawTickMarks(c,D,A,2,colors.amber);
   for(let i=0;i<4;i++)drawRightMark(c,pts[i],pts[(i+1)%4],pts[(i+3)%4],11,colors.purple);
   fillText(c,`a = ${aVal.toFixed(1)}`,(A[0]+B[0])/2,(A[1]+B[1])/2+18,13.5,colors.blue,'center',true);
   fillText(c,`b = ${bVal.toFixed(1)}`,(A[0]+D[0])/2-24,(A[1]+D[1])/2,13.5,colors.amber,'center',true);
   pts.forEach((vPt,i)=>dot(c,vPt,String.fromCharCode(65+i),i===0?colors.blue:colors.amber,center));
   obs='Bước 3 (50% — Hoàn thiện ABCD): Dựng AD = b, đỉnh C và các cạnh đối AB = CD = a, AD = BC = b, 4 góc vuông 90°.';
  }else if(u<0.88){
   // Stage 4 (75%): Construct diagonals AC, BD and intersection O
   poly(c,pts,light?'rgba(219,234,254,.48)':'rgba(50,189,189,.20)',colors.blue,3.5);
   drawTickMarks(c,A,B,1,colors.blue);drawTickMarks(c,C,D,1,colors.blue);
   drawTickMarks(c,B,C,2,colors.amber);drawTickMarks(c,D,A,2,colors.amber);
   for(let i=0;i<4;i++)drawRightMark(c,pts[i],pts[(i+1)%4],pts[(i+3)%4],11,colors.purple);
   const kDiag=clamp((u-0.62)/0.16,0.2,1);
   dashLine(c,A,[A[0]+(C[0]-A[0])*kDiag,A[1]+(C[1]-A[1])*kDiag],colors.blue);
   dashLine(c,B,[B[0]+(D[0]-B[0])*kDiag,B[1]+(D[1]-B[1])*kDiag],colors.amber);
   if(kDiag>=0.5)dot(c,O,'O',colors.purple);
   pts.forEach((vPt,i)=>dot(c,vPt,String.fromCharCode(65+i),i===0?colors.blue:colors.amber,center));
   obs=`Bước 4 (75% — Hai đường chéo): Dựng hai đường chéo AC và BD cắt nhau tại giao điểm O (AC = BD ≈ ${diag.toFixed(2)}).`;
  }else{
   // Stage 5 (100%): Prove AC = BD bisecting at O (OA=OB=OC=OD) + unit-square area grid S = a * b
   poly(c,pts,light?'rgba(219,234,254,.55)':'rgba(50,189,189,.24)',colors.blue,3.5);
   const cols=Math.max(1,Math.round(aVal)),rows=Math.max(1,Math.round(bVal));
   for(let ic=1;ic<cols;ic++){
    const f=ic/cols;
    line(c,[A[0]+ux*f,A[1]+uy*f],[D[0]+ux*f,D[1]+uy*f],light?'rgba(21,128,61,.28)':'rgba(74,222,128,.25)',1.2,[4,4]);
   }
   for(let ir=1;ir<rows;ir++){
    const f=ir/rows;
    line(c,[A[0]+vx*f,A[1]+vy*f],[B[0]+vx*f,B[1]+vy*f],light?'rgba(21,128,61,.28)':'rgba(74,222,128,.25)',1.2,[4,4]);
   }
   poly(c,[O,A,B],light?'rgba(254,243,199,.45)':'rgba(251,184,77,.16)',colors.amber,1);
   poly(c,[O,C,D],light?'rgba(254,243,199,.45)':'rgba(251,184,77,.16)',colors.amber,1);
   drawTickMarks(c,A,B,1,colors.blue);drawTickMarks(c,C,D,1,colors.blue);
   drawTickMarks(c,B,C,2,colors.amber);drawTickMarks(c,D,A,2,colors.amber);
   for(let i=0;i<4;i++)drawRightMark(c,pts[i],pts[(i+1)%4],pts[(i+3)%4],11,colors.purple);
   dashLine(c,A,C,colors.blue);dashLine(c,B,D,colors.amber);
   dot(c,O,'O',colors.purple);
   drawTickMarks(c,A,O,1,colors.purple);drawTickMarks(c,O,C,1,colors.purple);
   drawTickMarks(c,B,O,1,colors.purple);drawTickMarks(c,O,D,1,colors.purple);
   pts.forEach((vPt,i)=>dot(c,vPt,String.fromCharCode(65+i),i===0?colors.blue:colors.amber,center));
   obs='Quan sát: Cạnh đối song song và bằng nhau, 4 góc vuông 90°, 2 đường chéo bằng nhau AC = BD';
   concl='Kết luận: Hình chữ nhật có 2 đường chéo bằng nhau, cắt nhau tại trung điểm O (OA = OB = OC = OD) và diện tích S = a · b.';
  }
  let m=polygonMeasures(model.variant,p);
  rect(c,688,82,210,82,light?'rgba(255,255,255,.88)':'rgba(18,42,59,.82)',colors.blue,1.5);
  fillText(c,`P = ${m.perimeter.toFixed(2)}`,704,108,19,colors.blue,'left',true);
  fillText(c,`S = ${m.area.toFixed(2)}`,704,142,19,colors.amber,'left',true);
  if(obs)fillText(c,obs,460,58,13.5,u>=0.88?colors.blue:colors.purple,'center',true);
  if(concl)fillText(c,concl,460,502,13,colors.text,'center',true);
  caption(c,'Bấm ▶ Phát hoặc kéo thanh tiến trình 0% → 25% → 50% → 75% → 100% để quan sát dựng hình chữ nhật ABCD.');
  return;
 }
 const showBody=u>=0.56;
 const fillAlpha=showBody?clamp((u-.56)/.18,0,1):0;
 if(showBody)poly(c,pts,light?`rgba(219,234,254,${(0.3+0.25*fillAlpha).toFixed(3)})`:`rgba(50,189,189,${(0.12+0.12*fillAlpha).toFixed(3)})`,colors.blue,3.5);
 else drawPolylineProgress(c,pts,clamp(u/.56,0,1),colors.blue,3.5);
 if(!showBody){
  obs='Quan sát: hình đang được dựng từng cạnh nên chưa xuất hiện đủ các đường phụ.';
 }else if(v==='triangle'){
  for(let i=0;i<3;i++){
   drawTickMarks(c,pts[i],pts[(i+1)%3],1,colors.blue);
   drawAngleArc(c,pts[i],pts[(i+1)%3],pts[(i+2)%3],24,colors.amber,'60°',1);
  }
  const O=[(pts[0][0]+pts[1][0]+pts[2][0])/3,(pts[0][1]+pts[1][1]+pts[2][1])/3];
  if(u>0.35){
   for(let i=0;i<3;i++){
    const M=[(pts[(i+1)%3][0]+pts[(i+2)%3][0])/2,(pts[(i+1)%3][1]+pts[(i+2)%3][1])/2];
    dashLine(c,pts[i],M,colors.purple);
    drawRightMark(c,M,pts[i],pts[(i+1)%3],9,colors.purple);
   }
   dot(c,O,'O',colors.purple);
  }
  if(u>0.7){
   poly(c,[O,pts[0],pts[1]],light?'rgba(237,233,254,.65)':'rgba(164,155,250,.22)',colors.purple,1.5);
   poly(c,[O,pts[1],pts[2]],light?'rgba(219,234,254,.65)':'rgba(116,169,255,.20)',colors.blue,1.5);
   poly(c,[O,pts[2],pts[0]],light?'rgba(254,243,199,.65)':'rgba(251,184,77,.20)',colors.amber,1.5);
  }
  obs='Quan sát: AB = BC = CA · ∠A = ∠B = ∠C = 60° · 3 đường cao đồng quy tại O';
  concl='Kết luận: Tam giác đều có 3 cạnh bằng nhau, 3 góc 60°, 3 trục đối xứng chia tam giác thành các phần bằng nhau.';
 }else if(v==='square'){
  for(let i=0;i<4;i++){
   drawTickMarks(c,pts[i],pts[(i+1)%4],1,colors.blue);
   drawRightMark(c,pts[i],pts[(i+1)%4],pts[(i+3)%4],11,colors.purple);
  }
  const O=[(pts[0][0]+pts[2][0])/2,(pts[0][1]+pts[2][1])/2];
  dashLine(c,pts[0],pts[2],colors.amber);dashLine(c,pts[1],pts[3],colors.green);
  drawRightMark(c,O,pts[0],pts[1],11,colors.purple);
  dot(c,O,'O',colors.purple);
  if(u>0.5){
   poly(c,[O,pts[0],pts[1]],light?'rgba(219,234,254,.6)':'rgba(40,192,187,.22)',colors.blue,1);
   poly(c,[O,pts[1],pts[2]],light?'rgba(254,243,199,.6)':'rgba(251,184,77,.22)',colors.amber,1);
   poly(c,[O,pts[2],pts[3]],light?'rgba(219,234,254,.6)':'rgba(116,169,255,.22)',colors.blue,1);
   poly(c,[O,pts[3],pts[0]],light?'rgba(254,243,199,.6)':'rgba(251,184,77,.22)',colors.amber,1);
  }
  obs='Quan sát: 4 cạnh bằng nhau, 4 góc vuông 90°, 2 đường chéo AC ⊥ BD tại O';
  concl='Kết luận: Hình vuông có 2 đường chéo bằng nhau, vuông góc tại trung điểm O và chia hình thành 4 tam giác vuông cân bằng nhau.';
 }else if(v==='rhombus'){
  for(let i=0;i<4;i++)drawTickMarks(c,pts[i],pts[(i+1)%4],1,colors.blue);
  const O=[(pts[0][0]+pts[2][0])/2,(pts[0][1]+pts[2][1])/2];
  dashLine(c,pts[0],pts[2],colors.blue);dashLine(c,pts[1],pts[3],colors.amber);
  drawRightMark(c,O,pts[0],pts[1],11,colors.purple);
  dot(c,O,'O',colors.purple);
  drawTickMarks(c,pts[0],O,1,colors.blue);drawTickMarks(c,O,pts[2],1,colors.blue);
  drawTickMarks(c,pts[1],O,2,colors.amber);drawTickMarks(c,O,pts[3],2,colors.amber);
  if(u>0.5){
   for(let i=0;i<4;i++){
    poly(c,[O,pts[i],pts[(i+1)%4]],i%2?(light?'rgba(254,243,199,.6)':'rgba(251,184,77,.22)'):(light?'rgba(219,234,254,.6)':'rgba(116,169,255,.22)'),colors.blue,1);
   }
  }
  obs='Quan sát: 4 cạnh bằng nhau · Hai đường chéo AC ⊥ BD tại trung điểm O (OA = OC, OB = OD)';
  concl='Kết luận: Hình thoi có 2 đường chéo vuông góc tại trung điểm và chia hình thành 4 tam giác vuông bằng nhau (S = ½·d₁·d₂).';
 }else if(v==='parallelogram'){
  drawTickMarks(c,pts[0],pts[1],1,colors.blue);drawTickMarks(c,pts[2],pts[3],1,colors.blue);
  drawTickMarks(c,pts[1],pts[2],2,colors.amber);drawTickMarks(c,pts[3],pts[0],2,colors.amber);
  const O=[(pts[0][0]+pts[2][0])/2,(pts[0][1]+pts[2][1])/2];
  dashLine(c,pts[0],pts[2],colors.blue);dashLine(c,pts[1],pts[3],colors.amber);
  dot(c,O,'O',colors.purple);
  const Hpt=[pts[3][0],pts[0][1]];
  if(u>0.3){
   dashLine(c,pts[3],Hpt,colors.purple);
   drawRightMark(c,Hpt,pts[3],pts[1],10,colors.purple);
   fillText(c,'h',Hpt[0]-14,(pts[3][1]+Hpt[1])/2,14,colors.purple,'center',true);
  }
  if(u>0.6){
   const slide=(u-0.6)/0.4,dx=(pts[1][0]-pts[0][0])*slide;
   const sH=[Hpt[0]+dx,Hpt[1]],sA=[pts[0][0]+dx,pts[0][1]],sD=[pts[3][0]+dx,pts[3][1]];
   poly(c,[sA,sH,sD],light?'rgba(254,243,199,.85)':'rgba(251,184,77,.42)',colors.amber,2.5);
   if(u>=0.98){
    rect(c,Math.min(Hpt[0],pts[2][0]),Math.min(pts[3][1],Hpt[1]),Math.abs(pts[1][0]-pts[0][0]),Math.abs(Hpt[1]-pts[3][1]),'transparent',colors.purple,2.8);
   }
  }
  obs='Quan sát: Cạnh đối song song và bằng nhau · Hai đường chéo cắt nhau tại trung điểm O';
  concl='Kết luận: Cắt tam giác vuông chiều cao h bên trái ghép sang phải tạo thành hình chữ nhật có diện tích S = a × h.';
 }else if(v==='trapezoid'){
  drawTickMarks(c,pts[1],pts[2],1,colors.blue);drawTickMarks(c,pts[3],pts[0],1,colors.blue);
  drawAngleArc(c,pts[0],pts[1],pts[3],22,colors.amber,'',1);drawAngleArc(c,pts[1],pts[2],pts[0],22,colors.amber,'',1);
  const H1=[pts[3][0],pts[0][1]],H2=[pts[2][0],pts[1][1]];
  if(u>0.3){
   dashLine(c,pts[3],H1,colors.purple);dashLine(c,pts[2],H2,colors.purple);
   drawRightMark(c,H1,pts[3],pts[0],10,colors.purple);drawRightMark(c,H2,pts[2],pts[1],10,colors.purple);
   fillText(c,'h',H1[0]-12,(pts[3][1]+H1[1])/2,14,colors.purple,'center',true);
  }
  if(u>0.65){
   const M_top=[(pts[3][0]+pts[2][0])/2,pts[3][1]],M_bot=[(pts[0][0]+pts[1][0])/2,pts[0][1]];
   dashLine(c,[M_top[0],M_top[1]-26],[M_bot[0],M_bot[1]+26],colors.purple);
   poly(c,[H1,H2,pts[2],pts[3]],light?'rgba(219,234,254,.6)':'rgba(116,169,255,.20)',colors.blue,1.5);
   poly(c,[pts[0],H1,pts[3]],light?'rgba(254,243,199,.65)':'rgba(251,184,77,.20)',colors.amber,1.5);
   poly(c,[pts[1],H2,pts[2]],light?'rgba(254,243,199,.65)':'rgba(251,184,77,.20)',colors.amber,1.5);
  }
  obs='Quan sát: Hai đáy song song, 2 cạnh bên bằng nhau, 2 góc kề một đáy bằng nhau';
  concl='Kết luận: Hình thang cân có 2 đường cao chia thành hình chữ nhật giữa + 2 tam giác vuông đối xứng qua trục.';
 }else if(v==='hexagon'){
  pts.forEach((vPt,i)=>{
   line(c,center,vPt,colors.purple,1.8);
   drawTickMarks(c,pts[i],pts[(i+1)%6],1,colors.blue);
  });
  dot(c,center,'O',colors.purple);
  drawAngleArc(c,pts[0],pts[1],pts[5],22,colors.amber,'120°',1);
  drawAngleArc(c,center,pts[0],pts[1],28,colors.purple,'60°',1);
  if(u>0.5){
   for(let i=0;i<6;i++){
    poly(c,[center,pts[i],pts[(i+1)%6]],i%2?(light?'rgba(254,243,199,.65)':'rgba(251,184,77,.24)'):(light?'rgba(219,234,254,.65)':'rgba(116,169,255,.24)'),i%2?colors.amber:colors.blue,1.4);
   }
  }
  obs='Quan sát: 6 cạnh bằng nhau, 6 góc trong 120°, 6 góc tại tâm 60° (6 × 60° = 360°)';
  concl='Kết luận: Lục giác đều gồm 6 tam giác đều bằng nhau ghép quanh tâm O, có 3 đường chéo chính bằng nhau.';
 }
 pts.forEach((vPt,i)=>{
  const reveal=showBody||i<=Math.floor(clamp(u/.56,0,.999)*pts.length);
  if(reveal)dot(c,vPt,String.fromCharCode(65+i),colors.amber,center);
 });
 let m=polygonMeasures(model.variant,p);
 rect(c,688,82,210,82,light?'rgba(255,255,255,.88)':'rgba(18,42,59,.82)',colors.blue,1.5);
 fillText(c,`P = ${m.perimeter.toFixed(2)}`,704,108,19,colors.blue,'left',true);
 fillText(c,`S = ${m.area.toFixed(2)}`,704,142,19,colors.amber,'left',true);
 const intro=showBody?'':'Đang dựng tuần tự từng cạnh của hình…';
 if(intro)fillText(c,intro,460,36,13.5,colors.purple,'center',true);
 if(obs)fillText(c,obs,460,58,13.5,showBody?colors.blue:colors.purple,'center',true);
 if(showBody&&concl)fillText(c,concl,460,502,13,colors.text,'center',true);
 caption(c,'Bấm ▶ Phát để xem hình xuất hiện theo từng bước: cạnh → góc/đường phụ → kết luận hình học.');
}

function drawComposition(c,model,p){
 let t=clamp(p.progress??0,0,1),v=model.variant;let center=[W/2,H/2];
 const light=currentCanvasTheme==='light';
 if(v==='hexagon6'){
  const n=6,r=125,vertices=Array.from({length:n},(_,i)=>[center[0]+r*Math.cos(i*Math.PI/3),center[1]+r*Math.sin(i*Math.PI/3)]);
  for(let i=0;i<n;i++){
   let a=i*Math.PI/3+Math.PI/6,dx=Math.cos(a)*(1-t)*60,dy=Math.sin(a)*(1-t)*60;
   const fill=i%2?(light?'#FEF3C7':'rgba(251,184,77,.28)'):(light?'#DBEAFE':'rgba(116,169,255,.28)');
   poly(c,[[center[0]+dx,center[1]+dy],[vertices[i][0]+dx,vertices[i][1]+dy],[vertices[(i+1)%n][0]+dx,vertices[(i+1)%n][1]+dy]],fill,i%2?colors.amber:colors.blue,2);
  }
  dot(c,center,'O',colors.purple);
  fillText(c,'Quan sát: 6 tam giác đều tiến vào từ ngoài ghép kín thành lục giác đều tại tâm O',460,60,14.5,colors.blue,'center',true);
  caption(c,'Kết luận: 6 tam giác đều bằng nhau ghép thành một lục giác đều (S_lục giác = 6 × S_tam giác).');
  return;
 }
 if(v==='squaretriangles'||v==='rhombus'){
  const r=v==='rhombus'?155:135;let vv=v==='rhombus'?[[0,-r],[r*1.25,0],[0,r],[-r*1.25,0]]:[[-r,-r],[r,-r],[r,r],[-r,r]];
  for(let i=0;i<4;i++){
   const u=vv[i],w=vv[(i+1)%4],cx=(u[0]+w[0])/3,cy=(u[1]+w[1])/3;let shift=(1-t)*50;
   const fill=i%2?(light?'#FEF3C7':'rgba(251,184,77,.32)'):(light?'#DBEAFE':'rgba(116,169,255,.32)');
   poly(c,[[center[0]+shift*cx/r,center[1]+shift*cy/r],[center[0]+u[0]+shift*cx/r,center[1]+u[1]+shift*cy/r],[center[0]+w[0]+shift*cx/r,center[1]+w[1]+shift*cy/r]],fill,i%2?colors.amber:colors.blue,2);
  }
  dashLine(c,[center[0]+vv[0][0],center[1]+vv[0][1]],[center[0]+vv[2][0],center[1]+vv[2][1]],colors.purple);
  dashLine(c,[center[0]+vv[1][0],center[1]+vv[1][1]],[center[0]+vv[3][0],center[1]+vv[3][1]],colors.purple);
  drawRightMark(c,center,[center[0]+vv[0][0],center[1]+vv[0][1]],[center[0]+vv[1][0],center[1]+vv[1][1]],11,colors.purple);
  dot(c,center,'O',colors.purple);
  fillText(c,v==='rhombus'?'Quan sát: 2 đường chéo ⊥ chia hình thoi thành 4 tam giác vuông bằng nhau':'Quan sát: 2 đường chéo chia hình vuông thành 4 tam giác vuông cân bằng nhau',460,60,14.5,colors.blue,'center',true);
  caption(c,v==='rhombus'?'Kết luận: Tổng diện tích 4 tam giác vuông bằng diện tích hình thoi S = ½·d₁·d₂.':'Kết luận: Tách/ghép bảo toàn tổng diện tích của 4 tam giác bằng nhau.');
  return;
 }
 if(v==='parallelogram'){
  let x=260,y=210,w=290,h=150,sk=85;
  poly(c,[[x+sk,y],[x+w+sk,y],[x+w,y+h],[x+sk,y+h]],light?'rgba(219,234,254,.65)':'rgba(69,175,180,.24)',colors.blue,3);
  const tri=[[x,y+h],[x+sk,y],[x+sk,y+h]];let delta=t*w;
  poly(c,tri.map(pt=>[pt[0]+delta,pt[1]]),light?'rgba(254,243,199,.85)':'rgba(247,180,67,.45)',colors.amber,3);
  dashLine(c,[x+sk,y],[x+sk,y+h],colors.purple);drawRightMark(c,[x+sk,y+h],[x+sk,y],[x+w,y+h],11,colors.purple);
  fillText(c,'h',x+sk+8,y+h/2,16,colors.purple,'left',true);fillText(c,'a',x+w/2,y+h+22,16,colors.blue,'center',true);
  arrow(c,[x+40,y+h+52],[x+w-10,y+h+52],colors.amber);
  fillText(c,'S = a × h',745,255,24,colors.purple,'center',true);
  fillText(c,'Tương quan: Cắt tam giác vuông bên trái trượt sang phải ghép thành hình chữ nhật a × h',460,60,14.5,colors.blue,'center',true);
  caption(c,'Kết luận: Diện tích hình bình hành bằng cạnh đáy a nhân chiều cao h (S = a × h).');
  return;
 }
 let dx=(1-t)*95;
 rect(c,310-dx,190,140,160,light?'rgba(219,234,254,.75)':'rgba(66,183,191,.35)',colors.blue,3);
 rect(c,450+dx,230,180,120,light?'rgba(254,243,199,.75)':'rgba(249,176,79,.28)',colors.amber,3);
 if(t>0.92)dashLine(c,[450,190],[450,350],colors.purple);
 fillText(c,'S₁',380-dx,270,22,colors.blue,'center',true);fillText(c,'S₂',540+dx,290,22,colors.amber,'center',true);
 fillText(c,'S = S₁ + S₂',460,120,24,colors.purple,'center',true);
 caption(c,'Kết luận: Diện tích hình phẳng phức hợp bằng tổng diện tích các hình chữ nhật thành phần (S = S₁ + S₂).');
}

function drawTiling(c,model,p,state){
 const floor=model.variant==='floor',count=Math.round(clamp(p.count??6,2,11)),size=Math.round(360/count);
 const light=currentCanvasTheme==='light';
 const r=24,dy=Math.sqrt(3)*r,x0=220,y0=130,visible=state.time>0?Math.max(1,Math.ceil(count*6*clamp(state.time/8000,0,1))):count*6;
 const activeIdx=Math.max(0,visible-1);
 const neutralFill=light?'#F1F5F9':'rgba(51,85,106,.38)';
 const neutralStroke=light?'#64748B':'#3b6982';
 const focusFill=light?'#FEF3C7':'rgba(251,184,77,.62)';
 for(let row=0;row<6;row++)for(let col=0;col<count;col++){
  const idx=row*count+col;
  if(idx>=visible)continue;
  const isFlipped=state.tileFlips?.has(`${row}:${col}`);
  const isSample=floor?(row===0&&col===0):(idx===activeIdx);
  const isCountLine=floor&&(row===0||col===0)&&!isSample;
  const fillCol=(isFlipped||isSample)?focusFill:isCountLine?(light?'#DBEAFE':'rgba(116,169,255,.32)'):neutralFill;
  const strokeCol=(isFlipped||isSample)?colors.amber:isCountLine?colors.blue:neutralStroke;
  const lw=(isFlipped||isSample)?2.4:isCountLine?1.8:1.1;
  if(!floor&&p.type===0){
   const x=x0+col*1.5*r,y=y0+row*dy+(col%2)*dy/2;
   const pts=Array.from({length:6},(_,k)=>[x+r*Math.cos(k*Math.PI/3),y+r*Math.sin(k*Math.PI/3)]);
   poly(c,pts,fillCol,strokeCol,lw);
  }else{
   const x=x0+col*size,y=y0+row*size;
   rect(c,x,y,size-2,size-2,fillCol,strokeCol,lw);
  }
 }
 fillText(c,!floor&&p.type===0?'Tại mỗi đỉnh chung: 3 × 120° = 360° (lục giác đều khít kín)':floor?`Quy luật lát nền: 6 hàng × ${count} cột = ${6*count} viên gạch`:'Tại mỗi đỉnh chung: 4 × 90° = 360° (ô vuông khít kín)',460,64,15,colors.amber,'center',true);
 caption(c,state.time>0?'Quan sát: Lát từng viên phủ kín mặt phẳng; chỉ nhấn viên đang thao tác và hàng/cột quy luật.':'Nhấp vào viên gạch để chọn · Kết luận: Đa giác đều lát kín mặt phẳng khi góc trong là ước của 360°.');
}

function drawSymmetry(c,model,p,state){
 let a=clamp(p.position||0,-3,3),axis=W/2+a*45,v=model.variant;let fold=clamp(p.fold||0,0,180);
 const light=currentCanvasTheme==='light';
 if(['axis','butterfly','star'].includes(v)){
  if(v==='star'){
   const cardBg=light?'rgba(255,255,255,.92)':'rgba(18,42,59,.85)',cardBorder=light?'#b6dce8':'#2c5d75';
   const u=clamp(fold/180,0,1);
   fillText(c,'QUY TRÌNH 4 BƯỚC GẤP & CẮT NGÔI SAO 5 CÁNH',185,54,13.5,colors.blue,'center',true);
   const steps=[
    ['Bước 1: Gấp đôi tờ giấy','Gấp tờ giấy qua trục đối xứng d đi qua tâm O.'],
    ['Bước 2: Gấp chụm 5 múi (36°/múi)','Gấp xếp thành 10 lớp giấy chụm quanh tâm O (360° : 10 = 36°).'],
    ['Bước 3: Cắt 1 đường thẳng chéo ✂','Dùng kéo cắt 1 nhát thẳng chéo từ mép trong r ra đỉnh ngoài R.'],
    ['Bước 4: Mở phẳng tờ giấy (0° ← 180°)','1 nhát cắt nhân bản qua 5 trục đối xứng tạo ngôi sao 5 cánh đều!']
   ];
   steps.forEach(([title,desc],idx)=>{
    const sy=72+idx*98,isCur=(idx===1&&u>=0.35&&u<0.75)||(idx===2&&u>=0.75)||(idx===3&&u<0.35);
    rect(c,24,sy,320,88,isCur?(light?'#FEF3C7':'#184754'):cardBg,isCur?colors.amber:cardBorder,isCur?2.2:1.2);
    fillText(c,title,36,sy+24,13.5,isCur?colors.amber:colors.blue,'left',true);
    fillText(c,desc,36,sy+54,12,colors.text,'left',false);
   });
   const cx=635,cy=278,outer=148,inner=60;
   for(let k=0;k<5;k++){
    const ang=-Math.PI/2+k*Math.PI/5;
    dashLine(c,[cx-168*Math.cos(ang),cy-168*Math.sin(ang)],[cx+168*Math.cos(ang),cy+168*Math.sin(ang)],colors.purple);
   }
   fillText(c,'Trục d₁ (5 trục đối xứng qua O)',cx+10,cy-176,13.5,colors.purple,'left',true);
   const baseTip=-Math.PI/2,baseValley=-Math.PI/2+Math.PI/5;
   for(let k=9;k>=0;k--){
    const pairIdx=Math.floor(k/2),isRightHalf=k%2===0;
    const tipUnfolded=-Math.PI/2+pairIdx*(2*Math.PI/5);
    const valUnfolded=isRightHalf?tipUnfolded+Math.PI/5:tipUnfolded-Math.PI/5;
    const tipAng=tipUnfolded*(1-u)+baseTip*u;
    const valAng=valUnfolded*(1-u)+baseValley*u;
    const pTip=[cx+outer*Math.cos(tipAng),cy+outer*Math.sin(tipAng)];
    const pVal=[cx+inner*Math.cos(valAng),cy+inner*Math.sin(valAng)];
    const fillCol=k===0?(light?'rgba(254,243,199,.85)':'rgba(251,184,77,.55)'):k%2===0?(light?'rgba(219,234,254,.65)':'rgba(40,192,187,.34)'):(light?'rgba(219,234,254,.45)':'rgba(116,169,255,.30)');
    poly(c,[[cx,cy],pTip,pVal],fillCol,k===0?colors.amber:colors.blue,k===0?3:1.8);
   }
   const A0=[cx+outer*Math.cos(baseTip),cy+outer*Math.sin(baseTip)];
   const B0=[cx+inner*Math.cos(baseValley),cy+inner*Math.sin(baseValley)];
   const W0=[cx+outer*Math.cos(baseValley),cy+outer*Math.sin(baseValley)];
   if(u>0.15){
    poly(c,[A0,W0,B0],light?'rgba(254,243,199,.45)':'rgba(250,128,154,.18)',colors.amber,1.5);
    fillText(c,'Phần giấy cắt bỏ',W0[0]+10,(A0[1]+W0[1])/2,12,colors.amber,'left',true);
   }
   line(c,A0,B0,colors.amber,3.2,[6,4]);
   fillText(c,'✂ Đường cắt kéo',(A0[0]+B0[0])/2+14,(A0[1]+B0[1])/2-6,13.5,colors.amber,'left',true);
   drawAngleArc(c,[cx,cy],A0,B0,38,colors.purple,'36°',1);
   dot(c,A0,'Đỉnh cánh',colors.amber,[cx,cy]);
   dot(c,B0,'Hõm sao',colors.purple,[cx,cy]);
   dot(c,[cx,cy],'O',colors.purple);
   const stateLabel=u<0.08?'Trạng thái: Đã mở phẳng (0°) → Ngôi sao 5 cánh đều (5 trục đối xứng)':u>0.88?'Trạng thái: Đã gấp chụm 10 lớp giấy (múi 36°) → Cắt 1 đường chéo ✂':`Đang gấp/mở giấy (${Math.round(fold)}°): 10 miền 36° đối xứng qua 5 trục`;
   fillText(c,stateLabel,635,482,13.5,colors.blue,'center',true);
   caption(c,'Kéo thanh "Góc gấp" hoặc bấm ▶ Phát: xem 10 lớp giấy gấp vào múi 36°, cắt 1 nhát chéo ✂ và mở ra ngôi sao 5 cánh đều.');
   return;
  }
  dashLine(c,[axis,82],[axis,475],colors.purple);fillText(c,'Trục đối xứng d',axis,66,15,colors.purple,'center',true);
  const base=v==='butterfly'
   ?[[axis-4,235],[axis-58,175],[axis-148,155],[axis-168,238],[axis-112,288],[axis-152,352],[axis-92,402],[axis-28,358],[axis-4,325]]
   :[[axis-155,300],[axis-90,215],[axis-48,268],[axis-70,350]];
  const mirror=base.map(([x,y])=>[2*axis-x,y]);
  const radF=deg(fold),cosF=Math.cos(radF),sinF=Math.sin(radF);
  const foldedPts=mirror.map(([x,y])=>{
   const distFromAxis=x-axis;
   return [axis+distFromAxis*cosF,y-Math.min(32,distFromAxis*0.18)*sinF];
  });
  if(fold>2){
   c.save();c.setLineDash([5,5]);
   poly(c,mirror,light?'rgba(254,243,199,.25)':'rgba(251,184,77,.12)',colors.amber,1.8);
   c.restore();
  }
  poly(c,base,light?'rgba(219,234,254,.68)':'rgba(65,168,237,.42)',colors.blue,3.2);
  poly(c,foldedPts,Math.abs(fold-180)<3?(light?'rgba(237,233,254,.72)':'rgba(164,155,250,.52)'):(light?'rgba(254,243,199,.68)':'rgba(251,184,77,.48)'),Math.abs(fold-180)<3?colors.purple:colors.amber,3.2);
  const idxA=v==='butterfly'?2:0;
  const A=base[idxA],Ap0=mirror[idxA],ApFold=foldedPts[idxA],H=[axis,A[1]];
  dashLine(c,A,Ap0,colors.muted);
  if(fold>3&&fold<177){
   c.save();c.beginPath();ctxMove(c,Ap0);
   c.quadraticCurveTo(axis,A[1]-36,ApFold[0],ApFold[1]);
   c.strokeStyle=colors.amber;c.lineWidth=2;c.setLineDash([4,4]);c.stroke();c.restore();
  }
  dot(c,H,'H',colors.purple);drawRightMark(c,H,A,[axis,82],10,colors.purple);
  drawTickMarks(c,A,H,1,colors.purple);drawTickMarks(c,H,Ap0,1,colors.purple);
  dot(c,A,'A',colors.blue,[axis,A[1]]);
  if(fold>5)dot(c,Ap0,"A' (0°)",colors.muted,[axis,Ap0[1]]);
  dot(c,ApFold,Math.abs(fold-180)<3?"A' ≡ A":"A'",colors.amber,[axis,ApFold[1]]);
  const statusFold=Math.abs(fold-180)<3
   ?'✓ ĐÃ GẤP 180° QUA TRỤC d: Hai nửa hình chồng khít hoàn toàn lên nhau (A′ ≡ A)!'
   :`Góc gấp: ${Math.round(fold)}° / 180° · Tương quan: d ⊥ AA′ tại trung điểm H (AH = HA′)`;
  fillText(c,statusFold,460,496,14,Math.abs(fold-180)<3?colors.purple:colors.amber,'center',true);
  caption(c,v==='butterfly'?'Bấm ▶ Phát hoặc kéo Góc gấp tới 180°: hai cánh bướm gấp qua trục d chồng khít hoàn toàn vào nhau.':'Kết luận: Hai hình đối xứng qua trục d khi gấp tờ giấy 180° quanh trục d thì hai hình chồng khít lên nhau.');
  return;
 }
 const center=[W/2+a*46,H/2],radius=120,rot=deg(v==='rosette'?fold:180);
 if(v==='center'){
  const A=[center[0]-radius,center[1]],Ap=[center[0]+radius,center[1]];
  const theta=Math.PI+deg(fold),traveler=[center[0]+radius*Math.cos(theta),center[1]+radius*Math.sin(theta)];
  line(c,A,Ap,colors.muted,2.2);arc(c,center[0],center[1],radius,Math.PI,Math.PI+deg(fold),colors.purple,3);
  drawTickMarks(c,A,center,1,colors.purple);drawTickMarks(c,center,Ap,1,colors.purple);
  dot(c,A,'A',colors.blue,center);dot(c,Ap,"A'",colors.amber,center);dot(c,center,'O',colors.purple);
  circle(c,traveler[0],traveler[1],9,colors.amber,'#fff');
  fillText(c,`Góc quay quanh tâm O: ${Math.round(fold)}° / 180°`,460,62,18,colors.purple,'center',true);
  fillText(c,'Tương quan: O là trung điểm của AA′ (OA = OA′) · Quay 180° biến A thành A′',460,496,14,colors.blue,'center',true);
  caption(c,`Kết luận: Hai điểm A, A' đối xứng qua tâm O khi O là trung điểm của đoạn AA' (quay 180°).`);
  return;
 }
 for(let i=0;i<(v==='rosette'?6:1);i++){
  let t=rot+(i*(Math.PI*2/6));const x=center[0]+radius*Math.cos(t),y=center[1]+radius*Math.sin(t);
  let src=[center[0]-radius,center[1]];line(c,center,[x,y],i%2?colors.amber:colors.blue,3);circle(c,x,y,8,i%2?colors.amber:colors.blue);
  if(i===0){dot(c,src,'A',colors.blue,center);drawTickMarks(c,src,center,1,colors.purple);drawTickMarks(c,center,[x,y],1,colors.purple);}
 }
 dot(c,center,'O',colors.purple);
 fillText(c,`Góc quay quanh tâm O: ${Math.round(fold)}°`,460,62,17,colors.purple,'center',true);
 caption(c,v==='rosette'?'Quan sát: Quay 180° quanh tâm O biến mỗi cánh hoa thành cánh đối diện (OA = OA′).':'Kết luận: A và A’ thẳng hàng qua tâm đối xứng O và OA = OA’.');
}

function drawGeometry(c,model,p){
 let v=model.variant,angle=deg(p.angle??0),m=clamp(p.measure??5,0,12),o=[W/2,H/2];
 const light=currentCanvasTheme==='light';
 if(['angle','angletypes','clock'].includes(v)){
  if(v==='clock'){
   const hourInt=Math.round((p.angle||0)/30)%12,displayH=hourInt===0?12:hourInt,minInt=Math.round(clamp(p.measure||0,0,59));
   const ang=clockAngle(hourInt,minInt);
   circle(c,o[0],o[1],162,'#0f4c6c','#7ec8d9',5);
   circle(c,o[0],o[1],148,'#ffffff','#1b5968',2.5);
   for(let k=0;k<60;k++){
    const tk=(k-15)*Math.PI/30,isHour=k%5===0,rIn=isHour?130:139,rOut=145;
    line(c,[o[0]+rIn*Math.cos(tk),o[1]+rIn*Math.sin(tk)],[o[0]+rOut*Math.cos(tk),o[1]+rOut*Math.sin(tk)],isHour?'#0f3b52':'#94b8c8',isHour?3:1.2);
   }
   for(let n=1;n<=12;n++){
    const t=(n-3)*Math.PI/6;
    fillText(c,String(n),o[0]+110*Math.cos(t),o[1]+110*Math.sin(t),19,'#0c2e44','center',true);
    const mVal=(n%12)*5;
    fillText(c,`${String(mVal).padStart(2,'0')}p`,o[0]+178*Math.cos(t),o[1]+178*Math.sin(t),11,colors.muted,'center',false);
   }
   const ha=deg(hourInt*30+minInt*.5-90),ma=deg(minInt*6-90);
   let dAng=ma-ha;while(dAng<=-Math.PI)dAng+=Math.PI*2;while(dAng>Math.PI)dAng-=Math.PI*2;
   const sA=dAng>=0?ha:ma,span=Math.abs(dAng);
   c.save();c.beginPath();c.moveTo(o[0],o[1]);c.arc(o[0],o[1],48,sA,sA+span);c.closePath();
   c.fillStyle='rgba(109,40,217,.18)';c.fill();c.strokeStyle='#6D28D9';c.lineWidth=2.4;c.stroke();c.restore();
   const midA=sA+span/2;
   fillText(c,`${ang}°`,o[0]+66*Math.cos(midA),o[1]+66*Math.sin(midA),13.5,'#6D28D9','center',true);
   arrow(c,o,[o[0]+78*Math.cos(ha),o[1]+78*Math.sin(ha)],'#1D4ED8',6);
   arrow(c,o,[o[0]+106*Math.cos(ma),o[1]+106*Math.sin(ma)],'#B45309',4);
   circle(c,o[0],o[1],7,'#6D28D9','#ffffff',2.5);
   const cardBg=light?'rgba(255,255,255,.92)':'rgba(18,42,59,.86)';
   rect(c,24,140,218,175,cardBg,colors.blue,1.5);
   fillText(c,`🕒 ${String(displayH).padStart(2,'0')}:${String(minInt).padStart(2,'0')}`,133,172,24,colors.blue,'center',true);
   fillText(c,`• Kim giờ: ${(hourInt*30+minInt*.5).toFixed(1)}°`,38,212,13.5,'#1D4ED8','left',true);
   fillText(c,`• Kim phút: ${minInt*6}°`,38,240,13.5,'#B45309','left',true);
   fillText(c,'• 1 khoảng giờ = 360°/12 = 30°',38,268,12.5,colors.text,'left',false);
   fillText(c,'• 1 phút = 360°/60 = 6°',38,292,12.5,colors.text,'left',false);
   rect(c,672,155,224,145,cardBg,colors.purple,1.5);
   fillText(c,`Góc nhỏ: ${ang}°`,688,190,20,colors.purple,'left',true);
   fillText(c,`Loại góc: ${classifyAngle(ang)}`,688,226,16,colors.amber,'left',true);
   fillText(c,`Góc lớn: ${(360-ang).toFixed(1).replace('.0','')}°`,688,260,14,colors.muted,'left',false);
   caption(c,'Quan sát: Mỗi khoảng giờ ứng với 30° (360°/12), mỗi phút ứng với 6° · Kết luận: Góc giữa hai kim = |30·H + 0,5·M − 6·M|.');
   return;
  }
  const degVal=Math.round(p.angle||0);
  const typeColor=v==='angletypes'?(Math.abs(degVal-90)<1?colors.purple:Math.abs(degVal-180)<1?colors.muted:degVal<90?colors.blue:colors.amber):colors.purple;
  let r=175,endOx=[o[0]+r,o[1]],endOy=[o[0]+r*Math.cos(-angle),o[1]+r*Math.sin(-angle)];
  arrow(c,o,endOx,colors.blue,4);arrow(c,o,endOy,colors.amber,4);
  fillText(c,'x',endOx[0]+18,endOx[1],18,colors.blue,'center',true);
  fillText(c,'y',o[0]+(r+22)*Math.cos(-angle),o[1]+(r+22)*Math.sin(-angle),18,colors.amber,'center',true);
  if(Math.abs(degVal-90)<1)drawRightMark(c,o,endOx,endOy,18,colors.purple);
  else arc(c,o[0],o[1],68,-angle,0,typeColor,3.5);
  dot(c,o,'',colors.purple);fillText(c,'O',o[0]-18,o[1]+18,15,colors.text,'center',true);
  rect(c,662,76,232,96,light?'rgba(255,255,255,.9)':'rgba(18,42,59,.84)',typeColor,1.5);
  fillText(c,`∠xOy = ${degVal}°`,680,108,21,typeColor,'left',true);
  fillText(c,classifyAngle(p.angle||0),680,144,18,colors.amber,'left',true);
  fillText(c,'• 0° < α < 90°: Góc nhọn · α = 90°: Góc vuông · 90° < α < 180°: Góc tù · α = 180°: Góc bẹt',460,492,13.5,colors.muted,'center',true);
  caption(c,'Kéo tia Oy hoặc thanh trượt để so sánh góc đang xét với góc vuông (90°) và góc bẹt (180°).');
  return;
 }
 const A=[280,340],B=[640,340];
 if(v==='pairlines'){
  line(c,[145,330],[775,330],colors.blue,3);
  let rot=deg(p.angle||35),L=320,inter=[460,330];
  line(c,[inter[0]-L*Math.cos(rot),inter[1]+L*Math.sin(rot)],[inter[0]+L*Math.cos(rot),inter[1]-L*Math.sin(rot)],colors.amber,3.2);
  dot(c,inter,'O',colors.purple);
  fillText(c,'a',765,310,18,colors.blue);fillText(c,'b',inter[0]+L*Math.cos(rot)+12,inter[1]-L*Math.sin(rot),18,colors.amber);
  const aDeg=Math.round(p.angle||35);
  arc(c,inter[0],inter[1],45,-rot,0,colors.amber,3);
  arc(c,inter[0],inter[1],45,Math.PI-rot,Math.PI,colors.amber,3);
  fillText(c,`${aDeg}°`,inter[0]+60*Math.cos(-rot/2),inter[1]+60*Math.sin(-rot/2),13,colors.amber,'center',true);
  fillText(c,`${aDeg}°`,inter[0]-60*Math.cos(-rot/2),inter[1]-60*Math.sin(-rot/2),13,colors.amber,'center',true);
  fillText(c,`Hai góc đối đỉnh bằng nhau: ${aDeg}° = ${aDeg}° · Hai góc kề bù: ${aDeg}° + ${180-aDeg}° = 180°`,460,70,16,colors.amber,'center',true);
  caption(c,'Quan sát giao điểm O · Kết luận: Hai đường thẳng cắt nhau tạo hai cặp góc đối đỉnh bằng nhau.');
  return;
 }
 if(v==='rays'){
  const O=[460,320],Lx=280;
  const ang=(p.angle??180)*Math.PI/180;
  arrow(c,O,[O[0]+Lx,O[1]],colors.blue,3.5);
  arrow(c,O,[O[0]-Lx*Math.cos(Math.PI-ang),O[1]-Lx*Math.sin(Math.PI-ang)],colors.amber,3.5);
  dot(c,O,'O',colors.purple);
  fillText(c,'x',O[0]+Lx+18,O[1],18,colors.blue,'center',true);
  fillText(c,'y',O[0]-(Lx+20)*Math.cos(Math.PI-ang),O[1]-(Lx+20)*Math.sin(Math.PI-ang),18,colors.amber,'center',true);
  if(ang>0.05){
   arc(c,O[0],O[1],56,-ang,0,colors.purple,3);
  }
  const curDeg=Math.round(p.angle??180);
  fillText(c,curDeg===180?'180° (Góc bẹt - Hai tia đối nhau)':`Góc xOy = ${curDeg}°`,O[0],O[1]-72,18,colors.purple,'center',true);
  fillText(c,'Hai tia Ox và Oy chung gốc O tạo thành đường thẳng xy thẳng hàng',460,70,16,colors.blue,'center',true);
  caption(c,'Kết luận: Hai tia chung gốc O tạo thành một đường thẳng được gọi là hai tia đối nhau. Góc giữa chúng bằng 180°.');
  return;
 }
 if(v==='ruler'){
  const meas=p.measure??5;
  const A=[250,320],B=[A[0]+meas*36,320];
  const neutralInk=light?'#1E293B':'#E2E8F0';
  line(c,A,B,neutralInk,4);dot(c,A,'A',neutralInk,A);dot(c,B,'B',neutralInk,B);
  const ry=230,rw=420,rh=68;
  rect(c,A[0]-20,ry,rw,rh,light?'rgba(241,245,249,.95)':'rgba(30,41,59,.92)',colors.muted,2);
  for(let k=0;k<=10;k++){
   const rx=A[0]+k*36,isZero=k===0;
   line(c,[rx,ry],[rx,ry+24],isZero?neutralInk:colors.muted,isZero?2.6:1.8);
   fillText(c,String(k),rx,ry+38,12,colors.text,'center',isZero);
   for(let sub=1;sub<10;sub++){
    line(c,[rx+sub*3.6,ry],[rx+sub*3.6,ry+(sub===5?16:10)],colors.muted,1);
   }
  }
  fillText(c,'cm',A[0]+rw-36,ry+38,12,colors.muted,'center');
  dashLine(c,A,[A[0],ry+24],neutralInk);
  dashLine(c,B,[B[0],ry+24],neutralInk);
  const dMeas=Number(meas).toFixed(1);
  fillText(c,`Độ dài đoạn thẳng AB = ${dMeas} cm`,460,72,21,colors.text,'center',true);
  caption(c,'Đặt vạch 0 cm của thước trùng điểm A, nhìn vạch chia tại điểm B để đọc độ dài đoạn thẳng AB.');
  return;
 }
 if(v==='midpoint'){
  const halfLen=(p.measure??5)*22;
  const A=[460-halfLen,320],B=[460+halfLen,320],M=[460,320];
  line(c,A,B,colors.blue,4);dot(c,A,'A',colors.muted,A);dot(c,B,'B',colors.muted,B);
  dot(c,M,'M',colors.amber);
  drawTickMarks(c,A,M,2,colors.blue);drawTickMarks(c,M,B,2,colors.blue);
  const halfCm=((B[0]-A[0])/2/44).toFixed(1);
  fillText(c,`MA = ${halfCm} cm`,(A[0]+M[0])/2,A[1]+30,14,colors.blue,'center',true);
  fillText(c,`MB = ${halfCm} cm`,(M[0]+B[0])/2,A[1]+30,14,colors.blue,'center',true);
  fillText(c,'M là trung điểm của đoạn thẳng AB ⇔ M nằm giữa A, B và MA = MB = AB/2',460,70,16,colors.amber,'center',true);
  caption(c,'Kết luận: Trung điểm M của đoạn thẳng AB là điểm nằm giữa A, B và cách đều A, B.');
  return;
 }
 if(v==='pointline'){
  line(c,[130,360],[790,360],colors.blue,4);fillText(c,'d',808,360,18,colors.blue,'center',true);
  dot(c,[360,360],'A ∈ d',colors.blue);
  const M=[560,360-22*m];
  if(m>0.05){dashLine(c,M,[560,360],colors.muted);drawRightMark(c,[560,360],M,[790,360],10,colors.muted);dot(c,[560,360],'H',colors.muted);}
  dot(c,M,'M',colors.amber);
  fillText(c,m===0?'M thuộc d':'M không thuộc d',460,66,21,colors.amber,'center',true);
  fillText(c,m===0?'Kí hiệu: M ∈ d (khoảng cách MH = 0)':'Kí hiệu: M ∉ d (khoảng cách MH > 0)',460,96,15,colors.blue,'center',true);
  caption(c,'Quan sát khoảng cách MH ⊥ d · Kết luận: Điểm M thuộc đường thẳng d khi và chỉ khi M nằm trên d (MH = 0).');
  return;
 }
 if(v==='collinear'){
  const neutralLine=light?'#334155':'#CBD5E1';
  line(c,[120,330],[800,330],neutralLine,3.2);fillText(c,'d',790,310,18,colors.text);
  const u=p.progress??0.5;
  const pA=[240,330],pC=[680,330];
  const pB=[pA[0]+(pC[0]-pA[0])*(0.25+0.5*u),330];
  dot(c,pA,'A',neutralLine);dot(c,pB,'B',neutralLine);dot(c,pC,'C',neutralLine);
  drawTickMarks(c,pA,pB,1,colors.muted);drawTickMarks(c,pB,pC,2,colors.muted);
  const dAB=((pB[0]-pA[0])/44).toFixed(1),dBC=((pC[0]-pB[0])/44).toFixed(1),dAC=((pC[0]-pA[0])/44).toFixed(1);
  fillText(c,`AB = ${dAB} cm · BC = ${dBC} cm ⇒ AB + BC = ${dAC} cm = AC`,460,70,18,colors.text,'center',true);
  fillText(c,'Ba điểm A, B, C thẳng hàng vì cùng thuộc đường thẳng d · Điểm B luôn nằm giữa A và C',460,105,15,colors.muted,'center',true);
  caption(c,'Kết luận: Khi ba điểm cùng thuộc một đường thẳng, ta nói chúng thẳng hàng. Điểm B nằm giữa A và C.');
  return;
 }
}

function drawNumber(c,model,p,state){
 const v=model.variant,n=Math.round(p.value??0),step=Math.round(p.step??2);
 const light=currentCanvasTheme==='light';
 if(['natural','integer','hops'].includes(v)){
  const y=300,zero=460;
  arrow(c,[80,y],[840,y],v==='natural'?colors.muted:colors.blue,3.5);
  for(let i=-8;i<=8;i++){
   const x=zero+i*42;
   const col=v==='natural'?colors.muted:(i===0?colors.purple:i<0?colors.blue:colors.amber);
   line(c,[x,y-9],[x,y+9],col,i===0?3:1.5);
   fillText(c,String(i),x,y+28,13,col,'center',i===0);
  }
  const currX=zero+clamp(n,-8,8)*42;
  dot(c,[currX,y],`A(${n})`,v==='hops'?colors.purple:colors.amber);
  if(v==='hops'){
   const target=n+step;
   const visible=target>=-8&&target<=8,end=clamp(target,-8,8),tarX=zero+end*42;
   const hopColor=step>=0?colors.blue:colors.amber;
   c.save();c.beginPath();c.moveTo(currX,y-12);
   c.quadraticCurveTo((currX+tarX)/2,y-70,tarX,y-12);
   c.strokeStyle=hopColor;c.lineWidth=3;c.setLineDash([5,4]);c.stroke();c.restore();
   arrow(c,[(currX+tarX)/2,y-48],[tarX,y-14],hopColor,3);
   if(visible)dot(c,[tarX,y],'B',hopColor);
   fillText(c,`Phép tính: ${n} + (${step}) = ${target}`,460,72,22,colors.purple,'center',true);
   if(!visible)fillText(c,'B nằm ngoài đoạn trục số đang hiển thị',460,110,14.5,colors.pink,'center',true);
   else fillText(c,step>=0?'Cộng số dương: Nhảy sang bên phải trên trục số':'Cộng số âm: Nhảy sang bên trái trên trục số',460,110,16,hopColor,'center',true);
   caption(c,'Quan sát bước nhảy trên trục số · Kết luận: Cộng số nguyên dương di chuyển sang phải, cộng số nguyên âm di chuyển sang trái.');
   return;
  }
  if(v==='integer'){
   const oppX=zero-clamp(n,-8,8)*42;
   if(n!==0){
    dot(c,[oppX,y],`A'(${-n})`,colors.blue);
    dashLine(c,[zero,y-40],[currX,y-40],colors.amber);dashLine(c,[zero,y-40],[oppX,y-40],colors.blue);
    fillText(c,`${Math.abs(n)} đv`,(zero+currX)/2,y-55,13,colors.amber,'center');
    fillText(c,`${Math.abs(n)} đv`,(zero+oppX)/2,y-55,13,colors.blue,'center');
   }
   fillText(c,`Điểm A biểu diễn số ${n} · Số đối của ${n} là ${-n} (cách đều gốc 0)`,460,72,18,colors.purple,'center',true);
   caption(c,'Kết luận: Hai số đối nhau cách đều điểm gốc 0 và nằm ở hai phía khác nhau trên trục số.');
   return;
  }
  fillText(c,`Tia số tự nhiên: Điểm gốc 0, các số 1, 2, 3… biểu diễn theo chiều tăng dần`,460,72,17,colors.amber,'center',true);
  caption(c,'Kết luận: Trên tia số nằm ngang, điểm biểu diễn số nhỏ hơn nằm bên trái điểm biểu diễn số lớn hơn.');
  return;
 }
 if(v==='thermometer'){
  const x=390,top=115,bottom=420;rect(c,x-24,top,48,bottom-top,light?'#F1F5F9':'#16384d',colors.muted,3);
  const yy=bottom-(clamp(n,-20,40)+20)/60*(bottom-top);rect(c,x-14,yy,28,bottom-yy,colors.amber,null);
  circle(c,x,bottom+14,26,colors.amber,colors.muted,3);
  for(let k=-20;k<=40;k+=10){let y=bottom-(k+20)/60*(bottom-top);line(c,[x+28,y],[x+44,y],k===0?colors.purple:colors.muted,k===0?2.8:1.2);fillText(c,k+'°C',x+50,y,13,k===0?colors.purple:colors.muted,'left',k===0);}
  fillText(c,`Nhiệt độ: ${n}°C`,550,212,23,colors.amber,'left',true);fillText(c,n<0?'Dưới 0°C (Số nguyên âm)':n>0?'Trên 0°C (Số nguyên dương)':'Mốc 0°C (Nước đóng băng)',550,248,16,colors.purple,'left',true);
  caption(c,'Quan sát cột thủy ngân so với vạch 0°C · Kết luận: Số nguyên âm biểu diễn nhiệt độ dưới 0°C.');
  return;
 }
 if(v==='place'){
  const digits=('0000'+Math.abs(n)).slice(-4),names=['Nghìn','Trăm','Chục','Đơn vị'];
  const activeCol=Math.min(3,Math.floor(clamp(p.progress??1,0,0.999)*4));
  digits.split('').forEach((d,i)=>{
   const x=215+i*130,isFocus=i===activeCol;
   rect(c,x,210,115,120,light?'#F8FAFC':'rgba(30,58,76,.45)',isFocus?colors.text:colors.muted,isFocus?3.2:1.5);
   fillText(c,names[i],x+58,184,16,colors.muted,'center',isFocus);
   fillText(c,d,x+58,270,44,colors.text,'center',true);
  });
  fillText(c,`${n.toLocaleString('vi-VN')} = ${digits.split('').map((d,i)=>Number(d)*10**(3-i)).filter(Boolean).join(' + ')}`,460,390,17,colors.text,'center',true);
  caption(c,'Quan sát giá trị từng hàng · Kết luận: Trong hệ thập phân, cứ 10 đơn vị ở một hàng hợp thành 1 đơn vị ở hàng liền trước.');
  return;
 }
 if(v==='factors'){
  const build=value=>{const f=smallestFactor(value);return f===value?{value,children:[]}:{value,children:[{value:f,children:[]},build(value/f)]};};
  const tree=build(Math.max(2,n));const leaves=node=>node.children.length?node.children.reduce((a,x)=>a+leaves(x),0):1;
  const depth=node=>node.children.length?1+Math.max(...node.children.map(depth)):1;
  const maxDepth=depth(tree),spacing=Math.min(73,310/Math.max(1,maxDepth-1)),leafCount=leaves(tree),stepX=Math.min(90,640/Math.max(1,leafCount-1));
  let nextLeaf=0;const visible=state.time>0?Math.max(1,Math.ceil((state.time/8000)*maxDepth)):maxDepth;
  const place=(node,level)=>{node.level=level;node.y=120+level*spacing;
   if(node.children.length){node.children.forEach(ch=>place(ch,level+1));node.x=(node.children[0].x+node.children[1].x)/2;}
   else node.x=W/2-(leafCount-1)*stepX/2+nextLeaf++*stepX;};
  const drawTree=node=>{if(node.level>=visible)return;
   for(const child of node.children)if(child.level<visible)line(c,[node.x,node.y+20],[child.x,child.y-20],colors.muted,2);
   const isLeaf=node.children.length===0;
   circle(c,node.x,node.y,23,isLeaf?colors.blue:colors.amber,'#d7edf7',2);
   fillText(c,node.value,node.x,node.y,16,'#ffffff','center',true);node.children.forEach(drawTree);};
  place(tree,0);drawTree(tree);fillText(c,primeFactors(n).join(' × '),580,473,19,colors.blue);
  caption(c,state.time>0?'Quan sát: Từng nhánh thừa số được tách đến khi mọi lá đều là số nguyên tố.':'Kết luận: Mọi hợp số đều phân tích được duy nhất ra tích các thừa số nguyên tố.');
  return;
 }
 if(v==='powers'){
  let base=clamp(n,2,8),pow=clamp(step,1,3),count=base**pow,cols=Math.ceil(Math.sqrt(count)),cell=Math.min(24,450/cols);
  for(let i=0;i<Math.min(count,400);i++){
   let x=280+i%cols*cell,y=150+Math.floor(i/cols)*cell;
   const grp=Math.floor(i/base)%2;
   rect(c,x,y,cell-1,cell-1,grp?colors.amber:colors.blue,null);
  }
  fillText(c,`${base}^${pow} = ${count}`,620,230,25,colors.purple);
  caption(c,`Quan sát: Lũy thừa bậc ${pow} của ${base} là tích của ${pow} thừa số ${base} · Kết luận: ${base}^${pow} = ${count}.`);
  return;
 }
 if(v==='multiples'){
  const k=clamp(n||6,2,20);
  const u=p.progress??1;
  const maxNum=Math.max(1,Math.round(100*u));
  const startX=230,startY=110,cellW=46,cellH=36;
  for(let row=0;row<10;row++){
   for(let col=0;col<10;col++){
    const num=row*10+col+1;
    const isMult=num%k===0&&num<=maxNum;
    const isDiv=k%num===0&&num<=maxNum;
    const isBoth=isMult&&isDiv;
    const x=startX+col*cellW,y=startY+row*cellH;
    const fill=isBoth?(light?'#EDE9FE':'rgba(164,155,250,.38)'):isMult?(light?'#DBEAFE':'rgba(116,169,255,.32)'):isDiv?(light?'#FEF3C7':'rgba(251,184,77,.35)'):(light?'#F8FAFC':'rgba(40,192,187,.05)');
    const stroke=isBoth?colors.purple:isMult?colors.blue:isDiv?colors.amber:'rgba(156,181,197,.25)';
    rect(c,x,y,cellW-3,cellH-3,fill,stroke,(isMult||isDiv)?2.2:1);
    const txtCol=isBoth?colors.purple:isMult?colors.blue:isDiv?colors.amber:colors.muted;
    fillText(c,String(num),x+cellW/2-1.5,y+cellH/2-1.5,13,txtCol,'center',isMult||isDiv);
   }
  }
  fillText(c,`Bảng 100 số: Bội của ${k} (xanh) · Ước của ${k} (cam) · Chính số ${k} (viền tím)`,460,65,17,colors.blue,'center',true);
  caption(c,`Quan sát: Các bội của ${k} xuất hiện theo chu kỳ ${k} đơn vị · Kết luận: B(${k}) = {0, ${k}, ${2*k}, ${3*k}, …}.`);
  return;
 }
 if(v==='primes'){
  const startX=230,startY=110,cellW=46,cellH=36;
  const primes=new Set([2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97]);
  const step=p.step??4;
  const activeSieve=[0,2,3,5,7][step]||0;
  for(let row=0;row<10;row++){
   for(let col=0;col<10;col++){
    const num=row*10+col+1;
    const x=startX+col*cellW,y=startY+row*cellH;
    let isCrossed=false,isPrime=false,isActivePrime=num===activeSieve;
    if(num===1)isCrossed=true;
    else if(step>=1&&num>2&&num%2===0)isCrossed=true;
    else if(step>=2&&num>3&&num%3===0)isCrossed=true;
    else if(step>=3&&num>5&&num%5===0)isCrossed=true;
    else if(step>=4&&num>7&&num%7===0)isCrossed=true;
    if(step>=1&&primes.has(num)&&num<=((step===1?2:step===2?3:step===3?7:100)))isPrime=true;
    const fill=isActivePrime?(light?'#FEF3C7':'rgba(251,184,77,.45)'):isPrime?(light?'#DBEAFE':'rgba(116,169,255,.38)'):isCrossed?(light?'#F1F5F9':'rgba(148,163,184,.12)'):(light?'#FFFFFF':'rgba(116,169,255,.06)');
    const stroke=isActivePrime?colors.amber:isPrime?colors.blue:isCrossed?colors.muted:'rgba(156,181,197,.3)';
    rect(c,x,y,cellW-3,cellH-3,fill,stroke,(isPrime||isActivePrime)?2.2:1);
    fillText(c,String(num),x+cellW/2-1.5,y+cellH/2-1.5,13,isActivePrime?colors.amber:isPrime?colors.blue:isCrossed?colors.muted:colors.text,'center',isPrime||isActivePrime);
    if(isCrossed){
     line(c,[x+4,y+4],[x+cellW-7,y+cellH-7],colors.muted,1.3);
    }
   }
  }
  fillText(c,`Sàng Eratosthenes trên bảng 100: Bước ${step}/4 (Số 1 bị loại, số nguyên tố màu xanh)`,460,65,17,colors.blue,'center',true);
  caption(c,step<4?`Bước ${step}: Đang sàng bằng số nguyên tố ${activeSieve||2} (cam), gạch bỏ các hợp số (xám).`:'Kết luận: Số 1 không phải số nguyên tố; sau khi sàng còn lại đúng 25 số nguyên tố ≤ 100.');
  return;
 }
}

function drawVenn(c,model,p,state){
 const light=currentCanvasTheme==='light';
 // Cover the small default 15px top title and draw a large, crisp 26px bold header
 rect(c,24,6,380,40,light?'#f1f8fb':'#102634',null);
 fillText(c,model?.title||'Sơ đồ tập hợp Venn',34,28,26,colors.text,'left',true);

 const A=[325,286],B=[505,286],R=154;
 circle(c,A[0],A[1],R,light?'rgba(219,234,254,.58)':'rgba(53,144,230,.24)',colors.blue,3.6);
 circle(c,B[0],B[1],R,light?'rgba(254,243,199,.58)':'rgba(251,184,77,.24)',colors.amber,3.6);

 const qa=Math.round(p.a||4),qb=Math.round(p.b||6);
 fillText(c,`Tập A (Bội của ${qa})`,222,104,21,colors.blue,'center',true);
 fillText(c,'A',222,150,42,colors.blue,'center',true);
 fillText(c,'A ∩ B',415,112,30,colors.purple,'center',true);
 fillText(c,`Tập B (Bội của ${qb})`,608,104,21,colors.amber,'center',true);
 fillText(c,'B',608,150,42,colors.amber,'center',true);
 fillText(c,'Ngoài A ∪ B',795,114,21,colors.muted,'center',true);

 const onlyA=[],common=[],onlyB=[],outside=[];
 for(let i=1;i<=12;i++){
  const l=i%qa===0,r=i%qb===0;
  if(l&&r)common.push(i);
  else if(l)onlyA.push(i);
  else if(r)onlyB.push(i);
  else outside.push(i);
 }

 const drawBucket=(items,cx,cy,colSpread,rowStep,textColor,badgeFill,badgeStroke,fontSize=24)=>{
  const n=items.length;if(!n)return;
  const cols=n>4?2:1;
  const rows=Math.ceil(n/cols);
  const startY=cy-((rows-1)*rowStep)/2;
  items.forEach((val,idx)=>{
   const row=Math.floor(idx/cols),col=idx%cols;
   const colsInRow=(row===rows-1&&n%cols!==0)?(n%cols):cols;
   const x=cx+(colsInRow===1?0:(col===0?-colSpread/2:colSpread/2));
   const y=startY+row*rowStep;
   circle(c,x,y,19,badgeFill,badgeStroke,2);
   fillText(c,val,x,y,fontSize,textColor,'center',true);
  });
 };

 drawBucket(onlyA,238,292,52,46,colors.blue,light?'rgba(255,255,255,.88)':'rgba(16,38,52,.82)',colors.blue,24);
 drawBucket(common,415,292,48,48,colors.purple,light?'rgba(243,232,255,.95)':'rgba(109,40,217,.28)',colors.purple,26);
 drawBucket(onlyB,592,292,52,46,colors.amber,light?'rgba(255,255,255,.88)':'rgba(16,38,52,.82)',colors.amber,24);
 drawBucket(outside,795,296,64,46,colors.text,light?'rgba(255,255,255,.85)':'rgba(16,38,52,.75)',colors.muted,23);

 fillText(c,`Quan sát miền giao A ∩ B · Kết luận: Bội chung của ${qa} và ${qb} (≤12) là: ${common.join(', ')||'rỗng'} · BCNN(${qa},${qb}) = ${(qa*qb)/gcd(qa,qb)}.`,34,H-24,21,colors.text,'left',true);
}

function drawFraction(c,model,p){
 const v=model.variant,n=Math.round(clamp(p.numerator,0,100)),d=Math.max(1,Math.round(clamp(p.denominator,1,100))),ratio=fractionRatio(n,d);
 const x=210,y=230,width=490,height=72,light=currentCanvasTheme==='light';
 const emptyFill=light?'#DBEAFE':'rgba(116,169,255,.15)';
 const neutralEmpty=light?'#F1F5F9':'rgba(16,42,56,.45)';

 if(v==='addsame'){
  const dd=Math.round(clamp(d,2,20)),aa=Math.round(clamp(n,0,dd)),bb=Math.round(clamp(p.other??0,0,dd)),total=aa+bb;
  const u=clamp(p.progress??1,0,1);
  function bar(yPos,units,color){
   for(let i=0;i<dd;i++)rect(c,228+i*460/dd,yPos,460/dd-2,42,i<units?color:neutralEmpty,colors.muted,1.2);
  }
  fillText(c,'Cộng hai phân số có cùng mẫu số',460,84,25,colors.purple,'center',true);
  bar(138,aa,colors.blue);fillText(c,`${aa}/${dd}`,710,160,22,colors.blue);
  fillText(c,'+',460,206,30,colors.amber,'center');
  bar(228,bb,colors.amber);fillText(c,`${bb}/${dd}`,710,250,22,colors.amber);
  line(c,[228,302],[688,302],colors.muted,2);
  const cellW=460/dd;
  for(let i=0;i<dd;i++)rect(c,228+i*cellW,322,cellW-2,42,neutralEmpty,colors.muted,1.2);
  for(let i=0;i<Math.min(dd,aa);i++)rect(c,228+i*cellW,322,cellW-2,42,u>0.82?colors.purple:colors.blue,colors.muted,1.2);
  for(let j=0;j<bb;j++){
   const destIdx=aa+j,destRow=destIdx>=dd?1:0,destCol=destIdx%dd;
   const srcX=228+j*cellW,srcY=228;
   const dstX=228+destCol*cellW,dstY=destRow===0?322:380;
   const curX=srcX+(dstX-srcX)*u,curY=srcY+(dstY-srcY)*u;
   rect(c,curX,curY,cellW-2,42,u>0.82?colors.purple:colors.amber,u>0.82?colors.purple:colors.amber,1.6);
  }
  if(total>dd){
   for(let i=0;i<dd;i++)if(i>=total-dd)rect(c,228+i*cellW,380,cellW-2,42,neutralEmpty,colors.muted,1.2);
   fillText(c,'Dải thứ hai',711,402,14,colors.muted);
  }
  fillText(c,`${aa}/${dd} + ${bb}/${dd} = (${aa} + ${bb})/${dd} = ${total}/${dd}`,460,467,25,colors.purple,'center',true);
  caption(c,'Quan sát các phần chia đều ghép nối tiếp trên cùng mẫu số · Kết luận: Muốn cộng hai phân số cùng mẫu, ta cộng hai tử số và giữ nguyên mẫu số.');
  return;
 }
 if(v==='percent'){
  for(let i=0;i<100;i++){
   let col=i%10,row=Math.floor(i/10);
   const cellCol=i===n-1?colors.amber:i<n?colors.blue:neutralEmpty;
   rect(c,280+col*32,125+row*30,30,28,cellCol,colors.muted,1);
  }
  fillText(c,`${n}% = ${n}/100`,740,262,26,colors.purple,'center',true);
  caption(c,`Quan sát ${n}/100 ô được tô màu · Kết luận: Tỉ số phần trăm ${n}% biểu thị ${n} phần trên tổng số 100 phần bằng nhau.`);
  return;
 }
 if(v==='circle'){
  let r=148;for(let i=0;i<d;i++){let a=-Math.PI/2+i*2*Math.PI/d,b=-Math.PI/2+(i+1)*2*Math.PI/d;
   c.beginPath();c.moveTo(W/2,260);c.arc(W/2,260,r,a,b);c.closePath();c.fillStyle=i<n?colors.amber:emptyFill;c.fill();c.strokeStyle=colors.muted;c.lineWidth=2;c.stroke();}
  fillText(c,`${n} / ${d} ≈ ${(ratio*100).toFixed(1)}%`,755,270,24,colors.amber,'center',true);
  caption(c,`Quan sát: Hình tròn chia thành ${d} hình quạt bằng nhau, tô màu ${n} phần · Kết luận: Phân số ${n}/${d}.`);
  return;
 }
 if(v==='grid'){
  let cols=Math.min(10,Math.ceil(Math.sqrt(d))),rows=Math.ceil(d/cols),cell=Math.min(72,450/cols,240/rows);
  for(let i=0;i<d;i++){rect(c,225+(i%cols)*cell,166+Math.floor(i/cols)*cell,cell-2,cell-2,i<n?colors.amber:emptyFill,colors.muted,1.2);}
  fillText(c,`${n} / ${d}`,740,285,26,colors.amber,'center',true);
  caption(c,`Quan sát: Lưới gồm ${d} ô bằng nhau, tô màu ${n} ô · Kết luận: Giá trị phân số = ${n}/${d}.`);
  return;
 }
 if(v==='decimal'){
  let raw=n/d,parts=raw.toFixed(2).split('.');fillText(c,raw.toFixed(2).replace('.',','),460,230,68,colors.amber,'center',true);
  const focusIdx=n%10!==0?2:1;
  ['Đơn vị','Phần mười','Phần trăm'].forEach((t,i)=>{
   const isF=i===focusIdx;
   rect(c,257+i*150,339,140,70,isF?(light?'#FEF3C7':'rgba(251,184,77,.2)'):(light?'#F1F5F9':'#234657'),isF?colors.amber:colors.muted,isF?2.8:1.5);
   fillText(c,t,327+i*150,358,13,isF?colors.amber:colors.muted,'center',true);
   fillText(c,i===0?parts[0]:parts[1]?.[i-1]||'0',327+i*150,390,25,isF?colors.amber:colors.text,'center',true);
  });
  caption(c,`Quan sát cấu tạo hàng phần mười, phần trăm · Kết luận: ${n}/${d} ≈ ${raw.toFixed(2).replace('.',',')}.`);
  return;
 }
 if(v==='quantity'){
  const total=Math.round(clamp(p.total||20,1,50)),filled=Math.round(total*ratio);
  for(let i=0;i<total;i++){const col=i%10,row=Math.floor(i/10);circle(c,277+col*43,172+row*43,13,i<filled?colors.amber:emptyFill,colors.muted);}
  fillText(c,`${n}/${d} của ${total} = ${(total*ratio).toFixed(2)}`,460,425,22,colors.purple,'center',true);
  caption(c,`Kết luận: Muốn tìm giá trị phân số ${n}/${d} của số a = ${total}, ta tính a × (${n}/${d}).`);
  return;
 }
 function band(yPos,nn,dd,label,fillCol=colors.amber){
  for(let i=0;i<dd;i++){const xx=x+i*width/dd;rect(c,xx,yPos,width/dd-1,height/2,i<nn?fillCol:emptyFill,colors.muted,1.5);}
  fillText(c,label,x+width+15,yPos+height/4,17,fillCol,'left',true);
 }
 if(v==='equivalent'){
  band(y,n,d,`${n}/${d}`,colors.blue);
  let f=Math.round(clamp(p.factor||2,1,8));
  band(y+118,n*f,d*f,`${n*f}/${d*f}`,colors.amber);
  const eqW=n*width/d;
  rect(c,x,y-4,eqW,118+height/2+8,'transparent',colors.purple,2.4);
  dashLine(c,[x+eqW,y-8],[x+eqW,y+118+height/2+8],colors.purple);
  caption(c,`Quan sát: Độ dài phần tô màu ở hai băng bằng nhau · Kết luận: ${n}/${d} = (${n}×${f})/(${d}×${f}) = ${n*f}/${d*f}.`);
 }else if(v==='compare'){
  band(y,n,d,`${n}/${d}`,colors.blue);
  let nn=Math.round(clamp(p.other||4,0,100));
  band(y+118,nn,d,`${nn}/${d}`,colors.amber);
  caption(c,`Quan sát độ dài hai băng cùng mẫu ${d} · Kết luận: ${n}/${d} ${n===nn?'=':n>nn?'>':'<'} ${nn}/${d} vì ${n} ${n===nn?'=':n>nn?'>':'<'} ${nn}.`);
 }else{
  band(y,n,d,`${n}/${d}`,colors.amber);
  fillText(c,`${(ratio*100).toFixed(1)}%`,775,248,26,colors.amber,'center',true);
  caption(c,`Quan sát: Băng chia ${d} phần bằng nhau, lấy ${n} phần · Kết luận: Phân số ${n}/${d}.`);
 }
}

function drawChart(c,model,p){
 const v=model.variant,vals=(p.values||[4,7,3,6]).map(n=>Math.round(clamp(n,0,30))),other=(p.otherValues||[6,5,8,7]).map(n=>Math.round(clamp(n,0,30)));
 const cats=['A','B','C','D'],light=currentCanvasTheme==='light';
 if(v==='table'){
  const sx=180,sy=135,rowH=56,colW=180;
  rect(c,sx,sy,colW*3,rowH,light?'#E2E8F0':'#1e3a4c',colors.muted,1.8);
  fillText(c,'Nhóm đối tượng',sx+90,sy+28,15,colors.text,'center',true);
  fillText(c,'Số lượng thu thập',sx+colW+90,sy+28,15,colors.text,'center',true);
  fillText(c,'Ghi chú dữ liệu',sx+colW*2+90,sy+28,15,colors.text,'center',true);
  const maxIdx=vals.indexOf(Math.max(...vals));
  for(let i=0;i<cats.length;i++){
   const y=sy+(i+1)*rowH,isRecent=i===maxIdx;
   rect(c,sx,y,colW*3,rowH,isRecent?(light?'#FEF9C3':'rgba(251,184,77,.12)'):(light?'#FFFFFF':'#122a3b'),colors.muted,1.2);
   line(c,[sx+colW,y],[sx+colW,y+rowH],colors.muted,1);
   line(c,[sx+colW*2,y],[sx+colW*2,y+rowH],colors.muted,1);
   fillText(c,`Nhóm ${cats[i]}`,sx+90,y+28,16,colors.text,'center',true);
   fillText(c,String(vals[i]),sx+colW+90,y+28,18,colors.text,'center',isRecent);
   fillText(c,isRecent?'Vừa cập nhật':'Đã kiểm tra',sx+colW*2+90,y+28,14,colors.muted,'center',false);
  }
  fillText(c,`Bảng dữ liệu thu thập ban đầu · Tổng số mẫu N = ${vals.reduce((a,b)=>a+b,0)}`,460,82,17,colors.text,'center',true);
  caption(c,'Quan sát: Dữ liệu thô được sắp xếp rõ ràng theo hàng và cột trước khi vẽ biểu đồ.');
  return;
 }
 if(v==='tally'){
  const sx=240,sy=140,rowH=65;
  for(let i=0;i<cats.length;i++){
   const y=sy+i*rowH;
   rect(c,sx,y,440,54,light?'#F8FAFC':'#183a4f',colors.muted,1.5);
   fillText(c,cats[i],sx+35,y+27,18,colors.blue,'center',true);
   const val=vals[i];
   for(let k=0;k<val;k++){
    const grp=Math.floor(k/5),rem=k%5,bx=sx+85+grp*85;
    const isFullBundle=(grp+1)*5<=val;
    const bundleCol=isFullBundle?colors.amber:colors.blue;
    if(rem<4)line(c,[bx+rem*14,y+12],[bx+rem*14,y+42],bundleCol,2.5);
    else line(c,[bx-6,y+38],[bx+46,y+16],colors.amber,2.8);
   }
   fillText(c,`(${val})`,sx+395,y+27,16,colors.text,'center',true);
  }
  fillText(c,'Bảng kiểm đếm: Cụm đủ 5 vạch tô màu cam, các vạch lẻ màu xanh',460,75,16,colors.amber,'center',true);
  caption(c,'Quan sát: Dùng các vạch kiểm đếm theo cụm 5 để ghi lại dữ liệu thu thập được nhanh chóng.');
  return;
 }
 if(v==='pictogram'){
  const sx=220,sy=130,unit=p.unit||2;
  const rowCols=[colors.blue,colors.amber,colors.purple,colors.green];
  for(let i=0;i<cats.length;i++){
   const y=sy+i*70,val=vals[i],count=Math.floor(val/unit),rCol=rowCols[i%4];
   fillText(c,cats[i],sx,y+25,18,rCol,'center',true);
   for(let k=0;k<count;k++){
    circle(c,sx+60+k*52,y+25,18,rCol,'#fff',2);
    fillText(c,'★',sx+60+k*52,y+25,15,'#fff','center',true);
   }
   if(val%unit!==0){
    circle(c,sx+60+count*52,y+25,18,colors.muted,rCol,1.5);
    fillText(c,'½',sx+60+count*52,y+25,13,'#fff','center',true);
   }
   fillText(c,`= ${val}`,sx+380,y+25,16,colors.text,'left',true);
  }
  rect(c,680,180,210,100,light?'#fff':'#1b3f52',colors.amber,2);
  circle(c,720,230,18,colors.amber,'#fff',2);fillText(c,'★',720,230,15,'#fff','center',true);
  fillText(c,`= ${unit} đơn vị`,755,230,16,colors.amber,'left',true);
  caption(c,`Biểu đồ tranh: Mỗi biểu tượng ngôi sao biểu thị ${unit} đơn vị.`);
  return;
 }
 if(v==='horizontal'){
  const sx=220,sy=130,rowH=70;
  const maxVal=Math.max(...vals);
  const focusIdx=vals.indexOf(maxVal);
  line(c,[sx,sy-10],[sx,sy+4*rowH],colors.text,2);
  for(let i=0;i<cats.length;i++){
   const y=sy+i*rowH,w=vals[i]*16,isFocus=i===focusIdx;
   rect(c,sx+2,y+14,w,36,isFocus?colors.amber:colors.blue,isFocus?colors.amber:colors.blue,2);
   fillText(c,cats[i],sx-25,y+32,16,isFocus?colors.amber:colors.text,'center',true);
   fillText(c,String(vals[i]),sx+w+15,y+32,15,isFocus?colors.amber:colors.text,'left',true);
  }
  caption(c,'Biểu đồ thanh ngang: Thanh đang xét nổi bật màu cam, các thanh khác giữ màu xanh đồng nhất.');
  return;
 }
 if(v==='double'){
  const sx=240,sy=380,bw=28,gap=80;
  line(c,[sx-20,sy],[sx+4*gap+40,sy],colors.text,2);line(c,[sx-20,sy],[sx-20,sy-240],colors.text,2);
  for(let i=0;i<cats.length;i++){
   const x=sx+i*gap,h1=vals[i]*7.5,h2=other[i]*7.5;
   rect(c,x,sy-h1,bw,h1,colors.blue,colors.blue,1.5);
   rect(c,x+bw+2,sy-h2,bw,h2,colors.amber,colors.amber,1.5);
   fillText(c,cats[i],x+bw,sy+22,15,colors.text,'center',true);
  }
  rect(c,680,130,200,80,light?'#fff':'#1b3f52',colors.blue,1.5);
  rect(c,695,145,18,18,colors.blue);fillText(c,'Nhóm A',725,154,14,colors.text);
  rect(c,695,175,18,18,colors.amber);fillText(c,'Nhóm B',725,184,14,colors.text);
  caption(c,'Biểu đồ cột kép: Nhóm A màu xanh, Nhóm B màu cam đặt song song theo từng cặp.');
  return;
 }
 // Default: bar chart (cột đơn)
 const sx=260,sy=380,bw=48,gap=88;
 const maxVal=Math.max(...vals);
 const focusIdx=vals.indexOf(maxVal);
 line(c,[sx-30,sy],[sx+4*gap+20,sy],colors.text,2);line(c,[sx-30,sy],[sx-30,sy-240],colors.text,2);
 for(let i=0;i<cats.length;i++){
  const x=sx+i*gap,h=vals[i]*7.5,isFocus=i===focusIdx;
  rect(c,x,sy-h,bw,h,isFocus?colors.amber:colors.blue,isFocus?colors.amber:colors.blue,2);
  fillText(c,cats[i],x+bw/2,sy+22,16,isFocus?colors.amber:colors.text,'center',true);
  fillText(c,String(vals[i]),x+bw/2,sy-h-14,14,isFocus?colors.amber:colors.text,'center',true);
 }
 caption(c,'Biểu đồ cột đơn: Cột đang đọc (cao nhất) nhấn màu cam, các cột còn lại màu xanh đồng nhất.');
}

function drawChance(c,model,p,state){
 const v=model.variant,labels=outcomeLabels(v),n=v==='spinner'?Math.round(clamp(p.segments||6,2,11)):labels.length;
 const cx=450,cy=260;
 const counts=state.counts||[];
 const sum=counts.reduce((a,b)=>a+b,0);
 const time=state.time||0;
 const u=clamp(time/6000,0,1);
 const isSpinning=u>0&&u<1;
 const spinEase=isSpinning?1-Math.pow(1-u,3):1;
 const baseOut=Number.isInteger(state.lastOutcome)?state.lastOutcome%n:0;
 const winIdx=baseOut;
 const light=currentCanvasTheme==='light';

 if(v==='spinner'){
  let r=146;
  const targetPhase=-(winIdx+0.5)*(2*Math.PI/n);
  const phase=u<1?(targetPhase-(1-spinEase)*6*Math.PI):targetPhase;
  const sectorPalette=[colors.blue,colors.amber,colors.green,colors.teal];
  for(let i=0;i<n;i++){
   let a=-Math.PI/2+phase+i*2*Math.PI/n,b=-Math.PI/2+phase+(i+1)*2*Math.PI/n;
   const isWinner=!isSpinning&&i===winIdx;
   c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,isWinner?r+6:r,a,b);c.closePath();
   c.fillStyle=sectorPalette[i%4];c.fill();
   c.strokeStyle=isWinner?colors.purple:'#ffffff';c.lineWidth=isWinner?4.2:2;c.stroke();
   let t=(a+b)/2;fillText(c,labels[i%labels.length][0],cx+88*Math.cos(t),cy+88*Math.sin(t),20,'#ffffff','center',true);
  }
  poly(c,[[cx-13,cy-164],[cx+13,cy-164],[cx,cy-132]],colors.amber,colors.amber,1.5);circle(c,cx,cy,9,'#f0f9ff',colors.purple,2.5);
  fillText(c,isSpinning?'🔄 Đang quay giảm tốc...':`🎯 KẾT QUẢ DỪNG TẠI: "${labels[winIdx%labels.length]}"`,cx,58,16,isSpinning?colors.amber:colors.purple,'center',true);
 }else if(v==='dice'){
  const bounce=isSpinning?18*(1-u)*Math.abs(Math.sin(u*18)):0;
  const rollVal=isSpinning?Math.floor(u*24)%6+1:(winIdx%6)+1;
  rect(c,cx-108,cy-108-bounce,215,215,'#F8FAFC',colors.amber,5);
  let locations={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[-1,1],[1,-1],[1,1]],5:[[-1,-1],[-1,1],[0,0],[1,-1],[1,1]],6:[[-1,-1],[-1,0],[-1,1],[1,-1],[1,0],[1,1]]}[rollVal];
  for(const [x,y] of locations)circle(c,cx+63*x,cy-bounce+63*y,14,'#1E293B');
  fillText(c,isSpinning?'🎲 Xúc xắc đang lăn...':`🎯 KẾT QUẢ DỪNG TẠI MẶT: ${rollVal} CHẤM`,cx,58,16,colors.amber,'center',true);
 }else if(v==='bag'){
  const bagX=340,bagY=280;
  poly(c,[[bagX-88,bagY-105],[bagX+88,bagY-105],[bagX+136,bagY+115],[bagX-136,bagY+115]],light?'rgba(241,245,249,.9)':'rgba(226,241,248,.8)',colors.muted,4);
  fillText(c,'TÚI ĐỰNG BÓNG',bagX,bagY+85,15,colors.muted,'center',true);
  const pedX=660,pedY=320;
  rect(c,pedX-70,pedY,140,75,light?'#EDE9FE':'rgba(30,65,85,.6)',colors.purple,2);
  fillText(c,'BỤC QUAN SÁT',pedX,pedY+45,14,colors.purple,'center',true);

  const ballPalette=[colors.pink,colors.blue,colors.amber];
  for(let i=0;i<8;i++){
   if(i===winIdx&&u>0.3)continue;
   const a=i*2.2,r=15+(i%3)*25;
   circle(c,bagX+Math.cos(a)*r,bagY-20+Math.sin(a)*r,16,ballPalette[i%3],'#fff',1.5);
  }

  let ballX=bagX,ballY=bagY-20;
  if(u<=0.3){
   ballX=bagX;ballY=bagY-20;
  }else if(u<=0.7){
   const tRise=(u-0.3)/0.4;
   ballX=bagX;ballY=(bagY-20)-tRise*170;
  }else{
   const tArc=(u-0.7)/0.3;
   ballX=bagX+tArc*(pedX-bagX);
   ballY=(bagY-190)+Math.sin(tArc*Math.PI)*(-30)+tArc*(pedY-18-(bagY-190));
  }
  const winColor=ballPalette[winIdx%3];
  circle(c,ballX,ballY,u>=0.95?22:18,winColor,colors.purple,u>=0.95?4:2);
  if(u>=0.95){
   arrow(c,[ballX,ballY-55],[ballX,ballY-28],colors.purple,3.5);
   fillText(c,'BÓNG RÚT ĐƯỢC',ballX,ballY-68,15,colors.purple,'center',true);
  }
  const colorName=['Đỏ','Xanh','Vàng'][winIdx%3];
  fillText(c,u<0.3?'Đang chọn bóng trong túi...':u<0.95?'Đang rút bóng ra khỏi túi...':`🎯 ĐÃ RÚT ĐƯỢC BÓNG MÀU ${colorName.toUpperCase()} RA KHỎI TÚI!`,cx,58,16,u>=0.95?colors.purple:colors.amber,'center',true);
 }else if(v==='coin'){
  const flipPhase=isSpinning?u*14*Math.PI:0;
  const scaleX=isSpinning?Math.max(.1,Math.abs(Math.cos(flipPhase))):1;
  c.save();c.translate(cx,cy);c.scale(scaleX,1);
  circle(c,0,0,125,'#F8FAFC',isSpinning?colors.muted:colors.amber,7);circle(c,0,0,105,'#F1F5F9',colors.amber,2.5);
  const coinFace=isSpinning?(Math.cos(flipPhase)>=0?'N':'S'):(winIdx===0?'N':'S');
  fillText(c,coinFace,0,0,91,colors.amber,'center',true);
  c.restore();
  fillText(c,isSpinning?'🪙 Đồng xu đang quay...':`🎯 ĐÃ DỪNG: MẶT ${winIdx===0?'NGỬA (N)':'SẤP (S)'}`,cx,58,16,colors.amber,'center',true);
 }else if(v==='rps'){
  const emoji=['✊','✋','✌️'],name=['Búa','Bao','Kéo'];
  const p1=isSpinning?Math.floor(u*15)%3:winIdx%3;
  const p2=isSpinning?Math.floor(u*17+1)%3:(winIdx+1)%3;
  const p1Win=!isSpinning&&((p1===0&&p2===2)||(p1===1&&p2===0)||(p1===2&&p2===1));
  const p2Win=!isSpinning&&p1!==p2&&!p1Win;
  circle(c,cx-120,cy,58,light?'#F1F5F9':'#1e3a4c',p1Win?colors.amber:colors.muted,p1Win?4.5:2.5);
  fillText(c,emoji[p1],cx-120,cy,55,colors.text,'center');
  fillText(c,'Bạn: '+name[p1],cx-120,cy+82,16,p1Win?colors.amber:colors.text,'center',true);
  fillText(c,'VS',cx,cy,24,colors.muted,'center',true);
  circle(c,cx+120,cy,58,light?'#F1F5F9':'#1e3a4c',p2Win?colors.amber:colors.muted,p2Win?4.5:2.5);
  fillText(c,emoji[p2],cx+120,cy,55,colors.text,'center');
  fillText(c,'Máy: '+name[p2],cx+120,cy+82,16,p2Win?colors.amber:colors.text,'center',true);
  let resText='Hòa!';if(p1Win)resText='Bạn thắng! 🎉';else if(p2Win)resText='Máy thắng!';
  fillText(c,isSpinning?'✊ ✋ ✌️ Oẳn tù tì...':`🎯 KẾT QUẢ: ${resText}`,cx,58,16,colors.amber,'center',true);
 }
 let bx=245;fillText(c,`Số lần thử N = ${sum}`,bx,445,18,colors.amber,'left',true);
 for(let i=0;i<Math.min(labels.length,6);i++){let x=450+i*65;fillText(c,`${labels[i]}: ${counts[i]||0}`,x,465+(i%2)*24,12.5,colors.muted,'center',true);}
 caption(c,`Quan sát tần suất k/N sau ${sum} lần thử · Kết luận: Xác suất thực nghiệm f = k/N ổn định dần quanh 1/${n} khi N tăng lớn.`);
}

function drawReal(c,model,p,state){
 const v=model.variant,light=currentCanvasTheme==='light';
 let t=deg(p.rotation||0)+state.time*.002*clamp(p.speed||1,.2,8),cx=450,cy=270;
 if(v==='ferris'){
  const wheelCol=light?'#475569':'#94A3B8';
  let r=150;circle(c,cx,cy,r,'rgba(148,163,184,.08)',wheelCol,4);
  dashLine(c,[cx-r-20,cy],[cx+r+20,cy],colors.muted);
  for(let k=0;k<8;k++){
   const a=t+k*2*Math.PI/8,x=cx+r*Math.cos(a),y=cy+r*Math.sin(a);
   const isRef=k===0;
   line(c,[cx,cy],[x,y],isRef?colors.text:colors.muted,isRef?3:1.8);
   line(c,[x,y],[x,y+22],colors.muted,2.5);
   rect(c,x-17,y+22,34,19,isRef?(light?'#CBD5E1':'#64748B'):(light?'#F1F5F9':'#334155'),isRef?colors.text:colors.muted,isRef?2.5:1.5);
   if(isRef){dashLine(c,[x,y+41],[x,470],colors.muted);fillText(c,'A',x,y-14,14,colors.text,'center',true);}
  }
  const a0=((t%(Math.PI*2))+Math.PI*2)%(Math.PI*2),deg0=Math.round(a0*180/Math.PI),hCab=Math.max(0,Math.round((470-(cy+r*Math.sin(t)))/10));
  arc(c,cx,cy,44,0,a0,colors.text,2.5);dot(c,[cx,cy],'O',colors.text);
  fillText(c,`Góc quay α = ${deg0}° · Độ cao cabin A ≈ ${hCab} m`,460,64,17,colors.text,'center',true);
  line(c,[cx,cy],[cx-85,470],wheelCol,5);line(c,[cx,cy],[cx+85,470],wheelCol,5);line(c,[cx-130,470],[cx+130,470],colors.muted,4);
  caption(c,'Quan sát: Cabin A cách tâm O khoảng R không đổi · Kết luận: Độ cao cabin biến thiên tuần hoàn theo góc quay α.');
  return;
 }
 if(v==='roads'){
  poly(c,[[130,220],[795,220],[795,340],[130,340]],'#475569','#64748B',2);
  c.save();c.translate(cx,cy);c.rotate(t);rect(c,-340,-65,680,130,'#475569','#64748B',3);line(c,[-290,0],[290,0],'#CBD5E1',2.5,[18,17]);c.restore();
  line(c,[150,280],[790,280],'#CBD5E1',2.5,[18,18]);
  const degRoad=Math.round(((t*180/Math.PI)%180+180)%180);
  arc(c,cx,280,52,0,t,colors.amber,3.5);dot(c,[cx,280],'O',colors.amber);
  fillText(c,`Góc giao α = ${degRoad}° · Góc kề bù = ${180-degRoad}°`,460,64,18,colors.amber,'center',true);
  caption(c,'Quan sát giao điểm O · Kết luận: Hai tuyến đường cắt nhau tạo hai cặp góc đối đỉnh bằng nhau và hai góc kề bù tổng 180°.');
  return;
 }
 if(v==='card'){
  let fold=clamp(p.rotation||0,0,180),radF=deg(fold),dx=155*Math.cos(radF),dy=-32*Math.sin(radF);
  rect(c,cx-155,165,155,230,light?'#DBEAFE':'#2c5e8a',colors.blue,3);
  poly(c,[[cx,165],[cx+dx,165+dy],[cx+dx,395+dy],[cx,395]],light?'#FEF3C7':'#b46924',colors.amber,3);
  dashLine(c,[cx,140],[cx,418],colors.purple);
  dot(c,[cx-155,165],'A',colors.blue,[cx,165]);dot(c,[cx+dx,165+dy],Math.abs(fold-180)<3?"A' ≡ A":"A’",colors.amber,[cx,165]);
  fillText(c,'Trục đối xứng d (gáy thiệp)',cx,122,15,colors.purple,'center',true);
  fillText(c,`Góc gấp thiệp = ${Math.round(fold)}° ${Math.abs(fold-180)<3?'(Hai nửa thiệp chồng khít hoàn toàn!)':''}`,460,66,17,colors.purple,'center',true);
  caption(c,'Quan sát nếp gấp d · Kết luận: Khi gấp thiệp quanh trục đối xứng d (0° → 180°), hai nửa thiệp và hai đỉnh A, A’ chồng khít lên nhau.');
  return;
 }
 if(v==='cubes'){
  const n=Math.round(clamp(p.speed||4,2,8)),s=32,start=215;let total=0;
  for(let col=0;col<n;col++){
   const isLastCol=col===n-1;
   for(let row=0;row<=col;row++){
    let x=start+col*s,y=420-row*s;
    rect(c,x,y,s-2,s-2,isLastCol?colors.amber:colors.blue,'#183b4c',1);
    total++;
   }
   fillText(c,String(col+1),start+col*s+s/2,468,14,isLastCol?colors.amber:colors.muted,'center',true);
  }
  fillText(c,`Số khối: ${total}`,650,208,24,colors.purple,'center',true);
  fillText(c,`Tổng: 1 + 2 + … + ${n} = ${n}×${n+1}/2 = ${total}`,650,248,16,colors.blue,'center',true);
  caption(c,'Quan sát số khối từng cột 1, 2, …, n · Kết luận: Tổng số khối lập phương bằng n(n + 1)/2.');
  return;
 }
 let desk=state.time>0?Math.min(11,Math.floor(state.time/8000*12)):state.selectedDesk??2;
 rect(c,215,120,480,315,light?'#F8FAFC':'rgba(24,68,80,.4)',colors.muted,3);
 rect(c,235,172,440,18,light?'#FEF3C7':'rgba(251,184,77,.25)',colors.amber,1.2);
 rect(c,438,190,22,235,light?'#FEF3C7':'rgba(251,184,77,.25)',colors.amber,1.2);
 fillText(c,'BẢNG LỚP HỌC & LỐI ĐI (CAM NHẠT)',455,142,16,colors.amber,'center',true);
 for(let row=0;row<3;row++)for(let col=0;col<4;col++){
  let i=row*4+col,x=259+col*102,y=193+row*80;
  rect(c,x,y,72,53,i===desk?(light?'#FEF3C7':'rgba(250,175,81,.55)'):(light?'#E2E8F0':'#334155'),i===desk?colors.amber:colors.muted,i===desk?2.6:1.5);
  fillText(c,'Bàn '+(i+1),x+36,y+27,14,colors.text,'center',i===desk);
 }
 const selRow=Math.floor(desk/4)+1,selCol=(desk%4)+1;
 fillText(c,`Bàn ${desk+1}: Hàng ${selRow}, Cột ${selCol} · Tổng 3 × 4 = 12 bàn`,455,460,16,colors.amber,'center',true);
 caption(c,'Quan sát sơ đồ lưới 3×4 và lối đi · Kết luận: Mỗi vị trí bàn được xác định duy nhất bởi cặp chỉ số (Hàng, Cột).');
}

/** Entry point. The visual output uses only hand-built vector constructions. */
export function renderModel(ctx,model,state,options={}){
 if(!ctx||!model)throw new Error('Missing drawing context or model');
 const p=state.params||model.defaults||{};
 const paletteBefore={...colors},themeBefore=currentCanvasTheme;
 if(options?.theme==='light'){currentCanvasTheme='light';Object.assign(colors,lightColors);}
 ctx.save();
 try{
  drawGrid(ctx);labelTop(ctx,model.title);
  switch(model.engine){
   case 'polygon':drawPolygon(ctx,model,p,state);break;
   case 'composition':drawComposition(ctx,model,p);break;
   case 'tiling':drawTiling(ctx,model,p,state);break;
   case 'symmetry':drawSymmetry(ctx,model,p,state);break;
   case 'geometry':drawGeometry(ctx,model,p);break;
   case 'number':drawNumber(ctx,model,p,state);break;
   case 'venn':drawVenn(ctx,model,p,state);break;
   case 'fraction':drawFraction(ctx,model,p);break;
   case 'chart':drawChart(ctx,model,p);break;
   case 'chance':drawChance(ctx,model,p,state);break;
   case 'real':drawReal(ctx,model,p,state);break;
   default:throw new Error(`Unsupported engine ${model.engine}`);
  }
 }finally{
  ctx.restore();Object.assign(colors,paletteBefore);currentCanvasTheme=themeBefore;
 }
}
