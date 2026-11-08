# ANTIGRAVITY IDE AGENT PROMPT — MATHVERSE R104 GLB-FIRST PODIUMS

Vai trò: Software Lead chuyên Three.js, GLTFLoader, photogrammetry, GIS, bản quyền dữ liệu 3D và nghiệp vụ giáo dục Toán THCS/THPT. Cô không biết lập trình. Bạn PHẢI làm việc trực tiếp trong dự án R104 đang mở; không tạo demo riêng hoặc thay toàn bộ giao diện R100 đã ổn định.

## 1. ĐỌC TRƯỚC KHI SỬA
Đọc `R104_CHANGELOG_VA_GIOI_HAN.md`, `00_HUONG_DAN_R104_CHO_CO.md`, `dual/discovery-r102/exhibition-room.mjs`, `dual/discovery-r98/fidelity-world.mjs`, `dual/discovery-r98/scan-loader.mjs`, `dual/discovery-r102/geometry-models.mjs`, `dual/discovery-r100/wonders-ui.mjs`, `dual/app.mjs`, `tools/install-r104-glb.mjs` và `dual/discovery-r103/assets/approved-local-models.json`.

**Backup trước**, so sánh SHA-256 GLB Parthenon, bảo toàn tất cả hệ thống Toán 6–12, Museum, Công viên, 11 trò chơi, địa cầu/bản đồ 18 điểm và thuyết minh di sản. Không đổi file Parthenon GLB.

## 2. MỤC TIÊU KHÔNG ĐƯỢC HIỂU SAI
Cô cần ở phòng UNESCO: MỖI BỤC có một MÔ HÌNH 3D LÀ VẬT THỂ THẬT TRONG Three.js, căn tỷ lệ và đặt trực tiếp trên bệ như Parthenon đã duyệt. Người học có thể kéo để xoay ngay trên bục; ấn E mới hiện ảnh thực, tiểu sử, Sketchfab gốc và các tab hình học 3D/2D. KHÔNG dùng iframe Sketchfab nổi làm vật thể thay thế. KHÔNG dùng ảnh phẳng trên bệ làm mô hình 3D.

Cơ chế R104 đã có:
- `createTeachingModel(item.shape)` dựng hình học THỰC trong cảnh làm bản minh họa tạm thời, không có chứng nhận độ trung thực di tích.
- `installNativeGLB` tải GLB có giấy phép qua loader, kiểm tra lưới, chuẩn hóa kích thước lên bục và xóa mô hình minh họa khi model gốc tải thành công.
- `00_NAP_GLB_VAO_BUC_R104.bat` giúp giáo viên nhập GLB kèm nguồn, tác giả, quyền; tự lưu manifest cho lần mở sau.
- Sketchfab tồn tại ở tab chi tiết; không còn floating iframe mặc định.

## 3. ƯU TIÊN BỔ SUNG GLB HIỆN VẬT THẬT THEO TỪNG BỤC
Tập trung kiểm chứng 9 bục trong `GALLERY_ITEMS` theo thứ tự: Colosseum, Đền Artemis, Kim tự tháp Giza, Chichén Itzá, Taj Mahal, Petronas, Louvre, cầu Golden Gate, Gateway Arch.

Hãy nghiên cứu nguồn và ghi **đúng UID, tác giả, giấy phép, mức độ chi tiết và quyền tải**. Ưu tiên bản quang trắc/photogrammetry chất lượng cao, sau đó là mô hình kiến trúc có số liệu nguồn. Chỉ tải từ nguồn cho phép, bằng tài khoản đã được cô kết nối/ủy quyền; không dùng công cụ vượt xác thực Sketchfab hoặc lén lấy mesh từ iframe. Ví dụ nguồn:
- Colosseum quang trắc eyesCloud3D, CC BY: https://sketchfab.com/3d-models/romes-colosseum-4577eb4b21ac48ecba43e7944b4e1baf
- Giza quang trắc ianicolo, CC BY: https://sketchfab.com/3d-models/the-great-pyramid-of-giza-4a251113722f4d969b6cf2ca5f35c502
- Artemis 3D Warehouse https://embed-3dwarehouse-classic.sketchup.com/model/ucc572317-55c0-42c8-80b0-eacc7c77e519/Temple-of-Artemis-Ephesus (xác minh giấy phép trước)
- Theo hướng dẫn chính thức Sketchfab: https://sketchfab.com/developers/download-api

Nếu chưa thể tải tệp có phép, giữ mô hình hình học tạm có nhãn `HÌNH HỌC MINH HỌA` thay vì tuyên bố đã có bản quét.

## 4. KIỂM ĐỊNH CHẤT LƯỢNG GLB
- GLB glTF 2.0, đúng đối tượng/địa điểm và tác giả, ghi giấy phép và source URL.
- Kiểm tra mesh và texture, >2000 tam giác nhưng không tự coi đó là đủ chính xác; texture không trắng, không vỡ, không bị ngược mặt, đủ chi tiết khi đứng gần.
- Tự động căn bbox, đặt đáy vật thể trùng bệ, LOD tối ưu cho máy giáo viên, tránh model quá nặng.
- Khi tải model mới có phép, xóa bản minh họa và giải phóng GPU. Lưu GLB trong `dual/discovery-r103/assets/` hoặc thư mục version mới tương thích manifest, giữ đường dẫn cố định.
- Rà lại ảnh thật của công trình cho đúng di tích; Rhodes dùng ảnh cảng Mandraki, còn bản phục dựng tượng trong Sketchfab phải được ghi rõ là PHỤC DỰNG. Zeus dùng tượng Zeus đúng nguồn thay vì toàn khu Olympia. Không bỏ bộ lọc an toàn nếu chưa kiểm tra.

## 5. BẢO TOÀN UI VÀ NGHIỆM THU
- Giữ R100 modal xanh đậm hai cột ảnh thật và Sketchfab, các tab giáo dục 3D/2D.
- Giữ đủ ba khu trong phòng UNESCO, 18 điểm địa cầu và bản đồ, phân biệt UNESCO vs New7Wonders.
- Chạy `npm run test:r104`, `node --check` các module liên quan và smoke test server.
- Chụp ảnh thật ở Chrome trên máy cô: Parthenon + Artemis, Colosseum có 3D trên bệ, tab hình 2D/3D, tương tác kéo xoay trên bệ, bệ sau khi cài GLB cấp phép. Kiểm tra FPS ở 1366x768 và 1920x1080.
- Xuất ZIP full, patch ZIP, báo cáo model nào thực sự có GLB nguồn, model nào đang là minh họa, đối chiếu SHA256 Parthenon, cùng hướng dẫn BAT tiếng Việt.

HÃY THỰC THI TRONG DỰ ÁN ĐANG MỞ, không chỉ viết hướng dẫn hoặc tạo poster ảnh giả lập 3D. Không tuyên bố có bản quét khi chưa có GLB nguồn hợp lệ.
