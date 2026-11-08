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
  building: Object.freeze({ x: -108, z: 8 }),
  entry: Object.freeze({ x: -78, z: 8 }),
  path: Object.freeze([[0, 9], [-26, 9], [-51, 9], [-78, 8]]),
  bounds: Object.freeze({ xMin: -133, xMax: -83, zMin: -17, zMax: 33 })
});

const mat = (color, props = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0.14, ...props });
const m = {
  stone: mat(0xd9e7e5),
  wall: mat(0xf0efe6),
  navy: mat(0x091b2d, { roughness: 0.5, metalness: 0.22 }),
  deepTeal: mat(0x113748, { roughness: 0.45, metalness: 0.2 }),
  dark: mat(0x10374d),
  teal: mat(0x2dcab8, { metalness: 0.4, roughness: 0.3 }),
  gold: mat(0xd9b471, { metalness: 0.68, roughness: 0.28 }),
  floor: mat(0xbecdd0),
  glass: mat(0x4bc2dd, { transparent: true, opacity: 0.42, roughness: 0.22, metalness: 0.26 }),
  glow: new THREE.MeshBasicMaterial({ color: 0x82f7e3 })
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
  const cvs = document.createElement('canvas');
  cvs.width = 960;
  cvs.height = 240;
  const ctx = cvs.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 960, 240);
  grad.addColorStop(0, '#091b2d');
  grad.addColorStop(1, '#113748');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 960, 240);
  ctx.strokeStyle = '#d9b471';
  ctx.lineWidth = 9;
  ctx.strokeRect(8, 8, 944, 224);
  ctx.strokeStyle = '#2dcab8';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, 924, 204);
  ctx.fillStyle = '#edf5f8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 54px Arial';
  ctx.fillText(title, 480, 92, 890);
  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = '#2dcab8';
  ctx.fillText(subtitle, 480, 166, 890);
  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  const card = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
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

