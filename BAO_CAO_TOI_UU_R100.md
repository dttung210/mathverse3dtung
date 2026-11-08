# BÁO CÁO TỐI ƯU MATHVERSE R100 - AN TOÀN

## Nguồn đầu vào
Ba tệp gốc: `MATHVERSE_R100_PHAN_1.zip`, `MATHVERSE_R100_PHAN_2.zip`, `MATHVERSE_R100_PHAN_3.zip`. Tất cả phần ZIP đều đọc được và kiểm tra CRC thành công.

## Kiểm kê và thay đổi
- Tệp đầu vào: **2444** (không có đường dẫn trùng khác CRC giữa các phần).
- Dung lượng đầu vào giải nén: **328.97 MiB**.
- Gói vận hành tinh gọn: **1535 tệp**, khoảng **200.60 MiB**.
- Lưu trữ lịch sử: **912 tệp** (có README bổ sung), khoảng **128.36 MiB**.
- Dữ liệu gốc không có bản lưu trong cả gói vận hành hoặc gói lịch sử: **0 tệp**.
- Bản sao gốc được giữ nguyên byte trong gói vận hành: **1528 tệp**.
- Tệp gốc được cập nhật có chủ đích: 00_CHAY_MATHVERSE_R100.bat, MANIFEST_MATHVERSE_2026-11-02_DA_SUA.json, R98_ASSET_PROVENANCE.json, README.md, dual/discovery-r98/quan-ly.mjs, package.json.
- Từ **80 tệp BAT** gốc xuống **5 tệp BAT** với các mục đích khác nhau: chạy R100, cài Gemini, cài thư viện tùy chọn, mở so sánh R100, sao chép prompt R100.

## Dữ liệu không thay đổi
SHA-256 gốc trùng với bản tinh gọn ở các tệp trọng tâm:
- `dual/index.html`, `dual/style.css`, `dual/app.mjs` và các tệp giao diện R100.
- `src/main.js`, `server/host.mjs`, `server/server.mjs`.
- `game-park/assets/teacher-bank-6-12-63-chapters.json`.
- `dual/discovery-r98/assets/unesco_parthenon_glb.glb`.
- Tất cả `museum-assets`, `museum-thumbs`, `museum-data`.

## Tối ưu giữ chức năng quản lý GLB
Hai bản Parthenon ở `dual/discovery-r98/assets/` và `.../assets/candidates/` là **trùng byte**. Đã giữ bản GLB đã công bố ở đường dẫn cố định, và sửa `dual/discovery-r98/quan-ly.mjs` để tải cùng bản đó cho thao tác xem trước/nhập mô hình. Bản ứng viên được đưa vào gói lịch sử. Ảnh Parthenon trùng byte cũng được xử lý tương tự.

## Kết quả kiểm thử
- **70/70 kiểm thử Node được chọn**: PASS (R95-R100 Discovery và ngân hàng game).
- `npm run verify:slim`: PASS (11 game; Toán 6-12; 63 chương; 3.150 câu nguồn và 3.087 câu qua kiểm tra cấu trúc).
- Truy cập HTTP khi mở bằng Node.js: `/health`, `/`, `/r75/`, `/game-park/`, `/museum-data/catalog.json`, `dual/discovery-r100/wonders-ui.mjs`, `dual/discovery-r98/quan-ly.mjs`, ảnh và GLB Parthenon trả **200 OK**.
- `/museum-assets/` (không phải đường dẫn tệp cụ thể): trả 404 theo thiết kế, không phải lỗi dữ liệu. Các ảnh được truy cập qua đường dẫn `.webp` theo `museum-data/catalog.json`.
- **Chưa kiểm thử đồ họa WebGL và Sketchfab trên máy Windows của cô**. Trình duyệt thực vẫn cần nghiệm thu tương tác.
- Bộ kiểm thử R99 Natural Wonders cũ có một bài kiểm thử không phù hợp với R100 hiện tại (R100 cố ý không còn gắn phòng kỳ quan thiên nhiên); ngay ở ZIP nguồn bài này đã lỗi, nên không được dùng làm bằng chứng R100 bị mất tính năng.
- Manifest từ ZIP R100 gốc có nhiều hash không cập nhật; đã tái tạo manifest SHA-256 khớp bản tinh gọn, và `verify:slim` chạy thành công.

## Hướng dẫn
1. Đặt tất cả file ZIP (nếu tải dạng chia nhỏ) ở cùng thư mục bất kỳ.
2. Giải nén **cả hai ZIP** vào cùng một thư mục đích, giữ nguyên tên thư mục `MATHVERSE_R100_TOI_UU_AN_TOAN`.
3. Bấm `00_CHAY_MATHVERSE_R100.bat` trong thư mục dự án.
4. Không chép các BAT của bản R99/R101/R101.1 vào bản tinh gọn; đây là R100 nguồn ổn định do cô tải lên.
5. Nếu cần xem tài liệu/ảnh kiểm thử cũ, tải gói **LƯU TRỮ LỊCH SỬ** riêng, không cần cho chạy ứng dụng.

**Chú ý:** Tinh gọn chủ yếu loại bớt bản sao, báo cáo, lịch sử và trình khởi chạy trùng nhau; **không tuyên bố đã cải thiện FPS hoặc dựng lại mô hình 3D**.
