# BÁO CÁO NGHIỆM THU KỸ THUẬT & PHÁP LÝ – MATHVERSE R105

**Ngày thực thi & nghiệm thu:** 2026-11-07  
**Thực thi bởi:** Antigravity Agent (tự động khảo sát API, tải hợp pháp, kiểm định lưới 3D/WebGL, chụp ảnh Trước/Sau và đóng gói)  
**Thư mục dự án gốc:** `MATHVERSE_R105_SKETCHFAB_GLB_ANTIGRAVITY` (cập nhật trực tiếp từ bản R104/R105 của giáo viên)

---

## 1. TỔNG QUAN KẾT QUẢ THỰC THI

1. **Tổng số bục trong Phòng Triển lãm UNESCO 3D:** **10 bục** (gồm **1 bục Parthenon R98 nguyên bản** + **9 bục kiến trúc R102–R105** chia thành 3 khu vực tường Tây, Nam, Đông).
2. **Số bục đã nạp mô hình `.glb` thật (`NATIVE_GLB_CÓ_PHÉP` / `GLB_DA_DUYET_WEBGL`):**
   - **8 / 9 bục mới** trong `dual/discovery-r103/assets/` + **1 bục Parthenon R98** (`dual/discovery-r98/assets/unesco_parthenon_glb.glb`) = **9 / 10 bục trong phòng có mô hình GLB thật trong `THREE.Scene`**.
   - Tất cả 8 mô hình GLB mới đều có giấy phép mở **Creative Commons Attribution 4.0 (`CC BY 4.0`)**, cho phép tải về, chuyển đổi sang `.glb`, tích hợp trực tiếp vào `THREE.Scene` và phân phối lại hợp pháp kèm ghi công tác giả.
3. **Số bục giữ mô hình hình học minh họa (`MÔ_HÌNH_GIÁO_DỤC` + `SKETCHFAB_EMBED_ONLY`):**
   - **1 / 9 bục (`wonder_artemis` – Đền Artemis ở Ephesus)**: Giữ nguyên mô hình hình học giáo dục 3D trực tiếp trên bục với nhãn công khai **`HÌNH HỌC MINH HỌA · 3D TRỰC TIẾP`** và giữ trình xem Sketchfab (`81923b64d79b4c31b195444dc714b92b` của `WelsEvil`) trong hộp thoại chi tiết.
   - **Lý do minh bạch:** Mô hình `81923b64d79b4c31b195444dc714b92b` của `WelsEvil` đặt `isDownloadable: false` trên Sketchfab API; các mô hình tải được khác trên Sketchfab hoặc chỉ là 1 cột trụ đơn lẻ ở bảo tàng, hoặc là Đền Artemis tại **Sardis** (sai địa danh lịch sử), hoặc là khối địa hình trò chơi (`1365304cc714446984d1e1e6c2e4910b` – đã loại bỏ khi kiểm định). Tuân thủ nghiêm ngặt quy tắc R105: **tuyệt đối không thay thế bằng di tích khác (như Sardis) và không đánh tráo mô hình lỗi**.
4. **Bảo toàn tuyệt đối Parthenon R98:**
   - File: `dual/discovery-r98/assets/unesco_parthenon_glb.glb`
   - Dung lượng: `28,399,340` bytes
   - SHA256: `e4b5091373259e067373630a3af4828c799e6cb3677dc2b28ac88c31b322562d` (khớp 100% trước và sau khi cập nhật).

---

## 2. BẢNG PHÂN LOẠI & NGHIỆM THU CHI TIẾT 10 BỤC TRONG PHÒNG + 2 KỲ QUAN CỔ ĐẠI ĐẶC BIỆT

