import * as THREE from '../vendor/three.module.js?v=r107_v15';
import {obliqueSection} from './math/oblique-sections.js?v=r107_v15';
import {buildGeometry2DScene} from './math/geometry2d-scenes.js?v=r107_v15';
const C={face:0x31b9ce, edge:0xe5f7ff, orange:0xffb657, violet:0xa58cff, teal:0x49d2b8, red:0xff8d8d, grid:0x7990a8};
const v=(x,y,z=0)=>new THREE.Vector3(x,y,z);
const round=v=>Math.round(v*1000)/1000;
export function disposeObject(object) {
  object.traverse(o=>{
    if(o.geometry?.dispose) o.geometry.dispose();
    const mats=o.material? (Array.isArray(o.material)?o.material:[o.material]):[];
    for(const m of mats){ if(m.map?.dispose)m.map.dispose();if(m.dispose)m.dispose(); }
  });
}
// BỘ MÔ PHỎNG THIẾT DIỆN TOÁN HỌC THỰC
function createCrossSectionHelper(type, p) {
  const group = new THREE.Group();
  group.name = 'crossSectionGroup';
  group.visible = false;

  if (type === 'squarePyramid') {
    const a = p.a, h = p.h;
    group.updateSection = (tPercent = 50) => {
      while (group.children.length) {
        const c = group.children[0];
        disposeObject(c);
        group.remove(c);
      }
      const t = Math.max(1, Math.min(99, tPercent)) / 100;
      const y = -h / 2 + t * h;
      const curA = a * (1 - t);
      const halfA = curA / 2;

      const secGeo = new THREE.PlaneGeometry(curA, curA);
      const secMat = new THREE.MeshStandardMaterial({
        color: 0xff5722,
        transparent: true,
        opacity: 0.78,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const planeMesh = new THREE.Mesh(secGeo, secMat);
      planeMesh.rotation.x = -Math.PI / 2;
      planeMesh.position.set(0, y, 0);
      group.add(planeMesh);

      const edgesGeo = new THREE.EdgesGeometry(secGeo);
      const wire = new THREE.LineSegments(edgesGeo, new THREE.LineBasicMaterial({ color: 0xffd600, linewidth: 3 }));
      wire.rotation.x = -Math.PI / 2;
      wire.position.set(0, y, 0);
      group.add(wire);

      const dotMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b });
      for (const [px, pz] of [[-halfA, -halfA], [halfA, -halfA], [halfA, halfA], [-halfA, halfA]]) {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), dotMat);
        dot.position.set(px, y, pz);
        group.add(dot);
      }

      if (p.modeId === '11-09-C02') {
        // 11-09-C02: Khối chóp con đồng dạng S.A'B'C'D' tỉ số k = 1 - t và 4 tia vị tự từ đỉnh S
        const subH = Math.max(0.05, h * (1 - t));
        const subGeo = new THREE.ConeGeometry(curA / Math.SQRT2, subH, 4, 1);
        subGeo.rotateY(Math.PI / 4);
        const subMesh = new THREE.Mesh(subGeo, new THREE.MeshStandardMaterial({
          color: 0x7c3aed, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false
        }));
        subMesh.position.set(0, y + subH / 2, 0);
        group.add(subMesh);
        for (const [px, pz] of [[-halfA, -halfA], [halfA, -halfA], [halfA, halfA], [-halfA, halfA]]) {
          const rayGeo = new THREE.BufferGeometry().setFromPoints([v(0, h / 2, 0), v(px, y, pz)]);
          group.add(new THREE.Line(rayGeo, new THREE.LineBasicMaterial({ color: 0xc4b5fd, linewidth: 2 })));
        }
      } else {
        // 8-09-C04: Xếp các lớp tháp vuông (Riemann pyramid slabs) từ đáy -h/2 lên đến mặt cắt y
        const nSlabs = 5;
        for (let i = 0; i < nSlabs; i++) {
          const f0 = (i / nSlabs) * t, f1 = ((i + 1) / nSlabs) * t;
          const slabH = Math.max(0.02, (f1 - f0) * h * 0.9);
          const slabA = a * (1 - (f0 + f1) * 0.5);
          const slabY = -h / 2 + ((f0 + f1) * 0.5) * h;
          const slabGeo = new THREE.BoxGeometry(slabA, slabH, slabA);
          const slabMesh = new THREE.Mesh(slabGeo, new THREE.MeshStandardMaterial({
            color: i % 2 === 0 ? 0x0284c7 : 0x0d9488, transparent: true, opacity: 0.34, depthWrite: false
          }));
          slabMesh.position.set(0, slabY, 0);
          group.add(slabMesh);
        }
      }

      return {
        shapeName: 'Hình vuông đồng dạng đáy',
        side: Math.round(curA * 100) / 100,
        area: Math.round(curA * curA * 100) / 100,
        baseArea: Math.round(a * a * 100) / 100,
        ratio: Math.round(((1 - t) ** 2) * 100) / 100,
        height: Math.round(t * h * 100) / 100
      };
    };
    group.updateSection(50);
  } else if (type === 'cube' || type === 'cuboid') {
    const a = p.a, b = type === 'cube' ? p.a : p.b, h = type === 'cube' ? p.a : p.h;
    group.updateSection = (tPercent = 50) => {
      while (group.children.length) {
        const c = group.children[0];
        disposeObject(c);
        group.remove(c);
      }
      const t = Math.max(1, Math.min(99, tPercent)) / 100;
      const y = -h / 2 + t * h;

      const secGeo = new THREE.PlaneGeometry(a, b);
      const secMat = new THREE.MeshStandardMaterial({
        color: 0xff5722,
        transparent: true,
        opacity: 0.78,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const planeMesh = new THREE.Mesh(secGeo, secMat);
      planeMesh.rotation.x = -Math.PI / 2;
      planeMesh.position.set(0, y, 0);
      group.add(planeMesh);

      const edgesGeo = new THREE.EdgesGeometry(secGeo);
      const wire = new THREE.LineSegments(edgesGeo, new THREE.LineBasicMaterial({ color: 0xffd600, linewidth: 3 }));
      wire.rotation.x = -Math.PI / 2;
      wire.position.set(0, y, 0);
      group.add(wire);

      const dotMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b });
      for (const [px, pz] of [[-a / 2, -b / 2], [a / 2, -b / 2], [a / 2, b / 2], [-a / 2, b / 2]]) {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), dotMat);
        dot.position.set(px, y, pz);
        group.add(dot);
      }

      // 7-08-C04: Khối thể tích tích lũy a × b × (t·h) dâng từ đáy lên mặt cắt y
      const fillH = Math.max(0.04, t * h);
      const fillGeo = new THREE.BoxGeometry(a * 0.98, fillH, b * 0.98);
      const fillMesh = new THREE.Mesh(fillGeo, new THREE.MeshStandardMaterial({
        color: 0x0284c7, transparent: true, opacity: 0.36, depthWrite: false
      }));
      fillMesh.position.set(0, -h / 2 + fillH / 2, 0);
      group.add(fillMesh);

      return {
        shapeName: type === 'cube' ? 'Hình vuông bằng đáy' : 'Hình chữ nhật bằng đáy',
        sideA: a,
        sideB: b,
        area: Math.round(a * b * 100) / 100,
        baseArea: Math.round(a * b * 100) / 100,
        ratio: 1.0,
        height: Math.round(t * h * 100) / 100
      };
    };
    group.updateSection(50);
  } else if (type === 'trianglePyramid' || type === 'tetrahedron' || type === 'triPrism' || type === 'triangularPrism') {
    const isPrism = type === 'triPrism' || type === 'triangularPrism';
    const a = p.a || 3.5;
    const h = type === 'tetrahedron' ? a * Math.sqrt(2 / 3) : (p.h || 4);
    group.updateSection = (tPercent = 50) => {
      while (group.children.length) {
        const c = group.children[0];
        disposeObject(c);
        group.remove(c);
      }
      const t = Math.max(1, Math.min(99, tPercent)) / 100;
      const y = -h / 2 + t * h;
      const scale = isPrism ? 1 : (1 - t);
      const curA = a * scale;
      const R = curA / Math.sqrt(3), rIn = curA / (2 * Math.sqrt(3));
      const pts = [[-curA / 2, rIn], [curA / 2, rIn], [0, -R]];
      const pos = new Float32Array([
        pts[0][0], y, pts[0][1],
        pts[1][0], y, pts[1][1],
        pts[2][0], y, pts[2][1]
      ]);
      const secGeo = new THREE.BufferGeometry();
      secGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      secGeo.computeVertexNormals();
      const secMat = new THREE.MeshStandardMaterial({
        color: 0xff5722,
        transparent: true,
        opacity: 0.78,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      group.add(new THREE.Mesh(secGeo, secMat));
      const loopPts = [...pts, pts[0]].map(([px, pz]) => new THREE.Vector3(px, y, pz));
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(loopPts), new THREE.LineBasicMaterial({ color: 0xffd600, linewidth: 3 })));
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b });
      for (const [px, pz] of pts) {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), dotMat);
        dot.position.set(px, y, pz);
        group.add(dot);
      }
      if (isPrism) {
        if (p.modeId === '11-09-C01') {
          // 11-09-C01: Hai thiết diện tam giác song song đối chiếu nguyên lý Cavalieri S(z₁) = S(z₂) = B
          const y2 = -h / 2 + Math.max(0.08, Math.min(0.92, 1 - t * 0.65)) * h;
          const pos2 = new Float32Array([pts[0][0], y2, pts[0][1], pts[1][0], y2, pts[1][1], pts[2][0], y2, pts[2][1]]);
          const secGeo2 = new THREE.BufferGeometry();
          secGeo2.setAttribute('position', new THREE.BufferAttribute(pos2, 3));
          secGeo2.computeVertexNormals();
          group.add(new THREE.Mesh(secGeo2, new THREE.MeshStandardMaterial({
            color: 0x16a34a, transparent: true, opacity: 0.65, side: THREE.DoubleSide, depthWrite: false
          })));
          const loopPts2 = [...pts, pts[0]].map(([px, pz]) => new THREE.Vector3(px, y2, pz));
          group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(loopPts2), new THREE.LineBasicMaterial({ color: 0x4ade80, linewidth: 2 })));
          for (const [px, pz] of pts) {
            const pillar = new THREE.BufferGeometry().setFromPoints([v(px, y, pz), v(px, y2, pz)]);
            group.add(new THREE.Line(pillar, new THREE.LineBasicMaterial({ color: 0xfde047, linewidth: 2 })));
          }
        } else {
          // 7-09-C04: Khối lăng trụ tích lũy từ đáy dưới -h/2 lên mặt cắt y (V = S_đáy · z)
          const sideBuf = [];
          const y0 = -h / 2;
          for (let k = 0; k < 3; k++) {
            const [x1, z1] = pts[k], [x2, z2] = pts[(k + 1) % 3];
            sideBuf.push(x1, y0, z1, x2, y0, z2, x2, y, z2, x1, y0, z1, x2, y, z2, x1, y, z1);
          }
          const sideGeo = new THREE.BufferGeometry();
          sideGeo.setAttribute('position', new THREE.Float32BufferAttribute(sideBuf, 3));
          sideGeo.computeVertexNormals();
          group.add(new THREE.Mesh(sideGeo, new THREE.MeshStandardMaterial({
            color: 0x0d9488, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false
          })));
        }
      }
      const baseArea = (a * a * Math.sqrt(3)) / 4;
      const curArea = baseArea * scale * scale;
      return {
        shapeName: isPrism ? 'Tam giác đều bằng đáy' : 'Tam giác đều đồng dạng đáy',
        side: Math.round(curA * 100) / 100,
        area: Math.round(curArea * 100) / 100,
        baseArea: Math.round(baseArea * 100) / 100,
        ratio: Math.round(scale * scale * 100) / 100,
        height: Math.round(t * h * 100) / 100
      };
    };
    group.updateSection(50);
  } else if (type === 'prismQuad' || type === 'quadPrism' || type === 'frustumPyramid') {
    const a1 = p.a || 4, b1 = p.b || p.h_base || p.a || 3, h = p.h || 4;
    const isFrustum = type === 'frustumPyramid';
    const a2 = isFrustum ? (p.b || 2) : a1;
    group.updateSection = (tPercent = 50) => {
      while (group.children.length) {
        const c = group.children[0];
        disposeObject(c);
        group.remove(c);
      }
      const t = Math.max(1, Math.min(99, tPercent)) / 100;
      const y = -h / 2 + t * h;
      const curA = isFrustum ? (a1 + (a2 - a1) * t) : a1;
      const curB = isFrustum ? curA : b1;
      const secGeo = new THREE.PlaneGeometry(curA, curB);
      const planeMesh = new THREE.Mesh(secGeo, new THREE.MeshStandardMaterial({
        color: 0xff5722, transparent: true, opacity: 0.78, side: THREE.DoubleSide, depthWrite: false
      }));
      planeMesh.rotation.x = -Math.PI / 2;
      planeMesh.position.set(0, y, 0);
      group.add(planeMesh);
      const wire = new THREE.LineSegments(new THREE.EdgesGeometry(secGeo), new THREE.LineBasicMaterial({ color: 0xffd600, linewidth: 3 }));
      wire.rotation.x = -Math.PI / 2;
      wire.position.set(0, y, 0);
      group.add(wire);
      if (isFrustum) {
        // 11-09-C03: 4 đường cao góc hạ từ 4 đỉnh đáy nhỏ A'B'C'D' xuống đáy lớn ABCD tách chóp cụt
        const half2 = a2 / 2;
        for (const [px, pz] of [[-half2, -half2], [half2, -half2], [half2, half2], [-half2, half2]]) {
          const dropGeo = new THREE.BufferGeometry().setFromPoints([v(px, h / 2, pz), v(px, -h / 2, pz)]);
          group.add(new THREE.Line(dropGeo, new THREE.LineBasicMaterial({ color: 0xc084fc, linewidth: 2 })));
          const foot = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), new THREE.MeshBasicMaterial({ color: 0xc084fc }));
          foot.position.set(px, -h / 2, pz);
          group.add(foot);
        }
      }
      return {
        shapeName: isFrustum ? 'Hình vuông thiết diện song song đáy' : 'Tứ giác thiết diện song song đáy',
        side: Math.round(curA * 100) / 100,
        area: Math.round(curA * curB * 100) / 100,
        baseArea: Math.round(a1 * b1 * 100) / 100,
        ratio: Math.round((curA * curB) / (a1 * b1) * 100) / 100,
        height: Math.round(t * h * 100) / 100
      };
    };
    group.updateSection(50);
  } else if (type === 'cylinder' || type === 'cone') {
    const r = p.r || 2.5, h = p.h || 4;
    const isCone = type === 'cone';
    group.updateSection = (tPercent = 50) => {
      while (group.children.length) {
        const c = group.children[0];
        disposeObject(c);
        group.remove(c);
      }
      const t = Math.max(1, Math.min(99, tPercent)) / 100;
      const y = -h / 2 + t * h;
      const curR = isCone ? Math.max(0.05, r * (1 - t)) : r;
      const secGeo = new THREE.CircleGeometry(curR, 48);
      const planeMesh = new THREE.Mesh(secGeo, new THREE.MeshStandardMaterial({
        color: 0xff5722, transparent: true, opacity: 0.78, side: THREE.DoubleSide, depthWrite: false
      }));
      planeMesh.rotation.x = -Math.PI / 2;
      planeMesh.position.set(0, y, 0);
      group.add(planeMesh);
      if (!isCone) {
        // 9-09-C03: Cột thể tích hình trụ V(z) = πr²·z dâng từ đáy dưới lên mặt cắt y
        const fillH = Math.max(0.04, t * h);
        const colMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(r * 0.97, r * 0.97, fillH, 40),
          new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.38, depthWrite: false })
        );
        colMesh.position.set(0, -h / 2 + fillH / 2, 0);
        group.add(colMesh);
      } else {
        // 9-10-C03: Các đĩa tròn đồng dạng r(z) = r(1 − z/h) xếp chồng từ đáy nón lên mặt cắt y
        const nDisks = 5;
        for (let i = 0; i < nDisks; i++) {
          const f0 = (i / nDisks) * t, f1 = ((i + 1) / nDisks) * t;
          const dH = Math.max(0.02, (f1 - f0) * h * 0.88);
          const dR = Math.max(0.05, r * (1 - (f0 + f1) * 0.5));
          const dY = -h / 2 + ((f0 + f1) * 0.5) * h;
          const diskMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(dR, dR, dH, 36),
            new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0xd97706 : 0x0d9488, transparent: true, opacity: 0.36, depthWrite: false })
          );
          diskMesh.position.set(0, dY, 0);
          group.add(diskMesh);
        }
      }
      return {
        shapeName: 'Hình tròn thiết diện vuông góc trục',
        radius: Math.round(curR * 100) / 100,
        area: Math.round(Math.PI * curR * curR * 100) / 100,
        height: Math.round(t * h * 100) / 100
      };
    };
    group.updateSection(50);
  }

  return group;
}

/** Accurate plane/cube and plane/pyramid sections. Full solid stays visible for context. */
function createObliqueSectionHelper(type,p){
  const group=new THREE.Group();group.visible=false;group.name='obliqueSectionGroup';
  group.updateSection=(pct=50,deg=0,mnp=null)=>{
    for(const child of [...group.children]){group.remove(child);disposeObject(child);}
    const result=obliqueSection(type,p,pct,deg,mnp);
    group.userData.section=result;
    if(!result||result.vertices.length<3)return result;
    const vertices=result.vertices;
    const fan=[];
    for(let i=1;i<vertices.length-1;i++)fan.push(...vertices[0],...vertices[i],...vertices[i+1]);
    const geom=new THREE.BufferGeometry();
    geom.setAttribute('position',new THREE.Float32BufferAttribute(fan,3));geom.computeVertexNormals();
    const face=new THREE.Mesh(geom,new THREE.MeshBasicMaterial({color:0xffa544,transparent:true,opacity:.73,side:THREE.DoubleSide,depthWrite:false}));
    face.renderOrder=4;group.add(face);
    const boundary=new THREE.BufferGeometry().setFromPoints([...vertices,vertices[0]].map(v=>new THREE.Vector3(...v)));
    const wire=new THREE.Line(boundary,new THREE.LineBasicMaterial({color:0x902e19,depthTest:false}));
    wire.renderOrder=5;group.add(wire);
    return result;
  };
  return group;
}

// BỘ TRẢI HÌNH KHÔNG GIAN (NET UNFOLDING — BÓC TÁCH TỪ KHỐI 3D TRẢI RA MẶT PHẲNG ĐÁY)
function createUnfoldHelper(type, p) {
  const group = new THREE.Group();
  group.name = 'unfoldGroup';
  group.visible = false;

  const makePolyGeoXZ = (pts2d) => {
    const pos = [];
    for (let i = 1; i < pts2d.length - 1; i++) {
      pos.push(
        pts2d[0][0], 0, pts2d[0][1],
        pts2d[i][0], 0, pts2d[i][1],
        pts2d[i + 1][0], 0, pts2d[i + 1][1]
      );
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.computeVertexNormals();
    return geo;
  };

  const addFlatMeshXZ = (parent, pts2d, color) => {
    const geo = makePolyGeoXZ(pts2d);
    const mat = new THREE.MeshStandardMaterial({
      color,
      side: THREE.DoubleSide,
      roughness: 0.36,
      metalness: 0.08
    });
    const mesh = new THREE.Mesh(geo, mat);
    parent.add(mesh);
    const loopPts = [...pts2d, pts2d[0]].map(([x, z]) => new THREE.Vector3(x, 0, z));
    const wireGeo = new THREE.BufferGeometry().setFromPoints(loopPts);
    const wire = new THREE.Line(wireGeo, new THREE.LineBasicMaterial({ color: 0xffffff }));
    parent.add(wire);
    return mesh;
  };

  const addHingedFace = (P, Q, yBase, facePts2d, color) => {
    const mx = (P[0] + Q[0]) / 2, mz = (P[1] + Q[1]) / 2;
    const dx = Q[0] - P[0], dz = Q[1] - P[1];
    const len = Math.hypot(dx, dz) || 1;
    let nx = -dz / len, nz = dx / len;
    if (nx * mx + nz * mz < 0) { nx = -nx; nz = -nz; }
    const edgeFrame = new THREE.Group();
    edgeFrame.position.set(mx, yBase, mz);
    edgeFrame.rotation.y = Math.atan2(nx, nz);
    const hinge = new THREE.Group();
    addFlatMeshXZ(hinge, facePts2d, color);
    edgeFrame.add(hinge);
    group.add(edgeFrame);
    return { hinge, len, rIn: Math.hypot(mx, mz) };
  };

  if (type === 'squarePyramid') {
    const a = p.a || 4, h = p.h || 4, halfA = a / 2, yBase = -h / 2;
    const s = Math.hypot(h, halfA);
    const thetaFolded = Math.PI - Math.acos(halfA / s);

    const baseGroup = new THREE.Group();
    baseGroup.position.set(0, yBase, 0);
    const sqPts = [[-halfA, -halfA], [halfA, -halfA], [halfA, halfA], [-halfA, halfA]];
    addFlatMeshXZ(baseGroup, sqPts, 0x1d4ed8);
    group.add(baseGroup);

    const colors = [0xb45309, 0x6d28d9, 0xb45309, 0x6d28d9];
    const hinges = [];
    for (let i = 0; i < 4; i++) {
      const P = sqPts[i], Q = sqPts[(i + 1) % 4];
      const { hinge } = addHingedFace(
        P, Q, yBase,
        [[-halfA, 0], [halfA, 0], [0, s]],
        colors[i]
      );
      hinges.push(hinge);
    }

    group.setUnfold = (progress) => {
      const theta = (1 - progress) * thetaFolded;
      for (const hng of hinges) {
        hng.rotation.x = -theta;
      }
    };
    group.setUnfold(0);
  } else if (type === 'openTopBox') {
    // Open-top box from a square sheet L x L after cutting x x x corners.
    // Full surface contains (L-2x)^2 base and four x-height side walls.
    const L=p.L||5, cut=Math.max(0.01,Math.min((p.cut||1),L/2-.1));
    const a=L-2*cut, half=a/2, baseY=-cut/2;
    const footprint=[[-half,-half],[half,-half],[half,half],[-half,half]];
    const base=new THREE.Group();base.position.y=baseY;
    addFlatMeshXZ(base,footprint,0x1d4ed8);group.add(base);
    const hinges=[];
    for(let i=0;i<4;i++){
      const P=footprint[i],Q=footprint[(i+1)%4];
      const {hinge}=addHingedFace(P,Q,baseY,[[-a/2,0],[a/2,0],[a/2,cut],[-a/2,cut]],
        i%2?0x6d28d9:0xb45309);
      hinges.push(hinge);
    }
    group.setUnfold=progress=>{
      const theta=(1-Math.max(0,Math.min(1,progress)))*Math.PI/2;
      for(const hinge of hinges)hinge.rotation.x=-theta;
    };
    group.setUnfold(0);
  } else if (type === 'cube' || type === 'cuboid' || type === 'quadPrism' || type === 'prismQuad') {
    const a = p.a || 3;
    const b = type === 'cube' ? a : (p.b || p.h_base || 2);
    const h = type === 'cube' ? a : (p.h || 4);
    const halfA = a / 2, halfB = b / 2, yBase = -h / 2;

    const baseGroup = new THREE.Group();
    baseGroup.position.set(0, yBase, 0);
    const rectPts = [[-halfA, -halfB], [halfA, -halfB], [halfA, halfB], [-halfA, halfB]];
    addFlatMeshXZ(baseGroup, rectPts, 0x1d4ed8);
    group.add(baseGroup);

    const colors = [0xb45309, 0x6d28d9, 0xb45309, 0x15803d];
    const hinges = [];
    let topHinge = null;
    for (let i = 0; i < 4; i++) {
      const P = rectPts[i], Q = rectPts[(i + 1) % 4];
      const w = Math.hypot(Q[0] - P[0], Q[1] - P[1]);
      const { hinge } = addHingedFace(
        P, Q, yBase,
        [[-w / 2, 0], [w / 2, 0], [w / 2, h], [-w / 2, h]],
        colors[i]
      );
      hinges.push(hinge);
      if (i === 2) {
        // Cạnh trước z = +halfB: gắn nắp đáy trên tại mép z = h
        topHinge = new THREE.Group();
        topHinge.position.set(0, 0, h);
        addFlatMeshXZ(topHinge, [[-halfA, 0], [halfA, 0], [halfA, b], [-halfA, b]], 0x1d4ed8);
        hinge.add(topHinge);
      }
    }

    group.setUnfold = (progress) => {
      const theta = (1 - progress) * (Math.PI / 2);
      for (const hng of hinges) hng.rotation.x = -theta;
      if (topHinge) topHinge.rotation.x = -theta;
    };
    group.setUnfold(0);
  } else if (type === 'triangularPrism' || type === 'triPrism' || type === 'trianglePyramid' || type === 'tetrahedron') {
    const isPrism = type === 'triangularPrism' || type === 'triPrism';
    const a = p.a || 3.5;
    const h = type === 'tetrahedron' ? a * Math.sqrt(2 / 3) : (p.h || 4);
    const yBase = -h / 2;
    const R = a / Math.sqrt(3), rIn = a / (2 * Math.sqrt(3));
    const triPts = [
      [-a / 2, rIn],
      [a / 2, rIn],
      [0, -R]
    ];

    const baseGroup = new THREE.Group();
    baseGroup.position.set(0, yBase, 0);
    addFlatMeshXZ(baseGroup, triPts, 0x1d4ed8);
    group.add(baseGroup);

    const colors = [0xb45309, 0x6d28d9, 0x15803d];
    const hinges = [];
    let topHinge = null;
    const s = Math.hypot(h, rIn);
    const thetaFolded = isPrism ? (Math.PI / 2) : (Math.PI - Math.acos(rIn / s));

    for (let i = 0; i < 3; i++) {
      const P = triPts[i], Q = triPts[(i + 1) % 3];
      const facePts = isPrism
        ? [[-a / 2, 0], [a / 2, 0], [a / 2, h], [-a / 2, h]]
        : [[-a / 2, 0], [a / 2, 0], [0, s]];
      const { hinge } = addHingedFace(P, Q, yBase, facePts, colors[i]);
      hinges.push(hinge);
      if (isPrism && i === 0) {
        // Gắn đáy trên tam giác đều vào mép trên của mặt bên phía trước
        const hTri = a * Math.sqrt(3) / 2;
        topHinge = new THREE.Group();
        topHinge.position.set(0, 0, h);
        addFlatMeshXZ(topHinge, [[-a / 2, 0], [a / 2, 0], [0, hTri]], 0x1d4ed8);
        hinge.add(topHinge);
      }
    }

    group.setUnfold = (progress) => {
      const theta = (1 - progress) * thetaFolded;
      for (const hng of hinges) hng.rotation.x = -theta;
      if (topHinge) topHinge.rotation.x = -theta;
    };
    group.setUnfold(0);
  } else if (type === 'frustumPyramid' || type === 'chopcut4') {
    const a1 = p.a || p.a1 || 4, a2 = p.b || p.a2 || 2, h = p.h || 4;
    const halfA1 = a1 / 2, halfA2 = a2 / 2, yBase = -h / 2;
    const s = Math.hypot(h, halfA1 - halfA2);
    const thetaFolded = Math.PI - Math.atan2(h, halfA1 - halfA2);

    const baseGroup = new THREE.Group();
    baseGroup.position.set(0, yBase, 0);
    const sqPts = [[-halfA1, -halfA1], [halfA1, -halfA1], [halfA1, halfA1], [-halfA1, halfA1]];
    addFlatMeshXZ(baseGroup, sqPts, 0x1d4ed8);
    group.add(baseGroup);

    const colors = [0xb45309, 0x6d28d9, 0xb45309, 0x15803d];
    const hinges = [];
    let topHinge = null;
    for (let i = 0; i < 4; i++) {
      const P = sqPts[i], Q = sqPts[(i + 1) % 4];
      const trapPts = [[-halfA1, 0], [halfA1, 0], [halfA2, s], [-halfA2, s]];
      const { hinge } = addHingedFace(P, Q, yBase, trapPts, colors[i]);
      hinges.push(hinge);
      if (i === 2) {
        topHinge = new THREE.Group();
        topHinge.position.set(0, 0, s);
        const topPts = [[-halfA2, 0], [halfA2, 0], [halfA2, a2], [-halfA2, a2]];
        addFlatMeshXZ(topHinge, topPts, 0x1d4ed8);
        hinge.add(topHinge);
      }
    }

    group.setUnfold = (progress) => {
      const theta = (1 - progress) * thetaFolded;
      for (const hng of hinges) hng.rotation.x = -theta;
      if (topHinge) topHinge.rotation.x = -theta;
    };
    group.setUnfold(0);
  } else if (type === 'cylinder' || type === 'tru') {
    const r = p.r || 2.5, h = p.h || 4, yBase = -h / 2;
    const circumference = 2 * Math.PI * r;

    const lateralParent = new THREE.Group();
    lateralParent.position.set(0, 0, 0);
    group.add(lateralParent);

    const botDisk = new THREE.Group();
    botDisk.position.set(0, yBase, 0);
    const diskGeo1 = new THREE.CircleGeometry(r, 48);
    diskGeo1.rotateX(-Math.PI / 2);
    botDisk.add(new THREE.Mesh(diskGeo1, new THREE.MeshStandardMaterial({color: 0x1d4ed8, side: THREE.DoubleSide})));
    group.add(botDisk);

    const topDisk = new THREE.Group();
    topDisk.position.set(0, yBase + h, 0);
    const diskGeo2 = new THREE.CircleGeometry(r, 48);
    diskGeo2.rotateX(-Math.PI / 2);
    topDisk.add(new THREE.Mesh(diskGeo2, new THREE.MeshStandardMaterial({color: 0x1d4ed8, side: THREE.DoubleSide})));
    group.add(topDisk);

    const latGeo = new THREE.PlaneGeometry(circumference, h, 48, 1);
    const latMat = new THREE.MeshStandardMaterial({color: 0xb45309, side: THREE.DoubleSide, roughness: 0.35});
    const latMesh = new THREE.Mesh(latGeo, latMat);
    lateralParent.add(latMesh);
    // Never integrate from already morphed geometry: scrubbing 0→100→0
    // must reproduce exactly the same full-width net on each attempt.
    const lateralOrigin=Float32Array.from(latGeo.attributes.position.array);

    group.setUnfold = (progress) => {
      const t = Math.max(0, Math.min(1, progress));
      const pos = latGeo.attributes.position;
      const factor = 1 - t;
      const R = factor > 0.001 ? r / factor : 1e9;
      for (let i = 0; i < pos.count; i++) {
        const u = (lateralOrigin[i*3] / circumference) + 0.5;
        const y = lateralOrigin[i*3+1];
        if (factor <= 0.001) {
          pos.setXYZ(i, (u - 0.5) * circumference, y, 0);
        } else {
          const phi = (u - 0.5) * factor * 2 * Math.PI;
          pos.setXYZ(i, R * Math.sin(phi), y, R * (1 - Math.cos(phi)) - r * (1 - t));
        }
      }
      pos.needsUpdate = true;
      latGeo.computeVertexNormals();

      // Wrapped state: disks close the ends of the cylinder centered at z=0.
      // Flat state: both disks lie outside the rectangular mantle, without overlap.
      botDisk.position.set(0, yBase - r * t, 0);
      botDisk.rotation.x = -t * (Math.PI / 2);
      topDisk.position.set(0, yBase + h + r * t, 0);
      topDisk.rotation.x = t * (Math.PI / 2);
    };
    group.setUnfold(0);
  } else if (type === 'cone' || type === 'non') {
    const r = p.r || 3, h = p.h || 4, yBase = -h / 2;
    const l = Math.hypot(r, h);
    const thetaSec = (2 * Math.PI * r) / l;

    const coneParent = new THREE.Group();
    coneParent.position.set(0, 0, 0);
    group.add(coneParent);

    const ringGeo = new THREE.RingGeometry(0.01, l, 64, 1, 0, thetaSec);
    ringGeo.rotateX(-Math.PI / 2);
    const sectorMesh = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({color: 0xb45309, side: THREE.DoubleSide, roughness: 0.35}));
    coneParent.add(sectorMesh);

    const botDisk = new THREE.Group();
    botDisk.position.set(0, yBase, 0);
    const diskGeo = new THREE.CircleGeometry(r, 48);
    diskGeo.rotateX(-Math.PI / 2);
    botDisk.add(new THREE.Mesh(diskGeo, new THREE.MeshStandardMaterial({color: 0x1d4ed8, side: THREE.DoubleSide})));
    group.add(botDisk);

    // Smooth polar/conical unrolling from 3D cone (t=0) to centered planar sector (t=1) without self-intersection
    const orig=Float32Array.from(ringGeo.attributes.position.array);
    group.setUnfold = (progress) => {
      const t = Math.max(0, Math.min(1, progress));
      const pos=ringGeo.attributes.position;
      const cx = -0.35 * l * t;
      for(let i=0;i<pos.count;i++){
        const x0=orig[i*3],z0=orig[i*3+2],rho=Math.hypot(x0,z0);
        const alpha=(Math.atan2(-z0,x0)+2*Math.PI)%(2*Math.PI);
        const uFrac = alpha / Math.max(1e-6, thetaSec) - 0.5;
        const phi0 = uFrac * 2 * Math.PI;
        const phi1 = uFrac * thetaSec;
        const phiCur = phi0 * (1 - t) + phi1 * t;
        const r0 = rho * (r / l);
        const rCur = r0 * (1 - t) + rho * t;
        const y0 = h / 2 - rho * (h / l);
        const yCur = y0 * (1 - t) + yBase * t;
        pos.setXYZ(i, cx + rCur * Math.cos(phiCur), yCur, -rCur * Math.sin(phiCur));
      }
      pos.needsUpdate=true;ringGeo.computeVertexNormals();
      botDisk.position.set((0.65 * l + r + 0.25) * t, yBase, 0);
      botDisk.rotation.x=0; // bottom disk remains coplanar with the sector net
    };
    group.setUnfold(0);
  } else if (type === 'conicalFrustum' || type === 'noncut') {
    const R = p.R || p.a || 3.5, r = p.r || p.b || 2, h = p.h || 4, yBase = -h / 2;
    const slant = Math.hypot(h, R - r);
    const rOuter = slant * R / (R - r);
    const rInner = slant * r / (R - r);
    const thetaFrust = (2 * Math.PI * R) / rOuter;

    const frustParent = new THREE.Group();
    group.add(frustParent);

    const ringGeo = new THREE.RingGeometry(rInner, rOuter, 64, 1, 0, thetaFrust);
    ringGeo.rotateX(-Math.PI / 2);
    const annMesh = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({color: 0xb45309, side: THREE.DoubleSide, roughness: 0.35}));
    frustParent.add(annMesh);

    const botDisk = new THREE.Group();
    botDisk.position.set(0, yBase, 0);
    const dGeo1 = new THREE.CircleGeometry(R, 48);
    dGeo1.rotateX(-Math.PI / 2);
    botDisk.add(new THREE.Mesh(dGeo1, new THREE.MeshStandardMaterial({color: 0x1d4ed8, side: THREE.DoubleSide})));
    group.add(botDisk);

    const topDisk = new THREE.Group();
    topDisk.position.set(0, yBase + h, 0);
    const dGeo2 = new THREE.CircleGeometry(r, 48);
    dGeo2.rotateX(-Math.PI / 2);
    topDisk.add(new THREE.Mesh(dGeo2, new THREE.MeshStandardMaterial({color: 0x1d4ed8, side: THREE.DoubleSide})));
    group.add(topDisk);

    // Frustum net is an annular sector. Both boundary circles have correct
    // arc lengths 2*pi*R and 2*pi*r, respectively; no face resizing at t=1.
    const orig=Float32Array.from(ringGeo.attributes.position.array);
    group.setUnfold = (progress) => {
      const t = Math.max(0, Math.min(1, progress));
      const pos=ringGeo.attributes.position;
      for(let i=0;i<pos.count;i++){
        const x0=orig[i*3],z0=orig[i*3+2],rho=Math.hypot(x0,z0);
        const alpha=(Math.atan2(-z0,x0)+2*Math.PI)%(2*Math.PI);
        const phi=alpha*rOuter/R;
        const rr=rho*R/rOuter;
        const folded=[rr*Math.cos(phi),h/2-(rho-rInner)*h/slant,rr*Math.sin(phi)];
        const flat=[x0,yBase,z0];
        pos.setXYZ(i,...folded.map((v,k)=>v*(1-t)+flat[k]*t));
      }
      pos.needsUpdate=true;ringGeo.computeVertexNormals();
      botDisk.position.set((rOuter+R+.35)*t,yBase,0);
      topDisk.position.set((rOuter+r+.35)*t,yBase,2*r+1);
      botDisk.rotation.x=0;topDisk.rotation.x=0;
    };
    group.setUnfold(0);
  }

  return group;
}

