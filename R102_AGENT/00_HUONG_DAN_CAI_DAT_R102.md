# HƯỚNG DẪN SỬ DỤNG MATHVERSE R102 – DÀNH CHO CÔ

## 1. Cài đặt và chạy

1. Giải nén ZIP đầy đủ R102 vào **một thư mục mới**, không chép đè R100 đang sử dụng.
2. Nếu máy chưa có Node.js, cài Node.js phiên bản **20 trở lên**. Không cần cài Python.
3. Nhấp đúp duy nhất `00_MO_MATHVERSE_R102.bat` ở thư mục gốc và chọn **1 – Chạy ứng dụng**. Máy chủ sẽ hiện dòng `READY` và tự mở trình duyệt khi môi trường cho phép.
4. Muốn kiểm tra dự án chọn **2 – Kiểm tra**; muốn cập nhật bằng Antigravity chọn **3 – Sao chép prompt**, dán `Ctrl+V` trong Agent của Antigravity IDE.

## 2. Những điều mới

- Sảnh địa cầu và bản đồ phẳng có **18 điểm**: 7 kỳ quan cổ đại (cam), 7 kỳ quan mới năm 2007 (vàng), 4 công trình hình học bổ sung (đỏ).
- Bấm vào điểm trên bản đồ hoặc địa cầu để mở **ảnh địa điểm, tiểu sử và Sketchfab**. **Không có nút đi tới phòng UNESCO** ở các cửa sổ này.
- Phòng UNESCO được mở rộng từ mặt bằng khoảng **44×44** thành **72×60 đơn vị 3D**, chia ba khu dọc ba phía tường:
  - Khu 1: Di sản Thế giới UNESCO: Kim tự tháp Giza, di tích đền Artemis (Ephesus), mô hình quang trắc **Parthenon GLB R98** vẫn còn.
  - Khu 2: Các đại diện New7Wonders 2007 có hình học rõ: Colosseum, Chichén Itzá, Taj Mahal.
  - Khu 3: Petronas, Kim tự tháp kính Louvre, cầu Golden Gate, Gateway Arch.
- **Chín bệ dựng mô hình Three.js hình học thật trực tiếp**, không chỉ là ảnh. Bệ thứ 10 là Parthenon GLB quang trắc đã duyệt từ R98.
- Bấm vào mô hình/bệ hoặc đứng gần nhấn **E**: mở cửa sổ R100 đã giữ nguyên giao diện. Có ảnh thật, tiểu sử, Sketchfab và (chỉ khi mở từ bệ) các tab **Hình học 3D** và **Hình chiếu 2D** cùng công thức LaTeX.
- Hình học mới là mô hình có tính chất toán học được lý tưởng hóa, **không phải bản quét công trình chính xác tới từng chi tiết**. Không thay thế tệp GLB Parthenon đã duyệt.

## 3. Ảnh tượng học sinh

- Với tượng Zeus cổ đại và Colossus Rhodes, không lấy ảnh tượng khỏa thân làm ảnh dẫn nhập; ưu tiên ảnh **di tích Olympia** và **thành phố Rhodes hiện nay**.
- Sketchfab của hai trường hợp này được thay bằng mô hình *địa điểm khảo cổ* (Olympia và Lindos trên đảo Rhodes), **không phải chính bản thân tượng**. Ghi rõ điểm khác biệt trong giao diện; không quảng cáo đó là bản quét của tượng mất tích.
- Ảnh thực tế được tải từ Wikipedia/Wikimedia khi có Internet; nếu không có nguồn phù hợp sẽ hiện nhãn chờ ảnh, không tạo ảnh giả.

## 4. Nếu bị lỗi

- Nếu trang cũ vẫn hiển thị, nhấn `Ctrl + Shift + R`.
- Nếu tệp `.bat` báo thiếu `server/host.mjs`, cô đã đặt BAT sai vị trí. Chép BAT trở lại thư mục có các thư mục `dual` và `server`.
- Nếu Sketchfab không tải, kiểm tra Internet/quyền nhúng của tác giả; mô hình toán hình học trên bục vẫn có thể hoạt động ngoại tuyến.
- Không mở bằng cách bấm đúp `index.html`: máy chủ Node cần chạy để dùng import module và các API.
- Có thể đọc `R102_AGENT/BAO_CAO_QA_R102.md` để biết phần nào đã kiểm thử, phần nào cần nghiệm thu trên máy cô.
