/** New FOURTH architectural zone for the original Grand Campus (R93 + R95).
 * One exterior, a foyer, TWO independent rooms. Reuses the existing THREE renderer/avatar.
 */
import * as THREE from '/vendor/three.module.js';
import {
  DISCOVERY_LANDMARKS,
  DISCOVERY_ARTWORKS,
  DISCOVERY_ALL_LANDMARKS,
  DISCOVERY_ALL_ARTWORKS,
  MAX_GALLERY_PHYSICAL_FRAMES,
  getGallerySliceForFrames,
  isReadyToShowPhotograph
} from './discovery-data.mjs';
import { createDiscoveryModel } from './discovery-shapes.mjs';
import { R95_SVG_MAP } from './discovery-r95/r95-assets-bundle.mjs';
import { resolveDiscoveryPhoto } from './discovery-photo-r96.mjs';

export const DISCOVERY_SITE = Object.freeze({
  building: Object.freeze({ x: 0, z: -138 }),
  entry: Object.freeze({ x: 0, z: -78 }),
  path: Object.freeze([[0, -42], [0, -60], [0, -78]]),
  bounds: Object.freeze({ xMin: -56, xMax: 56, zMin: -194, zMax: -78 })
});

const mat = (color, props = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0.14, ...props });
const m = {
  stone: mat(0xeaf4f4, { roughness: 0.42, metalness: 0.14 }),
  wall: mat(0xfaf6ed, { roughness: 0.46, metalness: 0.10 }),
  navy: mat(0x0b2138, { roughness: 0.36, metalness: 0.34 }),
  deepTeal: mat(0x0f3d52, { roughness: 0.38, metalness: 0.28 }),
  dark: mat(0x0c2d42, { roughness: 0.42, metalness: 0.24 }),
  teal: mat(0x14b8a6, { metalness: 0.46, roughness: 0.24, emissive: 0x0d9488, emissiveIntensity: 0.15 }),
  gold: mat(0xf59e0b, { metalness: 0.78, roughness: 0.18, emissive: 0xb45309, emissiveIntensity: 0.12 }),
  floor: mat(0xdbeafe, { roughness: 0.32, metalness: 0.16 }),
  glass: mat(0x38bdf8, { transparent: true, opacity: 0.52, roughness: 0.14, metalness: 0.32 }),
  glow: new THREE.MeshBasicMaterial({ color: 0x5eead4 })
};

function box(parent, w, h, d, material, x, y, z, name) {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  o.position.set(x, y, z);
  if (name) o.name = name;
  parent.add(o);
  return o;
}

function sphere(parent, r, material, x, y, z) {
  const o = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), material);
  o.position.set(x, y, z);
  parent.add(o);
  return o;
}

function sign(parent, title, subtitle, x, y, z, w = 14, h = 3.2, rotationY = 0) {
  const ratio = Math.max(2.4, Math.min(9.0, w / Math.max(0.5, h)));
  const H = 512, W = Math.round(H * ratio);
  const cvs = document.createElement('canvas');
  cvs.width = Math.round(W * 0.5);
  cvs.height = Math.round(H * 0.5);
  const ctx = cvs.getContext('2d');
  ctx.scale?.(0.5, 0.5);
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#091b2d');
  grad.addColorStop(1, '#113748');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#d9b471';
  ctx.lineWidth = 16;
  ctx.strokeRect(14, 14, W - 28, H - 28);
  ctx.strokeStyle = '#2dcab8';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, W - 60, H - 60);
  ctx.fillStyle = '#fff6df';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let tSize = 88;
  ctx.font = `bold ${tSize}px "Segoe UI", system-ui, Arial, sans-serif`;
  while (ctx.measureText(title).width > W - 120 && tSize > 42) {
    tSize -= 2;
    ctx.font = `bold ${tSize}px "Segoe UI", system-ui, Arial, sans-serif`;
  }
  ctx.fillText(title, W / 2, H * 0.38);
  let sSize = 52;
  ctx.font = `bold ${sSize}px "Segoe UI", system-ui, Arial, sans-serif`;
  while (ctx.measureText(subtitle).width > W - 120 && sSize > 28) {
    sSize -= 2;
    ctx.font = `bold ${sSize}px "Segoe UI", system-ui, Arial, sans-serif`;
  }
  ctx.fillStyle = '#bef8ef';
  ctx.fillText(subtitle, W / 2, H * 0.73);
  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = 4;
  const card = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: THREE.FrontSide }));
  const cardBack = new THREE.Mesh(card.geometry, new THREE.MeshBasicMaterial({ map: tex, side: THREE.FrontSide }));
  cardBack.rotation.y = Math.PI;
  cardBack.position.z = -0.012;
  card.add(cardBack);
  card.position.set(x, y, z);
  card.rotation.y = rotationY;
  parent.add(card);
  return card;
}

function roomBase(group,cx,cz,w,d,hue,height=10.8){
  // The globe has a 7 m visual radius; its wing needs an 18.5 m clear ceiling.
  // Keep the original foyer and gallery heights unchanged.
  box(group,w,.26,d,mat(hue),cx,-.12,cz,'DISCOVERY_ROOM_FLOOR');
  box(group,w,.45,d,m.dark,cx,height-.2,cz,'DISCOVERY_ROOM_CEILING');
  box(group,.46,height,d,m.wall,cx-w/2,height/2,cz,'DISCOVERY_SIDE_WALL');
  box(group,.46,height,d,m.wall,cx+w/2,height/2,cz,'DISCOVERY_SIDE_WALL');
  box(group,w,height,.48,m.wall,cx,height/2,cz-d/2,'DISCOVERY_BACK_WALL');
  box(group,w,height,.38,m.wall,cx,height/2,cz+d/2,'DISCOVERY_FRONT_WALL');
  const strip=box(group,w-.8,.12,.65,m.gold,cx,.13,cz-d/2+.55);strip.name='DISCOVERY_FLOOR_EDGE';
  // R95 architectural wainscoting & gold trim along walls
  box(group, w - 0.6, 1.35, 0.12, m.navy, cx, 0.68, cz - d / 2 + 0.28, 'DISCOVERY_WAINSCOT_N');
  box(group, 0.12, 1.35, d - 0.6, m.navy, cx - w / 2 + 0.28, 0.68, cz, 'DISCOVERY_WAINSCOT_W');
  box(group, 0.12, 1.35, d - 0.6, m.navy, cx + w / 2 - 0.28, 0.68, cz, 'DISCOVERY_WAINSCOT_E');
}

function door(group, x, z, label, action, clickables) {
  box(group, 5.8, 7, .5, m.navy, x, 3.6, z);
  box(group, 6.5, .32, 1, m.gold, x, 7.0, z);
  for (const dx of [-3.2, 3.2]) box(group, .3, 7, .8, m.gold, x + dx, 3.5, z);
  const hit = box(group, 5.4, 6.3, .72, m.glass, x, 3.4, z, 'DISCOVERY_ROOM_INTERACTIVE_DOOR');
  hit.userData.discoveryAction = action;
  clickables.push(hit);
  sign(group, label, 'NHẤN E HOẶC BẤM CỬA', x, 8.9, z + .4, 9.4, 2.05, 0);
}

const deferredPhotoTasks = [];
let deferredPhotosStarted = false;
function flushDeferredPhotos() {
  if (deferredPhotosStarted) return;
  deferredPhotosStarted = true;
  const runNext = () => {
    const task = deferredPhotoTasks.shift();
    if (!task) return;
    try { task(); } catch (_) {}
    setTimeout(runNext, 90);
  };
  setTimeout(runNext, 60);
}

