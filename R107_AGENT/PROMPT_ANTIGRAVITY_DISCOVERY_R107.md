# PROMPT ANTIGRAVITY AGENT — MATHVERSE DISCOVERY R107
## TÍCH HỢP 10 CÔNG TRÌNH MỚI + 17 BỘ ẢNH THẬT PHÒNG B, BẢO TOÀN R106

**VAI TRÒ:** Lead Engineer Three.js/WebGL và quản trị tài nguyên 3D Sketchfab/glTF; chuyên gia giấy phép Wikimedia Commons, giám tuyển di sản UNESCO và giáo viên Toán THCS/THPT. Cô giáo không biết lập trình. Agent phải thực hiện trực tiếp trong dự án MATHVERSE đang mở ở Antigravity IDE, KHÔNG tạo app phụ hay yêu cầu cô chạy câu lệnh.

## A. BẮT BUỘC ĐỌC VÀ SAO LƯU TRƯỚC
1. Xác định thư mục gốc đang chạy ứng dụng, kiểm tra `package.json`, `dual/app.mjs`, `server/host.mjs`.
2. Đọc `R107_AGENT/00_HUONG_DAN_UPDATE_R107.md`, `R107_AGENT/BAO_CAO_R107.md`, `dual/discovery-r107/heritage-additions.mjs`, `gallery-real-photos.mjs`, `gallery-svg.mjs`, `gallery-pages.css`, `dual/discovery-r102/catalog.mjs`, `exhibition-room.mjs`, `geometry-models.mjs`, `geometry-2d.mjs`, `dual/discovery-data.mjs`, `dual/discovery-photo-r96.mjs`, `dual/discovery-ui.mjs`, `dual/discovery-world.mjs`, `dual/discovery-r97/world-map-ui.mjs`, `dual/discovery-r100/wonders-ui.mjs`.
3. Sao lưu dữ liệu trước chỉnh sửa. Kiểm tra SHA-256 `dual/discovery-r98/assets/unesco_parthenon_glb.glb`; tuyệt đối không sửa GLB Parthenon. Bảo toàn LAB Toán 6–12, kho 310 mô hình, Museum, Công viên, Game và bản đồ địa cầu.
4. Không phát hành lại tệp ảnh/GLB khi giấy phép không cho phép. Không được vượt xác thực Sketchfab, đào mesh từ iframe hoặc phát tán token.

## B. PHÒNG UNESCO VÀ KIẾN TRÚC 3D — MƯỜI CÔNG TRÌNH MỚI
R107 đã **bổ sung dữ liệu và mô hình hình học giáo dục** (không phải bản quét GLB) cho các công trình sau:

| ID | Công trình | Sketchfab UID ứng viên/đã đối chiếu | Lưu ý |
|---|---|---|---|
| r107_borobudur | Borobudur | `84525b2dc4094057ab33e026eb961371` | giga – CC BY, mô hình low-poly |
| r107_angkor | Angkor Wat | `be70b89f9c264fc19d63dca2ae78b224` | 333DDD – CC BY, mô hình dựng từ video drone |
| r107_pisa | Tháp nghiêng Pisa | `abf56101911447b7bd65ff098dcd455a` | Brian Trepanier – CC BY, 1.4M tam giác; cần tối ưu |
| r107_samarra | Tháp xoắn Malwiya | `d8ebe7c756f2414bb70768d936f2d137` | Chenzoss – CC BY |
| r107_himeji | Himeji-jo | `6e33b2a9dd42486da236b015bce8c366` | URL ứng viên, chưa đủ bằng chứng tác giả/quyền tải; KHÔNG tuyên bố đã kiểm chứng |
| r107_sagrada | Sagrada Família | `1e6a870501584df28a328d1278b96b97` | wareFLO – CC BY; UNESCO chỉ ghi danh Mặt đứng Giáng Sinh và Hầm mộ |
| r107_brasilia | Nhà thờ Brasília | `9f2d2de9642f48ac873b5aab62b667f7` | cuankiproduction – CC BY; thuộc đô thị Brasília UNESCO, không phải hồ sơ độc lập |
| r107_lotus | Lotus Temple | `bf5edd0ef1a74bc3be8c2a52ac2f0362` | KaitlynM – CC BY; không phải UNESCO |
| r107_millau | Millau Viaduct | `f7bbb3fa445f43d880668c1651290c92` | Robert Kiraly – CC BY |
| r107_needle | Space Needle | `a0cbf7ba6d6342f4983b86ea20144ace` | EDXtawny – CC BY |

Bắt buộc đối chiếu lại các URL, tác giả, giấy phép và quyền tải của TỪNG mô hình trước khi lấy GLB bằng cơ chế đăng nhập hợp pháp. Thứ tự ưu tiên: bản quang trắc thật/GLB có nguồn > mô hình 3D kiến trúc được cấp phép > mô hình hình học giáo dục có nhãn rõ. Mô hình chưa có GLB hợp pháp KHÔNG được coi là bản quét công trình.

R107 đã thiết kế hai **bộ trưng bày** trong cùng phòng 72×60, tránh chất 25 bục cùng lúc:
- Trang 1 giữ 15 bục R106, gồm 3 bục New7Wonders.
- Trang 2 thêm 10 công trình R107 dọc hai bên tường; 3 bục New7Wonders vẫn còn.
- Parthenon GLB gốc luôn giữ nguyên. Có nút `Xem thêm 10 công trình R107` ngay trong phòng, không cần đi sang phòng mới.

