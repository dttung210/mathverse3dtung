# MATHVERSE FINAL – HƯỚNG DẪN ƯU TIÊN CHO ANTIGRAVITY

Đây là dự án FINAL với **11 trò chơi 3D, 7 lớp Toán 6–12, 63 chương, 3.150 câu nguồn**; 3.087 câu đủ điều kiện kiểm tra cấu trúc và 63 câu tạm khóa. Khi người dùng yêu cầu chạy, rà lỗi hoặc nâng cấp bản FINAL, đọc **`00_PROMPT_ANTIGRAVITY_MATHVERSE_FINAL_SAO_CHEP.txt`** trước. Đây là chỉ dẫn ưu tiên cho các tác vụ FINAL, cao hơn hướng dẫn riêng R7.4 bên dưới.

- Không tạo ứng dụng mới, không xóa/ghi đè dữ liệu 6–12, không tự sửa đáp án hoặc mở khóa 63 câu.
- Giữ nguyên cấu trúc scene Three.js, LAB, Bảo tàng, Sảnh chung, 11 game và hệ thống chọn lớp/chương.
- Kiểm tra `node tools/verify-mathverse-final.mjs` và `npm run check:final` trước/sau khi sửa.
- Mọi sửa đổi cần sao lưu, nêu file thay đổi và giới hạn nghiệm thu thực tế.
- Hướng dẫn cài bằng tiếng Việt cho giáo viên không biết lập trình: `HUONG_DAN_DAN_PROMPT_ANTIGRAVITY_FINAL.md`.

---

## Hướng dẫn kế thừa dành RIÊNG cho tác vụ nâng cấp đồ họa R7.4

# Antigravity / coding agent guidelines for MATHVERSE R7.4 3D graphics

- The owner is a mathematics teacher. Reply in Vietnamese, call her "cô".
- The repo is a complete web app; run `npm start` (Node.js >=20); no `npm install` needed.
- **Goal**: improve 3D visual quality of the outer museum, not the math content.
- Read `00_PROMPT_ANTIGRAVITY_TU_NANG_CAP_DO_HOA_3D.txt` first.
- Treat `src/graphics-r74/*` as the native, integrated visual-architecture subsystem.
- Do not overwrite or use the old NextGen addons.
- Preserve 7 grades, 34 thematic rooms, all existing Labs, 310 math models,
  the exhibition's 11 portraits / 14 corridor art panels / 2 GeoGebra pedestals.
- The museum engine uses vendored Three.js revision 161 and existing WebGL renderer.
- Preserve existing IDs, navigation, event handlers, render quality, camera and UI actions.
- Do not modify `src/math6-lab`, `src/curriculum`, `src/portal-labs`,
  `src/studio`, `src/geometry.js` or `data` for appearance-only changes.
- Evaluate quality with `npm run check:graphics`; compare `npm test` with the
  pre-existing baseline (13 fails in the owner's original integrated ZIP).
- After edits, give an explicit list of changed files and browser screenshots when available.
- Do not claim GPU/WebGL test success unless running with real graphics output.
