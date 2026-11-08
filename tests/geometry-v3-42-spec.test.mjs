import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../src/math/geometry-v3-core.mjs';
import { polyhedronEdges, obliqueSection, obliqueSectionThroughPoints } from '../src/math/oblique-sections.js';
import { createMathModel } from '../src/geometry.js';
import { normalizeExhibit } from '../src/math-core.js';
import { Solid3DViewer } from '../src/viewers/Solid3DViewer.js';

test('E01 & E02: Regular triangular pyramid (chop3) outward unfold and rigidity', () => {
  const a = 4, h = 6;
  const metrics = core.triangularPyramidMetrics(a, h);
  const beta = Math.atan2(h, metrics.inradius);
  assert.ok(Math.abs(metrics.baseFaceAngle - beta) < 1e-9);
  assert.ok(Math.abs(metrics.outwardUnfoldAngle - (Math.PI - beta)) < 1e-9);

  for (const t of [0, 0.25, 0.5, 0.75, 1.0]) {
    const faces = core.regularTriPyramidFaces(a, h, t);
    assert.equal(faces.sides.length, 3);
    for (const [P, Q, S] of faces.sides) {
      const edgeBase = Math.hypot(P[0] - Q[0], P[1] - Q[1], P[2] - Q[2]);
      const edgeSide1 = Math.hypot(S[0] - P[0], S[1] - P[1], S[2] - P[2]);
      const edgeSide2 = Math.hypot(S[0] - Q[0], S[1] - Q[1], S[2] - Q[2]);
      assert.ok(Math.abs(edgeBase - a) < 1e-8, `base edge preserved at t=${t}`);
      assert.ok(Math.abs(edgeSide1 - metrics.sideEdge) < 1e-8, `side edge 1 preserved at t=${t}`);
      assert.ok(Math.abs(edgeSide2 - metrics.sideEdge) < 1e-8, `side edge 2 preserved at t=${t}`);
    }
    // At t=1, all apexes must have y = 0
    if (t === 1.0) {
      for (const [, , S] of faces.sides) {
        assert.ok(Math.abs(S[1]) < 1e-8, 'unfolded faces are coplanar with base at y=0');
      }
    }
  }
});

test('E03: Coordinate system transformations preserve distance and orientation', () => {
  const vMath = [2, 3, 5];
  const vThree = core.toThreeYUp(vMath);
  assert.deepEqual(vThree, [2, 5, -3]);
  const vBack = core.toMathZUp(vThree);
  assert.deepEqual(vBack, vMath);
});

test('E04 & E05: Solids of revolution with washer method and angular sweep', () => {
  // y = sqrt(x) from 0 to 4 -> V = pi * int_0^4 x dx = 8*pi
  const vSqrt = core.solidVolumeOfProfile(x => Math.sqrt(x), 0, 4, 1024);
  assert.ok(Math.abs(vSqrt - 8 * Math.PI) < 1e-4, `volume of sqrt(x): ${vSqrt}`);

  // Washer method: f=1, g=-1 from 0 to 2 -> crosses Ox -> inner radius r=0, R=1 -> V = pi * 1 * 2 = 2*pi
  const vWasher = core.volumeBetweenCurves(() => 1, () => -1, 0, 2, 512);
  assert.ok(Math.abs(vWasher - 2 * Math.PI) < 1e-4, `washer volume: ${vWasher}`);

  // Angular wedge at 180 deg
  const halfV = core.wedgeVolume(8 * Math.PI, 180);
  assert.ok(Math.abs(halfV - 4 * Math.PI) < 1e-9);

  // Geometry generation at 180 deg (has end caps and angular curtain caps)
  const geom180 = core.revolutionGeometry(x => Math.sqrt(x), 0.1, 4, 180, 20, 24);
  assert.ok(geom180.vertices.length > 0);
  assert.ok(geom180.triangles.length > 0);
});

test('E06: Unit cubes face-paint counting (Toán 5) handles 1x1x1 and 3x3x3', () => {
  // 1x1x1 single cube has all 6 faces painted!
  const dist1 = core.paintedCubeFaceDistribution(1, 1, 1);
  assert.equal(dist1.total, 1);
  assert.equal(dist1.exactExposedFaces[6], 1);
  assert.equal(dist1.exactExposedFaces[3], 0);

  // 3x3x3 cube: 8 vertices with 3 painted faces, 12 edges with 2, 6 faces with 1, 1 center with 0
  const dist3 = core.paintedCubeFaceDistribution(3, 3, 3);
  assert.equal(dist3.total, 27);
  assert.equal(dist3.exactExposedFaces[3], 8);
  assert.equal(dist3.exactExposedFaces[2], 12);
  assert.equal(dist3.exactExposedFaces[1], 6);
  assert.equal(dist3.exactExposedFaces[0], 1);
});

