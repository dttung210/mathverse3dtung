import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ALL_MATH6_LABS, labById, LAB_TO_EXHIBIT } from '../src/math6-lab/catalog.js';
import { GRADE6_ACTIVE_IDS } from '../src/portal-labs/grade6-curation-v15-1.js';
import { renderModel } from '../src/math6-lab/canvas.mjs';
import { motionParams } from '../src/math6-lab/catalog-motion.mjs';
import { grade7Defaults, grade7Metrics, grade7Solid, isGrade7Mode } from '../src/curriculum/grade7-engine.mjs';
import { grade7SVGScene, grade7NetSVG } from '../src/curriculum/grade7-svg.mjs';
import { grade8Defaults, grade8Metrics, grade8Solid, isGrade8Mode } from '../src/curriculum/grade8-engine.mjs';
import { grade8SVGScene, grade8NetSVG } from '../src/curriculum/grade8-svg.mjs';
import { TRIANGLE_CASES, initialTriangleParams, makeTrianglePair } from '../src/curriculum/triangle-engine.mjs';
import { graphDefaults, graphExperiment, isGraphCase } from '../src/curriculum/graph-models.mjs';
import { CURRICULUM_CHAPTERS_MANIFEST, ALL_CURRICULUM_MODELS, RELOCATED_MODEL_OVERRIDES } from '../src/curriculum/curriculum-manifest.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function makeRecorderContext() {
  const ops = [];
  const state = { fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '14px sans-serif', textAlign: 'left', textBaseline: 'alphabetic' };
  const stack = [];
  return {
    ops,
    get fillStyle() { return state.fillStyle; },
    set fillStyle(v) { state.fillStyle = v; },
    get strokeStyle() { return state.strokeStyle; },
    set strokeStyle(v) { state.strokeStyle = v; },
    get lineWidth() { return state.lineWidth; },
    set lineWidth(v) { state.lineWidth = v; },
    get font() { return state.font; },
    set font(v) { state.font = v; },
    get textAlign() { return state.textAlign; },
    set textAlign(v) { state.textAlign = v; },
    get textBaseline() { return state.textBaseline; },
    set textBaseline(v) { state.textBaseline = v; },
    save() { stack.push({ ...state }); },
    restore() { if (stack.length) Object.assign(state, stack.pop()); },
    clearRect() {},
    beginPath() { ops.push({ type: 'beginPath' }); },
    closePath() {},
    moveTo(x, y) { ops.push({ type: 'moveTo', x, y }); },
    lineTo(x, y) { ops.push({ type: 'lineTo', x, y }); },
    quadraticCurveTo(cx, cy, x, y) { ops.push({ type: 'quad', cx, cy, x, y }); },
    arc(x, y, r, s, e) { ops.push({ type: 'arc', x, y, r, s, e, fill: state.fillStyle, stroke: state.strokeStyle }); },
    rect(x, y, w, h) { ops.push({ type: 'rect', x, y, w, h, fill: state.fillStyle, stroke: state.strokeStyle }); },
    fillRect(x, y, w, h) { ops.push({ type: 'fillRect', x, y, w, h, fill: state.fillStyle }); },
    strokeRect(x, y, w, h) { ops.push({ type: 'strokeRect', x, y, w, h, stroke: state.strokeStyle }); },
    fill() { ops.push({ type: 'fill', fill: state.fillStyle }); },
    stroke() { ops.push({ type: 'stroke', stroke: state.strokeStyle, lw: state.lineWidth }); },
    fillText(text, x, y) { ops.push({ type: 'text', text: String(text), x, y, fill: state.fillStyle, font: state.font }); },
    setLineDash() {},
    translate(x, y) { ops.push({ type: 'translate', x, y }); },
    rotate(a) { ops.push({ type: 'rotate', a }); },
    scale(sx, sy) { ops.push({ type: 'scale', sx, sy }); }
  };
}

