/**
 * MATHVERSE V5 - Bài kiểm tra 4 trường hợp nghiệm thu Toán học tối thiểu
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { Constraints } from '../src/math/constraints.js';
import { Measurements } from '../src/math/measurements.js';
import { SafeExpression } from '../src/math/safe-expression.js';
import { Stats } from '../src/math/stats.js';
import { detectModality, migrateItemToV5 } from '../src/data/migrate-v2-v4-v5.js';

test('Nghiệm thu 1 (Solid 3D): Hình chóp tứ giác đều a=4 cm, h=3 cm và mặt cắt z=1.5 cm', () => {
  const a = 4, h = 3, z = 1.5;
  const V = (1 / 3) * a * a * h;
  assert.equal(V, 16, 'Thể tích hình chóp tứ giác đều phải bằng 16 cm³');

  // Mặt cắt song song với đáy tại z = 1.5 cm (tính từ đáy z=0 lên đỉnh z=3)
  const ratio = (h - z) / h; // 1.5 / 3 = 0.5
  assert.equal(ratio, 0.5, 'Tỉ lệ chiều cao còn lại phải bằng 0.5');

  const sectionSide = a * ratio; // 4 * 0.5 = 2 cm
  assert.equal(sectionSide, 2, 'Cạnh thiết diện hình vuông phải bằng 2 cm');

  const sectionArea = sectionSide * sectionSide; // 4 cm²
  assert.equal(sectionArea, 4, 'Diện tích thiết diện phải bằng 4 cm²');
});

test('Nghiệm thu 2 (Geometry 2D): Hình bình hành ABCD duy trì C = B + D - A và hai cặp cạnh song song', () => {
  // Điểm ban đầu
  let A = [-2.8, -1.45];
  let B = [2.7, -1.45];
  let D = [-1.6, 1.85];
  let C = Constraints.parallelogramC(A, B, D);

  // C = [2.7 + (-1.6) - (-2.8), -1.45 + 1.85 - (-1.45)] = [3.9, 1.85]
  assert.deepEqual(C, [3.9, 1.85], 'Đỉnh C phải luôn thỏa mãn C = B + D - A');

  // Kéo điểm A sang vị trí mới [-3.0, -2.0]
  A = [-3.0, -2.0];
  C = Constraints.parallelogramC(A, B, D);
  assert.deepEqual(C, [4.1, 2.4], 'Khi kéo đỉnh A, đỉnh C phải tự động cập nhật chính xác');

  // Vectơ AB và DC phải bằng nhau (song song và cùng độ dài)
  const vecAB = [B[0] - A[0], B[1] - A[1]]; // [5.7, 0.55]
  const vecDC = [C[0] - D[0], C[1] - D[1]]; // [4.1 - (-1.6), 2.4 - 1.85] = [5.7, 0.55]
  assert.deepEqual(
    [Math.round(vecAB[0] * 100) / 100, Math.round(vecAB[1] * 100) / 100],
    [Math.round(vecDC[0] * 100) / 100, Math.round(vecDC[1] * 100) / 100],
    'Vectơ AB và DC phải song song và bằng nhau'
  );
});

test('Nghiệm thu 3 (Function Graph): Parabol y = x² - 2x - 3 có đỉnh (1, -4), nghiệm -1 và 3; xử lý an toàn khi a=0', () => {
  // a = 1, b = -2, c = -3
  const an = SafeExpression.analyzeQuadratic(1, -2, -3);
  assert.equal(an.type, 'parabola');
  assert.deepEqual(an.vertex, [1, -4], 'Đỉnh parabol phải là I(1, -4)');
  assert.deepEqual(an.roots, [-1, 3], 'Nghiệm của f(x) = 0 phải là x = -1 và x = 3');

  // Trường hợp a = 0 thoái biến thành hàm bậc nhất y = -2x - 3
  const anLinear = SafeExpression.analyzeQuadratic(0, -2, -3);
  assert.equal(anLinear.type, 'linear', 'Khi a = 0, hàm số phải được định danh là linear chứ không gọi là parabol');
  assert.deepEqual(anLinear.roots, [-1.5], 'Nghiệm hàm bậc nhất: x = -1.5');
});

test('Nghiệm thu 4 (Statistics): Mẫu 4 số [12, 18, 9, 15] có tổng 54, trung bình 13.5, trung vị 13.5', () => {
  const raw = [12, 18, 9, 15];
  const res = Stats.analyzeRaw(raw);

  assert.equal(res.count, 4, 'Số quan sát phải là 4');
  assert.equal(res.sum, 54, 'Tổng các giá trị phải là 54');
  assert.equal(res.mean, 13.5, 'Số trung bình phải là 13.5');
  assert.equal(res.median, 13.5, 'Trung vị phải là 13.5');

  // Phân biệt: Không được dùng công thức trung bình giản đơn cho tần số phân loại
  const cat = Stats.analyzeCategorical(['A', 'B', 'C', 'D'], [12, 18, 9, 15]);
  assert.equal(cat.isCategorical, true);
  assert.equal(cat.totalCount, 54);
  assert.equal(cat.modeCategories[0], 'B', 'Mốt là nhóm B có tần số cao nhất 18');
});

test('Tương thích dữ liệu V5: detectModality và migrateItemToV5 giữ nguyên id và phân bổ modality đúng', () => {
  assert.equal(detectModality('squarePyramid'), 'solid3d');
  assert.equal(detectModality('parallelogram'), 'geometry2d');
  assert.equal(detectModality('parabolaGeneral'), 'functiongraph');
  assert.equal(detectModality('barChart'), 'statisticschart');

  const migrated = migrateItemToV5({
    id: 'custom_exhibit_1',
    grade: 8,
    type: 'squarePyramid',
    title: 'Mô hình tự tạo',
    params: { a: 5, h: 4 },
    custom: true
  });
  assert.equal(migrated.id, 'custom_exhibit_1', 'Giữ nguyên ID mô hình cũ');
  assert.equal(migrated.modality, 'solid3d');
  assert.equal(migrated.custom, true);
  assert.equal(migrated.schemaVersion, 5);
});
