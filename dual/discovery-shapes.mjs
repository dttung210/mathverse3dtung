/** Procedural & GLB educational mathematical models only; never claim architectural blueprint fidelity. */
import * as THREE from '/vendor/three.module.js';
import { R95_SVG_MAP, R95_GLB_BASE64_MAP } from './discovery-r95/r95-assets-bundle.mjs';
import {R97_GIZA_KHUFU_GEOMETRY_GLB_BASE64} from './discovery-r97/giza-glb-data.mjs';

const standard = (color, extra = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.44, metalness: 0.14, side: THREE.DoubleSide, ...extra });

function mesh(group, geometry, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x, y, z);
  group.add(m);
  return m;
}

function rod(group, a, b, r = 0.055, material = standard(0xf9c46b)) {
  const from = new THREE.Vector3(...a);
  const to = new THREE.Vector3(...b);
  const d = to.clone().sub(from);
  const len = d.length();
  if (len < 1e-5) return null;
  const o = mesh(group, new THREE.CylinderGeometry(r, r, len, 8), material);
  o.position.copy(from.add(to).multiplyScalar(0.5));
  o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return o;
}

const geoLine = (g, points, color = 0xffcd7c, r = 0.06) => {
  const material = standard(color);
  for (let i = 1; i < points.length; i++) rod(g, points[i - 1], points[i], r, material);
};

function base64ToUint8Array(b64) {
  if (typeof Buffer !== 'undefined') {
    const buf = Buffer.from(b64, 'base64');
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function parseGlbFromBase64(b64, targetGroup) {
  const bytes = base64ToUint8Array(b64);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const magic = view.getUint32(0, true);
  if (magic !== 0x46546c67) throw new Error('Invalid GLB header');
  const jsonLen = view.getUint32(12, true);
  const jsonBytes = bytes.subarray(20, 20 + jsonLen);
  const jsonText = new TextDecoder('utf-8').decode(jsonBytes);
  const gltf = JSON.parse(jsonText);

  const binChunkHeader = 20 + jsonLen;
  const binStart = binChunkHeader + 8;
  const binBuffer = bytes.buffer;
  const binBaseOffset = bytes.byteOffset + binStart;

  function readAccessor(accIdx) {
    const acc = gltf.accessors[accIdx];
    const bv = gltf.bufferViews[acc.bufferView];
    const byteOffset = binBaseOffset + (bv.byteOffset || 0) + (acc.byteOffset || 0);
    const numComponents = acc.type === 'SCALAR' ? 1 : acc.type === 'VEC2' ? 2 : acc.type === 'VEC3' ? 3 : 4;
    const count = acc.count * numComponents;
    if (acc.componentType === 5126) {
      const slice = bytes.slice(byteOffset - bytes.byteOffset, byteOffset - bytes.byteOffset + count * 4);
      return { array: new Float32Array(slice.buffer, slice.byteOffset, count), numComponents, normalized: false };
    }
    if (acc.componentType === 5125) {
      const slice = bytes.slice(byteOffset - bytes.byteOffset, byteOffset - bytes.byteOffset + count * 4);
      return { array: new Uint32Array(slice.buffer, slice.byteOffset, count), numComponents, normalized: false };
    }
    if (acc.componentType === 5123) {
      const slice = bytes.slice(byteOffset - bytes.byteOffset, byteOffset - bytes.byteOffset + count * 2);
      return { array: new Uint16Array(slice.buffer, slice.byteOffset, count), numComponents, normalized: false };
    }
    if (acc.componentType === 5121) {
      const slice = bytes.slice(byteOffset - bytes.byteOffset, byteOffset - bytes.byteOffset + count);
      const f32 = new Float32Array(acc.count * 3);
      for (let i = 0; i < acc.count; i++) {
        f32[i * 3] = slice[i * numComponents] / 255;
        f32[i * 3 + 1] = slice[i * numComponents + 1] / 255;
        f32[i * 3 + 2] = slice[i * numComponents + 2] / 255;
      }
      return { array: f32, numComponents: 3, normalized: false };
    }
    return null;
  }

  const inner = new THREE.Group();
  const vertexColMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.36,
    metalness: 0.18,
    flatShading: true,
    side: THREE.DoubleSide
  });
  const edgeMat = new THREE.LineBasicMaterial({ color: 0xf6d38b, transparent: true, opacity: 0.55 });

  const meshNodeNames = new Map();
  for (const node of gltf.nodes || []) {
    if (node.mesh !== undefined && node.name) {
      meshNodeNames.set(node.mesh, node.name);
    }
  }

  for (let mIdx = 0; mIdx < (gltf.meshes || []).length; mIdx++) {
    const mDef = gltf.meshes[mIdx];
    const nodeName = meshNodeNames.get(mIdx) || mDef.name || '';
    const needsYZSwap = /^(circular_terrace_|column_|cylinder$|cone$)/.test(nodeName);

    for (const prim of mDef.primitives || []) {
      const geom = new THREE.BufferGeometry();
      if (prim.attributes?.POSITION !== undefined) {
        const pos = readAccessor(prim.attributes.POSITION);
        if (pos) {
          const arr = pos.array;
          if (needsYZSwap && arr.length >= 3) {
            let minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
            for (let i = 0; i < arr.length; i += 3) {
              if (arr[i + 1] < minY) minY = arr[i + 1];
              if (arr[i + 1] > maxY) maxY = arr[i + 1];
              if (arr[i + 2] < minZ) minZ = arr[i + 2];
              if (arr[i + 2] > maxZ) maxZ = arr[i + 2];
            }
            const cy = 0.5 * (minY + maxY);
            const cz = 0.5 * (minZ + maxZ);
            for (let i = 0; i < arr.length; i += 3) {
              const dy = arr[i + 1] - cy;
              const dz = arr[i + 2] - cz;
              arr[i + 1] = cy + dz;
              arr[i + 2] = cz - dy;
            }
          }
          geom.setAttribute('position', new THREE.BufferAttribute(arr, 3));
        }
      }
      if (prim.attributes?.COLOR_0 !== undefined) {
        const col = readAccessor(prim.attributes.COLOR_0);
        if (col) geom.setAttribute('color', new THREE.BufferAttribute(col.array, 3));
      }
      if (prim.indices !== undefined) {
        const idx = readAccessor(prim.indices);
        if (idx) geom.setIndex(new THREE.BufferAttribute(idx.array, 1));
      }
      geom.computeVertexNormals();
      const m = new THREE.Mesh(geom, vertexColMat.clone());
      inner.add(m);
      try {
        const edges = new THREE.EdgesGeometry(geom, 20);
        const line = new THREE.LineSegments(edges, edgeMat.clone());
        inner.add(line);
      } catch (_) {}
    }
  }

  const box = new THREE.Box3().setFromObject(inner);
  if (!box.isEmpty()) {
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    const scale = 6.8 / maxDim;
    inner.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    inner.scale.setScalar(scale);
  }
  targetGroup.add(inner);
  return targetGroup;
}

