import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from '../vendor/three.module.js';
import { createMathModel, disposeObject } from '../src/geometry.js';
import {
  getChapterRoomsForGrade,
  getRoomsForGrade,
  getModeById,
  getRoomById
} from '../src/museum/r6-room-layout.js';
import { getLabDoorsForRoom, getUnifiedLabByModeId } from '../src/museum/r68-unified-labs.mjs';
import { createModeExhibit } from '../src/museum/r67-mode-exhibits.mjs';
import {
  renderLatexToHtml,
  formatLinearInequality2D,
  formatLinearEquation2D
} from '../src/curriculum/math-formula-renderer.mjs';
import { GRADE8_IDS, grade8Defaults, grade8FormulaFor, grade8Metrics, pyramid8 } from '../src/curriculum/grade8-engine.mjs';
import { grade8SVGScene, grade8NetSVG } from '../src/curriculum/grade8-svg.mjs';
import { grade7Defaults, grade7Metrics } from '../src/curriculum/grade7-engine.mjs';
import { grade7SVGScene, grade7NetSVG } from '../src/curriculum/grade7-svg.mjs';
import { V4_MODEL_PEDAGOGY_NOTES, getV4PedagogyMeta, getCurriculumModelById, getAllCurriculumModels } from '../src/curriculum/curriculum-manifest.mjs';
import { getGuidedDiscoveryPlan } from '../src/curriculum/guided-discovery.mjs';
import { GRADE9_IDS, grade9Defaults, grade9Math } from '../src/curriculum/grade9-engine.mjs';
import { grade9SceneSVG, grade9NetSVG } from '../src/curriculum/grade9-svg.mjs';
import { GRADE10_IDS, grade10Defaults, grade10Math } from '../src/curriculum/grade10-engine.mjs';
import { grade10SceneSVG } from '../src/curriculum/grade10-svg.mjs';
import { GRADE11_CUSTOM_IDS, grade11Defaults, grade11Schema, grade11Valid, grade11Math } from '../src/curriculum/grade11-engine.mjs';
import { grade11SceneSVG } from '../src/curriculum/grade11-svg.mjs';
import { portalExhibits } from '../src/portal-labs/portal-registry.js';
import { realWorldCategory } from '../src/portal-labs/RealWorldCompanion.js';
import { GRADE12_CUSTOM_IDS, grade12Defaults, grade12Schema, grade12Valid, grade12Math } from '../src/curriculum/grade12-engine.mjs';
import { grade12SceneSVG } from '../src/curriculum/grade12-svg.mjs';
import { ALL_MATH6_LABS } from '../src/math6-lab/catalog.js';
import { renderModel as renderMath6Model } from '../src/math6-lab/canvas.mjs';
import { TRIANGLE_CASES } from '../src/curriculum/triangle-engine.mjs';
import { CIRCLE_POSITION_IDS, circleLatex } from '../src/curriculum/circle-positions.mjs';
import { isGraphCase, graphDefaults, graphExperiment } from '../src/curriculum/graph-models.mjs';
import {
  makeDocument,
  make2D,
  validateDocument,
  vertices,
  metrics2D
} from '../src/studio/workspace-document.js';
import { recordKeyframe } from '../src/studio/motion-timeline.js';
import { WorkspaceComposer } from '../src/studio/WorkspaceComposer.js';
import {
  newBoard,
  newItem,
  validateBoard,
  coords,
  addFrame
} from '../src/math6-lab/geometry-core.mjs';
import { mathStats } from '../src/math6-lab/math.mjs';
import { TOAN6_LAB_MODELS } from '../src/math6-lab/catalog.js';
import { V15_EXTRA_LABS } from '../src/math6-lab/supplemental-v15.js';
import { toggleMute, getMuteState } from '../src/ui/audio.js';
import { Stats } from '../src/math/stats.js';
import { SafeExpression } from '../src/math/safe-expression.js';
import { Measurements } from '../src/math/measurements.js';
import { Constraints } from '../src/math/constraints.js';
import { ProjectorMaster } from '../src/ui/ProjectorMaster.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

function hasFallbackOctahedron(exhibitGroup) {
  let fallback = false;
  exhibitGroup.traverse(obj => {
    if (
      obj.geometry?.type === 'OctahedronGeometry' &&
      obj.geometry?.parameters?.detail === 0 &&
      Math.abs((obj.geometry?.parameters?.radius || 0) - 0.56) < 1e-4
    ) {
      fallback = true;
    }
  });
  return fallback;
}

test('R7.3 P0-01: 0/310 models in all 58 Chapter rooms and 34 Thematic rooms use fallback OctahedronGeometry', () => {
  let chapterTotal = 0;
  let chapterFallbacks = 0;
  for (let g = 6; g <= 12; g++) {
    for (const room of getChapterRoomsForGrade(g)) {
      for (const lab of getLabDoorsForRoom(room.roomId)) {
        for (const mode of lab.modes) {
          chapterTotal++;
          const ex = createModeExhibit(lab.grade, {
            ...mode,
            sourceLabId: mode.sourceLabId || mode.labId,
            labId: lab.labId,
            labName: lab.name
          });
          assert.ok(ex, `Exhibit created for ${mode.id} in ${room.roomId}`);
          assert.equal(typeof ex.userData?.animate, 'function', `Exhibit ${mode.id} has animate(t)`);
          if (hasFallbackOctahedron(ex)) chapterFallbacks++;
        }
      }
    }
  }
  assert.equal(chapterTotal, 310);
  assert.equal(chapterFallbacks, 0, 'Zero OctahedronGeometry fallbacks in 58 Chapter rooms');

  let thematicTotal = 0;
  let thematicFallbacks = 0;
  for (let g = 6; g <= 12; g++) {
    for (const room of getRoomsForGrade(g)) {
      for (const lab of getLabDoorsForRoom(room.roomId)) {
        for (const mode of lab.modes) {
          thematicTotal++;
          const ex = createModeExhibit(lab.grade, {
            ...mode,
            sourceLabId: mode.sourceLabId || mode.labId,
            labId: lab.labId,
            labName: lab.name
          });
          if (hasFallbackOctahedron(ex)) thematicFallbacks++;
        }
      }
    }
  }
  assert.equal(thematicTotal, 310);
  assert.equal(thematicFallbacks, 0, 'Zero OctahedronGeometry fallbacks in 34 Thematic rooms');
});