Khi có GLB hợp pháp: dùng loader đã có tại `dual/discovery-r98/scan-loader.mjs` và manifest `dual/discovery-r103/assets/approved-local-models.json`, căn GLB trực tiếp trên bục Three.js; kiểm tra lưới, texture, bounding box, FPS và vị trí. Không dùng iframe nổi trên bục. Sketchfab tiếp tục mở trong tab chi tiết của cửa sổ R100.

## C. PHÒNG B — 17 CHỦ ĐỀ ẢNH CHỤP THỰC TẾ
R107 bổ sung hai bộ:
- `Ảnh R107 · Thiên nhiên` — 9 chủ đề: cột bazan gần lục giác; mạng nhện; vỏ Nautilus; gân lá; vòng năm cây; quả dứa; bong bóng xà phòng; màng xà phòng; cánh bướm.
- `Ảnh R107 · Kỹ thuật` — 8 chủ đề: chảo vệ tinh; tuabin gió; cầu giàn; lò xo; container; tưới vòng; đĩa xích xe đạp; cầu thang xoắn.

Ảnh R107 được ứng dụng tự tra trong Wikimedia Commons, sau đó đọc metadata CHÍNH TỆP ảnh để xác minh tác giả/giấy phép CC BY, CC BY-SA, CC0 hoặc public domain. **Không coi giấy phép của một thư mục Commons là giấy phép của tất cả ảnh.** Không sử dụng ảnh AI, sơ đồ, ảnh watermark rồi gọi là ảnh chụp. Khi không xác minh được ảnh, giữ sơ đồ toán với nhãn `CHƯA CÓ ẢNH THẬT ĐƯỢC XÁC MINH`.

Agent cần cố gắng chọn từ mỗi bộ một tệp JPEG/WebP có ảnh chụp rõ nhất, đúng địa danh/chủ đề, ghi tác giả, giấy phép, permalink, SHA-256 và tải bản phù hợp vào thư mục cache hợp pháp để ứng dụng xem được offline (nếu được phép). Không được chỉ lấy tên ảnh từ một câu trả lời AI rồi ghi là đã duyệt. Không thay 8 khung ảnh vật lý; dùng nút Trước/Sau sẵn có để chuyển trang.

Ở mỗi tranh, khi bấm xem chi tiết có ảnh thực tế đúng đối tượng, chú thích tiếng Việt, nguồn, giấy phép, hình minh họa SVG 2D và công thức Toán dạng LaTeX (khi phù hợp); không tự nhận sơ đồ SVG là ảnh thật.

## D. GIỮ PHÂN LOẠI VÀ BẢN ĐỒ CHÍNH XÁC
- 14 kỳ quan cổ/mới + 4 kiến trúc R102 + 6 công trình R106 + 10 công trình R107 = 34 điểm trên bản đồ và địa cầu.
- Cổ đại màu cam, New7Wonders 2007 màu vàng, kiến trúc bổ sung màu đỏ.
- Bấm điểm ở bản đồ/địa cầu chỉ mở ảnh thật, tiểu sử, Sketchfab; **không có nút sang phòng UNESCO**, không chuyển tab Toán 3D/2D từ bản đồ.
- Borobudur, Angkor, Pisa, Samarra, Himeji thuộc UNESCO; Sagrada Família chỉ phần được ghi danh. Brasília thuộc Di sản Thế giới là đô thị; riêng Nhà thờ Brasília không có hồ sơ độc lập. Lotus Temple, Millau, Space Needle không gọi là UNESCO.
- Không thay đổi bố cục R100 (màu xanh đậm, 2 cột ảnh + Sketchfab, menu), công viên, Lab, Museum.

## E. KIỂM THỬ, PHÁT HÀNH VÀ BÁO CÁO
1. Chạy `npm run test:r107` và `node --check` toàn bộ tệp thay đổi.
2. Kiểm thử trên Windows/Chrome có Internet: 34 pin bản đồ/địa cầu, hai trang UNESCO, 17 chủ đề ảnh R107, các 8 khung Phòng B, quay/xem mô hình, mở tiểu sử và tab 2D/3D.
3. Đối chiếu ảnh thật của ít nhất Borobudur, Angkor, Pisa, Samarra, Himeji và từng bộ ảnh thiên nhiên/kỹ thuật với trang Wikimedia hoặc hồ sơ UNESCO.
4. Báo cáo bảng theo từng hiện vật: `GLB_NATIVE_VERIFIED`, `SKETCHFAB_EMBED_ONLY`, `THREE_EDUCATIONAL_PREVIEW`, `IMAGE_LICENSE_PENDING`, có thông tin giấy phép/tác giả/permalink.
5. Nếu Sketchfab yêu cầu OAuth, yêu cầu giáo viên xác thực bằng giao diện CHÍNH THỨC; không yêu cầu cô viết mã hoặc gửi mật khẩu.
6. Khi hoàn thành, xuất bản **ZIP UPDATE nhỏ chỉ chứa các tệp thay đổi**, kèm BAT cài đặt an toàn, prompt, sao lưu, hoàn tác và báo cáo kiểm thử; không đóng gói toàn bộ ứng dụng hoặc tạo nhiều BAT chồng chéo.
7. Không báo đã hoàn thành GLB quang trắc khi chưa có GLB có phép hoặc chưa kiểm chứng WebGL thực tế.

**THỰC THI trực tiếp trong dự án, không chỉ viết kế hoạch; giữ toàn bộ chức năng có trước và bảo toàn dữ liệu riêng của cô.**
