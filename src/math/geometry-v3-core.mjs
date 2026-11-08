/**
 * MATHVERSE V3 - Core Computational Geometry Engine (geometry-v3-core.mjs)
 * Standalone pure math reference functions for the 42 curriculum configurations.
 * No external runtime dependencies, no WebGL requirement, no eval.
 * Implements mathematical corrigenda E01 - E14.
 */

export const TWO_PI = Math.PI * 2;
export const tolerance = 1e-9;

export const finite = (v, name = 'value') => {
  if (!Number.isFinite(v)) throw new RangeError(`${name} must be finite`);
  return v;
};

export const positive = (v, name = 'value') => {
  finite(v, name);
  if (v <= 0) throw new RangeError(`${name} must be positive`);
  return v;
};

export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

export const validVec = (x, name = 'vector') => {
  if (!Array.isArray(x) || x.length !== 3 || x.some(v => !Number.isFinite(v))) {
    throw new RangeError(`${name}: finite length-3 vector required`);
  }
  return x;
};

export const add = (a, b) => a.map((v, i) => v + b[i]);
export const sub = (a, b) => a.map((v, i) => v - b[i]);
export const mul = (a, k) => a.map(v => v * k);
export const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
export const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];
export const norm = a => Math.hypot(...a);
export const xyzDistance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

export const unit = x => {
  const n = norm(x);
  if (n <= 1e-12) throw new RangeError('zero-length vector');
  return mul(x, 1 / n);
};

/** Coordinate transform: right-handed Z-up math -> Three.js Y-up rendering */
export const toThreeYUp = ([x, y, z]) => [x, z, -y];
export const toMathZUp = ([x, y, z]) => [x, -z, y];

/** E02: Regular Triangular Pyramid (Chóp tam giác đều) metrics and outward unfold */
export function triangularPyramidMetrics(a, h) {
  positive(a, 'a');
  positive(h, 'h');
  const r = a / (2 * Math.sqrt(3)); // inradius of base
  const R = a / Math.sqrt(3);       // circumradius of base
  const lateralAltitude = Math.hypot(h, r); // trung đoạn d
  const baseArea = Math.sqrt(3) * a * a / 4;
  const sideEdge = Math.hypot(h, R);
  const baseFaceAngle = Math.atan2(h, r);
  const outwardUnfoldAngle = Math.PI - baseFaceAngle; // Delta = pi - beta
  return {
    a, h,
    inradius: r,
    circumradius: R,
    baseArea,
    lateralAltitude,
    sideEdge,
    lateralArea: 3 * a * lateralAltitude / 2,
    totalArea: baseArea + 3 * a * lateralAltitude / 2,
    volume: baseArea * h / 3,
    baseFaceAngle,
    outwardUnfoldAngle
  };
}

export function triangularPyramidOutwardHingeRotation(a, h, unfoldFraction) {
  positive(a, 'a');
  positive(h, 'h');
  if (!Number.isFinite(unfoldFraction) || unfoldFraction < 0 || unfoldFraction > 1) {
    throw new RangeError('unfoldFraction must be in [0, 1]');
  }
  const baseFaceAngle = Math.atan2(2 * Math.sqrt(3) * h, a);
  const outwardRotation = Math.PI - baseFaceAngle;
  return {
    baseFaceAngle,
    outwardRotation,
    applied: unfoldFraction * outwardRotation
  };
}

/** Returns the 4 face triangles with Y vertical, 0=folded, 1=flat */
export function regularTriPyramidFaces(a, h, t) {
  const m = triangularPyramidMetrics(a, h);
  finite(t, 't');
  if (t < 0 || t > 1) throw new RangeError('t out of range [0, 1]');
  const R = m.circumradius, r = m.inradius;
  const A = [0, 0, R], B = [-a / 2, 0, -r], C = [a / 2, 0, -r];
  const theta = m.outwardUnfoldAngle * (1 - t);
  const top = (P, Q) => {
    const mx = (P[0] + Q[0]) / 2, mz = (P[2] + Q[2]) / 2;
    const n = Math.hypot(mx, mz);
    const ux = mx / n, uz = mz / n;
    return [
      mx + ux * m.lateralAltitude * Math.cos(theta),
      m.lateralAltitude * Math.sin(theta),
      mz + uz * m.lateralAltitude * Math.cos(theta)
    ];
  };
  const sides = [[A, B], [B, C], [C, A]].map(([P, Q]) => [P, Q, top(P, Q)]);
  const required = m.sideEdge;
  for (const [P, Q, S] of sides) {
    if (Math.abs(xyzDistance(P, Q) - a) > 1e-9 ||
        Math.abs(xyzDistance(S, P) - required) > 1e-9 ||
        Math.abs(xyzDistance(S, Q) - required) > 1e-9) {
      throw new Error('rigidity preservation failed');
    }
  }
  return { base: [A, B, C], sides, foldProgress: t, metrics: m };
}