test('E08: Cross section (thiết diện) MNP on S.ABCD gives isosceles trapezoid MNPQ with area 7*sqrt(53)/9', () => {
  const S = [0, 0, 4], A = [-2, -2, 0], B = [2, -2, 0], C = [2, 2, 0], D = [-2, 2, 0];
  const vertices = [A, B, C, D, S];
  const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [1, 4], [2, 4], [3, 4]];
  const M = [-1, -1, 2], N = [1, -1, 2], P = [4 / 3, 4 / 3, 4 / 3];

  const section = core.convexSection(vertices, edges, M, N, P);
  assert.equal(section.vertices.length, 4, 'MNPQ has 4 vertices');
  const expectedArea = 7 * Math.sqrt(53) / 9;
  assert.ok(Math.abs(section.area - expectedArea) < 1e-8, `area ${section.area} matches ${expectedArea}`);

  // Point Q on SD is (-4/3, 4/3, 4/3)
  const hasQ = section.vertices.some(v => Math.hypot(v[0] - (-4/3), v[1] - 4/3, v[2] - 4/3) < 1e-6);
  assert.ok(hasQ, 'intersection point Q on SD found');
});

test('E09 & E10: Acute angles and common perpendicular between skew lines', () => {
  const u = [1, 0, 0], n = [0, 1, 0];
  const angle = core.linePlaneAcuteAngle(u, n);
  assert.ok(Math.abs(angle - 0) < 1e-9, 'line parallel to plane has angle 0');

  const n1 = [0, 1, 0], n2 = [0, 0, 1];
  const planeAngle = core.betweenPlanesAcuteAngle(n1, n2);
  assert.ok(Math.abs(planeAngle - Math.PI / 2) < 1e-9, 'perpendicular planes angle pi/2');

  // Skew lines
  const P = [0, 0, 0], dir1 = [1, 0, 0];
  const Q = [0, 2, 0], dir2 = [0, 0, 1];
  const res = core.closestPointsBetweenLines(P, dir1, Q, dir2);
  assert.equal(res.kind, 'skew');
  assert.ok(Math.abs(res.distance - 2) < 1e-9);
});

test('Nets of curved surfaces (cone, cylinder, frustum)', () => {
  const cNet = core.coneNet(3, 4);
  assert.ok(Math.abs(cNet.slant - 5) < 1e-9);
  assert.ok(Math.abs(cNet.sectorAngle - (6 * Math.PI / 5)) < 1e-9);

  const cylNet = core.cylinderNet(2, 5);
  assert.ok(Math.abs(cylNet.rectangleWidth - 4 * Math.PI) < 1e-9);
  assert.ok(Math.abs(cylNet.rectangleHeight - 5) < 1e-9);

  const fNet = core.frustumNet(4, 2, 3);
  assert.ok(fNet.outerRadius > fNet.innerRadius);
  assert.ok(fNet.angle > 0);
});

test('createMathModel supports unfold on all required configurations', () => {
  const unfoldTypes = [
    'squarePyramid', 'trianglePyramid', 'tetrahedron', 'cube', 'cuboid',
    'cone', 'cylinder', 'conicalFrustum', 'frustumPyramid', 'triPrism'
  ];
  for (const t of unfoldTypes) {
    const item = normalizeExhibit({ id: `test_${t}`, grade: 11, title: t, type: t, params: { a: 4, h: 5, r: 3, R: 4 } });
    const model = createMathModel(item, { faces: true, edges: true, labels: false });
    assert.equal(model.supportsUnfold, true, `type ${t} must support unfold`);
    assert.doesNotThrow(() => model.setUnfoldProgress(0.5));
    assert.doesNotThrow(() => model.setUnfoldProgress(1.0));
    assert.doesNotThrow(() => model.setUnfoldProgress(0.0));
  }
});

test('createMathModel supports oblique cross-section on convex shapes', () => {
  const sectionTypes = ['cube', 'cuboid', 'squarePyramid', 'tetrahedron', 'triPrism', 'frustumPyramid'];
  for (const t of sectionTypes) {
    const item = normalizeExhibit({ id: `test_${t}`, grade: 11, title: t, type: t, params: { a: 4, b: 3, h: 5 } });
    const model = createMathModel(item, { faces: true, edges: true, labels: false });
    assert.equal(model.supportsObliqueSection, true, `type ${t} must support oblique section`);
    const res = model.setObliqueSection(true, 50, 15);
    assert.ok(res !== null, `section result for ${t} should exist`);
  }
});

test('Solid3DViewer exportStateJSON and importStateJSON roundtrip (Phase 7)', () => {
  const viewer = new Solid3DViewer({ id: 'test_cube', grade: 11, type: 'cube', params: { a: 4 } });
  viewer.distance = 9.5;
  viewer.yaw = 1.2;
  viewer.pitch = 0.45;
  viewer.unfoldEnabled = true;
  viewer.unfoldProgress = 0.75;

  const jsonStr = viewer.exportStateJSON();
  const parsed = JSON.parse(jsonStr);
  assert.equal(parsed.schemaVersion, '3.0');
  assert.equal(parsed.type, 'cube');
  assert.equal(parsed.camera.distance, 9.5);
  assert.equal(parsed.unfold.progress, 0.75);

  const viewer2 = new Solid3DViewer({ id: 'test_cube', grade: 11, type: 'cube', params: { a: 2 } });
  const ok = viewer2.importStateJSON(jsonStr);
  assert.equal(ok, true);
  assert.equal(viewer2.distance, 9.5);
  assert.equal(viewer2.yaw, 1.2);
  assert.equal(viewer2.pitch, 0.45);
  assert.equal(viewer2.unfoldEnabled, true);
  assert.equal(viewer2.unfoldProgress, 0.75);
});
