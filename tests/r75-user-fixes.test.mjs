import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'G:/ANTIGRAVITY/MATHVERSE GAME/MATHVERSE_FINAL_DA_SUA_TRUC_TIEP_2026-11-02/MATHVERSE_GRAND_CAMPUS_FINAL_TOAN_6_12';

test('Topbar layout: 4 clean semantic clusters without overlapping controls', () => {
  const html = fs.readFileSync(path.join(ROOT, 'dual/index.html'), 'utf8');
  assert.ok(html.includes('class="top-group" aria-label="Nhân vật và Góc nhìn"'), 'Nhóm Nhân vật và Góc nhìn hiện diện');
  assert.ok(html.includes('class="top-group" aria-label="Hiển thị"'), 'Nhóm Hiển thị hiện diện');
  assert.ok(html.includes('class="top-group" aria-label="Điều hướng và Bản đồ"'), 'Nhóm Điều hướng hiện diện');
  assert.ok(html.includes('class="top-group" aria-label="Tiện ích"'), 'Nhóm Tiện ích hiện diện');
});

test('Exhibition dialog: no upload buttons, no copy latex, all 18 offline assets present', () => {
  const boot = fs.readFileSync(path.join(ROOT, 'src/exhibition/boot.mjs'), 'utf8');
  assert.ok(!boot.includes('id="choose-image"'), 'Không có nút Thay ảnh của cô');
  assert.ok(!boot.includes('id="reset-image"'), 'Không có nút Đặt lại ảnh nguồn');
  assert.ok(!boot.includes('id="copy-latex"'), 'Không có nút Sao chép LaTeX');
  assert.ok(!boot.includes('id="upload-zone"'), 'Không có vùng upload-zone');
  assert.ok(!boot.includes('id="file-portrait"'), 'Không có input file-portrait');

  const avail = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/exhibition/assets/available.json'), 'utf8'));
  const assetKeys = Object.keys(avail);
  assert.equal(assetKeys.length, 18, 'Đủ 18 nhà toán học trong available.json');
  for (const k of assetKeys) {
    assert.equal(avail[k], true, `${k} phải có cờ true`);
    assert.ok(fs.existsSync(path.join(ROOT, `src/exhibition/assets/${k}.jpg`)), `File ảnh ${k}.jpg phải tồn tại`);
  }
});

test('Exhibition dialog: math formulas formatted beautifully without raw LaTeX symbols', () => {
  const boot = fs.readFileSync(path.join(ROOT, 'src/exhibition/boot.mjs'), 'utf8');
  assert.ok(boot.includes('MATH_TYPOGRAPHY'), 'Có định nghĩa bảng ký hiệu toán học chuẩn mực');
  assert.ok(boot.includes('MATH_TYPOGRAPHY[p.id]'), 'Hiển thị công thức dạng HTML đẹp');
  assert.ok(boot.includes('math-frac'), 'Phân số toán học có thẻ math-frac chuyên nghiệp');
});

test('Museum wall: libInner removed, preventing text overlap on back wall banner', () => {
  const museum = fs.readFileSync(path.join(ROOT, 'src/museum.js'), 'utf8');
  assert.ok(!museum.includes("labelSprite('KHÔNG GIAN TRIỂN LÃM & TÀI LIỆU TOÁN HỌC'"), 'libInner đã bị xóa bỏ hoàn toàn');
});

test('Wonder Park collision: pedestals, central shrine and gate posts have physical collision boundaries', () => {
  const parkWorld = fs.readFileSync(path.join(ROOT, 'dual/wonder-park-world.mjs'), 'utf8');
  assert.ok(parkWorld.includes('const rPedestal=8.85;'), 'Bục 10 trò chơi có bán kính va chạm 8.85m');
  assert.ok(parkWorld.includes('const centralRadius=12.8;'), 'Bục trung tâm Thích Học Bá có bán kính va chạm 12.8m');
  assert.ok(parkWorld.includes('const postRadius=2.1;'), 'Cột cổng chào Khải Hoàn Môn có bán kính va chạm 2.1m');
});
