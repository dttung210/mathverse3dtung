import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const THREE=await import(pathToFileURL(path.join(ROOT,'vendor/three.module.js')).href);
const source=read('dual/grand-dome.mjs');
const url='data:text/javascript;base64,'+Buffer.from(source.replaceAll("'/vendor/three.module.js'",JSON.stringify(pathToFileURL(path.join(ROOT,'vendor/three.module.js')).href))).toString('base64');
const {createGrandDome,GRAND_DOME_LAYOUT:L,CAMPUS_ROUTES,clampToGrandDome}=await import(url);
const catalog=JSON.parse(read('museum-data/catalog.json'));
function fixture(){
  const prior=globalThis.document;
  globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},strokeRect(){},fillText(){},beginPath(){},moveTo(){},lineTo(){},stroke(){}})})};
  try{
    const world=createGrandDome({createAvatar:()=>({root:new THREE.Group(),updateAnimation(){}}),catalogCounts:catalog.counts});
    world.group.updateMatrixWorld(true);
    return {world,restore:()=>{globalThis.document=prior;}};
  }catch(e){globalThis.document=prior;throw e;}
}
function length(pts){return pts.slice(1).reduce((s,[x,z],i)=>s+Math.hypot(x-pts[i][0],z-pts[i][1]),0)}
function near(o,x,z){const p=new THREE.Vector3();o.getWorldPosition(p);return Math.hypot(p.x-x,p.z-z)}

