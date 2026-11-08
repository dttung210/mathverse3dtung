# MATHVERSE R100 — ANTIGRAVITY IDE AGENT — CẬP NHẬT DỰ ÁN GỐC

Bạn là nhóm kỹ sư Three.js/WebGL, sử học di sản, GIS và QA giáo dục. Cô giáo không biết lập trình. Hãy thực thi trực tiếp trong thư mục đang mở, không viết bản demo rời, không chỉ nêu kế hoạch.

## 0. DỰ ÁN ĐÃ ĐƯỢC TÍCH HỢP TỪ ZIP R99
- Bản R100 đã bổ sung **14 kỳ quan kiến trúc** (7 cổ đại + 7 kỳ quan mới công bố 07/07/2007) từ nguồn dữ liệu `/dual/discovery-r100/wonders-data.mjs` và `wonders-14-catalog.json`.
- Phòng UNESCO sử dụng `/dual/discovery-r100/wonders-world.mjs` để bố trí **hai dãy 7 bục** có tương tác và GIỮ NGUYÊN GLB Parthenon quang trắc ở giữa.
- Bấm E hoặc click bục mở `/dual/discovery-r100/wonders-ui.mjs`: 3D Sketchfab được nhúng ngay trong MATHVERSE; 1 iframe duy nhất tải theo yêu cầu, ảnh đối chiếu nguồn Wikipedia/Wikimedia chỉ tải khi có mạng.
- Bản đồ phẳng và địa cầu có chấm tọa độ cho 14 kỳ quan. Chấm đại diện không đồng nghĩa vị trí khảo cổ chính xác tuyệt đối.
- Không sử dụng phòng **14 kỳ quan thiên nhiên R99** trong runtime; dữ liệu cũ vẫn lưu trong ZIP để có thể hoàn tác.
- Dữ liệu danh mục UNESCO R98 được bảo toàn; tệp GLB Parthenon không được xóa/biến đổi.

## 1. NGUYÊN TẮC BẮT BUỘC
1. Đọc README, `AGENTS.md`, `00_HUONG_DAN_R100_CHO_CO.md`, `R100_BAO_CAO_KIEM_THU.md` và mã nguồn thực trước khi sửa.
2. Sao lưu bằng ZIP/copy nguyên vẹn trước khi chỉnh bất cứ tệp nào; KHÔNG viết đè không có khả năng rollback.
3. Chỉ sửa phần Discovery R100 và các điểm nối cần thiết; bảo toàn Museum, LAB Toán 6–12, 11 trò chơi, 310 mô hình nguồn, giao diện học sinh, công viên và cổng.
4. Không tự thêm 14 kỳ quan thiên nhiên. Đúng 14 kỳ quan KIẾN TRÚC như danh mục R100.
5. Kỳ quan cổ đại đã mất phải ghi nhãn **PHỤC DỰNG GIẢ ĐỊNH**, đặc biệt Vườn treo Babylon (còn tranh luận tồn tại/vị trí), tượng Zeus, Colossus, hải đăng Alexandria. KHÔNG gán model 3D của nghệ sĩ thành bản quét khảo cổ.
6. New7Wonders 2007 là bình chọn tư nhân độc lập; UNESCO chỉ công nhận di sản riêng theo WHC. Không ghi UNESCO đã chọn ra 7 kỳ quan mới.
7. Không tải, chuyển mã, nhúng trực tiếp các model Sketchfab bên ngoài khi giấy phép không cho phép. Chỉ nhúng viewer chính thức; nếu cần file GLB thì xác minh quyền tải và giấy phép TỪNG ASSET.

## 2. KIỂM TRA VÀ NÂNG CẤP 14 BỤC
- Mở `dual/discovery-r100/wonders-world.mjs` và kiểm tra 14 bục vật lý nằm trong **PHÒNG UNESCO 3D HIỆN CÓ**, không phải thêm phòng thiên nhiên riêng.
- Mỗi bục có biển tên tiếng Việt, nhãn cổ đại/mới 2007, poster lấy đúng ảnh nguồn hoặc thumbnail Sketchfab khi có mạng; nếu ảnh lỗi, dùng khung trống có ghi chú chứ không tự sinh giả.
- Kiểm tra WASD, E, camera, raycast, va chạm, bố cục 1366×768 và 1920×1080; tránh clipping sàn, tường, poster/GLB chồng nhau.
- GLB quang trắc Parthenon ở khu trung tâm phải vẫn hiển thị và còn mở modal R98 như trước; giữ nguồn, ảnh, băm SHA256 và lịch sử phê duyệt.
- Không tải 14 iframe cùng lúc. Click/E một bục chỉ tải 1 Sketchfab viewer, thoát phải giải phóng `iframe.src`.
- Nâng cấp ảnh và nhãn từ nguồn với metadata tác giả/giấy phép đã xác thực. Mọi ảnh thời cổ đại đã mất phải ghi rõ 'di tích hoặc minh họa phục dựng'.