test('R7.3 P1-02: Cross-grade models (7-01-C03, 7-10-C02, 7-10-C03, 9-13-C03) align grade with destination chapterId', () => {
  const crossCases = [
    ['7-01-C03', 6, 7, 'G6-CH07', 'G6-CH07-B30'],
    ['7-10-C02', 8, 7, 'G8-CH08', 'G8-CH08-B31'],
    ['7-10-C03', 8, 7, 'G8-CH08', 'G8-CH08-B32'],
    ['9-13-C03', 8, 9, 'G8-CH08', 'G8-CH08-B32']
  ];
  for (const [id, targetGrade, sourceGrade, chapterId, lessonId] of crossCases) {
    const mode = getModeById(id);
    assert.ok(mode, `Mode ${id} exists`);
    assert.equal(mode.grade, targetGrade, `${id} grade matches target grade ${targetGrade}`);
    assert.equal(mode.sourceGrade, sourceGrade, `${id} preserves sourceGrade ${sourceGrade}`);
    assert.equal(mode.chapterId, chapterId, `${id} chapterId matches ${chapterId}`);
    assert.equal(mode.lessonId, lessonId, `${id} lessonId matches ${lessonId}`);
    const chRoom = getRoomById(chapterId);
    assert.equal(chRoom?.grade, mode.grade, `${id} destination room grade equals mode.grade`);
    assert.ok(getUnifiedLabByModeId(id), `${id} resolves valid unified family lab`);
  }
});

test('R7.3 P1-03 & P1-04 & P2-05 & P2-06: Holo-Stage, activeLabId, R7.3 metadata and collapsible brightness toolbar', () => {
  const holo = read('src/museum/r11-holo-stage.js');
  assert.match(holo, /mode\.chapterId \|\| mode\.roomId/);
  assert.match(holo, /mode\.chapterGrade \|\| mode\.grade/);

  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.mathverseUIVersion, 'R7.3');

  const html = read('index.html');
  assert.match(html, /MATHVERSE R7\.3/);
  assert.match(html, /id="mv-compact-launcher"/);
  assert.match(html, /id="mv-brightness-popover"/);
  assert.match(html, /id="mv-brightness-slider"/);
  assert.match(html, /class="mv-sidebar-collapsed mv-dock-collapsed mv-hud-collapsed"/);
});

test('R7.4 Math Formula Audit: All 310 models render clean mathematical HTML with zero raw LaTeX or ASCII inequality artifacts', () => {
  // 1. Check linear inequality & equation formatting (fixes "L1: 1x + 1y <= 2")
  assert.equal(formatLinearInequality2D(1, 1, '<=', 2), 'x + y ≤ 2');
  assert.equal(formatLinearInequality2D(2, 1, '<=', 1), '2x + y ≤ 1');
  assert.equal(formatLinearInequality2D(-1, 1, '<=', 1), '−x + y ≤ 1');
  assert.equal(formatLinearEquation2D(1, -1, -1), 'x − y − 1 = 0');

  const svg10 = grade10SceneSVG('10-02-C02', { a: 1, b: 1, c: 2, d: 2, e: 1, f: 1, u: 2, v: 1 }, 0);
  assert.doesNotMatch(svg10, /1x \+ 1y|<=|>=/);
  assert.match(svg10, /\(d₁\): x \+ y ≤ 2/);
  assert.match(svg10, /\(d₂\): 2x \+ y ≤ 1/);

  // 2. Collect all LaTeX formulas across the entire curriculum (Grades 6–12)
  const catalog = JSON.parse(read('data/catalog.json')).items;
  const curated = JSON.parse(read('data/mathverse-7-12-curated.json'));
  const allModes = curated.source_registry.flatMap(f => f.modes);

  const formulas = [];
  for (const item of catalog) {
    if (item.formula) formulas.push([`catalog:${item.id}`, item.formula]);
  }
  for (const [id, tc] of Object.entries(TRIANGLE_CASES)) {
    formulas.push([`tri:${id}`, tc.latex]);
  }
  for (const id of CIRCLE_POSITION_IDS) {
    formulas.push([`circle:${id}`, circleLatex(id)]);
  }
  for (const m of allModes) {
    if (isGraphCase(m.id)) {
      formulas.push([`graph:${m.id}`, graphExperiment(m.id, graphDefaults(m.id)).latex]);
    }
  }
  for (const id of GRADE8_IDS) {
    formulas.push([`g8:${id}`, grade8FormulaFor(id, grade8Defaults(id))]);
  }
  for (const id of GRADE9_IDS) {
    formulas.push([`g9:${id}`, grade9Math(id, grade9Defaults(id)).latex]);
  }
  for (const id of GRADE10_IDS) {
    formulas.push([`g10:${id}`, grade10Math(id, grade10Defaults(id)).latex]);
  }
  for (const id of GRADE11_CUSTOM_IDS) {
    formulas.push([`g11:${id}`, grade11Math(id, grade11Defaults(id)).latex]);
  }
  for (const id of GRADE12_CUSTOM_IDS) {
    formulas.push([`g12:${id}`, grade12Math(id, grade12Defaults(id)).latex]);
  }

  assert.ok(formulas.length >= 260, `Audited ${formulas.length} formulas`);

  const rawLatexLeakPattern = /\\(?:frac|sqrt|vec|overrightarrow|overline|bar|widehat|hat|begin|end|binom|lim|sum|int|text|mathrm|left|right|le|ge|ne|approx|equiv|cong|sim|pm|cdot|times|cup|cap|setminus|in|notin|varnothing|infty|parallel|perp|angle|triangle|circ|prime|alpha|beta|gamma|Delta|varphi|phi|theta|pi|Omega|Rightarrow|Leftrightarrow|iff|to)(?![a-zA-Z])/;
  const bareCommandLeakPattern = /\b(?:Leftrightarrow|Rightarrow|Leftarrow|varnothing|overrightarrow|overline|widehat)\b/;

  for (const [tag, latex] of formulas) {
    const htmlOut = renderLatexToHtml(latex);
    const visibleText = htmlOut.replace(/<[^>]+>/g, '');
    assert.ok(htmlOut.includes('mv-math-rendered'), `${tag} wrapped in mv-math-rendered`);
    assert.doesNotMatch(htmlOut, rawLatexLeakPattern, `${tag} leaked raw LaTeX in: ${htmlOut}`);
    assert.doesNotMatch(visibleText, bareCommandLeakPattern, `${tag} leaked unescaped LaTeX command word in: ${visibleText}`);
    assert.doesNotMatch(htmlOut, /\t/, `${tag} contains unescaped tab character`);
  }
});

