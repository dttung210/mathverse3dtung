with open('BAO_CAO_ANTIGRAVITY_NANG_CAP_3D.md', 'r', encoding='utf-8') as f:
    content = f.read()

target = '## 5. HƯỚNG DẪN CÔ GIÁO TRẢI NGHIỆM'

new_section = '''20. **Nâng cấp trực quan & Sư phạm chuẩn SGK Chương II Toán 10 (Mô hình 10-02-C01, 10-02-C02, 10-02-C03):**
    - [23_mo_hinh_1002c01_ro_rang_khong_roi.png](file:///G:/ANTIGRAVITY/MATH_3D_MUSEUM/MATHVERSE_R74_FULL_3D_GRAPHICS_TICH_HOP_ANTIGRAVITY_2026-10-31/MATHVERSE_R74_3D_GRAPHICS_FULL_PROJECT/QA_ANH_KIEM_TRA/23_mo_hinh_1002c01_ro_rang_khong_roi.png)
    - [24_mo_hinh_1002c02_he_bpt_doi_toa_do.png](file:///G:/ANTIGRAVITY/MATH_3D_MUSEUM/MATHVERSE_R74_FULL_3D_GRAPHICS_TICH_HOP_ANTIGRAVITY_2026-10-31/MATHVERSE_R74_3D_GRAPHICS_FULL_PROJECT/QA_ANH_KIEM_TRA/24_mo_hinh_1002c02_he_bpt_doi_toa_do.png)
    - [25_mo_hinh_1002c03_giao_4_duong_huong_do_thi.png](file:///G:/ANTIGRAVITY/MATH_3D_MUSEUM/MATHVERSE_R74_FULL_3D_GRAPHICS_TICH_HOP_ANTIGRAVITY_2026-10-31/MATHVERSE_R74_3D_GRAPHICS_FULL_PROJECT/QA_ANH_KIEM_TRA/25_mo_hinh_1002c03_giao_4_duong_huong_do_thi.png)
    - **Yêu cầu 1 (Mô hình 1 - 10-02-C01):** Bổ sung nhãn phương trình đường thẳng cụ thể thay đổi theo toạ độ (d₁): x + y = 2.0 ngay trên đồ thị; gỡ bỏ khối thông tin đè lên trục toạ độ, thay bằng nhãn điểm thử M(x; y) thanh mảnh tinh tế và thẻ trạng thái miền nghiệm đặt ở góc trên thoáng đãng; hiển thị toạ độ giao điểm với 2 trục A(xA; 0), B(0; yB) và chốt kéo trực quan P1.
    - **Yêu cầu 2 (Mục Bài toán tối ưu - 10-02-C03):** Xác định và hiển thị rõ ràng cả 4 đường ràng buộc tạo nên miền nghiệm SGK: (d₁): x + y ≤ 2.0, (d₂): -x + y ≤ 1.0, (d₃): x ≥ 0 (trục Oy: x = 0), (d₄): y ≥ 0 (trục Ox: y = 0); bổ sung đầy đủ các mũi tên chỉ hướng nửa mặt phẳng nghiệm cho cả 4 đường; bổ sung vectơ gradient ∇F(2; 1) chỉ rõ hướng tăng giá trị hàm mục tiêu F(x, y); bảng thông tin hiển thị toạ độ và giá trị tại từng đỉnh đa giác lồi: V3(0; 0) -> 0, V2(0; 1) -> 1.0, V1(0.5; 1.5) -> 2.5, và đỉnh tối ưu (2; 0) -> Max F = 4.0.
    - **Yêu cầu 3 (Mục Hệ bất phương trình - 10-02-C02):** Bổ sung đồ thị tương tác thay đổi theo toạ độ, cho phép kéo chốt điều khiển P1 (trên d1), P2 (trên d2) và kéo điểm thử M trực tiếp trên canvas; hiển thị giao điểm I(xI; yI) và kết luận miền nghiệm chung S = S1 ∩ S2.
    - **Kiểm thử tự động & Tính toàn vẹn:** Đạt 17/17 ca kiểm thử chuyên sâu Toán 10 (grade10-deep-audit.test.mjs), 11/11 ca kiểm thử checklist R7.3 (r73-checklist-audit.test.mjs), 10/10 ca đồ họa 3D (npm run check:graphics) và 100% SHA-256 bảo vệ toàn vẹn.

---

## 5. HƯỚNG DẪN CÔ GIÁO TRẢI NGHIỆM'''

if target in content:
    content = content.replace(target, new_section)
    with open('BAO_CAO_ANTIGRAVITY_NANG_CAP_3D.md', 'w', encoding='utf-8') as f:
        f.write(content)
    print('UPDATED BAO_CAO_ANTIGRAVITY_NANG_CAP_3D.md SUCCESSFULLY')
else:
    print('TARGET NOT FOUND')