| STT | Mã (`id`) | Công trình | Khu vực | Trạng thái nghiệm thu | Phân loại khoa học | UID Sketchfab | Tác giả | Giấy phép | Số tam giác | Dung lượng `.glb` | SHA256 (`.glb`) | WebGL 1080p & 768p |
|---|---|---|---|---|---|---|---|---|---:|---:|---|---|
| 0 | `unesco_parthenon` | Đền Parthenon (Acropolis, Athens) | Khu 1 – UNESCO (Tường Tây) | **`NATIVE_GLB_CÓ_PHÉP`** *(Chuẩn gốc R98)* | `photogrammetry` | *(Bản gốc R98)* | Bảo toàn nguyên trạng R98 | Curation R98 | Chuẩn R98 | 28,399,340 B | `e4b5091373259e067373630a3af4828c799e6cb3677dc2b28ac88c31b322562d` | Đạt (`verifiedWebGL: true`) |
| 1 | `wonder_giza` | Đại kim tự tháp Giza (Khufu) | Khu 1 – UNESCO (Tường Tây) | **`NATIVE_GLB_CÓ_PHÉP`** (`GLB_DA_DUYET_WEBGL`) | `photogrammetry` | `4a251113722f4d969b6cf2ca5f35c502` | `ianicolo` | `CC BY 4.0` | 360,321 | 14,860,088 B | `e0eb4501bafc5e5391091e16e0cc608f78cee772eaa1f87d3c4b5dcdd9f93a9b` | Đạt (`verifiedWebGL: true`) |
| 2 | `wonder_artemis` | Đền Artemis ở Ephesus | Khu 1 – UNESCO (Tường Tây) | **`MÔ_HÌNH_GIÁO_DỤC` + `SKETCHFAB_EMBED_ONLY`** | `architectural_reconstruction` / `geometry_educational` | `81923b64d79b4c31b195444dc714b92b` | `WelsEvil` (embed) / R104 Dipteral Ionic (bục) | Standard License (Không cho tải GLB) | 126+ meshes (Preview 3D) | *(Giữ preview R104)* | *(Không đóng gói GLB trái phép)* | Đạt (Nhãn `HÌNH HỌC MINH HỌA · 3D TRỰC TIẾP`) |
| 3 | `wonder_colosseum` | Đấu trường Colosseum | Khu 2 – New7Wonders 2007 (Tường Nam) | **`NATIVE_GLB_CÓ_PHÉP`** (`GLB_DA_DUYET_WEBGL`) | `photogrammetry` | `6f1383bb894a4f8fb289fb6777688d68` | `PanagiotaGalli` | `CC BY 4.0` | 203,472 | 7,982,120 B | `f7f488b08c253f977cabad5c61cf2d454648add7e831d736334c77a81d67aa88` | Đạt (`verifiedWebGL: true`) |
| 4 | `wonder_chichen` | Chichén Itzá (El Castillo) | Khu 2 – New7Wonders 2007 (Tường Nam) | **`NATIVE_GLB_CÓ_PHÉP`** (`GLB_DA_DUYET_WEBGL`) | `architectural_reconstruction` | `4bb4247ccc5740b8a5e1db834a62d1a1` | `DavidOrdonez` | `CC BY 4.0` | 28,496 | 4,201,068 B | `24ad850241d5fc796b97d71e4a4c43f6f3a0ea95d9848416c918c2a1270b5344` | Đạt (`verifiedWebGL: true`) |
| 5 | `wonder_taj` | Lăng Taj Mahal | Khu 2 – New7Wonders 2007 (Tường Nam) | **`NATIVE_GLB_CÓ_PHÉP`** (`GLB_DA_DUYET_WEBGL`) | `architectural_reconstruction` | `5288bc889477472a889345e085931e1c` | `Sahistaja` | `CC BY 4.0` | 583,742 | 44,698,352 B | `b66b3856f409bc8d7d6e3fbd87ad5dccde65e4e2715536f49505872f9fd25846` | Đạt (`verifiedWebGL: true`) |
| 6 | `other_petronas` | Tháp đôi Petronas | Khu 3 – Kiến trúc hình học (Tường Đông) | **`NATIVE_GLB_CÓ_PHÉP`** (`GLB_DA_DUYET_WEBGL`) | `architectural_reconstruction` | `4111f3de53f24ab0a9547205723665b1` | `NanoRay` | `CC BY 4.0` | 47,772 | 1,854,460 B | `3739ad4444330c151614b80ea65773726acf28b8f2089a98b060a5072f5aa29b` | Đạt (`verifiedWebGL: true`) |
| 7 | `other_louvre` | Kim tự tháp kính Louvre | Khu 3 – Kiến trúc hình học (Tường Đông) | **`NATIVE_GLB_CÓ_PHÉP`** (`GLB_DA_DUYET_WEBGL`) | `architectural_reconstruction` | `95b6b33f6a85407d854397640e9875f0` | `Le FabShop` | `CC BY 4.0` | 11,648 | 960,756 B | `d4059581ce025074b44c3725c276aab58ace177e3ed14d06039ca6f82eca2909` | Đạt (`verifiedWebGL: true`) |
| 8 | `other_golden_gate` | Cầu Golden Gate | Khu 3 – Kiến trúc hình học (Tường Đông) | **`NATIVE_GLB_CÓ_PHÉP`** (`GLB_DA_DUYET_WEBGL`) | `architectural_reconstruction` | `a0ee5a9c285849c0819af5f366be3835` | `JuanG3D` | `CC BY 4.0` | 159,902 | 4,115,812 B | `7d26eeeef99ee3cf7590e42c2f31c4709ac30964e7a10492dfb8a474dc5c17af` | Đạt (`verifiedWebGL: true`) |
| 9 | `other_gateway` | Cổng vòm Gateway Arch | Khu 3 – Kiến trúc hình học (Tường Đông) | **`NATIVE_GLB_CÓ_PHÉP`** (`GLB_DA_DUYET_WEBGL`) | `architectural_reconstruction` | `5015279eea634a0aa2822103c8e52fcd` | `joseph.e.mathis` | `CC BY 4.0` | 101,704 | 20,377,396 B | `318d23f50e4d21efcfe7fdaeef2bdac28fa10d77270e0b326abd7f5e40598c60` | Đạt (`verifiedWebGL: true`) |
| 10 | `wonder_zeus` | Tượng thần Zeus ở Olympia | Bản đồ & Địa cầu (Không đặt bục phòng) | **`SKETCHFAB_EMBED_ONLY`** *(Giữ nguyên chuẩn R104)* | `artistic_reconstruction` | `3ef14e973af8440c8fa34bfeee6da3e0` | `Discover` | Embed Sketchfab | — | — | — | Đạt (`modal_zeus_1920x1080.png`) |
| 11 | `wonder_colossus` | Tượng thần Mặt Trời ở Rhodes | Bản đồ & Địa cầu (Không đặt bục phòng) | **`SKETCHFAB_EMBED_ONLY`** *(Giữ nguyên chuẩn R104 + ảnh cảng Mandraki CC0)* | `artistic_reconstruction` | `011ee3d4483448b4abac63969bcfc475` | `Christopher.R.F` | Embed Sketchfab + Ảnh CC0 Jebulon | — | — | — | Đạt (`modal_colossus_rhodes_1920x1080.png`) |