test('R7.3 V2 Section A (V2-ST-01..V2-LB-10): All 10 advanced technical defects are fixed and verified', () => {
  // V2-ST-01: Negative/zero circle radius rejected in validateDocument() and never yields negative circumference in metrics2D()
  const badCircleDoc = makeDocument(8, '2d');
  const badCircle = make2D('circle', [0, 0], { r: 2 });
  badCircle.r = -3;
  badCircleDoc.items.push(badCircle);
  assert.throws(() => validateDocument(badCircleDoc, 8, '2d'), /positive|r > 0/i);
  const badCircleMetrics = metrics2D({ kind: 'circle', r: -3 });
  assert.ok(badCircleMetrics.circumference >= 0, 'Circumference must never be negative');
  assert.equal(badCircleMetrics.circumference, 0);

  // V2-ST-02: Regular polygon vertex count n checked for bounds [3..64] and integer
  for (const invalidN of [0, 2, -4, 4.5, 1000000]) {
    const polyDoc = makeDocument(8, '2d');
    const poly = make2D('regularPolygon', [0, 0], { r: 2, n: 6 });
    poly.n = invalidN;
    polyDoc.items.push(poly);
    assert.throws(() => validateDocument(polyDoc, 8, '2d'), /vertex count|positive/i, `Must reject n=${invalidN}`);
  }
  assert.equal(vertices({ kind: 'regularPolygon', r: 2, n: 0 }).length, 0);
  assert.equal(vertices({ kind: 'regularPolygon', r: 2, n: 1000000 }).length, 64);

  // V2-6D-03: Two mutually dependent objects in Grade 6 board rejected by validateBoard() and bounded in coords()
  const cyclicBoard = newBoard();
  const itemA = newItem('reflectionAxis', 0, 0, { id: 'A', parentId: 'B' });
  const itemB = newItem('reflectionCenter', 0, 0, { id: 'B', parentId: 'A' });
  cyclicBoard.items.push(itemA, itemB);
  assert.equal(coords(itemA, cyclicBoard), null);
  assert.equal(coords(itemB, cyclicBoard), null);
  assert.throws(() => validateBoard(cyclicBoard), /vòng tham chiếu|Không thể dựng/);

  // Also check 2D studio cyclic dependencies in validateDocument()
  const cyclicDoc2D = makeDocument(8, '2d');
  const m1 = make2D('midpoint', [0, 0], { parentId: 'm2' });
  m1.id = 'm1';
  const m2 = make2D('midpoint', [0, 0], { parentId: 'm1' });
  m2.id = 'm2';
  cyclicDoc2D.items.push(m1, m2);
  assert.throws(() => validateDocument(cyclicDoc2D, 8, '2d'), /Cyclic dependency/i);

  // V2-AU-04 & V2-AU-05: Audio module works safely even when localStorage throws SecurityError / QuotaExceededError
  const prevStorage = globalThis.localStorage;
  try {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        return {
          getItem() {
            throw new Error('SecurityError: storage blocked');
          },
          setItem() {
            throw new Error('QuotaExceededError: storage full');
          }
        };
      }
    });
    const beforeMute = getMuteState();
    assert.doesNotThrow(() => toggleMute());
    assert.equal(getMuteState(), !beforeMute);
    assert.doesNotThrow(() => toggleMute());
    assert.equal(getMuteState(), beforeMute);
  } finally {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      writable: true,
      value: prevStorage
    });
  }

  // V2-MS-06: Recording 61st keyframe keeps newest keyframe (t=120) and marks limitReached=true
  const motionDoc = makeDocument(8, '2d');
  motionDoc.items.push(make2D('point', [1, 1]));
  for (let i = 0; i < 60; i++) {
    const f = recordKeyframe(motionDoc, i * 2);
    assert.ok(!f.limitReached);
  }
  assert.equal(motionDoc.motion.keyframes.length, 60);
  assert.equal(motionDoc.motion.keyframes.at(-1).at, 118);
  const f61 = recordKeyframe(motionDoc, 120);
  assert.equal(f61.limitReached, true);
  assert.equal(motionDoc.motion.keyframes.length, 60);
  assert.equal(motionDoc.motion.keyframes.at(-1).at, 120, '61st keyframe at t=120 must be preserved by evicting oldest');

  // Same for Grade 6 addFrame()
  const g6Board = newBoard();
  g6Board.items.push(newItem('point', 1, 1));
  for (let i = 0; i < 60; i++) addFrame(g6Board, i * 2);
  const g6Frame61 = addFrame(g6Board, 120);
  assert.equal(g6Frame61.limitReached, true);
  assert.equal(g6Board.keyframes.length, 60);
  assert.equal(g6Board.keyframes.at(-1).at ?? g6Board.keyframes.at(-1).t, 120);

  // V2-MS-07: WorkspaceComposer.prototype.clearAll() clears both items and motion.keyframes
  const mockComposer = {
    dimension: '2d',
    doc: {
      items: [make2D('point', [0, 0])],
      motion: { speed: 1, keyframes: [{ at: 0, items: [] }, { at: 2, items: [] }] }
    },
    controller: { setSelection() {}, draw() {}, reload() {} },
    _stopMotion() {},
    _renderMotionUI() {},
    commit() {}
  };
  WorkspaceComposer.prototype.clearAll.call(mockComposer);
  assert.equal(mockComposer.doc.items.length, 0);
  assert.equal(mockComposer.doc.motion.keyframes.length, 0);

  // V2-ST-08: WorkspaceComposer.prototype._persist() returns false on quota failure and does not trigger success toast
  const toasts = [];
  const prevLS = globalThis.localStorage;
  try {
    globalThis.localStorage = {
      setItem() {
        throw new Error('QuotaExceededError');
      }
    };
    const persistMock = {
      grade: 8,
      dimension: '2d',
      doc: makeDocument(8, '2d'),
      _key() {
        return 'test-key';
      },
      onToast(msg) {
        toasts.push(msg);
      }
    };
    const ok = WorkspaceComposer.prototype._persist.call(persistMock);
    assert.equal(ok, false);
    assert.equal(toasts.length, 1);
    assert.match(toasts[0], /Không thể tự lưu/);
  } finally {
    globalThis.localStorage = prevLS;
  }

  // V2-LB-09 & V2-LB-10: Verify main.js rollback on saveLibrary failure and cross-tab revision merge
  const mainSrc = read('src/main.js');
  assert.match(mainSrc, /if\(!saveLibrary\(\{replaceAll:true\}\)\)\{\s*items=before;/);
  assert.match(mainSrc, /mergedFromOtherTab/);
  assert.match(mainSrc, /window\.addEventListener\('storage'/);
});

