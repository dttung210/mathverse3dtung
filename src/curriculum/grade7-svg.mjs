/* Grade 7 mathematical views: always draw from numeric geometry, not screenshots.
 * 2D diagrams are deliberately planar; only 7-08/09 have real WebGL solid viewers.
 * R80 V2 Upgrade: Deep pedagogical 1-way progression (0% -> 50% -> 100% hold)
 * + V2 Purposeful Color Coding (PALETTE_TOAN6_7_8.json & MA_TRAN_MAU_CO_CHU_DICH_TOAN7.csv).
 */
import {triangle7,triangleCenters7,triangleAngles7,dist,med,pieData,grade7Frequency,grade7Outcome,grade7SolidProperties,grade7Defaults} from './grade7-engine.mjs';
import {TRIANGLE_CASES,initialTriangleParams,makeTrianglePair} from './triangle-engine.mjs';

// V2 Semantic Color Roles (PALETTE_TOAN6_7_8.json)
const BLUE='#1D4ED8';   // doi_tuong_chinh
const ORANGE='#B45309'; // dang_thao_tac / mot_nhan
const PURPLE='#6D28D9'; // ket_qua / truc / giao diem
const GREEN='#15803D';  // doi_chieu
const RED='#B91C1C';    // sai_dieu_kien / canh bao
const SLATE='#475569';  // dung_phu / trung tinh
const INK='#0F172A';    // chu & truc chinh

const q=x=>Number(Number(x||0).toFixed(2));
const E=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const L=(x1,y1,x2,y2,color=BLUE,w=3,dash='')=>`<line x1="${q(x1)}" y1="${q(y1)}" x2="${q(x2)}" y2="${q(y2)}" stroke="${color}" stroke-width="${w}" ${dash?`stroke-dasharray="${dash}"`:''} stroke-linecap="round"/>`;
const C=(x,y,r=6,fill=RED,stroke='white',sw=2)=>`<circle cx="${q(x)}" cy="${q(y)}" r="${q(r)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const T=(x,y,text,color=INK,size=18,weight=650)=>{
 const str=String(text??'');
 const maxW=x>=450?Math.max(110,872-x):Math.max(140,876-x);
 const estW=str.length*size*0.54;
 const adjSize=estW>maxW?Math.max(10.8,q(size*maxW/estW)):size;
 return `<text x="${q(x)}" y="${q(y)}" fill="${color}" font-size="${adjSize}" font-weight="${weight}" font-family="system-ui,Segoe UI,sans-serif">${E(str)}</text>`;
};
const P=(pts,fill='#DBEAFE66',stroke=BLUE,width=3)=>`<polygon points="${pts.map(x=>x.map(q).join(',')).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round"/>`;
const box=(x,y,w,h,fill='#F8FAFC')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${fill}" stroke="#CBD5E1"/>`;
const p2=(pt,o=[185,365],s=55)=>[o[0]+pt[0]*s,o[1]-pt[1]*s];
const op=x=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=x=>{const u=op(x);return u*u*(3-2*u);};
const subPhase=(u,a,b)=>op((u-a)/Math.max(1e-6,b-a));
const lerp=(a,b,u)=>a+(b-a)*u;

