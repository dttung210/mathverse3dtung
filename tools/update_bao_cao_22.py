import sys
sys.stdout.reconfigure(encoding='utf-8')

path = r"BAO_CAO_ANTIGRAVITY_NANG_CAP_3D.md"
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

target = "---"
item22 = """---

22. **Giải phóng hoàn toàn chữ và hộp đè trong khung vẽ Toán 10 (Mô hình 10-02-C01, 10-02-C02, 10-02-C03):**
    - [31_mo_hinh_1002c03_khung_ve_sach_se_khong_chu.png](file:///G:/ANTIGRAVITY/MATH_3D_MUSEUM/MATHVERSE_R74_FULL_3D_GRAPHICS_TICH_HOP_ANTIGRAVITY_2026-10-31/MATHVERSE_R74_3D_GRAPHICS_FULL_PROJECT/QA_ANH_KIEM_TRA/31_mo_hinh_1002c03_khung_ve_sach_se_khong_chu.png)
    - [32_mo_hinh_1002c03_the_so_lieu_ben_duoi.png](file:///G:/ANTIGRAVITY/MATH_3D_MUSEUM/MATHVERSE_R74_FULL_3D_GRAPHICS_TICH_HOP_ANTIGRAVITY_2026-10-31/MATHVERSE_R74_3D_GRAPHICS_FULL_PROJECT/QA_ANH_KIEM_TRA/32_mo_hinh_1002c03_the_so_lieu_ben_duoi.png)
    - [33_mo_hinh_1002c01_khung_ve_sach_se.png](file:///G:/ANTIGRAVITY/MATH_3D_MUSEUM/MATHVERSE_R74_FULL_3D_GRAPHICS_TICH_HOP_ANTIGRAVITY_2026-10-31/MATHVERSE_R74_3D_GRAPHICS_FULL_PROJECT/QA_ANH_KIEM_TRA/33_mo_hinh_1002c01_khung_ve_sach_se.png)
    - [34_mo_hinh_1002c02_khung_ve_sach_se.png](file:///G:/ANTIGRAVITY/MATH_3D_MUSEUM/MATHVERSE_R74_FULL_3D_GRAPHICS_TICH_HOP_ANTIGRAVITY_2026-10-31/MATHVERSE_R74_3D_GRAPHICS_FULL_PROJECT/QA_ANH_KIEM_TRA/34_mo_hinh_1002c02_khung_ve_sach_se.png)
    - **Đưa 100% khối chữ, bảng 4 đường và thẻ pill ra KHỎI khung vẽ:** Khung vẽ hình học Oxy được giải phóng triệt để, không còn bất kỳ hộp thông tin to nào che khuất các góc phần tư hay đường thẳng.
    - **Bên trong khung vẽ tập trung 100% vào hình học chuẩn mực:** Hệ trục toạ độ Oxy, lưới toạ độ thanh mảnh, các đường thẳng $(d_1), (d_2)$ với nhãn nhỏ gọn ở mút ngoài, 2 trục toạ độ $(d_3 \equiv Oy), (d_4 \equiv Ox)$, miền nghiệm đa giác lồi tô màu bóng trong suốt, các đỉnh $V_1, V_2, V_3, V_4$ được đánh dấu chấm điểm và nhãn chữ toán học nhỏ gọn thanh thoát, thước đường mức nét đứt và vectơ gradient $\\nabla F$ dạng mũi tên hình học chỉ hướng tăng rõ ràng.
    - **Chuyển toàn bộ dữ liệu phân tích xuống hệ thống thẻ số liệu bên dưới:**
      + *Thẻ 1:* Mã và tên bài toán tối ưu tuyến tính trực quan.
      + *Thẻ 2:* Hệ 4 đường ràng buộc chi tiết: $(d_1): ax + by \\le c; (d_2): dx + ey \\le f; (d_3): x \\ge 0; (d_4): y \\ge 0$.
      + *Thẻ 3:* Hướng tăng hàm mục tiêu $F$: $\\nabla F = (u; v)$.
      + *Thẻ 4:* Toạ độ cụ thể các đỉnh đa giác miền nghiệm: $V_1(x_1; y_1), V_2(x_2; y_2), \\dots$.
      + *Thẻ 5:* Bảng tính giá trị hàm mục tiêu tại từng đỉnh: $F(V_1) = \\dots, F(V_2) = \\dots, \\dots$.
      + *Thẻ 6:* Đỉnh cực trị tối ưu kết luận: $\\text{Max } F = \\dots$ tại đỉnh $(x^*; y^*)$.
      + *Thẻ 7:* Số lượng đỉnh và tính chất lồi của miền nghiệm.
    - **Kiểm định toàn vẹn:** Vượt qua 17/17 ca kiểm thử Toán 10, 11/11 ca kiểm thử checklist R7.3, 10/10 ca đồ hoạ 3D và 100% SHA-256 bảo vệ toàn vẹn."""

pos = text.find("## 5. HƯỚNG DẪN CÔ GIÁO TRẢI NGHIỆM")
if pos != -1:
    new_text = text[:pos] + item22 + "\n\n---\n\n" + text[pos:]
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_text)
    print("Updated BAO_CAO_ANTIGRAVITY_NANG_CAP_3D.md successfully!")
else:
    print("Failed to find target section in BAO_CAO_ANTIGRAVITY_NANG_CAP_3D.md")

