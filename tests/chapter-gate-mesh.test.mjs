import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {
  toArabicChapterNum,
  createHighVisibilityChapterSign,
  createNeonWireframeCrest,
  createFloorDecalRunway
} from '../src/museum/chapter-gate-mesh.mjs';

// Setup mock document for canvas sprite generation
if (!globalThis.document) {
  globalThis.document = {
    createElement: () => ({
      width: 1024,
      height: 360,
      getContext: () => ({
        beginPath() {},
        arc() {},
        fill() {},
        stroke() {},
        rect() {},
        roundRect() {},
        fillText() {},
        moveTo() {},
        lineTo() {},
        measureText: () => ({ width: 100 })
      })
    })
  };
}

test('toArabicChapterNum correctly converts Roman numerals and numbers', () => {
  assert.equal(toArabicChapterNum('I'), 1);
  assert.equal(toArabicChapterNum('II'), 2);
  assert.equal(toArabicChapterNum('III'), 3);
  assert.equal(toArabicChapterNum('IV'), 4);
  assert.equal(toArabicChapterNum('V'), 5);
  assert.equal(toArabicChapterNum('VI'), 6);
  assert.equal(toArabicChapterNum('VII'), 7);
  assert.equal(toArabicChapterNum('VIII'), 8);
  assert.equal(toArabicChapterNum('IX'), 9);
  assert.equal(toArabicChapterNum('X'), 10);
  assert.equal(toArabicChapterNum(5), 5);
  assert.equal(toArabicChapterNum('4'), 4);
  assert.equal(toArabicChapterNum(null, 2), 3);
});

test('createNeonWireframeCrest builds valid 3D wireframe mesh groups for various chapters', () => {
  for (let ch = 1; ch <= 9; ch++) {
    const crest = createNeonWireframeCrest(THREE, { chapterNum: ch, accent: '#2dd4bf' });
    assert.equal(crest.isGroup, true);
    assert.equal(crest.name, 'NeonHologramCrest');
    assert(crest.children.length >= 2, `Chapter ${ch} should have at least 2 children`);
    assert(crest.children.some(c => c.isMesh && c.material.wireframe === true));
  }
});

test('createFloorDecalRunway builds ground runway with plane and border', () => {
  const runway = createFloorDecalRunway(THREE, { chapterNum: 1, accent: '#2dd4bf' });
  assert.equal(runway.isGroup, true);
  assert.equal(runway.name, 'FloorDecalRunway');
  assert.equal(runway.children.length, 3);
  assert(runway.children.some(c => c.isMesh && c.position.y > 0));
});

test('createHighVisibilityChapterSign builds a three.js sprite', () => {
  const sign = createHighVisibilityChapterSign(THREE, {
    chapterNum: 1,
    chapterTitle: 'Tập hợp các số tự nhiên',
    totalLessons: 5,
    totalModels: 5,
    accent: '#2dd4bf'
  });
  assert.equal(sign.isSprite, true);
  assert.equal(sign.scale.x, 4.3);
});