function frameFallback(title, tag, item = null) {
  const cv = document.createElement('canvas');
  cv.width = 640;
  cv.height = 440;
  const ctx = cv.getContext('2d');
  ctx.scale?.(0.5, 0.5);
  ctx.fillStyle = '#091b2d';
  ctx.fillRect(0, 0, 1280, 880);
  const gradient = ctx.createLinearGradient(0, 0, 1280, 880);
  gradient.addColorStop(0, '#113748');
  gradient.addColorStop(1, '#091b2d');
  ctx.fillStyle = gradient;
  ctx.fillRect(24, 24, 1232, 832);
  ctx.strokeStyle = '#d9b471';
  ctx.lineWidth = 8;
  ctx.strokeRect(32, 32, 1216, 816);

  if (item && item.collection) {
    ctx.fillStyle = '#2dcab8';
    ctx.font = 'bold 40px "Segoe UI", system-ui, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(item.collection.toUpperCase(), 64, 92, 880);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#d9b471';
    ctx.fillText(item.grade || 'Toán 6–12', 1216, 92);
  }

  ctx.font = 'bold 184px "Segoe UI Emoji", "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#d9b471';
  ctx.fillText(tag || '📐', 640, 310);

  ctx.font = 'bold 68px "Segoe UI", system-ui, Arial, sans-serif';
  ctx.fillStyle = '#edf5f8';
  ctx.fillText(title, 640, 550, 1140);

  if (item && item.math) {
    ctx.font = 'bold 44px "Segoe UI", system-ui, Arial, sans-serif';
    ctx.fillStyle = '#b4d0de';
    ctx.fillText(item.math, 640, 644, 1140);
  }
  if (item && item.latex) {
    ctx.font = 'bold 44px "Courier New", monospace';
    ctx.fillStyle = '#2dcab8';
    ctx.fillText(item.latex, 640, 724, 1120);
  }
  ctx.font = 'bold 36px "Segoe UI", system-ui, Arial, sans-serif';
  ctx.fillStyle = '#d9b471';
  ctx.fillText(
    item && item.publishReady === false
      ? 'Minh họa vector Toán học R95 • Nhấn E / Click để mở'
      : 'Nhấn E hoặc Click vào khung tranh để khám phá 2D/3D',
    640,
    808,
    1140
  );

  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.generateMipmaps = false;
  t.minFilter = THREE.LinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.anisotropy = 4;

  const loadAsyncMedia = () => {
    if (t.userData?.stale) return;
    if (canLoadPhotos() && item?.svgPath && R95_SVG_MAP[item.svgPath] && typeof Image !== 'undefined') {
      const img = new Image();
      img.onload = () => {
        if (t.userData?.stale) return;
        ctx.fillStyle = '#091b2d';
        ctx.fillRect(40, 120, 1200, 470);
        ctx.drawImage(img, 220, 124, 840, 460);
        ctx.fillStyle = 'rgba(9, 27, 45, 0.94)';
        ctx.fillRect(40, 590, 1200, 250);
        ctx.textAlign = 'center';
        ctx.font = 'bold 68px "Segoe UI", system-ui, Arial, sans-serif';
        ctx.fillStyle = '#fff6df';
        ctx.fillText(title, 640, 646, 1120);
        ctx.font = 'bold 44px "Segoe UI", system-ui, Arial, sans-serif';
        ctx.fillStyle = '#bef8ef';
        ctx.fillText(`${item.math || ''}  |  ${item.latex || ''}`, 640, 718, 1120);
        ctx.font = 'bold 38px "Segoe UI", system-ui, Arial, sans-serif';
        ctx.fillStyle = '#d9b471';
        ctx.fillText('Minh họa vector Toán học R95 • Bấm để xem chi tiết', 640, 790, 1120);
        t.needsUpdate = true;
      };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(R95_SVG_MAP[item.svgPath]);
    }
    if (item && canLoadPhotos()) {
      resolveDiscoveryPhoto(item).then(meta => {
        if (!meta?.url || t.userData?.stale) return;
        const image=new Image();image.crossOrigin='anonymous';
        image.onload=()=>{
          if(t.userData?.stale)return;
          try {
            ctx.fillStyle='#0a2033';ctx.fillRect(0,0,1280,880);
            const scale=Math.max(1280/image.width,620/image.height);
            const w=image.width*scale,h=image.height*scale;
            ctx.drawImage(image,(1280-w)/2,(620-h)/2,w,h);
            ctx.fillStyle='rgba(9,27,45,.95)';ctx.fillRect(0,620,1280,260);
            ctx.textAlign='center';ctx.fillStyle='#fff6df';ctx.font='bold 72px "Segoe UI", system-ui, Arial, sans-serif';
            ctx.fillText(title,640,708,1200);
            ctx.fillStyle='#bef8ef';ctx.font='bold 44px "Segoe UI", system-ui, Arial, sans-serif';
            ctx.fillText('Ảnh tư liệu Wikimedia Commons · Bấm để so sánh 2D/3D',640,794,1200);
            t.needsUpdate=true;
          }catch(error){console.info('Discovery photo texture issue:',error.message);}
        };
        image.src=meta.url;
      });
    }
  };
  if (deferredPhotosStarted) {
    loadAsyncMedia();
  } else {
    deferredPhotoTasks.push(loadAsyncMedia);
  }
  return t;
}

function canLoadPhotos() {
  return typeof document !== 'undefined' && typeof window !== 'undefined';
}

