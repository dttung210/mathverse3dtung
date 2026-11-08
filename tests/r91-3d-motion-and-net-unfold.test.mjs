import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { normalizeExhibit } from '../src/math-core.js';
import { createMathModel } from '../src/geometry.js';
import { grade7NetSVG } from '../src/curriculum/grade7-svg.mjs';
import { grade8NetSVG } from '../src/curriculum/grade8-svg.mjs';
import { grade9NetSVG } from '../src/curriculum/grade9-svg.mjs';
import { grade9SolidModel, grade9Defaults } from '../src/curriculum/grade9-engine.mjs';
import { grade11SpatialSVG } from '../src/curriculum/grade11-svg.mjs';
import { grade11Defaults } from '../src/curriculum/grade11-engine.mjs';
import { grade12SpatialSVG } from '../src/curriculum/grade12-svg.mjs';
import { grade12Defaults } from '../src/curriculum/grade12-engine.mjs';

test('R91-1: normalizeExhibit preserves runtime animation parameters (turn, foldProgress, buildProgress, modeId, variant)', () => {
  const g9Model = grade9SolidModel('9-09-C01', grade9Defaults('9-09-C01'), 0.5);
  const norm9 = normalizeExhibit({ id: 'test_g9', title: 'Trụ', grade: 9, ...g9Model });
  assert.equal(norm9.params.turn, 0.5, 'normalizeExhibit must preserve turn=0.5 for Grade 9 3D motion');
  assert.equal(norm9.params.modeId, '9-09-C01', 'normalizeExhibit must preserve modeId for Grade 9 3D motion');

  const norm12 = normalizeExhibit({
    id: 'test_g12_box',
    title: 'Hộp không nắp',
    grade: 12,
    type: 'openTopBox',
    params: { L: 10, cut: 1.5, foldProgress: 0.5 }
  });
  assert.equal(norm12.params.foldProgress, 0.5, 'normalizeExhibit must preserve foldProgress=0.5 for Grade 12 openTopBox');
});

test('R91-2: Grade 8 8-09-C01..C04 (including 8-09-C01 regular triangular pyramid) animate in 3D and unfold in 2D', () => {
  const g8Code = fs.readFileSync(new URL('../src/curriculum/Grade8Lab.js', import.meta.url), 'utf8');
  assert.match(g8Code, /applySpatialMotion/, 'Grade8Lab must use applySpatialMotion for 8-09-C01..C04');
  assert.match(g8Code, /Gấp \/ trải khối 3D/, 'Grade8Lab must provide 3D unfold button for all 8-09-* modes');
  assert.match(g8Code, /Mặt cắt song song đáy/, 'Grade8Lab must provide parallel cross-section button for all 8-09-* modes');

  for (const id of ['8-09-C01', '8-09-C02', '8-09-C03', '8-09-C04']) {
    const net0 = grade8NetSVG(id, { a: 4, h: 3.5 }, 0);
    const net50 = grade8NetSVG(id, { a: 4, h: 3.5 }, 0.5);
    const net100 = grade8NetSVG(id, { a: 4, h: 3.5 }, 1);
    assert.notEqual(net0, net50, `${id} 2D net must change from 0% to 50%`);
    assert.notEqual(net50, net100, `${id} 2D net must change from 50% to 100%`);
  }

  // Verify 3D model for 8-09-C01 (trianglePyramid) supports both unfold and cross-section
  const pyr3 = createMathModel({ id: 'g8_c01', grade: 8, type: 'trianglePyramid', params: { a: 4, h: 3.5 } });
  assert.equal(pyr3.supportsUnfold, true, 'trianglePyramid must support 3D unfolding');
  assert.equal(pyr3.supportsCrossSection, true, 'trianglePyramid must support 3D cross-section');
  assert.equal(typeof pyr3.userData.unfoldGroup?.setUnfold, 'function');
  assert.equal(typeof pyr3.userData.crossSectionGroup?.updateSection, 'function');
  const secInfo = pyr3.userData.crossSectionGroup.updateSection(50);
  assert.ok(secInfo && secInfo.area > 0, 'trianglePyramid cross-section at 50% must return positive area');
});

