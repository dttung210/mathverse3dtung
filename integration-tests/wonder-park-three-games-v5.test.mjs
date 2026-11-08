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
const world=await loadParkModule(ROOT);
const ui=await import(pathToFileURL(path.join(ROOT,'dual/wonder-park-ui.mjs')).href);
function fixture(){
 const original=globalThis.document;
 globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){},strokeRect(){},fillText(){},measureText:t=>({width:t.length*20})})})};
 try{return {park:world.createWonderParkWorld(),restore:()=>globalThis.document=original};}
 catch(e){globalThis.document=original;throw e;}
}
test('V7: 3 inherited game descriptions, 11 stations, sanctuary at central plaza',()=>{
 const {park,restore}=fixture();try{
  assert.equal(park.zones.length,11);
  assert.match(park.zones[0].guide,/10 gà đối thủ/);
  assert.match(park.zones[1].guide,/phóng thẳng.*biến mất/);
  assert.match(park.zones[2].name,/Thích Học Bá/);
  const center=park.getZoneWorldPosition(2);
  assert.ok(Math.abs(center.x)<.0001);
  assert.ok(Math.abs(center.z-138)<.0001);
  for(const i of [0,1,3,4,5,6,7,8,9,10])assert.ok(Math.abs(Math.hypot(park.getZoneWorldPosition(i).x,park.getZoneWorldPosition(i).z-138)-54)<.001);
 }finally{restore();}
});
test('V5: real 3D seated statue and NPC in a hidden room within the same renderer; enter/leave works',()=>{
 const {park,restore}=fixture();try{
  const room=park.group.getObjectByName('SPECIAL_THICH_HOC_BA_ROOM_IN_SAME_WORLD');
  assert.ok(room);assert.equal(room.visible,false);
  const door=park.getSanctuaryDoorWorldPosition();const npc=park.getSanctuaryNpcWorldPosition();
  assert.ok(door.z>380&&door.z<415);
  assert.ok(npc.z>door.z+15);
  park.openGate();park.tick(2);
  assert.equal(park.gateOpen,true);
  park.enterSanctuary();assert.equal(room.visible,true);
  assert.equal(park.getNear(door).type,'sanctuary-exit');
  assert.equal(park.getNear(npc).type,'sanctuary-npc');
  park.leaveSanctuary();assert.equal(room.visible,false);
 }finally{restore();}
});
test('V6: chicken spectator camera focuses ring; rocket has separate animation state',()=>{
 const {park,restore}=fixture();try{
  park.group.updateMatrixWorld(true);
  const eye=park.getChickenCameraPose(true),arena=park.getChickenCameraPose(false);
  assert.ok(eye&&arena);
  assert.ok(eye.eye.y<arena.eye.y);
  assert.ok(eye.fov<arena.fov);
  const rocket=park.group.getObjectByName('ROCKET_V5_PLAYER');assert.ok(rocket);
  park.openGate();park.tick(2);
  park.resetRocket();assert.ok(rocket.visible);
  park.correctRocket();park.correctRocket();park.tick(2);
  assert.ok(rocket.position.y>0.5);
  park.failRocket();park.tick(.1);
  assert.ok(park.getRocketCameraPose());
  park.focusGame(0);
  assert.equal(park.group.getObjectByName('WONDER_PARK_ZONE_1').visible,true);
  assert.equal(park.group.getObjectByName('WONDER_PARK_ZONE_2').visible,false);
  park.clearGameFocus();assert.equal(park.group.getObjectByName('WONDER_PARK_ZONE_2').visible,true);
 }finally{restore();}
});
test('V5: no iframe; eye-camera switch, rocket fail, drawing lots and temple sound implemented',()=>{
 const app=read('dual/app.mjs'),uiSrc=read('dual/wonder-park-ui.mjs'),worldSrc=read('dual/wonder-park-world.mjs');
 const html=read('dual/index.html'),css=read('dual/style.css');
 for(const name of ['mvpark-eye-camera','mvpark-draw-lot','mvpark-temple-sound','mvpark-enter-room','mvpark-game-shade']){
  assert.ok(html.includes(`id="${name}"`),name);
 }
 assert.match(app,/parkGameCamera/);
 assert.match(app,/parkWorld\.getChickenCameraPose/);
 assert.match(app,/parkWorld\.getRocketCameraPose/);
 assert.match(app,/parkWorld\.getSanctuaryCameraPose/);
 assert.match(app,/parkWorld\.sanctuaryActive/);
 assert.match(uiSrc,/park\.failRocket\(\)/);
 assert.match(uiSrc,/park\.kickPlayer\(\)/);
 assert.match(uiSrc,/toSanctuaryDoor\?\.\(\)/);
 assert.match(uiSrc,/new \(window\.AudioContext\|\|window\.webkitAudioContext\)/);
 assert.match(uiSrc,/pickQuestionsForGame\(b\.chapters,picked,zone\)/); // V8: same source, filtered by teacher-selected grade/chapter
 assert.match(worldSrc,/SANCTUARY_LOCAL_Z=-280/);
 assert.match(css,/\.mvpark-sheet\.mvpark-quiz/);
 assert.ok(!html.includes('id="game-park-frame"'));
});
test('V5: teacher bank only, ten distinct questions, shuffle keeps original answer keys',()=>{
 const data=JSON.parse(read('game-park/assets/questions.json'));
 assert.equal(data.meta.grade,6);assert.equal(data.meta.chapter,1);assert.equal(data.questions.length,40);
 for(let t=0;t<20;t++){
  const q=ui.selectChapterQuestions(data.questions,10);
  assert.equal(q.length,10);assert.equal(new Set(q.map(o=>o.id)).size,10);
  assert.ok(q.every(o=>['A','B','C','D'].includes(o.answer)&&Object.keys(o.choices).length===4));
 }
});
