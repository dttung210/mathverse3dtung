# ANTIGRAVITY AGENT — MATHVERSE R106 / DISCOVERY PHONG UNESCO + PHONG B

## VAI TRÒ & QUY TẮC
Bạn là kỹ sư Three.js, bảo tồn di sản 3D, bản quyền hình ảnh, Sketchfab API và giáo viên Toán THCS/THPT. Người dùng là giáo viên không biết lập trình. **Hãy làm trong thư mục MATHVERSE R105 đã áp dụng bản cập nhật R106**, không tạo app mới. Không xóa tính năng, không đổi giao diện R100 đang ổn định, không thay thế Parthenon photogrammetry GLB, không tạo nhiều BAT.

## 0. KIỂM TRA BẢN CẬP NHẬT ĐÃ ĐƯỢC CÀI
- Đọc `R106_AGENT/NGUON_VA_GIAY_PHEP_R106.csv`, `R106_AGENT/BAO_CAO_VA_GIOI_HAN_R106.md`, `dual/discovery-r106/heritage-additions.mjs`, `dual/discovery-r106/gallery-real-photos.mjs`, `dual/discovery-r106/gallery-svg.mjs`.
- Chạy `npm run test:r106`; phải nhìn thấy 24 địa điểm trong địa cầu/bản đồ, 15 bục minh họa + Parthenon GLB ở UNESCO, 51 ảnh tranh trong danh mục (40 gốc + 11 mới), phòng B vẫn chỉ có 8 khung vật lý và chuyển trang.
- Sao lưu trước khi tiếp tục chỉnh sửa; ghi hash SHA-256 GLB `dual/discovery-r98/assets/unesco_parthenon_glb.glb` và so sánh sau mỗi lần nâng cấp. Không chỉnh sửa asset này.

## 1. PHÒNG UNESCO: ẢNH THẬT – TIỂU SỬ – SKETCHFAB – 3D THỰC
Bộ mã R106 đã khai báo đủ sáu công trình:
- Sydney Opera House: UID `73267b70f8fd46a8a175bd51f1c77b1c`, khối mái mảnh cầu; thuộc di sản UNESCO riêng #166.
- Hagia Sophia Istanbul: UID `63d3b49f01be4f4995cc08b7f8b66ada`, mái vòm và bán vòm; thuộc *Historic Areas of Istanbul* #356, KHÔNG ghi thành hồ sơ riêng.
- Pantheon Rome: UID `8ce20ac5fc3a4af7ab223cdc0caa7d27`, vòm bán cầu, khối trụ; thuộc *Historic Centre of Rome* #91, KHÔNG ghi thành hồ sơ riêng.
- Eiffel Tower: UID `6830e60d2c1048f2a33e92679664f652`, kết cấu giàn tam giác; khu kiến trúc hình học khác.
- Atomium Brussels: UID `333d8073ebe949909428c0b9cef02425`, 9 hình cầu, cạnh và đường chéo lập phương; khu kiến trúc hình học khác.
- Burj Khalifa: UID `c1d6f5884c9c4a56b8d8f9c5555f1902`, khối tầng, tiết diện; khu kiến trúc hình học khác.

Với MỖI địa danh:
1. Xác minh URL Sketchfab UID, tên tác giả, giấy phép, nút Download thực sự và chất lượng của từng mesh. Không giả định cứ có `CC BY` là có thể lấy GLB trực tiếp từ iframe.
2. Ưu tiên bản quét photogrammetry, mặt ngoài công trình đúng địa danh; ghi rõ loại `photogrammetry / 3D manually modeled / artistic reconstruction`.
3. Đăng nhập SKETCHFAB qua OAuth chính thức trong trình duyệt khi cần cô phê duyệt. **Không xin mật khẩu/tokens trong chat, không scrape, không bypass quyền tải**. API tài liệu: https://sketchfab.com/developers/download-api
4. Nếu model cho phép tải, tự tải gói glTF theo API hoặc tải hợp pháp trên trình duyệt đã đăng nhập, kiểm tra archive an toàn, chuyển sang GLB cùng texture; dùng mã pipeline R105 hiện có `tools/r105-sketchfab-pipeline.mjs` và cơ chế manifest `dual/discovery-r103/assets/approved-local-models.json`.
5. Ghi `id` đúng 6 ID `r106_sydney`, `r106_hagia`, `r106_pantheon`, `r106_eiffel`, `r106_atomium`, `r106_burj`, `author`, `license`, `sourceURL`, `sha256` và đường dẫn GLB. Kiểm tra triangle count, texture, bbox, scale, bệ xoay và nhận sự kiện chuột trong Three.js. Sau khi nạp GLB có phép, **gỡ mô hình hình học tạm khỏi bục**.
6. Nếu model không cho tải: giữ mô hình hình học giáo dục đã có R106 trên bục, dán nhãn **CHƯA CÓ GLB GỐC / HÌNH HỌC MINH HỌA**; xem Sketchfab trong modal R100. Không biến iframe nổi thành mô hình Three.js giả.
7. Ảnh thực tế dẫn Commons đã được liệt kê kèm tác giả/giấy phép trong CSV; tự truy cập từng trang nguồn và xác minh license còn phù hợp; không lấy ảnh AI, ảnh khác địa danh, hoặc watermark. Ảnh thật đúng nguồn hiện đã được khai báo tải qua Wikimedia khi có Internet.
8. Không tự đổi ảnh phong cảnh Rhodes hay Sketchfab tượng Colossus; không thay mô hình tượng Zeus đã khôi phục trước đây.

