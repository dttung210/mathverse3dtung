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


---

# PROMPT ANTIGRAVITY IDE — MATHVERSE R98 DISCOVERY FIDELITY-FIRST

**Mục đích:** Dán TOÀN BỘ nội dung file này vào khung Agent của Google Antigravity IDE khi đã mở thư mục dự án MATHVERSE R97. Đây là yêu cầu **thực hiện lập trình, thay thế hiện vật kém chất lượng, kiểm thử và xuất bộ cài mới**, không phải yêu cầu chỉ viết phương án hoặc mockup.

## VAI TRÒ VÀ NHIỆM VỤ

Bạn là nhóm kỹ sư cấp cao gồm: kiến trúc sư Three.js/WebGL, kỹ sư GIS, kỹ sư quang trắc/3D scanning, lập trình viên frontend Node.js, chuyên gia cấp phép nội dung, giám định hình học THCS–THPT, kỹ sư QA đồ họa. Người sử dụng là giáo viên Toán KHÔNG BIẾT LẬP TRÌNH. Bạn phải tự khảo sát, lập trình, tìm đúng tài sản 3D/ảnh có phép sử dụng, chạy thử, sửa lỗi, đóng gói và viết hướng dẫn tiếng Việt. Không chuyển việc viết mã hay xử lý lỗi cho giáo viên.

**INPUT/BẢN GỐC:** Dự án MATHVERSE R97 đã mở trong workspace; file ZIP phát hành gốc dự kiến có tên `MATHVERSE_R97_DISCOVERY_4_KHU_FULL_2026-11-06.zip`. KHÔNG tự tạo dự án mới không liên quan và KHÔNG dùng R92/R95 thay cho R97. Nếu workspace không chứa mã nguồn R97, trước hết dò đường dẫn chính xác; nếu thực sự không có thì báo tệp cần thiết, không giả vờ đã sửa. Các tệp hiện hữu để định hướng (hãy xác minh trên máy trước khi sửa):

- `package.json`: dự án Node.js >=20, `type=module`, Three.js dùng trực tiếp, KHÔNG phải dự án React.
- `dual/discovery-world.mjs`: thế giới Discovery, sảnh/phòng, địa cầu và phòng tranh gốc.
- `dual/discovery-unesco-world.mjs`: chỉnh khu Discovery, di chuyển địa cầu ra sảnh, phòng UNESCO.
- `dual/discovery-unesco-data.mjs`: 18 mục UNESCO đã khai báo, chưa phải 18 mô hình hoàn thiện.
- `dual/discovery-r97/verified-heritage.mjs`: 3 mô hình KHÔNG phải bản quét (Giza, Borobudur, Parthenon).
- `dual/discovery-ui.mjs`, `dual/discovery.css`, `dual/discovery-data.mjs`, `dual/discovery-photo-r96.mjs`.
- `dual/discovery-r95/models/`: các GLB hình học lý tưởng hóa, không được đưa nguyên trạng vào phòng kiến trúc chính xác.
- `dual/discovery-r95/r95-catalog-data.mjs`: danh mục tranh/vật thể trước đây.
- `server/discovery-geo-r97.mjs`: cổng dữ liệu UNESCO/Natural Earth và cache.
- `tests/r97-discovery-world-map.test.mjs`, `tests/r96-unesco-discovery.test.mjs`, `tests/r95-discovery-integration.test.mjs`.

**ĐẶT TÊN BẢN MỚI:** `MATHVERSE_R98_DISCOVERY_FIDELITY_FIRST` sau khi thực sự chỉnh và kiểm thử. Không ghi 'hoàn thành', 'chính xác 100%' khi chưa có bằng chứng.

## 0. NGUYÊN TẮC KHÔNG ĐƯỢC VI PHẠM