function angleArcPts(V,P1,P2,r=28,color=BLUE,label='',arcs=1,fillOp=0.16){
 const a1=Math.atan2(P1[1]-V[1],P1[0]-V[0]),a2=Math.atan2(P2[1]-V[1],P2[0]-V[0]);
 let d=a2-a1;while(d<=-Math.PI)d+=Math.PI*2;while(d>Math.PI)d-=Math.PI*2;
 const sA=d>=0?a1:a2,eA=d>=0?a2:a1,span=Math.abs(d);
 const sx=V[0]+r*Math.cos(sA),sy=V[1]+r*Math.sin(sA),ex=V[0]+r*Math.cos(eA),ey=V[1]+r*Math.sin(eA);
 let out=`<path d="M ${q(V[0])} ${q(V[1])} L ${q(sx)} ${q(sy)} A ${r} ${r} 0 ${span>Math.PI?1:0} 1 ${q(ex)} ${q(ey)} Z" fill="${color}" fill-opacity="${fillOp}" stroke="none"/>`;
 for(let k=0;k<arcs;k++){
  const rk=r-k*4.5,x1=V[0]+rk*Math.cos(sA),y1=V[1]+rk*Math.sin(sA),x2=V[0]+rk*Math.cos(eA),y2=V[1]+rk*Math.sin(eA);
  out+=`<path d="M ${q(x1)} ${q(y1)} A ${q(rk)} ${q(rk)} 0 ${span>Math.PI?1:0} 1 ${q(x2)} ${q(y2)}" fill="none" stroke="${color}" stroke-width="2.4"/>`;
 }
 if(label){
  const mid=sA+span/2,lr=r+18;
  out+=`<text x="${q(V[0]+lr*Math.cos(mid))}" y="${q(V[1]+lr*Math.sin(mid)+4)}" text-anchor="middle" fill="${color}" font-size="13" font-weight="700" font-family="system-ui,Segoe UI,sans-serif">${E(label)}</text>`;
 }
 return out;
}
function rightMarkPts(H,From,Along,sz=11,color=PURPLE){
 const ux=From[0]-H[0],uy=From[1]-H[1],ul=Math.hypot(ux,uy)||1;
 const vx=Along[0]-H[0],vy=Along[1]-H[1],vl=Math.hypot(vx,vy)||1;
 const p1=[H[0]+ux/ul*sz,H[1]+uy/ul*sz],p3=[H[0]+vx/vl*sz,H[1]+vy/vl*sz];
 const p2=[p1[0]+vx/vl*sz,p1[1]+vy/vl*sz];
 return `<polyline points="${p1.map(q).join(',')} ${p2.map(q).join(',')} ${p3.map(q).join(',')}" fill="none" stroke="${color}" stroke-width="2.2"/>`;
}
function tickMarkPts(P1,P2,count=1,color=INK){
 const mx=(P1[0]+P2[0])/2,my=(P1[1]+P2[1])/2,dx=P2[0]-P1[0],dy=P2[1]-P1[1],len=Math.hypot(dx,dy)||1;
 const tx=dx/len,ty=dy/len,nx=-ty,ny=tx;
 let out='';
 for(let i=0;i<count;i++){
  const off=(i-(count-1)/2)*5.5,cx=mx+tx*off,cy=my+ty*off;
  out+=L(cx-nx*6,cy-ny*6,cx+nx*6,cy+ny*6,color,2.2);
 }
 return out;
}
function parallelArrow(x,y,angDeg=0,color=BLUE){
 const a=angDeg*Math.PI/180,c=Math.cos(a),s=Math.sin(a),rot=(dx,dy)=>[x+dx*c-dy*s,y+dx*s+dy*c];
 let out='';
 for(const off of [-4,3]){
  const p1=rot(off-6,-5),p2=rot(off,0),p3=rot(off-6,5);
  out+=`<polyline points="${p1.map(q).join(',')} ${p2.map(q).join(',')} ${p3.map(q).join(',')}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
 }
 return out;
}
function marker(p,name,{radius=7,fill=BLUE,drag=false,dx=12,dy=-9,textColor=INK}={}){let [x,y]=p;return `${C(x,y,radius,fill)}${T(x+dx,y+dy,name,textColor)}${drag?`<circle cx="${q(x)}" cy="${q(y)}" r="18" fill="transparent" data-pt="${name}" style="cursor:grab"/>`:''}`;}
function triangleShape(p,{equilateral=false,iso=false}={}){const T0=triangle7(p);if(iso){T0.C=[p.a/2,equilateral?p.a*Math.sqrt(3)/2:p.v];}return T0;}
function gridChart(){let s=L(90,395,820,395,'#64748B',2)+L(90,50,90,395,'#64748B',2);for(let n=0;n<=5;n++){const y=395-60*n;s+=L(90,y,820,y,'#E2E8F0',1,'3 7')+T(57,y+4,String(n*4),'#64748B',13,500);}return s;}

/* ==========================================================================
   NHÓM 7-01: TRỤC SỐ, SỐ HỮU TỈ, SỐ THỰC VÀ CĂN BẬC HAI
   - 7-01-C01: GIU_TRUNG_TINH (Trục số và các vạch chia trung tính, điểm đang xét nổi bật)
   - 7-01-C02: MOT_NHAN (Đoạn tạo chiều dài √n cam; điểm ảnh trên trục xanh)
   - 7-01-C03: MOT_NHAN (Mốc làm tròn viền cam, hai mốc chặn giữ xanh nhạt)
   ========================================================================== */
function drawNumber(id,p,t){
 const u=op(t/6),f=smooth(u),pos=id==='7-01-C02'?Math.sqrt(p.n):p.x;
 if(id==='7-01-C02'){
  // 7-01-C02 (MOT_NHAN): Đoạn tạo chiều dài căn bậc hai cam; điểm ảnh trên trục xanh
  const p1=smooth(subPhase(u,0,0.34)),p2=smooth(subPhase(u,0.30,0.66)),p3=smooth(subPhase(u,0.62,1.0));
  const ox=210,oy=330,U=135;
  const radN=Math.sqrt(p.n),radPrev=Math.sqrt(p.n-1);
  const ax=ox+radPrev*U,ay=oy,bx=ax,by=oy-U,mx=ox+radN*U,my=oy,R=radN*U;
  let s=box(20,25,860,420);
  s+=box(40,34,820,62,'#F1F5F9');
  s+=T(56,58,`Dựng hình học số vô tỉ √${p.n} ≈ ${q(radN)} trên trục số (Tiến trình: ${Math.round(u*100)}%):`,INK,16,700);
  s+=T(56,82,`B1: OA = ${p.n===2?'1':`√${p.n-1}`}, AB = 1 (⊥)  →  B2: Cạnh huyền OB = √${p.n} (cam)  →  B3: Hạ cung OB cắt trục tại M(√${p.n}) (xanh)`,SLATE,13,650);
  // Trục số trung tính
  s+=L(70,oy,845,oy,SLATE,3)+P([[845,oy],[833,oy-6],[833,oy+6]],SLATE,SLATE,1)+T(852,oy+5,'x',INK,17,700);
  for(let i=-1;i<=4;i++){
   const tx=ox+i*U;
   if(tx>=75&&tx<=830){
    s+=L(tx,oy-9,tx,oy+9,SLATE,2)+T(tx-6,oy+28,String(i),SLATE,15,600);
   }
  }
  const curAx=lerp(ox,ax,0.25+0.75*p1),curBy=lerp(ay,by,0.2+0.8*p1);
  const curHypX=lerp(ox,bx,0.15+0.85*p2),curHypY=lerp(oy,by,0.15+0.85*p2);
  s+=P([[ox,oy],[ax,ay],[bx,by]],'#F1F5F9',SLATE,1.8);
  s+=rightMarkPts([ax,ay],[ox,oy],[bx,by],14,SLATE);
  s+=L(ox,oy,curAx,ay,SLATE,4)+L(ax,ay,bx,curBy,SLATE,3.6)+L(ox,oy,curHypX,curHypY,ORANGE,5);
  s+=C(ox,oy,6,INK)+T(ox-18,oy-12,'O(0)',INK,15,700);
  s+=C(ax,ay,5,SLATE)+T(ax-12,ay+46,p.n===2?'A(1)':`A(√${p.n-1})`,SLATE,13.5,700);
  s+=C(bx,by,6,ORANGE)+T(bx-10,by-14,'B',ORANGE,16,700);
  s+=T((ox+ax)/2-32,oy-10,p.n===2?'OA = 1':`OA = √${p.n-1}`,SLATE,14,700);
  s+=T(bx+12,(ay+by)/2+5,'AB = 1',SLATE,14.5,700);
  const midOB=[(ox+bx)/2,(oy+by)/2];
  s+=T(midOB[0]-62,midOB[1]-12,`OB = √${p.n}`,ORANGE,15.5,700);
  // Cung tròn compa tâm O bán kính R = OB (cam) quét một chiều xuống điểm ảnh M(√n) (xanh)
  const theta0=Math.atan2(U,radPrev*U),thetaCur=theta0*(1-p3);
  const px=ox+R*Math.cos(thetaCur),py=oy-R*Math.sin(thetaCur);
  s+=`<path d="M ${q(bx)} ${q(by)} A ${q(R)} ${q(R)} 0 0 1 ${q(px)} ${q(py)}" fill="none" stroke="${ORANGE}" stroke-width="3.2" stroke-dasharray="8 5"/>`;
  s+=L(ox,oy,px,py,ORANGE,2.2,'5 4')+C(px,py,6.5,ORANGE);
  s+=C(mx,my,8.5,BLUE)+T(mx+10,my-14,`M(√${p.n} ≈ ${q(radN)})`,BLUE,16,700);
  s+=T(45,402,`• Kết luận (Bài 6): Độ dài cạnh huyền OB = √${p.n} (cam) xác định điểm ảnh M(√${p.n} ≈ ${q(radN)}) (xanh) trên trục số`,INK,14.5,700);
  return s;
 }
 let s=box(20,35,860,395)+L(110,252,800,252,SLATE,3)+C(455,252,5,INK)+T(450,234,'O',INK,15,700);
 for(let i=-5;i<=5;i++){
  const x=455+i*62;
  s+=L(x,240,x,265,SLATE,2)+T(x-9,286,String(i),SLATE,15,500);
  if(i<5){
   for(let sub=1;sub<5;sub++){
    const sx=x+sub*(62/5);
    s+=L(sx,247,sx,257,'#94A3B8',1.1);
   }
  }
 }
 s+=T(180,82,id==='7-01-C03'?'Phóng to đoạn trục số để làm tròn và so sánh số thực':'Biểu diễn số hữu tỉ và số đối trên trục số',INK,21,700);
 const x=455+pos*62,cur=455+pos*62*(0.15+0.85*f);
 s+=L(455,195,cur,195,BLUE,5.5)+marker([x,195],`M (${q(pos)})`,{fill:BLUE,drag:id!=='7-01-C02',textColor:BLUE});
 s+=L(x,195,x,252,BLUE,2,'6 4')+C(x,252,6.5,BLUE);
 if(id==='7-01-C01'){
  // 7-01-C01 (GIU_TRUNG_TINH): Giữ trục số và số đối trung tính sạch, chỉ nổi bật điểm đang xét M(x)
  const oppX=455-pos*62,curOpp=455-pos*62*(0.1+0.9*f);
  if(Math.abs(pos)>0.05){
   s+=L(455,252,curOpp,252,SLATE,3.5,'6 4');
   s+=C(oppX,252,6,SLATE)+T(oppX-28,228,`M′(${q(-pos)})`,SLATE,14.5,700);
   s+=tickMarkPts([455,252],[x,252],1,BLUE)+tickMarkPts([455,252],[oppX,252],1,SLATE);
  }
  s+=T(65,342,`• Quan sát: Điểm đang xét M(${q(pos)}) và điểm đối xứng M′(${q(-pos)}) cách đều gốc O(0): OM = OM′ = |x| = ${q(Math.abs(pos))}`,INK,13.5,600);
  s+=T(65,368,'• Tương quan: Khi dịch chuyển M trên trục số, khoảng cách từ M và M′ đến O luôn bằng nhau',SLATE,13.5,600);
  s+=T(65,394,'• Kết luận: Hai số hữu tỉ đối nhau nằm về hai phía điểm 0 và cách đều điểm 0 (x + (−x) = 0)',INK,14,700);
 }
 if(id==='7-01-C03'){
  // 7-01-C03 (MOT_NHAN): Mốc làm tròn được viền cam, hai mốc chặn giữ xanh nhạt
  const rounded=Math.round(pos*10)/10;
  const lowerBound=Math.floor(pos*10)/10,upperBound=Math.ceil(pos*10)/10;
  s+=T(95,338,`Làm tròn đến hàng phần mười (0,1): ${q(pos)} ≈ ${rounded.toFixed(1)} · Mốc chặn: [${lowerBound.toFixed(1)}; ${upperBound.toFixed(1)}]`,INK,16,700);
  s+=T(575,338,`Độ phóng đại: ${p.zoom}×`,SLATE,16,700);
  const base=500,focusY=384,unit=75*p.zoom,step=.1;
  s+=L(x-24,256,lerp(x-24,495,f),lerp(256,focusY,f),'#94A3B8',1.6,'5 4');
  s+=L(x+24,256,lerp(x+24,790,f),lerp(256,focusY,f),'#94A3B8',1.6,'5 4');
  s+=L(495,focusY,790,focusY,SLATE,3.2);
  for(let j=-5;j<=5;j++){
   const xx=base+145+j*step*unit;
   if(xx>=495&&xx<=790){
    const tickVal=+(rounded+j*step).toFixed(1);
    const isBound=Math.abs(tickVal-lowerBound)<1e-6||Math.abs(tickVal-upperBound)<1e-6;
    s+=L(xx,focusY-8,xx,focusY+8,j===0?ORANGE:(isBound?BLUE:'#94A3B8'),j===0?3:(isBound?2.4:1.6));
    if(isBound&&j!==0)s+=C(xx,focusY,5,'#DBEAFE',BLUE,2);
   }
  }
  const exactZoomX=base+145+(pos-rounded)*unit;
  const roundZoomX=base+145;
  s+=C(clamp(exactZoomX,500,785),focusY,6.5,BLUE)+C(roundZoomX,focusY-14*(0.3+0.7*f),7.5,'#FEF3C7',ORANGE,3);
  s+=T(485,414,`Mốc làm tròn ${rounded.toFixed(1)} (viền cam) · Hai mốc chặn [${lowerBound.toFixed(1)}; ${upperBound.toFixed(1)}] (xanh) · Giá trị thực ${q(pos)}`,INK,13,600);
 }
 return s;
}

/* ==========================================================================
   NHÓM 7-02: GÓC – ĐỐI ĐỈNH – SONG SONG & CÁT TUYẾN (DA_MAU, KHÔNG LẮC SIN)
   ========================================================================== */
function drawAngles(id,p,t){
 let s=box(15,25,870,425);const ang=p.theta*Math.PI/180,cx=285,cy=290,r=195;
 const u=op(t/6),f=smooth(u);
 if(id==='7-02-C01'){
  // 7-02-C01: Góc α xanh và góc kề bù cam trên một nửa mặt phẳng, góc bẹt tím
  const curAng=ang*(0.25+0.75*f);
  const x2=cx+r*Math.cos(ang),y2=cy-r*Math.sin(ang);
  s+=L(85,cy,495,cy,SLATE,4)+T(68,cy+6,"x'",SLATE,16,700)+T(502,cy+6,'x',SLATE,16,700);
  s+=angleArcPts([cx,cy],[cx+120,cy],[x2,y2],58,BLUE,`α=${q(p.theta)}°`,1,0.22);
  s+=angleArcPts([cx,cy],[x2,y2],[cx-120,cy],72,ORANGE,`β=${q(180-p.theta)}°`,2,0.18);
  const sumAng=Math.PI*f,sx=cx+88*Math.cos(sumAng),sy=cy-88*Math.sin(sumAng);
  s+=`<path d="M ${q(cx+88)} ${q(cy)} A 88 88 0 0 0 ${q(sx)} ${q(sy)}" fill="none" stroke="${PURPLE}" stroke-width="3" stroke-dasharray="6 4"/>`;
  s+=L(cx,cy,x2,y2,ORANGE,5)+T(x2+8,y2-6,'y',ORANGE,16,700);
  const cp=[cx+95*Math.cos(ang),cy-95*Math.sin(ang)];
  s+=marker([cx,cy],'O',{fill:INK})+marker(cp,'tia quay',{fill:ORANGE,drag:true});
  s+=C(cx+135*Math.cos(curAng),cy-135*Math.sin(curAng),6,PURPLE);
  s+=box(520,55,345,365,'#F8FAFC');
  s+=T(540,92,'Hai góc kề bù: ∠xOy và ∠yOx\'',INK,20,700);
  s+=T(540,132,`α = ∠xOy = ${q(p.theta)}° (xanh)`,BLUE,21,700)+T(540,168,`β = ∠yOx' = ${q(180-p.theta)}° (cam)`,ORANGE,21,700)+T(540,208,'α + β = 180° (Góc bẹt tím)',PURPLE,22,700);
  s+=T(540,256,'• Quan sát: Kéo "tia quay" Oy để đổi góc α (xanh) và β (cam)',INK,14,600);
  s+=T(540,284,'• Tương quan: α tăng bao nhiêu độ thì β giảm bấy nhiêu',BLUE,14,600);
  s+=T(540,312,'• Kết luận: Hai góc kề bù luôn ghép thành góc bẹt 180° (cung tím)',PURPLE,14,700);
 }else if(id==='7-02-C02'){
  // 7-02-C02: Hai cặp góc đối đỉnh cùng màu; cặp kề dùng sắc khác
  const p1=smooth(subPhase(u,0,0.55)),p2=smooth(subPhase(u,0.45,1.0));
  const v=[r*Math.cos(ang),-r*Math.sin(ang)];
  s+=L(85,cy,495,cy,SLATE,4)+T(68,cy+6,"x'",SLATE,16,700)+T(502,cy+6,'x',SLATE,16,700);
  s+=L(cx-v[0],cy-v[1],cx+v[0],cy+v[1],SLATE,4)+T(cx+v[0]+8,cy+v[1]-4,'y',SLATE,16,700)+T(cx-v[0]-18,cy-v[1]+14,"y'",SLATE,16,700);
  s+=angleArcPts([cx,cy],[cx+110,cy],[cx+v[0],cy+v[1]],46+8*p1,BLUE,`O₁=${q(p.theta)}°`,1,0.18+0.14*p1);
  s+=angleArcPts([cx,cy],[cx-110,cy],[cx-v[0],cy-v[1]],46+8*p1,BLUE,`O₃=${q(p.theta)}°`,1,0.18+0.14*p1);
  s+=angleArcPts([cx,cy],[cx+v[0],cy+v[1]],[cx-110,cy],60+8*p2,ORANGE,`O₂=${q(180-p.theta)}°`,2,0.14+0.14*p2);
  s+=angleArcPts([cx,cy],[cx-v[0],cy-v[1]],[cx+110,cy],60+8*p2,ORANGE,`O₄=${q(180-p.theta)}°`,2,0.14+0.14*p2);
  const cp=[cx+95*Math.cos(ang),cy-95*Math.sin(ang)];
  s+=marker([cx,cy],'O',{fill:PURPLE})+marker(cp,'tia quay',{fill:ORANGE,drag:true});
  s+=box(520,55,345,365,'#F8FAFC');
  s+=T(540,92,'Hai góc đối đỉnh',INK,22,700);
  s+=T(540,132,`Góc α = β = ${q(p.theta)}°`,BLUE,20,700);
  s+=T(540,166,`• Cặp đối đỉnh 1 (xanh): ∠O₁ = ∠O₃ = ${q(p.theta)}°`,BLUE,16,700);
  s+=T(540,198,`• Cặp đối đỉnh 2 (cam): ∠O₂ = ∠O₄ = ${q(180-p.theta)}°`,ORANGE,16,700);
  s+=T(540,244,'• Quan sát: Kéo tia Oy, hai cung cùng màu luôn bằng nhau',INK,14,600);
  s+=T(540,272,'• Vì sao: ∠O₁ và ∠O₃ cùng kề bù với ∠O₂ (tổng = 180°)',SLATE,14,600);
  s+=T(540,300,'• Kết luận: Hai góc đối đỉnh thì bằng nhau',PURPLE,14,700);
 }else{
  const phi=p.theta*Math.PI/180;
  const rawShift=(id==='7-02-C05'?p.shift:0);
  const animShift=id==='7-02-C05'&&(Math.abs(rawShift)<1e-8?16*(1-f):rawShift*f);
  const shiftDeg=id==='7-02-C05'?animShift:0;
  const shift=shiftDeg*Math.PI/180;
  const first=[75,318,495,318],second=[75,135,495,135],dx=125*Math.cos(phi),dy=-125*Math.sin(phi),skew=65*Math.tan(shift);
  const aLeft=[second[0],second[1]+skew],aRight=[second[2],second[3]-skew];
  const bLeft=[first[0],first[1]],bRight=[first[2],first[3]];
  const x0=275,y0=318,x1=x0-dx*0.95,y1=y0-dy*0.95,x2=x0+dx*2.05,y2=y0+dy*2.05;
  const m=(aRight[1]-aLeft[1])/(aRight[0]-aLeft[0]),sy=(aLeft[1]+m*(x0-aLeft[0])-y0)/(dy-m*dx);
  const upper=[x0+dx*sy,y0+dy*sy];
  const B=[x0,y0],A=upper;
  const topAngle=q(p.theta+shiftDeg);
  const isPar=Math.abs(shiftDeg)<0.8;

  if(id==='7-02-C03'){
   // 7-02-C03: Đường cát tuyến tím đứt; cặp góc đồng vị cùng xanh, cặp khác trung tính
   s+=angleArcPts(B,[bRight[0],bRight[1]],[x2,y2],48,BLUE,`∠B₁=${q(p.theta)}°`,1,0.24);
   s+=angleArcPts(A,[aRight[0],aRight[1]],[x2,y2],48,BLUE,`∠A₁=${q(p.theta)}°`,1,0.24);
   const S=[lerp(B[0],A[0],f),lerp(B[1],A[1],f)];
   s+=angleArcPts(S,[S[0]+90,S[1]],[S[0]+dx,S[1]+dy],42,ORANGE,f>0.82?'':'B₁ → A₁',1,0.26);
   if(f>0.82) s+=T(A[0]+16,A[1]+22,'✓ Trùng khít',ORANGE,13,700);
  }else if(id==='7-02-C04'){
   // 7-02-C04: Góc so le trong xanh; trong cùng phía cam; cát tuyến tím
   const pZ=smooth(subPhase(u,0,0.55)),pU=smooth(subPhase(u,0.45,1.0));
   s+=`<polyline points="${q(A[0]-110)},${q(A[1])} ${q(A[0])},${q(A[1])} ${q(B[0])},${q(B[1])} ${q(B[0]+110)},${q(B[1])}" fill="none" stroke="${BLUE}" stroke-width="${q(2+3*pZ)}" stroke-opacity="${q(0.25+0.6*pZ)}"/>`;
   s+=angleArcPts(B,[bRight[0],bRight[1]],A,46,BLUE,`∠B₁=${q(p.theta)}°`,1,0.24);
   s+=angleArcPts(A,[aLeft[0],aLeft[1]],B,46,BLUE,`∠A₃=${q(p.theta)}°`,1,0.24);
   s+=angleArcPts(A,[aRight[0],aRight[1]],B,56*(0.4+0.6*pU),ORANGE,`∠A₄=${q(180-p.theta)}°`,2,0.22);
  }else{
   // 7-02-C05: Cặp góc kiểm chứng cam; hai đường sẽ song song xanh (khi chưa song song giữ xám), cát tuyến xám
   s+=angleArcPts(B,[bRight[0],bRight[1]],[x2,y2],46,ORANGE,`∠B₁=${q(p.theta)}°`,1,0.24);
   s+=angleArcPts(A,[aRight[0],aRight[1]],[x2,y2],46,isPar?ORANGE:RED,`∠A₁=${topAngle}°`,isPar?1:2,0.24);
  }

  const lineABCol=id==='7-02-C05'?(isPar?BLUE:SLATE):SLATE;
  s+=L(...bLeft,...bRight,lineABCol,4)+T(55,323,'b',lineABCol,18,700);
  s+=L(...aLeft,...aRight,lineABCol,4)+T(55,aLeft[1]+5,'a',lineABCol,18,700);
  if(isPar){
   s+=parallelArrow(155,318,0,BLUE)+parallelArrow(155,135,0,BLUE);
  }
  const transCol=id==='7-02-C05'?SLATE:PURPLE;
  const transDash=id==='7-02-C03'?'9 5':'';
  s+=L(x1,y1,x2,y2,transCol,4,transDash)+T(x2+8,y2+6,'c',transCol,18,700);

  s+=C(A[0],A[1],6,INK)+T(A[0]-26,A[1]-10,'A',INK,17,700);
  s+=C(B[0],B[1],7,INK)+T(B[0]-26,B[1]-10,'B',INK,17,700);
  const dragPt=[B[0]+dx*0.55,B[1]+dy*0.55];
  s+=C(dragPt[0],dragPt[1],7,ORANGE)+`<circle cx="${q(dragPt[0])}" cy="${q(dragPt[1])}" r="22" fill="transparent" data-pt="tia quay" style="cursor:grab"/>`;
  s+=`<circle cx="${q(B[0])}" cy="${q(B[1])}" r="22" fill="transparent" data-pt="tia quay" style="cursor:grab"/>`;
  if(id==='7-02-C05'){
   const shPt=[aRight[0]-45,aRight[1]+skew*0.12];
   s+=C(shPt[0],shPt[1],8,ORANGE)+`<circle cx="${q(shPt[0])}" cy="${q(shPt[1])}" r="22" fill="transparent" data-pt="shift" style="cursor:grab"/>`;
  }

  s+=box(515,45,355,385,'#F8FAFC');
  s+=T(532,78,'Hai đường thẳng và cát tuyến',INK,20,700);
  if(id==='7-02-C03'){
   s+=T(532,114,'Hai góc đồng vị: ∠A₁ và ∠B₁ (xanh)',BLUE,19,700);
   s+=T(532,148,`Góc cát tuyến c (tím đứt) = ${p.theta}°`,PURPLE,17,650);
   s+=T(532,182,`• Tại đỉnh A: ∠A₁ = ${q(p.theta)}° (trên a, phải c)`,BLUE,15,700);
   s+=T(532,210,`• Tại đỉnh B: ∠B₁ = ${q(p.theta)}° (trên b, phải c)`,BLUE,15,700);
   s+=T(532,248,'1. Quan sát: Cung góc xanh ∠A₁ và ∠B₁ ở vị trí đồng vị',INK,13.5,600);
   s+=T(532,274,'2. Tương quan: Bản sao góc cam trượt dọc theo c từ B lên A',ORANGE,13.5,600);
   s+=T(532,300,`   Tiến độ trượt chồng góc: ${Math.round(f*100)}%`,ORANGE,13,650);
   s+=T(532,332,'3. Kết luận: Nếu c cắt a ∥ b thì hai góc đồng vị bằng nhau:',PURPLE,13.5,700);
   s+=T(552,358,`a ∥ b  ⇒  ∠A₁ = ∠B₁ = ${q(p.theta)}°`,PURPLE,17,700);
  }else if(id==='7-02-C04'){
   s+=T(532,114,'So le trong (xanh) / Trong cùng phía (cam)',INK,18,700);
   s+=T(532,146,`Góc cát tuyến c (tím) = ${p.theta}°`,PURPLE,16,650);
   s+=T(532,178,`• So le trong (chữ Z xanh): ∠A₃ = ∠B₁ = ${q(p.theta)}°`,BLUE,15,700);
   s+=T(532,206,`• Trong cùng phía (chữ U cam): ∠A₄ + ∠B₁ = ${q(180-p.theta)}° + ${q(p.theta)}° = 180°`,ORANGE,14.5,700);
   s+=T(532,246,'1. Quan sát: ∠A₃, ∠B₁ (xanh) so le trong; ∠A₄, ∠B₁ (cam) trong cùng phía',INK,13.5,600);
   s+=T(532,272,'2. Tương quan: Khi đổi góc c, ∠A₃ = ∠B₁ và ∠A₄ + ∠B₁ = 180°',SLATE,13.5,600);
   s+=T(532,304,'3. Kết luận khi c cắt hai đường thẳng song song a ∥ b:',PURPLE,13.5,700);
   s+=T(545,330,'• Hai góc so le trong bằng nhau (∠A₃ = ∠B₁)',BLUE,14,700);
   s+=T(545,356,'• Hai góc trong cùng phía bù nhau (∠A₄ + ∠B₁ = 180°)',ORANGE,14,700);
  }else{
   s+=T(532,114,'Dấu hiệu nhận biết hai đường thẳng song song',INK,16,700);
   s+=T(532,148,`Δ góc = ${q(shiftDeg)}°`,isPar?BLUE:RED,20,700)+T(685,148,isPar?'a ∥ b':'a và b cắt nhau',isPar?BLUE:RED,20,700);
   s+=T(532,180,`Góc kiểm chứng (cam) = ${p.theta}°`,ORANGE,16,650);
   s+=T(532,210,`• Góc tại A: ∠A₁ = ${topAngle}° · Góc tại B: ∠B₁ = ${q(p.theta)}°`,isPar?ORANGE:RED,15,700);
   s+=T(532,248,'1. Quan sát: Kéo nút cam trên đường a để điều chỉnh Δ góc về 0°',INK,13.5,600);
   s+=T(532,274,'2. Tương quan: Chỉ khi ∠A₁ = ∠B₁ thì hai đường a, b mới chuyển màu xanh (a ∥ b)',BLUE,13.5,600);
   s+=T(532,302,'3. Kết luận: Nếu cặp góc đồng vị (hoặc so le trong) bằng nhau',PURPLE,13.5,700);
   s+=T(548,328,'(∠A₁ = ∠B₁ ⇔ Δ góc = 0°) thì hai đường thẳng song song a ∥ b',PURPLE,13.5,700);
  }
 }
 return s;
}

