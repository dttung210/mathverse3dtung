import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DISCOVERY_LANDMARKS,
  DISCOVERY_ARTWORKS,
  DISCOVERY_LANDMARKS_R95,
  DISCOVERY_ARTWORKS_R95,
  DISCOVERY_ALL_LANDMARKS,
  DISCOVERY_ALL_ARTWORKS,
  DISCOVERY_COLLECTIONS,
  MAX_GALLERY_PHYSICAL_FRAMES,
  discoveryById,
  filterLandmarks,
  groupGalleryByCollection,
  getGallerySliceForFrames,
  isReadyToShowPhotograph,
  isReadyToPublish,
  validateDiscoveryR95Data
} from '../dual/discovery-data.mjs';
import { R95_SVG_MAP, R95_GLB_BASE64_MAP } from '../dual/discovery-r95/r95-assets-bundle.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('R95 retains its original 40 artworks while R106 adds 11 real licensed photos', () => {
  const counts = validateDiscoveryR95Data();
  assert.deepEqual(counts, {
    baseLandmarks: 4,
    r95Landmarks: 32,
    allLandmarks: 36,
    baseArtworks: 4,
    r95Artworks: 36,
    allArtworks: 68
  });
  for (const item of [...DISCOVERY_ALL_LANDMARKS, ...DISCOVERY_ALL_ARTWORKS]) {
    assert.equal(discoveryById(item.id)?.id, item.id);
  }
});

test('R95 Photo & Verification Policy: 32 new landmarks and 36 new exhibits never fake real photos', () => {
  for (const lm of DISCOVERY_LANDMARKS_R95) {
    assert.equal(lm.publishReady, false);
    assert.equal(isReadyToShowPhotograph(lm), false);
    assert.equal(isReadyToPublish(lm), false);
    assert.ok(R95_SVG_MAP[lm.svgPath], `Missing bundled SVG for ${lm.id}`);
    if (lm.glbPath) {
      assert.ok(R95_GLB_BASE64_MAP[lm.glbPath], `Missing bundled GLB for ${lm.id}`);
    }
  }
  for (const ex of DISCOVERY_ARTWORKS_R95) {
    assert.equal(ex.publishReady, false);
    assert.equal(isReadyToShowPhotograph(ex), false);
    assert.ok(R95_SVG_MAP[ex.svgPath], `Missing bundled SVG for ${ex.id}`);
    if (ex.glbPath) {
      assert.ok(R95_GLB_BASE64_MAP[ex.glbPath], `Missing bundled GLB for ${ex.id}`);
      assert.equal(ex.model3d, true);
    } else {
      assert.equal(ex.model3d, false);
    }
  }
  for (const base of [...DISCOVERY_LANDMARKS, ...DISCOVERY_ARTWORKS]) {
    assert.equal(base.publishReady, true);
    assert.equal(isReadyToShowPhotograph(base), true);
  }
});

test('R95 Accent-insensitive Vietnamese search, continent filter, and grade filter work across all 36 landmarks', () => {
  const colosseum = filterLandmarks(DISCOVERY_ALL_LANDMARKS, { text: 'dau truong colosseum' });
  assert.equal(colosseum.length, 1);
  assert.equal(colosseum[0].id, 'colosseum');

  const atomium = filterLandmarks(DISCOVERY_ALL_LANDMARKS, { text: 'atomium' });
  assert.equal(atomium.length, 1);
  assert.equal(atomium[0].id, 'atomium');

  const europe = filterLandmarks(DISCOVERY_ALL_LANDMARKS, { continent: 'Châu Âu' });
  assert.equal(europe.length, 9);
  assert.ok(europe.some((x) => x.id === 'eiffel'));
  assert.ok(europe.some((x) => x.id === 'colosseum'));

  const grade12 = filterLandmarks(DISCOVERY_ALL_LANDMARKS, { classes: '12' });
  assert.ok(grade12.length >= 15);
});

test('R95 Room B groups 6 new collections (6 items each) + R93 collection and bounds physical frames to 8', () => {
  const groups = groupGalleryByCollection(DISCOVERY_ALL_ARTWORKS);
  assert.equal(DISCOVERY_COLLECTIONS.length, 10);
  for (const col of DISCOVERY_COLLECTIONS.slice(0, 6)) {
    const list = groups.get(col) || [];
    assert.equal(list.length, 6, `Collection ${col} should have 6 items`);
    assert.ok(getGallerySliceForFrames(list).length <= MAX_GALLERY_PHYSICAL_FRAMES);
  }
  assert.equal(groups.get('Bộ sưu tập trước đây')?.length, 4);
  assert.equal(groups.get('Ảnh thật và hình học R106')?.length, 11);
});

test('R95 World & UI wire Museum Quick Access, 8 physical frames, texture disposal, and GLB parser', () => {
  const worldSrc = fs.readFileSync(path.join(ROOT, 'dual/discovery-world.mjs'), 'utf8');
  const uiSrc = fs.readFileSync(path.join(ROOT, 'dual/discovery-ui.mjs'), 'utf8');
  const shapesSrc = fs.readFileSync(path.join(ROOT, 'dual/discovery-shapes.mjs'), 'utf8');

  assert.match(worldSrc, /setGalleryCollectionItems/);
  assert.match(worldSrc, /setGlobeFilter/);
  assert.match(worldSrc, /resetGlobeView/);
  assert.match(worldSrc, /oldTex\.dispose\(\)/);
  assert.match(uiSrc, /museum-quick-discovery/);
  assert.match(uiSrc, /ĐỊA CẦU & TRIỂN LÃM HÌNH HỌC/);
  assert.match(shapesSrc, /parseGlbFromBase64/);
});