1. Sao lưu nguyên vẹn R97 trước mọi sửa đổi, tạo SHA256 manifest của tệp nguồn; KHÔNG ghi đè bản R97 đang hoạt động. Tách patch additive trong `dual/discovery-r98/` hoặc các module tương đương; nếu sửa file hiện hữu phải ghi diff và lý do. Có script rollback.
2. Bảo toàn MATHVERSE Lab Toán 6–12, Museum, 11 trò chơi, công viên, sảnh chung, bộ mô hình và dữ liệu học tập cũ; không được xóa 40 tranh/chủ đề đã lưu: chỉ **ẩn khỏi danh sách công bố khi chưa đạt chuẩn**, giữ nguyên dữ liệu gốc trong kho chờ kiểm định.
3. KHÔNG dựng một hình chóp sơ sài rồi gọi là Kim tự tháp Khufu; KHÔNG dựng các cột đứng trơ rồi gọi là Đền Parthenon; KHÔNG xếp vài tầng vuông/tròn rồi gọi là Borobudur. Không đổi tên hình học lý tưởng hóa thành công trình có thật.
4. Mỗi mục trưng bày phải có ảnh thật đúng chính công trình/vật thể, giấy phép hợp lệ và mô hình 3D đủ mức trung thực. Không có nguồn đạt chuẩn thì **KHÔNG HIỂN THỊ** ở phòng UNESCO, trên địa cầu và bản đồ UNESCO tuyển chọn; ghi trạng thái 'chờ kiểm định' trong màn quản trị.
5. Có thể dùng Sketchfab để **tìm nguồn hoặc xem tư liệu**; riêng phòng kiến trúc UNESCO 3D **CẤM iframe/Sketchfab**, chỉ xem mesh GLB/GLTF được tải hợp pháp và lưu/serve từ hệ thống MATHVERSE. Trên bản đồ/địa cầu chỉ dùng viewer nhúng nếu giáo viên muốn xem tư liệu ngoài, phải phân biệt với trạng thái có GLB đạt chuẩn. Mặc định chấm bản đồ/địa cầu dựa trên mô hình đã phê duyệt.
6. Một ảnh chụp đơn KHÔNG thể xác nhận hình học 3D mặt khuất và kích thước công trình. AI sinh 3D từ một ảnh chỉ được đưa vào **khu thử nghiệm CHƯA DUYỆT**, tuyệt đối không gắn nhãn mô hình đo đạc chính xác.
7. Không tải ảnh Getty, Google Images, ảnh Wikipedia thumbnail, video YouTube, Sketchfab 3D hoặc dịch vụ bản đồ về rồi tái phân phối trái giấy phép. Với Creative Commons phải ghi công chính xác tác giả, link nguồn, tên giấy phép, sửa đổi, ShareAlike/NonCommercial nếu có.
8. Không dùng các ảnh/mô hình tạo bằng AI làm 'ảnh thực tế'. Nếu ảnh sai đối tượng, 3D không khớp ảnh, vật liệu mất texture, không đủ chi tiết, phải bỏ khỏi danh sách được duyệt.
9. Không sửa hoặc ghi đè ảnh gốc; lưu `sourceUrl`, `author`, `license`, `captureDate`, `sourcePage`, `assetHash`. Dữ liệu thiếu phải để `null`, không tự bịa.
10. Phải kiểm chứng bằng chạy ứng dụng thực trong Chrome/Chromium có WebGL, chụp ảnh sau khi render đủ thời gian; kiểm tra các phần nhìn thấy được, không coi test text/string là bằng chứng giao diện.

## 1. KIẾN TRÚC DISCOVERY MỚI — 4 VỊ TRÍ, CÁC PHÒNG ĐỘC LẬP

Thiết kế một khu Discovery đẹp, thống nhất phong cách bảo tàng hiện đại, nền vật liệu PBR thật, ánh sáng cân bằng, lối đi thoáng, bảng thuyết minh dễ đọc. Không tái sử dụng kiểu bệ hình trụ vàng quá lớn + vật thể đơn giản ở ảnh R97.

### KHU A: SẢNH ĐỊA CẦU UNESCO 3D
- Duy nhất MỘT địa cầu, đặt trên bệ riêng ở sảnh; có đường viền bờ biển/quốc gia chi tiết ở tỷ lệ hợp lý, phép chiếu vị trí lat/lon chính xác, quay mượt bằng chuột, dừng xoay khi tương tác.
- Chấm pin CHỈ với các di sản đã qua bộ lọc `approvedPhoto && approvedHighFidelity3D && rightsApproved && unescoVerified && coordinatesVerified`; pin không đạt yêu cầu không hiển thị. Bấm pin mở bảng thông tin: ảnh thật chính xác, tên, quốc gia, năm ghi danh, thuộc quần thể hay di sản riêng, nguồn UNESCO, tác giả ảnh, mô hình GLB thật ở panel bên cạnh, ghi nguồn quét/mesh.
- Không tái tạo toàn bộ danh sách UNESCO để lấp đầy địa cầu. Tối ưu số pin, chống chồng điểm, nhấn để zoom/fly-to, lọc theo châu lục và quốc gia.
- Dùng `globe.gl` hoặc `three-globe` nếu tích hợp với Three.js hiện hữu thuận lợi; KHÔNG đưa React vào app chỉ vì ví dụ dùng React.

