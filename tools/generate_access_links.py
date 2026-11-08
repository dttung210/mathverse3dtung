import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

ROOT_PROJECT = r'G:\ANTIGRAVITY\MATH_3D_MUSEUM\MATHVERSE_R74_FULL_3D_GRAPHICS_TICH_HOP_ANTIGRAVITY_2026-10-31\MATHVERSE_R74_3D_GRAPHICS_FULL_PROJECT'
R75_PROJECT = r'G:\ANTIGRAVITY\MATH_3D_MUSEUM\MATHVERSE_R75_FULL_3D_GRAPHICS_HOAN_CHINH'
MAIN_DIR = r'G:\ANTIGRAVITY\MATH_3D_MUSEUM'

URL_CONTENT = """[InternetShortcut]
URL=http://127.0.0.1:4173/
IconIndex=0
"""

HTML_CONTENT = """<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=http://127.0.0.1:4173/">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MATHVERSE R75 — BẢO TÀNG TOÁN HỌC 3D & KHO SGK TOÁN 6–12</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: 'Segoe UI', Inter, -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      background: radial-gradient(circle at 50% 30%, #0d3b4c 0%, #061822 100%);
      color: #ffffff;
      text-align: center;
    }
    .card {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(56, 189, 248, 0.35);
      border-radius: 24px;
      padding: 44px 36px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
      max-width: 580px;
      backdrop-filter: blur(16px);
    }
    .badge {
      display: inline-block;
      background: rgba(20, 184, 166, 0.2);
      border: 1px solid #14b8a6;
      color: #2dd4bf;
      padding: 6px 16px;
      border-radius: 30px;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 16px;
      letter-spacing: 0.5px;
    }
    h1 {
      font-size: 26px;
      margin: 0 0 10px 0;
      color: #38bdf8;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .subtitle {
      color: #94a3b8;
      font-size: 15px;
      margin-bottom: 24px;
    }
    .url-box {
      background: rgba(0, 0, 0, 0.35);
      border: 1px dashed rgba(56, 189, 248, 0.4);
      border-radius: 12px;
      padding: 12px 20px;
      margin-bottom: 24px;
      font-family: Consolas, monospace;
      font-size: 18px;
      color: #38bdf8;
      font-weight: 700;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #0ea5e9 0%, #0d9488 100%);
      color: #ffffff;
      font-weight: 700;
      padding: 16px 36px;
      border-radius: 14px;
      text-decoration: none;
      font-size: 16px;
      transition: all 0.25s ease;
      box-shadow: 0 10px 25px rgba(14, 165, 233, 0.4);
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 14px 32px rgba(20, 184, 166, 0.5);
      background: linear-gradient(135deg, #38bdf8 0%, #14b8a6 100%);
    }
    .note {
      margin-top: 24px;
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">PHIÊN BẢN R75 HOÀN CHỈNH</div>
    <h1>MATHVERSE R75</h1>
    <div class="subtitle">Bảo Tàng Toán Học 3D & Kho Học Liệu Số 6–12 Chuẩn SGK</div>
    <div class="url-box">http://127.0.0.1:4173/</div>
    <a href="http://127.0.0.1:4173/" class="btn">👉 Bấm vào đây để vào ứng dụng ngay</a>
    <div class="note">
      Trình duyệt đang tự động chuyển hướng trong giây lát...<br>
      Nếu chưa mở được, Thầy/Cô vui lòng chạy tệp <strong>00_CHAY_MATHVERSE_R75.bat</strong> trước.
    </div>
  </div>
  <script>
    window.location.href = "http://127.0.0.1:4173/";
  </script>
</body>
</html>
"""

TXT_CONTENT = """========================================================================================
  ĐƯỜNG DẪN TRUY CẬP CHÍNH THỨC MATHVERSE R75 (PHIÊN BẢN HOÀN CHỈNH)
  BẢO TÀNG TOÁN HỌC TƯƠNG TÁC 3D & KHO HỌC LIỆU SỐ SGK TOÁN 6–12
========================================================================================

1. ĐƯỜNG LINK TRUY CẬP TRỰC TIẾP TRÊN TRÌNH DUYỆT (CHROME / CỐC CỐC / EDGE):
   🔗 http://127.0.0.1:4173/
   🔗 http://localhost:4173/

2. CÁCH MỞ NHANH 1-CLICK TIỆN LỢI CHO THẦY/CÔ:
   - Cách 1: Nhấp đúp vào tệp: LINK_TRUY_CAP_MATHVERSE.url (Mở thẳng trình duyệt)
   - Cách 2: Nhấp đúp vào tệp: TRUY_CAP_MATHVERSE.html (Tự động chuyển hướng vào ứng dụng)
   - Cách 3: Nhấp đúp vào tệp: 00_CHAY_MATHVERSE_R75.bat (Khởi động máy chủ và sẵn sàng truy cập)

3. CÁC TÍNH NĂNG NỔI BẬT ĐÃ HOÀN THIỆN TRONG PHIÊN BẢN R75:
   ✅ Khung vẽ hình học thuần khiết (Zero Clutter): 100% chữ, bảng hệ 4 đường và thẻ pill
      đã được đưa ra khỏi khung vẽ, đặt xuống hệ thống thẻ số liệu phía dưới khoa học, thoáng đãng.
   ✅ Giao diện phòng SGK mặc định TRẮNG TEAL thanh lịch, tương phản cao chuẩn ảnh cô giáo gửi.
   ✅ Tích hợp nút đổi màu tức thì [☀️ Trắng Teal] / [🌙 Đen Teal] trên thanh tiêu đề.
   ✅ Làm nét không gian 3D, đưa khung mặt cắt 2D xuống dưới theo bố cục xếp tầng dọc.
   ✅ Khối hằng đẳng thức Lập phương một tổng (8-01-C03) tách khối chuyển động không bị đè chữ.
   ✅ Phòng Triển lãm 11 danh nhân quốc tế + 14 tranh tường hành lang + 2 bục GeoGebra 2D/3D.
   ✅ Hướng dẫn viên GS. Euler tại cửa phòng Triển lãm (phím E hoặc nhấp chuột).
   ✅ Bảo toàn 100% 310 mô hình Toán chuẩn SGK GDPT 2018 (Grades 6–12).

========================================================================================
"""

targets = [ROOT_PROJECT, R75_PROJECT, MAIN_DIR]

for folder in targets:
    if not os.path.exists(folder):
        print(f"Skipping non-existent folder: {folder}")
        continue
    
    # 1. URL file
    url_file = os.path.join(folder, "LINK_TRUY_CAP_MATHVERSE.url")
    with open(url_file, "w", encoding="utf-8") as f:
        f.write(URL_CONTENT)
    print(f"Created: {url_file}")
    
    # 2. HTML redirect file
    html_file = os.path.join(folder, "TRUY_CAP_MATHVERSE.html")
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(HTML_CONTENT)
    print(f"Created: {html_file}")
    
    # 3. TXT file
    txt_file = os.path.join(folder, "LINK_TRUY_CAP.txt")
    with open(txt_file, "w", encoding="utf-8") as f:
        f.write(TXT_CONTENT)
    print(f"Created: {txt_file}")

print("=== HOÀN TẤT TẠO TOÀN BỘ LINK TRUY CẬP R75 ===")
