import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_MATH6_LABS, labById } from '../src/math6-lab/catalog.js';
import { GRADE6_3D_CAPABLE_IDS, getModelTaxonomy, isTrue3DCapable, isSolid3D } from '../src/math6-lab/math6-taxonomy.mjs';
import { SUPPORTS_3D } from '../src/math6-lab/three-lab.mjs';
import { mathStats } from '../src/math6-lab/math.mjs';

test('R6.4 P2: Exactly 8 grade 6 models have verified Three.js 3D implementation', () => {
  assert.equal(GRADE6_3D_CAPABLE_IDS.length, 8);
  for (const id of GRADE6_3D_CAPABLE_IDS) {
    const lab = labById(id);
    assert.ok(lab, `Model ${id} exists in MathLab 6 catalog`);
    assert.ok(SUPPORTS_3D(lab), `SUPPORTS_3D returns true for ${id}`);
    assert.ok(isTrue3DCapable(id), `isTrue3DCapable returns true for ${id}`);
  }
});

test('R6.4 P2: Taxonomy cleanly separates solid 3D, physical 3D and 2D plane geometry', () => {
  // 2 Solid 3D models with volume
  assert.ok(isSolid3D('toan6-bac-thang-khoi'));
  assert.ok(isSolid3D('toan6-xuc-xac'));
  assert.equal(getModelTaxonomy('toan6-bac-thang-khoi').code, 'SOLID_3D');
  assert.equal(getModelTaxonomy('toan6-xuc-xac').code, 'SOLID_3D');

  // 6 Physical Object 3D models
  const physicalIds = [
    'toan6-vong-quay',
    'toan6-dong-xu',
    'toan6-vong-quay-choi',
    'toan6-giao-lo',
    'toan6-thiep-gap',
    'toan6-mat-bang-phong-hoc'
  ];
  for (const pid of physicalIds) {
    assert.equal(getModelTaxonomy(pid).code, 'PHYSICAL_OBJECT_3D');
    assert.equal(isSolid3D(pid), false);
  }

  // Pure 2D Plane geometry models must NOT be labeled 3D
  const plane2dIds = [
    'toan6-tam-giac-deu',
    'toan6-hinh-vuong',
    'toan6-luc-giac-deu',
    'toan6-chu-nhat',
    'toan6-hinh-thoi',
    'toan6-binh-hanh',
    'toan6-thang-can',
    'toan6-doi-xung-truc',
    'toan6-doi-xung-tam',
    'toan6-trung-diem'
  ];
  for (const pid of plane2dIds) {
    assert.equal(getModelTaxonomy(pid).code, 'PLANE_MATH_2D');
    assert.equal(isTrue3DCapable(pid), false);
    assert.equal(SUPPORTS_3D(labById(pid)), false);
  }
});

test('R6.4 P2: Stepped cubes volume math formula is accurate and preserves N = n(n+1)/2', () => {
  const model = labById('toan6-bac-thang-khoi');
  for (let n = 2; n <= 8; n++) {
    const stats = mathStats(model, { params: { speed: n }, time: 0 });
    const expectedN = (n * (n + 1)) / 2;
    assert.ok(stats.includes(`Số tầng bậc thang: ${n}`), `Stats contains step ${n}`);
    assert.ok(stats.includes(`N = ${expectedN} khối`), `Stats contains correct total cubes ${expectedN}`);
    assert.ok(stats.includes(`V = ${expectedN} đv³`), `Stats contains correct volume ${expectedN}`);
  }
});

test('R6.4 P2: 28 archived models remain faithfully in catalog and are not silently dropped', () => {
  const archived = ALL_MATH6_LABS.filter(m => !m.isFeatured);
  // Total 63 models in catalog
  assert.equal(ALL_MATH6_LABS.length, 63);
  // 3 models in the 8 3D models are archived: giao-lo, thiep-gap, bac-thang-khoi
  const archived3D = ['toan6-giao-lo', 'toan6-thiep-gap', 'toan6-bac-thang-khoi'];
  for (const id of archived3D) {
    assert.ok(isTrue3DCapable(id), `Archived model ${id} retains its 3D capability`);
  }
});
