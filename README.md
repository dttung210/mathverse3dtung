# MATHVERSE R100 - BẢN TINH GỌN, GIỮ NGUYÊN CHỨC NĂNG

## Bắt đầu
- Dùng **Windows 10/11**, đã cài **Node.js 20 trở lên**.
- Nhấp đúp **`00_CHAY_MATHVERSE_R100.bat`**. Khi máy chủ hiện URL, truy cập đường dẫn được thông báo. Giữ cửa sổ BAT mở khi sử dụng.
- Chỉ một file BAT dùng để **chạy ứng dụng**. Không cần chạy các BAT phiên bản cũ.
- `CAI_DAT_AI.bat`: tùy chọn cấu hình Gemini API.
- `CAI_THU_VIEN_MO_RONG.bat`: chỉ khi cần các mô-đun mở rộng tùy chọn, dùng Internet.
- `00_COP_PROMPT_ANTIGRAVITY_R100.bat`: sao chép prompt nâng cấp hiện hành.
- `00_XEM_TRUOC_SAU_R100.bat`: mở ảnh và tư liệu so sánh có sẵn.

## Thành phần nguyên vẹn
- `src`, `data`, `server`, `vendor`: Lab Toán 6–12, kho bài toán, công cụ hình học và máy chủ.
- `dual`: Đại sảnh, Discovery, Museum, mô hình Parthenon quang trắc, GeoGebra và thư viện 3D.
- `game-park`: trò chơi và ngân hàng 3.150 câu nguồn, trong đó 3.087 câu qua kiểm tra cấu trúc (không đồng nghĩa thẩm định nội dung).
- `museum-assets`, `museum-thumbs`, `museum-data`: 230 infographic và ảnh xem trước theo catalog.
- `.cache`, `audit`, `tools`, `tests`, `integration-tests`: dữ liệu offline, mã kiểm thử và công cụ hỗ trợ.

## Những gì đã tinh gọn
- Giảm từ 80 file BAT xuống 5 file riêng công dụng trong thư mục gốc.
- Bỏ ảnh kiểm thử/ảnh trước–sau trùng lặp khỏi bộ cài đang chạy (có bản lưu trữ riêng để khôi phục khi cần).
- Bỏ một bản trùng byte của GLB quang trắc Parthenon 25,24 MiB và bản trùng ảnh; trang quản lý được chuyển sang đọc bản xuất bản chính thức.
- Giữ các mô hình được tải theo nguồn hiện có. Việc nhúng Sketchfab vẫn cần Internet và quyền của chủ mô hình.
- Tạo lại manifest checksum riêng cho gói tinh gọn vì manifest lịch sử đã lỗi thời ngay trong ZIP nguồn R100.

## Lưu ý quan trọng
- Bộ cài này dựa trên **R100 gốc mà cô vừa tải lên**, không tự động đưa các lỗi và giao diện biến đổi từ R101 vào.
- Dữ liệu quan trắc/địa cầu, bảo tàng và các hình GLB khác vẫn phụ thuộc nguồn bên ngoài hoặc giấy phép theo từng tài sản.
- Ảnh kiểm thử lịch sử và những BAT cũ nằm trong gói lưu trữ tùy chọn. Muốn phục hồi cần xem tài liệu và không nên ghi đè bừa lên bản đang chạy.
- Sau khi cài, nên thực hiện `npm run test:runtime` và `npm run verify:slim`, đồng thời kiểm tra giao diện trong trình duyệt thực.
