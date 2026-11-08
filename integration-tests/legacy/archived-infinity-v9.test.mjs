import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const load=(p)=>fs.readFileSync(path.join(root,p));
const read=(p)=>load(p).toString('utf8');
const sha=(bytes)=>crypto.createHash('sha256').update(bytes).digest('hex');
const data=JSON.parse(read('museum-data/catalog.json'));
const original=JSON.parse(read('audit/V8_PROTECTED_SOURCE_BASELINE_V9.json'));
const THREE=await import(pathToFileURL(path.join(root,'vendor/three.module.js')).href);
let scene;
function createFixture(){
  const previous=globalThis.document;
  globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){},strokeRect(){},fillText(){},beginPath(){},moveTo(){},bezierCurveTo(){},stroke(){}})})};
  return {restore:()=>{globalThis.document=previous;}};
}
async function createWorld(){
  const fixed=read('dual/grand-dome.mjs').replaceAll("'/vendor/three.module.js'",JSON.stringify(pathToFileURL(path.join(root,'vendor/three.module.js')).href));
  const url='data:text/javascript;base64,'+Buffer.from(fixed).toString('base64');
  const mod=await import(url);
  const f=createFixture();
  try {
    const world=mod.createGrandDome({createAvatar:()=>({root:new THREE.Group(),updateAnimation(){}}),catalogCounts:data.counts});
    world.group.updateMatrixWorld(true);
    return {mod,world,restore:f.restore};
  } catch(e){f.restore();throw e;}
}
test('V9 protects every single original V8 file except five visual/UI-label sources',()=>{
  let count=0;
  for(const [p,h] of Object.entries(original.protectedFiles)){
    assert.equal(sha(load(p)),h,`Protected V8 functionality or learning data changed: ${p}`);count++;
  }
  assert.ok(count>1200,`Unexpected small baseline ${count}`);
  assert.equal(data.items.length,230);
});
test('V9 does not change user controls, iframe APIs, museum catalog or layout logic',()=>{
  const app=read('dual/app.mjs');
  const html=read('dual/index.html');
  for(const s of ['enterR75','enterMuseum','moveToLobby','syncR75','openPoster','setCameraMode','renderCatalog','nearFrame','interaction()'])assert.ok(app.includes(s));
  for(const id of ['r75-frame','avatar-select','camera-mode','catalog-modal','poster-modal','guide-dialog'])assert.ok(html.includes(`id="${id}"`));
  assert.ok(!html.includes('type="file"'));
});
test('Both world buildings become two linked rings and real 3D over-under infinity',async()=>{
  const {world,restore}=await createWorld();try{
    const group=world.group;
    const lab=group.getObjectByName('MATHVERSE_R75_LAB_EXTERIOR');
    const museum=group.getObjectByName('CRYSTAL_INFINITY_MUSEUM_EXTERIOR');
    const ribbon=group.getObjectByName('TRUE_INFINITY_LEMNISCATE_OVER_UNDER_RIBBON');
    assert.ok(lab&&museum&&ribbon,'Two buildings and infinity ribbon must exist');
    assert.ok(lab.getObjectByName('INFINITY_ANNULAR_GLASS_ROOF'));
    assert.ok(museum.getObjectByName('INFINITY_ANNULAR_GLASS_ROOF'));
    assert.ok(group.getObjectByName('INFINITY_CROSSOVER_SHARED_GLASS_LINK'));
    assert.ok(group.getObjectByName('SHARED_MEGA_DOME_COVERS_TWO_BUILDINGS'));
    assert.equal(group.getObjectByName('SHARED_TRANSPARENT_GLASS_ROOF')!==undefined,true);
    assert.ok(museum.position.x>lab.position.x+60);
    const c=ribbon.geometry.parameters.path;
    const a=c.getPointAt(.25),b=c.getPointAt(.75);
    assert.ok(Math.abs(a.x-b.x)<5 && Math.abs(a.z-b.z)<5,'infinity does not intersect at center');
    assert.ok(Math.abs(a.y-b.y)>4,'not a real 3D over-under crossing');
    for(let g=6;g<=12;g++){
      assert.ok(lab.getObjectByName(`INFINITY_LAB_GRADE_${g}_SIGN`));
      assert.ok(museum.getObjectByName(`INFINITY_MUSEUM_GRADE_${g}_SIGN`));
    }
  }finally{restore();}
});
test('V8 entrance positions, teleport gates, guide NPC and 3D collision behavior are preserved',async()=>{
  const {world,mod,restore}=await createWorld();try{
    const {GRAND_DOME_LAYOUT:L}=mod;
    assert.deepEqual(L.playerSpawn,{x:0,z:33});
    assert.equal(world.getTarget(L.lab),'r75');
    assert.equal(world.getTarget(L.museum),'gallery');
    assert.equal(world.getTarget(L.guide),'guide');
    assert.equal(world.getTarget(L.playerSpawn),null);
    assert.equal(world.clickable.filter(o=>o.userData.grandTarget==='r75').length>=2,true);
    assert.equal(world.clickable.filter(o=>o.userData.grandTarget==='gallery').length>=2,true);
    assert.ok(world.group.getObjectByName('NPC_HUONG_DAN_R75_AVATAR'));
    assert.ok(world.group.getObjectByName('NPC_GREETING_AND_INFORMATION_DESK'));
    const entranceLab=world.group.getObjectByName('LAB_ENTRANCE_ARCH').getObjectByName('INFINITY_PORCH_RAYCAST_SURFACE');
    const entranceMuseum=world.group.getObjectByName('MUSEUM_CRYSTAL_FRONT_ENTRANCE').getObjectByName('INFINITY_PORCH_RAYCAST_SURFACE');
    const x=new THREE.Vector3(),y=new THREE.Vector3();entranceLab.getWorldPosition(x);entranceMuseum.getWorldPosition(y);
    assert.ok(Math.hypot(x.x-L.lab.x,x.z-L.lab.z)<1.6,'LAB portal does not meet original interaction anchor');
    assert.ok(Math.hypot(y.x-L.museum.x,y.z-L.museum.z)<1.6,'Museum portal does not meet original interaction anchor');
    assert.ok(mod.clampToGrandDome({x:-17,z:-46},{x:-17,z:-70}).z>-54);
    world.update(.02);
  }finally{restore();}
});
test('V9 graphic effects add museum depth above infographics without adding controls',()=>{
  const visuals=read('dual/crystal-architecture.mjs');
  const grand=read('dual/grand-dome.mjs');
  assert.ok(visuals.includes('addInfinityAtriumIllumination(g,group)'));
  assert.ok(visuals.includes('addInfinityGradeIllumination(g,room)'));
  assert.ok(grand.includes('INFINITY_ANNULAR_GLASS_ROOF'));
  assert.ok(grand.includes('PARALLAX_INFINITY_RIBBON_INNER'));
  assert.deepEqual(data.counts,{'6':43,'7':37,'8':39,'9':32,'10':27,'11':33,'12':19});
});