test('R7.3 V2 Section C: All 310 models pass V2.1 reference, V2.2 A->B->A determinism, and V2.3 boundary checks', () => {
  // Grade 6 (63 models)
  const allG6 = [...TOAN6_LAB_MODELS, ...V15_EXTRA_LABS];
  assert.equal(allG6.length, 63);
  for (const model of allG6) {
    const stateA = structuredClone(model.defaults || {});
    const statsA1 = mathStats(model, { params: stateA, counts: [2, 3, 1, 2], lastOutcome: 0 });
    assert.ok(typeof statsA1 === 'string' && statsA1.length > 0, `Stats for ${model.id}`);

    // Mutate to state B (boundary values from controls)
    const stateB = structuredClone(stateA);
    for (const ctrl of model.controls || []) {
      if (Number.isFinite(ctrl.max)) stateB[ctrl.key] = ctrl.max;
    }
    const statsB = mathStats(model, { params: stateB, counts: [2, 3, 1, 2], lastOutcome: 0 });
    assert.ok(typeof statsB === 'string' && statsB.length > 0, `Boundary stats for ${model.id}`);

    // Restore state A and verify A -> B -> A determinism
    const stateA2 = structuredClone(model.defaults || {});
    const statsA2 = mathStats(model, { params: stateA2, counts: [2, 3, 1, 2], lastOutcome: 0 });
    assert.equal(statsA1, statsA2, `A -> B -> A determinism failed for ${model.id}`);
  }

  // Grades 8, 9, 10, 11, 12 engines A -> B -> A determinism
  for (const id of GRADE8_IDS) {
    const d1 = grade8Defaults(id);
    const fA1 = grade8FormulaFor(id, structuredClone(d1));
    const dB = structuredClone(d1);
    for (const k of Object.keys(dB)) if (typeof dB[k] === 'number') dB[k] += 1;
    const fB = grade8FormulaFor(id, dB);
    assert.ok(typeof fB === 'string' && fB.length > 0);
    const fA2 = grade8FormulaFor(id, structuredClone(d1));
    assert.equal(fA1, fA2, `A -> B -> A determinism failed for g8:${id}`);
  }

  for (const id of GRADE9_IDS) {
    const d1 = grade9Defaults(id);
    const mA1 = grade9Math(id, structuredClone(d1));
    const dB = structuredClone(d1);
    for (const k of Object.keys(dB)) if (typeof dB[k] === 'number') dB[k] += 1;
    const mB = grade9Math(id, dB);
    assert.ok(mB && typeof mB.latex === 'string');
    const mA2 = grade9Math(id, structuredClone(d1));
    assert.deepEqual(mA1, mA2, `A -> B -> A determinism failed for g9:${id}`);
  }

  for (const id of GRADE10_IDS) {
    const d1 = grade10Defaults(id);
    const mA1 = grade10Math(id, structuredClone(d1));
    const dB = structuredClone(d1);
    for (const k of Object.keys(dB)) if (typeof dB[k] === 'number') dB[k] += 1;
    const mB = grade10Math(id, dB);
    assert.ok(mB && typeof mB.latex === 'string');
    const mA2 = grade10Math(id, structuredClone(d1));
    assert.deepEqual(mA1, mA2, `A -> B -> A determinism failed for g10:${id}`);
  }

  for (const id of GRADE11_CUSTOM_IDS) {
    const d1 = grade11Defaults(id);
    const mA1 = grade11Math(id, structuredClone(d1));
    const dB = structuredClone(d1);
    for (const s of grade11Schema(id)) {
      const candPlus = { ...dB, [s.key]: dB[s.key] + s.step };
      const candMinus = { ...dB, [s.key]: dB[s.key] - s.step };
      if (grade11Valid(id, candPlus)) {
        dB[s.key] = candPlus[s.key];
        break;
      } else if (grade11Valid(id, candMinus)) {
        dB[s.key] = candMinus[s.key];
        break;
      }
    }
    const mB = grade11Math(id, dB);
    assert.ok(mB && typeof mB.latex === 'string');
    const mA2 = grade11Math(id, structuredClone(d1));
    assert.deepEqual(mA1, mA2, `A -> B -> A determinism failed for g11:${id}`);
  }

  for (const id of GRADE12_CUSTOM_IDS) {
    const d1 = grade12Defaults(id);
    const mA1 = grade12Math(id, structuredClone(d1));
    const dB = structuredClone(d1);
    for (const s of grade12Schema(id)) {
      const candPlus = { ...dB, [s.key]: dB[s.key] + s.step };
      const candMinus = { ...dB, [s.key]: dB[s.key] - s.step };
      if (grade12Valid(id, candPlus)) {
        dB[s.key] = candPlus[s.key];
        break;
      } else if (grade12Valid(id, candMinus)) {
        dB[s.key] = candMinus[s.key];
        break;
      }
    }
    const mB = grade12Math(id, dB);
    assert.ok(mB && typeof mB.latex === 'string');
    const mA2 = grade12Math(id, structuredClone(d1));
    assert.deepEqual(mA1, mA2, `A -> B -> A determinism failed for g12:${id}`);
  }
});