## 2. PHÒNG B: 11 ẢNH THẬT + HÌNH HỌC 2D
Bộ cập nhật đã thêm đúng bộ sưu tập `Ảnh thật và hình học R106` gồm:
1. Tổ ong, 2. Romanesco, 3. Quả thông, 4. Vòng đu quay, 5. Cầu thang xoắn, 6. Bánh xe đạp, 7. Mái vòm geodesic, 8. Lát ghép, 9. Bóng đá, 10. Bông tuyết, 11. Sao biển.

- Chỉ sử dụng ảnh thật với nguồn và giấy phép đã ghi trong `gallery-real-photos.mjs`. Tôn trọng CC BY/CC BY-SA và ghi attribution ở hồ sơ ảnh.
- Ảnh hiện **chỉ có URL trực tuyến**, chưa có JPG chứa trong ZIP. Nếu cần offline, Agent phải tải từ nguồn Commons hợp lệ, kiểm tra ảnh thật, cấp phép và checksum rồi lưu cache cục bộ theo cấu trúc dự án; cập nhật từng đường dẫn với fallback khi ảnh không tải.
- Không thêm 11 khung ảnh mới vào phòng; hiện có 8 khung vật lý. Sử dụng nút **Trước/Sau** đã có để chuyển trang 8 + 3; tránh quá tải VRAM.
- Giữ hình SVG 2D minh họa và LaTeX; chú thích các quan hệ gần đúng (Romanesco/fractal; sao biển/đối xứng; tổ ong/lục giác) cho học sinh.
- Đảm bảo mỗi ảnh được mở có tên, tiểu sử/mô tả, nguồn, tác giả, license, và bản vẽ 2D đúng khái niệm.

## 3. GIAO DIỆN & BẢN ĐỒ
- Bản đồ và địa cầu dùng cùng catalog 24 điểm: 7 kỳ quan cũ màu CAM, 7 kỳ quan mới màu VÀNG, 10 kiến trúc khác màu ĐỎ.
- Địa cầu/bản đồ chỉ hiện ảnh thật, lịch sử và Sketchfab; **không thêm nút đến phòng UNESCO**.
- Phòng UNESCO có 3 khu: di sản UNESCO, New7Wonders 2007, các kiến trúc hình học khác. Bục 3D khắp ba bên tường; Parthenon quang trắc bản gốc không được xóa. Chỉ mở ảnh/tiểu sử/tab hình học khi nhấn E hoặc xem chi tiết.
- Giữ HTML/CSS hai cột hiện hành `.r100-window`, `.r100-media-grid`, `.r100-list`, `.r100-details`, `.r100-viewer`.

## 4. KIỂM THỬ VÀ BÀN GIAO
1. `node --check` từng module thay đổi; `npm run test:r106`; `npm run test:r105` cần đối chiếu nếu test lịch sử có assert danh mục cũ; không xóa test chỉ để có PASS.
2. Mở Node `server/host.mjs` và kiểm tra các route CSS/JS mới (HTTP 200).
3. Chụp screenshot Chrome/Edge 1366×768, 1920×1080: 6 mô hình UNESCO mới; phòng B trang 1 và trang 2; bản đồ có 24 điểm; menu ảnh thật/tiểu sử/Sketchfab.
4. Kiểm tra nguồn ảnh có tải thật và không bị 404, giấy phép/attribution thực; kiểm tra lượng dữ liệu WebGL/GLB và giải phóng vật liệu/texture nếu không dùng.
5. Chạy test hồi quy Parthenon, các Lab lớp 6–12, Công viên và Museum; chỉ công bố những phần đã kiểm thử thật trên máy.
6. Bàn giao ZIP patch từ R105 hoặc bản vá tiếp theo, prompt và file nguồn/bản quyền. Không phát hành GLB không có quyền phân phối.

**HÃY TỰ THỰC HIỆN CÁC BƯỚC KỸ THUẬT trong IDE/Terminal/Browser của Antigravity; cô chỉ phê duyệt đăng nhập/quyền truy cập chính thức khi hệ thống yêu cầu. Không yêu cầu cô viết code. Không tự thay đổi thiết kế đã duyệt.**
