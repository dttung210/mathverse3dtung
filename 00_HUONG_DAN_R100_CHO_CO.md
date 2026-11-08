# HƯỚNG DẪN MATHVERSE R100 CHO CÔ

## CÁCH CHẠY KHÔNG CẦN VIẾT MÃ
1. Giải nén ZIP **đầy đủ** trong thư mục mới, giữ nguyên mọi thư mục con.
2. Có sẵn Node.js từ phiên bản 20 trở lên. Nhấn đúp `00_CHAY_MATHVERSE_R100.bat` để chạy, ứng dụng tự mở trang web nội bộ.
3. Mở **DISCOVERY** → **PHÒNG UNESCO 3D**. Trong phòng có 14 bục chia hai dãy 7 kỳ quan, cùng mô hình quang trắc Parthenon đã duyệt tại khu trung tâm.
4. Đi đến bục và nhấn **E**, hoặc click hình trên bục. Cửa sổ sẽ mở **Sketchfab 3D ngay trong app** khi mạng cho phép, cạnh hồ sơ giới thiệu và ảnh nguồn.
5. Chọn **Sảnh địa cầu** hoặc **Bản đồ thế giới** để xem các điểm đánh dấu; bấm tên hoặc điểm của kỳ quan để mở đúng hồ sơ.
6. Chọn `00_XEM_TRUOC_SAU_R100.bat` để xem **ảnh nguồn R99 và sơ đồ bố trí R100**. Sơ đồ là bản kế hoạch, **không phải ảnh chụp WebGL thật**.
7. Muốn Agent Antigravity tiếp tục tối ưu: bấm `00_COP_PROMPT_ANTIGRAVITY_R100.bat`, mở Agent của Antigravity IDE và dán Ctrl+V.

## ĐIỂM QUAN TRỌNG
- Bộ cài R100 KHÔNG tải lại file Sketchfab bất hợp pháp; app nhúng 14 viewer dựa trên ID mô hình đã tra cứu. Nếu một mô hình bị chủ sở hữu khóa nhúng, nó có thể không hiển thị.
- Hình nền trên bục là thumbnail Sketchfab tải trực tuyến khi CORS cho phép; khi mất mạng vẫn còn đầy đủ biển tên và bục.
- Ảnh hồ sơ bên trái được lấy trực tuyến từ Wikipedia/Wikimedia (ảnh dẫn nhập) và gắn đường dẫn tới nguồn. Các kỳ quan cổ đại đã mất có thể chỉ có ảnh di tích/ảnh phục dựng; tuyệt đối không gọi đó là ảnh chụp nguyên bản.
- Parthenon hiện là mô hình GLB 3D quang trắc có sẵn trong R98; không bị xóa. Độ chính xác đo đạc chưa được chứng nhận.
- “Kỳ quan thế giới mới” 2007 là bình chọn của New7Wonders, **không do UNESCO tổ chức**. Một số địa điểm nằm trong vùng di sản UNESCO riêng.
- Vườn treo Babylon và vị trí tượng Colossus chưa được xác nhận chắc chắn; điểm bản đồ là điểm tham chiếu, không phải định vị khảo cổ chính xác.
- R99 chứa bộ 'kỳ quan thiên nhiên 7+7', nhưng phòng riêng này **đã ngừng kích hoạt trong R100** đúng yêu cầu, dữ liệu cũ vẫn lưu để không mất dữ liệu.

## KIỂM THỬ
Chạy `npm run test:r100`; các bước kiểm thử WebGL thực trên Windows + trình duyệt Chrome/Edge phải làm ở máy cô. Nếu trang không mở, kiểm tra Node.js và tường lửa/port. `00_CHAY_MATHVERSE_R100.bat` cho cửa sổ server chạy liên tục cho đến khi cô tắt.
