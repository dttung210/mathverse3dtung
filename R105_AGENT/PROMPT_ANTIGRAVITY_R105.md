# ANTIGRAVITY AGENT – THỰC THI CẬP NHẬT MATHVERSE R105
## NẠP MÔ HÌNH SKETCHFAB GLB THẬT LÊN BỤC GIỐNG PARTHENON – KHÔNG BẮT GIÁO VIÊN LẬP TRÌNH

**Vai trò của bạn:** kỹ sư Antigravity thực thi trong IDE với quyền truy cập Workspace, Terminal, trình duyệt; am hiểu Three.js / GLTFLoader, glTF-Transform, Sketchfab OAuth Download API, bản quyền, photogrammetry và giáo dục Toán. Đây là nhiệm vụ **thực thi**, không phải chỉ đề xuất hay tạo prompt mới.

**Người dùng:** giáo viên Toán không biết lập trình; người dùng chỉ cần cung cấp mô tả, duyệt quyền đăng nhập Sketchfab *khi hệ thống chính thức yêu cầu*, rồi nhận kết quả. Bạn tự tạo và chạy lệnh/đoạn mã trong Agent, tự xử lý ZIP/glTF/GLB và kiểm thử. Tuyệt đối không yêu cầu người dùng tự chỉnh mã, tự nhập token vào chat hoặc tự đi tìm file GLB.

## I. KHỞI ĐỘNG VÀ BẢO TOÀN BẢN GỐC

1. Làm việc trên **chính thư mục MATHVERSE R105** đang mở, được cập nhật trực tiếp từ ZIP `MATHVERSE_R104_GLB_TREN_BUC_FULL.zip` giáo viên đã cung cấp. KHÔNG tạo dự án app/demo mới, KHÔNG lấy bộ R99/R100 cũ để thay thế.
2. Đọc trước: `00_DOC_TRUOC_KHI_CAP_NHAT_R105.md`, `R105_AGENT/DANH_MUC_NGUON_9_BUC.md`, `R105_AGENT/BAO_CAO_TRANG_THAI.json`, `tools/r105-sketchfab-pipeline.mjs`, `dual/discovery-r102/catalog.mjs`, `dual/discovery-r102/exhibition-room.mjs`, `dual/discovery-r98/fidelity-world.mjs`, `dual/discovery-r98/scan-loader.mjs`, `dual/discovery-r100/wonders-ui.mjs`, `dual/discovery-r97/world-map-ui.mjs`, `dual/app.mjs`, `server/host.mjs`.
3. Sao lưu thư mục dự án và SHA256 tất cả file `.glb` có sẵn; đặc biệt GLB **Parthenon R98 không được thay thế hay chỉnh sửa**: `dual/discovery-r98/assets/unesco_parthenon_glb.glb`.
4. Giữ tất cả Lab Toán 6–12, 310 mô hình, Museum, Công viên, trò chơi, phòng tranh, 18 điểm địa cầu/bản đồ, kiến trúc ba khu Discovery và giao diện modal R100 đã ổn định.
5. Không xóa lịch sử hay thay đổi thư mục khác không liên quan; giữ bản sao file cũ khi sửa. Không đảo ngược logic R104 GLB-first: mô hình hình học minh họa phải nằm trên bục nếu chưa có model thật, không để bục trống.

## II. QUY TẮC HÌNH 3D TRỰC TIẾP TRÊN BỤC

**Lấy Parthenon GLB R98 làm tiêu chuẩn kỹ thuật.** Mỗi bục được duyệt phải tải được **mesh + texture GLB/gltf gốc** của đúng công trình vào `THREE.Scene`, có tên, tác giả, license, nguồn rõ ràng; thiết lập `Box3` để căn tâm/đặt đáy trên bệ và tỷ lệ vừa phòng. Kéo chuột xoay mesh trực tiếp, không bị xoay cả nhân vật.