/* ==========================================================================
   NHÓM 7-03: TAM GIÁC – TỔNG BA GÓC – GÓC NGOÀI – BẤT ĐẲNG THỨC (DA_MAU)
   ========================================================================== */
function drawTriangle(id,p,t){
 let s=box(20,25,860,425);const iso=id==='7-03-C05';const isEqui=iso&&Math.abs(p.v-p.a*Math.sqrt(3)/2)<.07;
 const {A,B,C:V}=triangleShape(p,{iso});const T0={A,B,C:V};let la=triangleAngles7(T0);
 const points=[p2(A),p2(B),p2(V)];
 const uTime=op(t/6),f=smooth(uTime);
 if(id==='7-03-C04'){
  // 7-03-C04: Hai đoạn tổng xanh/cam, đoạn thử khép tam giác tím
  const works=p.a+p.b>p.c&&p.b+p.c>p.a&&p.c+p.a>p.b;
  const Apx=p2([0,0]),Bpx=p2([p.a,0]);
  const rB=p.b*55,rC=p.c*55;
  s+=`<defs><clipPath id="clip-703c04"><rect x="22" y="27" width="468" height="421" rx="10"/></clipPath></defs><g clip-path="url(#clip-703c04)">`;
  s+=`<circle cx="${q(Apx[0])}" cy="${q(Apx[1])}" r="${q(rB)}" fill="none" stroke="#CBD5E1" stroke-width="1.6" stroke-dasharray="6 5"/>`;
  s+=`<circle cx="${q(Bpx[0])}" cy="${q(Bpx[1])}" r="${q(rC)}" fill="none" stroke="#CBD5E1" stroke-width="1.6" stroke-dasharray="6 5"/></g>`;
  if(works){
   const u=(p.a*p.a+p.b*p.b-p.c*p.c)/(2*p.a),h=Math.sqrt(Math.max(0,p.b*p.b-u*u));
   const Cpx=p2([u,h]);
   const angA=Math.atan2(Apx[1]-Cpx[1],Cpx[0]-Apx[0]),angB=Math.atan2(Bpx[1]-Cpx[1],Cpx[0]-Bpx[0]);
   const curAngA=lerp(angA+0.42,angA,f),curAngB=lerp(angB-0.42,angB,f);
   const tipA=[Apx[0]+rB*Math.cos(curAngA),Apx[1]-rB*Math.sin(curAngA)];
   const tipB=[Bpx[0]+rC*Math.cos(curAngB),Bpx[1]-rC*Math.sin(curAngB)];
   const pts=[Apx,Bpx,Cpx];
   s+=P(pts,'#EDE9FE55',PURPLE,2.5);
   s+=L(Apx[0],Apx[1],Bpx[0],Bpx[1],PURPLE,4.5);
   s+=L(Apx[0],Apx[1],tipA[0],tipA[1],BLUE,4.5)+L(Bpx[0],Bpx[1],tipB[0],tipB[1],ORANGE,4.5);
   s+=T((pts[0][0]+pts[1][0])/2-12,pts[0][1]+22,`c = ${q(p.a)}`,PURPLE,15,700);
   s+=T((pts[0][0]+pts[2][0])/2-38,(pts[0][1]+pts[2][1])/2-6,`b = ${q(p.b)}`,BLUE,15,700);
   s+=T((pts[1][0]+pts[2][0])/2+10,(pts[1][1]+pts[2][1])/2-6,`a = ${q(p.c)}`,ORANGE,15,700);
   pts.forEach((pt,i)=>s+=marker(pt,'ABC'[i],{fill:PURPLE}));
  }else{
   const angA=lerp(0.95,0.12,f),angB=lerp(Math.PI-0.95,Math.PI-0.12,f);
   const tipA=[Apx[0]+rB*Math.cos(angA),Apx[1]-rB*Math.sin(angA)];
   const tipB=[Bpx[0]+rC*Math.cos(angB),Bpx[1]-rC*Math.sin(angB)];
   s+=L(Apx[0],Apx[1],Bpx[0],Bpx[1],PURPLE,5);
   s+=L(Apx[0],Apx[1],tipA[0],tipA[1],BLUE,5)+L(Bpx[0],Bpx[1],tipB[0],tipB[1],ORANGE,5);
   s+=L(tipA[0],tipA[1],tipB[0],tipB[1],RED,3,'5 4');
   s+=T(500,310,'Không dựng được tam giác',RED,22,700);
  }
  s+=T(500,115,`a=${p.a}  b=${p.b}  c=${p.c}`,INK,19);
  s+=T(500,155,works?'Ba bất đẳng thức đều đúng':'Có ít nhất một bất đẳng thức sai',works?PURPLE:RED,19);
  s+=T(500,195,`• Kiểm tra: ${p.a}+${p.b}=${q(p.a+p.b)} ${p.a+p.b>p.c?'>':'≤'} ${p.c}`,works?BLUE:RED,15,650);
  s+=T(500,225,'• Kết luận: Trong tam giác, tổng 2 cạnh (xanh + cam) luôn lớn hơn cạnh thứ 3 (tím)',INK,13.5,600);
  return s;
 }
 // 7-03-C01: Ba góc tam giác có ba màu xanh/cam/tím
 const cols=id==='7-03-C02'?[BLUE,SLATE,ORANGE]:(id==='7-03-C05'?[ORANGE,ORANGE,PURPLE]:[BLUE,ORANGE,PURPLE]);
 s+=angleArcPts(points[0],points[1],points[2],32,cols[0],`${q(la.A)}°`,1,0.22);
 s+=angleArcPts(points[1],points[2],points[0],32,cols[1],`${q(la.B)}°`,id==='7-03-C05'?1:2,0.22);
 s+=angleArcPts(points[2],points[0],points[1],32,cols[2],`${q(la.C)}°`,3,0.22);
 if(id==='7-03-C05'){
  // 7-03-C05: Hai cạnh bằng nhau xanh; góc ở đáy cam; trạng thái tam giác đều nhấn ba cạnh cùng xanh
  s+=P(points,'#DBEAFE44','none',0);
  s+=L(...points[0],...points[2],BLUE,4)+L(...points[1],...points[2],BLUE,4);
  s+=L(...points[0],...points[1],isEqui?BLUE:SLATE,isEqui?4:3);
 }else{
  s+=P(points,'#DBEAFE38',SLATE,3);
 }
 const triOff=[[-24,16],[12,16],[-6,-14]];
 for(let i=0;i<3;i++)s+=marker(points[i],'ABC'[i],{drag:true,dx:triOff[i][0],dy:triOff[i][1]});
 if(id==='7-03-C01'){
  s+=box(536,52,334,368,'#F8FAFC');
  s+=T(548,84,'Tổng ba góc tam giác',INK,20,700)+T(548,116,`A+B+C = ${q(la.A)}° + ${q(la.B)}° + ${q(la.C)}° = ${q(la.A+la.B+la.C)}°`,PURPLE,15.5,700);
  s+=T(548,146,'• Quan sát: Bản sao 3 góc A (xanh), B (cam),',INK,13,600);
  s+=T(558,168,'C (tím) trượt ghép khít thành góc bẹt 180°.',INK,13,600);
  s+=T(548,194,'• Kết luận: Tổng 3 góc tam giác luôn bằng 180°.',PURPLE,13,700);
  const gx=703,gy=336,rTarget=62,rMove=lerp(32,rTarget,f);
  // Khung góc bẹt 180° đích tại (gx, gy): luôn hiển thị rõ 3 góc A, C, B ghép thành 180° ngay cả tại t = 0
  s+=sector(gx,gy,rTarget,-180,-180+la.A,'#DBEAFE99',BLUE,1.5);
  s+=sector(gx,gy,rTarget,-180+la.A,-la.B,'#EDE9FE99',PURPLE,1.5);
  s+=sector(gx,gy,rTarget,-la.B,0,'#FEF3C799',ORANGE,1.5);
  // Bản sao động xuất phát đúng từ góc trong tại đỉnh A, B, C của tam giác (không bị chĩa ra ngoài tại t = 0)
  const copyA=[lerp(points[0][0],gx,f),lerp(points[0][1],gy,f)];
  const copyB=[lerp(points[1][0],gx,f),lerp(points[1][1],gy,f)];
  const copyC=[lerp(points[2][0],gx,f),lerp(points[2][1],gy,f)];
  const startA=lerp(-la.A,-180,f);
  const startB=lerp(-180,-la.B,f);
  const startC=lerp(la.B,-180+la.A,f);
  if(f>0.02){
   s+=L(points[0][0],points[0][1],copyA[0],copyA[1],BLUE,1.5,'5 4');
   s+=L(points[1][0],points[1][1],copyB[0],copyB[1],ORANGE,1.5,'5 4');
   s+=L(points[2][0],points[2][1],copyC[0],copyC[1],PURPLE,1.5,'5 4');
  }
  s+=sector(copyA[0],copyA[1],rMove,startA,startA+la.A,BLUE);
  s+=sector(copyC[0],copyC[1],rMove,startC,startC+la.C,PURPLE);
  s+=sector(copyB[0],copyB[1],rMove,startB,startB+la.B,ORANGE);
  const angles=[la.A,la.B,la.C];
  for(let i=0;i<3;i++){
   s+=T(550+i*104,238,`${'ABC'[i]}=${q(angles[i])}°`,cols[i],14.5,700);
  }
  s+=L(610,gy,796,gy,PURPLE,3)+C(gx,gy,4.5,PURPLE);
  s+=T(550,378,'Ba góc ghép khít thành góc bẹt 180°',INK,13.5,700);
  s+=T(550,402,'(Kết luận: ∠A + ∠B + ∠C = 180°)',PURPLE,13.5,700);
 }else if(id==='7-03-C02'){
  // 7-03-C02: Hai góc trong không kề xanh/cam, góc ngoài tím
  const [bx,by]=points[1];const extPt=[bx+125,by];
  const extStart=-la.A-la.C;
  const byRad=-la.A*Math.PI/180,byPt=[bx+66*Math.cos(byRad),by+66*Math.sin(byRad)];
  // Vùng đích tại góc ngoài B chia bởi tia phụ By // AC thành góc C (cam) và góc A (xanh)
  s+=sector(bx,by,38,extStart,extStart+la.C,'#FEF3C799',ORANGE,1.4);
  s+=sector(bx,by,38,-la.A,0,'#DBEAFE99',BLUE,1.4);
  s+=L(bx,by,byPt[0],byPt[1],SLATE,1.8,'4 3');
  // Bản sao góc A và góc C xuất phát đúng bên trong đỉnh A và đỉnh C tại t = 0, trượt khớp vào góc ngoài B
  const copyA=[lerp(points[0][0],bx,f),lerp(points[0][1],by,f)];
  const copyC=[lerp(points[2][0],bx,f),lerp(points[2][1],by,f)];
  const startC=lerp(la.B,extStart,f);
  s+=sector(copyC[0],copyC[1],36,startC,startC+la.C,ORANGE);
  s+=sector(copyA[0],copyA[1],36,-la.A,0,BLUE);
  s+=angleArcPts(points[1],extPt,points[2],48,PURPLE,`∠B_ng=${q(180-la.B)}°`,2,0.16);
  s+=L(bx,by,extPt[0],extPt[1],PURPLE,4)+T(extPt[0]+6,extPt[1]+5,'x',PURPLE,16,700);
  s+=box(500,52,368,218,'#F8FAFC');
  s+=T(515,84,`Góc ngoài tại B = ${q(180-la.B)}° (tím)`,PURPLE,19,700)+T(515,116,`Góc A + C = ${q(la.A)}° + ${q(la.C)}° = ${q(la.A+la.C)}°`,INK,16.5,700);
  s+=T(515,148,'• Quan sát: Bản sao ∠A (xanh) và ∠C (cam) trượt',INK,13.5,600);
  s+=T(527,170,'từ đỉnh A, C khớp vào góc ngoài ∠CBx (tím).',INK,13.5,600);
  s+=T(515,198,'• Tương quan: Khi kéo C, ∠CBx luôn bằng ∠A + ∠C.',BLUE,13.5,600);
  s+=T(515,226,'• Kết luận: Mỗi góc ngoài của tam giác bằng tổng',PURPLE,13.5,700);
  s+=T(527,248,'hai góc trong không kề với nó (∠CBx = ∠A + ∠C).',PURPLE,13.5,700);
 }else if(id==='7-03-C03'){
  // 7-03-C03: Góc lớn và cạnh đối diện cùng màu cam; góc nhỏ/cạnh đối ứng xanh
  const sides=[dist(A,V),dist(A,B),dist(B,V)]; // AC (opp B), AB (opp C), BC (opp A)
  const maxS=Math.max(...sides),minS=Math.min(...sides);
  const roleCol=val=>Math.abs(val-maxS)<1e-6?ORANGE:(Math.abs(val-minS)<1e-6?BLUE:PURPLE);
  const sideCols=[roleCol(sides[0]),roleCol(sides[1]),roleCol(sides[2])];
  s+=L(...points[0],...points[2],sideCols[0],4.2);
  s+=L(...points[0],...points[1],sideCols[1],4.2);
  s+=L(...points[1],...points[2],sideCols[2],4.2);
  s+=T((points[0][0]+points[2][0])/2-38,(points[0][1]+points[2][1])/2-6,`b=${q(sides[0])}`,sideCols[0],14,700);
  s+=T((points[0][0]+points[1][0])/2-16,points[0][1]+22,`c=${q(sides[1])}`,sideCols[1],14,700);
  s+=T((points[1][0]+points[2][0])/2+10,(points[1][1]+points[2][1])/2-6,`a=${q(sides[2])}`,sideCols[2],14,700);
  s+=T(515,105,'Góc lớn đối diện cạnh lớn',ORANGE,20,700);
  for(const [i,c] of sides.entries()){
   const yRow=146+i*38;
   s+=T(525,yRow,`${['AC (đối ∠B)','AB (đối ∠C)','BC (đối ∠A)'][i]} = ${q(c)}`,sideCols[i],15.5,700);
   s+=`<rect x="740" y="${q(yRow-13)}" width="${q(Math.min(125,c*14*(0.25+0.75*f)))}" height="12" rx="6" fill="${sideCols[i]}"/>`;
  }
  s+=T(515,272,'• Quan sát: Cạnh lớn nhất & góc đối diện tô cam; cạnh nhỏ nhất & góc đối diện tô xanh',INK,13.5,600);
  s+=T(515,300,'• Kết luận: Cạnh lớn hơn đối diện góc lớn hơn (BC > AC ⇔ ∠A > ∠B)',PURPLE,13.5,700);
 }else if(id==='7-03-C05'){
  const ac=dist(A,V),H=p2([p.a/2,0]);
  const foldX=lerp(points[0][0],points[1][0],f);
  s+=P([H,points[2],[foldX,H[1]]],'#EDE9FE55',PURPLE,2);
  s+=L(...points[2],...H,PURPLE,3.5,'8 5')+T(H[0]-6,H[1]+20,'H',PURPLE,15,700);
  s+=rightMarkPts(H,points[2],points[1],11,PURPLE);
  s+=tickMarkPts(points[0],points[2],1,BLUE)+tickMarkPts(points[1],points[2],1,BLUE);
  if(isEqui)s+=tickMarkPts(points[0],points[1],1,BLUE);
  s+=T(515,108,`AC = BC = ${q(ac)}`,BLUE,20,700);
  s+=T(515,144,isEqui?'Tam giác đều: 3 cạnh bằng nhau (xanh)':'Tam giác cân tại C (2 cạnh bên xanh)',INK,18,700);
  s+=T(515,178,`Hai góc đáy (cam): ∠A = ∠B = ${q(la.A)}° · ∠C = ${q(la.C)}°`,ORANGE,16.5,700);
  s+=T(515,216,'• Quan sát: Nửa tam giác trái lật qua trục đối xứng CH (tím đứt) chồng khít nửa phải',INK,13.5,600);
  s+=T(515,244,'• Kết luận: Tam giác cân có hai cạnh bên (xanh) và hai góc ở đáy (cam) bằng nhau;',PURPLE,13.5,700);
  s+=T(515,270,'  khi 3 góc đều bằng 60° thì tam giác cân trở thành tam giác đều.',PURPLE,13.5,600);
 }
 return s;
}

