import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const raw=fs.readFileSync(path.join(ROOT,'dual/grand-dome.mjs'),'utf8');
const threeURI=pathToFileURL(path.join(ROOT,'vendor/three.module.js')).href;
const modURI='data:text/javascript;base64,'+Buffer.from(raw.replaceAll("'/vendor/three.module.js'",JSON.stringify(threeURI))).toString('base64');
const {createGrandDome,GRAND_DOME_LAYOUT,clampToGrandDome}=await import(modURI);
const THREE=await import(threeURI);
function fixture(){
  const original=globalThis.document;
  globalThis.document={createElement:kind=>{assert.equal(kind,'canvas');return {width:0,height:0,getContext:()=>({fillRect(){},strokeRect(){},fillText(){},beginPath(){},moveTo(){},bezierCurveTo(){},stroke(){}})};}};
  try{
    const grand=createGrandDome({createAvatar:()=>({root:new THREE.Group(),updateAnimation(){}})});
    return {grand,restore(){globalThis.document=original;}};
  }catch(e){globalThis.document=original;throw e;}
}
test('The Grand Dome is ONE exterior campus roof covering TWO separate physical buildings',()=>{
 const {grand,restore}=fixture();try{
  const world=grand.group;
  const canopy=world.getObjectByName('SHARED_MEGA_DOME_COVERS_TWO_BUILDINGS');
  const lab=world.getObjectByName('MATHVERSE_R75_LAB_EXTERIOR');
  const museum=world.getObjectByName('CRYSTAL_INFINITY_MUSEUM_EXTERIOR');
  assert.ok(canopy && canopy.getObjectByName('SHARED_TRANSPARENT_GLASS_ROOF'));
  assert.ok(lab && lab.getObjectByName('LAB_ENTRANCE_ARCH'));
  assert.ok(museum && museum.getObjectByName('RIGHT_SIDE_CRYSTAL_MUSEUM_DOME'));
  assert.ok(world.getObjectByName('GRAND_DOME_KINETIC_GEOMETRY'));
  assert.ok(museum.position.x>lab.position.x+60,'museum must stand to the right');
  assert.ok(GRAND_DOME_LAYOUT.playerSpawn.z-lab.position.z>85,'lab must be up ahead');
  assert.ok(GRAND_DOME_LAYOUT.grandDome.radius>100,'not a narrow two-door lobby');
 }finally{restore();}
});
test('Both buildings and Vietnamese guide are clickable and E-interactable from their real entrance positions',()=>{
 const {grand,restore}=fixture();try{
  assert.equal(grand.getTarget({...GRAND_DOME_LAYOUT.lab}), 'r75');
  assert.equal(grand.getTarget({...GRAND_DOME_LAYOUT.museum}), 'gallery');
  assert.equal(grand.getTarget({...GRAND_DOME_LAYOUT.guide}), 'guide');
  assert.equal(grand.getTarget({...GRAND_DOME_LAYOUT.playerSpawn}),null);
  for(const target of ['guide','r75','gallery'])assert.ok(grand.clickable.some(o=>o.userData.grandTarget===target),target);
  assert.ok(grand.group.getObjectByName('NPC_HUONG_DAN_R75_AVATAR'));
  assert.ok(grand.group.getObjectByName('NPC_GREETING_AND_INFORMATION_DESK'));
  grand.update(.01);
 }finally{restore();}
});
test('Visitors cannot walk through solid lab facade or museum exterior',()=>{
 const from={x:-17,z:-46};const into=clampToGrandDome(from,{x:-17,z:-70});
 assert.ok(into.z>-54);
 const fromMuseum={x:54,z:-18};const intoMuseum=clampToGrandDome(fromMuseum,{x:57,z:-56});
 assert.ok(Math.hypot(intoMuseum.x-57,intoMuseum.z+56)>=31.0);
});
test('V6 attaches Grand Dome only to dual world without changing the R75 source',()=>{
 const app=fs.readFileSync(path.join(ROOT,'dual/app.mjs'),'utf8');
 const html=fs.readFileSync(path.join(ROOT,'dual/index.html'),'utf8');
 assert.match(app,/createGrandDome\(\{createAvatar,catalogCounts:museumInventory.gradeCounts\}\)/);
 assert.match(app,/grand\.clampPosition/);
 assert.match(app,/guideSpeech/);
 assert.match(app,/guide\.getTarget|grand\.getTarget/);
 assert.match(html,/id="guide-dialog"/);
 assert.match(html,/id="lobby-shortcuts"/);
 assert.match(html,/id="r75-frame"/);
 assert.doesNotMatch(html,/<input\s+[^>]*type="file"/i);
});
