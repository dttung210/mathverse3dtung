# BẮT ĐẦU THỰC THI — ANTIGRAVITY MATHVERSE R98

**Mục tiêu:** Bộ cài này đã chứa dự án R97 + lớp kiểm duyệt R98 trong `dual/discovery-r98/`, trang quản lý ảnh/GLB (`dual/discovery-r98/quan-ly.html`), API cục bộ, phòng UNESCO chỉ hiện bản quét đã duyệt, bộ lọc map/globe và các kiểm thử. Cần **tiếp tục** hoàn thiện dữ liệu kiến trúc thật, không sửa từ số 0.

## Lệnh giao Agent (đặt ở đầu prompt dài)

Bạn đang mở **BỘ CÀI MATHVERSE R98 ĐÃ TÍCH HỢP CHỨC NĂNG CƠ BẢN**, không phải chỉ có R97. Đầu tiên:

1. Chạy `node --test tests/r98-fidelity-curation.test.mjs tests/r97-discovery-world-map.test.mjs tests/r96-unesco-discovery.test.mjs tests/r95-discovery-integration.test.mjs` và `node server/host.mjs` để xác minh mã.
2. Đọc `R98_AGENT/PROMPT_ANTIGRAVITY_MATHVERSE_R98.md` và `R98_AGENT/NGHIEN_CUU_REPO_UNESCO.md`. Tiếp tục những tính năng chưa hoàn thành; KHÔNG tạo ứng dụng mới hoặc thay file người dùng bằng repo độc lập.
3. Với mẫu đầu tiên **Parthenon**, kiểm tra bộ dữ liệu Zenodo https://zenodo.org/records/10319004 và nguồn Sketchfab https://sketchfab.com/3d-models/parthenon-acropolis-athens-greece-d5cc54ccd57a4bdeb3c164a96c677b59. Kiểm tra giấy phép CC BY, tác giả Nick G. Gizelis, download chính thức, số lượng tam giác ~450.000, texture. Tải `d5cc54ccd57a4bdeb3c164a96c677b59.glb` từ Zenodo **chỉ khi thực sự được phép**. Kiểm tra bản quét phù hợp hiện trạng, so sánh nhiều góc ảnh nguồn; không tự động duyệt nếu thiếu người kiểm tra hoặc bằng chứng.
4. Tích hợp **GLTFLoader ngoại tuyến** bản khớp Three.js hiện có từ https://github.com/mrdoob/three.js và sửa `dual/discovery-r98/scan-loader.mjs` hiện còn dùng CDN. Không thay đổi engine toàn bộ dự án.
5. Mở `http://127.0.0.1:4190/dual/discovery-r98/quan-ly.html`, kiểm tra upload GLB và ảnh thật và quy trình kiểm duyệt. Khi có dữ liệu hợp pháp và đối chiếu, hệ thống phải hiển thị mô hình thật thay cho dãy cột lý tưởng hóa. Không bỏ qua bốn bước kiểm duyệt.
6. **Hoàn thiện phòng tranh thực tế:** rà soát toàn bộ 40 tranh và chỉ công bố ảnh đúng đối tượng có metadata tác giả, giấy phép. Mô hình 2D/3D được chứng minh đúng hình khối đặc trưng; ví dụ đèn giao thông: 2D hình chữ nhật + ba đĩa tròn, 3D hộp + ba mặt đèn hình trụ dẹt, tỷ lệ đối chiếu ảnh. Không biến 2D vector thành khẳng định phục dựng giống thật từng chi tiết.
7. Tối ưu kiến trúc phòng, ánh sáng, đi lại, va chạm, hỗ trợ laptop và mobile. Nguồn tham khảo repo: ThreeMuseum, three-pathfinding, three-mesh-bvh, MapLibre, globe.gl. Chỉ tích hợp module nếu cần, kiểm tra giấy phép.
8. Bản đồ phẳng và địa cầu lấy **cùng danh mục GLB+ảnh được duyệt**. UNESCO DataHub chỉ để xác minh di sản; không chấm tất cả địa điểm UNESCO như thể đã có GLB. Kiểm tra Natural Earth và tọa độ từng công trình.
9. Kiểm thử thực sự trên WebGL Chrome/Edge: chụp màn hình từng khu, so sánh GLB với ảnh thật, đo FPS và báo rõ nguồn sai lệch. Chỉ phát hành tiếp khi không có lỗi nghiêm trọng; giữ Museum, LAB Toán 6–12, Park, game, 40 file nguồn cũ.
10. Xuất ZIP đã chạy thử cùng `LICENSES_ASSETS.csv`, `AUDIT_GLBS.csv`, ảnh minh chứng QA và hướng dẫn tiếng Việt. Không được tuyên bố 100% chính xác, không bịa thành công tải ảnh/GLB khi chưa làm được.

Lệnh đầy đủ và các tiêu chí nghiêm ngặt tiếp tục ở `R98_AGENT/PROMPT_ANTIGRAVITY_MATHVERSE_R98.md`.
