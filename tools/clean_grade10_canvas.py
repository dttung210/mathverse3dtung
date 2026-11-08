import os

base_dir = r"G:\ANTIGRAVITY\MATH_3D_MUSEUM\MATHVERSE_R74_FULL_3D_GRAPHICS_TICH_HOP_ANTIGRAVITY_2026-10-31\MATHVERSE_R74_3D_GRAPHICS_FULL_PROJECT"

# 1. Update grade10-engine.mjs
engine_file = os.path.join(base_dir, "src", "curriculum", "grade10-engine.mjs")
with open(engine_file, "r", encoding="utf-8") as f:
    text = f.read()

# Check line endings
crlf = "\r\n" in text
lines = text.splitlines()

# Update import if not present
if "import {formatLinearExpr2D}" not in text:
    lines.insert(0, "import {formatLinearExpr2D} from './math-formula-renderer.mjs';\n")

new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    if "if(idx===1){" in line and i > 140 and i < 170:
        # replace the if-else block for idx 1, 2, 3
        # collect lines up to line 165
        end_idx = i
        while end_idx < len(lines) and "if(!poly.length)record('Miền nghiệm'" not in lines[end_idx]:
            end_idx += 1
        
        block = """   if(idx===1){
    record('Đường bờ (d₁)',`${formatLinearExpr2D(p.a,p.b)} = ${fixed(p.c,1)} (${strictIneq?'Nét đứt, không lấy bờ':'Nét liền, có lấy bờ'})`);
    record(`Điểm thử M(${fixed(mx,1)}; ${fixed(my,1)})`,`VT = ${fixed(lhsM,1)} ${strictIneq?'<':'≤'} ${fixed(p.c,1)} → ${inM?'Thuộc miền nghiệm':'Không thuộc'}`);
    record('Miền nghiệm',`Nửa mặt phẳng bờ (d₁) ${inM?'chứa M (được tô màu)':'không chứa M'}`);
   }else if(idx===2){
    const det=p.a*p.e-p.b*p.d;
    const interPt=Math.abs(det)>1e-4?`(${fixed((p.c*p.e-p.b*p.f)/det,1)}; ${fixed((p.a*p.f-p.c*p.d)/det,1)})`:'Song song / Trùng';
    const in2=p.d*mx+p.e*my<=p.f+1e-9;
    record('Đường bờ (d₁)',`${formatLinearExpr2D(p.a,p.b)} ≤ ${fixed(p.c,1)}`);
    record('Đường bờ (d₂)',`${formatLinearExpr2D(p.d,p.e)} ≤ ${fixed(p.f,1)}`);
    record('Giao điểm 2 bờ I',interPt);
    record(`Điểm thử M(${fixed(mx,1)}; ${fixed(my,1)})`,`${inM&&in2?'M ∈ S₁ ∩ S₂ (Thuộc miền nghiệm chung)':inM?'M chỉ thuộc S₁':in2?'M chỉ thuộc S₂':'M ∉ S'}`);
    record('Miền nghiệm chung S',poly.length?`Miền giao S₁ ∩ S₂ (${poly.length} đỉnh)`:'∅ (rỗng trong khung)');
   }else{
    record('Hệ 4 đường ràng buộc',`(d₁): ${formatLinearExpr2D(p.a,p.b)} ≤ ${fixed(p.c,1)}; (d₂): ${formatLinearExpr2D(p.d,p.e)} ≤ ${fixed(p.f,1)}; (d₃): x ≥ 0; (d₄): y ≥ 0`);
    record('Hướng tăng mục tiêu F',`∇F = (${p.u}; ${p.v})`);
    if(poly.length){
     record('Tọa độ các đỉnh',rows.map((r,i)=>`V_${i+1}(${fixed(r.x,1)}; ${fixed(r.y,1)})`).join(', '));
     record('Giá trị F tại các đỉnh',rows.map((r,i)=>`F(V_${i+1}) = ${fixed(r.value,1)}`).join(', '));
    }
    if(max){record('Đỉnh cực trị tối ưu',`Max F = ${fixed(max.value,1)} tại đỉnh (${fixed(max.x,1)}; ${fixed(max.y,1)})`);}
    record('Miền nghiệm đa giác',poly.length?`${poly.length} đỉnh lồi`:'∅ (rỗng)');
   }"""
        new_lines.append(block)
        i = end_idx
    else:
        new_lines.append(line)
        i += 1

join_char = "\r\n" if crlf else "\n"
with open(engine_file, "w", encoding="utf-8") as f:
    f.write(join_char.join(new_lines) + join_char)

print("Updated grade10-engine.mjs successfully!")

