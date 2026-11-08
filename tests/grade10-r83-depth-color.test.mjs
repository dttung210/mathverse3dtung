import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  GRADE10_IDS,
  grade10Defaults,
  grade10Math,
  grade10Valid
} from '../src/curriculum/grade10-engine.mjs';
import { grade10SceneSVG } from '../src/curriculum/grade10-svg.mjs';
import { graphExperiment, graphDefaults } from '../src/curriculum/graph-models.mjs';
import { createMathModel } from '../src/geometry.js';

test('R83-T01: Tập hợp 10-01-C01..C04 bất biến công thức và quét một chiều', () => {
  const m1 = grade10Math('10-01-C01', { ...grade10Defaults('10-01-C01'), onlyA: 4, both: 3, onlyB: 5, outside: 2 }).result;
  assert.equal(m1.intersection, 3);
  assert.equal(m1.union, 12);
  assert.equal(m1.total, 14);

  const m4 = grade10Math('10-01-C04', grade10Defaults('10-01-C04')).result;
  assert.deepEqual(m4.intersection, [-1, 2]);
  assert.deepEqual(m4.union, [[-3, 4]]);
});

test('R83-T02: Bất phương trình & Quy hoạch tuyến tính 10-02-C01..C03', () => {
  const lp = grade10Math('10-02-C03', { a: 1, b: 1, c: 4, d: 1, e: -1, f: 2, u: 2, v: 1 }).result;
  assert.ok(lp.vertices.length >= 3);
  assert.ok(lp.objective && Number.isFinite(lp.objective.value));
});

test('R83-T03: Hệ thức lượng trong tam giác 10-03-C01..C03 (Cosin, Sin, Diện tích)', () => {
  const tri = grade10Math('10-03-C01', { base: 4, cx: 0, cy: 3 }).result;
  assert.ok(Math.abs(tri.a - 5) < 1e-9);
  assert.ok(Math.abs(tri.a2 - (tri.b2 + tri.c2 - tri.twoBcCosA)) < 1e-9);
  assert.ok(Math.abs(tri.a / Math.sin(tri.angA) - 2 * tri.R) < 1e-9);
  assert.ok(Math.abs(tri.area - 6) < 1e-9);
});

test('R83-T04: Vectơ & Tọa độ Oxy 10-04-C01..C04 và 10-05-C01..C03', () => {
  const add = grade10Math('10-04-C01', { ux: 3, uy: 1, vx: 1, vy: 2.5, k: 1.5 }).result;
  assert.deepEqual(add.resultant, [4, 3.5]);

  const sub = grade10Math('10-04-C02', { ux: 3, uy: 1, vx: 1, vy: 2.5, k: 1.5 }).result;
  assert.deepEqual(sub.resultant, [2, -1.5]);

  const dot = grade10Math('10-04-C04', { ux: 2, uy: 3, vx: -3, vy: 2, k: 1 }).result;
  assert.equal(dot.dot, 0);
  assert.ok(Math.abs(dot.angle - Math.PI / 2) < 1e-9);
});

test('R83-T05: Hàm số bậc hai 10-06-C01..C03 có đường tham chiếu và màu có chủ đích R83', () => {
  const q1 = graphExperiment('10-06-C01', graphDefaults('10-06-C01'));
  assert.equal(q1.check, true);
  assert.equal(q1.series[0].color, '#1D4ED8');
  assert.equal(q1.series[1].color, '#15803D');
  assert.equal(q1.series[1].dashed, true);
  assert.equal(q1.markers[0].color, '#6D28D9');

  const q2 = graphExperiment('10-06-C02', graphDefaults('10-06-C02'));
  assert.equal(q2.check, true);
  assert.equal(q2.series[0].color, '#1D4ED8');
  assert.equal(q2.series[1].color, '#15803D');
});

test('R83-T06: Đường thẳng, Đường tròn, Ba đường Conic 10-07..10-09', () => {
  const ln = grade10Math('10-07-C04', { a: 3, b: -4, c: 2, d: 1, e: 2, f: -3, px: 1, py: 2 }).result;
  assert.ok(Math.abs(ln.distance - 3 / 5) < 1e-9);

  const cir = grade10Math('10-08-C02', { h: 0, k: 0, r: 3, angle: 45, m: 0, q: 3 }).result;
  assert.equal(cir.intersections.length, 1);

  const ell = grade10Math('10-09-C01', { a: 5, b: 3, p: 2 }).result;
  assert.ok(Math.abs(ell.c - 4) < 1e-9);
});

test('R83-T07: Mốc 0% / 33% / 66% / 100% (t = 0, 1.98, 3.96, 6.0) tạo 4 pha tiến triển rõ ràng và giữ yên kết quả ở 100%', () => {
  for (const id of GRADE10_IDS) {
    const p = grade10Defaults(id);
    assert.equal(grade10Valid(id, p), true, `Default params valid for ${id}`);
    const s0 = grade10SceneSVG(id, p, 0, { tries: 0 });
    const s33 = grade10SceneSVG(id, p, 1.98, { tries: 10 });
    const s66 = grade10SceneSVG(id, p, 3.96, { tries: 50 });
    const s100 = grade10SceneSVG(id, p, 6.0, { tries: 120 });
    assert.notEqual(s0, s33, `${id}: 0% must differ from 33%`);
    assert.notEqual(s33, s66, `${id}: 33% must differ from 66%`);
    assert.notEqual(s66, s100, `${id}: 66% must differ from 100%`);
    assert.match(s33, /Pha [12]/, `${id} at 33% shows Pha 1 or 2`);
    assert.match(s66, /Pha 3/, `${id} at 66% shows Pha 3`);
    assert.match(s100, /Pha 4/, `${id} at 100% holds at Pha 4`);
  }
});

test('R83-T08: 9 hiện vật Toán 10 (g10_01..g10_09) dựng hình phẳng trong không gian 3D với bảng màu có chủ đích R83', () => {
  const catalog = JSON.parse(fs.readFileSync(new URL('../data/catalog.json', import.meta.url), 'utf8'));
  const g10 = catalog.items.filter(x => Number(x.grade) === 10);
  assert.equal(g10.length, 9);
  for (const item of g10) {
    const holder = createMathModel(item, { faces: true, edges: true, labels: false });
    assert.ok(holder && holder.children.length > 0, `Built 3D planar scene for ${item.id}`);
  }
});