/** E04 & E05: Solid of revolution with washer method */
export function volumeBetweenCurves(f, g, a, b, steps = 2048) {
  if (typeof f !== 'function' || typeof g !== 'function') {
    throw new TypeError('f and g must be functions');
  }
  finite(a, 'a');
  finite(b, 'b');
  if (!(a < b)) throw new RangeError('require a < b');
  if (!Number.isInteger(steps) || steps < 2 || steps > 32768 || steps % 2 !== 0) {
    throw new RangeError('steps must be even integer in [2, 32768]');
  }
  const h = (b - a) / steps;
  let sum = 0;
  for (let i = 0; i <= steps; i++) {
    const x = a + i * h;
    const f0 = finite(f(x), 'f(x)');
    const g0 = finite(g(x), 'g(x)');
    const R = Math.max(Math.abs(f0), Math.abs(g0));
    // If the interval between f and g crosses the Ox axis (i.e. contains 0), inner radius r = 0
    const r = ((f0 <= 0 && g0 >= 0) || (f0 >= 0 && g0 <= 0)) ? 0 : Math.min(Math.abs(f0), Math.abs(g0));
    const v = Math.PI * (R * R - r * r);
    sum += (i === 0 || i === steps ? 1 : (i % 2 ? 4 : 2)) * v;
  }
  return h * sum / 3;
}

export function solidVolumeOfProfile(f, a, b, steps = 2048) {
  return volumeBetweenCurves(f, () => 0, a, b, steps);
}

export function wedgeVolume(fullVolume, degrees) {
  finite(fullVolume, 'fullVolume');
  finite(degrees, 'degrees');
  if (degrees < 0 || degrees > 360) throw new RangeError('degrees must be in [0, 360]');
  return fullVolume * degrees / 360;
}

/** E05: Generates vertices and triangles for revolution geometry around Ox */
export function revolutionGeometry(f, a, b, degrees = 360, nx = 30, nphi = 48) {
  if (typeof f !== 'function') throw new TypeError('f must be a function');
  finite(a, 'a');
  finite(b, 'b');
  finite(degrees, 'degrees');
  if (!(a < b) || degrees < 0 || degrees > 360 ||
      !Number.isInteger(nx) || nx < 2 || nx > 512 ||
      !Number.isInteger(nphi) || nphi < 3 || nphi > 512) {
    throw new RangeError('invalid bounds/resolution');
  }
  const V = [], F = [];
  const alpha = degrees * Math.PI / 180;
  const ix = (i, j) => i * (nphi + 1) + j;
  for (let i = 0; i <= nx; i++) {
    const x = a + (b - a) * i / nx;
    const r = finite(f(x), 'f(x)');
    if (r < 0) throw new RangeError('profile must be nonnegative');
    for (let j = 0; j <= nphi; j++) {
      const ang = alpha * j / nphi;
      V.push([x, r * Math.cos(ang), r * Math.sin(ang)]);
    }
  }
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < nphi; j++) {
      const q0 = ix(i, j), q1 = ix(i + 1, j), q2 = ix(i + 1, j + 1), q3 = ix(i, j + 1);
      F.push([q0, q1, q2], [q0, q2, q3]);
    }
  }
  // Cap the ends x=a, b with radial fan
  for (const i of [0, nx]) {
    const center = V.length;
    V.push([a + (b - a) * i / nx, 0, 0]);
    for (let j = 0; j < nphi; j++) {
      if (i === 0) F.push([center, ix(i, j + 1), ix(i, j)]);
      else F.push([center, ix(i, j), ix(i, j + 1)]);
    }
  }
  // Radial curtain planes closing the angular cut
  if (degrees > 0 && degrees < 360) {
    for (const j of [0, nphi]) {
      for (let i = 0; i < nx; i++) {
        const A = V.length; V.push([a + (b - a) * i / nx, 0, 0]);
        const B = V.length; V.push([a + (b - a) * (i + 1) / nx, 0, 0]);
        const C = ix(i + 1, j), D = ix(i, j);
        if (j === 0) F.push([A, B, C], [A, C, D]);
        else F.push([A, C, B], [A, D, C]);
      }
    }
  }
  return { vertices: V, triangles: F, angleRad: alpha, segmentCountX: nx, segmentCountAngle: nphi };
}