/* ==========================================================================
   NHÓM 7-05: CÁC ĐƯỜNG ĐỒNG QUY TRONG TAM GIÁC (DỰNG TUẦN TỰ 3 MÀU)
   ========================================================================== */
function drawCenters(id,p,t){
 let s=box(20,25,860,425),{A,B,C:V}=triangle7(p);let CT=triangleCenters7({A,B,C:V});let pts=[p2(A),p2(B),p2(V)],Pp=z=>p2(z),ptG=Pp(CT.G),ptI=Pp(CT.I),ptO=Pp(CT.O),ptH=Pp(CT.H);
 const triOff=[[-24,16],[12,16],[-6,-14]];
 if(id!=='7-05-C05'){
  s+=P(pts,'#F8FAFC',SLATE,3);
  for(const [i,pix] of pts.entries())s+=marker(pix,'ABC'[i],{drag:true,dx:triOff[i][0],dy:triOff[i][1]});
 }
 const u=op(t/6);
 const pLine=[
  0.2+0.8*smooth(subPhase(u,0.0,0.34)),
  smooth(subPhase(u,0.26,0.62)),
  smooth(subPhase(u,0.54,0.88))
 ];
 const pFinal=smooth(subPhase(u,0.75,1.0));
 const lineCols=[BLUE,ORANGE,PURPLE];
 const drawSeqLine=(a,b,idx,dash='')=>{
  const prog=pLine[idx];
  const to=[lerp(a[0],b[0],prog),lerp(a[1],b[1],prog)];
  return L(...a,...b,'#CBD5E1',1.8,'5 6')+L(...a,...to,lineCols[idx],3.2,dash);
 };
 if(id==='7-05-C01'){
  const mBC=Pp(med(B,V)),mAC=Pp(med(A,V)),mAB=Pp(med(A,B));
  s+=tickMarkPts(pts[1],mBC,1,BLUE)+tickMarkPts(mBC,pts[2],1,BLUE);
  s+=tickMarkPts(pts[0],mAC,2,ORANGE)+tickMarkPts(mAC,pts[2],2,ORANGE);
  s+=tickMarkPts(pts[0],mAB,3,PURPLE)+tickMarkPts(mAB,pts[1],3,PURPLE);
  const meds=[['A','B','C','M',0],['B','A','C','N',1],['C','A','B','P',2]];
  for(const [z,x,y,n,idx] of meds){
   const M=med(triangle7(p)[x],triangle7(p)[y]);
   s+=drawSeqLine(Pp(triangle7(p)[z]),Pp(M),idx)+marker(Pp(M),n,{radius:4.5,fill:lineCols[idx]});
  }
  const ag=dist(A,CT.G),am=dist(A,med(B,V));
  s+=marker(ptG,'G',{radius:7+2*pFinal,fill:PURPLE})+T(535,105,'AG = 2 GM (AG/AM = 2/3)',PURPLE,21,700)+T(535,142,'G là trọng tâm tam giác',INK,19,700);
  s+=T(535,178,`• Độ dài: AG = ${q(ag)} · AM = ${q(am)} · Tỉ số AG/AM = ${q(ag/am)}`,BLUE,15,650);
  s+=T(535,214,'• Quan sát: Ba trung tuyến AM (xanh), BN (cam), CP (tím) đồng quy tại G',INK,13.5,600);
  s+=T(535,242,'• Kết luận: Trọng tâm G cách mỗi đỉnh một khoảng bằng 2/3 trung tuyến',PURPLE,13.5,700);
 }else if(id==='7-05-C02'){
  const la=triangleAngles7({A,B,C:V});
  s+=angleArcPts(pts[0],pts[1],ptI,26,BLUE,'',1,0.18)+angleArcPts(pts[0],ptI,pts[2],31,BLUE,`${q(la.A/2)}°`,1,0.18);
  s+=angleArcPts(pts[1],pts[2],ptI,26,ORANGE,'',2,0.18)+angleArcPts(pts[1],ptI,pts[0],31,ORANGE,`${q(la.B/2)}°`,2,0.18);
  [A,B,V].forEach((z,idx)=>{s+=drawSeqLine(Pp(z),ptI,idx);});
  s+=`<circle cx="${q(ptI[0])}" cy="${q(ptI[1])}" r="${q(CT.r*55*(0.25+0.75*pFinal))}" fill="#DBEAFE55" stroke="${BLUE}" stroke-width="3" stroke-dasharray="7 5"/>`;
  const footAB=[ptI[0],pts[0][1]];s+=L(ptI[0],ptI[1],footAB[0],footAB[1],PURPLE,2.2,'4 3')+rightMarkPts(footAB,ptI,pts[1],9,PURPLE);
  s+=marker(ptI,'I',{fill:PURPLE})+T(535,108,`r = ${q(CT.r)} (cách đều 3 cạnh)`,BLUE,20,700)+T(535,144,'Ba đường phân giác đồng quy tại I',INK,18,700);
  s+=T(535,182,'• Quan sát: Ba phân giác (xanh, cam, tím) cắt nhau tại I, đường tròn nội tiếp xanh nhạt',INK,13.5,600);
  s+=T(535,212,'• Kết luận: Giao điểm 3 phân giác là tâm đường tròn nội tiếp tam giác',PURPLE,13.5,700);
 }else if(id==='7-05-C03'){
  // 7-05-C03: Trung trực nét đứt xanh/cam/tím; đường tròn ngoại tiếp viền cam
  s+=`<circle cx="${q(ptO[0])}" cy="${q(ptO[1])}" r="${q(CT.R*55*(0.25+0.75*pFinal))}" fill="none" stroke="${ORANGE}" stroke-width="2.8" stroke-dasharray="7 5"/>`;
  for(const [idx,[x,y]] of [[0,[A,B]],[1,[A,V]],[2,[B,V]]]){
   const M=Pp(med(x,y)),P1=Pp(x),P2=Pp(y);
   s+=tickMarkPts(P1,M,idx+1,lineCols[idx])+tickMarkPts(M,P2,idx+1,lineCols[idx]);
   s+=rightMarkPts(M,ptO,P2,9,PURPLE)+drawSeqLine(M,ptO,idx,'7 4');
  }
  for(const v of pts)s+=L(ptO[0],ptO[1],v[0],v[1],ORANGE,1.8,'4 4');
  s+=marker(ptO,'O',{fill:PURPLE})+T(535,108,`OA = OB = OC = ${q(CT.R)}`,ORANGE,19,700)+T(535,144,'Ba đường trung trực đồng quy tại O',INK,18,700);
  s+=T(535,182,'• Quan sát: Ba trung trực nét đứt (xanh, cam, tím) hội tụ tại O, đường tròn ngoại tiếp viền cam',INK,13.5,600);
  s+=T(535,212,'• Kết luận: Giao điểm 3 trung trực cách đều 3 đỉnh (OA = OB = OC)',PURPLE,13.5,700);
 }else if(id==='7-05-C04'){
  [[A,B,V,0],[B,A,V,1],[V,A,B,2]].forEach(([x,Y,Z,idx])=>{
   const e=[Z[0]-Y[0],Z[1]-Y[1]],k=((x[0]-Y[0])*e[0]+(x[1]-Y[1])*e[1])/(e[0]*e[0]+e[1]*e[1]);
   const F=Pp([Y[0]+k*e[0],Y[1]+k*e[1]]);
   s+=rightMarkPts(F,Pp(x),Pp(Z),10,PURPLE)+drawSeqLine(Pp(x),F,idx);
  });
  s+=marker(ptH,'H',{fill:PURPLE})+T(535,108,`H = (${q(CT.H[0])};${q(CT.H[1])})`,PURPLE,19,700)+T(535,144,'Ba đường cao đồng quy tại trực tâm H',INK,18,700);
  s+=T(535,182,'• Quan sát: Ba đường cao (xanh, cam, tím) kèm kí hiệu góc vuông ⊥ rõ ràng tại chân đường cao',INK,13.5,600);
  s+=T(535,212,'• Kết luận: Ba đường cao của tam giác luôn cùng đi qua trực tâm H',PURPLE,13.5,700);
 }else{
  // 7-05-C05: Dựng đường trung trực của đoạn thẳng AB bằng thước và compa với bán kính R = AB
  const abVal=clamp(Number(p.a)||6,3,8);
  const rr=abVal*21.5; // Bán kính đường tròn compa R = đúng độ dài đoạn thẳng AB
  const mx=268,my=238;
  const ptA=[mx-rr/2,my],ptB=[mx+rr/2,my],M=[mx,my];
  const h=rr*Math.sqrt(3)/2; // Chiều cao tam giác đều PAB và QAB: PM = QM = AB * sqrt(3)/2
  const Ptop=[mx,my-h],Pbot=[mx,my+h];
  s+=`<defs><clipPath id="clip-705c05"><rect x="22" y="27" width="496" height="421" rx="10"/></clipPath></defs>`;
  s+=`<g clip-path="url(#clip-705c05)">`;
  s+=`<circle cx="${q(ptA[0])}" cy="${q(ptA[1])}" r="${q(rr*pLine[0])}" fill="none" stroke="${BLUE}" stroke-width="2.6" stroke-dasharray="6 5"/>`;
  s+=`<circle cx="${q(ptB[0])}" cy="${q(ptB[1])}" r="${q(rr*pLine[1])}" fill="none" stroke="${ORANGE}" stroke-width="2.6" stroke-dasharray="6 5"/>`;
  const yStart=my-h-24,yEndFull=my+h+24;
  const lineEnd=lerp(yStart,yEndFull,0.2+0.8*pLine[2]);
  s+=L(mx,yStart,mx,lineEnd,PURPLE,3.8,'7 5');
  s+=`</g>`;
  s+=L(ptA[0],ptA[1],ptB[0],ptB[1],SLATE,4);
  s+=tickMarkPts(ptA,M,1,PURPLE)+tickMarkPts(M,ptB,1,PURPLE);
  s+=rightMarkPts(M,Ptop,ptB,11,PURPLE);
  s+=L(Ptop[0],Ptop[1],ptA[0],ptA[1],BLUE,2.2,'5 4')+L(Ptop[0],Ptop[1],ptB[0],ptB[1],ORANGE,2.2,'5 4');
  s+=L(Pbot[0],Pbot[1],ptA[0],ptA[1],BLUE,1.7,'4 4')+L(Pbot[0],Pbot[1],ptB[0],ptB[1],ORANGE,1.7,'4 4');
  s+=tickMarkPts(Ptop,ptA,2,BLUE)+tickMarkPts(Ptop,ptB,2,ORANGE);
  s+=marker(ptA,'A',{dx:-22,dy:18})+marker(ptB,'B',{drag:true,dx:10,dy:18})+marker(M,'M',{radius:5,fill:PURPLE,dx:8,dy:-6});
  s+=marker(Ptop,'P',{radius:6.5,fill:PURPLE,dx:10,dy:-6})+marker(Pbot,'Q',{radius:6.5,fill:PURPLE,dx:10,dy:16});
  s+=T(528,96,'Dựng trung trực bằng thước và compa',INK,19.5,700);
  s+=T(528,130,`Bán kính compa: R = AB = ${q(abVal)} ⇒ PA = PB = AB`,BLUE,15,700);
  s+=T(528,164,'• B1: Vẽ đường tròn tâm A bán kính R = AB (xanh, đi qua B)',INK,13.2,600);
  s+=T(528,194,'• B2: Vẽ đường tròn tâm B bán kính R = AB (cam, đi qua A) cắt tại P, Q',INK,13.2,600);
  s+=T(528,224,`• B3: Kẻ đường thẳng PQ (tím) ⊥ AB tại trung điểm M (MA = MB = ${q(abVal/2)})`,BLUE,13.2,600);
  s+=T(528,256,'• Kết luận: Điểm nằm trên đường trung trực thì cách đều hai đầu mút A, B',PURPLE,13.5,700);
 }
 if(id!=='7-05-C05')for(const [j,pt] of pts.entries())s+=`<circle cx="${q(pt[0])}" cy="${q(pt[1])}" r="21" fill="transparent" data-pt="${'ABC'[j]}" style="cursor:grab"/>`;
 return s;
}