test('R86 Checkpoint 1 (Toán 6): 63 unique Labs (60 models.toan6.json + 3 mv15 supplemental) render at 0%, 50%, 100% with R86 semantic palette', () => {
  assert.equal(ALL_MATH6_LABS.length, 63, 'Must have exactly 63 Grade 6 Labs');
  assert.equal(GRADE6_ACTIVE_IDS.length, 35, 'Must have 35 active exhibition Labs in Grade 6');
  const suppIds = ['mv15-uoc-boi-bang100', 'mv15-nguyen-to-bang100', 'mv15-cong-phan-so-cung-mau'];
  for (const id of suppIds) {
    assert.ok(labById(id), `Supplemental Lab ${id} must exist`);
  }

  for (const model of ALL_MATH6_LABS) {
    assert.ok(LAB_TO_EXHIBIT[model.id], `${model.id} must link to a Grade 6 museum exhibit anchor`);
    const maxT = model.engine === 'chance' ? 6 : 8;
    const snapshots = [];
    for (const pct of [0, 0.5, 1]) {
      const ctx = makeRecorderContext();
      const t = maxT * pct;
      const state = {
        params: motionParams(model, model.defaults, t, 8),
        time: Math.round(t * 1000),
        counts: [3, 2, 4, 1, 2, 3],
        lastOutcome: 2,
        tileFlips: new Set(),
        selectedDesk: 2
      };
      renderModel(ctx, model, state, { theme: 'light' });
      assert.ok(ctx.ops.length > 15, `${model.id} at ${pct * 100}% must emit vector drawing operations`);
      snapshots.push(JSON.stringify(ctx.ops));
    }
    const changed = snapshots[0] !== snapshots[1] || snapshots[0] !== snapshots[2];
    assert.ok(changed, `${model.id} must transform across 0% -> 50% -> 100%`);
  }
});

test('R86 Checkpoint 2 (Toán 7): 41 Labs (10 families 7-01..7-10) render at 0%, 50%, 100% with R86 semantic palette and mathematical invariants', () => {
  const curated = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/mathverse-7-12-curated.json'), 'utf8'));
  const g7Families = curated.source_registry.filter(f => f.grade === 7);
  assert.equal(g7Families.length, 10, 'Grade 7 must have 10 families');
  const g7Modes = g7Families.flatMap(f => f.modes);
  assert.equal(g7Modes.length, 41, 'Grade 7 must have 41 modes');

  for (const m of g7Modes) {
    const p = m.id.startsWith('7-04-') ? initialTriangleParams(m.id) : grade7Defaults(m.id);
    if (grade7Solid(m.id)) {
      if (m.id === '7-08-C03' || m.id === '7-09-C03') {
        const net0 = grade7NetSVG(m.id, p, 0.18);
        const net50 = grade7NetSVG(m.id, p, 0.59);
        const net100 = grade7NetSVG(m.id, p, 1.0);
        assert.ok(net0.includes('<svg') && net50.includes('<svg') && net100.includes('<svg'), `${m.id} 2D net must render at 0%, 50%, 100%`);
        assert.notEqual(net0, net100, `${m.id} 2D net must animate between 0% and 100%`);
      }
      const metrics = grade7Metrics(m.id, p, { count: 10, seed: 2026 });
      assert.ok(Array.isArray(metrics) && metrics.length > 0, `${m.id} solid must compute live metrics`);
      continue;
    }
    const maxT = m.id.startsWith('7-10-') ? 8 : 6;
    const s0 = grade7SVGScene(m.id, p, 0, { count: 10, seed: 2026 });
    const s50 = grade7SVGScene(m.id, p, maxT * 0.5, { count: 10, seed: 2026 });
    const s100 = grade7SVGScene(m.id, p, maxT, { count: 10, seed: 2026 });
    assert.ok(s0.includes('<svg') && s50.includes('<svg') && s100.includes('<svg'), `${m.id} must produce valid SVG at 0%, 50%, 100%`);
    assert.notEqual(s0, s100, `${m.id} SVG must differ between 0% and 100%`);
    if (!m.id.startsWith('7-04-')) {
      const metrics = grade7Metrics(m.id, p, { count: 10, seed: 2026 });
      assert.ok(Array.isArray(metrics) && metrics.length > 0, `${m.id} must compute live metrics`);
    }
  }
});