/** E06: Exact unit cubes face-paint counting (Toán 5) */
export function paintedUnitCubes(nx, ny, nz) {
  for (const [k, v] of Object.entries({ nx, ny, nz })) {
    if (!Number.isInteger(v) || v < 1 || v > 60) throw new RangeError(`${k} must be integer in [1, 60]`);
  }
  const counts = { zero: 0, one: 0, two: 0, threeOrMore: 0 };
  const key = { 0: 'zero', 1: 'one', 2: 'two' };
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < ny; j++) {
      for (let k = 0; k < nz; k++) {
        const faces = (i === 0) + (i === nx - 1) + (j === 0) + (j === ny - 1) + (k === 0) + (k === nz - 1);
        counts[key[faces] || 'threeOrMore']++;
      }
    }
  }
  return counts;
}

export function paintedCubeFaceDistribution(nx, ny, nz) {
  for (const n of [nx, ny, nz]) {
    if (!Number.isInteger(n) || n < 1 || n > 60) throw new RangeError('grid dimensions must be integers in [1, 60]');
  }
  const histogram = Array(7).fill(0);
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < ny; j++) {
      for (let k = 0; k < nz; k++) {
        const exposed = (i === 0) + (i === nx - 1) + (j === 0) + (j === ny - 1) + (k === 0) + (k === nz - 1);
        histogram[exposed]++;
      }
    }
  }
  return { dimensions: [nx, ny, nz], total: nx * ny * nz, exactExposedFaces: histogram };
}

/** E08: Plane n dot (X - M) = 0 through 3 points */
export function planeThrough3(M, N, P) {
  validVec(M, 'M'); validVec(N, 'N'); validVec(P, 'P');
  const n = cross(sub(N, M), sub(P, M));
  const length = norm(n);
  if (length <= 1e-10) throw new RangeError('M, N, P collinear or duplicate');
  const normal = mul(n, 1 / length);
  return { normal, offset: -dot(normal, M), rawNormal: n };
}

/** E08: Convex polyhedron section with plane MNP */
export function convexSection(vertices, edges, M, N, P, eps = 1e-9) {
  if (!Array.isArray(vertices) || !Array.isArray(edges) || vertices.length < 4 || edges.length < 6) {
    throw new TypeError('invalid convex mesh');
  }
  for (const v of vertices) validVec(v, 'vertex');
  const plane = planeThrough3(M, N, P);
  const n = plane.normal;
  const sd = v => dot(n, v) + plane.offset;
  const xs = [];
  const insert = p => {
    if (!xs.some(q => norm(sub(q, p)) < eps * 10)) xs.push(p);
  };
  for (const [i, j] of edges) {
    if (!Number.isInteger(i) || !Number.isInteger(j) || i < 0 || j < 0 || i >= vertices.length || j >= vertices.length) {
      throw new RangeError('bad edge index');
    }
    const A = vertices[i], B = vertices[j], a = sd(A), b = sd(B);
    if (Math.abs(a) <= eps) insert([...A]);
    if (Math.abs(b) <= eps) insert([...B]);
    if (a * b < -(eps * eps)) insert(add(A, mul(sub(B, A), a / (a - b))));
  }
  if (xs.length < 3) {
    return { vertices: xs, area: 0, classification: 'degenerate-or-empty', plane };
  }
  const centroid = mul(xs.reduce((s, v) => add(s, v), [0, 0, 0]), 1 / xs.length);
  const U = unit(sub(xs[0], centroid));
  const V = cross(n, U);
  xs.sort((a, b) =>
    Math.atan2(dot(sub(a, centroid), V), dot(sub(a, centroid), U)) -
    Math.atan2(dot(sub(b, centroid), V), dot(sub(b, centroid), U))
  );
  let signed2Area = 0;
  for (let k = 0; k < xs.length; k++) {
    const a = sub(xs[k], centroid);
    const b = sub(xs[(k + 1) % xs.length], centroid);
    signed2Area += dot(n, cross(a, b));
  }
  const area = Math.abs(signed2Area) * 0.5;
  return {
    vertices: xs,
    area,
    classification: area <= eps ? 'degenerate' : `${xs.length}-gon`,
    plane,
    centroid
  };
}