export function createDiscoveryWorld() {
  const exterior = new THREE.Group();
  exterior.name = 'DISCOVERY_FOURTH_ARCHITECTURE_EXTERIOR';
  const { x, z } = DISCOVERY_SITE.building;

  // R107: Đảo Bắc DISCOVERY (x = 0, z = -138) — ĐÀI THIÊN VĂN HOÀNG GIA & QUẢ ĐỊA CẦU 3D TƯƠNG PHẢN CAO
  const royalGoldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.18, metalness: 0.82 });
  const royalIndigoMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.30, metalness: 0.46 });
  const marbleMat = new THREE.MeshStandardMaterial({ color: 0xfdf8ee, roughness: 0.32, metalness: 0.10 });
  const oceanBlueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.20, metalness: 0.28 });

  const purpleRim = new THREE.Mesh(new THREE.TorusGeometry(55.5, 0.52, 12, 96), royalGoldMat);
  purpleRim.rotation.x = Math.PI / 2;
  purpleRim.position.set(x, 0.28, z);
  exterior.add(purpleRim);

  // Bệ Đá Cẩm Thạch & Sapphire 3 Bậc ở tâm Đảo Bắc (0, -138)
  for (const [rTop, rBot, h, py, matStep] of [
    [32.5, 34.0, 0.8, 0.4, marbleMat],
    [24.0, 25.2, 1.1, 1.25, royalIndigoMat],
    [16.5, 18.0, 2.2, 2.8, marbleMat]
  ]) {
    const step = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, 64), matStep);
    step.position.set(x, py, z - 4);
    step.castShadow = true;
    step.receiveShadow = true;
    exterior.add(step);
  }
  const pedestalRing = new THREE.Mesh(new THREE.TorusGeometry(17.2, 0.38, 12, 64), royalGoldMat);
  pedestalRing.rotation.x = Math.PI / 2;
  pedestalRing.position.set(x, 3.95, z - 4);
  exterior.add(pedestalRing);

  // Quả Địa Cầu Đại Dương Xanh Sapphire & Vòng Quỹ Đạo Vàng 24K Tương Phản Cao
  const bigGlobe = new THREE.Mesh(new THREE.SphereGeometry(18.5, 48, 36), oceanBlueMat);
  bigGlobe.position.set(x, 22.8, z - 4);
  bigGlobe.castShadow = true;
  bigGlobe.receiveShadow = true;
  exterior.add(bigGlobe);

  // Các vòng Kinh tuyến & Vĩ tuyến Vàng 24K & Indigo Hoàng Gia
  for (const ry of [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4]) {
    const mRing = new THREE.Mesh(new THREE.TorusGeometry(19.0, 0.42, 12, 72), royalGoldMat);
    mRing.position.set(x, 22.8, z - 4);
    mRing.rotation.y = ry;
    exterior.add(mRing);
  }
  for (const [latY, latR] of [[22.8, 19.1], [31.2, 16.2], [14.4, 16.2]]) {
    const pRing = new THREE.Mesh(new THREE.TorusGeometry(latR, 0.38, 12, 72), royalIndigoMat);
    pRing.position.set(x, latY, z - 4);
    pRing.rotation.x = Math.PI / 2;
    exterior.add(pRing);
  }
  const outerOrbit = new THREE.Mesh(new THREE.TorusGeometry(24.5, 0.62, 14, 84), royalGoldMat);
  outerOrbit.position.set(x, 22.8, z - 4);
  outerOrbit.rotation.set(Math.PI * 0.32, 0.25, 0);
  exterior.add(outerOrbit);
  const outerOrbit2 = new THREE.Mesh(new THREE.TorusGeometry(26.8, 0.48, 12, 84), m.teal);
  outerOrbit2.position.set(x, 22.8, z - 4);
  outerOrbit2.rotation.set(-Math.PI * 0.28, -0.35, 0);
  exterior.add(outerOrbit2);
  const apexStar = new THREE.Mesh(new THREE.OctahedronGeometry(2.1, 0), royalGoldMat);
  apexStar.position.set(x, 45.2, z - 4);
  exterior.add(apexStar);

  // 12 Trụ cột Đài Thiên Văn Cẩm Thạch Corinthian bao quanh Quả Địa Cầu ở tâm Đảo Bắc
  for (let i = 0; i < 12; i++) {
    const ang = (i * Math.PI * 2) / 12 + Math.PI / 12;
    const cx = x + Math.sin(ang) * 30.5;
    const cz = z - 4 + Math.cos(ang) * 30.5;
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 2.4), royalIndigoMat);
    plinth.position.set(cx, 0.85, cz);
    exterior.add(plinth);
    const col = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.25, 16.2, 24), marbleMat);
    col.position.set(cx, 9.4, cz);
    col.castShadow = true;
    col.receiveShadow = true;
    exterior.add(col);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.2, 0.85, 24), royalGoldMat);
    cap.position.set(cx, 17.8, cz);
    exterior.add(cap);
  }
  const colonnadeDrum = new THREE.Mesh(new THREE.CylinderGeometry(30.8, 30.8, 1.35, 72, 1, true), royalIndigoMat);
  colonnadeDrum.material.side = THREE.DoubleSide;
  colonnadeDrum.position.set(x, 18.8, z - 4);
  exterior.add(colonnadeDrum);
  for (const ry of [18.1, 19.5]) {
    const cRing = new THREE.Mesh(new THREE.TorusGeometry(30.9, 0.45, 12, 72), royalGoldMat);
    cRing.rotation.x = Math.PI / 2;
    cRing.position.set(x, ry, z - 4);
    exterior.add(cRing);
  }

  // Cổng vào Hoàng Gia hướng Nam (+Z, tại z = -82) nhìn thẳng về Đảo Trung Tâm GRAND DOME (0, 0)
  box(exterior, 20.4, 11.2, 1.6, royalIndigoMat, x, 5.6, z + 55.8);
  box(exterior, 21.6, 0.55, 2.2, royalGoldMat, x, 11.4, z + 55.8);
  for (const dx of [-8.2, -5.8, 5.8, 8.2]) {
    const pCol = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.78, 10.8, 20), marbleMat);
    pCol.position.set(x + dx, 5.4, z + 56.8);
    exterior.add(pCol);
  }
  const entry = box(exterior, 10.6, 8.4, 1.4, m.glass, x, 4.2, z + 56.6, 'DISCOVERY_EXTERIOR_DOOR');
  entry.userData.discoveryAction = { type: 'enter' };
  sign(exterior, 'MATHVERSE DISCOVERY 3D', 'PHÒNG A • ĐỊA CẦU & 35 KỲ QUAN UNESCO  |  PHÒNG B • 32 ẢNH THẬT & MÔ HÌNH 3D', x, 13.4, z + 57.0, 22.0, 4.0, 0);

  const interior=new THREE.Group();interior.name='DISCOVERY_INDEPENDENT_INTERIOR';interior.visible=false;
  const foyer=new THREE.Group();foyer.name='DISCOVERY_FOYER';roomBase(foyer,0,22,60,44,0xf5efe2,16.5);
  sign(foyer, 'HÀNH LANG KHÁM PHÁ · BẢNG CHỈ DẪN 2 PHÒNG & NPC HƯỚNG DẪN', 'TRÁI: ĐỊA CẦU 3D (34 ĐIỂM)   •   GIỮA: BẢNG CHỈ DẪN & NPC   •   PHẢI: BẢN ĐỒ THẾ GIỚI (34 ĐIỂM)', 0, 13.0, 1.8, 34.0, 3.4);
  // Royal Compass Medallion & Golden Orbital Floor Inlay in Discovery Foyer
  const foyerMedallion = new THREE.Mesh(new THREE.CylinderGeometry(9.2, 9.2, 0.04, 64), m.navy);
  foyerMedallion.position.set(0, 0.015, 21.5);
  foyer.add(foyerMedallion);
  for (const r of [6.2, 9.3, 15.5]) {
    const floorRing = new THREE.Mesh(new THREE.RingGeometry(r - 0.18, r + 0.18, 64), m.gold);
    floorRing.rotation.x = -Math.PI / 2;
    floorRing.position.set(0, 0.045, 21.5);
    foyer.add(floorRing);
  }
  // Illuminated Skylight Oculus on Foyer Ceiling
  const foyerSkylight = new THREE.Mesh(new THREE.CylinderGeometry(11.5, 11.5, 0.18, 48), m.glow);
  foyerSkylight.position.set(0, 16.05, 21.5);
  foyer.add(foyerSkylight);
  const foyerSkyRing = new THREE.Mesh(new THREE.TorusGeometry(11.6, 0.32, 12, 64), m.gold);
  foyerSkyRing.rotation.x = Math.PI / 2;
  foyerSkyRing.position.set(0, 15.95, 21.5);
  foyer.add(foyerSkyRing);
  // Classical Marble Pilasters along Foyer Walls
  for (const px of [-26, -10, 10, 26]) {
    box(foyer, 0.85, 15.8, 0.65, marbleMat, px, 7.9, 0.45);
    box(foyer, 1.15, 0.55, 0.85, m.gold, px, 15.6, 0.45);
  }
  // Central axial carpet leading from South entrance to the Central Directory Board & 2 Exhibition Rooms
  box(foyer, 8.6, 0.05, 36.0, m.gold, 0, 0.02, 21.5, 'DISCOVERY_FOYER_CARPET_BORDER');
  box(foyer, 7.8, 0.06, 35.6, m.navy, 0, 0.04, 21.5, 'DISCOVERY_FOYER_CARPET');

  // West Wing Podium (x = -15.5, z = 21.5): 3D Interactive Earth Globe (34 pins)
  const westPodium = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.6, 0.92, 48), m.navy);
  westPodium.position.set(-15.5, 0.46, 21.5);
  westPodium.name = 'DISCOVERY_WELCOME_PODIUM';
  foyer.add(westPodium);
  const westRing = new THREE.Mesh(new THREE.CylinderGeometry(5.38, 5.38, 0.14, 48), m.gold);
  westRing.position.set(-15.5, 0.94, 21.5);
  foyer.add(westRing);
  sign(foyer, 'ĐỊA CẦU 3D TƯƠNG TÁC (34 ĐIỂM)', 'KÉO CHUỘT XOAY 360° • BẤM CHẤM XEM ẢNH THẬT & SKETCHFAB 3D', -15.5, 11.4, 21.5, 13.5, 2.35, 0.28);

  // East Wing Podium (x = +15.5, z = 21.5): Symmetrical 3D World Map Monument (34 pins)
  const eastPodium = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.6, 0.92, 48), m.navy);
  eastPodium.position.set(15.5, 0.46, 21.5);
  eastPodium.name = 'DISCOVERY_EAST_MAP_PODIUM';
  foyer.add(eastPodium);
  const eastRing = new THREE.Mesh(new THREE.CylinderGeometry(5.38, 5.38, 0.14, 48), m.gold);
  eastRing.position.set(15.5, 0.94, 21.5);
  foyer.add(eastRing);
  sign(foyer, 'BẢN ĐỒ THẾ GIỚI ĐỐI XỨNG (34 ĐIỂM)', 'BẤM ĐIỂM XEM ẢNH THẬT & SKETCHFAB 3D • BẤM BẢN ĐỒ MỞ TOÀN MÀN HÌNH', 15.5, 11.4, 21.5, 13.5, 2.35, -0.28);

  const foyerHits = [];
  door(foyer, -16.5, 2.0, 'PHÒNG A · UNESCO 3D (3 TẦNG)', { type: 'go', room: 'globe' }, foyerHits);
  door(foyer, 16.5, 2.0, 'PHÒNG B · 68 TRANH (3 TẦNG)', { type: 'go', room: 'gallery' }, foyerHits);
  // Return to original campus through entrance at south of foyer.
  door(foyer, 0, 41.5, 'VỀ SẢNH CHUNG', { type: 'exit' }, foyerHits);

  // Grand Central Directory Board ("BẢNG CHỈ DẪN 2 CĂN PHÒNG") at the center of the North corridor wall (x = 0, z = 2.3)
  function buildCentralDirectoryBoard() {
    const dirGroup = new THREE.Group();
    dirGroup.name = 'DISCOVERY_CENTRAL_DIRECTORY_BOARD';
    dirGroup.position.set(0, 0, 2.35);
    box(dirGroup, 13.8, 8.6, 0.52, m.gold, 0, 5.2, 0);
    box(dirGroup, 13.2, 8.0, 0.58, m.navy, 0, 5.2, 0.04);
    for (const px of [-6.2, 6.2]) {
      box(dirGroup, 0.55, 9.4, 0.75, m.gold, px, 4.7, 0.08);
    }
    const cv = document.createElement('canvas');
    cv.width = 1600;
    cv.height = 960;
    const ctx = cv.getContext('2d');
    const bg = ctx.createLinearGradient(0, 0, 1600, 960);
    bg.addColorStop(0, '#07192b');
    bg.addColorStop(1, '#0f3146');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1600, 960);
    ctx.strokeStyle = '#e5c178';
    ctx.lineWidth = 14;
    ctx.strokeRect(18, 18, 1564, 924);
    ctx.strokeStyle = '#2dcab8';
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, 1528, 888);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 54px "Segoe UI", system-ui, Arial, sans-serif';
    ctx.fillText('🧭 BẢNG CHỈ DẪN 2 PHÒNG TRIỂN LÃM 3 TẦNG', 800, 102);
    ctx.fillStyle = '#99f6e4';
    ctx.font = 'bold 30px "Segoe UI", system-ui, Arial, sans-serif';
    ctx.fillText('BẤM VÀO BẢNG HOẶC GẶP NPC ĐỨNG TRƯỚC PHÒNG ĐỂ NGHE GIỚI THIỆU & DỊCH CHUYỂN NHANH', 800, 156);

    // Left Card: Room A
    ctx.fillStyle = 'rgba(14, 48, 71, 0.92)';
    ctx.fillRect(68, 195, 700, 560);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 5;
    ctx.strokeRect(68, 195, 700, 560);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fcd34d';
    ctx.font = 'bold 40px "Segoe UI", system-ui, Arial, sans-serif';
    ctx.fillText('⬅ PHÒNG A · UNESCO & KỲ QUAN 3D', 98, 258);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 28px "Segoe UI", system-ui, Arial, sans-serif';
    ctx.fillText('• Cấu trúc: 3 TẦNG có cầu thang đi bộ lên', 98, 322);
    ctx.fillText('• Tầng 1: 16 Di sản R106 + GLB Parthenon R98', 98, 376);
    ctx.fillText('• Tầng 2: 10 Công trình & Cầu Tháp R107', 98, 430);
    ctx.fillText('• Tầng 3: 9 Kỳ quan Cổ đại & Thế giới MỚI', 98, 484);
    ctx.fillStyle = '#5eead4';
    ctx.fillText('✓ Tổng cộng 35 bục 3D trong cùng 1 phòng', 98, 548);
    ctx.fillText('✓ Đầy đủ tab Sketchfab • Hình học 3D • Hình 2D', 98, 600);
    ctx.fillStyle = '#fde68a';
    ctx.fillText('👉 Cửa bên TRÁI (x = -16.5m)', 98, 668);

    // Right Card: Room B
    ctx.fillStyle = 'rgba(14, 48, 71, 0.92)';
    ctx.fillRect(832, 195, 700, 560);
    ctx.strokeStyle = '#2dcab8';
    ctx.lineWidth = 5;
    ctx.strokeRect(832, 195, 700, 560);
    ctx.fillStyle = '#5eead4';
    ctx.font = 'bold 40px "Segoe UI", system-ui, Arial, sans-serif';
    ctx.fillText('PHÒNG B · 32 ẢNH THẬT HÌNH HỌC ➡', 862, 258);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 28px "Segoe UI", system-ui, Arial, sans-serif';
    ctx.fillText('• Cấu trúc: 3 TẦNG có cầu thang đi bộ lên', 862, 322);
    ctx.fillText('• Tầng 1: 15 Ảnh thật Đời sống R106 & R93 + Bục 3D', 862, 376);
    ctx.fillText('• Tầng 2: 9 Ảnh thật Thiên nhiên R107 + Bục 3D', 862, 430);
    ctx.fillText('• Tầng 3: 8 Ảnh thật Kỹ thuật R107 + Bục 3D', 862, 484);
    ctx.fillStyle = '#fcd34d';
    ctx.fillText('✓ 100% ảnh chụp thực tế đã xác thực (32 tranh)', 862, 548);
    ctx.fillText('✓ Bấm vào tranh/bục để xoay Mô hình 3D & 2D', 862, 600);
    ctx.fillStyle = '#fde68a';
    ctx.fillText('👉 Cửa bên PHẢI (x = +16.5m)', 862, 668);

    // Bottom Banner: 2 Sides of Corridor
    ctx.fillStyle = 'rgba(9, 27, 45, 0.95)';
    ctx.fillRect(68, 785, 1464, 108);
    ctx.strokeStyle = '#d9b471';
    ctx.lineWidth = 3;
    ctx.strokeRect(68, 785, 1464, 108);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff6df';
    ctx.font = 'bold 31px "Segoe UI", system-ui, Arial, sans-serif';
    ctx.fillText('🌍 BÊN TRÁI SẢNH: ĐỊA CẦU 3D (34 ĐIỂM)     |     🗺️ BÊN PHẢI SẢNH: BẢN ĐỒ THẾ GIỚI (34 ĐIỂM)', 800, 848);

    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    const boardMat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
    const boardPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(12.6, 7.5),
      boardMat
    );
    boardPlane.position.set(0, 5.2, 0.36);
    boardPlane.name = 'DISCOVERY_DIRECTORY_BOARD_PLANE';
    boardPlane.userData.discoveryAction = { type: 'discovery-npc', npcId: 'chief' };
    dirGroup.add(boardPlane);
    foyerHits.push(boardPlane);
    const boardPlaneBack = new THREE.Mesh(
      new THREE.PlaneGeometry(12.6, 7.5),
      boardMat
    );
    boardPlaneBack.position.set(0, 5.2, -0.32);
    boardPlaneBack.rotation.y = Math.PI;
    boardPlaneBack.name = 'DISCOVERY_DIRECTORY_BOARD_PLANE_BACK';
    boardPlaneBack.userData.discoveryAction = { type: 'discovery-npc', npcId: 'chief' };
    dirGroup.add(boardPlaneBack);
    foyerHits.push(boardPlaneBack);
    foyer.add(dirGroup);
  }
  buildCentralDirectoryBoard();

  // 3D Guide NPCs standing in front of the rooms & directory board
  const npcGroups = [];
  function createGuideNPC({ id, name, role, x, z, suitColor, accentColor, rotY = 0 }) {
    const g = new THREE.Group();
    g.name = `DISCOVERY_GUIDE_NPC_${id}`;
    g.position.set(x, 0, z);
    g.rotation.y = rotY;

    const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.3, 0.24, 28), m.navy);
    ped.position.y = 0.12;
    g.add(ped);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.06, 10, 32), m.gold);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.24;
    g.add(ring);

    const body = new THREE.Group();
    body.name = `DISCOVERY_NPC_BODY_${id}`;
    const legMat = mat(0x1e293b);
    const suitMat = mat(suitColor);
    const skinMat = mat(0xfbd3a7);
    const accentMat = mat(accentColor);

    box(body, 0.32, 1.05, 0.32, legMat, -0.22, 0.76, 0);
    box(body, 0.32, 1.05, 0.32, legMat, 0.22, 0.76, 0);
    box(body, 0.92, 1.32, 0.52, suitMat, 0, 1.92, 0);
    box(body, 0.28, 1.02, 0.12, accentMat, 0, 1.95, 0.27);
    box(body, 0.28, 1.12, 0.28, suitMat, -0.64, 1.90, 0);
    box(body, 0.28, 1.12, 0.28, suitMat, 0.64, 1.90, 0);
    sphere(body, 0.42, skinMat, 0, 2.95, 0);
    // Scholar cap
    box(body, 0.95, 0.10, 0.95, m.navy, 0, 3.36, 0);
    box(body, 0.56, 0.22, 0.56, m.gold, 0, 3.24, 0);
    g.add(body);

    const badge = sign(g, name, `${role} • NHẤN E / CLICK`, 0, 4.25, 0, 5.8, 1.25, 0);
    const hitBox = box(g, 2.2, 4.4, 2.2, new THREE.MeshBasicMaterial({ visible: false }), 0, 2.2, 0, `DISCOVERY_NPC_HIT_${id}`);
    const action = { type: 'discovery-npc', npcId: id };
    hitBox.userData.discoveryAction = action;
    badge.userData.discoveryAction = action;
    body.traverse((o) => {
      if (o.isMesh) o.userData.discoveryAction = action;
    });
    foyerHits.push(hitBox, badge);
    foyer.add(g);
    npcGroups.push({ id, group: g, body, baseY: 0 });
  }

  createGuideNPC({
    id: 'chief',
    name: '👨‍🏫 GS. MINH TRIẾT · TRƯỞNG BAN CHỈ DẪN',
    role: 'GIỚI THIỆU 2 PHÒNG 3 TẦNG & ĐỊA CẦU / BẢN ĐỒ',
    x: 0,
    z: 6.4,
    suitColor: 0x164e63,
    accentColor: 0xf59e0b,
    rotY: 0
  });
  createGuideNPC({
    id: 'unesco_guide',
    name: '🏛️ KTS. BẢO NGỌC · HƯỚNG DẪN PHÒNG A',
    role: 'PHÒNG A UNESCO 3D (3 TẦNG · 35 MÔ HÌNH)',
    x: -10.5,
    z: 5.5,
    suitColor: 0x1e3a8a,
    accentColor: 0x2dcab8,
    rotY: 0.18
  });
  createGuideNPC({
    id: 'gallery_guide',
    name: '📐 TS. HOÀNG NAM · HƯỚNG DẪN PHÒNG B',
    role: 'PHÒNG B 68 TRANH & MÔ HÌNH 3D (3 TẦNG)',
    x: 10.5,
    z: 5.5,
    suitColor: 0x065f46,
    accentColor: 0xfbbf24,
    rotY: -0.18
  });

  const globeRoom=new THREE.Group();globeRoom.name='DISCOVERY_GLOBE_ROOM';roomBase(globeRoom,-34,-13,44,44,0xb2d9dc,18.5);
  sign(globeRoom, 'PHÒNG A • ĐỊA CẦU TOÁN HỌC', '36 ĐỊA DANH • TÌM KIẾM & LỌC CHÂU LỤC • MÔ HÌNH 2D/3D LÝ TƯỞNG HÓA', -34, 8, -34.3, 24, 3.2);
  const globeHits = [];
  door(globeRoom, -34, 9, 'VỀ SẢNH CHỌN PHÒNG', { type: 'go', room: 'foyer' }, globeHits);
  const earthPivot = new THREE.Group();
  earthPivot.position.set(-34, 9, -13);
  globeRoom.add(earthPivot);
  const texture = new THREE.TextureLoader().load('/dual/discovery-assets/earth-fallback.png');
  texture.colorSpace = THREE.SRGBColorSpace;
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(6.65, 48, 32),
    new THREE.MeshStandardMaterial({ map: texture, roughness: .88, metalness: .04 })
  );
  earth.name = 'DISCOVERY_EARTH_GLOBE';
  earthPivot.add(earth);
  sphere(earthPivot, 7.0, new THREE.MeshBasicMaterial({ color: 0x27c8e6, transparent: true, opacity: .075, side: THREE.BackSide }), 0, 0, 0);
  const stand = box(globeRoom, 2.1, 3.8, 2.1, m.navy, -34, 1.8, -13);
  stand.name = 'DISCOVERY_GLOBE_STAND';
  const base = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 7.5, .33, 64), m.gold);
  base.position.set(-34, .34, -13);
  globeRoom.add(base);

  const markerMap = new Map();
  const baseIds = new Set(DISCOVERY_LANDMARKS.map((x) => x.id));
  for (const item of DISCOVERY_ALL_LANDMARKS) {
    // Equirectangular texture: longitude zero points toward +X in Three.js SphereGeometry.
    // Position each marker in the SAME UV orientation as the geographic texture.
    const lat=item.lat*Math.PI/180,lng=item.lng*Math.PI/180;
    const p = new THREE.Vector3(6.89 * Math.cos(lat) * Math.cos(lng), 6.89 * Math.sin(lat), 6.89 * Math.cos(lat) * Math.sin(lng));
    const isBase = baseIds.has(item.id);
    const hasGlb = Boolean(item.glbPath);
    const radius = isBase ? 0.48 : hasGlb ? 0.40 : 0.32;
    const color = isBase ? 0xffcc73 : hasGlb ? 0x2dcab8 : 0xf4d58d;
    const dot = sphere(earthPivot, radius, new THREE.MeshBasicMaterial({ color }), p.x, p.y, p.z);
    dot.name = `DISCOVERY_GLOBE_MARKER_${item.id}`;
    dot.userData.discoveryAction = { type: 'landmark', id: item.id };
    dot.userData.baseColor = color;
    dot.userData.landmarkId = item.id;
    globeHits.push(dot);
    markerMap.set(item.id, dot);
  }
  // Start with Europe / North Africa visible to a visitor from +Z.
  earthPivot.rotation.y = -Math.PI / 2;

  const galleryRoom=new THREE.Group();galleryRoom.name='DISCOVERY_GALLERY_ROOM';roomBase(galleryRoom,34,-13,44,44,0xebd7c1);
  // Expand Room B shell to 88m x 76m x 35m (3 Floors: y = 0m, 11m, 22m) to house ALL 68 artworks + 68 3D models in 1 room
  for (const child of galleryRoom.children) {
    if (child.isMesh && ['DISCOVERY_ROOM_FLOOR','DISCOVERY_ROOM_CEILING','DISCOVERY_SIDE_WALL','DISCOVERY_BACK_WALL','DISCOVERY_FRONT_WALL','DISCOVERY_FLOOR_EDGE','DISCOVERY_WAINSCOT_N','DISCOVERY_WAINSCOT_W','DISCOVERY_WAINSCOT_E'].includes(child.name)) {
      child.visible = false;
    }
  }
  roomBase(galleryRoom, 46, -24, 88, 76, 0xebd7c1, 35.0);
  sign(galleryRoom, 'PHÒNG B • ĐẠI SẢNH 3 TẦNG · 32 ẢNH THỰC TẾ ĐÃ XÁC THỰC & MÔ HÌNH 3D', 'TẦNG 1: 15 ẢNH THẬT R106 & R93  •  TẦNG 2: 9 ẢNH THẬT THIÊN NHIÊN R107  •  TẦNG 3: 8 ẢNH THẬT KỸ THUẬT R107', 46, 8.8, -61.2, 34.0, 3.0);
  sign(galleryRoom, 'TẦNG 2 • 9 ẢNH THỰC TẾ THIÊN NHIÊN R107 ĐÃ XÁC THỰC + BỤC MÔ HÌNH 3D', 'ĐI CẦU THANG HOẶC BẤM NÚT TẦNG 2 ĐỂ THAM QUAN TRỰC TIẾP', 46, 19.8, -61.2, 32.0, 2.8);
  sign(galleryRoom, 'TẦNG 3 • 8 ẢNH THỰC TẾ KỸ THUẬT R107 ĐÃ XÁC THỰC + BỤC MÔ HÌNH 3D', 'ĐI CẦU THANG HOẶC BẤM NÚT TẦNG 3 ĐỂ THAM QUAN TRỰC TIẾP', 46, 30.8, -61.2, 32.0, 2.8);

  // Build Floor 2 (y = 11m) and Floor 3 (y = 22m) full-coverage solid exhibition corridors & central promenade decks
  // Leaving only the exact 4.8m-wide stairwell openings for Staircase 1 (x = 20.2 on Floor 2) and Staircase 2 (x = 71.8 on Floor 3)
  for (const fy of [11.0, 22.0]) {
    box(galleryRoom, 87.2, 0.36, 34.5, m.stone, 46, fy - 0.18, -44.75, `DISCOVERY_ROOMB_DECK_N_${fy}`);
    box(galleryRoom, 87.2, 0.36, 15.0, m.stone, 46, fy - 0.18, 6.0, `DISCOVERY_ROOMB_DECK_S_${fy}`);
    box(galleryRoom, 15.4, 0.36, 26.0, m.stone, 10.1, fy - 0.18, -14.5, `DISCOVERY_ROOMB_DECK_W_${fy}`);
    box(galleryRoom, 15.4, 0.36, 26.0, m.stone, 81.9, fy - 0.18, -14.5, `DISCOVERY_ROOMB_DECK_E_${fy}`);
    // Central promenade deck between stairwells (x from 22.6 to 69.4, z from -27.5 to -1.5)
    box(galleryRoom, 46.8, 0.36, 26.0, m.stone, 46.0, fy - 0.18, -14.5, `DISCOVERY_ROOMB_DECK_CENTER_${fy}`);
    if (fy === 11.0) {
      // On Floor 2, Staircase 2 goes UP from y=11 to y=22, so seal under Staircase 2 (x = 71.8)
      box(galleryRoom, 4.8, 0.36, 26.0, m.stone, 71.8, fy - 0.18, -14.5);
    } else {
      // On Floor 3, Staircase 1 ended at Floor 2, so seal over Staircase 1 (x = 20.2)
      box(galleryRoom, 4.8, 0.36, 26.0, m.stone, 20.2, fy - 0.18, -14.5);
    }
    // Corridor runner carpets
    box(galleryRoom, 72.0, 0.04, 5.4, m.navy, 46, fy + 0.02, -52.5);
    box(galleryRoom, 5.4, 0.04, 62.0, m.navy, 12.2, fy + 0.02, -24.0);
    box(galleryRoom, 5.4, 0.04, 62.0, m.navy, 79.8, fy + 0.02, -24.0);
  }

  const galleryDoorHits = [];
  door(galleryRoom, 34, 13.5, 'VỀ SẢNH CHỌN PHÒNG', { type: 'go', room: 'foyer' }, galleryDoorHits);

  function buildRoomBStaircase(xCenter, yStart, yEnd, zStart, zEnd, labelUp, targetFloorUp, targetFloorDown) {
    const steps = 26, dz = zEnd - zStart, dy = yEnd - yStart, len = Math.hypot(dz, dy), angle = Math.atan2(dy, -dz);
    const stairGroup = new THREE.Group();
    stairGroup.name = `DISCOVERY_ROOMB_STAIRS_${yStart}_${yEnd}`;
    // Continuous inclined structural ramp underneath steps
    const ramp = box(stairGroup, 4.6, 0.30, len + 0.6, m.navy, xCenter, (yStart + yEnd) / 2 - 0.12, (zStart + zEnd) / 2);
    ramp.rotation.x = angle;
    // Left & Right 1.25m-high inclined safety handrails
    for (const side of [-2.28, 2.28]) {
      const railWall = box(stairGroup, 0.16, 1.15, len + 0.4, m.glass, xCenter + side, (yStart + yEnd) / 2 + 0.62, (zStart + zEnd) / 2);
      railWall.rotation.x = angle;
      const railCap = box(stairGroup, 0.24, 0.14, len + 0.5, m.gold, xCenter + side, (yStart + yEnd) / 2 + 1.22, (zStart + zEnd) / 2);
      railCap.rotation.x = angle;
    }
    // Upper-floor U-shaped stairwell safety guardrails
    box(stairGroup, 0.20, 1.18, 26.8, m.glass, xCenter - 2.42, yEnd + 0.59, -14.5);
    box(stairGroup, 0.28, 0.16, 27.0, m.gold, xCenter - 2.42, yEnd + 1.20, -14.5);
    box(stairGroup, 0.20, 1.18, 26.8, m.glass, xCenter + 2.42, yEnd + 0.59, -14.5);
    box(stairGroup, 0.28, 0.16, 27.0, m.gold, xCenter + 2.42, yEnd + 1.20, -14.5);
    box(stairGroup, 5.0, 1.18, 0.20, m.glass, xCenter, yEnd + 0.59, zStart + 0.6);
    box(stairGroup, 5.1, 0.16, 0.28, m.gold, xCenter, yEnd + 1.20, zStart + 0.6);
    // Landing floor pads
    box(stairGroup, 4.9, 0.08, 3.0, m.gold, xCenter, yStart + 0.04, zStart + 1.4);
    box(stairGroup, 4.9, 0.08, 3.0, m.gold, xCenter, yEnd + 0.04, zEnd - 1.4);

    for (let s = 0; s < steps; s++) {
      const t = s / (steps - 1);
      const sy = yStart + t * (yEnd - yStart);
      const sz = zStart + t * (zEnd - zStart);
      const stepMesh = box(stairGroup, 4.4, 0.28, 1.15, s % 2 === 0 ? m.gold : m.navy, xCenter, sy + 0.14, sz);
      stepMesh.userData.discoveryAction = { type: 'gallery-floor', floor: targetFloorUp };
      galleryDoorHits.push(stepMesh);
    }
    const signUp = sign(stairGroup, labelUp, 'ĐI BỘ LÊN CẦU THANG HOẶC BẤM ĐỂ LÊN TẦNG', xCenter, yStart + 3.2, zStart + 1.4, 6.8, 1.35, 0);
    signUp.userData.discoveryAction = { type: 'gallery-floor', floor: targetFloorUp };
    const signDown = sign(stairGroup, `🔽 CẦU THANG XUỐNG TẦNG ${targetFloorDown + 1}`, 'BẤM HOẶC ĐI BỘ XUỐNG TẦNG DƯỚI', xCenter, yEnd + 2.8, zEnd - 1.4, 6.4, 1.25, Math.PI);
    signDown.userData.discoveryAction = { type: 'gallery-floor', floor: targetFloorDown };
    galleryDoorHits.push(signUp, signDown);
    galleryRoom.add(stairGroup);
  }
  buildRoomBStaircase(20.2, 0, 11.0, -2.0, -28.0, '🔼 CẦU THANG LÊN TẦNG 2 (y = 11m)', 1, 0);
  buildRoomBStaircase(71.8, 11.0, 22.0, -2.0, -28.0, '🔼 CẦU THANG LÊN TẦNG 3 (y = 22m)', 2, 1);

  const galleryHits = [...galleryDoorHits];
  const icons = ['🚦', '🐠', '🚲', '🕒', '📐', '📦', '🔷', '📊'];

  // 8 Primary Dynamic Frame Slots on Floor 1 North Wall (preserved for R93/R95/R106 test compatibility)
  const frameCoords = [
    { x: 10.5, y: 0, z: -61.3, rotY: 0, nx: 0, nz: 1, standX: 10.5, standZ: -55.8 },
    { x: 20.6, y: 0, z: -61.3, rotY: 0, nx: 0, nz: 1, standX: 20.6, standZ: -55.8 },
    { x: 30.7, y: 0, z: -61.3, rotY: 0, nx: 0, nz: 1, standX: 30.7, standZ: -55.8 },
    { x: 40.8, y: 0, z: -61.3, rotY: 0, nx: 0, nz: 1, standX: 40.8, standZ: -55.8 },
    { x: 51.2, y: 0, z: -61.3, rotY: 0, nx: 0, nz: 1, standX: 51.2, standZ: -55.8 },
    { x: 61.3, y: 0, z: -61.3, rotY: 0, nx: 0, nz: 1, standX: 61.3, standZ: -55.8 },
    { x: 71.4, y: 0, z: -61.3, rotY: 0, nx: 0, nz: 1, standX: 71.4, standZ: -55.8 },
    { x: 81.5, y: 0, z: -61.3, rotY: 0, nx: 0, nz: 1, standX: 81.5, standZ: -55.8 }
  ];

  function attachPedestal3DModel(parentGroup, item, localZ = 3.2) {
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.55, 0.62, 24), m.navy);
    ped.position.set(0, 0.31, localZ);
    parentGroup.add(ped);
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.42, 1.42, 0.10, 24), m.gold);
    ring.position.set(0, 0.65, localZ);
    parentGroup.add(ring);
    const holder = new THREE.Group();
    holder.position.set(0, 1.55, localZ);
    holder.name = `DISCOVERY_ROOMB_3D_MODEL_${item.id}`;
    try {
      const m3d = createDiscoveryModel(item);
      const b3 = new THREE.Box3().setFromObject(m3d);
      if (!b3.isEmpty()) {
        const sz = b3.getSize(new THREE.Vector3());
        const sc = 2.1 / Math.max(sz.x, sz.y, sz.z, 0.1);
        m3d.scale.multiplyScalar(sc);
        m3d.updateWorldMatrix(true, true);
        const b3b = new THREE.Box3().setFromObject(m3d);
        const ctr = b3b.getCenter(new THREE.Vector3());
        m3d.position.sub(ctr);
      }
      m3d.traverse((o) => {
        if (o.isMesh) {
          o.userData.discoveryAction = { type: 'artwork', id: item.id };
          galleryHits.push(o);
        }
      });
      holder.add(m3d);
    } catch (_) {}
    parentGroup.add(holder);
    return holder;
  }

  const frameSlots = [];
  for (let i = 0; i < MAX_GALLERY_PHYSICAL_FRAMES; i++) {
    const fc = frameCoords[i];
    const slotGroup = new THREE.Group();
    slotGroup.position.set(fc.x, fc.y || 0, fc.z);
    slotGroup.rotation.y = fc.rotY;
    galleryRoom.add(slotGroup);

    const border = box(slotGroup, 8.8, 6.8, .52, m.gold, 0, 4.85, 0, 'DISCOVERY_GALLERY_FRAME');
    const item = DISCOVERY_ARTWORKS[i] || DISCOVERY_ALL_ARTWORKS[i];
    const fallback=i<DISCOVERY_ARTWORKS.length?frameFallback(item.name,icons[i]):frameFallback(item.name,icons[i%icons.length],item);
    const panelMat = new THREE.MeshBasicMaterial({ map: fallback, side: THREE.DoubleSide });
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(8.2, 5.8),
      panelMat
    );
    panel.position.set(0, 4.85, .30);
    panel.name = 'DISCOVERY_REAL_WORLD_ARTWORK_' + item.id;
    panel.userData.discoveryAction = { type: 'artwork', id: item.id };
    slotGroup.add(panel);
    galleryHits.push(panel);
    const panelBack = new THREE.Mesh(panel.geometry, panelMat);
    panelBack.position.set(0, 4.85, -.30);
    panelBack.rotation.y = Math.PI;
    panelBack.userData.discoveryAction = { type: 'artwork', id: item.id };
    slotGroup.add(panelBack);
    galleryHits.push(panelBack);

    const rail = box(slotGroup, 8.0, .38, .46, m.navy, 0, 1.0, .55);
    const labelSign = sign(slotGroup, item.name, `${item.math || ''} • BẤM HOẶC NHẤN E`, 0, 0.98, 0.85, 7.8, 1.25, 0);
    const modelHolder = attachPedestal3DModel(slotGroup, item, 3.1);
    frameSlots.push({
      index: i,
      coord: fc,
      group: slotGroup,
      border,
      panel,
      rail,
      labelSign,
      modelHolder,
      photoRequestId: 0,
      item
    });
  }

  const isVerifiedRealPhotoItem = (a) =>
    Boolean(a && (a.photoApproved || a.id?.startsWith('r106_') || a.id?.startsWith('r107_') || ['traffic', 'fish', 'wheel', 'clock'].includes(a.id)));

  const permanentExhibitionFrames = [];
  function generateMultiFloorCoords() {
    const list = [];
    // Floor 1 (y = 0m): 7 permanent frames on West (4) & East (3) walls (plus 8 North wall frameSlots = 15 Floor 1 verified real photos)
    for (let i = 0; i < 4; i++) {
      const z = -46.0 + i * 13.5;
      list.push({ x: 2.8, y: 0, z, rotY: Math.PI / 2, standX: 7.5, standZ: z, floor: 0 });
    }
    for (let i = 0; i < 3; i++) {
      const z = -44.0 + i * 16.0;
      list.push({ x: 89.2, y: 0, z, rotY: -Math.PI / 2, standX: 84.5, standZ: z, floor: 0 });
    }
    // Floor 2 (y = 11m): 9 verified real photos ("Ảnh R107 · Thiên nhiên": 3 North + 3 West + 3 East)
    for (let i = 0; i < 3; i++) {
      const x = 22.0 + i * 24.0;
      list.push({ x, y: 11.0, z: -61.3, rotY: 0, standX: x, standZ: -55.8, floor: 1 });
    }
    for (let i = 0; i < 3; i++) {
      const z = -44.0 + i * 16.0;
      list.push({ x: 2.8, y: 11.0, z, rotY: Math.PI / 2, standX: 7.5, standZ: z, floor: 1 });
    }
    for (let i = 0; i < 3; i++) {
      const z = -44.0 + i * 16.0;
      list.push({ x: 89.2, y: 11.0, z, rotY: -Math.PI / 2, standX: 84.5, standZ: z, floor: 1 });
    }
    // Floor 3 (y = 22m): 8 verified real photos ("Ảnh R107 · Kỹ thuật": 4 North + 2 West + 2 East)
    for (let i = 0; i < 4; i++) {
      const x = 19.0 + i * 18.0;
      list.push({ x, y: 22.0, z: -61.3, rotY: 0, standX: x, standZ: -55.8, floor: 2 });
    }
    for (let i = 0; i < 2; i++) {
      const z = -38.0 + i * 22.0;
      list.push({ x: 2.8, y: 22.0, z, rotY: Math.PI / 2, standX: 7.5, standZ: z, floor: 2 });
    }
    for (let i = 0; i < 2; i++) {
      const z = -38.0 + i * 22.0;
      list.push({ x: 89.2, y: 22.0, z, rotY: -Math.PI / 2, standX: 84.5, standZ: z, floor: 2 });
    }
    return list;
  }
  const extraCoords = generateMultiFloorCoords();
  // ONLY mount artworks with verified real photographs (exclude all 36 unverified R95 vector items)
  const r106All = DISCOVERY_ALL_ARTWORKS.filter((a) => a.id?.startsWith('r106_'));
  const r93All = DISCOVERY_ARTWORKS.filter((a) => isVerifiedRealPhotoItem(a));
  const r107All = DISCOVERY_ALL_ARTWORKS.filter((a) => a.id?.startsWith('r107_'));
  const extraArtworks = [...r106All.slice(8), ...r93All, ...r107All];
  extraArtworks.forEach((art, idx) => {
    const fc = extraCoords[idx];
    if (!fc) return;
    const g = new THREE.Group();
    g.position.set(fc.x, fc.y, fc.z);
    g.rotation.y = fc.rotY;
    galleryRoom.add(g);
    box(g, 7.6, 5.8, 0.45, m.gold, 0, 4.5, 0, 'DISCOVERY_GALLERY_EXTRA_FRAME');
    const tex = frameFallback(art.name, icons[idx % icons.length], art);
    const permMat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(7.1, 5.1),
      permMat
    );
    panel.position.set(0, 4.5, 0.26);
    panel.name = 'DISCOVERY_REAL_WORLD_ARTWORK_PERM_' + art.id;
    panel.userData.discoveryAction = { type: 'artwork', id: art.id };
    g.add(panel);
    galleryHits.push(panel);
    const panelBack = new THREE.Mesh(panel.geometry, permMat);
    panelBack.position.set(0, 4.5, -0.26);
    panelBack.rotation.y = Math.PI;
    panelBack.userData.discoveryAction = { type: 'artwork', id: art.id };
    g.add(panelBack);
    galleryHits.push(panelBack);
    const lbl = sign(g, art.name, `${art.math || ''} • BẤM XEM 2D/3D`, 0, 1.0, 0.72, 6.8, 1.12, 0);
    lbl.userData.discoveryAction = { type: 'artwork', id: art.id };
    galleryHits.push(lbl);
    attachPedestal3DModel(g, art, 2.75);
    permanentExhibitionFrames.push({ item: art, coord: fc, group: g, panel });
  });

  let activeGalleryItems = [...DISCOVERY_ARTWORKS], photoSeq = 0, currentGalleryFloor = 0;

  // Floating Floor Teleport bar for 3-Floor Room B
  let roomBSwitcher = null;
  if (typeof document !== 'undefined') {
    roomBSwitcher = document.getElementById('r107-roomb-floor-switch');
    if (!roomBSwitcher) {
      roomBSwitcher = document.createElement('div');
      roomBSwitcher.id = 'r107-roomb-floor-switch';
      roomBSwitcher.className = 'r107-gallery-switch';
      roomBSwitcher.hidden = true;
      document.body.appendChild(roomBSwitcher);
    }
  }

  function updateRoomBFloorUI() {
    if (!roomBSwitcher) return;
    roomBSwitcher.replaceChildren();
    const status = document.createElement('span');
    status.className = 'r107-gallery-status';
    status.textContent = `PHÒNG B 3 TẦNG (32 ẢNH THẬT ĐÃ XÁC THỰC + 32 BỤC 3D) · ĐANG Ở TẦNG ${currentGalleryFloor + 1} (y=${currentGalleryFloor * 11}m)`;
    roomBSwitcher.appendChild(status);
    [
      [0, 'Tầng 1 (15 ảnh thật R106 & R93)'],
      [1, '🔼 Tầng 2 (9 ảnh Thiên nhiên R107)'],
      [2, '🔼 Tầng 3 (8 ảnh Kỹ thuật R107)']
    ].forEach(([fl, label]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'r107-gallery-next';
      if (fl === currentGalleryFloor) btn.style.outline = '2px solid #5eead4';
      btn.textContent = label;
      btn.onclick = () => {
        window.__teleportDiscoveryFloor?.('gallery', fl);
      };
      roomBSwitcher.appendChild(btn);
    });
  }

  function setGalleryFloor(fl = 0) {
    currentGalleryFloor = THREE.MathUtils.clamp(Number(fl) || 0, 0, 2);
    updateRoomBFloorUI();
    return {
      x: currentGalleryFloor === 0 ? 46 : 46,
      y: currentGalleryFloor * 11.0,
      z: currentGalleryFloor === 0 ? 2 : -52.0
    };
  }

  function setGalleryCollectionItems(items) {
    const verifiedInput = Array.isArray(items) ? items.filter(isVerifiedRealPhotoItem) : [];
    const fallbackVerified = r106All.length ? r106All : DISCOVERY_ARTWORKS;
    const slice = getGallerySliceForFrames(verifiedInput.length ? verifiedInput : fallbackVerified);
    activeGalleryItems = slice;
    for (let i = 0; i < MAX_GALLERY_PHYSICAL_FRAMES; i++) {
      const slot = frameSlots[i];
      const item = slice[i];
      const requestId = ++photoSeq;
      slot.photoRequestId = requestId;
      if (!item) {
        slot.group.visible = false;
        slot.panel.userData.discoveryAction = null;
        slot.item = null;
        continue;
      }
      slot.group.visible = true;
      slot.item = item;
      slot.panel.name = 'DISCOVERY_REAL_WORLD_ARTWORK_' + item.id;
      slot.panel.userData.discoveryAction = { type: 'artwork', id: item.id };
      slot.panel.userData.photoCredit = null;
      if (slot.labelSign) {
        slot.group.remove(slot.labelSign);
        slot.labelSign.geometry?.dispose();
        slot.labelSign.material?.map?.dispose();
        slot.labelSign.material?.dispose();
        slot.labelSign = sign(slot.group, item.name, `${item.math || ''} • BẤM HOẶC NHẤN E`, 0, 0.98, 0.85, 7.8, 1.25, 0);
      }

      const icon = icons[i % icons.length];
      const newTex = frameFallback(item.name, icon, item);
      const oldTex = slot.panel.material.map;
      slot.panel.material.map = newTex;
      slot.panel.material.needsUpdate = true;
      if (oldTex && oldTex !== newTex) {
        oldTex.userData.stale=true;
        oldTex.dispose();
      }
      if(item.collection?.startsWith('Ảnh ')){
        void resolveDiscoveryPhoto(item).then(media=>{
          if(!media?.verified||!media.url||slot.photoRequestId!==requestId)return;
          const loader=new THREE.TextureLoader();loader.setCrossOrigin('anonymous');
          loader.load(media.url,texture=>{
            if(slot.photoRequestId!==requestId){texture.dispose();return;}
            texture.colorSpace=THREE.SRGBColorSpace;
            const prior=slot.panel.material.map;
            slot.panel.material.map=texture;slot.panel.material.needsUpdate=true;
            slot.panel.userData.photoCredit={source:media.source,author:media.author,license:media.license};
            if(prior&&prior!==texture)prior.dispose();
          },undefined,()=>{});
        }).catch(()=>{});
      }
    }
    return slice;
  }

  // Initialize Room B with the 4 base R93 artworks so initial scene matches R93 tests,
  // and allow UI to switch to any verified real-photo collection (up to 8 frames at once).
  setGalleryCollectionItems(DISCOVERY_ARTWORKS);

  // Exhibit stage remains geometry-only: visitors open a panel for rotation and detail.
  box(galleryRoom, 3.2, 0.35, 3.2, m.navy, 46, .18, -5.5, 'DISCOVERY_3D_PEDESTAL');
  sphere(galleryRoom, .28, m.gold, 46, .52, -5.5);

  interior.add(foyer, globeRoom, galleryRoom);
  const rooms={foyer,globe:globeRoom,gallery:galleryRoom};
  const southWalls = [
    { room: 'foyer', zMax: 42.5, meshes: foyer.children.filter((o) => o.position.z >= 41.0) },
    { room: 'globe', zMax: 9.0, meshes: globeRoom.children.filter((o) => o.position.z >= 8.2) },
    { room: 'gallery', zMax: 13.5, meshes: galleryRoom.children.filter((o) => o.position.z >= 12.8 && o.position.y < 10.5) }
  ];
  const camDir = new THREE.Vector3(), savedCamPos = new THREE.Vector3(), savedCamQuat = new THREE.Quaternion();
  let sceneHooked = false, camAdjusted = false, roomSnap = null;
  const origUpdateMatrixWorld = interior.updateMatrixWorld.bind(interior);
  interior.updateMatrixWorld = function (force) {
    origUpdateMatrixWorld(force);
    const scn = interior.parent;
    if (scn && !sceneHooked) {
      sceneHooked = true;
      const prevBefore = scn.onBeforeRender, prevAfter = scn.onAfterRender;
      scn.onBeforeRender = function (renderer, scene, camera, renderTarget) {
        if (typeof prevBefore === 'function') prevBefore.call(this, renderer, scene, camera, renderTarget);
        camAdjusted = false;
        if (!interior.visible || !camera) return;
        if (roomSnap && camera.rotation?.order === 'YXZ') {
          const sy = roomSnap.y || 0;
          camera.position.set(roomSnap.x, sy + 4.63, roomSnap.z + 7.9);
          camera.lookAt(roomSnap.x, sy + 2.8, roomSnap.z - 6);
          camera.updateMatrixWorld(true);
          roomSnap = null;
        }
        camera.getWorldDirection(camDir);
        for (const sw of southWalls) {
          if (sw.room !== currentRoom) continue;
          const hide = camDir.z < -0.15 || camera.position.z > sw.zMax - 1.0;
          for (const mesh of sw.meshes) mesh.visible = !hide;
        }
      };
      scn.onAfterRender = function (renderer, scene, camera) {
        if (camAdjusted && camera) {
          camera.position.copy(savedCamPos);
          camera.quaternion.copy(savedCamQuat);
          camera.updateMatrixWorld(true);
          camAdjusted = false;
        }
        for (const sw of southWalls) for (const mesh of sw.meshes) mesh.visible = true;
        if (typeof prevAfter === 'function') prevAfter.call(this, renderer, scene, camera);
      };
    }
  };

  let currentRoom = 'foyer', earthDragging = false, spin = 0;
  function setRoom(id) {
    if (!rooms[id]) throw Error('Unknown Discovery room ' + id);
    currentRoom = id;
    for (const [key, group] of Object.entries(rooms)) group.visible = key === id;
    if (roomBSwitcher) roomBSwitcher.hidden = id !== 'gallery';
    if (id === 'gallery') {
      currentGalleryFloor = 0;
      updateRoomBFloorUI();
      flushDeferredPhotos();
    }
    roomSnap = id === 'foyer' ? { x: 0, y: 0, z: 33 } : id === 'globe' ? { x: -34, y: 0, z: 3 } : { x: 34, y: 0, z: 2 };
    return id==='foyer'?{x:0,y:0,z:33}:id==='globe'?{x:-34,y:0,z:3}:{x:34,y:0,z:2};
  }

  function getNear(pos) {
    const py = Number(pos?.y) || 0;
    const closest = (candidates, limit = 6) => candidates.find((c) => Math.hypot(pos.x - c.x, pos.z - c.z) < (c.radius || limit))?.action || null;
    if (currentRoom === 'foyer') {
      return closest([
        { x: 0, z: 6.4, action: { type: 'discovery-npc', npcId: 'chief' }, radius: 5.2 },
        { x: -10.5, z: 5.5, action: { type: 'discovery-npc', npcId: 'unesco_guide' }, radius: 4.8 },
        { x: 10.5, z: 5.5, action: { type: 'discovery-npc', npcId: 'gallery_guide' }, radius: 4.8 },
        { x: -16.5, z: 4.5, action: { type: 'go', room: 'globe' }, radius: 7.5 },
        { x: 16.5, z: 4.5, action: { type: 'go', room: 'gallery' }, radius: 7.5 },
        { x: 0, z: 39.5, action: { type: 'exit' }, radius: 6.0 }
      ]);
    }
    if (currentRoom === 'globe') {
      return closest([
        { x: -34, z: 6, action: { type: 'go', room: 'foyer' }, radius: 5.3 },
        { x: -34, z: -8, action: { type: 'globe-list' }, radius: 14 }
      ]);
    }
    const frameActions = frameSlots
      .filter((s) => s.group.visible && s.item && Math.abs(py - (s.coord.y || 0)) < 5.5)
      .map((s) => ({
        x: s.coord.standX,
        z: s.coord.standZ,
        action: { type: 'artwork', id: s.item.id },
        radius: 6.2
      }));
    const permActions = permanentExhibitionFrames
      .filter((s) => Math.abs(py - (s.coord.y || 0)) < 5.5)
      .map((s) => ({
        x: s.coord.standX,
        z: s.coord.standZ,
        action: { type: 'artwork', id: s.item.id },
        radius: 5.8
      }));
    const stairActions = [
      { x: 20.2, z: -2.0, action: { type: 'gallery-floor', floor: 1 }, radius: 4.5 },
      { x: 20.2, z: -28.0, action: { type: 'gallery-floor', floor: 0 }, radius: 4.5 },
      { x: 71.8, z: -2.0, action: { type: 'gallery-floor', floor: 2 }, radius: 4.5 },
      { x: 71.8, z: -28.0, action: { type: 'gallery-floor', floor: 1 }, radius: 4.5 }
    ];
    return closest([{ x: 34, z: 10.5, action: { type: 'go', room: 'foyer' }, radius: 6.0 }, ...frameActions, ...permActions, ...stairActions], 6);
  }

  function restrict(prev,next) {
    const b =
      currentRoom === 'foyer'
        ? { xmin: -28.2, xmax: 28.2, zmin: 3.2, zmax: 40.5 }
        : currentRoom === 'globe'
          ? { xmin: -53.7, xmax: -14.3, zmin: -32.5, zmax: 7.0 }
          : { xmin: 4.2, xmax: 87.8, zmin: -59.5, zmax: 11.8 };
    const p = {
      x: THREE.MathUtils.clamp(next.x, b.xmin, b.xmax),
      y: Number.isFinite(next.y) ? next.y : (Number(prev?.y) || 0),
      z: THREE.MathUtils.clamp(next.z, b.zmin, b.zmax)
    };
    if (currentRoom === 'globe' && Math.hypot(p.x + 34, p.z + 13) < 7.9) {
      return prev;
    }
    if (currentRoom === 'gallery') {
      const prevY = Number(prev?.y) ?? (currentGalleryFloor * 11.0);
      const prevX = Number(prev?.x) || 0, prevZ = Number(prev?.z) || 0;
      // State-based anti-fall Staircase 1 (xCenter = 20.2, z: -2.0 <-> -28.0, Floor 1 y=0 <-> Floor 2 y=11)
      const wasOnStair1 = prevX >= 17.7 && prevX <= 22.7 && prevZ >= -28.2 && prevZ <= -1.8 && prevY > 0.04 && prevY < 10.96;
      const enterStair1Bottom = prevY <= 0.5 && p.x >= 18.1 && p.x <= 22.3 && p.z <= -1.8 && p.z >= -5.2 && prevZ >= -3.6;
      const enterStair1Top = Math.abs(prevY - 11.0) <= 0.6 && p.x >= 18.1 && p.x <= 22.3 && p.z >= -28.2 && p.z <= -24.5 && prevZ <= -26.2;
      // State-based anti-fall Staircase 2 (xCenter = 71.8, z: -2.0 <-> -28.0, Floor 2 y=11 <-> Floor 3 y=22)
      const wasOnStair2 = prevX >= 69.3 && prevX <= 74.3 && prevZ >= -28.2 && prevZ <= -1.8 && prevY > 11.04 && prevY < 21.96;
      const enterStair2Bottom = Math.abs(prevY - 11.0) <= 0.6 && p.x >= 69.7 && p.x <= 73.9 && p.z <= -1.8 && p.z >= -5.2 && prevZ >= -3.6;
      const enterStair2Top = Math.abs(prevY - 22.0) <= 0.6 && p.x >= 69.7 && p.x <= 73.9 && p.z >= -28.2 && p.z <= -24.5 && prevZ <= -26.2;

      if (wasOnStair1 || enterStair1Bottom || enterStair1Top) {
        if (p.z <= -28.0) {
          p.y = 11.0; if (currentGalleryFloor !== 1) { currentGalleryFloor = 1; updateRoomBFloorUI(); }
        } else if (p.z >= -2.0) {
          p.y = 0.0; if (currentGalleryFloor !== 0) { currentGalleryFloor = 0; updateRoomBFloorUI(); }
        } else {
          p.x = THREE.MathUtils.clamp(p.x, 18.3, 22.1);
          const t = THREE.MathUtils.clamp((-2.0 - p.z) / 26.0, 0, 1);
          p.y = t * 11.0;
          const fl = p.y > 5.5 ? 1 : 0;
          if (fl !== currentGalleryFloor) { currentGalleryFloor = fl; updateRoomBFloorUI(); }
        }
        return p;
      }
      if (wasOnStair2 || enterStair2Bottom || enterStair2Top) {
        if (p.z <= -28.0) {
          p.y = 22.0; if (currentGalleryFloor !== 2) { currentGalleryFloor = 2; updateRoomBFloorUI(); }
        } else if (p.z >= -2.0) {
          p.y = 11.0; if (currentGalleryFloor !== 1) { currentGalleryFloor = 1; updateRoomBFloorUI(); }
        } else {
          p.x = THREE.MathUtils.clamp(p.x, 69.9, 73.7);
          const t = THREE.MathUtils.clamp((-2.0 - p.z) / 26.0, 0, 1);
          p.y = 11.0 + t * 11.0;
          const fl = p.y > 16.5 ? 2 : 1;
          if (fl !== currentGalleryFloor) { currentGalleryFloor = fl; updateRoomBFloorUI(); }
        }
        return p;
      }

      p.y = currentGalleryFloor * 11.0;
      // Prevent walking through stairwell side/back guardrails on upper floors
      if (currentGalleryFloor === 1 && p.x > 17.6 && p.x < 22.8 && p.z > -27.4 && p.z < -1.2) {
        if (prevX <= 17.6) p.x = 17.6;
        else if (prevX >= 22.8) p.x = 22.8;
        else if (prevZ >= -1.2) p.z = -1.2;
        else p.z = -27.4;
      }
      if (currentGalleryFloor === 2 && p.x > 69.2 && p.x < 74.4 && p.z > -27.4 && p.z < -1.2) {
        if (prevX <= 69.2) p.x = 69.2;
        else if (prevX >= 74.4) p.x = 74.4;
        else if (prevZ >= -1.2) p.z = -1.2;
        else p.z = -27.4;
      }
    } else if (currentRoom === 'foyer') {
      p.y = 0;
    }
    return p;
  }

  function onClick(pointer, camera) {
    const targets =
      currentRoom === 'foyer'
        ? foyerHits
        : currentRoom === 'globe'
          ? globeHits.filter((m) => m.visible)
          : galleryHits.filter((m) => m.parent?.visible !== false);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects(targets, true)[0];
    let node = hit?.object;
    while (node && !node.userData?.discoveryAction) node = node.parent;
    return node?.userData?.discoveryAction || null;
  }

  function isEarthHit(pointer, camera) {
    if (currentRoom !== 'globe') return false;
    const ray = new THREE.Raycaster();
    ray.setFromCamera(pointer, camera);
    return ray.intersectObject(earth, false).length > 0;
  }

  function rotateEarth(dx, dy) {
    earthPivot.rotation.y += dx * .009;
    earthPivot.rotation.x = THREE.MathUtils.clamp(earthPivot.rotation.x + dy * .005, -.60, .60);
  }

  function resetGlobeView() {
    earthPivot.rotation.set(0, -Math.PI / 2, 0);
    roomSnap = { x: -34, y: 0, z: 3 };
  }

  function focusLandmark(item) {
    if (!item || !Number.isFinite(item.lat) || !Number.isFinite(item.lng)) return;
    const lngRad = (item.lng * Math.PI) / 180;
    const latRad = (item.lat * Math.PI) / 180;
    // Rotate earthPivot so landmark faces +Z toward visitor
    earthPivot.rotation.y = -Math.PI / 2 - lngRad;
    earthPivot.rotation.x = THREE.MathUtils.clamp(latRad * 0.45, -0.55, 0.55);
  }

  function setGlobeFilter(visibleIds) {
    const idSet = visibleIds instanceof Set ? visibleIds : new Set(visibleIds || []);
    for (const [id, dot] of markerMap.entries()) {
      const match = idSet.size === 0 || idSet.has(id);
      dot.visible = match;
      dot.scale.setScalar(match ? 1.0 : 0.35);
    }
  }

  function tick(dt) {
    spin += dt;
    if (exterior.visible) {
      outerOrbit.rotation.z += dt * 0.18;
      outerOrbit2.rotation.y -= dt * 0.22;
      apexStar.rotation.y += dt * 0.45;
    }
    if (currentRoom === 'foyer' && interior.visible) {
      npcGroups.forEach((npc, idx) => {
        if (npc.body) npc.body.position.y = Math.sin(spin * 2.2 + idx * 1.4) * 0.06;
      });
    }
    if (currentRoom === 'globe' && interior.visible && !earthDragging) {
      earthPivot.rotation.y += dt * .065;
    }
  }

  setRoom('foyer');

  const api = {
    exterior,
    interior,
    entryClickables: [entry],
    roomClickables: [...foyerHits, ...globeHits, ...galleryHits],
    get currentRoom() {
      return currentRoom;
    },
    get activeGalleryItems() {
      return activeGalleryItems;
    },
    get frameSlotsCount() {
      return frameSlots.length;
    },
    get permanentGalleryCount() {
      return frameSlots.length + permanentExhibitionFrames.length;
    },
    setRoom,
    setGalleryFloor,
    clearRoomSnap: () => { roomSnap = null; },
    getNear,
    restrict,
    onClick,
    isEarthHit,
    rotateEarth,
    resetGlobeView,
    focusLandmark,
    setGlobeFilter,
    setGalleryCollectionItems,
    tick,
    get nearExterior() {
      return { x: DISCOVERY_SITE.entry.x, z: DISCOVERY_SITE.entry.z };
    },
    nearExteriorPlayer(pos) {
      return Math.hypot(pos.x - DISCOVERY_SITE.entry.x, pos.z - DISCOVERY_SITE.entry.z) < 10;
    }
  };
  if (typeof window !== 'undefined') {
    window.__discoveryWorld = api;
  }
  return api;
}
