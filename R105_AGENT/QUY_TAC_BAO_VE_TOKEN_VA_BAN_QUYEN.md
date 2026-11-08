# CHÍNH SÁCH TÍCH HỢP SKETCHFAB R105

- Chỉ dùng **Sketchfab OAuth** khi cô đồng ý cấp quyền trong giao diện nhà cung cấp. Không yêu cầu cô gửi mật khẩu, cookie hay access token qua chat.
- Không lưu access token vào ZIP, `.git`, `approved-local-models.json`, README hoặc đường dẫn tạm thời; chỉ dùng biến môi trường của phiên Terminal riêng, xoá khi kết thúc.
- Gọi API chính thức: `https://api.sketchfab.com/v3/models/{UID}/download` với `Authorization: Bearer ...`.
- Gói tải glTF có URL ký tạm; không lưu lại URL này. Không dùng công cụ vượt API, không bóc mesh từ cache iframe.
- Xác minh loại giấy phép trước khi thay bệ và trước khi phân phối ZIP. Tự động cho phép CC0, CC BY, CC BY-SA được xác minh; loại NC, ND, Editorial, Unknown phải được thẩm định riêng hoặc dừng. Luôn ghi công tác giả, URL nguồn, license trong ứng dụng.
- Dù là mô hình tải hợp lệ, không tự gọi là photogrammetry; phân biệt dựng thủ công, phục dựng và quang trắc.
- Nguồn chính thức: https://sketchfab.com/developers/download-api/downloading-models ; https://sketchfab.com/developers/download-api/guidelines ; https://sketchfab.com/developers/oauth .