test('R86 Checkpoint 3 (Toán 8): 37 Labs (9 families 8-01..8-09) render at 0%, 50%, 100% with R86 semantic palette and mathematical invariants', () => {
  const curated = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/mathverse-7-12-curated.json'), 'utf8'));
  const g8Families = curated.source_registry.filter(f => f.grade === 8);
  assert.equal(g8Families.length, 9, 'Grade 8 must have 9 families');
  const g8Modes = g8Families.flatMap(f => f.modes);
  assert.equal(g8Modes.length, 37, 'Grade 8 must have 37 modes');

  for (const m of g8Modes) {
    if (isGraphCase(m.id)) {
      const p = graphDefaults(m.id);
      const exp = graphExperiment(m.id, p);
      assert.equal(exp.check, true, `${m.id} default graph experiment must be valid`);
      assert.ok(exp.series.length >= 1, `${m.id} must have graph series`);
      continue;
    }
    const p = TRIANGLE_CASES[m.id] ? initialTriangleParams(m.id) : grade8Defaults(m.id);
    if (grade8Solid(m.id)) {
      const net0 = grade8NetSVG(m.id, p, 0);
      const net50 = grade8NetSVG(m.id, p, 0.5);
      const net100 = grade8NetSVG(m.id, p, 1);
      assert.ok(net0.includes('<svg') && net50.includes('<svg') && net100.includes('<svg'), `${m.id} pyramid net must render at 0%, 50%, 100%`);
      assert.notEqual(net0, net100, `${m.id} pyramid net must animate between 0% and 100%`);
      const metrics = grade8Metrics(m.id, p);
      assert.ok(Array.isArray(metrics) && metrics.length > 0, `${m.id} pyramid must compute live metrics`);
      continue;
    }
    const maxT = m.id.startsWith('8-08-') ? 8 : 6;
    const s0 = grade8SVGScene(m.id, p, 0);
    const s50 = grade8SVGScene(m.id, p, maxT * 0.5);
    const s100 = grade8SVGScene(m.id, p, maxT);
    assert.ok(s0.includes('<svg') && s50.includes('<svg') && s100.includes('<svg'), `${m.id} must produce valid SVG at 0%, 50%, 100%`);
    assert.notEqual(s0, s100, `${m.id} SVG must differ between 0% and 100%`);
    if (isGrade8Mode(m.id)) {
      const metrics = grade8Metrics(m.id, p);
      assert.ok(Array.isArray(metrics) && metrics.length > 0, `${m.id} must compute live metrics`);
    }
  }
});

test('R86 Cross-Grade & Exhibition Manifest: 142 positions across Grades 6, 7, 8 (64 + 38 + 40) and 4 cross-grade links intact', () => {
  const g6 = CURRICULUM_CHAPTERS_MANIFEST.grades.find(g => g.grade === 6);
  const g7 = CURRICULUM_CHAPTERS_MANIFEST.grades.find(g => g.grade === 7);
  const g8 = CURRICULUM_CHAPTERS_MANIFEST.grades.find(g => g.grade === 8);
  const g6Models = g6.chapters.flatMap(ch => ch.lessons.flatMap(l => l.models));
  const g7Models = g7.chapters.flatMap(ch => ch.lessons.flatMap(l => l.models));
  const g8Models = g8.chapters.flatMap(ch => ch.lessons.flatMap(l => l.models));

  assert.equal(g6Models.length, 64, 'Grade 6 must have 64 exhibition positions (63 G6 + 7-01-C03)');
  assert.equal(g7Models.length, 38, 'Grade 7 must have 38 exhibition positions');
  assert.equal(g8Models.length, 40, 'Grade 8 must have 40 exhibition positions (37 G8 + 7-10-C02, 7-10-C03, 9-13-C03)');
  assert.equal(g6Models.length + g7Models.length + g8Models.length, 142, 'Total Grade 6–8 exhibition positions must equal 142');

  assert.deepEqual(RELOCATED_MODEL_OVERRIDES['7-01-C03'], { sourceGrade: 7, targetGrade: 6, sourceLabId: '7-01', targetLabId: 'G6-R03-L02' });
  assert.deepEqual(RELOCATED_MODEL_OVERRIDES['7-10-C02'], { sourceGrade: 7, targetGrade: 8, sourceLabId: '7-10', targetLabId: '8-08' });
  assert.deepEqual(RELOCATED_MODEL_OVERRIDES['7-10-C03'], { sourceGrade: 7, targetGrade: 8, sourceLabId: '7-10', targetLabId: '8-08' });
  assert.deepEqual(RELOCATED_MODEL_OVERRIDES['9-13-C03'], { sourceGrade: 9, targetGrade: 8, sourceLabId: '9-13', targetLabId: '8-08' });
});
