/** Source-grounded vector diagrams for Grade 8 planar & 3D net experiments (R81 Deep Pedagogical & V2 Purposeful Color Patch). Viewbox 960 x 490. */
import {areaPoly,quad8,quad8Properties,thales8,bisector8,pythag8,homothety8,grade8Probability} from './grade8-engine.mjs';
import {TRIANGLE_CASES,initialTriangleParams,makeTrianglePair} from './triangle-engine.mjs';
import {formatMathText} from './math-formula-renderer.mjs';

const BLUE='#1D4ED8',TEAL='#15803D',GREEN='#15803D',ORANGE='#B45309',RED='#B91C1C',VIOLET='#6D28D9',SLATE='#475569',INK='#0F172A';
const n=x=>Number.isFinite(x)?Number(x.toFixed(2)):0;
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const line=(a,b,color=BLUE,w=3,d='')=>`<line x1="${n(a[0])}" y1="${n(a[1])}" x2="${n(b[0])}" y2="${n(b[1])}" stroke="${color}" stroke-width="${w}" ${d?`stroke-dasharray="${d}"`:''} stroke-linecap="round"/>`;
const rect=(x,y,w,h,fill='#eff8fc',stroke='#afc9d8',rx=0)=>`<rect x="${n(x)}" y="${n(y)}" width="${n(Math.max(0,w))}" height="${n(Math.max(0,h))}" ${rx?`rx="${rx}"`:''} fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
const circ=(x,y,r=6,c=ORANGE)=>`<circle cx="${n(x)}" cy="${n(y)}" r="${r}" fill="${c}" stroke="white" stroke-width="2"/>`;
const text=(x,y,s,c=INK,sz=18,anchor='')=>`<text x="${n(x)}" y="${n(y)}" ${anchor?`text-anchor="${anchor}"`:''} font-family="system-ui,Segoe UI,Arial,sans-serif" font-size="${sz}" font-weight="600" fill="${c}">${esc(formatMathText(s))}</text>`;
const polygon=(pts,fill='#37a0bc3b',stroke=BLUE,w=3)=>`<polygon points="${pts.map(a=>a.map(n).join(',')).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round"/>`;
const move=(a,b,f)=>[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f];
const dot=(pt,label,drag,dx=11,dy=-11)=>circ(...pt,8)+(drag?`<circle cx="${n(pt[0])}" cy="${n(pt[1])}" r="18" fill="transparent" data-pt="${label}" style="cursor:grab"/>`:'')+text(pt[0]+dx,pt[1]+dy,label,INK,16);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const ease=u=>{const z=clamp(u,0,1);return z*z*(3-2*z);};
const prog6=t=>ease(clamp(t/6,0,1));
const prog8=t=>ease(clamp(t/8,0,1));
const stage=(f,a,b)=>ease(clamp((f-a)/Math.max(1e-6,b-a),0,1));
const fmt=v=>Number.isFinite(v)?Number(v.toFixed(2)).toString():'—';

function frac8(x,y,num,den,rhs,color=BLUE,sz=16){
 const w=Math.max(num.length,den.length)*9.5+10,cx=x+w/2;
 return `<g aria-label="${esc(num+'/'+den+' '+rhs)}"><desc>${esc(num+'/'+den+' '+rhs)}</desc>`
  +`<text x="${n(cx)}" y="${n(y-7)}" text-anchor="middle" font-family="system-ui,Segoe UI,Arial,sans-serif" font-size="${sz}" font-weight="700" fill="${color}">${esc(num)}</text>`
  +`<line x1="${n(x)}" y1="${n(y-2)}" x2="${n(x+w)}" y2="${n(y-2)}" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>`
  +`<text x="${n(cx)}" y="${n(y+15)}" text-anchor="middle" font-family="system-ui,Segoe UI,Arial,sans-serif" font-size="${sz}" font-weight="700" fill="${color}">${esc(den)}</text>`
  +`<text x="${n(x+w+9)}" y="${n(y+4)}" font-family="system-ui,Segoe UI,Arial,sans-serif" font-size="${sz+1}" font-weight="600" fill="${color}">${esc(rhs)}</text></g>`;
}
function fracEq8(x,y,lhs,n1,d1,n2,d2,rhs,color=TEAL,sz=15){
 const lw=lhs?lhs.length*8.2+6:0,w1=Math.max(n1.length,d1.length)*9+10,w2=Math.max(n2.length,d2.length)*9+10;
 const x1=x+lw,cx1=x1+w1/2,eqX=x1+w1+10,x2=eqX+14,cx2=x2+w2/2,rx=x2+w2+8;
 return `<g><desc>${esc(`${lhs}${n1}/${d1} = ${n2}/${d2} ${rhs}`)}</desc>`
  +(lhs?`<text x="${n(x)}" y="${n(y+4)}" font-family="system-ui,Segoe UI,Arial,sans-serif" font-size="${sz}" font-weight="700" fill="${color}">${esc(lhs)}</text>`:'')
  +`<text x="${n(cx1)}" y="${n(y-7)}" text-anchor="middle" font-family="system-ui,Segoe UI,Arial,sans-serif" font-size="${sz}" font-weight="700" fill="${color}">${esc(n1)}</text>`
  +`<line x1="${n(x1)}" y1="${n(y-2)}" x2="${n(x1+w1)}" y2="${n(y-2)}" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`
  +`<text x="${n(cx1)}" y="${n(y+14)}" text-anchor="middle" font-family="system-ui,Segoe UI,Arial,sans-serif" font-size="${sz}" font-weight="700" fill="${color}">${esc(d1)}</text>`
  +`<text x="${n(eqX)}" y="${n(y+4)}" text-anchor="middle" font-family="system-ui,Segoe UI,Arial,sans-serif" font-size="${sz}" font-weight="700" fill="${color}">=</text>`
  +`<text x="${n(cx2)}" y="${n(y-7)}" text-anchor="middle" font-family="system-ui,Segoe UI,Arial,sans-serif" font-size="${sz}" font-weight="700" fill="${color}">${esc(n2)}</text>`
  +`<line x1="${n(x2)}" y1="${n(y-2)}" x2="${n(x2+w2)}" y2="${n(y-2)}" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`
  +`<text x="${n(cx2)}" y="${n(y+14)}" text-anchor="middle" font-family="system-ui,Segoe UI,Arial,sans-serif" font-size="${sz}" font-weight="700" fill="${color}">${esc(d2)}</text>`
  +`<text x="${n(rx)}" y="${n(y+4)}" font-family="system-ui,Segoe UI,Arial,sans-serif" font-size="${sz}" font-weight="700" fill="${color}">${esc(rhs)}</text></g>`;
}
function arc8(V,P1,P2,r=26,color=TEAL,label='',arcs=1,fillOp=0.18,tickMark=false){
 const a1=Math.atan2(P1[1]-V[1],P1[0]-V[0]),a2=Math.atan2(P2[1]-V[1],P2[0]-V[0]);
 let d=a2-a1;while(d<=-Math.PI)d+=Math.PI*2;while(d>Math.PI)d-=Math.PI*2;
 const sA=d>=0?a1:a2,eA=d>=0?a2:a1,span=Math.abs(d);
 const sx=V[0]+r*Math.cos(sA),sy=V[1]+r*Math.sin(sA),ex=V[0]+r*Math.cos(eA),ey=V[1]+r*Math.sin(eA);
 let out=`<path d="M ${n(V[0])} ${n(V[1])} L ${n(sx)} ${n(sy)} A ${r} ${r} 0 ${span>Math.PI?1:0} 1 ${n(ex)} ${n(ey)} Z" fill="${color}" fill-opacity="${fillOp}" stroke="none"/>`;
 for(let k=0;k<arcs;k++){
  const rk=r-k*4.5,x1=V[0]+rk*Math.cos(sA),y1=V[1]+rk*Math.sin(sA),x2=V[0]+rk*Math.cos(eA),y2=V[1]+rk*Math.sin(eA);
  out+=`<path d="M ${n(x1)} ${n(y1)} A ${n(rk)} ${n(rk)} 0 ${span>Math.PI?1:0} 1 ${n(x2)} ${n(y2)}" fill="none" stroke="${color}" stroke-width="2.2"/>`;
 }
 const mid=sA+span/2;
 if(tickMark){
  const r1=r-5,r2=r+5;
  out+=`<line x1="${n(V[0]+r1*Math.cos(mid))}" y1="${n(V[1]+r1*Math.sin(mid))}" x2="${n(V[0]+r2*Math.cos(mid))}" y2="${n(V[1]+r2*Math.sin(mid))}" stroke="${color}" stroke-width="2.4" stroke-linecap="round"/>`;
 }
 if(label){
  const lr=r+18;
  out+=`<text x="${n(V[0]+lr*Math.cos(mid))}" y="${n(V[1]+lr*Math.sin(mid)+4)}" text-anchor="middle" font-family="system-ui,Segoe UI,Arial,sans-serif" font-size="12.5" font-weight="800" fill="${color}" style="paint-order:stroke;stroke:#f7fbfd;stroke-width:3.5px;stroke-linejoin:round">${esc(label)}</text>`;
 }
 return out;
}
function right8(H,From,Along,sz=12,color=VIOLET){
 const ux=From[0]-H[0],uy=From[1]-H[1],ul=Math.hypot(ux,uy)||1;
 const vx=Along[0]-H[0],vy=Along[1]-H[1],vl=Math.hypot(vx,vy)||1;
 const p1=[H[0]+ux/ul*sz,H[1]+uy/ul*sz],p3=[H[0]+vx/vl*sz,H[1]+vy/vl*sz],p2=[p1[0]+vx/vl*sz,p1[1]+vy/vl*sz];
 return `<path d="M ${n(H[0])} ${n(H[1])} L ${n(p1[0])} ${n(p1[1])} L ${n(p2[0])} ${n(p2[1])} L ${n(p3[0])} ${n(p3[1])} Z" fill="${color}" fill-opacity="0.14" stroke="none"/>`
  +`<polyline points="${p1.map(n).join(',')} ${p2.map(n).join(',')} ${p3.map(n).join(',')}" fill="none" stroke="${color}" stroke-width="2.3"/>`;
}
function tick8(P1,P2,count=1,color=BLUE){
 const mx=(P1[0]+P2[0])/2,my=(P1[1]+P2[1])/2,dx=P2[0]-P1[0],dy=P2[1]-P1[1],len=Math.hypot(dx,dy)||1;
 const tx=dx/len,ty=dy/len,nx=-ty,ny=tx;
 let out='';
 for(let i=0;i<count;i++){
  const off=(i-(count-1)/2)*5.5,cx=mx+tx*off,cy=my+ty*off;
  out+=line([cx-nx*6,cy-ny*6],[cx+nx*6,cy+ny*6],color,2.2);
 }
 return out;
}
function parArrow8(P1,P2,color=TEAL){
 const mx=(P1[0]+P2[0])/2,my=(P1[1]+P2[1])/2,ang=Math.atan2(P2[1]-P1[1],P2[0]-P1[0]),c=Math.cos(ang),s=Math.sin(ang);
 const rot=(dx,dy)=>[mx+dx*c-dy*s,my+dx*s+dy*c];
 let out='';
 for(const off of [-3.5,3.5]){
  const q1=rot(off-6,-5),q2=rot(off,0),q3=rot(off-6,5);
  out+=`<polyline points="${q1.map(n).join(',')} ${q2.map(n).join(',')} ${q3.map(n).join(',')}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>`;
 }
 return out;
}
function dimH(x1,x2,y,lbl,col=INK){
 return line([x1,y],[x2,y],col,1.8)+line([x1,y-5],[x1,y+5],col,1.8)+line([x2,y-5],[x2,y+5],col,1.8)
  +`<text x="${n((x1+x2)/2)}" y="${n(y-7)}" text-anchor="middle" font-size="13" font-weight="700" fill="${col}">${esc(lbl)}</text>`;
}
function dimV(x,y1,y2,lbl,col=INK){
 return line([x,y1],[x,y2],col,1.8)+line([x-5,y1],[x+5,y1],col,1.8)+line([x-5,y2],[x+5,y2],col,1.8)
  +`<text x="${n(x-8)}" y="${n((y1+y2)/2+4)}" text-anchor="end" font-size="13" font-weight="700" fill="${col}">${esc(lbl)}</text>`;
}