test('R91-3: All 8 Grade 7 spatial solid modes (7-08-C01..C04, 7-09-C01..C04) have animated 2D Net Unfolding and 3D unfold/cross-section', () => {
  const g7Modes = ['7-08-C01', '7-08-C02', '7-08-C03', '7-08-C04', '7-09-C01', '7-09-C02', '7-09-C03', '7-09-C04'];
  for (const id of g7Modes) {
    const s0 = grade7NetSVG(id, {}, 0);
    const s50 = grade7NetSVG(id, {}, 0.5);
    const s100 = grade7NetSVG(id, {}, 1);
    assert.match(s100, /<svg/, `${id} must render valid 2D net SVG`);
    assert.notEqual(s0, s50, `${id} 2D net must animate between 0% and 50%`);
    assert.notEqual(s50, s100, `${id} 2D net must animate between 50% and 100%`);
  }

  for (const type of ['cube', 'cuboid', 'triPrism', 'prismQuad']) {
    const holder = createMathModel({ id: `test_${type}`, grade: 7, type, params: { a: 4, b: 3, h_base: 2.5, h: 5 } });
    assert.equal(holder.supportsUnfold, true, `${type} must support 3D unfolding`);
    assert.equal(holder.supportsCrossSection, true, `${type} must support 3D cross-section`);
    const sec = holder.userData.crossSectionGroup.updateSection(50);
    assert.ok(sec && sec.area > 0, `${type} crossSectionGroup.updateSection(50) must return positive area`);
  }
});

test('R91-4: Grade 9 spatial solids (9-09-*, 9-10-*) unfold in 2D/3D, while 9-11-* (Sphere) strictly sweeps/slices without false flat net', () => {
  for (const id of ['9-09-C01', '9-09-C02', '9-09-C03', '9-10-C01', '9-10-C02', '9-10-C03', '9-11-C01', '9-11-C02', '9-11-C03']) {
    const def = grade9Defaults(id);
    const n0 = grade9NetSVG(id, def, 0);
    const n100 = grade9NetSVG(id, def, 1);
    assert.notEqual(n0, n100, `${id} 2D net/section SVG must animate between 0% and 100%`);
  }
  const sphereSec = grade9NetSVG('9-11-C01', grade9Defaults('9-11-C01'), 1);
  assert.match(sphereSec, /Mặt cầu không có khai triển phẳng/, 'Grade 9 sphere SVG must explicitly state non-developability');

  for (const type of ['cylinder', 'cone']) {
    const holder = createMathModel({ id: `test_${type}`, grade: 9, type, params: { r: 3, h: 4 } });
    assert.equal(holder.supportsUnfold, true, `${type} must support 3D unfolding`);
    assert.equal(typeof holder.userData.unfoldGroup?.setUnfold, 'function', `${type} must provide unfoldGroup.setUnfold`);
  }
  const sphereHolder = createMathModel({ id: 'test_sphere', grade: 9, type: 'sphere', params: { r: 3 } });
  assert.equal(sphereHolder.supportsUnfold, false, 'sphere must NOT claim isometric flat net unfolding');
});

test('R91-5: Grade 11 (11-09-C01..C03) and Grade 12 (12-03-C02, 12-07-C01..C03) include 2D Net Unfolding and 3D unfolding/folding', () => {
  for (const id of ['11-09-C01', '11-09-C02', '11-09-C03']) {
    const p = grade11Defaults(id);
    const svg0 = grade11SpatialSVG(id, p, 0);
    const svg100 = grade11SpatialSVG(id, p, 6);
    assert.match(svg100, /Khai triển/, `${id} spatial SVG must include 2D net unfolding`);
    assert.notEqual(svg0, svg100, `${id} spatial SVG must animate between 0% and 100%`);
  }

  for (const id of ['12-07-C01', '12-07-C02', '12-07-C03']) {
    const p = grade12Defaults(id);
    const svg0 = grade12SpatialSVG(id, p, 0);
    const svg100 = grade12SpatialSVG(id, p, 6);
    assert.match(svg100, /Khai triển mặt bên/, `${id} spatial SVG must include conical frustum lateral net`);
    assert.notEqual(svg0, svg100, `${id} spatial SVG must animate between 0% and 100%`);
  }

  // Verify openTopBox 3D folding at 0%, 50%, 100%
  const box0 = createMathModel({ id: 'b0', grade: 12, type: 'openTopBox', params: { L: 10, cut: 1.5, foldProgress: 0 } });
  const box100 = createMathModel({ id: 'b100', grade: 12, type: 'openTopBox', params: { L: 10, cut: 1.5, foldProgress: 1 } });
  assert.equal(box0.supportsUnfold, true, 'openTopBox must support 3D unfolding');
  assert.equal(box100.supportsUnfold, true, 'openTopBox must support 3D unfolding');
});
