# KIỂM THỬ VÀ NGHIỆM THU MATHVERSE DISCOVERY R95

1. Lập baseline backup và bảng SHA-256 tệp R93/R94 đang dùng; kiểm tra đầy đủ dữ liệu SGK Toán 6–12, Lab, Museum, Game Park.
2. Thêm 32 địa danh R95 theo ID và 36 chủ đề R95; xác nhận không trùng, không giảm số lượng R93/R94. Những mục chưa có ảnh được phép vẫn hiện hình vector có nhãn.
3. Mỗi marker chỉ đúng vị trí quốc gia/bán cầu, tìm kiếm tên không dấu hoạt động; kiểm tra Europe, Vietnam, Australia, Mexico, Brazil, New Zealand.
4. Trong phòng B, đổi 6 bộ sưu tập và bộ cũ: luôn tối đa 8 khung vật lí; tranh, nhãn, texture/click đều chuyển đúng.
5. Bấm `E` và chuột ở mỗi khu; tab Ảnh/2D/3D chỉ hoạt động khi đủ nội dung; không mở GLB khác nội dung.
6. Vật mẫu Atomium 9 quả cầu–20 thanh; Chichén 9 bậc; Borobudur 5 nền vuông–3 nền tròn; Parthenon 8×17 cột; Petronas hình sao từ hai hình vuông. Chỉ ghi là **nguyên lí hình học**.
7. Test WebGL ở 1366×768, 1920×1080, một màn hình nhỏ; trần không che địa cầu, camera không xuyên tường; hình 2D có nhãn đúng, không che chữ.
8. 20 vòng mở/đóng viewer; đối chiếu memory/texture qua `renderer.info`, không tích lũy không kiểm soát.
9. Không tạo thêm nút trùng tại Truy cập nhanh Bảo tàng; quay lại đúng lớp/bài/camera của Museum.
10. Chụp ảnh QA: Campus, Museum HUD, Sảnh Discovery, Phòng A, Atomium, Borobudur, Phòng B sáu chủ đề, một tranh so sánh ảnh/2D/3D.
11. Xuất diff có đường dẫn chỉnh, SHA-256 trước/sau, log test; phân biệt lỗi di sản V10 đã cũ với regression mới.
12. Chỉ khi Agent đã thực tế cập nhật trên máy cô mới được ghi nhận “đã tích hợp”. ZIP R95 này là **bộ tài nguyên và prompt** chưa đụng vào app.
