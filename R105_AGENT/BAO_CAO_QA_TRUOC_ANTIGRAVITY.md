# QA MATHVERSE R105 – trạng thái trước khi Antigravity tải GLB

**Nguồn gốc:** sửa trực tiếp từ tệp `MATHVERSE_R104_GLB_TREN_BUC_FULL.zip` giáo viên cung cấp ngày 07/11/2026. Không khởi tạo lại Lab hay Museum. Chỉ sửa mã nguồn Discovery và bổ sung pipeline + prompt R105.

## Đã thực hiện

- Bảo toàn file quang trắc `dual/discovery-r98/assets/unesco_parthenon_glb.glb` nguyên vẹn; SHA256: `e4b5091373259e067373630a3af4828c799e6cb3677dc2b28ac88c31b322562d`.
- Bảo toàn 18 điểm địa cầu/bản đồ và 9 bục hình học + Parthenon hiện có.
- Bổ sung pipeline `tools/r105-sketchfab-pipeline.mjs`: kiểm tra nguồn/license; Download API OAuth chính thức; giải nén ZIP có kiểm tra CRC, chặn traversal; gọi chuyển đổi glTF→GLB; kiểm tra GLB glTF 2.0/lưới; tự sao lưu và cập nhật manifest.
- Bổ sung `R105_AGENT/PROMPT_ANTIGRAVITY_R105.md`, danh mục 9 nguồn trích từ mã R104, workflow Antigravity, menu BAT khởi động/sao chép prompt/audit và bản báo cáo nguồn.
- Bổ sung ghi nguồn trên bục sau khi GLB thật được nạp và trường “GLB trên bục” trong giao diện R100 đã ổn định.
- Kiểm thử `npm run test:r105`: **40/40 PASS**, bao gồm hồi quy R95–R98 và test R104, test pipeline ZIP/GLB.
- Kiểm thử bổ sung 310 mô hình Toán 6–12 và Công viên: **18/18 PASS** (lựa chọn representative Lab+Park).
- Máy chủ `server/host.mjs` trả HTTP 200 cho app, UI, Gallery, manifest, Parthenon GLB. URL `/dual/` trả 404 theo thiết kế gốc, URL ứng dụng chính là `/`.

## Giới hạn KHÔNG được báo sai

- `dual/discovery-r103/assets/approved-local-models.json` **đang rỗng**. Chưa có 9 GLB Sketchfab mới trong ZIP R105; 9 bục vẫn hiển thị mô hình học thuật R104 cho tới khi Antigravity được cấp quyền tải.
- Chưa đăng nhập OAuth trên tài khoản người dùng. Không có quyền tải GLB từ Sketchfab chỉ dựa vào iframe; pipeline được đóng gói để Agent thực hiện khi có quyền chính thức.
- Trình duyệt Chromium của môi trường biên soạn trả `ERR_BLOCKED_BY_ADMINISTRATOR` khi mở localhost, nên **chưa chụp/kiểm chứng hình WebGL thực tế**. Antigravity cần nghiệm thu trong Chrome/Edge của giáo viên.
- Các URL/UID/tác giả của 9 mục là **nguồn ứng viên từ ZIP R104**, không tự coi đã xác minh giấy phép, đúng công trình hay chất lượng quang trắc.
- `@gltf-transform/cli` là công cụ chuyển đổi tùy chọn cho Agent, có thể cần Internet khi lần đầu sử dụng. Không có lý do bắt giáo viên cài Python.

## Điều kiện để báo “đã tích hợp GLB thật” cho từng công trình

Tệp `.glb` có chữ ký glTF 2.0, mesh/texture đúng công trình, license tải & phân phối rõ ràng, nguồn/tác giả/SHA256 lưu trong manifest, hình dựng trên bục thực tế chụp được, góc nhìn/camera/scale ổn, nguồn được ghi trong giao diện. Thiếu một trong các yêu cầu thì trạng thái phải là **chưa nghiệm thu**.
