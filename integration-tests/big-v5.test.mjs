import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {planRooms,posterDisplaySize,HUB_RADIUS,FAR_RADIUS,RETURN_PORTAL,CLASSIFICATION_PODIUM,gradeForPosition,entranceVisibilityAtSpawn} from '../dual/layout-plan.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const data=JSON.parse(read('museum-data/catalog.json'));
const loadURL=p=>pathToFileURL(path.join(ROOT,p)).href;
const patched=file=>read(file).replaceAll("'/vendor/three.module.js'",JSON.stringify(loadURL('vendor/three.module.js')));
const dataURL=text=>'data:text/javascript;base64,'+Buffer.from(text).toString('base64');
async function makeGallery(){
 const THREE=await import(loadURL('vendor/three.module.js'));
 const layout=loadURL('dual/layout-plan.mjs');
 const architecture=dataURL(patched('dual/crystal-architecture.mjs').replace("'./layout-plan.mjs'",JSON.stringify(layout)));
 const module=dataURL(patched('dual/gallery.mjs').replace("'./crystal-architecture.mjs'",JSON.stringify(architecture)).replace("'./layout-plan.mjs'",JSON.stringify(layout)));
 const {InfographicGallery}=await import(module);
 const old=THREE.TextureLoader.prototype.load;
 globalThis.document={createElement:()=>({width:1024,height:128,getContext:()=>({fillRect(){},strokeRect(){},fillText(){}})})};
 THREE.TextureLoader.prototype.load=function(_u,cb){const t=new THREE.Texture();if(cb)queueMicrotask(()=>cb(t));return t;};
 try{
  const scene=new THREE.Scene();const gallery=new InfographicGallery({scene,items:data.items,onSelect(){}});
  return {THREE,gallery,scene,dispose(){gallery.dispose();THREE.TextureLoader.prototype.load=old;delete globalThis.document;}};
 }catch(e){THREE.TextureLoader.prototype.load=old;delete globalThis.document;throw e;}
}
test('V7 large full-round atrium and seven independent fan-shaped galleries',()=>{
 const plan=planRooms(data.items);
 assert.ok(HUB_RADIUS>=38);assert.ok(FAR_RADIUS>=110);
 assert.deepEqual(plan.map(r=>r.lessons.length),[43,37,39,32,27,33,19]);
 assert.ok(plan.every(r=>r.length>70));
 assert.equal(entranceVisibilityAtSpawn().length,7);
 assert.ok(Math.max(...plan.map(p=>p.angleDeg))-Math.min(...plan.map(p=>p.angleDeg))>290);
 for(const p of plan){const pos={x:p.portal.x*1.03,z:p.portal.z*1.03};assert.equal(gradeForPosition(plan,pos),p.grade);}
});
test('V5 large image panels retain exact source aspect without crop or stretch',()=>{
 for(const it of data.items){const sz=posterDisplaySize(it.aspect);
  assert.ok(sz.h<=5.65&&sz.w<=4.75);assert.ok(Math.abs(sz.w/sz.h-it.aspect)<2e-5);
 }
});
test('V5 builds 230 real images, outward-facing double-sided display islands and two major 3D interaction nodes',async()=>{
 const v=await makeGallery();try{
  const {gallery,scene,THREE}=v;
  assert.equal(gallery.rooms.size,7);assert.equal(gallery.posters.length,230);
  assert.equal(gallery.group.getObjectByName('CENTRAL_ONE_CATALOG_TOUCHSCREEN')?.userData.catalogAll,true);
  assert.ok(gallery.classificationTargets.length>=3&&gallery.classificationTargets.length<=6,'single physical kiosk');
  assert.ok(gallery.returnTargets.length>=3);
  assert.ok(gallery.group.getObjectByName('RETURN_GATE_TO_MAIN_LOBBY'));
  assert.ok(gallery.group.getObjectByName('INFOGRAPHIC_CLASSIFICATION_PODIUM_6_TO_12'));
  for(const p of gallery.getPlan()){
    const room=gallery.rooms.get(p.grade);
    assert.ok(room.panels.length>=5,'needs spacious fan exhibits');
    for(const {panel} of room.panels)assert.ok(Math.abs(Math.sin(panel.rotation.y + p.theta - Math.PI/2))<1e-8,'panel wrong heading');
    const pics=gallery.posters.filter(item=>item.item.grade===p.grade&&item.slotKind==='panel');
    assert.ok(pics.length>3,'there are no front-facing double-sided panels');
    for(const pic of pics){
      const radial={x:Math.sin(p.theta),z:-Math.cos(p.theta)};
      assert.ok(Math.abs(pic.nx*radial.x+pic.nz*radial.z)<1e-8,'poster faces endwise instead of outward to aisle');
    }
  }
  assert.ok(gallery.nearReturn(RETURN_PORTAL));
  assert.ok(!gallery.nearReturn(CLASSIFICATION_PODIUM));
  assert.ok(gallery.nearClassification(CLASSIFICATION_PODIUM));
  const camera=new THREE.PerspectiveCamera(65,1,.1,300);
  camera.position.set(0,4,RETURN_PORTAL.z-11);camera.lookAt(0,4,RETURN_PORTAL.z+1);camera.updateMatrixWorld(true);scene.updateMatrixWorld(true);
  assert.equal(gallery.clickReturnPortalToLobby(new THREE.Vector2(0,0),camera),true,'return portal cannot be clicked');
  gallery.setAerialRoofVisibility(true);assert.ok(gallery.mat.glass.opacity<.1);
 }finally{v.dispose();}
});
test('V5 features: class catalog with search, native R75 avatar switching, camera modes, presentation and return gate',()=>{
 const html=read('dual/index.html'),app=read('dual/app.mjs');const css=read('dual/style.css');
 for(const id of ['camera-mode','avatar-next','present-mode','catalog-grade-tabs','catalog-grid','catalog-search','catalog-close','open-catalog','r75-exit','room-map-grid'])assert.ok(html.includes(`id="${id}"`),id);
 for(const text of ['setCameraMode','cycleAvatar','renderCatalog','setPresentation','clickReturnPortalToLobby','clickClassification','getViewModeName','setViewMode'])assert.ok((app+read('src/museum.js')).includes(text),text);
 assert.match(css,/museum-presenting/);
 assert.doesNotMatch(html,/<input\s+[^>]*type="file"/i);
 assert.doesNotMatch(html,/\sdownload(?:\s|=|>)/i);
});