function frameFallback(title, tag, item = null) {
  const cv = document.createElement('canvas');
  cv.width = 640;
  cv.height = 440;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#091b2d';
  ctx.fillRect(0, 0, 640, 440);
  const gradient = ctx.createLinearGradient(0, 0, 640, 440);
  gradient.addColorStop(0, '#113748');
  gradient.addColorStop(1, '#091b2d');
  ctx.fillStyle = gradient;
  ctx.fillRect(12, 12, 616, 416);
  ctx.strokeStyle = '#d9b471';
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, 608, 408);

  if (item && item.collection) {
    ctx.fillStyle = '#2dcab8';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(item.collection.toUpperCase(), 32, 46, 440);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#d9b471';
    ctx.fillText(item.grade || 'Toán 6–12', 608, 46);
  }

  ctx.font = 'bold 92px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#d9b471';
  ctx.fillText(tag || '📐', 320, 155);

  ctx.font = 'bold 34px Arial';
  ctx.fillStyle = '#edf5f8';
  ctx.fillText(title, 320, 275, 570);

  if (item && item.math) {
    ctx.font = '22px Arial';
    ctx.fillStyle = '#9db4c0';
    ctx.fillText(item.math, 320, 322, 570);
  }
  if (item && item.latex) {
    ctx.font = 'bold 22px Courier New, monospace';
    ctx.fillStyle = '#2dcab8';
    ctx.fillText(item.latex, 320, 362, 560);
  }
  ctx.font = '18px Arial';
  ctx.fillStyle = '#d9b471';
  ctx.fillText(
    item && item.publishReady === false
      ? 'Minh họa vector Toán học R95 • Nhấn E / Click để mở'
      : 'Nhấn E hoặc Click vào khung tranh để khám phá 2D/3D',
    320,
    404
  );

  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;

  if (canLoadPhotos() && item?.svgPath && R95_SVG_MAP[item.svgPath] && typeof Image !== 'undefined') {
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#091b2d';
      ctx.fillRect(20, 60, 600, 235);
      ctx.drawImage(img, 110, 62, 420, 230);
      ctx.fillStyle = 'rgba(9, 27, 45, 0.92)';
      ctx.fillRect(20, 295, 600, 125);
      ctx.textAlign = 'center';
      ctx.font = 'bold 28px Arial';
      ctx.fillStyle = '#edf5f8';
      ctx.fillText(title, 320, 322, 560);
      ctx.font = '20px Arial';
      ctx.fillStyle = '#2dcab8';
      ctx.fillText(`${item.math || ''}  |  ${item.latex || ''}`, 320, 358, 560);
      ctx.font = '17px Arial';
      ctx.fillStyle = '#d9b471';
      ctx.fillText('Minh họa vector Toán học R95 • Bấm để xem chi tiết', 320, 395, 560);
      t.needsUpdate = true;
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(R95_SVG_MAP[item.svgPath]);
  }
  // Prefer a real, licensed Wikimedia documentary photograph when available.
  // This is loaded lazily. The vector graphic remains clearly marked otherwise.
  if (item && canLoadPhotos()) {
    resolveDiscoveryPhoto(item).then(meta => {
      if (!meta?.url || t.userData?.stale) return;
      const image=new Image();image.crossOrigin='anonymous';
      image.onload=()=>{
        if(t.userData?.stale)return;
        try {
          ctx.fillStyle='#0a2033';ctx.fillRect(0,0,640,440);
          const scale=Math.max(640/image.width,310/image.height);
          const w=image.width*scale,h=image.height*scale;
          ctx.drawImage(image,(640-w)/2,(310-h)/2,w,h);
          ctx.fillStyle='rgba(9,27,45,.94)';ctx.fillRect(0,310,640,130);
          ctx.textAlign='center';ctx.fillStyle='#edf5f8';ctx.font='bold 28px Arial';
          ctx.fillText(title,320,354,600);
          ctx.fillStyle='#d9b471';ctx.font='17px Arial';
          ctx.fillText('Ảnh tư liệu Wikimedia Commons · Bấm để so sánh 2D/3D',320,397,600);
          t.needsUpdate=true;
        }catch(error){console.info('Discovery photo texture issue:',error.message);}
      };
      image.src=meta.url;
    });
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

  // Connector walkway (no new campus or duplicated world).
  for (let i = 1; i < DISCOVERY_SITE.path.length; i++) {
    const a = DISCOVERY_SITE.path[i - 1], b = DISCOVERY_SITE.path[i];
    const dx = b[0] - a[0], dz = b[1] - a[1], dist = Math.hypot(dx, dz);
    const walk = box(exterior, dist, .18, 5.4, m.floor, (a[0] + b[0]) / 2, .15, (a[1] + b[1]) / 2, 'DISCOVERY_CAMPUS_WALKWAY');
    walk.rotation.y = -Math.atan2(dz, dx);
  }

  // A wholly separate pair-wing building. Existing Lab/Museum/Park objects are untouched.
  box(exterior, 51, .65, 48, m.stone, x, .32, z);
  box(exterior, 51, 10, 48, m.wall, x, 5.15, z);
  box(exterior, 54, 1.0, 51, m.navy, x, 11, z);
  box(exterior, 54.4, 0.28, 51.4, m.gold, x, 11.6, z);
  for (const dx of [-17, 17]) {
    box(exterior, 18, 5, 33, m.teal, x + dx, 13.2, z);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(15, 8, 4), m.navy);
    roof.position.set(x + dx, 19, z - 2);
    roof.rotation.y = Math.PI / 4;
    exterior.add(roof);
    for (let i = -2; i <= 2; i++) box(exterior, 2.3, 6, .18, m.glass, x + dx + i * 3.2, 6.3, z + 24.1);
  }
  // Entry faces east (+X), toward the common hall.
  box(exterior, .7, 10, 14, m.navy, -82.5, 5.2, z);
  for (const dz of [-5.8, 5.8]) {
    box(exterior, 0.9, 9.8, 0.9, m.gold, -81.9, 5.0, z + dz);
  }
  const entry = box(exterior, 1.15, 7.4, 7.7, m.glass, -81.4, 3.8, z, 'DISCOVERY_EXTERIOR_DOOR');
  entry.userData.discoveryAction = { type: 'enter' };
  sign(exterior, 'MATHVERSE DISCOVERY R95', 'A • ĐỊA CẦU TOÁN HỌC (36)  |  B • TRIỂN LÃM HÌNH HỌC (40)', -80.6, 10, z, 17.5, 4.1, Math.PI / 2);
  for (let i = 0; i < 6; i++) {
    const xx = -80 + i * 11.6;
    box(exterior, 10.4, .16, 8.7, m.floor, xx, .11, z);
    for (const zz of [z - 5, z + 5]) sphere(exterior, .32, m.gold, xx, 1.05, zz);
  }

  const interior=new THREE.Group();interior.name='DISCOVERY_INDEPENDENT_INTERIOR';interior.visible=false;
  const foyer=new THREE.Group();foyer.name='DISCOVERY_FOYER';roomBase(foyer,0,19,24,27,0xc3d3d6);
  sign(foyer, 'SẢNH MATHVERSE DISCOVERY', 'A • ĐỊA CẦU TOÁN HỌC (36)   |   B • TRIỂN LÃM HÌNH HỌC THỰC TẾ (40)', 0, 7.2, 6.2, 18.5, 3.5);
  box(foyer, 7, .9, 5, m.navy, 0, .45, 19, 'DISCOVERY_WELCOME_PODIUM');
  box(foyer, 7.3, 0.14, 5.3, m.gold, 0, 0.92, 19);
  sphere(foyer, 1.5, m.teal, 0, 2.15, 19);
  const foyerHits = [];
  door(foyer, -7, 8, 'PHÒNG A - ĐỊA CẦU', { type: 'go', room: 'globe' }, foyerHits);
  door(foyer, 7, 8, 'PHÒNG B - TRANH', { type: 'go', room: 'gallery' }, foyerHits);
  // Return to original campus through entrance at north of foyer.
  door(foyer, 0, 32, 'VỀ SẢNH CHUNG', { type: 'exit' }, foyerHits);

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
  sign(galleryRoom, 'PHÒNG B • TRIỂN LÃM HÌNH HỌC THỰC TẾ', '6 BỘ SƯU TẬP R95 (36 TRANH) + BỘ R93 • TỐI ĐA 8 KHUNG VẬT LÝ', 34, 8, -34.3, 25, 3.2);
  const galleryDoorHits = [];
  door(galleryRoom, 34, 9, 'VỀ SẢNH CHỌN PHÒNG', { type: 'go', room: 'foyer' }, galleryDoorHits);
  const galleryHits = [...galleryDoorHits];

  const icons = ['🚦', '🐠', '🚲', '🕒', '📐', '📦', '🔷', '📊'];
  // 8 Physical 3D Frame Slots (4 North wall, 2 West wall, 2 East wall)
  const frameCoords = [
    { x: 18.5, z: -33.48, rotY: 0, nx: 0, nz: 1, standX: 18.5, standZ: -29 },
    { x: 28.8, z: -33.48, rotY: 0, nx: 0, nz: 1, standX: 28.8, standZ: -29 },
    { x: 39.2, z: -33.48, rotY: 0, nx: 0, nz: 1, standX: 39.2, standZ: -29 },
    { x: 49.5, z: -33.48, rotY: 0, nx: 0, nz: 1, standX: 49.5, standZ: -29 },
    { x: 12.6, z: -21.0, rotY: Math.PI / 2, nx: 1, nz: 0, standX: 17.0, standZ: -21.0 },
    { x: 12.6, z: -8.5, rotY: Math.PI / 2, nx: 1, nz: 0, standX: 17.0, standZ: -8.5 },
    { x: 55.4, z: -21.0, rotY: -Math.PI / 2, nx: -1, nz: 0, standX: 51.0, standZ: -21.0 },
    { x: 55.4, z: -8.5, rotY: -Math.PI / 2, nx: -1, nz: 0, standX: 51.0, standZ: -8.5 }
  ];

  const frameSlots = [];
  for (let i = 0; i < MAX_GALLERY_PHYSICAL_FRAMES; i++) {
    const fc = frameCoords[i];
    const slotGroup = new THREE.Group();
    slotGroup.position.set(fc.x, 0, fc.z);
    slotGroup.rotation.y = fc.rotY;
    galleryRoom.add(slotGroup);

    const border = box(slotGroup, 8.4, 6.8, .54, m.gold, 0, 4.55, 0, 'DISCOVERY_GALLERY_FRAME');
    const item = DISCOVERY_ARTWORKS[i] || DISCOVERY_ALL_ARTWORKS[i];
    const fallback=i<DISCOVERY_ARTWORKS.length?frameFallback(item.name,icons[i]):frameFallback(item.name,icons[i%icons.length],item);
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(7.85, 5.65),
      new THREE.MeshBasicMaterial({ map: fallback, side: THREE.DoubleSide })
    );
    panel.position.set(0, 4.55, .29);
    panel.name = 'DISCOVERY_REAL_WORLD_ARTWORK_' + item.id;
    panel.userData.discoveryAction = { type: 'artwork', id: item.id };
    slotGroup.add(panel);
    galleryHits.push(panel);

    const rail = box(slotGroup, 7.7, .4, .48, m.navy, 0, .95, .55);
    frameSlots.push({
      index: i,
      coord: fc,
      group: slotGroup,
      border,
      panel,
      rail,
      item
    });
  }

  let activeGalleryItems = [...DISCOVERY_ARTWORKS];

  function setGalleryCollectionItems(items) {
    const slice = getGallerySliceForFrames(items && items.length ? items : DISCOVERY_ARTWORKS);
    activeGalleryItems = slice;
    for (let i = 0; i < MAX_GALLERY_PHYSICAL_FRAMES; i++) {
      const slot = frameSlots[i];
      const item = slice[i];
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

      const icon = icons[i % icons.length];
      const newTex = frameFallback(item.name, icon, item);
      const oldTex = slot.panel.material.map;
      slot.panel.material.map = newTex;
      slot.panel.material.needsUpdate = true;
      if (oldTex && oldTex !== newTex) {
        oldTex.userData.stale=true;
        oldTex.dispose();
      }
    }
    return slice;
  }

  // Initialize Room B with the 4 base R93 artworks so initial scene matches R93 tests,
  // and allow UI to switch to any of the 6 R95 collections (up to 8 frames at once).
  setGalleryCollectionItems(DISCOVERY_ARTWORKS);

  // Exhibit stage remains geometry-only: visitors open a panel for rotation and detail.
  box(galleryRoom, 9, 1.1, 7.5, m.navy, 34, .55, -12, 'DISCOVERY_3D_PEDESTAL');
  sphere(galleryRoom, .48, m.gold, 34, 1.35, -12);

  interior.add(foyer, globeRoom, galleryRoom);
  const rooms={foyer,globe:globeRoom,gallery:galleryRoom};
  const southWalls = [
    { room: 'foyer', zMax: 32.5, meshes: foyer.children.filter((o) => o.position.z >= 31.2) },
    { room: 'globe', zMax: 9.0, meshes: globeRoom.children.filter((o) => o.position.z >= 8.2) },
    { room: 'gallery', zMax: 9.0, meshes: galleryRoom.children.filter((o) => o.position.z >= 8.2) }
  ];
  const camDir = new THREE.Vector3(), savedCamPos = new THREE.Vector3();
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
          camera.position.set(roomSnap.x, 4.63, roomSnap.z + 7.9);
          camera.lookAt(roomSnap.x, 1.8, roomSnap.z - 3);
          camera.updateMatrixWorld(true);
          roomSnap = null;
        }
        if (camera.rotation?.order === 'YXZ' && camera.position.y < 12) {
          camera.getWorldDirection(camDir);
          if (camDir.z < -0.2) {
            savedCamPos.copy(camera.position);
            camAdjusted = true;
            if (currentRoom === 'globe') {
              camera.position.y += 2.2;
              camera.position.z += 2.8;
              camera.rotation.x += 0.34;
            } else if (currentRoom === 'foyer') {
              camera.rotation.x += 0.18;
            } else if (currentRoom === 'gallery') {
              camera.rotation.x += 0.20;
            }
            camera.updateMatrixWorld(true);
          }
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
    roomSnap = id === 'foyer' ? { x: 0, z: 27 } : id === 'globe' ? { x: -34, z: 3 } : { x: 34, z: 2 };
    return id==='foyer'?{x:0,z:27}:id==='globe'?{x:-34,z:3}:{x:34,z:2};
  }

  function getNear(pos) {
    const closest = (candidates, limit = 6) => candidates.find((c) => Math.hypot(pos.x - c.x, pos.z - c.z) < (c.radius || limit))?.action || null;
    if (currentRoom === 'foyer') {
      return closest([
        { x: -7, z: 11, action: { type: 'go', room: 'globe' }, radius: 8 },
        { x: 7, z: 11, action: { type: 'go', room: 'gallery' }, radius: 8 },
        { x: 0, z: 29, action: { type: 'exit' }, radius: 5 }
      ]);
    }
    if (currentRoom === 'globe') {
      return closest([
        { x: -34, z: 6, action: { type: 'go', room: 'foyer' }, radius: 5.3 },
        { x: -34, z: -8, action: { type: 'globe-list' }, radius: 14 }
      ]);
    }
    const frameActions = frameSlots
      .filter((s) => s.group.visible && s.item)
      .map((s) => ({
        x: s.coord.standX,
        z: s.coord.standZ,
        action: { type: 'artwork', id: s.item.id },
        radius: 6.5
      }));
    return closest([{ x: 34, z: 6, action: { type: 'go', room: 'foyer' }, radius: 5.5 }, ...frameActions], 6);
  }

  function restrict(prev,next) {
    const b =
      currentRoom === 'foyer'
        ? { xmin: -10.8, xmax: 10.8, zmin: 7, zmax: 30 }
        : currentRoom === 'globe'
          ? { xmin: -53.7, xmax: -14.3, zmin: -32.5, zmax: 7.0 }
          : { xmin: 14.3, xmax: 53.7, zmin: -32.2, zmax: 7.0 };
    const p = { x: THREE.MathUtils.clamp(next.x, b.xmin, b.xmax), z: THREE.MathUtils.clamp(next.z, b.zmin, b.zmax) };
    if (currentRoom === 'globe' && Math.hypot(p.x + 34, p.z + 13) < 7.9) {
      return prev;
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
    const hit = ray.intersectObjects(targets, false)[0];
    return hit?.object?.userData.discoveryAction || null;
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
    roomSnap = { x: -34, z: 3 };
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
    if (currentRoom === 'globe' && interior.visible && !earthDragging) {
      spin += dt;
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
    setRoom,
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