/** E10: Feet of shortest segment between two infinite lines */
export function closestPointsBetweenLines(P, u, Q, v) {
  [P, u, Q, v].forEach((x, i) => validVec(x, `vector${i}`));
  const a = dot(u, u), b = dot(u, v), c = dot(v, v);
  if (a < 1e-18 || c < 1e-18) throw new RangeError('zero direction vector');
  const w = sub(P, Q), d = dot(u, w), e = dot(v, w);
  const D = a * c - b * b;
  if (D <= 1e-12 * a * c) {
    const distance = norm(cross(w, u)) / Math.sqrt(a);
    const footP = [...P];
    const t = dot(sub(P, Q), v) / c;
    const footQ = add(Q, mul(v, t));
    return { kind: distance <= 1e-9 ? 'coincident' : 'parallel', distance, footP, footQ };
  }
  const t = (b * e - c * d) / D;
  const s = (a * e - b * d) / D;
  const footP = add(P, mul(u, t));
  const footQ = add(Q, mul(v, s));
  const distance = norm(sub(footP, footQ));
  return { kind: distance <= 1e-9 ? 'intersecting' : 'skew', distance, footP, footQ, t, s };
}

/** E09: Acute angle between line and plane */
export function linePlaneAcuteAngle(u, n) {
  validVec(u, 'u'); validVec(n, 'n');
  if (norm(u) < 1e-12 || norm(n) < 1e-12) throw new RangeError('zero vector');
  return Math.asin(clamp(Math.abs(dot(u, n)) / (norm(u) * norm(n)), 0, 1));
}

/** E09: Acute angle between two planes */
export function betweenPlanesAcuteAngle(n1, n2) {
  validVec(n1, 'n1'); validVec(n2, 'n2');
  if (norm(n1) < 1e-12 || norm(n2) < 1e-12) throw new RangeError('zero normal');
  return Math.acos(clamp(Math.abs(dot(n1, n2)) / (norm(n1) * norm(n2)), 0, 1));
}

/** E07 & Oxyz: Sphere-plane intersection */
export function spherePlaneIntersection(center, radius, plane) {
  validVec(center, 'center');
  if (!(radius > 0)) throw new RangeError('radius positive');
  if (!plane || !Number.isFinite(plane.offset)) throw new TypeError('plane invalid');
  const n = unit(plane.normal);
  const offset = plane.offset / norm(plane.normal);
  const signedDistance = dot(n, center) + offset;
  const distance = Math.abs(signedDistance);
  if (distance > radius + 1e-9) return { kind: 'disjoint', distance, radius: 0 };
  const foot = sub(center, mul(n, signedDistance));
  if (Math.abs(distance - radius) <= 1e-9) return { kind: 'tangent', distance, radius: 0, center: foot };
  return { kind: 'secant', distance, radius: Math.sqrt(Math.max(0, radius * radius - distance * distance)), center: foot };
}

/** 2D Nets for curved solids */
export function coneNet(r, h) {
  positive(r, 'r'); positive(h, 'h');
  const slant = Math.hypot(r, h);
  const arc = 2 * Math.PI * r;
  const sectorAngle = arc / slant;
  return { slant, arc, sectorAngle, sectorArea: Math.PI * r * slant, baseArea: Math.PI * r * r };
}

export function cylinderNet(r, h) {
  positive(r, 'r'); positive(h, 'h');
  return { rectangleWidth: 2 * Math.PI * r, rectangleHeight: h, lateralArea: 2 * Math.PI * r * h, twoBasesArea: 2 * Math.PI * r * r };
}

export function frustumNet(R, r, h) {
  positive(R, 'R'); positive(r, 'r'); positive(h, 'h');
  if (R <= r) throw new RangeError('require R > r');
  const slant = Math.hypot(h, R - r);
  const outerRadius = slant * R / (R - r);
  const innerRadius = slant * r / (R - r);
  const angle = 2 * Math.PI * R / outerRadius;
  return {
    slant, outerRadius, innerRadius, angle,
    lateralArea: Math.PI * (R + r) * slant,
    volume: Math.PI * h * (R * R + R * r + r * r) / 3
  };
}

/** GeometryModelSchema parameter validator (Phase 2B) */
export function validateGeometryParams(type, params) {
  if (!params || typeof params !== 'object') {
    return { valid: false, error: 'params must be an object' };
  }
  // Check for negative or non-finite values
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === 'number' && (!Number.isFinite(v) || (['a', 'b', 'c', 'h', 'r', 'R'].includes(k) && v <= 0))) {
      return { valid: false, error: `Parameter ${k} must be positive finite number` };
    }
  }
  return { valid: true };
}

