# BÁO CÁO KIỂM TRA MATHVERSE R103

Ngày: 07/11/2026. Dự án gốc: ZIP MATHVERSE R102 cô đã tải lên.

## ĐÃ KIỂM TRA
- 45/45 kiểm thử Node.js các mô-đun R95–R103 đạt; các phép kiểm tra R102 chuyển sang đúng tiêu chuẩn mới đã được cập nhật công khai.
- Mọi mô-đun JS R103 và các file nối app được `node --check` thành công.
- Máy chủ Node khởi động thành công, HTTP 200 tại `/`, `dual/app.mjs`, `podium-viewer.mjs`, `podium-logic.mjs`, CSS, manifest GLB và GLB Parthenon.
- GLB Parthenon giữ SHA-256 `e4b5091373259e067373630a3af4828c799e6cb3677dc2b28ac88c31b322562d`, giống bản R102.
- 14 kỳ quan cổ đại & mới 2007 và 4 kiến trúc khác vẫn nằm trong bản đồ/địa cầu; 9 bục chọn lọc + Parthenon trong phòng ba khu.
- Khôi phục đúng nguồn SKETCHFAB TƯỢNG Zeus WelsEvil, và TƯỢNG Rhodes RuslanOz. Ảnh Rhodes mới là ảnh cảnh quan Mandraki của Jebulon CC0 có dẫn nguồn.
- Hỗ trợ tải từ Sketchfab tự động khi đến gần bục, mỗi lúc tối đa một iframe, xử lý xoay/phóng to trong iframe; tab Toán học 2D/3D chỉ khi mở thông tin từ phòng.
- Hỗ trợ nạp GLB hợp pháp từ file picker (phiên hiện tại) và manifest các GLB được cấp phép (nếu giáo viên cung cấp).

## CHƯA KIỂM THỬ ĐƯỢC / GIỚI HẠN KỸ THUẬT
- Trình duyệt tự động Chromium bị môi trường chặn localhost (`ERR_BLOCKED_BY_ADMINISTRATOR`), vì vậy CHƯA có ảnh chụp thực tế mới trong Chrome/Edge.
- Chưa kiểm chứng được Sketchfab iframe thực sự cho phép autostart, xoay/phóng to ở tất cả 9 địa điểm trên máy cô; phụ thuộc Internet, cookie, quyền nhúng và gói tài khoản tác giả.
- Mặc định manifest `approved-local-models.json` **rỗng**: không có 9 GLB Sketchfab được phép tải về. **Không gọi iframe là bản GLB 3D của Three.js.**
- Iframe được chiếu theo vị trí mô hình trên bục trên màn hình; vì không phải THREE.Mesh, nó không có vật lý/occlusion cùng scene. Chỉ GLB được giáo viên cung cấp hợp pháp mới trở thành mesh bản địa được kéo xoay trực tiếp trên bục như Parthenon.
- Ảnh Rhodes dẫn đến Wikimedia Commons và cần mạng để hiển thị.
- Tượng Zeus và Colossus nguyên bản không còn: mô hình Sketchfab là phục dựng nghệ thuật, không thể kiểm định độ chính xác so với nguyên bản thất lạc.

## HƯỚNG DẪN QA TRÊN MÁY CÔ
1. Bấm `00_MO_MATHVERSE_R103.bat`, chọn 1.
2. Vào Discovery → phòng UNESCO 3D, đến gần Colosseum. Trình xem Sketchfab phải tự mở mà không phải bấm Play. Kéo để xoay, cuộn chuột để phóng to.
3. Bấm nút **XEM ẢNH · TIỂU SỬ · 3D/2D** rồi kiểm tra 3 tab.
4. Trên địa cầu/bản đồ, chọn Zeus và Rhodes. Ảnh Zeus là di tích Olympia; Sketchfab là tượng Zeus phục dựng. Ảnh Rhodes là cảng Mandraki, bên cạnh Sketchfab là tượng Colossus phục dựng.
5. Nếu có GLB hợp pháp, chọn `GLB CÓ PHÉP`, nạp file .glb, di chuột kéo ngay trên mô hình ở bục.
6. Trở về Parthenon: GLB quang trắc gốc vẫn có nguyên ảnh và tương tác.
7. Kiểm tra các phòng Lab, Museum, Park và chế độ trình chiếu cũ để chắc không lỗi hồi quy.
