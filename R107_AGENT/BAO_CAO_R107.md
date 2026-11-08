# R107 — TRẠNG THÁI VÀ GIỚI HẠN ĐƯỢC CÔNG BỐ

- Nền: R105 FULL + bản UPDATE R106 do cô cung cấp, chỉ thay đổi những file liên quan Discovery.
- Di sản/kiến trúc: R106 có 24 điểm; R107 thêm 10 = 34 điểm. 25 hồ sơ phù hợp được phân loại trong `GALLERY_ITEMS`, nhưng phòng UNESCO được chia trang: 15 bục cũ và 10 bục mới luân phiên, 3 bục New7Wonders xuất hiện ở cả hai trang.
- Mỗi mục R107 có tiểu sử tiếng Việt, ảnh dẫn nhập Wikipedia/Wikimedia, URL Sketchfab ứng viên, tác giả/giấy phép nếu đã xác minh, URL hồ sơ UNESCO (nếu có), hình học 3D Three.js giáo dục và SVG 2D.
- R107 chưa tải mô hình GLB Sketchfab vào ZIP. Có nạp GLB hợp pháp sẵn qua công cụ R105. Không coi bản dựng hình học là quang trắc.
- Phòng B bổ sung 17 chủ đề ảnh thực tế vào 2 bộ; theo category Wikimedia Commons được kiểm tra **metadata từng tệp** lúc hiển thị. Vì không có mạng tải ảnh trong môi trường đóng gói, ZIP không chứa ảnh offline; ảnh chưa duyệt giữ trạng thái chờ, sơ đồ SVG luôn ghi rõ là minh họa.
- Giữ nguyên GLB Parthenon và data Lab/Museum/Công viên/Game. Không sửa cấu trúc nhà chính.
- Node tests R107 và hồi quy R95–R106 được mở rộng kỳ vọng theo tổng số mục mới (không xóa các assertion 6 cũ/11 cũ).
- Trình cài PowerShell xác minh SHA256 tệp nền R106, sao lưu và rollback nếu kiểm thử lỗi. Trình cài BAT chưa được thực thi trên Windows thực; cần nghiệm thu trên máy cô.
- Không có ảnh chụp nghiệm thu WebGL trong lượt đóng gói; cần kiểm tra Chrome/Edge thật trên Windows.