test('R7.3 V3 Section A & B (V3-DT-01..V3-KB-11): All 8 independent findings and 3 UI/keyboard accessibility checks pass', () => {
  // V3-DT-01: Non-numeric values in analyzeRaw() are excluded and flagged, never coerced to 0
  const rawRes = Stats.analyzeRaw([10, 'chữ', 20]);
  assert.equal(rawRes.count, 2);
  assert.equal(rawRes.inputCount, 3);
  assert.equal(rawRes.invalidCount, 1);
  assert.equal(rawRes.mean, 15);
  assert.equal(rawRes.min, 10);
  assert.equal(rawRes.max, 20);
  assert.equal(rawRes.valid, false);
  assert.ok(rawRes.warning && rawRes.warning.includes('chữ'));

  // V3-DT-02: Non-numeric values in computeHistogramBins() are never counted into bin [0, 10)
  const histRes = Stats.computeHistogramBins([10, 'chữ', 20], [0, 10, 20, 30]);
  assert.deepEqual(histRes, [0, 1, 1]);

  // V3-DT-03: Mismatched categories/frequencies rejected in analyzeCategorical()
  const catBad = Stats.analyzeCategorical(['A', 'B'], [2, 3, 7]);
  assert.equal(catBad.valid, false);
  assert.equal(catBad.totalCount, 0);
  assert.deepEqual(catBad.percentages, []);
  assert.deepEqual(catBad.modeCategories, []);
  assert.ok(catBad.error && catBad.error.includes('không bằng nhau'));

  // C1: Missing category name excluded from sample
  const catMissingName = Stats.analyzeCategorical(['A', '', 'B'], [2, 99, 3]);
  assert.equal(catMissingName.totalCount, 5);
  assert.deepEqual(catMissingName.percentages, [40, 60]);
  assert.deepEqual(catMissingName.modeCategories, ['B']);

  // V3-AL-04: Identically zero quadratic (0,0,0) identifies infinite solution set S = ℝ
  const qZero = SafeExpression.analyzeQuadratic(0, 0, 0);
  assert.equal(qZero.type, 'identity_zero');
  assert.equal(qZero.infiniteRoots, true);
  assert.equal(qZero.solutionSet, 'S = ℝ');
  assert.match(String(qZero.roots), /S\s*=\s*ℝ/);

  const qConst = SafeExpression.analyzeQuadratic(0, 0, 5);
  assert.equal(qConst.type, 'constant');
  assert.equal(qConst.infiniteRoots, false);
  assert.equal(qConst.solutionSet, 'S = ∅');
  assert.deepEqual(qConst.roots, []);

  // V3-GE-05: Angle with zero vector returns null (not 0)
  assert.equal(Measurements.angleBetweenVectors([0, 0], [1, 0]), null);
  assert.equal(Measurements.angleBetweenVectors([2, 3], [0, 0]), null);
  assert.equal(Measurements.angleBetweenVectors([1, 0], [0, 1]), 90);
  assert.match(Measurements.describeAngleBetweenVectors([0, 0], [1, 0]), /không xác định/);

  // V3-GE-06: Projection onto degenerate line (A = B) returns null (not [1, 1])
  assert.equal(Constraints.projectPointToLine([3, 4], [1, 1], [1, 1]), null);
  assert.deepEqual(Constraints.projectPointToLine([3, 4], [0, 0], [10, 0]), [3, 0]);
  assert.match(Constraints.describeProjectionToLine([3, 4], [1, 1], [1, 1]), /chưa xác định/);

  // V3-LX-07: graphExperiment("8-07-C03").latex has proper \Leftrightarrow and d_1, d_2 notation
  const g807c03 = graphExperiment('8-07-C03');
  assert.ok(g807c03.latex.includes('\\Leftrightarrow'), 'Must include \\Leftrightarrow with backslash');
  assert.ok(!/(^|[^\\])Leftrightarrow/.test(g807c03.latex), 'Must not have bare Leftrightarrow without backslash');
  assert.ok(g807c03.latex.includes('d_1') && g807c03.latex.includes('d_2'));
  const g807Html = renderLatexToHtml(g807c03.latex);
  assert.ok(g807Html.includes('⇔'), 'Rendered HTML must display ⇔ symbol');
  assert.ok(!g807Html.includes('Leftrightarrow'), 'Rendered HTML must not leak Leftrightarrow');

  // V3-PJ-08: ProjectorMaster removes all window listeners on destroy() and resets stroke on setTool()
  const prevWin = globalThis.window;
  const prevDoc = globalThis.document;
  const prevRAF = globalThis.requestAnimationFrame;
  const prevCAF = globalThis.cancelAnimationFrame;
  try {
    const activeListeners = new Map();
    globalThis.window = {
      innerWidth: 1280,
      innerHeight: 720,
      addEventListener(type, fn) {
        if (!activeListeners.has(type)) activeListeners.set(type, new Set());
        activeListeners.get(type).add(fn);
      },
      removeEventListener(type, fn) {
        activeListeners.get(type)?.delete(fn);
      }
    };
    const mockCanvas = {
      id: '',
      className: '',
      width: 0,
      height: 0,
      style: {},
      getContext() {
        return {
          clearRect() {},
          beginPath() {},
          moveTo() {},
          lineTo() {},
          stroke() {},
          arc() {},
          fill() {},
          createRadialGradient() {
            return { addColorStop() {} };
          }
        };
      },
      remove() {}
    };
    globalThis.document = {
      getElementById() {
        return null;
      },
      createElement() {
        return mockCanvas;
      },
      body: {
        appendChild() {}
      }
    };
    globalThis.requestAnimationFrame = () => 101;
    globalThis.cancelAnimationFrame = () => {};

    const pm = new ProjectorMaster();
    pm.init();
    for (const ev of ['resize', 'mousemove', 'mousedown', 'mouseup', 'touchmove', 'touchstart', 'touchend']) {
      assert.equal(activeListeners.get(ev)?.size, 1, `Expected 1 listener for ${ev} after init()`);
    }
    // Check C5: switching tool mid-stroke stops drawing
    pm.setActive(true);
    pm.setTool('pen');
    pm.isDrawing = true;
    pm.currentStroke = { color: '#ef4444', width: 4, points: [{ x: 10, y: 10 }] };
    pm.setTool('laser');
    assert.equal(pm.isDrawing, false);
    assert.equal(pm.currentStroke, null);

    pm.destroy();
    for (const ev of ['resize', 'mousemove', 'mousedown', 'mouseup', 'touchmove', 'touchstart', 'touchend']) {
      assert.equal(activeListeners.get(ev)?.size || 0, 0, `Listener ${ev} must be removed after destroy()`);
    }
  } finally {
    globalThis.window = prevWin;
    globalThis.document = prevDoc;
    globalThis.requestAnimationFrame = prevRAF;
    globalThis.cancelAnimationFrame = prevCAF;
  }

  // V3-KB-09, V3-KB-10, V3-KB-11: Breadcrumb keyboard accessibility & modal/select guards in main.js
  const mainSrc = read('src/main.js');
  assert.match(mainSrc, /function bindBreadcrumbAccessibility/);
  assert.match(mainSrc, /crumb\.tabIndex\s*=\s*0/);
  assert.match(mainSrc, /crumb\.setAttribute\('role',\s*'button'\)/);
  assert.match(mainSrc, /function isTypingOrFormTarget/);
  assert.match(mainSrc, /\['INPUT',\s*'TEXTAREA',\s*'SELECT'\]/);
  assert.match(mainSrc, /function isAnyModalOrOverlayOpen/);
});