/* ==========================================================================
   NHÓM 7-06: BIỂU ĐỒ QUẠT TRÒN (DA_MAU: NHÓM NHẤT QUÁN, PHẦN CHÊNH LỆCH TÍM MỜ)
   ========================================================================== */
function sector(cx,cy,r,a1,a2,color,strokeCol='white',sw=2){
 if(Math.abs(a2-a1)<0.2)return '';
 const pt=a=>[cx+r*Math.cos(a*Math.PI/180),cy+r*Math.sin(a*Math.PI/180)];
 const a=pt(a1),b=pt(a2);
 return `<path d="M ${q(cx)} ${q(cy)} L ${q(a[0])} ${q(a[1])} A ${q(r)} ${q(r)} 0 ${a2-a1>180?1:0} 1 ${q(b[0])} ${q(b[1])} Z" fill="${color}" stroke="${strokeCol}" stroke-width="${sw}"/>`;
}
function drawPie(id,p,t,ctx={}){
 const data=pieData(p);
 const u=op(t/6),f=smooth(u),r=155,rCur=lerp(r*0.86,r,f);
 let s=box(20,25,860,425),cx=275,cy=240,angle=-90;
 const cols=[BLUE,ORANGE,GREEN],hidden=new Set(ctx.hiddenPie||[]);
 for(let i=0;i<3;i++){
  const mid=(angle+data.angles[i]/2)*Math.PI/180;
  s+=`<g opacity="${hidden.has(i)?.13:1}">`+sector(cx,cy,rCur,angle,angle+data.angles[i],cols[i])+T(cx+92*Math.cos(mid)-18,cy+92*Math.sin(mid)+5,`${Math.round(data.angles[i])}°`,'white',15,700)+'</g>';
  angle+=data.angles[i];
 }
 for(let i=0;i<3;i++)s+=`${C(520,124+i*44,8,cols[i])}${T(541,130+i*44,`Nhóm ${'ABC'[i]}: ${data.values[i]}% (góc ${Math.round(data.angles[i])}°)`,INK,17.5,650)}`;
 let boundary=-90;
 for(const [i,label] of [[0,'pieA'],[1,'pieB']]){
  boundary+=data.angles[i];const hx=cx+r*Math.cos(boundary*Math.PI/180),hy=cy+r*Math.sin(boundary*Math.PI/180);
  s+=C(hx,hy,10,'white',ORANGE)+`<circle cx="${q(hx)}" cy="${q(hy)}" r="23" fill="transparent" data-pt="${label}" style="cursor:grab"/>`;
 }
 s+=T(520,264,'• Quan sát: Kéo hai nút trên vành để đổi tỉ lệ (θᵢ = 3,6° × pᵢ%)',INK,13.5,600);
 s+=T(520,290,'• Tương quan: Tổng tỉ lệ luôn bằng 100% ⇔ Tổng góc tâm = 360°',BLUE,13.5,600);
 s+=T(520,316,'• Kết luận: Góc quạt tròn tỉ lệ thuận với phần trăm của nhóm',GREEN,13.5,700);
 if(id==='7-06-C02'){
  // 7-06-C02: Hai nhóm cần so sánh xanh/cam, phần chênh lệch tím mờ
  const wA=data.values[0]*3.1*(0.25+0.75*f),wB=data.values[1]*3.1*(0.25+0.75*f);
  const minW=Math.min(wA,wB),diffW=Math.abs(wA-wB);
  s+=T(520,348,`So sánh Nhóm A (${data.values[0]}%) & Nhóm B (${data.values[1]}%) · Chênh lệch = ${Math.abs(data.values[0]-data.values[1])}% (tím):`,PURPLE,14.5,700);
  s+=`<rect x="520" y="358" width="${q(wA)}" height="16" rx="4" fill="${BLUE}"/>`;
  s+=`<rect x="520" y="380" width="${q(wB)}" height="16" rx="4" fill="${ORANGE}"/>`;
  if(diffW>1){
   s+=`<rect x="${q(520+minW)}" y="355" width="${q(diffW)}" height="44" rx="4" fill="#EDE9FE88" stroke="${PURPLE}" stroke-width="1.8" stroke-dasharray="4 3"/>`;
  }
  s+=T(520,415,`Phần còn lại Nhóm C: ${data.values[2]}% · Tổng = ${data.sum}%`,GREEN,13.5,700);
 }
 if(id==='7-06-C03'){
  const h=0.2+0.8*f;
  for(let i=0;i<3;i++){
   s+=`<rect x="${540+i*84}" y="${q(365-data.values[i]*1.8*h)}" width="42" height="${q(data.values[i]*1.8*h)}" fill="${cols[i]}" opacity=".9"/>`+T(547+i*84,400,'ABC'[i]);
  }
  s+=T(520,88,'Cùng bảng dữ liệu, 2 cách biểu diễn đồng nhất màu nhóm',INK,17,700);
 }
 return s;
}

/* ==========================================================================
   NHÓM 7-07: BIỂU ĐỒ ĐOẠN THẲNG
   - 7-07-C01: GIU_TRUNG_TINH (Đường đồ thị và điểm dữ liệu màu hiện có; chỉ highlight điểm đang thêm)
   - 7-07-C02: DA_MAU (Đoạn tăng xanh, đoạn giảm cam; mốc so sánh tím)
   ========================================================================== */
