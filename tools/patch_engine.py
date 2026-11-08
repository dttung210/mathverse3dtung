import os

path = r"G:\ANTIGRAVITY\MATH_3D_MUSEUM\MATHVERSE_R74_FULL_3D_GRAPHICS_TICH_HOP_ANTIGRAVITY_2026-10-31\MATHVERSE_R74_3D_GRAPHICS_FULL_PROJECT\src\curriculum\grade10-engine.mjs"
with open(path, "rb") as f:
    content = f.read().decode("utf-8")

old_str = """   }else{
    record('Hệ 4 đường ràng buộc','(d₁), (d₂), (d₃): x ≥ 0, (d₄): y ≥ 0');
    record('Số đỉnh đa giác',poly.length);
    if(max){record('Giá trị lớn nhất F_max',max.value);record('Đỉnh đạt cực trị',`(${fixed(max.x,1)}; ${fixed(max.y,1)})`);}
   }"""

new_str = """   }else{
    record('Hệ 4 đường ràng buộc',`(d₁): ${p.a}x + ${p.b}y ≤ ${p.c}; (d₂): ${p.d}x + ${p.e}y ≤ ${p.f}; (d₃): x ≥ 0; (d₄): y ≥ 0`);
    record('Hướng tăng mục tiêu F',`∇F = (${p.u}; ${p.v})`);
    if(poly.length){
     record('Tọa độ các đỉnh',rows.map((r,i)=>`V_${i+1}(${fixed(r.x,1)}; ${fixed(r.y,1)})`).join(', '));
     record('Giá trị F tại các đỉnh',rows.map((r,i)=>`F(V_${i+1}) = ${fixed(r.value,1)}`).join(', '));
    }
    if(max){record('Đỉnh cực trị tối ưu',`Max F = ${fixed(max.value,1)} tại đỉnh (${fixed(max.x,1)}; ${fixed(max.y,1)})`);}
    record('Miền nghiệm đa giác',poly.length?`${poly.length} đỉnh lồi`:'∅ (rỗng)');
   }"""

# Normalize newlines for search
if old_str in content:
    content = content.replace(old_str, new_str, 1)
    with open(path, "wb") as f:
        f.write(content.encode("utf-8"))
    print("Engine replacement SUCCESS")
else:
    # Try with CRLF
    old_crlf = old_str.replace("\n", "\r\n")
    new_crlf = new_str.replace("\n", "\r\n")
    if old_crlf in content:
        content = content.replace(old_crlf, new_crlf, 1)
        with open(path, "wb") as f:
            f.write(content.encode("utf-8"))
        print("Engine replacement SUCCESS (CRLF)")
    else:
        print("Engine replacement FAILED: target not found")

