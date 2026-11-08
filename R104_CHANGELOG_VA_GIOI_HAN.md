# MATHVERSE R104 — GLB FIRST ON PODIUM

## Vì sao R103 mất mô hình trên bục?

Mã nguồn R103 ở `dual/discovery-r102/exhibition-room.mjs` đã bỏ nhóm hình học Three.js khỏi bục và thay bằng `R103_PROXIMITY_PROMPT` + iframe Sketchfab nổi theo tọa độ màn hình. Iframe là trình xem khác, không nằm trong Scene Graph Three.js; do đó không thể có trải nghiệm vật thể nằm thật trên bệ giống Parthenon.

## Đã sửa trong R104

1. **9/9 bục đang hoạt động đều có mesh Three.js** dựng trực tiếp từ module hình học có nguồn riêng. Khi có GLB kiến trúc được phép sử dụng, GLB thay toàn bộ hình học minh họa, được căn chỉnh tâm và chiều cao trên bệ giống cách nạp Parthenon ở R98.
2. **Không còn iframe nổi mặc định trên bục**. Chuột có thể kéo xoay vật thể Three.js. Nhấn `E` hay bấm vào biển tên để mở hồ sơ ảnh thật, tiểu sử, Sketchfab, hình học 3D, hình 2D.
3. Mô hình **Colosseum** được cải tiến: ba tầng tường dạng cung elip có cửa vòm 3D thay cho các cột rời trước đây. **Vẫn chỉ là mô hình hình học minh họa**, không phải bản quét di tích.
4. Thêm nút `⬆ ĐẶT GLB LÊN BỤC` trong hồ sơ mở từ phòng UNESCO: nạp nhanh GLB có phép vào bệ trong phiên hiện tại.
5. Thêm `00_NAP_GLB_VAO_BUC_R104.bat` để cài GLB bền vững: chọn bục, tệp GLB, tác giả, giấy phép, URL nguồn, xác nhận quyền và lưu SHA256. Máy sẽ tự tải GLB sau khi mở lại ứng dụng.
6. **Giữ nguyên tệp Parthenon GLB**, phòng tranh, Lab Toán, Công viên, địa cầu, bản đồ và 18 điểm truy vấn.

## GIỚI HẠN quan trọng (không đánh tráo chức năng)

- ZIP R104 **không chứa sẵn 9 bản sao GLB từ Sketchfab**. Không có quyền đăng nhập Sketchfab của cô và không thể tự lấy các tệp 3D chỉ từ iframe nhúng.
- Nền tảng Sketchfab cung cấp Download API yêu cầu đăng nhập người dùng, tải mô hình khi được tác giả cho phép: https://sketchfab.com/developers/download-api
- Mô hình GLB bên bệ chưa có file gốc đang là **hình học minh họa thật trong Three.js**, không phải quang trắc/LiDAR.
- Khi có tệp gốc hợp pháp và giáo viên xác nhận giấy phép, trình quản lý nạp GLB sẽ dùng lưới và texture thật. Cần kiểm tra từng quyền sử dụng trước khi phân phối bản mới cho người khác.
- Không thể đảm bảo chất lượng photogrammetry tự động bằng giả lập low-poly; để có độ trung thực như Parthenon, cần chính file GLB quang trắc phù hợp.

## Nguồn đã tra cứu

- Sketchfab Download API: https://sketchfab.com/developers/download-api
- Sketchfab Colosseum mắt quang trắc mắtCloud CC BY: https://sketchfab.com/3d-models/romes-colosseum-4577eb4b21ac48ecba43e7944b4e1baf
- Sketchfab Great Pyramid of Giza CC BY: https://sketchfab.com/3d-models/the-great-pyramid-of-giza-4a251113722f4d969b6cf2ca5f35c502
- 3D Warehouse Temple of Artemis (điều khoản phải kiểm tra trước khi tải): https://embed-3dwarehouse-classic.sketchup.com/model/ucc572317-55c0-42c8-80b0-eacc7c77e519/Temple-of-Artemis-Ephesus
- Three.js GLTFLoader: https://threejs.org/docs/pages/GLTFLoader.html
