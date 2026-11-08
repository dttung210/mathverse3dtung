import {loadParkModule} from './_v7-three-test-loader.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const threeUrl=pathToFileURL(path.join(ROOT,'vendor/three.module.js')).href;
const THREE=await import(threeUrl);
const worldModule=await loadParkModule(ROOT);
const uiModule=await import(pathToFileURL(path.join(ROOT,'dual/wonder-park-ui.mjs')).href);
function makeFixture(){
 const original=globalThis.document;
 globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({
  fillRect(){},strokeRect(){},fillText(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},measureText(t){return {width:t.length*20};}
 })})};
 try{
  const park=worldModule.createWonderParkWorld();
  return {park,restore:()=>{globalThis.document=original;}};
 }catch(e){globalThis.document=original;throw e;}
}
test('Park 3D shares the original Grand Campus canvas, not an iframe or a new renderer',()=>{
 const app=read('dual/app.mjs'),html=read('dual/index.html');
 assert.match(app,/lobbyGroup\.add\(parkWorld\.group\)/);
 assert.match(app,/parkWorld\.tick\(dt\)/);
 assert.ok(!html.includes('id="game-park-frame"'));
 assert.ok(!html.includes('id="game-park-shell"'));
 assert.equal((html.match(/id="dual-canvas"/g)||[]).length,1);
 assert.ok(!read('dual/wonder-park-world.mjs').includes('new THREE.WebGLRenderer'));
 for(const id of ['park-aerial','campus-park-aerial','mvpark-panel','mvpark-quiz','park-quick-enter'])assert.ok(html.includes(`id="${id}"`),id);
});
test('Eleven distinct physical 3D game platforms and a chicken arena exist in one scene',()=>{
 const {park,restore}=makeFixture();
 try{
   assert.equal(park.zones.length,11);
   assert.equal(park.group.position.z,128);
   assert.equal(park.group.position.x,0);
   assert.equal(park.group.rotation.y,Math.PI);
   assert.ok(park.getZoneWorldPosition(0).z>80);
   assert.ok(park.group.getObjectByName('ACTUAL_PARK_ENTRANCE_IN_SAME_SCENE'));
   park.group.updateMatrixWorld(true);
   const actualGate=park.group.getObjectByName('ACTUAL_PARK_ENTRANCE_IN_SAME_SCENE');
   const worldGate=actualGate.getWorldPosition(new THREE.Vector3());
   assert.ok(Math.abs(worldGate.x)<0.001,'gate is aligned with common hall X axis');
   assert.ok(Math.abs(worldGate.z-85)<0.001,'gate faces toward common hall at world Z=85');
   const physicalZone=park.group.getObjectByName('WONDER_PARK_ZONE_1');
   const physicalPos=physicalZone.getWorldPosition(new THREE.Vector3());
   const mapped=park.getZoneWorldPosition(0);
   assert.ok(Math.hypot(physicalPos.x-mapped.x,physicalPos.z-mapped.z)<.001,'SVG and world zone coordinates match');
   let zones=0,chickens=0,meshCount=0;
   park.group.traverse(o=>{if(o.name.startsWith('WONDER_PARK_ZONE_') && o.type==='Group' && o.parent===park.group)zones++;if(o.isMesh)meshCount++;if(o.type==='Group'&&o.parent?.name.includes('WONDER'))chickens++;});
   assert.equal(zones,11);
   assert.ok(meshCount>500,`3D mesh count ${meshCount}`);
   assert.ok(park.clickable.length>25);
 }finally{restore();}
});
test('Park is static outside; opening the gate activates movement in the same scene',()=>{
 const {park,restore}=makeFixture();
 try{
   assert.equal(park.gateOpen,false);
   assert.equal(park.getNear({x:0,z:76}).type,'gate');
   assert.equal(park.getNear(park.getZoneWorldPosition(2)),null);
   assert.equal(park.openGate(),true);
   park.tick(.8);assert.equal(park.opening,true);
   park.tick(.8);assert.equal(park.gateOpen,true);
   assert.equal(park.getNear(park.getZoneWorldPosition(2)).index,2);
   assert.equal(park.closeGate(),true);
   assert.equal(park.gateOpen,false);
 }finally{restore();}
});
test('Only the supplied Chapter 1 questions form ten distinct items, no generated math',()=>{
 const data=JSON.parse(read('game-park/assets/questions.json'));
 assert.equal(data.meta.grade,6);assert.equal(data.meta.chapter,1);assert.equal(data.questions.length,40);
 for(let j=0;j<20;j++){
   const sample=uiModule.selectChapterQuestions(data.questions);
   assert.equal(sample.length,10);assert.equal(new Set(sample.map(q=>q.id)).size,10);
   assert.equal(sample.filter(q=>q.difficulty==='Dễ').length,4);
   assert.equal(sample.filter(q=>q.difficulty==='Trung bình').length,4);
   assert.equal(sample.filter(q=>q.difficulty==='Khó').length,2);
 }
});
test('Original labs and museum remain available in the shared lobby',()=>{
 const app=read('dual/app.mjs');
 for(const text of ['enterR75','enterMuseum','grand.clampPosition','lobbyGroup.add(parkWorld.group)','r75-frame'])assert.ok(app.includes(text),text);
 assert.match(app,/focusParkAerial\('park'\)/);
 assert.match(app,/WONDER_PARK_LOCATION\.centerZ/);
});
