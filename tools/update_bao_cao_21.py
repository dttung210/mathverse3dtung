with open('BAO_CAO_ANTIGRAVITY_NANG_CAP_3D.md', 'r', encoding='utf-8') as f:
    content = f.read()

target = '## 5. HƯỚNG DẪN CÔ GIÁO TRẢI NGHIỆM'

new_section = '''21. **Nâng cấp Hệ thống Giao diện Phòng SGK: Mặc định Trắng Teal & Tích hợp nút đổi màu Đen Teal:**
    - [26_giao_dien_trang_teal_mac_dinh.png](file:///G:/ANTIGRAVITY/MATH_3D_MUSEUM/MATHVERSE_R74_FULL_3D_GRAPHICS_TICH_HOP_ANTIGRAVITY_2026-10-31/MATHVERSE_R74_3D_GRAPHICS_FULL_PROJECT/QA_ANH_KIEM_TRA/26_giao_dien_trang_teal_mac_dinh.png)
    - [27_giao_dien_den_teal_khi_bam_nut.png](file:///G:/ANTIGRAVITY/MATH_3D_MUSEUM/MATHVERSE_R74_FULL_3D_GRAPHICS_TICH_HOP_ANTIGRAVITY_2026-10-31/MATHVERSE_R74_3D_GRAPHICS_FULL_PROJECT/QA_ANH_KIEM_TRA/27_giao_dien_den_teal_khi_bam_nut.png)
    - [29_mo_hinh_1102c05_trang_teal_nhu_hinh.png](file:///G:/ANTIGRAVITY/MATH_3D_MUSEUM/MATHVERSE_R74_FULL_3D_GRAPHICS_TICH_HOP_ANTIGRAVITY_2026-10-31/MATHVERSE_R74_3D_GRAPHICS_FULL_PROJECT/QA_ANH_KIEM_TRA/29_mo_hinh_1102c05_trang_teal_nhu_hinh.png)
    - [30_mo_hinh_1102c05_nut_bam_ro_rang.png](file:///G:/ANTIGRAVITY/MATH_3D_MUSEUM/MATHVERSE_R74_FULL_3D_GRAPHICS_TICH_HOP_ANTIGRAVITY_2026-10-31/MATHVERSE_R74_3D_GRAPHICS_FULL_PROJECT/QA_ANH_KIEM_TRA/30_mo_hinh_1102c05_nut_bam_ro_rang.png)
    - **Mặc định TRẮNG TEAL chuẩn ảnh cô giáo gửi:** Toàn bộ cửa sổ Kho SGK 6-12, thanh công cụ lớp học, 2 cột danh mục bài học, sân khấu chính, thẻ Nhiệm vụ Khám phá 3 bước, khung nhìn đồ thị, thẻ đo lường và khung công thức LaTeX đều khoác lên tông màu Trắng Teal thanh lịch, sang trọng và có độ tương phản xuất sắc.
    - **Tích hợp nút đổi màu trên thanh tiêu đề:** Bổ sung nút bấm `☀️ Trắng Teal` / `🌙 Đen Teal` ở góc trên bên phải, cho phép học sinh và giáo viên chuyển đổi tức thì giữa 2 giao diện bất cứ lúc nào (tùy chọn được ghi nhớ tự động qua `localStorage`).
    - **Hệ thống nút bấm rõ ràng, trực quan, thẩm mỹ cao:** Các nút tương tác như `▶ Phát chuyển động`, `⏭ Tiếp bước`, `↺ Đặt lại`, `📋 Sao chép công thức LaTeX` được thiết kế chuẩn mực với viền bo tròn mềm mại, biểu tượng và chữ sắc nét, hiệu ứng phản hồi nhấc nổi mượt mà.

---

## 5. HƯỚNG DẪN CÔ GIÁO TRẢI NGHIỆM'''

if target in content and "21. **Nâng cấp Hệ thống Giao diện Phòng SGK" not in content:
    content = content.replace(target, new_section)
    with open('BAO_CAO_ANTIGRAVITY_NANG_CAP_3D.md', 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Updated BAO_CAO_ANTIGRAVITY_NANG_CAP_3D.md with section 21")
else:
    print("NOTE: Target not found or section 21 already present")

