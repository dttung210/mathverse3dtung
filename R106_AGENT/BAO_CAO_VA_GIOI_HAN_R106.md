# MATHVERSE R106 DISCOVERY — BÁO CÁO NGHIỆM THU BIG UPDATE

**Nguồn:** Cập nhật trực tiếp trên thư mục dự án `MATHVERSE_R105_SKETCHFAB_GLB_ANTIGRAVITY_FULL\MATHVERSE_R105_SKETCHFAB_GLB_ANTIGRAVITY`. Không xóa lịch sử R105, bảo toàn tuyệt đối GLB Parthenon R98 (`SHA256: e4b5091373259e067373630a3af4828c799e6cb3677dc2b28ac88c31b322562d`).

## 1. Giải quyết triệt để 4 phản hồi của giáo viên
1. **Hiển thị ảnh thực tế ngay lần đầu vào phòng UNESCO (`< 0.05s`)**:
   - Đã tải và lưu cache ngoại tuyến toàn bộ **35 ảnh thực tế Wikimedia Commons** (`24` công trình kiến trúc + `11` ảnh Toán thực tế Phòng B) tại `dual/discovery-r106/assets/photos/*.jpg`.
   - Kích hoạt nạp ảnh ngay khi khởi tạo cảnh và khi vào phòng `unesco` hoặc `globe`.
2. **Bục số 2 (`wonder_artemis` – Đền Artemis ở Ephesus)**:
   - Tắt hoàn toàn bảng hộp chữ nhật Sketchfab nổi đè lên bục (`fallbackNonGLB: false`).
   - Nâng cấp mô hình 3D trực tiếp trên bục thành **Đền Hy Lạp cổ đại thức cột Ionic hai vòng (Dipteral)** có bậc tam cấp đá cẩm thạch 3 tầng, hậu cung (cella), hệ cột đôi thức Ionic, trán tường tam giác cân và mái ngói đỏ đất nung hai dốc. Trình xem Sketchfab giữ nguyên trong cửa sổ chi tiết khi nhấn `E`.
3. **Phóng to mô hình 3D trên bục (+45%) & Mở rộng diện tích các phòng**:
   - **Phòng UNESCO 3D**: Mở rộng từ `72m × 60m × 20m` lên **`104m × 92m × 24m`**, đường kính bục tăng từ `7.0m` lên **`9.1m`**, kích thước mô hình tăng từ `5.9m` lên **`8.6m`** (Parthenon R98 tăng lên `11.2m`), tranh ảnh thực tế trên tường tăng lên **`7.6m × 4.25m`**.
   - **Phòng B – Triển lãm Hình học Thực tế**: Mở rộng từ `44m × 44m × 13.5m` lên **`64m × 58m × 16m`**, phóng to 8 khung tranh vật lý lên **`10.2m × 7.8m`**, nâng bảng tiêu đề lên `y = 11.8m`.
4. **Thêm nút Teleport `🌍 DISCOVERY` trên thanh công cụ & Sửa lỗi nhấp chấm trên Quả Địa Cầu**:
   - Thêm nút `#discovery-quick-enter` (`🌍 DISCOVERY`) trên `#topbar` để dịch chuyển tức thì tới Sảnh Địa Cầu từ mọi khu vực.
   - Sửa ngưỡng kéo chuột (`<= 5px`) và mở rộng vùng bắt điểm (`hit sphere`) cho toàn bộ 24 chấm trên Quả Địa Cầu; bật tự động tải mô hình 3D (`autostart=1`) và hiển thị đủ 3 tab `🏛 Sketchfab | ⬡ Hình học 3D | ▤ Hình 2D` trong modal.

## 2. Trạng thái 16 bục trong Phòng UNESCO 3D (`13 GLB bản địa + 3 mô hình 3D chi tiết cao`)
- **12 mô hình `.glb` CC BY 4.0 đã tải và kiểm định WebGL** (`dual/discovery-r103/assets/approved-local-models.json`):
  1. `wonder_giza` – Đại Kim tự tháp Giza (`rigsters`, `CC BY 4.0`)
  2. `wonder_colosseum` – Đấu trường Colosseum (`Perzival`, `CC BY 4.0`)
  3. `wonder_chichen` – Chichén Itzá / El Castillo (`David G.ock`, `CC BY 4.0`)
  4. `wonder_taj` – Lăng Taj Mahal (`uday`, `CC BY 4.0`)
  5. `other_petronas` – Tháp đôi Petronas (`2310411121`, `CC BY 4.0`)
  6. `other_louvre` – Kim tự tháp kính Louvre (`Lê Thị Kim Ngân`, `CC BY 4.0`)
  7. `other_golden_gate` – Cầu Golden Gate (`Askild`, `CC BY 4.0`)
  8. `other_gateway` – Cổng vòm Gateway Arch (`Just8`, `CC BY 4.0`)
  9. `r106_sydney` – Nhà hát Opera Sydney (`Nick Reinhardt`, `CC BY 4.0`)
  10. `r106_pantheon` – Đền Pantheon ở Rome (`Brian Trepanier`, `CC BY 4.0`)
  11. `r106_eiffel` – Tháp Eiffel (`Johnson Martin`, `CC BY 4.0`)
  12. `r106_burj` – Burj Khalifa (`SDC PERFORMANCE`, `CC BY 4.0`)
- **1 mô hình `.glb` quang trắc gốc R98 bảo toàn nguyên trạng**:
  13. `unesco_parthenon` – Đền Parthenon (`dual/discovery-r98/assets/unesco_parthenon_glb.glb`)
- **3 mô hình kiến trúc 3D Three.js chi tiết cao trên bục + Sketchfab Viewer trong hồ sơ chi tiết**:
  14. `wonder_artemis` – Đền Artemis ở Ephesus (Đền Hy Lạp thức Ionic mái ngói đỏ 3D)
  15. `r106_hagia` – Hagia Sophia (Mái vòm trung tâm, 24 cửa sổ vòm, bán vòm và 4 tháp minaret 3D)
  16. `r106_atomium` – Atomium Brussels (Tinh thể lập phương tâm khối 9 quả cầu thép và 20 ống nối 3D)

## 3. Phân loại UNESCO chính xác
- Sydney Opera House được ghi danh riêng. Hagia Sophia thuộc **Historic Areas of Istanbul**; Pantheon thuộc **Historic Centre of Rome** (không phải hồ sơ UNESCO độc lập). Eiffel, Atomium và Burj Khalifa thuộc nhóm kiến trúc hình học khác. Không gọi New7Wonders là tổ chức UNESCO.

## 4. Kiểm thử tự động
- `npm run test:r106`: **31/31 PASS**
- `npm run test:r105`: **34/34 PASS**
- `npm run test:r104`: **52/52 PASS**
- `npm run test:r100`: **6/6 PASS**
- `npm run verify:r105`: **12 GLB_DA_DUYET_WEBGL + 3 SKETCHFAB_CHUA_CO_GLB + Parthenon R98 bảo toàn**