function areaModels(id,p,t){
 const {a,b}=p,f=prog6(t);
 const v=p.identityVariant??0;
 const title=id==='8-01-C01'?(v===1?'Bình phương một hiệu: (a − b)² = a² − 2ab + b²':'Bình phương một tổng: (a + b)² = a² + 2ab + b²'):
 id==='8-01-C02'?'Hiệu hai bình phương: a² − b² = (a − b)(a + b)':[
  '(a + b)³ = a³ + 3a²b + 3ab² + b³',
  '(a − b)³ = a³ − 3a²b + 3ab² − b³',
  'a³ + b³ = (a + b)(a² − ab + b²)',
  'a³ − b³ = (a − b)(a² + ab + b²)'][v];
 let o=`<g opacity="0" pointer-events="none">${text(40,46,title,INK,21)}</g>`;
 if(id==='8-01-C01'){
  if(v===1){
   if(b>=a)return o+text(85,180,'Chọn a > b để cắt ghép diện tích (a−b)²',RED,23);
   const s=Math.min(54,240/a),x=115,y=114,A=a*s,B=b*s,ab=(a-b)*s,slide=22*f;
   o+=`<rect x="${n(x)}" y="${n(y)}" width="${n(A)}" height="${n(A)}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-dasharray="6 4"/>`;
   o+=dimH(x,x+ab,y-14,`a−b = ${fmt(a-b)}`,BLUE)+dimH(x+ab,x+A,y-14,`b = ${fmt(b)}`,ORANGE)+dimH(x,x+A,y-36,`Tổng cạnh lớn a = ${fmt(a)}`,INK);
   o+=dimV(x-12,y,y+ab,`a−b`,BLUE)+dimV(x-12,y+ab,y+A,`b`,ORANGE);
   o+=rect(x,y,ab,ab,'#DBEAFE',BLUE,6);
   o+=text(x+ab/2,y+ab/2-4,'(a − b)²',BLUE,17,'middle')+text(x+ab/2,y+ab/2+18,`= ${fmt((a-b)**2)}`,BLUE,15.5,'middle');
   o+=rect(x+ab+slide,y,B,ab,'#FEF3C7',ORANGE,4);
   if(B>26)o+=text(x+ab+slide+B/2,y+ab/2+4,`−ab`,ORANGE,13,'middle');
   o+=rect(x,y+ab+slide,ab,B,'#FEF3C7',ORANGE,4);
   if(B>24)o+=text(x+ab/2,y+ab+slide+B/2+5,`−ab`,ORANGE,13,'middle');
   o+=rect(x+ab+slide*1.25,y+ab+slide*1.25,B,B,'#EDE9FE',VIOLET,4);
   if(B>24)o+=text(x+ab+slide*1.25+B/2,y+ab+slide*1.25+B/2+5,`+b²`,VIOLET,13,'middle');
   // Right visual area balance panel
   o+=rect(470,96,440,295,'#ffffff','#cbd5e1',14);
   o+=text(494,132,'Đối chiếu & Bảo toàn diện tích (a − b)²',INK,17.5);
   o+=rect(494,152,390,40,'#DBEAFE',BLUE,8)+text(510,178,`Hình vuông lớn a² = ${fmt(a*a)}`,BLUE,15.5);
   o+=rect(494,204,390,40,'#FEF3C7',ORANGE,8)+text(510,230,`Bớt 2 dải chữ nhật (−2ab) = −${fmt(2*a*b)}`,ORANGE,15.5);
   o+=rect(494,256,390,40,'#EDE9FE',VIOLET,8)+text(510,282,`Cộng bù góc giao (+b²) = +${fmt(b*b)}`,VIOLET,15.5);
   o+=rect(494,312,390,56,'#DCFCE7',TEAL,10)+text(510,336,`(a − b)² = a² − 2ab + b² = ${fmt((a-b)**2)}`,TEAL,16.5)+text(510,356,`Tiến trình tách miền: ${Math.round(f*100)}% (giữ kết quả ở 100%)`,INK,13);
   o+=`<desc>• Kết luận: (a − b)² = a² − 2ab + b²</desc>`;
   return o;
  }
  const s=Math.min(48,236/(a+b)),x=115,y=114,A=a*s,B=b*s,gap=18*f;
  o+=`<rect x="${n(x-3)}" y="${n(y-3)}" width="${n(A+gap+B+6)}" height="${n(A+gap+B+6)}" rx="8" fill="none" stroke="${INK}" stroke-width="2.6"/>`;
  o+=dimH(x,x+A,y-14,`a = ${fmt(a)}`,BLUE)+dimH(x+A+gap,x+A+gap+B,y-14,`b = ${fmt(b)}`,VIOLET)+dimH(x,x+A+gap+B,y-36,`a + b = ${fmt(a+b)}`,INK);
  o+=dimV(x-12,y,y+A,`a = ${fmt(a)}`,BLUE)+dimV(x-12,y+A+gap,y+A+gap+B,`b = ${fmt(b)}`,VIOLET);
  o+=rect(x,y,A,A,'#DBEAFE',BLUE,6)+rect(x+A+gap,y,B,A,'#FEF3C7',ORANGE,6)+rect(x,y+A+gap,A,B,'#FEF3C7',ORANGE,6)+rect(x+A+gap,y+A+gap,B,B,'#EDE9FE',VIOLET,6);
  o+=text(x+A/2,y+A/2-4,`a²`,BLUE,16,'middle')+text(x+A/2,y+A/2+16,`= ${fmt(a*a)}`,BLUE,15,'middle');
  if(B>26){
   o+=text(x+A+gap+B/2,y+A/2+4,`ab=${fmt(a*b)}`,ORANGE,13,'middle');
   o+=text(x+A/2,y+A+gap+B/2+5,`ab=${fmt(a*b)}`,ORANGE,13,'middle');
   o+=text(x+A+gap+B/2,y+A+gap+B/2+5,`b²=${fmt(b*b)}`,VIOLET,12.5,'middle');
  }
  o+=rect(470,96,440,295,'#ffffff','#cbd5e1',14);
  o+=text(494,132,'Tổng hợp 4 miền diện tích của (a + b)²',INK,17.5);
  o+=rect(494,152,390,40,'#DBEAFE',BLUE,8)+text(510,178,`1 hình vuông cạnh a: a² = ${fmt(a*a)}`,BLUE,15.5);
  o+=rect(494,204,390,40,'#FEF3C7',ORANGE,8)+text(510,230,`2 hình chữ nhật a×b: 2ab = ${fmt(2*a*b)}`,ORANGE,15.5);
  o+=rect(494,256,390,40,'#EDE9FE',VIOLET,8)+text(510,282,`1 hình vuông cạnh b: b² = ${fmt(b*b)}`,VIOLET,15.5);
  o+=rect(494,312,390,56,'#DCFCE7',TEAL,10)+text(510,336,`(a + b)² = a² + 2ab + b² = ${fmt((a+b)**2)}`,TEAL,16.5)+text(510,356,`Tiến trình tách 4 miền: ${Math.round(f*100)}% (giữ ở 100%)`,INK,13);
  o+=`<desc>• Kết luận: (a + b)² = a² + 2ab + b²</desc>`;
  return o;
 }
 if(id==='8-01-C02'){
  if(b>=a)return o+text(85,180,'Cần a > b để cắt góc vuông cạnh b từ hình vuông cạnh a',RED,23);
  const sc=Math.min(35,192/(a+b)),A=a*sc,B=b*sc,ab=(a-b)*sc;
  const lx=82,ly=122;
  const fCut=stage(f,0,0.4),fJoin=stage(f,0.25,1);
  o+=`<desc>• Kết luận: a² − b² = (a − b)(a + b)</desc>`;
  o+=rect(32,52,400,322,'#ffffff','#d5e5ef',14)+rect(468,52,460,322,'#ffffff','#d5e5ef',14);
  o+=text(52,82,`Bước 1: Hình vuông a² (xanh) bớt góc b² (cam)`,BLUE,15.5);
  o+=dimH(lx,lx+A,ly-12,`a = ${fmt(a)}`,BLUE)+dimV(lx-10,ly,ly+ab,`a−b`,BLUE)+dimV(lx-10,ly+ab,ly+A,`b`,ORANGE);
  o+=rect(lx,ly,A,ab,'#DBEAFE',BLUE,4);
  o+=text(lx+A/2,ly+ab/2+5,`(1) a(a−b) = ${fmt(a*(a-b))}`,BLUE,13.5,'middle');
  o+=rect(lx,ly+ab+fCut*8,ab,B,'#DBEAFE',BLUE,4);
  if(B>20)o+=text(lx+ab/2,ly+ab+fCut*8+B/2+5,`(2) b(a−b)`,BLUE,12.5,'middle');
  o+=`<rect x="${n(lx+ab)}" y="${n(ly+ab)}" width="${n(B)}" height="${n(B)}" fill="#FEF3C7" stroke="${ORANGE}" stroke-width="2.2" stroke-dasharray="5 4"/>`;
  if(B>20)o+=text(lx+ab+B/2,ly+ab+B/2+5,`−b²`,ORANGE,12.5,'middle');

  // Arrow between Step 1 & Step 2
  o+=line([436,210],[462,210],VIOLET,3.5)+`<polygon points="460,204 470,210 460,216" fill="${VIOLET}"/>`;

  const rx=518,ry=142;
  o+=text(490,82,`Bước 2: Ghép thành hình chữ nhật (a+b)(a−b) (tím)`,VIOLET,15.5);
  o+=dimH(rx,rx+A,ry-12,`a = ${fmt(a)}`,BLUE)+dimH(rx+A,rx+A+B,ry-12,`b = ${fmt(b)}`,ORANGE)+dimH(rx,rx+A+B,ry-34,`Tổng chiều dài a + b = ${fmt(a+b)}`,VIOLET);
  o+=dimV(rx-10,ry,ry+ab,`a−b = ${fmt(a-b)}`,VIOLET);
  o+=rect(rx,ry,A,ab,'#DBEAFE',BLUE,4);
  o+=text(rx+A/2,ry+ab/2+5,`(1) a(a−b)`,BLUE,13.5,'middle');
  o+=`<rect x="${n(rx)}" y="${n(ry)}" width="${n(A+B)}" height="${n(ab)}" fill="none" stroke="${VIOLET}" stroke-width="2.6" stroke-dasharray="6 4"/>`;
  const p2x=rx+A*fJoin,p2y=ry+ab*(1-fJoin),p2w=ab*(1-fJoin)+B*fJoin,p2h=B*(1-fJoin)+ab*fJoin;
  o+=rect(p2x,p2y,p2w,p2h,'#EDE9FE',VIOLET,4);
  if(B>18)o+=text(p2x+p2w/2,p2y+p2h/2+5,`(2)`,VIOLET,13,'middle');
  // Bottom summary banner visible inside viewBox
  o+=rect(32,390,896,68,'#EDE9FE',VIOLET,12);
  o+=text(54,418,`✓ Bảo toàn diện tích: a² − b² = ${fmt(a*a)} − ${fmt(b*b)} = ${fmt(a*a-b*b)}   ⇔   (a − b)(a + b) = ${fmt(a-b)} × ${fmt(a+b)} = ${fmt((a-b)*(a+b))}`,VIOLET,16);
  o+=text(54,444,`Tiến trình cắt & ghép: ${Math.round(f*100)}% • Khi đạt 100%, mảnh (2) ghép khít với mảnh (1) tạo hình chữ nhật tím (a+b)×(a−b).`,INK,13.2);
  return o;
 }
 if(id==='8-01-C03'){
  // KEEP_DEEP & KEEP_COLOR with 1-way progression f = prog6(t)
  const lessonBadge=v<2?'[Bài 7 SGK]':'[Bài 8 SGK]';
  o+=`<desc>${lessonBadge} • Kết luận</desc>`;
  o+=rect(20,20,920,362,'#f8fafc','#cbd5e1',12);
  o+=text(40,48,'MÔ HÌNH THỂ TÍCH 3D (TÁCH KHỐI TỰ ĐỘNG 0% → 100%)',BLUE,13.5);
  const statusMsg=v<2?(f>0.08?`💥 TÁCH RỜI 8 KHỐI (${Math.round(f*100)}%) • GIỮ NGUYÊN Ở 100%`:'🧊 KHỐI HOÀN CHỈNH (a + b)³ • BẤM PHÁT ĐỂ TÁCH KHỐI'):'🧊 HAI KHỐI LẬP PHƯƠNG a³ VÀ b³ • ĐỐI CHIẾU NHÂN TỬ';
  o+=text(900,48,statusMsg,v<2&&f>0.08?ORANGE:TEAL,12.5,'end');

  if(v<2){
   const cx=480,cy=196;
   const sc=Math.min(26,112/(a+b||1));
   const A=a*sc,B=b*sc;
   const gap=6+22*f;
   const ox=(A+B+gap)/2,oy=(A+B+gap)/2,oz=(A+B+gap)/2;
   const pt3=(X,Y,Z)=>[cx+((X-ox)-(Z-oz))*0.866,cy+((X-ox)+(Z-oz))*0.5-(Y-oy)];
   const drawBlock=(x,y,z,dx,dy,dz,col,strokeCol,lbl='')=>{
    const top=[pt3(x,y+dy,z),pt3(x+dx,y+dy,z),pt3(x+dx,y+dy,z+dz),pt3(x,y+dy,z+dz)];
    const left=[pt3(x,y,z+dz),pt3(x+dx,y,z+dz),pt3(x+dx,y+dy,z+dz),pt3(x,y+dy,z+dz)];
    const right=[pt3(x+dx,y,z),pt3(x+dx,y,z+dz),pt3(x+dx,y+dy,z+dz),pt3(x+dx,y+dy,z)];
    const cTop=pt3(x+dx/2,y+dy,z+dz/2);
    let s=polygon(top,col+'55',strokeCol,2.2)+polygon(left,col+'88',strokeCol,2.2)+polygon(right,col+'cc',strokeCol,2.2);
    if(lbl){
     s+=`<text x="${n(cTop[0])}" y="${n(cTop[1]+4)}" text-anchor="middle" font-family="system-ui,Segoe UI,Arial,sans-serif" font-size="12.5" font-weight="800" fill="#ffffff" style="paint-order:stroke;stroke:${strokeCol};stroke-width:3px;stroke-linejoin:round">${esc(lbl)}</text>`;
    }
    return s;
   };
   o+=drawBlock(0,0,0,A,A,A,'#38bdf8',BLUE,'a³');
   o+=drawBlock(A+gap,0,0,B,A,A,'#2dd4bf',TEAL,'a²b');
   o+=drawBlock(0,A+gap,0,A,B,A,'#2dd4bf',TEAL,'a²b');
   o+=drawBlock(0,0,A+gap,A,A,B,'#2dd4bf',TEAL,'a²b');
   o+=drawBlock(A+gap,A+gap,0,B,B,A,'#fb923c',ORANGE,'ab²');
   o+=drawBlock(A+gap,0,A+gap,B,A,B,'#fb923c',ORANGE,'ab²');
   o+=drawBlock(0,A+gap,A+gap,A,B,B,'#fb923c',ORANGE,'ab²');
   o+=drawBlock(A+gap,A+gap,A+gap,B,B,B,'#c084fc','#7c3aed','b³');

   o+=rect(180,348,600,26,'#ffffff','#e2e8f0',8);
   o+=circ(215,361,5,BLUE)+text(226,365,'1 khối a³',BLUE,11.5);
   o+=circ(345,361,5,TEAL)+text(356,365,'3 khối a²b',TEAL,11.5);
   o+=circ(485,361,5,ORANGE)+text(496,365,'3 khối ab²',ORANGE,11.5);
   o+=circ(625,361,5,'#7c3aed')+text(636,365,'1 khối b³','#7c3aed',11.5);
  }else{
   const sc2=Math.min(32,130/(Math.max(a,b)+1));
   const A2=a*sc2,B2=b*sc2;
   const c1x=340-18*f,c2x=620+18*f,cy2=196;
   const p1=(X,Y,Z)=>[c1x+(X-Z)*0.866,cy2+(X+Z)*0.5-Y];
   const p2=(X,Y,Z)=>[c2x+(X-Z)*0.866,cy2+(X+Z)*0.5-Y];
   const drawSingle=(pFn,Asize,col,strokeCol,lbl)=>{
    const top=[pFn(0,Asize,0),pFn(Asize,Asize,0),pFn(Asize,Asize,Asize),pFn(0,Asize,Asize)];
    const left=[pFn(0,0,Asize),pFn(Asize,0,Asize),pFn(Asize,Asize,Asize),pFn(0,Asize,Asize)];
    const right=[pFn(Asize,0,0),pFn(Asize,0,Asize),pFn(Asize,Asize,Asize),pFn(Asize,Asize,0)];
    const cTop=pFn(Asize/2,Asize,Asize/2);
    let s=polygon(top,col+'55',strokeCol,2.2)+polygon(left,col+'88',strokeCol,2.2)+polygon(right,col+'cc',strokeCol,2.2);
    s+=`<text x="${n(cTop[0])}" y="${n(cTop[1]+4)}" text-anchor="middle" font-family="system-ui,Segoe UI,Arial,sans-serif" font-size="12.5" font-weight="800" fill="#ffffff" style="paint-order:stroke;stroke:${strokeCol};stroke-width:3px;stroke-linejoin:round">${esc(lbl)}</text>`;
    return s;
   };
   o+=drawSingle(p1,A2,'#38bdf8',BLUE,`a³ = ${fmt(a**3)}`);
   o+=drawSingle(p2,B2,v===2?'#2dd4bf':'#f87171',v===2?TEAL:RED,v===2?`b³ = ${fmt(b**3)}`:`−b³ = −${fmt(b**3)}`);
   o+=rect(220,348,520,26,'#ffffff','#e2e8f0',8);
   o+=circ(260,361,5,BLUE)+text(275,365,`Khối lập phương a³ (cạnh ${fmt(a)})`,BLUE,12);
   o+=circ(520,361,5,v===2?TEAL:RED)+text(535,365,`Khối lập phương b³ (cạnh ${fmt(b)})`,v===2?TEAL:RED,12);
  }
  o+=rect(20,392,920,84,'#ffffff','#cbd5e1',12);
  if(v===0){
   const lhs=(a+b)**3,t_a3=a**3,t_3a2b=3*a*a*b,t_3ab2=3*a*b*b,t_b3=b**3,rhs=t_a3+t_3a2b+t_3ab2+t_b3;
   o+=rect(32,400,240,68,'#f0fdf4','#86efac',8)+text(46,421,'VẾ TRÁI (VT) = (a + b)³','#166534',12)+text(46,447,`(${fmt(a)} + ${fmt(b)})³ =`,INK,14)+text(258,448,`${fmt(lhs)}`,TEAL,18,'end');
   o+=rect(284,400,420,68,'#f8fafc','#cbd5e1',8)+text(296,421,'VẾ PHẢI (VP) = a³ + 3a²b + 3ab² + b³',BLUE,12)+text(296,447,`${fmt(t_a3)} + ${fmt(t_3a2b)} + ${fmt(t_3ab2)} + ${fmt(t_b3)} =`,INK,13)+text(690,448,`${fmt(rhs)}`,BLUE,18,'end');
   o+=rect(716,400,212,68,'#ecfdf5','#0c8068',8)+text(728,422,`✓ KẾT LUẬN: VT = VP`,'#065f46',13.5)+text(728,442,`(a + b)³ luôn bằng VP`,INK,12)+text(728,458,`Nghiệm chứng số học chính xác`,'#047857',10.5);
  }else if(v===1){
   const lhs=(a-b)**3,t_a3=a**3,t_3a2b=3*a*a*b,t_3ab2=3*a*b*b,t_b3=b**3,rhs=t_a3-t_3a2b+t_3ab2-t_b3;
   o+=rect(32,400,240,68,'#f0fdf4','#86efac',8)+text(46,421,'VẾ TRÁI (VT) = (a − b)³','#166534',12)+text(46,447,`(${fmt(a)} − ${fmt(b)})³ =`,INK,14)+text(258,448,`${fmt(lhs)}`,TEAL,18,'end');
   o+=rect(284,400,420,68,'#f8fafc','#cbd5e1',8)+text(296,421,'VẾ PHẢI (VP) = a³ − 3a²b + 3ab² − b³',RED,12)+text(296,447,`${fmt(t_a3)} − ${fmt(t_3a2b)} + ${fmt(t_3ab2)} − ${fmt(t_b3)} =`,INK,13)+text(690,448,`${fmt(rhs)}`,BLUE,18,'end');
   o+=rect(716,400,212,68,'#ecfdf5','#0c8068',8)+text(728,422,`✓ KẾT LUẬN: VT = VP`,'#065f46',13.5)+text(728,442,`(a − b)³ luôn bằng VP`,INK,12)+text(728,458,`Nghiệm chứng số học chính xác`,'#047857',10.5);
  }else if(v===2){
   const lhs=a**3+b**3,factor1=a+b,factor2=a*a-a*b+b*b,rhs=factor1*factor2;
   o+=rect(32,400,240,68,'#f0fdf4','#86efac',8)+text(46,421,'VẾ TRÁI: a³ + b³','#166534',12)+text(46,447,`${fmt(a**3)} + ${fmt(b**3)} =`,INK,14)+text(258,448,`${fmt(lhs)}`,TEAL,18,'end');
   o+=rect(284,400,420,68,'#f0f9ff',BLUE,8)+text(296,421,'VẾ PHẢI: (a + b)(a² − ab + b²)',BLUE,12)+text(296,447,`(${fmt(factor1)}) × (${fmt(factor2)}) =`,INK,13)+text(690,448,`${fmt(rhs)}`,BLUE,18,'end');
   o+=rect(716,400,212,68,'#ecfdf5','#0c8068',8)+text(728,422,`✓ KẾT LUẬN: VT = VP`,'#065f46',13.5)+text(728,442,`Tích tổng với BP thiếu hiệu`,TEAL,12)+text(728,458,`a³ + b³ = (a + b)(a² − ab + b²)`,INK,10.5);
  }else{
   const lhs=a**3-b**3,factor1=a-b,factor2=a*a+a*b+b*b,rhs=factor1*factor2;
   o+=rect(32,400,240,68,'#f0fdf4','#86efac',8)+text(46,421,'VẾ TRÁI: a³ − b³','#166534',12)+text(46,447,`${fmt(a**3)} − ${fmt(b**3)} =`,INK,14)+text(258,448,`${fmt(lhs)}`,TEAL,18,'end');
   o+=rect(284,400,420,68,'#fff7ed',ORANGE,8)+text(296,421,'VẾ PHẢI: (a − b)(a² + ab + b²)',ORANGE,12)+text(296,447,`(${fmt(factor1)}) × (${fmt(factor2)}) =`,INK,13)+text(690,448,`${fmt(rhs)}`,ORANGE,18,'end');
   o+=rect(716,400,212,68,'#ecfdf5','#0c8068',8)+text(728,422,`✓ KẾT LUẬN: VT = VP`,'#065f46',13.5)+text(728,442,`Tích hiệu với BP thiếu tổng`,ORANGE,12)+text(728,458,`a³ − b³ = (a − b)(a² + ab + b²)`,INK,10.5);
  }
 }
 return o;
}

