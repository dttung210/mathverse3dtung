# MATHVERSE DISCOVERY R95 — BỘ BỔ SUNG ĐỊA DANH VÀ TRANH, KHÔNG PHẢI ỨNG DỤNG MỚI

**Đúng yêu cầu:** xây thêm nội dung vào hai phòng Discovery đã có của R93/R94, thiết kế đẹp hơn, không động đến dữ liệu gốc. ZIP này chỉ là bộ cập nhật Antigravity, **không phải MATHVERSE đầy đủ**.

## Nội dung trong R95

- **32 địa danh mới** (ngoài 13 địa danh thuộc R94), với tọa độ tham khảo, ý tưởng hình học, URL nguồn và trạng thái kiểm duyệt.
- **36 chủ đề tranh mới**, chia 6 bộ sưu tập, mỗi nhóm 6 tranh. Các chủ đề trước đây vẫn được giữ.
- **68 hình SVG 2D mới**: 32 địa danh + 36 tranh, là **hình Toán học vector**, *không phải ảnh chụp thực tế*.
- **13 mô hình GLB mới**: các dạng 3D Toán học có thể kiểm tra (Atomium 9 cầu–20 kết nối, Chichén Itzá 9 tầng lý tưởng, Borobudur 5 tầng vuông–3 tầng tròn, ...); không giả nhận là bản dựng kiến trúc nguyên trạng.
- Tài liệu tái cấu trúc thiết kế: **một công trình – hai phòng**, nâng hệ thống tìm kiếm và phòng tranh thay khung theo bộ sưu tập.
- Trình cài chỉ thêm `DISCOVERY_R95_ADDON`, không ghi đè tài nguyên R93/R94.
- **Prompt Antigravity** yêu cầu Agent tích hợp thật trên ứng dụng, kèm sao lưu, ảnh minh chứng và kiểm thử.

## Cách dùng không cần lập trình

1. **Sao lưu ứng dụng R93 hiện có** sang một thư mục khác. Không thử cập nhật trên bản duy nhất.
2. Giải nén ZIP bộ R95. Nhấp đúp `00_CAI_BO_SUNG_R95_VAO_DU_AN.bat`, nhập thư mục gốc của MATHVERSE đang sử dụng (có `dual/app.mjs`, `dual/discovery-world.mjs`, `package.json`).
3. Công cụ chỉ chép **thư mục mới** `DISCOVERY_R95_ADDON/` và đối chiếu hash, không sửa mã ứng dụng.
4. Mở chính dự án MATHVERSE trong **Antigravity IDE**; dán tệp `PROMPT_ANTIGRAVITY_CAP_NHAT_R95.txt` vào Agent. Agent sẽ sao lưu, cập nhật phần hai phòng Discovery và thử thật trong trình duyệt.
5. Nếu cô đã dùng R94, **giữ nguyên thư mục `DISCOVERY_R94_ADDON/`**: R95 phải *nối thêm* 32 + 36 nội dung, **không được thay thế** 13 địa danh và 8 tranh của R94.

**Nếu Windows không chạy BAT**: mở Antigravity và yêu cầu Agent chép `ADDON_DISCOVERY_R95/` thành `DISCOVERY_R95_ADDON/` trong gốc dự án, không đè lên `dual/`; rồi dán prompt.

## Chính sách dữ liệu và hình thật

**Không có ảnh thật chưa rõ giấy phép trong ZIP.** Bộ R95 có tranh SVG minh họa và chỉ dẫn cho Agent thu thập ảnh thật từ Wikimedia Commons hoặc nguồn cho phép tái sử dụng, thẩm định tác giả/giấy phép trước khi bật ảnh. Địa danh có nguồn và tọa độ tham khảo; **không cam kết mọi nguồn/tọa độ đã được thẩm định hoàn toàn**. Những mục chưa được kiểm duyệt gắn `publishReady:false`.

Đặc biệt, **kết xuất hình học đúng công thức ≠ bản sao 3D thực tế chính xác của kiến trúc**. Nếu chưa có bản vẽ CAD/cấu trúc chứng thực, chỉ hiển thị mô hình Toán học nguyên lí với nhãn rõ.

## Xem thử và tự kiểm tra

- Nhấp đúp `XEM_TRUOC_GIAO_DIEN_R95.html` để xem **bản mẫu giao diện**, không phải ứng dụng 3D thật.
- Có Node.js: chạy `node --test ADDON_DISCOVERY_R95/qa/verify_r95.test.mjs` để kiểm tra nội dung và tài nguyên.
- Đọc `docs/THIET_KE_LAI_2_PHONG_R95.md` và `docs/NGHIEM_THU_ANTIGRAVITY_R95.md` để biết tiêu chuẩn nghiệm thu.
