/**
 * MATHVERSE EXHIBITION | ROYAL CRIMSON & GOLD FACADE (DECORATIVE ONLY)
 * Palette: Royal Crimson #861B30, Velvet Crimson #A42A3D, Gold Leaf #D9AF5B, Light Gold #FFE29A.
 * Preserves all colliders, entrance passage (width 6.8m, height 5.4m), and raycasting.
 */
import {PEOPLE} from './people.mjs?v=r107_v15';
import {WALL_TITLES} from './layout.mjs?v=r107_v15';

function createSignTexture(THREE, text, subtitle='', { width=1024, height=220, bg='#861b30', border='#d9af5b', textColor='#fff3d8', subColor='#ffd889' }={}) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Decorative border
  ctx.strokeStyle = border;
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, width - 16, height - 16);

  ctx.strokeStyle = '#a8203c';
  ctx.lineWidth = 4;
  ctx.strokeRect(18, 18, width - 36, height - 36);

  // Corner ornaments
  ctx.fillStyle = border;
  for (const [cx, cy] of [[24, 24], [width - 24, 24], [24, height - 24], [width - 24, height - 24]]) {
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Text with automatic font-fitting so long Vietnamese titles never clip
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const maxTextW = width - 92;
  if (subtitle) {
    let f1 = Math.min(54, Math.floor(height * 0.28));
    ctx.font = `bold ${f1}px "Segoe UI", Arial, sans-serif`;
    while (ctx.measureText(text).width > maxTextW && f1 > 20) {
      f1 -= 2;
      ctx.font = `bold ${f1}px "Segoe UI", Arial, sans-serif`;
    }
    ctx.fillStyle = textColor;
    ctx.fillText(text, width / 2, height * 0.38);

    let f2 = Math.min(32, Math.floor(height * 0.18));
    ctx.font = `600 ${f2}px "Segoe UI", Arial, sans-serif`;
    while (ctx.measureText(subtitle).width > maxTextW && f2 > 16) {
      f2 -= 2;
      ctx.font = `600 ${f2}px "Segoe UI", Arial, sans-serif`;
    }
    ctx.fillStyle = subColor;
    ctx.fillText(subtitle, width / 2, height * 0.72);
  } else {
    let f1 = Math.min(58, Math.floor(height * 0.44));
    ctx.font = `bold ${f1}px "Segoe UI", Arial, sans-serif`;
    while (ctx.measureText(text).width > maxTextW && f1 > 20) {
      f1 -= 2;
      ctx.font = `bold ${f1}px "Segoe UI", Arial, sans-serif`;
    }
    ctx.fillStyle = textColor;
    ctx.fillText(text, width / 2, height / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function createExhibitionRedFacade(THREE, mountGroup, options={}) {
  const { centerX=54, doorZ=-8, backZ=-48, width=34, depth=40, height=8.5 } = options;
  if (!THREE || !mountGroup) throw new Error('Cần THREE và mountGroup');

  const root = new THREE.Group();
  root.name = 'MATHVERSE EXHIBITION | RED FACADE | DECORATIVE ONLY';
  root.userData.visualOnly = true;

  const crimson = new THREE.MeshStandardMaterial({
    color: 0x861b30, roughness: 0.52, metalness: 0.12, emissive: 0x24060c, emissiveIntensity: 0.22
  });
  const velvetRed = new THREE.MeshStandardMaterial({
    color: 0xa42a3d, roughness: 0.48, metalness: 0.15
  });
  const gold = new THREE.MeshStandardMaterial({
    color: 0xd9af5b, metalness: 0.65, roughness: 0.28
  });
  const goldBright = new THREE.MeshBasicMaterial({ color: 0xffe29a });
  const runnerMat = new THREE.MeshStandardMaterial({
    color: 0x5c1223, roughness: 0.72, metalness: 0.08
  });

  const place = (dimensions, position, material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...dimensions), material);
    mesh.position.set(...position);
    mesh.userData.visualOnly = true;
    mesh.raycast = () => {};
    root.add(mesh);
    return mesh;
  };

  const zFront = doorZ + 0.28;

  // 1. Decorative Pilasters flanking the 6.8m entrance doorway (outside opening, at x = centerX ± 3.85)
  for (const sign of [-1, 1]) {
    const px = centerX + sign * 3.85;
    // Pilaster shaft
    place([0.38, height - 1.2, 0.18], [px, (height - 1.2) / 2, zFront], crimson);
    // Gold Capital & Base
    place([0.48, 0.22, 0.24], [px, height - 1.2 + 0.11, zFront], gold);
    place([0.48, 0.22, 0.24], [px, 0.11, zFront], gold);
    place([0.42, 0.12, 0.22], [px, 5.5, zFront], gold);

    // Decorative toruses on pilaster head
    const motif = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.04, 8, 24), gold);
    motif.position.set(px, 7.3, zFront + 0.1);
    motif.userData.visualOnly = true;
    motif.raycast = () => {};
    root.add(motif);
  }

  // 2. Horizontal Gold Architectural Moldings strictly ABOVE the 5.4m opening
  place([10.2, 0.14, 0.22], [centerX, 5.55, zFront], gold);
  place([10.2, 0.06, 0.24], [centerX, 5.65, zFront], goldBright);
  place([10.6, 0.16, 0.22], [centerX, 8.15, zFront], gold);

  // 3. Prominent Grand Signboard above entrance
  const mainSignTex = createSignTexture(THREE, 'TRIỂN LÃM DANH NHÂN TOÁN HỌC', '', {
    width: 1200, height: 180, bg: '#861b30', border: '#d9af5b', textColor: '#fff6e0'
  });
  const mainSignMat = new THREE.MeshBasicMaterial({ map: mainSignTex, side: THREE.DoubleSide });
  const mainSignMesh = new THREE.Mesh(new THREE.PlaneGeometry(10.8, 1.45), mainSignMat);
  mainSignMesh.position.set(centerX, 7.15, zFront + 0.16);
  mainSignMesh.userData.visualOnly = true;
  mainSignMesh.raycast = () => {};
  root.add(mainSignMesh);

  // 4. Subtitle Signboard: dynamic count of mathematicians
  const subSignTex = createSignTexture(THREE, `${PEOPLE.length} DANH NHÂN · HÀNH TRÌNH TOÁN HỌC`, '', {
    width: 900, height: 130, bg: '#5c1223', border: '#d9af5b', textColor: '#ffd889'
  });
  const subSignMat = new THREE.MeshBasicMaterial({ map: subSignTex, side: THREE.DoubleSide });
  const subSignMesh = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 0.85), subSignMat);
  subSignMesh.position.set(centerX, 6.05, zFront + 0.16);
  subSignMesh.userData.visualOnly = true;
  subSignMesh.raycast = () => {};
  root.add(subSignMesh);

  // 5. Interior Wall Group Title Banners above the 3 walls + Exit Banner above doorway
  const wallBanners = [
    { title: WALL_TITLES.back, w: 16.8, h: 1.18, x: centerX, y: 7.2, z: backZ + 0.58, rotY: 0 },
    { title: WALL_TITLES.left, w: 16.8, h: 1.18, x: centerX - width / 2 + 0.58, y: 7.2, z: backZ + depth / 2, rotY: Math.PI / 2 },
    { title: WALL_TITLES.right, w: 16.8, h: 1.18, x: centerX + width / 2 - 0.58, y: 7.2, z: backZ + depth / 2, rotY: -Math.PI / 2 },
    { title: '🏛 LỐI RA SẢNH LAB & QUAY VỀ SẢNH CHÍNH (CỔNG PHÍA NAM)', w: 13.8, h: 1.05, x: centerX, y: 6.5, z: doorZ - 0.42, rotY: Math.PI }
  ];
  for (const b of wallBanners) {
    const tex = createSignTexture(THREE, b.title, '', {
      width: 1600, height: 180, bg: '#142a3e', border: '#d9af5b', textColor: '#f8eed4'
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(b.w, b.h), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
    mesh.position.set(b.x, b.y, b.z);
    mesh.rotation.y = b.rotY;
    mesh.userData.visualOnly = true;
    mesh.raycast = () => {};
    root.add(mesh);
  }

  // 6. Royal Crimson Interior Floor Runner (down central aisle, clear of GeoGebra pedestals)
  const runnerLength = depth - 4.5;
  const runnerCenterZ = doorZ - runnerLength / 2;
  place([3.6, 0.02, runnerLength], [centerX, 0.012, runnerCenterZ], runnerMat);
  // Gold borders on carpet
  place([0.08, 0.024, runnerLength], [centerX - 1.82, 0.014, runnerCenterZ], gold);
  place([0.08, 0.024, runnerLength], [centerX + 1.82, 0.014, runnerCenterZ], gold);

  mountGroup.add(root);

  return {
    root,
    destroy() {
      mountGroup.remove(root);
      root.traverse(n => {
        if (n.geometry) n.geometry.dispose();
      });
      crimson.dispose();
      velvetRed.dispose();
      gold.dispose();
      goldBright.dispose();
      runnerMat.dispose();
      mainSignMat.dispose();
      mainSignTex.dispose();
      subSignMat.dispose();
      subSignTex.dispose();
    }
  };
}