function drawLineChart(id,p,t){
 let s=box(20,25,860,425)+gridChart(),arr=[p.y1,p.y2,p.y3,p.y4],x=[180,370,560,750],y=arr.map(v=>395-v*15);
 const u=op(t/6),prog=lerp(0.35,3,smooth(u));
 for(let j=0;j<3;j++){
  const local=op(prog-j);
  const dyVal=arr[j+1]-arr[j];
  const col=id==='7-07-C02'?(dyVal>=0?BLUE:ORANGE):SLATE;
  s+=L(x[j],y[j],x[j+1],y[j+1],'#CBD5E1',2,'4 4');
  if(local>0){
   const ex=lerp(x[j],x[j+1],local),ey=lerp(y[j],y[j+1],local);
   s+=L(x[j],y[j],ex,ey,col,4.5);
  }
  s+=T((x[j]+x[j+1])/2-24,(y[j]+y[j+1])/2-10,`Δy=${dyVal>=0?'+'+dyVal:dyVal}`,col,13,700);
 }
 const activeIdx=Math.min(3,Math.ceil(prog));
 for(let j=0;j<4;j++){
  const ptCol=id==='7-07-C01'?(j===activeIdx?ORANGE:SLATE):PURPLE;
  s+=marker([x[j],y[j]],`${arr[j]}`,{radius:j===activeIdx?8:6.5,fill:ptCol})+`<circle cx="${x[j]}" cy="${q(y[j])}" r="17" fill="transparent" data-pt="P${j}" style="cursor:grab"/>`+T(x[j]-16,428,`Kì ${j+1}`,INK,16);
 }
 const i=Math.min(2,Math.floor(prog)),z=prog-i;
 s+=C(x[i]+(x[i+1]-x[i])*z,y[i]+(y[i+1]-y[i])*z,9,ORANGE);
 if(id==='7-07-C02')s+=T(115,48,'So sánh xu hướng · Xanh: đoạn tăng (Δy ≥ 0) · Cam: đoạn giảm (Δy < 0) · Mốc so sánh tím',INK,15,700);
 else s+=T(115,48,'Biểu đồ đoạn thẳng theo thời gian · Đường đồ thị trung tính, nhấn cam điểm đang thêm',INK,15,700);
 s+=T(115,72,'• Quan sát: Kéo các điểm P₁..P₄ · Kết luận: Độ dốc đoạn thẳng thể hiện xu thế tăng/giảm theo thời gian',SLATE,13.5,600);
 return s;
}

/* ==========================================================================
   NHÓM 7-10: XÁC SUẤT & PHÉP THỬ NGẪU NHIÊN
   - 7-10-C01: MOT_NHAN (Kết quả phép thử sau khi dừng dùng viền cam, các kết quả khác trung tính)
   - 7-10-C02: DA_MAU (Các kết quả thuận lợi xanh, không thuận lợi xám; kết quả vừa trúng cam)
   - 7-10-C03: DA_MAU (Cột tần suất thực nghiệm xanh, đường xác suất lý thuyết cam nét đứt)
   ========================================================================== */
function drawProbability(id,p,t,ctx={}){
 const samples=ctx.count??0,seed=ctx.seed??2026,n=id==='7-10-C01'?2:id==='7-10-C02'?Math.round(p.faces):6,data=grade7Frequency(id,samples,seed,p.faces??6,p.fav??3);
 const u=op(t/8),ease=1-Math.pow(1-u,3);
 const isSpinning=u>0&&u<0.96;
 const rawOut=grade7Outcome(id,Math.max(0,(samples||1)-1),seed,n);
 const winIdx=id==='7-10-C01'?rawOut:(rawOut-1);
 const targetDeg=(winIdx+0.5)*(360/n);
 const spin=targetDeg-(1-ease)*1080;
 let s=box(20,25,860,425),cx=238,cy=248,r=140;
 const winLabel=String(id==='7-10-C01'?winIdx:winIdx+1);
 s+=T(45,58,u===0?`🎲 Sẵn sàng — Bấm [▶ Phát] để thực hiện phép thử (Ô mục tiêu: ${winLabel})`:isSpinning?`🔄 Đang quay giảm tốc (${Math.round(u*100)}%)...`:`🎯 ĐÃ DỪNG TẠI 100%: Kết quả dừng tại Ô số ${winLabel} (nhấn viền cam)`,isSpinning?ORANGE:INK,15.5,700);
 for(let i=0;i<n;i++){
  const isWin=!isSpinning&&u>=0.96&&i===winIdx;
  let col='#64748B';
  if(id==='7-10-C01')col=i%2===0?'#64748B':'#475569';
  else if(id==='7-10-C02')col=i<data.chosen?BLUE:'#94A3B8';
  else col=i%2===1?BLUE:'#64748B';
  const strokeCol=isWin?ORANGE:'white';
  const sw=isWin?4.5:2;
  s+=sector(cx,cy,isWin?r+6:r,i*360/n-90,i*360/n-90+360/n,col,strokeCol,sw);
  const angle=(i+.5)*Math.PI*2/n-Math.PI/2;
  s+=T(cx+88*Math.cos(angle)-8,cy+88*Math.sin(angle)+5,String(id==='7-10-C01'?i:i+1),'white',20);
 }
 const ang=(spin*Math.PI/180-Math.PI/2),tip=[cx+118*Math.cos(ang),cy+118*Math.sin(ang)];
 s+=L(cx,cy,...tip,'#ffffff',8)+L(cx,cy,...tip,ORANGE,4.5)+C(cx,cy,10,INK);
 s+=T(505,98,`Đã thực hiện: N = ${samples} phép thử`,INK,20);
 s+=T(505,126,'• Quan sát: Góc các quạt bằng nhau ⇒ kết quả đồng khả năng',SLATE,13.5,600);
 const spacing=Math.min(38,240/n);
 const expectedBar=(1/n)*250,expectedX=505+expectedBar;
 for(let i=0;i<n;i++){
  const y=155+i*spacing,bar=(data.hist[i]/Math.max(samples,1))*250*(0.25+0.75*ease);
  const isWin=!isSpinning&&u>=0.96&&i===winIdx;
  const bCol=id==='7-10-C01'?(isWin?ORANGE:SLATE):(id==='7-10-C02'?(i<data.chosen?BLUE:'#94A3B8'):BLUE);
  s+=`<rect x="505" y="${q(y)}" width="${q(bar)}" height="${q(Math.min(20,spacing-4))}" rx="3" fill="${bCol}" stroke="${isWin?ORANGE:'none'}" stroke-width="${isWin?2:0}"/>`+T(772,y+Math.min(17,spacing-5),`${id==='7-10-C01'?i:i+1}: ${data.hist[i]}`,INK,Math.min(15,spacing*.68));
 }
 // Đường chuẩn xác suất lý thuyết (nét đứt cam)
 s+=L(expectedX,148,expectedX,155+n*spacing,ORANGE,2.5,'6 4');
 if(id==='7-10-C02')s+=T(505,435,`Thuận lợi A = {1,…,${data.chosen}} (xanh) · P(A) = ${data.chosen}/${n} ≈ ${q(100*data.expected)}%`,BLUE,15,700);
 else if(id==='7-10-C03')s+=T(505,425,`Cột tần suất thực nghiệm (xanh): ${samples?Math.round(100*data.relative):0}% · Đường chuẩn lý thuyết (cam đứt): P = 50%`,BLUE,14.5,700);
 else{
  const scope=Number(p?.lessonScope??ctx?.lessonScope??29);
  if(scope===29)s+=T(505,418,'[Bài 29] Tập kết quả có thể: {0 (Sấp), 1 (Ngửa)} — kết quả dừng viền cam',INK,15);
  else s+=T(505,425,`[Bài 30] Kết luận: P(mặt 0) = 1/2, tần suất thực nghiệm = ${samples?Math.round(100*data.relative):0}%`,INK,16);
 }
 return s;
}

/* ==========================================================================
   NHÓM 7-04: TAM GIÁC BẰNG NHAU (DA_MAU: CẶP TƯƠNG ỨNG CÙNG MÀU, ĐÍCH VIỀN TÍM)
   ========================================================================== */
function drawCongruence704(id,rawParams,t=0){
 const u=op(t/6),f=smooth(u);
 const params={...initialTriangleParams(id),...(rawParams||{})};
 const {first,second,check}=makeTrianglePair(id,params,{perturb:false});
 const m=check.first;
 const maxdim=Math.max(m.AB,m.AC,m.BC,6);
 const scale=Math.min(62,235/maxdim,200/Math.max(first.C[1],second.C[1],2));
 const leftA=[105,360],rightA=[555,360];
 const curA=[lerp(rightA[0],leftA[0],f),rightA[1]-Math.sin(Math.PI*f)*24];
 const SPECS={
  '7-04-C01':{sides:['AB','AC','BC'],angles:[],badge:'Trường hợp c.c.c: AB = A′B′ (xanh), AC = A′C′ (cam), BC = B′C′ (xanh lá) ⇒ △ABC = △A′B′C′'},
  '7-04-C02':{sides:['AB','AC'],angles:['A'],badge:'Trường hợp c.g.c: AB = A′B′ (xanh), ∠A = ∠A′ (tím xen giữa), AC = A′C′ (cam) ⇒ △ABC = △A′B′C′'},
  '7-04-C03':{sides:['AB'],angles:['A','B'],badge:'Trường hợp g.c.g: ∠A = ∠A′ (cam), AB = A′B′ (xanh xen giữa), ∠B = ∠B′ (tím) ⇒ △ABC = △A′B′C′'},
  '7-04-C04':{sides:['AB','AC'],angles:['A_right'],badge:'Tam giác vuông (2 cạnh góc vuông): ∠A = ∠A′ = 90° (tím), AB = A′B′ (xanh), AC = A′C′ (cam)'},
  '7-04-C05':{sides:['AB'],angles:['A_right','B'],badge:'Tam giác vuông (cạnh góc vuông – góc nhọn kề): ∠A = ∠A′ = 90° (tím), AB = A′B′ (xanh), ∠B = ∠B′ (cam)'},
  '7-04-C06':{sides:['BC'],angles:['A_right','B'],badge:'Tam giác vuông (cạnh huyền – góc nhọn): ∠A = ∠A′ = 90° (tím), BC = B′C′ (xanh), ∠B = ∠B′ (cam)'},
  '7-04-C07':{sides:['AB','BC'],angles:['A_right'],badge:'Tam giác vuông (cạnh huyền – cạnh góc vuông): ∠A = ∠A′ = 90° (tím), BC = B′C′ (xanh), AB = A′B′ (cam)'}
 };
 const spec=SPECS[id]||SPECS['7-04-C01'];
 const activeSides=new Set(spec.sides),activeAngles=new Set(spec.angles);
 let s=box(20,25,860,425)+box(36,36,828,34,'#EDE9FE')+T(45,59,spec.badge,PURPLE,14.5,700);
 const sideCols=id==='7-04-C06'||id==='7-04-C07'?{BC:BLUE,AB:ORANGE,AC:SLATE}:{AB:BLUE,AC:ORANGE,BC:GREEN};
 const renderTri=(coords,anc,suffix,moving)=>{
  const Pmap=Object.fromEntries(Object.entries(coords).map(([k,pt])=>[k,[anc[0]+pt[0]*scale,anc[1]-pt[1]*scale]]));
  // Tam giác đích có viền tím, tam giác dịch chuyển có nền cam nhạt
  let g=P([Pmap.A,Pmap.B,Pmap.C],moving?'#FEF3C755':'#EDE9FE55',moving?'none':PURPLE,moving?0:2.2);
  if(activeAngles.has('A_right'))g+=rightMarkPts(Pmap.A,Pmap.B,Pmap.C,13,PURPLE);
  if(activeAngles.has('A'))g+=angleArcPts(Pmap.A,Pmap.B,Pmap.C,30,id==='7-04-C02'?PURPLE:ORANGE,`${Math.round(m.A)}°`,1,0.22);
  if(activeAngles.has('B'))g+=angleArcPts(Pmap.B,Pmap.C,Pmap.A,30,id==='7-04-C03'?PURPLE:ORANGE,`${Math.round(m.B)}°`,2,0.22);
  for(const [a,b,ticks,key] of [['A','B',1,'AB'],['A','C',2,'AC'],['B','C',3,'BC']]){
   const isHyp=activeSides.has(key),col=isHyp?sideCols[key]:'#94A3B8';
   g+=L(Pmap[a][0],Pmap[a][1],Pmap[b][0],Pmap[b][1],col,isHyp?4.5:2.2,isHyp?'':'6 4');
   if(isHyp)g+=tickMarkPts(Pmap[a],Pmap[b],ticks,col);
  }
  for(const k of ['A','B','C']){
   g+=C(Pmap[k][0],Pmap[k][1],6.5,moving?ORANGE:PURPLE)+T(Pmap[k][0]-8,k==='C'?Pmap[k][1]-12:Pmap[k][1]+22,k+suffix,moving?ORANGE:PURPLE,15,700);
  }
  return g;
 };
 s+=renderTri(first,leftA,'',false);
 s+=renderTri(second,curA,'′',true);
 s+=T(45,422,f>0.95?'✓ Đã chồng khít hoàn toàn tại 100%: △A′B′C′ trùng khít lên tam giác đích △ABC (viền tím).':`Đang tịnh tiến chồng hình △A′B′C′ → △ABC (${Math.round(f*100)}%)`,PURPLE,15,700);
 return s;
}

