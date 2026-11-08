# MATHVERSE R105 — sửa trực tiếp từ ZIP R104 cô vừa cung cấp

Bản này được tạo bằng cách **sao nguyên dự án R104 trong ZIP tải lên**, bổ sung công cụ kiểm định/tải nguồn Sketchfab qua Download API chính thức, prompt Antigravity và mã ghi công mô hình. Không thay app bằng bản demo hoặc viết lại R100 UI.

**Điều đã làm trong ZIP:** tạo pipeline Node.js độc lập (không bắt cô cài Python), danh mục nguồn 9 bục, cảnh báo license/OAuth, manifest GLB, prompt triển khai đầy đủ, menu BAT thống nhất, kiểm thử và tài liệu hướng dẫn. Dữ liệu Parthenon GLB giữ nguyên SHA256.

**Điều CHƯA làm:** tải thêm 9 GLB từ Sketchfab, vì tài khoản và quyền Download API phải được xác thực chính thức. Để Antigravity thực thi các bước này trên máy cô, chọn `3` tại `00_MO_MATHVERSE_R105.bat` rồi dán prompt vào Agent. Nếu nguồn có giấy phép chỉ cho nhúng, Agent phải tìm nguồn khác hợp lệ, tuyệt đối không tuyên bố đã tạo GLB thật từ iframe.

**Khởi chạy:** nhấp đúp `00_MO_MATHVERSE_R105.bat` → chọn `1`. Để kiểm tra trạng thái GLB hiện có: chọn `2`.

**Nguồn chính thức:**
- https://sketchfab.com/developers/download-api/downloading-models
- https://sketchfab.com/developers/download-api/guidelines
- https://sketchfab.com/developers/oauth
- https://threejs.org/docs/pages/GLTFLoader.html
