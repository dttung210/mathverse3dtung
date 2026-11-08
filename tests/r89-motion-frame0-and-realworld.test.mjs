import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  isAutoPlayEnabled,
  setAutoPlayEnabled,
  scheduleLabAutoplay,
  cancelLabAutoplay,
  resetLabToFrameZero
} from '../src/curriculum/lab-autoplay.mjs';
import { ALL_MATH6_LABS, labById } from '../src/math6-lab/catalog.js';
import { motionParams } from '../src/math6-lab/catalog-motion.mjs';
import { renderModel } from '../src/math6-lab/canvas.mjs';
import { mathStats, polygonMeasures } from '../src/math6-lab/math.mjs';
import { REAL_WORLD_EXTENSION_MODELS, explorationsForGrade } from '../src/portal-labs/exploration-collection.js';
import { portalExhibits } from '../src/portal-labs/portal-registry.js';
import { RealWorldCompanion, realWorldCategory } from '../src/portal-labs/RealWorldCompanion.js';
import { normalizeExhibit, metrics } from '../src/math-core.js';
import { createMathModel, disposeObject } from '../src/geometry.js';
import { grade7Defaults } from '../src/curriculum/grade7-engine.mjs';
import { grade7SVGScene } from '../src/curriculum/grade7-svg.mjs';
import { grade8Defaults } from '../src/curriculum/grade8-engine.mjs';
import { grade8SVGScene } from '../src/curriculum/grade8-svg.mjs';
import { grade9Defaults } from '../src/curriculum/grade9-engine.mjs';
import { grade9SceneSVG } from '../src/curriculum/grade9-svg.mjs';
import { grade10Defaults } from '../src/curriculum/grade10-engine.mjs';
import { grade10SceneSVG } from '../src/curriculum/grade10-svg.mjs';
import { grade11Defaults } from '../src/curriculum/grade11-engine.mjs';
import { grade11SceneSVG } from '../src/curriculum/grade11-svg.mjs';
import { grade12Defaults } from '../src/curriculum/grade12-engine.mjs';
import { grade12SceneSVG } from '../src/curriculum/grade12-svg.mjs';

if (!globalThis.document) {
  globalThis.document = {
    createElement: () => ({
      width: 128,
      height: 128,
      getContext: () => new Proxy({ measureText: s => ({ width: String(s).length * 8 }) }, { get: (o, k) => (k in o ? o[k] : () => {}) })
    })
  };
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/catalog.json'), 'utf8')).items;

function makeSpyCanvas() {
  const ops = [];
  const texts = [];
  const ctx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left',
    textBaseline: 'alphabetic',
    lineCap: 'butt',
    lineJoin: 'miter',
    save() { ops.push('save'); },
    restore() { ops.push('restore'); },
    clearRect(x, y, w, h) { ops.push(`clear:${x},${y},${w},${h}`); },
    beginPath() { ops.push('begin'); },
    closePath() { ops.push('close'); },
    moveTo(x, y) { ops.push(`M:${Math.round(x)},${Math.round(y)}`); },
    lineTo(x, y) { ops.push(`L:${Math.round(x)},${Math.round(y)}`); },
    arc(x, y, r, s, e) { ops.push(`A:${Math.round(x)},${Math.round(y)},${Math.round(r)},${s.toFixed(2)},${e.toFixed(2)}`); },
    ellipse(x, y, rx, ry, rot, s, e) { ops.push(`E:${Math.round(x)},${Math.round(y)},${Math.round(rx)},${Math.round(ry)},${(e || 0).toFixed(2)}`); },
    bezierCurveTo(a, b, c, d, e, f) { ops.push(`B:${Math.round(a)},${Math.round(b)},${Math.round(e)},${Math.round(f)}`); },
    quadraticCurveTo(a, b, c, d) { ops.push(`Q:${Math.round(a)},${Math.round(b)},${Math.round(c)},${Math.round(d)}`); },
    rect(x, y, w, h) { ops.push(`R:${Math.round(x)},${Math.round(y)},${Math.round(w)},${Math.round(h)}`); },
    fillRect(x, y, w, h) { ops.push(`FR:${Math.round(x)},${Math.round(y)},${Math.round(w)},${Math.round(h)}:${this.fillStyle}`); },
    strokeRect(x, y, w, h) { ops.push(`SR:${Math.round(x)},${Math.round(y)},${Math.round(w)},${Math.round(h)}:${this.strokeStyle}`); },
    fill() { ops.push(`F:${this.fillStyle}`); },
    stroke() { ops.push(`S:${this.strokeStyle}:${this.lineWidth}`); },
    clip() { ops.push('clip'); },
    translate(x, y) { ops.push(`T:${Math.round(x)},${Math.round(y)}`); },
    rotate(a) { ops.push(`ROT:${a.toFixed(2)}`); },
    scale(x, y) { ops.push(`SC:${x.toFixed(2)},${y.toFixed(2)}`); },
    setLineDash(d) { ops.push(`D:${(d || []).join(',')}`); },
    measureText(s) { return { width: String(s).length * 7 }; },
    createLinearGradient() { return { addColorStop() {} }; },
    createRadialGradient() { return { addColorStop() {} }; },
    fillText(str, x, y) {
      const s = String(str);
      texts.push(s);
      ops.push(`TXT:${s}@${Math.round(x)},${Math.round(y)}:${this.fillStyle}`);
    }
  };
  return { ctx, ops, texts };
}