export function grade8QuadProjection(id,p){
 const pts=quad8(id,p),minx=Math.min(...pts.map(x=>x[0])),maxx=Math.max(...pts.map(x=>x[0])),maxy=Math.max(...pts.map(x=>x[1]));
 const scale=Math.min(50,360/(maxx-minx||1),265/(maxy||1));return {scale,offset:[300-(minx+maxx)/2*scale,388]};
}

function quadScene(id,p,t){
 const f=prog6(t);
 const m=quad8Properties(id,p),{scale,offset}=grade8QuadProjection(id,p);
 // For 8-02-C03 (Rectangle focus), animate straightening from a tilted parallelogram (skew = (1-f)*1.35) into a right-angled rectangle (skew = 0 at f = 1)!
 let rawPts=quad8(id,p);
 if(id==='8-02-C03'){
  const skew=(1-f)*1.35;
  rawPts=[[0,0],[p.a,0],[p.a+skew,p.h],[skew,p.h]];
 }
 const v=rawPts.map(pt=>[offset[0]+pt[0]*scale,offset[1]-pt[1]*scale]);
 const [A,B,C,D]=v,p0=move(A,C,0.5);
 let s=polygon(v,'#37a0bc29',BLUE,3.2);
 const names=['A','B','C','D'];

 if(id==='8-02-C01'){
  // Isosceles trapezoid: Two equal legs AD=BC (BLUE), two equal base angles (ORANGE), symmetry axis d (VIOLET dashed), bases AB/CD neutral SLATE
  const midAB=move(A,B,0.5),midCD=move(D,C,0.5);
  s=polygon(v,'#DBEAFE33','none',0)+line(A,B,SLATE,3.2)+line(D,C,SLATE,3.2)+line(A,D,BLUE,4)+line(B,C,BLUE,4);
  s+=line([midCD[0],midCD[1]-34],[midAB[0],midAB[1]+32],VIOLET,2.4,'7 5');
  s+=text(midCD[0]+10,midCD[1]-14,'Trục đối xứng d',VIOLET,14);
  s+=parArrow8(A,B,SLATE)+parArrow8(D,C,SLATE);
  s+=tick8(A,D,1,BLUE)+tick8(B,C,1,BLUE);
  s+=arc8(A,B,D,25,ORANGE,'',1,0.2,true)+arc8(B,C,A,25,ORANGE,'',1,0.2,true);
  s+=line(A,move(A,C,f),ORANGE,3)+line(B,move(B,D,f),VIOLET,2.8,'6 4');
  // Folding half-trapezoid across symmetry axis d
  const foldCos=Math.cos(f*Math.PI);
  const Bfold=[midAB[0]+(B[0]-midAB[0])*foldCos,B[1]],Cfold=[midCD[0]+(C[0]-midCD[0])*foldCos,C[1]];
  s+=polygon([midAB,Bfold,Cfold,midCD],'#6d28d918',VIOLET,1.8);
 }else if(id==='8-02-C02'){
  // Parallelogram: Two pairs of parallel opposite sides (AB=CD in BLUE, AD=BC in GREEN), diagonals AC (BLUE) & BD (ORANGE) bisecting at O
  const fSlide=stage(f,0,0.55),fDiag=stage(f,0.2,1);
  s=polygon(v,'#DBEAFE33','none',0)+line(A,B,BLUE,3.6)+line(D,C,BLUE,3.6)+line(A,D,GREEN,3.6)+line(B,C,GREEN,3.6);
  s+=parArrow8(A,B,BLUE)+parArrow8(D,C,BLUE)+parArrow8(A,D,GREEN)+parArrow8(B,C,GREEN);
  s+=tick8(A,B,1,BLUE)+tick8(D,C,1,BLUE)+tick8(A,D,2,GREEN)+tick8(B,C,2,GREEN);
  s+=arc8(A,B,D,24,VIOLET,'',1,0.18,true)+arc8(C,D,B,24,VIOLET,'',1,0.18,true);
  const slideL=move(A,D,fSlide),slideR=move(B,C,fSlide);
  s+=line(slideL,slideR,ORANGE,3.6,'6 4');
  s+=line(A,move(A,C,fDiag),BLUE,2.8)+line(B,move(B,D,fDiag),ORANGE,2.8);
  if(fDiag>0.45){
   s+=tick8(A,p0,1,BLUE)+tick8(p0,C,1,BLUE)+tick8(B,p0,2,ORANGE)+tick8(p0,D,2,ORANGE);
  }
 }else if(id==='8-02-C03'){
  // RECTANGLE FOCUS: Tilted parallelogram straightening to 90°, 4 purple right angles, 2 equal diagonals (BLUE/ORANGE), 4 equal half-diagonals OA=OB=OC=OD
  if(f<0.98){
   const ghost=[[0,0],[p.a,0],[p.a+1.35,p.h],[1.35,p.h]].map(pt=>[offset[0]+pt[0]*scale,offset[1]-pt[1]*scale]);
   s+=polygon(ghost,'none','#94a3b8',1.6);
  }
  s+=line(A,C,BLUE,3.2)+line(B,D,ORANGE,3.2);
  if(f>0.65){
   s+=right8(A,B,D,13,VIOLET)+right8(B,C,A,13,VIOLET)+right8(C,D,B,13,VIOLET)+right8(D,A,C,13,VIOLET);
   s+=tick8(A,p0,1,BLUE)+tick8(p0,C,1,BLUE)+tick8(B,p0,1,ORANGE)+tick8(p0,D,1,ORANGE);
  }else{
   const curDeg=Math.round(90-Math.atan2((1-f)*1.35,p.h)*180/Math.PI);
   s+=arc8(A,B,D,26,ORANGE,`${curDeg}°`,1,0.2);
  }
 }else if(id==='8-02-C04'){
  // Rhombus: 4 equal sides (BLUE), perpendicular diagonals AC (BLUE) ⊥ BD (ORANGE), purple right angle at O & bisector arcs
  s+=tick8(A,B,1,BLUE)+tick8(B,C,1,BLUE)+tick8(C,D,1,BLUE)+tick8(D,A,1,BLUE);
  s+=line(A,move(A,C,f),BLUE,3.2)+line(B,move(B,D,f),ORANGE,3.2);
  if(f>0.4){
   s+=right8(p0,A,B,13,VIOLET);
   s+=arc8(A,B,C,26,VIOLET,'',1,0.16,true)+arc8(A,C,D,31,VIOLET,'',1,0.16,true);
  }
 }else if(id==='8-02-C05'){
  // Square: 4 equal sides (BLUE), 4 vertex right angles + center right angle (VIOLET), two diagonals AC (ORANGE) and BD (GREEN)
  s+=tick8(A,B,1,BLUE)+tick8(B,C,1,BLUE)+tick8(C,D,1,BLUE)+tick8(D,A,1,BLUE);
  s+=right8(A,B,D,12,VIOLET)+right8(B,C,A,12,VIOLET)+right8(C,D,B,12,VIOLET)+right8(D,A,C,12,VIOLET);
  s+=line(A,move(A,C,f),ORANGE,3.2)+line(B,move(B,D,f),GREEN,3.2);
  if(f>0.35){
   s+=right8(p0,A,B,12,VIOLET);
   s+=tick8(A,p0,2,ORANGE)+tick8(p0,C,2,ORANGE)+tick8(B,p0,2,GREEN)+tick8(p0,D,2,GREEN);
  }
 }

 s+=circ(...p0,6.5,VIOLET)+dot(p0,'O',false,8,-12);
 const qOffsets=[[-24,20],[12,20],[12,-10],[-24,-10]];
 v.forEach((pt,i)=>s+=dot(pt,names[i],i===2,qOffsets[i][0],qOffsets[i][1]));

 // Visible inspection & diagonal comparison panel on the right (x = 545..925)
 s+=`<desc>• Kết luận</desc>`;
 s+=rect(545,62,380,350,'#ffffff','#cfe2ec',14);
 const acLive=Math.hypot(rawPts[2][0]-rawPts[0][0],rawPts[2][1]-rawPts[0][1]);
 const bdLive=Math.hypot(rawPts[3][0]-rawPts[1][0],rawPts[3][1]-rawPts[1][1]);
 const maxD=Math.max(acLive,bdLive,1),barW=245;
 s+=text(566,96,id==='8-02-C03'?'Đối chiếu 2 đường chéo khi chỉnh vuông góc':'Đối chiếu cạnh, góc & hai đường chéo',INK,16.5);
 s+=text(566,126,`AC = ${fmt(acLive)}`,BLUE,14.5)+rect(665,112,barW*(acLive/maxD),18,'#bae6fd',BLUE,5);
 s+=text(566,156,`BD = ${fmt(bdLive)}`,ORANGE,14.5)+rect(665,142,barW*(bdLive/maxD),18,'#fed7aa',ORANGE,5);
 s+=rect(566,176,338,40,'#f5f3ff',VIOLET,8)+text(580,201,`Diện tích S = ${fmt(m.area)}  •  AB = ${fmt(m.sides[0])}, BC = ${fmt(m.sides[1])}`,VIOLET,14.5);
 if(id==='8-02-C01'){
  s+=text(566,246,'• Đáy AB ∥ CD, hai cạnh bên AD = BC',BLUE,14.5);
  s+=text(566,276,'• Trục đối xứng d đi qua trung điểm 2 đáy',VIOLET,14.5);
  s+=text(566,306,'⇒ Hai góc kề 1 đáy bằng nhau; AC = BD',ORANGE,15);
 }else if(id==='8-02-C02'){
  s+=text(566,246,'• Cạnh đối AB = CD và AD = BC song song',BLUE,14.5);
  s+=text(566,276,'• Góc đối bằng nhau: ∠A = ∠C, ∠B = ∠D',VIOLET,14.5);
  s+=text(566,306,'⇒ Hai đường chéo cắt nhau tại trung điểm O',ORANGE,15);
 }else if(id==='8-02-C03'){
  s+=text(566,246,`• Bốn góc ở đỉnh: ∠A = ∠B = ∠C = ∠D = ${Math.round(90-(1-f)*20)}°`,VIOLET,14.5);
  s+=text(566,276,f>0.95?'✓ Đã khóa vuông 90° ⇒ Hai đường chéo AC = BD':'⏳ Đang dựng thẳng hình bình hành thành HCN...',f>0.95?TEAL:ORANGE,14.5);
  s+=text(566,306,'⇒ 4 nửa đường chéo bằng nhau: OA = OB = OC = OD',VIOLET,14.5);
 }else if(id==='8-02-C04'){
  s+=text(566,246,'• Bốn cạnh bằng nhau: AB = BC = CD = DA',BLUE,14.5);
  s+=text(566,276,'• Hai đường chéo vuông góc: AC ⊥ BD tại O',VIOLET,14.5);
  s+=text(566,306,'⇒ AC, BD là các đường phân giác các góc',ORANGE,15);
 }else{
  s+=text(566,246,'• 4 cạnh bằng nhau + 4 góc vuông 90° ở đỉnh',BLUE,14.5);
  s+=text(566,276,'• Hai đường chéo vừa bằng nhau vừa vuông góc',VIOLET,14.5);
  s+=text(566,306,'⇒ OA = OB = OC = OD và AC ⊥ BD tại O',ORANGE,15);
 }
 s+=rect(566,332,338,58,'#ecfdf5',TEAL,10)+text(580,356,`Tiến trình kiểm chứng: ${Math.round(f*100)}% (giữ ở 100%)`,TEAL,14)+text(580,378,'Kéo đỉnh C hoặc dùng thanh trượt để thay đổi hình.',INK,12.8);
 return s;
}


