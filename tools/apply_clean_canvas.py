import os, sys
sys.stdout.reconfigure(encoding='utf-8')

base_dir = r"G:\ANTIGRAVITY\MATH_3D_MUSEUM\MATHVERSE_R74_FULL_3D_GRAPHICS_TICH_HOP_ANTIGRAVITY_2026-10-31\MATHVERSE_R74_3D_GRAPHICS_FULL_PROJECT"

# 1. Update grade10-engine.mjs
engine_file = os.path.join(base_dir, "src", "curriculum", "grade10-engine.mjs")
with open(engine_file, "r", encoding="utf-8") as f:
    engine_text = f.read()

old_engine_block = """  }else{
   record('Hệ 4 đường ràng buộc','(d₁), (d₂), (d₃): x ≥ 0, (d₄): y ≥ 0');
   record('Số đỉnh đa giác',poly.length);\n   if(max){record('Giá trị lớn nhất F_max',max.value);record('Đỉnh đạt cực trị',`(${fixed(max.x,1)}; ${fixed(max.y,1)})`);}
  }"""

new_engine_block = """  }else{
   record('Hệ 4 đường ràng buộc',`(d₁): ${p.a}x + ${p.b}y ≤ ${p.c}; (d₂): ${p.d}x + ${p.e}y ≤ ${p.f}; (d₃): x ≥ 0; (d₄): y ≥ 0`);
   record('Hướng tăng mục tiêu F',`∇F = (${p.u}; ${p.v})`);
   if(poly.length){
    record('Tọa độ các đỉnh',rows.map((r,i)=>`V_${i+1}(${fixed(r.x,1)}; ${fixed(r.y,1)})`).join(', '));
    record('Giá trị F tại các đỉnh',rows.map((r,i)=>`F(V_${i+1}) = ${fixed(r.value,1)}`).join(', '));
   }
   if(max){record('Đỉnh cực trị tối ưu',`Max F = ${fixed(max.value,1)} tại đỉnh (${fixed(max.x,1)}; ${fixed(max.y,1)})`);}
   record('Miền nghiệm đa giác',poly.length?`${poly.length} đỉnh lồi`:'∅ (rỗng)');
  }"""

if old_engine_block in engine_text:
    engine_text = engine_text.replace(old_engine_block, new_engine_block, 1)
    with open(engine_file, "w", encoding="utf-8") as f:
        f.write(engine_text)
    print("Engine update SUCCESS")
else:
    print("Engine update FAILED: pattern not found")

# 2. Update grade10-svg.mjs
svg_file = os.path.join(base_dir, "src", "curriculum", "grade10-svg.mjs")
with open(svg_file, "r", encoding="utf-8") as f:
    svg_text = f.read()

old_svg_labels = """ // Line 1 specific equation label
 const eq1=`(d₁): ${formatLinearExpr2D(p.a,p.b)} = ${fmt(p.c,1)}`;
 const wPill1=Math.max(110,eq1.length*6.6+20);
 const pill1X=botP1?Math.max(414,Math.min(920-wPill1,botP1[0]-wPill1/2)):750;
 const pill1Y=botP1?Math.max(92,Math.min(454,botP1[1]-14)):400;

 // Line 2 specific equation label
 const eq2=`(d₂): ${formatLinearExpr2D(p.d,p.e)} = ${fmt(p.f,1)}`;
 const wPill2=Math.max(110,eq2.length*6.6+20);
 const pill2X=topP2?Math.max(414,Math.min(920-wPill2,topP2[0]-wPill2/2)):750;
 const pill2Y=topP2?Math.max(92,Math.min(454,topP2[1]-14)):100;"""

new_svg_labels = """ // Compact line labels at outer endpoints (no giant pill)
 const lbl1X=botP1?Math.max(424,Math.min(910,botP1[0]+8)):750;
 const lbl1Y=botP1?Math.max(104,Math.min(474,botP1[1]-8)):400;
 const tagD1=l1.length===2?haloTxt(lbl1X,lbl1Y,'(d₁)','#0c7da0',12,'start',800):'';

 const lbl2X=topP2?Math.max(424,Math.min(910,topP2[0]-8)):750;
 const lbl2Y=topP2?Math.max(104,Math.min(474,topP2[1]+16)):100;
 const tagD2=mode>=2&&l2.length===2?haloTxt(lbl2X,lbl2Y,'(d₂)','#d9742b',12,'end',800):'';"""

if old_svg_labels in svg_text:
    svg_text = svg_text.replace(old_svg_labels, new_svg_labels, 1)
    print("SVG labels update SUCCESS")
else:
    print("SVG labels update FAILED: pattern not found")

old_svg_modes = """  // MODE 1 SPECIFIC VISUALS:
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
  best&&mode===3?`<g><circle cx="${fmt(bestPt[0],2)}" cy="${fmt(bestPt[1],2)}" r="${fmt(13*(1+.08*Math.sin(t*3)),2)}" fill="#12876f" fill-opacity="0.22"/>${dot(bestPt[0],bestPt[1],7.5,'#12876f')}${pill(416,454,238,24,`Đỉnh cực trị (${fmt(best.x,1)}; ${fmt(best.y,1)}) → Max F = ${fmt(best.value,1)}`,'#12876f','#12876f','#fff',10.2)}</g>`:'',"""

