# Báo cáo kỹ thuật MATHVERSE R102 — Discovery 3 khu

- Bản nguồn: `MATHVERSE_R100_TOI_UU_BO_CAI_DAY_DU (1).zip` người dùng gửi.
- Bảo toàn Labs Toán 6–12, 310 mô hình nguồn, Museum, Công viên, Game, R98 Parthenon scan/ảnh, bản đồ Natural Earth, phòng tranh. Chỉ thêm các mô-đun Discovery R102 và thay các điểm kết nối.
- Trước cập nhật: 14 điểm cổ đại/New7Wonders, bục chỉ có ảnh Sketchfab; phòng 44×44.
- R102: 18 điểm trên địa cầu và bản đồ (7+7+4), 9 bệ mô hình toán thực sự dựng bằng Three.js + 1 bệ Parthenon GLB photogrammetry giữ nguyên, ba khu theo ba bức tường. Phòng 72×60 đơn vị mô hình.
- Giao diện R100 hai cột được giữ. Tab hình học 3D/2D chỉ xuất hiện khi xem từ bục, không hiện từ điểm địa cầu/bản đồ; ảnh Olympia/Rhodes thay ảnh tượng phản cảm.
- Độ chính xác: mô hình toán/3D cấu trúc được lý tưởng hóa, không đại diện cho quét toàn bộ công trình hiện thực; không tải thêm 9 GLB của Sketchfab. Chỉ tệp Parthenon R98 là quang trắc nguồn đã duyệt. Tệp GLB riêng từ Sketchfab đòi quyền tải OAuth và giấy phép.
- Mỗi công trình có lịch sử và URL Sketchfab/nguồn tham khảo; ảnh Wikimedia/Sketchfab tải khi có Internet; không cam kết ảnh đúng tuyệt đối khi nguồn dẫn nhập thay đổi.
- Node `--check` các file được chỉnh sửa: OK.
- `npm run test:r102`: 33/33 kiểm thử Node.js PASS (R95–R98 + R102).
- Máy chủ Node chạy tại 127.0.0.1:4450: `/`, các mô-đun R102, CSS R100 và Parthenon GLB trả HTTP 200. Đường dẫn `/dual/` không tự phục vụ index; đường dẫn sử dụng là `/` theo bộ cài gốc.
- Chromium tự động trong môi trường biên soạn bị chặn truy cập localhost: `ERR_BLOCKED_BY_ADMINISTRATOR`, nên **chưa chụp hình nghiệm thu WebGL thực tế**. Cần kiểm tra trên máy Windows trước khi dùng cho học sinh.
- Gateway Arch là **catenary**, không phải parabol; Golden Gate cáp treo được **xấp xỉ** bằng parabol theo tài liệu bài tập chính thức.
- New7Wonders 2007 không phải UNESCO tổ chức bình chọn. Khu UNESCO dùng những di sản được ghi danh riêng (bao gồm Parthenon-Acropolis, Giza-Memphis necropolis, Ephesus) và khu New7Wonders dùng các mẫu được chọn.