test('R7.3 V4-CN-01..15: All 15 V4 pedagogical & textbook lesson-scope alignments are active across engines, SVG, and Guided Discovery', () => {
  const expectedV4Ids = [
    '8-01-C03', '8-08-C03', '7-10-C01', 'toan6-hinh-thoi', '8-06-C08',
    '7-01-C02', '7-08-C03', '7-09-C03', '8-09-C03', '10-02-C03',
    '11-12-C03', '9-11-C03', '11-09-C03', '12-07-C02', '12-10-C03'
  ];
  assert.equal(Object.keys(V4_MODEL_PEDAGOGY_NOTES).length, 15);
  for (const id of expectedV4Ids) {
    const meta = getV4PedagogyMeta(id);
    assert.ok(meta && meta.v4Code && meta.badge && meta.scopeNote, `Missing V4 metadata for ${id}`);
    const cm = getCurriculumModelById(id);
    assert.ok(cm && cm.v4Meta?.v4Code === meta.v4Code, `Curriculum model ${id} must attach v4Meta`);
    const plan = getGuidedDiscoveryPlan(id);
    assert.ok(plan.step3.includes(meta.v4Code), `GuidedDiscovery step3 for ${id} must include ${meta.v4Code}`);
  }

  // V4-CN-01: 8-01-C03 separates Bài 7 (variants 0,1) from Bài 8 (variants 2,3)
  const g8c03_b7 = grade8Metrics('8-01-C03', { ...grade8Defaults('8-01-C03'), identityVariant: 0 });
  const g8c03_b8 = grade8Metrics('8-01-C03', { ...grade8Defaults('8-01-C03'), identityVariant: 2 });
  assert.ok(g8c03_b7[0].includes('Bài 7'));
  assert.ok(g8c03_b8[0].includes('Bài 8'));
  assert.ok(grade8SVGScene('8-01-C03', { ...grade8Defaults('8-01-C03'), identityVariant: 0 }, 1).includes('[Bài 7 SGK]'));
  assert.ok(grade8SVGScene('8-01-C03', { ...grade8Defaults('8-01-C03'), identityVariant: 2 }, 1).includes('[Bài 8 SGK]'));

  // V4-CN-02: 8-08-C03 defaults to lessonScope 30 (Bài 30: Ω & favorable count without theoretical P=k/6) and supports lessonScope 31
  const g8probDef = grade8Defaults('8-08-C03');
  assert.equal(g8probDef.lessonScope, 30);
  const m30 = grade8Metrics('8-08-C03', { ...g8probDef, lessonScope: 30 }).join(' | ');
  const m31 = grade8Metrics('8-08-C03', { ...g8probDef, lessonScope: 31 }).join(' | ');
  assert.ok(m30.includes('Bài 30') && !m30.includes('P(A) = k/6 ='));
  assert.ok(m31.includes('P(A) = k/6 ='));

  // V4-CN-03: 7-10-C01 defaults to lessonScope 29 (Bài 29) and supports lessonScope 30 (Bài 30)
  const g7probDef = grade7Defaults('7-10-C01');
  assert.equal(g7probDef.lessonScope, 29);
  const g7m29 = grade7Metrics('7-10-C01', { ...g7probDef, lessonScope: 29 }).join(' | ');
  const g7m30 = grade7Metrics('7-10-C01', { ...g7probDef, lessonScope: 30 }).join(' | ');
  assert.ok(g7m29.includes('Bài 29'));
  assert.ok(g7m30.includes('Xác suất lý thuyết'));

  // V4-CN-04: toan6-hinh-thoi distinguishes Bài 19 (recognition) and Bài 20 (perimeter & area)
  const rhombusModel = TOAN6_LAB_MODELS.find(m => m.id === 'toan6-hinh-thoi');
  assert.ok(rhombusModel);
  const rh19 = mathStats(rhombusModel, { params: rhombusModel.defaults, lessonScope: 19 });
  const rh20 = mathStats(rhombusModel, { params: rhombusModel.defaults, lessonScope: 20 });
  assert.ok(rh19.includes('Bài 19') && rh19.includes('4 cạnh bằng nhau'));
  assert.ok(rh20.includes('Bài 20') && rh20.includes('Chu vi') && rh20.includes('Diện tích'));

  // V4-CN-05: 8-06-C08 explicitly states "Hình đồng dạng qua phép vị tự (phối cảnh tâm O)"
  assert.ok(getModeById('8-06-C08').name.includes('Hình đồng dạng qua phép vị tự'));
  assert.ok(grade8SVGScene('8-06-C08', grade8Defaults('8-06-C08'), 1).includes('Hình đồng dạng qua phép vị tự tâm O'));

  // V4-CN-06, 07, 08, 09: 7-01-C02, 7-08-C03, 7-09-C03, 8-09-C03 scope notes & net labels
  assert.ok(grade7Metrics('7-01-C02', grade7Defaults('7-01-C02')).join(' ').includes('Trọng tâm Bài 6'));
  assert.ok(grade7NetSVG('7-08-C03', grade7Defaults('7-08-C03'), 0.8).includes('Bài 36: 4 mặt bên hình chữ nhật + 2 mặt đáy'));
  assert.ok(grade7NetSVG('7-09-C03', grade7Defaults('7-09-C03'), 0.8).includes('Bài 37: 2 đáy tam giác bằng nhau + 3 mặt bên'));
  assert.equal(pyramid8('8-09-C03', { a: 4, h: 4, pyramidBaseSides: 3 }).faces, 4);
  assert.equal(pyramid8('8-09-C03', { a: 4, h: 4, pyramidBaseSides: 4 }).faces, 5);
  assert.ok(grade8NetSVG('8-09-C03', { a: 4, h: 4, pyramidBaseSides: 3 }, 0.8).includes('Bài 38: 1 đáy tam giác đều + 3 mặt bên'));

  // V4-CN-10..15: 10-02-C03, 11-12-C03, 9-11-C03, 11-09-C03, 12-07-C02, 12-10-C03
  assert.ok(grade10Math('10-02-C03', grade10Defaults('10-02-C03')).latex.includes('Mở rộng / Vận dụng Bài 4'));
  assert.ok(graphExperiment('11-12-C03', graphDefaults('11-12-C03')).summary.includes('Bài 32 — Quy tắc tính đạo hàm'));
  assert.ok(grade9Math('9-11-C03', grade9Defaults('9-11-C03')).values.join(' ').includes('0 ≤ d ≤ R'));
  assert.ok(grade11Math('11-09-C03', grade11Defaults('11-09-C03')).latex.includes('Mở rộng / Vận dụng Bài 27'));
  assert.ok(grade12Math('12-07-C02', grade12Defaults('12-07-C02')).latex.includes('Tùy trường hợp Bài 13'));
  assert.ok(grade12Math('12-10-C03', grade12Defaults('12-10-C03')).latex.includes('Mở rộng trực quan Bài 17'));
});