---

## 3. NHẬT KÝ ĐỐI CHIẾU NGUỒN ỨNG VIÊN R104 VÀ THAY THẾ HỢP PHÁP

1. **`wonder_giza` (Đại kim tự tháp Giza – Khufu):**
   - Ứng viên R104 (`4a251113722f4d969b6cf2ca5f35c502` bởi `ianicolo`): Kiểm tra API xác nhận `isDownloadable: true`, giấy phép `CC BY 4.0`. Đã tải bản gốc, kiểm định 360,321 tam giác + texture đầy đủ, tích hợp lên bục.
2. **`wonder_artemis` (Đền Artemis ở Ephesus):**
   - Ứng viên R104 (`81923b64d79b4c31b195444dc714b92b` bởi `WelsEvil`): Kiểm tra API cho thấy `isDownloadable: false`.
   - Khảo sát các nguồn `CC BY` khác trên Sketchfab: model `1365304cc714446984d1e1e6c2e4910b` khi dựng bằng `GLTFLoader` là khối địa hình Minecraft, không phải kiến trúc đền Hy Lạp; các model khác là Đền Artemis tại Sardis hoặc chỉ có 1 mảnh cột vỡ. Do đó, giữ nguyên mô hình hình học giáo dục Dipteral Ionic 3D trực tiếp trên bục với bảng trạng thái **`HÌNH HỌC MINH HỌA · 3D TRỰC TIẾP`** và giữ embed `WelsEvil` trong modal chi tiết.
3. **`wonder_colosseum` (Đấu trường Colosseum):**
   - Ứng viên R104 (`4577eb4b21ac48ecba43e7944b4e1baf` bởi `eyesCloud3D`): `isDownloadable: false`.
   - Đã thay thế bằng bản quang trắc thực tế (`photogrammetry`) hợp pháp: **"Colosseo di Roma"** (`6f1383bb894a4f8fb289fb6777688d68` bởi `PanagiotaGalli`, giấy phép `CC BY 4.0`, 203,472 tam giác, đầy đủ hệ vòm elip 4 tầng và mặt đất xung quanh).
