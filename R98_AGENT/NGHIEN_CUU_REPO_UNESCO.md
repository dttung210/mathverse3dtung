# NGHIÊN CỨU REPO VÀ DỮ LIỆU MATHVERSE R98 — 06/11/2026

**Mục tiêu:** Thay hiện vật UNESCO GLB lý tưởng hóa bằng hiện vật 3D có nguồn quét/bản vẽ được kiểm định; tổ chức lại phòng Discovery; bản đồ phẳng/địa cầu hiển thị CHỈ những công trình đã có ảnh đúng và GLB được duyệt.

## Nhận định trên mã nguồn R97 có thật

- `dual/discovery-world.mjs` dựng phòng nền bằng box và hai cánh nguyên bản, dùng Three.js ES modules; phòng tranh còn 40 mục trong dữ liệu nhưng tối đa 8 khung vật lý đồng thời.
- `dual/discovery-unesco-world.mjs` sửa gian địa cầu cũ thành phòng UNESCO; di chuyển địa cầu sang sảnh, dựng ảnh ở 8 vị trí tường.
- `dual/discovery-r97/verified-heritage.mjs` hiện chỉ mô tả Giza hình chóp, Borobudur nền vuông–tròn, Parthenon lưới cột; những tệp đó không phải 3D kiến trúc quét hiện trường.
- `dual/discovery-ui.mjs` có ba mode 2D/3D/Sketchfab; cần cấm Sketchfab trong phòng UNESCO, và chỉ hiển thị mode 3D kiến trúc từ GLB đã được duyệt.
- Các xét đoán trên chỉ là *khảo sát mã trong R97*, chưa phải chứng nhận đã chỉnh R98.

## Repo ưu tiên cho kiến trúc và điều hướng

| Repo | URL | Công dụng | Kết luận |
|---|---|---|---|
| ThreeMuseum | https://github.com/SamG-Coder/ThreeMuseum | Kiến trúc bảo tàng 11 không gian, collision, map, GLB placement | Tham khảo bố cục & QA, kiểm tra license nếu tái sử dụng mã |
| Virtual Museum Three.js | https://github.com/nandana-das/virtual_museum_project | 6 sảnh, thẻ thông tin, UI, tour | Hữu ích do stack Three.js vanilla |
| 3D-Art-Gallery | https://github.com/ilaydaozel/3D-Art-Gallery | Đi bộ first-person, tranh tự bố trí và thông tin từng tranh | Học cách tổ chức phòng tranh |
| three-pathfinding | https://github.com/donmccurdy/three-pathfinding | Navmesh và tính đường đi, clamp chuyển động | Có thể tích hợp nếu cần hệ thống navmesh |
| three-mesh-bvh | https://github.com/gkjohnson/three-mesh-bvh | Raycasting/collision nhanh với mesh lớn | Ưu tiên nếu phòng có GLB scan nhiều tam giác |
| react-three-fiber | https://github.com/pmndrs/react-three-fiber | Component hóa Three.js trong React | KHÔNG ép vào R97 vanilla nếu không có lý do kiến trúc |
| r3f-gallery-template | https://github.com/homemadegarbage/r3f-gallery-template | Phòng tranh mẫu R3F | Chỉ tham khảo UI, không tích hợp nguyên cả ứng dụng |

## Repo ưu tiên địa cầu và bản đồ

| Nguồn | URL | Tác dụng / lưu ý |
|---|---|---|
| globe.gl | https://github.com/vasturiano/globe.gl | Địa cầu Three.js có pin, bấm, quay, country polygons |
| MapLibre GL JS | https://github.com/maplibre/maplibre-gl-js | Bản đồ vector web chuyên dụng, zoom/fly-to, custom layer |
| Natural Earth 10m | https://www.naturalearthdata.com/downloads/10m-cultural-vectors/ | Ranh giới cấp tổng quan 1:10m, các nước/đơn vị bản đồ; không xác nhận pháp lý biên giới |
| Natural Earth 50m | https://www.naturalearthdata.com/downloads/50m-cultural-vectors/ | Cấp nhẹ cho bản đồ lớn thế giới |
| Natural Earth 110m | https://www.naturalearthdata.com/downloads/110m-cultural-vectors/ | Fallback ngoại tuyến |
| UNESCO DataHub | https://data.unesco.org/explore/assets/whc001/export/ | Truy xuất xác minh danh sách UNESCO, năm và tọa độ vùng, không phải bảo đảm mô hình 3D |
| OSM tile policy | https://operations.osmfoundation.org/policies/tiles/ | Không tải hàng loạt tile từ tile.openstreetmap.org để làm gói offline |

## Repo dựng và tối ưu 3D có độ trung thực cao