new_svg_modes = """  // MODE 1 SPECIFIC VISUALS:
  mode===1?`<g>
   ${tagD1}
   ${dirArrows1}
   ${midP1?dot(midP1[0],midP1[1],6,'#0c7da0','#fff','P1'):''}
   ${interceptA1?dot(interceptA1[0],interceptA1[1],4.5,'#0c7da0','#fff')+haloTxt(interceptA1[0],interceptA1[1]+14,'A','#0c7da0',10.5,'middle',700):''}
   ${interceptB1?dot(interceptB1[0],interceptB1[1],4.5,'#0c7da0','#fff')+haloTxt(interceptB1[0]+12,interceptB1[1]+4,'B','#0c7da0',10.5,'start',700):''}
   <circle cx="${fmt(Mscr[0],2)}" cy="${fmt(Mscr[1],2)}" r="${fmt(10*(1+.06*Math.sin(t*3)),2)}" fill="${inM?'#12876f':'#c63d2f'}" fill-opacity="0.18"/>
   ${dot(Mscr[0],Mscr[1],7,inM?'#12876f':'#c63d2f','#fff','M')}
   ${haloTxt(Mscr[0]+(mx>=0?11:-11),Mscr[1]-8,'M',inM?'#0f6953':'#b42318',11,mx>=0?'start':'end',800)}
  </g>`:'',

  // MODE 2 SPECIFIC VISUALS:
  mode===2?`<g>
   ${tagD1}
   ${tagD2}
   ${dirArrows1}
   ${dirArrows2}
   ${midP1?dot(midP1[0],midP1[1],6,'#0c7da0','#fff','P1'):''}
   ${midP2?dot(midP2[0],midP2[1],6,'#d9742b','#fff','P2'):''}
   ${scrI?`<g>${dot(scrI[0],scrI[1],5.5,'#0e435c','#fff')}${haloTxt(scrI[0]+9,scrI[1]-6,'I','#0e435c',11,'start',800)}</g>`:''}
   <circle cx="${fmt(Mscr[0],2)}" cy="${fmt(Mscr[1],2)}" r="${fmt(10*(1+.06*Math.sin(t*3)),2)}" fill="${(inM&&inM2)?'#12876f':'#c63d2f'}" fill-opacity="0.18"/>
   ${dot(Mscr[0],Mscr[1],7,(inM&&inM2)?'#12876f':'#c63d2f','#fff','M')}
   ${haloTxt(Mscr[0]+(mx>=0?11:-11),Mscr[1]-8,'M',(inM&&inM2)?'#0f6953':'#b42318',11,mx>=0?'start':'end',800)}
  </g>`:'',

  // MODE 3 SPECIFIC VISUALS:
  mode===3?`<g>
   ${tagD1}
   ${tagD2}
   ${dirArrows1}
   ${dirArrows2}
   ${midP1?dot(midP1[0],midP1[1],6,'#0c7da0','#fff','P1'):''}
   ${midP2?dot(midP2[0],midP2[1],6,'#d9742b','#fff','P2'):''}
   ${haloTxt(toScreen(0,4.8)[0]+9,toScreen(0,4.8)[1]+6,'(d₃)','#7c3aed',11,'start',800)}
   ${haloTxt(toScreen(7.6,0)[0]-6,toScreen(7.6,0)[1]-10,'(d₄)','#059669',11,'end',800)}
   ${gradEnd?`<g>${dot(gradEnd[0],gradEnd[1],6,'#12876f','#fff','U')}${haloTxt(gradEnd[0]+8,gradEnd[1]-6,'∇F','#12876f',11,'start',800)}</g>`:''}
  </g>`:'',

  // Interior intersection vertices V_i
  mode===3&&showAux?activePoly.map((v,i)=>{
   const [sx,sy]=toScreen(v[0],v[1]),isBest=best&&Math.abs(v[0]-best.x)<1e-4&&Math.abs(v[1]-best.y)<1e-4;
   const dx=v[0]-cxPoly,dy=v[1]-cyPoly,dl=Math.hypot(dx,dy)||1;
   const lx=sx+(dx/dl)*16,ly=sy-(dy/dl)*14+4;
   return `<g>${dot(sx,sy,isBest?6.5:4.8,isBest?'#12876f':'#0c7da0')}${haloTxt(lx,ly,`V_${i+1}`,isBest?'#0f6953':'#0f4c68',11,'middle',800)}</g>`;
  }).join(''):'',
  best&&mode===3?`<circle cx="${fmt(bestPt[0],2)}" cy="${fmt(bestPt[1],2)}" r="${fmt(11*(1+.08*Math.sin(t*3)),2)}" fill="#12876f" fill-opacity="0.22"/>`:''"""

if old_svg_modes in svg_text:
    svg_text = svg_text.replace(old_svg_modes, new_svg_modes, 1)
    with open(svg_file, "w", encoding="utf-8") as f:
        f.write(svg_text)
    print("SVG modes update SUCCESS")
else:
    print("SVG modes update FAILED: pattern not found")