/** R92: specific construction for the midsegment, not another repeating slider.
 * D,E travel along AB,AC to their exact midpoints. DE is drawn afterwards;
 * only at completion do comparison markers and the conclusion appear. */
function midsegment8Scene(p,t){
 const f=prog6(t),m=thales8(p,{midline:true});
 const project=v=>[615+v[0]*48,407-v[1]*63];
 const A=project(m.A),B=project(m.B),C=project(m.C),D=project(m.D),E=project(m.E);
 const rise=clamp(f/.60,0,1),d=move(A,D,rise),e=move(A,E,rise);
 const draw=clamp((f-.58)/.28,0,1);
 let s=polygon([A,B,C],'#DBEAFE22',SLATE,2.3);
 s+=line(A,B,BLUE,3.2)+line(A,C,BLUE,3.2)+line(B,C,BLUE,3.2);
 if(f>.06){s+=line(A,d,ORANGE,3.6)+line(A,e,ORANGE,3.6);s+=circ(...d,6,ORANGE)+circ(...e,6,ORANGE);}
 if(f>.58){
  s+=line(D,move(D,E,draw),VIOLET,5.2);
  if(draw>.8){
   s+=tick8(A,D,1,ORANGE)+tick8(D,B,1,ORANGE);
   s+=tick8(A,E,2,GREEN)+tick8(E,C,2,GREEN);
   s+=parArrow8(D,E,VIOLET)+parArrow8(B,C,BLUE);
   s+=line(B,move(B,C,.5),GREEN,2.8);
  }
 }
 s+=dot(A,'A',false,-7,-15)+dot(B,'B',false,-24,10)+dot(C,'C',false,14,10);
 if(f>.2)s+=dot(d,'D',false,-19,-11)+dot(e,'E',false,10,-11);
 s+=rect(30,50,380,344,'#ffffff','#cfe2ec',13);
 s+=text(52,88,'Đường trung bình tam giác',INK,18);
 const phase=f<.60?'D và E đang tiến tới trung điểm':f<.86?'Nối D với E để được đường trung bình':'DE song song BC; độ dài DE bằng nửa BC';
 s+=text(52,130,'Pha '+(f<.60?'1':'2')+': '+phase,BLUE,13);
 s+=text(52,176,'AD = DB; AE = EC',ORANGE,15);
 s+=rect(52,192,285,12,'#e2e8f0','none',5);
 s+=rect(52,192,285*rise,12,ORANGE,'none',5);
 if(f>=.60){
  s+=text(52,248,'DE ∥ BC',VIOLET,18);
  s+=rect(52,270,285,12,'#ede9fe','none',5)+rect(52,270,285*draw,12,VIOLET,'none',5);
 }
 if(f>=.86){
  s+=text(52,330,'DE = ½ BC',GREEN,20);
  s+=text(52,362,'Giữ hình để HS kiểm tra bằng kéo điểm.',INK,12);
 }
 return s;
}

function thalesScene(id,p,t){
 if(id==='8-03-C03')return midsegment8Scene(p,t);
 const f=prog6(t);
 // Animate ratio u smoothly from 0.22 towards target p.u as f goes 0 -> 1, holding exact p.u at f = 1
 const uTarget=id==='8-03-C03'?0.5:p.u;
 const vTarget=id==='8-03-C03'?0.5:(id==='8-03-C02'?p.v:p.u);
 const uLive=0.22+(uTarget-0.22)*(0.35+0.65*f);
 const vLive=0.22+(vTarget-0.22)*(0.35+0.65*f);
 const m=thales8({...p,u:uLive,v:vLive},{reverse:id==='8-03-C02',midline:id==='8-03-C03'});
 const mFinal=thales8(p,{reverse:id==='8-03-C02',midline:id==='8-03-C03'});
 const cv=v=>[620+v[0]*52,404-v[1]*68],A=cv(m.A),B=cv(m.B),C=cv(m.C),D=cv(m.D),E=cv(m.E);
 let s=polygon([A,B,C],'#DBEAFE55',BLUE,2.8);
 if(id==='8-06-C07'){
  s+=polygon([A,D,E],'#EDE9FEAA',VIOLET,2.2);
 }
 if(id==='8-03-C01'||id==='8-06-C07'){
  s+=line(A,D,BLUE,5)+line(A,E,BLUE,5)+line(D,B,GREEN,4.5)+line(E,C,GREEN,4.5);
  s+=line(D,E,ORANGE,4.8)+line(B,C,BLUE,4)+parArrow8(D,E,ORANGE)+parArrow8(B,C,BLUE);
 }else if(id==='8-03-C02'){
  s+=line(A,D,BLUE,5)+line(A,E,ORANGE,5)+line(D,B,SLATE,3.2)+line(E,C,SLATE,3.2);
  const deCol=f<0.65?SLATE:(m.parallel?VIOLET:RED);
  s+=line(D,E,deCol,4.5)+line(B,C,SLATE,4);
  if(f>=0.65&&m.parallel){
   s+=parArrow8(D,E,VIOLET)+parArrow8(B,C,VIOLET);
  }
 }else{
  s+=line(A,B,SLATE,3.2)+line(A,C,SLATE,3.2);
  s+=tick8(A,D,1,ORANGE)+tick8(D,B,1,ORANGE)+tick8(A,E,2,ORANGE)+tick8(E,C,2,ORANGE);
  s+=line(D,E,BLUE,5)+line(B,C,VIOLET,4.5)+parArrow8(D,E,BLUE)+parArrow8(B,C,VIOLET);
  const midBC=move(B,C,0.5);
  s+=line(B,midBC,VIOLET,4.5)+circ(...midBC,5.5,VIOLET)+text((B[0]+midBC[0])/2,B[1]+26,'½ BC = DE',VIOLET,14,'middle');
 }
 if(m.parallel&&(id!=='8-03-C02'||f>=0.65)){
  s+=arc8(D,E,A,18,VIOLET,'',1,0.18,true)+arc8(B,C,A,22,VIOLET,'',1,0.18,true);
 }
 const vOff={A:[-6,-14],B:[-24,6],C:[14,6],D:[-26,4],E:[14,4]};
 for(const [key,pt] of Object.entries({A,B,C,D,E}))s+=dot(pt,key,id!=='8-03-C03'&&['D','E'].includes(key),vOff[key][0],vOff[key][1]);

 // Visible left ratio comparison card (x = 34..404)
 s+=`<desc>${mFinal.parallel?'DE ∥ BC • ∠ADE = ∠B, ∠AED = ∠C':'DE cắt BC'} • Kết luận</desc>`;
 s+=rect(34,52,374,368,'#ffffff','#cfe2ec',14);
 const cardTitle=id==='8-06-C07'?'ΔADE ∽ ΔABC (DE ∥ BC)':id==='8-03-C03'?'Đường trung bình DE':id==='8-03-C02'?'Định lí Thalès đảo':'Định lí Thalès thuận';
 s+=text(52,86,cardTitle,INK,18.5);
 s+=frac8(54,124,'AD','AB',`= ${fmt(mFinal.ratios[0])}`,BLUE,15.5);
 s+=rect(210,112,170,14,'#e2e8f0','none',6)+rect(210,112,170*clamp(m.ratios[0],0,1),14,BLUE,'none',6);
 s+=frac8(54,174,'AE','AC',`= ${fmt(mFinal.ratios[1])}`,ORANGE,15.5);
 s+=rect(210,162,170,14,'#e2e8f0','none',6)+rect(210,162,170*clamp(m.ratios[1],0,1),14,ORANGE,'none',6);
 s+=frac8(54,224,'DE','BC',`= ${fmt(mFinal.ratios[2])}`,VIOLET,15.5);
 s+=rect(210,212,170,14,'#e2e8f0','none',6)+rect(210,212,170*clamp(m.ratios[2],0,1),14,VIOLET,'none',6);
 s+=fracEq8(52,278,'','AD','AB','AE','AC',mFinal.parallel?'⇔ DE ∥ BC':'≠ (DE cắt BC)',mFinal.parallel?VIOLET:RED,15);
 if(id==='8-03-C03')s+=text(52,320,'AD = DB, AE = EC ⇒ DE ∥ BC và DE = ½BC',VIOLET,14.5);
 else if(id==='8-06-C07')s+=text(52,320,`DE ∥ BC ⇒ ΔADE ∽ ΔABC (k = ${fmt(mFinal.ratios[0])})`,VIOLET,14.5);
 else s+=text(52,320,mFinal.parallel?'✓ Hai tỉ số bằng nhau ⇒ DE song song BC':'✕ Hai tỉ số khác nhau ⇒ DE không song song BC',mFinal.parallel?TEAL:RED,14);
 s+=rect(52,342,338,58,'#f5f3ff',VIOLET,10)+text(66,366,`Tiến trình trượt cát tuyến: ${Math.round(f*100)}%`,VIOLET,13.5)+text(66,386,'Kéo điểm D, E trên cạnh để thử nghiệm trực tiếp.',INK,12.5);
 return s;
}

