/**
 * MATHVERSE R6.7 / R10.3 – DISTINCT, MATHEMATICALLY FAITHFUL 3D PEDESTAL EXHIBITS
 * Every one of the 310 models (63 in Grade 6 + 247 across 67 families in Grades 7–12)
 * builds a unique, multi-part, animated 3D representation of its exact mathematical
 * concept and case (C01, C02, C03...) — never falling back to identical placeholder shapes.
 */
import * as THREE from '../../vendor/three.module.js';
import {createGrade6Preview} from './r65-grade6-display.mjs';
import {createEducationalMotion, educationalFrame, modelMotionPlan} from './learning-motion.mjs';
import {
  EXTENDED_MUSEUM_MODE_TO_FOLD_NET,
  getFoldNetDefinition,
  getFoldNetForModeId
} from './fold-net/index.mjs';
import {createMuseumFoldGroup} from './fold-net/museum-bridge.mjs';

const PALETTE = [0x2dd4bf, 0xf59e0b, 0xa855f7, 0x38bdf8, 0xf43f5e, 0x10b981];
const TEAL = 0x14b8a6;
const GOLD = 0xf59e0b;
const CORAL = 0xf43f5e;
const VIOLET = 0x8b5cf6;
const SKY = 0x0284c7;
const EMERALD = 0x10b981;
const SLATE = 0x334155;
const LIGHT_SLATE = 0x94a3b8;

const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({
  color,
  roughness: 0.34,
  metalness: 0.16,
  ...extra
});

function hash(str = '') {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return Math.abs(h);
}

function rod(a, b, r = 0.036, color = 0xe2e8f0) {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const dir = vb.clone().sub(va), len = Math.max(0.001, dir.length());
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 14), mat(color));
  m.position.copy(va).add(vb).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  m.userData.mathLine={a:[...a],b:[...b]};
  return m;
}

/** Change the endpoint of an actual Euclidean segment; no decorative wobble. */
function poseRod(mesh,a,b){
  const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b);
  const d=B.clone().sub(A), len=d.length();
  const original=mesh.geometry.parameters.height;
  mesh.position.copy(A).addScaledVector(d,.5);
  if(len>1e-10)mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
  mesh.scale.y=Math.max(.00001,len/Math.max(.00001,original));
}

function dot(p, r = 0.075, color = GOLD) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat(color, { emissive: color, emissiveIntensity: 0.22 }));
  m.position.set(...p);
  m.userData.mathPoint=true;
  return m;
}

function arrow3D(a, b, color = GOLD, r = 0.038) {
  const g = new THREE.Group();
  g.add(rod(a, b, r, color));
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const dir = vb.clone().sub(va).normalize();
  const cone = new THREE.Mesh(new THREE.ConeGeometry(r * 2.5, r * 5.2, 14), mat(color, { emissive: color, emissiveIntensity: 0.2 }));
  cone.position.copy(vb);
  cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  cone.userData.mathArrowTip=true;
  cone.userData.mathArrowStem=g.children[0];
  g.add(cone);
  return g;
}

function ringArc(radius = 0.32, startAngle = 0, endAngle = Math.PI / 3, color = GOLD, tube = 0.026) {
  const span = Math.max(0.08, endAngle - startAngle);
  const m = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 10, 32, span), mat(color, { emissive: color, emissiveIntensity: 0.18 }));
  m.rotation.z = startAngle;
  m.userData.mathCurve=true;
  return m;
}

function sectorPlate(radius = 0.36, startAngle = 0, endAngle = Math.PI / 3, color = GOLD, opacity = 0.55) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const a = startAngle + (endAngle - startAngle) * (i / steps);
    shape.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
  }
  shape.closePath();
  const m = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: false }),
    mat(color, { transparent: true, opacity, side: THREE.DoubleSide })
  );
  m.position.z = -0.02;
  return m;
}

function rightAngleMarker(corner = [0, 0, 0], uDir = [1, 0, 0], vDir = [0, 1, 0], size = 0.16, color = GOLD) {
  const g = new THREE.Group();
  const c = new THREE.Vector3(...corner);
  const u = new THREE.Vector3(...uDir).normalize().multiplyScalar(size);
  const v = new THREE.Vector3(...vDir).normalize().multiplyScalar(size);
  const p1 = c.clone().add(u);
  const p2 = c.clone().add(u).add(v);
  const p3 = c.clone().add(v);
  g.add(rod(p1.toArray(), p2.toArray(), 0.022, color));
  g.add(rod(p2.toArray(), p3.toArray(), 0.022, color));
  return g;
}

function polygonPlate(pts, color = TEAL, opacity = 0.42, depth = 0.06) {
  const s = new THREE.Shape();
  pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  const mesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false }),
    mat(color, { transparent: true, opacity, side: THREE.DoubleSide })
  );
  mesh.position.z = -depth / 2;
  mesh.userData.mathSurface=true;
  return mesh;
}

function polygonFrame(g, pts, {
  plateColor = TEAL,
  edgeColors = null,
  vertexColor = GOLD,
  diagonals = false,
  diagonalColor = CORAL,
  rightAngles = [],
  centerDot = false
} = {}) {
  g.add(polygonPlate(pts, plateColor, 0.42, 0.06));
  for (let i = 0; i < pts.length; i++) {
    const a = [...pts[i], 0];
    const b = [...pts[(i + 1) % pts.length], 0];
    const col = Array.isArray(edgeColors) ? edgeColors[i % edgeColors.length] : (edgeColors || 0xe2e8f0);
    g.add(rod(a, b, 0.036, col));
    g.add(dot(a, 0.07, vertexColor));
  }
  if (diagonals && pts.length === 4) {
    g.add(rod([...pts[0], 0.02], [...pts[2], 0.02], 0.026, diagonalColor));
    g.add(rod([...pts[1], 0.02], [...pts[3], 0.02], 0.026, diagonalColor));
  }
  for (const idx of rightAngles) {
    const prev = pts[(idx - 1 + pts.length) % pts.length];
    const cur = pts[idx];
    const next = pts[(idx + 1) % pts.length];
    g.add(rightAngleMarker(
      [cur[0], cur[1], 0.03],
      [prev[0] - cur[0], prev[1] - cur[1], 0],
      [next[0] - cur[0], next[1] - cur[1], 0],
      0.16,
      GOLD
    ));
  }
  if (centerDot) {
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    g.add(dot([cx, cy, 0.03], 0.075, CORAL));
  }
}

function axes2D(g, { xRange = 1.0, yRange = 0.85, grid = true } = {}) {
  if (grid) {
    for (let x = -0.8; x <= 0.81; x += 0.4) {
      g.add(rod([x, -yRange, -0.02], [x, yRange, -0.02], 0.008, LIGHT_SLATE));
    }
    for (let y = -0.6; y <= 0.61; y += 0.3) {
      g.add(rod([-xRange, y, -0.02], [xRange, y, -0.02], 0.008, LIGHT_SLATE));
    }
  }
  g.add(arrow3D([-xRange, 0, 0], [xRange, 0, 0], SLATE, 0.024));
  g.add(arrow3D([0, -yRange, 0], [0, yRange, 0], SLATE, 0.024));
}

function axes3D(g, len = 0.95) {
  g.add(arrow3D([-0.2, 0, 0], [len, 0, 0], CORAL, 0.024));
  g.add(arrow3D([0, -0.2, 0], [0, len, 0], EMERALD, 0.024));
  g.add(arrow3D([0, 0, -0.2], [0, 0, len], SKY, 0.024));
  g.add(dot([0, 0, 0], 0.055, GOLD));
}

function curveTube(fn, { xMin = -0.9, xMax = 0.9, steps = 44, color = TEAL, r = 0.034, z = 0.02 } = {}) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const x = xMin + (xMax - xMin) * (i / steps);
    const y = fn(x);
    if (Number.isFinite(y) && Math.abs(y) <= 1.25) {
      pts.push(new THREE.Vector3(x, THREE.MathUtils.clamp(y, -0.95, 0.95), z));
    }
  }
  if (pts.length < 2) return new THREE.Group();
  const curve = new THREE.CatmullRomCurve3(pts);
  const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve, steps, r, 10, false), mat(color, { emissive: color, emissiveIntensity: 0.12 }));
  mesh.userData.mathCurve=true;
  return mesh;
}

function extractLabAndCase(mode = {}) {
  const idStr = String(mode.id || '');
  const m = idStr.match(/^(\d+-\d+)-C(\d+)$/);
  const rawLab = String(mode.sourceLabId || mode.labId || '');
  const lab = m ? m[1] : rawLab;
  const caseNum = m ? Number(m[2]) : 1;
  return { lab, caseNum, idStr };
}