### KHU B: BẢN ĐỒ THẾ GIỚI CHI TIẾT (MẶT PHẲNG TRONG PHÒNG 3D)
- Là gian phòng/bức tường bản đồ độc lập, hiển thị mặt phẳng bản đồ toàn thế giới, có tên quốc gia, bờ biển, ranh giới, biển, quần đảo; màu sắc đúng chuẩn bảo tàng, không phải ảnh phông nền do AI vẽ.
- Nguồn bản đồ địa lý: Natural Earth 1:10m cho chi tiết khi phù hợp ngân sách đồ họa, 1:50m ở mức trung, 1:110m chỉ làm fallback; MapLibre GL JS với vector tile được cấp quyền khi cần phóng to; đặt đúng CRS, chính xác ánh xạ kinh/vĩ độ lên mặt phẳng. Với chi tiết 1:10m, áp dụng LOD, tránh tải mọi đa giác cấp cao cùng lúc.
- Bề mặt bản đồ trong cảnh 3D phải đi kèm chế độ bản đồ phóng to thực sự tương tác: kéo, zoom, tìm di sản được duyệt, chọn quốc gia, trở về đúng điểm trong phòng. Dùng raycasting mapping UV <-> geo chính xác với phép chiếu được chọn; không đặt marker bằng tọa độ phần trăm thủ công.
- Cả bản đồ và địa cầu dùng CÙNG MỘT danh mục đã kiểm định; không để chấm ở một bên mà bên kia không có. Marker thể hiện vị trí **công trình cụ thể**, không lẫn tọa độ tâm vùng UNESCO. Nếu chỉ có tọa độ vùng mà chưa xác định được công trình, không hiển thị.
- Không tự khẳng định đường biên pháp lý: ghi chú dữ liệu cartographic theo nguồn Natural Earth và cách biểu diễn; hỗ trợ cấu hình dữ liệu quốc gia/địa phương phù hợp pháp luật nơi triển khai.
- Không tải tràn tile từ `tile.openstreetmap.org` để đóng ZIP hay làm ngoại tuyến; phải tuân chính sách tile, cache, attribution. Ngoại tuyến dùng file Natural Earth hoặc vector tile được cho phép phân phối.

### KHU C: PHÒNG TRIỂN LÃM UNESCO 3D TRUNG THỰC
- Dành riêng cho các công trình đã đủ bằng chứng. KHÔNG nhúng Sketchfab. Mỗi hiện vật phải có mô hình GLB/GLTF có kiến trúc nhận diện được từ nhiều góc, texture thực, cấu trúc không rỗng/sai tỷ lệ, không mất phần chính.
- Cấu trúc phòng trang trọng: tường ảnh thật, bệ mô hình thấp, khoảng đi lại, ánh sáng trung tính, bảng tên, bảng nguồn, nút xoay 360 độ, cắt lớp khi dữ liệu hỗ trợ, nút so sánh ảnh thật bên trái – 3D bên phải. Người học đi lại bằng WASD / phím mũi tên, E để tương tác, có touch controls và đường quay về sảnh.
- Nhất thiết lấy Parthenon hiện tại làm ca lỗi: loại bỏ khỏi phòng mô hình `parthenon_columns_8x17.glb`; xem xét photogrammetry Parthenon CC BY bên dưới. Chỉ phê duyệt sau khi kiểm tra đủ mặt đứng, nền, khối cột, dầm, mái và độ trùng khớp với ảnh hiện trạng. Mô hình Parthenon cổ đại đủ mái là loại **phục dựng giả thuyết**, còn Parthenon hiện trạng khác; KHÔNG trộn thời kỳ.
- Không giữ `borobudur_5_square_3_circle.glb`, `giza` hình chóp thuần làm di sản 3D được phê duyệt. Có thể giữ chúng ở kho **Sơ đồ Toán học** riêng với nhãn 'khái quát hình học', không được coi là ảnh dựng công trình thực.
- Một công trình muốn trưng bày phải qua checklist: xác minh UNESCO, ảnh đúng công trình, ảnh thực tế được cấp phép, nguồn dữ liệu mesh thật/scan hoặc bản dựng có tài liệu đo đạc đầy đủ, giấy phép mesh cho phép tải/phân phối, GLB load được, kiểm tra thị giác nhiều góc, thử nghiệm FPS.
- Nếu chỉ có 1–2 công trình đủ chuẩn, phòng 3D chỉ trưng bày 1–2 công trình đó. Ưu tiên độ chính xác hơn số lượng. **Không hiển thị bệ trống có tên công trình giả.**

### KHU D: PHÒNG TRANH & VẬT THỂ THỰC TẾ
- Bảo toàn danh mục cũ ở kho dữ liệu. Chỉ xuất bản các mục có ảnh thực tế chính xác, phép dùng rõ ràng và hình học tương ứng kiểm định được. Học sinh chọn **2D / 3D / 2D+3D** tùy mỗi hiện vật có thật sự hỗ trợ hay không; không bật nút 3D nếu không có mesh phù hợp.
- Ví dụ ĐÈN GIAO THÔNG: ảnh là đèn tín hiệu 3 đèn dọc đúng mẫu thực tế; 2D là đường viền vỏ chữ nhật bo góc và ba đường tròn ở đúng vị trí; 3D là phần vỏ dày có nắp che, ba cụm đèn tròn lồi (mặt khối trụ dẹt) đúng tỷ lệ quan sát, vật liệu và hướng đèn. Không được gọi là bản sao chính xác một thiết bị cụ thể nếu chưa có đo đạc/kích thước từ nguồn; ghi 'mô hình hình học khớp cấu trúc vật thể'.
- Với vật thể như cửa vòm, đồng hồ, bánh xe, viên gạch, hình tổ ong: đối chiếu ảnh/biên dạng chính đối tượng, lấy 2D từ OpenCV/VTracer, sau đó dựng tham số 3D bằng Three.js hoặc Blender nếu có đủ thông tin chiều sâu. Mọi hình 2D SVG phải chỉnh được theo đối tượng hình học (điểm/cạnh/góc), không chỉ là nét vector mỹ thuật.
- Ảnh bên trái, mô hình bên phải, chú giải Toán ngay dưới, không lấn hình. Tách trạng thái `photoApproved`, `geometry2DApproved`, `geometry3DApproved` và chỉ hiện nút đã đạt.