4. **`wonder_chichen` (Chichén Itzá – El Castillo):**
   - Ứng viên R104 (`1624b224a7514762baf9025e6fe7dc4f` bởi `CyArk`): Giấy phép `CC BY-NC-ND 4.0` (cấm phái sinh/phân phối thương mại, bị bộ lọc pháp lý R105 từ chối tự động).
   - Đã thay thế bằng mô hình tái dựng kiến trúc (`architectural_reconstruction`) hợp pháp: **"Low Poly-Chichén Itzá"** (`4bb4247ccc5740b8a5e1db834a62d1a1` bởi `DavidOrdonez`, giấy phép `CC BY 4.0`, 28,496 tam giác, thể hiện rõ 9 tầng bậc thang và 4 cầu thang dẫn lên đền đỉnh).
5. **`wonder_taj` (Lăng Taj Mahal):**
   - Ứng viên R104 (`1eb09052f6cd421caeaa6cb3204cb15d` bởi `Dinendra Neyo`): `isDownloadable: false`.
   - Trong quá trình kiểm định bằng mắt qua Three.js WebGL, phát hiện ứng viên `d2c762a2325547c5b30e51bdfd736188` ("IndianMAN Geometre-100") là mô hình quét người đo đạc chứ không phải Taj Mahal nên đã loại bỏ ngay.
   - Đã chọn và kiểm định mô hình **"Taj Mahal"** (`5288bc889477472a889345e085931e1c` bởi `Sahistaja`, giấy phép `CC BY 4.0`, 583,742 tam giác, đầy đủ mái vòm củ hành trung tâm, khối đế vuông đối xứng và 4 tháp minaret ở 4 góc).
6. **`other_petronas` (Tháp đôi Petronas):**
   - Ứng viên R104 (`4111f3de53f24ab0a9547205723665b1` bởi `NanoRay`): Kiểm tra API xác nhận `isDownloadable: true`, giấy phép `CC BY 4.0`. Đã tải và tích hợp mô hình (47,772 tam giác, đầy đủ hai tháp Rub el Hizb và cầu nối Skybridge).
7. **`other_louvre` (Kim tự tháp kính Louvre):**
   - Ứng viên R104 (`6130243bcfda400ebb4475358cd73a5d` bởi `print3deasy`): `isDownloadable: false`.
   - Đã thay thế bằng mô hình **"Pyramide Du Louvre Mini"** (`95b6b33f6a85407d854397640e9875f0` bởi `Le FabShop`, giấy phép `CC BY 4.0`, 11,648 tam giác, thể hiện rõ hệ khung mắt cáo kim tự tháp đáy vuông và các kim tự tháp vệ tinh).
8. **`other_golden_gate` (Cầu Golden Gate):**
   - Ứng viên R104 (`0f1bf2d780ad4cb6b4e0f4c650f6cdfc` bởi `damongraphics`): `isDownloadable: false`.
   - Đã thay thế bằng mô hình **"Golden Gate Bridge"** (`a0ee5a9c285849c0819af5f366be3835` bởi `JuanG3D`, giấy phép `CC BY 4.0`, 159,902 tam giác, màu đỏ cam International Orange đặc trưng, đầy đủ 2 tháp treo, cáp chính parabol và dây treo thẳng đứng).
9. **`other_gateway` (Cổng vòm Gateway Arch):**
   - Ứng viên R104 (`5015279eea634a0aa2822103c8e52fcd` bởi `joseph.e.mathis`): Kiểm tra API xác nhận `isDownloadable: true`, giấy phép `CC BY 4.0`. Đã tải và tích hợp mô hình (101,704 tam giác, thể hiện chính xác vòm dây xích phẳng tự đứng `y = A - B cosh(Cx)` cùng khuôn viên sông Mississippi).

---

## 4. KẾT QUẢ KIỂM ĐỊNH TRÌNH DUYỆT WEBGL THỰC TẾ & HIỆU NĂNG (FPS)

