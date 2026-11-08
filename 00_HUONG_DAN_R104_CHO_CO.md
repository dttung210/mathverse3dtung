# HƯỚNG DẪN R104 CHO CÔ — KHÔNG CẦN LẬP TRÌNH

**Nếu cô đã có R103:** tải ZIP bản vá nhỏ R103 → R104, giải nén bộ bản vá, nhấn đúp `00_CAP_NHAT_R103_LEN_R104.bat` rồi nhập đường dẫn tới thư mục dự án R103.

**Nếu chưa có R103:** giải nén bộ R104 đầy đủ vào thư mục mới.

## Cách chạy

Nhấn đúp `00_MO_MATHVERSE_R104.bat` → chọn **1** để mở ứng dụng. Truy cập Discovery → Phòng UNESCO. Mỗi bục đều có mô hình 3D ở trên; kéo chuột để xoay mô hình, tới gần nhấn **E** để xem ảnh thực tế, tiểu sử, Sketchfab và hình học 2D/3D.

## Cách thay mô hình minh họa bằng mô hình 3D kiến trúc giống Parthenon

Cách A — nạp trong phiên: mở hồ sơ công trình từ phòng UNESCO → nhấn `⬆ ĐẶT GLB LÊN BỤC` → chọn GLB hợp pháp đã tải. Mô hình được đưa vào khung Three.js trên bệ ngay nhưng mất sau khi đóng ứng dụng.

Cách B — nạp lưu vĩnh viễn: bấm đúp `00_NAP_GLB_VAO_BUC_R104.bat`, nhập đường dẫn GLB, chọn đúng bục, điền **tác giả – giấy phép – URL nguồn** và gõ `DONG_Y`. Mở lại R104: chương trình tự tìm và nạp mô hình thật, thay mô hình minh họa. Tệp GLB và manifest nằm trong `dual/discovery-r103/assets/`.

**QUAN TRỌNG:** Không có cách nào biến một iframe Sketchfab thành mesh Three.js chỉ bằng đổi CSS. Chỉ những mô hình được tác giả cho phép tải, có tệp `.glb` mới có thể được đưa ra bục đúng kỹ thuật. Gói R104 hiện giữ mô hình hình học khi cô chưa nạp GLB.

## Khi cô cần tiếp tục làm trong Antigravity

Chọn **4** tại menu BAT R104 để sao chép file `R104_AGENT/PROMPT_ANTIGRAVITY_R104.md`, dán vào Antigravity Agent.

## Xử lý lỗi

- Nếu mô hình cũ vẫn hiện, đóng tab trình duyệt và nhấn Ctrl+Shift+R sau khi mở lại ứng dụng.
- Nếu GLB tải vào không hiện, kiểm tra quyền tải, định dạng glTF 2.0, số tam giác, dung lượng dưới 180 MB, giấy phép, nguồn chính xác.
- Không được đưa tệp GLB tải bất hợp pháp hoặc chưa rõ giấy phép vào ZIP công khai.