## 2. THƯ VIỆN/REPO BẮT BUỘC KHẢO SÁT — ƯU TIÊN NHỮNG REPO CÙNG STACK

**Phòng/bảo tàng:**
- `https://github.com/SamG-Coder/ThreeMuseum` — tham khảo bảo tàng 11 không gian, điều hướng va chạm, GLB, góc nhìn kiến trúc và atlas phòng. Kiểm tra LICENSE trước khi sao chép mã/tài sản.
- `https://github.com/nandana-das/virtual_museum_project` — ví dụ 6 sảnh và UI tương tác dùng Three.js thuần.
- `https://github.com/ilaydaozel/3D-Art-Gallery` — tranh trên tường, đi bộ ngôi thứ nhất và thẻ thông tin.
- `https://github.com/donmccurdy/three-pathfinding` — navmesh/đường đi trong phòng, với Three.js.
- `https://github.com/gkjohnson/three-mesh-bvh` — raycast và truy vấn va chạm trên mesh phức tạp.
- `https://github.com/pmndrs/react-three-fiber`, `https://github.com/pmndrs/drei`, `https://github.com/pmndrs/react-three-rapier` — chỉ tham khảo nếu có kế hoạch chuyển dần sang React được chứng minh không phá app. KHÔNG tự chuyển toàn dự án đang dùng Three.js thuần sang React.

**Bản đồ & địa cầu:**
- `https://github.com/vasturiano/globe.gl` — địa cầu Three.js và điểm tương tác.
- `https://github.com/maplibre/maplibre-gl-js` — bản đồ vector tương tác trong web.
- `https://www.naturalearthdata.com/downloads/10m-cultural-vectors/` — dữ liệu địa lý 1:10m; 1:50m cho LOD nhẹ.
- `https://data.unesco.org/explore/assets/whc001/export/` — UNESCO DataHub GeoJSON/CSV chỉ dùng xác minh thông tin và liên kết ghi danh, không có nghĩa mọi di sản đều có GLB.

**Tái dựng & xử lý mesh chân thực:**
- `https://github.com/structure-from-motion/meshroom` — photogrammetry từ NHIỀU ảnh có góc chồng lấp; có thể cần GPU và thời gian xử lý lớn.
- `https://github.com/colmap/colmap` — Structure from Motion/Multi View Stereo, lấy camera và point cloud.
- `https://github.com/cdcseacave/openMVS` — dựng mesh, chỉnh và phủ texture từ ảnh nhiều góc; lưu ý AGPL-3.0.
- `https://github.com/potree/potree` — xem dữ liệu point cloud khảo sát; không thay thế GLB chính thức của phòng trưng bày.
- `https://github.com/KhronosGroup/glTF-Blender-IO` — nhập/xuất GLB trong Blender.
- `https://github.com/donmccurdy/glTF-Transform` hoặc `https://github.com/zeux/meshoptimizer` — nén GLB, giữ cấu trúc hình học và texture ở mức chấp nhận được.
- `https://github.com/KhronosGroup/glTF-Validator` — kiểm tra cấu trúc file GLB.
- `https://github.com/opencv/opencv` + `https://github.com/visioncortex/vtracer` — xác định đường bao và vector 2D có bước chuẩn hóa toán học.

Các repo trên là các ứng viên công nghệ, **không có repo nào tự động bảo đảm biến 1 ảnh thành 3D kiến trúc chính xác tuyệt đối**. Chỉ cài repo/package thực sự cần, khóa phiên bản, kiểm tra LICENSE và test độc lập; không kéo toàn bộ mã GitHub vào app.

## 3. DANH MỤC 3D CÓ NGUỒN THỰC — NHẬP 'CHỜ DUYỆT', KHÔNG TỰ ĐỘNG DUYỆT

**3.1 Parthenon, Acropolis, Greece**
- UNESCO địa điểm Acropolis Athens, ID 404: `https://whc.unesco.org/en/list/404/`.
- Mesh thử nghiệm có giấy phép CC BY trên Sketchfab, do Nick G. Gizelis dựng từ video drone/photogrammetry, 450,3k triangles: `https://sketchfab.com/3d-models/parthenon-acropolis-athens-greece-d5cc54ccd57a4bdeb3c164a96c677b59`.
- Ảnh thật gắn chính đối tượng: `https://commons.wikimedia.org/wiki/File:Parthenon,_Athens,_Greece.jpg` (DJDunsie, CC BY 3.0); bản khác: `https://commons.wikimedia.org/wiki/File:Parthenon_-_Athens_Greece.jpg` (Joshua Doubek, CC BY-SA 4.0).
- Phải tải hợp lệ đúng mesh được cho phép; kiểm tra khi nhập liệu có ngoại cảnh thừa, lỗ mesh, texture sắc, tỷ lệ, phương hướng và hiện trạng cùng thời kỳ. Chỉ khi kiểm thử đạt mới `approved=true`.

