import test from 'node:test';
import assert from 'node:assert/strict';
import { planRadialChapterGates, planClassroomPortalArc } from '../src/museum/curriculum-chapter-layout.mjs';

const MOCK_CONFIGS = {
  6: { x: -54, zSide: 1 },
  7: { x: -54, zSide: -1 },
  8: { x: -18, zSide: 1 },
  9: { x: -18, zSide: -1 },
  10: { x: 18, zSide: 1 },
  11: { x: 18, zSide: -1 },
  12: { x: 54, zSide: 1 }
};

test('Radial Chapter Gates: Bố trí các cổng an toàn, không va chạm và nằm gọn trong phòng học', () => {
  for (const grade of [6, 7, 8, 9, 10, 11, 12]) {
    const cfg = MOCK_CONFIGS[grade];
    const gates = planRadialChapterGates(grade, cfg);
    assert.ok(gates.length >= 6 && gates.length <= 9, `Lớp ${grade} có ${gates.length} cổng chương`);

    const isPos = cfg.zSide === 1;
    const minZ = isPos ? 8.5 : -47.5;
    const maxZ = isPos ? 47.5 : -8.5;
    const minX = cfg.x - 16.5;
    const maxX = cfg.x + 16.5;

    for (let i = 0; i < gates.length; i++) {
      const g = gates[i];
      // Kiểm tra nằm trong phạm vi phòng học
      assert.ok(g.x >= minX && g.x <= maxX, `Cổng ${g.chapterId} x=${g.x} nằm trong giới hạn [${minX}, ${maxX}]`);
      assert.ok(g.z >= minZ && g.z <= maxZ, `Cổng ${g.chapterId} z=${g.z} nằm trong giới hạn [${minZ}, ${maxZ}]`);

      // Kiểm tra khoảng cách với các cổng khác >= 4.0m
      for (let j = i + 1; j < gates.length; j++) {
        const other = gates[j];
        const dist = Math.hypot(g.x - other.x, g.z - other.z);
        assert.ok(dist >= 4.0, `Khoảng cách giữa cổng ${g.chapterId} và ${other.chapterId} là ${dist.toFixed(2)}m (yêu cầu >= 4m)`);
      }
    }
  }
});

test('Classroom Portal Arc: Chừa hành lang nhìn thẳng bảng xanh không bị che khuất', () => {
  for (const grade of [6, 7, 8, 9, 10, 11, 12]) {
    const cfg = MOCK_CONFIGS[grade];
    const count = grade === 6 ? 4 : 5;
    const arc = planClassroomPortalArc(grade, cfg, count);
    assert.equal(arc.length, count);
    for (let i = 0; i < arc.length; i++) {
      // Không có cổng nào nằm chắn chính giữa lối nhìn thẳng lên bảng (|x - cfg.x| >= 5.2m)
      assert.ok(Math.abs(arc[i].x - cfg.x) >= 5.2, `Cổng ${i} lớp ${grade} không chắn chính diện bảng xanh`);
      for (let j = i + 1; j < arc.length; j++) {
        const d = Math.hypot(arc[i].x - arc[j].x, arc[i].z - arc[j].z);
        assert.ok(d >= 6.5, `Khoảng cách giữa hai cổng thực tế >= 6.5m (thực tế: ${d.toFixed(2)}m)`);
      }
    }
  }
});