const KIND_TO_GLB = Object.freeze({
  colosseum: 'models/colosseum_ellipse_annulus.glb',
  elliptic_ring: 'models/colosseum_ellipse_annulus.glb',
  parthenon: 'models/parthenon_columns_8x17.glb',
  column_grid: 'models/parthenon_columns_8x17.glb',
  atomium: 'models/atomium_9_spheres_20_connectors.glb',
  cube_9_spheres: 'models/atomium_9_spheres_20_connectors.glb',
  chichen_itza: 'models/chichen_9_terraces.glb',
  stepped_pyramid: 'models/chichen_9_terraces.glb',
  epcot_sphere: 'models/epcot_triangulated_sphere.glb',
  geodesic_sphere: 'models/epcot_triangulated_sphere.glb',
  geodesic_dome: 'models/epcot_triangulated_sphere.glb',
  borobudur: 'models/borobudur_5_square_3_circle.glb',
  square_circle_terraces: 'models/borobudur_5_square_3_circle.glb',
  petronas: 'models/petronas_two_squares_8_point_star.glb',
  eight_point_star: 'models/petronas_two_squares_8_point_star.glb',
  parcel_box: 'models/geometry_cuboid.glb',
  cuboid: 'models/geometry_cuboid.glb',
  water_tank: 'models/geometry_cylinder.glb',
  cylinder: 'models/geometry_cylinder.glb',
  ice_cream_cone: 'models/geometry_cone.glb',
  cone: 'models/geometry_cone.glb',
  camping_tent: 'models/geometry_triangular_prism.glb',
  prism: 'models/geometry_triangular_prism.glb',
  sphere: 'models/geometry_sphere.glb',
  square_pyramid: 'models/geometry_square_pyramid.glb'
});

