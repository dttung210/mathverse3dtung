import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {PEOPLE, PEOPLE_BY_ID} from '../src/exhibition/people.mjs';
import {PROFILES} from '../src/exhibition/profiles.mjs';
import {diagramFor} from '../src/exhibition/diagrams.mjs';
import {proposedGalleryLayout, validateGalleryLayout, DEFAULT_CONFIG, WALL_GROUPS} from '../src/exhibition/layout.mjs';
import {mountMathematicianFrames} from '../src/exhibition/frames3d.mjs';

test('18 tranh và 18 ID duy nhất', () => {
  const places = proposedGalleryLayout();
  assert.equal(places.length, 18);
  assert.equal(new Set(places.map(p => p.id)).size, 18);
  assert.equal(PEOPLE.length, 18);
  assert.equal(new Set(PEOPLE.map(p => p.id)).size, 18);
  assert.equal(Object.keys(PROFILES).length, 18);
});

test('6 tranh trên mỗi tường', () => {
  const p = proposedGalleryLayout();
  for (const wall of ['back', 'left', 'right']) {
    assert.equal(p.filter(x => x.wall === wall).length, 6);
  }
});

test('3 tường đúng hướng mặt tranh', () => {
  const p = proposedGalleryLayout();
  for (const item of p) {
    assert.equal(item.yaw, item.wall === 'back' ? 0 : item.wall === 'left' ? Math.PI / 2 : -Math.PI / 2);
  }
});

test('khoảng cách giữa các khung', () => {
  const p = proposedGalleryLayout();
  for (const wall of ['back', 'left', 'right']) {
    const centers = p.filter(x => x.wall === wall).map(x => wall === 'back' ? x.x : x.z).sort((a, b) => a - b);
    for (let i = 1; i < centers.length; i++) {
      assert.ok(centers[i] - centers[i - 1] >= DEFAULT_CONFIG.frameWidth + 0.75);
    }
  }
});

test('cách cửa vào đủ khoảng trống', () => {
  const p = proposedGalleryLayout();
  const side = p.filter(x => x.wall !== 'back');
  assert.ok(side.every(x => x.z + DEFAULT_CONFIG.frameWidth / 2 < -12));
});

test('khung nằm trong phòng gốc, không xuyên tường', () => {
  const p = proposedGalleryLayout();
  assert.ok(p.every(s => s.x > 36.9 && s.x < 71.1 && s.z > -48 && s.z < -8));
});

test('đủ hai danh nhân Việt Nam', () => {
  const ids = proposedGalleryLayout().map(x => x.id);
  assert.ok(ids.includes('luong-the-vinh'));
  assert.ok(ids.includes('ngo-bao-chau'));
  assert.ok(PEOPLE_BY_ID.has('luong-the-vinh'));
  assert.ok(PEOPLE_BY_ID.has('ngo-bao-chau'));
});

test('năm danh nhân mới đều có slot và dữ liệu hợp lệ', () => {
  const ids = proposedGalleryLayout().map(x => x.id);
  const newIds = ['al-khwarizmi', 'sophie-germain', 'ada-lovelace', 'emmy-noether', 'maryam-mirzakhani'];
  for (const id of newIds) {
    assert.ok(ids.includes(id));
    const person = PEOPLE_BY_ID.get(id);
    assert.ok(person, `Thiếu person ${id}`);
    assert.ok(PROFILES[id], `Thiếu profile ${id}`);
    assert.ok(PROFILES[id].bio.length > 80);
    assert.equal(PROFILES[id].works.length, 2);
    assert.ok(person.formula, `Thiếu formula ${id}`);
    assert.match(diagramFor(person), /<svg/, `Sơ đồ diagram hợp lệ cho ${id}`);
  }
});

test('validateGalleryLayout trả kết quả hợp lệ', () => {
  assert.deepEqual(validateGalleryLayout(proposedGalleryLayout()), { ok: true, messages: [] });
});

test('phòng nhỏ phải báo cần điều chỉnh', () => {
  assert.throws(() => proposedGalleryLayout({ roomWidth: 20 }), /Kích thước phòng/);
});

test('đếm tổng chính xác, không ép sửa người đã có', () => {
  const all = Object.values(WALL_GROUPS).flat();
  assert.equal(new Set(all).size, 18);
});

test('không thể gán trùng id một cách im lặng', () => {
  assert.throws(() => proposedGalleryLayout({}, { ...WALL_GROUPS, right: [...WALL_GROUPS.right.slice(0, 5), 'pythagoras'] }), /Trùng ID/);
});

test('3D frames mounting renders all 18 targets with non-zero geometries and raycast handles', () => {
  const calls = [];
  const ctx = new Proxy({}, {
    get(_obj, key) {
      if (key === 'createLinearGradient') return () => ({ addColorStop() {} });
      if (key === 'measureText') return t => ({ width: String(t).length * 8 });
      return () => { calls.push(key); };
    }
  });
  globalThis.document = { createElement(tag) { assert.equal(tag, 'canvas'); return { width: 600, height: 500, getContext: () => ctx }; } };
  globalThis.window = { addEventListener() {}, removeEventListener() {}, dispatchEvent() {} };
  globalThis.fetch = async () => ({ ok: false });

  const ex = new THREE.Group();
  const view = mountMathematicianFrames(THREE, ex, { centerX: 54, backZ: -48, width: 34, depth: 40 });
  const frames = view.targets.filter(o => o.userData.mathHistoryId);
  assert.equal(frames.length, 18);
  assert.equal(view.pedestalCount, 2);

  // Check 6 on back wall (yaw=0), 6 on left wall (yaw=pi/2), 6 on right wall (yaw=-pi/2)
  const backFrames = frames.filter(f => f.rotation.y === 0);
  const leftFrames = frames.filter(f => Math.abs(f.rotation.y - Math.PI / 2) < 1e-4);
  const rightFrames = frames.filter(f => Math.abs(f.rotation.y - (-Math.PI / 2)) < 1e-4);
  assert.equal(backFrames.length, 6);
  assert.equal(leftFrames.length, 6);
  assert.equal(rightFrames.length, 6);

  view.destroy();
});