function bisectorScene(id,p,t){
 const m=bisector8(p),f=prog6(t);
 const tr=v=>[600+v[0]*46,402-v[1]*64],A=tr(m.A),B=tr(m.B),C=tr(m.C),D=tr(m.D);
 const angAB=Math.atan2(B[1]-A[1],B[0]-A[0]),angAC=Math.atan2(C[1]-A[1],C[0]-A[0]);
 const halfDeg=fmt(Math.abs(angAB-angAC)*90/Math.PI);
 let s=polygon([A,B,C],'#DBEAFE33',SLATE,2.6);
 // 8-04-C01 & C02: Two half-angles at A & bisector AD in ORANGE; segments BD (and AB) in BLUE, DC (and AC) in VIOLET
 s+=line(A,B,BLUE,4.2)+line(A,C,VIOLET,4.2)+line(B,D,BLUE,5)+line(D,C,VIOLET,5);
 s+=arc8(A,B,D,36,ORANGE,'',1,0.22,true)+arc8(A,D,C,42,ORANGE,'',1,0.22,true);
 s+=`<rect x="${n(A[0]-112)}" y="${n(A[1]+10)}" width="78" height="22" rx="6" fill="#FEF3C7" stroke="${ORANGE}" stroke-width="1.5"/>`
  +`<text x="${n(A[0]-73)}" y="${n(A[1]+25)}" text-anchor="middle" font-size="12" font-weight="800" fill="${ORANGE}">∠A₁=${halfDeg}°</text>`;
 s+=`<rect x="${n(A[0]+34)}" y="${n(A[1]+10)}" width="78" height="22" rx="6" fill="#FEF3C7" stroke="${ORANGE}" stroke-width="1.5"/>`
  +`<text x="${n(A[0]+73)}" y="${n(A[1]+25)}" text-anchor="middle" font-size="12" font-weight="800" fill="${ORANGE}">∠A₂=${halfDeg}°</text>`;
 const uM=0.25+0.55*f,M=move(A,D,uM),rayEnd=move(A,D,Math.max(0.25,f));
 const proj=(P,P1,P2)=>{const dx=P2[0]-P1[0],dy=P2[1]-P1[1],l2=dx*dx+dy*dy||1,u=((P[0]-P1[0])*dx+(P[1]-P1[1])*dy)/l2;return [P1[0]+u*dx,P1[1]+u*dy];};
 const H=proj(M,A,B),K=proj(M,A,C);
 s+=line(M,H,BLUE,2.2,'4 3')+line(M,K,VIOLET,2.2,'4 3');
 s+=right8(H,M,B,9,BLUE)+right8(K,M,C,9,VIOLET);
 s+=tick8(M,H,1,ORANGE)+tick8(M,K,1,ORANGE);
 s+=line(A,rayEnd,ORANGE,4.5)+circ(...M,6.5,ORANGE);
 s+=text((A[0]+B[0])/2-62,(A[1]+B[1])/2+8,`AB=${fmt(m.AB)}`,BLUE,15)+text((A[0]+C[0])/2+14,(A[1]+C[1])/2+8,`AC=${fmt(m.AC)}`,VIOLET,15);
 s+=text((B[0]+D[0])/2-28,B[1]+28,`BD=${fmt(m.BD)}`,BLUE,15)+text((D[0]+C[0])/2-12,C[1]+28,`DC=${fmt(m.DC)}`,VIOLET,15);
 const bOff={A:[-6,-14],B:[-24,6],C:[14,6],D:[-6,24]};
 for(const [k,pt] of Object.entries({A,B,C,D}))s+=dot(pt,k,false,bOff[k][0],bOff[k][1]);

 // Visible left ratio comparison card
 s+=`<desc>AD là đường phân giác góc A • BD/DC = AB/AC = ${fmt(m.ratio)}</desc>`;
 s+=rect(34,52,368,360,'#ffffff','#cfe2ec',14);
 s+=text(52,86,'Tính chất đường phân giác AD',INK,18.5);
 s+=text(52,116,`∠BAD = ∠CAD = ${halfDeg}° (khoảng cách MH = MK)`,VIOLET,14);
 s+=frac8(54,158,'AB','AC',`= ${fmt(m.ratio)}`,BLUE,15.5);
 s+=frac8(54,208,'BD','DC',`= ${fmt(m.BD/m.DC)}`,ORANGE,15.5);
 const totS=m.AB+m.AC,wBar=310,wL=wBar*(m.AB/totS),wR=wBar-wL;
 s+=text(52,248,'Thanh đối chiếu tỉ lệ AB : AC và BD : DC:',INK,13);
 s+=rect(52,256,wL,14,'#bae6fd',BLUE,4)+rect(52+wL,256,wR,14,'#fed7aa',ORANGE,4);
 s+=rect(52,276,wL*f,14,'#bae6fd',BLUE,4)+rect(52+wL*f,276,wR*f,14,'#fed7aa',ORANGE,4);
 s+=fracEq8(52,322,'','BD','DC','AB','AC',`= ${fmt(m.ratio)}`,VIOLET,15);
 if(id==='8-04-C02'){
  const u=p.u;const E=move(m.A,m.B,u),F=move(m.A,m.C,u);
  s+=line(tr(E),tr(F),VIOLET,3.8,'7 5')+dot(tr(E),'E',false,-22,4)+dot(tr(F),'F',false,12,4);
 }
 return s;
}

function squareGrid8(pts,steps,col){
 const [P0,P1,P2,P3]=pts;
 const k=Math.min(7,Math.max(2,Math.round(steps)));
 let g='';
 for(let i=1;i<k;i++){
  const u=i/k;
  g+=line(move(P0,P1,u),move(P3,P2,u),col,0.9,'3 3');
  g+=line(move(P0,P3,u),move(P1,P2,u),col,0.9,'3 3');
 }
 return g;
}

function pythagScene(id,p,t){
 const reverse=id==='8-05-C02',ladder=id==='8-05-C03',m=pythag8(p,reverse),f=prog6(t);
 if(ladder){
  const sc=Math.min(48,240/Math.max(p.a,p.b,3.5));
  const A=[165,392],B=[165,392-p.b*sc],C=[165+p.a*sc,392];
  let s=`<desc>• Kết luận: BC² = AB² + AC²</desc>`;
  // Wall & Ground visual context
  s+=rect(135,B[1]-8,30,A[1]-B[1]+8,'#e2e8f0','#64748b',4);
  s+=line([110,A[1]],[480,A[1]],'#475569',3);
  s+=polygon([A,B,C],'#eff6ff88',BLUE,2.2)+right8(A,B,C,15,VIOLET)+arc8(C,B,A,32,VIOLET,'α',1,0.2);
  s+=line(A,B,BLUE,7)+line(A,C,BLUE,5);
  // Ladder / indirect hypotenuse BC in focus ORANGE growing from B to C
  const hypEnd=move(B,C,f);
  s+=line(B,C,'#fed7aa',4,'6 4')+line(B,hypEnd,ORANGE,7.5);
  s+=dot(A,'A',false,-24,20)+dot(B,'B',false,-24,-8)+dot(C,'C',false,12,20);
  s+=text(A[0]-62,(A[1]+B[1])/2,`Cao b = ${fmt(p.b)}`,BLUE,15)+text((A[0]+C[0])/2,A[1]+26,`Đáy a = ${fmt(p.a)}`,BLUE,15,'middle');
  s+=text((B[0]+C[0])/2+22,(B[1]+C[1])/2-8,`BC = ${fmt(m.c)}`,ORANGE,16.5);
  s+=rect(520,76,400,320,'#ffffff','#cfe2ec',14);
  s+=text(544,114,'Đo gián tiếp chiều dài cạnh huyền BC',INK,18);
  s+=rect(544,134,352,42,'#eff6ff',BLUE,8)+text(560,160,`Hai cạnh góc vuông đã biết: a = ${fmt(p.a)}, b = ${fmt(p.b)}`,BLUE,15);
  s+=rect(544,190,352,42,'#f5f3ff',VIOLET,8)+text(560,216,`Góc vuông tại chân tường: ∠BAC = 90°`,VIOLET,15);
  s+=rect(544,246,352,52,'#fff7ed',ORANGE,8)+text(560,270,`Cạnh huyền cần tìm: BC = √(a² + b²)`,ORANGE,15.5)+text(560,290,`BC = √(${fmt(p.a*p.a)} + ${fmt(p.b*p.b)}) = ${fmt(m.c)}`,ORANGE,16.5);
  s+=rect(544,314,352,60,'#ecfdf5',TEAL,10)+text(560,338,`• Kết luận: ∠BAC = 90° ⇒ BC² = AB² + AC²`,TEAL,14.5)+text(560,360,`Tiến trình dựng đường ngắm/thang: ${Math.round(f*100)}%`,INK,13);
  return s;
 }
 if(!m.valid)return text(85,145,'Ba cạnh đã nhập không lập được tam giác',RED,22);
 const size=Math.min(35,215/(p.a+p.b)),A=[246,304],B=[246+p.a*size,304],angle=m.angle*Math.PI/180,C=[246+p.b*size*Math.cos(angle),304-p.b*size*Math.sin(angle)];
 let s=`<desc>• Kết luận: BC² = AB² + AC²</desc>`+polygon([A,B,C],'#d1edf7',BLUE,2.6);
 if(m.right)s+=right8(A,B,C,14,VIOLET);
 else s+=arc8(A,B,C,30,RED,`${fmt(m.angle)}°`,1,0.22);
 s+=line(A,B,BLUE,4)+line(A,C,ORANGE,4)+line(B,C,VIOLET,4.2);
 s+=dot(A,'A',false,-22,14)+dot(B,'B',false,12,14)+dot(C,'C',false,-6,-14);

 if(!reverse){
  // 8-05-C01: Sequential construction of 3 squares (a^2 BLUE, b^2 ORANGE, c^2 VIOLET) with unit grids + Area Dissection Equivalence Box
  const f1=stage(f,0,0.38),f2=stage(f,0.18,0.62),f3=stage(f,0.42,0.85),fJoin=stage(f,0.52,1);
  const vAB=[0,p.a*size*f1],vAC=[-p.b*size*Math.sin(angle)*f2,-p.b*size*Math.cos(angle)*f2],vBC=[(B[1]-C[1])*f3,(C[0]-B[0])*f3];
  const sqAB=[A,B,[B[0]+vAB[0],B[1]+vAB[1]],[A[0]+vAB[0],A[1]+vAB[1]]];
  const sqAC=[A,C,[C[0]+vAC[0],C[1]+vAC[1]],[A[0]+vAC[0],A[1]+vAC[1]]];
  const sqBC=[B,C,[C[0]+vBC[0],C[1]+vBC[1]],[B[0]+vBC[0],B[1]+vBC[1]]];
  s+=polygon(sqAB,'#bae6fd99',BLUE,2.2)+(f1>0.3?squareGrid8(sqAB,p.a,BLUE)+text((sqAB[0][0]+sqAB[2][0])/2,(sqAB[0][1]+sqAB[2][1])/2+5,`a²=${fmt(p.a*p.a)}`,BLUE,13.5,'middle'):'');
  s+=polygon(sqAC,'#fed7aa99',ORANGE,2.2)+(f2>0.3?squareGrid8(sqAC,p.b,ORANGE)+text((sqAC[0][0]+sqAC[2][0])/2,(sqAC[0][1]+sqAC[2][1])/2+5,`b²=${fmt(p.b*p.b)}`,ORANGE,13.5,'middle'):'');
  s+=polygon(sqBC,'#ddd6fe99',VIOLET,2.4)+(f3>0.3?squareGrid8(sqBC,m.c,VIOLET)+text((sqBC[0][0]+sqBC[2][0])/2,(sqBC[0][1]+sqBC[2][1])/2+5,`c²=${fmt(m.c*m.c)}`,VIOLET,14,'middle'):'');

  // Right Area Dissection & Equivalence Container (x = 535..925)
  const a2=p.a*p.a,b2=p.b*p.b,c2=m.c*m.c,wTot=336,wA=wTot*(a2/c2),wB=wTot-wA;
  s+=rect(535,62,390,356,'#ffffff','#cfe2ec',14);
  s+=text(558,96,'Ghép diện tích trực quan: a² + b² = c²',INK,17.5);
  const ySrc=122,yDst=214,yCur=ySrc+(yDst-ySrc)*fJoin;
  // Ghost source slots
  s+=`<rect x="558" y="${ySrc}" width="${n(wA-4)}" height="34" rx="6" fill="none" stroke="${BLUE}" stroke-dasharray="4 3"/>`;
  s+=`<rect x="${n(558+wA+4)}" y="${ySrc}" width="${n(wB-4)}" height="34" rx="6" fill="none" stroke="${ORANGE}" stroke-dasharray="4 3"/>`;
  // Target c^2 frame
  s+=`<rect x="558" y="${yDst}" width="${wTot}" height="40" rx="8" fill="#f5f3ff" stroke="${VIOLET}" stroke-width="2.4" stroke-dasharray="6 3"/>`;
  // Moving area blocks a^2 (BLUE) and b^2 (ORANGE)
  s+=rect(558,yCur,wA,36,'#bae6fd',BLUE,6)+text(558+wA/2,yCur+23,`S₁ = a² = ${fmt(a2)}`,BLUE,13,'middle');
  s+=rect(558+wA+(1-fJoin)*6,yCur,wB,36,'#fed7aa',ORANGE,6)+text(558+wA+(1-fJoin)*6+wB/2,yCur+23,`S₂ = b² = ${fmt(b2)}`,ORANGE,13,'middle');
  s+=text(558+wTot/2,yDst+62,`Khung diện tích đích S₃ = c² = ${fmt(c2)} (khớp 100%)`,VIOLET,14.5,'middle');
  s+=rect(558,296,wTot,46,'#f5f3ff',VIOLET,8)+text(574,325,`a² + b² = ${fmt(a2)} + ${fmt(b2)} = ${fmt(c2)} = c²`,VIOLET,16.5);
  s+=rect(558,352,wTot,48,'#ecfdf5',TEAL,8)+text(574,381,`Tiến trình dựng 3 hình vuông & ghép diện tích: ${Math.round(f*100)}%`,TEAL,13.5);
 }else{
  // 8-05-C02: Converse of Pythagoras — Area comparison bars a^2 + b^2 vs c^2 & right-angle lock
  const vAB=[0,p.a*size*0.55*f],vAC=[-p.b*size*Math.sin(angle)*0.55*f,-p.b*size*Math.cos(angle)*0.55*f];
  s+=polygon([A,B,[B[0]+vAB[0],B[1]+vAB[1]],[A[0]+vAB[0],A[1]+vAB[1]]],'#bae6fd66',BLUE,1.8);
  s+=polygon([A,C,[C[0]+vAC[0],C[1]+vAC[1]],[A[0]+vAC[0],A[1]+vAC[1]]],'#fed7aa66',ORANGE,1.8);
  const a2=p.a*p.a,b2=p.b*p.b,c2=p.c*p.c,sumAB=a2+b2,maxA=Math.max(sumAB,c2,1),wScale=330/maxA;
  const wA=a2*wScale*f,wB=b2*wScale*f,wC=c2*wScale*f;
  s+=rect(535,62,390,356,'#ffffff','#cfe2ec',14);
  s+=text(558,96,'Định lí Pythagore đảo: So sánh a² + b² và c²',INK,17);
  s+=text(558,128,`Tổng diện tích 2 cạnh góc: a² + b² = ${fmt(a2)} + ${fmt(b2)} = ${fmt(sumAB)}`,INK,14);
  s+=rect(558,138,wA,24,'#bae6fd',BLUE,4)+rect(558+wA,138,wB,24,'#fed7aa',ORANGE,4);
  s+=text(558,192,`Diện tích cạnh đối diện c: c² = ${fmt(c2)}`,VIOLET,14);
  s+=rect(558,202,wC,24,'#ddd6fe',VIOLET,4);
  if(!m.right&&f>0.3){
   const xMin=558+Math.min(wA+wB,wC),wDiff=Math.abs(wA+wB-wC);
   s+=`<rect x="${n(xMin)}" y="134" width="${n(Math.max(5,wDiff))}" height="96" rx="4" fill="#fee2e288" stroke="${RED}" stroke-width="1.8" stroke-dasharray="4 3"/>`;
   s+=text(xMin+wDiff/2,248,`Độ lệch |a²+b²−c²| = ${fmt(Math.abs(sumAB-c2))}`,RED,13,'middle');
  }
  s+=rect(558,266,342,56,m.right?'#f5f3ff':'#fef2f2',m.right?VIOLET:RED,8);
  s+=text(574,292,m.right?'✓ a² + b² = c² ⇒ Khóa góc vuông ∠A = 90°':`✕ a² + b² ≠ c² ⇒ ∠A ≈ ${fmt(m.angle)}° ≠ 90°`,m.right?VIOLET:RED,15.5);
  s+=text(574,312,m.right?'Kết luận: ΔABC là tam giác vuông tại A':'Kết luận: ΔABC KHÔNG phải tam giác vuông',m.right?TEAL:RED,14);
  s+=rect(558,336,342,60,'#ecfdf5',TEAL,8)+text(574,362,'Bấm "⚠ Thử sai định lí đảo" hoặc chỉnh thanh trượt',INK,13)+text(574,382,'để kiểm chứng cả trường hợp đúng và phản ví dụ.',TEAL,13);
 }
 return s;
}