export function createDiscoveryModel(kindOrItem) {
  const item = typeof kindOrItem === 'object' && kindOrItem !== null ? kindOrItem : null;
  const kind = item ? (item.kind || item.geometry?.modelType || item.diagramType || item.id) : String(kindOrItem || '');
  const g = new THREE.Group();
  g.name = 'DISCOVERY_MODEL_' + (item?.id || kind);

  if(item?.id==='unesco_giza'){parseGlbFromBase64(R97_GIZA_KHUFU_GEOMETRY_GLB_BASE64,g);return g;}
  const glbPath = item?.glbPath || KIND_TO_GLB[item?.id] || KIND_TO_GLB[kind];
  if (glbPath && R95_GLB_BASE64_MAP[glbPath]) {
    parseGlbFromBase64(R95_GLB_BASE64_MAP[glbPath], g);
    return g;
  }

  const teal = standard(0x4dd2d0);
  const light = standard(0xe4c390);
  const dark = standard(0x163b56);
  const gold = standard(0xffd478);
  const white = standard(0xf8fafc);

  if(kind==='pyramid'){
    const apexHeight=item?.id==='unesco_giza'?6*(146.5/230.3):5.8;
    const vertices = new Float32Array([-3, 0, -3, 3, 0, -3, 3, 0, 3, -3, 0, 3, 0, apexHeight, 0]);
    const indices = [0, 2, 1, 0, 3, 2, 0, 1, 4, 1, 2, 4, 2, 3, 4, 3, 0, 4];
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    mesh(g, geometry, standard(0xddb978, { flatShading: true, transparent: true, opacity: 0.88 }));
    for (let i = 0; i < 4; i++) {
      rod(g, Array.from(vertices.slice(i * 3, i * 3 + 3)), [0, apexHeight, 0], 0.065, dark);
      rod(g, Array.from(vertices.slice(i * 3, i * 3 + 3)), Array.from(vertices.slice(((i + 1) % 4) * 3, ((i + 1) % 4) * 3 + 3)), 0.07, gold);
    }
  }else if(kind==='shells'){
    mesh(g, new THREE.BoxGeometry(10, 0.35, 6), standard(0xd7dde1), 0, -0.25, 0);
    for (let i = 0; i < 5; i++) {
      const piece = mesh(g, new THREE.SphereGeometry(3.5, 28, 16, 0.25, 1.32, 0.28, 1.15), standard(i % 2 === 0 ? 0xf3ead9 : 0xbed7dc, { transparent: true, opacity: 0.92 }), -4.0 + i * 2.0, 0.5, 0);
      piece.rotation.z = 0.12;
      piece.rotation.y = i * 0.12;
    }
  }else if(kind==='truss' || kind === 'truss_triangle'){
    const bronze = standard(0xc88f53);
    for (let level = 0; level < 5; level++) {
      const y = level * 1.45;
      const wide = 3.3 * (1 - level / 5) + 0.28;
      const next = 3.3 * (1 - (level + 1) / 5) + 0.28;
      for (const side of [-1, 1]) {
        rod(g, [side * wide, y, 0], [side * next, y + 1.45, 0], 0.09, bronze);
        rod(g, [side * wide, y, 1.15], [side * next, y + 1.45, 1.15], 0.09, bronze);
        rod(g, [side * wide, y, 0], [side * next, y + 1.45, 1.15], 0.045, gold);
        rod(g, [side * wide, y, 1.15], [side * next, y + 1.45, 0], 0.045, gold);
      }
      rod(g, [-wide, y, 0.55], [wide, y, 0.55], 0.08, bronze);
    }
    rod(g, [-0.45, 7.25, 0.55], [0.45, 7.25, 0.55], 0.11, bronze);
    rod(g, [0, 7.25, 0.55], [0, 9, 0.55], 0.12, bronze);
  }else if(kind==='bridge' || kind === 'bridge_symmetry'){
    const rust = standard(0xce553d);
    mesh(g, new THREE.BoxGeometry(13, 0.32, 2.5), standard(0x566878), 0, -1.1, 0);
    for (const x of [-4, 4]) {
      mesh(g, new THREE.BoxGeometry(0.55, 5.5, 0.55), rust, x, 1.65, -0.75);
      mesh(g, new THREE.BoxGeometry(0.55, 5.5, 0.55), rust, x, 1.65, 0.75);
      rod(g, [x, 4.3, -0.75], [x, 4.3, 0.75], 0.12, rust);
    }
    const cable = [];
    for (let i = 0; i <= 36; i++) {
      const x = -6.1 + (i * 12.2) / 36;
      const y = 1 + 3.2 * Math.pow(x / 6.1, 2);
      cable.push([x, y, -0.7]);
      if (i % 3 === 0) rod(g, [x, -0.95, -0.7], [x, y, -0.7], 0.035, rust);
    }
    geoLine(g, cable, 0xffd4ac, 0.1);
  }else if(kind==='cylinder'){
    // Elementary cylinder with a visually distinguishable slanted symmetry axis.
    const tower=mesh(g,new THREE.CylinderGeometry(2.0,2.0,6.3,40),standard(0xd8c596),0,0,0);
    tower.rotation.z=0.12;
    for(let k=-2;k<=2;k++){
      const ring=mesh(g,new THREE.TorusGeometry(2.04,0.075,8,40),gold,0,k*1.15,0);
      ring.rotation.x=Math.PI/2;
      ring.rotation.y=0.12;
    }
    rod(g,[0,-4,0],[0,4,0],0.045,teal);
  }else if(kind==='traffic'){
    // R98: Structural geometry matching a real 3-aspect vertical signal head (housing + backplate + sun visors + protruding cylindrical lenses + mounting pole/brackets).
    const housingMat = standard(0x132638, { roughness: 0.38, metalness: 0.25 });
    const bezelMat = standard(0x050c18, { roughness: 0.3, metalness: 0.35 });
    const visorMat = standard(0x0b1724, { roughness: 0.35, metalness: 0.3, side: THREE.DoubleSide });
    const poleMat = standard(0x64748b, { roughness: 0.4, metalness: 0.45 });
    // High-contrast signal backplate with border trim
    mesh(g, new THREE.BoxGeometry(3.38, 8.18, 0.1), standard(0xfacc15, { roughness: 0.5 }), 0, 1.2, -0.84);
    mesh(g, new THREE.BoxGeometry(3.16, 7.96, 0.12), visorMat, 0, 1.2, -0.82);
    // Main rectangular signal housing & top/bottom weather caps + compartment dividers
    mesh(g, new THREE.BoxGeometry(2.8, 7.6, 1.65), housingMat, 0, 1.2, 0);
    mesh(g, new THREE.BoxGeometry(2.94, 0.18, 1.76), bezelMat, 0, 5.05, 0.02);
    mesh(g, new THREE.BoxGeometry(2.94, 0.18, 1.76), bezelMat, 0, -2.65, 0.02);
    mesh(g, new THREE.BoxGeometry(2.84, 0.1, 1.72), bezelMat, 0, 2.42, 0.03);
    mesh(g, new THREE.BoxGeometry(2.84, 0.1, 1.72), bezelMat, 0, 0.07, 0.03);
    // Mounting pole, rear brackets, and octagonal base flange
    mesh(g, new THREE.CylinderGeometry(0.24, 0.28, 3.3, 24), poleMat, 0, -4.15, -0.15);
    mesh(g, new THREE.CylinderGeometry(0.95, 1.12, 0.26, 8), poleMat, 0, -5.75, -0.15);
    mesh(g, new THREE.BoxGeometry(0.42, 0.32, 0.9), poleMat, 0, 3.8, -0.55);
    mesh(g, new THREE.BoxGeometry(0.42, 0.32, 0.9), poleMat, 0, -1.4, -0.55);
    for (const [i, c] of [0xd63545, 0xf8b834, 0x35c774].entries()) {
      const cy = 3.6 - i * 2.35;
      // Bezel ring & protruding cylindrical lens (mặt khối trụ dẹt)
      mesh(g, new THREE.CylinderGeometry(0.95, 0.95, 0.14, 32), bezelMat, 0, cy, 0.88).rotation.x = Math.PI / 2;
      mesh(g, new THREE.CylinderGeometry(0.72, 0.72, 0.12, 32), standard(c, { emissive: c, emissiveIntensity: 0.32, roughness: 0.2 }), 0, cy, 1.03).rotation.x = Math.PI / 2;
      // Curved upper hood visor (nắp che nắng) over each signal lens
      const visor = mesh(g, new THREE.CylinderGeometry(0.96, 0.96, 0.92, 32, 1, true, Math.PI * 0.42, Math.PI * 1.16), visorMat, 0, cy + 0.06, 1.24);
      visor.rotation.x = Math.PI / 2;
    }
  }else if(kind==='wheel'){
    const ring = mesh(g, new THREE.TorusGeometry(3.65, 0.28, 12, 60), standard(0x151d2a));
    ring.rotation.y = 0.05;
    mesh(g, new THREE.SphereGeometry(0.38, 16, 12), gold, 0, 0, 0.25);
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI * 2) / 16;
      rod(g, [0, 0, 0], [3.45 * Math.sin(a), 3.45 * Math.cos(a), 0], 0.035, standard(0xc5d1db));
    }
  }else if(kind==='fish'){
    const colors = [0x40c5cf, 0xff9c65, 0x64d4d1, 0xffca79, 0x7fd48f];
    for (let i = 0; i < 5; i++) {
      const x = ((i % 3) - 1) * 3.3;
      const y = i < 3 ? 1.0 : -2.1;
      const col = standard(colors[i]);
      mesh(g, new THREE.SphereGeometry(1, 18, 12), col, x, y, 0).scale.set(1.15, 0.63, 0.47);
      const tail = mesh(g, new THREE.ConeGeometry(0.8, 1.5, 3), col, x - 1.28, y, 0);
      tail.rotation.z = -Math.PI / 2;
      mesh(g, new THREE.SphereGeometry(0.1, 10, 8), dark, x + 0.72, y + 0.14, 0.42);
    }
  }else if(kind==='clock' || kind === 'clock_circle'){
    mesh(g, new THREE.BoxGeometry(2.6, 7.2, 2.6), light, 0, 0, -0.5);
    mesh(g, new THREE.CylinderGeometry(2.2, 2.2, 0.35, 48), standard(0xf8e7c9), 0, 1.2, 0.72).rotation.x = Math.PI / 2;
    const hands = standard(0x193548);
    rod(g, [0, 1.2, 0.95], [0, 2.75, 0.95], 0.08, hands);
    rod(g, [0, 1.2, 0.95], [1.35, 1.2, 0.95], 0.1, gold);
  } else if (kind === 'hyperboloid_principle' || kind === 'ruled_surface') {
    const n = 20;
    const R = 2.6;
    const h = 3.2;
    const twist = (Math.PI * 2) / 3;
    for (let i = 0; i < n; i++) {
      const a1 = (i * Math.PI * 2) / n;
      const a2 = a1 + twist;
      const a3 = a1 - twist;
      rod(g, [R * Math.cos(a1), -h, R * Math.sin(a1)], [R * Math.cos(a2), h, R * Math.sin(a2)], 0.055, teal);
      rod(g, [R * Math.cos(a1), -h, R * Math.sin(a1)], [R * Math.cos(a3), h, R * Math.sin(a3)], 0.045, gold);
    }
    mesh(g, new THREE.TorusGeometry(R, 0.08, 12, 48), gold, 0, -h, 0).rotation.x = Math.PI / 2;
    mesh(g, new THREE.TorusGeometry(R, 0.08, 12, 48), gold, 0, h, 0).rotation.x = Math.PI / 2;
  } else if (kind === 'steel_arch' || kind === 'curved_walkway') {
    const pts = [];
    for (let i = 0; i <= 32; i++) {
      const x = -4.2 + (i * 8.4) / 32;
      const y = 3.6 - 0.38 * x * x;
      pts.push([x, y, 0]);
    }
    geoLine(g, pts, 0x2dcab8, 0.18);
    mesh(g, new THREE.BoxGeometry(9.6, 0.25, 2.4), dark, 0, -3.15, 0);
  } else if (kind === 'radial_9') {
    mesh(g, new THREE.CylinderGeometry(3.8, 4.1, 0.35, 36), dark, 0, -1.8, 0);
    for (let i = 0; i < 9; i++) {
      const a = (i * Math.PI * 2) / 9;
      const petal = mesh(g, new THREE.SphereGeometry(2.1, 20, 14, 0, Math.PI * 0.55, 0, Math.PI * 0.65), white, Math.cos(a) * 1.4, -0.5, Math.sin(a) * 1.4);
      petal.rotation.y = -a;
      petal.rotation.z = 0.35;
    }
  } else if (kind === 'three_towers') {
    for (const x of [-2.8, 0, 2.8]) {
      mesh(g, new THREE.BoxGeometry(1.1, 5.2, 1.5), teal, x, -0.2, 0);
    }
    mesh(g, new THREE.BoxGeometry(7.8, 0.5, 2.2), gold, 0, 2.65, 0);
  } else if (kind === 'stepped_tower' || kind === 'triangle_circle_transition') {
    for (let i = 0; i < 5; i++) {
      const s = 3.2 - i * 0.52;
      mesh(g, new THREE.BoxGeometry(s, 1.25, s), i % 2 === 0 ? teal : gold, 0, -2.4 + i * 1.25, 0);
    }
  } else if (kind === 'branching_tree') {
    mesh(g, new THREE.CylinderGeometry(0.45, 0.9, 3.8, 18), teal, 0, -0.8, 0);
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI * 2) / 12;
      rod(g, [0, 0.8, 0], [2.8 * Math.cos(a), 2.5, 2.8 * Math.sin(a)], 0.06, gold);
    }
    mesh(g, new THREE.CylinderGeometry(3.1, 1.2, 0.3, 24), light, 0, 2.55, 0);
  } else if (kind === 'circle_square' || kind === 'circular_tiers' || kind === 'circular_platform' || kind === 'tapered_cylinder' || kind === 'rotational_tower') {
    mesh(g, new THREE.BoxGeometry(6.8, 0.35, 6.8), dark, 0, -2.1, 0);
    for (let i = 0; i < 3; i++) {
      mesh(g, new THREE.CylinderGeometry(2.6 - i * 0.55, 2.8 - i * 0.55, 0.9, 36), i % 2 === 0 ? teal : gold, 0, -1.3 + i * 1.0, 0);
    }
    mesh(g, new THREE.ConeGeometry(1.8, 1.6, 36), gold, 0, 2.1, 0);
  } else if (item?.id === 'r106_beehive' || item?.id === 'r106_tessellation' || item?.id === 'r107_basalt' || kind === 'tessellation') {
    const isBasalt = item?.id === 'r107_basalt';
    const offsets = [[0, 0], [1.9, 0], [-1.9, 0], [0.95, 1.65], [-0.95, 1.65], [0.95, -1.65], [-0.95, -1.65]];
    offsets.forEach(([ox, oz], idx) => {
      const h = isBasalt ? 1.8 + (idx % 4) * 0.75 : 1.1;
      const cell = mesh(g, new THREE.CylinderGeometry(1.02, 1.02, h, 6), idx % 2 === 0 ? gold : teal, ox, -1.5 + h / 2, oz);
      cell.rotation.y = Math.PI / 6;
      if (!isBasalt) {
        const inner = mesh(g, new THREE.CylinderGeometry(0.82, 0.82, h + 0.05, 6), dark, ox, -1.5 + h / 2, oz);
        inner.rotation.y = Math.PI / 6;
      }
    });
  } else if (item?.id === 'r106_ferris' || item?.id === 'r106_bicycle') {
    const ring = mesh(g, new THREE.TorusGeometry(3.4, 0.18, 12, 48), gold);
    ring.rotation.y = 0.05;
    mesh(g, new THREE.CylinderGeometry(0.42, 0.42, 0.6, 20), teal).rotation.x = Math.PI / 2;
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI * 2) / 12;
      rod(g, [0, 0, 0], [3.3 * Math.cos(a), 3.3 * Math.sin(a), 0], 0.04, light);
      if (item?.id === 'r106_ferris') {
        mesh(g, new THREE.BoxGeometry(0.52, 0.42, 0.42), i % 2 === 0 ? teal : gold, 3.4 * Math.cos(a), 3.4 * Math.sin(a) - 0.28, 0);
      }
    }
    if (item?.id === 'r106_ferris') {
      rod(g, [0, 0, -0.35], [-2.1, -4.1, -0.55], 0.12, dark);
      rod(g, [0, 0, -0.35], [2.1, -4.1, -0.55], 0.12, dark);
    }
  } else if (item?.id === 'r106_geodesic' || item?.id === 'r106_football') {
    mesh(g, new THREE.IcosahedronGeometry(3.2, item?.id === 'r106_football' ? 1 : 2), standard(0x2dcab8, { flatShading: true, transparent: true, opacity: 0.86 }));
    mesh(g, new THREE.IcosahedronGeometry(3.24, 1), standard(0xf5cb7c, { wireframe: true }));
  } else if (item?.id === 'r106_snowflake' || item?.id === 'snowflake') {
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const dx = Math.cos(a), dy = Math.sin(a);
      rod(g, [0, 0, 0], [3.5 * dx, 3.5 * dy, 0], 0.09, white);
      for (const r of [1.4, 2.45]) {
        for (const s of [-1, 1]) {
          const ba = a + s * (Math.PI / 5);
          rod(g, [r * dx, r * dy, 0], [r * dx + 0.95 * Math.cos(ba), r * dy + 0.95 * Math.sin(ba), 0], 0.06, teal);
        }
      }
    }
    mesh(g, new THREE.CylinderGeometry(0.65, 0.65, 0.22, 6), gold).rotation.x = Math.PI / 2;
  } else if (item?.id === 'r106_starfish' || item?.id === 'flower_petals') {
    const n = 5;
    mesh(g, new THREE.CylinderGeometry(1.1, 1.2, 0.45, 24), gold, 0, 0, 0).rotation.x = Math.PI / 2;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / n;
      const arm = mesh(g, new THREE.ConeGeometry(0.85, 3.2, 12), i % 2 === 0 ? teal : light, 1.9 * Math.cos(a), 1.9 * Math.sin(a), 0);
      arm.rotation.z = a - Math.PI / 2;
    }
  } else if (item?.id === 'r106_pine' || item?.id === 'r106_romanesco' || item?.id === 'r107_nautilus' || item?.id === 'r107_pineapple') {
    const goldenAngle = 2.399963229728653;
    for (let i = 0; i < 48; i++) {
      const t = i / 47;
      const r = 0.35 + 3.1 * Math.sqrt(t);
      const a = i * goldenAngle;
      const y = (1 - t) * 2.8 - 1.4;
      const floret = mesh(g, new THREE.ConeGeometry(0.36, 0.75, 8), i % 3 === 0 ? gold : i % 2 === 0 ? teal : light, r * Math.cos(a), y, r * Math.sin(a));
      floret.rotation.y = -a;
    }
  } else if (item?.id === 'r106_stairs' || item?.id === 'r107_staircase' || item?.id === 'r107_spring') {
    mesh(g, new THREE.CylinderGeometry(0.36, 0.36, 6.6, 20), gold, 0, 0, 0);
    for (let i = 0; i < 24; i++) {
      const a = (i / 23) * Math.PI * 3.2;
      const y = -2.9 + (i / 23) * 5.8;
      const step = mesh(g, new THREE.BoxGeometry(2.2, 0.16, 0.62), i % 2 === 0 ? teal : light, 1.35 * Math.cos(a), y, 1.35 * Math.sin(a));
      step.rotation.y = -a;
    }
  } else if (item?.id === 'r107_spiderweb') {
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      rod(g, [0, 0, 0], [3.6 * Math.cos(a), 3.6 * Math.sin(a), 0], 0.035, white);
    }
    for (let r = 0.8; r <= 3.4; r += 0.65) {
      const pts = [];
      for (let i = 0; i <= 12; i++) {
        const a = (i * Math.PI) / 6;
        pts.push([r * Math.cos(a), r * Math.sin(a), 0]);
      }
      geoLine(g, pts, 0x5eead4, 0.035);
    }
  } else if (item?.id === 'r107_treerings' || kind === 'annulus' || item?.id === 'r107_irrigation' || item?.id === 'r107_chainring') {
    mesh(g, new THREE.CylinderGeometry(3.6, 3.6, 0.45, 40), light, 0, 0, 0).rotation.x = Math.PI / 2;
    for (let r = 0.7; r <= 3.3; r += 0.65) {
      mesh(g, new THREE.TorusGeometry(r, 0.06, 10, 40), r > 2 ? gold : teal, 0, 0, 0.25);
    }
    rod(g, [0, 0, 0.3], [3.4, 0, 0.3], 0.07, white);
  } else if (item?.id === 'r107_soapbubbles') {
    const bubbles = [[0, 0.3, 0, 2.1], [-2.1, -0.7, 0.6, 1.25], [2.0, -0.5, -0.4, 1.35], [0.6, 2.1, 0.5, 1.0]];
    bubbles.forEach(([x, y, z, r], idx) => {
      mesh(g, new THREE.SphereGeometry(r, 28, 20), standard(idx % 2 === 0 ? 0x5eead4 : 0xf6d38b, { transparent: true, opacity: 0.72 }), x, y, z);
    });
  } else if (item?.id === 'r107_dish' || item?.id === 'r107_soapfilms' || kind === 'parabola') {
    mesh(g, new THREE.CylinderGeometry(0.35, 0.55, 2.6, 18), dark, 0, -2.1, 0);
    const dish = mesh(g, new THREE.SphereGeometry(3.2, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.42), teal, 0, 1.2, 0);
    dish.rotation.x = Math.PI;
    rod(g, [0, -0.9, 0], [0, 1.3, 0], 0.07, gold);
    mesh(g, new THREE.SphereGeometry(0.28, 16, 12), gold, 0, 1.35, 0);
  } else if (item?.id === 'r107_windturbine') {
    mesh(g, new THREE.CylinderGeometry(0.22, 0.42, 6.2, 20), white, 0, -1.2, 0);
    mesh(g, new THREE.SphereGeometry(0.45, 16, 12), gold, 0, 1.9, 0.35);
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      rod(g, [0, 1.9, 0.45], [3.2 * Math.cos(a), 1.9 + 3.2 * Math.sin(a), 0.45], 0.09, teal);
    }
  } else if (item?.id === 'r107_truss') {
    mesh(g, new THREE.BoxGeometry(9.2, 0.28, 1.8), dark, 0, -1.5, 0);
    mesh(g, new THREE.BoxGeometry(7.6, 0.22, 1.6), gold, 0, 1.3, 0);
    for (let i = 0; i < 6; i++) {
      const x0 = -3.9 + i * 1.3;
      for (const z of [-0.7, 0.7]) {
        rod(g, [x0, -1.4, z], [x0 + 0.65, 1.3, z], 0.07, teal);
        rod(g, [x0 + 0.65, 1.3, z], [x0 + 1.3, -1.4, z], 0.07, teal);
      }
    }
  } else if (item?.id === 'r107_container') {
    mesh(g, new THREE.BoxGeometry(6.4, 2.8, 2.8), teal, 0, 0, 0);
    for (let i = -5; i <= 5; i++) {
      mesh(g, new THREE.BoxGeometry(0.18, 2.86, 2.88), gold, i * 0.52, 0, 0);
    }
  } else if (kind === 'arc') {
    mesh(g, new THREE.BoxGeometry(4.4, 3.8, 0.35), dark, 0, -0.9, 0);
    mesh(g, new THREE.CylinderGeometry(2.2, 2.2, 0.35, 32, 1, false, 0, Math.PI), teal, 0, 1.0, 0).rotation.z = Math.PI / 2;
    rod(g, [-2.2, -2.8, 0.22], [2.2, -2.8, 0.22], 0.08, gold);
    rod(g, [-2.2, 1.0, 0.22], [2.2, 1.0, 0.22], 0.08, gold);
    rod(g, [0, -2.8, 0.22], [0, 3.1, 0.22], 0.07, gold);
  } else if (kind === 'triangle' || kind === 'righttriangle') {
    const pts = kind === 'righttriangle' ? [[-2.8, -2.2, 0], [2.6, -2.2, 0], [-2.8, 2.6, 0], [-2.8, -2.2, 0]] : [[0, 2.8, 0], [-3.0, -2.2, 0], [3.0, -2.2, 0], [0, 2.8, 0]];
    geoLine(g, pts, 0xf6d38b, 0.14);
    mesh(g, new THREE.ConeGeometry(2.8, 3.6, 3), standard(0x2dcab8, { transparent: true, opacity: 0.75 }), 0, -0.2, -0.4);
  } else if (kind === 'rectangle') {
    mesh(g, new THREE.BoxGeometry(6.2, 4.2, 0.28), gold, 0, 0, 0);
    mesh(g, new THREE.BoxGeometry(5.2, 3.2, 0.34), dark, 0, 0, 0.04);
    mesh(g, new THREE.BoxGeometry(4.8, 2.8, 0.38), teal, 0, 0, 0.08);
  } else if (kind === 'sector') {
    for (let i = 0; i < 8; i++) {
      const a0 = (i * Math.PI * 2) / 8;
      const pull = i === 0 ? 0.65 : 0.06;
      const slice = mesh(g, new THREE.CylinderGeometry(3.1, 3.1, 0.42, 16, 1, false, a0 + 0.03, (Math.PI * 2) / 8 - 0.06), i === 0 ? gold : i % 2 === 0 ? teal : light, Math.cos(a0 + Math.PI / 8) * pull, 0, Math.sin(a0 + Math.PI / 8) * pull);
      slice.rotation.x = Math.PI / 2;
    }
  } else if (kind === 'radial') {
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI * 2) / 12;
      rod(g, [0, 0, 0], [3.4 * Math.cos(a), 3.4 * Math.sin(a), 0], 0.055, i % 2 === 0 ? gold : teal);
      mesh(g, new THREE.OctahedronGeometry(0.42, 0), i % 2 === 0 ? teal : gold, 2.4 * Math.cos(a), 2.4 * Math.sin(a), 0);
    }
    mesh(g, new THREE.TorusGeometry(3.4, 0.1, 12, 48), gold);
  } else if (kind === 'frustum') {
    mesh(g, new THREE.CylinderGeometry(2.6, 1.5, 3.8, 32), light, 0, -0.2, 0);
    mesh(g, new THREE.TorusGeometry(2.62, 0.16, 12, 36), gold, 0, 1.7, 0).rotation.x = Math.PI / 2;
    mesh(g, new THREE.SphereGeometry(1.1, 18, 14), teal, 0, 2.3, 0);
  } else if (kind === 'symmetry') {
    rod(g, [0, -3.4, 0], [0, 3.4, 0], 0.09, gold);
    for (const s of [-1, 1]) {
      const w1 = mesh(g, new THREE.SphereGeometry(1.8, 20, 14), teal, s * 1.65, 0.7, 0);
      w1.scale.set(1.1, 0.85, 0.22);
      const w2 = mesh(g, new THREE.SphereGeometry(1.35, 18, 12), light, s * 1.35, -1.1, 0);
      w2.scale.set(1.0, 0.85, 0.22);
    }
  } else if (kind === 'set') {
    mesh(g, new THREE.CylinderGeometry(3.2, 2.1, 1.4, 24), light, 0, -1.2, 0);
    const cols = [0xd63545, 0xf8b834, 0x35c774, 0x4dd2d0, 0xa855f7];
    cols.forEach((c, i) => {
      const a = (i * Math.PI * 2) / 5;
      mesh(g, new THREE.SphereGeometry(0.72, 18, 14), standard(c), 1.4 * Math.cos(a), -0.1, 1.4 * Math.sin(a));
    });
  } else if (kind === 'venn') {
    mesh(g, new THREE.TorusGeometry(2.2, 0.12, 12, 40), teal, -1.1, 0, 0);
    mesh(g, new THREE.TorusGeometry(2.2, 0.12, 12, 40), gold, 1.1, 0, 0);
    mesh(g, new THREE.BoxGeometry(0.65, 1.6, 0.45), teal, -2.0, 0, 0);
    mesh(g, new THREE.BoxGeometry(0.65, 1.6, 0.45), white, 0, 0, 0.2);
    mesh(g, new THREE.BoxGeometry(0.65, 1.6, 0.45), gold, 2.0, 0, 0);
  } else if (kind === 'numberline') {
    rod(g, [0, -3.6, 0], [0, 3.6, 0], 0.08, white);
    for (let k = -3; k <= 3; k++) {
      mesh(g, new THREE.BoxGeometry(1.8, 0.14, 0.8), k === 0 ? gold : k > 0 ? teal : light, 0, k * 1.0, 0);
    }
    mesh(g, new THREE.BoxGeometry(1.1, 0.85, 1.1), gold, 0, 1.5, 0.5);
  } else if (kind === 'ratio') {
    mesh(g, new THREE.CylinderGeometry(0.25, 0.45, 3.6, 16), dark, 0, -1.1, 0);
    rod(g, [-3.2, 0.7, 0], [3.2, 0.7, 0], 0.1, gold);
    for (const s of [-1, 1]) {
      rod(g, [s * 2.8, 0.7, 0], [s * 2.8, -0.8, 0], 0.05, white);
      mesh(g, new THREE.CylinderGeometry(1.1, 0.9, 0.25, 20), teal, s * 2.8, -0.9, 0);
    }
  } else if (kind === 'squaregrid') {
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        mesh(g, new THREE.BoxGeometry(0.92, 0.22, 0.92), (r + c) % 2 === 0 ? gold : dark, (c - 2.5) * 0.95, -0.6, (r - 2.5) * 0.95);
      }
    }
    mesh(g, new THREE.CylinderGeometry(0.28, 0.42, 1.3, 16), teal, -0.48, 0.2, -0.48);
    mesh(g, new THREE.ConeGeometry(0.42, 1.5, 16), white, 0.48, 0.25, 0.48);
  } else if (kind === 'stairs') {
    for (let i = 0; i < 6; i++) {
      mesh(g, new THREE.BoxGeometry(1.1, (i + 1) * 0.65, 2.2), i % 2 === 0 ? teal : gold, -2.75 + i * 1.1, -2.0 + ((i + 1) * 0.65) / 2, 0);
    }
    rod(g, [-3.3, -2.0, 1.25], [3.3, 1.9, 1.25], 0.08, white);
  } else if (kind === 'trapezoid') {
    const shape = new THREE.Shape();
    shape.moveTo(-3.4, -1.8);
    shape.lineTo(3.4, -1.8);
    shape.lineTo(2.0, 1.8);
    shape.lineTo(-2.0, 1.8);
    shape.closePath();
    const geom = new THREE.ExtrudeGeometry(shape, { depth: 0.55, bevelEnabled: false });
    mesh(g, geom, teal, 0, 0, -0.28);
    geoLine(g, [[-3.4, -1.8, 0.32], [3.4, -1.8, 0.32], [2.0, 1.8, 0.32], [-2.0, 1.8, 0.32], [-3.4, -1.8, 0.32]], 0xf6d38b, 0.08);
  } else if (kind === 'bar') {
    mesh(g, new THREE.BoxGeometry(7.2, 0.26, 2.2), dark, 0, -2.3, 0);
    const heights = [1.8, 3.4, 2.6, 4.4, 3.1];
    const barCols = [0x4dd2d0, 0xf6d38b, 0x38bdf8, 0x34d399, 0xf97316];
    heights.forEach((bh, i) => {
      mesh(g, new THREE.BoxGeometry(0.88, bh, 0.92), standard(barCols[i]), -2.6 + i * 1.3, -2.15 + bh / 2, 0);
    });
    rod(g, [-3.3, -2.15 + 3.06, 0.55], [3.3, -2.15 + 3.06, 0.55], 0.06, white);
  } else if (kind === 'linechart') {
    mesh(g, new THREE.BoxGeometry(7.4, 0.24, 1.6), dark, 0, -2.3, 0);
    const pts = [[-2.8, -1.2, 0], [-1.4, 0.4, 0], [0, -0.3, 0], [1.4, 1.6, 0], [2.8, 0.9, 0]];
    geoLine(g, pts, 0x4dd2d0, 0.11);
    pts.forEach(([px, py, pz]) => {
      mesh(g, new THREE.SphereGeometry(0.28, 16, 12), gold, px, py, pz);
      rod(g, [px, -2.2, pz], [px, py, pz], 0.04, light);
    });
  } else if (kind === 'dice') {
    for (const [dx, rot] of [[-1.6, 0.25], [1.6, -0.35]]) {
      const cube = mesh(g, new THREE.BoxGeometry(2.2, 2.2, 2.2), white, dx, 0, 0);
      cube.rotation.set(rot, rot * 1.3, 0);
      for (const [px, py] of [[-0.55, -0.55], [0, 0], [0.55, 0.55]]) {
        mesh(cube, new THREE.SphereGeometry(0.16, 12, 10), dark, px, py, 1.12);
      }
    }
  } else {
    parseGlbFromBase64(R95_GLB_BASE64_MAP['models/geometry_cuboid.glb'], g);
  }
  return g;
}

