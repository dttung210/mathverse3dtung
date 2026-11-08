# ANTIGRAVITY AGENT PROMPT — MATHVERSE DISCOVERY R102 · 3 KHU KIẾN TRÚC 3D + ĐỊA CẦU/BẢN ĐỒ

**VAI TRÒ**: Lead Engineer Three.js/WebGL, 3D Heritage Curation, GIS, giáo viên Toán THCS/THPT và QA sản phẩm. Người dùng không biết lập trình. Bạn PHẢI làm trong dự án MATHVERSE R102 đang mở tại Antigravity IDE; không tạo app riêng, không thay toàn bộ UI.

## A. Đọc dự án và sao lưu

1. Đọc `R102_AGENT/00_HUONG_DAN_CAI_DAT_R102.md`, `R102_AGENT/BAO_CAO_QA_R102.md`, `dual/discovery-r102/catalog.mjs`, `geometry-models.mjs`, `geometry-2d.mjs`, `geometry-viewer.mjs`, `exhibition-room.mjs`, `dual/discovery-r100/wonders-ui.mjs`, `wonders.css`, `dual/discovery-r97/world-map-ui.mjs`, `dual/app.mjs`, `dual/discovery-r98/fidelity-world.mjs` và `server/host.mjs`.
2. Sao lưu toàn bộ dự án và kiểm tra hash GLB `dual/discovery-r98/assets/unesco_parthenon_glb.glb`; không xóa/đổi file gốc hoặc thay bằng mô hình sơ sài. Giữ Lab Toán 6–12, Museum, Công viên, Game, phòng tranh và dữ liệu địa cầu/bản đồ gốc.
3. Không tự ý khôi phục phòng kỳ quan thiên nhiên R99. Dự án R102 đang dùng **7 kỳ quan cổ đại + 7 kỳ quan mới 2007 + 4 kiến trúc khác**, không phải danh sách kỳ quan thiên nhiên.

## B. Nguyên tắc tách biệt CHÍNH XÁC

**Địa cầu + bản đồ phẳng**: 18 điểm có nguồn, ba màu khác nhau:
- CAM = 7 kỳ quan cổ đại.
- VÀNG = 7 kỳ quan mới New7Wonders 2007.
- ĐỎ = 4 kiến trúc ứng dụng hình học.

Bấm vào bất kỳ điểm nào PHẢI mở cùng hồ sơ **ảnh thực tế đúng địa điểm + tiểu sử + mô hình Sketchfab** ngay trong ứng dụng. Không hiển thị tab mô hình giáo dục hoặc nút chuyển qua phòng UNESCO ở hai chế độ này. Nếu mô hình Sketchfab không tải do mạng/giấy phép thì báo lỗi thật, không thay bằng mô hình sai tên.

**Phòng UNESCO 3D**: chỉ các mẫu có thể chuyển sang hình học 3D/2D **có giải thích toán học đúng**. Phòng chia ba khu theo ba tường:
- **Khu 1 – Di sản Thế giới UNESCO**: Kim tự tháp Giza (hình chóp tứ giác đều), di tích Artemis/Ephesus (hệ cột/hộp, phục dựng giáo dục) và Parthenon GLB quang trắc R98 **phải giữ nguyên**. Tên khu là Di sản Thế giới UNESCO, **không khẳng định UNESCO bình chọn 7 kỳ quan thế giới**.
- **Khu 2 – New7Wonders 2007**: Colosseum (elip và vòm), El Castillo/Chichén Itzá (khối bậc), Taj Mahal (khối đối xứng, mái vòm và tháp góc). Những công trình này đồng thời là di sản UNESCO riêng, nhưng được phân vào khu 2 để tránh lặp bục.
- **Khu 3 – Kiến trúc hình học khác**: Petronas (hai tháp và skybridge), Louvre (chóp tứ giác kính), Golden Gate (cáp parabol **xấp xỉ**, khi tải gần đều theo mặt cầu), Gateway Arch (catenary / dây xích ngược **KHÔNG phải parabol**).

Chỉ làm 9 bệ mô hình hình học giáo dục + 1 bệ Parthenon GLB quang trắc (tổng 10 bệ). Các kỳ quan còn lại vẫn được thể hiện **trên địa cầu và bản đồ**, không bịa kiến trúc để lấp phòng.

## C. Hình 3D PHẢI NẰM TRÊN BỤC (không chỉ ảnh)

R102 đã có mô hình Three.js thật trong `dual/discovery-r102/geometry-models.mjs`. Mỗi bệ có sàn đế tròn, viền, mô hình ba chiều có thể xem từ mọi phía, biển tên phía trước và ảnh tư liệu phía sau — như bố cục Parthenon R98. Đây là **mô hình hình học được lý tưởng hóa**; nếu muốn độ trung thực kiến trúc cao hơn, tìm bản quét photogrammetry/LiDAR GLB được chủ sở hữu cho phép tải và xác nhận giấy phép từng mô hình.

- Ưu tiên Sketchfab có tệp tải được (CC BY/CC0 phù hợp), OpenHeritage3D, CyArk và kho di sản chính thức. Sketchfab muốn tải model phải dùng OAuth Download API của tài khoản hợp lệ; **không được bypass hay scrape**.
- Mô hình GLB có giấy phép chỉ được thêm sau khi kiểm tra cấu trúc với Khronos glTF-Validator, texture đầy đủ, đúng địa danh, không có lỗi ba chiều, đủ thông tin nguồn và chính xác đến mức mô hình cung cấp. Không thay tệp Parthenon đã duyệt.
- Nếu không có quyền tải hoặc không có scan, giữ mô hình Three.js có nhãn **HÌNH HỌC GIÁO DỤC (KHÔNG PHẢI QUÉT 3D)**. Không tuyên bố đã chuyển ảnh đơn thành mô hình kiến trúc đo đạc chính xác.
- Bố trí các bục áp sát **BA BỨC TƯỜNG** nhưng vẫn có lối đi rộng ở giữa; khung phòng R102 đã nâng từ 44×44 lên 72×60 đơn vị, cần kiểm tra ranh giới thật và tầm camera.
- Chỉ tải ảnh tư liệu cho phòng khi người dùng thực sự bước vào khu đó; không làm chậm tải Lab và Museum.