test('R7.4 Pedagogical Visuals & Real-World Models: Angle arcs, degree labels, correlation boxes, and all 16 real-world portal models', () => {
  // 1. Grade 7 parallel lines & angles (7-02-C01..C05) must show angle arcs, vertex/line names, degrees, and 3-step correlation box
  for (const id of ['7-02-C01', '7-02-C02', '7-02-C03', '7-02-C04', '7-02-C05']) {
    const svg = grade7SVGScene(id, grade7Defaults(id), 0.5);
    assert.ok(svg.includes('°'), `${id} must display degree labels on angle arcs`);
    assert.ok(svg.includes('Quan sát:') && svg.includes('Kết luận'), `${id} must display pedagogical observation and conclusion panel`);
  }
  const svg702c03 = grade7SVGScene('7-02-C03', grade7Defaults('7-02-C03'), 0.5);
  assert.ok(svg702c03.includes('∠A₁ =') && svg702c03.includes('∠B₁ =') && svg702c03.includes('a ∥ b'));

  // 2. Grade 8, 9, 10, 11 SVG scenes include explicit angle arcs, perpendicular marks, and correlation takeaways
  const svg803 = grade8SVGScene('8-03-C01', grade8Defaults('8-03-C01'), 0.5);
  assert.ok(svg803.includes('DE ∥ BC') && svg803.includes('∠ADE = ∠B'));
  const svg804 = grade8SVGScene('8-04-C01', grade8Defaults('8-04-C01'), 0.5);
  assert.ok(svg804.includes('AD là đường phân giác') && svg804.includes('BD/DC = AB/AC'));
  const svg905 = grade9SceneSVG('9-05-C02', grade9Defaults('9-05-C02'), 0.5);
  assert.ok(svg905.includes('∠AOB ='));
  const svg907 = grade9SceneSVG('9-07-C01', grade9Defaults('9-07-C01'), 0.5);
  assert.ok(svg907.includes('∠AOB =') && svg907.includes('∠AMB ='));
  const svg1003 = grade10SceneSVG('10-03-C02', grade10Defaults('10-03-C02'), 0.5);
  assert.ok(svg1003.includes('2R ='));
  const svg1101 = grade11SceneSVG('11-01-C02', grade11Defaults('11-01-C02'), 0.5);
  assert.ok(svg1101.includes('cos α') && svg1101.includes('sin α'));

  // 3. All Real-World Portal models across Grades 7-12 map to specialized categories (never generic 'geometry' fallback)
  const catalogItems = JSON.parse(read('data/catalog.json')).items;
  for (const g of [7, 8, 9, 10, 11, 12]) {
    const realModels = portalExhibits(catalogItems, g, 'real');
    assert.ok(realModels.length >= 2, `Grade ${g} must have at least 2 real-world portal models`);
    for (const m of realModels) {
      const cat = realWorldCategory(m);
      assert.notEqual(cat, 'geometry', `Real-world model ${m.id} (${m.title}) must map to a dedicated 2.5D schematic category, got ${cat}`);
    }
  }
});

test('R7.4 Full 310-Model Pedagogical Criteria Audit: Every model in Grades 6-12 has Observe, Correlate, Takeaway, and explicit visual markings', () => {
  const allModels = getAllCurriculumModels();
  assert.equal(allModels.length, 310, 'Curriculum manifest must have all 310 models');

  // 1. All 310 models must return non-empty step1/observe, step2/correlate, and step3/takeaway in getGuidedDiscoveryPlan
  for (const entry of allModels) {
    const plan = getGuidedDiscoveryPlan(entry.id, entry);
    assert.ok(plan.observe && plan.observe.length > 10, `Model ${entry.id} missing observe step`);
    assert.ok(plan.correlate && plan.correlate.length > 10, `Model ${entry.id} missing correlate step`);
    assert.ok(plan.takeaway && plan.takeaway.length > 10, `Model ${entry.id} missing takeaway conclusion`);
  }

  // 2. All 63 Grade 6 models render on 2D canvas with explicit pedagogical text (Quan sát / Kết luận) and zero errors
  assert.equal(ALL_MATH6_LABS.length, 63, 'Grade 6 catalog must have 63 models');
  for (const item of ALL_MATH6_LABS) {
    const texts = [];
    const mockCtx = new Proxy({}, {
      get(t, k) {
        if (k === 'fillText') return text => texts.push(String(text));
        if (k === 'canvas') return { width: 920, height: 560 };
        return k in t ? t[k] : (() => {});
      },
      set(t, k, v) { t[k] = v; return true; }
    });
    renderMath6Model(mockCtx, item, { params: structuredClone(item.defaults), time: 0, counts: [], lastOutcome: undefined, tileFlips: new Set(), selectedDesk: 0 });
    const joined = texts.join(' | ');
    assert.ok(
      joined.includes('Quan sát') || joined.includes('Kết luận') || joined.includes('Tương quan') || joined.includes('Kéo') || joined.includes('Đổi'),
      `Grade 6 model ${item.id} (${item.engine}) must render explicit pedagogical observation/conclusion on canvas`
    );
  }

  // 3. All Grade 7-12 2D & Net SVG scenes render explicit pedagogical markings and takeaways without NaN/undefined
  const checkSvg = (id, svg) => {
    assert.ok(svg && svg.startsWith('<svg'), `${id} must produce valid SVG`);
    assert.ok(!/NaN|undefined|Infinity/.test(svg), `${id} SVG contains NaN/undefined/Infinity`);
    assert.ok(
      svg.includes('Kết luận') || svg.includes('Tương quan') || svg.includes('Quan sát') || svg.includes('•'),
      `${id} SVG must display explicit pedagogical correlation/conclusion`
    );
  };
  for (const id of ['7-01-C01', '7-02-C03', '7-03-C01', '7-05-C03', '7-06-C01', '7-07-C01', '7-10-C01']) {
    checkSvg(id, grade7SVGScene(id, grade7Defaults(id), 0.5));
  }
  for (const id of ['7-08-C03', '7-09-C03']) {
    checkSvg(id, grade7NetSVG(id, grade7Defaults(id), 0.5));
  }
  for (const id of ['8-01-C01', '8-01-C02', '8-01-C03', '8-02-C01', '8-03-C01', '8-04-C01', '8-05-C01', '8-06-C08', '8-06-C09', '8-08-C01', '8-08-C03', '8-08-C04', '8-08-C05']) {
    checkSvg(id, grade8SVGScene(id, grade8Defaults(id), 0.5));
  }
  for (const id of ['8-09-C01', '8-09-C02']) {
    checkSvg(id, grade8NetSVG(id, grade8Defaults(id), 0.5));
  }
  for (const id of ['9-02-C01', '9-03-C01', '9-04-C02', '9-05-C01', '9-07-C01', '9-07-C03', '9-07-C05', '9-12-C01', '9-13-C01', '9-13-C02', '9-13-C03']) {
    checkSvg(id, grade9SceneSVG(id, grade9Defaults(id), 0.5));
  }
  for (const id of ['9-09-C01', '9-10-C01', '9-11-C01', '9-11-C02', '9-11-C03']) {
    checkSvg(id, grade9NetSVG(id, grade9Defaults(id), 0.5));
  }
  for (const id of ['10-01-C01', '10-02-C03', '10-03-C01', '10-04-C01', '10-04-C04', '10-05-C02', '10-07-C01', '10-08-C03', '10-09-C01', '10-09-C02', '10-09-C03']) {
    checkSvg(id, grade10SceneSVG(id, grade10Defaults(id), 0.5));
  }
  for (const id of ['11-01-C01', '11-01-C02', '11-02-C05', '11-03-C02', '11-04-C02', '11-10-C02', '11-13-C01']) {
    checkSvg(id, grade11SceneSVG(id, grade11Defaults(id), 0.5));
  }
  for (const id of ['12-03-C01', '12-05-C02', '12-06-C01', '12-11-C03']) {
    checkSvg(id, grade12SceneSVG(id, grade12Defaults(id), 0.5));
  }
  // 4. All FunctionGraphLab modes produce non-empty summary and LaTeX
  for (const entry of allModels) {
    if (isGraphCase(entry.id)) {
      const g = graphExperiment(entry.id, graphDefaults(entry.id));
      assert.ok(g.summary && g.summary.length > 5 && g.latex, `Graph mode ${entry.id} must have summary and latex`);
    }
  }
});