- **Công cụ kiểm định:** Microsoft Edge / Chromium Headless với GPU phần cứng, chạy trực tiếp trên máy chủ nội bộ `node server/host.mjs` (`http://127.0.0.1:4190`).
- **Tất cả 17 đường dẫn HTTP quan trọng:** Đều trả về `HTTP 200 OK` (bao gồm `/dual/index.html`, `/dual/app.mjs`, `/dual/discovery-r98/assets/unesco_parthenon_glb.glb`, `/dual/discovery-r103/assets/approved-local-models.json` và toàn bộ 8 file `.glb` trong `/dual/discovery-r103/assets/`).
- **Lỗi Console / PageError:** `0` lỗi (`pageErrors: []`).
- **Tốc độ khung hình (FPS) trong Phòng Triển lãm UNESCO 3D khi nạp đồng thời Parthenon + 8 GLB mới + 1 mô hình giáo dục:**
  - Ở độ phân giải `1920×1080`: **57.8 – 64.9 FPS** (trung bình ~60 FPS).
  - Ở độ phân giải `1366×768`: **49.6 – 78.9 FPS** (trung bình ~62 FPS).
- **Tương tác chuột trực tiếp trên bục:** Đã kiểm thử kéo xoay trực tiếp từng mesh trên bục (`nativeDragId = discovery.pickNativeModel`, `discovery.rotateNativeModel`) mà không xoay nhân vật và không dùng bất kỳ `iframe` nổi nào trên bệ.

### Danh mục 40 ảnh chụp nghiệm thu trong `R105_AGENT/qa_screenshots/`
- **Ảnh Trước khi nạp GLB (`1920×1080`):** `before_wonder_giza_1920x1080.png`, `before_wonder_artemis_1920x1080.png`, `before_wonder_colosseum_1920x1080.png`, `before_wonder_chichen_1920x1080.png`, `before_wonder_taj_1920x1080.png`, `before_other_petronas_1920x1080.png`, `before_other_louvre_1920x1080.png`, `before_other_golden_gate_1920x1080.png`, `before_other_gateway_1920x1080.png`, `before_unesco_parthenon_1920x1080.png`.
- **Ảnh Sau khi nạp GLB (`1920×1080`):** `after_wonder_giza_1920x1080.png`, `after_wonder_artemis_1920x1080.png`, `after_wonder_colosseum_1920x1080.png`, `after_wonder_chichen_1920x1080.png`, `after_wonder_taj_1920x1080.png`, `after_other_petronas_1920x1080.png`, `after_other_louvre_1920x1080.png`, `after_other_golden_gate_1920x1080.png`, `after_other_gateway_1920x1080.png`, `after_unesco_parthenon_1920x1080.png`.
- **Ảnh Sau khi nạp GLB (`1366×768`):** `after_wonder_giza_1366x768.png`, `after_wonder_artemis_1366x768.png`, `after_wonder_colosseum_1366x768.png`, `after_wonder_chichen_1366x768.png`, `after_wonder_taj_1366x768.png`, `after_other_petronas_1366x768.png`, `after_other_louvre_1366x768.png`, `after_other_golden_gate_1366x768.png`, `after_other_gateway_1366x768.png`, `after_unesco_parthenon_1366x768.png`.
- **Ảnh Hộp thoại R100 & Bảo toàn hệ thống (`1920×1080`):**
  - `modal_colosseum_sketchfab_1920x1080.png`, `modal_colosseum_3d_1920x1080.png`, `modal_colosseum_2d_1920x1080.png`
  - `modal_zeus_1920x1080.png`, `modal_colossus_rhodes_1920x1080.png`
  - `discovery_globe_foyer_1920x1080.png`, `discovery_world_map_18_pins_1920x1080.png`, `discovery_painting_gallery_1920x1080.png`
  - `museum_infographic_1920x1080.png`, `wonder_park_1920x1080.png`

---

## 5. KẾT QUẢ CHẠY BỘ KIỂM THỬ TỰ ĐỘNG (`KET_QUA_TEST_R105.txt`)

- `npm run audit:r105`: **PASS** (8 `GLB_DA_DUYET_WEBGL`, 1 `SKETCHFAB_CHUA_CO_GLB` cho `wonder_artemis`).
- `npm run verify:r105`: **PASS** (mã thoát `0`).
- `npm run test:r105`: **40 / 40 PASS** (`fail 0`).
- `npm run test:r104`: **52 / 52 PASS** (`fail 0`).
- `npm run test:r103`: **45 / 45 PASS** (`fail 0`).
- `npm run test:r102`: **33 / 33 PASS** (`fail 0`).
- `npm run test:r100`: **6 / 6 PASS** (`fail 0`).
- `node --check` trên toàn bộ tệp `.mjs` đã chỉnh sửa: **PASS** (`exit code 0`).
- **Bảo mật:** Không lưu bất kỳ OAuth access token hay khóa bí mật nào trong mã nguồn, manifest, log hay tệp ZIP.