## D. Dùng giao diện R100 hiện có, không thiết kế lại

- GIỮ các class `.r100-window`, `.r100-top`, `.r100-tools`, `.r100-body`, `.r100-list`, `.r100-details`, `.r100-media-grid`, `.r100-viewer` và bố cục 2 cột màu xanh đậm.
- Khi bấm bệ/nhấn E: modal có ảnh thật + tiểu sử + Sketchfab + tab **Hình học 3D** để xoay mô hình dựng bằng Three.js và tab **Hình 2D** để xem SVG mặt đứng/hình chiếu, công thức được viết theo LaTeX và có nút sao chép.
- Khi bấm điểm **địa cầu/bản đồ**, ẩn nút chuyển vào phòng UNESCO và ẩn cả tab Hình học 3D/2D; chỉ ảnh thật, tiểu sử, Sketchfab.
- Khóa sự kiện WASD/chuột của thế giới khi modal mở. Giải phóng GPU/canvas khi đóng; tránh thêm quá nhiều WebGLRenderer cùng lúc.
- Không để CSS khác class HTML như lỗi R101. Không đổi bố cục R100 bằng form thô. Kiểm tra responsive ở 1366×768 và 1920×1080.

## E. BẢO VỆ HỌC SINH – ảnh tượng phù hợp

- Tượng Zeus cổ đại: dùng ảnh địa điểm khảo cổ Olympia ngày nay và mô hình 3D thánh địa Olympia (KHÔNG phải tượng Zeus cổ đã mất).
- Colossus Rhodes: dùng ảnh thành phố Rhodes hiện nay và Sketchfab tham quan di tích Lindos trên cùng đảo Rhodes (KHÔNG phải tượng Colossus). Đây là hai địa điểm khác nhau và phải ghi rõ.
- Không tự nhúng lại các mô hình tượng nam khỏa thân chưa được giáo viên duyệt; không dùng ảnh AI giả làm ảnh thật.
- Với mọi kỳ quan mất tích, ghi rõ có tranh luận hoặc phục dựng giả định, không gọi là quét khảo cổ chính xác.

## F. KIỂM THỬ/NGHIỆM THU BẮT BUỘC

1. Chạy `npm run test:r102`; không sửa test chỉ để làm số PASS đẹp. Duyệt script `node --check` toàn bộ mô-đun thay đổi.
2. Mở server `node server/host.mjs` trên Windows và kiểm tra thực tế các route: `/`, `/dual/discovery-r102/catalog.mjs`, `/dual/discovery-r102/geometry-models.mjs`, `/dual/discovery-r100/wonders-ui.mjs` và GLB R98.
3. Chụp screenshot WebGL thật 1366×768, 1920×1080: phòng ba khu + 10 bệ, Parthenon, Giza, Colosseum, Taj, Golden Gate, Gateway Arch; bấm mô hình, kiểm tra tab Sketchfab/3D/2D, tài liệu hình học, ảnh; lối đi/camera không xuyên tường.
4. Kiểm tra địa cầu có 18 điểm, bản đồ có 18 điểm với màu hợp lý; bấm chấm tự hiện ảnh/tóm tắt/Sketchfab, không có nút từ bản đồ/địa cầu sang phòng UNESCO.
5. Kiểm tra không còn ảnh khỏa thân gây phản cảm trong tài liệu học sinh mặc định; nguồn Olympia/Rhodes phải nói chính xác KHÔNG phải tượng Zeus/Colossus.
6. Khôi phục QA toàn hệ thống: Labs lớp 6–12, 310 mô hình, game, Museum/ảnh và công viên còn hoạt động. Không sửa những tính năng cô không yêu cầu.
7. Chỉ tuyên bố nghiệm thu screenshot khi đã có ảnh chụp và bản kiểm tra WebGL; nếu không dùng được Chrome headless thì báo lỗi điều kiện môi trường rõ ràng.
8. Xuất ZIP đầy đủ + manifest SHA256 + tài liệu cập nhật, giữ lịch sử các file cũ dưới thư mục lưu trữ để có thể rollback, chỉ **một BAT chính** cho người dùng không biết lập trình.

## G. NGUỒN CHÍNH THỨC THAM KHẢO

- UNESCO: https://whc.unesco.org/
- New7Wonders (không phải chương trình UNESCO): https://world.new7wonders.com/
- Golden Gate Bridge bài học parabol từ Golden Gate Bridge Highway & Transportation District: https://www.goldengate.org/bridge/history-research/educational-resources/school-projects/
- Gateway Arch là catenary theo U.S. National Park Service: https://www.nps.gov/jeff/planyourvisit/materials-and-techniques.htm
- Sketchfab: https://sketchfab.com/developers/viewer ; Download API đòi xác thực: https://sketchfab.com/developers/download-api/downloading-models

**HÃY THỰC THI TRONG DỰ ÁN ĐANG MỞ, KHÔNG HỎI CÔ CÓ BIẾT LẬP TRÌNH HAY KHÔNG. Giữ giao diện R100; cải thiện độ chân thực nhưng không bịa dựng scans/giấy phép; kiểm tra kỹ trước khi phát hành.**