test('R89 Part 1: Autoplay lifecycle controller renders Frame 0 synchronously and cancels stale timers on pause/dispose', async () => {
  const lab = { autoPlay: true };
  assert.equal(isAutoPlayEnabled(lab), true);
  setAutoPlayEnabled(lab, false);
  assert.equal(isAutoPlayEnabled(lab), false);
  setAutoPlayEnabled(lab, true);
  assert.equal(isAutoPlayEnabled(lab), true);

  let resetCalls = 0;
  let startCalls = 0;
  resetLabToFrameZero(lab, { applyZero: () => { resetCalls += 1; } });
  assert.equal(resetCalls, 1);

  const scheduled = scheduleLabAutoplay(lab, {
    delayMs: 40,
    start: () => { startCalls += 1; }
  });
  assert.equal(scheduled, true);
  // Immediately pausing must cancel the pending autoplay timer
  cancelLabAutoplay(lab);
  await new Promise(resolve => setTimeout(resolve, 70));
  assert.equal(startCalls, 0, 'Cancelled autoplay timer must never fire after pause');
});

test('R89 Part 2.3: Mandatory Reference Model — Grade 6 Rectangle (toan6-chu-nhat) 5-stage storyboard & mathematical invariants', () => {
  const rectModel = labById('toan6-chu-nhat');
  assert.ok(rectModel, 'toan6-chu-nhat must exist in Grade 6 catalog');
  assert.equal(rectModel.variant, 'rectangle');

  const renderAtPct = (pct) => {
    const spy = makeSpyCanvas();
    const t = 8 * pct;
    const params = motionParams(rectModel, rectModel.defaults, t, 8);
    renderModel(spy.ctx, rectModel, { params, time: Math.round(t * 1000) }, { theme: 'light' });
    return { spy, params, sig: spy.ops.join('|') };
  };

  const s0 = renderAtPct(0);
  const s25 = renderAtPct(0.25);
  const s50 = renderAtPct(0.50);
  const s75 = renderAtPct(0.75);
  const s100 = renderAtPct(1.0);

  // 1. Frame 0 (0%) must show only origin point A on grid, NOT the completed rectangle or diagonals
  assert.ok(s0.spy.texts.some(t => t.includes('Bước 1 (0% — Khởi tạo)')), '0% must announce Stage 1 initialization');
  assert.ok(s0.spy.texts.includes('A'), '0% must label origin vertex A');
  assert.ok(!s0.spy.texts.includes('C') && !s0.spy.texts.includes('O'), '0% must NOT prematurely render vertex C or diagonal intersection O');

  // 2. 25% must construct segment AB = a and perpendicular ray at A
  assert.ok(s25.spy.texts.some(t => t.includes('Bước 2 (25%')), '25% must announce Stage 2');
  assert.ok(s25.spy.texts.includes('A') && s25.spy.texts.includes('B'), '25% must show segment AB');
  assert.ok(!s25.spy.texts.includes('O'), '25% must not yet show intersection O');

  // 3. 50% must construct AD = b, vertex C and complete ABCD with 4 right angles
  assert.ok(s50.spy.texts.some(t => t.includes('Bước 3 (50%')), '50% must announce Stage 3');
  for (const v of ['A', 'B', 'C', 'D']) {
    assert.ok(s50.spy.texts.includes(v), `50% must include vertex ${v}`);
  }
  assert.ok(!s50.spy.texts.includes('O'), '50% must not yet show diagonal intersection O');

  // 4. 75% must construct diagonals AC, BD and intersection O
  assert.ok(s75.spy.texts.some(t => t.includes('Bước 4 (75%')), '75% must announce Stage 4');
  assert.ok(s75.spy.texts.includes('O'), '75% must mark diagonal intersection O');

  // 5. 100% must prove AC = BD bisecting at O (OA = OB = OC = OD) and show unit-square area grid S = a * b
  assert.ok(s100.spy.texts.some(t => t.includes('OA = OB = OC = OD')), '100% must state OA = OB = OC = OD conclusion');

  // All 5 stages must have distinct visual signatures
  const uniqueStages = new Set([s0.sig, s25.sig, s50.sig, s75.sig, s100.sig]);
  assert.equal(uniqueStages.size, 5, 'All 5 stages (0%, 25%, 50%, 75%, 100%) of toan6-chu-nhat must be visually distinct');

  // Scrubbing backwards from 100% to 25% and 0% must reconstruct the exact earlier frames
  const s25Back = renderAtPct(0.25);
  const s0Back = renderAtPct(0);
  assert.equal(s25Back.sig, s25.sig, 'Scrubbing back to 25% must reconstruct exact 25% frame');
  assert.equal(s0Back.sig, s0.sig, 'Scrubbing back to 0% must reconstruct exact 0% frame');

  // Mathematical invariants check
  for (const [a, b] of [[6, 4], [8, 3], [5, 5]]) {
    const m = polygonMeasures('rectangle', { a, b, rotation: 0 });
    assert.ok(Math.abs(m.perimeter - 2 * (a + b)) < 1e-6, `P = 2(a+b) invariant for a=${a}, b=${b}`);
    assert.ok(Math.abs(m.area - a * b) < 1e-6, `S = a*b invariant for a=${a}, b=${b}`);
    const stats = mathStats(rectModel, { params: { a, b, rotation: 0 } });
    assert.ok(stats.includes(`AB = CD = a = ${a.toFixed(2)}`), 'mathStats must report AB = CD = a');
    assert.ok(stats.includes(`AD = BC = b = ${b.toFixed(2)}`), 'mathStats must report AD = BC = b');
    assert.ok(stats.includes(`AC = BD = √(a²+b²) ≈ ${Math.hypot(a, b).toFixed(2)}`), 'mathStats must report AC = BD = √(a²+b²)');
    assert.ok(stats.includes(`OA = OB = OC = OD ≈ ${(Math.hypot(a, b) / 2).toFixed(2)}`), 'mathStats must report OA = OB = OC = OD');
  }
});