**3.2 Quần thể di tích Cố đô Huế — hạng mục dữ liệu quét An Định**
- UNESCO ID 678: `https://whc.unesco.org/en/list/678/`.
- CyArk/Open Heritage 3D, DOI 10.26301/4z5b-vz23: `https://openheritage3d.org/project.php?id=4z5b-vz23`, gồm LiDAR mặt đất/ảnh từ mặt đất và trên không, license CC BY-NC-SA; dữ liệu rất lớn. CẦN xác nhận khả năng tải và xử lý cũng như phạm vi đối tượng trong quần thể theo hồ sơ UNESCO, không lấy nhầm Ngọ Môn thành An Định hoặc ngược lại.
- Đọc license cụ thể, khai báo mục đích phi thương mại, thuộc tính chia sẻ tương tự và ghi công CyArk/HMCC. Không tải hết hàng chục GB trên máy giáo viên khi chưa tính khả năng lưu trữ.

**3.3 Mỹ Sơn, Việt Nam — ứng viên khảo sát**
- UNESCO ID 949: `https://whc.unesco.org/en/list/949/`.
- Sketchfab `https://sketchfab.com/3d-models/my-son-temple-ruins-vietnam-833564ab7c2540b9be6ecefb8bfc2a8a` được niêm yết download, CC BY; tài liệu mô tả không đầy đủ nên phải kiểm tra trực quan và vị trí hạng mục thật trước khi phê duyệt; không tuyên bố đây là bản quét chính xác chỉ do nó có 250k tam giác.

**3.4 Chichén Itzá — dữ liệu scan nhưng cấp phép và quy mô cần rà**
- UNESCO ID 483: `https://whc.unesco.org/en/list/483/`.
- Dữ liệu quét LiDAR xuất bản: `https://www.openheritage3d.org/project.php?id=2atk-cq42` (Open Heritage 3D); license, hạng mục khảo sát và khả năng chuyển mesh phải được mở trang nguồn xác minh trực tiếp.
- Không được tự cho rằng bất cứ point cloud khu di tích nào tương ứng chính xác toàn bộ El Castillo.

**3.5 San Marino — La Cesta**
- UNESCO ID 1245: `https://whc.unesco.org/en/list/1245/`.
- Khảo sát `https://openheritage3d.org/project.php?id=2h6g-jz80` có LiDAR + photogrammetry, CC BY-NC-SA. Trang hiện ghi kích cỡ tải các loại dữ liệu 'Not available'; KHÔNG tự cho rằng file GLB tải trực tiếp được. Chỉ duyệt sau khi có mesh hợp lệ và nguồn ảnh cùng đối tượng.

**Không chọn sẵn Giza/Borobudur/Parthenon chỉ vì R97 có mô hình hình học**. Không chọn kiến trúc mơ hồ, không ghi sai UNESCO: một hạng mục có thể thuộc khu được UNESCO ghi danh chứ không phải công trình tự thân được ghi danh.

## 4. LUỒNG KIỂM ĐỊNH ẢNH VÀ MÔ HÌNH — TIÊU CHUẨN KHÓA CÔNG BỐ

Tạo registry dữ liệu thực (JSON/SQLite tùy stack), ví dụ logic trường dữ liệu:

```
{
  "id": "parthenon-current-ruins",
  "title": "Đền Parthenon (hiện trạng)",
  "unesco": {"siteId":404,"siteName":"Acropolis, Athens","relationship":"component_of_inscribed_property","sourceUrl":"https://whc.unesco.org/en/list/404/"},
  "location": {"buildingLat":null,"buildingLon":null,"siteLat":null,"siteLon":null,"verified":false,"coordinateSource":null},
  "photograph": {"localPath":null,"originalPageUrl":"https://commons.wikimedia.org/wiki/File:Parthenon,_Athens,_Greece.jpg","author":"DJDunsie","license":"CC BY 3.0","verifiedDepictsExactSubject":false},
  "model": {"localGlb":null,"originalPageUrl":"https://sketchfab.com/3d-models/parthenon-acropolis-athens-greece-d5cc54ccd57a4bdeb3c164a96c677b59","author":"Nick G. Gizelis","license":"CC BY","captureMethod":"drone-photogrammetry-from-video","knownDimensions":null,"technicalAccuracyVerified":false,"multiViewVisualQA":false},
  "moderation": {"unescoVerified":true,"rightsApproved":false,"photoApproved":false,"highFidelity3DApproved":false,"finalApproved":false,"reason":"Chưa tải, chưa kiểm tra đối tượng và chất lượng GLB"}
}
```

