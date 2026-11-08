import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {qualityProfile,tuneAutoRatio} from '../src/museum/quality-controller.js';
test('Eco quality caps DPR and disables optional effects',()=>{
 const eco=qualityProfile('eco',3);assert.equal(eco.pixelRatio,.85);assert.equal(eco.particles,false);assert.equal(eco.shadows,false);
 const high=qualityProfile('high',3);assert.equal(high.pixelRatio,1.65);
});
test('Adaptive quality lowers DPR at low FPS and raises gradually',()=>{
 assert.ok(tuneAutoRatio(1.3,25,2)<1.3);
 assert.ok(tuneAutoRatio(1.1,60,2)>1.1);
 assert.equal(tuneAutoRatio(1.1,46,2),1.1);
});
test('Museum lazily creates only opened room exhibits, not the entire 63 models',()=>{
 const source=fs.readFileSync(new URL('../src/museum.js',import.meta.url),'utf8');
 assert.match(source,/function loadRoomExhibits\(targetGrade\)/);
 assert.match(source,/roomSignatureCache\.get\(targetGrade\)===signature/);
 assert.doesNotMatch(source,/for\s*\(const g of GRADES\)\s*\{\s*const layer = modelLayers\[g\]/);
 assert.doesNotMatch(source,/moteGeo\.attributes\.position\.needsUpdate\s*=\s*true/);
});