export function grade7SVGScene(id,params={},t=0,ctx={}){
 const family=String(id).slice(0,4);
 const p=family==='7-04'?params:{...grade7Defaults(id),...params};
 let shape='';
 if(family==='7-01')shape=drawNumber(id,p,t);
 else if(family==='7-02')shape=drawAngles(id,p,t);
 else if(family==='7-03')shape=drawTriangle(id,p,t);
 else if(family==='7-04')shape=drawCongruence704(id,p,t);
 else if(family==='7-05')shape=drawCenters(id,p,t);
 else if(family==='7-06')shape=drawPie(id,p,t,ctx);
 else if(family==='7-07')shape=drawLineChart(id,p,t);
 else if(family==='7-10')shape=drawProbability(id,p,t,ctx);
 else throw Error('SVG 2D chi danh cho cac che do phang');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 470" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Mô phỏng Toán 7 động, có tham số và nhãn hình học" style="display:block;width:100%;height:100%;touch-action:none">${shape}</svg>`;
}

export function grade7NetSVG(id,params={},progress=1){
 const ids=['7-08-C01','7-08-C02','7-08-C03','7-08-C04','7-09-C01','7-09-C02','7-09-C03','7-09-C04'];
 if(!ids.includes(id))throw Error('Che do khong co hinh khai trien');
 const p={...grade7Defaults(id),...params};
 const prog=Math.max(0,Math.min(1,Number(progress)??1));
 const k=0.22+0.78*prog;
 const head=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 450" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Sơ đồ hình học 2D đồng bộ ${id}" style="display:block;width:100%;height:100%">${box(15,14,870,424)}`;

 if(id==='7-08-C01'){
  const a=p.a,b=p.b??3,h=p.h??4,dBase=Math.hypot(a,b),dSpace=Math.hypot(a,b,h);
  const sc=Math.min(26,180/Math.max(a,b,h,1));
  const wA=a*sc,wB=b*sc,wH=h*sc*k,wD=dBase*sc;
  let s=head;
  s+=T(35,44,'Hình chiếu 3 mặt trực giao & Đường chéo không gian hình hộp chữ nhật',INK,18.5,700);
  s+=T(35,68,`Bài 36: 3 cặp mặt đối diện bằng nhau (${q(a)}×${q(b)}, ${q(a)}×${q(h)}, ${q(b)}×${q(h)}) · 8 đỉnh · 12 cạnh`,BLUE,14,650);
  // 1) Mặt đáy a x b
  const x1=55,y1=145;
  s+=`<rect x="${q(x1)}" y="${q(y1)}" width="${q(wA)}" height="${q(wB)}" fill="#DBEAFE" stroke="${BLUE}" stroke-width="2.6"/>`;
  s+=L(x1,y1+wB,x1+wA*prog,y1+wB*(1-prog),ORANGE,2.6,'5 3');
  s+=T(x1,y1-10,`1. Mặt đáy (${q(a)} × ${q(b)})`,BLUE,13.5,700)+T(x1,y1+wB+20,`d_đáy = √(a²+b²) = ${q(dBase)}`,ORANGE,12.5,700);
  // 2) Mặt đứng a x h(t)
  const x2=285,y2=295-wH;
  s+=`<rect x="${q(x2)}" y="${q(y2)}" width="${q(wA)}" height="${q(wH)}" fill="#FEF3C7" stroke="${ORANGE}" stroke-width="2.6"/>`;
  s+=T(x2,135,`2. Mặt đứng (${q(a)} × ${q(h*k)})`,ORANGE,13.5,700)+T(x2,316,`Chiều cao dựng: ${Math.round(prog*100)}%`,ORANGE,12.5,650);
  // 3) Mặt cạnh b x h(t)
  const x3=495,y3=295-wH;
  s+=`<rect x="${q(x3)}" y="${q(y3)}" width="${q(wB)}" height="${q(wH)}" fill="#EDE9FE" stroke="${PURPLE}" stroke-width="2.6"/>`;
  s+=T(x3,135,`3. Mặt bên (${q(b)} × ${q(h*k)})`,PURPLE,13.5,700);
  // 4) Tam giác vuông đường chéo không gian d = sqrt(a^2+b^2+h^2)
  const x4=665,y4=295,top4=y4-wH;
  s+=P([[x4,y4],[x4+wD,y4],[x4+wD,top4]],'#DCFCE7',GREEN,2.6)+rightMarkPts([x4+wD,y4],[x4,y4],[x4+wD,top4],10,PURPLE);
  s+=L(x4,y4,x4+wD,top4,PURPLE,3.2)+C(x4,y4,5,BLUE)+C(x4+wD,top4,5.5,PURPLE);
  s+=T(x4,135,'4. Tam giác chéo không gian',GREEN,13.5,700)+T(x4,318,`d = √(a²+b²+h²) = ${q(dSpace)}`,PURPLE,13,700);
  s+=T(35,380,`Tiến độ dựng: ${Math.round(prog*100)}% · 6 mặt chữ nhật · Tổng độ dài 12 cạnh = 4(a+b+h) = ${q(4*(a+b+h))}`,PURPLE,14.5,700);
  s+=T(35,420,'• Kết luận: Hình hộp chữ nhật có 6 mặt chữ nhật (3 cặp mặt đối bằng nhau), 12 cạnh chia làm 3 nhóm kích thước a, b, h',INK,13.5,700)+'</svg>';
  return s;
 }

 if(id==='7-08-C02'){
  const a=p.a,dFace=a*Math.SQRT2,dCube=a*Math.sqrt(3);
  const sc=Math.min(34,175/Math.max(a*Math.SQRT2,1))*k;
  const side=a*sc,diagW=dFace*sc;
  let s=head;
  s+=T(35,44,'Mặt hình vuông & Thiết diện chéo của hình lập phương (a = b = h)',INK,18.5,700);
  s+=T(35,68,`Bài 36: 6 mặt đều là hình vuông cạnh a = ${q(a)} · 12 cạnh bằng nhau · 8 đỉnh góc vuông`,BLUE,14,650);
  // Left: Square face ABCD with diagonal AC = a*sqrt(2)
  const cx1=210,cy1=245,x0=cx1-side/2,y0=cy1-side/2;
  s+=`<rect x="${q(x0)}" y="${q(y0)}" width="${q(side)}" height="${q(side)}" fill="#DBEAFE" stroke="${BLUE}" stroke-width="2.8"/>`;
  s+=L(x0,y0+side,x0+side,y0,ORANGE,3,'6 3')+rightMarkPts([x0+side,y0+side],[x0,y0+side],[x0+side,y0],11,PURPLE);
  s+=tickMarkPts([x0,y0],[x0+side,y0],1,BLUE)+tickMarkPts([x0,y0],[x0,y0+side],1,BLUE);
  s+=T(cx1-75,y0-14,`Mặt vuông: S_mặt = a² = ${q(a*a)}`,BLUE,14,700)+T(cx1-82,y0+side+24,`Đường chéo mặt d = a√2 = ${q(dFace)}`,ORANGE,13.5,700);
  // Right: Diagonal axial rectangle ACC'A' (width a*sqrt(2), height a) with space diagonal AC' = a*sqrt(3)
  const cx2=610,cy2=245,rx0=cx2-diagW/2,ry0=cy2-side/2;
  s+=`<rect x="${q(rx0)}" y="${q(ry0)}" width="${q(diagW)}" height="${q(side)}" fill="#EDE9FE" stroke="${PURPLE}" stroke-width="2.8"/>`;
  s+=L(rx0,ry0+side,rx0+diagW,ry0,GREEN,3.4)+rightMarkPts([rx0+diagW,ry0+side],[rx0,ry0+side],[rx0+diagW,ry0],11,PURPLE);
  s+=T(cx2-115,ry0-14,`Thiết diện chéo (a√2 × a): S_chéo = a²√2 = ${q(a*a*Math.SQRT2)}`,PURPLE,14,700);
  s+=T(cx2-105,ry0+side+24,`Đường chéo khối D = a√3 = ${q(dCube)}`,GREEN,14,700);
  s+=T(35,382,`Đồng bộ kích thước (${Math.round(prog*100)}%): S_xq = 4a² = ${q(4*a*a)} · S_tp = 6a² = ${q(6*a*a)} · V = a³ = ${q(a*a*a)}`,PURPLE,14.5,700);
  s+=T(35,420,'• Kết luận: Hình lập phương là hình hộp chữ nhật có 3 kích thước bằng nhau (a = b = h), 6 mặt đều là hình vuông',INK,13.5,700)+'</svg>';
  return s;
 }

 if(id==='7-08-C04'){
  const a=p.a,b=p.b??3,h=p.h??4,sBase=a*b,sxq=2*(a+b)*h,vol=sBase*h,curH=h*prog,curV=sBase*curH;
  let s=head;
  s+=T(35,44,'Sơ đồ tích lũy thể tích theo lớp cao V(z) = (a·b)·z & So sánh S_xq, V',INK,18.5,700);
  s+=T(35,68,`Bài 36: Đáy S_đáy = a·b = ${q(sBase)} · Cao đang quét z = ${q(curH)}/${q(h)} · V(z) = ${q(curV)}`,BLUE,14,650);
  // Left: 2D elevation column showing base layer and stacked height z
  const colX=95,colBot=345,colW=Math.min(220,Math.max(95,a*28)),colFullH=195,colCurH=colFullH*k;
  s+=`<rect x="${q(colX)}" y="${q(colBot-colFullH)}" width="${q(colW)}" height="${q(colFullH)}" fill="#F1F5F9" stroke="${SLATE}" stroke-width="2" stroke-dasharray="6 4"/>`;
  s+=`<rect x="${q(colX)}" y="${q(colBot-colCurH)}" width="${q(colW)}" height="${q(colCurH)}" fill="#EDE9FE" stroke="${PURPLE}" stroke-width="2.8"/>`;
  s+=L(colX-8,colBot-colCurH,colX+colW+8,colBot-colCurH,ORANGE,3.2);
  s+=T(colX+12,colBot-colCurH-10,`Lát cắt z = ${q(h*k)} ⇒ S = a·b = ${q(sBase)}`,ORANGE,13,700);
  s+=T(colX+12,colBot+22,`Đáy S_đáy = ${q(a)} × ${q(b)} = ${q(sBase)}`,BLUE,13.5,700);
  // Right: Horizontal comparison bars for S_đáy, S_xq, V
  const maxVal=Math.max(sBase,sxq,vol,1),bx=430,maxBarW=390;
  const rows=[
   ['Diện tích đáy S_đáy = a·b',sBase,BLUE,'#DBEAFE',155],
   ['Diện tích xung quanh S_xq = 2(a+b)h',sxq,ORANGE,'#FEF3C7',235],
   ['Thể tích V(z) = a·b·z → a·b·h',vol*k,PURPLE,'#EDE9FE',315]
  ];
  for(const [lbl,val,col,fill,ry] of rows){
   const bw=Math.max(12,(val/maxVal)*maxBarW);
   s+=T(bx,ry-10,`${lbl} = ${q(val)}`,col,14,700);
   s+=`<rect x="${bx}" y="${ry}" width="${q(bw)}" height="28" rx="6" fill="${fill}" stroke="${col}" stroke-width="2.4"/>`;
  }
  s+=T(35,386,`Tiến độ quét thiết diện: ${Math.round(prog*100)}% · S_xq = ${q(sxq)} · S_tp = ${q(sxq+2*sBase)} · V = ${q(vol)}`,PURPLE,14.5,700);
  s+=T(35,420,'• Kết luận: Thể tích hình hộp chữ nhật bằng diện tích đáy nhân với chiều cao: V = S_đáy · h = a · b · h',INK,13.5,700)+'</svg>';
  return s;
 }

 if(id==='7-09-C01'){
  const a=p.a,h=p.h,hBase=a*Math.sqrt(3)/2,sBase=a*hBase/2;
  const sc=Math.min(34,175/Math.max(a,h,1));
  const wA=a*sc,tH=hBase*sc;
  let s=head;
  s+=T(35,44,'Hai đáy tam giác đều song song & Phép tịnh tiến theo cạnh bên vuông góc',INK,18.5,700);
  s+=T(35,68,`Bài 37: Lăng trụ đứng tam giác có 2 đáy tam giác bằng nhau (cạnh a = ${q(a)}) và 3 mặt bên chữ nhật`,BLUE,14,650);
  // Left: Equilateral triangle base ABC with altitude h_đáy
  const cx1=205,by1=315,A=[cx1-wA/2,by1],B=[cx1+wA/2,by1],Cpt=[cx1,by1-tH],M=[cx1,by1];
  s+=P([A,B,Cpt],'#DBEAFE',BLUE,2.8)+L(Cpt,M,ORANGE,2.6,'5 3')+rightMarkPts(M,B,Cpt,10,PURPLE);
  s+=C(A[0],A[1],5,BLUE)+C(B[0],B[1],5,BLUE)+C(Cpt[0],Cpt[1],5,BLUE);
  s+=T(A[0]-18,A[1]+16,'A',BLUE,14,700)+T(B[0]+8,B[1]+16,'B',BLUE,14,700)+T(Cpt[0]-6,Cpt[1]-10,'C',BLUE,14,700);
  s+=T(cx1-85,346,`Đáy △ABC: h_đáy = ${q(hBase)} · S_đáy = ${q(sBase)}`,BLUE,13.5,700);
  // Right: Side elevation showing bottom base translating vertically along AA' = BB' = CC' = h(t)
  const xL=495,xR=495+wA,yBot=320,yTop=yBot-h*sc*k,xMid=(xL+xR)/2;
  s+=`<rect x="${q(xL)}" y="${q(yTop)}" width="${q(wA)}" height="${q(yBot-yTop)}" fill="#FEF3C788" stroke="${ORANGE}" stroke-width="2.4"/>`;
  s+=L(xL,yBot,xR,yBot,BLUE,4)+L(xL,yTop,xR,yTop,GREEN,4);
  s+=L(xL,yBot,xL,yTop,PURPLE,3)+L(xMid,yBot,xMid,yTop,PURPLE,2.4,'5 3')+L(xR,yBot,xR,yTop,PURPLE,3);
  s+=rightMarkPts([xL,yBot],[xR,yBot],[xL,yTop],11,PURPLE)+rightMarkPts([xR,yBot],[xL,yBot],[xR,yTop],11,PURPLE);
  s+=T(xL-24,yBot+5,'Đáy dưới △ABC',BLUE,13,700)+T(xL-24,yTop-10,'Đáy trên △A′B′C′',GREEN,13,700);
  s+=T(xR+14,(yBot+yTop)/2,`AA′ = BB′ = CC′ = ${q(h*k)}`,PURPLE,13.5,700);
  s+=T(35,384,`Tiến độ dựng cạnh bên: ${Math.round(prog*100)}% · 5 mặt (2 đáy + 3 mặt bên) · 9 cạnh · 6 đỉnh`,PURPLE,14.5,700);
  s+=T(35,420,'• Kết luận: Lăng trụ đứng tam giác có hai mặt đáy là hai tam giác song song bằng nhau, các cạnh bên vuông góc với đáy',INK,13.5,700)+'</svg>';
  return s;
 }

 if(id==='7-09-C02'){
  const a=p.a,b=p.b??2,hb=p.hb??2,h=p.h??4,leg=Math.hypot((a-b)/2,hb),sBase=(a+b)*hb/2,cBase=a+b+2*leg;
  const sc=Math.min(42,240/Math.max(a,b,hb,1));
  const wA=a*sc,wB=b*sc,wHb=hb*sc,dx=(wA-wB)/2*k;
  let s=head;
  s+=T(35,44,'Phân rã mặt đáy hình thang cân ABCD & Diện tích đáy lăng trụ đứng tứ giác',INK,18.5,700);
  s+=T(35,68,`Bài 37: Đáy lớn a = ${q(a)}, đáy nhỏ b = ${q(b)}, chiều cao đáy h_đáy = ${q(hb)}, cạnh bên lăng trụ h = ${q(h)}`,BLUE,14,650);
  // Left: Trapezoid base ABCD decomposed into central rectangle (b x hb) + 2 right triangles
  const cx1=245,by1=310,xA=cx1-wA/2,xB=cx1+wA/2,xD=cx1-wB/2,xC=cx1+wB/2,yTop=by1-wHb;
  s+=`<rect x="${q(xD)}" y="${q(yTop)}" width="${q(wB)}" height="${q(wHb)}" fill="#DBEAFE" stroke="${BLUE}" stroke-width="2.6"/>`;
  s+=P([[xD-dx,by1],[xD,by1],[xD,yTop]],'#FEF3C7',ORANGE,2.4);
  s+=P([[xC+dx,by1],[xC,by1],[xC,yTop]],'#FEF3C7',ORANGE,2.4);
  s+=rightMarkPts([xD,by1],[xC,by1],[xD,yTop],10,PURPLE)+rightMarkPts([xC,by1],[xD,by1],[xC,yTop],10,PURPLE);
  s+=T(cx1-36,yTop-12,`b = ${q(b)}`,BLUE,13.5,700)+T(cx1-36,by1+22,`a = ${q(a)}`,BLUE,13.5,700)+T(xD+8,(by1+yTop)/2,`h_đáy = ${q(hb)}`,PURPLE,13,700);
  // Right: Formula breakdown & 4 rectangular lateral faces summary
  const bx=505;
  s+=box(bx,115,350,225,'#FFFFFF');
  s+=T(bx+20,148,'Công thức đáy & mặt bên lăng trụ tứ giác',INK,15.5,700);
  s+=T(bx+20,182,`• Diện tích đáy: S_đáy = (a + b)·h_đáy / 2 = ${q(sBase)}`,BLUE,14,700);
  s+=T(bx+20,214,`• Cạnh bên hình thang: c = √(((a−b)/2)² + h_đáy²) = ${q(leg)}`,ORANGE,13.5,700);
  s+=T(bx+20,246,`• Chu vi đáy: C_đáy = a + b + 2c = ${q(cBase)}`,GREEN,14,700);
  s+=T(bx+20,278,`• Diện tích xung quanh: S_xq = C_đáy · h = ${q(cBase*h)}`,PURPLE,14,700);
  s+=T(bx+20,310,`• Thể tích lăng trụ: V = S_đáy · h = ${q(sBase*h)}`,PURPLE,14.5,700);
  s+=T(35,384,`Tiến độ tách ghép đáy: ${Math.round(prog*100)}% · 6 mặt (2 đáy tứ giác + 4 mặt bên chữ nhật) · 12 cạnh · 8 đỉnh`,PURPLE,14.5,700);
  s+=T(35,420,'• Kết luận: Lăng trụ đứng tứ giác có 2 đáy là tứ giác song song bằng nhau và 4 mặt bên là các hình chữ nhật',INK,13.5,700)+'</svg>';
  return s;
 }

 if(id==='7-09-C04'){
  const a=p.a,b=p.b??2,hb=p.hb??2,h=p.h??4,leg=Math.hypot((a-b)/2,hb);
  const sBase=(a+b)*hb/2,cBase=a+b+2*leg,sxq=cBase*h,vol=sBase*h,curZ=h*k;
  let s=head;
  s+=T(35,44,'Nguyên lí thiết diện song song đáy S(z) = S_đáy & Thể tích lăng trụ V = S_đáy · h',INK,18.5,700);
  s+=T(35,68,`Bài 37: Mọi lát cắt song song đáy tại độ cao z = ${q(curZ)} đều có diện tích không đổi S(z) = S_đáy = ${q(sBase)}`,BLUE,14,650);
  // Left: Stacked slices along height z from 0 to h
  const sx=95,syBot=340,sw=210,shFull=195,shCur=shFull*k;
  s+=`<rect x="${sx}" y="${q(syBot-shFull)}" width="${sw}" height="${shFull}" fill="#F1F5F9" stroke="${SLATE}" stroke-width="2" stroke-dasharray="6 4"/>`;
  s+=`<rect x="${sx}" y="${q(syBot-shCur)}" width="${sw}" height="${q(shCur)}" fill="#DCFCE7" stroke="${GREEN}" stroke-width="2.6"/>`;
  for(let i=1;i<=4;i++){
   const ySlice=syBot-(shCur*i/4);
   s+=L(sx,ySlice,sx+sw,ySlice,ORANGE,2.4,'5 3');
  }
  s+=L(sx-10,syBot-shCur,sx+sw+10,syBot-shCur,PURPLE,3.6);
  s+=T(sx+12,syBot-shCur-10,`Thiết diện S(z) = S_đáy = ${q(sBase)}`,PURPLE,13.5,700);
  s+=T(sx+18,syBot+22,`Đáy S_đáy = ${q(sBase)} (không đổi)`,BLUE,13.5,700);
  // Right: Summary cards comparing S_xq and V(z)
  const bx=410;
  s+=box(bx,115,445,225,'#FFFFFF');
  s+=T(bx+20,148,'Liên hệ Chu vi đáy, Diện tích đáy và Thể tích',INK,16,700);
  s+=T(bx+20,184,`1. Diện tích một mặt đáy: S_đáy = ${q(sBase)}`,BLUE,14.5,700);
  s+=T(bx+20,218,`2. Chu vi đáy: C_đáy = ${q(cBase)} ⇒ S_xq = C_đáy · h = ${q(sxq)}`,ORANGE,14.5,700);
  s+=T(bx+20,252,`3. Độ cao lớp cắt hiện tại: z = ${q(curZ)} / ${q(h)} (${Math.round(prog*100)}%)`,GREEN,14.5,700);
  s+=T(bx+20,288,`4. Thể tích quét được: V(z) = S_đáy · z = ${q(sBase*curZ)} → V = ${q(vol)}`,PURPLE,15,700);
  s+=T(35,384,`Tiến độ quét thiết diện: ${Math.round(prog*100)}% · S_đáy = ${q(sBase)} · S_xq = ${q(sxq)} · V = S_đáy · h = ${q(vol)}`,PURPLE,14.5,700);
  s+=T(35,420,'• Kết luận: Thể tích hình lăng trụ đứng bằng diện tích đáy nhân với chiều cao: V = S_đáy · h; S_xq = C_đáy · h',INK,13.5,700)+'</svg>';
  return s;
 }

 // 7-08-C03 và 7-09-C03: Bản khai triển phẳng 2D chuẩn SGK
 const opac=Math.max(.24,Math.min(1,.28+.72*prog));
 const spread=.28+.72*prog;
 const isBox=id.startsWith('7-08');
 const isCube=id==='7-08-C02';
 const isTrapPrism=id==='7-09-C02'||id==='7-09-C04';
 const a=p.a,b=isCube?a:(p.b??2),hb=p.hb??2,h=isCube?a:p.h;
 const leg=isTrapPrism?Math.hypot((a-b)/2,hb):a;
 let widths=[];
 if(isBox)widths=[a,b,a,b];
 else if(isTrapPrism)widths=[a,leg,b,leg];
 else widths=[a,a,a];
 const total=widths.reduce((x,y)=>x+y,0);
 const extraV=isBox?2*a:(isTrapPrism?2*hb:a*Math.sqrt(3));
 const s=Math.min(28,520/Math.max(1,total),210/Math.max(1,h+extraV));
 const band=h*s,topHFull=(isBox?a:(isTrapPrism?hb:a*Math.sqrt(3)/2))*s;
 const topH=topHFull*(.25+.75*prog);
 const fullW=total*s,curW=fullW*spread;
 const left=Math.max(35,(900-curW)/2),top=Math.max(125+topHFull,255-band/2);
 let out=head;
 const faceNames=isBox?['Mặt trước','Mặt phải','Mặt sau','Mặt trái']:['Mặt bên 1','Mặt bên 2','Mặt bên 3'];
 const latFills=['#FEF3C7','#EDE9FE','#FEF3C7','#EDE9FE'];
 const latStrokes=[ORANGE,PURPLE,ORANGE,PURPLE];
 let x=left;
 for(let j=0;j<widths.length;j++){
  const wPx=widths[j]*s*spread;
  out+=`<rect x="${q(x)}" y="${q(top)}" width="${q(wPx)}" height="${q(band)}" fill="${latFills[j]}" fill-opacity="${opac}" stroke="${latStrokes[j]}" stroke-width="2.2"/>`;
  if(wPx>=38&&band>=30){
   out+=T(x+wPx/2-24,top+band/2-2,faceNames[j],INK,11.2,700);
   out+=T(x+wPx/2-18,top+band/2+14,`${q(widths[j])}×${q(h)}`,latStrokes[j],10.8,600);
  }
  x+=wPx;
 }
 out+=T(left+curW+8,top+band/2+5,`h = ${q(h)}`,PURPLE,13.5,700);
 if(isBox){
  const xa=left+a*s*spread,ww=b*s*spread,hh=topH;
  out+=`<rect x="${q(xa)}" y="${q(top-hh)}" width="${q(ww)}" height="${q(hh)}" fill="#DBEAFE" fill-opacity="${opac}" stroke="${BLUE}" stroke-width="2.4"/>`;
  out+=`<rect x="${q(xa)}" y="${q(top+band)}" width="${q(ww)}" height="${q(hh)}" fill="#DBEAFE" fill-opacity="${opac}" stroke="${BLUE}" stroke-width="2.4"/>`;
  if(ww>=34&&hh>=20){
   out+=T(xa+ww/2-22,top-hh/2+4,'Đáy trên',BLUE,11.2,700);
   out+=T(xa+ww/2-22,top+band+hh/2+4,'Đáy dưới',BLUE,11.2,700);
  }
 }else{
  const base=a*s*spread,hh=topH,xx=left;
  out+=P([[xx,top],[xx+base,top],[xx+base/2,top-hh]],'#DBEAFE',BLUE,2.4);
  out+=P([[xx,top+band],[xx+base,top+band],[xx+base/2,top+band+hh]],'#DBEAFE',BLUE,2.4);
  if(hh>=18){
   out+=T(xx+base/2-22,top-hh*0.35,'Đáy trên',BLUE,11.2,700);
   out+=T(xx+base/2-22,top+band+hh*0.48,'Đáy dưới',BLUE,11.2,700);
  }
 }
 const netNote=isBox?'Bài 36: 4 mặt bên hình chữ nhật + 2 mặt đáy giữ xanh (#1D4ED8)':'Bài 37: 2 đáy tam giác bằng nhau + 3 mặt bên hình chữ nhật';
 const cDay=widths.reduce((acc,w)=>acc+w,0);
 out+=T(35,44,'Bản khai triển phẳng 2D (ghép các mặt theo cạnh tương ứng)',INK,19,700)+T(35,68,netNote,BLUE,14.5,600)+T(35,92,`Tiến độ mở: ${Math.round(prog*100)}% · Chu vi đáy C_đáy = ${q(cDay)} · Chiều cao h = ${q(h)} · S_xq = ${q(cDay*h)}`,PURPLE,14.5,700)+T(35,424,'• Quan sát: Tổng bề rộng các mặt bên đúng bằng chu vi đáy C_đáy ⇒ Kết luận: S_xq = C_đáy · h',INK,13.5,700)+'</svg>';
 return out;
}
