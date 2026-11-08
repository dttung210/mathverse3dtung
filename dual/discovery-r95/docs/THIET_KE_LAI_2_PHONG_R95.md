# THIẾT KẾ LẠI MATHVERSE DISCOVERY R95

## Một công trình, hai phòng; không phát sinh khu thứ năm

**Giữ nguyên kiến trúc gốc:** Museum, Lab, Công viên, Discovery, toàn bộ nhân vật, camera, dữ liệu Toán 6–12, các Lab, ngân hàng câu hỏi và menu. Tái cấu trúc *trong* Discovery và thẩm mỹ mặt tiền, nhưng không sửa đường đi chung khi chưa có bằng chứng không va chạm. Không tạo ứng dụng hay WebGL renderer mới.

## Sảnh và mặt tiền

- Mái vòm kính nhẹ, cửa đồng bộ, bảng `MATHVERSE DISCOVERY` đặt cao, hai biển sáng `A • Địa cầu Toán học` và `B • Triển lãm Hình học thực tế`.
- Phong cách thống nhất teal + xanh hải quân + vàng cát; vách đá sáng, vật liệu không phản chiếu quá nhiều. Đèn rọi tập trung, không dày đặc neon.
- Giữ chính xác **hai cửa phòng**, có dấu mũi tên dẫn đường, điều khiển `E` và click rõ ràng, lối trở về sảnh chung.

## Phòng A: địa cầu, địa danh, hình học

- **Không thay quả địa cầu hiện tại:** giữ một tâm địa cầu, chỉnh ceiling/camera/đèn để không che; ghim có tên gọn, lọc châu lục/quốc gia/lớp.
- Gắn thêm 32 mốc từ R95 vào R93/R94, dùng tọa độ có cờ cần rà soát. Không mất điểm cũ, không ghi đè ID.
- Ở góc trái đặt màn hình tìm kiếm như kiosk; bấm marker hoặc tìm tên sẽ hiện panel `Tên–Quốc gia–Nguồn–Ảnh thật–Toán học 2D–Xem 3D (nếu có)`.
- Panel 42% ảnh (chỉ ảnh thật đã cấp phép), 58% SVG/GLB; trên di động dùng tab. Tùy trạng thái hiện `ĐANG THẨM ĐỊNH` và **không dùng AI tạo ảnh giả làm ảnh chụp thực tế**.
- Khi không có GLB hợp lệ, hiển thị SVG chuẩn với nhãn `MÔ HÌNH TOÁN HỌC LÝ TƯỞNG HÓA`, không biến mọi công trình thành hình hộp/chóp chung.

## Phòng B: 6 bộ sưu tập tranh mới

- **Một phòng B** nhưng dùng **tối đa 8 khung tranh 3D vật lí** ở mọi thời điểm. Chọn bộ sưu tập thì thay texture, nhãn và nội dung tương tác của cùng khung, không dựng thêm 36 khung cùng lúc.
- Bộ sưu tập: Hình phẳng quanh em, Khối hình đời thường, Đối xứng và hoa văn, Số học và tập hợp, Đo lường và tỉ lệ, Thống kê và xác suất. Bộ tranh cũ R93/R94 đặt trong nhóm `Bộ sưu tập trước đây`.
- Tranh thật nếu đã duyệt quyền; các tranh còn lại dùng SVG riêng của R95 **kèm nhãn minh họa**, không gọi là ảnh thực tế.
- Bấm tranh/E → bảng đối chiếu: ảnh thật (nếu có), sơ đồ hình học 2D chuẩn, công thức LaTeX và mô hình 3D theo chủ đề (tùy loại).
- Khung theo hàng ngang, cao ngang tầm mắt nhân vật, gắn đèn ray rọi, vật liệu khung vàng cát, biển tên dưới tranh có độ tương phản. Không xoay bản 2D cho giống mặt phẳng 3D sai định hướng.

## Giao diện và hiệu năng

- Màu: navy `#091b2d`, teal `#2dcab8`, vàng `#d9b471`, chữ `#edf5f8`.
- Tìm kiếm không dấu; bộ lọc ghim; nút reset camera, chuyển 2D/3D, xem nguồn ảnh, quay lại.
- Mobile có nút thao tác tối thiểu 44px; panel không che avatar và không bị cắt ở 1366×768.
- Chỉ tải hình hiện thời, lazy-load ảnh, tối đa 8 textures tranh; luôn `dispose()` texture/material/geometry GLB không dùng nữa. Kiểm tra renderer.info trong 20 lượt đổi tranh.
- Khi ghim chồng nhau ở châu Âu, hiển thị danh sách chọn song song, có thể cluster marker tùy mức zoom.

## Chỉnh sửa mã chỉ sau backup trong Agent Antigravity

- `dual/discovery-data.mjs`: import/merge theo ID từ R95; R94 nếu đã cài vẫn tồn tại.
- `dual/discovery-world.mjs`: ánh sáng, trần, khung tranh tái sử dụng, marker lọc, kiểm tra raycast, giới hạn NPC/collision.
- `dual/discovery-shapes.mjs`: nạp SVG/GLB và bảo toàn API cũ; chỉnh geometry chỉ khi đã kiểm chứng.
- `dual/discovery-ui.mjs`, `dual/discovery.css`: kiosk, viewer, danh sách, 6 nhóm và quy trình xem nguồn.
- `dual/index.html`, `dual/app.mjs`: kiểm tra đã có nút `Truy cập nhanh Discovery` trong Museum; nếu có chỉ nối lại chức năng, không nhân bản nút.
- **Tuyệt đối không sửa** các thư mục dữ liệu SGK, quiz, Museum infographic, Game Park, Lab do R95.