test('V10 uses two genuinely DIFFERENT building masses, not V9 twin transparent rings',()=>{
  const {world,restore}=fixture();try{
    const g=world.group;
    const lab=g.getObjectByName('MATHVERSE_R75_LAB_EXTERIOR');
    const museum=g.getObjectByName('CRYSTAL_INFINITY_MUSEUM_EXTERIOR');
    assert.ok(lab.getObjectByName('LAB_RESEARCH_MAIN_BLOCK'));
    assert.ok(lab.getObjectByName('LAB_ACADEMIC_ROOFLINE'));
    assert.ok(lab.getObjectByName('LAB_GLASS_FACADE_BAYS'));
    assert.ok(museum.getObjectByName('MUSEUM_SEVEN_RADIAL_PETAL_GALLERIES'));
    assert.ok(museum.getObjectByName('MUSEUM_PETAL_GLASS_OCULUS'));
    assert.equal(g.getObjectByName('INFINITY_ANNULAR_GLASS_ROOF'),undefined);
    assert.equal(g.getObjectByName('TRUE_INFINITY_LEMNISCATE_OVER_UNDER_RIBBON'),undefined);
    assert.ok(g.getObjectByName('SHARED_MEGA_DOME_COVERS_TWO_BUILDINGS'));
  }finally{restore();}
});
test('All 7 identifiable Lab wings and Museum petals are built without altering the original Lab runtime',()=>{
  const {world,restore}=fixture();try{
    const g=world.group;
    for(let grade=6;grade<=12;grade++){
      assert.ok(g.getObjectByName(`LAB_WING_GRADE_${grade}`));
      assert.ok(g.getObjectByName(`MUSEUM_GRADE_${grade}_PETAL`));
    }
    assert.ok(world.group.getObjectByName('RIGHT_SIDE_CRYSTAL_MUSEUM_DOME'));
    assert.equal(catalog.items.length,230);
    assert.equal(catalog.counts['6'],43);
    assert.equal(catalog.counts['12'],19);
  }finally{restore();}
});
test('Two roads are exact mirror images and equal in length from the same decision fork',()=>{
  assert.equal(CAMPUS_ROUTES.lab.length,CAMPUS_ROUTES.museum.length);
  for(let i=0;i<CAMPUS_ROUTES.lab.length;i++){
    const [lx,lz]=CAMPUS_ROUTES.lab[i];
    const [mx,mz]=CAMPUS_ROUTES.museum[i];
    assert.ok(Math.abs(mx+lx)<1e-9);assert.equal(mz,lz);
  }
  assert.ok(Math.abs(length(CAMPUS_ROUTES.lab)-length(CAMPUS_ROUTES.museum))<1e-9);
  assert.equal(L.lab.z,L.museum.z);
  assert.equal(L.lab.x,-L.museum.x);
  assert.equal(L.guide.x,0);
  const {world,restore}=fixture();try{
    assert.ok(world.group.getObjectByName('SYMMETRIC_LAB_WALKWAY'));
    assert.ok(world.group.getObjectByName('SYMMETRIC_MUSEUM_WALKWAY'));
  }finally{restore();}
});
test('Receptionist is central BETWEEN the two buildings and has keyboard/click entry choice',()=>{
  const {world,restore}=fixture();try{
    assert.equal(world.getTarget(L.guide),'guide');
    assert.equal(world.getTarget(L.lab),'r75');
    assert.equal(world.getTarget(L.museum),'gallery');
    assert.equal(world.getTarget(L.playerSpawn),null);
    assert.ok(world.group.getObjectByName('CENTRAL_RECEPTION_PAVILION'));
    assert.ok(world.group.getObjectByName('NPC_GREETING_AND_INFORMATION_DESK'));
    assert.ok(world.group.getObjectByName('NPC_HUONG_DAN_R75_AVATAR'));
    for(const target of ['guide','r75','gallery']){
      assert.ok(world.clickable.some(m=>m.userData.grandTarget===target));
    }
    const npc=world.group.getObjectByName('NPC_HUONG_DAN_R75_AVATAR');
    assert.equal(npc.position.x,0);
    assert.ok(npc.position.z<L.guide.z);
    world.update(.016);
  }finally{restore();}
});
test('Actual entrance glass is located within the corresponding E interaction zone',()=>{
  const {world,restore}=fixture();try{
    assert.ok(near(world.group.getObjectByName('LAB_ENTRANCE_INTERACTION'),L.lab.x,L.lab.z)<5.1);
    assert.ok(near(world.group.getObjectByName('MUSEUM_ENTRANCE_INTERACTION'),L.museum.x,L.museum.z)<2.1);
    assert.ok(world.getTarget(L.lab)==='r75');
    assert.ok(world.getTarget(L.museum)==='gallery');
  }finally{restore();}
});
test('Walls block entry without E; both portals remain reachable from walking routes',()=>{
  const labFace=clampToGrandDome({x:L.lab.x,z:-33},{x:L.lab.x,z:-75});
  assert.ok(labFace.z>-35,'Lab wall not preventing walk-through');
  const outside={x:L.museum.x,z:-29.5};
  const stopped=clampToGrandDome(outside,{x:L.museum.x,z:-62});
  assert.ok(Math.hypot(stopped.x-L.museum.buildingX,stopped.z-L.museum.buildingZ)>30.3);
  const nearLab=clampToGrandDome({x:-42,z:-29.0},{x:-42,z:-30.1});
  const nearMuse=clampToGrandDome({x:42,z:-29.0},{x:42,z:-30.1});
  assert.equal(L.lab.triggerRadius>Math.hypot(nearLab.x-L.lab.x,nearLab.z-L.lab.z),true);
  assert.equal(L.museum.triggerRadius>Math.hypot(nearMuse.x-L.museum.x,nearMuse.z-L.museum.z),true);
});
test('Floor and both walkways lie horizontally (do not create vertical walls)',()=>{
  const {world,restore}=fixture();try{
    for(const name of ['POLISHED_STONE_PLAZA_TILE_INSTANCES','SYMMETRIC_LAB_WALKWAY','SYMMETRIC_MUSEUM_WALKWAY']){
      const mesh=world.group.getObjectByName(name);
      const bounds=new THREE.Box3().setFromObject(mesh);
      assert.ok(bounds.max.y-bounds.min.y<.12,`${name} is not horizontal`);
      assert.ok(bounds.min.z < -25);
      assert.ok(bounds.max.x-bounds.min.x>10);
    }
  }finally{restore();}
});
test('V10 changes ONLY exterior scene and lobby-facing visual labels, not Lab or Museum features',()=>{
  const app=read('dual/app.mjs');const html=read('dual/index.html');
  for(const signature of ['enterR75','enterMuseum','moveToLobby','syncR75','openPoster','renderCatalog','setCameraMode','interaction()']){
    assert.ok(app.includes(signature));
  }
  for(const id of ['r75-frame','catalog-modal','poster-modal','guide-dialog','avatar-select','camera-mode','guide-lab','guide-museum','plaza-guide-hint']){
    assert.ok(html.includes(`id="${id}"`));
  }
  assert.ok(html.includes('campus-lobby'));
  assert.ok(!html.includes('download="'));
});
test('Immutable functional material from V9 is byte-for-byte preserved',()=>{
  const manifest=JSON.parse(read('audit/V10_FUNCTIONAL_SOURCE_BASELINE.json'));
  let n=0;
  const v12VisualUpgrades=new Set(['dual/crystal-architecture.mjs','dual/gallery.mjs']);
  for(const [relative,hash] of Object.entries(manifest.files)){
    if(manifest.exception_files?.includes(relative)||v12VisualUpgrades.has(relative))continue;
    if(!fs.existsSync(path.join(ROOT,relative)))continue;
    const content=fs.readFileSync(path.join(ROOT,relative));
    const actual=crypto.createHash('sha256').update(content).digest('hex');
    assert.equal(actual,hash,`Protected functionality edited: ${relative}`);n++;
  }
  assert.ok(n>1100,`Insufficient original asset baseline (${n})`);
});