- `Sketchfab iframe/Viewer API` chỉ là trình xem mô hình, **KHÔNG phải mesh trong Three.js**. Không đưa một khung iframe nổi vào vị trí bệ rồi báo đã đạt chuẩn Parthenon.
- Trong R105, `dual/discovery-r102/exhibition-room.mjs` đã có cơ chế `installNativeGLB()` thay bản minh họa khi file hợp lệ và `dual/discovery-r103/assets/approved-local-models.json` tự nạp lúc khởi chạy. HÃY SỬ DỤNG CƠ CHẾ NÀY, không viết lại toàn bộ cảnh.
- Nếu thiếu quyền tải chính thức: để nguyên bệ minh họa **có nhãn “HÌNH HỌC MINH HỌA”**, không đánh tráo là quang trắc. Giữ model Sketchfab ở tab xem chi tiết, tìm tiếp nguồn hợp pháp khác của đúng công trình.
- Mỗi nguồn cần phân loại: `photogrammetry`, `architectural_reconstruction`, `artistic_reconstruction`, `geometry_educational`. Không gọi tượng Zeus hoặc Colossus Rhodes nguyên bản thất lạc là scan thực tế.

## III. TỰ TÌM VÀ TẢI HỢP PHÁP CÁC MÔ HÌNH

Mở `R105_AGENT/DANH_MUC_NGUON_9_BUC.md`: có **9 ứng viên** được trích đúng từ mã R104. Chỉ dùng làm điểm bắt đầu; phải mở từng trang và xác minh có đúng địa danh/công trình, license, tác giả, quyền tải, chất lượng lưới/texture. Đối chiếu ảnh hiện trạng, nguồn khoa học, độ đầy đủ và góc nhìn. Khi model ban đầu không đạt hoặc bị tắt tải, tìm mô hình thay thế đúng địa điểm tại Sketchfab, UNESCO/đơn vị khảo cổ, CyArk, OpenHeritage3D hoặc kho công khai khác có giấy phép; tuyệt đối không đổi di tích khác thành tên công trình mong muốn.

**Quy trình dành cho Agent (không yêu cầu giáo viên gõ lệnh):**

1. Chạy `npm run audit:r105` – nhận báo cáo 9 bục hiện đã có GLB bản địa hay chỉ mới Sketchfab link.
2. Chạy `node tools/r105-sketchfab-pipeline.mjs --inspect <id>` (có thể đọc metadata công khai). So sánh `model.name`, `uid`, `user`, `license`, `isDownloadable` và URL với mô hình cụ thể. Lưu kết quả vào báo cáo nghiên cứu.
3. Nếu có quyền: dùng **OAuth Sketchfab chính thức** theo `https://sketchfab.com/developers/oauth`; đăng nhập/ủy quyền qua cửa sổ trình duyệt riêng của giáo viên nếu bắt buộc. Không yêu cầu giáo viên cung cấp tên đăng nhập, mật khẩu, token vào đoạn chat. Không lưu access token trong ZIP, log, ảnh, mã nguồn hay manifest.
4. Khi có token OAuth ở **biến môi trường tiến trình riêng** `SKETCHFAB_OAUTH_ACCESS_TOKEN`, chạy `node tools/r105-sketchfab-pipeline.mjs --fetch <id> --confirm-reviewed` chỉ sau khi đã đối chiếu đúng model và license. Lệnh sẽ gọi `GET https://api.sketchfab.com/v3/models/{uid}/download`, tải archive glTF bằng URL tạm thời chính thức, giải nén an toàn và chuyển glTF sang GLB bằng `@gltf-transform/cli` nếu cần, kiểm tra GLB và lưu vào `dual/discovery-r103/assets`.
5. Nếu `npx @gltf-transform/cli` chưa có hoặc bị lỗi Internet, Agent tự cài dependency chuyên dụng/tương thích, sửa lệnh chuyển đổi. Không bắt giáo viên cài Python hay thao tác file ZIP thủ công. Nếu dùng GLB được cung cấp trực tiếp từ nguồn khác, phải đối chiếu quyền sử dụng, xác thực chữ ký glTF/GLB, kiểm tra texture và đăng ký manifest đầy đủ.
6. Với GLB hợp pháp, manifest phải ghi ít nhất `id`, `file`, `author`, `license`, `sourceURL`, `modelUid`, `sha256`, `verifiedWebGL`; nếu `verifiedWebGL=false`, cần mở app kiểm định trước khi đổi thành true. Không tự tuyên bố đã kiểm định WebGL khi chưa nhìn mô hình thực tế.
7. Sau mỗi công trình, chạy `npm run verify:r105` và thử load model ở bục thực trên Chrome/Edge. Đánh giá mật độ mesh, màu, texture, clipping, scale, đáy vật thể, FPS và các màn hình 1366×768, 1920×1080.
8. Tác giả và giấy phép phải hiển thị trong hồ sơ chi tiết và trên bục (R105 đã chuẩn bị khung ghi nguồn). Không tự gán license CC BY khi nguồn chưa xác nhận. Cân nhắc điều kiện SA/NC/ND trước khi xuất ZIP; công cụ tự động từ chối license không rõ hoặc bị hạn chế, cần đối chiếu thủ công đúng quy định.
9. Chỉ đưa **GLB thực sự có quyền phân phối lại** vào ZIP phát hành. GLB chỉ được cấp phép xem trong một môi trường thì giữ trên máy chủ/ngữ cảnh được phép, không đóng gói trái quyền.