## 3. ĐỊA CẦU VÀ BẢN ĐỒ THẾ GIỚI
- Đọc danh mục `/dual/discovery-r100/wonders-14-catalog.json`, tạo chính xác 14 pin trên địa cầu và 14 pin trên bản đồ phẳng 3D. Giữ pin UNESCO có GLB được duyệt.
- Tọa độ Vạn Lý Trường Thành là đoạn Mutianyu, Petra là Al-Khazneh, Chichen là El Castillo; Colossus/Babylon không có vị trí khảo cổ chắc chắn nên gắn chú thích 'điểm đại diện'.
- Bản đồ dùng Natural Earth/UNESCO như hiện tại. Giữ chế độ offline bản đồ cũ, tùy chọn tải bản đồ chi tiết khi có mạng.
- Chọn pin trên địa cầu hoặc bản đồ mở ĐÚNG trang hồ sơ kỳ quan và viewer Sketchfab; tìm kiếm theo tên/quốc gia, lọc cổ đại/mới.
- Không để chương trình phụ thuộc duy nhất vào danh mục GLB R98. Tọa độ kỳ quan R100 phải xuất hiện ngay cả khi GLB tải về chưa có; đừng xóa danh sách 14 bục.

## 4. DỮ LIỆU MÔ HÌNH 3D & THUYẾT MINH
- Kiểm tra 14 trang Sketchfab gốc lưu trong `wonders-data.mjs`, xác minh người đăng, tên mô hình, quyền nhúng, trạng thái hoạt động và mức độ trung thực.
- Ưu tiên model quang trắc/các viện nghiên cứu: Petra (Global Digital Heritage), Chichen (CyArk), Cristo Redentor (Pix4D), Colosseum (eyesCloud3D). Với cổ đại đã mất, dùng mô hình nghệ thuật có ghi rõ phục dựng.
- Ghi tóm tắt kiến thức: lịch sử, niên đại, địa lý, cấu tạo, tính chất Toán học được minh họa; kiểm chứng nguồn lịch sử/UNESCO cho từng điểm. Không bịa chiều cao hoặc sai số.
- Với công trình có thể mua/tải GLB hợp pháp và cô đã được cấp quyền, có thể bổ sung chức năng nạp GLB cục bộ chất lượng cao qua bộ kiểm duyệt R98; KHÔNG thay mô hình đã duyệt bằng hình khối đơn giản.

## 5. KIỂM THỬ ĐỘC LẬP
Chạy từ thư mục gốc:
- `node --check dual/app.mjs`
- `node --check dual/discovery-r100/wonders-world.mjs`
- `node --check dual/discovery-r100/wonders-ui.mjs`
- `npm run test:r100`
- `node --test tests/r98-fidelity-curation.test.mjs tests/r97-discovery-world-map.test.mjs tests/r96-unesco-discovery.test.mjs`
- `NO_BROWSER=1 node server/host.mjs` (PowerShell: `$env:NO_BROWSER='1'; node server/host.mjs`) kiểm tra /, /dual/discovery-r100/wonders-data.mjs, /dual/discovery-r98/assets/unesco_parthenon_glb.glb, API catalog.
- Dùng Chromium thật trên máy cô để chụp: sảnh địa cầu, bản đồ phẳng, phòng UNESCO có 14 bục, modal Sketchfab, Parthenon GLB. Kiểm tra 2 độ phân giải và hai cách điều khiển.
- Mô hình Sketchfab không load do Internet/quyền nhúng thì ghi rõ lỗi nguồn, KHÔNG tạo mô hình thay thế giả.
- Chỉ ghi 'đã kiểm thử WebGL' nếu có log chụp hình thật. Không tự tuyên bố đã đạt khi chưa chạy.

## 6. KẾT QUẢ CẦN XUẤT
1. `MATHVERSE_R100_VERIFIED_FULL.zip` — toàn bộ app đã cập nhật, không chỉ patch, giữ đúng cấu trúc gốc.
2. `MATHVERSE_R100_PATCH.zip` và hướng dẫn rollback.
3. `R100_BEFORE_AFTER/` gồm ảnh chụp thật nếu trình duyệt hoạt động; sơ đồ minh họa phải ghi rõ không phải ảnh chụp.
4. `R100_BAO_CAO_NGHIEM_THU.md` — kiểm thử đạt/chưa đạt, bao nhiêu Sketchfab thực tế chạy, nguồn bị lỗi nào; kiểm tra nguyên trạng tệp R98 Parthenon.
5. `00_CHAY_MATHVERSE_R100.bat`, `00_XEM_TRUOC_SAU_R100.bat`, `00_COP_PROMPT_ANTIGRAVITY_R100.bat`, hướng dẫn cho cô.

Hãy thực hiện thay đổi vào dự án hiện tại, không tạo demo riêng và không bắt cô phải lập trình.