// BỘ DỰNG HÌNH & NHẤN MẠNH ĐỐI TƯỢNG 3D ĐỒNG BỘ 4 PHA (CHO CÁC LAB NHẬN BIẾT / TÍNH CHẤT KHỐI 3D)
function createBuildHelper(type, p) {
  const group = new THREE.Group();
  group.name = 'buildGroup';
  group.visible = false;

  const clearGroup = () => {
    while (group.children.length) {
      const c = group.children[0];
      disposeObject(c);
      group.remove(c);
    }
  };

  const addTube = (p1, p2, color = 0xffb657, radius = 0.055) => {
    const v1 = Array.isArray(p1) ? v(...p1) : p1.clone();
    const v2 = Array.isArray(p2) ? v(...p2) : p2.clone();
    const dir = new THREE.Vector3().subVectors(v2, v1);
    const len = dir.length();
    if (len < 1e-4) return null;
    const geom = new THREE.CylinderGeometry(radius, radius, len, 14);
    const mat = new THREE.MeshStandardMaterial({
      color, roughness: 0.25, metalness: 0.12, emissive: color, emissiveIntensity: 0.38
    });
    const cyl = new THREE.Mesh(geom, mat);
    cyl.position.copy(v1).addScaledVector(dir, 0.5);
    cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    group.add(cyl);
    return cyl;
  };

  const addSphere = (pt, color = 0xffeb3b, r = 0.11) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), new THREE.MeshBasicMaterial({ color }));
    m.position.copy(Array.isArray(pt) ? v(...pt) : pt);
    group.add(m);
    return m;
  };

  const addPolyFace = (pts3d, color = 0xb45309, opacity = 0.58) => {
    const buf = [];
    for (let i = 1; i < pts3d.length - 1; i++) {
      buf.push(...pts3d[0], ...pts3d[i], ...pts3d[i + 1]);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(buf, 3));
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false
    }));
    group.add(mesh);
    const loopPts = [...pts3d, pts3d[0]].map(pt => v(...pt));
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(loopPts), new THREE.LineBasicMaterial({ color: 0x0f172a, linewidth: 2.5 })));
    return mesh;
  };

  const addRightAngle = (vertex, dir1, dir2, size = 0.3, color = 0x6d28d9) => {
    const v0 = Array.isArray(vertex) ? v(...vertex) : vertex.clone();
    const d1 = (Array.isArray(dir1) ? v(...dir1) : dir1.clone()).normalize().multiplyScalar(size);
    const d2 = (Array.isArray(dir2) ? v(...dir2) : dir2.clone()).normalize().multiplyScalar(size);
    const pA = v0.clone().add(d1);
    const pCorner = v0.clone().add(d1).add(d2);
    const pB = v0.clone().add(d2);
    addTube(pA, pCorner, color, 0.024);
    addTube(pCorner, pB, color, 0.024);
  };

  group.updateBuild = (progress = 1) => {
    clearGroup();
    const u = Math.max(0, Math.min(1, Number(progress) || 0));

    if (type === 'cuboid') {
      // 7-08-C01: Hình hộp chữ nhật — Đáy ABCD + đường chéo đáy AC -> 4 mặt bên & nắp trên dâng theo chiều cao h -> Tam giác vuông ACC' & đường chéo không gian AC'
      const a = (p.a || 4) / 2, h = (p.h || 4) / 2, b = (p.b || 3) / 2;
      const A = [-a, -h, b], B = [a, -h, b], C_pt = [a, -h, -b], D = [-a, -h, -b];
      const baseCorners = [A, B, C_pt, D];
      const Cp = [a, h, -b];
      // Base rectangle ABCD
      addPolyFace(baseCorners, 0x1d4ed8, 0.62);
      for (const pt of baseCorners) addSphere(pt, 0x1d4ed8, 0.085);
      // Phase 1: Face diagonal AC
      const u1 = Math.min(1, u / 0.25);
      const AC_cur = [A[0] + (C_pt[0] - A[0]) * u1, -h + 0.01, A[2] + (C_pt[2] - A[2]) * u1];
      addTube(A, AC_cur, 0x15803d, 0.048);
      addSphere(AC_cur, 0x15803d, 0.095);
      // Phase 2: 4 vertical edges & 4 lateral faces rising along h + top face A(t)B(t)C(t)D(t)
      if (u > 0.2) {
        const u2 = Math.min(1, (u - 0.2) / 0.42);
        const yCur = -h + 2 * h * u2;
        const topCorners = [[-a, yCur, b], [a, yCur, b], [a, yCur, -b], [-a, yCur, -b]];
        for (let k = 0; k < 4; k++) {
          const nk = (k + 1) % 4;
          addPolyFace([baseCorners[k], baseCorners[nk], topCorners[nk], topCorners[k]], 0x38bdf8, 0.26);
          addTube(baseCorners[k], topCorners[k], 0xb45309, 0.042);
          addSphere(topCorners[k], 0xffd166, 0.085);
        }
        addPolyFace(topCorners, 0x15803d, 0.42);
      }
      // Phase 3 & 4: Right triangle ACC' & 3D space diagonal AC' = √(a²+b²+h²)
      if (u > 0.58) {
        const u3 = Math.min(1, (u - 0.58) / 0.42);
        addPolyFace([A, C_pt, Cp], 0x6d28d9, 0.48);
        addRightAngle(C_pt, [A[0] - C_pt[0], 0, A[2] - C_pt[2]], [0, 1, 0], Math.min(0.32, h * 0.35), 0x6d28d9);
        const diagCur = [
          A[0] + (Cp[0] - A[0]) * u3,
          A[1] + (Cp[1] - A[1]) * u3,
          A[2] + (Cp[2] - A[2]) * u3
        ];
        addTube(A, diagCur, 0x6d28d9, 0.062);
        addSphere(diagCur, 0xfcd34d, 0.12);
      }
    } else if (type === 'cube') {
      // 7-08-C02: Hình lập phương — Đáy vuông a×a & 3 cạnh đôi một vuông góc -> 6 mặt vuông khép khối -> Mặt phẳng chéo ACC'A' & đường chéo không gian AC' = a√3
      const a = (p.a || 3) / 2;
      const A = [-a, -a, a], B = [a, -a, a], C_pt = [a, -a, -a], D = [-a, -a, -a];
      const baseCorners = [A, B, C_pt, D];
      const Cp = [a, a, -a];
      addPolyFace(baseCorners, 0x1d4ed8, 0.62);
      for (const pt of baseCorners) addSphere(pt, 0x1d4ed8, 0.085);
      const u1 = Math.min(1, u / 0.25);
      addTube(A, [A[0] + (C_pt[0] - A[0]) * u1, -a + 0.01, A[2] + (C_pt[2] - A[2]) * u1], 0x15803d, 0.05);
      // 3 mutually perpendicular equal edges from B
      addTube(B, [B[0] + (A[0] - B[0]) * u1, -a, B[2]], 0x1d4ed8, 0.048);
      addTube(B, [B[0], -a, B[2] + (C_pt[2] - B[2]) * u1], 0x1d4ed8, 0.048);
      if (u > 0.2) {
        const u2 = Math.min(1, (u - 0.2) / 0.42);
        const yCur = -a + 2 * a * u2;
        const topCorners = [[-a, yCur, a], [a, yCur, a], [a, yCur, -a], [-a, yCur, -a]];
        addTube(B, [a, yCur, a], 0x1d4ed8, 0.048);
        for (let k = 0; k < 4; k++) {
          const nk = (k + 1) % 4;
          addPolyFace([baseCorners[k], baseCorners[nk], topCorners[nk], topCorners[k]], 0x38bdf8, 0.26);
          addTube(baseCorners[k], topCorners[k], 0x475569, 0.036);
          addSphere(topCorners[k], 0xffd166, 0.085);
        }
        addPolyFace(topCorners, 0x15803d, 0.38);
        // Diagonal cross-section plane ACC'A' rising from bottom to top
        addPolyFace([A, C_pt, [a, yCur, -a], [-a, yCur, a]], 0xb45309, 0.54);
      }
      if (u > 0.58) {
        const u3 = Math.min(1, (u - 0.58) / 0.42);
        const diagCur = [
          A[0] + (Cp[0] - A[0]) * u3,
          A[1] + (Cp[1] - A[1]) * u3,
          A[2] + (Cp[2] - A[2]) * u3
        ];
        addTube(A, diagCur, 0x6d28d9, 0.064);
        addSphere(diagCur, 0xfcd34d, 0.12);
      }
    } else if (type === 'triPrism' || type === 'triangularPrism') {
      // 7-09-C01: Lăng trụ đứng tam giác — Đáy dưới △ABC (#1D4ED8) -> Tịnh tiến △A(t)B(t)C(t) dựng 3 mặt bên chữ nhật & đáy trên △A'B'C' (#15803D) -> Đường cao h (#6D28D9)
      const a = p.a || 3.5, h = p.h || 4, R = a / Math.sqrt(3);
      const bot = [];
      for (let k = 0; k < 3; k++) {
        const ang = (2 * Math.PI * k) / 3 - Math.PI / 2;
        const x = R * Math.cos(ang), z = -R * Math.sin(ang);
        bot.push([x, -h / 2, z]);
      }
      addPolyFace(bot, 0x1d4ed8, 0.68);
      for (let k = 0; k < 3; k++) {
        addTube(bot[k], bot[(k + 1) % 3], 0x1d4ed8, 0.044);
        addSphere(bot[k], 0x1d4ed8, 0.095);
      }
      if (u > 0.18) {
        const uLift = Math.min(1, (u - 0.18) / 0.52);
        const yCur = -h / 2 + h * uLift;
        const curTri = bot.map(([x, , z]) => [x, yCur, z]);
        for (let k = 0; k < 3; k++) {
          const nk = (k + 1) % 3;
          addPolyFace([bot[k], bot[nk], curTri[nk], curTri[k]], 0x38bdf8, 0.34);
          addTube(bot[k], curTri[k], 0xb45309, 0.05);
          addSphere(curTri[k], 0x15803d, 0.095);
        }
        addPolyFace(curTri, 0x15803d, 0.68);
      }
      if (u > 0.68) {
        const uH = Math.min(1, (u - 0.68) / 0.32);
        const yH = -h / 2 + h * uH;
        addTube([0, -h / 2, 0], [0, yH, 0], 0x6d28d9, 0.062);
        addRightAngle([0, -h / 2, 0], [1, 0, 0], [0, 1, 0], Math.min(0.3, R * 0.35), 0x6d28d9);
        addSphere([0, -h / 2, 0], 0x6d28d9, 0.1);
        addSphere([0, yH, 0], 0xc4b5fd, 0.11);
      }
    } else if (type === 'prismQuad' || type === 'quadPrism') {
      // 7-09-C02: Lăng trụ đứng tứ giác — Đáy hình thang cân ABCD + đường chéo AC -> Dựng 4 mặt bên chữ nhật & đáy trên A'B'C'D' -> Mặt phẳng chéo ACC'A'
      const a = (p.a || 4) / 2, b = (p.b || 2.5) / 2, hb = (p.h_base || 2.5) / 2, h = p.h || 4;
      const y0 = -h / 2;
      const basePts = [[-a, y0, -hb], [a, y0, -hb], [b, y0, hb], [-b, y0, hb]];
      addPolyFace(basePts, 0x1d4ed8, 0.66);
      for (let k = 0; k < 4; k++) {
        addTube(basePts[k], basePts[(k + 1) % 4], 0x1d4ed8, 0.042);
        addSphere(basePts[k], 0x1d4ed8, 0.09);
      }
      const u1 = Math.min(1, u / 0.25);
      const acCur = [
        basePts[0][0] + (basePts[2][0] - basePts[0][0]) * u1,
        y0 + 0.02,
        basePts[0][2] + (basePts[2][2] - basePts[0][2]) * u1
      ];
      addTube(basePts[0], acCur, 0x6d28d9, 0.048);
      if (u > 0.2) {
        const u2 = Math.min(1, (u - 0.2) / 0.5);
        const yCur = y0 + h * u2;
        const curQuad = basePts.map(([x, , z]) => [x, yCur, z]);
        for (let k = 0; k < 4; k++) {
          const nk = (k + 1) % 4;
          addPolyFace([basePts[k], basePts[nk], curQuad[nk], curQuad[k]], 0x38bdf8, 0.3);
          addTube(basePts[k], curQuad[k], 0xb45309, 0.046);
          addSphere(curQuad[k], 0x15803d, 0.09);
        }
        addPolyFace(curQuad, 0x15803d, 0.58);
      }
      if (u > 0.68) {
        const u3 = Math.min(1, (u - 0.68) / 0.32);
        const yDiag = y0 + h * u3;
        const topA = [basePts[0][0], yDiag, basePts[0][2]];
        const topC = [basePts[2][0], yDiag, basePts[2][2]];
        addPolyFace([basePts[0], basePts[2], topC, topA], 0xb45309, 0.52);
        addTube([0, y0, 0], [0, yDiag, 0], 0x6d28d9, 0.056);
        addRightAngle([0, y0, 0], [1, 0, 0], [0, 1, 0], 0.28, 0x6d28d9);
      }
    } else if (type === 'trianglePyramid' || type === 'tetrahedron') {
      // 8-09-C01: Hình chóp tam giác đều — Đáy đều △ABC + 3 trung tuyến cắt tại trọng tâm O -> Dựng đường cao SO ⊥ đáy -> Dựng 3 cạnh bên & 3 mặt bên cân chụm tại S -> Tam giác vuông △SOI & trung đoạn SI = d
      const a = p.a || 4, h = type === 'tetrahedron' ? a * Math.sqrt(2 / 3) : (p.h || 4.8);
      const R = a / Math.sqrt(3), y = -h / 2, S = [0, h / 2, 0], O = [0, y, 0];
      const pts = [];
      for (let k = 0; k < 3; k++) {
        const t = (2 * Math.PI * k) / 3 - Math.PI / 2;
        pts.push([R * Math.cos(t), y, R * Math.sin(t)]);
      }
      // Base equilateral triangle △ABC
      addPolyFace(pts, 0x1d4ed8, 0.68);
      for (let k = 0; k < 3; k++) {
        addTube(pts[k], pts[(k + 1) % 3], 0x1d4ed8, 0.044);
        addSphere(pts[k], 0x1d4ed8, 0.095);
      }
      // Phase 1: 3 base medians meeting at centroid O
      const u1 = Math.min(1, u / 0.24);
      for (let k = 0; k < 3; k++) {
        const V = pts[k], P1 = pts[(k + 1) % 3], P2 = pts[(k + 2) % 3];
        const M = [(P1[0] + P2[0]) / 2, y + 0.01, (P1[2] + P2[2]) / 2];
        const curM = [V[0] + (M[0] - V[0]) * u1, y + 0.01, V[2] + (M[2] - V[2]) * u1];
        addTube([V[0], y + 0.01, V[2]], curM, 0x047857, 0.032);
      }
      addSphere(O, 0x6d28d9, 0.11);
      // Phase 2: Perpendicular altitude SO growing vertically from O to S
      if (u > 0.22) {
        const u2 = Math.min(1, (u - 0.22) / 0.28);
        const S_cur = [0, y + h * u2, 0];
        addTube(O, S_cur, 0x6d28d9, 0.062);
        addRightAngle(O, [1, 0, 0], [0, 1, 0], Math.min(0.3, R * 0.35), 0x6d28d9);
        addSphere(S_cur, 0xffd166, 0.12);
      }
      // Phase 3: 3 equal lateral edges SA, SB, SC and 3 rising isosceles faces meeting at S
      if (u > 0.46) {
        const u3 = Math.min(1, (u - 0.46) / 0.28);
        const S_face = [0, y + h * u3, 0];
        for (let k = 0; k < 3; k++) {
          const V1 = pts[k], V2 = pts[(k + 1) % 3];
          addTube(V1, S_face, 0x475569, 0.044);
          addPolyFace([V1, V2, S_face], 0x94a3b8, 0.38 * u3);
        }
      }
      // Phase 4: Right triangle △SOI and slant height (trung đoạn) SI = d
      if (u > 0.72) {
        const u4 = Math.min(1, (u - 0.72) / 0.28);
        const I = [(pts[1][0] + pts[2][0]) / 2, y, (pts[1][2] + pts[2][2]) / 2];
        addPolyFace([S, O, I], 0xb45309, 0.62);
        addTube(O, I, 0x047857, 0.044);
        const SI_cur = [S[0] + (I[0] - S[0]) * u4, S[1] + (I[1] - S[1]) * u4, S[2] + (I[2] - S[2]) * u4];
        addTube(S, SI_cur, 0xb45309, 0.058);
        addSphere(SI_cur, 0xfcd34d, 0.11);
      }
    } else if (type === 'squarePyramid') {
      // 8-09-C02: Hình chóp tứ giác đều — Đáy vuông ABCD + 2 đường chéo cắt tại O -> Đường cao SO & 4 mặt bên cân -> Tam giác vuông △SOM & trung đoạn SM = d -> Tam giác vuông △SOB & cạnh bên SB
      const a = (p.a || 4) / 2, h = p.h || 4.8, y = -h / 2, hi = h / 2;
      const A = [-a, y, -a], B = [a, y, -a], C_pt = [a, y, a], D = [-a, y, a];
      const baseCorners = [A, B, C_pt, D];
      const O = [0, y, 0], S = [0, hi, 0], M = [a, y, 0];
      // Base square ABCD
      addPolyFace(baseCorners, 0x1d4ed8, 0.68);
      for (let k = 0; k < 4; k++) {
        addTube(baseCorners[k], baseCorners[(k + 1) % 4], 0x1d4ed8, 0.044);
        addSphere(baseCorners[k], 0x1d4ed8, 0.095);
      }
      // Phase 1: Base diagonals AC, BD meeting at center O
      const u1 = Math.min(1, u / 0.24);
      addTube(A, [A[0] + (C_pt[0] - A[0]) * u1, y + 0.01, A[2] + (C_pt[2] - A[2]) * u1], 0x047857, 0.034);
      addTube(B, [B[0] + (D[0] - B[0]) * u1, y + 0.01, B[2] + (D[2] - B[2]) * u1], 0x047857, 0.034);
      addSphere(O, 0x6d28d9, 0.11);
      // Phase 2: Altitude SO growing vertically & 4 lateral faces rising to S
      if (u > 0.22) {
        const u2 = Math.min(1, (u - 0.22) / 0.28);
        const S_cur = [0, y + h * u2, 0];
        addTube(O, S_cur, 0x6d28d9, 0.064);
        addRightAngle(O, [1, 0, 0], [0, 1, 0], Math.min(0.32, a * 0.35), 0x6d28d9);
        addSphere(S_cur, 0xffd166, 0.12);
        for (let k = 0; k < 4; k++) {
          addTube(baseCorners[k], S_cur, 0x475569, 0.04);
          addPolyFace([baseCorners[k], baseCorners[(k + 1) % 4], S_cur], 0x94a3b8, 0.34 * u2);
        }
      }
      // Phase 3: Right triangle △SOM & slant height (trung đoạn) SM = d
      if (u > 0.48) {
        const u3 = Math.min(1, (u - 0.48) / 0.26);
        addPolyFace([S, O, M], 0xb45309, 0.62);
        addTube(O, M, 0x047857, 0.044);
        const SM_cur = [S[0] + (M[0] - S[0]) * u3, S[1] + (M[1] - S[1]) * u3, S[2] + (M[2] - S[2]) * u3];
        addTube(S, SM_cur, 0xb45309, 0.06);
        addSphere(SM_cur, 0xfcd34d, 0.11);
      }
      // Phase 4: Right triangle △SOB & lateral edge SB (contrasting SO < SM < SB)
      if (u > 0.74) {
        const u4 = Math.min(1, (u - 0.74) / 0.26);
        addPolyFace([S, O, B], 0x15803d, 0.52);
        const SB_cur = [S[0] + (B[0] - S[0]) * u4, S[1] + (B[1] - S[1]) * u4, S[2] + (B[2] - S[2]) * u4];
        addTube(S, SB_cur, 0x15803d, 0.058);
        addSphere(SB_cur, 0x6ee7b7, 0.11);
      }
    } else if (type === 'cylinder') {
      // 9-09-C01: Quay hình chữ nhật O₁O₂AB một vòng 360° quanh trục O₁O₂ quét thành hình trụ 3D
      const R = p.r || 2, H = p.h || 4;
      const uSweep = Math.max(0.04, Math.min(1, (u - 0.1) / 0.9));
      const sweepAng = u < 0.1 ? 0.06 : uSweep * Math.PI * 2;
      const cylSweep = new THREE.Mesh(
        new THREE.CylinderGeometry(R, R, H, 56, 1, true, 0, sweepAng),
        new THREE.MeshStandardMaterial({ color: 0x1d4ed8, transparent: true, opacity: 0.46, side: THREE.DoubleSide, depthWrite: false })
      );
      group.add(cylSweep);
      const topSweep = new THREE.Mesh(
        new THREE.CircleGeometry(R, 56, 0, sweepAng),
        new THREE.MeshStandardMaterial({ color: 0x15803d, transparent: true, opacity: 0.54, side: THREE.DoubleSide, depthWrite: false })
      );
      topSweep.rotation.x = -Math.PI / 2;
      topSweep.position.y = H / 2;
      group.add(topSweep);
      const botSweep = new THREE.Mesh(
        new THREE.CircleGeometry(R, 56, 0, sweepAng),
        new THREE.MeshStandardMaterial({ color: 0x15803d, transparent: true, opacity: 0.54, side: THREE.DoubleSide, depthWrite: false })
      );
      botSweep.rotation.x = Math.PI / 2;
      botSweep.position.y = -H / 2;
      group.add(botSweep);
      const ax = R * Math.sin(sweepAng), az = R * Math.cos(sweepAng);
      addPolyFace([[0, -H / 2, 0], [0, H / 2, 0], [ax, H / 2, az], [ax, -H / 2, az]], 0xb45309, 0.74);
      addTube([0, -H / 2, 0], [0, H / 2, 0], 0x6d28d9, 0.054);
      addTube([0, -H / 2, 0], [ax, -H / 2, az], 0x15803d, 0.048);
      addTube([0, H / 2, 0], [ax, H / 2, az], 0x15803d, 0.048);
      addTube([ax, -H / 2, az], [ax, H / 2, az], 0xb45309, 0.058);
      addRightAngle([0, -H / 2, 0], [ax, 0, az], [0, 1, 0], Math.min(0.32, R * 0.3), 0x6d28d9);
      addSphere([0, -H / 2, 0], 0x6d28d9, 0.1);
      addSphere([0, H / 2, 0], 0x6d28d9, 0.1);
      addSphere([ax, -H / 2, az], 0xffd166, 0.11);
      addSphere([ax, H / 2, az], 0xffd166, 0.11);
    } else if (type === 'cone') {
      // 9-10-C01: Quay tam giác vuông △SOA một vòng 360° quanh trục cao SO quét thành hình nón 3D
      const R = p.r || 2, H = p.h || 4;
      const uSweep = Math.max(0.04, Math.min(1, (u - 0.1) / 0.9));
      const sweepAng = u < 0.1 ? 0.06 : uSweep * Math.PI * 2;
      const coneSweep = new THREE.Mesh(
        new THREE.ConeGeometry(R, H, 56, 1, true, 0, sweepAng),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.46, side: THREE.DoubleSide, depthWrite: false })
      );
      group.add(coneSweep);
      const baseSweep = new THREE.Mesh(
        new THREE.CircleGeometry(R, 56, 0, sweepAng),
        new THREE.MeshStandardMaterial({ color: 0x1d4ed8, transparent: true, opacity: 0.56, side: THREE.DoubleSide, depthWrite: false })
      );
      baseSweep.rotation.x = Math.PI / 2;
      baseSweep.position.y = -H / 2;
      group.add(baseSweep);
      const ax = R * Math.sin(sweepAng), az = R * Math.cos(sweepAng);
      addPolyFace([[0, -H / 2, 0], [0, H / 2, 0], [ax, -H / 2, az]], 0xb45309, 0.76);
      addTube([0, -H / 2, 0], [0, H / 2, 0], 0x15803d, 0.054);
      addTube([0, -H / 2, 0], [ax, -H / 2, az], 0x1d4ed8, 0.05);
      addTube([0, H / 2, 0], [ax, -H / 2, az], 0xb45309, 0.058);
      addRightAngle([0, -H / 2, 0], [ax, 0, az], [0, 1, 0], Math.min(0.32, R * 0.3), 0x6d28d9);
      addSphere([0, -H / 2, 0], 0x6d28d9, 0.1);
      addSphere([0, H / 2, 0], 0xffd166, 0.11);
      addSphere([ax, -H / 2, az], 0xffd166, 0.11);
    }
  };

  return group;
}