**Không được bypass Download API, copy trái phép tệp 3D từ cache trình duyệt, vượt OAuth/DRM hoặc giả mạo license.** Nếu tài khoản không có quyền tải, ghi `KHÔNG ĐƯỢC TẢI`, tiếp tục tìm model khác được phép.

## IV. ƯU TIÊN 9 BỤC TRONG PHÒNG

**Khu 1: di sản thế giới UNESCO** – Giza (đúng Kim tự tháp Khufu), đền Artemis tại Ephesus (không thay bằng đền ở Sardis) và giữ riêng Parthenon R98 GLB thật.

**Khu 2: New7Wonders 2007** – Colosseum (ưu tiên photogrammetry có đủ hệ vòm và texture), Chichén Itzá/El Castillo (đúng địa điểm), Taj Mahal (cổng/vòm và bốn tháp góc).

**Khu 3: kiến trúc hình học khác** – Tháp đôi Petronas (hai tháp + cầu trên không), Louvre Pyramid, cầu Golden Gate (cáp treo và trụ cầu), Gateway Arch (catenary không phải parabol).

Không thêm tất cả 14 kỳ quan vào phòng khi không có bài học hình học rõ ràng. **Địa cầu/bản đồ giữ 18 điểm** theo ba màu đã có. UNESCO World Heritage và New7Wonders là hai hệ thống danh hiệu khác nhau; không gọi New7Wonders là do UNESCO bình chọn.

## V. TƯỢNG ZEUS VÀ RHODES (KHÔNG TỰ Ý ĐỔI NỘI DUNG)

- **Zeus:** giữ mô hình Sketchfab tượng Zeus do R104 đã có UID `3ef14e973af8440c8fa34bfeee6da3e0`; ảnh trái là di tích Olympia hiện nay. Đây là tái hiện tượng cổ đã mất; không thay bằng mô hình toàn khu Olympia và không tự động cấm theo cảm tính.
- **Rhodes:** giữ mô hình tượng Colossus từ Sketchfab UID `011ee3d4483448b4abac63969bcfc475`. **Chỉ ảnh bên trái** dùng phong cảnh cảng Mandraki ngày nay có nguồn Wikimedia Commons, không đổi tượng bên phải thành cảnh quan đảo. Vị trí chân tượng cổ là điều còn tranh luận; ghi nguồn và mức độ chắc chắn.
- Cả hai vẫn nằm trong địa cầu/bản đồ. Không tự đưa tượng vào phòng hình học nếu không thuộc danh sách bệ được giáo viên chọn.