| Repo | URL | Vai trò |
|---|---|---|
| Meshroom | https://github.com/structure-from-motion/meshroom | Dựng hình từ nhiều ảnh với photogrammetry |
| COLMAP | https://github.com/colmap/colmap | Khôi phục camera và cloud/mesh từ nhiều ảnh |
| OpenMVS | https://github.com/cdcseacave/openMVS | Dense mesh + refine + texture, giấy phép AGPL-3.0 cần đánh giá |
| Potree | https://github.com/potree/potree | Xem point cloud từ LiDAR trước khi chuyển thành mesh |
| glTF-Blender-IO | https://github.com/KhronosGroup/glTF-Blender-IO | Xuất mesh Blender sang GLB |
| glTF-Transform | https://github.com/donmccurdy/glTF-Transform | Nén và tối ưu mesh/texture GLB |
| meshoptimizer / gltfpack | https://github.com/zeux/meshoptimizer | Tối ưu mesh, tài sản lớn |
| glTF-Validator | https://github.com/KhronosGroup/glTF-Validator | Test chuẩn định dạng GLB, không chứng minh giống công trình |
| OpenCV | https://github.com/opencv/opencv | Nhận diện đường viền, tròn, thẳng từ ảnh thật |
| VTracer | https://github.com/visioncortex/vtracer | Ảnh thực -> SVG, không tự suy ra quan hệ toán học |

## Ứng viên UNESCO 3D có nguồn cụ thể — tất cả ở trạng thái CHỜ DUYỆT

| Công trình | UNESCO | Mô hình/dữ liệu | Phép dùng, trở ngại |
|---|---|---|---|
| Parthenon hiện trạng | https://whc.unesco.org/en/list/404/ | https://sketchfab.com/3d-models/parthenon-acropolis-athens-greece-d5cc54ccd57a4bdeb3c164a96c677b59 | Photogrammetry từ video drone, 450,3k triangles, CC BY; cần tải hợp lệ và đối chiếu nhiều góc, texture, hiện trạng |
| Hạng mục An Định – Huế | https://whc.unesco.org/en/list/678/ | https://openheritage3d.org/project.php?id=4z5b-vz23 | LiDAR và ảnh địa/không, CC BY-NC-SA; nhiều GB, chưa có GLB nhẹ sẵn; cần xác minh hạng mục thuộc di sản |
| Tháp Mỹ Sơn | https://whc.unesco.org/en/list/949/ | https://sketchfab.com/3d-models/my-son-temple-ruins-vietnam-833564ab7c2540b9be6ecefb8bfc2a8a | CC BY, 250k triangles; thiếu mô tả phương pháp dựng, chưa thể công nhận chính xác |
| Chichén Itzá | https://whc.unesco.org/en/list/483/ | https://www.openheritage3d.org/project.php?id=2atk-cq42 | LiDAR di sản, cần kiểm tra cụ thể đối tượng scan, giấy phép và xử lý thành mesh; không tự giả định toàn bộ El Castillo |
| La Cesta – San Marino | https://whc.unesco.org/en/list/1245/ | https://openheritage3d.org/project.php?id=2h6g-jz80 | Dữ liệu LiDAR/quang trắc CC BY-NC-SA; trang nguồn hiện ghi kích thước tải không khả dụng, không xem là GLB sẵn tải |

**Ảnh thật Parthenon khớp đúng đối tượng để bắt đầu kiểm tra:**
- https://commons.wikimedia.org/wiki/File:Parthenon,_Athens,_Greece.jpg — DJDunsie, CC BY 3.0, 2848×2144.
- https://commons.wikimedia.org/wiki/File:Parthenon_-_Athens_Greece.jpg — Joshua Doubek, CC BY-SA 4.0, 3072×2304.

**Open Heritage 3D quan trọng:** https://openheritage3d.org/faq — raw dataset trung bình khoảng 25GB; website yêu cầu điền tên, tổ chức, email để nhận liên kết dữ liệu; phải tuân giấy phép từng dự án, đa số không dùng thương mại.

## Tiêu chuẩn từ chối hiện vật

- Không có model file hợp pháp, chỉ có thumbnail/Sketchfab iframe -> KHÔNG DUYỆT phòng 3D.
- Model là hình học đơn giản như dãy cột, vài nền hình vuông, 4 mặt tam giác -> KHÔNG gọi là kiến trúc chính xác.
- Ảnh không có trang nguồn và metadata tác giả/license -> KHÔNG DUYỆT ảnh thật.
- Mô hình được AI tưởng tượng từ một ảnh đơn, thiếu bề mặt khuất -> chỉ nghiên cứu, KHÔNG duyệt là mô hình đo đạc.
- Bản đồ có site centroid nhưng thiếu tọa độ công trình cụ thể -> KHÔNG tạo marker của công trình.
- Không có quyền phát lại mô hình scan/ảnh hoặc giấy phép CC BY-NC-SA không phù hợp mục đích sử dụng -> để chờ làm rõ.

## Phương án triển khai khuyến nghị

**Trên R97 hiện tại:** Giữ Three.js + ES modules + Node, dùng `ThreeMuseum` để tham khảo thiết kế phòng, `globe.gl` và `MapLibre` cho địa lý, `Open Heritage 3D + Meshroom/COLMAP` cho dữ liệu công trình, `glTF-Transform` và Validator cho GLB. Xây bộ lọc tài sản được phê duyệt rồi lấy tập này làm nguồn duy nhất cho địa cầu, bản đồ và phòng UNESCO.

Chỉ thêm GLB công trình khi có đủ chứng cứ trực quan/đo đạc và giấy phép. Cô không cần biết lập trình: Agent thực hiện triển khai và đưa màn quản trị 'Tải ảnh/Tải GLB/Xem trước/Duyệt'.