function triangleSimilarityScene8(id,p,t){
 const f=prog6(t);
 const baseParams={...initialTriangleParams(id),...(p||{})};
 const pair=makeTrianglePair(id,baseParams,{perturb:false});
 const {first,second,check,k}=pair;
 const m=check.first,mm=check.second;
 const maxdim=Math.max(m.AB,m.AC,m.BC,mm.AB,mm.AC,mm.BC,6);
 const scale=Math.min(58,230/maxdim,195/Math.max(first.C[1],second.C[1],2));
 const leftAnchor=[110,368],rightAnchor=[545,368];
 const CASE_SPECS={
  '8-06-C01':{sides:{AB:BLUE,AC:ORANGE,BC:GREEN},angles:{},badge:'Đồng dạng (c.c.c): 3 cặp cạnh tương ứng tỉ lệ A′B′/AB (xanh) = A′C′/AC (cam) = B′C′/BC (xanh lá) = k'},
  '8-06-C02':{sides:{AB:BLUE,AC:ORANGE},angles:{A:VIOLET},badge:'Đồng dạng (c.g.c): 2 cặp cạnh tỉ lệ A′B′/AB (xanh) = A′C′/AC (cam) = k và góc xen giữa ∠A = ∠A′ (tím)'},
  '8-06-C03':{sides:{},angles:{A:BLUE,B:ORANGE},badge:'Đồng dạng (g.g): 2 cặp góc tương ứng bằng nhau ∠A = ∠A′ (xanh) và ∠B = ∠B′ (cam)'},
  '8-06-C04':{sides:{},angles:{A_right:VIOLET,B:ORANGE},badge:'Tam giác vuông đồng dạng (góc nhọn): ∠A = ∠A′ = 90° (tím) và cặp góc nhọn ∠B = ∠B′ (cam)'},
  '8-06-C05':{sides:{AB:BLUE,AC:ORANGE},angles:{A_right:VIOLET},badge:'Tam giác vuông đồng dạng (2 cạnh góc vuông): ∠A = ∠A′ = 90° (tím) và A′B′/AB (xanh) = A′C′/AC (cam) = k'},
  '8-06-C06':{sides:{BC:BLUE,AB:ORANGE},angles:{A_right:VIOLET},badge:'Tam giác vuông đồng dạng (cạnh huyền – cạnh góc vuông): ∠A = ∠A′ = 90° (tím), huyền B′C′/BC (xanh) = A′B′/AB (cam) = k'}
 };
 const spec=CASE_SPECS[id]||CASE_SPECS['8-06-C01'];
 const toScr=(coords,anc)=>Object.fromEntries(Object.entries(coords).map(([nm,pt])=>[nm,[anc[0]+pt[0]*scale,anc[1]-pt[1]*scale]]));
 const fMove=stage(f,0,0.68),fScale=stage(f,0.62,1.0);
 const P1=toScr(first,leftAnchor),curAnchor=move(rightAnchor,leftAnchor,fMove),P2=toScr(second,curAnchor),P2Ghost=toScr(second,rightAnchor);

 let s=`<desc>${spec.badge} • Kết luận: △ABC ∽ △A′B′C′ (tỉ số k = ${fmt(k)})</desc>`;
 s+=rect(32,26,896,38,'#EDE9FE',VIOLET,10)+text(480,51,spec.badge,VIOLET,14.5,'middle');
 if(f>0.05){
  s+=polygon([P2Ghost.A,P2Ghost.B,P2Ghost.C],'none','#94a3b8',1.6);
  if(fMove>0.7){
   s+=line(P1.A,P2.B,VIOLET,1.8,'5 4')+line(P1.A,P2.C,VIOLET,1.8,'5 4')+circ(P1.A[0],P1.A[1],6,VIOLET);
  }
 }
 const drawT=(P,isSecond,prime)=>{
  const baseBorder=isSecond?VIOLET:BLUE;
  let g=polygon([P.A,P.B,P.C],isSecond?'#EDE9FE44':'#DBEAFE38',baseBorder,2.4);
  if(spec.angles.A_right)g+=right8(P.A,P.B,P.C,14,spec.angles.A_right);
  if(spec.angles.A)g+=arc8(P.A,P.B,P.C,26,spec.angles.A,'',1,0.22,true);
  if(spec.angles.B)g+=arc8(P.B,P.C,P.A,26,spec.angles.B,'',2,0.22);
  for(const [a,b,sKey,tk] of [['A','B','AB',1],['A','C','AC',2],['B','C','BC',3]]){
   const col=spec.sides[sKey];
   g+=line(P[a],P[b],col||SLATE,col?4.4:2.2,col?'':'6 4');
   if(col)g+=tick8(P[a],P[b],tk,col);
  }
  for(const nm of ['A','B','C'])g+=dot(P[nm],nm+prime,false,-6,nm==='C'?-12:22);
  return g;
 };
 s+=drawT(P1,false,'')+drawT(P2,true,'′');
 if(fScale>0.05){
  const kScale=1+(1/k-1)*fScale;
  const PScaled={
   A:P1.A,
   B:[P1.A[0]+(P2.B[0]-P1.A[0])*kScale,P1.A[1]+(P2.B[1]-P1.A[1])*kScale],
   C:[P1.A[0]+(P2.C[0]-P1.A[0])*kScale,P1.A[1]+(P2.C[1]-P1.A[1])*kScale]
  };
  s+=polygon([PScaled.A,PScaled.B,PScaled.C],'none',VIOLET,2.6);
 }
 s+=rect(32,408,896,52,'#DCFCE7',GREEN,10)+text(480,440,`✓ Tỉ số đồng dạng k = A′B′/AB = ${fmt(check.ratio)}   •   Tỉ số diện tích S′/S = k² = ${fmt(check.areaRatio)}   •   Tiến trình vị tự & chồng hình: ${Math.round(f*100)}%`,GREEN,15,'middle');
 return s;
}