export function disposeDiscoveryModel(group) {
  group?.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      for (const m of Array.isArray(obj.material) ? obj.material : [obj.material]) {
        if (m.map) m.map.dispose();
        m.dispose();
      }
    }
  });
}

export function geometrySVG(kindOrItem, subset = false) {
  const item = typeof kindOrItem === 'object' && kindOrItem !== null ? kindOrItem : null;
  const kind = item ? (item.heritageInscriptionVerified ? item.kind : (item.id || item.kind)) : String(kindOrItem || '');
  const svgPath = item?.svgPath || (R95_SVG_MAP[`svg/landmarks/${kind}.svg`] ? `svg/landmarks/${kind}.svg` : R95_SVG_MAP[`svg/gallery/${kind}.svg`] ? `svg/gallery/${kind}.svg` : null);

  if (svgPath && R95_SVG_MAP[svgPath]) {
    return R95_SVG_MAP[svgPath];
  }

  const wrap = (body) =>
    `<svg viewBox="0 0 460 270" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Hình học Toán 2D: ${kind}"><rect width="460" height="270" rx="18" fill="#0c2539"/>${body}</svg>`;

  // UNESCO exhibits use mathematically illustrative diagrams, NEVER an architectural survey.
  if (item?.heritageInscriptionVerified) {
    const caption='<text x="230" y="253" text-anchor="middle" fill="#d9e7f0" font-size="13">Sơ đồ 2D lý tưởng hóa · không theo tỉ lệ công trình</text>';
    const axis='<line x1="230" y1="23" x2="230" y2="232" stroke="#ffb86c" stroke-width="2" stroke-dasharray="7,5" opacity=".9"/>';
    const rect=(x,y,w,h,stroke='#e6c486')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="none" stroke="${stroke}" stroke-width="3"/>`;
    const circle=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#55d8cc" stroke-width="3"/>`;
    const label=(t)=>`<text x="230" y="22" text-anchor="middle" fill="#f0dbad" font-size="15">${t}</text>`;
    let body='';
    if (kind==='pyramid'||kind==='stepped_pyramid') {
      if(kind==='pyramid')body=label('Hình chóp tứ giác đều')+`<path d="M230 45 L105 210 L356 210 Z" fill="#12445d" stroke="#e6c486" stroke-width="3"/><path d="M230 45 L230 210 M105 210 L230 181 L356 210" fill="none" stroke="#55d8cc" stroke-width="3"/>`+axis;
      else body=label('Hình chóp nhiều tầng')+Array.from({length:6},(_,i)=>rect(105+14*i,190-24*i,250-28*i,23,'#e6c486')).join('')+axis;
    }else if(kind==='column_grid'||kind==='three_towers'){
      body=label('Dãy cột, trục đối xứng')+rect(70,197,320,18)+Array.from({length:7},(_,i)=>rect(87+i*44,75,23,119,'#55d8cc')).join('')+rect(76,57,306,17)+axis;
    }else if(kind==='elliptic_ring'){
      body=label('Elip và hình vành khuyên')+`<ellipse cx="230" cy="142" rx="160" ry="80" fill="none" stroke="#e6c486" stroke-width="4"/><ellipse cx="230" cy="142" rx="108" ry="49" fill="none" stroke="#55d8cc" stroke-width="4"/>`+axis;
    }else if(kind==='bridge'||kind==='steel_arch'){
      body=label('Nhịp cầu, trục và vòm')+`<path d="M85 193 Q230 35 375 193" fill="none" stroke="#e6c486" stroke-width="5"/>`+rect(70,194,320,14,'#55d8cc')+axis;
    }else if(kind==='cylinder'){
      body=label('Mặt cắt hình trụ')+`<path d="M157 75 V185 Q230 222 303 185 V75" fill="none" stroke="#e6c486" stroke-width="4"/><ellipse cx="230" cy="75" rx="73" ry="24" fill="none" stroke="#55d8cc" stroke-width="4"/><path d="M157 185 Q230 155 303 185" fill="none" stroke="#55d8cc" stroke-width="2" stroke-dasharray="5 6"/>`+axis;
    }else if(kind==='square_circle_terraces'||kind==='circle_square'){
      body=label('Các hình vuông đồng tâm và đường tròn')+rect(100,54,260,174)+rect(145,86,170,110,'#55d8cc')+circle(230,142,52)+circle(230,142,26)+axis;
    }else if(kind==='shells'){
      body=label('Các mặt cong')+`<path d="M75 210 Q119 21 205 210 Z" fill="none" stroke="#e6c486" stroke-width="4"/><path d="M177 210 Q245 0 317 210 Z" fill="none" stroke="#55d8cc" stroke-width="4"/><path d="M281 210 Q320 60 389 210 Z" fill="none" stroke="#e6c486" stroke-width="4"/>`;
    }else if(kind==='truss'||kind==='stepped_tower'){
      body=label('Đối xứng và các tầng khối hình chữ nhật')+Array.from({length:4},(_,i)=>rect(92+28*i,179-36*i,275-56*i,33,i%2?'#55d8cc':'#e6c486')).join('')+axis;
    }else{
      body=label('Hình học phẳng minh họa')+rect(90,60,280,160)+circle(230,140,65)+axis;
    }
    return wrap(body+caption);
  }

  if (kind === 'traffic') {
    return wrap(`<rect x="161" y="18" width="138" height="218" rx="18" fill="#102336" stroke="#facc15" stroke-width="2.5" stroke-dasharray="6,3"/><rect x="169" y="24" width="122" height="206" rx="14" fill="#152c42" stroke="#f0d29a" stroke-width="3.5"/><line x1="171" y1="93" x2="289" y2="93" stroke="#557a95" stroke-width="2"/><line x1="171" y1="161" x2="289" y2="161" stroke="#557a95" stroke-width="2"/><rect x="222" y="230" width="16" height="22" fill="#64748b" stroke="#94a3b8" stroke-width="1.5"/><path d="M196 58 A34 26 0 0 1 264 58" fill="none" stroke="#94a3b8" stroke-width="3.5"/><circle cx="230" cy="60" r="24" fill="#d34a50" stroke="white" stroke-width="2"/><path d="M196 125 A34 26 0 0 1 264 125" fill="none" stroke="#94a3b8" stroke-width="3.5"/><circle cx="230" cy="127" r="24" fill="#ffc457" stroke="white" stroke-width="2"/><path d="M196 192 A34 26 0 0 1 264 192" fill="none" stroke="#94a3b8" stroke-width="3.5"/><circle cx="230" cy="194" r="24" fill="#42c989" stroke="white" stroke-width="2"/><line x1="230" y1="14" x2="230" y2="246" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4,4"/><text x="310" y="64" font-size="13" fill="#fca5a5">Đỏ: (O₁, R)</text><text x="310" y="131" font-size="13" fill="#fde047">Vàng: (O₂, R)</text><text x="310" y="198" font-size="13" fill="#86efac">Xanh: (O₃, R)</text><text x="150" y="128" text-anchor="end" font-size="13" fill="#fde68a">Vỏ hộp a × b</text><text x="230" y="263" text-anchor="middle" font-size="12.5" fill="#cde4f0">Mô hình 2D khớp cấu trúc vật thể: chữ nhật bo góc + 3 đĩa tròn đồng trục</text>`);
  }
  if (kind === 'wheel') {
    return wrap(`<circle cx="230" cy="129" r="94" fill="none" stroke="#f4cf81" stroke-width="5"/><line x1="136" y1="129" x2="324" y2="129" stroke="#63e0cd" stroke-width="3"/><line x1="230" y1="129" x2="230" y2="35" stroke="#f19ca4" stroke-width="3"/><circle cx="230" cy="129" r="6" fill="white"/><text x="237" y="145" fill="white">O</text><text x="233" y="70" fill="white">r</text><text x="235" y="121" fill="white">d = 2r</text>`);
  }
  if (kind === 'clock') {
    return wrap(`<circle cx="230" cy="135" r="95" fill="none" stroke="#f4cf81" stroke-width="5"/>${Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI) / 6;
      return `<circle cx="${230 + 82 * Math.sin(a)}" cy="${135 - 82 * Math.cos(a)}" r="3" fill="#effaf8"/>`;
    }).join('')}<line x1="230" y1="135" x2="230" y2="72" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/><line x1="230" y1="135" x2="297" y2="135" stroke="#69d8d2" stroke-width="6" stroke-linecap="round"/><path d="M230 101 A34 34 0 0 1 264 135" fill="none" stroke="#ff9c69" stroke-width="3"/><text x="278" y="110" fill="white">90°</text>`);
  }
  if (kind === 'fish') {
    const fish = Array.from({ length: 5 }, (_, i) => {
      const x = 85 + (i % 3) * 135;
      const y = i < 3 ? 95 : 186;
      const active = !subset || i < 2;
      return `<g opacity="${active ? 1 : 0.3}"><ellipse cx="${x}" cy="${y}" rx="29" ry="17" fill="${i % 2 ? '#ffb16b' : '#62d9d3'}"/><path d="M${x - 22} ${y} l-28 -15 v30z" fill="#93cbff"/><circle cx="${x + 17}" cy="${y - 4}" r="3" fill="#10283e"/><text x="${x}" y="${y + 34}" fill="white" text-anchor="middle" font-size="13">c${i + 1}</text></g>`;
    }).join('');
    return wrap(`${fish}<text x="15" y="26" fill="#e7f5ff" font-size="17">${subset ? 'B = {c₁, c₂} ⊂ A' : 'A = {c₁, c₂, c₃, c₄, c₅}'}</text>`);
  }
  if (kind === 'giza' || kind === 'pyramid') {
    return wrap(`<polygon points="230,36 108,205 230,236 352,205" fill="#183f5b" stroke="#f4cf81" stroke-width="3.5"/><line x1="230" y1="36" x2="230" y2="236" stroke="#2dcab8" stroke-width="2.5"/><line x1="230" y1="36" x2="230" y2="195" stroke="#ff9c69" stroke-dasharray="5,4" stroke-width="2.5"/><text x="230" y="258" text-anchor="middle" fill="#e7f5ff" font-size="14">Hình chóp tứ giác đều lý tưởng hóa • V = ⅓ a²h</text>`);
  }
  if (kind === 'sydney' || kind === 'shells') {
    return wrap(`<path d="M95,210 Q145,65 215,210 Z" fill="#183f5b" stroke="#2dcab8" stroke-width="3"/><path d="M185,210 Q235,50 305,210 Z" fill="#1d4d6d" stroke="#f4cf81" stroke-width="3"/><path d="M275,210 Q315,95 365,210 Z" fill="#183f5b" stroke="#2dcab8" stroke-width="3"/><line x1="70" y1="210" x2="390" y2="210" stroke="#e7f5ff" stroke-width="3"/><text x="230" y="248" text-anchor="middle" fill="#e7f5ff" font-size="14">Các mảnh cắt mặt cầu lý tưởng hóa • x² + y² + z² = R²</text>`);
  }
  if (kind === 'eiffel' || kind === 'truss') {
    return wrap(`<polygon points="230,30 165,220 295,220" fill="none" stroke="#f4cf81" stroke-width="3.5"/><line x1="185" y1="160" x2="275" y2="160" stroke="#2dcab8" stroke-width="2.5"/><line x1="202" y1="105" x2="258" y2="105" stroke="#2dcab8" stroke-width="2.5"/><line x1="185" y1="160" x2="258" y2="105" stroke="#ff9c69" stroke-width="2"/><line x1="275" y1="160" x2="202" y2="105" stroke="#ff9c69" stroke-width="2"/><text x="230" y="250" text-anchor="middle" fill="#e7f5ff" font-size="14">Hệ giàn tam giác cứng &amp; trục đối xứng</text>`);
  }
  if (kind === 'golden' || kind === 'bridge') {
    return wrap(`<line x1="60" y1="185" x2="400" y2="185" stroke="#e7f5ff" stroke-width="4"/><line x1="130" y1="60" x2="130" y2="225" stroke="#ff9c69" stroke-width="6"/><line x1="330" y1="60" x2="330" y2="225" stroke="#ff9c69" stroke-width="6"/><path d="M130,70 Q230,180 330,70" fill="none" stroke="#f4cf81" stroke-width="3.5"/><text x="230" y="250" text-anchor="middle" fill="#e7f5ff" font-size="14">Đường cong dây cáp treo xấp xỉ parabol • y = ax² + h₀</text>`);
  }
  return wrap('<text x="230" y="135" text-anchor="middle" fill="white">Chọn mô hình 2D / 3D để khám phá</text>');
}
