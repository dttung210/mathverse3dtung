# /r105-nap-glb-sketchfab-vao-buc

Workflow: mở `R105_AGENT/PROMPT_ANTIGRAVITY_R105.md` rồi làm đúng từng mục; bắt đầu `npm run audit:r105` và đọc `R105_AGENT/DANH_MUC_NGUON_9_BUC.md`. Không tạo app khác.

Mục tiêu: thay minh họa hình học R104 trên 9 bục bằng GLB có phép được tải đúng công trình, cùng GLTFLoader và manifest `dual/discovery-r103/assets/approved-local-models.json`. Phải tự mở Sketchfab bằng trình duyệt, xác minh từng nguồn và kết nối OAuth chính thức khi cô cho phép. Không gửi token vào chat hoặc lưu nó trong ZIP. Các mô hình chưa có quyền tải phải giữ nguyên bệ hiện hành, ghi rõ nguyên nhân. Bảo toàn Parthenon GLB và tất cả chức năng cũ.

Kiểm thử: `npm run test:r105`, `npm run audit:r105`, `npm run verify:r105`; mở ứng dụng và chụp ảnh WebGL thật; báo đầy đủ kết quả.