export function createMathModel(item,{faces=true,edges=true,labels=true,mode='solid'}={}) {
  const p=item.params||{};
  const model=new THREE.Group();
  const labelsGroup=new THREE.Group();
  labelsGroup.name='labelsGroup';
  labelsGroup.visible=!!labels;
  model.add(labelsGroup);

  const crossSectionGroup = createCrossSectionHelper(item.type, p);
  const obliqueSectionGroup = createObliqueSectionHelper(item.type,p);
  const unfoldGroup = createUnfoldHelper(item.type, p);
  const buildGroup = createBuildHelper(item.type, p);

  function labelPoint(text, pt, color='#ffffff', bg='rgba(10, 24, 40, 0.92)') {
    if (typeof document === 'undefined' || !document?.createElement) return null;
    const str = String(text ?? '');
    const isShort = str.length <= 2;
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    if (isShort) {
      c.width = 128; c.height = 128;
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(64, 64, 52, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#4cd2b2';
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = 'bold 54px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(str, 64, 67);
    } else {
      ctx.font = 'bold 42px system-ui, sans-serif';
      const measured = ctx.measureText ? (ctx.measureText(str)?.width || str.length * 24) : str.length * 24;
      const w = Math.max(140, Math.ceil(measured + 56)), h = 92, r = 42;
      c.width = w; c.height = h;
      ctx.fillStyle = bg;
      ctx.beginPath();
      if (typeof ctx.moveTo === 'function' && typeof ctx.quadraticCurveTo === 'function') {
        ctx.moveTo(r, 6);
        ctx.lineTo(w - r, 6);
        ctx.quadraticCurveTo(w - 6, 6, w - 6, r);
        ctx.lineTo(w - 6, h - r);
        ctx.quadraticCurveTo(w - 6, h - 6, w - r, h - 6);
        ctx.lineTo(r, h - 6);
        ctx.quadraticCurveTo(6, h - 6, 6, h - r);
        ctx.lineTo(6, r);
        ctx.quadraticCurveTo(6, 6, r, 6);
        if (typeof ctx.closePath === 'function') ctx.closePath();
      } else if (typeof ctx.arc === 'function') {
        ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.strokeStyle = '#4cd2b2';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = 'bold 42px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(str, w / 2, h / 2 + 2);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({map: tex, transparent: true, depthTest: false});
    const sprite = new THREE.Sprite(mat);
    if (isShort) {
      sprite.scale.set(0.52, 0.52, 1);
    } else {
      sprite.scale.set(0.42 * (c.width / 92), 0.42, 1);
    }
    const pos = Array.isArray(pt) ? v(...pt) : pt;
    sprite.position.copy(pos);
    sprite.userData.labelText = str;
    labelsGroup.add(sprite);
    return sprite;
  }

  const mat=(color,alpha=.7)=>new THREE.MeshStandardMaterial({color,transparent:alpha<1,opacity:alpha,metalness:.06,roughness:.38,side:THREE.DoubleSide,depthWrite:alpha>=1});
  const basic=(color,alpha=.95)=>new THREE.MeshBasicMaterial({color,transparent:alpha<1,opacity:alpha,side:THREE.DoubleSide,depthWrite:alpha>=1});
  function solid(geometry,color=C.face,alpha=.65,addEdges=true){
    const m=new THREE.Mesh(geometry,mat(color,alpha)); m.userData.isFace=true;m.castShadow=true;m.receiveShadow=true;m.visible=faces;model.add(m);
    if(edges&&addEdges){const wire=new THREE.LineSegments(new THREE.EdgesGeometry(geometry,9),new THREE.LineBasicMaterial({color:C.edge}));model.add(wire);}
    return m;
  }
  function line(points,color=C.edge,width=2){
    if(points.length<2)return;
    const g=new THREE.BufferGeometry().setFromPoints(points.map(pt=>Array.isArray(pt)?v(...pt):pt));
    const o=new THREE.Line(g,new THREE.LineBasicMaterial({color,linewidth:width}));model.add(o);return o;
  }
  function boldLine(p1, p2, color=C.edge, radius=0.048, opacity=1){
    const v1 = Array.isArray(p1) ? v(...p1) : p1.clone();
    const v2 = Array.isArray(p2) ? v(...p2) : p2.clone();
    const dir = new THREE.Vector3().subVectors(v2, v1);
    const len = dir.length();
    if(len < 1e-5) return null;
    const geom = new THREE.CylinderGeometry(radius, radius, len, 14);
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.28,
      metalness: 0.12,
      transparent: opacity < 1,
      opacity: opacity,
      emissive: color,
      emissiveIntensity: 0.32
    });
    const cylinder = new THREE.Mesh(geom, material);
    cylinder.position.copy(v1).addScaledVector(dir, 0.5);
    cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    cylinder.userData.isFace = false;
    cylinder.castShadow = true;
    model.add(cylinder);
    return cylinder;
  }
  function rightAngleMark(vertex, dir1, dir2, size=0.35, color=0xffd166){
    const v0 = Array.isArray(vertex) ? v(...vertex) : vertex.clone();
    const u1 = (Array.isArray(dir1) ? v(...dir1) : dir1.clone()).normalize().multiplyScalar(size);
    const u2 = (Array.isArray(dir2) ? v(...dir2) : dir2.clone()).normalize().multiplyScalar(size);
    const pA = v0.clone().add(u1);
    const pCorner = v0.clone().add(u1).add(u2);
    const pB = v0.clone().add(u2);
    boldLine(pA, pCorner, color, 0.024);
    boldLine(pCorner, pB, color, 0.024);
  }
  function loop(points,color=C.edge){line([...points,points[0]],color);}
  function dots(points,color=C.orange,r=.075){for(const point of points){const o=new THREE.Mesh(new THREE.SphereGeometry(r,12,8),basic(color));o.position.copy(Array.isArray(point)?v(...point):point);model.add(o);}}
  function polygon3(pts,color=C.teal){
    const s=new THREE.Shape();pts.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();
    const mesh=solid(new THREE.ShapeGeometry(s),color,.49,true);return mesh;
  }
  function triangles(verts, facesIdx,color=C.face,showDots=true){
    const buf=[]; for(const face of facesIdx){const triangulated=face.length===4?[[face[0],face[1],face[2]],[face[0],face[2],face[3]]]:[face];for(const tr of triangulated){for(const idx of tr)buf.push(...verts[idx]);}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(buf,3));geo.computeVertexNormals();
    solid(geo,color,.62,false);
    if(edges){const seen=new Set();for(const face of facesIdx){for(let j=0;j<face.length;j++){const a=face[j],b=face[(j+1)%face.length];const key=[Math.min(a,b),Math.max(a,b)].join('-');if(seen.has(key))continue;seen.add(key);line([verts[a],verts[b]]);}}}
    if(showDots)dots(verts,C.orange,.065);
  }
  function axis(len=5,axis3d=false){
    line([[-len,0,0],[len,0,0]],0xff8e86);line([[0,-len,0],[0,len,0]],0x54dfbe);
    if(axis3d)line([[0,0,-len],[0,0,len]],0x8cb8ff);
  }
  function axisOxyz(len=4.5){
    // R85 Semantic Oxyz Axes: Ox=#9A3412, Oy=#15803D, Oz=#1D4ED8
    line([[-len,0,0],[len,0,0]],0x9a3412,2.2);
    line([[0,-len,0],[0,len,0]],0x15803d,2.2);
    line([[0,0,-len],[0,0,len]],0x1d4ed8,2.2);
    model.add(new THREE.ArrowHelper(v(1,0,0),v(0,0,0),len,0x9a3412,0.32,0.14));
    model.add(new THREE.ArrowHelper(v(0,1,0),v(0,0,0),len,0x15803d,0.32,0.14));
    model.add(new THREE.ArrowHelper(v(0,0,1),v(0,0,0),len,0x1d4ed8,0.32,0.14));
  }
  function curve(fn,start,end,steps=160,color=C.orange){
    const arr=[];for(let i=0;i<=steps;i++){const x=start+(end-start)*i/steps;const y=fn(x);if(Number.isFinite(y)&&Math.abs(y)<30)arr.push([x,y,0]);else if(arr.length){line(arr,color);arr.length=0;}}
    if(arr.length>1)line(arr,color);
  }
  switch(item.type){
    case 'polygonTiling':case 'transform2d':case 'unitCircleMotion':{
      const scene=buildGeometry2DScene(item.type,p,item.grade);
      for(const shape of scene.primitives){
        if(shape.kind==='polygon')polygon3(shape.pts,C.teal);
        if(shape.kind==='line')line([shape.a,shape.b].map(([x,y])=>[x,y,.035]),C.orange);
        if(shape.kind==='curve')line(shape.pts.map(([x,y])=>[x,y,.035]),C.orange);
        if(shape.kind==='circle'){
          const pts=Array.from({length:81},(_,i)=>[shape.center[0]+shape.r*Math.cos(2*Math.PI*i/80),shape.center[1]+shape.r*Math.sin(2*Math.PI*i/80),.035]);line(pts,C.violet);
        }
      }
      break;
    }
    case 'boxPlot':{
      polygon3([[-2,-.7],[2,-.7],[2,.7],[-2,.7]],C.teal);
      line([[-3,0,.08],[3,0,.08]],C.orange);
      line([[-.4,-.8,.08],[-.4,.8,.08]],C.violet);
      break;
    }
    case 'cube':{
      const a=p.a/2;
      solid(new THREE.BoxGeometry(p.a,p.a,p.a));
      labelPoint('A',[-a,-a,a]);labelPoint('B',[a,-a,a]);labelPoint('C',[a,-a,-a]);labelPoint('D',[-a,-a,-a]);
      labelPoint("A'",[-a,a,a]);labelPoint("B'",[a,a,a]);labelPoint("C'",[a,a,-a]);labelPoint("D'",[-a,a,-a]);
      break;
    }
    case 'cuboid':{
      const a=p.a/2,h=p.h/2,b=p.b/2;
      solid(new THREE.BoxGeometry(p.a,p.h,p.b));
      labelPoint('A',[-a,-h,b]);labelPoint('B',[a,-h,b]);labelPoint('C',[a,-h,-b]);labelPoint('D',[-a,-h,-b]);
      labelPoint("A'",[-a,h,b]);labelPoint("B'",[a,h,b]);labelPoint("C'",[a,h,-b]);labelPoint("D'",[-a,h,-b]);
      break;
    }
    case 'cylinder':{
      const R=p.r,H=p.h,u=Math.max(0,Math.min(1,Number(p.turn)||0)),theta=(u>0?u:0.12)*Math.PI*2;
      const modeId=p.modeId||'';
      solid(new THREE.CylinderGeometry(R,R,H,64,1,true),0x1d4ed8,.46,false);
      // Hai đáy tròn màu xanh lá (#15803D) theo chuẩn R82
      const topCap=solid(new THREE.CircleGeometry(R,64),0x15803d,.52,false);
      topCap.rotation.x=-Math.PI/2;topCap.position.y=H/2;
      const botCap=solid(new THREE.CircleGeometry(R,64),0x15803d,.52,false);
      botCap.rotation.x=Math.PI/2;botCap.position.y=-H/2;
      const topPts=[],botPts=[];
      for(let i=0;i<=64;i++){
        const ang=(i*2*Math.PI)/64;
        topPts.push([R*Math.cos(ang),H/2,R*Math.sin(ang)]);
        botPts.push([R*Math.cos(ang),-H/2,R*Math.sin(ang)]);
      }
      line(topPts,0x15803d,2.8);
      line(botPts,0x15803d,2.8);
      // Trục quay O1O2 (xám/tím) và bán kính đáy (xanh dương #1D4ED8), đường sinh (cam #B45309)
      const ax=R*Math.cos(theta),az=R*Math.sin(theta);
      if(modeId==='9-09-C01'||!modeId){
        // 9-09-C01: Mặt chữ nhật sinh O1O2AA1 quay 360° quanh trục O1O2 tạo hình trụ
        triangles([[0,-H/2,0],[0,H/2,0],[ax,H/2,az],[ax,-H/2,az]],[[0,1,2,3]],0xb45309,false);
      }
      boldLine([0,-H/2,0],[0,H/2,0],0x6d28d9,0.042);
      boldLine([0,H/2,0],[ax,H/2,az],0x1d4ed8,0.038);
      boldLine([0,-H/2,0],[ax,-H/2,az],0x1d4ed8,0.042);
      boldLine([ax,-H/2,az],[ax,H/2,az],0xb45309,0.052);
      rightAngleMark([0,-H/2,0],[Math.cos(theta),0,Math.sin(theta)],[0,1,0],Math.min(0.32,R*0.3,H*0.25),0x6d28d9);
      dots([[0,H/2,0],[0,-H/2,0],[ax,-H/2,az],[ax,H/2,az]],0xb45309,0.09);
      labelPoint('O₁',[0,H/2+0.35,0],'#ffd166');
      labelPoint('O₂',[0,-H/2-0.35,0],'#ffd166');
      labelPoint('A',[ax*1.15,-H/2,az*1.15],'#ffffff');
      labelPoint(`r = ${round(R)}`,[ax*0.55,-H/2-0.28,az*0.55],'#93c5fd');
      labelPoint(`l = h = ${round(H)}`,[ax*1.18,0,az*1.18],'#fcd34d');
      break;
    }
    case 'cone':{
      const R=p.r,H=p.h,u=Math.max(0,Math.min(1,Number(p.turn)||0)),theta=(u>0?u:0.12)*Math.PI*2;
      const modeId=p.modeId||'',L=Math.hypot(R,H);
      solid(new THREE.ConeGeometry(R,H,64,1,true),0x1d4ed8,.48,false);
      // Đáy tròn xanh lá (#15803D)
      const botCap=solid(new THREE.CircleGeometry(R,64),0x15803d,.54,false);
      botCap.rotation.x=Math.PI/2;botCap.position.y=-H/2;
      const botPts=[];
      for(let i=0;i<=64;i++){
        const ang=(i*2*Math.PI)/64;
        botPts.push([R*Math.cos(ang),-H/2,R*Math.sin(ang)]);
      }
      line(botPts,0x15803d,2.8);
      const ax=R*Math.cos(theta),az=R*Math.sin(theta);
      if(modeId==='9-10-C01'||!modeId){
        // 9-10-C01: Tam giác vuông SOA quay 360° quanh trục SO tạo hình nón
        triangles([[0,-H/2,0],[0,H/2,0],[ax,-H/2,az]],[[0,1,2]],0xb45309,false);
      }
      // Tam giác vuông SOA: chiều cao SO xanh lá (#15803D), bán kính OA xanh dương (#1D4ED8), đường sinh SA cam (#B45309)
      boldLine([0,-H/2,0],[0,H/2,0],0x15803d,0.044);
      boldLine([0,-H/2,0],[ax,-H/2,az],0x1d4ed8,0.044);
      boldLine([0,H/2,0],[ax,-H/2,az],0xb45309,0.052);
      rightAngleMark([0,-H/2,0],[Math.cos(theta),0,Math.sin(theta)],[0,1,0],Math.min(0.32,R*0.3,H*0.25),0x6d28d9);
      dots([[0,H/2,0],[0,-H/2,0],[ax,-H/2,az]],0xb45309,0.095);
      labelPoint('S',[0,H/2+0.35,0],'#ffd166');
      labelPoint('O',[0,-H/2-0.35,0],'#86efac');
      labelPoint('A',[ax*1.15,-H/2,az*1.15],'#ffffff');
      labelPoint(`r = ${round(R)}`,[ax*0.52,-H/2-0.26,az*0.52],'#93c5fd');
      labelPoint(`l = ${round(L)}`,[ax*0.62,0.12,az*0.62],'#fcd34d');
      break;
    }
    case 'sphere':{
      const R=p.r,theta=((Number(p.turn)||0.16)*Math.PI*2);
      const isSolidVariant = p.variant === 'solid';
      if(isSolidVariant){
        // 9-11-C02: Hình cầu đặc (cắt góc 1/4 để lộ phần đặc bên trong và tâm O)
        const shell=solid(new THREE.SphereGeometry(R,44,30,0,Math.PI*1.5),C.violet,.58,false);
        shell.rotation.y=theta*0.35;
        // Hai mặt cắt bán nguyệt vuông góc đi qua tâm để thấy rõ khối đặc bên trong
        const cut1=solid(new THREE.CircleGeometry(R,48,-Math.PI/2,Math.PI),C.orange,.68,false);
        cut1.rotation.y=theta*0.35;
        const cut2=solid(new THREE.CircleGeometry(R,48,-Math.PI/2,Math.PI),C.teal,.64,false);
        cut2.rotation.y=theta*0.35 - Math.PI/2;
        const eqDisc=solid(new THREE.CircleGeometry(R,56),0xfbbf24,.28,false);
        eqDisc.rotation.x=-Math.PI/2;
        // Lõi cầu đồng tâm r(t) = R·(0.25 + 0.75·u) nở dần từ tâm O ra biên minh họa V = (4/3)πR³
        const uTurn=Math.max(0,Math.min(1,Number(p.turn)||0));
        const rInner=Math.max(0.12,R*(0.25+0.75*uTurn));
        const core=solid(new THREE.SphereGeometry(rInner,32,22),0xf59e0b,0.42,false);
        core.position.set(0,0,0);
      }else{
        // 9-11-C01: Mặt cầu (bề mặt tạo bởi nửa đường tròn tâm O bán kính R quay quanh đường kính AB)
        solid(new THREE.SphereGeometry(R,44,30),C.violet,.34,false);
      }
      // Hệ đường tròn lớn (Xích đạo + 2 Kinh tuyến vuông góc) & Vĩ tuyến giúp nhìn rõ độ cong 3D
      const eqPts=[],mer1=[],mer2=[],latUp=[],latDown=[];
      const latY=R*0.55,latR=Math.sqrt(Math.max(0.01,R*R-latY*latY));
      for(let i=0;i<=64;i++){
        const a=(i*2*Math.PI)/64;
        eqPts.push([R*Math.cos(a),0,R*Math.sin(a)]);
        mer1.push([R*Math.cos(a),R*Math.sin(a),0]);
        mer2.push([0,R*Math.sin(a),R*Math.cos(a)]);
        latUp.push([latR*Math.cos(a),latY,latR*Math.sin(a)]);
        latDown.push([latR*Math.cos(a),-latY,latR*Math.sin(a)]);
      }
      line(eqPts,0xf59e0b,3);
      line(mer1,0x14b8a6,2.2);
      line(mer2,0xa78bfa,2.0);
      line(latUp,0x38bdf8,1.4);
      line(latDown,0x38bdf8,1.4);
      // Trục đường kính AB = 2R
      boldLine([0,-R*1.18,0],[0,R*1.18,0],0xef4444,0.038);
      // Nửa đường tròn sinh AMB quay quanh trục AB với góc theta
      const semiPts=[];
      for(let i=0;i<=32;i++){
        const phi=-Math.PI/2+(i*Math.PI)/32;
        const rHoriz=R*Math.cos(phi),yPos=R*Math.sin(phi);
        semiPts.push([rHoriz*Math.cos(theta),yPos,rHoriz*Math.sin(theta)]);
      }
      for(let i=0;i<semiPts.length-1;i++){
        boldLine(semiPts[i],semiPts[i+1],0xfbbf24,0.034);
      }
      const M=[R*Math.cos(theta),0,R*Math.sin(theta)];
      // Bán kính OM = R
      boldLine([0,0,0],M,0x10b981,0.052);
      dots([[0,0,0],[0,R,0],[0,-R,0],M],0xff4d4d,0.11);
      labelPoint('O',[-0.32,-0.25,0],'#ffd166');
      labelPoint('A',[0,R+0.36,0],'#ff8d8d');
      labelPoint('B',[0,-R-0.36,0],'#ff8d8d');
      labelPoint('M',[M[0]*1.18,0.28,M[2]*1.18],'#fef08a');
      labelPoint(`R = ${round(R)}`,[M[0]*0.52,0.32,M[2]*0.52],'#34d399');
      break;
    }
    case 'squarePyramid':{
      const a=p.a/2,y=-p.h/2,hi=p.h/2;
      const pts=[[-a,y,-a],[a,y,-a],[a,y,a],[-a,y,a],[0,hi,0]];
      // R92: base is data (blue), lateral faces are a separate neutral surface.
      // NEVER show a floating orange midsection in recognition/folding lessons.
      // Real section geometry is supplied later by the timeline's setCrossSection().
      triangles(pts,[[0,3,2,1]],0x1d4ed8,false);
      triangles(pts,[[0,1,4],[1,2,4],[2,3,4],[3,0,4]],0x94a3b8,true);
      boldLine([0,y,0],[0,hi,0],0x6d28d9,0.052);
      boldLine([0,y,0],[a,y,0],0x047857,0.038);
      boldLine([0,hi,0],[a,y,0],0xb45309,0.044);
      rightAngleMark([0,y,0],[1,0,0],[0,1,0],Math.min(0.32,a*0.35,p.h*0.25),0x6d28d9);
      dots([[0,y,0],[0,hi,0],[a,y,0]],0x6d28d9,0.1);
      labelPoint('S',[0,hi+0.35,0],'#fcd34d');
      labelPoint('O',[0,y-0.28,0],'#c4b5fd');
      labelPoint('M',[a+0.28,y,0],'#6ee7b7');
      labelPoint(`h = ${round(p.h)}`,[-0.48,0,0],'#c4b5fd');
      labelPoint('A',[-a-0.28,y,-a-0.28]);labelPoint('B',[a+0.28,y,-a-0.28]);
      labelPoint('C',[a+0.28,y,a+0.28]);labelPoint('D',[-a-0.28,y,a+0.28]);
      break;
    }
    case 'trianglePyramid':case 'tetrahedron':{
      const a=p.a,h=item.type==='tetrahedron'?a*Math.sqrt(2/3):p.h,R=a/Math.sqrt(3);
      const y=-h/2,pts=[];
      for(let k=0;k<3;k++){const t=2*Math.PI*k/3-Math.PI/2;pts.push([R*Math.cos(t),y,R*Math.sin(t)]);}
      pts.push([0,h/2,0]);
      // One blue triangular base, three pale side faces; the height stays purple.
      triangles(pts,[[0,2,1]],0x1d4ed8,false);
      triangles(pts,[[0,1,3],[1,2,3],[2,0,3]],0x94a3b8,true);
      boldLine([0,y,0],[0,h/2,0],0x6d28d9,0.045);
      rightAngleMark([0,y,0],[1,0,0],[0,1,0],Math.min(0.3,R*0.35),0x6d28d9);
      labelPoint('S',[0,h/2+0.35,0],'#ffd166');
      labelPoint('O',[0,y-0.28,0],'#c4b5fd');
      labelPoint('A',pts[0]);labelPoint('B',pts[1]);labelPoint('C',pts[2]);
      break;
    }
    case 'triPrism':case 'triangularPrism':{
      const R=p.a/Math.sqrt(3),s=new THREE.Shape(),botPts=[],topPts=[],midPts=[];
      for(let k=0;k<3;k++){
        const t=2*Math.PI*k/3-Math.PI/2;
        const x=R*Math.cos(t),y=R*Math.sin(t);
        if(k===0)s.moveTo(x,y);else s.lineTo(x,y);
        botPts.push([x,-p.h/2,-y]);
        topPts.push([x,p.h/2,-y]);
        midPts.push([x,0,-y]);
      }
      s.closePath();const m=solid(new THREE.ExtrudeGeometry(s,{depth:p.h,bevelEnabled:false,steps:1}),0x1d4ed8,.52,true);
      m.rotation.x=-Math.PI/2;
      m.position.y=-p.h/2;
      model.children.filter(o=>o.isLineSegments).forEach(o=>{o.rotation.x=-Math.PI/2;o.position.y=-p.h/2;});
      // R92: remove the opaque floating mid-section shown even at 0%.
      // Explicitly distinguish the two congruent and parallel triangular bases.
      triangles(botPts,[[0,2,1]],0x1d4ed8,false);
      triangles(topPts,[[0,1,2]],0x15803d,false);
      boldLine([0,-p.h/2,0],[0,p.h/2,0],0x6d28d9,0.048);
      rightAngleMark([0,-p.h/2,0],[1,0,0],[0,1,0],Math.min(0.3,R*0.35),0x6d28d9);
      dots([...botPts,...topPts,[0,-p.h/2,0],[0,p.h/2,0]],0xb45309,0.09);
      ['A','B','C'].forEach((nm,i)=>{
        labelPoint(nm,[botPts[i][0]*1.18,botPts[i][1]-0.2,botPts[i][2]*1.18],'#93c5fd');
        labelPoint(nm+"'",[topPts[i][0]*1.18,topPts[i][1]+0.2,topPts[i][2]*1.18],'#6ee7b7');
      });
      labelPoint(`h = ${round(p.h)}`,[-0.5,0,0],'#c4b5fd');
      break;
    }
    case 'circle':{
      const m=solid(new THREE.CircleGeometry(p.r,96),C.teal,.36,false);m.material.side=THREE.DoubleSide;
      if(edges){const pts=[];for(let i=0;i<=96;i++){const t=i*2*Math.PI/96;pts.push([p.r*Math.cos(t),p.r*Math.sin(t),0]);}line(pts,C.edge);}
      line([[0,0,0],[p.r,0,0]],C.orange);dots([[0,0,0]],C.orange);
      labelPoint('O',[0,0,0],'#ffd166');labelPoint('A',[p.r+0.25,0,0]);
      break;
    }
    case 'polygon':{
      const pts=[];for(let i=0;i<p.n;i++){const t=i*2*Math.PI/p.n;pts.push([p.r*Math.cos(t),p.r*Math.sin(t)]);}
      polygon3(pts);loop(pts.map(([x,y])=>[x,y,0]),C.orange);dots([[0,0,0]],C.orange);
      break;
    }
    case 'trapezoid':{
      const a=p.a/2,b=p.b/2,h=p.h/2;polygon3([[-a,-h],[a,-h],[b,h],[-b,h]]);line([[-a,-h,0],[-a,h,0]],C.red);break;
    }
    case 'rhombus':{
      const a=p.a/2,b=p.b/2;polygon3([[0,b],[a,0],[0,-b],[-a,0]]);
      line([[-a,0,0],[a,0,0]],C.orange);line([[0,-b,0],[0,b,0]],C.red);break;
    }
    case 'triangle':case 'pythagoras':{
      const a=p.a,b=p.b; const A=[0,0],B=[a,0],D=[0,b];
      polygon3([A,B,D],C.teal);
      if(item.type==='pythagoras'){
        polygon3([[0,0],[a,0],[a,-a],[0,-a]],C.orange);
        polygon3([[0,0],[0,b],[-b,b],[-b,0]],C.violet);
        polygon3([[a,0],[0,b],[b,b+a],[a+b,a]],C.face);
      }
      loop([[0,0,0],[a,0,0],[0,b,0]],C.edge);dots([[0,0,0],[a,0,0],[0,b,0]]);
      labelPoint('A',[0,0,0],'#ff8d8d');labelPoint('B',[a+0.25,0,0]);labelPoint('C',[0,b+0.25,0]);
      break;
    }
    case 'angles':{
      const r=3,t=p.deg*Math.PI/180;
      line([[0,0,0],[r,0,0]],C.orange);line([[0,0,0],[r*Math.cos(t),r*Math.sin(t),0]],C.teal);
      const pts=[];for(let i=0;i<=50;i++){const u=t*i/50;pts.push([.85*Math.cos(u),.85*Math.sin(u),0]);}line(pts,C.edge);dots([[0,0,0]]);break;
    }
    case 'parabola':{
      axis(4.5);
      if(Math.abs(p.a)<1e-6){
        curve(x=>p.b*x+p.c,-5,5,60,C.teal);
      } else {
        curve(x=>p.a*x*x+p.b*x+p.c,-5,5,220,C.orange);
        const vx = -p.b/(2*p.a), vy = p.c - p.b*p.b/(4*p.a);
        if(Math.abs(vx)<=5 && Math.abs(vy)<=15){
          dots([[vx,vy,0]],C.red,0.12);
          labelPoint('Đỉnh I',[vx,vy+0.35,0],'#ffd166');
        }
      }
      break;
    }
    case 'lineGraph':{axis(4.5);curve(x=>p.a*x+p.b,-5,5,60,C.teal);break;}
    case 'sine':{axis(6.6);curve(x=>p.amp*Math.sin(p.freq*x),-6.3,6.3,260,C.orange);break;}
    case 'exponential':{axis(5);curve(x=>Math.pow(p.a,x),-5,Math.min(5,Math.log(10)/Math.log(p.a)),150,C.orange);break;}
    case 'derivative':{
      axis(5);curve(x=>p.a*x*x*x-p.b*x,-3.5,3.5,220,C.orange);
      curve(x=>3*p.a*x*x-p.b,-3.3,3.3,120,C.teal);break;
    }
    case 'vector':{
      axis(4,true);const to=v(p.x,p.y,p.z),len=to.length();
      if(len>0.001)model.add(new THREE.ArrowHelper(to.clone().normalize(),v(0,0,0),len,C.orange,Math.min(.55,len*.25),Math.min(.28,len*.14)));
      dots([[0,0,0]],C.orange);
      labelPoint('O',[0,-0.25,0],'#8cb8ff');
      labelPoint(`M(${p.x},${p.y},${p.z})`,[p.x+0.25,p.y+0.25,p.z+0.25],'#ffd166');
      break;
    }
    case 'plane':{
      axis(3.5,true);
      const u=Number.isFinite(Number(p.turn))?Number(p.turn):1;
      const rad=(p.angle||0)*Math.PI/180,ca=Math.cos(rad),sa=Math.sin(rad);
      const rotZ=([x,y,z])=>[x*ca-y*sa,x*sa+y*ca,z];
      const a=new THREE.Group();model.add(a);
      const mesh=new THREE.Mesh(new THREE.PlaneGeometry(6.4,5.2,10,10),mat(0x1d4ed8,.26));mesh.rotation.x=-Math.PI/2;mesh.userData.isFace=true;mesh.visible=faces;a.add(mesh);
      const w=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(6.4,5.2)),new THREE.LineBasicMaterial({color:0x1d4ed8}));w.rotation.x=-Math.PI/2;if(edges)a.add(w);
      a.rotation.z=rad;
      const A=rotZ([-1.8,0.03,-1.2]),B=rotZ([1.9,0.03,-0.9]),C_pt=rotZ([0.2,0.03,1.6]);
      // Moving point M(u) = A + α·AB + β·AC sweeping across △ABC ⊂ (P) in sync with 2D
      const alpha=0.15+0.4*u,beta=0.12+0.35*u;
      const M=[
        A[0]+alpha*(B[0]-A[0])+beta*(C_pt[0]-A[0]),
        A[1]+alpha*(B[1]-A[1])+beta*(C_pt[1]-A[1])+0.01,
        A[2]+alpha*(B[2]-A[2])+beta*(C_pt[2]-A[2])
      ];
      triangles([A,B,C_pt],[[0,1,2]],0x047857);
      boldLine(A,B,0xb45309,0.042);boldLine(B,C_pt,0xb45309,0.042);boldLine(C_pt,A,0xb45309,0.042);
      boldLine(A,M,0x6d28d9,0.036);
      // Normal vector n = AB x AC at M in result purple (#6D28D9) growing with u
      const nDir=v(-sa,ca,0).normalize();
      model.add(new THREE.ArrowHelper(nDir,v(...M),0.45+0.95*u,0x6d28d9,0.32,0.15));
      dots([A,B,C_pt],0xb45309,0.12);
      dots([M],0x6d28d9,0.14);
      labelPoint('A',[A[0]-0.28,A[1]+0.32,A[2]],'#fcd34d');
      labelPoint('B',[B[0]+0.28,B[1]+0.32,B[2]],'#fcd34d');
      labelPoint('C',[C_pt[0],C_pt[1]+0.35,C_pt[2]+0.28],'#fcd34d');
      labelPoint('M ∈ (ABC)',[M[0],M[1]+0.38,M[2]],'#c4b5fd');
      const P_lbl=rotZ([2.5,0.2,2.0]);
      labelPoint('(P) ≡ (ABC)',P_lbl,'#93c5fd');
      break;
    }
    case 'twoPlanes':{
      if (p.subMode === 'oxyz_two_planes') axisOxyz(4.5);
      const u=Number.isFinite(Number(p.turn))?Number(p.turn):1;
      const rad=(p.angle||0)*Math.PI/180,gap=Number(p.gap)||0;
      for(let k=0;k<2;k++){
        const group=new THREE.Group();
        const surf=new THREE.Mesh(new THREE.PlaneGeometry(6.2,5.0),mat(k?0xb45309:0x1d4ed8,.32));
        surf.rotation.x=-Math.PI/2;surf.userData.isFace=true;surf.visible=faces;group.add(surf);
        if(edges){const ed=new THREE.LineSegments(new THREE.EdgesGeometry(surf.geometry),new THREE.LineBasicMaterial({color:k?0xb45309:0x1d4ed8}));ed.rotation.x=-Math.PI/2;group.add(ed);}
        group.position.y=k?gap/2:-gap/2;if(k)group.rotation.z=rad;model.add(group);
      }
      if (p.subMode === 'oxyz_two_planes') {
        model.add(new THREE.ArrowHelper(v(0, 1, 0), v(1.5, -gap / 2, 0), 1.5, 0x1d4ed8, 0.3, 0.14));
        const n2 = v(-Math.sin(rad), Math.cos(rad), 0).normalize();
        model.add(new THREE.ArrowHelper(n2, v(-1.2, gap / 2 - 1.2 * Math.sin(rad), 0), 1.5, 0xc2410c, 0.3, 0.14));
        labelPoint('n₁ ⊥ (P)', [1.8, -gap / 2 + 1.5, 0], '#93c5fd');
        labelPoint('n₂ ⊥ (Q)', [-1.2 + n2.x * 1.6, gap / 2 - 1.2 * Math.sin(rad) + n2.y * 1.6, 0], '#fdba74');
      }
      labelPoint('(P)',[2.6,-gap/2-0.25,2.0],'#93c5fd');
      labelPoint('(Q)',[-2.4,gap/2+(-2.4)*Math.sin(rad)+0.35,2.0],'#fcd34d');
      if(Math.abs(Math.sin(rad))>0.04){
        const ix=-gap/Math.tan(rad);
        if(Math.abs(ix)<3.2){
          const zMov=-2.1+4.2*u;
          const I1=[ix,-gap/2,-2.5],I2=[ix,-gap/2,2.5],Im=[ix,-gap/2,zMov];
          boldLine(I1,I2,0x6d28d9,0.062);
          // Moving coplanar rays from Im into (P) and (Q)
          boldLine(Im,[ix+1.2,-gap/2,zMov],0x1d4ed8,0.034);
          boldLine(Im,[ix-1.2*Math.cos(rad),-gap/2-1.2*Math.sin(rad),zMov],0xb45309,0.034);
          dots([I1,I2],0x6d28d9,0.11);
          dots([Im],0xffd166,0.15);
          labelPoint('M(t) ∈ d',[ix+0.35,(-gap/2)+0.35,zMov],'#fef08a');
          labelPoint('Giao tuyến d = (P) ∩ (Q)',[ix,(-gap/2)+0.42,2.65],'#c4b5fd');
        }
      }else if(Math.abs(gap)>0.05){
        const xMov=-1.8+3.6*u;
        boldLine([xMov,-gap/2,0],[xMov,gap/2,0],0x6d28d9,0.056);
        dots([[xMov,-gap/2,0],[xMov,gap/2,0]],0x6d28d9,0.13);
        labelPoint(`(P) ∥ (Q), d = ${round(Math.abs(gap))}`,[xMov+0.85,0,0],'#c4b5fd');
      }
      break;
    }
    case 'crossSection':{
      const a=p.a,b=p.b,h=p.h;
      solid(new THREE.BoxGeometry(a,h,b),C.face,.14,true);
      const cut=new THREE.Mesh(new THREE.PlaneGeometry(a,b),mat(C.orange,.68));cut.rotation.x=-Math.PI/2;cut.position.y=-h/2+p.t*h/100;cut.userData.isFace=true;cut.visible=faces;model.add(cut);
      const w=new THREE.LineSegments(new THREE.EdgesGeometry(cut.geometry),new THREE.LineBasicMaterial({color:C.red}));w.rotation.x=-Math.PI/2;w.position.copy(cut.position);if(edges)model.add(w);
      break;
    }
    case 'ellipse':{
      axis(5);
      const arr=[];for(let i=0;i<=160;i++){const t=2*Math.PI*i/160;arr.push([p.a*Math.cos(t),p.b*Math.sin(t),0]);}
      line(arr,0x6d28d9,3);
      const cFoc=Math.sqrt(Math.max(0,p.a*p.a-p.b*p.b));
      const F1=[-cFoc,0,0],F2=[cFoc,0,0],M=[p.a*Math.cos(0.75),p.b*Math.sin(0.75),0];
      line([F1,M],0x1d4ed8,2.4);line([F2,M],0x15803d,2.4);
      dots([[p.a,0,0],[-p.a,0,0],[0,p.b,0],[0,-p.b,0]],0x6d28d9,0.09);
      dots([F1],0x1d4ed8,0.11);dots([F2],0x15803d,0.11);dots([M],0xb45309,0.12);
      labelPoint('F₁',[F1[0],-0.38,0],'#93c5fd');labelPoint('F₂',[F2[0],-0.38,0],'#86efac');
      labelPoint('M',[M[0]+0.3,M[1]+0.28,0],'#fcd34d');
      break;
    }
    case 'hyperbola':{
      axis(5);
      for(const sign of [-1,1]){
        const arr=[];for(let i=0;i<=180;i++){const t=-1.45+2.9*i/180;arr.push([sign*p.a*Math.cosh(t),p.b*Math.sinh(t),0]);}
        line(arr,0x6d28d9,2.8);
        const path=new THREE.CatmullRomCurve3(arr.map(point=>v(...point)));
        solid(new THREE.TubeGeometry(path,180,.038,7,false),0x6d28d9,1,false);
      }
      line([[-5,-5*p.b/p.a,0],[5,5*p.b/p.a,0]],0x475569,1.8);
      line([[-5,5*p.b/p.a,0],[5,-5*p.b/p.a,0]],0x475569,1.8);
      const cFoc=Math.hypot(p.a,p.b);
      const F1=[-cFoc,0,0],F2=[cFoc,0,0],M=[p.a*Math.cosh(0.65),p.b*Math.sinh(0.65),0];
      line([F1,M],0x1d4ed8,2.2);line([F2,M],0x15803d,2.2);
      dots([F1],0x1d4ed8,0.11);dots([F2],0x15803d,0.11);dots([M],0xb45309,0.12);
      labelPoint('F₁',[F1[0],-0.38,0],'#93c5fd');labelPoint('F₂',[F2[0],-0.38,0],'#86efac');
      labelPoint('M',[M[0]+0.3,M[1]+0.28,0],'#fcd34d');
      break;
    }
    case 'surface':{
      const N=38,W=5.5,verts=[],inds=[];
      for(let i=0;i<=N;i++)for(let j=0;j<=N;j++){const x=-W/2+W*i/N,z=-W/2+W*j/N;verts.push(x,p.amp*Math.sin(p.freq*x)*Math.cos(p.freq*z),z);}
      for(let i=0;i<N;i++)for(let j=0;j<N;j++){const u=i*(N+1)+j,v=u+(N+1);inds.push(u,u+1,v,v,u+1,v+1);}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(inds);geo.computeVertexNormals();solid(geo,C.violet,.68,false);break;
    }
    case 'linePlane':{
      const pl=new THREE.Mesh(new THREE.PlaneGeometry(6,5),mat(C.teal,.42));pl.rotation.x=-Math.PI/2;pl.userData.isFace=true;pl.visible=faces;model.add(pl);
      if(edges){const e=new THREE.LineSegments(new THREE.EdgesGeometry(pl.geometry),new THREE.LineBasicMaterial({color:C.edge}));e.rotation.x=-Math.PI/2;model.add(e);}
      const t=p.angle*Math.PI/180,dir=v(Math.sin(t),Math.cos(t),0).normalize();const center=v(p.offset,0,0);
      line([center.clone().addScaledVector(dir,-4),center.clone().addScaledVector(dir,4)],C.orange);
      dots([center],C.red);break;
    }
    case 'parallelogram':{
      const a=p.a,b=p.b,h=p.h;
      const dx=Math.sqrt(Math.max(0,b*b-h*h));
      const A=[0,0],B=[a,0],C_pt=[a+dx,h],D_pt=[dx,h];
      polygon3([A,B,C_pt,D_pt],C.teal);
      line([[dx,h,0],[dx,0,0]],C.red);
      loop([[0,0,0],[a,0,0],[a+dx,h,0],[dx,h,0]],C.edge);
      dots([[0,0,0],[a,0,0],[a+dx,h,0],[dx,h,0],[dx,0,0]],C.orange);break;
    }
    case 'symmetryAxis':{
      const a=p.a/2,h=p.h;
      polygon3([[0,h],[-a,0],[a,0]],C.face);
      loop([[0,h,0],[-a,0,0],[a,0,0]],C.edge);
      line([[0,-1,0],[0,h+1.5,0]],0xff5252,3);
      line([[-a*0.6,h*0.4,0],[a*0.6,h*0.4,0]],C.orange);
      dots([[0,h,0],[-a,0,0],[a,0,0],[-a*0.6,h*0.4,0],[a*0.6,h*0.4,0]],C.orange);break;
    }
    case 'symmetryCenter':{
      const a=p.a/2,b=p.b/2,rad=p.deg*Math.PI/180;
      const dx=b*Math.cos(rad),dy=b*Math.sin(rad);
      const A=[-a-dx,-dy],B=[a-dx,-dy],C_pt=[a+dx,dy],D_pt=[-a+dx,dy];
      polygon3([A,B,C_pt,D_pt],C.violet);
      loop([[A[0],A[1],0],[B[0],B[1],0],[C_pt[0],C_pt[1],0],[D_pt[0],D_pt[1],0]],C.edge);
      line([[A[0],A[1],0],[C_pt[0],C_pt[1],0]],C.orange);
      line([[B[0],B[1],0],[D_pt[0],D_pt[1],0]],C.teal);
      dots([[0,0,0]],C.red,0.12);
      dots([[A[0],A[1],0],[B[0],B[1],0],[C_pt[0],C_pt[1],0],[D_pt[0],D_pt[1],0]]);break;
    }
    case 'segmentMidpoint':{
      const l=p.len/2;
      line([[-l,0,0],[l,0,0]],C.teal,4);
      line([[0,-0.4,0],[0,0.4,0]],C.red,3);
      line([[-l/2-0.08,-0.2,0],[-l/2-0.08,0.2,0]],C.orange);
      line([[-l/2+0.08,-0.2,0],[-l/2+0.08,0.2,0]],C.orange);
      line([[l/2-0.08,-0.2,0],[l/2-0.08,0.2,0]],C.orange);
      line([[l/2+0.08,-0.2,0],[l/2+0.08,0.2,0]],C.orange);
      dots([[-l,0,0],[l,0,0]],C.teal,0.1);
      dots([[0,0,0]],C.red,0.12);break;
    }
    case 'barChart':{
      const vals=[p.c1,p.c2,p.c3,p.c4];
      const colors=[C.teal,C.orange,C.violet,0x52b788];
      const spacing=1.6;
      for(let i=0;i<4;i++){
        const h=vals[i];
        const bar=solid(new THREE.BoxGeometry(1.0,h,1.0),colors[i],0.75,true);
        bar.position.set(-2.4+i*spacing,h/2,0);
        if(edges){
          const wire=new THREE.LineSegments(new THREE.EdgesGeometry(bar.geometry),new THREE.LineBasicMaterial({color:C.edge}));
          wire.position.copy(bar.position);model.add(wire);
        }
      }
      line([[-3.4,0,0],[3.8,0,0]],0xffffff);
      line([[-3.4,0,0],[-3.4,11,0]],0xffffff);
      break;
    }
    case 'parallelLines':{
      const d=p.dist/2,rad=p.angle*Math.PI/180;
      line([[-5,d,0],[5,d,0]],C.teal,3);
      line([[-5,-d,0],[5,-d,0]],C.teal,3);
      const L=4;
      line([[-L*Math.cos(rad),-d-L*Math.sin(rad),0],[L*Math.cos(rad),d+L*Math.sin(rad),0]],C.orange,3);
      dots([[0,d,0],[0,-d,0]],C.red,0.12);
      const arc1=[];for(let i=0;i<=30;i++){const t=rad*i/30;arc1.push([0.7*Math.cos(t),d+0.7*Math.sin(t),0]);}line(arc1,0xffd166);
      const arc2=[];for(let i=0;i<=30;i++){const t=Math.PI+rad*i/30;arc2.push([0.7*Math.cos(t),-d+0.7*Math.sin(t),0]);}line(arc2,0xffd166);
      labelPoint('d₁',[-4.4,d+0.35,0],'#67decf');
      labelPoint('d₂',[-4.4,-d+0.35,0],'#67decf');
      labelPoint('c',[L*Math.cos(rad)+0.35,d+L*Math.sin(rad),0],'#ffb657');
      labelPoint('A',[0,d+0.32,0],'#ffd166');
      labelPoint('B',[0,-d-0.32,0],'#ffd166');
      break;
    }
    case 'triangleAngles':{
      const aRad=p.a*Math.PI/180,bRad=p.b*Math.PI/180;
      const cRad=Math.PI-aRad-bRad;
      const base=6;
      const B=[-base/2,0,0],C_pt=[base/2,0,0];
      const cLen=base*Math.sin(cRad)/Math.sin(aRad);
      const A=[-base/2+cLen*Math.cos(bRad),cLen*Math.sin(bRad),0];
      polygon3([A,B,C_pt],C.teal);
      loop([A,B,C_pt],C.edge);
      dots([A,B,C_pt],C.orange,0.1);
      const arcA=[];for(let i=0;i<=24;i++){const t=-Math.PI/2+aRad*i/24;arcA.push([A[0]+0.8*Math.cos(t),A[1]+0.8*Math.sin(t),0]);}line(arcA,C.orange);
      const arcB=[];for(let i=0;i<=24;i++){const t=bRad*i/24;arcB.push([B[0]+0.8*Math.cos(t),B[1]+0.8*Math.sin(t),0]);}line(arcB,0x52b788);
      const arcC=[];for(let i=0;i<=24;i++){const t=Math.PI-cRad*i/24;arcC.push([C_pt[0]+0.8*Math.cos(t),C_pt[1]+0.8*Math.sin(t),0]);}line(arcC,C.violet);
      labelPoint('A',[A[0],A[1]+0.35,0]);
      labelPoint('B',[B[0]-0.3,B[1],0]);
      labelPoint('C',[C_pt[0]+0.3,C_pt[1],0]);
      break;
    }
    case 'congruentTriangles':{
      const rad=p.deg*Math.PI/180;
      const off=2.6;
      const A1=[-off,p.b*Math.sin(rad),0],B1=[-off-p.a,0,0],C1=[-off,0,0];
      polygon3([A1,B1,C1],C.teal);
      loop([A1,B1,C1],C.edge);
      const A2=[off,p.b*Math.sin(rad),0],B2=[off,0,0],C2=[off+p.a,0,0];
      polygon3([A2,B2,C2],C.orange);
      loop([A2,B2,C2],C.edge);
      dots([A1,B1,C1,A2,B2,C2],C.red,0.09);
      labelPoint('A',[A1[0],A1[1]+0.3,0]);labelPoint('B',[B1[0]-0.25,B1[1],0]);labelPoint('C',[C1[0]+0.25,C1[1],0]);
      labelPoint("A'",[A2[0],A2[1]+0.3,0]);labelPoint("B'",[B2[0]-0.25,B2[1],0]);labelPoint("C'",[C2[0]+0.25,C2[1],0]);
      break;
    }
    case 'pieChart':{
      const total=p.p1+p.p2+p.p3;
      const angles=[(p.p1/total)*Math.PI*2,(p.p2/total)*Math.PI*2,(p.p3/total)*Math.PI*2];
      const colors=[C.teal,C.orange,C.violet];
      let curAngle=0;
      for(let i=0;i<3;i++){
        const sliceGeo=new THREE.CylinderGeometry(2.8,2.8,0.7,32,1,false,curAngle,angles[i]);
        solid(sliceGeo,colors[i],0.8,true);
        curAngle+=angles[i];
      }
      break;
    }
    case 'triangleCenters':{
      const A=[0,4.5,0],B=[-3.5,-1.5,0],C_pt=[4,-1.5,0];
      polygon3([A,B,C_pt],C.face);
      loop([A,B,C_pt],C.edge);
      const M=[(B[0]+C_pt[0])/2,(B[1]+C_pt[1])/2,0];
      const N=[(A[0]+C_pt[0])/2,(A[1]+C_pt[1])/2,0];
      const P=[(A[0]+B[0])/2,(A[1]+B[1])/2,0];
      line([A,M],C.orange);line([B,N],C.orange);line([C_pt,P],C.orange);
      const G=[(A[0]+B[0]+C_pt[0])/3,(A[1]+B[1]+C_pt[1])/3,0];
      dots([G],C.red,0.15);
      dots([A,B,C_pt,M,N,P],C.teal,0.08);
      labelPoint('A',[A[0],A[1]+0.35,0]);labelPoint('B',[B[0]-0.3,B[1],0]);labelPoint('C',[C_pt[0]+0.3,C_pt[1],0]);
      labelPoint('G',[G[0],G[1]+0.32,0],'#ffd166');
      labelPoint('M',[M[0],M[1]-0.3,0]);labelPoint('N',[N[0]+0.3,N[1],0]);labelPoint('P',[P[0]-0.3,P[1],0]);
      break;
    }
    case 'prismQuad':{
      // Four-sided right prism: isosceles trapezium base in the XZ plane,
      // perpendicular edges along Y, labels anchored to actual vertices.
      const a=p.a/2,b=p.b/2,hb=p.h_base/2,h=p.h,y0=-h/2,y1=h/2;
      const pts=[[-a,y0,-hb],[a,y0,-hb],[b,y0,hb],[-b,y0,hb],
                 [-a,y1,-hb],[a,y1,-hb],[b,y1,hb],[-b,y1,hb]];
      // Keep one watertight 12-triangle mesh for geometry invariants/tests.
      // Differentiate the two congruent parallel bases by colored edge loops.
      triangles(pts,[[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]],C.teal);
      loop(pts.slice(0,4),0x1d4ed8);
      loop(pts.slice(4,8),0x15803d);
      ['A','B','C','D',"A'","B'","C'","D'"].forEach((name,i)=>labelPoint(name,pts[i]));
      break;
    }
    // ==========================================
    // --- CÁC MÔ HÌNH MỚI TOÁN LỚP 8 ---
    // ==========================================
    case 'thales':{
      const A=[0,5,0], B=[-3.5,-1.5,0], C_pt=[4,-1.5,0];
      polygon3([A,B,C_pt],C.teal);
      loop([A,B,C_pt],C.edge);
      const k=p.k/100;
      const M=[A[0]+(B[0]-A[0])*k, A[1]+(B[1]-A[1])*k, 0];
      const N=[A[0]+(C_pt[0]-A[0])*k, A[1]+(C_pt[1]-A[1])*k, 0];
      line([M,N],C.orange,3);
      dots([A,B,C_pt,M,N],C.red,0.1);
      labelPoint('A',[A[0],A[1]+0.35,0]);labelPoint('B',[B[0]-0.35,B[1],0]);labelPoint('C',[C_pt[0]+0.35,C_pt[1],0]);
      labelPoint('M',[M[0]-0.35,M[1],0],'#ffd166');labelPoint('N',[N[0]+0.35,N[1],0],'#ffd166');
      break;
    }
    case 'midSegment':{
      const half=p.a/2, h=p.h;
      const A=[0,h,0], B=[-half,0,0], C_pt=[half,0,0];
      polygon3([A,B,C_pt],C.teal);
      loop([A,B,C_pt],C.edge);
      const M=[(A[0]+B[0])/2,(A[1]+B[1])/2,0];
      const N=[(A[0]+C_pt[0])/2,(A[1]+C_pt[1])/2,0];
      line([M,N],C.orange,3);
      line([[0,h,0],[0,0,0]],C.grid);
      dots([A,B,C_pt,M,N],C.red,0.1);
      labelPoint('A',[0,h+0.35,0]);labelPoint('B',[-half-0.3,0,0]);labelPoint('C',[half+0.3,0,0]);
      labelPoint('M',[M[0]-0.35,M[1],0],'#ffd166');labelPoint('N',[N[0]+0.35,N[1],0],'#ffd166');
      labelPoint('H',[0,-0.3,0],'#8cb8ff');
      break;
    }
    case 'parallelogramMid':{
      const rad=p.deg*Math.PI/180;
      const dx=p.b*Math.cos(rad), dy=p.b*Math.sin(rad);
      const A=[0,0,0], B=[p.a,0,0], C_pt=[p.a+dx,dy,0], D_pt=[dx,dy,0];
      polygon3([A,B,C_pt,D_pt],C.teal);
      loop([A,B,C_pt,D_pt],C.edge);
      line([A,C_pt],C.orange);line([B,D_pt],C.orange);
      const O=[(A[0]+C_pt[0])/2,(A[1]+C_pt[1])/2,0];
      dots([A,B,C_pt,D_pt,O],C.red,0.1);
      labelPoint('A',[A[0]-0.3,A[1],0]);labelPoint('B',[B[0]+0.3,B[1],0]);
      labelPoint('C',[C_pt[0]+0.3,C_pt[1]+0.3,0]);labelPoint('D',[D_pt[0]-0.3,D_pt[1]+0.3,0]);
      labelPoint('O',[O[0],O[1]+0.35,0],'#ffd166');
      break;
    }
    case 'rectangleSquare':{
      const a=p.a, b=p.b;
      polygon3([[0,0],[a,0],[a,b],[0,b]],C.teal);
      loop([[0,0,0],[a,0,0],[a,b,0],[0,b,0]],C.edge);
      line([[0,0,0],[a,b,0]],C.orange);line([[a,0,0],[0,b,0]],C.orange);
      const O=[a/2,b/2,0];
      dots([[0,0,0],[a,0,0],[a,b,0],[0,b,0],O],C.red,0.1);
      labelPoint('A',[-0.3,-0.3,0]);labelPoint('B',[a+0.3,-0.3,0]);
      labelPoint('C',[a+0.3,b+0.3,0]);labelPoint('D',[-0.3,b+0.3,0]);
      labelPoint('O',[O[0],O[1]+0.35,0],'#ffd166');
      break;
    }
    case 'similarTriangles':{
      const k=p.k, base=p.a;
      const A1=[0,3.5,0], B1=[-base/2,0,0], C1=[base/2,0,0];
      polygon3([A1,B1,C1],C.teal);
      loop([A1,B1,C1],C.edge);
      const offX=base+2;
      const A2=[offX, 3.5*k, 0], B2=[offX-base*k/2, 0, 0], C2=[offX+base*k/2, 0, 0];
      polygon3([A2,B2,C2],C.orange);
      loop([A2,B2,C2],C.edge);
      dots([A1,B1,C1,A2,B2,C2],C.red,0.09);
      labelPoint('A',[A1[0],A1[1]+0.3,0]);labelPoint('B',[B1[0]-0.3,B1[1],0]);labelPoint('C',[C1[0]+0.3,C1[1],0]);
      labelPoint("A'",[A2[0],A2[1]+0.3,0]);labelPoint("B'",[B2[0]-0.3,B2[1],0]);labelPoint("C'",[C2[0]+0.3,C2[1],0]);
      break;
    }
    case 'linearSlope':{
      axis(4.5);
      curve(x=>p.a*x+p.b,-5,5,80,C.teal);
      const x0=1, y0=p.a*x0+p.b;
      const x1=2, y1=p.a*x1+p.b;
      line([[x0,y0,0],[x1,y0,0]],C.orange,3);
      line([[x1,y0,0],[x1,y1,0]],C.red,3);
      dots([[x0,y0,0],[x1,y1,0],[x1,y0,0]],C.orange,0.1);
      labelPoint(`a = ${p.a}`,[x1+0.4,(y0+y1)/2,0],'#ff8d8d');
      labelPoint(`b = ${p.b}`,[-0.35,p.b+0.25,0],'#ffd166');
      break;
    }
    // ==========================================
    // --- CÁC MÔ HÌNH MỚI TOÁN LỚP 9 ---
    // ==========================================
    case 'sphereSection':{
      const R=p.r,d=Math.max(0,Number(p.d)||0),theta=((Number(p.turn)||0.12)*Math.PI*2);
      solid(new THREE.SphereGeometry(R,42,28),0x38bdf8,0.24,false);
      // Đường tròn lớn Xích đạo (y = 0) & Kinh tuyến tham chiếu
      const eqPts=[],merPts=[];
      for(let i=0;i<=64;i++){
        const a=(i*2*Math.PI)/64;
        eqPts.push([R*Math.cos(a),0,R*Math.sin(a)]);
        merPts.push([R*Math.cos(a),R*Math.sin(a),0]);
      }
      line(eqPts,0x38bdf8,2.0);
      line(merPts,0x94a3b8,1.5);
      // Mặt phẳng cắt (P) nằm ngang tại độ cao y = d (xanh dương trong suốt)
      const cutPlane=new THREE.Mesh(new THREE.PlaneGeometry(R*2.35,R*2.35),mat(0x1d4ed8,0.22));
      cutPlane.rotation.x=-Math.PI/2;
      cutPlane.position.y=d;
      cutPlane.userData.isFace=true;
      cutPlane.visible=faces;
      model.add(cutPlane);
      if(edges){
        const plEdge=new THREE.LineSegments(new THREE.EdgesGeometry(cutPlane.geometry),new THREE.LineBasicMaterial({color:0x3b82f6,linewidth:2}));
        plEdge.rotation.x=-Math.PI/2;
        plEdge.position.y=d;
        model.add(plEdge);
      }
      const O=[0,0,0],H=[0,d,0];
      boldLine(O,H,0x6d28d9,0.052);
      labelPoint('O',[-0.35,-0.28,0],'#ffd166');
      labelPoint('(P)',[R*1.05,d+0.22,R*1.05],'#60a5fa');
      if(Math.abs(d-R)<=1e-5){
        // d = R: Mặt phẳng tiếp xúc mặt cầu tại đúng 1 điểm H
        dots([O,H],0x6d28d9,0.14);
        labelPoint('H (Tiếp điểm d = R)',[0.25,d+0.35,0],'#c4b5fd');
      }else if(d<R){
        // 0 <= d < R: Hình tròn thiết diện bán kính r = sqrt(R^2 - d^2)
        const r_sec=Math.sqrt(Math.max(0.0001, R*R - d*d));
        const secMesh=solid(new THREE.CircleGeometry(r_sec,56),0xb45309,0.72,false);
        secMesh.rotation.x=-Math.PI/2;
        secMesh.position.y=d+0.004;
        const circlePts=[];
        for(let i=0;i<=64;i++){const t=(i*2*Math.PI)/64;circlePts.push([r_sec*Math.cos(t),d+0.008,r_sec*Math.sin(t)]);}
        line(circlePts,0xf59e0b,3.5);
        const mx=r_sec*Math.cos(theta),mz=r_sec*Math.sin(theta),M=[mx,d,mz];
        boldLine(H,M,0xb45309,0.052);
        boldLine(O,M,0x1d4ed8,0.052);
        if(Math.abs(d)>0.15&&r_sec>0.2){
          rightAngleMark(H,[Math.cos(theta),0,Math.sin(theta)],[0,d>0?-1:1,0],Math.min(0.32,Math.abs(d)*0.45,r_sec*0.4),0x6d28d9);
        }
        dots([O,H,M],0xb45309,0.12);
        labelPoint('H',[-0.35,d+0.32,0],'#c4b5fd');
        labelPoint('M',[mx*1.18,d+0.25,mz*1.18],'#fef08a');
        labelPoint(`r = ${round(r_sec)}`,[mx*0.52,d+0.28,mz*0.52],'#fbbf24');
        labelPoint(`R = ${round(R)}`,[mx*0.48,d*0.45-0.22,mz*0.48],'#93c5fd');
      }else{
        // d > R: Không giao nhau
        dots([O,H],0xb91c1c,0.12);
        labelPoint(`H (d = ${round(d)} > R: Không giao)`,[0.25,d+0.35,0],'#fca5a5');
      }
      break;
    }
    case 'trigTriangle':{
      const b=p.b, c=p.c;
      const a=Math.sqrt(Math.max(0.1, c*c - b*b));
      const A=[0,0,0], B=[a,0,0], C_pt=[0,b,0];
      polygon3([A,B,C_pt],0x1d4ed8);
      // Đối cam (#B45309), kề xanh dương (#1D4ED8), huyền xanh lá (#15803D); góc đang xét tím (#6D28D9)
      boldLine(A,B,0x1d4ed8,0.045);
      boldLine(A,C_pt,0xb45309,0.048);
      boldLine(B,C_pt,0x15803d,0.048);
      line([[0.4,0,0],[0.4,0.4,0]],0x6d28d9);
      line([[0.4,0.4,0],[0,0.4,0]],0x6d28d9);
      const arcB=[];
      const radB=Math.atan2(b, a);
      for(let i=0;i<=20;i++){const t=Math.PI-radB*i/20;arcB.push([a+0.8*Math.cos(t),0.8*Math.sin(t),0]);}
      line(arcB,0x6d28d9,3);
      dots([A,B,C_pt],0xb45309,0.1);
      labelPoint('A',[A[0]-0.3,A[1]-0.3,0]);
      labelPoint('B',[B[0]+0.35,B[1]-0.25,0],'#c4b5fd');
      labelPoint('C',[C_pt[0]-0.3,C_pt[1]+0.3,0]);
      labelPoint(`kề: ${Math.round(a*10)/10}`,[a/2,-0.35,0],'#93c5fd');
      labelPoint(`đối: ${b}`,[-0.55,b/2,0],'#fcd34d');
      labelPoint(`huyền: ${c}`,[a/2+0.35,b/2+0.25,0],'#86efac');
      break;
    }
    case 'circleTangent':{
      const R=p.r;
      const circlePts=[];
      for(let i=0;i<=64;i++){const t=i*2*Math.PI/64;circlePts.push([R*Math.cos(t),R*Math.sin(t),0]);}
      line(circlePts,0x1d4ed8,2.8);
      dots([[0,0,0]],0x1d4ed8,0.12);
      const H=[0,-p.d,0];
      line([[-5,-p.d,0],[5,-p.d,0]],0xb45309,3.2);
      line([[0,0,0],H],0x6d28d9,2.8);
      dots([H],0x6d28d9,0.12);
      labelPoint('O',[0,0.3,0],'#93c5fd');
      labelPoint('T (H)',[0,-p.d-0.35,0],'#c4b5fd');
      labelPoint('a',[4,-p.d+0.35,0],'#fcd34d');
      break;
    }
    case 'circleInscribed':{
      const R=p.r, rad=p.deg*Math.PI/180;
      const circlePts=[],arcPts=[];
      for(let i=0;i<=64;i++){const t=i*2*Math.PI/64;circlePts.push([R*Math.cos(t),R*Math.sin(t),0]);}
      for(let i=0;i<=32;i++){const t=-rad/2+rad*i/32;arcPts.push([R*Math.cos(t),R*Math.sin(t),0.01]);}
      line(circlePts,0x475569,1.8);
      line(arcPts,0x6d28d9,3.5);
      const O=[0,0,0];
      const A=[R*Math.cos(-rad/2),R*Math.sin(-rad/2),0];
      const B=[R*Math.cos(rad/2),R*Math.sin(rad/2),0];
      const M=[-R,0,0];
      line([O,A],0x1d4ed8,2.8);line([O,B],0x1d4ed8,2.8);
      line([M,A],0xb45309,2.8);line([M,B],0xb45309,2.8);
      dots([O,A,B,M],0x6d28d9,0.1);
      labelPoint('O',[0.25,-0.2,0],'#93c5fd');
      labelPoint('A',[A[0]+0.35,A[1],0],'#c4b5fd');
      labelPoint('B',[B[0]+0.35,B[1],0],'#c4b5fd');
      labelPoint('M',[M[0]-0.35,M[1],0],'#fcd34d');
      break;
    }
    case 'circumIncircle':{
      const a=p.a, b=p.b, c=p.c;
      const cosA=(b*b+c*c-a*a)/(2*b*c);
      const sinA=Math.sqrt(Math.max(0,1-cosA*cosA));
      const A=[0,0,0], B=[c,0,0], C_pt=[b*cosA, b*sinA, 0];
      polygon3([A,B,C_pt],0x475569);
      loop([A,B,C_pt],C.edge);
      const D=2*(A[0]*(B[1]-C_pt[1]) + B[0]*(C_pt[1]-A[1]) + C_pt[0]*(A[1]-B[1]));
      const ox=((A[0]**2+A[1]**2)*(B[1]-C_pt[1]) + (B[0]**2+B[1]**2)*(C_pt[1]-A[1]) + (C_pt[0]**2+C_pt[1]**2)*(A[1]-B[1]))/D;
      const oy=((A[0]**2+A[1]**2)*(C_pt[0]-B[0]) + (B[0]**2+B[1]**2)*(A[0]-C_pt[0]) + (C_pt[0]**2+C_pt[1]**2)*(B[0]-A[0]))/D;
      const R_out=Math.hypot(A[0]-ox, A[1]-oy);
      const outCircle=[];
      for(let i=0;i<=64;i++){const t=i*2*Math.PI/64;outCircle.push([ox+R_out*Math.cos(t),oy+R_out*Math.sin(t),0]);}
      line(outCircle,0x6d28d9,2.4);
      const ix=(a*A[0]+b*B[0]+c*C_pt[0])/(a+b+c);
      const iy=(a*A[1]+b*B[1]+c*C_pt[1])/(a+b+c);
      const semi=(a+b+c)/2;
      const r_in=Math.sqrt(Math.max(0.1,(semi-a)*(semi-b)*(semi-c)/semi));
      const inCircle=[];
      for(let i=0;i<=48;i++){const t=i*2*Math.PI/48;inCircle.push([ix+r_in*Math.cos(t),iy+r_in*Math.sin(t),0]);}
      line(inCircle,0xb45309,2.4);
      dots([A,B,C_pt,[ox,oy,0],[ix,iy,0]],0x6d28d9,0.1);
      labelPoint('A',[A[0]-0.3,A[1]-0.3,0]);labelPoint('B',[B[0]+0.3,B[1]-0.3,0]);labelPoint('C',[C_pt[0],C_pt[1]+0.35,0]);
      labelPoint('O',[ox,oy-0.3,0],'#c4b5fd');labelPoint('I',[ix,iy+0.3,0],'#fcd34d');
      break;
    }
    case 'cyclicQuad':{
      const R=p.r, r1=p.a1*Math.PI/180, r2=p.a2*Math.PI/180;
      const circlePts=[];
      for(let i=0;i<=64;i++){const t=i*2*Math.PI/64;circlePts.push([R*Math.cos(t),R*Math.sin(t),0]);}
      line(circlePts,0x1d4ed8,2.4);
      const A=[R*Math.cos(r1),R*Math.sin(r1),0];
      const B=[R*Math.cos(r2),R*Math.sin(r2),0];
      const C_pt=[R*Math.cos(r1+Math.PI),R*Math.sin(r1+Math.PI),0];
      const D_pt=[R*Math.cos(r2+Math.PI),R*Math.sin(r2+Math.PI),0];
      polygon3([A,B,C_pt,D_pt],0x1d4ed8);
      loop([A,B,C_pt,D_pt],0x15803d);
      dots([A,B,C_pt,D_pt],0xb45309,0.1);
      labelPoint('A',[A[0]+0.3,A[1]+0.3,0],'#fcd34d');labelPoint('B',[B[0]-0.3,B[1]+0.3,0]);
      labelPoint('C',[C_pt[0]-0.3,C_pt[1]-0.3,0],'#86efac');labelPoint('D',[D_pt[0]+0.3,D_pt[1]-0.3,0]);
      break;
    }
    // ==========================================
    // --- CÁC MÔ HÌNH MỚI TOÁN LỚP 10 (R83 SEMANTIC PALETTE) ---
    // ==========================================
    case 'parabolaGeneral':{
      axis(5);
      const f=x=>p.a*x*x+p.b*x+p.c;
      curve(f,-5,5,220,0x1d4ed8);
      if(Math.abs(p.a)>1e-8){
        const vx=-p.b/(2*p.a),vy=f(vx),delta=p.b*p.b-4*p.a*p.c;
        if(Math.abs(vx)<100&&Math.abs(vy)<100){
          line([[vx,-5,0],[vx,5,0]],0x475569,1.8);
          dots([[vx,vy,0]],0x6d28d9,0.14);
          dots([[0,p.c,0]],0x15803d,0.11);
          labelPoint(`I(${round(vx)}, ${round(vy)})`,[vx+.35,vy+.32,0],'#c4b5fd');
          labelPoint(`(0, ${round(p.c)})`,[-0.45,p.c+0.25,0],'#86efac');
          if(delta>=0){
            const rt=Math.sqrt(delta),x1=(-p.b-rt)/(2*p.a),x2=(-p.b+rt)/(2*p.a);
            dots([[x1,0,0],[x2,0,0]],0x6d28d9,0.11);
          }
        }
      }break;
    }
    case 'inequalityRegion':{
      axis(4.5);
      const nn=v(p.a,p.b,0),denom=nn.lengthSq();
      const pt=nn.clone().multiplyScalar(p.c/denom),dir=v(-p.b,p.a,0).normalize(),inDir=nn.clone().normalize().negate();
      const pA=pt.clone().addScaledVector(dir,-4.5),pB=pt.clone().addScaledVector(dir,4.5);
      const pC=pB.clone().addScaledVector(inDir,3.2),pD=pA.clone().addScaledVector(inDir,3.2);
      polygon3([[pA.x,pA.y,0],[pB.x,pB.y,0],[pC.x,pC.y,0],[pD.x,pD.y,0]],0x15803d);
      line([pt.clone().addScaledVector(dir,-7),pt.clone().addScaledVector(dir,7)],0x1d4ed8,3.2);
      model.add(new THREE.ArrowHelper(nn.clone().normalize(),pt,1.4,0xb45309,.32,.16));
      const okO=(0<=p.c+1e-9);
      dots([[0,0,0]],okO?0x6d28d9:0xb91c1c,0.13);
      labelPoint('n',[pt.x+p.a/Math.sqrt(denom)*1.7,pt.y+p.b/Math.sqrt(denom)*1.7,0],'#fcd34d');
      labelPoint(okO?'O(0,0) ∈ S':'O(0,0) ∉ S',[0.35,-0.32,0],okO?'#c4b5fd':'#fca5a5');
      break;
    }
    case 'triangleLaws':{
      const a=p.a, b=p.b, c=p.c;
      const cosA=(b*b+c*c-a*a)/(2*b*c);
      const sinA=Math.sqrt(Math.max(0,1-cosA*cosA));
      const A=[0,0,0], B=[c,0,0], C_pt=[b*cosA, b*sinA, 0];
      polygon3([A,B,C_pt],0x1d4ed8);
      line([A,B],0x1d4ed8,2.8);line([A,C_pt],0x1d4ed8,2.8);line([B,C_pt],0x6d28d9,3.2);
      line([C_pt,[C_pt[0],0,0]],0x15803d,2.2);
      dots([A,B,C_pt],0xb45309,0.11);
      labelPoint('A',[A[0]-0.3,A[1]-0.3,0]);labelPoint('B',[B[0]+0.3,B[1]-0.3,0]);labelPoint('C',[C_pt[0],C_pt[1]+0.35,0]);
      labelPoint(`c=${c}`,[c/2,-0.35,0],'#93c5fd');
      labelPoint(`b=${b}`,[C_pt[0]/2-0.35,C_pt[1]/2,0],'#93c5fd');
      labelPoint(`a=${a}`,[(B[0]+C_pt[0])/2+0.35,(B[1]+C_pt[1])/2,0],'#c4b5fd');
      break;
    }
    case 'vectorParallelogram':{
      axis(4.5);
      const O=[0,0,0], A=[p.ux,p.uy,0], B=[p.vx,p.vy,0], C_pt=[p.ux+p.vx,p.uy+p.vy,0];
      polygon3([O,A,C_pt,B],0x6d28d9);
      model.add(new THREE.ArrowHelper(v(...A).normalize(),v(0,0,0),v(...A).length(),0x1d4ed8,0.35,0.15));
      model.add(new THREE.ArrowHelper(v(...B).normalize(),v(0,0,0),v(...B).length(),0x15803d,0.35,0.15));
      model.add(new THREE.ArrowHelper(v(...C_pt).normalize(),v(0,0,0),v(...C_pt).length(),0x6d28d9,0.45,0.2));
      line([A,C_pt],0xb45309,2.2);line([B,C_pt],0xb45309,2.2);
      dots([O,A,B,C_pt],0x6d28d9,0.1);
      labelPoint('O',[0,-0.3,0]);labelPoint('u',[A[0]+0.3,A[1],0],'#93c5fd');
      labelPoint('v',[B[0]+0.3,B[1],0],'#86efac');labelPoint('u + v',[C_pt[0]+0.4,C_pt[1]+0.3,0],'#c4b5fd');
      break;
    }
    case 'vectorDot':{
      axis(4);
      const rad=p.deg*Math.PI/180;
      const A=[p.ulen,0,0], B=[p.vlen*Math.cos(rad),p.vlen*Math.sin(rad),0];
      model.add(new THREE.ArrowHelper(v(1,0,0),v(0,0,0),p.ulen,0x1d4ed8,0.35,0.15));
      model.add(new THREE.ArrowHelper(v(...B).normalize(),v(0,0,0),p.vlen,0x15803d,0.35,0.15));
      const H=[B[0],0,0];
      line([B,H],0xb45309,2.2);
      line([[0,0,0],H],Math.cos(rad)>=0?0x6d28d9:0xb91c1c,3.2);
      const arc=[];for(let i=0;i<=24;i++){const t=rad*i/24;arc.push([0.8*Math.cos(t),0.8*Math.sin(t),0]);}
      line(arc,0xb45309,2.5);
      dots([[0,0,0],A,B,H],0x6d28d9,0.1);
      labelPoint('O',[-0.3,-0.2,0]);labelPoint('u',[p.ulen+0.3,0,0],'#93c5fd');
      labelPoint('v',[B[0]+0.3,B[1]+0.2,0],'#86efac');
      labelPoint('H',[H[0],-0.32,0],'#c4b5fd');
      labelPoint('θ',[0.9*Math.cos(rad/2)+0.2,0.9*Math.sin(rad/2),0],'#fcd34d');
      break;
    }
    case 'lineOxy':{
      axis(4.5);
      const nn=v(p.a,p.b,0),denom=nn.lengthSq();
      const mid=nn.clone().multiplyScalar(-p.c/denom);
      const dir=v(-p.b,p.a,0).normalize();
      line([mid.clone().addScaledVector(dir,-7),mid.clone().addScaledVector(dir,7)],0x1d4ed8,3);
      model.add(new THREE.ArrowHelper(nn.clone().normalize(),mid,1.6,0xb45309,.35,.15));
      model.add(new THREE.ArrowHelper(dir.clone(),mid,1.6,0x15803d,.35,.15));
      dots([mid],0x6d28d9,.12);
      labelPoint('n',[mid.x+nn.x/Math.sqrt(denom)*1.8,mid.y+nn.y/Math.sqrt(denom)*1.8,0],'#fcd34d');
      labelPoint('u',[mid.x+dir.x*1.8,mid.y+dir.y*1.8,0],'#86efac');
      labelPoint('M₀',[mid.x-0.32,mid.y-0.32,0],'#c4b5fd');
      break;
    }
    case 'circleOxy':{
      axis(4.5);
      const circlePts=[];
      for(let i=0;i<=64;i++){const t=i*2*Math.PI/64;circlePts.push([p.a+p.r*Math.cos(t),p.b+p.r*Math.sin(t),0]);}
      line(circlePts,0x6d28d9,2.8);
      const M=[p.a+p.r*Math.cos(0.65),p.b+p.r*Math.sin(0.65),0],Mx=[M[0],p.b,0];
      line([[p.a,p.b,0],Mx],0x15803d,2);line([Mx,M],0x15803d,2);
      line([[p.a,p.b,0],M],0xb45309,2.8);
      dots([[p.a,p.b,0]],0x1d4ed8,0.12);dots([M],0xb45309,0.12);
      labelPoint(`I(${p.a}, ${p.b})`,[p.a,p.b-0.35,0],'#93c5fd');
      labelPoint(`R = ${p.r}`,[(p.a+M[0])/2-0.2,(p.b+M[1])/2+0.28,0],'#fcd34d');
      labelPoint('M',[M[0]+0.28,M[1]+0.25,0],'#c4b5fd');
      break;
    }
    // ==========================================
    // --- CÁC MÔ HÌNH MỚI TOÁN LỚP 11 ---
    // ==========================================
    case 'skewLines':{
      const u = Number.isFinite(Number(p.turn)) ? Number(p.turn) : 1;
      const d = p.dist / 2, rad = (p.angle * Math.PI) / 180;
      const planeW = 8.5, planeD = 6.5;

      if (Math.abs(p.angle) < 1e-4) {
        // 11-06-C01: Hai đường thẳng song song đồng phẳng d₁ ∥ d₂ ⊂ (P)
        const pP = new THREE.Mesh(new THREE.PlaneGeometry(planeW, planeD), mat(0x1d4ed8, 0.22));
        pP.rotation.x = -Math.PI / 2;
        pP.userData.isFace = true; pP.visible = faces; model.add(pP);
        if(edges){
          const edgeP = new THREE.LineSegments(new THREE.EdgesGeometry(pP.geometry), new THREE.LineBasicMaterial({color: 0x1d4ed8, linewidth: 2}));
          edgeP.quaternion.copy(pP.quaternion); edgeP.position.copy(pP.position); model.add(edgeP);
        }
        const zGap = Math.max(0.6, Math.min(2.4, p.dist / 2));
        boldLine([-3.8, 0.02, -zGap], [3.8, 0.02, -zGap], 0x1d4ed8, 0.055);
        boldLine([-3.8, 0.02, zGap], [3.8, 0.02, zGap], 0x047857, 0.055);
        // Khoảng cách vuông góc chung A(t)B(t) trượt dọc hai đường song song trên (P) đồng bộ 2D
        const xMov = -2.4 + 4.8 * u;
        const A = [xMov, 0.03, -zGap], B = [xMov, 0.03, zGap];
        boldLine([0, 0.025, -zGap], [0, 0.025, zGap], 0x64748b, 0.032, 0.7);
        boldLine(A, B, 0x6d28d9, 0.065);
        dots([A, B], 0xffd166, 0.14);
        rightAngleMark(A, [1, 0, 0], [0, 0, 1], 0.35, 0x6d28d9);
        rightAngleMark(B, [1, 0, 0], [0, 0, -1], 0.35, 0x6d28d9);
        labelPoint('d₁ ⊂ (P)', [-3.2, 0.32, -zGap], '#93c5fd');
        labelPoint('d₂ ⊂ (P) (d₁ ∥ d₂)', [-3.2, 0.32, zGap], '#6ee7b7');
        labelPoint('(P)', [3.4, 0.22, 2.5], '#93c5fd');
        labelPoint('A(t)', [xMov + 0.35, 0.28, -zGap], '#c4b5fd');
        labelPoint('B(t)', [xMov + 0.35, 0.28, zGap], '#c4b5fd');
        labelPoint(`d(d₁, d₂) = ${round(p.dist)}`, [xMov + 0.65, 0.32, 0], '#c4b5fd');
        break;
      }

      if (Math.abs(p.dist) < 1e-4) {
        // 11-07-C01: Góc giữa hai đường thẳng — Tịnh tiến đường thẳng d₂ từ độ cao hLift xuống cắt d₁ tại O trên (P)
        const pP = new THREE.Mesh(new THREE.PlaneGeometry(planeW, planeD), mat(0x1d4ed8, 0.20));
        pP.rotation.x = -Math.PI / 2;
        pP.userData.isFace = true; pP.visible = faces; model.add(pP);
        if(edges){
          const edgeP = new THREE.LineSegments(new THREE.EdgesGeometry(pP.geometry), new THREE.LineBasicMaterial({color: 0x1d4ed8, linewidth: 2}));
          edgeP.quaternion.copy(pP.quaternion); edgeP.position.copy(pP.position); model.add(edgeP);
        }
        const d2_dirX = Math.cos(rad), d2_dirZ = Math.sin(rad), hLift = 1.65;
        const yTrans = hLift * (1 - u) + 0.03;
        // d₁ nằm trên (P), d₂ ở trên cao, d₂'(t) tịnh tiến dần từ d₂ xuống cắt d₁ tại O(0,0,0)
        boldLine([-3.8, 0.02, 0], [3.8, 0.02, 0], 0x1d4ed8, 0.055);
        boldLine([-3.2 * d2_dirX, hLift, -3.2 * d2_dirZ], [3.2 * d2_dirX, hLift, 3.2 * d2_dirZ], 0x047857, 0.044);
        boldLine([-3.6 * d2_dirX, yTrans, -3.6 * d2_dirZ], [3.6 * d2_dirX, yTrans, 3.6 * d2_dirZ], 0xb45309, 0.058);
        boldLine([0, 0, 0], [0, hLift, 0], 0x64748b, 0.028, 0.75);
        dots([[0, 0.03, 0], [0, hLift, 0], [0, yTrans, 0]], 0x6d28d9, 0.13);
        if (Math.abs(p.angle - 90) < 3) {
          rightAngleMark([0, 0.04, 0], [1, 0, 0], [d2_dirX, 0, d2_dirZ], 0.42, 0x6d28d9);
        }
        const arcPts = [];
        for (let i = 0; i <= 24; i++) {
          const t = (rad * i) / 24;
          arcPts.push([1.25 * Math.cos(t), 0.04, 1.25 * Math.sin(t)]);
        }
        for (let i = 0; i < arcPts.length - 1; i++) boldLine(arcPts[i], arcPts[i + 1], 0x6d28d9, 0.026);
        const midT = rad / 2;
        labelPoint('d₁', [3.2, 0.32, 0], '#93c5fd');
        labelPoint('d₂', [2.6 * d2_dirX, hLift + 0.32, 2.6 * d2_dirZ], '#6ee7b7');
        labelPoint("d₂' ∥ d₂", [3.0 * d2_dirX, yTrans + 0.32, 3.0 * d2_dirZ], '#fcd34d');
        labelPoint('O', [-0.35, 0.3, 0], '#c4b5fd');
        labelPoint(`φ = (d₁, d₂) = ${round(p.angle)}°`, [1.75 * Math.cos(midT), 0.34, 1.75 * Math.sin(midT)], '#c4b5fd');
        break;
      }

      if (p.subMode === 'skew_check') {
        // 11-05-C03: Hai đường thẳng chéo nhau — Điểm thử M(t) trượt trên d₂ cùng hình chiếu vuông góc xuống (P) để chứng minh không cắt d₁
        const pP = new THREE.Mesh(new THREE.PlaneGeometry(planeW, planeD), mat(0x1d4ed8, 0.22));
        pP.rotation.x = -Math.PI / 2;
        pP.position.y = -d;
        pP.userData.isFace = true; pP.visible = faces; model.add(pP);
        if(edges){
          const edgeP = new THREE.LineSegments(new THREE.EdgesGeometry(pP.geometry), new THREE.LineBasicMaterial({color: 0x1d4ed8, linewidth: 2}));
          edgeP.quaternion.copy(pP.quaternion); edgeP.position.copy(pP.position); model.add(edgeP);
        }
        const d1_p1 = [-4, -d, 0], d1_p2 = [4, -d, 0];
        boldLine(d1_p1, d1_p2, 0x1d4ed8, 0.055);
        const d2_dirX = Math.cos(rad), d2_dirZ = Math.sin(rad);
        const d2_p1 = [-4 * d2_dirX, d, -4 * d2_dirZ], d2_p2 = [4 * d2_dirX, d, 4 * d2_dirZ];
        boldLine(d2_p1, d2_p2, 0xb45309, 0.055);
        // Hình chiếu bóng của d₂ xuống (P)
        line([[-3.6 * d2_dirX, -d + 0.02, -3.6 * d2_dirZ], [3.6 * d2_dirX, -d + 0.02, 3.6 * d2_dirZ]], 0x64748b, 1.8);
        // Điểm động M(t) trượt dọc d₂ và tia gióng thẳng đứng xuống bóng M'(t) ∈ (P)
        const sMov = -2.6 + 5.2 * u;
        const M2 = [sMov * d2_dirX, d, sMov * d2_dirZ], M2p = [sMov * d2_dirX, -d, sMov * d2_dirZ];
        boldLine(M2, M2p, 0x6d28d9, 0.044);
        dots([[0, -d, 0], [0, d, 0]], 0x6d28d9, 0.12);
        dots([M2, M2p], 0xffd166, 0.14);
        labelPoint('M(t) ∈ d₂', [M2[0] + 0.35, M2[1] + 0.3, M2[2]], '#fef08a');
        labelPoint('d₁ ⊂ (P)', [-3.2, -d + 0.35, 0], '#93c5fd');
        labelPoint('d₂ ⊄ (P) (d₁, d₂ chéo nhau)', [2.8 * d2_dirX, d + 0.35, 2.8 * d2_dirZ], '#fcd34d');
        labelPoint('(P)', [3.4, -d - 0.25, 2.5], '#93c5fd');
        break;
      }

      // 11-08-C04, g11_02: Khoảng cách giữa hai đường thẳng chéo nhau và đoạn vuông góc chung HK
      const pP = new THREE.Mesh(new THREE.PlaneGeometry(planeW, planeD), mat(0x1d4ed8, 0.22));
      pP.rotation.x = -Math.PI / 2;
      pP.position.y = -d;
      pP.userData.isFace = true; pP.visible = faces; model.add(pP);
      if(edges){
        const edgeP = new THREE.LineSegments(new THREE.EdgesGeometry(pP.geometry), new THREE.LineBasicMaterial({color: 0x1d4ed8, linewidth: 2}));
        edgeP.quaternion.copy(pP.quaternion); edgeP.position.copy(pP.position); model.add(edgeP);
      }

      const pQ = new THREE.Mesh(new THREE.PlaneGeometry(planeW, planeD), mat(0x047857, 0.22));
      pQ.rotation.x = -Math.PI / 2;
      pQ.position.y = d;
      pQ.userData.isFace = true; pQ.visible = faces; model.add(pQ);
      if(edges){
        const edgeQ = new THREE.LineSegments(new THREE.EdgesGeometry(pQ.geometry), new THREE.LineBasicMaterial({color: 0x047857, linewidth: 2}));
        edgeQ.quaternion.copy(pQ.quaternion); edgeQ.position.copy(pQ.position); model.add(edgeQ);
      }

      const d1_p1 = [-4, -d, 0], d1_p2 = [4, -d, 0];
      boldLine(d1_p1, d1_p2, 0x1d4ed8, 0.055);

      const d2_dirX = Math.cos(rad), d2_dirZ = Math.sin(rad);
      const d2_p1 = [-4 * d2_dirX, d, -4 * d2_dirZ], d2_p2 = [4 * d2_dirX, d, 4 * d2_dirZ];
      boldLine(d2_p1, d2_p2, 0xb45309, 0.055);

      const d1p_1 = [-3.8, d, 0], d1p_2 = [3.8, d, 0];
      boldLine(d1p_1, d1p_2, 0x64748b, 0.032, 0.85);

      // Đoạn vuông góc chung AB (HK): A(0, -d, 0), B(0, d, 0) (#6D28D9) + điểm dò P(t) trượt dọc HK
      const A = [0, -d, 0], B = [0, d, 0], yProbe = -d + 2 * d * u;
      boldLine(A, B, 0x6d28d9, 0.072);
      dots([A, B], 0x6d28d9, 0.14);
      dots([[0, yProbe, 0]], 0xffd166, 0.15);

      rightAngleMark(A, [1, 0, 0], [0, 1, 0], 0.38, 0x6d28d9);
      rightAngleMark(B, [d2_dirX, 0, d2_dirZ], [0, -1, 0], 0.38, 0x6d28d9);

      if (Math.abs(p.angle) > 5 && Math.abs(p.angle) < 175) {
        const arcPts = [];
        const arcR = 1.35;
        const steps = 24;
        for (let i = 0; i <= steps; i++) {
          const t = (rad * i) / steps;
          arcPts.push([arcR * Math.cos(t), d + 0.02, arcR * Math.sin(t)]);
        }
        for (let i = 0; i < arcPts.length - 1; i++) {
          boldLine(arcPts[i], arcPts[i + 1], 0x6d28d9, 0.024);
        }
        const midT = rad / 2;
        labelPoint(`φ = ${round(p.angle)}°`, [1.85 * Math.cos(midT), d + 0.35, 1.85 * Math.sin(midT)], '#c4b5fd');
      }

      labelPoint('d₁ ⊂ (P)', [-3.2, -d + 0.35, 0], '#93c5fd');
      labelPoint('d₂ ⊂ (Q)', [3.2 * d2_dirX, d + 0.35, 3.2 * d2_dirZ], '#fcd34d');
      labelPoint("d₁' ∥ d₁", [3.2, d + 0.35, 0], '#cbd5e1');
      labelPoint('(P)', [3.4, -d - 0.25, 2.5], '#93c5fd');
      labelPoint('(Q)', [3.4, d + 0.3, 2.5], '#6ee7b7');
      labelPoint('H (A)', [0.48, -d - 0.05, 0], '#c4b5fd');
      labelPoint('K (B)', [0.48, d + 0.15, 0], '#c4b5fd');
      labelPoint(`HK = ${round(p.dist)}`, [-0.78, 0, 0], '#c4b5fd');
      break;
    }
    case 'parallelProjection':{
      // 11-06-C04: Phép chiếu song song lên mặt phẳng (P) theo phương l — Tam giác động △A(t)B(t)C(t) trượt dọc 3 tia chiếu xuống (P)
      const u=Number.isFinite(Number(p.turn))?Number(p.turn):1;
      const h=p.h,shift=p.shift,top=[[-2,h,-1],[1.5,h,-1.3],[0.7,h,1.5]];
      const bottom=top.map(([x,y,z])=>[x+shift,0,z]);
      const moving=top.map((pt,i)=>[
        pt[0]+(bottom[i][0]-pt[0])*u,
        pt[1]+(bottom[i][1]-pt[1])*u,
        pt[2]+(bottom[i][2]-pt[2])*u
      ]);
      const pl=new THREE.Mesh(new THREE.PlaneGeometry(8,6),mat(0x1d4ed8,.24));pl.rotation.x=-Math.PI/2;pl.userData.isFace=true;pl.visible=faces;model.add(pl);
      if(edges){const ed=new THREE.LineSegments(new THREE.EdgesGeometry(pl.geometry),new THREE.LineBasicMaterial({color:0x1d4ed8}));ed.rotation.x=-Math.PI/2;model.add(ed);}
      triangles(top,[[0,1,2]],0xb45309);
      triangles(bottom,[[0,1,2]],0x047857);
      if(u>0.02&&u<0.98)triangles(moving,[[0,1,2]],0x6d28d9,false);
      for(let i=0;i<3;i++){
        boldLine(top[i],top[(i+1)%3],0xb45309,.048);
        boldLine(bottom[i],bottom[(i+1)%3],0x047857,.048);
        boldLine(top[i],bottom[i],0x64748b,.030,.85);
        boldLine(moving[i],moving[(i+1)%3],0x6d28d9,.044);
      }
      // Midpoint M of AB and M' of A'B' to show invariance of collinear division ratio
      const M=[(top[0][0]+top[1][0])/2,h,(top[0][2]+top[1][2])/2];
      const Mp=[(bottom[0][0]+bottom[1][0])/2,0,(bottom[0][2]+bottom[1][2])/2];
      const Mmov=[M[0]+(Mp[0]-M[0])*u,M[1]+(Mp[1]-M[1])*u,M[2]+(Mp[2]-M[2])*u];
      boldLine(M,Mp,0x6d28d9,.032,.9);
      dots(top,0xb45309,.11);dots(bottom,0x047857,.11);dots([M,Mp],0x6d28d9,.11);dots([...moving,Mmov],0xffd166,.12);
      ['A','B','C'].forEach((nm,i)=>{
        labelPoint(nm,[top[i][0],top[i][1]+0.32,top[i][2]],'#fcd34d');
        labelPoint(nm+"'",[bottom[i][0],bottom[i][1]+0.24,bottom[i][2]],'#6ee7b7');
      });
      labelPoint('Phương chiếu l',[(top[0][0]+bottom[0][0])/2-0.55,h/2,top[0][2]],'#c4b5fd');
      labelPoint('(P)',[3.1,0.2,2.2],'#93c5fd');
      break;
    }
    case 'lineParallelPlane':{
      const u = Number.isFinite(Number(p.turn)) ? Number(p.turn) : 1;
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 6), mat(0x1d4ed8, 0.25));
      pl.rotation.x = -Math.PI / 2; pl.userData.isFace = true; pl.visible = faces; model.add(pl);
      if(edges){
        const edge = new THREE.LineSegments(new THREE.EdgesGeometry(pl.geometry), new THREE.LineBasicMaterial({color: 0x1d4ed8, linewidth: 2}));
        edge.quaternion.copy(pl.quaternion); edge.position.copy(pl.position); model.add(edge);
      }
      const theta = (p.angle * Math.PI) / 180, dx = 3.6 * Math.cos(theta), dz = 3.6 * Math.sin(theta);
      // Mặt phẳng phụ (Q) chứa d và cắt (P) theo giao tuyến d' ∥ d
      const auxPts = [[-dx, 0, -dz], [dx, 0, dz], [dx, p.dist, dz], [-dx, p.dist, -dz]];
      triangles(auxPts, [[0, 1, 2, 3]], 0xb45309);
      // Đường thẳng d song song (P) (#B45309)
      boldLine([-dx, p.dist, -dz], [dx, p.dist, dz], 0xb45309, 0.058);
      // Giao tuyến / hình chiếu d' ⊂ (P) (#047857)
      boldLine([-dx, 0, -dz], [dx, 0, dz], 0x047857, 0.048, 0.9);
      // Đoạn hạ vuông góc M(t)H(t) trượt dọc d ∥ d' để chứng minh khoảng cách không đổi
      const sMov = -0.65 + 1.3 * u;
      const mx = sMov * dx, mz = sMov * dz;
      boldLine([0, 0, 0], [0, p.dist, 0], 0x64748b, 0.032, 0.7);
      boldLine([mx, 0, mz], [mx, p.dist, mz], 0x6d28d9, 0.064);
      dots([[mx, 0, mz], [mx, p.dist, mz]], 0xffd166, 0.14);
      rightAngleMark([mx, 0, mz], [dx, 0, dz], [0, 1, 0], 0.35, 0x6d28d9);
      labelPoint('d ∥ (P)', [-dx + 0.3, p.dist + 0.35, -dz], '#fcd34d');
      labelPoint("d' ⊂ (P) (d ∥ d')", [dx - 0.4, 0.3, dz], '#6ee7b7');
      labelPoint('(P)', [3.1, -0.25, 2.3], '#93c5fd');
      labelPoint(`d(d, (P)) = ${round(p.dist)}`, [mx - 0.78, p.dist / 2, mz], '#c4b5fd');
      break;
    }
    case 'parallelPlanes':{
      const u = Number.isFinite(Number(p.turn)) ? Number(p.turn) : 1;
      const d = p.dist / 2;
      for(const [yPos, col, edgeCol, name] of [[-d, 0x1d4ed8, 0x1d4ed8, '(P)'], [d, 0x047857, 0x047857, '(Q)']]) {
        const pl = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 6), mat(col, 0.24));
        pl.rotation.x = -Math.PI / 2; pl.position.y = yPos; pl.userData.isFace = true; pl.visible = faces; model.add(pl);
        if(edges){
          const edge = new THREE.LineSegments(new THREE.EdgesGeometry(pl.geometry), new THREE.LineBasicMaterial({color: edgeCol, linewidth: 2}));
          edge.quaternion.copy(pl.quaternion); edge.position.copy(pl.position); model.add(edge);
        }
        labelPoint(name, [3.2, yPos + 0.3, 2.3], yPos < 0 ? '#93c5fd' : '#6ee7b7');
      }
      // Hai cặp đường thẳng cắt nhau a₁, a₂ ⊂ (P) và b₁ ∥ a₁, b₂ ∥ a₂ ⊂ (Q)
      boldLine([-2.8, -d + 0.02, -1.2], [2.8, -d + 0.02, 1.2], 0x1d4ed8, 0.038);
      boldLine([-2.4, -d + 0.02, 1.6], [2.4, -d + 0.02, -1.6], 0x1d4ed8, 0.038);
      boldLine([-2.8, d + 0.02, -1.2], [2.8, d + 0.02, 1.2], 0x047857, 0.038);
      boldLine([-2.4, d + 0.02, 1.6], [2.4, d + 0.02, -1.6], 0x047857, 0.038);
      // Đoạn pháp tuyến chung H(t)K(t) quét giữa hai mặt phẳng song song (P) ∥ (Q)
      const sMov = -0.6 + 1.2 * u, xMov = sMov * 2.2, zMov = sMov * 0.95;
      boldLine([0, -d, 0], [0, d, 0], 0x64748b, 0.034, 0.7);
      boldLine([xMov, -d, zMov], [xMov, d, zMov], 0x6d28d9, 0.066);
      dots([[xMov, -d, zMov], [xMov, d, zMov]], 0xffd166, 0.14);
      rightAngleMark([xMov, -d, zMov], [1, 0, 0], [0, 1, 0], 0.35, 0x6d28d9);
      rightAngleMark([xMov, d, zMov], [1, 0, 0], [0, -1, 0], 0.35, 0x6d28d9);
      labelPoint('H(t)', [xMov + 0.42, -d - 0.05, zMov], '#c4b5fd');
      labelPoint('K(t)', [xMov + 0.42, d + 0.15, zMov], '#c4b5fd');
      labelPoint(`d((P), (Q)) = ${round(p.dist)}`, [xMov - 0.85, 0, zMov], '#c4b5fd');
      break;
    }
    case 'linePerpPlane':{
      const u = Number.isFinite(Number(p.turn)) ? Number(p.turn) : 1;
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 6), mat(0x1d4ed8, 0.24));
      pl.rotation.x = -Math.PI / 2; pl.userData.isFace = true; pl.visible = faces; model.add(pl);
      if(edges){
        const edge = new THREE.LineSegments(new THREE.EdgesGeometry(pl.geometry), new THREE.LineBasicMaterial({color: 0x1d4ed8, linewidth: 2}));
        edge.quaternion.copy(pl.quaternion); edge.position.copy(pl.position); model.add(edge);
      }
      // Hai đường thẳng cắt nhau a, b ⊂ (P) đi qua chân đường vuông góc H(0,0,0)
      boldLine([-3.2, 0.01, 0], [3.2, 0.01, 0], 0x1d4ed8, 0.036);
      boldLine([0, 0.01, -2.5], [0, 0.01, 2.5], 0x047857, 0.036);
      const A = [0, p.h, 0], H = [0, 0, 0], Pmov = [0, p.h * (1 - u), 0];
      boldLine(A, H, 0x6d28d9, 0.064);
      dots([Pmov], 0xffd166, 0.15);
      rightAngleMark(H, [1, 0, 0], [0, 1, 0], 0.36, 0x6d28d9);
      rightAngleMark(H, [0, 0, 1], [0, 1, 0], 0.36, 0x6d28d9);
      if (p.subMode === 'perp_basis') {
        // 11-07-C02: Điều kiện d ⊥ (P) khi d ⊥ a và d ⊥ b (a ∩ b = H ⊂ (P)) — Tia thử c(t) ⊂ (P) quay quanh H luôn vuông góc d
        const angC = u * Math.PI * 0.85 + 0.35;
        boldLine([-2.4 * Math.cos(angC), 0.02, -2.4 * Math.sin(angC)], [2.4 * Math.cos(angC), 0.02, 2.4 * Math.sin(angC)], 0xb45309, 0.042);
        dots([A, H], 0x6d28d9, 0.13);
        labelPoint('d', [0.32, p.h * 0.82, 0], '#c4b5fd');
        labelPoint('H = a ∩ b', [-0.55, -0.22, 0], '#c4b5fd');
        labelPoint('a ⊂ (P)', [2.8, 0.25, 0], '#93c5fd');
        labelPoint('b ⊂ (P)', [0.3, 0.25, 2.2], '#6ee7b7');
        labelPoint('c(t) ⊂ (P) ⇒ d ⊥ c(t)', [2.1 * Math.cos(angC), 0.28, 2.1 * Math.sin(angC)], '#fcd34d');
        labelPoint('d ⊥ a, d ⊥ b ⇒ d ⊥ (P)', [-1.1, p.h / 2, 0], '#c4b5fd');
        labelPoint('(P)', [3.1, -0.25, 2.3], '#93c5fd');
        break;
      }
      const rad = (p.slant * Math.PI) / 180;
      const bLen = p.h / Math.tan(rad);
      const B = [bLen, 0, 0], Qmov = [bLen * u, p.h * (1 - u), 0];
      triangles([A, H, B], [[0, 1, 2]], 0x6d28d9);
      boldLine(A, B, 0xb45309, 0.055);
      boldLine(H, B, 0x047857, 0.048);
      boldLine([bLen, 0, -2.6], [bLen, 0, 2.6], 0x64748b, 0.046);
      dots([A, H, B], 0x6d28d9, 0.13);
      dots([Qmov], 0xfcd34d, 0.13);
      rightAngleMark(B, [0, 0, 1], [-1, 0, 0], 0.32, 0x6d28d9);
      labelPoint('A', [0, p.h + 0.35, 0], '#fcd34d');
      labelPoint('H', [-0.38, -0.22, 0], '#c4b5fd');
      labelPoint('M (AM > AH)', [bLen + 0.35, 0, 0], '#6ee7b7');
      labelPoint(`d(A,(P)) = AH = ${round(p.h)}`, [-0.95, p.h / 2, 0], '#c4b5fd');
      labelPoint('d ⊂ (P) (d ⊥ HM ⇒ d ⊥ AM)', [bLen, 0, 2.8], '#cbd5e1');
      labelPoint('(P)', [3.1, -0.25, 2.3], '#93c5fd');
      break;
    }
    case 'perpendicularPlanes':{
      const u = Number.isFinite(Number(p.turn)) ? Number(p.turn) : 1;
      const w = p.w, h = p.h;
      const p1 = new THREE.Mesh(new THREE.PlaneGeometry(w, w), mat(0x1d4ed8, 0.25));
      p1.rotation.x = -Math.PI / 2; p1.userData.isFace = true; p1.visible = faces; model.add(p1);
      if(edges){
        const edge1 = new THREE.LineSegments(new THREE.EdgesGeometry(p1.geometry), new THREE.LineBasicMaterial({color: 0x1d4ed8, linewidth: 2}));
        edge1.quaternion.copy(p1.quaternion); edge1.position.copy(p1.position); model.add(edge1);
      }
      const p2 = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat(0xb45309, 0.26));
      p2.position.set(0, h / 2, 0); p2.userData.isFace = true; p2.visible = faces; model.add(p2);
      if(edges){
        const edge2 = new THREE.LineSegments(new THREE.EdgesGeometry(p2.geometry), new THREE.LineBasicMaterial({color: 0xb45309, linewidth: 2}));
        edge2.position.copy(p2.position); model.add(edge2);
      }
      // Giao tuyến d = (P) ∩ (Q) (#6D28D9) và đường thẳng a ⊂ (Q), a ⊥ d ⇒ a ⊥ (P) (#047857)
      boldLine([-w / 2, 0, 0], [w / 2, 0, 0], 0x6d28d9, 0.064);
      boldLine([0, 0, 0], [0, h * 0.85, 0], 0x047857, 0.052);
      boldLine([0, 0, 0], [0, 0, w * 0.42], 0x1d4ed8, 0.044);
      dots([[0, 0, 0], [0, h * 0.85, 0]], 0x6d28d9, 0.13);
      dots([[0, h * 0.85 * (1 - u), 0]], 0xffd166, 0.15);
      rightAngleMark([0, 0, 0], [0, 0, 1], [0, 1, 0], 0.45, 0x6d28d9);
      rightAngleMark([0, 0, 0], [1, 0, 0], [0, 1, 0], 0.40, 0x6d28d9);
      labelPoint('Giao tuyến d = (P) ∩ (Q)', [w / 2 + 0.6, 0, 0], '#c4b5fd');
      labelPoint('a ⊂ (Q), a ⊥ d ⇒ a ⊥ (P)', [0.35, h * 0.65, 0], '#6ee7b7');
      labelPoint('(P)', [w / 2 - 0.5, -0.2, w / 2 - 0.5], '#93c5fd');
      labelPoint('(Q) ⊥ (P)', [w / 2 - 0.5, h - 0.2, 0], '#fcd34d');
      break;
    }
    case 'linePlaneAngle':{
      const u = Number.isFinite(Number(p.turn)) ? Number(p.turn) : 1;
      if (p.subMode === 'oxyz_line_plane_angle') axisOxyz(4.5);
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 6), mat(0x1d4ed8, 0.25));
      pl.rotation.x = -Math.PI / 2; pl.userData.isFace = true; pl.visible = faces; model.add(pl);
      if(edges){
        const edge = new THREE.LineSegments(new THREE.EdgesGeometry(pl.geometry), new THREE.LineBasicMaterial({color: 0x1d4ed8, linewidth: 2}));
        edge.quaternion.copy(pl.quaternion); edge.position.copy(pl.position); model.add(edge);
      }
      const rad = (p.deg * Math.PI) / 180;
      const A = [0, p.len * Math.sin(rad), 0], B = [p.len * Math.cos(rad), 0, 0], H = [0, 0, 0];
      const Pdrop = [0, A[1] * (1 - u), 0];
      if (p.subMode === 'oxyz_line_plane_angle') {
        model.add(new THREE.ArrowHelper(v(0, 1, 0), v(B[0], 0, 0), 2.1, 0xc2410c, 0.36, 0.16));
        labelPoint('n ⊥ (P)', [B[0] + 0.35, 2.2, 0], '#fdba74');
      }
      // Mặt phẳng tam giác vuông AHB màu tím nhạt (#6D28D9) + điểm chiếu P(t) rơi từ A xuống H
      triangles([A, H, B], [[0, 1, 2]], 0x6d28d9);
      boldLine(A, H, 0x64748b, 0.052);
      boldLine(A, Pdrop, 0x6d28d9, 0.064);
      boldLine(A, B, 0xb45309, 0.064);
      boldLine(H, B, 0x047857, 0.054);
      rightAngleMark(H, [1, 0, 0], [0, 1, 0], 0.38, 0x6d28d9);
      const arcPts = [];
      const arcR = 1.15;
      const steps = 24;
      for(let i = 0; i <= steps; i++){
        const t = Math.PI - (rad * u * i) / steps;
        arcPts.push([B[0] + arcR * Math.cos(t), arcR * Math.sin(t), 0]);
      }
      for(let i = 0; i < arcPts.length - 1; i++){
        boldLine(arcPts[i], arcPts[i + 1], 0x6d28d9, 0.028);
      }
      dots([A, B, H], 0x6d28d9, 0.13);
      dots([Pdrop], 0xffd166, 0.15);
      labelPoint('A', [0, A[1] + 0.35, 0], '#fcd34d');
      labelPoint('B (I)', [B[0] + 0.35, 0, 0], '#c4b5fd');
      labelPoint("H (A')", [-0.42, -0.22, 0], '#6ee7b7');
      labelPoint(`φ = (d, d') = ${round(p.deg)}°`, [B[0] - 1.15, 0.58, 0], '#c4b5fd');
      labelPoint('(P)', [3.1, -0.25, 2.3], '#93c5fd');
      break;
    }
    case 'dihedralAngle':{
      const u = Number.isFinite(Number(p.turn)) ? Number(p.turn) : 1;
      const sz = p.size, rad = (p.deg * Math.PI) / 180;
      if (p.subMode === 'oxyz_normals_angle') axisOxyz(4.5);
      const f1 = new THREE.Mesh(new THREE.PlaneGeometry(sz, sz), mat(0x1d4ed8, 0.25));
      f1.rotation.x = -Math.PI / 2; f1.position.z = sz / 2; f1.userData.isFace = true; f1.visible = faces; model.add(f1);
      if(edges){
        const edge1 = new THREE.LineSegments(new THREE.EdgesGeometry(f1.geometry), new THREE.LineBasicMaterial({color: 0x1d4ed8, linewidth: 2}));
        edge1.quaternion.copy(f1.quaternion); edge1.position.copy(f1.position); model.add(edge1);
      }
      const f2 = new THREE.Mesh(new THREE.PlaneGeometry(sz, sz), mat(0xb45309, 0.26));
      f2.position.set(0, (sz * Math.sin(rad)) / 2, (sz * Math.cos(rad)) / 2);
      f2.rotation.x = Math.PI / 2 - rad; f2.userData.isFace = true; f2.visible = faces; model.add(f2);
      if(edges){
        const edge2 = new THREE.LineSegments(new THREE.EdgesGeometry(f2.geometry), new THREE.LineBasicMaterial({color: 0xb45309, linewidth: 2}));
        edge2.quaternion.copy(f2.quaternion); edge2.position.copy(f2.position); model.add(edge2);
      }
      // Cạnh nhị diện d (#6D28D9)
      boldLine([-sz / 2, 0, 0], [sz / 2, 0, 0], 0x6d28d9, 0.068);
      // Hai tia Ox ⊂ (P) (#1D4ED8) và Oy ⊂ (Q) (#047857) cùng vuông góc với cạnh nhị diện d tại O
      const uRay = [0, 0, sz * 0.75];
      const vRay = [0, (sz * 0.75 * Math.sin(rad)), (sz * 0.75 * Math.cos(rad))];
      const curRad = rad * (0.2 + 0.8 * u);
      const movRay = [0, sz * 0.72 * Math.sin(curRad), sz * 0.72 * Math.cos(curRad)];
      boldLine([0, 0, 0], uRay, 0x1d4ed8, 0.048);
      boldLine([0, 0, 0], vRay, 0x047857, 0.048);
      if (u < 0.98) {
        boldLine([0, 0, 0], movRay, 0xffd166, 0.042);
        dots([movRay], 0xffd166, 0.13);
      }
      if (p.subMode === 'perp_planes') {
        // 11-07-C03: Hai mặt phẳng vuông góc (nhấn mạnh đường thẳng a ⊂ (Q), a ⊥ (P))
        const footP = [0, 0, sz * 0.45];
        boldLine([0, vRay[1] * 0.6, vRay[2] * 0.6], footP, 0xb45309, 0.042);
        dots([[0, vRay[1] * 0.6, vRay[2] * 0.6], footP], 0xb45309, 0.11);
        labelPoint('a ⊂ (Q), a ⊥ d', [0.35, vRay[1] * 0.55, vRay[2] * 0.55], '#fcd34d');
      } else if (p.subMode === 'oxyz_normals_angle') {
        // 12-08-C04: Góc giữa hai mặt phẳng trong Oxyz qua hai vectơ pháp tuyến n₁, n₂
        model.add(new THREE.ArrowHelper(v(0, 1, 0), v(0, 0, sz * 0.45), 1.6, 0x1d4ed8, 0.32, 0.14));
        const n2 = v(0, Math.cos(rad), -Math.sin(rad)).normalize();
        model.add(new THREE.ArrowHelper(n2, v(0, vRay[1] * 0.55, vRay[2] * 0.55), 1.6, 0xc2410c, 0.32, 0.14));
        labelPoint('n₁ ⊥ (P)', [0.3, 1.7, sz * 0.45], '#93c5fd');
        labelPoint('n₂ ⊥ (Q)', [0.3, vRay[1] * 0.55 + n2.y * 1.7, vRay[2] * 0.55 + n2.z * 1.7], '#fdba74');
      }
      // Cung góc phẳng nhị diện φ = ∠xOy trong mặt phẳng vuông góc với d tại O (#6D28D9)
      const arcR = sz * 0.34, arcPts = [];
      for(let i = 0; i <= 24; i++){
        const a = (curRad * i) / 24;
        arcPts.push([0, arcR * Math.sin(a), arcR * Math.cos(a)]);
      }
      for(let i = 0; i < arcPts.length - 1; i++){
        boldLine(arcPts[i], arcPts[i + 1], 0x6d28d9, 0.028);
      }
      rightAngleMark([0, 0, 0], [1, 0, 0], [0, 0, 1], 0.35, 0x1d4ed8);
      rightAngleMark([0, 0, 0], [1, 0, 0], [0, Math.sin(rad), Math.cos(rad)], 0.35, 0x047857);
      dots([[0, 0, 0]], 0x6d28d9, 0.14);
      labelPoint('O', [0.3, 0.2, 0], '#c4b5fd');
      labelPoint('Cạnh nhị diện d', [sz / 2 + 0.6, 0, 0], '#c4b5fd');
      labelPoint('Ox ⊥ d ⊂ (P)', [0, 0.2, sz * 0.75], '#93c5fd');
      labelPoint('Oy ⊥ d ⊂ (Q)', [0, vRay[1] + 0.25, vRay[2]], '#6ee7b7');
      labelPoint(`Góc phẳng nhị diện [P, d, Q] = ${round(p.deg)}°`, [0, (sz * Math.sin(rad)) / 2 + 0.45, (sz * Math.cos(rad)) / 2], '#c4b5fd');
      break;
    }
    case 'frustumPyramid':{
      const a=p.a/2, b=p.b/2, h=p.h;
      const y0=-h/2, y1=h/2;
      const pts=[
        [-a,y0,-a],[a,y0,-a],[a,y0,a],[-a,y0,a],
        [-b,y1,-b],[b,y1,-b],[b,y1,b],[-b,y1,b]
      ];
      // Đáy lớn S₁ (#1D4ED8), đáy nhỏ S₂ (#047857), các mặt bên hình thang cân
      triangles([pts[0],pts[1],pts[2],pts[3]],[[0,3,2,1]],0x1d4ed8);
      triangles([pts[4],pts[5],pts[6],pts[7]],[[0,1,2,3]],0x047857);
      triangles(pts,[[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]],0x1d4ed8);
      // Mặt cắt trung gian song song hai đáy (#B45309)
      const mHalf=(a+b)/2;
      const mPts=[[-mHalf,0,-mHalf],[mHalf,0,-mHalf],[mHalf,0,mHalf],[-mHalf,0,mHalf]];
      triangles(mPts,[[0,3,2,1]],0xb45309);
      loop(mPts,0xb45309);
      // Các đường sinh nối dài hội tụ về đỉnh chóp gốc S (nếu a != b)
      if(Math.abs(a-b)>0.15){
        const yApex=y0+(a/(a-b))*h;
        if(Math.abs(yApex)<9){
          const S=[0,yApex,0];
          for(let k=4;k<8;k++)boldLine(pts[k],S,0x64748b,0.018,0.65);
          dots([S],0xb45309,0.09);
          labelPoint('S (đỉnh chóp gốc)',[0,yApex+0.32,0],'#fcd34d');
        }
      }
      boldLine([0,y0,0],[0,y1,0],0x6d28d9,0.056);
      rightAngleMark([0,y0,0],[1,0,0],[0,1,0],Math.min(0.28,a*0.3),0x6d28d9);
      rightAngleMark([0,y1,0],[1,0,0],[0,-1,0],Math.min(0.26,b*0.35),0x6d28d9);
      dots([[0,y0,0],[0,y1,0],...pts],0x6d28d9,0.1);
      labelPoint('O₁ (S₂)',[0,y1+0.35,0],'#6ee7b7');labelPoint('O₂ (S₁)',[0,y0-0.3,0],'#93c5fd');
      labelPoint(`h = ${round(h)}`,[-0.52,0,0],'#c4b5fd');
      labelPoint('A',pts[0]);labelPoint('B',pts[1]);labelPoint('C',pts[2]);labelPoint('D',pts[3]);
      labelPoint("A'",pts[4]);labelPoint("B'",pts[5]);labelPoint("C'",pts[6]);labelPoint("D'",pts[7]);
      break;
    }
    // ==========================================
    // --- CÁC MÔ HÌNH MỚI TOÁN LỚP 12 ---
    // ==========================================
    case 'cubicCurve':{
      axisOxyz(4.5);
      const fn=x=>p.a*x**3+p.b*x**2+p.c*x+p.d,dfn=x=>3*p.a*x**2+2*p.b*x+p.c;
      const pts=[];
      for(let i=0;i<=180;i++){
        const x=-3.6+7.2*i/180,y=fn(x);
        if(Number.isFinite(y)&&Math.abs(y)<=6.5)pts.push([x,y,0]);
      }
      if(pts.length>2){
        line(pts,0x1d4ed8,3.2);
        const tubePath=new THREE.CatmullRomCurve3(pts.map(pt=>v(...pt)));
        solid(new THREE.TubeGeometry(tubePath,160,0.042,8,false),0x1d4ed8,0.92,false);
      }
      if(Math.abs(p.a)>1e-6){
        const inflecX=-p.b/(3*p.a),inflecY=fn(inflecX),kU=dfn(inflecX);
        if(Math.abs(inflecX)<=4 && Math.abs(inflecY)<=8){
          boldLine([inflecX-1.1,inflecY-kU*1.1,0],[inflecX+1.1,inflecY+kU*1.1,0],0xc2410c,0.028);
          dots([[inflecX,inflecY,0]],0x7c3aed,0.14);
          labelPoint(`U(${round(inflecX)}, ${round(inflecY)})`,[inflecX+0.42,inflecY+0.36,0],'#c4b5fd');
        }
        const deltaP=p.b*p.b-3*p.a*p.c;
        if(deltaP>1e-6){
          const x1=(-p.b-Math.sqrt(deltaP))/(3*p.a),x2=(-p.b+Math.sqrt(deltaP))/(3*p.a);
          for(const [xk,nm] of [[x1,'CĐ'],[x2,'CT']]){
            const yk=fn(xk);
            if(Math.abs(xk)<=4&&Math.abs(yk)<=8){
              boldLine([xk-0.85,yk,0],[xk+0.85,yk,0],0xc2410c,0.026);
              dots([[xk,yk,0]],0x15803d,0.12);
              labelPoint(`${nm}(${round(xk)}, ${round(yk)})`,[xk,yk+(yk>=0?0.38:-0.38),0],'#86efac');
            }
          }
        }
      }
      break;
    }
    case 'rationalFunc':{
      axisOxyz(4.8);
      const vert=-p.d/p.c, horiz=p.a/p.c;
      const removable=Math.abs(p.a*p.d-p.b*p.c)<1e-9;
      boldLine([-5.5,horiz,0],[5.5,horiz,0],0x15803d,0.032);
      labelPoint(`TCN y = ${round(horiz)}`,[-4.2,horiz+0.35,0],'#86efac');
      if(removable){
        // Removable discontinuity: horizontal graph with one missing point.
        curve(x=>Math.abs(x-vert)<1e-6?NaN:horiz,-5.5,vert-0.18,80,0x1d4ed8);
        curve(x=>Math.abs(x-vert)<1e-6?NaN:horiz,vert+0.18,5.5,80,0x1d4ed8);
        const ring=solid(new THREE.RingGeometry(0.12,0.20,32),0xb91c1c,0.95,false);
        ring.position.set(vert,horiz,0.02);
        labelPoint(`Điểm khuyết (${round(vert)}, ${round(horiz)})`,[vert+.35,horiz+.38,0],'#fca5a5');
      }else{
        boldLine([vert,-5.5,0],[vert,5.5,0],0xb91c1c,0.032);
        labelPoint(`TCĐ x = ${round(vert)}`,[vert+0.38,-4.2,0],'#fca5a5');
        for(const [s0,s1] of [[-5.5,vert-0.18],[vert+0.18,5.5]]){
          const bPts=[];
          for(let i=0;i<=90;i++){
            const x=s0+(s1-s0)*i/90,y=(p.a*x+p.b)/(p.c*x+p.d);
            if(Number.isFinite(y)&&Math.abs(y)<=6.5)bPts.push([x,y,0]);
          }
          if(bPts.length>2){
            line(bPts,0x1d4ed8,3.0);
            const tCurve=new THREE.CatmullRomCurve3(bPts.map(pt=>v(...pt)));
            solid(new THREE.TubeGeometry(tCurve,90,0.038,8,false),0x1d4ed8,0.92,false);
          }
        }
        dots([[vert,horiz,0]],0x7c3aed,0.14);
        labelPoint(`Tâm ĐX I(${round(vert)}, ${round(horiz)})`,[vert+0.42,horiz+0.38,0],'#c4b5fd');
      }
      break;
    }
    case 'revolvedSolid':{
      const pts=[];for(let i=0;i<=36;i++){const t=i/36;pts.push(new THREE.Vector2(p.r1+(p.r2-p.r1)*t,(t-.5)*p.h));}
      const m=solid(new THREE.LatheGeometry(pts,64,0,2*Math.PI),0x1d4ed8,0.56,true);
      m.rotation.z=-Math.PI/2;
      model.userData.revolutionOuter=m;
      const c1=solid(new THREE.CircleGeometry(p.r1,48),0x15803d,0.52,true);
      c1.rotation.y=-Math.PI/2;c1.position.x=-p.h/2;
      const c2=solid(new THREE.CircleGeometry(p.r2,48),0xc2410c,0.52,true);
      c2.rotation.y=Math.PI/2;c2.position.x=p.h/2;
      model.userData.revolutionEndCaps=[c1,c2];
      // Mid cross-section S(x) at x = 0 (#7C3AED)
      const rMid=(p.r1+p.r2)/2;
      const midSec=solid(new THREE.CircleGeometry(rMid,48),0x7c3aed,0.72,false);
      midSec.rotation.y=Math.PI/2;midSec.position.x=0;
      boldLine([-p.h/2-1,0,0],[p.h/2+1,0,0],0x9a3412,0.042);
      boldLine([-p.h/2,p.r1,0],[p.h/2,p.r2,0],0xc2410c,0.045);
      boldLine([0,0,0],[0,rMid,0],0x7c3aed,0.045);
      dots([[-p.h/2,p.r1,0],[p.h/2,p.r2,0],[0,rMid,0]],0x7c3aed,0.11);
      labelPoint('Ox',[p.h/2+1.3,0,0],'#fdba74');
      labelPoint(`r₁ = ${p.r1}`,[-p.h/2,p.r1+0.38,0],'#86efac');
      labelPoint(`r₂ = ${p.r2}`,[p.h/2,p.r2+0.38,0],'#fdba74');
      labelPoint(`S(x) = πr(x)²`,[0,rMid+0.42,0],'#c4b5fd');
      break;
    }
    case 'conicalFrustum':{
      const r1=p.r1||1.5, r2=p.r2||3, h=p.h||4;
      const cylGeo=new THREE.CylinderGeometry(r2,r1,h,48,1,false);
      const m=solid(cylGeo,0x1d4ed8,0.58,true);
      const c1=solid(new THREE.CircleGeometry(r1,48),0x15803d,0.52,true);
      c1.rotation.x=-Math.PI/2;c1.position.y=-h/2;
      const c2=solid(new THREE.CircleGeometry(r2,48),0xc2410c,0.52,true);
      c2.rotation.x=-Math.PI/2;c2.position.y=h/2;
      line([[0,-h/2,0],[0,h/2,0]],0x7c3aed,2.4);
      labelPoint(`r₁ = ${r1}`,[r1+0.35,-h/2,0],'#86efac');
      labelPoint(`r₂ = ${r2}`,[r2+0.35,h/2,0],'#fdba74');
      labelPoint(`h = ${h}`,[0.35,0,0],'#c4b5fd');
      break;
    }
    case 'oxyzAxes':{
      const L=p.len;
      axisOxyz(L);
      const plXY=new THREE.Mesh(new THREE.PlaneGeometry(L,L),mat(0x1d4ed8,0.22));
      plXY.position.set(L/2,L/2,0);plXY.userData.isFace=true;plXY.visible=faces;model.add(plXY);
      const plYZ=new THREE.Mesh(new THREE.PlaneGeometry(L,L),mat(0x15803d,0.22));
      plYZ.rotation.y=-Math.PI/2;plYZ.position.set(0,L/2,L/2);plYZ.userData.isFace=true;plYZ.visible=faces;model.add(plYZ);
      const plZX=new THREE.Mesh(new THREE.PlaneGeometry(L,L),mat(0xc2410c,0.22));
      plZX.rotation.x=-Math.PI/2;plZX.position.set(L/2,0,L/2);plZX.userData.isFace=true;plZX.visible=faces;model.add(plZX);
      // Sample point M and projection box in Oxyz
      const s=Math.min(2.2,L*0.55),M=[s,s*0.85,s*0.75];
      boldLine([0,0,0],M,0x7c3aed,0.046);
      line([M,[M[0],M[1],0]],0x64748b,1.8);
      line([[M[0],M[1],0],[M[0],0,0]],0x64748b,1.6);
      line([[M[0],M[1],0],[0,M[1],0]],0x64748b,1.6);
      dots([[0,0,0],M,[M[0],M[1],0]],0x7c3aed,0.12);
      labelPoint('Ox',[L+0.45,0,0],'#fdba74');
      labelPoint('Oy',[0,L+0.45,0],'#86efac');
      labelPoint('Oz',[0,0,L+0.45],'#93c5fd');
      labelPoint('O',[0.25,-0.25,0],'#c4b5fd');
      labelPoint('M(x;y;z)',[M[0]+0.35,M[1]+0.3,M[2]],'#c4b5fd');
      break;
    }
    case 'oxyzVector':{
      axisOxyz(4.5);
      const uProg=Number.isFinite(Number(p.turn))?Number(p.turn):1;
      const M=[p.x,p.y,p.z],x=p.x,y=p.y,z=p.z;
      if(v(...M).length()>1e-7)model.add(new THREE.ArrowHelper(v(...M).normalize(),v(0,0,0),v(...M).length(),0x7c3aed,0.45,0.2));
      // Full 3D coordinate projection box (#64748B) & floor projection OM1 (#15803D)
      boldLine([0,0,0],[x,y,0],0x15803d,0.036);
      boldLine([x,y,0],M,0xc2410c,0.036);
      // 3-step 3D coordinate walker O(0,0,0) -> (x,0,0) -> M1(x,y,0) -> M(x,y,z) synchronized with 2D
      const uX=Math.min(1,uProg/0.34),uY=Math.min(1,Math.max(0,(uProg-0.34)/0.33)),uZ=Math.min(1,Math.max(0,(uProg-0.67)/0.33));
      const walkPt=[x*uX,y*uY,z*uZ];
      boldLine([0,0,0],[x*uX,0,0],0xc2410c,0.048);
      if(uY>0)boldLine([x,0,0],[x,y*uY,0],0x15803d,0.048);
      if(uZ>0)boldLine([x,y,0],[x,y,z*uZ],0x1d4ed8,0.048);
      dots([walkPt],0xffd166,0.15);
      const boxEdges=[
        [M,[x,y,0]],[M,[x,0,z]],[M,[0,y,z]],
        [[x,y,0],[x,0,0]],[[x,y,0],[0,y,0]],
        [[x,0,z],[x,0,0]],[[x,0,z],[0,0,z]],
        [[0,y,z],[0,y,0]],[[0,y,z],[0,0,z]]
      ];
      for(const [e0,e1] of boxEdges)line([e0,e1],0x64748b,1.8);
      dots([[0,0,0],M,[x,y,0],[x,0,0],[0,y,0],[0,0,z]],0x7c3aed,0.11);
      labelPoint('O',[0,-0.28,0],'#c4b5fd');
      labelPoint(`M(${round(x)}, ${round(y)}, ${round(z)})`,[x+0.35,y+0.35,z],'#c4b5fd');
      labelPoint(`M₁(${round(x)}, ${round(y)}, 0)`,[x+0.35,y-0.3,0],'#86efac');
      labelPoint(`x = ${round(x)}`,[x,-0.32,0],'#fdba74');
      labelPoint(`y = ${round(y)}`,[-0.32,y,0],'#86efac');
      labelPoint(`z = ${round(z)}`,[-0.32,0,z],'#93c5fd');
      break;
    }
    case 'oxyzSphere':{
      axisOxyz(4.5);
      const uProg=Number.isFinite(Number(p.turn))?Number(p.turn):1;
      const R=p.r,cx=p.x,cy=p.y,cz=p.z;
      const sph=solid(new THREE.SphereGeometry(R,42,28),0x1d4ed8,0.34,false);
      sph.position.set(cx,cy,cz);
      // 3 đường tròn lớn qua tâm I(x, y, z) theo bảng màu R85
      const eq=[],m1=[],m2=[];
      for(let i=0;i<=64;i++){
        const a=(i*2*Math.PI)/64;
        eq.push([cx+R*Math.cos(a),cy+R*Math.sin(a),cz]);
        m1.push([cx+R*Math.cos(a),cy,cz+R*Math.sin(a)]);
        m2.push([cx,cy+R*Math.cos(a),cz+R*Math.sin(a)]);
      }
      line(eq,0x15803d,2.6);
      line(m1,0xc2410c,2.2);
      line(m2,0x1d4ed8,2.0);
      // Đường gióng tọa độ tâm I xuống mặt phẳng Oxy
      line([[cx,cy,cz],[cx,cy,0]],0x64748b,1.8);
      line([[cx,cy,0],[cx,0,0]],0x64748b,1.5);
      line([[cx,cy,0],[0,cy,0]],0x64748b,1.5);
      const angM=-Math.PI/4+uProg*Math.PI*1.25;
      const M=[cx+R*Math.cos(angM),cy+R*Math.sin(angM),cz];
      boldLine([cx,cy,cz],M,0x7c3aed,0.056);
      dots([[cx,cy,cz],[cx,cy,0]],0x7c3aed,0.12);
      dots([M],0xffd166,0.15);
      labelPoint(`I(${round(cx)}, ${round(cy)}, ${round(cz)})`,[cx,cy+0.38,cz],'#93c5fd');
      labelPoint(`R = ${round(R)}`,[(cx+M[0])/2,(cy+M[1])/2+0.28,cz],'#c4b5fd');
      labelPoint('M(x;y;z)',[M[0]+0.28*Math.cos(angM),M[1]+0.28*Math.sin(angM),cz],'#86efac');
      break;
    }
    case 'oxyzPlane':{
      axisOxyz(4);
      const uProg=Number.isFinite(Number(p.turn))?Number(p.turn):1;
      const N=v(p.A,p.B,p.C),norm=N.clone().normalize();
      const center=N.clone().multiplyScalar(-p.D/N.lengthSq());
      const plMesh=new THREE.Mesh(new THREE.PlaneGeometry(6,6),mat(0x2563eb,.34));
      plMesh.quaternion.setFromUnitVectors(v(0,0,1),norm);
      plMesh.position.copy(center);
      plMesh.userData.isFace=true;plMesh.visible=faces;model.add(plMesh);
      if(edges){const edge=new THREE.LineSegments(new THREE.EdgesGeometry(plMesh.geometry),new THREE.LineBasicMaterial({color:0x1d4ed8}));
        edge.quaternion.copy(plMesh.quaternion);edge.position.copy(center);model.add(edge);}
      model.add(new THREE.ArrowHelper(norm,center.clone(),2,0xc2410c,.4,.18));
      const tang1=Math.abs(norm.x)<0.9?v(1,0,0).cross(norm).normalize():v(0,1,0).cross(norm).normalize();
      const tang2=norm.clone().cross(tang1).normalize();
      const rotAng=uProg*Math.PI*1.65;
      const tang=tang1.clone().multiplyScalar(Math.cos(rotAng)).addScaledVector(tang2,Math.sin(rotAng)).normalize();
      const Mpt=center.clone().addScaledVector(tang,1.65);
      boldLine([center.x,center.y,center.z],[Mpt.x,Mpt.y,Mpt.z],0x15803d,0.046);
      rightAngleMark([center.x,center.y,center.z],[tang.x,tang.y,tang.z],[norm.x,norm.y,norm.z],0.35,0x7c3aed);
      dots([[center.x,center.y,center.z]],0x7c3aed,0.12);
      dots([[Mpt.x,Mpt.y,Mpt.z]],0xffd166,0.14);
      labelPoint('n(A;B;C)',[center.x+norm.x*2.3,center.y+norm.y*2.3,center.z+norm.z*2.3],'#fdba74');
      labelPoint('M₀',[center.x-0.3,center.y-0.25,center.z],'#c4b5fd');
      labelPoint('M ∈ (P) (n ⊥ M₀M)',[Mpt.x+0.25,Mpt.y+0.25,Mpt.z],'#86efac');
      labelPoint('(P)',[center.x+.9,center.y-.35,center.z+.7],'#93c5fd');
      break;
    }
    case 'oxyzLine':{
      axisOxyz(4.5);
      const uProg=Number.isFinite(Number(p.turn))?Number(p.turn):1;
      const M0=[p.x0,p.y0,p.z0];
      const dir=v(p.u1,p.u2,p.u3).normalize();
      const p1=v(...M0).addScaledVector(dir,-4);
      const p2=v(...M0).addScaledVector(dir,4);
      const tParam=-1.8+3.8*uProg;
      const Mt=v(...M0).addScaledVector(dir,tParam);
      boldLine([p1.x,p1.y,p1.z],[p2.x,p2.y,p2.z],0x1d4ed8,0.048);
      model.add(new THREE.ArrowHelper(dir,v(...M0),1.6,0xc2410c,0.35,0.15));
      line([M0,[p.x0,p.y0,0]],0x64748b,1.6);
      line([[Mt.x,Mt.y,Mt.z],[Mt.x,Mt.y,0]],0x7c3aed,2.0);
      dots([M0],0x15803d,0.13);
      dots([[Mt.x,Mt.y,Mt.z],[Mt.x,Mt.y,0]],0xffd166,0.14);
      if(p.subMode==='parametric'){
        // 12-09-C02: Phương trình tham số (điểm M(t) = M₀ + t·u trượt dọc Δ)
        for(const tk of [-1.2, 1.0, 2.2]){
          const Pk=v(...M0).addScaledVector(dir,tk);
          dots([[Pk.x,Pk.y,Pk.z]],0xc2410c,0.09);
        }
        labelPoint('M(t) = M₀ + t·u',[Mt.x+0.28,Mt.y-0.25,Mt.z],'#c4b5fd');
      }else{
        // 12-09-C01: Phương trình chính tắc (hộp bậc thang tỉ số Δx:Δy:Δz = u₁:u₂:u₃ từ M₀ đến M(t))
        boldLine(M0,[Mt.x,M0[1],M0[2]],0xc2410c,0.036);
        boldLine([Mt.x,M0[1],M0[2]],[Mt.x,Mt.y,M0[2]],0x15803d,0.036);
        boldLine([Mt.x,Mt.y,M0[2]],[Mt.x,Mt.y,Mt.z],0x7c3aed,0.036);
        line([[p.x0,p.y0,0],[p.x0,0,0]],0x64748b,1.5);
        line([[p.x0,p.y0,0],[0,p.y0,0]],0x64748b,1.5);
        labelPoint('M(x;y;z) ∈ Δ',[Mt.x+0.28,Mt.y-0.25,Mt.z],'#c4b5fd');
      }
      labelPoint(`M₀(${round(p.x0)}, ${round(p.y0)}, ${round(p.z0)})`,[p.x0+0.3,p.y0+0.3,p.z0],'#86efac');
      labelPoint('u',[p.x0+dir.x*1.6+0.2,p.y0+dir.y*1.6+0.2,p.z0+dir.z*1.6],'#fdba74');
      break;
    }
    case 'oxyzDistance':{
      axisOxyz(4);
      const pl=new THREE.Mesh(new THREE.PlaneGeometry(6.4,6.4),mat(0x2563eb,0.32));
      pl.position.z=p.d;pl.userData.isFace=true;pl.visible=faces;model.add(pl);
      if(edges){const edge=new THREE.LineSegments(new THREE.EdgesGeometry(pl.geometry),new THREE.LineBasicMaterial({color:0x1d4ed8}));edge.position.copy(pl.position);model.add(edge);}
      const M=[p.x,p.y,p.z], H=[p.x,p.y,p.d], A=[p.x-1.4,p.y-0.9,p.d];
      boldLine(M,H,0x7c3aed,0.056);
      boldLine(M,A,0x15803d,0.036);
      boldLine(H,A,0x64748b,0.032);
      if(Math.abs(p.z-p.d)>0.15){
        rightAngleMark(H,[-1,0,0],[0,0,p.z>=p.d?1:-1],0.35,0x7c3aed);
      }
      model.add(new THREE.ArrowHelper(v(0,0,1),v(-2.2,1.8,p.d),1.3,0xc2410c,0.28,0.14));
      dots([M,H,A],0x7c3aed,0.12);
      labelPoint(`M₀(${round(p.x)}, ${round(p.y)}, ${round(p.z)})`,[p.x+0.3,p.y+0.3,p.z],'#93c5fd');
      labelPoint('H (hình chiếu)',[p.x+0.3,p.y-0.3,p.d],'#86efac');
      labelPoint(`d(M₀,(P)) = ${round(Math.abs(p.z-p.d))}`,[p.x+0.35,p.y,(p.z+p.d)/2],'#c4b5fd');
      labelPoint('(P)',[2.4,-2.2,p.d],'#93c5fd');
      break;
    }
    // Grade 12: actual world-space geometry (not an image/card fake).
    case 'openTopBox':{
      const L=p.L,cut=Math.min(p.cut,L/2-.1),a=L-2*cut,th=.065;
      const wall=(x,y,z,sx,sy,sz,col)=>{const mesh=solid(new THREE.BoxGeometry(sx,sy,sz),col,.70,false);mesh.position.set(x,y,z);};
      // Base (L-2x)×(L-2x) in compare green (#15803D), 4 folded walls in origin blue (#1D4ED8) & active orange (#C2410C)
      wall(0,-cut/2,0,a,th,a,0x15803d);
      wall(0,0,-a/2,a,cut,th,0x1d4ed8);wall(0,0,a/2,a,cut,th,0x1d4ed8);
      wall(-a/2,0,0,th,cut,a,0xc2410c);wall(a/2,0,0,th,cut,a,0xc2410c);
      // Ghost outline of original L x L square sheet + 4 cut corner squares x × x (#B91C1C) at base y = -cut/2
      const y0=-cut/2,hL=L/2;
      loop([[-hL,y0,-hL],[hL,y0,-hL],[hL,y0,hL],[-hL,y0,hL]],0x64748b,1.8);
      for(const [sx,sz] of [[-1,-1],[1,-1],[1,1],[-1,1]]){
        const cx0=sx*(hL-cut),cx1=sx*hL,cz0=sz*(hL-cut),cz1=sz*hL;
        loop([[cx0,y0,cz0],[cx1,y0,cz0],[cx1,y0,cz1],[cx0,y0,cz1]],0xb91c1c,2.0);
      }
      boldLine([-a/2,cut/2,-a/2],[a/2,cut/2,-a/2],0x15803d,.042);
      boldLine([a/2,-cut/2,a/2],[a/2,cut/2,a/2],0x7c3aed,.048);
      labelPoint(`Cao x = ${round(cut)}`,[a/2+.55,0,a/2+.35],'#c4b5fd');
      labelPoint(`Đáy L−2x = ${round(a)}`,[0,cut/2+.35,-a/2],'#86efac');
      break;
    }
    case 'profileRevolve':{
      const {r1,r2,h,hole=0,slice=.5}=p;
      const uProg=Number.isFinite(Number(p.turn))?Number(p.turn):1;
      const pts=[];for(let i=0;i<=36;i++){const t=i/36;pts.push(new THREE.Vector2(r1+(r2-r1)*t,(t-.5)*h));}
      const outer=solid(new THREE.LatheGeometry(pts,64,0,2*Math.PI),0x1d4ed8,p.subMode==='riemann_disks'?.28:.52,false);outer.rotation.z=-Math.PI/2;
      model.userData.revolutionOuter=outer;
      model.userData.revolutionEndCaps=[];
      if(hole>.001){const inner=solid(new THREE.CylinderGeometry(hole,hole,h,64,1,true),0xc2410c,.45,false);inner.rotation.z=-Math.PI/2;}
      for(const [x,r] of [[-h/2,r1],[h/2,r2]]){const end=solid(new THREE.RingGeometry(hole,r,64),0x15803d,.48,false);end.rotation.y=Math.PI/2;end.position.x=x;model.userData.revolutionEndCaps.push(end);}
      if(p.subMode==='riemann_disks'){
        // 12-07-C01: Xấp xỉ thể tích vật thể bằng các lát cắt mặt cắt S(x_k) xếp dần dọc trục Ox
        const nDisks=5,dx=h/nDisks,activeCount=Math.max(1,Math.ceil(uProg*nDisks));
        for(let k=0;k<activeCount;k++){
          const tk=(k+0.5)/nDisks,rk=r1+(r2-r1)*tk,xk=(tk-0.5)*h;
          const dMesh=solid(new THREE.CylinderGeometry(rk,rk,dx*0.78,36),k%2?0x047857:0xb45309,0.58,false);
          dMesh.rotation.z=-Math.PI/2;dMesh.position.x=xk;
        }
      }
      const t=Math.max(0,Math.min(1,slice)),r=r1+(r2-r1)*t,sx=(t-.5)*h;
      if(r>hole+1e-6){const section=solid(new THREE.RingGeometry(hole,r,64),0x7c3aed,.82,false);section.rotation.y=Math.PI/2;section.position.x=sx;section.name='grade12RealSection';}
      boldLine([-h/2-.6,0,0],[h/2+.6,0,0],0x9a3412,.038);
      boldLine([sx,0,0],[sx,r,0],0x7c3aed,.046);
      dots([[sx,0,0],[sx,r,0]],0x7c3aed,.11);
      labelPoint('Ox',[h/2+.85,0,0],'#fdba74');
      labelPoint(p.subMode==='riemann_disks'?`S(x) = πr(x)²`:`R(x) = ${round(r)}`,[sx,r+0.35,0],'#c4b5fd');
      break;
    }
    case 'oxyzVectorPair':{
      axisOxyz(4.5);
      const uProg=Number.isFinite(Number(p.turn))?Number(p.turn):1;
      const u=v(p.u1,p.u2,p.u3),w=v(p.x,p.y,p.z),sum=u.clone().add(w);
      if(p.subMode==='components'){
        // 12-04-C02: Biểu diễn tọa độ vectơ u = u₁i + u₂j + u₃k và vectơ tự do AB = v - u tịnh tiến trong Oxyz
        for(const [vec,color,name,hex] of [[u,0x1d4ed8,`A / u(${round(u.x)},${round(u.y)},${round(u.z)})`,'#93c5fd'],[w,0x15803d,`B / v(${round(w.x)},${round(w.y)},${round(w.z)})`,'#86efac']]){
          if(vec.length()>1e-7)model.add(new THREE.ArrowHelper(vec.clone().normalize(),v(0,0,0),vec.length(),color,.35,.16));
          dots([[vec.x,vec.y,vec.z]],color,.11);labelPoint(name,[vec.x+.32,vec.y+.28,vec.z],hex);
        }
        const ab=w.clone().sub(u);
        const startPt=u.clone().multiplyScalar(uProg);
        if(ab.length()>1e-7)model.add(new THREE.ArrowHelper(ab.clone().normalize(),startPt,ab.length(),0x7c3aed,.35,.16));
        line([[u.x,u.y,u.z],[u.x,u.y,0]],0x64748b,1.6);
        line([[w.x,w.y,w.z],[w.x,w.y,0]],0x64748b,1.6);
        labelPoint('AB = v − u',[(u.x+w.x)/2+0.25,(u.y+w.y)/2+0.25,(u.z+w.z)/2],'#c4b5fd');
        labelPoint('O',[-0.25,-0.25,0],'#ffffff');
        break;
      }
      if(p.subMode==='dot_angle'){
        // 12-04-C03: Tích vô hướng u·v và góc (u, v) — Hạ điểm chiếu vuông góc từ u xuống v
        for(const [vec,color,name,hex] of [[u,0x1d4ed8,`u(${round(u.x)},${round(u.y)},${round(u.z)})`,'#93c5fd'],[w,0x15803d,`v(${round(w.x)},${round(w.y)},${round(w.z)})`,'#86efac']]){
          if(vec.length()>1e-7)model.add(new THREE.ArrowHelper(vec.clone().normalize(),v(0,0,0),vec.length(),color,.35,.16));
          dots([[vec.x,vec.y,vec.z]],color,.11);labelPoint(name,[vec.x+.32,vec.y+.28,vec.z],hex);
        }
        if(u.length()>1e-5&&w.length()>1e-5){
          const uDir=u.clone().normalize(),wDir=w.clone().normalize(),arcR=Math.min(1.25,0.45*Math.min(u.length(),w.length()));
          const arcPts=[];
          for(let i=0;i<=20;i++){
            const t=(i/20)*uProg,dir=uDir.clone().lerp(wDir,t).normalize().multiplyScalar(arcR);
            arcPts.push([dir.x,dir.y,dir.z]);
          }
          for(let i=0;i<arcPts.length-1;i++)boldLine(arcPts[i],arcPts[i+1],0x7c3aed,0.028);
          const projScale=u.dot(w)/w.lengthSq(),H=w.clone().multiplyScalar(projScale);
          const Pdrop=u.clone().lerp(H,uProg);
          boldLine([u.x,u.y,u.z],[Pdrop.x,Pdrop.y,Pdrop.z],0xc2410c,0.036);
          line([[u.x,u.y,u.z],[H.x,H.y,H.z]],0xc2410c,2.0);
          dots([[H.x,H.y,H.z],[Pdrop.x,Pdrop.y,Pdrop.z]],0xffd166,0.12);
          const deg=Math.round(Math.acos(Math.max(-1,Math.min(1,uDir.dot(wDir))))*180/Math.PI);
          labelPoint(`φ = (u,v) ≈ ${deg}°`,[arcPts[10][0]+0.2,arcPts[10][1]+0.2,arcPts[10][2]],'#c4b5fd');
        }
        labelPoint('O',[-0.25,-0.25,0],'#ffffff');
        break;
      }
      // 12-04-C04: Quy tắc hình bình hành 3D — Tịnh tiến vectơ v trượt dọc theo u từ O đến ngọn u rồi khép đường chéo u + v
      if(u.length()>1e-5&&w.length()>1e-5){
        triangles([[0,0,0],[u.x,u.y,u.z],[sum.x,sum.y,sum.z],[w.x,w.y,w.z]],[[0,1,2,3]],0x15803d);
      }
      const sumLen=sum.length()*Math.max(0.15,uProg);
      for(const [vec,lenVal,color,name,hex] of [[u,u.length(),0x1d4ed8,`u(${round(u.x)},${round(u.y)},${round(u.z)})`,'#93c5fd'],[w,w.length(),0x15803d,`v(${round(w.x)},${round(w.y)},${round(w.z)})`,'#86efac'],[sum,sumLen,0x7c3aed,`u+v(${round(sum.x)},${round(sum.y)},${round(sum.z)})`,'#c4b5fd']]){
        if(vec.length()>1e-7)model.add(new THREE.ArrowHelper(vec.clone().normalize(),v(0,0,0),lenVal,color,.35,.16));
        dots([[vec.x,vec.y,vec.z]],color,.11);labelPoint(name,[vec.x+.32,vec.y+.28,vec.z],hex);
      }
      // Translated copy of v sliding along u from O to tip of u (#C2410C)
      const baseSlide=u.clone().multiplyScalar(uProg);
      if(w.length()>1e-7)model.add(new THREE.ArrowHelper(w.clone().normalize(),baseSlide,w.length(),0xc2410c,.32,.14));
      line([[w.x,w.y,w.z],[sum.x,sum.y,sum.z]],0x64748b,2.2);
      labelPoint('O',[-0.25,-0.25,0],'#ffffff');
      break;
    }
    case 'oxyzPlanePointDistance':{
      axisOxyz(4.5);
      const uProg=Number.isFinite(Number(p.turn))?Number(p.turn):1;
      const normal=v(p.A,p.B,p.C),unit=normal.clone().normalize(),center=normal.clone().multiplyScalar(-p.D/normal.lengthSq());
      const mesh=solid(new THREE.PlaneGeometry(7,7),0x2563eb,.32,true);mesh.quaternion.setFromUnitVectors(v(0,0,1),unit);mesh.position.copy(center);
      const M=v(p.x,p.y,p.z),signed=(normal.dot(M)+p.D)/normal.length(),H=M.clone().addScaledVector(unit,-signed);
      const Pdrop=M.clone().lerp(H,uProg);
      boldLine(M,H,0x64748b,.034);
      boldLine(M,Pdrop,0x7c3aed,.062);
      dots([M,H],0x7c3aed,.13);
      dots([Pdrop],0xffd166,.15);
      const tangent=Math.abs(unit.x)<0.9?v(1,0,0).cross(unit).normalize():v(0,1,0).cross(unit).normalize();
      if(Math.abs(signed)>0.15)rightAngleMark([H.x,H.y,H.z],[tangent.x,tangent.y,tangent.z],[unit.x*(signed>=0?1:-1),unit.y*(signed>=0?1:-1),unit.z*(signed>=0?1:-1)],0.34,0x7c3aed);
      labelPoint(`M₀(${round(M.x)}, ${round(M.y)}, ${round(M.z)})`,[M.x+.3,M.y+.32,M.z+.25],'#93c5fd');
      labelPoint('H ∈ (P)',[H.x+.3,H.y-.25,H.z],'#86efac');
      labelPoint(`d(M₀,(P)) = ${round(Math.abs(signed))}`,[(M.x+H.x)/2-0.55,(M.y+H.y)/2,(M.z+H.z)/2],'#c4b5fd');
      labelPoint('(P)',[center.x+1.8,center.y-1.2,center.z],'#93c5fd');
      model.add(new THREE.ArrowHelper(unit,center,1.4,0xc2410c,.28,.14));
      labelPoint('n',[center.x+unit.x*1.65,center.y+unit.y*1.65,center.z+unit.z*1.65],'#fdba74');
      break;
    }
    case 'oxyzLinePair':{
      axisOxyz(4.5);
      const uProg=Number.isFinite(Number(p.turn))?Number(p.turn):1;
      const a=p.deg*Math.PI/180,gap=p.dist;
      const u=v(1,0,0),w=v(Math.cos(a),Math.sin(a),0),base=v(0,0,gap);
      const refPl=new THREE.Mesh(new THREE.PlaneGeometry(7.2,5.2),mat(0x2563eb,0.16));
      refPl.userData.isFace=true;refPl.visible=faces;model.add(refPl);
      boldLine([-3.5,0,0],[3.5,0,0],0x1d4ed8,.055);
      boldLine(base.clone().addScaledVector(w,-3.3),base.clone().addScaledVector(w,3.3),0x15803d,.055);
      const sMov=(1-uProg)*2.2;
      const P1=[sMov,0,0],P2=[base.x+w.x*sMov,base.y+w.y*sMov,base.z];
      boldLine(P1,P2,0xc2410c,0.038);
      dots([P1,P2],0xffd166,0.13);
      dots([[0,0,0],[base.x,base.y,base.z]],0x7c3aed,.14);
      labelPoint('d₁',[3.6,0.25,0],'#93c5fd');labelPoint('d₂',[base.x+w.x*3.4,base.y+w.y*3.4,base.z+0.25],'#86efac');
      labelPoint('H',[0.3,-0.25,0],'#c4b5fd');labelPoint('K',[0.3,-0.25,gap],'#c4b5fd');
      if(gap>0.001){
        boldLine([0,0,0],[0,0,gap],0x7c3aed,.054);
        rightAngleMark([0,0,0],[1,0,0],[0,0,1],Math.min(0.32,gap*0.4),0x7c3aed);
        rightAngleMark([0,0,gap],[w.x,w.y,0],[0,0,-1],Math.min(0.32,gap*0.4),0x7c3aed);
        labelPoint(`HK = ${round(gap)}`,[-0.65,0,gap/2],'#c4b5fd');
      }
      break;
    }
    case 'oxyzSphereCut':{
      axisOxyz(4.5);
      const uProg=Number.isFinite(Number(p.turn))?Number(p.turn):1;
      const rr=p.r,d=p.dist;
      solid(new THREE.SphereGeometry(rr,48,32),0x1d4ed8,.26,false);
      // Đường tròn lớn tham chiếu tại z = 0
      const eq=[];
      for(let i=0;i<=64;i++){const a=(i*2*Math.PI)/64;eq.push([rr*Math.cos(a),rr*Math.sin(a),0]);}
      line(eq,0x64748b,2.0);
      const plane=solid(new THREE.PlaneGeometry(rr*2.6,rr*2.6),0x15803d,.22,true);plane.position.z=d;
      const sectionRadius=Math.sqrt(Math.max(0,rr*rr-d*d));
      const O=[0,0,0],H=[0,0,d];
      boldLine(O,H,0xc2410c,0.048);
      dots([O,H],0x7c3aed,0.12);
      if(sectionRadius>1e-4){
        const disk=solid(new THREE.CircleGeometry(sectionRadius,64),0x7c3aed,.68,false);disk.position.z=d+.005;
        const secRing=[];
        for(let i=0;i<=64;i++){const a=(i*2*Math.PI)/64;secRing.push([sectionRadius*Math.cos(a),sectionRadius*Math.sin(a),d+0.008]);}
        line(secRing,0x7c3aed,3.2);
        const angM=uProg*Math.PI*1.65;
        const M=[sectionRadius*Math.cos(angM),sectionRadius*Math.sin(angM),d];
        boldLine(H,M,0x7c3aed,0.048);
        boldLine(O,M,0x1d4ed8,0.048);
        if(Math.abs(d)>0.15&&sectionRadius>0.2){
          rightAngleMark(H,[Math.cos(angM),Math.sin(angM),0],[0,0,d>0?-1:1],Math.min(0.32,Math.abs(d)*0.45,sectionRadius*0.4),0x7c3aed);
        }
        dots([M],0xffd166,0.14);
        labelPoint('M',[M[0]+0.3*Math.cos(angM),M[1]+0.3*Math.sin(angM),d],'#c4b5fd');
        labelPoint(`r = √(R²−d²) = ${round(sectionRadius)}`,[M[0]*0.5,M[1]*0.5+0.28,d+0.15],'#c4b5fd');
      }
      labelPoint('(P)',[rr,rr,d],'#86efac');
      labelPoint('I',[-0.3,-0.3,0],'#93c5fd');
      labelPoint('H',[-0.35,0.25,d],'#fdba74');
      break;
    }
    case 'oxyzSphereLine':{
      axisOxyz(4.5);
      const uProg=Number.isFinite(Number(p.turn))?Number(p.turn):1;
      const rr=p.r,d=p.dist;
      solid(new THREE.SphereGeometry(rr,48,32),0x1d4ed8,.28,false);
      const eq=[];
      for(let i=0;i<=64;i++){const a=(i*2*Math.PI)/64;eq.push([rr*Math.cos(a),rr*Math.sin(a),0]);}
      line(eq,0x64748b,2.0);
      boldLine([-rr*1.75,d,0],[rr*1.75,d,0],0x15803d,.048);
      // Đoạn vuông góc IH = d từ tâm I đến đường thẳng Δ + điểm dò P(t) trượt dọc Δ
      const O=[0,0,0],H=[0,d,0],xProbe=(-1.4+2.8*uProg)*rr,Pprobe=[xProbe,d,0];
      boldLine(O,H,0xc2410c,0.048);
      boldLine(O,Pprobe,0x7c3aed,0.036);
      dots([O,H],0xc2410c,0.12);
      dots([Pprobe],0xffd166,0.14);
      if(Math.abs(d)>0.15){
        rightAngleMark(H,[1,0,0],[0,d>0?-1:1,0],Math.min(0.3,Math.abs(d)*0.4),0x7c3aed);
      }
      const delta=rr*rr-d*d;
      if(delta>1e-5){
        const x=Math.sqrt(delta);
        boldLine(O,[x,d,0],0x1d4ed8,0.042);
        boldLine(O,[-x,d,0],0x1d4ed8,0.042);
        dots([[x,d,0],[-x,d,0]],0x7c3aed,.14);
        labelPoint('A',[x+.25,d+.28,0],'#c4b5fd');
        labelPoint('B',[-x-.25,d+.28,0],'#c4b5fd');
      }else if(Math.abs(delta)<=1e-5){
        dots([[0,d,0]],0x7c3aed,.16);
        labelPoint('T ≡ H',[.35,d+.28,0],'#c4b5fd');
      }
      labelPoint('I',[-0.3,-0.3,0],'#93c5fd');
      labelPoint('H',[-0.35,d+0.25,0],'#fdba74');
      labelPoint('Δ',[rr*1.5,d+0.28,0],'#86efac');
      break;
    }
    default:throw new Error(`Chua ho tro dung hinh ${item.type}`);
  }
  const bounds=new THREE.Box3().setFromObject(model);const size=bounds.getSize(v(0,0,0)),center=bounds.getCenter(v(0,0,0));
  if(!Number.isFinite(size.x)||Math.max(size.x,size.y,size.z)<1e-8)throw new Error('Không dựng được hình với dữ kiện này.');
  model.add(crossSectionGroup);
  model.add(obliqueSectionGroup);
  model.add(unfoldGroup);
  model.add(buildGroup);
  // Tim tam va chuan hoa quy mo HIEN THI. Tham so goc khong doi, cong thuc van chinh xac.
  model.position.sub(center);const holder=new THREE.Group();holder.add(model);
  const scale=Math.min(1.4,3/Math.max(size.x,size.y,size.z));holder.scale.setScalar(scale);
  holder.userData.baseScale = scale;
  holder.userData.modelCenter = center.clone();

  holder.userData.labelsGroup = labelsGroup;
  holder.userData.crossSectionGroup = crossSectionGroup;
  holder.userData.obliqueSectionGroup = obliqueSectionGroup;
  holder.userData.unfoldGroup = unfoldGroup;
  holder.userData.buildGroup = buildGroup;
  holder.setBuildProgress = (progress) => {
    if (!buildGroup || !buildGroup.updateBuild) return;
    const restoreStatic = () => {
      for (const child of model.children) {
        if (child !== unfoldGroup && child !== labelsGroup && child !== crossSectionGroup && child !== obliqueSectionGroup && child !== buildGroup) {
          if (child.userData?._origVis !== undefined) child.visible = child.userData._origVis;
          if (child.material && child.userData?._origOp !== undefined) {
            child.material.opacity = child.userData._origOp;
          }
        }
      }
      if (labelsGroup?.children) {
        for (const sp of labelsGroup.children) {
          if (sp.userData?._origPos) sp.position.copy(sp.userData._origPos);
          if (sp.userData?._origVis !== undefined) sp.visible = sp.userData._origVis;
        }
      }
    };
    if (progress === null || progress === undefined || progress < 0) {
      buildGroup.visible = false;
      restoreStatic();
      return;
    }
    const u = Math.max(0, Math.min(1, Number(progress) || 0));
    buildGroup.visible = true;
    buildGroup.updateBuild(u);
    const showFullStatic = u >= 0.96;
    for (const child of model.children) {
      if (child !== unfoldGroup && child !== labelsGroup && child !== crossSectionGroup && child !== obliqueSectionGroup && child !== buildGroup) {
        if (child.userData._origVis === undefined) child.userData._origVis = child.visible;
        if (child.material && child.userData._origOp === undefined) child.userData._origOp = child.material.opacity;
        // Hide static pre-drawn 3D shell during step-by-step construction so buildGroup visibly constructs the 3D solid from 0% to 100%
        child.visible = showFullStatic ? child.userData._origVis : false;
      }
    }
    if (labelsGroup?.children) {
      const hHalf = Number(p.h || p.a || 4) / 2;
      for (const sp of labelsGroup.children) {
        if (!sp.userData._origPos) sp.userData._origPos = sp.position.clone();
        if (sp.userData._origVis === undefined) sp.userData._origVis = sp.visible;
        const txt = String(sp.userData.labelText || '');
        const oy = sp.userData._origPos.y;
        if (showFullStatic) {
          sp.position.copy(sp.userData._origPos);
          sp.visible = sp.userData._origVis;
        } else if (txt.startsWith('h =')) {
          sp.visible = u >= 0.65;
        } else if (oy > 0.05) {
          // Upper vertex labels (S, A', B', C', D', O₁) appear when vertical construction begins and rise with the top
          if (u < 0.22) {
            sp.visible = false;
          } else {
            sp.visible = sp.userData._origVis;
            const uLift = Math.min(1, (u - 0.22) / 0.45);
            sp.position.set(
              sp.userData._origPos.x,
              -hHalf + (oy + hHalf) * uLift,
              sp.userData._origPos.z
            );
          }
        } else {
          sp.position.copy(sp.userData._origPos);
          sp.visible = sp.userData._origVis;
        }
      }
    }
  };
  holder.supportsCrossSection = [
    'squarePyramid', 'trianglePyramid', 'tetrahedron', 'cube', 'cuboid',
    'triPrism', 'triangularPrism', 'prismQuad', 'quadPrism', 'frustumPyramid',
    'cylinder', 'cone'
  ].includes(item.type);
  holder.supportsUnfold = [
    'squarePyramid', 'trianglePyramid', 'tetrahedron', 'cube', 'cuboid',
    'quadPrism', 'prismQuad', 'triangularPrism', 'triPrism',
    'cone', 'cylinder', 'conicalFrustum', 'noncut', 'frustumPyramid',
    'chop3', 'chop4', 'chopcut4', 'non', 'tru', 'lapphuong', 'hop', 'langtru', 'openTopBox'
  ].includes(item.type);
  holder.supportsRevolution = item.type === 'profileRevolve' || item.type === 'revolvedSolid';
  holder.setRevolutionProgress = fraction => {
    if(!holder.supportsRevolution)return false;
    const p=Math.max(0,Math.min(1,Number(fraction)||0));
    const shell=model.userData.revolutionOuter;
    if(!shell?.geometry?.index)return false;
    const count=shell.geometry.index.count;
    const trianglesPerStep=36*6; // 36 profile sections, each angular sweep segment.
    const n=Math.round((count/trianglesPerStep)*p);
    shell.geometry.setDrawRange(0,Math.min(count,Math.max(0,n*trianglesPerStep)));
    for(const cap of model.userData.revolutionEndCaps||[])cap.visible=p>=.999;
    model.userData.revolutionProgress=p;
    return true;
  };
  holder.supportsObliqueSection = [
    'cube', 'cuboid', 'squarePyramid', 'tetrahedron', 'triPrism',
    'triangularPrism', 'prismQuad', 'frustumPyramid', 'chopcut4',
    'chop3', 'chop4', 'tudien', 'langtru',
    'tdchop4', 'tdtudien', 'tdhop', 'tdlangtru'
  ].includes(item.type);
  holder.setObliqueSection = (enabled,percent=50,degrees=0,mnp=null)=>{
    obliqueSectionGroup.visible=!!enabled&&holder.supportsObliqueSection;
    return obliqueSectionGroup.visible?obliqueSectionGroup.updateSection(percent,degrees,mnp):null;
  };

  let userLabelsVisible = !!labels;
  holder.setLabelsVisible = (val) => {
    userLabelsVisible = !!val;
    labelsGroup.visible = userLabelsVisible && ((unfoldGroup?.userData?.unfoldProgress || 0) <= 0.02);
  };
  holder.setCrossSection = (enabled, heightPct = 50) => {
    crossSectionGroup.visible = !!enabled;
    if (enabled && crossSectionGroup.updateSection) {
      return crossSectionGroup.updateSection(heightPct);
    }
    return null;
  };

  holder.setUnfoldProgress = (progress) => {
    if (unfoldGroup && unfoldGroup.setUnfold) {
      unfoldGroup.userData.unfoldProgress = progress;
      unfoldGroup.visible = (progress > 0.001);
      if (labelsGroup) labelsGroup.visible = userLabelsVisible && (progress <= 0.02);
      for (const child of model.children) {
        if (child !== unfoldGroup && child !== labelsGroup && child !== crossSectionGroup && child !== obliqueSectionGroup && child !== buildGroup) {
          child.visible = (progress < 0.999);
          if (child.material) {
            child.material.transparent = (progress > 0);
            child.material.opacity = Math.max(0.12, 1 - progress);
          }
        }
      }
      unfoldGroup.setUnfold(progress);
    }
  };

  holder.setDisplayMode = (m) => {
    model.traverse(child => {
      if (child.userData?.isFace && child.material) {
        if (m === 'wireframe') {
          child.material.wireframe = true;
          child.material.transparent = false;
          child.material.opacity = 1.0;
        } else if (m === 'transparent') {
          child.material.wireframe = false;
          child.material.transparent = true;
          child.material.opacity = 0.32;
          child.material.depthWrite = false;
        } else {
          child.material.wireframe = false;
          child.material.transparent = false;
          child.material.opacity = 0.82;
          child.material.depthWrite = true;
        }
      }
    });
  };
  if (mode !== 'solid') holder.setDisplayMode(mode);
  return holder;
}