Các giá trị `false/null` trong mẫu là mặc định an toàn CHỜ KIỂM ĐỊNH, không phải kết quả phủ định nguồn. Chỉ đổi sang `true` sau khi đã có bằng chứng kiểm tra. Tách bảng `approved`, `rejected`, `pending`, có reason, nguồn, biên bản và timestamp.

YÊU CẦU BỘ LỌC CHUNG:
- `approvedUnescoLandmarks = registry.filter(x => x.moderation.finalApproved && isLocalAssetValid(x.model.localGlb) && isLocalAssetValid(x.photograph.localPath) && x.location.verified)`.
- Địa cầu, bản đồ, phòng UNESCO đều lấy từ đúng `approvedUnescoLandmarks`, không dùng danh sách 18 mục gốc hay toàn bộ UNESCO DataHub làm marker.
- Phòng tranh lấy danh sách `approvedRealObjects` với ảnh thật có phép + ít nhất 2D hoặc 3D có xác nhận; chỉ hiển thị các mode `approved`.
- Chức năng nhập thêm GLB/ảnh dành cho cô bằng giao diện, có xem trước và phê duyệt; không cần chỉnh mã.

## 5. CÁCH XỬ LÝ QUANG TRẮC / MÔ HÌNH CHẤT LƯỢNG CAO

Thứ tự ưu tiên:
A. **Mô hình quét hiện trạng đã công bố, có quyền tải/chỉnh/sử dụng** -> kiểm tra nguồn, tải đúng file, chuyển Blender->GLB nếu cần, đối chiếu ảnh đúng góc.
B. **Nhiều ảnh chụp có chồng lấp + đồng ý quyền sử dụng** -> Meshroom hoặc COLMAP + OpenMVS -> dense mesh -> texture -> sửa thủ công -> GLB.
C. **Bản vẽ kiến trúc/đo đạc đáng tin cậy** -> mô hình Blender tham số với kích thước truy nguyên, rõ thời kỳ phục dựng -> GLB, nhãn 'phục dựng theo tư liệu' (không gọi là scan).
D. **Duy nhất một ảnh hoặc mô hình AI ước đoán** -> KHÔNG XUẤT BẢN trong phòng 'chính xác'; lưu khu nghiên cứu nội bộ. Không suy diễn mặt khuất, màu vật liệu, hoa văn chỉ từ một mặt ảnh.

Quy trình thực thi mô hình:
1. Ghi file nguồn, checksum, license, tác giả, ngày truy cập, link, phiên bản.
2. Kiểm tra file tải có thực, có texture và UV; dựng preview nền trung tính đủ 4 hướng (front, back, left, right) + 2 hướng chéo, cùng camera tham chiếu ảnh nếu có.
3. Nếu là scan LiDAR, dùng phần mềm phù hợp để tạo mesh/texture; không nhúng toàn bộ raw dataset cỡ vài chục GB vào web. Không yêu cầu tải/cài Blender/Meshroom lên máy giáo viên nếu agent có thể xử lý nơi build; nếu thiếu tài nguyên, báo rõ blocker và giữ mục `pending`.
4. Tối ưu hóa decimation giữ silhouette, cạnh kiến trúc, chi tiết cửa/cột/mái; sử dụng LOD và texture WebP/KTX2 khi khả thi. Sau tối ưu phải so sánh với bản gốc/ảnh, tránh mất chi tiết.
5. Chạy glTF-Validator cho từng file, lưu report và lỗi còn lại; bảo đảm không bị đảo mặt, chiều trục, vỡ texture, Z-fighting.
6. Bài học Toán chỉ được gắn với đặc trưng thực sự hiện diện, ví dụ trục đối xứng xấp xỉ, hình chữ nhật trong mặt bằng, đối xứng kiến trúc. Không áp điều kiện 'đều' cho vật thể có sai lệch đo đạc.
7. Không hứa độ chính xác số đo khi thiếu ground truth. Đối chiếu nhiều góc + số liệu đo nếu có, ghi rõ mức độ chắc chắn (quét thực địa / theo bản vẽ / mô phỏng hình học / chưa kiểm chứng).

## 6. THIẾT KẾ MỸ THUẬT PHÒNG

- Kiến trúc phòng liên thông nhưng tách rành mạch, các cửa có nhãn Việt đúng; bố trí không gian và bệ cân bằng, không chắn lối đi, không clipping. Nếu cần nâng trần để vừa địa cầu, bố trí khu riêng. Có bảng sơ đồ tầng/phòng ở sảnh.
- Khuyến nghị nền đá sáng/gỗ trung tính, tường nhạt, chữ đậm rõ trên nền, kính hạn chế phản xạ mạnh, đèn rọi từng bệ không cháy sáng texture; soft shadows, ambient fill, tone mapping vừa phải, PBR được kiểm tra.
- Khung ảnh thật đúng tỉ lệ, có ghi tác giả/license, khi bấm mở panel đầy đủ không ép cắt mất chủ thể. Mô hình trưng bày ở tỷ lệ hài hòa với bệ (auto-fit AABB + chuẩn hóa), có OrbitControls hoặc tương đương trong panel, nút reset view.
- Trường hợp ảnh chụp công trình bị che/mất một phần, không tự tô vẽ những phần không thấy; thuyết minh cho biết mức độ thiếu.
- Lưu trạng thái camera khi mở panel, đóng trở lại phòng không bị kẹt/teleport sai. Cho cả người dùng máy tính và di động thao tác.

