# MATHVERSE — GÓI KIẾN TRÚC & NHÂN VẬT CHIBI CARTOON 3D (04/11/2026)

## Đã tích hợp thật vào dự án

- **10 nhân vật Chibi 3D**: Áo Cam, Sakura, Đại Dương, Bạc Hà, Phi Hành Gia, Oải Hương, Nhà Khoa Học, Mặt Trời, Robot, Đêm Sao; có hoạt ảnh đi, chạy, nhảy, đứng chờ dựng bằng mã Three.js. Vẫn giữ 4 nhân vật gốc.
- **8 lựa chọn ngoại thất LAB** (7 kiểu mới + kiểu gốc): Quantum Core, Crystal Research, Hexa Research, Aero Wave, Solar Future, Science Tubes, Bio Fluid.
- **8 lựa chọn mái vòm bảo tàng** (7 kiểu mới + kiểu gốc): Geodesic, Silver Canopy, Orbital Dome, Lotus Dome, Nebula Dome, Crystal Dome, Halo Dome.
- **4 lựa chọn cảnh quan** (3 kiểu mới + kiểu gốc): Pastel Garden, Starlight Crystals, Cartoon Water.
- **22 tệp mô hình GLB độc lập**: 10 nhân vật, 6 nhà LAB, 6 bảo tàng; thư viện riêng để xem mô hình bằng WebGL và tải GLB.
- **Bảng chọn trong ứng dụng**: nút `🎨 CHIBI 3D` trên thanh công cụ Grand Campus. Thay mẫu trực tiếp, lưu lựa chọn trong trình duyệt, có nút khôi phục nguyên bản.
- **R75**: hỗ trợ hiển thị nhân vật Chibi trong LAB mô hình và các phòng chuyên đề; giữ nguyên điều khiển và chức năng Toán. Bản vá cho bộ cài đã sửa chỉ áp dụng mục này khi nhận diện đúng cấu trúc nguồn R75.

## Cách dùng — cô không cần lập trình

**Lựa chọn 1: cài bộ đầy đủ từ tệp nguồn ZIP gốc**
1. Giải nén ZIP mới vào thư mục mới, **không ghi đè thư mục đang dùng**.
2. Nhấp `00_MO_MATHVERSE_FINAL.bat`.
3. Trên thanh công cụ, nhấp `🎨 CHIBI 3D`, chọn nhân vật, ngoại thất LAB, mái bảo tàng và cảnh quan.
4. Muốn xem các tệp GLB, nhấp `📦 Kho 22 mô hình GLB 3D` trong bảng chọn.

**Lựa chọn 2: giữ toàn bộ các sửa lỗi ở phiên bản MATHVERSE đang dùng** — khuyến nghị nếu cô đã cài bản sửa riêng ngày 02/11/2026:
1. Trong bộ ZIP đầy đủ mới, tìm `MATHVERSE_CHIBI_ADDON_CHO_BAN_DA_SUA.zip` và giải nén nó.
2. Mở `02_NANG_CAP_CHIBI_CHO_MATHVERSE_DA_SUA.bat` trong gói giải nén.
3. Dán **đường dẫn đến thư mục gốc của MATHVERSE đang dùng** (thư mục chứa `dual`, `server`, `package.json`).
4. Công cụ sao lưu mã nguồn liên quan, chép 22 mô hình GLB và chèn bộ chọn mới mà không ghi đè ngân hàng Toán, trò chơi, mê cung hay phòng mô hình.
5. Mở MATHVERSE bằng tệp BAT cũ của phiên bản đang dùng.

## Phạm vi và hạn chế cần biết

- **Nguồn đầu vào** cho bản ZIP đầy đủ này là tệp `MATHVERSE_FINAL_FULL_11_GAME_TOAN_6_12_KEM_PROMPT_ANTIGRAVITY_2026-11-02.zip` cô cung cấp. **Không có byte của ZIP đã sửa riêng trong phiên trước** ở môi trường hiện tại, nên bản đầy đủ không được xem là tự động kế thừa các hotfix từ ZIP đó.
- Để giữ các sửa lỗi sau ZIP gốc, **dùng gói cập nhật tương thích (lựa chọn 2)**.
- Bộ 3D này được con dựng mới bằng hình học, không sao chép tệp nhị phân từ các repo. Chất lượng là hoạt hình cách điệu, **không tương đương một-một với hình chụp Chibi AI giàu chi tiết**. Các nhân vật GLB đơn lẻ là mô hình tĩnh để mở/chỉnh sửa; hoạt ảnh đi/chạy/nhảy được tạo bằng mã khi ở trong MATHVERSE.
- Thay đổi kiến trúc chỉ nằm ở **lớp ngoại thất** bên ngoài hiện trạng; không thay cửa, điểm dịch chuyển, vị trí mô hình, ngân hàng câu hỏi hay chức năng học tập.
- Bộ cài đầy đủ sử dụng kiểm định dữ liệu gốc của nó (3.150 câu, 3.126 câu khả dụng theo kiểm tra cấu trúc, 24 câu cách ly). **Không nhầm đây là phiên bản đã sửa dữ liệu riêng** (phiên sau được báo cáo 3.087 câu và 63 câu cần rà soát).
- Chưa kiểm thử trực tiếp bằng trình duyệt đồ họa trên Windows máy cô. Các kiểm thử nguồn, GLB, cấu trúc Three.js và 11 trò chơi đã đạt.

## Lệnh kiểm tra (không bắt buộc)

`npm run check:cartoon` kiểm tra 22 GLB và tích hợp; `npm run check:final` kiểm tra cả MATHVERSE nguồn + Cartoon 3D.

## Nguồn tham khảo công khai (chưa nhúng nguyên tài sản của các kho này)

- Kenney Modular Space Kit (CC0): https://kenney.nl/assets/modular-space-kit
- Kenney / GitHub GLB catalog (CC0): https://github.com/Hidencod/tge-assets
- KayKit Adventurers (CC0): https://kaylousberg.itch.io/kaykit-adventurers
- NoLimitNexus Character Kits: https://github.com/NoLimitNexus/game-models
- Three.js (MIT): https://github.com/mrdoob/three.js

## Không xóa dữ liệu Toán

Tuyệt đối không xóa `game-park/assets`, `game-park/teacher-source`, `game-park/teacher-bank-theo-lop`, các thư mục `src/museum`, `src/geometry`, hay lớp chức năng tương tác khi thay giao diện.