test('R89 Part 1 & 2: All Lab controllers wire scheduleLabAutoplay, cancelLabAutoplay, and Auto-Play toggle button', () => {
  const labFiles = [
    'src/curriculum/Grade6Lab.js',
    'src/curriculum/Grade7Lab.js',
    'src/curriculum/Grade8Lab.js',
    'src/curriculum/Grade9Lab.js',
    'src/curriculum/CirclePositionLab.js',
    'src/curriculum/FunctionGraphLab.js',
    'src/curriculum/Grade10Lab.js',
    'src/curriculum/Grade11Lab.js',
    'src/curriculum/Grade12Lab.js',
    'src/curriculum/CurriculumExplorer.js',
    'src/portal-labs/SpecialtyLab.js'
  ];
  for (const rel of labFiles) {
    const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    assert.ok(src.includes('scheduleLabAutoplay'), `${rel} must use scheduleLabAutoplay`);
    assert.ok(src.includes('cancelLabAutoplay'), `${rel} must use cancelLabAutoplay`);
    assert.ok(src.includes('Tự phát') || src.includes('T\\u1ef1 ph\\u00e1t'), `${rel} must provide Auto-Play toggle button`);
  }
});

test('R89 Part 2 & 3: Representative 2D/SVG Labs across Grades 6–12 render distinct 0%, 50%, 100% states and deterministic reverse scrubbing', () => {
  // Grade 6 polygons: all 6 variants must differ between 0%, 50%, 100%
  for (const id of ['toan6-tam-giac-deu', 'toan6-hinh-vuong', 'toan6-chu-nhat', 'toan6-hinh-thoi', 'toan6-binh-hanh', 'toan6-thang-can', 'toan6-luc-giac-deu']) {
    const m = labById(id);
    const snap = (pct) => {
      const spy = makeSpyCanvas();
      const t = 8 * pct;
      renderModel(spy.ctx, m, { params: motionParams(m, m.defaults, t, 8), time: Math.round(t * 1000) }, { theme: 'light' });
      return spy.ops.join('|');
    };
    const s0 = snap(0), s50 = snap(0.5), s100 = snap(1);
    assert.notEqual(s0, s50, `${id} 0% must differ from 50%`);
    assert.notEqual(s50, s100, `${id} 50% must differ from 100%`);
    assert.equal(snap(0), s0, `${id} reverse scrub to 0% must be deterministic`);
  }

  // Grade 7 representative SVG
  const g7s0 = grade7SVGScene('7-02-C01', grade7Defaults('7-02-C01'), 0);
  const g7s50 = grade7SVGScene('7-02-C01', grade7Defaults('7-02-C01'), 3);
  const g7s100 = grade7SVGScene('7-02-C01', grade7Defaults('7-02-C01'), 6);
  assert.notEqual(g7s0, g7s50);
  assert.notEqual(g7s0, g7s100);

  // Grade 8 representative SVG
  const g8s0 = grade8SVGScene('8-05-C01', grade8Defaults('8-05-C01'), 0);
  const g8s50 = grade8SVGScene('8-05-C01', grade8Defaults('8-05-C01'), 3);
  const g8s100 = grade8SVGScene('8-05-C01', grade8Defaults('8-05-C01'), 6);
  assert.notEqual(g8s0, g8s50);
  assert.notEqual(g8s0, g8s100);

  // Grade 9 representative SVG
  const g9s0 = grade9SceneSVG('9-07-C01', grade9Defaults('9-07-C01'), 0);
  const g9s50 = grade9SceneSVG('9-07-C01', grade9Defaults('9-07-C01'), 2.5);
  const g9s100 = grade9SceneSVG('9-07-C01', grade9Defaults('9-07-C01'), 6);
  assert.notEqual(g9s0, g9s50);
  assert.notEqual(g9s0, g9s100);

  // Grade 10 representative SVG
  const g10s0 = grade10SceneSVG('10-11-C01', grade10Defaults('10-11-C01'), 0);
  const g10s50 = grade10SceneSVG('10-11-C01', grade10Defaults('10-11-C01'), 3);
  const g10s100 = grade10SceneSVG('10-11-C01', grade10Defaults('10-11-C01'), 6);
  assert.notEqual(g10s0, g10s50);
  assert.notEqual(g10s0, g10s100);

  // Grade 11 representative SVG
  const g11s0 = grade11SceneSVG('11-04-C01', grade11Defaults('11-04-C01'), 0);
  const g11s50 = grade11SceneSVG('11-04-C01', grade11Defaults('11-04-C01'), 2.6);
  const g11s100 = grade11SceneSVG('11-04-C01', grade11Defaults('11-04-C01'), 6);
  assert.notEqual(g11s0, g11s50);
  assert.notEqual(g11s0, g11s100);

  // Grade 12 representative SVG
  const g12s0 = grade12SceneSVG('12-05-C01', grade12Defaults('12-05-C01'), 0);
  const g12s50 = grade12SceneSVG('12-05-C01', grade12Defaults('12-05-C01'), 2.1);
  const g12s100 = grade12SceneSVG('12-05-C01', grade12Defaults('12-05-C01'), 6);
  assert.notEqual(g12s0, g12s50);
  assert.notEqual(g12s0, g12s100);
});