## 7. TỐI ƯU HIỆU NĂNG, PHỤ THUỘC VÀ GIẤY PHÉP

- Giữ Three.js và Node.js đang có. Không thêm 2 renderer và 2 scene loops chạy cùng lúc không cần thiết. Lazy-load GLB chỉ khi vào phòng/chọn vật thể. Dispose textures/materials/geometry đúng vòng đời. Có FPS meter debug và kiểm tra memory leak.
- Không ép cấu hình React/R3F vào dự án ES modules vanilla. Chọn module nhỏ nhất phù hợp, các package phải khóa version và README ghi giấy phép.
- Với Meshroom/COLMAP/OpenMVS cần GPU và ảnh nhiều góc: chỉ tạo pipeline nhập/kiểm định và chạy khi thực sự có dữ liệu, không nói 'đã chạy' khi không đủ tài nguyên.
- Bản đồ dùng nguồn geospatial có license; dữ liệu Natural Earth cho phép dùng rộng, OSM tile phải theo terms. Ảnh Commons cần kiểm tra từng file; dữ liệu Open Heritage CC BY-NC-SA không được dùng thương mại khi chưa được phép.
- Dự án cần chạy offline với các ảnh + GLB đã được tải và cấp phép phân phối; khi mạng mất, đừng để một iframe rỗng giả làm mô hình; hiện thông báo cụ thể nếu thiếu tài sản ngoài.

## 8. THỰC THI THEO GIAI ĐOẠN — PHẢI TẠO MÃ VÀ KIỂM TRA THẬT

**Giai đoạn 0 — Kiểm kê và sao lưu:** quét cấu trúc repo R97, manifest sha256, đánh giá dependency và test hiện hành. Ghi `R98_BASELINE_AUDIT.md`.

**Giai đoạn 1 — Tái cấu trúc phòng:** dựng lại sảnh/địa cầu, phòng bản đồ, phòng UNESCO, phòng tranh; điều hướng; bỏ mô hình bệ thô khỏi phòng chuẩn; giữ dữ liệu 40 tranh ở kho; chụp screenshot trước-sau.

**Giai đoạn 2 — Map + Globe đồng bộ:** natural earth/maplibre/globe + tọa độ chuẩn; cùng registry đã duyệt, có tìm/lọc/zoom/tương tác; kiểm chứng marker bằng vài tọa độ di sản thật từ nguồn chính thức.

**Giai đoạn 3 — Mô hình UNESCO thực tế:** bắt đầu thử tải Parthenon và kiểm định ảnh/mesh theo 3.1; có thể thêm An Định/Mỹ Sơn nếu dữ liệu đáp ứng. Nếu rào cản đăng nhập, GPU, license hay raw scan quá lớn thì phải giữ pending và ghi blocker; tuyệt đối không thay bằng hình chóp/dãy cột 'cho đủ số lượng'.

**Giai đoạn 4 — Phòng tranh trung thực:** kiểm định 40 ảnh/mô hình, hiển thị tập con thật sự đạt chuẩn; chọn đèn giao thông làm ca chuẩn 2D/3D và ảnh cùng kiểu mẫu, dựng hình có chi tiết nhìn thấy và các ràng buộc Toán hợp lý.

**Giai đoạn 5 — Kiểm thử thực và đóng gói:** test script, integration tests, giao diện 1920x1080, 1366x768 và điện thoại 390x844; kiểm tra lỗi console, texture, camera, tương tác, CORS, permissions, network fail; xuất video/screenshot chứng minh. Không bịa ảnh test.

## 9. NGHIỆM THU BẮT BUỘC

Chỉ báo 'đạt' khi đủ tiêu chí sau:

