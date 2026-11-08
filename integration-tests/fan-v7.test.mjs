import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {GRADES,ANGLES_DEG,SECTOR_HALF,HUB_RADIUS,RETURN_PORTAL,CLASSIFICATION_PODIUM,
  planRooms,gradeForPosition,isWalkable,restrictPosition,roomWorld} from '../dual/layout-plan.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(fs.readFileSync(path.join(ROOT,'museum-data/catalog.json'),'utf8'));
const source=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const dataUrl=text=>'data:text/javascript;base64,'+Buffer.from(text).toString('base64');
const threeUrl=pathToFileURL(path.join(ROOT,'vendor/three.module.js')).href;
let fixtureMemo;
async function makeFixture(){
 const THREE=await import(threeUrl);
 const layoutUrl=pathToFileURL(path.join(ROOT,'dual/layout-plan.mjs')).href;
 const patched=file=>source(file).replaceAll("'/vendor/three.module.js'",JSON.stringify(threeUrl));
 const arch=dataUrl(patched('dual/crystal-architecture.mjs').replace("'./layout-plan.mjs'",JSON.stringify(layoutUrl)));
 const mod=dataUrl(patched('dual/gallery.mjs').replace("'./crystal-architecture.mjs'",JSON.stringify(arch)).replace("'./layout-plan.mjs'",JSON.stringify(layoutUrl)));
 const {InfographicGallery}=await import(mod);
 const oldLoad=THREE.TextureLoader.prototype.load,oldDocument=globalThis.document;
 const loaded=[];
 globalThis.document={createElement:()=>({width:1024,height:128,getContext:()=>({fillRect(){},strokeRect(){},fillText(){}})})};
 THREE.TextureLoader.prototype.load=function(url,callback){loaded.push(url);const t=new THREE.Texture();queueMicrotask(()=>callback?.(t));return t;};
 const scene=new THREE.Scene(),gallery=new InfographicGallery({scene,items:data.items,onSelect(){}});
 scene.updateMatrixWorld(true);
 return {THREE,scene,gallery,loaded,async settle(){for(let i=0;i<70;i++)await Promise.resolve();},dispose(){gallery.dispose();THREE.TextureLoader.prototype.load=oldLoad;globalThis.document=oldDocument;}};
}
test('V7 rooms cover more than 300 degrees of a whole ring, with a separate return-gate gap',()=>{
 assert.equal(GRADES.length,7);
 const degrees=7*2*SECTOR_HALF*180/Math.PI;
 assert.ok(degrees>=310&&degrees<=325,degrees);
 assert.equal(ANGLES_DEG.length,7);
 assert.equal(new Set(ANGLES_DEG).size,7);
 const rooms=planRooms(data.items);
 for(const p of rooms)assert.equal(gradeForPosition(rooms,roomWorld(p.theta,HUB_RADIUS+4)),p.grade);
 assert.equal(gradeForPosition(rooms,RETURN_PORTAL),null);
 assert.equal(gradeForPosition(rooms,CLASSIFICATION_PODIUM),null);
});
test('All 230 original-derived WEBP thumbnails exist; no runtime upload feature',()=>{
 for(const item of data.items){
  const thumb=item.src.replace('/museum-assets/','/museum-thumbs/');
  const data=fs.readFileSync(path.join(ROOT,thumb.slice(1)));
  assert.equal(data.toString('ascii',0,4),'RIFF',thumb);
  assert.equal(data.toString('ascii',8,12),'WEBP',thumb);
 }
 assert.doesNotMatch(source('dual/index.html'),/<input\s+[^>]*type="file"/i);
});
test('A SINGLE catalog plinth and seven unblocked grade doors are present',async()=>{
 const f=await makeFixture();try{
  assert.equal(f.gallery.classificationTargets.filter(m=>m.userData.catalogAll).length,4);
  assert.equal(f.gallery.group.getObjectsByProperty('name','CENTRAL_ONE_CATALOG_TOUCHSCREEN').length,1);
  assert.equal(f.gallery.posters.length,230);
  assert.equal(f.gallery.rooms.size,7);
  assert.equal(f.gallery.returnTargets.length,4);
  for(const grade of GRADES){
    assert.ok(f.gallery.group.getObjectByName(`CRYSTAL_PORTAL_GRADE_${grade}`));
    assert.ok(f.gallery.rooms.get(grade).posters.length>0);
  }
 }finally{f.dispose();}
});
test('Every infographic has a collision-safe visitor spot facing its FRONT, not a wall',async()=>{
 const f=await makeFixture();try{
  const bad=[];
  const {gallery,THREE}=f;
  for(const p of gallery.posters){
    const v=gallery.getViewingSpot(p),isSafe=isWalkable(gallery.plan,v,.6);
    const isOwn=gradeForPosition(gallery.plan,v)===p.item.grade;
    if(!isSafe||!isOwn){bad.push({grade:p.item.grade,number:p.item.number,kind:p.slotKind,reason:'not walkable / wrong sector',v});continue;}
    const from=new THREE.Vector3(v.x,4.1,v.z);
    const target=new THREE.Vector3(p.x+p.nx*.37,4.1,p.z+p.nz*.37);
    const delta=target.clone().sub(from),distance=delta.length();
    const ray=new THREE.Raycaster(from,delta.normalize(),0,distance);
    const blocker=ray.intersectObjects(gallery.solid,false)[0];
    if(blocker && blocker.distance<distance-.22)bad.push({grade:p.item.grade,number:p.item.number,kind:p.slotKind,reason:'occluded',dist:blocker.distance,total:distance});
  }
  assert.deepEqual(bad.slice(0,15),[],`${bad.length} unreachable or hidden frames: ${JSON.stringify(bad.slice(0,10))}`);
 }finally{f.dispose();}
});
test('Walking across each door works and side/rear room walls stop students',()=>{
 const plan=planRooms(data.items),hub={x:0,z:24};
 assert.ok(isWalkable(plan,hub));
 assert.equal(isWalkable(plan,CLASSIFICATION_PODIUM),false);
 for(const room of plan){
  let p=roomWorld(room.theta,HUB_RADIUS-2);
  for(const r of [HUB_RADIUS-.8,HUB_RADIUS+.1,HUB_RADIUS+1,HUB_RADIUS+5]){
    const q=roomWorld(room.theta,r);
    p=restrictPosition(plan,p,q);
    assert.ok(Math.hypot(q.x-p.x,q.z-p.z)<.1,`blocked entrance of grade ${room.grade} at ${r}`);
  }
  const atWall=roomWorld(room.theta+room.halfAngle+.1,HUB_RADIUS+11);
  const clamped=restrictPosition(plan,roomWorld(room.theta,HUB_RADIUS+11),atWall);
  assert.notDeepEqual(clamped,atWall,`side wall failed for ${room.grade}`);
 }
});

test('All 230 frames progressively receive a real infographic thumbnail texture, not a blank face',async()=>{
 const f=await makeFixture();try{
  for(let i=0;i<650&&f.gallery.posters.some(p=>!p.thumb);i++)await Promise.resolve();
  assert.equal(f.gallery.thumbnailFailures.length,0,`Failed URLs: ${f.gallery.thumbnailFailures.slice(0,3)}`);
  assert.equal(f.gallery.posters.filter(p=>p.thumb).length,230);
  assert.equal(f.gallery.posters.filter(p=>p.mat.map===p.thumb).length,230);
  assert.equal(f.gallery.thumbnailQueue.length,0);
  assert.equal(f.gallery.thumbnailActive,0);
 }finally{f.dispose();}
});