function similarityScene(id,p,t){
 if(TRIANGLE_CASES[id])return triangleSimilarityScene8(id,p,t);
 const f=prog6(t);
 if(id==='8-06-C07')return thalesScene('8-06-C07',p,t);
 if(id==='8-06-C08'){
  const O=[96,422],A=[[258,376],[386,374],[302,244]];
  const kLive=1+(p.k-1)*f;
  const BTarget=A.map(x=>homothety8(O,x,p.k));
  const BLive=A.map(x=>homothety8(O,x,kLive));
  let s=`<desc>Hình đồng dạng qua phép vị tự tâm O • Kết luận</desc>`;
  s+=polygon(BTarget,'none','#94a3b8',1.6);
  for(let i=0;i<3;i++)s+=line(O,BTarget[i],VIOLET,2.2,'7 5');
  s+=polygon(A,'#DBEAFE88',BLUE,3)+polygon(BLive,'#F1F5F9AA',SLATE,3)+circ(...O,9,ORANGE)+dot(O,'O',false,-22,6);
  for(let i=0;i<3;i++){
   s+=circ(...A[i],6,BLUE)+text(A[i][0]-8,A[i][1]-12,['A','B','C'][i],INK,15);
   s+=circ(...BLive[i],6,SLATE)+text(BLive[i][0]+8,BLive[i][1]-12,["A′","B′","C′"][i],INK,15);
  }
  s+=rect(520,66,405,340,'#ffffff','#cfe2ec',14);
  s+=text(542,102,'Hình đồng dạng phối cảnh (Tâm vị tự O cam)',INK,17.5);
  s+=fracEq8(542,150,'','OA′','OA','OB′','OB',`= k = ${fmt(p.k)}`,VIOLET,15.5);
  s+=frac8(542,204,'S′','S',`= k² = ${fmt(p.k**2)}`,ORANGE,15.5);
  s+=rect(542,248,360,64,'#EDE9FE',VIOLET,8)+text(558,274,`• Ba điểm O, A, A′ thẳng hàng trên tia vị tự (tím đứt)`,VIOLET,14)+text(558,298,`• Cạnh tương ứng song song và tỉ lệ k = ${fmt(p.k)}`,BLUE,14);
  s+=rect(542,326,360,58,'#FEF3C7',ORANGE,8)+text(558,352,`Tâm vị tự O (cam) · Tỉ số k(t) = ${fmt(kLive)} → ${fmt(p.k)}`,ORANGE,14)+text(558,372,`Tiến trình phóng-thu từ tâm O: ${Math.round(f*100)}%`,INK,13);
  return s;
 }
 const x=95,y=190,w=p.a*Math.min(40,280/(p.a*Math.max(1,p.k))),h=p.h*Math.min(36,195/(p.h*Math.max(1,p.k))),sc=1+(p.k-1)*f;
 const shiftX=445*f;
 const r1=[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
 const r2=[[x+shiftX,y-14*f],[x+shiftX+w*sc,y-14*f],[x+shiftX+w*sc,y-14*f+h*sc],[x+shiftX,y-14*f+h*sc]];
 const r2Final=[[x+445,y-14],[x+445+w*p.k,y-14],[x+445+w*p.k,y-14+h*p.k],[x+445,y-14+h*p.k]];
 let s=`<desc>• Kết luận: P′/P = k, S′/S = k²</desc>`+polygon(r2Final,'none','#94a3b8',1.6)+polygon(r1,'#DBEAFEAA',BLUE,3)+polygon(r2,'#FEF3C7BB',ORANGE,3.2);
 s+=right8(r1[0],r1[1],r1[3],11,BLUE)+right8(r2[0],r2[1],r2[3],11,ORANGE);
 s+=text(x,158,`Hình gốc F (${fmt(p.a)}×${fmt(p.h)})`,BLUE,17.5)+text(540,145,`Hình ảnh đồng dạng F′ (${fmt(p.a*p.k)}×${fmt(p.h*p.k)})`,ORANGE,17.5);
 s+=text(x,424,`S = ${fmt(p.a*p.h)}`,BLUE,18)+fracEq8(450,420,'','P′','P','k','1',`  |  S′/S = k² = ${fmt(p.k*p.k)}`,ORANGE,15.5);
 return s;
}

function chartScene(id,p,t){
 const data=[p.n1,p.n2,p.n3,p.n4],second=data.map((x,i)=>clamp(x+(i===1?p.delta??0:i%2?-2:2),0,30)),f=.35+.65*prog8(t);
 const kind=id==='8-08-C01'?Math.max(0,Math.min(2,Math.floor(p.chartKind||0))):0;
 const catCols=[BLUE,ORANGE,GREEN,VIOLET],catFills=['#DBEAFE','#FEF3C7','#DCFCE7','#EDE9FE'];
 if(kind===2){
  const sum=data.reduce((a,b)=>a+b,0),r=170*f,cx=370,cy=250;let angle=-Math.PI/2;
  let s=text(56,62,'Biểu đồ quạt tròn: số liệu và phần trăm',INK,23)+text(600,100,'Tỉ lệ các nhóm (đồng màu bảng)',INK,19);
  if(sum===0)return s+text(80,195,'Tổng bằng 0: không xác định tỉ lệ quạt tròn.',RED,23);
  data.forEach((v,i)=>{if(v===0){s+=text(610,154+i*62,`Nhóm ${'ABCD'[i]}: 0%`,INK,18);return;}
   const da=2*Math.PI*v/sum,theta=angle+da;const xy=a=>[cx+r*Math.cos(a),cy+r*Math.sin(a)],A=xy(angle),B=xy(theta);
   s+=`<path d="M ${n(cx)} ${n(cy)} L ${n(A[0])} ${n(A[1])} A ${n(r)} ${n(r)} 0 ${da>Math.PI?1:0} 1 ${n(B[0])} ${n(B[1])} Z" fill="${catFills[i]}" stroke="${catCols[i]}" stroke-width="2.6"/>`;
   const mid=(angle+theta)/2,px=cx+r*.69*Math.cos(mid),py=cy+r*.69*Math.sin(mid);
   if(v/sum>.06)s+=text(px-18,py+5,`${fmt(100*v/sum)}%`,catCols[i],15);
   s+=`<rect x="590" y="${132+i*62}" width="22" height="22" rx="4" fill="${catFills[i]}" stroke="${catCols[i]}" stroke-width="2"/>`+text(619,151+i*62,`Nhóm ${'ABCD'[i]}: ${v} (${fmt(100*v/sum)}%)`,catCols[i],18);angle=theta;
  });
  s+=text(610,415,`Tổng số liệu = ${sum}`,GREEN,19)+text(56,442,'• Kết luận: Biểu đồ quạt tròn dùng khi cần thể hiện cơ cấu tỉ lệ phần trăm (tổng = 100%)',INK,14);
  return s;
 }
 let s=line([85,395],[845,395],SLATE,2)+line([85,395],[85,75],SLATE,2);
 for(let j=0;j<=5;j++){const y=395-j*56;s+=line([85,y],[830,y],'#cbd5e1',1,'4 5')+text(44,y+5,String(j*5),SLATE,14);}
 if(id==='8-08-C01'){
  data.forEach((v,i)=>{
   const bx=100+i*104;
   s+=rect(bx,34,96,30,catFills[i],catCols[i],6)+text(bx+48,54,`${'ABCD'[i]}: ${v}`,catCols[i],13.5,'middle');
  });
 }
 const mean=data.reduce((a,b)=>a+b,0)/4,yMean=395-mean*11.2*f;
 s+=line([85,yMean],[830,yMean],VIOLET,2.2,'7 5')+text(828,yMean-7,`Trung bình = ${fmt(mean)}`,VIOLET,13.5,'end');
 if(kind===1){
  const pts=data.map((v,i)=>[190+i*163,395-v*11.2*f]);
  s+=`<polyline points="${pts.map(p=>p.map(n).join(',')).join(' ')}" fill="none" stroke="${BLUE}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  pts.forEach((pt,i)=>{s+=circ(...pt,8,catCols[i])+text(pt[0]-10,pt[1]-17,String(data[i]),catCols[i],18)+text(pt[0]-6,421,'ABCD'[i],catCols[i],19);
  s+=`<circle cx="${n(pt[0])}" cy="${n(pt[1])}" r="18" fill="transparent" data-pt="P${i}" style="cursor:grab"/>`;});
  s+=text(520,70,'Biểu đồ đoạn thẳng: theo dõi xu hướng tăng / giảm',INK,18)+text(85,446,'• Kết luận: Chọn biểu đồ đoạn thẳng khi cần biểu diễn xu hướng thay đổi theo thời gian',GREEN,14);
  return s;
 }
 data.forEach((v,i)=>{
  const x=150+i*168,y=395-v*11.2*f;
  const cFill=id==='8-08-C01'?catFills[i]:'#DBEAFE',cStroke=id==='8-08-C01'?catCols[i]:BLUE;
  s+=rect(x,y,65,395-y,cFill,cStroke,4)+text(x+22,y-10,String(v),cStroke,17)+text(x+24,421,'ABCD'[i],id==='8-08-C01'?cStroke:INK,19);
  if(id==='8-08-C02'){
   const w=second[i],yy=395-w*11.2*f;
   s+=rect(x+69,yy,45,395-yy,'#FEF3C7',ORANGE,4)+text(x+80,yy-10,String(w),ORANGE,17);
   const yTop=Math.min(y,yy),yBot=Math.max(y,yy);
   if(Math.abs(v-w)>0&&f>0.5){
    s+=line([x+67,yTop],[x+67,yBot],VIOLET,3)+text(x+67,yTop-26,`Δ=${w-v>0?'+'+(w-v):w-v}`,VIOLET,12.5,'middle');
   }
  }
  s+=`<circle cx="${x+32}" cy="${n(y)}" r="18" fill="transparent" data-pt="P${i}" style="cursor:grab"/>`;
 });
 s+=text(540,70,id==='8-08-C01'?'Biểu đồ cột từ bảng số liệu':'So sánh hai nhóm (xanh / cam) & chênh lệch Δ (tím)',INK,17.5);
 if(id==='8-08-C02')s+=text(85,446,'• Kết luận: Biểu đồ cột kép đối chiếu nhóm 1 (xanh), nhóm 2 (cam) và độ lệch Δ (tím)',VIOLET,14)+text(685,446,'Xanh: nhóm 1 · Cam: nhóm 2',INK,15);
 else s+=text(85,446,'• Kết luận: Mỗi loại dữ liệu giữ nguyên màu từ bảng sang cột biểu đồ',BLUE,14);
 return s;
}

function probabilityScene(id,p,t){
 const clampedT=clamp(t,0,6);
 const cyclePos = ((clampedT % 4) + 4) % 4;
 const isSpinning = clampedT > 0.001 && clampedT < 5.95 && cyclePos < 2.0;
 const isStopped = clampedT > 0.001 && !isSpinning;
 const cycleIndex = Math.floor(clampedT / 4);
 const effT = clampedT <= 0.001 ? 0 : isSpinning ? (cycleIndex * 2 + cyclePos) : ((cycleIndex + 1) * 2);
 const z=grade8Probability(id,p,Math.min(6,effT*1.5)),rate=x=>fmt(100*x)+'%',f=prog6(t);
 if(id==='8-08-C04'){
  let s=text(50,60,'Chọn ngẫu nhiên 1 bóng từ hộp',INK,23)+rect(115,110,510,280,'#f7fbfd','#6ea0bc',12);
  const total=p.red+p.blue;
  const picked=isSpinning?((Math.imul(Math.floor(clampedT*8)+1,2654435761)>>>0)%total):((Math.imul(cycleIndex+1,2654435761)>>>0)%total),isRed=picked<p.red;
  for(let i=0;i<total;i++){
   const col=i<p.red?'#ed7775':'#61a9da',x=163+(i%6)*80,y=170+Math.floor(i/6)*73;
   if(isStopped&&i===picked)s+=circ(x,y,26,'#fde68a',ORANGE);
   s+=circ(x,y,20,col)+text(x-11,y+6,String(i+1),'white',15);
  }
  s+=circ(isSpinning?385+40*Math.sin(clampedT*5):385,isSpinning?92-12*f:82,16,isRed?'#ed7775':'#61a9da');
  s+=text(635,369,isSpinning?`⏳ Đang rút... Minh họa rút bóng số ${picked+1}: ${isRed?'đỏ':'xanh'}`:`🎯 ĐÃ DỪNG: Minh họa rút bóng số ${picked+1}: ${isRed?'đỏ':'xanh'}`,isRed?RED:BLUE,15);
  s+=text(685,163,`Bóng đỏ: ${p.red}`,RED,21)+text(685,205,`Bóng xanh: ${p.blue}`,BLUE,21);
  s+=text(685,262,`P(đỏ) = ${p.red}/${total}`,VIOLET,21)+text(685,304,`= ${rate(z.theoretical)}`,VIOLET,24);
  s+=rect(685,320,190*z.theoretical*f,12,'#ddd6fe',VIOLET,4);
  return s+text(57,442,'• Quan sát: Mỗi bóng đồng khả năng ⇒ Kết luận: P(đỏ) = số bóng đỏ / tổng số bóng = '+p.red+'/'+total,INK,15);
 }
 if(id==='8-08-C03'){
  const last=z.outcomes.at(-1),count=z.successes,nroll=z.count,scope=Number(p.lessonScope||30);
  const favFaces=Array.from({length:Math.max(1,Math.min(6,Math.round(p.k)))},(_,i)=>i+1).join(', ');
  let s=text(48,58,scope===30?'[Bài 30] Gieo xúc xắc: mặt thuận lợi (xanh), không thuận lợi (xám), mặt ra (cam)':'[Bài 31] Xúc xắc cân đối: mặt thuận lợi (xanh), mặt ra (viền cam)',INK,20.5);
  for(let i=1;i<=6;i++){
   const x=99+(i-1)*135,y=130,ok=i<=p.k,isLast=!isSpinning&&i===last;
   s+=rect(x,y,102,102,isLast?'#FEF3C7':ok?'#DBEAFE':'#F1F5F9',isLast?ORANGE:ok?BLUE:SLATE,10);s+=text(x+40,y+62,String(i),isLast?ORANGE:ok?BLUE:SLATE,34);
   s+=text(x+18,256,isLast?'🎯 Mặt ra (cam)':ok?'Thuận lợi (xanh)':'Không TL',isLast?ORANGE:ok?BLUE:SLATE,12.5);
  }
  s+=text(88,317,isSpinning?`⏳ Đang gieo xúc xắc... (dừng sau ${(2-cyclePos).toFixed(1)}s)`:`🎯 ĐÃ DỪNG: Kết quả dừng tại mặt ${last} (cam) · Tổng ${nroll}/${Math.floor(p.trials)} lượt`,isStopped?ORANGE:INK,19);
  if(scope===30){
   s+=text(88,368,`Tập kết quả thuận lợi (xanh): {${favFaces}} → k = ${p.k} kết quả thuận lợi / 6 kết quả có thể`,BLUE,20);
   s+=text(88,417,`• Kết luận: Kết quả thuận lợi cho biến cố là các mặt xanh thuộc tập con {${favFaces}} của Ω`,BLUE,16.5);
  }else{
   s+=text(88,370,`Tần số thành công: ${count}/${nroll} = ${rate(z.relative)}`,BLUE,21);
   s+=text(88,419,`• Kết luận: Xác suất lý thuyết P(A) = k/6 = ${p.k}/6 = ${rate(z.theoretical)}`,VIOLET,19);
  }
  return s;
 }
 const nroll=z.count,values=z.outcomes,chunk=Math.max(1,Math.floor(nroll/60)),points=[];
 for(let i=0,head=0;i<values.length;i++){
  if(values[i]===1)head++;
  if(i%chunk===0||i===values.length-1)points.push([93+(i+1)/Math.floor(p.trials)*770,403-head/(i+1)*270]);
 }
 const lastCoin=values.length?values[values.length-1]:1;
 let s=text(50,56,'Tung đồng xu: tần suất thực nghiệm (xanh) hội tụ về mốc 50% (cam đứt)',INK,20.5)+rect(93,133,775,270,'#f8fafc','#cbd5e1',8);
 const barH=270*z.relative;
 s+=rect(818,403-barH,36,barH,'#DBEAFE',BLUE,4);
 s+=line([93,268],[868,268],ORANGE,3.2,'9 6');
 if(points.length>1)s+=`<polyline fill="none" stroke="${BLUE}" stroke-width="3.6" stroke-linejoin="round" points="${points.map(pt=>pt.map(n).join(',')).join(' ')}"/>`;
 if(points.length)s+=circ(...points.at(-1),6.5,BLUE);
 s+=text(65,142,'1,0',SLATE,14)+text(52,273,'P=50%',ORANGE,13.5)+text(65,404,'0,0',SLATE,14);
 s+=text(93,104,isSpinning?`⏳ Đang tung đồng xu...`:`🎯 ĐÃ DỪNG: Mặt ${lastCoin===1?'Ngửa (N)':'Sấp (S)'} • Độ lệch |f − 0,5| = ${fmt(Math.abs(z.relative-0.5))}`,isSpinning?ORANGE:BLUE,16.5);
 s+=text(93,438,`Số phép thử N = ${nroll}/${Math.floor(p.trials)} · Kết luận: Khi N lớn, tần suất thực nghiệm (xanh) tiến gần mốc 50% (cam)`,INK,15.5);
 s+=text(595,104,`f_ngửa = ${rate(z.relative)}`,BLUE,20);
 return s;
}

export function grade8SVGScene(id,p,t=0){
 if(!id||!/^(8)-(0[1-9])-C\d{2}$/.test(id)||!Number.isFinite(t))throw Error('Mã hoặc thời gian không hợp lệ');
 let body='';const fam=id.slice(0,4);
 if(fam==='8-01')body=areaModels(id,p,t);
 else if(fam==='8-02')body=quadScene(id,p,t);
 else if(fam==='8-03')body=thalesScene(id,p,t);
 else if(fam==='8-04')body=bisectorScene(id,p,t);
 else if(fam==='8-05')body=pythagScene(id,p,t);
 else if(fam==='8-06')body=similarityScene(id,p,t);
 else if(fam==='8-08')body=['8-08-C03','8-08-C04','8-08-C05'].includes(id)?probabilityScene(id,p,t):chartScene(id,p,t);
 else throw Error('Lab này phải mở bằng trình xem 3D hoặc công cụ đồ thị');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 490" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Hình học động Toán 8 ${id}" style="width:100%;height:100%;display:block;max-height:490px;touch-action:none"><rect x="0" y="0" width="960" height="490" fill="#f7fbfd" rx="18"/><rect x="20" y="15" width="920" height="455" rx="14" fill="none" stroke="#e0ecf2" stroke-width="2"/>${body}</svg>`;
}

export function grade8NetSVG(id,p,t=0){
 if(!id.startsWith('8-09'))throw Error('Chỉ có hình chóp mới có hình khai triển');
 const isTri=id==='8-09-C01'||(id==='8-09-C03'&&Number(p?.pyramidBaseSides)===3);
 const k=clamp(t,0,1),u=0.25+0.75*k;
 const rIn=isTri?p.a*Math.sqrt(3)/6:p.a/2;
 const rOut=isTri?p.a*Math.sqrt(3)/3:p.a*Math.SQRT1_2;
 const apothemReal=Math.hypot(p.h,rIn),latEdge=Math.hypot(p.h,rOut);
 const wrap=body=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 510" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Sơ đồ 2D khối chóp ${id}" style="display:block;width:100%;height:100%;max-height:100%;touch-action:none"><rect width="650" height="510" rx="14" fill="#f7fbfd"/>${body}</svg>`;

 if(id==='8-09-C01'){
  const sc=Math.min(42,195/Math.max(p.a,p.h,1));
  const R=rOut*sc,rI=rIn*sc,H=p.h*sc*u;
  const cx1=170,cy1=270;
  const pts=[[-Math.PI/2],[Math.PI/6],[5*Math.PI/6]].map(([ang])=>[cx1+R*Math.cos(ang),cy1+R*Math.sin(ang)]);
  const I=[(pts[1][0]+pts[2][0])/2,(pts[1][1]+pts[2][1])/2];
  let s=polygon(pts,'#DBEAFE',BLUE,2.8);
  s+=line(pts[0],I,SLATE,2,'5 4')+line([cx1,cy1],I,ORANGE,3.2)+line([cx1,cy1],pts[0],BLUE,2.6,'4 3');
  s+=right8(I,pts[1],pts[0],9,VIOLET);
  s+=circ(cx1,cy1,6,VIOLET)+text(cx1+10,cy1-6,'O (Trọng tâm)',VIOLET,12.5);
  s+=circ(pts[0][0],pts[0][1],5,BLUE)+text(pts[0][0]-6,pts[0][1]-12,'A',BLUE,13.5);
  s+=circ(pts[1][0],pts[1][1],5,BLUE)+text(pts[1][0]+10,pts[1][1]+10,'B',BLUE,13.5);
  s+=circ(pts[2][0],pts[2][1],5,BLUE)+text(pts[2][0]-18,pts[2][1]+10,'C',BLUE,13.5);
  s+=circ(I[0],I[1],5,ORANGE)+text(I[0]-6,I[1]+20,`I (OI = a√3/6 = ${fmt(rIn)})`,ORANGE,12);
  // Right: Right triangle SOI constructing altitude SO = h(t) and slant height SI = d
  const ox=395,oy=345,ix=ox+rI*1.75,sy=oy-H;
  s+=polygon([[ox,oy],[ix,oy],[ox,sy]],'#EDE9FE99',VIOLET,2.6);
  s+=line([ox,oy],[ox,sy],VIOLET,3.8)+line([ox,oy],[ix,oy],BLUE,3.2)+line([ox,sy],[ix,oy],ORANGE,3.4);
  s+=right8([ox,oy],[ix,oy],[ox,sy],11,VIOLET);
  s+=circ(ox,oy,6,VIOLET)+text(ox-18,oy+18,'O',VIOLET,13.5);
  s+=circ(ix,oy,6,BLUE)+text(ix+8,oy+16,'I (Trung điểm BC)',BLUE,12.5);
  s+=circ(ox,sy,6.5,ORANGE)+text(ox-8,sy-12,`S (SO = ${fmt(p.h*u)})`,VIOLET,13.5);
  s+=text((ox+ix)/2+10,(oy+sy)/2,`d = SI = ${fmt(apothemReal)}`,ORANGE,13);
  s+=text(28,33,'Đáy tam giác đều △ABC (trọng tâm O) & Tam giác vuông đường cao △SOI',INK,16.5);
  s+=text(28,58,'Bài 38: Đáy tam giác đều (xanh) + đường cao SO vuông góc đáy tại O (tím) + trung đoạn SI = d (cam)',BLUE,12.5);
  s+=text(28,468,`Tiến độ dựng đỉnh S: ${fmt(k*100)}% · Cạnh đáy a = ${fmt(p.a)} · Cao SO = ${fmt(p.h)} · Trung đoạn d = ${fmt(apothemReal)}`,VIOLET,14.5);
  s+=text(28,494,'• Kết luận: Chân đường cao O là trọng tâm đáy △ABC; trung đoạn d = √(SO² + OI²) = √(h² + a²/12)',INK,13);
  return wrap(s);
 }

 if(id==='8-09-C02'){
  const sc=Math.min(38,185/Math.max(p.a,p.h,1));
  const halfA=(p.a/2)*sc,diagHalf=rOut*sc,H=p.h*sc*u;
  // Left: Axial cross-section triangle S-I'-I (showing altitude SO in VIOLET #6D28D9, slant height SI in ORANGE #B45309, neutral SLATE #475569)
  const cx1=175,oy1=345,sy1=oy1-H,leftI=[cx1-halfA,oy1],rightI=[cx1+halfA,oy1],apex1=[cx1,sy1];
  let s=polygon([leftI,rightI,apex1],'#F1F5F9',SLATE,2.6);
  s+=line([cx1,oy1],apex1,VIOLET,3.8)+line([cx1,oy1],rightI,SLATE,3)+line(apex1,rightI,ORANGE,3.6);
  s+=right8([cx1,oy1],rightI,apex1,11,VIOLET);
  s+=circ(cx1,oy1,6.5,ORANGE)+text(cx1-34,oy1+22,'O (Tâm đáy)',ORANGE,12.5);
  s+=circ(rightI[0],rightI[1],5.5,ORANGE)+text(rightI[0]+8,rightI[1]+16,`I (OI = a/2 = ${fmt(p.a/2)})`,SLATE,12);
  s+=circ(apex1[0],apex1[1],6.5,VIOLET)+text(apex1[0]-10,apex1[1]-12,`S (SO = ${fmt(p.h*u)})`,VIOLET,13);
  s+=text((apex1[0]+rightI[0])/2+8,(apex1[1]+rightI[1])/2,`Trung đoạn d = ${fmt(apothemReal)}`,ORANGE,12.5);
  // Right: Diagonal right triangle SOA comparing altitude SO and lateral edge SA
  const ox2=435,oy2=345,ax2=ox2+diagHalf,sy2=oy2-H;
  s+=polygon([[ox2,oy2],[ax2,oy2],[ox2,sy2]],'#EDE9FE88',VIOLET,2.4);
  s+=line([ox2,oy2],[ox2,sy2],VIOLET,3.6)+line([ox2,oy2],[ax2,oy2],BLUE,3)+line([ox2,sy2],[ax2,oy2],SLATE,3.2);
  s+=right8([ox2,oy2],[ax2,oy2],[ox2,sy2],11,VIOLET);
  s+=circ(ox2,oy2,6,ORANGE)+text(ox2-16,oy2+20,'O',ORANGE,13);
  s+=circ(ax2,oy2,5.5,BLUE)+text(ax2-32,oy2+22,`A (OA = a√2/2 = ${fmt(rOut)})`,BLUE,12);
  s+=circ(ox2,sy2,6,VIOLET)+text(ox2-8,sy2-12,'S',VIOLET,13);
  s+=text((ox2+ax2)/2+8,(oy2+sy2)/2,`Cạnh bên SA = ${fmt(latEdge)}`,SLATE,12.5);
  s+=text(28,33,'Mặt cắt trục đối chiếu Đường cao SO (#6D28D9), Trung đoạn SI (#B45309) & Cạnh bên SA',INK,15.5);
  s+=text(28,58,'Bài 39 (MOT_NHAN): Tâm đáy O (cam) + đường cao SO (tím) + trung đoạn SI = d (cam) + cạnh bên SA (#475569)',BLUE,12.5);
  s+=text(28,468,`Tiến độ đối chiếu: ${fmt(k*100)}% · SO = h = ${fmt(p.h)} · Trung đoạn d = ${fmt(apothemReal)} · Cạnh bên SA = ${fmt(latEdge)}`,VIOLET,14);
  s+=text(28,494,'• Kết luận: Đường cao SO vuông góc đáy tại tâm O; trung đoạn SI = √(h² + (a/2)²) vuông góc cạnh đáy tại trung điểm I',INK,12.8);
  return wrap(s);
 }

 if(id==='8-09-C04'){
  const sBase=p.a*p.a,sxq=2*p.a*apothemReal,vol=sBase*p.h/3;
  const zRatio=0.12+0.76*k,scaleZ=1-zRatio,sCut=sBase*scaleZ*scaleZ;
  const cx1=175,oy1=355,topY=135,cutY=oy1-(oy1-topY)*zRatio,halfW=95,cutHalfW=halfW*scaleZ;
  let s=polygon([[cx1-halfW,oy1],[cx1+halfW,oy1],[cx1,topY]],'#FEF3C766',ORANGE,2.6);
  s+=line([cx1,oy1],[cx1,topY],VIOLET,2.6,'5 4');
  s+=line([cx1-cutHalfW,cutY],[cx1+cutHalfW,cutY],VIOLET,4);
  s+=rect(cx1-cutHalfW,cutY-6,2*cutHalfW,12,'#EDE9FECC',VIOLET,4);
  s+=rect(cx1-halfW,oy1-6,2*halfW,12,'#DBEAFECC',BLUE,4);
  s+=circ(cx1,topY,6,VIOLET)+text(cx1-6,topY-12,'S (Đỉnh chóp)',VIOLET,13);
  s+=text(cx1-halfW,oy1+28,`Đáy S_đáy = a² = ${fmt(sBase)}`,BLUE,13);
  s+=text(cx1+cutHalfW+10,cutY+4,`S(z) = ${fmt(sCut)}`,VIOLET,13);
  // Right: Visual comparison of V_chóp = 1/3 S_đáy * h vs Prism S_đáy * h
  const bx=375,by=135,bw=235,bh=220;
  s+=rect(bx,by,bw,bh,'#ffffff','#cbd5e1',10);
  s+=text(bx+16,by+28,'So sánh Thể tích Chóp & Lăng trụ',INK,14.5);
  const colH=135,cY=by+185;
  s+=rect(bx+32,cY-colH,64,colH,'#DBEAFE',BLUE,6)+text(bx+30,cY+20,'S_đáy · h',BLUE,12.5);
  const chopH=(colH/3)*u;
  s+=rect(bx+136,cY-colH,64,colH,'#F1F5F9',SLATE,6);
  s+=rect(bx+136,cY-chopH,64,chopH,'#EDE9FE',VIOLET,6)+text(bx+132,cY+20,'V = ⅓ S_đáy·h',VIOLET,12.5);
  s+=text(bx+144,cY-chopH-8,`${fmt(vol)}`,VIOLET,13);
  s+=text(28,33,'Thiết diện đồng dạng S(z) & Thể tích hình chóp đều V = ⅓ · S_đáy · h',INK,17);
  s+=text(28,58,`Bài 38–39: Đáy S_đáy = ${fmt(sBase)} (xanh) + Diện tích xung quanh S_xq = ${fmt(sxq)} (cam) + Thể tích V = ${fmt(vol)} (tím)`,BLUE,12.5);
  s+=text(28,468,`Độ cao mặt cắt z/h = ${fmt(zRatio*100)}% · Cạnh đáy a = ${fmt(p.a)} · Cao h = ${fmt(p.h)} · Trung đoạn d = ${fmt(apothemReal)}`,VIOLET,14);
  s+=text(28,494,'• Kết luận: S_xq = p · d (nửa chu vi đáy nhân trung đoạn); V = ⅓ · S_đáy · h (bằng 1/3 lăng trụ cùng đáy và chiều cao)',INK,12.8);
  return wrap(s);
 }

 // 8-09-C03: Hình khai triển phẳng 2D chuẩn SGK (tam giác đều hoặc tứ giác đều)
 const sc=Math.min(42,230/p.a,155/apothemReal),a=p.a*sc,h=apothemReal*sc;
 const cX=300,cY=255,base=[[cX-a/2,cY-a/2],[cX+a/2,cY-a/2],[cX+a/2,cY+a/2],[cX-a/2,cY+a/2]];
 let s='';
 if(isTri){
  const R=a/Math.sqrt(3),cen=[cX,cY],pts=[[-Math.PI/2,0],[Math.PI/6,0],[5*Math.PI/6,0]].map(([ang])=>[cX+R*Math.cos(ang),cY+R*Math.sin(ang)]);
  s+=polygon(pts,'#DBEAFE',BLUE,2.8);
  for(let i=0;i<3;i++){
   const P=pts[i],Q=pts[(i+1)%3],mid=move(P,Q,.5),dir=[mid[0]-cen[0],mid[1]-cen[1]],norm=Math.hypot(...dir)||1;
   const flatApex=[mid[0]+dir[0]/norm*h,mid[1]+dir[1]/norm*h],apex=move(cen,flatApex,k);
   const fFill=i%2===0?'#FEF3C7CC':'#EDE9FECC';
   const fStroke=i%2===0?ORANGE:VIOLET;
   s+=polygon([P,Q,apex],fFill,fStroke,2.4)+line(mid,apex,VIOLET,2.4,'4 3')+right8(mid,P,apex,9,VIOLET)+circ(...apex,4.5,fStroke);
   if(i===0&&k>0.3)s+=text((mid[0]+apex[0])/2+14,(mid[1]+apex[1])/2,`d=${fmt(apothemReal)}`,VIOLET,12.5);
  }
 }else{
  const cen=[cX,cY];
  s+=polygon(base,'#DBEAFE',BLUE,2.8);
  const out=[[0,-1],[1,0],[0,1],[-1,0]];
  for(let i=0;i<4;i++){
   const P=base[i],Q=base[(i+1)%4],mid=move(P,Q,.5),flatApex=[mid[0]+out[i][0]*h,mid[1]+out[i][1]*h];
   const apex=move(cen,flatApex,k);
   const fFill=i%2===1?'#EDE9FECC':'#FEF3C7CC';
   const fStroke=i%2===1?VIOLET:ORANGE;
   s+=polygon([P,Q,apex],fFill,fStroke,2.4)+line(mid,apex,VIOLET,2.2,'4 3')+right8(mid,P,apex,9,VIOLET)+circ(...apex,4.5,fStroke);
   if(i===0&&k>0.3)s+=text(mid[0]+14,(mid[1]+apex[1])/2,`d = ${fmt(apothemReal)}`,VIOLET,12.5);
  }
 }
 s+=circ(cX,cY,6.5,VIOLET)+text(cX+10,cY-8,'O (Tâm đáy / Chân đường cao SO)',VIOLET,12.5);
 const subtitle=isTri?'Bài 38: 1 đáy tam giác đều + 3 mặt bên tam giác cân bằng nhau + trung đoạn d':
  'Bài 39 (DA_MAU): 1 đáy vuông xanh + 4 mặt bên tam giác cân luân phiên cam / tím nhạt';
 return wrap(`${s}${text(28,33,'Hình khai triển 2D & Trung đoạn d trên mặt bên',INK,18)}${text(28,58,subtitle,BLUE,13)}${text(28,468,`Độ mở: ${fmt(k*100)}% · Cạnh đáy a = ${fmt(p.a)} · Cao h = ${fmt(p.h)} · Trung đoạn d = ${fmt(apothemReal)}`,VIOLET,15)}${text(28,494,'• Kết luận: S_xq = ½ · C_đáy · d (d là trung đoạn mặt bên); V = ⅓ · S_đáy · h',INK,13.5)}`);
}