- [ ] R97 sao lưu trước sửa, có `R98_DIFF_MANIFEST.json`, SHA256 của file gốc, rollback hoạt động.
- [ ] Lab Toán 6–12, Museum, các trò chơi và công viên không suy giảm tính năng; smoke test và regression test hiện có được chạy, công khai pass/fail cùng lý do.
- [ ] Sảnh có một địa cầu 3D, bản đồ phẳng một gian riêng, phòng UNESCO GLB riêng, phòng tranh riêng; lối đi/điểm chuyển phòng hoạt động.
- [ ] Không còn mô hình `parthenon_columns_8x17.glb` xuất hiện như 'Đền Parthenon chính xác'; Borobudur dạng bậc đơn giản và Giza hình chóp thuần không được duyệt là 'công trình thực'.
- [ ] Địa cầu, bản đồ, phòng UNESCO lấy **cùng danh sách công trình đã duyệt**; mục không có GLB hoặc ảnh thật được kiểm định không có pin.
- [ ] Chọn một pin -> đúng ảnh cùng đối tượng, đúng công trình/địa điểm, thuyết minh chính xác, mô hình GLB tương ứng, nguồn/giấy phép rõ; vị trí pin khớp tọa độ kiểm chứng.
- [ ] Phòng UNESCO có **0 iframe Sketchfab**; mỗi GLB được kiểm tra glTF-Validator; thiếu tài sản phải chặn xuất bản.
- [ ] Có báo cáo định lượng: tổng mục thẩm định, được duyệt, đang chờ, bị loại, lý do theo từng mục. Không tự cho 'đạt' bằng đếm số mục.
- [ ] Phòng tranh hiển thị ảnh thực tế có nguồn, 2D/3D cùng đối tượng và lựa chọn mode hợp lệ; kiểm chứng đèn giao thông không chỉ là hộp chữ nhật + 3 hình trụ thô rời rạc.
- [ ] Không mất ảnh, tràn màn hình, chữ che mô hình, clipping bệ, camera xuyên tường; kiểm tra cả thao tác chuột/bàn phím và di động.
- [ ] Có screenshot thực tế UI từng phòng và panel đối chiếu ảnh-vs-3D (không phải mockup tự vẽ), report rõ môi trường và giới hạn máy test.
- [ ] Phát hành `MATHVERSE_R98_DISCOVERY_FIDELITY_FIRST_FULL.zip` và `MATHVERSE_R98_DISCOVERY_FIDELITY_FIRST_PATCH.zip` sau khi đạt điều kiện; kèm hướng dẫn 1-click cho cô và `README_R98_MO_DAU.md`.

## 10. ĐẦU RA PHẢI GIAO

Tạo trong workspace và trả về chính xác đường dẫn file thực tế:

1. `MATHVERSE_R98_DISCOVERY_FIDELITY_FIRST_FULL.zip` — toàn bộ mã + nguồn tài sản đã có phép + scripts cài chạy (không đưa các bộ raw LiDAR hàng chục GB vào ZIP).
2. `MATHVERSE_R98_DISCOVERY_FIDELITY_FIRST_PATCH.zip` — chỉ file thay đổi và script vá, kiểm tra checksum phiên bản R97 đầu vào.
3. `README_R98_MO_DAU.md` — ba bước cho giáo viên không biết code.
4. `R98_ASSET_PROVENANCE.json` — từng ảnh/GLB với file local, nguồn, tác giả, giấy phép, trạng thái kiểm định, checksum, mốc thu thập, cảnh báo.
5. `R98_REPOSITORY_AND_LICENSE_AUDIT.md` — repo đã khảo sát, gói đã dùng và giấy phép; giải thích vì sao không dùng những repo còn lại.
6. `R98_ACCURACY_REPORT.md` — nêu số mục đã duyệt/loại/chờ, trường hợp nào chỉ 'tư liệu' chứ chưa phải 3D đo đạc, phương pháp đối chiếu độ chính xác.
7. `R98_QA_REPORT.md` và screenshot trình duyệt/clip ngắn thật nếu ghi được; test được/môi trường không hỗ trợ phải ghi trung thực.
8. `R98_DIFF_MANIFEST.json`, rollback script, checklist kiểm tra 40 tranh nguồn và 18 mẫu UNESCO R97.

## 11. TIÊU CHÍ DỪNG / CHỐNG HOÀN THÀNH GIẢ

Nếu không tải được model hợp pháp, không có dữ liệu quang trắc/bản vẽ, không có GPU, không có quyền dùng ảnh, không kiểm thử được WebGL thì:
- Giữ ứng dụng chạy ổn định và các khu cơ bản, **không công bố hiện vật chưa đủ chuẩn**.
- Trả đúng những gì đã thực hiện kèm bằng chứng, liệt kê phần bị chặn và file/giấy phép/ảnh/góc chụp cần bổ sung.
- Không bịa kết quả, không tự chọn một mô hình khác na ná rồi cho 'chính xác'.
- Không dừng ở việc đưa ra kế hoạch: triển khai được phần nào thì sửa và kiểm thử phần đó ngay trong workspace.

**BẮT ĐẦU THỰC HIỆN:** Hãy rà mã nguồn R97, lập bảng kiểm kê chức năng đang có, so sánh hai ảnh lỗi Parthenon/Borobudur trong yêu cầu người dùng; sau đó sửa Discovery theo các giai đoạn và xuất báo cáo + ZIP nếu có thể. Mọi nhãn 'chính xác' chỉ được dùng khi tài sản đạt kiểm định bằng nguồn đo đạc hoặc scan có căn cứ.

---
*Prompt nghiên cứu & soạn theo các nguồn công khai truy cập ngày 06/11/2026. Nội dung này là chỉ dẫn triển khai; không chứng minh rằng R98 đã được tích hợp hoặc rằng các 3D ứng viên đã được tải về.*
