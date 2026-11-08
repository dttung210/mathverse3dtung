# PROMPT ANTIGRAVITY IDE — MATHVERSE R103 · SKETCHFAB TRỰC TIẾP TRÊN BỤC

Bạn là kỹ sư Three.js/WebGL, GLB, Sketchfab Viewer API, bảo tồn di sản, cấp phép tài sản 3D và thiết kế bài giảng Toán THCS/THPT. Người dùng là giáo viên không biết lập trình. Bắt đầu thực hiện trực tiếp trên dự án đang mở. KHÔNG tạo ứng dụng khác, KHÔNG sửa lại giao diện R100 thành bố cục mới và KHÔNG trả lời lý thuyết thay cho việc triển khai.

## Nguồn hiện có

- R103 đã được tích hợp từ R102 tối ưu, giữ Labs 6–12, 310 mô hình, Info Museum, công viên, bản đồ, địa cầu, hồ sơ R98 Parthenon GLB.
- `dual/discovery-r102/exhibition-room.mjs`: phòng trưng bày ba khu, bục có cột, mặt đá, biển và ảnh, KHÔNG có mô hình hình học giả thay kiến trúc thật.
- `dual/discovery-r103/podium-logic.mjs`: URL Sketchfab và chọn bục gần nhất có hysteresis.
- `dual/discovery-r103/podium-viewer.mjs`: khi đến gần bục tự mở một viewer Sketchfab tương tác, bám theo hình chiếu của bục trong scene 3D; iframe không phải GLB scene mesh.
- `dual/discovery-r103/podium-viewer.css`: giao diện bộ xem tại bục.
- `dual/discovery-r103/assets/approved-local-models.json`: manifest mô hình GLB hợp pháp được tải về. Mặc định rỗng.
- `dual/discovery-r100/wonders-ui.mjs`: GIỮ NGUYÊN giao diện R100, ảnh trái, Sketchfab phải, 3D/2D chỉ hiện khi mở hồ sơ từ phòng.
- `dual/discovery-r102/catalog.mjs`: danh mục 14 kỳ quan + 4 kiến trúc và nguồn Sketchfab.
- `dual/discovery-r98/assets/unesco_parthenon_glb.glb`: bản quét Parthenon gốc đã duyệt, TUYỆT ĐỐI KHÔNG thay bằng hình giả.

## Yêu cầu 1 — 3D thật trên từng bục

**Quan trọng**: mô hình Sketchfab nhúng là iframe tương tác trong viewer của Sketchfab, KHÔNG thể tự ý lấy geometry bên trong iframe để thêm làm THREE.Mesh. Muốn mô hình thật hoạt động như Parthenon, phải có file glTF/GLB gốc được tải hợp pháp và được phép sử dụng/phân phối.

1. Duyệt từng Sketchfab URL trong `R102_CATALOG`, kiểm tra tác giả, giấy phép, cho phép nhúng và DOWNLOAD.
2. Với những model được tác giả cho phép tải, sử dụng Sketchfab Download API CHÍNH THỨC: https://sketchfab.com/developers/download-api ; người dùng phải đăng nhập OAuth của Sketchfab. Không bypass xác thực, không khai thác nội dung mô hình từ viewer/cache/API ngầm. Không trộn dữ liệu không có quyền tải vào ZIP phát hành.
3. Khi đã có GLB hợp pháp, lưu trong `dual/discovery-r103/assets/` và đăng ký manifest `approved-local-models.json` theo cấu trúc:
```json
{"version":"R103","models":[{"id":"wonder_colosseum","file":"wonder_colosseum.glb","author":"Tên tác giả","license":"Giấy phép xác minh"}]}
```
4. File GLB được khởi tạo bởi `scanLoader()`, tính kích thước bằng `Box3`, chuẩn hóa scale để mô hình nằm thật TRÊN bục Three.js, có thể rê chuột xoay trên mô hình. Kiểm tra hướng và chất lượng bề mặt (không biến thành vài vòng trụ).
5. Khi chưa có GLB hợp pháp, giữ chế độ Sketchfab nhúng trực tiếp khi học sinh đến gần bục, mở tự động (`autostart=1`), kéo xoay/phóng to ngay tại viewer phía trên bục, không tự mở modal. Trình duyệt cần Internet, một viewer hoạt động tại một thời điểm để đảm bảo hiệu năng. Có nút riêng 'XEM ẢNH · TIỂU SỬ · 3D/2D'.
6. Hiểu rõ hạn chế của iframe: có thể không trong suốt vì hạn chế gói chủ sở hữu, không có che khuất theo chiều sâu Three.js; tuyệt đối không báo đã tạo native GLB nếu chỉ là iframe. Cải tiến để khi có GLB hợp pháp thì ẩn iframe và hiển thị native THREE.Mesh ngay tại bục.
7. Bổ sung cơ chế 'Nạp GLB có phép' để giáo viên chọn file `.glb` hợp lệ, nạp trực tiếp ngay trong phiên hiện tại, không bắt cô viết code. Thông báo rõ phải đăng ký manifest nếu muốn tự tải ở những phiên sau.

