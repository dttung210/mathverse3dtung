import fs from 'fs';

// 1. Update grade10-engine.mjs
let enginePath = 'src/curriculum/grade10-engine.mjs';
let engineContent = fs.readFileSync(enginePath, 'utf8');

const targetEngine = `   if(idx===1){
    record('Đường bờ (d₁)',\`\${p.a}x + \${p.b}y = \${p.c} (\${strictIneq?'Nét đứt, không lấy bờ':'Nét liền, có lấy bờ'})\`);
    record(\`Điểm thử M(\${fixed(mx,1)}; \${fixed(my,1)})\`,\`VT = \${fixed(lhsM,1)} \${strictIneq?'<':'≤'} \${p.c} → \${inM?'Thuộc miền nghiệm':'Không thuộc'}\`);
    record('Miền nghiệm',\`Nửa mặt phẳng bờ (d₁) \${inM?'chứa M (được tô màu)':'không chứa M'}\`);
   }else if(idx===2){
    const det=p.a*p.e-p.b*p.d;
    const interPt=Math.abs(det)>1e-4?\`(\${fixed((p.c*p.e-p.b*p.f)/det,1)}; \${fixed((p.a*p.f-p.c*p.d)/det,1)})\`:'Song song / Trùng';
    const in2=p.d*mx+p.e*my<=p.f+1e-9;
    record('Giao điểm 2 bờ I',interPt);
    record(\`Điểm thử M(\${fixed(mx,1)}; \${fixed(my,1)})\`,\`\${inM&&in2?'M ∈ S₁ ∩ S₂ (Thuộc miền nghiệm chung)':inM?'M chỉ thuộc S₁':in2?'M chỉ thuộc S₂':'M ∉ S'}\`);
    record('Miền nghiệm chung S',poly.length?\`Miền giao S₁ ∩ S₂ (\${poly.length} đỉnh)\`:'∅ (rỗng trong khung)');
   }else{
    record('Hệ 4 đường ràng buộc','(d₁), (d₂), (d₃): x ≥ 0, (d₄): y ≥ 0');
    record('Số đỉnh đa giác',poly.length);
    if(max){record('Giá trị lớn nhất F_max',max.value);record('Đỉnh đạt cực trị',\`(\${fixed(max.x,1)}; \${fixed(max.y,1)})\`);}
   }`;

const replaceEngine = `   if(idx===1){
    record('Đường bờ (d₁)',\`\${formatLinearExpr2D(p.a,p.b)} = \${fixed(p.c,1)} (\${strictIneq?'Nét đứt, không lấy bờ':'Nét liền, có lấy bờ'})\`);
    record(\`Điểm thử M(\${fixed(mx,1)}; \${fixed(my,1)})\`,\`VT = \${fixed(lhsM,1)} \${strictIneq?'<':'≤'} \${fixed(p.c,1)} → \${inM?'Thuộc miền nghiệm':'Không thuộc'}\`);
    record('Miền nghiệm',\`Nửa mặt phẳng bờ (d₁) \${inM?'chứa M (được tô màu)':'không chứa M'}\`);
   }else if(idx===2){
    const det=p.a*p.e-p.b*p.d;
    const interPt=Math.abs(det)>1e-4?\`(\${fixed((p.c*p.e-p.b*p.f)/det,1)}; \${fixed((p.a*p.f-p.c*p.d)/det,1)})\`:'Song song / Trùng';
    const in2=p.d*mx+p.e*my<=p.f+1e-9;
    record('Đường bờ (d₁)',\`\${formatLinearExpr2D(p.a,p.b)} ≤ \${fixed(p.c,1)}\`);
    record('Đường bờ (d₂)',\`\${formatLinearExpr2D(p.d,p.e)} ≤ \${fixed(p.f,1)}\`);
    record('Giao điểm 2 bờ I',interPt);
    record(\`Điểm thử M(\${fixed(mx,1)}; \${fixed(my,1)})\`,\`\${inM&&in2?'M ∈ S₁ ∩ S₂ (Thuộc miền nghiệm chung)':inM?'M chỉ thuộc S₁':in2?'M chỉ thuộc S₂':'M ∉ S'}\`);
    record('Miền nghiệm chung S',poly.length?\`Miền giao S₁ ∩ S₂ (\${poly.length} đỉnh)\`:'∅ (rỗng trong khung)');
   }else{
    record('Hệ 4 đường ràng buộc',\`(d₁): \${formatLinearExpr2D(p.a,p.b)} ≤ \${fixed(p.c,1)}; (d₂): \${formatLinearExpr2D(p.d,p.e)} ≤ \${fixed(p.f,1)}; (d₃): x ≥ 0; (d₄): y ≥ 0\`);
    record('Hướng tăng mục tiêu F',\`∇F = (\${p.u}; \${p.v})\`);
    if(poly.length){
     record('Tọa độ các đỉnh',rows.map((r,i)=>\`V_\${i+1}(\${fixed(r.x,1)}; \${fixed(r.y,1)})\`).join(', '));
     record('Giá trị F tại các đỉnh',rows.map((r,i)=>\`F(V_\${i+1}) = \${fixed(r.value,1)}\`).join(', '));
    }
    if(max){record('Đỉnh cực trị tối ưu',\`Max F = \${fixed(max.value,1)} tại đỉnh (\${fixed(max.x,1)}; \${fixed(max.y,1)})\`);}
    record('Miền nghiệm đa giác',poly.length?\`\${poly.length} đỉnh lồi\`:'∅ (rỗng)');
   }`;

if (!engineContent.includes(targetEngine)) {
  console.error("targetEngine not found in grade10-engine.mjs!");
  process.exit(1);
}

engineContent = engineContent.replace(targetEngine, replaceEngine);
fs.writeFileSync(enginePath, engineContent, 'utf8');
console.log("Successfully updated grade10-engine.mjs!");

