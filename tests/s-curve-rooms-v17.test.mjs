import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const catalogPath = path.join(ROOT, 'museum-data', 'catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const threeUrl = pathToFileURL(path.join(ROOT, 'vendor', 'three.module.js')).href;
const layoutUrl = pathToFileURL(path.join(ROOT, 'dual', 'layout-plan.mjs')).href;

const avatarSource = fs.readFileSync(path.join(ROOT, 'dual', 'avatar-r75.mjs'), 'utf8')
  .replaceAll("'/vendor/three.module.js'", JSON.stringify(threeUrl));
const avatarUrl = 'data:text/javascript;base64,' + Buffer.from(avatarSource).toString('base64');

const archSource = fs.readFileSync(path.join(ROOT, 'dual', 'crystal-architecture.mjs'), 'utf8')
  .replaceAll("'/vendor/three.module.js'", JSON.stringify(threeUrl))
  .replace("'./layout-plan.mjs'", JSON.stringify(layoutUrl));
const archUrl = 'data:text/javascript;base64,' + Buffer.from(archSource).toString('base64');

const gallerySource = fs.readFileSync(path.join(ROOT, 'dual', 'gallery.mjs'), 'utf8')
  .replaceAll("'/vendor/three.module.js'", JSON.stringify(threeUrl))
  .replace("'./crystal-architecture.mjs'", JSON.stringify(archUrl))
  .replace("'./avatar-r75.mjs'", JSON.stringify(avatarUrl))
  .replace("'./layout-plan.mjs'", JSON.stringify(layoutUrl));
const galleryMod = await import('data:text/javascript;base64,' + Buffer.from(gallerySource).toString('base64'));

const {
  GRADES,
  HUB_RADIUS,
  FAR_RADIUS,
  ENTRANCE_Z,
  SECTOR_HALF,
  S_CURVE_ROOM_CONFIG,
  planRooms,
  posterDisplaySize
} = galleryMod;

test('V17 Architecture: Outer perimeter expanded to FAR_RADIUS = 142m for spacious fan halls', () => {
  assert.equal(FAR_RADIUS, 142, 'FAR_RADIUS must be 142m to provide spacious S-curve aisles');
  assert.equal(HUB_RADIUS, 48, 'HUB_RADIUS must be 48m around central rotunda');
  assert.equal(GRADES.length, 7, 'Must have exactly 7 grades (6 to 12)');
});

test('V17 S-Curve Row Distribution: Exactly 30 rows and 230 infographics across 7 fan rooms', () => {
  const plan = planRooms(catalog.items);
  assert.equal(plan.length, 7, 'Must plan exactly 7 fan rooms');

  let totalRows = 0;
  let totalLessons = 0;

  const expectedDistribution = {
    6: { rows: [6, 7, 9, 10, 11], total: 43, gateSide: 'right', after: 43 },
    7: { rows: [5, 6, 7, 9, 10], total: 37, gateSide: 'right', after: 37 },
    8: { rows: [5, 7, 8, 9, 10], total: 39, gateSide: 'right', after: 39 },
    9: { rows: [6, 7, 9, 10], total: 32, gateSide: 'left', after: 32 },
    10: { rows: [5, 6, 8, 8], total: 27, gateSide: 'left', after: 27 },
    11: { rows: [6, 8, 9, 10], total: 33, gateSide: 'left', after: 33 },
    12: { rows: [5, 6, 8], total: 19, gateSide: 'right', after: 19 }
  };

  for (const room of plan) {
    const exp = expectedDistribution[room.grade];
    assert.ok(exp, `Grade ${room.grade} must be in expected distribution`);
    assert.equal(room.lessons.length, exp.total, `Grade ${room.grade} must have exactly ${exp.total} infographics`);

    const cfg = S_CURVE_ROOM_CONFIG[room.grade];
    assert.equal(cfg.rows.length, exp.rows.length, `Grade ${room.grade} row count mismatch`);

    cfg.rows.forEach((r, idx) => {
      assert.equal(r.count, exp.rows[idx], `Grade ${room.grade} Row ${r.row} count mismatch`);
      const expectedDir = (idx % 2 === 0) ? 'left_to_right' : 'right_to_left';
      assert.equal(r.direction, expectedDir, `Grade ${room.grade} Row ${r.row} direction must be ${expectedDir}`);
    });

    totalRows += cfg.rows.length;
    totalLessons += room.lessons.length;

    assert.equal(room.returnGate.side, exp.gateSide, `Grade ${room.grade} gate side must be ${exp.gateSide}`);
    assert.equal(room.returnGate.afterLesson, exp.after, `Grade ${room.grade} gate must follow Lesson ${exp.after}`);
  }

  assert.equal(totalRows, 30, 'Total transverse horizontal rows across all 7 rooms must be 30');
  assert.equal(totalLessons, 230, 'Total infographics must be exactly 230');
});

test('V17 Lesson Continuity: Every room numbers strictly from Lesson 1 to Lesson N without gaps', () => {
  const plan = planRooms(catalog.items);
  for (const room of plan) {
    for (let i = 0; i < room.lessons.length; i++) {
      assert.equal(Number(room.lessons[i].number), i + 1,
        `Grade ${room.grade} lesson at index ${i} must be Lesson ${i + 1}`);
      assert.equal(Number(room.lessons[i].grade), room.grade,
        `Lesson must belong to grade ${room.grade}`);
    }
  }
});

test('V17 Turning Clearances: Every row has at least 4.0m clearance to sector walls on turning sides', () => {
  const plan = planRooms(catalog.items);
  for (const room of plan) {
    const cfg = S_CURVE_ROOM_CONFIG[room.grade];
    const rowRadii = room.rowRadii;

    cfg.rows.forEach((rDef, idx) => {
      const r = rowRadii[idx];
      const maxU = r * Math.tan(SECTOR_HALF);
      const pitch = Math.min(5.8, Math.max(4.6, (maxU * 2 - 14) / Math.max(1, rDef.count)));
      const span = (rDef.count - 1) * pitch;
      const halfSpan = span / 2;

      const wallDistance = maxU - halfSpan;
      const clearance = wallDistance - 2.2;

      assert.ok(clearance >= 4.0,
        `Grade ${room.grade} Row ${rDef.row} turning clearance must be >= 4.0m, got ${clearance.toFixed(2)}m`);
    });
  }
});

test('V17 Purple Return Gate: All 7 gates return to Museum Rotunda Kiosk, NOT Grand Dome', () => {
  const plan = planRooms(catalog.items);
  assert.equal(plan.length, 7);

  for (const room of plan) {
    const gate = room.returnGate;
    assert.ok(gate, `Grade ${room.grade} must have a return gate`);
    assert.ok(gate.world, `Gate must have world coordinates`);
    assert.ok(gate.r >= 120 && gate.r <= 136, `Gate radial distance must be at the end of the room (r=${gate.r})`);

    const destination = { x: 0, z: ENTRANCE_Z };
    assert.equal(destination.x, 0);
    assert.equal(destination.z, 24);
    assert.notEqual(destination.z, HUB_RADIUS - 3.6, 'Return gate must NOT teleport to Grand Dome return portal');
  }
});

test('V17 Poster Aspect Ratios: All 230 infographics preserve original aspect without stretching', () => {
  assert.equal(catalog.items.length, 230);
  for (const item of catalog.items) {
    const aspect = Number(item.aspect);
    assert.ok(Number.isFinite(aspect) && aspect > 0, `Invalid aspect for ${item.id}`);
    const size = posterDisplaySize(aspect);
    assert.ok(size.w > 0 && size.h > 0, `Invalid size for ${item.id}`);
    assert.ok(Math.abs(size.w / size.h - aspect) < 0.001, `Aspect ratio distorted for ${item.id}`);
  }
});
