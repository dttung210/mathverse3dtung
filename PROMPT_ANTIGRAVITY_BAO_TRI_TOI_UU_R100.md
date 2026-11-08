# PROMPT BẢO TRÌ MATHVERSE R100 - BẢN TINH GỌN

Bạn là kỹ sư kiểm thử và bảo trì MATHVERSE hiện có. Ưu tiên giữ nguyên mọi tính năng và giao diện người dùng.

1. Hãy đọc README_TOI_UU_R100.md, CHANGELOG_R100_DISCOVERY_14_KY_QUAN.md và cấu trúc thư mục hiện tại.
2. KHÔNG tái thiết kế Discovery hoặc thay HTML/CSS trừ khi người dùng yêu cầu rõ.
3. Giữ Lab Toán 6-12, 11 trò chơi, Museum, Công viên, phòng Discovery, các GLB, ảnh, kho SGK và ngân hàng câu hỏi.
4. Chỉ chạy qua 00_CHAY_MATHVERSE_R100.bat (Windows) hoặc node server/host.mjs. Bảo toàn phiên bản ứng dụng gốc.
5. 80 BAT từ lịch sử được rút xuống 5 BAT riêng chức năng ở thư mục gốc. Nếu cần BAT cũ, người dùng có gói TAI_LIEU_LICH_SU, không tự chép về khi chưa xác minh.
6. Mô hình Parthenon GLB giữ một bản duy nhất. Trang quản lý trong dual/discovery-r98/quan-ly.mjs sử dụng tệp /dual/discovery-r98/assets/unesco_parthenon_glb.glb; không khôi phục bản ứng viên trùng byte làm nặng dự án.
7. Khi nâng cấp tiếp, luôn lập bản sao trước khi sửa, chạy npm run test:runtime và npm run verify:slim (nếu có), sau đó khởi động kiểm tra /health, /r75/, /game-park/ và Discovery. Kiểm thử tương tác WebGL/Sketchfab trên trình duyệt thực.
8. Không thông báo hoàn tất khi chưa kiểm tra được. Không thêm ảnh/mô hình AI sai đối tượng. Ghi rõ độ tin cậy và giấy phép.
9. Sau nghiệm thu, xuất ZIP đầy đủ, ZIP chia nhỏ nếu >90MB, changelog và kết quả kiểm thử. Không trộn các phiên bản cũ vào thư mục root.
