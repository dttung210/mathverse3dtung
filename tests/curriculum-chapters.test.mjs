import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CURRICULUM_CHAPTERS_MANIFEST,
  getChaptersForGrade,
  getChapterById,
  getCurriculumModelById,
  getCurriculumModelByNumber,
  getAllCurriculumModels
} from '../src/curriculum/curriculum-manifest.mjs';
import { MODE_BY_ID } from '../src/museum/r6-room-layout.js';

test('Curriculum Chapter Manifest: 310 mô hình phân bổ trọn vẹn 58 Chương Toán 6-12', () => {
  const allModels = getAllCurriculumModels();
  assert.equal(allModels.length, 310, 'Phải có chính xác 310 mô hình');
  assert.equal(CURRICULUM_CHAPTERS_MANIFEST.totalModels, 310);
  assert.equal(CURRICULUM_CHAPTERS_MANIFEST.totalChapters, 58);

  // Kiểm tra số thứ tự từ 1 đến 310 liên tục không gián đoạn
  const nums = new Set();
  const ids = new Set();
  for (let i = 1; i <= 310; i++) {
    const m = getCurriculumModelByNumber(i);
    assert.ok(m, `Mô hình số ${i} phải tồn tại`);
    assert.equal(m.num, i);
    assert.ok(!nums.has(i), `Số thứ tự ${i} không được trùng lặp`);
    assert.ok(!ids.has(m.id), `Mã mô hình ${m.id} không được trùng lặp`);
    nums.add(i);
    ids.add(m.id);

    // Xác thực mô hình tồn tại trong kho tổng hợp MODE_BY_ID
    const existing = MODE_BY_ID.get(m.id);
    assert.ok(existing, `Mô hình ${m.id} (số ${i}) phải tồn tại trong kho MODE_BY_ID của Mathverse`);
  }

  assert.equal(nums.size, 310);
  assert.equal(ids.size, 310);
});

test('Curriculum Chapter Manifest: Kiểm tra số lượng Chương và Mô hình theo từng Khối Lớp', () => {
  const expected = [
    { grade: 6, chapters: 9, models: 64 },
    { grade: 7, chapters: 8, models: 38 },
    { grade: 8, chapters: 8, models: 40 },
    { grade: 9, chapters: 9, models: 45 },
    { grade: 10, chapters: 9, models: 38 },
    { grade: 11, chapters: 9, models: 46 },
    { grade: 12, chapters: 6, models: 39 }
  ];

  let totalCh = 0;
  let totalMod = 0;

  for (const exp of expected) {
    const chapters = getChaptersForGrade(exp.grade);
    assert.equal(chapters.length, exp.chapters, `Lớp ${exp.grade} phải có đúng ${exp.chapters} Chương`);

    let gradeModelCount = 0;
    for (const ch of chapters) {
      assert.ok(ch.id.startsWith(`G${exp.grade}-CH`), `ID chương phải có tiền tố G${exp.grade}-CH`);
      assert.ok(ch.title, 'Chương phải có tiêu đề');
      assert.ok(ch.number, 'Chương phải có số La Mã');
      for (const les of ch.lessons) {
        assert.ok(les.lesson > 0, 'Bài phải có số thứ tự');
        assert.ok(les.title, 'Bài phải có tiêu đề');
        gradeModelCount += les.models.length;
      }
    }

    assert.equal(gradeModelCount, exp.models, `Lớp ${exp.grade} phải có đúng ${exp.models} mô hình`);
    totalCh += chapters.length;
    totalMod += gradeModelCount;
  }

  assert.equal(totalCh, 58, 'Tổng số cổng chương toàn trường phải là 58');
  assert.equal(totalMod, 310, 'Tổng số mô hình toàn trường phải là 310');
});

test('Curriculum Chapter Manifest: Kiểm tra các mô hình chuyển lớp đặc thù', () => {
  // Mô hình 041 (7-01-C03: Làm tròn số) chuyển sang Lớp 6 Bài 30
  const m41 = getCurriculumModelByNumber(41);
  assert.equal(m41.id, '7-01-C03');
  assert.equal(m41.grade, 6);
  assert.equal(m41.lessonNum, 30);

  // Mô hình 123 (7-10-C02) chuyển sang Lớp 8 Bài 31
  const m123 = getCurriculumModelByNumber(123);
  assert.equal(m123.id, '7-10-C02');
  assert.equal(m123.grade, 8);
  assert.equal(m123.lessonNum, 31);

  // Mô hình 124 (9-13-C03) chuyển sang Lớp 8 Bài 32
  const m124 = getCurriculumModelByNumber(124);
  assert.equal(m124.id, '9-13-C03');
  assert.equal(m124.grade, 8);
  assert.equal(m124.lessonNum, 32);

  // Mô hình 125 (7-10-C03) chuyển sang Lớp 8 Bài 32
  const m125 = getCurriculumModelByNumber(125);
  assert.equal(m125.id, '7-10-C03');
  assert.equal(m125.grade, 8);
  assert.equal(m125.lessonNum, 32);
  assert.equal(m125.sourceLabId, '7-10');
  assert.equal(m125.targetLabId, '8-08');

  // Mô hình 004 (toan6-bac-thang-khoi) chuyển từ G6-R04-L03 sang G6-R03-L01 (Lớp 6 Chương I Bài 4)
  const m4 = getCurriculumModelByNumber(4);
  assert.equal(m4.id, 'toan6-bac-thang-khoi');
  assert.equal(m4.grade, 6);
  assert.equal(m4.lessonNum, 4);
  assert.equal(m4.sourceLabId, 'G6-R04-L03');
  assert.equal(m4.targetLabId, 'G6-R03-L01');

  // Kiểm tra Lớp 12 Chương V (Bài 14, 15, 16, 17) và Chương VI (Bài 18, 19)
  const g12Ch5 = getChapterById('G12-CH05');
  assert.deepEqual(g12Ch5.lessons.map(l => l.lesson), [14, 15, 16, 17]);
  const g12Ch6 = getChapterById('G12-CH06');
  assert.deepEqual(g12Ch6.lessons.map(l => l.lesson), [18, 19]);
  assert.equal(getCurriculumModelByNumber(302).id, '12-08-C04');
  assert.equal(getCurriculumModelByNumber(303).id, '12-09-C04');
  assert.equal(getCurriculumModelByNumber(307).id, '12-11-C02');
  assert.equal(getCurriculumModelByNumber(310).id, '12-11-C03');
});
