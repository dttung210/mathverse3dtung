# MATHVERSE R105 – HƯỚNG DẪN NHANH CHO GIÁO VIÊN

## Dùng ngay, không cần lập trình

1. Giải nén ZIP R105 vào **một thư mục mới**, không ghi đè R104 đang hoạt động.
2. Nhấp đúp file duy nhất ở thư mục gốc: `00_MO_MATHVERSE_R105.bat`.
3. Trong menu chọn `1` để chạy ứng dụng; chọn `2` để kiểm tra 9 nguồn Sketchfab và trạng thái GLB; chọn `3` để mở/sao chép prompt Antigravity.
4. Mở Antigravity IDE trong chính thư mục này, dán prompt R105 vào khung Agent. Agent đã có chương trình để tự khảo sát nguồn, tải hợp lệ qua OAuth chính thức, chuyển glTF thành GLB và đăng ký mô hình lên bục. Cô không cần viết mã.
5. **Chỉ khi Sketchfab yêu cầu đăng nhập/ủy quyền chính thức**, cô mới xác thực trong trình duyệt. **Không gửi mật khẩu/token vào hội thoại.**
6. Agent phải cho cô xem ảnh kết quả GLB thật đặt lên bục và báo nguồn nào chưa có quyền tải.

## Hiện trạng của ZIP R105 này

- **Có sẵn:** mã nguồn nguyên bản R104; Parthenon GLB thật R98; 9 mô hình minh họa hình học trên các bục; 18 điểm địa cầu/bản đồ; hồ sơ ảnh/Sketchfab; chương trình nạp GLB có phép; prompt và workflow R105.
- **Chưa có sẵn:** 9 file GLB từ Sketchfab trên các bục còn lại. Chúng cần được Agent tải qua tài khoản có quyền tải và kiểm tra chất lượng, giấy phép. Các đường dẫn trong danh mục là **nguồn ứng viên**, không phải file đã tải.
- Nếu giáo viên muốn thử lại app trước khi tích hợp GLB: chọn `1`, ứng dụng hoạt động như R104, không cần OAuth để xem Lab/Museum/địa cầu.

## Tệp quan trọng

- `R105_AGENT/PROMPT_ANTIGRAVITY_R105.md`: câu lệnh gửi Antigravity.
- `R105_AGENT/DANH_MUC_NGUON_9_BUC.md`: 9 công trình và nguồn Sketchfab hiện có trong R104.
- `R105_AGENT/BAO_CAO_TRANG_THAI.json`: trạng thái GLB thật hiện tại.
- `tools/r105-sketchfab-pipeline.mjs`: quy trình download chính thức → giải nén an toàn → glTF/GLB → nhập manifest.
- `dual/discovery-r103/assets/approved-local-models.json`: bảng GLB có phép được ứng dụng nạp khi chạy.

**Không thể có GLB gốc chỉ bằng cách nhúng iframe.** Mô hình có giấy phép và nguồn tải mới có thể nằm thật trong Three.js giống Parthenon.
