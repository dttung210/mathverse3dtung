# BÁO CÁO KIỂM TRA MATHVERSE DISCOVERY R100

**Ngày:** 07/11/2026. **Nguồn:** ZIP R99 người dùng cung cấp (2.424 mục trong gói ZIP).

## Đã kiểm tra bằng mã và máy chủ

- [x] Dữ liệu R100 có đúng 14 kỳ quan kiến trúc: 7 cổ đại và 7 công bố năm 2007; không dùng bộ 14 kỳ quan thiên nhiên làm danh mục hiển thị.
- [x] Bố trí hai dãy bục tương tác (7+7) trong phòng UNESCO 3D hiện có. Bục có biển tên và nhãn phục dựng nếu thích hợp.
- [x] Có điểm đánh dấu tương ứng trên địa cầu và bản đồ 3D/2D, dùng cùng mã kỳ quan và hồ sơ.
- [x] Từng mục có URL Sketchfab cụ thể; cửa sổ dùng iframe viewer chính thức, chỉ tải khi chọn.
- [x] Có hồ sơ tiếng Việt, nguồn Sketchfab, liên kết ảnh công khai, UNESCO nếu đúng mối liên hệ.
- [x] Giữ lại mô hình Parthenon dạng quang trắc và tài liệu R98; test đối chiếu SHA-256 với hồ sơ kiểm định.
- [x] Giữ nguyên các mô-đun cũ; không gọi hàm chạy phòng kỳ quan thiên nhiên R99.
- [x] Node.js --check các mô-đun được sửa không báo lỗi; 23/23 kiểm thử Node.js R96–R100 đạt.
- [x] Máy chủ Node mở tại 127.0.0.1:4464, các tệp HTML, mô-đun R100 và GLB Parthenon đều trả HTTP 200.
- [x] Có BAT chạy ứng dụng, BAT mở đối chiếu trước–sau và BAT sao chép prompt sang clipboard.

## Giới hạn và việc cần nghiệm thu trên máy người dùng

- [ ] Trình duyệt WebGL tự động tại môi trường dựng gói bị hạn chế truy cập, nên **chưa nghiệm thu hình ảnh và thao tác người dùng trên Chrome/Edge ở Windows**. Cần thử di chuyển, click/E vào bục, zoom, xoay mô hình.
- [ ] Chưa thể xác nhận từng mô hình Sketchfab cho phép nhúng tại thời điểm học sinh sử dụng. Một số chủ sở hữu có thể gỡ/xóa/giới hạn nhúng; trường hợp này phải báo lỗi nguồn.
- [ ] Không tải 14 GLB từ Sketchfab vào ZIP: **đây là 14 trình xem nhúng Sketchfab, không phải 14 bản sao tệp GLB ngoại tuyến**. Chỉ Parthenon đã có GLB kiểm chứng từ bản gốc.
- [ ] Ảnh Wikimedia và ảnh thu nhỏ Sketchfab cần mạng; ảnh chính xác/phù hợp cần giáo viên duyệt từng mục trước khi dạy.
- [ ] 6 kỳ quan cổ đại không còn nguyên vẹn: mô hình là phục dựng của tác giả, **không xác nhận là bản gốc chính xác**. Vườn treo Babylon còn tranh luận về thực chứng và vị trí.
- [ ] Tệp xem trước–sau gồm ảnh R99 cô đã cung cấp và **sơ đồ bố trí R100**, không phải ảnh chụp sau khi render WebGL.

## Tên và cách chạy

- `00_CHAY_MATHVERSE_R100.bat`: chạy chương trình Node.js, giữ cửa sổ máy chủ.
- `00_XEM_TRUOC_SAU_R100.bat`: mở bản xem trước và sơ đồ đối chiếu.
- `00_COP_PROMPT_ANTIGRAVITY_R100.bat`: sao chép prompt, dán vào Agent Antigravity.
- `PROMPT_ANTIGRAVITY_UPDATE_R100.md`: yêu cầu Agent kiểm tra và hoàn thiện, có trong ZIP.
- `R100_NGUON_SKETCHFAB_14_KY_QUAN.csv`: danh mục ID/nguồn mô hình.