## Yêu cầu 2 — Ảnh & mô hình đúng lịch sử

- **Zeus ở Olympia:** GIỮ mô hình của TƯỢNG Zeus của WelsEvil, UID `3ef14e973af8440c8fa34bfeee6da3e0`. Ảnh bên trái dùng hình thực tế tại khu Olympia, KHÔNG dùng mô hình toàn cảnh khu Olympia để giả là tượng. Tượng nguyên bản không còn: mô hình là phục dựng nghệ thuật, tuyệt đối không khẳng định 'đã quét chính xác tượng Zeus nguyên bản'.
- **Colossus of Rhodes:** giữ mô hình TƯỢNG của RuslanOz, UID `011ee3d4483448b4abac63969bcfc475`, KHÔNG thay bằng mô hình Acropolis Lindos. Chỉ thay ẢNH BÊN TRÁI bằng ảnh phong cảnh thực tế cảng Mandraki của Jebulon: https://commons.wikimedia.org/wiki/File:Mandraki_colosseus_harbour_rhodes.jpg (CC0 1.0). Chú thích vị trí tương truyền, chưa xác định được địa điểm tượng chính xác. Nếu ảnh mạng lỗi phải đưa thông báo, không dựng một bức tượng khác.
- Mọi ảnh/GLB đi kèm phải ghi tác giả, giấy phép, nguồn và phân biệt ảnh thực tế – ảnh tư liệu – hình phục dựng.

## Yêu cầu 3 — Bục, trải nghiệm học sinh và 3 khu

- Giữ 3 khu sát ba bức tường của phòng lớn 72×60: UNESCO (như Giza, Artemis + Parthenon quang trắc), New7Wonders 2007 (Colosseum, Chichén Itzá, Taj Mahal), kiến trúc khác (Petronas, Louvre, Golden Gate, Gateway Arch).
- Không hiện hình học low-poly vào chỗ mô hình hiện vật thật như Colosseum R102. Các mô hình lý tưởng hóa trong `geometry-models.mjs` chỉ nằm ở TAB 'HÌNH HỌC 3D', không thay thế GLB/Sketchfab tại bục.
- Địa cầu & bản đồ giữ đúng 18 điểm, 3 màu: cam cổ đại, vàng New7Wonders 2007, đỏ kiến trúc hình học khác. Chọn pin mở ảnh thật, thuyết minh, Sketchfab, KHÔNG có tab 3D/2D/đường dẫn chuyển vào phòng.
- Trong phòng, mô hình hiển thị tự động khi học sinh đến gần; kéo để xoay, cuộn để zoom, không phải bấm 'PLAY'. Khi nhấn E/bấm XEM CHI TIẾT thì mới xuất hiện ảnh, lịch sử và tab 'SKETCHFAB / HÌNH HỌC 3D / HÌNH 2D'.
- Không phá hỏng menu, HUD, danh sách, bàn phím WASD, góc quay, nhóm dự án.

## Yêu cầu 4 — QA có bằng chứng

1. Sao lưu trước khi chỉnh sửa; không đụng vào GLB Parthenon cũ.
2. Chạy `npm run test:r103`; sửa các test đang kiểm tra hành vi đã loại bỏ, chỉ khi mô tả kiểm thử mới phản ánh đúng yêu cầu cô.
3. Chạy máy chủ Node và kiểm tra GET `/`, `/dual/discovery-r103/podium-viewer.mjs`, `/dual/discovery-r103/assets/approved-local-models.json` và Parthenon GLB.
4. Kiểm thử thật trên máy cô trong Chrome/Edge có Internet: chụp 14 kỳ quan, hiện đúng ảnh Rhodes, mô hình Zeus, Colosseum Sketchfab trước bục, Parthenon GLB vẫn quay được, nút 'Nạp GLB có phép', map/globe và tab 2D/3D.
5. Kiểm tra tải chậm, iframe bị chặn, người dùng nhanh chóng đổi bục, người dùng đứng xa, đóng popup và giải phóng WebGL/iframe; chỉ có tối đa một iframe hoạt động trong phòng một thời điểm.
6. Phân biệt rõ trong báo cáo trạng thái: `native_glb_approved`, `sketchfab_embedded_only`, `geometry_educational`, `source_missing`.
7. Phát hành ZIP đầy đủ, ZIP patch, so sánh ảnh chụp máy thật và hướng dẫn cho giáo viên không biết lập trình. Không báo 'bản quét thật trên 9 bục' khi GLB chưa được cấp phép.

HÃY THỰC THI TRONG THƯ MỤC ANTIGRAVITY ĐANG MỞ. KHÔNG YÊU CẦU NGƯỜI DÙNG VIẾT MÃ.
