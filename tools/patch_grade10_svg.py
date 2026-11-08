import sys

path = 'G:/ANTIGRAVITY/MATH_3D_MUSEUM/MATHVERSE_R74_FULL_3D_GRAPHICS_TICH_HOP_ANTIGRAVITY_2026-10-31/MATHVERSE_R74_3D_GRAPHICS_FULL_PROJECT/src/curriculum/grade10-svg.mjs'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

start_fn = 'function inequalitySVG(id,p,m,t,exp){\n'
end_fn = 'function triangleSVG(id,p,m,t,exp){\n'

start_idx = text.find(start_fn)
end_idx = text.find(end_fn)

assert start_idx != -1, "start_fn not found"
assert end_idx != -1, "end_fn not found"

new_fn = """function inequalitySVG(id,p,m,t,exp){
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

 const ph=(t%6)/6,pIdx=phaseIndex(t),sweepVal=best?best.value*(0.15+0.85*ph):0;
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

 // Line 1 specific equation label
 const eq1=`(d₁): ${formatLinearExpr2D(p.a,p.b)} = ${fmt(p.c,1)}`;
 const wPill1=Math.max(110,eq1.length*6.6+20);
 const pill1X=botP1?Math.max(414,Math.min(920-wPill1,botP1[0]-wPill1/2)):750;
 const pill1Y=botP1?Math.max(92,Math.min(454,botP1[1]-14)):400;

 // Line 2 specific equation label
 const eq2=`(d₂): ${formatLinearExpr2D(p.d,p.e)} = ${fmt(p.f,1)}`;
 const wPill2=Math.max(110,eq2.length*6.6+20);
 const pill2X=topP2?Math.max(414,Math.min(920-wPill2,topP2[0]-wPill2/2)):750;
 const pill2Y=topP2?Math.max(92,Math.min(454,topP2[1]-14)):100;

 // Directional arrows on d1 (inward half-plane)
 const dirArrows1=l1.length===2?[0.35,0.65].map(frac=>{
  const amx=l1[0][0]*(1-frac)+l1[1][0]*frac;
  const amy=l1[0][1]*(1-frac)+l1[1][1]*frac;
  const s0=toScreen(amx,amy),s1=toScreen(amx+inX1*0.85,amy+inY1*0.85);
  return arrow(s0[0],s0[1],s1[0],s1[1],'#0c7da0','',2.2);
 }).join(''):'';

 // Directional arrows on d2 (inward half-plane)
 const dirArrows2=mode>=2&&l2.length===2?[0.35,0.65].map(frac=>{
  const amx=l2[0][0]*(1-frac)+l2[1][0]*frac;
  const amy=l2[0][1]*(1-frac)+l2[1][1]*frac;
  const s0=toScreen(amx,amy),s1=toScreen(amx+inX2*0.85,amy+inY2*0.85);
  return arrow(s0[0],s0[1],s1[0],s1[1],'#d9742b','',2.2);
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
   {t:`(d₁): ${formatLinearInequality2D(p.a,p.b,strictIneq?'<':'<=',p.c)}`,c:'#0c7da0',w:800},
   mode>=2?{t:`(d₂): ${formatLinearInequality2D(p.d,p.e,'<=',p.f)}`,c:'#d9742b',w:750}:{t:`Thử M(${fmt(mx,1)};${fmt(my,1)}): ${fmt(lhsM,1)} ${strictIneq?'<':'≤'} ${fmt(p.c,1)} (${inM?'Đúng':'Sai'})`,c:inM?'#12876f':'#c63d2f',w:750},
   mode===3&&best?{t:`Max F = ${fmt(best.value,2)} tại (${fmt(best.x,1)}; ${fmt(best.y,1)})`,c:'#b84a18',w:800}:{t:`Miền nghiệm: ${activePoly.length} đỉnh`,c:'#12876f',w:800}
  ],'Màn quét nửa mặt phẳng phủ kín khung lưới và thước sóng đường mức F(x,y) = k.','Đổi hệ số a, b, c hoặc kéo điểm thử M trên mặt phẳng.'),
  axes(),
  `<defs><clipPath id="ineqGridClip"><rect x="408" y="88" width="522" height="396" rx="10"/></clipPath></defs>`,
  `<g clip-path="url(#ineqGridClip)">`,
  mode===2&&showAux&&ptsS1?`<polygon points="${ptsS1}" fill="#0c7da0" fill-opacity="0.07"/>`:'',
  mode===2&&showAux&&ptsS2?`<polygon points="${ptsS2}" fill="#d9742b" fill-opacity="0.07"/>`:'',
  activePoly.length>=3?`<polygon points="${pts}" fill="#1793b5" fill-opacity="${fmt(.24+.06*Math.sin(t*2.4),3)}" stroke="none"/>`:'',
  // Boundaries
  l1.length===2?line(...toScreen(...l1[0]),...toScreen(...l1[1]),'#0c7da0',3.2,strictIneq?'8 5':''):'',
  mode>=2&&l2.length===2?line(...toScreen(...l2[0]),...toScreen(...l2[1]),'#d9742b',2.8,'7 4'):'',
  // Mode 3: Lines 3 & 4 (x >= 0, y >= 0)
  mode===3?`<g>
   ${line(...toScreen(0,-5.4),...toScreen(0,5.4),'#7c3aed',2.6)}
   ${line(...toScreen(-8.5,0),...toScreen(8.5,0),'#059669',2.6)}
  </g>`:'',
  mode===3&&isoLine.length===2?`<g>${line(...toScreen(...isoLine[0]),...toScreen(...isoLine[1]),'#12876f',3.2,'6 3')}${gradStart&&gradEnd?arrow(gradStart[0],gradStart[1],gradEnd[0],gradEnd[1],'#12876f','',2.6):''}</g>`:'',
  `</g>`,
  activePoly.length<3?pill(580,242,190,28,'Miền nghiệm S = ∅ (rỗng)','#fff1e6','#f3c299','#c25918',11.5):'',

  // MODE 1 SPECIFIC VISUALS:
  mode===1?`<g>
   ${l1.length===2?`<g>
    ${pill(pill1X,pill1Y,wPill1,22,eq1,'#e6f5fa','#9ad0e4','#0c7da0',10.2)}
    ${dirArrows1}
    ${midP1?dot(midP1[0],midP1[1],7.5,'#0c7da0','#fff','P1')+haloTxt(midP1[0]+12,midP1[1]-8,'P₁(kéo d₁)','#0c7da0',9.5,'start',800):''}
    ${interceptA1?dot(interceptA1[0],interceptA1[1],4.5,'#0c7da0','#fff')+haloTxt(interceptA1[0]+6,interceptA1[1]+14,`A(${fmt(p.c/p.a,1)}; 0)`,'#0c7da0',9.2,'start',700):''}
    ${interceptB1?dot(interceptB1[0],interceptB1[1],4.5,'#0c7da0','#fff')+haloTxt(interceptB1[0]+8,interceptB1[1]-6,`B(0; ${fmt(p.c/p.b,1)})`,'#0c7da0',9.2,'start',700):''}
   </g>`:''}
   <circle cx="${fmt(Mscr[0],2)}" cy="${fmt(Mscr[1],2)}" r="${fmt(11*(1+.06*Math.sin(t*3)),2)}" fill="${inM?'#12876f':'#c63d2f'}" fill-opacity="0.18"/>
   ${dot(Mscr[0],Mscr[1],7.5,inM?'#12876f':'#c63d2f','#fff','M')}
   ${haloTxt(Mscr[0]+(mx>=0?12:-12),Mscr[1]-10,`M(${fmt(mx,1)}; ${fmt(my,1)})`,inM?'#0f6953':'#b42318',10.5,mx>=0?'start':'end',800)}
   ${inM?pill(416,92,310,24,`✓ Điểm thử M(${fmt(mx,1)}; ${fmt(my,1)}) ∈ Miền nghiệm (VT = ${fmt(lhsM,1)} ${strictIneq?'<':'≤'} ${fmt(p.c,1)})`,'#e5f7f1','#98d9c4','#0f6953',10):pill(416,92,310,24,`✗ Điểm thử M(${fmt(mx,1)}; ${fmt(my,1)}) ∉ Miền nghiệm (VT = ${fmt(lhsM,1)} > ${fmt(p.c,1)})`,'#fff1f0','#f3b5b0','#b42318',10)}
  </g>`:'',

  // MODE 2 SPECIFIC VISUALS:
  mode===2?`<g>
   ${l1.length===2?`<g>${pill(pill1X,pill1Y,wPill1,22,eq1,'#e6f5fa','#9ad0e4','#0c7da0',10.2)}${dirArrows1}${midP1?dot(midP1[0],midP1[1],7.5,'#0c7da0','#fff','P1')+haloTxt(midP1[0]+12,midP1[1]-8,'P₁(kéo d₁)','#0c7da0',9.5,'start',800):''}</g>`:''}
   ${l2.length===2?`<g>${pill(pill2X,pill2Y,wPill2,22,eq2,'#fff1e6','#f2c199','#c25918',10.2)}${dirArrows2}${midP2?dot(midP2[0],midP2[1],7.5,'#d9742b','#fff','P2')+haloTxt(midP2[0]+12,midP2[1]-8,'P₂(kéo d₂)','#d9742b',9.5,'start',800):''}</g>`:''}
   ${scrI?`<g>${dot(scrI[0],scrI[1],6,'#0e435c','#fff')}${haloTxt(scrI[0]+10,scrI[1]-8,`I(${fmt(ptI[0],1)}; ${fmt(ptI[1],1)})`,'#0e435c',10,'start',800)}</g>`:''}
   <circle cx="${fmt(Mscr[0],2)}" cy="${fmt(Mscr[1],2)}" r="${fmt(11*(1+.06*Math.sin(t*3)),2)}" fill="${(inM&&inM2)?'#12876f':'#c63d2f'}" fill-opacity="0.18"/>
   ${dot(Mscr[0],Mscr[1],7.5,(inM&&inM2)?'#12876f':'#c63d2f','#fff','M')}
   ${haloTxt(Mscr[0]+(mx>=0?12:-12),Mscr[1]-10,`M(${fmt(mx,1)}; ${fmt(my,1)})`,(inM&&inM2)?'#0f6953':'#b42318',10.5,mx>=0?'start':'end',800)}
   ${(inM&&inM2)?pill(416,92,310,24,`✓ M(${fmt(mx,1)}; ${fmt(my,1)}) ∈ Miền nghiệm chung S = S₁ ∩ S₂`,'#e5f7f1','#98d9c4','#0f6953',10):pill(416,92,310,24,`✗ M(${fmt(mx,1)}; ${fmt(my,1)}) ∉ S (Thỏa: ${inM?'(d₁) ':''}${inM2?'(d₂)':''}${!inM&&!inM2?'0 bờ':''})`,'#fff1f0','#f3b5b0','#b42318',10)}
  </g>`:'',

  // MODE 3 SPECIFIC VISUALS (ALL 4 LINES CLEARLY LABELED WITH DIRECTIONS!):
  mode===3?`<g>
   ${l1.length===2?`<g>${pill(pill1X,pill1Y,wPill1,22,eq1,'#e6f5fa','#9ad0e4','#0c7da0',10.2)}${dirArrows1}${midP1?dot(midP1[0],midP1[1],7.5,'#0c7da0','#fff','P1')+haloTxt(midP1[0]+12,midP1[1]-8,'P₁(kéo d₁)','#0c7da0',9.5,'start',800):''}</g>`:''}
   ${l2.length===2?`<g>${pill(pill2X,pill2Y,wPill2,22,eq2,'#fff1e6','#f2c199','#c25918',10.2)}${dirArrows2}${midP2?dot(midP2[0],midP2[1],7.5,'#d9742b','#fff','P2')+haloTxt(midP2[0]+12,midP2[1]-8,'P₂(kéo d₂)','#d9742b',9.5,'start',800):''}</g>`:''}
   ${pill(toScreen(0,4.6)[0]+8,toScreen(0,4.6)[1]-10,126,20,'(d₃): x = 0 (x ≥ 0)','#f3e8ff','#d8b4fe','#6b21a8',9.8)}
   ${arrow(toScreen(0,1.5)[0],toScreen(0,1.5)[1],toScreen(0.8,1.5)[0],toScreen(0.8,1.5)[1],'#7c3aed','',2.2)}
   ${arrow(toScreen(0,3.5)[0],toScreen(0,3.5)[1],toScreen(0.8,3.5)[0],toScreen(0.8,3.5)[1],'#7c3aed','',2.2)}
   ${pill(toScreen(5.6,0)[0]-60,toScreen(5.6,0)[1]+14,126,20,'(d₄): y = 0 (y ≥ 0)','#ecfdf5','#a7f3d0','#047857',9.8)}
   ${arrow(toScreen(2,0)[0],toScreen(2,0)[1],toScreen(2,0.8)[0],toScreen(2,0.8)[1],'#059669','',2.2)}
   ${arrow(toScreen(4.5,0)[0],toScreen(4.5,0)[1],toScreen(4.5,0.8)[0],toScreen(4.5,0.8)[1],'#059669','',2.2)}
   ${gradEnd?`<g>${dot(gradEnd[0],gradEnd[1],7.5,'#12876f','#fff','U')}${pill(gradEnd[0]+10,gradEnd[1]-12,175,22,`∇F(${p.u};${p.v}) → Hướng tăng F`,'#e6f7f2','#9fe1cd','#0f5f4b',9.5)}</g>`:''}
   <!-- 4-Line Linear Programming info card at top-left empty space -->
   <rect x="416" y="92" width="248" height="174" rx="10" fill="#f8fafc" fill-opacity="0.96" stroke="#cbd5e1" stroke-width="1.2"/>
   <rect x="416" y="92" width="248" height="26" rx="10" fill="#0f172a"/>
   <text x="540" y="109" fill="#38bdf8" font-size="10.5" font-weight="800" text-anchor="middle">GIAO CỦA 4 ĐƯỜNG RÀNG BUỘC</text>
   <text x="426" y="132" fill="#0c7da0" font-size="9.8" font-weight="700">1. (d₁): ${formatLinearExpr2D(p.a,p.b)} ≤ ${fmt(p.c,1)}</text>
   <text x="426" y="148" fill="#d9742b" font-size="9.8" font-weight="700">2. (d₂): ${formatLinearExpr2D(p.d,p.e)} ≤ ${fmt(p.f,1)}</text>
   <text x="426" y="164" fill="#7c3aed" font-size="9.8" font-weight="700">3. (d₃): x ≥ 0 (trục Oy: x = 0)</text>
   <text x="426" y="180" fill="#059669" font-size="9.8" font-weight="700">4. (d₄): y ≥ 0 (trục Ox: y = 0)</text>
   <line x1="426" y1="188" x2="654" y2="188" stroke="#e2e8f0" stroke-width="1"/>
   <text x="426" y="202" fill="#047857" font-size="9.5" font-weight="800">→ Hướng ∇F(${p.u};${p.v}): Tăng giá trị F</text>
   <text x="426" y="217" fill="#334155" font-size="9.2" font-weight="600">Đỉnh cực trị ${best?`(${fmt(best.x,1)}; ${fmt(best.y,1)}) → Max F = ${fmt(best.value,1)}`:'...'}</text>
   ${rows3.length?rows3.slice(0,3).map((rw,i)=>`<text x="426" y="${231+i*13}" fill="${best&&Math.abs(rw.value-best.value)<1e-5?'#047857':'#64748b'}" font-size="8.8" font-weight="${best&&Math.abs(rw.value-best.value)<1e-5?800:600}">• V_${i+1}(${fmt(rw.x,1)}; ${fmt(rw.y,1)}) → F = ${fmt(rw.value,1)} ${best&&Math.abs(rw.value-best.value)<1e-5?'★ MAX':''}</text>`).join(''):''}
  </g>`:'',

  // Interior intersection vertices V_i
  mode===3&&showAux?activePoly.map((v,i)=>{
   const [sx,sy]=toScreen(v[0],v[1]),isBest=best&&Math.abs(v[0]-best.x)<1e-4&&Math.abs(v[1]-best.y)<1e-4;
   const dx=v[0]-cxPoly,dy=v[1]-cyPoly,dl=Math.hypot(dx,dy)||1;
   const lx=sx+(dx/dl)*22,ly=sy-(dy/dl)*16+4;
   return `<g>${dot(sx,sy,isBest?6.8:5.2,isBest?'#12876f':'#0c7da0')}${haloTxt(lx,ly,`V_${i+1}(${fmt(v[0],1)};${fmt(v[1],1)})`,isBest?'#0f6953':'#0f4c68',10,'middle',800)}</g>`;
  }).join(''):'',
  best&&mode===3?`<g><circle cx="${fmt(bestPt[0],2)}" cy="${fmt(bestPt[1],2)}" r="${fmt(13*(1+.08*Math.sin(t*3)),2)}" fill="#12876f" fill-opacity="0.22"/>${dot(bestPt[0],bestPt[1],7.5,'#12876f')}${pill(416,454,238,24,`Đỉnh cực trị (${fmt(best.x,1)}; ${fmt(best.y,1)}) → Max F = ${fmt(best.value,1)}`,'#12876f','#12876f','#fff',10.2)}</g>`:'',
  t>0?pill(408,84,352,22,ineqPhases[pIdx-1],'#fff4eb','#f3c299','#b84a18',9.5):'',
  footer10(id,mode===3&&best?`Max F = ${fmt(best.value,2)} tại đỉnh (${fmt(best.x,2)}; ${fmt(best.y,2)})`:`Bờ ax + by = c chia Oxy thành 2 nửa mặt phẳng`,t)
 ].join('');
}
"""

new_text = text[:start_idx] + new_fn + text[end_idx:]
with open(path, 'w', encoding='utf-8') as f:
    f.write(new_text)

print('SUCCESSFULLY RE-PATCHED grade10-svg.mjs')