## VI. GIAO DIỆN VÀ TƯƠNG TÁC

- Giữ **giao diện R100 hai cột màu xanh đậm** (`r100-window`, `r100-media-grid`, `r100-list`, `r100-details`, `r100-viewer`), không phát minh modal R101 không có CSS tương ứng.
- Ở **bục UNESCO**: model GLB thật trong Three.js luôn nhìn thấy, có thể rê chuột để xoay mà không cần nhấn PLAY. Nếu chỉ có minh họa, ghi nhãn công khai. Bấm **E**/Xem mới mở ảnh thật, tiểu sử, tab Sketchfab, tab Hình học 3D và tab Hình 2D cùng công thức LaTeX.
- Ở **địa cầu/bản đồ**: bấm chấm sẽ mở ảnh thực tế + tiểu sử + Sketchfab tương ứng. **KHÔNG** hiện nút chuyển vào phòng UNESCO hoặc tab hình học 2D/3D. Bảo toàn các loại pin màu và điều khiển bản đồ hiện có.
- Điều khiển FPS/WASD không đánh nhau với điều khiển chuột mô hình khi tương tác; giải phóng GPU/texture của model cũ, tránh load đồng thời nhiều model >200 MB.
- Với GLB bản địa cần có caption ghi nguồn Sketchfab/đơn vị cung cấp và giấy phép trong phòng, không phủ khung tương tác iframe lên bục.

## VII. KIỂM THỬ, MINH CHỨNG VÀ PHÁT HÀNH

1. Chạy `npm run test:r105`, `npm run audit:r105`, `npm run verify:r105`; chạy `node --check` cho các tệp thay đổi.
2. Khởi động qua `00_MO_MATHVERSE_R105.bat` trên Windows và kiểm tra các endpoint `server/host.mjs`, `dual/app.mjs`, module Gallery, `approved-local-models.json` và asset Parthenon.
3. Kiểm chứng GLB Parthenon vẫn giữ nguyên SHA256. Các bệ chỉ dùng GLB mới khi đã được tải qua nguồn và có manifest; nguồn chưa có không báo là đã tải.
4. Dùng trình duyệt có WebGL để **chụp ảnh trước/sau** của Parthenon, Colosseum, Giza, Taj Mahal, Petronas; chụp thêm ít nhất một mô hình GLB đã tải và tình trạng ảnh/caption. Không giả ảnh QA.
5. Rà Lab Toán 6–12, Museum, Công viên, phòng tranh, 18 điểm bản đồ/địa cầu; không phá những phần đang ổn định.
6. Xuất `R105_AGENT/BAO_CAO_NGHIEM_THU.md` phân loại TỪNG công trình: `NATIVE_GLB_CÓ_PHÉP`, `SKETCHFAB_EMBED_ONLY`, `MÔ_HÌNH_GIÁO_DỤC`, `KHÔNG_CÓ_NGUỒN`; dẫn link kiểm định và ghi lý do các mô hình chưa tích hợp.
7. Đóng gói ZIP dự án mới + ZIP bản vá + một file BAT chính + tài liệu nguồn/giấy phép + ảnh kiểm định thật. Không ghi token/temporary URLs vào ZIP. Giữ mẫu Parthenon và toàn bộ tính năng cũ.

**YÊU CẦU CUỐI:** Hãy THỰC HIỆN trong workspace MATHVERSE đang mở. Bạn chỉ hỏi giáo viên thao tác xác thực tài khoản khi nhà cung cấp thật sự yêu cầu; mọi bước lập trình, tải archive hợp lệ, chuyển đổi GLB, chỉnh sửa source và kiểm thử khác do Agent tự làm. Không kết luận "9/9 GLB đã tích hợp" khi thực tế manifest chưa có đủ 9 file GLB được kiểm định.