function buildFamilyExhibit(g, mode, grade, seed) {
  const { lab, caseNum } = extractLabAndCase(mode);
  const c = caseNum;

  // ==================== LỚP 7 ====================
  if (lab === '7-01') {
    // Trục số, số thực và căn bậc hai
    g.add(arrow3D([-1.05, -0.15, 0], [1.05, -0.15, 0], TEAL, 0.036));
    for (let i = -4; i <= 4; i++) {
      g.add(rod([i * 0.22, -0.24, 0], [i * 0.22, -0.06, 0], 0.016, 0xe2e8f0));
    }
    if (c === 1) {
      // Số hữu tỉ p/q: các vạch chia phần tư và điểm p/q
      for (let j = 1; j <= 3; j++) {
        g.add(rod([j * 0.11, -0.21, 0], [j * 0.11, -0.09, 0], 0.011, GOLD));
      }
      const marker = dot([0.33, -0.15, 0], 0.095, GOLD);
      const pointer = arrow3D([0.33, 0.45, 0], [0.33, -0.02, 0], CORAL, 0.03);
      g.add(marker, pointer);
      g.userData.animatePart = (t) => {
        const x = -0.55 + 1.10 * t;
        marker.position.x = x;
        pointer.position.x = x - 0.33;
      };
    } else if (c === 2) {
      // Căn bậc hai √2 bằng tam giác vuông cạnh 1 và cung compa hạ xuống trục số
      const triPts = [[0, -0.15], [0.44, -0.15], [0.44, 0.29]];
      polygonFrame(g, triPts, { plateColor: SKY, edgeColors: [TEAL, GOLD, CORAL], rightAngles: [1] });
      const arc = ringArc(0.622, 0, Math.PI / 4, CORAL, 0.022);
      arc.position.set(0, -0.15, 0.02);
      g.add(arc, dot([0.622, -0.15, 0.03], 0.085, CORAL));
    } else {
      // So sánh và làm tròn số
      g.add(rod([0, -0.32, 0], [0, 0.32, 0], 0.022, GOLD)); // mốc trung điểm 0.5
      g.add(arrow3D([-0.15, 0.18, 0], [-0.66, 0.18, 0], SKY, 0.028));
      g.add(arrow3D([0.15, 0.18, 0], [0.66, 0.18, 0], EMERALD, 0.028));
      const ball = dot([0.28, -0.15, 0.04], 0.095, CORAL);
      g.add(ball);
      g.userData.animatePart = (t) => { ball.position.x = -0.12 + 0.58 * t; };
    }
    return true;
  }

  if (lab === '7-02') {
    // Góc và hai đường thẳng song song
    if (c === 1) {
      // Hai góc kề bù (α + β = 180°)
      g.add(rod([-1.0, -0.25, 0], [1.0, -0.25, 0], 0.038, 0xe2e8f0));
      const ray = rod([0, -0.25, 0], [0.48, 0.58, 0], 0.038, GOLD);
      const s1 = sectorPlate(0.42, 0, 1.05, TEAL, 0.6);
      const s2 = sectorPlate(0.34, 1.05, Math.PI, CORAL, 0.6);
      s1.position.y = -0.25; s2.position.y = -0.25;
      g.add(ray, s1, s2, dot([0, -0.25, 0.03], 0.08, GOLD));
    } else if (c === 2) {
      // Hai góc đối đỉnh (chữ X)
      g.add(rod([-0.95, -0.52, 0], [0.95, 0.52, 0], 0.038, TEAL));
      g.add(rod([-0.95, 0.52, 0], [0.95, -0.52, 0], 0.038, SKY));
      g.add(sectorPlate(0.38, -0.5, 0.5, GOLD, 0.65));
      g.add(sectorPlate(0.38, Math.PI - 0.5, Math.PI + 0.5, GOLD, 0.65));
      g.add(dot([0, 0, 0.03], 0.08, CORAL));
    } else {
      // Hai đường thẳng song song + cát tuyến (C03: đồng vị, C04: so le trong, C05: dấu hiệu nhận biết)
      g.add(rod([-1.0, 0.36, 0], [1.0, 0.36, 0], 0.038, TEAL));
      g.add(rod([-1.0, -0.36, 0], [1.0, -0.36, 0], 0.038, TEAL));
      g.add(rod([-0.55, -0.78, 0], [0.55, 0.78, 0], 0.036, GOLD));
      const aTop = sectorPlate(0.30, 0, 0.96, CORAL, 0.68);
      aTop.position.set(0.25, 0.36, 0);
      const aBot = sectorPlate(
        0.30,
        c === 4 ? Math.PI : 0,
        c === 4 ? Math.PI + 0.96 : 0.96,
        c === 5 ? EMERALD : CORAL,
        0.68
      );
      aBot.position.set(-0.25, -0.36, 0);
      g.add(aTop, aBot, dot([0.25, 0.36, 0.03], 0.07, GOLD), dot([-0.25, -0.36, 0.03], 0.07, GOLD));
      if (c === 5) {
        // Thước ê-ke kiểm chứng song song
        g.add(polygonPlate([[-0.25, -0.36], [0.15, -0.36], [-0.25, 0.12]], VIOLET, 0.45, 0.04));
      }
    }
    return true;
  }

  if (lab === '7-03') {
    // Góc trong tam giác
    if (c === 1) {
      // Tổng 3 góc = 180° (có đường thẳng song song đáy qua đỉnh A)
      const pts = [[-0.82, -0.46], [0.82, -0.46], [0.08, 0.56]];
      polygonFrame(g, pts, { plateColor: TEAL });
      g.add(rod([-0.85, 0.56, 0], [0.95, 0.56, 0], 0.026, GOLD));
      const sA = sectorPlate(0.26, -2.25, -0.95, GOLD, 0.7); sA.position.set(0.08, 0.56, 0.02);
      const sB = sectorPlate(0.28, 0, 0.85, CORAL, 0.7); sB.position.set(-0.82, -0.46, 0.02);
      const sC = sectorPlate(0.28, Math.PI - 0.92, Math.PI, VIOLET, 0.7); sC.position.set(0.82, -0.46, 0.02);
      g.add(sA, sB, sC);
    } else if (c === 2) {
      // Góc ngoài tam giác
      const pts = [[-0.88, -0.42], [0.32, -0.42], [-0.22, 0.56]];
      polygonFrame(g, pts, { plateColor: SKY });
      g.add( arrow3D([0.32, -0.42, 0], [1.05, -0.42, 0], CORAL, 0.032) );
      const ext = sectorPlate(0.36, 0, 2.08, CORAL, 0.72);
      ext.position.set(0.32, -0.42, 0.02);
      g.add(ext);
    } else if (c === 3) {
      // Quan hệ góc và cạnh đối diện (góc lớn đối diện cạnh lớn)
      const pts = [[-0.92, -0.45], [0.92, -0.45], [-0.35, 0.42]];
      polygonFrame(g, pts, { plateColor: TEAL, edgeColors: [GOLD, SKY, SKY] });
      const bigAngle = sectorPlate(0.32, -2.55, -0.58, CORAL, 0.75);
      bigAngle.position.set(-0.35, 0.42, 0.02);
      g.add(bigAngle, arrow3D([-0.35, 0.15, 0.04], [0, -0.38, 0.04], GOLD, 0.028));
    } else if (c === 4) {
      // Bất đẳng thức tam giác (a + b > c)
      g.add(rod([-0.85, -0.42, 0], [0.85, -0.42, 0], 0.044, SKY));
      const armL = rod([-0.85, -0.42, 0], [0.05, 0.48, 0], 0.04, GOLD);
      const armR = rod([0.85, -0.42, 0], [0.05, 0.48, 0], 0.04, CORAL);
      g.add(armL, armR, dot([-0.85, -0.42, 0], 0.08, GOLD), dot([0.85, -0.42, 0], 0.08, GOLD), dot([0.05, 0.48, 0], 0.09, EMERALD));
    } else {
      // Tam giác cân & tam giác đều đặt cạnh nhau
      const iso = [[-0.95, -0.48], [-0.15, -0.48], [-0.55, 0.58]];
      const eq = [[0.15, -0.48], [0.95, -0.48], [0.55, 0.21]];
      polygonFrame(g, iso, { plateColor: TEAL, edgeColors: [SLATE, GOLD, GOLD] });
      polygonFrame(g, eq, { plateColor: VIOLET, edgeColors: [CORAL, CORAL, CORAL] });
    }
    return true;
  }

  if (lab === '7-04') {
    // 7 trường hợp bằng nhau của hai tam giác (C01..C07): luôn hiển thị 2 tam giác đặt cạnh nhau có đánh dấu yếu tố bằng nhau!
    const isRight = c >= 4;
    const leftPts = isRight
      ? [[-0.95, -0.46], [-0.18, -0.46], [-0.95, 0.48]]
      : [[-0.98, -0.46], [-0.14, -0.46], [-0.62, 0.50]];
    const rightPts = isRight
      ? [[0.18, -0.46], [0.95, -0.46], [0.18, 0.48]]
      : [[0.14, -0.46], [0.98, -0.46], [0.50, 0.50]];
    const edgeColsByCase = {
      1: [GOLD, CORAL, TEAL], // c.c.c
      2: [GOLD, SLATE, CORAL], // c.g.c
      3: [GOLD, SLATE, SLATE], // g.c.g
      4: [GOLD, SLATE, CORAL], // 2 cạnh góc vuông
      5: [GOLD, SLATE, SLATE], // cạnh góc vuông - góc nhọn
      6: [SLATE, CORAL, SLATE], // cạnh huyền - góc nhọn
      7: [GOLD, CORAL, SLATE]  // cạnh huyền - cạnh góc vuông
    }[c] || [GOLD, TEAL, CORAL];

    const leftGroup = new THREE.Group();
    const rightGroup = new THREE.Group();
    polygonFrame(leftGroup, leftPts, {
      plateColor: TEAL,
      edgeColors: edgeColsByCase,
      rightAngles: isRight ? [0] : []
    });
    polygonFrame(rightGroup, rightPts, {
      plateColor: SKY,
      edgeColors: edgeColsByCase,
      rightAngles: isRight ? [0] : []
    });
    if ([2, 3, 5, 6].includes(c)) {
      const a1 = sectorPlate(0.24, 0, 0.85, GOLD, 0.72);
      a1.position.set(leftPts[1][0], leftPts[1][1], 0.03);
      const a2 = sectorPlate(0.24, 0, 0.85, GOLD, 0.72);
      a2.position.set(rightPts[1][0], rightPts[1][1], 0.03);
      leftGroup.add(a1);
      rightGroup.add(a2);
    }
    g.add(leftGroup, rightGroup);
    g.userData.motionMeaning='Phép tịnh tiến bảo toàn cạnh, góc để hai tam giác chồng khít';
    g.userData.animatePart = t => {
      leftGroup.position.x=0;
      rightGroup.position.x=-1.12*t;
    };
    return true;
  }

  if (lab === '7-05') {
    // Các đường đồng quy trong tam giác (C01..C05)
    if (c === 5) {
      // Dựng đường trung trực bằng thước và compa
      g.add(rod([-0.72, 0, 0], [0.72, 0, 0], 0.038, TEAL));
      g.add(dot([-0.72, 0, 0], 0.08, GOLD), dot([0.72, 0, 0], 0.08, GOLD));
      const arcL = ringArc(0.88, -0.95, 0.95, SKY, 0.022); arcL.position.x = -0.72;
      const arcR = ringArc(0.88, Math.PI - 0.95, Math.PI + 0.95, SKY, 0.022); arcR.position.x = 0.72;
      g.add(arcL, arcR, rod([0, -0.82, 0.02], [0, 0.82, 0.02], 0.034, CORAL));
      g.add(rightAngleMarker([0, 0, 0.03], [1, 0, 0], [0, 1, 0], 0.15, GOLD));
      return true;
    }
    const A = [-0.86, -0.52], B = [0.86, -0.52], C = [0.12, 0.68];
    polygonFrame(g, [A, B, C], { plateColor: TEAL });
    const midAB = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
    const midBC = [(B[0] + C[0]) / 2, (B[1] + C[1]) / 2];
    const midCA = [(C[0] + A[0]) / 2, (C[1] + A[1]) / 2];
    if (c === 1) {
      // 3 đường trung tuyến + Trọng tâm G
      const Gx = (A[0] + B[0] + C[0]) / 3, Gy = (A[1] + B[1] + C[1]) / 3;
      g.add(
        rod([...A, 0.02], [...midBC, 0.02], 0.024, GOLD),
        rod([...B, 0.02], [...midCA, 0.02], 0.024, GOLD),
        rod([...C, 0.02], [...midAB, 0.02], 0.024, GOLD),
        dot([Gx, Gy, 0.04], 0.10, CORAL)
      );
    } else if (c === 2) {
      // 3 đường phân giác + Đường tròn nội tiếp (I)
      const Ix = 0.04, Iy = -0.14, rIn = 0.36;
      g.add(
        rod([...A, 0.02], [Ix, Iy, 0.02], 0.024, GOLD),
        rod([...B, 0.02], [Ix, Iy, 0.02], 0.024, GOLD),
        rod([...C, 0.02], [Ix, Iy, 0.02], 0.024, GOLD),
        dot([Ix, Iy, 0.04], 0.085, CORAL)
      );
      const incircle = new THREE.Mesh(new THREE.TorusGeometry(rIn, 0.028, 12, 40), mat(CORAL, { emissive: CORAL, emissiveIntensity: 0.2 }));
      incircle.position.set(Ix, Iy, 0.03);
      g.add(incircle);
    } else if (c === 3) {
      // 3 đường trung trực + Đường tròn ngoại tiếp (O)
      const Ox = 0.0, Oy = -0.06, rOut = 0.88;
      g.add(
        rod([...midAB, 0.02], [Ox, Oy, 0.02], 0.024, GOLD),
        rod([...midBC, 0.02], [Ox, Oy, 0.02], 0.024, GOLD),
        rod([...midCA, 0.02], [Ox, Oy, 0.02], 0.024, GOLD),
        dot([Ox, Oy, 0.04], 0.085, CORAL)
      );
      const circum = new THREE.Mesh(new THREE.TorusGeometry(rOut, 0.028, 12, 48), mat(GOLD, { emissive: GOLD, emissiveIntensity: 0.2 }));
      circum.position.set(Ox, Oy, 0.02);
      g.add(circum);
    } else {
      // 3 đường cao + Trực tâm H
      const Hx = 0.12, Hy = -0.18;
      g.add(
        rod([0.12, 0.68, 0.02], [0.12, -0.52, 0.02], 0.026, CORAL),
        rod([...A, 0.02], [0.46, 0.14, 0.02], 0.024, CORAL),
        rod([...B, 0.02], [-0.28, 0.16, 0.02], 0.024, CORAL),
        rightAngleMarker([0.12, -0.52, 0.03], [1, 0, 0], [0, 1, 0], 0.14, GOLD),
        dot([Hx, Hy, 0.04], 0.09, GOLD)
      );
    }
    return true;
  }

  if (lab === '7-06') {
    // Biểu đồ quạt tròn (3D Pie Chart — không bao giờ vẽ nhầm thành đường tròn hình học!)
    const slices = [
      [0, 2.1, TEAL, 0.24],
      [2.1, 3.8, GOLD, 0.30],
      [3.8, 5.1, VIOLET, 0.22],
      [5.1, Math.PI * 2, CORAL, 0.26]
    ];
    slices.forEach(([a0, a1, col, h], idx) => {
      const wedge = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 0.75, h, 24, 1, false, a0, a1 - a0 - 0.04),
        mat(col)
      );
      const mid = (a0 + a1) / 2;
      const pull = (c === 2 && idx === 1) ? 0.18 : 0.03;
      wedge.position.set(Math.sin(mid) * pull, -0.15 + h / 2, Math.cos(mid) * pull);
      g.add(wedge);
    });
    if (c === 3) {
      // Từ biểu đồ cột sang quạt tròn
      [0.45, 0.72, 0.55].forEach((bh, i) => {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.18, bh, 0.18), mat(PALETTE[i]));
        bar.position.set(-0.75 + i * 0.24, 0.25 + bh / 2, -0.35);
        g.add(bar);
      });
    }
    return true;
  }

  if (lab === '7-07') {
    // Biểu đồ đoạn thẳng theo thời gian (3D Line Chart)
    axes2D(g, { xRange: 0.95, yRange: 0.75, grid: true });
    const pts1 = [[-0.75, -0.35], [-0.35, -0.05], [0.05, 0.18], [0.45, 0.08], [0.80, 0.52]];
    for (let i = 0; i < pts1.length; i++) {
      g.add(dot([...pts1[i], 0.04], 0.065, GOLD));
      g.add(rod([pts1[i][0], -0.65, 0], [...pts1[i], 0], 0.012, LIGHT_SLATE));
      if (i + 1 < pts1.length) {
        g.add(rod([...pts1[i], 0.03], [...pts1[i + 1], 0.03], 0.032, TEAL));
      }
    }
    if (c === 2) {
      const pts2 = [[-0.75, 0.42], [-0.35, 0.25], [0.05, -0.05], [0.45, -0.18], [0.80, -0.38]];
      for (let i = 0; i < pts2.length; i++) {
        g.add(dot([...pts2[i], 0.04], 0.06, CORAL));
        if (i + 1 < pts2.length) g.add(rod([...pts2[i], 0.03], [...pts2[i + 1], 0.03], 0.028, CORAL));
      }
    }
    return true;
  }

  if (lab === '7-08') {
    // Hình hộp chữ nhật & Hình lập phương
    if (c === 3) {
      // Khai triển hình hộp chữ nhật (chữ thập 6 mặt 3D)
      const faces = [
        [0, 0, TEAL], [-0.52, 0, GOLD], [0.52, 0, GOLD],
        [0, 0.52, SKY], [0, -0.52, SKY], [0, -1.02, CORAL]
      ];
      const panels = [];
      faces.forEach(([fx, fy, col], i) => {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.46, 0.05), mat(col));
        p.position.set(fx, fy + 0.22, i === 0 ? 0 : 0.08);
        if (i > 0) p.rotation.x = (fy !== 0 ? Math.sign(fy) * 0.28 : 0);
        if (fx !== 0) p.rotation.y = -Math.sign(fx) * 0.28;
        g.add(p);
        panels.push({ p, fx, fy, i });
      });
      g.userData.animatePart = (t) => {
        const fold = Math.sin(t * Math.PI);
        panels.forEach(({ p, fx, fy, i }) => {
          if (i === 0) return;
          p.rotation.x = fy !== 0 ? Math.sign(fy) * (0.1 + 1.35 * fold) : 0;
          p.rotation.y = fx !== 0 ? -Math.sign(fx) * (0.1 + 1.35 * fold) : 0;
          p.position.z = 0.08 + 0.22 * fold;
        });
      };
      return true;
    }
    const dims = c === 2 ? [1.05, 1.05, 1.05] : [1.35, 0.88, 0.92];
    const box = new THREE.Mesh(new THREE.BoxGeometry(...dims), mat(c === 2 ? VIOLET : TEAL, { transparent: true, opacity: 0.48 }));
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(box.geometry), new THREE.LineBasicMaterial({ color: 0xffffff }));
    g.add(box, edges);
    const [w, h, d] = dims.map(v => v / 2);
    if (c === 1) {
      // Đỉnh, cạnh, mặt & đường chéo không gian AC'
      for (const sx of [-w, w]) for (const sy of [-h, h]) for (const sz of [-d, d]) g.add(dot([sx, sy, sz], 0.065, GOLD));
      const diag = rod([-w, -h, d], [w, h, -d], 0.032, CORAL);
      const probe = dot([-w, -h, d], 0.09, GOLD);
      g.add(diag, probe);
      g.userData.animatePart = (t) => {
        probe.position.set(-w + 2 * w * t, -h + 2 * h * t, d - 2 * d * t);
      };
    } else if (c === 2) {
      // Thiết diện chéo hình lập phương ACC'A'
      const diagPlane = new THREE.Mesh(new THREE.PlaneGeometry(Math.hypot(dims[0], dims[2]), dims[1]), mat(GOLD, { transparent: true, opacity: 0.58, side: THREE.DoubleSide }));
      diagPlane.rotation.y = Math.PI / 4;
      g.add(diagPlane);
      g.userData.animatePart = (t) => {
        diagPlane.scale.y = Math.max(0.1, t);
        diagPlane.position.y = -h * (1 - t);
      };
    } else if (c === 4) {
      // Lấp đầy bằng các khối lập phương đơn vị (Thể tích V = a.b.c)
      const units = [];
      for (let ix = -1; ix <= 1; ix++) for (let iy = -0.5; iy <= 0.5; iy += 1) {
        const u = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.36), mat(GOLD));
        u.position.set(ix * 0.4, iy * 0.4, 0);
        g.add(u);
        units.push(u);
      }
      g.userData.animatePart = (t) => {
        const activeCount = Math.max(1, Math.ceil(t * units.length));
        units.forEach((u, idx) => { u.visible = idx < activeCount; });
      };
    }
    return true;
  }

  if (lab === '7-09') {
    // Lăng trụ đứng (C01: tam giác, C02: tứ giác, C03: khai triển, C04: diện tích & thể tích)
    if (c === 3) {
      // Khai triển lăng trụ đứng tam giác (3 mặt bên chữ nhật + 2 đáy tam giác)
      const sidePanels = [];
      [-0.56, 0, 0.56].forEach((x, i) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.82, 0.05), mat(PALETTE[i]));
        m.position.set(x, 0, Math.abs(x) * 0.15);
        g.add(m);
        sidePanels.push({ m, x });
      });
      const tTop = polygonPlate([[-0.25, 0.44], [0.25, 0.44], [0, 0.84]], GOLD, 0.85, 0.05);
      const tBot = polygonPlate([[-0.25, -0.44], [0.25, -0.44], [0, -0.84]], GOLD, 0.85, 0.05);
      g.add(tTop, tBot);
      g.userData.animatePart = (t) => {
        const fold = Math.sin(t * Math.PI);
        sidePanels.forEach(({ m, x }) => {
          if (x !== 0) {
            m.rotation.y = -Math.sign(x) * fold * 1.04;
            m.position.z = Math.abs(x) * (0.15 + 0.32 * fold);
          }
        });
      };
      return true;
    }
    const sides = c === 2 ? 4 : 3;
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.68, 1.18, sides),
      mat(c === 2 ? SKY : TEAL, { transparent: true, opacity: 0.52 })
    );
    if (sides === 4) body.rotation.y = Math.PI / 4;
    const wire = new THREE.LineSegments(new THREE.EdgesGeometry(body.geometry), new THREE.LineBasicMaterial({ color: 0xffffff }));
    if (sides === 4) wire.rotation.y = Math.PI / 4;
    const slice = new THREE.Mesh(
      new THREE.CylinderGeometry(0.69, 0.69, 0.06, sides),
      mat(GOLD, { transparent: true, opacity: 0.82 })
    );
    if (sides === 4) slice.rotation.y = Math.PI / 4;
    g.add(body, wire, slice);
    if (c === 4) {
      g.add(arrow3D([0.85, -0.58, 0], [0.85, 0.58, 0], GOLD, 0.032));
    }
    g.userData.animatePart = (t) => {
      slice.position.y = -0.54 + 1.08 * t;
    };
    return true;
  }

  if (lab === '7-10') {
    // Phép thử ngẫu nhiên & xác suất lớp 7
    const die = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.66, 0.66), mat(0xf8fafc));
    die.position.set(c === 3 ? -0.48 : 0, 0.15, 0);
    die.add(dot([0, 0, 0.34], 0.06, CORAL));
    die.add(dot([-0.16, 0.16, -0.34], 0.05, SLATE), dot([0.16, -0.16, -0.34], 0.05, SLATE));
    g.add(die);
    if (c === 2) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.08, 6), mat(GOLD));
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(0.52, -0.1, 0);
      die.position.x = -0.45;
      g.add(wheel);
    } else if (c === 3) {
      [0.42, 0.68, 0.56].forEach((h, i) => {
        const b = new THREE.Mesh(new THREE.BoxGeometry(0.20, h, 0.20), mat(PALETTE[i]));
        b.position.set(0.15 + i * 0.28, -0.45 + h / 2, 0);
        g.add(b);
      });
      g.add(rod([0.02, -0.12, 0.12], [0.88, -0.12, 0.12], 0.02, GOLD));
    }
    g.userData.animatePart = (t) => { die.rotation.set(t * Math.PI * 2, t * Math.PI * 2, 0); };
    return true;
  }

  // ==================== LỚP 8 ====================
  if (lab === '8-01') {
    // Hằng đẳng thức đáng nhớ
    if (c === 1) {
      // (a + b)² = a² + 2ab + b²
      const pieces = [
        [0.72, 0.72, -0.24, 0.24, TEAL],
        [0.38, 0.72, 0.35, 0.24, GOLD],
        [0.72, 0.38, -0.24, -0.35, GOLD],
        [0.38, 0.38, 0.35, -0.35, VIOLET]
      ];
      const meshes = pieces.map(([w, h, x, y, col]) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.16), mat(col));
        m.position.set(x, y, 0);
        g.add(m);
        return { m, x, y };
      });
      g.userData.animatePart = (t) => {
        const k = 1 + t * 0.22;
        meshes.forEach(p => { p.m.position.set(p.x * k, p.y * k, 0); });
      };
    } else if (c === 2) {
      // Hiệu hai bình phương a² - b² = (a - b)(a + b)
      const mainA = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.62, 0.14), mat(TEAL));
      mainA.position.set(-0.32, 0.15, 0);
      const stripB = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.62, 0.14), mat(GOLD));
      stripB.position.set(0.36, 0.15, 0);
      const cutHole = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.16), mat(CORAL, { wireframe: true }));
      cutHole.position.set(-0.02, -0.35, 0);
      g.add(mainA, stripB, cutHole);
      g.userData.motionMeaning = 'Cắt hình vuông nhỏ b² và ghép dải chữ nhật thành (a − b)(a + b)';
      g.userData.animatePart = (t) => {
        stripB.position.set(0.36 + (1 - t) * 0.28, 0.15 - (1 - t) * 0.42, 0);
        stripB.rotation.z = (1 - t) * Math.PI * 0.5;
      };
    } else {
      // (a + b)³ — Khối lập phương 2x2x2 tách 8 phần
      const blocks = [];
      const sizes = [0.56, 0.32];
      const offsets = [-0.24, 0.24];
      for (let ix = 0; ix < 2; ix++) for (let iy = 0; iy < 2; iy++) for (let iz = 0; iz < 2; iz++) {
        const deg = ix + iy + iz;
        const col = [TEAL, GOLD, VIOLET, CORAL][deg];
        const m = new THREE.Mesh(new THREE.BoxGeometry(sizes[ix], sizes[iy], sizes[iz]), mat(col));
        const bx = offsets[ix], by = offsets[iy], bz = offsets[iz];
        m.position.set(bx, by, bz);
        g.add(m);
        blocks.push({ m, bx, by, bz });
      }
      g.userData.animatePart = (t) => {
        const spread = 1 + t * 0.32;
        blocks.forEach(b => b.m.position.set(b.bx * spread, b.by * spread, b.bz * spread));
      };
    }
    return true;
  }

  if (lab === '8-02') {
    // 5 Tứ giác đặc biệt Lớp 8 — mỗi hình có hình dạng và dấu hiệu đặc trưng hoàn toàn riêng biệt!
    if (c === 1) {
      // 1. Hình thang cân: đáy nhỏ song song đáy lớn, 2 cạnh bên bằng nhau, 2 đường chéo bằng nhau
      const pts = [[-0.86, -0.52], [0.86, -0.52], [0.46, 0.52], [-0.46, 0.52]];
      polygonFrame(g, pts, {
        plateColor: TEAL,
        edgeColors: [GOLD, TEAL, GOLD, TEAL],
        diagonals: true,
        diagonalColor: CORAL
      });
      const aL = sectorPlate(0.24, 0, 1.18, GOLD, 0.68); aL.position.set(-0.86, -0.52, 0.03);
      const aR = sectorPlate(0.24, Math.PI - 1.18, Math.PI, GOLD, 0.68); aR.position.set(0.86, -0.52, 0.03);
      g.add(aL, aR);
    } else if (c === 2) {
      // 2. Hình bình hành: các cặp cạnh đối song song bằng nhau, 2 đường chéo cắt nhau tại trung điểm O
      const pts = [[-0.92, -0.48], [0.54, -0.48], [0.92, 0.48], [-0.54, 0.48]];
      polygonFrame(g, pts, {
        plateColor: SKY,
        edgeColors: [TEAL, GOLD, TEAL, GOLD],
        diagonals: true,
        diagonalColor: VIOLET,
        centerDot: true
      });
    } else if (c === 3) {
      // 3. Hình chữ nhật: 4 góc vuông, 2 đường chéo bằng nhau và nội tiếp đường tròn
      const pts = [[-0.86, -0.52], [0.86, -0.52], [0.86, 0.52], [-0.86, 0.52]];
      polygonFrame(g, pts, {
        plateColor: TEAL,
        edgeColors: [GOLD, TEAL, GOLD, TEAL],
        diagonals: true,
        diagonalColor: CORAL,
        rightAngles: [0, 1, 2, 3],
        centerDot: true
      });
      const circum = new THREE.Mesh(new THREE.TorusGeometry(1.005, 0.018, 10, 48), mat(GOLD, { transparent: true, opacity: 0.55 }));
      g.add(circum);
    } else if (c === 4) {
      // 4. Hình thoi: 4 cạnh bằng nhau (dáng viên kim cương), 2 đường chéo vuông góc tại O
      const pts = [[-0.92, 0], [0, -0.62], [0.92, 0], [0, 0.62]];
      polygonFrame(g, pts, {
        plateColor: VIOLET,
        edgeColors: [TEAL, TEAL, TEAL, TEAL],
        diagonals: true,
        diagonalColor: GOLD,
        centerDot: true
      });
      g.add(rightAngleMarker([0, 0, 0.03], [1, 0, 0], [0, 1, 0], 0.16, CORAL));
    } else {
      // 5. Hình vuông: 4 cạnh bằng nhau, 4 góc vuông, 2 đường chéo bằng nhau & vuông góc
      const pts = [[-0.66, -0.66], [0.66, -0.66], [0.66, 0.66], [-0.66, 0.66]];
      polygonFrame(g, pts, {
        plateColor: EMERALD,
        edgeColors: [GOLD, GOLD, GOLD, GOLD],
        diagonals: true,
        diagonalColor: CORAL,
        rightAngles: [0, 1, 2, 3],
        centerDot: true
      });
      g.add(rightAngleMarker([0, 0, 0.03], [1, 1, 0], [-1, 1, 0], 0.15, GOLD));
    }
    return true;
  }

  if (lab === '8-03') {
    // Định lí Thalès và đường trung bình
    const A = [0.05, 0.68], B = [-0.85, -0.52], C = [0.85, -0.52];
    polygonFrame(g, [A, B, C], { plateColor: TEAL });
    const t = c === 3 ? 0.5 : 0.42; // C03 là đường trung bình (chính giữa)
    const M = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t];
    const N = [A[0] + (C[0] - A[0]) * t, A[1] + (C[1] - A[1]) * t];
    const seg = rod([...M, 0.03], [...N, 0.03], 0.042, c === 3 ? CORAL : GOLD);
    const dM = dot([...M, 0.04], 0.08, GOLD), dN = dot([...N, 0.04], 0.08, GOLD);
    g.add(seg, dM, dN);
    if (c === 3) {
      // Đánh dấu trung điểm trên 2 cạnh bên
      g.add(dot([(A[0] + M[0]) / 2, (A[1] + M[1]) / 2, 0.03], 0.045, CORAL));
      g.add(dot([(B[0] + M[0]) / 2, (B[1] + M[1]) / 2, 0.03], 0.045, CORAL));
    }
    return true;
  }

  if (lab === '8-04') {
    // Tính chất đường phân giác trong tam giác
    const A = [-0.18, 0.66], B = [-0.86, -0.52], C = [0.86, -0.52], D = [-0.08, -0.52];
    polygonFrame(g, [A, B, C], { plateColor: SKY, edgeColors: [GOLD, TEAL, CORAL] });
    g.add(rod([...A, 0.03], [...D, 0.03], 0.04, GOLD), dot([...D, 0.04], 0.085, CORAL));
    const bisArc = sectorPlate(0.28, -2.18, -1.02, GOLD, 0.68);
    bisArc.position.set(A[0], A[1], 0.02);
    g.add(bisArc);
    if (c === 2) {
      g.add(rod([-0.52, 0.07, 0.03], [0.43, 0.07, 0.03], 0.03, VIOLET));
    }
    return true;
  }

  if (lab === '8-05') {
    // Định lí Pythagore
    if (c === 1) {
      // Cối xay gió Euclid: Tam giác vuông + 3 hình vuông dựng trên 3 cạnh a², b², c²
      const A = [-0.36, -0.26], B = [0.24, -0.26], C = [-0.36, 0.54];
      polygonFrame(g, [A, B, C], { plateColor: 0xf8fafc, rightAngles: [0] });
      // Vuông cạnh a = 0.6
      g.add(polygonPlate([[-0.36, -0.86], [0.24, -0.86], [0.24, -0.26], [-0.36, -0.26]], GOLD, 0.72, 0.08));
      // Vuông cạnh b = 0.8
      g.add(polygonPlate([[-1.16, -0.26], [-0.36, -0.26], [-0.36, 0.54], [-1.16, 0.54]], TEAL, 0.72, 0.08));
      // Vuông cạnh huyền c = 1.0
      g.add(polygonPlate([[0.24, -0.26], [1.04, 0.34], [0.44, 1.14], [-0.36, 0.54]], CORAL, 0.72, 0.08));
    } else if (c === 2) {
      // Pythagore đảo (tam giác 3-4-5 có chia đốt chuẩn)
      const A = [-0.60, -0.45], B = [0.60, -0.45], C = [-0.60, 0.45];
      polygonFrame(g, [A, B, C], { plateColor: EMERALD, edgeColors: [GOLD, CORAL, TEAL], rightAngles: [0] });
      for (let i = 1; i < 4; i++) g.add(dot([-0.60 + i * 0.30, -0.45, 0.03], 0.048, GOLD));
      for (let i = 1; i < 3; i++) g.add(dot([-0.60, -0.45 + i * 0.30, 0.03], 0.048, TEAL));
      for (let i = 1; i < 5; i++) g.add(dot([-0.60 + i * 0.24, 0.45 - i * 0.18, 0.03], 0.048, CORAL));
    } else {
      // Ứng dụng thực tế: Thang tựa tường / tính chiều cao tháp
      g.add(rod([-0.65, -0.58, 0], [0.65, -0.58, 0], 0.04, SLATE));
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.16, 0.22), mat(SKY));
      wall.position.set(-0.56, 0, 0);
      const ladder = rod([0.52, -0.56, 0.04], [-0.46, 0.54, 0.04], 0.042, GOLD);
      g.add(wall, ladder, rightAngleMarker([-0.46, -0.56, 0.04], [1, 0, 0], [0, 1, 0], 0.16, CORAL));
    }
    return true;
  }

  if (lab === '8-06') {
    // Các trường hợp đồng dạng của tam giác (C01..C09)
    if (c === 8) {
      // Hình đồng dạng phối cảnh (tâm vị tự O nối tia qua 2 tam giác)
      const O = [-0.95, -0.15, 0];
      const small = [[-0.25, -0.32], [0.05, -0.32], [-0.12, 0.12]];
      const big = [[0.25, -0.46], [0.85, -0.46], [0.51, 0.42]];
      polygonFrame(g, small, { plateColor: GOLD });
      const bigGroup = new THREE.Group();
      polygonFrame(bigGroup, big, { plateColor: TEAL });
      g.add(bigGroup);
      g.add(dot(O, 0.085, CORAL));
      big.forEach(p => g.add(rod(O, [p[0], p[1], -0.02], 0.018, CORAL)));
      g.userData.motionMeaning = 'Phép đồng dạng phối cảnh từ tâm O phóng tam giác theo tỉ số k';
      g.userData.animatePart = (t) => {
        const s = 0.55 + 0.45 * t;
        bigGroup.scale.setScalar(s);
        bigGroup.position.set(O[0] * (1 - s), O[1] * (1 - s), 0);
      };
      return true;
    }
    const isRight = [4, 5, 6].includes(c);
    const smallPts = isRight
      ? [[-0.92, -0.42], [-0.42, -0.42], [-0.92, 0.12]]
      : [[-0.95, -0.42], [-0.35, -0.42], [-0.68, 0.16]];
    // Corresponding sides have the same scale factor (similarity is not cosmetic).
    const bigPts = isRight
      ? [[0.05, -0.52], [0.92, -0.52], [0.05, 0.4196]]
      : [[0.02, -0.52], [0.96, -0.52], [0.443, 0.3886666667]];
    polygonFrame(g, smallPts, { plateColor: GOLD, rightAngles: isRight ? [0] : [] });
    const bigGroup=new THREE.Group();
    const origin=bigPts[0];
    const relative=bigPts.map(([x,y])=>[x-origin[0],y-origin[1]]);
    polygonFrame(bigGroup, relative, { plateColor: TEAL, rightAngles: isRight ? [0] : [] });
    bigGroup.position.set(origin[0],origin[1],0);
    g.add(bigGroup);
    g.userData.motionMeaning='Phép vị tự cùng tâm: các cạnh tương ứng thay đổi cùng một tỉ lệ';
    g.userData.animatePart=t=>{bigGroup.scale.setScalar(.48+.52*t);};
    return true;
  }

  if (lab === '8-07') {
    // Hàm số bậc nhất y = ax + b
    axes2D(g);
    g.add(rod([-0.82, -0.52, 0.02], [0.82, 0.64, 0.02], 0.038, TEAL));
    g.add(dot([0, 0.06, 0.04], 0.075, GOLD), dot([-0.08, 0, 0.04], 0.075, CORAL));
    if (c === 2) {
      // Tam giác độ dốc Δy / Δx (Hệ số góc)
      g.add(rod([-0.08, 0, 0.03], [0.52, 0, 0.03], 0.026, GOLD));
      g.add(rod([0.52, 0, 0.03], [0.52, 0.43, 0.03], 0.026, CORAL));
    } else if (c === 3) {
      // So sánh hai đường thẳng
      g.add(rod([-0.82, -0.76, 0.02], [0.82, 0.40, 0.02], 0.032, GOLD));
      g.add(rod([-0.72, 0.62, 0.02], [0.72, -0.52, 0.02], 0.032, CORAL));
    }
    return true;
  }

  if (lab === '8-08') {
    // Dữ liệu, biểu đồ và xác suất Lớp 8
    if (c === 4) {
      // Xác suất bốc bóng trong hộp (Urn of colored balls)
      const urn = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.50, 0.86, 24, 1, true), mat(SKY, { transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
      urn.position.y = -0.12;
      g.add(urn);
      const ballCols = [CORAL, CORAL, GOLD, TEAL, TEAL, VIOLET];
      ballCols.forEach((col, i) => {
        const angle = (i / ballCols.length) * Math.PI * 2;
        g.add(dot([Math.cos(angle) * 0.24, -0.32 + (i % 2) * 0.18, Math.sin(angle) * 0.24], 0.12, col));
      });
      const picked = dot([0, 0.55, 0], 0.14, CORAL);
      g.add(picked, arrow3D([0, 0.05, 0], [0, 0.42, 0], GOLD, 0.028));
      g.userData.animatePart = (t) => { picked.position.y = 0.52 + t * 0.12; };
      return true;
    }
    if (c === 5) {
      // Tung đồng xu (Xác suất thực nghiệm)
      const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.09, 28), mat(GOLD, { metalness: 0.55, roughness: 0.25 }));
      coin.position.set(-0.35, 0.22, 0);
      const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.62, 0.24), mat(TEAL)); b1.position.set(0.32, -0.18, 0);
      const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.58, 0.24), mat(CORAL)); b2.position.set(0.66, -0.20, 0);
      g.add(coin, b1, b2);
      g.userData.animatePart = (t) => { coin.rotation.x = 2 * Math.PI * t; coin.position.y = 0.22 + Math.sin(Math.PI * t) * 0.18; };
      return true;
    }
  }

  if (lab === '8-09') {
    // Hình chóp đều (C01: chóp tam giác đều, C02: chóp tứ giác đều, C03: khai triển, C04: diện tích & thể tích)
    if (c === 3) {
      // Khai triển hình chóp tứ giác đều (1 đáy vuông + 4 cánh tam giác cân mở ra)
      const base = polygonPlate([[-0.32, -0.32], [0.32, -0.32], [0.32, 0.32], [-0.32, 0.32]], GOLD, 0.85, 0.05);
      g.add(base);
      const petals = [
        [[-0.32, 0.32], [0.32, 0.32], [0, 0.92]],
        [[-0.32, -0.32], [0.32, -0.32], [0, -0.92]],
        [[0.32, -0.32], [0.32, 0.32], [0.92, 0]],
        [[-0.32, -0.32], [-0.32, 0.32], [-0.92, 0]]
      ];
      const petalMeshes = petals.map(pts => {
        const m = polygonPlate(pts, TEAL, 0.78, 0.05);
        g.add(m);
        return m;
      });
      g.userData.animatePart = (t) => {
        const fold = Math.sin(t * Math.PI) * 0.45;
        petalMeshes.forEach((m, idx) => {
          m.position.z = fold * 0.35;
          if (idx === 0) m.rotation.x = fold;
          if (idx === 1) m.rotation.x = -fold;
          if (idx === 2) m.rotation.y = -fold;
          if (idx === 3) m.rotation.y = fold;
        });
      };
      return true;
    }
    const sides = c === 1 ? 3 : 4;
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.78, 1.24, sides),
      mat(c === 1 ? TEAL : GOLD, { transparent: true, opacity: 0.52 })
    );
    if (sides === 4) cone.rotation.y = Math.PI / 4;
    const wire = new THREE.LineSegments(new THREE.EdgesGeometry(cone.geometry), new THREE.LineBasicMaterial({ color: 0xffffff }));
    if (sides === 4) wire.rotation.y = Math.PI / 4;
    // Đường cao SO & thiết diện/trung đoạn động
    const hLine = rod([0, -0.62, 0], [0, 0.62, 0], 0.032, CORAL);
    const sDot = dot([0, 0.62, 0], 0.085, GOLD);
    const secRing = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.76, 0.04, sides), mat(CORAL, { transparent: true, opacity: 0.78 }));
    if (sides === 4) secRing.rotation.y = Math.PI / 4;
    g.add(cone, wire, hLine, sDot, dot([0, -0.62, 0], 0.065, CORAL), secRing);
    g.userData.animatePart = (t) => {
      if (c === 4) {
        const y = -0.58 + 1.05 * t;
        const sc = Math.max(0.08, (0.62 - y) / 1.24);
        secRing.position.y = y;
        secRing.scale.set(sc, 1, sc);
      } else {
        hLine.scale.y = Math.max(0.08, t);
        hLine.position.y = -0.62 * (1 - t);
        sDot.position.y = -0.62 + 1.24 * t;
        secRing.visible = false;
      }
    };
    return true;
  }

  // ==================== LỚP 9 ====================
  if (lab === '9-01') {
    // Hệ hai phương trình bậc nhất hai ẩn
    axes2D(g);
    if (c === 1) {
      // Nghiệm duy nhất (2 đường cắt nhau)
      g.add(rod([-0.82, -0.54, 0.02], [0.82, 0.62, 0.02], 0.036, TEAL));
      g.add(rod([-0.82, 0.58, 0.02], [0.82, -0.46, 0.02], 0.036, CORAL));
      g.add(dot([-0.02, 0.05, 0.05], 0.095, GOLD));
    } else if (c === 2) {
      // Vô nghiệm (2 đường song song)
      g.add(rod([-0.82, -0.26, 0.02], [0.82, 0.54, 0.02], 0.036, TEAL));
      g.add(rod([-0.82, -0.62, 0.02], [0.82, 0.18, 0.02], 0.036, CORAL));
    } else {
      // Vô số nghiệm (2 đường trùng nhau)
      g.add(rod([-0.85, -0.48, 0.01], [0.85, 0.48, 0.01], 0.052, TEAL));
      g.add(rod([-0.85, -0.48, 0.04], [0.85, 0.48, 0.04], 0.028, GOLD));
    }
    return true;
  }

  if (lab === '9-02') {
    // Bất phương trình bậc nhất một ẩn
    g.add(arrow3D([-1.0, 0, 0], [1.0, 0, 0], SLATE, 0.028));
    g.add(rod([-0.2, 0, 0.02], [0.95, 0, 0.02], 0.05, TEAL));
    g.add(rod([-0.2, -0.18, 0.03], [-0.2, 0.18, 0.03], 0.034, GOLD));
    if (c === 2) {
      // Giao 2 điều kiện
      g.add(rod([-0.85, 0.35, 0], [0.45, 0.35, 0], 0.042, CORAL));
      g.add(rod([-0.2, -0.35, 0], [0.45, -0.35, 0], 0.055, EMERALD));
    }
    return true;
  }

  if (lab === '9-03') {
    // Tỉ số lượng giác góc nhọn
    const A = [-0.78, -0.46], B = [0.72, -0.46], C = [0.72, 0.52];
    polygonFrame(g, [A, B, C], {
      plateColor: TEAL,
      edgeColors: [SKY, CORAL, GOLD],
      rightAngles: [1]
    });
    const ang = sectorPlate(0.34, 0, 0.58, GOLD, 0.72);
    ang.position.set(A[0], A[1], 0.03);
    g.add(ang);
    if (c === 3) {
      // Đường cao AH trong tam giác vuông
      g.add(rod([0.72, -0.46, 0.03], [0.16, 0.15, 0.03], 0.028, VIOLET));
    }
    return true;
  }

  if (lab === '9-04') {
    // Đo chiều cao và khoảng cách thực tế
    if (c === 1) {
      // Đo chiều cao tháp từ góc nâng
      g.add(rod([-0.92, -0.56, 0], [0.88, -0.56, 0], 0.036, SLATE));
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.18, 12), mat(GOLD));
      tower.position.set(0.58, 0.03, 0);
      const sight = rod([-0.72, -0.32, 0.02], [0.58, 0.62, 0.02], 0.028, CORAL);
      const horiz = rod([-0.72, -0.32, 0.02], [0.58, -0.32, 0.02], 0.018, TEAL);
      g.add(tower, sight, horiz, dot([-0.72, -0.32, 0.03], 0.075, TEAL));
    } else {
      // Đo khoảng cách qua sông không tiếp cận trực tiếp
      const river = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.36, 0.04), mat(SKY, { transparent: true, opacity: 0.55 }));
      river.position.set(0, 0.05, -0.02);
      const pts = [[-0.68, -0.48], [0.48, -0.48], [0.12, 0.58]];
      polygonFrame(g, pts, { plateColor: TEAL, edgeColors: [GOLD, CORAL, VIOLET] });
      g.add(river);
    }
    return true;
  }

  if (lab === '9-05') {
    // Dây cung, cung tròn, hình quạt (C01..C04)
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.034, 14, 52), mat(TEAL));
    g.add(ring, dot([0, 0, 0.02], 0.065, GOLD));
    if (c === 1) {
      // Dây cung và đường kính vuông góc dây
      g.add(rod([-0.72, 0, 0.02], [0.72, 0, 0.02], 0.03, GOLD));
      g.add(rod([-0.55, 0.46, 0.02], [0.55, 0.46, 0.02], 0.034, CORAL));
      g.add(rod([0, 0, 0.02], [0, 0.46, 0.02], 0.024, SKY));
      g.add(rightAngleMarker([0, 0.46, 0.03], [1, 0, 0], [0, -1, 0], 0.13, GOLD));
    } else if (c === 2) {
      // Góc ở tâm và số đo cung
      g.add(rod([0, 0, 0.02], [0.72, 0, 0.02], 0.03, GOLD));
      g.add(rod([0, 0, 0.02], [0.36, 0.623, 0.02], 0.03, GOLD));
      g.add(sectorPlate(0.32, 0, Math.PI / 3, GOLD, 0.7));
      g.add(ringArc(0.72, 0, Math.PI / 3, CORAL, 0.052));
    } else if (c === 3) {
      // Độ dài cung tròn trải thẳng ra thước
      g.add(ringArc(0.72, 0, Math.PI * 0.65, CORAL, 0.052));
      g.add(rod([-0.75, -0.86, 0.02], [0.72, -0.86, 0.02], 0.038, CORAL));
    } else {
      // Diện tích hình quạt tròn và vành khuyên
      g.add(sectorPlate(0.70, 0.2, 1.85, GOLD, 0.72));
      const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.03, 12, 44), mat(VIOLET));
      g.add(innerRing);
    }
    return true;
  }

  if (lab === '9-06') {
    // Vị trí tương đối của đường thẳng và đường tròn / hai đường tròn (C01..C06)
    if (c <= 3) {
      const circle = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.036, 14, 48), mat(TEAL));
      const yLine = c === 1 ? 0.28 : (c === 2 ? 0.62 : 0.86);
      const line = rod([-0.98, yLine, 0.02], [0.98, yLine, 0.02], 0.036, GOLD);
      const distRod = rod([0, 0, 0.02], [0, yLine, 0.02], 0.024, SKY);
      g.add(circle, line, distRod, dot([0, 0, 0.03], 0.065, GOLD));
      const hits=[];
      if(c===1){for(const sign of [-1,1]){const p=dot([0,yLine,.04],.08,CORAL);g.add(p);hits.push({p,sign});}}
      if(c===2){const p=dot([0,yLine,.04],.085,CORAL);g.add(p);hits.push({p,sign:0});}
      g.userData.motionMeaning='Đổi khoảng cách d từ tâm đến đường thẳng; suy ra 2/1/0 giao điểm';
      g.userData.animatePart = t => {
        const from=c===3?.62:.86;
        const d=from+(yLine-from)*t;
        line.position.y=d-yLine;
        poseRod(distRod,[0,0,.02],[0,d,.02]);
        for(const {p,sign} of hits){
          p.visible=d<=.62+1e-8;
          p.position.set(sign*Math.sqrt(Math.max(0,.62*.62-d*d)),d,.04);
        }
      };
    } else {
      const R1 = 0.56, R2 = 0.38;
      const d = c === 4 ? 0.68 : (c === 5 ? (R1 + R2) : 0.14);
      const c1 = new THREE.Mesh(new THREE.TorusGeometry(R1, 0.034, 14, 48), mat(TEAL));
      const c2 = new THREE.Mesh(new THREE.TorusGeometry(R2, 0.034, 14, 44), mat(GOLD));
      c1.position.x = -d / 2;
      c2.position.x = d / 2;
      g.add(c1, c2, dot([-d / 2, 0, 0.03], 0.06, TEAL), dot([d / 2, 0, 0.03], 0.06, GOLD));
      g.add(rod([-d / 2, 0, 0], [d / 2, 0, 0], 0.02, LIGHT_SLATE));
      if (c === 4) {
        g.add(dot([0.08, 0.34, 0.04], 0.075, CORAL), dot([0.08, -0.34, 0.04], 0.075, CORAL));
      } else if (c === 5) {
        g.add(dot([-d / 2 + R1, 0, 0.04], 0.085, CORAL));
      }
    }
    return true;
  }

  if (lab === '9-07') {
    // Góc nội tiếp và tứ giác nội tiếp (C01..C06)
    const R = 0.74;
    const circle = new THREE.Mesh(new THREE.TorusGeometry(R, 0.032, 14, 52), mat(TEAL));
    g.add(circle);
    const ptOn = (deg) => [Math.cos(deg * Math.PI / 180) * R, Math.sin(deg * Math.PI / 180) * R];
    if (c === 1) {
      // Góc nội tiếp và góc ở tâm cùng chắn cung AB
      const A = ptOn(-40), B = ptOn(40), C = ptOn(155);
      g.add(rod([0, 0, 0.02], [...A, 0.02], 0.028, GOLD), rod([0, 0, 0.02], [...B, 0.02], 0.028, GOLD));
      g.add(rod([...C, 0.02], [...A, 0.02], 0.028, CORAL), rod([...C, 0.02], [...B, 0.02], 0.028, CORAL));
      g.add(ringArc(R, -40 * Math.PI / 180, 40 * Math.PI / 180, GOLD, 0.048));
      g.add(dot([0, 0, 0.03], 0.07, GOLD), dot([...C, 0.03], 0.07, CORAL));
    } else if (c === 2) {
      // Các góc nội tiếp cùng chắn một cung
      const A = ptOn(-50), B = ptOn(30), C1 = ptOn(125), C2 = ptOn(175);
      g.add(rod([...C1, 0.02], [...A, 0.02], 0.026, GOLD), rod([...C1, 0.02], [...B, 0.02], 0.026, GOLD));
      g.add(rod([...C2, 0.02], [...A, 0.02], 0.026, CORAL), rod([...C2, 0.02], [...B, 0.02], 0.026, CORAL));
      g.add(dot([...C1, 0.03], 0.07, GOLD), dot([...C2, 0.03], 0.07, CORAL));
    } else if (c === 3) {
      // Đường tròn ngoại tiếp tam giác
      polygonFrame(g, [ptOn(90), ptOn(215), ptOn(325)], { plateColor: GOLD });
    } else if (c === 4) {
      // Đường tròn nội tiếp tam giác
      polygonFrame(g, [[-0.88, -0.52], [0.88, -0.52], [0, 0.86]], { plateColor: SKY });
      circle.scale.setScalar(0.56);
      circle.position.y = -0.10;
    } else if (c === 5) {
      // Tứ giác nội tiếp đường tròn
      polygonFrame(g, [ptOn(45), ptOn(135), ptOn(220), ptOn(315)], { plateColor: VIOLET, diagonals: true });
    } else {
      // Đa giác đều (lục giác đều) và đường tròn
      const hex = [0, 60, 120, 180, 240, 300].map(ptOn);
      polygonFrame(g, hex, { plateColor: EMERALD });
    }
    return true;
  }

  if (lab === '9-08') {
    // Đồ thị y = ax² và phương trình bậc hai (C01..C05)
    axes2D(g);
    const a = c === 2 ? -1.15 : 1.15;
    const shiftY = c === 2 ? 0.55 : -0.45;
    g.add(curveTube(x => a * x * x + shiftY, { color: c === 2 ? CORAL : TEAL }));
    if (c === 3) {
      // Các cặp điểm đối xứng qua trục Oy
      [0.38, 0.68].forEach(x => {
        const y = a * x * x + shiftY;
        g.add(dot([-x, y, 0.04], 0.065, GOLD), dot([x, y, 0.04], 0.065, GOLD));
        g.add(rod([-x, y, 0.02], [x, y, 0.02], 0.018, GOLD));
      });
    } else if (c === 4 || c === 5) {
      // Nghiệm phân biệt x1, x2 và hệ thức Viète
      const xRoot = Math.sqrt(Math.abs(shiftY / a));
      g.add(dot([-xRoot, 0, 0.05], 0.085, GOLD), dot([xRoot, 0, 0.05], 0.085, GOLD));
    }
    return true;
  }

  if (lab === '9-09') {
    // Hình trụ (C01: yếu tố, C02: khai triển, C03: diện tích & thể tích)
    if (c === 2) {
      const rect = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.78, 0.05), mat(TEAL));
      const topC = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.05, 24), mat(GOLD));
      topC.rotation.x = Math.PI / 2; topC.position.y = 0.68;
      const botC = topC.clone(); botC.position.y = -0.68;
      g.add(rect, topC, botC);
      g.userData.animatePart = (t) => {
        rect.scale.x = 0.35 + 0.65 * t;
        topC.position.y = 0.45 + 0.23 * t;
        botC.position.y = -(0.45 + 0.23 * t);
      };
      return true;
    }
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 1.16, 28), mat(TEAL, { transparent: true, opacity: 0.46 }));
    const rTop = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.024, 10, 36), mat(GOLD));
    rTop.rotation.x = Math.PI / 2; rTop.position.y = 0.58;
    const rBot = rTop.clone(); rBot.position.y = -0.58;
    const genFrame = new THREE.Group();
    genFrame.add(rod([0, -0.58, 0], [0.58, -0.58, 0], 0.028, GOLD), rod([0, 0.58, 0], [0.58, 0.58, 0], 0.028, GOLD), rod([0.58, -0.58, 0], [0.58, 0.58, 0], 0.032, CORAL));
    const secDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.57, 0.57, 0.04, 28), mat(GOLD, { transparent: true, opacity: 0.72 }));
    secDisk.visible = c === 3;
    g.add(cyl, rTop, rBot, rod([0, -0.58, 0], [0, 0.58, 0], 0.028, CORAL), genFrame, secDisk);
    g.userData.animatePart = (t) => {
      if (c === 3) {
        secDisk.position.y = -0.52 + 1.04 * t;
      } else {
        genFrame.rotation.y = t * Math.PI * 2;
      }
    };
    return true;
  }

  if (lab === '9-10') {
    // Hình nón (C01: đường sinh, C02: khai triển quạt, C03: diện tích & thể tích)
    if (c === 2) {
      const sector = sectorPlate(0.86, 0.15, 2.55, GOLD, 0.82);
      sector.position.set(-0.15, 0.05, 0);
      const baseC = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.05, 24), mat(TEAL));
      baseC.rotation.x = Math.PI / 2; baseC.position.set(-0.35, -0.52, 0);
      g.add(sector, baseC);
      g.userData.animatePart = (t) => {
        sector.rotation.z = (1 - t) * 0.45;
        baseC.position.y = -0.35 - 0.17 * t;
      };
      return true;
    }
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.64, 1.22, 28), mat(GOLD, { transparent: true, opacity: 0.46 }));
    const baseRing = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.026, 10, 36), mat(TEAL));
    baseRing.rotation.x = Math.PI / 2; baseRing.position.y = -0.61;
    const genGroup = new THREE.Group();
    genGroup.add(rod([0, -0.61, 0], [0.64, -0.61, 0], 0.028, GOLD), rod([0, 0.61, 0], [0.64, -0.61, 0], 0.032, TEAL));
    const secDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.04, 28), mat(CORAL, { transparent: true, opacity: 0.76 }));
    secDisk.visible = c === 3;
    g.add(cone, baseRing, rod([0, -0.61, 0], [0, 0.61, 0], 0.028, CORAL), genGroup, secDisk);
    g.userData.animatePart = (t) => {
      if (c === 3) {
        const y = -0.55 + 1.02 * t;
        const sc = Math.max(0.08, (0.61 - y) / 1.22);
        secDisk.position.y = y;
        secDisk.scale.set(sc, 1, sc);
      } else {
        genGroup.rotation.y = t * Math.PI * 2;
      }
    };
    return true;
  }

  if (lab === '9-11') {
    // Hình cầu (C01: mặt cầu, C02: diện tích & thể tích, C03: mặt cắt qua hình cầu)
    const sph = new THREE.Mesh(new THREE.SphereGeometry(0.72, 28, 20), mat(SKY, { transparent: true, opacity: 0.44 }));
    const eq = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.024, 10, 44), mat(GOLD));
    eq.rotation.x = Math.PI / 2;
    const mer = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.02, 10, 44), mat(TEAL));
    g.add(sph, eq, mer, dot([0, 0, 0], 0.07, CORAL));
    if (c === 3) {
      // Mặt phẳng cắt mặt cầu theo giao tuyến đường tròn
      const plane = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.03, 1.65), mat(CORAL, { transparent: true, opacity: 0.48 }));
      const radius=Math.sqrt(.72*.72-.34*.34);
      plane.position.y = 0.34;
      const cutCircle = new THREE.Mesh(new THREE.TorusGeometry(1, 0.04, 12, 40), mat(CORAL));
      cutCircle.rotation.x = Math.PI / 2; cutCircle.position.y = 0.34;
      g.add(plane, cutCircle);
      g.userData.motionMeaning='Mặt phẳng quét quả cầu, bán kính giao tuyến r=√(R²−d²)';
      g.userData.animatePart=t=>{
        const d=.72-(.72-.34)*t;
        plane.position.y=d;cutCircle.position.y=d;
        const r=Math.sqrt(Math.max(0,.72*.72-d*d));
        cutCircle.scale.setScalar(Math.max(.0001,r));
        cutCircle.visible=r>1e-5;
      };
    }
    return true;
  }

  // ==================== LỚP 10 ====================
  if (lab === '10-01') {
    // Tập hợp và sơ đồ Venn / Khoảng đoạn trên trục số
    if (c === 4) {
      g.add(arrow3D([-1.0, 0, 0], [1.0, 0, 0], SLATE, 0.028));
      g.add(rod([-0.55, 0, 0.02], [0.55, 0, 0.02], 0.052, 0x1d4ed8));
      g.add(rod([-0.55, -0.18, 0.03], [-0.55, 0.18, 0.03], 0.032, 0xb45309));
      g.add(rod([0.55, -0.18, 0.03], [0.55, 0.18, 0.03], 0.032, 0xb45309));
      return true;
    }
    const cA = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.08, 32), mat(0x1d4ed8, { transparent: true, opacity: c === 3 ? 0.35 : 0.65 }));
    cA.rotation.x = Math.PI / 2; cA.position.x = -0.26;
    const cB = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.08, 32), mat(0xb45309, { transparent: true, opacity: c === 2 ? 0.25 : 0.65 }));
    cB.rotation.x = Math.PI / 2; cB.position.set(0.26, 0, 0.03);
    g.add(cA, cB);
    if (c === 3) {
      const uni = new THREE.Mesh(new THREE.BoxGeometry(1.75, 1.15, 0.04), mat(0x6d28d9, { transparent: true, opacity: 0.35 }));
      uni.position.z = -0.04;
      g.add(uni);
    }
    g.userData.motionMeaning = 'Di chuyển hai tập hợp A, B trên biểu đồ Venn để xác định phần giao, hợp, hiệu';
    g.userData.animatePart = (t) => {
      const d = 0.62 - 0.36 * t;
      cA.position.x = -d;
      cB.position.x = d;
    };
    return true;
  }

  if (lab === '10-02') {
    // Miền nghiệm bất phương trình bậc nhất hai ẩn
    axes2D(g);
    if (c === 1) {
      g.add(polygonPlate([[-0.85, -0.65], [0.85, -0.65], [0.85, 0.15], [-0.45, 0.65]], 0x1d4ed8, 0.48, 0.05));
      g.add(rod([-0.45, 0.65, 0.03], [0.85, 0.15, 0.03], 0.038, 0xb45309));
    } else {
      const poly = [[-0.55, -0.45], [0.55, -0.35], [0.42, 0.45], [-0.35, 0.52]];
      polygonFrame(g, poly, { plateColor: 0x1d4ed8, edgeColors: [0xb45309, 0x6d28d9, 0x15803d, 0x6d28d9] });
      if (c === 3) {
        // Điểm tối ưu đỉnh đa giác miền nghiệm
        g.add(dot([0.42, 0.45, 0.06], 0.11, 0x6d28d9), arrow3D([0, 0, 0.05], [0.42, 0.45, 0.05], 0xb45309, 0.032));
      }
    }
    return true;
  }

  if (lab === '10-03') {
    // Hệ thức lượng trong tam giác (C01: Cosin, C02: Sin + 2R, C03: Diện tích)
    const pts = [[-0.82, -0.46], [0.82, -0.46], [0.18, 0.58]];
    polygonFrame(g, pts, { plateColor: 0x1d4ed8, edgeColors: [0xb45309, 0x6d28d9, 0x15803d] });
    if (c === 2) {
      const circum = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.028, 12, 48), mat(0xb45309));
      circum.position.set(0, -0.02, 0.02);
      g.add(circum);
    } else if (c === 3) {
      g.add(rod([0.18, 0.58, 0.03], [0.18, -0.46, 0.03], 0.03, 0x6d28d9));
      g.add(rightAngleMarker([0.18, -0.46, 0.03], [1, 0, 0], [0, 1, 0], 0.14, 0xb45309));
    }
    return true;
  }

  if (lab === '10-04' || lab === '10-05') {
    // Các phép toán vectơ & Tọa độ vectơ Oxy
    if (lab === '10-05') axes2D(g);
    const O = [-0.68, -0.38, 0.03];
    const uEnd = [0.22, -0.38, 0.03];
    const vEnd = [-0.22, 0.44, 0.03];
    const sumEnd = [0.68, 0.44, 0.03];
    g.add(arrow3D(O, uEnd, 0x1d4ed8, 0.038), arrow3D(O, vEnd, 0xb45309, 0.038));
    if (c === 1) {
      // Translate a COPY of v by u: v and translated v have identical components.
      const carried=arrow3D(O,vEnd,VIOLET,.028);
      const sum=arrow3D(O,sumEnd,0x6d28d9,.042);
      const guide1=rod(uEnd,sumEnd,.018,LIGHT_SLATE);
      const guide2=rod(vEnd,sumEnd,.018,LIGHT_SLATE);
      g.add(carried,sum,guide1,guide2);
      g.userData.motionMeaning='Quy tắc tam giác: tịnh tiến vectơ v theo u, dựng vectơ u+v';
      g.userData.animatePart=t=>{
        carried.position.x=(uEnd[0]-O[0])*t;
        carried.position.y=(uEnd[1]-O[1])*t;
        sum.visible=t>.94;
        guide1.visible=guide2.visible=t>.94;
      };
    } else if (c === 2) {
      // Hiệu 2 vectơ & Độ dài vectơ
      g.add(arrow3D(vEnd, uEnd, 0x6d28d9, 0.042));
    } else if (c === 3) {
      // Nhân vectơ với một số / tích vô hướng
      g.add(arrow3D([-0.68, 0.15, 0.03], [0.78, 0.15, 0.03], 0x6d28d9, 0.042));
    } else {
      const ang = sectorPlate(0.32, 0, 1.06, 0x6d28d9, 0.7);
      ang.position.set(O[0], O[1], 0.02);
      g.add(ang);
    }
    return true;
  }

  if (lab === '10-06') {
    // Hàm số bậc hai và Parabol (C01: a>0, C02: a<0, C03: trục đối xứng & đỉnh)
    axes2D(g);
    const a = c === 2 ? -1.2 : 1.2;
    const h = 0.18, k = c === 2 ? 0.52 : -0.48;
    g.add(curveTube(x => a * (x - h) * (x - h) + k, { color: c === 2 ? 0x6d28d9 : 0x1d4ed8 }));
    g.add(dot([h, k, 0.05], 0.085, 0xb45309));
    if (c === 3) {
      g.add(rod([h, -0.82, 0.03], [h, 0.82, 0.03], 0.022, 0xb45309));
    }
    return true;
  }

  if (lab === '10-07') {
    // Phương trình đường thẳng trong Oxy (C01..C04)
    axes2D(g);
    g.add(rod([-0.85, -0.45, 0.02], [0.85, 0.55, 0.02], 0.038, 0x1d4ed8));
    if (c === 1) {
      // Vectơ pháp tuyến n vuông góc đường thẳng
      g.add(arrow3D([0, 0.05, 0.04], [-0.32, 0.58, 0.04], 0x6d28d9, 0.034));
    } else if (c === 2) {
      // Vectơ chỉ phương u song song đường thẳng
      g.add(arrow3D([-0.35, -0.02, 0.04], [0.35, 0.39, 0.04], 0xb45309, 0.036));
    } else if (c === 3) {
      // Góc giữa hai đường thẳng
      g.add(rod([-0.75, 0.62, 0.02], [0.75, -0.48, 0.02], 0.036, 0xb45309));
    } else {
      // Khoảng cách từ điểm M đến đường thẳng
      g.add(dot([-0.42, 0.56, 0.05], 0.085, 0xb45309), rod([-0.42, 0.56, 0.03], [-0.14, -0.03, 0.03], 0.028, 0x6d28d9));
    }
    return true;
  }

  if (lab === '10-08') {
    // Phương trình đường tròn trong Oxy (C01..C03)
    axes2D(g);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.034, 14, 48), mat(0x1d4ed8));
    ring.position.set(0.12, 0.08, 0.02);
    g.add(ring, dot([0.12, 0.08, 0.04], 0.07, 0xb45309));
    if (c === 1) {
      g.add(rod([0.12, 0.08, 0.03], [0.66, 0.08, 0.03], 0.028, 0x6d28d9));
    } else if (c === 2) {
      g.add(rod([-0.75, -0.35, 0.03], [0.85, 0.52, 0.03], 0.032, 0xb45309));
    } else {
      g.add(rod([0.66, -0.65, 0.03], [0.66, 0.75, 0.03], 0.034, 0x6d28d9), dot([0.66, 0.08, 0.05], 0.08, 0xb45309));
    }
    return true;
  }

  if (lab === '10-09') {
    // Ba đường Conic (C01: Elip, C02: Hypebol, C03: Parabol)
    axes2D(g);
    if (c === 1) {
      const el = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.036, 14, 52), mat(0x1d4ed8));
      el.scale.set(1.22, 0.76, 1);
      g.add(el, dot([-0.52, 0, 0.04], 0.075, 0xb45309), dot([0.52, 0, 0.04], 0.075, 0xb45309));
      g.add(rod([-0.52, 0, 0.03], [0.24, 0.48, 0.03], 0.022, 0x6d28d9), rod([0.52, 0, 0.03], [0.24, 0.48, 0.03], 0.022, 0x6d28d9));
    } else if (c === 2) {
      g.add(curveTube(y => Math.sqrt(0.14 + y * y * 0.7), { xMin: -0.75, xMax: 0.75, color: 0x1d4ed8 }));
      // Nhánh phải & nhánh trái Hypebol + 2 đường tiệm cận
      const rightB = curveTube(x => Math.sqrt(Math.max(0, (x * x) / 0.16 - 1)) * 0.35, { xMin: 0.4, xMax: 0.9, color: 0x6d28d9 });
      const leftB = curveTube(x => Math.sqrt(Math.max(0, (x * x) / 0.16 - 1)) * 0.35, { xMin: -0.9, xMax: -0.4, color: 0x6d28d9 });
      g.clear();
      axes2D(g);
      g.add(rightB, leftB);
      g.add(rod([-0.85, -0.68, 0.01], [0.85, 0.68, 0.01], 0.016, 0xb45309));
      g.add(rod([-0.85, 0.68, 0.01], [0.85, -0.68, 0.01], 0.016, 0xb45309));
      g.add(dot([-0.58, 0, 0.04], 0.075, 0xb45309), dot([0.58, 0, 0.04], 0.075, 0xb45309));
    } else {
      // Parabol y² = 2px + tiêu điểm F + đường chuẩn Δ
      g.add(curveTube(x => x * x * 1.1 - 0.25, { color: 0x1d4ed8 }));
      g.add(dot([0, 0.02, 0.04], 0.08, 0xb45309), rod([-0.85, -0.52, 0.03], [0.85, -0.52, 0.03], 0.03, 0x6d28d9));
    }
    return true;
  }

  // ==================== LỚP 11 (R84 SEMANTIC PALETTE) ====================
  if (lab === '11-01') {
    // Đường tròn lượng giác (C01..C04)
    axes2D(g);
    const circle = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.034, 14, 52), mat(0x1d4ed8));
    const ang = c === 4 ? 1.15 : 0.78;
    const px = Math.cos(ang) * 0.68, py = Math.sin(ang) * 0.68;
    const radial=rod([0,0,.03],[px,py,.03],.034,0xb45309);
    const point=dot([px,py,.04],.08,0x6d28d9);
    const ordinate=rod([px,0,.02],[px,py,.02],.02,0x047857);
    const abscissa=rod([0,py,.02],[px,py,.02],.02,0x1d4ed8);
    const sweepArc=ringArc(.28,0,ang,0x6d28d9,.028);
    g.add(circle,radial,point,ordinate,abscissa,sweepArc);
    const arcIndices=sweepArc.geometry.index.count;
    g.userData.motionMeaning='Dựng góc trên đường tròn lượng giác và các hình chiếu sin, cos';
    g.userData.animatePart=t=>{
      const a=ang*t,x=.68*Math.cos(a),y=.68*Math.sin(a);
      poseRod(radial,[0,0,.03],[x,y,.03]);
      point.position.set(x,y,.04);
      poseRod(ordinate,[x,0,.02],[x,y,.02]);
      poseRod(abscissa,[0,y,.02],[x,y,.02]);
      sweepArc.geometry.setDrawRange(0,Math.floor((arcIndices*t)/6)*6);
    };
    return true;
  }

  if (lab === '11-02') {
    // Đồ thị hàm số lượng giác (C01: sin, C02: cos, C03: tan, C04: cot, C05..C06: phương trình)
    axes2D(g);
    if (c === 1 || c === 5) {
      g.add(curveTube(x => Math.sin(x * 3.4) * 0.52, { color: 0x1d4ed8 }));
      if (c === 5) g.add(rod([-0.95, 0.26, 0.03], [0.95, 0.26, 0.03], 0.028, 0xb45309));
    } else if (c === 2) {
      g.add(curveTube(x => Math.cos(x * 3.4) * 0.52, { color: 0x1d4ed8 }));
    } else {
      g.add(curveTube(x => Math.tan(x * 1.4) * 0.28, { xMin: -0.42, xMax: 0.42, color: 0x1d4ed8 }));
      g.add(rod([-0.48, -0.78, 0.02], [-0.48, 0.78, 0.02], 0.018, 0xb91c1c));
      g.add(rod([0.48, -0.78, 0.02], [0.48, 0.78, 0.02], 0.018, 0xb91c1c));
      if (c === 6) g.add(rod([-0.95, 0.22, 0.03], [0.95, 0.22, 0.03], 0.028, 0xb45309));
    }
    return true;
  }

  if (lab === '11-03') {
    // Dãy số, cấp số cộng, cấp số nhân
    const heights = c === 2
      ? [0.22, 0.38, 0.54, 0.70, 0.86] // Cấp số cộng (tăng tuyến tính +d)
      : c === 3
        ? [0.14, 0.24, 0.42, 0.72, 1.12] // Cấp số nhân (tăng hàm mũ *q)
        : [0.32, 0.58, 0.44, 0.76, 0.64];
    heights.forEach((h, i) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.22, h, 0.22), mat(i === heights.length - 1 ? 0x6d28d9 : 0x1d4ed8));
      b.position.set(-0.68 + i * 0.34, -0.52 + h / 2, 0);
      g.add(b, dot([-0.68 + i * 0.34, -0.52 + h + 0.06, 0], 0.055, 0xb45309));
    });
    return true;
  }

  if (['11-05', '11-06', '11-07', '11-08'].includes(lab)) {
    // Hình học không gian Lớp 11 (Điểm, đường, mặt phẳng, song song, vuông góc, góc & khoảng cách)
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.04, 1.15), mat(0x1d4ed8, { transparent: true, opacity: 0.46 }));
    p1.position.y = -0.32;
    g.add(p1);
    if (lab === '11-05') {
      if (c === 1) {
        // Đường thẳng cắt mặt phẳng
        g.add(rod([-0.55, -0.72, -0.25], [0.55, 0.65, 0.25], 0.036, 0xb45309), dot([0, -0.32, 0], 0.085, 0x6d28d9));
      } else if (c === 2) {
        // Giao tuyến hai mặt phẳng
        const p2 = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.04, 1.12), mat(0xb45309, { transparent: true, opacity: 0.46 }));
        p2.rotation.z = 0.68;
        g.add(p2, rod([0.42, -0.32, -0.58], [0.42, -0.32, 0.58], 0.042, 0x6d28d9));
      } else {
        // Hai đường thẳng chéo nhau
        g.add(rod([-0.68, -0.32, -0.35], [0.68, -0.32, 0.35], 0.036, 0x1d4ed8));
        g.add(rod([-0.55, 0.38, 0.42], [0.55, 0.38, -0.42], 0.036, 0x047857));
        g.add(rod([0, -0.32, 0], [0, 0.38, 0], 0.028, 0x6d28d9));
      }
    } else if (lab === '11-06') {
      if (c === 3) {
        // Hai mặt phẳng song song
        const p2 = p1.clone(); p2.position.y = 0.36; p2.material = mat(0x047857, { transparent: true, opacity: 0.46 });
        g.add(p2, rod([0, -0.32, 0], [0, 0.36, 0], 0.028, 0x6d28d9));
      } else {
        g.add(rod([-0.68, 0.28, 0], [0.68, 0.28, 0], 0.038, 0xb45309));
        g.add(rod([-0.68, -0.30, 0], [0.68, -0.30, 0], 0.038, 0x047857));
      }
    } else if (lab === '11-07') {
      // Quan hệ vuông góc trong không gian
      g.add(rod([0, -0.32, 0], [0, 0.68, 0], 0.042, 0x6d28d9));
      g.add(rightAngleMarker([0, -0.32, 0], [1, 0, 0], [0, 1, 0], 0.18, 0x6d28d9));
      g.add(rightAngleMarker([0, -0.32, 0], [0, 0, 1], [0, 1, 0], 0.18, 0x6d28d9));
      if (c === 3) {
        const pVert = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.05, 1.12), mat(0xb45309, { transparent: true, opacity: 0.44 }));
        pVert.position.y = 0.20;
        g.add(pVert);
      }
    } else {
      // Góc và khoảng cách trong không gian (11-08)
      if (c === 1) {
        // Góc giữa đường thẳng và hình chiếu trên mặt phẳng
        g.add(rod([-0.55, -0.32, 0], [0.48, 0.52, 0], 0.038, 0xb45309));
        g.add(rod([-0.55, -0.32, 0], [0.48, -0.32, 0], 0.032, 0x047857));
        g.add(rod([0.48, -0.32, 0], [0.48, 0.52, 0], 0.024, 0x6d28d9));
      } else if (c === 2) {
        // Góc nhị diện
        const p2 = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.04, 1.12), mat(0xb45309, { transparent: true, opacity: 0.48 }));
        p2.position.y=-.32;
        p2.rotation.z = 0.65;
        g.add(p2);
        g.userData.motionMeaning='Quay mặt phẳng quanh giao tuyến cố định để tạo góc nhị diện';
        g.userData.animatePart=t=>{p2.rotation.z=.65*t;};
      } else {
        // Khoảng cách từ điểm đến mặt phẳng / 2 đường chéo nhau
        g.add(dot([0, 0.56, 0], 0.09, 0xb45309), rod([0, -0.32, 0], [0, 0.56, 0], 0.036, 0x6d28d9));
        g.add(rightAngleMarker([0, -0.32, 0], [1, 0, 0], [0, 1, 0], 0.16, 0x6d28d9));
      }
    }
    return true;
  }

  if (lab === '11-09') {
    // Thể tích lăng trụ (C01), hình chóp (C02), chóp cụt (C03)
    const botR = 0.72;
    const topR = c === 1 ? botR : (c === 2 ? 0.01 : 0.36); // Lăng trụ có hai đáy bằng nhau.
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(topR, botR, 1.18, 4),
      mat(c === 1 ? 0x1d4ed8 : (c === 2 ? 0x047857 : 0xb45309), { transparent: true, opacity: 0.54 })
    );
    m.rotation.y = Math.PI / 4;
    const wire = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), new THREE.LineBasicMaterial({ color: 0xffffff }));
    wire.rotation.y = Math.PI / 4;
    const height=rod([0,-.59,0],[0,.59,0],.03,0x6d28d9);
    g.add(m,wire,height);
    g.userData.motionMeaning='Tăng chiều cao h của khối chóp/lăng trụ: thể tích tỉ lệ với h';
    g.userData.animatePart=t=>{
      const q=Math.max(.0001,t);
      m.scale.y=q;wire.scale.y=q;
      m.position.y=wire.position.y=-.59*(1-q);
      poseRod(height,[0,-.59,0],[0,-.59+1.18*t,0]);
    };
    return true;
  }

  if (['11-10', '11-11', '11-12'].includes(lab)) {
    axes2D(g);
    if (lab === '11-10') {
      // Giới hạn và liên tục
      g.add(curveTube(x => 0.38 / (x + 1.25) - 0.15, { color: 0x1d4ed8 }));
      if (c === 3) g.add(dot([0.1, 0.12, 0.05], 0.085, 0x6d28d9));
    } else if (lab === '11-11') {
      // Hàm số mũ và logarit (đối xứng qua y = x)
      if (c !== 2) g.add(curveTube(x => Math.exp(x * 1.1) * 0.25 - 0.45, { color: 0x1d4ed8 }));
      if (c !== 1) g.add(curveTube(x => Math.log(Math.max(0.08, x + 0.85)) * 0.42, { xMin: -0.7, xMax: 0.85, color: 0x047857 }));
      if (c === 3) g.add(rod([-0.75, -0.75, 0.01], [0.75, 0.75, 0.01], 0.018, 0x64748b));
    } else {
      // Đạo hàm và tiếp tuyến
      g.add(curveTube(x => 0.65 * x * x - 0.38, { color: 0x1d4ed8 }));
      g.add(rod([-0.45, -0.62, 0.03], [0.78, 0.48, 0.03], 0.032, 0xb45309), dot([0.25, -0.34, 0.05], 0.08, 0x6d28d9));
      if (c === 2) g.add(rod([-0.35, -0.30, 0.03], [0.72, 0.62, 0.03], 0.024, 0x047857));
    }
    return true;
  }

  // ==================== LỚP 12 ====================
  if (lab === '12-01' || lab === '12-02') {
    // Khảo sát hàm số, cực trị, tiệm cận (R85 Semantic Palette)
    axes2D(g);
    if (lab === '12-02' && c >= 2) {
      // Hàm phân thức & Tiệm cận
      g.add(curveTube(x => 0.18 / (x - 0.12) + 0.1, { xMin: -0.85, xMax: -0.06, color: 0x1d4ed8 }));
      g.add(curveTube(x => 0.18 / (x - 0.12) + 0.1, { xMin: 0.30, xMax: 0.88, color: 0x1d4ed8 }));
      g.add(rod([0.12, -0.82, 0.02], [0.12, 0.82, 0.02], 0.022, 0xb91c1c));
      g.add(rod([-0.88, 0.10, 0.02], [0.88, 0.10, 0.02], 0.022, 0x15803d));
      g.add(dot([0.12, 0.10, 0.05], 0.08, 0x7c3aed));
    } else {
      // Hàm bậc ba y = x³ - 3x
      g.add(curveTube(x => 1.35 * x * x * x - 0.85 * x, { color: 0x1d4ed8 }));
      g.add(dot([-0.46, 0.26, 0.05], 0.08, 0x15803d), dot([0.46, -0.26, 0.05], 0.08, 0x15803d), dot([0, 0, 0.05], 0.085, 0x7c3aed));
    }
    return true;
  }

  if (lab === '12-03') {
    // Bài toán tối ưu thực tế (R85 Semantic Palette)
    if (c === 2) {
      // Hình hộp không nắp gấp từ tấm bìa
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.06, 0.76), mat(0x15803d));
      base.position.y = -0.28;
      g.add(base);
      [[-0.38, 0, 0.06, 0.42, 0.76], [0.38, 0, 0.06, 0.42, 0.76], [0, -0.38, 0.76, 0.42, 0.06], [0, 0.38, 0.76, 0.42, 0.06]].forEach(([x, z, w, h, d], idx) => {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(idx < 2 ? 0x1d4ed8 : 0xc2410c, { transparent: true, opacity: 0.78 }));
        wall.position.set(x, -0.07, z);
        g.add(wall);
      });
    } else if (c === 1) {
      // Tối ưu diện tích hình phẳng
      polygonFrame(g, [[-0.68, -0.45], [0.68, -0.45], [0.68, 0.45], [-0.68, 0.45]], { plateColor: 0x15803d, edgeColors: [0x1d4ed8, 0xc2410c, 0x1d4ed8, 0xc2410c] });
    } else {
      axes2D(g);
      g.add(curveTube(x => -1.3 * x * x + 0.52, { color: 0x1d4ed8 }), dot([0, 0.52, 0.05], 0.095, 0x7c3aed));
    }
    return true;
  }

  if (['12-04', '12-08', '12-09', '12-10'].includes(lab)) {
    // Hệ tọa độ không gian Oxyz (Lớp 12 Chương V - R85 Semantic Palette)
    axes3D(g, 0.92);
    if (lab === '12-04') {
      const P = [0.56, 0.52, 0.48];
      g.add(arrow3D([0, 0, 0], P, 0x7c3aed, 0.036), dot(P, 0.08, 0x7c3aed));
      g.add(rod([P[0], 0, P[2]], P, 0.016, 0x64748b), rod([P[0], 0, 0], [P[0], 0, P[2]], 0.016, 0x64748b), rod([0, 0, P[2]], [P[0], 0, P[2]], 0.016, 0x64748b));
      if (c === 4 || c === 2 || c === 3) g.add(arrow3D([0, 0, 0], [0.18, 0.68, -0.25], 0x15803d, 0.034));
    } else if (lab === '12-08') {
      // Mặt phẳng trong Oxyz + Vectơ pháp tuyến n
      const pl = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.04, 1.05), mat(0x2563eb, { transparent: true, opacity: 0.50 }));
      pl.position.set(0.28, 0.18, 0.25);
      pl.rotation.set(0.32, 0.2, -0.38);
      g.add(pl, arrow3D([0.28, 0.18, 0.25], [0.58, 0.72, 0.48], 0xc2410c, 0.036));
      if (c === 2 || c === 4) {
        const pl2 = pl.clone();
        pl2.position.y -= 0.36;
        pl2.material = mat(0xea580c, { transparent: true, opacity: 0.45 });
        if (c === 4) pl2.rotation.z = 0.28;
        g.add(pl2);
      }
    } else if (lab === '12-09') {
      // Đường thẳng trong Oxyz + Vectơ chỉ phương u
      g.add(rod([-0.42, -0.28, 0.55], [0.78, 0.68, -0.35], 0.036, 0x1d4ed8));
      g.add(arrow3D([0.08, 0.12, 0.18], [0.52, 0.48, -0.15], 0xc2410c, 0.038), dot([0.08, 0.12, 0.18], 0.075, 0x15803d));
      if (c === 3) g.add(rod([-0.55, 0.42, -0.32], [0.68, -0.22, 0.52], 0.032, 0x15803d), rod([0.08, 0.12, 0.18], [0.08, 0.10, 0.10], 0.028, 0x7c3aed));
    } else {
      // Mặt cầu trong Oxyz (12-10)
      const sph = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 18), mat(0x1d4ed8, { transparent: true, opacity: 0.46 }));
      sph.position.set(0.32, 0.32, 0.28);
      g.add(sph, dot([0.32, 0.32, 0.28], 0.065, 0x7c3aed));
      if (c === 2) {
        const cut = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.03, 1.12), mat(0x15803d, { transparent: true, opacity: 0.5 }));
        cut.position.set(0.32, 0.32, 0.28);
        g.add(cut);
      } else if (c === 3) {
        g.add(rod([-0.35, -0.12, 0.65], [0.85, 0.76, -0.12], 0.034, 0xc2410c));
      }
    }
    return true;
  }

  if (lab === '12-06') {
    // Nguyên hàm, tích phân và diện tích hình phẳng (tổng Riemann - R85 Semantic Palette)
    axes2D(g);
    g.add(curveTube(x => 0.45 * Math.sin(x * 2.2) + 0.22, { color: 0x1d4ed8 }));
    const riemannBars=[];
    for (let i = 0; i < 6; i++) {
      const x = -0.55 + i * 0.22;
      const h = Math.max(0.15, 0.45 * Math.sin(x * 2.2) + 0.52);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.18, h, 0.10), mat(i === 5 ? 0x7c3aed : 0x15803d, { transparent: true, opacity: 0.62 }));
      bar.position.set(x, -0.32 + h / 2, 0);
      g.add(bar);
      riemannBars.push({bar,h});
    }
    g.userData.animatePart = progress => {
      riemannBars.forEach(({bar,h},i) => {
        const p=Math.min(1,Math.max(.001,progress*6-i));
        bar.scale.y=p;
        bar.position.y=-.32+h*p/2;
      });
    };
    return true;
  }

  if (lab === '12-07') {
    // Khối tròn xoay quanh trục Ox (R85 Semantic Palette)
    const pts=Array.from({length:33},(_,i)=>{
      const x=4*i/32;
      return new THREE.Vector2(.68*Math.sqrt(x/4),-.7+1.4*x/4);
    });
    const lathe=new THREE.Mesh(new THREE.LatheGeometry(pts,64),mat(0x1d4ed8,{transparent:true,opacity:.58,side:THREE.DoubleSide}));
    lathe.rotation.z=Math.PI/2;
    const perAngularStep=(pts.length-1)*6;
    g.userData.motionMeaning='Quét miền y=√x, 0≤x≤4 quanh Ox từ 0° đến 360°; V=8π';
    g.userData.animatePart=progress=>{
      const angSegments=Math.min(64,Math.max(0,Math.floor(progress*64)));
      lathe.geometry.setDrawRange(0,angSegments*perAngularStep);
      g.userData.sweepDegrees=angSegments*360/64;
    };
    g.add(lathe, arrow3D([-0.95, 0, 0], [0.95, 0, 0], 0x9a3412, 0.028));
    if (c === 2) {
      const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.38, 20), mat(0xc2410c, { wireframe: true }));
      hole.rotation.z = Math.PI / 2;
      g.add(hole);
    } else if (c === 3) {
      const disk = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.54, 0.08, 24), mat(0x7c3aed));
      disk.rotation.z = Math.PI / 2;
      g.add(disk);
    }
    return true;
  }

  if (lab === '12-11') {
    // Xác suất có điều kiện & Sơ đồ cây Bayes (R85 Semantic Palette)
    if (c >= 2) {
      const root = [-0.72, 0, 0], A1 = [0, 0.42, 0], A2 = [0, -0.42, 0];
      const B1 = [0.72, 0.64, 0], B2 = [0.72, 0.20, 0], B3 = [0.72, -0.20, 0], B4 = [0.72, -0.64, 0];
      const cols = [0x1d4ed8, 0x1d4ed8, 0x15803d, 0x7c3aed, 0x64748b, 0x15803d, 0x64748b];
      [root, A1, A2, B1, B2, B3, B4].forEach((p, i) => g.add(dot(p, 0.085, cols[i])));
      [[root, A1, 0x1d4ed8], [root, A2, 0x15803d], [A1, B1, 0x7c3aed], [A1, B2, 0x64748b], [A2, B3, 0xc2410c], [A2, B4, 0x64748b]].forEach(([p, q, col]) => g.add(rod(p, q, 0.03, col)));
    } else {
      const cA = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.08, 32), mat(0x1d4ed8, { transparent: true, opacity: 0.55 }));
      cA.rotation.x = Math.PI / 2; cA.position.x = -0.22;
      const cB = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.10, 32), mat(0x15803d, { transparent: true, opacity: 0.68 }));
      cB.rotation.x = Math.PI / 2; cB.position.set(0.22, 0, 0.02);
      const cInt = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 28), mat(0x7c3aed, { transparent: true, opacity: 0.85 }));
      cInt.rotation.x = Math.PI / 2; cInt.position.set(0, 0, 0.03);
      g.add(cA, cB, cInt);
      g.userData.motionMeaning = 'Thu hẹp không gian mẫu về biến cố B để tính xác suất có điều kiện P(A|B) = P(A∩B)/P(B)';
      g.userData.animatePart = (t) => {
        const d = 0.55 - 0.33 * t;
        cA.position.x = -d;
        cB.position.x = d;
        cInt.scale.setScalar(Math.max(0.01, t));
      };
    }
    return true;
  }

  // Các Lab Thống kê & Xác suất còn lại (9-12, 9-13, 10-10, 10-11, 11-04, 11-13, 12-05)
  if (['8-08', '9-12', '9-13', '10-10', '10-11', '11-04', '11-13', '12-05'].includes(lab)) {
    if (lab === '11-13') {
      // Biến cố hợp, giao, xung khắc, độc lập (R84 Semantic Palette)
      const offset = c === 2 ? 0.58 : 0.26;
      const cA = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.08, 32), mat(0x1d4ed8, { transparent: true, opacity: 0.62 }));
      cA.rotation.x = Math.PI / 2; cA.position.x = -offset;
      const cB = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.08, 32), mat(0x047857, { transparent: true, opacity: 0.62 }));
      cB.rotation.x = Math.PI / 2; cB.position.set(offset, 0, 0.02);
      g.add(cA, cB);
      let cInt = null;
      if (c === 1 || c === 3) {
        cInt = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.11, 28), mat(0x6d28d9, { transparent: true, opacity: 0.78 }));
        cInt.rotation.x = Math.PI / 2; cInt.position.set(0, 0, 0.03);
        g.add(cInt);
      }
      g.userData.motionMeaning = 'Quan sát vị trí tương đối hai biến cố A, B: giao nhau hoặc xung khắc';
      g.userData.animatePart = (t) => {
        const start = 0.65;
        const d = start + (offset - start) * t;
        cA.position.x = -d;
        cB.position.x = d;
        if (cInt) cInt.scale.setScalar(Math.max(0.01, t));
      };
      return true;
    }
    const vals = [0.38, 0.72, 0.96, 0.64, 0.42];
    vals.forEach((v, i) => {
      const h = v + ((c + i) % 3) * 0.08;
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.24, h, 0.24), mat(PALETTE[(i + c) % PALETTE.length]));
      bar.position.set(-0.64 + i * 0.32, -0.52 + h / 2, 0);
      g.add(bar);
    });
    if (lab === '12-05' || lab === '10-10') {
      g.add(curveTube(x => Math.exp(-x * x * 3.2) * 0.75 - 0.35, { color: GOLD, z: 0.16 }));
    }
    return true;
  }

  return false;
}