test('R89 Part 4: All 12 Real-World Life Extension Models for Grades 7–12 exist, build valid 3D meshes, and render 5-stage progressive schematics', () => {
  assert.equal(REAL_WORLD_EXTENSION_MODELS.length, 12, 'Must have 12 Grades 7-12 real-world extension models');
  const expectedByGrade = {
    7: ['cuboid', 'triPrism'],
    8: ['squarePyramid', 'pythagoras'],
    9: ['sphere', 'cone'],
    10: ['ellipse', 'circleOxy'],
    11: ['lineParallelPlane', 'frustumPyramid'],
    12: ['revolvedSolid', 'oxyzSphere']
  };

  for (const [gradeStr, expectedTypes] of Object.entries(expectedByGrade)) {
    const grade = Number(gradeStr);
    const ext = explorationsForGrade(catalog, grade, 'real');
    assert.equal(ext.length, 2, `Grade ${grade} must have 2 real-world extension models`);
    assert.deepEqual(ext.map(x => x.type), expectedTypes, `Grade ${grade} real-world extension types must match R89 spec`);

    const portalList = portalExhibits(catalog, grade, 'real');
    assert.ok(portalList.length >= 4, `Grade ${grade} real-world portal must include base + extension models`);

    for (const item of ext) {
      assert.equal(item.category, 'Mô hình minh họa mở rộng', 'Must be clearly labeled Mô hình minh họa mở rộng');
      const norm = normalizeExhibit(item);
      const mList = metrics(norm.type, norm.params);
      assert.ok(Array.isArray(mList) && mList.length > 0, `${item.title} must compute mathematical metrics`);

      const mesh = createMathModel(norm, { faces: true, edges: true, labels: false });
      try {
        assert.ok(mesh && mesh.children.length > 0, `${item.title} must generate valid 3D Three.js group`);
      } finally {
        disposeObject(mesh);
      }

      const cat = realWorldCategory(item);
      assert.notEqual(cat, 'geometry', `${item.title} must map to a dedicated schematic category`);

      // Verify 5-stage progressive rendering (0%, 25%, 50%, 75%, 100%) in RealWorldCompanion
      const comp = new RealWorldCompanion(norm);
      const stageSigs = [];
      for (const p of [0, 0.25, 0.5, 0.75, 1.0]) {
        const spy = makeSpyCanvas();
        comp.canvas = { width: 480, height: 245, getContext: () => spy.ctx };
        comp.setProgress(p);
        stageSigs.push(spy.ops.join('|'));
      }
      assert.notEqual(stageSigs[0], stageSigs[2], `${item.title} schematic at 0% must differ from 50%`);
      assert.notEqual(stageSigs[0], stageSigs[4], `${item.title} schematic at 0% must differ from 100%`);
    }
  }
});