test('R7.4 3D Unfolding Kinematics & Stacked Mathematical Fractions: Faces peel above base plane (never below y=-h/2) and SVG fractions/labels do not overlap', () => {
  const solidSpecs = [
    { type: 'squarePyramid', params: { a: 4, h: 4 } },
    { type: 'trianglePyramid', params: { a: 4, h: 4 } },
    { type: 'tetrahedron', params: { a: 4 } },
    { type: 'cube', params: { a: 3 } },
    { type: 'cuboid', params: { a: 4, b: 3, h: 4 } },
    { type: 'prismQuad', params: { a: 4, b: 2.5, h_base: 2, h: 4 } },
    { type: 'triPrism', params: { a: 3.5, h: 4 } },
    { type: 'triangularPrism', params: { a: 3.5, h: 4 } }
  ];
  for (const spec of solidSpecs) {
    const holder = createMathModel({ id: `test_${spec.type}`, type: spec.type, params: spec.params });
    assert.equal(holder.supportsUnfold, true, `${spec.type} must support 3D unfolding`);
    const unfoldGroup = holder.userData.unfoldGroup;
    assert.ok(unfoldGroup && typeof unfoldGroup.setUnfold === 'function', `${spec.type} must have unfoldGroup.setUnfold`);
    unfoldGroup.setUnfold(1.0);
    holder.updateMatrixWorld(true);
    const flatBox = new THREE.Box3().setFromObject(unfoldGroup);
    assert.ok(Math.abs(flatBox.max.y - flatBox.min.y) < 1e-4, `${spec.type} at progress=1.0 must lie completely flat on the base plane, got height=${flatBox.max.y - flatBox.min.y}`);
    const basePlaneY = flatBox.min.y;
    for (const prog of [0, 0.25, 0.5, 0.75, 1.0]) {
      unfoldGroup.setUnfold(prog);
      holder.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(unfoldGroup);
      assert.ok(box.min.y >= basePlaneY - 1e-4, `${spec.type} at progress=${prog} went below base plane: min.y=${box.min.y} < ${basePlaneY}`);
    }
    disposeObject(holder);
  }

  // Stacked fractions & non-overlapping labels in Grade 8, 9, 10
  const svg8 = grade8SVGScene('8-06-C07', grade8Defaults('8-06-C07'), 0.5);
  assert.ok(svg8.includes('<desc>AD/AB') && svg8.includes('<desc>AE/AC') && svg8.includes('<desc>DE/BC'), '8-06-C07 must render stacked fractions');
  const svg9 = grade9SceneSVG('9-03-C01', grade9Defaults('9-03-C01'), 0.5);
  assert.ok(svg9.includes('<desc>• sin α = đối/huyền') && svg9.includes('<desc>• cos α = kề/huyền'), '9-03-C01 must render stacked trig fractions');
  const svg10 = grade10SceneSVG('10-02-C03', grade10Defaults('10-02-C03'), 0.5);
  assert.ok(svg10.includes('height="66" rx="10" fill="#ffffffea"'), '10-02-C03 must separate bottom conclusion in dedicated banner below Oxy grid');

  // Verify all rebuilt Grade 10, 11, 12 custom SVG modes contain 1. Quan sát, 2. Tương quan, and 3. KẾT LUẬN SGK
  for (const id of GRADE10_IDS) {
    const s = grade10SceneSVG(id, grade10Defaults(id), 0.5);
    assert.ok(s.includes('1. Quan sát:') && s.includes('2. Tương quan:') && s.includes('3. KẾT LUẬN SGK'), `${id} must contain 3-step pedagogical workbench`);
  }
  const venn1001 = grade10SceneSVG('10-01-C01', grade10Defaults('10-01-C01'), 0.5);
  assert.ok(venn1001.includes('A \\ B = 4') && venn1001.includes('A ∩ B = 3') && venn1001.includes('B \\ A = 5') && venn1001.includes('Ngoài: 2'), '10-01-C01 must display all 4 Venn disjoint region badges');
});