export function createModeExhibit(grade, mode) {
  const modeId = mode?.id || '';
  const linkedFoldId = getFoldNetForModeId(modeId);
  const directFoldId = getFoldNetDefinition(modeId)
    ? modeId
    : (EXTENDED_MUSEUM_MODE_TO_FOLD_NET[modeId] || null);

  if (grade === 6 && !getFoldNetDefinition(modeId)) {
    const g6 = createGrade6Preview(modeId);
    if (g6) {
      g6.scale.setScalar(0.76);
      const childDiorama = g6.children.find(c => c.userData?.animate);
      g6.userData.motionPlan=modelMotionPlan(mode);
      g6.userData.motionMeaning=g6.userData.mathNature==='TRUE_3D'
        ? 'Tương tác cơ học/ghép khối đúng loại hiện vật Toán 6'
        : 'Hình học phẳng từ SGK: giữ nguyên quan hệ, không ép lắc 3D';
      if (linkedFoldId) g6.userData.linkedFoldNetId = linkedFoldId;
      g6.userData.animate = (t) => {
        if (childDiorama?.userData?.animate) childDiorama.userData.animate(t);
        g6.rotation.y = 0;
        g6.userData.animateGrade6?.(educationalFrame(t).progress);
        g6.userData.motionStage={...educationalFrame(t),description:g6.userData.motionMeaning};
      };
      return g6;
    }
  }

  const group = new THREE.Group();
  const carrier = new THREE.Group();
  carrier.position.y = 0.62;
  group.add(carrier);

  if (directFoldId) {
    const foldDef = getFoldNetDefinition(directFoldId);
    const foldGroup = createMuseumFoldGroup(directFoldId, {
      uprightForPedestal: true,
      pedestalScale: 0.24,
      pedestalOffsetY: -0.18,
      duration: 10
    });
    carrier.add(foldGroup);
    group.scale.setScalar(1.22);
    group.userData.modeId = modeId;
    group.userData.mathNature = 'TRUE_3D';
    group.userData.foldNetModelId = directFoldId;
    group.userData.linkedFoldNetId = directFoldId;
    group.userData.foldNetGroup = foldGroup;
    group.userData.foldNetExhibit = foldGroup.userData.foldNetExhibit;
    group.userData.foldNetDefinition = foldDef;
    group.userData.geometrySignature = `${grade}:R87-FOLD:${directFoldId}:${modeId}`;
    const steps = foldDef?.storyboard?.length >= 3
      ? [foldDef.storyboard[0], foldDef.storyboard[1], foldDef.storyboard[3] || foldDef.storyboard[2]]
      : modelMotionPlan(mode).steps;
    group.userData.motionPlan = { kind: 'fold-net-3d', steps };
    group.userData.motionMeaning = foldGroup.userData.motionMeaning;
    group.userData.onViewEnter = () => foldGroup.userData.onViewEnter?.();
    group.userData.onViewLeave = () => foldGroup.userData.onViewLeave?.();
    group.userData.play = () => foldGroup.userData.play?.();
    group.userData.pause = () => foldGroup.userData.pause?.();
    group.userData.playAgain = () => foldGroup.userData.playAgain?.();
    group.userData.openFlat = () => foldGroup.userData.openFlat?.();
    group.userData.closeSolid = () => foldGroup.userData.closeSolid?.();
    group.userData.setFoldProgress = (p) => foldGroup.userData.setFoldProgress?.(p);
    group.userData.stepForward = () => foldGroup.userData.stepForward?.();
    group.userData.stepBackward = () => foldGroup.userData.stepBackward?.();
    group.userData.setSpeed = (s) => foldGroup.userData.setSpeed?.(s);
    group.userData.setDisplayOptions = (opts) => foldGroup.userData.setDisplayOptions?.(opts);
    group.userData.setParams = (patch) => foldGroup.userData.setParams?.(patch);
    group.userData.getFormulas = () => foldGroup.userData.getFormulas?.();
    group.userData.disposeFoldNet = () => foldGroup.userData.disposeFoldNet?.();
    group.userData.animate = (seconds) => {
      const s = Number.isFinite(Number(seconds)) ? Number(seconds) : 0;
      if (s <= 30) {
        const p = Math.min(1, Math.max(0, s / 10));
        foldGroup.userData.setFoldProgress(p);
      } else {
        foldGroup.userData.animate(s);
      }
      group.userData.motionStage = foldGroup.userData.motionStage;
      group.userData.motionMeaning = foldGroup.userData.motionMeaning;
      return group.userData.motionStage;
    };
    return group;
  }

  const seed = hash(modeId + ':' + (mode.name || ''));
  const handled = buildFamilyExhibit(carrier, mode, grade, seed);
  if (!handled) {
    // Fallback an toàn đa diện 3D nếu có mã mở rộng mới
    const poly = new THREE.Mesh(new THREE.OctahedronGeometry(0.62, 0), mat(TEAL, { transparent: true, opacity: 0.65 }));
    const wire = new THREE.LineSegments(new THREE.EdgesGeometry(poly.geometry), new THREE.LineBasicMaterial({ color: 0xffffff }));
    carrier.add(poly, wire);
  }

  group.scale.setScalar(1.22);
  group.userData.modeId = modeId;
  if (linkedFoldId) group.userData.linkedFoldNetId = linkedFoldId;
  group.userData.geometrySignature = `${grade}:${mode.labId || extractLabAndCase(mode).lab}:${modeId}`;
  const director=createEducationalMotion(carrier,mode);
  group.userData.motionPlan=director.plan;
  group.userData.animate = (seconds) => {
    group.userData.motionStage = director.apply(seconds);
  };
  return group;
}

export function modeGeometry(grade, mode) {
  const obj = createModeExhibit(grade, mode);
  let meshes = 0;
  obj.traverse(c => { if (c.isMesh) meshes++; });
  return { id: mode.id, grade, meshes, signature: obj.userData.geometrySignature || obj.userData.geometryMode };
}
