# BÁO CÁO BÀN GIAO — MATHVERSE R75 DUAL WORLD V1

## Phần đã hoàn thành
- Sảnh hai cửa 3D, nút chọn hai khu và điều khiển nhân vật WASD/Shift/E.
- MATHVERSE R75 gốc được chạy bởi máy chủ riêng và chuyển tiếp cùng origin; tất cả 732 tệp mã nguồn nguyên bản.
- Bảo tàng 7 phòng lớp 6–12, 230 infographic đóng sẵn, treo hai bên tường, phóng to từng tranh.
- Nhân vật trong sảnh/bảo tàng được sinh bởi hàm `createAvatar()` **trích nguyên** từ R75, bao gồm Alex, Triết, An, Bot Pi.
- Máy chủ Node.js tự chọn cổng trống, mặc định 4190; giữ được đường dẫn R75 API.
- Có thư viện 2D dự phòng `/dual/library.html`. Không có chức năng upload hoặc nút download infographic.
- Dùng cùng phiên bản Three.js, sRGB, ACES, bảng màu và vật liệu PBR theo R75.

## Kiểm thử
- **732/732 tệp gốc:** SHA-256 giữ nguyên trước/sau việc chạy chương trình.
- **230/230 ảnh WebP:** tồn tại và có chữ ký định dạng hợp lệ.
- **9/9 ca kiểm thử mới:** đạt, gồm test khởi động máy chủ thực, proxy, CSP, R75 API và các đường dẫn ảnh.
- **10/10 ca kiểm thử đồ họa R75 gốc:** đạt trên bản sao tách biệt.
- **376/389 ca kiểm thử tổng thể R75 gốc:** đạt trên bản sao tách biệt, 13 lỗi vốn có từ R75 nguồn. Chưa sửa vì R75 bất biến.
- **Giới hạn WebGL:** môi trường kiểm thử ở đây chặn Chromium truy cập `localhost` bằng `ERR_BLOCKED_BY_ADMINISTRATOR`. Vì vậy **chưa được coi là nghiệm thu thị giác/va chạm trên trình duyệt có GPU**.

## Mô hình tích hợp
Đây là **phương án A** (sảnh chung và chuyển cảnh, giữ nguyên R75 nguồn). Hai khu dùng cùng kiểu avatar và trạng thái, nhưng khi vào R75 đối tượng avatar thuộc runtime R75 gốc. Chưa phải 1 renderer/actor duy nhất liên tục xuyên cả hai khu vực.

Để hiển thị R75 trong iframe cùng origin, host chỉ thay `frame-ancestors 'none'` thành `'self'` ở HTTP response header; byte trong R75 không thay đổi.

**Không công bố công khai 230 infographic nếu chưa xác minh quyền sử dụng và phân phối các PDF nguồn.**
