import sys

path = 'G:/ANTIGRAVITY/MATH_3D_MUSEUM/MATHVERSE_R74_FULL_3D_GRAPHICS_TICH_HOP_ANTIGRAVITY_2026-10-31/MATHVERSE_R74_3D_GRAPHICS_FULL_PROJECT/src/curriculum/grade10-engine.mjs'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

fam_idx = text.find("}else if(fam==='10-02'){")
start_idx = text.find('  if(idx===1){\n', fam_idx)
end_idx = text.find('  if(!poly.length)', fam_idx)

replacement = """  if(idx===1){
   record('Đường bờ (d₁)',`${p.a}x + ${p.b}y = ${p.c} (${strictIneq?'Nét đứt, không lấy bờ':'Nét liền, có lấy bờ'})`);
   record(`Điểm thử M(${fixed(mx,1)}; ${fixed(my,1)})`,`VT = ${fixed(lhsM,1)} ${strictIneq?'<':'≤'} ${p.c} → ${inM?'Thuộc miền nghiệm':'Không thuộc'}`);
   record('Miền nghiệm',`Nửa mặt phẳng bờ (d₁) ${inM?'chứa M (được tô màu)':'không chứa M'}`);
  }else if(idx===2){
   const det=p.a*p.e-p.b*p.d;
   const interPt=Math.abs(det)>1e-4?`(${fixed((p.c*p.e-p.b*p.f)/det,1)}; ${fixed((p.a*p.f-p.c*p.d)/det,1)})`:'Song song / Trùng';
   const in2=p.d*mx+p.e*my<=p.f+1e-9;
   record('Giao điểm 2 bờ I',interPt);
   record(`Điểm thử M(${fixed(mx,1)}; ${fixed(my,1)})`,`${inM&&in2?'M ∈ S₁ ∩ S₂ (Thuộc miền nghiệm chung)':inM?'M chỉ thuộc S₁':in2?'M chỉ thuộc S₂':'M ∉ S'}`);
   record('Miền nghiệm chung S',poly.length?`Miền giao S₁ ∩ S₂ (${poly.length} đỉnh)`:'∅ (rỗng trong khung)');
  }else{
   record('Hệ 4 đường ràng buộc','(d₁), (d₂), (d₃): x ≥ 0, (d₄): y ≥ 0');
   record('Số đỉnh đa giác',poly.length);
   if(max){record('Giá trị lớn nhất F_max',max.value);record('Đỉnh đạt cực trị',`(${fixed(max.x,1)}; ${fixed(max.y,1)})`);}
  }\n"""

new_text = text[:start_idx] + replacement + text[end_idx:]
with open(path, 'w', encoding='utf-8') as f:
    f.write(new_text)

print('SUCCESSFULLY UPDATED grade10-engine.mjs')

