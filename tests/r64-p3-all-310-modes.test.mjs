import test from 'node:test';
import assert from 'node:assert/strict';
import { ROOM_BY_ID, LAB_BY_ID, MODE_BY_ID, getRoomsForGrade } from '../src/museum/r6-room-layout.js';
import { labById, ALL_MATH6_LABS, LAB_TO_EXHIBIT } from '../src/math6-lab/catalog.js';
import { isGrade6ActiveLab } from '../src/portal-labs/grade6-curation-v15-1.js';
import { getModelTaxonomy, isTrue3DCapable } from '../src/math6-lab/math6-taxonomy.mjs';
import { mathStats } from '../src/math6-lab/math.mjs';
import { isGrade7Mode } from '../src/curriculum/grade7-engine.mjs';
import { isGrade8Mode } from '../src/curriculum/grade8-engine.mjs';
import { isGrade9Mode } from '../src/curriculum/grade9-engine.mjs';
import { isGrade10Mode } from '../src/curriculum/grade10-engine.mjs';
import { isGrade11Mode } from '../src/curriculum/grade11-engine.mjs';
import { isGrade12Mode } from '../src/curriculum/grade12-engine.mjs';
import { isCirclePosition } from '../src/curriculum/circle-positions.mjs';
import { isGraphCase } from '../src/curriculum/graph-models.mjs';
import { isTriangleCase } from '../src/curriculum/triangle-engine.mjs';

test('R6.4 P3: Full hierarchy count (34 rooms, 130 labs, 310 modes)', () => {
  assert.equal(ROOM_BY_ID.size, 34);
  assert.equal(LAB_BY_ID.size, 130);
  assert.equal(MODE_BY_ID.size, 310);

  const gradeCounts = { 6: 63, 7: 41, 8: 37, 9: 46, 10: 38, 11: 46, 12: 39 };
  for (const [grade, count] of Object.entries(gradeCounts)) {
    const modes = getRoomsForGrade(Number(grade)).flatMap(r => r.labs.flatMap(l => l.modes));
    assert.equal(modes.length, count, `Grade ${grade} must have exactly ${count} modes`);
  }
});

test('R6.4 P3: Every mode has unique owner, valid room and valid lab', () => {
  const seenModes = new Set();
  for (const [id, mode] of MODE_BY_ID.entries()) {
    assert.ok(!seenModes.has(id), `Duplicate mode ID: ${id}`);
    seenModes.add(id);
    assert.ok(mode.roomId, `Mode ${id} has roomId`);
    assert.ok(ROOM_BY_ID.has(mode.roomId), `Room ${mode.roomId} exists in registry`);
    assert.ok(mode.labId, `Mode ${id} has labId`);
    assert.ok(LAB_BY_ID.has(mode.labId), `Lab ${mode.labId} exists in registry`);
  }
  assert.equal(seenModes.size, 310);
});

test('R6.4 P3: Grade 6 all 63 models have valid catalog records, mathStats without NaN', () => {
  assert.equal(ALL_MATH6_LABS.length, 63);
  let featuredCount = 0;
  let archivedCount = 0;

  for (const m of ALL_MATH6_LABS) {
    if (isGrade6ActiveLab(m.id)) featuredCount++;
    else archivedCount++;

    const stats = mathStats(m, { params: m.defaults, time: 0 });
    assert.ok(stats, `MathStats for ${m.id} returns non-empty string`);
    assert.ok(!stats.includes('NaN'), `MathStats for ${m.id} does not contain NaN: ${stats}`);
    assert.ok(LAB_TO_EXHIBIT[m.id], `Model ${m.id} has valid museum anchor`);
    const tax = getModelTaxonomy(m.id);
    assert.ok(tax, `Model ${m.id} has valid taxonomy`);
  }

  assert.equal(featuredCount, 35);
  assert.equal(archivedCount, 28);
});

test('R6.4 P3: Grades 7 to 12 all 247 modes route to an active interactive engine', () => {
  for (const [id, mode] of MODE_BY_ID.entries()) {
    const g = mode.sourceGrade || mode.grade;
    if (g === 6 && !id.match(/^\d+-\d+-C\d+$/)) continue;
    let matched = false;
    if (g === 7 && (isGrade7Mode(id) || isTriangleCase(id) || isCirclePosition(id) || isGraphCase(id))) matched = true;
    else if (g === 8 && (isGrade8Mode(id) || isTriangleCase(id) || isCirclePosition(id) || isGraphCase(id))) matched = true;
    else if (g === 9 && (isGrade9Mode(id) || isTriangleCase(id) || isCirclePosition(id) || isGraphCase(id))) matched = true;
    else if (g === 10 && (isGrade10Mode(id) || isTriangleCase(id) || isCirclePosition(id) || isGraphCase(id))) matched = true;
    else if (g === 11 && (isGrade11Mode(id) || isTriangleCase(id) || isCirclePosition(id) || isGraphCase(id))) matched = true;
    else if (g === 12 && (isGrade12Mode(id) || isTriangleCase(id) || isCirclePosition(id) || isGraphCase(id))) matched = true;

    assert.ok(matched, `Mode ${id} in grade ${g} must match an interactive engine`);
  }
});
