import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizedMove, resolvePlinthSlide,dampVelocity,catalogRoomSelection,roomCatalogSignature} from '../src/museum/movement-core.js';
test('Walking continuously uses key-up instead of 900ms expiration',()=>{
  const src=fs.readFileSync(new URL('../src/museum.js',import.meta.url),'utf8');
  assert.doesNotMatch(src,/now - last > 900|keyTimestamps/);
  assert.match(src,/clearAllMovement\(\)/);
});
test('Diagonal WASD walking is speed-normalized',()=>{
  const straight=normalizedMove(1,0,0,7.2);
  const diag=normalizedMove(1,1,0,7.2);
  assert.ok(Math.abs(Math.hypot(straight.x,straight.z)-7.2)<1e-8);
  assert.ok(Math.abs(Math.hypot(diag.x,diag.z)-7.2)<1e-8);
});
test('Sliding collisions do not stop movement along free axis',()=>{
  const colliders=[[0,0]];
  const result=resolvePlinthSlide(-1.7,-1.9,-1.3,-1.1,colliders,1.7);
  assert.ok(Math.hypot(result.x,result.z)>=1.7);
  const free=resolvePlinthSlide(-5,-5,-4,-4,colliders,1.7);
  assert.deepEqual(free,{x:-4,z:-4});
});
test('Damped velocity approaches target without overshoot',()=>{
  let v=0;for(let t=0;t<120;t++)v=dampVelocity(v,8,14,1/60);
  assert.ok(v>7.99&&v<=8);
});
test('Nine slot selection is grade-local and stable',()=>{
 const data=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url),'utf8'));
 const a=catalogRoomSelection(data.items,6,0);assert.equal(a.length,9);assert.ok(a.every(x=>x.grade===6));
 const before=roomCatalogSignature(data.items,6),newData=structuredClone(data.items);
 newData.find(x=>x.grade===7).params={changed:1};assert.equal(roomCatalogSignature(newData,6),before);
});
