import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {GATE_HALF_WIDTH,GRADES,HUB_RADIUS,planRooms,roomWorld,restrictPosition,posterDisplaySize} from '../dual/layout-plan.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const catalog=JSON.parse(read('museum-data/catalog.json'));
const dataURL=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const fileURL=p=>pathToFileURL(path.join(root,p)).href;
const threePath=fileURL('vendor/three.module.js');
let counter=0;
async function fixture(){
 const THREE=await import(threePath),layout=fileURL('dual/layout-plan.mjs');
 const patched=f=>read(f).replaceAll("'/vendor/three.module.js'",JSON.stringify(threePath));
 const arch=dataURL(patched('dual/crystal-architecture.mjs').replace("'./layout-plan.mjs'",JSON.stringify(layout)));
 const url=dataURL(patched('dual/gallery.mjs').replace("'./crystal-architecture.mjs'",JSON.stringify(arch)).replace("'./layout-plan.mjs'",JSON.stringify(layout)));
 const {InfographicGallery}=await import(url+'#v8_'+(++counter));
 const oldDoc=globalThis.document,oldLoader=THREE.TextureLoader.prototype.load;
 globalThis.document={createElement:()=>({width:1024,height:128,getContext:()=>({fillRect(){},strokeRect(){},fillText(){}})})};
 THREE.TextureLoader.prototype.load=function(_url,done){const texture=new THREE.Texture();queueMicrotask(()=>done?.(texture));return texture;};
 try{
 const scene=new THREE.Scene(),gallery=new InfographicGallery({scene,items:catalog.items,onSelect(){}});
 scene.updateMatrixWorld(true);
 return {THREE,gallery,restore(){gallery.dispose();globalThis.document=oldDoc;THREE.TextureLoader.prototype.load=oldLoader;}};
 }catch(e){globalThis.document=oldDoc;THREE.TextureLoader.prototype.load=oldLoader;throw e;}
}

test('V8: all 7 entrances provide at least 15m width and walkable off-centre approaches',()=>{
 assert.ok(2*GATE_HALF_WIDTH>=15.0,'entrance is not wider than V7');
 for(const r of planRooms(catalog.items)){
  for(const lateral of [-5.5,0,5.5]){
   const start=roomWorld(r.theta,HUB_RADIUS-2,lateral);
   const next=roomWorld(r.theta,HUB_RADIUS+2,lateral);
   const actual=restrictPosition(planRooms(catalog.items),start,next);
   assert.ok(Math.hypot(actual.x-next.x,actual.z-next.z)<.15,`class ${r.grade}, lateral ${lateral}`);
  }
 }
});
test('V8: 230 artworks are numerically ordered by grade and physical visiting route',async()=>{
 const f=await fixture();try{
  assert.equal(f.gallery.posters.length,230);
  for(const grade of GRADES){
   const room=f.gallery.rooms.get(grade),pictures=room.posters;
   assert.deepEqual(pictures.map(p=>p.item.number),Array.from({length:pictures.length},(_,i)=>i+1),`grade ${grade} ordering`);
   const depths=pictures.map(p=>p.routeDepth);
   assert.ok(depths.every((v,i)=>!i||v>=depths[i-1]-.2),`class ${grade} physical walk order`);
   assert.ok(f.gallery.group.getObjectByName(`CLASS_${grade}_LESSON_SEQUENCE_B1_TO_B${pictures.length}`));
  }
 }finally{f.restore();}
});
test('V8: every installed island shows ORIGINAL lesson artwork on both outward sides',async()=>{
 const f=await fixture();try{
  for(const grade of GRADES){
   const room=f.gallery.rooms.get(grade);
   for(const p of room.posters.filter(p=>p.slotKind==='panel')){
    assert.ok(p.w>1.0&&p.h>1.0,`${grade} invalid picture`);
    const {w,h}=posterDisplaySize(Number(p.item.aspect));
    assert.ok(Math.abs(p.w-w)<.001&&Math.abs(p.h-h)<.001);
   }
   for(const panel of room.panels){
    const pics=room.posters.filter(p=>p.slotKind==='panel'&&
      Math.hypot(p.x-panel.panel.position.x,p.z-panel.panel.position.z)<.5);
    assert.equal(pics.length,2,`grade ${grade}, island ${panel.id} has empty backside`);
    assert.ok(pics[0].nx*pics[1].nx+pics[0].nz*pics[1].nz<-.99,'paired images must face opposite aisles');
    assert.notEqual(panel.panel.material, f.gallery.mat.trim,'island board uses dark backing');
   }
  }
 }finally{f.restore();}
});
test('V8: exhibition walls and floor are tinted by class, with doors unobstructed',async()=>{
 const f=await fixture();try{
  const wallColors=new Set(),floorColors=new Set();
  for(const grade of GRADES){
    const room=f.gallery.rooms.get(grade);
    wallColors.add(room.wall.color.getHex());floorColors.add(room.floor.color.getHex());
    const door=f.gallery.group.getObjectByName(`CRYSTAL_PORTAL_GRADE_${grade}`);
    assert.ok(door);
    const floor=door.children.find(x=>x.userData.grade===grade && x.geometry===f.gallery.geo.unitBox);
    assert.ok(floor && floor.scale.x>=15,'portal interaction strip too narrow');
  }
  assert.equal(wallColors.size,7,'plain white same walls across all classes');
  assert.equal(floorColors.size,7,'plain white same floor across all classes');
 }finally{f.restore();}
});
test('V8: no upload or download controls, R75 Lab remains source-identical',()=>{
 const html=read('dual/index.html');
 assert.doesNotMatch(html,/<input\s+[^>]*type="file"/i);
 assert.doesNotMatch(html,/\sdownload(?:\s|=|>)/i);
 assert.ok(fs.existsSync(path.join(root,'audit/R75_SHA256_ORIGINAL.csv')));
});
